'use client';

import { useCallback, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { clamp } from '@/utils/math';

export function useCamera() {
  const {
    camera, autoRotate, rotationSpeed,
    updateCamera, resetCamera, setAutoRotate,
  } = useAppStore();
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 });
  const lastTouchDistRef = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    setAutoRotate(false);
  }, [setAutoRotate]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    const cur = useAppStore.getState().camera;
    if (e.shiftKey) {
      updateCamera({ panX: cur.panX + dx, panY: cur.panY + dy });
    } else {
      updateCamera({
        theta: cur.theta + dx * 0.008,
        phi: clamp(cur.phi - dy * 0.008, -Math.PI / 2, Math.PI / 2),
      });
    }
  }, [updateCamera]);

  const onMouseUp = useCallback(() => { dragRef.current.active = false; }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const cur = useAppStore.getState().camera;
    updateCamera({ zoom: clamp(cur.zoom - e.deltaY * 0.01, 0.5, 100) });
  }, [updateCamera]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const t = e.touches[0]!;
      dragRef.current = { active: true, lastX: t.clientX, lastY: t.clientY };
      setAutoRotate(false);
    } else if (e.touches.length === 2) {
      lastTouchDistRef.current = Math.hypot(
        e.touches[1]!.clientX - e.touches[0]!.clientX,
        e.touches[1]!.clientY - e.touches[0]!.clientY
      );
    }
  }, [setAutoRotate]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const cur = useAppStore.getState().camera;
    if (e.touches.length === 1 && dragRef.current.active) {
      const t = e.touches[0]!;
      const dx = t.clientX - dragRef.current.lastX;
      const dy = t.clientY - dragRef.current.lastY;
      dragRef.current.lastX = t.clientX;
      dragRef.current.lastY = t.clientY;
      updateCamera({
        theta: cur.theta + dx * 0.01,
        phi: clamp(cur.phi - dy * 0.01, -1.5, 1.5),
      });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[1]!.clientX - e.touches[0]!.clientX,
        e.touches[1]!.clientY - e.touches[0]!.clientY
      );
      updateCamera({ zoom: clamp(cur.zoom - (dist - lastTouchDistRef.current) * 0.02, 0.5, 100) });
      lastTouchDistRef.current = dist;
    }
  }, [updateCamera]);

  const onTouchEnd = useCallback(() => { dragRef.current.active = false; }, []);

  return {
    camera,
    autoRotate,
    rotationSpeed,
    updateCamera,
    resetCamera,
    setAutoRotate,
    handlers: { onMouseDown, onMouseMove, onMouseUp, onWheel, onTouchStart, onTouchMove, onTouchEnd },
  };
}
