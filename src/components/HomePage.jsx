import React, { useEffect, useRef } from 'react';
import {
  Bot, Database, MessageSquare, FileText,
  Zap, Brain, Search, Cpu, ArrowRight,
  GitBranch, Server, Layers
} from 'lucide-react';

/* ── Tiny helper: animated counter ── */
function Counter({ to, suffix = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start = 0;
    const step = Math.ceil(to / 40);
    const t = setInterval(() => {
      start = Math.min(start + step, to);
      el.textContent = start + suffix;
      if (start >= to) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

const FEATURES = [
  {
    Icon: Search,
    badge: 'RAG',
    title: 'Document Q&A',
    desc: 'Upload any PDF, DOCX, or PPTX. SpringMind splits, embeds, and indexes your documents in pgvector so you can ask natural-language questions grounded in your own data — no hallucinations.',
    tab: 'rag',
    cta: 'Try RAG Assistant →',
  },
  {
    Icon: Database,
    badge: 'pgvector',
    title: 'Smart Ingestion',
    desc: 'Drop raw text or binary files. Apache Tika extracts content from any format, TokenTextSplitter chunks it, and the embedding model indexes it — all in one pipeline.',
    tab: 'ingest',
    cta: 'Upload Documents →',
  },
  {
    Icon: Zap,
    badge: 'Tools',
    title: 'Live Tool Calling',
    desc: 'The LLM autonomously decides when to call external APIs. Ask "What\'s the weather in Tokyo?" and SpringMind fetches live data from Open-Meteo — no manual wiring needed.',
    tab: 'chat',
    cta: 'Open Chat Playground →',
  },
  {
    Icon: FileText,
    badge: 'Structured',
    title: 'Structured Output',
    desc: 'Extract type-safe JSON from any text — title, summary, and bullet-point key insights. Powered by Spring AI entity extraction and Java records.',
    tab: 'summarize',
    cta: 'Try Summarizer →',
  },
];

const HOW_IT_WORKS = [
  {
    num: '01',
    Icon: Layers,
    title: 'Ingest',
    desc: 'Upload documents or paste text. SpringMind chunks and embeds them into PostgreSQL pgvector.',
  },
  {
    num: '02',
    Icon: Search,
    title: 'Retrieve',
    desc: 'Your question is embedded and matched against stored vectors using cosine similarity search.',
  },
  {
    num: '03',
    Icon: Brain,
    title: 'Generate',
    desc: 'Retrieved context + conversation history + live tool data is fed to the LLM for a grounded answer.',
  },
  {
    num: '04',
    Icon: Zap,
    title: 'Execute Tools',
    desc: 'The model autonomously calls @Tool methods (weather, calculators, APIs) when it needs real-time data.',
  },
];

const STACK = [
  { Icon: Cpu,        label: 'Java 21',       sub: 'Runtime'     },
  { Icon: Server,     label: 'Spring Boot 4',  sub: 'Framework'   },
  { Icon: Brain,      label: 'Spring AI 2.0',  sub: 'Orchestration'},
  { Icon: Database,   label: 'pgvector',       sub: 'Vector Store' },
  { Icon: GitBranch,  label: 'Open-Meteo',     sub: 'Live API'    },
  { Icon: Layers,     label: 'Apache Tika',    sub: 'Doc Parser'  },
];

export function HomePage({ onNavigate }) {
  return (
    <div className="home-page">
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="home-hero">
        <div className="home-hero-glow" aria-hidden="true" />

        <div className="home-hero-inner">
          <div className="home-hero-badge">
            <span className="home-badge-dot" />
            <span>Spring AI 2.0 · pgvector · Tool Calling</span>
          </div>

          <h1 className="home-hero-title">
            <span className="home-hero-accent">SpringMind</span>
            <br />
            Your Documents.
            <br />
            Live Data.
            <br />
            One AI.
          </h1>

          <p className="home-hero-sub">
            An enterprise-grade AI knowledge assistant that grounds answers in
            your own documents, remembers your conversations, and calls live APIs
            — all built on Java 21 + Spring AI.
          </p>

          <div className="home-hero-actions">
            <button
              id="hero-get-started"
              className="home-btn-primary"
              onClick={() => onNavigate('rag')}
            >
              <Bot size={16} />
              Get Started — Ask a Question
            </button>
            <button
              id="hero-ingest"
              className="home-btn-secondary"
              onClick={() => onNavigate('ingest')}
            >
              <Database size={16} />
              Upload Documents
            </button>
          </div>

          {/* Stats row */}
          <div className="home-stats">
            <div className="home-stat">
              <div className="home-stat-num"><Counter to={4} />+</div>
              <div className="home-stat-label">AI Capabilities</div>
            </div>
            <div className="home-stat-div" />
            <div className="home-stat">
              <div className="home-stat-num"><Counter to={100} suffix="%" /></div>
              <div className="home-stat-label">Free APIs Used</div>
            </div>
            <div className="home-stat-div" />
            <div className="home-stat">
              <div className="home-stat-num"><Counter to={0} /> Hallucinations</div>
              <div className="home-stat-label">Grounded by Design</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section className="home-section" id="features">
        <div className="home-section-header">
          <span className="home-section-tag">// capabilities</span>
          <h2 className="home-section-title">What can SpringMind do?</h2>
          <p className="home-section-sub">
            Four distinct AI workflows, unified in a single application.
          </p>
        </div>

        <div className="home-features-grid">
          {FEATURES.map((f) => {
            const Icon = f.Icon;
            return (
              <div key={f.tab} className="home-feature-card">
                <div className="home-feature-header">
                  <div className="home-feature-icon-wrap">
                    <Icon size={18} />
                  </div>
                  <span className="home-feature-badge">{f.badge}</span>
                </div>
                <h3 className="home-feature-title">{f.title}</h3>
                <p className="home-feature-desc">{f.desc}</p>
                <button
                  className="home-feature-cta"
                  onClick={() => onNavigate(f.tab)}
                  id={`feature-cta-${f.tab}`}
                >
                  {f.cta}
                  <ArrowRight size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section className="home-section home-section-dark" id="how-it-works">
        <div className="home-section-header">
          <span className="home-section-tag">// architecture</span>
          <h2 className="home-section-title">How it works</h2>
          <p className="home-section-sub">
            A 4-step pipeline that retrieves, generates, and executes — in real time.
          </p>
        </div>

        <div className="home-steps">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.Icon;
            return (
              <React.Fragment key={step.num}>
                <div className="home-step">
                  <div className="home-step-num">{step.num}</div>
                  <div className="home-step-icon">
                    <Icon size={20} />
                  </div>
                  <h3 className="home-step-title">{step.title}</h3>
                  <p className="home-step-desc">{step.desc}</p>
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="home-step-arrow" aria-hidden="true">
                    <ArrowRight size={16} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mini diagram */}
        <div className="home-diagram">
          <div className="home-diagram-node accent">User Query</div>
          <div className="home-diagram-line" />
          <div className="home-diagram-node">Contextualizer</div>
          <div className="home-diagram-line" />
          <div className="home-diagram-node">pgvector Search</div>
          <div className="home-diagram-line" />
          <div className="home-diagram-node">LLM + Tools</div>
          <div className="home-diagram-line" />
          <div className="home-diagram-node accent">Grounded Answer</div>
        </div>
      </section>

      {/* ── QUICK START GUIDE ────────────────────────── */}
      <section className="home-section" id="quick-start">
        <div className="home-section-header">
          <span className="home-section-tag">// quick start</span>
          <h2 className="home-section-title">Using SpringMind in 3 steps</h2>
        </div>

        <div className="home-quickstart-grid">
          <div className="home-qs-step">
            <div className="home-qs-num">1</div>
            <div className="home-qs-content">
              <h3>Upload your documents</h3>
              <p>
                Go to the <button className="home-inline-link" onClick={() => onNavigate('ingest')}>Ingest</button> tab.
                Paste raw text or drop a PDF / DOCX / PPTX file. SpringMind will
                parse, chunk, and index it into the vector database.
              </p>
            </div>
          </div>

          <div className="home-qs-step">
            <div className="home-qs-num">2</div>
            <div className="home-qs-content">
              <h3>Ask questions about your data</h3>
              <p>
                Head to <button className="home-inline-link" onClick={() => onNavigate('rag')}>RAG Assistant</button>.
                Ask anything about the documents you uploaded. Follow-up questions
                work too — SpringMind remembers your conversation.
              </p>
            </div>
          </div>

          <div className="home-qs-step">
            <div className="home-qs-num">3</div>
            <div className="home-qs-content">
              <h3>Chat freely or use live tools</h3>
              <p>
                Open the <button className="home-inline-link" onClick={() => onNavigate('chat')}>Chat Playground</button> for
                general LLM conversation. Ask about the weather in any city — the
                AI will automatically call the live weather API for you.
              </p>
            </div>
          </div>
        </div>

        {/* Example prompts */}
        <div className="home-prompts">
          <div className="home-prompts-label">// example prompts to try</div>
          <div className="home-prompts-list">
            {[
              '"What is the main conclusion of the uploaded document?"',
              '"What is the current weather in Hyderabad?"',
              '"Summarize this research paper in bullet points."',
              '"Who is the lead engineer and what is the project deadline?"',
            ].map((p) => (
              <div key={p} className="home-prompt-item">
                <span className="home-prompt-caret">&gt;</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ───────────────────────────────── */}
      <section className="home-section home-section-dark" id="stack">
        <div className="home-section-header">
          <span className="home-section-tag">// tech stack</span>
          <h2 className="home-section-title">Built with the right tools</h2>
        </div>

        <div className="home-stack-grid">
          {STACK.map((s) => {
            const Icon = s.Icon;
            return (
              <div key={s.label} className="home-stack-card">
                <Icon size={22} className="home-stack-icon" />
                <div className="home-stack-label">{s.label}</div>
                <div className="home-stack-sub">{s.sub}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────── */}
      <section className="home-footer-cta">
        <div className="home-footer-glow" aria-hidden="true" />
        <h2 className="home-footer-title">
          Ready to make your documents intelligent?
        </h2>
        <p className="home-footer-sub">
          Start by uploading a document or asking your first question.
        </p>
        <div className="home-hero-actions">
          <button
            id="footer-get-started"
            className="home-btn-primary"
            onClick={() => onNavigate('rag')}
          >
            <Bot size={16} />
            Start Asking Questions
          </button>
          <button
            id="footer-ingest"
            className="home-btn-secondary"
            onClick={() => onNavigate('ingest')}
          >
            <Database size={16} />
            Upload a Document
          </button>
        </div>
      </section>
    </div>
  );
}
