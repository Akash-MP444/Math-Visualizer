/**
 * Duffing oscillator and Van der Pol limit cycle systems.
 */

import type { PathResult } from '@/types/math';
import { ODE_DT, ODE_STEPS } from '@/utils/constants';

type State3 = [number, number, number];
type State2 = [number, number, number]; // 3rd element unused (z=0)

// ── Duffing ──────────────────────────────────────────────────────────────────

function duffingDerivative([x, y, t]: State3): State3 {
  const alpha = 1, beta = -1, delta = 0.3, gamma = 0.5, omega = 1.2;
  return [
    y,
    -delta * y - alpha * x - beta * x ** 3 + gamma * Math.cos(omega * t),
    1,
  ];
}

function rk4_3(state: State3, dt: number, deriv: (s: State3) => State3): State3 {
  const k1 = deriv(state);
  const s1: State3 = [state[0] + k1[0] * dt / 2, state[1] + k1[1] * dt / 2, state[2] + k1[2] * dt / 2];
  const k2 = deriv(s1);
  const s2: State3 = [state[0] + k2[0] * dt / 2, state[1] + k2[1] * dt / 2, state[2] + k2[2] * dt / 2];
  const k3 = deriv(s2);
  const s3: State3 = [state[0] + k3[0] * dt, state[1] + k3[1] * dt, state[2] + k3[2] * dt];
  const k4 = deriv(s3);
  return [
    state[0] + (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) * dt / 6,
    state[1] + (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) * dt / 6,
    state[2] + (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]) * dt / 6,
  ];
}

export function integrateDuffing(
  initial: State3 = [0.1, 0, 0.5],
  dt = ODE_DT,
  steps = ODE_STEPS
): PathResult {
  const t0 = performance.now();
  const points: [number, number, number][] = [];
  let state = initial;

  for (let i = 0; i < steps; i++) {
    points.push([state[0] / 4, state[1] / 4, 0]);
    const next = rk4_3(state, dt, duffingDerivative);
    if (next.some(v => !isFinite(v) || Math.abs(v) > 200)) break;
    state = next;
  }

  return { points, renderTimeMs: performance.now() - t0 };
}

// ── Van der Pol ───────────────────────────────────────────────────────────────

function vanDerPolDerivative([x, y]: State2): State2 {
  const mu = 2;
  return [y, mu * (1 - x * x) * y - x, 0];
}

export function integrateVanDerPol(
  initial: State2 = [0.1, 0, 0],
  dt = ODE_DT,
  steps = ODE_STEPS
): PathResult {
  const t0 = performance.now();
  const points: [number, number, number][] = [];
  let state = initial;

  for (let i = 0; i < steps; i++) {
    points.push([state[0] / 4, state[1] / 4, 0]);
    const next = rk4_3(state, dt, vanDerPolDerivative);
    if (next.some(v => !isFinite(v) || Math.abs(v) > 200)) break;
    state = next;
  }

  return { points, renderTimeMs: performance.now() - t0 };
}
