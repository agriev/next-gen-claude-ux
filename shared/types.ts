export type ArtifactKind = 'doc' | 'note' | 'code' | 'log' | 'image' | 'link' | 'cluster' | 'frame';

/**
 * Built-in link types. Kept as a union for code that switches on the four
 * defaults (renderer color lookups, layout heuristics). At the data model
 * level `Edge.kind` is `string` so user/agent-registered types live alongside
 * built-ins without TypeScript gymnastics. Built-in ids are also seeded into
 * the `link_types` table by migration v5 so the registry is the single source
 * of truth at runtime.
 */
export type BuiltinEdgeKind = 'derives' | 'references' | 'contradicts' | 'groups-with';
/** @deprecated Use `string` for new code; kept for backward-compat with existing call sites. */
export type EdgeKind = BuiltinEdgeKind;
export const BUILTIN_EDGE_KINDS: BuiltinEdgeKind[] = ['derives', 'references', 'contradicts', 'groups-with'];

/**
 * A registered link type. The id doubles as `Edge.kind`. Built-in types
 * (`isBuiltin = true`) cannot be deleted but their color/label/icon can be
 * tuned. Agents register new types via the `ontology-tools` MCP server.
 */
export interface LinkType {
  /** stable id, used as `Edge.kind`. Lowercase, kebab-case. */
  id: string;
  /** human-readable label. */
  label: string;
  /** hex color (e.g. `#5EEAD4`) used by Edge renderer. */
  color: string;
  /** optional one-character glyph or emoji shown alongside the label. */
  icon?: string;
  /** whether the link has a meaningful src→dst direction. */
  isDirected: boolean;
  /** whether the type is one of the built-in four. */
  isBuiltin: boolean;
  createdAt: number;
}

export const BUILTIN_LINK_TYPES: LinkType[] = [
  { id: 'derives',     label: 'Derives from', color: '#5EEAD4', isDirected: true,  isBuiltin: true, createdAt: 0 },
  { id: 'references',  label: 'References',   color: '#8A8F98', isDirected: false, isBuiltin: true, createdAt: 0 },
  { id: 'contradicts', label: 'Contradicts',  color: '#FBBF24', isDirected: false, isBuiltin: true, createdAt: 0 },
  { id: 'groups-with', label: 'Groups with',  color: '#A78BFA', isDirected: false, isBuiltin: true, createdAt: 0 },
];

export type ActionKind = 'research' | 'write' | 'edit' | 'clarify' | 'reference';
export type ActionStatus = 'queued' | 'running' | 'done' | 'cancelled' | 'error';
export type AgentRole = 'listening' | 'worker' | 'layout' | 'naming';
export type TranscriptSource = 'kbd' | 'voice';
export type ArtifactState = 'streaming' | 'ready' | 'updating' | 'error' | 'awaiting-input';
export type ListeningStatus = 'idle' | 'listening' | 'thinking' | 'muted';

/**
 * Anchor mode for spatial primitives. Currently only `'world'` is honored by
 * the desktop renderer; the field is plumbed end-to-end so visionOS/XR ports
 * (E3/M5) can introduce `'desk' | 'head' | 'hand'` without a migration.
 */
export type AnchorMode = 'world' | 'desk' | 'head' | 'hand';

export interface Vec3 { x: number; y: number; z: number; }

export interface ArtifactSpec {
  summary: string;
  tags: string[];
  refs: string[];
  tokens: number;
}

export interface Artifact {
  id: string;
  boardId: string;
  kind: ArtifactKind;
  mime: string;
  title: string;
  shortName: string;
  body: string;
  bodyPath?: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  spec?: ArtifactSpec;
  tags: string[];
  pinned?: boolean;
  position?: Vec3;
  state: ArtifactState;
  parentArtifactId?: string;
  attachmentId?: string;
}

export interface Board {
  id: string;
  name: string;
  template?: 'blank' | 'research' | 'journal';
  startedAt: number;
  lastActiveAt: number;
}

export interface Attachment {
  id: string;
  artifactId: string;
  path: string;
  mime: string;
  size: number;
  sha256: string;
  createdAt: number;
}

export interface Bookmark {
  id: string;
  boardId: string;
  slot: number;
  label: string;
  target: Vec3;
  eye: Vec3;
  createdAt: number;
}

export type NotificationKind =
  | 'worker.done'
  | 'worker.error'
  | 'fs.conflict'
  | 'system'
  | 'digest';

export type NotificationLevel = 'info' | 'success' | 'warn' | 'error';

export interface Notification {
  id: string;
  kind: NotificationKind;
  level: NotificationLevel;
  title: string;
  body?: string;
  payload?: Record<string, unknown>;
  createdAt: number;
  readAt?: number;
}

