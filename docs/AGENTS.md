# Agents

Four roles, all running as separate `query()` calls of `@anthropic-ai/claude-agent-sdk`. Each is a self-contained module under `electron/main/agents/`.

## Worker

**Lifetime:** one `query()` per command. Up to 4 in flight concurrently; rest queue.

**Trigger:** user submits text via the input bar, or the Listening agent calls `propose_action`. The Worker receives `{ text, references, kind? }`.

**Toolset (full):**

```
canvas-tools (in-process MCP):
  create_artifact(kind, title, body, shortName?)
  update_artifact(id|shortName, title?, body?)
  name_artifact(id, shortName)
  set_artifact_spec(id, summary, tags, refs)
  attach_log(message)
  request_layout_pass(mode, prompt?)   ← delegates to Layout agent

layout-tools (also exposed to Worker):
  place_on_canvas(id, x, y, z)
  draw_edge(src, dst, kind, weight?)
  remove_edge(id)
  list_edges(artifactId?, kind?)            ← discover existing edges before re-wiring
  update_edge(id, kind?, weight?, label?)   ← change an edge's type or short label
  create_cluster(label, artifactIds, description?, tagHint?)
```

**System prompt (excerpt):**

> You are the Worker agent inside a spatial knowledge tool. The user works on a 3D canvas where each meaningful output is a CARD ("artifact"). Your assistant text is hidden from the user — they only see what you put on the canvas.
>
> CONTENT TOOLS — `create_artifact` (kinds: doc/note/code/log/image/link). Pick a short distinctive shortName. Call `set_artifact_spec` after to give Layout something to relate it to.
>
> SPATIAL TOOLS — `place_on_canvas` for explicit positioning ("next to @Atlas"), `draw_edge` / `list_edges` / `update_edge` / `remove_edge` for connections, `create_cluster` for grouping ≥2 cards. Coordinate range x[-14,14] y[-2,4] z[-8,8]. Plates are ~3.2 wide. Always call `list_edges` before re-wiring an artifact's connections — gets you the existing ids and avoids duplicates.
>
> DELEGATION — `request_layout_pass` for big-picture reorganizes ("lay out by topic"). Don't combine with manual placement.
>
> DIAGRAMS — Cards render PlantUML and Mermaid when the body contains them. Use `@startuml ... @enduml` or fenced ```` ```mermaid ```` blocks. Reach for them when the user asks for flows / sequences / architectures / state machines.

Worker emits `agentLog` events with `kind: 'tool' | 'thought'` for each block of the response, so the Activity panel can show a live trace.

## Layout

**Lifetime:** long-lived `query()` in streaming-input mode (`prompt: AsyncIterable<SDKUserMessage>`).

**Input:** orchestrator pushes deltas to a queue:

```jsonc
{"op":"hello","artifacts":[...]}              // on agent start
{"op":"upsert","artifact":{...}}              // new or changed
{"op":"remove","id":"..."}                    // deleted
{"op":"reorganize","mode":"by-topic","prompt":"...?","artifacts":[...]}
```

The agent processes the delta, calls tools, and waits for the next message. The async iterator never closes (until the agent is stopped).

**Toolset:** layout-tools only.

**System prompt** instructs the agent to:

- Skip `pinned: true` artifacts.
- For `upsert/hello`: be incremental — only place new or visibly conflicting cards.
- For `reorganize`: place ALL non-pinned cards. Group similar ones into `create_cluster`. Modes: `by-type` / `by-tags` / `by-topic` / `by-time` / `free-form`. Place groups ~6 units apart on X; within a group, ~3-wide rows with 4u horizontal and 2.5u vertical spacing.
- Don't draw redundant edges. Don't create duplicate clusters.
- Stay silent in text — only tool calls have effect.

**Live model switch.** Layout keeps a reference to its `Query` object; on `setModel(role='layout', model)`, the orchestrator calls `query.setModel(modelId)` without restarting the loop.

## Listening

**Lifetime:** long-lived `query()` in streaming-input mode.

**Input:** transcript chunks, one per JSON message:

```json
{"id":"...","ts":1234,"text":"...","isFinal":true,"source":"kbd"|"voice"}
```

**Toolset:**

- `propose_action(kind, text, references[], supersedes?)` — orchestrator spawns a Worker.
- `cancel_action(id)` — orchestrator aborts.
- `mark_utterance_complete(text)` — fires UI ghost-preview without spawning anything.

**System prompt** asks the agent to:

- Decide when a logical utterance is complete (combine fragments if the same thought spans multiple chunks).
- Call `propose_action` with full text and resolved `@references`.
- If the user reverses course mid-stream, pass `supersedes` with the previous actionId.
- Stay conservative — better to wait for one more chunk than fire prematurely.
- Stay silent in text.

In MVP keyboard mode, the input bar bypasses Listening and submits directly to the Worker. Listening is wired but inactive by default; toggling it (currently a hardcoded flag in `Orchestrator`) would route every keystroke through it. The intended use is voice input.

## Naming (placeholder)

Currently the Worker handles short-name generation inline (it picks one, then `WorldState.uniqueShortName` deduplicates). A separate Naming sub-agent — short `query()` per artifact, fed an excerpt of the body — is on the roadmap. The hook for it lives in `WorldState.uniqueShortName` and the model setting `model.naming` is already wired.

---

## Adding a new agent

1. Create `electron/main/agents/<name>.ts`. Either:
   - **Long-lived** — instantiate an `AsyncQueue<SDKUserMessage>`, build an MCP server, call `query({ prompt: queue, options: { ... } })`, iterate the result, emit `agentLog` events. Keep a ref to the `Query` for `setModel` and abort.
   - **Short-lived** — single `query({ prompt: string, options: {...} })` per task; collect tool results from MCP callbacks; resolve with summary.

2. Define a custom MCP server in `electron/main/mcp/<name>-tools.ts` if your agent needs new tools. Register tool names in `<NAME>_TOOL_NAMES` for `allowedTools`.

3. Wire into `Orchestrator`. For long-lived agents, expose `start()` / `stop()` / `setModel(model)`. Subscribe to relevant `bus.on('world', ...)` events to push deltas into your queue.

4. Add an entry to the `model.<role>` keys in `app_state` and to `ModelSettings` in `shared/types.ts`. Read your model from `world.getModel('<role>')`.

5. Add the role to the `ROLE_LABEL` / `ROLE_HINT` maps in `renderer/src/ui/ModelPicker.tsx` if you want a UI dropdown for it.

---

## Adding a new MCP tool

Each tool lives next to others in its server file. Example skeleton for `canvas-tools.ts`:

```ts
const myTool = tool(
  'tool_name',
  'Plain-English description that the model reads. Be specific about when to use this and what it does.',
  {
    paramA: z.string().describe('What this is for'),
    paramB: z.number().optional()
  },
  async (args, _extra) => {
    // mutate world state, emit bus events
    bus.emit('world', { type: 'artifact.upserted', artifact: ... });
    return {
      content: [{ type: 'text' as const, text: `did the thing` }]
    };
  }
);

// Then add `myTool` to the `tools: [...]` array in `createSdkMcpServer`
// and add `'mcp__canvas-tools__tool_name'` to the matching `*_TOOL_NAMES` const.
```

The handler runs in-process. You have full access to `WorldState` and the bus. Side-effects should be idempotent and safe under concurrent calls (multiple Workers can call simultaneously — `WorldState` already serializes mutations behind an async mutex).

---

## Cost telemetry

Every Worker reports `total_cost_usd` and token counts on its `result` message. Stored in the Action row, summed in the Activity panel header. Long-lived agents (Layout / Listening) currently don't surface cost in the UI — partial because their cost is folded into a single result per turn and we don't aggregate across turns yet. PR welcome.

---

## Cancellation

`Cmd+.` calls `orchestrator.cancelAll()` which iterates Worker handles and calls `controller.abort()`. Layout and Listening keep running. Per-action cancel: click the chip in the Activity panel. Aborting mid-tool-call may still produce one tool result before the agent unwinds; tools are wrapped tentative-then-commit to avoid half-written artifacts.

Long-lived agents are stopped on `app.before-quit` via `orchestrator.stop()`, which calls `controller.abort()` and closes the input queue.
