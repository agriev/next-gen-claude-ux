/**
 * AgentAura — B09 in BACKLOG-v2.md.
 *
 * A diffuse colored halo behind an artifact, fading out over the lifetime of
 * an `aura.flash` event. Color encodes the agent role:
 *   · Worker   — cyan   (#5EEAD4)
 *   · Layout   — lavender(#A78BFA)
 *   · Listening— amber  (#FBBF24)
 *   · Naming   — rose   (#FB7185)
 *
 * Multiple agents can flash the same artifact concurrently — we render one
 * sprite per active role, slightly offset depth-wise so they blend rather
 * than z-fight.
 *
 * AR-readiness: pure R3F (Sprite + SpriteMaterial). No DOM, no Html overlay.
 * The halo billboards toward the camera so it reads correctly from any angle —
 * critical for the future XR build where the camera moves around the scene
 * rather than the scene moving around the camera.
 *
 * Cost: one Sprite per active flash per artifact. We prune expired flashes
 * every render frame (cheap — `auraFlashes.entries()` is small in practice).
 */
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sprite, SpriteMaterial, Color, Group, CanvasTexture, SRGBColorSpace } from 'three';
import type { AgentRole } from '@shared/types';
import { useWorldStore } from '../store/world-store';
import { getLivePos } from './live-transforms';

const ROLE_COLOR: Record<AgentRole, string> = {
  worker:    '#5EEAD4',
  layout:    '#A78BFA',
  listening: '#FBBF24',
  naming:    '#FB7185'
};

/**
 * Pre-baked radial-gradient texture used by every aura sprite. One texture is
 * shared across all sprites; we tint via `material.color`. Avoids a per-flash
 * canvas allocation. The gradient is alpha-only — opaque white center, fully
 * transparent edge — so the sprite material can scale it freely without
 * banding.
 */
function makeRadialTexture(): CanvasTexture {
  // Use OffscreenCanvas — the AR-safe canvas constructor. The DOM-based
  // canvas factory is forbidden in scene/ by ar-audit (it breaks inside
  // WebXR sessions); OffscreenCanvas works the same in workers and on the
  // main thread.
  const size = 256;
  const c = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(size, size)
    : null;
  if (!c) {
    // Fallback: empty 1x1 white pixel. Never happens in Electron — both main
    // and renderer processes ship OffscreenCanvas.
    const tex = new CanvasTexture(new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1) as unknown as HTMLCanvasElement);
    return tex;
  }
  const ctx = c.getContext('2d');
  if (!ctx) {
    return new CanvasTexture(c as unknown as HTMLCanvasElement);
  }
  const cx = size / 2;
  const grad = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
  grad.addColorStop(0.0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.3, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.7, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1.0, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(c as unknown as HTMLCanvasElement);
  tex.colorSpace = SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// Single shared texture for every aura sprite in the app.
const SHARED_AURA_TEXTURE = makeRadialTexture();

const HALO_BASE_SIZE = 2.4;
const HALO_FADE_MS = 600; // fade tail; flash full alpha for (expiresAt - fade) then ease to 0

interface AuraSpriteProps {
  position: [number, number, number];
  role: AgentRole;
  expiresAt: number;
}

function AuraSprite({ position, role, expiresAt }: AuraSpriteProps) {
  const groupRef = useRef<Group>(null);
  const material = useMemo(() => {
    const m = new SpriteMaterial({
      map: SHARED_AURA_TEXTURE,
      color: new Color(ROLE_COLOR[role]),
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });
    return m;
  }, [role]);
  const spriteRef = useRef<Sprite | null>(null);

  if (!spriteRef.current) {
    spriteRef.current = new Sprite(material);
    spriteRef.current.scale.set(HALO_BASE_SIZE, HALO_BASE_SIZE, HALO_BASE_SIZE);
  }

  useEffect(() => () => {
    material.dispose();
  }, [material]);

  useFrame(() => {
    if (!spriteRef.current) return;
    const now = Date.now();
    const remaining = expiresAt - now;
    if (remaining <= 0) {
      material.opacity = 0;
      return;
    }
    // Linear fade in the last HALO_FADE_MS; full alpha before that.
    const t = remaining < HALO_FADE_MS ? remaining / HALO_FADE_MS : 1;
    material.opacity = 0.78 * t;
    // Soft breathe so the halo is recognizable even when t≈1.
    const breathe = 0.95 + 0.08 * Math.sin(now * 0.006);
    spriteRef.current.scale.setScalar(HALO_BASE_SIZE * breathe);
  });

  return (
    <group ref={groupRef} position={position} renderOrder={5}>
      <primitive object={spriteRef.current} />
    </group>
  );
}

/**
 * Top-level component: iterates active aura flashes, looks up live positions
 * (so the halo follows a card mid-drag), and renders one AuraSprite per
 * active (artifact × agentRole) pair.
 */
export function AgentAuras() {
  const auraFlashes = useWorldStore(s => s.auraFlashes);
  const artifacts = useWorldStore(s => s.artifacts);
  const panels = useWorldStore(s => s.panels);

  // Snapshot once per render — pruning is cheap; map is small (<<100 entries).
  const now = Date.now();
  const items: Array<{ key: string; pos: [number, number, number]; role: AgentRole; expiresAt: number }> = [];
  for (const [artifactId, flashes] of auraFlashes) {
    let pos: [number, number, number] | null = null;
    const livePos = getLivePos(artifactId);
    if (livePos) pos = [livePos.x, livePos.y, livePos.z];
    if (!pos) {
      const a = artifacts.get(artifactId);
      if (a?.position) pos = [a.position.x, a.position.y, a.position.z];
    }
    if (!pos) {
      const p = panels.get(artifactId);
      if (p) pos = [p.position.x, p.position.y, p.position.z];
    }
    if (!pos) continue;
    for (const flash of flashes) {
      if (flash.expiresAt <= now) continue;
      items.push({
        key: `${artifactId}:${flash.agentRole}`,
        pos,
        role: flash.agentRole,
        expiresAt: flash.expiresAt
      });
    }
  }

  return (
    <>
      {items.map(item => (
        <AuraSprite
          key={item.key}
          position={item.pos}
          role={item.role}
          expiresAt={item.expiresAt}
        />
      ))}
    </>
  );
}
