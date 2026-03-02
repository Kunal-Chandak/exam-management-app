import React from 'react';

const TYPE_ICONS = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

export default function Snackbar({ open, message, type = 'info', onClose }) {
  if (!open || !message) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

        .snackbar-wrap {
          position: fixed;
          right: 20px;
          top: 20px;
          z-index: 9999;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .snackbar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          min-width: 240px;
          max-width: 380px;
          font-size: 13.5px;
          font-weight: 500;
          border: 1px solid transparent;
          animation: snackbar-in 0.2s ease;
        }

        @keyframes snackbar-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .snackbar-icon { flex-shrink: 0; display: flex; align-items: center; }
        .snackbar-message { flex: 1; line-height: 1.4; }

        .snackbar-close {
          background: transparent;
          border: none;
          cursor: pointer;
          color: inherit;
          opacity: 0.6;
          padding: 2px;
          display: flex;
          align-items: center;
          transition: opacity 0.15s;
          flex-shrink: 0;
        }
        .snackbar-close:hover { opacity: 1; }

        .snackbar.success {
          background: #ECFDF5; color: #065F46; border-color: #A7F3D0;
        }
        .snackbar.error {
          background: #FEF2F2; color: #B91C1C; border-color: #FECACA;
        }
        .snackbar.warning {
          background: #FFFBEB; color: #92400E; border-color: #FDE68A;
        }
        .snackbar.info {
          background: #EFF6FF; color: #1E40AF; border-color: #BFDBFE;
        }
      `}</style>
      <div className="snackbar-wrap">
        <div className={`snackbar ${type}`}>
          <span className="snackbar-icon">{TYPE_ICONS[type] || TYPE_ICONS.info}</span>
          <span className="snackbar-message">{message}</span>
          <button className="snackbar-close" onClick={onClose} aria-label="Dismiss">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
