# WS-01 — Academic Foundations & Perception

**Scope:** Theoretical and empirical foundations from information-visualization, perception science, HCI, and immersive-analytics literature. Covers the marks/channels and what-why-how design framework, perceptual grounding of 3D vs 2D info-viz, preattentive processing, spatial cognition (method of loci), small-multiples theory, the Shneiderman/CMV interaction baseline, animated transitions, and 2018-2025 immersive- and situated-analytics findings. Excludes vendor HIGs (WS-02), BI dashboards (WS-03), and tool-specific reviews. This brief is the *theory floor* that every later workstream stands on.
**Date:** 2026-05-23
**Sources consulted:** 14 primary + 9 supporting

---

## Tools / sources surveyed

- **Munzner, *Visualization Analysis and Design*** (book, 2014, CRC Press) [1]. Defines the what-why-how design framework, marks/channels ranking, faceting (small-multiples / juxtaposed / superimposed views), the "no unjustified 3D" rule of thumb, the nested model for evaluation. A 2026 lecture revision of Chapter 5 (Marks & Channels) [2] confirms the ranking is still considered current orthodoxy.
- **Munzner, "A Nested Model for Visualization Design and Validation"** (paper, IEEE TVCG 2009) [3]. Four-layer model: domain → data abstraction → visual encoding/interaction → algorithm; defines distinct threats to validity at each level. Frequently cited justification for *why* 3D is rarely the right encoding layer choice.
- **Ware, *Information Visualization: Perception for Design* (4th ed.)** (book, Morgan Kaufmann 2020) [4]. Most-cited perception text. Chapter on Space Perception covers depth-cue theory, cue combination, motion in depth, judging relative positions, tracing data paths in 3D graphs. Chapter on preattentive processing grounds Healey & Enns.
- **Card, Mackinlay, Shneiderman, *Readings in Information Visualization: Using Vision to Think*** (book, Morgan Kaufmann 1999) [5]. Canonical anthology; introduces the "Information Visualization Reference Model" (data → tables → visual structures → views → user) that all modern toolkits implicitly use.
- **Shneiderman, "The Eyes Have It: A Task by Data Type Taxonomy for Information Visualizations"** (paper, VL 1996) [6]. The 1996 mantra *"Overview first, zoom and filter, details-on-demand"*. 8000+ citations; opinion piece with no empirical results but accepted baseline for interaction design.
- **Ens, Bach, Cordeil, Engelke, Serrano et al., "Grand Challenges in Immersive Analytics"** (paper, CHI 2021) [7]. 17 research challenges synthesised by 24 international experts from a CHI 2020 workshop. The agenda piece every immersive-analytics paper since 2021 cites.
- **Marriott, Schreiber, Dwyer, Klein, Riche, Itoh, Stuerzlinger, Thomas (eds.), *Immersive Analytics*** (book, Springer LNCS 11190, 2018) [8]. 14-chapter foundational text; Ch. 2 ("Time to Reconsider the Value of 3D") and Ch. 8 ("Collaborative Immersive Analytics") are most cited for our purposes [9][10].
- **Healey & Enns, "Attention and Visual Memory in Visualization and Computer Graphics"** (paper, IEEE TVCG 2012) [11]. Definitive survey on preattentive features, visual search, change blindness, and what these mean for designing displays the eye notices automatically.
- **Tufte, *Beautiful Evidence*** (book, Graphics Press 2006) [12]. Small-multiples + sparklines as data-dense, label-light comparison units. Word-sized graphics that read inline.
- **Few, *Now You See It: Simple Visualization Techniques for Quantitative Analysis*** (book, Analytics Press 2009) [13]. Argues forcefully against 3D for quantitative comparison; champions small multiples, sparklines, and bullet graphs. The pragmatic counterpart to Tufte for business analytics.
- **Heer & Robertson, "Animated Transitions in Statistical Data Graphics"** (paper, IEEE TVCG 2007) [14]. Two controlled experiments showing animation between chart-state transitions measurably improves change tracking *if* staged correctly (semantic-bundling, slow-in-slow-out). Foundational evidence for our reorganize animations.
- **Roberts, "State of the Art: Coordinated & Multiple Views in Exploratory Visualization"** (paper, CMV 2007) [15]. Survey of brushing-and-linking, taxonomy of view-coordination patterns.
- **Shin, Cordeil, Drogemuller, Saalfeld, Bach, Smith, Ens, "The Reality of the Situation: A Survey of Situated Analytics"** (paper, IEEE TVCG vol. 30, 2024) [16]. Surveys 47 situated-analytics systems; defines 3D-axis taxonomy: *situating triggers × view situatedness × data depiction*. Most current AR-analytics reference.
- **Friedl-Knirsch et al., "A Systematic Literature Review of User Evaluation in Immersive Analytics"** (paper, Computer Graphics Forum 2024) [17]. Meta-analysis of evaluation methods 2014-2023; documents persistent under-evaluation of long-session and collaborative use.
- **IEEE VIS 2025 Immersive & Ubiquitous Analytics session** (proceedings, ieeevis.org/year/2025) [18]. Recent specifically-cited: Zimmermann & Bruckner on multi-focus probes for network exploration; Vu et al. on hybrid immersive timeline authoring; Song et al. on speech-input patterns in immersive analytics.
- **Krokos, Plaisant, Varshney, "Virtual memory palaces: immersion aids recall"** (paper, Virtual Reality 2019) plus 2022-2024 VR memory-palace replications [19]. Empirical evidence VR method-of-loci yields ~20-30% recall lift vs 2D for non-spatial information.
- **Cordeil et al., "Immersive Collaborative Analysis of Network Connectivity"** (paper, IEEE TVCG 2017) and downstream "Where to Draw the Line" (SUI 2024) [20]. Co-located AR analytics: shared anchor + privacy regions.
- **Ens et al., HeedVision (preprint 2025)** [21]. Multi-user gaze-aware collaborative analytics; attention is *itself* a sharable channel.
- **"Stuck in the Matrix: Probing Spatial Reasoning in LLMs"** (arXiv 2510.20198, 2025) [22] and **Spatial-DISE benchmark** (arXiv 2510.13394, 2025) [23]. Current LLM spatial reasoning is **brittle** — accuracy drops 42-84% as grid size grows; current Claude/GPT models hold rough relations but lose precise coordinates.
- **Cleveland & McGill, "Graphical perception"** (paper, JASA 1984) — the empirical ranking of position > length > angle > area > volume > color-saturation that underlies every Munzner-style channel ordering.

