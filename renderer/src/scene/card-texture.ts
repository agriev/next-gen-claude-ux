import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three';
import type { Artifact, ArtifactKind } from '@shared/types';

interface Palette {
  bg: string;
  text: string;
  muted: string;
  accent: string;
  border: string;
  mono: boolean;
}

const PALETTE: Record<ArtifactKind, Palette> = {
  doc:     { bg: '#F4F4F2', text: '#0A0B0E', muted: '#5A5F68', accent: '#5EEAD4', border: '#22252B', mono: false },
  note:    { bg: '#FFF7DB', text: '#1A1500', muted: '#7A6A30', accent: '#FBBF24', border: '#FBBF24', mono: false },
  code:    { bg: '#0F1418', text: '#E8EAED', muted: '#8A8F98', accent: '#5EEAD4', border: '#5EEAD4', mono: true  },
  log:     { bg: '#14161B', text: '#8A8F98', muted: '#5A5F68', accent: '#5A5F68', border: '#2A2D34', mono: true  },
  image:   { bg: '#F4F4F2', text: '#0A0B0E', muted: '#5A5F68', accent: '#5EEAD4', border: '#22252B', mono: false },
  link:    { bg: '#1E1A2E', text: '#E8EAED', muted: '#A78BFA', accent: '#A78BFA', border: '#A78BFA', mono: false },
  cluster: { bg: '#1A1530', text: '#E8EAED', muted: '#8A8F98', accent: '#A78BFA', border: '#A78BFA', mono: false },
  // Frame is rendered via R3F mesh — texture not used. Stub palette for type completeness.
  frame:   { bg: '#101418', text: '#E8EAED', muted: '#8A8F98', accent: '#5EEAD4', border: '#5EEAD4', mono: false }
};

const TEX_W = 1024;
const TEX_H = 640;
const PAD = 32;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const para of text.split('\n')) {
    if (para.length === 0) { lines.push(''); continue; }
    const words = para.split(/\s+/);
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      const w = ctx.measureText(test).width;
      if (w > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

export function makeCardTexture(artifact: Artifact): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext('2d')!;
  const p = PALETTE[artifact.kind];

  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  ctx.strokeStyle = p.border;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, TEX_W - 4, TEX_H - 4);

  ctx.fillStyle = p.muted;
  ctx.font = '28px JetBrains Mono, SF Mono, Menlo, monospace';
  ctx.textBaseline = 'top';
  const kindLabel = artifact.kind.toUpperCase();
  ctx.fillText(kindLabel, PAD, PAD - 6);
  ctx.fillStyle = p.muted;
  ctx.globalAlpha = 0.5;
  const kindLabelW = ctx.measureText(kindLabel).width;
  ctx.fillText(`· @${artifact.shortName}`, PAD + kindLabelW + 12, PAD - 6);
  ctx.globalAlpha = 1;

  ctx.fillStyle = p.text;
  ctx.font = 'bold 64px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(truncate(artifact.title, 30), PAD, PAD + 36);

  ctx.fillStyle = p.muted;
  ctx.globalAlpha = 0.35;
  ctx.fillRect(PAD, PAD + 124, TEX_W - 2 * PAD, 2);
  ctx.globalAlpha = 1;

  const bodyFont = p.mono
    ? '34px JetBrains Mono, SF Mono, Menlo, monospace'
    : '34px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.font = bodyFont;
  ctx.fillStyle = p.muted;
  const bodyMaxW = TEX_W - 2 * PAD;
  const hasDiagram = /@startuml|```mermaid|```plantuml/.test(artifact.body);
  const renderedBody = hasDiagram
    ? '📊 diagram inside — open Inspector (double-click) to render\n\n' + artifact.body.replace(/(@startuml[\s\S]*?@enduml|```mermaid[\s\S]*?```|```plantuml[\s\S]*?```)/g, '〔diagram block〕')
    : artifact.body;
  const lines = wrapText(ctx, renderedBody || '(empty)', bodyMaxW);
  const bodyTopY = PAD + 144;
  const lineH = 42;
  const specReserved = artifact.spec?.summary ? 60 : 0;
  const maxLines = Math.floor((TEX_H - bodyTopY - PAD - specReserved) / lineH);
  for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
    ctx.fillText(lines[i], PAD, bodyTopY + i * lineH);
  }
  if (lines.length > maxLines) {
    ctx.fillStyle = p.muted;
    ctx.globalAlpha = 0.5;
    ctx.fillText('…', PAD, bodyTopY + maxLines * lineH);
    ctx.globalAlpha = 1;
  }

  if (artifact.spec?.summary) {
    ctx.fillStyle = p.accent;
    ctx.font = 'italic 26px Inter, sans-serif';
    ctx.fillText(truncate(artifact.spec.summary, 60), PAD, TEX_H - PAD - 28);
  }

  if (artifact.state === 'streaming' || artifact.state === 'updating') {
    ctx.fillStyle = p.accent;
    ctx.fillRect(PAD, TEX_H - 8, TEX_W - 2 * PAD, 4);
  }

  const tex = new CanvasTexture(canvas);
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  tex.colorSpace = SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
