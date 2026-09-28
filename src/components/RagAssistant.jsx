import React, { useState, useRef, useEffect } from 'react';
import { askQuestion, clearConversation } from '../api';

const STARTER_PROMPTS = [
  'Who leads Project Apollo?',
  'What is the cloud migration target platform?',
  'What are the database specifications?',
  'What are the high-availability requirements?',
];

const FOLLOWUP_PROMPTS = [
  'Which cloud provider?',
  'Security and compliance details?',
  'Who is the lead engineer?',
  'Summarize the failover strategy.',
];

function genId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'conv-' + Math.random().toString(36).slice(2, 9);
}

function fmtTime(d = new Date()) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const LOADING_STEPS = [
  'contextualizing query…',
  'searching pgvector embeddings…',
  'synthesizing grounded answer…',
];

export function RagAssistant({ showToast, onNavigateToIngest }) {
  const [convId, setConvId]       = useState(genId);
  const [messages, setMessages]   = useState([
    {
      id: 'sys-0',
      role: 'assistant',
      content: 'RAG assistant ready. Ask a question grounded in your ingested knowledge base.',
      ts: fmtTime(),
    },
  ]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [loadStep, setLoadStep]   = useState(0);
  const endRef                    = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const userTurns = messages.filter(m => m.role === 'user').length;

  const resetChat = async () => {
    if (loading) return;
    try { await clearConversation(convId); } catch { /* ignore */ }
    const id = genId();
    setConvId(id);
    setMessages([{ id: 'sys-' + Date.now(), role: 'assistant', content: 'New session. Ask a question.', ts: fmtTime() }]);
    showToast('Session cleared', 'info');
  };

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;

    const userMsg = { id: String(Date.now()), role: 'user', content: q, ts: fmtTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setLoadStep(1);

    const t1 = setTimeout(() => setLoadStep(2), 700);
    const t2 = setTimeout(() => setLoadStep(3), 1500);

    try {
      const res = await askQuestion(q, convId);
      clearTimeout(t1); clearTimeout(t2);
      if (res.conversationId) setConvId(res.conversationId);

      setMessages(prev => [...prev, {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: res.answer || '(no content returned)',
        grounded: true,
        ts: fmtTime(),
      }]);
    } catch (err) {
      clearTimeout(t1); clearTimeout(t2);
      showToast(err.message, 'error');
      setMessages(prev => [...prev, {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: `error: ${err.message}`,
        isError: true,
        ts: fmtTime(),
      }]);
    } finally {
      setLoading(false);
      setLoadStep(0);
    }
  };

  const copyMsg = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied', 'success');
  };

  const chips = userTurns === 0 ? STARTER_PROMPTS : FOLLOWUP_PROMPTS;

  return (
    <div className="view-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="terminal-feed">

        {/* Feed header */}
        <div className="feed-header">
          <div className="feed-thread-id">
            thread/{convId.slice(0, 8)}  ·  turn {userTurns}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={resetChat} disabled={loading} id="btn-new-chat">
            + new session
          </button>
        </div>

        {/* Log entries */}
        <div className="log-list">
          {messages.map(m => (
            <div key={m.id} className={`log-entry ${m.role}`}>
              <div className="log-prefix">
                <span className="log-sigil">{m.role === 'user' ? '>  ' : '✦  '}</span>
                <span className="log-sender">{m.role === 'user' ? 'you' : 'assistant'}</span>
                <span className="log-time">{m.ts}</span>
              </div>
              <div className="log-body">{m.content}</div>

              {/* Knowledge gap notice */}
              {m.content?.includes("don't have enough information") && (
                <div className="gap-notice">
                  <span>No relevant chunks in pgvector.</span>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={onNavigateToIngest}
                    id="btn-goto-ingest"
                  >
                    → ingest data
                  </button>
                </div>
              )}

              {/* Actions */}
              {m.role === 'assistant' && !m.isError && (
                <div className="log-meta">
                  {m.grounded && <span className="log-tag grounded">pgvector · RAG</span>}
                  <button className="btn btn-ghost btn-sm" onClick={() => copyMsg(m.content)}>copy</button>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="thinking-entry">
              <span className="thinking-sigil">✦  </span>
              <span className="thinking-step">{LOADING_STEPS[loadStep - 1] || 'thinking…'}</span>
              <span className="cursor-blink" />
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Prompt chips */}
        <div className="prompt-chips">
          {chips.map((p, i) => (
            <button
              key={i}
              className="prompt-chip"
              onClick={() => send(p)}
              disabled={loading}
              id={`chip-rag-${i}`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="input-dock">
          <form className="input-row" onSubmit={e => { e.preventDefault(); send(); }}>
            <span className="input-prompt-symbol">&gt;</span>
            <input
              id="rag-input"
              type="text"
              className="terminal-input"
              placeholder={userTurns === 0 ? 'ask a question against your knowledge base…' : 'follow-up question (context retained)…'}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              className="input-submit"
              disabled={!input.trim() || loading}
              id="btn-rag-send"
              aria-label="Send"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
