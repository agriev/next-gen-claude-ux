# WS-02 — AR/VR vendor guidelines

**Scope:** What Apple (visionOS), Meta (Horizon OS / Quest), Microsoft (HoloLens 2 + MRTK), Magic Leap 2, Khronos (OpenXR), and W3C/Mozilla (WebXR) explicitly recommend for spatial UI design — primitive vocabularies, anchoring, input modalities, content placement, text legibility, locomotion comfort, and certified anti-patterns. Excludes academic comfort research (that lands in WS-09) except where vendor docs cite specific numbers. Excludes social-VR / avatar design beyond what platforms publish for multi-user shells. Excludes pure rendering / engine guidance.
**Date:** 2026-05-23
**Sources consulted:** 16 primary vendor pages + 7 supporting (search summaries, community guides, indie blogs that cite vendor specs).

## Tools / sources surveyed

Deeply analyzed (full read, multiple quotes used below): Apple visionOS HIG + Q&A + SwiftUI Immersive-Space docs (refs 1-6); Meta Comfort + MR Design + Locomotion (refs 8-11); Microsoft Comfort + Typography + Direct Manipulation + Hand Menu (refs 16-19); Magic Leap 2 Comfort & Content Placement (ref 20); W3C WebXR spec (ref 21); Khronos OpenXR (refs 22-23). Supporting / lighter pass: Apple HIG immersive experiences and presenting-windows pages (refs 3-4); Meta design overview + VR best-practices overview + Workrooms (refs 7, 12, 13); Microsoft design root + interaction fundamentals (refs 14-15); MDN WebXR reference (ref 24); immersiveweb.dev (ref 25); think.design designer guide that cites Apple HIG specifics (ref 26).

**Tier counts:** A = 24 (vendor / W3C / Khronos / MDN); B = 2 (community + indie blog citing Apple).
Where a number is cited without a Tier-A URL it is marked **(B-tier secondary)**.

## Lens pass

### L1 — Spatial primitives

Vendor vocabularies are the central contribution of this WS — they are not interchangeable.

