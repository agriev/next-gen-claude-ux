import { query, type SDKUserMessage } from '@anthropic-ai/claude-agent-sdk';
import { AsyncQueue } from '../async-queue';
import { buildLayoutTools, LAYOUT_TOOL_NAMES } from '../mcp/layout-tools';
import { bus } from '../event-bus';
import type { WorldState } from '../world-state';
import type { Artifact } from '../../../shared/types';

const SYSTEM_PROMPT = `You are the Layout agent for a 3D spatial knowledge canvas. Each user message is a JSON delta about artifacts.

Delta shapes:
- {"op":"hello","artifacts":[{id, kind, shortName, title, spec, pinned, position}, ...]} — full snapshot at startup.
- {"op":"upsert","artifact":{...}} — new or changed artifact.
- {"op":"remove","id":"..."} — artifact deleted.
- {"op":"idle"} — periodic prompt; no changes.
- {"op":"reorganize","mode":"by-type"|"by-tags"|"by-topic"|"by-time"|"free-form","prompt":"...?","artifacts":[...]} — user requested a fresh layout pass. Place ALL non-pinned artifacts using \`place_on_canvas\`, group similar ones into \`create_cluster\`, optionally adjust edges. Skip pinned artifacts.

Identifier rule: every artifact in the delta has both \`id\` (a 10-char nanoid like "K3-7vQz9aB") and \`shortName\` (like "Atlas"). Tools accept either, BUT clusters work correctly only when you pass values that match an existing artifact. The \`id\` is always unique; \`shortName\` may shift. Prefer \`id\`. Never invent ids — copy them from the latest delta.

Your tools:
- \`apply_layout_plan({placements, clusters?, edges?, replaceEdges?})\` — BATCH tool. Use ONLY for \`reorganize\` deltas. Submits ALL placements + clusters + edges in a single call. One Anthropic round-trip instead of N. \`placements[*].id\` and \`clusters[*].artifactIds\` MUST reference real artifacts in the current delta. Unresolved ids drop the whole cluster.
- \`place_on_canvas(id, x, y, z)\` — set ONE position. Range x[-14,14], y[-2,4], z[-8,8]. Plates are ~3.5 wide, leave gaps of 1+. Use for incremental \`upsert\` / \`hello\` deltas.
- \`draw_edge(src, dst, kind, weight?)\` — kind ∈ {derives, references, contradicts, groups-with}. Sparse beats dense.
- \`remove_edge(id)\` — drop a stale edge.
- \`create_cluster(label, artifactIds, description?, tagHint?)\` — group ≥2 artifacts under a translucent labeled region. Each cluster gets its own visual area. Use only when grouping is meaningful.

Rules:
1. Skip artifacts with pinned:true.
2. For \`reorganize\` you MUST call \`apply_layout_plan\` exactly ONCE with every non-pinned placement and any clusters. Do NOT call \`place_on_canvas\` or \`create_cluster\` individually during a reorganize — that is the slow path and wastes round-trips. Within \`apply_layout_plan\`:
   - by-type: group by \`kind\` (doc/note/code/log). Place each group in its own region, then a cluster per group named "Doc"/"Code" etc.
   - by-tags: group by spec.tags or top-level tags. Multi-tagged artifacts go into the most discriminating group. One cluster per tag.
   - by-topic: read spec.summary and body excerpts to infer topics; cluster by topic name.
   - by-time: arrange chronologically left→right by createdAt; no clusters unless spans days.
   - free-form: follow the natural-language prompt.
   Place groups ~6 units apart on X. Within a group, lay out cards in ~3-wide rows with 4 unit horizontal and 2.5 unit vertical spacing.
3. For \`upsert\` / \`hello\` / \`idle\`: be incremental — call \`place_on_canvas\` only for what's new or visibly conflicting. Do NOT use \`apply_layout_plan\` for these.
4. Don't draw redundant edges. Don't create duplicate clusters.
5. Stay silent in text — only tool calls have effect.`;

/**
 * Trigger a context reset once the long-lived session has consumed this many
 * input-equivalent tokens. The SDK does not expose `compact()` in 0.2.136 —
 * we replicate the effect by interrupting + restarting with a fresh hello.
 * 50K is a good balance: long enough that a typical work session never trips
 * it, short enough that we never approach the 200K context window.
 */
const CONTEXT_RESET_THRESHOLD_TOKENS = 50_000;

export class LayoutAgent {
  private queue = new AsyncQueue<SDKUserMessage>();
  private ctrl = new AbortController();
  private running = false;
  private currentQuery: ReturnType<typeof query> | null = null;
  private loopPromise: Promise<void> | null = null;
  private restarting = false;

  // Cumulative input-side tokens used in this session. Reset on context
  // restart. Combines new input + cache-creation; cache reads are essentially
  // free so we don't count them against the budget.
  private cumulativeInputTokens = 0;

