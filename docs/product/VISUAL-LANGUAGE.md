# Visual Language

The spec for how Interactive Jarvis encodes data, agent state, and process into spatial form. Companion of [INTERACTION-LANGUAGE.md](INTERACTION-LANGUAGE.md). Extends [MODEL.md](../MODEL.md) (which defines the data) and [ARCHITECTURE.md](../ARCHITECTURE.md) (which defines where rendering lives). All decisions trace back to the research synthesis: [themes](../research/synthesis/themes.md), [patterns](../research/synthesis/patterns.md), [tradeoffs](../research/synthesis/tradeoffs.md), [anti-patterns](../research/synthesis/anti-patterns.md).

## 1. Mission

Jarvis is a 3D substrate for thinking with multiple agents. The visual language exists to make that substrate **readable at a glance, stable across sessions, and lift-able to AR without redesign**. Every encoding decision below trades novelty for spatial stability: where there is a conflict between "looks cool" and "lands where the user expects, with the encoding the user trained their eye on", we choose stability.

This is the principle from [T1 — spatial stability beats novelty](../research/synthesis/themes.md#t1-spatial-stability-beats-novelty-for-daily-use-tools--very-strong): every operations domain, every PKM tool that scaled, every node-flow editor that survived, agreed. The agent's freedom to reorganize is a *user-invoked verb*, not a passive consequence of artifact creation. Layout reflow that erases muscle memory is the single largest predictor of a spatial tool being abandoned.

The corollary is **two-layer color, never three** ([T5](../research/synthesis/themes.md#t5-two-layer-color-categorical-kind--state-overlay-never-a-third--very-strong)), **no unjustified 3D inside artifacts** ([anti-pattern](../research/synthesis/anti-patterns.md#3d-barpieline-charts-in-abstract-data--watch-evidence-strong)), and **animated transitions over snaps** ([T7](../research/synthesis/themes.md#t7-animated-transitions-defeat-change-blindness-instant-snaps-cause-confusion--very-strong)).

---

## 2. Spatial primitives vocabulary

The complete set of in-scene primitives. Every renderable thing is one of these. Adding a new primitive requires updating this section + the patterns catalog.

### Current primitives (shipping)

- **`artifact`** — A discrete addressable unit of content. Today's render: a plate (`<planeGeometry>` with billboarded `card-texture`). Has `id`, `shortName`, `kind`, `spec`, `body`. Default anchor `world`. See [`renderer/src/scene/Artifact.tsx`](../../renderer/src/scene/Artifact.tsx).
- **`edge`** — Typed directed link between two artifacts. Rendered as a Bézier curve with spring-physics control points. Currently 4 kinds: `derives`, `references`, `contradicts`, `groups-with`. To be promoted to a typed [Link-Type registry](../research/synthesis/tradeoffs.md#tr4-edge-types-few-hard-coded-vs-typed-registry-vs-untyped) ([TR4](../research/synthesis/tradeoffs.md#tr4-edge-types-few-hard-coded-vs-typed-registry-vs-untyped)). See [`renderer/src/scene/Edge.tsx`](../../renderer/src/scene/Edge.tsx).
- **`cluster`** — A translucent labeled region wrapping its `spec.refs`. Today a special `kind` on `Artifact`. Has `header` label; promoted to a first-class **frame** primitive below ([Q7.2](../research/synthesis/open-questions.md#q72--should-clusters-have-headers-and-be-exportable-as-a-unit-tldraw-frame-pattern-primitive-promotion)).

### New primitives (introduced here)

- **`panel`** — A 2D rectangular surface in 3D space hosting widgets (charts, tables, controls). The Console-mode slot occupant. Anchored `world` by default. Always rendered flat (no occluded back side per [Volumes-as-windows anti-pattern](../research/synthesis/anti-patterns.md#volumes-used-as-windows-with-3d-objects-inside-evidence-medium)). Widgets inside a panel are 2D Vega-Lite-grammar marks; the panel itself is a 3D plate of fixed aspect. Replaces what BI calls a "tile" or "dashboard widget".
- **`frame`** — A promoted `cluster` with an explicit colored `header` bar at top, an exportable bounding rectangle, and a clipping region. Splits the current `cluster` into two siblings: `cluster` stays the agent-emergent grouping (Layout-agent output); `frame` is the user-authored visible container (tldraw `Frame` semantics — see [`patterns.md#frame-vs-group-split`](../research/synthesis/patterns.md#frame-vs-group-split-evidence-medium)). A `frame` may *contain* a `cluster` but is not the same thing.
- **`timeline-axis`** — A linear-time substrate primitive: a horizontal beam in world-space carrying chronological tick marks, with attached artifacts strung at their `createdAt` positions. Used for time-scrubbing the reasoning trace ([Q1.5 / WS-07 Open Q #1](../research/synthesis/open-questions.md)) and the agent-mission-clock ([patterns: mission-elapsed-time](../research/synthesis/patterns.md#mission-elapsed-time-as-universal-anchor-evidence-medium)).
- **`volume`** — A 3D container for content where the third axis carries genuine quantitative meaning: 3D scatter plots, molecule structures, density volumes. Distinct from `panel` (flat) and from `frame` (2D region). Apple's Window/Volume/Immersive triad maps as: `panel` = Window, `volume` = Volume, full scene = Immersive ([patterns: WVI triad](../research/synthesis/patterns.md#window--volume--immersive-space-triad-evidence-medium)). **Banned use:** `volume` MUST NOT encode non-spatial data with the third axis ([anti-pattern: 3D for abstract data](../research/synthesis/anti-patterns.md#3d-barpieline-charts-in-abstract-data--watch-evidence-strong)).
- **`anchor`** — Not a renderable mesh; a *field* on every spatial primitive declaring its coordinate frame. Values: `world | desk | body | hand | head | shared`. Default `world`. Required by [T8](../research/synthesis/themes.md#t8-world-anchored-data-hand-anchored-controls-head-anchored-status-only--very-strong) / [TR3](../research/synthesis/tradeoffs.md#tr3-anchoring-ar-world-vs-desk-vs-head-vs-hand-vs-shared). Refuse to render `head` for any content with TTL > 3s.
- **`reasoning-thread`** — A volumetric translucent tube traced from an agent's origin plane through its tool-call beads to the produced result(s). Per-agent depth layer (Z = agent identity) per [WS-07's Jarvis-shaped opportunity](../research/synthesis/themes.md#t4-reasoning-trace-as-nodes-in-space-is-the-unexplored-frontier--strong). Branches fork; retries dim. See `patterns.md#reasoning-thread-as-spatial-primitive`. Replaces the DOM `ActivityPanel` in AR. Implementation target: `renderer/src/scene/ReasoningThread.tsx` (R3F MeshLine).
- **`tool-call-trail`** — A breadcrumb of tool-call beads along a `reasoning-thread`. Each bead is a small glyph (0.05–0.15 world units) colored per tool family (read=teal, mutate=amber, query=blue, error=red). Hovering a bead surfaces the typed tool arguments + result.
- **`intent-ghost`** — A translucent (alpha 0.35) copy of an artifact at its *proposed* position before the Layout agent commits the move. User may drag-correct the ghost, then accept (Enter / voice "ok"). Implements plan-then-execute ([T14](../research/synthesis/themes.md#t14-plan-then-execute-with-ghost-preview-beats-commit-then-undo--strong)) for spatial moves.
- **`agent-aura`** — A soft 1.5–2.5 world-unit luminous halo around the region of space where an agent is currently mutating. Single-channel (luminance pulse at ≤2 Hz) per [T9](../research/synthesis/themes.md#t9-preattentive-single-channel-pop-out-for-ambient-signals-aural-for-high-priority--very-strong)'s preattentive rule. Each agent gets a hue from the agent palette (§4); the aura is that hue at 20% alpha. Auras may overlap; alphas additively blend.

### Primitive composition rules

- An `artifact` lives at a position; a `frame` clips its members; a `cluster` is a soft membership; a `panel` hosts widgets; a `volume` hosts 3D point/glyph data.
- A `reasoning-thread` traverses *between* artifacts but is not parented to any one of them.
- An `intent-ghost` is a transient overlay; never persists across a session.
- An `agent-aura` is a transient overlay; auto-fades 1–2s after agent goes idle.

---

## 3. Data → Form mapping table

The exhaustive map of every data type Jarvis ingests to the spatial primitive it becomes. Adding a new artifact `kind` requires adding a row here.

| Data type | Spatial form | Rendering | LOD policy | Source pattern |
|---|---|---|---|---|
| markdown doc | `artifact` (plate) | `<planeGeometry>` + canvas-2D card texture, billboarded label | full → simplified (kill body preview) → icon → dot at 3 distance bands | [typed-graph substrate](../research/synthesis/patterns.md#typed-graph-substrate-evidence-strong) |
| note (short text) | `artifact` (plate) | Same as doc, smaller default size (1.0×0.6 vs 1.6×1.0) | Same 3-band; aggregate ≥4 overlapping into "+N" badge | [typed-graph substrate](../research/synthesis/patterns.md#typed-graph-substrate-evidence-strong) |
| code snippet | `artifact` (plate, mono-styled) | Card texture uses JetBrains Mono; syntax-color band at top | Same 3-band; body preview drops first | [typed-graph substrate](../research/synthesis/patterns.md#typed-graph-substrate-evidence-strong) |
| log file | `artifact` (plate, terminal-styled) | Card texture dark background + mono; auto-tail to last 20 lines | Aggregate to "log count" glyph when >5 in cluster | [trends-with-current-value](../research/synthesis/patterns.md#trends-with-current-value-evidence-medium) |
| image | `artifact` (image plate) | Texture = image content directly, aspect-preserved | Resize-to-thumbnail at far distance; kind-icon at icon LOD | [no-unjustified-3D](../research/synthesis/patterns.md#no-unjustified-3d-evidence-strong) |
| link | `artifact` (plate) | Card texture shows URL + OG image if fetched | Drop OG image first, then URL, then to glyph | [typed-graph substrate](../research/synthesis/patterns.md#typed-graph-substrate-evidence-strong) |
| typed relationship (edge) | `edge` (Bézier) | Curve geometry, color per Link-Type (see §4) | Hover-only label; line-style per kind for distance read | [all-edges-look-identical (avoidance)](../research/synthesis/anti-patterns.md#all-edges-look-identical-evidence-medium) |
| 1-hop neighborhood | implicit (hover-driven dim) | Non-neighbors render at alpha 0.25, neighbors stay opaque | Same; dim cascade is preattentive single-channel | [coordinated multiple views w/ linked highlighting](../research/synthesis/patterns.md#coordinated-multiple-views-with-linked-highlighting-evidence-strong) |
| topic/tag-derived grouping | `cluster` (translucent region) | Convex-hull mesh, alpha 0.10, edge stroke 1 px | At >200 artifacts, cluster collapses to single glyph + "+N" | [hierarchical subgraph abstraction](../research/synthesis/patterns.md#hierarchical-subgraph-abstraction-evidence-strong) |
| user-authored region | `frame` (clipped rectangle + header) | Solid header bar (kind color), translucent body, label always-visible | Header stays at icon LOD; body fades first | [frame vs group split](../research/synthesis/patterns.md#frame-vs-group-split-evidence-medium) |
| time series | line chart on `panel` | Vega-Lite line mark, axes auto-generated | At dot LOD: replace with last-value sparkline; at glyph: kind icon | [declarative grammar](../research/synthesis/patterns.md#declarative-grammar-with-auto-compiled-chrome-evidence-strong) + [trends-with-current-value](../research/synthesis/patterns.md#trends-with-current-value-evidence-medium) |
| relationship matrix | heatmap on `panel` | Vega-Lite rect mark, color luminance = magnitude | Collapse to 8×8 down-sampled view at far distance | [declarative grammar](../research/synthesis/patterns.md#declarative-grammar-with-auto-compiled-chrome-evidence-strong) |
| DAG / pipeline | flow-panel (`panel` w/ node-edge marks) | Sugiyama auto-layout, upstream-left | Subgraph-collapse at ≥50 nodes per [WS-09](../research/09-node-flow-editors.md); subnet glyph above | [visualization pipeline as DAG](../research/synthesis/patterns.md#visualization-pipeline-as-data-flow-dag-evidence-strong) |
| 3D scatter | `volume` (3D point glyphs) | Instanced spheres in volume, axes rendered as world-space gridlines | Aggregation-mark: hex-bins at density >200/m³ per [WS-08](../research/08-scientific-viz.md) | [aggregation as a different mark](../research/synthesis/patterns.md#aggregation-as-a-different-mark-evidence-medium) |
| structural geometry (molecule / building) | `volume` (3D mesh + atoms) | Custom mesh; lit shader, atoms as instanced spheres | Mesh decimation; atoms→cartoon at distance per [WS-08](../research/08-scientific-viz.md) | [streaming + progressive refinement](../research/synthesis/patterns.md#streaming--progressive-refinement-evidence-medium) |
| agent reasoning trace | `reasoning-thread` (3D tube) | R3F MeshLine, color = agent palette hue, alpha decays with age | Fold completed threads into single dim beam after 3 min; time-scrubber recovers | [reasoning-thread as spatial primitive](../research/synthesis/patterns.md#reasoning-thread-as-spatial-primitive-evidence-medium) |
| tool call (within trace) | `tool-call-trail` bead | Small instanced sphere/cube along tube, color per tool family | Hide at far LOD, keep tube; bead-cluster + count above 10 | [reasoning-thread as spatial primitive](../research/synthesis/patterns.md#reasoning-thread-as-spatial-primitive-evidence-medium) |
| agent activity region | `agent-aura` (halo) | Sphere mesh, additive blend, alpha 0.2, luminance pulse 2 Hz | Aura radius shrinks at distance; never fully hidden | [animated transition for state change](../research/synthesis/patterns.md#animated-transition-for-state-change-evidence-strong) (preattentive variant) |
| proposed agent move | `intent-ghost` | Same mesh as artifact, alpha 0.35, no shadow | Same as artifact; ghost auto-dismisses after 30s if not accepted | [intent-ghost plates](../research/synthesis/patterns.md#intent-ghost-plates--ghost-preview-evidence-medium) |
| awaiting-input event | `attention-beam` (line from agent plane to artifact) | Tube geometry, 1.0 world unit width, kind-color glow | Always visible (interrupt-class); fades on user gaze/select | [attention beam](../research/synthesis/patterns.md#attention-beam-waiting-on-you-evidence-medium) |
| alarm / error (layered alert) | overlay glow + audio | Per-layer color border on affected artifact + spatial audio per agent | Always visible at the layered priority tier ([WS-12](../research/12-multi-dashboard-spatial.md)) | [layered alert priority](../research/synthesis/patterns.md#layered-alert-priority-paired-visualaural-evidence-medium) |
| time substrate (chronological) | `timeline-axis` | World-space beam with tick marks; artifacts string at `createdAt` | Tick density adapts to camera zoom; labels thin per-band | [time-as-encoding](../research/synthesis/patterns.md#time-as-encoding-animation-grammar-evidence-medium) |
| highlighted span (forked from parent) | `artifact` w/ `parentArtifactId` set | Smaller plate (0.7×0.45), tethered to parent by a thin colored line | Highlight collapses into parent at icon LOD | [subnetwork dive-in/dive-up](../research/synthesis/patterns.md#subnetwork-dive-in--dive-up-evidence-strong) |
| saved selection / view | `bookmark` (camera + filter state) | Not rendered as scene primitive; surfaces as slot in BookmarksBar | n/a | [saved exploration / view-as-document](../research/synthesis/patterns.md#saved-exploration--view-as-document-evidence-strong) |
| Console-mode slot occupant | `panel` (world-anchored in horseshoe arc) | Fixed slot position, world-anchored; agent fills slot | Slot is invariant; content swap follows drill-down by content swap | [horseshoe of fixed-slot panels](../research/synthesis/patterns.md#horseshoe-of-fixed-slot-panels-evidence-medium) |
| agent identity (Worker/Layout/Listening/Naming) | parallel `Z` plane | Faintly visible gridline at `z = -k * agentIndex` (k = 0.35); auras anchor here | Plane line fades at distance; agent label as tab on plane edge | [per-agent depth layer](../research/synthesis/patterns.md#per-agent-depth-layer-z--agent-identity-evidence-medium) |

That's 24 rows. The mapping is *meant to be exhaustive*. Anything not in this table must be reduced to one of these forms before rendering.

---

## 4. Color system

Two color layers per visual primitive: **categorical kind** (fill hue) and **lifecycle state** (outer overlay). A third orthogonal scale — recency, confidence, agent-touched — is forbidden in color; push it to size, glyph, badge, or position. This is [T5](../research/synthesis/themes.md#t5-two-layer-color-categorical-kind--state-overlay-never-a-third--very-strong) and the [three-color-overload anti-pattern](../research/synthesis/anti-patterns.md#three-color-overload-on-a-single-node--watch-evidence-medium).

### 4.1 Kind palette (categorical, 8 hues)

Source: Mural's colorblind-safe documented palette ([Q8.1](../research/synthesis/open-questions.md#q81--colorblind-safe-default-palette-accessibility)), adapted to the current 7 artifact kinds plus 1 reserved for `panel`. Validated against deuteranopia / protanopia simulators.

| Kind | Hex | Use |
|---|---|---|
| `doc` | `#5B8DEF` (blue) | Long-form markdown body |
| `note` | `#F2C94C` (amber) | Short captures, idea snippets |
| `code` | `#27AE60` (green) | Source code in any language |
| `log` | `#828282` (neutral grey) | Execution traces, terminal output |
| `image` | `#9B51E0` (violet) | Visual content |
| `link` | `#56CCF2` (cyan) | External URL |
| `cluster` | `#F2994A` (orange) | Grouping region — header bar at this hue at alpha 1.0; fill at alpha 0.10 |
| `panel` | `#BB6BD9` (magenta) | Dashboard widget tile |

Cap at 10 categorical hues per [Few](../research/synthesis/themes.md#t5-two-layer-color-categorical-kind--state-overlay-never-a-third--very-strong) (qualitative scales degrade past 8–10). When a new kind needs introducing past 10, fold it under an existing kind family with a glyph/icon distinction, not a new hue.

`frame` does NOT receive a kind hue — its header inherits from the dominant member kind, or from a user-assigned per-frame color (semantic-color-by-frame is the [`patterns.md#backdrop--frame-with-semantic-color`](../research/synthesis/patterns.md#backdrop--frame-with-semantic-color-evidence-medium) idiom).

### 4.2 State palette (lifecycle overlay)

Applied as outer ring / glow on the artifact. Mirrors `Artifact.state` in [MODEL.md](../MODEL.md):

| State | Hex | Visual |
|---|---|---|
| `streaming` | `#56CCF2` (cyan) | 1.5 px outer ring + 2 Hz luminance pulse |
| `ready` | `none` | No ring; default state, nothing to signal |
| `updating` | `#F2C94C` (amber) | 1.5 px outer ring, slow rotation |
| `error` | `#EB5757` (red) | 2.5 px outer ring + spatial audio "click" once |
| `awaiting-input` | `#BB6BD9` (magenta) | 2.5 px outer ring + attention-beam from agent plane |

Reserve `red` and `amber` for state only. Do not introduce a `kind` at red or amber (the current edge-kind `contradicts` uses red — this is reassigned in §4.4 to dashed-line styling on the existing magenta hue to keep red free for state).

### 4.3 Agent palette (per agent role)

Used on `agent-aura`, `reasoning-thread` tubes, agent identity Z-plane edge, and per-agent HUD accents. Distinct hues; complementary so two adjacent agents read as different.

| Agent | Hex | Use |
|---|---|---|
| Worker | `#5B8DEF` (blue) | Mutation-class agent — produces artifacts |
| Layout | `#27AE60` (green) | Spatial reorganization — moves plates |
| Listening | `#F2C94C` (amber) | Always-on input segmenter |
| Naming | `#BB6BD9` (magenta) | Background classifier |

Agent identity is *position* first (Z-plane per [T4](../research/synthesis/themes.md#t4-reasoning-trace-as-nodes-in-space-is-the-unexplored-frontier--strong)) and *hue* second; never use the agent hue as the artifact fill. The agent hue lives on the *thread*, *aura*, and *plane edge* only.

### 4.4 Edge-type → color mapping

Aligned with the typed Link-Type registry promotion ([TR4](../research/synthesis/tradeoffs.md#tr4-edge-types-few-hard-coded-vs-typed-registry-vs-untyped)). Uses the kind-hue space NOT the state space (state stays free).

| Edge kind | Hex | Style | Arrow |
|---|---|---|---|
| `derives` | `#5B8DEF` (blue) | Solid 1.5 px Bézier | Arrowhead at dst |
| `references` | `#828282` (neutral grey) | Solid 1.0 px | None |
| `contradicts` | `#BB6BD9` (magenta) | **Dashed** 1.5 px (dash 6 / gap 4) | Arrowhead at dst |
| `groups-with` | `#F2994A` (orange) | Solid 0.75 px, alpha 0.4 | None |

Label is hover-only ([per-class label thinning](../research/synthesis/patterns.md#per-class-label-thinning-evidence-strong) + [edge-labels-always-on anti-pattern](../research/synthesis/anti-patterns.md#edge-labels-always-on-at-scale-evidence-strong)). Color and line style together give at-distance read.

### 4.5 Selection / focus encoding

Selection is a separate layer that does *not* compete with kind or state. Selected artifacts get a 2.5 px outer ring at `#FFFFFF` (white) with a 1.0 luminance value; non-selected artifacts in the same scene drop to alpha 0.85 (the dimming is preattentive but subtle, per [T6](../research/synthesis/themes.md#t6-linked-highlighting--brushing-is-universal-in-bi-rare-in-pkm-and-absent-in-agent-tools--very-strong)). Hover dim ([§ TR5](../research/synthesis/tradeoffs.md#tr5-multi-view-linking-default-off-vs-on-vs-explicit-only)) drops non-1-hop neighbors to alpha 0.45.

### 4.6 Anti-pattern guard

Per [color-by-folder-only anti-pattern](../research/synthesis/anti-patterns.md#color-by-folder-only--watch-evidence-strong): never bind color to `boardId` or any organizational-only attribute. Color belongs to the *kind* (semantic) and the *state* (lifecycle), period. If the user wants per-cluster color, they author a `frame` with a chosen header color — that is per-author intent, not an automatic encoding.

---

## 5. Typography

Two type families. UI labels and chrome use **Inter**; code and identifiers use **JetBrains Mono**. Both are loaded once at app start; no fallback chain that swaps mid-frame.

### 5.1 Sizes and distances

For desktop, sizes are in CSS pixels (DOM panels) and world units (R3F scene). For AR, sizes follow vendor guidance from [WS-02](../research/02-arvr-vendors.md) (specifically: 34.6–39.6 pt minimum at 2 m, 8.9–11.1 pt at 45 cm, 22 pt comfortable at arm's length).

| Surface | Size | Family | Use |
|---|---|---|---|
| Body text (Inspector, panels) | 14 px | Inter 400 | Long-form reading |
| Body text (small) | 12 px | Inter 400 | Sub-labels, metadata |
| Plate label (front face) | 22 px equivalent at ~1 m camera distance | Inter 600 | shortName + first line of body |
| Plate label (AR) | 22 pt at arm's length / 39.6 pt at 2 m | Inter 600 (via troika-three-text) | Same |
| Edge label (hover) | 12 px on DOM / 18 pt billboarded in scene | Inter 500 | Edge kind name |
| Code body | 13 px | JetBrains Mono 400 | Inside code-kind artifact body |
| Code identifier (inline) | 14 px | JetBrains Mono 400 | `@shortName` references in markdown |
| Agent label (Z-plane edge) | 24 pt billboarded | Inter 700 | "Worker", "Layout", etc. |
| Frame header | 16 px / 28 pt billboarded | Inter 700 | Per-frame label |
| HUD numeric (cost/tokens) | 13 px | JetBrains Mono 500 | Per-agent HUD |

### 5.2 DOM `<Html>` vs R3F `<Text>` decision rule

This is on the AR-bridge critical path ([ar-readiness-inventory.md M2](../research/ar-readiness-inventory.md#8-migration-milestones-proposal--to-be-finalized-in-ar-vr-bridgemd)).

- **In-scene labels billboarded to face the camera**: use `<Text>` from `@react-three/drei` (which uses `troika-three-text` for SDF rendering). This covers: artifact plate labels, edge hover labels, cluster headers, frame headers, agent Z-plane labels, attention-beam labels.
- **DOM panels (Inspector, ActivityPanel, InputBar, LayoutMenu, etc.)**: use regular DOM React (existing). These are fixed screen-edge UI in desktop mode and become **companion windows** in visionOS AR mode ([ar-readiness-inventory §6](../research/ar-readiness-inventory.md#6-multi-window--multi-anchor-opportunities-visionos)). They do NOT migrate into the R3F scene.
- **`<Html>` from drei (current usage in Artifact.tsx and Edge.tsx)**: deprecated for in-scene use. Replace with `<Text>` per the migration in M2. The only remaining `<Html>` use case is inside fixed DOM panels where R3F primitives don't apply — and those panels are DOM-native already, so the use case is effectively nil.

### 5.3 Text rendering anti-patterns

- **No extruded 3D text** ([anti-pattern](../research/synthesis/anti-patterns.md#extruded-3d-text--watch-evidence-medium)) — stereo disparity on letterforms thrashes accommodation. All text is on a single billboarded plane.
- **No always-on labels at scale** ([anti-pattern](../research/synthesis/anti-patterns.md#label-thrash-always-on-labels-on-every-mark--watch-evidence-strong)) — per-class distance threshold (§7).
- **No conjunction cues in text styling** ([anti-pattern](../research/synthesis/anti-patterns.md#conjunction-cue-notifications-evidence-medium)) — never "red AND bold AND italic" for one signal; pick one channel.

---

## 6. Motion language

When and why we animate. Easing, durations, identity preservation. From [T7](../research/synthesis/themes.md#t7-animated-transitions-defeat-change-blindness-instant-snaps-cause-confusion--very-strong) (animation defeats change-blindness) and [TR12](../research/synthesis/tradeoffs.md#tr12-state-change-feedback-snap-transition-vs-animated-transition-vs-ghost-preview-vs-morph) (state-change feedback).

### 6.1 What animates

| Event | Duration | Easing | Identity preserved? |
|---|---|---|---|
| Artifact created | 320 ms | `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out, "soft pop") | n/a |
| Artifact moved by Layout agent (single) | 800 ms | `cubic-bezier(0.4, 0, 0.2, 1)` (smooth in/out) | yes — same mesh, position lerp |
| Layout-agent reorganize (≥5 artifacts) | 1200 ms staggered | Same; stagger 40 ms per artifact, sorted by distance | yes — semantic bundling |
| Camera transition (bookmark jump, focus-fit) | 600 ms | `cubic-bezier(0.32, 0.72, 0, 1)` (Apple system curve) | n/a |
| Edge created | 240 ms | ease-out | n/a |
| Edge deleted | 180 ms | ease-in | n/a |
| Cluster region appears | 400 ms | ease-out, alpha 0 → 0.10 | n/a |
| Selection ring appears | 120 ms | ease-out | n/a |
| Hover dim cascade | 180 ms | ease-out, alpha 1.0 → 0.45 for non-neighbors | n/a |
| Streaming state pulse | 500 ms / cycle, ease-in-out | continuous | n/a |
| Agent-aura pulse | 500 ms / cycle (2 Hz) | sine | n/a |
| `intent-ghost` materialize | 240 ms | ease-out, alpha 0 → 0.35 | n/a |
| `intent-ghost` commit (ghost → real) | 320 ms | ease-out | n/a |
| Attention-beam appear | 200 ms | ease-out + 1 Hz width pulse afterward | n/a |
| Attention-beam dismiss (on user attention) | 400 ms fade | ease-in | n/a |

### 6.2 What does NOT animate

- **State change of a single artifact's `state` field** (streaming → ready): no position change, only the outer ring fades in / out at 180 ms.
- **Selection state of an artifact**: 120 ms ring appearance, no position change.
- **Filter chip toggle**: dim cascade animates (180 ms), but artifacts do NOT move (selection ≠ filter — [T11](../research/synthesis/themes.md#t11-filter-vs-selection-must-be-distinguished-palantir-style--strong)).

### 6.3 Spring physics for edges (current)

Edges use spring physics on their control points to preserve attachment during drag. Stiffness `120`, damping `14`, mass `1.0`. This is unchanged from current `Edge.tsx` and lives below the animation layer; it is the *continuous* response to position changes, not a discrete tween.

### 6.4 Anti-pattern guards

- **No snap-transitions on state changes** ([anti-pattern](../research/synthesis/anti-patterns.md#snap-transition-state-change--watch-evidence-strong)) — every position change crosses the 800–1500 ms tween corridor (the [Heer & Robertson](../research/01-academic-foundations.md) zone). The renderer enforces a minimum tween of 600 ms on programmatic moves; only user-driven drag is exempt (and that uses spring physics, which is continuous, not instant).
- **No reflow on every interaction** ([auto-layout anti-pattern](../research/synthesis/anti-patterns.md#auto-layout-that-re-flows-on-every-interaction--watch-evidence-strong)) — only `apply_layout_plan` (user-invoked) or `request_layout_pass` (explicit) trigger movement.
- **No always-spinning chrome** ([anti-pattern](../research/synthesis/anti-patterns.md#always-spinning-orbital-widgets-evidence-weak)) — motion is reserved for state change. The `updating` state ring rotation is the only persistent motion in the entire UI.

---

## 7. LOD policy

The visible-artifact ceiling is ~200 ([T2](../research/synthesis/themes.md#t2-focus-plus-context-never-draw-the-full-graph--very-strong)). The Layout agent's job is not "place every artifact" but "decide what to show" ([Q4.2](../research/synthesis/open-questions.md#q42--should-jarvis-ever-try-to-render-a-full-graph-view-design-discipline) — *we refuse to ship a "fit all" view*).

### 7.1 Distance bands

LOD is **viewer-relative** (camera distance) combined with **data-relative** (importance / focus). Three bands per artifact, plus an aggregation band for clusters above the visible ceiling.

| Band | Camera distance from artifact | Render |
|---|---|---|
| `full` | ≤ 6 world units | Card texture full, body preview, all labels visible |
| `simplified` | 6 – 15 world units | Card texture without body preview, only `shortName` label |
| `icon` | 15 – 40 world units | Kind glyph only, no label unless within 1-hop of focused selection |
| `dot` | > 40 world units | 0.1 unit colored dot, kind hue only |

This is the [LOD-via-style-downgrade](../research/synthesis/patterns.md#lod-via-style-downgrade-not-just-culling-evidence-medium) pattern: change *what* is drawn, not only *whether*.

### 7.2 Label thinning per kind

Per [per-class label thinning](../research/synthesis/patterns.md#per-class-label-thinning-evidence-strong):

| Kind | Label visible until | Notes |
|---|---|---|
| `doc` | `icon` band | Always show label (high-info kind) |
| `note` | `simplified` band | Drops label first (low-info-per-pixel) |
| `code` | `icon` band | Filename matters |
| `log` | `simplified` band | Path matters less than content |
| `image` | `dot` band | Image content carries the signal, label often redundant |
| `link` | `simplified` band | URL is the content |
| `cluster` | always | Cluster names are the wayfinding signal |
| `panel` | `icon` band | Panel title is critical at all but extreme distance |
| `frame` | always | Frame header is the wayfinding signal |

### 7.3 Aggregation at scale

Above 200 visible artifacts, the Layout agent invokes community-detection (Louvain) — see [TR9](../research/synthesis/tradeoffs.md#tr9-layout-algorithm-llm-driven-vs-heuristic-force-directed-vs-hierarchical-vs-grid-vs-slot). Each community above 50 members renders as a **single cluster-glyph** with a "+N more" badge ([aggregation as a different mark](../research/synthesis/patterns.md#aggregation-as-a-different-mark-evidence-medium)). The user expands by clicking the glyph (subnetwork dive-in per [WS-09](../research/09-node-flow-editors.md)).

This is non-negotiable: a 1000-artifact board does NOT render 1000 plates. It renders ~10–15 community glyphs + the focused selection's 1-hop neighborhood at full LOD. Per [TheBrain principle](../research/synthesis/open-questions.md#q42--should-jarvis-ever-try-to-render-a-full-graph-view-design-discipline): *never render the full graph*.

### 7.4 Edge LOD

| Camera distance | Edges shown |
|---|---|
| ≤ 6 | All edges within view frustum |
| 6 – 15 | Only edges to/from selected or hovered artifacts |
| 15 – 40 | Only `derives` and `contradicts` (structural-rank); `references` and `groups-with` hidden |
| > 40 | All edges hidden; cluster glyphs carry intra-cluster relationships implicitly |

### 7.5 Reasoning-thread LOD

Per [WS-07 Open Q #4](../research/07-ai-native-reasoning.md): the trace itself needs LOD or it becomes hairball. The rule:

| Age | Render |
|---|---|
| Active (current step) | Full tube, beads visible, color saturation 1.0 |
| < 3 min | Full tube, saturation 0.7 |
| 3 – 30 min | Tube only, no beads, saturation 0.4 |
| > 30 min | Folded into a single dim beam per agent plane |

User can recover history via time-scrubber ([Q1.5 deferred to M3](../research/synthesis/open-questions.md)).

### 7.6 LOD transition animation

Crossing a distance threshold animates over 200 ms (`cubic-bezier(0.4, 0, 0.2, 1)`) — never a snap. The render-mode flip is identity-preserving (same `id` keeps its mesh slot; the texture and label visibility cross-fade).

---

## 8. Materials & depth cues

### 8.1 Material defaults

- **Matte everywhere by default.** No glossy highlights on plates, panels, or volumes. WS-02 explicitly warns against reflective surfaces in AR — specular highlights compete with stereo cues and trigger accommodation thrash. Use `<meshBasicMaterial>` for plates (no lighting calc needed — the texture is pre-baked).
- **No drop shadows on data marks** ([Tufte data-ink violation](../research/synthesis/anti-patterns.md#decoration-over-data-tufte-data-ink-violation-evidence-medium)). Shadows live on the cluster region's bottom-edge only, at alpha 0.15 — for grounding, not decoration.
- **No transparency cascade** ([holographic transparency anti-pattern](../research/synthesis/anti-patterns.md#holographic-transparency-cascade-evidence-weak)). Plates are opaque (alpha 1.0). Translucency is reserved for clusters (0.10), ghosts (0.35), and reasoning threads (0.25–0.7 per LOD).
- **Frames have a 1 px solid border** at the kind hue + the header bar at the kind hue at alpha 1.0; body alpha 0.05. No gradient, no shadow.

### 8.2 Depth cues

3D space gains depth understanding from four sources, ranked by perceptual strength per [WS-01](../research/synthesis/patterns.md#motion-parallax-as-primary-depth-cue-evidence-medium):

1. **Motion parallax** (primary) — orbit / head movement reveals 3D structure. Earned only when the user actually moves. The orbit camera (TR2) gives this for free; stationary Console mode trades it for muscle-memory.
2. **Stereo** (AR only) — restored when entering XR. Until then, n/a.
3. **Occlusion** — natural from mesh rendering; cluster regions are explicitly translucent so they don't occlude members.
4. **Atmospheric perspective** — far artifacts get alpha 0.85 multiplier and slight desaturation. Implemented as a fog distance ramp (`<fog>` near=10, far=80, color matches background `#1A1D24`).

### 8.3 Depth-of-field for focus

The focused artifact (single selection) gets a subtle DoF ring: all artifacts further than 8 world units from the focused one receive an additional 15% blur (Gaussian, 1 px on average distance, 3 px at 30 units). This is a **single channel** signal — luminance, not motion or color — per [T9](../research/synthesis/themes.md#t9-preattentive-single-channel-pop-out-for-ambient-signals-aural-for-high-priority--very-strong). Toggleable; defaults on in canvas mode, off in Console mode (where panel slots stay sharp).

### 8.4 Banned decorative depth

Per [decorative-3D anti-pattern](../research/synthesis/anti-patterns.md#decorative-3d-visual-flourish-evidence-medium) and [WS-12 "decoration over data"](../research/synthesis/anti-patterns.md#decoration-over-data-tufte-data-ink-violation-evidence-medium):

- No bevels on plates.
- No volumetric fog as ambience (fog is only the atmospheric-perspective ramp above).
- No particle effects, no swarms, no orbital chrome ([cinematic-JARVIS anti-pattern](../research/synthesis/anti-patterns.md#particleswarm-effects-on-data-points-evidence-weak)).
- No "curved displays suggesting enclosure" ([anti-pattern](../research/synthesis/anti-patterns.md#curveddomed-displays-suggesting-enclosure-evidence-weak)).
- No lens flares, no bloom on artifacts. (Bloom is permitted only on the `error` state ring at low intensity and on the attention-beam at low intensity — both are interrupt-class, single-event.)

### 8.5 Background

Single solid background color `#1A1D24` (near-black with a faint blue cast). No skybox, no gradient. The agent-identity Z-planes are visible as faint 1 px gridlines on this background at alpha 0.15 — they exist as a wayfinding aid, not decoration.

---

## 9. Compliance with anti-patterns

This section names every ⚠ Watch anti-pattern from the [catalog](../research/synthesis/anti-patterns.md#watch-summary--items-that-cross-jarvis-design-plans) and states how this Visual Language complies:

| Anti-pattern | Compliance |
|---|---|
| 1:1 head-locked HUD | All anchors are `world` by default; `head` refused for >3s content (§2) |
| 3D bar/pie/line in abstract data | `volume` primitive banned for non-spatial data (§2); panels are flat (§3) |
| Label-thrash | Per-kind distance thinning (§7.2); `<Text>` not always-on at scale |
| Snap-transition state change | 800–1500 ms tween corridor enforced (§6.1) |
| "Hairball" force-directed at scale | LOD aggregation above 200 (§7.3); Louvain clusters render as glyphs |
| Edge labels always-on | Hover-only labels (§4.4) |
| Trace tree at depth 10+ | Reasoning-thread folds at 30 min + LOD (§7.5) |
| Auto-layout reflows on every interaction | Only user-invoked layout triggers movement (§6.4) |
| Always-on dense HUD | DOM panels follow owner-zone discipline (cross-ref [INTERACTION-LANGUAGE.md](INTERACTION-LANGUAGE.md)) |
| Color-by-folder-only | Color binds to kind + state only (§4.6) |
| Implicit re-anchoring on head motion | Anchor changes are explicit, never motion-triggered (§2 anchor field) |
| Free-fly camera in abstract VR | Banned for canvas; orbit-around-focus only (covered in [INTERACTION-LANGUAGE.md](INTERACTION-LANGUAGE.md)) |
| Extruded 3D text | All text is single-plane billboarded (§5.3) |
| Three-color overload | Two-layer rule (§4); state stays exclusive to red/amber |
| Hiding the reasoning entirely | ActivityPanel + reasoning-thread both first-class (§3 row) |
| Streaming chat as primary multi-agent UI | Per-agent Z-plane separation (§4.3) |
| Graph in a tab | Scene IS the workspace; no "graph view toggle" |
| Cargo-cult monitor sprawl | Console mode enforces slot assignment (§3 row, defined in [INTERACTION-LANGUAGE.md](INTERACTION-LANGUAGE.md)) |
| Head-anchored primary content | World-anchored default (§2); head ≤3s only |
| Missing or hidden reasoning trace | reasoning-thread co-located with the visual change (§3) |
| HUD elements competing for one corner | Owner-zone discipline in [INTERACTION-LANGUAGE.md](INTERACTION-LANGUAGE.md) §7 |
| Particle/swarm effects | Banned outright (§8.4) |
| Holographic transparency cascade | Opaque-by-default discipline (§8.1) |

---

## 10. Open visual-language questions

Acknowledged unresolved decisions, with the synthesis question they map to:

- **Q4.5** — Stacked lens count cap. Provisional: 2 simultaneous lenses. Revisit after first user testing.
- **Q5.1** — Cross-filter behavior in 3D: dim non-matches vs physically move into a "dimmed cluster." Provisional: dim (alpha 0.25); needs prototype.
- **Q4.1** — Focus-pivot camera with multi-select. Provisional: pivot to bounding-box center; needs prototype.
- **Q1.4 / M2** — Visual avatars per agent vs ambient aura only. This doc picks aura-only (§3 row, §4.3); revisit if needed.
- **Agent identity color vs Z-position** — Both used (§4.3). If they conflict at scale, position wins.

---

## Cross-references

- Interaction model: [INTERACTION-LANGUAGE.md](INTERACTION-LANGUAGE.md)
- Architecture: [../ARCHITECTURE.md](../ARCHITECTURE.md)
- Data model: [../MODEL.md](../MODEL.md)
- Themes: [../research/synthesis/themes.md](../research/synthesis/themes.md)
- Patterns catalog: [../research/synthesis/patterns.md](../research/synthesis/patterns.md)
- Tradeoffs: [../research/synthesis/tradeoffs.md](../research/synthesis/tradeoffs.md)
- Anti-patterns: [../research/synthesis/anti-patterns.md](../research/synthesis/anti-patterns.md)
- Open questions: [../research/synthesis/open-questions.md](../research/synthesis/open-questions.md)
- AR-readiness baseline: [../research/ar-readiness-inventory.md](../research/ar-readiness-inventory.md)
