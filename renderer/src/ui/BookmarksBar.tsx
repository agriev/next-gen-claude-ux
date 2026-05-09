import { useWorldStore } from '../store/world-store';

const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function BookmarksBar() {
  const bookmarks = useWorldStore(s => s.bookmarks);
  const jumpBookmark = useWorldStore(s => s.jumpBookmark);

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      right: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      zIndex: 80,
      pointerEvents: 'auto'
    }}>
      {SLOTS.map(slot => {
        const bm = bookmarks.get(slot);
        const has = !!bm;
        return (
          <button
            key={slot}
            onClick={() => has && jumpBookmark(slot)}
            disabled={!has}
            title={has ? `${bm!.label || `Bookmark ${slot}`} — press ${slot}` : `Shift+${slot} to save current view`}
            style={{
              width: 28, height: 22,
              background: has ? 'rgba(94,234,212,0.08)' : 'rgba(20,22,27,0.5)',
              border: `1px solid ${has ? '#5EEAD4' : '#1F2228'}`,
              borderRadius: 4,
              color: has ? '#5EEAD4' : '#2A2D34',
              fontSize: 10,
              fontFamily: 'JetBrains Mono, monospace',
              cursor: has ? 'pointer' : 'default',
              backdropFilter: 'blur(8px)'
            }}
          >{slot}</button>
        );
      })}
    </div>
  );
}
