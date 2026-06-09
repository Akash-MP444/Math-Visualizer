'use client';

import { useState } from 'react';
import { PRESET_GROUPS } from '@/presets/equations';
import { useAppStore } from '@/store/appStore';

interface SidebarLeftProps {
  onLoad: (value: string) => void;
  activeEq: string;
}

export default function SidebarLeft({ onLoad, activeEq }: SidebarLeftProps) {
  const { history, favorites, toggleFavorite } = useAppStore();
  const [showHistory, setShowHistory] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  const panelTitle = (text: string) => (
    <div style={{
      padding: '10px 14px', fontSize: 10, letterSpacing: '0.25em',
      color: 'var(--cyan)', borderBottom: '1px solid var(--border)',
      background: 'var(--bg3)', textTransform: 'uppercase',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ width: 3, height: 10, background: 'var(--cyan)', borderRadius: 1, flexShrink: 0 }} />
      {text}
    </div>
  );

  const presetItem = (label: string, desc: string, value: string) => {
    const isActive = activeEq === value;
    return (
      <div
        key={value + label}
        onClick={() => onLoad(value)}
        style={{
          padding: '7px 14px', cursor: 'pointer', fontSize: 12,
          color: isActive ? 'var(--cyan)' : 'var(--text2)',
          borderLeft: `2px solid ${isActive ? 'var(--cyan)' : 'transparent'}`,
          background: isActive ? 'var(--cyan)0d' : 'transparent',
          transition: 'all 0.15s', lineHeight: 1.4,
          display: 'flex', flexDirection: 'column', gap: 2,
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLDivElement).style.color = 'var(--cyan)';
            (e.currentTarget as HTMLDivElement).style.borderLeftColor = 'var(--cyan)';
            (e.currentTarget as HTMLDivElement).style.background = 'var(--cyan)08';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLDivElement).style.color = 'var(--text2)';
            (e.currentTarget as HTMLDivElement).style.borderLeftColor = 'transparent';
            (e.currentTarget as HTMLDivElement).style.background = 'transparent';
          }
        }}
      >
        <span>{label}</span>
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>{desc}</span>
      </div>
    );
  };

  return (
    <div style={{
      background: 'var(--panel)', borderRight: '1px solid var(--border)',
      overflowY: 'auto', display: 'flex', flexDirection: 'column',
      scrollbarWidth: 'thin', scrollbarColor: 'var(--border2) transparent',
    }}>
      {panelTitle('Equation Library')}

      {/* Favorites */}
      {favorites.length > 0 && (
        <div>
          <div
            onClick={() => setShowFavorites(!showFavorites)}
            style={{
              padding: '6px 14px 4px', fontSize: 10, letterSpacing: '0.2em',
              color: 'var(--amber)', textTransform: 'uppercase', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <span>★ Favorites ({favorites.length})</span>
            <span>{showFavorites ? '▲' : '▼'}</span>
          </div>
          {showFavorites && favorites.map((eq) => (
            <div key={eq} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>{presetItem(eq, 'Saved', eq)}</div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(eq); }}
                style={{ padding: '0 8px', background: 'none', border: 'none', color: 'var(--amber)', cursor: 'pointer', fontSize: 12 }}
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <div
            onClick={() => setShowHistory(!showHistory)}
            style={{
              padding: '6px 14px 4px', fontSize: 10, letterSpacing: '0.2em',
              color: 'var(--text3)', textTransform: 'uppercase', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <span>↺ Recent ({Math.min(history.length, 10)})</span>
            <span>{showHistory ? '▲' : '▼'}</span>
          </div>
          {showHistory && history.slice(0, 10).map((eq) =>
            presetItem(eq.length > 28 ? eq.slice(0, 28) + '…' : eq, 'Recent', eq)
          )}
        </div>
      )}

      {/* Preset groups */}
      {PRESET_GROUPS.map((group) => (
        <div key={group.title} style={{ padding: '8px 0' }}>
          <div style={{
            padding: '6px 14px 4px', fontSize: 10, letterSpacing: '0.2em',
            color: 'var(--text3)', textTransform: 'uppercase',
          }}>
            {group.title}
          </div>
          {group.items.map((item) => presetItem(item.label, item.description, item.value))}
        </div>
      ))}
    </div>
  );
}
