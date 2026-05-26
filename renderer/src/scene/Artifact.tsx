import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html, Billboard } from '@react-three/drei';
import { Group, Vector2, Vector3, Plane, Raycaster } from 'three';
import type { Artifact } from '@shared/types';
import { makeCardTexture } from './card-texture';
import { useWorldStore } from '../store/world-store';
import { setLivePos, removeLivePos, getLivePos } from './live-transforms';
import type { CameraController } from './camera/CameraController';
import { Label } from './text/Label';

interface Props {
  artifact: Artifact;
  targetPosition?: { x: number; y: number; z: number };
  selected: boolean;
  dimmed?: boolean;
  onSelect: (id: string, additive: boolean) => void;
}

const STATE_RIM: Record<Artifact['state'], string | null> = {
  streaming: '#5EEAD4',
  ready: null,
  updating: '#5EEAD4',
  error: '#FB7185',
  'awaiting-input': '#FBBF24'
};

const PLATE_W = 3.2;
const PLATE_H = 2.0;
const PLATE_D = 0.08;

const DRAG_THRESHOLD_SQ = 25; // 5px

export function ArtifactObject({ artifact, targetPosition, selected, dimmed = false, onSelect }: Props) {
  const groupRef = useRef<Group>(null);
  const camera = useThree(s => s.camera);
  const controls = useThree(s => s.controls) as CameraController | null;
  const gl = useThree(s => s.gl);

  const target = useMemo(
    () => new Vector3(targetPosition?.x ?? 0, targetPosition?.y ?? 1, targetPosition?.z ?? 0),
    [targetPosition?.x, targetPosition?.y, targetPosition?.z]
  );

  const cardTexture = useMemo(
    () => makeCardTexture(artifact),
    [
      artifact.id,
      artifact.kind,
      artifact.title,
      artifact.shortName,
      artifact.body,
      artifact.state,
      artifact.spec?.summary
    ]
  );

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(target);
      const p = groupRef.current.position;
      setLivePos(artifact.id, p.x, p.y, p.z);
    }
    return () => removeLivePos(artifact.id);
  }, [artifact.id]);

  useEffect(() => () => cardTexture.dispose(), [cardTexture]);

  const [dragging, setDragging] = useState(false);
  const planeRef = useRef(new Plane());
  const offsetRef = useRef(new Vector3());
  const lastPosRef = useRef(new Vector3());
  const raycasterRef = useRef(new Raycaster());

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    const p = groupRef.current.position;
    if (!dragging) {
      const dist = p.distanceTo(target);
      if (dist > 30) {
        p.copy(target);
      } else if (dist > 0.001) {
        const k = Math.min(dt * (artifact.pinned ? 12 : 6), 1);
        p.lerp(target, k);
      }
    }
    setLivePos(artifact.id, p.x, p.y, p.z);
  });

  // Single-source pointer-down handler that decides click-vs-drag by movement threshold.
  const handlePointerDown = (ev: ThreeEvent<PointerEvent>) => {
    ev.stopPropagation();
    // B11 — alt+click opens the radial marking menu at the cursor position.
    // We branch before the click-vs-drag heuristic so alt doesn't accidentally
    // trigger a drag-to-move when the user moves their mouse slightly.
    if (ev.altKey) {
      useWorldStore.getState().openMarkingMenu(artifact.id, ev.clientX, ev.clientY);
      return;
    }
    const startClientX = ev.clientX;
    const startClientY = ev.clientY;
    const additive = ev.shiftKey;
    const canDrag = ev.shiftKey || ev.metaKey || ev.ctrlKey;

    let dragStarted = false;
    const ndc = new Vector2();
    const canvas = gl.domElement;

    const computeHit = (clientX: number, clientY: number, out: Vector3): boolean => {
      const rect = canvas.getBoundingClientRect();
      ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(ndc, camera);
      return !!raycasterRef.current.ray.intersectPlane(planeRef.current, out);
    };

    const beginDrag = () => {
      if (!groupRef.current) return;
      const normal = new Vector3();
      camera.getWorldDirection(normal);
      normal.negate();
      planeRef.current.setFromNormalAndCoplanarPoint(normal, groupRef.current.position);
      const initialHit = new Vector3();
      if (computeHit(startClientX, startClientY, initialHit)) {
        offsetRef.current.copy(groupRef.current.position).sub(initialHit);
      } else {
        offsetRef.current.set(0, 0, 0);
      }
      lastPosRef.current.copy(groupRef.current.position);
      if (controls) controls.enabled = false;
      dragStarted = true;
      setDragging(true);
    };

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - startClientX;
      const dy = e.clientY - startClientY;
      if (!dragStarted) {
        if (canDrag && (dx * dx + dy * dy) > DRAG_THRESHOLD_SQ) {
          beginDrag();
        } else {
          return;
        }
      }
      if (dragStarted && groupRef.current) {
        const hit = new Vector3();
        if (computeHit(e.clientX, e.clientY, hit)) {
          groupRef.current.position.copy(hit).add(offsetRef.current);
        }
      }
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onUp, true);

      if (!dragStarted) {
        onSelect(artifact.id, additive);
        return;
      }
      if (groupRef.current) {
        const pos = groupRef.current.position;
        if (pos.distanceTo(lastPosRef.current) > 0.05) {
          void window.api.moveArtifact(artifact.id, { x: pos.x, y: pos.y, z: pos.z });
        }
      }
      if (controls) controls.enabled = true;
      setDragging(false);
    };

    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('pointerup', onUp, true);
    window.addEventListener('pointercancel', onUp, true);
  };

  const handleDoubleClick = (ev: ThreeEvent<MouseEvent>) => {
    ev.stopPropagation();
    // B24 — clusters dive-in on double-click (camera flies to fit cluster
    // members). All other artifact kinds open Inspector as before.
    if (artifact.kind === 'cluster') {
      useWorldStore.getState().diveTo(artifact.id);
    } else {
      useWorldStore.getState().setInspectorArtifact(artifact.id);
    }
  };

  const rim = STATE_RIM[artifact.state];
  const isCluster = artifact.kind === 'cluster';

  if (isCluster) {
    return <ClusterMesh artifact={artifact} groupRef={groupRef} selected={selected} dimmed={dimmed}
                        handlePointerDown={handlePointerDown} handleDoubleClick={handleDoubleClick} />;
  }

  return (
    <group ref={groupRef}>
      <Billboard follow lockX lockZ>
        <mesh
          onPointerDown={handlePointerDown}
          onDoubleClick={handleDoubleClick}
        >
          <boxGeometry args={[PLATE_W, PLATE_H, PLATE_D]} />
          <meshStandardMaterial attach="material-0" color="#1A1D22" roughness={0.7} metalness={0.1} />
          <meshStandardMaterial attach="material-1" color="#1A1D22" roughness={0.7} metalness={0.1} />
          <meshStandardMaterial attach="material-2" color="#1A1D22" roughness={0.7} metalness={0.1} />
          <meshStandardMaterial attach="material-3" color="#1A1D22" roughness={0.7} metalness={0.1} />
          <meshStandardMaterial
            attach="material-4"
            map={cardTexture}
            roughness={0.55}
            metalness={0.05}
            transparent={artifact.state === 'streaming' || dimmed}
            opacity={dimmed ? 0.12 : (artifact.state === 'streaming' ? 0.85 : 1)}
          />
          <meshStandardMaterial attach="material-5" color="#0F1014" roughness={0.7} metalness={0.05} />
        </mesh>

        {(rim || selected || artifact.pinned || dragging) && (
          <mesh>
            <boxGeometry args={[PLATE_W + 0.08, PLATE_H + 0.08, PLATE_D + 0.005]} />
            <meshBasicMaterial
              color={dragging ? '#FBBF24' : (selected ? '#5EEAD4' : artifact.pinned ? '#FBBF24' : (rim ?? '#5EEAD4'))}
              wireframe
              transparent
              opacity={dragging ? 1 : (selected ? 0.95 : artifact.pinned ? 0.7 : 0.55)}
            />
          </mesh>
        )}
      </Billboard>

      <Html
        position={[0, PLATE_H / 2 + 0.22, 0]}
        center
        distanceFactor={10}
        zIndexRange={[12, 0]}
        style={{ pointerEvents: 'auto', userSelect: 'none' }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: '#E8EAED',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          textShadow: '0 1px 4px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.85)',
          whiteSpace: 'nowrap',
          letterSpacing: 0.2
        }}>
          {artifact.pinned && (
            <button
              onClick={(e) => { e.stopPropagation(); void window.api.unpinArtifact(artifact.id); }}
              title="Pinned — click to unpin (or press P with this card selected)"
              style={{
                background: 'rgba(251,191,36,0.18)',
                border: '1px solid #FBBF24',
                color: '#FBBF24',
                fontSize: 11,
                lineHeight: 1,
                padding: '2px 6px',
                borderRadius: 999,
                cursor: 'pointer',
                fontFamily: 'inherit',
                pointerEvents: 'auto'
              }}
            >📌 pinned</button>
          )}
          <span>@{artifact.shortName}</span>
        </div>
      </Html>
    </group>
  );
}

