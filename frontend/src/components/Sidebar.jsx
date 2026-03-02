import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const NAV_ICONS = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  departments: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" /><path d="M2 22h20" />
      <path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" />
    </svg>
  ),
  classrooms: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  subjects: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  students: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  teachers: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  generate: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
    </svg>
  ),
  view: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, label: '', y: 0 });
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const handleMouseEnter = (e, label) => {
    if (!collapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ visible: true, label, y: rect.top + rect.height / 2 });
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, label: '', y: 0 });
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', iconKey: 'dashboard', label: 'Dashboard', roles: ['ADMIN', 'OFFICE_INCHARGE'] },
    { path: '/departments', iconKey: 'departments', label: 'Departments', roles: ['ADMIN', 'OFFICE_INCHARGE'] },
    { path: '/classrooms', iconKey: 'classrooms', label: 'Classrooms', roles: ['ADMIN', 'OFFICE_INCHARGE'] },
    { path: '/subjects', iconKey: 'subjects', label: 'Subjects', roles: ['ADMIN', 'OFFICE_INCHARGE'] },
    { path: '/students', iconKey: 'students', label: 'Students', roles: ['ADMIN', 'OFFICE_INCHARGE'] },
    { path: '/teachers', iconKey: 'teachers', label: 'Teachers', roles: ['ADMIN', 'OFFICE_INCHARGE'] },
    { path: '/generate', iconKey: 'generate', label: 'Generate Seating', roles: ['ADMIN'] },
    { path: '/view', iconKey: 'view', label: 'View Seating', roles: ['ADMIN', 'OFFICE_INCHARGE'] },
  ];

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

          :root {
            --bg:             #F5F6FA;
            --white:          #FFFFFF;
            --border:         #E2E5EC;
            --text-primary:   #111827;
            --text-secondary: #6B7280;
            --text-label:     #374151;
            --accent:         #1A56DB;
            --accent-subtle:  #EFF6FF;
          }

          .sidebar {
            background: var(--white);
            border-right: 1px solid var(--border);
            height: 100vh;
            transition: width 0.25s ease;
            width: 236px;
            display: flex;
            flex-direction: column;
            font-family: 'Inter', sans-serif;
            flex-shrink: 0;
            position: sticky;
            top: 0;
            overflow: visible;
          }

          .sidebar.collapsed {
            width: 68px;
          }

          .sidebar-header {
            padding: 18px 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid var(--border);
            min-height: 64px;
          }

          .sidebar-brand {
            display: flex;
            align-items: center;
            gap: 9px;
            overflow: hidden;
          }

          .sidebar-logo-box {
            width: 30px;
            height: 30px;
            background: var(--accent);
            border-radius: 7px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .sidebar-brand-name {
            font-size: 15px;
            font-weight: 600;
            color: var(--text-primary);
            letter-spacing: -0.01em;
            white-space: nowrap;
            overflow: hidden;
          }

          .collapse-btn {
            background: transparent;
            border: 1px solid var(--border);
            border-radius: 6px;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--text-secondary);
            flex-shrink: 0;
            transition: background .15s, color .15s;
          }

          .collapse-btn:hover {
            background: var(--bg);
            color: var(--text-primary);
          }

          .sidebar-nav {
            flex: 1;
            padding: 10px 8px;
            display: flex;
            flex-direction: column;
            gap: 2px;
            overflow-y: auto;
            overflow-x: visible; 
          }

          .nav-item {
            position: relative;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 9px 12px;
            border-radius: 8px;
            text-decoration: none;
            color: var(--text-label);
            font-size: 13.5px;
            font-weight: 500;
            transition: background .15s, color .15s;
            white-space: nowrap;
            overflow: visible;
          }

          .nav-item:hover {
            background: var(--bg);
            color: var(--text-primary);
          }

          .nav-item.active {
            background: var(--accent-subtle);
            color: var(--accent);
          }

          .nav-item.active .nav-icon {
            color: var(--accent);
          }

          .nav-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: var(--text-secondary);
            transition: color .15s;
          }

          .nav-item:hover .nav-icon {
            color: var(--text-primary);
          }

          .nav-label {
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .sidebar.collapsed .nav-item {
            justify-content: center;
            padding: 9px;
          }

          .sidebar.collapsed .nav-label {
            display: none;
          }

          .nav-tooltip-fixed {
            position: fixed;
            left: 76px;
            background: #111827;
            color: #fff;
            padding: 6px 10px;
            font-size: 12px;
            font-weight: 500;
            border-radius: 6px;
            white-space: nowrap;
            pointer-events: none;
            z-index: 9999;
            transform: translateY(-50%);
            box-shadow: 0 2px 8px rgba(0,0,0,0.18);
            opacity: 1;
          }

          .sidebar-footer {
            padding: 12px 8px;
            border-top: 1px solid var(--border);
          }
        `}
      </style>

      <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!collapsed && (
            <div className="sidebar-brand">
              <div className="sidebar-logo-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <span className="sidebar-brand-name">ExamSeat</span>
            </div>
          )}
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            )}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems
            .filter(item => !item.roles || item.roles.includes(user?.role))
            .map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                onMouseLeave={handleMouseLeave}
              >
                <span className="nav-icon">
                  {NAV_ICONS[item.iconKey]}
                </span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
        </nav>
      </div>

      {collapsed && tooltip.visible && (
        <div
          className="nav-tooltip-fixed"
          style={{ top: tooltip.y }}
        >
          {tooltip.label}
        </div>
      )}
    </>
  );
}