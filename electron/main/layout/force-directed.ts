/**
 * Force-directed layout fallback — B08. A pure-JS Fruchterman-Reingold-ish
 * simulation that runs on the main process when the Layout agent times
 * out, 429s, or the user explicitly picks `force-directed` mode from
 * the LayoutMenu.
 *
 * Why a fallback at all: the LLM-driven Layout pass is slow (~10-30s)
 * and can fail. For a 30-artifact board, a deterministic force-directed
 * pass takes <100ms and always produces a connected, edge-respecting
 * layout — not as semantically meaningful as the LLM grouping, but a
 * sensible "always works" baseline. Pinned artifacts are kept in place
 * (treated as anchors).
 *
 * Output is a Map<id, Vec3>. Caller persists via
 * `world.setArtifactPosition(id, vec, true)` and emits layout.updated
 * events for the renderer.
 */
import type { Artifact, Edge, Vec3 } from '../../../shared/types';

const REPULSION = 0.9;
const SPRING = 0.06;
const DAMP = 0.82;
const Y_PLANE = 0;       // flatten to y=0 by default (top-down style)
const ITERATIONS = 220;
const BOUNDS = { x: 13, y: 4, z: 7 };

interface SimNode {
  id: string;
  pos: Vec3;
  vel: Vec3;
  fixed: boolean;
}

function seededRandom(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function computeForceDirected(
  artifacts: Artifact[],
  edges: Edge[]
): Map<string, Vec3> {
  // Skip clusters — they are layout-emergent, not input.
  const movable = artifacts.filter(a => a.kind !== 'cluster');
  const rng = seededRandom(movable.length * 31 + edges.length);
  const nodes = new Map<string, SimNode>();
  for (const a of movable) {
    const seed = a.position ?? { x: (rng() - 0.5) * 10, y: Y_PLANE, z: (rng() - 0.5) * 6 };
    nodes.set(a.id, {
      id: a.id,
      pos: { x: seed.x, y: Y_PLANE, z: seed.z },
      vel: { x: 0, y: 0, z: 0 },
      fixed: Boolean(a.pinned)
    });
  }

  const nodeArr = [...nodes.values()];

  for (let iter = 0; iter < ITERATIONS; iter++) {
    // Repulsion (all pairs).
    for (let i = 0; i < nodeArr.length; i++) {
      const a = nodeArr[i];
      if (a.fixed) continue;
      for (let j = 0; j < nodeArr.length; j++) {
        if (i === j) continue;
        const b = nodeArr[j];
        const dx = a.pos.x - b.pos.x;
        const dz = a.pos.z - b.pos.z;
        const dist2 = Math.max(0.05, dx * dx + dz * dz);
        const inv = REPULSION / dist2;
        a.vel.x += dx * inv;
        a.vel.z += dz * inv;
      }
    }
    // Spring (edges).
    for (const e of edges) {
      const a = nodes.get(e.src);
      const b = nodes.get(e.dst);
      if (!a || !b) continue;
      const dx = b.pos.x - a.pos.x;
      const dz = b.pos.z - a.pos.z;
      if (!a.fixed) {
        a.vel.x += dx * SPRING;
        a.vel.z += dz * SPRING;
      }
      if (!b.fixed) {
        b.vel.x -= dx * SPRING;
        b.vel.z -= dz * SPRING;
      }
    }
    // Integrate.
    for (const n of nodeArr) {
      if (n.fixed) continue;
      n.vel.x *= DAMP;
      n.vel.z *= DAMP;
      n.pos.x += n.vel.x;
      n.pos.z += n.vel.z;
      // Clamp into canvas bounds.
      if (n.pos.x < -BOUNDS.x) { n.pos.x = -BOUNDS.x; n.vel.x = 0; }
      if (n.pos.x >  BOUNDS.x) { n.pos.x =  BOUNDS.x; n.vel.x = 0; }
      if (n.pos.z < -BOUNDS.z) { n.pos.z = -BOUNDS.z; n.vel.z = 0; }
      if (n.pos.z >  BOUNDS.z) { n.pos.z =  BOUNDS.z; n.vel.z = 0; }
    }
  }

  const out = new Map<string, Vec3>();
  for (const n of nodeArr) {
    out.set(n.id, { x: n.pos.x, y: n.pos.y, z: n.pos.z });
  }
  return out;
}
