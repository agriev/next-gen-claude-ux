import { query, type SDKUserMessage } from '@anthropic-ai/claude-agent-sdk';
import { nanoid } from 'nanoid';
import fs from 'node:fs';
import type { WorldState } from '../world-state';
import { buildCanvasTools, CANVAS_TOOL_NAMES } from '../mcp/canvas-tools';
import { buildLayoutTools, LAYOUT_TOOL_NAMES } from '../mcp/layout-tools';
import { buildOntologyTools, ONTOLOGY_TOOL_NAMES } from '../mcp/ontology-tools';
import { buildVizTools, VIZ_TOOL_NAMES } from '../mcp/viz-tools';
import { bus } from '../event-bus';
import type { Action, ActionKind } from '../../../shared/types';

type AnthropicContentBlockParam =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'base64'; media_type: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'; data: string } }
  | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string }; title?: string };

const ALLOWED_IMAGE_MIME = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
const MAX_INLINE_ATTACHMENT_BYTES = 5 * 1024 * 1024; // Anthropic limit per part

const WORKER_SYSTEM_PROMPT = `You are the Worker agent inside a spatial knowledge tool. The user works on a 3D canvas where each meaningful output is a CARD ("artifact"). Your assistant text is hidden from the user — they only see what you put on the canvas.

CONTENT TOOLS (canvas-tools):
- \`create_artifact(kind, title, body, shortName?)\` — kinds: doc/note/code/log/image/link. Pick a short distinctive shortName (one capitalized word).
- \`update_artifact(id|shortName, title?, body?)\`
- \`name_artifact(id, shortName)\`
- \`set_artifact_spec(id, summary, tags, refs)\` — call after create so the Layout agent can relate it.
- \`attach_log(message)\` — progress note, NOT an artifact.

SPATIAL TOOLS (layout-tools — direct, surgical):
- \`place_on_canvas(id, x, y, z)\` — explicitly position an artifact. Range x[-14,14] y[-2,4] z[-8,8]. Plates are ~3.2 wide.
- \`draw_edge(src, dst, kind, weight?)\` — kinds: derives / references / contradicts / groups-with.
- \`list_edges(artifactId?, kind?)\` — list all edges or only those touching a given artifact (id or shortName). Returns edge ids you can pass to remove_edge / update_edge. Always call this before re-wiring an artifact's connections so you don't duplicate edges or remove the wrong one.
- \`update_edge(id, kind?, weight?, label?)\` — change an edge's kind, weight, or short human label (e.g. "supports", "blocks"). Pass label=null to clear.
- \`remove_edge(id)\`
- \`create_cluster(label, artifactIds, description?, tagHint?)\` — translucent labeled region around ≥2 artifacts.

DELEGATION:
- \`request_layout_pass(mode, prompt?)\` — modes: by-type / by-tags / by-topic / by-time / free-form. Hands the canvas to the Layout agent for a full reorganize. Use when user asks "lay out by X" or "group everything".

USAGE GUIDE:
- "Write a doc about X and place it next to @Atlas" — create_artifact, then place_on_canvas using @Atlas's coords + a small offset.
- "Group these three" — create_cluster.
- "Connect @A to @B as derives" — draw_edge.
- "Reorganize by topic" / "lay out chronologically" — request_layout_pass.
- For every artifact you create: also set_artifact_spec with a 1-sentence summary + tags.

DIAGRAMS:
- Cards render PlantUML and Mermaid when the body contains them. Use \`@startuml ... @enduml\` for PlantUML or fenced \`\`\`mermaid\`\`\` blocks for Mermaid. The Inspector renders them visually; the card surface shows a placeholder.
- Reach for diagrams when the user asks for a flow / sequence / architecture / mindmap / state machine / UML — they're far more useful than prose for these.
- Example body:
    # Funnel
    @startuml
    start
    :Sign up;
    :Activate (first deploy);
    if (paid?) then (yes) :Retain; else (no) :Churn;
    @enduml

RULES:
- Be concise. Don't create more than 4 artifacts unless explicitly asked.
- @-references in the prompt are full artifact data; use their id or shortName as needed.
- After placing artifacts manually, you don't need to call request_layout_pass too — only one or the other.

Return one short line of acknowledgment. The real value is in the canvas.`;

