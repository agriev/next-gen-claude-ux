import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UndoLog, type UndoOp } from '../../electron/main/undo-log';
import type { Artifact, Edge } from '../../shared/types';

// Mock the event-bus module so tests don't crash on missing listeners.
vi.mock('../../electron/main/event-bus', () => ({
  bus: { emit: vi.fn() },
}));

interface MockWorld {
  upsertArtifact: ReturnType<typeof vi.fn>;
  removeArtifact: ReturnType<typeof vi.fn>;
  upsertEdge: ReturnType<typeof vi.fn>;
  removeEdge: ReturnType<typeof vi.fn>;
}

function makeMockWorld(): MockWorld {
  return {
    upsertArtifact: vi.fn().mockResolvedValue(undefined),
    removeArtifact: vi.fn().mockResolvedValue(undefined),
    upsertEdge: vi.fn().mockResolvedValue(undefined),
    removeEdge: vi.fn().mockResolvedValue(undefined),
  };
}

function makeArtifact(id: string, title: string): Artifact {
  return {
    id,
    boardId: 'b1',
    kind: 'doc',
    mime: 'text/markdown',
    title,
    shortName: title,
    body: `body of ${title}`,
    createdAt: 1,
    updatedAt: 1,
    createdBy: 'user',
    tags: [],
    state: 'ready',
  };
}

function makeEdge(id: string, src: string, dst: string): Edge {
  return { id, src, dst, kind: 'references', weight: 1, createdBy: 'user' };
}

describe('UndoLog', () => {
  let world: MockWorld;
  let log: UndoLog;

  beforeEach(() => {
    world = makeMockWorld();
    log = new UndoLog(world as never);
  });

  it('starts empty', () => {
    expect(log.counts()).toEqual({ undo: 0, redo: 0 });
  });

  it('push increases undo count and clears redo', async () => {
    const a = makeArtifact('a1', 'Atlas');
    const op: UndoOp = { kind: 'artifact-create', before: null, after: a };

    log.push(op);
    expect(log.counts()).toEqual({ undo: 1, redo: 0 });

    await log.undo();
    expect(log.counts()).toEqual({ undo: 0, redo: 1 });

    log.push(op); // new push clears redo
    expect(log.counts()).toEqual({ undo: 1, redo: 0 });
  });

  it('undo of artifact-create calls removeArtifact', async () => {
    const a = makeArtifact('a2', 'Pulse');
    log.push({ kind: 'artifact-create', before: null, after: a });

    const ok = await log.undo();
    expect(ok).toBe(true);
    expect(world.removeArtifact).toHaveBeenCalledWith('a2');
  });

  it('undo of artifact-delete restores the previous artifact', async () => {
    const a = makeArtifact('a3', 'Mission');
    log.push({ kind: 'artifact-delete', before: a, after: null });

    await log.undo();
    expect(world.upsertArtifact).toHaveBeenCalledWith(a);
  });

  it('undo of edge-update reverts to the previous edge', async () => {
    const before = makeEdge('e1', 'a1', 'a2');
    const after: Edge = { ...before, kind: 'derives' };
    log.push({ kind: 'edge-update', before, after });

    await log.undo();
    expect(world.upsertEdge).toHaveBeenCalledWith(before);
  });

  it('redo after undo replays the forward op', async () => {
    const a = makeArtifact('a4', 'Glimpse');
    log.push({ kind: 'artifact-create', before: null, after: a });

    await log.undo();
    expect(log.counts()).toEqual({ undo: 0, redo: 1 });

    const ok = await log.redo();
    expect(ok).toBe(true);
    expect(world.upsertArtifact).toHaveBeenCalledWith(a);
    expect(log.counts()).toEqual({ undo: 1, redo: 0 });
  });

  it('clear empties both stacks', async () => {
    log.push({ kind: 'artifact-create', before: null, after: makeArtifact('a5', 'X') });
    log.push({ kind: 'artifact-create', before: null, after: makeArtifact('a6', 'Y') });
    log.clear();
    expect(log.counts()).toEqual({ undo: 0, redo: 0 });
  });

  it('undo returns false when stack is empty', async () => {
    expect(await log.undo()).toBe(false);
    expect(await log.redo()).toBe(false);
  });

  it('caps the undo stack at MAX (200) entries', () => {
    for (let i = 0; i < 250; i++) {
      log.push({
        kind: 'artifact-create',
        before: null,
        after: makeArtifact(`a${i}`, `T${i}`),
      });
    }
    expect(log.counts().undo).toBe(200);
  });
});
