/**
 * Explicit surface generator: builds a mesh for z = f(x, y) equations.
 * Uses analytical normals via finite differences for smooth shading.
 */

import type { GeometryResult } from '@/types/math';
import type { EvalFn2 } from '../parser/parser';

/**
 * Build a grid mesh for an explicit surface z = fn(x, y).
 */
export function buildExplicitSurface(
  fn: EvalFn2,
  xMin: number, xMax: number,
  yMin: number, yMax: number,
  resolution: number
): GeometryResult {
  const t0 = performance.now();
  const N = resolution;
  const dx = (xMax - xMin) / N;
  const dy = (yMax - yMin) / N;

  const positions: number[] = [];
  const normals: number[] = [];

  // Pre-compute grid
  const grid: number[][] = [];
  for (let iy = 0; iy <= N; iy++) {
    grid[iy] = [];
    for (let ix = 0; ix <= N; ix++) {
      const x = xMin + ix * dx;
      const y = yMin + iy * dy;
      grid[iy]![ix] = fn(x, y);
    }
  }

  for (let iy = 0; iy < N; iy++) {
    for (let ix = 0; ix < N; ix++) {
      const x = xMin + ix * dx;
      const y = yMin + iy * dy;
      const x1 = x + dx;
      const y1 = y + dy;

      const z00 = grid[iy]![ix]!;
      const z10 = grid[iy]![ix + 1]!;
      const z01 = grid[iy + 1]![ix]!;
      const z11 = grid[iy + 1]![ix + 1]!;

      // Skip if any vertex is invalid or too tall
      if (![z00, z10, z01, z11].every(v => isFinite(v) && Math.abs(v) < 50)) continue;

      // Approximate normal via finite differences (pointing generally upward)
      const dzdx = (z10 - z00) / dx;
      const dzdy = (z01 - z00) / dy;
      const nx = -dzdx, ny = -dzdy, nz = 1;
      const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      const n = [nx / nl, ny / nl, nz / nl] as const;

      const pushTri = (
        ax: number, ay: number, az: number,
        bx: number, by: number, bz: number,
        cx: number, cy: number, cz: number
      ) => {
        positions.push(ax, ay, az, bx, by, bz, cx, cy, cz);
        for (let i = 0; i < 3; i++) normals.push(n[0], n[1], n[2]);
      };

      pushTri(x, y, z00, x1, y, z10, x1, y1, z11);
      pushTri(x, y, z00, x1, y1, z11, x, y1, z01);
    }
  }

  const posArr = new Float32Array(positions);
  const normArr = new Float32Array(normals);
  return {
    positions: posArr,
    normals: normArr,
    vertexCount: posArr.length / 3,
    triangleCount: posArr.length / 9,
    renderTimeMs: performance.now() - t0,
  };
}