*Deeply analyzed below:* [1], [4], [6], [7], [8/9/10], [11], [14], [16], [22].

---

## Lens pass

### L1 — Spatial primitives

The visualization literature names a small, stable vocabulary that maps almost 1:1 to Jarvis' current artifact/edge/cluster/board kinds. Munzner [1] partitions the *what* into **items** (rows, individual records), **links** (relations between items), **attributes** (columns/properties), **positions** (spatial), and **grids** (sampling structures). The *how* primitives are then **marks** (point, line, area, surface, volume) and **channels** (position, length, angle, area, color, shape, motion). Ware [4] adds the perceptual primitive of **glyph**: a compound mark that uses multiple channels jointly for one item. The Card-Mackinlay-Shneiderman reference model [5] extends with **views** (a configured combination of marks + camera) and the implicit primitive of **pipeline state** (filtered/transformed table behind every view).

For immersive analytics specifically, Marriott et al. [8] add **embodied primitives** — the user's body, gaze, and hands become first-class objects in the scene. Shin et al.'s situated-analytics taxonomy [16] adds **physical referents**: the real-world object a visualization annotates. Ens et al. [7] call this out as Grand Challenge #2 (linking data to physical entities) and #5 (immersive embodiment).

**Patterns:** (a) *Item-link-attribute trinity* — every viz reduces to this, regardless of medium. (b) *Compound glyph as condensed multi-channel mark* — the perceptual answer to "I have 5 dimensions per item". (c) *Embodied primitive* (gaze cone, hand ray, user avatar) is new since 2018 and not yet stable.

### L2 — Data → form mapping

Munzner's [1] central contribution is a **rank-ordered channel table** keyed to data type: for *quantitative* data, use position-on-common-scale → position-on-unaligned-scale → length → angle → area → depth → color-luminance → color-saturation → curvature → volume; for *categorical* data, use spatial-region → color-hue → motion → shape; for *ordinal* data, use a luminance ramp first, position second. Cleveland & McGill's original 1984 experiments are the empirical floor. The forms that fall out: tables, scatterplots, bar/line charts, heatmaps, node-link diagrams, treemaps, matrices, parallel coordinates, small-multiple grids. Ware [4] notes that **3D position is a quantitative channel but suffers a severe perspective-foreshortening penalty**: judging a depth distance is roughly the accuracy of judging area on a plane, much worse than judging length on a common scale.

The most-cited *anti-pattern* in this lens, across [1], [12], [13], and the Wilke open textbook, is **3D bar/pie/line charts**: they take a quantitative channel that should be position-on-common-scale and demote it to volume-with-occlusion. Few [13] gives the classic Excel-3D-pie example as canonical waste.

