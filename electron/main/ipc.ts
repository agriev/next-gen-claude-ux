import { ipcMain, BrowserWindow } from 'electron';
import { nanoid } from 'nanoid';
import { IPC } from '../../shared/ipc-channels';
import type {
  SubmitUtterancePayload, CancelActionPayload, MoveArtifactPayload, PinArtifactPayload,
  CreateEdgePayload, DeleteArtifactPayload, UpdateCameraFocusPayload,
  UpdateArtifactBodyPayload, RenameArtifactPayload, SetArtifactTagsPayload,
  RefineArtifactPayload, CreateHighlightPayload, CreateAttachmentArtifactPayload,
  CreateBoardPayload, SwitchBoardPayload, RenameBoardPayload, MoveArtifactToBoardPayload,
  SaveBookmarkPayload, SearchQueryPayload, SearchResult
} from '../../shared/ipc-channels';
import type { WorldEvent, WorldDeltaBatch } from '../../shared/events';
import type { Artifact, Edge, EdgeKind, Bookmark, Attachment, ArtifactKind } from '../../shared/types';
import Fuse from 'fuse.js';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { app } from 'electron';
import type { WorldState } from './world-state';
import type { Orchestrator } from './orchestrator';
import { bus } from './event-bus';

export const DEBUG_CREATE_MOCK = 'cmd:debug-create-mock';

import { MARKETING_ARTIFACTS, MARKETING_EDGES } from '../../shared/seed-marketing';

export async function seedMarketingBoard(world: WorldState): Promise<void> {
  for (const item of MARKETING_ARTIFACTS) {
    const id = nanoid(10);
    const now = Date.now();
    const artifact: Artifact = {
      id,
      boardId: world.getActiveBoardId(),
      kind: item.kind,
      mime: item.mime,
      title: item.title,
      shortName: world.uniqueShortName(item.shortName),
      body: item.body,
      createdAt: now,
      updatedAt: now,
      createdBy: 'seed',
      state: 'ready',
      tags: item.tags,
      position: item.position,
      spec: item.spec
    };
    await world.upsertArtifact(artifact);
    bus.emit('world', { type: 'artifact.upserted', artifact });
  }
  for (const [src, dst, kind] of MARKETING_EDGES) {
    const s = world.resolveShortName(src);
    const d = world.resolveShortName(dst);
    if (!s || !d) continue;
    const edge: Edge = {
      id: nanoid(10),
      src: s.id,
      dst: d.id,
      kind,
      weight: 1,
      createdBy: 'user'
    };
    await world.upsertEdge(edge);
    bus.emit('world', { type: 'edge.upserted', edge });
  }
  console.log(`[seed] marketing board: ${MARKETING_ARTIFACTS.length} artifacts, ${MARKETING_EDGES.length} edges`);
}

