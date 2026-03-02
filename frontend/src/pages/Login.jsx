import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { login }        = useContext(AuthContext);
  const { showSnackbar } = useUI();
  const navigate         = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || username.trim().length === 0) {
      const m = 'Username is required';
      setError(m); showSnackbar(m, { type: 'error' }); setLoading(false); return;
    }
    if (!password || password.length === 0) {
      const m = 'Password is required';
      setError(m); showSnackbar(m, { type: 'error' }); setLoading(false); return;
    }

    try {
      await login(username, password);
      showSnackbar('Login successful!', { type: 'success' });
      navigate('/dashboard');
    } catch (err) {
      const msg = err.detail || err.message || 'Login failed';
      setError(msg); showSnackbar(msg, { type: 'error' }); setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:             #F5F6FA;
          --white:          #FFFFFF;
          --border:         #E2E5EC;
          --border-focus:   #1A56DB;
          --text-primary:   #111827;
          --text-secondary: #6B7280;
          --text-label:     #374151;
          --accent:         #1A56DB;
          --accent-hover:   #1646C0;
          --error-bg:       #FEF2F2;
          --error-border:   #FECACA;
          --error-text:     #B91C1C;
          --placeholder:    #9CA3AF;
        }

        html, body, #root {
          height: 100%;
          font-family: 'Inter', sans-serif;
        }

        .lp-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          padding: 24px;
        }

        .lp-card {
          width: 100%;
          max-width: 400px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 36px 32px 28px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
        }

        /* Brand */
        .brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }

        .logo-box {
          width: 34px;
          height: 34px;
          background: var(--accent);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .logo-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .form-heading {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }

        .form-sub {
          font-size: 14px;
          color: #4B5563;
          margin-bottom: 28px;
          line-height: 1.5;
        }

        /* Error */
        .err-box {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          background: var(--error-bg);
          border: 1px solid var(--error-border);
          border-radius: 8px;
          padding: 11px 13px;
          margin-bottom: 18px;
        }

        .err-box svg { flex-shrink: 0; margin-top: 1px; }
        .err-txt { font-size: 13.5px; color: var(--error-text); line-height: 1.45; }

        /* Field */
        .field { margin-bottom: 16px; }

        .field-lbl {
          display: block;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-label);
          margin-bottom: 6px;
        }

        /* The key fix: position:relative container that clips the button inside */
        .pass-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-input {
          width: 100%;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 14px;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
          -webkit-appearance: none;
          line-height: 1.5;
        }

        .field-input::placeholder { color: var(--placeholder); }

        .field-input:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(26,86,219,0.1);
        }

        .field-input:disabled {
          background: #F9FAFB;
          opacity: .6;
          cursor: not-allowed;
        }

        /* Password input gets right padding to make room for the button */
        .field-input--password {
          padding-right: 42px;
        }

        /* Toggle sits INSIDE the input visually */
        .toggle-btn {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          color: #4B5563;
          border-radius: 0 8px 8px 0;
          transition: color .15s;
          flex-shrink: 0;
        }

        .toggle-btn:hover { color: #111827; }

        /* Submit */
        .submit-btn {
          width: 100%;
          margin-top: 8px;
          padding: 10.5px 16px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background .15s;
          letter-spacing: 0.01em;
        }

        .submit-btn:hover:not(:disabled) { background: var(--accent-hover); }
        .submit-btn:disabled { opacity: .55; cursor: not-allowed; }

        .spinner {
          width: 15px; height: 15px;
          border: 1.8px solid rgba(255,255,255,.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .65s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Footer */
        .lp-foot {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
          text-align: center;
          font-size: 12px;
          color: #4B5563;
        }
      `}</style>

      <div className="lp-root">
        <div className="lp-card">

          {/* Logo */}
          <div className="brand-logo">
            <div className="logo-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <span className="logo-name">ExamSeat</span>
          </div>

          <h1 className="form-heading">Sign in to your account</h1>
          <p className="form-sub">Enter your credentials to access the dashboard.</p>

          {/* Error */}
          {error && (
            <div className="err-box" role="alert">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="#B91C1C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="err-txt">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* Username */}
            <div className="field">
              <label className="field-lbl" htmlFor="es-user">Username</label>
              <input
                id="es-user"
                className="field-input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="field">
              <label className="field-lbl" htmlFor="es-pass">Password</label>
              <div className="pass-wrap">
                <input
                  id="es-pass"
                  className="field-input field-input--password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? (
                <><span className="spinner" />Signing in…</>
              ) : 'Sign in'}
            </button>

          </form>

          <p className="lp-foot">© 2024 ExamSeat. All rights reserved.</p>
        </div>
      </div>
    </>
  );
}

export default Login;