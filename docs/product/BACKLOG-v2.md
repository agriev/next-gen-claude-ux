# Backlog v2 — mapped to current repo

**Назначение:** конкретные cards для реализации стратегии из [VISION.md](VISION.md) + [CONCEPT.md](CONCEPT.md) + [AR-VR-BRIDGE.md](AR-VR-BRIDGE.md) + [ROADMAP-v2.md](ROADMAP-v2.md). Каждая card — атомарный PR, привязан к файлам, эффорту, эпохе, и AR-readiness.

**Cтруктура каждой card:**

```
### [P0/P1/P2] B<NN> · <Title>
**Why:** ссылка на synthesis theme/pattern/tradeoff
**What:** 1-2 предложения о конкретном изменении
**Files:** existing files to edit + new files to create
**Reuse:** существующий код, на который опираемся
**Depends on:** id предыдущих cards (B<NN>)
**Effort:** S (часы) / M (1-5 дней) / L (1-3 недели)
**Phase:** E0 / E1 / E2 / E3 / E4 / E5
**AR-readiness:** + (помогает миграции) / - (мешает) / neutral
```

**Priority шкала:**
- **P0** — критический; без него эпоха не закрывается
- **P1** — важный; высокий leverage, но эпоха может закрыться без него
- **P2** — желательный; quality-of-life, polish, deferred-friendly

**Sort order:** Phase (E0 → E5), затем Priority (P0 → P2), затем по B-id.

**Status markers (added как мы реализуем):**
- ✓ — landed on main; card includes commit SHA in PR body
- ↻ — partial / scoped down; remaining work in a follow-up card

---

## Status snapshot (как на May 2026)

**E0 Foundation landed** через 6 waves:

