# Vision: Interactive Jarvis в эре повсеместных AR/VR и быстрых LLM

> Тезис: текст перестал быть достаточным форматом для упакованной мысли. Сложность процесса теперь несёт LLM, а человек воспринимает результат как **множественные связанные диаграммы и дешборды, расставленные в пространстве**. Interactive Jarvis — это персональная "комната-обсерватория", в которой LLM-агенты непрерывно перекомпонуют диаграммы под текущий вопрос пользователя, а человек смотрит, фокусирует и принимает решения. Inner-loop у профессионала knowledge-work смещается от *"написать запрос → прочитать ответ"* к *"увидеть пространство → ткнуть в нужное → уточнить голосом"*.

---

## 1. Контекст: почему именно сейчас

Три синхронных сдвига сделали такой интерфейс не просто желательным, а *обязательным*:

**(а) Стоимость и латентность LLM упали в 10-100×.** Layout, поиск, дедупликация, переформулировка, классификация — всё это раньше требовало человеческого внимания; сейчас выполняется агентом за миллисекунды. Освободившееся внимание уходит **не в чтение текста**, а в восприятие пространственной картины.

**(б) AR/VR подходит к ubiquitous-точке.** Apple Vision Pro поставлен на серийку, Meta Quest 4 (2026) демонстрирует pancake-оптику в форм-факторе очков, lightweight successors появятся в течение 24-36 месяцев. К моменту когда мы будем готовы — массовый пользователь будет в наушниках 1-3 часа в день для focused work (см. наш WS-02 brief: vendor guidelines per visionOS 26, Horizon OS 8, MRTK4 v3).

**(в) Plateau текстовых интерфейсов виден.** ChatGPT/Claude/Cursor доказали что LLM-чат — это первая, не последняя, форма AI UX. Линейный поток сообщений плохо ложится на:
- параллельную работу нескольких агентов
- сравнение альтернатив (branch comparison)
- многоступенчатые исследования с возвратом к узлам
- compressed concepts которые требуют диаграмм, а не прозы

Synthesis нашего исследования (WS-07, "AI-native interfaces") говорит прямо: **ни один из 20+ surveyed AI-инструментов не ширит 3D reasoning surface**. Это незанятая территория.

---

## 2. Что такое Interactive Jarvis (one-paragraph)

Десктопное (сейчас) и AR/VR (горизонт 12-36м) рабочее пространство, в котором **информация живёт как пространственные объекты** — карточки-артефакты, типизированные связи, кластеры, дешборд-панели, временные оси. LLM-агенты (Worker для исполнения, Layout для пространственной организации, Listening для распознавания намерения, Naming для именования) непрерывно мутируют эту сцену в ответ на голос и текст пользователя. Человек смотрит, фокусируется, принимает решения; механика — на агентах. Локальное хранение, single-user, model-agnostic (Anthropic Agent SDK сейчас, swappable).

Это **не**:
- Не чат с LLM с боковой панелью
- Не infinite canvas с ручным размещением (как Heptabase)
- Не граф знаний (как Obsidian Graph view)
- Не BI-дешборд с фиксированной схемой данных (как Tableau)
- Не node-graph IDE (как Houdini для VFX)

Это **гибрид** всех пяти, где LLM-агенты являются связующим веществом — они автоматически переводят между формами по запросу человека.

---

## 3. Hero scenarios

Четыре пользовательских истории на четырёх временны́х горизонтах. Они проверяют что одна и та же архитектура работает от десктопа до AR-будущего.

### 3.1. Desktop сейчас (МVP, доступно с месяца 0)

**Контекст:** Антон работает дома, MacBook Pro, моноблок 5K, без AR.

**История:**
> Антон закрывает Notion и Slack, открывает Jarvis. На экране — последняя сессия: 19 карточек, 3 кластера, 23 ребра. Bookmark "Q1 planning" возвращает камеру к точке откуда он ушёл вчера.
> 
> Он печатает в InputBar: "найди противоречия между Pulse и Mission". Worker за 4 секунды создаёт карточку `@Tension`, проводит `contradicts`-edge к обеим, и `set_artifact_spec` с tagged "open-question". Карточка появляется streaming-стилем (полупрозрачная плита с scanline), потом opaque.
> 
> Антон жмёт `V` на `@Tension` и голосом: "переформулируй с акцентом на customers". Worker обновляет body. Антон жмёт `Cmd+L → by-topic`. Layout reorganize за 800ms перегруппировывает все non-pinned карточки. Появляются 4 новых кластера.
> 
> На правой стороне экрана — `LayoutActivityPanel` показывает что Layout сделал: какие placement'ы, какие clusters, сколько токенов, сколько $. Антон оценивает план, всё ок.

