import { useEffect, useState } from 'react';
import type { DiagramBlock } from '../util/diagrams';

interface Props {
  diagram: DiagramBlock;
  maxHeight?: number;
}

export function DiagramRenderer({ diagram, maxHeight = 400 }: Props) {
  if (diagram.kind === 'plantuml') {
    return <PlantUmlRenderer diagram={diagram} maxHeight={maxHeight} />;
  }
  return <MermaidRenderer diagram={diagram} maxHeight={maxHeight} />;
}

function PlantUmlRenderer({ diagram, maxHeight }: { diagram: Extract<DiagramBlock, { kind: 'plantuml' }>; maxHeight: number }) {
  const [showSource, setShowSource] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div style={containerStyle('#5EEAD4')}>
      <div style={headerStyle('#5EEAD4')}>
        <span>plantuml</span>
        <span style={{ flex: 1 }} />
        <button
          onClick={() => setShowSource(s => !s)}
          style={btnStyle}
        >{showSource ? 'image' : 'source'}</button>
        <a href={diagram.url} target="_blank" rel="noreferrer" style={{ ...btnStyle, textDecoration: 'none' }}>↗</a>
      </div>
      {showSource ? (
        <pre style={preStyle}>{diagram.source}</pre>
      ) : errored ? (
        <div style={errorStyle}>
          Failed to load diagram. Check internet connection (PlantUML uses public renderer at plantuml.com).
          <pre style={{ ...preStyle, marginTop: 6 }}>{diagram.source}</pre>
        </div>
      ) : (
        <div style={{
          padding: 8,
          background: '#FFFFFF',
          maxHeight,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <img
            src={diagram.url}
            alt="PlantUML diagram"
            onError={() => setErrored(true)}
            style={{ maxWidth: '100%', maxHeight, display: 'block' }}
          />
        </div>
      )}
    </div>
  );
}

// Mermaid: fetch and render via mermaid.js loaded on demand from CDN.
// Falls back to source view if load/parse fails.
function MermaidRenderer({ diagram, maxHeight }: { diagram: Extract<DiagramBlock, { kind: 'mermaid' }>; maxHeight: number }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const m = await loadMermaid();
        const id = `mmd-${Math.random().toString(36).slice(2, 10)}`;
        const result = await m.render(id, diagram.source);
        if (!cancel) setSvg(result.svg);
      } catch (err) {
        if (!cancel) setError(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => { cancel = true; };
  }, [diagram.source]);

  return (
    <div style={containerStyle('#A78BFA')}>
      <div style={headerStyle('#A78BFA')}>
        <span>mermaid</span>
        <span style={{ flex: 1 }} />
        <button onClick={() => setShowSource(s => !s)} style={btnStyle}>
          {showSource ? 'image' : 'source'}
        </button>
      </div>
      {showSource ? (
        <pre style={preStyle}>{diagram.source}</pre>
      ) : error ? (
        <div style={errorStyle}>
          Failed to render Mermaid: {error}
          <pre style={{ ...preStyle, marginTop: 6 }}>{diagram.source}</pre>
        </div>
      ) : svg == null ? (
        <div style={{ padding: 12, color: '#5A5F68', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
          rendering…
        </div>
      ) : (
        <div
          style={{
            padding: 8, background: '#FFFFFF',
            maxHeight, overflow: 'auto',
            display: 'flex', justifyContent: 'center'
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  );
}

interface MermaidApi {
  render(id: string, def: string): Promise<{ svg: string }>;
}
let mermaidPromise: Promise<MermaidApi> | null = null;
async function loadMermaid(): Promise<MermaidApi> {
  if (mermaidPromise) return mermaidPromise;
  mermaidPromise = (async () => {
    const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/mermaid@10/+esm') as { default: { initialize: (opts: unknown) => void; render: (id: string, def: string) => Promise<{ svg: string }> } };
    mod.default.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
    return { render: (id, def) => mod.default.render(id, def) };
  })();
  return mermaidPromise;
}

function containerStyle(color: string): React.CSSProperties {
  return {
    margin: '8px 0',
    border: `1px solid ${color}55`,
    borderRadius: 6,
    overflow: 'hidden',
    background: 'rgba(15,17,22,0.85)'
  };
}

function headerStyle(color: string): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 10px',
    background: 'rgba(20,22,27,0.85)',
    borderBottom: `1px solid ${color}33`,
    fontSize: 10,
    fontFamily: 'JetBrains Mono, monospace',
    color
  };
}

const btnStyle: React.CSSProperties = {
  padding: '2px 8px',
  background: 'transparent',
  border: '1px solid #2A2D34',
  borderRadius: 3,
  color: '#8A8F98',
  fontSize: 9,
  cursor: 'pointer',
  fontFamily: 'JetBrains Mono, monospace'
};

const preStyle: React.CSSProperties = {
  margin: 0,
  padding: 10,
  background: '#0F1014',
  fontFamily: 'JetBrains Mono, SF Mono, monospace',
  fontSize: 11,
  color: '#E8EAED',
  overflow: 'auto',
  maxHeight: 280,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word'
};

const errorStyle: React.CSSProperties = {
  padding: 10,
  background: 'rgba(251,113,133,0.06)',
  color: '#FB7185',
  fontSize: 11,
  fontFamily: 'JetBrains Mono, monospace'
};
