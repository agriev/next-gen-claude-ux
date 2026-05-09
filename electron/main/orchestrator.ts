import type { WorldState } from './world-state';
import { spawnWorker, type WorkerHandle } from './agents/worker';
import { LayoutAgent } from './agents/layout';
import { ListeningAgent } from './agents/listening';
import { KeyboardSource } from './transcript/keyboard-source';
import { UndoLog } from './undo-log';
import { bus } from './event-bus';
import type { ActionKind, Vec3, Artifact } from '../../shared/types';

interface LayoutSnapshot {
  ts: number;
  modeBefore: string;
  positions: Array<{ id: string; x: number; y: number; z: number; pinned: boolean }>;
  clusters: Artifact[]; // full data so we can restore them too
}

interface SubmitParams {
  text: string;
  references: string[];
  kind?: ActionKind;
}

export class Orchestrator {
  private handles = new Map<string, WorkerHandle>();
  private maxConcurrent = 4;
  private layout: LayoutAgent;
  private listening: ListeningAgent;
  private keyboardSource: KeyboardSource;
  private routeKeyboardThroughListening = false;
  private cameraFocus: { target: Vec3; eye: Vec3 } = {
    target: { x: 0, y: 1, z: 0 },
    eye: { x: 0, y: 6, z: 16 }
  };
  public undoLog: UndoLog;
  private layoutHistory: LayoutSnapshot[] = [];
  private readonly LAYOUT_HISTORY_MAX = 10;

  constructor(private world: WorldState) {
    this.undoLog = new UndoLog(world);
    this.layout = new LayoutAgent(world);
    this.listening = new ListeningAgent({
      onProposeAction: ({ kind, text, references, supersedes }) => {
        if (supersedes) this.cancel(supersedes);
        const result = this.submit({ text, references, kind });
        return 'actionId' in result ? result.actionId : 'error';
      },
      onCancelAction: id => this.cancel(id),
      onUtteranceComplete: () => {
        bus.emit('world', { type: 'listening.status', status: 'idle' });
      }
    }, () => world.getModel('listening'));
    this.keyboardSource = new KeyboardSource(this.world.getSession().id);

    bus.on('world', e => {
      if (e.type === 'artifact.upserted') this.layout.notifyUpsert(e.artifact);
      else if (e.type === 'artifact.removed') this.layout.notifyRemove(e.id);
    });
  }

  start(): void {
    this.layout.start();
    if (this.routeKeyboardThroughListening) this.listening.start();
    this.keyboardSource.start();
  }

  stop(): void {
    this.cancelAll();
    this.layout.stop();
    this.listening.stop();
    this.keyboardSource.stop();
  }

  submit(params: SubmitParams): { actionId: string } | { error: string } {
    const running = [...this.handles.values()].length;
    if (running >= this.maxConcurrent) {
      bus.emit('world', { type: 'toast', level: 'warn', message: `worker queue full (${running}/${this.maxConcurrent})` });
    }
    const handle = spawnWorker({
      world: this.world,
      input: { text: params.text, references: params.references, actionKind: params.kind },
      model: this.world.getModel('worker'),
      getDefaultPosition: () => this.suggestSpawnPosition(),
      requestLayoutPass: (mode, prompt) => this.requestReorganize(mode, prompt)
    });
    this.handles.set(handle.actionId, handle);
    handle.promise.finally(() => {
      this.handles.delete(handle.actionId);
    });
    return { actionId: handle.actionId };
  }

  /** Route keyboard utterance: either direct submit or through Listening for utterance segmentation. */
  ingestKeyboardUtterance(text: string, references: string[]): { actionId: string } | { error: string } {
    if (this.routeKeyboardThroughListening && this.listening.isRunning()) {
      this.keyboardSource.feedText(text);
      this.listening.feedChunk({
        id: `kbd-${Date.now()}`,
        sessionId: this.world.getSession().id,
        ts: Date.now(),
        source: 'kbd',
        text,
        isFinal: true
      });
      return { actionId: 'pending-listening' };
    }
    return this.submit({ text, references });
  }

  cancel(actionId: string): void {
    const h = this.handles.get(actionId);
    if (!h) return;
    h.abort();
  }

  cancelAll(): void {
    for (const h of this.handles.values()) h.abort();
  }

  async undo(): Promise<{ ok: boolean }> {
    const ok = await this.undoLog.undo();
    return { ok };
  }

  async redo(): Promise<{ ok: boolean }> {
    const ok = await this.undoLog.redo();
    return { ok };
  }

  runningCount(): number {
    return this.handles.size;
  }

