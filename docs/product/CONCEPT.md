# Concept: пространственная модель Interactive Jarvis

**Назначение:** концептуальная модель Jarvis после применения synthesis. Расширяет сегодняшние 4 примитива (`artifact / edge / cluster / board`) до полного набора, нужного для multi-dashboard + reasoning-trace + AR-friendly работы. Этот документ — *концепция*, не схема БД (см. `docs/MODEL.md` для текущей схемы и предстоящих миграций).

**Структура:**
1. Spatial primitives — что живёт в пространстве (узлы, регионы, оси, объёмы, якоря)
2. Viz primitives — диаграммы как граждане первого класса
3. Interaction primitives — что пользователь может делать
4. Agent representation primitives — как видна работа агентов
5. Composition rules — как примитивы складываются вместе

Каждый раздел: для нового примитива описывает (а) что это, (б) какие данные он представляет, (в) как им управляют (агент / человек), (г) ссылка на synthesis-источник.

---

## 1. Spatial primitives

### 1.1. Уже есть (4)

| Имя | Что | Источник в коде |
|---|---|---|
| `artifact` | Дискретная единица контента (плита-карточка) | `electron/main/world-state.ts`, `renderer/src/scene/Artifact.tsx` |
| `edge` | Типизированная направленная связь между двумя артефактами | `renderer/src/scene/Edge.tsx` |
| `cluster` | Полупрозрачный регион вокруг подмножества артефактов | `electron/main/mcp/layout-tools.ts` (`create_cluster`) |
| `board` | Логический контейнер artifact+edge+cluster | `shared/types.ts` (Board) |

### 1.2. Новые spatial primitives (8)

#### 1.2.1. `panel` — 2D-поверхность с виджетами
- **Что:** прямоугольная поверхность в 3D-пространстве, на которой живут **виджеты** (charts, tables, controls). Аналог "dashboard tile" в BI. Имеет фиксированный размер (по умолчанию ~3:2 aspect), но resizable.
- **Какие данные:** результаты агрегаций, time-series, matrix-heatmaps, KPI-цифры — всё что 2D-чарт умеет представить лучше чем плита.
- **Управление:** Worker создаёт через `create_panel(kind, spec, position?)`. Layout-agent может перенести в Console-slot.
- **Источник:** WS-03 (BI композиция), WS-12 (multi-dashboard horseshoe), TR4 tradeoff (panel-как-первоклассный)
- **Отличие от artifact:** artifact — кусок контента (markdown body). Panel — *view* над данными, можно reactively обновляться при изменении исходных артефактов.

#### 1.2.2. `frame` — рамка с заголовком (promoted cluster)
- **Что:** обёртка над `cluster` с явным **header-баром** сверху (типа frame в tldraw). В отличие от полупрозрачного региона, frame — semantic boundary с именем, exportable как unit.
- **Какие данные:** группировка артефактов "которая должна оставаться вместе" — например, "Q3 strategy section", "draft answers", "open tensions".
- **Управление:** пользователь через `Cmd+G` на multi-selection; Worker через `create_frame(label, artifactIds)`.
- **Источник:** WS-06 (tldraw Frame pattern), Q7.2 в open-questions ("clusters with headers, exportable")
- **Отличие от cluster:** cluster — *спонтанная* группа (Layout agent создаёт по теме); frame — *намеренная* группа (пользователь сказал "это держим вместе").

#### 1.2.3. `timeline-axis` — линейная ось времени
- **Что:** горизонтальная ось в сцене, по умолчанию ~14 units long. На неё могут "пристёгиваться" артефакты по `createdAt` / `updatedAt`. Метки времени видимы при focus.
- **Какие данные:** хронология (когда что появилось), playback (как сцена менялась).
- **Управление:** появляется при `Cmd+L → by-time`; persistent если board имеет flag `timelineMode: true`.
- **Источник:** WS-08 (sci-viz time encoding), WS-11 (Engelbart trail-of-thought), pattern: "time-as-encoding"
- **Отличие от просто positioning:** не виртуальный (math-only) — это видимая ось с tick-marks. Артефакты на ней привязаны (cannot drag перпендикулярно без отвязки).

