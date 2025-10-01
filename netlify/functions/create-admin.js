const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Admin Schema
const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

exports.handler = async (event, context) => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: 'MONGODB_URI not configured' })
      };
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: 'Admin already exists',
          admin: {
            name: existingAdmin.name,
            email: existingAdmin.email
          }
        })
      };
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const admin = new Admin({
      name: 'Admin User',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Admin created successfully',
        admin: {
          name: admin.name,
          email: admin.email
        }
      })
    };
  } catch (error) {
    console.error('Create admin error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Error creating admin',
        error: error.message
      })
    };
  }
};
