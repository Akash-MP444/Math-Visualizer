export interface PresetItem {
  label: string;
  description: string;
  value: string;
}

export interface PresetGroup {
  title: string;
  items: PresetItem[];
}

export const PRESET_GROUPS: PresetGroup[] = [
  {
    title: 'Implicit Curves (2D)',
    items: [
      { label: 'x²+y²=1', description: 'Unit circle', value: 'x^2+y^2=1' },
      { label: 'x²/4+y²=1', description: 'Ellipse', value: 'x^2/4+y^2=1' },
      { label: 'Lemniscate', description: 'Figure-eight', value: '(x^2+y^2)^2=x^2-y^2' },
      { label: 'Heart curve', description: 'Cardioid form', value: '(x^2+y^2-1)^3=x^2*y^3' },
      { label: 'x²-y²=1', description: 'Hyperbola', value: 'x^2-y^2=1' },
      { label: 'y=sin(x)', description: 'Sine wave', value: 'y=sin(x)' },
      { label: 'y=x³-3x', description: 'Cubic', value: 'y=x^3-3*x' },
    ],
  },
  {
    title: 'Implicit Surfaces (3D)',
    items: [
      { label: 'Sphere', description: 'x²+y²+z²=1', value: 'x^2+y^2+z^2=1' },
      { label: 'Large sphere', description: 'r=2', value: 'x^2+y^2+z^2=4' },
      { label: 'Torus', description: 'Major r=2, minor r=1', value: '(sqrt(x^2+y^2)-2)^2+z^2=1' },
      { label: 'Gyroid', description: 'Triply periodic', value: 'sin(x)*cos(y)+sin(y)*cos(z)+sin(z)*cos(x)=0' },
      { label: 'Hyperboloid', description: 'One sheet', value: 'x^2+y^2-z^2=1' },
      { label: 'Squircle surf', description: 'L4 ball', value: 'x^4+y^4+z^4=1' },
    ],
  },
  {
    title: 'Explicit Surfaces',
    items: [
      { label: 'z=sin(x)cos(y)', description: 'Wave surface', value: 'z=sin(x)*cos(y)' },
      { label: 'Ripple', description: 'Radial waves', value: 'z=sin(sqrt(x^2+y^2))' },
      { label: 'Mexican hat', description: 'Sombrero', value: 'z=x*exp(-(x^2+y^2))' },
      { label: 'z=sin(x)+cos(y)', description: 'Undulation', value: 'z=sin(x)+cos(y)' },
      { label: 'Saddle', description: 'Hyperbolic paraboloid', value: 'z=x^2-y^2' },
      { label: 'z=sin(xy)', description: 'Cross product wave', value: 'z=sin(x*y)' },
    ],
  },
  {
    title: 'Parametric',
    items: [
      { label: 'Helix', description: '3D spiral', value: 'helix' },
      { label: 'Torus (UV)', description: 'Parametric torus', value: 'torus_param' },
      { label: 'Möbius Strip', description: 'Non-orientable', value: 'mobius' },
      { label: 'Trefoil Knot', description: 'Knotted torus', value: 'trefoil' },
      { label: 'Klein Bottle', description: 'Non-orientable surface', value: 'klein' },
    ],
  },
  {
    title: 'Vector Fields',
    items: [
      { label: 'Rotation field', description: '(-y,x)', value: 'vf_rotation' },
      { label: 'Sink field', description: 'Inward flow', value: 'vf_sink' },
      { label: 'Saddle field', description: '(x,-y)', value: 'vf_saddle' },
      { label: 'Electric dipole', description: 'E-field lines', value: 'vf_electric' },
    ],
  },
  {
    title: 'Differential Equations',
    items: [
      { label: 'Lorenz Attractor', description: 'Chaotic system', value: 'lorenz' },
      { label: 'Rössler Attractor', description: 'Spiral chaos', value: 'rossler' },
      { label: 'Van der Pol', description: 'Limit cycle', value: 'vanderpol' },
      { label: 'Duffing Oscillator', description: 'Nonlinear osc.', value: 'duffing' },
    ],
  },
  {
    title: 'Fractals',
    items: [
      { label: 'Mandelbrot Set', description: 'Classic fractal', value: 'mandelbrot' },
      { label: 'Julia Set', description: 'c=-0.7+0.27i', value: 'julia' },
      { label: 'Burning Ship', description: 'Variant fractal', value: 'burningship' },
      { label: 'Julia Variant', description: 'c=0.355+0.355i', value: 'julia2' },
    ],
  },
];

export const QUICK_CHIPS = [
  'mandelbrot', 'lorenz', 'x^2+y^2+z^2=1',
  'julia', 'torus_param', 'vf_rotation',
  'z=sin(x)*cos(y)', 'sin(x)*cos(y)+sin(y)*cos(z)+sin(z)*cos(x)=0',
];

export const QUICK_CHIP_LABELS: Record<string, string> = {
  'mandelbrot': 'Mandelbrot',
  'lorenz': 'Lorenz',
  'x^2+y^2+z^2=1': 'Sphere',
  'julia': 'Julia',
  'torus_param': 'Torus',
  'vf_rotation': 'Rotation',
  'z=sin(x)*cos(y)': 'Wave',
  'sin(x)*cos(y)+sin(y)*cos(z)+sin(z)*cos(x)=0': 'Gyroid',
};

export const RANDOM_PRESETS = [
  'x^2+y^2+z^2=1', 'z=sin(x)*cos(y)', 'lorenz', 'mandelbrot',
  'torus_param', '(sqrt(x^2+y^2)-2)^2+z^2=1',
  'sin(x)*cos(y)+sin(y)*cos(z)+sin(z)*cos(x)=0',
  'rossler', 'julia', 'mobius', 'z=x*exp(-(x^2+y^2))',
  'x^2+y^2=1', '(x^2+y^2)^2=x^2-y^2', 'vf_rotation',
  'trefoil', 'z=sin(sqrt(x^2+y^2))', 'burningship',
];
