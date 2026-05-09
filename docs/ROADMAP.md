# Roadmap

What's done, what's open. Items marked **★** are high-leverage if you're looking for a meaty PR.

## Done

- [x] Electron + TypeScript + Three.js scaffold; main / preload / renderer split with contextIsolation.
- [x] SQLite (WAL) data layer; migrations v1 → v3; in-memory `WorldState` mirror.
- [x] Event bus + 16 ms IPC delta-coalescing; Zustand store on the renderer.
- [x] R3F scene: artifact plates with canvas-2d textures (kind-styled), Bézier edges with spring-physics control points, billboarded labels, pinned/selected/state rims, cluster regions.
- [x] Drag-to-move with shift modifier (auto-pin); click-without-movement = select; double-click = open Inspector.
- [x] OrbitControls + auto-frame on first artifact arrival + manual `F`; top-down 2D ortho mode (`T`).
- [x] Live-position registry so edges follow during drag, with mass/damping spring physics on control points.
- [x] Inspector: markdown rendering (`react-markdown` + `remark-gfm`); in-place edit; `Refine via Worker` action; text-selection → `Make highlight` (creates child artifact + auto `derives` edge).
- [x] PlantUML rendering via `plantuml-encoder` + `plantuml.com` SVG; Mermaid via dynamic CDN ESM import. Card face shows `📊 diagram inside` placeholder.
- [x] Worker agent with full canvas-tools + layout-tools toolkit; `request_layout_pass` delegates to Layout.
- [x] Layout agent: long-lived streaming-input; `place_on_canvas` / `draw_edge` / `remove_edge` / `create_cluster`; `reorganize` modes (by-type / by-tags / by-topic / by-time / free-form).
- [x] Listening agent (wired, not active by default for keyboard input): `propose_action` / `cancel_action` / `mark_utterance_complete`.
- [x] Layout-history stack + `↶ restore previous` (max 10 saved); deletes existing clusters before each pass.
- [x] Cmd+Z / Cmd+Shift+Z undo/redo for user-initiated mutations.
- [x] Multi-board switcher with per-board fs mirror (chokidar + simple-git auto-commit every 5 min).
- [x] Filesystem sync: each artifact mirrored to `<userData>/boards/<id>/artifacts/<shortName>.<ext>`; bidirectional via watcher + sha256 diff.
- [x] Drag-drop / paste of files and images → attachment artifact.
- [x] Bookmarks (1..9 per board) — `Shift+1..9` save, `1..9` jump.
- [x] Filter chips (kind / tag / pinned-only) — non-matching cards dim to 18% opacity.
- [x] Cmd+F fuzzy search (`fuse.js` over title/shortName/body/spec/tags).
- [x] Minimap, NotificationCenter, ActivityPanel, AgentActivityHud — all draggable, resizable, persisted via localStorage.
- [x] ModelPicker per agent role (Worker / Layout / Listening / Naming) with live `setModel()` for streaming agents.
- [x] Onboarding tour (3-step), Help Hint panel with full shortcut list.
- [x] Voice (best-effort): Web Speech via `webkitSpeechRecognition`, PTT (hold Space), continuous toggle, focus-to-card mode (`V`).
- [x] Marketing-strategy demo seed: 19 cards, 23 edges, 1 PlantUML funnel diagram.
- [x] CI: GitHub Action runs `npm run typecheck` + `npm run build` on every PR and push to `main`.
- [x] `electron-builder` packaging for macOS (.dmg + .zip, arm64 + x64), Linux (.AppImage + .deb, arm64 + x64), Windows (.exe NSIS, x64) — `better-sqlite3` rebuilt against Electron's Node ABI and `asarUnpack`-ed so the native `.node` loads at runtime.
- [x] Release pipeline (`.github/workflows/release.yml`): tag-driven matrix build on macOS / Linux / Windows runners; uploads artifacts to a draft GitHub Release.
- [x] App-update mechanism via `electron-updater`: packaged builds check the GitHub Releases feed at launch, download in the background, prompt-to-restart on quit. `JARVIS_DISABLE_UPDATER=1` opts out.

## Open — high-leverage ★

