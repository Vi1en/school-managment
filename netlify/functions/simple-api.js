exports.handler = async (event, context) => {
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

  const path = event.path;
  const method = event.httpMethod;

  // Health check
  if (path === '/api/health' && method === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Simple API is running',
        path: '/api/health',
        timestamp: new Date().toISOString()
      })
    };
  }

  // Mock login for testing
  if (path === '/api/auth/login' && method === 'POST') {
    const body = event.body ? JSON.parse(event.body) : {};
    const { email, password } = body;

    if (email === 'admin@test.com' && password === 'password123') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Login successful',
          token: 'mock-jwt-token',
          admin: {
            id: 'mock-admin-id',
            name: 'Admin User',
            email: 'admin@test.com',
            role: 'admin'
          }
        })
      };
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Invalid credentials'
        })
      };
    }
  }

  // Mock students endpoint
  if (path === '/api/students' && method === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify([
        {
          _id: 'mock-student-1',
          admissionNumber: '001',
          studentName: 'John Doe',
          currentClass: '10th',
          bloodGroup: 'A+',
          feeDetails: {
            totalFee: 5000,
            amountPaid: 3000,
            remainingAmount: 2000
          }
        }
      ])
    };
  }

  // Mock dashboard stats
  if (path === '/api/students/stats/dashboard' && method === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        totalStudents: 5,
        paidStudents: 2,
        partialPaidStudents: 2,
        unpaidStudents: 1,
        failedStudents: 0,
        passedStudents: 0,
        graduatedStudents: 0,
        averageAttendance: 85,
        feeStats: {
          totalCollected: 15000,
          totalPending: 10000
        }
      })
    };
  }

  // Mock marksheets endpoint
  if (path === '/api/marksheets' && method === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify([
        {
          _id: 'mock-marksheet-1',
          rollNumber: '001',
          studentName: 'John Doe',
          examType: 'Half Yearly',
          academicYear: '2024-25',
          percentage: 85.5,
          promotionStatus: 'Promoted'
        }
      ])
    };
  }

  if (path === '/api/marksheets' && method === 'POST') {
    const body = event.body ? JSON.parse(event.body) : {};
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: 'Marksheet created successfully (mock)',
        marksheet: {
          ...body,
          _id: 'mock-marksheet-' + Date.now(),
          createdAt: new Date().toISOString()
        }
      })
    };
  }

  // Default response
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({
      message: 'Route not found',
      path: path,
      method: method
    })
  };
};
