# Tradeoff Matrices

**Purpose:** For each design decision where the surveyed tools have *visibly diverged*, document who chose what, why, and what Jarvis should do. These are the questions Phase 4 will be asked to defend; better to land each position with evidence now than to litigate them at sprint-start.

**Audience:** Phase 4 product team; reviewers of the AR-VR-bridge and VISUAL-LANGUAGE docs.

**Status:** Synthesis B (tradeoffs). Companion: `themes.md` (convergent ideas), `patterns.md` (catalog).

**Format note:** Each tradeoff matrix lists ≥3 approaches with pros/cons. *Jarvis position* states a recommendation; *Why* cites evidence; *Phase implication* says when (Now / Next / Later) — where "Now" = current phase / next 2 weeks, "Next" = within the next planning cycle, "Later" = post-WebXR.

---

## TR1. Labels: always-on vs hover vs distance-thinned vs voice-spoken

| Approach | Used by | Pros | Cons |
|---|---|---|---|
| **Always-on, fixed-position** | WS-03 BI (Power BI, Tableau, every dashboard), WS-12 control rooms (ISA-101 doctrine), WS-06 canvas tools default | Zero learning curve; survives stress; safe for screenshots/print | Quadratic pixel cost as N grows; label-thrash above ~50 items; impossible at distance in 3D |
| **Hover-only** | WS-03 tooltips (every BI tool), WS-09 node-flow port labels at low zoom, WS-04 edge labels in Vertex | Clean default; tooltips can carry rich info ("Viz-in-Tooltip") | Memory burden; doesn't work under stress; fails for non-pointer input (gaze, voice) |
| **Distance-thinned (per-class thresholds)** | WS-08 sci-viz (PyMOL atom/residue/chain), WS-05 PKM (Obsidian Graph), WS-10 games (Eve brackets, WoW nameplates) | Scales to thousands; user always sees the right granularity for current zoom | Requires meaningful class taxonomy; thresholds are hand-tuned per class |
| **Billboard + depth-fade** | WS-01 academic (Marriott Ch. 5), WS-02 vendor recommendations, WS-08 ChimeraX/Mol* | AR-native; text always faces viewer; alpha falls with distance | Needs `troika-three-text` not DOM `<Html>`; layout-aware placement required for overlap |
| **Voice-spoken on focus** | WS-01 IEEE VIS 2025 (Songs et al.), WS-11 Knowledge Navigator | Maximum visual clutter reduction; AR-friendly; accessibility win | Requires TTS plumbing; needs precise gaze target; not for noisy environments |

**Jarvis position:** **Layered policy — per-kind always-on label + distance-thinned via billboard text + voice-spoken on gaze (in voice mode).** Default category-color + shortName always visible (~30 px floor); full label appears within 1-hop neighborhood of focus; gaze hover (or pointer hover) triggers TTS narration in voice mode.

**Why:** No single approach scales across the desktop-and-AR target. WS-12 + WS-03 unanimous on "always-on for what the operator needs continuously"; WS-05 + WS-10 unanimous on "distance-thinned for the periphery"; WS-01 explicitly anticipates voice as the clutter-killer in AR. The composite is supported by ≥6 WS.

**Phase implication:** **Now** for billboarding + depth-fade (DOM-to-Text migration is on the AR-bridge critical path per AR-readiness inventory). **Next** for per-kind thinning thresholds. **Later** for voice-spoken on gaze (requires WebXR + Listening agent integration).

---

## TR2. Camera: orbit vs fly vs walk vs teleport vs stationary-multi-slot

