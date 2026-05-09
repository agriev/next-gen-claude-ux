import { useState, useEffect, useRef } from 'react';
import { useWorldStore } from '../store/world-store';
import { MODEL_CATALOG } from '@shared/types';

type Role = 'worker' | 'layout' | 'listening' | 'naming';

const ROLE_LABEL: Record<Role, string> = {
  worker: 'Worker',
  layout: 'Layout',
  listening: 'Listening',
  naming: 'Naming'
};

const ROLE_HINT: Record<Role, string> = {
  worker: 'handles your text/voice commands · changes apply on next prompt',
  layout: 'arranges cards & clusters · live-switch via setModel',
  listening: 'parses voice/text into actions · live-switch via setModel',
  naming: 'auto-names artifacts · changes apply on next naming task'
};

const TIER_COLOR: Record<string, string> = {
  max: '#FB7185',
  balanced: '#5EEAD4',
  fast: '#A78BFA'
};

function shortLabel(modelId: string): string {
  const m = MODEL_CATALOG.find(x => x.id === modelId);
  return m?.label ?? modelId.replace('claude-', '').replace('-20251001', '');
}

export function ModelPicker() {
  const settings = useWorldStore(s => s.modelSettings);
  const [open, setOpen] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', onDoc);
    return () => window.removeEventListener('mousedown', onDoc);
  }, [open]);

  const setModel = (role: Role, modelId: string) => {
    void window.api.setModel(role, modelId);
  };

  const tierOf = (modelId: string) =>
    MODEL_CATALOG.find(m => m.id === modelId)?.tier ?? 'fast';

  return (
    <div ref={ref} style={{
      position: 'fixed',
      top: 8,
      left: 620,
      zIndex: 90,
      pointerEvents: 'auto',
      fontFamily: 'JetBrains Mono, monospace'
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Choose models for each agent role"
        style={{
          padding: '4px 10px',
          background: 'rgba(20,22,27,0.85)',
          border: `1px solid ${TIER_COLOR[tierOf(settings.worker)]}55`,
          borderRadius: 999,
          color: TIER_COLOR[tierOf(settings.worker)],
          fontSize: 11,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)'
        }}
      >
        ◐ {shortLabel(settings.worker)}
        <span style={{ color: '#5A5F68', marginLeft: 6 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 30, left: 0,
          minWidth: 320,
          background: 'rgba(20,22,27,0.96)',
          border: '1px solid #2A2D34',
          borderRadius: 6,
          backdropFilter: 'blur(10px)',
          padding: 4
        }}>
          <RoleRow role="worker" current={settings.worker} onPick={setModel} />
          {advanced && (
            <>
              <div style={{ height: 1, background: '#1F2228', margin: '4px 6px' }} />
              <RoleRow role="layout"    current={settings.layout}    onPick={setModel} />
              <RoleRow role="listening" current={settings.listening} onPick={setModel} />
              <RoleRow role="naming"    current={settings.naming}    onPick={setModel} />
            </>
          )}
          <div
            onClick={() => setAdvanced(a => !a)}
            style={{
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: 10,
              color: '#5A5F68',
              borderTop: '1px solid #1F2228',
              marginTop: 4
            }}
          >
            {advanced ? '▾ hide advanced' : '▸ advanced (layout · listening · naming)'}
          </div>
        </div>
      )}
    </div>
  );
}

function RoleRow({ role, current, onPick }: {
  role: Role;
  current: string;
  onPick: (role: Role, model: string) => void;
}) {
  return (
    <div style={{ padding: '6px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ color: '#E8EAED', fontSize: 11 }}>{ROLE_LABEL[role]}</span>
        <span style={{ color: '#5A5F68', fontSize: 9, flex: 1 }}>{ROLE_HINT[role]}</span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {MODEL_CATALOG.map(m => {
          const active = m.id === current;
          return (
            <button
              key={m.id}
              onClick={() => !active && onPick(role, m.id)}
              style={{
                flex: 1,
                padding: '4px 8px',
                background: active ? `${TIER_COLOR[m.tier]}18` : 'rgba(15,16,20,0.85)',
                border: `1px solid ${active ? TIER_COLOR[m.tier] : '#2A2D34'}`,
                borderRadius: 4,
                color: active ? TIER_COLOR[m.tier] : '#8A8F98',
                fontSize: 10,
                fontFamily: 'inherit',
                cursor: active ? 'default' : 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ fontWeight: active ? 600 : 400 }}>{m.label}</div>
              <div style={{ fontSize: 9, color: '#5A5F68' }}>{m.tier} · {m.cost}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
