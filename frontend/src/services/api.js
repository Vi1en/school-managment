import axios from 'axios';

// Updated backend URL - using Netlify Functions (simple API)
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Debug: Log the API URL being used
console.log('Using API URL:', API_URL);
console.log('API Version: 3.0 - Fixed FileReader Async Logic');

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors and JSON parse errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle JSON parse errors
    if (error.message && error.message.includes('JSON.parse')) {
      console.error('JSON Parse Error - Response was not valid JSON:', error.response?.data);
      return Promise.reject(new Error('Server returned invalid response format'));
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (adminData) => api.post('/auth/register', adminData),
  getMe: () => api.get('/auth/me'),
};

// Students API
export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  getByAdmissionNumber: (admissionNumber) => api.get(`/students/${admissionNumber}`),
  create: (studentData) => {
    // Always send as JSON
    return api.post('/students', studentData);
  },
  update: (admissionNumber, studentData) => {
    // Check if it's FormData (for file upload)
    if (studentData instanceof FormData) {
      return api.put(`/students/${admissionNumber}`, studentData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.put(`/students/${admissionNumber}`, studentData);
  },
  delete: (admissionNumber) => api.delete(`/students/${admissionNumber}`),
  getStats: () => api.get('/students/stats/dashboard'),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (settingsData) => api.put('/settings', settingsData),
};

// Fee Deposits API
export const feeDepositsAPI = {
  getAll: (params) => api.get('/fee-deposits', { params }),
  getById: (id) => api.get(`/fee-deposits/${id}`),
  create: (depositData) => api.post('/fee-deposits', depositData),
  update: (id, depositData) => api.put(`/fee-deposits/${id}`, depositData),
  delete: (id) => api.delete(`/fee-deposits/${id}`),
  getByStudent: (admissionNumber) => api.get(`/fee-deposits/student/${admissionNumber}`),
};

// Marksheet API
export const marksheetAPI = {
  generate: (admissionNumber) => api.get(`/students/${admissionNumber}/marksheet`),
  getHalfYearly: (admissionNumber) => api.get(`/students/${admissionNumber}/marksheet/half-yearly`),
  getAnnual: (admissionNumber) => api.get(`/students/${admissionNumber}/marksheet/annual`),
};

// Class Fees API
export const classFeesAPI = {
  getAll: () => api.get('/class-fees'),
  getById: (id) => api.get(`/class-fees/${id}`),
  create: (data) => api.post('/class-fees', data),
  update: (id, data) => api.put(`/class-fees/${id}`, data),
  delete: (id) => api.delete(`/class-fees/${id}`),
  applyToStudents: (id) => api.post(`/class-fees/${id}/apply-to-students`),
};

// Marks API
export const marksAPI = {
  add: (data) => api.post('/marks/add', data),
  getByAdmissionNumber: (admissionNumber) => api.get(`/marks/${admissionNumber}`),
  getByClass: (className) => api.get(`/marks/class/${className}`),
  getSubjects: () => api.get('/marks/subjects/list'),
};

// Marksheets API
export const marksheetsAPI = {
  getAll: () => api.get('/marksheets'),
  getByRollNumber: (rollNumber) => api.get(`/marksheets/${rollNumber}`),
  getByClass: (classNumber) => api.get(`/marksheets/class/${classNumber}`),
  create: (marksheetData) => {
    if (marksheetData instanceof FormData) {
      return api.post('/marksheets', marksheetData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.post('/marksheets', marksheetData);
  },
  update: (rollNumber, marksheetData) => {
    if (marksheetData instanceof FormData) {
      return api.put(`/marksheets/${rollNumber}`, marksheetData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.put(`/marksheets/${rollNumber}`, marksheetData);
  },
  delete: (rollNumber) => api.delete(`/marksheets/${rollNumber}`)
};

export default api;
