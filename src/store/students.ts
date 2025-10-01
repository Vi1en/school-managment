import { create } from 'zustand';
import { StudentsState, Student, PaginationParams, StudentForm } from '@/types';
import { studentsAPI } from '@/services/api';

interface StudentsActions {
  fetchStudents: (params?: PaginationParams) => Promise<void>;
  fetchStudentById: (id: string) => Promise<void>;
  createStudent: (studentData: StudentForm) => Promise<{ success: boolean; error?: string }>;
  updateStudent: (id: string, studentData: Partial<StudentForm>) => Promise<{ success: boolean; error?: string }>;
  deleteStudent: (id: string) => Promise<{ success: boolean; error?: string }>;
  searchStudents: (query: string) => Promise<void>;
  setSelectedStudent: (student: Student | null) => void;
  clearError: () => void;
  setPagination: (pagination: Partial<PaginationParams>) => void;
}

type StudentsStore = StudentsState & StudentsActions;

export const useStudentsStore = create<StudentsStore>((set, get) => ({
  // Initial state
  students: [],
  selectedStudent: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },

  // Actions
  fetchStudents: async (params?: PaginationParams) => {
    set({ isLoading: true, error: null });
    
    try {
      const currentPagination = get().pagination;
      const searchParams = { ...currentPagination, ...params };
      
      const response = await studentsAPI.getAll(searchParams);
      
      set({
        students: Array.isArray(response.data) ? response.data : (response.data as any).students || [],
        isLoading: false,
        pagination: searchParams,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch students',
      });
    }
  },

  fetchStudentById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await studentsAPI.getByAdmissionNumber(id);
      
      set({
        selectedStudent: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch student',
      });
    }
  },

  createStudent: async (studentData: StudentForm) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await studentsAPI.create(studentData);
      
      // Add new student to the list
      const newStudent = response.data;
      set((state) => ({
        students: [newStudent, ...state.students],
        isLoading: false,
      }));
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create student';
      set({
        isLoading: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },

  updateStudent: async (id: string, studentData: Partial<StudentForm>) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await studentsAPI.update(id, studentData);
      
      // Update student in the list
      const updatedStudent = response.data;
      set((state) => ({
        students: state.students.map((student) =>
          student.id === id ? updatedStudent : student
        ),
        selectedStudent: state.selectedStudent?.id === id ? updatedStudent : state.selectedStudent,
        isLoading: false,
      }));
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update student';
      set({
        isLoading: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },

  deleteStudent: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await studentsAPI.delete(id);
      
      // Remove student from the list
      set((state) => ({
        students: state.students.filter((student) => student.id !== id),
        selectedStudent: state.selectedStudent?.id === id ? null : state.selectedStudent,
        isLoading: false,
      }));
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete student';
      set({
        isLoading: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },

  searchStudents: async (query: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await studentsAPI.getAll({ search: query });
      
      set({
        students: Array.isArray(response.data) ? response.data : (response.data as any).students || [],
        isLoading: false,
        pagination: { ...get().pagination, search: query },
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to search students',
      });
    }
  },

  setSelectedStudent: (student: Student | null) => {
    set({ selectedStudent: student });
  },

  clearError: () => {
    set({ error: null });
  },

  setPagination: (pagination: Partial<PaginationParams>) => {
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    }));
  },
}));
