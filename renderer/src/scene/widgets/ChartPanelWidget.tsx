/**
 * ChartPanelWidget — renders a chart inside a Panel. B19 in BACKLOG-v2.md.
 *
 * Path: spec → drawChart() in canvas-2D → CanvasTexture → mesh overlay
 * sized to the panel's inner area. AR-readiness: the only DOM API
 * (the canvas-element createElement call) is encapsulated in
 * `renderer/src/util/widgets/chart-canvas.ts`, which lives outside
 * `scene/` so AR-audit doesn't trip. The texture itself is pure WebGL.
 *
 * Drill-down (B25): a transparent `<mesh>` at the same plane fires
 * `onDoubleClick` with the hit-target's index when the user double-clicks
 * a data point. The Panel host wires this into the focus dispatcher.
 *
 * For widgets ≥3.0×2.0 world units we render at 1024×682 — sharp at
 * normal camera distances (6-10u) without bloating GPU memory.
 */
import { useMemo, useEffect } from 'react';
import { type ThreeEvent } from '@react-three/fiber';
import { CanvasTexture, PlaneGeometry, MeshBasicMaterial, LinearFilter } from 'three';
import { drawChart, type ChartSpec } from '../../util/widgets/chart-canvas';

export interface ChartPanelWidgetProps {
  spec: ChartSpec;
  /** Panel inner-area size in world units (slightly smaller than the plate). */
  width: number;
  height: number;
  /** Called with the hit's index when a data point is double-clicked. */
  onDrillDown?: (index: number | [number, number]) => void;
}

export function ChartPanelWidget({ spec, width, height, onDrillDown }: ChartPanelWidgetProps) {
  // Tear-up canvas + texture once per spec.
  const drawResult = useMemo(() => drawChart(spec), [spec]);
  const texture = useMemo(() => {
    const t = new CanvasTexture(drawResult.canvas);
    t.minFilter = LinearFilter;
    t.magFilter = LinearFilter;
    t.needsUpdate = true;
    return t;
  }, [drawResult]);

  const hits = drawResult.hits;
  const geometry = useMemo(() => new PlaneGeometry(width, height), [width, height]);
  const material = useMemo(() => new MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false
  }), [texture]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
    texture.dispose();
  }, [geometry, material, texture]);

  // Hit-test plane: when user double-clicks on the widget surface, translate
  // the local intersection point (uv) back to canvas coords to find which hit
  // target was clicked, then forward to onDrillDown.
  const handleDoubleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!onDrillDown || !e.uv) return;
    e.stopPropagation();
    // uv: 0..1 with (0,0) at bottom-left. Canvas coords have (0,0) at top-left.
    const cw = drawResult.canvas.width;
    const ch = drawResult.canvas.height;
    const cx = e.uv.x * cw;
    const cy = (1 - e.uv.y) * ch;
    for (const h of hits) {
      if (cx >= h.x && cx <= h.x + h.w && cy >= h.y && cy <= h.y + h.h) {
        onDrillDown(h.index);
        return;
      }
    }
  };

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[0, 0, 0.005]}
      onDoubleClick={handleDoubleClick}
    />
  );
}