For agentic systems (Jarvis-specific), no canonical mapping exists yet. The closest is ComfyUI / LangFlow's node-graph convention, which is essentially a graph mark with typed-edge channels. IEEE VIS 2025's Song et al. [18] note "no agreed visual idiom for reasoning trace" and treat it as open.

**Patterns:** (a) *Channel-rank by data type* — position-first for quantitative, hue-first for categorical. (b) *Glyph for compound entities* — encode 3-5 attributes per mark; beyond that, switch to small multiples. (c) *Faceting before encoding-overload* — when you'd be tempted to add a 4th visual channel, split into a 2×N small-multiple grid instead.

### L3 — Camera & navigation

Theory side: Ware [4] argues that for orientation tasks **motion parallax (controlled by user motion) is the most powerful depth cue** — far stronger than stereo, far stronger than shading. This is the perceptual justification for orbit-controls: small head/mouse motion gives huge depth information cheaply. For *navigation* tasks in 3D spaces, fly-through performs worse than teleport-to-target on memory and reorientation (Bowman & McMahan 2007, repeatedly replicated, summarised in [8] Ch. 4). Walking with a hand-controlled ground plane causes vection-driven discomfort within minutes for ~30% of users; teleport with brief fade-to-black is the comfort baseline.

For 2D-like canvases, Shneiderman's mantra [6] is the camera policy: overview → zoom → filter → details-on-demand maps directly to a fixed-axis pan-and-zoom camera. This is what every infinite-canvas tool defaults to.

Immersive-analytics consensus [7][8] is that camera should be **task-tied**: for spatially-grounded data (architectural, medical, geographic), full free 6DoF earns its keep; for abstract analytics, the multi-view fixed camera dominates and movement is just for re-anchoring panels.

**Patterns:** (a) *Motion parallax as the depth cue worth optimising* — even subtle 2-degree orbit dramatically improves shape understanding. (b) *Teleport beats fly for memory* in VR. (c) *Overview-zoom-filter-details as the camera state machine* in abstract spaces.

### L4 — Level of Detail (LOD)

Munzner [1] gives a discipline framing: at every dataset size, ask "is the screen-pixel-to-item ratio < 1 yet?". Below that ratio, *aggregation* (binning, density, hierarchy) is mandatory because the marks would overplot. The classical sequence is: 1-50 items → direct marks; 50-500 → still direct but with explicit faceting; 500-10k → density / hexbin / aggregated tiles; 10k+ → topology-preserving simplification (graph contraction, kd-tree summaries). Few [13] adds the "1000 items × 5 attributes" practical ceiling for direct viewing on a normal monitor.

Ware [4] adds the perception-side rule: **labels follow a square-root density law** — to keep a label visible at distance d, scale font-size with √d *and* enforce non-overlap by greedy culling, not stacking. The Healey & Enns survey [11] backs preattentive thresholds: 10-50 distinct shapes are detectable in parallel; beyond 50 the visual system serialises (linear-time search).

For immersive analytics specifically [8] Ch. 5, depth-LOD ("things further away render simpler") is a perception-grounded win because foveal acuity drops with eccentricity. Ens et al. [7] call out LOD-for-collaborative-views as Grand Challenge #11: when two users look at the same volume from different sides, who gets the detailed render?

**Patterns:** (a) *Pixel-budget rule* — never put two marks in fewer than 4×4 pixels each. (b) *Distance-LOD with √-scaling* for labels. (c) *Aggregation-then-drill* over object-culling, because clusters preserve density information that culling loses.

### L5 — Anchoring (AR/VR-specific)

The 2024 situated-analytics survey [16] is the most current taxonomy. They partition AR analytics by *view situatedness*: **world-anchored** (data fixed to physical referent — e.g. radiation cloud above an object), **viewer-anchored** (panel follows head/HUD), **device-anchored** (handheld tablet AR), **shared-anchored** (multi-user pinned coordinate frame). The strong empirical finding: world-anchoring wins for *spatially-grounded* tasks, viewer-anchoring wins for *always-needed control surfaces*. Mixing them inside one app is the dominant pattern, not the exception.

Marriott et al. [8] Ch. 4 documents that **hand-anchored** UI (palm menu) is the comfort standard for transient controls because the user's proprioception eliminates targeting cost. Cordeil 2017 / SUI 2024 "Where to Draw the Line" [20] establish that **shared anchors plus personal-space partitioning** is the working pattern for co-located collaborative analytics: shared world frame for the data, private viewer-anchored panels for personal annotations.

