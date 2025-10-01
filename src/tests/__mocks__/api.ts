// Mock API responses for testing
export const mockStudents = [
  {
    id: '1',
    admissionNumber: '2024001',
    studentName: 'John Doe',
    fatherName: 'Robert Doe',
    motherName: 'Jane Doe',
    dob: '2010-05-15',
    currentClass: '10',
    bloodGroup: 'O+',
    address: '123 Main St, City',
    phoneNumber: '1234567890',
    photo: null,
    feeDetails: {
      totalFee: 50000,
      amountPaid: 50000,
      remainingAmount: 0,
      paymentStatus: 'paid',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    admissionNumber: '2024002',
    studentName: 'Jane Smith',
    fatherName: 'Michael Smith',
    motherName: 'Sarah Smith',
    dob: '2010-08-20',
    currentClass: '10',
    bloodGroup: 'A+',
    address: '456 Oak Ave, City',
    phoneNumber: '0987654321',
    photo: null,
    feeDetails: {
      totalFee: 50000,
      amountPaid: 25000,
      remainingAmount: 25000,
      paymentStatus: 'partial',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockMarksheets = [
  {
    id: '1',
    rollNumber: '2024001',
    studentName: 'John Doe',
    fatherName: 'Robert Doe',
    motherName: 'Jane Doe',
    dob: '2010-05-15',
    currentClass: '10',
    bloodGroup: 'O+',
    address: '123 Main St, City',
    phoneNumber: '1234567890',
    photo: null,
    examType: 'Half-Yearly',
    academicYear: '2024-25',
    subjects: [
      {
        id: '1',
        name: 'MATHEMATICS',
        code: '041',
        marks: 85,
        maxMarks: 100,
      },
      {
        id: '2',
        name: 'PHYSICS',
        code: '042',
        marks: 78,
        maxMarks: 100,
      },
    ],
    totalMarks: 163,
    maxTotalMarks: 200,
    percentage: 81.5,
    rank: 1,
    promotionStatus: 'Promoted',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockDashboardStats = {
  totalStudents: 150,
  paidStudents: 120,
  partialPaidStudents: 20,
  unpaidStudents: 10,
  failedStudents: 5,
  passedStudents: 145,
  graduatedStudents: 50,
  averageAttendance: 85,
  feeStats: {
    totalPaid: 6000000,
    totalPending: 500000,
    totalFee: 6500000,
  },
};

// Mock API functions
export const mockAPI = {
  students: {
    getAll: () => Promise.resolve({ success: true, data: mockStudents }),
    getByAdmissionNumber: (id: string) => 
      Promise.resolve({ 
        success: true, 
        data: mockStudents.find(s => s.admissionNumber === id) 
      }),
    create: (data: any) => Promise.resolve({ success: true, data: { ...data, id: 'new' } }),
    update: (id: string, data: any) => Promise.resolve({ success: true, data: { ...data, id } }),
    delete: (id: string) => Promise.resolve({ success: true }),
    getStats: () => Promise.resolve({ success: true, data: mockDashboardStats }),
  },
  marksheets: {
    getAll: () => Promise.resolve({ success: true, data: mockMarksheets }),
    getByRollNumber: (rollNumber: string) => 
      Promise.resolve({ 
        success: true, 
        data: mockMarksheets.find(m => m.rollNumber === rollNumber) 
      }),
    create: (data: any) => Promise.resolve({ success: true, data: { ...data, id: 'new' } }),
    update: (id: string, data: any) => Promise.resolve({ success: true, data: { ...data, id } }),
    delete: (id: string) => Promise.resolve({ success: true }),
  },
  auth: {
    login: (credentials: any) => 
      Promise.resolve({ 
        success: true, 
        data: { 
          user: { id: '1', name: 'Admin', email: credentials.email },
          token: 'mock-token'
        } 
      }),
    logout: () => Promise.resolve({ success: true }),
  },
};
