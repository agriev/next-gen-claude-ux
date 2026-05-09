import { useEffect, useState } from 'react';
import { useWorldStore } from '../store/world-store';

interface AgentEntry {
  agentRole: string;
  agentId: string;
  text: string;
  ts: number;
}

const ROLE_COLOR: Record<string, string> = {
  layout: '#A78BFA',
  listening: '#5EEAD4',
  worker: '#FBBF24',
  naming: '#8A8F98'
};

/** Compact strip near top showing last 3 activity messages from background agents (layout/listening/naming). */
export function AgentActivityHud() {
  const [entries, setEntries] = useState<AgentEntry[]>([]);
  const listeningStatus = useWorldStore(s => s.listeningStatus);

  useEffect(() => {
    const off = window.api.onAgentLog(e => {
      // Show only background-agent activity (layout/listening/naming) — worker has its own panel
      if (e.agentRole === 'worker' && e.actionId) return;
      setEntries(prev => [
        { agentRole: e.agentRole, agentId: e.agentId, text: e.text, ts: e.ts },
        ...prev
      ].slice(0, 4));
    });
    return off;
  }, []);

  if (entries.length === 0 && listeningStatus === 'idle') return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      pointerEvents: 'none',
      zIndex: 60,
      maxWidth: 'min(540px, 80vw)'
    }}>
      {entries.map((e, i) => (
        <div
          key={`${e.ts}-${i}`}
          style={{
            padding: '3px 9px',
            background: 'rgba(20,22,27,0.85)',
            border: `1px solid ${ROLE_COLOR[e.agentRole] ?? '#5A5F68'}55`,
            borderLeft: `3px solid ${ROLE_COLOR[e.agentRole] ?? '#5A5F68'}`,
            borderRadius: 4,
            color: '#E8EAED',
            fontSize: 10,
            fontFamily: 'JetBrains Mono, monospace',
            backdropFilter: 'blur(8px)',
            opacity: 1 - i * 0.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          <span style={{ color: ROLE_COLOR[e.agentRole], marginRight: 6 }}>
            {e.agentRole}
          </span>
          {e.text.slice(0, 100)}
        </div>
      ))}
    </div>
  );
}
