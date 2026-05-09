import { Vector3 } from 'three';

/**
 * Singleton registry of live (per-frame) positions of artifacts.
 * Mutable Vector3 instances; do NOT replace them — mutate in place
 * so consumers can keep stable refs across frames.
 */
const positions = new Map<string, Vector3>();

export function setLivePos(id: string, x: number, y: number, z: number): void {
  let v = positions.get(id);
  if (!v) {
    v = new Vector3(x, y, z);
    positions.set(id, v);
  } else {
    v.set(x, y, z);
  }
}

export function getLivePos(id: string): Vector3 | undefined {
  return positions.get(id);
}

export function removeLivePos(id: string): void {
  positions.delete(id);
}

export function clearLivePos(): void {
  positions.clear();
}
