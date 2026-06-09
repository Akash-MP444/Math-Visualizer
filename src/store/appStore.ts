'use client';

import { create } from 'zustand';
import type { AppState, ParsedEquation, CameraState, MathAnalysis, ThemeName } from '@/types/math';
import {
  DEFAULT_ISO, DEFAULT_RESOLUTION, MAX_HISTORY,
  LS_HISTORY, LS_FAVORITES, LS_THEME,
} from '@/utils/constants';

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

interface AppActions {
  setEquation: (eq: string) => void;
  setParsed: (p: ParsedEquation | null) => void;
  setDimension: (d: AppState['dimension']) => void;
  setColorScheme: (id: number) => void;
  setResolution: (r: number) => void;
  setIsoValue: (v: number) => void;
  setWireframeMix: (w: number) => void;
  setRotationSpeed: (s: number) => void;
  setAutoRotate: (on: boolean) => void;
  updateCamera: (partial: Partial<CameraState>) => void;
  resetCamera: () => void;
  addToHistory: (eq: string) => void;
  toggleFavorite: (eq: string) => void;
  setIsRendering: (on: boolean) => void;
  setRenderProgress: (pct: number) => void;
  setError: (msg: string | null) => void;
  setAnalysis: (a: MathAnalysis | null) => void;
  setTheme: (t: ThemeName) => void;
}

const DEFAULT_CAMERA: CameraState = { theta: 0, phi: 0.524, zoom: 5, panX: 0, panY: 0 };

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  // Equation
  equation: '',
  parsed: null,

  // View
  dimension: '3d',
  colorScheme: 0,

  // Render settings
  resolution: DEFAULT_RESOLUTION,
  isoValue: DEFAULT_ISO,
  wireframeMix: 0,
  rotationSpeed: 0.003,
  autoRotate: true,

  // Camera
  camera: DEFAULT_CAMERA,

  // Persistence
  history: loadFromStorage<string[]>(LS_HISTORY, []),
  favorites: loadFromStorage<string[]>(LS_FAVORITES, []),

  // Status
  isRendering: false,
  renderProgress: 0,
  error: null,
  analysis: null,

  // Theme
  theme: loadFromStorage<ThemeName>(LS_THEME, 'cyan'),

  // ── Actions ──────────────────────────────────────────────────────────────

  setEquation: (eq) => set({ equation: eq }),
  setParsed: (p) => set({ parsed: p }),
  setDimension: (d) => set({ dimension: d }),
  setColorScheme: (id) => set({ colorScheme: id }),
  setResolution: (r) => set({ resolution: r }),
  setIsoValue: (v) => set({ isoValue: v }),
  setWireframeMix: (w) => set({ wireframeMix: w }),
  setRotationSpeed: (s) => set({ rotationSpeed: s }),
  setAutoRotate: (on) => set({ autoRotate: on }),

  updateCamera: (partial) =>
    set((state) => ({ camera: { ...state.camera, ...partial } })),

  resetCamera: () => set({ camera: DEFAULT_CAMERA }),

  addToHistory: (eq) => {
    const { history } = get();
    const next = [eq, ...history.filter((h) => h !== eq)].slice(0, MAX_HISTORY);
    saveToStorage(LS_HISTORY, next);
    set({ history: next });
  },

  toggleFavorite: (eq) => {
    const { favorites } = get();
    const next = favorites.includes(eq)
      ? favorites.filter((f) => f !== eq)
      : [eq, ...favorites];
    saveToStorage(LS_FAVORITES, next);
    set({ favorites: next });
  },

  setIsRendering: (on) => set({ isRendering: on, renderProgress: on ? 0 : 100 }),
  setRenderProgress: (pct) => set({ renderProgress: pct }),
  setError: (msg) => set({ error: msg }),
  setAnalysis: (a) => set({ analysis: a }),

  setTheme: (t) => {
    saveToStorage(LS_THEME, t);
    set({ theme: t });
  },
}));
