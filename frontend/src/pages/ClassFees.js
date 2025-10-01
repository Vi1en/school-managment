import React, { useState, useEffect } from 'react';
import { classFeesAPI } from '../services/api';

const ClassFees = () => {
  const [classFees, setClassFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    className: '',
    totalFees: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchClassFees();
  }, []);

  const fetchClassFees = async () => {
    try {
      setLoading(true);
      const response = await classFeesAPI.getAll();
      setClassFees(response.data);
    } catch (error) {
      console.error('Error fetching class fees:', error);
      setError('Failed to fetch class fees');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const data = {
        ...formData,
        totalFees: parseFloat(formData.totalFees)
      };

      if (editingClass) {
        await classFeesAPI.update(editingClass._id, data);
        setSuccess('Class fee updated successfully');
      } else {
        await classFeesAPI.create(data);
        setSuccess('Class fee created successfully');
      }

      setFormData({ className: '', totalFees: '', description: '' });
      setShowForm(false);
      setEditingClass(null);
      fetchClassFees();
    } catch (error) {
      console.error('Error saving class fee:', error);
      setError(error.response?.data?.message || 'Failed to save class fee');
    }
  };

  const handleEdit = (classFee) => {
    setEditingClass(classFee);
    setFormData({
      className: classFee.className,
      totalFees: classFee.totalFees.toString(),
      description: classFee.description
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class fee?')) {
      try {
        await classFeesAPI.delete(id);
        setSuccess('Class fee deleted successfully');
        fetchClassFees();
      } catch (error) {
        console.error('Error deleting class fee:', error);
        setError('Failed to delete class fee');
      }
    }
  };

  const handleApplyToStudents = async (id) => {
    try {
      const response = await classFeesAPI.applyToStudents(id);
      setSuccess(response.data.message);
    } catch (error) {
      console.error('Error applying class fee to students:', error);
      setError('Failed to apply class fee to students');
    }
  };

  const resetForm = () => {
    setFormData({ className: '', totalFees: '', description: '' });
    setEditingClass(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-black">Class Fees Management</h1>
              <p className="mt-1 text-sm text-gray-600">Set and manage fees for each class</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Class Fee
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Class Fees Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-black">Class Fees</h2>
            <p className="text-sm text-gray-600">Manage fees for each class</p>
          </div>
          
          {classFees.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No class fees found</h3>
              <p className="text-gray-600 mb-4">Get started by adding fees for your classes.</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Add First Class Fee
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Fees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classFees.map((classFee) => (
                    <tr key={classFee._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">{classFee.className}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₹{classFee.totalFees ? classFee.totalFees.toLocaleString() : '0'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{classFee.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          classFee.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {classFee.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(classFee)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleApplyToStudents(classFee._id)}
                          className="text-green-600 hover:text-green-900 transition-colors duration-200"
                        >
                          Apply to Students
                        </button>
                        <button
                          onClick={() => handleDelete(classFee._id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={resetForm}></div>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit} className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        {editingClass ? 'Edit Class Fee' : 'Add New Class Fee'}
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="form-label">Class Name</label>
                          <input
                            type="text"
                            name="className"
                            value={formData.className}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="e.g., 10th, 12th, A1, B1"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="form-label">Total Fees (₹)</label>
                          <input
                            type="number"
                            name="totalFees"
                            value={formData.totalFees}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Enter total fees for this class"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="form-label">Description (Optional)</label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="form-input"
                            rows="3"
                            placeholder="Add any additional details about this class fee"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="btn-primary sm:ml-3"
                    >
                      {editingClass ? 'Update Class Fee' : 'Create Class Fee'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassFees;
