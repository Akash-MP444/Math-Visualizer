import { describe, it, expect } from 'vitest';
import { marchingCubes } from '../engine/geometry/marchingCubes';

describe('marchingCubes', () => {
  it('generates a mesh for sphere x^2+y^2+z^2-1=0', () => {
    const fn = (x: number, y: number, z: number) => x * x + y * y + z * z - 1;
    const result = marchingCubes(fn, 2, 20, 0);
    expect(result.positions.length).toBeGreaterThan(0);
    expect(result.normals.length).toBe(result.positions.length);
    expect(result.positions.length % 9).toBe(0); // triangles
    expect(result.vertexCount).toBeGreaterThan(100);
    expect(result.triangleCount).toBeGreaterThan(30);
  });

  it('returns empty mesh for constant function above iso', () => {
    const fn = () => 10; // always above iso=0
    const result = marchingCubes(fn, 2, 10, 0);
    expect(result.positions.length).toBe(0);
  });

  it('reports render time', () => {
    const fn = (x: number, y: number, z: number) => x * x + y * y + z * z - 1;
    const result = marchingCubes(fn, 2, 16, 0);
    expect(result.renderTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('calls progress callback', () => {
    const fn = (x: number, y: number, z: number) => x * x + y * y + z * z - 1;
    const calls: number[] = [];
    marchingCubes(fn, 2, 12, 0, (pct) => calls.push(pct));
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[calls.length - 1]).toBe(100);
  });
});
