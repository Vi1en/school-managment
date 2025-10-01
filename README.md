# School Management System

A comprehensive school management system built with React.js frontend and Node.js/Express backend with MongoDB database.

## Features

- **Student Management**: Add, edit, view, and manage student records
- **Fee Management**: Track class fees and individual fee deposits
- **Marksheet Generation**: Generate and manage student marksheets
- **Authentication**: Secure admin login system
- **Responsive Design**: Mobile-friendly interface
- **Photo Management**: Upload and display student photos
- **Blood Group Tracking**: Track student blood groups
- **Academic Records**: Manage academic performance and attendance

## Technology Stack

### Frontend
- React.js
- React Router
- Axios for API calls
- Custom CSS (no external UI libraries)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads

## Project Structure

```
school/
├── frontend/          # React.js frontend
│   ├── public/        # Static files
│   ├── src/           # Source code
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── contexts/      # React contexts
│   └── package.json
├── backend/           # Node.js backend
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   └── server.js      # Main server file
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp config.env.example config.env
```

4. Update `config.env` with your MongoDB URI and JWT secret:
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
```

5. Start the server:
```bash
npm start
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Usage

1. Open your browser and go to the deployed URL
2. Login with admin credentials
3. Navigate through the dashboard to manage students, fees, and marksheets

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Admin registration

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `GET /api/students/:admissionNumber` - Get student by admission number
- `PUT /api/students/:admissionNumber` - Update student
- `DELETE /api/students/:admissionNumber` - Delete student

### Marksheets
- `GET /api/marksheets` - Get all marksheets
- `POST /api/marksheets` - Create new marksheet
- `GET /api/marksheets/:rollNumber` - Get marksheet by roll number
- `PUT /api/marksheets/:rollNumber` - Update marksheet
- `DELETE /api/marksheets/:rollNumber` - Delete marksheet

## Deployment

### Option 1: Vercel (Recommended - Both Frontend & Backend)
1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy from project root:
```bash
cd /Applications/school
vercel
```

3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret
   - `JWT_EXPIRE` - 7d

### Option 2: Netlify + Railway
1. **Frontend (Netlify):**
   - Connect GitHub repository
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/build`

2. **Backend (Railway):**
   - Connect GitHub repository
   - Set environment variables
   - Deploy backend folder

### Option 3: Render (Both Frontend & Backend)
1. Create two services on Render:
   - **Web Service** for frontend
   - **Web Service** for backend
2. Connect GitHub repository for both
3. Set environment variables for backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.