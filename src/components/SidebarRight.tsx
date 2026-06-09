'use client';

import { useAppStore } from '@/store/appStore';
import { COLOR_SCHEMES } from '@/utils/colors';
import { QUICK_CHIPS, QUICK_CHIP_LABELS } from '@/presets/equations';
import { formatCount } from '@/utils/math';
import type { GeometryResult } from '@/types/math';

interface SidebarRightProps {
  onLoad: (eq: string) => void;
  geometry: GeometryResult | null;
  equationType: string;
  topologyLabel: string;
  renderTimeMs: number;
  onExportPNG: () => void;
  onExportSTL: () => void;
  onExportOBJ: () => void;
  onExportGLTF: () => void;
}

function Section({
  label, color = 'var(--purple)', children,
}: { label: string; color?: string; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <div style={{
        padding: '10px 14px', fontSize: 10, letterSpacing: '0.2em',
        color, display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--bg3)',
      }}>
        <span style={{ width: 3, height: 10, background: color, borderRadius: 1, flexShrink: 0 }} />
        {label}
      </div>
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function PropRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
      <span style={{ color: 'var(--text3)', letterSpacing: '0.1em' }}>{label}</span>
      <span style={{ color: color ?? 'var(--text)', fontWeight: 'bold' }}>{value}</span>
    </div>
  );
}

