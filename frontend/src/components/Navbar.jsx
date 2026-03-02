import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    const titles = {
      '/dashboard': 'Dashboard',
      '/departments': 'Departments',
      '/classrooms': 'Classrooms',
      '/subjects': 'Subjects',
      '/students': 'Students',
      '/teachers': 'Teachers / Invigilators',
      '/generate': 'Generate Seating',
      '/view': 'View Seating',
    };
    return titles[pathname] || 'ExamSeat';
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
          
          .navbar {
            background-color: #FFFFFF;
            border-bottom: 1px solid #E2E5EC;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 24px;
            height: 64px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
          
          .navbar-left {
            display: flex;
            align-items: center;
            gap: 24px;
          }
          
          .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 16px;
            font-weight: 600;
            color: #111827;
            text-decoration: none;
          }
          
          .logo-icon {
            width: 32px;
            height: 32px;
            background-color: #1A56DB;
            border-radius: 7px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          
          .page-title {
            font-size: 14px;
            font-weight: 500;
            color: #6B7280;
            margin: 0;
          }
          
          .navbar-right {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          
          .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .user-name {
            font-size: 14px;
            font-weight: 500;
            color: #111827;
          }
          
          .role-badge {
            font-size: 12px;
            font-weight: 500;
            color: #1A56DB;
            background-color: rgba(26, 86, 219, 0.08);
            border: 1px solid rgba(26, 86, 219, 0.2);
            padding: 4px 10px;
            border-radius: 6px;
          }
          
          .logout-btn {
            background-color: transparent;
            border: 1px solid #E2E5EC;
            color: #374151;
            font-size: 13.5px;
            font-weight: 500;
            padding: 7px 14px;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.15s ease, border-color 0.15s;
            font-family: 'Inter', sans-serif;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
          
          .logout-btn:hover {
            background-color: #FEF2F2;
            border-color: #FECACA;
            color: #B91C1C;
          }
        `}
      </style>
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo">
            <div className="logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            ExamSeat
          </div>
          <h2 className="page-title">{getPageTitle(location.pathname)}</h2>
        </div>
        <div className="navbar-right">
          {user && (
            <>
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className="role-badge">{user.role}</span>
              </div>
              <button onClick={logout} className="logout-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;