export interface Edge {
  id: string;
  src: string;
  dst: string;
  /**
   * Link type id. Built-ins: `'derives' | 'references' | 'contradicts' | 'groups-with'`.
   * Custom types registered via `ontology-tools` extend the set; the renderer
   * looks up color/label from the `linkTypes` registry in WorldSnapshot.
   */
  kind: string;
  weight: number;
  createdBy: 'layout' | 'worker' | 'user';
  /** Optional human label that overrides the kind name when rendering. */
  label?: string;
}

export interface Action {
  id: string;
  kind: ActionKind;
  status: ActionStatus;
  startedAt: number;
  endedAt?: number;
  cost?: number;
  tokens?: number;
  producedArtifactIds: string[];
  parentActionId?: string;
  agent: AgentRole;
  label: string;
  prompt: string;
}

export interface ActionLogEntry {
  ts: number;
  text: string;
  kind: 'tool' | 'thought' | 'note';
}

export interface TranscriptChunk {
  id: string;
  sessionId: string;
  ts: number;
  source: TranscriptSource;
  text: string;
  utteranceId?: string;
  isFinal: boolean;
}

export interface Utterance {
  id: string;
  chunkIds: string[];
  text: string;
  completeness: number;
  resultingActionIds: string[];
}

export interface Session {
  id: string;
  title: string;
  startedAt: number;
  agentSessionIds: { listening?: string; layout?: string };
}

/**
 * B04 — intent-ghost. A layout plan proposed by the Layout agent that has
 * NOT yet been applied. The renderer draws translucent "ghost" plates at
 * the proposed positions; the user accepts (commit) or rejects, or it
 * auto-commits after `expiresAt`.
 *
 * Stored entirely in-memory by WorldState (no DB column — plans are
 * ephemeral by design; a crash before commit is the same as rejection).
 */
export interface PlanPlacement { id: string; x: number; y: number; z: number; }
export interface PlanCluster { label: string; artifactIds: string[]; description?: string; tagHint?: string; }
export interface PlanEdge { src: string; dst: string; kind: string; weight?: number; }

export interface PendingLayoutPlan {
  id: string;
  /** Human-readable reason from the agent (e.g. "regroup by-topic"). */
  label: string;
  placements: PlanPlacement[];
  clusters?: PlanCluster[];
  edges?: PlanEdge[];
  /** Whether layout-created edges should be replaced before adding new ones. */
  replaceEdges?: boolean;
  createdAt: number;
  /** Wall-clock ms; auto-commits at or after this timestamp. */
  expiresAt: number;
}

/**
 * Widget kinds that can be hosted on a Panel. `'empty'` is the default for
 * freshly created panels — concrete widget rendering arrives in B19/B20/B22/B23.
 */
export type PanelWidgetKind = 'empty' | 'chart' | 'flow' | 'timeline' | 'graph-3d';

export interface PanelWidget {
  kind: PanelWidgetKind;
  /** widget-specific spec; shape depends on `kind`. */
  spec: Record<string, unknown>;
}

/**
 * A 2D rectangular surface placed in 3D space, hosting an optional widget.
 * Lives alongside artifacts but in its own table so widget-heavy boards
 * don't bloat the artifact rendering pipeline.
 */
export interface Panel {
  id: string;
  boardId: string;
  title: string;
  position: Vec3;
  /** width × height in world units. Default aspect ~3:2. */
  size: { w: number; h: number };
  /** Euler radians; reserved for future billboarding control. Default `{0,0,0}`. */
  rotation?: Vec3;
  widget: PanelWidget;
  anchor: AnchorMode;
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface WorldSnapshot {
  session: Session;
  activeBoardId: string;
  boards: Board[];
  artifacts: Artifact[];
  edges: Edge[];
  panels: Panel[];
  linkTypes: LinkType[];
  pendingPlans: PendingLayoutPlan[];
  actions: Action[];
  bookmarks: Bookmark[];
  notifications: Notification[];
  undoCount: number;
  redoCount: number;
  layoutHistoryCount: number;
  modelSettings: ModelSettings;
}

export interface ModelSettings {
  worker: string;
  layout: string;
  listening: string;
  naming: string;
}

export const MODEL_CATALOG = [
  { id: 'claude-opus-4-7',           label: 'Opus 4.7',    tier: 'max',      cost: 'high'   },
  { id: 'claude-sonnet-4-6',         label: 'Sonnet 4.6',  tier: 'balanced', cost: 'medium' },
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5',   tier: 'fast',     cost: 'low'    }
] as const;

export type ModelId = typeof MODEL_CATALOG[number]['id'];

export const DEFAULT_MODELS: ModelSettings = {
  worker:    'claude-sonnet-4-6',
  layout:    'claude-haiku-4-5-20251001',
  listening: 'claude-haiku-4-5-20251001',
  naming:    'claude-haiku-4-5-20251001'
};
