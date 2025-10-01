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

  // Handle different routes
  const path = event.path;
  
  if (path === '/api/health') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        mongodb: 'checking...'
      })
    };
  }

  if (path === '/api/debug') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Debug info',
        hasMongoUri: !!process.env.MONGODB_URI,
        mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
        nodeEnv: process.env.NODE_ENV
      })
    };
  }

  // Default response
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'School Management API is running',
      path: path
    })
  };
};