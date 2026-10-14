import React from 'react';
import { X, ShieldCheck, FileCheck, HelpCircle } from 'lucide-react';
import { APP_CONFIG, DEFAULT_RETENTION_POLICY } from '@pdf-toolbox/shared';

export type InfoModalType = 'privacy' | 'terms' | 'faq' | null;

interface InfoModalProps {
  type: InfoModalType;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose }) => {
  if (!type) return null;

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
        maxWidth: '680px',
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
            {type === 'privacy' && <ShieldCheck size={20} style={{ color: 'var(--status-success)' }} />}
            {type === 'terms' && <FileCheck size={20} style={{ color: 'var(--accent-primary)' }} />}
            {type === 'faq' && <HelpCircle size={20} style={{ color: 'var(--accent-primary)' }} />}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              {type === 'privacy' && 'Privacy Policy & File Retention'}
              {type === 'terms' && 'Terms of Service'}
              {type === 'faq' && 'Frequently Asked Questions (FAQ)'}
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, lineHeight: 1.6, fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          {type === 'privacy' && (
            <div>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>1. Client-First Architecture</h3>
              <p style={{ marginBottom: '1.25rem' }}>
                Most operations in {APP_CONFIG.name} (merging, splitting, rotating, metadata removal, watermarking, image conversion, and page extraction) run directly inside your browser using WebAssembly and PDF-Lib. Your document bytes never leave your machine during these operations.
              </p>

              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>2. File Retention Schedule</h3>
              <p style={{ marginBottom: '0.5rem' }}>For server-assisted operations that require cloud worker processing (e.g. OCR, LibreOffice office conversions):</p>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.25rem' }}>
                <li><strong>Unauthenticated temporary uploads:</strong> Deleted automatically within {DEFAULT_RETENTION_POLICY.unauthenticatedUploadTTLHours} hour of processing or abandonment.</li>
                <li><strong>Temporary intermediate files:</strong> Removed immediately upon job completion.</li>
                <li><strong>Temporary generated outputs:</strong> Expire and are permanently purged after {DEFAULT_RETENTION_POLICY.temporaryOutputTTLHours} hours.</li>
                <li><strong>User-saved documents:</strong> Retained securely in your private Cloud Storage bucket until you explicitly delete them.</li>
              </ul>

              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>3. No Data Mining or AI Training</h3>
              <p>
                We never inspect, analyze, retain, or feed your documents to third-party artificial intelligence models. Your data remains strictly yours.
              </p>
            </div>
          )}

          {type === 'terms' && (
            <div>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>1. Permitted Use</h3>
              <p style={{ marginBottom: '1.25rem' }}>
                You are granted a non-exclusive license to use {APP_CONFIG.name} for personal and commercial document processing workflows. You agree not to upload malware, corrupt archives, or unauthorized copyrighted materials.
              </p>

              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>2. Digital Signatures vs. Electronic Signatures</h3>
              <p style={{ marginBottom: '1.25rem' }}>
                The electronic signing tool allows drawing or typing stylized visual signatures. This creates a standard visual electronic signature. It does not replace cryptographic public-key infrastructure (PKI) digital certificates where legally mandated.
              </p>

              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>3. Disclaimer of Warranty</h3>
              <p>
                The service is provided "as is" without warranty of any kind. While we rigorously test document conversions, you are advised to maintain local backups of critical files.
              </p>
            </div>
          )}

          {type === 'faq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                  Is {APP_CONFIG.name} really private?
                </h3>
                <p>
                  Yes! All Phase 1 core tools (Merge, Split, Rotate, Remove Pages, Watermark, Numbers, Compress, Images to PDF, Text to PDF) process files locally in your browser without uploading your document bytes to an external server.
                </p>
              </div>

              <div>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                  Do I need to create an account?
                </h3>
                <p>
                  No. All tools are fully accessible in Guest mode. An account is only required if you want to synchronize your history and save documents across multiple devices.
                </p>
              </div>

              <div>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                  How does PDF compression work?
                </h3>
                <p>
                  Our compression engine defragments PDF dictionaries, compacts object streams, and removes redundant metadata. We calculate and show you the exact real bytes saved before and after.
                </p>
              </div>

              <div>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                  What are the roadmap phases?
                </h3>
                <p>
                  Phase 1 establishes the monorepo, UI design system, and core client engines. Subsequent phases roll out containerized Cloud Run workers for LibreOffice office conversion, Tesseract OCR, redaction, and electronic invoicing (ZUGFeRD/Factur-X).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
