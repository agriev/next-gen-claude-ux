export type ArtifactKind = 'doc' | 'note' | 'code' | 'log' | 'image' | 'link' | 'cluster';
export type EdgeKind = 'derives' | 'references' | 'contradicts' | 'groups-with';
export type ActionKind = 'research' | 'write' | 'edit' | 'clarify' | 'reference';
export type ActionStatus = 'queued' | 'running' | 'done' | 'cancelled' | 'error';
export type AgentRole = 'listening' | 'worker' | 'layout' | 'naming';
export type TranscriptSource = 'kbd' | 'voice';
export type ArtifactState = 'streaming' | 'ready' | 'updating' | 'error' | 'awaiting-input';
export type ListeningStatus = 'idle' | 'listening' | 'thinking' | 'muted';

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
  kind: EdgeKind;
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

export interface WorldSnapshot {
  session: Session;
  activeBoardId: string;
  boards: Board[];
  artifacts: Artifact[];
  edges: Edge[];
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
