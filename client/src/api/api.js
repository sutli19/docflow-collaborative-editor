import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is rejected or expired, clear local session state and
// bounce back to login rather than leaving the app in a broken state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

function extractErrorMessage(error, fallback) {
  return error.response?.data?.message || error.response?.data?.error || fallback;
}

export async function login(email, password) {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Unable to sign in. Check your credentials and try again.'));
  }
}

export async function getDocuments() {
  try {
    const { data } = await api.get('/documents');
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Unable to load your documents.'));
  }
}

export async function getDocument(id) {
  try {
    const { data } = await api.get(`/documents/${id}`);
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Unable to load this document.'));
  }
}

export async function createDocument(payload = {}) {
  try {
    const { data } = await api.post('/documents', payload);
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Unable to create a new document.'));
  }
}

export async function updateDocument(id, payload) {
  try {
    const { data } = await api.put(`/documents/${id}`, payload);
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Unable to save your changes.'));
  }
}

export async function deleteDocument(id) {
  try {
    await api.delete(`/documents/${id}`);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Unable to delete this document.'));
  }
}

export async function shareDocument(id, email) {
  try {
    const { data } = await api.post(`/documents/${id}/share`, { email });
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Unable to share this document.'));
  }
}

export async function uploadDocument(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Unable to import that file.'));
  }
}

export default api;