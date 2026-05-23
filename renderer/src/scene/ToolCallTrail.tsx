/**
 * ToolCallTrail — B14. Renders fading dashed lines from an agent's last
 * mutation point to the next, building a visible breadcrumb of the
 * agent's path through the canvas. Each trail entry fades out over 2.5s;
 * the store prunes expired entries on the next tick.
 *
 * Pure R3F — uses tubeGeometry along a straight line so the dashes show
 * up reliably at any camera angle.
 */
import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Vector3, CatmullRomCurve3 } from 'three';
import { useWorldStore } from '../store/world-store';
import type { AgentRole } from '@shared/types';

const ROLE_COLOR: Record<AgentRole, string> = {
  worker: '#5EEAD4',
  layout: '#FBBF24',
  listening: '#82A2FF',
  naming: '#A78BFA'
};

interface TrailLineProps {
  id: string;
  from: { x: number; y: number; z: number };
  to: { x: number; y: number; z: number };
  startedAt: number;
  agentRole: AgentRole;
}

function TrailLine({ from, to, startedAt, agentRole }: TrailLineProps) {
  const curve = useMemo(() => {
    const a = new Vector3(from.x, from.y, from.z);
    const b = new Vector3(to.x, to.y, to.z);
    // Small arc bulge for visual liveliness (~10% of length, upward).
    const mid = new Vector3().lerpVectors(a, b, 0.5);
    mid.y += a.distanceTo(b) * 0.08;
    return new CatmullRomCurve3([a, mid, b], false, 'catmullrom', 0.4);
  }, [from.x, from.y, from.z, to.x, to.y, to.z]);

  // Animate opacity from 1 → 0 over 2500ms; pulse the end-cap for ~600ms.
  const matRef = useRef<{ opacity: number; needsUpdate: boolean } | null>(null);
  const endRef = useRef<{ scale: { set: (x: number, y: number, z: number) => void } } | null>(null);
  const [, setN] = useState(0);
  useFrame(() => {
    const elapsed = Date.now() - startedAt;
    const t = Math.min(1, elapsed / 2500);
    if (matRef.current) {
      matRef.current.opacity = 0.95 * (1 - t * t);
      matRef.current.needsUpdate = true;
    }
    if (endRef.current) {
      const pulseT = Math.min(1, elapsed / 600);
      const scale = 1 + 1.8 * (1 - Math.abs(1 - 2 * pulseT));
      endRef.current.scale.set(scale, scale, scale);
    }
    if (elapsed % 6 === 0) setN(n => n + 1);
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 18, 0.015, 6, false]} />
        <meshBasicMaterial
          ref={matRef as never}
          color={ROLE_COLOR[agentRole]}
          transparent
          opacity={0.95}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={endRef as never} position={[to.x, to.y, to.z]}>
        <sphereGeometry args={[0.05, 12, 8]} />
        <meshBasicMaterial color={ROLE_COLOR[agentRole]} transparent opacity={0.7} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function ToolCallTrails() {
  const trails = useWorldStore(s => s.toolTrails);
  // Force periodic re-evaluation to drop expired trails from the store.
  const [, force] = useState(0);
  useFrame(() => {
    const now = Date.now();
    const stale = trails.some(t => t.expiresAt < now);
    if (stale && Math.random() < 0.05) force(n => n + 1);
  });
  if (trails.length === 0) return null;
  return (
    <group>
      {trails.map(t => (
        <TrailLine
          key={t.id}
          id={t.id}
          from={t.from}
          to={t.to}
          startedAt={t.startedAt}
          agentRole={t.agentRole}
        />
      ))}
    </group>
  );
}
