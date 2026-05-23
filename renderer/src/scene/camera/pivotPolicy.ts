/**
 * Pivot policy — B07 in BACKLOG-v2.md.
 *
 * Given the current selection, decide what point the camera should orbit
 * around. The policy is pure / testable; the actual tween happens in
 * `Canvas.tsx` CameraFitter.
 *
 * Policy:
 *   - 0 selected   → return null (no change; OrbitControls keeps its target)
 *   - 1 selected   → target the artifact's live position
 *   - 2-3 selected → target the bounding-box centroid
 *   - 4+ selected  → return null (avoid jarring re-orbit on noisy lasso)
 *
 * The 4+ cutoff is empirical — open question Q4.1 in the synthesis docs;
 * adjust here once we have telemetry.
 */
import { Vector3 } from 'three';

export interface PivotInput {
  selectedIds: ReadonlySet<string>;
  /** Live positions keyed by artifact id. */
  positions: ReadonlyMap<string, { x: number; y: number; z: number }>;
}

export interface PivotResult {
  target: Vector3;
}

/** Maximum selection size before we stop pivoting (anti-jitter for lasso). */
export const PIVOT_MAX = 3;

export function computePivot(input: PivotInput): PivotResult | null {
  const ids = [...input.selectedIds];
  if (ids.length === 0 || ids.length > PIVOT_MAX) return null;
  const center = new Vector3();
  let count = 0;
  for (const id of ids) {
    const p = input.positions.get(id);
    if (!p) continue;
    center.x += p.x;
    center.y += p.y;
    center.z += p.z;
    count++;
  }
  if (count === 0) return null;
  center.divideScalar(count);
  return { target: center };
}
