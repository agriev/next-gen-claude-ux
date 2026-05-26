/**
 * Lasso — B27. Alt+drag on empty canvas surface to draw a selection
 * rectangle; on mouseup, every artifact whose world position projects
 * inside the rectangle is added to the selection.
 *
 * Modifier history: shipped V1 with shift+drag but that collides with
 * OrbitControls' shift=pan keymap — both handlers fire, camera pans and
 * the lasso silently fails. Alt is unused by drei OrbitControls, so it's
 * a clean owner for the lasso gesture. Marking-menu uses ctrl+drag, so
 * alt is the only free chord left.
 *
 * Lives at the UI layer (DOM overlay) rather than inside R3F: it needs
 * the camera's projection matrix from R3F, so we read it from a
 * window-exposed Three camera ref captured by the Canvas.
 *
 * The lasso is screen-space rectangular for V1 — true freehand path is
 * a follow-up (B27.2). This already covers the primary "multi-select
 * a cluster of cards visually" use case from the BACKLOG card.
 */
import { useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';
import { useWorldStore } from '../store/world-store';

interface LassoRect {
  x0: number; y0: number; x1: number; y1: number;
}

declare global {
  interface Window {
    __jarvis_camera?: {
      camera: { project: (v: Vector3) => Vector3 };
      width: number;
      height: number;
    };
  }
}

export function Lasso() {
  const [rect, setRect] = useState<LassoRect | null>(null);
  const dragging = useRef<{ x0: number; y0: number } | null>(null);
  const artifacts = useWorldStore(s => s.artifacts);
  const targets = useWorldStore(s => s.targetPositions);
  const setSelected = useWorldStore(s => s.setSelected);

  const setLassoActive = useWorldStore(s => s.setLassoActive);

  // OrbitControls listens for `pointerdown` on its own canvas element, which
  // runs in parallel to (not after) our window `mousedown` handler. The cleanest
  // way to keep them out of each other's way is to flip lassoActive on Alt
  // keydown so OrbitControls re-renders with enableRotate=false BEFORE the
  // user starts the drag. Released on keyup.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Alt') return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      setLassoActive(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== 'Alt') return;
      // Only clear if we're not mid-drag. Otherwise the user lifted alt while
      // still holding the mouse — keep lassoActive until mouseup.
      if (!dragging.current) setLassoActive(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [setLassoActive]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      // Alt (Option on macOS) — see header comment for modifier rationale.
      if (!e.altKey) return;
      if (e.button !== 0) return;
      // Skip if user clicked on UI element (input/button); rough check via tagName.
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'BUTTON' || t.isContentEditable)) return;
      // OrbitControls is already disabled by the keydown→lassoActive flip
      // above, so we just need to start tracking the drag.
      setLassoActive(true);
      dragging.current = { x0: e.clientX, y0: e.clientY };
      setRect({ x0: e.clientX, y0: e.clientY, x1: e.clientX, y1: e.clientY });
    };
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setRect({ x0: dragging.current.x0, y0: dragging.current.y0, x1: e.clientX, y1: e.clientY });
    };
    const onUp = () => {
      if (!dragging.current || !rect) {
        dragging.current = null;
        setRect(null);
        setLassoActive(false);
        return;
      }
      const cam = window.__jarvis_camera;
      if (cam) {
        const left = Math.min(rect.x0, rect.x1);
        const right = Math.max(rect.x0, rect.x1);
        const top = Math.min(rect.y0, rect.y1);
        const bottom = Math.max(rect.y0, rect.y1);
        // Only treat as a lasso if the rect has meaningful area (avoid stray drags).
        if (Math.abs(right - left) > 12 && Math.abs(bottom - top) > 12) {
          const hits = new Set<string>();
          for (const a of artifacts.values()) {
            const p = targets.get(a.id) ?? a.position;
            if (!p) continue;
            const v = new Vector3(p.x, p.y, p.z);
            cam.camera.project(v);
            // NDC [-1..1] → screen pixels
            const sx = (v.x + 1) * 0.5 * cam.width;
            const sy = (1 - v.y) * 0.5 * cam.height;
            if (sx >= left && sx <= right && sy >= top && sy <= bottom) {
              hits.add(a.id);
            }
          }
          if (hits.size > 0) setSelected(hits);
        }
      }
      dragging.current = null;
      setRect(null);
      setLassoActive(false);
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [rect, artifacts, targets, setSelected, setLassoActive]);

  if (!rect) return null;
  const left = Math.min(rect.x0, rect.x1);
  const top = Math.min(rect.y0, rect.y1);
  const width = Math.abs(rect.x1 - rect.x0);
  const height = Math.abs(rect.y1 - rect.y0);
  if (width < 4 || height < 4) return null;
  return (
    <div style={{
      position: 'fixed',
      left, top, width, height,
      border: '1.5px solid #5EEAD4',
      background: 'rgba(94, 234, 212, 0.10)',
      pointerEvents: 'none',
      zIndex: 95,
      borderRadius: 2
    }}>
      <span style={{
        position: 'absolute',
        bottom: -22,
        right: 0,
        fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace',
        color: '#5EEAD4',
        background: 'rgba(20, 22, 27, 0.8)',
        padding: '2px 6px',
        borderRadius: 3
      }}>Alt+drag lasso</span>
    </div>
  );
}
