/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Linear interpolate between a and b by t */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Map value from one range to another */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/** Compute cross product of two 3D vectors */
export function cross(
  ax: number, ay: number, az: number,
  bx: number, by: number, bz: number
): [number, number, number] {
  return [
    ay * bz - az * by,
    az * bx - ax * bz,
    ax * by - ay * bx,
  ];
}

/** Normalize a 3D vector, returns [0,0,1] for zero-length */
export function normalize(x: number, y: number, z: number): [number, number, number] {
  const len = Math.sqrt(x * x + y * y + z * z) || 1;
  return [x / len, y / len, z / len];
}

/** Compute face normal for a triangle */
export function faceNormal(
  ax: number, ay: number, az: number,
  bx: number, by: number, bz: number,
  cx: number, cy: number, cz: number
): [number, number, number] {
  const [ex, ey, ez] = [bx - ax, by - ay, bz - az];
  const [fx, fy, fz] = [cx - ax, cy - ay, cz - az];
  const [nx, ny, nz] = cross(ex, ey, ez, fx, fy, fz);
  return normalize(nx, ny, nz);
}

/** Format a number with SI suffix (K, M) */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

/** Degrees to radians */
export function deg2rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Radians to degrees */
export function rad2deg(rad: number): number {
  return (rad * 180) / Math.PI;
}