#### 1.2.4. `volume` — 3D-контейнер для непрерывного 3D
- **Что:** прозрачный bounded бокс в сцене, размер ~4×4×4 units. Содержит точки/глифы/линии в *настоящем* 3D (не плиты). Камера может **войти внутрь** (fly-in).
- **Какие данные:** 3D-scatter (data points), force-directed network внутри bounding box, volumetric density.
- **Управление:** Worker создаёт через `create_volume(kind, spec)`. Камера-fly-in через double-click + zoom-past-threshold.
- **Источник:** WS-08 (scientific viz, marks/channels в 3D), WS-09 (Houdini sub-network dive-in — "fly inside the volume" аналог)
- **Отличие от cluster:** cluster — группировка плит. Volume — *непрерывная* 3D-структура где плиты не имеют смысла.

#### 1.2.5. `anchor` — точка привязки UI к чему-то в мире
- **Что:** **невидимый** spatial primitive, описывающий "к чему пристёгнут другой объект". 4 типа:
  - `world` — фиксирован в реальном пространстве (стол комнаты)
  - `desk` — на горизонтальной поверхности (для desk-mode)
  - `hand` — следует за рукой пользователя (palm menus)
  - `head` — следует за головой (HUD; используем редко, только для critical alerts per ⚠ Watch)
- **Какие данные:** мета — *где* объект живёт, а не *что* он показывает.
- **Управление:** в десктоп-режиме все anchor'ы — implicit `world`. В AR-режиме пользователь явно anchor'ит через долгий-pinch ("pin here") или voice ("put this on my desk").
- **Источник:** WS-02 (vendor patterns), T9 (world-anchored over head-anchored), Q6.1 (cognitive cost of mixed anchors)

#### 1.2.6. `reasoning-thread` — пространственная нить рассуждения агента
- **Что:** **новый primitive**. Вертикальная (или горизонтальная — настраиваемо) нить через сцену, отмеченная **узлами**, каждый узел — один шаг рассуждения агента (thought block, tool call, tool result). Толщина нити кодирует *cost* (тонкая = дёшево); цвет — *какой агент*.
- **Какие данные:** трасса исполнения action'а — sequence of `agentLog` events. Сегодня это плоский list в `ActivityPanel`. В CONCEPT — *spatial*.
- **Управление:** появляется по запросу (`Cmd+R` на артефакте → "покажи как ты к этому пришёл"); persistent после; deletable; exportable как часть named trail.
- **Источник:** WS-07 (headline finding: "no tool ships 3D reasoning surface; Z-axis is Jarvis's claim"), TR6 (Jarvis non-default position)
- **Открытые вопросы:** Q1.1 (canonical idiom), Q1.2 (live streaming perceptual cost) — это территория где мы должны прототипировать первыми

#### 1.2.7. `tool-call-trail` — breadcrumb tool-вызовов
- **Что:** lighter-weight cousin reasoning-thread. **Цепочка beads** через сцену, каждый bead — *только tool call* (не thinking blocks). Меньше visual weight. Persistent.
- **Какие данные:** "что Worker сделал" в виде последовательности — useful как **named trail** (см. Bush Memex revival).
- **Управление:** автоматически создаётся для action'ов с ≥3 tool calls; пользователь может explicit save в Trail collection.
- **Источник:** WS-11 (named trails revival), WS-07, pattern: "hierarchical trace tree"
- **Отличие от reasoning-thread:** thread — *детальный* (показывает thinking); trail — *скелетный* (только actions).

#### 1.2.8. `intent-ghost` — превью того что агент собирается сделать
- **Что:** **полупрозрачный artifact-черновик**, выглядит как обычная плита но с opacity 30% + tag "intent". Появляется **перед** mutation если та >= 5 артефактов (threshold per TR12 ghost-preview).
- **Какие данные:** будущее состояние сцены. Hover показывает diff. Пользователь подтверждает (commit) или отклоняет (delete).
- **Управление:** агент создаёт через `propose_artifact(...)` (новый tool). Через 5 секунд auto-commit если пользователь не отреагировал, либо инструмент явно ждёт acknowledgment.
- **Источник:** WS-11 (Bret Victor "immediate connection"), TR12 (ghost-preview for ≥5-artifact moves — Jarvis non-default position)
- **Анти-паттерн избегания:** ⚠ "Auto-layout that re-flows on every interaction" — ghost-preview уменьшает риск сюрприза reorganize.

#### 1.2.9. `agent-aura` — область пространства где работает агент
- **Что:** **диффузное цветное свечение** вокруг группы артефактов, которые агент сейчас мутирует. Цвет — agent-кодированный (Worker = cyan, Layout = lavender, Listening = amber, Naming = rose).
- **Какие данные:** "что сейчас живо" — для пользователя это сигнал "не трогай это место, агент работает".
- **Управление:** автоматически — отображается во время execution action, исчезает через 300ms после `result`.
- **Источник:** WS-12 (attention flow), WS-11 (Latour vs Weiser — мы выбираем ambient over avatar per Q1.4)

