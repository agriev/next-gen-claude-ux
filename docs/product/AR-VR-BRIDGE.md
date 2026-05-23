# AR / VR Bridge Strategy

> **Стратегия в одной фразе (RU):** Десктоп остаётся primary surface первые 12 месяцев. Все новые spatial primitives проектируются AR-ready: world-anchored, без DOM-зависимостей внутри 3D-сцены, hand-input-friendly. Первый WebXR experimental branch — M3 (3-6м), визionOS spike — M4 (6-12м), парность фич между desktop и AR — M6 (18м+). Inspector, ActivityPanel и InputBar **не портируются** в immersive scene — они становятся **companion windows** на visionOS (нативный multi-window pattern). Multi-user — open question за горизонтом 12 месяцев (см. [VISION.md §5](VISION.md)).

This document is the migration plan from current Electron-only desktop to AR/VR-ready architecture, with concrete file paths and milestones. It is the **operational counterpart** of [VISION.md](VISION.md)'s Hero scenarios 3.3 and 3.4.

---

## 1. Mission

Reach a state where Interactive Jarvis runs **both** on a 5K desktop monitor AND in an Apple Vision Pro headset, sharing the same `WorldState` and giving the user a consistent mental model across surfaces. Failure mode to avoid: shipping a separate "Jarvis VR" product that diverges from desktop.

This document is the **bridge plan** — what to refactor in the existing code, what to add, what to defer, and in what order. It does NOT cover detailed implementation (see the spawned engineering tickets in `docs/product/BACKLOG-v2.md`).

---

## 2. Current AR-readiness assessment (executive)

See [`docs/research/ar-readiness-inventory.md`](../research/ar-readiness-inventory.md) for the file-by-file inventory.

Summary:
- **3D scene** (`renderer/src/scene/`, 1043 LOC) — mostly R3F-native, **but** 4 `<Html>` overlays (drei) inside Artifact + Edge and 1 OrbitControls in Canvas are AR-blocking. Fixable with abstraction.
- **DOM UI shell** (`renderer/src/ui/`, 24 components, ~3000 LOC) — all DOM-React. None of it renders inside a WebXR session. Two viable paths in AR: (a) keep them as **companion windows** outside immersive scene (visionOS multi-window) or (b) port hot panels to R3F (high effort, defer).
- **State/IPC** (`store/`, `ipc/`) — 🟢 storage-layer independent, no work needed.
- **Voice input** — currently broken (Web Speech in Electron); local Whisper is on the existing roadmap. AR-mode is voice-primary, so Whisper landing is a hard dependency.

### 2.1. Three colors of friction

| Color | Meaning | Count in current code |
|---|---|---|
| 🟢 AR-ready | Pure R3F or storage-only | 5 files (scene/) + all of store/, ipc/ |
| 🟡 AR-portable | Needs abstraction layer; small-medium effort | 3 files (Canvas + Artifact + Edge) |
| 🔴 AR-blocking | DOM-React; needs companion-window strategy | 24 UI files (~3000 LOC) |

---

## 3. Migration milestones (M0 – M6)

Each milestone has: scope, success criteria, files affected, dependencies, effort, **rollback plan** (what desktop loses if we revert).

### M0 — Inventory landed ✓
- **Done:** `docs/research/ar-readiness-inventory.md` + this document.

### M1 — CameraController abstraction (1-3 months)
- **Scope:** introduce `CameraController` interface; current OrbitControls becomes `OrbitCameraController` implementation. No behaviour change.
- **Why first:** every later XR work depends on this. It also unblocks Console mode (which needs `MultiAnchorCameraController`).
- **Files:**
  - new `renderer/src/scene/camera/CameraController.ts` (interface)
  - new `renderer/src/scene/camera/OrbitCameraController.tsx` (current behaviour moved here)
  - edit `renderer/src/scene/Canvas.tsx:228` (replace inline `<OrbitControls>` with `<CameraController />` slot)
  - edit Artifact.tsx + Canvas helpers that read `useThree(s => s.controls) as OrbitControlsImpl` — abstract through controller
