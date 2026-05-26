/**
 * OrbitCameraController — default desktop camera controller.
 *
 * Wraps drei's `<OrbitControls>` and registers itself as the R3F
 * scene's default controls via `makeDefault`. Other components read
 * the controller through `useThree(s => s.controls as CameraController)`.
 *
 * Behaviour preserved from previous inline definition in Canvas.tsx:
 *   - enableDamping with dampingFactor 0.08
 *   - enableRotate disabled when cameraMode is 'top-down' (orthographic)
 *
 * Future siblings: XRHeadCameraController (E2), MultiAnchorCameraController
 * (E1 Console mode), FlyCameraController (E3 immersive deep-dive).
 */
import { OrbitControls } from '@react-three/drei';
import { useWorldStore } from '../../store/world-store';

export function OrbitCameraController() {
  const cameraMode = useWorldStore(s => s.cameraMode);
  // While the user is alt-dragging a lasso we yield the canvas to the lasso
  // overlay — otherwise OrbitControls swallows the pointer and the rect never
  // grows. Cleared on mouseup by Lasso.tsx.
  const lassoActive = useWorldStore(s => s.lassoActive);
  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enableRotate={cameraMode !== 'top-down' && !lassoActive}
      enablePan={!lassoActive}
      enableZoom={!lassoActive}
    />
  );
}
