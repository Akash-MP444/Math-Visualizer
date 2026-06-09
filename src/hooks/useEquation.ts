'use client';

import { useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import { classifyEquation } from '@/engine/parser/classifier';
import { computeDerivative } from '@/engine/parser/parser';
import type { MathAnalysis, ParsedEquation } from '@/types/math';

export function useEquation() {
  const {
    equation, parsed, history, favorites,
    setEquation, setParsed, addToHistory,
    toggleFavorite, setError, setAnalysis,
  } = useAppStore();

  const parseEquation = useCallback((raw: string): ParsedEquation | null => {
    if (!raw.trim()) return null;
    try {
      return classifyEquation(raw);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse equation');
      return null;
    }
  }, [setError]);

  const submitEquation = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    setError(null);
    const p = parseEquation(trimmed);
    if (!p) return null;
    setEquation(trimmed);
    setParsed(p);
    addToHistory(trimmed);
    setAnalysis(computeAnalysis(p));
    return p;
  }, [parseEquation, setEquation, setParsed, addToHistory, setAnalysis, setError]);

  const loadPreset = useCallback((value: string) => submitEquation(value), [submitEquation]);
  const isFavorite = (eq: string) => favorites.includes(eq);

  return {
    equation, parsed, history, favorites, isFavorite,
    submitEquation, loadPreset, toggleFavorite, setEquation,
  };
}

function computeAnalysis(p: ParsedEquation): MathAnalysis | null {
  if (['fractal', 'ode', 'vectorfield', 'parametric', 'unknown'].includes(p.type)) return null;

  const variables = p.variables;
  let derivative: string | undefined;
  let symmetry: MathAnalysis['symmetry'] = 'unknown';
  let roots: string | undefined;
  let criticalPoints: string | undefined;

  if (p.type === 'explicit2d' && p.expr) {
    const d = computeDerivative(p.expr, 'x');
    if (d) {
      derivative = `dy/dx = ${d}`;
      const d2 = computeDerivative(d, 'x');
      if (d2) criticalPoints = `f\'(x) = ${d} = 0`;
    }
    symmetry = detectSymmetry(p.expr);
    roots = estimateRoots(p.expr);
  } else if (p.type === 'explicit3d' && p.expr) {
    const dx = computeDerivative(p.expr, 'x');
    if (dx) derivative = `∂z/∂x = ${dx}`;
    symmetry = 'unknown';
  } else if (p.type === 'implicit2d' || p.type === 'implicit3d') {
    symmetry = detectImplicitSymmetry(p.expr ?? p.raw);
  }

  const result: MathAnalysis = { variables, symmetry };
  if (derivative) result.derivative = derivative;
  if (roots) result.roots = roots;
  if (criticalPoints) result.criticalPoints = criticalPoints;
  if (variables.includes('x')) result.domain = 'ℝ (sampled ±10)';
  if (p.type === 'explicit2d') result.range = 'ℝ (estimated)';
  return result;
}

function detectSymmetry(expr: string): MathAnalysis['symmetry'] {
  const hasEven = /x\^2|x\*x|\bx2\b/.test(expr);
  const hasOdd = /x\^[13579]/.test(expr) || (/\bx\b/.test(expr) && !/x\^/.test(expr));
  if (hasEven && !hasOdd) return 'y-axis';
  if (!hasEven && hasOdd) return 'origin';
  return 'none';
}

function detectImplicitSymmetry(expr: string): MathAnalysis['symmetry'] {
  if (/x\^2/.test(expr) && /y\^2/.test(expr) && !(/\bx\b(?!\^)/.test(expr))) return 'origin';
  if (/x\^2/.test(expr)) return 'y-axis';
  if (/y\^2/.test(expr)) return 'x-axis';
  return 'none';
}

function estimateRoots(expr: string): string | undefined {
  // Simple heuristics for common patterns
  if (/^x\^2/.test(expr)) return 'x = 0 (double root)';
  if (/^x\^3/.test(expr)) return 'x = 0';
  if (/sin\(x\)/.test(expr)) return 'x = nπ, n ∈ ℤ';
  if (/cos\(x\)/.test(expr)) return 'x = π/2 + nπ, n ∈ ℤ';
  return 'Numerical (see graph)';
}
