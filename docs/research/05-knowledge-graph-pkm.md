# WS-05 — Knowledge Graph & PKM Tools

**Scope:** Personal/team knowledge-management tools that visualize the note corpus as a graph and/or as an infinite 2D canvas. Covers ~15 products spanning markdown-vault tools (Obsidian, Logseq), block-graph tools (Roam, Tana), whiteboard-cards (Heptabase), typed-object PKM (Capacities), explicit 3D thought maps (TheBrain), text-as-network analyzers (InfraNodus), system mapping (Kumu), and the heavy network-science end (Cytoscape, Gephi, Neo4j Bloom, Linkurious). Excludes plain linear notes apps (Bear, Apple Notes, Craft — mentioned only for contrast) and pure mind-map tools that don't claim a "graph" model (covered under WS-06 Spatial Canvases).

**Date:** 2026-05-23

**Sources consulted:** 11 primary product/docs pages + 9 supporting (changelogs, plugin pages, academic notes on hairball).

---

## Tools / sources surveyed

- **Obsidian** — Markdown vault with first-class Canvas (`.canvas`, JSON Canvas open spec [9]) and Graph View (force-directed 2D). Plugin ecosystem extends it: Advanced Canvas (graph-view integration, portals, presentations) [1], 3D Graph (Three.js force-directed in 3D) [10], Graph Analysis (Louvain, centrality, link prediction) [13], Excalidraw (hand-drawn vector library) [11], Smart Connections (local embeddings + AI chat) [12]. Tier A. Deeply analyzed.
- **Heptabase** — Whiteboards as the primary surface; cards are atomic notes; Journal stream auto-collects daily cards; Calendar drop places journal-by-week onto a whiteboard; Map view shows whiteboards-of-whiteboards [3]. 2026 updates added Web Cards and offline mobile widgets. Tier A. Deeply analyzed.
- **Tana** — Outliner where every node is a typed object via "supertags" (Person, Project, Task) [4]. Supertags carry fields → graph emerges as side-effect. Dec 2026 update added supertag colors, multi-model AI (GPT-5.1, Claude 4.5/4.1, Gemini 3 Pro), botless meeting recording. Tier A. Deeply analyzed.
- **Roam Research** — Block-level outliner; every block is addressable; bidirectional links between pages and blocks; right sidebar stacks an arbitrary number of pages for parallel reading [14, 5]. Graph view 2D force-directed. Dev velocity is now low — lost share to Obsidian/Tana. Tier A. Deeply analyzed.
- **Logseq** — Free local-first outliner + whiteboards + flashcards (spaced repetition) + Datalog queries [6]. May 2026 shipped SQLite-backed "DB version" that fixes prior file-based performance ceiling. Tier B.
- **TheBrain** (v15 / 2026) — The longest-running 3D-ish thought map (since 1997). "Plex" view uses radiant force-simulation layout; pivot-on-click moves the clicked thought to center [7]. v15 added Cerebro AI agentic mode. Tier A. Deeply analyzed.
- **Capacities** — Typed objects (Page, Book, Meeting, Person, custom) with property fields and Gallery/Wall/Graph views per type [8]. Tier B.
- **Reflect** — Minimalist bidirectional linked notes + AI summary/rewrite + cross-note synthesis ("what have I learned about X?") [15]. Tier C.
- **InfraNodus** — Text-to-network: words = nodes, co-occurrences = edges; Louvain communities, betweenness centrality, structural-gap detection between topical clusters [2]. Peer-reviewed methodology, WWW19. Also ships as Obsidian plugin. Tier A.
- **Kumu** — System-mapping product: stocks/flows, causal-loop diagrams, stakeholder maps using elements + connections + loops as primitives [16]. Tier B.
- **Cytoscape / Gephi** — Network-science benchtools. ForceAtlas2 (Gephi default) and Yifan-Hu used to comfortably draw up to ~100 k nodes [17, 18]. GPU implementations of FA2 achieve 40× speedup, enabling millions [19]. Tier A.
- **Neo4j Bloom** — Graph-DB exploration UI; near-natural-language search ("Show users connected to fraud cases"), perspectives = named graph projections, path-expansion controls [20]. Tier A.
- **Linkurious (Enterprise 4.3)** — Investigation UI on top of Neo4j/Neptune/etc.; QueryAI (NL → Cypher), No-Code Query Builder, expand-relations workflow used by HMRC and Zurich for fraud detection [21]. Tier A.
- **Notion / mymind / Bear / Craft** — mentioned only for contrast (Tier C).

---

## Lens pass

### L1 — Spatial primitives

There are exactly **three families** of primitives across these tools, almost no innovation in 30 years:

