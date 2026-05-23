import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import type { WorldState } from '../world-state';
import type { Edge, Artifact, PendingLayoutPlan, PlanPlacement, PlanCluster, PlanEdge } from '../../../shared/types';
import { bus } from '../event-bus';

/** B04 — time the user gets to react before a plan auto-commits. */
const PLAN_TIMEOUT_MS = 5000;

/** B09 — agent-aura flash lifetime in ms. Layout pulses are usually batched so a slightly longer window matches the visual rhythm. */
const AURA_FLASH_MS = 1500;
function layoutAura(id: string): void {
  bus.emit('world', {
    type: 'aura.flash',
    artifactId: id,
    agentRole: 'layout',
    expiresAt: Date.now() + AURA_FLASH_MS
  });
}

/**
 * The model sometimes passes shortNames (`"Atlas"`) where we asked for ids,
 * because shortNames are more memorable. Accept either and resolve to the
 * full artifact. Returns `undefined` if neither path matches.
 */
function resolveArtifact(world: WorldState, idOrShortName: string): Artifact | undefined {
  return world.getArtifact(idOrShortName) ?? world.resolveShortName(idOrShortName);
}

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
      layoutAura(args.id);
      return { content: [{ type: 'text' as const, text: `placed ${args.id}` }] };
    }
  );

  const drawEdge = tool(
    'draw_edge',
    'Draw a relationship between two artifacts. The `kind` is a link-type id from the registry — call list_link_types to discover available ids, or register_link_type to create a new one. Built-in ids: derives, references, contradicts, groups-with. Only call when relation is clear. Sparse is better than dense.',
    {
      src: z.string(),
      dst: z.string(),
      kind: z.string().describe('Link type id (e.g. "derives" or any custom id from the registry).'),
      weight: z.number().optional()
    },
    async args => {
      if (args.src === args.dst) {
        return { content: [{ type: 'text' as const, text: 'error: self-edge' }], isError: true };
      }
      if (!world.hasLinkType(args.kind)) {
        const known = world.listLinkTypes().map(t => t.id).join(', ');
        return { content: [{ type: 'text' as const, text: `error: unknown link type "${args.kind}". Known: ${known}. Call register_link_type to create a new one.` }], isError: true };
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
        kind: args.kind,
        weight: args.weight ?? 1,
        createdBy: 'layout'
      };
      await world.upsertEdge(edge);
      bus.emit('world', { type: 'edge.upserted', edge });
      layoutAura(srcA.id);
      layoutAura(dstA.id);
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
      kind: z.string().optional().describe('Optional link-type id filter.')
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
    'Update an existing edge: change its kind (any registered link-type id), weight, or human-readable label. Pass only the fields you want to change. Use list_edges first to find the id, list_link_types for valid kinds.',
    {
      id: z.string(),
      kind: z.string().optional().describe('Link-type id from the registry.'),
      weight: z.number().optional(),
      label: z.string().nullable().optional().describe('Pass null to clear an existing label, omit to leave unchanged.')
    },
    async args => {
      const existing = world.getEdge(args.id);
      if (!existing) {
        return { content: [{ type: 'text' as const, text: `error: no edge ${args.id}` }], isError: true };
      }
      if (args.kind !== undefined && !world.hasLinkType(args.kind)) {
        const known = world.listLinkTypes().map(t => t.id).join(', ');
        return { content: [{ type: 'text' as const, text: `error: unknown link type "${args.kind}". Known: ${known}.` }], isError: true };
      }
      const updated: Edge = {
        ...existing,
        kind: args.kind ?? existing.kind,
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
      const cluster = await makeCluster(world, args);
      if (!cluster) {
        return {
          content: [{ type: 'text' as const, text: `error: cluster "${args.label}" had fewer than 2 resolvable member ids (check ids/shortNames against the current board)` }],
          isError: true
        };
      }
      const memberCount = (cluster.spec?.refs ?? []).length;
      const p = cluster.position ?? { x: 0, y: 0, z: 0 };
      layoutAura(cluster.id);
      for (const memberId of cluster.spec?.refs ?? []) layoutAura(memberId);
      return { content: [{ type: 'text' as const, text: `cluster ${cluster.shortName} (${memberCount} members) at (${p.x.toFixed(1)},${p.y.toFixed(1)},${p.z.toFixed(1)})` }] };
    }
  );

  const applyLayoutPlan = tool(
    'apply_layout_plan',
    'BACKWARD-COMPATIBLE FAST PATH (≤4 placements). Apply an entire reorganize in ONE call without proposing. Atomic: places artifacts, optionally replaces edges, then creates clusters. For LARGE reorganize (≥5 placements) prefer propose_layout_plan + commit_layout_plan so the user sees an intent-ghost preview and can reject before commit (B04). For incremental upserts / hello / idle deltas, keep using place_on_canvas / draw_edge / create_cluster individually. Skipping pinned artifacts is automatic.',
    {
      placements: z.array(z.object({
        id: z.string(),
        x: z.number(),
        y: z.number(),
        z: z.number()
      })).min(1).describe('All non-pinned placements for this reorganize. Coordinate range x[-14,14] y[-2,4] z[-8,8].'),
      clusters: z.array(z.object({
        label: z.string(),
        artifactIds: z.array(z.string()).min(2),
        description: z.string().optional(),
        tagHint: z.string().optional()
      })).optional().describe('Optional cluster definitions. Each cluster auto-centers on its members.'),
      edges: z.array(z.object({
        src: z.string(),
        dst: z.string(),
        kind: z.string().describe('Link-type id from registry (built-ins: derives, references, contradicts, groups-with).'),
        weight: z.number().optional()
      })).optional().describe('Optional new edges to draw.'),
      replaceEdges: z.boolean().optional().describe('If true, delete all existing layout-created edges before adding the new ones. User-drawn edges are preserved.')
    },
    async args => {
      const summary = await executePlan(world, {
        placements: args.placements,
        clusters: args.clusters,
        edges: args.edges,
        replaceEdges: args.replaceEdges
      });
      return { content: [{ type: 'text' as const, text: `layout plan applied: ${summary}` }] };
    }
  );

  /**
   * B04 — intent-ghost. Propose a layout plan to the user. The plan is NOT
   * applied to artifact positions — instead, the renderer shows translucent
   * "ghost" plates at the proposed positions. The user accepts (commit) or
   * rejects, or the plan auto-commits after PLAN_TIMEOUT_MS.
   *
   * Returns the plan id immediately. Subsequent assistant turns SHOULD NOT
   * make further mutations until they observe a commit or reject signal
   * (currently surfaced via the next delta).
   */
  const proposeLayoutPlan = tool(
    'propose_layout_plan',
    `Propose a layout reorganize as an intent-ghost (B04). Use this for any reorganize with ≥5 placements — the user sees translucent ghost plates at the proposed positions and has ${PLAN_TIMEOUT_MS / 1000}s to accept or reject (default action: auto-commit). Returns the proposal id. Schema identical to apply_layout_plan plus a required \`label\` string explaining the reorganize.`,
    {
      label: z.string().describe('One-sentence summary of the reorganize (e.g. "regroup by-topic into 3 clusters").'),
      placements: z.array(z.object({
        id: z.string(),
        x: z.number(),
        y: z.number(),
        z: z.number()
      })).min(1),
      clusters: z.array(z.object({
        label: z.string(),
        artifactIds: z.array(z.string()).min(2),
        description: z.string().optional(),
        tagHint: z.string().optional()
      })).optional(),
      edges: z.array(z.object({
        src: z.string(),
        dst: z.string(),
        kind: z.string(),
        weight: z.number().optional()
      })).optional(),
      replaceEdges: z.boolean().optional()
    },
    async args => {
      // Resolve placement ids up-front so the ghost preview uses real ids
      // (renderer-side dedupe).
      const resolvedPlacements: PlanPlacement[] = [];
      let missing = 0;
      for (const p of args.placements) {
        const a = resolveArtifact(world, p.id);
        if (!a) { missing++; continue; }
        resolvedPlacements.push({ id: a.id, x: p.x, y: p.y, z: p.z });
      }
      if (resolvedPlacements.length === 0) {
        return { content: [{ type: 'text' as const, text: 'error: no resolvable placements in plan' }], isError: true };
      }

      const id = nanoid(10);
      const now = Date.now();
      const plan: PendingLayoutPlan = {
        id,
        label: args.label,
        placements: resolvedPlacements,
        clusters: args.clusters as PlanCluster[] | undefined,
        edges: args.edges as PlanEdge[] | undefined,
        replaceEdges: args.replaceEdges,
        createdAt: now,
        expiresAt: now + PLAN_TIMEOUT_MS
      };
      world.registerPendingPlan(plan);
      bus.emit('world', { type: 'plan.proposed', plan });

      // Auto-commit on timeout. If the plan is committed or rejected earlier
      // this timer becomes a no-op (the plan is gone from the map).
      setTimeout(() => {
        if (world.hasPendingPlan(id)) {
          void commitPlan(world, id).catch(err => {
            console.warn('[layout-tools] auto-commit failed', err);
          });
        }
      }, PLAN_TIMEOUT_MS);

      return {
        content: [{
          type: 'text' as const,
          text: `proposed plan ${id} "${args.label}" — ${resolvedPlacements.length} placements${args.clusters?.length ? `, ${args.clusters.length} clusters` : ''}${args.edges?.length ? `, ${args.edges.length} edges` : ''}${missing ? ` · ${missing} ids missing` : ''} · auto-commits in ${PLAN_TIMEOUT_MS / 1000}s unless user rejects`
        }]
      };
    }
  );

  const commitLayoutPlan = tool(
    'commit_layout_plan',
    'Commit a previously-proposed plan, applying its placements/clusters/edges. Idempotent: re-committing the same id is a no-op.',
    { id: z.string() },
    async args => {
      const result = await commitPlan(world, args.id);
      if (!result) {
        return { content: [{ type: 'text' as const, text: `no such pending plan ${args.id}` }], isError: true };
      }
      return { content: [{ type: 'text' as const, text: `committed plan ${args.id}: ${result}` }] };
    }
  );

  const rejectLayoutPlan = tool(
    'reject_layout_plan',
    'Reject a previously-proposed plan. The ghost preview disappears; nothing is moved.',
    { id: z.string() },
    async args => {
      const plan = world.removePendingPlan(args.id);
      if (!plan) {
        return { content: [{ type: 'text' as const, text: `no such pending plan ${args.id}` }], isError: true };
      }
      bus.emit('world', { type: 'plan.rejected', id: args.id, reason: 'user' });
      return { content: [{ type: 'text' as const, text: `rejected plan ${args.id} "${plan.label}"` }] };
    }
  );

  return createSdkMcpServer({
    name: 'layout-tools',
    version: '0.1.0',
    tools: [placeOnCanvas, drawEdge, removeEdge, listEdges, updateEdge, createCluster, applyLayoutPlan, proposeLayoutPlan, commitLayoutPlan, rejectLayoutPlan]
  });
}

/**
 * Execute a layout plan (or its raw-args equivalent). Shared between
 * `apply_layout_plan` (back-compat fast path) and `commit_layout_plan`.
 * Returns the one-line summary string.
 */
async function executePlan(
  world: WorldState,
  plan: { placements: PlanPlacement[]; clusters?: PlanCluster[]; edges?: PlanEdge[]; replaceEdges?: boolean }
): Promise<string> {
  // 1. Placements.
  const placedPositions: Array<{ id: string; x: number; y: number; z: number }> = [];
  let pinnedSkipped = 0;
  let missing = 0;
  for (const p of plan.placements) {
    const a = resolveArtifact(world, p.id);
    if (!a) { missing++; continue; }
    if (a.pinned) { pinnedSkipped++; continue; }
    await world.setArtifactPosition(a.id, { x: p.x, y: p.y, z: p.z }, false);
    placedPositions.push({ id: a.id, x: p.x, y: p.y, z: p.z });
    bus.emit('world', { type: 'aura.flash', artifactId: a.id, agentRole: 'layout', expiresAt: Date.now() + 1500 });
  }
  if (placedPositions.length > 0) {
    bus.emit('world', { type: 'layout.updated', positions: placedPositions });
  }

  // 2. Replace existing layout-created edges.
  let edgesRemoved = 0;
  if (plan.replaceEdges) {
    for (const e of world.getAllEdges()) {
      if (e.createdBy === 'layout') {
        await world.removeEdge(e.id);
        bus.emit('world', { type: 'edge.removed', id: e.id });
        edgesRemoved++;
      }
    }
  }

  // 3. New edges.
  let edgesAdded = 0;
  let edgesDroppedUnknownKind = 0;
  if (plan.edges) {
    for (const e of plan.edges) {
      const srcA = resolveArtifact(world, e.src);
      const dstA = resolveArtifact(world, e.dst);
      if (!srcA || !dstA || srcA.id === dstA.id) continue;
      if (!world.hasLinkType(e.kind)) { edgesDroppedUnknownKind++; continue; }
      const edge: Edge = {
        id: nanoid(10),
        src: srcA.id,
        dst: dstA.id,
        kind: e.kind,
        weight: e.weight ?? 1,
        createdBy: 'layout'
      };
      await world.upsertEdge(edge);
      bus.emit('world', { type: 'edge.upserted', edge });
      edgesAdded++;
    }
  }

  // 4. Clusters.
  let clustersCreated = 0;
  let clustersDropped = 0;
  if (plan.clusters) {
    for (const c of plan.clusters) {
      const result = await makeCluster(world, c);
      if (result) clustersCreated++; else clustersDropped++;
    }
  }

  return [
    `placed ${placedPositions.length}`,
    pinnedSkipped ? `skipped ${pinnedSkipped} pinned` : null,
    missing ? `${missing} missing` : null,
    clustersCreated ? `${clustersCreated} clusters` : null,
    clustersDropped ? `${clustersDropped} clusters dropped (unresolved members)` : null,
    edgesAdded ? `+${edgesAdded} edges` : null,
    edgesRemoved ? `-${edgesRemoved} edges` : null,
    edgesDroppedUnknownKind ? `${edgesDroppedUnknownKind} edges dropped (unknown link_type)` : null
  ].filter(Boolean).join(' · ');
}

/**
 * Commit a pending plan by id. Idempotent — removing the plan from the map
 * is the de-dupe check. Used by both the user-driven commit_layout_plan tool
 * and the timeout auto-commit.
 */
export async function commitPlan(world: WorldState, id: string): Promise<string | null> {
  const plan = world.removePendingPlan(id);
  if (!plan) return null;
  const summary = await executePlan(world, {
    placements: plan.placements,
    clusters: plan.clusters,
    edges: plan.edges,
    replaceEdges: plan.replaceEdges
  });
  bus.emit('world', { type: 'plan.committed', id });
  return summary;
}

/** Reject a pending plan by id (user action). Returns true if the plan existed. */
export function rejectPlan(world: WorldState, id: string): boolean {
  const plan = world.removePendingPlan(id);
  if (!plan) return false;
  bus.emit('world', { type: 'plan.rejected', id, reason: 'user' });
  return true;
}

/**
 * Build and persist a cluster artifact. Shared by `create_cluster` and
 * `apply_layout_plan` so they emit identical events and short-name logic.
 *
 * Resolves member references id-or-shortName, drops unresolved ones, and
 * returns `null` if fewer than 2 valid members remain — that way a cluster
 * never lands at world origin because the model hallucinated ids.
 */
async function makeCluster(
  world: WorldState,
  args: { label: string; artifactIds: string[]; description?: string; tagHint?: string }
): Promise<Artifact | null> {
  // Resolve id-or-shortName once; keep only the real ids and drop anything
  // we can't resolve. Without this a cluster whose members are bad strings
  // ends up with centroid (0,0,0) AND `spec.refs` full of garbage, so the
  // renderer's useFrame never finds a live position and the cluster sits
  // stuck at the origin while its supposed members are placed elsewhere.
  const resolvedIds: string[] = [];
  let cx = 0, cy = 0, cz = 0, n = 0;
  const seen = new Set<string>();
  const unresolved: string[] = [];
  for (const ref of args.artifactIds) {
    const a = resolveArtifact(world, ref);
    if (!a) { unresolved.push(ref); continue; }
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    resolvedIds.push(a.id);
    if (a.position) {
      cx += a.position.x; cy += a.position.y; cz += a.position.z; n++;
    }
  }

  if (resolvedIds.length < 2) {
    console.warn(
      `[layout-tools] cluster "${args.label}" skipped: ${resolvedIds.length}/${args.artifactIds.length} members resolved`,
      unresolved.length ? `unresolved: ${unresolved.join(', ')}` : ''
    );
    bus.emit('agentLog', {
      agentRole: 'layout',
      agentId: 'layout',
      kind: 'note',
      ts: Date.now(),
      text: `⚠ cluster "${args.label}" dropped — only ${resolvedIds.length}/${args.artifactIds.length} member ids resolved${unresolved.length ? ` (unresolved: ${unresolved.slice(0, 3).join(', ')}${unresolved.length > 3 ? '…' : ''})` : ''}`
    });
    return null;
  }

  if (n > 0) { cx /= n; cy /= n; cz /= n; }

  if (unresolved.length > 0) {
    console.warn(`[layout-tools] cluster "${args.label}" dropped ${unresolved.length} unresolved member refs:`, unresolved);
  }

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
      refs: resolvedIds,
      tokens: Math.ceil((args.description?.length ?? 0) / 4)
    },
    position: { x: cx, y: cy, z: cz }
  };
  await world.upsertArtifact(cluster);
  bus.emit('world', { type: 'artifact.upserted', artifact: cluster });
  return cluster;
}

export const LAYOUT_TOOL_NAMES = [
  'mcp__layout-tools__place_on_canvas',
  'mcp__layout-tools__draw_edge',
  'mcp__layout-tools__remove_edge',
  'mcp__layout-tools__list_edges',
  'mcp__layout-tools__update_edge',
  'mcp__layout-tools__create_cluster',
  'mcp__layout-tools__apply_layout_plan',
  'mcp__layout-tools__propose_layout_plan',
  'mcp__layout-tools__commit_layout_plan',
  'mcp__layout-tools__reject_layout_plan'
] as const;
