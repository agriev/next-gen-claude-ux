import { useWorldStore } from '../store/world-store';

export function StatusBar() {
  const artifactCount = useWorldStore(s => s.artifacts.size);
  const edgeCount = useWorldStore(s => s.edges.size);
  const listeningStatus = useWorldStore(s => s.listeningStatus);
  const requestFrameAll = useWorldStore(s => s.requestFrameAll);

  return (
    <div style={{
      position: 'fixed',
      top: 8,
      left: 92,
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      pointerEvents: 'none',
      zIndex: 80,
      fontSize: 11,
      fontFamily: 'JetBrains Mono, monospace',
      color: '#5A5F68'
    }}>
      <div style={{
        pointerEvents: 'auto',
        padding: '4px 10px',
        background: 'rgba(20, 22, 27, 0.85)',
        border: '1px solid #2A2D34',
        borderRadius: 999,
        backdropFilter: 'blur(8px)'
      }}>
        <span style={{ color: '#E8EAED' }}>{artifactCount}</span> artifacts
        <span style={{ color: '#2A2D34', margin: '0 6px' }}>·</span>
        <span style={{ color: '#E8EAED' }}>{edgeCount}</span> edges
        <span style={{ color: '#2A2D34', margin: '0 6px' }}>·</span>
        listening: <span style={{ color: listeningStatus === 'thinking' ? '#5EEAD4' : '#5A5F68' }}>{listeningStatus}</span>
      </div>
      <button
        onClick={requestFrameAll}
        style={{
          pointerEvents: 'auto',
          padding: '4px 10px',
          background: 'rgba(20, 22, 27, 0.85)',
          border: '1px solid #2A2D34',
          borderRadius: 999,
          color: '#E8EAED',
          fontSize: 11,
          fontFamily: 'inherit',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)'
        }}
        title="Frame all artifacts (F)"
      >
        Frame all
      </button>
    </div>
  );
}
