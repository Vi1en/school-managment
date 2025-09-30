#!/bin/bash

echo "🚀 Setting up School Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB or use MongoDB Atlas."
    echo "   For local installation: https://docs.mongodb.com/manual/installation/"
fi

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "🔧 Creating environment files..."

# Create backend .env file
cd ../backend
if [ ! -f .env ]; then
    cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school_management
JWT_SECRET=your_jwt_secret_key_here_change_in_production_$(date +%s)
PASS_PERCENTAGE=40
EOF
    echo "✅ Created backend/.env file"
else
    echo "⚠️  backend/.env already exists"
fi

# Create frontend .env file
cd ../frontend
if [ ! -f .env ]; then
    cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000/api
EOF
    echo "✅ Created frontend/.env file"
else
    echo "⚠️  frontend/.env already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Start MongoDB (if running locally):"
echo "   mongod"
echo ""
echo "2. Start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "3. Start the frontend server (in a new terminal):"
echo "   cd frontend && npm start"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "Default admin credentials:"
echo "Email: admin@school.com"
echo "Password: admin123"
echo ""
echo "Happy coding! 🎓"
