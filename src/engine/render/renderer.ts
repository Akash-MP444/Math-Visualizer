'use client';

import { getSurfaceColor } from '@/utils/colors';
import type { CameraState } from '@/types/math';

/** Project a 3D world point to 2D screen coordinates */
export function project(
  x: number, y: number, z: number,
  camera: CameraState,
  W: number, H: number
) {
  const cosT = Math.cos(camera.theta), sinT = Math.sin(camera.theta);
  const cosP = Math.cos(camera.phi), sinP = Math.sin(camera.phi);
  const rx = cosT * x + sinT * z;
  const ry = -sinP * (-sinT * x + cosT * z) + cosP * y;
  const rz = cosP * (-sinT * x + cosT * z) + sinP * y;
  const fov = 800;
  const scale = fov / (rz + camera.zoom + 10);
  return {
    sx: W / 2 + camera.panX + rx * scale,
    sy: H / 2 + camera.panY - ry * scale,
    depth: rz,
  };
}

interface Triangle {
  sx0: number; sy0: number;
  sx1: number; sy1: number;
  sx2: number; sy2: number;
  nx: number; ny: number; nz: number;
  my: number;
  depth: number;
}

/** Render a 3D mesh using painter's algorithm on a 2D canvas */
export function renderMesh(
  ctx: CanvasRenderingContext2D,
  positions: Float32Array,
  normals: Float32Array,
  camera: CameraState,
  W: number, H: number,
  colorScheme: number,
  wireframeMix: number
): boolean {
  const nTris = positions.length / 9;
  const tris: Triangle[] = [];
  let anyVisible = false;

  for (let i = 0; i < nTris; i++) {
    const b = i * 9;
    const p0 = project(positions[b]!, positions[b + 1]!, positions[b + 2]!, camera, W, H);
    const p1 = project(positions[b + 3]!, positions[b + 4]!, positions[b + 5]!, camera, W, H);
    const p2 = project(positions[b + 6]!, positions[b + 7]!, positions[b + 8]!, camera, W, H);

    const depth = (p0.depth + p1.depth + p2.depth) / 3;
    const my = ((positions[b + 1]! + positions[b + 4]! + positions[b + 7]!) / 3);

    if (
      (p0.sx > 0 && p0.sx < W) || (p1.sx > 0 && p1.sx < W) || (p2.sx > 0 && p2.sx < W)
    ) anyVisible = true;

    tris.push({
      sx0: p0.sx, sy0: p0.sy,
      sx1: p1.sx, sy1: p1.sy,
      sx2: p2.sx, sy2: p2.sy,
      nx: normals[b]!, ny: normals[b + 1]!, nz: normals[b + 2]!,
      my, depth,
    });
  }

  // Sort back-to-front (painter's algorithm)
  tris.sort((a, b) => b.depth - a.depth);

  const wf = wireframeMix / 100;
  for (const tri of tris) {
    ctx.beginPath();
    ctx.moveTo(tri.sx0, tri.sy0);
    ctx.lineTo(tri.sx1, tri.sy1);
    ctx.lineTo(tri.sx2, tri.sy2);
    ctx.closePath();

    if (wf < 1) {
      ctx.fillStyle = getSurfaceColor(tri.nx, tri.ny, tri.nz, tri.my, colorScheme);
      ctx.fill();
    }
    if (wf > 0) {
      ctx.strokeStyle = `rgba(0,212,255,${wf * 0.4})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  return anyVisible;
}

/** Render ODE/parametric path as a coloured line strip */
export function renderPath(
  ctx: CanvasRenderingContext2D,
  points: [number, number, number][],
  camera: CameraState,
  W: number, H: number
): boolean {
  let anyVisible = false;
  ctx.lineWidth = 1;

  for (let i = 1; i < points.length; i++) {
    const t = i / points.length;
    const [x0, y0, z0] = points[i - 1]!;
    const [x1, y1, z1] = points[i]!;
    const p0 = project(x0, y0, z0, camera, W, H);
    const p1 = project(x1, y1, z1, camera, W, H);

    if (p0.sx > 0 && p0.sx < W && p0.sy > 0 && p0.sy < H) anyVisible = true;

    ctx.strokeStyle = `rgba(0,${Math.floor(180 + t * 75)},${Math.floor(200 + t * 55)},0.6)`;
    ctx.beginPath();
    ctx.moveTo(p0.sx, p0.sy);
    ctx.lineTo(p1.sx, p1.sy);
    ctx.stroke();
  }

  return anyVisible;
}

/** Render a 2D vector field as normalised arrows */
export function renderVectorField(
  ctx: CanvasRenderingContext2D,
  arrows: { x: number; y: number; dx: number; dy: number }[],
  camera: CameraState,
  W: number, H: number
): boolean {
  ctx.strokeStyle = 'rgba(0,255,136,0.7)';
  ctx.lineWidth = 1.2;
  let anyVisible = false;
  const len = 0.4, as = 8;

  for (const a of arrows) {
    const p0 = project(a.x, 0, a.y, camera, W, H);
    const p1 = project(a.x + a.dx * len, 0, a.y + a.dy * len, camera, W, H);

    if (p0.sx > 0 && p0.sx < W && p0.sy > 0 && p0.sy < H) anyVisible = true;

    ctx.beginPath();
    ctx.moveTo(p0.sx, p0.sy);
    ctx.lineTo(p1.sx, p1.sy);
    ctx.stroke();

    const angle = Math.atan2(p1.sy - p0.sy, p1.sx - p0.sx);
    ctx.beginPath();
    ctx.moveTo(p1.sx, p1.sy);
    ctx.lineTo(p1.sx - as * Math.cos(angle - 0.4), p1.sy - as * Math.sin(angle - 0.4));
    ctx.moveTo(p1.sx, p1.sy);
    ctx.lineTo(p1.sx - as * Math.cos(angle + 0.4), p1.sy - as * Math.sin(angle + 0.4));
    ctx.stroke();
  }

  return anyVisible;
}

/** Render 2D implicit/explicit curve onto a 2D canvas */
export function render2DLines(
  ctx: CanvasRenderingContext2D,
  lines: [number, number][],
  W: number, H: number,
  colorScheme: number
): void {
  const scale = Math.min(W, H) / 20;
  const colors = ['#00d4ff', '#00ff88', '#a855f7', '#f59e0b', '#ffffff', '#f97316'];
  ctx.strokeStyle = colors[colorScheme] ?? '#00d4ff';
  ctx.lineWidth = 2;

  for (let i = 0; i < lines.length; i += 2) {
    const a = lines[i], b = lines[i + 1];
    if (!a || !b) continue;
    if (!isFinite(a[0]) || !isFinite(a[1]) || !isFinite(b[0]) || !isFinite(b[1])) continue;
    ctx.beginPath();
    ctx.moveTo(W / 2 + a[0] * scale, H / 2 - a[1] * scale);
    ctx.lineTo(W / 2 + b[0] * scale, H / 2 - b[1] * scale);
    ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = 'rgba(0,212,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
  ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
  ctx.stroke();
}
