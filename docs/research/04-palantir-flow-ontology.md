# WS-04 — Palantir, Data Flow, Ontology, and Lineage

**Scope:** How Palantir Foundry / Gotham / AIP and the broader family of data-flow / lineage / ontology tools (dbt, OpenLineage/Marquez, Airflow/Dagster/Prefect, DataHub/Atlan/Amundsen, Neo4j Bloom/Linkurious, ComfyUI, Kumu, Hex) represent **typed entities, typed relationships, processes, and lineage** in their UIs. Extracts the *patterns* — not product comparisons — that can transfer into Interactive Jarvis's spatial language. Excludes: BI dashboard composition (covered in WS-03), generic node-flow editors not tied to data lineage (WS-09), pure knowledge-graph PKM tools (WS-05).
**Date:** 2026-05-23
**Sources consulted:** 19 primary (Palantir docs, OpenLineage spec, vendor docs) + 11 supporting (blog posts, third-party walkthroughs, Substack analyses).

---

## Tools / sources surveyed

- **Palantir Foundry — Ontology (Object Types, Link Types, Action Types, Functions, Interfaces)** — [docs, 2024-25]. Vendor doc. The "operational layer" treating typed entities + typed relationships + typed mutations as the central data model. *Deeply analyzed.* (Tier A) [1][2][8][9]
- **Palantir Foundry — Pipeline Builder** — [docs]. DAG of transforms (table-level + expression-level), pruning unused branches, outputting datasets *or* Ontology objects. *Deeply analyzed.* (Tier A) [3]
- **Palantir Foundry — Code Workspaces** — [docs]. Notebook-DAG hybrid: JupyterLab/RStudio that publishes notebooks as DAG transforms registered with build/lineage/schedules. (Tier A) [4]
- **Palantir Foundry — Object Explorer** — [docs]. Top-down entity browser: search → filter → linked chart panels (listogram/histogram/grid plot/map) → save Exploration. *Deeply analyzed.* (Tier A) [5][12]
- **Palantir Foundry — Vertex** — [docs]. Graph-of-objects application: Search Around (right-click expand), intermediate edges, configurable node/edge styling, six auto-layouts. *Deeply analyzed.* (Tier A) [6][7]
- **Palantir Foundry — Workshop** — [docs]. Codeless app builder over Ontology: sections + widgets + Events; drag-and-drop drop zones. (Tier A) [10]
- **Palantir Foundry — Slate** — [docs]. Code-friendlier app builder for ontology-aware apps with custom CSS/JS. (Tier A) [11]
- **Palantir Foundry — Map + Histogram** — [docs]. Linked-views: histogram row select → filter map (filter-to / filter-out), filters are temporary, opacity dims non-matching. *Deeply analyzed.* (Tier A) [13]
- **Palantir Foundry — Data Lineage Graph** — [docs]. Resource-typed nodes (datasets, pipelines, ontology entities), out-of-date status, build-from-graph. (Tier A) [14]
- **Palantir Gotham — Object Explorer / Graph / Map / Timeline** — [Substack + service-definition PDF]. Investigator workflow: link analysis + geospatial + timeline as linked views. (Tier B — gated docs; public talks limited) [15][16]
- **Palantir AIP — Ontology-Augmented Generation (OAG)** — [Palantir blog + docs]. LLM consumes typed Ontology objects (not text chunks) as tool returns; ontology = tool surface. (Tier A) [17][18]
- **dbt Cloud — Lineage Graph (DAG over `ref()` dependencies)** — [docs, Metaplane, hevodata]. Upstream-left, downstream-right; directional arrows. *Pattern source.* (Tier A) [19]
- **OpenLineage + Marquez** — [openlineage.io, MarquezProject]. Open standard schema: `Run`, `Job`, `Dataset`, `Facet`. Marquez = reference UI. (Tier A) [20][21]
- **Dagster — Software-Defined Assets + Asset Graph** — [Dagster docs, ZenML]. Asset-centric model: each asset *is* a node, lineage is intrinsic, single pane of glass. (Tier A) [22]
- **Apache Airflow / Prefect** — [comparative blogs 2025-26]. Task-centric DAGs with timeline + grid run views. (Tier B) [23]
- **DataHub / Atlan / Amundsen** — [Atlan + Collate Learning Center]. Catalog + column-level lineage; upstream/downstream tabs. (Tier B) [24][25]
- **Neo4j Bloom / Linkurious** — [Neo4j docs, Linkurious blog]. Codeless search-to-graph, Expand Neighbors, query templates for automation. (Tier B) [26][27]
- **ComfyUI** — [ComfyUI docs + tutorials]. Lazy-evaluated DAG, Groups, Collapse-to-Subgraph for hierarchical abstraction. (Tier B) [28]
- **Hex / Deepnote** — [Hex docs, vendor comparison]. Notebook with cell-dependency DAG (lazy reactivity), publishable as Hex projects in Airflow/Dagster/Prefect DAGs. (Tier B) [29]
- **Kumu** — [docs.kumu.io]. Systems-mapping canvas: typed elements (element-type field), filter-by-relationship-type, focus mode unveils network. (Tier C — single source) [30]
- **Bret Victor — *Up and Down the Ladder of Abstraction*** — [worrydream.com, 2011]. Interactive sliders over time / parameter abstraction; pipeline-as-stack-of-views. (Tier A — design canon) [31]

---

## Lens pass

### L1 — Spatial primitives

The data-flow / ontology family converges on a small primitive vocabulary, but Palantir is distinguished by **bundling them as a typed system**, not just rendering them.

