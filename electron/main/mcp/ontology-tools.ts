/**
 * ontology-tools — MCP server exposing the typed link-type registry.
 *
 * Built-in link types: derives, references, contradicts, groups-with.
 * Agents (and ultimately users) extend the ontology by calling
 * `register_link_type` with a new id + color + label.
 *
 * Reference: B02 in BACKLOG-v2.md, themes T3 + tradeoff TR4. Inspired by
 * Palantir-Foundry-style typed Object/Link/Action ontology — a typed link
 * registry consistently beats free-form tag soup at making the canvas
 * navigable to both humans and agents.
 *
 * The registry is single-source-of-truth at runtime; the renderer reads
 * colors here, the layout-tools validates `Edge.kind` against it, and the
 * Inspector chip palette will read its options here in a future card.
 */
import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import type { WorldState } from '../world-state';
import type { LinkType } from '../../../shared/types';
import { bus } from '../event-bus';

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;
const ID_RE = /^[a-z][a-z0-9-]{0,31}$/;

export function buildOntologyTools(world: WorldState) {
  const listLinkTypes = tool(
    'list_link_types',
    'List every registered link type. Returns an array of { id, label, color, isDirected, isBuiltin }. Call this before draw_edge / update_edge / register_link_type so the agent knows what is already available.',
    {},
    async () => {
      const types = world.listLinkTypes();
      const rows = types.map(t => ({
        id: t.id, label: t.label, color: t.color,
        icon: t.icon ?? null,
        isDirected: t.isDirected, isBuiltin: t.isBuiltin
      }));
      return {
        content: [{
          type: 'text' as const,
          text: `${rows.length} link types\n${JSON.stringify(rows, null, 2)}`
        }]
      };
    }
  );

  const registerLinkType = tool(
    'register_link_type',
    'Register a new link type (e.g. "depends-on", "responds-to", "cites"). Use lowercase-kebab-case ids — they are stable and used as Edge.kind. Color is hex #RRGGBB. If the id is already taken, returns an error.',
    {
      id: z.string().describe('Stable lowercase-kebab-case id (e.g. "depends-on"). Max 32 chars, must start with a letter.'),
      label: z.string().describe('Human-readable label (e.g. "Depends on").'),
      color: z.string().describe('Hex color #RRGGBB used by the edge renderer.'),
      icon: z.string().optional().describe('Optional one-character glyph or emoji.'),
      isDirected: z.boolean().default(true).describe('Whether src→dst direction is meaningful (default true).')
    },
    async args => {
      if (!ID_RE.test(args.id)) {
        return { content: [{ type: 'text' as const, text: `error: id "${args.id}" must match lowercase-kebab pattern (start with a letter, ≤32 chars).` }], isError: true };
      }
      if (!HEX_COLOR_RE.test(args.color)) {
        return { content: [{ type: 'text' as const, text: `error: color "${args.color}" must be #RRGGBB hex.` }], isError: true };
      }
      if (world.hasLinkType(args.id)) {
        return { content: [{ type: 'text' as const, text: `error: link type "${args.id}" already exists. Use update_link_type to modify.` }], isError: true };
      }
      const t: LinkType = {
        id: args.id,
        label: args.label,
        color: args.color,
        icon: args.icon,
        isDirected: args.isDirected,
        isBuiltin: false,
        createdAt: Date.now()
      };
      await world.registerLinkType(t);
      bus.emit('world', { type: 'link-type.upserted', linkType: t });
      return { content: [{ type: 'text' as const, text: `registered link_type "${args.id}" (${args.label})` }] };
    }
  );

  const updateLinkType = tool(
    'update_link_type',
    'Update an existing link type. Built-in types can have label/color/icon/isDirected tuned but cannot be deleted. Pass only fields you want to change.',
    {
      id: z.string(),
      label: z.string().optional(),
      color: z.string().optional().describe('Hex #RRGGBB.'),
      icon: z.string().nullable().optional().describe('Pass null to clear the icon, omit to leave unchanged.'),
      isDirected: z.boolean().optional()
    },
    async args => {
      const existing = world.getLinkType(args.id);
      if (!existing) {
        return { content: [{ type: 'text' as const, text: `error: no link type "${args.id}". Call list_link_types to discover.` }], isError: true };
      }
      if (args.color !== undefined && !HEX_COLOR_RE.test(args.color)) {
        return { content: [{ type: 'text' as const, text: `error: color "${args.color}" must be #RRGGBB hex.` }], isError: true };
      }
      const patch: Partial<Pick<LinkType, 'label' | 'color' | 'icon' | 'isDirected'>> = {};
      if (args.label !== undefined) patch.label = args.label;
      if (args.color !== undefined) patch.color = args.color;
      if (args.icon !== undefined) patch.icon = args.icon ?? undefined;
      if (args.isDirected !== undefined) patch.isDirected = args.isDirected;
      const updated = await world.updateLinkType(args.id, patch);
      if (updated) bus.emit('world', { type: 'link-type.upserted', linkType: updated });
      return { content: [{ type: 'text' as const, text: `updated link_type "${args.id}"` }] };
    }
  );

  const deleteLinkType = tool(
    'delete_link_type',
    'Delete a non-built-in link type. Built-ins (derives, references, contradicts, groups-with) cannot be deleted. Edges that still reference the type will continue to exist but render with a fallback color.',
    { id: z.string() },
    async args => {
      const ok = await world.deleteLinkType(args.id);
      if (!ok) {
        return { content: [{ type: 'text' as const, text: `error: cannot delete "${args.id}" (built-in or missing).` }], isError: true };
      }
      bus.emit('world', { type: 'link-type.removed', id: args.id });
      return { content: [{ type: 'text' as const, text: `deleted link_type "${args.id}"` }] };
    }
  );

  return createSdkMcpServer({
    name: 'ontology-tools',
    version: '0.1.0',
    tools: [listLinkTypes, registerLinkType, updateLinkType, deleteLinkType]
  });
}

export const ONTOLOGY_TOOL_NAMES = [
  'mcp__ontology-tools__list_link_types',
  'mcp__ontology-tools__register_link_type',
  'mcp__ontology-tools__update_link_type',
  'mcp__ontology-tools__delete_link_type'
] as const;
