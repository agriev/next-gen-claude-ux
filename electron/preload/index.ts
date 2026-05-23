import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../../shared/ipc-channels';
import type { WorldDeltaBatch, AgentLogEvent } from '../../shared/events';
import type {
  WorldSnapshot, Vec3, Artifact, Board, Bookmark
} from '../../shared/types';
import type { SearchResult, PendingAttachment, SubmitUtteranceResponse } from '../../shared/ipc-channels';

const DEBUG_CREATE_MOCK = 'cmd:debug-create-mock';

const api = {
  submitUtterance: (
    text: string,
    references: string[],
    attachments?: PendingAttachment[]
  ): Promise<SubmitUtteranceResponse> =>
    ipcRenderer.invoke(IPC.cmd.submitUtterance, { text, references, attachments }),
  cancelAction: (actionId: string): Promise<void> =>
    ipcRenderer.invoke(IPC.cmd.cancelAction, { actionId }),
  cancelAll: (): Promise<void> => ipcRenderer.invoke(IPC.cmd.cancelAll),
  pinArtifact: (id: string): Promise<void> =>
    ipcRenderer.invoke(IPC.cmd.pinArtifact, { id }),
  unpinArtifact: (id: string): Promise<void> =>
    ipcRenderer.invoke(IPC.cmd.unpinArtifact, { id }),
  moveArtifact: (id: string, position: Vec3): Promise<void> =>
    ipcRenderer.invoke(IPC.cmd.moveArtifact, { id, position }),
  createEdge: (src: string, dst: string, kind: string, label?: string): Promise<void> =>
    ipcRenderer.invoke(IPC.cmd.createEdge, { src, dst, kind, label }),
  deleteEdge: (id: string): Promise<void> =>
    ipcRenderer.invoke(IPC.cmd.deleteEdge, { id }),
  updateEdge: (id: string, opts: { kind?: string; weight?: number; label?: string | null }): Promise<void> =>
    ipcRenderer.invoke(IPC.cmd.updateEdge, { id, ...opts }),
  deleteArtifact: (id: string): Promise<void> =>
    ipcRenderer.invoke(IPC.cmd.deleteArtifact, { id }),
  updateCameraFocus: (target: Vec3, eye: Vec3): Promise<void> =>
    ipcRenderer.invoke(IPC.cmd.updateCameraFocus, { target, eye }),

  // editing
  updateArtifactBody: (id: string, body: string): Promise<void> =>
    ipcRenderer.invoke(IPC.cmd.updateArtifactBody, { id, body }),
  renameArtifact: (id: string, opts: { shortName?: string; title?: string }): Promise<void> =>
    ipcRenderer.invoke(IPC.cmd.renameArtifact, { id, ...opts }),
  setArtifactTags: (id: string, tags: string[]): Promise<void> =>
    ipcRenderer.invoke(IPC.cmd.setArtifactTags, { id, tags }),
  refineArtifact: (id: string, prompt: string): Promise<{ actionId: string } | { error: string }> =>
    ipcRenderer.invoke(IPC.cmd.refineArtifact, { id, prompt }),
  createHighlight: (parentId: string, text: string, title?: string): Promise<Artifact | undefined> =>
    ipcRenderer.invoke(IPC.cmd.createHighlight, { parentId, text, title }),
  createAttachmentArtifact: (params: { dataBase64: string; mime: string; filename: string; title?: string }): Promise<Artifact> =>
    ipcRenderer.invoke(IPC.cmd.createAttachmentArtifact, params),

  // boards
  createBoard: (name: string, template?: 'blank' | 'research' | 'journal'): Promise<Board> =>
    ipcRenderer.invoke(IPC.cmd.createBoard, { name, template }),
  switchBoard: (id: string): Promise<{ ok: boolean }> =>
    ipcRenderer.invoke(IPC.cmd.switchBoard, { id }),
  deleteBoard: (id: string): Promise<void> =>
    ipcRenderer.invoke(IPC.cmd.deleteBoard, { id }),
  renameBoard: (id: string, name: string): Promise<void> =>
    ipcRenderer.invoke(IPC.cmd.renameBoard, { id, name }),
  moveArtifactToBoard: (artifactId: string, toBoardId: string): Promise<void> =>
    ipcRenderer.invoke(IPC.cmd.moveArtifactToBoard, { artifactId, toBoardId }),
  listBoards: (): Promise<Board[]> => ipcRenderer.invoke(IPC.query.listBoards),

  // bookmarks
  saveBookmark: (slot: number, target: Vec3, eye: Vec3, label?: string): Promise<Bookmark> =>
    ipcRenderer.invoke(IPC.cmd.saveBookmark, { slot, target, eye, label }),
  deleteBookmark: (id: string): Promise<void> =>
    ipcRenderer.invoke(IPC.cmd.deleteBookmark, { id }),

  // undo
  undo: (): Promise<{ ok: boolean }> => ipcRenderer.invoke(IPC.cmd.undo),
  redo: (): Promise<{ ok: boolean }> => ipcRenderer.invoke(IPC.cmd.redo),

  // notifications
  markNotificationRead: (id: string): Promise<void> =>
    ipcRenderer.invoke(IPC.cmd.markNotificationRead, { id }),
  clearNotifications: (): Promise<void> => ipcRenderer.invoke(IPC.cmd.clearNotifications),

  // onboarding
  setOnboardedFlag: (): Promise<void> => ipcRenderer.invoke(IPC.cmd.setOnboardedFlag),
  isOnboarded: (): Promise<boolean> => ipcRenderer.invoke(IPC.query.isOnboarded),

  // layout reorganize
  requestReorganize: (mode: string, prompt?: string): Promise<void> =>
    ipcRenderer.invoke(IPC.cmd.requestReorganize, { mode, prompt }),
  restoreLayout: (): Promise<{ ok: boolean; ageMs?: number }> =>
    ipcRenderer.invoke(IPC.cmd.restoreLayout),
  arrangeConsole: (): Promise<{ placed: number }> =>
    ipcRenderer.invoke(IPC.cmd.arrangeConsole),

  // intent-ghost (B04)
  commitLayoutPlan: (id: string): Promise<{ ok: boolean; summary: string | null }> =>
    ipcRenderer.invoke(IPC.cmd.commitLayoutPlan, { id }),
  rejectLayoutPlan: (id: string): Promise<{ ok: boolean }> =>
    ipcRenderer.invoke(IPC.cmd.rejectLayoutPlan, { id }),

  // model settings
  setModel: (role: 'worker' | 'layout' | 'listening' | 'naming', model: string): Promise<{ ok: boolean }> =>
    ipcRenderer.invoke(IPC.cmd.setModel, { role, model }),

  // search
  search: (query: string, limit = 12): Promise<SearchResult[]> =>
    ipcRenderer.invoke(IPC.query.search, { query, limit }),
  getArtifactBody: (id: string): Promise<string> =>
    ipcRenderer.invoke(IPC.query.artifactBody, { id }),

  getSnapshot: (): Promise<WorldSnapshot> => ipcRenderer.invoke(IPC.query.snapshot),

  __debugCreateMock: (opts?: { kind?: Artifact['kind']; title?: string }): Promise<Artifact> =>
    ipcRenderer.invoke(DEBUG_CREATE_MOCK, opts),

  onWorldDelta: (cb: (batch: WorldDeltaBatch) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, batch: WorldDeltaBatch) => cb(batch);
    ipcRenderer.on(IPC.event.worldDelta, listener);
    return () => { ipcRenderer.removeListener(IPC.event.worldDelta, listener); };
  },
  onAgentLog: (cb: (e: AgentLogEvent) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, payload: AgentLogEvent) => cb(payload);
    ipcRenderer.on(IPC.event.agentLog, listener);
    return () => { ipcRenderer.removeListener(IPC.event.agentLog, listener); };
  }
};

contextBridge.exposeInMainWorld('api', api);

export type Api = typeof api;