**Universal primitives across the family:**
- **Node** — a typed entity (Foundry object, dbt model, Dagster asset, Marquez dataset, ComfyUI op, Bloom graph node). Always a rectangle/disc/card depending on tool; *the shape* almost never carries type — *the color/icon/label* does.
- **Edge** — a typed relationship: `ref()` (dbt), `link type` (Foundry), `produces/consumes` (Marquez), `wire` (ComfyUI). Direction is universally indicated by arrow or tapered line.
- **Group / Subgraph / Section** — visual containment of a sub-DAG (ComfyUI Groups, Pipeline Builder Folders + Color Groups, Workshop Sections). This is the *hierarchical abstraction* primitive.
- **Status badge / overlay** — node color or corner glyph for state (out-of-date, running, error). Always overlaid on the node, never a separate primitive.
- **Panel / widget** — in app-builders (Workshop, Slate, Object Explorer charts, Bloom scenes), a rectangular tile bound to an ontology query/filter.

**Palantir-distinguishing primitives:**
- **Action type** as a first-class primitive that mutates the graph. No other tool in this family treats writes as ontology citizens — dbt/Dagster/Marquez are read-only views of a build process. In Foundry, Actions appear as buttons inside Object Explorer / Workshop / Vertex contextual menus and as DAG-terminal "Apply Action" nodes in Pipeline Builder.
- **Interface** (polymorphic shape) — an abstract object-type that real object-types implement; useful for cross-type queries. Closest analog elsewhere: Dagster's "asset selector by tag." (Tier A) [9]
- **Intermediate edge** in Vertex — an edge that *represents* an intermediate object (event) collapsed into the link itself. Spatially: a chip on the edge mid-line carrying a count. Worth lifting verbatim. [7]

Pattern: **Typed graph as the universal substrate.** Every tool in this WS treats the world as `(typed-nodes, typed-edges)`; what differs is what *types* exist, how *strict* the schema is, and how *writes* are governed.

---

### L2 — Data → form mapping

| Input data | Visual form | Where seen |
|---|---|---|
| Real-world entity (Person, Asset, Document) | Object-type chip with color + icon + title; full "card" mode optional | Foundry Object Explorer / Vertex; Bloom |
| Typed relationship | Directed edge, styled by type (color/width/dash) | Vertex; Bloom; Linkurious |
| Time-evolving property | Subtitle / extended label on node; or time-series sparkline | Vertex extended labels [6] |
| Aggregated event count between two entities | Badge on edge; intermediate-edge chip | Vertex [6][7] |
| Pipeline transform (function, SQL, notebook cell) | Rectangle with input pins (left) + output pins (right) | Pipeline Builder, ComfyUI, Hex cell deps, Dagster |
| Dataset / asset | Rectangle (often distinct shape from transforms — e.g. Dagster shows assets as round-cornered, ops as squares) | Dagster, Marquez, dbt Cloud, OpenLineage |
| Job run | Timeline strip with status color per run; or "history" mini-card stacked below current node | Marquez, Dagster, Airflow Grid |
| Lineage (where this came from / where it goes) | Upstream-left ↔ downstream-right horizontal DAG with directional arrows | dbt, Dagster, DataHub, Atlan, Foundry Data Lineage |
| Numeric property aggregation | Histogram (date/numeric) or Listogram (string/bool) | Object Explorer [12] |
| Two-property correlation | Grid plot (color matrix) | Object Explorer [12] |
| Geographic property | Cluster map or choropleth, linked to histogram filters | Foundry Map [13] |
| Action / mutation | Button in contextual menu; terminal node in Pipeline Builder | Foundry Actions [1][9] |

**Patterns:**
1. **Pin-based directionality** — transforms have explicit input and output ports; entities (in graph tools) have implicit ports (any edge connects anywhere). The distinction signals "is this a *process* or a *thing*?"
2. **Upstream-left convention** — universal in lineage UIs. dbt explicitly: "upstream to the left, downstream to the right, with directional arrows emphasizing flow." [19] **A 3D analog must preserve this gradient** even when rotated.
3. **Status as paint, not shape** — out-of-date is a color overlay, never a new shape. Keeps geometry stable across runs.

---

### L3 — Camera & navigation

Pipeline DAGs and ontology graphs share **pan + zoom + focus** as the dominant idiom. Layouts are computed (hierarchy / radial / cluster / cartesian — Vertex offers all six [6]) rather than free 6DoF. Foundry Data Lineage adds "save and share a graph" for view-state bookmarks. Workshop pages support tabbed sections — equivalent to **named viewpoints inside the same data**.

Two patterns stand out for multi-view tools:

**Pattern: Search-driven teleport.** Bloom: type a phrase → graph re-centers on the query result; Object Explorer: search bar is the *primary* entry point; categorized results jump you to the right object-type filter. In all cases, the camera is *led by a query*, not by user navigation.

**Pattern: Expand-in-place (Search Around).** Vertex right-click → "Search Around: outgoing 'works_for' link" → new nodes are inserted *spatially adjacent* to the selected node without losing context [7]. The camera doesn't fly; the graph grows around you. Compare: Linkurious's "Expand non-leaf nodes." [27]

For 3D / AR: Vertex's six layout choices are 2D; the radial / hierarchy / cluster patterns each have established 3D analogs (sphere-layered radial, layered hierarchy, force-directed-in-volume). The **Search Around interaction model is the directly portable bit** — it's anchor-friendly (new nodes appear within a "growth zone" near the seed).

---

### L4 — Level of Detail (LOD)

Each tool has a different default LOD response:

| Tool | 10 nodes | 100 nodes | 1k nodes | 10k+ nodes |
|---|---|---|---|---|
| Vertex / Bloom | Full label + properties | Auto-layout cluster; label thinning | Group-into-edge collapse; show edge counts as badges [7] | Hard cap; use Object Explorer query first |
| dbt Cloud / Dagster | Full names | Names visible; arrows simplified | Folder/group collapse; column-lineage hidden | Subgraph filter recommended |
| ComfyUI | Full | Group sections | Collapse-to-Subgraph (NEW 2025) [28] | Hard breakage; subgraphs required |
| Pipeline Builder | Full | Color groups + folders | Folders mandatory | Same |
| Object Explorer charts | Full bars | Bucketed histogram | Auto-aggregation | Auto-aggregation, top-N |

