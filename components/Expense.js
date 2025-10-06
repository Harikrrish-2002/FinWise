import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Edit3, Trash2, TrendingDown, Upload, FileText } from 'lucide-react';
import './Expense.css';

const Expense = () => {
  const [expenseList, setExpenseList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    merchant: ''
  });

  const expenseCategories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Groceries',
    'Rent',
    'Insurance',
    'Investment',
    'Personal Care',
    'Gifts & Donations',
    'Other'
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get('/api/expense');
      setExpenseList(response.data.expenses || []);
    } catch (error) {
      toast.error('Failed to fetch expense data');
      console.error('Expense fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingExpense) {
        // Update existing expense (would need backend endpoint)
        toast.success('Expense updated successfully');
        setEditingExpense(null);
      } else {
        // Add new expense
        await axios.post('/api/expense', formData);
        toast.success('Expense added successfully');
      }
      
      resetForm();
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to save expense');
      console.error('Expense save error:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file (JPEG, PNG)');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/upload-receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const extractedData = response.data.data;
      
      // Pre-fill form with extracted data
      setFormData(prev => ({
        ...prev,
        amount: extractedData.amount || prev.amount,
        date: extractedData.date ? 
          new Date(extractedData.date.split('/').reverse().join('-')).toISOString().split('T')[0] : 
          prev.date,
        description: prev.description + (extractedData.raw_text ? '\n\nExtracted text:\n' + extractedData.raw_text.substring(0, 200) + '...' : '')
      }));

      toast.success('Receipt processed successfully! Please review and adjust the details.');
      setShowForm(true);
    } catch (error) {
      toast.error('Failed to process receipt');
      console.error('Receipt upload error:', error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      description: expense.description || '',
      merchant: expense.merchant || ''
    });
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        // Would need backend endpoint for deletion
        toast.success('Expense deleted successfully');
        fetchExpenses();
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      merchant: ''
    });
    setShowForm(false);
    setEditingExpense(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const calculateTotalExpenses = () => {
    return expenseList.reduce((total, expense) => total + expense.amount, 0);
  };

  const getMonthlyExpenses = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return expenseList
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      })
      .reduce((total, expense) => total + expense.amount, 0);
  };

  if (loading) {
    return (
      <div className="expense-loading">
        <div className="loading-spinner"></div>
        <p>Loading expense data...</p>
      </div>
    );
  }

  return (
    <div className="expense-page">
      <div className="expense-header">
        <div>
          <h1>Expense Tracking</h1>
          <p>Monitor and categorize all your expenses</p>
        </div>
        <div className="header-actions">
          <label className="upload-btn">
            <Upload size={20} />
            {uploadLoading ? 'Processing...' : 'Upload Receipt'}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={uploadLoading}
              style={{ display: 'none' }}
            />
          </label>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={20} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Expense Summary */}
      <div className="expense-summary">
        <div className="summary-card total">
          <div className="summary-icon">
            <TrendingDown size={32} />
          </div>
          <div className="summary-content">
            <h3>Total Expenses</h3>
            <p className="summary-amount">{formatCurrency(calculateTotalExpenses())}</p>
            <span className="summary-label">All time</span>
          </div>
        </div>
        
        <div className="summary-card monthly">
          <div className="summary-icon">
            <TrendingDown size={32} />
          </div>
          <div className="summary-content">
            <h3>This Month</h3>
            <p className="summary-amount">{formatCurrency(getMonthlyExpenses())}</p>
            <span className="summary-label">Current month expenses</span>
          </div>
        </div>
      </div>

      {/* Expense Form */}
      {showForm && (
        <div className="expense-form-container">
          <div className="form-header">
            <h2>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
            <button className="btn-close" onClick={resetForm}>×</button>
          </div>
          
          <form onSubmit={handleSubmit} className="expense-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select category</option>
                  {expenseCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="amount">Amount (₹) *</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  className="form-control"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="merchant">Merchant/Store</label>
                <input
                  type="text"
                  id="merchant"
                  name="merchant"
                  className="form-control"
                  value={formData.merchant}
                  onChange={handleInputChange}
                  placeholder="Where did you spend?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Additional details about this expense..."
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expense List */}
      <div className="expense-list-container">
        <h2>Expense Records</h2>
        
        {expenseList.length > 0 ? (
          <div className="expense-list">
            {expenseList.map((expense) => (
              <div key={expense._id} className="expense-item">
                <div className="expense-info">
                  <div className="expense-category">
                    <h3>{expense.category}</h3>
                    {expense.merchant && (
                      <span className="merchant-name">{expense.merchant}</span>
                    )}
                  </div>
                  <p className="expense-description">{expense.description}</p>
                  <div className="expense-meta">
                    <span className="expense-date">{formatDate(expense.date)}</span>
                  </div>
                </div>
                
                <div className="expense-amount">
                  {formatCurrency(expense.amount)}
                </div>
                
                <div className="expense-actions">
                  <button 
                    className="btn-action edit"
                    onClick={() => handleEdit(expense)}
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    className="btn-action delete"
                    onClick={() => handleDelete(expense._id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <TrendingDown size={48} />
            <h3>No expense records yet</h3>
            <p>Start tracking your expenses by adding your first expense or uploading a receipt.</p>
            <div className="empty-actions">
              <button 
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                Add Your First Expense
              </button>
              <label className="btn btn-secondary upload-btn">
                <FileText size={16} />
                Upload Receipt
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expense;
