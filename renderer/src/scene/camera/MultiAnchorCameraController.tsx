/**
 * MultiAnchorCameraController — B16 in BACKLOG-v2.md.
 *
 * Stationary multi-anchor camera for Console mode. Unlike OrbitCameraController
 * (free-form rotate/pan/zoom), Console mode disables rotation entirely and
 * limits zoom to a tight band around the horseshoe slot positions (P/W1/W2/
 * A1/A2 from WS-12). Pan is allowed so the user can dolly across the slots.
 *
 * Implementation note: still uses drei `<OrbitControls>` so the existing
 * CameraController interface (orbit.target + orbit.enabled) keeps working
 * end-to-end — we just lock rotation. This means the WebXR migration path
 * (M2 in AR-VR-BRIDGE.md) is identical to canvas mode.
 *
 * AR-readiness: in XR this becomes the default — Console mode is itself a
 * stationary multi-anchor world-anchored layout, which is exactly how
 * visionOS / Quest position widgets.
 */
import { OrbitControls } from '@react-three/drei';

export function MultiAnchorCameraController() {
  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.12}
      enableRotate={false}
      enablePan
      enableZoom
      minDistance={6}
      maxDistance={26}
    />
  );
}
