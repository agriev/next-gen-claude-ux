# AR-Readiness Inventory of Current Codebase

**Purpose:** Factual inventory of UI surfaces and 3D-scene constructs in the existing Interactive Jarvis repo, classified by AR/VR migration friction. Feeds directly into `docs/product/AR-VR-BRIDGE.md` (Phase 4).

**Date:** May 2026, against current `main` branch (commit 6d80513).

**Tagging legend:**
- 🟢 **AR-ready** — pure R3F/Three.js, world-space; works in WebXR session with no DOM dependency.
- 🟡 **AR-portable** — abstraction layer needed (interface swap, port to R3F text). Effort: small to medium.
- 🔴 **AR-blocking** — DOM/React-rendered, depends on browser layout engine; needs full reimplementation or a "desktop-only" companion window in AR mode.

---

## 1. Top-level shell (`renderer/src/App.tsx`)

```tsx
// App.tsx — 54 lines
<div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
  <Canvas />               // 3D scene (mostly 🟢)
  <BoardSwitcher />        // 🔴 DOM
  <LayoutMenu />           // 🔴 DOM (uses DraggablePanel)
  <ModelPicker />          // 🔴 DOM
  <StatusBar />            // 🔴 DOM
  <FilterChips />          // 🔴 DOM
  <Minimap />              // 🔴 DOM (uses DraggablePanel)
  <BookmarksBar />         // 🔴 DOM
  <UndoBar />              // 🔴 DOM
  <NotificationCenter />   // 🔴 DOM (uses DraggablePanel)
  <ActivityPanel />        // 🔴 DOM (uses DraggablePanel)
  <LayoutActivityPanel />  // 🔴 DOM (uses DraggablePanel)
  <AgentActivityHud />     // 🔴 DOM
  <Toaster />              // 🔴 DOM
  <InputBar />             // 🔴 DOM (471 LOC — the biggest)
  <VoiceController />      // 🔴 DOM
  <HelpHint />             // 🔴 DOM
  <Inspector />            // 🔴 DOM (586 LOC — the biggest)
  <SearchModal />          // 🔴 DOM
  <DropPaste />            // 🔴 DOM
  <Onboarding />           // 🔴 DOM
  <Hotkeys />              // 🔴 DOM (keyboard listener — relevant for desktop only)
</div>
```

**Total UI: 24 components, ~3,000 LOC of DOM-React code.**

In WebXR session, none of these sibling-DOM panels render inside the headset's view. Options for AR mode:
1. **Companion-window**: keep DOM UI in a 2D Apple Vision Pro window outside the immersive scene. Users see a floating window + immersive canvas side by side.
2. **R3F port**: rebuild each panel as `<mesh>` / `<Text>` in 3D space. High effort.
3. **Hide all**: enter "spatial-only mode" — no UI chrome, command via voice/gesture only.

Recommended bridge: option 1 for Year 1 (visionOS multi-window pattern), option 2 selectively for high-value panels (LayoutMenu, ActivityPanel) in Year 2+.

---

## 2. 3D scene (`renderer/src/scene/`)

5 files, ~1,043 LOC:
- `Canvas.tsx` (239 LOC) — top-level R3F canvas + camera utilities
- `Artifact.tsx` (350 LOC) — plate cards with billboard + label + interaction
- `Edge.tsx` (296 LOC) — Bézier curves with spring physics + labels
- `card-texture.ts` (128 LOC) — pure utility, canvas-2D texture generation
- `live-transforms.ts` (30 LOC) — pure utility, Map for per-frame positions

### 2.1 Canvas.tsx — Camera + frame logic
- **Imports:** `OrbitControls` from drei. 🟡 — OrbitControls works in standard Three.js cameras; in WebXR the camera is the headset (no orbit). Needs abstraction.
- **`<OrbitControls makeDefault enableDamping />`** (line 228) — the only camera controller wired. Needs replacement when entering XR session (Three.js `xr.enabled = true` overrides camera control).
- **CameraFitter, CameraFocusReporter, BookmarkCapture** — three helper sub-components that read camera state via `useThree(s => s.camera)`. 🟡 — they assume single non-XR camera. In XR they'd need to read the XR session view matrix.

**Bridge action:** introduce `CameraController` interface with two implementations: `OrbitCameraController` (current desktop) and `XRHeadCameraController` (WebXR session). Swap based on session state.

### 2.2 Artifact.tsx — Plates
- Mostly 🟢: `<mesh>`, `<planeGeometry>`, `<meshBasicMaterial>`, `<Billboard>` (drei but R3F-native).
- **`<Html>` overlays at lines 218 + 317** — 🔴. These render React DOM nodes positioned in 3D space. In WebXR, `<Html>` from drei requires `transform="true"` and a special portal — workable but with performance + occlusion limitations. Better path: replace with `<Text>` from drei (`troika-three-text`).
- **Drag handling** (lines 35-37) reads `useThree(s => s.gl)` to get raycaster + DOM event coords. 🟡 — needs WebXR controller raycaster swap.