**Patterns:** (a) *World-anchor data, hand-anchor controls, head-anchor status.* (b) *Shared anchor + private overlay* for collaboration. (c) Switching anchors must be **explicit** (grab handle, voice command) — implicit re-anchoring on head-motion is a documented confusion source [16].

### L6 — Labels & legends

Munzner [1] and Ware [4] both treat labels as a separate-channel placement problem with three knobs: *visibility* (always / hover / focus), *layout* (anchored vs callout-with-leader), and *typography* (size, weight, contrast). The strong empirical finding (Ware [4] Ch. 8) is that **always-on labels under occlusion-aware repositioning** beat both "label everything densely" (label-thrash) and "only on hover" (memory burden). Tufte [12] argues for inline labels within sparklines — "right next to the data, not in a legend".

In immersive analytics [8] Ch. 5, the canonical pattern is **billboarding** (text always faces camera) combined with **depth-fade** (text alpha falls with distance). Songs et al. at IEEE VIS 2025 [18] add a voice-on-focus alternative: gaze a panel for 400ms → label is spoken; reduces visual clutter on dense scenes.

**Patterns:** (a) *Billboard + depth-fade* for in-scene labels. (b) *Voice-on-focus* as a clutter-killing alternative. (c) *Inline labels beat legends* (Tufte) whenever space allows.

### L7 — Selection & group operations

The CMV literature [15] formalises selection as a *set-valued state* shared across views: brushing in one view sets a selection set; linked views update to highlight/filter. Multi-selection operations are: **lasso** (geometric), **type-filter** (predicate over attributes), **search-driven** (text query), **derived** (e.g. "1-hop neighbors of selected"). Munzner [1] Ch. 11 ranks these — predicate-based is the most powerful but requires a query UI; lasso is intuitive but doesn't survive a re-layout.

Saved selections appear in Tableau, Power BI, ParaView, and as "filter chips" in Looker; the visualization-research line treats them as **named subsets** that can be operated on as compound entities. The CMV survey notes this as the bridge to the analytics-by-example paradigm.

For immersive analytics [7], selection is Grand Challenge #6 — there is no agreed-upon multi-select gesture in headset VR yet; cone-cast and "pinch-and-paint" dominate research prototypes but no single winner.

**Patterns:** (a) *Selection as shared cross-view state*. (b) *Named subset* (saved selection) as compound entity. (c) *Predicate selection* is the power-user feature that scales beyond a few-dozen items.

### L8 — Attention flow

Healey & Enns [11] is the foundation: **preattentive features pop out in <200ms regardless of distractor count**. The reliable preattentive channels are hue, luminance, motion, size, orientation, curvature, line endings. Combinations are *not* preattentive — "find the red horizontal" requires serial search, "find the red" or "find the horizontal" do not. This is the perceptual law that should govern every notification design.

Heer & Robertson [14] empirically show **animated transitions** (with semantic-bundling + slow-in-slow-out timing, 1-2 sec) measurably improve change-tracking; uncontrolled instant snaps cause change blindness. Robertson et al. 2008 follow-up shows the effect plateaus past ~2.5s — long animations *worsen* recall.

For ambient awareness, Ens et al. [7] Grand Challenge #9 covers attention guidance in headsets: gentle peripheral motion or color pulses guide gaze without breaking focus; centre-of-vision badges interrupt. The 2025 HeedVision work [21] extends this: in multi-user, a teammate's gaze ray becomes an attention cue too.

**Patterns:** (a) *Preattentive single-channel cues for ambient changes* (color pulse, motion bloom). (b) *Animated transition 1-2s for context-preserving change*. (c) *Peripheral cue → centre interrupt* gradient for priority. *Anti-pattern:* relying on a 2-channel conjunction (red AND blinking) for pop-out — fails preattention.

### L9 — Color system

Munzner [1] separates color into **luminance** (ordered, ~7 perceptual levels), **saturation** (ordered, ~5 levels), and **hue** (categorical, ~7-10 distinguishable colors without text labels). The reliable design rules: one quantitative ramp = single-hue luminance ramp (ColorBrewer "sequential"); diverging = two-hue luminance ramp (e.g. blue-white-red); categorical = ColorBrewer "qualitative" set, cap at 8-10. ColorBrewer also encodes colorblind-safety.

Conflicts arise when one mark must encode multiple scales: Munzner's rule is **one channel per scale**, so combine color (categorical) with luminance (ordered) with size (quantitative) — never overload hue with two meanings. Few [13] reinforces with "color is a precious resource" warnings.

Ware [4] Ch. 4 adds the perceptual quirk: **highly saturated colors carry attentional weight**; reserve them for the call-out, use desaturated tones for background.

