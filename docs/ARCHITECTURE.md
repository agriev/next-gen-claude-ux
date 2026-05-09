# Architecture

## Three processes, one shared world

```
┌─────────────────────────────────────────────────────────────────┐
│  Electron main process (Node)                                   │
│                                                                 │
│  ┌──────────────┐  ┌────────────────────────────────────────┐  │
│  │ WorldState   │  │ Orchestrator                           │  │
│  │ (in-memory + │  │   ├─ Worker(s)  ─┐                     │  │
│  │  SQLite WAL) │  │   ├─ Layout      │                     │  │
│  └──────────────┘  │   ├─ Listening   ├─ each is a query()  │  │
│         ▲           │   └─ Naming      │  from               │  │
│         │           │                  │  @anthropic-ai/     │  │
│         │           │  UndoLog         │  claude-agent-sdk   │  │
│         │           │  CameraFocus     │                     │  │
│         │           │  LayoutHistory  ─┘                     │  │
│         │           └────────────────────────────────────────┘  │
│         │                                                       │
│         │           ┌────────────────────────────────────────┐  │
│         │           │ FsSync (chokidar + simple-git)         │  │
│         │           │  ↳ <userData>/boards/<id>/artifacts/   │  │
│         │           └────────────────────────────────────────┘  │
│         │                                                       │
│  ┌──────┴───────────────────────┐                               │
│  │ Event bus (mitt)              │  ─── 16 ms tick ──┐          │
│  │  world: WorldEvent             │                  │          │
│  │  agentLog: AgentLogEvent       │                  ▼          │
│  └────────────────────────────────┘     IPC coalescer            │
└─────────────────────────────────────────────────│──────────────┘
                                                  │
                                                  ▼ contextBridge
┌────────────────────────────────────────────────────────────────┐
│  Renderer (Vite + React 18 + R3F)                              │
│                                                                │
│  Zustand world-store ◀──── WorldDeltaBatch / AgentLogEvent     │
│       │                                                        │
│       ├─ scene/Canvas (R3F): Artifact·Edge·Cluster·CameraFitter│
│       ├─ ui/Inspector · LayoutMenu · ModelPicker · ...         │
│       └─ ipc/bridge ───── window.api.* ───── main IPC handlers │
└────────────────────────────────────────────────────────────────┘
```

**Why all SDK sessions live in main, not in child processes**

- The Agent SDK already spawns the Claude binary as its own subprocess per `query()`. Wrapping that in another `child_process` adds nothing.
- In-process MCP tools (`createSdkMcpServer` + `tool()`) run their handlers in the same JS context, so they can mutate the same `WorldState` the renderer subscribes to. Splitting agents across processes would force re-marshalling everything through IPC.
- Cancellation is per-`query()` via `AbortController`. Concurrency among 3–5 agents is trivial — they're I/O-bound on HTTPS to Anthropic, not CPU-bound.
- One owner of the SQLite handle prevents WAL contention.

CPU-heavy work that could land later (force-directed 3D layout math, embedding similarity for edges) goes into `worker_threads` spawned from main, exposing `MessagePort`s.

---

## Agent topology

Each agent is a separate `query()` call from `@anthropic-ai/claude-agent-sdk`. Independent lifetimes, prompts, model, cancellation.

| Agent | Lifetime | Input | Default model | Tools |
|---|---|---|---|---|
| Worker (0..N, max 4 concurrent) | one `query()` per task, may `forkSession` | a command (text + references) from user / Listening | Sonnet 4.6 | canvas-tools + layout-tools (full toolkit) |
| Layout | long-lived, streaming-input async iterator | artifact-spec deltas + reorganize requests | Haiku 4.5 | layout-tools |
| Listening | long-lived, streaming-input | transcript chunks (kbd / voice) | Haiku 4.5 | listening-tools (`propose_action`, `cancel_action`) |
| Naming | short `query()` per artifact | excerpt of body | Haiku 4.5 | canvas-tools (subset) |

**Listening → Worker dispatch.** Listening doesn't call Workers directly. It emits `propose_action({ kind, params, supersedes? })` on its MCP server. Orchestrator subscribes and spawns Workers. Listening is "thinking aloud"; Orchestrator is authoritative.

