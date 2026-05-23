import { create } from 'zustand';
import type {
  Artifact, ArtifactKind, Edge, Action, Vec3, WorldSnapshot, ListeningStatus,
  ActionLogEntry, Board, Bookmark, Notification, ModelSettings, LinkType, Panel, AgentRole,
  PendingLayoutPlan
} from '@shared/types';
import { BUILTIN_LINK_TYPES, DEFAULT_MODELS } from '@shared/types';
import type { WorldEvent, AgentLogEvent } from '@shared/events';

/**
 * B09 — agent-aura flash data. Keyed per artifactId per agentRole so a single
 * artifact can simultaneously show worker+layout overlap (e.g. layout pulses
 * positioning a worker-just-created card). Renderer reads the max expiresAt
 * per role.
 */
export interface AuraFlash {
  agentRole: AgentRole;
  expiresAt: number;
}

/**
 * B12 — Worker spawn placeholder (the "thinking…" spinner that shows up
 * within ms of the user pressing Enter). Cleared when the action finishes.
 */
export interface WorkerSpinner {
  actionId: string;
  prompt: string;
  position: Vec3;
  startedAt: number;
}

/**
 * B14 — Tool-call trail. Each entry is a fading line from `from` to `to`
 * showing where an agent just mutated. Entries expire after ~2.5s and are
 * pruned on every tick.
 */
export interface ToolTrail {
  id: string;
  agentRole: AgentRole;
  toolName: string;
  from: Vec3;
  to: Vec3;
  startedAt: number;
  expiresAt: number;
}

export type CameraMode = 'orbit' | 'top-down';
/**
 * B16 — view mode. `canvas` is the existing free-form orbit mode for
 * exploration; `console` switches to a stationary multi-anchor view of
 * panels arranged in a horseshoe (B18 lands the layout algorithm).
 */
export type ViewMode = 'canvas' | 'console';

export interface FilterState {
  query: string;
  kinds: Set<ArtifactKind>;
  tags: Set<string>;
  pinnedOnly: boolean;
}

interface WorldStore {
  artifacts: Map<string, Artifact>;
  edges: Map<string, Edge>;
  panels: Map<string, Panel>;
  /** B09 — per-artifact aura flashes, mutable map updated on every aura.flash event. */
  auraFlashes: Map<string, AuraFlash[]>;
  /** B12 — active Worker spinners. */
  workerSpinners: Map<string, WorkerSpinner>;
  /** B14 — active tool-call trails (pruned on tick). */
  toolTrails: ToolTrail[];
  /** B04 — pending layout plans (intent-ghosts). */
  pendingPlans: Map<string, PendingLayoutPlan>;
  /**
   * Link-type registry, populated from WorldSnapshot. Falls back to the
   * built-ins so renderers never crash if a snapshot arrives without the
   * field (e.g. older event-only updates between snapshots).
   */
  linkTypes: LinkType[];
  actions: Map<string, Action>;
  actionLogs: Map<string, ActionLogEntry[]>;
  targetPositions: Map<string, Vec3>;
  listeningStatus: ListeningStatus;
  selectedIds: Set<string>;
  selectedEdgeId: string | null;
  expandedActionId: string | null;
  frameAllAt: number;
  autoFramedOnce: boolean;

  // boards
  activeBoardId: string;
  boards: Map<string, Board>;

  // inspector / focus
  inspectorArtifactId: string | null;
  focusedArtifactId: string | null;

  // search / filters
  searchOpen: boolean;
  filters: FilterState;

  // bookmarks
  bookmarks: Map<number, Bookmark>;
  jumpToBookmarkAt: { slot: number; ts: number } | null;

  // camera
  cameraMode: CameraMode;
  /** B16 — view mode (canvas vs console). */
  viewMode: ViewMode;

  // notifications
  notifications: Notification[];
  notificationsOpen: boolean;

  // undo
  undoCount: number;
  redoCount: number;

  // layout history
  layoutHistoryCount: number;

  // model settings
  modelSettings: ModelSettings;

  // onboarding
  onboardingDismissed: boolean;

  // utterance preview (listening ghost)
  utterancePreview: { text: string; expiresAt: number } | null;