**Patterns:** (a) *One scale per channel*. (b) *Luminance for ordered, hue for categorical, saturation for emphasis*. (c) *Colorblind-safe palettes only* (8% male population).

### L10 — Inter-view linking

Roberts' CMV survey [15] catalogues the coordination patterns: **linked highlighting** (selection in one → highlighted in all), **linked navigation** (pan/zoom one → others follow proportionally), **brushing** (drag-select range in one → filter all), **drill-down** (click an aggregate → opens a detail view), **pivot** (click an entity → rebuild all views around it). The default that wins user-studies for novices is **linked highlighting + brushing**, both passive. Pivot is powerful but disorienting if not animated.

Tableau's "filter action" and Power BI's "drill-through" are direct implementations. For immersive analytics, the IEEE VIS 2025 work on multi-focus probes [18] extends CMV into VR: each user can have a personal focus probe; the data view stays shared.

**Patterns:** (a) *Linked highlighting as default, opt-in for filter-linking*. (b) *Animated pivot* to preserve orientation when the view rebuilds around a new entity. (c) *Personal focus probe + shared canvas* for multi-user spatial CMV.

### L11 — Process / reasoning representation

The academic literature treats "showing the process" mainly through three traditions:

1. **Animated transitions** [14] for state-change provenance (where did this datum go between view A and view B?). The transition *is* the explanation.
2. **History trees / branching provenance** (Heer & Mackinlay 2008, Munzner [1] Ch. 13) — a tree of past states, navigable. Implemented in Tableau Story Points, Observable notebooks, Jupyter cells.
3. **Sketchpad / scratch space** — a region where intermediate computations live (Bret Victor lineage; cited but pre-academic).

For LLM-driven systems specifically, the literature is *thin*. IEEE VIS 2025 [18] starts to address natural-language interaction in immersive analytics; no canonical visualization of multi-agent reasoning trace exists in peer-reviewed venues yet. The 2025 spatial-reasoning papers [22][23] show that LLMs themselves struggle with spatial reasoning — implication: the *visualization* of the LLM's reasoning must compensate, not assume LLM-grade spatial competence.

**Patterns:** (a) *Animated transition as inline explanation*. (b) *Provenance tree* for revisitable history. (c) *Scratch space* for in-progress reasoning. *Open:* no canonical visual idiom for multi-agent reasoning trace.

### L12 — Multi-user, sharing, persistence

Marriott et al. [8] Ch. 8 (Collaborative Immersive Analytics) is the canonical reference. The taxonomic axes: *co-located vs distributed*, *synchronous vs asynchronous*, *symmetric vs asymmetric display* (headset+desktop). The 2024 "Where to Draw the Line" SUI paper [20] establishes that **shared world-anchored data + private hand-anchored annotations** is the comfort-preserving pattern for co-located AR analytics. HeedVision 2025 [21] adds **collective attention awareness** (teammate gaze rays).

Persistence is under-treated in the academic literature — most papers assume "the experimental system saves a session blob"; production-grade snapshot/replay only appears in industry talks (Tableau, Foundry — covered in WS-03/WS-04). Friedl-Knirsch 2024 [17] explicitly notes long-session and asynchronous-collaboration evaluation is under-represented in the immersive-analytics literature.

**Patterns:** (a) *Shared data anchor + private overlay*. (b) *Symmetric or asymmetric — both work, choose for context*. (c) *Collective attention as a sharable channel*.

---

## Top patterns extracted

