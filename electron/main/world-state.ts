import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { nanoid } from 'nanoid';
import { runMigrations } from './db/migrations';
import { Repo } from './db/repo';
import type {
  Artifact, Edge, Action, Session, TranscriptChunk, WorldSnapshot, Vec3,
  Board, Bookmark, Notification, ModelSettings, LinkType, Panel, PendingLayoutPlan
} from '../../shared/types';
import { DEFAULT_MODELS } from '../../shared/types';

export class WorldState {
  private db!: Database.Database;
  private repo!: Repo;
  private session!: Session;
  private activeBoardId = 'default';

  private boards = new Map<string, Board>();
  private artifacts = new Map<string, Artifact>();
  private edges = new Map<string, Edge>();
  private panels = new Map<string, Panel>();
  private linkTypes = new Map<string, LinkType>();
  private actions = new Map<string, Action>();
  private bookmarks = new Map<string, Bookmark>();
  private shortNameIndex = new Map<string, string>();
  private modelSettings: ModelSettings = { ...DEFAULT_MODELS };
  /** B04 — pending layout plans awaiting commit / reject / timeout. */
  private pendingPlans = new Map<string, PendingLayoutPlan>();

  private writeMutex: Promise<void> = Promise.resolve();

  init(): void {
    const dataDir = app.getPath('userData');
    fs.mkdirSync(dataDir, { recursive: true });
    fs.mkdirSync(path.join(dataDir, 'attachments'), { recursive: true });
    fs.mkdirSync(path.join(dataDir, 'boards'), { recursive: true });

    const dbPath = path.join(dataDir, 'jarvis.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.db.pragma('synchronous = NORMAL');
    runMigrations(this.db);

    this.repo = new Repo(this.db);

    for (const b of this.repo.listBoards()) {
      this.boards.set(b.id, b);
    }

    const saved = this.repo.getAppState('active_board_id');
    if (saved && this.boards.has(saved)) {
      this.activeBoardId = saved;
    } else {
      this.activeBoardId = 'default';
    }

    const latest = this.repo.latestSession();
    if (latest) {
      this.session = latest;
    } else {
      this.session = {
        id: nanoid(12),
        title: 'untitled',
        startedAt: Date.now(),
        agentSessionIds: {}
      };
      this.repo.upsertSession(this.session);
    }

    this.loadLinkTypes();
    this.loadActiveBoard();
    this.loadModelSettings();
    console.log(`[world] session=${this.session.id} board=${this.activeBoardId} artifacts=${this.artifacts.size} edges=${this.edges.size} panels=${this.panels.size} linkTypes=${this.linkTypes.size}`);
  }

  private loadLinkTypes(): void {
    this.linkTypes.clear();
    for (const t of this.repo.listLinkTypes()) {
      this.linkTypes.set(t.id, t);
    }
  }

  private loadModelSettings(): void {
    (Object.keys(this.modelSettings) as Array<keyof ModelSettings>).forEach(role => {
      const stored = this.repo.getAppState(`model.${role}`);
      if (stored) this.modelSettings[role] = stored;
    });
  }

  getModelSettings(): ModelSettings { return { ...this.modelSettings }; }

  getModel(role: keyof ModelSettings): string { return this.modelSettings[role]; }

  setModel(role: keyof ModelSettings, model: string): void {
    this.modelSettings[role] = model;
    this.repo.setAppState(`model.${role}`, model);
  }

  private loadActiveBoard(): void {
    this.artifacts.clear();
    this.edges.clear();
    this.panels.clear();
    this.actions.clear();
    this.bookmarks.clear();
    this.shortNameIndex.clear();
    for (const a of this.repo.listArtifactsByBoard(this.activeBoardId)) {
      this.artifacts.set(a.id, a);
      this.shortNameIndex.set(a.shortName, a.id);
    }
    for (const e of this.repo.listEdgesByBoard(this.activeBoardId)) {
      this.edges.set(e.id, e);
    }
    for (const p of this.repo.listPanelsByBoard(this.activeBoardId)) {
      this.panels.set(p.id, p);
    }
    for (const a of this.repo.listActions(this.session.id)) {
      this.actions.set(a.id, a);
    }
    for (const b of this.repo.listBookmarks(this.activeBoardId)) {
      this.bookmarks.set(b.id, b);
    }
  }

  getSession(): Session { return this.session; }
  getActiveBoardId(): string { return this.activeBoardId; }
  getActiveBoard(): Board { return this.boards.get(this.activeBoardId)!; }
  listBoards(): Board[] { return [...this.boards.values()]; }

  switchBoard(boardId: string): boolean {
    if (!this.boards.has(boardId) || boardId === this.activeBoardId) return false;
    this.activeBoardId = boardId;
    this.repo.setAppState('active_board_id', boardId);
    const board = this.boards.get(boardId)!;
    const updated: Board = { ...board, lastActiveAt: Date.now() };
    this.boards.set(boardId, updated);
    this.repo.upsertBoard(updated);
    this.loadActiveBoard();
    return true;
  }

  createBoard(name: string, template?: Board['template']): Board {
    const board: Board = {
      id: nanoid(10),
      name: name || 'Untitled',
      template,
      startedAt: Date.now(),
      lastActiveAt: Date.now()
    };
    this.boards.set(board.id, board);
    this.repo.upsertBoard(board);
    return board;
  }

  renameBoard(id: string, name: string): void {
    const b = this.boards.get(id);
    if (!b) return;
    const updated: Board = { ...b, name };
    this.boards.set(id, updated);
    this.repo.upsertBoard(updated);
  }

  deleteBoard(id: string): boolean {
    if (id === 'default' || !this.boards.has(id)) return false;
    this.repo.deleteBoard(id);
    this.boards.delete(id);
    if (this.activeBoardId === id) {
      this.switchBoard('default');
    }
    return true;
  }

  isOnboarded(): boolean {
    return this.repo.getAppState('onboarded') === '1';
  }

  setOnboarded(): void {
    this.repo.setAppState('onboarded', '1');
  }

  snapshot(undoCount = 0, redoCount = 0, layoutHistoryCount = 0): WorldSnapshot {
    return {
      session: this.session,
      activeBoardId: this.activeBoardId,
      boards: [...this.boards.values()],
      artifacts: [...this.artifacts.values()],
      edges: [...this.edges.values()],
      panels: [...this.panels.values()],
      linkTypes: [...this.linkTypes.values()],
      pendingPlans: [...this.pendingPlans.values()],
      actions: [...this.actions.values()].sort((a, b) => b.startedAt - a.startedAt).slice(0, 200),
      bookmarks: [...this.bookmarks.values()],
      notifications: this.repo.listNotifications(50),
      undoCount,
      redoCount,
      layoutHistoryCount,
      modelSettings: this.getModelSettings()
    };
  }

  private serial<T>(fn: () => T | Promise<T>): Promise<T> {
    const next = this.writeMutex.then(fn);
    this.writeMutex = next.then(() => undefined, () => undefined);
    return next;
  }

  upsertArtifact(a: Artifact): Promise<void> {
    return this.serial(() => {
      const withBoard: Artifact = a.boardId ? a : { ...a, boardId: this.activeBoardId };
      const tagged: Artifact = withBoard.tags ? withBoard : { ...withBoard, tags: [] };
      const prev = this.artifacts.get(tagged.id);
      if (prev && prev.shortName !== tagged.shortName) this.shortNameIndex.delete(prev.shortName);
      // Only mirror to in-memory map if it belongs to current board (other boards persist DB-only)
      if (tagged.boardId === this.activeBoardId) {
        this.artifacts.set(tagged.id, tagged);
        this.shortNameIndex.set(tagged.shortName, tagged.id);
      } else {
        this.artifacts.delete(tagged.id);
      }
      this.repo.upsertArtifact(tagged, this.session.id);
    });
  }

  removeArtifact(id: string): Promise<void> {
    return this.serial(() => {
      const prev = this.artifacts.get(id);
      if (prev) this.shortNameIndex.delete(prev.shortName);
      this.artifacts.delete(id);
      for (const [eid, e] of this.edges) {
        if (e.src === id || e.dst === id) this.edges.delete(eid);
      }
      this.repo.removeArtifact(id);
    });
  }

  upsertEdge(e: Edge): Promise<void> {
    return this.serial(() => {
      this.edges.set(e.id, e);
      this.repo.upsertEdge(e, this.session.id, this.activeBoardId);
    });
  }

  removeEdge(id: string): Promise<void> {
    return this.serial(() => {
      this.edges.delete(id);
      this.repo.removeEdge(id);
    });
  }

  upsertAction(a: Action): Promise<void> {
    return this.serial(() => {
      this.actions.set(a.id, a);
      this.repo.upsertAction(a, this.session.id);
    });
  }

  insertTranscriptChunk(c: TranscriptChunk): Promise<void> {
    return this.serial(() => {
      this.repo.insertTranscriptChunk(c);
    });
  }

  setArtifactPosition(id: string, position: Vec3, pinned: boolean): Promise<void> {
    return this.serial(() => {
      const a = this.artifacts.get(id);
      if (!a) return;
      const updated: Artifact = { ...a, position, pinned, updatedAt: Date.now() };
      this.artifacts.set(id, updated);
      this.repo.upsertArtifact(updated, this.session.id);
    });
  }

  // ---------- bookmarks ----------

  upsertBookmark(b: Bookmark): Promise<void> {
    return this.serial(() => {
      this.bookmarks.set(b.id, b);
      this.repo.upsertBookmark(b);
    });
  }

  removeBookmark(id: string): Promise<void> {
    return this.serial(() => {
      this.bookmarks.delete(id);
      this.repo.removeBookmark(id);
    });
  }

  getBookmark(slot: number): Bookmark | undefined {
    for (const b of this.bookmarks.values()) {
      if (b.slot === slot && b.boardId === this.activeBoardId) return b;
    }
    return undefined;
  }

  // ---------- notifications ----------

  insertNotification(n: Notification): Promise<void> {
    return this.serial(() => {
      this.repo.insertNotification(n);
    });
  }

  markNotificationRead(id: string): Promise<void> {
    return this.serial(() => {
      this.repo.markNotificationRead(id);
    });
  }

  clearNotifications(): Promise<void> {
    return this.serial(() => {
      this.repo.clearNotifications();
    });
  }

  // ---------- shortName resolution ----------

  resolveShortName(name: string): Artifact | undefined {
    const id = this.shortNameIndex.get(name);
    return id ? this.artifacts.get(id) : undefined;
  }

  uniqueShortName(base: string): string {
    const cleaned = (base || 'Artifact').replace(/[^\w-]/g, '') || 'Artifact';
    if (!this.shortNameIndex.has(cleaned)) return cleaned;
    for (let i = 2; i < 1000; i++) {
      const candidate = `${cleaned}-${i}`;
      if (!this.shortNameIndex.has(candidate)) return candidate;
    }
    return `${cleaned}-${nanoid(4)}`;
  }

  getArtifact(id: string): Artifact | undefined { return this.artifacts.get(id); }
  getAllArtifacts(): Artifact[] { return [...this.artifacts.values()]; }
  getEdge(id: string): Edge | undefined { return this.edges.get(id); }
  getAllEdges(): Edge[] { return [...this.edges.values()]; }
  getRepo(): Repo { return this.repo; }

  // ---------- link types ----------

  listLinkTypes(): LinkType[] { return [...this.linkTypes.values()]; }
  getLinkType(id: string): LinkType | undefined { return this.linkTypes.get(id); }
  hasLinkType(id: string): boolean { return this.linkTypes.has(id); }

  registerLinkType(t: LinkType): Promise<void> {
    return this.serial(() => {
      this.linkTypes.set(t.id, t);
      this.repo.upsertLinkType(t);
    });
  }

  updateLinkType(id: string, patch: Partial<Pick<LinkType, 'label' | 'color' | 'icon' | 'isDirected'>>): Promise<LinkType | null> {
    return this.serial(() => {
      const existing = this.linkTypes.get(id);
      if (!existing) return null;
      const updated: LinkType = {
        ...existing,
        ...('label' in patch && patch.label !== undefined ? { label: patch.label } : {}),
        ...('color' in patch && patch.color !== undefined ? { color: patch.color } : {}),
        ...('icon' in patch ? { icon: patch.icon } : {}),
        ...('isDirected' in patch && patch.isDirected !== undefined ? { isDirected: patch.isDirected } : {})
      };
      this.linkTypes.set(id, updated);
      this.repo.upsertLinkType(updated);
      return updated;
    });
  }

  deleteLinkType(id: string): Promise<boolean> {
    return this.serial(() => {
      const ok = this.repo.deleteLinkType(id);
      if (ok) this.linkTypes.delete(id);
      return ok;
    });
  }

  // ---------- pending layout plans (B04 intent-ghost) ----------

  /** Returns the live snapshot of plans for renderer / IPC consumers. */
  listPendingPlans(): PendingLayoutPlan[] { return [...this.pendingPlans.values()]; }
  getPendingPlan(id: string): PendingLayoutPlan | undefined { return this.pendingPlans.get(id); }
  hasPendingPlan(id: string): boolean { return this.pendingPlans.has(id); }
  registerPendingPlan(plan: PendingLayoutPlan): void { this.pendingPlans.set(plan.id, plan); }
  removePendingPlan(id: string): PendingLayoutPlan | undefined {
    const plan = this.pendingPlans.get(id);
    this.pendingPlans.delete(id);
    return plan;
  }

  // ---------- panels ----------

  upsertPanel(p: Panel): Promise<void> {
    return this.serial(() => {
      const withBoard: Panel = p.boardId ? p : { ...p, boardId: this.activeBoardId };
      const withAnchor: Panel = withBoard.anchor ? withBoard : { ...withBoard, anchor: 'world' };
      if (withAnchor.boardId === this.activeBoardId) {
        this.panels.set(withAnchor.id, withAnchor);
      } else {
        this.panels.delete(withAnchor.id);
      }
      this.repo.upsertPanel(withAnchor, this.session.id);
    });
  }

  removePanel(id: string): Promise<void> {
    return this.serial(() => {
      this.panels.delete(id);
      this.repo.removePanel(id);
    });
  }

  getPanel(id: string): Panel | undefined { return this.panels.get(id); }
  getAllPanels(): Panel[] { return [...this.panels.values()]; }

  setPanelPosition(id: string, position: Vec3, pinned: boolean): Promise<void> {
    return this.serial(() => {
      const p = this.panels.get(id);
      if (!p) return;
      const updated: Panel = { ...p, position, pinned, updatedAt: Date.now() };
      this.panels.set(id, updated);
      this.repo.upsertPanel(updated, this.session.id);
    });
  }

  close(): void { this.db?.close(); }
}
