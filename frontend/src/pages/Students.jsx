import React, { useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
import { useUI } from '../context/UIContext';
import { AuthContext } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

function Students() {
  const [students, setStudents] = useState([]);
  const { user } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [department, setDepartment] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showSnackbar } = useUI();
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });
  const openConfirm = (title, message, onConfirm) => setConfirmState({ open: true, title, message, onConfirm });
  const closeConfirm = () => setConfirmState({ open: false, title: '', message: '', onConfirm: null });
  const [expandedDept, setExpandedDept] = useState({});

  const toggleDept = (id) => setExpandedDept(prev => ({ ...prev, [id]: !prev[id] }));

  const resetForm = () => { setEditingStudent(null); setName(''); setRoll(''); setDepartment(''); setSubjects([]); setError(''); };

  const getFilteredSubjects = () => !department ? subjectOptions : subjectOptions.filter(s => String(s.department) === String(department));

  const deptLabel = (id) => { const d = departments.find(x => String(x.id) === String(id)); return d ? d.name : ''; };
  const subjectLabels = (ids) => (ids || []).map(id => { const s = subjectOptions.find(x => String(x.id) === String(id)); return s ? s.name : ''; }).filter(Boolean).join(', ');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [stuResp, deptData, subResp] = await Promise.all([
          api.getStudents(100, 0),  // Load first 100
          api.getDepartments(),
          api.getSubjects(null, 100, 0)  // Load first 100
        ]);
        // Handle paginated response format
        const stuData = stuResp.results || stuResp || [];
        const subData = subResp.results || subResp || [];
        setStudents(stuData);
        setDepartments(deptData);
        setSubjectOptions(subData);
      } catch (e) {
        const msg = e.message || 'Load failed';
        setError(msg);
        showSnackbar(msg, { type: 'error' });
      }
      setLoading(false);
    };
    load();
  }, []);

  const addStudent = async (e) => {
    e.preventDefault();
    if (!name || name.trim().length < 2) { const m = 'Name must be at least 2 characters'; setError(m); showSnackbar(m, { type: 'error' }); return; }
    if (!roll || !/^[0-9A-Za-z-]+$/.test(roll)) { const m = 'Roll number must be alphanumeric'; setError(m); showSnackbar(m, { type: 'error' }); return; }
    if (students.some(s => s.roll_number && s.roll_number.toLowerCase() === roll.trim().toLowerCase() && (!editingStudent || s.id !== editingStudent.id))) {
      const m = 'Roll number must be unique'; setError(m); showSnackbar(m, { type: 'error' }); return;
    }
    try {
      if (editingStudent) {
        const updated = await api.updateStudent(editingStudent.id, { name, roll_number: roll, department: department || null, subjects });
        setStudents(students.map(s => s.id === editingStudent.id ? updated : s));
        showSnackbar('Student updated', { type: 'success' }); resetForm();
      } else {
        const newStu = await api.createStudent({ name, roll_number: roll, department, subjects });
        setStudents([...students, newStu]);
        showSnackbar('Student added', { type: 'success' }); resetForm();
      }
    } catch (e) { const msg = e.message || 'Add failed'; setError(msg); showSnackbar(msg, { type: 'error' }); }
  };

  const deleteStudent = (stu) => {
    openConfirm(
      'Delete Student',
      `Are you sure you want to delete student "${stu.name}"? This action cannot be undone.`,
      async () => {
        closeConfirm();
        try { await api.deleteStudent(stu.id); setStudents(students.filter(x => x.id !== stu.id)); showSnackbar('Deleted', { type: 'success' }); }
        catch (err) { showSnackbar(err?.message || 'Delete failed', { type: 'error' }); }
      }
    );
  };

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{--bg:#F5F6FA;--white:#FFFFFF;--border:#E2E5EC;--border-focus:#1A56DB;--text-primary:#111827;--text-secondary:#6B7280;--text-label:#374151;--accent:#1A56DB;--accent-hover:#1646C0;--error-bg:#FEF2F2;--error-border:#FECACA;--error-text:#B91C1C;}
    html,body,#root{font-family:'Inter',sans-serif;}
    .pg{min-height:100vh;background:var(--bg);padding:32px 28px;font-family:'Inter',sans-serif;}
    .pg-header{margin-bottom:28px;} .pg-header h1{font-size:22px;font-weight:600;color:var(--text-primary);letter-spacing:-0.02em;margin-bottom:4px;} .pg-header p{font-size:14px;color:var(--text-secondary);}
    .summary{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px;}
    .chip{display:flex;align-items:center;gap:8px;background:var(--white);border:1px solid var(--border);border-radius:8px;padding:10px 16px;font-size:13.5px;color:var(--text-secondary);box-shadow:0 1px 2px rgba(0,0,0,0.04);}
    .chip strong{color:var(--text-primary);font-weight:600;} .chip-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
    .card{background:var(--white);border:1px solid var(--border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.05);margin-bottom:24px;overflow:hidden;}
    .card-header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--border);}
    .card-header h2{font-size:15px;font-weight:600;color:var(--text-primary);}
    .card-body{padding:20px;}
    .err-box{display:flex;align-items:flex-start;gap:9px;background:var(--error-bg);border:1px solid var(--error-border);border-radius:8px;padding:11px 14px;font-size:13.5px;color:var(--error-text);line-height:1.45;margin-bottom:18px;}
    .err-box svg{flex-shrink:0;margin-top:1px;}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
    @media(max-width:560px){.form-grid{grid-template-columns:1fr;}}
    .f-field{display:flex;flex-direction:column;gap:6px;}
    .f-label{font-size:13px;font-weight:500;color:var(--text-label);}
    .f-req{color:var(--error-text);margin-left:2px;}
    .f-input,.f-select{width:100%;background:var(--white);border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-size:14px;color:var(--text-primary);font-family:'Inter',sans-serif;outline:none;transition:border-color .15s,box-shadow .15s;-webkit-appearance:none;}
    .f-input::placeholder{color:#9CA3AF;}
    .f-input:focus,.f-select:focus{border-color:var(--border-focus);box-shadow:0 0 0 3px rgba(26,86,219,0.1);}
    .f-input:disabled,.f-select:disabled{background:#F9FAFB;opacity:.6;cursor:not-allowed;}
    .f-select[multiple]{min-height:110px;-webkit-appearance:auto;}
    .form-actions{display:flex;gap:10px;margin-top:20px;}
    .btn-primary{background:var(--accent);color:#fff;border:none;border-radius:8px;padding:10px 16px;font-size:14px;font-weight:500;font-family:'Inter',sans-serif;cursor:pointer;transition:background .15s;}
    .btn-primary:hover:not(:disabled){background:var(--accent-hover);} .btn-primary:disabled{opacity:.55;cursor:not-allowed;}
    .btn-secondary{background:transparent;color:var(--text-label);border:1px solid var(--border);border-radius:8px;padding:10px 14px;font-size:14px;font-weight:500;font-family:'Inter',sans-serif;cursor:pointer;transition:background .15s;}
    .btn-secondary:hover{background:#F9FAFB;}
    .btn-ghost{padding:5px 10px;background:transparent;color:var(--text-secondary);border:1px solid var(--border);border-radius:6px;font-family:'Inter',sans-serif;font-size:12.5px;font-weight:500;cursor:pointer;transition:background .12s,color .12s;}
    .btn-ghost:hover{background:#F3F4F6;color:var(--text-primary);}
    .btn-danger{padding:5px 10px;background:transparent;color:#DC2626;border:1px solid #FECACA;border-radius:6px;font-family:'Inter',sans-serif;font-size:12.5px;font-weight:500;cursor:pointer;transition:background .12s;}
    .btn-danger:hover{background:var(--error-bg);}
    .dept-block{margin-bottom:28px;}
    .dept-hd{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
    .dept-name{font-size:14px;font-weight:600;color:var(--text-primary);}
    .dept-ct{font-size:12px;color:var(--text-secondary);background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:2px 9px;font-weight:500;}
    .sec-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
    .sec-header h2{font-size:15px;font-weight:600;color:var(--text-primary);}
    .ct-chip{font-size:12px;color:var(--text-secondary);background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:2px 10px;font-weight:500;}
    .tbl-wrap{background:var(--white);border:1px solid var(--border);border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);}
    table{width:100%;border-collapse:collapse;font-size:14px;}
    thead tr{background:#F9FAFB;}
    thead th{padding:10px 16px;text-align:left;font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-secondary);border-bottom:1px solid var(--border);}
    tbody tr{border-bottom:1px solid var(--border);transition:background .12s;}
    tbody tr:last-child{border-bottom:none;}
    tbody tr:hover{background:#F9FAFB;}
    tbody td{padding:12px 16px;color:var(--text-primary);vertical-align:middle;}
    .td-name{font-weight:500;} .td-mono{font-size:13px;color:var(--text-secondary);font-family:'SF Mono','Fira Code',monospace;} .td-muted{font-size:13px;color:var(--text-secondary);}
    .td-actions{display:flex;gap:6px;align-items:center;}
    .show-more{margin-top:10px;background:none;border:none;font-family:'Inter',sans-serif;font-size:13px;font-weight:500;color:var(--accent);cursor:pointer;padding:4px 0;transition:opacity .15s;}
    .show-more:hover{opacity:.7;text-decoration:underline;}
    .empty-state{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:56px 24px;text-align:center;}
    .empty-icon{width:44px;height:44px;background:var(--bg);border:1px solid var(--border);border-radius:10px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:var(--text-secondary);}
    .empty-title{font-size:14px;font-weight:500;color:var(--text-primary);margin-bottom:4px;} .empty-sub{font-size:13px;color:var(--text-secondary);}
    .skeleton{background:linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;border-radius:4px;height:13px;}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    .sk-row td{padding:13px 16px;}
    .hint{font-size:12px;color:var(--text-secondary);margin-top:4px;}
  `;

  return (
    <>
      <style>{CSS}</style>
      <div className="pg">
        <div className="pg-header">
          <h1>Students</h1>
          <p>Manage student records and subject enrollments.</p>
        </div>

        {!loading && students.length > 0 && (
          <div className="summary">
            <div className="chip"><div className="chip-dot" style={{ background: '#1A56DB' }} /><span><strong>{students.length}</strong> students</span></div>
            <div className="chip"><div className="chip-dot" style={{ background: '#7C3AED' }} /><span><strong>{departments.length}</strong> departments</span></div>
          </div>
        )}

        {user?.role === 'ADMIN' && (
          <div className="card">
            <div className="card-header"><h2>{editingStudent ? 'Edit Student' : 'Add Student'}</h2></div>
            <div className="card-body">
              {error && (
                <div className="err-box" role="alert">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={addStudent}>
                <div className="form-grid">
                  <div className="f-field">
                    <label className="f-label">Full Name <span className="f-req">*</span></label>
                    <input className="f-input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter student name" disabled={loading} />
                  </div>
                  <div className="f-field">
                    <label className="f-label">Roll Number <span className="f-req">*</span></label>
                    <input className="f-input" value={roll} onChange={e => setRoll(e.target.value)} placeholder="e.g. 001, CS-101" disabled={loading} />
                  </div>
                  <div className="f-field">
                    <label className="f-label">Department <span className="f-req">*</span></label>
                    <select className="f-select" value={department || ''} onChange={e => setDepartment(e.target.value)} disabled={loading}>
                      <option value="">Select department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="f-field">
                    <label className="f-label">Subjects</label>
                    <select className="f-select" multiple value={subjects} onChange={e => setSubjects(Array.from(e.target.selectedOptions).map(o => o.value))} disabled={loading}>
                      {getFilteredSubjects().map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <span className="hint">Hold Ctrl / Cmd to select multiple</span>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? (editingStudent ? 'Updating…' : 'Adding…') : (editingStudent ? 'Update Student' : 'Add Student')}
                  </button>
                  {editingStudent && <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>}
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="card"><div className="card-body"><div className="tbl-wrap">
            <table>
              <thead><tr><th>Name</th><th>Roll No.</th><th>Subjects</th></tr></thead>
              <tbody>{Array.from({ length: 5 }).map((_, i) => (
                <tr className="sk-row" key={i}>{[160, 80, 200].map((w, j) => <td key={j}><div className="skeleton" style={{ width: w }} /></td>)}</tr>
              ))}</tbody>
            </table>
          </div></div></div>
        ) : students.length > 0 ? (
          <>
            <div className="sec-header">
              <h2>All Students</h2>
              <span className="ct-chip">{students.length} total</span>
            </div>
            {departments.map(dept => {
              const deptStudents = students.filter(s => String(s.department) === String(dept.id));
              if (deptStudents.length === 0) return null;
              const expanded = !!expandedDept[dept.id];
              const showList = expanded ? deptStudents : deptStudents.slice(0, 10);
              return (
                <div className="dept-block" key={dept.id}>
                  <div className="dept-hd">
                    <span className="dept-name">{dept.name}</span>
                    <span className="dept-ct">{deptStudents.length} students</span>
                  </div>
                  <div className="tbl-wrap">
                    <table>
                      <thead><tr><th>Name</th><th>Roll No.</th><th>Subjects</th>{user?.role === 'ADMIN' && <th>Actions</th>}</tr></thead>
                      <tbody>
                        {showList.map(stu => (
                          <tr key={stu.id}>
                            <td className="td-name">{stu.name}</td>
                            <td className="td-mono">{stu.roll_number}</td>
                            <td className="td-muted">{subjectLabels(stu.subjects) || '—'}</td>
                            {user?.role === 'ADMIN' && (
                              <td><div className="td-actions">
                                <button className="btn-ghost" onClick={() => { setEditingStudent(stu); setName(stu.name); setRoll(stu.roll_number); setDepartment(stu.department || ''); setSubjects(stu.subjects || []); document.querySelector('.page-content')?.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>
                                <button className="btn-danger" onClick={() => deleteStudent(stu)}>Delete</button>
                              </div></td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {deptStudents.length > 10 && <button className="show-more" onClick={() => toggleDept(dept.id)}>{expanded ? 'Show less' : `Show ${deptStudents.length - 10} more`}</button>}
                </div>
              );
            })}
            {students.filter(s => !s.department).length > 0 && (
              <div className="dept-block">
                <div className="dept-hd"><span className="dept-name">Unassigned</span><span className="dept-ct">{students.filter(s => !s.department).length}</span></div>
                <div className="tbl-wrap"><table>
                  <thead><tr><th>Name</th><th>Roll No.</th><th>Subjects</th>{user?.role === 'ADMIN' && <th>Actions</th>}</tr></thead>
                  <tbody>{students.filter(s => !s.department).map(stu => (
                    <tr key={stu.id}>
                      <td className="td-name">{stu.name}</td><td className="td-mono">{stu.roll_number}</td><td className="td-muted">{subjectLabels(stu.subjects) || '—'}</td>
                      {user?.role === 'ADMIN' && <td><div className="td-actions"><button className="btn-ghost" onClick={() => { setEditingStudent(stu); setName(stu.name); setRoll(stu.roll_number); setDepartment(''); setSubjects(stu.subjects || []); document.querySelector('.page-content')?.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button><button className="btn-danger" onClick={() => deleteStudent(stu)}>Delete</button></div></td>}
                    </tr>
                  ))}</tbody>
                </table></div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div>
            <div className="empty-title">No students yet</div>
            <div className="empty-sub">Add your first student using the form above.</div>
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

export default Students;