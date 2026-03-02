import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ManualGridAssignment from '../components/ManualGridAssignment';
import SeatingTable from '../components/SeatingTable';
import Snackbar from '../components/Snackbar';
import {
  validateMinimumDepartments,
  validateStudentNotDoubleBooked,
} from '../utils/validation';

function GenerateSeating() {
  const [departments, setDepartments] = useState([]);
  const [mainDept, setMainDept] = useState('');
  const [seatingDept, setSeatingDept] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });
  const [showResult, setShowResult] = useState(false);

  useEffect(() => { loadInitial(); }, []);

  const loadInitial = async () => {
    try {
      const depts = await api.getDepartments();
      setDepartments(depts);
    } catch (error) {
      showSnackbar(error.message || 'Failed to load departments', 'error');
    }
  };

  useEffect(() => {
    if (mainDept) { loadSubjectsForDept(mainDept); }
    else { setSubjects([]); setSelectedSubject(''); }
  }, [mainDept]);

  const loadSubjectsForDept = async (deptId) => {
    try {
      const response = await api.getSubjects(deptId, 100, 0);
      const data = response.results || (Array.isArray(response) ? response : []);
      setSubjects(data);
    } catch (error) {
      showSnackbar(error.message || 'Failed to load subjects', 'error');
    }
  };

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => setSnackbar({ open: false, message: '', type: 'success' }), 3000);
  };

  const handleSubjectChange = (e) => setSelectedSubject(e.target.value);

  const validateInputs = () => {
    if (!mainDept) { showSnackbar('Please select a main department', 'error'); return false; }
    if (!selectedSubject) { showSnackbar('Please select a subject', 'error'); return false; }
    if (!seatingDept) { showSnackbar('Please select a seating department', 'error'); return false; }
    return true;
  };

  const handleCompleteManualAssignment = () => {
    showSnackbar('Seating assignment completed successfully!', 'success');
    setShowResult(false);
    setSelectedSubject('');
  };

  const selectedSubjectObj = subjects.find(s => String(s.id) === String(selectedSubject));
  const mainDeptObj = departments.find(d => String(d.id) === String(mainDept));
  const seatingDeptObj = departments.find(d => String(d.id) === String(seatingDept));

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
          --success-bg:     #ECFDF5;
          --success-border: #A7F3D0;
          --success-text:   #065F46;
        }

        html, body, #root { font-family: 'Inter', sans-serif; }

        /* ── Page ── */
        .gs-page {
          min-height: 100vh;
          background: var(--bg);
          padding: 32px 28px;
          font-family: 'Inter', sans-serif;
        }

        /* ── Header ── */
        .gs-header { margin-bottom: 28px; }
        .gs-header h1 {
          font-size: 22px; font-weight: 600;
          color: var(--text-primary); letter-spacing: -0.02em;
          margin-bottom: 4px;
        }
        .gs-header p { font-size: 14px; color: var(--text-secondary); }

        /* ── Step indicator ── */
        .gs-steps {
          display: flex; align-items: center; gap: 0;
          margin-bottom: 24px;
        }
        .gs-step {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 500; color: var(--text-secondary);
        }
        .gs-step.active { color: var(--accent); }
        .gs-step.done { color: var(--success-text); }
        .gs-step-num {
          width: 24px; height: 24px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 600; flex-shrink: 0;
          background: var(--bg); border: 1.5px solid var(--border);
          color: var(--text-secondary);
        }
        .gs-step.active .gs-step-num {
          background: var(--accent); border-color: var(--accent); color: #fff;
        }
        .gs-step.done .gs-step-num {
          background: var(--success-bg); border-color: var(--success-border);
          color: var(--success-text);
        }
        .gs-step-line {
          flex: 1; height: 1px; background: var(--border);
          margin: 0 12px; max-width: 60px;
        }

        /* ── Controls card ── */
        .gs-controls-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          margin-bottom: 24px;
          overflow: hidden;
        }
        .gs-controls-header {
          padding: 18px 20px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 10px;
        }
        .gs-controls-header h2 {
          font-size: 15px; font-weight: 600;
          color: var(--text-primary); letter-spacing: -0.01em;
        }
        .gs-controls-body {
          padding: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 14px;
          align-items: end;
        }
        @media (max-width: 900px) { .gs-controls-body { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 560px) { .gs-controls-body { grid-template-columns: 1fr; } }

        /* ── Field ── */
        .gs-field { display: flex; flex-direction: column; gap: 6px; }
        .gs-label {
          font-size: 13px; font-weight: 500; color: var(--text-label);
        }
        .gs-req { color: #B91C1C; margin-left: 2px; }
        .gs-select {
          width: 100%; background: var(--white);
          border: 1px solid var(--border); border-radius: 8px;
          padding: 10px 12px; font-size: 14px;
          color: var(--text-primary); font-family: 'Inter', sans-serif;
          outline: none; transition: border-color .15s, box-shadow .15s;
          -webkit-appearance: none;
        }
        .gs-select:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(26,86,219,0.1);
        }
        .gs-select:disabled {
          background: #F9FAFB; color: #9CA3AF; cursor: not-allowed;
        }

        /* ── Action bar ── */
        .gs-action-bar {
          grid-column: 1 / -1;
          display: flex; align-items: center;
          justify-content: space-between;
          padding-top: 6px;
          border-top: 1px solid var(--border);
          margin-top: 6px;
          flex-wrap: wrap; gap: 12px;
        }

        /* ── Config summary chips ── */
        .gs-config-chips {
          display: flex; gap: 8px; flex-wrap: wrap;
        }
        .gs-config-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--accent-subtle); border: 1px solid #BFDBFE;
          border-radius: 6px; padding: 4px 10px;
          font-size: 12.5px; color: var(--accent); font-weight: 500;
        }
        .gs-config-chip svg { flex-shrink: 0; }

        /* ── Primary button ── */
        .gs-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px;
          background: var(--accent); color: #fff;
          border: none; border-radius: 8px;
          font-size: 14px; font-weight: 500;
          font-family: 'Inter', sans-serif;
          cursor: pointer; transition: background .15s;
          white-space: nowrap;
        }
        .gs-btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
        .gs-btn-primary:disabled {
          background: #D1D5DB; cursor: not-allowed;
        }

        /* ── Result wrapper ── */
        .gs-result-wrap {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          margin-bottom: 24px;
          overflow: hidden;
        }
        .gs-result-header {
          padding: 18px 20px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .gs-result-header h2 {
          font-size: 15px; font-weight: 600; color: var(--text-primary);
        }
        .gs-result-body { padding: 20px; }

        .gs-result-meta {
          display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;
        }
        .gs-meta-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--bg); border: 1px solid var(--border);
          border-radius: 6px; padding: 5px 12px;
          font-size: 13px; color: var(--text-secondary); font-weight: 500;
        }
        .gs-meta-chip strong { color: var(--text-primary); font-weight: 600; }

        /* ── Empty / existing arrangements card ── */
        .gs-existing-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .gs-existing-header {
          padding: 18px 20px;
          border-bottom: 1px solid var(--border);
        }
        .gs-existing-header h2 {
          font-size: 15px; font-weight: 600; color: var(--text-primary);
        }

        /* ── Empty state ── */
        .gs-empty {
          padding: 56px 24px; text-align: center;
        }
        .gs-empty-icon {
          width: 44px; height: 44px; background: var(--bg);
          border: 1px solid var(--border); border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px; color: var(--text-secondary);
        }
        .gs-empty-title {
          font-size: 14px; font-weight: 500;
          color: var(--text-primary); margin-bottom: 4px;
        }
        .gs-empty-sub { font-size: 13px; color: var(--text-secondary); }

        /* ── How it works info bar ── */
        .gs-info-bar {
          display: flex; gap: 0; margin-bottom: 24px;
          background: var(--accent-subtle);
          border: 1px solid #BFDBFE;
          border-radius: 10px; overflow: hidden;
        }
        .gs-info-accent {
          width: 4px; background: var(--accent); flex-shrink: 0;
        }
        .gs-info-content {
          padding: 12px 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .gs-info-content svg { flex-shrink: 0; color: var(--accent); }
        .gs-info-text { font-size: 13px; color: var(--accent); font-weight: 500; }
        .gs-info-text span { font-weight: 400; color: #1e40af; }

        @media (max-width: 768px) {
          .gs-page { padding: 20px 16px; }
          .gs-steps { display: none; }
        }
      `}</style>

      <div className="gs-page">

        {/* ── Header ── */}
        <div className="gs-header">
          <h1>Generate Seating</h1>
          <p>Create exam seating arrangements by selecting department, subject, and venue.</p>
        </div>

        {/* ── Step indicator ── */}
        <div className="gs-steps">
          <div className={`gs-step ${mainDept ? 'done' : 'active'}`}>
            <div className="gs-step-num">
              {mainDept ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : '1'}
            </div>
            Select Department
          </div>
          <div className="gs-step-line"/>
          <div className={`gs-step ${selectedSubject ? 'done' : mainDept ? 'active' : ''}`}>
            <div className="gs-step-num">
              {selectedSubject ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : '2'}
            </div>
            Choose Subject
          </div>
          <div className="gs-step-line"/>
          <div className={`gs-step ${seatingDept ? 'done' : selectedSubject ? 'active' : ''}`}>
            <div className="gs-step-num">
              {seatingDept ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : '3'}
            </div>
            Pick Venue
          </div>
          <div className="gs-step-line"/>
          <div className={`gs-step ${showResult ? 'active' : ''}`}>
            <div className="gs-step-num">4</div>
            Assign Seats
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="gs-controls-card">
          <div className="gs-controls-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A56DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
            <h2>Configuration</h2>
          </div>
          <div className="gs-controls-body">
            <div className="gs-field">
              <label className="gs-label">Main Department <span className="gs-req">*</span></label>
              <select className="gs-select" value={mainDept} onChange={e => { setMainDept(e.target.value); setShowResult(false); }}>
                <option value="">Select department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="gs-field">
              <label className="gs-label">Subject <span className="gs-req">*</span></label>
              <select className="gs-select" value={selectedSubject} onChange={e => { handleSubjectChange(e); setShowResult(false); }} disabled={!mainDept}>
                <option value="">{mainDept ? 'Select subject' : 'Select department first'}</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.subject_code})</option>
                ))}
              </select>
            </div>

            <div className="gs-field">
              <label className="gs-label">Seating Venue (Department) <span className="gs-req">*</span></label>
              <select className="gs-select" value={seatingDept} onChange={e => { setSeatingDept(e.target.value); setShowResult(false); }}>
                <option value="">Select venue department</option>
                {departments.filter(d => String(d.id) !== String(mainDept)).map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="gs-action-bar">
              {/* Config summary */}
              <div className="gs-config-chips">
                {mainDeptObj && (
                  <span className="gs-config-chip">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/></svg>
                    {mainDeptObj.name}
                  </span>
                )}
                {selectedSubjectObj && (
                  <span className="gs-config-chip">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    {selectedSubjectObj.name}
                  </span>
                )}
                {seatingDeptObj && (
                  <span className="gs-config-chip">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                    {seatingDeptObj.name}
                  </span>
                )}
              </div>

              <button
                className="gs-btn-primary"
                onClick={() => { if (validateInputs()) setShowResult(true); }}
                disabled={loading || !mainDept || !selectedSubject || !seatingDept}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Start Assignment
              </button>
            </div>
          </div>
        </div>

        {/* ── Result / Manual grid ── */}
        {showResult && (
          <div className="gs-result-wrap">
            <div className="gs-result-header">
              <h2>Seat Assignment</h2>
              <div className="gs-result-meta">
                {mainDeptObj && <span className="gs-meta-chip"><strong>{mainDeptObj.name}</strong></span>}
                {selectedSubjectObj && <span className="gs-meta-chip">{selectedSubjectObj.name} · {selectedSubjectObj.subject_code}</span>}
                {seatingDeptObj && <span className="gs-meta-chip">Venue: {seatingDeptObj.name}</span>}
              </div>
            </div>
            <div className="gs-result-body">
              <ManualGridAssignment
                mainDept={mainDept}
                seatingDept={seatingDept}
                subject={selectedSubject}
                onComplete={handleCompleteManualAssignment}
              />
            </div>
          </div>
        )}

        {/* ── Existing arrangements ── */}
        {!showResult && (
          <div className="gs-existing-card">
            <div className="gs-existing-header">
              <h2>Existing Arrangements</h2>
            </div>
            {assignments.length === 0 ? (
              <div className="gs-empty">
                <div className="gs-empty-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                  </svg>
                </div>
                <div className="gs-empty-title">No arrangements yet</div>
                <div className="gs-empty-sub">Configure the options above and click "Start Assignment" to begin.</div>
              </div>
            ) : (
              <div style={{ padding: 20 }}>
                <SeatingTable assignments={assignments} />
              </div>
            )}
          </div>
        )}

      </div>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar({ open: false, message: '', type: 'success' })}
      />
    </>
  );
}

export default GenerateSeating;