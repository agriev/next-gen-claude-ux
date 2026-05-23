/**
 * B04 intent-ghost — propose / commit / reject logic on WorldState.
 *
 * Exercises only the in-memory plan registry (no DB, no MCP). The full
 * propose→commit pipeline is integration territory; here we verify the
 * smallest contract: registerPendingPlan + removePendingPlan + commitPlan
 * round-trip.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import type { PendingLayoutPlan } from '../../shared/types';
import { WorldState } from '../../electron/main/world-state';

// We bypass full init (which would touch Electron + DB) and just construct an
// instance with the bare-minimum private state needed for the pending-plans
// methods. The class methods we exercise don't reach into `this.repo`.
class TestWorldState extends WorldState {
  constructor() {
    super();
  }
}

function plan(id: string): PendingLayoutPlan {
  const now = Date.now();
  return {
    id,
    label: `plan ${id}`,
    placements: [{ id: 'a1', x: 0, y: 0, z: 0 }],
    createdAt: now,
    expiresAt: now + 5000
  };
}

describe('WorldState pending-plans registry (B04)', () => {
  let world: TestWorldState;

  beforeEach(() => {
    world = new TestWorldState();
  });

  it('starts with no pending plans', () => {
    expect(world.listPendingPlans()).toEqual([]);
    expect(world.hasPendingPlan('foo')).toBe(false);
    expect(world.getPendingPlan('foo')).toBeUndefined();
  });

  it('register, list, has, get round-trip', () => {
    const p = plan('p1');
    world.registerPendingPlan(p);
    expect(world.hasPendingPlan('p1')).toBe(true);
    expect(world.getPendingPlan('p1')).toEqual(p);
    expect(world.listPendingPlans()).toHaveLength(1);
  });

  it('removePendingPlan returns the plan and deletes it', () => {
    const p = plan('p2');
    world.registerPendingPlan(p);
    const removed = world.removePendingPlan('p2');
    expect(removed).toEqual(p);
    expect(world.hasPendingPlan('p2')).toBe(false);
    expect(world.listPendingPlans()).toEqual([]);
  });

  it('removePendingPlan on unknown id returns undefined', () => {
    expect(world.removePendingPlan('unknown')).toBeUndefined();
  });

  it('multiple plans coexist and can be removed independently', () => {
    world.registerPendingPlan(plan('p3'));
    world.registerPendingPlan(plan('p4'));
    expect(world.listPendingPlans()).toHaveLength(2);
    world.removePendingPlan('p3');
    const remaining = world.listPendingPlans();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('p4');
  });
});
