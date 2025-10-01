import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiError, LoginForm, Student, StudentForm, Marksheet, MarksheetForm, DashboardStats } from '@/types';

// Create axios instance with default config
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth-token');
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
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An error occurred',
        status: error.response?.status || 500,
        code: error.code,
        details: error.response?.data,
      };

      // Handle specific error cases
      if (error.response?.status === 401) {
        // Clear auth data and redirect to login
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }

      return Promise.reject(apiError);
    }
  );

  return instance;
};

const api = createApiInstance();

// Generic API wrapper with error handling
const apiWrapper = async <T>(
  apiCall: () => Promise<AxiosResponse<T>>
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiCall();
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      data: null as any,
      error: error.message || 'An error occurred',
    };
  }
};

// Auth API
export const authAPI = {
  login: async (credentials: LoginForm): Promise<ApiResponse<{ user: any; token: string }>> => {
    return apiWrapper(() => api.post('/auth/login', credentials));
  },

  register: async (adminData: any): Promise<ApiResponse<any>> => {
    return apiWrapper(() => api.post('/auth/register', adminData));
  },

  getMe: async (): Promise<ApiResponse<any>> => {
    return apiWrapper(() => api.get('/auth/me'));
  },

  logout: async (): Promise<ApiResponse<void>> => {
    return apiWrapper(() => api.post('/auth/logout'));
  },
};

// Students API
export const studentsAPI = {
  getAll: async (params?: any): Promise<ApiResponse<Student[]>> => {
    return apiWrapper(() => api.get('/students', { params }));
  },

  getByAdmissionNumber: async (admissionNumber: string): Promise<ApiResponse<Student>> => {
    return apiWrapper(() => api.get(`/students/${admissionNumber}`));
  },

  create: async (studentData: StudentForm): Promise<ApiResponse<Student>> => {
    // Handle file upload for photo
    if (studentData.photo) {
      const formData = new FormData();
      Object.keys(studentData).forEach((key) => {
        if (key === 'feeDetails') {
          formData.append('feeDetails', JSON.stringify(studentData.feeDetails));
        } else if (key === 'photo') {
          formData.append('photo', studentData.photo!);
        } else {
          formData.append(key, (studentData as any)[key]);
        }
      });

      return apiWrapper(() => 
        api.post('/students', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
    }

    return apiWrapper(() => api.post('/students', studentData));
  },

  update: async (admissionNumber: string, studentData: Partial<StudentForm>): Promise<ApiResponse<Student>> => {
    // Handle file upload for photo
    if (studentData.photo) {
      const formData = new FormData();
      Object.keys(studentData).forEach((key) => {
        if (key === 'feeDetails') {
          formData.append('feeDetails', JSON.stringify(studentData.feeDetails));
        } else if (key === 'photo') {
          formData.append('photo', studentData.photo!);
        } else {
          formData.append(key, (studentData as any)[key]);
        }
      });

      return apiWrapper(() => 
        api.put(`/students/${admissionNumber}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
    }

    return apiWrapper(() => api.put(`/students/${admissionNumber}`, studentData));
  },

  delete: async (admissionNumber: string): Promise<ApiResponse<void>> => {
    return apiWrapper(() => api.delete(`/students/${admissionNumber}`));
  },

  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiWrapper(() => api.get('/students/stats/dashboard'));
  },
};

// Marksheets API
export const marksheetsAPI = {
  getAll: async (): Promise<ApiResponse<Marksheet[]>> => {
    return apiWrapper(() => api.get('/marksheets'));
  },

  getByRollNumber: async (rollNumber: string): Promise<ApiResponse<Marksheet>> => {
    return apiWrapper(() => api.get(`/marksheets/${rollNumber}`));
  },

  getByClass: async (classNumber: string): Promise<ApiResponse<Marksheet[]>> => {
    return apiWrapper(() => api.get(`/marksheets/class/${classNumber}`));
  },

  create: async (marksheetData: MarksheetForm): Promise<ApiResponse<Marksheet>> => {
    return apiWrapper(() => api.post('/marksheets', marksheetData));
  },

  update: async (rollNumber: string, marksheetData: Partial<MarksheetForm>): Promise<ApiResponse<Marksheet>> => {
    return apiWrapper(() => api.put(`/marksheets/${rollNumber}`, marksheetData));
  },

  delete: async (rollNumber: string): Promise<ApiResponse<void>> => {
    return apiWrapper(() => api.delete(`/marksheets/${rollNumber}`));
  },
};

// Settings API
export const settingsAPI = {
  get: async (): Promise<ApiResponse<any>> => {
    return apiWrapper(() => api.get('/settings'));
  },

  update: async (settingsData: any): Promise<ApiResponse<any>> => {
    return apiWrapper(() => api.put('/settings', settingsData));
  },
};

// Fee Deposits API
export const feeDepositsAPI = {
  getAll: async (params?: any): Promise<ApiResponse<any[]>> => {
    return apiWrapper(() => api.get('/fee-deposits', { params }));
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    return apiWrapper(() => api.get(`/fee-deposits/${id}`));
  },

  create: async (depositData: any): Promise<ApiResponse<any>> => {
    return apiWrapper(() => api.post('/fee-deposits', depositData));
  },

  update: async (id: string, depositData: any): Promise<ApiResponse<any>> => {
    return apiWrapper(() => api.put(`/fee-deposits/${id}`, depositData));
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiWrapper(() => api.delete(`/fee-deposits/${id}`));
  },

  getByStudent: async (admissionNumber: string): Promise<ApiResponse<any[]>> => {
    return apiWrapper(() => api.get(`/fee-deposits/student/${admissionNumber}`));
  },
};

// Class Fees API
export const classFeesAPI = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    return apiWrapper(() => api.get('/class-fees'));
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    return apiWrapper(() => api.get(`/class-fees/${id}`));
  },

  create: async (data: any): Promise<ApiResponse<any>> => {
    return apiWrapper(() => api.post('/class-fees', data));
  },

  update: async (id: string, data: any): Promise<ApiResponse<any>> => {
    return apiWrapper(() => api.put(`/class-fees/${id}`, data));
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiWrapper(() => api.delete(`/class-fees/${id}`));
  },

  applyToStudents: async (id: string): Promise<ApiResponse<void>> => {
    return apiWrapper(() => api.post(`/class-fees/${id}/apply-to-students`));
  },
};

// Marks API
export const marksAPI = {
  add: async (data: any): Promise<ApiResponse<any>> => {
    return apiWrapper(() => api.post('/marks/add', data));
  },

  getByAdmissionNumber: async (admissionNumber: string): Promise<ApiResponse<any>> => {
    return apiWrapper(() => api.get(`/marks/${admissionNumber}`));
  },

  getByClass: async (className: string): Promise<ApiResponse<any>> => {
    return apiWrapper(() => api.get(`/marks/class/${className}`));
  },

  getSubjects: async (): Promise<ApiResponse<any[]>> => {
    return apiWrapper(() => api.get('/marks/subjects/list'));
  },
};

export default api;
