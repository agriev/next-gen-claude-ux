import plantumlEncoder from 'plantuml-encoder';

export type DiagramBlock =
  | { kind: 'plantuml'; source: string; url: string }
  | { kind: 'mermaid'; source: string };

export interface BodySegment {
  type: 'text' | 'diagram';
  text?: string;
  diagram?: DiagramBlock;
}

const PLANTUML_RE = /@startuml[\s\S]*?@enduml/g;
const MERMAID_RE = /```mermaid\s*\n([\s\S]*?)\n```/g;
const PLANTUML_FENCED_RE = /```plantuml\s*\n([\s\S]*?)\n```/g;

export function plantUmlUrl(source: string, format: 'svg' | 'png' = 'svg'): string {
  const encoded = plantumlEncoder.encode(source);
  return `https://www.plantuml.com/plantuml/${format}/${encoded}`;
}

export function hasDiagram(body: string): boolean {
  return /@startuml/.test(body) || /```mermaid/.test(body) || /```plantuml/.test(body);
}

/**
 * Split body into alternating text and diagram segments, preserving order.
 */
export function splitBody(body: string): BodySegment[] {
  const matches: Array<{ start: number; end: number; segment: DiagramBlock }> = [];

  // Plantuml @startuml/@enduml
  for (const m of body.matchAll(PLANTUML_RE)) {
    if (m.index == null) continue;
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      segment: { kind: 'plantuml', source: m[0], url: plantUmlUrl(m[0]) }
    });
  }
  // ```plantuml fenced
  for (const m of body.matchAll(PLANTUML_FENCED_RE)) {
    if (m.index == null) continue;
    const src = m[1].trim();
    const wrapped = src.startsWith('@startuml') ? src : `@startuml\n${src}\n@enduml`;
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      segment: { kind: 'plantuml', source: wrapped, url: plantUmlUrl(wrapped) }
    });
  }
  // ```mermaid fenced
  for (const m of body.matchAll(MERMAID_RE)) {
    if (m.index == null) continue;
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      segment: { kind: 'mermaid', source: m[1].trim() }
    });
  }

  if (matches.length === 0) return [{ type: 'text', text: body }];

  matches.sort((a, b) => a.start - b.start);
  const segments: BodySegment[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start > cursor) {
      const text = body.slice(cursor, m.start);
      if (text.trim()) segments.push({ type: 'text', text });
    }
    segments.push({ type: 'diagram', diagram: m.segment });
    cursor = m.end;
  }
  if (cursor < body.length) {
    const text = body.slice(cursor);
    if (text.trim()) segments.push({ type: 'text', text });
  }
  return segments;
}
