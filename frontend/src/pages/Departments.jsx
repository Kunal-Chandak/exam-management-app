import React, { useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
import { useUI } from '../context/UIContext';
import { AuthContext } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

function Departments() {
  const [departments, setDepartments] = useState([]);
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [editingDept, setEditingDept] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showSnackbar } = useUI();
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });
  const openConfirm = (title, message, onConfirm) => setConfirmState({ open: true, title, message, onConfirm });
  const closeConfirm = () => setConfirmState({ open: false, title: '', message: '', onConfirm: null });

  const resetForm = () => { setEditingDept(null); setName(''); setCode(''); setError(''); };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [deptData, stuResp] = await Promise.all([api.getDepartments(), api.getStudents(200, 0)]);
        setDepartments(deptData);
        const students = stuResp.results || (Array.isArray(stuResp) ? stuResp : []);
        setStudents(students);
      } catch (e) {
        const msg = e.message || 'Failed to load';
        setError(msg); showSnackbar(msg, { type: 'error' });
      }
      setLoading(false);
    };
    load();
  }, []);

  const addDept = async (e) => {
    e.preventDefault();
    if (!name || name.trim().length < 2) { const m = 'Department name must be at least 2 characters'; setError(m); showSnackbar(m, { type: 'error' }); return; }
    if (!code || code.trim().length < 1) { const m = 'Department code is required'; setError(m); showSnackbar(m, { type: 'error' }); return; }
    if (!editingDept && departments.some(d => d.code && d.code.toLowerCase() === code.trim().toLowerCase())) { const m = 'Department code must be unique'; setError(m); showSnackbar(m, { type: 'error' }); return; }
    if (!editingDept && departments.some(d => d.name && d.name.toLowerCase() === name.trim().toLowerCase())) { const m = 'Department name already exists'; setError(m); showSnackbar(m, { type: 'error' }); return; }
    try {
      if (editingDept) {
        const updated = await api.updateDepartment(editingDept.id, { name, code });
        setDepartments(departments.map(d => d.id === editingDept.id ? updated : d));
        showSnackbar('Department updated', { type: 'success' }); resetForm();
      } else {
        const newDept = await api.createDepartment({ name, code });
        setDepartments([...departments, newDept]);
        showSnackbar('Department created', { type: 'success' }); resetForm();
      }
    } catch (e) { const msg = e.message || 'Add failed'; setError(msg); showSnackbar(msg, { type: 'error' }); }
  };

  const handleEdit = (dept) => { setEditingDept(dept); setName(dept.name || ''); setCode(dept.code || ''); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleDelete = (dept) => {
    openConfirm(
      'Delete Department',
      `Are you sure you want to delete department "${dept.name}"? This action cannot be undone.`,
      async () => {
        closeConfirm();
        try {
          await api.deleteDepartment(dept.id);
          setDepartments(departments.filter(d => d.id !== dept.id));
          showSnackbar('Department deleted', { type: 'success' });
        } catch (e) { showSnackbar(e.message || 'Delete failed', { type: 'error' }); }
      }
    );
  };

  const getStudentCount = (deptId) => students.filter(s => String(s.department) === String(deptId)).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --bg:#F5F6FA; --white:#FFFFFF; --border:#E2E5EC; --border-focus:#1A56DB;
          --text-primary:#111827; --text-secondary:#6B7280; --text-label:#374151;
          --accent:#1A56DB; --accent-hover:#1646C0;
          --error-bg:#FEF2F2; --error-border:#FECACA; --error-text:#B91C1C;
        }
        html,body,#root{font-family:'Inter',sans-serif;}
        .pg{min-height:100vh;background:var(--bg);padding:32px 28px;font-family:'Inter',sans-serif;}
        .pg-header{margin-bottom:28px;}
        .pg-header h1{font-size:22px;font-weight:600;color:var(--text-primary);letter-spacing:-0.02em;margin-bottom:4px;}
        .pg-header p{font-size:14px;color:var(--text-secondary);}
        .summary{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px;}
        .chip{display:flex;align-items:center;gap:8px;background:var(--white);border:1px solid var(--border);border-radius:8px;padding:10px 16px;font-size:13.5px;color:var(--text-secondary);box-shadow:0 1px 2px rgba(0,0,0,0.04);}
        .chip strong{color:var(--text-primary);font-weight:600;}
        .chip-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
        .card{background:var(--white);border:1px solid var(--border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.05);margin-bottom:24px;overflow:hidden;}
        .card-header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--border);}
        .card-header h2{font-size:15px;font-weight:600;color:var(--text-primary);}
        .card-body{padding:20px;}
        .err-box{display:flex;align-items:flex-start;gap:9px;background:var(--error-bg);border:1px solid var(--error-border);border-radius:8px;padding:11px 14px;font-size:13.5px;color:var(--error-text);line-height:1.45;margin-bottom:18px;}
        .err-box svg{flex-shrink:0;margin-top:1px;}
        .form-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        @media(max-width:560px){.form-grid-2{grid-template-columns:1fr;}}
        .f-field{display:flex;flex-direction:column;gap:6px;}
        .f-label{font-size:13px;font-weight:500;color:var(--text-label);}
        .f-req{color:var(--error-text);margin-left:2px;}
        .f-input{width:100%;background:var(--white);border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-size:14px;color:var(--text-primary);font-family:'Inter',sans-serif;outline:none;transition:border-color .15s,box-shadow .15s;}
        .f-input::placeholder{color:#9CA3AF;}
        .f-input:focus{border-color:var(--border-focus);box-shadow:0 0 0 3px rgba(26,86,219,0.1);}
        .f-input:disabled{background:#F9FAFB;opacity:.6;cursor:not-allowed;}
        .form-actions{display:flex;gap:10px;margin-top:20px;}
        .btn-primary{background:var(--accent);color:#fff;border:none;border-radius:8px;padding:10px 16px;font-size:14px;font-weight:500;font-family:'Inter',sans-serif;cursor:pointer;transition:background .15s;}
        .btn-primary:hover:not(:disabled){background:var(--accent-hover);}
        .btn-primary:disabled{opacity:.55;cursor:not-allowed;}
        .btn-secondary{background:transparent;color:var(--text-label);border:1px solid var(--border);border-radius:8px;padding:10px 14px;font-size:14px;font-weight:500;font-family:'Inter',sans-serif;cursor:pointer;transition:background .15s;}
        .btn-secondary:hover{background:#F9FAFB;}
        .btn-ghost{padding:5px 10px;background:transparent;color:var(--text-secondary);border:1px solid var(--border);border-radius:6px;font-family:'Inter',sans-serif;font-size:12.5px;font-weight:500;cursor:pointer;transition:background .12s,color .12s;}
        .btn-ghost:hover{background:#F3F4F6;color:var(--text-primary);}
        .btn-danger{padding:5px 10px;background:transparent;color:#DC2626;border:1px solid #FECACA;border-radius:6px;font-family:'Inter',sans-serif;font-size:12.5px;font-weight:500;cursor:pointer;transition:background .12s;}
        .btn-danger:hover{background:var(--error-bg);}
        .sec-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
        .sec-title{font-size:15px;font-weight:600;color:var(--text-primary);}
        .ct-chip{font-size:12px;color:var(--text-secondary);background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:2px 10px;font-weight:500;}
        .tbl-wrap{background:var(--white);border:1px solid var(--border);border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);}
        table{width:100%;border-collapse:collapse;font-size:14px;}
        thead tr{background:#F9FAFB;}
        thead th{padding:10px 16px;text-align:left;font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-secondary);border-bottom:1px solid var(--border);}
        tbody tr{border-bottom:1px solid var(--border);transition:background .12s;}
        tbody tr:last-child{border-bottom:none;}
        tbody tr:hover{background:#F9FAFB;}
        tbody td{padding:12px 16px;color:var(--text-primary);vertical-align:middle;}
        .td-name{font-weight:500;}
        .td-mono{font-size:13px;color:var(--text-secondary);font-family:'SF Mono','Fira Code',monospace;}
        .td-ct{font-size:13.5px;color:var(--text-secondary);}
        .td-actions{display:flex;gap:6px;align-items:center;}
        .empty-state{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:56px 24px;text-align:center;}
        .empty-icon{width:44px;height:44px;background:var(--bg);border:1px solid var(--border);border-radius:10px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:var(--text-secondary);}
        .empty-title{font-size:14px;font-weight:500;color:var(--text-primary);margin-bottom:4px;}
        .empty-sub{font-size:13px;color:var(--text-secondary);}
        .skeleton{background:linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;border-radius:4px;height:13px;}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .sk-row td{padding:13px 16px;}
      `}</style>

      <div className="pg">
        <div className="pg-header">
          <h1>Departments</h1>
          <p>Manage academic departments and track student distribution.</p>
        </div>

        {!loading && departments.length > 0 && (
          <div className="summary">
            <div className="chip"><div className="chip-dot" style={{ background: '#1A56DB' }} /><span><strong>{departments.length}</strong> departments</span></div>
            <div className="chip"><div className="chip-dot" style={{ background: '#059669' }} /><span><strong>{students.length}</strong> students total</span></div>
          </div>
        )}

        {user?.role === 'ADMIN' && (
          <div className="card">
            <div className="card-header"><h2>{editingDept ? 'Edit Department' : 'Add Department'}</h2></div>
            <div className="card-body">
              {error && (
                <div className="err-box" role="alert">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={addDept}>
                <div className="form-grid-2">
                  <div className="f-field">
                    <label className="f-label">Department Name <span className="f-req">*</span></label>
                    <input className="f-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Computer Science" disabled={loading} />
                  </div>
                  <div className="f-field">
                    <label className="f-label">Department Code <span className="f-req">*</span></label>
                    <input className="f-input" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. CS, EC, ME" disabled={loading} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? (editingDept ? 'Updating…' : 'Adding…') : (editingDept ? 'Update Department' : 'Add Department')}
                  </button>
                  {editingDept && <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>}
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="card">
            <div className="card-body">
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Code</th><th>Students</th></tr></thead>
                  <tbody>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <tr className="sk-row" key={i}>
                        {[160, 60, 40].map((w, j) => <td key={j}><div className="skeleton" style={{ width: w }} /></td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : departments.length > 0 ? (
          <>
            <div className="sec-header">
              <span className="sec-title">All Departments</span>
              <span className="ct-chip">{departments.length} total</span>
            </div>
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Department Name</th>
                    <th>Code</th>
                    <th>Students</th>
                    {user?.role === 'ADMIN' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {departments.map(d => (
                    <tr key={d.id}>
                      <td className="td-name">{d.name}</td>
                      <td className="td-mono">{d.code}</td>
                      <td className="td-ct">{getStudentCount(d.id)}</td>
                      {user?.role === 'ADMIN' && (
                        <td><div className="td-actions">
                          <button className="btn-ghost" onClick={() => handleEdit(d)}>Edit</button>
                          <button className="btn-danger" onClick={() => handleDelete(d)}>Delete</button>
                        </div></td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" /><path d="M2 22h20" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" />
              </svg>
            </div>
            <div className="empty-title">No departments yet</div>
            <div className="empty-sub">Add your first department using the form above.</div>
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

export default Departments;