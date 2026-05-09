import { useState, useRef, useEffect, useMemo } from 'react';
import { useWorldStore } from '../store/world-store';

const AT_REGEX = /@([\w-]*)$/;

export function InputBar() {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCompletions, setShowCompletions] = useState(false);
  const [completionIndex, setCompletionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
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

  const focusInput = () => inputRef.current?.focus();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        focusInput();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
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

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    const refs = extractRefs(trimmed);
    try {
      await window.api.submitUtterance(trimmed, refs);
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showCompletions && completions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setCompletionIndex(i => (i + 1) % completions.length); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setCompletionIndex(i => (i - 1 + completions.length) % completions.length); return; }
      if (e.key === 'Tab' || (e.key === 'Enter' && completions[completionIndex])) {
        e.preventDefault();
        acceptCompletion(completions[completionIndex]);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 12,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'min(820px, 92vw)',
      pointerEvents: 'auto',
      zIndex: 100
    }}>
      {showCompletions && (
        <div style={{
          position: 'absolute',
          bottom: 60,
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
      <input
        ref={inputRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask Claude. Type / to focus. @ to reference an artifact."
        disabled={submitting}
        style={{
          width: '100%',
          height: 56,
          padding: '0 18px',
          background: 'rgba(20, 22, 27, 0.85)',
          border: '1px solid #2A2D34',
          borderRadius: 12,
          color: '#E8EAED',
          fontSize: 14,
          outline: 'none',
          backdropFilter: 'blur(10px)',
          fontFamily: 'inherit'
        }}
      />
    </div>
  );
}
