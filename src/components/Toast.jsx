import React from 'react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className="toast-dock" aria-live="polite">
      <div className={`toast-item ${toast.type || 'info'}`} id="toast-notification">
        <span style={{ flexShrink: 0, color: 'var(--dim)' }}>
          {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : '·'}
        </span>
        <span style={{ flex: 1 }}>{toast.message}</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dim)', padding: '0 0 0 0.5rem', fontSize: '0.8rem', flexShrink: 0 }}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
