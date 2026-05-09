import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useWorldStore } from '../store/world-store';
import type { PendingAttachment } from '@shared/ipc-channels';

const AT_REGEX = /@([\w-]*)$/;
const HEIGHT_KEY = 'jarvis.inputbar.height';
const MIN_HEIGHT = 56;
const MAX_HEIGHT = () => Math.max(120, Math.floor(window.innerHeight * 0.6));

interface PendingFile extends PendingAttachment {
  /** local-only ui id so we can remove specific chip rows */
  uiId: string;
  size: number;
}

async function fileToPending(f: File): Promise<PendingFile> {
  const buf = await f.arrayBuffer();
  const bytes = new Uint8Array(buf);
  // Chunked btoa: large blobs (~5 MB images) blow the call stack with String.fromCharCode(...bytes)
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return {
    uiId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    dataBase64: btoa(binary),
    mime: f.type || 'application/octet-stream',
    filename: f.name,
    size: f.size
  };
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function fileIcon(mime: string, name: string): string {
  if (mime.startsWith('image/')) return '🖼️';
  if (mime === 'application/pdf' || name.toLowerCase().endsWith('.pdf')) return '📑';
  if (/\.(md|markdown|txt|log|csv|tsv)$/i.test(name)) return '📄';
  if (/\.(json|jsonc|json5|ya?ml|toml)$/i.test(name)) return '⚙️';
  if (/\.(js|mjs|cjs|ts|tsx|jsx|py|rb|go|rs|java|kt|swift|c|h|cpp|hpp|cc|m|mm|sh|zsh|sql)$/i.test(name)) return '💻';
  return '📎';
}

export function InputBar() {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCompletions, setShowCompletions] = useState(false);
  const [completionIndex, setCompletionIndex] = useState(0);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [dropTarget, setDropTarget] = useState(false);
  const [height, setHeight] = useState<number>(() => {
    const saved = Number(localStorage.getItem(HEIGHT_KEY));
    return Number.isFinite(saved) && saved >= MIN_HEIGHT ? Math.min(saved, 600) : MIN_HEIGHT;
  });
  const [resizing, setResizing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const artifacts = useWorldStore(s => s.artifacts);

  const allShortNames = useMemo(() => {
    return [...artifacts.values()]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map(a => a.shortName);
  }, [artifacts]);

  const partial = useMemo(() => {
    const m = text.match(AT_REGEX);
    return m ? m[1] : null;
  }, [text]);

  const completions = useMemo(() => {
    if (partial == null) return [];
    const lower = partial.toLowerCase();
    return allShortNames
      .filter(n => n.toLowerCase().startsWith(lower))
      .slice(0, 6);
  }, [partial, allShortNames]);

  useEffect(() => {
    setShowCompletions(completions.length > 0 && partial != null);
    setCompletionIndex(0);
  }, [completions.length, partial]);

  const focusInput = () => textareaRef.current?.focus();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const inEditable =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable);
      if (e.key === '/' && !inEditable) {
        e.preventDefault();
        focusInput();
      }
      if (e.key === 'Escape' && document.activeElement === textareaRef.current) {
        textareaRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const acceptCompletion = (name: string) => {
    setText(t => t.replace(AT_REGEX, `@${name} `));
    setShowCompletions(false);
    requestAnimationFrame(focusInput);
  };

  const extractRefs = (raw: string): string[] => {
    const refs: string[] = [];
    const re = /@([\w-]+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw)) !== null) refs.push(m[1]);
    return refs;
  };

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const arr: PendingFile[] = [];
    for (const f of Array.from(files)) {
      try {
        arr.push(await fileToPending(f));
      } catch (err) {
        console.warn('[inputbar] failed to read file', f.name, err);
      }
    }
    if (arr.length > 0) setPending(p => [...p, ...arr]);
  }, []);

  const removePending = (uiId: string) => {
    setPending(p => p.filter(f => f.uiId !== uiId));
  };

  const submit = async () => {
    const trimmed = text.trim();
    if ((!trimmed && pending.length === 0) || submitting) return;
    setSubmitting(true);
    const refs = extractRefs(trimmed);
    const attachments: PendingAttachment[] = pending.map(p => ({
      dataBase64: p.dataBase64,
      mime: p.mime,
      filename: p.filename
    }));
    try {
      await window.api.submitUtterance(
        trimmed || `(attached ${pending.length} file${pending.length === 1 ? '' : 's'})`,
        refs,
        attachments.length > 0 ? attachments : undefined
      );
      setText('');
      setPending([]);
    } finally {
      setSubmitting(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCompletions && completions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setCompletionIndex(i => (i + 1) % completions.length); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setCompletionIndex(i => (i - 1 + completions.length) % completions.length); return; }
      if (e.key === 'Tab' || (e.key === 'Enter' && completions[completionIndex] && !e.shiftKey)) {
        e.preventDefault();
        acceptCompletion(completions[completionIndex]);
        return;
      }
    }
    // Enter submits unless Shift is held (newline) or Cmd/Ctrl is held (also newline-equivalent on some setups)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  // Pasting files while focused on the textarea
  const onPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!e.clipboardData) return;
    const files: File[] = [];
    for (const item of Array.from(e.clipboardData.items)) {
      if (item.kind === 'file') {
        const f = item.getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      await addFiles(files);
    }
  };

  // Drag a file onto the input bar
  const onDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
      setDropTarget(true);
    }
  };
  const onDragLeave = (e: React.DragEvent) => {
    if ((e.relatedTarget as Node | null) === null || !wrapRef.current?.contains(e.relatedTarget as Node | null)) {
      setDropTarget(false);
    }
  };
  const onDrop = async (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes('Files')) return;
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(false);
    if (e.dataTransfer.files.length > 0) {
      await addFiles(e.dataTransfer.files);
    }
  };

  // Top-edge resize: pointermove updates height
  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    const startY = e.clientY;
    const startH = height;
    const move = (ev: PointerEvent) => {
      // Dragging up = larger height
      const next = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT(), startH + (startY - ev.clientY)));
      setHeight(next);
    };
    const up = () => {
      setResizing(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      localStorage.setItem(HEIGHT_KEY, String(height));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // Persist height when it actually settles (debounced via stable setter on each change)
  useEffect(() => {
    if (!resizing) localStorage.setItem(HEIGHT_KEY, String(height));
  }, [height, resizing]);

  const placeholder = pending.length > 0
    ? `Ask about the ${pending.length === 1 ? 'attached file' : `${pending.length} attached files`}…`
    : 'Ask Claude. Type / to focus. @ to reference. Drop a file or click 📎 to attach.';

  return (
    <div
      ref={wrapRef}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        position: 'fixed',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(820px, 92vw)',
        pointerEvents: 'auto',
        zIndex: 100
      }}
    >
      {showCompletions && (
        <div style={{
          position: 'absolute',
          bottom: height + (pending.length > 0 ? 56 : 12),
          left: 12,
          background: 'rgba(20, 22, 27, 0.95)',
          border: '1px solid #2A2D34',
          borderRadius: 6,
          padding: '4px 0',
          minWidth: 200,
          backdropFilter: 'blur(8px)'
        }}>
          {completions.map((n, i) => (
            <div
              key={n}
              onMouseDown={e => { e.preventDefault(); acceptCompletion(n); }}
              style={{
                padding: '6px 12px',
                cursor: 'pointer',
                color: i === completionIndex ? '#5EEAD4' : '#E8EAED',
                background: i === completionIndex ? 'rgba(94, 234, 212, 0.08)' : 'transparent',
                fontSize: 13
              }}
            >
              @{n}
            </div>
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          padding: '6px 8px',
          marginBottom: 4,
          background: 'rgba(20, 22, 27, 0.85)',
          border: '1px solid #2A2D34',
          borderRadius: 8,
          backdropFilter: 'blur(8px)'
        }}>
          {pending.map(p => (
            <span
              key={p.uiId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 8px',
                background: 'rgba(94,234,212,0.08)',
                border: '1px solid rgba(94,234,212,0.35)',
                borderRadius: 999,
                color: '#E8EAED',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace'
              }}
              title={`${p.filename} · ${p.mime} · ${formatBytes(p.size)}`}
            >
              <span>{fileIcon(p.mime, p.filename)}</span>
              <span style={{
                maxWidth: 160,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>{p.filename}</span>
              <span style={{ color: '#5A5F68', fontSize: 9 }}>{formatBytes(p.size)}</span>
              <button
                onClick={() => removePending(p.uiId)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FB7185',
                  cursor: 'pointer',
                  fontSize: 12,
                  padding: 0,
                  lineHeight: 1
                }}
                title="Remove"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div style={{
        position: 'relative',
        background: 'rgba(20, 22, 27, 0.85)',
        border: dropTarget ? '1px solid #5EEAD4' : '1px solid #2A2D34',
        borderRadius: 12,
        backdropFilter: 'blur(10px)',
        height,
        boxShadow: dropTarget ? '0 0 0 3px rgba(94,234,212,0.15)' : 'none',
        transition: resizing ? 'none' : 'border-color 120ms ease, box-shadow 120ms ease'
      }}>
        {/* Top-edge resize handle */}
        <div
          onPointerDown={startResize}
          style={{
            position: 'absolute',
            top: -4,
            left: 0,
            right: 0,
            height: 8,
            cursor: 'ns-resize',
            zIndex: 2
          }}
          title="Drag to resize"
        >
          <div style={{
            position: 'absolute',
            top: 3,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 38,
            height: 3,
            borderRadius: 2,
            background: resizing ? '#5EEAD4' : '#2A2D34',
            opacity: resizing ? 1 : 0.7
          }} />
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          placeholder={placeholder}
          disabled={submitting}
          style={{
            width: '100%',
            height: '100%',
            padding: '14px 60px 14px 18px',
            background: 'transparent',
            border: 'none',
            color: '#E8EAED',
            fontSize: 14,
            lineHeight: 1.4,
            outline: 'none',
            fontFamily: 'inherit',
            resize: 'none',
            boxSizing: 'border-box'
          }}
        />

        {/* Paperclip + hidden file input */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={submitting}
          title="Attach files (or drag onto the bar / paste)"
          style={{
            position: 'absolute',
            bottom: 10,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: 6,
            background: 'rgba(94,234,212,0.08)',
            border: '1px solid rgba(94,234,212,0.35)',
            color: '#5EEAD4',
            cursor: 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
          }}
        >
          📎
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={async e => {
            if (e.target.files) await addFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {dropTarget && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5EEAD4',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            pointerEvents: 'none',
            background: 'rgba(94,234,212,0.04)',
            borderRadius: 11
          }}>
            drop to attach to this prompt
          </div>
        )}
      </div>
    </div>
  );
}
