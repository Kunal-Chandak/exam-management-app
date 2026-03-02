import React from 'react';

/**
 * ConfirmDialog – styled replacement for window.confirm()
 *
 * Props:
 *   open        {boolean}   – whether the dialog is visible
 *   title       {string}    – dialog heading  (default: "Confirm Delete")
 *   message     {string}    – body text
 *   confirmLabel{string}    – confirm button label (default: "Delete")
 *   onConfirm   {function}  – called when user clicks the confirm button
 *   onCancel    {function}  – called when user clicks Cancel or the backdrop
 */
export default function ConfirmDialog({
    open,
    title = 'Confirm Delete',
    message = 'Are you sure? This action cannot be undone.',
    confirmLabel = 'Delete',
    onConfirm,
    onCancel,
}) {
    if (!open) return null;

    return (
        <>
            <style>{`
        .cd-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          font-family: 'Inter', sans-serif;
          animation: cd-fade-in 0.15s ease;
        }
        @keyframes cd-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .cd-box {
          background: #FFFFFF;
          border: 1px solid #E2E5EC;
          border-radius: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
          width: 420px;
          max-width: calc(100vw - 32px);
          animation: cd-slide-in 0.18s ease;
          overflow: hidden;
        }
        @keyframes cd-slide-in {
          from { transform: translateY(-12px) scale(0.97); opacity: 0; }
          to   { transform: translateY(0) scale(1);        opacity: 1; }
        }

        .cd-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 20px 0 20px;
        }

        .cd-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cd-title {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          letter-spacing: -0.01em;
          margin: 0;
        }

        .cd-body {
          padding: 12px 20px 20px 20px;
          padding-left: 72px; /* aligns with title text (icon 40 + gap 12 + header-left 20) */
        }

        .cd-message {
          font-size: 13.5px;
          color: #6B7280;
          line-height: 1.55;
          margin: 0;
        }

        .cd-divider {
          height: 1px;
          background: #E2E5EC;
          margin: 0 20px;
        }

        .cd-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 14px 20px;
        }

        .cd-btn-cancel {
          height: 36px;
          padding: 0 16px;
          border-radius: 8px;
          border: 1px solid #E2E5EC;
          background: #FFFFFF;
          color: #374151;
          font-size: 13.5px;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .cd-btn-cancel:hover {
          background: #F3F4F6;
          border-color: #D1D5DB;
        }

        .cd-btn-confirm {
          height: 36px;
          padding: 0 16px;
          border-radius: 8px;
          border: none;
          background: #DC2626;
          color: #FFFFFF;
          font-size: 13.5px;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          transition: background 0.15s, box-shadow 0.15s;
        }
        .cd-btn-confirm:hover {
          background: #B91C1C;
          box-shadow: 0 2px 8px rgba(220,38,38,0.35);
        }
        .cd-btn-confirm:active {
          background: #991B1B;
        }
      `}</style>

            {/* backdrop click → cancel */}
            <div className="cd-overlay" onClick={onCancel}>
                <div className="cd-box" onClick={(e) => e.stopPropagation()}>

                    {/* Header */}
                    <div className="cd-header">
                        <div className="cd-icon-wrap">
                            {/* trash icon */}
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M9 6V4h6v2" />
                            </svg>
                        </div>
                        <h3 className="cd-title">{title}</h3>
                    </div>

                    {/* Body */}
                    <div className="cd-body">
                        <p className="cd-message">{message}</p>
                    </div>

                    <div className="cd-divider" />

                    {/* Action buttons */}
                    <div className="cd-actions">
                        <button className="cd-btn-cancel" onClick={onCancel}>
                            Cancel
                        </button>
                        <button className="cd-btn-confirm" onClick={onConfirm}>
                            {/* trash mini icon */}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M9 6V4h6v2" />
                            </svg>
                            {confirmLabel}
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}
