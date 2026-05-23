/**
 * Label — SDF text rendered as a 3D mesh via drei <Text> (troika-three-text).
 *
 * Replaces drei drei Html overlays for pure-text labels in the scene.
 * Three advantages over Html:
 *   1. AR-readiness — works inside WebXR sessions (Html requires DOM portal)
 *   2. Performance — single draw call per text mesh, no React DOM reconciliation
 *   3. Distance behavior — SDF stays crisp at any zoom; Html size jumps via distanceFactor
 *
 * Default visual style mimics the previous Html overlays:
 *   - Inter-style font (drei uses its bundled Roboto fallback if no font URL)
 *   - White-ish foreground with dark stroke for legibility on any background
 *   - Billboarded toward camera (Text already does this by default in drei)
 *
 * For interactive labels (clickable, with buttons inside) — keep using drei Html
 * for now. Replacement of interactive overlays is a separate card scheduled
 * after E0 (needs R3F mesh-based button affordance design).
 *
 * Usage:
 *   <Label position={[0, 1, 0]} fontSize={0.18} color="#E8EAED">@Atlas</Label>
 *
 * The `font` prop accepts a URL to a .woff/.woff2/.ttf file. When omitted,
 * troika falls back to its bundled default font. We do NOT bundle Inter as
 * .woff2 in this initial commit — defer until we measure that fallback
 * isn't visually distinguishable from Html-rendered Inter (likely small
 * difference at the sizes we use, ~14px on screen ≈ 0.16-0.22 world units).
 */
import { Text } from '@react-three/drei';
import { type ReactNode } from 'react';

export interface LabelProps {
  /** Text content. */
  children: ReactNode;
  /** World position [x, y, z]. */
  position?: [number, number, number];
  /** Mesh font size in world units. ~0.16-0.22 = readable at 6-10u camera distance. */
  fontSize?: number;
  /** Foreground color. Default matches previous Html label color. */
  color?: string;
  /** Outline width (world units) — stroke for legibility on any bg. */
  outlineWidth?: number;
  /** Outline color. Default black for max contrast. */
  outlineColor?: string;
  /** Anchor horizontal alignment. */
  anchorX?: 'left' | 'center' | 'right';
  /** Anchor vertical alignment. */
  anchorY?: 'top' | 'middle' | 'bottom' | 'top-baseline' | 'bottom-baseline';
  /** Render order — higher renders on top. Used to keep labels above plates. */
  renderOrder?: number;
  /** Optional opacity override (1.0 default). */
  opacity?: number;
}

export function Label({
  children,
  position = [0, 0, 0],
  fontSize = 0.18,
  color = '#E8EAED',
  outlineWidth = 0.012,
  outlineColor = '#000000',
  anchorX = 'center',
  anchorY = 'middle',
  renderOrder = 10,
  opacity,
}: LabelProps) {
  return (
    <Text
      position={position}
      fontSize={fontSize}
      color={color}
      outlineWidth={outlineWidth}
      outlineColor={outlineColor}
      anchorX={anchorX}
      anchorY={anchorY}
      renderOrder={renderOrder}
      // troika respects `material-transparent` + `material-opacity` to fade
      material-transparent={opacity !== undefined}
      material-opacity={opacity ?? 1}
    >
      {children}
    </Text>
  );
}
