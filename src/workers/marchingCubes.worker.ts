/**
 * Web Worker: runs marching cubes off the UI thread.
 * Imported via new Worker(new URL(...)) in useRenderer.
 */
import { marchingCubes } from '../engine/geometry/marchingCubes';
import { compile } from 'mathjs';

interface WorkerRequest {
  expression: string;
  resolution: number;
  isoValue: number;
  range: number;
}

interface WorkerResponse {
  positions: number[];
  normals: number[];
  progress?: number;
  error?: string;
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { expression, resolution, isoValue, range } = e.data;

  try {
    const compiled = compile(expression);
    const fn = (x: number, y: number, z: number): number => {
      try {
        const result = compiled.evaluate({ x, y, z }) as unknown;
        return typeof result === 'number' && isFinite(result) ? result - isoValue : 1e10;
      } catch {
        return 1e10;
      }
    };

    const geo = marchingCubes(fn, range, resolution, 0, (pct: number) => {
      self.postMessage({ positions: [], normals: [], progress: pct } satisfies WorkerResponse);
    });

    self.postMessage({
      positions: Array.from(geo.positions),
      normals: Array.from(geo.normals),
      progress: 100,
    } satisfies WorkerResponse);
  } catch (err) {
    self.postMessage({
      positions: [],
      normals: [],
      error: err instanceof Error ? err.message : 'Worker failed',
    } satisfies WorkerResponse);
  }
};
