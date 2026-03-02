import React, { useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
import { useUI } from '../context/UIContext';
import { AuthContext } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [department, setDepartment] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');
  const [editingSubject, setEditingSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showSnackbar } = useUI();
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });
  const openConfirm = (title, message, onConfirm) => setConfirmState({ open: true, title, message, onConfirm });
  const closeConfirm = () => setConfirmState({ open: false, title: '', message: '', onConfirm: null });
  const [expandedDept, setExpandedDept] = useState({});

  const toggleDept = (id) => setExpandedDept((prev) => ({ ...prev, [id]: !prev[id] }));

  const resetForm = () => {
    setEditingSubject(null);
    setName(''); setCode(''); setDepartment('');
    setExamDate(''); setExamTime(''); setError('');
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [subjectsResp, deptsData] = await Promise.all([
          api.getSubjects(null, 100, 0),
          api.getDepartments(),
        ]);
        const subjects = subjectsResp.results || (Array.isArray(subjectsResp) ? subjectsResp : []);
        setSubjects(subjects);
        setDepartments(deptsData);
      } catch (e) {
        const msg = e.message || 'Failed to load';
        setError(msg); showSnackbar(msg, { type: 'error' });
      }
      setLoading(false);
    };
    load();
  }, [showSnackbar]);

  const addSubject = async (e) => {
    e.preventDefault();
    if (!name || name.trim().length < 2) {
      const m = 'Subject name must be at least 2 characters';
      setError(m); showSnackbar(m, { type: 'error' }); return;
    }
    if (!code || code.trim().length < 1) {
      const m = 'Subject code is required';
      setError(m); showSnackbar(m, { type: 'error' }); return;
    }
    if (subjects.some(s => s.subject_code && s.subject_code.toLowerCase() === code.trim().toLowerCase() && (!editingSubject || s.id !== editingSubject.id))) {
      const m = 'Subject code must be unique';
      setError(m); showSnackbar(m, { type: 'error' }); return;
    }
    if (subjects.some(s => s.name && s.name.toLowerCase() === name.trim().toLowerCase() && (!editingSubject || s.id !== editingSubject.id))) {
      const m = 'Subject name must be unique';
      setError(m); showSnackbar(m, { type: 'error' }); return;
    }
    if (!examDate) {
      const m = 'Exam date is required';
      setError(m); showSnackbar(m, { type: 'error' }); return;
    }
    if (!examTime) {
      const m = 'Exam time is required';
      setError(m); showSnackbar(m, { type: 'error' }); return;
    }
    try {
      if (editingSubject) {
        const updated = await api.updateSubject(editingSubject.id, {
          name, subject_code: code, department: department || null,
          exam_date: examDate, exam_time: examTime,
        });
        setSubjects(subjects.map(s => s.id === editingSubject.id ? updated : s));
        showSnackbar('Subject updated', { type: 'success' });
        resetForm();
      } else {
        const newSub = await api.createSubject({
          name, subject_code: code, department: department || null,
          exam_date: examDate, exam_time: examTime,
        });
        setSubjects([...subjects, newSub]);
        showSnackbar('Subject added', { type: 'success' });
        resetForm();
      }
    } catch (e) {
      const msg = e.message || 'Operation failed';
      setError(msg); showSnackbar(msg, { type: 'error' });
    }
  };

  const deleteSubject = (s) => {
    openConfirm(
      'Delete Subject',
      `Are you sure you want to delete subject "${s.name}"? This action cannot be undone.`,
      async () => {
        closeConfirm();
        try {
          await api.deleteSubject(s.id);
          setSubjects(subjects.filter(x => x.id !== s.id));
          showSnackbar('Subject deleted', { type: 'success' });
        } catch (err) {
          showSnackbar(err?.message || 'Delete failed', { type: 'error' });
        }
      }
    );
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (t) => {
    if (!t) return '—';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    return `${hr % 12 || 12}:${m} ${ampm}`;
  };

  const totalWithDate = subjects.filter(s => s.exam_date).length;

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
          --accent-subtle:  #EFF6FF;
          --error-bg:       #FEF2F2;
          --error-border:   #FECACA;
          --error-text:     #B91C1C;
          --success-bg:     #ECFDF5;
          --success-border: #A7F3D0;
          --success-text:   #065F46;
          --warning-bg:     #FFFBEB;
          --warning-border: #FDE68A;
          --warning-text:   #92400E;
        }

        html, body, #root { font-family: 'Inter', sans-serif; }

        /* ── Page ── */
        .sb-page {
          min-height: 100vh;
          background: var(--bg);
          padding: 32px 28px;
          font-family: 'Inter', sans-serif;
        }

        .sb-page-header { margin-bottom: 28px; }
        .sb-page-header h1 {
          font-size: 22px; font-weight: 600;
          color: var(--text-primary); letter-spacing: -0.02em; margin-bottom: 4px;
        }
        .sb-page-header p { font-size: 14px; color: var(--text-secondary); }

        /* ── Summary chips ── */
        .sb-summary {
          display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px;
        }
        .sb-chip {
          display: flex; align-items: center; gap: 8px;
          background: var(--white); border: 1px solid var(--border);
          border-radius: 8px; padding: 10px 16px;
          font-size: 13.5px; color: var(--text-secondary);
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .sb-chip strong { color: var(--text-primary); font-weight: 600; }
        .sb-chip-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        /* ── Card ── */
        .sb-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          margin-bottom: 24px;
          overflow: hidden;
        }
        .sb-card-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px; border-bottom: 1px solid var(--border);
        }
        .sb-card-header h2 {
          font-size: 15px; font-weight: 600;
          color: var(--text-primary); letter-spacing: -0.01em;
        }
        .sb-card-body { padding: 20px; }

        /* ── Error ── */
        .sb-error {
          display: flex; align-items: flex-start; gap: 9px;
          background: var(--error-bg); border: 1px solid var(--error-border);
          border-radius: 8px; padding: 11px 14px;
          font-size: 13.5px; color: var(--error-text);
          line-height: 1.45; margin-bottom: 18px;
        }
        .sb-error svg { flex-shrink: 0; margin-top: 1px; }

        /* ── Form grid ── */
        .sb-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 900px) { .sb-form-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 560px) { .sb-form-grid { grid-template-columns: 1fr; } }

        .sb-field { display: flex; flex-direction: column; gap: 6px; }
        .sb-label { font-size: 13px; font-weight: 500; color: var(--text-label); }
        .sb-req { color: var(--error-text); margin-left: 2px; }

        .sb-input, .sb-select {
          width: 100%; background: var(--white);
          border: 1px solid var(--border); border-radius: 8px;
          padding: 10px 12px; font-size: 14px;
          color: var(--text-primary); font-family: 'Inter', sans-serif;
          outline: none; transition: border-color .15s, box-shadow .15s;
          -webkit-appearance: none;
        }
        .sb-input::placeholder { color: #9CA3AF; }
        .sb-input:focus, .sb-select:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(26,86,219,0.1);
        }
        .sb-input:disabled, .sb-select:disabled {
          background: #F9FAFB; opacity: .6; cursor: not-allowed;
        }

        /* ── Form actions ── */
        .sb-form-actions { display: flex; gap: 10px; margin-top: 20px; }

        .sb-btn-primary {
          background: var(--accent); color: #fff; border: none;
          border-radius: 8px; padding: 10px 16px;
          font-size: 14px; font-weight: 500; font-family: 'Inter', sans-serif;
          cursor: pointer; transition: background .15s; white-space: nowrap;
        }
        .sb-btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
        .sb-btn-primary:disabled { opacity: .55; cursor: not-allowed; }

        .sb-btn-secondary {
          background: transparent; color: var(--text-label);
          border: 1px solid var(--border); border-radius: 8px;
          padding: 10px 14px; font-size: 14px; font-weight: 500;
          font-family: 'Inter', sans-serif; cursor: pointer;
          transition: background .15s;
        }
        .sb-btn-secondary:hover { background: #F9FAFB; }

        /* ── Dept block ── */
        .sb-dept-block { margin-bottom: 28px; }
        .sb-dept-header {
          display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
        }
        .sb-dept-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .sb-dept-count {
          font-size: 12px; color: var(--text-secondary);
          background: var(--bg); border: 1px solid var(--border);
          border-radius: 20px; padding: 2px 9px; font-weight: 500;
        }

        /* ── Table ── */
        .sb-table-wrap {
          background: var(--white); border: 1px solid var(--border);
          border-radius: 10px; overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        thead tr { background: #F9FAFB; }
        thead th {
          padding: 10px 16px; text-align: left;
          font-size: 11.5px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--text-secondary); border-bottom: 1px solid var(--border);
        }
        tbody tr { border-bottom: 1px solid var(--border); transition: background .12s; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: #F9FAFB; }
        tbody td { padding: 12px 16px; color: var(--text-primary); vertical-align: middle; }

        .td-name { font-weight: 500; }
        .td-code {
          font-size: 13px; color: var(--text-secondary);
          font-family: 'SF Mono', 'Fira Code', monospace;
        }
        .td-date, .td-time { font-size: 13.5px; color: var(--text-secondary); white-space: nowrap; }
        .td-actions { display: flex; gap: 6px; align-items: center; }

        /* ── Small buttons ── */
        .sb-btn-ghost {
          padding: 5px 10px; background: transparent;
          color: var(--text-secondary); border: 1px solid var(--border);
          border-radius: 6px; font-family: 'Inter', sans-serif;
          font-size: 12.5px; font-weight: 500; cursor: pointer;
          transition: background .12s, color .12s;
        }
        .sb-btn-ghost:hover { background: #F3F4F6; color: var(--text-primary); }

        .sb-btn-danger {
          padding: 5px 10px; background: transparent;
          color: #DC2626; border: 1px solid #FECACA;
          border-radius: 6px; font-family: 'Inter', sans-serif;
          font-size: 12.5px; font-weight: 500; cursor: pointer;
          transition: background .12s;
        }
        .sb-btn-danger:hover { background: var(--error-bg); }

        /* ── Show more ── */
        .sb-show-more {
          margin-top: 10px; background: none; border: none;
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
          color: var(--accent); cursor: pointer; padding: 4px 0;
          transition: opacity .15s;
        }
        .sb-show-more:hover { opacity: .7; text-decoration: underline; }

        /* ── Section header ── */
        .sb-section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .sb-section-header h2 {
          font-size: 15px; font-weight: 600; color: var(--text-primary);
        }
        .sb-count-chip {
          font-size: 12px; color: var(--text-secondary);
          background: var(--bg); border: 1px solid var(--border);
          border-radius: 20px; padding: 2px 10px; font-weight: 500;
        }

        /* ── Empty state ── */
        .sb-empty {
          background: var(--white); border: 1px solid var(--border);
          border-radius: 12px; padding: 56px 24px; text-align: center;
        }
        .sb-empty-icon {
          width: 44px; height: 44px; background: var(--bg);
          border: 1px solid var(--border); border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px; color: var(--text-secondary);
        }
        .sb-empty-title { font-size: 14px; font-weight: 500; color: var(--text-primary); margin-bottom: 4px; }
        .sb-empty-sub { font-size: 13px; color: var(--text-secondary); }

        /* ── Skeleton ── */
        .skeleton {
          background: linear-gradient(90deg, #F3F4F6 25%, #E9EAEC 50%, #F3F4F6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 4px; height: 13px;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .sk-row td { padding: 13px 16px; }
      `}</style>

      <div className="sb-page">

        {/* Page header */}
        <div className="sb-page-header">
          <h1>Subjects</h1>
          <p>Manage exam subjects, codes, and schedules across departments.</p>
        </div>

        {/* Summary chips */}
        {!loading && subjects.length > 0 && (
          <div className="sb-summary">
            <div className="sb-chip">
              <div className="sb-chip-dot" style={{ background: '#1A56DB' }} />
              <span><strong>{subjects.length}</strong> subjects</span>
            </div>
            <div className="sb-chip">
              <div className="sb-chip-dot" style={{ background: '#059669' }} />
              <span><strong>{totalWithDate}</strong> scheduled</span>
            </div>
            <div className="sb-chip">
              <div className="sb-chip-dot" style={{ background: '#7C3AED' }} />
              <span><strong>{departments.length}</strong> departments</span>
            </div>
            <div className="sb-chip">
              <div className="sb-chip-dot" style={{ background: '#D97706' }} />
              <span><strong>{subjects.length - totalWithDate}</strong> unscheduled</span>
            </div>
          </div>
        )}

        {/* Add / Edit form — ADMIN only */}
        {user?.role === 'ADMIN' && (
          <div className="sb-card">
            <div className="sb-card-header">
              <h2>{editingSubject ? 'Edit Subject' : 'Add Subject'}</h2>
            </div>
            <div className="sb-card-body">
              {error && (
                <div className="sb-error" role="alert">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={addSubject}>
                <div className="sb-form-grid">
                  <div className="sb-field">
                    <label className="sb-label">Subject Name <span className="sb-req">*</span></label>
                    <input className="sb-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Data Structures" disabled={loading} />
                  </div>
                  <div className="sb-field">
                    <label className="sb-label">Subject Code <span className="sb-req">*</span></label>
                    <input className="sb-input" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. CS101" disabled={loading} />
                  </div>
                  <div className="sb-field">
                    <label className="sb-label">Department <span className="sb-req">*</span></label>
                    <select className="sb-select" value={department} onChange={e => setDepartment(e.target.value)} disabled={loading}>
                      <option value="">Select department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="sb-field">
                    <label className="sb-label">Exam Date <span className="sb-req">*</span></label>
                    <input className="sb-input" type="date" value={examDate} onChange={e => setExamDate(e.target.value)} disabled={loading} />
                  </div>
                  <div className="sb-field">
                    <label className="sb-label">Exam Time <span className="sb-req">*</span></label>
                    <input className="sb-input" type="time" value={examTime} onChange={e => setExamTime(e.target.value)} disabled={loading} />
                  </div>
                </div>
                <div className="sb-form-actions">
                  <button type="submit" className="sb-btn-primary" disabled={loading}>
                    {loading ? (editingSubject ? 'Updating…' : 'Adding…') : (editingSubject ? 'Update Subject' : 'Add Subject')}
                  </button>
                  {editingSubject && (
                    <button type="button" className="sb-btn-secondary" onClick={resetForm}>Cancel</button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="sb-card">
            <div className="sb-card-body">
              <div className="sb-table-wrap">
                <table>
                  <thead>
                    <tr><th>Name</th><th>Code</th><th>Date</th><th>Time</th></tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr className="sk-row" key={i}>
                        {[180, 70, 100, 70].map((w, j) => (
                          <td key={j}><div className="skeleton" style={{ width: w }} /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : subjects.length > 0 ? (
          <>
            <div className="sb-section-header">
              <h2>All Subjects</h2>
              <span className="sb-count-chip">{subjects.length} total</span>
            </div>

            {departments.map(dept => {
              const deptSubs = subjects.filter(s => String(s.department) === String(dept.id));
              if (deptSubs.length === 0) return null;
              const expanded = !!expandedDept[dept.id];
              const showList = expanded ? deptSubs : deptSubs.slice(0, 10);
              return (
                <div className="sb-dept-block" key={dept.id}>
                  <div className="sb-dept-header">
                    <span className="sb-dept-name">{dept.name}</span>
                    <span className="sb-dept-count">{deptSubs.length} subjects</span>
                  </div>
                  <div className="sb-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Code</th>
                          <th>Exam Date</th>
                          <th>Exam Time</th>
                          {user?.role === 'ADMIN' && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {showList.map(s => (
                          <tr key={s.id}>
                            <td className="td-name">{s.name}</td>
                            <td className="td-code">{s.subject_code}</td>
                            <td className="td-date">{formatDate(s.exam_date)}</td>
                            <td className="td-time">{formatTime(s.exam_time)}</td>
                            {user?.role === 'ADMIN' && (
                              <td>
                                <div className="td-actions">
                                  <button
                                    className="sb-btn-ghost"
                                    onClick={() => {
                                      setEditingSubject(s);
                                      setName(s.name); setCode(s.subject_code);
                                      setDepartment(s.department || '');
                                      setExamDate(s.exam_date || '');
                                      setExamTime(s.exam_time || '');
                                      document.querySelector('.page-content')?.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                  >Edit</button>
                                  <button className="sb-btn-danger" onClick={() => deleteSubject(s)}>Delete</button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {deptSubs.length > 10 && (
                    <button className="sb-show-more" onClick={() => toggleDept(dept.id)}>
                      {expanded ? 'Show less' : `Show ${deptSubs.length - 10} more`}
                    </button>
                  )}
                </div>
              );
            })}

            {/* Unassigned */}
            {subjects.filter(s => !s.department).length > 0 && (
              <div className="sb-dept-block">
                <div className="sb-dept-header">
                  <span className="sb-dept-name">Unassigned</span>
                  <span className="sb-dept-count">{subjects.filter(s => !s.department).length} subjects</span>
                </div>
                <div className="sb-table-wrap">
                  <table>
                    <thead>
                      <tr><th>Name</th><th>Code</th><th>Exam Date</th><th>Exam Time</th></tr>
                    </thead>
                    <tbody>
                      {subjects.filter(s => !s.department).map(s => (
                        <tr key={s.id}>
                          <td className="td-name">{s.name}</td>
                          <td className="td-code">{s.subject_code}</td>
                          <td className="td-date">{formatDate(s.exam_date)}</td>
                          <td className="td-time">{formatTime(s.exam_time)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="sb-empty">
            <div className="sb-empty-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <div className="sb-empty-title">No subjects yet</div>
            <div className="sb-empty-sub">Add your first subject using the form above.</div>
          </div>
        )}

      </div>
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
      />
    </>
  );
}

export default Subjects;