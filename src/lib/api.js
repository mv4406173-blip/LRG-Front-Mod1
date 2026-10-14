import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: 'application/json' },
});

// Obtener cookie CSRF de Sanctum
export const initCsrf = () => api.get('/sanctum/csrf-cookie');

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/api/v1/auth/register', data),
  login: (data) => api.post('/api/v1/auth/login', data),
  logout: () => api.post('/api/v1/auth/logout'),
  me: () => api.get('/api/v1/auth/me'),
  forgotPassword: (email) => api.post('/api/v1/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/api/v1/auth/reset-password', data),
  confirmPassword: (password) => api.post('/api/v1/auth/confirm-password', { password }),
  sendVerification: () => api.post('/api/v1/auth/email/verification-notification'),
};

// ─── Projects ───────────────────────────────────────────────────────────────
export const projectsApi = {
  list: (page = 1) => api.get('/api/v1/projects', { params: { page } }),
  create: (data) => api.post('/api/v1/projects', data),
  get: (id) => api.get(`/api/v1/projects/${id}`),
  update: (id, data) => api.patch(`/api/v1/projects/${id}`, data),
  delete: (id) => api.delete(`/api/v1/projects/${id}`),
};

// ─── Schema Imports ─────────────────────────────────────────────────────────
export const importsApi = {
  list: (projectId, page = 1) =>
    api.get(`/api/v1/projects/${projectId}/schema-imports`, { params: { page } }),
  get: (projectId, importId) =>
    api.get(`/api/v1/projects/${projectId}/schema-imports/${importId}`),
  upload: (projectId, formData) =>
    api.post(`/api/v1/projects/${projectId}/schema-imports`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  retry: (projectId, importId) =>
    api.post(`/api/v1/projects/${projectId}/schema-imports/${importId}/retry`),
};

// ─── Schema Artifacts ───────────────────────────────────────────────────────
export const artifactsApi = {
  list: (projectId, page = 1) =>
    api.get(`/api/v1/projects/${projectId}/schema-artifacts`, { params: { page } }),
  get: (projectId, artifactId) =>
    api.get(`/api/v1/projects/${projectId}/schema-artifacts/${artifactId}`),
};
