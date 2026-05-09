import type { Artifact, Edge } from '../../shared/types';
import type { WorldState } from './world-state';
import { bus } from './event-bus';

export type UndoOp =
  | { kind: 'artifact-create'; before: null; after: Artifact }
  | { kind: 'artifact-delete'; before: Artifact; after: null }
  | { kind: 'artifact-update'; before: Artifact; after: Artifact }
  | { kind: 'edge-create'; before: null; after: Edge }
  | { kind: 'edge-delete'; before: Edge; after: null }
  | { kind: 'edge-update'; before: Edge; after: Edge };

const MAX = 200;

export class UndoLog {
  private undoStack: UndoOp[] = [];
  private redoStack: UndoOp[] = [];

  constructor(private world: WorldState) {}

  push(op: UndoOp): void {
    this.undoStack.push(op);
    if (this.undoStack.length > MAX) this.undoStack.shift();
    this.redoStack = [];
    this.broadcast();
  }

  counts(): { undo: number; redo: number } {
    return { undo: this.undoStack.length, redo: this.redoStack.length };
  }

  async undo(): Promise<boolean> {
    const op = this.undoStack.pop();
    if (!op) return false;
    await this.applyInverse(op);
    this.redoStack.push(op);
    if (this.redoStack.length > MAX) this.redoStack.shift();
    this.broadcast();
    return true;
  }

  async redo(): Promise<boolean> {
    const op = this.redoStack.pop();
    if (!op) return false;
    await this.applyForward(op);
    this.undoStack.push(op);
    if (this.undoStack.length > MAX) this.undoStack.shift();
    this.broadcast();
    return true;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.broadcast();
  }

  private async applyForward(op: UndoOp): Promise<void> {
    switch (op.kind) {
      case 'artifact-create':
      case 'artifact-update':
        await this.world.upsertArtifact(op.after);
        bus.emit('world', { type: 'artifact.upserted', artifact: op.after });
        break;
      case 'artifact-delete':
        await this.world.removeArtifact(op.before.id);
        bus.emit('world', { type: 'artifact.removed', id: op.before.id });
        break;
      case 'edge-create':
        await this.world.upsertEdge(op.after);
        bus.emit('world', { type: 'edge.upserted', edge: op.after });
        break;
      case 'edge-delete':
        await this.world.removeEdge(op.before.id);
        bus.emit('world', { type: 'edge.removed', id: op.before.id });
        break;
      case 'edge-update':
        await this.world.upsertEdge(op.after);
        bus.emit('world', { type: 'edge.upserted', edge: op.after });
        break;
    }
  }

  private async applyInverse(op: UndoOp): Promise<void> {
    switch (op.kind) {
      case 'artifact-create':
        await this.world.removeArtifact(op.after.id);
        bus.emit('world', { type: 'artifact.removed', id: op.after.id });
        break;
      case 'artifact-delete':
        await this.world.upsertArtifact(op.before);
        bus.emit('world', { type: 'artifact.upserted', artifact: op.before });
        break;
      case 'artifact-update':
        await this.world.upsertArtifact(op.before);
        bus.emit('world', { type: 'artifact.upserted', artifact: op.before });
        break;
      case 'edge-create':
        await this.world.removeEdge(op.after.id);
        bus.emit('world', { type: 'edge.removed', id: op.after.id });
        break;
      case 'edge-delete':
        await this.world.upsertEdge(op.before);
        bus.emit('world', { type: 'edge.upserted', edge: op.before });
        break;
      case 'edge-update':
        await this.world.upsertEdge(op.before);
        bus.emit('world', { type: 'edge.upserted', edge: op.before });
        break;
    }
  }

  private broadcast(): void {
    const c = this.counts();
    bus.emit('world', { type: 'undo.state', undoCount: c.undo, redoCount: c.redo });
  }
}
