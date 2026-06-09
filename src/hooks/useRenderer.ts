'use client';

import { useCallback, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { classifyEquation, getTypeLabel, getTopologyLabel } from '@/engine/parser/classifier';
import { parseExplicit2D, parseExplicit3D, parseImplicit2D, parseImplicit3D } from '@/engine/parser/parser';
import { marchingCubes } from '@/engine/geometry/marchingCubes';
import { buildExplicitSurface } from '@/engine/geometry/surfaces';
import { buildParametricSurface, generateHelixPath } from '@/engine/geometry/parametric';
import { buildVectorField } from '@/engine/geometry/vectorFields';
import { integrateLorenz } from '@/engine/attractors/lorenz';
import { integrateRossler } from '@/engine/attractors/rossler';
import { integrateDuffing, integrateVanDerPol } from '@/engine/attractors/duffing';
import { marchingSquares } from '@/engine/fractals/mandelbrot';
import { BOUNDS_3D, BOUNDS_2D } from '@/utils/constants';
import type { GeometryResult, PathResult, Arrow, ParsedEquation } from '@/types/math';

export interface RendererState {
  geometry: GeometryResult | null;
  path: PathResult | null;
  lines2d: [number, number][] | null;
  arrows: Arrow[] | null;
  fractalType: string | null;
  equationType: string;
  topologyLabel: string;
  displayLabel: string;
  renderTimeMs: number;
}

const EMPTY: RendererState = {
  geometry: null, path: null, lines2d: null, arrows: null,
  fractalType: null, equationType: '—', topologyLabel: '—',
  displayLabel: '', renderTimeMs: 0,
};

export function useRenderer() {
  const { resolution, isoValue, setIsRendering, setRenderProgress, setError, setParsed, setDimension } = useAppStore();
  const stateRef = useRef<RendererState>(EMPTY);

  const render = useCallback(async (raw: string): Promise<RendererState> => {
    if (!raw.trim()) return EMPTY;
    setIsRendering(true);
    setError(null);

    try {
      const parsed = classifyEquation(raw);
      setParsed(parsed);
      const result = await buildGeometry(parsed, resolution, isoValue, setRenderProgress);
      stateRef.current = result;

      // Set dimension tab
      if (parsed.type === 'fractal') setDimension('fractal');
      else if (parsed.type === 'vectorfield') setDimension('vfield');
      else if (parsed.type === 'explicit2d' || parsed.type === 'implicit2d') setDimension('2d');
      else setDimension('3d');

      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Render failed';
      setError(msg);
      return EMPTY;
    } finally {
      setIsRendering(false);
    }
  }, [resolution, isoValue, setIsRendering, setRenderProgress, setError, setParsed, setDimension]);

  return { render, stateRef };
}

async function buildGeometry(
  parsed: ParsedEquation,
  resolution: number,
  isoValue: number,
  onProgress: (pct: number) => void,
): Promise<RendererState> {
  const t0 = performance.now();
  const typeLabel = getTypeLabel(parsed.type);
  const topoLabel = getTopologyLabel(parsed.type, parsed.name);

  switch (parsed.type) {

    case 'fractal':
      return { ...EMPTY, fractalType: parsed.name ?? 'mandelbrot', equationType: typeLabel, topologyLabel: 'Fractal / Cantor', displayLabel: parsed.raw, renderTimeMs: 0 };

    case 'ode': {
      const path = buildODEPath(parsed.name ?? 'lorenz');
      if (!path) throw new Error(`Unknown ODE: ${parsed.name ?? '?'}`);
      onProgress(100);
      return { ...EMPTY, path, equationType: typeLabel, topologyLabel: topoLabel, displayLabel: parsed.raw, renderTimeMs: performance.now() - t0 };
    }

    case 'vectorfield': {
      const arrows = buildVectorField(parsed.name ?? 'vf_rotation');
      if (!arrows) throw new Error(`Unknown vector field: ${parsed.name ?? '?'}`);
      onProgress(100);
      return { ...EMPTY, arrows, equationType: typeLabel, topologyLabel: topoLabel, displayLabel: parsed.raw, renderTimeMs: performance.now() - t0 };
    }

    case 'parametric': {
      if (parsed.name === 'helix') {
        const path = generateHelixPath();
        onProgress(100);
        return { ...EMPTY, path, equationType: 'SPACE CURVE', topologyLabel: 'Helix / ℝ¹', displayLabel: 'Helix', renderTimeMs: performance.now() - t0 };
      }
      const geo = buildParametricSurface(parsed.name ?? '', resolution, resolution);
      if (!geo) throw new Error('Could not build parametric surface');
      onProgress(100);
      return { ...EMPTY, geometry: geo, equationType: typeLabel, topologyLabel: topoLabel, displayLabel: parsed.name ?? '', renderTimeMs: performance.now() - t0 };
    }

    case 'implicit3d': {
      if (!parsed.expr) throw new Error('No expression for implicit 3D');
      const { fn, error } = parseImplicit3D(parsed.expr);
      if (!fn) throw new Error(error);
      const range = Math.abs(BOUNDS_3D.xMax);
      const geo = marchingCubes((x, y, z) => fn(x, y, z) - isoValue, range, resolution, 0, onProgress);
      if (!geo.positions.length) throw new Error('No surface found. Try adjusting the ISO value or zoom out.');
      return { ...EMPTY, geometry: geo, equationType: typeLabel, topologyLabel: topoLabel, displayLabel: parsed.raw, renderTimeMs: performance.now() - t0 };
    }

    case 'explicit3d': {
      if (!parsed.expr) throw new Error('No expression for explicit surface');
      const { fn, error } = parseExplicit3D(parsed.expr);
      if (!fn) throw new Error(error);
      const geo = buildExplicitSurface(fn, BOUNDS_3D.xMin, BOUNDS_3D.xMax, BOUNDS_3D.yMin, BOUNDS_3D.yMax, resolution);
      if (!geo.positions.length) throw new Error('No surface found');
      onProgress(100);
      return { ...EMPTY, geometry: geo, equationType: typeLabel, topologyLabel: topoLabel, displayLabel: `z = ${parsed.expr}`, renderTimeMs: performance.now() - t0 };
    }

    case 'implicit2d': {
      if (!parsed.expr) throw new Error('No expression for implicit 2D');
      const { fn, error } = parseImplicit2D(parsed.expr);
      if (!fn) throw new Error(error);
      const lines = marchingSquares(fn, BOUNDS_2D.xMin, BOUNDS_2D.xMax, BOUNDS_2D.yMin, BOUNDS_2D.yMax, resolution);
      onProgress(100);
      return { ...EMPTY, lines2d: lines, equationType: typeLabel, topologyLabel: topoLabel, displayLabel: parsed.raw, renderTimeMs: performance.now() - t0 };
    }

    case 'explicit2d': {
      if (!parsed.expr) throw new Error('No expression for explicit 2D');
      const { fn, error } = parseExplicit2D(parsed.expr);
      if (!fn) throw new Error(error);
      const pts: [number, number][] = [];
      const steps = 800;
      for (let i = 0; i <= steps; i++) {
        const x = BOUNDS_2D.xMin + (i / steps) * (BOUNDS_2D.xMax - BOUNDS_2D.xMin);
        const y = fn(x);
        if (isFinite(y) && Math.abs(y) < 100) pts.push([x, y]);
      }
      const lines: [number, number][] = [];
      for (let i = 0; i < pts.length - 1; i++) {
        lines.push(pts[i]!, pts[i + 1]!);
      }
      onProgress(100);
      return { ...EMPTY, lines2d: lines, equationType: typeLabel, topologyLabel: topoLabel, displayLabel: `y = ${parsed.expr}`, renderTimeMs: performance.now() - t0 };
    }

    default:
      throw new Error('Unable to interpret equation. Try: x²+y²=1, z=sin(x)*cos(y), lorenz, mandelbrot');
  }
}

function buildODEPath(name: string): PathResult | null {
  switch (name) {
    case 'lorenz':    return integrateLorenz();
    case 'rossler':   return integrateRossler();
    case 'duffing':   return integrateDuffing();
    case 'vanderpol': return integrateVanDerPol();
    default:          return null;
  }
}