  setCameraFocus(target: Vec3, eye: Vec3): void {
    this.cameraFocus = { target, eye };
  }

  async setModel(role: 'worker' | 'layout' | 'listening' | 'naming', model: string): Promise<void> {
    this.world.setModel(role, model);
    if (role === 'layout') await this.layout.setModel(model);
    else if (role === 'listening') await this.listening.setModel(model);
    // 'worker' and 'naming' are picked up on next spawn — no live update needed
    bus.emit('world', { type: 'model.settings', settings: this.world.getModelSettings() });
  }

  layoutHistoryCount(): number { return this.layoutHistory.length; }

  async requestReorganize(mode: string, prompt?: string): Promise<void> {
    // 1. Snapshot current state for restore
    const positions: LayoutSnapshot['positions'] = [];
    const clusters: Artifact[] = [];
    for (const a of this.world.getAllArtifacts()) {
      if (a.kind === 'cluster') {
        clusters.push(a);
      } else if (a.position) {
        positions.push({
          id: a.id,
          x: a.position.x, y: a.position.y, z: a.position.z,
          pinned: !!a.pinned
        });
      }
    }
    this.layoutHistory.push({ ts: Date.now(), modeBefore: mode, positions, clusters });
    if (this.layoutHistory.length > this.LAYOUT_HISTORY_MAX) this.layoutHistory.shift();

    // 2. Delete existing clusters (assistant will create fresh ones if needed)
    for (const c of clusters) {
      await this.world.removeArtifact(c.id);
      bus.emit('world', { type: 'artifact.removed', id: c.id });
    }

    // 3. Send reorganize delta to layout agent
    this.layout.requestReorganize(mode, prompt);

    bus.emit('world', { type: 'layout.state', historyCount: this.layoutHistory.length });
  }

  async restorePreviousLayout(): Promise<{ ok: boolean; ageMs?: number }> {
    const snap = this.layoutHistory.pop();
    if (!snap) {
      bus.emit('world', { type: 'layout.state', historyCount: 0 });
      return { ok: false };
    }
    // Delete any clusters present now (they came from the rolled-back reorganize)
    for (const a of this.world.getAllArtifacts()) {
      if (a.kind === 'cluster') {
        await this.world.removeArtifact(a.id);
        bus.emit('world', { type: 'artifact.removed', id: a.id });
      }
    }
    // Restore artifact positions + pinned flags
    for (const p of snap.positions) {
      const a = this.world.getArtifact(p.id);
      if (!a) continue;
      const updated: Artifact = {
        ...a,
        position: { x: p.x, y: p.y, z: p.z },
        pinned: p.pinned,
        updatedAt: Date.now()
      };
      await this.world.upsertArtifact(updated);
      bus.emit('world', { type: 'artifact.upserted', artifact: updated });
    }
    // Restore previous clusters (re-create since we deleted on the previous reorganize)
    for (const c of snap.clusters) {
      const restored: Artifact = { ...c, updatedAt: Date.now() };
      await this.world.upsertArtifact(restored);
      bus.emit('world', { type: 'artifact.upserted', artifact: restored });
    }
    bus.emit('world', { type: 'layout.state', historyCount: this.layoutHistory.length });
    bus.emit('world', {
      type: 'toast', level: 'info',
      message: `Restored layout (was: ${snap.modeBefore}, ${Math.round((Date.now() - snap.ts) / 1000)}s ago)`
    });
    return { ok: true, ageMs: Date.now() - snap.ts };
  }

  /** Suggest a position for a newly spawned artifact: in front of camera, with jitter. */
  suggestSpawnPosition(): Vec3 {
    const { target, eye } = this.cameraFocus;
    // Direction eye → target, normalized
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const len = Math.max(Math.hypot(dx, dy, dz), 1e-6);
    const ux = dx / len, uy = dy / len, uz = dz / len;
    // Place 4 units in front of target along view direction (further into the scene)
    const baseX = target.x + ux * 0;
    const baseY = target.y + uy * 0;
    const baseZ = target.z + uz * 0;
    // Compute right vector (perpendicular to view, in horizontal plane)
    const rx = -uz, ry = 0, rz = ux;
    const rlen = Math.max(Math.hypot(rx, ry, rz), 1e-6);
    const rxn = rx / rlen, rzn = rz / rlen;
    // Random offset in the right + up direction
    const ox = (Math.random() - 0.5) * 6;
    const oy = (Math.random() - 0.5) * 2 + 0.5;
    return {
      x: baseX + rxn * ox,
      y: baseY + oy,
      z: baseZ + rzn * ox
    };
  }
}