- **Success:** all current desktop hotkeys (F, T, bookmark jumps) still work. No visual change.
- **Effort:** S (~1-2 days of focused work)
- **Dependencies:** none.
- **Rollback:** revert PR; trivially safe — current OrbitControls remains the only implementation.
- **AR-readiness gain:** unlocks Console mode (`MultiAnchorCameraController`) and XR session (`XRHeadCameraController`).

### M2 — Replace `<Html>` overlays with `<Text>` (2-4 months)
- **Scope:** the 4 `<Html>` instances in `scene/Artifact.tsx:218, 317` and `scene/Edge.tsx:196, 242` become mesh-based text via `troika-three-text`.
- **Why second:** `<Html>` doesn't work cleanly in WebXR sessions; replacing it removes a category of AR-friction and **also improves desktop performance** at large card counts (already on `docs/ROADMAP.md` open: "Bundled font for drei `<Text>` so we can stop using HTML overlays").
- **Files:**
  - new `renderer/src/scene/text/Label.tsx` (R3F text component)
  - bundle Inter `.woff2` (already noted in roadmap)
  - edit `Artifact.tsx`, `Edge.tsx` — replace `<Html>{label}</Html>` with `<Label>{label}</Label>`
- **Success:** desktop visual parity (or improvement — sharper text at distance via SDF rendering); card count limit raised from ~200 to ~1000 before perf cliff.
- **Effort:** M (~3-5 days)
- **Dependencies:** none.
- **Rollback:** keep both implementations behind a flag for one release.
- **AR-readiness gain:** sceneRenderer is now fully R3F-native; no DOM portal in 3D space.

### M3 — WebXR experimental branch (3-6 months)
- **Scope:** add `@react-three/xr` package; introduce session-entry button "Enter VR" (only visible if WebXR detected); minimal in-session UX — camera taken over by headset, OrbitControls disabled, DOM UI hidden, scene visible.
- **Goal:** prove that the scene renders correctly in an XR session (Quest browser, Vision Pro Safari). Not feature-parity — just "you can put on a headset and see your canvas."
- **Files:**
  - new `renderer/src/xr/XRSessionToggle.tsx` (button + session management)
  - new `renderer/src/scene/camera/XRHeadCameraController.tsx`
  - edit `App.tsx` — wrap `<Canvas>` in `<XRCanvas>` from `@react-three/xr`
  - edit `Canvas.tsx` — toggle CameraController based on session state
  - add `XR_ENABLED=true` env flag for opt-in (avoid breaking non-XR users)
- **Success:** put on Quest/AVP, see the marketing-demo board float in front of you, no UI chrome, can look around. **Cannot yet interact.** That's M5.
- **Effort:** L (~1-2 weeks, mostly because of testing on actual hardware)
- **Dependencies:** M1 (CameraController), M2 (`<Text>` instead of `<Html>`).
- **Rollback:** XR session opt-in is behind env flag; default desktop UX unaffected.
- **Risks:** AVP Safari WebXR support is *partial* as of May 2026 — need to verify session creation works there; if not, target Quest Browser only and revisit for visionOS native port in M4.

### M4 — visionOS spike: companion windows (6-12 months)
- **Scope:** native visionOS app shell that hosts the immersive scene (WebXR or native via WebGL) PLUS native SwiftUI windows for Inspector, ActivityPanel, InputBar.
- **Why:** Apple Vision Pro's pattern is multi-window — apps present immersive scenes + floating windows simultaneously. This is the ergonomic AR target. Re-using existing DOM-React panels via WebViews is the cheap path; native SwiftUI ports are the high-fidelity path. Pick: **WebView**-companion for M4 (fast); native SwiftUI for M6+ (polish).
- **Files (Electron desktop unchanged; new visionOS-only dir):**
  - new `visionos-shell/` Swift package
  - new IPC bridge — visionOS shell sends URL events to/from each WebView panel
  - share `WorldState` via the same SQLite file (mounted from iCloud Drive or local volume; same fs-sync semantics).
