// validation.js
// Helper functions implementing core rules described in the project document

// rule: student department must not match classroom department (MANUAL SEATING)
export function validateStudentClassroomDeptMismatch(student, classroom) {
  if (!student.department || !classroom.department) return true;
  return student.department !== classroom.department;
}

// rule: classroom department must be different from both supervisors
export function validateSupervisorDeptMismatch(supervisors, classroom) {
  if (!classroom.department) return true;
  return supervisors.every(s => !s.department || s.department !== classroom.department);
}

// rule: supervisors may be from same or different departments
export function validateSupervisorDiversity(supervisors) {
  // legacy function kept for completeness; always return true if two supervisors exist
  return supervisors && supervisors.length === 2;
}

// rule: exactly 2 supervisors required
export function validateSupervisorCount(supervisors) {
  return supervisors && supervisors.length === 2;
}

// rule: capacity not exceeded
export function validateCapacity(studentCount, classroom) {
  return studentCount < classroom.capacity;
}

// rule: student not assigned to same subject/exam before
export function validateStudentNotDoubleBooked(studentId, assignments) {
  return !assignments.some((a) => a.students.includes(studentId));
}

// rule: teacher/supervisor not assigned to more than one classroom for the same subject
export function validateTeacherNotDoubleBooked(teacherId, assignments, subjectId) {
  return !assignments.some(
    (a) => a.subject === subjectId && a.supervisors.includes(teacherId)
  );
}

// rule: minimum 2 departments available for seating arrangement
export function validateMinimumDepartments(classrooms, minDepts = 2) {
  if (!classrooms || classrooms.length === 0) return false;
  const uniqueDepts = new Set(
    classrooms
      .map(c => c.department)
      .filter(Boolean)
  );
  return uniqueDepts.size >= minDepts;
}

// rule: validate total capacity for all students
export function validateTotalCapacityForStudents(students, availableClassrooms) {
  const totalCapacity = availableClassrooms.reduce((sum, c) => sum + c.capacity, 0);
  const totalStudents = students.length;
  return totalCapacity >= totalStudents;
}

// rule: teacher department must not match classroom department (DEPRECATED - use supervisor validation)
export function teacherDeptMismatch(teacher, classroom) {
  return teacher.departmentId !== classroom.departmentId;
}

// rule: capacity not exceeded (DEPRECATED)
export function fitsInClassroom(studentCount, classroom) {
  return studentCount <= classroom.capacity;
}

// rule: student not assigned twice to same subject (DEPRECATED)
export function isStudentAlreadyAssigned(studentId, assignments) {
  return assignments.some((a) => a.students.includes(studentId));
}

// rule: teacher double-booking (DEPRECATED)
export function isTeacherDoubleBooked(teacherId, assignments) {
  return assignments.some(
    (a) => a.teacherId === teacherId
  );
}

export function studentDeptMismatch(student, classroom) {
  return student.departmentId !== classroom.departmentId;
}
