import React from 'react';

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

          :root {
            --white:    #FFFFFF;
            --border:   #E2E5EC;
            --text-primary:   #111827;
            --text-secondary: #6B7280;
          }
          
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            font-family: 'Inter', sans-serif;
          }
          
          .modal-content {
            background: var(--white);
            border: 1px solid var(--border);
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
            max-width: 90vw;
            max-height: 90vh;
            overflow: auto;
            position: relative;
            min-width: 360px;
          }
          
          .modal-header {
            border-bottom: 1px solid var(--border);
            padding: 18px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .modal-header h3 {
            font-size: 15px;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0;
            letter-spacing: -0.01em;
          }
          
          .modal-close-btn {
            background: none;
            border: 1px solid var(--border);
            border-radius: 6px;
            color: var(--text-secondary);
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background .15s, color .15s;
            flex-shrink: 0;
          }
          
          .modal-close-btn:hover {
            background: #F3F4F6;
            color: var(--text-primary);
          }
          
          .modal-body {
            padding: 20px;
          }
        `}
      </style>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
