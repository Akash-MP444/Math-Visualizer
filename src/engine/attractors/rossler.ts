/**
 * Rössler attractor: a=0.2, b=0.2, c=5.7
 * Generates a spiral-shaped strange attractor.
 */

import type { PathResult } from '@/types/math';
import { ODE_DT, ODE_STEPS } from '@/utils/constants';

type State = [number, number, number];

function rosslerDerivative([x, y, z]: State): State {
  const a = 0.2, b = 0.2, c = 5.7;
  return [-y - z, x + a * y, b + z * (x - c)];
}

function rk4Step(state: State, dt: number): State {
  const k1 = rosslerDerivative(state);
  const s1: State = [state[0] + k1[0] * dt / 2, state[1] + k1[1] * dt / 2, state[2] + k1[2] * dt / 2];
  const k2 = rosslerDerivative(s1);
  const s2: State = [state[0] + k2[0] * dt / 2, state[1] + k2[1] * dt / 2, state[2] + k2[2] * dt / 2];
  const k3 = rosslerDerivative(s2);
  const s3: State = [state[0] + k3[0] * dt, state[1] + k3[1] * dt, state[2] + k3[2] * dt];
  const k4 = rosslerDerivative(s3);
  return [
    state[0] + (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) * dt / 6,
    state[1] + (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) * dt / 6,
    state[2] + (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]) * dt / 6,
  ];
}

export function integrateRossler(
  initial: State = [0.1, 0, 0.5],
  dt = ODE_DT,
  steps = ODE_STEPS
): PathResult {
  const t0 = performance.now();
  const points: [number, number, number][] = [];
  let state = initial;

  for (let i = 0; i < steps; i++) {
    points.push([state[0] / 10, state[2] / 30 - 0.5, state[1] / 10]);
    const next = rk4Step(state, dt);
    if (next.some(v => !isFinite(v) || Math.abs(v) > 200)) break;
    state = next;
  }

  return { points, renderTimeMs: performance.now() - t0 };
}
