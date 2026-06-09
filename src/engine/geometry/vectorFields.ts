/**
 * Vector field definitions and arrow data generator.
 * Each field maps (x, y) → (dx, dy) direction vectors.
 */

import type { Arrow } from '@/types/math';
import { VF_GRID } from '@/utils/constants';

type VFn = (x: number, y: number) => [number, number];

const FIELDS: Record<string, VFn> = {
  vf_rotation: (x, y) => [-y, x],
  vf_sink:     (x, y) => [-x, -y],
  vf_saddle:   (x, y) => [x, -y],
  vf_electric: (x, y) => {
    const r1 = Math.sqrt((x - 1) ** 2 + y ** 2) + 0.01;
    const r2 = Math.sqrt((x + 1) ** 2 + y ** 2) + 0.01;
    return [
      (x - 1) / r1 ** 3 - (x + 1) / r2 ** 3,
      y / r1 ** 3 - y / r2 ** 3,
    ];
  },
};

/**
 * Generate normalised arrow data for a named vector field.
 * Arrows are placed on a uniform grid over [-range, range]².
 */
export function buildVectorField(name: string, range = 6): Arrow[] | null {
  const fn = FIELDS[name];
  if (!fn) return null;

  const arrows: Arrow[] = [];
  const grid = VF_GRID;

  for (let ix = 0; ix < grid; ix++) {
    for (let iy = 0; iy < grid; iy++) {
      const x = ((ix / grid) - 0.5) * range * 2;
      const y = ((iy / grid) - 0.5) * range * 2;
      const [rawDx, rawDy] = fn(x, y);
      const mag = Math.sqrt(rawDx ** 2 + rawDy ** 2) || 1;
      arrows.push({ x, y, dx: rawDx / mag, dy: rawDy / mag });
    }
  }

  return arrows;
}
