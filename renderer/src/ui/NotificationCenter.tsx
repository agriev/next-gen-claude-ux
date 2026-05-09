import { useMemo } from 'react';
import { useWorldStore } from '../store/world-store';
import { DraggablePanel } from './DraggablePanel';

const LEVEL_COLOR: Record<string, string> = {
  info: '#5EEAD4',
  success: '#5EEAD4',
  warn: '#FBBF24',
  error: '#FB7185'
};

export function NotificationCenter() {
  const notifications = useWorldStore(s => s.notifications);
  const unreadCount = useMemo(() => notifications.filter(n => !n.readAt).length, [notifications]);

  return (
    <DraggablePanel
      id="notifications"
      title={`Notifications · ${unreadCount > 0 ? `${unreadCount} unread` : 'all read'}`}
      defaultPos={{ x: 12, y: 250, width: 320, height: 280, collapsed: unreadCount === 0 }}
      resizable
      zIndex={88}
      accent={unreadCount > 0 ? '#5EEAD4' : '#5A5F68'}
    >
      <div style={{
        padding: '6px 12px', borderBottom: '1px solid #2A2D34',
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 10, color: '#5A5F68', fontFamily: 'JetBrains Mono, monospace'
      }}>
        <span style={{ flex: 1 }} />
        <button
          onClick={() => window.api.clearNotifications()}
          style={{
            background: 'transparent', border: 'none', color: '#5A5F68',
            fontSize: 10, cursor: 'pointer', fontFamily: 'inherit'
          }}
        >mark all read</button>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {notifications.length === 0 && (
          <div style={{ padding: 16, color: '#5A5F68', fontSize: 11, textAlign: 'center' }}>
            no notifications yet
          </div>
        )}
        {notifications.slice(0, 30).map(n => (
          <div
            key={n.id}
            onClick={() => !n.readAt && window.api.markNotificationRead(n.id)}
            style={{
              padding: '8px 12px', borderBottom: '1px solid #1F2228',
              cursor: !n.readAt ? 'pointer' : 'default',
              background: !n.readAt ? 'rgba(94,234,212,0.04)' : 'transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: LEVEL_COLOR[n.level] }} />
              <span style={{ color: '#E8EAED', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {n.title}
              </span>
              <span style={{ color: '#5A5F68', fontFamily: 'JetBrains Mono, monospace' }}>
                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {n.body && (
              <div style={{ marginTop: 4, fontSize: 11, color: '#8A8F98', fontFamily: 'Inter, sans-serif' }}>{n.body}</div>
            )}
          </div>
        ))}
      </div>
    </DraggablePanel>
  );
}
