import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../api';

const QUICK = [
  'Explain DI in Spring Boot in 2 sentences.',
  'Difference between @Component and @Bean?',
  'How does pgvector cosine similarity work?',
  'What does TokenTextSplitter do in Spring AI?',
];

function fmtTime(d = new Date()) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function ChatPlayground({ showToast }) {
  const [messages, setMessages] = useState([
    { id: 'init', role: 'assistant', content: 'General LLM chat — no vector retrieval. Ask anything.', ts: fmtTime() },
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setMessages(prev => [...prev, { id: String(Date.now()), role: 'user', content: msg, ts: fmtTime() }]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(msg);
      setMessages(prev => [...prev, {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: res.answer || res.response || '(no content)',
        ts: fmtTime(),
      }]);
    } catch (err) {
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
    }
  };

  const clearChat = () => {
    setMessages([]);
    showToast('Cleared', 'info');
  };

  const exportChat = () => {
    const md = messages.map(m => `[${m.ts}] ${m.role.toUpperCase()}\n\n${m.content}\n`).join('\n---\n\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([md], { type: 'text/markdown' })),
      download: `chat-${Date.now()}.md`,
    });
    a.click();
    showToast('Exported', 'success');
  };

  const copy = (text) => { navigator.clipboard.writeText(text); showToast('Copied', 'success'); };

  return (
    <div className="view-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="terminal-feed">

        {/* Feed header */}
        <div className="feed-header">
          <div className="feed-thread-id">general-chat  ·  no vector retrieval</div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {messages.length > 1 && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={exportChat} id="btn-export-chat">export</button>
                <button className="btn btn-secondary btn-sm" onClick={clearChat} id="btn-clear-chat">clear</button>
              </>
            )}
          </div>
        </div>

        {/* Log */}
        <div className="log-list">
          {messages.map(m => (
            <div key={m.id} className={`log-entry ${m.role}`}>
              <div className="log-prefix">
                <span className="log-sigil">{m.role === 'user' ? '>  ' : '✦  '}</span>
                <span className="log-sender">{m.role === 'user' ? 'you' : 'llm'}</span>
                <span className="log-time">{m.ts}</span>
              </div>
              <div className="log-body">{m.content}</div>
              {m.role === 'assistant' && !m.isError && (
                <div className="log-meta">
                  <button className="btn btn-ghost btn-sm" onClick={() => copy(m.content)}>copy</button>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="thinking-entry">
              <span className="thinking-sigil">✦  </span>
              <span className="thinking-step">generating response…</span>
              <span className="cursor-blink" />
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Quick chips */}
        <div className="prompt-chips">
          {QUICK.map((q, i) => (
            <button key={i} className="prompt-chip" onClick={() => send(q)} disabled={loading} id={`chip-chat-${i}`}>
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="input-dock">
          <form className="input-row" onSubmit={e => { e.preventDefault(); send(); }}>
            <span className="input-prompt-symbol">&gt;</span>
            <input
              id="chat-input"
              type="text"
              className="terminal-input"
              placeholder="type your message…"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" className="input-submit" disabled={!input.trim() || loading} id="btn-chat-send" aria-label="Send">
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
