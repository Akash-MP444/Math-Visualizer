'use client';

import EquationInput from './EquationInput';
import { useAppStore } from '@/store/appStore';
import { RANDOM_PRESETS } from '@/presets/equations';

interface HeaderProps {
  onRender: (eq: string) => void;
  onClear: () => void;
}

const Btn = ({ onClick, primary, children }: { onClick: () => void; primary?: boolean; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    style={{
      padding: '6px 14px',
      border: `1px solid ${primary ? 'var(--cyan3)' : 'var(--border2)'}`,
      background: primary ? 'var(--cyan)0a' : 'transparent',
      color: primary ? 'var(--cyan)' : 'var(--text2)',
      fontFamily: "'Courier New', monospace",
      fontSize: 12, letterSpacing: '0.1em',
      cursor: 'pointer', borderRadius: 3,
      transition: 'all 0.2s', whiteSpace: 'nowrap',
    }}
    onMouseEnter={(e) => {
      const el = e.currentTarget;
      el.style.borderColor = 'var(--cyan3)';
      el.style.color = 'var(--cyan)';
      el.style.background = 'var(--cyan)22';
      if (primary) el.style.boxShadow = 'var(--glow-cyan)';
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget;
      el.style.borderColor = primary ? 'var(--cyan3)' : 'var(--border2)';
      el.style.color = primary ? 'var(--cyan)' : 'var(--text2)';
      el.style.background = primary ? 'var(--cyan)0a' : 'transparent';
      el.style.boxShadow = 'none';
    }}
  >{children}</button>
);

export default function Header({ onRender, onClear }: HeaderProps) {
  const { equation } = useAppStore();

  const handleRandom = () => {
    const eq = RANDOM_PRESETS[Math.floor(Math.random() * RANDOM_PRESETS.length)]!;
    useAppStore.getState().setEquation(eq);
    onRender(eq);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '0 20px',
      background: 'var(--panel2)',
      borderBottom: '1px solid var(--border)',
      position: 'relative', zIndex: 100,
      height: 56,
    }}>
      <div style={{
        fontSize: 15, letterSpacing: '0.2em', fontWeight: 700, whiteSpace: 'nowrap',
        background: 'linear-gradient(90deg, var(--cyan), var(--green))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        ⊂ EQUATION UNIVERSE
      </div>

      <div style={{
        fontSize: 10, letterSpacing: '0.15em', color: 'var(--text3)',
        border: '1px solid var(--border2)', padding: '2px 8px', borderRadius: 2,
      }}>v2.0</div>

      <EquationInput onSubmit={onRender} />

      <Btn primary onClick={() => onRender(equation)}>RENDER</Btn>
      <Btn onClick={onClear}>CLEAR</Btn>
      <Btn onClick={handleRandom}>RANDOM</Btn>
    </div>
  );
}