---

## 2. Viz primitives — диаграммы как первоклассные

Сейчас диаграммы (PlantUML, Mermaid) живут *только в Inspector* — рендерятся при открытии карточки. После расширения они станут **first-class spatial objects** на panel'ах.

### 2.1. `chart-panel`
- **Хост:** `panel` или `frame`.
- **Виды:** `line`, `bar`, `scatter`, `heatmap`, `treemap`, `sparkline`, `gauge`.
- **Source data:** артефакты с `kind: 'log'` или `kind: 'data'` (новый kind для табличных данных); или результаты aggregation tool (Worker может агрегировать через MCP).
- **Linked highlighting:** hover в chart-panel → highlight related artifacts in scene + другие chart-panels with the same dimension (per T6 — universal in BI, absent in agent tools — *biggest leverage*).

### 2.2. `flow-panel`
- **Хост:** `panel`.
- **Что:** Mermaid/PlantUML/dataflow граф, *интерактивный* — узлы кликабельны, рёбра — first-class. Каждый узел может быть **связан с artifact** (двойной клик на узле → focus camera на linked artifact).
- **Source:** body артефакта содержит fence ` ```mermaid ` или `@startuml`. Сегодня парсится в Inspector. Теперь — также рендерится на panel в сцене.
- **Источник:** WS-09 (node-graph editors), pattern: "live-trace as Houdini-style cached node outputs"

### 2.3. `graph-3d` (внутри volume)
- **Что:** force-directed network внутри `volume`. Узлы — артефакты (или их proxy-glyphs если они уже в основной сцене). Рёбра — типизированные.
- **Когда использовать:** когда плотность отношений >50 и пространственная стабильность не критична (overview mode, не daily-work mode).
- **Источник:** WS-05 (PKM graph views), но с focus-plus-context discipline (T2) — *никогда не рендерим >30 nodes* в одном volume.

### 2.4. `timeline` (на `timeline-axis`)
- **Что:** события (artifact-create, edge-add, cluster-merge) как dots/bars на временной оси. Color-encoded by event type.
- **Источник:** WS-08 (time encoding), WS-12 (alarm history).

### 2.5. `matrix` (на `panel`)
- **Что:** N×N heatmap для **отношений** (какие артефакты упоминают каких; co-occurrence в clusters; semantic similarity).
- **Источник:** WS-05 (network analysis), pattern: "matrix view"

### 2.6. `tree-3d` (на `volume` или `frame`)
- **Что:** иерархия как **3D tree** (parent-child через Z). Используется для outline-mode на больших boards.
- **Источник:** WS-05 (Logseq outliner), WS-08 (scientific hierarchies)

---

## 3. Interaction primitives

### 3.1. Уже есть
- `select` (single / multi via shift+click)
- `focus-frame` (F key, `frameAll`)
- `drag-to-move` (shift modifier auto-pins)
- `bookmark` (Shift+1..9 save, 1..9 jump)
- `filter` (FilterChips by kind/tag/pinned)
- `search` (Cmd+F fuzzy)

### 3.2. Новые

#### 3.2.1. `pivot-to-selection`
- **Что:** при single select камера автоматически orbit'ит **вокруг выбранного объекта**, не вокруг origin. Default behavior в Console mode.
- **Источник:** TR2 (Jarvis non-default), Q4.1 (does this survive multi-select — for multi-select pivot to centroid OR don't pivot).

#### 3.2.2. `lasso-select` (3D)
- **Что:** drag в пустоте → 2D bounding box на screen → all artifacts within screen-projection selected.
- **Источник:** WS-06 (canvas lasso), WS-10 (RTS box-select)

#### 3.2.3. `cross-filter` (BI-style linked highlighting)
- **Что:** hover/click на одном объекте → highlight related (по `edge`, по `link_type`, по cluster membership, по `spec.tags`) во всей сцене. **Это самый высоко-leverage паттерн** (T6).
- **Подробности:** highlight = full opacity + outline ring; non-related = dim to 18%; related = full opacity. Animated fade 200ms.
- **Источник:** T6 (theme: linked highlighting absent in agent tools), TR12

#### 3.2.4. `time-scrub`
- **Что:** на timeline-axis или reasoning-thread можно "перемотать" — все артефакты возвращаются к состоянию на выбранный timestamp (read-only mode).
- **Источник:** WS-08 (time encoding), ROADMAP "time-travel scrubber" (already on roadmap as open)

#### 3.2.5. `anchor-grab` (AR-specific)
- **Что:** long-pinch на объекте → "берём" его → можем "положить" на новый anchor (world / desk / hand / head). Visual feedback: цветное свечение по типу target anchor.
- **Источник:** WS-02 (visionOS gestures), WS-09 (hand-anchored gizmos)

#### 3.2.6. `ghost-preview`
- **Что:** при mutation ≥5 артефактов показываем `intent-ghost` сначала, пользователь подтверждает.
- **Источник:** TR12 (Jarvis non-default), WS-11 (Bret Victor revival)

#### 3.2.7. `drill-down`
- **Что:** double-click на point в chart-panel или node в graph-3d → camera flies-in to focus + Inspector opens.
- **Источник:** WS-03 (BI drill-down), WS-04 (Palantir Search Around)

#### 3.2.8. `marking-menu`
- **Что:** ctrl+drag на artifact → радиальное меню из 4-8 actions, выбор по направлению drag. 3.5× быстрее линейного menu per WS-10.
- **Источник:** WS-10 (Maya marking menus, Kurtenbach 1993)

---

## 4. Agent representation primitives

Эти примитивы переводят работу LLM-агентов из текстового лога в spatial представление. Это **главная незанятая ниша** (per T6 + TR6).

### 4.1. `agent-aura` — где работает (см. 1.2.9)

### 4.2. `intent-ghost` — что собирается сделать (см. 1.2.8)

### 4.3. `reasoning-thread` — как думает (см. 1.2.6)

### 4.4. `tool-call-trail` — что сделал (см. 1.2.7)

### 4.5. `agent-cursor` (AR + multi-user)
- **Что:** в AR-mode каждый агент имеет visible "курсор" — маленький glow указатель в месте текущей операции. Думать как cursor в Google Docs collaborative editing, но для агентов.
- **Когда:** только если включен developer-mode (опционально). По умолчанию — calm tech, видим только `agent-aura`.
- **Источник:** WS-06 (collaborative cursors), WS-07 (multi-agent visualization)

### 4.6. `agent-voice` (AR-specific)
- **Что:** каждый агент имеет distinct TTS-голос, появляется из его `agent-aura` spatial position. Не текст — голос.
- **Когда:** Whisper + TTS lands per ROADMAP. Уведомления критических событий — short voice phrases ("Worker done", "Layout reorganized into 4 clusters").
- **Источник:** WS-02 (spatial audio), WS-12 (alarm voice patterns)

---

## 5. Composition rules — как примитивы складываются

### 5.1. Сетка координат (расширение)

| Ось | Диапазон сейчас | Расширение |
|---|---|---|
| X | [-14, 14] | unchanged |
| Y | [-2, 4] | расширить до [-4, 8] для Console mode (P-слот выше) |
| Z | [-8, 8] | unchanged |
| **Time** | n/a | новая ось для `timeline-axis` mode, маппится в X |

### 5.2. Layer convention

| Layer (Y range) | Что живёт |
|---|---|
| Ceiling (Y > 4) | Ambient timeline (calm-mode); WS-11 daily-digest |
| Working (Y ≈ 0-3) | Активные артефакты, чаще всего фокус |
| Floor (Y < -2) | "Архив" — depricated/done артефакты, opacity ↓ |

В Console mode эта convention отменяется в пользу слот-разметки (P/W1/W2/A1/A2 в horseshoe).

### 5.3. Z-stratification

| Z | Семантика |
|---|---|
| Z ≈ 8 (near camera) | Input/InputBar zone, "что я сейчас вводу" |
| Z ≈ 0 | Working artifacts, default |
| Z ≈ -8 (far) | Reference / cited / "ушло из активного" |

Reasoning-thread по умолчанию **поперёк Z** — нить уходит в глубину сцены (старые шаги дальше).

### 5.4. Modes

Jarvis поддерживает несколько **режимов сцены**, переключаемых hotkey или voice:

| Режим | Hotkey | Камера | Layout |
|---|---|---|---|
| **Canvas** (default, текущий) | (no key) | orbit | LLM-driven free-form |
| **Console** | Tab | multi-anchor (stationary) | horseshoe slots (P/W1/W2/A1/A2) |
| **Console-2D** | T | top-down ortho | grid в pan/zoom 2D |
| **Outline** | Cmd+\\ | side-view | hierarchical tree |
| **Trace** | Cmd+R + artifact | orbit pivoted | reasoning-thread spawn'ится |
| **Ambient** (calm-mode, AR-only) | (auto on inactivity) | passive | only ambient-timeline visible |
| **Desk** (AR-only, +18m) | (auto when headset on desk) | top-down + desk-anchored | mini-обсерватория |

### 5.5. Lifecycle

```
[user types/speaks] → 
  → Listening (если включен) / direct → 
  → Worker spawns → 
  → agent-aura появляется → 
  → intent-ghost(s) если mutation ≥5 → 
  → user accepts/rejects → 
  → tool-call-trail записывается → 
  → reasoning-thread доступен on demand → 
  → action completes → 
  → agent-aura fade out
