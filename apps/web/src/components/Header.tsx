import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Layers, X, Clock, DownloadCloud, WifiOff, Globe } from 'lucide-react';
import { APP_CONFIG } from '@pdf-toolbox/shared';
import { ThemeToggle } from './ThemeToggle';
import { useI18n } from '../utils/i18n';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigateHome: () => void;
  onNavigateTools: () => void;
  onNavigateHistory: () => void;
  onOpenAccount: () => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onNavigateHome,
  onNavigateTools,
  onNavigateHistory,
  onOpenAccount,
  currentView
}) => {
  const { language, setLanguage, t } = useI18n();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="app-header">
      <div className="container header-inner">
        {/* Brand */}
        <a
          href="#home"
          onClick={(e) => { e.preventDefault(); onNavigateHome(); }}
          className="brand-logo"
        >
          <div className="brand-icon-box">
            <Layers size={20} />
          </div>
          <span>{APP_CONFIG.name}</span>
        </a>

        {/* Global Search */}
        <div className="header-search">
          <div className="search-input-wrapper">
            <Search className="search-icon-left" size={16} />
            <input
              ref={searchInputRef}
              type="text"
              className="global-search-input"
              placeholder={t('nav.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search tools"
            />
            {searchQuery ? (
              <button
                className="btn-icon"
                style={{ position: 'absolute', right: '0.5rem', width: '28px', height: '28px' }}
                onClick={() => onSearchChange('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            ) : (
              <span className="search-shortcut-badge">/</span>
            )}
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="header-actions">
          {isOffline && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.25rem 0.625rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--status-error)',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
              title="You are working offline. All PDF operations run locally in your browser."
            >
              <WifiOff size={13} />
              <span>{t('nav.offlineActive')}</span>
            </div>
          )}

          {isInstallable && (
            <button
              className="btn-primary"
              style={{ height: '36px', padding: '0 0.875rem', fontSize: '0.8125rem', gap: '0.375rem' }}
              onClick={handleInstallClick}
              title="Install PDF Toolbox to your desktop or device for instant offline access"
            >
              <DownloadCloud size={16} />
              <span>{t('nav.installApp')}</span>
            </button>
          )}

          <button
            className={`btn-secondary ${currentView === 'tools' ? 'active' : ''}`}
            onClick={onNavigateTools}
            style={{ height: '36px', padding: '0 0.875rem' }}
          >
            {t('nav.allTools')}
          </button>

          {/* Language Switcher Toggle */}
          <button
            className="btn-secondary"
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            style={{
              height: '36px',
              padding: '0 0.75rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              borderRadius: 'var(--radius-full)'
            }}
            title={language === 'en' ? 'বাংলা ভাষায় পরিবর্তন করুন' : 'Switch to English'}
            aria-label="Change Language"
          >
            <Globe size={15} style={{ color: 'var(--accent-primary)' }} />
            <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
          </button>

          <button
            className="btn-icon"
            onClick={onNavigateHistory}
            title={t('nav.recentHistory')}
            aria-label="Recent documents history"
          >
            <Clock size={19} />
          </button>

          <ThemeToggle />

          <button
            className="btn-icon"
            onClick={onOpenAccount}
            title={t('nav.userAccount')}
            aria-label="User Account"
          >
            <User size={19} />
          </button>
        </div>
      </div>
    </header>
  );
};