**Что доказывает:** базовый цикл "увидел → ткнул → уточнил" уже работает в текущей кодовой базе (см. `docs/ROADMAP.md` Done). Это **floor**, не **ceiling**.

### 3.2. Desktop +12 месяцев (Console mode + типизированные связи + reasoning trace)

**Контекст:** Антон ведёт стратегическое планирование, 47 артефактов, несколько параллельных тем.

**История:**
> Антон жмёт `Tab` → сцена переключается из free-form canvas в **Console mode**: 5-слотовая "подкова" вокруг камеры. P-слот (центр): главный поток внимания — карточка `@Mission`. W1, W2 (рабочие 30° левее/правее): открытые суб-вопросы. A1, A2 (ambient, 60° левее/правее): kpi-дешборд и timeline активности.
> 
> Он спрашивает: "покажи мне как сегодня менялся @Mission". Жмёт `Cmd+R` → в воздухе над `@Mission` появляется **reasoning-thread**: вертикальная нить из 12 узлов, каждый — один tool call Worker'а или Layout'а с timestamp. Камера фокусируется на нити, наклоняется. Толщина нити кодирует cost (тонкая = дёшево, толстая = дорого). Цвет — какой агент.
> 
> Антон ткает в один из tool-call узлов: "почему ты заменил `supports` на `derives`?" — Listening переадресует на Worker, который отвечает в виде нового inline ответа на той же нити (не в чате — на пространственной нити). Антон принимает изменение или откатывает на этот момент.
> 
> Затем спрашивает: "что сегодня связано с @Strategy?" — Layout создаёт `tool-call-trail` (последовательность beads-цепочка от @Strategy через 4 промежуточных артефакта к @Mission). Это **named trail** в духе Bush'а 1945 — сохраняется как первоклассный объект, можно экспортировать, расшарить.

**Что новое:** Console mode (WS-12 horseshoe), **3D reasoning trace** как занятая ниша (TR6, no one does this), **типизированный link registry** (TR4, lifted from Palantir Object/Link Type model), **named trails** (revived from Bush через WS-11).

### 3.3. Vision Pro +24 месяца (immersive + companion windows)

**Контекст:** Антон работает в Vision Pro 90 минут утром, "виртуальный кабинет" в гостиной.

**История:**
> Включает Jarvis на Vision Pro. **Immersive scene** разворачивается на расстоянии ~2 метра от него (world-anchored, не head-anchored — стабильно даже когда он поворачивает голову). Рядом, на 35° левее, парит **companion window** — Inspector (DOM-based, рендерит markdown body).
> 
> Сейчас в immersive scene Console mode: P-слот с graphics-heavy дешбордом (3D scatter в `volume` + matrix heatmap на `panel`), W-слоты по бокам с открытыми вопросами, A-слоты с lifecycle-таймлайнами.
> 
> Антон смотрит на одну точку в 3D scatter (gaze) и пинчит (hand) — точка выделяется кольцом, на companion window открывается detail. Он говорит: "проверь две гипотезы про эту точку параллельно". Worker spawn'ит **два sub-action'а**, в воздухе появляются два **intent-ghost** (полупрозрачные плиты с тегом "draft"). Каждый ghost — будущая карточка которую Worker собирается создать. Антон смотрит на левый ghost, кивает (gaze + small head nod, поддержано Vision Pro Gestural API) — он коммитится. Правый он смотрит и swipe-разводит ладони — отменяется.
> 
> Reasoning trace тут другая: вместо вертикальной нити, она **горизонтальный временной ribbon** перед ним, scrubable голосом ("отмотай на момент когда Layout удалил кластер X"). Spatial audio: Worker говорит из P-слота, Layout — из A1-слота. Каждый агент имеет distinct TTS-voice.
> 
> Когда Антон снимает headset, Jarvis сохраняет состояние сцены в тот же `WorldState` который и десктоп использует. Через 5 минут он садится за моноблок, открывает Jarvis, и видит ту же сцену в orbit-камере.

