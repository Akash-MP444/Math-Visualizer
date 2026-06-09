'use client';

import { useEffect, useState } from 'react';
import { INTRO_DURATION } from '@/utils/constants';

interface IntroScreenProps {
  onComplete: () => void;
}

const SEQUENCE = [
  { id: 'l0', text: 'INITIALIZING EQUATION UNIVERSE', cls: 'cyan', delay: 200 },
  { id: 'l1', text: 'Loading Mathematical Core', cls: 'dim', delay: 700 },
  { id: 'l2', text: 'Constructing Topological Field', cls: 'dim', delay: 1100 },
  { id: 'l3', text: 'Synchronizing Dimensional Renderer', cls: 'dim', delay: 1500 },
  { id: 'l4', text: 'Initializing Symbolic Intelligence', cls: 'dim', delay: 1900 },
  { id: 'l5', text: 'DESIGNED BY AKASH MP', cls: 'designer', delay: 2500 },
  { id: 'l6', text: '"Every equation contains a dimension waiting to emerge."', cls: 'quote', delay: 3000 },
] as const;

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const [barWidth, setBarWidth] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    SEQUENCE.forEach(({ id, delay }) => {
      timers.push(setTimeout(() => setVisibleIds(prev => [...prev, id]), delay));
    });
    timers.push(setTimeout(() => setBarWidth(100), 550));
    timers.push(setTimeout(() => setFading(true), INTRO_DURATION - 1200));
    timers.push(setTimeout(() => onComplete(), INTRO_DURATION));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 24,
      opacity: fading ? 0 : 1, transition: 'opacity 1.2s ease',
      pointerEvents: fading ? 'none' : 'auto',
    }}>
      {SEQUENCE.map(({ id, text, cls }) => {
        const isVisible = visibleIds.includes(id);
        const base: React.CSSProperties = {
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
          letterSpacing: '0.25em', textAlign: 'center',
          fontSize: 'clamp(12px, 1.4vw, 18px)',
        };

        if (cls === 'cyan') return (
          <div key={id}>
            <p style={{ ...base, color: 'var(--cyan)', textShadow: '0 0 30px var(--cyan)' }}>{text}</p>
            <div style={{ marginTop: 16, width: 300, height: 2, background: 'var(--border2)', borderRadius: 1, overflow: 'hidden', opacity: isVisible ? 1 : 0, transition: 'opacity 0.4s' }}>
              <div style={{ height: '100%', width: `${barWidth}%`, background: 'linear-gradient(90deg,var(--cyan3),var(--cyan),var(--green))', borderRadius: 1, transition: 'width 2s linear' }} />
            </div>
          </div>
        );

        if (cls === 'designer') return (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 60, height: 1, background: 'var(--border2)', opacity: isVisible ? 1 : 0, transition: 'opacity 0.4s' }} />
            <p style={{ ...base, color: 'var(--green)', letterSpacing: '0.4em', fontSize: 'clamp(11px,1.3vw,16px)' }}>{text}</p>
            <div style={{ width: 60, height: 1, background: 'var(--border2)', opacity: isVisible ? 1 : 0, transition: 'opacity 0.4s' }} />
          </div>
        );

        if (cls === 'quote') return (
          <p key={id} style={{ ...base, color: 'var(--text2)', fontStyle: 'italic', maxWidth: 500, fontSize: 'clamp(11px,1.1vw,14px)', lineHeight: 1.7, letterSpacing: '0.12em' }}>{text}</p>
        );

        return <p key={id} style={{ ...base, color: 'var(--text2)', fontSize: 'clamp(10px,1vw,13px)' }}>{text}</p>;
      })}
    </div>
  );
}
