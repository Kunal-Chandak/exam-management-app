import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import Snackbar from './Snackbar';
import ConfirmDialog from './ConfirmDialog';

/* ─── Inline styles (no external CSS file needed) ─────────────────────────── */
const S = {
  /* Layout shell */
  root: {
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
    padding: '4px 0',
  },

  /* ── Sticky sidebar (unassigned students) ── */
  sidebar: {
    width: '300px',
    minWidth: '300px',
    position: 'sticky',
    top: '16px',
    maxHeight: 'calc(100vh - 120px)',
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    border: '1px solid #E2E5EC',
    borderRadius: '12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  sidebarHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid #E2E5EC',
    background: '#F8FAFF',
  },
  sidebarTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1A56DB',
    color: '#fff',
    borderRadius: '12px',
    padding: '1px 8px',
    fontSize: '11px',
    fontWeight: '600',
    minWidth: '22px',
  },
  controls: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  controlBtn: {
    flex: '1',
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: '500',
    background: '#EFF6FF',
    color: '#1A56DB',
    border: '1px solid #BFDBFE',
    borderRadius: '6px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  rangeInput: {
    width: '64px',
    padding: '6px 8px',
    fontSize: '12px',
    border: '1px solid #E2E5EC',
    borderRadius: '6px',
    outline: 'none',
    fontFamily: 'inherit',
  },

  /* Student list scroll area */
  studentsList: {
    overflowY: 'auto',
    flex: 1,
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  studentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid #E2E5EC',
    background: '#fff',
    cursor: 'grab',
    transition: 'background 0.12s, border-color 0.12s',
    userSelect: 'none',
  },
  studentItemSelected: {
    background: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  studentInfo: {
    flex: 1,
    minWidth: 0,
  },
  studentName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#111827',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
  },
  studentRoll: {
    fontSize: '11px',
    color: '#6B7280',
    display: 'block',
  },
  deptTag: {
    fontSize: '10px',
    fontWeight: '500',
    background: '#F3F4F6',
    color: '#374151',
    borderRadius: '4px',
    padding: '2px 6px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 16px',
    color: '#9CA3AF',
    fontSize: '13px',
  },

  /* ── Classrooms area ── */
  classroomsArea: {
    flex: 1,
    minWidth: 0,
  },
  classroomsHeader: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '12px',
    paddingLeft: '2px',
  },
  classroomsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  },

  /* ── Classroom card ── */
  card: {
    background: '#fff',
    border: '1px solid #E2E5EC',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    background: '#F8FAFF',
    borderBottom: '1px solid #E2E5EC',
  },
  roomNumber: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  deptBadge: {
    fontSize: '11px',
    color: '#6B7280',
    background: '#F3F4F6',
    border: '1px solid #E2E5EC',
    borderRadius: '4px',
    padding: '2px 7px',
    marginTop: '2px',
    display: 'inline-block',
  },
  capacityBadge: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1A56DB',
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: '6px',
    padding: '3px 9px',
  },
  cardSection: {
    padding: '12px 14px',
    borderBottom: '1px solid #F3F4F6',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  supervisorSelects: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  supervisorSelect: {
    width: '100%',
    padding: '7px 10px',
    fontSize: '13px',
    border: '1px solid #E2E5EC',
    borderRadius: '7px',
    outline: 'none',
    fontFamily: 'inherit',
    color: '#111827',
    background: '#fff',
  },
  supervisorBadges: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '8px',
  },
  supervisorBadge: {
    fontSize: '11px',
    fontWeight: '500',
    background: '#ECFDF5',
    color: '#065F46',
    border: '1px solid #A7F3D0',
    borderRadius: '5px',
    padding: '3px 8px',
  },

  /* Drop zone */
  dropZone: {
    padding: '12px 14px',
    minHeight: '80px',
  },
  dropZoneInner: {
    border: '2px dashed #E2E5EC',
    borderRadius: '8px',
    padding: '16px 12px',
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: '12px',
    transition: 'border-color 0.15s, background 0.15s',
  },
  dropZoneActive: {
    borderColor: '#93C5FD',
    background: '#EFF6FF',
    color: '#1A56DB',
  },
  seatsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  seat: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 8px',
    background: '#F9FAFB',
    borderRadius: '6px',
    border: '1px solid #E2E5EC',
  },
  seatDragging: {
    background: '#1A56DB',
    color: '#fff',
    border: '1px solid #1A56DB',
    boxShadow: '0 8px 24px rgba(26, 86, 219, 0.35)',
    transform: 'scale(1.02) rotate(-1deg)',
    zIndex: 1000,
  },
  seatNum: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#9CA3AF',
    width: '18px',
    textAlign: 'center',
    flexShrink: 0,
  },
  seatName: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  seatRoll: {
    fontSize: '11px',
    color: '#6B7280',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#9CA3AF',
    cursor: 'pointer',
    padding: '2px 4px',
    borderRadius: '4px',
    fontSize: '12px',
    lineHeight: 1,
    flexShrink: 0,
  },
  assignBtn: {
    width: '100%',
    padding: '10px 12px',
    background: '#1A56DB',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s',
  },
  assignBtnDisabled: {
    background: '#D1D5DB',
    cursor: 'not-allowed',
  },

  /* Validation strip */
  validStrip: {
    display: 'flex',
    gap: '10px',
    padding: '8px 14px',
    background: '#ECFDF5',
    borderTop: '1px solid #A7F3D0',
    fontSize: '11px',
    color: '#065F46',
    fontWeight: '500',
  },
  invalidStrip: {
    display: 'flex',
    gap: '10px',
    padding: '8px 14px',
    background: '#FEF2F2',
    borderTop: '1px solid #FECACA',
    fontSize: '11px',
    color: '#991B1B',
    fontWeight: '500',
  },

  /* Action bar */
  actionBar: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  finalizeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 24px',
    background: '#1A56DB',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s',
  },
  finalizeBtnDisabled: {
    background: '#D1D5DB',
    cursor: 'not-allowed',
  },

  searchInput: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '13px',
    border: '1px solid #E2E5EC',
    borderRadius: '6px',
    outline: 'none',
    fontFamily: 'inherit',
    marginBottom: '8px',
    color: '#111827',
    background: '#fff',
  },
};

