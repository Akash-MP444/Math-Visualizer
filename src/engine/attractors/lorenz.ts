/**
 * Lorenz attractor: σ=10, ρ=28, β=8/3
 * Classic chaotic strange attractor.
 */

import type { PathResult } from '@/types/math';
import { ODE_DT, ODE_STEPS } from '@/utils/constants';

type State = [number, number, number];

function lorenzDerivative([x, y, z]: State): State {
  const sigma = 10, rho = 28, beta = 8 / 3;
  return [sigma * (y - x), x * (rho - z) - y, x * y - beta * z];
}

function rk4Step(state: State, dt: number): State {
  const k1 = lorenzDerivative(state);
  const s1: State = [state[0] + k1[0] * dt / 2, state[1] + k1[1] * dt / 2, state[2] + k1[2] * dt / 2];
  const k2 = lorenzDerivative(s1);
  const s2: State = [state[0] + k2[0] * dt / 2, state[1] + k2[1] * dt / 2, state[2] + k2[2] * dt / 2];
  const k3 = lorenzDerivative(s2);
  const s3: State = [state[0] + k3[0] * dt, state[1] + k3[1] * dt, state[2] + k3[2] * dt];
  const k4 = lorenzDerivative(s3);
  return [
    state[0] + (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) * dt / 6,
    state[1] + (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) * dt / 6,
    state[2] + (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]) * dt / 6,
  ];
}

/** Integrate the Lorenz system and return normalised 3D path points */
export function integrateLorenz(
  initial: State = [0.1, 0, 0.5],
  dt = ODE_DT,
  steps = ODE_STEPS
): PathResult {
  const t0 = performance.now();
  const points: [number, number, number][] = [];
  let state = initial;

  for (let i = 0; i < steps; i++) {
    // Normalise: x/10, z/30-0.5, y/10 for good viewport fit
    points.push([state[0] / 10, state[2] / 30 - 0.5, state[1] / 10]);
    const next = rk4Step(state, dt);
    if (next.some(v => !isFinite(v) || Math.abs(v) > 200)) break;
    state = next;
  }

  return { points, renderTimeMs: performance.now() - t0 };
}
