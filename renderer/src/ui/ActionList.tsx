import { useMemo } from 'react';
import { useWorldStore } from '../store/world-store';
import type { Action } from '@shared/types';

const STATUS_COLOR: Record<Action['status'], string> = {
  queued: '#8A8F98',
  running: '#5EEAD4',
  done: '#8A8F98',
  cancelled: '#FB7185',
  error: '#FB7185'
};

export function ActionList() {
  const actions = useWorldStore(s => s.actions);
  const totalCost = useMemo(() => {
    let c = 0;
    for (const a of actions.values()) c += a.cost ?? 0;
    return c;
  }, [actions]);

  const sorted = useMemo(() => {
    return [...actions.values()].sort((a, b) => b.startedAt - a.startedAt).slice(0, 8);
  }, [actions]);

  const running = sorted.filter(a => a.status === 'running' || a.status === 'queued');
  const recent = sorted.filter(a => a.status !== 'running' && a.status !== 'queued').slice(0, 4);

  return (
    <div style={{
      position: 'fixed',
      top: 32,
      left: 12,
      right: 12,
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      pointerEvents: 'none',
      zIndex: 50
    }}>
      <div style={{ flex: 1, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {running.map(a => (
          <Chip key={a.id} action={a} cancellable />
        ))}
        {recent.map(a => (
          <Chip key={a.id} action={a} cancellable={false} />
        ))}
      </div>
      <div style={{ color: '#5A5F68', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', pointerEvents: 'none' }}>
        ${totalCost.toFixed(4)}
      </div>
    </div>
  );
}

function Chip({ action, cancellable }: { action: Action; cancellable: boolean }) {
  const color = STATUS_COLOR[action.status];
  return (
    <div style={{
      pointerEvents: 'auto',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      background: 'rgba(20, 22, 27, 0.85)',
      border: `1px solid ${color}33`,
      borderRadius: 999,
      fontSize: 11,
      color: '#E8EAED',
      backdropFilter: 'blur(8px)'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      <span style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {action.label}
      </span>
      <span style={{ color: '#5A5F68', fontSize: 10 }}>{action.status}</span>
      {cancellable && (
        <button
          onClick={() => window.api.cancelAction(action.id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#FB7185',
            cursor: 'pointer',
            padding: 0,
            marginLeft: 2,
            fontSize: 12,
            lineHeight: 1
          }}
          title="cancel"
        >
          ×
        </button>
      )}
    </div>
  );
}