1. **Channel-rank-by-data-type** — Where seen: Munzner [1], Cleveland-McGill 1984. Mechanism: choose visual channel by ranking position > length > angle > area > volume > color-saturation, gated by quantitative/ordered/categorical. Why it works: matches the empirical accuracy of human visual judgements on each channel. Caveat: ranking is for *accuracy*; aesthetic and brand constraints may override.
2. **No-unjustified-3D** — Where seen: Munzner [1], Few [13], Wilke open textbook. Mechanism: use 3D only when data is *inherently* spatial (architecture, molecules, weather) or the third axis is genuinely quantitative; otherwise use 2D with faceting. Why it works: 3D introduces occlusion + perspective foreshortening that cost more accuracy than the extra dimension buys. Caveat: motion-parallax (slight orbit) restores most of the cost — interactive 3D ≠ static 3D.
3. **Overview-zoom-filter-details mantra** — Where seen: Shneiderman [6]; baked into every modern viz tool. Mechanism: state machine where the user always sees an overview first, then narrows. Why it works: matches the human exploration loop. Caveat: pure top-down doesn't fit cases where the user already knows the target and wants direct query.
4. **Coordinated multiple views with linked highlighting** — Where seen: Roberts CMV survey [15], Tableau, Power BI. Mechanism: selection state is shared across all views; brushing in one filters all. Why it works: the visual *cost* of side-by-side small-multiples is low while the analytical *power* of seeing the same selection across encodings is high. Caveat: too many linked views = update storm + cognitive overload (cap at ~6).
5. **Small multiples** — Where seen: Tufte [12], Few [13], baked into every modern BI tool. Mechanism: repeat the same chart design for many partitions; users learn the design once, read all charts fast. Why it works: factors out encoding-cognition cost. Caveat: requires partition-attribute to be *meaningful* and *comparable* across panels.
6. **Preattentive single-channel pop-out** — Where seen: Healey & Enns [11], Ware [4]. Mechanism: use one preattentive channel (hue, motion, luminance, size) for the call-out; <200ms detection regardless of distractor count. Why it works: matches V1 / pre-attentive visual cortex processing. Caveat: conjunctions (two channels combined) break preattention.
7. **Animated transition for state change** — Where seen: Heer & Robertson [14], staged across modern viz toolkits. Mechanism: 1-2s animated tween between states with semantic bundling. Why it works: preserves object identity across the change, defeats change-blindness. Caveat: >2.5s harms recall; instant snaps cause confusion.
8. **Motion parallax as primary depth cue** — Where seen: Ware [4], Marriott [8] Ch. 2. Mechanism: small user/camera motion gives strong shape understanding for 3D structures. Why it works: built-in to mammalian vision; way stronger than stereo. Caveat: only works when user actually moves; passive 3D doesn't earn it.
9. **World-anchor data, hand-anchor controls, head-anchor status** — Where seen: Marriott [8], Shin 2024 [16]. Mechanism: pick anchor by content lifetime — long-lived data goes to the world, transient controls to the hand, status badges to the HUD. Why it works: matches user proprioception + memory affordances. Caveat: anchor switches must be explicit, not automatic.
10. **VR method-of-loci recall lift** — Where seen: Krokos 2019, 2022 VR replications [19], AIP 2024 study. Mechanism: spatial memory + visual richness of 3D scenes anchors abstract information; recall improves ~20-30% over 2D. Why it works: hippocampal place-cell encoding is engaged. Caveat: works for *non-spatial* facts; doesn't help when the underlying task is itself spatial.

---

## Anti-patterns observed

1. **3D bar/pie/line charts in abstract data** — Munzner [1], Few [13]. The third dimension demotes a position-on-common-scale channel to volume-with-occlusion. Loses accuracy, gains nothing.
2. **Label-thrash** — Ware [4]. Always-on labels on every mark with no occlusion-aware placement. Pixel-cost grows quadratically with item count; users tune them out.
3. **Conjunction-cue notifications** — Healey & Enns [11]. "Red AND blinking" assumes pop-out but conjunctions require serial search. Users miss the alert.
4. **Snap-transition state change** — Heer & Robertson [14]. Instant rebuild of a view between two states; change-blindness rules; user can't tell what moved.
5. **Implicit re-anchoring on head motion** — Shin 2024 [16]. Panel quietly migrates from world-anchored to head-anchored when user turns; users lose track of where things are.
6. **Free-fly camera in abstract VR analytics** — Marriott [8]. Users disoriented within 2 minutes; comfort breaks; teleport-to-target is the comfort baseline.
7. **Trusting LLM spatial reasoning at scale** — [22][23]. Current LLMs lose 42-84% accuracy as grids grow; layout decisions must be checked, not blindly applied.

---

## Implications for Interactive Jarvis