**Bridge action:** replace 2 `<Html>` overlays in Artifact.tsx with `<Text>` mesh-based labels. Adopt `troika-three-text` for SDF text rendering.

### 2.3 Edge.tsx — Bézier curves
- Mostly 🟢: line geometry, custom shader-friendly.
- **`<Html>` at lines 196 + 242** — 🔴. Edge-label and edge-edit-handle as DOM overlays. Same fix as Artifact.tsx: port to `<Text>` + R3F mesh handles for hover.

---

## 3. Drei dependencies inventory

```
@react-three/drei imports across scene/:
  Canvas.tsx:  OrbitControls       (🟡 abstract via CameraController)
  Edge.tsx:    Html                (🔴 port to <Text>)
  Artifact.tsx: Html, Billboard    (🔴 Html: port; 🟢 Billboard: keep)
```

Drei has WebXR-friendly counterparts already:
- `Billboard` — works in XR ✓
- `Text` / `Text3D` — works in XR (using troika-three-text) ✓
- `Html` — works in XR but with caveats (DOM portal, no occlusion) ✗
- `OrbitControls` — incompatible with XR camera (XR controls the camera matrix) ✗

---

## 4. State/IPC layer (`renderer/src/store/`, `renderer/src/ipc/`)

🟢 Pure data — Zustand store + IPC bridge. WebXR doesn't care.

Storage layer is identical regardless of rendering surface.

---

## 5. Input plumbing

- **`Hotkeys.tsx`** — 🔴 keyboard-only. In XR mode, no physical keyboard; map essential hotkeys to gesture/voice equivalents.
- **`InputBar.tsx`** — 🔴 DOM-based prompt input. In XR mode, needs voice transcription as primary (Whisper local).
- **`VoiceController.tsx`** — 🟡 currently Web Speech API (best-effort, broken in Electron). Needs Whisper local for XR.
- **`DropPaste.tsx`** — 🔴 DOM drag-drop event handler. Not applicable in XR; replace with "speak filename" or "attach via companion window".

---

## 6. Multi-window / multi-anchor opportunities (visionOS)

Apple Vision Pro's distinctive pattern: an app can present 1 immersive scene + N floating windows + N volumes simultaneously. This maps cleanly to Interactive Jarvis:

- **Immersive scene** = the 3D canvas (Canvas.tsx, scene/)
- **Window 1** (floating) = Inspector (markdown body display) — DOM stays useful here
- **Window 2** (floating) = ActivityPanel (agent trace) — DOM stays useful
- **Window 3** (floating) = InputBar (voice + keyboard) — DOM stays useful
- **Volume(s)** = ad-hoc dashboard panels the Layout agent assembles for the current question

This means: most DOM UI does NOT need to die when entering AR. It re-anchors as a Vision Pro window. Implementation: use `@react-three/xr` for the immersive scene, use SwiftUI or a separate WebView for each window (when running natively) or accept they live in a single AVP window (when running through Safari WebXR).

---

## 7. Summary table

| Layer | LOC | AR-readiness | Recommended action |
|---|---|---|---|
| `App.tsx` shell | 54 | 🟡 | Inject mode switch: desktop vs xr-immersive |
| `scene/Canvas.tsx` (camera) | 239 | 🟡 | Abstract OrbitControls behind CameraController interface |
| `scene/Artifact.tsx` (plates) | 350 | 🟡 | Replace 2 `<Html>` with `<Text>` |
| `scene/Edge.tsx` (curves) | 296 | 🟡 | Replace 2 `<Html>` with `<Text>` + mesh handles |
| `scene/card-texture.ts` | 128 | 🟢 | None |
| `scene/live-transforms.ts` | 30 | 🟢 | None |
| `ui/` (all 24 panels) | ~3,000 | 🔴 | Year 1: keep as desktop / visionOS window. Year 2: port hot panels |
| `store/`, `ipc/` | n/a | 🟢 | None |
| `Hotkeys.tsx` | 195 | 🔴 | Year 1: desktop-only feature. Year 2: gesture mapping |
| `Voice.tsx` | 268 | 🟡 | Wire Whisper local (already on roadmap) |

---

## 8. Migration milestones (proposal — to be finalized in AR-VR-BRIDGE.md)

- **M0 (now)**: Document inventory. ✓
- **M1 (1-3m)**: Introduce `CameraController` interface. No behaviour change, just enables future swap.
- **M2 (3-6m)**: Replace 4 `<Html>` overlays in scene/ with `<Text>` (troika-three-text). Improves desktop perf too.
- **M3 (6-9m)**: WebXR experimental branch — enter immersive scene, OrbitControls disabled, headset camera takes over. UI panels invisible.
- **M4 (9-12m)**: Companion windows on visionOS — Inspector, ActivityPanel, InputBar as separate windows alongside immersive scene.
- **M5 (12m+)**: Hand-input raycasting via `@react-three/xr`, replacing mouse-pick for artifact selection in XR session.
- **M6 (18m+)**: Multi-user shared anchor (collab in AR).

This is the bridge skeleton. AR-VR-BRIDGE.md (Phase 4) will expand each milestone with success criteria, dependencies, and effort estimates.
