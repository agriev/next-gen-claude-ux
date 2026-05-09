import { useEffect, useMemo } from 'react';
import { Canvas as R3FCanvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box3, Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useWorldStore } from '../store/world-store';
import { ArtifactObject } from './Artifact';
import { EdgeObject } from './Edge';
import type { Artifact } from '@shared/types';

function CameraFitter() {
  const camera = useThree(s => s.camera) as unknown as { position: Vector3; updateProjectionMatrix: () => void; fov?: number };
  const controls = useThree(s => s.controls) as OrbitControlsImpl | null;
  const targets = useWorldStore(s => s.targetPositions);
  const artifacts = useWorldStore(s => s.artifacts);
  const frameAllAt = useWorldStore(s => s.frameAllAt);
  const autoFramedOnce = useWorldStore(s => s.autoFramedOnce);
  const markAutoFramed = useWorldStore(s => s.markAutoFramed);
  const jumpToBookmarkAt = useWorldStore(s => s.jumpToBookmarkAt);
  const bookmarks = useWorldStore(s => s.bookmarks);
  const cameraMode = useWorldStore(s => s.cameraMode);
  const selectedIds = useWorldStore(s => s.selectedIds);

  const fitToPositions = (positions: Vector3[]) => {
    if (!controls || positions.length === 0) return;
    const box = new Box3();
    for (const p of positions) box.expandByPoint(p);
    box.expandByScalar(2);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera.fov ?? 50) * (Math.PI / 180);
    const distance = Math.max(6, maxDim / (2 * Math.tan(fov / 2)) * 1.05);
    const dir = cameraMode === 'top-down'
      ? new Vector3(0, 1, 0.0001).normalize()
      : new Vector3(0.05, 0.18, 1).normalize();
    const newPos = new Vector3().copy(center).addScaledVector(dir, distance);
    camera.position.copy(newPos);
    camera.updateProjectionMatrix();
    controls.target.copy(center);
    controls.update();
  };

  const fitAll = () => {
    if (!controls) return;
    // If single selection, focus on it; otherwise fit all visible
    const sel = [...selectedIds];
    let positions: Vector3[];
    if (sel.length === 1) {
      const id = sel[0];
      const p = targets.get(id) ?? artifacts.get(id)?.position;
      if (p) positions = [new Vector3(p.x, p.y, p.z)];
      else return;
    } else {
      positions = [];
      for (const a of artifacts.values()) {
        const p = targets.get(a.id) ?? a.position;
        if (p) positions.push(new Vector3(p.x, p.y, p.z));
      }
    }
    fitToPositions(positions);
  };

  useEffect(() => {
    if (frameAllAt > 0) fitAll();
  }, [frameAllAt]);

  useEffect(() => {
    if (autoFramedOnce) return;
    if (!controls) return;
    if (artifacts.size === 0) return;
    const id = setTimeout(() => {
      fitAll();
      markAutoFramed();
    }, 150);
    return () => clearTimeout(id);
  }, [controls, artifacts.size, autoFramedOnce]);

  // Jump to bookmark
  useEffect(() => {
    if (!jumpToBookmarkAt || !controls) return;
    const bm = bookmarks.get(jumpToBookmarkAt.slot);
    if (!bm) return;
    camera.position.set(bm.eye.x, bm.eye.y, bm.eye.z);
    camera.updateProjectionMatrix();
    controls.target.set(bm.target.x, bm.target.y, bm.target.z);
    controls.update();
  }, [jumpToBookmarkAt?.ts, controls]);

  // Switch camera projection on mode change — for now reframe with new dir
  useEffect(() => {
    if (!controls || artifacts.size === 0) return;
    fitAll();
  }, [cameraMode]);

  return null;
}

function CameraFocusReporter() {
  const camera = useThree(s => s.camera);
  const controls = useThree(s => s.controls) as OrbitControlsImpl | null;

  useFrame(() => {
    if (!controls) return;
    const eye = camera.position;
    const tgt = controls.target;
    const now = performance.now();
    const last = (window as unknown as { __lastCamSent?: number }).__lastCamSent ?? 0;
    if (now - last < 250) return;
    (window as unknown as { __lastCamSent?: number }).__lastCamSent = now;
    void window.api.updateCameraFocus(
      { x: tgt.x, y: tgt.y, z: tgt.z },
      { x: eye.x, y: eye.y, z: eye.z }
    );
  });

  return null;
}

