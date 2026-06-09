'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import { useCamera } from '@/hooks/useCamera';
import { renderMesh, renderPath, renderVectorField, render2DLines } from '@/engine/render/renderer';
import { renderFractal } from '@/engine/fractals/mandelbrot';
import StatusBar from './StatusBar';
import type { GeometryResult, PathResult, Arrow } from '@/types/math';

interface CanvasContainerProps {
  geometry: GeometryResult | null;
  path: PathResult | null;
  lines2d: [number, number][] | null;
  arrows: Arrow[] | null;
  fractalType: string | null;
  equationType: string;
  displayLabel: string;
  canvasRef3d: React.RefObject<HTMLCanvasElement>;
}

export default function CanvasContainer({
  geometry, path, lines2d, arrows, fractalType,
  equationType, displayLabel, canvasRef3d,
}: CanvasContainerProps) {
  const canvas2dRef = useRef<HTMLCanvasElement>(null);
  const canvasFracRef = useRef<HTMLCanvasElement>(null);
  const animIdRef = useRef<number>(0);
  const thetaRef = useRef(0);

  const { camera, autoRotate, rotationSpeed, updateCamera, handlers } = useCamera();
  const { colorScheme, wireframeMix } = useAppStore();

  // Keep a live ref to camera so the rAF loop sees latest values without re-creating
  const cameraRef = useRef(camera);
  const autoRotateRef = useRef(autoRotate);
  const rotSpeedRef = useRef(rotationSpeed);
  const colorRef = useRef(colorScheme);
  const wireRef = useRef(wireframeMix);
  useEffect(() => { cameraRef.current = camera; }, [camera]);
  useEffect(() => { autoRotateRef.current = autoRotate; }, [autoRotate]);
  useEffect(() => { rotSpeedRef.current = rotationSpeed; }, [rotationSpeed]);
  useEffect(() => { colorRef.current = colorScheme; }, [colorScheme]);
  useEffect(() => { wireRef.current = wireframeMix; }, [wireframeMix]);

  // Keep refs to geometry so rAF can read without re-subscribing
  const geoRef = useRef(geometry);
  const pathRef = useRef(path);
  const arrowsRef = useRef(arrows);
  useEffect(() => { geoRef.current = geometry; }, [geometry]);
  useEffect(() => { pathRef.current = path; }, [path]);
  useEffect(() => { arrowsRef.current = arrows; }, [arrows]);

  // ── Canvas resize ──────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const wrap = document.getElementById('canvas-wrap');
      if (!wrap) return;
      const W = wrap.clientWidth, H = wrap.clientHeight;
      const refs = [canvasRef3d, canvas2dRef, canvasFracRef];
      refs.forEach((r) => {
        if (r.current) { r.current.width = W; r.current.height = H; }
      });
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [canvasRef3d]);

  // ── 2D re-render on data or colorScheme change ─────────────────────────────
  useEffect(() => {
    const c = canvas2dRef.current;
    if (!c || !lines2d) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    render2DLines(ctx, lines2d, c.width, c.height, colorScheme);
  }, [lines2d, colorScheme]);

  // ── Fractal re-render ──────────────────────────────────────────────────────
  useEffect(() => {
    const c = canvasFracRef.current;
    if (!c || !fractalType) return;
    type FT = Parameters<typeof renderFractal>[1];
    renderFractal(c, fractalType as FT, colorScheme);
  }, [fractalType, colorScheme]);

  // ── Animation loop (stable — never re-created) ─────────────────────────────
  const animate = useCallback(() => {
    animIdRef.current = requestAnimationFrame(animate);

    if (autoRotateRef.current) {
      thetaRef.current += rotSpeedRef.current;
      updateCamera({ theta: thetaRef.current });
    } else {
      thetaRef.current = cameraRef.current.theta;
    }

    const c3 = canvasRef3d.current;
    if (!c3) return;
    const ctx = c3.getContext('2d');
    if (!ctx) return;
    const W = c3.width, H = c3.height;
    if (!W || !H) return;
    ctx.clearRect(0, 0, W, H);

    const cam = { ...cameraRef.current, theta: thetaRef.current };

    if (geoRef.current?.positions.length) {
      renderMesh(ctx, geoRef.current.positions, geoRef.current.normals, cam, W, H, colorRef.current, wireRef.current);
    } else if (pathRef.current?.points.length) {
      renderPath(ctx, pathRef.current.points, cam, W, H);
    } else if (arrowsRef.current?.length) {
      renderVectorField(ctx, arrowsRef.current, cam, W, H);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef3d, updateCamera]);

  useEffect(() => {
    animIdRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animIdRef.current);
  }, [animate]);

  const is3D = !!(geometry || path || arrows) && !fractalType && !lines2d;
  const is2D = !!lines2d && !fractalType;
  const isFrac = !!fractalType;

  return (
    <div
      id="canvas-wrap"
      style={{ position: 'relative', overflow: 'hidden', background: 'var(--bg)', userSelect: 'none', cursor: 'grab' }}
      onMouseDown={handlers.onMouseDown}
      onMouseMove={handlers.onMouseMove}
      onMouseUp={handlers.onMouseUp}
      onMouseLeave={handlers.onMouseUp}
      onWheel={handlers.onWheel}
      onTouchStart={handlers.onTouchStart}
      onTouchMove={handlers.onTouchMove}
      onTouchEnd={handlers.onTouchEnd}
    >
      {/* Grid background */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.12 }}>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1a2840" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* 3D canvas */}
      <canvas
        ref={canvasRef3d}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: is3D ? 'block' : 'none' }}
      />
      {/* 2D canvas */}
      <canvas
        ref={canvas2dRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: is2D ? 'block' : 'none' }}
      />
      {/* Fractal canvas */}
      <canvas
        ref={canvasFracRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: isFrac ? 'block' : 'none' }}
      />

      {/* HUD corners */}
      {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
        <div key={pos} style={{
          position: 'absolute', width: 40, height: 40, opacity: 0.5, pointerEvents: 'none',
          top: pos.startsWith('t') ? 12 : undefined, bottom: pos.startsWith('b') ? 12 : undefined,
          left: pos.endsWith('l') ? 12 : undefined, right: pos.endsWith('r') ? 12 : undefined,
          borderTop: pos.startsWith('t') ? '1px solid var(--cyan3)' : undefined,
          borderBottom: pos.startsWith('b') ? '1px solid var(--cyan3)' : undefined,
          borderLeft: pos.endsWith('l') ? '1px solid var(--cyan3)' : undefined,
          borderRight: pos.endsWith('r') ? '1px solid var(--cyan3)' : undefined,
        }} />
      ))}

      {/* Type badge + equation display */}
      {displayLabel && (
        <>
          <div style={{
            position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--green)22', border: '1px solid var(--green2)66',
            padding: '2px 12px', borderRadius: 2, fontSize: 10,
            color: 'var(--green)', letterSpacing: '0.2em', textTransform: 'uppercase',
            pointerEvents: 'none', whiteSpace: 'nowrap',
          }}>{equationType}</div>
          <div style={{
            position: 'absolute', bottom: 52, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--panel2)', border: '1px solid var(--border2)',
            padding: '6px 18px', borderRadius: 3, fontSize: 13,
            color: 'var(--cyan)', letterSpacing: '0.05em', textAlign: 'center',
            pointerEvents: 'none', maxWidth: 500,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{displayLabel}</div>
        </>
      )}

      <StatusBar
        equationType={equationType}
        vertexCount={geometry?.vertexCount ?? path?.points.length ?? 0}
      />
    </div>
  );
}
