/**
 * Fractal renderers: Mandelbrot, Julia sets, Burning Ship.
 * All render directly to an HTMLCanvasElement via ImageData for performance.
 */

const MAX_ITER = 256;

type FractalType = 'mandelbrot' | 'julia' | 'julia2' | 'burningship';

interface FractalParams {
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
}

/** Colour mapping for a given iteration count and colour scheme index */
function mapColor(
  n: number,
  schemeId: number,
  data: Uint8ClampedArray,
  idx: number
): void {
  if (n === MAX_ITER) {
    data[idx] = 0; data[idx + 1] = 0; data[idx + 2] = 0; data[idx + 3] = 255;
    return;
  }
  const t = n / MAX_ITER;
  let r: number, g: number, b: number;

  switch (schemeId) {
    case 0: r = Math.floor(t * 50); g = Math.floor(t * 212); b = 255; break;
    case 1: r = 0; g = Math.floor(t * 255); b = Math.floor(t * 136); break;
    case 2: r = Math.floor(168 + t * 87); g = Math.floor(85 * t); b = 247; break;
    case 3: r = 245; g = Math.floor(158 * t); b = Math.floor(11 * t); break;
    default: {
      r = Math.floor(9 * (1 - t) * t ** 3 * 255);
      g = Math.floor(15 * (1 - t) ** 2 * t ** 2 * 255);
      b = Math.floor(8.5 * (1 - t) ** 3 * t * 255);
    }
  }

  data[idx]     = Math.min(255, r);
  data[idx + 1] = Math.min(255, g);
  data[idx + 2] = Math.min(255, b);
  data[idx + 3] = 255;
}

/**
 * Render a fractal to a canvas element.
 * @param canvas - target HTMLCanvasElement
 * @param type - fractal type identifier
 * @param schemeId - colour scheme index (0–5)
 * @param params - optional viewport bounds
 */
export function renderFractal(
  canvas: HTMLCanvasElement,
  type: FractalType,
  schemeId: number,
  params: FractalParams = {}
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width, H = canvas.height;
  const img = ctx.createImageData(W, H);
  const data = img.data;

  const xMin = params.xMin ?? -2.5;
  const xMax = params.xMax ?? 1.0;
  const yMin = params.yMin ?? -1.5;
  const yMax = params.yMax ?? 1.5;
  const dx = (xMax - xMin) / W;
  const dy = (yMax - yMin) / H;

  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const x0 = xMin + px * dx;
      const y0 = yMin + py * dy;
      let x = x0, y = y0, n = 0;

      switch (type) {
        case 'mandelbrot': {
          x = 0; y = 0;
          while (x * x + y * y < 4 && n < MAX_ITER) {
            const tmp = x * x - y * y + x0;
            y = 2 * x * y + y0;
            x = tmp;
            n++;
          }
          break;
        }
        case 'julia': {
          const cr = -0.7, ci = 0.27;
          while (x * x + y * y < 4 && n < MAX_ITER) {
            const tmp = x * x - y * y + cr;
            y = 2 * x * y + ci;
            x = tmp;
            n++;
          }
          break;
        }
        case 'julia2': {
          const cr = 0.355, ci = 0.355;
          while (x * x + y * y < 4 && n < MAX_ITER) {
            const tmp = x * x - y * y + cr;
            y = 2 * x * y + ci;
            x = tmp;
            n++;
          }
          break;
        }
        case 'burningship': {
          x = 0; y = 0;
          while (x * x + y * y < 4 && n < MAX_ITER) {
            const tmp = x * x - y * y + x0;
            y = Math.abs(2 * x * y) + y0;
            x = Math.abs(tmp);
            n++;
          }
          break;
        }
      }

      mapColor(n, schemeId, data, (py * W + px) * 4);
    }
  }

  ctx.putImageData(img, 0, 0);
}

/** Marching squares for 2D implicit curves */
export function marchingSquares(
  fn: (x: number, y: number) => number,
  xMin: number, xMax: number,
  yMin: number, yMax: number,
  resolution: number
): [number, number][] {
  const N = resolution * 2;
  const dx = (xMax - xMin) / N;
  const dy = (yMax - yMin) / N;
  const lines: [number, number][] = [];

  const grid: number[][] = [];
  for (let iy = 0; iy <= N; iy++) {
    grid[iy] = [];
    for (let ix = 0; ix <= N; ix++) {
      const v = fn(xMin + ix * dx, yMin + iy * dy);
      grid[iy]![ix] = isFinite(v) ? v : 1e10;
    }
  }

  function interp1D(v1: number, v2: number): number {
    if (Math.abs(v2 - v1) < 1e-10) return 0.5;
    return (-v1) / (v2 - v1);
  }

  for (let iy = 0; iy < N; iy++) {
    for (let ix = 0; ix < N; ix++) {
      const x = xMin + ix * dx, y = yMin + iy * dy;
      const v00 = grid[iy]![ix]!, v10 = grid[iy]![ix + 1]!;
      const v01 = grid[iy + 1]![ix]!, v11 = grid[iy + 1]![ix + 1]!;
      const s00 = v00 < 0 ? 1 : 0, s10 = v10 < 0 ? 1 : 0;
      const s01 = v01 < 0 ? 1 : 0, s11 = v11 < 0 ? 1 : 0;
      const cs = s00 | (s10 << 1) | (s11 << 2) | (s01 << 3);
      if (cs === 0 || cs === 15) continue;

      const edgePts: [number, number][] = [];
      if ((cs & 1) !== ((cs >> 1) & 1)) edgePts.push([x + interp1D(v00, v10) * dx, y]);
      if (((cs >> 1) & 1) !== ((cs >> 2) & 1)) edgePts.push([x + dx, y + interp1D(v10, v11) * dy]);
      if (((cs >> 2) & 1) !== ((cs >> 3) & 1)) edgePts.push([x + (1 - interp1D(v11, v01)) * dx, y + dy]);
      if (((cs >> 3) & 1) !== (cs & 1)) edgePts.push([x, y + (1 - interp1D(v01, v00)) * dy]);

      if (edgePts.length >= 2) lines.push(edgePts[0]!, edgePts[1]!);
      if (edgePts.length >= 4) lines.push(edgePts[2]!, edgePts[3]!);
    }
  }

  return lines;
}
