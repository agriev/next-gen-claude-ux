# Roadmap v2 — горизонт 36 месяцев

**Назначение:** обновлённый roadmap, опирающийся на synthesis 12-workstream research и продуктовое видение из [VISION.md](VISION.md). Не отменяет существующий `docs/ROADMAP.md` (он остаётся как операционный список текущих и недавних работ), а **дополняет** его 6 эпохами с горизонтом 3 года.

**Структура:**
- §1 Связь с docs/ROADMAP.md
- §2 6 эпох (E0 - E5) с подробностями: тема, цели, ключевые items, dependencies, AR-readiness impact, выход
- §3 Cross-references с CONCEPT.md и BACKLOG-v2.md
- §4 Open questions для re-assessment

---

## 1. Связь с docs/ROADMAP.md

Существующий ROADMAP — это **операционный список**:
- что Done (35+ items)
- что Open ★ high-leverage (5: Whisper, test harness, agent auto-restart, plugins, force-directed layout)
- что Open в категориях: agents+intelligence / backends+integrations / speed / content+UX / performance+scale / boring-but-important
- 8 open product questions

Roadmap v2 (этот документ) — это **стратегические эпохи** с горизонтом 36 месяцев, привязанные к synthesis findings. Items из v1 ROADMAP перераспределяются по эпохам v2, и появляются **новые** items, выведенные из research.

Соглашение: **в v2 не удаляем v1**. Если конкретный item в v1 становится приоритетом эпохи в v2 — упоминаем явно, ссылаемся. Если v1 item оказался de-prioritized — оставляем в v1 как "open", в v2 не упоминаем (не значит "отказались", значит "не в горизонте этой эпохи").

---

## 2. Шесть эпох

### E0 — "Фундамент" (месяцы 0-3)

**Тема:** укрепить базу — типизированный link registry, ghost-preview, reasoning-trace MVP, cross-filter. Это items которые **не требуют AR**, но **закрывают самые большие leverage gaps** из synthesis (T6 linked highlighting, TR4 typed links, TR6 reasoning trace, TR12 ghost-preview).

**Цели:**
1. `edge.kind` → `link_type` registry (Palantir-style typed Object/Link/Action lift)
2. **Cross-filter / linked highlighting** между artifacts (универсальный BI-паттерн, отсутствующий в agent tools — *biggest leverage*)
3. **Reasoning-thread** MVP (3 идиомы для прототипа, выбор лучшей)
4. **Intent-ghost** для mutation ≥5 artifacts (Layout agent propose-then-commit)
5. `pivot-to-selection` camera default (TR2)
6. `frame` (cluster с header) — primitive promotion
7. `agent-aura` (ambient visualization вокруг работающего агента)
8. **Marking menu** на artifacts (ctrl+drag → радиальное меню)
9. CameraController abstraction (M1 из AR-VR-BRIDGE; bridge enabler)

**Ключевые items из v1 ROADMAP, попадающие сюда:**
- ★ Test harness (Vitest + Playwright) — нужен для безопасного refactor'a
- ★ Force-directed 3D layout (worker_thread) — fallback для LLM Layout при scale
- Sub-agent spawning surface in Activity panel — заменяется на reasoning-thread MVP
- Naming agent as own short query
- Multi-line input bar

**Dependencies:** none (это первая эпоха).

**AR-readiness impact:** **большой положительный**. CameraController abstraction, замена `<Html>` на `<Text>` (M2), и типизированный link registry — все они делают будущую миграцию более чистой. Не делать AR в этой эпохе, но не закрывать дверь к ней.

**Выход из эпохи (когда переходим к E1):**
- Layout agent ошибается <30% (M1 metric из open-questions)
- Reasoning-thread прототип выбран и интегрирован
- 4 weeks usage data на cross-filter / linked highlighting — оно реально используется

### E1 — "Multi-dashboard / Console mode" (месяцы 3-9)

**Тема:** превратить free-form canvas в *профессиональный operator's workspace*. Реализация WS-12 finding о horseshoe layout + attention zones + alarm taxonomy.

