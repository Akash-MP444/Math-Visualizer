'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import SidebarLeft from '@/components/SidebarLeft';
import SidebarRight from '@/components/SidebarRight';
import CanvasContainer from '@/components/CanvasContainer';
import { useRenderer, type RendererState } from '@/hooks/useRenderer';
import { useEquation } from '@/hooks/useEquation';
import { useAppStore } from '@/store/appStore';
import { exportPNG, exportSTL, exportOBJ, exportGLTF } from '@/engine/render/exports';
import toast, { Toaster } from 'react-hot-toast';

// Intro screen is heavy — lazy load it
const IntroScreen = dynamic(() => import('@/components/IntroScreen'), { ssr: false });

const EMPTY_STATE: RendererState = {
  geometry: null, path: null, lines2d: null, arrows: null,
  fractalType: null, equationType: '—', topologyLabel: '—',
  displayLabel: '', renderTimeMs: 0,
};

export default function Page() {
  const [introComplete, setIntroComplete] = useState(false);
  const [rendererState, setRendererState] = useState<RendererState>(EMPTY_STATE);

  const canvasRef3d = useRef<HTMLCanvasElement>(null!);
  const { render } = useRenderer();
  const { loadPreset, setEquation } = useEquation();
  const { error, setError, equation } = useAppStore();

  // Show errors as toasts
  useEffect(() => {
    if (error) {
      toast.error(error, { duration: 4000, style: { background: '#111929', color: '#ef4444', border: '1px solid #ef444466', fontFamily: 'Courier New, monospace', fontSize: 12 } });
      setError(null);
    }
  }, [error, setError]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); handleRender(equation); }
      if (e.key === 'c' || e.key === 'C') { e.preventDefault(); handleClear(); }
      if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFullscreen(); }
      if (e.key === ' ') { e.preventDefault(); useAppStore.getState().setAutoRotate(!useAppStore.getState().autoRotate); }
      if (e.key === '/') { e.preventDefault(); document.getElementById('eq-input')?.focus(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const eq = useAppStore.getState().equation;
        if (eq) useAppStore.getState().toggleFavorite(eq);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equation]);

  const handleRender = useCallback(async (eq: string) => {
    if (!eq.trim()) return;
    setEquation(eq);
    const result = await render(eq);
    setRendererState(result);
  }, [render, setEquation]);

  const handleLoad = useCallback((value: string) => {
    loadPreset(value);
    handleRender(value);
  }, [loadPreset, handleRender]);

  const handleClear = useCallback(() => {
    setRendererState(EMPTY_STATE);
    setEquation('');
    useAppStore.getState().setParsed(null);
    useAppStore.getState().setAnalysis(null);
  }, [setEquation]);

  // Load default on intro complete
  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    setTimeout(() => handleLoad('x^2+y^2+z^2=1'), 100);
  }, [handleLoad]);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  const { geometry, renderTimeMs } = rendererState;

  return (
    <>
      <div className="scanline" />
      <Toaster position="top-right" />

      {!introComplete && <IntroScreen onComplete={handleIntroComplete} />}

      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        display: 'grid', gridTemplateRows: '56px 1fr',
        background: 'var(--bg)',
        opacity: introComplete ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}>
        <Header onRender={handleRender} onClear={handleClear} />

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 260px', overflow: 'hidden' }}>
          <SidebarLeft onLoad={handleLoad} activeEq={equation} />

          <CanvasContainer
            geometry={rendererState.geometry}
            path={rendererState.path}
            lines2d={rendererState.lines2d}
            arrows={rendererState.arrows}
            fractalType={rendererState.fractalType}
            equationType={rendererState.equationType}
            displayLabel={rendererState.displayLabel}
            canvasRef3d={canvasRef3d}
          />

          <SidebarRight
            onLoad={handleLoad}
            geometry={geometry}
            equationType={rendererState.equationType}
            topologyLabel={rendererState.topologyLabel}
            renderTimeMs={renderTimeMs}
            onExportPNG={() => {
              const c = canvasRef3d.current;
              if (c) exportPNG(c);
              else toast.error('No 3D canvas to export');
            }}
            onExportSTL={() => {
              if (geometry) exportSTL(geometry);
              else toast.error('Render a 3D surface first');
            }}
            onExportOBJ={() => {
              if (geometry) exportOBJ(geometry);
              else toast.error('Render a 3D surface first');
            }}
            onExportGLTF={() => {
              if (geometry) exportGLTF(geometry);
              else toast.error('Render a 3D surface first');
            }}
          />
        </div>
      </div>
    </>
  );
}