**Universal LOD techniques:**
1. **Aggregate-into-edge** (Vertex `intermediateEdges`, link counts) — same node count, less edge complexity.
2. **Group / Subgraph collapse** (ComfyUI Collapse-to-Subgraph, Pipeline Builder Folders, Foundry Data Lineage "node coloring" by type for visual grouping).
3. **Label thinning** at distance / under density — all graph tools drop labels first, then property badges, then shrink nodes.
4. **Property-based aggregation** — Object Explorer's auto-bucketing of histograms when ranges are wide [12].

**Pattern: Hierarchical abstraction is the only working LOD for DAGs above ~200 nodes.** ComfyUI's subgraphs feature shipped in 2025 *because* large workflows became unmanageable — this is direct evidence (Tier B) that pure pan-zoom hits a wall.

---

### L5 — Anchoring (AR/VR)

All tools in this WS are 2D-screen native. **N/A directly**, but the implicit anchoring is:
- **Pipeline DAGs:** always anchored to the viewport center via auto-layout; the canvas itself is infinite-scroll, but the *current focus node* re-centers on selection.
- **Vertex / Bloom:** the *selected node* is the anchor; expansions grow around it.
- **Object Explorer:** the *active filter set* is the anchor — all panels recompute from it.

For 3D porting, this maps to **"selection-anchored view"** vs **"query-anchored view"** as two distinct anchor concepts. Foundry Workshop's drop-zone idiom (drag an object into a section to populate widget variables [10]) is a *hand-anchored* gesture done with 2D mouse — directly transferable to hand-anchored controllers in AR.

---

### L6 — Labels & legends

**Always-on for typed entities** — Vertex extended labels render real-world property values directly on the node face [6]. Pipeline Builder shows transform names always; Object Explorer charts always show axis labels.

**Hover-revealed for relationships** — most lineage UIs show edge labels only on hover or when an edge is selected (avoiding edge-label clutter on dense DAGs).

**Legend strategies:**
- Object Explorer: legend lives in a side panel that mirrors the chart's color scale (Tier A) [12]
- Vertex: legend is implicit — clicking the styling panel reveals the property → color mapping
- Marquez: legend is per-namespace color swatch in the sidebar

**Pattern: type-as-legend.** When colors encode object/link type and types are also navigable in a sidebar, the sidebar *is* the legend. This collapses two UI affordances into one — relevant for AR where panel real estate is precious.

---

### L7 — Selection & group operations

This is one of the strongest design pools in this WS — Foundry has it most developed:

- **Single selection** — click node → properties open in side panel (universal).
- **Type-filtered selection** — Object Explorer "select all matching" via histogram row click [13].
- **Range selection** — histogram shift-select row range; histogram drag-select bucket range [12][13].
- **Multi-modifier selection** — Ctrl/Cmd-click to add; shift-click for range; right-click for ops on selection [13].
- **Saved Explorations** (Object Explorer) — a query + filter + chart-config bundle that recreates a selection [5]. *This is the typed-selection-as-document pattern.*
- **Search Around as multi-select expansion** — selecting many nodes of one type → "find all that link to a target type" → returns a multi-set [7].

**Operations on multi-selection:**
- **Apply Action** — bulk mutate via Action type (Foundry) [1][9]
- **Filter-to / Filter-out** — temporary opacity-based filter (Foundry Map) [13]
- **Group into subgraph** — ComfyUI Collapse [28]
- **Send to chart panel** — Object Explorer chart-binding [12]
- **Build downstream** — Foundry Data Lineage "build from here" [14]

**Pattern: Filter ≠ Selection.** Foundry consistently distinguishes these: *selection* is a transient highlight; *filter* is a panel-wide constraint that survives navigation. Most BI tools conflate them — Palantir's separation is rare and worth modeling.

---

### L8 — Attention flow

Lineage and ontology UIs are mostly **pull, not push** — the user comes looking for status. But pipeline tools have evolved richer push signals:

- **Out-of-date glyphs** — Foundry Data Lineage shows stale datasets with a status overlay; dbt Cloud highlights with red borders; Dagster shows stale assets with a warning icon [14][22]. Color is the universal channel.
- **Run-failure ripple** — Marquez/Dagster show downstream-impact: if Job X fails, downstream datasets get tinted "affected" so the user sees the *blast radius* visually [22].
- **Live build animation** — Pipeline Builder + Dagster show currently-running nodes with a pulse or border animation.
- **Notification fold-in** — Workshop event triggers can push to widgets; Slate apps can show toast notifications.

**Pattern: Blast-radius rendering.** When a node changes state, color-cascade the change down the DAG to show downstream impact *without* opening logs. Dagster's "stale" propagation is the gold standard [22]. Directly relevant to Jarvis: when Worker finishes an artifact, downstream `derives`-edges should briefly glow.

---

### L9 — Color system

The Palantir-family color system is **type-categorical first, status-overlay second**:

- **Categorical** — one hue per object type / one per asset namespace. Vertex uses fill-color dropdowns letting users pick a property to drive coloring [6]. Bloom uses scene-level color rules.
- **Ordinal** — *rare* in lineage tools; mostly used in Object Explorer charts for sequential property values (e.g. severity).
- **Quantitative** — node sizes (Vertex line-width proportional to "transaction volume" [6]) and chart fills; never node color in lineage tools.
- **State/lifecycle** — overlay glyphs (out-of-date border, error red, queued grey, running pulse). Always overlay, never primary fill.

**Pattern: Two-layer color.** Categorical hue underneath + status overlay on top. The two layers never share a channel, so they compose without conflict. This is a directly portable rule for Jarvis (kind = hue, state = ring/glow/border).

**Anti-pattern observed:** when teams add a *third* color scale (confidence, recency, importance) to the same node fill, the result becomes uninterpretable — every Foundry doc warns about this. Stick to two.

---

### L10 — Inter-view linking

This is Palantir Gotham/Foundry's *signature* contribution. The histogram-map-graph triad is canonical:

