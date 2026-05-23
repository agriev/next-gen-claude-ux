# Convergent Themes

**Purpose:** Surface the design ideas that recur across the 12 research workstreams (WS-01..WS-12). A theme is a *design idea* (not a single pattern) that is reinforced from at least three independent vantage points. Where evidence is unanimous (≥6 WS), Jarvis should treat it as a default; where it is partial (3-5 WS), Jarvis should adopt with explicit rationale.

**Audience:** Phase 4 product team writing VISUAL-LANGUAGE.md, AR-VR-BRIDGE.md, the Console-mode RFD, and the backlog grooming sessions.

**Status:** Synthesis B (themes). Companion documents: `patterns.md` (catalog), `tradeoffs.md` (matrices), `open-problems.md` (frontier).

---

## Methodology

A *theme* qualifies for this document when:

- **≥3 workstreams** independently describe the same underlying idea (different vocabulary OK, same mechanism)
- **≥1 piece of concrete evidence per WS** — a named tool, a named pattern, a cited paper or a quoted vendor spec.

Strength tags:
- **[very strong]** — ≥6 workstreams; treat as default, deviate only with explicit justification.
- **[strong]** — 3-5 workstreams; treat as default, document trade-offs.
- **[noted]** — 2 workstreams; not headlined here unless paired with a strong open problem.

Themes are ordered roughly by strength × actionability. Cross-references use `patterns.md#<slug>` notation for the pattern catalog (sub-task A) and `WS-NN` for the source briefs.

---

## Themes

### T1. Spatial stability beats novelty for daily-use tools  [very strong]

**Evidence:**
- **WS-02 (AR/VR vendors)** — Universal anchoring preference order across Apple, Meta, Microsoft, Magic Leap: *world > body > hand > head*; head-anchored content is reserved for ≤3-second transients. Implicit re-anchoring on head motion is a documented confusion source.
- **WS-12 (Multi-dashboard / control rooms)** — Every Tier-A operations domain (cockpit, ICU, trading, mission control) uses **world-anchored, physically bolted panels**; the operator's "T-scan" only works because every value lives at a known coordinate. Cargo-cult monitor sprawl is a documented failure mode precisely *because* layouts get rearranged.
- **WS-05 (PKM / knowledge graphs)** — TheBrain's pivot-on-click works because the user always knows where "center" is; force-directed layouts that re-flow on every interaction routinely disorient and get abandoned.
- **WS-09 (Node-flow editors)** — Houdini, Nuke artists almost never use "Layout Selected" because auto-layout disrupts spatial intent; n8n's aggressive auto-reflow is a noted irritant.
- **WS-10 (Game/3D editor UX)** — Workspaces / saved layouts in Blender, Maya, MSFS; Eve players keep the same overview profile for years.
- **WS-11 (Novel/historical)** — Engelbart's *viewspec* and Weiser's three-tier anchor model both assume the substrate doesn't move out from under you; Dynamicland's "papers stay where you put them" is foundational.
- **WS-04 (Palantir)** — Vertex's six layout options are *user-triggered*, never automatic on node addition; auto-reflow on every interaction is called out as an anti-pattern.

**Synthesis statement:** Across operations, AR/VR, PKM and procedural-graph tooling, the strongest single predictor of a spatial UI's daily-driver retention is *layout persistence*. Cool re-flows demo well but break the muscle memory that makes glance-reading possible. The agent's freedom to reorganize must be a *user-invoked verb*, not a passive consequence of other actions.

**Implications for Jarvis:**
- Layout-agent reorganize must remain an explicit user-triggered action (commits 2804e71 and 8167a46 already trend this way). Never re-flow on artifact creation or edit.
- The bookmarks system (currently camera-only) must capture full state — slot assignments, filter state, visibility — so users can return to a remembered layout exactly. See `patterns.md#saved-exploration`.
- For Console mode (T12 below), slot occupancy is a hard constraint; agent reshuffles only between explicit prompts.

**Open question:** What is the right balance between agent-initiated micro-nudges (anti-overlap, anti-occlusion) and global re-flows? Probably the rule is "agent may *move* freely below a movement threshold; above it, propose-then-confirm."

---

### T2. Focus-plus-context: never draw the full graph  [very strong]

**Evidence:**
- **WS-05 (PKM)** — TheBrain's design assumes the user *never* sees more than ~30 thoughts at once; Obsidian's graph view is abandoned by users above ~1-2k nodes; the only working LOD for >200 nodes is hierarchical compression. "Refuse to scale up" is the actually-working answer.
- **WS-09 (Node-flow editors)** — Houdini survives 5k+ nodes because sub-network dive-in means a visible canvas never shows the whole thing; ComfyUI shipped Subgraphs in 2025 *because* large workflows became unmanageable. Naive node graphs fail at ~50 nodes without dive-in.
- **WS-10 (Game/3D UX)** — Eve Online's bracket LOD (200km → dots → overview-only); Cities Skylines replaces vehicle models with colored dots at zoom-out; WoW drops distant nameplates.
- **WS-08 (Scientific viz)** — Octree volume rendering, mesh decimation, Potree point-cloud thinning; "aggregation marks" (kepler.gl hex bins) become a different mark, not denser scatter.
- **WS-04 (Palantir)** — Vertex/Pipeline Builder collapse via Subgraphs/Folders; intermediate-edge collapse aggregates chains into a chip-on-edge.
- **WS-12 (Control rooms)** — ISA-101 codifies 4 levels of display detail; the operator navigates *by command*, not by zoom; rendering 10k panels would be malpractice.
- **WS-01 (Academic)** — Munzner's pixel-budget rule (never put two marks in fewer than 4×4 px); aggregation-then-drill is the discipline of choice above the screen-pixel-to-item ratio of 1.

**Synthesis statement:** Every successful spatial tool, at every scale, treats *the full set* as a database query and *the visible scene* as a focused window onto it. Tools that try to render everything fail in two stages: first they get slow, then they get unreadable, and users stop opening the view. The Layout-agent's job is not "place every artifact" but "decide what to show."

