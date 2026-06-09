import { describe, it, expect } from 'vitest';
import { classifyEquation } from '../engine/parser/classifier';

describe('classifyEquation', () => {
  // Named presets
  it('classifies lorenz as ode', () => {
    expect(classifyEquation('lorenz').type).toBe('ode');
    expect(classifyEquation('Lorenz').type).toBe('ode');
  });
  it('classifies mandelbrot as fractal', () => {
    expect(classifyEquation('mandelbrot').type).toBe('fractal');
  });
  it('classifies julia as fractal', () => {
    expect(classifyEquation('julia').type).toBe('fractal');
  });
  it('classifies torus_param as parametric', () => {
    expect(classifyEquation('torus_param').type).toBe('parametric');
  });
  it('classifies helix as parametric', () => {
    expect(classifyEquation('helix').type).toBe('parametric');
  });
  it('classifies vf_rotation as vectorfield', () => {
    expect(classifyEquation('vf_rotation').type).toBe('vectorfield');
  });

  // Explicit surfaces
  it('classifies z=sin(x)*cos(y) as explicit3d', () => {
    const r = classifyEquation('z=sin(x)*cos(y)');
    expect(r.type).toBe('explicit3d');
    expect(r.expr).toBe('sin(x)*cos(y)');
  });
  it('classifies y=sin(x) as explicit2d', () => {
    const r = classifyEquation('y=sin(x)');
    expect(r.type).toBe('explicit2d');
    expect(r.expr).toBe('sin(x)');
  });

  // Implicit surfaces
  it('classifies x^2+y^2+z^2=1 as implicit3d', () => {
    const r = classifyEquation('x^2+y^2+z^2=1');
    expect(r.type).toBe('implicit3d');
    expect(r.variables).toContain('x');
    expect(r.variables).toContain('z');
  });
  it('classifies x^2+y^2=1 as implicit2d', () => {
    const r = classifyEquation('x^2+y^2=1');
    expect(r.type).toBe('implicit2d');
    expect(r.variables).not.toContain('z');
  });

  // Aliases
  it('classifies gyroid as implicit3d', () => {
    expect(classifyEquation('gyroid').type).toBe('implicit3d');
  });

  // Bracket validation
  it('throws on unbalanced brackets', () => {
    expect(() => classifyEquation('sin(x')).toThrow();
  });
  it('throws on extra closing bracket', () => {
    expect(() => classifyEquation('sin(x))')).toThrow();
  });
});
