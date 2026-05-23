# Anti-Pattern Catalog

**Coverage:** 12 workstreams, ~45 source anti-patterns extracted, deduplicated to **42 unique entries**.

This catalog is the deduplicated cross-workstream consolidation of the `## Anti-patterns observed` sections of WS-01..12. Each entry records every workstream it appeared in, the consensus failure mode, and where Jarvis's current or planned design risks tripping the same trap.

**⚠ Watch tag:** Applied where the anti-pattern *directly contradicts* something Interactive Jarvis is doing or considering doing. The current Jarvis architecture (per `~/.claude/plans/eager-imagining-piglet.md` and recent commits) leans toward:
- 3D spatial canvas (plates, edges, clusters)
- Multi-agent reasoning with visible traces
- LLM-driven layout reorganization
- Future HUD-style activity panels and AR migration
- Plate-card uniform visual language (color/size/glow)

So watch items concentrate around: head-anchored elements, unjustified 3D, agent-driven re-layout (change-blindness), multi-agent message noise, and color-channel collisions.

Evidence rating uses the Tier A/B/C system defined in `00-lens-and-scope.md` §0.5.

---

## Index by lens

- **L1 (Spatial primitives):** Volumes-as-windows-with-3D-inside; "Just infinite canvas"; Cargo-cult monitor sprawl; Wall-of-spaghetti; Diegetic-everything purism.
- **L2 (Data → form):** 3D bar/pie/line charts; Decorative depth in steady-state; Particle/swarm effects on data; Always-spinning orbital widgets; One form per data type.
- **L3 (Camera & navigation):** Free-fly camera in abstract VR; Modal pan vs select; Sudden artificial camera motion; Camera orbit around static origin; Free-form dashboard editing in operations.
- **L4 (LOD):** Brackets without LOD; Pure pan-zoom above ~200 nodes; "Hairball" force-directed at scale; Edge labels always-on at scale; Drill-through with no obvious affordance.
- **L5 (Anchoring):** 1:1 head-locked HUD; Head-anchored primary content; Implicit re-anchoring on head motion; Static front-facing content during user movement; Content nearer than 40 cm; High depth budget (>1m moving 25%+ of session); Off-axis gaze >10° above / >60° below horizon.
- **L6 (Labels & legends):** Label-thrash (always-on labels); Extruded 3D text; Edge labels always-on at scale.
- **L7 (Selection & group operations):** Mixing interaction models in one session; Hand menus with >3 buttons; 30-item context menu; Selection silently bleeds into filter; Sticky modal that user can't escape.
- **L8 (Attention flow):** Conjunction-cue notifications; Snap-transition state change; Notifications instead of periphery; Pane proliferation without attention; Always-on dense HUD; Alarm flood / undifferentiated event stream; HUD elements competing for one corner.
- **L9 (Color system):** Three-color overload on a single node; All-edges-look-identical; Color-by-folder-only; Single global color scale; Sticky-color = team convention.
- **L10 (Inter-view linking):** Cross-filter cascades that don't terminate / loop; Drill-through with no obvious affordance; "Story" as linear-only; Lineage and run-history in separate tabs; >9 KPI cards per dashboard.
- **L11 (Process / reasoning representation):** Trusting LLM spatial reasoning at scale; Trace tree at depth 10+; Hiding the reasoning entirely; Streaming chat as primary multi-agent UI; Branch/retry loss; Missing or hidden reasoning trace; Auto-layout that re-flows on every interaction; AI grafted onto chat, decoupled from graph; Force-directed layout treated as ground truth; Imperative scripting required for routine charts; Hidden state during edit; Black-box automation; Programmability gated by a "real" language.
- **L12 (Multi-user, sharing, persistence):** Bookmark fragility; JSON-only sharing without environment; Graph in a tab.

---

## Index by evidence strength

- **Strong (12):** 1:1 head-locked HUD; 3D bar/pie/line charts in abstract data; Label-thrash (always-on labels); Snap-transition state change; "Hairball" force-directed at scale; Edge labels always-on at scale; Trace tree at depth 10+; Trusting LLM spatial reasoning at scale; Alarm flood / undifferentiated event stream; Auto-layout that re-flows on every interaction; Always-on dense HUD; Color-by-folder-only.
- **Medium (22):** Conjunction-cue notifications; Implicit re-anchoring on head motion; Free-fly camera in abstract VR analytics; Extruded 3D text; Mixing interaction models in one session; Hand menus with >3 buttons; Content nearer than 40 cm; High depth budget; Volumes-as-windows-with-3D-inside; Cross-filter cascades that don't terminate; >9 KPI cards per dashboard; Decoration over data; Drill-through with no obvious affordance; Bookmark fragility; "Story" as linear-only; Three-color overload on a single node; Pure pan-zoom above ~200 nodes; Selection silently bleeds into filter; Wall-of-spaghetti; JSON-only sharing without environment; Loose-typed everything-is-context; Auto-layout destroys author intent; Lineage and run-history in separate tabs; Hiding the reasoning entirely; Streaming chat as primary multi-agent UI; Branch/retry loss; Pane proliferation without attention; Graph in a tab; All-edges-look-identical; Decorative 3D; AI grafted onto chat decoupled from graph; Force-directed layout treated as ground truth; Cargo-cult monitor sprawl; Head-anchored primary content; Free-form dashboard editing in operations; Missing or hidden reasoning trace; Off-axis gaze excess; Static front-facing content during user movement; 30-item context menu; Sticky modal that user can't escape; HUD elements competing for one corner; Brackets without LOD; Cybersickness from mode-switching; Diegetic-everything purism; Gesture-heavy onboarding; "Just infinite canvas" with no structure; Modal pan vs select; Sticky-color = team convention; Bounded canvas misrepresented as infinite; Hidden state during edit; One form per data type; Notifications instead of periphery; Trail as single back-button stack; Programmability gated by a "real" language; Imperative scripting required for routine charts; Single global color scale; 3D position used for abstract data when intrinsic geometry exists; Camera orbit around a static origin.
- **Weak (8):** Off-axis gaze excess (single-vendor source); Sudden artificial camera motion as default; HyperCard-style "real language" requirement; Holographic transparency cascade (cinematic); Particle/swarm effects on data points; Curved/domed displays; Always-spinning orbital widgets; Cybersickness from mode-switching without fade.