**Apple visionOS** defines three scene types, each a SwiftUI `Scene`: **Window** (flat 2D plane in 3D space, point-sized, can host embedded 3D), **Volume** (a bounded box that contains primarily 3D content, "viewable from any angle"), and **Immersive Space** (full-app scope that may contain windows, volumes, unbounded 3D, portals, or a complete environment). Apple is explicit: *"Volumes are not windows with 3D objects inside them. Use volumes when the 3D content is the primary experience."* Above scenes sit two app scopes — **Shared Space** (default; the user mixes many apps' windows in the room) and **Full Space** (single-app exclusive; required for immersion). Decorations attached to a window are called **Ornaments** (toolbars, tab bars, popovers) and float slightly in front of the parent at a documented 20 pt overlap with the bottom edge.

**Meta Horizon OS** uses looser, web-influenced terms: **panels** (2D rectangular surfaces — equivalent of Apple's Window), floating 3D content, and a **System Shell** (Universal Menu, Quick Settings) that the platform reserves. The MR Design guide foregrounds the *environment itself* as primitive — *"use spaces and physical surfaces like walls, tables, and ceilings as the creative canvas."*

**Microsoft HoloLens / MRTK** distinguishes **bounded apps** (in a Slate / 2D content container — equivalent of Apple Window) and **unbounded apps** (volumetric, can place holograms anywhere in the room). Building blocks include **Slates** (2D content host), **Bounding box** primitives around 3D objects, **Pressable buttons**, **Hand menus** (palm-attached), and a **Holographic Frame** abstraction (the camera's actual visible cone). MRTK3 has been re-platformed onto the Mixed Reality Design Language (MRDL).

**Magic Leap 2** does not name "primitives" but defines four **UI behavior types** that determine anchoring: head-relative, body-relative, world-relative, input-relative (see L5).

**WebXR** has no UI primitive vocabulary — it provides input + reference spaces and leaves UI taxonomy to engines (A-Frame, Babylon, three.js).

Concrete named patterns surfaced here: **Window / Volume / Immersive Space triad** (Apple), **Bounded vs unbounded app** (Microsoft), **Ornament** (Apple), **Hand menu / Slate / Bounding box** (Microsoft), **OCPA — Optimal Content Placement Area** (Magic Leap).

### L2 — Data → form mapping

Vendors are deliberately silent on data semantics — they ship the *containers* and leave domain mapping to the app. The closest is Microsoft's *"2D slate behaves like a virtual touch screen"* — meaning any existing web content can be hosted unchanged inside a Slate. Apple's Volume guidance gives one mapping rule: *"3D content is the primary experience (examining a product model, viewing a 3D chart) → Volume"*, otherwise → Window. So in vendor terms:

| Source data | Apple form | Meta form | MR form |
|---|---|---|---|
| 2D dashboard / text | Window | Panel | Slate |
| 3D object / chart | Volume | Floating 3D in panel scene | Unbounded hologram with bounding box |
| Environment / world capture | Mixed-immersion Space | World-locked passthrough scene | Spatial-mapped surface |
| Quick command | Ornament (toolbar) | Quick Settings | Hand menu (≤3 buttons) |

Failure mode: collapsing dashboards + 3D content into one Window has no privileged status in any vendor doc — Apple specifically warns against using Volumes as "windows with 3D objects inside them." This is a vendor-level anti-pattern (see Anti-patterns).

### L3 — Camera & navigation

In AR/VR the user *is* the camera, so vendors talk about **locomotion** rather than camera moves.

**Meta** ships the richest comparison table: **teleport** (lowest sickness, disorientation risk; mitigate with spatial sound, blink, warp), **snap turn** (15° / 30° / 45° / 90° / 180° increments), **smooth/continuous** (vection + visual-vestibular mismatch — mitigate with consistent framerate, **quantized velocity**, stepped translations). Realistic walking speed = **1.4 m/s (~3 mph)**, running **2.8 m/s**. *"Use vignettes to darken or occlude screen edges during movement"* is the canonical vection-reduction mechanism. Meta's locomotion best-practices page splits into three user presets: **Recommended / Comfortable / Advanced**, with smooth turning explicitly *"opt-in."*

**Microsoft** offers two patterns for relocating in a virtual environment: a **"shrink the scene to a disc you can drag under your feet"** technique for holographic devices (HoloLens), and the **blink-translate-fade** technique for immersive VR (rapid 100 m/s simulated motion + black fade). Microsoft is the only vendor to explicitly forbid 1:1 head-locked HUDs: *"HUDs that are rigidly locked to the user's head orientation are likely to produce discomfort... we recommend body locking rather than head locking... Avoid implementing 1:1 HUD rotation and translation based on the user's head motions."*

**Apple visionOS** mostly avoids artificial locomotion — the user walks in their physical room and content stays anchored. The "camera" they expose is the *Immersion dial* — the Digital Crown progressively expands the portal in `.progressive` style up to **~180°**.

**Magic Leap 2** assumes a stationary or walking enterprise worker; locomotion is not addressed beyond comfort warnings against head-relative content during user movement.

### L4 — Level of Detail (LOD)

LOD is largely engine-level and gets little vendor design attention, but two specific recommendations surface:

- **Microsoft (Comfort)** introduces a **"depth budget"** concept: limit content nearer than 1.0 m to ≤25 % of session time, otherwise risk VAC-driven discomfort. This is a *temporal* LOD policy, not spatial.
- **Microsoft (Hand menu)** caps hand menus at **3 buttons (1×3 layout)** — explicitly because the *attentional cone of vision is ~10°*, which is a perceptual LOD limit on dense controls.
- **Apple visionOS** caps tab-bar items at **6** (B-tier secondary citing Apple HIG) for the same cognitive-load reason.
- **Meta** notes "don't overwhelm users by displaying too many objects in the scene at once" without quantifying.

There is **no vendor guidance on 10 / 100 / 1 000 / 10 000-object thresholds** — those have to come from data-viz literature (WS-05). This is an open question.

### L5 — Anchoring (the richest contribution of this WS)

Every vendor names the anchoring surfaces explicitly. Side-by-side:

| Anchor | Apple visionOS | Meta Horizon | Microsoft HoloLens | Magic Leap 2 |
|---|---|---|---|---|
| World / room | Window default behavior (stays where placed) | "world-locked content for more lifelike experiences" | World-locked Slate / bounding box | **World-relative** |
| Surface (table, wall) | RoomPlane / SurfaceAnchor (ARKit) | Scene-understanding surfaces | Spatial Mapping mesh | World-relative attached to anchor |
| Body | n/a (no explicit body anchor) | Implicit (Quick Settings follows user) | "body-locked" — translates with user but doesn't rotate till threshold | **Body-relative** — spawns at ~1.1 m in front, follows user as they move |
| Head | Avoid; only transient elements; *lazy-follow* allowed | Discouraged outside transient HUD; passthrough periphery instead | Explicitly forbidden as 1:1 ("anti-pattern"); body-lock instead | **Head-relative** — *"use with caution… may obstruct environment"* |
| Hand | Ornaments stay near window, palm UI emerging | Wrist menu in Universal Menu | **Hand menu** at ulnar palm or 13 cm above palm | **Input-relative** to controller / hand |
| Shared | SharePlay coordinated anchors | Avatar + scene sharing | Spatial anchors via Azure Spatial Anchors | World-relative shared anchors |

Magic Leap goes furthest in *quantifying* system anchoring distances: privacy indicators **0.78 m**, notifications **0.9 m**, dialogues **0.9 m**, home menu **1.1 m** (range 0.7-1.3 m). These are useful defaults for any "system-managed" surface.

The unanimous vendor policy: **prefer world > body > hand > head** for persistent content, with head-anchoring reserved for transient items (≤a few seconds), accessibility lazy-follow, or — Apple/MR explicitly — *body-lock as the fallback when world-lock can't be used*.

### L6 — Labels & legends — text legibility at distance

This is the most quantified area in the entire WS. Microsoft publishes the canonical table:

| Distance | Minimum legible | Comfortable legible |
|---|---|---|
| 45 cm (near, direct manipulation) | 0.4°-0.5° viewing angle = 3.14-3.9 mm = **8.9-11.1 pt** | 0.65°-0.8° = 5.1-6.3 mm = **14.5-17.8 pt** |
| 2 m (typical HoloLens placement) | 0.35°-0.4° = 12.2-14.0 mm = **34.6-39.6 pt** | 0.6°-0.75° = 20.9-26.2 mm = **59.4-74.2 pt** |

Microsoft also says: avoid light/semi-light weights below 42 pt (vertical strokes will vibrate), prefer white text on dark/colored back-plate (additive display means black = transparent), max two font families per context.

**Apple** keeps point sizes consistent with iOS/macOS for in-Window text (*"point sizes translate directly between platforms"* — Q&A) because Window content is rendered at a normalized 1.3 m default distance, but specifies a **60×60 pt minimum** for any **gaze-targetable element** (B-tier secondary; widely repeated and matches eye-tracking precision arguments). Minimum **4 pt spacing** between gaze-hit targets prevents adjacency mis-selection.

**Meta** says "UI must be world-space at 1-3 m typical reading distance" and *"avoid text with depth treatments as it can make them harder to read"* — i.e. no extruded 3D text. This matches Microsoft's *"extruded text tends to degrade readability — even though we're designing for 3D, we use 2D for type."*

**Magic Leap** keeps content inside the **30°×30° OCPA** so labels never require head rotation.

### L7 — Selection & group operations

Multi-modal selection is the universal pattern, but the *primary* modality differs by platform:

- **Apple visionOS** — **Indirect**: eyes provide targeting, hand pinch (thumb + index) provides commit. *"Users look at an element… then pinch."* Direct touch is supported for near content but is not the primary model.
- **Microsoft HoloLens 2** — Three models, *do not mix*: (a) **Hands + motion controllers** (recommended, low learning curve) — hand ray for far, direct touch + bounding box for near, two-handed for translate/scale/rotate; (b) **Hands-free** — head-gaze + dwell or voice; (c) **Gaze + commit** — head-gaze cursor + clicker. Combining models risks "competing affordances, such as simultaneous hand rays and a head-gaze cursor."
- **Meta** — Hand tracking + controllers in parallel; pinch for click, grab for grasp. Far-ray with controller is widely used.
- **Magic Leap 2** — Direct controller input (0.4-0.6 m) and indirect/ray (0.8-1.5 m).
- **OpenXR** — abstracts all of this into *Actions* and *Action Sets*. `/interaction_profiles/khr/simple_controller` is the universal fallback; vendor profiles like `/interaction_profiles/oculus/touch_controller` and `/interaction_profiles/microsoft/motion_controller` add specifics. Apps suggest bindings; runtime decides. This is the only multi-vendor primitive for selection.

Group operations: only Microsoft documents a **bounding-box affordance** for multi-axis manipulation (corner = scale, edge = rotate, face = move). No vendor specifies a "rubber-band select many cards" primitive — this is genuinely missing from vendor docs and is **an open question for Jarvis**.

### L8 — Attention flow

Vendor recommendations stress *spatial audio* as a first-class attention channel.

- **Apple Q&A** is explicit: *"Sound is crucial… provides spatial audio feedback for button presses… can position sound spatially from interactive elements. The system applies appropriate reverberation and texture based on surroundings."*
- **Meta** locomotion table lists *"spatial sound effects"* as a teleport mitigation — i.e. directional audio bridges the cognitive gap of a jump.
- **Microsoft** Hand-menu doc requires *"a sound effect added to enhance feedback when the button is triggered"* and proximity-shader visual feedback on bounding boxes.
- **Magic Leap 2** publishes specific system-alert distances (0.78 m privacy, 0.9 m notifications) — a *spatial* attention hierarchy where urgency = closer.

For *ambient* awareness, all vendors converge on: avoid sudden centre-of-vision motion (cybersickness trigger); use the periphery — Meta calls passthrough at the periphery a *"stable visual reference [that] helps ground the user."* Animation must be slow, predictable, and announced.

No vendor publishes a rate-limit / suppression policy for notification bursts — this is **an open question** and a synthesis-pass priority.

### L9 — Color system

Vendor docs cover this thinly because it's mostly carried over from 2D:

- **Microsoft**: white text on dark/colored back-plate is canonical for HoloLens additive display; black-on-white needs a bright back-plate (black = transparent on an additive display).
- **Apple visionOS**: glass material default is translucent; recommends white text + bolder font weights than iOS to compensate for variable backgrounds. No formal categorical / ordinal / quantitative split.
- **Meta**: avoid depth-treated text; otherwise quiet on color systems.
- **Magic Leap 2**: silent.

There is **no vendor "color for categorical vs quantitative vs lifecycle"** taxonomy. That gap belongs to WS-05 (data-viz).

### L10 — Inter-view linking

Vendors are silent on linked highlighting / brushing / drill-down across multiple panels. Apple comes closest with the *Shared Space* model (windows from different apps coexist) but does not document cross-app linking — apps are siloed. Meta Workrooms ships the only consumer example of "multiple linked panels" — up to 3 virtual monitors mirroring the user's physical desktop with arbitrary window placement — but linking is at the OS-window level, not data-semantic.

This is **N/A for vendor recommendation** (no vendor publishes a linked-view design pattern) and is an open synthesis problem. Inter-view linking guidance must come from WS-03 (BI dashboards) and WS-05 (data-viz).

### L11 — Process / reasoning representation

Vendors do not address agent or computational process visualization. The closest concept is Apple's *Activity Indicator* for loading and Microsoft's *progress-indicator on dwell* (gaze-and-dwell hands-free model). Neither addresses multi-step reasoning traces. **N/A — vendor docs do not cover agent UX.**

### L12 — Multi-user, sharing, persistence

- **Apple visionOS**: SharePlay coordinates app state across users; spatial Personas place co-located users' avatars in scene with positional audio. No anchoring shared by default — each user sees the app in their own room.
- **Meta**: Horizon Workrooms is the case study — up to ~16 avatars in a room with shared whiteboard, passthrough-rendered physical keyboard, ~40-point facial expression capture, spatial audio. Shared-Space avatar reactions are a core feature.
- **Microsoft HoloLens**: Azure Spatial Anchors — multi-user, multi-device, persistent world-locked anchors. *"Co-located"* in the literal sense: two users in the same room see the same hologram in the same physical location.
- **Magic Leap 2**: AR Cloud + shared spatial anchors, enterprise focus (training, remote support).
- **WebXR/OpenXR**: no shared-anchor primitive in spec; left to networking layer.

Persistence: vendor file formats are app-defined; no spatial-document standard exists (USDZ from Apple/Pixar comes closest for scene exchange but is not a document format).

## Comparison table — the four major XR platforms

| | **Apple visionOS** | **Meta Quest / Horizon OS** | **Microsoft HoloLens 2 / MRTK** | **WebXR (W3C) + OpenXR (Khronos)** |
|---|---|---|---|---|
| **Native input modalities** | Eye gaze + hand pinch (indirect, primary); direct touch (near); voice; bluetooth keyboard/mouse | Hand tracking + Touch controllers in parallel; voice (Universal Menu); facial tracking | Hands + motion controllers; hands-free (gaze+dwell, voice); gaze+commit clicker — *do not mix models* | OpenXR action manifest: `khr/simple_controller` fallback + vendor profiles; hand tracking via XR_EXT_hand_tracking |
| **Anchoring options** | Window default (world); Volume; Shared Space; Full Space; SharePlay personas | World-locked (preferred); body-implicit; passthrough scene; system shell follows user | Bounded vs unbounded; world / body / hand-attached (Hand menu); Spatial Anchors / Azure Spatial Anchors | Reference spaces: viewer, local, local-floor, bounded-floor, unbounded |
| **UI primitive vocabulary** | Window, Volume, Immersive Space, Ornament, Tab Bar | Panel, floating 3D, Universal Menu, Quick Settings | Slate, Bounding Box, Hand Menu, Pressable Button, Holographic Frame; bounded vs unbounded app | None (engine-defined); spec ships reference spaces + input sources only |
| **Recommended text size at distance** | iOS point sizes for Windows (≈1.3 m default); 60×60 pt min gaze target; 4 pt min target spacing | 1-3 m typical reading; world-space; no extruded depth treatments | 8.9-11.1 pt min @ 45 cm; **34.6-39.6 pt min @ 2 m**; 59.4-74.2 pt comfortable @ 2 m; ≥42 pt for light weights | n/a (engine-defined) |
| **Comfort guidelines** | Center main content; horizontal > vertical head motion; lazy-follow instead of head-lock; Digital Crown for `.progressive` immersion (~180° portal); start in window, push immersion gradually | ≥72 FPS shipping target; passthrough periphery; vignette during smooth locomotion; opt-in smooth turn; snap 15-180°; walking 1.4 m/s | Optimal hologram zone **1.25-5 m**; fade-out at 40 cm; clip-plane 30 cm; ≥60 FPS; gaze ≤10° above / ≤60° below horizon; neck ≤45° off-center; "depth budget" ≤25 % session time inside 1 m; HoloLens focal distance fixed at **2.0 m** | n/a (engine + headset enforced) |
| **Multi-user model** | SharePlay + spatial Personas (co-located avatars), positional audio | Horizon Workrooms — avatars + passthrough physical keyboard + ~40 face-tracking points + shared whiteboard | Azure Spatial Anchors (true co-located world-locked) | n/a in spec; left to network layer |

## Top patterns extracted

- **Window / Volume / Immersive Space triad** — Where seen: Apple visionOS (canonical), implicitly mirrored in Microsoft bounded vs unbounded. Mechanism: type-tagged scene primitives where the type determines anchoring, immersion scope, and 2D-vs-3D affordances. Why it works: forces the designer to declare intent (2D ≠ 3D ≠ environment) at scene-creation time. Caveat: Apple is rigid — you can't make a Window "kind of a Volume."
- **Optimal Content Placement Area (OCPA)** — Where seen: Magic Leap 2 explicitly (30°×30°), implicitly in Microsoft's ≤10° attentional cone for menus and Apple's "centered field of view." Mechanism: define a bounded angular zone within which critical content is guaranteed without head rotation. Why it works: hard guarantee against neck strain and missed UI. Caveat: 30°×30° is tight for content-dense dashboards.
- **Indirect gaze-pinch as primary selection** — Where seen: Apple visionOS (canonical); Microsoft hands-free (gaze + dwell variant). Mechanism: decouple targeting (eye) from commit (hand or dwell). Why it works: leverages high-precision involuntary eye motion + explicit confirmation; works at any reach distance. Caveat: requires 60 pt+ targets and clean spacing.
- **Hand-attached quick menu (ulnar palm)** — Where seen: Microsoft Hand Menu (canonical, with 1×3 layout). Mechanism: palm-up gesture summons a small menu anchored to the ulnar side of the palm, billboarded toward opposite shoulder. Why it works: always-available command surface with zero spatial cost. Caveat: ≤3 items; require flat-palm + gaze co-condition to prevent false activation; world-lock if interaction is long.
- **Body-locked / lazy-follow as the head-lock substitute** — Where seen: Microsoft Comfort (explicit), Magic Leap body-relative (explicit), Apple HIG (recommends lazy-follow over head-lock). Mechanism: content translates with user but rotates lazily, only re-orienting after a threshold of head rotation. Why it works: keeps panel reachable without inducing the vergence-accommodation / head-lock sickness associated with 1:1 head HUDs. Caveat: needs tuning per content type and per user.
- **Three-tier locomotion comfort presets (Recommended / Comfortable / Advanced)** — Where seen: Meta Horizon OS (canonical). Mechanism: ship three pre-configured motion settings so users pick their tolerance up-front. Why it works: defers a comfort decision to the user, avoids forcing a one-size-fits-all motion model. Caveat: only relevant when artificial locomotion exists.
- **Vignette / FoV-reduction during motion** — Where seen: Meta Locomotion (canonical); also IEEE / academic literature surveyed in WS-09. Mechanism: darken/occlude screen edges during smooth movement to suppress vection. Why it works: reduces peripheral optic flow, the primary cybersickness driver. Caveat: opt-out for "Advanced" users; some find it intrusive.
- **OpenXR action manifest with `khr/simple_controller` fallback** — Where seen: Khronos OpenXR (canonical). Mechanism: define semantic Actions ("Select", "Grab"), suggest bindings per interaction profile, let runtime choose. Why it works: the only standard way to write input code once for many headsets. Caveat: hand tracking is an extension, not core; the registry is large.
- **Sound as first-class attention channel** — Where seen: Apple Q&A (explicit), Microsoft Hand Menu (required), Meta Locomotion (teleport mitigation). Mechanism: spatial audio with positional reverb gives every interaction directional confirmation. Why it works: AR/VR cannot rely on physical click feedback; sound replaces it. Caveat: must respect accessibility (visible alternative).
- **Passthrough periphery as a grounding aid** — Where seen: Meta MR Design Guidelines, Magic Leap 2 (the always-AR baseline). Mechanism: keep the physical world visible at the edges so the user's vestibular and visual systems agree. Why it works: dramatically lowers cybersickness during sustained sessions. Caveat: hurts immersion; not appropriate for `.full` styles.

## Anti-patterns observed

- **1:1 head-locked HUD** — Microsoft (explicit ban), Apple (use lazy-follow instead), Meta (avoid anchoring content statically in front of camera). Why it fails: locks the user's eyes to a fixed offset that doesn't update with stereo focus → vergence-accommodation conflict + nausea. Mitigation: body-lock with rotation threshold.
- **Volumes used as "windows with 3D objects inside"** — Apple (explicit). Why it fails: breaks the user's mental model that Volumes are inspectable from any angle; UI controls inside a Volume are unreachable from the back.
- **Extruded 3D text** — Microsoft Typography (*"extruded text tends to degrade readability"*), Meta Comfort (*"avoid text with depth treatments"*). Why it fails: stereo disparity on letterforms thrashes the reader's accommodation. Mitigation: always flat text on a 2D plane in 3D space.
- **Sudden artificial camera motion (smooth locomotion at default)** — Meta. Why it fails: visual-vestibular mismatch → cybersickness within minutes. Mitigation: teleport or snap as defaults, smooth as opt-in.
- **Content nearer than 40 cm** — Microsoft Comfort. Why it fails: VAC discomfort grows exponentially as distance shrinks. Mitigation: fade-out 30-40 cm, clip plane at 30 cm.
- **Mixing interaction models in one session (hand ray + head-gaze cursor)** — Microsoft Interaction Fundamentals. Why it fails: competing affordances; user can't tell which input the system is listening to. Mitigation: pick one model per app, document transitions if needed.
- **Hand menus with >3 buttons or above the arm/fingertips/back-of-arm** — Microsoft Hand Menu (5 explicit anti-pattern placements). Why it fails: hand tracking jitter from overlapping hands, arm fatigue, accidental Home-button activation. Mitigation: 1×3 ulnar-palm layout, world-lock if more controls needed.
- **Static front-facing content during user movement** (head-relative without need) — Magic Leap 2 explicit warning. Why it fails: obstructs environment; degrades situational awareness.
- **Off-axis gaze > 10° above / > 60° below horizon, or neck rotation > 45° off-center** — Microsoft Comfort (explicit limits). Why it fails: ergonomic neck strain over a session.
- **High depth budget — content inside 1 m moving in depth for > 25 % of session** — Microsoft Comfort. Why it fails: cumulative VAC fatigue.

## Implications for Interactive Jarvis

- **Adopt the Apple Window / Volume / Immersive triad as our scene-type vocabulary**, even on desktop. Tag every artifact as `kind: window-flat | volume-3d | immersive-env` so a future visionOS port has a 1-to-1 mapping. Maps to lens L1. Affects `src/types/Artifact.ts` and `electron-app/src/main/store.ts`. Effort: M. AR-readiness: **+**.
- **Define an OCPA equivalent for our 2D canvas — a "primary attention zone" of ~30°×30° at the centre of the camera FoV** for critical artifacts (current activity, focused agent reasoning). Mirrors Magic Leap's OCPA and Apple's centering guidance. Maps to L1 + L5. Affects layout agent priors (`src/agents/layout/*`) and camera framing. Effort: M. AR-readiness: **+**.
- **Encode a per-artifact `anchor` field** with values `world | desk | body | hand | head | shared` and refuse to render `head` anchor for anything that lives > 3 s. Mirrors the universal vendor preference order. Maps to L5. Affects `src/types/Artifact.ts`, layout agent, and renderer. Effort: M. AR-readiness: **++** (this is the single most reusable abstraction).
- **Adopt a "depth budget" telemetry counter on the Layout agent** — track how much of a session has artifacts positioned inside 1 m of the user (in AR terms) or behind cluster occluders (in desktop terms). Mirrors Microsoft's ≤25 % rule. Maps to L4 + L5. Affects `src/agents/layout/cost.ts` (cluster-overlap cost already exists; extend with depth cost). Effort: S. AR-readiness: **+**.
- **Pick a single primary selection modality and ship a second as accessibility fallback** — desktop: pointer + keyboard; AR: gaze-pinch with hand-ray fallback. Never mix in one session. Mirrors Microsoft's "do not mix interaction models." Maps to L7. Affects `src/components/InputBar/*` and future XR shim. Effort: M. AR-readiness: **neutral** (process discipline, not code).
- **Add a hand-menu surface as a future input panel — limited to 3 actions** ("focus agent / save view / call layout"). Mirrors MRTK 1×3 hand menu. Maps to L7. Affects future XR build; document in `docs/architecture/input.md`. Effort: M (planning) / L (implementation). AR-readiness: **++**.
- **Adopt vendor text sizing now as a 2D layout floor** — minimum 14 pt for body, 60 pt for any "tap target." Even on desktop this future-proofs the canvas; in AR it maps to Microsoft's 14.5-17.8 pt comfortable-near and Apple's 60 pt gaze target. Maps to L6. Affects `src/styles/typography.ts`, `src/components/Artifact/Plate.tsx`. Effort: S. AR-readiness: **+**.

## Open questions

- No vendor publishes guidance for *many-artifact* density (the > 100 / > 1 000 regimes Interactive Jarvis hits). LOD policy must come from WS-05 (data-viz) and WS-08 (graph layout).
- No vendor documents linked-highlighting / brushing across panels. WS-03 (BI dashboards) must fill this gap.
- No vendor specifies a *rubber-band multi-select* primitive in 3D. Open design problem; survey academic XR-selection papers in WS-09.
- No vendor publishes notification rate-limit / suppression policy for ambient awareness. Open.
- OpenXR's hand tracking is an extension, not core — what fraction of headsets support it natively in 2026? Quick follow-up: check current OpenXR conformance dashboard.
- Apple HIG content was unreachable via WebFetch (Apple's pages render client-side). All Apple specifics here are corroborated via Apple's WWDC Q&A page, the SwiftUI `ImmersionStyle` reference, and B-tier secondary sources that quote HIG. Recommend a re-pull when Apple publishes a static-renderable HIG mirror (or via Apple's own RSS for HIG updates).

## References (full)

1. Apple — Designing for visionOS, Human Interface Guidelines (visited 2026-05-23). https://developer.apple.com/design/human-interface-guidelines/designing-for-visionos
2. Apple — Q&A: Spatial design for visionOS. https://developer.apple.com/news/?id=fi8ne6ji
3. Apple — Presenting windows and spaces. https://developer.apple.com/documentation/visionos/presenting-windows-and-spaces
4. Apple — Immersive experiences (HIG). https://developer.apple.com/design/human-interface-guidelines/immersive-experiences
5. Apple — Creating an immersive space in visionOS with SwiftUI. https://developer.apple.com/documentation/visionOS/creating-immersive-spaces-in-visionos-with-swiftui
6. Apple — SwiftUI `immersionStyle` reference. https://developer.apple.com/documentation/swiftui/immersive-spaces
7. Meta — Design Overview (Horizon OS). https://developers.meta.com/horizon/design/
8. Meta — Comfort. https://developers.meta.com/horizon/design/comfort/
9. Meta — Key considerations for MR. https://developers.meta.com/horizon/design/mr-design-guideline/
10. Meta — Locomotion comfort and usability. https://developers.meta.com/horizon/design/locomotion-comfort-usability/
11. Meta — Locomotion best practices. https://developers.meta.com/horizon/design/locomotion-best-practices/
12. Meta — Immersive apps best practices overview. https://developers.meta.com/horizon/design/bp-overview/
13. Meta — Horizon Workrooms. https://forwork.meta.com/horizon-workrooms/ and https://about.fb.com/news/2021/08/introducing-horizon-workrooms-remote-collaboration-reimagined/
14. Microsoft — Mixed Reality Design (root). https://learn.microsoft.com/en-us/windows/mixed-reality/design/design
15. Microsoft — Instinctual interactions (interaction fundamentals). https://learn.microsoft.com/en-us/windows/mixed-reality/design/interaction-fundamentals
16. Microsoft — Comfort. https://learn.microsoft.com/en-us/windows/mixed-reality/design/comfort
17. Microsoft — Typography. https://learn.microsoft.com/en-us/windows/mixed-reality/design/typography
18. Microsoft — Direct manipulation with hands. https://learn.microsoft.com/en-us/windows/mixed-reality/design/direct-manipulation
19. Microsoft — Hand menu. https://learn.microsoft.com/en-us/windows/mixed-reality/design/hand-menu
20. Magic Leap 2 — Comfort and content placement guidelines. https://developer-docs.magicleap.cloud/docs/guides/best-practices/comfort-content-placement/
21. W3C — WebXR Device API. https://www.w3.org/TR/webxr/
22. Khronos — OpenXR xrSuggestInteractionProfileBindings(3). https://registry.khronos.org/OpenXR/specs/1.1/man/html/xrSuggestInteractionProfileBindings.html
23. Khronos — OpenXR Tutorial: Actions chapter. https://openxr-tutorial.com/windows/d3d11/4-actions.html
24. MDN — WebXR Device API: Geometry / reference spaces. https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API/Geometry
25. immersiveweb.dev — community WebXR portal. https://immersiveweb.dev/
26. think.design — The Complete Guide to Designing for visionOS (B-tier; cites Apple HIG for 60 pt + 4 pt + 6-tab caps + 20 pt ornament). https://think.design/blog/the-complete-guide-to-designing-for-visionos/