**Layout input.** Orchestrator feeds JSON deltas:

```json
{"op":"hello","artifacts":[...]}
{"op":"upsert","artifact":{...}}
{"op":"remove","id":"..."}
{"op":"reorganize","mode":"by-topic","prompt":"...","artifacts":[...]}
```

Layout responds by calling `place_on_canvas`, `draw_edge`, `create_cluster`. Bounded context — only `spec.summary` (≤200 tokens), not full body.

**Live model switch.** Long-lived agents (Layout, Listening) keep a reference to their `Query` object and call `query.setModel(modelId)` to swap models without restarting. Worker and Naming pick up the new model on the next spawn.

**Cancellation.** `Map<actionId, { abortController, query, kind }>` in Orchestrator. `Cmd+.` or per-chip click → `controller.abort()` → emits `action.cancelled`. Tool side-effects are wrapped tentative-then-commit so aborted Workers don't leave half-written artifacts.

See [AGENTS.md](AGENTS.md) for prompts and detailed tool schemas.

---

## Data model

Single source of truth: SQLite with WAL. In-memory `WorldState` mirrors the active board. See [MODEL.md](MODEL.md) for full schema, migrations, and entity relationships.

Top-level entities:

- `Board` — independent canvas (project).
- `Artifact` — card. Belongs to a board. `kind ∈ { doc, note, code, log, image, link, cluster }`. Position, pinned flag, optional spec, optional parent (for highlights), optional attachment.
- `Edge` — directed link between artifacts. `kind ∈ { derives, references, contradicts, groups-with }`. `createdBy ∈ { user, layout, worker }`.
- `Action` — record of an agent task. Captures full prompt, status, cost, tokens, produced-artifact ids.
- `Bookmark` — saved camera view (slot 1–9, per board).
- `Notification` — persistent notification ring (worker.done, errors, system messages).
- `Attachment` — pasted/dropped binary file.
- `app_state` — key/value store: active board id, model settings, onboarding flag.

Migrations live in `electron/main/db/migrations.ts` as inline SQL strings, applied via a transaction on startup.

---

## IPC

All IPC happens over `contextBridge` exposing a typed `window.api`. Channels declared in `shared/ipc-channels.ts`.

**Renderer → main commands:** submit utterance, cancel, pin/unpin/move/delete artifact, create/delete edge, refine artifact, create highlight, create attachment, create/switch/rename/delete board, save/delete bookmark, undo/redo, request reorganize, restore layout, set model, mark notification read, update camera focus.

**Main → renderer events:**

- `event:world-delta` — coalesced 16ms batch of `WorldEvent`s (artifact upserted/removed, edge upserted/removed, layout positions, action status, board switched, bookmark, notification, undo state, layout state, model settings, transcript chunk, listening status, toast, utterance preview).
- `event:agent-log` — per-agent stream tokens for the activity panel and HUD.

**Back-pressure.** World deltas are coalesced on a 16ms tick (one IPC `send` per frame). Layout positions throttled to ≤30 Hz; renderer interpolates between server-set targets in `useFrame`. Per-agent token streams are downsampled to ≤10 Hz before crossing IPC. If queue depth exceeds 256, oldest non-final transcript chunks are dropped (final ones never).

**Renderer → Three.js.** Not IPC — Zustand `world-store` holds artifacts/edges/positions. R3F entities subscribe via selectors. `useFrame` lerps current → target poses. A module-level `live-transforms` Map of `id → Vector3` lets edges read live (per-frame) artifact positions to keep their endpoints + spring-physics control points attached even during user drag.

---

## Filesystem sync

Two-way mirror per board:

```
<userData>/boards/<board_id>/
├── .git/                            # optional, init lazily on first sync
└── artifacts/
    ├── Mission.md
    ├── Pulse.ts
    ├── Trace.log
    └── ...
```

