/**
 * B07 — pivot-to-selection policy.
 */
import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import { computePivot, PIVOT_MAX } from '../../renderer/src/scene/camera/pivotPolicy';

function pos(x: number, y: number, z: number) { return { x, y, z }; }

describe('computePivot', () => {
  it('returns null for empty selection', () => {
    const r = computePivot({ selectedIds: new Set(), positions: new Map() });
    expect(r).toBeNull();
  });

  it('returns single artifact position', () => {
    const r = computePivot({
      selectedIds: new Set(['a']),
      positions: new Map([['a', pos(1, 2, 3)]])
    });
    expect(r?.target).toEqual(new Vector3(1, 2, 3));
  });

  it('returns bounding-box centroid for 2-3 selected', () => {
    const r = computePivot({
      selectedIds: new Set(['a', 'b']),
      positions: new Map([
        ['a', pos(0, 0, 0)],
        ['b', pos(4, 2, -2)]
      ])
    });
    expect(r?.target).toEqual(new Vector3(2, 1, -1));
  });

  it(`returns null for >${PIVOT_MAX} selected (anti-jitter)`, () => {
    const ids = new Set<string>();
    const positions = new Map<string, { x: number; y: number; z: number }>();
    for (let i = 0; i <= PIVOT_MAX; i++) {
      ids.add(`a${i}`);
      positions.set(`a${i}`, pos(i, 0, 0));
    }
    expect(computePivot({ selectedIds: ids, positions })).toBeNull();
  });

  it('returns null when no selected id has a known position', () => {
    const r = computePivot({
      selectedIds: new Set(['ghost']),
      positions: new Map()
    });
    expect(r).toBeNull();
  });

  it('ignores selected ids without a known position when computing centroid', () => {
    const r = computePivot({
      selectedIds: new Set(['a', 'ghost']),
      positions: new Map([['a', pos(5, 5, 5)]])
    });
    expect(r?.target).toEqual(new Vector3(5, 5, 5));
  });
});
