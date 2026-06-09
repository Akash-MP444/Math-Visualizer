/**
 * Classifier: determines the type of an equation and extracts components.
 * This drives which renderer/geometry generator is used.
 */

import type { ParsedEquation, EquationType } from '@/types/math';
import { tokenize, extractVariables, validateBrackets } from './tokenizer';

const NAMED_ODE = new Set(['lorenz', 'rossler', 'vanderpol', 'duffing']);
const NAMED_FRACTAL = new Set(['mandelbrot', 'julia', 'julia2', 'burningship']);
const NAMED_PARAMETRIC = new Set(['helix', 'torus_param', 'mobius', 'trefoil', 'klein']);
const NAMED_VF = new Set(['vf_rotation', 'vf_sink', 'vf_saddle', 'vf_electric']);
const NAMED_ALIASES: Record<string, string> = {
  gyroid: 'sin(x)*cos(y)+sin(y)*cos(z)+sin(z)*cos(x)=0',
};

/**
 * Classify a raw equation string.
 * Returns a ParsedEquation describing what kind it is and its components.
 */
export function classifyEquation(raw: string): ParsedEquation {
  const s = raw.trim();
  const lower = s.toLowerCase();

  // Check bracket validity first
  const bracketError = validateBrackets(s);
  if (bracketError) {
    throw new Error(bracketError);
  }

  // Named ODE attractors
  if (NAMED_ODE.has(lower)) {
    return { raw, normalized: s, type: 'ode', variables: ['x', 'y', 'z', 't'], name: lower };
  }

  // Named fractals
  if (NAMED_FRACTAL.has(lower)) {
    return { raw, normalized: s, type: 'fractal', variables: ['z'], name: lower };
  }

  // Named parametric surfaces
  if (NAMED_PARAMETRIC.has(lower)) {
    return { raw, normalized: s, type: 'parametric', variables: ['u', 'v'], name: lower };
  }

  // Named vector fields
  if (NAMED_VF.has(lower)) {
    return { raw, normalized: s, type: 'vectorfield', variables: ['x', 'y'], name: lower };
  }

  // Named aliases (e.g. "gyroid")
  if (NAMED_ALIASES[lower]) {
    const aliased = NAMED_ALIASES[lower]!;
    return classifyEquation(aliased);
  }

  // Explicit z = f(x, y)
  const zMatch = s.match(/^z\s*=\s*(.+)$/i);
  if (zMatch?.[1]) {
    const expr = zMatch[1].trim();
    const tokens = tokenize(expr);
    const variables = extractVariables(tokens);
    return { raw, normalized: s, type: 'explicit3d', variables, expr, lhs: 'z', rhs: expr };
  }

  // Explicit y = f(x)
  const yMatch = s.match(/^y\s*=\s*(.+)$/i);
  if (yMatch?.[1]) {
    const expr = yMatch[1].trim();
    const tokens = tokenize(expr);
    const variables = extractVariables(tokens);
    return { raw, normalized: s, type: 'explicit2d', variables, expr, lhs: 'y', rhs: expr };
  }

  // Implicit equations with '='
  const parts = s.split('=');
  if (parts.length === 2 && parts[0] && parts[1]) {
    const [lhs, rhs] = parts as [string, string];
    const implicitExpr = `(${lhs})-(${rhs})`;
    const tokens = tokenize(implicitExpr);
    const variables = extractVariables(tokens);

    if (variables.includes('z')) {
      return { raw, normalized: s, type: 'implicit3d', variables, expr: implicitExpr, lhs, rhs };
    } else if (variables.some(v => v === 'x' || v === 'y')) {
      return { raw, normalized: s, type: 'implicit2d', variables, expr: implicitExpr, lhs, rhs };
    }
  }

  // Single-sided expression with z => 3D implicit F(x,y,z) = 0
  if (/\bz\b/.test(s) && !s.includes('=')) {
    const tokens = tokenize(s);
    const variables = extractVariables(tokens);
    return { raw, normalized: s, type: 'implicit3d', variables, expr: s };
  }

  // Single-sided expression with x or y => 2D implicit
  if (/\b[xy]\b/.test(s) && !s.includes('=')) {
    const tokens = tokenize(s);
    const variables = extractVariables(tokens);
    return { raw, normalized: s, type: 'implicit2d', variables, expr: s };
  }

  return { raw, normalized: s, type: 'unknown', variables: [] };
}

/** Get a human-readable label for an equation type */
export function getTypeLabel(type: EquationType): string {
  const labels: Record<EquationType, string> = {
    implicit3d: 'IMPLICIT SURFACE',
    explicit3d: 'EXPLICIT SURFACE',
    implicit2d: 'IMPLICIT CURVE',
    explicit2d: 'EXPLICIT CURVE',
    parametric: 'PARAMETRIC',
    fractal: 'FRACTAL',
    ode: 'ODE ATTRACTOR',
    vectorfield: 'VECTOR FIELD',
    unknown: 'UNKNOWN',
  };
  return labels[type];
}

/** Get topology string for display */
export function getTopologyLabel(type: EquationType, name?: string): string {
  if (type === 'parametric' && name) {
    const map: Record<string, string> = {
      helix: 'Helix / ℝ¹',
      torus_param: 'Torus T²',
      mobius: 'Möbius Band',
      trefoil: 'Trefoil Knot',
      klein: 'Klein Bottle',
    };
    return map[name] ?? 'Surface';
  }
  const topo: Record<EquationType, string> = {
    implicit3d: 'Manifold',
    explicit3d: 'Graph Surface',
    implicit2d: 'Algebraic Curve',
    explicit2d: 'Graph',
    parametric: 'Surface',
    fractal: 'Fractal / Cantor',
    ode: 'Strange Attractor',
    vectorfield: 'Flow / Streamline',
    unknown: '—',
  };
  return topo[type];
}