1. **Enforce a "no unjustified 3D" check in the Layout agent prompt** — Maps to L2, L4. Affects `electron/main/agents/layout.ts` and `electron/main/mcp/layout-tools.ts`. Effort: S. AR-readiness: neutral. Add an explicit "is this data inherently 3D?" rationale field to every layout decision; if no, prefer planar arrangements that work in both desktop and AR. Defends against the most-cited anti-pattern.
2. **Adopt the channel-rank table as a documented Visual Language constant** — Maps to L2, L9. Affects new `docs/product/VISUAL-LANGUAGE.md` (to be written in Phase 4) and `renderer/src/scene/Artifact.tsx` (color/luminance/size choices). Effort: M. AR-readiness: +. Forces explicit choices, prevents accidental channel-overload.
3. **Implement world-anchor / hand-anchor / head-anchor abstraction in the camera layer now** — Maps to L5. Affects `renderer/src/scene/Canvas.tsx` (current OrbitControls assumption). Effort: M. AR-readiness: ++. Even on desktop, separating "this panel is data" from "this is a control surface" is hygiene that pays off when WebXR lands. The bridge doc has this on the migration list; doing it pre-emptively is cheap.
4. **Standardise animated transitions at 800-1500ms with semantic-bundling for reorganize** — Maps to L8, L11. Affects `renderer/src/scene/live-transforms.ts` and the Layout-agent `apply_layout_plan` tool [`electron/main/mcp/layout-tools.ts`]. Effort: S (likely already partial). AR-readiness: +. Heer & Robertson [14] empirical baseline; defends against change-blindness when the agent reorganizes the canvas.
5. **Add a preattentive-cue layer for ambient agent activity** — Maps to L8, L11. New artifact-kind or property in `electron/main/world-state.ts` plus rendering in `renderer/src/scene/Artifact.tsx`. Effort: M. AR-readiness: neutral. A single preattentive channel (luminance pulse or motion bloom) signals "agent is touching this"; reserve a second channel (color hue ring) for "needs attention". Two channels max — no conjunctions.
6. **Reserve a `panel` artifact kind for chart/dashboard small-multiples** — Maps to L2, L4, L10. Affects `electron/main/world-state.ts` (new kind) and `electron/main/mcp/canvas-tools.ts` (creation tool). Effort: M-L (depending on whether the renderer gets a chart engine). AR-readiness: +. Today everything is a plate-card; small-multiples need a *grid-of-similar-panels* primitive to land Tufte/Few faceting. This unlocks the user's "multiple linked dashboards" vision and the canonical CMV pattern.
7. **Add an explicit "named selection" / saved-set concept** — Maps to L7, L10. Affects `electron/main/world-state.ts` (saved selections collection) and `renderer/src/ui/` (selection chip UI). Effort: M. AR-readiness: +. Foundation for CMV linked-highlighting across future panels and for the spec'd "filter-driven view" primitive.

---

## Open questions

1. **What is the canonical visual idiom for multi-agent reasoning trace?** — No peer-reviewed answer as of May 2026; IEEE VIS 2025 [18] starts the conversation. Needs original design + prototyping in our cycle.
2. **Does VR method-of-loci recall lift [19] transfer to *agentic* recall** — i.e. does spatially anchoring an agent's discovered facts help the *agent* (and the user when they return) re-find them? No literature; testable in a Jarvis user-study post-WebXR.
3. **How brittle is current LLM spatial reasoning when *assisted* by a structured layout prompt?** — [22][23] tested raw LLM spatial reasoning; we ought to instrument our Layout agent's success rate on increasingly dense canvases to know where the bottleneck lies.
4. **For situated analytics anchoring [16], how should switching policies work when an artifact crosses from "personal scratch" to "shared canonical"?** — Open in the literature; relevant when Jarvis goes multi-user.
5. **For mixed-anchor environments, what's the cognitive cost of having world+hand+head-anchored UI simultaneously visible?** — Not directly studied; Friedl-Knirsch 2024 [17] notes long-session evaluation is the gap.

---

## References (full)

