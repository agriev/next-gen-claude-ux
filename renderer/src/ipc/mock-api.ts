import type { WorldSnapshot, Artifact, Edge, Board } from '@shared/types';
import { DEFAULT_MODELS, BUILTIN_LINK_TYPES } from '@shared/types';
import { MARKETING_ARTIFACTS, MARKETING_EDGES } from '@shared/seed-marketing';

const MOCK_BOARD: Board = {
  id: 'default', name: 'Workspace', template: 'blank', startedAt: 0, lastActiveAt: 0
};

const MOCK_ARTIFACTS: Artifact[] = MARKETING_ARTIFACTS.map((s, i) => ({
  id: `m${i + 1}`,
  boardId: 'default',
  kind: s.kind,
  mime: s.mime,
  title: s.title,
  shortName: s.shortName,
  body: s.body,
  createdAt: 0,
  updatedAt: 0,
  createdBy: 'mock',
  state: 'ready',
  tags: s.tags,
  position: s.position,
  spec: s.spec
}));

const shortNameToId = new Map(MOCK_ARTIFACTS.map(a => [a.shortName, a.id]));

const MOCK_EDGES: Edge[] = MARKETING_EDGES
  .map(([src, dst, kind], i): Edge | null => {
    const srcId = shortNameToId.get(src);
    const dstId = shortNameToId.get(dst);
    if (!srcId || !dstId) return null;
    return { id: `e${i + 1}`, src: srcId, dst: dstId, kind, weight: 1, createdBy: 'user' };
  })
  .filter((e): e is Edge => e !== null);

const MOCK_SNAPSHOT: WorldSnapshot = {
  session: { id: 'mock', title: 'mock', startedAt: 0, agentSessionIds: {} },
  activeBoardId: 'default',
  boards: [MOCK_BOARD],
  artifacts: MOCK_ARTIFACTS,
  edges: MOCK_EDGES,
  panels: [],
  linkTypes: BUILTIN_LINK_TYPES,
  pendingPlans: [],
  actions: [],
  bookmarks: [],
  notifications: [],
  undoCount: 0,
  redoCount: 0,
  layoutHistoryCount: 0,
  modelSettings: { ...DEFAULT_MODELS }
};

export function installMockApi(): void {
  if (typeof window === 'undefined') return;
  if ((window as { api?: unknown }).api) return;

  console.warn('[bridge] window.api missing — installing mock API (browser-only mode)');
  const noop = () => () => undefined;
  (window as unknown as { api: unknown }).api = {
    getSnapshot: async () => MOCK_SNAPSHOT,
    onWorldDelta: noop,
    onAgentLog: noop,
    submitUtterance: async () => ({ actionId: 'mock' }),
    cancelAction: async () => undefined,
    cancelAll: async () => undefined,
    pinArtifact: async () => undefined,
    unpinArtifact: async () => undefined,
    moveArtifact: async () => undefined,
    createEdge: async () => undefined,
    deleteEdge: async () => undefined,
    updateEdge: async () => undefined,
    deleteArtifact: async () => undefined,
    updateCameraFocus: async () => undefined,
    updateArtifactBody: async () => undefined,
    renameArtifact: async () => undefined,
    setArtifactTags: async () => undefined,
    refineArtifact: async () => undefined,
    createHighlight: async () => undefined,
    createAttachmentArtifact: async () => undefined,
    createBoard: async () => MOCK_BOARD,
    switchBoard: async () => undefined,
    deleteBoard: async () => undefined,
    renameBoard: async () => undefined,
    moveArtifactToBoard: async () => undefined,
    saveBookmark: async () => undefined,
    deleteBookmark: async () => undefined,
    undo: async () => undefined,
    redo: async () => undefined,
    markNotificationRead: async () => undefined,
    clearNotifications: async () => undefined,
    setOnboardedFlag: async () => undefined,
    requestReorganize: async () => undefined,
    restoreLayout: async () => ({ ok: false }),
    arrangeConsole: async () => ({ placed: 0 }),
    commitLayoutPlan: async () => ({ ok: false, summary: null }),
    rejectLayoutPlan: async () => ({ ok: false }),
    setModel: async () => ({ ok: true }),
    search: async () => [],
    getArtifactBody: async () => '',
    listBoards: async () => [MOCK_BOARD],
    isOnboarded: async () => true,
    __debugCreateMock: async () => MOCK_ARTIFACTS[0]
  };
}
