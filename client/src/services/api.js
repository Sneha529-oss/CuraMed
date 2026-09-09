import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('curamed_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: standard error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const predictAPI = {
  predictDiabetes: async (inputData) => {
    const res = await api.post('/predict/diabetes', inputData);
    return res.data;
  },
  getModelsInfo: async () => {
    const res = await api.get('/predict/models-info');
    return res.data;
  },
  getHistory: async (params = {}) => {
    const res = await api.get('/predictions', { params });
    return res.data;
  },
  getStatsSummary: async () => {
    const res = await api.get('/predictions/stats/summary');
    return res.data;
  },
  getPredictionDetail: async (id) => {
    const res = await api.get(`/predictions/${id}`);
    return res.data;
  },
  deletePrediction: async (id) => {
    const res = await api.delete(`/predictions/${id}`);
    return res.data;
  },
};

export const analyticsAPI = {
  uploadDataset: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/analytics/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getSampleAnalytics: async () => {
    const res = await api.get('/analytics/sample-data');
    return res.data;
  },
  cleanDataset: async (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/analytics/clean', formData, {
      params: options,
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
    });
    return res;
  },
};

export const reportAPI = {
  getPdfUrl: (predictionId) => `${API_BASE}/reports/pdf/${predictionId}`,
  downloadPdf: async (predictionId, patientName = 'Patient') => {
    const res = await api.get(`/reports/pdf/${predictionId}`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = patientName.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `CuraMed_Report_${safeName}_${predictionId.slice(0, 8)}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default api;