function BookmarkCapture() {
  const camera = useThree(s => s.camera);
  const controls = useThree(s => s.controls) as OrbitControlsImpl | null;

  useEffect(() => {
    const handler = async (e: Event) => {
      const detail = (e as CustomEvent).detail as { slot: number };
      if (!controls) return;
      const eye = camera.position;
      const tgt = controls.target;
      await window.api.saveBookmark(detail.slot, { x: tgt.x, y: tgt.y, z: tgt.z }, { x: eye.x, y: eye.y, z: eye.z });
    };
    window.addEventListener('jarvis:save-bookmark', handler);
    return () => window.removeEventListener('jarvis:save-bookmark', handler);
  }, [controls]);

  return null;
}

function matchesFilters(a: Artifact, filters: ReturnType<typeof useWorldStore.getState>['filters']): boolean {
  if (filters.kinds.size > 0 && !filters.kinds.has(a.kind)) return false;
  if (filters.tags.size > 0) {
    const matchTag = a.tags.some(t => filters.tags.has(t));
    if (!matchTag) return false;
  }
  if (filters.pinnedOnly && !a.pinned) return false;
  if (filters.query) {
    const q = filters.query.toLowerCase();
    const hay = `${a.title} ${a.shortName} ${a.body} ${a.tags.join(' ')}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function Canvas() {
  const artifacts = useWorldStore(s => s.artifacts);
  const edges = useWorldStore(s => s.edges);
  const targets = useWorldStore(s => s.targetPositions);
  const selected = useWorldStore(s => s.selectedIds);
  const setSelected = useWorldStore(s => s.setSelected);
  const filters = useWorldStore(s => s.filters);
  const focusedId = useWorldStore(s => s.focusedArtifactId);
  const cameraMode = useWorldStore(s => s.cameraMode);

  const filtersActive = filters.kinds.size > 0 || filters.tags.size > 0 || filters.pinnedOnly || filters.query.length > 0;
  const dimmed = useMemo(() => {
    if (!filtersActive && !focusedId) return new Set<string>();
    const dim = new Set<string>();
    for (const a of artifacts.values()) {
      const filterOk = !filtersActive || matchesFilters(a, filters);
      const focusOk = !focusedId || a.id === focusedId;
      if (!filterOk || !focusOk) dim.add(a.id);
    }
    return dim;
  }, [artifacts, filters, focusedId, filtersActive]);

  const handleSelect = (id: string, additive: boolean) => {
    if (additive) {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id); else next.add(id);
      setSelected(next);
    } else {
      setSelected(new Set([id]));
    }
  };

  const clearSelection = () => {
    const state = useWorldStore.getState();
    if (selected.size > 0) setSelected(new Set());
    if (state.selectedEdgeId) state.setSelectedEdge(null);
  };

  return (
    <R3FCanvas
      orthographic={cameraMode === 'top-down'}
      camera={cameraMode === 'top-down'
        ? { position: [0, 30, 0.001], zoom: 30, near: 0.1, far: 200 }
        : { position: [0, 6, 16], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      onPointerMissed={clearSelection}
    >
      <color attach="background" args={['#0A0B0E']} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[10, 14, 8]} intensity={0.65} />
      <directionalLight position={[-8, 4, -6]} intensity={0.25} color="#5EEAD4" />
      <gridHelper args={[60, 60, '#1F2228', '#15171C']} position={[0, -2, 0]} />

      {[...artifacts.values()].map(a => (
        <ArtifactObject
          key={a.id}
          artifact={a}
          targetPosition={targets.get(a.id)}
          selected={selected.has(a.id)}
          dimmed={dimmed.has(a.id)}
          onSelect={handleSelect}
        />
      ))}

      {[...edges.values()].map(e => {
        const src = artifacts.get(e.src);
        const dst = artifacts.get(e.dst);
        if (!src || !dst) return null;
        const highlighted = selected.has(e.src) || selected.has(e.dst);
        const dim = dimmed.has(e.src) || dimmed.has(e.dst);
        return <EdgeObject key={e.id} edge={e} source={src} target={dst} highlighted={highlighted} dimmed={dim} />;
      })}

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enableRotate={cameraMode !== 'top-down'}
      />
      <CameraFitter />
      <CameraFocusReporter />
      <BookmarkCapture />
    </R3FCanvas>
  );
}