  // B11 — marking menu (radial action menu)
  markingMenu: { artifactId: string; screenX: number; screenY: number } | null;
  openMarkingMenu: (artifactId: string, screenX: number, screenY: number) => void;
  closeMarkingMenu: () => void;

  applySnapshot: (s: WorldSnapshot) => void;
  applyEvents: (events: WorldEvent[]) => void;
  appendAgentLog: (e: AgentLogEvent) => void;

  setSelected: (ids: Set<string>) => void;
  setSelectedEdge: (id: string | null) => void;
  setExpandedAction: (id: string | null) => void;
  setInspectorArtifact: (id: string | null) => void;
  setFocusedArtifact: (id: string | null) => void;
  setSearchOpen: (open: boolean) => void;
  setFilters: (f: Partial<FilterState>) => void;
  resetFilters: () => void;
  setCameraMode: (m: CameraMode) => void;
  setViewMode: (m: ViewMode) => void;
  toggleViewMode: () => void;
  setNotificationsOpen: (open: boolean) => void;
  setOnboardingDismissed: () => void;
  jumpBookmark: (slot: number) => void;

  requestFrameAll: () => void;
  markAutoFramed: () => void;
}

const DEFAULT_FILTERS: FilterState = {
  query: '',
  kinds: new Set(),
  tags: new Set(),
  pinnedOnly: false
};