**Цели:**
1. **Console mode** — Tab toggle между Canvas mode и Console mode
2. **Panel** primitive — 2D-поверхность с виджетами
3. **Chart-panel** — первая инкарнация: line / bar / heatmap (D3 или Plotly host'ится на panel)
4. **Flow-panel** — Mermaid / PlantUML переезжает из Inspector на panel в сцене
5. **Horseshoe layout** алгоритм для Layout-agent (mode: `console`)
6. `attention_rank` field на artifacts (расширение `spec`)
7. **Alarm taxonomy** — 4-tier (info / warning / critical / blocker) с visual + audio per WS-12
8. **Linked highlighting** между panels (cross-panel брashing)
9. `timeline-axis` primitive + `timeline` viz primitive
10. `volume` primitive + `graph-3d` viz (с TheBrain discipline: max 30 nodes в одном volume)
11. **Tool-call-trail** primitive (skeleton trace, lighter weight than reasoning-thread)

**Ключевые items из v1 ROADMAP:**
- ★ Streaming Worker output — критично для immediate feedback в console mode
- ★ Local heuristic layout in worker_thread — переходит из E0 если осталось
- Time-travel scrubber — теперь mappable на timeline-axis
- Context-menu on cards — реализуется через marking menu из E0
- Card resize via corner handle

**Dependencies:** E0 (CameraController, panels primitive groundwork).

**AR-readiness impact:** **большой положительный**. Console mode сам по себе — это AR-ready paradigm (stationary camera + fixed slots — exactly visionOS pattern). Panel/frame primitives работают идентично в AR.

**Выход из эпохи:**
- Console mode используется ≥3× в неделю на 30+ мин
- 4 weeks данных на linked highlighting — measurable productivity gain (subjective ok)
- LLM-layout success rate >70% (M1 metric)

### E2 — "AR-ready" (месяцы 6-12)

**Тема:** **разобрать DOM-зависимости** в сцене. Подготовить инфраструктуру для WebXR — replace `<Html>` overlays, abstract OrbitControls behind CameraController interface, ship WebXR experimental branch.

**Цели (overlap с AR-VR-BRIDGE.md milestones M2-M3):**
1. **M2:** Заменить 4 `<Html>` overlays на `<Text>` (troika-three-text). Bundle Inter `.woff2`.
2. **M3:** WebXR experimental branch — `@react-three/xr`, "Enter VR" button, Quest browser as test platform.
3. `XRHeadCameraController` implementation.
4. **DOM panels hide** when XR session active (graceful fallback).
5. Force-directed layout fallback wired для cases где LLM Layout слишком медленный для VR-frame-rate.
6. **Local Whisper** (★ v1 ROADMAP) — обязательное для AR-mode voice.
7. Auto-tagging daemon (★ v1 ROADMAP) — фон, без блокирующего UX.

**Ключевые items из v1 ROADMAP:**
- ★ Local Whisper (must-have)
- ★ Long-lived agent auto-restart (на 429/5xx, exponential backoff)
- ★ Plugin/hook system (~/.jarvis/plugins/) — оборот стабильности
- Embeddings cache for similarity layout
- Smaller/faster model for incremental layout (Ollama локально)
- Spec-only context for Layout

**Dependencies:** E0 (CameraController), E1 (panel/frame stable; tested).

**AR-readiness impact:** **критический**. Это эпоха которая делает Jarvis VR-portable. Без этого M4 visionOS spike невозможен.

**Выход из эпохи:**
- WebXR session создаётся в Quest Browser, сцена видна
- Whisper local работает offline, accuracy ≥90% на short utterances
- Все 4 `<Html>` overlays заменены
- Test harness covers scene/ + storage/

### E3 — "visionOS" (месяцы 12-18)

**Тема:** первый порт в Apple Vision Pro. **Immersive scene + companion windows pattern**.

**Цели (overlap с AR-VR-BRIDGE.md M4-M5):**
1. **M4:** visionOS native shell (`visionos-shell/`) с SwiftUI multi-window
2. WebView для Inspector / ActivityPanel / InputBar
3. WorldState shared via iCloud Drive (или local volume manual sync для dev)
4. **M5:** Gaze + pinch в immersive scene (artifact selection, long-pinch = grab)
5. Voice routing via Whisper (M5 dependent)
6. **Anchor** primitive — world/desk/hand/head (concretized в этой эпохе)
7. `anchor-grab` interaction
8. **agent-voice** — distinct TTS per agent, spatial audio source from `agent-aura` position
9. visionOS App Store distribution prep

**Ключевые items из v1 ROADMAP:**
- Codesigning + notarization macOS (overlap с visionOS signing)
- safeStorage для ANTHROPIC_API_KEY (sensitivity higher в AR где voice transcripts)

**Dependencies:** E2 fully landed.

**AR-readiness impact:** AR is **here**. Этот эпоха — главная.

**Выход из эпохи:**
- Антон надевает AVP → видит свой Console mode immersive → может выполнить полную задачу (research → write → reorganize) без снятия headset
- Multi-device sync (desktop ↔ AVP same state) работает с задержкой ≤2 минуты

### E4 — "Calm-tech / ambient" (месяцы 18-30)

**Тема:** Jarvis становится **ambient companion** — calm tech per Weiser. Не требует постоянного внимания. Daily-digest на стене, desk-mode (Dynamicland-inspired).

**Цели:**
1. **Calm-mode** в AR — default state когда headset надет но active focus не engaged. Только ambient-timeline на дальней стене.
2. **Desk-mode** — passthrough detect горизонтальной поверхности → immersive scene "приземляется" как мини-обсерватория
3. **Daily-digest agent** (v1 ROADMAP) — фоновая работа, появляется в calm-mode
4. **RAG Q&A** (v1 ROADMAP) — embeddings store, "what do I know about X" voice command
5. **Trail-as-PR** — export named trail как markdown gist + canvas.json, push to GitHub
6. **Time-travel scrubber** в AR (voice-driven scrub: "отмотай на момент когда X")
7. **Per-task budgets** (v1 ROADMAP) — `request_layout_pass(maxBudgetUsd: ...)` 

**Ключевые items из v1 ROADMAP:**
- RAG Q&A — explicit
- Daily digest agent — explicit
- Settings panel — нужен для calm-mode preferences
- Theme system (light/dark/ambient) — ambient theme критичен

**Dependencies:** E3 fully landed; agents stable; voice-mature.

**AR-readiness impact:** AR-only features (calm-mode, desk-mode); desktop версия получит подмножество (daily-digest, trail export, time-travel).

**Выход из эпохи:**
- Антон носит AVP ≥1 час в день в "ambient mode" — Jarvis виден peripherally, не активно interacting
- Daily-digest generates useful summary 4-5 раз в неделю
- Trail export использован ≥10 раз для шаринга в external repos

### E5 — "Multi-user (if pull)" (месяцы 24-36)

**Тема:** Shared anchor для collaborative work. **Эта эпоха условна** — реализуется только если pull появляется (user feedback, business need, или собственная боль).

**Цели (если идём):**
1. Shared `WorldState` via CRDT (Yjs); WebRTC peer relay
2. **Agent-cursor** per user (другие пользователи видят твои действия как ghost cursor)
3. NOC-style "shared wall + private console" pattern
4. Conflict resolution для одновременной мутации одного artifact
5. **agent-cursor per agent тоже** (developer mode)
6. Linear / GitHub Issues sync as board (v1 ROADMAP)

**Альтернатива:** если pull не появляется — этот эпоха **не делается**. Вместо неё **E5-alt** — больше depth в personal use case (например, mnemonic-medium integration per Q8.3, или больше plugin ecosystem).

**Dependencies:** E4 stable; >1 active user (Антон + ≥1 collaborator) для testing.

**Выход:** N/A (re-assess at month 24 — go/no-go).

---

## 3. Cross-references

| Эпоха | CONCEPT.md primitives | AR-VR-BRIDGE milestone | Backlog cards |
|---|---|---|---|
| E0 | frame, intent-ghost, agent-aura, reasoning-thread (MVP), tool-call-trail | M1 | E0-* |
| E1 | panel, chart-panel, flow-panel, timeline-axis, timeline, volume, graph-3d, attention_rank | (none AR-specific) | E1-* |
| E2 | anchor (groundwork) | M2, M3 | E2-* |
| E3 | anchor (concretized), agent-voice, anchor-grab | M4, M5 | E3-* |
| E4 | calm-mode rules, desk-mode rules | (extensions of M4) | E4-* |
| E5 | agent-cursor (multi-user), shared-state primitives | M6 | E5-* (if go) |

Подробные backlog cards — в [`BACKLOG-v2.md`](BACKLOG-v2.md).

---

## 4. Open questions для re-assessment

### При выходе из E0 (~month 3)
- M1: какова реальная success rate LLM Layout? Нужно ли усилить fallback? (см. open-questions.md M1)
- M5: первый perf cliff на synthetic load test? (см. open-questions.md M5)
- Q1.1: какой reasoning-thread idiom выиграл прототип? Решает design для E1+

### При выходе из E1 (~month 9)
- Q2.2: 5 слотов в horseshoe — достаточно или нужно 6? Empirical.
- Q5.1: cross-filter spatial behavior — fade vs move? Decided based on usage.
- M3: voice как primary input — нужно ли разворачивать HUD в этом направлении уже на десктопе?

### При выходе из E2 (~month 12)
- M3 milestone success: WebXR работает на Quest и AVP — если нет, M4 нужно пересмотреть
- Q4.2: rendering "full graph" view — кто-то попросил? (Ожидаемо: нет.)

### При выходе из E3 (~month 18)
- AR success criteria из AR-VR-BRIDGE.md §8: 3 из 4 — go E4; 1-2 из 4 — bridge replan
- Multi-user pull появился? Решает E5 / E5-alt

### При выходе из E4 (~month 30)
- Vision Pro дневное usage стабильно? Если нет — фокус на personal-depth (E5-alt)

---

## 5. Cadence обновления

- **Каждый месяц:** одна-страничный progress note в `docs/product/_progress/YYYY-MM.md` (не часть этого doc)
- **На границе эпох:** обновить этот файл — отметить эпоху как Done, добавить retrospective bullet, refine следующую эпоху
- **При smacze major insight:** revisit synthesis (`docs/research/synthesis/`) и обновить VISION/CONCEPT при необходимости. Versionirovat' в Git, не in-place.

---

## 6. Принципы priorit'ации (фильтр для добавления items)

Каждый новый item проходит фильтр:

1. **Какому Theme или Tradeoff он отвечает?** (из synthesis). Если ни одному — слабый сигнал.
2. **На какой эпохе он логически живёт?** Cross-эпохальные items — re-formulate.
3. **AR-readiness impact?** + / - / neutral. Никаких minus в E0-E2.
4. **Какой size?** S (часы) / M (дни) / L (недели). L items в одной эпохе ≤2 одновременно.
5. **Какой ⚠ anti-pattern он рискует нарушить?** Если есть — explicit mitigation note.
6. **Какой open question он закрывает?** Хорошо если ≥1.

Items проходящие 4+ фильтра → backlog cards в `BACKLOG-v2.md`.

---

## Источники
- VISION: [`./VISION.md`](VISION.md) — особенно §6 эпохи (одинаковые)
- CONCEPT: [`./CONCEPT.md`](CONCEPT.md) — primitives mapped here
- AR-VR-BRIDGE: [`./AR-VR-BRIDGE.md`](AR-VR-BRIDGE.md) — M1-M6 mapped here
- BACKLOG-v2: [`./BACKLOG-v2.md`](BACKLOG-v2.md) — детали реализации каждого item
- Synthesis: [`../research/synthesis/`](../research/synthesis/)
- Existing v1 roadmap: [`../ROADMAP.md`](../ROADMAP.md) — НЕ заменяется этим документом
- Master plan: `~/.claude/plans/eager-imagining-piglet.md`
