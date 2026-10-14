import React, { useState } from 'react';
import { X, User, Shield, Cloud } from 'lucide-react';
import { DEFAULT_RETENTION_POLICY } from '@pdf-toolbox/shared';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedDocsCount: number;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  savedDocsCount
}) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleSimulateSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSignedIn(true);
      setIsSyncing(false);
    }, 600);
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
        maxWidth: '520px',
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
            <User size={20} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              Account & Synchronization
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {isSignedIn ? (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--accent-subtle)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>Active Account</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{email}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem', color: 'var(--status-success)', fontSize: '0.75rem', fontWeight: 600 }}>
                    <Cloud size={14} /> Firebase Synchronized
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Saved Cloud Documents</span>
                  <span style={{ fontWeight: 600 }}>{savedDocsCount} / {DEFAULT_RETENTION_POLICY.userSavedMaxCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Cross-Device History</span>
                  <span style={{ fontWeight: 600, color: 'var(--status-success)' }}>Enabled</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Security Level</span>
                  <span style={{ fontWeight: 600 }}>Firestore Rules v2</span>
                </div>
              </div>

              <button
                className="btn-secondary"
                style={{ width: '100%' }}
                onClick={() => setIsSignedIn(false)}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--accent-subtle)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <Cloud size={24} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.375rem', fontFamily: 'var(--font-display)' }}>
                  Optional Account Synchronization
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Use all PDF tools as a guest without creating an account. Sign in to synchronize job history and saved documents across devices.
                </p>
              </div>

              <form onSubmit={handleSimulateSignIn}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSyncing}
                  className="btn-primary"
                  style={{ width: '100%', height: '42px' }}
                >
                  {isSyncing ? 'Connecting...' : 'Sign In with Email'}
                </button>
              </form>

              <div style={{
                marginTop: '1.5rem',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                lineHeight: 1.4
              }}>
                <Shield size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Protected by Firebase Authentication. Guest documents remain 100% private in local browser memory.
              </div>

              {/* Developer Attribution Card */}
              <div style={{
                marginTop: '1rem',
                padding: '0.875rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8125rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  Developer Attribution
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  Lead Developer: <strong>Md. Nazmul Hasan</strong>
                </div>
                <div>
                  Contact: <a href="mailto:nazmuldesigns0@gmail.com" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>nazmuldesigns0@gmail.com</a>
                </div>
                <div>
                  Repository: <a href="https://github.com/nazmuldesigns/pdftool" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>github.com/nazmuldesigns/pdftool</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
