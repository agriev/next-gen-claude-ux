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

  it('requires ≥2 shared tags to relate purely on tags', () => {
    // Single shared tag is too weak — broad tags like "core" co-occur across
    // most artifacts and would defeat dimming. Two-tag overlap signals genuine
    // kinship without needing a stop-word catalog.
    const a = mkArtifact('a', { tags: ['research', 'q4', 'core'] });
    const oneShared = mkArtifact('oneShared', { tags: ['research'] });
    const twoShared = mkArtifact('twoShared', { tags: ['research', 'q4'] });
    const viaSpec = mkArtifact('viaSpec', { tags: [], spec: { summary: '', tags: ['q4', 'core'], refs: [], tokens: 0 } });
    const noShared = mkArtifact('noShared', { tags: ['marketing'] });
    const w = buildWorld([a, oneShared, twoShared, viaSpec, noShared], []);
    const related = computeRelatedIds({ focusedId: 'a', ...w });
    expect(related.has('oneShared')).toBe(false); // 1 overlap — too weak
    expect(related.has('twoShared')).toBe(true);  // 2 overlaps — kindred
    expect(related.has('viaSpec')).toBe(true);    // 2 overlaps via spec.tags
    expect(related.has('noShared')).toBe(false);
  });

  it('skips tag-based relating when focused artifact has <2 tags total', () => {
    // Threshold guards against degenerate "everyone with this lone tag" sets.
    const a = mkArtifact('a', { tags: ['research'] });
    const b = mkArtifact('b', { tags: ['research'] });
    const w = buildWorld([a, b], []);
    const related = computeRelatedIds({ focusedId: 'a', ...w });
    expect(related.has('b')).toBe(false);
  });

  it('combines all signals — edge + cluster + tag (≥2 shared)', () => {
    const a = mkArtifact('a', { tags: ['q4', 'launch'] });
    const byTag = mkArtifact('byTag', { tags: ['q4', 'launch'] });
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
