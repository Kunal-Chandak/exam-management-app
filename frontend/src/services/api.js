// api.js
// A thin wrapper around fetch with caching and pagination support for better performance

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function request(path, options = {}) {
  // Check cache for GET requests (skip cache if force=true)
  const cacheKey = `${path}`;
  if (!options.method || options.method === 'GET') {
    if (!options.forceRefresh && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    }
  }
  
  // allow disabling of auth header (e.g. login)
  const token = options.skipAuth ? null : localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });
  // 204 No Content returns an empty body; parsing json will fail
  let data = null;
  if (res.status !== 204) {
    try {
      data = await res.json();
    } catch (err) {
      // if parsing fails, set to null and continue
      data = null;
    }
  }
  if (!res.ok) {
    if (res.status === 401) {
      // Token expired or invalid — clear auth state and notify the app
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    throw data;
  }
  
  // Cache successful GET responses
  if (!options.method || options.method === 'GET') {
    cache.set(cacheKey, { data, timestamp: Date.now() });
  }
  
  // Invalidate related cache entries after mutations (POST, PUT, DELETE)
  if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
    invalidateCache(path);
  }
  
  return data;
}

// Clear cache entries matching a pattern (used after mutations)
function invalidateCache(modifiedPath) {
  // Extract the resource type from path (e.g. /students/ from /students/123/)
  const resourceMatch = modifiedPath.match(/\/([^/]+)\//);
  if (!resourceMatch) return;
  const resource = resourceMatch[1];
  
  // Clear all cache entries for this resource
  const keysToDelete = [];
  for (const key of cache.keys()) {
    if (key.includes(`/${resource}/?`) || key === `/${resource}/`) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => cache.delete(key));
}

export const api = {
  login: (email, password) =>
    request('/users/login/', {
      method: 'POST',
      body: JSON.stringify({ username: email, password }),
      skipAuth: true,
    }),

  // departments
  getDepartments: () => request('/departments/'),
  createDepartment: (dept) =>
    request('/departments/', { method: 'POST', body: JSON.stringify(dept) }),
  updateDepartment: (id, dept) =>
    request(`/departments/${id}/`, { method: 'PUT', body: JSON.stringify(dept) }),
  deleteDepartment: (id) =>
    request(`/departments/${id}/`, { method: 'DELETE' }),

  // classrooms (with pagination)
  getClassrooms: (limit = 100, offset = 0, deptId = null) => {
    let url = `/classrooms/?limit=${limit}&offset=${offset}`;
    if (deptId) url += `&department=${deptId}`;
    return request(url);
  },
  createClassroom: (cls) =>
    request('/classrooms/', { method: 'POST', body: JSON.stringify(cls) }),
  updateClassroom: (id, cls) =>
    request(`/classrooms/${id}/`, { method: 'PUT', body: JSON.stringify(cls) }),
  deleteClassroom: (id) =>
    request(`/classrooms/${id}/`, { method: 'DELETE' }),

  // subjects (with pagination)
  getSubjects: (deptId, limit = 100, offset = 0) => {
    let url = `/subjects/?limit=${limit}&offset=${offset}`;
    if (deptId) url += `&department=${deptId}`;
    return request(url);
  },
  createSubject: (sub) =>
    request('/subjects/', { method: 'POST', body: JSON.stringify(sub) }),
  updateSubject: (id, sub) =>
    request(`/subjects/${id}/`, { method: 'PUT', body: JSON.stringify(sub) }),
  deleteSubject: (id) =>
    request(`/subjects/${id}/`, { method: 'DELETE' }),

  // students (with pagination)
  getStudents: (limit = 100, offset = 0, deptId = null) => {
    let url = `/students/?limit=${limit}&offset=${offset}`;
    if (deptId) url += `&department=${deptId}`;
    return request(url);
  },
  createStudent: (stu) =>
    request('/students/', { method: 'POST', body: JSON.stringify(stu) }),
  updateStudent: (id, stu) =>
    request(`/students/${id}/`, { method: 'PUT', body: JSON.stringify(stu) }),
  deleteStudent: (id) =>
    request(`/students/${id}/`, { method: 'DELETE' }),

  // teachers (with pagination)
  getTeachers: (limit = 100, offset = 0, deptId = null) => {
    let url = `/teachers/?limit=${limit}&offset=${offset}`;
    if (deptId) url += `&department=${deptId}`;
    return request(url);
  },
  createTeacher: (t) =>
    request('/teachers/', { method: 'POST', body: JSON.stringify(t) }),
  updateTeacher: (id, t) =>
    request(`/teachers/${id}/`, { method: 'PUT', body: JSON.stringify(t) }),
  deleteTeacher: (id) =>
    request(`/teachers/${id}/`, { method: 'DELETE' }),

  // seating
  getSeating: (subjectId, deptId) => {
    let url = '/seating/';
    const params = [];
    if (subjectId) params.push(`subject=${subjectId}`);
    if (deptId) params.push(`classroom_dept=${deptId}`);
    if (params.length) url += `?${params.join('&')}`;
    return request(url);
  },
  getSeatingById: (id) => request(`/seating/${id}/`),
  downloadSeating: (id) => request(`/seating/${id}/download/`),
  downloadSubjectSeating: (subjectId, deptId) => {
    let url = `/seating/download_subject/?subject=${subjectId}`;
    if (deptId) url += `&classroom_dept=${deptId}`;
    return fetch(`${BASE_URL}${url}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  // seating - manual grid assignment
  // departmentId is required; subjectId is optional so that the server
  // can report availability relative to a particular subject/date rather
  // than mixing students from other seatings in the same room.
  getAvailableClassrooms: (departmentId, subjectId) => {
    let url = `/seating/available_classrooms/?department=${departmentId}`;
    if (subjectId) {
      url += `&subject=${subjectId}`;
    }
    return request(url);
  },
  validateAssignment: (studentId, classroomId, subjectId) =>
    request('/seating/validate_assignment/', {
      method: 'POST',
      body: JSON.stringify({
        student_id: studentId,
        classroom_id: classroomId,
        subject_id: subjectId,
      }),
    }),
  assignStudent: ({ studentId, studentIds, classroomId, subjectId, row, col }) =>
    request('/seating/assign_student/', {
      method: 'POST',
      body: JSON.stringify({
        student_id: studentId,
        student_ids: studentIds,
        classroom_id: classroomId,
        subject_id: subjectId,
        row,
        column: col,
      }),
    }),
  assignSupervisors: (classroomId, subjectId, supervisorIds) =>
    request('/seating/assign_supervisors/', {
      method: 'POST',
      body: JSON.stringify({
        classroom_id: classroomId,
        subject_id: subjectId,
        supervisor_ids: supervisorIds,
      }),
    }),
  removeStudent: (seatingId, studentId) =>
    request('/seating/remove_student/', {
      method: 'POST',
      body: JSON.stringify({
        seating_id: seatingId,
        student_id: studentId,
      }),
    }),
  finalizeAssignment: (seatingId) =>
    request('/seating/finalize_assignment/', {
      method: 'POST',
      body: JSON.stringify({
        seating_id: seatingId,
      }),
    }),
};
