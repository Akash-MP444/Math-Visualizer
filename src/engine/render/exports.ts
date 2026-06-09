/**
 * Export system: PNG, STL, OBJ, GLTF
 */
import type { GeometryResult } from '@/types/math';

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportPNG(canvas: HTMLCanvasElement, filename = 'equation-universe.png'): void {
  canvas.toBlob((blob) => {
    if (blob) triggerDownload(blob, filename);
  }, 'image/png');
}

export function exportSTL(geo: GeometryResult, filename = 'equation-universe.stl'): void {
  const { positions, normals } = geo;
  const nTris = positions.length / 9;
  const lines: string[] = ['solid equation_universe'];

  for (let i = 0; i < nTris; i++) {
    const b = i * 9;
    const nx = normals[b] ?? 0, ny = normals[b + 1] ?? 0, nz = normals[b + 2] ?? 0;
    lines.push(`  facet normal ${nx.toFixed(6)} ${ny.toFixed(6)} ${nz.toFixed(6)}`);
    lines.push('    outer loop');
    for (let v = 0; v < 3; v++) {
      const vb = b + v * 3;
      lines.push(`      vertex ${(positions[vb] ?? 0).toFixed(6)} ${(positions[vb + 1] ?? 0).toFixed(6)} ${(positions[vb + 2] ?? 0).toFixed(6)}`);
    }
    lines.push('    endloop');
    lines.push('  endfacet');
  }

  lines.push('endsolid equation_universe');
  triggerDownload(new Blob([lines.join('\n')], { type: 'text/plain' }), filename);
}

export function exportOBJ(geo: GeometryResult, filename = 'equation-universe.obj'): void {
  const { positions, normals } = geo;
  const nVerts = positions.length / 3;
  const lines: string[] = ['# Equation Universe export', 'o equation_universe', ''];

  for (let i = 0; i < nVerts; i++) {
    const b = i * 3;
    lines.push(`v ${(positions[b] ?? 0).toFixed(6)} ${(positions[b + 1] ?? 0).toFixed(6)} ${(positions[b + 2] ?? 0).toFixed(6)}`);
  }
  lines.push('');
  for (let i = 0; i < nVerts; i++) {
    const b = i * 3;
    lines.push(`vn ${(normals[b] ?? 0).toFixed(6)} ${(normals[b + 1] ?? 0).toFixed(6)} ${(normals[b + 2] ?? 0).toFixed(6)}`);
  }
  lines.push('');
  const nTris = nVerts / 3;
  for (let i = 0; i < nTris; i++) {
    const b = i * 3 + 1;
    lines.push(`f ${b}//${b} ${b + 1}//${b + 1} ${b + 2}//${b + 2}`);
  }

  triggerDownload(new Blob([lines.join('\n')], { type: 'text/plain' }), filename);
}

export function exportGLTF(geo: GeometryResult, filename = 'equation-universe.gltf'): void {
  const { positions, normals } = geo;
  const nVerts = positions.length / 3;

  // Build combined buffer as base64
  const posBytes = positions.byteLength;
  const normBytes = normals.byteLength;
  const totalBytes = posBytes + normBytes;
  const combined = new Uint8Array(totalBytes);
  combined.set(new Uint8Array(positions.buffer, positions.byteOffset, posBytes), 0);
  combined.set(new Uint8Array(normals.buffer, normals.byteOffset, normBytes), posBytes);

  // Convert to base64 without spread
  let binary = '';
  for (let i = 0; i < combined.byteLength; i++) {
    binary += String.fromCharCode(combined[i] ?? 0);
  }
  const base64 = btoa(binary);

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < nVerts; i++) {
    const b = i * 3;
    const x = positions[b] ?? 0, y = positions[b + 1] ?? 0, z = positions[b + 2] ?? 0;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }

  const gltf = {
    asset: { version: '2.0', generator: 'Equation Universe v2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: 'EquationMesh' }],
    meshes: [{
      name: 'equation_universe',
      primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, mode: 4 }],
    }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: nVerts, type: 'VEC3', min: [minX, minY, minZ], max: [maxX, maxY, maxZ] },
      { bufferView: 1, componentType: 5126, count: nVerts, type: 'VEC3' },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: posBytes, target: 34962 },
      { buffer: 0, byteOffset: posBytes, byteLength: normBytes, target: 34962 },
    ],
    buffers: [{ byteLength: totalBytes, uri: `data:application/octet-stream;base64,${base64}` }],
  };

  triggerDownload(new Blob([JSON.stringify(gltf, null, 2)], { type: 'application/json' }), filename);
}
