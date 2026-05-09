import { useMemo } from 'react';
import { useWorldStore } from '../store/world-store';
import { DraggablePanel } from './DraggablePanel';

const KIND_COLOR: Record<string, string> = {
  doc: '#E8EAED',
  note: '#FBBF24',
  code: '#5EEAD4',
  log: '#5A5F68',
  image: '#A78BFA',
  link: '#A78BFA'
};

export function Minimap() {
  const artifacts = useWorldStore(s => s.artifacts);
  const targets = useWorldStore(s => s.targetPositions);
  const selectedIds = useWorldStore(s => s.selectedIds);
  const requestFrameAll = useWorldStore(s => s.requestFrameAll);

  const points = useMemo(() => {
    const out: Array<{ id: string; x: number; z: number; kind: string; selected: boolean }> = [];
    for (const a of artifacts.values()) {
      const p = targets.get(a.id) ?? a.position;
      if (!p) continue;
      out.push({ id: a.id, x: p.x, z: p.z, kind: a.kind, selected: selectedIds.has(a.id) });
    }
    return out;
  }, [artifacts, targets, selectedIds]);

  const bounds = useMemo(() => {
    if (points.length === 0) return { minX: -10, maxX: 10, minZ: -10, maxZ: 10 };
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const p of points) {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.z < minZ) minZ = p.z; if (p.z > maxZ) maxZ = p.z;
    }
    const padX = Math.max(2, (maxX - minX) * 0.1);
    const padZ = Math.max(2, (maxZ - minZ) * 0.1);
    return { minX: minX - padX, maxX: maxX + padX, minZ: minZ - padZ, maxZ: maxZ + padZ };
  }, [points]);

  const W = 200, H = 200, PAD = 8;
  const project = (x: number, z: number) => {
    const w = W - 2 * PAD;
    const h = H - 2 * PAD;
    const px = PAD + ((x - bounds.minX) / Math.max(1e-6, bounds.maxX - bounds.minX)) * w;
    const py = PAD + ((z - bounds.minZ) / Math.max(1e-6, bounds.maxZ - bounds.minZ)) * h;
    return { px, py };
  };

  return (
    <DraggablePanel
      id="minimap"
      title={`minimap · ${points.length}`}
      defaultPos={{ x: window.innerWidth - 220, y: 12, width: W, height: H + 28 }}
      zIndex={85}
    >
      <svg
        width={W} height={H}
        onClick={() => requestFrameAll()}
        style={{ cursor: 'pointer', display: 'block' }}
      >
        <rect x={0} y={0} width={W} height={H} fill="transparent" />
        {points.map(p => {
          const { px, py } = project(p.x, p.z);
          return (
            <circle
              key={p.id}
              cx={px}
              cy={py}
              r={p.selected ? 5 : 3}
              fill={KIND_COLOR[p.kind] ?? '#8A8F98'}
              stroke={p.selected ? '#5EEAD4' : 'none'}
              strokeWidth={p.selected ? 1.5 : 0}
              opacity={p.selected ? 1 : 0.7}
            />
          );
        })}
      </svg>
    </DraggablePanel>
  );
}
