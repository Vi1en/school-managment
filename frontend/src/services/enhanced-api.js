import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          return Promise.reject(new Error('Access denied. You do not have permission to perform this action.'));
        case 404:
          return Promise.reject(new Error('The requested resource was not found.'));
        case 422:
          return Promise.reject(new Error(data.message || 'Validation error. Please check your input.'));
        case 500:
          return Promise.reject(new Error('Server error. Please try again later.'));
        default:
          return Promise.reject(new Error(data.message || 'An unexpected error occurred.'));
      }
    } else if (error.request) {
      // Network error
      return Promise.reject(new Error('Network error. Please check your internet connection.'));
    } else {
      // Other error
      return Promise.reject(new Error('An unexpected error occurred.'));
    }
  }
);

// API methods with enhanced error handling
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  }
};

export const studentsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/students');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch students.');
    }
  },

  create: async (studentData) => {
    try {
      const response = await api.post('/students', studentData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to create student.');
    }
  },

  getByAdmissionNumber: async (admissionNumber) => {
    try {
      const response = await api.get(`/students/${admissionNumber}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch student.');
    }
  },

  update: async (admissionNumber, studentData) => {
    try {
      const response = await api.put(`/students/${admissionNumber}`, studentData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update student.');
    }
  },

  delete: async (admissionNumber) => {
    try {
      const response = await api.delete(`/students/${admissionNumber}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete student.');
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/students/stats');
      return response.data;
    } catch (error) {
      // Return default stats if API fails
      return {
        totalStudents: 0,
        paidStudents: 0,
        partialPaidStudents: 0,
        unpaidStudents: 0,
        failedStudents: 0,
        passedStudents: 0,
        graduatedStudents: 0,
        averageAttendance: 0,
        feeStats: {
          totalFee: 0,
          collectedFee: 0,
          pendingFee: 0
        }
      };
    }
  }
};

export const marksheetsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/marksheets');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch marksheets.');
    }
  },

  create: async (marksheetData) => {
    try {
      const response = await api.post('/marksheets', marksheetData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to create marksheet.');
    }
  },

  getByRollNumber: async (rollNumber) => {
    try {
      const response = await api.get(`/marksheets/${rollNumber}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch marksheet.');
    }
  },

  update: async (rollNumber, marksheetData) => {
    try {
      const response = await api.put(`/marksheets/${rollNumber}`, marksheetData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update marksheet.');
    }
  },

  delete: async (rollNumber) => {
    try {
      const response = await api.delete(`/marksheets/${rollNumber}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete marksheet.');
    }
  }
};

export const healthAPI = {
  check: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Health check failed.');
    }
  },

  test: async () => {
    try {
      const response = await api.get('/test');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'API test failed.');
    }
  }
};

export default api;
