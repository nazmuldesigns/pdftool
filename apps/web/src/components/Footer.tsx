import React from 'react';
import { APP_CONFIG } from '@pdf-toolbox/shared';
import { Layers, ShieldCheck, Mail, User } from 'lucide-react';

interface FooterProps {
  onNavigateCategory: (cat: string) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenFaq: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateCategory,
  onOpenPrivacy,
  onOpenTerms,
  onOpenFaq
}) => {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand info */}
          <div style={{ paddingRight: '1rem' }}>
            <div className="brand-logo" style={{ marginBottom: '0.75rem' }}>
              <div className="brand-icon-box" style={{ width: '30px', height: '30px' }}>
                <Layers size={16} />
              </div>
              <span>{APP_CONFIG.name}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              {APP_CONFIG.tagline}. High-speed, private document processing directly in your browser with zero data leaks.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-success)', fontSize: '0.8125rem', fontWeight: 600 }}>
              <ShieldCheck size={16} />
              <span>Zero Document Retention by Default</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="footer-heading">Essential Tools</h4>
            <ul className="footer-links">
              <li><a href="#core" onClick={(e) => { e.preventDefault(); onNavigateCategory('core'); }}>Core PDF Tools</a></li>
              <li><a href="#organization" onClick={(e) => { e.preventDefault(); onNavigateCategory('organization'); }}>Page Organization</a></li>
              <li><a href="#optimization" onClick={(e) => { e.preventDefault(); onNavigateCategory('optimization'); }}>Compression & Repair</a></li>
              <li><a href="#security" onClick={(e) => { e.preventDefault(); onNavigateCategory('security'); }}>Security & Privacy</a></li>
              <li><a href="#editing" onClick={(e) => { e.preventDefault(); onNavigateCategory('editing'); }}>PDF Editing</a></li>
            </ul>
          </div>

          {/* Conversion */}
          <div>
            <h4 className="footer-heading">Convert</h4>
            <ul className="footer-links">
              <li><a href="#convert-to-pdf" onClick={(e) => { e.preventDefault(); onNavigateCategory('convert-to-pdf'); }}>Convert to PDF</a></li>
              <li><a href="#convert-from-pdf" onClick={(e) => { e.preventDefault(); onNavigateCategory('convert-from-pdf'); }}>Convert from PDF</a></li>
              <li><a href="#image-conversion" onClick={(e) => { e.preventDefault(); onNavigateCategory('image-conversion'); }}>Image Converter</a></li>
              <li><a href="#invoice" onClick={(e) => { e.preventDefault(); onNavigateCategory('invoice'); }}>Invoices & E-Invoice</a></li>
            </ul>
          </div>

          {/* Resources & Legal */}
          <div>
            <h4 className="footer-heading">Support & Developer</h4>
            <ul className="footer-links">
              <li><a href="#faq" onClick={(e) => { e.preventDefault(); onOpenFaq(); }}>Frequently Asked Questions</a></li>
              <li><a href="#privacy" onClick={(e) => { e.preventDefault(); onOpenPrivacy(); }}>Privacy Policy & Retention</a></li>
              <li><a href="#terms" onClick={(e) => { e.preventDefault(); onOpenTerms(); }}>Terms of Service</a></li>
              <li><a href={`mailto:${APP_CONFIG.contactEmail}`}>Contact: {APP_CONFIG.contactEmail}</a></li>
            </ul>
          </div>
        </div>

        {/* Developer Attribution Box */}
        <div style={{
          marginTop: '2rem',
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Lead Developer:</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
              <User size={15} style={{ color: 'var(--accent-primary)' }} />
              {APP_CONFIG.developer}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-muted)' }}>Direct Contact:</span>
            <a
              href={`mailto:${APP_CONFIG.contactEmail}`}
              style={{
                color: 'var(--accent-primary)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                textDecoration: 'none'
              }}
            >
              <Mail size={15} />
              {APP_CONFIG.contactEmail}
            </a>
          </div>
        </div>

        <div className="footer-bottom" style={{ marginTop: '1.5rem' }}>
          <div>
            © {new Date().getFullYear()} {APP_CONFIG.name}. Engineered by {APP_CONFIG.developer}. Private & Client-First.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <a href="#privacy" onClick={(e) => { e.preventDefault(); onOpenPrivacy(); }}>Privacy</a>
            <a href="#terms" onClick={(e) => { e.preventDefault(); onOpenTerms(); }}>Terms</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); onOpenFaq(); }}>FAQ</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
