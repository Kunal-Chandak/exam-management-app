import React, { useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
import { useUI } from '../context/UIContext';
import { AuthContext } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

function Classrooms() {
  const [rooms, setRooms] = useState([]);
  const [occupancy, setOccupancy] = useState({});
  const { user } = useContext(AuthContext);
  const [roomNumber, setRoomNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [capacity, setCapacity] = useState('');
  const [editingRoom, setEditingRoom] = useState(null);
  const [expandedDept, setExpandedDept] = useState({});
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showSnackbar } = useUI();
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });
  const openConfirm = (title, message, onConfirm) => setConfirmState({ open: true, title, message, onConfirm });
  const closeConfirm = () => setConfirmState({ open: false, title: '', message: '', onConfirm: null });

  const toggleDept = (id) => setExpandedDept(prev => ({ ...prev, [id]: !prev[id] }));

  const refreshOccupancy = async () => {
    try {
      const seatingData = await api.getSeating();
      const occ = {};
      seatingData.forEach(s => { occ[s.classroom] = s.students_count || 0; });
      setOccupancy(occ);
    } catch (e) { console.warn('Could not refresh occupancy', e); }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [roomResp, deptData] = await Promise.all([
          api.getClassrooms(100, 0),  // Load first 100
          api.getDepartments()
        ]);
        // Handle paginated response format
        const roomData = roomResp.results || roomResp || [];
        setRooms(roomData);
        setDepartments(deptData);
        // Don't call refreshOccupancy here - load it lazily or on demand only
      } catch (e) {
        const msg = e.message || 'Failed to load';
        setError(msg);
        showSnackbar(msg, { type: 'error' });
      }
      setLoading(false);
    };
    load();
  }, []);

  const resetForm = () => { setEditingRoom(null); setRoomNumber(''); setDepartment(''); setCapacity(''); setError(''); };

  const addRoom = async (e) => {
    e.preventDefault();
    if (!roomNumber || roomNumber.trim().length === 0) { const m = 'Room number is required'; setError(m); showSnackbar(m, { type: 'error' }); return; }
    if (!department) { const m = 'Please select a department'; setError(m); showSnackbar(m, { type: 'error' }); return; }
    if (!capacity || Number(capacity) <= 0) { const m = 'Capacity must be greater than 0'; setError(m); showSnackbar(m, { type: 'error' }); return; }
    if (!editingRoom && rooms.some(r => r.room_number && r.room_number.toLowerCase() === roomNumber.trim().toLowerCase())) {
      const m = 'Room number must be unique'; setError(m); showSnackbar(m, { type: 'error' }); return;
    }
    try {
      if (editingRoom) {
        const updated = await api.updateClassroom(editingRoom.id, { room_number: roomNumber, department, capacity });
        setRooms(rooms.map(r => r.id === editingRoom.id ? updated : r));
        showSnackbar('Classroom updated', { type: 'success' });
        resetForm();
      } else {
        const newRoom = await api.createClassroom({ room_number: roomNumber, department, capacity });
        setRooms([...rooms, newRoom]);
        showSnackbar('Classroom added', { type: 'success' });
        resetForm();
      }
      refreshOccupancy();
    } catch (e) {
      const msg = e.message || 'Operation failed'; setError(msg); showSnackbar(msg, { type: 'error' });
    }
  };

  const deleteRoom = (r) => {
    openConfirm(
      'Delete Classroom',
      `Are you sure you want to delete classroom "${r.room_number}"? This action cannot be undone.`,
      async () => {
        closeConfirm();
        try {
          await api.deleteClassroom(r.id);
          setRooms(rooms.filter(x => x.id !== r.id));
          showSnackbar('Classroom deleted', { type: 'success' });
          setOccupancy(prev => { const c = { ...prev }; delete c[r.id]; return c; });
        } catch (err) {
          showSnackbar(err?.message || 'Delete failed', { type: 'error' });
        }
      }
    );
  };

  const getStatus = (room) => {
    const assigned = occupancy[room.id] || 0;
    const avail = room.capacity - assigned;
    if (avail <= 0) return { label: 'Full', type: 'full' };
    if (avail < room.capacity * 0.2) return { label: `${avail} left`, type: 'low' };
    return { label: `${avail} available`, type: 'available' };
  };

  const totalCapacity = rooms.reduce((s, r) => s + Number(r.capacity || 0), 0);
  const totalAssigned = Object.values(occupancy).reduce((s, v) => s + v, 0);

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

        .cl-page {
          min-height: 100vh;
          background: var(--bg);
          padding: 32px 28px;
          font-family: 'Inter', sans-serif;
        }

        /* ── Page header ── */
        .cl-page-header {
          margin-bottom: 28px;
        }
        .cl-page-header h1 {
          font-size: 22px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }
        .cl-page-header p { font-size: 14px; color: var(--text-secondary); }

        /* ── Summary row ── */
        .cl-summary {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .cl-summary-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 13.5px;
          color: var(--text-secondary);
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .cl-summary-chip strong {
          color: var(--text-primary);
          font-weight: 600;
        }
        .cl-chip-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* ── Card ── */
        .cl-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          margin-bottom: 24px;
          overflow: hidden;
        }

        .cl-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid var(--border);
        }
        .cl-card-header h2 {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .cl-card-body { padding: 20px; }

        /* ── Error box ── */
        .cl-error {
          display: flex; align-items: flex-start; gap: 9px;
          background: var(--error-bg);
          border: 1px solid var(--error-border);
          border-radius: 8px;
          padding: 11px 14px;
          margin-bottom: 18px;
          font-size: 13.5px;
          color: var(--error-text);
          line-height: 1.45;
        }

        /* ── Form grid ── */
        .cl-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr auto;
          gap: 14px;
          align-items: end;
        }
        @media (max-width: 900px) { .cl-form-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 560px) { .cl-form-grid { grid-template-columns: 1fr; } }

        .cl-field { display: flex; flex-direction: column; gap: 6px; }
        .cl-label {
          font-size: 13px; font-weight: 500;
          color: var(--text-label);
        }
        .cl-req { color: var(--error-text); margin-left: 2px; }

        .cl-input, .cl-select {
          width: 100%;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
          -webkit-appearance: none;
        }
        .cl-input::placeholder { color: #9CA3AF; }
        .cl-input:focus, .cl-select:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(26,86,219,0.1);
        }
        .cl-input:disabled, .cl-select:disabled { background: #F9FAFB; opacity: .6; cursor: not-allowed; }

        /* ── Buttons ── */
        .cl-btn-row { display: flex; gap: 8px; align-items: center; }

        .cl-btn-primary {
          padding: 10px 16px;
          background: var(--accent);
          color: #fff; border: none; border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 500;
          cursor: pointer; white-space: nowrap;
          transition: background .15s;
        }
        .cl-btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
        .cl-btn-primary:disabled { opacity: .55; cursor: not-allowed; }

        .cl-btn-secondary {
          padding: 10px 14px;
          background: transparent; color: var(--text-label);
          border: 1px solid var(--border); border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 500;
          cursor: pointer; white-space: nowrap;
          transition: background .15s;
        }
        .cl-btn-secondary:hover { background: #F9FAFB; }

        .cl-btn-ghost {
          padding: 5px 10px;
          background: transparent; color: var(--text-secondary);
          border: 1px solid var(--border); border-radius: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 12.5px; font-weight: 500;
          cursor: pointer;
          transition: background .12s, color .12s;
        }
        .cl-btn-ghost:hover { background: #F3F4F6; color: var(--text-primary); }

        .cl-btn-danger {
          padding: 5px 10px;
          background: transparent; color: #DC2626;
          border: 1px solid #FECACA; border-radius: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 12.5px; font-weight: 500;
          cursor: pointer;
          transition: background .12s;
        }
        .cl-btn-danger:hover { background: var(--error-bg); }

        /* ── Dept section ── */
        .cl-dept-block { margin-bottom: 28px; }

        .cl-dept-header {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 12px;
        }
        .cl-dept-name {
          font-size: 14px; font-weight: 600;
          color: var(--text-primary);
        }
        .cl-dept-count {
          font-size: 12px; color: var(--text-secondary);
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 20px; padding: 2px 9px;
          font-weight: 500;
        }

        /* ── Table ── */
        .cl-table-wrap {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        table { width: 100%; border-collapse: collapse; font-size: 14px; }

        thead tr { background: #F9FAFB; }
        thead th {
          padding: 10px 16px; text-align: left;
          font-size: 11.5px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border);
        }

        tbody tr { border-bottom: 1px solid var(--border); transition: background .12s; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: #F9FAFB; }

        tbody td { padding: 12px 16px; color: var(--text-primary); vertical-align: middle; }

        .td-room { font-weight: 500; }
        .td-capacity { color: var(--text-secondary); font-size: 13.5px; }

        /* ── Status badge ── */
        .badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 500;
          padding: 3px 9px; border-radius: 20px;
          white-space: nowrap;
        }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .badge-available { background: var(--success-bg); color: var(--success-text); border: 1px solid var(--success-border); }
        .badge-available .badge-dot { background: #10B981; }
        .badge-low { background: var(--warning-bg); color: var(--warning-text); border: 1px solid var(--warning-border); }
        .badge-low .badge-dot { background: #F59E0B; }
        .badge-full { background: var(--error-bg); color: var(--error-text); border: 1px solid var(--error-border); }
        .badge-full .badge-dot { background: #EF4444; }

        .td-actions { display: flex; gap: 6px; align-items: center; }

        /* ── Show more ── */
        .cl-show-more {
          margin-top: 10px;
          background: none; border: none;
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 500;
          color: var(--accent); cursor: pointer;
          padding: 4px 0;
          transition: opacity .15s;
        }
        .cl-show-more:hover { opacity: .7; text-decoration: underline; }

        /* ── States ── */
        .cl-empty {
          text-align: center; padding: 56px 24px;
        }
        .cl-empty-icon {
          width: 44px; height: 44px;
          background: var(--bg); border: 1px solid var(--border);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px;
          color: var(--text-secondary);
        }
        .cl-empty-title { font-size: 14px; font-weight: 500; color: var(--text-primary); margin-bottom: 4px; }
        .cl-empty-sub { font-size: 13px; color: var(--text-secondary); }

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

      <div className="cl-page">

        {/* Header */}
        <div className="cl-page-header">
          <h1>Classrooms</h1>
          <p>Manage examination halls and seating capacity across departments.</p>
        </div>

        {/* Summary chips */}
        {!loading && rooms.length > 0 && (
          <div className="cl-summary">
            <div className="cl-summary-chip">
              <div className="cl-chip-dot" style={{ background: '#1A56DB' }} />
              <span><strong>{rooms.length}</strong> rooms total</span>
            </div>
            <div className="cl-summary-chip">
              <div className="cl-chip-dot" style={{ background: '#059669' }} />
              <span><strong>{totalCapacity}</strong> total seats</span>
            </div>
            <div className="cl-summary-chip">
              <div className="cl-chip-dot" style={{ background: '#D97706' }} />
              <span><strong>{totalAssigned}</strong> assigned</span>
            </div>
            <div className="cl-summary-chip">
              <div className="cl-chip-dot" style={{ background: '#7C3AED' }} />
              <span><strong>{departments.length}</strong> departments</span>
            </div>
          </div>
        )}

        {/* Add / Edit form — ADMIN only */}
        {user?.role === 'ADMIN' && (
          <div className="cl-card">
            <div className="cl-card-header">
              <h2>{editingRoom ? 'Edit Classroom' : 'Add Classroom'}</h2>
            </div>
            <div className="cl-card-body">
              {error && (
                <div className="cl-error">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}
              <form onSubmit={addRoom}>
                <div className="cl-form-grid">
                  <div className="cl-field">
                    <label className="cl-label">Room Number <span className="cl-req">*</span></label>
                    <input
                      className="cl-input"
                      value={roomNumber}
                      onChange={e => setRoomNumber(e.target.value)}
                      placeholder="e.g. 101, A-215"
                      disabled={loading}
                    />
                  </div>
                  <div className="cl-field">
                    <label className="cl-label">Department <span className="cl-req">*</span></label>
                    <select
                      className="cl-select"
                      value={department || ''}
                      onChange={e => setDepartment(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Select department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="cl-field">
                    <label className="cl-label">Capacity <span className="cl-req">*</span></label>
                    <input
                      className="cl-input"
                      type="number"
                      value={capacity}
                      onChange={e => setCapacity(e.target.value)}
                      placeholder="Total seats"
                      min="1"
                      disabled={loading}
                    />
                  </div>
                  <div className="cl-btn-row">
                    <button type="submit" className="cl-btn-primary" disabled={loading}>
                      {loading ? (editingRoom ? 'Updating…' : 'Adding…') : (editingRoom ? 'Update' : 'Add Room')}
                    </button>
                    {editingRoom && (
                      <button type="button" className="cl-btn-secondary" onClick={resetForm}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Rooms list */}
        {loading ? (
          <div className="cl-card">
            <div className="cl-card-body">
              <div className="cl-table-wrap">
                <table>
                  <thead>
                    <tr><th>Room #</th><th>Capacity</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <tr className="sk-row" key={i}>
                        {[60, 50, 80].map((w, j) => (
                          <td key={j}><div className="skeleton" style={{ width: w }} /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : rooms.length > 0 ? (
          <>
            {departments.map(dept => {
              const deptRooms = rooms.filter(r => String(r.department) === String(dept.id));
              if (deptRooms.length === 0) return null;
              const expanded = !!expandedDept[dept.id];
              const showList = expanded ? deptRooms : deptRooms.slice(0, 10);
              return (
                <div className="cl-dept-block" key={dept.id}>
                  <div className="cl-dept-header">
                    <span className="cl-dept-name">{dept.name}</span>
                    <span className="cl-dept-count">{deptRooms.length} rooms</span>
                  </div>
                  <div className="cl-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Room #</th>
                          <th>Capacity</th>
                          <th>Status</th>
                          {user?.role === 'ADMIN' && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {showList.map(r => {
                          const status = getStatus(r);
                          return (
                            <tr key={r.id}>
                              <td className="td-room">{r.room_number}</td>
                              <td className="td-capacity">{r.capacity} seats</td>
                              <td>
                                <span className={`badge badge-${status.type}`}>
                                  <span className="badge-dot" />
                                  {status.label}
                                </span>
                              </td>
                              {user?.role === 'ADMIN' && (
                                <td>
                                  <div className="td-actions">
                                    <button
                                      className="cl-btn-ghost"
                                      onClick={() => { setEditingRoom(r); setRoomNumber(r.room_number); setDepartment(r.department || ''); setCapacity(r.capacity); document.querySelector('.page-content')?.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    >
                                      Edit
                                    </button>
                                    <button className="cl-btn-danger" onClick={() => deleteRoom(r)}>
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {deptRooms.length > 10 && (
                    <button className="cl-show-more" onClick={() => toggleDept(dept.id)}>
                      {expanded ? 'Show less' : `Show ${deptRooms.length - 10} more`}
                    </button>
                  )}
                </div>
              );
            })}

            {/* Rooms with no department */}
            {rooms.filter(r => !r.department).length > 0 && (
              <div className="cl-dept-block">
                <div className="cl-dept-header">
                  <span className="cl-dept-name">Unassigned</span>
                  <span className="cl-dept-count">{rooms.filter(r => !r.department).length} rooms</span>
                </div>
                <div className="cl-table-wrap">
                  <table>
                    <thead>
                      <tr><th>Room #</th><th>Capacity</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {rooms.filter(r => !r.department).map(r => {
                        const status = getStatus(r);
                        return (
                          <tr key={r.id}>
                            <td className="td-room">{r.room_number}</td>
                            <td className="td-capacity">{r.capacity} seats</td>
                            <td>
                              <span className={`badge badge-${status.type}`}>
                                <span className="badge-dot" />{status.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="cl-card">
            <div className="cl-empty">
              <div className="cl-empty-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="cl-empty-title">No classrooms yet</div>
              <div className="cl-empty-sub">Add your first classroom using the form above.</div>
            </div>
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

export default Classrooms;