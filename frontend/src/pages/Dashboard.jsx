import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useUI } from '../context/UIContext';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showSnackbar } = useUI();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClassrooms: 0,
    totalTeachers: 0,
    upcomingExams: 0,
  });
  const [exams, setExams] = useState([]);
  const [seatings, setSeatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentsResp, classroomsResp, teachersResp, subjectsResp, seatingData] = await Promise.all([
          api.getStudents(1, 0),
          api.getClassrooms(1, 0),
          api.getTeachers(1, 0),
          api.getSubjects(null, 100, 0),
          api.getSeating(),
        ]);
        // Handle paginated responses
        const studentsTotal = studentsResp.total || (Array.isArray(studentsResp) ? studentsResp.length : 0);
        const classroomsTotal = classroomsResp.total || (Array.isArray(classroomsResp) ? classroomsResp.length : 0);
        const teachersTotal = teachersResp.total || (Array.isArray(teachersResp) ? teachersResp.length : 0);
        const subjects = subjectsResp.results || (Array.isArray(subjectsResp) ? subjectsResp : []);
        setStats({
          totalStudents: studentsTotal,
          totalClassrooms: classroomsTotal,
          totalTeachers: teachersTotal,
          upcomingExams: subjects.filter(s => s.exam_date).length,
        });
        setExams(subjects.filter(s => s.exam_date).slice(0, 5));
        setSeatings(seatingData);
      } catch (e) {
        showSnackbar('Failed to load dashboard data', { type: 'error' });
      }
      setLoading(false);
    };
    loadData();
  }, [showSnackbar]);

  const getExamStatus = (subjectId) => {
    const subjectSeatings = seatings.filter(s => String(s.subject) === String(subjectId));
    const hasCompleted = subjectSeatings.some(s => s.status === 'finalized');
    return hasCompleted ? 'Completed' : 'Pending';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const statCards = [
    {
      title: 'Total Students',
      count: stats.totalStudents,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      color: '#1A56DB',
      bg: '#EFF6FF',
    },
    {
      title: 'Classrooms',
      count: stats.totalClassrooms,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      color: '#059669',
      bg: '#ECFDF5',
    },
    {
      title: 'Total Teachers',
      count: stats.totalTeachers,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      color: '#7C3AED',
      bg: '#F5F3FF',
    },
    {
      title: 'Upcoming Exams',
      count: stats.upcomingExams,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      color: '#D97706',
      bg: '#FFFBEB',
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:             #F5F6FA;
          --white:          #FFFFFF;
          --border:         #E2E5EC;
          --text-primary:   #111827;
          --text-secondary: #6B7280;
          --text-label:     #374151;
          --accent:         #1A56DB;
          --accent-hover:   #1646C0;
          --accent-subtle:  #EFF6FF;
        }

        html, body, #root {
          height: 100%;
          font-family: 'Inter', sans-serif;
          background: var(--bg);
        }

        /* ── Page wrapper ── */
        .db-page {
          min-height: 100vh;
          background: var(--bg);
          padding: 32px 28px;
          font-family: 'Inter', sans-serif;
        }

        /* ── Page header ── */
        .page-header {
          margin-bottom: 28px;
        }

        .page-header h1 {
          font-size: 22px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }

        .page-header p {
          font-size: 14px;
          color: var(--text-secondary);
        }

        /* ── Stat cards ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .stat-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: box-shadow .15s;
        }

        .stat-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .stat-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-body { flex: 1; min-width: 0; }

        .stat-title {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 6px;
          font-weight: 400;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .stat-count {
          font-size: 26px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          line-height: 1;
        }

        /* ── Section card ── */
        .section-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid var(--border);
        }

        .section-header h2 {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .section-count {
          font-size: 12px;
          color: var(--text-secondary);
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 2px 10px;
          font-weight: 500;
        }

        /* ── Table ── */
        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        thead tr {
          background: #F9FAFB;
        }

        thead th {
          padding: 10px 20px;
          text-align: left;
          font-size: 11.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
          white-space: nowrap;
          border-bottom: 1px solid var(--border);
        }

        tbody tr {
          border-bottom: 1px solid var(--border);
          transition: background .12s;
        }

        tbody tr:last-child { border-bottom: none; }

        tbody tr:hover { background: #F9FAFB; }

        tbody td {
          padding: 13px 20px;
          color: var(--text-primary);
          vertical-align: middle;
        }

        .td-subject { font-weight: 500; }

        .td-code {
          font-size: 13px;
          color: var(--text-secondary);
          font-family: 'SF Mono', 'Fira Code', monospace;
        }

        .td-date, .td-time {
          font-size: 13.5px;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        /* ── Status badge ── */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 500;
          padding: 3px 10px;
          border-radius: 20px;
          white-space: nowrap;
        }

        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .badge-completed {
          background: #ECFDF5;
          color: #065F46;
          border: 1px solid #A7F3D0;
        }
        .badge-completed .badge-dot { background: #10B981; }

        .badge-pending {
          background: #FFFBEB;
          color: #92400E;
          border: 1px solid #FDE68A;
        }
        .badge-pending .badge-dot { background: #F59E0B; }

        /* ── Action button ── */
        .btn-generate {
          padding: 6px 14px;
          background: var(--accent-subtle);
          color: var(--accent);
          border: 1px solid #BFDBFE;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: background .15s, border-color .15s;
          white-space: nowrap;
        }

        .btn-generate:hover {
          background: #DBEAFE;
          border-color: #93C5FD;
        }

        /* ── Empty / loading states ── */
        .state-row td {
          padding: 48px 20px;
          text-align: center;
        }

        .state-icon {
          width: 40px; height: 40px;
          margin: 0 auto 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        .state-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .state-sub {
          font-size: 13px;
          color: var(--text-secondary);
        }

        /* ── Skeleton loader ── */
        .skeleton {
          background: linear-gradient(90deg, #F3F4F6 25%, #E9EAEC 50%, #F3F4F6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 4px;
          height: 14px;
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .skeleton-row td { padding: 14px 20px; }
      `}</style>

      <div className="db-page">

        {/* Header */}
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Welcome back{user?.username ? `, ${user.username}` : ''}. Here's what's happening today.</p>
        </div>

        {/* Stat Cards */}
        <div className="stats-grid">
          {statCards.map((card) => (
            <div className="stat-card" key={card.title}>
              <div
                className="stat-icon-wrap"
                style={{ background: card.bg, color: card.color }}
              >
                {card.icon}
              </div>
              <div className="stat-body">
                <div className="stat-title">{card.title}</div>
                <div className="stat-count">
                  {loading ? (
                    <div className="skeleton" style={{ width: 40, height: 26, marginTop: 2 }} />
                  ) : card.count}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Exams Table */}
        <div className="section-card">
          <div className="section-header">
            <h2>Upcoming Exams</h2>
            {!loading && (
              <span className="section-count">{exams.length} scheduled</span>
            )}
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Code</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  {user?.role === 'ADMIN' && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr className="skeleton-row" key={i}>
                      {[160, 80, 100, 80, 70, 80].map((w, j) => (
                        <td key={j}><div className="skeleton" style={{ width: w }} /></td>
                      ))}
                    </tr>
                  ))
                ) : exams.length > 0 ? (
                  exams.map((exam) => {
                    const status = getExamStatus(exam.id);
                    return (
                      <tr key={exam.id}>
                        <td className="td-subject">{exam.name}</td>
                        <td className="td-code">{exam.subject_code}</td>
                        <td className="td-date">{formatDate(exam.exam_date)}</td>
                        <td className="td-time">{exam.exam_time || '—'}</td>
                        <td>
                          <span className={`badge ${status === 'Completed' ? 'badge-completed' : 'badge-pending'}`}>
                            <span className="badge-dot" />
                            {status}
                          </span>
                        </td>
                        {user?.role === 'ADMIN' && (
                          <td>
                            <button
                              className="btn-generate"
                              onClick={() => navigate('/generate')}
                            >
                              Generate
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr className="state-row">
                    <td colSpan={user?.role === 'ADMIN' ? 6 : 5}>
                      <div className="state-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </div>
                      <div className="state-title">No upcoming exams</div>
                      <div className="state-sub">Exams with scheduled dates will appear here.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}

export default Dashboard;