import { useMemo } from 'react';
import { useWorldStore } from '../store/world-store';
import type { Action, ActionLogEntry } from '@shared/types';
import { DraggablePanel } from './DraggablePanel';

const STATUS_DOT: Record<Action['status'], string> = {
  queued: '#8A8F98',
  running: '#5EEAD4',
  done: '#5A5F68',
  cancelled: '#FB7185',
  error: '#FB7185'
};

const KIND_TAG: Record<Action['kind'], string> = {
  research: 'rsrch',
  write: 'write',
  edit: 'edit',
  clarify: 'clrfy',
  reference: 'ref'
};

export function ActivityPanel() {
  const actions = useWorldStore(s => s.actions);
  const expandedId = useWorldStore(s => s.expandedActionId);
  const setExpanded = useWorldStore(s => s.setExpandedAction);
  const actionLogs = useWorldStore(s => s.actionLogs);

  const sorted = useMemo(
    () => [...actions.values()].sort((a, b) => b.startedAt - a.startedAt).slice(0, 40),
    [actions]
  );

  const totalCost = useMemo(() => {
    let c = 0;
    for (const a of actions.values()) c += a.cost ?? 0;
    return c;
  }, [actions]);

  const runningCount = useMemo(
    () => sorted.filter(a => a.status === 'running' || a.status === 'queued').length,
    [sorted]
  );

  return (
    <DraggablePanel
      id="activity"
      title={`Activity · ${runningCount} running · ${sorted.length} total · $${totalCost.toFixed(4)}`}
      defaultPos={{ x: window.innerWidth - 360, y: 240, width: 340, height: 380 }}
      resizable
      zIndex={60}
    >
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {sorted.length === 0 && (
          <div style={{ padding: 14, color: '#5A5F68', fontSize: 11, textAlign: 'center' }}>
            no activity yet — type a prompt below
          </div>
        )}
        {sorted.map(action => (
          <Row
            key={action.id}
            action={action}
            expanded={expandedId === action.id}
            onToggle={() => setExpanded(expandedId === action.id ? null : action.id)}
            log={actionLogs.get(action.id) ?? []}
          />
        ))}
      </div>
    </DraggablePanel>
  );
}

function formatDuration(start: number, end?: number) {
  const ms = (end ?? Date.now()) - start;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m${Math.floor((ms % 60000) / 1000)}s`;
}

function Row({ action, expanded, onToggle, log }: {
  action: Action;
  expanded: boolean;
  onToggle: () => void;
  log: ActionLogEntry[];
}) {
  const dot = STATUS_DOT[action.status];
  const isLive = action.status === 'running' || action.status === 'queued';

  return (
    <div style={{ borderBottom: '1px solid #1F2228', fontSize: 11, color: '#E8EAED' }}>
      <div
        onClick={onToggle}
        style={{
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          background: expanded ? 'rgba(94,234,212,0.05)' : 'transparent'
        }}
      >
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: dot,
          boxShadow: isLive ? `0 0 6px ${dot}` : undefined,
          flexShrink: 0
        }} />
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9, color: '#5A5F68',
          textTransform: 'uppercase', flexShrink: 0
        }}>
          {KIND_TAG[action.kind]}
        </span>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {action.label || '(empty)'}
        </span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#5A5F68', flexShrink: 0 }}>
          {formatDuration(action.startedAt, action.endedAt)}
        </span>
        {isLive && (
          <button
            onClick={e => { e.stopPropagation(); void window.api.cancelAction(action.id); }}
            style={{ background: 'transparent', border: 'none', color: '#FB7185', cursor: 'pointer', padding: 0, fontSize: 14 }}
            title="Cancel"
          >×</button>
        )}
        <span style={{ color: '#5A5F68', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, width: 8 }}>
          {expanded ? '▾' : '▸'}
        </span>
      </div>
      {expanded && (
        <div style={{ padding: '0 12px 10px', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Block label="prompt">
            <div style={{
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#E8EAED',
              maxHeight: 160, overflowY: 'auto'
            }}>
              {action.prompt || '(no prompt captured)'}
            </div>
          </Block>
          {(action.cost != null || action.tokens != null) && (
            <Block label="usage">
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#8A8F98' }}>
                {action.cost != null && <>cost ${action.cost.toFixed(4)} </>}
                {action.tokens != null && <>· {action.tokens} tokens </>}
                <>· status {action.status}</>
              </div>
            </Block>
          )}
          {action.producedArtifactIds.length > 0 && (
            <Block label="produced">
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#5EEAD4' }}>
                {action.producedArtifactIds.join(', ')}
              </div>
            </Block>
          )}
          <Block label={`log (${log.length})`}>
            {log.length === 0 ? (
              <div style={{ color: '#5A5F68', fontSize: 10 }}>—</div>
            ) : (
              <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {log.slice().reverse().map((entry, i) => (
                  <div key={i} style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10,
                    color: entry.kind === 'tool' ? '#5EEAD4' : entry.kind === 'thought' ? '#A78BFA' : '#8A8F98',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                  }}>
                    <span style={{ color: '#5A5F68' }}>
                      {new Date(entry.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>{' '}{entry.text}
                  </div>
                ))}
              </div>
            )}
          </Block>
        </div>
      )}
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: 9, color: '#5A5F68', textTransform: 'uppercase',
        letterSpacing: 0.5, marginBottom: 3, fontFamily: 'JetBrains Mono, monospace'
      }}>{label}</div>
      <div style={{ background: '#0F1014', border: '1px solid #1F2228', borderRadius: 4, padding: '6px 8px' }}>
        {children}
      </div>
    </div>
  );
}