- On `artifact.upserted`: debounced 500 ms write of `<shortName>.<ext>` (ext from kind+mime).
- On `artifact.removed`: file deleted; stale files swept on board change.
- On chokidar `change`: if file's sha256 differs from last write, push as `artifact-update` to WorldState (this fires an `artifact.upserted` event so renderer sees the change).
- Auto-commit every 5 minutes (or N changes) via `simple-git`. Repo is initialized on first commit if absent. Commit message: `auto: <iso-time> (N files)`.

A small write-suppression set prevents the watcher from looping back on writes we just performed.

---

## Undo/redo

In-memory ring buffer (max 200) of inverse ops in `Orchestrator.undoLog`:

- `artifact-create` / `artifact-delete` / `artifact-update`
- `edge-create` / `edge-delete`

Each op stores `before` / `after`. Forward = apply `after`; inverse = apply `before`. User-initiated mutations (`moveArtifact`, `updateArtifactBody`, `createEdge`, `deleteArtifact`) push to the log; layout-agent moves do not (those have their own history — see Layout history below).

`Cmd+Z` / `Cmd+Shift+Z` traverse the log. Counts broadcast as `undo.state` events to drive the HUD's `↶ N / ↷ N` chips.

---

## Layout history

Separate stack (max 10) for "the layout the user had before the most recent reorganize". Each `requestReorganize` snapshots:

```ts
{ ts, modeBefore, positions: [{id,x,y,z,pinned}], clusters: Artifact[] }
```

Existing clusters are then deleted (assistant will create fresh ones). On `restoreLayout`: pop most recent snapshot → wipe current clusters → restore positions/pinned → re-create snapshotted clusters.

Counter broadcasts as `layout.state` event; renders `↶ restore previous · N saved` in the LayoutMenu.

---

## Voice (best-effort)

`transcript-source.ts` interface: `start(): AsyncIterable<TranscriptChunk>; stop()`.

- `keyboard-source.ts` — MVP source, emits one final chunk per Enter.
- Browser `webkitSpeechRecognition` — used by `Voice.tsx` for PTT (hold Space) and continuous mode. **Caveat:** Chromium routes through Google's speech endpoint, which often returns `service-not-allowed` or `network` in Electron because no Google API key is wired up. The renderer surfaces the specific error.
- **Planned (Roadmap):** local Whisper via `@xenova/transformers` (ONNX in WASM) — model downloads once, runs offline. ~40 MB.

Card focus mode (`V` on selected) routes voice transcript to `refineArtifact(id, text)` instead of generic `submitUtterance`.

---

## Diagram rendering

In `body`:

- `@startuml ... @enduml` blocks → encoded via `plantuml-encoder` → `https://www.plantuml.com/plantuml/svg/<encoded>` → rendered as `<img>` in the Inspector.
- Fenced ```` ```mermaid ... ``` ```` → mermaid.js (loaded via dynamic ESM import from jsdelivr CDN, cached) → SVG injected.

Card front face shows a placeholder `📊 diagram inside — open Inspector` and replaces the diagram block with `〔diagram block〕` in body preview, so the canvas-rendered card stays clean.

CSP allowlists `https://www.plantuml.com` and `https://cdn.jsdelivr.net` for image and script.

---

## Project layout

