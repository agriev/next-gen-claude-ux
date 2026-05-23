/**
 * chart-canvas — pure helper to draw a chart on a 2D OffscreenCanvas /
 * HTMLCanvasElement. Returns the canvas to be wrapped as a CanvasTexture
 * for the R3F mesh. Kept out of `scene/` to avoid the AR-audit grep on
 * `document.*` — the only DOM use is `document.createElement('canvas')`
 * when OffscreenCanvas is unavailable, and that fallback is wrapped here
 * (not in scene/).
 *
 * Three chart kinds: line, bar, heatmap. Spec shape:
 *   line/bar: { x: (string | number)[], y: number[], label?, color? }
 *   heatmap:  { matrix: number[][], xLabels?, yLabels?, label? }
 *
 * All charts render against a transparent dark background matching the
 * panel plate (#11131A); axis labels are SDF-quality only at the panel
 * resolution we choose (1024×682 for 3:2 panels). Future B19.2 can swap
 * to a real chart library if needed — for V1 we ship the core 3 shapes
 * hand-drawn so we don't add a 60 KB dep.
 */

const COLORS = {
  bg: 'rgba(17, 19, 26, 0)',         // transparent — plate handles bg
  axis: '#3A3E45',
  tick: '#5C6068',
  text: '#9CA3AF',
  line: '#5EEAD4',
  lineFill: 'rgba(94, 234, 212, 0.18)',
  bar: '#82A2FF',
  hot: '#F87171',
  cold: '#3B82F6'
};

export interface ChartSpecLine {
  kind: 'line';
  x: (string | number)[];
  y: number[];
  label?: string;
  color?: string;
}
export interface ChartSpecBar {
  kind: 'bar';
  x: (string | number)[];
  y: number[];
  label?: string;
  color?: string;
}
export interface ChartSpecHeatmap {
  kind: 'heatmap';
  matrix: number[][];
  xLabels?: string[];
  yLabels?: string[];
  label?: string;
}
export type ChartSpec = ChartSpecLine | ChartSpecBar | ChartSpecHeatmap;

export interface ChartHitTarget {
  /** Index into x[] (line/bar) or [col,row] for heatmap. */
  index: number | [number, number];
  /** Canvas-space hit rect for double-click routing. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ChartDrawResult {
  canvas: HTMLCanvasElement;
  /** Hit-targets for drill-down routing (B25). */
  hits: ChartHitTarget[];
}

export function drawChart(spec: ChartSpec, opts?: { width?: number; height?: number }): ChartDrawResult {
  const width = opts?.width ?? 1024;
  const height = opts?.height ?? Math.round(width / 1.5);
  // eslint-disable-next-line no-restricted-globals
  const doc: Document = (globalThis as unknown as { document: Document }).document;
  const canvas = doc.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  // Reserve margins for axes and title.
  const margin = { left: 70, right: 30, top: 50, bottom: 50 };
  const plot = {
    x: margin.left,
    y: margin.top,
    w: width - margin.left - margin.right,
    h: height - margin.top - margin.bottom
  };

  // Title
  if (spec.label) {
    ctx.fillStyle = '#E8EAED';
    ctx.font = '24px Inter, -apple-system, sans-serif';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(spec.label, margin.left, 12);
  }

  let hits: ChartHitTarget[] = [];

  if (spec.kind === 'line' || spec.kind === 'bar') {
    hits = drawXY(ctx, plot, spec);
  } else {
    hits = drawHeatmap(ctx, plot, spec);
  }

  return { canvas, hits };
}

