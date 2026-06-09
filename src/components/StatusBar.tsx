'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { rad2deg } from '@/utils/math';

interface StatusBarProps {
  equationType: string;
  vertexCount: number;
}

export default function StatusBar({ equationType, vertexCount }: StatusBarProps) {
  const { camera, isRendering, renderProgress } = useAppStore();
  const [fps, setFps] = useState(60);
  const frameRef = useRef(0);
  const lastRef = useRef(performance.now());

  useEffect(() => {
    let id: number;
    const tick = (now: number) => {
      frameRef.current++;
      if (now - lastRef.current > 500) {
        setFps(Math.round(frameRef.current * 1000 / (now - lastRef.current)));
        frameRef.current = 0;
        lastRef.current = now;
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  const th = Math.round(rad2deg(camera.theta)) % 360;
  const ph = Math.round(rad2deg(camera.phi));
  const vStr = vertexCount >= 1000 ? `${(vertexCount / 1000).toFixed(1)}K` : String(vertexCount);

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: 'var(--panel2)', borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '0 14px', height: 36, fontSize: 11, color: 'var(--text3)',
    }}>
      {/* Loading bar */}
      {isRendering && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'var(--border2)',
        }}>
          <div style={{
            height: '100%', width: `${renderProgress}%`,
            background: 'linear-gradient(90deg, var(--cyan3), var(--cyan))',
            transition: 'width 0.3s ease',
          }} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: isRendering ? 'var(--amber)' : 'var(--green)',
          animation: 'pulse 2s infinite',
        }} />
        {isRendering ? `COMPUTING... ${renderProgress}%` : 'ENGINE ACTIVE'}
      </div>

      <span>FPS: <strong style={{ color: 'var(--cyan)' }}>{fps}</strong></span>
      <span>θ:{th}° φ:{ph}°</span>
      <span>VERTICES: {vStr}</span>
      <span>TYPE: {equationType || '—'}</span>

      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 10, letterSpacing: '0.15em' }}>
        DRAG TO ROTATE · SCROLL TO ZOOM · SHIFT+DRAG TO PAN
      </span>
    </div>
  );
}
