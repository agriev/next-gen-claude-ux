/**
 * TimeScrubber — B26 (scaffold). A horizontal slider at the bottom of
 * the canvas that shows the timeline of recorded world events and lets
 * the user scrub back. V0 surfaces the *count* of recorded events plus
 * a visual scrubber widget; real replay (snapshot diffing) lands in
 * B26.2 — for V0 the scrubber is informational only.
 *
 * Why scaffold-first: building a true time-travel engine requires
 * snapshotting WorldState at every event boundary, which is a separate
 * disk/memory engineering effort. Surfacing the UI now means we can
 * iterate on the affordance before committing to the persistence model.
 *
 * The widget collapses to a single chip when no events have been
 * recorded in the last 30s, so it stays out of the way during quiet
 * stretches.
 */
import { useEffect, useState } from 'react';
import { useWorldStore } from '../store/world-store';

export function TimeScrubber() {
  // Build a rolling event-count buffer from the action log map. Each
  // action's logs are timestamped, so we can derive a recent-events
  // count without instrumenting every store event.
  const actionLogs = useWorldStore(s => s.actionLogs);
  const [now, setNow] = useState(() => Date.now());
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Count events in the last 5 minutes, bucketed per second.
  const WINDOW_MS = 5 * 60 * 1000;
  const BUCKETS = 60;
  const bucketSize = WINDOW_MS / BUCKETS;
  const buckets = new Array(BUCKETS).fill(0) as number[];
  let total = 0;
  for (const logs of actionLogs.values()) {
    for (const entry of logs) {
      const dt = now - entry.ts;
      if (dt < 0 || dt > WINDOW_MS) continue;
      const idx = Math.min(BUCKETS - 1, Math.floor(dt / bucketSize));
      buckets[BUCKETS - 1 - idx]++;
      total++;
    }
  }
  const max = Math.max(1, ...buckets);

  // Hide entirely if no recent activity at all.
  if (total === 0) return null;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'fixed',
        bottom: 96,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 60,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        background: 'rgba(20,22,27,0.85)',
        border: '1px solid #2A2D34',
        borderRadius: 8,
        padding: hover ? '8px 14px' : '4px 10px',
        backdropFilter: 'blur(10px)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        color: '#9CA3AF',
        transition: 'padding 120ms ease'
      }}
      title="Time-scrubber · click to scrub (playback ships in B26.2)"
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: hover ? 36 : 18 }}>
        {buckets.map((v, i) => {
          const h = (v / max) * (hover ? 32 : 14);
          return (
            <div
              key={i}
              style={{
                width: 4,
                height: Math.max(2, h),
                background: v > 0 ? '#A78BFA' : '#2A2D34',
                opacity: v > 0 ? 0.8 : 0.4,
                borderRadius: 1
              }}
            />
          );
        })}
      </div>
      <div style={{ color: '#5A5F68' }}>
        {total} event{total === 1 ? '' : 's'} · last 5min · scrubber preview
      </div>
    </div>
  );
}
