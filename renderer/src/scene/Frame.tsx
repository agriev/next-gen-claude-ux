/**
 * Frame — user-intentional grouping of artifacts with an explicit header
 * label and optional accent color. B10 in BACKLOG-v2.md.
 *
 * Different from Cluster (Layout-agent-created semantic group): Frame is
 * user-intentional, has fixed label/color, and is the unit for export
 * ("send this frame to so-and-so") — landing in a later card.
 *
 * Stored as an Artifact with `kind: 'frame'`. Member ids live in
 * `spec.refs`. Accent color is stored as the first element of `spec.tags`
 * (hex #RRGGBB) so we don't need a new column.
 *
 * Renders as a translucent labeled region that auto-sizes to bounding box
 * of its members. Pure R3F: header label via Label.tsx, region via
 * lineSegments. No DOM.
 */
import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box3, Vector3, BoxGeometry, EdgesGeometry, LineBasicMaterial, MeshStandardMaterial, Mesh, Group } from 'three';
import type { Artifact } from '@shared/types';
import { useWorldStore } from '../store/world-store';
import { getLivePos } from './live-transforms';
import { Label } from './text/Label';

interface Props {
  artifact: Artifact;
  /** Dim non-matching frames during filtered view. */
  dimmed?: boolean;
}

const DEFAULT_ACCENT = '#5EEAD4';
const PADDING = 0.5;
const HEIGHT_FLOOR = 1.2;

/**
 * Extract user-chosen accent color from spec.tags[0] if it matches #RRGGBB.
 * Otherwise return default cyan.
 */
function extractAccent(artifact: Artifact): string {
  const first = artifact.spec?.tags?.[0];
  if (first && /^#[0-9A-Fa-f]{6}$/.test(first)) return first;
  return DEFAULT_ACCENT;
}

export function FrameObject({ artifact, dimmed = false }: Props) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const edgesRef = useRef<Mesh>(null);
  const memberIds = useMemo(() => artifact.spec?.refs ?? [], [artifact.spec?.refs]);
  const allArtifacts = useWorldStore(s => s.artifacts);
  const accent = extractAccent(artifact);

  // Track current frame bounding-box so we can resize the mesh in place.
  const [bbox, setBbox] = useState<{ center: [number, number, number]; size: [number, number, number] } | null>(null);

  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const material = useMemo(() => new MeshStandardMaterial({
    color: accent,
    transparent: true,
    opacity: dimmed ? 0.03 : 0.06,
    roughness: 1,
    depthWrite: false
  }), [accent]);
  const edgesGeometry = useMemo(() => new EdgesGeometry(geometry), [geometry]);
  const edgesMaterial = useMemo(() => new LineBasicMaterial({
    color: accent,
    transparent: true,
    opacity: dimmed ? 0.15 : 0.55
  }), [accent]);

  useEffect(() => {
    material.color.set(accent);
    material.opacity = dimmed ? 0.03 : 0.06;
    edgesMaterial.color.set(accent);
    edgesMaterial.opacity = dimmed ? 0.15 : 0.55;
    material.needsUpdate = true;
    edgesMaterial.needsUpdate = true;
  }, [accent, dimmed, material, edgesMaterial]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
    edgesGeometry.dispose();
    edgesMaterial.dispose();
  }, [geometry, material, edgesGeometry, edgesMaterial]);

  // Auto-resize the frame each frame to bounding box of its live members.
  useFrame(() => {
    if (memberIds.length === 0) return;
    const box = new Box3();
    let n = 0;
    for (const id of memberIds) {
      const live = getLivePos(id);
      let p = live;
      if (!p) {
        const a = allArtifacts.get(id);
        if (a?.position) p = new Vector3(a.position.x, a.position.y, a.position.z);
      }
      if (p) { box.expandByPoint(p); n++; }
    }
    if (n === 0) return;
    box.expandByScalar(PADDING);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    size.y = Math.max(size.y, HEIGHT_FLOOR);

    if (groupRef.current) groupRef.current.position.set(center.x, center.y, center.z);
    if (meshRef.current) meshRef.current.scale.set(size.x, size.y, size.z);
    if (edgesRef.current) edgesRef.current.scale.set(size.x, size.y, size.z);
    // We only `setBbox` if size has materially changed to keep labels stable.
    const next = { center: [center.x, center.y, center.z] as [number, number, number], size: [size.x, size.y, size.z] as [number, number, number] };
    if (!bbox
      || Math.abs(bbox.size[1] - next.size[1]) > 0.05) {
      setBbox(next);
    }
  });

  const labelY = (bbox?.size[1] ?? HEIGHT_FLOOR) / 2 + 0.4;

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={geometry} material={material} />
      <lineSegments
        // @ts-expect-error — using Mesh ref for scale on lineSegments works fine in three.js
        ref={edgesRef}
        geometry={edgesGeometry}
        material={edgesMaterial}
      />
      <Label
        position={[0, labelY, 0]}
        color={accent}
        fontSize={0.26}
        outlineWidth={0.018}
        renderOrder={15}
      >
        {`▢ ${artifact.title} · ${memberIds.length}`}
      </Label>
    </group>
  );
}
