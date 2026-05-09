import { useWorldStore } from '../store/world-store';

export function UndoBar() {
  const undoCount = useWorldStore(s => s.undoCount);
  const redoCount = useWorldStore(s => s.redoCount);

  if (undoCount === 0 && redoCount === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 44, right: 240,
      display: 'flex',
      gap: 4,
      zIndex: 75,
      pointerEvents: 'auto',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 10
    }}>
      <button
        onClick={() => window.api.undo()}
        disabled={undoCount === 0}
        title="Cmd+Z"
        style={btn(undoCount > 0)}
      >↶ {undoCount}</button>
      <button
        onClick={() => window.api.redo()}
        disabled={redoCount === 0}
        title="Cmd+Shift+Z"
        style={btn(redoCount > 0)}
      >↷ {redoCount}</button>
    </div>
  );
}

function btn(enabled: boolean): React.CSSProperties {
  return {
    padding: '3px 8px',
    background: 'rgba(20,22,27,0.85)',
    border: `1px solid ${enabled ? '#5EEAD4' : '#2A2D34'}`,
    borderRadius: 4,
    color: enabled ? '#5EEAD4' : '#2A2D34',
    fontSize: 10,
    fontFamily: 'inherit',
    cursor: enabled ? 'pointer' : 'default',
    backdropFilter: 'blur(8px)'
  };
}