export const useWorldStore = create<WorldStore>(set => ({
  artifacts: new Map(),
  edges: new Map(),
  panels: new Map(),
  auraFlashes: new Map(),
  workerSpinners: new Map(),
  toolTrails: [],
  pendingPlans: new Map(),
  linkTypes: BUILTIN_LINK_TYPES,
  actions: new Map(),
  actionLogs: new Map(),
  targetPositions: new Map(),
  listeningStatus: 'idle',
  selectedIds: new Set(),
  selectedEdgeId: null,
  expandedActionId: null,
  frameAllAt: 0,
  autoFramedOnce: false,
  activeBoardId: 'default',
  boards: new Map(),
  inspectorArtifactId: null,
  focusedArtifactId: null,
  searchOpen: false,
  filters: { ...DEFAULT_FILTERS, kinds: new Set(), tags: new Set() },
  bookmarks: new Map(),
  jumpToBookmarkAt: null,
  cameraMode: 'orbit',
  viewMode: 'canvas',
  notifications: [],
  notificationsOpen: false,
  undoCount: 0,
  redoCount: 0,
  layoutHistoryCount: 0,
  modelSettings: { ...DEFAULT_MODELS },
  onboardingDismissed: false,
  utterancePreview: null,
  markingMenu: null,

  openMarkingMenu: (artifactId, screenX, screenY) => set({ markingMenu: { artifactId, screenX, screenY } }),
  closeMarkingMenu: () => set({ markingMenu: null }),

  applySnapshot: s => {
    const artifacts = new Map<string, Artifact>();
    const targets = new Map<string, Vec3>();
    for (const a of s.artifacts) {
      artifacts.set(a.id, a);
      if (a.position) targets.set(a.id, a.position);
    }
    const bookmarks = new Map<number, Bookmark>();
    for (const b of s.bookmarks) bookmarks.set(b.slot, b);
    const panels = new Map<string, Panel>();
    for (const p of (s.panels ?? [])) panels.set(p.id, p);
    const pendingPlans = new Map<string, PendingLayoutPlan>();
    for (const p of (s.pendingPlans ?? [])) pendingPlans.set(p.id, p);
    set({
      artifacts,
      edges: new Map(s.edges.map(e => [e.id, e])),
      panels,
      pendingPlans,
      linkTypes: (s.linkTypes && s.linkTypes.length > 0) ? s.linkTypes : BUILTIN_LINK_TYPES,
      actions: new Map(s.actions.map(a => [a.id, a])),
      targetPositions: targets,
      activeBoardId: s.activeBoardId,
      boards: new Map(s.boards.map(b => [b.id, b])),
      bookmarks,
      notifications: s.notifications,
      undoCount: s.undoCount,
      redoCount: s.redoCount,
      layoutHistoryCount: s.layoutHistoryCount,
      modelSettings: s.modelSettings
    });
  },

  applyEvents: events => set(state => {
    const artifacts = new Map(state.artifacts);
    const edges = new Map(state.edges);
    const panels = new Map(state.panels);
    const auraFlashes = new Map(state.auraFlashes);
    const workerSpinners = new Map(state.workerSpinners);
    let toolTrails = state.toolTrails;
    const pendingPlans = new Map(state.pendingPlans);
    const actions = new Map(state.actions);
    const targets = new Map(state.targetPositions);
    const boards = new Map(state.boards);
    const bookmarks = new Map(state.bookmarks);
    let notifications = state.notifications;
    let undoCount = state.undoCount;
    let redoCount = state.redoCount;
    let layoutHistoryCount = state.layoutHistoryCount;
    let modelSettings = state.modelSettings;
    let listeningStatus = state.listeningStatus;
    let utterancePreview = state.utterancePreview;
    let activeBoardId = state.activeBoardId;
    let selectedEdgeId = state.selectedEdgeId;
    let linkTypes = state.linkTypes;
    for (const e of events) {
      switch (e.type) {
        case 'artifact.upserted':
          if (e.artifact.boardId === activeBoardId) {
            artifacts.set(e.artifact.id, e.artifact);
            if (e.artifact.position) targets.set(e.artifact.id, e.artifact.position);
          } else {
            artifacts.delete(e.artifact.id);
            targets.delete(e.artifact.id);
          }
          break;
        case 'artifact.removed':
          artifacts.delete(e.id);
          targets.delete(e.id);
          break;
        case 'edge.upserted':
          edges.set(e.edge.id, e.edge);
          break;
        case 'edge.removed':
          edges.delete(e.id);
          if (selectedEdgeId === e.id) selectedEdgeId = null;
          break;
        case 'panel.upserted':
          if (e.panel.boardId === activeBoardId) {
            panels.set(e.panel.id, e.panel);
          } else {
            panels.delete(e.panel.id);
          }
          break;
        case 'panel.removed':
          panels.delete(e.id);
          break;
        case 'link-type.upserted': {
          const next = linkTypes.filter(t => t.id !== e.linkType.id);
          next.push(e.linkType);
          // built-ins first, then alpha — matches Repo.listLinkTypes order
          next.sort((a, b) => Number(b.isBuiltin) - Number(a.isBuiltin) || a.label.localeCompare(b.label));
          linkTypes = next;
          break;
        }
        case 'link-type.removed':
          linkTypes = linkTypes.filter(t => t.id !== e.id);
          break;
        case 'layout.updated':
          for (const p of e.positions) targets.set(p.id, { x: p.x, y: p.y, z: p.z });
          break;
        case 'aura.flash': {
          // Replace any same-agent entry; keep others. Drops expired roles so
          // the map doesn't grow indefinitely.
          const now = Date.now();
          const prev = (auraFlashes.get(e.artifactId) ?? [])
            .filter(f => f.expiresAt > now && f.agentRole !== e.agentRole);
          prev.push({ agentRole: e.agentRole, expiresAt: e.expiresAt });
          auraFlashes.set(e.artifactId, prev);
          break;
        }
        case 'worker.spawned':
          workerSpinners.set(e.actionId, {
            actionId: e.actionId,
            prompt: e.prompt,
            position: e.position,
            startedAt: Date.now()
          });
          break;
        case 'tool.trail': {
          // Resolve target position from current state (fall back to spinner).
          let to: Vec3 | undefined;
          if (e.targetKind === 'artifact') to = artifacts.get(e.targetId)?.position;
          else if (e.targetKind === 'panel') to = panels.get(e.targetId)?.position;
          else if (e.targetKind === 'edge') {
            const ed = edges.get(e.targetId);
            const a = ed && artifacts.get(ed.src);
            const b = ed && artifacts.get(ed.dst);
            if (a?.position && b?.position) {
              to = { x: (a.position.x + b.position.x) / 2, y: (a.position.y + b.position.y) / 2, z: (a.position.z + b.position.z) / 2 };
            }
          }
          if (!to) break;
          // From = most recent same-action trail end, or active spinner pos, or canvas origin.
          const prior = [...toolTrails].reverse().find(t => t.id.startsWith(e.actionId));
          const spinnerSrc = workerSpinners.get(e.actionId);
          const from: Vec3 = prior?.to ?? spinnerSrc?.position ?? { x: 0, y: 2, z: 0 };
          const now2 = Date.now();
          toolTrails = [...toolTrails.filter(t => t.expiresAt > now2), {
            id: `${e.actionId}:${e.ts}`,
            agentRole: e.agentRole,
            toolName: e.toolName,
            from,
            to,
            startedAt: now2,
            expiresAt: now2 + 2500
          }].slice(-30);
          break;
        }
        case 'plan.proposed':
          pendingPlans.set(e.plan.id, e.plan);
          break;
        case 'plan.committed':
        case 'plan.rejected':
          pendingPlans.delete(e.id);
          break;
        case 'action.status':
          actions.set(e.action.id, e.action);
          // B12 — clear Worker spinner when the action finishes.
          if (e.action.status === 'done' || e.action.status === 'error' || e.action.status === 'cancelled') {
            workerSpinners.delete(e.action.id);
          }
          break;
        case 'listening.status':
          listeningStatus = e.status;
          break;
        case 'board.upserted':
          boards.set(e.board.id, e.board);
          break;
        case 'board.switched':
          activeBoardId = e.boardId;
          artifacts.clear();
          edges.clear();
          panels.clear();
          targets.clear();
          bookmarks.clear();
          selectedEdgeId = null;
          // following artifact.upserted / edge.upserted / panel.upserted events
          // from the same batch will refill the maps from the new board's data
          break;
        case 'bookmark.upserted':
          bookmarks.set(e.bookmark.slot, e.bookmark);
          break;
        case 'bookmark.removed':
          for (const [slot, bm] of bookmarks) if (bm.id === e.id) bookmarks.delete(slot);
          break;
        case 'notification':
          notifications = [e.notification, ...notifications].slice(0, 100);
          break;
        case 'undo.state':
          undoCount = e.undoCount;
          redoCount = e.redoCount;
          break;
        case 'layout.state':
          layoutHistoryCount = e.historyCount;
          break;
        case 'model.settings':
          modelSettings = e.settings;
          break;
        case 'utterance.preview':
          utterancePreview = { text: e.text, expiresAt: e.expiresAt };
          break;
        case 'transcript.chunk':
        case 'toast':
          break;
      }
    }
    return {
      artifacts, edges, panels, auraFlashes, workerSpinners, toolTrails, pendingPlans, linkTypes, actions, targetPositions: targets,
      boards, bookmarks, notifications, undoCount, redoCount, layoutHistoryCount,
      modelSettings, listeningStatus, utterancePreview, activeBoardId,
      selectedEdgeId
    };
  }),

  appendAgentLog: e => set(state => {
    if (!e.actionId) return state;
    const next = new Map(state.actionLogs);
    const prev = next.get(e.actionId) ?? [];
    const entry: ActionLogEntry = {
      ts: e.ts,
      text: e.text,
      kind: e.kind ?? 'note'
    };
    const updated = [...prev, entry].slice(-200);
    next.set(e.actionId, updated);
    return { actionLogs: next };
  }),

  setSelected: ids => set({ selectedIds: ids, selectedEdgeId: null }),
  setSelectedEdge: id => set(state => ({
    selectedEdgeId: id,
    selectedIds: id ? new Set<string>() : state.selectedIds
  })),
  setExpandedAction: id => set({ expandedActionId: id }),
  setInspectorArtifact: id => set({ inspectorArtifactId: id }),
  setFocusedArtifact: id => set({ focusedArtifactId: id }),
  setSearchOpen: open => set({ searchOpen: open }),
  setFilters: f => set(state => ({ filters: { ...state.filters, ...f } })),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS, kinds: new Set(), tags: new Set() } }),
  setCameraMode: m => set({ cameraMode: m }),
  setViewMode: m => set({ viewMode: m }),
  toggleViewMode: () => set(state => ({ viewMode: state.viewMode === 'canvas' ? 'console' : 'canvas' })),
  setNotificationsOpen: open => set({ notificationsOpen: open }),
  setOnboardingDismissed: () => set({ onboardingDismissed: true }),
  jumpBookmark: slot => set({ jumpToBookmarkAt: { slot, ts: Date.now() } }),
  requestFrameAll: () => set({ frameAllAt: Date.now() }),
  markAutoFramed: () => set({ autoFramedOnce: true })
}));
