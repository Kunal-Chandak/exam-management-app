import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Snackbar from '../components/Snackbar';

function ViewSeating() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => setSnackbar({ open: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const loadMeta = async () => {
      try { const depts = await api.getDepartments(); setDepartments(depts); }
      catch(e) { console.error('failed to load departments', e); }
    };
    loadMeta();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const response = selectedDept ? await api.getSubjects(selectedDept, 100, 0) : await api.getSubjects(null, 100, 0);
        const subs = response.results || (Array.isArray(response) ? response : []);
        setSubjects(subs); setSelectedSubject('');
      } catch(e) { console.error('failed to load subjects', e); }
    };
    load();
  }, [selectedDept]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSubject) { setAssignments([]); setLoading(false); return; }
      setLoading(true);
      try {
        const data = await api.getSeating(selectedSubject);
        if (!data || !Array.isArray(data) || data.length === 0) {
          showSnackbar('No seating assignments found for this subject', 'warning');
          setAssignments([]);
        } else { setAssignments(data); }
      } catch(e) {
        setAssignments([]);
        showSnackbar('Failed to load seating data: ' + (e.detail || e.error || e.message || 'Unknown error'), 'error');
      }
      setLoading(false);
    };
    fetchData();
  }, [selectedSubject]);

  const downloadPdf = async () => {
    if (!selectedSubject) return;
    try {
      const res = await api.downloadSubjectSeating(selectedSubject);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `seating_subject_${selectedSubject}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      showSnackbar('PDF downloaded successfully', 'success');
    } catch(e) { showSnackbar('Failed to download PDF', 'error'); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg:#F5F6FA;--white:#FFFFFF;--border:#E2E5EC;--border-focus:#1A56DB;
          --text-primary:#111827;--text-secondary:#6B7280;--text-label:#374151;
          --accent:#1A56DB;--accent-hover:#1646C0;--accent-subtle:#EFF6FF;
          --success-bg:#ECFDF5;--success-border:#A7F3D0;--success-text:#065F46;
          --warning-bg:#FFFBEB;--warning-border:#FDE68A;--warning-text:#92400E;
        }
        html,body,#root{font-family:'Inter',sans-serif;}
        .pg{min-height:100vh;background:var(--bg);padding:32px 28px;font-family:'Inter',sans-serif;}
        .pg-header{margin-bottom:28px;}
        .pg-header h1{font-size:22px;font-weight:600;color:var(--text-primary);letter-spacing:-0.02em;margin-bottom:4px;}
        .pg-header p{font-size:14px;color:var(--text-secondary);}
        .filter-card{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:24px;display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap;}
        .f-field{display:flex;flex-direction:column;gap:6px;min-width:200px;flex:1;}
        .f-label{font-size:13px;font-weight:500;color:var(--text-label);}
        .f-select{width:100%;background:var(--white);border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-size:14px;color:var(--text-primary);font-family:'Inter',sans-serif;outline:none;transition:border-color .15s,box-shadow .15s;-webkit-appearance:none;}
        .f-select:focus{border-color:var(--border-focus);box-shadow:0 0 0 3px rgba(26,86,219,0.1);}
        .f-select:disabled{background:#F9FAFB;color:#9CA3AF;cursor:not-allowed;}
        .btn-download{display:inline-flex;align-items:center;gap:7px;padding:10px 16px;background:var(--white);border:1px solid var(--border);border-radius:8px;font-size:14px;font-weight:500;color:var(--text-label);cursor:pointer;transition:all .15s;font-family:'Inter',sans-serif;white-space:nowrap;}
        .btn-download:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-subtle);}
        .empty-card{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:56px 24px;text-align:center;}
        .empty-icon{width:44px;height:44px;background:var(--bg);border:1px solid var(--border);border-radius:10px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:var(--text-secondary);}
        .empty-title{font-size:14px;font-weight:500;color:var(--text-primary);margin-bottom:4px;}
        .empty-sub{font-size:13px;color:var(--text-secondary);}
        .result-list{display:flex;flex-direction:column;gap:20px;}
        .result-card{background:var(--white);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);}
        .result-card-header{padding:18px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
        .result-card-header h3{font-size:15px;font-weight:600;color:var(--text-primary);}
        .result-card-body{padding:20px;}
        .info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:20px;}
        .info-item{display:flex;flex-direction:column;gap:3px;}
        .info-label{font-size:11.5px;color:var(--text-secondary);font-weight:600;text-transform:uppercase;letter-spacing:.04em;}
        .info-value{font-size:14px;color:var(--text-primary);font-weight:600;}
        .status-badge{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:500;padding:3px 9px;border-radius:20px;}
        .status-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
        .status-finalized{background:var(--success-bg);color:var(--success-text);border:1px solid var(--success-border);}
        .status-finalized .status-dot{background:#10B981;}
        .status-draft{background:var(--warning-bg);color:var(--warning-text);border:1px solid var(--warning-border);}
        .status-draft .status-dot{background:#F59E0B;}
        .supervisors-section{margin-bottom:20px;}
        .supervisors-section h4{font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:10px;text-transform:uppercase;letter-spacing:.04em;}
        .sup-list{display:flex;gap:8px;flex-wrap:wrap;}
        .sup-chip{background:var(--accent-subtle);border:1px solid #BFDBFE;color:var(--accent);padding:5px 12px;border-radius:6px;font-size:13px;font-weight:500;}
        .seat-section h4{font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:10px;text-transform:uppercase;letter-spacing:.04em;}
        .tbl-wrap{border:1px solid var(--border);border-radius:8px;overflow:hidden;}
        table{width:100%;border-collapse:collapse;font-size:14px;}
        thead tr{background:#F9FAFB;}
        thead th{padding:10px 16px;text-align:left;font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-secondary);border-bottom:1px solid var(--border);}
        tbody tr{border-bottom:1px solid var(--border);transition:background .12s;}
        tbody tr:last-child{border-bottom:none;} tbody tr:hover{background:#F9FAFB;}
        tbody td{padding:11px 16px;color:var(--text-primary);vertical-align:middle;}
        .td-seat{font-weight:600;color:var(--accent);}
        .td-roll{font-size:13px;color:var(--text-secondary);font-family:'SF Mono','Fira Code',monospace;}
        .no-seats{padding:20px;text-align:center;color:var(--text-secondary);background:#F9FAFB;border-radius:8px;font-size:13.5px;}
        .skeleton{background:linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;border-radius:4px;}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .sk-card{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:20px;}
        .sk-title{height:20px;width:40%;margin-bottom:16px;}
        .sk-row{height:14px;width:100%;margin-bottom:10px;}
        .sk-row.w80{width:80%;} .sk-row.w60{width:60%;}
        @media(max-width:768px){.pg{padding:20px 16px;}.filter-card{flex-direction:column;}.f-field{min-width:auto;width:100%;}}
      `}</style>

      <div className="pg">
        <div className="pg-header">
          <h1>View Seating Assignments</h1>
          <p>View and download exam seating arrangements by subject.</p>
        </div>

        <div className="filter-card">
          <div className="f-field">
            <label className="f-label">Department</label>
            <select className="f-select" value={selectedDept} onChange={e=>setSelectedDept(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="f-field">
            <label className="f-label">Subject</label>
            <select className="f-select" value={selectedSubject} onChange={e=>setSelectedSubject(e.target.value)} disabled={!subjects.length}>
              <option value="">Select subject</option>
              {subjects.map(s=><option key={s.id} value={s.id}>{s.subject_name||s.name}</option>)}
            </select>
          </div>
          {selectedSubject && (
            <button className="btn-download" onClick={downloadPdf}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download PDF
            </button>
          )}
        </div>

        {loading ? (
          <>
            {[1,2].map(i=>(
              <div className="sk-card" key={i}>
                <div className="skeleton sk-title"/>
                <div className="skeleton sk-row"/>
                <div className="skeleton sk-row w80"/>
                <div className="skeleton sk-row w60"/>
              </div>
            ))}
          </>
        ) : !selectedSubject ? (
          <div className="empty-card">
            <div className="empty-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></div>
            <div className="empty-title">No subject selected</div>
            <div className="empty-sub">Select a department and subject above to view seating arrangements.</div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg></div>
            <div className="empty-title">No assignments found</div>
            <div className="empty-sub">No seating assignments available for the selected subject.</div>
          </div>
        ) : (
          <div className="result-list">
            {assignments.map((a,idx)=>(
              <div className="result-card" key={a.id||idx}>
                <div className="result-card-header">
                  <h3>Room {a.classroom_number}</h3>
                  <span className={`status-badge ${a.status==='finalized'?'status-finalized':'status-draft'}`}>
                    <span className="status-dot"/>
                    {a.status==='finalized'?'Finalized':'Draft'}
                  </span>
                </div>
                <div className="result-card-body">
                  <div className="info-grid">
                    <div className="info-item"><span className="info-label">Department</span><div className="info-value">{a.classroom_dept_name||'N/A'}</div></div>
                    <div className="info-item"><span className="info-label">Capacity</span><div className="info-value">{a.classroom_capacity}</div></div>
                    <div className="info-item"><span className="info-label">Assigned</span><div className="info-value">{a.students_count}</div></div>
                  </div>

                  {a.supervisors_detail?.length>0&&(
                    <div className="supervisors-section">
                      <h4>Supervisors</h4>
                      <div className="sup-list">{a.supervisors_detail.map((sup,i)=><span key={i} className="sup-chip">{sup.name}</span>)}</div>
                    </div>
                  )}

                  {a.seat_grid?.length>0 ? (
                    <div className="seat-section">
                      <h4>Seat Arrangement</h4>
                      <div className="tbl-wrap">
                        <table>
                          <thead><tr><th>Bench #</th><th>Student Name</th><th>Roll Number</th></tr></thead>
                          <tbody>
                            {[...a.seat_grid].sort((x,y)=>(x.seat_number||0)-(y.seat_number||0)).map((seat,si)=>(
                              <tr key={si}>
                                <td className="td-seat">{seat.seat_number||'—'}</td>
                                <td>{seat.student_name||'—'}</td>
                                <td className="td-roll">{seat.student_roll||'—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="no-seats">No seat assignments recorded for this classroom.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Snackbar open={snackbar.open} message={snackbar.message} type={snackbar.type} onClose={()=>setSnackbar({open:false,message:'',type:'success'})}/>
    </>
  );
}

export default ViewSeating;