/**
 * Horseshoe layout — deterministic console-mode placement of panels into
 * five slots (P / W1 / W2 / A1 / A2) derived from WS-12 (multi-dashboard
 * spatial composition; pilot cockpit grouping). B18 in BACKLOG-v2.md.
 *
 * The slots wrap a stationary viewer at +Z=10 looking toward the origin:
 *
 *        A1            P            A2
 *   (-9, 5.5, 0)  (0, 5.5, 0)  (9, 5.5, 0)
 *           W1               W2
 *      (-4.5, 5.5, 4)   (4.5, 5.5, 4)
 *
 * Panels are sorted by an `attention_rank`-ish heuristic (pinned first,
 * then largest size, then most recent) before being mapped onto slots in
 * the order [P, W1, W2, A1, A2]. Panels beyond slot 5 go to an overflow
 * row above the horseshoe — visible but de-emphasised.
 *
 * This is a pure function over panel data + returns new positions; the
 * caller persists via `world.upsertPanel()`. No LLM round-trip so the
 * Tab-to-console transition feels instant.
 */
import type { Panel, Vec3 } from '../../../shared/types';

const SLOTS: Vec3[] = [
  { x: 0,    y: 5.5, z: 0 },    // P  — primary, dead-center
  { x: -4.5, y: 5.5, z: 4 },    // W1 — left wing, slightly forward
  { x: 4.5,  y: 5.5, z: 4 },    // W2 — right wing, slightly forward
  { x: -9,   y: 5.5, z: 0 },    // A1 — far left ambient
  { x: 9,    y: 5.5, z: 0 }     // A2 — far right ambient
];

const OVERFLOW_Y = 8.3;
const OVERFLOW_SPACING_X = 4.5;

function rankPanel(p: Panel): number {
  let r = 0;
  if (p.pinned) r += 1000;
  r += p.size.w * p.size.h;          // bigger panels rank higher
  r += (p.updatedAt - Date.now()) / 1e9; // recency tie-breaker (tiny weight)
  return r;
}

export interface HorseshoePlacement {
  id: string;
  position: Vec3;
  /** Which slot or overflow index this panel landed in (for telemetry). */
  slot: 'P' | 'W1' | 'W2' | 'A1' | 'A2' | `overflow-${number}`;
}

export function computeHorseshoePlacements(panels: Panel[]): HorseshoePlacement[] {
  const sorted = [...panels].sort((a, b) => rankPanel(b) - rankPanel(a));
  const slotNames: HorseshoePlacement['slot'][] = ['P', 'W1', 'W2', 'A1', 'A2'];
  const out: HorseshoePlacement[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i < SLOTS.length) {
      out.push({ id: sorted[i].id, position: SLOTS[i], slot: slotNames[i] });
    } else {
      const j = i - SLOTS.length;
      const totalOverflow = sorted.length - SLOTS.length;
      const xCenter = (j - (totalOverflow - 1) / 2) * OVERFLOW_SPACING_X;
      out.push({
        id: sorted[i].id,
        position: { x: xCenter, y: OVERFLOW_Y, z: 0 },
        slot: `overflow-${j}`
      });
    }
  }
  return out;
}
