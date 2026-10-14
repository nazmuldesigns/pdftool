import React, { useState } from 'react';
import {
  Trash2,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Grid,
  List,
  Plus,
  FileText,
  X
} from 'lucide-react';

export interface PreviewFileItem {
  id: string;
  file: File;
  thumbnailUrl?: string;
  rotation: number; // 0, 90, 180, 270
  isPdf: boolean;
  isImage: boolean;
}

interface FilePreviewGridProps {
  files: PreviewFileItem[];
  onReorder: (newFiles: PreviewFileItem[]) => void;
  onRemove: (id: string) => void;
  onRotate: (id: string) => void;
  onAddMore: () => void;
  onClearAll: () => void;
  allowMultiple: boolean;
}

export const FilePreviewGrid: React.FC<FilePreviewGridProps> = ({
  files,
  onReorder,
  onRemove,
  onRotate,
  onAddMore,
  onClearAll,
  allowMultiple
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [thumbSize, setThumbSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [lightboxItem, setLightboxItem] = useState<PreviewFileItem | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const totalBytes = files.reduce((acc, f) => acc + f.file.size, 0);

  // Reordering functions
  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= files.length) return;
    const updated = [...files];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onReorder(updated);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    moveItem(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  // Sorting helpers
  const sortByName = () => {
    const sorted = [...files].sort((a, b) => a.file.name.localeCompare(b.file.name, undefined, { numeric: true }));
    onReorder(sorted);
  };

  const sortByReverse = () => {
    onReorder([...files].reverse());
  };

  const sortBySize = () => {
    const sorted = [...files].sort((a, b) => a.file.size - b.file.size);
    onReorder(sorted);
  };

  const rotateAll = () => {
    const updated = files.map(f => ({ ...f, rotation: (f.rotation + 90) % 360 }));
    onReorder(updated);
  };

  const cardDimensions = {
    sm: { width: '130px', height: '170px', imgHeight: '90px' },
    md: { width: '160px', height: '215px', imgHeight: '125px' },
    lg: { width: '200px', height: '260px', imgHeight: '160px' }
  }[thumbSize];

  return (
    <div style={{ margin: '1.5rem 0' }}>
      {/* Action Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Count and Size Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
            {files.length} {files.length === 1 ? 'Item' : 'Items'}
          </span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.2rem 0.5rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-muted)'
          }}>
            {formatSize(totalBytes)}
          </span>
        </div>

        {/* Sorting and Batch Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          {files.length > 1 && (
            <>
              <button
                type="button"
                className="btn-secondary"
                style={{ height: '32px', fontSize: '0.75rem', padding: '0 0.625rem' }}
                onClick={sortByName}
                title="Sort A to Z"
              >
                <ArrowUpDown size={13} />
                <span>Sort A-Z</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{ height: '32px', fontSize: '0.75rem', padding: '0 0.625rem' }}
                onClick={sortBySize}
                title="Sort by file size"
              >
                <span>Sort Size</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{ height: '32px', fontSize: '0.75rem', padding: '0 0.625rem' }}
                onClick={sortByReverse}
                title="Reverse document order"
              >
                <span>Reverse</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{ height: '32px', fontSize: '0.75rem', padding: '0 0.625rem' }}
                onClick={rotateAll}
                title="Rotate all items by 90°"
              >
                <RotateCw size={13} />
                <span>Rotate All</span>
              </button>
            </>
          )}

          {/* Thumbnail Size Picker */}
          {viewMode === 'grid' && (
            <div style={{ display: 'flex', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              {(['sm', 'md', 'lg'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setThumbSize(s)}
                  style={{
                    padding: '0.35rem 0.5rem',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    backgroundColor: thumbSize === s ? 'var(--accent-primary)' : 'var(--bg-surface)',
                    color: thumbSize === s ? '#ffffff' : 'var(--text-secondary)'
                  }}
                  title={`Thumbnail size: ${s.toUpperCase()}`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* View mode toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '0.35rem 0.5rem',
                backgroundColor: viewMode === 'grid' ? 'var(--accent-primary)' : 'var(--bg-surface)',
                color: viewMode === 'grid' ? '#ffffff' : 'var(--text-secondary)'
              }}
              title="Grid View"
            >
              <Grid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                padding: '0.35rem 0.5rem',
                backgroundColor: viewMode === 'list' ? 'var(--accent-primary)' : 'var(--bg-surface)',
                color: viewMode === 'list' ? '#ffffff' : 'var(--text-secondary)'
              }}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>

          {allowMultiple && (
            <button
              type="button"
              className="btn-secondary"
              style={{ height: '32px', fontSize: '0.75rem', color: 'var(--accent-primary)', borderColor: 'var(--accent-border)' }}
              onClick={onAddMore}
            >
              <Plus size={14} />
              <span>Add More</span>
            </button>
          )}

          <button
            type="button"
            className="btn-secondary"
            style={{ height: '32px', fontSize: '0.75rem', color: 'var(--status-error)' }}
            onClick={onClearAll}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Grid Thumbnail View */}
      {viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${cardDimensions.width}, 1fr))`,
          gap: '1rem',
          maxHeight: '680px',
          overflowY: 'auto',
          padding: '0.5rem',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          {files.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'grab',
                opacity: draggedIndex === index ? 0.4 : 1,
                transition: 'transform var(--transition-fast), border-color var(--transition-fast)'
              }}
            >
              {/* Sequence Badge */}
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                zIndex: 10,
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: '#ffffff',
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '0.15rem 0.4rem',
                borderRadius: 'var(--radius-xs)',
                backdropFilter: 'blur(2px)'
              }}>
                #{index + 1}
              </div>

              {/* Action Overlays (Quick Delete & Rotate) */}
              <div style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                zIndex: 10,
                display: 'flex',
                gap: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => onRotate(item.id)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Rotate 90° clockwise"
                >
                  <RotateCw size={12} />
                </button>

                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'rgba(239, 68, 68, 0.85)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Remove item"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Thumbnail Image Box */}
              <div
                onClick={() => setLightboxItem(item)}
                style={{
                  height: cardDimensions.imgHeight,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-subtle)',
                  overflow: 'hidden',
                  cursor: 'zoom-in',
                  position: 'relative'
                }}
              >
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.file.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      transform: `rotate(${item.rotation}deg)`,
                      transition: 'transform 200ms ease'
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
                    <FileText size={32} />
                    <span style={{ fontSize: '0.6875rem', marginTop: '0.25rem' }}>{item.file.name.split('.').pop()?.toUpperCase()}</span>
                  </div>
                )}
              </div>

              {/* File Info */}
              <div style={{ padding: '0.5rem 0.625rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }} title={item.file.name}>
                    {item.file.name}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {formatSize(item.file.size)}
                  </div>
                </div>

                {/* Micro Reorder Buttons */}
                {files.length > 1 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '0.5rem',
                    paddingTop: '0.375rem',
                    borderTop: '1px solid var(--border-subtle)'
                  }}>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveItem(index, 0)}
                      style={{ opacity: index === 0 ? 0.3 : 1, padding: '2px', color: 'var(--text-secondary)' }}
                      title="Move to First"
                    >
                      <ChevronsLeft size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveItem(index, index - 1)}
                      style={{ opacity: index === 0 ? 0.3 : 1, padding: '2px', color: 'var(--text-secondary)' }}
                      title="Move Left"
                    >
                      <ArrowLeft size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={index === files.length - 1}
                      onClick={() => moveItem(index, index + 1)}
                      style={{ opacity: index === files.length - 1 ? 0.3 : 1, padding: '2px', color: 'var(--text-secondary)' }}
                      title="Move Right"
                    >
                      <ArrowRight size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={index === files.length - 1}
                      onClick={() => moveItem(index, files.length - 1)}
                      style={{ opacity: index === files.length - 1 ? 0.3 : 1, padding: '2px', color: 'var(--text-secondary)' }}
                      title="Move to Last"
                    >
                      <ChevronsRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxHeight: '600px',
          overflowY: 'auto'
        }}>
          {files.map((item, index) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.625rem 0.875rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-muted)', width: '28px' }}>
                  #{index + 1}
                </span>

                {item.thumbnailUrl && (
                  <img
                    src={item.thumbnailUrl}
                    alt=""
                    style={{
                      width: '36px',
                      height: '36px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-xs)',
                      transform: `rotate(${item.rotation}deg)`
                    }}
                  />
                )}

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.file.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatSize(item.file.size)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <button
                  type="button"
                  disabled={index === 0}
                  className="btn-icon"
                  style={{ width: '28px', height: '28px', opacity: index === 0 ? 0.3 : 1 }}
                  onClick={() => moveItem(index, index - 1)}
                  title="Move Up"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={index === files.length - 1}
                  className="btn-icon"
                  style={{ width: '28px', height: '28px', opacity: index === files.length - 1 ? 0.3 : 1 }}
                  onClick={() => moveItem(index, index + 1)}
                  title="Move Down"
                >
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  style={{ width: '28px', height: '28px' }}
                  onClick={() => onRotate(item.id)}
                  title="Rotate"
                >
                  <RotateCw size={14} />
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  style={{ width: '28px', height: '28px', color: 'var(--status-error)' }}
                  onClick={() => onRemove(item.id)}
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {lightboxItem && (
        <div
          onClick={() => setLightboxItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setLightboxItem(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                color: '#ffffff',
                backgroundColor: 'transparent'
              }}
            >
              <X size={28} />
            </button>

            {lightboxItem.thumbnailUrl && (
              <img
                src={lightboxItem.thumbnailUrl}
                alt={lightboxItem.file.name}
                style={{
                  maxWidth: '85vw',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  transform: `rotate(${lightboxItem.rotation}deg)`,
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-xl)'
                }}
              />
            )}
            <div style={{ color: '#ffffff', marginTop: '1rem', fontSize: '0.9375rem', fontWeight: 600 }}>
              {lightboxItem.file.name} ({formatSize(lightboxItem.file.size)})
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
