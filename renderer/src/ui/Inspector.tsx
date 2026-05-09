import { useEffect, useState, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useWorldStore } from '../store/world-store';
import type { Artifact, Edge, EdgeKind } from '@shared/types';
import { DraggablePanel } from './DraggablePanel';
import { splitBody } from '../util/diagrams';
import { DiagramRenderer } from './DiagramRenderer';

const KIND_TINT: Record<Artifact['kind'], string> = {
  doc: '#5EEAD4',
  note: '#FBBF24',
  code: '#5EEAD4',
  log: '#8A8F98',
  image: '#A78BFA',
  link: '#A78BFA',
  cluster: '#A78BFA'
};

const EDGE_COLOR: Record<EdgeKind, string> = {
  derives: '#5EEAD4',
  references: '#8A8F98',
  contradicts: '#FBBF24',
  'groups-with': '#A78BFA'
};

const EDGE_KINDS: EdgeKind[] = ['derives', 'references', 'contradicts', 'groups-with'];

export function Inspector() {
  const inspectorId = useWorldStore(s => s.inspectorArtifactId);
  const artifacts = useWorldStore(s => s.artifacts);
  const edges = useWorldStore(s => s.edges);
  const setInspector = useWorldStore(s => s.setInspectorArtifact);
  const selectedEdgeId = useWorldStore(s => s.selectedEdgeId);
  const setSelectedEdge = useWorldStore(s => s.setSelectedEdge);
  const artifact = inspectorId ? artifacts.get(inspectorId) : null;

  const incidentEdges = useMemo<Edge[]>(() => {
    if (!inspectorId) return [];
    const out: Edge[] = [];
    for (const e of edges.values()) {
      if (e.src === inspectorId || e.dst === inspectorId) out.push(e);
    }
    return out.sort((a, b) => a.kind.localeCompare(b.kind));
  }, [edges, inspectorId]);

  const [editing, setEditing] = useState(false);
  const [draftBody, setDraftBody] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftShortName, setDraftShortName] = useState('');
  const [refineOpen, setRefineOpen] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [highlightTitle, setHighlightTitle] = useState('');
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [selection, setSelection] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (artifact) {
      setDraftBody(artifact.body);
      setDraftTitle(artifact.title);
      setDraftShortName(artifact.shortName);
      setEditing(false);
      setRefineOpen(false);
      setHighlightOpen(false);
      setSelection('');
    }
  }, [inspectorId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!inspectorId) return;
      if (e.key === 'Escape' && !editing && !refineOpen && !highlightOpen) {
        setInspector(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inspectorId, editing, refineOpen, highlightOpen, setInspector]);

  const handleMouseUp = () => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? '';
    if (text && text.length > 4 && bodyRef.current?.contains(sel?.anchorNode ?? null)) {
      setSelection(text);
    } else {
      setSelection('');
    }
  };

  if (!artifact) return null;

  const tint = KIND_TINT[artifact.kind];

  const save = async () => {
    if (draftBody !== artifact.body) {
      await window.api.updateArtifactBody(artifact.id, draftBody);
    }
    if (draftTitle !== artifact.title || draftShortName !== artifact.shortName) {
      await window.api.renameArtifact(artifact.id, {
        title: draftTitle !== artifact.title ? draftTitle : undefined,
        shortName: draftShortName !== artifact.shortName ? draftShortName : undefined
      });
    }
    setEditing(false);
  };

  const refine = async () => {
    if (!refinePrompt.trim()) return;
    await window.api.refineArtifact(artifact.id, refinePrompt.trim());
    setRefinePrompt('');
    setRefineOpen(false);
  };

  const makeHighlight = async () => {
    if (!selection) return;
    await window.api.createHighlight(artifact.id, selection, highlightTitle.trim() || undefined);
    setSelection('');
    setHighlightTitle('');
    setHighlightOpen(false);
  };

  return (
    <DraggablePanel
      id={`inspector-${artifact.id.slice(0, 6)}`}
      title={`${artifact.kind.toUpperCase()} · @${artifact.shortName}`}
      defaultPos={{
        x: Math.max(40, window.innerWidth - 520),
        y: 80,
        width: 480,
        height: Math.min(720, window.innerHeight - 160)
      }}
      resizable
      zIndex={120}
      accent={tint}
    >
      <div style={{
        padding: '8px 14px',
        borderBottom: '1px solid #2A2D34',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 11,
        fontFamily: 'JetBrains Mono, monospace',
        color: '#5A5F68'
      }}>
        {!editing && (
          <button onClick={() => setEditing(true)} style={btnStyle(tint)}>Edit</button>
        )}
        {editing && (
          <>
            <button onClick={save} style={btnStyle('#5EEAD4')}>Save</button>
            <button onClick={() => { setEditing(false); setDraftBody(artifact.body); setDraftTitle(artifact.title); setDraftShortName(artifact.shortName); }} style={btnStyle('#5A5F68')}>Cancel</button>
          </>
        )}
        <button onClick={() => setRefineOpen(o => !o)} style={btnStyle('#A78BFA')}>Refine</button>
        <button
          onClick={() => artifact.pinned
            ? window.api.unpinArtifact(artifact.id)
            : window.api.pinArtifact(artifact.id)}
          style={btnStyle(artifact.pinned ? '#FBBF24' : '#5A5F68')}
          title={artifact.pinned ? 'Unpin (P) — layout agent will move it again' : 'Pin (P) — layout agent will skip it'}
        >
          {artifact.pinned ? '📌 unpin' : 'pin'}
        </button>
        <span style={{ flex: 1 }} />
        <button onClick={() => setInspector(null)} style={btnStyle('#5A5F68')}>Close</button>
      </div>

      <div style={{ padding: '12px 14px', borderBottom: '1px solid #1F2228' }}>
        {editing ? (
          <>
            <input
              value={draftTitle}
              onChange={e => setDraftTitle(e.target.value)}
              placeholder="Title"
              style={fieldStyle}
            />
            <input
              value={draftShortName}
              onChange={e => setDraftShortName(e.target.value.replace(/[^\w-]/g, ''))}
              placeholder="ShortName"
              style={{ ...fieldStyle, marginTop: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
            />
          </>
        ) : (
          <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>
            {artifact.title}
          </div>
        )}
        {artifact.spec?.summary && !editing && (
          <div style={{ marginTop: 6, fontSize: 12, fontStyle: 'italic', color: tint }}>
            {artifact.spec.summary}
          </div>
        )}
        {artifact.tags.length > 0 && !editing && (
          <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {artifact.tags.map(t => (
              <span key={t} style={{
                fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                color: tint, padding: '2px 6px',
                background: `${tint}11`, border: `1px solid ${tint}33`,
                borderRadius: 4
              }}>#{t}</span>
            ))}
          </div>
        )}
      </div>

      {refineOpen && (
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #1F2228', background: 'rgba(167,139,250,0.04)' }}>
          <div style={{ fontSize: 11, color: '#A78BFA', marginBottom: 4, fontFamily: 'JetBrains Mono, monospace' }}>
            Refine via Worker (will reference this artifact)
          </div>
          <textarea
            value={refinePrompt}
            onChange={e => setRefinePrompt(e.target.value)}
            placeholder="Make it shorter / add a code example / translate to Russian…"
            rows={3}
            style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'inherit' }}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) refine();
            }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <button onClick={refine} disabled={!refinePrompt.trim()} style={btnStyle('#A78BFA')}>Run (Cmd+Enter)</button>
            <button onClick={() => setRefineOpen(false)} style={btnStyle('#5A5F68')}>Cancel</button>
          </div>
        </div>
      )}

      {!editing && incidentEdges.length > 0 && (
        <div style={{ padding: '8px 14px', borderBottom: '1px solid #1F2228' }}>
          <div style={{
            fontSize: 10,
            color: '#5A5F68',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: 4,
            letterSpacing: 0.4,
            textTransform: 'uppercase'
          }}>
            Connections · {incidentEdges.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {incidentEdges.map(e => (
              <ConnectionRow
                key={e.id}
                edge={e}
                anchorId={artifact.id}
                artifacts={artifacts}
                selected={selectedEdgeId === e.id}
                onSelect={() => setSelectedEdge(selectedEdgeId === e.id ? null : e.id)}
                onOpenOther={(otherId) => setInspector(otherId)}
                onDelete={() => {
                  void window.api.deleteEdge(e.id);
                  if (selectedEdgeId === e.id) setSelectedEdge(null);
                }}
                onChangeKind={(kind) => {
                  void window.api.updateEdge(e.id, { kind });
                }}
              />
            ))}
          </div>
        </div>
      )}

      {selection && !editing && (
        <div style={{ padding: '8px 14px', borderBottom: '1px solid #1F2228', background: 'rgba(94,234,212,0.05)' }}>
          <div style={{ fontSize: 10, color: '#5EEAD4', fontFamily: 'JetBrains Mono, monospace' }}>
            selection · {selection.length} chars
          </div>
          {!highlightOpen ? (
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <button onClick={() => setHighlightOpen(true)} style={btnStyle('#5EEAD4')}>Make highlight →</button>
              <button onClick={() => { setSelection(''); window.getSelection()?.removeAllRanges(); }} style={btnStyle('#5A5F68')}>Clear</button>
            </div>
          ) : (
            <div style={{ marginTop: 4 }}>
              <input
                value={highlightTitle}
                onChange={e => setHighlightTitle(e.target.value)}
                placeholder="Optional title (will become @shortName base)"
                style={fieldStyle}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button onClick={makeHighlight} style={btnStyle('#5EEAD4')}>Create</button>
                <button onClick={() => setHighlightOpen(false)} style={btnStyle('#5A5F68')}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div
        ref={bodyRef}
        onMouseUp={handleMouseUp}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '14px 16px',
          fontSize: 13,
          lineHeight: 1.55
        }}
      >
        {editing ? (
          <textarea
            value={draftBody}
            onChange={e => setDraftBody(e.target.value)}
            style={{
              width: '100%',
              minHeight: '100%',
              background: 'transparent',
              border: '1px solid #2A2D34',
              borderRadius: 4,
              padding: 10,
              color: '#E8EAED',
              fontFamily: artifact.kind === 'code' || artifact.kind === 'log'
                ? 'JetBrains Mono, monospace'
                : 'inherit',
              fontSize: 13,
              resize: 'none',
              outline: 'none'
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save();
              if (e.key === 'Escape') { setEditing(false); setDraftBody(artifact.body); }
            }}
          />
        ) : (
          <MarkdownView body={artifact.body} kind={artifact.kind} />
        )}
      </div>

      <div style={{
        padding: '8px 14px',
        borderTop: '1px solid #2A2D34',
        fontSize: 10,
        color: '#5A5F68',
        fontFamily: 'JetBrains Mono, monospace',
        display: 'flex',
        gap: 12
      }}>
        <span>{artifact.body.length} chars</span>
        <span>·</span>
        <span>updated {new Date(artifact.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        {artifact.parentArtifactId && <><span>·</span><span style={{ color: '#5EEAD4' }}>highlight of {artifact.parentArtifactId.slice(0,6)}</span></>}
        <span style={{ flex: 1 }} />
        {artifact.pinned && <span style={{ color: '#FBBF24' }}>pinned</span>}
      </div>
    </DraggablePanel>
  );
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  background: '#0F1014',
  border: '1px solid #2A2D34',
  borderRadius: 4,
  padding: '6px 10px',
  color: '#E8EAED',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit'
};

function btnStyle(color: string): React.CSSProperties {
  return {
    background: 'transparent',
    border: `1px solid ${color}55`,
    borderRadius: 4,
    color,
    fontSize: 11,
    padding: '3px 8px',
    cursor: 'pointer',
    fontFamily: 'inherit'
  };
}

function MarkdownView({ body, kind }: { body: string; kind: Artifact['kind'] }) {
  if (kind === 'code' || kind === 'log') {
    const segments = splitBody(body);
    return (
      <>
        {segments.map((s, i) =>
          s.type === 'text' ? (
            <pre key={i} style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'JetBrains Mono, SF Mono, monospace',
              fontSize: 12,
              color: '#E8EAED'
            }}>{s.text}</pre>
          ) : (
            <DiagramRenderer key={i} diagram={s.diagram!} />
          )
        )}
      </>
    );
  }
  const segments = splitBody(body);
  return (
    <>
      {segments.map((s, i) =>
        s.type === 'diagram' ? (
          <DiagramRenderer key={i} diagram={s.diagram!} />
        ) : (
          <MarkdownChunk key={i} text={s.text!} />
        )
      )}
    </>
  );
}

interface ConnectionRowProps {
  edge: Edge;
  anchorId: string;
  artifacts: Map<string, Artifact>;
  selected: boolean;
  onSelect: () => void;
  onOpenOther: (id: string) => void;
  onDelete: () => void;
  onChangeKind: (kind: EdgeKind) => void;
}

function ConnectionRow({
  edge, anchorId, artifacts, selected,
  onSelect, onOpenOther, onDelete, onChangeKind
}: ConnectionRowProps) {
  const outgoing = edge.src === anchorId;
  const otherId = outgoing ? edge.dst : edge.src;
  const other = artifacts.get(otherId);
  const color = EDGE_COLOR[edge.kind];
  const labelText = edge.label || edge.kind;

  const [picking, setPicking] = useState(false);

  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 6px',
        borderRadius: 4,
        background: selected ? `${color}15` : 'transparent',
        border: `1px solid ${selected ? `${color}88` : 'transparent'}`,
        cursor: 'pointer',
        fontSize: 12
      }}
      title={selected ? 'click again to deselect' : 'click to select edge in 3D'}
    >
      <span style={{
        fontFamily: 'JetBrains Mono, monospace',
        color: '#5A5F68',
        fontSize: 11,
        width: 14,
        textAlign: 'center'
      }}>
        {outgoing ? '→' : '←'}
      </span>

      <button
        onClick={e => { e.stopPropagation(); if (other) onOpenOther(other.id); }}
        disabled={!other}
        style={{
          background: 'transparent',
          border: 'none',
          color: other ? '#E8EAED' : '#5A5F68',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
          padding: 0,
          cursor: other ? 'pointer' : 'default',
          textDecoration: other ? 'underline dotted' : 'line-through',
          textUnderlineOffset: 2
        }}
        title={other ? `Open @${other.shortName}` : 'artifact missing (other board?)'}
      >
        @{other ? other.shortName : otherId.slice(0, 6)}
      </button>

      <span style={{ flex: 1 }} />

      <button
        onClick={e => { e.stopPropagation(); setPicking(p => !p); }}
        style={{
          background: `${color}11`,
          border: `1px solid ${color}55`,
          borderRadius: 999,
          padding: '1px 8px',
          color,
          fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace',
          cursor: 'pointer'
        }}
        title="Change kind"
      >
        {labelText}
      </button>

      {picking && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            display: 'flex',
            gap: 3,
            padding: '2px 4px',
            background: 'rgba(20,22,28,0.95)',
            border: '1px solid #2A2D34',
            borderRadius: 4
          }}
        >
          {EDGE_KINDS.map(k => (
            <button
              key={k}
              onClick={(e) => { e.stopPropagation(); onChangeKind(k); setPicking(false); }}
              style={{
                background: edge.kind === k ? `${EDGE_COLOR[k]}22` : 'transparent',
                border: `1px solid ${EDGE_COLOR[k]}55`,
                color: EDGE_COLOR[k],
                borderRadius: 3,
                padding: '1px 5px',
                fontSize: 9,
                fontFamily: 'JetBrains Mono, monospace',
                cursor: 'pointer',
                fontWeight: edge.kind === k ? 600 : 400
              }}
            >
              {k}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        style={{
          background: 'transparent',
          border: '1px solid #FB718555',
          borderRadius: 3,
          color: '#FB7185',
          fontSize: 10,
          padding: '1px 6px',
          cursor: 'pointer',
          fontFamily: 'JetBrains Mono, monospace'
        }}
        title="Delete edge"
      >
        ✕
      </button>
    </div>
  );
}

function MarkdownChunk({ text }: { text: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" style={{ color: '#5EEAD4' }}>{children}</a>,
          h1: ({ children }) => <h1 style={{ fontSize: 20, fontWeight: 600, margin: '12px 0 6px' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontSize: 17, fontWeight: 600, margin: '10px 0 6px' }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontSize: 14, fontWeight: 600, margin: '8px 0 4px' }}>{children}</h3>,
          p: ({ children }) => <p style={{ margin: '0 0 8px' }}>{children}</p>,
          ul: ({ children }) => <ul style={{ paddingLeft: 18, margin: '4px 0 8px' }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ paddingLeft: 18, margin: '4px 0 8px' }}>{children}</ol>,
          li: ({ children }) => <li style={{ margin: '2px 0' }}>{children}</li>,
          code: ({ children, className }) => {
            const isBlock = !!className;
            if (isBlock) {
              return <pre style={{ background: '#0F1418', border: '1px solid #2A2D34', borderRadius: 4, padding: 8, overflow: 'auto', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', margin: '6px 0' }}><code>{children}</code></pre>;
            }
            return <code style={{ background: '#0F1418', padding: '1px 5px', borderRadius: 3, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{children}</code>;
          },
          blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #2A2D34', paddingLeft: 10, color: '#8A8F98', margin: '4px 0' }}>{children}</blockquote>
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
