import { describe, it, expect } from 'vitest';
import { computeForceDirected } from '../../electron/main/layout/force-directed';
import { computeHorseshoePlacements } from '../../electron/main/layout/horseshoe';
import type { Artifact, Edge, Panel } from '../../shared/types';

function art(id: string, kind: Artifact['kind'] = 'doc', pinned = false, pos = { x: 0, y: 0, z: 0 }): Artifact {
  return {
    id,
    boardId: 'b1',
    kind,
    mime: 'text/markdown',
    title: id,
    shortName: id,
    body: '',
    createdAt: 1,
    updatedAt: 1,
    createdBy: 'test',
    state: 'ready',
    tags: [],
    position: pos,
    pinned
  };
}

function edge(id: string, src: string, dst: string): Edge {
  return { id, src, dst, kind: 'references', weight: 1, createdBy: 'user' };
}

function panel(id: string, size = { w: 3, h: 2 }, pinned = false, updatedAt = 1): Panel {
  return {
    id,
    boardId: 'b1',
    title: id,
    position: { x: 0, y: 0, z: 0 },
    size,
    widget: { kind: 'empty', spec: {} },
    anchor: 'world',
    pinned,
    createdAt: 1,
    updatedAt,
    createdBy: 'test'
  };
}

describe('computeForceDirected', () => {
  it('returns one position per non-cluster artifact', () => {
    const arts = [art('a'), art('b'), art('c'), art('cluster1', 'cluster')];
    const positions = computeForceDirected(arts, []);
    expect(positions.size).toBe(3);
    expect(positions.has('cluster1')).toBe(false);
  });

  it('keeps pinned artifacts exactly in place', () => {
    const fixed = { x: 5, y: 0, z: -2 };
    const arts = [art('p', 'doc', true, fixed), art('q', 'doc', false, { x: -3, y: 0, z: 2 })];
    const positions = computeForceDirected(arts, [edge('e1', 'p', 'q')]);
    const p = positions.get('p')!;
    expect(p.x).toBeCloseTo(fixed.x, 4);
    expect(p.z).toBeCloseTo(fixed.z, 4);
  });

  it('produces deterministic output for the same input', () => {
    const arts = [art('a'), art('b'), art('c'), art('d')];
    const edges = [edge('e1', 'a', 'b'), edge('e2', 'b', 'c'), edge('e3', 'c', 'd')];
    const p1 = computeForceDirected(arts, edges);
    const p2 = computeForceDirected(arts, edges);
    for (const id of ['a', 'b', 'c', 'd']) {
      expect(p1.get(id)!.x).toBeCloseTo(p2.get(id)!.x, 6);
      expect(p1.get(id)!.z).toBeCloseTo(p2.get(id)!.z, 6);
    }
  });

  it('respects canvas bounds', () => {
    const arts = Array.from({ length: 12 }, (_, i) => art(`a${i}`));
    const positions = computeForceDirected(arts, []);
    for (const p of positions.values()) {
      expect(Math.abs(p.x)).toBeLessThanOrEqual(13.5);
      expect(Math.abs(p.z)).toBeLessThanOrEqual(7.5);
    }
  });
});

describe('computeHorseshoePlacements', () => {
  it('assigns the first 5 panels to P/W1/W2/A1/A2', () => {
    const panels = [
      panel('p1', { w: 5, h: 3 }, false, 100), // biggest → primary
      panel('p2', { w: 3, h: 2 }, false, 90),
      panel('p3', { w: 3, h: 2 }, false, 80),
      panel('p4', { w: 3, h: 2 }, false, 70),
      panel('p5', { w: 3, h: 2 }, false, 60)
    ];
    const out = computeHorseshoePlacements(panels);
    expect(out.length).toBe(5);
    expect(out[0].slot).toBe('P');
    expect(out[0].id).toBe('p1');
    expect(out[1].slot).toBe('W1');
    expect(out[2].slot).toBe('W2');
    expect(out[3].slot).toBe('A1');
    expect(out[4].slot).toBe('A2');
  });

  it('puts pinned panels first', () => {
    const panels = [
      panel('a', { w: 3, h: 2 }, false, 100),
      panel('pinned', { w: 3, h: 2 }, true, 50)
    ];
    const out = computeHorseshoePlacements(panels);
    expect(out[0].id).toBe('pinned');
  });

  it('overflows panels beyond slot 5 into an overflow row', () => {
    const panels = Array.from({ length: 8 }, (_, i) => panel(`p${i}`));
    const out = computeHorseshoePlacements(panels);
    expect(out.slice(0, 5).every(p => p.slot === 'P' || p.slot.startsWith('W') || p.slot.startsWith('A'))).toBe(true);
    expect(out.slice(5).every(p => p.slot.startsWith('overflow-'))).toBe(true);
    expect(out.length).toBe(8);
  });
});
