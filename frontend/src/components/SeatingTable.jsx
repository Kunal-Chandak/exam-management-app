import React from 'react';

function SeatingTable({ assignments }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        :root {
          --white:          #FFFFFF;
          --border:         #E2E5EC;
          --text-primary:   #111827;
          --text-secondary: #6B7280;
        }
        
        .seating-table-wrap {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
        }

        .seating-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
        }
        
        .seating-table thead {
          background: #F9FAFB;
        }
        
        .seating-table th {
          text-align: left;
          padding: 10px 16px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        
        .seating-table tbody tr {
          border-bottom: 1px solid var(--border);
          transition: background .12s;
        }
        
        .seating-table tbody tr:hover {
          background: #F9FAFB;
        }
        
        .seating-table tbody tr:last-child {
          border-bottom: none;
        }
        
        .seating-table td {
          padding: 12px 16px;
          color: var(--text-primary);
          vertical-align: middle;
        }
      `}</style>
      <div className="seating-table-wrap">
        <table className="seating-table">
          <thead>
            <tr>
              <th>Classroom</th>
              <th>Supervisors</th>
              <th>Students</th>
            </tr>
          </thead>
          <tbody>
            {assignments && assignments.map((row) => (
              <tr key={row.id}>
                <td>{row.classroom_number}</td>
                <td>{(row.supervisors_detail || []).map(s => s.name).join(', ')}</td>
                <td>{row.students_count || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default SeatingTable;