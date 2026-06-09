/**
 * Parametric surfaces: helix, torus, möbius strip, trefoil knot, klein bottle.
 * Each surface is defined as a function (u, v) → [x, y, z].
 */

import type { GeometryResult, PathResult } from '@/types/math';

type SurfaceFn = (u: number, v: number) => [number, number, number];

/** All known parametric surface definitions */
const SURFACE_FNS: Record<string, SurfaceFn> = {
  torus_param: (u, v) => {
    const R = 2, r = 0.7;
    const U = u * 2 * Math.PI, V = v * 2 * Math.PI;
    return [
      (R + r * Math.cos(V)) * Math.cos(U),
      (R + r * Math.cos(V)) * Math.sin(U),
      r * Math.sin(V),
    ];
  },

  mobius: (u, v) => {
    const U = u * 2 * Math.PI, V = (v - 0.5) * 2;
    return [
      (1 + (V / 2) * Math.cos(U / 2)) * Math.cos(U),
      (1 + (V / 2) * Math.cos(U / 2)) * Math.sin(U),
      (V / 2) * Math.sin(U / 2),
    ];
  },

  trefoil: (u, v) => {
    const t = u * 2 * Math.PI, s = v * 2 * Math.PI;
    const x = (2 + Math.cos(s)) * Math.cos(2 * t / 3) * (2 - Math.cos(s - 2 * t)) - Math.cos(s + t) * Math.sin(2 * t);
    const y = (2 + Math.cos(s + 2 * Math.PI / 3)) * Math.sin(2 * t / 3) * (2 + Math.cos(s - t)) + Math.sin(s + t) * Math.cos(t);
    const z = 0.5 * (-Math.sin(s - 2 * t) * (2 + Math.cos(s + Math.PI / 3)) + Math.sin(s - Math.PI / 3));
    return [x * 0.3, y * 0.3, z * 0.3];
  },

  klein: (u, v) => {
    const U = u * Math.PI, V = v * 2 * Math.PI;
    let x: number, y: number;
    if (U < Math.PI) {
      x = 3 * Math.cos(U) * (1 + Math.sin(U)) + 2 * (1 - Math.cos(U) / 2) * Math.cos(U) * Math.cos(V);
      y = 8 * Math.sin(U) + 2 * (1 - Math.cos(U) / 2) * Math.sin(U) * Math.cos(V);
    } else {
      x = 3 * Math.cos(U) * (1 + Math.sin(U)) + 2 * (1 - Math.cos(U) / 2) * Math.cos(V + Math.PI);
      y = 8 * Math.sin(U);
    }
    const z = 2 * (1 - Math.cos(U) / 2) * Math.sin(V);
    return [x * 0.12, y * 0.12, z * 0.12];
  },
};

/**
 * Build a triangle mesh for a named parametric surface.
 * Returns null for 'helix' (use generateHelixPath instead).
 */
export function buildParametricSurface(name: string, Nu = 80, Nv = 80): GeometryResult | null {
  const fn = SURFACE_FNS[name];
  if (!fn) return null;

  const t0 = performance.now();
  const positions: number[] = [];
  const normals: number[] = [];

  const calcNormal = (
    a: [number, number, number],
    b: [number, number, number],
    c: [number, number, number]
  ): [number, number, number] => {
    const ax = b[0] - a[0], ay = b[1] - a[1], az = b[2] - a[2];
    const bx = c[0] - a[0], by = c[1] - a[1], bz = c[2] - a[2];
    const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
    const l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    return [nx / l, ny / l, nz / l];
  };

  for (let iv = 0; iv < Nv; iv++) {
    for (let iu = 0; iu < Nu; iu++) {
      const u0 = iu / Nu, u1 = (iu + 1) / Nu;
      const v0 = iv / Nv, v1 = (iv + 1) / Nv;

      const p00 = fn(u0, v0), p10 = fn(u1, v0);
      const p01 = fn(u0, v1), p11 = fn(u1, v1);

      const pushTri = (
        a: [number, number, number],
        b: [number, number, number],
        c: [number, number, number]
      ) => {
        const n = calcNormal(a, b, c);
        positions.push(...a, ...b, ...c);
        for (let i = 0; i < 3; i++) normals.push(...n);
      };

      pushTri(p00, p10, p11);
      pushTri(p00, p11, p01);
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

/**
 * Generate a 3D helix as a sequence of points (for line rendering).
 */
export function generateHelixPath(steps = 2000): PathResult {
  const t0 = performance.now();
  const points: [number, number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = t * 8 * Math.PI;
    points.push([
      Math.cos(u),
      Math.sin(u),
      u / (4 * Math.PI) - 1,
    ]);
  }

  return { points, renderTimeMs: performance.now() - t0 };
}
