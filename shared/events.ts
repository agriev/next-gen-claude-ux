import type {
  Artifact, Edge, Action, TranscriptChunk, AgentRole, ListeningStatus,
  Board, Bookmark, Notification, LinkType, Panel
} from './types';

export type WorldEvent =
  | { type: 'artifact.upserted'; artifact: Artifact }
  | { type: 'artifact.removed'; id: string }
  | { type: 'edge.upserted'; edge: Edge }
  | { type: 'edge.removed'; id: string }
  | { type: 'panel.upserted'; panel: Panel }
  | { type: 'panel.removed'; id: string }
  | { type: 'link-type.upserted'; linkType: LinkType }
  | { type: 'link-type.removed'; id: string }
  | { type: 'layout.updated'; positions: Array<{ id: string; x: number; y: number; z: number }> }
  | { type: 'action.status'; action: Action }
  | { type: 'transcript.chunk'; chunk: TranscriptChunk }
  | { type: 'listening.status'; status: ListeningStatus }
  | { type: 'toast'; level: 'info' | 'warn' | 'error'; message: string }
  | { type: 'board.upserted'; board: Board }
  | { type: 'board.switched'; boardId: string }
  | { type: 'bookmark.upserted'; bookmark: Bookmark }
  | { type: 'bookmark.removed'; id: string }
  | { type: 'notification'; notification: Notification }
  | { type: 'undo.state'; undoCount: number; redoCount: number }
  | { type: 'layout.state'; historyCount: number }
  | { type: 'utterance.preview'; text: string; expiresAt: number }
  | { type: 'model.settings'; settings: { worker: string; layout: string; listening: string; naming: string } };

export interface WorldDeltaBatch {
  ts: number;
  events: WorldEvent[];
}

export interface AgentLogEvent {
  agentRole: AgentRole;
  agentId: string;
  text: string;
  ts: number;
  actionId?: string;
  kind?: 'tool' | 'thought' | 'note';
}
