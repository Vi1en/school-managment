const mongoose = require('mongoose');

exports.handler = async (event, context) => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'No MongoDB URI configured',
          database: 'Not connected',
          using: 'Mock data (Simple API)',
          note: 'App is working with mock data'
        })
      };
    }

    // Try to connect to MongoDB
    try {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'MongoDB connected successfully',
          database: 'Connected',
          using: 'Real database',
          uri: mongoUri.substring(0, 20) + '...' // Hide sensitive info
        })
      };
    } catch (error) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'MongoDB connection failed',
          database: 'Not connected',
          using: 'Mock data (Simple API)',
          error: error.message,
          note: 'App is working with mock data'
        })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        status: 'Error checking database',
        database: 'Unknown',
        using: 'Mock data (Simple API)',
        error: error.message
      })
    };
  }
};
