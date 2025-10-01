import React, { useState, useEffect } from 'react';
import { feeDepositsAPI, studentsAPI } from '../services/api';

const FeeDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState(null);
  const [formData, setFormData] = useState({
    admissionNumber: '',
    month: '',
    year: new Date().getFullYear().toString(),
    amount: '',
    paymentMethod: 'Cash',
    depositDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  useEffect(() => {
    fetchDeposits();
    fetchStudents();
  }, []);

  const fetchDeposits = async () => {
    try {
      const response = await feeDepositsAPI.getAll();
      // Handle both array response and paginated response
      const depositsData = response.data.deposits || response.data;
      setDeposits(Array.isArray(depositsData) ? depositsData : []);
    } catch (err) {
      setError('Error fetching fee deposits');
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      // Handle both array response and paginated response
      const studentsData = response.data.students || response.data;
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (err) {
      setError('Error fetching students');
      setStudents([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingDeposit) {
        await feeDepositsAPI.update(editingDeposit._id, formData);
      } else {
        await feeDepositsAPI.create(formData);
      }
      
      setFormData({
        studentAdmissionNumber: '',
        amount: '',
        depositDate: new Date().toISOString().split('T')[0],
        remarks: ''
      });
      setShowForm(false);
      setEditingDeposit(null);
      fetchDeposits();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving fee deposit');
    }
  };

  const handleEdit = (deposit) => {
    setEditingDeposit(deposit);
    setFormData({
      admissionNumber: deposit.admissionNumber || '',
      month: deposit.month || '',
      year: deposit.year?.toString() || new Date().getFullYear().toString(),
      amount: deposit.amount,
      paymentMethod: deposit.paymentMethod || 'Cash',
      depositDate: deposit.depositDate ? new Date(deposit.depositDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      remarks: deposit.remarks || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee deposit?')) {
      try {
        await feeDepositsAPI.delete(id);
        fetchDeposits();
      } catch (err) {
        setError('Error deleting fee deposit');
      }
    }
  };

  const getStudentName = (studentId) => {
    // If studentId is already populated with student data
    if (studentId && typeof studentId === 'object' && studentId.studentName) {
      return `${studentId.studentName} (${studentId.admissionNumber})`;
    }
    
    // If studentId is just an ID, find it in the students array
    const student = students.find(s => s._id === studentId);
    return student ? `${student.studentName} (${student.admissionNumber})` : 'Unknown Student';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading fee deposits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fee Deposits</h1>
          <p className="mt-2 text-gray-600">Manage monthly fee deposits for students</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Fee Deposits</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {showForm ? 'Cancel' : 'Add New Deposit'}
              </button>
            </div>
          </div>

          {showForm && (
            <div className="px-6 py-4 border-b border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student</label>
                    <select
                      name="admissionNumber"
                      value={formData.admissionNumber}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Student</option>
                      {students.map(student => (
                        <option key={student._id} value={student.admissionNumber}>
                          {student.studentName} ({student.admissionNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Month</label>
                    <select
                      name="month"
                      value={formData.month}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Month</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      min="2020"
                      max="2030"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Online">Online</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Deposit Date</label>
                    <input
                      type="date"
                      name="depositDate"
                      value={formData.depositDate}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Remarks</label>
                    <input
                      type="text"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      placeholder="Optional remarks"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingDeposit(null);
                      setFormData({
                        admissionNumber: '',
                        month: '',
                        year: new Date().getFullYear().toString(),
                        amount: '',
                        paymentMethod: 'Cash',
                        depositDate: new Date().toISOString().split('T')[0],
                        remarks: ''
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingDeposit ? 'Update Deposit' : 'Add Deposit'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month/Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No fee deposits found
                    </td>
                  </tr>
                ) : (
                  deposits.map((deposit) => (
                    <tr key={deposit._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getStudentName(deposit.studentId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deposit.month} {deposit.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{deposit.amount ? deposit.amount.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deposit.paymentMethod || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deposit.depositDate ? new Date(deposit.depositDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(deposit)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(deposit._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeDeposits;