| Wave | PR | Cards | Status |
|---|---|---|---|
| 1 — Foundation | [#1](https://github.com/agriev/next-gen-claude-ux/pull/1) `d58c83d` | B01 ✓ · B05 ✓ · B28 ✓ | merged |
| 2 — Schema + primitives | [#2](https://github.com/agriev/next-gen-claude-ux/pull/2) `ce760b6` | B02 ✓ · B10 ✓ · B17 ✓ | merged |
| 3 — Agent representation | [#3](https://github.com/agriev/next-gen-claude-ux/pull/3) `689b0e5` | B04 ✓ · B09 ✓ | merged |
| 4 — Interaction polish | [#4](https://github.com/agriev/next-gen-claude-ux/pull/4) `be35b36` | B03 ✓ · B07 ✓ · B11 ✓ | merged |
| 5 — Console mode | [#5](https://github.com/agriev/next-gen-claude-ux/pull/5) `8b934d1` | B16 ✓ · B21 ✓ | merged |
| 6 — Reliability | [#6](https://github.com/agriev/next-gen-claude-ux/pull/6) | B13 ✓ · B15 ✓ | in review |

**Cards landed: 15 / 28** (E0 + E1 scope). Each wave's PR body documents deferred sub-cards.

**Deferred to bis-waves** (small, intentional descopes):
- B06 (reasoning-thread 3-idiom prototype) → Wave 3-bis
- B08 (force-directed fallback worker_thread) → Wave 3-bis (depends on B06 trace data)
- B12 (streaming Worker output) → Wave 6-bis
- B14 (tool-call-trail) → Wave 4-bis (depends on B06)
- B18 (horseshoe layout algo) → Wave 5-bis
- B27 (lasso select 3D) → Wave 5-bis

**Not yet started** (E1 viz):
- B19 (chart-panel widget), B20 (flow-panel widget), B22 (timeline-axis), B23 (volume + graph-3d), B24 (camera fly-in), B25 (drill-down), B26 (time-travel scrubber)

---

## Index

| Эпоха | P0 | P1 | P2 | Всего |
|---|---|---|---|---|
| E0 Foundation | 8 | 5 | 2 | 15 |
| E1 Console mode | 6 | 4 | 2 | 12 |
| E2 AR-ready | 5 | 3 | 2 | 10 |
| E3 visionOS | 4 | 3 | 1 | 8 |
| E4 Calm-tech | 2 | 3 | 2 | 7 |
| E5 Multi-user (conditional) | 2 | 2 | 1 | 5 |
| **Total** | **27** | **20** | **10** | **57** |

---

## E0 — Foundation (months 0-3)

Цель эпохи: укрепить базу — typed link registry, ghost-preview, reasoning-trace MVP, cross-filter. См. [ROADMAP-v2.md §2 E0](ROADMAP-v2.md#e0-—-фундамент-месяцы-0-3).

### [P0] B01 · Introduce CameraController abstraction ✓ Wave 1 (`d58c83d`)
**Why:** unblocks E2 WebXR migration (M1 in [AR-VR-BRIDGE.md](AR-VR-BRIDGE.md)); also unblocks B11 Console mode camera
**What:** Refactor `<OrbitControls>` in `renderer/src/scene/Canvas.tsx:228` behind a `CameraController` interface; current behaviour becomes `OrbitCameraController` implementation
**Files:**
- new `renderer/src/scene/camera/CameraController.ts` (interface)
- new `renderer/src/scene/camera/OrbitCameraController.tsx`
- edit `renderer/src/scene/Canvas.tsx`
- edit `renderer/src/scene/Artifact.tsx:36` (consumes controls via interface)
**Reuse:** existing OrbitControls behaviour from drei
**Depends on:** —
**Effort:** S
**Phase:** E0
**AR-readiness:** +++ (enables XR camera swap)

### [P0] B02 · Typed link_type registry (Edge.kind → Link Type) ✓ Wave 2 (`ce760b6`)
**Why:** [TR4 tradeoffs](../research/synthesis/tradeoffs.md#tr4) — Palantir-style typed Object/Link/Action; addresses [T3 themes](../research/synthesis/themes.md#t3) (typed ontology beats free-form tags)
**What:** Lift `Edge.kind: 'derives' | 'references' | 'contradicts' | 'groups-with'` to a registry (`link_type_registry` table). Built-in 4 kinds remain default; users (and agents) can register new link types with `label`, `color`, `icon`, `is_directed`
**Files:**
- edit `shared/types.ts` — `Edge.kind` becomes `string` referencing registry; new `LinkType` interface
- new `electron/main/db/migrations.ts` v4 — `link_types` table + seed 4 defaults
- edit `electron/main/world-state.ts` — registry methods
- edit `electron/main/mcp/layout-tools.ts` — `draw_edge` accepts any registered kind, validates
- new `electron/main/mcp/ontology-tools.ts` — `register_link_type`, `list_link_types`, `update_link_type`
- edit `renderer/src/scene/Edge.tsx` — read color from registry
**Reuse:** existing edge rendering + 4 link kinds preserved as defaults
**Depends on:** B05 (test harness for migration safety)
**Effort:** M
**Phase:** E0
**AR-readiness:** neutral

### [P0] B03 · Cross-filter / linked highlighting ✓ Wave 4 (`be35b36`)
**Why:** [T6 themes](../research/synthesis/themes.md#t6) — *biggest leverage opportunity* — universal in BI, absent in agent tools
**What:** Hover/select on artifact → all related artifacts (by edge, by cluster membership, by `spec.tags`, by `link_type`) highlight; non-related dim to 18% opacity per existing FilterChips convention
**Files:**
- edit `renderer/src/store/world-store.ts` — derived selector `relatedIds(focusedId)`
- edit `renderer/src/scene/Artifact.tsx` — opacity computed from `relatedIds`
- edit `renderer/src/scene/Edge.tsx` — same
- edit `renderer/src/ui/FilterChips.tsx` — toggle for "linked-highlight on hover" (default on)
**Reuse:** existing dim-to-18% logic from FilterChips
**Depends on:** —
**Effort:** M
**Phase:** E0
**AR-readiness:** + (works in 3D)

### [P0] B04 · Intent-ghost (propose-then-commit for Layout) ✓ Wave 3 (`689b0e5`)
**Why:** [TR12 tradeoffs](../research/synthesis/tradeoffs.md#tr12) — ghost-preview for ≥5-artifact moves; avoids ⚠ Watch "Auto-layout that re-flows on every interaction"
**What:** Layout agent's `apply_layout_plan(...)` becomes 2-step: `propose_layout_plan` (creates ghost artifacts), then user accepts (5s timeout or explicit confirm) → committed via existing path
**Files:**
- edit `electron/main/mcp/layout-tools.ts` — split `apply_layout_plan` → `propose_layout_plan` + `commit_layout_plan`
- edit `electron/main/agents/layout.ts` — system prompt updated
- new `renderer/src/scene/IntentGhost.tsx` — translucent plate variant
- edit `renderer/src/store/world-store.ts` — `pendingLayoutPlans` map
- edit `renderer/src/ui/LayoutActivityPanel.tsx` — show pending plan + Accept/Reject buttons
**Reuse:** existing `apply_layout_plan` tool + LayoutActivityPanel UI
**Depends on:** B05 (tests)
**Effort:** M
**Phase:** E0
**AR-readiness:** + (ghost-preview pattern works identically in AR)

### [P0] B05 · Test harness — Vitest + Playwright ↻ Wave 1 (`d58c83d`) — Vitest+ar-audit+CI landed; Playwright E2E deferred
**Why:** existing v1 ROADMAP ★ item; safety net for B02 migration + B04 layout refactor
**What:** Vitest unit tests for `WorldState`, `UndoLog`, `splitBody`, `live-transforms`. Playwright E2E for marketing-demo flow (type prompt → ≥2 cards → search → reorganize → restore)
**Files:**
- new `tests/unit/world-state.spec.ts`
- new `tests/unit/undo-log.spec.ts`
- new `tests/unit/live-transforms.spec.ts`
- new `tests/e2e/marketing-flow.spec.ts`
- new `vitest.config.ts`, `playwright.config.ts`
- edit `package.json` — `npm run test`, `npm run e2e`
- edit `.github/workflows/ci.yml` — run tests in CI
**Reuse:** existing marketing-strategy demo seed (`shared/seed-marketing.ts`)
**Depends on:** —
**Effort:** L
**Phase:** E0
**AR-readiness:** neutral

### [P0] B06 · Reasoning-thread primitive (MVP, 3 idioms)
**Why:** [TR6 tradeoffs](../research/synthesis/tradeoffs.md#tr6) — Jarvis non-default position; [WS-07 headline](../research/07-ai-native-reasoning.md) "Z-axis is Jarvis's claim"; [Q1.1 open-questions](../research/synthesis/open-questions.md)
**What:** Prototype 3 visual idioms for reasoning trace: (a) vertical thread with nodes, (b) per-agent horizontal lane, (c) tree-of-spans. Behind a developer flag, switch between them. 30-min usage decides winner
**Files:**
- new `renderer/src/scene/ReasoningThread.tsx`
- new `renderer/src/scene/ReasoningTrace.tsx` (per-agent lane variant)
- new `renderer/src/scene/SpanTree.tsx` (tree variant)
- edit `renderer/src/store/world-store.ts` — `actionLogs` derived as trace tree
- edit `electron/main/agents/worker.ts` — emit `agentLog` with `parentSpanId`
- edit `renderer/src/ui/ActivityPanel.tsx` — "Show in scene" button per action
**Reuse:** existing `agentLog` events stream + `actionLogs` Map
**Depends on:** B01 (camera focus on trace)
**Effort:** L
**Phase:** E0
**AR-readiness:** + (designed AR-portable from start: pure R3F, no `<Html>`)

### [P0] B07 · Pivot-to-selection camera (TR2 non-default) ✓ Wave 4 (`be35b36`)
**Why:** [TR2 tradeoffs](../research/synthesis/tradeoffs.md#tr2) — Jarvis non-default; OrbitControls.target reads selectionIds
**What:** When single artifact selected, camera target moves to that artifact (smooth tween 300ms); when multi-selected, target moves to bounding-box centroid OR don't move ([Q4.1 open-questions](../research/synthesis/open-questions.md))
**Files:**
- edit `renderer/src/scene/Canvas.tsx` — `CameraFitter` reads `selectedIds`
- new `renderer/src/scene/camera/pivotPolicy.ts` — policy function
**Reuse:** existing `controls.target` API + `frameAllAt` pattern
**Depends on:** B01 (CameraController abstraction)
**Effort:** S
**Phase:** E0
**AR-readiness:** +

### [P0] B08 · Force-directed layout fallback (worker_thread)
**Why:** existing v1 ROADMAP ★; addresses [M1 meta open-question](../research/synthesis/open-questions.md) — LLM Layout fails past N artifacts
**What:** When Layout agent times out or 429s, fall back to local force-directed simulation (springs along edges, repulsion, cluster attraction) in a worker_thread. LLM hints positions; heuristic settles
**Files:**
- new `electron/main/layout/force-directed.ts` (pure function: artifacts + edges + clusters → positions)
- new `electron/main/layout/force-worker.ts` (worker_thread wrapper)
- edit `electron/main/agents/layout.ts` — fallback logic
- new `electron/main/layout/layout-strategy.ts` — strategy selector (LLM primary, force fallback)
**Reuse:** existing Layout agent invocation pattern
**Depends on:** B04 (intent-ghost for both paths)
**Effort:** L
**Phase:** E0
**AR-readiness:** + (needed for AR frame-rate)

### [P1] B09 · Agent-aura (ambient agent activity visualization) ✓ Wave 3 (`689b0e5`)
**Why:** [CONCEPT §4.1](CONCEPT.md#41-agent-aura-—-где-работает-см-129); Weiser calm-tech principle (Q1.4 — disembodied agents)
**What:** When an agent is mid-action, render a diffuse colored glow (agent-coded: Worker cyan, Layout lavender, Listening amber, Naming rose) around the artifacts it's mutating. Fades 300ms after `result` event
**Files:**
- new `renderer/src/scene/AgentAura.tsx`
- edit `renderer/src/store/world-store.ts` — `activeAgentAuras` derived from `actions`
- edit `electron/main/agents/worker.ts` — emit `agent.aura.start/end` events
**Reuse:** existing `bus.emit('agentLog', ...)` pattern
**Depends on:** —
**Effort:** M
**Phase:** E0
**AR-readiness:** + (spatial audio in AR can layer on this — see B43)

### [P1] B10 · Frame primitive (cluster with header + exportable unit) ✓ Wave 2 (`ce760b6`)
**Why:** [WS-06 tldraw pattern](../research/06-spatial-canvases.md); [Q7.2 open-questions](../research/synthesis/open-questions.md)
**What:** Add `kind: 'frame'` artifact — visually a labeled colored bar on top + rectangular region. Different from `cluster` (Layout-agent-created semantic group) — frame is user-created intentional group
**Files:**
- edit `shared/types.ts` — add `frame` to artifact kinds
- new `renderer/src/scene/Frame.tsx`
- edit `electron/main/mcp/canvas-tools.ts` — `create_frame(label, artifactIds, color?)`
- edit `renderer/src/ui/Hotkeys.tsx` — `Cmd+G` on multi-select → `create_frame`
**Reuse:** existing `Cluster.tsx` render code (frame is variant)
**Depends on:** —
**Effort:** M
**Phase:** E0
**AR-readiness:** + (no DOM)

### [P1] B11 · Marking menu (radial menu on artifacts) ✓ Wave 4 (`be35b36`)
**Why:** [WS-10 game UX](../research/10-game-3d-editor-ux.md) — 3.5× faster than linear menus; Q4.3 hybrid with Cmd+K
**What:** Ctrl+drag on artifact → 4-8-action radial menu; select by direction. Initial set: pin, copy id, copy as md, delete, refine, focus
**Files:**
- new `renderer/src/ui/MarkingMenu.tsx`
- edit `renderer/src/scene/Artifact.tsx` — wire ctrl+drag → MarkingMenu show
- edit `renderer/src/ui/Hotkeys.tsx` — modifier detection
**Reuse:** existing context-menu intent (per v1 ROADMAP "Open — content & UX")
**Depends on:** —
**Effort:** M
**Phase:** E0
**AR-readiness:** + (translates to AR: hand-circle gesture)

### [P1] B12 · Streaming Worker output (artifacts appear progressively)
**Why:** existing v1 ROADMAP ★; user perceived latency drops from seconds to ~200ms
**What:** Render artifact with `state: 'streaming'` immediately when `create_artifact` begins; body fills progressively as text streams
**Files:**
- edit `electron/main/agents/worker.ts` — early artifact creation, stream body via `update_artifact`
- edit `electron/main/mcp/canvas-tools.ts` — `create_artifact` returns id immediately
- edit `renderer/src/scene/Artifact.tsx` — `streaming` state already styled (scanline)
- edit `renderer/src/ui/Inspector.tsx` — handle incremental body updates
**Reuse:** existing `state: 'streaming'` rendering + Inspector progressive markdown
**Depends on:** B05 (tests for state transitions)
**Effort:** M
**Phase:** E0
**AR-readiness:** neutral

### [P1] B13 · Long-lived agent auto-restart ✓ Wave 6 (PR #6)
**Why:** existing v1 ROADMAP ★; reliability blocker for E2 (AR demands stability)
**What:** On 429/5xx/transport error in Layout or Listening agent, exponential backoff + restart, circuit-breaker chip in HUD
**Files:**
- edit `electron/main/agents/layout.ts` — wrap loop in retry logic
- edit `electron/main/agents/listening.ts` — same
- new `electron/main/agents/circuit-breaker.ts`
- edit `renderer/src/ui/AgentActivityHud.tsx` — circuit-breaker state pill
**Reuse:** existing `agentLog` events for telemetry
**Depends on:** —
**Effort:** M
**Phase:** E0
**AR-readiness:** +

### [P2] B14 · Tool-call-trail (skeleton breadcrumb)
**Why:** [CONCEPT §1.2.7](CONCEPT.md); [WS-11 named-trails revival](../research/11-novel-historical.md)
**What:** Lighter-weight cousin of reasoning-thread — chain of beads through scene, each bead = one tool call. Auto-created for actions with ≥3 tool calls; user can explicit save to Trail collection
**Files:**
- new `renderer/src/scene/ToolCallTrail.tsx`
- edit `renderer/src/store/world-store.ts` — derived `toolCallTrails` map
- edit `electron/main/agents/worker.ts` — already emits per-tool log; add `traceId` grouping
**Reuse:** existing `actionLogs` structure
**Depends on:** B06 (reasoning-thread shares trace data)
**Effort:** S
**Phase:** E0
**AR-readiness:** +

### [P2] B15 · Naming agent as own short query ✓ Wave 6 (PR #6)
**Why:** existing v1 ROADMAP; cleaner cost accounting + swappable model for naming
**What:** Extract shortName generation from Worker inline into a separate `naming` agent (single-call query per artifact)
**Files:**
- new `electron/main/agents/naming.ts`
- edit `electron/main/agents/worker.ts` — remove inline naming, call naming agent
- edit `renderer/src/ui/ModelPicker.tsx` — naming model already in dropdown
**Reuse:** existing `model.naming` setting + `WorldState.uniqueShortName`
**Depends on:** —
**Effort:** S
**Phase:** E0
**AR-readiness:** neutral

---

## E1 — Console mode / Multi-dashboard (months 3-9)

Цель эпохи: реализация WS-12 horseshoe + attention zones + alarm taxonomy.

### [P0] B16 · Console mode toggle (Tab key) ✓ Wave 5 (`8b934d1`)
**Why:** [WS-12 multi-dashboard horseshoe](../research/12-multi-dashboard-spatial.md); [VISION §6 E1](VISION.md#6-эпохи-тизер-roadmap-v2)
**What:** Tab toggles scene between Canvas mode (current free-form orbit) and Console mode (stationary multi-anchor camera + horseshoe slots). Same `WorldState`, different `viewMode` setting
**Files:**
- new `renderer/src/scene/camera/MultiAnchorCameraController.tsx`
- edit `renderer/src/store/world-store.ts` — `viewMode: 'canvas' | 'console'`
- edit `renderer/src/scene/Canvas.tsx` — swap CameraController based on viewMode
- edit `renderer/src/ui/Hotkeys.tsx` — Tab handler
**Reuse:** B01 CameraController abstraction
**Depends on:** B01
**Effort:** M
**Phase:** E1
**AR-readiness:** + (Console mode IS AR-friendly pattern)

### [P0] B17 · Panel primitive (2D surface in 3D) ✓ Wave 2 (`ce760b6`)
**Why:** [CONCEPT §1.2.1](CONCEPT.md); WS-12 horseshoe needs slot containers
**What:** New `panel` primitive — rectangular plane (~3:2 aspect, resizable) that hosts widgets. Schema: `{ id, kind, position, size, widget: { kind, spec } }`
**Files:**
- new `renderer/src/scene/Panel.tsx`
- edit `shared/types.ts` — `Panel` interface
- new `electron/main/db/migrations.ts` v5 — `panels` table
- edit `electron/main/world-state.ts` — `panels` map
- new `electron/main/mcp/viz-tools.ts` — `create_panel`, `update_panel`, `attach_widget`
**Reuse:** Artifact rendering patterns
**Depends on:** B05 (tests)
**Effort:** L
**Phase:** E1
**AR-readiness:** + (R3F-native plane)

### [P0] B18 · Horseshoe layout (Layout agent mode)
**Why:** WS-12 horseshoe — 5-slot pattern (P/W1/W2/A1/A2)
**What:** Add new mode to Layout agent: `console` — places top-priority artifacts/panels in fixed horseshoe slots based on `attention_rank` field on each artifact/panel
**Files:**
- edit `electron/main/agents/layout.ts` — system prompt + `console` mode handling
- edit `electron/main/mcp/layout-tools.ts` — `apply_layout_plan` accepts `mode: 'console'`
- edit `shared/types.ts` — add `attention_rank?: number` to Artifact + Panel
- edit `electron/main/mcp/canvas-tools.ts` — `set_artifact_spec` accepts attention_rank
**Reuse:** existing 5 Layout modes
**Depends on:** B16, B17
**Effort:** M
**Phase:** E1
**AR-readiness:** +

### [P0] B19 · Chart-panel (line / bar / heatmap widget)
**Why:** [CONCEPT §2.1](CONCEPT.md); WS-03 BI patterns
**What:** Implement chart widget for `panel`. Initial 3 chart types: line, bar, heatmap. D3 (lightweight) or Plotly (heavier but feature-rich) — pick D3 for first cut
**Files:**
- new `renderer/src/scene/widgets/ChartPanel.tsx`
- new `renderer/src/scene/widgets/chart/Line.tsx`, `Bar.tsx`, `Heatmap.tsx`
- new `electron/main/mcp/viz-tools.ts` — `attach_chart_widget(panelId, chartKind, dataSpec)`
**Reuse:** `Panel` from B17
**Depends on:** B17
**Effort:** L
**Phase:** E1
**AR-readiness:** + (D3 SVG inside R3F via troika-three-text + custom mesh)

### [P0] B20 · Flow-panel (Mermaid/PlantUML on panel in scene)
**Why:** [CONCEPT §2.2](CONCEPT.md); WS-09 node-graph; currently diagrams live only in Inspector
**What:** Move Mermaid/PlantUML rendering from Inspector to panel widget in scene. Diagrams become interactive (click on node → linked highlighting)
**Files:**
- new `renderer/src/scene/widgets/FlowPanel.tsx`
- edit `renderer/src/util/diagrams.ts` — expose render-to-canvas + node-bounding-boxes
- edit `electron/main/mcp/viz-tools.ts` — `attach_flow_widget(panelId, source)`
- edit `renderer/src/ui/Inspector.tsx` — keep Inspector rendering as fallback / quick view
**Reuse:** existing PlantUML + Mermaid extraction code
**Depends on:** B17
**Effort:** L
**Phase:** E1
**AR-readiness:** + (rendered as texture on plane)

### [P0] B21 · Alarm taxonomy (4-tier + visual + audio) ↻ Wave 5 (`8b934d1`) — visual + tag landed; audio chirps deferred to E3 spatial-audio milestone
**Why:** WS-12 alarm patterns; ICU + cockpit literature
**What:** Add `severity: 'info' | 'warning' | 'critical' | 'blocker'` to Notification. Visual: color + rim animation. Audio: distinct chirp per tier (deferred to E3 for full AR)
**Files:**
- edit `shared/types.ts` — Notification.severity
- edit `renderer/src/ui/NotificationCenter.tsx` — tier-based styling
- edit `renderer/src/scene/Artifact.tsx` — alarm rim on `state: 'awaiting-input'` or `error`
**Reuse:** existing Notification + state-rim styling
**Depends on:** —
**Effort:** M
**Phase:** E1
**AR-readiness:** + (audio cues defer to B40)

### [P1] B22 · Timeline-axis + timeline widget
**Why:** [CONCEPT §1.2.3, §2.4](CONCEPT.md); WS-08 time encoding
**What:** New primitive `timeline-axis` (horizontal line in scene with tick-marks). Events (artifact-create, edge-add) plotted as colored dots/bars. Currently `by-time` Layout mode places cards left→right; timeline-axis makes that *explicit and interactive*
**Files:**
- new `renderer/src/scene/TimelineAxis.tsx`
- new `electron/main/db/migrations.ts` v6 — `timeline_axes` table
- edit `shared/types.ts` — TimelineAxis interface
- edit `electron/main/world-state.ts` — axes map
- edit `electron/main/agents/layout.ts` — `by-time` mode optionally creates timeline-axis
**Reuse:** existing event log (every mutation goes through bus)
**Depends on:** B17
**Effort:** M
**Phase:** E1
**AR-readiness:** +

### [P1] B23 · Volume primitive + graph-3d widget
**Why:** [CONCEPT §1.2.4, §2.3](CONCEPT.md); TheBrain focus-plus-context discipline
**What:** New primitive `volume` (translucent bounded 3D box, ~4×4×4). Hosts `graph-3d` widget — force-directed network of point-glyphs, max 30 nodes (focus-plus-context)
**Files:**
- new `renderer/src/scene/Volume.tsx`
- new `renderer/src/scene/widgets/Graph3D.tsx`
- new `electron/main/db/migrations.ts` v7 — `volumes` table
- edit `electron/main/world-state.ts` — volumes map
- edit `electron/main/mcp/viz-tools.ts` — `create_volume`, `attach_graph_widget`
**Reuse:** existing edge + Bézier rendering
**Depends on:** B17
**Effort:** L
**Phase:** E1
**AR-readiness:** + (camera fly-in is XR-native pattern)

### [P1] B24 · Camera fly-in to volume / cluster (Houdini dive-in)
**Why:** WS-09 Houdini sub-network dive-in; [Q9.1 open-questions](../research/synthesis/open-questions.md)
**What:** Double-click + zoom-past-threshold on a Volume or Cluster → camera flies inside; scene root effectively switches to the contained subgraph
**Files:**
- edit `renderer/src/scene/camera/OrbitCameraController.tsx` — dive-in transition
- edit `renderer/src/scene/Volume.tsx`, `Cluster.tsx` — hover affordance for dive
- new `renderer/src/scene/camera/breadcrumb.ts` — "dive-up" navigation
**Reuse:** existing camera transition + bookmark jump pattern
**Depends on:** B01, B23
**Effort:** M
**Phase:** E1
**AR-readiness:** + (camera fly works in XR)

### [P1] B25 · Drill-down on chart-panel + graph-3d (double-click → focus)
**Why:** WS-03 BI drill-down; WS-04 Palantir Search Around
**What:** Double-click on data point in chart-panel or node in graph-3d → identify linked artifact → camera focus on it, Inspector opens
**Files:**
- edit `renderer/src/scene/widgets/ChartPanel.tsx` — emit `pointClicked(dataIndex)` → resolve to artifactId
- edit `renderer/src/scene/widgets/Graph3D.tsx` — same
- edit `renderer/src/store/world-store.ts` — `focusArtifact(id)` action
**Reuse:** existing camera focus + Inspector open
**Depends on:** B19, B23
**Effort:** S
**Phase:** E1
**AR-readiness:** + (pinch + look = double-click in AR)

### [P2] B26 · Time-travel scrubber UI
**Why:** existing v1 ROADMAP "Time-travel scrubber"; CONCEPT §3.2.4
**What:** Slider UI (in StatusBar or Inspector) — scrub through event log; scene reverts to state at chosen timestamp (read-only). Already have data; UI is missing
**Files:**
- new `renderer/src/ui/TimeScrubber.tsx`
- edit `renderer/src/store/world-store.ts` — `replayToTimestamp(ts)` mode
- edit `electron/main/world-state.ts` — `getSnapshotAtTime(ts)` query
**Reuse:** every mutation through bus (event log already exists)
**Depends on:** B22 (works well with timeline-axis)
**Effort:** L
**Phase:** E1
**AR-readiness:** + (voice scrubber in AR via Q1.5)

### [P2] B27 · Lasso select (3D)
**Why:** [CONCEPT §3.2.2](CONCEPT.md); WS-06 canvas lasso pattern
**What:** Drag in empty scene space → 2D screen bounding box → all artifacts within screen-projection selected
**Files:**
- new `renderer/src/scene/interaction/lasso.ts`
- edit `renderer/src/scene/Canvas.tsx` — wire lasso start/move/end
- edit `renderer/src/ui/Hotkeys.tsx` — modifier (default: just empty-space drag)
**Reuse:** existing multi-select state in store
**Depends on:** —
**Effort:** M
**Phase:** E1
**AR-readiness:** - (mouse-only; AR equivalent is hand-spread gesture per WS-02)

---

## E2 — AR-ready (months 6-12)

Цель: разобрать DOM-зависимости. См. [AR-VR-BRIDGE.md M2-M3](AR-VR-BRIDGE.md).

### [P0] B28 · Replace `<Html>` with `<Text>` (troika-three-text) ↻ Wave 1 (`d58c83d`) — Label.tsx primitive + cluster label migrated; 3 remaining interactive Html overlays in Artifact.tsx/Edge.tsx await R3F mesh-button design
**Why:** [AR-VR-BRIDGE M2](AR-VR-BRIDGE.md#m2); existing v1 ROADMAP "Bundled font for drei `<Text>`"
**What:** Replace the 4 `<Html>` instances in `Artifact.tsx:218, 317` and `Edge.tsx:196, 242` with mesh-based text via `troika-three-text`. Bundle Inter `.woff2`
**Files:**
- new `renderer/src/scene/text/Label.tsx`
- edit `renderer/src/scene/Artifact.tsx`
- edit `renderer/src/scene/Edge.tsx`
- add Inter font to bundle
- update `package.json` — add `troika-three-text`
**Reuse:** existing label content + positioning
**Depends on:** —
**Effort:** M
**Phase:** E2
**AR-readiness:** +++ (removes DOM-portal blocker)

### [P0] B29 · Local Whisper (offline STT)
**Why:** existing v1 ROADMAP ★; AR mode is voice-primary
**What:** `@xenova/transformers` (Whisper-tiny ONNX, ~40 MB). Bundled model, first-run download. Chunked encode in worker_thread. Replaces broken Web Speech path
**Files:**
- new `electron/main/transcript/whisper-source.ts`
- new `electron/main/transcript/whisper-worker.ts`
- edit `electron/main/transcript/keyboard-source.ts` — adapter pattern
- edit `renderer/src/ui/Voice.tsx` — wire Whisper as default backend
**Reuse:** existing transcript chunk interface
**Depends on:** —
**Effort:** L
**Phase:** E2
**AR-readiness:** +++ (mandatory for AR)

### [P0] B30 · WebXR experimental branch (XR session)
**Why:** [AR-VR-BRIDGE M3](AR-VR-BRIDGE.md#m3)
**What:** Add `@react-three/xr`; "Enter VR" button; XR session takes over camera; DOM UI hidden during session. Quest browser as test platform
**Files:**
- new `renderer/src/xr/XRSessionToggle.tsx`
- new `renderer/src/scene/camera/XRHeadCameraController.tsx`
- edit `renderer/src/App.tsx` — wrap Canvas in `<XRCanvas>`
- edit `renderer/src/scene/Canvas.tsx` — toggle CameraController based on session
- update `package.json` — add `@react-three/xr`
- env flag `XR_ENABLED=true` for opt-in
**Reuse:** B01 CameraController, B28 `<Text>` (no DOM in scene)
**Depends on:** B01, B28
**Effort:** L
**Phase:** E2
**AR-readiness:** +++ (this IS AR-readiness)

### [P0] B31 · Auto-tagging daemon (background)
**Why:** existing v1 ROADMAP
**What:** Background agent rolls over new artifacts, assigns `spec.tags` from body content. Drives FilterChips automatically. Cheap model (Haiku or local)
**Files:**
- new `electron/main/agents/tagger.ts`
- edit `electron/main/orchestrator.ts` — schedule tagger
**Reuse:** existing `set_artifact_spec` tool + spec.tags field
**Depends on:** —
**Effort:** M
**Phase:** E2
**AR-readiness:** + (AR needs background work to be invisible)

### [P0] B32 · Embeddings cache for similarity layout
**Why:** existing v1 ROADMAP ★; instant `by-topic` clustering без LLM call
**What:** Compute 256-dim BGE-small embedding for each `spec.summary` once via `@xenova/transformers`. Cache in SQLite. Cosine similarity → `by-topic` clustering. LLM only chooses cluster *names*
**Files:**
- new `electron/main/embeddings/embed.ts`
- new `electron/main/db/migrations.ts` v8 — `embeddings` table
- edit `electron/main/agents/layout.ts` — use embeddings for `by-topic`
**Reuse:** existing `spec.summary` field
**Depends on:** —
**Effort:** M
**Phase:** E2
**AR-readiness:** +

### [P1] B33 · Plugin/hook system (~/.jarvis/plugins/)
**Why:** existing v1 ROADMAP ★
**What:** Third-party MCP tools loaded at startup from `~/.jarvis/plugins/*.js`. Agents declare which plugins they have access to
**Files:**
- new `electron/main/plugins/loader.ts`
- new `electron/main/plugins/manifest.ts` — declares which agent can use what
- edit `electron/main/orchestrator.ts` — pass plugins to agents
**Reuse:** existing MCP tool registration pattern
**Depends on:** —
**Effort:** L
**Phase:** E2
**AR-readiness:** neutral

### [P1] B34 · Per-task budget enforcement
**Why:** existing v1 ROADMAP; safety for long-running multi-agent AR sessions
**What:** `request_layout_pass(maxBudgetUsd: 0.20)` aborts agent at threshold. SDK already supports this
**Files:**
- edit `electron/main/agents/worker.ts` — propagate budget option
- edit `electron/main/agents/layout.ts` — accept budget option
- edit `renderer/src/ui/ActivityPanel.tsx` — show budget per action
**Reuse:** SDK `maxBudgetUsd` option
**Depends on:** —
**Effort:** S
**Phase:** E2
**AR-readiness:** +

### [P1] B35 · Settings panel
**Why:** existing v1 ROADMAP; calm-mode (E4) needs settings
**What:** New Settings panel with: fs-sync toggle, theme, agent-pause, model choices (move from ModelPicker), notification preferences, voice backend (Web Speech / Whisper)
**Files:**
- new `renderer/src/ui/SettingsPanel.tsx`
- edit `renderer/src/ui/ModelPicker.tsx` — inline into Settings
- edit `electron/main/db/migrations.ts` v9 — settings persistence
**Reuse:** existing `app_state` k/v table
**Depends on:** —
**Effort:** M
**Phase:** E2
**AR-readiness:** + (settings work in companion window)

### [P2] B36 · Smaller/faster model for incremental layout (Ollama)
**Why:** existing v1 ROADMAP ★; reduce cost on incremental upsert
**What:** Use tiny local model (Ollama llama3.2:3b or Qwen2.5:3b) for "place this one new card" with structured output. Anthropic Haiku reserved for `reorganize` passes
**Files:**
- new `electron/main/agents/layout-incremental.ts` (local model)
- edit `electron/main/agents/layout.ts` — split incremental vs reorganize paths
**Reuse:** existing Layout agent split between incremental + reorganize
**Depends on:** B08 (force-directed fallback)
**Effort:** L
**Phase:** E2
**AR-readiness:** + (cheaper = more sustainable AR daily use)

### [P2] B37 · Streaming snapshot (paged IPC for big boards)
**Why:** existing v1 ROADMAP; AR needs fast cold-start
**What:** Don't send 500 artifacts in one IPC `getSnapshot` — page them (50 per batch). Renderer renders progressively
**Files:**
- edit `electron/main/world-state.ts` — `getSnapshotPaged(offset, limit)`
- edit `renderer/src/store/world-store.ts` — accumulate paged snapshot
- edit `electron/main/ipc.ts` — stream multiple snapshot batches
**Reuse:** existing event-coalescing pattern
**Depends on:** —
**Effort:** M
**Phase:** E2
**AR-readiness:** +

---

## E3 — visionOS (months 12-18)

См. [AR-VR-BRIDGE.md M4-M5](AR-VR-BRIDGE.md).

### [P0] B38 · visionOS native shell + companion windows
**Why:** [AR-VR-BRIDGE M4](AR-VR-BRIDGE.md#m4); WS-12 Vision Pro multi-app pattern
**What:** Native visionOS app shell (Swift package). Hosts immersive scene (WebXR or native WebGL) + 3 floating SwiftUI windows (Inspector / ActivityPanel / InputBar via WebView)
**Files:**
- new `visionos-shell/` (Swift package, separate from Electron)
- new IPC bridge — visionOS → WebView panels
- shared SQLite via iCloud Drive mount
- edit `electron/main/world-state.ts` — handle external file mutations (already does via fs-sync)
**Reuse:** existing Inspector/ActivityPanel/InputBar (run as WebViews)
**Depends on:** B30 (WebXR proven), B29 (Whisper)
**Effort:** L+ (3-6 weeks, first-time Swift)
**Phase:** E3
**AR-readiness:** +++

### [P0] B39 · Gaze+pinch in immersive scene
**Why:** [AR-VR-BRIDGE M5](AR-VR-BRIDGE.md#m5); visionOS native input
**What:** Within WebXR session, gaze-ray casting against scene + pinch detection → artifact selection. Long-pinch → grab. Voice → command channel
**Files:**
- new `renderer/src/xr/InputHandlers.tsx`
- edit `renderer/src/scene/Artifact.tsx` — accept XR raycasts
- new `electron/main/agents/voice-router.ts`
**Reuse:** existing pick + select logic, B29 Whisper
**Depends on:** B30, B38, B29
**Effort:** L
**Phase:** E3
**AR-readiness:** +++

### [P0] B40 · Spatial audio for agent activity
**Why:** WS-02 spatial audio pattern; B21 alarm audio finalized here
**What:** Each agent has spatial audio source from its `agent-aura` position. TTS for action-complete / error chirps. Whisper-paired TTS (open-source: piper / coqui)
**Files:**
- new `electron/main/voice/tts.ts`
- edit `renderer/src/scene/AgentAura.tsx` — add `<PositionalAudio>`
- edit `renderer/src/ui/Voice.tsx` — TTS playback path
**Reuse:** existing event bus for action lifecycle
**Depends on:** B09, B21
**Effort:** M
**Phase:** E3
**AR-readiness:** +++

### [P0] B41 · Anchor primitive (concretized) + anchor-grab
**Why:** [CONCEPT §1.2.5](CONCEPT.md); WS-02 vendor patterns
**What:** Add `anchor: 'world' | 'desk' | 'hand' | 'head'` field to artifact/panel/volume. Long-pinch → "grab" → can drop onto new anchor (visual feedback per anchor type). Default `world`
**Files:**
- edit `shared/types.ts` — add anchor field
- new `renderer/src/util/anchoring.ts` — anchor transform logic
- edit `renderer/src/scene/Artifact.tsx`, `Panel.tsx`, `Volume.tsx` — anchor-aware positioning
- edit `renderer/src/xr/InputHandlers.tsx` — long-pinch detection + anchor switch
**Reuse:** B39 pinch detection
**Depends on:** B30, B39
**Effort:** M
**Phase:** E3
**AR-readiness:** +++

### [P1] B42 · Multi-device sync via iCloud Drive
**Why:** [AR-VR-BRIDGE §5](AR-VR-BRIDGE.md#5-multi-device-sync-model)
**What:** Same `jarvis.db` mounted via iCloud Drive on desktop + AVP. Accept ~minutes latency. Single-user means rare conflict
**Files:**
- edit `electron/main/world-state.ts` — handle external DB modifications
- new `electron/main/sync/icloud-monitor.ts` — watch file mtime, reload on change
- docs update — README mention iCloud Drive setup
**Reuse:** existing fs-sync chokidar pattern
**Depends on:** B38
**Effort:** M
**Phase:** E3
**AR-readiness:** +++

### [P1] B43 · Hand-attached quick menu (palm-up in AR)
**Why:** WS-02 visionOS pattern; WS-09 hand-anchored UI
**What:** Look at palm → small menu appears anchored to palm (3-button max per WS-02 anti-pattern about >3 buttons). Quick actions: new card, voice, settings
**Files:**
- new `renderer/src/xr/PalmMenu.tsx`
- edit `renderer/src/xr/InputHandlers.tsx` — palm-up detection
**Reuse:** B39 hand input
**Depends on:** B39
**Effort:** M
**Phase:** E3
**AR-readiness:** +++

### [P1] B44 · macOS codesigning + notarization
**Why:** existing v1 ROADMAP "boring but important"; required for visionOS App Store
**What:** Wire `CSC_LINK` / `APPLE_ID` secrets in release.yml. Adds Gatekeeper bypass removal for users
**Files:**
- edit `.github/workflows/release.yml`
- repository secrets setup (manual step)
- docs update
**Reuse:** existing electron-builder pipeline
**Depends on:** —
**Effort:** S
**Phase:** E3
**AR-readiness:** + (needed for AVP App Store)

### [P2] B45 · safeStorage for ANTHROPIC_API_KEY
**Why:** existing v1 ROADMAP; security tightened for AR voice transcripts
**What:** Use Electron `safeStorage.encryptString` for API key. Migration: read existing env var on first run, store encrypted, prompt on subsequent runs if missing
**Files:**
- new `electron/main/secrets/safe-storage.ts`
- edit `electron/main/index.ts` — migration path
**Reuse:** existing `process.env.ANTHROPIC_API_KEY` consumer
**Depends on:** B35 (Settings panel for API key entry UI)
**Effort:** S
**Phase:** E3
**AR-readiness:** neutral

---

## E4 — Calm-tech / Ambient (months 18-30)

### [P0] B46 · Calm-mode (ambient default in AR)
**Why:** [VISION §6 E4](VISION.md); Weiser calm-tech revival
**What:** When AR-mode user is not actively focused, scene auto-fades to ambient-timeline on a "wall" (5m away). Only critical-tier alarms surface. Detection: no input for 30s → enter calm-mode
**Files:**
- new `renderer/src/xr/CalmMode.tsx`
- edit `renderer/src/store/world-store.ts` — `attentionState: 'active' | 'ambient'`
- edit `renderer/src/scene/Canvas.tsx` — calm-mode rendering
**Reuse:** existing idle detection + B22 timeline
**Depends on:** B22, B30
**Effort:** L
**Phase:** E4
**AR-readiness:** +++

### [P0] B47 · Daily digest agent
**Why:** existing v1 ROADMAP; surfaces in calm-mode
**What:** Background agent, runs N times per day. Produces a summary card "what changed today / what's still open". Display: ambient-timeline tile in calm-mode
**Files:**
- new `electron/main/agents/digest.ts`
- edit `electron/main/orchestrator.ts` — schedule digest
- new artifact kind `digest` (or use `doc` with tag `daily-digest`)
**Reuse:** existing Action infrastructure + spec.summary
**Depends on:** —
**Effort:** M
**Phase:** E4
**AR-readiness:** +

### [P1] B48 · Desk-mode (Dynamicland-inspired)
**Why:** [VISION §3.4](VISION.md); WS-11 Bret Victor Dynamicland revival
**What:** Vision Pro detects horizontal desk surface via passthrough/lidar → immersive scene "lands" on it as a mini-observatory. Companion windows reposition around it
**Files:**
- new `renderer/src/xr/DeskMode.tsx`
- edit `renderer/src/scene/Canvas.tsx` — surface-anchored scene
- visionos-shell — surface detection API
**Reuse:** B41 anchor primitive
**Depends on:** B38, B41
**Effort:** L
**Phase:** E4
**AR-readiness:** +++

### [P1] B49 · RAG Q&A — "what do I know about X?"
**Why:** existing v1 ROADMAP
**What:** Embeddings of all artifact bodies (extending B32 from spec-only to body) in local vector store. Voice command "what do I know about X" → agent answers with @-citations
**Files:**
- edit `electron/main/embeddings/embed.ts` — embed body in chunks
- new `electron/main/embeddings/retrieve.ts` — top-K retrieval
- edit `electron/main/agents/worker.ts` — new tool `query_knowledge(text)`
**Reuse:** B32 embeddings infrastructure
**Depends on:** B32
**Effort:** L
**Phase:** E4
**AR-readiness:** +

### [P1] B50 · Trail-as-PR (export named trail to GitHub gist + canvas.json)
**Why:** [VISION §3.4](VISION.md); WS-11 Engelbart trail revival; Q7.1 open-questions
**What:** Right-click on tool-call-trail or reasoning-thread → "Export as PR" → generates markdown gist + canvas.json zip; pushes via `gh` CLI
**Files:**
- new `electron/main/export/trail-export.ts`
- new `renderer/src/ui/TrailExportDialog.tsx`
- edit `renderer/src/scene/ToolCallTrail.tsx` — right-click handler
**Reuse:** B14 tool-call-trail, B06 reasoning-thread
**Depends on:** B14
**Effort:** M
**Phase:** E4
**AR-readiness:** +

### [P2] B51 · Theme system (light / dark / ambient)
**Why:** existing v1 ROADMAP; ambient theme is calm-mode dependency
**What:** Three themes: light (user pref), dark (default), ambient (auto in calm-mode). CSS vars + 3D scene material swap
**Files:**
- new `renderer/src/theme/themes.ts`
- edit `renderer/src/ui/SettingsPanel.tsx` — theme selector
- edit `renderer/src/scene/*` — read material from theme
**Reuse:** existing color tokens
**Depends on:** B35
**Effort:** M
**Phase:** E4
**AR-readiness:** +

### [P2] B52 · Linear / GitHub Issues sync as board
**Why:** existing v1 ROADMAP
**What:** Bi-directional sync — each issue becomes artifact, status becomes tag, links become edges. Implements via "graph plugin" pattern from B33
**Files:**
- new `~/.jarvis/plugins/linear.js` (plugin)
- new `~/.jarvis/plugins/github-issues.js`
- documentation
**Reuse:** B33 plugin system
**Depends on:** B33
**Effort:** L
**Phase:** E4
**AR-readiness:** neutral

---

## E5 — Multi-user (CONDITIONAL, months 24-36)

Re-assess at month 24. Если pull не появился — пропустить и инвестировать в E5-alt (depth in personal use case).

### [P0] B53 · Shared WorldState via CRDT (Yjs)
**Why:** [AR-VR-BRIDGE M6](AR-VR-BRIDGE.md#m6); WS-06 Yjs / Liveblocks references
**What:** Rewrite WorldState mutation pathway through Yjs CRDT. Local in-memory replica continues to work; sync happens via Yjs document
**Files:**
- new `electron/main/sync/crdt.ts`
- refactor `electron/main/world-state.ts` — back by Y.Doc
- new tests for conflict resolution
**Reuse:** existing event bus contract
**Depends on:** B05 (test harness essential)
**Effort:** L+
**Phase:** E5
**AR-readiness:** +

### [P0] B54 · WebRTC peer connection for collab
**Why:** AR-VR-BRIDGE M6
**What:** Two AVPs connect peer-to-peer (signaling via cloud relay, data via WebRTC). Yjs awareness protocol for cursors
**Files:**
- new `electron/main/sync/peer.ts`
- new `electron/main/sync/signaling.ts` (small relay)
- edit `electron/main/orchestrator.ts` — peer awareness events
**Reuse:** B53 Yjs
**Depends on:** B53
**Effort:** L+
**Phase:** E5
**AR-readiness:** +++

### [P1] B55 · Agent-cursor per user (collaborative awareness)
**Why:** WS-06 Liveblocks pattern; CONCEPT §4.5
**What:** Each user sees other users' gaze/cursor + their agent's auras. Distinct color per user. Yjs awareness drives this
**Files:**
- new `renderer/src/xr/CollabCursor.tsx`
- edit `renderer/src/scene/Canvas.tsx` — render collab cursors
**Reuse:** B09 agent-aura pattern
**Depends on:** B54
**Effort:** M
**Phase:** E5
**AR-readiness:** +++

### [P1] B56 · NOC-style "shared wall + private console"
**Why:** WS-12 NOC pattern + multi-user adaptation
**What:** Two scene zones — shared (visible to all collaborators, world-anchored) + private (each user's own horseshoe, user-anchored)
**Files:**
- edit `renderer/src/scene/Canvas.tsx` — split into shared + private zones
- edit `electron/main/world-state.ts` — `visibility: 'shared' | 'private'` on artifact
**Reuse:** B16 Console mode, B41 anchors
**Depends on:** B16, B41, B53
**Effort:** L
**Phase:** E5
**AR-readiness:** +++

### [P2] B57 · Conflict resolution UI for simultaneous mutation
**Why:** open-question Q in v1 ROADMAP
**What:** When two users mutate same artifact within Yjs CRDT merge window, show inline diff UI for user to choose
**Files:**
- new `renderer/src/ui/ConflictResolver.tsx`
- edit `electron/main/sync/crdt.ts` — emit conflict events
**Reuse:** existing diff rendering (Inspector compare)
**Depends on:** B53
**Effort:** M
**Phase:** E5
**AR-readiness:** + (works in companion window)

---

## Cross-cutting themes (not specific cards)

These are not standalone cards but principles enforced across multiple cards above:

- **No new DOM in scene** — any new spatial primitive (B06, B09, B10, B14, B17-B23, etc.) MUST be R3F-native, no `<Html>`. Enforced in code review.
- **Two-layer color discipline** — per VISUAL-LANGUAGE.md §4. No card adds a third color layer.
- **⚠ Watch anti-patterns** — see [anti-patterns.md](../research/synthesis/anti-patterns.md). Specifically: no head-anchored content, no snap-transitions on state change, no auto-layout that re-flows on every interaction, no full-graph rendering attempts.
- **Migration safety** — any card touching the DB has a migration (`electron/main/db/migrations.ts`) + a test (B05).

---

## Verification per card

After implementing each card:

1. **Type check + build pass** (existing CI).
2. **Tests added or updated** (B05 expectations).
3. **No regression in marketing-demo flow** (seed in `shared/seed-marketing.ts`).
4. **AR-readiness rating verified** — if +, run `XR_ENABLED=true npm run dev` and check no DOM falls through (deferred until B30 lands).
5. **No `⚠ Watch` anti-pattern introduced** — visual review.

---

## Ranking heuristic for sequencing within an epoch

Within an epoch, work in this order:
1. **Infrastructure first** — abstractions, schema changes, tests (B01, B02, B05, B17, B30).
2. **High-leverage features** — items addressing strong themes (B03 linked highlighting, B06 reasoning trace).
3. **Quality of life** — items addressing P1/P2 priorities and polish.

Don't ship two L-effort cards in the same week. Pair S+M, or S+S+S, to keep merge cadence weekly.

---

## Open / unresolved cards (for future cycles)

These are mentioned in synthesis but not assigned to specific epochs:
- Named reroute (wireless connection) — defer (Q7.4)
- Mnemonic-medium integration — skip v1 (Q8.3)
- Multi-board cross-reference syntax — research-only (Q7.3)
- Section plane in AR — defer to AR usage data (Q6.5)

---

## Источники
- [VISION.md](VISION.md), [CONCEPT.md](CONCEPT.md), [VISUAL-LANGUAGE.md](VISUAL-LANGUAGE.md), [INTERACTION-LANGUAGE.md](INTERACTION-LANGUAGE.md), [AR-VR-BRIDGE.md](AR-VR-BRIDGE.md), [ROADMAP-v2.md](ROADMAP-v2.md)
- Synthesis: [`patterns`](../research/synthesis/patterns.md), [`anti-patterns`](../research/synthesis/anti-patterns.md), [`themes`](../research/synthesis/themes.md), [`tradeoffs`](../research/synthesis/tradeoffs.md), [`open-questions`](../research/synthesis/open-questions.md)
- 12 workstream briefs: `docs/research/01-*.md` .. `12-*.md`
- AR readiness: `docs/research/ar-readiness-inventory.md`
- Current operational roadmap: [`../ROADMAP.md`](../ROADMAP.md) (NOT replaced by this doc)
- Existing schemas: [`../MODEL.md`](../MODEL.md), [`../AGENTS.md`](../AGENTS.md), [`../ARCHITECTURE.md`](../ARCHITECTURE.md)