| Approach | Used by | Pros | Cons |
|---|---|---|---|
| **Orbit-around-pivot (desktop default)** | WS-08 sci-viz (universal), WS-10 Blender, WS-06 canvas tools (2D version), WS-04 graph editors, Jarvis today | God-mode exploration; motion parallax = strong depth cue (Ware); cheap to implement | Doesn't translate to AR (user is the camera); pivot-around-origin causes "camera feels wrong" complaints if not bound to focus |
| **Fly (6DoF)** | WS-08 OpenSpace, immersive-analytics demos | Total freedom; great for spatially-grounded data | WS-01 + WS-12 + WS-10 all flag as nausea-inducing within 2 min; "consistently report nausea + lost orientation" |
| **Walk (gravity)** | WS-10 Alyx, MSFS-VR | Body-natural; vestibular agreement | Walking with controller causes vection-discomfort in ~30% within minutes (WS-01); not suited to abstract data |
| **Teleport (jump to anchor)** | WS-02 Meta locomotion default, WS-01 academic baseline | Lowest comfort cost; preserves memory better than fly | Disrupts spatial continuity; requires named anchors |
| **Stationary multi-slot (Console)** | WS-12 every Tier-A operations domain, WS-02 visionOS Personal Office | Zero cybersickness; matches glance-based scan; muscle memory across sessions | No exploration; rigid layout; doesn't help with discovery |
| **Focus-pivot (data moves, camera doesn't)** | WS-05 TheBrain plex (canonical) | Camera never drifts; "where am I?" anxiety eliminated; AR-translatable | Multi-select breaks the single-focus metaphor; no semantic position |

**Jarvis position:** **Two modes — orbit-around-focused-selection for canvas/exploration mode (Now), and stationary-horseshoe for Console mode (Next).** Bind orbit pivot to the current selection centroid (per WS-08 ChimeraX `cofr`), with smooth damping. Never ship fly/walk for the abstract canvas. Teleport via bookmark-jump with 600ms ease.

**Why:** WS-12 unanimous against fly in operations; WS-08 + WS-10 unanimous on pivot-bound orbit for exploration; WS-05 (TheBrain) is the only category exception that scaled and it works because the layout pivots, not the camera. Console mode (T12) requires stationary by definition. Per-mode camera abstraction (`CameraController` interface) is on the AR-bridge critical path.

**Phase implication:** **Now** — bind orbit pivot to selection (`renderer/src/scene/Canvas.tsx`, small change). **Next** — `CameraController` interface + stationary mode for Console. **Later** — XR head-camera implementation.

---

## TR3. Anchoring (AR): world vs desk vs head vs hand vs shared

| Approach | Used by | Pros | Cons |
|---|---|---|---|
| **World-anchored (room)** | WS-02 vendor unanimous default, WS-12 every operations domain, WS-11 Dynamicland | Spatial memory works; peripheral motion-detection works; ≥3-sec content lives here | Requires SLAM accuracy; doesn't follow user across rooms |
| **Desk-anchored (horizontal surface)** | WS-02 Apple RoomPlane / ARKit + Meta scene-understanding, WS-11 Bush's Memex (implicit) | Natural for productivity work; user stays seated; reliable surface tracking | Loses "spatial computing" affordance vs world |
| **Body-anchored (waist/torso)** | WS-02 Microsoft "body-locked", Magic Leap body-relative | Persists across rooms; lazy-follow eliminates head-lock sickness | Subtle threshold tuning per content type; visually less stable than world |
| **Head-anchored (HUD)** | WS-02 *explicitly forbidden* by MS + warned-against by Apple + discouraged by Meta + ML | Always in front of user; classic HUD pattern | Vergence-accommodation conflict; HUD-tunnelling; breaks peripheral motion detection; documented anti-pattern (WS-12) |
| **Hand-anchored (palm/wrist)** | WS-02 MS Hand Menu (canonical, 1×3 layout), WS-10 Alyx wrist gauntlets | Always available; zero spatial cost; proprioception removes targeting cost | Cap at 3 buttons; hand jitter; not for sustained reading |
| **Shared (multi-user)** | WS-02 Azure Spatial Anchors / SharePlay / Horizon Workrooms, WS-01 Cordeil 2017 | Co-located collaboration; team consensus surface | Needs persistent anchor service; not for solo use |

**Jarvis position:** **Per-artifact `anchor` field with values `world | desk | body | hand | head | shared`. Default `world` for data; `hand` for transient controls (palette menu); `head` only for ≤3-second status (toast); `body` for the agent-narration/HUD bar.** Refuse to render `head` anchor for any content with TTL >3 s; warn in dev mode.

**Why:** ≥4 WS unanimous on the preference order (world > body > hand > head). The `head` ban is the single most-cited vendor recommendation across WS-02. Even desktop-only Jarvis should encode the anchor abstraction now because the AR pivot will require it (per AR-readiness inventory).

**Phase implication:** **Now** — add `anchor` field to `world-state.ts`, default `world`. **Next** — wire Layout-agent prompts to consider anchor in placement. **Later** — XR session honors anchor.

---

## TR4. Edge types: few hard-coded vs typed-registry vs untyped

| Approach | Used by | Pros | Cons |
|---|---|---|---|
| **Few hard-coded (4-5)** | Jarvis today (`derives`/`references`/`contradicts`/`groups-with`), WS-05 most PKM tools (1: wiki-link), WS-09 ComfyUI initial design | Simple to ship; LLM can memorize | Ceiling: real domains exceed 5 link semantics quickly; can't extend without code change |
| **Typed registry (schema-defined)** | WS-04 Palantir Link Types (canonical), WS-05 Tana / Capacities / Kumu, WS-09 Maya/Houdini/Unreal port type system | LLM can introspect schema; new types added without code; cross-type queries work | Up-front schema design cost; users must learn types |
| **Untyped (free-form labels)** | WS-06 canvas-tool arrows (Excalidraw, tldraw default), WS-05 TheBrain "jump" links | Zero friction; user expression is rich | No algebra; can't query "all contradicts edges"; LLM hallucination prone |
| **Typed with intermediate-edge collapse** | WS-04 Vertex `intermediateEdges` | Aggregates high-cardinality chains; keeps cardinality visible | Requires the intermediate type to be semantically subordinate |

**Jarvis position:** **Promote from hard-coded enum to a typed Link-Type registry.** Schema: `link_type { id, name, srcKind, dstKind, semantics, color, lineStyle, arrowStyle, directionality, intermediateOf? }`. Keep current 4 as seed link-types for backwards compatibility. Add intermediate-edge collapse for high-cardinality `derives` chains.

**Why:** Theme T3 ("typed ontology") is one of the strongest convergent findings (≥6 WS). WS-04's Palantir model is the most fully developed industry implementation. The 4-kind enum is already painful for Layout agent ("which edge kind?" prompting). Doing this Now is cheaper than later because every downstream feature (Cross-highlight, brushing, agent reasoning) reads from the edge type.

**Phase implication:** **Now** — schema migration (`electron/main/db/migrations.ts`, `world-state.ts`). **Next** — Layout-agent prompts use the registry. **Later** — Workshop-style typed-link editor UI.

---

## TR5. Multi-view linking default: off vs on vs explicit-only

| Approach | Used by | Pros | Cons |
|---|---|---|---|
| **On by default (auto cross-filter+highlight)** | WS-03 Power BI (every visual filters every other), WS-10 Eve overview ↔ in-space brackets | Zero-config interactivity; relationships visible without authoring | Surprising at first; hard to undo without explicit reset; cycles thrash rendering |
| **Off by default (must wire)** | WS-03 Tableau Actions, Looker `listen:` parameter, Grafana variables, Superset native filters | No surprises; deterministic; author has full control | Most dashboards never wire it; the value is hidden |
| **Explicit-on-hover-only** | WS-05 PKM editor-graph-backlinks triple (Obsidian, Logseq), WS-04 Vertex hover-reveal | Discoverable without commitment; cheap | Doesn't scale beyond 3 views |
| **Drill-through with auto-back stack** | WS-03 Power BI drill-through (canonical), WS-04 Foundry Workshop → Object Explorer | Detail context preserved; "back" always works | Each destination must be authored |
| **Brushing (range-select filters all)** | WS-08 every CMV system, WS-03 Tableau quantitative filters | Most powerful for numeric ranges; matches BI scientific tradition | Requires numeric encoding; rare in current canvas tools |

**Jarvis position:** **Linked highlighting on by default (hover-driven), brushing on by default for numeric fields, cross-filter opt-in per query.** Hover an artifact → dim non-neighbors via 1-hop edge query. Inspector + scene + mini-map share the selection set. When `kind: 'panel'` chart-tiles land, brushing is the default linking mode.

**Why:** Theme T6 (linked highlighting) shows BI has industrialized this and PKM/agent-tools haven't. Theme T11 (filter vs selection) says highlight is cheap and survives navigation; full cross-filter is a heavier commitment and should be opt-in. The drill-through pattern with back-stack is the right model for "open Inspector" → "return to scene."

**Phase implication:** **Now** — hover dimming, Inspector ↔ scene sync (small UX win). **Next** — extend Bookmarks to capture filter state. **Later** — brushing for chart panels.

---

## TR6. Reasoning trace: linear list vs tree vs DAG vs spatial-3D

| Approach | Used by | Pros | Cons |
|---|---|---|---|
| **Linear list (collapsed block)** | WS-07 ChatGPT o3, Claude chat, Claude Code TUI; Jarvis ActivityPanel today | Familiar; works for chat-shaped reasoning; cheap | Loses parallelism, branches, retries |
| **Hierarchical trace tree** | WS-07 LangSmith / Langfuse / Phoenix / Helicone / Weave | Matches call-stack mental model; complete trace preserved | Visually degrades past ~50 spans / depth >6; post-hoc, not live-first |
| **Plan-then-execute stepper** | WS-07 Copilot Workspace / Devin Planner / Replit Agent | Surfaces structured plan; user can edit before commit | Bad plans are worse than no plan |
| **2D node-graph DAG (authored + runtime)** | WS-07 ComfyUI / LangFlow / AutoGen Studio, WS-09 every VFX node tool, WS-08 every sci-viz pipeline | Position = meaning; cacheable; introspectable | Pre-authored only — no tool ships agent-constructed graphs at runtime |
| **Tiled multi-pane (watch the agent)** | WS-07 Cursor Agents Window, Devin, Bolt/v0/Lovable | Concrete; user sees output as it appears | No global attention beam; reasoning implicit in artifacts |
| **3D spatial (Z = abstraction/time/agent)** | None (gap noted across WS-07, WS-11, WS-08) | Branches/retries first-class; per-agent depth-layer separation; ambient | No precedent — design risk; LOD problem |

**Jarvis position:** **Hybrid — keep ActivityPanel as scrollable linear-list for desktop affordance (Now), add a 3D reasoning-thread overlay in the scene (Next), with per-agent Z-layers (Later).** The thread is a volumetric tube traced from agent-origin through tool-call plates to result; branches fork; retries dim; agent identity = depth layer.

**Why:** Theme T4 is the single biggest defensible differentiation — "no tool ships a 3D reasoning surface" is the literal quote from WS-07. WS-11 anticipated it; WS-08 has the techniques. Keep the linear list as a fallback to avoid betting the product on the novel idiom. **This is the highest-uncertainty Jarvis decision; ship the prototype early.**

**Phase implication:** **Now** — keep ActivityPanel; tag agent_id per row. **Next** — in-scene `<ReasoningThread>` primitive (R3F MeshLine); per-agent Z-layer assignment. **Later** — branch-aware trace, time-scrubber, voice scrubber.

---

## TR7. Selection at scale: lasso vs filter vs search vs typed-set

| Approach | Used by | Pros | Cons |
|---|---|---|---|
| **Lasso / marquee** | WS-06 every canvas tool, WS-04 Object Explorer chart selection, WS-10 RTS games | Intuitive; immediate; visual | Doesn't survive re-layout; fails above ~100 items |
| **Filter widget (predicate over attributes)** | WS-03 every BI slicer, WS-04 Foundry filter panel, WS-05 Obsidian Graph filters | Survives layout changes; LLM-authorable | Requires authored filter UI |
| **Search-driven (text query)** | WS-04 Bloom / Object Explorer canonical entry, WS-05 Neo4j Bloom NL-query, WS-08 PyMOL command line | Scales infinitely; text is universal | Returns may be unexpected; no visual cue to "saved" search |
| **Typed-set / saved exploration** | WS-04 Foundry Saved Exploration (canonical), WS-05 Tana supertag query, WS-08 PyMOL named selection, WS-10 SC2 control groups | Persistent across sessions; LLM can re-reference; team-shareable | Requires schema; selection must be a *query*, not an *ID list*, to survive churn |
| **Algebraic predicate language** | WS-08 PyMOL `select chain A and (resi 125-200) and (not name CA)`, WS-05 Bloom query | Most powerful; LLM-friendly; composable | Requires attribute schema and learning curve |

**Jarvis position:** **Layered — lasso for ≤100 items, algebraic predicate language as the primary scaling answer, saved selections as queries (not ID lists).** PyMOL-style: `kind=note and tag=auth and recency<7d`; named persistent sets; Ctrl+1..9 saves the current selection (separate from Shift+1..9 camera bookmarks per WS-10).

**Why:** Theme T10 (algebraic / named selections) — ≥5 WS converge on this once N grows. Theme T3 (typed ontology) provides the substrate. The lasso is the muscle-memory entry point but must not be the only scaling path.

**Phase implication:** **Now** — saved selections as predicates (data model). **Next** — Ctrl+1..9 keyboard binding; PyMOL-style algebra exposed to Layout agent as a tool. **Later** — full predicate-calculus expressivity.

---

## TR8. Ontology: free-form tags vs typed entities vs no ontology

| Approach | Used by | Pros | Cons |
|---|---|---|---|
| **No ontology (everything is a plate)** | Jarvis early; WS-06 Freeform/Scapple; raw 3D scene-graphs | Zero friction; total flexibility | LLM can't reliably operate; no algebra; no view-per-type |
| **Free-form tags (flat namespace)** | WS-05 Obsidian tags, WS-06 sticky color | Cheap; user-driven vocabulary | Tag-soup grows quickly; no schema; no bulk operations |
| **Typed entities (supertags / object types)** | WS-04 Palantir Object Types (canonical), WS-05 Tana / Capacities / Kumu, WS-09 Maya/Houdini node families | Schema enables LLM steerability; per-type views; bulk ops | Upfront curation cost; fights capture-now-organize-later |
| **Polymorphic interfaces** | WS-04 Foundry Interface (Cited = doc \| note \| code) | Cross-type queries work; abstraction without duplication | Optional / advanced; defer |

**Jarvis position:** **Typed-entity registry with seed types from current 7 kinds (`doc | note | code | log | image | link | cluster`); add new kinds (`chart-panel`, `flow-panel`, `agent-aura`, `process-node`) as additions, not enum churn; defer polymorphic Interfaces to a later phase.**

**Why:** Theme T3 (typed ontology beats free-form tags) is unanimous. The current 7-kind enum is already the start of this; promoting to a registry costs little and unblocks Palantir-style views (Workshop, Object Explorer panel). Free-form tags can coexist as a *property* on typed entities — best of both.

**Phase implication:** **Now** — promote enum → registry table (`electron/main/db/migrations.ts`). **Next** — new kinds for panels and agent-aura. **Later** — Interfaces, computed properties.

---

## TR9. Layout algorithm: LLM-driven vs heuristic force-directed vs hierarchical vs grid vs slot

| Approach | Used by | Pros | Cons |
|---|---|---|---|
| **LLM-driven** | Jarvis today (`apply_layout_plan`), WS-07 emerging in agent tools | Semantic positioning; user-steerable in natural language; explainable | Token cost; latency; non-determinism; spatial-reasoning limits in LLMs (WS-01) |
| **Force-directed (Yifan-Hu / FA2)** | WS-05 PKM (Obsidian, Roam, Logseq), WS-09 most graph editors fallback | Cheap; works at any scale | Positions reflect physics, not meaning; "hairball" failure mode (WS-05) |
| **Hierarchical (dagre / Sugiyama / ELK)** | WS-04 dbt / Dagster / Pipeline Builder, WS-09 every DCC node tool, WS-08 sci-viz pipelines | Predictable; respects upstream-left convention | Bad fit for non-DAG data; assumes a root |
| **Grid / responsive container** | WS-03 every BI tool (Tableau containers, Grafana rows, Looker grid) | Survives resize; muscle-memory friendly | Rigid; doesn't compose with free-placement |
| **Fixed slot horseshoe** | WS-12 Bloomberg, cockpit, control rooms, WS-02 visionOS Personal Office | Maximum muscle memory; supports 5-minute scan; AR-native | No discovery; rigid by design |
| **Louvain community + FA2** | WS-05 InfraNodus (canonical), WS-05 Graph Analysis plugin | Best mitigation for hairball; ~10× nodes vs naive | Cluster boundaries are physics artifacts the user over-trusts |

**Jarvis position:** **LLM-driven as primary (already shipping), with mode-specific constraints: canvas mode uses free placement + Louvain-community awareness (Next), Console mode uses fixed slot horseshoe (Next), force-directed as fallback only when LLM unavailable.** Layout agent must justify "is this data inherently 3D?" per Munzner (WS-01).

**Why:** LLM-driven layout is what makes Jarvis novel; the surveyed tools that ship spatial layout all have it as the bottleneck of their UX (WS-05 hairballs, WS-09 manual placement). Combining LLM-driven with mode constraints (canvas free, Console slot) gives flexibility where it earns its keep and structure where T1 (stability) demands it.

**Phase implication:** **Now** — current `apply_layout_plan`. **Next** — Louvain community detection feeding LLM context; Console-mode slot constraints. **Later** — LLM-driven viewspec generation (NL-to-layout-spec).

---

## TR10. Multi-user: single-user vs realtime-CRDT vs async-snapshot

| Approach | Used by | Pros | Cons |
|---|---|---|---|
| **Single-user file-based** | WS-08 most sci-viz (.vtk/.pml), WS-05 Obsidian local files, Jarvis today (fs-sync), WS-09 Houdini/Nuke | Simplest; offline-first; user data sovereignty | No collaboration; sharing is "send the file" |
| **Realtime CRDT (Yjs et al.)** | WS-06 tldraw / Liveblocks (canonical), WS-04 Hex / Deepnote, WS-09 (rare) | Concurrent edits compose; presence/cursor primitives | Adds infrastructure; CRDT merge semantics not always intuitive |
| **Custom OT-flavoured** | WS-06 Figma (canonical) | Server-authoritative; optimized for nested trees | Heavyweight to build; vendor-coupled |
| **Async-snapshot (file/state share)** | WS-03 Power BI/Tableau cloud, WS-05 Heptabase share-link, WS-04 Foundry "Save and share a graph" | Solid mental model; works at any scale | Real-time editing not possible |
| **Layered (USD-style, each contributor a layer)** | WS-08 Houdini Solaris USD | Non-destructive; per-agent provenance; multi-user-friendly | Composition rules confuse newcomers |
| **Co-located shared anchor (AR)** | WS-02 Azure Spatial Anchors / Horizon Workrooms / SharePlay, WS-01 SUI 2024 "Where to Draw the Line" | Same hologram in same physical location; great for team review | Co-located only; needs anchor service |

**Jarvis position:** **Single-user file-based now (fs-sync JSON, no change); design the data model to be CRDT-grafable later (atomic artifacts, addressable spans, versioned edits); USD-style layered persistence per-agent for the multi-agent case (Later).**

**Why:** Multi-user is not a current Jarvis concern. But Theme T8 (anchoring) plus Theme T17 (graph-is-workspace) imply that the *future* multi-user case will be co-located AR — and the right data substrate (atomic, addressable, layered) needs to be in place before CRDT-grafting becomes feasible. WS-12 + WS-11 both warn that "design the data model so multi-user grafts on cleanly" is much cheaper than retrofitting.

**Phase implication:** **Now** — keep single-user; ensure artifacts/edges have stable IDs and edit-event log. **Next** — agent-as-layer in WorldState (each agent's contributions tagged). **Later** — CRDT or shared anchors for true multi-user.

---

## TR11. Programmability: scriptable vs config-only vs GUI-only

| Approach | Used by | Pros | Cons |
|---|---|---|---|
| **Scriptable (Python/JS first-class)** | WS-09 Houdini (HOM), WS-08 ParaView (Python pipeline), WS-03 Looker LookML (git-versioned), WS-09 Blender geometry-nodes via Python | Expert ceiling unlimited; LLM-authorable; version-controllable | Steep learning curve; novice escape gap |
| **Declarative config (JSON/YAML)** | WS-08 Vega-Lite, WS-05 JSON Canvas, WS-07 ComfyUI workflows, WS-04 Foundry Saved Exploration | Schema-validatable; LLM-friendly; cacheable; portable | Bounded to grammar |
| **GUI-only** | WS-06 most consumer canvas tools, WS-05 most PKM, WS-03 Power BI Service-only | Lowest learning curve | Ceiling at GUI primitives; no automation; not LLM-authorable |
| **Hybrid (GUI + scriptable escape hatch)** | WS-09 Houdini (GUI for shape, Python for edge cases), WS-08 Vega-Lite + Vega imperative, WS-03 dbt + DAG UI | Best of both; gradually-typed | Two skill axes for users |

**Jarvis position:** **Declarative JSON specs as the LLM-driver interface (now); imperative R3F under the hood; expose a "spec inspector" (Later) so power users + LLMs can see/edit the declarative form directly.** Mirrors Vega-Lite + Three.js split; or deck.gl + react-map-gl.

**Why:** Theme T16 (declarative grammar beats imperative for LLM-authored visuals) — declarative JSON wins on token cost, cache hit, and schema validation. Jarvis is fundamentally LLM-driven; declarative is the right substrate. The existing `apply_layout_plan` already emits declarative position deltas — correct direction; extend to artifact appearance specs.

**Phase implication:** **Now** — keep current declarative tool surface. **Next** — declarative artifact-appearance spec (Vega-Lite-style encoding object). **Later** — "spec inspector" UI; declarative widget definitions for `kind: 'panel'`.

---

## TR12. State change feedback: snap-transition vs animated transition vs ghost-preview vs morph

| Approach | Used by | Pros | Cons |
|---|---|---|---|
| **Snap-transition (instant)** | WS-09 n8n default reflow, naive React state | Cheapest; deterministic | Change-blindness; user can't tell what moved (WS-01 Heer & Robertson) |
| **Animated transition (semantic-bundled)** | WS-01 Heer & Robertson empirical baseline, WS-06 tldraw camera, WS-05 TheBrain pivot | 1-2s with object-identity preservation = best change-tracking measurably | >2.5s harms recall; per-object identity tracking required |
| **Ghost-preview (faded duplicate at proposed pos)** | WS-07 Copilot Workspace plan, WS-10 Civ unit-move-arrow, Alyx grab-preview | User accepts/rejects before commit; lowest-cost failure | Two-step interaction; only for high-stakes operations |
| **Morph (in-place transformation)** | WS-08 ParaView animation, sci-viz playbacks | Most beautiful for shape changes | Expensive; only worth it for shape changes |
| **Cross-fade** | WS-06 some canvas tools | Cheap and clean for replacement, not movement | Loses identity if both old and new are visible briefly |

**Jarvis position:** **Animated transition at 800-1500ms with per-artifact identity preservation as the default (Now); ghost-preview for any Layout-agent reorganize involving ≥5 artifacts or ≥30% workspace delta (Next).** Easing: smooth in/out, no bounce. Snap only for cheap pointer-driven moves (under user manual control).

**Why:** Theme T7 (animated transitions defeat change-blindness) is one of the strongest empirical findings (WS-01 Heer & Robertson is canonical). Theme T14 (plan-then-execute with ghost-preview) extends this to agent moves where the cost-of-being-wrong is higher. The 800-1500ms range is the WS-01 evidence-based zone.

**Phase implication:** **Now** — confirm `renderer/src/scene/live-transforms.ts` is in the 800-1500ms range with semantic-bundling. **Next** — Layout-agent ghost-preview before commit; user gesture (Enter or voice) to accept.

---

## TR13. LOD policy: viewer-relative (distance) vs data-relative (importance) vs LOD-along-meaning (claim/summary/body)

| Approach | Used by | Pros | Cons |
|---|---|---|---|
| **Viewer-relative (distance fades)** | WS-08 octree/mesh-decimation, WS-10 Eve brackets, WS-06 canvas zoom thresholds | Universal; cheap; perception-grounded (foveal acuity) | Doesn't reflect what's *important* — only what's *near* |
| **Data-relative (importance scoring)** | WS-09 Houdini display-flag, WS-04 Bloom centrality, WS-05 PageRank-driven graph view | Highlights what matters semantically | Importance is hard to compute and explain |
| **LOD-along-meaning (claim/summary/body/linked)** | WS-11 Engelbart NLS outline collapse, WS-11 Matuschak evergreen notes, Bret Victor's Ladder of Abstraction | Same artifact, multiple abstraction depths; user-controlled | Requires structured artifacts (claim vs body vs links) |
| **Aggregation-mark replacement** | WS-08 kepler.gl points → hex bins, WS-05 Cytoscape metanodes | Aggregation is a *different mark*, signals the change | Must telegraph the mark change clearly |

**Jarvis position:** **Combined — viewer-relative distance LOD (3 states: full / simplified / dot) plus LOD-along-meaning per artifact (claim / summary / body / linked toggle chips).** Aggregation-mark for clusters above the visible-count ceiling (T2's ~200): the cluster becomes a single labelled glyph with "+N more" badge.

**Why:** Theme T2 (focus-plus-context, never draw the full graph) is the unanimous finding; Theme T19 (Victor's ladder is now feasible) supports LOD-along-meaning specifically. The combination covers both "what's near" and "what depth" — the two orthogonal questions LOD must answer.

**Phase implication:** **Now** — viewer-relative LOD with 3 states (small file change in `renderer/src/scene/Artifact.tsx`). **Next** — LOD-along-meaning chips on Inspector (claim / summary / body / linked). **Later** — aggregation-mark for clusters in canvas mode.

---

## TR14. Process visibility: hidden vs summarized vs full tree vs live trail

| Approach | Used by | Pros | Cons |
|---|---|---|---|
| **Hidden (just show result)** | WS-03 traditional BI, WS-12 control rooms (process is verbal voice loop), consumer chat | Cleanest result-focused UI | Black-box; no audit; no debugging; coordination failures |
| **Summarized ("Thinking for Ns")** | WS-07 ChatGPT o3, Claude chat pill, Cursor status line | Reassures user without dump | Power users can't audit |
| **Full tree (post-hoc)** | WS-07 LangSmith / Langfuse / Phoenix; Jarvis ActivityPanel today | Complete audit; deep dive available | Doesn't show *while it's happening*; degrades visually past ~50 spans |
| **Always-visible scratch / trail (live)** | WS-09 ComfyUI node-lights-up, WS-11 Dynamicland projected program, WS-08 ParaView pipeline | Process *is* the navigation primitive; no hidden state | Real estate cost; "where do I look?" |
| **Generate-then-preview** | WS-07 Bolt/v0/Lovable/Artifacts, WS-06 tldraw Make Real | Tight observe-modify loop | Needs an obvious render target |

**Jarvis position:** **Multi-channel — always-visible status-line/HUD for what each agent is currently doing (1-line summary); on-demand full tree in ActivityPanel (existing); in-scene reasoning-thread overlay (per TR6) as the spatial alternative; generate-then-preview ghosts for Layout agent (per TR12).**

**Why:** Theme T13 (process is a DAG; result is the viewport — keep both visible) demands process visibility; Theme T18 (voice as orthogonal channel) demands the summary be available without looking. Theme T15 (branch/retry as systemic blind spot) demands the full tree be available for deep inspection. The combination is canonical across the WS-07 catalog.

**Phase implication:** **Now** — keep ActivityPanel; add agent_id tagging. **Next** — always-visible status-line per agent (body-anchored bar in AR; bottom bar on desktop). **Later** — in-scene reasoning-thread overlay (TR6).

---

## TR15. Selection commit modality: click vs gaze-pinch vs voice vs marking-menu

| Approach | Used by | Pros | Cons |
|---|---|---|---|
| **Pointer click (mouse/touch)** | Desktop everywhere, WS-06 every canvas tool | Universal; precise; muscle-memory | Doesn't translate to AR |
| **Gaze-pinch (indirect)** | WS-02 Apple visionOS (canonical), WS-02 Microsoft hands-free | High-precision targeting; works at any distance; less arm fatigue | Requires gaze tracking; needs 60+ pt targets and clean spacing |
| **Direct touch** | WS-02 Apple visionOS near content, WS-02 MS direct-manipulation, WS-10 Alyx grab | Most embodied; great affordance | Reach fatigue; only for near content |
| **Hand ray (far pointer)** | WS-02 Meta controllers, WS-02 MS far-pointer | Works at distance; familiar from VR games | Less precise than gaze; arm fatigue |
| **Voice ("select this", "focus the green cluster")** | WS-11 Knowledge Navigator, WS-02 Apple Siri integration | Hands-free; descriptive | Requires NLU; noisy environments |
| **Marking menu (radial gesture)** | WS-10 Maya/3ds Max/Houdini canonical, WS-09 some node tools | Self-revealing for novices; muscle-memory for experts; AR-translatable as pinch-radial | Cap at 8 per level; 2 levels max |

**Jarvis position:** **Per-mode primary, pick-one-don't-mix (per WS-02 Microsoft): desktop = pointer + keyboard; AR = gaze-pinch with hand-ray fallback for far content; voice = orthogonal augmentation in both modes; marking menu (right-click + pinch-hold) as the expert escalation.** Never combine hand-ray + gaze-cursor simultaneously.

**Why:** Theme T8 (anchoring per-modality) + WS-02 unanimous "do not mix interaction models." Marking menus (WS-10 strong) bridge desktop and AR cleanly. Voice (Theme T18) is the orthogonal channel.

**Phase implication:** **Now** — keep mouse + keyboard. **Next** — marking menu via right-click + Spacebar-hold (per WS-10 Implication). **Later** — gaze-pinch + hand-ray for AR sessions; voice command grammar.

---

## TR16. New artifact placement: floating-free vs constrained-to-cluster vs auto-grid vs LLM-driven

| Approach | Used by | Pros | Cons |
|---|---|---|---|
| **Floating-free (drop anywhere)** | WS-06 Freeform/Scapple, Miro/Mural default | Maximum flexibility | Cargo-cult sprawl (WS-12); no semantic structure |
| **Constrained to active cluster** | WS-04 Foundry Pipeline Builder folders, WS-05 Tana inside a tag | Keeps semantic coherence | Forces user to pre-commit to a cluster |
| **Auto-grid / responsive container** | WS-03 BI tile grids, WS-06 Heptabase tidy-up | Predictable; AR-friendly | Rigid |
| **LLM-driven (Layout-agent decides)** | Jarvis today, WS-07 emerging | Semantic positioning; explainable | Token cost; non-determinism |
| **Slot-fill (Console horseshoe)** | WS-12 Bloomberg / cockpit / NOC | Maximum muscle memory | No discovery; only for operations mode |

**Jarvis position:** **Mode-dependent — Canvas mode: LLM-driven placement with cluster awareness (Now); Console mode: slot-fill with attention rank constraints (Next); manual drop respects nearest cluster magnetism (Now).** Never silent floating-free in operations.

**Why:** Theme T1 (stability) demands constraints; Theme T12 (operator's mental model is anchored to fixed slots) demands slot-fill in Console mode. The LLM-driven approach earns its keep because it can incorporate semantic context the user hasn't expressed (T3).

**Phase implication:** **Now** — cluster-magnetism in current LLM placement. **Next** — Console mode slot-fill.

---

## TR17. Persistence format: proprietary binary vs JSON vs git-text vs CRDT-log

| Approach | Used by | Pros | Cons |
|---|---|---|---|
| **Proprietary binary** | WS-09 Houdini `.hip`, Unreal `.uasset`, Photoshop `.psd` | Fast; full-fidelity | Unmergeable; vendor-locked; opaque |
| **JSON file** | Jarvis today (fs-sync), WS-05 JSON Canvas, WS-07 ComfyUI workflow, WS-04 Foundry exports | Inspectable; small; portable; LLM-readable | No native concurrency support |
| **Git-versioned text** | WS-03 Looker LookML, WS-04 Pipeline Builder git-mode, WS-09 dbt models | Versioning + diff + review for free | Authoring through code, not GUI |
| **CRDT operations log** | WS-06 tldraw / Liveblocks, WS-09 some realtime tools | Concurrent edits compose; offline-first | Conflict UX; tooling immature |
| **Append-only event log** | WS-04 OpenLineage events, WS-08 USD layer composition | Audit trail intrinsic; replayable | Read amplification; needs snapshotting |

**Jarvis position:** **Keep fs-sync JSON as the canonical format (Now); add an append-only event log alongside for agent actions (Next); leave room for CRDT-grafting later by ensuring all writes are diffable atoms.** JSON Canvas import shim for Obsidian compatibility (per WS-05 Implication).

**Why:** Theme T16 (declarative grammar) — JSON is the LLM-friendly format. Theme T15 (branch/retry first-class) — an event log enables replay. WS-08 USD-style layered composition is the Later target for multi-agent, but the event log can be retrofit-friendly.

**Phase implication:** **Now** — fs-sync JSON unchanged; JSON Canvas import shim (~1 day per WS-05). **Next** — append-only event log for agent actions. **Later** — CRDT layer or USD-style layering.

---

## TR18. Edge geometry / connector style

| Approach | Used by | Pros | Cons |
|---|---|---|---|
| **Bezier curve (default)** | WS-09 Houdini/Substance/Unreal/ComfyUI/Nuke/React Flow default, Jarvis today | Organic; tolerates dense layouts; visually pleasing | Crossings ambiguous |
| **Orthogonal / step lines** | WS-09 Maya alternate, n8n, Node-RED, React Flow `step`/`smoothstep` | Schematic-clear; easier to follow at extreme density | Less organic; right angles aesthetically rigid |
| **Straight line** | WS-09 rare (debug only), WS-04 some Vertex layouts | Cheapest | Crossings everywhere |
| **Tube / ribbon (volumetric)** | WS-08 sci-viz streamlines, hypothetical for reasoning-thread (TR6) | First-class in 3D; can encode flow/magnitude/type | Cost; only for 3D contexts |
| **Endpoint binding with fixed-point** | WS-06 tldraw + Excalidraw canonical (`fixedPoint [u,v]`) | Edges track artifact geometry; "stays connected to the right corner" | Schema migration cost |

**Jarvis position:** **Bezier curve with endpoint-binding (`{targetId, fixedPoint}` per WS-06) as the canvas-mode default (Now); reasoning-thread overlay uses tubes/ribbons in 3D (Later). Type-color the bezier per Link-Type registry (TR4).** Recolor red on incompatible drop target (WS-09 provisional-wire pattern).

**Why:** Bezier is the universal cross-tool default (WS-09 unanimous); endpoint-binding is the WS-06 canonical move that prevents "edges floating in space when artifact resizes." Type-coloring per Link-Type ties this to T3 + T5. Volumetric tubes are reserved for the reasoning trace (TR6) where they earn the cost.

**Phase implication:** **Now** — keep bezier; add type-color per kind. **Next** — endpoint-binding schema migration; provisional-wire red-on-incompatible. **Later** — volumetric tubes for reasoning thread.

---

## Tradeoff non-default positions summary

For audit, the tradeoffs where Jarvis takes a position that differs from the dominant industry default:

1. **TR4 (Edges)** — Promote to typed-registry now, rather than living with the 4-kind enum forever (industry default for canvas tools is "untyped or 1-kind"; Jarvis joins Palantir/Tana camp).
2. **TR6 (Reasoning trace)** — Add 3D spatial overlay (no tool does this; pure differentiation bet).
3. **TR9 (Layout algorithm)** — LLM-driven as primary (industry default is force-directed or manual; Jarvis is unusual).
4. **TR2 (Camera)** — Pivot bound to selection by default (industry default in 3D editors is pivot-around-origin until user changes it; ChimeraX has it right).
5. **TR12 (State change)** — Ghost-preview for ≥5-artifact moves (industry default is commit-then-undo; Jarvis aligns with Copilot Workspace + Bret Victor lineage).
6. **TR16 (Placement)** — Cluster-magnetism on manual drop (canvas tools default to true floating-free).

These six are where Phase 4 reviewers will reasonably push back — pre-loading the rationale here saves cycles in those reviews.

---

## Cross-references

- Themes: `themes.md`
- Patterns catalog: `patterns.md`
- Open problems: `open-problems.md`
- AR-readiness baseline: `../ar-readiness-inventory.md`
- Source briefs: `../01-academic-foundations.md` through `../12-multi-dashboard-spatial.md`
