import { create } from 'zustand';
import type {
  Artifact, ArtifactKind, Edge, Action, Vec3, WorldSnapshot, ListeningStatus,
  ActionLogEntry, Board, Bookmark, Notification, ModelSettings
} from '@shared/types';
import { DEFAULT_MODELS } from '@shared/types';
import type { WorldEvent, AgentLogEvent } from '@shared/events';

export type CameraMode = 'orbit' | 'top-down';

export interface FilterState {
  query: string;
  kinds: Set<ArtifactKind>;
  tags: Set<string>;
  pinnedOnly: boolean;
}

interface WorldStore {
  artifacts: Map<string, Artifact>;
  edges: Map<string, Edge>;
  actions: Map<string, Action>;
  actionLogs: Map<string, ActionLogEntry[]>;
  targetPositions: Map<string, Vec3>;
  listeningStatus: ListeningStatus;
  selectedIds: Set<string>;
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

  applySnapshot: (s: WorldSnapshot) => void;
  applyEvents: (events: WorldEvent[]) => void;
  appendAgentLog: (e: AgentLogEvent) => void;

  setSelected: (ids: Set<string>) => void;
  setExpandedAction: (id: string | null) => void;
  setInspectorArtifact: (id: string | null) => void;
  setFocusedArtifact: (id: string | null) => void;
  setSearchOpen: (open: boolean) => void;
  setFilters: (f: Partial<FilterState>) => void;
  resetFilters: () => void;
  setCameraMode: (m: CameraMode) => void;
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
  actions: new Map(),
  actionLogs: new Map(),
  targetPositions: new Map(),
  listeningStatus: 'idle',
  selectedIds: new Set(),
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
  notifications: [],
  notificationsOpen: false,
  undoCount: 0,
  redoCount: 0,
  layoutHistoryCount: 0,
  modelSettings: { ...DEFAULT_MODELS },
  onboardingDismissed: false,
  utterancePreview: null,

  applySnapshot: s => {
    const artifacts = new Map<string, Artifact>();
    const targets = new Map<string, Vec3>();
    for (const a of s.artifacts) {
      artifacts.set(a.id, a);
      if (a.position) targets.set(a.id, a.position);
    }
    const bookmarks = new Map<number, Bookmark>();
    for (const b of s.bookmarks) bookmarks.set(b.slot, b);
    set({
      artifacts,
      edges: new Map(s.edges.map(e => [e.id, e])),
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
          break;
        case 'layout.updated':
          for (const p of e.positions) targets.set(p.id, { x: p.x, y: p.y, z: p.z });
          break;
        case 'action.status':
          actions.set(e.action.id, e.action);
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
          targets.clear();
          bookmarks.clear();
          // following artifact.upserted / edge.upserted events from the same batch
          // will refill the maps from the new board's data
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
      artifacts, edges, actions, targetPositions: targets,
      boards, bookmarks, notifications, undoCount, redoCount, layoutHistoryCount,
      modelSettings, listeningStatus, utterancePreview, activeBoardId
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

  setSelected: ids => set({ selectedIds: ids }),
  setExpandedAction: id => set({ expandedActionId: id }),
  setInspectorArtifact: id => set({ inspectorArtifactId: id }),
  setFocusedArtifact: id => set({ focusedArtifactId: id }),
  setSearchOpen: open => set({ searchOpen: open }),
  setFilters: f => set(state => ({ filters: { ...state.filters, ...f } })),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS, kinds: new Set(), tags: new Set() } }),
  setCameraMode: m => set({ cameraMode: m }),
  setNotificationsOpen: open => set({ notificationsOpen: open }),
  setOnboardingDismissed: () => set({ onboardingDismissed: true }),
  jumpBookmark: slot => set({ jumpToBookmarkAt: { slot, ts: Date.now() } }),
  requestFrameAll: () => set({ frameAllAt: Date.now() }),
  markAutoFramed: () => set({ autoFramedOnce: true })
}));