export interface WorkerInput {
  text: string;
  references: string[];
  actionKind?: ActionKind;
  /** Artifact ids of attachment artifacts to feed as image/document content blocks. */
  attachmentArtifactIds?: string[];
}

export interface WorkerHandle {
  actionId: string;
  promise: Promise<void>;
  abort: () => void;
}

interface SpawnOpts {
  world: WorldState;
  input: WorkerInput;
  model?: string;
  getDefaultPosition: () => { x: number; y: number; z: number };
  requestLayoutPass: (mode: string, prompt?: string) => void | Promise<void>;
}

export function spawnWorker(opts: SpawnOpts): WorkerHandle {
  const { world, input, model = 'claude-sonnet-4-6', getDefaultPosition } = opts;
  const actionId = nanoid(10);
  const agentId = `worker:${actionId}`;
  const startedAt = Date.now();

  const promptParts: string[] = [];
  if (input.references.length > 0) {
    const refs = input.references
      .map(rn => {
        const a = world.resolveShortName(rn);
        return a ? `- @${rn} (id ${a.id}, ${a.kind}, "${a.title}")` : `- @${rn} (not found)`;
      })
      .join('\n');
    promptParts.push(`Referenced artifacts:\n${refs}\n`);
  }
  promptParts.push(input.text);
  const fullPrompt = promptParts.join('\n');

  // Build vision/document content blocks from attachment artifacts. If any are
  // present, we hand the SDK an AsyncIterable<SDKUserMessage> that yields one
  // structured message — text + image/document blocks — instead of a plain
  // string prompt. Text-like attachments are already inlined into their
  // artifact body, so they round-trip via @-references and don't need a block.
  const attachmentBlocks: AnthropicContentBlockParam[] = [];
  for (const aid of input.attachmentArtifactIds ?? []) {
    const a = world.getArtifact(aid);
    if (!a || !a.bodyPath) continue;
    let bytes: Buffer;
    try {
      bytes = fs.readFileSync(a.bodyPath);
    } catch (err) {
      console.warn('[worker] could not read attachment', aid, err);
      continue;
    }
    if (bytes.length > MAX_INLINE_ATTACHMENT_BYTES) {
      bus.emit('agentLog', {
        agentRole: 'worker', agentId, actionId, kind: 'note',
        text: `attachment ${a.shortName} > 5 MB, skipping vision (still referenced as @${a.shortName})`,
        ts: Date.now()
      });
      continue;
    }
    const data = bytes.toString('base64');
    if (a.mime === 'application/pdf') {
      attachmentBlocks.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data },
        title: a.title
      });
    } else if (ALLOWED_IMAGE_MIME.has(a.mime)) {
      attachmentBlocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: a.mime as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
          data
        }
      });
    }
    // Other MIMEs (text/*, etc.) already have content inlined into a.body — the
    // agent picks them up via @-reference resolution above.
  }

  const action: Action = {
    id: actionId,
    kind: input.actionKind ?? 'write',
    status: 'queued',
    agent: 'worker',
    label: input.text.slice(0, 80),
    prompt: fullPrompt,
    startedAt,
    producedArtifactIds: []
  };
  void world.upsertAction(action);
  bus.emit('world', { type: 'action.status', action });

  const ctrl = new AbortController();
  const { server, producedIds } = buildCanvasTools({
    world, actionId, agentId, getDefaultPosition,
    requestLayoutPass: opts.requestLayoutPass
  });
  const layoutToolsServer = buildLayoutTools(world);
  const ontologyToolsServer = buildOntologyTools(world);
  const vizToolsServer = buildVizTools(world);

  const promise = (async () => {
    const running: Action = { ...action, status: 'running' };
    await world.upsertAction(running);
    bus.emit('world', { type: 'action.status', action: running });

    let totalCost = 0;
    let totalTokens = 0;
    let errorMsg: string | undefined;

    let promptArg: string | AsyncIterable<SDKUserMessage>;
    if (attachmentBlocks.length > 0) {
      const sessionId = `worker-${actionId}`;
      const blocks: AnthropicContentBlockParam[] = [
        { type: 'text', text: fullPrompt },
        ...attachmentBlocks
      ];
      const message: SDKUserMessage = {
        type: 'user',
        message: { role: 'user', content: blocks } as SDKUserMessage['message'],
        parent_tool_use_id: null,
        session_id: sessionId
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      promptArg = (async function* (): AsyncIterable<SDKUserMessage> { yield message; })();
    } else {
      promptArg = fullPrompt;
    }

    try {
      const q = query({
        prompt: promptArg,
        options: {
          model,
          systemPrompt: WORKER_SYSTEM_PROMPT,
          mcpServers: {
            'canvas-tools': server,
            'layout-tools': layoutToolsServer,
            'ontology-tools': ontologyToolsServer,
            'viz-tools': vizToolsServer
          },
          allowedTools: [
            ...CANVAS_TOOL_NAMES,
            ...LAYOUT_TOOL_NAMES,
            ...ONTOLOGY_TOOL_NAMES,
            ...VIZ_TOOL_NAMES
          ],
          tools: [],
          abortController: ctrl,
          maxTurns: 20
        }
      });

      for await (const msg of q) {
        if (msg.type === 'assistant') {
          const blocks = msg.message.content;
          for (const b of blocks) {
            if (b.type === 'text' && b.text.trim()) {
              bus.emit('agentLog', {
                agentRole: 'worker',
                agentId,
                actionId,
                kind: 'thought',
                text: b.text.trim().slice(0, 600),
                ts: Date.now()
              });
            } else if (b.type === 'tool_use') {
              const argsStr = JSON.stringify(b.input).slice(0, 240);
              bus.emit('agentLog', {
                agentRole: 'worker',
                agentId,
                actionId,
                kind: 'tool',
                text: `→ ${b.name}(${argsStr})`,
                ts: Date.now()
              });
            }
          }
        } else if (msg.type === 'result') {
          if (msg.subtype === 'success') {
            totalCost = msg.total_cost_usd ?? 0;
            totalTokens =
              (msg.usage?.input_tokens ?? 0) +
              (msg.usage?.output_tokens ?? 0) +
              (msg.usage?.cache_read_input_tokens ?? 0) +
              (msg.usage?.cache_creation_input_tokens ?? 0);
          } else {
            errorMsg = (msg as { error?: string }).error ?? 'error';
          }
        }
      }
    } catch (err) {
      if (ctrl.signal.aborted) {
        // intentional cancel
      } else {
        errorMsg = err instanceof Error ? err.message : String(err);
        console.error('[worker] error', err);
      }
    }

    const finalStatus: Action['status'] = ctrl.signal.aborted ? 'cancelled' : (errorMsg ? 'error' : 'done');
    const final: Action = {
      ...running,
      status: finalStatus,
      endedAt: Date.now(),
      cost: totalCost,
      tokens: totalTokens,
      producedArtifactIds: [...producedIds]
    };
    await world.upsertAction(final);
    bus.emit('world', { type: 'action.status', action: final });

    const elapsedMs = (final.endedAt ?? Date.now()) - final.startedAt;
    const longTask = elapsedMs > 10_000;
    if (errorMsg) {
      bus.emit('world', { type: 'toast', level: 'error', message: `worker: ${errorMsg}` });
      const notif = {
        id: nanoid(10),
        kind: 'worker.error' as const,
        level: 'error' as const,
        title: `worker failed: ${input.text.slice(0, 40)}`,
        body: errorMsg,
        createdAt: Date.now()
      };
      void world.insertNotification(notif);
      bus.emit('world', { type: 'notification', notification: notif });
    } else if (longTask && finalStatus === 'done') {
      const notif = {
        id: nanoid(10),
        kind: 'worker.done' as const,
        level: 'success' as const,
        title: `${producedIds.length} artifact${producedIds.length === 1 ? '' : 's'} ready`,
        body: input.text.slice(0, 80),
        createdAt: Date.now()
      };
      void world.insertNotification(notif);
      bus.emit('world', { type: 'notification', notification: notif });
    }
  })();

  return {
    actionId,
    promise,
    abort: () => ctrl.abort()
  };
}
