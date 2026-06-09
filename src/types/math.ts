export type EquationType =
  | 'implicit3d'
  | 'explicit3d'
  | 'implicit2d'
  | 'explicit2d'
  | 'parametric'
  | 'fractal'
  | 'ode'
  | 'vectorfield'
  | 'unknown';

export interface ParsedEquation {
  raw: string;
  normalized: string;
  type: EquationType;
  variables: string[];
  lhs?: string;
  rhs?: string;
  expr?: string;
  name?: string;
}

export interface GeometryResult {
  positions: Float32Array;
  normals: Float32Array;
  vertexCount: number;
  triangleCount: number;
  renderTimeMs: number;
}

export interface Lines2DResult {
  lines: [number, number][];
  renderTimeMs: number;
}

export interface PathResult {
  points: [number, number, number][];
  renderTimeMs: number;
}

export interface Arrow {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export interface CameraState {
  theta: number;
  phi: number;
  zoom: number;
  panX: number;
  panY: number;
}

export interface MathAnalysis {
  derivative?: string;
  variables: string[];
  symmetry: 'x-axis' | 'y-axis' | 'origin' | 'none' | 'unknown';
  domain?: string;
  range?: string;
  roots?: string;
  criticalPoints?: string;
}

export interface AppState {
  equation: string;
  parsed: ParsedEquation | null;
  dimension: '3d' | '2d' | 'fractal' | 'vfield';
  colorScheme: number;
  resolution: number;
  isoValue: number;
  wireframeMix: number;
  rotationSpeed: number;
  autoRotate: boolean;
  camera: CameraState;
  history: string[];
  favorites: string[];
  isRendering: boolean;
  renderProgress: number;
  error: string | null;
  analysis: MathAnalysis | null;
  theme: ThemeName;
}

export type ThemeName = 'cyan' | 'green' | 'purple' | 'cyberpunk' | 'matrix' | 'dracula' | 'nord';

export interface WorkerRequest {
  expression: string;
  resolution: number;
  isoValue: number;
  range: number;
}

export interface WorkerResponse {
  positions: number[];
  normals: number[];
  progress?: number;
  error?: string;
}