*(Note: many anti-patterns gain "strong" status across WS even when each vendor-source is medium-tier alone, because the same failure mode reappears under different vocabularies.)*

---

## Anti-patterns

Sorted strong → medium → weak; within tier, ordered by primary lens.

---

### Strong anti-patterns

### 1:1 head-locked HUD ⚠ Watch [evidence: strong]
**Lens tags:** **L5**, L8
**Where seen:** WS-02 (Microsoft explicit ban, Apple lazy-follow, Meta avoid), WS-12 (HUD literature, visionOS HIG), WS-10 (Always-on dense HUD failure mode in WoW)
**Failure mode:** Locks user's eyes to a fixed offset that doesn't update with stereo focus → vergence-accommodation conflict + nausea. Breaks spatial recall and triggers attentional tunneling.
**Mitigation:** Body-lock with rotation threshold (lazy-follow). World-anchor whenever the content persists >3 seconds.
**Jarvis watch:** Current activity panels are screen-edge-anchored (DOM). Any future "HUD-style" activity ticker or attention beam must NOT be head-locked in AR — must be world or body-locked with lazy-follow. Mark as `anchor: never-head` for anything long-lived.

### 3D bar/pie/line charts in abstract data ⚠ Watch [evidence: strong]
**Lens tags:** **L2**, L4
**Where seen:** WS-01 (Munzner, Few), WS-03 (Tufte), WS-05 (Obsidian 3D Graph plugin), WS-08 (3D position for abstract data), WS-10 (decorative depth in Cyberpunk steady-state), WS-12 (immersive analytics demos)
**Failure mode:** The third dimension demotes a position-on-common-scale channel to volume-with-occlusion. Loses accuracy, gains nothing.
**Mitigation:** Reserve 3D for *layout* (spatial arrangement of cards). Inside any chart-panel artifact use 2D encoding. Add a "no unjustified 3D" check to Layout-agent prompt.
**Jarvis watch:** Jarvis IS a 3D canvas — the rule applies *inside* the future chart/flow-panel artifact kind, not to the canvas as a whole. Bake into the future Visual Language doc.

### Label-thrash (always-on labels on every mark) ⚠ Watch [evidence: strong]
**Lens tags:** **L6**, L4
**Where seen:** WS-01 (Ware), WS-05 (Obsidian large-vault threads), WS-08 (per-class label thinning needed), WS-10 (Brackets without LOD)
**Failure mode:** Always-on labels on every mark with no occlusion-aware placement. Pixel-cost grows quadratically with item count; users tune them out.
**Mitigation:** Per-class label distance + occlusion-aware repositioning. Aggregate ≥4 overlapping into "+N" badge. Use `troika-three-text` not DOM `<Html>` for AR survivability.
**Jarvis watch:** Current Artifact card uses always-on label. At 200+ artifacts this will visibly fail. Build per-kind `labelDistance: { full, abbreviated, hidden }` policy now.

### Snap-transition state change ⚠ Watch [evidence: strong]
**Lens tags:** **L8**, L11
**Where seen:** WS-01 (Heer & Robertson 2007), WS-06 (canvas tools — tldraw uses tweens; instant-rebuild fails)
**Failure mode:** Instant rebuild of a view between two states; change-blindness rules; user can't tell what moved or where things went.
**Mitigation:** 800-1500ms animated tween with semantic bundling preserving object identity across the change.
**Jarvis watch:** Layout agent's `apply_layout_plan` is the highest-risk surface. Confirm `renderer/src/scene/live-transforms.ts` enforces a minimum tween duration. Don't ship "instant snap" reorganize.

### "Hairball" force-directed at scale [evidence: strong]
**Lens tags:** **L4**, L9
**Where seen:** WS-05 (universal PKM failure mode), WS-08 (Cytoscape warns >1000 nodes uninterpretable), WS-04 (Pure pan-zoom above ~200 nodes)
**Failure mode:** Force-directed layout converges into an unreadable knot; users mistake physics artifacts for meaning.
**Mitigation:** Switch to aggregation, hierarchical subgraphs, or community-detection layout above ~200 nodes. Per WS-09: at 50 nodes a section must be subnetted or framed.
**Jarvis watch:** With multi-agent activity producing many artifacts, this is a real risk. Hard render cap at ~200, aggregate the rest into meta-nodes per cluster.

### Edge labels always-on at scale [evidence: strong]
**Lens tags:** **L6**, L4
**Where seen:** WS-04 (every graph tool that defaults to always-on edge labels reverts to hover-only within a release cycle — early Neo4j Bloom, naive force-directed PoCs), WS-05 (all-edges-look-identical PKM failure)
**Failure mode:** Edge labels create visual mud; users can't read individual relationships.
**Mitigation:** Hover-only edge labels; color/lineStyle per typed edge for at-distance read; show full label only on selection or focus.
**Jarvis watch:** Edge typing (4 kinds today, more after Link-Type schema) needs color/style differentiation per kind, with labels on hover only.

