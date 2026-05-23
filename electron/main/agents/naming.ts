/**
 * NamingAgent — B15 in BACKLOG-v2.md.
 *
 * Lightweight one-shot Haiku query that proposes a short distinctive name
 * (1-3 capitalized words) for an artifact whose existing shortName is
 * generic. Triggered by the orchestrator after an artifact lands with a
 * placeholder shortName ("Untitled", "The", "Document", etc.).
 *
 * Stateless — no long-lived session, no MCP tools, no streaming. One query,
 * one response, done. This keeps cost predictable and avoids tying the
 * agent's lifecycle to the world.
 */
import { query } from '@anthropic-ai/claude-agent-sdk';
import type { WorldState } from '../world-state';
import type { Artifact } from '../../../shared/types';
import { bus } from '../event-bus';

const SYSTEM_PROMPT = `You are the Naming agent. Given an artifact's title and a short body excerpt, propose ONE distinctive shortName — a single capitalized word the user can use to reference it (e.g. "Atlas", "Pulse", "Mission"). RULES:
- Output ONLY the shortName, nothing else (no quotes, no markdown, no period)
- One word, alphabetic only, capitalized
- Memorable and distinctive — avoid "Document", "Notes", "Untitled"
- Prefer concept words over generic categories`;

const GENERIC_NAMES = new Set([
  'untitled', 'document', 'doc', 'note', 'notes',
  'the', 'a', 'an', 'untitled-2', 'artifact', 'file'
]);

/**
 * Returns true if the current shortName looks like a placeholder worth
 * asking the Naming agent to improve. Heuristic — false positives are OK
 * (we re-name once; cost is tiny), false negatives are also OK.
 */
export function looksGeneric(shortName: string): boolean {
  if (!shortName) return true;
  const lower = shortName.toLowerCase().replace(/-?\d+$/, '');
  return GENERIC_NAMES.has(lower);
}

const NAME_RE = /^[A-Z][a-zA-Z]{1,30}$/;

export class NamingAgent {
  constructor(private world: WorldState) {}

  /**
   * Propose a name for an artifact. Returns `null` if the model output was
   * unusable (empty, malformed, or matches an existing shortName).
   */
  async propose(artifact: Artifact): Promise<string | null> {
    const bodyExcerpt = (artifact.body ?? '').slice(0, 400).replace(/\s+/g, ' ').trim();
    const prompt = `Title: ${artifact.title}\nExcerpt: ${bodyExcerpt || '(empty body)'}\n\nPropose one shortName.`;
    let collected = '';
    try {
      const q = query({
        prompt,
        options: {
          model: this.world.getModel('naming'),
          systemPrompt: SYSTEM_PROMPT,
          tools: [],
          maxTurns: 1
        }
      });
      for await (const msg of q) {
        if (msg.type === 'assistant') {
          for (const b of msg.message.content) {
            if (b.type === 'text') collected += b.text;
          }
        }
      }
    } catch (err) {
      bus.emit('agentLog', {
        agentRole: 'naming',
        agentId: 'naming',
        kind: 'note',
        text: `naming failed for ${artifact.id}: ${err instanceof Error ? err.message : 'error'}`,
        ts: Date.now()
      });
      return null;
    }
    // Extract the first ASCII word from the response. The model often adds
    // explanation despite the prompt; we tolerate that.
    const match = collected.trim().match(/[A-Za-z]{2,30}/);
    if (!match) return null;
    const candidate = match[0].charAt(0).toUpperCase() + match[0].slice(1).toLowerCase();
    if (!NAME_RE.test(candidate)) return null;
    const unique = this.world.uniqueShortName(candidate);
    return unique;
  }

  /**
   * Convenience: propose AND apply. Returns the applied shortName or null.
   * Skips if the artifact's current shortName is not generic.
   */
  async tryRename(artifactId: string): Promise<string | null> {
    const a = this.world.getArtifact(artifactId);
    if (!a) return null;
    if (!looksGeneric(a.shortName)) return null;
    const proposed = await this.propose(a);
    if (!proposed || proposed === a.shortName) return null;
    const updated: Artifact = { ...a, shortName: proposed, updatedAt: Date.now() };
    await this.world.upsertArtifact(updated);
    bus.emit('world', { type: 'artifact.upserted', artifact: updated });
    bus.emit('agentLog', {
      agentRole: 'naming',
      agentId: 'naming',
      kind: 'tool',
      text: `renamed ${artifactId.slice(0, 6)} → @${proposed}`,
      ts: Date.now()
    });
    return proposed;
  }
}