function ManualGridAssignment({ mainDept, seatingDept, subject, onComplete }) {
  const [classrooms, setClassrooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [selectedStudentsMap, setSelectedStudentsMap] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [supervisorSelections, setSupervisorSelections] = useState({});
  const [rangeCount, setRangeCount] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [searchClassroom, setSearchClassroom] = useState('');
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null, onCancel: null });
  const [draggedStudent, setDraggedStudent] = useState(null);
  const closeConfirm = () => setConfirmState({ open: false, title: '', message: '', onConfirm: null, onCancel: null });

  const unassignedStudentsSorted = () => {
    const assignedIds = new Set(
      Object.values(assignments).filter(Boolean).flatMap(a => a.students)
    );
    return students
      .filter(s => s.department === mainDept && !assignedIds.has(s.id))
      .sort((a, b) => a.roll_number.localeCompare(b.roll_number));
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [classroomsData, studentsResp, teachersResp, seatingData] = await Promise.all([
        api.getAvailableClassrooms(seatingDept, subject),
        api.getStudents(200, 0),
        api.getTeachers(200, 0),
        api.getSeating(),
      ]);

      setClassrooms(classroomsData);
      const students = studentsResp.results || (Array.isArray(studentsResp) ? studentsResp : []);
      const teachers = teachersResp.results || (Array.isArray(teachersResp) ? teachersResp : []);
      setStudents(students.filter(s => s.department === mainDept));
      setTeachers(teachers.filter(t => t.department === seatingDept));

      const relevantSeatings = seatingData.filter(s => s.subject === subject && s.classroom_dept === seatingDept);
      const initAssign = {}, initSup = {};
      classroomsData.forEach(cr => {
        const existing = relevantSeatings.find(s => s.classroom === cr.id);
        initAssign[cr.id] = existing || null;
        initSup[cr.id] = existing?.supervisors ? [...existing.supervisors] : ['', ''];
      });
      setAssignments(initAssign);
      setSupervisorSelections(initSup);
    } catch (error) {
      showSnackbar(error.error || 'Failed to load data', 'error');
    }
    setLoading(false);
  }, [subject, mainDept, seatingDept]);

  useEffect(() => { loadData(); }, [loadData]);

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => setSnackbar({ open: false, message: '', type: 'success' }), 3000);
  };

  const handleAssignSelected = async (classroomId) => {
    const toAssign = Object.keys(selectedStudentsMap);
    if (toAssign.length === 0) return showSnackbar('Please select students first', 'warning');

    const classroom = classrooms.find(c => c.id === classroomId);
    if (!classroom) return showSnackbar('Invalid classroom', 'error');

    const performAssignment = async () => {
      try {
        const result = await api.assignStudent({ studentIds: toAssign, classroomId, subjectId: subject, seatingDept });
        setAssignments(prev => ({ ...prev, [classroomId]: result }));
        setSelectedStudentsMap({});
        showSnackbar(`${toAssign.length} student(s) assigned to ${classroom.room_number}`, 'success');
      } catch (error) {
        showSnackbar(error.error || 'Failed to assign students', 'error');
      }
    };

    if (seatingDept && classroom.department && String(classroom.department) !== String(seatingDept)) {
      setConfirmState({
        open: true,
        title: 'Department Mismatch',
        message: `Classroom "${classroom.room_number}" belongs to "${classroom.department_name || classroom.department}" which doesn't match the seating department. Assign anyway?`,
        onConfirm: async () => { closeConfirm(); await performAssignment(); },
        onCancel: () => { closeConfirm(); showSnackbar('Assignment cancelled', 'warning'); },
      });
      return;
    }
    await performAssignment();
  };

  const handleRemoveStudent = async (classroomId, studentId) => {
    const seating = assignments[classroomId];
    if (!seating) return;
    try {
      const result = await api.removeStudent(seating.id, studentId);
      setAssignments(prev => ({ ...prev, [classroomId]: result }));
      showSnackbar('Student removed', 'success');
    } catch (error) {
      showSnackbar(error.error || 'Failed to remove student', 'error');
    }
  };

  const handleDragStart = (e, classroomId, studentId) => {
    setDraggedStudent({ classroomId, studentId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropStudent = (e, classroomId, targetStudentId) => {
    e.preventDefault();
    if (!draggedStudent) return;
    
    const { classroomId: sourceClassroom, studentId: sourceStudentId } = draggedStudent;
    if (sourceClassroom !== classroomId || sourceStudentId === targetStudentId) {
      setDraggedStudent(null);
      return;
    }
    
    const seating = assignments[classroomId];
    if (!seating || !seating.students) {
      setDraggedStudent(null);
      return;
    }
    
    const studentsArr = [...seating.students];
    const sourceIdx = studentsArr.indexOf(sourceStudentId);
    const targetIdx = studentsArr.indexOf(targetStudentId);
    
    if (sourceIdx === -1 || targetIdx === -1) {
      setDraggedStudent(null);
      return;
    }
    
    [studentsArr[sourceIdx], studentsArr[targetIdx]] = [studentsArr[targetIdx], studentsArr[sourceIdx]];
    
    setAssignments(prev => ({
      ...prev,
      [classroomId]: { ...seating, students: studentsArr }
    }));
    
    setDraggedStudent(null);
  };

  const handleAssignSupervisors = async (classroomId, supervisorIds) => {
    if (supervisorIds.length !== 2) return showSnackbar('Exactly 2 supervisors required', 'error');
    const usedElsewhere = new Set();
    Object.entries(supervisorSelections).forEach(([crId, ids]) => {
      if (crId !== classroomId) ids.forEach(id => { if (id) usedElsewhere.add(id); });
    });
    const dups = supervisorIds.filter(id => usedElsewhere.has(id));
    if (dups.length > 0) {
      const names = teachers.filter(t => dups.includes(t.id)).map(t => t.name).join(', ');
      return showSnackbar(`${names} already assigned elsewhere`, 'error');
    }
    if (teachers.filter(t => supervisorIds.includes(t.id)).length !== 2)
      return showSnackbar('Please select 2 supervisors', 'error');
    try {
      const result = await api.assignSupervisors(classroomId, subject, supervisorIds);
      setAssignments(prev => ({ ...prev, [classroomId]: result }));
      setSupervisorSelections(prev => ({ ...prev, [classroomId]: [...supervisorIds] }));
    } catch (error) {
      showSnackbar(error.error || 'Failed to assign supervisors', 'error');
    }
  };

  const toggleStudentSelection = id => {
    setSelectedStudentsMap(prev => {
      const copy = { ...prev };
      if (copy[id]) delete copy[id]; else copy[id] = true;
      return copy;
    });
  };

  const handleFinalizeAll = async () => {
    const all = Object.values(assignments).filter(Boolean);
    if (all.length === 0) return showSnackbar('No classrooms with assignments', 'error');
    const errors = [];
    for (const s of all) {
      if (!s.supervisors_detail || s.supervisors_detail.length !== 2) errors.push(`${s.classroom_number}: Missing supervisors`);
      if (!s.students || s.students.length === 0) errors.push(`${s.classroom_number}: No students`);
    }
    if (errors.length > 0) return showSnackbar(errors.join('; '), 'error');
    try {
      setLoading(true);
      for (const s of all) await api.finalizeAssignment(s.id);
      showSnackbar('All assignments finalized!', 'success');
      onComplete && onComplete();
    } catch (error) {
      showSnackbar(error.error || 'Failed to finalize', 'error');
    } finally { setLoading(false); }
  };

  const allUnassignedStudents = unassignedStudentsSorted();
  const unassignedStudents = allUnassignedStudents.filter(s =>
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(searchStudent.toLowerCase())
  );
  const filteredClassrooms = classrooms.filter(c =>
    c.room_number.toLowerCase().includes(searchClassroom.toLowerCase())
  );
  const selectedCount = Object.keys(selectedStudentsMap).length;

  return (
    <div style={S.root}>

      {/* ── Sticky Sidebar: Unassigned Students ── */}
      <div style={S.sidebar}>
        <div style={S.sidebarHeader}>
          <div style={S.sidebarTitle}>
            <span>Unassigned Students</span>
            <span style={S.badge}>{allUnassignedStudents.length}</span>
          </div>
          <input
            type="text"
            placeholder="Search by name or roll..."
            value={searchStudent}
            onChange={e => setSearchStudent(e.target.value)}
            style={S.searchInput}
          />
          <div style={S.controls}>
            <button
              style={S.controlBtn}
              onClick={() => {
                const map = {};
                unassignedStudents.forEach(s => { map[s.id] = true; });
                setSelectedStudentsMap(map);
              }}
            >
              Select All
            </button>
            <input
              type="number"
              min="1"
              max={unassignedStudents.length}
              placeholder="N"
              value={rangeCount}
              onChange={e => setRangeCount(e.target.value)}
              style={S.rangeInput}
            />
            <button
              style={S.controlBtn}
              onClick={() => {
                const n = parseInt(rangeCount, 10) || 0;
                const map = {};
                unassignedStudents.slice(0, n).forEach(s => { map[s.id] = true; });
                setSelectedStudentsMap(map);
              }}
            >
              Pick {rangeCount || 'N'}
            </button>
          </div>
          {selectedCount > 0 && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#1A56DB', fontWeight: '500' }}>
              {selectedCount} selected — click "Assign" on any classroom
            </div>
          )}
        </div>

        <div style={S.studentsList}>
          {unassignedStudents.length === 0 ? (
            <div style={S.emptyState}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>✓</div>
              All students assigned
            </div>
          ) : (
            unassignedStudents.map(student => {
              const isSelected = !!selectedStudentsMap[student.id];
              return (
                <div
                  key={student.id}
                  style={{ ...S.studentItem, ...(isSelected ? S.studentItemSelected : {}) }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleStudentSelection(student.id)}
                    style={{ flexShrink: 0, cursor: 'pointer' }}
                  />
                  <div style={S.studentInfo}>
                    <span style={S.studentName}>{student.name}</span>
                    <span style={S.studentRoll}>{student.roll_number}</span>
                  </div>
                  <span style={S.deptTag}>{student.department_name}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Main Area: Classrooms ── */}
      <div style={S.classroomsArea}>
        <div style={S.classroomsHeader}>
          Classrooms ({filteredClassrooms.length})
        </div>
        <input
          type="text"
          placeholder="Search by room number..."
          value={searchClassroom}
          onChange={e => setSearchClassroom(e.target.value)}
          style={{ ...S.searchInput, marginBottom: '16px' }}
        />
        <div style={S.classroomsGrid}>
          {filteredClassrooms.map(classroom => {
            const seating = assignments[classroom.id];
            const isValid = seating?.supervisors?.length === 2 && seating?.students?.length > 0;

            // Supervisors used in other classrooms
            const usedElsewhere = new Set();
            Object.entries(supervisorSelections).forEach(([crId, ids]) => {
              if (crId !== classroom.id) ids.forEach(id => { if (id) usedElsewhere.add(id); });
            });
            const selections = supervisorSelections[classroom.id] || ['', ''];

            return (
              <div key={classroom.id} style={S.card}>

                {/* Card Header */}
                <div style={S.cardHeader}>
                  <div>
                    <h4 style={S.roomNumber}>{classroom.room_number}</h4>
                    <span style={S.deptBadge}>{classroom.department_name}</span>
                  </div>
                  <span style={S.capacityBadge}>
                    {seating?.students_count || 0} / {classroom.capacity}
                  </span>
                </div>

                {/* Supervisors */}
                <div style={S.cardSection}>
                  <div style={S.sectionLabel}>Supervisors</div>
                  <div style={S.supervisorSelects}>
                    {[0, 1].map(index => (
                      <select
                        key={`sup-${classroom.id}-${index}`}
                        value={selections[index] || ''}
                        style={S.supervisorSelect}
                        onChange={e => {
                          const newId = e.target.value;
                          setSupervisorSelections(prev => {
                            const copy = { ...prev };
                            const arr = copy[classroom.id] ? [...copy[classroom.id]] : ['', ''];
                            arr[index] = newId;
                            copy[classroom.id] = arr;
                            if (arr[0] && arr[1]) handleAssignSupervisors(classroom.id, arr);
                            return copy;
                          });
                        }}
                      >
                        <option value="">Supervisor {index + 1}</option>
                        {teachers
                          .filter(t => !usedElsewhere.has(t.id))
                          .map(t => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.department_name})
                            </option>
                          ))}
                      </select>
                    ))}
                  </div>
                  {seating?.supervisors_detail?.length === 2 && (
                    <div style={S.supervisorBadges}>
                      {seating.supervisors_detail.map(sup => (
                        <span key={sup.id} style={S.supervisorBadge}>✓ {sup.name}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Students section */}
                <div style={S.cardSection}>
                  <div style={S.sectionLabel}>Students ({seating?.students_count || 0})</div>
                  {seating?.students?.length > 0 ? (
                    <div style={S.seatsGrid}>
                      {seating.students.map((studentId, idx) => {
                        const sd = students.find(s => s.id === studentId);
                        const isDragging = draggedStudent?.classroomId === classroom.id && draggedStudent?.studentId === studentId;
                        return (
                          <div
                            key={`${classroom.id}-${studentId}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, classroom.id, studentId)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDropStudent(e, classroom.id, studentId)}
                            style={{ ...S.seat, ...(isDragging ? S.seatDragging : {}) }}
                            title="Drag to reorder"
                          >
                            <span style={{ ...S.seatNum, ...(isDragging ? { color: '#fff' } : {}) }}>{idx + 1}</span>
                            <span style={{ ...S.seatName, ...(isDragging ? { color: '#fff' } : {}) }}>{sd?.name || 'Unknown'}</span>
                            <span style={{ ...S.seatRoll, ...(isDragging ? { color: '#E0E7FF' } : {}) }}>{sd?.roll_number || ''}</span>
                            <button
                              style={{ ...S.removeBtn, ...(isDragging ? { color: '#fff' } : {}) }}
                              onClick={() => handleRemoveStudent(classroom.id, studentId)}
                              title="Remove"
                            >✕</button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#9CA3AF', padding: '12px', textAlign: 'center' }}>
                      No students assigned
                    </div>
                  )}
                  <button
                    style={{ ...S.assignBtn, ...(selectedCount === 0 ? S.assignBtnDisabled : {}), marginTop: '10px' }}
                    onClick={() => handleAssignSelected(classroom.id)}
                    disabled={selectedCount === 0}
                  >
                    {selectedCount > 0 ? `Assign ${selectedCount} Selected` : 'Select Students First'}
                  </button>
                </div>

                {/* Validation strip */}
                {seating && (
                  <div style={isValid ? S.validStrip : S.invalidStrip}>
                    <span>{seating.supervisors?.length === 2 ? '✓ Supervisors' : '✗ Supervisors missing'}</span>
                    <span>{seating.students?.length > 0 ? '✓ Students' : '✗ No students'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Finalize */}
        <div style={S.actionBar}>
          <button
            style={{ ...S.finalizeBtn, ...(loading ? S.finalizeBtnDisabled : {}) }}
            onClick={handleFinalizeAll}
            disabled={loading}
          >
            {loading ? 'Finalizing…' : 'Finalize All Assignments'}
          </button>
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar({ open: false, message: '', type: 'success' })}
      />
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel="Assign Anyway"
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel || closeConfirm}
      />
    </div>
  );
}

export default ManualGridAssignment;