**Что новое:** WebXR + visionOS bridge (см. AR-VR-BRIDGE.md milestones M3-M4), **gaze + pinch + voice триада** (per WS-02 vendor patterns), **multi-device sync через тот же `fs-sync`** (Q7 из open-questions), **intent-ghost** primitive (revived from Bret Victor's "immediate connection").

### 3.4. Multi-device AR +36 месяцев (ambient + room-as-substrate)

**Контекст:** Антон в очках pancake-optics весь рабочий день, плюс десктоп как референс-monitor.

**История:**
> Утром Антон надевает очки. Jarvis по умолчанию — calm-mode: только **ambient timeline** на дальней стене (5 метров от него), показывает изменения за ночь от daily-digest агента. Никакой actively-displaying информации, calm tech per Weiser.
> 
> Он подходит к десктопу, кладёт очки на стол. Очки detect'ят desk-surface через passthrough + lidar и переключаются в **desk-mode** (Dynamicland-inspired): immersive scene "приземляется" на горизонтальную поверхность как мини-обсерватория. Десктоп-моноблок становится Inspector-companion window.
> 
> Антон с двумя коллегами по Teams (multi-user поход вышел в v2 — see open-questions Q7.3 и M4): расшаривает board. Они видят то же spatial state. Курсор каждого — distinct color. Когда коллега из Берлина двигает артефакт, Антон видит это в реальном времени, и Layout-агент учитывает чужие позиции при следующем reorganize.
> 
> На дальней стене теперь — главный horseshoe для общего разговора. На столе у Антона — личный side-canvas с черновиками.
> 
> Он говорит: "Jarvis, экспортируй trail последних трёх часов как PR". Trail-как-объект превращается в markdown gist + canvas.json, и пушится на GitHub. Коллеги получают ссылку.

**Что новое:** **calm-tech ambient mode** (revived from Weiser via WS-11), **desk-mode** (revived from Bret Victor's Dynamicland), **multi-user shared anchor** (per WS-06, WS-12), **trail-as-PR** (revived from Engelbart).

---

## 4. Differentiation: что мы делаем уникально

| Категория | Лидер сегодня | Что они делают | Что Jarvis делает иначе |
|---|---|---|---|
| **Knowledge graph** | Obsidian | 2D force-directed graph, отказывается от него на >2k нодах | Никогда не пытаемся показать "весь граф" — focus-plus-context (T2), типизированные связи (T3), Layout-agent reorganize вместо ручной раскладки |
| **Canvas** | tldraw, Heptabase | Бесконечный canvas, ручное размещение, реалтайм-collab | LLM-driven layout как primary (TR9), spatial-stability principle (T1), Console mode + horseshoe (WS-12), single-user первые 12м |
| **Pseudo-3D PKM** | TheBrain | 30 thoughts в фокусе, plex-камера, single-user | Аналогичный focus-discipline + multi-agent + Vision Pro путь миграции, AR-ready архитектура |
| **AI-native IDE** | Cursor, Replit Agent | Чат + diff-панели, файлы-как-карточки, agent-mode | Не file-centric — knowledge-centric. Reasoning trace в 3D вместо плоского tree (TR6). Multi-agent visible parallelism. |
| **BI** | Tableau, Power BI | Множественные dashboard tiles + linked highlighting | Berem the linked highlighting pattern (T6 — universal in BI, absent в agent tools), несём в LLM-driven контекст. Один dashboard за раз? Нет — мы про множественные дешборды в spatial setup (WS-12 horseshoe). |
| **Data flow / ontology** | Palantir Foundry | Typed Object/Link/Action, Pipeline Builder | Lift typed Link Type registry для edges (TR4). Action-as-first-class для повторяющихся операций. Multi-view linking как core. |
| **Node-graph editors** | Houdini, ComfyUI | 2D node networks, sub-network dive-in | Sub-network концепция мигрирует в кластер-как-первоклассный-объект; dive-in == camera-fly-into-cluster в 3D |
| **AR/VR data viz** | Virtualitics, Flow Immersive | Generic 3D data viz без semantic layer | Мы про **рабочее пространство для процесса**, не про "посмотреть готовые данные". Семантика + агенты + персистенция — наш слой. |

Уникальная позиция: **единственный продукт, который ставит "3D reasoning surface для multi-agent работы" в центр**. (TR6 — никто в нашем surveyed catalog не делает этого.)

---

## 5. Что мы НЕ делаем (founding constraints)

Чёткие отказы — экономят фокус:

- **Не multi-user в v1** (12 месяцев). Single-user. Collab — open-question M4, оценить через год.
- **Не cloud-first.** Локальное хранение (SQLite + fs-sync). Cloud sync — опциональный плагин в v2.
- **Не mobile-touch.** Десктоп + AR/VR. Mobile — отдельный продукт, если когда-нибудь.
- **Не LLM-provider-agnostic в v1.** Anthropic Agent SDK as primary; abstraction слой — v2.
- **Не workflow automation.** Мы про мышление, не про "если X то Y". Zapier/n8n остаются в своей нише.
- **Не replacement Obsidian'у.** Мы — *layer над* существующим vault'ом (см. ROADMAP-v2 — Obsidian как backend).
- **Не "full graph view".** Никогда. (Q4.2 в open-questions — design decision locked.)
- **Не decorative 3D.** 3D имеет смысл только когда несёт semantic load (T1 + anti-pattern "no-unjustified-3D" из WS-01).

---

## 6. Эпохи (тизер ROADMAP-v2)

| Эпоха | Горизонт | Главная тема | Принципиальные изменения |
|---|---|---|---|
| **E0 Now** | месяцы 0-3 | укрепить фундамент | typed Link registry, panel/frame primitives, reasoning-thread MVP |
| **E1 Multi-dashboard** | месяцы 3-9 | Console mode | horseshoe layout, attention_rank, alarm taxonomy, linked highlighting между панелями |
| **E2 AR-ready** | месяцы 6-12 | разобрать DOM-зависимости | CameraController abstraction, `<Text>` вместо `<Html>`, WebXR experimental |
| **E3 visionOS** | месяцы 12-18 | первый порт в AR | immersive scene + companion windows, gaze+pinch, world-anchored |
| **E4 calm-tech** | месяцы 18-30 | ambient mode | daily-digest на стене, desk-mode (Dynamicland-inspired), per-agent TTS |
| **E5 Multi-user** | месяцы 24-36 | shared anchor (если pull) | NOC-style "shared wall + private console" — иначе остаёмся single-user |

Детали — в `docs/product/ROADMAP-v2.md`.

---

## 7. Принципы (короткие правила-якоря для product decisions)

Эти 8 правил извлечены из synthesis. Они — фильтр для "должно ли это попасть в продукт" в следующие 36 месяцев:

1. **Spatial stability beats novelty.** (T1) Пользователь возвращается к той же сцене → она должна быть узнаваемой.
2. **Focus-plus-context, never full graph.** (T2, Q4.2) Показываем ~30 объектов вокруг текущего фокуса, остальное — aggregated.
3. **Typed ontology beats free-form tags.** (T3, TR4) Кids/edge-kinds/action-types/link-types — registry, расширяемый.
4. **Two-layer color, never three.** (T5) Categorical kind + state overlay. Magnitude/confidence — через другие channels (size, opacity).
5. **Linked highlighting between everything.** (T6) Hover/select в одной панели → отражается во всех связанных видах.
6. **LLM does layout; heuristic fallback past threshold.** (TR9, M1 meta) Primary — LLM. Когда >threshold или 429, force-directed worker thread.
7. **World-anchored, not head-anchored.** (T9 in tradeoffs, WS-02) Сцена живёт в мире, не следует за головой.
8. **Reasoning trace lives in space.** (TR6, WS-07) Z-axis — наша незанятая ниша; 3D thread не должен превратиться в "просто 3D-список".

Каждый product decision проходит фильтр этих 8 правил перед commit'ом в CONCEPT.md / VISUAL-LANGUAGE.md / ROADMAP-v2.md.

---

## 8. Метрика успеха (когда видение реализовано)

Это **не SaaS-метрики** (нет MRR, нет MAU). Это персональный инструмент, поэтому метрики — качественные:

- **24-month gut check:** в 2028 я открываю Jarvis в Vision Pro 5 раз в неделю на ≥30 мин для focused work, и предпочитаю его браузеру с 6 tabs.
- **12-month gut check:** в 2027 я открываю Jarvis в десктопе 5 раз в неделю на ≥30 мин, и Console mode перестроил мою manera ведения strategic notes.
- **6-month milestone:** Layout agent ошибается <20% (по M1 metric — пользователь не передвигает карточки в первые 5 минут после reorganize), reasoning-thread прототип работает в 3 идиомах для сравнения.

Если за 36 месяцев этих gut checks нет — vision не сработал, делаем post-mortem и пишем v2.

---

## Источники
- Все 12 workstream briefs: `docs/research/01-*.md` .. `12-*.md`
- Synthesis: `docs/research/synthesis/{patterns,anti-patterns,themes,tradeoffs,open-questions}.md`
- Current state: `docs/{ARCHITECTURE,MODEL,AGENTS,ROADMAP,SHORTCUTS}.md`
- AR readiness: `docs/research/ar-readiness-inventory.md`
- Original master plan: `~/.claude/plans/eager-imagining-piglet.md`
