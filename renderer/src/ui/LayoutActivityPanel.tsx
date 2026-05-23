import { useEffect, useMemo, useRef, useState } from 'react';
import { DraggablePanel } from './DraggablePanel';
import { useWorldStore } from '../store/world-store';

interface LayoutLog {
  ts: number;
  kind: 'tool' | 'thought' | 'note';
  text: string;
}

const KIND_COLOR: Record<LayoutLog['kind'], string> = {
  thought: '#A78BFA',
  tool: '#5EEAD4',
  note: '#8A8F98'
};

const MAX = 200;

/**
 * Full reasoning + tool-call trace for the Layout agent.
 *
 * `AgentActivityHud` only shows the last 4 lines and fades them quickly — fine
 * for "is something happening" but useless for debugging *why* a reorganize is
 * slow. This panel keeps the last 200 entries with timestamps, colour-codes
 * thought/tool/note, and shows a live status line: current label, elapsed
 * wall-clock, tool-call count.
 *
 * It is draggable / collapsible / resizable (persists via localStorage).
 */
export function LayoutActivityPanel() {
  const [logs, setLogs] = useState<LayoutLog[]>([]);
  const [tick, setTick] = useState(0); // forces re-render for elapsed timer
  const scrollRef = useRef<HTMLDivElement>(null);
  const followBottom = useRef(true);

  useEffect(() => {
    const off = window.api.onAgentLog(e => {
      if (e.agentRole !== 'layout') return;
      const entry: LayoutLog = {
        ts: e.ts,
        kind: (e.kind as LayoutLog['kind']) ?? 'note',
        text: e.text
      };
      setLogs(prev => {
        const next = [...prev, entry];
        return next.length > MAX ? next.slice(-MAX) : next;
      });
    });
    return off;
  }, []);

  // Auto-scroll to bottom unless the user has scrolled up.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !followBottom.current) return;
    el.scrollTop = el.scrollHeight;
  }, [logs]);

  // Tick once a second so the "elapsed" of an in-flight reorganize updates.
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  void tick;

  // Derive current state from the most recent `▶ ...` / `✓ ...` notes.
  const status = useMemo(() => deriveStatus(logs), [logs, tick]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    followBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 12;
  };

  return (
    <DraggablePanel
      id="layout-activity"
      title={
        status.busy
          ? `Layout · ${status.label} · ${status.elapsedLabel} · ${status.toolCalls} calls`
          : `Layout activity · ${logs.length}`
      }
      defaultPos={{
        x: Math.max(12, window.innerWidth - 720),
        y: 240,
        width: 360,
        height: 380
      }}
      resizable
      zIndex={61}
      accent="#A78BFA"
    >
      <div style={{
        padding: '6px 10px',
        borderBottom: '1px solid #1F2228',
        fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace',
        color: '#5A5F68',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: status.busy ? '#A78BFA' : '#5A5F68',
          boxShadow: status.busy ? '0 0 6px #A78BFA' : undefined,
          flexShrink: 0
        }} />
        {status.busy
          ? <span style={{ color: '#E8EAED' }}>thinking — sequential tool calls, one round-trip per place_on_canvas</span>
          : <span>idle — waiting for next delta</span>}
        <span style={{ flex: 1 }} />
        <button
          onClick={() => setLogs([])}
          style={{
            background: 'transparent',
            border: '1px solid #2A2D34',
            color: '#5A5F68',
            borderRadius: 3,
            padding: '1px 6px',
            cursor: 'pointer',
            fontSize: 9,
            fontFamily: 'inherit'
          }}
          title="Clear log"
        >clear</button>
      </div>

      <PendingPlansBar />

      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '6px 10px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          lineHeight: 1.5
        }}
      >
        {logs.length === 0 && (
          <div style={{ color: '#5A5F68', textAlign: 'center', padding: 20 }}>
            no layout activity yet — try Cmd+L to reorganize
          </div>
        )}
        {logs.map((l, i) => (
          <div key={`${l.ts}-${i}`} style={{
            color: KIND_COLOR[l.kind],
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            marginBottom: 1
          }}>
            <span style={{ color: '#5A5F68', marginRight: 6 }}>
              {new Date(l.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            {l.text}
          </div>
        ))}
      </div>

      <div style={{
        padding: '6px 10px',
        borderTop: '1px solid #1F2228',
        fontSize: 9,
        fontFamily: 'JetBrains Mono, monospace',
        color: '#5A5F68',
        background: 'rgba(167,139,250,0.04)',
        lineHeight: 1.4
      }}>
        <strong style={{ color: '#A78BFA' }}>why so slow?</strong> each placement is one Anthropic round-trip; 20 cards ≈ 20+ turns. context grows across the long-lived session. switch <em>Layout</em> model to a smaller/faster one in the ◐ model picker, or pin a few cards so it has less work.
      </div>
    </DraggablePanel>
  );
}

