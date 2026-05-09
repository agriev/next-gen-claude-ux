import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { BufferGeometry, BufferAttribute, Vector3, Line, LineBasicMaterial, Group } from 'three';
import type { Edge as EdgeData, Artifact, EdgeKind } from '@shared/types';
import { getLivePos } from './live-transforms';
import { useWorldStore } from '../store/world-store';

const EDGE_COLOR: Record<EdgeData['kind'], string> = {
  derives: '#5EEAD4',
  references: '#8A8F98',
  contradicts: '#FBBF24',
  'groups-with': '#A78BFA'
};

const EDGE_KIND_LABEL: Record<EdgeData['kind'], string> = {
  derives: 'derives',
  references: 'refs',
  contradicts: '⚡ contradicts',
  'groups-with': 'groups'
};

const EDGE_KINDS: EdgeKind[] = ['derives', 'references', 'contradicts', 'groups-with'];

interface Props {
  edge: EdgeData;
  source: Artifact;
  target: Artifact;
  highlighted: boolean;
  dimmed?: boolean;
}

const SAMPLES = 40;
const STIFFNESS = 22;
const DAMPING_HZ = 5.5;
const SAG = -1.6;
const PLATE_HALF_W = 1.6;

export function EdgeObject({ edge, source, target, highlighted, dimmed = false }: Props) {
  const lineRef = useRef<Line | null>(null);
  const labelGroupRef = useRef<Group>(null);

  const selectedEdgeId = useWorldStore(s => s.selectedEdgeId);
  const setSelectedEdge = useWorldStore(s => s.setSelectedEdge);
  const selected = selectedEdgeId === edge.id;

  const positions = useMemo(() => new Float32Array(SAMPLES * 3), []);
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(positions, 3));
    g.setDrawRange(0, SAMPLES);
    return g;
  }, [positions]);

  const material = useMemo(() => new LineBasicMaterial({
    color: EDGE_COLOR[edge.kind],
    transparent: true,
    opacity: dimmed ? 0.1 : (highlighted ? 1 : 0.45),
    depthWrite: false
  }), [edge.kind]);

  useEffect(() => {
    if (selected) {
      material.color.set('#E8EAED'); // bright white when selected
      material.opacity = 1;
    } else {
      material.color.set(EDGE_COLOR[edge.kind]);
      material.opacity = dimmed ? 0.1 : (highlighted ? 1 : 0.45);
    }
    material.needsUpdate = true;
  }, [highlighted, dimmed, material, edge.kind, selected]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  // Spring physics
  const ctrl1 = useRef(new Vector3());
  const ctrl2 = useRef(new Vector3());
  const ctrl1Vel = useRef(new Vector3());
  const ctrl2Vel = useRef(new Vector3());
  const initialized = useRef(false);

  const tmpA = useMemo(() => new Vector3(), []);
  const tmpB = useMemo(() => new Vector3(), []);
  const tmpForce = useMemo(() => new Vector3(), []);
  const tmpStart = useMemo(() => new Vector3(), []);
  const tmpEnd = useMemo(() => new Vector3(), []);

  useFrame((_, dt) => {
    const live1 = getLivePos(edge.src);
    const live2 = getLivePos(edge.dst);
    const sp = live1 ?? (source.position
      ? tmpStart.set(source.position.x, source.position.y, source.position.z)
      : tmpStart.set(0, 1, 0));
    const dp = live2 ?? (target.position
      ? tmpEnd.set(target.position.x, target.position.y, target.position.z)
      : tmpEnd.set(0, 1, 0));

    const dx = dp.x - sp.x;
    const dz = dp.z - sp.z;
    const horizDist = Math.hypot(dx, dz);
    const ux = horizDist > 1e-4 ? dx / horizDist : 0;
    const uz = horizDist > 1e-4 ? dz / horizDist : 0;

    const startX = sp.x + ux * PLATE_HALF_W * 0.7;
    const startY = sp.y;
    const startZ = sp.z + uz * PLATE_HALF_W * 0.7;
    const endX = dp.x - ux * PLATE_HALF_W * 0.7;
    const endY = dp.y;
    const endZ = dp.z - uz * PLATE_HALF_W * 0.7;

    tmpA.set(
      startX * 0.66 + endX * 0.34,
      (startY + endY) * 0.5 + SAG,
      startZ * 0.66 + endZ * 0.34
    );
    tmpB.set(
      startX * 0.34 + endX * 0.66,
      (startY + endY) * 0.5 + SAG,
      startZ * 0.34 + endZ * 0.66
    );

    if (!initialized.current) {
      ctrl1.current.copy(tmpA);
      ctrl2.current.copy(tmpB);
      ctrl1Vel.current.set(0, 0, 0);
      ctrl2Vel.current.set(0, 0, 0);
      initialized.current = true;
    } else {
      const dampFactor = Math.exp(-DAMPING_HZ * dt);
      tmpForce.copy(tmpA).sub(ctrl1.current).multiplyScalar(STIFFNESS * dt);
      ctrl1Vel.current.add(tmpForce).multiplyScalar(dampFactor);
      ctrl1.current.addScaledVector(ctrl1Vel.current, dt);

      tmpForce.copy(tmpB).sub(ctrl2.current).multiplyScalar(STIFFNESS * dt);
      ctrl2Vel.current.add(tmpForce).multiplyScalar(dampFactor);
      ctrl2.current.addScaledVector(ctrl2Vel.current, dt);
    }

    const c1 = ctrl1.current;
    const c2 = ctrl2.current;

    let midX = 0, midY = 0, midZ = 0;
    for (let i = 0; i < SAMPLES; i++) {
      const u = i / (SAMPLES - 1);
      const omu = 1 - u;
      const a = omu * omu * omu;
      const b = 3 * omu * omu * u;
      const c = 3 * omu * u * u;
      const d = u * u * u;
      const x = a * startX + b * c1.x + c * c2.x + d * endX;
      const y = a * startY + b * c1.y + c * c2.y + d * endY;
      const z = a * startZ + b * c1.z + c * c2.z + d * endZ;
      const idx = i * 3;
      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = z;
      if (i === Math.floor(SAMPLES / 2)) {
        midX = x; midY = y; midZ = z;
      }
    }
    const attr = geometry.attributes.position as BufferAttribute;
    attr.needsUpdate = true;

    if (labelGroupRef.current) {
      labelGroupRef.current.position.set(midX, midY + 0.1, midZ);
    }
  });

  const labelText = edge.label || EDGE_KIND_LABEL[edge.kind];
  const accentColor = selected ? '#E8EAED' : EDGE_COLOR[edge.kind];
  const showLabel = !dimmed;

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEdge(selected ? null : edge.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    void window.api.deleteEdge(edge.id);
    setSelectedEdge(null);
  };

  const handleChangeKind = (kind: EdgeKind) => {
    void window.api.updateEdge(edge.id, { kind });
  };

  return (
    <>
      <primitive object={makeLine(geometry, material, lineRef)} />
      {showLabel && (
        <group ref={labelGroupRef}>
          <Html
            center
            distanceFactor={14}
            zIndexRange={[6, 0]}
            style={{ userSelect: 'none' }}
          >
            <div
              onClick={handleLabelClick}
              onPointerDown={e => e.stopPropagation()}
              style={{
                padding: selected ? '2px 8px' : '1px 6px',
                background: selected ? 'rgba(20,22,28,0.95)' : 'rgba(10,11,14,0.85)',
                border: `1px solid ${selected ? accentColor : `${accentColor}55`}`,
                borderRadius: 999,
                color: accentColor,
                fontSize: selected ? 10 : 9,
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: highlighted || selected ? 600 : 400,
                opacity: selected ? 1 : (highlighted ? 1 : 0.75),
                whiteSpace: 'nowrap',
                letterSpacing: 0.2,
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
              title={selected
                ? 'click to deselect · press Backspace to delete'
                : 'click to select edge'}
            >
              {labelText}
              {selected && (
                <span
                  onClick={handleDelete}
                  style={{
                    marginLeft: 6,
                    color: '#FB7185',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                  title="Delete edge"
                >
                  ✕
                </span>
              )}
            </div>
          </Html>
          {selected && (
            <Html
              center
              distanceFactor={14}
              zIndexRange={[7, 0]}
              style={{ userSelect: 'none', pointerEvents: 'none' }}
              position={[0, -0.5, 0]}
            >
              <div
                onPointerDown={e => e.stopPropagation()}
                style={{
                  display: 'flex',
                  gap: 4,
                  padding: '3px 6px',
                  background: 'rgba(20,22,28,0.95)',
                  border: '1px solid #2A2D34',
                  borderRadius: 6,
                  pointerEvents: 'auto'
                }}
              >
                {EDGE_KINDS.map(k => (
                  <button
                    key={k}
                    onClick={e => { e.stopPropagation(); handleChangeKind(k); }}
                    style={{
                      background: edge.kind === k ? `${EDGE_COLOR[k]}22` : 'transparent',
                      border: `1px solid ${edge.kind === k ? EDGE_COLOR[k] : `${EDGE_COLOR[k]}55`}`,
                      color: EDGE_COLOR[k],
                      borderRadius: 4,
                      padding: '1px 6px',
                      fontSize: 9,
                      fontFamily: 'JetBrains Mono, monospace',
                      cursor: 'pointer',
                      fontWeight: edge.kind === k ? 600 : 400
                    }}
                    title={`Set kind to ${k}`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </Html>
          )}
        </group>
      )}
    </>
  );
}

function makeLine(geom: BufferGeometry, mat: LineBasicMaterial, ref: React.MutableRefObject<Line | null>): Line {
  if (!ref.current) {
    ref.current = new Line(geom, mat);
    ref.current.frustumCulled = false;
  }
  return ref.current;
}
