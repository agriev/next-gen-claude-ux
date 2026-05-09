# Contributing

Thanks for looking. This is a personal-tool prototype that grew teeth — it's intentionally ambitious and intentionally rough. PRs are welcome at any altitude: a single `// TODO` triaged, a typo fixed, a whole feature shipped.

## Setup

```bash
git clone https://github.com/agriev/next-gen-claude-ux.git
cd next-gen-claude-ux
npm install
npm run rebuild      # native rebuild for better-sqlite3 against Electron's Node ABI
JARVIS_SEED_MOCKS=1 npm run dev
```

Requires Node 22+ (we use ESM and `import.meta.url`). macOS Apple Silicon is the primary tested platform; Linux/Windows should work but have not been verified.

For browser-only renderer work (no agents needed), `localhost:5173` is served by Vite directly and a mock IPC kicks in with the seed marketing board. Faster iteration loop for visuals.

## Auth

Two paths:

1. **Recommended:** run `claude login` once. The Agent SDK uses your Claude Pro / Max session automatically.
2. Set `ANTHROPIC_API_KEY` in your env. Fallback for headless / CI.

Without either, the app boots fine but agents log a warning and Worker submissions get a "no auth" toast.

## Code style

- TypeScript everywhere. Strict mode. `noUnusedLocals` / `noUnusedParameters` are on.
- ESM-first. `"type": "module"` in `package.json`. Use `.js` import paths only when crossing the build boundary; otherwise omit extensions (electron-vite handles it).
- React function components. Hooks for state. No class components.
- Zustand for renderer state, mitt for main-process bus. Don't introduce Redux.
- Three.js / R3F for the 3D scene. Avoid leaking `THREE.*` imports outside `scene/`.
- Prefer existing patterns. The codebase has a fairly opinionated structure; before adding a new dep or pattern, check if there's already a thing for it.
- Keep the SDK pinned (`@anthropic-ai/claude-agent-sdk@0.2.136`). If you need to bump it, run a smoke pass: type a prompt, click `Cmd+L → by type`, drag a card, watch nothing breaks.

## Commit / PR

- One topic per commit. Imperative mood: `Add P hotkey for pinning selected cards`.
- No co-authors unless someone actually co-authored the code with you.
- PRs against `main`. Title concise, description explains the **why** more than the what.
- Include a screenshot or a short clip if your change is visible. Drag-drop into the GitHub PR description works for both.
- If you add a new dependency, justify it in the PR description.

## Type-checking

```bash
npm run typecheck     # both node + web tsconfig projects
```

There is currently no test suite. Adding one (Vitest for renderer logic, Playwright for E2E flows) is on the [Roadmap](ROADMAP.md) and a great PR.

## Building installers

```bash
npm run dist:mac      # .dmg + .zip, arm64 + x64
npm run dist:linux    # .AppImage + .deb, arm64 + x64
npm run dist:win      # NSIS .exe, x64
npm run dist          # current platform, all targets
npm run pack:dir      # unpacked app dir — fastest sanity check
```

The config lives in `electron-builder.yml`. `better-sqlite3` is rebuilt against Electron's Node ABI on every pack via `npmRebuild: true`, and its `.node` binary is `asarUnpack`-ed so it loads at runtime.

To regenerate the app icon from the SVG source: `./scripts/build-icon.sh`.

## Cutting a release

1. Bump the version in `package.json` (semver: patch for fixes, minor for features).
2. Commit: `git commit -am "Release v0.x.y"`.
3. Tag and push: `git tag v0.x.y && git push origin main --tags`.
4. The `release.yml` workflow fires on the tag push, builds macOS / Linux / Windows installers in parallel on hosted runners, and uploads them to a **draft** GitHub Release.
5. Open the draft, write a changelog, click Publish. Auto-updater clients pick it up on next launch.

For dry runs without cutting a real version, trigger the workflow manually from the Actions tab (`workflow_dispatch`).

To enable codesigning + notarization for macOS, populate these as repo secrets and uncomment the CSC env block in `release.yml`:

| Secret | What |
| --- | --- |
| `CSC_LINK` | base64-encoded `.p12` containing the Developer ID Application cert |
| `CSC_KEY_PASSWORD` | password for the `.p12` |
| `APPLE_ID` | Apple ID email |
| `APPLE_APP_SPECIFIC_PASSWORD` | app-specific password from appleid.apple.com |
| `APPLE_TEAM_ID` | 10-char team identifier from developer.apple.com |

## What needs work

The [Roadmap](ROADMAP.md) is the canonical list. High-leverage items in particular:

- Local Whisper for offline voice (`@xenova/transformers` ONNX in WASM).
- Naming agent as its own thing (not inline in Worker).
- Long-lived agent auto-restart on 429/5xx with circuit breaker visible in UI.
- Test harness — Vitest for `WorldState` and `UndoLog`, Playwright for "ask → 2 cards land + linked + visible after focus-to-fit".
- Cost telemetry for Layout / Listening (currently only Workers report cost).
- Embedded font for `<Text>` so we can drop the HTML overlay (better perf at 100+ cards).
- Force-directed 3D layout in a `worker_thread` so Layout can hint positions without an LLM call.
- Plugin/hook system so a third party can ship custom MCP tools without forking.

## Project conventions

- All new entities (artifact kinds, edge kinds, action kinds) get added to the union types in `shared/types.ts` first, then to the migrations and storage layer, then to the renderer.
- New IPC channels go in `shared/ipc-channels.ts` with a payload type. Always emit the renderer-facing event from the bus, never directly from the IPC handler.
- New UI panels: prefer `<DraggablePanel>` so the user can move/collapse/resize. Persist position with a unique `id`.
- New hotkeys: add to `Hotkeys.tsx` and to `HelpHint.tsx` (the `? shortcuts` panel).
- New tools for an agent: add the schema, callback, and add to the `*_TOOL_NAMES` array; the agent's system prompt should explicitly mention when to use it.

## Etiquette

This is a personal project that I'm happy to share. I'm not committed to any roadmap timeline or to merging every PR. If you want a feature for yourself, fork freely. If you build something different from the same starting point, link it back so others can find it.

If you find a bug, file an issue with steps to reproduce and your platform / Electron version.
