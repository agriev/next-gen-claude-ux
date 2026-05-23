/**
 * FlowPanelWidget — renders a Mermaid / PlantUML diagram on a Panel. B20.
 *
 * For V1 we support PlantUML via the existing kroki-style PNG URL
 * (plantuml.com server, already used by Inspector). We fetch the PNG via
 * `Image` element, then blit it into a 2D canvas → CanvasTexture → mesh.
 *
 * Mermaid path is sketched but disabled in V1: it requires bundling the
 * mermaid library (~250 KB gzipped) for SVG rendering, then SVG→canvas. We
 * land a placeholder with the source preview instead and leave a TODO.
 *
 * AR-readiness: same pattern as ChartPanelWidget — DOM use is one
 * `new Image()` here (allowed: Image is part of the WebXR runtime) and
 * one canvas-element createElement call in chart-canvas helpers.
 * No drei Html portal used.
 *
 * Drill-down (B25): the renderer doesn't know per-node hit targets for
 * PlantUML (the PNG is opaque). A future card can parse the @startuml
 * source to extract activity nodes and overlay invisible R3F hit-rects.
 * For V1 a single `onDoubleClick` on the panel surface fires onDrillDown
 * with index=0 — the parent decides what artifact to focus.
 */
import { useMemo, useEffect, useState } from 'react';
import { CanvasTexture, PlaneGeometry, MeshBasicMaterial, LinearFilter } from 'three';
import { type ThreeEvent } from '@react-three/fiber';
import { Label } from '../text/Label';
import { fetchPlantUmlPanelCanvas } from '../../util/widgets/flow-fetch';

export type FlowSpec =
  | { kind: 'plantuml'; source: string }
  | { kind: 'mermaid'; source: string };

export interface FlowPanelWidgetProps {
  spec: FlowSpec;
  width: number;
  height: number;
  onDrillDown?: () => void;
}

export function FlowPanelWidget({ spec, width, height, onDrillDown }: FlowPanelWidgetProps) {
  const [texture, setTexture] = useState<CanvasTexture | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'mermaid-stub'>('loading');

  useEffect(() => {
    if (spec.kind === 'mermaid') {
      // V1 stub. TODO: bundle mermaid → SVG → canvas → texture.
      setStatus('mermaid-stub');
      return;
    }
    const signal = { aborted: false };
    fetchPlantUmlPanelCanvas(spec.source, { signal })
      .then(({ canvas }) => {
        if (signal.aborted) return;
        const tex = new CanvasTexture(canvas);
        tex.minFilter = LinearFilter;
        tex.magFilter = LinearFilter;
        tex.needsUpdate = true;
        setTexture(tex);
        setStatus('ready');
      })
      .catch(err => {
        if (!signal.aborted && err.message !== 'aborted') setStatus('error');
      });
    return () => { signal.aborted = true; };
  }, [spec]);

  const geometry = useMemo(() => new PlaneGeometry(width, height), [width, height]);
  const material = useMemo(() => new MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    opacity: texture ? 1 : 0
  }), [texture]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
    texture?.dispose();
  }, [geometry, material, texture]);

  const handleDoubleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!onDrillDown) return;
    e.stopPropagation();
    onDrillDown();
  };

  // Status overlay
  const statusText =
    status === 'loading'    ? 'rendering diagram…' :
    status === 'error'      ? 'diagram fetch failed (check network)' :
    status === 'mermaid-stub' ? 'mermaid widget — landing in B20.2' :
    null;

  return (
    <group>
      {texture && (
        <mesh
          geometry={geometry}
          material={material}
          position={[0, 0, 0.005]}
          onDoubleClick={handleDoubleClick}
        />
      )}
      {statusText && (
        <Label
          position={[0, 0, 0.01]}
          color={status === 'error' ? '#F87171' : '#9CA3AF'}
          fontSize={0.14}
          outlineWidth={0.01}
          renderOrder={12}
        >
          {statusText}
        </Label>
      )}
    </group>
  );
}
