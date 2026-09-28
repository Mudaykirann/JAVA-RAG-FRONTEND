import React, { useState, useEffect } from 'react';
import { ingestDocument, uploadDocumentFile } from '../api';

const TEMPLATES = [
  {
    title: 'Project Apollo Specification',
    category: 'cloud-migration',
    content: `Project Apollo is our internal enterprise cloud migration initiative scheduled for Q4 2026.
The lead engineer is Sarah Jenkins, and the migration targets AWS EKS with multi-region active-active failover.
Primary objectives include 99.999% service availability, reducing cloud latency below 25ms, and migrating 45 microservices.
Security compliance requirements mandate end-to-end TLS 1.3 and integration with HashiCorp Vault for secrets management.`,
  },
  {
    title: 'PostgreSQL & pgvector Architecture',
    category: 'database-spec',
    content: `The Java-RAG platform uses PostgreSQL 16 enhanced with the pgvector extension running on port 5433.
Text documents are tokenized with Spring AI's TokenTextSplitter into chunks of 800 tokens with 400 token overlaps.
Vector similarity queries utilize Cosine Distance search with HNSW indexes for sub-millisecond Top-K vector retrieval.
Vector embeddings are computed via OpenAI text-embedding-3-small (1536 dimensions) or Ollama nomic-embed-text.`,
  },
  {
    title: 'Spring AI 2.0 Standards',
    category: 'engineering',
    content: `Spring AI 2.0 introduces seamless ChatClient fluent APIs for conversational prompting and structured entity extraction.
All RAG requests must follow grounded prompt templates to suppress model hallucinations.
When vector distance exceeds 0.78, the assistant is instructed to decline answering rather than inferring ungrounded facts.`,
  },
];

const HISTORY_KEY = 'rag_ingestion_history';

export function DocumentIngestion({ showToast, onAskQuestionAboutDoc }) {
  const [content, setContent]       = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [history, setHistory]       = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const saveHistory = (title, chunks, type = 'text') => {
    const item = {
      id: String(Date.now()),
      snippet: title.slice(0, 80) + (title.length > 80 ? '…' : ''),
      chunks,
      type,
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [item, ...history.slice(0, 9)];
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    showToast('History cleared', 'info');
  };

  const charCount   = content.length;
  const wordCount   = content.trim() ? content.trim().split(/\s+/).length : 0;
  const estTokens   = Math.ceil(charCount / 4);
  const estChunks   = Math.max(1, Math.ceil(estTokens / 500));

  const onFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    showToast(`Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`, 'info');
  };

  const handleIngestFile = async () => {
    if (!selectedFile || loading) return;
    setLoading(true);
    try {
      const res = await uploadDocumentFile(selectedFile);
      showToast(res.message || `Indexed ${res.chunkCount} chunks from ${res.fileName}`, 'success');
      saveHistory(res.fileName, res.chunkCount, 'file');
      setSelectedFile(null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleIngestText = async () => {
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      const result = await ingestDocument(content);
      showToast(result || 'Ingested into pgvector', 'success');
      saveHistory(content, estChunks, 'text');
      setContent('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-scroll">
      <div className="page-strip">
        <span className="page-title">ingest</span>
        <span className="page-subtitle">parse · chunk · embed → pgvector</span>
      </div>

      <div className="ingest-grid">

        {/* ── Left: upload + text ─────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Dropzone */}
          <div
            className={`dropzone${isDragging ? ' active' : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]); }}
            onClick={() => document.getElementById('file-input').click()}
            id="dropzone"
            role="button"
            aria-label="Upload file"
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.docx,.doc,.pptx,.txt,.md,.json,.html"
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files?.[0]) onFile(e.target.files[0]); }}
            />
            <div className="dropzone-icon">⬆</div>
            <div className="dropzone-title">drop file or click to browse</div>
            <div className="dropzone-sub">pdf · docx · pptx · md · txt — parsed via Apache Tika</div>
          </div>

          {/* Selected file card */}
          {selectedFile && (
            <div className="file-selected">
              <div>
                <div className="file-selected-name">{selectedFile.name}</div>
                <div className="file-selected-meta">{Math.round(selectedFile.size / 1024)} KB  ·  Tika ready</div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedFile(null)} disabled={loading}>cancel</button>
                <button className="btn btn-primary btn-sm" onClick={handleIngestFile} disabled={loading} id="btn-ingest-file">
                  {loading ? 'indexing…' : 'parse & ingest'}
                </button>
              </div>
            </div>
          )}

          {/* Or divider */}
          <div className="or-divider">or paste raw text</div>

          {/* Text area */}
          <textarea
            className="field-input"
            placeholder="paste text, specs, meeting notes, RFCs…"
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={loading}
            id="text-ingest-area"
          />

          {/* Metrics */}
          {content && (
            <div className="metrics-strip">
              <div className="metric-cell"><strong>{charCount}</strong>chars</div>
              <div className="metric-cell"><strong>{wordCount}</strong>words</div>
              <div className="metric-cell"><strong>~{estTokens}</strong>tokens</div>
              <div className="metric-cell"><strong>~{estChunks}</strong>chunks</div>
            </div>
          )}

          {/* Ingest text actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
            {content && (
              <button className="btn btn-secondary" onClick={() => setContent('')} disabled={loading}>clear</button>
            )}
            <button
              className="btn btn-primary"
              onClick={handleIngestText}
              disabled={!content.trim() || loading}
              id="btn-ingest-text"
            >
              {loading ? 'chunking & indexing…' : 'ingest text → pgvector'}
            </button>
          </div>
        </div>

        {/* ── Right: templates + history ──────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Templates */}
          <div className="panel">
            <div className="panel-header">
              <span>// quick templates</span>
            </div>
            <div className="template-list">
              {TEMPLATES.map((t, i) => (
                <div
                  key={i}
                  className="template-item"
                  onClick={() => { setContent(t.content); showToast(`Loaded "${t.title}"`, 'info'); }}
                  id={`template-${i}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setContent(t.content)}
                >
                  <div className="template-item-title">{t.title}</div>
                  <div className="template-item-cat">{t.category}</div>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <span>// session ingests</span>
              {history.length > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={clearHistory} id="btn-clear-history">clear</button>
              )}
            </div>
            <div className="panel-body">
              {history.length === 0 ? (
                <div style={{ fontSize: '0.68rem', color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>
                  nothing ingested yet.
                </div>
              ) : (
                <div className="history-list">
                  {history.map(item => (
                    <div key={item.id} className="history-item">
                      <div>
                        <div className="history-name">{item.snippet}</div>
                        <div className="history-meta">{item.chunks} chunks · {item.ts} · {item.type}</div>
                      </div>
                      <button
                        className="history-ask-btn"
                        onClick={() => onAskQuestionAboutDoc?.(item.snippet)}
                        title="Ask RAG about this document"
                      >
                        ask →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
