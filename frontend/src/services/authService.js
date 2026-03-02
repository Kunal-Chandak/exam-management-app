// authService.js
// Contains helper functions for authentication (token management, role checks)

export function saveToken(token) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

export function getToken() {
  return localStorage.getItem('token');
}

export function isLoggedIn() {
  return !!getToken();
}

// decode user info from JWT if needed (could use jwt-decode library)
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    // replaceAll ensures every '-' and '_' is converted (not just the first)
    const base64 = base64Url.replaceAll('-', '+').replaceAll('_', '/');
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
}
