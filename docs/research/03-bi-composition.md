# WS-03 — BI dashboards: composition patterns

**Scope:** How the BI industry composes multiple dashboards/widgets in 2D and how they link views via filters, highlight, drill, brush, parameter, and navigation actions. Covers Tableau, Power BI, Looker, Mode, Superset, Metabase, Grafana, Bloomberg Terminal, Streamlit/Dash, and Stephen Few / Edward Tufte design theory. **Excludes:** Non-BI canvases (whiteboards — WS-06), node-flow editors (WS-09), spatial control rooms (WS-12), and 3D scientific viz (WS-08).

**Date:** 2026-05-23
**Sources consulted:** 24 primary vendor docs + 12 supporting blogs/papers

---

## Tools / sources surveyed

- **Tableau** — [vendor, current docs, A]. Industry incumbent for self-service BI. Distinct "actions" model (six action types: Filter, Highlight, Parameter, Set, Go-to-Sheet, Go-to-URL) and tiled/floating dashboard layout. Deeply analyzed below. [Tableau Actions docs](https://help.tableau.com/current/pro/desktop/en-us/actions.htm), [Floating vs Tiled](https://help.tableau.com/current/pro/desktop/en-us/dashboards_organize_floatingandtiled.htm)
- **Microsoft Power BI** — [vendor, May 2026 docs, A]. Default cross-filter + cross-highlight on every report page; bookmarks freeze view state; drill-through pages; decomposition tree for guided breakdown. Deeply analyzed. [Visual interactions](https://learn.microsoft.com/en-us/power-bi/consumer/end-user-interactions), [Drill-through](https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-drillthrough)
- **Looker / LookML** — [vendor, Google Cloud docs 2026, A]. Code-first model with YAML dashboards, `listen:` parameter for filter-to-tile binding, Conversational Analytics GA April 2026. [LookML dashboards](https://docs.cloud.google.com/looker/docs/building-lookml-dashboards), [Looker Conversational GA](https://cloud.google.com/blog/products/business-intelligence/looker-conversational-analytics-now-ga)
- **Mode Analytics** — [vendor, B]. SQL→Python notebook→drag-and-drop Report Builder; pioneered "code is the spec, report is the surface". [Mode notebooks](https://mode.com/notebooks/)
- **Apache Superset** — [open source, 5.0 docs, B]. "Native Filters" with scope-to-tab; chart-driven cross-filtering (per-chart toggle, no global feature flag in 5.0+). [Superset Native Filters](https://deepwiki.com/apache/superset/3.4-native-filters), [Superset Cross-filter discussion](https://github.com/apache/superset/discussions/34649)
- **Metabase** — [open source, B]. "Click behavior" customization: every column on every card can be set to drill, navigate to a question/dashboard/URL, or update a dashboard filter. [Metabase interactivity](https://www.metabase.com/docs/latest/dashboards/interactive), [Custom destinations](https://www.metabase.com/learn/metabase-basics/querying-and-dashboards/dashboards/custom-destinations)
- **Grafana** — [vendor, current 2026 docs, A]. Observability-first. Variable hierarchies (`$namespace > $service > $pod`), repeating panels, RED/USE methods, log drill-downs via Loki. [Grafana best practices](https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/best-practices/), [Grafana variables 2026](https://oneuptime.com/blog/post/2026-02-20-grafana-variables-templating/view)
- **Bloomberg Terminal + Launchpad** — [vendor, 40-year-old paradigm, A]. Four-panel multi-monitor with shared command line and explicit "linked windows" (change security in one → others update). [Bloomberg Launchpad manual](https://my.lerner.udel.edu/wp-content/uploads/BB-Getting-Started-in-Launchpad.pdf), [Bloomberg Terminal essentials](https://www.bloomberg.com/professional/insights/technology/bloomberg-terminal-essentials-ib-worksheets-launchpad/), [Color accessibility](https://www.bloomberg.com/company/stories/designing-the-terminal-for-color-accessibility/)
- **Streamlit / Plotly Dash** — [open source, A]. Two opposite reactivity models: full-script rerun (Streamlit) vs DAG of callbacks (Dash). Both can be embedded as a "tile" in larger systems. [Streamlit vs Dash 2026](https://www.usedatabrain.com/blog/streamlit-vs-dash)
- **Stephen Few** — *Information Dashboard Design* (Analytics Press, 2013, 2nd ed.) [book, A]. Defined dashboard as "at-a-glance monitoring"; coined bullet graph; argued ≤5–9 KPIs per view (cognitive load). [Book overview](https://shop.booksandbooks.com/book/9781938377006)
- **Edward Tufte** — *Beautiful Evidence* (Graphics Press, 2006) [book, A]. Small multiples; sparklines as "word-sized graphics"; data-ink ratio. [Tufte sparkline theory](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/)
- **Power BI Smart Narrative / Copilot** — [vendor, May 2025 update, A]. Auto-generates context-aware text summary visual bound to filter state. [Smart Narrative](https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-smart-narrative)
- **Tableau Pulse, Power BI Copilot, Looker Gemini** — [vendor, 2026, A]. The 2026 trio of conversational BI; metric-monitoring agents that push insights instead of waiting for the user to ask. [Comparison 2026](https://genesysgrowth.com/blog/tableau-pulse-vs-power-bi-copilot-vs-looker-looker-studio-(gemini))
- **Tableau Vision Pro app (TestFlight beta)** — [vendor, B]. Native visionOS app: 2D bar/line charts + 3D globe; gaze + pinch input. [Tableau on Vision Pro](https://www.tableau.com/blog/exploring-spatial-computing-and-immersive-analytics-vision-pro)
- **Immersion Analytics + Flow Immersive + Virtualitics** — [vendor, B/C]. Immersive-analytics niche; Immersion claims "18 dimensions per point", Flow targets storytelling, Virtualitics enterprise self-serve. [Immersion Analytics BI](https://www.immersionanalytics.com/solutions/business-intelligence/), [Flow Immersive PMC paper](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8159152/)
- **Tableau Viz-in-Tooltip** — [vendor, A]. Hover-over reveals a *second* mini-chart filtered to the hovered mark. [Tableau Viz in Tooltip](https://help.tableau.com/current/pro/desktop/en-us/viz_in_tooltip.htm)

---

## Lens pass

### L1 — Spatial primitives

BI lives in **2D-only** primitives and that constraint is load-bearing:
- **Dashboard** (Tableau) / **Report page** (Power BI) / **Dashboard** (Looker, Grafana, Superset, Metabase) — the outermost container.
- **Tile / Panel / Card / Worksheet** — a single chart/table/KPI. Always a rectangle. In Tableau called "view"; in Power BI a "visual"; in Looker an "element"; in Grafana a "panel"; in Superset/Metabase a "chart".
- **Container** (Tableau horizontal/vertical layout containers; Grafana rows) — non-data grouping rectangle that propagates resize to children. Composability via nesting.
- **Filter widget / Slicer / Native filter / Parameter control** — a UI affordance bound to a query parameter. Sits above or beside tiles.
- **Text tile / Markdown panel** — annotation as a citizen primitive (Looker `type: text`, Grafana text panel, Mode text box).
- **Action** (Tableau-specific noun) — a *behavioral* primitive: a named rule "when X is selected in source sheet, run effect Y on target sheet(s)". Six kinds. The Tableau "action" is unique in being a first-class addressable artifact, not just a property.
- **Bookmark** (Power BI) / **Story Point** (Tableau) / **View state** (Looker) — a frozen snapshot of (filters + drill state + selected page). Power BI bookmarks can capture "all visuals + filters + drill state + spotlight" (and even hide/show visuals).
- **Bloomberg Panel** — one of 4 OS-window-like panels per monitor, each with its own command line and "function tree" history.
- **Launchpad component** — Bloomberg's free-floating widget that can be world-attached (across monitors) and linked.

Notably absent in BI: **edges between tiles, regions/clusters as visual containers, axes that extend beyond one chart, anchors of any kind**. BI tiles are arranged but never *connected* by visible lines. The "linking" is invisible and behavioral, not spatial.

### L2 — Data → form mapping

BI established the de-facto vocabulary of chart types: **bar, line, area, scatter, pie/donut, treemap, heatmap, geo-map, gauge, KPI card, bullet (Few), sparkline (Tufte), waterfall, funnel, sankey, decomposition tree (PowerBI), pivot table, raw table, box plot, histogram, candlestick**. Tableau's "Show Me" panel and Looker's `type:` parameter both encode a finite enum (≈25 types). Power BI's marketplace adds ≈500 custom visuals, but the core ≈30 cover ~95% of usage.

The implicit data→form decision rules (from Stephen Few): **time-series → line; ranking → bar; part-to-whole → stacked/donut (reluctantly); deviation → bullet; distribution → histogram/box; correlation → scatter; nominal comparison → bar**. Few's *seven relationships* taxonomy is the closest thing BI has to a formal data-type registry.

KPI cards are the dominant "single number with delta" form. Power BI's 2025 Card visual adds embedded sparklines, reference labels, and sub-values — converging toward Tufte's sparkline-in-a-table ideal. Few argues ≤5–9 KPI cards per dashboard; current 2026 KPI-design guides still cite the same cognitive-load number.

The decomposition tree (Power BI) is a noteworthy hybrid: chart + UI controls in one — clicking a node splits by another dimension on the fly. This is the **closest BI equivalent of a "graph that grows under interaction"**, which Jarvis already does with cluster expansion.

### L3 — Camera & navigation

BI has no camera in any 3D sense. Navigation is:
- **Scroll** — vertical for long dashboards (Grafana, Mode, Streamlit).
- **Tabs** within a dashboard (Power BI report pages, Superset tabs, Tableau via dashboard-of-dashboards, Looker tabbed dashboards).
- **Tab strip / page navigator** (Tableau Story navigator with caption/numbers/dots/arrows variants) — explicit "story points" let you arrange dashboards as a narrative sequence.
- **Drill-through buttons** (Power BI) — explicit button that transports user to a filtered detail page; auto-generates a "back" button.
- **Bookmark navigation** — buttons that load saved bookmarks; combined with hide/show layers, this becomes a state-machine UI.
- **Bloomberg's `<PANEL>` key** — cycles focus through 4 panels. Panels keep their state independently.
- **Launchpad "Views"** — saved arrangements of windows you switch between with one shortcut.

Critical pattern: **Power BI and Tableau do NOT have a "back to previous view" by default** for cross-filter actions; only drill-through gets an auto-back-button. Designers have to wire bookmarks manually.

When there are multiple dashboards: Tableau workbooks bundle N dashboards in one file with a sheet-tab strip at the bottom; Power BI bundles N report pages with a page-tab strip; Looker has a "boards" concept that aggregates dashboards into folders. **None of them place the dashboards in 2D space** — they are stacked Z (one visible at a time). The exception is Bloomberg Launchpad, which is a 2D plane of free-floating windows always all visible.

### L4 — Level of Detail (LOD)

BI doesn't do LOD on *visual* primitives (no fade-to-glyph at distance); it does LOD on *data* aggregation:
- **At 10 rows** — raw table or labeled bar chart.
- **At 100 rows** — bar/line with all labels visible.
- **At 1 000 rows** — labels selectively shown (every-Nth-tick), `Top N` filter common (Tableau, Power BI both support).
- **At 10 000 rows** — switch to heatmap, density plot, or pre-aggregate at query layer; many BI tools refuse to render scatter past ~30k points.
- **At 100 000 – 10M rows** — query-layer aggregation is mandatory; Tableau's official guidance is "build a 100K-row summary table; querying it is much faster than scanning a 10B-row raw table every time" [b-eye](https://b-eye.com/blog/tableau-database-optimization-performance/).

Pareto / 80-20 filtering is a recurring composition pattern: a single "include only top customers contributing to 80% of revenue" toggle. Power BI ships dynamic Pareto via DAX; Tableau via Top N or LOD expressions [SQLBI Pareto](https://www.sqlbi.com/articles/dynamic-pareto-analysis-in-power-bi/).

**Decomposition tree** (Power BI) is in some sense an interactive-LOD UI: it starts with one root, then expands a level at a time — analogous to opening folders in a tree. AI-driven nodes let Copilot pick the next split for you.

Grafana's "repeating panels for every value of a variable" (e.g., one panel per pod) is essentially **dynamic small-multiples** — Tufte's idea operationalized at scale.

### L5 — Anchoring (AR/VR-specific)

N/A for the legacy BI tools — all are window-anchored (i.e., pinned to a 2D screen region). Bloomberg Launchpad is the exception with **monitor-anchored** components that the user manually places across multi-monitor setups and that survive logout — closest analog of a "world-anchored" widget in BI history.

**Tableau Vision Pro (TestFlight beta)** is the first major BI app on visionOS. Implementation uses RealityKit + ARKit; charts are rendered as flat panels with 3D depth, gaze + pinch input. Anchoring policy: head-anchored panels for navigation, world-anchored panels for "place this chart on my wall" mode. **Power BI has no Vision Pro app as of May 2026** (only iOS/Apple Watch). Immersion Analytics injects 18-dimensional scatter into existing BI stacks for AR/VR but is a niche tool.

### L6 — Labels & legends

Labels are **always visible by default** in BI; this is one of the largest divergences from 3D viz culture where labels are hover/distance-thinned. Reasons: dashboards are designed for static printouts and screenshots, not exploration. Workarounds:
- **Tooltips** (every tool) carry overflow data; hover-only by definition.
- **Viz-in-Tooltip** (Tableau) — a *second viz* renders inside the tooltip, filtered to the hovered mark. Power BI equivalent: "tooltip pages" — a dedicated mini-report page invoked on hover.
- Legends: usually fixed in a panel slot. Power BI/Tableau can auto-hide legends if the colored variable is in the title.

Conditional formatting (color-coded cell backgrounds in tables) is the BI substitute for "label-by-value": instead of a number you see a green/red shade.

### L7 — Selection & group operations

- **Click** = select a single mark; in Power BI this triggers default cross-filter/highlight of every other visual.
- **Ctrl/Cmd-click** = multi-select; same effect, OR-combined.
- **Lasso / rubber-band** = supported in Tableau scatter/map for range select.
- **Slicer / filter widget** = type-driven selection (user picks values from a list).
- **Set Action** (Tableau) = a *saved* selection that other views can reference; changing set membership is itself a navigation event. Tableau's set actions enable "asymmetric drill-down" — open only the next level for the selected value, leaving siblings collapsed.
- Group operations (delete, rename, recolor) are author-time, not viewer-time — viewers can only filter and drill.

Notably, BI has **no "group these N tiles together as a sub-dashboard"** primitive — Tableau containers come closest but are author-only.

### L8 — Attention flow

BI is overwhelmingly **pull**, not push: the user goes to the dashboard. Push signals are:
- **Conditional formatting** — red/yellow/green cells; KPI status icons.
- **Alerts** — email/SMS/mobile push when a KPI crosses a threshold. Now standard in all major BI tools.
- **Tableau Pulse** (2024+) — proactive trend alerts; agent monitors metrics and pushes anomalies.
- **Power BI Copilot anomalies** (2025+) — auto-surfaces "what changed" narratives.
- **Looker BI/Dashboard Agents** (April 2026) — agentic workflows that monitor metrics, recommend actions.
- **Smart Narrative** (Power BI) — embedded text panel that auto-updates as filters change; binds to the language of the user (Copilot rewrites it).

The visual vocabulary of attention is small: **red/green/amber color, up/down arrow, sparkline trend, bold weight, larger font, badge with delta percentage**. Few argues for ≤2 colors per dashboard outside data; the 2026 best-practice guides agree but add "supplement color with icons/shapes — 8% of men are color-deficient".

Bloomberg's amber-on-black plus blue-for-positive / red-for-negative is iconic; in 2021 Bloomberg redesigned for accessibility by retaining amber for non-semantic data while remapping market-status colors to blue/red.

### L9 — Color system

BI tools de-facto have 4+ overlapping scales and rarely manage the conflict explicitly:
- **Categorical** (one color per dimension value) — Tableau's 10-color default, Power BI theme palette.
- **Ordinal** (light-to-dark monochrome) — used in heatmaps, choropleths.
- **Quantitative diverging** (blue-white-red or similar) — for above/below-target, deviation.
- **State/semantic** (green-ok / yellow-warn / red-bad) — for KPIs and alerts.

The conflict: a bar chart colored by category can confuse a viewer trained to read color as state. Stephen Few explicitly calls this out and recommends "reserve red and green for state only". Power BI Copilot and Looker theming both allow defining scales explicitly per role; Grafana lets the panel author pick.

Colorblind-safe is now table-stakes: every major BI tool ships a CVD-safe palette as a built-in option (Tableau "Color Blind 10", Power BI "Accessible" theme, Grafana via panel options).

### L10 — Inter-view linking (★ central question)

This is the BI industry's deepest contribution. The mechanisms map cleanly:

**Default linking behavior per tool:**

| Tool | Default when you click a mark |
|---|---|
| **Power BI** | Cross-filter+cross-highlight ALL other visuals on the page (opt-out per visual) |
| **Tableau** | Nothing (must wire Actions explicitly) |
| **Looker** | Nothing (filters are widget-driven) |
| **Grafana** | Nothing (variable-driven; click drills via panel link) |
| **Superset** | Off by default until 5.0; in 5.0 enable per-chart cross-filter |
| **Metabase** | Default opens drill-through menu (offers choices) |
| **Bloomberg** | Linked components update if explicitly linked via Launchpad |

**Override mechanisms:**
- **Power BI**: Edit interactions → choose Filter / Highlight / None per source-target pair.
- **Tableau**: Author defines an Action; six types; ordered Parameter → Set → Filter → Go-to-Sheet → Highlight → Go-to-URL when multiple fire. Supports **cascading actions** (action A's effect triggers action B).
- **Looker**: `listen:` parameter in dashboard YAML binds filter to fields per tile; "drill fields" in LookML define click destinations.
- **Metabase**: per-column "Click Behavior" — drill / open question / open dashboard / open URL / update filter. Pass column value as parameter to destination.
- **Superset**: filter scoping config — limit a filter to specific tabs/charts.

**Linking pattern catalog observed:**

| Pattern | What happens | Best-known impl. |
|---|---|---|
| **Cross-filter** | Click in A removes non-matching data from B,C,D | Power BI default; Tableau filter action |
| **Cross-highlight** | Click in A dims non-matching marks in B,C,D (keeps data visible) | Power BI default for compatible visuals; Tableau highlight action |
| **Drill-down** | Click expands hierarchy *within the same visual* | Power BI hierarchy; Tableau hierarchy; decomposition tree |
| **Drill-through** | Click navigates to a *new page* filtered by the clicked entity | Power BI drill-through with auto-back; Tableau Go-to-Sheet |
| **Brushing** | Range select in A filters B (continuous) | Tableau quantitative filter via action; Power BI via slicer with brush |
| **Pivot** | Click rebuilds all views around new entity | Bloomberg (change ticker → all linked panels update); Tableau parameter actions |
| **Cascade** | Action A's output triggers Action B | Tableau cascading actions; Looker chained filter listens |
| **Tooltip-link** | Hover surfaces a viz/page filtered to hovered mark | Tableau Viz-in-Tooltip; Power BI tooltip pages |
| **Bookmark switch** | Button restores frozen state (filters + visibility) | Power BI bookmarks; Tableau Story Points |
| **Symbol sync** | Change "current entity" in one widget → others propagate | Bloomberg Launchpad linked components |
| **Variable cascade** | Selecting a value in a parent variable filters child variable options | Grafana namespace→service→pod; Metabase linked filters |
| **Click-destination URL** | Custom URL with parameters built from the clicked row | Metabase custom destinations; Tableau Go-to-URL |

### L11 — Process / reasoning representation

Traditional BI shows results, hides process. Recent shifts:
- **Mode notebooks** — make process visible: SQL → Python → markdown → viz, all in one scrollable artifact. The notebook *is* the reasoning trace.
- **Looker Conversational Analytics (GA April 2026)** — natural-language dialog history is visible alongside the resulting viz; "show your work" is in the UX.
- **Power BI Copilot "Explain this visual"** — generates a Smart Narrative bound to the visual + current filter context.
- **Tableau Pulse** — pushes "what changed" stories; the agent's reasoning is summarized in plain English.
- **Decomposition tree** (Power BI) — visible breakdown path; AI-suggested "next split" shown with a sparkle icon.

The unified pattern across BI in 2026: **the agent's reasoning is rendered as a narrative paragraph that updates with filter state**, not as a graph or trace tree. This is much less rich than Anthropic Console / LangSmith trace UIs (covered in WS-07).

### L12 — Multi-user, sharing, persistence

- **File-based**: `.twb` / `.twbx` (Tableau), `.pbix` (Power BI Desktop) — workbook as file; share via cloud server (Tableau Server, Power BI Service, Looker, Grafana Cloud).
- **URL state**: every BI tool encodes filter state in the URL — bookmark a URL = share a view. Superset, Metabase, Power BI, Tableau Public all do this.
- **Embedded analytics**: SDK to drop a dashboard into another app, with filter state programmatically controlled (Power BI Embedded, Tableau Embedded, Metabase SDK, Superset embedded).
- **Real-time collaboration**: shallow in legacy BI; Looker has comments per dashboard; Power BI has comments per visual; Tableau has comments per workbook. None do real-time cursors. Mode has shared notebooks with comments.
- **Sharing snapshot**: PowerPoint export (every tool), PDF export (every tool), scheduled email (every tool).
- **Persistence model**: data lives in the warehouse; the workbook is metadata only. Looker treats LookML as Git-versioned source code — uniquely git-native.

---

## Top patterns extracted

- **Default cross-filter / cross-highlight** — Where seen: Power BI (default), Tableau (opt-in via Action). Mechanism: clicking a mark in one visual filters/highlights all sibling visuals on the same surface. Why it works: zero-config interactivity; surfaces relationships without authoring. Caveat: surprising at first; hard to undo without explicit reset.
- **Cascading filters with explicit scope** — Where seen: Superset Native Filters, Power BI slicer-sync, Looker `listen:`, Grafana variables. Mechanism: a filter widget declares which charts it scopes to; chained filters update each other's option sets. Why it works: makes the "which widgets does this filter affect?" relationship visible and authorable. Caveat: scope explosion in large dashboards.
- **Drill-through pages with auto-back** — Where seen: Power BI. Mechanism: right-click → drill to dedicated detail page; back button auto-added. Why it works: detail context never lost; user always has a way home. Caveat: each drill destination must be authored.
- **Viz-in-Tooltip / Tooltip pages** — Where seen: Tableau, Power BI. Mechanism: hover over mark surfaces a second mini-visual filtered to the hovered entity. Why it works: progressive disclosure without consuming dashboard real estate. Caveat: static (Tableau), heavy hover-trap risk in 3D.
- **Tiled responsive grid + nested containers** — Where seen: Tableau, Looker, Grafana. Mechanism: tiled layout auto-resizes proportionally; nested containers group related tiles for joint resize. Why it works: dashboards survive being viewed at multiple resolutions. Caveat: rigid; doesn't compose with "place a chart anywhere" canvases.
- **Bookmark / Story Point state-machine** — Where seen: Power BI bookmarks, Tableau Story Points. Mechanism: a bookmark captures (filters + visibility + drill state + spotlight); buttons load bookmarks; navigator gives "next/prev/dot" UI. Why it works: lets authors choreograph a narrative path through a dataset. Caveat: ZERO of these survive ad-hoc viewer exploration — they assume linear consumption.
- **Repeating panels per variable** — Where seen: Grafana. Mechanism: declare a panel once; it renders N times, one per value of a template variable. Why it works: dynamic small-multiples without authoring overhead; scales to "one panel per pod" without touching the dashboard. Caveat: visual explosion past ~30 instances; needs LOD strategy.
- **Symbol sync across linked windows** — Where seen: Bloomberg Launchpad. Mechanism: components are "linked"; changing the focus security in one updates all linked components. Why it works: lets a user use 4 monitors as one workspace; eliminates re-querying. Caveat: scale poorly past ~20 linked components.
- **Smart Narrative / generated insight panel** — Where seen: Power BI, Tableau Pulse, Looker Gemini. Mechanism: an LLM auto-writes a paragraph that updates with filter state, citing the values. Why it works: lowers chart-reading skill threshold; surfaces what changed. Caveat: text is read serially; for 12 cards, you read 12 paragraphs.
- **Conditional formatting as glyph-replacement** — Where seen: every BI tool. Mechanism: cell background color or icon encodes value/state; supplements or replaces the number. Why it works: at-a-glance scanning of a 50-row table for "anything red". Caveat: color-blind users need icon backup.

---

## Anti-patterns observed

- **Floating-only layout that breaks on resize** — Where: Tableau floating without tiled wrapper. Designers float everything because it looks pixel-perfect at design resolution, then layouts shatter on tablet/phone. Tableau docs explicitly warn: "tiled by default; float only for callouts" [Tableau floating vs tiled](https://www.tableau.com/drive/floating-versus-tiled-dashboards).
- **Cross-filter cascades that don't terminate / loop** — Power BI lets you create cycles where A filters B filters A; rendering thrashes. Tableau guards against this in its action order rules; Power BI relies on data-model relationship cardinality. Failure mode: undefined or wrong filter context.
- **>9 KPI cards per dashboard** — Few warned in 2006; ignored by 2026 dashboard designers chasing executive demand. Failure mode: nothing stands out; users scan top-left and miss the rest.
- **Decoration over data** (Tufte's data-ink ratio violation) — gradient backgrounds, 3D bars, drop shadows, gauge skeuomorphism. Resurgent in 2025 with "AI-generated theming". Power BI's default themes lean simpler, but custom marketplace visuals often regress.
- **Drill-through with no obvious affordance** — Power BI drill-through is only discoverable via right-click on a mark; many users never find it. Compare to Metabase, which opens a drill menu on every click and is over-eager but discoverable.
- **Bookmark fragility** — Power BI bookmarks freeze (visual list + filter state). Add a new visual to the page → bookmark may break or hide the new visual silently. Authors discover this in production.
- **"Story" as linear-only** — Tableau Stories assume the viewer reads in order; non-linear exploration is forced through bookmarks the author may not have built. No spatial branching.

---

## Implications for Interactive Jarvis

- **Adopt an explicit "Action" first-class object (a la Tableau)** — Maps to L10. Currently linking in Jarvis happens via edges (typed relationships between artifacts) but there's no behavioral analog: "when X is selected/edited, do Y to Z". File `electron/main/world-state.ts` would gain an `Action` record; `renderer/src/scene/` would render an "action arrow" visualization on hover/select that shows the cascade preview. **Effort: M. AR-readiness: +** (actions are abstract, work in any space).

- **Cross-highlight by default for typed edges** — Maps to L10 + L8. Hovering a card already shows its edges; extend so hover dims all artifacts NOT connected via any edge to the hovered one (analog of Power BI cross-highlight). Files: `renderer/src/scene/Canvas.tsx`, `electron/main/world-state.ts` (for query). **Effort: S. AR-readiness: +**.

- **Tooltip-as-mini-view (Viz-in-Tooltip pattern)** — Maps to L6 + L10. When hovering an artifact, render a small floating panel with the artifact's spec + first 3 connected artifacts as glyphs. Avoid DOM `<Html>` for AR migration; use `troika-three-text` + R3F primitives. Files: `renderer/src/scene/ArtifactCard.tsx`, new `renderer/src/scene/HoverPanel.tsx`. **Effort: M. AR-readiness: +** (works in both desktop and gaze-hover AR).

- **"Repeating panel" pattern for cluster expansion** — Maps to L4. When a cluster contains N similar artifacts (same `kind`, similar `spec`), render them as a small-multiples grid floating from the cluster anchor. Equivalent of Grafana repeating panels. File: `electron/main/cluster-tools.ts`, `renderer/src/scene/ClusterRegion.tsx`. **Effort: M. AR-readiness: neutral**.

- **Bookmark = saved (camera + filter + visibility) state** — Maps to L3. Today Jarvis has Shift+1..9 bookmarks for camera only. Extend to capture filter state (which kinds are visible, which edges are routed, which Layout plan was applied last). Files: `electron/main/bookmarks.ts` (new), update `renderer/src/scene/CameraControls.tsx`. **Effort: M. AR-readiness: +** (bookmarks become world-anchored "rooms" in AR).

- **Conditional formatting on artifact cards** — Maps to L9. Today every card is the same color. Adopt Few's 4-scale model explicitly: categorical (kind), ordinal (LLM-confidence), quantitative (recency/relevance score), state (todo/blocked/done/needs-review). Reserve red/amber/green for state only, never for kind. Files: `renderer/src/scene/ArtifactCard.tsx`, new `renderer/src/theme/color-roles.ts`. **Effort: S. AR-readiness: +** (color survives any rendering pipeline).

- **Smart-Narrative-style "what changed" panel** — Maps to L8 + L11. A persistent (always-visible at workspace edge) text panel that the Worker agent updates as the workspace mutates: "Layout regrouped 12 artifacts into 3 clusters; 4 new edges of kind `derives`; 1 cluster archived". Files: `renderer/src/scene/Narrative.tsx` (new), wire to event bus in `electron/main/event-bus.ts`. **Effort: M. AR-readiness: +** (becomes the head-anchored HUD ticker in AR).

---

## What BI does well in 2D that Interactive Jarvis lacks in 3D

A blunt inventory of capabilities the BI industry has industrialized but that Jarvis does not yet have. Each is a candidate backlog item.

1. **Default cross-highlight on click/hover** — Power BI ships this in every dashboard; Jarvis only highlights direct neighbors via edge follow.
2. **Cross-filter as a verb** — Selecting an artifact does not currently filter the rest of the workspace; nothing is dimmed/removed.
3. **Drill-through with auto-back navigation** — No "open detail view, then return" pattern; opening Inspector is modal, not part of a back-stack.
4. **Tooltip with embedded mini-viz** — Jarvis tooltips are text-only.
5. **Bookmarks that capture *state*, not just camera** — Shift+1..9 saves camera position only; no filter / visibility / Layout plan capture.
6. **Action ordering / cascade rules** — No model for "if A changes, do B then C"; agents are imperatively driven.
7. **Repeating-panel small-multiples** — No "render this artifact N times, one per value of variable X" primitive.
8. **Slicer / filter widget as a first-class addressable object** — Filters in Jarvis live in code; no on-canvas knob to twist.
9. **Conditional formatting / state palette** — Cards do not encode todo/blocked/done state as color; everything is monochrome plates.
10. **KPI summary card with delta + sparkline** — No "this is the headline number, here's the trend" primitive.
11. **Tab strip / page-tab navigator** — No "switch dashboard" mechanic; only one workspace at a time.
12. **Story Points / narrative arrangement** — No way to author a guided sequence of views with next/prev.
13. **Decomposition tree** — No interactive "split by another dimension" affordance on clusters.
14. **Smart-narrative auto-summary** — No always-on text describing the workspace state.
15. **Symbol-sync across linked panels (Bloomberg-style)** — No "current entity" concept that propagates across multiple views.

---

## Open questions

1. **3D adapts the linking patterns how?** Cross-filter dims marks in a 2D chart visually; in 3D space, do we move artifacts apart (push non-matches into a "dimmed cluster") or change their material/opacity? Both have AR-readiness costs.
2. **What is the spatial vocabulary of "filter scope"?** In Superset/Power BI the scope is implied by page/tab. In a single 3D workspace with no pages, how does the user know which artifacts a filter affects? Visible "scope region" (a translucent volume)?
3. **Does the LLM compose multiple dashboards, or does it compose one dashboard with multiple linked sub-views?** WS-12 will fight with this; WS-03 reads as the latter (BI prefers one dashboard with many tiles) but Jarvis's spatial story suggests the former.
4. **How does Tableau Vision Pro feel in practice?** TestFlight beta — no public usability data. Worth a research follow-up: try the app and write a separate report on what's good/bad for our purposes.
5. **Can we get away without a "page" primitive?** Every major BI tool ships pages/tabs (Power BI report pages, Tableau workbook tabs, Looker tabbed dashboards). Spatial UI tradition (Miro, tldraw) refuses pages and uses infinite canvas instead. WS-06 has more on this; the choice has big AR implications.

---

## References (full)

1. Tableau Help: Actions and Dashboards — https://help.tableau.com/current/pro/desktop/en-us/actions_dashboards.htm
2. Tableau Help: Actions (overview) — https://help.tableau.com/current/pro/desktop/en-us/actions.htm
3. Tableau Help: Filter Actions — https://help.tableau.com/current/pro/desktop/en-us/actions_filter.htm
4. Tableau Help: Set Actions — https://help.tableau.com/current/pro/desktop/en-us/actions_sets.htm
5. Tableau Help: Viz in Tooltip — https://help.tableau.com/current/pro/desktop/en-us/viz_in_tooltip.htm
6. Tableau Drive: Floating vs Tiled — https://www.tableau.com/drive/floating-versus-tiled-dashboards
7. Tableau Help: Floating and Tiled layouts — https://help.tableau.com/current/pro/desktop/en-us/dashboards_organize_floatingandtiled.htm
8. Tableau Help: Apply Filters to Multiple Worksheets — https://help.tableau.com/current/pro/desktop/en-us/filtering_global.htm
9. Tableau Help: Device-specific dashboard layouts — https://help.tableau.com/current/pro/desktop/en-us/dashboards_dsd_create.htm
10. Tableau blog: Vision Pro spatial computing & immersive analytics — https://www.tableau.com/blog/exploring-spatial-computing-and-immersive-analytics-vision-pro
11. Tableau Research: Dashboard Zoo to Census — https://www.tableau.com/blog/tableau-research-understanding-dashboard-design-at-scale
12. Microsoft Learn: How visuals cross-filter each other in Power BI — https://learn.microsoft.com/en-us/power-bi/consumer/end-user-interactions
13. Microsoft Learn: Change How Visuals Interact — https://learn.microsoft.com/en-us/power-bi/create-reports/service-reports-visual-interactions
14. Microsoft Learn: Filters and Highlighting — https://learn.microsoft.com/en-us/power-bi/create-reports/power-bi-reports-filters-and-highlighting
15. Microsoft Learn: Drillthrough in Power BI Reports — https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-drillthrough
16. Microsoft Learn: Smart Narrative — https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-smart-narrative
17. Microsoft Learn: KPI Visuals — https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-kpi
18. Microsoft Learn: Buttons in Power BI service — https://learn.microsoft.com/en-us/power-bi/explore-reports/end-user-buttons
19. Power BI Community: May 2025 update game-changers — https://community.fabric.microsoft.com/t5/Power-BI-Community-Blog/Power-BI-Enters-a-New-Era-3-Game-Changing-Features-from-the-May/ba-p/4706757
20. SQLBI: Dynamic Pareto Analysis in Power BI — https://www.sqlbi.com/articles/dynamic-pareto-analysis-in-power-bi/
21. Anthony Smoak: Power BI Decomposition Tree Guide — https://anthonysmoak.com/2023/11/27/the-power-bi-decomposition-tree-guide-for-data-analysis/
22. Google Cloud: Building LookML Dashboards — https://docs.cloud.google.com/looker/docs/building-lookml-dashboards
23. Google Cloud: LookML Dashboard Parameters — https://docs.cloud.google.com/looker/docs/reference/param-lookml-dashboard
24. Google Cloud: Looker Conversational Analytics GA — https://cloud.google.com/blog/products/business-intelligence/looker-conversational-analytics-now-ga
25. Google Cloud: Conversational Analytics in Looker overview — https://docs.cloud.google.com/looker/docs/conversational-analytics-overview
26. Google Cloud: Looker tile extensions — https://docs.cloud.google.com/looker/docs/extension-framework-building-tile-extensions
27. Mode Analytics: Notebooks — https://mode.com/notebooks/
28. Mode Analytics: Reports & Dashboards — https://mode.com/reports-and-dashboards/
29. Mode Support: The Notebook — https://mode.com/help/articles/notebook/
30. Apache Superset (DeepWiki): Native Filters — https://deepwiki.com/apache/superset/3.4-native-filters
31. Preset blog: Managing Filter State for Embedded Dashboards — https://preset.io/blog/managing-filter-state-for-embedded-dashboards/
32. Superset GitHub Discussion: cross filtering in 5.0.0 — https://github.com/apache/superset/discussions/34649
33. Metabase Docs: Dashboard Interactivity — https://www.metabase.com/docs/latest/dashboards/interactive
34. Metabase Learn: Custom Click Destinations — https://www.metabase.com/learn/metabase-basics/querying-and-dashboards/dashboards/custom-destinations
35. Metabase Learn: Cross-filtering tutorial — https://www.metabase.com/learn/metabase-basics/querying-and-dashboards/dashboards/cross-filtering
36. Metabase Learn: Linking filters in dashboards — https://www.metabase.com/learn/metabase-basics/querying-and-dashboards/dashboards/linking-filters
37. Grafana Docs: Dashboard best practices — https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/best-practices/
38. Grafana Cloud Docs: Add variables and adjust layouts — https://grafana.com/docs/grafana-cloud/machine-learning/assistant/dashboards/add-variables-and-layouts/
39. Grafana Labs: Add Logs Drilldown to a dashboard — https://grafana.com/docs/learning-paths/drilldown-logs/add-log-dashboard/
40. groundcover: Grafana Observability Dashboards Best Practices — https://www.groundcover.com/learn/observability/grafana-dashboards
41. OneUptime: Grafana Variables and Templating (Feb 2026) — https://oneuptime.com/blog/post/2026-02-20-grafana-variables-templating/view
42. Bloomberg: Designing the Terminal for Color Accessibility — https://www.bloomberg.com/company/stories/designing-the-terminal-for-color-accessibility/
43. Bloomberg Professional: Terminal Essentials — IB, Worksheets & Launchpad — https://www.bloomberg.com/professional/insights/technology/bloomberg-terminal-essentials-ib-worksheets-launchpad/
44. University of Delaware Lerner: Bloomberg Launchpad Getting Started — https://my.lerner.udel.edu/wp-content/uploads/BB-Getting-Started-in-Launchpad.pdf
45. Wharton Lippincott Library: Bloomberg Launchpad Part III — https://lippincottlibrary.wordpress.com/2013/09/02/bloomberg-launchpad-part-iii/
46. Streamlit vs Dash in 2026 (UsedataBrain) — https://www.usedatabrain.com/blog/streamlit-vs-dash
47. Reflex: Streamlit vs Dash Python Dashboards (April 2026) — https://reflex.dev/blog/streamlit-vs-dash-python-dashboards/
48. Lean Data Engineer: Streamlit vs Dash architecture tradeoffs — https://leandataengineer.com/blog/streamlit-vs-dash-for-data-applications-architecture-tradeoffs-and-when-to-use-each/
49. Edward Tufte: Sparkline theory and practice — https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/
50. Markerbench: Review of Few's Information Dashboard Design 2nd ed — https://www.markerbench.com/posts/book-review-stephen-few/
51. Stephen Few — *Information Dashboard Design: Displaying Data for At-a-Glance Monitoring* (Analytics Press, 2013, 2nd ed.) ISBN 978-1-938377-00-6 — https://shop.booksandbooks.com/book/9781938377006
52. Edward Tufte — *Beautiful Evidence* (Graphics Press, 2006) ISBN 978-1-930824-16-5
53. Tabular Editor: Better KPI Visualizations in Power BI — https://tabulareditor.com/blog/kpi-card-best-practices-dashboard-design
54. EPC Group: Power BI KPI Visuals Enterprise Guide 2026 — https://www.epcgroup.net/power-bi-kpi-visuals-dashboard-guide-2026
55. Immersion Analytics: BI Solutions — https://www.immersionanalytics.com/solutions/business-intelligence/
56. Flow Immersive (PMC paper): Multiuser Multidimensional COVID-19 Data Visualization — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8159152/
57. WeAr Studio: Immersive Analytics in AR/VR — https://wear-studio.com/vr-ar-data-visualization/
58. Genesys Growth: Tableau Pulse vs Power BI Copilot vs Looker Gemini (2026) — https://genesysgrowth.com/blog/tableau-pulse-vs-power-bi-copilot-vs-looker-looker-studio-(gemini)
59. Improvado: Tableau vs Power BI vs Looker 2026 — https://improvado.io/blog/looker-vs-tableau-vs-power-bi
60. b-eye: Tableau Database Optimization (100K rule of thumb) — https://b-eye.com/blog/tableau-database-optimization-performance/