**Implications for Jarvis:**
- Default visible-artifact ceiling: ~200 (covers desktop and AR comfortably); above this, aggregate into cluster glyphs by default. See `patterns.md#focus-pivot-camera` and `patterns.md#hierarchical-subgraph`.
- The mini-map and Overview-panel (WS-10 brackets) become first-class read paths for "everything else."
- Layout-agent prompts should include explicit "how many artifacts should be visible at this zoom level?" reasoning, not just position deltas.

**Open question:** What is the visible-count ceiling specifically *in AR*? Vendor docs (WS-02) do not quantify; testing required.

---

### T3. Typed ontology beats free-form tags for any LLM-driven workspace  [very strong]

**Evidence:**
- **WS-04 (Palantir)** — Object Types / Link Types / Action Types are the entire substrate; *Ontology-Augmented Generation* (OAG) is Palantir's documented anti-hallucination mechanism — the LLM only ever sees typed entities, never raw text chunks.
- **WS-05 (PKM)** — Tana's supertags, Capacities' object types, Kumu's causal-loop types: every PKM tool that scales does so because nodes are typed; free-form tag forests collapse at scale.
- **WS-08 (Scientific viz)** — PyMOL's Boolean *selection algebra* over named attributes; Vega-Lite enforces one scale per encoding channel via schema validation; declarative grammars are LLM-friendly precisely because they are typed.
- **WS-09 (Node-flow editors)** — Maya's typed port colors, Houdini's pin shape distinction (round=data, slot=flow), TouchDesigner's family-typed networks. LangFlow/Flowise's loose "everything is the message" typing is called out as a failure mode.
- **WS-03 (BI)** — Looker's `LookML` (typed dimensions/measures, git-versioned source code); Tableau and Power BI both have a richer type system than first appears (measures vs dimensions, hierarchies, parameters).
- **WS-07 (AI-native reasoning)** — Anthropic Console / Cursor / Devin all benefit from typed agent outputs (plan rows, file diffs, tool calls); freeform reasoning blobs are systematically worse to act on.
- **WS-12 (Control rooms)** — ISA-101 attaches typed semantics (PV / setpoint / alarm class) to every value; SCADA without this becomes unauditable.

**Synthesis statement:** Free-form tags are seductive at small scale because they impose no schema. They fail because LLMs cannot operate over them reliably (no schema to validate against), users cannot bulk-select over them (no algebra), and they collapse 5+ semantic dimensions into one visual channel. A typed ontology with a small number of well-named kinds dominates on every axis a synthesis-pass cares about — including LLM steerability.

**Implications for Jarvis:**
- Promote `Artifact.kind` from a 7-value enum to a **typed registry** (`object_type` records with `id`, `name`, `icon`, `color`, `properties[]`, `allowedActions[]`). See `patterns.md#typed-graph`.
- Promote `Edge.kind` from a 4-value enum to a **Link-Type schema** with `srcKind`, `dstKind`, `semantics`, `directionality`, `intermediateOf`. See `patterns.md#link-type-registry`.
- Add **Action-types** (typed mutations on artifacts) — the LLM's tool-call surface should be the same typed entities the user sees.
- The Layout agent's context window should describe artifacts via their type schema, not their raw spec.

**Open question:** What ontology granularity is right for an LLM-driven canvas where the agent can re-type artifacts on demand? This sits between Tana (heavy upfront typing) and Obsidian (none) — unstudied territory.

---

### T4. Reasoning trace as nodes in space is the unexplored frontier  [strong]

**Evidence:**
- **WS-07 (AI-native reasoning)** — Explicit finding: "**No tool ships a 3D reasoning surface.**" The catalog spans linear logs, indented trees, kanban columns, multi-pane grids, and 2D node-graphs; none uses depth or volume. The "3D gap" is called out as the Jarvis-shaped opportunity (Z = abstraction, time, or agent identity).
- **WS-11 (Novel/historical)** — Bush's *trail* (1945), Engelbart's *NLS history*, Victor's *Ladder of Abstraction*, Dynamicland's "running program projected onto its source paper" — historical thinkers all anticipated reasoning-as-navigable-artifact, all blocked by missing compute. The compute is now here.
- **WS-08 (Scientific viz)** — Every sci-viz pipeline is itself a node graph (ParaView Pipeline Browser, VisIt tree, Houdini Solaris LOPs); "process = editable data-flow DAG" is the convention. Lifting agent reasoning into the same idiom is the obvious next step.
- **WS-09 (Node-flow editors)** — ComfyUI's "node lights up while executing" is the closest existing analog to live reasoning visualization. ComfyUI-R1 (2025) shows LLMs can *drive* node graphs at runtime, not just sit inside them.
- **WS-05 (PKM)** — InfraNodus's structural-gap detection is the only PKM tool that visualizes an AI thinking artifact; all others (Tana, TheBrain Cerebro, Smart Connections) hide AI reasoning in side chats.

**Synthesis statement:** Every modern AI tool either hides reasoning (consumer chat) or shows it as a 1D/1.5D linear/tree log (LangSmith family). A 3D spatial reasoning trace — agent threads as tubes through space, branches as forked tubes, retries as ghost trails, agent identity as depth layer — is technically possible today and is described in design fiction since at least Bush 1945, but no production tool ships it. This is the single most defensible product differentiation Jarvis can build.

**Implications for Jarvis:**
- Promote *reasoning-thread* to a first-class spatial primitive: a volumetric tube traced from agent-origin → tool-call plates → result, with branches forked and retries dimmed. See `patterns.md#reasoning-thread`.
- Each Jarvis sub-agent (Worker, Layout, Listening, Naming) owns a Z-plane; cross-agent handoffs appear as edges between planes.
- Per-step reasoning is **ambient, not summoned** (Weiser, Bush): the trace lives in-scene with depth-fade, not behind an ActivityPanel button.

**Open question:** At what density does the spatial trace itself become hairball-ridden? Probably the trace needs its own LOD (T2): fold completed threads into a single beam after ~3 minutes; offer a time-scrubber.

