import React, { useState, useEffect, useRef } from 'react';
import { SignaturePad } from './SignaturePad';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

export interface DocumentSignatureData {
  signatureDataUrl: string;
  pageNumber: number;
  xPercent: number; // percentage from left
  yPercent: number; // percentage from top
  width: number;
  height: number;
  includeDate: boolean;
  dateString: string;
}

interface InteractiveDocumentSignerProps {
  file: File;
  onChange: (data: DocumentSignatureData | null) => void;
}

export const InteractiveDocumentSigner: React.FC<InteractiveDocumentSignerProps> = ({
  file,
  onChange
}) => {
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(1);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [pageThumbnailUrl, setPageThumbnailUrl] = useState<string>('');

  // Signature placement settings
  const [xPercent, setXPercent] = useState<number>(70); // default bottom-right area
  const [yPercent, setYPercent] = useState<number>(85);
  const [stampWidth, setStampWidth] = useState<number>(160);
  const [stampHeight, setStampHeight] = useState<number>(60);
  const [includeDate, setIncludeDate] = useState<boolean>(true);
  const [dateString, setDateString] = useState<string>(new Date().toISOString().slice(0, 10));

  const pagePreviewRef = useRef<HTMLDivElement>(null);

  // Load PDF metadata and total page count
  useEffect(() => {
    let isCancelled = false;
    file.arrayBuffer().then((buf) => {
      if (isCancelled) return;
      pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise.then((pdfDoc) => {
        if (isCancelled) return;
        setNumPages(pdfDoc.numPages);
        setSelectedPage(pdfDoc.numPages); // Default to last page for contract signatures
      }).catch(console.error);
    });

    return () => {
      isCancelled = true;
    };
  }, [file]);

  // Render preview of the selected page
  useEffect(() => {
    let isCancelled = false;
    file.arrayBuffer().then((buf) => {
      if (isCancelled) return;
      pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise.then((pdfDoc) => {
        if (isCancelled) return;
        pdfDoc.getPage(selectedPage).then((page) => {
          if (isCancelled) return;
          const viewport = page.getViewport({ scale: 0.8 });

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            page.render({
              canvasContext: ctx,
              viewport
            }).promise.then(() => {
              if (!isCancelled) {
                setPageThumbnailUrl(canvas.toDataURL('image/jpeg', 0.85));
              }
            });
          }
        });
      }).catch(console.error);
    });

    return () => {
      isCancelled = true;
    };
  }, [file, selectedPage]);

  // Sync state up to parent workspace
  useEffect(() => {
    if (!signatureDataUrl) {
      onChange(null);
      return;
    }

    onChange({
      signatureDataUrl,
      pageNumber: selectedPage,
      xPercent,
      yPercent,
      width: stampWidth,
      height: stampHeight,
      includeDate,
      dateString
    });
  }, [signatureDataUrl, selectedPage, xPercent, yPercent, stampWidth, stampHeight, includeDate, dateString]);

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pagePreviewRef.current) return;
    const rect = pagePreviewRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(5, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    setXPercent(x);
    setYPercent(y);
  };

  const handlePresetPosition = (pos: 'bottom-right' | 'bottom-left' | 'center') => {
    if (pos === 'bottom-right') {
      setXPercent(70);
      setYPercent(85);
    } else if (pos === 'bottom-left') {
      setXPercent(25);
      setYPercent(85);
    } else if (pos === 'center') {
      setXPercent(50);
      setYPercent(50);
    }
  };

  return (
    <div style={{
      margin: '1.5rem 0',
      padding: '1.5rem',
      backgroundColor: 'var(--bg-surface)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Step 1: Draw or Type Signature */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8125rem',
            fontWeight: 700
          }}>
            1
          </div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Create Your Electronic Signature
          </h3>
        </div>
        <SignaturePad onSignatureChange={setSignatureDataUrl} />
      </div>

      {/* Step 2: Live Document Placement (Visible once signature exists) */}
      {signatureDataUrl && (
        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--status-success)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8125rem',
                fontWeight: 700
              }}>
                2
              </div>
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Drag & Position Signature on Document
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Click anywhere on the page to place your signature stamp.
                </span>
              </div>
            </div>

            {/* Page Navigator */}
            {numPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Page:</span>
                <button
                  type="button"
                  className="btn-icon"
                  disabled={selectedPage <= 1}
                  onClick={() => setSelectedPage((p) => Math.max(1, p - 1))}
                  style={{ width: '28px', height: '28px' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(Number(e.target.value))}
                  className="form-select"
                  style={{ height: '30px', padding: '0 0.5rem', fontSize: '0.8125rem', width: 'auto' }}
                >
                  {Array.from({ length: numPages }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Page {i + 1} of {numPages} {i + 1 === numPages ? '(Last Page)' : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-icon"
                  disabled={selectedPage >= numPages}
                  onClick={() => setSelectedPage((p) => Math.min(numPages, p + 1))}
                  style={{ width: '28px', height: '28px' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(260px, 0.8fr)',
            gap: '1.5rem',
            alignItems: 'start'
          }}>
            {/* Visual Page Canvas */}
            <div style={{ textAlign: 'center' }}>
              <div
                ref={pagePreviewRef}
                onClick={handlePageClick}
                style={{
                  position: 'relative',
                  width: '100%',
                  minHeight: '400px',
                  maxHeight: '520px',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid var(--border-default)',
                  overflow: 'hidden',
                  cursor: 'crosshair',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                }}
              >
                {pageThumbnailUrl ? (
                  <img
                    src={pageThumbnailUrl}
                    alt={`Page ${selectedPage}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                  />
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Rendering document page...</div>
                )}

                {/* Interactive Signature Overlay Stamp */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${xPercent}%`,
                    top: `${yPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${Math.round(stampWidth * 0.9)}px`,
                    height: `${Math.round(stampHeight * 0.9)}px`,
                    border: '2px dashed #2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.25rem',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                >
                  <img
                    src={signatureDataUrl}
                    alt="Signature Stamp"
                    style={{ maxWidth: '100%', maxHeight: includeDate ? '70%' : '90%', objectFit: 'contain' }}
                  />
                  {includeDate && (
                    <span style={{ fontSize: '0.5625rem', color: '#1e3a8a', fontWeight: 600 }}>
                      Date: {dateString}
                    </span>
                  )}
                </div>
              </div>
              <span style={{ display: 'inline-block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Page {selectedPage} of {numPages} • Click to move signature
              </span>
            </div>

            {/* Position & Sizing Toolbar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Quick Position Presets
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  <button
                    type="button"
                    className={`btn-secondary ${xPercent === 70 && yPercent === 85 ? 'active' : ''}`}
                    onClick={() => handlePresetPosition('bottom-right')}
                    style={{ height: '30px', fontSize: '0.75rem', padding: '0 0.5rem' }}
                  >
                    Bottom Right (Contract Standard)
                  </button>
                  <button
                    type="button"
                    className={`btn-secondary ${xPercent === 25 && yPercent === 85 ? 'active' : ''}`}
                    onClick={() => handlePresetPosition('bottom-left')}
                    style={{ height: '30px', fontSize: '0.75rem', padding: '0 0.5rem' }}
                  >
                    Bottom Left
                  </button>
                  <button
                    type="button"
                    className={`btn-secondary ${xPercent === 50 && yPercent === 50 ? 'active' : ''}`}
                    onClick={() => handlePresetPosition('center')}
                    style={{ height: '30px', fontSize: '0.75rem', padding: '0 0.5rem' }}
                  >
                    Page Center
                  </button>
                </div>
              </div>

              {/* Stamp Size Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  <span>Signature Size (Width)</span>
                  <span>{stampWidth}px</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="280"
                  step="10"
                  value={stampWidth}
                  onChange={(e) => {
                    const w = parseInt(e.target.value);
                    setStampWidth(w);
                    setStampHeight(Math.round(w * 0.38));
                  }}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Date Stamp Option */}
              <div style={{
                padding: '0.75rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={includeDate}
                    onChange={(e) => setIncludeDate(e.target.checked)}
                  />
                  <Calendar size={14} style={{ color: 'var(--accent-primary)' }} />
                  <span>Append Date Stamp Under Signature</span>
                </label>

                {includeDate && (
                  <input
                    type="date"
                    value={dateString}
                    onChange={(e) => setDateString(e.target.value)}
                    style={{
                      marginTop: '0.5rem',
                      width: '100%',
                      height: '32px',
                      padding: '0 0.5rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem',
                      color: 'var(--text-primary)'
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
