import { useEffect, useState } from 'react';
import { useWorldStore } from '../store/world-store';

const STEPS = [
  {
    title: 'Welcome to Jarvis',
    body: 'A spatial workspace where Claude turns your prompts into named cards. Connections, layout, and history are all visible.',
    hint: 'Press Esc to skip'
  },
  {
    title: 'Type or paste to create',
    body: 'Bottom bar: type a prompt and Enter — Claude makes a card. Paste an image or drop a file — it becomes a card too.',
    hint: 'Try: "write a haiku about the sea"'
  },
  {
    title: 'Reference cards by @name',
    body: 'Type @ to autocomplete card names. Use them to direct Claude: "summarize @Atlas". Double-click any card for full content + edit.',
    hint: 'F = frame all · Cmd+F = search · T = top-down · ? = full shortcuts'
  }
];

export function Onboarding() {
  const dismissed = useWorldStore(s => s.onboardingDismissed);
  const setDismissed = useWorldStore(s => s.setOnboardingDismissed);
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (dismissed) { setShow(false); return; }
    let cancel = false;
    const seen = localStorage.getItem('jarvis.onboarded') === '1';
    if (seen) { setDismissed(); setShow(false); return; }
    window.api.isOnboarded().then(ok => {
      if (cancel) return;
      if (ok) {
        localStorage.setItem('jarvis.onboarded', '1');
        setDismissed();
      } else {
        setShow(true);
      }
    }).catch(() => setShow(true));
    return () => { cancel = true; };
  }, [dismissed, setDismissed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!show) return;
      if (e.key === 'Escape') skip();
      if (e.key === 'Enter' || e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') setStep(s => Math.max(0, s - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, step]);

  const skip = () => {
    localStorage.setItem('jarvis.onboarded', '1');
    void window.api.setOnboardedFlag();
    setDismissed();
    setShow(false);
  };

  const next = () => {
    if (step >= STEPS.length - 1) skip();
    else setStep(step + 1);
  };

  if (!show) return null;
  const s = STEPS[step];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(10,11,14,0.7)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'auto'
    }}>
      <div style={{
        width: 'min(520px, 90vw)',
        background: 'rgba(20,22,27,0.97)',
        border: '1px solid #5EEAD455',
        borderRadius: 10,
        padding: 24,
        color: '#E8EAED',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)'
      }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1, height: 3, borderRadius: 2,
                background: i <= step ? '#5EEAD4' : '#2A2D34',
                transition: 'background 0.25s'
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>{s.title}</div>
        <div style={{ fontSize: 14, lineHeight: 1.55, color: '#B5BAC2', marginBottom: 18 }}>{s.body}</div>
        <div style={{ fontSize: 12, color: '#5EEAD4', fontFamily: 'JetBrains Mono, monospace', marginBottom: 18 }}>
          {s.hint}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={skip} style={btnSkip}>Skip</button>
          <span style={{ flex: 1 }} />
          {step > 0 && <button onClick={() => setStep(step - 1)} style={btnSecondary}>← Back</button>}
          <button onClick={next} style={btnPrimary}>
            {step >= STEPS.length - 1 ? "Let's go" : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  background: '#5EEAD4', border: 'none', borderRadius: 5,
  color: '#0A0B0E', fontSize: 13, fontWeight: 600, padding: '8px 16px',
  cursor: 'pointer', fontFamily: 'inherit'
};
const btnSecondary: React.CSSProperties = {
  background: 'transparent', border: '1px solid #2A2D34', borderRadius: 5,
  color: '#E8EAED', fontSize: 12, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit'
};
const btnSkip: React.CSSProperties = {
  background: 'transparent', border: 'none', color: '#5A5F68',
  fontSize: 12, cursor: 'pointer', fontFamily: 'inherit'
};