---

### T5. Two-layer color: categorical kind + state overlay, never a third  [very strong]

**Evidence:**
- **WS-04 (Palantir)** — Documented two-layer rule: fill = type (categorical), overlay = state (run status). Adding a third orthogonal scale (recency, confidence) makes nodes uninterpretable. Foundry docs warn against it explicitly.
- **WS-08 (Scientific viz)** — Strict separation of channels (Munzner's "one scale per channel" rule); Vega-Lite refuses overloads at compile time.
- **WS-09 (Node-flow editors)** — Three orthogonal color scales coexist (node category band, port/wire type, selection/error state) — but they're separated by *which UI surface* each one lives on; there is no node where all three compete for the same fill.
- **WS-10 (Game/3D UX)** — Standings color, resource color, state color, type icon — each on a different channel; SC2's *never overload one channel with two meanings* is explicit doctrine.
- **WS-12 (Control rooms)** — Convergent palette across cockpit/ICU/SCADA/NOC: greyscale background + reserved red/amber/cyan/green for state. ISA-101 explicitly forbids color-alone signalling; position + shape + label backup.
- **WS-03 (BI)** — Stephen Few: "reserve red and green for state only"; BI tools have 4 overlapping scales and "rarely manage the conflict explicitly" — and they suffer for it.
- **WS-01 (Academic)** — Munzner channel-rank: luminance for ordered, hue for categorical, saturation for emphasis; ColorBrewer's "qualitative" capped at 8-10 hues.

**Synthesis statement:** Color is a precious 3-channel resource (hue + luminance + saturation), but the operator-class tools that don't burn out their users hold themselves to **two color layers per visual primitive**: a categorical hue for *what kind of thing*, and a state overlay (border, glow, ring) for *what's happening with it*. A third orthogonal scale always wants in — recency, confidence, agent-touched — and it always degrades readability. Push the third scale to a *different visual channel* (size, badge, icon, glyph) or a *different surface* (side panel, mini-trend).

**Implications for Jarvis:**
- Document and enforce a two-layer rule in `docs/product/VISUAL-LANGUAGE.md`: *kind → fill hue (categorical), state → outer ring/glow (overlay), everything else → glyph/badge/size*.
- Reserve red/amber/green for state only, never for kind (currently Jarvis edge-kind palette includes red for `contradicts` — this collides with state-red).
- Colorblind-safe categorical palette only (8% male population).

**Open question:** Where does *agent identity* fit (Worker/Layout/Listening/Naming)? It's not a kind, it's not a state — probably a third channel via *position* (Z-plane per T4) plus a per-agent accent in side panels, not a fill.

---

### T6. Linked highlighting + brushing is universal in BI; rare in PKM and absent in agent tools  [very strong]

**Evidence:**
- **WS-03 (BI)** — Linked highlighting + brushing is the BI industry's deepest contribution: Power BI default cross-filter; Tableau action system (6 kinds, ordered cascade); Looker/Grafana variable scoping. Listed as the **central question** of the brief.
- **WS-04 (Palantir)** — Histogram + Map + Object Explorer triad: select in histogram → map dims non-matches → preview panel updates → filter recomputes histogram. The "linked-views feedback loop" is called the *raison d'être* of the Foundry/Gotham UI.
- **WS-08 (Scientific viz)** — Brushing-and-linking is 30+ years old; Vega-Lite selection objects drive cross-view conditional encoding; ParaView shares selections across linked views.
- **WS-05 (PKM)** — Editor + Graph + Back-links triple is the canonical PKM pattern (Obsidian, Logseq, Capacities, Reflect); but it only links 3 views, and almost no PKM tool does *brushing*.
- **WS-10 (Game/3D UX)** — Eve's Overview ↔ in-space brackets; SC2 minimap ↔ main view — "linked-highlight as default" is game UX doctrine.
- **WS-12 (Control rooms)** — Control rooms have *very limited* cross-panel linking — this is the **biggest gap** in real operations, and therefore the **biggest LLM opportunity**.
- **WS-07 (AI-native reasoning)** — Mostly absent: LangSmith deep-link URLs but no "hover span → highlight source line." Cursor and Devin couple chat-to-editor as basic linked highlighting. Largely untouched ground.

**Synthesis statement:** Selection state shared across views is the single most analytically powerful interaction primitive 2D BI has developed since the 1990s, and almost nothing else has caught up. Spatial canvases, PKM, agent dashboards, and even control rooms are all weaker on this axis than 2D Tableau. Importing brushing/linking into a 3D LLM-driven workspace is *high leverage and low risk* — the mechanics are well-understood; only the rendering details are new.

**Implications for Jarvis:**
- Cross-highlight by default for typed edges: hover an artifact → dim all artifacts not in its 1-hop neighborhood. See `patterns.md#cross-highlight`.
- Promote *selection* to a shared cross-view state; the Inspector, mini-map, scene, and future panels all read the same selection set.
- Distinguish *selection* (transient highlight) from *filter* (panel-spanning constraint) — Palantir's separation, not BI's conflation. See T11 below.
- When a future `kind: 'panel'` chart-tile lands, brushing must be the default linking mode, with opt-out per panel (Tableau-style).

**Open question:** What's the AR equivalent of a hover-brush? Gaze-based pre-selection with palm-pinch commit (visionOS Indirect) is probably the answer; testable.

---

### T7. Animated transitions defeat change-blindness; instant snaps cause confusion  [very strong]

**Evidence:**
- **WS-01 (Academic)** — Heer & Robertson empirical baseline: 1-2 second animated transitions with semantic bundling measurably improve change-tracking; >2.5s harms recall.
- **WS-02 (AR/VR vendors)** — Meta locomotion: blink-translate-fade, snap turn vs smooth turn, vignette during motion all exist *because* uncontrolled camera changes cause cybersickness as well as confusion.
- **WS-06 (Spatial canvases)** — tldraw camera as programmable subsystem with `animate` API; Cmd+0 fit-to-content; "no canvas tool has a 'look at this now' beam" is called out as gap.
- **WS-09 (Node-flow editors)** — n8n's aggressive auto-reflow is jarring precisely because it's *too fast* and unannounced; Houdini's user-triggered "Layout Selected" is the alternative.
- **WS-10 (Game/3D UX)** — 100-200ms fade between camera modes is cybersickness-mitigating doctrine; SC2 control-group double-tap camera snap is acceptable because it's user-invoked.
- **WS-12 (Control rooms)** — Layout stability + content-swap drill-down (ISA-101 L1→L4) keep operators oriented; layout reshuffle in operations is forbidden.
- **WS-05 (PKM)** — TheBrain's pivot-on-click works because the *layout* animates around a stationary focus, not because the camera flies through space.

**Synthesis statement:** Every successful spatial tool that does state changes animates them at 600-1500ms with object-identity preservation. Instant snaps cause change blindness (the user notices that *something* moved but can't say what); too-slow animations (>2.5s) harm recall. The Layout agent's `apply_layout_plan` is exactly the API where this matters most for Jarvis.

**Implications for Jarvis:**
- Standardize Layout-agent reorganize at 800-1500ms with per-artifact identity-preserving tween (probably already partial in `renderer/src/scene/live-transforms.ts`).
- Camera transitions on bookmark-jump: 600ms ease, never instant.
- Per-artifact creation: 200-400ms fade-in to attract attention without surprise.
- For agent activity beams (T9 below): pulse rate ≤2 Hz, fade-out over 1-2s.

**Open question:** Is the easing curve a per-kind decision, or global? Probably global; experimentation cheap.

---

### T8. World-anchored data, hand-anchored controls, head-anchored status only  [very strong]

**Evidence:**
- **WS-02 (AR/VR vendors)** — Unanimous vendor anchor preference order (Apple, Meta, MS, ML): world > body > hand > head, with head reserved for transients ≤a few seconds. Microsoft *explicitly forbids* 1:1 head-locked HUDs; Apple recommends *lazy-follow*; Meta uses passthrough periphery as a stable visual reference.
- **WS-12 (Control rooms)** — Every Tier-A operations domain uses world-anchored panels. Vision Pro HIG explicitly imports this. "Head-anchored primary content" is an anti-pattern with HUD-tunnelling consequences.
- **WS-01 (Academic)** — Marriott et al. + Shin 2024 situated-analytics survey both back the "world for long-lived, hand for transient controls, head only for status" rule. Shared anchors + private overlays for multi-user.
- **WS-10 (Game/3D UX)** — Alyx: world-anchored objects, hand-anchored inventory (wrist gauntlets), *head-anchored nothing*. Beat Saber matches.
- **WS-11 (Novel/historical)** — Weiser 1991: tab (hand) / pad (desk) / board (wall) — three scales at three anchor depths. Bush's Memex was *desk-anchored*. Dynamicland is *world-anchored*.

**Synthesis statement:** Across 30+ years of HCI research, 4 commercial AR/VR vendors, every Tier-A operations domain, and current academic immersive-analytics literature, the anchoring policy is unanimous: data lives in the world, controls in the hand, status (briefly) on the head. Anchor switches must be *explicit*, never automatic on head motion. This rule applies even on desktop — abstracting it now is the cheapest possible AR migration prep.

**Implications for Jarvis:**
- Add a per-artifact `anchor` field with values `world | desk | body | hand | head | shared`. Default `world`. Refuse to render `head` for anything that lives >3s.
- InputBar at the bottom of the window is *screen-anchored* (acceptable for desktop, but tag it so the AR migration knows to swap for a palm menu).
- Future `Console mode` (T12): the horseshoe is world-anchored; the current-action / agent-thinking indicator is body-relative; help hints are head-transient.

**Open question:** What's the right "shared" anchor for multi-user Jarvis? Probably the user's own desk for now (Apple SharePlay model) until the multi-user case is real.

---

### T9. Preattentive single-channel pop-out for ambient signals; aural for high-priority  [very strong]

**Evidence:**
- **WS-01 (Academic)** — Healey & Enns foundation: preattentive features (hue, luminance, motion, size) pop out in <200ms regardless of distractor count; **conjunctions are not preattentive** — "find the red horizontal" requires serial search. Single-channel cues only.
- **WS-12 (Control rooms)** — Layered alert priority with **paired visual + aural** is doctrine in cockpit, ICU, SCADA, NOC, trading. Spatial audio + spatial position together; aural channel is *orthogonal* to visual, reaches the brain via a different pathway.
- **WS-02 (AR/VR vendors)** — "Sound as first-class attention channel" is explicit Apple Q&A; Microsoft Hand-Menu requires sound effect feedback; Meta teleport mitigation lists spatial sound.
- **WS-10 (Game/3D UX)** — Minimap ping + screen-edge arrow + audio cue is RTS/RPG doctrine; rate-limited; suppression if >3 ignored in 60s.
- **WS-11 (Novel/historical)** — Weiser's "calm technology" three-tier: ambient periphery → focal periphery → center; explicit promotion only. Knowledge Navigator does it via voice.
- **WS-05 (PKM)** — Almost entirely pull-only; Smart Connections is the only "AI attention" pattern and it's silent.
- **WS-08 (Scientific viz)** — Animation as primary attention cue; less interrupt signalling (batch-analysis context).

**Synthesis statement:** Ambient signals (background agent activity, low-priority changes) should use one preattentive visual channel — usually a slow luminance pulse or motion bloom. Interrupt-class signals (decision required, conflict, failure) should add a *second sensory channel* (spatial audio, haptic) — not a second visual channel. The rate must be capped: ICU alarm fatigue and NOC notification spam are both well-documented failure modes.

**Implications for Jarvis:**
- Add a preattentive pulse channel for "agent is touching this" — single channel (luminance ring or motion bloom), not a color + blink conjunction.
- Reserve a second channel (spatial audio in headset, stereo on desktop) for `awaiting_input` events. See `patterns.md#waiting-on-you-beam`.
- Hard cap: max 1 L2+ alert per second; queue the rest with a "+N" badge. Suppression if user dismissed >3 of the same class in 60s.
- ActivityPanel currently shows undifferentiated reasoning rows — categorize events (info / decision-needed / failure / blocked) and route accordingly.

**Open question:** How does spatial audio degrade in noisy environments? Probably need a fallback haptic in shared spaces; testable post-WebXR.

---

### T10. Algebraic / named selections beat ad-hoc lasso at any scale  [strong]

**Evidence:**
- **WS-08 (Scientific viz)** — PyMOL's `select chain A and (resi 125-200) and (not name CA)` is the gold standard; selections are *named persistent entities* downstream commands reference; LLM-friendly precisely because the language is small and declarative.
- **WS-04 (Palantir)** — Object Explorer Saved Explorations; Foundry's strict *filter ≠ selection* separation; selections survive navigation, navigate-back, filter-recompute.
- **WS-05 (PKM)** — Tana's typed-set selection + Neo4j Bloom's NL-query-as-selection are "far more powerful than canvas-style lasso once N > 100" — saved-selections are the *query*, not the *current set of IDs*.
- **WS-03 (BI)** — Tableau Set Action: saved selection that other views reference; "asymmetric drill-down" with sets; Looker's `listen:` parameter.
- **WS-06 (Spatial canvases)** — "Saved selections are essentially absent" in canvas tools; lasso wins for <100 items, fails above; Figma "Selection Colors" is the closest, weak.
- **WS-10 (Game/3D UX)** — SC2 control groups (Ctrl+1..9), Maya marking-menu's "select hierarchy / all of type / invert," Eve overview right-click on type-filtered selection.

**Synthesis statement:** Pointer-driven multi-select (lasso, marquee, shift-click) is good for ≤100 items and degrades sharply above. Tools that operate at scale all add an *algebraic* selection layer — Boolean predicates over typed attributes — that produces *named persistent sets*. This pattern is the natural bridge from human muscle-memory selection to LLM-authored selection ("select all artifacts of kind=note created since last Monday in cluster X").

**Implications for Jarvis:**
- Implement saved selections as predicates, not ID lists: `selection { id, name, query: <predicate> }`. Surviving artifact churn.
- Expose a PyMOL-style selection algebra to the Layout agent as a tool: `kind=note and tag=auth and recency<7d` is a first-class concept.
- Distinguish selection (transient) from filter (panel-wide) — see T11.
- Ctrl+1..9 (per WS-10) saves the current selection; Shift+1..9 saves camera/view (existing).

**Open question:** Algebra expressivity ceiling — full predicate calculus, or capped at a Looker-style YAML? Probably the latter for v1 (LLM steerability + UI authoring).

---

### T11. Filter vs selection must be distinguished (Palantir-style)  [strong]

**Evidence:**
- **WS-04 (Palantir)** — Explicit pattern: *selection is per-view; filter is panel-spanning*. Lets the analyst multi-select, convert to filter, navigate away, return with filter intact. Called out as a Palantir-distinguishing virtue.
- **WS-03 (BI)** — Most BI tools (Tableau, Looker) *fudge* this distinction; Power BI's default cross-filter conflates them; Palantir's separation is rare and considered correct.
- **WS-05 (PKM)** — Tana's typed-set view (filter) vs Obsidian Canvas's lasso (selection) — different concepts confused in most tools.
- **WS-08 (Scientific viz)** — ParaView treats selection as a *filter* that feeds downstream filters — the most explicit conflation case. PyMOL's named selections persist outside the current view — explicit separation.
- **WS-10 (Game/3D UX)** — SC2 selection (transient) vs Eve overview filter (persistent) is a clean separation in the games space.

**Synthesis statement:** Conflating "what's highlighted right now" with "what's currently visible" is a small mistake at low scale that compounds catastrophically. Once a tool's filter state must be saveable, shareable, or scriptable, the two concepts must split. Doing it from the start is cheap; bolting it on later requires data-model migration.

**Implications for Jarvis:**
- Two distinct state shapes in `electron/main/world-state.ts`: `currentSelection: id[]` (transient) and `activeFilters: predicate[]` (panel-scoped, persistable, bookmarkable).
- Selection drives hover-highlight, Inspector contents, agent context.
- Filter drives visibility, mini-map rendering, what's in the Layout agent's working set.
- A "convert selection to filter" gesture (right-click → "filter to these"), per Palantir.

**Open question:** Should filter be per-panel (Console mode) or board-wide (canvas mode)? Probably per-mode; document in the RFD.

---

### T12. Operator's mental model is anchored to fixed slots, not free placement  [strong]

**Evidence:**
- **WS-12 (Control rooms)** — Bloomberg's 4-quad workspace, cockpit PFD-MFD-EICAS triad, NOC console row, ICU bedside vitals — all *fixed-slot horseshoes* within ≤120° head-turn range. Slots encode attention rank (primary/working/ambient/deep-dive). The 5-minute scan only works because every value is at a remembered position.
- **WS-02 (AR/VR vendors)** — visionOS *Personal Office* (multi-monitor arc), Apple Window/Volume/Immersive triad with type-tagged scene primitives; Magic Leap *OCPA* (30°×30° optimal placement area).
- **WS-03 (BI)** — Tiled responsive grid + nested containers (Tableau, Looker, Grafana); Bloomberg Launchpad's monitor-anchored components. Free-form floating layouts are a documented anti-pattern (break on resize).
- **WS-06 (Spatial canvases)** — Frames-as-slides (Miro, FigJam, Freeform); Mural Outline; Heptabase calendar-drop journal — slot-based composition outperforms free-form for revisit.
- **WS-10 (Game/3D UX)** — Workspaces / saved layouts in Blender, Maya, MSFS pop-out panels, Star Citizen MFD profiles.
- **WS-11 (Novel/historical)** — Weiser's tab/pad/board scales; Dynamicland's physical-arrangement-as-layout.

**Synthesis statement:** Every successful multi-panel workspace ties information to named, ranked positions that don't move between sessions. Free-form placement is fine for exploration but actively harmful for daily-use operations (cargo-cult monitor sprawl). The agent's job in operations mode is to *fill slots*, not place panels anywhere.

**Implications for Jarvis:**
- Build a *Console mode* (per WS-12 Special D): fixed horseshoe of 5 slots (Primary / Working×2 / Ambient×2) world-anchored around a stationary camera.
- Each artifact gains an `attention_rank` (1–4) that the Layout agent treats as a hard constraint when filling Console slots.
- Canvas mode (current free-form) coexists as exploration mode; Tab key (or similar) switches.
- Bookmark Shift+1..9 in Console mode saves slot assignments + filters + camera pose (a named "console").

**Open question:** How does Console mode share state with Canvas mode? Probably both views over the same underlying WorldState, with mode-specific layout state. RFD-shaped problem.

---

### T13. Process is a DAG; result is the viewport — keep both visible  [strong]

**Evidence:**
- **WS-08 (Scientific viz)** — ParaView Pipeline Browser, VisIt tree, Houdini Solaris LOPs: every viz is the output of a named filter chain; *users edit the chain, not the output*. Makes provenance visible and edits non-destructive.
- **WS-04 (Palantir)** — Pipeline Builder + Object Explorer: DAG of typed operations producing typed entities the user can immediately inspect downstream. Dagster's asset graph + materialization timeline is the cleanest implementation.
- **WS-07 (AI-native reasoning)** — Plan-then-execute (Copilot Workspace, Devin Planner, Replit Agent); Generate-then-preview (Bolt, v0, Claude Artifacts). The pipeline + preview split is converging across the agent-tooling industry.
- **WS-09 (Node-flow editors)** — Houdini's display-flag + Geometry Spreadsheet: walking the flag *is* debugging. Canvas-as-primary + linked-viewer-panes is what makes Houdini the daily-driver.
- **WS-11 (Novel/historical)** — Engelbart's "view-of-views" anticipated this; Bret Victor's *Inventing on Principle* live-coding demos show zero-latency cause→effect; Dynamicland makes the running program visible *on top of* its source paper.

**Synthesis statement:** When the user can see both the *process* (a DAG of typed operations) and the *current result* (the viewport on the data those operations produced), they can audit, debug, and steer. Tools that hide one or the other consistently lose to tools that show both. The Layout-agent reasoning trace is a DAG; the Spatial Canvas is the result; both should be first-class.

**Implications for Jarvis:**
- Add a *Process View* lens (per WS-04 Implication #5): a DAG of Actions/agent runs as an alternative read path over the same WorldState. Toggle key.
- Per-panel "explain this placement" affordance (per WS-12 Implication): hover/voice query → mini-trace overlay showing why this artifact ended up here.
- Workflow-as-DAG export (per WS-07 Implication #7): on trace completion, offer "freeze as workflow" → editable node graph re-runnable.

**Open question:** Does the Process View live as a separate panel, or as an in-scene Z-layer (per T4)? Both probably; Process View is the desktop/2D answer, Z-layer is the AR/3D answer.

---

### T14. Plan-then-execute with ghost-preview beats commit-then-undo  [strong]

**Evidence:**
- **WS-07 (AI-native reasoning)** — Copilot Workspace / Devin Planner / Replit Agent all surface a *structured plan* the user can edit *before* commit; bad plans are worse than no plan but reviewable plans are the gold standard.
- **WS-06 (Spatial canvases)** — tldraw Make Real loop (draw → click → preview → mark up → re-generate) is canvas-as-spec-and-result. "Ghost preview" pattern is widely cited.
- **WS-09 (Node-flow editors)** — Rete.js / Maya provisional-wire validation: while you drag, the wire recolors red on incompatible target — *pre-empts errors before commit*.
- **WS-10 (Game/3D UX)** — Blender modifier preview; Alyx ghost-of-result preview for grabbing; Civ unit-move dotted-arrow preview.
- **WS-11 (Novel/historical)** — Victor's "make hidden state visible" doctrine; the entire *Inventing on Principle* talk argues against the commit-then-debug cycle.

**Synthesis statement:** The user wants to see *what will happen* before it happens. Plan rows that can be edited, ghost plates at proposed positions, provisional wires that recolor red — all reduce the cost of failure to nearly zero and let the user steer the agent in time, not in retrospect. Anti-pattern: snap-execute without preview, with only an Undo button as recourse.

**Implications for Jarvis:**
- Layout-agent should emit a *proposed plan* (with ghost positions) before committing; user can drag-correct then accept (gesture or voice). See `patterns.md#intent-ghost`.
- Worker agent: surface the typed *plan* (list of file edits + tool calls) before execution where possible.
- Edge creation: provisional-wire visualization (red on incompatible kind) during drag, per WS-09.

**Open question:** Latency budget — at what proposal-to-commit lag does the ghost-preview feel like friction rather than safety? Probably ≤300ms; testable.

---

### T15. Branch / retry / alternative is the systemic blind spot of AI tooling  [noted but headlined]

**Evidence:**
- **WS-07 (AI-native reasoning)** — Explicit finding across the entire catalog: "**No tool first-classes 'branches/alternatives'.**" Every represented reasoning is the *winning path*. Cursor worktrees (git-level branching) and Anthropic Console prompt versions (authoring-time) are the only exceptions, and neither addresses runtime branching.
- **WS-11 (Novel/historical)** — Nelson's Xanadu versioning ("as of yesterday morning is addressable"); Engelbart's NLS edit history — the historical thinkers all knew this mattered.
- **WS-09 (Node-flow editors)** — Houdini's node-cache model: every step caches; you can revisit. Nodes that are pruned but cached are recoverable. The closest analog in production tooling.

(Only 3 WS — but the gap is so consistent and so consequential that we keep this as a headlined theme rather than demoting to "noted.")

**Synthesis statement:** Every existing AI trace UI flattens alternate attempts: the user sees "the agent tried, succeeded with version X" and never "the agent tried W, then Y, then Z, picked X." This is the systemic blind spot — and it is the exact pain a *spatial* representation can solve naturally (branches as forked tubes, retries as dim trails).

**Implications for Jarvis:**
- Promote *branch* and *retry* to first-class concepts in the reasoning-thread primitive (T4): A dim/translucent, B active, user can pin to compare.
- Each layout agent attempt that gets superseded should remain visible as a ghost in the reasoning Z-layer, not be erased.
- "Compare branches" gesture: select two threads, see them side-by-side with a diff highlight.

**Open question:** What's the diff representation when both branches produced different layouts? Probably a delta of (positions, edges, clusters) rendered as a translucent overlay.

---

### T16. Declarative grammar beats imperative code for LLM-authored visuals  [strong]

**Evidence:**
- **WS-08 (Scientific viz)** — Vega-Lite vs Three.js comparison: declarative spec is 10× smaller token count, schema-validatable, deterministic merge, high cache hit, self-describing. The fundamental architectural fork for any LLM-driven viz tool.
- **WS-04 (Palantir)** — Saved Explorations bundle (query + filter + chart-config + layout) as declarative documents; Workshop pages are codeless; Functions in Foundry are typed signatures, not free-form Python.
- **WS-05 (PKM)** — JSON Canvas open format: tiny, stable, declarative; lets multiple tools own different surfaces over the same data.
- **WS-07 (AI-native reasoning)** — ComfyUI workflow JSON is declarative and that's why ComfyUI-R1 (2025) can have an LLM *author* the graph at runtime; LangFlow imperative-Python custom components do not get the same benefit.
- **WS-09 (Node-flow editors)** — Houdini HDA parameter promotion + Subnetwork wrapping creates a declarative interface around imperative content; the declarative boundary is what makes HDAs sharable assets.

**Synthesis statement:** The LLM's natural output is *structured text*. The smaller the surface (JSON spec vs JavaScript function), the higher the success rate, the cheaper the round-trip, the better the cache. Imperative scene-graph code is the wrong abstraction for an LLM-driven canvas; declarative encoding specs are right.

**Implications for Jarvis:**
- Layout agent already emits position deltas (correct direction); extend to declarative artifact *appearance* specs (`{ kind: "note", encoding: { color: { field: "tag" }, size: { field: "importance" } } }`). See `patterns.md#declarative-spec`.
- Future `kind: 'panel'` artifacts should embed declarative widget specs (Vega-Lite, Mermaid, Cytoscape JSON), not raw R3F code.
- The boundary: declarative for *what to show*, imperative for *how to render*. (Vega-Lite + Three.js split, mirroring deck.gl + react-map-gl.)

**Open question:** Where do we draw the imperative boundary? Probably at the renderer — the Layout agent never writes Three.js; the renderer compiles spec → mesh.

---

### T17. The "graph is the workspace" commitment vs "graph in a tab"  [strong]

**Evidence:**
- **WS-05 (PKM)** — TheBrain is the only category exception that scaled, *because* the plex is always the app; Obsidian, Roam, Logseq's graph views are tabs and get opened-once-then-ignored.
- **WS-09 (Node-flow editors)** — Houdini wins 5/6 axes against Unreal Blueprint specifically *because* "the network editor is the primary surface, not a side panel, and every other view is engineered as a linked second-class consumer of network-editor state."
- **WS-07 (AI-native reasoning)** — ComfyUI's graph *is* the app; you can't use ComfyUI without seeing it. This commits the user to spatial-first thinking.
- **WS-04 (Palantir)** — Vertex graphs are the investigator's working surface, not an artifact view.
- **WS-12 (Control rooms)** — Console mode (T12) makes the panel arrangement *the* workspace; nothing important hides behind a tab.

**Synthesis statement:** Tools that treat the spatial view as one tab among many systematically lose to tools that commit to the spatial view *being* the workspace. The temptation to add a separate "code editor" or "settings page" or "graph tab" is strong and almost always wrong for spatial-first products. Jarvis's current Inspector and ActivityPanel are tab-shaped DOM panels — both candidates for in-scene placement in the AR pivot.

**Implications for Jarvis:**
- Inspector + ActivityPanel are the two big tab-shaped DOM panels (per AR-readiness inventory) — phase them into in-scene panels (R3F + UIKit) as the AR migration progresses.
- Resist the temptation to add a "settings page" or "history page" — make them in-scene primitives.
- Onboarding (which is currently a modal DOM panel) should be in-scene as the user's first artifact arrangement.

**Open question:** What survives as DOM in the bridge year? Probably the boot screen, the OS-level menu, and the model picker — the rest should migrate.

---

### T18. Voice is an orthogonal channel; aural + spatial together survive distraction  [strong]

**Evidence:**
- **WS-02 (AR/VR vendors)** — "Sound as first-class attention channel" across Apple, Microsoft, Meta; spatial audio for button presses, teleport mitigation, hand-menu feedback.
- **WS-12 (Control rooms)** — Voice loop is **the** orthogonal coordination channel in NASA mission control, ATC, NOC bridge calls, OR/ICU handover; "missing voice loop" is a documented anti-pattern.
- **WS-11 (Novel/historical)** — Knowledge Navigator's voice agent (1987) is the reference; "agent narrates as it works, accepts spoken clarifications, suggests next moves." Listening agent partial.
- **WS-10 (Game/3D UX)** — Civ VI's distinct sounds per event class; Alyx's spatial 3D audio pulls attention to sound source.
- **WS-01 (Academic)** — Healey & Enns: aural channel engages a different cortex pathway; reduces miss rate vs visual-only.

**Synthesis statement:** The visual channel is bandwidth-limited and easily distracted; the aural channel survives looking away. High-priority signals (interrupt class) should use both. For an AI workspace, this also means *the agent narrating its own reasoning* as it works is high-leverage and historically anticipated (Knowledge Navigator 1987) but rarely shipped today.

**Implications for Jarvis:**
- Listening agent already does voice in; promote voice *out* — the agent narrates its current action (TTS, optional, spatially positioned per agent in headset).
- High-priority alerts pair visual + spatial audio.
- "Voice scrubber" for temporal navigation through the reasoning trace ("take me back to when the Layout agent picked the wrong cluster") — design fiction now, testable post-WebXR.

**Open question:** Per-agent distinct voices (Worker / Layout / Listening / Naming as different TTS voices) — useful or alarming? Probably useful with subtle pitch shifts only.

---

### T19. Bret Victor's "ladder of abstraction" is technologically feasible now  [noted]

**Evidence:**
- **WS-11 (Novel/historical)** — Victor's *Ladder of Abstraction* (concrete / parameterized / pattern levels with sliders) is the design canon; *Inventing on Principle* live-coding eliminates latency between intent and effect.
- **WS-08 (Scientific viz)** — Animated Vega-Lite's *time-as-encoding* grammar; ParaView animation; Mol* MD playback — temporal as first-class.
- **WS-04 (Palantir)** — Recognized as the design canon for the "process = DAG over typed entities" pattern; none of the surveyed tools implement Victor's full vision.

(2 WS direct + 1 inspirational; on the boundary. Headlined because the *compute* missing in 2012 is now here, per WS-11's "Predictions that are NOW feasible" section.)

**Synthesis statement:** Victor's vision (sliders over abstraction levels, zero-latency cause-effect, no hidden state) requires sub-second recompute and lightweight typed substrates — both now available. Jarvis is uniquely positioned to ship Victor patterns that were design fiction in 2012.

**Implications for Jarvis:**
- Ghost-preview (T14) is a direct Victor implementation.
- A *time-scrubber* over the agent reasoning trace (per WS-07 Open question #5).
- An *abstraction slider* per artifact: claim → summary → body → linked (per WS-11 LOD-along-meaning, not LOD-along-distance).

**Open question:** Is an abstraction slider a per-artifact affordance or a global lens? Probably per-artifact with a global default; experimental.

---

### T20. Personal viewspecs / saveable lenses survive across tools  [strong]

**Evidence:**
- **WS-11 (Novel/historical)** — Engelbart's *viewspec*: declarative filter + format + indent + label rules saved per user, applied to any subtree. NLS's most enduring contribution to interface design.
- **WS-03 (BI)** — Power BI bookmarks (filters + visibility + drill state + spotlight); Tableau Story Points; Looker view-state.
- **WS-04 (Palantir)** — Object Explorer Saved Explorations: query + filter + chart-config + layout as named sharable artifact.
- **WS-10 (Game/3D UX)** — Civ VI lens system (`1-9` keys cycle map lenses); Blender workspaces; MSFS pop-out panel profiles.
- **WS-05 (PKM)** — Tana's supertag views; Heptabase calendar-drop journal layout; Capacities view-per-object-type.

**Synthesis statement:** Saved combinations of (filter + format + camera + selection) are universal across operator tools; they let one user view the same underlying data multiple ways without re-querying, and they let teams share their working frame. Jarvis's current Bookmarks (Shift+1..9) capture only the camera — leaving the most valuable axes (filter, selection, layout) on the table.

**Implications for Jarvis:**
- Extend Bookmark schema: `bookmark { id, name, camera, filter, selection, layoutPlanRef, panelArrangement, lens }`. See `patterns.md#bookmark-extended`.
- Ship 3 pre-seeded workspaces ("Compose", "Read", "Layout") per WS-10 Implication.
- Each lens (per T2's LOD-along-meaning) is a saveable Bookmark axis.

**Open question:** Naming convention for the extended Bookmarks — call them "Views" or "Consoles" or "Workspaces"? Probably "View" for canvas-mode lenses, "Console" for Console-mode slot arrangements.

---

## Theme dependency graph

For Phase 4 planning, themes cluster into three reinforcing groups:

**Cluster A — The AR-bridge essentials** (must land before any AR work pays off):
- T1 (stability), T8 (anchoring), T17 (graph-is-workspace), T9 (preattentive), T7 (animation), T18 (voice).

**Cluster B — The LLM steerability essentials** (let the agent work better today):
- T3 (typed ontology), T16 (declarative), T10 (algebraic selection), T11 (filter vs selection), T14 (plan-then-execute), T20 (saveable views).

**Cluster C — The Jarvis-shaped differentiation** (where Jarvis is uniquely positioned):
- T4 (3D reasoning trace), T15 (branch/retry first-class), T12 (Console mode), T13 (process+result), T19 (Victor's ladder), T2 (focus-plus-context), T6 (brushing in 3D).

Phase 4 should land all of Cluster A and most of Cluster B before tackling Cluster C — otherwise the differentiating features won't have the substrate they need.

---

## Themes considered and demoted

For audit completeness, candidate themes raised during synthesis but not headlined:

- **"Marking menus / radial menus dominate expert input"** — Only strong in WS-09 + WS-10; AR-relevance noted but vendor docs (WS-02) don't yet converge. Demoted to a pattern (`patterns.md#marking-menu`); revisit post-WebXR.
- **"Bookmark fragility from added/removed elements"** — A real cross-tool issue but more of an anti-pattern than a design idea. Captured in patterns.md.
- **"Multi-monitor mental model is fundamentally different from single-screen"** — Strong in WS-12, weak elsewhere. Folded into T12 (Console mode).
- **"Decorative 3D is a category failure"** — Strong across WS-01, WS-05, WS-09 — but it's an *anti-pattern*, not a design idea. Captured in patterns.md anti-patterns section.
- **"Real-time collaboration via CRDT"** — Strong in WS-06, WS-09 — but Jarvis is single-user for now; defer until multi-user is a real concern.

---

## Cross-references

- Pattern catalog: `patterns.md` (sub-task A)
- Tradeoff matrices: `tradeoffs.md` (this sub-task)
- Open problems: `open-problems.md` (sub-task C, forthcoming)
- AR-readiness baseline: `../ar-readiness-inventory.md`
- Source briefs: `../01-academic-foundations.md` through `../12-multi-dashboard-spatial.md`