### Trace tree at depth 10+ [evidence: strong]
**Lens tags:** **L11**
**Where seen:** WS-07 (every observability tool breaks visually past depth 6-10 — LangSmith, Langfuse, Phoenix)
**Failure mode:** Indentation eats horizontal space, labels truncate, expand-all is unusable.
**Mitigation:** Hierarchical collapse + summary nodes; or visual lift to 3D (reasoning-thread tube).
**Jarvis watch:** Current ActivityPanel is a flat list — already degraded form. Plan a 3D reasoning-thread primitive before sessions hit deep nesting.

### Trusting LLM spatial reasoning at scale ⚠ Watch [evidence: strong]
**Lens tags:** **L11**
**Where seen:** WS-01 (Stuck in the Matrix arXiv:2510.20198, Spatial-DISE arXiv:2510.13394)
**Failure mode:** Current LLMs lose 42-84% accuracy as grids grow; layout decisions must be checked, not blindly applied.
**Mitigation:** Instrument the Layout agent's success rate on increasingly dense canvases; add deterministic post-checks (cluster-overlap cost, depth-budget cost) to filter LLM plans.
**Jarvis watch:** The Layout agent already produces JSON plans — keep the cost-function gate in `electron/main/agents/layout/cost.ts`. Don't remove the human-readable plan + manual approve path.

### Alarm flood / undifferentiated event stream ⚠ Watch [evidence: strong]
**Lens tags:** **L8**
**Where seen:** WS-12 (ICU alarm fatigue, SCADA pre-ISA-18.2), WS-07 (Pane proliferation without attention; users with 8 tiles open miss completions), WS-11 (Notifications instead of periphery — Weiser violation)
**Failure mode:** Every change surfaced as a notification → operators desensitise → real alerts get missed.
**Mitigation:** 4-5 priority tiers (Info/Caution/Warning/Emergency) with paired visual+aural cues, ack-required behaviour, cap on simultaneous events with "+N more" badge.
**Jarvis watch:** With 4+ agents producing events (Worker, Layout, Listening, Naming), the ActivityPanel risks becoming an alarm flood. Implement tiered alerting before adding more agent kinds.

