'use client';

import { useRef } from 'react';
import { useAppStore } from '@/store/appStore';

interface EquationInputProps {
  onSubmit: (eq: string) => void;
}

export default function EquationInput({ onSubmit }: EquationInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { equation, setEquation } = useAppStore();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSubmit(equation);
  };

  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--bg3)', border: '1px solid var(--border2)',
      borderRadius: 4, padding: '0 12px', maxWidth: 600,
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}
      onFocus={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--cyan3)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 1px var(--cyan3)33';
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      <span style={{ color: 'var(--cyan)', fontSize: 13, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>∫</span>
      <input
        ref={inputRef}
        id="eq-input"
        type="text"
        value={equation}
        onChange={(e) => setEquation(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter equation: x²+y²=1 · sin(x)*cos(y) · Lorenz · Mandelbrot..."
        autoComplete="off"
        spellCheck={false}
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          color: 'var(--text)', fontFamily: "'Courier New', monospace",
          fontSize: 14, padding: '8px 0',
        }}
      />
    </div>
  );
}
