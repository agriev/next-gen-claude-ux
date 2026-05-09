import { useEffect, useState, useRef } from 'react';
import { useWorldStore } from '../store/world-store';

const KIND_TINT: Record<string, string> = {
  doc: '#5EEAD4',
  note: '#FBBF24',
  code: '#5EEAD4',
  log: '#8A8F98',
  image: '#A78BFA',
  link: '#A78BFA'
};

type Result = Awaited<ReturnType<typeof window.api.search>>[number];

export function SearchModal() {
  const open = useWorldStore(s => s.searchOpen);
  const setOpen = useWorldStore(s => s.setSearchOpen);
  const setSelected = useWorldStore(s => s.setSelected);
  const setInspector = useWorldStore(s => s.setInspectorArtifact);
  const targets = useWorldStore(s => s.targetPositions);
  const requestFrameAll = useWorldStore(s => s.requestFrameAll);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const r = await window.api.search(query.trim(), 20);
      if (!cancelled) {
        setResults(r);
        setIndex(0);
      }
    }, 80);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);

  const fly = (id: string) => {
    setSelected(new Set([id]));
    const pos = targets.get(id);
    if (pos) {
      // Use frameAllAt mechanism — actually just frame all and select
      requestFrameAll();
    }
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setIndex(i => Math.min(results.length - 1, i + 1)); return; }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setIndex(i => Math.max(0, i - 1)); return; }
    if (e.key === 'Enter' && results[index]) {
      e.preventDefault();
      if (e.shiftKey) {
        setInspector(results[index].artifactId);
        setOpen(false);
      } else {
        fly(results[index].artifactId);
      }
    }
  };

  if (!open) return null;
  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10,11,14,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(640px, 90vw)',
          background: 'rgba(20,22,27,0.97)',
          border: '1px solid #2A2D34',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search artifacts by title, body, tag, summary…"
          style={{
            width: '100%',
            padding: '14px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid #2A2D34',
            color: '#E8EAED',
            fontSize: 16,
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box'
          }}
        />
        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {results.length === 0 && query.trim() && (
            <div style={{ padding: '14px 18px', color: '#5A5F68', fontSize: 12 }}>no matches</div>
          )}
          {!query.trim() && (
            <div style={{ padding: '14px 18px', color: '#5A5F68', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
              ↑↓ navigate · Enter fly to · Shift+Enter open inspector · Esc close
            </div>
          )}
          {results.map((r, i) => (
            <div
              key={r.artifactId}
              onClick={() => fly(r.artifactId)}
              onMouseEnter={() => setIndex(i)}
              style={{
                padding: '8px 18px',
                cursor: 'pointer',
                background: i === index ? 'rgba(94,234,212,0.08)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                borderLeft: i === index ? '2px solid #5EEAD4' : '2px solid transparent'
              }}
            >
              <span style={{
                fontSize: 9,
                fontFamily: 'JetBrains Mono, monospace',
                color: KIND_TINT[r.kind] ?? '#5A5F68',
                textTransform: 'uppercase',
                width: 32
              }}>{r.kind}</span>
              <span style={{
                color: '#E8EAED',
                fontSize: 13,
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {r.title}
              </span>
              <span style={{
                color: '#5A5F68',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace'
              }}>@{r.shortName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