### Auto-layout that re-flows on every interaction ⚠ Watch [evidence: strong]
**Lens tags:** **L11**, L8
**Where seen:** WS-04 (Vertex's six layout options are *user-triggered*, never automatic on every node addition), WS-09 (n8n aggressive reflow jarring for branchy DAGs), WS-06 (canvas tools require explicit camera tweens to defeat change-blindness)
**Failure mode:** User trains their spatial memory to a layout; auto-reflow erases it; user disoriented mid-thought.
**Mitigation:** Auto-layout on user request only; never silently reflow. When agent reorganizes, use animated transitions with semantic bundling (800-1500ms).
**Jarvis watch:** Layout agent is the entire risk surface. Recent commits (2804e71) already moved to single-call reorganize; ensure the trigger is user-initiated or coalesced across many small events, never per-event.

### Always-on dense HUD ⚠ Watch [evidence: strong]
**Lens tags:** **L8**, L1
**Where seen:** WS-10 (WoW default UI, Star Citizen default cockpit), WS-12 (Head-anchored primary content)
**Failure mode:** Users start ignoring it; HUD elements compete for one corner; visual mud.
**Mitigation:** Fade non-essentials, demand-on-hover, configurable density (ElvUI pattern). Each corner one "owner" system.
**Jarvis watch:** Multiple panels (InputBar, LayoutActivityPanel, future Clusters panel) are competing for screen edges. Document panel-ownership-by-region in the docs/product/INTERACTION-LANGUAGE.md before adding more.

### Color-by-folder-only ⚠ Watch [evidence: strong]
**Lens tags:** **L9**
**Where seen:** WS-05 (Obsidian Graph default; the canonical "least informative axis" failure), WS-04 (Three-color overload on a single node)
**Failure mode:** Burns the single most valuable visual channel on the least informative axis (folder = grouping convention, not semantic).
**Mitigation:** Two-layer color (type + state) as the discipline; reserve color for what matters. Document in docs/product/VISUAL-LANGUAGE.md.
**Jarvis watch:** Today every plate is monochrome. When color is introduced, do NOT bind it to folder/cluster — bind to artifact kind (categorical) + state (overlay). Confidence/recency stays text-only.

---

### Medium-evidence anti-patterns

### Conjunction-cue notifications [evidence: medium]
**Lens tags:** **L8**
**Where seen:** WS-01 (Healey & Enns)
**Failure mode:** "Red AND blinking" assumes pop-out but conjunctions require serial search. Users miss the alert.
**Mitigation:** One preattentive channel per call-out (hue OR motion OR luminance OR size — never combined).
**Jarvis note:** Watch the Layered alert priority pattern — paired visual+aural is fine (different channels, not a conjunction of one channel); paired hue+motion is not.

### Implicit re-anchoring on head motion ⚠ Watch [evidence: medium]
**Lens tags:** **L5**
**Where seen:** WS-02 (Shin 2024 situated analytics survey), WS-12 (World-anchored over head-anchored)
**Failure mode:** Panel quietly migrates from world-anchored to head-anchored when user turns; users lose track of where things are.
**Mitigation:** Anchor switches must be explicit, never automatic.
**Jarvis watch:** Future AR migration — design anchor transitions as user-summoned, not motion-triggered.

### Free-fly camera in abstract VR analytics ⚠ Watch [evidence: medium]
**Lens tags:** **L3**, L5
**Where seen:** WS-01 (Marriott Immersive Analytics)
**Failure mode:** Users disoriented within 2 minutes; comfort breaks.
**Mitigation:** Teleport-to-target as comfort baseline; smooth as opt-in; vignette during motion.
**Jarvis watch:** OrbitControls today; ensure the camera abstraction includes teleport + viewpoint-snap modes for future AR.

### Extruded 3D text ⚠ Watch [evidence: medium]
**Lens tags:** **L6**
**Where seen:** WS-02 (Microsoft Typography: "extruded text tends to degrade readability"; Meta Comfort: "avoid text with depth treatments")
**Failure mode:** Stereo disparity on letterforms thrashes the reader's accommodation.
**Mitigation:** Always flat text on a 2D plane in 3D space.
**Jarvis watch:** When porting label-rendering from DOM to AR-ready text (troika-three-text), ensure text mesh is single-plane.

### Mixing interaction models in one session [evidence: medium]
**Lens tags:** **L7**
**Where seen:** WS-02 (Microsoft Interaction Fundamentals)
**Failure mode:** Competing affordances; user can't tell which input the system is listening to (hand ray + head-gaze cursor both active).
**Mitigation:** Pick one model per app, document transitions if needed.
**Jarvis note:** Desktop = pointer + keyboard; AR = gaze-pinch primary, hand-ray fallback. Never both in one session.

### Hand menus with >3 buttons [evidence: medium]
**Lens tags:** **L7**
**Where seen:** WS-02 (Microsoft Hand Menu — 5 explicit anti-pattern placements)
**Failure mode:** Hand tracking jitter from overlapping hands, arm fatigue, accidental Home-button activation.
**Mitigation:** 1×3 ulnar-palm layout; world-lock if more controls needed.
**Jarvis note:** Future hand-menu surface limited to 3 actions ("focus agent / save view / call layout").

### Content nearer than 40 cm [evidence: medium]
**Lens tags:** **L5**
**Where seen:** WS-02 (Microsoft Comfort)
**Failure mode:** VAC discomfort grows exponentially as distance shrinks.
**Mitigation:** Fade-out 30-40 cm, clip plane at 30 cm.

### High depth budget — content inside 1m moving >25% of session [evidence: medium]
**Lens tags:** **L5**
**Where seen:** WS-02 (Microsoft Comfort)
**Failure mode:** Cumulative VAC fatigue.
**Mitigation:** Add a depth-budget telemetry counter; refuse to anchor frequent-update content close.

### Volumes used as "windows with 3D objects inside" [evidence: medium]
**Lens tags:** **L1**, L5
**Where seen:** WS-02 (Apple visionOS explicit)
**Failure mode:** Breaks the user's mental model that Volumes are inspectable from any angle; UI controls inside a Volume are unreachable from the back.
**Mitigation:** Volume = 3D inspectable object; Window = 2D panel. Don't mix.

### Cross-filter cascades that don't terminate / loop [evidence: medium]
**Lens tags:** **L10**
**Where seen:** WS-03 (Power BI lets you create cycles where A filters B filters A)
**Failure mode:** Rendering thrashes; undefined or wrong filter context.
**Mitigation:** Tableau guards against cycles in its action order rules; build acyclic-check into any Jarvis Action-graph.

### >9 KPI cards per dashboard [evidence: medium]
**Lens tags:** **L10**, L8
**Where seen:** WS-03 (Few warned in 2006; ignored by 2026 dashboard designers)
**Failure mode:** Nothing stands out; users scan top-left and miss the rest.
**Mitigation:** Cap dashboard tiles; use small-multiples instead of many distinct tiles.
**Jarvis note:** Applies to the future chart-panel artifact-kind. The free-form canvas is exempt, but any single dashboard-Frame inside Jarvis should respect this cap.

### Decoration over data (Tufte data-ink violation) [evidence: medium]
**Lens tags:** **L2**, L9
**Where seen:** WS-03 (gradient backgrounds, 3D bars, drop shadows, gauge skeuomorphism — resurgent with "AI-generated theming")
**Failure mode:** Visual clutter, attention competes with data.
**Mitigation:** Default themes lean simpler; reject ornamental gradients/shadows on data marks.

### Drill-through with no obvious affordance [evidence: medium]
**Lens tags:** **L10**, L7
**Where seen:** WS-03 (Power BI drill-through discoverable only via right-click)
**Failure mode:** Users never find it.
**Mitigation:** Click-eager menu (Metabase pattern) over right-click-only.

### Bookmark fragility [evidence: medium]
**Lens tags:** **L12**, L10
**Where seen:** WS-03 (Power BI bookmarks freeze visual-list + filter state; adding a visual silently hides or breaks)
**Failure mode:** Authors discover this in production.
**Mitigation:** Bookmarks should be predicates over current state, not ID lists. Use saved-selections-as-queries pattern.

### "Story" as linear-only [evidence: medium]
**Lens tags:** **L11**, L3
**Where seen:** WS-03 (Tableau Stories assume viewer reads in order)
**Failure mode:** Non-linear exploration is forced through bookmarks the author may not have built.
**Mitigation:** Frames-as-slides should be optional / branching, not the only navigation primitive.

### Three-color overload on a single node ⚠ Watch [evidence: medium]
**Lens tags:** **L9**
**Where seen:** WS-04 (Foundry chart docs warn against)
**Failure mode:** Adding a third orthogonal color scale (recency on top of type+state) makes nodes uninterpretable.
**Mitigation:** Two-layer color discipline (type + state, no third channel for color); confidence/recency in text badges only.
**Jarvis watch:** When color is added to plates, bake this into VISUAL-LANGUAGE.md.

### Pure pan-zoom above ~200 nodes [evidence: medium]
**Lens tags:** **L4**
**Where seen:** WS-04 (ComfyUI 2025 Subgraphs shipped because workflows hit the wall; same lesson in early Airflow DAG views)
**Failure mode:** Without hierarchical abstraction, the canvas becomes unnavigable.
**Mitigation:** Hierarchical subgraph / dive-in-dive-up mandatory above ~200 nodes.

### Selection silently bleeds into filter [evidence: medium]
**Lens tags:** **L7**, L10
**Where seen:** WS-04 (most BI tools; Palantir strict separation is rare and correct)
**Failure mode:** Conflation breaks the user's ability to navigate while preserving constraint.
**Mitigation:** Keep selection state distinct from filter state. Explicit "promote selection to filter" affordance.

### Wall-of-spaghetti [evidence: medium]
**Lens tags:** **L1**, L4
**Where seen:** WS-09 (naive ComfyUI workflows, undisciplined Unreal Blueprints — hundreds of crossing wires)
**Failure mode:** Cause: no sub-network discipline + no named reroute + no frames.
**Mitigation:** Enforce a "collapse threshold" — at 50 nodes a section *must* be subnetted or framed.

### JSON-only sharing without environment [evidence: medium]
**Lens tags:** **L12**
**Where seen:** WS-09 (ComfyUI, LangFlow, Flowise — workflow file references custom-nodes / models by name)
**Failure mode:** Receiver has different installed versions.
**Mitigation:** Package environment alongside (Comfy Deploy pattern); pin custom-node versions in the workflow.

### Loose-typed everything-is-context [evidence: medium]
**Lens tags:** **L9**, L2
**Where seen:** WS-09 (LangFlow / Flowise port system can't catch most errors at edit time)
**Failure mode:** Errors only surface at runtime.
**Mitigation:** Type-tag every port (TouchDesigner trade-off: more bridge nodes, fewer runtime errors).

### Auto-layout destroys author intent [evidence: medium]
**Lens tags:** **L11**, L3
**Where seen:** WS-09 (n8n aggressive left-to-right reflow), WS-04 (Vertex layout options user-triggered only)
**Failure mode:** Artists almost never use "Layout Selected" after the first time.
**Mitigation:** Auto-layout on user request only; never silently reflow.

### Lineage and run-history in separate tabs [evidence: medium]
**Lens tags:** **L10**, L11
**Where seen:** WS-04 (dbt before Cloud Explore — splits the user's mental model)
**Failure mode:** User must mentally join the two views.
**Mitigation:** Dagster's unified asset graph + materialization timeline is the better pattern.

### Hiding the reasoning entirely ⚠ Watch [evidence: medium]
**Lens tags:** **L11**
**Where seen:** WS-07 (ChatGPT o1 originally hid raw CoT; users complained the model "felt unreliable" because they couldn't audit it), WS-11 (Black-box automation in cockpits — well-known incident pattern)
**Failure mode:** Users distrust opaque agents.
**Mitigation:** Always-inspectable reasoning trace; the summarized middle ground was a compromise, not the right answer for power users.
**Jarvis watch:** Keep `ActivityPanel` first-class. Nelson's "down with cybercrud" as a design constraint.

### Streaming chat as primary multi-agent UI ⚠ Watch [evidence: medium]
**Lens tags:** **L11**
**Where seen:** WS-07 (once N>2 agents emit interleaved messages, the chat becomes unreadable; AutoGen Studio "profiler" view exists precisely because the chat view fails)
**Failure mode:** Interleaved messages from 4+ agents form unreadable streams.
**Mitigation:** Per-agent depth layer (Z=identity) or per-agent pane; never one merged log.
**Jarvis watch:** ActivityPanel current architecture risks this. Move to per-agent grouping before scaling to 4+ agents.

### Branch/retry loss [evidence: medium]
**Lens tags:** **L11**
**Where seen:** WS-07 (every tool that traces reasoning *flattens* alternate attempts — a systemic blind spot)
**Failure mode:** User never sees "the agent tried X, failed, retried Y."
**Mitigation:** Branch-aware trace with both branches persisted (dim/active).
**Jarvis note:** No current tool does this well — opportunity.

### Pane proliferation without attention [evidence: medium]
**Lens tags:** **L8**, L1
**Where seen:** WS-07 (Cursor users with 8 tiles open report missing completions)
**Failure mode:** Tiles solve "where to look" only if you know which tile to look at; no tool has solved this.
**Mitigation:** Combine tile grid with attention-beam pointing to the active tile.

### Graph in a tab ⚠ Watch [evidence: medium]
**Lens tags:** **L10**, L1
**Where seen:** WS-05 (Obsidian, Logseq, Roam — treating the graph as a sibling view to the editor guarantees it gets opened once, admired, then closed forever)
**Failure mode:** Once the editor has focus, the graph is dead weight.
**Mitigation:** Make the graph the primary substrate; don't relegate it to a tab.
**Jarvis note:** Jarvis is graph-primary by design — already aligned. Don't introduce a "graph view" toggle.

### All-edges-look-identical [evidence: medium]
**Lens tags:** **L9**, L2
**Where seen:** WS-05 (every PKM tool except Kumu and Bloom)
**Failure mode:** Erases the semantic difference between "I cited this once in passing" and "this is the foundational reference."
**Mitigation:** Color + lineStyle per typed edge kind.
**Jarvis note:** Already type 4 edge kinds; needs visual differentiation.

### Decorative 3D (visual flourish) [evidence: medium]
**Lens tags:** **L2**, L1
**Where seen:** WS-05 (Obsidian 3D Graph plugin and similar demos — users return to 2D within a session), WS-11 (cinematic JARVIS holographic transparency / particle effects)
**Failure mode:** 3D rotation work without semantic depth.
**Mitigation:** 3D must encode something meaningful (axis = layer / time / cluster). If not, use 2D.

### AI grafted onto chat, decoupled from graph [evidence: medium]
**Lens tags:** **L11**, L10
**Where seen:** WS-05 (Tana, TheBrain, Smart Connections)
**Failure mode:** AI's reasoning never appears spatially; it lives in a text panel that ignores the graph's structure.
**Mitigation:** Agent moves must be visible in the spatial canvas (cursor with intent bubble, reasoning thread, attention beam).
**Jarvis note:** Already partially aligned — Layout agent's moves animate on the canvas. Extend to Worker and other agents.

### Force-directed layout treated as ground truth [evidence: medium]
**Lens tags:** **L11**, L4
**Where seen:** WS-05 (physics convergence is mistaken for meaning — universal PKM failure)
**Failure mode:** Positions are arbitrary; users mistakenly read clusters that are physics artifacts.
**Mitigation:** Either supplement with community detection (Louvain) and color-by-community, or label the layout as physics-only.

### Cargo-cult monitor sprawl ⚠ Watch [evidence: medium]
**Lens tags:** **L1**
**Where seen:** WS-12 (6+ monitors without a layout principle — Bloomberg, NOC, trader blogs)
**Failure mode:** Time to *locate* a panel exceeds the time to *read* it.
**Mitigation:** Stable horseshoe layout with assigned slots; refuse to add a 7th panel without reassigning one.
**Jarvis watch:** Future console mode must enforce slot-assignment, not free-placement.

### Head-anchored primary content ⚠ Watch [evidence: medium]
**Lens tags:** **L5**, L8
**Where seen:** WS-12 (HUD-style overlay for important data — visionOS HIG)
**Failure mode:** Breaks spatial recall and triggers attentional tunneling.
**Mitigation:** World-anchor everything that lives > 3 seconds. Head-anchor only for transient mode indicators / wayfinding hints.

### Free-form dashboard editing in operations [evidence: medium]
**Lens tags:** **L3**, L12
**Where seen:** WS-12 (BI failure modes, control-room ergonomics — drag-anywhere panels that change layout per-user / per-session)
**Failure mode:** Breaks training, handover, and the 5-minute scan.
**Mitigation:** Saved consoles (named layouts); user customization is per-saved-console, not per-session.

### Missing or hidden reasoning trace ⚠ Watch [evidence: medium]
**Lens tags:** **L11**, L8
**Where seen:** WS-12 (black-box automation in cockpits; well-known in airline incidents)
**Failure mode:** Operator perceives the change but doesn't know what caused it — breaks Endsley L2 (comprehension) layer of situation awareness.
**Mitigation:** Always-on reasoning trace tied to the visual change.
**Jarvis watch:** Layout agent already emits trace; ensure it's visible alongside every reorganize, not in a separate tab.

### Off-axis gaze excess [evidence: medium]
**Lens tags:** **L5**
**Where seen:** WS-02 (Microsoft Comfort: >10° above / >60° below horizon, or neck rotation >45° off-center)
**Failure mode:** Ergonomic neck strain over a session.
**Mitigation:** Layout-agent must score artifact positions against a comfort cone.

### Static front-facing content during user movement [evidence: medium]
**Lens tags:** **L5**
**Where seen:** WS-02 (Magic Leap 2 explicit warning)
**Failure mode:** Obstructs environment; degrades situational awareness.
**Mitigation:** Body-locked with lazy-follow if it must travel with user; otherwise world-locked.

### 30-item context menu [evidence: medium]
**Lens tags:** **L7**
**Where seen:** WS-10 (any non-marking-menu DCC tool's right-click)
**Failure mode:** Never becomes muscle memory; scanning cost grows linearly.
**Mitigation:** Marking menu + sub-menus; cap items per radial level at 8.

### Sticky modal that user can't escape [evidence: medium]
**Lens tags:** **L7**
**Where seen:** WS-10 (early Blender modal operators without visible exit hint)
**Failure mode:** Users feel trapped.
**Mitigation:** Always show "Esc to cancel" hint when in a modal mode.

### HUD elements competing for one corner ⚠ Watch [evidence: medium]
**Lens tags:** **L8**, L1
**Where seen:** WS-10 (Cyberpunk 2077 top-right has 4 systems fighting)
**Failure mode:** Visual mud; user can't parse competing signals.
**Mitigation:** Each corner one "owner" system; supplement with screen-edge brackets.
**Jarvis watch:** InputBar + LayoutActivityPanel + future widgets need owner-zone discipline.

### Brackets without LOD [evidence: medium]
**Lens tags:** **L6**, L4
**Where seen:** WS-10 (Eve circa 2010 — hundreds of labels causing CPU stutter and unreadable mud)
**Failure mode:** Without aggregation, brackets become mud.
**Mitigation:** Aggregate ≥4 overlapping into "+N" badge; rate-limit refresh.

### Diegetic-everything purism [evidence: medium]
**Lens tags:** **L1**, L7
**Where seen:** WS-10 (some Alyx mods)
**Failure mode:** Settings/preferences need menus; users hate hunting in 3D for a slider.
**Mitigation:** Hybrid model — data in world, commands on floating panel.

### Gesture-heavy onboarding [evidence: medium]
**Lens tags:** **L7**
**Where seen:** WS-06 (Muse — stylus-angle tool switching, three-finger menu taps; failed in the wild)
**Failure mode:** New users couldn't infer the gesture vocabulary.
**Mitigation:** Every gesture needs a discoverable fallback before launch.

### "Just infinite canvas" with no structure [evidence: medium]
**Lens tags:** **L1**
**Where seen:** WS-06 (Freeform/Scapple)
**Failure mode:** Users without an internalised meta-structure get lost.
**Mitigation:** Frames + Outline mode are what make Miro/Mural usable for newcomers.

### Modal pan vs select (Hand-tool toggle) [evidence: medium]
**Lens tags:** **L3**, L7
**Where seen:** WS-06 (Excalidraw still has a separate Hand mode; users get stuck silently)
**Failure mode:** Sticky mode trap.
**Mitigation:** Spacebar-hold or middle-mouse universal pan (tldraw/Figma); never sticky.

### Sticky-color = team convention [evidence: medium]
**Lens tags:** **L9**
**Where seen:** WS-06 (canvas tools — pink-means-blocker only works if everyone agrees)
**Failure mode:** New joiners spend weeks decoding.
**Mitigation:** Systematise with legends or let users customise per board.

### Bounded canvas misrepresented as infinite [evidence: medium]
**Lens tags:** **L1**
**Where seen:** WS-06 (Mural's bounded canvas invisible until users hit the edge mid-workshop)
**Failure mode:** Confidence breaks mid-session.
**Mitigation:** Be infinite, or expose constraints visibly.

### Hidden state during edit [evidence: medium]
**Lens tags:** **L11**, L8
**Where seen:** WS-11 (Most IDEs/graphic tools; Victor's *Inventing on Principle*)
**Failure mode:** Effect appears later via re-render; breaks perception-action loop.
**Mitigation:** Ghost-preview / live updates / streaming feedback. Defend every interaction against "is there a latency or hidden-state break?"

### One form per data type [evidence: medium]
**Lens tags:** **L2**, L11
**Where seen:** WS-11 (Most BI/graph tools, Jarvis 1.0 — artifact → fixed form, no per-task selection)
**Failure mode:** Forces user to pre-commit to a question.
**Mitigation:** Engelbart's viewspec / Kay's active object — let user switch lenses over the same data.

### Notifications instead of periphery [evidence: medium]
**Lens tags:** **L8**
**Where seen:** WS-11 (Most OS today — any event becomes push-interrupt)
**Failure mode:** Trains user to dismiss without reading; obliterates calm.
**Mitigation:** Weiser's three-tier zoning; promote only interrupt-class events to push.

### Trail as single back-button stack [evidence: medium]
**Lens tags:** **L11**, L12
**Where seen:** WS-11 (Every browser since 1995 — history collapses to linear undo)
**Failure mode:** Cannot share/annotate/branch.
**Mitigation:** Bush's named associative trail — ordered IDs + per-step rationale, addressable and shareable.

### Programmability gated by a "real" language [evidence: medium]
**Lens tags:** **L11**
**Where seen:** WS-11 (HyperCard needing Pascal/C; modern "low-code" needing SQL/JS)
**Failure mode:** Competence cliff where novice escape was promised.
**Mitigation:** Natural-language as the authoring layer; LLM compiles to spec.

### Imperative scripting required for routine charts [evidence: medium]
**Lens tags:** **L2**, L11
**Where seen:** WS-08 (pre-Vega-Lite D3 — every bar chart hundreds of lines)
**Failure mode:** Massive surface for routine work.
**Mitigation:** Declarative grammar (Vega-Lite, Plotly Express).

### Single global color scale [evidence: medium]
**Lens tags:** **L9**
**Where seen:** WS-08 (old Plotly defaults forced one colorbar even when channels had different semantics)
**Failure mode:** Conflates encoding channels.
**Mitigation:** Munzner-correct — one scale per encoding channel.

### 3D position used for abstract data when intrinsic geometry exists [evidence: medium]
**Lens tags:** **L2**, L1
**Where seen:** WS-08 (early molecular hacks encoded extra attributes by perturbing atom z-coords)
**Failure mode:** User loses both the abstract and geometric readings.
**Mitigation:** Use a separate visual channel; don't overload intrinsic geometry.

### Camera orbit around a static origin [evidence: medium]
**Lens tags:** **L3**
**Where seen:** WS-08 (universal beginner Three.js and older CAD complaint without per-selection pivot binding)
**Failure mode:** Camera feels wrong; user disoriented.
**Mitigation:** Center-of-rotation tracking (bind pivot to selection centroid).
**Jarvis note:** OrbitControls default — fix as part of Camera-controller refactor.

### Cybersickness from mode-switching [evidence: weak-medium]
**Lens tags:** **L3**, L5
**Where seen:** WS-10 (early VR with abrupt camera teleports without fade)
**Failure mode:** Visual-vestibular mismatch causes nausea.
**Mitigation:** 100-200ms fade between camera modes.

---

### Weak / single-source anti-patterns

### Sudden artificial camera motion (smooth locomotion at default) [evidence: weak]
**Lens tags:** **L3**, L5
**Where seen:** WS-02 (Meta Comfort)
**Failure mode:** Visual-vestibular mismatch → cybersickness within minutes.
**Mitigation:** Teleport or snap as defaults; smooth as opt-in.

### Holographic transparency cascade [evidence: weak]
**Lens tags:** **L2**, L9
**Where seen:** WS-11 (cinematic JARVIS visual flourish to skip)
**Failure mode:** Readability suffers; depth-disambiguation is hard.
**Mitigation:** Opaque panels with spatial separation.

### Particle/swarm effects on data points [evidence: weak]
**Lens tags:** **L2**
**Where seen:** WS-11 (cinematic JARVIS)
**Failure mode:** Pure spectacle; adds noise.
**Mitigation:** Cut.

### Curved/domed displays suggesting enclosure [evidence: weak]
**Lens tags:** **L1**, L5
**Where seen:** WS-11 (cinematic JARVIS)
**Failure mode:** Constrains user position.
**Mitigation:** Flat panels with free anchoring.

### Always-spinning orbital widgets [evidence: weak]
**Lens tags:** **L2**, L8
**Where seen:** WS-11 (cinematic JARVIS)
**Failure mode:** Chrome with no data signal.
**Mitigation:** Cut; reserve motion for state change.

### Floating-only layout that breaks on resize [evidence: weak]
**Lens tags:** **L1**, L3
**Where seen:** WS-03 (Tableau floating without tiled wrapper)
**Failure mode:** Designers float everything because it looks pixel-perfect at design resolution; then layouts shatter on tablet/phone.
**Mitigation:** "Tiled by default; float only for callouts" (Tableau docs).
**Jarvis note:** N/A for spatial canvas; relevant if a 2D companion view is added.

### Six layout options on every node-add [evidence: weak]
**Lens tags:** **L11**
**Where seen:** Implicit in WS-04 / WS-09 contrast with Vertex's user-triggered model — covered by "Auto-layout destroys author intent" above.

### Imperative reflow on every minor edit [evidence: weak]
**Lens tags:** **L11**, L8 — covered by "Auto-layout that re-flows on every interaction" above.

---

## Notes on consolidation

**Anti-patterns that DID merge across briefs:**
- "Always-on labels" / "Edge labels always-on" / "Brackets without LOD" / "Label-thrash" — kept as separate entries because each names a *different surface* (artifact labels vs edge labels vs game-world brackets). Sharing the index but not the implementation.
- "1:1 head-locked HUD" / "Head-anchored primary content" / "Always-on dense HUD" — kept as three entries because the failure mode is different at each scope (anatomical VAC, situation-awareness loss, attention exhaustion). All three would Watch the same Jarvis design risk.
- "Auto-layout that re-flows on every interaction" / "Auto-layout destroys author intent" — merged duplicate vocabularies under one entry; the n8n + Vertex case studies are both cited.
- "Hidden state during edit" / "Hiding the reasoning entirely" / "Missing or hidden reasoning trace" / "Black-box automation" / "AI grafted onto chat decoupled from graph" — kept as separate entries because the *surface* differs (edit-loop vs trace-tab vs operator-trace vs chat-separation). They all converge on "always-inspectable" as the mitigation.
- "Cargo-cult monitor sprawl" / "Pane proliferation without attention" / ">9 KPI cards" — all under "too many tiles" but at different scales. Kept separately because mitigations differ.

**Anti-patterns that DID NOT merge but look similar:**
- "Cross-filter cascades that don't terminate / loop" and "Auto-layout that re-flows" — both cyclic-update failures, but different domain (filter vs layout).
- "Trail as single back-button stack" and "Branch/retry loss" — both about flattening a tree to a list, but different domain (history vs reasoning).

---

## Watch summary (⚠ items that cross Jarvis design plans)

These 13 anti-patterns are the highest-attention items for the product team because Jarvis is currently designed in ways that risk tripping them:

1. **1:1 head-locked HUD** — relevant when activity panels lift to AR.
2. **3D bar/pie/line charts in abstract data** — relevant when chart-panel artifact-kind lands.
3. **Label-thrash (always-on labels)** — current Artifact card uses always-on label.
4. **Snap-transition state change** — Layout agent's `apply_layout_plan` is the surface.
5. **Trusting LLM spatial reasoning at scale** — Layout agent must stay gated by cost-function.
6. **Alarm flood / undifferentiated event stream** — ActivityPanel risk with 4+ agents.
7. **Auto-layout that re-flows on every interaction** — Layout agent trigger discipline.
8. **Always-on dense HUD** — InputBar + LayoutActivityPanel + future widgets in screen edges.
9. **Color-by-folder-only** — when color is introduced to plates.
10. **Implicit re-anchoring on head motion** — future AR migration.
11. **Free-fly camera in abstract VR analytics** — OrbitControls assumption.
12. **Extruded 3D text** — when DOM `<Html>` labels migrate to AR-ready text.
13. **Three-color overload on a single node** — when state/recency colors are added to plates.
14. **Hiding the reasoning entirely** — keep ActivityPanel first-class.
15. **Streaming chat as primary multi-agent UI** — ActivityPanel architecture before 4+ agents.
16. **Graph in a tab** — keep Jarvis graph-primary (already aligned, but a regression risk).
17. **Cargo-cult monitor sprawl** — future console mode must enforce slot-assignment.
18. **Head-anchored primary content** — anchor policy in `world | desk | body | hand | head | shared` schema.
19. **Missing or hidden reasoning trace** — Layout-agent trace must be co-located with the visual change.
20. **HUD elements competing for one corner** — owner-zone discipline as panels accumulate.

The first 13 are flagged as ⚠ Watch in the entries above; #14-20 are also Watch-tagged within their entries.

---

## Top 5 ⚠ Watch entries (most urgent)

Ranked by combined evidence-strength and immediacy to current Jarvis plans:

1. **Snap-transition state change** — Layout agent ships today; one bug in tween duration breaks the user.
2. **Trusting LLM spatial reasoning at scale** — already known fragility; preserve the cost-function gate.
3. **Auto-layout that re-flows on every interaction** — risk when agents become continuous-running.
4. **Label-thrash (always-on labels)** — will visibly fail at the 200-artifact threshold; build per-kind LOD now.
5. **Alarm flood / undifferentiated event stream** — risk grows with each additional agent kind.