- [ ] **★ Local Whisper.** Offline STT via `@xenova/transformers` (Whisper-tiny ONNX in WASM, ~40 MB). Bundled model with first-run download. Replaces the offline-broken Web Speech path. Chunked encode in a `worker_thread` so the main UI stays responsive.
- [ ] **★ Test harness.** Vitest for `WorldState`, `UndoLog`, `splitBody` (diagram extraction), `live-transforms`. Playwright E2E for "type a prompt → ≥2 cards appear with edges → Cmd+F finds them → Cmd+L by-type creates clusters → restore previous".
- [ ] **★ Long-lived agent auto-restart.** On 429/5xx or transport error, exponential backoff + restart, with circuit-breaker chip visible in HUD.
- [ ] **★ Plugin/hook system.** Third-party MCP tools loaded at startup via `~/.jarvis/plugins/*.js`; agents declare which plugins they have access to. Lets community ship "Jira browser tool" / "Calendar tool" / etc without forking.
- [ ] **★ Force-directed 3D layout.** Heuristic positioning in a `worker_thread` based on edges (springs) + repulsion + cluster attraction. Layout agent then *hints* positions instead of computing them from scratch — much faster, much cheaper.

## Open — agents & intelligence

- [ ] Naming agent as its own short `query()` — currently inline in Worker. Cleaner cost accounting and easier to swap models for it.
- [ ] Auto-tagging daemon: rolls over new artifacts, assigns `spec.tags` based on body content. Drives FilterChips automatically.
- [ ] RAG Q&A: "what do I know about X?" — embeddings of all artifacts in a local vector store; agent answers with @-citations.
- [ ] Daily digest agent: once per N hours, produces a summary card "what changed today / what's still open".
- [ ] Per-task budgets: `request_layout_pass(... maxBudgetUsd: 0.20)` — abort agent at threshold (the SDK already supports this option).
- [ ] Sub-agent spawning surfaced in UI: when a Worker delegates via the SDK's `Task` tool, show a sub-chip in the Activity panel.

## Open — backends & integrations

- [ ] **★ Neo4j backend.** Pluggable storage layer behind `WorldState` so artifacts and edges live as a real graph. Cypher queries unlock `MATCH (a)-[:DERIVES*]->(b)` style retrieval, transitive cluster discovery, shortest-path explanations, and "show me everything 2 hops from @Mission". Two paths: (a) full swap of SQLite, or (b) Neo4j as a read-side replica synced from SQLite for graph queries while keeping SQLite as source of truth for ACID semantics.
- [ ] **★ Obsidian vault as a backend.** Point Jarvis at an existing `~/Obsidian/<vault>/` folder. Each `.md` becomes an artifact (frontmatter → tags + spec, body → body); `[[wiki-link]]` syntax becomes `references` edges; `#tag` becomes tags. Two-way sync via the existing `chokidar` watcher in `fs-sync.ts` — your Obsidian and Jarvis stay aligned, you can keep using Obsidian Mobile / Sync, but get the spatial canvas + agents on top. Also makes onboarding zero-friction for the obvious target user.
- [ ] Markdown vault as a board template — when creating a board, pick "from folder" and import an arbitrary directory as a one-shot.
- [ ] Generic "graph plugin" interface: GraphQL / sqlite / neo4j / fs / GitHub Issues — same shape, different storage.
- [ ] Bi-directional Linear / GitHub Issues sync as a board (each issue = artifact, status = tag, links = edges).

## Open — speed (agents & layout)