**Selection-driven linking** (Object Explorer + Map + Histogram [12][13]):
1. User clicks a histogram bar → all matching objects are selected.
2. The map highlights selected objects; non-selected fade to lower opacity.
3. If the user converts the selection to a *filter*, the histogram itself recomputes (the bar they clicked may disappear).
4. The preview panel (right side) shows up to 20 items of the current filter set.

**Pivot** (Vertex + Object Explorer): right-click → "Search Around link 'works_for'" rebuilds the graph around the linked object type [7]. The previous view is lost unless saved as an Exploration.

**Drill-down** (Workshop + Slate): clicking a widget tile navigates to a sub-page where the entity's properties + linked objects + actions are shown [10].

**Brushing** (Foundry Map histogram): drag-select a histogram range → map dims to only that range, statistics recompute [13].

**Pattern: Filter is a panel-spanning state, selection is per-view.** This separation lets a user multi-select in one view, convert to a filter, navigate away, and return with the filter intact. Most BI tools (Tableau, Looker) fudge this distinction; Palantir doesn't.

**Pattern: Linked-views feedback loop.** Histogram counts → Map opacity → Selection → Filter → Histogram recount. The feedback loop is *intentional* and is the reason analysts can converge on a hypothesis quickly [13].

---

### L11 — Process / reasoning representation

This is the *raison d'être* of this WS. The family has three main idioms:

**Idiom A — DAG as the process itself** (dbt, Dagster, Marquez, Pipeline Builder, ComfyUI). The graph *is* the program; runs are overlay state on the graph (color = last-run status, badge = current run, timeline strip below). Inputs flow left → right.

**Idiom B — Investigation as a saved exploration** (Vertex graphs, Object Explorer saved Explorations, Bloom scenes). The *path* through the data is the artifact: a sequence of Search-Around operations, applied filters, and chart configs that recreates the analyst's reasoning [5][7].

**Idiom C — Run history as filmstrip** (Airflow Grid view, Dagster Run timeline, Marquez run metadata). Each cell in the strip = one job run; color = status. Selecting a run rewinds the view to that run's state.

**Palantir AIP — Ontology-Augmented Generation (OAG):** the LLM agent doesn't see *text chunks* — it sees *typed Ontology objects* (and their links and properties) as the return value of structured tool calls [17][18]. The agent's "view" is the same typed graph the analyst sees. This is a direct precedent for Jarvis: **agent reasoning trace and human-visible graph should share one substrate.**

**Pattern: Process = DAG of typed-operations over typed-entities.** When the process produces typed outputs that re-enter the same ontology, the user can pivot from "what happened" (run history) to "what exists now" (current state) without changing tools. dbt does this poorly (lineage and run history are separate tabs); Dagster does it well (asset graph + materialization timeline) [22]; Foundry does it best (Pipeline Builder DAG outputs can be Ontology objects directly editable in Object Explorer).

**Bret Victor's *Ladder of Abstraction* [31]** provides the design canon for this idiom: a *slider over abstraction levels* lets the user see the same process at "one specific run / all runs / parameter sweep" granularity. None of the production tools surveyed implement Victor's full vision; ComfyUI's subgraphs are the closest pragmatic instance.

---

### L12 — Multi-user, sharing, persistence

- **Persistence:** all tools persist DAG/ontology definitions in a database or version-controlled file (Pipeline Builder + Foundry git-like branching; dbt = files in repo; Marquez = OpenLineage events in Postgres; ComfyUI = JSON workflow files).
- **Sharing:** Foundry has "Save and share a graph" for Data Lineage and Vertex; Object Explorer Saved Explorations are sharable URLs; Workshop apps are deployed to user groups [14][6][5].
- **Multi-user real-time:** Hex/Deepnote are real-time collaborative (multi-cursor on the notebook DAG) [29]; Foundry Workshop allows shared sessions; Vertex graphs are saved per-user with explicit share. dbt Cloud + Dagster + Airflow are async-collaborative (PR-mediated).
- **Versioning:** Pipeline Builder transforms are versioned; Foundry data is git-branch-modeled (branches per environment); OpenLineage records every run as immutable event [3][20].

**Pattern: View-as-document.** Save a query + filter + layout + selection as a named, sharable artifact. This is universal in Palantir (Saved Exploration, Vertex graph template, Workshop variable preset). Directly portable to Jarvis as named-bookmark-plus-filter.

---

## Top patterns extracted

