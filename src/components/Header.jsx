import React from 'react';
import { Bot, Database, MessageSquare, FileText, Globe } from 'lucide-react';
import { getBackendUrl } from '../api';

export function Header({ activeTab }) {
  const titles = {
    rag: {
      title: 'RAG Knowledge Assistant',
      desc: 'Retrieval-Augmented Generation grounded in PostgreSQL & pgvector similarity search',
      icon: Bot,
    },
    ingest: {
      title: 'Knowledge Ingestion Pipeline',
      desc: 'Tokenize documents into semantic chunks and store high-dimensional embeddings',
      icon: Database,
    },
    chat: {
      title: 'General AI Chat',
      desc: 'Direct interaction with configured LLM (OpenAI / Ollama) without vector retrieval',
      icon: MessageSquare,
    },
    summarize: {
      title: 'Structured Text Summarizer',
      desc: 'Extract strongly typed JSON entities (Title, Executive Summary, Key Points)',
      icon: FileText,
    },
  };

  const current = titles[activeTab] || titles.rag;
  const Icon = current.icon;
  const backendUrl = getBackendUrl();

  return (
    <header className="top-header">
      <div className="header-title-group">
        <h2>
          <Icon size={22} style={{ color: '#818cf8' }} />
          {current.title}
        </h2>
        <p>{current.desc}</p>
      </div>

      <div className="header-actions">
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
          }}
        >
          <Globe size={13} style={{ color: '#06b6d4' }} />
          <span>{backendUrl}</span>
        </div>
      </div>
    </header>
  );
}
