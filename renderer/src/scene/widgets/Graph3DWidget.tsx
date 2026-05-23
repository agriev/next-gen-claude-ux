/**
 * Graph3DWidget — force-directed 3D graph rendered inside a Panel volume. B23.
 *
 * Pure R3F. Nodes are small spheres + SDF labels; edges are thin line
 * segments. Layout is iteratively computed in-component (deterministic
 * seeded RNG) and frozen after ~120 iterations to avoid jitter under
 * 60Hz render.
 *
 * Focus-plus-context doctrine (per TheBrain research): cap at 30 nodes.
 * If the caller passes >30, we keep the 30 highest-degree and surface
 * the rest as "+N more" text. This prevents 100-node hairballs that
 * waste pixels and confuse perception (WS-05).
 *
 * The widget renders relative to the panel center; positions live in
 * widget-local coords scaled to half the panel inner size.
 */
import { useMemo, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Vector3, BoxGeometry, EdgesGeometry } from 'three';
import { Label } from '../text/Label';

export interface Graph3DNode {
  id: string;
  label?: string;
  kind?: string;
}
export interface Graph3DEdge {
  src: string;
  dst: string;
  weight?: number;
}
export interface Graph3DSpec {
  nodes: Graph3DNode[];
  edges: Graph3DEdge[];
  title?: string;
}

export interface Graph3DWidgetProps {
  spec: Graph3DSpec;
  width: number;
  height: number;
  onDrillDown?: (nodeId: string) => void;
}

const KIND_COLOR: Record<string, string> = {
  artifact: '#82A2FF',
  cluster: '#5EEAD4',
  panel: '#FBBF24',
  default: '#9CA3AF'
};

const MAX_NODES = 30;

function VolumeBoundary({ sx, sy, sz }: { sx: number; sy: number; sz: number }) {
  const edges = useMemo(() => new EdgesGeometry(new BoxGeometry(sx, sy, sz)), [sx, sy, sz]);
  return (
    <lineSegments geometry={edges}>
      <lineBasicMaterial color="#2A2D34" transparent opacity={0.4} />
    </lineSegments>
  );
}

