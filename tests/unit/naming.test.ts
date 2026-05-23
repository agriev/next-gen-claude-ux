/**
 * B15 — naming-agent heuristic.
 */
import { describe, it, expect } from 'vitest';
import { looksGeneric } from '../../electron/main/agents/naming';

describe('looksGeneric', () => {
  it('flags empty and common placeholders', () => {
    expect(looksGeneric('')).toBe(true);
    expect(looksGeneric('Untitled')).toBe(true);
    expect(looksGeneric('untitled')).toBe(true);
    expect(looksGeneric('Document')).toBe(true);
    expect(looksGeneric('Note')).toBe(true);
    expect(looksGeneric('The')).toBe(true);
    expect(looksGeneric('Artifact')).toBe(true);
  });

  it('flags numbered variants of placeholders', () => {
    expect(looksGeneric('Untitled-2')).toBe(true);
    expect(looksGeneric('Document-7')).toBe(true);
    expect(looksGeneric('Artifact-12')).toBe(true);
  });

  it('does not flag distinctive names', () => {
    expect(looksGeneric('Atlas')).toBe(false);
    expect(looksGeneric('Pulse')).toBe(false);
    expect(looksGeneric('Mission')).toBe(false);
    expect(looksGeneric('Glimpse')).toBe(false);
  });

  it('does not flag distinctive names with a trailing dedup suffix', () => {
    expect(looksGeneric('Atlas-2')).toBe(false);
    expect(looksGeneric('Mission-7')).toBe(false);
  });
});
