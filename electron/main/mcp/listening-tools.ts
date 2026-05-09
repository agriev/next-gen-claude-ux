import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import type { ActionKind } from '../../../shared/types';

export interface ListeningCallbacks {
  onProposeAction: (params: {
    kind: ActionKind;
    text: string;
    references: string[];
    supersedes?: string;
  }) => string;
  onCancelAction: (id: string) => void;
  onUtteranceComplete: (text: string) => void;
}

export function buildListeningTools(cb: ListeningCallbacks) {
  const proposeAction = tool(
    'propose_action',
    'Propose a new worker action triggered by a complete utterance. The orchestrator runs it. Pass `supersedes` if this replaces an in-flight action that the user implicitly cancelled with this new utterance.',
    {
      kind: z.enum(['research', 'write', 'edit', 'clarify', 'reference']).describe('Type of work the user is asking for'),
      text: z.string().describe('The user-facing prompt for the worker'),
      references: z.array(z.string()).default([]).describe('Artifact shortNames the user mentioned (without @)'),
      supersedes: z.string().optional().describe('actionId of an in-flight action this implicitly cancels')
    },
    async args => {
      const id = cb.onProposeAction({
        kind: args.kind as ActionKind,
        text: args.text,
        references: args.references,
        supersedes: args.supersedes
      });
      return { content: [{ type: 'text' as const, text: `proposed action ${id}` }] };
    }
  );

  const cancelAction = tool(
    'cancel_action',
    'Cancel an in-flight action.',
    { id: z.string() },
    async args => {
      cb.onCancelAction(args.id);
      return { content: [{ type: 'text' as const, text: `cancel sent ${args.id}` }] };
    }
  );

  const markUtteranceComplete = tool(
    'mark_utterance_complete',
    'Notify that a logical utterance just finished, even if no action follows. Useful for ghost-preview UX.',
    { text: z.string() },
    async args => {
      cb.onUtteranceComplete(args.text);
      return { content: [{ type: 'text' as const, text: 'noted' }] };
    }
  );

  return createSdkMcpServer({
    name: 'listening-tools',
    version: '0.1.0',
    tools: [proposeAction, cancelAction, markUtteranceComplete]
  });
}

export const LISTENING_TOOL_NAMES = [
  'mcp__listening-tools__propose_action',
  'mcp__listening-tools__cancel_action',
  'mcp__listening-tools__mark_utterance_complete'
] as const;