interface Sim {
  positions: Map<string, Vector3>;
  velocities: Map<string, Vector3>;
  iterations: number;
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h >>> 0;
}
function seededRandom(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function initSim(nodes: Graph3DNode[]): Sim {
  const positions = new Map<string, Vector3>();
  const velocities = new Map<string, Vector3>();
  const rng = seededRandom(hashSeed(nodes.map(n => n.id).join(',')));
  for (const n of nodes) {
    positions.set(n.id, new Vector3(
      (rng() - 0.5) * 1.5,
      (rng() - 0.5) * 1.0,
      (rng() - 0.5) * 1.0
    ));
    velocities.set(n.id, new Vector3(0, 0, 0));
  }
  return { positions, velocities, iterations: 0 };
}

function stepSim(sim: Sim, nodes: Graph3DNode[], edges: Graph3DEdge[]) {
  const REPULSION = 0.06;
  const SPRING = 0.04;
  const DAMP = 0.78;
  // Repulsion (all-pairs)
  const forces = new Map<string, Vector3>();
  for (const n of nodes) forces.set(n.id, new Vector3(0, 0, 0));
  for (let i = 0; i < nodes.length; i++) {
    const a = sim.positions.get(nodes[i].id)!;
    for (let j = i + 1; j < nodes.length; j++) {
      const b = sim.positions.get(nodes[j].id)!;
      const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
      const dist2 = Math.max(0.0001, dx * dx + dy * dy + dz * dz);
      const inv = 1 / dist2;
      forces.get(nodes[i].id)!.add(new Vector3(dx * REPULSION * inv, dy * REPULSION * inv, dz * REPULSION * inv));
      forces.get(nodes[j].id)!.add(new Vector3(-dx * REPULSION * inv, -dy * REPULSION * inv, -dz * REPULSION * inv));
    }
  }
  // Spring (edges)
  for (const e of edges) {
    const a = sim.positions.get(e.src);
    const b = sim.positions.get(e.dst);
    if (!a || !b) continue;
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    forces.get(e.src)!.add(new Vector3(dx * SPRING, dy * SPRING, dz * SPRING));
    forces.get(e.dst)!.add(new Vector3(-dx * SPRING, -dy * SPRING, -dz * SPRING));
  }
  // Apply with damping
  for (const n of nodes) {
    const v = sim.velocities.get(n.id)!;
    const f = forces.get(n.id)!;
    v.add(f).multiplyScalar(DAMP);
    sim.positions.get(n.id)!.add(v);
  }
  sim.iterations++;
}

export function Graph3DWidget({ spec, width, height, onDrillDown }: Graph3DWidgetProps) {
  // Cap nodes
  const truncated = spec.nodes.length > MAX_NODES;
  const nodes = useMemo(() => {
    if (!truncated) return spec.nodes;
    // Pick highest-degree
    const degree = new Map<string, number>();
    for (const e of spec.edges) {
      degree.set(e.src, (degree.get(e.src) ?? 0) + 1);
      degree.set(e.dst, (degree.get(e.dst) ?? 0) + 1);
    }
    return [...spec.nodes].sort((a, b) => (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0)).slice(0, MAX_NODES);
  }, [spec.nodes, spec.edges, truncated]);

  const edges = useMemo(() => {
    const ids = new Set(nodes.map(n => n.id));
    return spec.edges.filter(e => ids.has(e.src) && ids.has(e.dst));
  }, [nodes, spec.edges]);

  // Scale to half panel inner size
  const scale = useMemo(() => new Vector3(Math.min(width, height) * 0.35, Math.min(width, height) * 0.30, Math.min(width, height) * 0.30), [width, height]);

  const [sim] = useState(() => initSim(nodes));
  const [, force] = useState(0);

  useFrame(() => {
    if (sim.iterations >= 120) return;
    stepSim(sim, nodes, edges);
    if (sim.iterations % 4 === 0) force(n => n + 1); // re-render every 4 steps
  });

  return (
    <group>
      {spec.title && (
        <Label
          position={[-width / 2 + 0.2, height / 2 - 0.18, 0.01]}
          anchorX="left"
          fontSize={0.14}
          color="#E8EAED"
        >
          {spec.title}
        </Label>
      )}

      {/* Volume boundary — wireframe box */}
      <VolumeBoundary sx={scale.x * 2} sy={scale.y * 2} sz={scale.z * 2} />

      {/* Edges */}
      {edges.map((e, i) => {
        const a = sim.positions.get(e.src);
        const b = sim.positions.get(e.dst);
        if (!a || !b) return null;
        const ax = a.x * scale.x, ay = a.y * scale.y, az = a.z * scale.z;
        const bx = b.x * scale.x, by = b.y * scale.y, bz = b.z * scale.z;
        const mid = [(ax + bx) / 2, (ay + by) / 2, (az + bz) / 2] as [number, number, number];
        const dx = bx - ax, dy = by - ay, dz = bz - az;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const yaw = Math.atan2(dx, dz);
        const pitch = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));
        return (
          <mesh key={`ge-${i}`} position={mid} rotation={[pitch, yaw, 0]}>
            <cylinderGeometry args={[0.005, 0.005, len, 4]} />
            <meshBasicMaterial color="#3A3E45" transparent opacity={0.7} />
          </mesh>
        );
      })}

      {/* Nodes */}
      {nodes.map(n => {
        const p = sim.positions.get(n.id)!;
        const color = KIND_COLOR[n.kind ?? 'default'] ?? KIND_COLOR.default;
        return (
          <group
            key={n.id}
            position={[p.x * scale.x, p.y * scale.y, p.z * scale.z]}
            onDoubleClick={(e: ThreeEvent<MouseEvent>) => {
              if (!onDrillDown) return;
              e.stopPropagation();
              onDrillDown(n.id);
            }}
          >
            <mesh>
              <sphereGeometry args={[0.06, 16, 12]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
            </mesh>
            {n.label && (
              <Label position={[0, 0.13, 0]} fontSize={0.08} color="#E8EAED" outlineWidth={0.005}>
                {n.label.length > 14 ? n.label.slice(0, 13) + '…' : n.label}
              </Label>
            )}
          </group>
        );
      })}

      {truncated && (
        <Label
          position={[width / 2 - 0.18, -height / 2 + 0.18, 0.01]}
          anchorX="right"
          fontSize={0.1}
          color="#6B7280"
        >
          {`+${spec.nodes.length - MAX_NODES} more`}
        </Label>
      )}
    </group>
  );
}