1. **Typed-graph substrate** — Where seen: Foundry, Bloom, Linkurious, Marquez, Dagster. Mechanism: every entity is `(type, properties, links)`; every link is `(srcType, dstType, semantics)`. Why it works: the schema lets the UI generate sensible icons, colors, expansion menus automatically. Caveat: requires a curation step; ad-hoc data fights it. (Tier A)
2. **Action as first-class** (Palantir-distinguishing) — Where seen: Foundry Action types. Mechanism: mutations are typed, governed, idempotent, and bound to the entity types they affect. Why it works: the LLM, the UI, and audit logs all see "what changed" the same way. Caveat: requires up-front modeling of all valid changes. (Tier A) [1][9]
3. **Search Around / Expand Neighbors** — Where seen: Vertex, Bloom, Linkurious. Mechanism: right-click on selected node → menu of typed outgoing/incoming link options → new nodes inserted spatially adjacent. Why it works: investigator stays in flow, doesn't lose context. Caveat: graph grows fast — needs an undo / collapse story. (Tier A) [7][27]
4. **Linked-views feedback loop** — Where seen: Foundry Map+Histogram+Object Explorer; Tableau dashboards (WS-03). Mechanism: histogram select → map filter → histogram recount, with explicit filter-vs-selection separation. Why it works: hypothesis convergence in 4-5 clicks. Caveat: requires consistent typed schema across views. (Tier A) [12][13]
5. **Upstream-left DAG convention** — Where seen: dbt, Dagster, Airflow, Marquez, Pipeline Builder, ComfyUI. Mechanism: directional arrows flow left-to-right; auto-layout enforces it. Why it works: muscle memory across the industry; predictable scroll direction. Caveat: 3D rotation can break the convention — need an axis-anchoring rule. (Tier A)
6. **Two-layer color: type + state** — Where seen: Foundry, Dagster, dbt Cloud. Mechanism: fill = categorical (entity/asset type), overlay/border = state (run status, freshness). Why it works: layers compose without channel conflict. Caveat: limits to ~12 distinguishable categorical hues. (Tier A)
7. **Blast-radius rendering** — Where seen: Dagster stale propagation, Foundry Data Lineage out-of-date, Marquez impact view. Mechanism: a state change at one node cascades color/glyph downstream. Why it works: lets user see "what's affected" without reading logs. Caveat: ripple animation can become visual noise on dense DAGs. (Tier A) [22][14]
8. **Saved Exploration / View-as-document** — Where seen: Foundry Object Explorer, Vertex templates, Workshop modules, Bloom scenes. Mechanism: bundle query + filter + chart-config + layout as a named, sharable artifact. Why it works: makes investigator reasoning *reproducible*. Caveat: explosion of saved views needs taxonomy. (Tier A) [5][6]
9. **Hierarchical subgraph abstraction** — Where seen: ComfyUI Subgraphs, Pipeline Builder Folders+Color Groups, Vertex hierarchy layout. Mechanism: group N nodes into a single representative; expand-in-place to inspect. Why it works: only working LOD strategy above ~200 nodes. Caveat: subgraph boundaries are themselves a design problem (where to cut?). (Tier B–A) [28]
10. **Intermediate-edge collapse** (Vertex-distinguishing) — Where seen: Vertex `intermediateEdges`. Mechanism: an edge that *represents* a chain through intermediate objects collapses the intermediates into a mid-line chip with counts. Why it works: keeps the cardinality visible without rendering N intermediate nodes. Caveat: only safe when the intermediate type is semantically subordinate. (Tier A) [7]
11. **Pin-based directionality for processes** — Where seen: Pipeline Builder, ComfyUI, Dagster, Hex cell deps. Mechanism: processes have explicit input ports (left) and output ports (right); entities have implicit ports. Why it works: visually distinguishes "is this a thing or an action?" without legend. Caveat: in mixed graphs (Foundry Pipeline outputting an Ontology object), the transition needs a clear visual seam. (Tier A)
12. **Ontology-Augmented Generation (OAG)** — Where seen: Palantir AIP. Mechanism: LLM consumes typed ontology objects + links (not text chunks) as tool results; reasoning is grounded in typed entities. Why it works: dramatically reduces hallucination because the model can't "make up" a typed property. Caveat: requires the ontology to be the *complete* truth-source for the question being asked. (Tier A) [17][18]

---

## Anti-patterns observed

1. **Three-color overload on a single node** — adding a third orthogonal color scale (recency on top of type+state) makes nodes uninterpretable. Foundry docs warn against; we should bake into spec. (Tier A, multiple Foundry chart docs)
2. **Lineage and run-history in separate tabs** (dbt before Cloud Explore) — splits the user's mental model. Dagster's unified asset graph + materialization timeline is the better pattern. (Tier B)
3. **Pure pan-zoom above ~200 nodes** — ComfyUI's 2025 Subgraphs shipped because workflows hit the wall; same lesson visible in early Airflow DAG views. Hierarchical abstraction is mandatory. (Tier B)
4. **Selection silently bleeds into filter** (most BI tools) — Palantir's strict separation is rare and correct; conflation breaks the user's ability to navigate while preserving constraint. (Tier A inference)
5. **Edge labels always-on at scale** — every graph tool that defaults to always-on edge labels (early Neo4j Bloom, naive force-directed PoCs) reverts to hover-only within a release cycle. (Tier B)
6. **Auto-layout that re-flows on every interaction** — Vertex's six layout options are *user-triggered*, never automatic on every node addition. Auto-reflow disorients investigators mid-thought. (Tier A inference from Vertex docs)

---

## Implications for Interactive Jarvis

1. **Promote Edge from 4 hard-coded kinds to a Link-Type schema.** Maps to L1, L2. Affects `electron/main/db/migrations.ts`, `electron/main/world-state.ts`, `renderer/src/scene/edges/*`. Effort: **M**. AR-readiness: **+** (typed link semantics let an AR layout agent style edges meaningfully even at distance; current 4-kind enum is a ceiling). Schema: `link_type {id, name, srcKind, dstKind, semantics, color, lineStyle, arrowStyle, directionality}`. Backwards-compat: keep the four existing kinds as seed link-types.

2. **Add Action-types — typed mutations on artifacts** — distinct from Worker free-form runs. Maps to L11, L7. Affects `electron/main/mcp/canvas-tools.ts`, new `electron/main/mcp/action-types.ts`, `renderer/src/components/Inspector/ActionsMenu.tsx`. Effort: **L**. AR-readiness: **+** (a typed mutation surface is the hand-gesture target par excellence; "tap action chip" works in AR). Initial 6-8 actions: `summarize`, `cluster-with`, `derive-doc`, `extract-citations`, `merge-into`, `split-into-N`, `archive`, `pin-to-bookmark`. Each binds to source kind(s), produces typed output. Compare Foundry Actions [1][9].

