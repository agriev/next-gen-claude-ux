import { useEffect, useRef, useState } from 'react';
import { useWorldStore } from '../store/world-store';

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string; confidence: number };
  }>;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: { new (): SpeechRecognitionLike };
    webkitSpeechRecognition?: { new (): SpeechRecognitionLike };
  }
}

type Mode = 'idle' | 'ptt' | 'continuous';

const ERROR_MSG: Record<string, string> = {
  'not-allowed': 'mic permission denied — check System Settings → Privacy → Microphone',
  'service-not-allowed': 'Speech service unavailable in this Electron build (Chromium uses Google API which is offline-blocked). Use keyboard for now',
  'no-speech': 'no speech detected',
  'audio-capture': 'no microphone',
  'network': 'network unavailable (Web Speech needs internet)',
  'aborted': 'aborted',
  'bad-grammar': 'grammar error',
  'language-not-supported': 'language not supported'
};

export function VoiceController() {
  const supported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const [mode, setMode] = useState<Mode>('idle');
  const [partial, setPartial] = useState('');
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permGranted, setPermGranted] = useState<boolean | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const focusedId = useWorldStore(s => s.focusedArtifactId);
  const setFocused = useWorldStore(s => s.setFocusedArtifact);

  // Try to acquire mic permission on mount
  useEffect(() => {
    if (!supported) return;
    let cancel = false;
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then(stream => {
        if (cancel) { stream.getTracks().forEach(t => t.stop()); return; }
        // Release stream — we just wanted to trigger permission grant
        stream.getTracks().forEach(t => t.stop());
        setPermGranted(true);
      })
      .catch(err => {
        console.warn('[voice] getUserMedia failed', err);
        setPermGranted(false);
        setError('mic permission required');
      });
    return () => { cancel = true; };
  }, [supported]);

  const start = (m: Mode) => {
    if (!supported) return;
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return;
    setError(null);

    let finalText = '';
    const rec = new Ctor();
    rec.continuous = m === 'continuous';
    rec.interimResults = true;
    rec.lang = navigator.language?.startsWith('ru') ? 'ru-RU' : 'en-US';

    rec.onstart = () => {
      console.log('[voice] started', m, rec.lang);
      setRecording(true);
      setMode(m);
    };
    rec.onresult = e => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const transcript = r[0].transcript;
        if (r.isFinal) finalText += transcript + ' ';
        else interim += transcript;
      }
      setPartial(finalText + (interim ? ` · ${interim}` : ''));
    };
    rec.onerror = (err: SpeechRecognitionErrorEvent) => {
      const code = err.error ?? 'unknown';
      console.warn('[voice] error', code, err.message);
      setError(ERROR_MSG[code] ?? `error: ${code}`);
      setRecording(false);
      setMode('idle');
    };
    rec.onend = () => {
      console.log('[voice] ended');
      setRecording(false);
      const text = finalText.trim();
      if (text) submit(text);
      setPartial('');
      setMode(prev => (prev === 'continuous' && rec === recRef.current) ? 'continuous' : 'idle');
    };

    try {
      rec.start();
      recRef.current = rec;
    } catch (err) {
      console.warn('[voice] start threw', err);
      setError(`failed to start: ${err instanceof Error ? err.message : err}`);
    }
  };

  const stop = () => {
    if (recRef.current) {
      try { recRef.current.stop(); } catch { /* ignore */ }
      recRef.current = null;
    }
    setMode('idle');
  };

  const submit = (text: string) => {
    if (focusedId) {
      void window.api.refineArtifact(focusedId, text);
      setFocused(null);
    } else {
      void window.api.submitUtterance(text, []);
    }
  };

  // Hold-Space PTT
  useEffect(() => {
    if (!supported) return;
    let pttDown = false;
    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target;
      const inEditable =
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        (t instanceof HTMLElement && t.isContentEditable);
      if (e.code === 'Space' && !pttDown && !inEditable && !e.repeat) {
        e.preventDefault();
        pttDown = true;
        start('ptt');
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && pttDown) {
        pttDown = false;
        if (mode === 'ptt' || recording) stop();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [supported, mode, recording]);

  if (!supported) {
    return (
      <div style={chipBox}>
        <span style={chip('#5A5F68')}>🎙 voice n/a</span>
      </div>
    );
  }

  return (
    <div style={chipBox}>
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onMouseDown={() => start('ptt')}
          onMouseUp={() => mode === 'ptt' && stop()}
          onMouseLeave={() => mode === 'ptt' && stop()}
          style={{ ...chip(recording && mode === 'ptt' ? '#FB7185' : '#5EEAD4'), cursor: 'pointer', border: '1px solid' }}
          title="Hold (or hold Space) to talk"
        >
          {recording && mode === 'ptt' ? '● rec' : '🎙 PTT'}
        </button>
        <button
          onClick={() => mode === 'continuous' ? stop() : start('continuous')}
          style={{ ...chip(mode === 'continuous' ? '#FB7185' : '#A78BFA'), cursor: 'pointer', border: '1px solid' }}
          title="Continuous listening toggle"
        >
          {mode === 'continuous' ? '● live' : '∞ cont'}
        </button>
        {focusedId && (
          <span style={chip('#5EEAD4')}>focus → @{focusedId.slice(0, 6)}</span>
        )}
      </div>
      {recording && partial && (
        <div style={{
          marginTop: 4,
          padding: '4px 8px',
          background: 'rgba(20,22,27,0.92)',
          border: '1px solid #5EEAD455',
          borderRadius: 4,
          color: '#E8EAED',
          fontSize: 10,
          maxWidth: 360,
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          {partial.slice(0, 200)}
        </div>
      )}
      {error && (
        <div style={{
          marginTop: 4,
          padding: '4px 8px',
          background: 'rgba(251,113,133,0.08)',
          border: '1px solid #FB718555',
          borderRadius: 4,
          color: '#FB7185',
          fontSize: 10,
          maxWidth: 380,
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          {error}
          {permGranted === false && <div style={{ marginTop: 2, color: '#8A8F98' }}>Tip: open Mac System Settings → Privacy → Microphone, allow Electron</div>}
        </div>
      )}
    </div>
  );
}

const chipBox: React.CSSProperties = {
  position: 'fixed',
  bottom: 80,
  left: 12 + 130,
  pointerEvents: 'auto',
  zIndex: 70,
  fontFamily: 'JetBrains Mono, monospace',
  display: 'flex',
  flexDirection: 'column'
};

function chip(color: string): React.CSSProperties {
  return {
    padding: '3px 8px',
    background: 'rgba(20,22,27,0.85)',
    borderColor: color,
    borderRadius: 4,
    color,
    fontSize: 10,
    fontFamily: 'inherit',
    backdropFilter: 'blur(8px)',
    display: 'inline-block'
  };
}
