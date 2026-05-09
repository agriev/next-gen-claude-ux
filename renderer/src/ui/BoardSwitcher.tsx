import { useState, useRef, useEffect } from 'react';
import { useWorldStore } from '../store/world-store';

export function BoardSwitcher() {
  const boards = useWorldStore(s => s.boards);
  const activeBoardId = useWorldStore(s => s.activeBoardId);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const active = boards.get(activeBoardId);
  const list = [...boards.values()].sort((a, b) => b.lastActiveAt - a.lastActiveAt);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [open]);

  const switchTo = async (id: string) => {
    if (id !== activeBoardId) await window.api.switchBoard(id);
    setOpen(false);
  };

  const create = async () => {
    if (!newName.trim()) return;
    const board = await window.api.createBoard(newName.trim(), 'blank');
    await window.api.switchBoard(board.id);
    setNewName('');
    setCreating(false);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{
      position: 'fixed', top: 8, left: 360, zIndex: 90, pointerEvents: 'auto',
      fontFamily: 'JetBrains Mono, monospace'
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '4px 10px',
          background: 'rgba(20,22,27,0.85)',
          border: '1px solid #2A2D34',
          borderRadius: 999,
          color: '#E8EAED',
          fontSize: 11,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)'
        }}
      >
        ▢ {active?.name ?? activeBoardId}
        <span style={{ color: '#5A5F68', marginLeft: 6 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 30, left: 0, minWidth: 220,
          background: 'rgba(20,22,27,0.96)',
          border: '1px solid #2A2D34', borderRadius: 6,
          backdropFilter: 'blur(10px)', padding: 4
        }}>
          {list.map(b => (
            <div
              key={b.id}
              onClick={() => switchTo(b.id)}
              style={{
                padding: '6px 10px',
                cursor: 'pointer',
                borderRadius: 4,
                fontSize: 11,
                color: b.id === activeBoardId ? '#5EEAD4' : '#E8EAED',
                background: b.id === activeBoardId ? 'rgba(94,234,212,0.06)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span style={{ flex: 1 }}>{b.name}</span>
              {b.id === activeBoardId && <span style={{ color: '#5EEAD4' }}>●</span>}
            </div>
          ))}
          <div style={{ borderTop: '1px solid #1F2228', marginTop: 4, paddingTop: 4 }}>
            {creating ? (
              <div style={{ padding: '4px 6px' }}>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') create(); if (e.key === 'Escape') setCreating(false); }}
                  autoFocus
                  placeholder="Board name"
                  style={{
                    width: '100%', padding: '4px 8px',
                    background: '#0F1014', border: '1px solid #2A2D34', borderRadius: 4,
                    color: '#E8EAED', fontSize: 11, outline: 'none', fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            ) : (
              <div
                onClick={() => setCreating(true)}
                style={{
                  padding: '6px 10px', cursor: 'pointer', fontSize: 11, color: '#5A5F68', borderRadius: 4
                }}
              >
                + New board
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
