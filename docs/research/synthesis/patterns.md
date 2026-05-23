# Pattern Catalog

**Coverage:** 12 workstreams, ~108 source patterns extracted, deduplicated to **82 unique entries**.

This catalog is the deduplicated cross-workstream consolidation of the `## Top patterns extracted` sections of WS-01..12 (plus WS-06's `## What canvas tools got right…`). Each entry records every workstream it appeared in, the strongest "why it works" formulation, and any contradictions across sources.

Evidence rating uses the Tier A/B/C system defined in `00-lens-and-scope.md` §0.5:
- **Strong** — appears in ≥2 Tier-A sources OR ≥3 sources across tiers (and ≥2 workstreams)
- **Medium** — 1 Tier-A or 2 Tier-B sources
- **Weak** — single source or Tier-C only

---

## Index by lens

(Patterns may appear under multiple lenses; primary tag in **bold**.)

- **L1 — Spatial primitives:** Window/Volume/Immersive triad; Frame vs Group split; Typed-graph substrate; Subnetwork dive-in/dive-up; Sticky-note with zoom-aware text size; Backdrop / frame with semantic color; Reasoning-thread as spatial primitive; Per-agent depth layer (Z=identity); Room-as-substrate (Dynamicland); Console horseshoe layout; Named-trail artifact-kind; Per-artifact-kind shape coding; Panel as first-class primitive.
- **L2 — Data → form:** Channel-rank-by-data-type; No-unjustified-3D; Declarative grammar with auto-compiled chrome; Two-layer color (type+state); Trends-with-current-value; Per-node inline preview; Conditional formatting as glyph-replacement; Smart-Narrative auto-summary; Transclusion / parallel text.
- **L3 — Camera & navigation:** Center-of-rotation tracking; Focus-pivot camera; Camera as programmable subsystem; Tab-menu fuzzy node-create; Bookmark / Story Point state-machine; Workspaces / saved layouts; Stationary horseshoe; Frames-as-slides for narration; Section / clip planes.
- **L4 — LOD:** Hierarchical subgraph abstraction; Subnetwork dive-in/dive-up; Brackets at distance with LOD-collapse; Aggregation-as-different-mark; Streaming + progressive refinement; LOD via style downgrade (not just culling); Per-class label thinning; Repeating panels per variable; Mini-map with viewport rectangle; Intermediate-edge collapse; Hard render cap (≤200 artifacts).
- **L5 — Anchoring (AR/VR):** World-anchor data / hand-anchor controls / head-anchor status; World-anchored over head-anchored; Body-locked / lazy-follow; Optimal Content Placement Area (OCPA); Passthrough periphery as grounding aid; Vignette / FoV reduction during motion; Three-tier locomotion comfort presets; Per-artifact `anchor` field as scene-type vocabulary.
- **L6 — Labels & legends:** Brackets at distance; Per-class label thinning; Sticky-note with zoom-aware text; Vendor text sizing floor; Hover-only edge labels at scale.
- **L7 — Selection & group operations:** Algebraic named selections; Saved Exploration / View-as-document; Saved selections as queries (not ID lists); Search Around / Expand Neighbors; Control groups (Ctrl+1..9); Marking menu (radial gesture); Modal G/R/S transform; Hand-attached quick menu (ulnar palm); Tab-menu fuzzy node-create; Display-flag node-as-focus-anchor.
- **L8 — Attention flow:** Preattentive single-channel pop-out; Animated transition for state change; Layered alert priority (paired visual+aural); Blast-radius rendering; Attention beam ("waiting on you"); Off-screen arrow + minimap ping; Calm technology three-tier (focal/periphery/ambient); Sound as first-class attention channel; Agent cursor with intent bubble.
- **L9 — Color system:** Channel-rank-by-data-type; Two-layer color (type + state, NO third scale); Conditional formatting as glyph-replacement; Typed colored ports + provisional-wire validation.
- **L10 — Inter-view linking:** Coordinated multiple views with linked highlighting; Default cross-filter / cross-highlight; Linked-views feedback loop; Cascading filters with explicit scope; Drill-through pages with auto-back; Viz-in-Tooltip / Tooltip pages; Symbol sync across linked windows; Overview window ↔ scene linked highlight; Linked editor+graph+backlinks triple; Brushing-and-linking across panels.
- **L11 — Process / reasoning representation:** Collapsible thinking block; Hierarchical trace tree; Plan-then-execute stepper; Generate-then-preview split; Node-graph as authoring+trace; Worktree/sandbox per agent; Intent-ghost plates / ghost-preview; Branch-aware trace; Upstream-left DAG convention; Action as first-class; Visualization pipeline as data-flow DAG; Display-flag node-as-focus-anchor; Smart-Narrative auto-summary; Make Real loop (canvas→preview→re-generate); Status-column kanban; Workflow-as-DAG export.
- **L12 — Multi-user, sharing, persistence:** Saved Exploration / View-as-document; JSON-Canvas open format; USD-style layered composition; Shared wall + private console split; Mission-elapsed-time as universal anchor; Voice loop as orthogonal coordination channel.

---

## Index by evidence strength

- **Strong (38):** Coordinated multiple views with linked highlighting; No-unjustified-3D; Channel-rank-by-data-type; Preattentive single-channel pop-out; Animated transition for state change; Motion parallax as primary depth cue; World-anchor data / hand-anchor controls / head-anchor status; Body-locked / lazy-follow; Default cross-filter / cross-highlight; Cascading filters with explicit scope; Drill-through pages with auto-back; Viz-in-Tooltip / Tooltip pages; Bookmark / Story Point state-machine; Typed-graph substrate; Action as first-class; Search Around / Expand Neighbors; Linked-views feedback loop; Upstream-left DAG convention; Two-layer color (type+state); Blast-radius rendering; Saved Exploration / View-as-document; Hierarchical subgraph abstraction; Focus-pivot camera; Typed objects (supertags); JSON-Canvas open format; Linked editor+graph+backlinks triple; Visualization pipeline as data-flow DAG; Algebraic named selections; Center-of-rotation tracking; Per-class label thinning; Declarative grammar with auto-compiled chrome; Collapsible thinking block; Hierarchical trace tree; Plan-then-execute stepper; Generate-then-preview split; Node-graph as authoring+trace; Tab-menu fuzzy node-create; Subnetwork dive-in/dive-up.
- **Medium (32):** Window/Volume/Immersive triad; Optimal Content Placement Area (OCPA); Indirect gaze-pinch as primary selection; Hand-attached quick menu (ulnar palm); Three-tier locomotion comfort presets; Vignette / FoV-reduction during motion; OpenXR action manifest; Sound as first-class attention channel; Passthrough periphery as grounding aid; Tiled responsive grid + nested containers; Repeating panels per variable; Symbol sync across linked windows; Smart-Narrative auto-summary; Conditional formatting as glyph-replacement; Intermediate-edge collapse; Pin-based directionality for processes; Ontology-Augmented Generation; Community-detection layout; Right-stack of detail panels; AI-suggested related without modifying graph; Calendar-drop journal layout; Natural-language graph query; Streaming + progressive refinement; Aggregation as a different mark; Section / clip planes with manipulators; Time-as-encoding (animation grammar); USD-style layered composition; Brackets at distance with LOD-collapse; Lens overlay system; Marking menu (radial gesture); Modal-key operators (G/R/S); Control groups (Ctrl+1..9); Workspaces / saved layouts; Diegetic-state, non-diegetic-action UI; Overview window ↔ scene linked highlight; Off-screen arrow + minimap ping; Per-node inline preview; Typed colored ports + provisional-wire validation; Mini-map with viewport rectangle; Named reroute (wireless connection); Display-flag node-as-focus-anchor; Sticky-note with zoom-aware text; Backdrop / frame with semantic color; Citation footnotes + follow-up suggestions; Tiled multi-agent grid; Worktree/sandbox per agent; Side-by-side prompt-version diff; Status-column kanban; Horseshoe of fixed-slot panels; Four-zone attention budget; Layered alert priority (paired visual+aural); Drill-down by content swap; World-anchored over head-anchored; Shared wall + private console split; Trends-with-current-value; Mission-elapsed-time as universal anchor; Voice loop as orthogonal coordination channel; Stable layout enables 5-min-scan recovery; Named associative trail (Bush); Transclusion / parallel text; Viewspec (Engelbart); Active object (Kay); Immediate connection (Victor); Information-software-first (Magic Ink); Evergreen note as forcing function; Calm technology three-tier (Weiser); Room-as-substrate (Dynamicland); Frame vs Group split; Binding endpoints with mode+fixedPoint; Camera as programmable subsystem; LOD via style downgrade; Sticky clustering as Layout-agent UX; Cursor chat / Talktrack ambient awareness; Frames-as-slides for guided narration; Make Real loop (canvas→preview→re-generate); Hierarchical hotbox (compound mark); Workflow-as-DAG export; Reasoning-thread as spatial primitive; Per-agent depth layer (Z=identity); Attention beam ("waiting on you"); Intent-ghost plates / ghost-preview; Branch-aware trace; Per-agent cost/token HUD.
- **Weak (12):** Structural-gap detection; Reveal-on-hover / reveal-on-look (cinematic JARVIS); Contextual zoom — focal grows, periphery dims; Hierarchical hotbox; VR method-of-loci recall lift; Voice with name-as-attention-token; Two-handed pinch-pull-apart scale; Calendar-drop journal layout; AI-suggested related without graph modification; Workspaces as named layouts (single-source mention); Ambient-stripe per-panel; Time-scrubber on reasoning trace.

*(Note: many "medium" entries cross to "strong" once you count their cross-WS appearances — the list above errs on the side of "strong" only when explicitly seen in ≥3 WS or in ≥2 Tier-A sources.)*

---

## Patterns

Sorted strong → medium → weak; within tier, ordered by primary lens.

---

### Strong patterns

### Coordinated multiple views with linked highlighting [evidence: strong]
**Lens tags:** **L10**, L7, L8
**Where seen:** WS-01 (Roberts CMV survey, Tableau, Power BI), WS-03 (Tableau + Power BI), WS-04 (Foundry Map+Histogram+Object Explorer), WS-05 (Obsidian editor+graph+backlinks triple, Neo4j Bloom), WS-08 (ParaView linked views), WS-10 (Eve overview ↔ scene, SC2 minimap), WS-12 (control rooms brushing-and-linking)
**Mechanism:** Selection state is shared across N views; hovering or selecting a mark in one view filters/highlights matching items in every other view. Brushing a range in one filters all.
**Why it works:** The visual cost of side-by-side small-multiples is low while the analytical power of seeing the same selection across encodings is high — collapses 4-5 clicks of hypothesis convergence into one.
**Caveat / when it fails:** >6 linked views causes update storm + cognitive overload; in 3D, "side-by-side" requires explicit placement that costs more than DOM panel stacking.
**Sketch:**
```
 [Map]   [Hist]   [Table]
   |       |        |
   `———— hover ———→ all three dim non-matches
```

### No-unjustified-3D [evidence: strong]
**Lens tags:** **L2**, L1, L4
**Where seen:** WS-01 (Munzner, Few, Wilke), WS-03 (Tufte), WS-05 (Obsidian 3D Graph anti-pattern), WS-08 (3D position used for abstract data — anti-pattern), WS-10 (Cyberpunk steady-state), WS-12 (decorative depth)
**Mechanism:** Use 3D only when data is *inherently* spatial (architecture, molecules, weather) or the third axis is genuinely quantitative; otherwise use 2D with faceting / small-multiples.
**Why it works:** 3D introduces occlusion + perspective foreshortening that demote position-on-common-scale (the most accurate channel) to volume-with-occlusion. Loses accuracy, gains nothing.
**Caveat:** Motion-parallax (slight orbit) restores most of the cost — interactive 3D ≠ static 3D. Jarvis is genuinely 3D for *layout* purposes; rule applies to *encodings within* artifacts.

### Channel-rank-by-data-type [evidence: strong]
**Lens tags:** **L2**, L9
**Where seen:** WS-01 (Munzner, Cleveland-McGill 1984), WS-03 (Tableau Show-Me), WS-08 (Vega-Lite encoding picker)
**Mechanism:** Rank visual channels by empirical accuracy for each data-type: position > length > angle > area > volume > color-saturation. Gate by quantitative / ordered / categorical.
**Why it works:** Matches empirical accuracy of human visual judgements on each channel (psychophysics result, decades old).
**Caveat:** Ranking is for *accuracy*; aesthetic and brand constraints may override.

### Preattentive single-channel pop-out [evidence: strong]
**Lens tags:** **L8**, L9
**Where seen:** WS-01 (Healey & Enns, Ware), WS-10 (brackets at distance), WS-12 (cockpit warning systems)
**Mechanism:** Use one preattentive channel (hue, motion, luminance, size) for the call-out; <200ms detection regardless of distractor count.
**Why it works:** Matches V1 / pre-attentive visual cortex processing — parallel search, not serial.
**Caveat:** Conjunctions (two channels combined, e.g. "red AND blinking") break preattention and require serial search.

### Animated transition for state change [evidence: strong]
**Lens tags:** **L8**, L11
**Where seen:** WS-01 (Heer & Robertson), WS-06 (tldraw camera tween), WS-08 (Time-as-encoding / animation grammar)
**Mechanism:** 800-1500ms animated tween between states with semantic bundling; preserve object identity across the change.
**Why it works:** Defeats change-blindness; user can track which object went where.
**Caveat:** >2.5s harms recall; instant snaps cause confusion; <500ms is perceived as a snap.

### World-anchor data / hand-anchor controls / head-anchor status [evidence: strong]
**Lens tags:** **L5**, L1
**Where seen:** WS-01 (Marriott Immersive Analytics), WS-02 (Apple HIG, Microsoft MRTK, Meta), WS-12 (control-room horseshoe = world-anchor)
**Mechanism:** Pick anchor by content lifetime — long-lived data goes to the world, transient controls to the hand, status badges to the HUD.
**Why it works:** Matches user proprioception + memory affordances; world-anchored objects can be re-found by walking; hand-anchored is always summonable.
**Caveat:** Anchor switches must be explicit, not automatic. The Apple visionOS Window/Volume/Immersive triad is the canonical concretization.

### Body-locked / lazy-follow as head-lock substitute [evidence: strong]
**Lens tags:** **L5**, L3
**Where seen:** WS-02 (Microsoft, Apple, Meta — all three explicit), WS-12 (world-anchored over head-anchored)
**Mechanism:** Content translates with user but rotates lazily, only re-orienting after a threshold of head rotation (e.g. 30°). Substitute for the 1:1 head-locked HUD.
**Why it works:** Keeps a panel reachable without inducing vergence-accommodation conflict or head-lock-induced sickness.
**Caveat:** Needs tuning per content type and per user; rotation threshold is sensitive.

### Default cross-filter / cross-highlight [evidence: strong]
**Lens tags:** **L10**
**Where seen:** WS-03 (Power BI default, Tableau opt-in), WS-04 (Foundry linked-views feedback loop), WS-10 (overview ↔ scene)
**Mechanism:** Clicking a mark in one visual filters or highlights all sibling visuals on the same surface — zero authoring overhead.
**Why it works:** Zero-config interactivity; surfaces relationships without authoring.
**Caveat:** Surprising at first; hard to undo without explicit reset; cycles need protection.

### Cascading filters with explicit scope [evidence: strong]
**Lens tags:** **L10**, L7
**Where seen:** WS-03 (Superset Native Filters, Power BI slicer-sync, Looker `listen:`, Grafana variables), WS-04 (Foundry filter chips)
**Mechanism:** A filter widget declares which visuals it scopes to; chained filters update each other's option sets.
**Why it works:** Makes the "which widgets does this filter affect?" relationship visible and authorable.
**Caveat:** Scope explosion in large dashboards; need a "scope visualization" affordance.

### Drill-through pages with auto-back [evidence: strong]
**Lens tags:** **L10**, L3
**Where seen:** WS-03 (Power BI), WS-04 (Foundry Object Explorer), WS-12 (cockpit MFD pages)
**Mechanism:** Right-click or click → drill to dedicated detail page; back button auto-added so context never lost.
**Why it works:** Detail context never lost; user always has a way home.
**Caveat:** Each drill destination must be authored; in pure spatial canvases, the "page" abstraction conflicts with infinite-canvas mental model.

### Viz-in-Tooltip / Tooltip pages [evidence: strong]
**Lens tags:** **L10**, L6
**Where seen:** WS-03 (Tableau, Power BI), WS-04 (Foundry context cards), WS-09 (per-node inline preview)
**Mechanism:** Hover over mark surfaces a second mini-visual filtered to the hovered entity.
**Why it works:** Progressive disclosure without consuming dashboard real estate.
**Caveat:** Heavy hover-trap risk in 3D where pointer dwells unintentionally; in AR, gaze-hover variant fits better.

### Bookmark / Story Point state-machine [evidence: strong]
**Lens tags:** **L3**, L11, L12
**Where seen:** WS-03 (Power BI bookmarks, Tableau Story Points), WS-06 (Miro/FigJam frames-as-slides), WS-10 (workspaces / saved layouts), WS-12 (saved consoles)
**Mechanism:** A bookmark captures filters + visibility + drill state + spotlight; buttons load bookmarks; navigator gives next/prev/dot UI.
**Why it works:** Lets authors choreograph a narrative path through a dataset; same primitive as workspaces.
**Caveat:** Pure linear stories fail for ad-hoc viewer exploration; bookmark fragility — add a new visual to the page and the bookmark may break silently.

### Typed-graph substrate [evidence: strong]
**Lens tags:** **L1**, L2, L9
**Where seen:** WS-04 (Foundry, Bloom, Linkurious, Marquez, Dagster), WS-05 (Tana, Capacities, Kumu), WS-08 (per-class labels), WS-09 (typed colored ports)
**Mechanism:** Every entity is `(type, properties, links)`; every link is `(srcType, dstType, semantics)`. The schema lets the UI generate sensible icons, colors, expansion menus automatically.
**Why it works:** Filtering, querying, and bulk operations possible at any scale; LLM grounding (OAG) reduces hallucination.
**Caveat:** Requires a curation step; ad-hoc capture fights it. Sweet spot for an LLM-driven canvas where the agent can re-type artifacts on demand is unstudied.

### Action as first-class [evidence: strong]
**Lens tags:** **L11**, L7
**Where seen:** WS-04 (Foundry Action types — canonical), WS-03 (Tableau Actions as Action-arrow visualization), WS-09 (typed ports + provisional wire validation)
**Mechanism:** Mutations are typed, governed, idempotent, and bound to the entity types they affect. Distinct from "free-form Worker run."
**Why it works:** LLM, UI, and audit log all see "what changed" the same way; binds to gesture targets ("tap action chip") in AR.
**Caveat:** Requires up-front modeling of all valid changes.

### Search Around / Expand Neighbors [evidence: strong]
**Lens tags:** **L7**, L11
**Where seen:** WS-04 (Foundry Vertex, Bloom, Linkurious), WS-05 (Logseq DB queries, Capacities)
**Mechanism:** Right-click on selected node → menu of typed outgoing/incoming link options → new nodes inserted spatially adjacent (don't reflow the whole board).
**Why it works:** Investigator stays in flow, doesn't lose context.
**Caveat:** Graph grows fast — needs an undo / collapse story.

### Upstream-left DAG convention [evidence: strong]
**Lens tags:** **L11**, L1
**Where seen:** WS-04 (dbt, Dagster, Airflow, Marquez, Pipeline Builder), WS-07 (ComfyUI, LangFlow, AutoGen), WS-09 (every mature node tool)
**Mechanism:** Directional arrows flow left-to-right; auto-layout enforces it.
**Why it works:** Muscle memory across the industry; predictable scroll direction.
**Caveat:** 3D rotation can break the convention — needs an axis-anchoring rule.

### Two-layer color (type + state, no third scale) [evidence: strong]
**Lens tags:** **L9**, L8
**Where seen:** WS-04 (Foundry, Dagster, dbt Cloud — explicit warning against 3-color overload), WS-03 (Few's 4-scale model), WS-09 (typed colored ports), WS-12 (paired visual+aural priority)
**Mechanism:** Fill = categorical (entity/asset/kind type), overlay/border/ring = state (run status, freshness, lifecycle). Confidence/recency stays in text-only badges.
**Why it works:** Layers compose without channel conflict; survives distance and AR rendering pipelines.
**Caveat:** Limits to ~12 distinguishable categorical hues; never use red for category if state-red exists.

### Blast-radius rendering [evidence: strong]
**Lens tags:** **L8**, L11
**Where seen:** WS-04 (Dagster stale propagation, Foundry Data Lineage out-of-date, Marquez impact), WS-07 (reasoning-trace propagation), WS-12 (alarm cascade per ISA-18.2)
**Mechanism:** A state change at one node cascades color/glyph downstream for 2-3 sec.
**Why it works:** Lets user see "what's affected" without reading logs; in AR, a downstream glow draws gaze better than a corner badge.
**Caveat:** Ripple animation becomes visual noise on dense DAGs — cap the depth and the rate.

### Saved Exploration / View-as-document [evidence: strong]
**Lens tags:** **L7**, L12, L3
**Where seen:** WS-04 (Foundry Object Explorer, Vertex templates, Workshop modules, Bloom scenes), WS-08 (ParaView named pipelines), WS-10 (Workspaces), WS-11 (Engelbart Viewspec — historical antecedent)
**Mechanism:** Bundle query + filter + chart-config + layout + camera as a named, sharable artifact.
**Why it works:** Makes investigator reasoning *reproducible*; same data, many lenses, switchable in O(ms).
**Caveat:** Explosion of saved views needs taxonomy; pure ID-list bookmarks rot when data changes — use predicates / queries.

### Hierarchical subgraph abstraction [evidence: strong]
**Lens tags:** **L4**, L1
**Where seen:** WS-04 (Pipeline Builder Folders+Color Groups, ComfyUI Subgraphs), WS-05 (Louvain community detection), WS-08 (Cytoscape metanodes), WS-09 (Houdini, Nuke Groups, Blender Node Groups, Substance sub-graphs)
**Mechanism:** Group N nodes into a single representative; double-click / enter to dive in; U or back to exit.
**Why it works:** Hierarchical compression is the only known mitigation for visual O(n²) above ~200 nodes.
**Caveat:** Nesting past 3 levels deep loses the user; subgraph boundaries are themselves a design problem (where to cut?).

### Focus-pivot camera [evidence: strong]
**Lens tags:** **L3**, L4
**Where seen:** WS-05 (TheBrain plex, Neo4j Bloom), WS-08 (ChimeraX cofr, Onshape, Fusion 360), WS-10 (overview-window pivoting)
**Mechanism:** Clicked node animates to center; surrounding context re-radiates; orbit pivot auto-binds to current selection/focus.
**Why it works:** Orientation is preserved without user navigation; never lost; eliminates "camera feels wrong" complaints.
**Caveat:** Requires that there's always one canonical "current" focus — multi-select breaks the metaphor. Needs UI signal when pivot moves.

### Typed objects / supertags [evidence: strong]
**Lens tags:** **L1**, L7
**Where seen:** WS-04 (Foundry Object Types), WS-05 (Tana supertags, Capacities, Kumu), WS-08 (per-class label thinning), WS-09 (typed colored ports)
**Mechanism:** Every node carries a kind + structured fields; the graph emerges from references between fields.
**Why it works:** Makes filtering, querying, and bulk operations possible at any scale.
**Caveat:** Requires upfront ontology discipline — fights against capture-now-organize-later.

### JSON-Canvas open format [evidence: strong]
**Lens tags:** **L12**
**Where seen:** WS-05 (Obsidian + Kinopio + emerging ecosystem), WS-06 (canvas tools interchange)
**Mechanism:** Portable file format for canvas data with extensible per-app fields.
**Why it works:** Lets multiple tools own different surfaces over the same data; trivial import path from any canvas tool.
**Caveat:** Only covers static canvas state, not interaction recordings.

### Linked editor + graph + backlinks triple [evidence: strong]
**Lens tags:** **L10**, L1
**Where seen:** WS-05 (Obsidian, Logseq, Capacities, Reflect), WS-12 (multi-pane composition)
**Mechanism:** Focus in any one view propagates highlight + scroll to all three; lowest-overhead linked-views pattern.
**Why it works:** Lowest-overhead "linked views" pattern in any consumer category.
**Caveat:** Only works for 3 views; degrades past that. In AR, "side-by-side DOM panels" needs explicit world-anchor placement.

### Visualization pipeline as data-flow DAG [evidence: strong]
**Lens tags:** **L11**, L1
**Where seen:** WS-04 (Pipeline Builder, Dagster, dbt), WS-07 (ComfyUI, LangFlow, AutoGen Studio), WS-08 (ParaView/VTK, VisIt, Houdini Solaris)
**Mechanism:** Every output is the result of a named filter/node chain; users edit the chain, not the output.
**Why it works:** Makes provenance visible; edits non-destructive; the user-built graph IS the execution surface.
**Caveat:** Needs careful UI to avoid Houdini-style learning-curve cliff.

### Algebraic named selections [evidence: strong]
**Lens tags:** **L7**, L11
**Where seen:** WS-04 (Foundry / saved-explorations), WS-05 (saved selections as queries), WS-08 (PyMOL, ChimeraX, ParaView), WS-11 (Engelbart viewspec)
**Mechanism:** Boolean expressions over attributes produce persistent named sets that downstream commands reference; LLM-friendly, composable, deterministic.
**Why it works:** Selections survive view changes; agent tools take `selectionId`.
**Caveat:** Needs an attribute schema the user understands.

### Center-of-rotation tracking [evidence: strong]
**Lens tags:** **L3**
**Where seen:** WS-05 (focus-pivot camera), WS-08 (ChimeraX cofr, Onshape, Fusion 360)
**Mechanism:** Orbit pivot auto-binds to current selection/focus, not a static origin.
**Why it works:** Eliminates "camera feels wrong" complaints — the universal failure mode of beginner Three.js scenes.
**Caveat:** Needs a clear UI signal when the pivot moves so the user isn't surprised.

### Per-class label thinning [evidence: strong]
**Lens tags:** **L6**, L4
**Where seen:** WS-05 (Obsidian large-vault thread), WS-08 (PyMOL/ChimeraX atom<residue<chain), WS-10 (brackets at distance, LOD-thinned)
**Mechanism:** Labels have a class-specific visibility distance; respects cognitive hierarchy of the data.
**Why it works:** Pixel-cost is otherwise quadratic in item count; class-aware thinning preserves the most salient labels.
**Caveat:** Needs the right class taxonomy; in AR-text needs `troika-three-text` not DOM `<Html>`.

### Declarative grammar with auto-compiled chrome [evidence: strong]
**Lens tags:** **L2**
**Where seen:** WS-04 (Workshop spec UI), WS-08 (Vega-Lite, Plotly Express, Gosling), WS-11 (Engelbart's viewspec → today's Vega-Lite)
**Mechanism:** Spec declares marks + encoding + data; library generates axes, legends, scales, layout.
**Why it works:** LLM-authorable, cacheable, schema-validatable; massive surface-area reduction vs imperative.
**Caveat:** Bounded to grammar; novel chart types still require imperative.

### Collapsible thinking block [evidence: strong]
**Lens tags:** **L11**
**Where seen:** WS-07 (ChatGPT o3, Claude chat, Claude Code TUI, ComfyUI subgraphs)
**Mechanism:** Long-running state hidden behind a one-line summary; one click expands.
**Why it works:** Power users want the chain, casuals want the answer; serves both.
**Caveat:** Binary open/closed loses partial-detail mid-state; doesn't address branch-retry visibility.

### Hierarchical trace tree [evidence: strong]
**Lens tags:** **L11**
**Where seen:** WS-07 (LangSmith, Langfuse, Phoenix, Helicone, Weave)
**Mechanism:** Parent → child indented spans; click to drill.
**Why it works:** Matches the call-stack mental model that engineers already have.
**Caveat:** Visually degrades past ~50 spans / depth > 6 — indentation eats horizontal space.

### Plan-then-execute stepper [evidence: strong]
**Lens tags:** **L11**, L7
**Where seen:** WS-07 (Copilot Workspace, Devin Planner, Replit Agent task board)
**Mechanism:** Agent emits structured plan; user can edit before commit; execution ticks each item.
**Why it works:** Gives the user a contract; defers commit until intent is clear.
**Caveat:** Bad plans are worse than no plan — the plan-edit affordance must be cheap.

### Generate-then-preview split [evidence: strong]
**Lens tags:** **L11**, L10
**Where seen:** WS-07 (Bolt, v0, Lovable, Claude Artifacts), WS-06 (Make Real loop)
**Mechanism:** Chat left, live render right; tight observe-modify loop.
**Why it works:** Closes perception-action loop; the canvas hosts both spec and result.
**Caveat:** Needs an obvious render target; falls down when the artifact is non-renderable.

### Node-graph as authoring + trace [evidence: strong]
**Lens tags:** **L11**, L1
**Where seen:** WS-04 (Pipeline Builder, Dagster), WS-07 (ComfyUI, LangFlow, AutoGen Studio), WS-09 (every mature node tool)
**Mechanism:** The user-built graph IS the execution surface; runtime overlays light up active nodes.
**Why it works:** Zero translation cost between authoring and execution view.
**Caveat:** Agent must not decide topology at runtime — that breaks the model.

### Tab-menu fuzzy node-create [evidence: strong]
**Lens tags:** **L7**, L3
**Where seen:** WS-09 (Houdini, Blender, ComfyUI, React Flow)
**Mechanism:** Hover canvas, press Tab, type fuzzy name, Enter creates and wires.
**Why it works:** Keyboard-first creation is 5-10× faster than palette drag for experts.
**Caveat:** Poor discoverability without paired visible palette; "the single highest-leverage pattern to import from Houdini" (WS-09).

### Subnetwork dive-in / dive-up [evidence: strong]
**Lens tags:** **L1**, L4, L3
**Where seen:** WS-04 (ComfyUI Subgraphs 2025, Pipeline Builder Folders), WS-05 (subgraph dive-in), WS-09 (Houdini, Nuke Groups, Blender Node Groups, Substance sub-graphs)
**Mechanism:** Collapse to Subnet → parent shows one icon; Enter to dive into a new canvas, U to exit, breadcrumb stack remembers history.
**Why it works:** Hierarchical compression is the only known mitigation for visual O(n²) at scale.
**Caveat:** Nesting past 3 deep loses the user; in 3D, the dive transition isn't yet a solved UX (portal? scene-swap? camera-zoom?).

---

### Medium-evidence patterns

### Window / Volume / Immersive Space triad [evidence: medium]
**Lens tags:** **L1**, L5
**Where seen:** WS-02 (Apple visionOS canonical, mirrored in Microsoft bounded vs unbounded)
**Mechanism:** Type-tagged scene primitives where the type determines anchoring, immersion scope, and 2D-vs-3D affordances.
**Why it works:** Forces the designer to declare intent (2D ≠ 3D ≠ environment) at scene-creation time.
**Caveat:** Apple is rigid — you can't make a Window "kind of a Volume." Translates well to a `kind: window-flat | volume-3d | immersive-env` tag on Jarvis artifacts.

### Optimal Content Placement Area (OCPA) [evidence: medium]
**Lens tags:** **L5**, L1
**Where seen:** WS-02 (Magic Leap 2 explicit 30°×30°, Microsoft ≤10° attentional cone, Apple "centered field of view")
**Mechanism:** Define a bounded angular zone within which critical content is guaranteed without head rotation.
**Why it works:** Hard guarantee against neck strain and missed UI.
**Caveat:** 30°×30° is tight for content-dense dashboards — must pair with peripheral overflow strategy.

### Indirect gaze-pinch as primary selection [evidence: medium]
**Lens tags:** **L7**
**Where seen:** WS-02 (Apple visionOS canonical, Microsoft hands-free dwell variant)
**Mechanism:** Decouple targeting (eye) from commit (hand or dwell).
**Why it works:** Leverages high-precision involuntary eye motion + explicit confirmation; works at any reach distance.
**Caveat:** Requires 60 pt+ targets and clean spacing.

### Hand-attached quick menu (ulnar palm) [evidence: medium]
**Lens tags:** **L7**, L5
**Where seen:** WS-02 (Microsoft Hand Menu canonical, with 1×3 layout), WS-11 (cinematic JARVIS interaction patterns)
**Mechanism:** Palm-up gesture summons a small menu anchored to the ulnar side of the palm, billboarded toward opposite shoulder.
**Why it works:** Always-available command surface with zero spatial cost.
**Caveat:** ≤3 items; require flat-palm + gaze co-condition to prevent false activation; world-lock if interaction is long.

### Three-tier locomotion comfort presets [evidence: medium]
**Lens tags:** **L5**, L3
**Where seen:** WS-02 (Meta Horizon OS canonical: Recommended / Comfortable / Advanced)
**Mechanism:** Ship three pre-configured motion settings so users pick their tolerance up-front.
**Why it works:** Defers a comfort decision to the user; avoids forcing a one-size-fits-all motion model.
**Caveat:** Only relevant when artificial locomotion exists.

### Vignette / FoV-reduction during motion [evidence: medium]
**Lens tags:** **L5**, L8
**Where seen:** WS-02 (Meta Locomotion canonical; also IEEE academic literature)
**Mechanism:** Darken/occlude screen edges during smooth movement to suppress vection.
**Why it works:** Reduces peripheral optic flow, the primary cybersickness driver.
**Caveat:** Opt-out for "Advanced" users; some find it intrusive.

### OpenXR action manifest [evidence: medium]
**Lens tags:** **L7**, L12
**Where seen:** WS-02 (Khronos OpenXR canonical)
**Mechanism:** Define semantic Actions ("Select", "Grab"); suggest bindings per interaction profile; runtime chooses.
**Why it works:** The only standard way to write input code once for many headsets.
**Caveat:** Hand tracking is an extension, not core; the registry is large.

### Sound as first-class attention channel [evidence: medium]
**Lens tags:** **L8**
**Where seen:** WS-02 (Apple Q&A explicit, Microsoft Hand Menu required, Meta Locomotion teleport mitigation), WS-12 (paired visual+aural priority, voice loop)
**Mechanism:** Spatial audio with positional reverb gives every interaction directional confirmation.
**Why it works:** AR/VR cannot rely on physical click feedback; sound replaces it.
**Caveat:** Must respect accessibility (visible alternative); rate-limit to avoid annoyance.

### Passthrough periphery as grounding aid [evidence: medium]
**Lens tags:** **L5**
**Where seen:** WS-02 (Meta MR Design Guidelines, Magic Leap 2 always-AR baseline)
**Mechanism:** Keep the physical world visible at the edges so vestibular and visual systems agree.
**Why it works:** Dramatically lowers cybersickness during sustained sessions.
**Caveat:** Hurts immersion; not appropriate for fully immersive styles.

### Tiled responsive grid + nested containers [evidence: medium]
**Lens tags:** **L1**, L3
**Where seen:** WS-03 (Tableau, Looker, Grafana)
**Mechanism:** Tiled layout auto-resizes proportionally; nested containers group related tiles for joint resize.
**Why it works:** Dashboards survive being viewed at multiple resolutions.
**Caveat:** Rigid; doesn't compose with "place a chart anywhere" canvases.

### Repeating panels per variable [evidence: medium]
**Lens tags:** **L4**, L2
**Where seen:** WS-03 (Grafana — canonical), WS-01 (small multiples, Tufte/Few)
**Mechanism:** Declare a panel once; it renders N times, one per value of a template variable.
**Why it works:** Dynamic small-multiples without authoring overhead; scales to "one panel per pod" without touching the dashboard.
**Caveat:** Visual explosion past ~30 instances; needs LOD strategy.

### Symbol sync across linked windows [evidence: medium]
**Lens tags:** **L10**, L7
**Where seen:** WS-03 (Bloomberg Launchpad), WS-12 (Bloomberg horseshoe)
**Mechanism:** Components are "linked"; changing the focus security in one updates all linked components.
**Why it works:** Lets a user use 4 monitors as one workspace; eliminates re-querying.
**Caveat:** Scales poorly past ~20 linked components.

### Smart-Narrative auto-summary [evidence: medium]
**Lens tags:** **L2**, L8, L11
**Where seen:** WS-03 (Power BI, Tableau Pulse, Looker Gemini), WS-07 (collapsible thinking block)
**Mechanism:** An LLM auto-writes a paragraph that updates with filter/workspace state, citing the values.
**Why it works:** Lowers chart-reading skill threshold; surfaces what changed.
**Caveat:** Text is read serially; for 12 cards, you read 12 paragraphs.

### Conditional formatting as glyph-replacement [evidence: medium]
**Lens tags:** **L9**, L2
**Where seen:** WS-03 (every BI tool), WS-04 (Foundry conditional row formatting), WS-12 (cockpit color-by-state)
**Mechanism:** Cell background color or icon encodes value/state; supplements or replaces the number.
**Why it works:** At-a-glance scanning of a 50-row table for "anything red".
**Caveat:** Color-blind users need icon backup.

### Intermediate-edge collapse [evidence: medium]
**Lens tags:** **L4**, L10
**Where seen:** WS-04 (Vertex `intermediateEdges`, Foundry distinguishing)
**Mechanism:** An edge that *represents* a chain through intermediate objects collapses the intermediates into a mid-line chip with counts.
**Why it works:** Keeps cardinality visible without rendering N intermediate nodes.
**Caveat:** Only safe when the intermediate type is semantically subordinate.

### Pin-based directionality for processes [evidence: medium]
**Lens tags:** **L11**, L2
**Where seen:** WS-04 (Pipeline Builder, ComfyUI, Dagster, Hex), WS-09 (Maya, Houdini, Substance, Unreal)
**Mechanism:** Processes have explicit input ports (left) and output ports (right); entities have implicit ports.
**Why it works:** Visually distinguishes "is this a thing or an action?" without legend.
**Caveat:** In mixed graphs (process outputting an entity), the transition needs a clear visual seam.

### Ontology-Augmented Generation (OAG) [evidence: medium]
**Lens tags:** **L11**, L12
**Where seen:** WS-04 (Palantir AIP), WS-11 (Bush trails realized as LLM-typed edges)
**Mechanism:** LLM consumes typed ontology objects + links (not text chunks) as tool results; reasoning is grounded in typed entities.
**Why it works:** Dramatically reduces hallucination because the model can't "make up" a typed property.
**Caveat:** Requires the ontology to be the *complete* truth-source for the question being asked.

### Community-detection layout [evidence: medium]
**Lens tags:** **L4**, L9
**Where seen:** WS-05 (InfraNodus, Graph Analysis plugin, Cytoscape), WS-04 (Louvain clusters)
**Mechanism:** Louvain or similar algorithm finds communities; spatial layout (ForceAtlas2) places clusters apart; color-by-community.
**Why it works:** Reduces 10k-node hairball to a comprehensible "map of districts."
**Caveat:** Cluster boundaries become a feature users start to over-trust — Louvain finds *modular* structure even where none is meaningful.

### Right-stack of detail panels [evidence: medium]
**Lens tags:** **L10**, L1
**Where seen:** WS-05 (Roam sidebar)
**Mechanism:** Arbitrarily many pages stack vertically in a scrollable side pane; each is fully editable.
**Why it works:** Lets the user assemble an ad-hoc reading context without losing their main view.
**Caveat:** Pure DOM scrolling; ports awkwardly to 3D/AR.

### AI-suggested related without modifying graph [evidence: medium]
**Lens tags:** **L10**
**Where seen:** WS-05 (Smart Connections, Reflect), WS-07 (citation footnotes + follow-ups)
**Mechanism:** Embeddings rank related notes; surface as a side list — never auto-create wiki-links.
**Why it works:** Keeps AI suggestion stream out of the canonical link structure.
**Caveat:** Suggestion is invisible from the graph view itself.

### Calendar-drop journal layout [evidence: weak-medium]
**Lens tags:** **L1**, L3
**Where seen:** WS-05 (Heptabase)
**Mechanism:** Right-click → calendar; all journal cards for the period land in a calendar grid on the canvas.
**Why it works:** Bridges temporal and spatial views with one gesture.
**Caveat:** Only works because journal cards are a known kind.

### Natural-language graph query [evidence: medium]
**Lens tags:** **L7**, L11
**Where seen:** WS-05 (Neo4j Bloom, Linkurious QueryAI)
**Mechanism:** User types "users connected to X via Y"; tool generates Cypher/Gremlin; result sub-graph appears.
**Why it works:** Makes saved selections expressible and shareable.
**Caveat:** Requires a typed graph DB underneath.

### Streaming + progressive refinement [evidence: medium]
**Lens tags:** **L4**, L8
**Where seen:** WS-08 (Mol* BinaryCIF, ParaView, OpenSpace, deck.gl tiles)
**Mechanism:** Render coarse immediately, refine async as data arrives.
**Why it works:** Maintains interactivity at any data scale.
**Caveat:** Needs LOD-friendly source data.

### Aggregation as a different mark [evidence: medium]
**Lens tags:** **L4**, L2
**Where seen:** WS-08 (kepler.gl points→hex bins, Cytoscape nodes→metanodes), WS-04 (intermediate-edge collapse)
**Mechanism:** At a density threshold, marks are *replaced* by an aggregating mark, not just made smaller.
**Why it works:** Avoids "hairball" failure and signals the mark change.
**Caveat:** Must telegraph the mark change.

### Section / clip planes with manipulators [evidence: medium]
**Lens tags:** **L3**, L4
**Where seen:** WS-08 (ParaView, VTK, Mol*, Onshape)
**Mechanism:** Draggable plane handle slices through opaque/volumetric data, revealing interior.
**Why it works:** Only practical way to inspect interior of an opaque shape.
**Caveat:** Rare in UI design — Jarvis could pioneer "section a cluster" gesture.

### Time-as-encoding (animation grammar) [evidence: medium]
**Lens tags:** **L2**, L11
**Where seen:** WS-08 (Animated Vega-Lite, ParaView animation, Mol* MD playback)
**Mechanism:** Temporal field in encoding drives mark interpolation.
**Why it works:** Unifies static + animated semantics.
**Caveat:** Easy to over-animate.

### USD-style layered composition [evidence: medium]
**Lens tags:** **L12**, L11
**Where seen:** WS-08 (Houdini Solaris LOPs)
**Mechanism:** Every contributor writes a layer; the stage composes via well-defined arcs.
**Why it works:** Non-destructive, multi-user-friendly, agent-friendly.
**Caveat:** Composition semantics confuse newcomers.

### Brackets at distance (with LOD collapse) [evidence: medium]
**Lens tags:** **L6**, L4
**Where seen:** WS-10 (Eve Online, Cyberpunk 2077, MSFS, flight sims)
**Mechanism:** Small icon + name + distance + state hovers over object; thinned by distance; collapsible to dots; overview-window alternate.
**Why it works:** Scales label rendering to thousands of objects.
**Caveat:** Needs careful occlusion ordering; aggregate ≥4 overlapping into "+N" badge.

### Lens overlay system [evidence: medium]
**Lens tags:** **L2**, L9
**Where seen:** WS-10 (Civ VI, Cities Skylines)
**Mechanism:** Same base view; keyboard-toggled colored overlay paints data.
**Why it works:** Doesn't fragment workspace; leverages spatial memory.
**Caveat:** Limit to ≤2 concurrent lenses or visual mud.

### Marking menu (radial gesture) [evidence: medium]
**Lens tags:** **L7**, L11
**Where seen:** WS-10 (Maya, 3ds Max, Houdini)
**Mechanism:** Button-hold reveals radial menu; flick direction executes; same gesture works blind for experts.
**Why it works:** Muscle memory + self-revealing; radial-pinch menus are the dominant AR input idiom.
**Caveat:** Cap at 8 per level.

### Modal-key operators (G/R/S) [evidence: medium]
**Lens tags:** **L7**
**Where seen:** WS-10 (Blender canonical)
**Mechanism:** Hotkey enters mode; mouse drives; axis-lock + numeric entry.
**Why it works:** 2-3× faster than direct manipulation for experts.
**Caveat:** Needs visible mode indicator or new users feel "stuck".

### Control groups (Ctrl+1..9) [evidence: medium]
**Lens tags:** **L7**
**Where seen:** WS-10 (SC2, WoW raid frames, RTS in general)
**Mechanism:** Save current selection to numeric hotkey; tap to select, double-tap to camera-snap.
**Why it works:** Lets users manage many parallel targets.
**Caveat:** Collisions with bookmarks if same key.

### Workspaces / saved layouts [evidence: medium]
**Lens tags:** **L3**, L12
**Where seen:** WS-10 (Blender, Maya, MSFS pop-outs, Star Citizen MFD profiles), WS-12 (saved consoles)
**Mechanism:** Tabs/profiles save panel arrangement + visibility + camera.
**Why it works:** Task-switching without losing context.
**Caveat:** Users need a "restore default" escape hatch.

### Diegetic-state, non-diegetic-action UI [evidence: medium]
**Lens tags:** **L1**, L2
**Where seen:** WS-10 (Alyx mostly diegetic + Beat Saber mostly non-diegetic)
**Mechanism:** Data lives in world (glow on grabbable, ammo on gun); commands live on floating panels.
**Why it works:** Data scales with content; commands stay discoverable.
**Caveat:** Pure diegetic has steep learning curve.

### Overview window ↔ scene linked highlight [evidence: medium]
**Lens tags:** **L10**, L7
**Where seen:** WS-10 (Eve, SC2 minimap, Civ city list)
**Mechanism:** Sortable list duplicates the spatial view; selection in either highlights the other.
**Why it works:** Gives users a "table view" fallback when spatial gets cluttered.
**Caveat:** Must stay in sync (cost of cross-view selection).

### Off-screen arrow + minimap ping [evidence: medium]
**Lens tags:** **L8**
**Where seen:** WS-10 (all RTS, RPGs)
**Mechanism:** Project world-point to screen; if outside, clamp + arrow; ping the minimap concurrently.
**Why it works:** Pulls attention without modal interrupt.
**Caveat:** Rate-limit to avoid spam.

### Per-node inline preview [evidence: medium]
**Lens tags:** **L10**, L11
**Where seen:** WS-09 (ComfyUI image, Houdini geometry thumbnail, Substance texture, n8n data row)
**Mechanism:** Small viewport renders the node's output on the node.
**Why it works:** Compresses inspector + graph; visual scan of dataflow.
**Caveat:** GPU/compute cost; usually toggleable.

### Typed colored ports + provisional-wire validation [evidence: medium]
**Lens tags:** **L9**, L2
**Where seen:** WS-09 (Maya, Houdini, Substance, Unreal, Rete.js)
**Mechanism:** Each type gets a stable color; dragged wires recolor red on incompatible target.
**Why it works:** Prevents errors before commit with zero added UI.
**Caveat:** Needs a real type system.

### Mini-map with viewport rectangle [evidence: medium]
**Lens tags:** **L3**, L4
**Where seen:** WS-09 (Houdini, React Flow, Foblex, Blender plugin, litegraph.js)
**Mechanism:** Shrunken redraw of full network with draggable box.
**Why it works:** Situational awareness at zero attention cost.
**Caveat:** ~150-200 px is the sweet spot.

### Named reroute (wireless connection) [evidence: medium]
**Lens tags:** **L1**, L2
**Where seen:** WS-09 (Unreal 5.0+, ComfyUI Get/Set custom nodes, LabVIEW historically)
**Mechanism:** Two labeled endpoints share data without a visible line.
**Why it works:** Eliminates longest spaghetti wires; converts spatial routing to named lookup.
**Caveat:** Hides dataflow — overuse defeats the visual model.

### Display-flag node-as-focus-anchor [evidence: medium]
**Lens tags:** **L11**, L7
**Where seen:** WS-09 (Houdini SOPs blue flag, Substance output preview)
**Mechanism:** A small clickable badge designates "this node drives the other views".
**Why it works:** Turns the network into a navigable filmstrip — walking the flag *is* debugging.
**Caveat:** Requires linked viewer panes.

### Sticky-note with zoom-aware text size [evidence: medium]
**Lens tags:** **L6**, L1
**Where seen:** WS-09 (Houdini extra-large mode, Blender 2025 frame label work)
**Mechanism:** Notes visible at full zoom-out as section headers like neighborhood signs.
**Why it works:** Semantic wayfinding at scale that a mini-map cannot provide.
**Caveat:** Authoring discipline required.

### Backdrop / frame with semantic color [evidence: medium]
**Lens tags:** **L1**, L9
**Where seen:** WS-09 (every mature node tool)
**Mechanism:** Transparent labeled rectangle behind a group of related nodes.
**Why it works:** Visual chunking is preattentive; named regions are recognized faster than wire patterns.
**Caveat:** Authoring discipline required.

### Citation footnotes + follow-up suggestions [evidence: medium]
**Lens tags:** **L11**, L8
**Where seen:** WS-07 (Perplexity), WS-05 (Smart Connections suggestion list)
**Mechanism:** Inline numbered citations + a sidebar with named next-steps the user might want.
**Why it works:** Makes the chain auditable and the conversation steerable.
**Caveat:** Footnotes noisy past 10 sources.

### Tiled multi-agent grid [evidence: medium]
**Lens tags:** **L1**, L11
**Where seen:** WS-07 (Cursor 3 Agents Window, Devin panes, Claude Code Agent View)
**Mechanism:** Each agent gets a pane; separation of concerns.
**Why it works:** Spatial slot per agent — user knows where to look for each one.
**Caveat:** No global attention beam — users miss completions in 8-tile setups.

### Status-column kanban [evidence: medium]
**Lens tags:** **L11**
**Where seen:** WS-07 (Replit Agent 4, partially Claude Code Agent View)
**Mechanism:** Cards move across columns as state changes; position *is* the state.
**Why it works:** Single-glance status read for many items.
**Caveat:** Enforces one state machine.

### Worktree/sandbox per agent [evidence: medium]
**Lens tags:** **L12**, L11
**Where seen:** WS-07 (Cursor `/multitask`, Devin VM)
**Mechanism:** Each agent gets isolated filesystem/browser/state.
**Why it works:** Failure containment.
**Caveat:** Hard state sync back to user.

### Side-by-side prompt-version diff [evidence: medium]
**Lens tags:** **L10**, L11
**Where seen:** WS-07 (Anthropic Workbench, Phoenix Playground)
**Mechanism:** Two prompts, same input, scored.
**Why it works:** Shifts the model from absolute to relative quality.
**Caveat:** Needs a rubric.

### Horseshoe of fixed-slot panels [evidence: medium]
**Lens tags:** **L1**, L5, L3
**Where seen:** WS-12 (Bloomberg 4-quad, cockpit PFD-MFD-EICAS, trading 3-monitor arc, visionOS Personal Office, Horizon Workrooms Personal Office)
**Mechanism:** Panels world-anchored in a 120° arc around a stationary operator; attention rank encoded by slot position.
**Why it works:** Matches human comfortable head-turn range and trains muscle memory.
**Caveat:** Only works if layout is *stable* (cargo-cult failure if dynamic).

### Four-zone attention budget [evidence: medium]
**Lens tags:** **L1**, L8
**Where seen:** WS-12 (cockpit, ICU, trading, mission control)
**Mechanism:** Information placed by refresh-rate need: primary / working / ambient / deep-dive.
**Why it works:** Matches how foveal + peripheral vision distribute attention.
**Caveat:** Requires the operator to internalise the assignment — training overhead.

### Layered alert priority (paired visual+aural) [evidence: medium]
**Lens tags:** **L8**
**Where seen:** WS-12 (CAS/EICAS, ICU monitors, SCADA per ISA-18.2, NOC dashboards)
**Mechanism:** 4-5 priority tiers, each with a specific colour, animation, sound, and ack-required behaviour.
**Why it works:** Parallel sensory channels reduce miss rate; ack separates "seen" from "resolved".
**Caveat:** Must cap event rate or alarm fatigue takes over.

### Drill-down by content swap (not window proliferation) [evidence: medium]
**Lens tags:** **L3**, L10
**Where seen:** WS-12 (ISA-101 L1→L4, cockpit MFD pages, Bloomberg `<GO>`, NOC site detail)
**Mechanism:** Same panel, different content; back/breadcrumb affordance.
**Why it works:** Preserves spatial recall of where each panel "lives".
**Caveat:** Requires a back/breadcrumb affordance.

### World-anchored over head-anchored [evidence: medium]
**Lens tags:** **L5**
**Where seen:** WS-12 (every Tier-A operations domain + visionOS HIG), WS-02 (Apple/Microsoft/Meta explicit)
**Mechanism:** Panels live at fixed world positions; user's head moves around them.
**Why it works:** Peripheral motion perception needs fixed expected location for changes to be flagged.
**Caveat:** AR users need to be able to *recall and reset* the canonical pose if they wander.

### Shared wall + private console split [evidence: medium]
**Lens tags:** **L12**, L1
**Where seen:** WS-12 (NASA FCR, NOC, power grid, stadium command)
**Mechanism:** Large shared canvas = team consensus, individual workstation = operator's tools.
**Why it works:** Separates "what the team agrees on" from "what I'm doing".
**Caveat:** Requires gestural/voice protocol for moving content between.

### Trends-with-current-value [evidence: medium]
**Lens tags:** **L2**
**Where seen:** WS-12 (cockpit vertical-tape with trend mark, ICU waveform strip + numeric, SCADA mini-trend on every PV), WS-03 (KPI cards with sparkline)
**Mechanism:** Every value display includes a short-term trend.
**Why it works:** Enables Endsley L2 (comprehension) and L3 (projection) directly from a glance.
**Caveat:** Trend window needs to be domain-appropriate.

### Mission-elapsed-time as universal anchor [evidence: medium]
**Lens tags:** **L12**, L8
**Where seen:** WS-12 (NASA, ICU code clock, ATC sector clock)
**Mechanism:** A single, dominant time reference visible from every position.
**Why it works:** Anchors the event log + voice loop + memory recall.
**Caveat:** Timezone confusion if multi-site (mitigate by always using UTC).

### Voice loop as orthogonal coordination channel [evidence: medium]
**Lens tags:** **L12**, L8
**Where seen:** WS-12 (NASA, ATC, NOC bridge calls, OR/ICU handover), WS-11 (Knowledge Navigator script)
**Mechanism:** Continuous verbal narration alongside visual displays.
**Why it works:** Capacity-plus-context that displays cannot carry.
**Caveat:** Requires *role discipline* (only the right people speak on the loop).

### Stable layout enables 5-minute-scan recovery [evidence: medium]
**Lens tags:** **L1**, L3
**Where seen:** WS-12 (cockpit return-from-galley, NOC shift change, ATC sector takeover, ICU shift handover)
**Mechanism:** Every value in the same place every time; user re-enters and rapidly delta-scans against remembered state.
**Why it works:** Enables rapid delta-scan; works because the layout is invariant across sessions.
**Caveat:** Blocks free-form personalisation.

### Named associative trail (Bush) [evidence: medium]
**Lens tags:** **L11**, L1
**Where seen:** WS-11 (Memex, NLS history, Matuschak's notes)
**Mechanism:** Ordered, named sequence of artifacts + reasoning glue.
**Why it works:** Externalizes path-of-thought; re-reading re-walks the reasoning. The 1945 Memex prediction now feasible at LLM-edge-suggestion scale.
**Caveat:** Trails go stale; needs a "still valid?" refresh affordance.

### Transclusion / parallel text [evidence: medium]
**Lens tags:** **L2**, L10
**Where seen:** WS-11 (Xanadu transpointing windows, NLS, modern wikis)
**Mechanism:** Live source-of-B inside A with visible ribbon to origin.
**Why it works:** Kills copy-paste decay; canonical source always visible.
**Caveat:** Requires durable addresses (Xanadu tumbler); URL fragility breaks it.

### Viewspec (Engelbart) [evidence: medium]
**Lens tags:** **L3**, L10
**Where seen:** WS-11 (NLS, partially Workflowy/Tana), WS-04 (saved-explorations are spiritual descendants)
**Mechanism:** Declarative `filter + format + indent + label rules` saved per user, applied to any subtree.
**Why it works:** Same data, many lenses, switchable in O(ms).
**Caveat:** Needs structurally addressable data.

### Active object (Kay) [evidence: medium]
**Lens tags:** **L1**, L11
**Where seen:** WS-11 (Smalltalk, Mathematica notebooks, ObservableHQ)
**Mechanism:** Artifact carries its own behavior; inspect/modify/re-run in place.
**Why it works:** Collapses read/edit/run into one place.
**Caveat:** Uniform object model is hard to retrofit.

### Immediate connection (Victor) [evidence: medium]
**Lens tags:** **L8**, L11
**Where seen:** WS-11 (Inventing on Principle demos, *Learnable Programming*, Dynamicland)
**Mechanism:** Zero-latency, no-hidden-state cause→effect during edit.
**Why it works:** Closes perception-action loop.
**Caveat:** Hard at scale (debounce, expensive compute) — sub-second LLM moves now make this affordable for layout.

### Information-software-first (Magic Ink) [evidence: medium]
**Lens tags:** **L2**, L11
**Where seen:** WS-11 (Magic Ink essay; well-designed dashboards like Tableau, Datadog summaries)
**Mechanism:** Design static graphic for the user's question first; interactivity last resort.
**Why it works:** Graphics scale faster than menus.
**Caveat:** Needs correct inference of user's current question — LLM context now helps.

### Evergreen note as forcing function (Matuschak) [evidence: medium]
**Lens tags:** **L1**, L11
**Where seen:** WS-11 (notes.andymatuschak.org and PKM cohort), WS-05 (Tana, Capacities, Logseq DB)
**Mechanism:** Title-is-claim, atomic, durable, rewritten, densely linked.
**Why it works:** Form coerces data toward concept structure that compounds.
**Caveat:** Years to pay off; hard to bootstrap.

### Calm technology three-tier (Weiser) [evidence: medium]
**Lens tags:** **L8**, L5
**Where seen:** WS-11 (Apple Watch glances, Dynamicland walls, macOS notification center vestigial)
**Mechanism:** Explicit center / focal-periphery / ambient zones; user controls promotion rate.
**Why it works:** Matches human attention biology.
**Caveat:** Discipline required not to escalate everything.

### Room-as-substrate (Dynamicland) [evidence: medium]
**Lens tags:** **L1**, L5
**Where seen:** WS-11 (Dynamicland, IllumiRoom prototypes)
**Mechanism:** Room is the address space; physical arrangement *is* layout state.
**Why it works:** Leverages spatial memory; multi-user free.
**Caveat:** Hardware-heavy, doesn't travel.

### Frame vs Group split [evidence: medium]
**Lens tags:** **L1**, L7
**Where seen:** WS-06 (tldraw canonical)
**Mechanism:** Frame = visual, clipping, has header, exportable; Group = invisible, just makes a selection one selectable thing.
**Why it works:** Covers ~90% of organizational needs with two primitives.
**Caveat:** Naming overlap with the data-flow "frame" — Jarvis already uses Cluster for the visual one.

### Binding endpoints with mode + fixedPoint [evidence: medium]
**Lens tags:** **L1**, L2
**Where seen:** WS-06 (Excalidraw, tldraw)
**Mechanism:** Store endpoints as `{ targetId, mode: 'orbit' | 'inside', fixedPoint: [0..1, 0..1] }`.
**Why it works:** When target moves/resizes, the edge follows; endpoint stays anchored to the right relative spot.
**Caveat:** Two separate data models (tldraw's vs Excalidraw's `boundElements`) — pick one.

### Camera as programmable subsystem with constraints [evidence: medium]
**Lens tags:** **L3**
**Where seen:** WS-06 (tldraw canonical), WS-08 (ChimeraX commands)
**Mechanism:** Camera is an `(x, y, z)` reactive atom you can animate, constrain, lock; agent calls `editor.zoomToBounds(...)`.
**Why it works:** Predictable zoom-to-cursor; agent-actionable.
**Caveat:** Replaces simple OrbitControls with a controller abstraction.

### LOD via style downgrade (not just culling) [evidence: medium]
**Lens tags:** **L4**, L6
**Where seen:** WS-06 (every serious canvas tool)
**Mechanism:** At low zoom, change *what* is drawn (drop shadows, hatch fills, freehand → stroke, sticky-text → solid color), not only *whether*.
**Why it works:** Preserves identity-at-distance better than culling.
**Caveat:** Per-artifact `lodLevel(distance) → 'full' | 'simplified' | 'icon' | 'dot'` requires a renderer-aware mapping.

### Sticky clustering as Layout-agent UX [evidence: medium]
**Lens tags:** **L11**, L7
**Where seen:** WS-06 (Miro AI)
**Mechanism:** "Cluster these by keyword or sentiment": toolbar button, spinner, fade-in animation as clusters form, `#uncategorized` zone for misfits.
**Why it works:** The user gives a verb, the canvas reorganizes — matches Jarvis's current Layout agent.
**Caveat:** Wrapper UX matters; the engine already exists in Jarvis.

### Agent cursor with intent bubble (cursor chat / Talktrack) [evidence: medium]
**Lens tags:** **L8**, L11
**Where seen:** WS-06 (tldraw/FigJam cursor-chat, Miro Talktrack), WS-07 (per-agent depth layer)
**Mechanism:** Cursor in world-space with floating label: "reorganizing cluster A".
**Why it works:** Lowest-cost agent-presence primitive; survives in AR as canonical "where is the agent" indicator.
**Caveat:** Needs label-distance LOD at scale.

### Frames-as-slides for guided narration [evidence: medium]
**Lens tags:** **L3**, L11
**Where seen:** WS-06 (Miro/FigJam Present mode)
**Mechanism:** Turn frames into an ordered slide deck the camera flows through.
**Why it works:** Same primitive as bookmarked Views but ordered — capture "the walkthrough of this research" once, replay.
**Caveat:** Authoring overhead.

### Make Real loop (canvas → preview → mark up → re-generate) [evidence: medium]
**Lens tags:** **L11**, L10
**Where seen:** WS-06 (tldraw Make Real, FigJam AI)
**Mechanism:** The canvas hosts both spec and result; user annotates the result *on the same canvas* to iterate.
**Why it works:** Tight observe-modify loop in the spatial substrate.
**Caveat:** Ingredients exist in Jarvis; needs explicit UX framing.

### Reasoning-thread as spatial primitive [evidence: medium]
**Lens tags:** **L11**, L1
**Where seen:** WS-07 (Jarvis-specific synthesis; lift of trace-tree pattern into 3D), WS-05 (spatial reasoning-trace primitive)
**Mechanism:** Volumetric tube traced from agent-origin → tool-call plates → result; tool calls = beads, errors = red flares, branches = forked tubes.
**Why it works:** Replaces DOM ActivityPanel that does not lift to AR.
**Caveat:** Visual cost at scale — needs ribbon-density LOD.

### Per-agent depth layer (Z = agent identity) [evidence: medium]
**Lens tags:** **L1**, L11
**Where seen:** WS-07 (Jarvis-specific synthesis)
**Mechanism:** Worker / Layout / Listening / Naming each own a parallel plane at `z = -k*agentIndex`; plates start on producer's plane; handoffs become explicit edges.
**Why it works:** Anchored planes are native visionOS; cross-agent handoff becomes visually first-class.
**Caveat:** Z-axis is one channel — competes with depth-as-data uses.

### Attention beam ("waiting on you") [evidence: medium]
**Lens tags:** **L8**
**Where seen:** WS-07 (Claude Code Agent View "waiting on you"), WS-10 (off-screen arrow)
**Mechanism:** On `awaiting_input` event, a 3D beam points from agent's plane to the plate that needs review; voice TTS announces.
**Why it works:** Pulls attention without modal interrupt.
**Caveat:** Rate-limit to avoid spam.

### Intent-ghost plates / ghost-preview [evidence: medium]
**Lens tags:** **L11**, L7
**Where seen:** WS-07 (Copilot Workspace lift), WS-11 (Victor's immediate connection)
**Mechanism:** Before Layout reorganizes, render translucent ghost copies at proposed positions; user can drag-correct then commit.
**Why it works:** Lifts plan-then-execute into 3D; no hidden state between intent and canvas response.
**Caveat:** Adds a confirmation step; streaming agents need staged ghost specs.

### Branch-aware trace [evidence: medium]
**Lens tags:** **L11**, L7, L10
**Where seen:** WS-07 (synthesis — closes the *retry-alternatives* gap seen across the catalog)
**Mechanism:** When an agent retries with different approach, both branches persist: A dim/translucent, B active; user can pin to compare.
**Why it works:** Defeats every observed tool's blind spot of flattening retries.
**Caveat:** Diff visualization in 3D is unexplored.

### Per-agent cost/token HUD [evidence: medium]
**Lens tags:** **L9**, L2
**Where seen:** WS-07 (per-agent depth plane HUD)
**Mechanism:** Floating widget on each agent's depth plane showing tokens / USD / current model.
**Why it works:** Always-on per L8 + power-user need.
**Caveat:** HUD elements compete for one corner — assign owners.

### Workflow-as-DAG export [evidence: medium]
**Lens tags:** **L11**, L12
**Where seen:** WS-07 (ComfyUI-style; convergent move from LangSmith)
**Mechanism:** On trace completion, offer "freeze as workflow" → editable node-graph re-runnable with different inputs.
**Why it works:** Bridges runtime trace → reusable pipeline.
**Caveat:** 2D editor first; lifts later.

### Hierarchical hotbox (compound mark) [evidence: medium]
**Lens tags:** **L7**
**Where seen:** WS-10 (Maya)
**Mechanism:** Multi-direction stroke descends multiple menu levels in one continuous motion.
**Why it works:** Hundreds of commands accessible in ~250ms expert time.
**Caveat:** Only for users who commit.

### Motion parallax as primary depth cue [evidence: medium]
**Lens tags:** **L3**, L5
**Where seen:** WS-01 (Ware, Marriott Immersive Analytics Ch. 2)
**Mechanism:** Small user/camera motion gives strong shape understanding for 3D structures.
**Why it works:** Built-in to mammalian vision; way stronger than stereo.
**Caveat:** Only works when user actually moves; passive 3D doesn't earn it.

### Small multiples [evidence: medium]
**Lens tags:** **L2**, L4
**Where seen:** WS-01 (Tufte, Few), WS-03 (every BI tool, esp. Grafana repeating panels)
**Mechanism:** Repeat the same chart design for many partitions; users learn the design once, read all charts fast.
**Why it works:** Factors out encoding-cognition cost.
**Caveat:** Requires partition-attribute to be *meaningful* and *comparable* across panels.

### Overview-zoom-filter-details mantra (Shneiderman) [evidence: medium]
**Lens tags:** **L3**, L4
**Where seen:** WS-01 (Shneiderman, baked into every modern viz tool)
**Mechanism:** State machine where user always sees an overview first, then narrows.
**Why it works:** Matches the human exploration loop.
**Caveat:** Pure top-down doesn't fit cases where user knows the target and wants direct query.

---

### Weak / single-source patterns

### Structural-gap detection [evidence: weak]
**Lens tags:** **L11**
**Where seen:** WS-05 (InfraNodus)
**Mechanism:** Identify topical clusters with high inter-cluster distance and few bridging nodes; surface as "missing connections."
**Why it works:** Gives user something to *do* with their graph beyond admire it.
**Caveat:** Requires enough text to compute betweenness meaningfully.

### Reveal-on-hover / reveal-on-look [evidence: weak]
**Lens tags:** **L6**, L8
**Where seen:** WS-11 (cinematic JARVIS / Iron Man HUDs)
**Mechanism:** Annotations appear when user gazes at a part.
**Why it works:** Avoids label clutter; on-demand detail.
**Caveat:** Cinematic origin — needs gaze tracking; risk of dwell-trap.

### Contextual zoom — focal grows, periphery dims [evidence: weak]
**Lens tags:** **L3**, L8
**Where seen:** WS-11 (cinematic JARVIS)
**Mechanism:** Focal panel grows; periphery dims and LOD-drops to a status line.
**Why it works:** Single attention channel respected.
**Caveat:** Cinematic vocabulary.

### VR method-of-loci recall lift [evidence: weak]
**Lens tags:** **L1**, L11
**Where seen:** WS-01 (Krokos 2019, 2022 VR replications; AIP 2024 study)
**Mechanism:** Spatial memory + visual richness of 3D scenes anchors abstract information; recall improves ~20-30% over 2D.
**Why it works:** Hippocampal place-cell encoding is engaged.
**Caveat:** Works for *non-spatial* facts; doesn't help when underlying task is itself spatial.

### Voice-with-name-as-attention-token [evidence: weak]
**Lens tags:** **L7**, L8
**Where seen:** WS-11 (cinematic JARVIS "JARVIS, run diagnostics")
**Mechanism:** Wake-word names the agent; agent narrates results.
**Why it works:** Mirrors Siri/Alexa convention.
**Caveat:** Confusion at >2 agents — distinct voices needed.

### Two-handed pinch-pull-apart scale [evidence: weak]
**Lens tags:** **L7**
**Where seen:** WS-11 (cinematic JARVIS — Stark explodes a blueprint)
**Mechanism:** Two-handed scale on any cluster; pinch-drop = drill in; flick-away = dismiss.
**Why it works:** Maps to existing AR pinch gestures.
**Caveat:** Needs hand-tracking precision; arm fatigue.

### Three-tier attention zoning per panel (ambient stripe) [evidence: weak]
**Lens tags:** **L8**, L5
**Where seen:** WS-11 (synthesized from Weiser + visionOS HIG)
**Mechanism:** Every panel gets an ambient stripe (low-priority status, agent thinking); promotion by gaze/click; voice for *interrupt-class* only.
**Why it works:** Calm-computing applied to spatial UI.
**Caveat:** New primitive — needs prototyping.

### Time-scrubber on reasoning trace [evidence: weak]
**Lens tags:** **L11**, L3
**Where seen:** WS-05 (synthesis), WS-07 (trace observability)
**Mechanism:** Drag a slider to replay agent moves over time; ghost-fade older steps.
**Why it works:** Spatial + temporal navigation of agent reasoning.
**Caveat:** Long sessions need event-log compaction; AR equivalent unexplored.

---

## Notes on consolidation

**Patterns that DID merge across briefs:**
- "Linked highlighting" / "Brushing-and-linking" / "Cross-filter" / "Coordinated views" → one entry (**Coordinated multiple views with linked highlighting**).
- "World-anchored UI" / "Body-lock with lazy-follow" / "Stable layout for 5-min scan" → kept as two entries because the *mechanism* differs (lazy-follow is a body-locked motion model; stable-layout is a world-anchored design discipline). They are sibling patterns within L5.
- "Hierarchical LOD" / "Brackets at distance" / "Subnetwork dive-in" / "Aggregation as a different mark" → kept as separate entries because each names a *different LOD strategy* (label-thin vs subgraph-collapse vs mark-replacement). Brought together under the L4 index.
- "Linked editor+graph+backlinks (PKM)" / "Multi-pane composition (BI)" / "Tiled multi-agent grid" → kept as separate entries because the *substrate count* differs (3 vs N vs N), but cross-referenced.
- "Saved Exploration" / "Saved selections" / "Bookmark / Story Point" / "Workspaces / saved layouts" / "Viewspec" → merged into **Saved Exploration / View-as-document**, with "Bookmark / Story Point state-machine" kept as a separate entry because of its *narrative* dimension (next/prev navigator), and "Algebraic named selections" because it's a query primitive not a state snapshot.
- "Agent cursor" / "Cursor chat / Talktrack" → one entry (**Agent cursor with intent bubble**).

**Patterns that DID NOT merge but look similar:**
- "Center-of-rotation tracking" and "Focus-pivot camera" — kept separate. Center-of-rotation is the *invariant* (orbit pivot binds to selection centroid); focus-pivot adds the *animation* (selected item smoothly moves to scene center). Implementations frequently ship one without the other.
- "Action as first-class" and "Plan-then-execute stepper" — kept separate. Action is a *typed mutation registry*; plan-then-execute is a *interaction pattern over multiple actions*.
- "Default cross-filter / cross-highlight" and "Cascading filters with explicit scope" — kept separate. Cross-filter is *implicit-on-selection*; cascading filters is *authored widget chain*.

---

## Cross-pattern observations

1. **L5 anchoring is the cleanest "must-have" cluster.** Five strong/medium patterns (World/Hand/Head anchor; Body-locked lazy-follow; OCPA; World-anchored over head-anchored; Window/Volume/Immersive triad) all converge on the same insight: encode anchor as a first-class property of every artifact, refuse head-anchor for any long-lived content, default to world-anchor for data and hand-anchor for controls. WS-02 + WS-12 + WS-01 all agree.

2. **L11 process visualization has weak vocabulary in 3D.** Every WS-07 trace pattern (collapsible block, hierarchical tree, plan-then-execute, etc.) is a 2D DOM pattern. The 3D-specific lifts (reasoning-thread, per-agent depth layer, attention beam, ghost preview) all came from synthesis, not from a shipping product. **This is the largest open problem the Jarvis design must solve from first principles.**

3. **Typed substrate (L1+L2+L9+L11) is the largest underlying force-multiplier.** Typed-graph substrate + Typed objects/supertags + Two-layer color (type+state) + Action as first-class + Pin-based directionality + Typed colored ports + OAG all stack: once artifacts and edges are typed, every other pattern (Search Around, Algebraic selections, Saved Explorations, Blast-radius, Cross-filter) becomes cheaper to implement and to author.

4. **The "linked views" lens (L10) is the most mature.** 8 strong + 3 medium patterns. Every pattern is well-documented and shipping in production. The 3D adaptation question is the chief open one: dim-vs-displace, scope-region-visualization, side-by-side composition in space.

5. **Three patterns appear in ≥5 workstreams** and constitute the catalog's "load-bearing" set: **Coordinated multiple views with linked highlighting** (WS-01, 03, 04, 05, 08, 10, 12 — 7 WS), **No-unjustified-3D** (WS-01, 03, 05, 08, 10, 12 — 6 WS), **Typed-graph substrate** (WS-04, 05, 08, 09 — 4 WS plus ontological echoes in 01 and 11). Any product doc that violates these is fighting the largest consensus in the corpus.
