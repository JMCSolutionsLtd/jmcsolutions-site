/**
 * API helper for the client portal.
 * Attaches JWT Bearer token from localStorage to every request.
 */

const API_BASE = '/api/portal';

async function request(path, options = {}) {
  const token = localStorage.getItem('portal_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}

export const portalApi = {
  // Auth
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  verify: () => request('/auth/verify'),

  // Assessments
  listAssessments: () => request('/assessments'),
  getQuestions: () => request('/assessments/questions'),
  createAssessment: (title) =>
    request('/assessments', { method: 'POST', body: JSON.stringify({ title }) }),
  getAssessment: (id) => request(`/assessments/${id}`),
  saveAssessment: (id, responses, status) =>
    request(`/assessments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ responses, status }),
    }),
  deleteAssessment: (id) =>
    request(`/assessments/${id}`, { method: 'DELETE' }),

  // Checklist
  getChecklist: () => request('/checklist'),
  updateChecklistTask: (id, data) =>
    request(`/checklist/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  bulkUpdateChecklist: (updates) =>
    request('/checklist', { method: 'PUT', body: JSON.stringify({ updates }) }),

  // Documents
  listDocuments: () => request('/documents'),
  uploadDocument: async (file, phase) => {
    const token = localStorage.getItem('portal_token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('phase', phase);
    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || `Upload failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data;
  },
  downloadDocument: (id) => {
    const token = localStorage.getItem('portal_token');
    return fetch(`${API_BASE}/documents/${id}/download`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    }).then((res) => {
      if (!res.ok) throw new Error('Download failed');
      return res.blob();
    });
  },
  deleteDocument: (id) =>
    request(`/documents/${id}`, { method: 'DELETE' }),
};
