# Interaction Language

The spec for how the user (and agents on the user's behalf) act on the spatial substrate. Companion of [VISUAL-LANGUAGE.md](VISUAL-LANGUAGE.md). Extends current hotkeys ([SHORTCUTS.md](../SHORTCUTS.md)) toward Console mode and AR. All decisions trace back to the research synthesis: [themes](../research/synthesis/themes.md), [patterns](../research/synthesis/patterns.md), [tradeoffs](../research/synthesis/tradeoffs.md), [anti-patterns](../research/synthesis/anti-patterns.md).

## 1. Mission

Interaction in Jarvis is an **operator's mental model layered on a stable substrate**, not an explorer's free-form playground. The substrate doesn't move under the user's feet ([T1](../research/synthesis/themes.md#t1-spatial-stability-beats-novelty-for-daily-use-tools--very-strong)); the controls are anchored to the user's body or hand, never head-locked ([T8](../research/synthesis/themes.md#t8-world-anchored-data-hand-anchored-controls-head-anchored-status-only--very-strong)); the agent's moves are previewed before commit ([T14](../research/synthesis/themes.md#t14-plan-then-execute-with-ghost-preview-beats-commit-then-undo--strong)); reasoning is visible alongside its outcome ([T13](../research/synthesis/themes.md#t13-process-is-a-dag-result-is-the-viewport--keep-both-visible--strong)).

The corollary is **pick one interaction model per session** ([anti-pattern: mixing models](../research/synthesis/anti-patterns.md#mixing-interaction-models-in-one-session-evidence-medium)), **single-channel pop-out for ambient signals + aural for interrupt** ([T9](../research/synthesis/themes.md#t9-preattentive-single-channel-pop-out-for-ambient-signals-aural-for-high-priority--very-strong)), and **filter is not selection** ([T11](../research/synthesis/themes.md#t11-filter-vs-selection-must-be-distinguished-palantir-style--strong)).

Like an air-traffic control tower or an ICU station, every value sits where you remember it. The agent fills slots; the user navigates by glance. New interactions earn their existence by serving one of: *capture* (add data), *organize* (rearrange), *navigate* (move attention), *interrogate* (ask why), or *delegate* (assign to agent).

---

## 2. Goal × Modality Matrix

The exhaustive mapping of user goals to input modalities, with the spatial response and LOD effect. Rows are user-intent; columns split per-modality. New interactions must add a row here.

| User goal | Desktop input | AR input | Spatial response | LOD effect |
|---|---|---|---|---|
| Select one artifact | click | gaze + pinch ([gaze-pinch](../research/synthesis/patterns.md#indirect-gaze-pinch-as-primary-selection-evidence-medium)) | Selection ring (white, 2.5 px); non-selected drop to alpha 0.85 | None — selection doesn't change LOD |
| Select many | shift+click / lasso (drag empty space) | second pinch (additive) / ring-out gesture | Rubber-band selection + ring on each | None |
| Add to selection | shift+click | second pinch | Add ring to additional artifact | None |
| Clear selection | `Esc` | look-away + dwell-cancel | All rings fade in 120 ms | Hover-dim un-cascades |
| Focus on artifact (center camera) | `F` / double-click | gaze + "look here" voice / long pinch | 600 ms camera transition (Apple curve); artifact framed at 1.0× distance | Focused artifact stays `full`; neighbors visible at `simplified` |
| Pivot orbit center | implicit (selection drives pivot per [TR2](../research/synthesis/tradeoffs.md#tr2-camera-orbit-vs-fly-vs-walk-vs-teleport-vs-stationary-multi-slot)) | n/a (head IS the camera) | Pivot animates to selection centroid (200 ms) | None |
| Navigate to bookmark | `1..9` (no selection) | voice "show bookmark N" / palm-menu select | 600 ms camera transition + filter restore | LOD recomputes after transition |
| Save bookmark | `Shift+1..9` | voice "save as bookmark N" / palm-menu save | Capture camera + filter + selection state | None |
| Focus reasoning trace on artifact | `R` (with selection) | voice "how did you get here?" | `reasoning-thread` for that artifact appears at full opacity | Trace LOD overrides to full for selected branch |
| Filter by kind | click `FilterChip` | gaze + tap chip / voice "show only docs" | Non-matching artifacts drop to alpha 0.25 (dim, not hide) | Filter is panel-spanning; selection survives |
| Cross-filter (BI brushing pattern) | hover artifact (1-hop dim) | gaze artifact 200 ms dwell | 1-hop neighborhood stays opaque; rest dim to alpha 0.45 | Bi-directional: panel widgets also dim non-matching marks |
| Drill into cluster | double-click cluster | gaze + pinch cluster | Cluster expands to detail view; camera dollies in; breadcrumb stack updates | Members render at `full` LOD; siblings collapse to glyphs |
| Drill out of cluster (dive-up) | `U` / `Esc` | voice "back" / palm-menu back | Camera dollies out, breadcrumb pops | Reverse |
| Pin / unpin artifact | `P` (with selection) | voice "pin" / palm-menu pin | Pinned glyph on plate; Layout agent skips | None |
| Move artifact (manual) | shift+drag | direct pinch + drag (AR direct touch) | Position updates live via spring; auto-pin on release | None |
| Delete artifact | `Backspace` / `Del` (with selection) | "hand toss away" gesture + confirm / voice "delete" | Confirm modal (if shared/has refs); soft archive | None |
| Create artifact (text) | `/` then prompt + Enter | voice "add a note about X" / pinch-and-pull from palm | New plate appears at Layout-decided position; 320 ms ease-out | Surrounding LOD recomputes |
| Create edge | `1`..`4` (with 2+ selected) | voice "connect with derives" / two-pinch + flick | Bézier curve animates from src to dst (240 ms) | Edge LOD applies immediately |
| Open Inspector | `Enter` / `I` (with single selection) | voice "open inspector" / pinch + flick up | Inspector panel slides in (desktop) / companion window opens (AR) | None |
| Voice-focus on artifact | `V` (with selection) | always-on after wake-word "Jarvis, refine this" | Listening agent routes utterance to `refineArtifact(id, ...)` | None |
| Request layout reorganize | `Cmd+L` then mode | voice "rearrange by topic" | `intent-ghost`s appear at proposed positions; user accepts (Enter) or drags-corrects then accepts | LOD freezes during preview, recomputes on commit |
| Request agent task | `/` then prompt + Enter | voice prompt | New Worker `Action` queued; trace plate appears on Worker Z-plane; `agent-aura` lights affected region | None |
| Cancel agent | `Cmd+.` | voice "cancel" / palm-menu cancel | Action chip fades to grey; `agent-aura` fades; any half-state rolled back | None |
| Search (fuzzy) | `Cmd+F` | voice "find X" | SearchModal (desktop) / floating result list (AR); selecting a result focuses + bookmarks transient | Selection cascades to focus LOD |
| Undo / redo | `Cmd+Z` / `Cmd+Shift+Z` | voice "undo" / palm-menu undo | Inverse op applied with same animation duration as the forward op | None |
| Convert selection to filter (Palantir-style) | right-click selection → "filter to these" | gaze + voice "filter to selection" | Filter state replaced; selection cleared; non-selected dim to alpha 0.25 | Filter LOD applies |
| Save current state as Console / View | `Cmd+S` then name | voice "save this console as X" | Full state captured: camera + filter + selection + slot assignments | None |
| Switch board | `BoardSwitcher` click | voice "switch to board X" | Cross-fade (400 ms); new board loads | All artifacts re-laid-out |
| Enter Console mode | `Tab` (toggle) | voice "console mode" / palm-menu toggle | Camera becomes stationary; horseshoe of 5 panel slots fade in (400 ms); free-floating artifacts settle into slots | LOD freezes; Console always shows panel slots at `full` |
| Exit Console mode | `Tab` (toggle) | voice "canvas mode" / palm-menu toggle | Camera regains orbit control; panel slots release | LOD resumes camera-driven |
| Switch agent context (cycle Z-plane) | `[` / `]` | voice "focus on Worker" | Camera repositions to chosen agent's Z-plane; that plane lights at full luminance, others dim | Reasoning-threads on that plane go full, others fade |

That's 31 rows. The matrix is exhaustive: any input goal not in the table must be added before code lands.

### 2.1 Modality scoping

Per [TR15](../research/synthesis/tradeoffs.md#tr15-selection-commit-modality-click-vs-gaze-pinch-vs-voice-vs-marking-menu) and the [mixing-models anti-pattern](../research/synthesis/anti-patterns.md#mixing-interaction-models-in-one-session-evidence-medium):

- **Desktop session**: pointer + keyboard primary; voice (via Whisper local) orthogonal augment.
- **AR session**: gaze-pinch primary (per [Apple visionOS canonical](../research/02-arvr-vendors.md)); hand-ray fallback for far content; voice orthogonal augment; **never combine hand-ray with gaze-cursor simultaneously**.
- **Marking menu** (right-click hold + radial gesture on desktop / pinch-hold + radial on AR) is the expert escalation in both modes per [WS-10](../research/synthesis/patterns.md#marking-menu-radial-gesture-evidence-medium).

---

## 3. Camera controllers

A single abstraction with four implementations. Per [AR-readiness M1](../research/ar-readiness-inventory.md#8-migration-milestones-proposal--to-be-finalized-in-ar-vr-bridgemd) and [TR2](../research/synthesis/tradeoffs.md#tr2-camera-orbit-vs-fly-vs-walk-vs-teleport-vs-stationary-multi-slot).

### 3.1 Interface

```ts
// renderer/src/scene/camera/CameraController.ts
interface CameraController {
  readonly kind: 'orbit' | 'multi-anchor' | 'xr-head' | 'fly';
  attach(camera: PerspectiveCamera | XRCamera, gl: WebGLRenderer): void;
  detach(): void;
  focusOn(target: Vec3, distance?: number, duration?: number): Promise<void>;
  setBookmark(b: Bookmark, duration?: number): Promise<void>;
  getPose(): { eye: Vec3; target: Vec3; up: Vec3 };
  // Called when selection changes; controller may bind pivot to it
  onSelectionChanged(centroid: Vec3 | null): void;
}
```

### 3.2 `OrbitCameraController` (current desktop default)

Wraps drei's `<OrbitControls>` with **pivot bound to selection centroid** (per [TR2](../research/synthesis/tradeoffs.md#tr2-camera-orbit-vs-fly-vs-walk-vs-teleport-vs-stationary-multi-slot) Jarvis position + [center-of-rotation tracking](../research/synthesis/patterns.md#center-of-rotation-tracking-evidence-strong)). When selection is empty, pivot stays at the last centroid (no jarring jump to origin). Damping enabled (0.1). RMB-drag orbits; WASD pans floor plane; QE elevate; scroll dollies. Used in canvas mode.

### 3.3 `MultiAnchorCameraController` (Console mode horseshoe)

Camera is **stationary** at a configurable seat position. 5 panel slots are pre-defined in world-anchored positions on a 120° arc at ~2 m forward distance (per [horseshoe of fixed-slot panels](../research/synthesis/patterns.md#horseshoe-of-fixed-slot-panels-evidence-medium) + [WS-12 control rooms](../research/synthesis/themes.md#t12-operators-mental-model-is-anchored-to-fixed-slots-not-free-placement--strong)). User does NOT orbit; they look (head turn or arrow keys to nudge focus between slots). `focusOn(slot)` smoothly highlights the chosen panel — no camera position change, only the focused panel grows by 15% and neighbors dim 20%.

Slot layout:

```
              [3 Ambient-Right]
[1 Primary]                          ← seat position
              [2 Working-Upper]
              [4 Working-Lower]
              [5 Ambient-Left]
```

Slot 1 is primary (eye-level, dead-center, 30°×30° [OCPA](../research/synthesis/patterns.md#optimal-content-placement-area-ocpa-evidence-medium) cone). Slots 2 and 4 are working (eye-level, ±25° azimuth, glance-readable). Slots 3 and 5 are ambient (peripheral, status-only). Slot 1 always gets the highest `attention_rank` artifact ([T12](../research/synthesis/themes.md#t12-operators-mental-model-is-anchored-to-fixed-slots-not-free-placement--strong) implication).

### 3.4 `XRHeadCameraController` (WebXR)

Headset IS the camera. The XR session owns the camera matrix; this controller mostly hands off. `focusOn` becomes a **teleport-to-target** ([Meta locomotion default](../research/synthesis/patterns.md#three-tier-locomotion-comfort-presets-evidence-medium)) with a 100 ms fade-to-black to defeat cybersickness. Bookmarks become saved teleport anchors.

### 3.5 `FlyCameraController` (optional, immersive deep-dive only)

6DoF fly mode for explicit "dive into a volume" tasks. **Never the default.** Only invocable inside a `volume` primitive (3D scatter, molecule, building). On entry: vignette fades in over 200 ms ([vignette/FoV-reduction during motion](../research/synthesis/patterns.md#vignette--fov-reduction-during-motion-evidence-medium)); WASD + mouse-look active. On exit (`Esc`): camera teleports back to the volume's outside-view position with 100 ms fade.

Per [free-fly anti-pattern](../research/synthesis/anti-patterns.md#free-fly-camera-in-abstract-vr-analytics--watch-evidence-medium): banned for abstract data; permitted only when the volume's third axis carries genuine spatial meaning.

### 3.6 Controller selection rules

| Session mode | Controller |
|---|---|
| Desktop, canvas mode | `OrbitCameraController` |
| Desktop, Console mode | `MultiAnchorCameraController` |
| AR (WebXR active), canvas mode | `XRHeadCameraController` |
| AR (WebXR active), Console mode | `XRHeadCameraController` with panels pinned to world horseshoe (head-turn replaces selection-cycling) |
| Any mode, inside a volume | `FlyCameraController` (push current; pop on exit) |

---

## 4. Multi-modal composition rules

Modalities don't replace each other; they **compose orthogonally**. From [WS-02 multi-modal pattern](../research/02-arvr-vendors.md) and [T18](../research/synthesis/themes.md#t18-voice-is-an-orthogonal-channel-aural--spatial-together-survive-distraction--strong).

### 4.1 Allowed combinations

- **Keyboard + voice (desktop)** — user types `/` to focus the input bar, then dictates instead of typing. Or: user issues `Cmd+L` to open the layout menu, then says "by topic" instead of clicking. The keyboard *initiates*; the voice *parameterizes*.
- **Gaze + hand (AR)** — gaze targets ([gaze-pinch pattern](../research/synthesis/patterns.md#indirect-gaze-pinch-as-primary-selection-evidence-medium)); hand commits. The gaze is the cursor; the pinch is the click. Decoupled by design — the user can look at one artifact while pinching to confirm the previous selection.
- **Voice + spatial (always-on)** — the user issues a voice command ("focus on the green cluster") whose subject is *currently in view*. The spatial scene IS the disambiguation context — the agent reads the camera frustum + filters to bind referring expressions.
- **Pointer + voice (the voice-to-clarify pattern)** — when the user starts a drag-to-create-edge but pauses mid-drag, voice can specify the kind: "make it derives" instead of pressing `1`. The pointer holds the spatial intent; voice carries the type.

### 4.2 Forbidden combinations

- **Hand-ray + gaze-cursor simultaneously** (per [mixing-models anti-pattern](../research/synthesis/anti-patterns.md#mixing-interaction-models-in-one-session-evidence-medium)). Pick one targeting mode per AR session; transition between them is explicit (palm-menu toggle).
- **Mouse-pick + voice command on different artifacts simultaneously**. If the mouse points at A and the voice says "delete this", the command applies to A (mouse wins). The user MUST learn one of: speak the artifact's `shortName`, or use voice while mouse is over canvas-empty space.
- **Three-modality cascade** (e.g., voice → gesture → keyboard for one command). Cap at two modalities per command; the third is a separate command.

### 4.3 Listening agent as voice-orchestrator

Per [ARCHITECTURE.md §Agent topology](../ARCHITECTURE.md#agent-topology), Listening doesn't execute — it *proposes* (`propose_action`). Voice that the user issues during an existing keyboard or pointer action goes to Listening's `clarify` channel, where it parameterizes the in-flight command (per the voice-to-clarify pattern). Listening only fires `propose_action` when no in-flight command exists.

---

## 5. Disambiguation policy

When the user (or agent) refers to an artifact by something other than `id`, the binding rule is fixed and unambiguous.

### 5.1 `@-references` in text and voice

Reference syntax: `@<shortName>` (current). Resolution order:

1. Exact `shortName` match in current board.
2. Case-insensitive `shortName` match.
3. Prefix match — if exactly one artifact's `shortName` starts with the reference, use it.
4. Fuzzy match — if exactly one artifact's `shortName` is within Damerau-Levenshtein distance 2, use it AND surface a hover-tooltip with "did you mean?".
5. **Collision** — if step 1 or 2 has multiple matches, the resolution fails; the user is prompted to disambiguate by appending a board prefix (`@<board>:<shortName>` per [Q7.3](../research/synthesis/open-questions.md#q73--same-artifact-on-multiple-boards-heptabase-pattern-multi-board)).

The `shortName` registry is **unique within a board** (enforced at insert time). Listening agent rewrites are not allowed to introduce shortName collisions.

### 5.2 Reserved-word safety

The current plan's master document defines reserved words that the agent MUST NOT consume as @-references (e.g., command words like "delete", "focus", "save"). The Listening agent's grammar parser strips reserved words BEFORE attempting @-reference resolution. The list lives in `electron/main/agents/listening/reserved-words.ts` and is the union of:

- All hotkey command labels from [SHORTCUTS.md](../SHORTCUTS.md).
- All voice-command verbs in the Goal × Modality matrix (§2).
- All `link_type` `name` values in the registry.
- Common English filler ("this", "that", "the", "a", "and", "or") — full stoplist in the reserved-words file.

If a user genuinely wants to reference an artifact whose `shortName` is on the reserved list, the Naming agent renames at creation time with a suffix.

### 5.3 Voice intent ambiguity

When Listening cannot map a voice utterance to exactly one action with ≥ 0.8 confidence, the response is:

1. **Echo + ask** — Listening surfaces a transient overlay: "I heard: '<utterance>'. Did you mean: [option A] [option B] [cancel]?"
2. The user picks via pointer (desktop) or gaze-pinch (AR), OR re-utters with the chosen verb.
3. The agent does NOT execute on best-guess. Per [Anti-pattern: trusting LLM spatial reasoning at scale](../research/synthesis/anti-patterns.md#trusting-llm-spatial-reasoning-at-scale--watch-evidence-strong) — ambiguous commands are NOT silently committed.

### 5.4 Spatial referring expressions

"The green cluster", "the artifact on the left", "the one I just made" — resolved against the current camera view by Listening with the help of WorldState:

- Color references → filter by kind hue (§4.1 of [VISUAL-LANGUAGE.md](VISUAL-LANGUAGE.md)).
- Spatial references (left, right, near, far) → filter by camera-relative position; tie-break by distance to focus.
- Temporal references (recent, just made, yesterday) → filter by `createdAt`.

If the resolution set is `> 1`, fall back to the §5.3 echo-and-ask flow.

---

## 6. AR-specific patterns

Patterns that exist only when WebXR is active. Pulled from [WS-02](../research/02-arvr-vendors.md), [T8](../research/synthesis/themes.md#t8-world-anchored-data-hand-anchored-controls-head-anchored-status-only--very-strong), [T9](../research/synthesis/themes.md#t9-preattentive-single-channel-pop-out-for-ambient-signals-aural-for-high-priority--very-strong).

### 6.1 Pinch-and-pull for creation

To create a new artifact in AR: palm-up, then pinch fingers + pull away from palm. A new `note` plate spawns under the pinch point and follows the hand until release. Per [two-handed pinch-pull-apart scale](../research/synthesis/patterns.md#two-handed-pinch-pull-apart-scale-evidence-weak) (single-handed variant). Release on a `cluster` membership = the new note joins; release on empty space = floating.

### 6.2 Palm-up for menu (hand menu)

Palm-up gesture (left or right hand, palm facing user) summons a 1×3 hand menu anchored to the **ulnar side of the palm**, billboarded toward the opposite shoulder. Per [hand-attached quick menu](../research/synthesis/patterns.md#hand-attached-quick-menu-ulnar-palm-evidence-medium). The 3 buttons are user-customizable per Console; defaults:

| Slot | Default |
|---|---|
| 1 | Focus on current agent |
| 2 | Save current view as bookmark |
| 3 | Toggle Console mode |

Per [hand-menus >3 buttons anti-pattern](../research/synthesis/anti-patterns.md#hand-menus-with-3-buttons-evidence-medium) — capped at 3. World-lock the menu if interaction lasts >2 s; until then it follows the palm.

### 6.3 Eye-anchored cursor (OCPA zone)

The user's gaze drives a soft cursor at the gaze-ray hit point. The cursor is visible only **within the OCPA 30°×30° centered cone** ([patterns: OCPA](../research/synthesis/patterns.md#optimal-content-placement-area-ocpa-evidence-medium)). Outside this cone, the cursor disappears — no encouragement to crane the neck.

Hover dwell threshold: 200 ms before "pre-selection" indicator (faint white ring); pinch commits. No dwell-only commit (avoids dwell-trap).

### 6.4 Spatial audio for off-screen agent activity

Per [T18](../research/synthesis/themes.md#t18-voice-is-an-orthogonal-channel-aural--spatial-together-survive-distraction--strong) + [sound-as-first-class](../research/synthesis/patterns.md#sound-as-first-class-attention-channel-evidence-medium):

- Each agent's audio is **spatially positioned at the centroid of its Z-plane**. Worker = front-left, Layout = front-center-behind, Listening = front-right, Naming = behind-up.
- `awaiting-input` event: spatial audio chime at the artifact's position + attention-beam.
- `error` state: short spatial click at the artifact's position; no sustained tone (avoid alarm-fatigue per [WS-12 alarm-flood anti-pattern](../research/synthesis/anti-patterns.md#alarm-flood--undifferentiated-event-stream--watch-evidence-strong)).
- Layered alert priority paired visual + aural — info has no sound; caution has a short tone; warning has a short tone + spatial position; emergency has a sustained tone + spatial position + visual flash. Per [layered alert priority](../research/synthesis/patterns.md#layered-alert-priority-paired-visualaural-evidence-medium).
- Max 1 sound per second; queue overflow drops oldest non-final.

### 6.5 AR locomotion

Per [three-tier locomotion comfort presets](../research/synthesis/patterns.md#three-tier-locomotion-comfort-presets-evidence-medium):

- **Comfortable** (default) — Teleport-to-target only; no smooth locomotion. Vignette fades 200 ms during teleport.
- **Recommended** — Snap-turn for 30° increments; teleport for translation.
- **Advanced** — Smooth turn + smooth strafe permitted; opt-in only; vignette during motion.

Console mode disables locomotion entirely; user stays seated.

### 6.6 Off-axis content guard

Per [off-axis gaze excess anti-pattern](../research/synthesis/anti-patterns.md#off-axis-gaze-excess-evidence-medium): the Layout agent's cost function penalizes positions >10° above horizon and >60° below. World-anchored content in those zones gets a UI nudge ("move to comfort zone?") on first session each time.

### 6.7 Discoverability fallback

Every gesture has a discoverable fallback (per [gesture-heavy onboarding anti-pattern](../research/synthesis/anti-patterns.md#gesture-heavy-onboarding-evidence-medium)). The Onboarding flow demonstrates each gesture once; the help hint (`?` button) shows a video of each at any time; voice commands always work as a parallel input ("create note", "open hand menu", etc.).

---

## 7. Reserved bindings

Hotkeys split into three layers: **preserved** (current desktop hotkeys, untouched), **proposed-additions** (new bindings for Console mode + reasoning trace + agent cycling), and **AR-equivalents** (gesture/voice mappings).

### 7.1 Preserved (from current [SHORTCUTS.md](../SHORTCUTS.md))

All currently shipping hotkeys remain unchanged. The full table is reproduced here as a single reference; see [SHORTCUTS.md](../SHORTCUTS.md) for the authoritative source.

```
Input bar:    /  @  Enter  Shift+Enter  Esc
Selection:    click  shift-click  Esc  arrows  Enter/I  V
Movement:     shift-drag  P
Edges:        E  1  2  3  4  (with selection)  click-edge-label  Backspace  Esc
Camera:       F  T  RMB-drag  WASD  Q/E  scroll  double-click
              1..9 (jump bookmark)  Shift+1..9 (save bookmark)
Layout:       Cmd+L  Cmd+F
Editing:      double-click  Cmd+Enter  Esc  Backspace
Undo:         Cmd+Z  Cmd+Shift+Z  Cmd+.
Voice:        hold Space (PTT)  click 🎙 PTT  click ∞ cont
```

### 7.2 Proposed additions

New bindings that do NOT collide with existing ones. Each is listed with the goal it addresses from §2.

| Key | Action | §2 row |
|---|---|---|
| `Tab` | Toggle Console mode ↔ Canvas mode | Enter / Exit Console mode |
| `R` (with selection) | Show reasoning trace for selected artifact | Focus reasoning trace |
| `Cmd+R` | Show reasoning trace for current focus / cycle agent threads | (alternative invocation; opens with all four agent threads tabbed) |
| `[` / `]` | Cycle Z-plane focus (Worker → Layout → Listening → Naming → back) | Switch agent context |
| `Cmd+S` | Save current state as a named Console / View | Save Console |
| `Ctrl+1..9` | Save current selection as a named selection (separate from camera bookmarks at `Shift+1..9`) | (Per [TR7](../research/synthesis/tradeoffs.md#tr7-selection-at-scale-lasso-vs-filter-vs-search-vs-typed-set) selection-as-query) |
| `Cmd+K` | Command palette (fuzzy actions, discoverability layer for marking menu) | (Per [Q4.3](../research/synthesis/open-questions.md#q43--marking-menu-vs-command-palette-cmdk-for-ai-commands-input-modality)) |
| `right-click + drag` | Marking menu (radial selection) | (Per [WS-10 marking menu](../research/synthesis/patterns.md#marking-menu-radial-gesture-evidence-medium)) |
| `G` (with selection) | Grab (Blender-style modal move) | (Optional power-user; per [modal-key operators](../research/synthesis/patterns.md#modal-key-operators-grs-evidence-medium)) |
| `U` | Dive-up (out of cluster / subgraph) | Drill out of cluster |
| `Cmd+]` / `Cmd+[` | Next / previous bookmark in order | Navigate bookmarks |

No collisions: `Tab` is currently unbound (input-bar focus uses `/`); `R` is unbound; `Cmd+R` is unbound; `[`/`]` are unbound; `Cmd+S` is unbound (filesystem sync is automatic); `Ctrl+1..9` is distinct from `Shift+1..9`; `Cmd+K` is unbound; `G` and `U` are unbound in selection mode.

### 7.3 AR-equivalents for proposed additions

Each new binding has a voice command (always works) AND a gesture (when AR is active).

| Action | Voice command | Gesture (AR) |
|---|---|---|
| Toggle Console mode | "console mode" / "canvas mode" | Palm menu slot 3 |
| Show reasoning trace | "how did you get here?" / "show reasoning" | Long pinch on artifact (1 s hold) |
| Cycle Z-plane focus | "focus on Worker" / etc. | Two-finger swipe left/right on palm-menu |
| Save Console | "save this console as X" | Palm menu slot 2 |
| Save selection | "save selection as X" | (No gesture; voice only) |
| Command palette | "show actions" | Palm menu slot 1 (per-Console customizable) |
| Marking menu | (No voice equivalent; gesture-first) | Pinch-hold + radial flick |
| Dive-up | "back" / "up" | Two-finger swipe down on palm-menu / palm-menu back button |

### 7.4 Owner-zone discipline (preventing HUD corner collisions)

Per [HUD-elements-competing-for-one-corner anti-pattern](../research/synthesis/anti-patterns.md#hud-elements-competing-for-one-corner--watch-evidence-medium) and [always-on-dense-HUD anti-pattern](../research/synthesis/anti-patterns.md#always-on-dense-hud--watch-evidence-strong). Each screen edge / DOM panel has ONE owner system on desktop:

| Region | Owner | Notes |
|---|---|---|
| Top-left | `BoardSwitcher` | Board switcher + active board name |
| Top-right | `NotificationCenter` + `ModelPicker` | Both DOM-stack; notification badge above model picker |
| Bottom-left | `Help`, `Onboarding` triggers | Static |
| Bottom-center | `InputBar` | Voice + keyboard; full-width |
| Bottom-right | `BookmarksBar` + `FilterChips` | Vertical stack |
| Left-edge floating | `LayoutActivityPanel` (DraggablePanel) | User-positioned; default left |
| Right-edge floating | `Inspector` (DraggablePanel) | User-positioned; default right |
| Bottom-overlay floating | `Minimap` (DraggablePanel) | User-positioned |
| Center | reserved for `intent-ghost`, `attention-beam`, OCPA cone (in AR) | No persistent DOM in center |

When a new panel needs to land, it MUST be assigned to a region in this table — and if a region is full, an existing panel moves first. No silent stacking.

### 7.5 Listening (always-on) wake-word

Wake-word "Jarvis" routes the next utterance through Listening agent in voice-orchestrator mode (§4.3). Without wake-word, voice input requires hold-`Space` (PTT) or click `🎙 PTT` (existing). The wake-word is the only "always-listening" trigger; ambient speech is NOT transcribed without it. This is preserved from current voice plumbing — adding the wake-word recognizer is on the Whisper-local roadmap.

---

## 8. Open interaction questions

Acknowledged unresolved decisions, mapped to synthesis questions:

- **Q4.1** — Focus-pivot camera with multi-select: pivot to bounding-box centroid is provisional; needs prototype.
- **Q5.1** — Cross-filter visual behavior (dim vs displace): doc picks dim; revisit if it fails user test.
- **Q5.2** — Filter scope visualization (which artifacts are filter-affected): provisional "scope region" translucent volume; needs prototype.
- **Q6.2** — Rubber-band 3D multi-select primitive: not yet defined; punt to M3 (WebXR branch).
- **M3** — Voice-vs-keyboard balance: track 4 weeks after Whisper lands; reorient if >60% commands go voice.

---

## Cross-references

- Visual model: [VISUAL-LANGUAGE.md](VISUAL-LANGUAGE.md)
- Current shortcuts: [../SHORTCUTS.md](../SHORTCUTS.md)
- Architecture: [../ARCHITECTURE.md](../ARCHITECTURE.md)
- Agents: [../AGENTS.md](../AGENTS.md)
- Themes: [../research/synthesis/themes.md](../research/synthesis/themes.md)
- Patterns catalog: [../research/synthesis/patterns.md](../research/synthesis/patterns.md)
- Tradeoffs: [../research/synthesis/tradeoffs.md](../research/synthesis/tradeoffs.md)
- Anti-patterns: [../research/synthesis/anti-patterns.md](../research/synthesis/anti-patterns.md)
- Open questions: [../research/synthesis/open-questions.md](../research/synthesis/open-questions.md)
- AR-readiness baseline: [../research/ar-readiness-inventory.md](../research/ar-readiness-inventory.md)
