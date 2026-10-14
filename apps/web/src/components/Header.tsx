import React, { useEffect, useRef } from 'react';
import { Search, User, Layers, X, Clock } from 'lucide-react';
import { APP_CONFIG } from '@pdf-toolbox/shared';
import { ThemeToggle } from './ThemeToggle';

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
  const searchInputRef = useRef<HTMLInputElement>(null);

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
              placeholder="Search all 30+ PDF tools... (Press '/' to focus)"
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
          <button
            className={`btn-secondary ${currentView === 'tools' ? 'active' : ''}`}
            onClick={onNavigateTools}
            style={{ height: '36px', padding: '0 0.875rem' }}
          >
            All Tools
          </button>

          <button
            className="btn-icon"
            onClick={onNavigateHistory}
            title="Recent Documents & Task History"
            aria-label="Recent documents history"
          >
            <Clock size={19} />
          </button>

          <ThemeToggle />

          <button
            className="btn-icon"
            onClick={onOpenAccount}
            title="User Account & Cloud Sync"
            aria-label="User Account"
          >
            <User size={19} />
          </button>
        </div>
      </div>
    </header>
  );
};