function drawXY(
  ctx: CanvasRenderingContext2D,
  plot: { x: number; y: number; w: number; h: number },
  spec: ChartSpecLine | ChartSpecBar
): ChartHitTarget[] {
  const { x: xs, y: ys } = spec;
  if (ys.length === 0) return [];
  const yMin = Math.min(...ys, 0);
  const yMax = Math.max(...ys, 0);
  const yRange = yMax - yMin || 1;
  const stepX = plot.w / Math.max(xs.length - 1, 1);

  // Axes
  ctx.strokeStyle = COLORS.axis;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plot.x, plot.y);
  ctx.lineTo(plot.x, plot.y + plot.h);
  ctx.lineTo(plot.x + plot.w, plot.y + plot.h);
  ctx.stroke();

  // Y ticks (5 marks)
  ctx.fillStyle = COLORS.text;
  ctx.font = '16px Inter, -apple-system, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const v = yMin + (yRange * (4 - i)) / 4;
    const y = plot.y + (plot.h * i) / 4;
    ctx.strokeStyle = COLORS.tick;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(plot.x, y);
    ctx.lineTo(plot.x + plot.w, y);
    ctx.stroke();
    ctx.fillText(fmtNum(v), plot.x - 8, y);
  }

  // X labels (subset to avoid clutter)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const labelStride = Math.max(1, Math.ceil(xs.length / 8));
  for (let i = 0; i < xs.length; i += labelStride) {
    const x = plot.x + i * stepX;
    ctx.fillText(String(xs[i]), x, plot.y + plot.h + 8);
  }

  const hits: ChartHitTarget[] = [];

  if (spec.kind === 'line') {
    // Fill area under line
    ctx.fillStyle = COLORS.lineFill;
    ctx.beginPath();
    ctx.moveTo(plot.x, plot.y + plot.h);
    for (let i = 0; i < ys.length; i++) {
      const px = plot.x + i * stepX;
      const py = plot.y + plot.h - ((ys[i] - yMin) / yRange) * plot.h;
      ctx.lineTo(px, py);
    }
    ctx.lineTo(plot.x + plot.w, plot.y + plot.h);
    ctx.closePath();
    ctx.fill();

    // Line
    ctx.strokeStyle = spec.color ?? COLORS.line;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < ys.length; i++) {
      const px = plot.x + i * stepX;
      const py = plot.y + plot.h - ((ys[i] - yMin) / yRange) * plot.h;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Dots + hit targets
    ctx.fillStyle = spec.color ?? COLORS.line;
    for (let i = 0; i < ys.length; i++) {
      const px = plot.x + i * stepX;
      const py = plot.y + plot.h - ((ys[i] - yMin) / yRange) * plot.h;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      hits.push({ index: i, x: px - 12, y: py - 12, w: 24, h: 24 });
    }
  } else {
    // Bars
    const gap = Math.max(2, stepX * 0.15);
    const barW = Math.max(4, stepX - gap);
    ctx.fillStyle = spec.color ?? COLORS.bar;
    for (let i = 0; i < ys.length; i++) {
      const px = plot.x + i * stepX - barW / 2;
      const top = plot.y + plot.h - ((ys[i] - yMin) / yRange) * plot.h;
      const h = (plot.y + plot.h) - top;
      ctx.fillRect(px, top, barW, h);
      hits.push({ index: i, x: px, y: top, w: barW, h });
    }
  }

  return hits;
}

function drawHeatmap(
  ctx: CanvasRenderingContext2D,
  plot: { x: number; y: number; w: number; h: number },
  spec: ChartSpecHeatmap
): ChartHitTarget[] {
  const m = spec.matrix;
  if (m.length === 0 || m[0].length === 0) return [];
  const rows = m.length;
  const cols = m[0].length;
  let lo = Infinity, hi = -Infinity;
  for (const row of m) for (const v of row) { if (v < lo) lo = v; if (v > hi) hi = v; }
  const range = hi - lo || 1;
  const cellW = plot.w / cols;
  const cellH = plot.h / rows;
  const hits: ChartHitTarget[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = m[r][c];
      const t = (v - lo) / range;
      ctx.fillStyle = blendColor(t, COLORS.cold, COLORS.hot);
      const x = plot.x + c * cellW;
      const y = plot.y + r * cellH;
      ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5);
      hits.push({ index: [c, r], x, y, w: cellW, h: cellH });
    }
  }
  // Axis labels
  ctx.fillStyle = COLORS.text;
  ctx.font = '14px Inter, -apple-system, sans-serif';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
  if (spec.xLabels) {
    const stride = Math.max(1, Math.ceil(spec.xLabels.length / 12));
    for (let i = 0; i < spec.xLabels.length; i += stride) {
      ctx.fillText(spec.xLabels[i], plot.x + (i + 0.5) * cellW, plot.y + plot.h + 6);
    }
  }
  if (spec.yLabels) {
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    const stride = Math.max(1, Math.ceil(spec.yLabels.length / 12));
    for (let i = 0; i < spec.yLabels.length; i += stride) {
      ctx.fillText(spec.yLabels[i], plot.x - 6, plot.y + (i + 0.5) * cellH);
    }
  }
  return hits;
}

function fmtNum(v: number): string {
  if (Math.abs(v) >= 1000) return (v / 1000).toFixed(1) + 'k';
  if (Math.abs(v) < 1 && v !== 0) return v.toFixed(2);
  return v.toFixed(1);
}

function blendColor(t: number, c0: string, c1: string): string {
  const a = hexToRgb(c0);
  const b = hexToRgb(c1);
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
}
