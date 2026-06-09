import type { ThemeName } from '@/types/math';

export interface ColorScheme {
  id: number;
  label: string;
  gradient: string;
  /** Returns RGB components (0-255) given intensity and height factor h (0-1) */
  rgb: (h: number, intensity: number) => [number, number, number];
}

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: 0,
    label: 'Cyan-Blue',
    gradient: 'linear-gradient(135deg,#00d4ff,#0047ff)',
    rgb: (h, i) => [Math.floor((0 + h * 50) * i), Math.floor((100 + h * 112) * i), Math.floor(255 * i)],
  },
  {
    id: 1,
    label: 'Green',
    gradient: 'linear-gradient(135deg,#00ff88,#00cc44)',
    rgb: (h, i) => [0, Math.floor((100 + h * 155) * i), Math.floor((80 + h * 100) * i)],
  },
  {
    id: 2,
    label: 'Purple-Pink',
    gradient: 'linear-gradient(135deg,#a855f7,#ec4899)',
    rgb: (h, i) => [Math.floor((100 + h * 168) * i), 0, Math.floor((180 + h * 75) * i)],
  },
  {
    id: 3,
    label: 'Amber-Red',
    gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)',
    rgb: (h, i) => [Math.floor(245 * i), Math.floor((80 + h * 178) * i), 0],
  },
  {
    id: 4,
    label: 'White',
    gradient: 'linear-gradient(135deg,#fff,#94a3b8)',
    rgb: (h, i) => {
      const v = Math.floor((200 + h * 55) * i);
      return [v, v, v];
    },
  },
  {
    id: 5,
    label: 'Rainbow',
    gradient: 'linear-gradient(135deg,#f97316,#84cc16)',
    rgb: (h, i) => [
      Math.floor(255 * Math.sin(h * Math.PI) * i),
      Math.floor(255 * Math.sin(h * Math.PI + 2.1) * i),
      Math.floor(255 * Math.sin(h * Math.PI + 4.2) * i),
    ],
  },
];

/** Compute a shaded RGB color string for a 3D surface triangle */
export function getSurfaceColor(
  nx: number, ny: number, nz: number,
  y: number,
  schemeId: number
): string {
  const light = [0.577, 0.577, 0.577] as const;
  const diff = Math.max(0, nx * light[0] + ny * light[1] + nz * light[2]);
  const amb = 0.25;
  const spec = Math.pow(Math.max(0, diff), 12) * 0.5;
  const intensity = amb + diff * 0.75 + spec;
  const h = clamp01((y + 3) / 6);
  const scheme = COLOR_SCHEMES[schemeId] ?? COLOR_SCHEMES[0]!;
  const [r, g, b] = scheme.rgb(h, intensity);
  return `rgb(${clamp255(r)},${clamp255(g)},${clamp255(b)})`;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function clamp255(v: number): number {
  return Math.max(0, Math.min(255, Math.floor(v)));
}

/** CSS variables for each theme */
export const THEMES: Record<ThemeName, Record<string, string>> = {
  cyan: {
    '--accent': '#00d4ff',
    '--accent2': '#00a8cc',
    '--accent3': '#007a99',
    '--accent-sec': '#00ff88',
    '--accent-sec2': '#00cc6a',
  },
  green: {
    '--accent': '#00ff88',
    '--accent2': '#00cc6a',
    '--accent3': '#009944',
    '--accent-sec': '#00d4ff',
    '--accent-sec2': '#00a8cc',
  },
  purple: {
    '--accent': '#a855f7',
    '--accent2': '#7c3aed',
    '--accent3': '#5b21b6',
    '--accent-sec': '#f472b6',
    '--accent-sec2': '#ec4899',
  },
  cyberpunk: {
    '--accent': '#ff00ff',
    '--accent2': '#cc00cc',
    '--accent3': '#990099',
    '--accent-sec': '#00ffff',
    '--accent-sec2': '#00cccc',
  },
  matrix: {
    '--accent': '#00ff00',
    '--accent2': '#00cc00',
    '--accent3': '#009900',
    '--accent-sec': '#003300',
    '--accent-sec2': '#002200',
  },
  dracula: {
    '--accent': '#bd93f9',
    '--accent2': '#9966cc',
    '--accent3': '#6644aa',
    '--accent-sec': '#ff79c6',
    '--accent-sec2': '#cc5599',
  },
  nord: {
    '--accent': '#88c0d0',
    '--accent2': '#5e81ac',
    '--accent3': '#4c566a',
    '--accent-sec': '#81a1c1',
    '--accent-sec2': '#5e81ac',
  },
};