1. **Node-edge primitives** (Obsidian Graph, Roam, Logseq, Tana, TheBrain, Neo4j Bloom). Node = page or block; edge = wiki-link or typed relation. Some tools add a **focus node** (TheBrain's central thought, Bloom's expansion seed, Roam's open page) that pivots the view.
2. **Canvas primitives** (Obsidian Canvas / JSON Canvas spec [9], Heptabase, Excalidraw). Node = card (rectangle with markdown body, embedded note, image, or sub-canvas). Edge = arrow with optional label. **Group/frame** = a labeled enclosing rectangle, also a first-class object. The JSON Canvas spec enumerates exactly four node types: `text`, `file`, `link`, `group` — and one edge type with optional from/to side anchors and labels.
3. **Typed-object primitives** (Tana supertags, Capacities, Kumu). Object = instance of a type; edges = field values that reference another object. The graph is a side-effect of the schema, not a hand-drawn artifact.

Interactive Jarvis's current `artifact + edge(derives|references|contradicts|groups-with) + cluster` already covers the node-edge + frame story; what's missing is the **typed entity** layer (where an artifact knows it's a Person vs a Decision vs a Question) and the **focus-node pivot** mechanic.

### L2 — Data → form mapping

| Input data | Visual form across tools |
|---|---|
| Markdown note | Card (canvas) / circle node (graph) |
| Wiki-link `[[X]]` | Edge — direction = mention author → target |
| Tag `#topic` | Color-coded node group; sometimes a meta-node |
| Block reference (Roam, Logseq) | Sub-node with a back-reference edge |
| Typed object (Tana, Capacities) | Node with shape/color from supertag |
| Folder | Cluster region (Obsidian Graph color-by-folder) |
| Text co-occurrence (InfraNodus) | Word-as-node, distance reflects similarity |
| Embedding similarity (Smart Connections [12]) | Ranked side-panel suggestions — *not visualized in the graph*, surfaced as a list |
| Database row (Capacities, Tana) | Inline card with field-strip |

The **failure point repeated across the category**: a single visual primitive (node + edge) is asked to encode kind (page vs tag vs day), provenance (who linked it), strength (one mention vs fifty), and freshness (edited yesterday vs five years ago). Most tools default to "all edges look identical, all nodes are circles, color = folder only" — collapsing 5+ semantic dimensions into 2 channels.

### L3 — Camera & navigation

Pan + zoom in 2D dominates. Variations:

- **Obsidian Canvas / Heptabase / Excalidraw** — Smooth pan, scroll-zoom, frame-to-fit on selection, "Zoom to fit" hotkey. No depth.
- **Obsidian Graph View** — Same, plus a "depth" filter (how many hops out from a focus node).
- **TheBrain Plex** — Click any thought, it animates to center; surrounding thoughts re-radiate. Camera is *not* user-driven — the data layout itself animates [7]. Closest thing to "3D" feel because of motion + soft 3D depth cueing, but it's actually 2.5D radiant.
- **3D Graph (Obsidian plugin) [10]** — Three.js orbit + zoom; user drags to rotate the cloud. Demo-friendly but the consensus is "fun for 5 minutes, hard to do useful work in."
- **Roam sidebar stacking [5]** — A second navigation idiom: open page A in the main pane, shift+click linked pages B/C/D into the right sidebar where they stack vertically. No spatial layout, just an ordered scroll-stack. Andy-Matuschak-notes inspired "horizontal stacked sidebar" is requested but never shipped [14].

For Jarvis, the **focus-node pivot** (TheBrain) plus **stacked detail panes** (Roam) are the only camera ideas worth porting that aren't already in the desktop orbit+ortho setup.

### L4 — Level of Detail (LOD) — *category's central failure mode*

This is where the whole category falls down. Approximate behavior:

| N nodes | Obsidian Graph | Heptabase Canvas | TheBrain Plex | Cytoscape/Gephi | InfraNodus |
|---|---|---|---|---|---|
| 10 | clean, helpful | clean | helpful | overkill | overkill |
| 100 | still useful | still readable | helpful (radiates from focus) | clean | clean, with community colors |
| 1 000 | "label thrash" — text overlap, fps drops | becomes a mess; users start using sub-whiteboards | *still works* — only ~30 thoughts on screen at any time | clean with FA2; Yifan-Hu fast | clean with Louvain clustering |
| 10 000 | unusable hairball, fps tanks, freezes [22] | not viable in one canvas | *still works* — pivot keeps view local | Gephi: OK; Cytoscape: OK; both up to ~100 k [17] | clusters dominate; word-level lost |
| 100 000+ | abandoned; users disable graph view entirely | abandoned | the design assumes you'll never see >100 thoughts | GPU-FA2 → millions [19] | aggregate-only |

**The "abandon the graph view" threshold for the dominant PKM tools (Obsidian / Roam / Logseq) is ~1 000–2 000 nodes** — below that the graph is decorative; around that it becomes a hairball; above it nobody opens it [23, 22]. The 130 k-note vault in [22] takes 10 minutes just to index, and the graph freezes the app.

Workarounds the category has developed:

1. **Hop-depth filter** (Obsidian, TheBrain) — only show nodes within N edges of focus. Effective, but the user must pick N every time.
2. **Tag / folder filter** (Obsidian Graph filters panel) — manual partitioning.
3. **Community detection layout** (InfraNodus, Graph Analysis plugin [13]) — Louvain groups nodes into colored clusters with spatial coherence. By far the strongest mitigation in this space.
4. **Bundling** (academic [23], not shipped in PKM tools) — coalesce many parallel edges into ribbon-bundles.
5. **Refuse to scale up** (TheBrain) — design assumes user always sees ~30 thoughts; never try to draw everything. *This is the actually-working answer.*

### L5 — Anchoring (AR/VR-specific)

N/A for nearly all tools — single-screen desktop apps. **Implicit anchoring is "DOM window edge"**: Obsidian's sidebar, Heptabase's library panel, Roam's right-side stack are always pinned to a screen edge. None of these tools have a public visionOS or Quest port as of May 2026; only **3D Graph for Obsidian** is technically a WebGL scene that *could* be ported but is desktop-mouse-driven today. TheBrain's plex is the closest pseudo-3D model in shipping software, but it runs in a 2D window with depth cueing only.

For Jarvis: any PKM-style graph view must avoid Obsidian's pattern of "graph in a tab next to the editor" because that paradigm has no AR/VR translation. The TheBrain "graph *is* the workspace" model ports better.

### L6 — Labels & legends

Obsidian Graph and Roam Graph default to **distance-thinned labels** — nodes near the cursor or above a size threshold show their title; everything else is a dot. Heptabase shows the card title always on the card itself (since cards are large rectangles, not points). TheBrain shows the focus-thought label large, immediate neighbors at medium size, further thoughts as small text — a clean LOD via the radiant layout itself. InfraNodus shows top-betweenness words large, others small (font-size = importance).

Legends are nearly always absent in PKM-graph tools — color-by-folder/tag is the only "legend" and it's communicated via the filters panel, not an explicit chart. **This is a Jarvis differentiator opportunity**: most users have no idea what their colors mean.

### L7 — Selection & group operations

- **Obsidian Canvas / Heptabase / Excalidraw** — drag-lasso, shift-click extend, marquee. Multi-select → move, color, group-into-frame, delete. Heptabase adds "select all cards in tag X" via tag panel.
- **Obsidian Graph** — single hover, click → opens note; **no multi-select on the graph itself**. To "operate on a set" you go to the filters panel and edit the search query — selection-by-filter, not selection-by-pointer.
- **Roam** — block-level selection (shift+up/down for ranges); operations: indent, embed, page-link, copy block-ref.
- **Tana / Capacities** — typed-set selection: "all Person objects with field X = Y" via supertag query; bulk-edit fields.
- **Neo4j Bloom / Linkurious** — graph-pattern selection (the natural-language query). "Show me all users who transacted with merchant X in March" yields a sub-graph that's then operable: hide, expand, export, send-to-investigation [20, 21].

**Pattern worth lifting:** Tana's typed-set selection and Bloom's query-as-selection are far more powerful than canvas-style lasso once N > 100. They're saved-selections too — the *query* persists, not the *current set of IDs*.

### L8 — Attention flow

Mostly **pull-only** across the category. Obsidian's only push signal is the recent-file list. Heptabase added a journal stream that auto-collects today's cards — a soft push. TheBrain has no notion of "something changed in your brain" attention flow. The richest push exists in the enterprise tools: Linkurious surfaces fraud-pattern alerts as new sub-graphs that flash on a dashboard; that pattern doesn't exist in personal PKM at all.

Smart Connections [12] introduces a *suggestion* push: as you write, AI surfaces semantically related notes in a side view in real time. This is the most relevant "AI attention" pattern in PKM today, but it's purely textual and never modifies the graph view.

### L9 — Color system

Color is almost universally **categorical only**, encoding folder or tag membership. No tool surveyed uses ordinal-confidence color, quantitative magnitude color, or lifecycle/state color in its graph view. Obsidian Canvas adds 6 preset color swatches per card — pure decoration, no semantics. Tana's Dec 2026 supertag-color update [4] is explicitly about visual scanning ("find Persons faster"), still categorical. InfraNodus uses Louvain community as color, which is categorical-by-derivation.

Colorblind-safe palettes: only Heptabase and recent Obsidian themes ship CB-friendly defaults; none audit user-defined tag colors.

For Jarvis: there's open space for a **layered color system** — categorical for kind, ordinal for confidence (already partly there in the slider work), state for lifecycle (draft/active/archived). The PKM category has not solved this and is unlikely to.

### L10 — Inter-view linking — *canonical PKM pattern*

The strongest convention in this category: **editor + graph + back-links sidebar, linked**. Hover a node in the graph → preview pops in the side panel; click → opens in the editor; back-links panel updates as the editor cursor moves between notes. Obsidian, Logseq, Capacities, Reflect all ship this. Roam replaces the graph with the stacked-sidebar but the linking is the same — the active block in the editor highlights its references in every visible sidebar pane.

Heptabase adds a third linked view — the Map view of whiteboards — and brushing a tag on any view filters all views. Tana goes furthest: every supertag view is a live query so any field edit propagates instantly across every view that depends on it.

The convention to adopt for Jarvis: **whatever artifact is focused in the Inspector should highlight in the 3D scene, the mini-map, and the activity panel simultaneously**. Partially shipped; the missing piece is hover-only highlighting from the mini-map back into the scene.

### L11 — Process / reasoning representation — *AI-era frontier*

This is the **fastest-evolving lens** in the category. Three approaches in May 2026:

1. **Smart Connections (Obsidian) [12]** — AI surfaces related notes; no process visualization, just a suggestion list. Local embeddings; chat-mode for QA over the vault.
2. **Tana Dec 2026 multi-model AI [4]** — agent suggests supertag fields automatically when you create a new tag; meeting agent transcribes + summarizes + extracts action items as new typed objects; AI-suggested ontology nudges new objects toward existing types. Process is invisible — only the result lands as new tagged blocks.
3. **TheBrain v15 Cerebro [7]** — agentic AI that *generates structure* and attaches child thoughts. The result is visible (new nodes radiate out from the prompt), but the process trace is text-only in a side chat.

The **glaring gap across the category**: no PKM tool shows a spatial visualization of *the AI's reasoning trace itself* — which notes it read, in what order, where the embeddings clustered around the query, what gap detection surfaced. InfraNodus's gap-detection [2] is the only tool that visualizes a thinking artifact (the structural gap = a missing edge between two clusters, drawn as a dashed bridge).

For Jarvis: this is the headline differentiation opportunity. The Layout/Worker reasoning trace already exists as data — it should appear in-scene as a temporary "agent thread" that the user can scrub.

### L12 — Multi-user, sharing, persistence

- **Persistence**: Obsidian/Logseq local markdown files; Tana/Roam cloud DB; Heptabase cloud-first with offline cache; TheBrain local + cloud sync; Cytoscape/Gephi local files. **JSON Canvas [9]** is the only open file format for canvas data — Obsidian, Kinopio, others can read each other's `.canvas` files; format spec is at jsoncanvas.org v1.0.
- **Sharing**: Obsidian Publish (read-only website export); Heptabase share-link to a whiteboard; Roam multiplayer real-time on paid tier; Tana per-workspace sharing; TheBrain has public-brain hosting (Jerry's Brain at 620 k thoughts / 1.5 M links [24] is a famous example).
- **Multi-user real-time**: only Roam, Heptabase (recent), and the enterprise tools (Bloom, Linkurious) have it. Obsidian deliberately remained single-writer until 2023's Sync update.
- **For Jarvis**: JSON Canvas is the format to interoperate with if we ever want users to import their Obsidian canvases as starting points — a one-day import shim could deliver large early value.

---

## Feature matrix

| Tool | Graph view | Canvas | Typed entities | AI integration | Force-directed layout | 3D | Edge types | Abandon-graph threshold (nodes) | Sync model |
|---|---|---|---|---|---|---|---|---|---|
| Obsidian | yes (2D) | yes (JSON Canvas) | tag-only | plugin (Smart Connections) | yes (D3 / quadtree) | plugin only (3D Graph) | 1 (wiki-link) | ~1-2 k | local files + paid Sync |
| Heptabase | no | yes (primary surface) | tag + section | summary AI | no | no | 1 (arrow) | n/a (canvas not graph) | cloud-first |
| Tana | side-effect | no | first-class (supertags) | native (Dec 2026 multi-model) | implicit | no | typed (field refs) | n/a (rarely used directly) | cloud DB |
| Roam | yes (2D) | no (whiteboard add-on) | tag-only | native (limited 2026) | yes | no | 1 (page link) + block-ref | ~1 k (graph rarely used after) | cloud DB / multiplayer |
| Logseq | yes (2D) | yes (whiteboard) | tag + properties | plugin | yes | no | 1 + block-ref | ~2 k (DB version improves [6]) | local + paid Sync |
| TheBrain | yes (radiant 2.5D plex) | no | tag-only | native (Cerebro v15) | yes (radiant) | 2.5D plex + new "spatial 3D" mode | typed: parent/child/jump | designed to never show >100 | cloud sync |
| Capacities | yes (2D) | no | first-class (object types) | native | yes | no | typed | not specified | cloud |
| Reflect | yes (2D, simple) | no | tag-only | native (cross-note synthesis) | yes | no | 1 | small vaults (positioning) | cloud |
| InfraNodus | yes (2D, FA2) | no | n/a (word-graph) | native (GPT) | yes | no | co-occurrence weighted | scales via clustering | cloud + Obsidian plugin |
| Kumu | yes (2D) | partial | typed (system primitives) | no | yes | no | typed (causal-loop, stock-flow) | up to a few thousand | cloud |
| Cytoscape | yes (2D, multiple layouts) | no | typed via schema | no | yes (OpenCL Prefuse) | partial | typed | ~100 k | local files |
| Gephi | yes (2D, ForceAtlas2 / Yifan-Hu) | no | typed via schema | no | yes (FA2) | no | typed | ~100 k CPU, ~10 M GPU [19] | local files |
| Neo4j Bloom | yes (2D, multiple layouts) | no | first-class (graph DB) | NL-query | yes | no | typed (DB relations) | scales (DB-backed) | server |
| Linkurious | yes (2D) | no | first-class (graph DB) | NL-query (QueryAI) | yes | no | typed (DB relations) | scales (DB-backed) | enterprise server |

---

## Why most knowledge graphs fail at scale

Across the surveyed tools, a **convergent failure pattern** emerges. Listed roughly in the order users encounter them as the vault grows:

1. **All-edges-equal.** Wiki-links carry no weight, type, or freshness. A note referenced once and a note referenced 50 times produce indistinguishable edges. The graph thinks every connection matters identically.
2. **All-nodes-equal-shape.** Every page is a circle. A daily-journal page (referenced 300×, low semantic value) draws the same dot as a key concept (referenced 5×, high value). Visual prominence does not reflect importance.
3. **Label thrash.** As N grows, label-collision avoidance fails. Either every label is drawn and the text overlaps into illegibility, or labels are dropped past a distance threshold and the user can no longer recognize anything.
4. **Hairball.** Force-directed layout converges to a dense mass with no internal structure visible. Barnes-Hut keeps fps tolerable up to ~1-2 k [18, 19] but the *visualization itself* stops being useful long before fps becomes the bottleneck.
5. **No semantic layout.** Force-directed positions reflect physical equilibrium only, not meaning. Two adjacent nodes might be conceptually unrelated; two distant nodes might share a topic. The user cannot reason about position.
6. **Color carries one axis (folder/tag) instead of four.** Kind, confidence, magnitude, lifecycle all collapse into a single categorical color. The chart has 50× more channel capacity than is being used.
7. **The graph is a separate tab, not the workspace.** Treating the graph as a "visualization of your notes" instead of "the workspace where you work" condemns it to be opened-once-then-ignored. TheBrain is the only category exception — and its design forces you to use the plex constantly.
8. **No aggregation primitive.** When the graph fails at 2 k nodes, the tool offers no "collapse this cluster into a meta-node" operation. The user's only escape is the filter panel, which is a retreat from spatial reasoning back to text search.
9. **Reasoning is invisible.** Even with AI integration (Tana, TheBrain v15, Smart Connections), no graph shows *which subset the AI looked at* to produce its answer. The graph and the AI are decoupled.

The single strongest mitigation seen in shipping software is **Louvain community detection + Force Atlas 2** (InfraNodus, Graph Analysis plugin [13]): cluster nodes by community, lay them out so communities don't overlap, color by community, label the community itself. This buys roughly one order of magnitude — useful up to ~10 k nodes — and is the bar Jarvis should clear if it ever ships a graph view.

---

## TheBrain's 3D plex — what worked, what didn't

TheBrain has existed since 1997 — the longest continuously-developed 3D-leaning knowledge-graph product. Jerry Michalski's Brain (curated daily for 25+ years, now 620 k thoughts / 1.5 M links [24]) is the most extreme stress test of the model.

**What worked:**

- **Pivot-on-click as the only camera.** The user never pans or zooms — they click the next thought and the layout animates so that thought is now central. This radically constrains "where am I?" anxiety; there's always exactly one center, exactly one orientation [25].
- **Never show more than ~30 thoughts at once.** Radiant layout deliberately culls the graph to one ring of immediate neighbors plus a partial second ring. The 620 k-thought brain is never drawn; only the local neighborhood is. This is the only approach that scales by *not trying to scale the view*.
- **Three edge types (parent / child / jump).** Slightly typed connections without committing to a full ontology. Lets the user encode hierarchy and lateral links without 12 dropdowns.
- **Soft depth cueing (perspective, motion-blur, fade-on-distance).** Reads as 3D without being 3D. Compatible with hand+gaze input later because there's nothing genuinely volumetric to occlude.
- **Always-on, full-screen.** The plex *is* the app — not a tab next to a notes editor. This commits the user to spatial-first thinking.

**What didn't:**

- **No semantic position.** Radiant force-layout puts neighbors in a ring whose order is essentially arbitrary. The user cannot point at "the cluster about X" because there isn't one.
- **No multi-select / no batch operations.** Click-one-pivot-one is the only mode. Operations on sets of thoughts are awkward.
- **Storytelling weakness** [25]. Jerry himself flagged that the plex captures topology but not narrative — there's no "sequence of thoughts I want to walk you through." This is the same critique that makes graph views feel cold compared to Heptabase canvases.
- **Long-form reading happens elsewhere.** The Notes pane is a separate side panel — once you start reading, the plex becomes decorative. Same failure mode as Obsidian Graph + editor tab.
- **The new v15 "spatial 3D" mode** is mostly demo material; the radiant 2.5D plex remains the daily-driver view.
- **Onboarding is brutal.** Years of UX iteration have not solved the "what do I do here?" first-five-minutes problem; this is part of why TheBrain has stayed niche while Obsidian exploded.

**Take-aways for Jarvis:**

1. The pivot-on-focus camera is the single most-portable idea — works in desktop orbit *and* in AR head-fixed scenes (the camera doesn't move, the world repositions around the focus).
2. The "don't draw the whole graph" discipline is essential. Jarvis should never default to "show all artifacts" beyond a few hundred.
3. The "graph is the workspace" commitment is what makes spatial thinking stick. Putting the graph in a tab dooms it.
4. Storytelling needs a separate primitive (sequence / journey / path) — the graph alone cannot carry it.

---

## Top patterns extracted

- **Focus-pivot camera** — TheBrain plex, Neo4j Bloom expansion. Mechanism: clicked node animates to center; surrounding context re-radiates. Why it works: orientation is preserved without user navigation; never lost. Caveat: requires that there's always one canonical "current" focus — multi-select breaks the metaphor.
- **Community-detection layout** — InfraNodus, Graph Analysis plugin, Cytoscape. Mechanism: Louvain clusters nodes; spatial layout (FA2) places clusters apart; color-by-community. Why it works: reduces 10 k-node hairball to a comprehensible "map of districts." Caveat: cluster boundaries become a feature users start to over-trust.
- **Linked editor + graph + back-links triple** — Obsidian, Logseq, Capacities, Reflect. Mechanism: focus in any one view propagates highlight + scroll to all three. Why it works: lowest-overhead "linked views" pattern in any consumer category. Caveat: only works for 3 views; degrades past that.
- **Typed objects (supertags)** — Tana, Capacities, Kumu. Mechanism: every node carries a kind + structured fields; the graph emerges from references between fields. Why it works: makes filtering, querying, and bulk operations possible at any scale. Caveat: requires upfront ontology discipline — fights against capture-now-organize-later.
- **JSON-Canvas open format** — Obsidian + Kinopio + emerging ecosystem [9]. Mechanism: portable file format for canvas data with extensible per-app fields. Why it works: lets multiple tools own different surfaces over the same data. Caveat: only covers static canvas state, not interaction recordings.
- **Structural-gap detection** — InfraNodus [2]. Mechanism: identify topical clusters with high inter-cluster distance and few bridging nodes; surface as "missing connections." Why it works: gives the user something to *do* with their graph beyond admire it. Caveat: requires enough text to compute betweenness meaningfully.
- **Right-stack of detail panels** — Roam sidebar [14]. Mechanism: arbitrarily many pages stack vertically in a scrollable side pane; each is fully editable. Why it works: lets the user assemble an ad-hoc reading context without losing their main view. Caveat: pure DOM scrolling, ports awkwardly to 3D/AR.
- **AI-suggested related (semantic) without modifying the graph** — Smart Connections [12], Reflect. Mechanism: embeddings rank related notes; surface as a side list. Why it works: keeps the AI suggestion stream out of the canonical link structure (no accidental wiki-link creation). Caveat: the suggestion is invisible from the graph view itself.
- **Calendar-drop journal layout** — Heptabase [3]. Mechanism: right-click → calendar; all journal cards for the period land in a calendar grid on the canvas. Why it works: bridges temporal and spatial views with one gesture. Caveat: only works because journal cards are a known kind.
- **Natural-language graph query** — Neo4j Bloom, Linkurious QueryAI. Mechanism: user types "users connected to X via Y"; tool generates Cypher/Gremlin; result sub-graph appears. Why it works: makes saved selections expressible and shareable. Caveat: requires a typed graph DB underneath — no plug-in for free-form vaults.

---

## Anti-patterns observed

- **Graph in a tab** — Obsidian, Logseq, Roam. Treating the graph as a sibling view to the editor guarantees it gets opened once, admired, then closed forever. Once the editor has focus, the graph is dead weight.
- **All-edges-look-identical** — every PKM tool except Kumu and Bloom. Erases the semantic difference between "I cited this once in passing" and "this is the foundational reference for the entire idea."
- **Color-by-folder-only** — Obsidian Graph default. Burns the single most valuable visual channel on the least informative axis.
- **Decorative 3D** — Obsidian 3D Graph plugin [10] and similar Three.js demos. 3D adds rotation work without adding semantic depth; users return to 2D within a session.
- **AI grafted onto chat, decoupled from graph** — Tana, TheBrain, Smart Connections. The AI's reasoning never appears spatially; it lives in a text panel that ignores the graph's structure.
- **Force-directed layout treated as ground truth** — physics convergence is mistaken for meaning. Positions are arbitrary; users mistakenly read clusters that are physics artifacts.

---

## Implications for Interactive Jarvis

- **Adopt JSON Canvas as an import/export format.** Maps to L12 (persistence/sharing). Affects: `electron/main/persistence.ts`, `electron/main/mcp/` (new `canvas-import.ts` tool). Effort: **S** (~1 day for read-only import). AR-readiness: **neutral**. Lets users seed a Jarvis workspace from an Obsidian canvas; low downside since the spec [9] is small and stable.
- **Add a focus-pivot camera mode (TheBrain plex).** Maps to L3 + L4. Affects: `renderer/src/scene/CameraController` (new pivot-mode), `renderer/src/scene/layout` (animate-to-center on focus). Effort: **M** (~3-5 days). AR-readiness: **+** — pivot-on-focus works in head-fixed and world-anchored modes alike since the camera doesn't translate.
- **Default LOD: never render more than ~200 artifacts.** Maps to L4. Affects: `renderer/src/scene/SceneRoot.tsx`, mini-map filter logic. Hide artifacts > N hops from the current focus; aggregate the rest into one "and 4 720 more" meta-node per cluster. Effort: **M**. AR-readiness: **+** — fewer draw calls is always good in VR.
- **Typed-entity layer on artifacts.** Maps to L1 + L7. Affects: `electron/main/world-state.ts` (add `kind` taxonomy beyond plate-shape; e.g. `question`, `decision`, `source`, `agent-thread`), `renderer/src/scene/artifact` (shape/color per kind). Effort: **L** (cascades through Layout agent, Inspector, naming). AR-readiness: **+** — shape-coded kinds read at distance better than color alone.
- **Louvain community layout for clusters.** Maps to L4 + L9 + L10. Affects: Layout agent (`apply_layout_plan` extended with community detection on the artifact-graph), color system. Effort: **M** if we wrap an existing JS Louvain lib; **L** if hand-rolled. AR-readiness: **neutral**.
- **Spatial reasoning-trace primitive.** Maps to L11. Render the Layout/Worker reasoning trace as a temporary "agent thread" line in the scene — a sequence of dots through the artifacts the agent read, fading over time, scrubbable from the Activity panel. Affects: `renderer/src/scene/agent-thread` (new), `renderer/src/components/ActivityPanel.tsx` (scrub control). Effort: **L**. AR-readiness: **+** — this is a uniquely spatial feature, hard to render in DOM, native to 3D.
- **Saved selections as queries, not as ID lists.** Maps to L7 + L12. Implement "selection = predicate" so bookmarked selections (`kind = question AND cluster = X`) survive artifact churn. Affects: `electron/main/world-state.ts` (saved-query persistence), `renderer/src/components/Inspector` (selection chip UI). Effort: **M**. AR-readiness: **neutral**.

---

## Open questions

- **Does the focus-pivot camera survive multi-select?** Every focus-pivot tool we examined assumes one current node. Jarvis already supports multi-select. Needs prototype to see whether "pivot to centroid of selection" feels right or just feels lost.
- **Is there a useful in-scene representation for the structural-gap concept (InfraNodus)?** A dashed "missing edge" between two clusters might be a great LLM-driven prompt ("you have a lot about X and Y but never connected them — want me to draft a bridge?"), but no shipping tool does this in a graph view.
- **What replaces the editor+graph+backlinks linked-triple when you're in a headset?** The triple works because three side-by-side DOM panels are cheap. In AR, "side-by-side" requires explicit placement. Needs a separate WS-12 cross-reference.
- **Should Jarvis ever try to render a "full graph" view?** TheBrain says no. The PKM category says yes-but-it-fails. The honest answer might be to ship a mini-map-of-clusters as the only "overview" affordance and refuse to draw all artifacts at once.
- **What's the right ontology granularity?** Tana's supertags reward heavy upfront typing; Obsidian's tag-only reward freeform capture. Jarvis sits between; the sweet spot for an LLM-driven canvas where the agent can re-type artifacts on demand is unstudied in this category.

---

## References (full)

1. **Advanced Canvas (Developer-Mike) — Obsidian plugin** — github.com/developer-mike/obsidian-advanced-canvas
2. **InfraNodus — text-network analysis** — infranodus.com; method paper, *WWW19 Conference* — dl.acm.org/doi/10.1145/3308558.3314123
3. **Heptabase — Public Wiki / 2026 Changelog** — wiki.heptabase.com/changelog
4. **Tana — Supertags + Knowledge Graph + AI** — tana.inc/docs/supertags ; tana.inc/knowledge-graph ; aiproductivity.ai/tools/tana
5. **Roam Research — bidirectional links + sidebar** — clawbot.ai/wiki/productivity/roam-research-bi-directional-linked-notes ; nesslabs.com/roam-research-workflow-tips
6. **Logseq DB version (May 2026)** — discuss.logseq.com/t/whats-new-with-logseq-db-may-16th-2026/35020
7. **TheBrain v14/v15 review (radiant layout, Cerebro AI)** — seriousinsights.net/thebrain-14-review ; thebrain.com/blog/enabling-ubiquitous-non-linear-visual-knowledge
8. **Capacities — object types and views** — docs.capacities.io/reference/content-types
9. **JSON Canvas — open file format spec** — jsoncanvas.org ; github.com/obsidianmd/jsoncanvas ; obsidian.md/blog/json-canvas
10. **3D Graph (Apoo711) — Obsidian plugin** — github.com/Apoo711/obsidian-3d-graph ; obsidianstats.com/plugins/new-3d-graph
11. **Excalidraw — Obsidian plugin (zsviczian)** — github.com/zsviczian/obsidian-excalidraw-plugin
12. **Smart Connections — Obsidian plugin (brianpetro)** — smartconnections.app ; github.com/brianpetro/obsidian-smart-connections
13. **Graph Analysis — Obsidian plugin (nsntiw)** — github.com/nsntiw/obsidian-network-analysis ; obsidianstats.com/plugins/graph-analysis
14. **Roam sidebar feature requests (Andy Matuschak stacked notes)** — github.com/Roam-Research/issues/issues/116
15. **Reflect Notes — AI cross-note synthesis** — reflect.app ; aichief.com/ai-productivity-tools/reflect-run
16. **Kumu — system mapping / stocks & flows** — docs.kumu.io/overview/kumus-architecture ; docs.kumu.io/guides/templates
17. **Gephi vs Cytoscape vs Graphia performance** — figshare.com/articles/journal_contribution/20371301 (PLOS ONE supplementary)
18. **ForceAtlas2 — algorithm and Barnes-Hut analysis** — ncbi.nlm.nih.gov/pmc/articles/PMC4051631 ; jheer.github.io/barnes-hut
19. **GPU ForceAtlas2 — 40× speedup** — github.com/govertb/GPUGraphLayout
20. **Neo4j Bloom — natural-language graph query** — neo4j.com/product/bloom ; neo4j.com/docs/bloom-user-guide/current/bloom-visual-tour/search-bar
21. **Linkurious Enterprise 4.3 + QueryAI** — linkurious.com/blog/linkurious-enterprise-4-3 ; linkurious.com/decision-intelligence-platform-graph-visualization
22. **Obsidian large-vault performance forum thread (130 k notes, 10 min index)** — forum.obsidian.md/t/obsidian-graph-view-doesnt-work-for-a-large-vault/106287
23. **"Grooming the hairball" — IEEE VIS 2013 tutorial** — ieeevis.org/year/2013/tutorial/visweek/grooming-hairball-how-tidy-network-visualizations ; arxiv.org/html/2304.01311v4 (knowledge-graph users & challenges survey)
24. **Jerry's Brain (TheBrain) — 620 k thoughts** — sketch-your-mind.com/2025/sessions/brain ; jerrysbrain.com
25. **Jerry Michalski interview — storytelling weakness in PKM** — theinformed.life/2023/04/23/episode-112-jerry-michalski
