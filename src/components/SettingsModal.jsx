import React, { useState } from 'react';
import { getBackendUrl, setBackendUrl, DEFAULT_BACKEND_URL, checkBackendHealth } from '../api';

export function SettingsModal({ isOpen, onClose, onUrlUpdated, showToast }) {
  if (!isOpen) return null;

  const [url, setUrl]           = useState(getBackendUrl());
  const [testing, setTesting]   = useState(false);
  const [testResult, setResult] = useState(null);

  const save = () => {
    setBackendUrl(url);
    onUrlUpdated();
    showToast('URL saved', 'success');
    onClose();
  };

  const reset = () => {
    setUrl(DEFAULT_BACKEND_URL);
    setBackendUrl(DEFAULT_BACKEND_URL);
    onUrlUpdated();
    showToast('Reset to http://localhost:8081', 'info');
  };

  const test = async () => {
    setTesting(true);
    setResult(null);
    const res = await checkBackendHealth();
    setResult(res);
    setTesting(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        <div className="modal-titlebar">
          <span className="modal-title">// settings</span>
          <button className="modal-close" onClick={onClose} id="btn-close-settings" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-inner">

          {/* URL config */}
          <div>
            <label className="field-label" htmlFor="input-backend-url">spring boot api url</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                id="input-backend-url"
                type="text"
                className="field-input"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="http://localhost:8081"
              />
              <button className="btn btn-secondary btn-sm" onClick={reset} title="Reset to default" id="btn-reset-url">
                ↺
              </button>
            </div>
            <p className="field-hint">default port 8081 — set in application.properties</p>
          </div>

          {/* Test */}
          <div>
            <button
              className="btn btn-secondary"
              onClick={test}
              disabled={testing}
              style={{ width: '100%' }}
              id="btn-test-connection"
            >
              {testing ? 'testing…' : '↗ test connection'}
            </button>

            {testResult && (
              <div className={`conn-result ${testResult.ok ? 'ok' : 'fail'}`} style={{ marginTop: '0.65rem' }}>
                <span style={{ flexShrink: 0 }}>{testResult.ok ? '✓' : '✗'}</span>
                <div>
                  <strong>{testResult.ok ? 'connected' : 'connection failed'}</strong>
                  <div style={{ fontSize: '0.64rem', marginTop: '0.15rem', opacity: 0.8 }}>
                    {testResult.ok ? `latency: ${testResult.latencyMs}ms` : testResult.error}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Architecture */}
          <div>
            <label className="field-label">stack info</label>
            <div className="arch-table">
              <div className="arch-row"><span className="arch-key">backend</span><span className="arch-val">Java 21 · Spring Boot 4.1</span></div>
              <div className="arch-row"><span className="arch-key">ai layer</span><span className="arch-val">Spring AI 2.0.1</span></div>
              <div className="arch-row"><span className="arch-key">vector store</span><span className="arch-val">PostgreSQL pgvector :5433</span></div>
              <div className="arch-row"><span className="arch-key">embedding dims</span><span className="arch-val">1536 · cosine similarity</span></div>
              <div className="arch-row"><span className="arch-key">doc parser</span><span className="arch-val">Apache Tika</span></div>
            </div>
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} id="btn-cancel-settings">cancel</button>
          <button className="btn btn-primary" onClick={save} id="btn-save-settings">save</button>
        </div>

      </div>
    </div>
  );
}