- [ ] **★ Local heuristic layout in a `worker_thread`.** Today every Layout pass is an LLM call. For most updates a force-directed simulation (springs along edges, repulsion between cards, attraction toward cluster centroids) does the job in 30 ms with no API cost. Use the LLM only for *new* reorganize requests where semantic understanding matters (`by-topic`, `free-form`).
- [ ] **★ Streaming Worker output.** Today the Worker produces an artifact only after `create_artifact` returns. With SDK streaming events, render the card with `state: 'streaming'` immediately, fill body progressively as text comes in. Perceived latency drops from seconds to ~200 ms.
- [ ] **★ Embeddings cache for similarity layout.** Compute a small embedding (e.g. 256-dim BGE-small via `@xenova/transformers`) for each artifact's `spec.summary` once, cache in SQLite. Use cosine similarity for `by-topic` clustering — instant, no LLM call for layout grouping. LLM only chooses *cluster names*.
- [ ] **★ Smaller/faster model for incremental layout.** Layout currently uses Haiku for everything. Use a tiny local model (Ollama llama3.2:3b or Qwen2.5:3b) for "place this one new card relative to existing ones" via heuristic + structured output; reserve Anthropic Haiku for `reorganize` passes where reasoning matters.
- [ ] Parallel sub-agent execution. When the Worker creates 3 artifacts that each need a `set_artifact_spec` call, run them concurrently.
- [ ] Speculative artifact creation. While the model is still thinking, render a placeholder card with `state: 'streaming'` and a guessed shortName from the user's prompt. Replace once the real one arrives.
- [ ] Spec-only context for Layout. Layout already only sees `spec` (≤200 tokens) — but the agent's full conversation history grows over time. Trim history aggressively: only keep the last N deltas, summarize older. Or use `forkSession` per reorganize to start fresh.
- [ ] Pre-warm models. Call `query()` once at app startup with a no-op so the SDK process is ready when the user types their first prompt.
- [ ] Adaptive throttle. Layout currently re-evaluates on every artifact upsert. Coalesce: if 3 cards arrive in 100 ms, send one combined delta instead of three.
- [ ] GPU-accelerated layout. Three.js scene already has GPU; force-directed math could run on the GPU via compute shaders / WebGPU for massive boards.

## Open — content & UX

- [ ] **Time-travel scrubber** — replay the canvas history between two timestamps. The data is there (every mutation goes through the bus); UI is missing.
- [ ] Context-menu on cards (right-click): pin/unpin, color-tag, copy id, copy as markdown, delete, etc.
- [ ] Multi-line input bar (Shift+Enter for newline; Cmd+Enter to submit).
- [ ] Card resize via corner handle — `Artifact` plate currently fixed-size.
- [ ] Theme system (light/dark/ambient).
- [ ] Drag a card onto a board chip in the switcher to move it between boards (IPC already exists).
- [ ] Disambiguation prompt for `@-` references when shortNames collide across boards.

## Open — performance & scale

- [ ] Bundled font for drei `<Text>` so we can stop using HTML overlays for short-name labels (HTML doesn't scale past ~200 cards). troika-three-text + a packaged `.woff` of Inter would do it.
- [ ] Atlased card textures or instanced meshes when the board has 500+ artifacts.
- [ ] Frustum-culling and LOD for distant artifacts (just labels at distance, full plates up close).
- [ ] Streaming snapshot: don't send 500 artifacts in one IPC `getSnapshot` — page them.

## Open — boring but important

- [ ] **Codesigning + notarization for macOS releases.** Pipeline is ready (`CSC_LINK` / `APPLE_ID` env vars are wired in `release.yml`); needs an Apple Developer cert + secrets added to the repo. Until then `.dmg` users get the right-click → Open Gatekeeper bypass on first launch.
- [ ] `safeStorage` for `ANTHROPIC_API_KEY` so it isn't exposed via env vars.
- [ ] Settings panel (currently only ModelPicker exposes settings; need a place for fs-sync toggle, theme, agent-pause, etc.).
- [ ] Crash recovery view on relaunch ("you had 3 unfinished actions; resume? cancel?").
- [ ] Linux package signing (deb / AppImage zsync for delta updates).
- [ ] Windows codesigning cert + EV cert for SmartScreen reputation.

---

## Open product questions

These are unresolved in the [original master plan](https://github.com/anthropics/.../) and worth thinking about as concrete features land:

1. **Idle policy.** When the user is silent for N minutes, does Listening sleep? Does Layout re-pass on a timer? Currently both stay alive and idle.
2. **Voice transition UX.** Right now the PTT button lives at fixed position; should be more discoverable when voice becomes the primary mode.
3. **Conflict resolution.** Two Workers updating one artifact simultaneously — currently last-write-wins. Lock? Merge?
4. **Sub-agent surfacing.** Worker spawning a sub-Worker — separate chip vs roll up to parent.
5. **Disambiguation when `@-` reference is ambiguous** — auto-pick most-recent vs ask.
6. **Export format.** What does "export this canvas" produce? Proposal: zip of artifact files + `canvas.json` with positions and edges.
7. **Delete semantics.** Hard delete vs soft archive (deepest Z layer).
8. **Reserved-word safety.** Blacklist verbs like `stop`, `cancel`, `delete` from the auto-name pool so a card's `@stop` doesn't conflict with a command.
