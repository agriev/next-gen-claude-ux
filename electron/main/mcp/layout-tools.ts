import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import type { WorldState } from '../world-state';
import type { Edge, EdgeKind, Artifact } from '../../../shared/types';
import { bus } from '../event-bus';

export function buildLayoutTools(world: WorldState) {
  const placeOnCanvas = tool(
    'place_on_canvas',
    'Set the 3D position of an artifact. World coordinates: recommended x[-12,12], y[-2,4], z[-8,8]. Plates are ~2.5 wide so leave gaps. Pinned artifacts are skipped.',
    {
      id: z.string(),
      x: z.number(),
      y: z.number(),
      z: z.number()
    },
    async args => {
      const a = world.getArtifact(args.id);
      if (!a) {
        return { content: [{ type: 'text' as const, text: `error: no artifact ${args.id}` }], isError: true };
      }
      if (a.pinned) {
        return { content: [{ type: 'text' as const, text: `skipped: ${args.id} is pinned` }] };
      }
      await world.setArtifactPosition(args.id, { x: args.x, y: args.y, z: args.z }, false);
      bus.emit('world', {
        type: 'layout.updated',
        positions: [{ id: args.id, x: args.x, y: args.y, z: args.z }]
      });
      return { content: [{ type: 'text' as const, text: `placed ${args.id}` }] };
    }
  );

  const drawEdge = tool(
    'draw_edge',
    'Draw a relationship between two artifacts. Only call when relation is clear. Sparse is better than dense.',
    {
      src: z.string(),
      dst: z.string(),
      kind: z.enum(['derives', 'references', 'contradicts', 'groups-with']),
      weight: z.number().optional()
    },
    async args => {
      if (args.src === args.dst) {
        return { content: [{ type: 'text' as const, text: 'error: self-edge' }], isError: true };
      }
      const srcA = world.getArtifact(args.src);
      const dstA = world.getArtifact(args.dst);
      if (!srcA || !dstA) {
        return { content: [{ type: 'text' as const, text: 'error: missing endpoint' }], isError: true };
      }
      const edge: Edge = {
        id: nanoid(10),
        src: args.src,
        dst: args.dst,
        kind: args.kind as EdgeKind,
        weight: args.weight ?? 1,
        createdBy: 'layout'
      };
      await world.upsertEdge(edge);
      bus.emit('world', { type: 'edge.upserted', edge });
      return { content: [{ type: 'text' as const, text: `edge ${args.src}→${args.dst} ${args.kind}` }] };
    }
  );

  const removeEdge = tool(
    'remove_edge',
    'Remove an edge by id. Use list_edges first to discover edge ids.',
    { id: z.string() },
    async args => {
      await world.removeEdge(args.id);
      bus.emit('world', { type: 'edge.removed', id: args.id });
      return { content: [{ type: 'text' as const, text: `removed ${args.id}` }] };
    }
  );

  const listEdges = tool(
    'list_edges',
    'List all edges on the active board, or only those incident to a specific artifact (by id or shortName). Returns one row per edge: id, direction, endpoints (both id and shortName), kind, weight, optional label, and creator (user/worker/layout). Use this before update_edge or remove_edge so you know which edges already exist.',
    {
      artifactId: z.string().optional().describe('Optional id or shortName. When set, only edges where this artifact is src or dst are returned.'),
      kind: z.enum(['derives', 'references', 'contradicts', 'groups-with']).optional()
    },
    async args => {
      let target: Artifact | undefined;
      if (args.artifactId) {
        target = world.getArtifact(args.artifactId) ?? world.resolveShortName(args.artifactId);
        if (!target) {
          return { content: [{ type: 'text' as const, text: `error: no artifact ${args.artifactId}` }], isError: true };
        }
      }
      const edges = world.getAllEdges().filter(e => {
        if (target && e.src !== target.id && e.dst !== target.id) return false;
        if (args.kind && e.kind !== args.kind) return false;
        return true;
      });
      const rows = edges.map(e => {
        const src = world.getArtifact(e.src);
        const dst = world.getArtifact(e.dst);
        return {
          id: e.id,
          src: e.src,
          dst: e.dst,
          srcShortName: src?.shortName ?? null,
          dstShortName: dst?.shortName ?? null,
          kind: e.kind,
          weight: e.weight,
          label: e.label ?? null,
          createdBy: e.createdBy
        };
      });
      const summary = `${rows.length} edge${rows.length === 1 ? '' : 's'}${target ? ` incident to @${target.shortName}` : ''}`;
      return {
        content: [{
          type: 'text' as const,
          text: `${summary}\n${JSON.stringify(rows, null, 2)}`
        }]
      };
    }
  );

  const updateEdge = tool(
    'update_edge',
    'Update an existing edge: change its kind, weight, or human-readable label. Pass only the fields you want to change. Use list_edges first to find the id.',
    {
      id: z.string(),
      kind: z.enum(['derives', 'references', 'contradicts', 'groups-with']).optional(),
      weight: z.number().optional(),
      label: z.string().nullable().optional().describe('Pass null to clear an existing label, omit to leave unchanged.')
    },
    async args => {
      const existing = world.getEdge(args.id);
      if (!existing) {
        return { content: [{ type: 'text' as const, text: `error: no edge ${args.id}` }], isError: true };
      }
      const updated: Edge = {
        ...existing,
        kind: (args.kind as EdgeKind) ?? existing.kind,
        weight: args.weight ?? existing.weight,
        label: args.label === null ? undefined : (args.label ?? existing.label)
      };
      await world.upsertEdge(updated);
      bus.emit('world', { type: 'edge.upserted', edge: updated });
      const changes: string[] = [];
      if (args.kind !== undefined && args.kind !== existing.kind) changes.push(`kind ${existing.kind}→${args.kind}`);
      if (args.weight !== undefined && args.weight !== existing.weight) changes.push(`weight ${existing.weight}→${args.weight}`);
      if (args.label !== undefined && args.label !== existing.label) {
        changes.push(args.label === null ? 'label cleared' : `label "${args.label}"`);
      }
      return {
        content: [{ type: 'text' as const, text: `edge ${args.id} updated: ${changes.join(', ') || 'no-op'}` }]
      };
    }
  );

  const createCluster = tool(
    'create_cluster',
    'Group artifacts under a translucent labeled region. Use sparingly — only when there is a clear common theme. The cluster auto-sizes around its members and follows them. The user can delete it like any card.',
    {
      label: z.string().describe('Short cluster name (one or two words, e.g. "Research", "Open questions", "Draft v1")'),
      artifactIds: z.array(z.string()).min(2).describe('IDs of member artifacts (≥2)'),
      description: z.string().optional().describe('Optional one-sentence description of why these are grouped'),
      tagHint: z.string().optional().describe('Single-word tag, used for color hash and filtering')
    },
    async args => {
      let cx = 0, cy = 0, cz = 0, n = 0;
      for (const id of args.artifactIds) {
        const a = world.getArtifact(id);
        if (a?.position) {
          cx += a.position.x; cy += a.position.y; cz += a.position.z; n++;
        }
      }
      if (n > 0) { cx /= n; cy /= n; cz /= n; }

      const baseName = args.label.split(/\s+/)[0]?.replace(/[^\w]/g, '') || 'Cluster';
      const shortName = world.uniqueShortName(baseName);
      const id = nanoid(10);
      const now = Date.now();
      const cluster: Artifact = {
        id,
        boardId: world.getActiveBoardId(),
        kind: 'cluster',
        mime: 'application/x-cluster',
        title: args.label,
        shortName,
        body: args.description ?? args.label,
        createdAt: now,
        updatedAt: now,
        createdBy: 'layout',
        state: 'ready',
        tags: args.tagHint ? [args.tagHint, 'cluster'] : ['cluster'],
        spec: {
          summary: args.description ?? args.label,
          tags: args.tagHint ? [args.tagHint] : [],
          refs: args.artifactIds,
          tokens: Math.ceil((args.description?.length ?? 0) / 4)
        },
        position: { x: cx, y: cy, z: cz }
      };
      await world.upsertArtifact(cluster);
      bus.emit('world', { type: 'artifact.upserted', artifact: cluster });
      return { content: [{ type: 'text' as const, text: `cluster ${shortName} (${n} members) at (${cx.toFixed(1)},${cy.toFixed(1)},${cz.toFixed(1)})` }] };
    }
  );

  return createSdkMcpServer({
    name: 'layout-tools',
    version: '0.1.0',
    tools: [placeOnCanvas, drawEdge, removeEdge, listEdges, updateEdge, createCluster]
  });
}

export const LAYOUT_TOOL_NAMES = [
  'mcp__layout-tools__place_on_canvas',
  'mcp__layout-tools__draw_edge',
  'mcp__layout-tools__remove_edge',
  'mcp__layout-tools__list_edges',
  'mcp__layout-tools__update_edge',
  'mcp__layout-tools__create_cluster'
] as const;