  // Per-reorganize telemetry. We start a window when the user requests a
  // reorganize, count tool calls during it, and stamp wall-clock + cost when
  // the next `result` event arrives. Streaming-input mode means each turn ends
  // with its own result event, so this is reliable.
  private currentTurn: {
    label: string;
    startedAt: number;
    toolCalls: number;
    artifactCount: number;
  } | null = null;

  constructor(private world: WorldState) {}

  isRunning(): boolean { return this.running; }

  async setModel(model: string): Promise<void> {
    if (!this.currentQuery) return;
    try {
      await this.currentQuery.setModel(model);
      console.log('[layout] model switched to', model);
    } catch (err) {
      console.warn('[layout] setModel failed', err);
    }
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    console.log('[layout] starting');

    const server = buildLayoutTools(this.world);

    const initial = this.world.getAllArtifacts().map(a => this.minimal(a));
    this.pushDelta({ op: 'hello', artifacts: initial });

    this.loopPromise = this.loop(server).finally(() => {
      this.running = false;
      this.loopPromise = null;
      console.log('[layout] loop ended');
    });
  }

  private async loop(server: ReturnType<typeof buildLayoutTools>): Promise<void> {
    try {
      console.log('[layout] opening query()');
      const q = query({
        prompt: this.queue,
        options: {
          model: this.world.getModel('layout'),
          systemPrompt: SYSTEM_PROMPT,
          mcpServers: { 'layout-tools': server },
          allowedTools: [...LAYOUT_TOOL_NAMES],
          tools: [],
          abortController: this.ctrl,
          maxTurns: 1000
          // maxBudgetUsd intentionally omitted — kept hitting the cap on
          // big boards. Restart-on-token-threshold (below) is the actual
          // safety net; budget is now observed-only via the cost log line.
        }
      });
      this.currentQuery = q;

      for await (const msg of q) {
        if (this.ctrl.signal.aborted) break;
        if (msg.type === 'system') {
          console.log('[layout] system msg', (msg as { subtype?: string }).subtype);
        } else if (msg.type === 'result') {
          const subtype = (msg as { subtype?: string }).subtype;
          const usage = (msg as { usage?: { input_tokens?: number; output_tokens?: number; cache_read_input_tokens?: number; cache_creation_input_tokens?: number } }).usage;
          const cost = (msg as { total_cost_usd?: number }).total_cost_usd;
          const tokens =
            (usage?.input_tokens ?? 0) +
            (usage?.output_tokens ?? 0) +
            (usage?.cache_read_input_tokens ?? 0) +
            (usage?.cache_creation_input_tokens ?? 0);
          // Cache reads are essentially free; only new input + cache-creation
          // count against the context-reset budget.
          const newInput =
            (usage?.input_tokens ?? 0) +
            (usage?.cache_creation_input_tokens ?? 0);
          this.cumulativeInputTokens += newInput;
          console.log('[layout] result', subtype);
          if (this.currentTurn) {
            const elapsed = Date.now() - this.currentTurn.startedAt;
            const seconds = (elapsed / 1000).toFixed(1);
            const dollars = typeof cost === 'number' ? `$${cost.toFixed(4)}` : '$?';
            const slowReorganize = /^reorganize\b/.test(this.currentTurn.label) && this.currentTurn.toolCalls > 2;
            const warn = slowReorganize ? ' ⚠ many tool calls — agent skipped apply_layout_plan' : '';
            bus.emit('agentLog', {
              agentRole: 'layout',
              agentId: 'layout',
              kind: 'note',
              text: `✓ ${this.currentTurn.label} done in ${seconds}s · ${this.currentTurn.toolCalls} tool calls · ${tokens} tokens · ${dollars} · cum=${this.cumulativeInputTokens}${subtype && subtype !== 'success' ? ` · ${subtype}` : ''}${warn}`,
              ts: Date.now()
            });
            this.currentTurn = null;
          }
          // Bound the long-lived session: if accumulated input crosses the
          // threshold and no turn is in flight, schedule a context reset.
          if (this.cumulativeInputTokens > CONTEXT_RESET_THRESHOLD_TOKENS && !this.currentTurn && !this.restarting) {
            void this.restart('auto');
          }
        } else if (msg.type === 'assistant') {
          for (const b of msg.message.content) {
            if (b.type === 'text' && b.text.trim()) {
              bus.emit('agentLog', {
                agentRole: 'layout',
                agentId: 'layout',
                kind: 'thought',
                text: b.text.trim().slice(0, 280),
                ts: Date.now()
              });
            } else if (b.type === 'tool_use') {
              const argsStr = JSON.stringify((b as { input?: unknown }).input).slice(0, 200);
              bus.emit('agentLog', {
                agentRole: 'layout',
                agentId: 'layout',
                kind: 'tool',
                text: `→ ${(b as { name?: string }).name}(${argsStr})`,
                ts: Date.now()
              });
              if (this.currentTurn) this.currentTurn.toolCalls++;
            }
          }
        }
      }
    } catch (err) {
      if (!this.ctrl.signal.aborted) {
        console.error('[layout] error', err);
        bus.emit('world', {
          type: 'toast',
          level: 'warn',
          message: `layout: ${err instanceof Error ? err.message : 'error'}`
        });
      }
    } finally {
      this.currentQuery = null;
    }
  }

