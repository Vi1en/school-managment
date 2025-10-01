// Global types and interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id?: string;
  _id?: string;
  admissionNumber: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  currentClass: string;
  bloodGroup: string;
  address: string;
  phoneNumber: string;
  photo?: string;
  feeDetails: FeeDetails;
  createdAt: string;
  updatedAt: string;
}

export interface FeeDetails {
  totalFee: number;
  amountPaid: number;
  remainingAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  marks: number;
  maxMarks: number;
}

export interface Marksheet {
  id: string;
  rollNumber: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  currentClass: string;
  bloodGroup: string;
  address: string;
  phoneNumber: string;
  photo?: string;
  examType: 'Half-Yearly' | 'Annual' | 'Quarterly';
  academicYear: string;
  subjects: Subject[];
  totalMarks: number;
  maxTotalMarks: number;
  percentage: number;
  rank?: number;
  promotionStatus: 'Promoted' | 'Not Promoted';
  createdAt: string;
  updatedAt: string;
}

export interface MarksData {
  [subjectName: string]: {
    UT1: number;
    UT2: number;
    UT3: number;
    UT4: number;
    halfYearly: number;
    annual: number;
    marks: number;
  };
}

export interface MarkInput {
  UT1: number;
  UT2: number;
  UT3: number;
  UT4: number;
  halfYearly: number;
  annual: number;
}

export interface SubjectMarksData {
  [subjectName: string]: MarkInput;
}

export interface DashboardStats {
  totalStudents: number;
  paidStudents: number;
  partialPaidStudents: number;
  unpaidStudents: number;
  failedStudents: number;
  passedStudents: number;
  graduatedStudents: number;
  averageAttendance: number;
  feeStats: {
    totalPaid: number;
    totalPending: number;
    totalFee: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface StudentForm {
  admissionNumber: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  currentClass: string;
  bloodGroup: string;
  address: string;
  phoneNumber: string;
  photo?: File;
  feeDetails: {
    totalFee: number;
    amountPaid: number;
  };
}

export interface MarksheetForm {
  examType: 'Half-Yearly' | 'Annual' | 'Quarterly';
  academicYear: string;
  generationMode: 'bulk' | 'individual';
  selectedClass?: string;
  selectedStudent?: string;
  subjects: Subject[];
  marksData: MarksData;
}

// UI Component types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  dataIndex: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sorter?: boolean;
  width?: string | number;
}

// Store types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface StudentsState {
  students: Student[];
  selectedStudent: Student | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationParams;
}

export interface MarksheetsState {
  marksheets: Marksheet[];
  selectedMarksheet: Marksheet | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationParams;
}

export interface UIState {
  sidebarOpen: boolean;
  isMobile: boolean;
  theme: 'light' | 'dark';
  loading: boolean;
  error: string | null;
}

// Hook types
export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}