function mimeToExt(mime: string, filename: string): string {
  const fromName = path.extname(filename);
  if (fromName) return fromName;
  if (mime.startsWith('image/png')) return '.png';
  if (mime.startsWith('image/jpeg')) return '.jpg';
  if (mime.startsWith('image/gif')) return '.gif';
  if (mime.startsWith('image/webp')) return '.webp';
  if (mime.startsWith('image/')) return '.bin';
  if (mime === 'application/pdf') return '.pdf';
  if (mime.startsWith('text/')) return '.txt';
  return '.bin';
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export async function seedDemoEdges(world: WorldState, pairs: Array<[string, string, EdgeKind]>): Promise<void> {
  for (const [srcShort, dstShort, kind] of pairs) {
    const src = world.resolveShortName(srcShort);
    const dst = world.resolveShortName(dstShort);
    if (!src || !dst) continue;
    const edge: Edge = {
      id: nanoid(10),
      src: src.id,
      dst: dst.id,
      kind,
      weight: 1,
      createdBy: 'user'
    };
    await world.upsertEdge(edge);
    bus.emit('world', { type: 'edge.upserted', edge });
  }
}

export async function createMockArtifact(
  world: WorldState,
  opts?: { kind?: Artifact['kind']; title?: string; position?: { x: number; y: number; z: number } }
): Promise<Artifact> {
  const kind = opts?.kind ?? 'doc';
  const titles = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
  const baseName = opts?.title ?? titles[Math.floor(Math.random() * titles.length)];
  const shortName = world.uniqueShortName(baseName);
  const artifact: Artifact = {
    id: nanoid(10),
    boardId: world.getActiveBoardId(),
    kind,
    mime: kind === 'code' ? 'text/x-typescript' : 'text/markdown',
    title: shortName,
    shortName,
    body: kind === 'code'
      ? `// ${shortName}\nfunction hello() {\n  return 'world';\n}`
      : `# ${shortName}\n\nMock artifact for verification.`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: 'debug',
    state: 'ready',
    tags: [],
    position: opts?.position ?? {
      x: (Math.random() - 0.5) * 10,
      y: Math.random() * 4 - 1,
      z: (Math.random() - 0.5) * 6
    }
  };
  await world.upsertArtifact(artifact);
  bus.emit('world', { type: 'artifact.upserted', artifact });
  return artifact;
}

export function registerIpc(
  world: WorldState,
  orchestrator: Orchestrator,
  getMainWindow: () => BrowserWindow | null
): void {
  ipcMain.handle(IPC.query.snapshot, () => world.snapshot(
    orchestrator.undoLog.counts().undo,
    orchestrator.undoLog.counts().redo,
    orchestrator.layoutHistoryCount()
  ));

  ipcMain.handle(IPC.cmd.submitUtterance, async (_e, payload: SubmitUtterancePayload) => {
    return orchestrator.ingestKeyboardUtterance(payload.text, payload.references);
  });

  ipcMain.handle(IPC.cmd.cancelAction, async (_e, payload: CancelActionPayload) => {
    orchestrator.cancel(payload.actionId);
  });

  ipcMain.handle(IPC.cmd.cancelAll, async () => {
    orchestrator.cancelAll();
  });

  ipcMain.handle(IPC.cmd.moveArtifact, async (_e, payload: MoveArtifactPayload) => {
    const before = world.getArtifact(payload.id);
    if (!before) return;
    await world.setArtifactPosition(payload.id, payload.position, true);
    const updated = world.getArtifact(payload.id);
    if (updated) {
      bus.emit('world', { type: 'artifact.upserted', artifact: updated });
      orchestrator.undoLog.push({ kind: 'artifact-update', before, after: updated });
    }
  });

  ipcMain.handle(IPC.cmd.pinArtifact, async (_e, payload: PinArtifactPayload) => {
    const a = world.getArtifact(payload.id);
    if (!a) return;
    const updated: Artifact = { ...a, pinned: true, updatedAt: Date.now() };
    await world.upsertArtifact(updated);
    bus.emit('world', { type: 'artifact.upserted', artifact: updated });
  });

  ipcMain.handle(IPC.cmd.unpinArtifact, async (_e, payload: PinArtifactPayload) => {
    const a = world.getArtifact(payload.id);
    if (!a) return;
    const updated: Artifact = { ...a, pinned: false, updatedAt: Date.now() };
    await world.upsertArtifact(updated);
    bus.emit('world', { type: 'artifact.upserted', artifact: updated });
  });

  ipcMain.handle(IPC.cmd.createEdge, async (_e, payload: CreateEdgePayload) => {
    if (payload.src === payload.dst) return;
    const src = world.getArtifact(payload.src);
    const dst = world.getArtifact(payload.dst);
    if (!src || !dst) return;
    const edge: Edge = {
      id: nanoid(10),
      src: payload.src,
      dst: payload.dst,
      kind: payload.kind,
      weight: 1,
      createdBy: 'user'
    };
    await world.upsertEdge(edge);
    bus.emit('world', { type: 'edge.upserted', edge });
    orchestrator.undoLog.push({ kind: 'edge-create', before: null, after: edge });
  });

  ipcMain.handle(IPC.cmd.deleteArtifact, async (_e, payload: DeleteArtifactPayload) => {
    const before = world.getArtifact(payload.id);
    if (!before) return;
    await world.removeArtifact(payload.id);
    bus.emit('world', { type: 'artifact.removed', id: payload.id });
    orchestrator.undoLog.push({ kind: 'artifact-delete', before, after: null });
  });

  ipcMain.handle(IPC.cmd.updateCameraFocus, async (_e, payload: UpdateCameraFocusPayload) => {
    orchestrator.setCameraFocus(payload.target, payload.eye);
  });

  // --- editing ---

  ipcMain.handle(IPC.cmd.updateArtifactBody, async (_e, payload: UpdateArtifactBodyPayload) => {
    const before = world.getArtifact(payload.id);
    if (!before) return;
    const updated: Artifact = { ...before, body: payload.body, updatedAt: Date.now() };
    await world.upsertArtifact(updated);
    bus.emit('world', { type: 'artifact.upserted', artifact: updated });
    orchestrator.undoLog.push({ kind: 'artifact-update', before, after: updated });
  });

  ipcMain.handle(IPC.cmd.renameArtifact, async (_e, payload: RenameArtifactPayload) => {
    const a = world.getArtifact(payload.id);
    if (!a) return;
    let shortName = a.shortName;
    if (payload.shortName && payload.shortName !== a.shortName) {
      shortName = world.uniqueShortName(payload.shortName);
    }
    const updated: Artifact = {
      ...a,
      shortName,
      title: payload.title ?? a.title,
      updatedAt: Date.now()
    };
    await world.upsertArtifact(updated);
    bus.emit('world', { type: 'artifact.upserted', artifact: updated });
  });

  ipcMain.handle(IPC.cmd.setArtifactTags, async (_e, payload: SetArtifactTagsPayload) => {
    const a = world.getArtifact(payload.id);
    if (!a) return;
    const updated: Artifact = { ...a, tags: payload.tags, updatedAt: Date.now() };
    await world.upsertArtifact(updated);
    bus.emit('world', { type: 'artifact.upserted', artifact: updated });
  });

  ipcMain.handle(IPC.cmd.refineArtifact, async (_e, payload: RefineArtifactPayload) => {
    const a = world.getArtifact(payload.id);
    if (!a) return { error: 'no artifact' };
    return orchestrator.submit({
      text: `Refine artifact @${a.shortName}: ${payload.prompt}`,
      references: [a.shortName],
      kind: 'edit'
    });
  });

  ipcMain.handle(IPC.cmd.createAttachmentArtifact, async (_e, payload: CreateAttachmentArtifactPayload) => {
    const buf = Buffer.from(payload.dataBase64, 'base64');
    const sha = crypto.createHash('sha256').update(buf).digest('hex');
    const ext = mimeToExt(payload.mime, payload.filename);
    const attDir = path.join(app.getPath('userData'), 'attachments');
    fs.mkdirSync(attDir, { recursive: true });
    const id = nanoid(10);
    const filePath = path.join(attDir, `${id}${ext}`);
    fs.writeFileSync(filePath, buf);

    const kind: ArtifactKind = payload.mime.startsWith('image/') ? 'image' : 'doc';
    const baseName = (payload.title ?? payload.filename.split('.')[0] ?? 'Attachment').slice(0, 24);
    const shortName = world.uniqueShortName(baseName);
    const artifactId = nanoid(10);
    const now = Date.now();
    const artifact: Artifact = {
      id: artifactId,
      boardId: world.getActiveBoardId(),
      kind,
      mime: payload.mime,
      title: payload.title ?? payload.filename,
      shortName,
      body: payload.mime.startsWith('image/')
        ? `![${payload.filename}](file://${filePath})`
        : `Attached file: ${payload.filename} (${formatBytes(buf.length)})`,
      bodyPath: filePath,
      createdAt: now,
      updatedAt: now,
      createdBy: 'user',
      state: 'ready',
      tags: ['attachment', payload.mime.startsWith('image/') ? 'image' : 'file'],
      attachmentId: id,
      position: orchestrator.suggestSpawnPosition()
    };
    const attachment: Attachment = {
      id,
      artifactId,
      path: filePath,
      mime: payload.mime,
      size: buf.length,
      sha256: sha,
      createdAt: now
    };
    world.getRepo().insertAttachment(attachment);
    await world.upsertArtifact(artifact);
    bus.emit('world', { type: 'artifact.upserted', artifact });
    return artifact;
  });

  ipcMain.handle(IPC.cmd.createHighlight, async (_e, payload: CreateHighlightPayload) => {
    const parent = world.getArtifact(payload.parentId);
    if (!parent) return;
    const baseName = (payload.title ?? payload.text.split(/\s+/)[0] ?? 'Highlight').slice(0, 24);
    const shortName = world.uniqueShortName(baseName);
    const id = nanoid(10);
    const now = Date.now();
    const child: Artifact = {
      id,
      boardId: parent.boardId,
      kind: 'note',
      mime: 'text/markdown',
      title: payload.title ?? `Highlight from ${parent.shortName}`,
      shortName,
      body: payload.text,
      createdAt: now, updatedAt: now,
      createdBy: 'user',
      state: 'ready',
      tags: ['highlight'],
      parentArtifactId: parent.id,
      position: orchestrator.suggestSpawnPosition()
    };
    await world.upsertArtifact(child);
    bus.emit('world', { type: 'artifact.upserted', artifact: child });

    const edge: Edge = {
      id: nanoid(10),
      src: parent.id,
      dst: child.id,
      kind: 'derives',
      weight: 1,
      createdBy: 'user'
    };
    await world.upsertEdge(edge);
    bus.emit('world', { type: 'edge.upserted', edge });
    return child;
  });

  // --- boards ---

  ipcMain.handle(IPC.cmd.createBoard, async (_e, payload: CreateBoardPayload) => {
    const board = world.createBoard(payload.name, payload.template);
    bus.emit('world', { type: 'board.upserted', board });
    bus.emit('world', {
      type: 'toast', level: 'info',
      message: `Created board "${board.name}". Switch via top-left ▢ menu to go back.`
    });
    return board;
  });

  ipcMain.handle(IPC.cmd.switchBoard, async (_e, payload: SwitchBoardPayload) => {
    const ok = world.switchBoard(payload.id);
    if (!ok) return { ok };
    bus.emit('world', { type: 'board.switched', boardId: payload.id });
    // Broadcast all artifacts + edges of the new board so renderer rehydrates
    for (const a of world.getAllArtifacts()) {
      bus.emit('world', { type: 'artifact.upserted', artifact: a });
    }
    for (const e of world.getAllEdges()) {
      bus.emit('world', { type: 'edge.upserted', edge: e });
    }
    return { ok };
  });

  ipcMain.handle(IPC.cmd.renameBoard, async (_e, payload: RenameBoardPayload) => {
    world.renameBoard(payload.id, payload.name);
    const b = world.listBoards().find(x => x.id === payload.id);
    if (b) bus.emit('world', { type: 'board.upserted', board: b });
  });

  ipcMain.handle(IPC.cmd.deleteBoard, async (_e, payload: { id: string }) => {
    world.deleteBoard(payload.id);
  });

  ipcMain.handle(IPC.cmd.moveArtifactToBoard, async (_e, payload: MoveArtifactToBoardPayload) => {
    const a = world.getArtifact(payload.artifactId);
    if (!a) return;
    const updated: Artifact = { ...a, boardId: payload.toBoardId, updatedAt: Date.now() };
    await world.upsertArtifact(updated);
    bus.emit('world', { type: 'artifact.removed', id: a.id });
  });

  ipcMain.handle(IPC.query.listBoards, async () => world.listBoards());

  // --- bookmarks ---

  ipcMain.handle(IPC.cmd.saveBookmark, async (_e, payload: SaveBookmarkPayload) => {
    const id = nanoid(10);
    const bookmark: Bookmark = {
      id,
      boardId: world.getActiveBoardId(),
      slot: payload.slot,
      label: payload.label ?? `Slot ${payload.slot}`,
      target: payload.target,
      eye: payload.eye,
      createdAt: Date.now()
    };
    await world.upsertBookmark(bookmark);
    bus.emit('world', { type: 'bookmark.upserted', bookmark });
    return bookmark;
  });

  ipcMain.handle(IPC.cmd.deleteBookmark, async (_e, payload: { id: string }) => {
    await world.removeBookmark(payload.id);
    bus.emit('world', { type: 'bookmark.removed', id: payload.id });
  });

  // --- search ---

  ipcMain.handle(IPC.query.search, async (_e, payload: SearchQueryPayload) => {
    const all = world.getAllArtifacts();
    const fuse = new Fuse(all, {
      keys: [
        { name: 'title', weight: 3 },
        { name: 'shortName', weight: 3 },
        { name: 'spec.summary', weight: 2 },
        { name: 'tags', weight: 2 },
        { name: 'body', weight: 1 }
      ],
      includeScore: true,
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2
    });
    const hits = fuse.search(payload.query, { limit: payload.limit ?? 12 });
    const results: SearchResult[] = hits.map(h => ({
      artifactId: h.item.id,
      shortName: h.item.shortName,
      title: h.item.title,
      kind: h.item.kind,
      score: h.score ?? 1,
      matched: 'title'
    }));
    return results;
  });

  ipcMain.handle(IPC.query.artifactBody, async (_e, payload: { id: string }) => {
    const a = world.getArtifact(payload.id);
    return a ? a.body : '';
  });

  // --- notifications ---

  ipcMain.handle(IPC.cmd.markNotificationRead, async (_e, payload: { id: string }) => {
    await world.markNotificationRead(payload.id);
  });

  ipcMain.handle(IPC.cmd.clearNotifications, async () => {
    await world.clearNotifications();
  });

  // --- undo/redo ---

  ipcMain.handle(IPC.cmd.undo, async () => orchestrator.undo());
  ipcMain.handle(IPC.cmd.redo, async () => orchestrator.redo());

  // --- onboarding ---

  ipcMain.handle(IPC.cmd.setOnboardedFlag, async () => world.setOnboarded());
  ipcMain.handle(IPC.query.isOnboarded, async () => world.isOnboarded());

  ipcMain.handle(IPC.cmd.requestReorganize, async (_e, payload: { mode: string; prompt?: string }) => {
    await orchestrator.requestReorganize(payload.mode, payload.prompt);
    bus.emit('world', {
      type: 'toast',
      level: 'info',
      message: `Layout reorganize · ${payload.mode}${payload.prompt ? ` · "${payload.prompt.slice(0, 40)}"` : ''} — running…`
    });
    const notif = {
      id: nanoid(10),
      kind: 'system' as const,
      level: 'info' as const,
      title: `Layout pass started: ${payload.mode}`,
      body: payload.prompt,
      createdAt: Date.now()
    };
    void world.insertNotification(notif);
    bus.emit('world', { type: 'notification', notification: notif });
  });

  ipcMain.handle(IPC.cmd.restoreLayout, async () => {
    return orchestrator.restorePreviousLayout();
  });

  ipcMain.handle(IPC.cmd.setModel, async (_e, payload: { role: 'worker' | 'layout' | 'listening' | 'naming'; model: string }) => {
    await orchestrator.setModel(payload.role, payload.model);
    return { ok: true, settings: world.getModelSettings() };
  });

  ipcMain.handle(DEBUG_CREATE_MOCK, async (_e, opts?: { kind?: Artifact['kind']; title?: string }) => {
    return createMockArtifact(world, opts);
  });

  // Coalesced world delta dispatcher (16ms tick)
  let pending: WorldEvent[] = [];
  let scheduled = false;
  const flush = () => {
    scheduled = false;
    if (pending.length === 0) return;
    const batch: WorldDeltaBatch = { ts: Date.now(), events: pending };
    pending = [];
    const win = getMainWindow();
    win?.webContents.send(IPC.event.worldDelta, batch);
  };

  bus.on('world', (e: WorldEvent) => {
    pending.push(e);
    if (pending.length > 256) {
      pending = pending.filter(ev => ev.type !== 'transcript.chunk' || ev.chunk.isFinal);
    }
    if (!scheduled) {
      scheduled = true;
      setTimeout(flush, 16);
    }
  });

  bus.on('agentLog', e => {
    const win = getMainWindow();
    win?.webContents.send(IPC.event.agentLog, e);
  });
}
