import { useEffect, useState } from 'react';

interface Toast {
  id: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  ts: number;
}

const COLOR: Record<Toast['level'], string> = {
  info: '#5EEAD4',
  warn: '#FBBF24',
  error: '#FB7185'
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let nextId = 1;
    const off = window.api.onWorldDelta(batch => {
      const news: Toast[] = [];
      for (const e of batch.events) {
        if (e.type === 'toast') {
          news.push({ id: nextId++, level: e.level, message: e.message, ts: Date.now() });
        }
      }
      if (news.length === 0) return;
      setToasts(prev => [...prev, ...news].slice(-3));
      for (const t of news) {
        setTimeout(() => {
          setToasts(prev => prev.filter(x => x.id !== t.id));
        }, t.level === 'error' ? 6000 : 3000);
      }
    });
    return off;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 84,
      right: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      zIndex: 200,
      pointerEvents: 'none'
    }}>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            padding: '8px 14px',
            background: 'rgba(20, 22, 27, 0.92)',
            border: `1px solid ${COLOR[t.level]}55`,
            borderLeft: `3px solid ${COLOR[t.level]}`,
            borderRadius: 6,
            color: '#E8EAED',
            fontSize: 12,
            backdropFilter: 'blur(8px)',
            maxWidth: 360
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
