import React, { useState, useEffect, useCallback } from 'react';
import { Home, Bot, Database, MessageSquare, FileText, Settings } from 'lucide-react';
import { HomePage } from './components/HomePage';
import { RagAssistant } from './components/RagAssistant';
import { DocumentIngestion } from './components/DocumentIngestion';
import { ChatPlayground } from './components/ChatPlayground';
import { TextSummarizer } from './components/TextSummarizer';
import { SettingsModal } from './components/SettingsModal';
import { Toast } from './components/Toast';
import { checkBackendHealth, getBackendUrl } from './api';
import './index.css';

const TABS = [
  { id: 'home',      label: 'home',      shortLabel: 'Home',     badge: 'Start',    Icon: Home        },
  { id: 'rag',       label: 'rag.ask',   shortLabel: 'RAG',      badge: 'RAG',      Icon: Bot         },
  { id: 'ingest',    label: 'ingest',    shortLabel: 'Ingest',   badge: 'pgvector', Icon: Database    },
  { id: 'chat',      label: 'chat',      shortLabel: 'Chat',     badge: 'LLM',      Icon: MessageSquare },
  { id: 'summarize', label: 'summarize', shortLabel: 'Summarize', badge: 'struct',  Icon: FileText    },
];

export default function App() {
  const [activeTab, setActiveTab]       = useState('home');
  const [isConnected, setIsConnected]   = useState(false);
  const [latency, setLatency]           = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast]               = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const runHealthCheck = useCallback(async () => {
    const res = await checkBackendHealth();
    setIsConnected(res.ok);
    if (res.ok) setLatency(res.latencyMs);
  }, []);

  useEffect(() => {
    runHealthCheck();
    const t = setInterval(runHealthCheck, 30000);
    return () => clearInterval(t);
  }, [runHealthCheck]);

  return (
    <div className="app-root">

      {/* ── Top Command Bar ───────────────────── */}
      <header className="cmd-bar" role="banner">
        {/* Brand */}
        <div className="cmd-brand">
          <span className="cmd-brand-dot" />
          <span className="cmd-brand-text">SpringMind</span>
        </div>

        {/* Tab Navigation — desktop/tablet top bar */}
        <nav className="cmd-tabs" role="navigation" aria-label="Main navigation">
          {TABS.map((tab, i) => {
            const Icon = tab.Icon;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                className={`cmd-tab${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                title={tab.label}
              >
                <Icon size={13} className="cmd-tab-icon" />
                <span className="cmd-tab-prefix">{i + 1}:</span>
                <span className="cmd-tab-label-text">{tab.label}</span>
                <span className="cmd-tab-badge">{tab.badge}</span>
              </button>
            );
          })}
        </nav>

        {/* Status + Settings */}
        <div className="cmd-right">
          <div className="cmd-status" title={isConnected ? `${latency}ms round-trip` : 'Not connected'}>
            <span className={`status-pip${isConnected ? ' online' : ''}`} />
            <span className="cmd-status-text">
              {isConnected ? `:8081 ${latency}ms` : 'disconnected'}
            </span>
          </div>
          <button
            className="cmd-btn-icon"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
            id="btn-settings"
            title="Settings"
          >
            {/* Settings gear — inline SVG to avoid import */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Main Content ──────────────────────── */}
      <main className="main-area" id="main-content">
        {activeTab === 'home' && (
          <HomePage onNavigate={setActiveTab} />
        )}
        {activeTab === 'rag' && (
          <RagAssistant
            showToast={showToast}
            onNavigateToIngest={() => setActiveTab('ingest')}
          />
        )}
        {activeTab === 'ingest' && (
          <DocumentIngestion
            showToast={showToast}
            onAskQuestionAboutDoc={(snippet) => {
              setActiveTab('rag');
              showToast(`Navigated to RAG — ask about: "${snippet.slice(0, 40)}..."`, 'info');
            }}
          />
        )}
        {activeTab === 'chat' && <ChatPlayground showToast={showToast} />}
        {activeTab === 'summarize' && <TextSummarizer showToast={showToast} />}
      </main>


      {/* ── Mobile Bottom Nav (≤640px) ────────── */}
      <nav className="mobile-nav" role="navigation" aria-label="Mobile navigation">
        <div className="mobile-nav-inner">
          {TABS.map(tab => {
            const Icon = tab.Icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-tab-${tab.id}`}
                className={`mobile-nav-item${isActive ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} className="mobile-nav-icon" />
                <span className="mobile-nav-label">{tab.shortLabel}</span>
              </button>
            );
          })}
          <button
            className="mobile-nav-item"
            onClick={() => setSettingsOpen(true)}
            id="mobile-btn-settings"
            aria-label="Settings"
          >
            <Settings size={18} />
            <span className="mobile-nav-label">Settings</span>
          </button>
        </div>
      </nav>


      {/* ── Settings ──────────────────────────── */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onUrlUpdated={runHealthCheck}
        showToast={showToast}
      />

      {/* ── Toast ─────────────────────────────── */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
