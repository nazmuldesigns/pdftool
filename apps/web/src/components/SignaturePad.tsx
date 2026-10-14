import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, PenTool, Type, Check } from 'lucide-react';

interface SignaturePadProps {
  onSignatureChange: (signatureDataUrl: string | null) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureChange }) => {
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const [strokeColor, setStrokeColor] = useState('#1e3a8a'); // navy blue
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [mode, strokeColor]);

  // Handle Typed Signature rendering to Canvas Data URL
  useEffect(() => {
    if (mode === 'type') {
      if (!typedName.trim()) {
        onSignatureChange(null);
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = 'italic 38px "Brush Script MT", "Caveat", "Segoe Script", cursive';
        ctx.fillStyle = strokeColor;
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName, 20, 60);
        onSignatureChange(canvas.toDataURL('image/png'));
      }
    }
  }, [mode, typedName, strokeColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSignatureChange(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignatureChange(null);
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      margin: '1.25rem 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn-secondary ${mode === 'draw' ? 'active' : ''}`}
            style={{
              height: '32px',
              fontSize: '0.8125rem',
              backgroundColor: mode === 'draw' ? 'var(--accent-subtle)' : 'var(--bg-surface)',
              borderColor: mode === 'draw' ? 'var(--accent-border)' : 'var(--border-default)',
              color: mode === 'draw' ? 'var(--accent-text)' : 'var(--text-secondary)'
            }}
            onClick={() => setMode('draw')}
          >
            <PenTool size={14} />
            <span>Draw Signature</span>
          </button>
          <button
            type="button"
            className={`btn-secondary ${mode === 'type' ? 'active' : ''}`}
            style={{
              height: '32px',
              fontSize: '0.8125rem',
              backgroundColor: mode === 'type' ? 'var(--accent-subtle)' : 'var(--bg-surface)',
              borderColor: mode === 'type' ? 'var(--accent-border)' : 'var(--border-default)',
              color: mode === 'type' ? 'var(--accent-text)' : 'var(--text-secondary)'
            }}
            onClick={() => setMode('type')}
          >
            <Type size={14} />
            <span>Type Signature</span>
          </button>
        </div>

        {/* Ink Colors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {[
            { color: '#1e3a8a', label: 'Navy Blue' },
            { color: '#0f172a', label: 'Black' },
            { color: '#b91c1c', label: 'Red' }
          ].map(c => (
            <button
              key={c.color}
              type="button"
              onClick={() => setStrokeColor(c.color)}
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: c.color,
                border: strokeColor === c.color ? '2px solid var(--accent-primary)' : '1px solid rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer'
              }}
              title={c.label}
            >
              {strokeColor === c.color && <Check size={12} />}
            </button>
          ))}
        </div>
      </div>

      {mode === 'draw' ? (
        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={500}
            height={140}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{
              width: '100%',
              height: '140px',
              backgroundColor: '#ffffff',
              border: '2px dashed var(--border-default)',
              borderRadius: 'var(--radius-md)',
              cursor: 'crosshair',
              touchAction: 'none'
            }}
          />
          <button
            type="button"
            onClick={clearCanvas}
            className="btn-secondary"
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              height: '28px',
              fontSize: '0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            <RotateCcw size={12} />
            <span>Clear</span>
          </button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Type your name or initials (e.g. John Doe)"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            className="form-input"
            style={{
              height: '48px',
              fontSize: '1.25rem',
              fontStyle: 'italic',
              fontFamily: '"Brush Script MT", "Caveat", cursive',
              color: strokeColor
            }}
          />
        </div>
      )}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        Electronic signature will be embedded cleanly into the generated PDF.
      </div>
    </div>
  );
};
