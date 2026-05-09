import { query, type SDKUserMessage } from '@anthropic-ai/claude-agent-sdk';
import { AsyncQueue } from '../async-queue';
import { buildListeningTools, LISTENING_TOOL_NAMES, type ListeningCallbacks } from '../mcp/listening-tools';
import { bus } from '../event-bus';
import type { TranscriptChunk } from '../../../shared/types';

const SYSTEM_PROMPT = `You are the Listening agent in a spatial knowledge tool. Your input is a stream of transcript chunks (each user message is one chunk as JSON).

Chunk shape: {"id":"...","ts":1234,"text":"...","isFinal":true|false,"source":"kbd"|"voice"}

Your job:
1. Decide when a logical utterance is COMPLETE — a user thought you can act on. Combine recent chunks if the same thought spans multiple. Don't act on partial fragments.
2. When complete and the user is asking for work, call \`propose_action\` with the action kind and full text. Resolve any explicit @-references into the references array (without the @).
3. If the user starts a new request that contradicts an in-flight one (e.g. "actually, focus on Y instead"), pass \`supersedes\` with the previous actionId so it's cancelled.
4. If the user said something complete but not actionable (e.g. small talk, thinking aloud), call \`mark_utterance_complete\` only.
5. Be conservative — better to wait for one more chunk than to fire a half-formed action.
6. Output text is ignored; only tool calls have effect. Stay quiet otherwise.`;

export class ListeningAgent {
  private queue = new AsyncQueue<SDKUserMessage>();
  private ctrl = new AbortController();
  private running = false;
  private currentQuery: ReturnType<typeof query> | null = null;

  constructor(private callbacks: ListeningCallbacks, private getModel: () => string = () => 'claude-haiku-4-5-20251001') {}

  isRunning(): boolean { return this.running; }

  async setModel(model: string): Promise<void> {
    if (!this.currentQuery) return;
    try {
      await this.currentQuery.setModel(model);
      console.log('[listening] model switched to', model);
    } catch (err) {
      console.warn('[listening] setModel failed', err);
    }
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    bus.emit('world', { type: 'listening.status', status: 'idle' });

    const server = buildListeningTools(this.callbacks);

    void (async () => {
      try {
        const q = query({
          prompt: this.queue,
          options: {
            model: this.getModel(),
            systemPrompt: SYSTEM_PROMPT,
            mcpServers: { 'listening-tools': server },
            allowedTools: [...LISTENING_TOOL_NAMES],
            tools: [],
            abortController: this.ctrl,
            maxTurns: 1000
          }
        });
        this.currentQuery = q;

        for await (const msg of q) {
          if (this.ctrl.signal.aborted) break;
          if (msg.type === 'assistant') {
            for (const b of msg.message.content) {
              if (b.type === 'text' && b.text.trim()) {
                bus.emit('agentLog', {
                  agentRole: 'listening',
                  agentId: 'listening',
                  text: b.text.trim().slice(0, 200),
                  ts: Date.now()
                });
              }
            }
          }
        }
      } catch (err) {
        if (!this.ctrl.signal.aborted) {
          console.error('[listening] error', err);
          bus.emit('world', {
            type: 'toast',
            level: 'warn',
            message: `listening: ${err instanceof Error ? err.message : 'error'}`
          });
        }
      } finally {
        this.running = false;
        this.currentQuery = null;
        bus.emit('world', { type: 'listening.status', status: 'idle' });
      }
    })();
  }

  feedChunk(chunk: TranscriptChunk): void {
    if (!this.running) return;
    bus.emit('world', { type: 'listening.status', status: 'thinking' });
    this.queue.push({
      type: 'user',
      message: { role: 'user', content: JSON.stringify(chunk) },
      parent_tool_use_id: null
    });
  }

  stop(): void {
    this.ctrl.abort();
    this.queue.close();
  }
}
