import React, { useState, useEffect, useRef } from 'react';
import { getPdfFirstPageThumbnail } from '../utils/pdfHelper';
import { Stamp } from 'lucide-react';

export interface WatermarkSettings {
  text: string;
  fontSize: number;
  opacity: number;
  rotation: number;
  color: 'gray' | 'red' | 'blue' | 'black' | 'purple' | 'green';
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
}

interface WatermarkLivePreviewProps {
  file: File;
  initialSettings?: Partial<WatermarkSettings>;
  onChange: (settings: WatermarkSettings) => void;
}

export const WatermarkLivePreview: React.FC<WatermarkLivePreviewProps> = ({
  file,
  initialSettings,
  onChange
}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [settings, setSettings] = useState<WatermarkSettings>({
    text: initialSettings?.text || 'CONFIDENTIAL',
    fontSize: initialSettings?.fontSize || 42,
    opacity: initialSettings?.opacity || 0.35,
    rotation: initialSettings?.rotation !== undefined ? initialSettings.rotation : 45,
    color: (initialSettings?.color as any) || 'gray',
    position: (initialSettings?.position as any) || 'center',
    xPercent: initialSettings?.xPercent || 50,
    yPercent: initialSettings?.yPercent || 50
  });

  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isCancelled = false;
    file.arrayBuffer().then((buf) => {
      if (isCancelled) return;
      getPdfFirstPageThumbnail(new Uint8Array(buf), 0.6).then((thumb) => {
        if (!isCancelled && thumb) {
          setThumbnailUrl(thumb);
        }
      });
    });
    return () => {
      isCancelled = true;
    };
  }, [file]);

  const updateSetting = <K extends keyof WatermarkSettings>(key: K, val: WatermarkSettings[K]) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    onChange(updated);
  };

  const handlePositionPreset = (pos: WatermarkSettings['position'], rot: number) => {
    let x = 50;
    let y = 50;
    if (pos === 'top-left') { x = 20; y = 20; }
    if (pos === 'top-right') { x = 80; y = 20; }
    if (pos === 'bottom-left') { x = 20; y = 80; }
    if (pos === 'bottom-right') { x = 80; y = 80; }

    const updated: WatermarkSettings = {
      ...settings,
      position: pos,
      rotation: rot,
      xPercent: x,
      yPercent: y
    };
    setSettings(updated);
    onChange(updated);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(5, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    updateSetting('position', 'custom');
    updateSetting('xPercent', x);
    updateSetting('yPercent', y);
  };

  const getColorHex = (c: WatermarkSettings['color']) => {
    switch (c) {
      case 'red': return '#dc2626';
      case 'blue': return '#2563eb';
      case 'black': return '#000000';
      case 'purple': return '#9333ea';
      case 'green': return '#16a34a';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      margin: '1.5rem 0',
      padding: '1.25rem',
      backgroundColor: 'var(--bg-surface)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Stamp size={18} style={{ color: 'var(--accent-primary)' }} />
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
          Live Interactive Watermark Customizer
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 1fr) minmax(280px, 1fr)',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {/* Left: Interactive Preview Sheet */}
        <div>
          <div style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: '0.5rem',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Live Document Preview (Page 1)</span>
            <span style={{ color: 'var(--text-muted)' }}>Click page to place</span>
          </div>

          <div
            ref={previewContainerRef}
            onClick={handleCanvasClick}
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '340px',
              maxHeight: '400px',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-default)',
              overflow: 'hidden',
              cursor: 'crosshair',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
            }}
          >
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="Page 1 Preview"
                style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
              />
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading preview...</div>
            )}

            {/* Rendered Live Watermark Text */}
            <div
              style={{
                position: 'absolute',
                left: `${settings.xPercent}%`,
                top: `${settings.yPercent}%`,
                transform: `translate(-50%, -50%) rotate(${settings.rotation}deg)`,
                fontSize: `${Math.max(14, Math.round(settings.fontSize * 0.45))}px`,
                fontWeight: 800,
                color: getColorHex(settings.color),
                opacity: settings.opacity,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect: 'none',
                letterSpacing: '0.08em',
                textShadow: '0 0 1px rgba(0,0,0,0.2)'
              }}
            >
              {settings.text || 'WATERMARK'}
            </div>
          </div>
        </div>

        {/* Right: Controls & Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Watermark Text */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Watermark Text
            </label>
            <input
              type="text"
              value={settings.text}
              onChange={(e) => updateSetting('text', e.target.value)}
              placeholder="e.g. CONFIDENTIAL, DRAFT, APPROVED"
              style={{
                width: '100%',
                height: '38px',
                padding: '0 0.75rem',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontWeight: 600
              }}
            />
          </div>

          {/* Position Presets */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Position & Layout Preset
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              <button
                type="button"
                className={`btn-secondary ${settings.position === 'center' && settings.rotation === 45 ? 'active' : ''}`}
                onClick={() => handlePositionPreset('center', 45)}
                style={{ height: '30px', fontSize: '0.75rem', padding: '0 0.5rem' }}
              >
                Center Diagonal
              </button>
              <button
                type="button"
                className={`btn-secondary ${settings.position === 'center' && settings.rotation === 0 ? 'active' : ''}`}
                onClick={() => handlePositionPreset('center', 0)}
                style={{ height: '30px', fontSize: '0.75rem', padding: '0 0.5rem' }}
              >
                Center Horizontal
              </button>
              <button
                type="button"
                className={`btn-secondary ${settings.position === 'top-left' ? 'active' : ''}`}
                onClick={() => handlePositionPreset('top-left', 0)}
                style={{ height: '30px', fontSize: '0.75rem', padding: '0 0.5rem' }}
              >
                Top Left
              </button>
              <button
                type="button"
                className={`btn-secondary ${settings.position === 'top-right' ? 'active' : ''}`}
                onClick={() => handlePositionPreset('top-right', 0)}
                style={{ height: '30px', fontSize: '0.75rem', padding: '0 0.5rem' }}
              >
                Top Right
              </button>
              <button
                type="button"
                className={`btn-secondary ${settings.position === 'bottom-right' ? 'active' : ''}`}
                onClick={() => handlePositionPreset('bottom-right', 0)}
                style={{ height: '30px', fontSize: '0.75rem', padding: '0 0.5rem' }}
              >
                Bottom Right
              </button>
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Watermark Color
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['gray', 'red', 'blue', 'black', 'purple', 'green'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateSetting('color', c)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: getColorHex(c),
                    border: settings.color === c ? '3px solid var(--accent-primary)' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'transform 100ms ease'
                  }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Opacity & Font Size Sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                <span>Opacity</span>
                <span>{Math.round(settings.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={settings.opacity}
                onChange={(e) => updateSetting('opacity', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                <span>Font Size</span>
                <span>{settings.fontSize}pt</span>
              </div>
              <input
                type="range"
                min="18"
                max="90"
                step="2"
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Rotation Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              <span>Rotation Angle</span>
              <span>{settings.rotation}°</span>
            </div>
            <input
              type="range"
              min="-90"
              max="90"
              step="5"
              value={settings.rotation}
              onChange={(e) => updateSetting('rotation', parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
