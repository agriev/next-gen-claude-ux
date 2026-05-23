/**
 * CameraController — common interface for any scene camera controller.
 *
 * Today the only implementation is OrbitCameraController (wraps drei's
 * OrbitControls). In E2 (WebXR experimental branch) we will add
 * XRHeadCameraController where the headset session drives the camera.
 * In E1 (Console mode) we will add MultiAnchorCameraController for
 * stationary horseshoe-slot layout.
 *
 * The TS type is intentionally a duck-typed alias of OrbitControlsImpl
 * for now — anything providing `target: Vector3 + update() + addEventListener`
 * is a valid controller from R3F's `useThree(s => s.controls)` perspective.
 * When the second implementation lands we will narrow this to a real
 * interface (target, position, update, dispose, enableRotate, fitTo).
 *
 * All scene/ files MUST consume controls via this type, not via
 * `OrbitControls as OrbitControlsImpl` direct casts. PR-review enforces.
 */
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export type CameraController = OrbitControlsImpl;
