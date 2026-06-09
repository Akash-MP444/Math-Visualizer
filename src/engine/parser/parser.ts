/**
 * Parser module: converts equation strings into callable functions using MathJS.
 * This is the secure replacement for `new Function()` / `eval()`.
 */

import { compile, derivative as mathjsDerivative, parse as mathjsParse } from 'mathjs';

export type EvalFn1 = (x: number) => number;
export type EvalFn2 = (x: number, y: number) => number;
export type EvalFn3 = (x: number, y: number, z: number) => number;

/**
 * Parse an expression string into a function of (x).
 * Returns null if parsing fails, with a descriptive error.
 */
export function parseExplicit2D(expr: string): { fn: EvalFn1; error: null } | { fn: null; error: string } {
  try {
    const compiled = compile(expr);
    const fn: EvalFn1 = (x) => {
      try {
        const result = compiled.evaluate({ x }) as unknown;
        return typeof result === 'number' && isFinite(result) ? result : NaN;
      } catch {
        return NaN;
      }
    };
    return { fn, error: null };
  } catch (e) {
    return { fn: null, error: formatParseError(expr, e) };
  }
}

/**
 * Parse an expression string into a function of (x, y).
 */
export function parseExplicit3D(expr: string): { fn: EvalFn2; error: null } | { fn: null; error: string } {
  try {
    const compiled = compile(expr);
    const fn: EvalFn2 = (x, y) => {
      try {
        const result = compiled.evaluate({ x, y }) as unknown;
        return typeof result === 'number' && isFinite(result) ? result : NaN;
      } catch {
        return NaN;
      }
    };
    return { fn, error: null };
  } catch (e) {
    return { fn: null, error: formatParseError(expr, e) };
  }
}

/**
 * Parse an implicit 3D expression (already in form LHS-RHS) into a function of (x, y, z).
 */
export function parseImplicit3D(expr: string): { fn: EvalFn3; error: null } | { fn: null; error: string } {
  try {
    const compiled = compile(expr);
    const fn: EvalFn3 = (x, y, z) => {
      try {
        const result = compiled.evaluate({ x, y, z }) as unknown;
        return typeof result === 'number' && isFinite(result) ? result : 1e10;
      } catch {
        return 1e10;
      }
    };
    return { fn, error: null };
  } catch (e) {
    return { fn: null, error: formatParseError(expr, e) };
  }
}

/**
 * Parse an implicit 2D expression into a function of (x, y).
 */
export function parseImplicit2D(expr: string): { fn: EvalFn2; error: null } | { fn: null; error: string } {
  try {
    const compiled = compile(expr);
    const fn: EvalFn2 = (x, y) => {
      try {
        const result = compiled.evaluate({ x, y }) as unknown;
        return typeof result === 'number' && isFinite(result) ? result : 1e10;
      } catch {
        return 1e10;
      }
    };
    return { fn, error: null };
  } catch (e) {
    return { fn: null, error: formatParseError(expr, e) };
  }
}

/**
 * Compute the symbolic derivative of an expression with respect to a variable.
 * Returns null if symbolic differentiation fails.
 */
export function computeDerivative(expr: string, variable: string): string | null {
  try {
    const node = mathjsParse(expr);
    const d = mathjsDerivative(node, variable);
    return d.toString();
  } catch {
    return null;
  }
}

/** Format a parse error into a user-friendly message */
function formatParseError(expr: string, error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;
    // Extract position information if available
    const posMatch = msg.match(/character (\d+)/i);
    if (posMatch?.[1]) {
      const pos = parseInt(posMatch[1], 10);
      const char = expr[pos - 1];
      return `Parse error at position ${pos}${char ? ` (near '${char}')` : ''}: ${msg}`;
    }
    // Identify unknown variables
    const unknownMatch = msg.match(/Undefined symbol (\w+)/i);
    if (unknownMatch?.[1]) {
      return `Unknown variable '${unknownMatch[1]}' — use x, y, or z`;
    }
    return `Expression error: ${msg}`;
  }
  return 'Failed to parse expression';
}