```
interactive_jarvis/
├── package.json
├── electron.vite.config.ts
├── electron/
│   ├── main/
│   │   ├── index.ts                # app lifecycle + permission handlers
│   │   ├── ipc.ts                  # all IPC handlers
│   │   ├── orchestrator.ts         # owns SDK sessions, undo/layout history, camera focus
│   │   ├── world-state.ts          # in-memory + SQLite mirror
│   │   ├── event-bus.ts            # typed mitt bus
│   │   ├── undo-log.ts             # ring buffer of inverse ops
│   │   ├── fs-sync.ts              # chokidar + simple-git per-board mirror
│   │   ├── async-queue.ts          # streaming-input queue helper
│   │   ├── agents/
│   │   │   ├── worker.ts           # short-lived per-task agent
│   │   │   ├── layout.ts           # long-lived spatial agent
│   │   │   ├── listening.ts        # long-lived utterance segmenter
│   │   │   └── naming.ts           # (placeholder, hooked into worker for now)
│   │   ├── mcp/
│   │   │   ├── canvas-tools.ts     # create_artifact, update, name, set_spec, attach_log, request_layout_pass
│   │   │   ├── layout-tools.ts     # place_on_canvas, draw_edge, remove_edge, create_cluster
│   │   │   └── listening-tools.ts  # propose_action, cancel_action, mark_utterance_complete
│   │   ├── transcript/
│   │   │   └── keyboard-source.ts  # voice-source.ts is on the roadmap
│   │   └── db/
│   │       ├── migrations.ts       # inline SQL
│   │       └── repo.ts             # typed CRUD
│   └── preload/
│       └── index.ts                # contextBridge → window.api
├── shared/
│   ├── types.ts                    # Artifact, Edge, Action, Board, ... domain types
│   ├── ipc-channels.ts             # channel names + payload types
│   ├── events.ts                   # WorldEvent union
│   └── seed-marketing.ts           # demo board content (19 cards + 23 edges + 1 PlantUML diagram)
├── renderer/
│   ├── index.html                  # CSP, Vite entry
│   └── src/
│       ├── main.tsx · App.tsx
│       ├── store/world-store.ts    # zustand
│       ├── ipc/
│       │   ├── bridge.ts           # subscribes to window.api events
│       │   └── mock-api.ts         # browser-only fallback (snapshot from seed-marketing)
│       ├── scene/
│       │   ├── Canvas.tsx          # R3F canvas, CameraFitter, BookmarkCapture
│       │   ├── Artifact.tsx        # plate + html label + drag/select handler
│       │   ├── Edge.tsx            # custom Line + spring-physics control points
│       │   ├── card-texture.ts     # canvas-2d texture for plate front face
│       │   └── live-transforms.ts  # mutable Map<id, Vector3> for edges
│       ├── ui/
│       │   ├── DraggablePanel.tsx
│       │   ├── Inspector.tsx · ActivityPanel.tsx · NotificationCenter.tsx
│       │   ├── LayoutMenu.tsx · ModelPicker.tsx · BoardSwitcher.tsx
│       │   ├── SearchModal.tsx · Minimap.tsx · FilterChips.tsx · BookmarksBar.tsx
│       │   ├── DropPaste.tsx · Voice.tsx · Onboarding.tsx · Hotkeys.tsx
│       │   ├── DiagramRenderer.tsx
│       │   └── ...
│       └── util/
│           └── diagrams.ts         # plantuml/mermaid block extraction
└── docs/
    ├── demo.mp4 · demo.gif
    ├── ARCHITECTURE.md (this file)
    ├── AGENTS.md · MODEL.md · ROADMAP.md · CONTRIBUTING.md · SHORTCUTS.md
```

---

## Risks and unknowns

- **Cost of long-lived agents.** Two Haiku loops produce nontrivial spend even idle. Mitigated by prompt-caching, by feeding Layout only `spec` (not body), and by gating Listening with a "did anything change?" check before forwarding chunks.
- **Cancellation semantics.** Mid-tool-call abort may still produce a tool result. Wrap MCP-tool side-effects in tentative-then-commit so aborted Workers don't leave half-written artifacts.
- **SDK churn.** Pinned to `0.2.136`. Bumps need a smoke pass.
- **Streaming-input liveness.** Long-idle async generators may stall the SDK. Layout/Listening have a periodic heartbeat / `forkSession` path on roadmap.
- **Three.js label rendering.** HTML overlays via drei `<Html>` are cheap up to ~50 cards; canvas-2d textures for plate faces are cheap up to ~200 (1024×640 each ≈ 2.5MB GPU). Beyond that, switch to atlased text.
- **MCP tool concurrency.** Multiple Workers may call `create_artifact` simultaneously. WorldState mutations are serialized behind a single async mutex.
- **Secrets.** `ANTHROPIC_API_KEY` should go through Electron `safeStorage` for production; right now it relies on `claude login` session or the env var.
- **API rate limits.** Each long-lived agent should auto-restart on 429/5xx with backoff and a circuit breaker visible in the UI. Currently logs and toasts but doesn't restart.
