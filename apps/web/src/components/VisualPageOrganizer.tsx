import React, { useState, useEffect } from 'react';
import {
  renderAllPdfPageThumbnails
} from '../utils/pdfHelper';
import {
  RotateCw,
  Trash2,
  Undo2,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  RotateCcw,
  GripVertical,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export interface PageStateItem {
  id: string;
  originalPageNumber: number;
  dataUrl: string;
  rotation: number;
  isDeleted: boolean;
}

interface VisualPageOrganizerProps {
  file: File;
  toolId: string;
  onChange: (pages: PageStateItem[]) => void;
}

export const VisualPageOrganizer: React.FC<VisualPageOrganizerProps> = ({
  file,
  toolId,
  onChange
}) => {
  const [pages, setPages] = useState<PageStateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Extracting document pages...');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Render all page thumbnails on file load
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    file.arrayBuffer().then((buf) => {
      if (isCancelled) return;
      renderAllPdfPageThumbnails(
        new Uint8Array(buf),
        0.35,
        (progress, msg) => {
          if (!isCancelled) {
            setLoadingProgress(progress);
            setLoadingMessage(msg);
          }
        }
      ).then((thumbs) => {
        if (isCancelled) return;
        const initialPages: PageStateItem[] = thumbs.map((t) => ({
          id: `page_${t.pageNumber}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          originalPageNumber: t.pageNumber,
          dataUrl: t.dataUrl,
          rotation: 0,
          isDeleted: toolId === 'remove-pages' && t.pageNumber === 1 // for remove-pages initial default
        }));
        setPages(initialPages);
        onChange(initialPages);
        setIsLoading(false);
      }).catch((err) => {
        console.error('Failed to load page organizer:', err);
        setIsLoading(false);
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [file]);

  const updatePages = (newPages: PageStateItem[]) => {
    setPages(newPages);
    onChange(newPages);
  };

  const handleRotatePage = (index: number) => {
    const updated = pages.map((p, i) =>
      i === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p
    );
    updatePages(updated);
  };

  const handleToggleDelete = (index: number) => {
    const updated = pages.map((p, i) =>
      i === index ? { ...p, isDeleted: !p.isDeleted } : p
    );
    updatePages(updated);
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    const reordered = [...pages];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    updatePages(reordered);
  };

  const handleRotateAll = () => {
    const updated = pages.map((p) => ({
      ...p,
      rotation: (p.rotation + 90) % 360
    }));
    updatePages(updated);
  };

  const handleReverseOrder = () => {
    const updated = [...pages].reverse();
    updatePages(updated);
  };

  const handleRestoreAll = () => {
    const updated = pages.map((p) => ({ ...p, isDeleted: false }));
    updatePages(updated);
  };

  const handleReset = () => {
    const updated = [...pages]
      .sort((a, b) => a.originalPageNumber - b.originalPageNumber)
      .map((p) => ({ ...p, rotation: 0, isDeleted: false }));
    updatePages(updated);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    handleMove(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const activePagesCount = pages.filter((p) => !p.isDeleted).length;

  if (isLoading) {
    return (
      <div style={{
        padding: '2.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        margin: '1.5rem 0'
      }}>
        <Loader2 size={32} className="spinning" style={{ margin: '0 auto 1rem', color: 'var(--accent-primary)' }} />
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {loadingMessage}
        </div>
        <div style={{
          height: '6px',
          width: '240px',
          margin: '0 auto',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${loadingProgress}%`,
            backgroundColor: 'var(--accent-primary)',
            transition: 'width 200ms ease'
          }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      margin: '1.5rem 0',
      padding: '1.25rem',
      backgroundColor: 'var(--bg-surface)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Organizer Header & Quick Actions */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        marginBottom: '1rem',
        paddingBottom: '0.875rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              Interactive Visual Page Organizer
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent-text)'
            }}>
              {activePagesCount} of {pages.length} Pages Active
            </span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Drag pages to reorder, rotate individual sheets, or click trash to remove unwanted pages.
          </div>
        </div>

        {/* Global Toolbar Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleRotateAll}
            style={{ height: '32px', fontSize: '0.75rem', padding: '0 0.625rem' }}
            title="Rotate all pages 90 degrees clockwise"
          >
            <RotateCw size={13} />
            <span>Rotate All 90°</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleReverseOrder}
            style={{ height: '32px', fontSize: '0.75rem', padding: '0 0.625rem' }}
            title="Reverse the entire page sequence"
          >
            <ArrowUpDown size={13} />
            <span>Reverse</span>
          </button>

          {pages.some((p) => p.isDeleted) && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleRestoreAll}
              style={{ height: '32px', fontSize: '0.75rem', padding: '0 0.625rem', color: 'var(--status-success)' }}
              title="Restore all removed pages"
            >
              <CheckCircle2 size={13} />
              <span>Restore All</span>
            </button>
          )}

          <button
            type="button"
            className="btn-secondary"
            onClick={handleReset}
            style={{ height: '32px', fontSize: '0.75rem', padding: '0 0.625rem' }}
            title="Reset to original document order"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Pages Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '0.875rem',
        maxHeight: '480px',
        overflowY: 'auto',
        padding: '0.5rem',
        backgroundColor: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-lg)'
      }}>
        {pages.map((p, index) => {
          const isFirst = index === 0;
          const isLast = index === pages.length - 1;

          return (
            <div
              key={p.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: p.isDeleted
                  ? '2px dashed var(--status-error)'
                  : '1px solid var(--border-default)',
                opacity: p.isDeleted ? 0.45 : 1,
                boxShadow: draggedIndex === index ? '0 8px 24px rgba(37,99,235,0.3)' : 'var(--shadow-xs)',
                transition: 'transform 150ms ease, box-shadow 150ms ease',
                cursor: 'grab',
                overflow: 'hidden'
              }}
            >
              {/* Card Header: Position & Original Page Number */}
              <div style={{
                padding: '0.375rem 0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: p.isDeleted ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-subtle)'
              }}>
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  color: p.isDeleted ? 'var(--status-error)' : 'var(--text-primary)'
                }}>
                  #{index + 1}
                  {p.originalPageNumber !== index + 1 && (
                    <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.25rem' }}>
                      (Orig {p.originalPageNumber})
                    </span>
                  )}
                </span>
                <GripVertical size={13} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
              </div>

              {/* Thumbnail with Rotation */}
              <div style={{
                height: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                backgroundColor: '#ffffff',
                overflow: 'hidden'
              }}>
                <img
                  src={p.dataUrl}
                  alt={`Page ${p.originalPageNumber}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    transform: `rotate(${p.rotation}deg)`,
                    transition: 'transform 200ms ease'
                  }}
                />
              </div>

              {/* Card Controls Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.3rem 0.375rem',
                borderTop: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)'
              }}>
                {/* Rotate Page */}
                <button
                  type="button"
                  onClick={() => handleRotatePage(index)}
                  className="btn-icon"
                  style={{ width: '24px', height: '24px' }}
                  title="Rotate this page 90° clockwise"
                >
                  <RotateCw size={12} />
                </button>

                {/* Move Left */}
                <button
                  type="button"
                  onClick={() => handleMove(index, index - 1)}
                  disabled={isFirst}
                  className="btn-icon"
                  style={{ width: '24px', height: '24px', opacity: isFirst ? 0.3 : 1 }}
                  title="Move page left"
                >
                  <ArrowLeft size={12} />
                </button>

                {/* Move Right */}
                <button
                  type="button"
                  onClick={() => handleMove(index, index + 1)}
                  disabled={isLast}
                  className="btn-icon"
                  style={{ width: '24px', height: '24px', opacity: isLast ? 0.3 : 1 }}
                  title="Move page right"
                >
                  <ArrowRight size={12} />
                </button>

                {/* Delete / Restore */}
                <button
                  type="button"
                  onClick={() => handleToggleDelete(index)}
                  className="btn-icon"
                  style={{
                    width: '24px',
                    height: '24px',
                    color: p.isDeleted ? 'var(--status-success)' : 'var(--status-error)'
                  }}
                  title={p.isDeleted ? 'Restore page' : 'Remove this page'}
                >
                  {p.isDeleted ? <Undo2 size={12} /> : <Trash2 size={12} />}
                </button>
              </div>

              {/* Removed Overlay Badge */}
              {p.isDeleted && (
                <div style={{
                  position: 'absolute',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: '0.2rem 0.5rem',
                  backgroundColor: 'var(--status-error)',
                  color: '#ffffff',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-sm)',
                  pointerEvents: 'none',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  REMOVED
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