interface ClusterMeshProps {
  artifact: Artifact;
  groupRef: React.RefObject<Group>;
  selected: boolean;
  dimmed: boolean;
  handlePointerDown: (e: ThreeEvent<PointerEvent>) => void;
  handleDoubleClick: (e: ThreeEvent<MouseEvent>) => void;
}

function ClusterMesh({ artifact, groupRef, selected, dimmed, handlePointerDown, handleDoubleClick }: ClusterMeshProps) {
  const refs = useMemo(() => artifact.spec?.refs ?? [], [artifact.spec?.refs]);
  const sizeRef = useRef<{ w: number; h: number; d: number }>({ w: 6, h: 4, d: 6 });
  const tint = artifact.spec?.tags?.[0] ? hashColor(artifact.spec.tags[0]) : '#A78BFA';

  // Re-compute box size each frame to wrap members
  useFrame(() => {
    if (refs.length === 0) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    let count = 0;
    for (const id of refs) {
      const p = getLivePos(id);
      if (!p) continue;
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
      if (p.z < minZ) minZ = p.z; if (p.z > maxZ) maxZ = p.z;
      count++;
    }
    if (count === 0 || !groupRef.current) return;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const cz = (minZ + maxZ) / 2;
    groupRef.current.position.set(cx, cy, cz);
    sizeRef.current.w = Math.max(4, maxX - minX + 4);
    sizeRef.current.h = Math.max(3, maxY - minY + 3);
    sizeRef.current.d = Math.max(4, maxZ - minZ + 4);
    setLivePos(artifact.id, cx, cy, cz);
  });

  const { w, h, d } = sizeRef.current;
  const PLACEHOLDER_W = w;
  const PLACEHOLDER_H = h;
  const PLACEHOLDER_D = d;

  return (
    <group ref={groupRef}>
      <mesh
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
      >
        <boxGeometry args={[PLACEHOLDER_W, PLACEHOLDER_H, PLACEHOLDER_D]} />
        <meshBasicMaterial color={tint} transparent opacity={dimmed ? 0.04 : (selected ? 0.18 : 0.10)} depthWrite={false} />
      </mesh>
      <mesh>
        <boxGeometry args={[PLACEHOLDER_W, PLACEHOLDER_H, PLACEHOLDER_D]} />
        <meshBasicMaterial color={tint} wireframe transparent opacity={selected ? 0.9 : 0.45} />
      </mesh>

      {/* AR-ready label via troika SDF text (replaces Html overlay). */}
      <Label
        position={[0, PLACEHOLDER_H / 2 + 0.4, 0]}
        color={tint}
        fontSize={0.24}
        outlineWidth={0.018}
        renderOrder={14}
      >
        {`◇ ${artifact.title} · ${refs.length}`}
      </Label>
    </group>
  );
}

const COLOR_PALETTE = ['#A78BFA', '#5EEAD4', '#FBBF24', '#FB7185', '#60A5FA', '#34D399', '#F472B6'];
function hashColor(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return COLOR_PALETTE[Math.abs(h) % COLOR_PALETTE.length];
}
