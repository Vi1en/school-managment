const mongoose = require('mongoose');

exports.handler = async (event, context) => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'MONGODB_URI not configured',
          hasUri: false
        })
      };
    }

    // Try to connect to MongoDB
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
        message: 'MongoDB connection successful',
        hasUri: true,
        uriLength: mongoUri.length
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'MongoDB connection failed',
        message: error.message,
        hasUri: !!process.env.MONGODB_URI
      })
    };
  }
};