1. Munzner, T. *Visualization Analysis and Design*. CRC Press / A K Peters, 2014. Book page: <https://www.cs.ubc.ca/~tmm/vadbook/>. ISBN 978-1466508910.
2. Munzner, T. "Marks and Channels — revised lecture." SIGGRAPH Courses, Jan 2026. DOI 10.1145/3721241.3733989. <https://dl.acm.org/doi/10.1145/3721241.3733989>.
3. Munzner, T. "A Nested Model for Visualization Design and Validation." *IEEE TVCG* 15(6):921–928, Nov 2009. <https://pubmed.ncbi.nlm.nih.gov/19834155/>.
4. Ware, C. *Information Visualization: Perception for Design*, 4th ed. Morgan Kaufmann, 2020. ISBN 978-0128128756. <https://shop.elsevier.com/books/information-visualization/ware/978-0-12-812875-6>.
5. Card, S., Mackinlay, J., Shneiderman, B. *Readings in Information Visualization: Using Vision to Think*. Morgan Kaufmann, 1999. ISBN 978-1558605336.
6. Shneiderman, B. "The Eyes Have It: A Task by Data Type Taxonomy for Information Visualizations." *Proc IEEE VL'96*, 336–343. <https://www.cs.umd.edu/~ben/papers/Shneiderman1996eyes.pdf>.
7. Ens, B., Bach, B., Cordeil, M., Engelke, U., Serrano, M. et al. "Grand Challenges in Immersive Analytics." *CHI 2021*. DOI 10.1145/3411764.3446866. <https://dl.acm.org/doi/10.1145/3411764.3446866>.
8. Marriott, K., Schreiber, F., Dwyer, T., Klein, K., Riche, N.H., Itoh, T., Stuerzlinger, W., Thomas, B.H. (eds.). *Immersive Analytics*. Springer LNCS 11190, 2018. DOI 10.1007/978-3-030-01388-2. <https://link.springer.com/book/10.1007/978-3-030-01388-2>.
9. Dwyer, T., Marriott, K., Isenberg, T., Klein, K., Riche, N. et al. "Immersive Analytics: Time to Reconsider the Value of 3D for Information Visualisation." Ch. 2 in [8]. DOI 10.1007/978-3-030-01388-2_2.
10. Billinghurst, M., Cordeil, M., Bezerianos, A., Margolis, T. "Collaborative Immersive Analytics." Ch. 8 in [8]. DOI 10.1007/978-3-030-01388-2_8.
11. Healey, C.G., Enns, J.T. "Attention and Visual Memory in Visualization and Computer Graphics." *IEEE TVCG* 18(7):1170–1188, 2012. DOI 10.1109/TVCG.2011.127. <https://www.csc2.ncsu.edu/faculty/healey/download/tvcg.11.pdf>.
12. Tufte, E.R. *Beautiful Evidence*. Graphics Press, 2006. ISBN 978-0961392178. Sparkline essay: <https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/>.
13. Few, S. *Now You See It: Simple Visualization Techniques for Quantitative Analysis*. Analytics Press, 2009. ISBN 978-0970601988.
14. Heer, J., Robertson, G.G. "Animated Transitions in Statistical Data Graphics." *IEEE TVCG* 13(6):1240–1247, 2007. DOI 10.1109/TVCG.2007.70539. <http://vis.stanford.edu/papers/animated-transitions>.
15. Roberts, J.C. "State of the Art: Coordinated & Multiple Views in Exploratory Visualization." *CMV 2007*. <https://www.cs.kent.ac.uk/pubs/2007/2559/content.pdf>.
16. Shin, S., Cordeil, M., Drogemuller, A., Saalfeld, P., Bach, B., Smith, R., Ens, B. "The Reality of the Situation: A Survey of Situated Analytics." *IEEE TVCG* 30(8):5147–5164, Aug 2024. DOI 10.1109/TVCG.2023.3285546. arXiv:2310.10015.
17. Friedl-Knirsch, J. et al. "A Systematic Literature Review of User Evaluation in Immersive Analytics." *Computer Graphics Forum* 43(3), 2024. DOI 10.1111/cgf.15111. <https://onlinelibrary.wiley.com/doi/10.1111/cgf.15111>.
18. IEEE VIS 2025, "Immersive & Ubiquitous Analytics" session, full proceedings. <https://ieeevis.org/year/2025/program/session_full18.html>. Cited papers: Zimmermann & Bruckner ("Multi-Focus Probes for Context-Preserving Network Exploration"); Vu, Rai, Chung ("Walking Through Time"); Song, Johnson, Whitley, Krokos, Varshney ("Embodied Natural Language Interaction in Immersive Analytics").
19. Krokos, E., Plaisant, C., Varshney, A. "Virtual memory palaces: immersion aids recall." *Virtual Reality* 23, 1–15 (2019). Plus replication: Optimized VR-based Method of Loci, PMC9540171 (2022); AIP Conf. Proc. 3075, 020093 (July 2024). <https://pmc.ncbi.nlm.nih.gov/articles/PMC9540171/>.
20. Reski, N., Alissandrakis, A. et al. "Where to Draw the Line: Physical Space Partitioning and View Privacy in AR-based Co-located Collaboration for Immersive Analytics." *ACM SUI 2024*. DOI 10.1145/3677386.3682085. <https://dl.acm.org/doi/abs/10.1145/3677386.3682085>.
21. "HeedVision: Attention Awareness in Collaborative Immersive Analytics Environments." arXiv:2505.07069, 2025. <https://arxiv.org/pdf/2505.07069>.
22. "Stuck in the Matrix: Probing Spatial Reasoning in Large Language Models." arXiv:2510.20198, 2025. <https://arxiv.org/abs/2510.20198>.
23. "Spatial-DISE: A Unified Benchmark for Evaluating Spatial Reasoning in Vision-Language Models." arXiv:2510.13394, 2025. <https://arxiv.org/abs/2510.13394>.

**Source tier counts:** Tier A (peer-reviewed paper or canonical textbook): [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20] — 19 sources. Tier B (preprint/established workshop with strong methodology): [15, 21] — 2 sources. Tier C (recent preprint, single-source claim): [22, 23] — 2 sources. Total cited: 23 (some references aggregate multiple chapters/papers).
