import { useEffect, useRef, useState } from 'react';
import { useWorldStore } from '../store/world-store';

interface Mode {
  key: string;
  label: string;
  hint: string;
}

const MODES: Mode[] = [
  { key: 'by-type',        label: 'by type',          hint: 'group doc/code/note/log' },
  { key: 'by-tags',        label: 'by tags',          hint: 'cluster per tag' },
  { key: 'by-topic',       label: 'by topic',         hint: 'agent infers themes' },
  { key: 'by-time',        label: 'by time',          hint: 'left → right chronological' },
  { key: 'force-directed', label: 'force-directed',   hint: 'local · no LLM · ~100ms' },
  { key: 'free-form',      label: 'custom…',          hint: 'describe your grouping' }
];

export function LayoutMenu() {
  const [open, setOpen] = useState(false);
  const [freeform, setFreeform] = useState('');
  const [showFreeform, setShowFreeform] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const historyCount = useWorldStore(s => s.layoutHistoryCount);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setShowFreeform(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'l' && !isEditableTarget(e.target)) {
        e.preventDefault();
        setOpen(o => !o);
      } else if (e.key === 'Escape' && open) {
        setOpen(false); setShowFreeform(false);
      }
    };
    window.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const trigger = (mode: string, prompt?: string) => {
    void window.api.requestReorganize(mode, prompt);
    setOpen(false);
    setShowFreeform(false);
    setFreeform('');
  };

  const restore = async () => {
    if (historyCount === 0) return;
    await window.api.restoreLayout();
    setOpen(false);
  };

  return (
    <div ref={ref} style={{
      position: 'fixed',
      top: 8,
      left: 500,
      zIndex: 90,
      pointerEvents: 'auto',
      fontFamily: 'JetBrains Mono, monospace'
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Reorganize layout (Cmd+L)"
        style={{
          padding: '4px 10px',
          background: 'rgba(20,22,27,0.85)',
          border: '1px solid #A78BFA55',
          borderRadius: 999,
          color: '#A78BFA',
          fontSize: 11,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)'
        }}
      >
        ⌘L Layout
        <span style={{ color: '#5A5F68', marginLeft: 6 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 30, left: 0,
          minWidth: 260,
          background: 'rgba(20,22,27,0.96)',
          border: '1px solid #2A2D34',
          borderRadius: 6,
          backdropFilter: 'blur(10px)',
          padding: 4
        }}>
          {!showFreeform && (
            <>
              <div
                onClick={() => historyCount > 0 && restore()}
                style={{
                  padding: '6px 10px',
                  cursor: historyCount > 0 ? 'pointer' : 'default',
                  borderRadius: 4,
                  fontSize: 11,
                  color: historyCount > 0 ? '#5EEAD4' : '#3A3D44',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  borderBottom: '1px solid #1F2228',
                  marginBottom: 4,
                  paddingBottom: 8,
                  opacity: historyCount > 0 ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (historyCount > 0) e.currentTarget.style.background = 'rgba(94,234,212,0.08)';
                }}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ flex: 1 }}>↶ restore previous</span>
                <span style={{ color: historyCount > 0 ? '#5A5F68' : '#3A3D44', fontSize: 10 }}>
                  {historyCount > 0 ? `${historyCount} saved` : 'no history'}
                </span>
              </div>
              {MODES.map(m => (
                <div
                  key={m.key}
                  onClick={() => m.key === 'free-form' ? setShowFreeform(true) : trigger(m.key)}
                  style={{
                    padding: '6px 10px',
                    cursor: 'pointer',
                    borderRadius: 4,
                    fontSize: 11,
                    color: '#E8EAED',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(167,139,250,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ flex: 1 }}>{m.label}</span>
                  <span style={{ color: '#5A5F68', fontSize: 10 }}>{m.hint}</span>
                </div>
              ))}
            </>
          )}
          {showFreeform && (
            <div style={{ padding: '6px 8px' }}>
              <div style={{ fontSize: 10, color: '#A78BFA', marginBottom: 4 }}>Describe layout</div>
              <textarea
                value={freeform}
                onChange={e => setFreeform(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    if (freeform.trim()) trigger('free-form', freeform.trim());
                  }
                  if (e.key === 'Escape') setShowFreeform(false);
                }}
                autoFocus
                rows={3}
                placeholder='e.g. "group by which feature they relate to" or "place questions on the left, answers on the right"'
                style={{
                  width: 240,
                  background: '#0F1014',
                  border: '1px solid #2A2D34',
                  borderRadius: 4,
                  padding: '6px 8px',
                  color: '#E8EAED',
                  fontSize: 11,
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button
                  onClick={() => freeform.trim() && trigger('free-form', freeform.trim())}
                  disabled={!freeform.trim()}
                  style={{
                    padding: '3px 10px',
                    background: 'transparent',
                    border: '1px solid #A78BFA',
                    borderRadius: 4,
                    color: '#A78BFA',
                    fontSize: 10,
                    cursor: freeform.trim() ? 'pointer' : 'default',
                    fontFamily: 'inherit'
                  }}
                >Run (Cmd+Enter)</button>
                <button
                  onClick={() => setShowFreeform(false)}
                  style={{
                    padding: '3px 10px',
                    background: 'transparent',
                    border: '1px solid #5A5F68',
                    borderRadius: 4,
                    color: '#5A5F68',
                    fontSize: 10,
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >Back</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function isEditableTarget(t: EventTarget | null): boolean {
  return t instanceof HTMLInputElement
    || t instanceof HTMLTextAreaElement
    || (t instanceof HTMLElement && t.isContentEditable);
}
