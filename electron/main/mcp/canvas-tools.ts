import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import type { WorldState } from '../world-state';
import type { Artifact, ArtifactKind, ArtifactSpec } from '../../../shared/types';
import { bus } from '../event-bus';

interface BuildOpts {
  world: WorldState;
  actionId: string;
  agentId: string;
  getDefaultPosition: () => { x: number; y: number; z: number };
  requestLayoutPass: (mode: string, prompt?: string) => void | Promise<void>;
}

const ARTIFACT_KINDS = ['doc', 'note', 'code', 'log'] as const;

export function buildCanvasTools({ world, actionId, agentId, getDefaultPosition, requestLayoutPass }: BuildOpts) {
  const producedIds: string[] = [];

  const createArtifact = tool(
    'create_artifact',
    'Create a new artifact (a doc, note, code snippet, or log) that becomes a card on the user\'s spatial canvas. The user only sees content surfaced this way — not your assistant text. Use a short distinctive shortName (one capitalized word).',
    {
      kind: z.enum(ARTIFACT_KINDS).describe('Type of artifact: doc=prose/markdown, note=short text, code=code snippet, log=progress/trace'),
      title: z.string().describe('Full human-readable title for the artifact'),
      shortName: z.string().optional().describe('One short capitalized word the user can use to refer to this artifact (e.g. "Atlas"). Auto-deduplicated.'),
      body: z.string().describe('Full body content of the artifact'),
      mime: z.string().optional().describe('MIME type, e.g. text/markdown, text/x-typescript, text/x-python')
    },
    async args => {
      const baseShortName = args.shortName ?? args.title.split(/\s+/)[0] ?? 'Artifact';
      const shortName = world.uniqueShortName(baseShortName);
      const id = nanoid(10);
      const now = Date.now();
      const a: Artifact = {
        id,
        boardId: world.getActiveBoardId(),
        kind: args.kind as ArtifactKind,
        mime: args.mime ?? (args.kind === 'code' ? 'text/plain' : 'text/markdown'),
        title: args.title,
        shortName,
        body: args.body,
        createdAt: now,
        updatedAt: now,
        createdBy: actionId,
        state: 'ready',
        tags: [],
        position: getDefaultPosition()
      };
      await world.upsertArtifact(a);
      producedIds.push(id);
      bus.emit('world', { type: 'artifact.upserted', artifact: a });
      bus.emit('agentLog', { agentRole: 'worker', agentId, actionId, kind: 'tool', ts: now, text: `created ${shortName} (${args.kind})` });
      return {
        content: [{ type: 'text' as const, text: `created artifact id=${id} shortName=${shortName}` }]
      };
    }
  );

  const updateArtifact = tool(
    'update_artifact',
    'Update an existing artifact\'s body or title. Reference by id (returned from create_artifact) or shortName.',
    {
      id: z.string().optional(),
      shortName: z.string().optional(),
      title: z.string().optional(),
      body: z.string().optional()
    },
    async args => {
      const id = args.id ?? (args.shortName ? world.resolveShortName(args.shortName)?.id : undefined);
      if (!id) {
        return { content: [{ type: 'text' as const, text: 'error: provide id or shortName' }], isError: true };
      }
      const a = world.getArtifact(id);
      if (!a) return { content: [{ type: 'text' as const, text: `error: no artifact ${id}` }], isError: true };
      const updated: Artifact = {
        ...a,
        title: args.title ?? a.title,
        body: args.body ?? a.body,
        updatedAt: Date.now(),
        state: 'ready'
      };
      await world.upsertArtifact(updated);
      bus.emit('world', { type: 'artifact.upserted', artifact: updated });
      return { content: [{ type: 'text' as const, text: `updated ${id}` }] };
    }
  );

  const nameArtifact = tool(
    'name_artifact',
    'Set or rename the shortName of an artifact. ShortName is what the user types after @ to reference it.',
    {
      id: z.string(),
      shortName: z.string()
    },
    async args => {
      const a = world.getArtifact(args.id);
      if (!a) return { content: [{ type: 'text' as const, text: `error: no artifact ${args.id}` }], isError: true };
      const newName = world.uniqueShortName(args.shortName);
      const updated: Artifact = { ...a, shortName: newName, updatedAt: Date.now() };
      await world.upsertArtifact(updated);
      bus.emit('world', { type: 'artifact.upserted', artifact: updated });
      return { content: [{ type: 'text' as const, text: `named ${args.id} as ${newName}` }] };
    }
  );

  const setArtifactSpec = tool(
    'set_artifact_spec',
    'Attach a short spec (≤200 tokens) describing the artifact for the layout agent. Used to compute relationships and positioning.',
    {
      id: z.string(),
      summary: z.string().describe('One- or two-sentence summary of the artifact'),
      tags: z.array(z.string()).default([]),
      refs: z.array(z.string()).default([]).describe('IDs or shortNames of related artifacts')
    },
    async args => {
      const a = world.getArtifact(args.id);
      if (!a) return { content: [{ type: 'text' as const, text: `error: no artifact ${args.id}` }], isError: true };
      const spec: ArtifactSpec = {
        summary: args.summary,
        tags: args.tags,
        refs: args.refs,
        tokens: Math.ceil((args.summary.length + args.tags.join(' ').length + args.refs.join(' ').length) / 4)
      };
      const updated: Artifact = { ...a, spec, updatedAt: Date.now() };
      await world.upsertArtifact(updated);
      bus.emit('world', { type: 'artifact.upserted', artifact: updated });
      return { content: [{ type: 'text' as const, text: `spec set on ${args.id}` }] };
    }
  );

  const attachLog = tool(
    'attach_log',
    'Append a one-line progress note. Surfaces in the activity HUD; not stored as a permanent artifact unless the user asks.',
    {
      message: z.string()
    },
    async args => {
      bus.emit('agentLog', {
        agentRole: 'worker',
        agentId,
        actionId,
        kind: 'note',
        text: args.message,
        ts: Date.now()
      });
      return { content: [{ type: 'text' as const, text: 'logged' }] };
    }
  );

  const requestLayoutPassTool = tool(
    'request_layout_pass',
    'Hand off to the Layout agent to reorganize the entire canvas. Use this for big-picture layout requests ("group everything by topic", "lay out chronologically"). Existing clusters are wiped before the new pass; the previous arrangement is saved to the layout-history stack so the user can restore it.',
    {
      mode: z.enum(['by-type', 'by-tags', 'by-topic', 'by-time', 'free-form']).describe('Layout mode'),
      prompt: z.string().optional().describe('Required when mode=free-form; describes how to arrange in natural language')
    },
    async args => {
      await requestLayoutPass(args.mode, args.prompt);
      return { content: [{ type: 'text' as const, text: `requested layout pass: ${args.mode}${args.prompt ? ' / ' + args.prompt.slice(0, 60) : ''}` }] };
    }
  );

  const server = createSdkMcpServer({
    name: 'canvas-tools',
    version: '0.1.0',
    tools: [createArtifact, updateArtifact, nameArtifact, setArtifactSpec, attachLog, requestLayoutPassTool]
  });

  return { server, producedIds };
}

export const CANVAS_TOOL_NAMES = [
  'mcp__canvas-tools__create_artifact',
  'mcp__canvas-tools__update_artifact',
  'mcp__canvas-tools__name_artifact',
  'mcp__canvas-tools__set_artifact_spec',
  'mcp__canvas-tools__attach_log',
  'mcp__canvas-tools__request_layout_pass'
] as const;
