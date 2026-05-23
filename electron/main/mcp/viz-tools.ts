/**
 * viz-tools — MCP server for the Panel primitive (B17).
 *
 * A Panel is a 2D rectangular surface in 3D that hosts a widget (chart,
 * flow, timeline, graph-3d). This server creates / updates / removes panels
 * and attaches widgets. Concrete widget rendering arrives in later cards
 * (B19/B20/B22/B23); for now widget kind=`empty` shows a placeholder so the
 * panel is visible and positionable.
 *
 * Reference: CONCEPT.md §1.2 (Panel primitive), WS-12 horseshoe layout
 * needs slot containers, [BACKLOG-v2.md B17].
 *
 * AR-readiness: every panel has an `anchor` field defaulting to `'world'`.
 * E3 visionOS port can flip it to `'desk' | 'head' | 'hand'` without a
 * migration.
 */
import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import type { WorldState } from '../world-state';
import type { Panel, PanelWidget, PanelWidgetKind, AnchorMode } from '../../../shared/types';
import { bus } from '../event-bus';

const WIDGET_KINDS: PanelWidgetKind[] = ['empty', 'chart', 'flow', 'timeline', 'graph-3d'];
const ANCHOR_MODES: AnchorMode[] = ['world', 'desk', 'head', 'hand'];

export function buildVizTools(world: WorldState) {
  const createPanel = tool(
    'create_panel',
    'Create a new panel — a 2D rectangular surface placed in 3D space that can later host a widget. Default size 3.0×2.0 world units (~3:2 aspect). Position is in world coordinates (x[-14,14] y[-2,4] z[-8,8]). Default anchor "world" (desk/head/hand reserved for XR builds).',
    {
      title: z.string().describe('Title displayed at the top of the panel.'),
      x: z.number(),
      y: z.number(),
      z: z.number(),
      width: z.number().optional().describe('World units. Default 3.0.'),
      height: z.number().optional().describe('World units. Default 2.0.'),
      widget: z.enum(WIDGET_KINDS).optional().describe('Initial widget kind (default "empty").'),
      anchor: z.enum(ANCHOR_MODES).optional().describe('Anchor mode (default "world").')
    },
    async args => {
      const id = nanoid(10);
      const now = Date.now();
      const panel: Panel = {
        id,
        boardId: world.getActiveBoardId(),
        title: args.title,
        position: { x: args.x, y: args.y, z: args.z },
        size: { w: args.width ?? 3.0, h: args.height ?? 2.0 },
        widget: { kind: (args.widget ?? 'empty') as PanelWidgetKind, spec: {} },
        anchor: (args.anchor ?? 'world') as AnchorMode,
        createdAt: now,
        updatedAt: now,
        createdBy: 'layout'
      };
      await world.upsertPanel(panel);
      bus.emit('world', { type: 'panel.upserted', panel });
      return { content: [{ type: 'text' as const, text: `created panel ${id} "${args.title}" at (${args.x.toFixed(1)},${args.y.toFixed(1)},${args.z.toFixed(1)})` }] };
    }
  );

  const updatePanel = tool(
    'update_panel',
    'Update a panel\'s title, position, or size. Pass only fields you want to change.',
    {
      id: z.string(),
      title: z.string().optional(),
      x: z.number().optional(),
      y: z.number().optional(),
      z: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      pinned: z.boolean().optional()
    },
    async args => {
      const existing = world.getPanel(args.id);
      if (!existing) {
        return { content: [{ type: 'text' as const, text: `error: no panel ${args.id}` }], isError: true };
      }
      const updated: Panel = {
        ...existing,
        title: args.title ?? existing.title,
        position: {
          x: args.x ?? existing.position.x,
          y: args.y ?? existing.position.y,
          z: args.z ?? existing.position.z
        },
        size: {
          w: args.width ?? existing.size.w,
          h: args.height ?? existing.size.h
        },
        pinned: args.pinned ?? existing.pinned,
        updatedAt: Date.now()
      };
      await world.upsertPanel(updated);
      bus.emit('world', { type: 'panel.upserted', panel: updated });
      return { content: [{ type: 'text' as const, text: `updated panel ${args.id}` }] };
    }
  );

  const removePanel = tool(
    'remove_panel',
    'Remove a panel by id.',
    { id: z.string() },
    async args => {
      const existing = world.getPanel(args.id);
      if (!existing) {
        return { content: [{ type: 'text' as const, text: `error: no panel ${args.id}` }], isError: true };
      }
      await world.removePanel(args.id);
      bus.emit('world', { type: 'panel.removed', id: args.id });
      return { content: [{ type: 'text' as const, text: `removed panel ${args.id}` }] };
    }
  );

  const attachWidget = tool(
    'attach_widget',
    'Set or replace the widget hosted on a panel. The spec shape depends on widget kind — widget renderers (chart/flow/timeline/graph-3d) arrive in later cards; for now "empty" is the only one that renders meaningful content. The spec is passed through unchanged so future widget kinds work without an MCP schema change.',
    {
      id: z.string(),
      widget: z.enum(WIDGET_KINDS).describe('Widget kind to host on the panel.'),
      spec: z.record(z.string(), z.unknown()).optional().describe('Widget-specific spec object (free-form).')
    },
    async args => {
      const existing = world.getPanel(args.id);
      if (!existing) {
        return { content: [{ type: 'text' as const, text: `error: no panel ${args.id}` }], isError: true };
      }
      const widget: PanelWidget = {
        kind: args.widget as PanelWidgetKind,
        spec: (args.spec ?? {}) as Record<string, unknown>
      };
      const updated: Panel = { ...existing, widget, updatedAt: Date.now() };
      await world.upsertPanel(updated);
      bus.emit('world', { type: 'panel.upserted', panel: updated });
      return { content: [{ type: 'text' as const, text: `attached ${args.widget} widget on panel ${args.id}` }] };
    }
  );

  const listPanels = tool(
    'list_panels',
    'List every panel on the active board. Use this to discover ids before update_panel / remove_panel / attach_widget.',
    {},
    async () => {
      const panels = world.getAllPanels();
      const rows = panels.map(p => ({
        id: p.id,
        title: p.title,
        position: p.position,
        size: p.size,
        widget: p.widget.kind,
        anchor: p.anchor,
        pinned: p.pinned ?? false
      }));
      return {
        content: [{
          type: 'text' as const,
          text: `${rows.length} panels\n${JSON.stringify(rows, null, 2)}`
        }]
      };
    }
  );

  return createSdkMcpServer({
    name: 'viz-tools',
    version: '0.1.0',
    tools: [createPanel, updatePanel, removePanel, attachWidget, listPanels]
  });
}

export const VIZ_TOOL_NAMES = [
  'mcp__viz-tools__create_panel',
  'mcp__viz-tools__update_panel',
  'mcp__viz-tools__remove_panel',
  'mcp__viz-tools__attach_widget',
  'mcp__viz-tools__list_panels'
] as const;
