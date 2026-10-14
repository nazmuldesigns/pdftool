import React, { useState, useMemo, useEffect } from 'react';
import {
  APP_CONFIG,
  TOOLS_REGISTRY,
  CATEGORIES,
  getToolsByCategory,
  searchTools
} from '@pdf-toolbox/shared';
import type { ToolDefinition, ToolCategory } from '@pdf-toolbox/shared';
import { Header } from './components/Header';
import { ToolCard } from './components/ToolCard';
import { ToolWorkspace } from './components/ToolWorkspace';
import { HistoryModal } from './components/HistoryModal';
import type { HistoryItem } from './components/HistoryModal';
import { AccountModal } from './components/AccountModal';
import { InfoModal } from './components/InfoModal';
import type { InfoModalType } from './components/InfoModal';
import { Footer } from './components/Footer';
import {
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  FolderOpen,
  CheckCircle
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'tools' | 'workspace'>('home');
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all');

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [infoModalType, setInfoModalType] = useState<InfoModalType>(null);

  // History & Saved Documents State (stored in localStorage)
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('pdf-toolbox-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedDocsCount, setSavedDocsCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('pdf-toolbox-saved-docs');
      return saved ? JSON.parse(saved).length : 0;
    } catch {
      return 0;
    }
  });

  // Handle URL hash navigation (e.g. #tool/merge-pdf)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#tool/')) {
        const toolId = hash.replace('#tool/', '');
        const found = TOOLS_REGISTRY.find(t => t.id === toolId);
        if (found) {
          setSelectedTool(found);
          setCurrentView('workspace');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
      if (hash === '#tools') {
        setCurrentView('tools');
        setSelectedTool(null);
        return;
      }
      if (hash === '#home' || !hash) {
        setCurrentView('home');
        setSelectedTool(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Save history to localStorage
  const handleRecordHistory = (item: { toolId: string; filename: string; size: number; status: string }) => {
    const newItem: HistoryItem = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      toolId: item.toolId,
      filename: item.filename,
      size: item.size,
      status: item.status,
      timestamp: Date.now()
    };
    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 30);
      try {
        localStorage.setItem('pdf-toolbox-history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('pdf-toolbox-history');
    } catch {}
  };

  const handleSaveDocument = (doc: { filename: string; size: number; toolId: string; blob: Blob }) => {
    try {
      const currentSaved = JSON.parse(localStorage.getItem('pdf-toolbox-saved-docs') || '[]');
      currentSaved.push({
        id: `doc_${Date.now()}`,
        filename: doc.filename,
        size: doc.size,
        toolId: doc.toolId,
        createdAt: Date.now()
      });
      localStorage.setItem('pdf-toolbox-saved-docs', JSON.stringify(currentSaved));
      setSavedDocsCount(currentSaved.length);
    } catch {}
  };

  const handleSelectTool = (tool: ToolDefinition) => {
    setSelectedTool(tool);
    setCurrentView('workspace');
    window.location.hash = `#tool/${tool.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToTools = () => {
    setSelectedTool(null);
    setCurrentView('home');
    window.location.hash = '#home';
  };

  // Filter tools based on search and active category
  const filteredTools = useMemo(() => {
    let list = TOOLS_REGISTRY;
    if (searchQuery) {
      list = searchTools(searchQuery);
    }
    if (activeCategory !== 'all') {
      list = list.filter(t => t.category === activeCategory);
    }
    return list;
  }, [searchQuery, activeCategory]);

  const popularTools = useMemo(() => {
    return TOOLS_REGISTRY.filter(t => t.badge === 'Popular');
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (currentView === 'workspace') {
            setCurrentView('home');
            window.location.hash = '#home';
          }
        }}
        onNavigateHome={() => {
          setSelectedTool(null);
          setCurrentView('home');
          window.location.hash = '#home';
        }}
        onNavigateTools={() => {
          setSelectedTool(null);
          setCurrentView('tools');
          window.location.hash = '#tools';
        }}
        onNavigateHistory={() => setIsHistoryOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        currentView={currentView}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {currentView === 'workspace' && selectedTool ? (
          <div className="container">
            <ToolWorkspace
              tool={selectedTool}
              onBack={handleBackToTools}
              onRecordHistory={handleRecordHistory}
              onSaveDocument={handleSaveDocument}
            />
          </div>
        ) : (
          <div className="container">
            {/* Hero Section */}
            {!searchQuery && currentView === 'home' && (
              <section className="hero-section">
                <div className="hero-pill">
                  <Sparkles size={14} />
                  <span>Private, Client-First Document Architecture</span>
                </div>
                <h1 className="hero-title">
                  Every tool you need to work with <span>PDFs</span> in one place.
                </h1>
                <p className="hero-subtitle">
                  {APP_CONFIG.tagline}. High-speed, private, zero document leakage. Merge, split, compress, watermark, rotate, and convert directly in your browser.
                </p>

                {/* Value prop badges */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  justifyContent: 'center',
                  marginBottom: '2.5rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <ShieldCheck size={18} style={{ color: 'var(--status-success)' }} />
                    <span>100% Client-Side Processing</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Zap size={18} style={{ color: 'var(--accent-primary)' }} />
                    <span>Instant Execution • No Waiting</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <CheckCircle size={18} style={{ color: 'var(--status-info)' }} />
                    <span>No Limits • No Registration Needed</span>
                  </div>
                </div>
              </section>
            )}

            {/* Category Filter Pills */}
            <div className="category-filter-bar">
              <button
                className={`category-pill ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All Tools ({TOOLS_REGISTRY.length})
              </button>
              {(Object.keys(CATEGORIES) as ToolCategory[]).map(catKey => {
                const count = getToolsByCategory(catKey).length;
                if (count === 0) return null;
                return (
                  <button
                    key={catKey}
                    className={`category-pill ${activeCategory === catKey ? 'active' : ''}`}
                    onClick={() => setActiveCategory(catKey)}
                  >
                    {CATEGORIES[catKey].name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Popular Tools Section (Home view, no active filter or search) */}
            {!searchQuery && activeCategory === 'all' && currentView === 'home' && (
              <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700 }}>
                      Most Popular Tools
                    </h2>
                  </div>
                </div>

                <div className="tools-grid">
                  {popularTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} onSelect={handleSelectTool} />
                  ))}
                </div>
              </section>
            )}

            {/* Filtered or All Tools Directory */}
            <section style={{ marginBottom: '4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={20} style={{ color: 'var(--accent-primary)' }} />
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700 }}>
                    {searchQuery ? `Search Results for "${searchQuery}" (${filteredTools.length})` :
                     activeCategory !== 'all' ? `${CATEGORIES[activeCategory].name} (${filteredTools.length})` :
                     'Complete Tools Directory'}
                  </h2>
                </div>
              </div>

              {filteredTools.length === 0 ? (
                <div style={{
                  padding: '4rem 1rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)'
                }}>
                  <FolderOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                    No matching tools found
                  </h3>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Try searching for keywords like "merge", "compress", "watermark", or "convert".
                  </p>
                  <button className="btn-secondary" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="tools-grid">
                  {filteredTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} onSelect={handleSelectTool} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigateCategory={(cat) => {
          setActiveCategory(cat as ToolCategory);
          setCurrentView('home');
          window.location.hash = '#home';
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
        onOpenPrivacy={() => setInfoModalType('privacy')}
        onOpenTerms={() => setInfoModalType('terms')}
        onOpenFaq={() => setInfoModalType('faq')}
      />

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        savedDocsCount={savedDocsCount}
      />

      <InfoModal
        type={infoModalType}
        onClose={() => setInfoModalType(null)}
      />
    </div>
  );
};

export default App;
