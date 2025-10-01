const { connectDB } = require('../../utils/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Simple in-memory admin for demo
const admin = {
  email: 'admin@test.com',
  password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
  id: '1'
};

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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Email and password are required' })
      };
    }

    // Check credentials
    if (email === admin.email) {
      const isValidPassword = await bcrypt.compare(password, admin.password);
      
      if (isValidPassword) {
        const token = jwt.sign(
          { id: admin.id, email: admin.email },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            message: 'Login successful',
            token,
            admin: {
              id: admin.id,
              email: admin.email
            }
          })
        };
      }
    }

    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ message: 'Invalid credentials' })
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Server error' })
    };
  }
};
