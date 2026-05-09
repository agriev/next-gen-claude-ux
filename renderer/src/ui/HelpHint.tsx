import { useState } from 'react';

const ROWS: Array<[string, string]> = [
  ['/', 'focus input'],
  ['F', 'frame all'],
  ['T', 'top-down 2D mode'],
  ['Cmd+F', 'fuzzy search'],
  ['Cmd+L', 'layout reorganize menu'],
  ['shift-drag card', 'move card (pins it)'],
  ['click', 'select'],
  ['shift-click', 'multi-select'],
  ['double-click', 'open Inspector'],
  ['Enter / I', 'open Inspector for selected'],
  ['P', 'pin / unpin selected'],
  ['V', 'voice focus mode on selected'],
  ['E', 'connect 2+ selected (references)'],
  ['1 / 2 / 3 / 4', 'connect: derives/refs/contra/group'],
  ['arrows', 'navigate selection'],
  ['1..9 (no selection)', 'jump to bookmark'],
  ['Shift+1..9', 'save view as bookmark'],
  ['Cmd+Z / Cmd+Shift+Z', 'undo / redo'],
  ['Backspace', 'delete selected'],
  ['Cmd+.', 'cancel all running agents'],
  ['Esc', 'clear selection / close']
];

export function HelpHint() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: 12,
      pointerEvents: 'auto',
      zIndex: 70,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 10,
      color: '#8A8F98'
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: '4px 10px',
          background: 'rgba(20, 22, 27, 0.85)',
          border: '1px solid #2A2D34',
          borderRadius: 999,
          color: '#8A8F98',
          fontSize: 10,
          fontFamily: 'inherit',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)'
        }}
      >
        {open ? '× help' : '? shortcuts'}
      </button>
      {open && (
        <div style={{
          marginTop: 6,
          padding: '8px 10px',
          background: 'rgba(20, 22, 27, 0.92)',
          border: '1px solid #2A2D34',
          borderRadius: 6,
          backdropFilter: 'blur(10px)',
          minWidth: 240,
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}>
          {ROWS.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 8 }}>
              <span style={{ color: '#E8EAED', minWidth: 110 }}>{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