- **Success:** Antón puts on AVP, opens Jarvis, sees: (1) immersive scene with current board's spatial layout, (2) floating Inspector window beside it showing markdown body of selected artifact, (3) floating InputBar at chest-level for voice + text. Interaction via gaze+pinch (M5 for this).
- **Effort:** L+ (~2-4 weeks; first time touching Swift/visionOS)
- **Dependencies:** M3, plus Whisper local lands for voice (per existing ROADMAP).
- **Rollback:** visionOS shell is separate codebase; revert = ship Electron-only release.
- **Risks:** Apple's WebKit WebXR support is incomplete; may need native WebGL bridge. Also: signing/distribution for visionOS App Store has separate cost (Apple Dev cert already on desktop roadmap).

### M5 — Hand-input + gaze-pinch in immersive scene (9-12 months)
- **Scope:** within WebXR session (M3) and visionOS port (M4), wire gaze+pinch as artifact selection; long-pinch as "grab to move"; voice as primary command channel (via Whisper).
- **Files:**
  - new `renderer/src/xr/InputHandlers.tsx` — pinch detection, gaze-ray casting against scene
  - edit `Artifact.tsx` to accept XR-controller raycasts in addition to mouse
  - new `electron/main/agents/voice-router.ts` — wires Whisper transcript to Worker/Listening
- **Success:** in AVP, look at an artifact + pinch → selection ring; say "delete this" → soft-archived; say "show me what's connected" → cross-filter activates.
- **Effort:** L (~2 weeks)
- **Dependencies:** M3, M4, Whisper landed.
- **Rollback:** disable XR input → desktop unaffected.