/**
 * B04 — pending layout plans (intent-ghost) accept/reject UI. Renders one
 * row per pending plan with a countdown and Accept / Reject buttons. Empty
 * state collapses to nothing.
 */
function PendingPlansBar() {
  const pendingPlans = useWorldStore(s => s.pendingPlans);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (pendingPlans.size === 0) return;
    const id = setInterval(() => setTick(t => t + 1), 200);
    return () => clearInterval(id);
  }, [pendingPlans.size]);
  void tick;

  if (pendingPlans.size === 0) return null;

  return (
    <div style={{
      padding: '6px 10px',
      borderBottom: '1px solid #1F2228',
      background: 'rgba(94,234,212,0.06)',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }}>
      {[...pendingPlans.values()].map(plan => {
        const remainingMs = Math.max(0, plan.expiresAt - Date.now());
        const remainingSec = Math.ceil(remainingMs / 1000);
        return (
          <div key={plan.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span style={{ color: '#5EEAD4' }}>◇</span>
            <span style={{ color: '#E8EAED', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {plan.label} · {plan.placements.length} cards · {remainingSec}s
            </span>
            <button
              onClick={() => void window.api.commitLayoutPlan(plan.id)}
              style={{
                background: '#5EEAD422',
                border: '1px solid #5EEAD4',
                color: '#5EEAD4',
                borderRadius: 3,
                padding: '1px 6px',
                fontSize: 9,
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
              title="Apply now"
            >Accept</button>
            <button
              onClick={() => void window.api.rejectLayoutPlan(plan.id)}
              style={{
                background: 'transparent',
                border: '1px solid #FB718555',
                color: '#FB7185',
                borderRadius: 3,
                padding: '1px 6px',
                fontSize: 9,
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
              title="Cancel — nothing will move"
            >Reject</button>
          </div>
        );
      })}
    </div>
  );
}

function deriveStatus(logs: LayoutLog[]): {
  busy: boolean;
  label: string;
  elapsedLabel: string;
  toolCalls: number;
} {
  // Walk back to find the latest ▶ that has no matching ✓ after it.
  let startIdx = -1;
  let endIdx = -1;
  for (let i = logs.length - 1; i >= 0; i--) {
    const t = logs[i].text;
    if (endIdx === -1 && t.startsWith('✓ ')) endIdx = i;
    if (t.startsWith('▶ ')) { startIdx = i; break; }
  }
  if (startIdx === -1) return { busy: false, label: '', elapsedLabel: '', toolCalls: 0 };
  if (endIdx > startIdx) return { busy: false, label: '', elapsedLabel: '', toolCalls: 0 };

  // Busy. Count tool calls since the ▶.
  let toolCalls = 0;
  for (let i = startIdx + 1; i < logs.length; i++) {
    if (logs[i].kind === 'tool') toolCalls++;
  }
  const elapsedMs = Date.now() - logs[startIdx].ts;
  const elapsedLabel = elapsedMs < 1000
    ? `${elapsedMs}ms`
    : `${(elapsedMs / 1000).toFixed(1)}s`;
  const label = logs[startIdx].text.replace(/^▶\s*/, '').slice(0, 60);
  return { busy: true, label, elapsedLabel, toolCalls };
}