function Slider({
  label, min, max, step, value, format, onChange,
}: { label: string; min: number; max: number; step: number; value: number; format: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', justifyContent: 'space-between' }}>
        <span>{label}</span><span>{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', height: 3, background: 'var(--border2)', borderRadius: 2, outline: 'none', cursor: 'pointer', WebkitAppearance: 'none', appearance: 'none' }}
      />
    </div>
  );
}

export default function SidebarRight({
  onLoad, geometry, equationType, topologyLabel, renderTimeMs,
  onExportPNG, onExportSTL, onExportOBJ, onExportGLTF,
}: SidebarRightProps) {
  const {
    parsed, analysis,
    colorScheme, setColorScheme,
    resolution, setResolution,
    isoValue, setIsoValue,
    wireframeMix, setWireframeMix,
    rotationSpeed, setRotationSpeed,
    autoRotate, setAutoRotate,
    camera, resetCamera,
    toggleFavorite, favorites, equation,
  } = useAppStore();

  const isFav = favorites.includes(equation);
  const verts = geometry ? formatCount(geometry.vertexCount) : '—';
  const tris = geometry ? formatCount(geometry.triangleCount) : '—';

  const exportBtn = (label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      disabled={!geometry}
      style={{
        flex: 1, padding: '5px 4px', border: '1px solid var(--border2)',
        background: 'transparent', color: geometry ? 'var(--text2)' : 'var(--text3)',
        fontSize: 10, letterSpacing: '0.08em', cursor: geometry ? 'pointer' : 'not-allowed',
        borderRadius: 2, fontFamily: "'Courier New', monospace",
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => { if (geometry) { (e.currentTarget).style.borderColor = 'var(--cyan3)'; (e.currentTarget).style.color = 'var(--cyan)'; } }}
      onMouseLeave={(e) => { (e.currentTarget).style.borderColor = 'var(--border2)'; (e.currentTarget).style.color = geometry ? 'var(--text2)' : 'var(--text3)'; }}
    >{label}</button>
  );

  return (
    <div style={{
      background: 'var(--panel)', borderLeft: '1px solid var(--border)',
      overflowY: 'auto', display: 'flex', flexDirection: 'column',
      scrollbarWidth: 'thin', scrollbarColor: 'var(--border2) transparent',
    }}>
      {/* Math Properties */}
      <Section label="MATHEMATICAL PROPERTIES" color="var(--cyan)">
        <PropRow label="EQUATION TYPE" value={equationType || '—'} color="var(--cyan)" />
        <PropRow label="VARIABLES" value={parsed?.variables.join(', ') || '—'} />
        <PropRow label="DIMENSION" value={parsed ? (geometry ? '3D Surface' : parsed.type.includes('2d') ? '2D Curve' : '—') : '—'} color="var(--green)" />
        <PropRow label="TOPOLOGY" value={topologyLabel || '—'} color="var(--purple)" />
        <PropRow label="VERTICES" value={verts} color="var(--amber)" />
        <PropRow label="TRIANGLES" value={tris} />
        <PropRow label="RENDER TIME" value={renderTimeMs ? `${renderTimeMs.toFixed(1)}ms` : '—'} />
      </Section>

      {/* Analysis Panel */}
      {analysis && (
        <Section label="ANALYSIS" color="var(--green)">
          {analysis.derivative && <PropRow label="DERIVATIVE" value={analysis.derivative} color="var(--green)" />}
          <PropRow label="SYMMETRY" value={analysis.symmetry} />
          {analysis.domain && <PropRow label="DOMAIN" value={analysis.domain} />}
          {analysis.range && <PropRow label="RANGE" value={analysis.range} />}
          <PropRow label="VARIABLES" value={analysis.variables.join(', ')} />
        </Section>
      )}

      {/* Color Scheme */}
      <Section label="COLOR SCHEME" color="var(--green)">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {COLOR_SCHEMES.map((s) => (
            <div
              key={s.id}
              title={s.label}
              onClick={() => setColorScheme(s.id)}
              style={{
                width: 24, height: 24, borderRadius: 3, cursor: 'pointer',
                background: s.gradient,
                border: `2px solid ${colorScheme === s.id ? '#fff' : 'transparent'}`,
                transform: colorScheme === s.id ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>
      </Section>

      {/* Render Controls */}
      <Section label="RENDER CONTROLS" color="var(--amber)">
        <Slider label="RESOLUTION" min={16} max={128} step={8} value={resolution}
          format={(v) => String(v)} onChange={setResolution} />
        <Slider label="ISO VALUE" min={-2} max={2} step={0.05} value={isoValue}
          format={(v) => v.toFixed(2)} onChange={setIsoValue} />
        <Slider label="WIREFRAME MIX" min={0} max={100} step={5} value={wireframeMix}
          format={(v) => `${v}%`} onChange={setWireframeMix} />
        <Slider label="ROTATION SPEED" min={0} max={10} step={1} value={rotationSpeed / 0.0006}
          format={(v) => (v / 10).toFixed(1)} onChange={(v) => setRotationSpeed(v * 0.0006)} />
      </Section>

      {/* Quick Equations */}
      <Section label="QUICK EQUATIONS" color="var(--pink)">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {QUICK_CHIPS.map((chip) => (
            <span
              key={chip}
              onClick={() => onLoad(chip)}
              style={{
                display: 'inline-block', padding: '3px 8px', margin: 2,
                background: 'var(--bg)', border: '1px solid var(--border2)',
                borderRadius: 2, fontSize: 11, color: 'var(--text2)',
                cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.05em',
              }}
              onMouseEnter={(e) => { (e.currentTarget).style.borderColor = 'var(--cyan3)'; (e.currentTarget).style.color = 'var(--cyan)'; }}
              onMouseLeave={(e) => { (e.currentTarget).style.borderColor = 'var(--border2)'; (e.currentTarget).style.color = 'var(--text2)'; }}
            >
              {QUICK_CHIP_LABELS[chip] ?? chip}
            </span>
          ))}
        </div>
      </Section>

      {/* Camera */}
      <Section label="CAMERA" color="var(--text2)">
        <PropRow label="THETA" value={`${Math.round(camera.theta * 180 / Math.PI) % 360}°`} />
        <PropRow label="PHI" value={`${Math.round(camera.phi * 180 / Math.PI)}°`} />
        <PropRow label="ZOOM" value={camera.zoom.toFixed(1)} />
        <button onClick={resetCamera} style={btnStyle}>RESET VIEW</button>
        <button onClick={() => setAutoRotate(!autoRotate)} style={btnStyle}>
          AUTO ROTATE: {autoRotate ? 'ON' : 'OFF'}
        </button>
      </Section>

      {/* Favorites */}
      {equation && (
        <Section label="SAVE" color="var(--amber)">
          <button onClick={() => toggleFavorite(equation)} style={btnStyle}>
            {isFav ? '★ REMOVE FAVORITE' : '☆ ADD TO FAVORITES'}
          </button>
        </Section>
      )}

      {/* Export */}
      <Section label="EXPORT" color="var(--purple)">
        <div style={{ display: 'flex', gap: 4 }}>
          {exportBtn('PNG', onExportPNG)}
          {exportBtn('STL', onExportSTL)}
          {exportBtn('OBJ', onExportOBJ)}
          {exportBtn('GLTF', onExportGLTF)}
        </div>
        {!geometry && <p style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.08em' }}>Render a 3D surface to enable 3D exports</p>}
      </Section>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  width: '100%', padding: '6px 14px',
  border: '1px solid var(--border2)', background: 'transparent',
  color: 'var(--text2)', fontFamily: "'Courier New', monospace",
  fontSize: 12, letterSpacing: '0.1em', cursor: 'pointer',
  borderRadius: 3, transition: 'all 0.2s',
};
