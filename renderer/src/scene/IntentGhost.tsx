/**
 * IntentGhost — B04 in BACKLOG-v2.md.
 *
 * Renders translucent "ghost" plates at the positions the Layout agent has
 * PROPOSED but not yet committed. The user can compare ghost-vs-real
 * positions, then accept or reject via LayoutActivityPanel.
 *
 * Visual: a wireframe box at each proposed position (same width/depth as a
 * real plate, half height), tinted cyan, opacity 0.18 with a brighter
 * outline so the eye registers it as "incoming". A small countdown label
 * floats above the centroid showing time-to-auto-commit.
 *
 * AR-readiness: pure R3F (BoxGeometry + EdgesGeometry + Label). No DOM.
 * Ghost plates are rendered AFTER real plates in the scene tree but use
 * `renderOrder` lower than artifacts so depth-write is honored.
 */
import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { BoxGeometry, EdgesGeometry, LineBasicMaterial, MeshStandardMaterial, Group } from 'three';
import type { PendingLayoutPlan } from '@shared/types';
import { useWorldStore } from '../store/world-store';
import { Label } from './text/Label';

const GHOST_COLOR = '#5EEAD4';
/** Plate dimensions match Artifact.tsx PLACEHOLDER_W/H for visual continuity. */
const PLATE_W = 3.0;
const PLATE_H = 1.6;
const PLATE_D = 0.05;
/** Vertical lift so ghost reads as "proposed/not yet placed" vs the real plates. */
const GHOST_Y_OFFSET = 0.0;

interface GhostPlateProps {
  position: [number, number, number];
}

function GhostPlate({ position }: GhostPlateProps) {
  const geometry = useMemo(() => new BoxGeometry(PLATE_W, PLATE_H, PLATE_D), []);
  const edgesGeometry = useMemo(() => new EdgesGeometry(geometry), [geometry]);
  const material = useMemo(() => new MeshStandardMaterial({
    color: GHOST_COLOR,
    transparent: true,
    opacity: 0.18,
    roughness: 1,
    depthWrite: false
  }), []);
  const edgesMaterial = useMemo(() => new LineBasicMaterial({
    color: GHOST_COLOR,
    transparent: true,
    opacity: 0.85
  }), []);

  useEffect(() => () => {
    geometry.dispose();
    edgesGeometry.dispose();
    material.dispose();
    edgesMaterial.dispose();
  }, [geometry, edgesGeometry, material, edgesMaterial]);

  // Gentle breathe so ghost reads as transient/proposed.
  const groupRef = useRef<Group>(null);
  useFrame(() => {
    if (!groupRef.current) return;
    const t = 0.85 + 0.15 * Math.sin(performance.now() * 0.0035);
    edgesMaterial.opacity = 0.55 + 0.35 * t;
  });

  return (
    <group ref={groupRef} position={[position[0], position[1] + GHOST_Y_OFFSET, position[2]]} renderOrder={3}>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgesGeometry} material={edgesMaterial} />
    </group>
  );
}

interface PlanGhostsProps {
  plan: PendingLayoutPlan;
}

function PlanGhosts({ plan }: PlanGhostsProps) {
  // Force a re-render at ~5Hz so the countdown label updates smoothly.
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force(n => n + 1), 200);
    return () => clearInterval(id);
  }, []);
  const remainingSec = Math.max(0, Math.ceil((plan.expiresAt - Date.now()) / 1000));

  // Centroid for the countdown label.
  let cx = 0, cy = 0, cz = 0;
  for (const p of plan.placements) { cx += p.x; cy += p.y; cz += p.z; }
  if (plan.placements.length > 0) {
    cx /= plan.placements.length; cy /= plan.placements.length; cz /= plan.placements.length;
  }

  return (
    <>
      {plan.placements.map(p => (
        <GhostPlate key={`${plan.id}:${p.id}`} position={[p.x, p.y, p.z]} />
      ))}
      <Label
        position={[cx, cy + 2.4, cz]}
        color={GHOST_COLOR}
        fontSize={0.22}
        outlineWidth={0.015}
        renderOrder={20}
      >
        {`◇ ${plan.label} · ${plan.placements.length} cards · ${remainingSec}s`}
      </Label>
    </>
  );
}

/**
 * Top-level component: subscribes to `pendingPlans` and renders one
 * <PlanGhosts/> per pending plan.
 */
export function IntentGhosts() {
  const pendingPlans = useWorldStore(s => s.pendingPlans);
  if (pendingPlans.size === 0) return null;
  return (
    <>
      {[...pendingPlans.values()].map(plan => (
        <PlanGhosts key={plan.id} plan={plan} />
      ))}
    </>
  );
}
