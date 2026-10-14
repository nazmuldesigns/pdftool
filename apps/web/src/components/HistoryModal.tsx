import React from 'react';
import { X, Clock, FileText, Trash2, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import { getToolById, DEFAULT_RETENTION_POLICY } from '@pdf-toolbox/shared';

export interface HistoryItem {
  id: string;
  toolId: string;
  filename: string;
  size: number;
  status: string;
  timestamp: number;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory
}) => {
  if (!isOpen) return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xl)',
        width: '100%',
        maxWidth: '580px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Clock size={20} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              Recent Document Activity
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Privacy retention notice */}
          <div style={{
            padding: '0.875rem 1rem',
            backgroundColor: 'var(--accent-subtle)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
            fontSize: '0.8125rem',
            color: 'var(--accent-text)',
            border: '1px solid var(--accent-border)'
          }}>
            <Shield size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Privacy & Retention Policy:</strong> Temporary unauthenticated files are stored strictly in client memory or automatically deleted after {DEFAULT_RETENTION_POLICY.unauthenticatedUploadTTLHours} hour. No documents are logged or shared.
            </div>
          </div>

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ fontWeight: 500, fontSize: '0.9375rem' }}>No recent tasks yet</p>
              <p style={{ fontSize: '0.8125rem' }}>Processed files will appear here during your session.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {history.map(item => {
                const tool = getToolById(item.toolId);
                return (
                  <div key={item.id} style={{
                    padding: '0.875rem 1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <FileText size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.filename}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {tool?.name || item.toolId} • {formatSize(item.size)} • {formatDate(item.timestamp)}
                        </div>
                      </div>
                    </div>
                    {item.status === 'completed' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--status-success)', fontSize: '0.75rem', fontWeight: 600 }}>
                        <CheckCircle size={14} /> Completed
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--status-error)', fontSize: '0.75rem', fontWeight: 600 }}>
                        <AlertTriangle size={14} /> Failed
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem'
          }}>
            <button className="btn-secondary" onClick={onClearHistory} style={{ color: 'var(--status-error)' }}>
              <Trash2 size={16} />
              <span>Clear History</span>
            </button>
            <button className="btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
