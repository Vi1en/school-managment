const { connectDB } = require('../../utils/db');

// Simple in-memory storage for demo
let students = [
  {
    _id: '1',
    admissionNumber: '001',
    studentName: 'John Doe',
    currentClass: '10th',
    fatherName: 'Robert Doe',
    motherName: 'Jane Doe',
    dob: '2005-01-15',
    bloodGroup: 'A+',
    address: '123 Main St',
    phoneNumber: '1234567890',
    feeDetails: {
      totalFee: 50000,
      amountPaid: 25000,
      remainingAmount: 25000
    },
    photo: null,
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    admissionNumber: '002',
    studentName: 'Jane Smith',
    currentClass: '9th',
    fatherName: 'Mike Smith',
    motherName: 'Sarah Smith',
    dob: '2006-03-20',
    bloodGroup: 'B+',
    address: '456 Oak Ave',
    phoneNumber: '0987654321',
    feeDetails: {
      totalFee: 45000,
      amountPaid: 45000,
      remainingAmount: 0
    },
    photo: null,
    createdAt: new Date().toISOString()
  }
];

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    await connectDB();

    if (event.httpMethod === 'GET') {
      // Get all students
      const page = parseInt(event.queryStringParameters?.page) || 1;
      const limit = parseInt(event.queryStringParameters?.limit) || 10;
      const search = event.queryStringParameters?.search || '';

      let filteredStudents = students;
      if (search) {
        filteredStudents = students.filter(student =>
          student.studentName.toLowerCase().includes(search.toLowerCase()) ||
          student.admissionNumber.includes(search)
        );
      }

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          students: paginatedStudents,
          total: filteredStudents.length,
          page,
          limit,
          totalPages: Math.ceil(filteredStudents.length / limit)
        })
      };
    }

    if (event.httpMethod === 'POST') {
      // Create new student
      const studentData = JSON.parse(event.body);
      
      const newStudent = {
        _id: (students.length + 1).toString(),
        ...studentData,
        createdAt: new Date().toISOString()
      };

      students.push(newStudent);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newStudent)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Students API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Server error', error: error.message })
    };
  }
};