  notifyUpsert(a: Artifact): void {
    if (!this.running) return;
    this.pushDelta({ op: 'upsert', artifact: this.minimal(a) });
  }

  notifyRemove(id: string): void {
    if (!this.running) return;
    this.pushDelta({ op: 'remove', id });
  }

  requestReorganize(mode: string, prompt?: string): void {
    if (!this.running) {
      console.warn('[layout] reorganize requested but agent not running');
      bus.emit('world', { type: 'toast', level: 'warn', message: 'Layout agent not running — reorganize ignored. Check Claude auth.' });
      return;
    }
    const artifacts = this.world.getAllArtifacts()
      .filter(a => a.kind !== 'cluster')
      .map(a => this.minimal(a));
    console.log(`[layout] reorganize ${mode} on ${artifacts.length} artifacts${prompt ? ` (${prompt})` : ''}`);
    const label = `reorganize ${mode}${prompt ? ` "${prompt.slice(0, 40)}"` : ''} on ${artifacts.length} cards`;
    this.currentTurn = {
      label,
      startedAt: Date.now(),
      toolCalls: 0,
      artifactCount: artifacts.length
    };
    bus.emit('agentLog', {
      agentRole: 'layout', agentId: 'layout',
      kind: 'note', text: `▶ ${label} — model=${this.world.getModel('layout')}`,
      ts: Date.now()
    });
    bus.emit('agentLog', {
      agentRole: 'layout', agentId: 'layout',
      kind: 'tool', text: `→ reorganize(${mode}) on ${artifacts.length} artifacts`,
      ts: Date.now()
    });
    this.pushDelta({ op: 'reorganize', mode, prompt, artifacts });
  }

  stop(): void {
    this.ctrl.abort();
    this.queue.close();
  }

  /**
   * Public manual reset. Wired through Orchestrator so a UI button can call it.
   */
  resetContext(): void {
    void this.restart('manual');
  }

  /**
   * Tear down the current long-lived `query()` and start a fresh one with a
   * new `hello` snapshot. The SDK doesn't expose `compact()` in 0.2.136, so
   * this is our replacement for unbounded conversation growth. It costs us
   * the prompt cache on the next turn but resets memory completely.
   *
   * Safe to call concurrently — the `restarting` flag de-dupes. Any deltas
   * queued during the restart are preserved and replayed after `hello`.
   */
  private async restart(trigger: 'auto' | 'manual'): Promise<void> {
    if (this.restarting) return;
    this.restarting = true;
    const tokensBefore = this.cumulativeInputTokens;

    // Drain any pending deltas so we can replay them after hello.
    const pending = this.queue.drain();

    // Close the current query: prefer interrupt() (graceful), fall back to
    // abort() if it hangs.
    const interruptPromise = (async () => {
      try {
        if (this.currentQuery) await this.currentQuery.interrupt();
      } catch (err) {
        console.warn('[layout] interrupt threw', err);
      }
    })();
    const timeoutPromise = new Promise<void>(resolve => setTimeout(resolve, 2000));
    await Promise.race([interruptPromise, timeoutPromise]);

    this.ctrl.abort();
    this.queue.close();
    // Wait for the old loop to actually exit so we don't double-consume the
    // queue or leak the previous query() process.
    if (this.loopPromise) {
      try {
        await this.loopPromise;
      } catch {
        // ignored — the loop is being abandoned
      }
    }

    // Reset state and start fresh.
    this.ctrl = new AbortController();
    this.queue = new AsyncQueue<SDKUserMessage>();
    this.cumulativeInputTokens = 0;
    this.currentTurn = null;
    this.currentQuery = null;
    this.running = false;

    const artifactCount = this.world.getAllArtifacts().length;
    bus.emit('agentLog', {
      agentRole: 'layout',
      agentId: 'layout',
      kind: 'note',
      text: `↻ layout context reset (${trigger}, was: ${tokensBefore} tokens, re-hello'd ${artifactCount} artifacts)`,
      ts: Date.now()
    });

    this.start();

    // Replay any deltas that arrived during the restart window.
    for (const m of pending) this.queue.push(m);

    this.restarting = false;
  }

  private pushDelta(delta: unknown): void {
    const msg: SDKUserMessage = {
      type: 'user',
      message: { role: 'user', content: JSON.stringify(delta) },
      parent_tool_use_id: null
    };
    this.queue.push(msg);
  }

  private minimal(a: Artifact) {
    return {
      id: a.id,
      kind: a.kind,
      shortName: a.shortName,
      title: a.title,
      spec: a.spec,
      pinned: a.pinned ?? false,
      position: a.position
    };
  }
}
