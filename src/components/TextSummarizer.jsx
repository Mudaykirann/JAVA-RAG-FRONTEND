import React, { useState } from 'react';
import { summarizeText } from '../api';

const SAMPLES = [
  {
    label: 'spring-boot',
    text: `Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications that you can just run. We take an opinionated view of the Spring platform and third-party libraries so you can get started with minimum fuss. Most Spring Boot applications need minimal Spring configuration. It embeds Tomcat, Jetty or Undertow directly, provides opinionated starter dependencies to simplify your build configuration, and automatically configures Spring and 3rd party libraries whenever possible.`,
  },
  {
    label: 'pgvector-prod',
    text: `Vector databases have become the cornerstone of modern AI retrieval systems. By enabling pgvector inside PostgreSQL, engineering teams eliminate the operational overhead of running dedicated vector engines like Pinecone or Milvus. PostgreSQL pgvector supports exact nearest neighbor and approximate nearest neighbor search via IVFFlat and HNSW indexes, ensuring low-latency similarity queries even with millions of high-dimensional vectors, while retaining ACID compliance and standard SQL query power.`,
  },
  {
    label: 'rag-best-practices',
    text: `Retrieval-Augmented Generation bridges the gap between static LLM foundation models and dynamic private company knowledge. Effective RAG architectures require high-quality document tokenization, intelligent semantic chunking with overlapping context windows, and strict prompt grounding to prevent hallucinations. Furthermore, adding hybrid keyword search alongside dense vector retrieval significantly boosts recall accuracy for exact identifier lookups.`,
  },
];

export function TextSummarizer({ showToast }) {
  const [text, setText]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [rawJson, setRawJson]   = useState(false);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  const summarize = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await summarizeText(text);
      setResult(data);
      showToast('Summary generated', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    const md = `# ${result.title}\n\n${result.summary}\n\nKey Points:\n${(result.keyPoints || []).map(k => `- ${k}`).join('\n')}`;
    navigator.clipboard.writeText(md);
    showToast('Copied', 'success');
  };

  return (
    <div className="view-scroll">
      <div className="page-strip">
        <span className="page-title">summarize</span>
        <span className="page-subtitle">structured entity extraction · Spring AI</span>
      </div>

      <div className="summarizer-wrap">

        {/* Input */}
        <div className="panel">
          <div className="panel-header">
            <span>// source text</span>
            <span style={{ fontWeight: 400, letterSpacing: 0 }}>{words} words</span>
          </div>
          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            {/* Sample loaders */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.64rem', color: 'var(--dim)', alignSelf: 'center', marginRight: '0.1rem' }}>load sample:</span>
              {SAMPLES.map((s, i) => (
                <button key={i} className="prompt-chip" onClick={() => setText(s.text)} id={`sample-${i}`}>
                  {s.label}
                </button>
              ))}
            </div>

            <textarea
              className="field-input"
              placeholder="paste text to summarize — articles, RFCs, meeting notes, documentation…"
              value={text}
              onChange={e => setText(e.target.value)}
              disabled={loading}
              style={{ minHeight: '140px' }}
              id="summarize-input"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
              {text && <button className="btn btn-secondary" onClick={() => setText('')} disabled={loading}>clear</button>}
              <button
                className="btn btn-primary"
                onClick={summarize}
                disabled={!text.trim() || loading}
                id="btn-summarize"
              >
                {loading ? 'extracting entities…' : 'generate summary →'}
              </button>
            </div>

          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="summary-output">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div className="summary-output-label">SummaryResponse — Spring AI structured output</div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setRawJson(!rawJson)} id="btn-toggle-json">
                  {rawJson ? 'formatted' : 'raw json'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={copyResult} id="btn-copy-summary">copy</button>
              </div>
            </div>

            {rawJson ? (
              <pre className="json-view">{JSON.stringify(result, null, 2)}</pre>
            ) : (
              <>
                <div className="summary-title-text">{result.title}</div>
                <div className="summary-body-text">{result.summary}</div>
                <div className="keypoints-section-label">key points</div>
                {(result.keyPoints || []).map((pt, i) => (
                  <div key={i} className="keypoint-row">
                    <span className="keypoint-num">{String(i + 1).padStart(2, '0')}.</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