### M6 — Multi-user shared anchor (18+ months)
- **Scope:** two users with their own AVPs share a synced board. Each sees the other's cursor / gaze beam. Layout agent considers both users' attention zones.
- **Files:** all storage layer becomes CRDT-friendly (Yjs reference per WS-06 spatial canvases brief); new `electron/main/sync/peer.ts` for WebRTC peer connection.
- **Success:** two-person session, edit doesn't conflict, see each other's manipulations.
- **Effort:** L+ (~3-6 weeks)
- **Dependencies:** M5, plus a clear single-user value proven (don't build multi-user too early — see [VISION.md §5](VISION.md) and open-question M4).
- **Rollback:** opt-in flag; single-user mode is default.
- **DEFERRED:** revisit at month 18 against actual pull. If user only ever uses single-user → don't do M6, ship something else.

---

## 4. What we do NOT port to AR

To keep scope manageable, explicit non-goals:

- **Hotkeys panel and `Hotkeys.tsx`** — keyboard not available in headset; voice/gesture replaces.
- **DropPaste DOM event handler** — drag-drop from OS file browser doesn't work in immersive scene; replace with "speak filename" or use companion-window.
- **Search modal in immersive scene** — Cmd+F fuzzy search works via voice ("find @Mission"); modal lives only in desktop / companion-window.
- **NotificationCenter as DOM list** — in AR, notifications become spatial-audio chirps + brief peripheral glow, not a panel.

These DOM components stay alive for desktop. They're hidden when XR session is active.

---

## 5. Multi-device sync model

Storage is the foundation: **same `<userData>/jarvis.db` (SQLite WAL) backs all surfaces.** Plus the fs-sync mirror at `<userData>/boards/<id>/artifacts/`.

Sync strategies tested:

| Strategy | Pros | Cons | Decision |
|---|---|---|---|
| Same physical file via iCloud Drive | Zero new code; Apple-native | iCloud sync latency ~minutes, conflicts not auto-merged | **Yes for v1** — accept latency, single-user means rare conflict |
| WebSocket bidirectional protocol | Instant; bidirectional | Need cloud relay or P2P; security | v2 if needed |
| CRDT (Yjs) | Conflict-free, multi-user friendly | Rewrite of WorldState | M6+ for multi-user |

For M3-M5, we'll lean on iCloud Drive sync (or manual export-import). User accepts: "you can edit on either desktop or AVP, but not simultaneously."

---

## 6. Vendor-specific notes

### 6.1. Apple visionOS (target: M4-M5)
- HIG mandates: world-anchored over head-anchored for sustained content (per WS-02 + Theme T9). We comply — `anchor: 'world'` is default for all primitives.
- Volumes vs Windows vs Immersive scenes — we use immersive scene for the 3D canvas, native windows for Inspector/ActivityPanel/InputBar.
- Pinch ergonomics: minimum 40cm content distance (per Apple HIG). Default camera distance in console mode = 2m, well within zone.
- Avoid: extruded 3D text (per anti-pattern from WS-02). Our `<Text>` is flat-billboarded with depth via parallax, not extrusion.

### 6.2. Meta Quest / Horizon OS
- Hand-tracking improving but inconsistent vs controllers; M5 includes controller fallback via OpenXR `khr/simple_controller` action manifest.
- Body-lock + lazy-follow (per WS-02) is the primary "panel near user" pattern — use for floating Inspector when no desk surface anchored.
- Quest Browser WebXR support is mature (test platform of choice for M3).

### 6.3. Microsoft HoloLens / MRTK4
- Hand menus (ulnar palm 1×3 grid per WS-02) — adopt for AR command palette in M5.
- Bounded vs unbounded scene — Jarvis is unbounded (canvas is infinite).

### 6.4. WebXR + OpenXR
- Standardize on OpenXR action manifest for inputs (M5).
- WebXR session entry from a desktop button (M3) → graceful fallback to mouse if no headset.

---

## 7. Risks and mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| AVP WebXR support insufficient for M3 | Medium | High | Quest as primary AR test target; visionOS spike M4 uses native shell |
| Whisper local fails to land on time | Low | Medium | M3 ships without voice (gaze+pinch only); voice added in M5 |
| DOM panels too valuable to deprecate in AR | High | Low | Companion windows pattern preserves them |
| visionOS Swift learning curve | High | Medium | Constrain M4 scope to "host WebView + ship immersive scene"; avoid full SwiftUI port until M6+ |
| Multi-user demand never materializes | Medium | None (cost saving) | M6 explicit defer to month-18 reassessment |
| LLM-driven layout breaks at AR scale | Medium | Medium | Console mode (fixed slots) bypasses LLM layout for high-stakes scenes; LLM only fills slot content |

---

## 8. Success criteria for the whole bridge

End state at month 18:
1. Desktop user can press "Enter VR" → drop into immersive scene → continue work for 30 minutes without fatigue.
2. visionOS user can open Jarvis app → see immersive scene + 2-3 companion windows → voice-driven workflow.
3. User can switch between desktop and AVP and pick up where they left off (same `WorldState`).
4. New spatial primitives from `CONCEPT.md` (panel, frame, reasoning-thread, etc.) work in both surfaces without per-surface code branches.

If we get 3 of 4 by month 18 — success. If 1-2 of 4 — bridge needs replan.

---

## Sources
- AR readiness inventory: [`../research/ar-readiness-inventory.md`](../research/ar-readiness-inventory.md)
- WS-02 (AR/VR vendors): [`../research/02-arvr-vendors.md`](../research/02-arvr-vendors.md)
- WS-12 (multi-dashboard spatial): [`../research/12-multi-dashboard-spatial.md`](../research/12-multi-dashboard-spatial.md)
- Synthesis themes: [`../research/synthesis/themes.md`](../research/synthesis/themes.md) (T1, T9)
- Tradeoffs: [`../research/synthesis/tradeoffs.md`](../research/synthesis/tradeoffs.md) (TR-anchoring)
- Open questions: [`../research/synthesis/open-questions.md`](../research/synthesis/open-questions.md) (Cluster 6 — AR-specific)
- Master plan: `~/.claude/plans/eager-imagining-piglet.md`
- VISION: [`./VISION.md`](VISION.md), CONCEPT: [`./CONCEPT.md`](CONCEPT.md)