```

### 5.6. Persistence

Все новые primitives — *durable*. Хранятся в SQLite (новые таблицы: `panels`, `frames`, `volumes`, `timeline_axes`, `reasoning_threads`, `tool_call_trails`, `agent_traces`). Migration plan — в `docs/product/ROADMAP-v2.md` E0 (months 0-3).

`agent-aura` и `intent-ghost` — *transient* (in-memory only, не персистируется).

---

## 6. Не-примитивы (что НЕ становится первоклассным)

Чтобы избежать concept-creep, явный список того что **не вводим**:

- ~~`avatar`~~ — отказались (Q1.4: Weiser calm-tech wins over Latour quasi-object)
- ~~`page`~~ — отказались (Q2.4: spatial canvas refuses pages)
- ~~`full-graph`~~ — отказались (Q4.2: TheBrain principle — никогда не рисуем весь граф)
- ~~`window`~~ — отказались (Vision Pro company windows — это desktop-companion concern, не core spatial primitive)
- ~~`named-reroute`~~ — отложили (Q7.4 — try after typed-link-registry; добавим если жалобы появятся)

---

## 7. Implementation hint per primitive

Сводная таблица для backlog-mapping (детали — в `docs/product/BACKLOG-v2.md`):

| Primitive | Новые files | Изменения | Effort | Phase |
|---|---|---|---|---|
| `panel` | `renderer/src/scene/Panel.tsx`, `electron/main/mcp/viz-tools.ts` | `WorldState` add `panels` map | L | E0 |
| `frame` | расширение `Cluster.tsx` или new `Frame.tsx` | Add `frame` kind to artifact | M | E0 |
| `timeline-axis` | `renderer/src/scene/TimelineAxis.tsx` | New `axes` map в WorldState | M | E1 |
| `volume` | `renderer/src/scene/Volume.tsx` | New `volumes` map | L | E1 |
| `anchor` | implicit in transform; `renderer/src/util/anchoring.ts` | Add anchor field to artifact/panel/volume | M | E2 (AR-ready) |
| `reasoning-thread` | `renderer/src/scene/ReasoningThread.tsx` | New `traces` table, `agent-trace` events emitter | L | E0-E1 |
| `tool-call-trail` | `renderer/src/scene/ToolCallTrail.tsx` | Derived from agent traces | M | E1 |
| `intent-ghost` | extension of `Artifact.tsx` with opacity + tag | New tool `propose_artifact()` | M | E0 |
| `agent-aura` | `renderer/src/scene/AgentAura.tsx` | Wire from `agentLog` events | S | E0 |
| `chart-panel` | extension of `Panel`; D3/Plotly integration | New panel widget API | L | E1 |
| `flow-panel` | extension of `Panel` + Mermaid live render | Move from Inspector to scene | M | E1 |
| `graph-3d` | extension of `Volume` + force-directed worker | Local force-directed (already in ROADMAP) | L | E1 |
| `cross-filter` | extension of `Artifact` selection logic | Hook into FilterChips + edges | M | E0 |
| `marking-menu` | new `renderer/src/ui/MarkingMenu.tsx` | Wire to Hotkeys | S | E0 |
| `ghost-preview` | + `propose_layout_plan` tool | Layout agent must commit-then-apply | M | E0 |
| `pivot-to-selection` | edit `Canvas.tsx` CameraFitter | Camera target = selection | S | E0 |
| `time-scrub` | new UI control + replay engine | Use existing event log | L | E2+ |
| `anchor-grab` | AR-only, defer to E3 | — | M | E3 |
| `agent-voice` | TTS integration; depends on Whisper | New agent module | M | E2-E3 |

---

## Источники
- Master plan: `~/.claude/plans/eager-imagining-piglet.md`
- Synthesis: `docs/research/synthesis/{patterns,anti-patterns,themes,tradeoffs,open-questions}.md`
- 12 workstream briefs: `docs/research/01-*.md` .. `12-*.md`
- Current schema: `docs/MODEL.md`
- AR inventory: `docs/research/ar-readiness-inventory.md`
