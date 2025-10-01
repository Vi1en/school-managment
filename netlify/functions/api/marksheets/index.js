const { connectDB } = require('../../utils/db');

// Simple in-memory storage for demo
let marksheets = [];

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
      // Get all marksheets
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(marksheets)
      };
    }

    if (event.httpMethod === 'POST') {
      // Create new marksheet
      const marksheetData = JSON.parse(event.body);
      
      const newMarksheet = {
        _id: (marksheets.length + 1).toString(),
        ...marksheetData,
        createdAt: new Date().toISOString(),
        totalMarks: 0,
        percentage: 0,
        overallGrade: 'F',
        rank: 1,
        promotionStatus: 'Promoted'
      };

      // Calculate total marks and percentage
      if (marksheetData.subjects && Array.isArray(marksheetData.subjects)) {
        const totalMarks = marksheetData.subjects.reduce((sum, subject) => {
          return sum + (parseInt(subject.marks) || 0);
        }, 0);
        
        newMarksheet.totalMarks = totalMarks;
        newMarksheet.percentage = Math.round((totalMarks / (marksheetData.subjects.length * 100)) * 100);
        
        // Simple grade calculation
        if (newMarksheet.percentage >= 90) newMarksheet.overallGrade = 'A+';
        else if (newMarksheet.percentage >= 80) newMarksheet.overallGrade = 'A';
        else if (newMarksheet.percentage >= 70) newMarksheet.overallGrade = 'B+';
        else if (newMarksheet.percentage >= 60) newMarksheet.overallGrade = 'B';
        else if (newMarksheet.percentage >= 50) newMarksheet.overallGrade = 'C';
        else if (newMarksheet.percentage >= 40) newMarksheet.overallGrade = 'D';
        else newMarksheet.overallGrade = 'F';
      }

      marksheets.push(newMarksheet);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newMarksheet)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Marksheets API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Server error', error: error.message })
    };
  }
};
