/** Default rendering bounds for 3D scenes */
export const BOUNDS_3D = {
  xMin: -6, xMax: 6,
  yMin: -6, yMax: 6,
  zMin: -6, zMax: 6,
} as const;

/** Default rendering bounds for 2D scenes */
export const BOUNDS_2D = {
  xMin: -10, xMax: 10,
  yMin: -10, yMax: 10,
} as const;

/** Default ISO level for marching cubes */
export const DEFAULT_ISO = 0;

/** Default render resolution */
export const DEFAULT_RESOLUTION = 64;

/** Max equation history entries */
export const MAX_HISTORY = 20;

/** LocalStorage keys */
export const LS_HISTORY = 'eq-universe-history';
export const LS_FAVORITES = 'eq-universe-favorites';
export const LS_THEME = 'eq-universe-theme';

/** Intro animation duration in ms */
export const INTRO_DURATION = 5400;

/** Named presets that bypass expression parsing */
export const NAMED_PRESETS = [
  'lorenz', 'rossler', 'vanderpol', 'duffing',
  'mandelbrot', 'julia', 'julia2', 'burningship',
  'helix', 'torus_param', 'mobius', 'trefoil', 'klein',
  'vf_rotation', 'vf_sink', 'vf_saddle', 'vf_electric',
  'gyroid',
] as const;

export type NamedPreset = typeof NAMED_PRESETS[number];

/** ODE integration parameters */
export const ODE_DT = 0.005;
export const ODE_STEPS = 8000;

/** Vector field grid density */
export const VF_GRID = 12;
