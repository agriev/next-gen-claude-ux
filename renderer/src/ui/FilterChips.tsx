import { useMemo } from 'react';
import { useWorldStore } from '../store/world-store';
import type { ArtifactKind } from '@shared/types';

const ALL_KINDS: ArtifactKind[] = ['doc', 'note', 'code', 'log', 'image', 'link', 'cluster', 'frame'];

const KIND_TINT: Record<ArtifactKind, string> = {
  doc: '#E8EAED',
  note: '#FBBF24',
  code: '#5EEAD4',
  log: '#8A8F98',
  image: '#A78BFA',
  link: '#A78BFA',
  cluster: '#A78BFA',
  frame: '#5EEAD4'
};

export function FilterChips() {
  const filters = useWorldStore(s => s.filters);
  const setFilters = useWorldStore(s => s.setFilters);
  const resetFilters = useWorldStore(s => s.resetFilters);
  const artifacts = useWorldStore(s => s.artifacts);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const a of artifacts.values()) for (const t of a.tags) set.add(t);
    return [...set].sort().slice(0, 12);
  }, [artifacts]);

  const presentKinds = useMemo(() => {
    const set = new Set<ArtifactKind>();
    for (const a of artifacts.values()) set.add(a.kind);
    return ALL_KINDS.filter(k => set.has(k));
  }, [artifacts]);

  const toggleKind = (k: ArtifactKind) => {
    const next = new Set(filters.kinds);
    if (next.has(k)) next.delete(k); else next.add(k);
    setFilters({ kinds: next });
  };

  const toggleTag = (t: string) => {
    const next = new Set(filters.tags);
    if (next.has(t)) next.delete(t); else next.add(t);
    setFilters({ tags: next });
  };

  const togglePinned = () => setFilters({ pinnedOnly: !filters.pinnedOnly });

  const active = filters.kinds.size > 0 || filters.tags.size > 0 || filters.pinnedOnly;

  return (
    <div style={{
      position: 'fixed',
      top: 44,
      left: 92,
      maxWidth: 'calc(100vw - 380px)',
      display: 'flex',
      gap: 4,
      flexWrap: 'wrap',
      zIndex: 80,
      pointerEvents: 'auto'
    }}>
      {presentKinds.map(k => {
        const isOn = filters.kinds.has(k);
        return (
          <Chip key={k} on={isOn} color={KIND_TINT[k]} onClick={() => toggleKind(k)}>
            {k}
          </Chip>
        );
      })}
      {allTags.map(t => {
        const isOn = filters.tags.has(t);
        return (
          <Chip key={`t-${t}`} on={isOn} color="#A78BFA" onClick={() => toggleTag(t)}>
            #{t}
          </Chip>
        );
      })}
      <Chip on={filters.pinnedOnly} color="#FBBF24" onClick={togglePinned}>📌 pinned</Chip>
      {active && (
        <Chip on color="#FB7185" onClick={() => resetFilters()}>clear</Chip>
      )}
    </div>
  );
}

function Chip({ on, color, onClick, children }: {
  on: boolean; color: string; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '3px 8px',
        background: on ? `${color}22` : 'rgba(20,22,27,0.85)',
        border: `1px solid ${on ? color : '#2A2D34'}`,
        borderRadius: 999,
        color: on ? color : '#5A5F68',
        fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        whiteSpace: 'nowrap'
      }}
    >{children}</button>
  );
}
