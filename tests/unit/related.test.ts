/**
 * B03 — cross-filter relatedIds derivation.
 *
 * Covers: edge-incident, cluster co-membership, frame co-membership, shared
 * tags, missing focus id, no relations at all.
 */
import { describe, it, expect } from 'vitest';
import type { Artifact, Edge } from '../../shared/types';
import { computeRelatedIds } from '../../renderer/src/store/related';

function mkArtifact(id: string, opts: Partial<Artifact> = {}): Artifact {
  return {
    id,
    boardId: 'b1',
    kind: 'doc',
    mime: 'text/markdown',
    title: id,
    shortName: id,
    body: '',
    createdAt: 0,
    updatedAt: 0,
    createdBy: 'user',
    tags: [],
    state: 'ready',
    ...opts
  };
}

function mkEdge(id: string, src: string, dst: string, kind = 'references'): Edge {
  return { id, src, dst, kind, weight: 1, createdBy: 'user' };
}

function buildWorld(artifacts: Artifact[], edges: Edge[]) {
  return {
    artifacts: new Map(artifacts.map(a => [a.id, a])),
    edges: new Map(edges.map(e => [e.id, e]))
  };
}

describe('computeRelatedIds', () => {
  it('returns empty set when focused id is missing', () => {
    const w = buildWorld([], []);
    expect(computeRelatedIds({ focusedId: 'nope', ...w })).toEqual(new Set());
  });

  it('always includes the focused id itself when present', () => {
    const a = mkArtifact('a');
    const w = buildWorld([a], []);
    expect([...computeRelatedIds({ focusedId: 'a', ...w })]).toEqual(['a']);
  });

  it('includes direct edge endpoints (both directions)', () => {
    const a = mkArtifact('a');
    const b = mkArtifact('b');
    const c = mkArtifact('c');
    const d = mkArtifact('d');
    const w = buildWorld([a, b, c, d], [
      mkEdge('e1', 'a', 'b'),
      mkEdge('e2', 'c', 'a'),
      mkEdge('e3', 'b', 'd') // not direct from a
    ]);
    const related = computeRelatedIds({ focusedId: 'a', ...w });
    expect(related.has('a')).toBe(true);
    expect(related.has('b')).toBe(true);
    expect(related.has('c')).toBe(true);
    expect(related.has('d')).toBe(false);
  });

  it('includes cluster co-members + the cluster itself', () => {
    const a = mkArtifact('a');
    const b = mkArtifact('b');
    const c = mkArtifact('c');
    const z = mkArtifact('z', {
      kind: 'cluster',
      spec: { summary: '', tags: [], refs: ['a', 'b'], tokens: 0 }
    });
    const w = buildWorld([a, b, c, z], []);
    const related = computeRelatedIds({ focusedId: 'a', ...w });
    expect(related.has('b')).toBe(true);
    expect(related.has('z')).toBe(true);
    expect(related.has('c')).toBe(false);
  });

  it('includes frame co-members + the frame itself', () => {
    const a = mkArtifact('a');
    const b = mkArtifact('b');
    const f = mkArtifact('f', {
      kind: 'frame',
      spec: { summary: '', tags: [], refs: ['a', 'b'], tokens: 0 }
    });
    const w = buildWorld([a, b, f], []);
    const related = computeRelatedIds({ focusedId: 'b', ...w });
    expect(related.has('a')).toBe(true);
    expect(related.has('f')).toBe(true);
  });

  it('includes artifacts sharing ≥1 tag', () => {
    const a = mkArtifact('a', { tags: ['research', 'q4'] });
    const b = mkArtifact('b', { tags: ['research'] });
    const c = mkArtifact('c', { tags: ['marketing'] });
    const d = mkArtifact('d', { tags: [], spec: { summary: '', tags: ['q4'], refs: [], tokens: 0 } });
    const w = buildWorld([a, b, c, d], []);
    const related = computeRelatedIds({ focusedId: 'a', ...w });
    expect(related.has('b')).toBe(true);
    expect(related.has('d')).toBe(true);
    expect(related.has('c')).toBe(false);
  });

  it('combines all signals — edge + cluster + tag', () => {
    const a = mkArtifact('a', { tags: ['q4'] });
    const byTag = mkArtifact('byTag', { tags: ['q4'] });
    const byEdge = mkArtifact('byEdge');
    const byCluster = mkArtifact('byCluster');
    const unrelated = mkArtifact('unrelated');
    const cluster = mkArtifact('cl', {
      kind: 'cluster',
      spec: { summary: '', tags: [], refs: ['a', 'byCluster'], tokens: 0 }
    });
    const w = buildWorld([a, byTag, byEdge, byCluster, unrelated, cluster], [
      mkEdge('e1', 'a', 'byEdge')
    ]);
    const related = computeRelatedIds({ focusedId: 'a', ...w });
    expect([...related].sort()).toEqual(['a', 'byCluster', 'byEdge', 'byTag', 'cl'].sort());
    expect(related.has('unrelated')).toBe(false);
  });
});
