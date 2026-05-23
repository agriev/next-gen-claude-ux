/**
 * B03 — cross-filter / linked highlighting.
 *
 * Given a focused artifact id and the world graph, return the set of
 * related artifact ids. "Related" means any of:
 *   - direct edge endpoint (incoming or outgoing)
 *   - member of the same cluster (cluster.spec.refs both include the id)
 *   - member of the same frame (frame.spec.refs both include the id)
 *   - shares ≥1 tag in `artifact.tags` or `artifact.spec.tags`
 *
 * Pure function so we can unit-test cheaply without spinning up the
 * renderer. Caller is responsible for memoization at the React-render
 * boundary (see Canvas.tsx `useMemo`).
 */
import type { Artifact, Edge } from '@shared/types';

export interface RelatedInput {
  focusedId: string;
  artifacts: ReadonlyMap<string, Artifact>;
  edges: ReadonlyMap<string, Edge>;
}

/**
 * Returns the set of ids that should remain at full opacity (focus + related).
 * Does NOT include unrelated ids — caller dims everything not in the set.
 * If `focusedId` is not in the artifacts map, returns an empty set (caller
 * should fall back to no-dim behaviour).
 */
export function computeRelatedIds(input: RelatedInput): Set<string> {
  const focused = input.artifacts.get(input.focusedId);
  if (!focused) return new Set();
  const related = new Set<string>([input.focusedId]);

  // 1. Direct edge endpoints.
  for (const e of input.edges.values()) {
    if (e.src === input.focusedId) related.add(e.dst);
    if (e.dst === input.focusedId) related.add(e.src);
  }

  // 2. Cluster / frame co-membership. We treat both kinds the same way —
  // they're both grouping primitives whose members live in `spec.refs`.
  for (const a of input.artifacts.values()) {
    if (a.kind !== 'cluster' && a.kind !== 'frame') continue;
    const members = a.spec?.refs ?? [];
    if (!members.includes(input.focusedId)) continue;
    related.add(a.id);
    for (const m of members) related.add(m);
  }

  // 3. Shared tags. Build the focused-tag set once, then scan.
  const focusedTags = new Set<string>(focused.tags ?? []);
  for (const t of focused.spec?.tags ?? []) focusedTags.add(t);
  if (focusedTags.size > 0) {
    for (const a of input.artifacts.values()) {
      if (related.has(a.id)) continue;
      const aTags = new Set<string>(a.tags ?? []);
      for (const t of a.spec?.tags ?? []) aTags.add(t);
      let match = false;
      for (const t of aTags) {
        if (focusedTags.has(t)) { match = true; break; }
      }
      if (match) related.add(a.id);
    }
  }

  return related;
}
