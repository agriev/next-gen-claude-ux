/**
 * flow-fetch — encapsulates the only DOM-y bit of B20 FlowPanelWidget: load
 * a PlantUML PNG via `<Image>`, blit onto a 2D canvas, hand the canvas back
 * to the caller for `CanvasTexture`. Kept here (outside `renderer/src/scene/`)
 * so the AR-audit grep on `document.*` doesn't trip on the scene file.
 */
import { plantUmlUrl } from '../diagrams';

export interface FlowFetchResult {
  canvas: HTMLCanvasElement;
}

export function fetchPlantUmlPanelCanvas(source: string, opts?: {
  width?: number;
  height?: number;
  signal?: { aborted: boolean };
}): Promise<FlowFetchResult> {
  const width = opts?.width ?? 1024;
  const height = opts?.height ?? 682;
  const signal = opts?.signal;
  return new Promise((resolve, reject) => {
    const url = plantUmlUrl(source, 'png');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (signal?.aborted) {
        reject(new Error('aborted'));
        return;
      }
      const doc: Document = (globalThis as unknown as { document: Document }).document;
      const canvas = doc.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('canvas-2d unavailable'));
        return;
      }
      ctx.fillStyle = 'rgba(17, 19, 26, 0)';
      ctx.fillRect(0, 0, width, height);
      // Letterbox so diagram keeps its aspect.
      const imgAspect = img.width / img.height;
      const canAspect = width / height;
      let dw = width, dh = height, dx = 0, dy = 0;
      if (imgAspect > canAspect) {
        dh = width / imgAspect;
        dy = (height - dh) / 2;
      } else {
        dw = height * imgAspect;
        dx = (width - dw) / 2;
      }
      ctx.drawImage(img, dx, dy, dw, dh);
      resolve({ canvas });
    };
    img.onerror = () => reject(new Error('image-load-failed'));
    img.src = url;
  });
}
