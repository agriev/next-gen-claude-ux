import { useState, useRef, useEffect, type CSSProperties, type ReactNode } from 'react';

export interface PanelPos {
  x: number;
  y: number;
  width?: number;
  height?: number;
  collapsed?: boolean;
}

interface Props {
  id: string;
  title: string;
  defaultPos: PanelPos;
  resizable?: boolean;
  zIndex?: number;
  collapsible?: boolean;
  accent?: string;
  children: ReactNode;
}

const STORAGE_PREFIX = 'jarvis.panel.';

function loadPos(id: string, def: PanelPos): PanelPos {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + id);
    if (!raw) return def;
    const parsed = JSON.parse(raw) as Partial<PanelPos>;
    return { ...def, ...parsed };
  } catch {
    return def;
  }
}

function savePos(id: string, pos: PanelPos): void {
  try { localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(pos)); }
  catch { /* ignore */ }
}

export function DraggablePanel({
  id, title, defaultPos, resizable = false, zIndex = 80, collapsible = true, accent = '#5EEAD4', children
}: Props) {
  const [pos, setPos] = useState<PanelPos>(() => loadPos(id, defaultPos));
  const draggingRef = useRef<{ startX: number; startY: number; startPos: PanelPos } | null>(null);
  const resizingRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  useEffect(() => { savePos(id, pos); }, [id, pos]);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = { startX: e.clientX, startY: e.clientY, startPos: { ...pos } };
    const onMove = (ev: MouseEvent) => {
      const d = draggingRef.current;
      if (!d) return;
      const nx = Math.max(0, Math.min(window.innerWidth - 100, d.startPos.x + ev.clientX - d.startX));
      const ny = Math.max(0, Math.min(window.innerHeight - 40,  d.startPos.y + ev.clientY - d.startY));
      setPos(p => ({ ...p, x: nx, y: ny }));
    };
    const onUp = () => {
      draggingRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const startResize = (e: React.MouseEvent) => {
    if (!resizable) return;
    e.preventDefault();
    e.stopPropagation();
    resizingRef.current = {
      startX: e.clientX, startY: e.clientY,
      startW: pos.width ?? 320, startH: pos.height ?? 320
    };
    const onMove = (ev: MouseEvent) => {
      const r = resizingRef.current;
      if (!r) return;
      const w = Math.max(220, r.startW + (ev.clientX - r.startX));
      const h = Math.max(160, r.startH + (ev.clientY - r.startY));
      setPos(p => ({ ...p, width: w, height: h }));
    };
    const onUp = () => {
      resizingRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const toggleCollapse = () => {
    if (!collapsible) return;
    setPos(p => ({ ...p, collapsed: !p.collapsed }));
  };

  const containerStyle: CSSProperties = {
    position: 'fixed',
    left: pos.x,
    top: pos.y,
    width: pos.collapsed ? undefined : (pos.width ?? defaultPos.width),
    height: pos.collapsed ? undefined : (pos.height ?? defaultPos.height),
    background: 'rgba(20, 22, 27, 0.92)',
    border: `1px solid ${accent}33`,
    borderRadius: 8,
    backdropFilter: 'blur(12px)',
    zIndex,
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'auto',
    fontFamily: 'Inter, sans-serif',
    color: '#E8EAED',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
  };

  return (
    <div style={containerStyle}>
      <div
        onMouseDown={startDrag}
        onDoubleClick={toggleCollapse}
        style={{
          padding: '6px 10px',
          borderBottom: pos.collapsed ? 'none' : '1px solid #2A2D34',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace',
          color: '#5A5F68',
          cursor: 'move',
          userSelect: 'none'
        }}
      >
        <span style={{ color: accent }}>⋮⋮</span>
        <span style={{ color: '#E8EAED', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </span>
        {collapsible && (
          <button
            onClick={(e) => { e.stopPropagation(); toggleCollapse(); }}
            style={{
              background: 'transparent', border: 'none', color: '#5A5F68',
              cursor: 'pointer', fontSize: 11, padding: 0, fontFamily: 'inherit'
            }}
            title={pos.collapsed ? 'Expand' : 'Collapse'}
          >{pos.collapsed ? '▸' : '▾'}</button>
        )}
      </div>
      {!pos.collapsed && (
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {children}
          {resizable && (
            <div
              onMouseDown={startResize}
              style={{
                position: 'absolute',
                right: 0, bottom: 0,
                width: 14, height: 14,
                cursor: 'nwse-resize',
                background: 'linear-gradient(135deg, transparent 50%, #5A5F68 50%, #5A5F68 60%, transparent 60%, transparent 70%, #5A5F68 70%, #5A5F68 80%, transparent 80%)',
                opacity: 0.6
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
