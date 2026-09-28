import React from 'react';
import { 
  Bot, 
  Database, 
  MessageSquare, 
  FileText, 
  Settings, 
  Sparkles,
  Layers,
  Cpu
} from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab, isConnected, latency, onOpenSettings }) {
  const navItems = [
    { id: 'rag', label: 'RAG Assistant', icon: Bot, badge: 'Grounded' },
    { id: 'ingest', label: 'Knowledge Base', icon: Database, badge: 'pgvector' },
    { id: 'chat', label: 'General Chat', icon: MessageSquare },
    { id: 'summarize', label: 'Text Summarizer', icon: FileText, badge: 'Structured' },
  ];

  return (
    <aside className="sidebar">
      <div>
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon-wrap">
            <Cpu size={22} />
          </div>
          <div className="brand-info">
            <h1>Java-RAG</h1>
            <span className="brand-badge">Spring AI 2.0</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontFamily: 'var(--font-mono)',
                      background: isActive ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      color: isActive ? '#c7d2fe' : 'var(--text-muted)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-bottom">
        <div className="connection-card">
          <div className="status-indicator">
            <div className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
            <div>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                {isConnected ? 'Backend Online' : 'Connecting...'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                {isConnected ? `${latency}ms • :8081` : 'Check Spring Boot'}
              </div>
            </div>
          </div>
          <button
            className="settings-btn"
            onClick={onOpenSettings}
            title="Configure Backend Connection"
          >
            <Settings size={16} />
          </button>
        </div>

        <div className="tech-pills">
          <span className="tech-pill">Java 21</span>
          <span className="tech-pill">Spring Boot 4.1</span>
          <span className="tech-pill">pgvector</span>
        </div>
      </div>
    </aside>
  );
}
