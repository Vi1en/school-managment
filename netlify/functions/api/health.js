const { connectDB } = require('../utils/db');

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
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        mongodb: 'connected'
      })
    };
  } catch (error) {
    console.error('Health check error:', error);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        mongodb: 'disconnected',
        error: error.message
      })
    };
  }
};
