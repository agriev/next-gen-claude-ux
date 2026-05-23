/**
 * ReasoningThread — B06 (one idiom MVP). Shows the live agent reasoning
 * trace floating in 3D next to the active Worker spinner, so the user
 * can SEE what the agent is thinking without scanning the activity HUD.
 *
 * Idiom chosen: vertical thread anchored near each running Worker. We
 * read the last 8 agent-log entries for the spinner's actionId from the
 * store, render them stacked top-down as SDF labels with role-colored
 * leader bars. Thoughts fade past 5 entries; tool calls always remain
 * solid because they're the verifiable signal.
 *
 * The other two idioms from the BACKLOG (per-agent lane, tree-of-spans)
 * are landing in B06.2; this one is the default. They will be selectable
 * via a `?trace_idiom=vertical|lane|tree` URL flag once the others ship.
 *
 * Pure R3F (no DOM); positioned in world coords slightly offset from
 * the spinner so it doesn't overlap.
 */
import { useMemo } from 'react';
import { useWorldStore } from '../store/world-store';
import { Label } from './text/Label';
import type { ActionLogEntry } from '@shared/types';

const KIND_COLOR: Record<NonNullable<ActionLogEntry['kind']>, string> = {
  tool: '#5EEAD4',
  thought: '#9CA3AF',
  note: '#FBBF24'
};

const MAX_LINES = 8;
const LINE_HEIGHT = 0.22;

function trim(text: string, n = 60): string {
  return text.length > n ? text.slice(0, n - 1) + '…' : text;
}

interface ThreadProps {
  actionId: string;
  position: { x: number; y: number; z: number };
}

function Thread({ actionId, position }: ThreadProps) {
  const logs = useWorldStore(s => s.actionLogs.get(actionId)) ?? [];
  const visible = logs.slice(-MAX_LINES);
  // Place top of column at spawn position + offset, growing DOWN.
  const startY = 0;
  return (
    <group position={[position.x + 1.7, position.y + 1.4, position.z]}>
      {/* anchor label */}
      <Label
        position={[0, startY + 0.32, 0]}
        fontSize={0.13}
        color="#5EEAD4"
        anchorX="left"
        outlineWidth={0.01}
      >
        Worker reasoning →
      </Label>
      {visible.map((entry, i) => {
        const y = startY - i * LINE_HEIGHT;
        const kind = entry.kind ?? 'note';
        const color = KIND_COLOR[kind];
        // Thought lines fade older entries; tool calls keep full opacity.
        const ageOpacity = kind === 'tool'
          ? 1
          : Math.max(0.45, 1 - i * 0.07);
        return (
          <group key={`${entry.ts}-${i}`} position={[0, y, 0]}>
            <mesh position={[-0.06, 0, 0]}>
              <planeGeometry args={[0.018, LINE_HEIGHT - 0.04]} />
              <meshBasicMaterial color={color} transparent opacity={ageOpacity} depthWrite={false} />
            </mesh>
            <Label
              position={[0, 0, 0]}
              fontSize={0.105}
              color="#E8EAED"
              anchorX="left"
              anchorY="middle"
              outlineWidth={0.007}
              opacity={ageOpacity}
            >
              {trim(entry.text, 56)}
            </Label>
          </group>
        );
      })}
    </group>
  );
}

export function ReasoningThreads() {
  const spinners = useWorldStore(s => s.workerSpinners);
  const list = useMemo(() => [...spinners.values()], [spinners]);
  if (list.length === 0) return null;
  return (
    <group>
      {list.map(s => (
        <Thread key={s.actionId} actionId={s.actionId} position={s.position} />
      ))}
    </group>
  );
}
