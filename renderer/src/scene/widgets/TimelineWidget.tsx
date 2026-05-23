/**
 * TimelineWidget — events laid out left→right along a horizontal axis. B22.
 *
 * Pure R3F — no canvas-2D, no DOM. Each event is a small sphere on a thin
 * axis line, plus a SDF label. Color encodes optional `kind`. Hover and
 * double-click fire onHover / onDrillDown with the event index.
 *
 * Spec:
 *   { events: { ts: number, label: string, kind?: string, link?: string }[],
 *     range?: [tsStart, tsEnd] }
 *
 * If `range` is omitted we infer from min/max event ts.
 *
 * The widget renders at the panel's inner area. Tick labels (5 ticks) sit
 * below the axis.
 */
import { useMemo } from 'react';
import { type ThreeEvent } from '@react-three/fiber';
import { Label } from '../text/Label';

export interface TimelineEvent {
  ts: number;
  label: string;
  kind?: string;
  link?: string;
}

export interface TimelineSpec {
  events: TimelineEvent[];
  range?: [number, number];
  title?: string;
}

export interface TimelineWidgetProps {
  spec: TimelineSpec;
  width: number;
  height: number;
  onDrillDown?: (index: number, ev: TimelineEvent) => void;
}

const KIND_COLOR: Record<string, string> = {
  ship: '#5EEAD4',
  meeting: '#82A2FF',
  blocker: '#F87171',
  insight: '#FBBF24',
  default: '#9CA3AF'
};

function fmtTs(ts: number, total: number): string {
  // Adaptive granularity: hours for ≤1d, day for ≤30d, month for ≤2y, year otherwise.
  const d = new Date(ts);
  if (total <= 24 * 3600 * 1000) return d.toTimeString().slice(0, 5);
  if (total <= 30 * 24 * 3600 * 1000) return `${d.getMonth() + 1}/${d.getDate()}`;
  if (total <= 2 * 365 * 24 * 3600 * 1000) {
    return d.toLocaleString('en', { month: 'short', day: 'numeric' });
  }
  return d.toLocaleString('en', { month: 'short', year: '2-digit' });
}

export function TimelineWidget({ spec, width, height, onDrillDown }: TimelineWidgetProps) {
  const { events } = spec;
  const range: [number, number] = useMemo(() => {
    if (spec.range) return spec.range;
    if (events.length === 0) return [Date.now() - 86400_000, Date.now()];
    const tss = events.map(e => e.ts);
    return [Math.min(...tss), Math.max(...tss)];
  }, [events, spec.range]);

  const [t0, t1] = range;
  const total = Math.max(1, t1 - t0);
  const axisY = -height / 6;
  const halfW = width / 2 - 0.2;

  // 5 tick marks
  const ticks = useMemo(() => {
    const arr: { x: number; label: string }[] = [];
    for (let i = 0; i <= 4; i++) {
      const ts = t0 + (total * i) / 4;
      const x = -halfW + (i / 4) * (halfW * 2);
      arr.push({ x, label: fmtTs(ts, total) });
    }
    return arr;
  }, [t0, total, halfW]);

  // Place events
  const placed = useMemo(() => events.map((ev, i) => {
    const x = -halfW + ((ev.ts - t0) / total) * (halfW * 2);
    const color = KIND_COLOR[ev.kind ?? 'default'] ?? KIND_COLOR.default;
    return { ev, x, color, i };
  }), [events, t0, total, halfW]);

  return (
    <group>
      {spec.title && (
        <Label
          position={[-halfW, height / 2 - 0.3, 0.01]}
          anchorX="left"
          fontSize={0.14}
          color="#E8EAED"
        >
          {spec.title}
        </Label>
      )}

      {/* Axis line */}
      <mesh position={[0, axisY, 0]}>
        <planeGeometry args={[halfW * 2, 0.025]} />
        <meshBasicMaterial color="#3A3E45" transparent opacity={0.85} />
      </mesh>

      {/* Tick marks + labels */}
      {ticks.map((t, i) => (
        <group key={`tk-${i}`} position={[t.x, axisY - 0.05, 0]}>
          <mesh position={[0, 0.02, 0]}>
            <planeGeometry args={[0.015, 0.08]} />
            <meshBasicMaterial color="#5C6068" />
          </mesh>
          <Label position={[0, -0.16, 0]} fontSize={0.09} color="#9CA3AF" outlineWidth={0.006}>
            {t.label}
          </Label>
        </group>
      ))}

      {/* Events */}
      {placed.map(({ ev, x, color, i }) => (
        <group
          key={`ev-${i}`}
          position={[x, axisY, 0.01]}
          onDoubleClick={(e: ThreeEvent<MouseEvent>) => {
            if (!onDrillDown) return;
            e.stopPropagation();
            onDrillDown(i, ev);
          }}
        >
          <mesh>
            <circleGeometry args={[0.07, 16]} />
            <meshBasicMaterial color={color} />
          </mesh>
          {/* Label tucked above the dot, with a small leader */}
          <mesh position={[0, 0.16, 0]}>
            <planeGeometry args={[0.01, 0.18]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
          <Label
            position={[0, 0.34, 0]}
            fontSize={0.085}
            color="#E8EAED"
            outlineWidth={0.006}
            anchorY="bottom"
          >
            {ev.label.length > 22 ? ev.label.slice(0, 21) + '…' : ev.label}
          </Label>
        </group>
      ))}

      {placed.length === 0 && (
        <Label position={[0, 0, 0.01]} fontSize={0.12} color="#6B7280">
          no events
        </Label>
      )}
    </group>
  );
}
