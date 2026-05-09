import type { Vec3 } from './types';

export const IPC = {
  cmd: {
    submitUtterance: 'cmd:submit-utterance',
    cancelAction: 'cmd:cancel-action',
    cancelAll: 'cmd:cancel-all',
    referenceArtifact: 'cmd:reference-artifact',
    pinArtifact: 'cmd:pin-artifact',
    unpinArtifact: 'cmd:unpin-artifact',
    moveArtifact: 'cmd:move-artifact',
    createEdge: 'cmd:create-edge',
    deleteArtifact: 'cmd:delete-artifact',
    updateCameraFocus: 'cmd:update-camera-focus',

    // Editing
    updateArtifactBody: 'cmd:update-artifact-body',
    renameArtifact: 'cmd:rename-artifact',
    setArtifactTags: 'cmd:set-artifact-tags',
    refineArtifact: 'cmd:refine-artifact',
    createHighlight: 'cmd:create-highlight',
    createAttachmentArtifact: 'cmd:create-attachment-artifact',

    // Boards
    createBoard: 'cmd:create-board',
    switchBoard: 'cmd:switch-board',
    deleteBoard: 'cmd:delete-board',
    renameBoard: 'cmd:rename-board',
    moveArtifactToBoard: 'cmd:move-artifact-to-board',

    // Bookmarks
    saveBookmark: 'cmd:save-bookmark',
    deleteBookmark: 'cmd:delete-bookmark',

    // Undo/redo
    undo: 'cmd:undo',
    redo: 'cmd:redo',

    // Notifications
    markNotificationRead: 'cmd:mark-notification-read',
    clearNotifications: 'cmd:clear-notifications',

    // Onboarding
    setOnboardedFlag: 'cmd:set-onboarded',

    // Layout reorganize
    requestReorganize: 'cmd:request-reorganize',
    restoreLayout: 'cmd:restore-layout',

    // Models
    setModel: 'cmd:set-model'
  },
  query: {
    snapshot: 'query:get-snapshot',
    search: 'query:search',
    artifactBody: 'query:artifact-body',
    listBoards: 'query:list-boards',
    isOnboarded: 'query:is-onboarded'
  },
  event: {
    worldDelta: 'event:world-delta',
    agentLog: 'event:agent-log',
    notification: 'event:notification',
    boardSwitched: 'event:board-switched'
  }
} as const;

export interface SubmitUtterancePayload {
  text: string;
  references: string[];
}

export interface CancelActionPayload {
  actionId: string;
}

export interface MoveArtifactPayload {
  id: string;
  position: Vec3;
}

export interface PinArtifactPayload {
  id: string;
}

export interface CreateEdgePayload {
  src: string;
  dst: string;
  kind: 'derives' | 'references' | 'contradicts' | 'groups-with';
}

export interface DeleteArtifactPayload {
  id: string;
}

export interface UpdateCameraFocusPayload {
  target: Vec3;
  eye: Vec3;
}

export interface UpdateArtifactBodyPayload {
  id: string;
  body: string;
}

export interface RenameArtifactPayload {
  id: string;
  shortName?: string;
  title?: string;
}

export interface SetArtifactTagsPayload {
  id: string;
  tags: string[];
}

export interface RefineArtifactPayload {
  id: string;
  prompt: string;
}

export interface CreateHighlightPayload {
  parentId: string;
  text: string;
  title?: string;
}

export interface CreateAttachmentArtifactPayload {
  /** base64-encoded file bytes */
  dataBase64: string;
  mime: string;
  filename: string;
  title?: string;
}

export interface CreateBoardPayload {
  name: string;
  template?: 'blank' | 'research' | 'journal';
}

export interface SwitchBoardPayload {
  id: string;
}

export interface RenameBoardPayload {
  id: string;
  name: string;
}

export interface MoveArtifactToBoardPayload {
  artifactId: string;
  toBoardId: string;
}

export interface SaveBookmarkPayload {
  slot: number;
  label?: string;
  target: Vec3;
  eye: Vec3;
}

export interface SearchQueryPayload {
  query: string;
  limit?: number;
}

export interface SearchResult {
  artifactId: string;
  shortName: string;
  title: string;
  kind: string;
  score: number;
  matched: 'title' | 'shortName' | 'body' | 'tag' | 'summary';
}

export type ReorganizeMode = 'by-type' | 'by-tags' | 'by-topic' | 'by-time' | 'free-form';

export interface RequestReorganizePayload {
  mode: ReorganizeMode;
  prompt?: string;
}