3. **Implement Search Around / Expand Neighbors as a right-click pattern.** Maps to L7, L11. Affects `renderer/src/components/ContextMenu.tsx`, `renderer/src/store/world-store.ts`. Effort: **S**. AR-readiness: **+** (gaze-and-pinch friendly). Right-click an artifact → menu lists outgoing edge-types with counts → selecting expands neighbors *spatially adjacent* using a local force-layout (don't reflow the whole board). Compare Vertex [7], Linkurious [27].

4. **Build a Saved Exploration / View-as-document primitive** that extends Bookmarks beyond camera-only state. Maps to L7, L12. Affects `electron/main/db/migrations.ts` (extend `bookmarks` table with `filter_state`, `selection_ids`, `pinned_chart_panels`), `renderer/src/components/Bookmarks/*`. Effort: **M**. AR-readiness: **neutral** (Bookmarks already work in AR; this is data-model only). Compare Object Explorer Saved Explorations [5].

5. **Add a Process View (DAG of Actions) as a complementary lens to the Spatial Canvas.** Maps to L11, L1, L3. Affects new `renderer/src/scene/ProcessView/*`, reuses `world-store.actions`. Effort: **L**. AR-readiness: **+** (a panel-anchored DAG that user can wall-mount). Render `actions[]` with `parentActionId` as upstream-left → downstream-right DAG; nodes are Actions, edges are `parentActionId`. Color = state; size = cost/tokens. Toggle key: P. Compare Dagster asset graph + materialization timeline [22], Marquez run UI [21].

6. **Implement two-layer color discipline (type + state, no third scale).** Maps to L9. Affects `renderer/src/scene/artifacts/ArtifactRenderer.tsx`, `renderer/src/theme/colors.ts`. Effort: **S**. AR-readiness: **+** (at distance, two distinguishable channels survive better than three). Document in `docs/product/VISUAL-LANGUAGE.md`: "kind → fill hue (categorical), state → ring/glow (overlay), confidence/recency → text-only badges, NEVER fill color." Compare Foundry/Dagster patterns.

7. **Blast-radius rendering when an artifact's state changes.** Maps to L8, L11. Affects `renderer/src/scene/edges/EdgeRenderer.tsx` (transient glow), `renderer/src/store/world-store.ts` (cascade computation). Effort: **S**. AR-readiness: **+** (in AR, a 2-3 sec downstream glow draws gaze better than a corner badge). When Worker finishes an artifact, briefly tint `derives`-downstream edges + targets for 2-3 seconds. Compare Dagster stale propagation [22], Foundry Data Lineage out-of-date [14].

---

## Three special required sections

### A. Foundry-style Ontology mapped to Jarvis

| Foundry concept | Definition | Current Jarvis | Gap / Lift |
|---|---|---|---|
| **Object Type** | Schema for an entity (Person, Asset, Document) [9] | `Artifact.kind` enum: `doc \| note \| code \| log \| image \| link \| cluster` | **Lift to a typed registry**: `object_type {id, name, icon, color, properties: [propSpec], allowedActions: [actionId]}`. Today's 7 kinds become seed types. New kinds (`chart-panel`, `flow-panel`, `agent-aura`, `process-node`) are additions, not enum churn. |
| **Property** | Typed characteristic of an object [9] | `ArtifactSpec.{summary, tags, refs, tokens}` + ad-hoc body | **Lift to structured props**: `property {key, type: 'string'\|'number'\|'date'\|'enum'\|'geo'\|'array'\|'objectRef', label, computed?}`. Today's `spec` becomes a few standard properties; per-kind props become typed. Computed props (e.g. `derived_count = count(derives-edges)`) enable Object-Explorer-style aggregations. |
| **Link Type** | Schema for a typed relationship [2] | `Edge.kind` enum: `derives \| references \| contradicts \| groups-with` | **Lift to a typed schema**: `link_type {id, name, srcKind, dstKind, semantics, color, lineStyle, arrowStyle, directionality, intermediateOf?: objectTypeId}`. Today's 4 kinds become seed link-types. Foundry's *intermediate-edge* collapse is directly portable [7]. |
| **Action Type** | Schema for a typed mutation [1] | `Action` (free-form Worker run) | **Add a parallel concept**: `action_type {id, name, inputKinds, outputKinds, params, sideEffects, agent}`. Distinct from today's `Action` (which is an *invocation log*). An action_type is the *schema* of a Worker capability; an Action is a *run instance*. New table: `action_types`. Today's free-form Worker keeps working; new typed surface enables Inspector-Actions-menu and AR hand-target chips. |
| **Function** | Server-side typed logic over the ontology [9] | MCP tools in `electron/main/mcp/*` | Already present in spirit; document the MCP set as a "Functions registry." Add a `kind: 'function'` artifact type that surfaces them as ontology citizens (LLMs can list / inspect / call). |
| **Interface** (polymorphic) | An abstract type real types implement [9] | None | **New**: e.g. `Cited` interface implemented by `doc`, `note`, `code` with method `getCitations()`. Lets cross-type queries work ("show me everything with citations"). Optional; defer to Phase 2. |
| **Object Explorer** | Top-down typed-entity browser [5] | Inspector panel (single artifact) + Search overlay | **New view: TypeExplorer panel** — left sidebar: object types tree; right: chart panels (listogram/histogram/grid) over the active type; bottom: result list. Triggers on a new shortcut (e.g. `O`). |
| **Vertex / Graph App** | Investigation graph with Search Around [6][7] | Spatial Canvas (existing) | Mostly there. **Add Search Around context menu** (Implication #3). Add intermediate-edge collapse for high-cardinality `derives` chains. |
| **Workshop** | Codeless app builder over ontology [10] | None (Inspector is single-artifact only) | **New view: Workshop-style Page** — composable panels (chart, list, action-button, ontology-search) bound to artifacts. Defer to Phase 3. |
| **Pipeline Builder** | DAG of transforms outputting Ontology objects [3] | None directly (Worker actions implicitly form a DAG via `producedArtifactIds` + `parentActionId`) | **New view: ProcessView** (Implication #5) — renders the implicit action-DAG explicitly. |
| **Data Lineage Graph** | Resource-typed nodes with status overlay [14] | None | Subsumed by ProcessView for actions; for artifacts, the existing canvas already shows `derives`-edges. Add the *out-of-date* status overlay when an upstream artifact updates but downstream hasn't re-derived. |
| **OAG (LLM consumes typed objects)** [17][18] | LLM tool returns typed Ontology objects, not text | Worker already returns artifact IDs from MCP calls | **Already aligned in principle.** Strengthen by ensuring Worker's tool definitions return typed artifact references with their `kind` + key properties, not just stringified bodies. |

ASCII sketch — *Foundry-style ontology grafted onto Jarvis*:

```
                  ┌──────────── ONTOLOGY REGISTRY ────────────┐
                  │                                            │
                  │   object_types[]      link_types[]         │
                  │   ──────────────      ──────────────       │
                  │   doc                 derives              │
                  │   note                references           │
                  │   code        ←──┐    contradicts          │
                  │   chart-panel    │    groups-with          │
                  │   flow-panel     │    cites                │
                  │   ...            │    ...                  │
                  │                  │                         │
                  │   action_types[] │    interfaces[]         │
                  │   ──────────────│    ──────────────        │
                  │   summarize     │    Cited                 │
                  │   derive-doc    │    Searchable            │
                  │   cluster-with  │    Renderable3D          │
                  │   ...           │    ...                   │
                  └──────────────────┼────────────────────────┘
                                     │
                          (typed schema drives:)
                                     │
        ┌──────────────────┬─────────┴───────┬──────────────────┐
        ▼                  ▼                 ▼                  ▼
  Spatial Canvas      TypeExplorer       ProcessView         Workshop Page
  (existing)          (NEW)              (NEW)               (PHASE 3)
                                                        
  ─ artifact = node   ─ search bar        ─ DAG of actions    ─ panels bound
  ─ edge = link       ─ chart panels      ─ left→right        ─ to typed queries
  ─ cluster = group   ─ saved explor.     ─ blast-radius      ─ action chips
  ─ Search-Around     ─ filter chips      ─ time-scrub
    (NEW)             ─ pivot

           All four views read the SAME typed ontology — type changes
           propagate everywhere; selections+filters cross-link (linked
           highlighting). LLM/Worker sees the same typed surface (OAG).
```

### B. Investigation Workflow — the Gotham pattern, applied to research

Gotham's analyst loop is **select → expand → pivot → filter**, repeated until the user converges on a hypothesis. Translated to a knowledge-research scenario on Jarvis:

**Scenario:** "Build a picture of how the Wright brothers' patent litigation affected aviation R&D investment in 1908-1914."

| Step | Gotham move | Jarvis equivalent |
|---|---|---|
| 1 | **Search** for a seed entity ("Wright Brothers Patent Case 1909") in Object Explorer's universal search bar [5] | Search overlay (`Cmd+K`) finds a seed `doc` artifact |
| 2 | **Select** the seed; Properties panel opens [6] | Click artifact → Inspector opens |
| 3 | **Expand** — right-click → Search Around outgoing `cites` links → 5 neighbor docs appear [7] | (NEW Implication #3) Right-click → "Expand: cites" → 5 neighboring docs are laid out around seed using local force-layout |
| 4 | **Pivot** — right-click "Search Around: people-mentioned-in-doc" → switches view to Person object-type [7] | Right-click → "Pivot to: people" → switches to TypeExplorer (NEW) filtered to mentioned-persons |
| 5 | **Filter** — drag-select a date range in histogram [13] | Date-range chip in FilterChips bar |
| 6 | **Linked view** — map shows where mentioned persons lived [13] | (NEW future) Map-panel widget shows geo-tagged artifacts |
| 7 | **Save Exploration** — bundle the current query + filter + chart config [5] | (NEW Implication #4) `Cmd+S` saves the current bookmark + filter + selection bundle |
| 8 | **Apply Action** on the selected set — e.g. "Mark as Reviewed" updates all selected objects [1] | (NEW Implication #2) Right-click multi-selection → Action menu → "Cluster these and write a summary" runs Worker on the set |
| 9 | **Iterate** — back to step 3, with the new seed being the cluster | Loop |

The investigator's mental model — what makes this work — is:
- The graph *remembers state across views* (filter persists when you pivot from Object Explorer to Map to Vertex).
- Every expansion is *typed* — the user knows what kind of neighbor they're adding (no surprises).
- Saved Explorations let the analyst *suspend a hypothesis* and come back later.
- Actions are *atomic* — one menu item does the right thing on the right selection without manual SQL.

The pattern that's *missing* from Jarvis today: typed expansion. Today's "show me related" is hand-coded edge-following; making it a typed Search-Around menu is the single highest-leverage change to enable Gotham-style investigation.

### C. Pipeline View — the DAG-rendering common denominator

dbt Cloud, Apache Airflow, Dagster, Prefect, ComfyUI, Pipeline Builder, OpenLineage/Marquez, Hex cell-deps — all converge on the same rendering rules:

**1. Layout: upstream left → downstream right.** Auto-computed via topological sort + layered Sugiyama. Universal. dbt's docs: "upstream models to the left of a model, downstream models to its right, with directional arrows emphasizing the flow of data" [19].

**2. Node shape distinguishes thing from action.** Datasets/assets are typically round-cornered rectangles; transforms/jobs are sharper or have distinct corner markers. Pipeline Builder uses pin-based nodes for transforms (input ports left, output ports right); Foundry Data Lineage uses round-corner for datasets, sharp-corner for jobs. (Inferred across multiple Tier A sources.)

**3. Status as color overlay on nodes.** Universal: green = fresh/success, grey = pending, yellow = stale, red = error, blue = running. Never the primary fill; always overlay or border.

**4. Run history as a sibling timeline.** Below or beside the DAG: a strip showing past runs, each cell colored by status. Selecting a run rewinds the DAG to that run's state. Airflow Grid, Dagster Runs, Marquez Lineage Events — all have this [21][22][23].

**5. Group / Subgraph as the LOD primitive.** ComfyUI Collapse-to-Subgraph [28], Pipeline Builder Folders + Color Groups, Vertex hierarchy-layout — once node count exceeds ~50, grouping becomes mandatory.

**6. Build / Re-run from any node** ("build from here"). Foundry Data Lineage [14], dbt CLI `dbt run --models +my_model+`, Dagster materialize from asset. Selection drives execution scope.

**7. Click to inspect logs / preview.** Selecting a node opens a side panel with: schema, last-run logs, preview data, downstream dependents, upstream sources. Universal pattern.

**8. Lineage = same graph, different overlay.** OpenLineage's standard treats lineage as facets attached to the same `(Run, Job, Dataset)` graph — the graph is shared, lineage is one of many overlays (column-level, run-level, schema-evolution) [20][21].

**Implication for Jarvis ProcessView:** when we build Implication #5, follow these eight rules verbatim. Action nodes have input pins (the artifacts they consume) and output pins (`producedArtifactIds`); status colors the node ring; cost/tokens drive size; selecting an action opens a familiar Inspector-style panel below with the streamed log entries (already captured in `actionLogs`). Group-by-parentActionId gives free LOD.

---

## Open questions

1. **How does Foundry handle Action discovery in AR / on a typed multi-selection?** Public docs only show 2D right-click menus. If AIP has shipped a Vision Pro / Quest port internally, no public material — needs a follow-up search closer to a Palantir event.
2. **Does intermediate-edge collapse [7] work for *non-event* objects?** Vertex examples are all event-collapse. Whether the same idiom works for collapsing chains of `derives`-edges in Jarvis (e.g. doc → cluster → summary → highlight) is an open prototype question.
3. **What is the operational performance of OAG vs RAG?** Palantir's blog [17][18] claims "dramatically reduced hallucination" but lacks benchmark numbers. Independent eval would help calibrate how much typed-object retrieval matters for Jarvis Worker.
4. **Is there a public design talk on Workshop layout decisions?** Layout/grid choice (sections > columns/rows > flow > tabs > toolbar > loop [10]) feels carefully thought-through — finding the design rationale would help when we design Workshop-style pages in Phase 3.
5. **What does the Gotham Graph view look like in 3D / VR?** Speculation in the press, no public product. Whether Palantir has internally tested 3D graph layouts and rejected them is unknown — and would shape our 3D-graph design choices significantly.

---

## References (full)

1. Palantir — *Action types • Overview*. https://www.palantir.com/docs/foundry/action-types/overview
2. Palantir — *Link types • Overview*. https://www.palantir.com/docs/foundry/object-link-types/link-types-overview
3. Palantir — *Pipeline Builder • Overview*. https://www.palantir.com/docs/foundry/pipeline-builder/overview
4. Palantir — *Code Workspaces • Overview*. https://www.palantir.com/docs/foundry/code-workspaces/overview
5. Palantir — *Object Explorer • Overview*. https://www.palantir.com/docs/foundry/object-explorer/overview
6. Palantir — *Vertex • Object and edge display options*. https://www.palantir.com/docs/foundry/vertex/graphs-display-options
7. Palantir — *Vertex • Explore object relationships*. https://www.palantir.com/docs/foundry/vertex/explore-object-relationships
8. Palantir — *Ontology • Core concepts*. https://www.palantir.com/docs/foundry/ontology/core-concepts
9. Palantir — *Ontology • Overview*. https://www.palantir.com/docs/foundry/ontology/overview
10. Palantir — *Workshop • Core concepts • Layouts*. https://www.palantir.com/docs/foundry/workshop/concepts-layouts
11. Palantir — *Slate • Overview*. https://www.palantir.com/docs/foundry/slate/overview
12. Palantir — *Object Explorer • Explore with charts*. https://www.palantir.com/docs/foundry/object-explorer/explore-charts
13. Palantir — *Map • Interact with maps • Histogram and filtering*. https://www.palantir.com/docs/foundry/map/histogram/
14. Palantir — *Data Lineage • Understand and manage datasets • Build datasets*. https://www.palantir.com/docs/foundry/data-lineage/build-datasets
15. Golding, Oliver — *Inside Palantir: Gotham*. Substack. https://goldingresearch.substack.com/p/inside-palantir-gotham
16. Palantir — *Gotham platform: service definition* (UK Digital Marketplace, 2024). https://assets.applytosupply.digitalmarketplace.service.gov.uk/g-cloud-14/documents/92736/801146272055049-service-definition-document-2024-11-26-1253.pdf
17. Palantir Blog — *Building with Palantir AIP: Data Tools for RAG / OAG*. https://blog.palantir.com/building-with-palantir-aip-data-tools-for-rag-oag-b3b509c8b0f3
18. Palantir — *Semantic search • Ontology augmented generation*. https://www.palantir.com/docs/foundry/ontology/ontology-augmented-generation
19. Metaplane / dbt — *The ultimate guide to data lineage in dbt*. https://www.metaplane.dev/blog/ultimate-guide-to-data-lineage-in-dbt
20. OpenLineage — *Getting Started*. https://openlineage.io/getting-started/
21. Marquez Project — https://marquezproject.ai/ (+ GitHub: MarquezProject/marquez)
22. Dagster — *Asset and Run Visualization* (DeepWiki distillation of Dagster docs). https://deepwiki.com/dagster-io/dagster/7.4-run-and-event-interfaces
23. Andrei Nita — *Airflow vs Prefect vs Dagster: Which Orchestrator Wins in 2026*. https://andreinita.co/blog/airflow-vs-prefect-vs-dagster/
24. Atlan — *Amundsen vs DataHub: How to Choose | 2026 Guide*. https://atlan.com/amundsen-vs-datahub/
25. Collate Learning Center — *DataHub for Data Lineage*. https://www.getcollate.io/learning-center/datahub-lineage-overview
26. Neo4j — *Bloom*. https://neo4j.com/product/bloom/
27. Linkurious — *Neo4j: Detect, visualize and analyze hidden insights*. https://linkurious.com/neo4j/
28. ComfyUI — *Introducing Subgraphs*. https://comfyui.org/en/comfyui-subgraphs-simplify-workflows
29. Deepnote — *Hex vs Deepnote: a side-by-side comparison for 2026*. https://deepnote.com/compare/hex-vs-deepnote
30. Kumu — *What is Kumu?* https://docs.kumu.io/about-kumu/what-is-kumu
31. Victor, Bret — *Up and Down the Ladder of Abstraction* (2011). http://worrydream.com/LadderOfAbstraction/
