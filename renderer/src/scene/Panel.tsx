/**
 * Panel — 2D rectangular surface in 3D that hosts a widget (chart / flow /
 * timeline / graph-3d). B17 in BACKLOG-v2.md.
 *
 * In this card we land the primitive itself: a R3F mesh-native plane with a
 * title label and a "no widget yet" placeholder. Concrete widgets arrive in
 * B19 (chart), B20 (flow), B22 (timeline), B23 (graph-3d).
 *
 * AR-readiness: pure R3F. No DOM. The title is rendered via Label.tsx (SDF
 * text). The panel is always billboarded to z+ in this milestone — anchor
 * mode is plumbed through the schema for later (`anchor: 'world' | 'desk'
 * | 'head' | 'hand'`) without a migration.
 */
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshStandardMaterial, PlaneGeometry, EdgesGeometry, LineBasicMaterial, Group } from 'three';
import type { Panel as PanelData } from '@shared/types';
import { Label } from './text/Label';
import { WidgetDispatcher } from './widgets';

interface Props {
  panel: PanelData;
  selected?: boolean;
  dimmed?: boolean;
}

const PLATE_COLOR = '#11131A';
const PLATE_BORDER = '#2A2D34';
const PLATE_BORDER_SELECTED = '#5EEAD4';

export function PanelObject({ panel, selected = false, dimmed = false }: Props) {
  const groupRef = useRef<Group>(null);

  const geometry = useMemo(() => new PlaneGeometry(panel.size.w, panel.size.h), [panel.size.w, panel.size.h]);
  const material = useMemo(() => new MeshStandardMaterial({
    color: PLATE_COLOR,
    transparent: true,
    opacity: dimmed ? 0.2 : 0.92,
    roughness: 0.85,
    metalness: 0.05
  }), []);

  const edgesGeometry = useMemo(() => new EdgesGeometry(geometry), [geometry]);
  const edgesMaterial = useMemo(() => new LineBasicMaterial({
    color: selected ? PLATE_BORDER_SELECTED : PLATE_BORDER,
    transparent: true,
    opacity: dimmed ? 0.3 : 1
  }), []);

  useEffect(() => {
    material.opacity = dimmed ? 0.2 : 0.92;
    material.needsUpdate = true;
    edgesMaterial.color.set(selected ? PLATE_BORDER_SELECTED : PLATE_BORDER);
    edgesMaterial.opacity = dimmed ? 0.3 : 1;
    edgesMaterial.needsUpdate = true;
  }, [dimmed, selected, material, edgesMaterial]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
    edgesGeometry.dispose();
    edgesMaterial.dispose();
  }, [geometry, material, edgesGeometry, edgesMaterial]);

  // Live position from server: snap rather than animate for now; spring-easing
  // can land in a follow-up.
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(panel.position.x, panel.position.y, panel.position.z);
    if (panel.rotation) {
      groupRef.current.rotation.set(panel.rotation.x, panel.rotation.y, panel.rotation.z);
    }
  });

  // Title bar: positioned at the top inner edge.
  const TITLE_BAR = 0.32;
  const titleY = panel.size.h / 2 - 0.14;
  const widgetKind = panel.widget.kind;
  const innerW = panel.size.w - 0.2;
  const innerH = panel.size.h - TITLE_BAR;
  // Widget origin: shifted down by half the title-bar so the content area
  // sits beneath the title without overlapping it.
  const widgetCenterY = -TITLE_BAR / 2;

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgesGeometry} material={edgesMaterial} />
      <Label
        position={[-panel.size.w / 2 + 0.18, titleY, 0.01]}
        anchorX="left"
        anchorY="middle"
        fontSize={0.18}
        color={selected ? '#5EEAD4' : '#E8EAED'}
        outlineWidth={0.012}
        renderOrder={11}
      >
        {panel.title}
      </Label>
      {widgetKind === 'empty' ? (
        <Label
          position={[0, 0, 0.01]}
          anchorX="center"
          anchorY="middle"
          fontSize={0.12}
          color="#6B7280"
          outlineWidth={0.008}
          renderOrder={11}
        >
          (empty panel — attach_widget to populate)
        </Label>
      ) : (
        <group position={[0, widgetCenterY, 0]}>
          <WidgetDispatcher panel={panel} innerW={innerW} innerH={innerH} />
        </group>
      )}
    </group>
  );
}
