import { describe, it, expect } from 'vitest';
import { parseExplicit2D, parseExplicit3D, parseImplicit3D, parseImplicit2D, computeDerivative } from '../engine/parser/parser';

describe('parseExplicit2D', () => {
  it('evaluates sin(x)', () => {
    const { fn } = parseExplicit2D('sin(x)');
    expect(fn).not.toBeNull();
    expect(fn!(0)).toBeCloseTo(0);
    expect(fn!(Math.PI / 2)).toBeCloseTo(1);
  });

  it('evaluates x^2', () => {
    const { fn } = parseExplicit2D('x^2');
    expect(fn).not.toBeNull();
    expect(fn!(3)).toBeCloseTo(9);
    expect(fn!(-2)).toBeCloseTo(4);
  });

  it('returns error for invalid expression', () => {
    const { fn, error } = parseExplicit2D('sin(x');
    expect(fn).toBeNull();
    expect(error).toBeTruthy();
  });

  it('returns NaN for unknown variables', () => {
    const { fn } = parseExplicit2D('q');
    // mathjs will throw, fn returns NaN
    expect(fn).not.toBeNull();
    expect(isNaN(fn!(1))).toBe(true);
  });
});

describe('parseExplicit3D', () => {
  it('evaluates sin(x)*cos(y)', () => {
    const { fn } = parseExplicit3D('sin(x)*cos(y)');
    expect(fn).not.toBeNull();
    expect(fn!(0, 0)).toBeCloseTo(0);
    expect(fn!(Math.PI / 2, 0)).toBeCloseTo(1);
  });

  it('evaluates x^2-y^2', () => {
    const { fn } = parseExplicit3D('x^2-y^2');
    expect(fn).not.toBeNull();
    expect(fn!(2, 1)).toBeCloseTo(3);
  });
});

describe('parseImplicit3D', () => {
  it('evaluates sphere equation (x^2+y^2+z^2)-1', () => {
    const { fn } = parseImplicit3D('(x^2+y^2+z^2)-(1)');
    expect(fn).not.toBeNull();
    // On surface: should be ~0
    expect(fn!(1, 0, 0)).toBeCloseTo(0, 3);
    // Inside: negative
    expect(fn!(0, 0, 0)).toBeCloseTo(-1);
  });
});

describe('parseImplicit2D', () => {
  it('evaluates circle x^2+y^2-1', () => {
    const { fn } = parseImplicit2D('(x^2+y^2)-(1)');
    expect(fn).not.toBeNull();
    expect(fn!(1, 0)).toBeCloseTo(0, 3);
    expect(fn!(0, 0)).toBeCloseTo(-1);
  });
});

describe('computeDerivative', () => {
  it('differentiates x^2 to 2*x', () => {
    const d = computeDerivative('x^2', 'x');
    expect(d).not.toBeNull();
    expect(d).toMatch(/2.*x|x.*2/);
  });

  it('differentiates sin(x) to cos(x)', () => {
    const d = computeDerivative('sin(x)', 'x');
    expect(d).not.toBeNull();
    expect(d?.toLowerCase()).toContain('cos');
  });

  it('returns null for invalid expressions', () => {
    const d = computeDerivative('sin(x', 'x');
    expect(d).toBeNull();
  });
});
