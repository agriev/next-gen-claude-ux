/**
 * MarkingMenu — B11 in BACKLOG-v2.md.
 *
 * Alt+click on an artifact in the scene opens a radial menu at the mouse
 * position with 6 actions: focus, pin/unpin, copy id, copy as markdown,
 * refine, delete. Direction-based selection: click a wedge or hover-and-
 * release for fast access ("3.5× faster than linear menus" per WS-10).
 *
 * Lives in `renderer/src/ui/` (not scene/) so DOM is allowed — radial menus
 * benefit from real text rendering. The AR-port equivalent will be a
 * hand-circle gesture in WebXR; until then this is a pointer / DOM affair.
 *
 * Reference: WS-10 game UX patterns (marking menus). The 6-action set is
 * intentionally small — 8+ wedges hurt accuracy. Tagged by category color
 * for muscle memory.
 */
import { useEffect, useMemo, useState } from 'react';
import { useWorldStore } from '../store/world-store';

interface Action {
  id: string;
  label: string;
  color: string;
  description: string;
  run: (artifactId: string) => void;
}

const RADIUS = 92;
const HUB_RADIUS = 26;
const WEDGE_SIZE = 48;

function buildActions(): Action[] {
  return [
    {
      id: 'focus',
      label: 'Focus',
      color: '#5EEAD4',
      description: 'Move camera to this artifact',
      run: (id) => {
        useWorldStore.getState().setFocusedArtifact(id);
        useWorldStore.getState().setSelected(new Set([id]));
      }
    },
    {
      id: 'pin',
      label: 'Pin',
      color: '#FBBF24',
      description: 'Pin so Layout agent leaves it alone',
      run: (id) => { void window.api.pinArtifact(id); }
    },
    {
      id: 'copy-id',
      label: 'Copy id',
      color: '#A78BFA',
      description: 'Copy the 10-char id to clipboard',
      run: (id) => { void navigator.clipboard.writeText(id); }
    },
    {
      id: 'copy-md',
      label: 'Copy md',
      color: '#A78BFA',
      description: 'Copy body as markdown',
      run: async (id) => {
        const body = await window.api.getArtifactBody(id);
        if (typeof body === 'string') void navigator.clipboard.writeText(body);
      }
    },
    {
      id: 'refine',
      label: 'Refine',
      color: '#5EEAD4',
      description: 'Open inspector to refine via prompt',
      run: (id) => { useWorldStore.getState().setInspectorArtifact(id); }
    },
    {
      id: 'delete',
      label: 'Delete',
      color: '#FB7185',
      description: 'Remove this artifact (undoable)',
      run: (id) => { void window.api.deleteArtifact(id); }
    }
  ];
}

export function MarkingMenu() {
  const menu = useWorldStore(s => s.markingMenu);
  const close = useWorldStore(s => s.closeMarkingMenu);
  const [hovered, setHovered] = useState<string | null>(null);

  const actions = useMemo(() => buildActions(), []);

  // Esc / click-outside dismisses.
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu, close]);

  if (!menu) return null;

  const { artifactId, screenX, screenY } = menu;
  const sliceAngle = (Math.PI * 2) / actions.length;

  return (
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        pointerEvents: 'auto'
      }}
    >
      {/* Hub label — shortName centered. */}
      <div
        style={{
          position: 'absolute',
          left: screenX - HUB_RADIUS,
          top: screenY - HUB_RADIUS,
          width: HUB_RADIUS * 2,
          height: HUB_RADIUS * 2,
          borderRadius: '50%',
          background: 'rgba(10,11,14,0.94)',
          border: '1px solid #2A2D34',
          color: '#5A5F68',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          textAlign: 'center',
          padding: 4,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {hovered ?? 'esc'}
      </div>
      {actions.map((action, i) => {
        // Top-of-circle = -90°. Distribute clockwise.
        const angle = -Math.PI / 2 + i * sliceAngle;
        const cx = screenX + Math.cos(angle) * RADIUS - WEDGE_SIZE / 2;
        const cy = screenY + Math.sin(angle) * RADIUS - WEDGE_SIZE / 2;
        const isHovered = hovered === action.id;
        return (
          <button
            key={action.id}
            onMouseEnter={() => setHovered(action.label)}
            onMouseLeave={() => setHovered(prev => prev === action.label ? null : prev)}
            onClick={(e) => {
              e.stopPropagation();
              action.run(artifactId);
              close();
            }}
            title={action.description}
            style={{
              position: 'absolute',
              left: cx,
              top: cy,
              width: WEDGE_SIZE,
              height: WEDGE_SIZE,
              borderRadius: '50%',
              background: isHovered ? `${action.color}22` : 'rgba(20,22,28,0.95)',
              border: `1px solid ${isHovered ? action.color : `${action.color}66`}`,
              color: action.color,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              fontWeight: isHovered ? 600 : 400,
              cursor: 'pointer',
              transition: 'transform 80ms ease-out, background 80ms ease-out',
              transform: isHovered ? 'scale(1.08)' : 'scale(1)',
              boxShadow: isHovered ? `0 0 12px ${action.color}55` : 'none'
            }}
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
