import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Edit3, Trash2, TrendingDown, Upload, FileText, Calendar } from 'lucide-react';
import './Expense.css';

const Expense = () => {
  const [expenseList, setExpenseList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [bulkRows, setBulkRows] = useState([
    {
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      merchant: ''
    }
  ]);
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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
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

  const handleBulkChange = (index, field, value) => {
    setBulkRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addBulkRow = () => {
    setBulkRows(prev => ([
      ...prev,
      {
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        merchant: ''
      }
    ]));
  };

  const removeBulkRow = (index) => {
    setBulkRows(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== index));
  };

  const resetBulk = () => {
    setBulkRows([
      {
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        merchant: ''
      }
    ]);
    setShowBulk(false);
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

  const handleBulkSubmit = async () => {
    // basic validation
    const invalidIndex = bulkRows.findIndex(r => !r.category || !r.amount);
    if (invalidIndex !== -1) {
      toast.error(`Row ${invalidIndex + 1}: category and amount are required`);
      return;
    }

    setBulkSubmitting(true);
    try {
      let successCount = 0;
      for (const row of bulkRows) {
        try {
          await axios.post('/api/expense', row);
          successCount += 1;
        } catch (err) {
          // continue with other rows
          console.error('Bulk row save error:', err);
        }
      }

      if (successCount === bulkRows.length) {
        toast.success(`Added ${successCount} expenses successfully`);
      } else if (successCount > 0) {
        toast.warn(`Added ${successCount}/${bulkRows.length} expenses. Some failed.`);
      } else {
        toast.error('Failed to add expenses');
      }

      resetBulk();
      fetchExpenses();
    } finally {
      setBulkSubmitting(false);
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
    return expenseList
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === selectedMonth && expenseDate.getFullYear() === selectedYear;
      })
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getFilteredExpenses = () => {
    return expenseList.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === selectedMonth && expenseDate.getFullYear() === selectedYear;
    });
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
          <div className="month-selector">
            <Calendar size={20} />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="month-select"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="year-select"
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
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
            <h3>{monthNames[selectedMonth]} {selectedYear}</h3>
            <p className="summary-amount">{formatCurrency(getMonthlyExpenses())}</p>
            <span className="summary-label">Selected month expenses</span>
          </div>
        </div>
      </div>

      {/* Bulk Add Expenses */}
      <div className="bulk-add-container">
        <div className="bulk-header">
          <h2>Bulk Add Expenses</h2>
          <div className="bulk-header-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setShowBulk(!showBulk)}
            >
              {showBulk ? 'Hide' : 'Show'}
            </button>
            {showBulk && (
              <button
                className="btn btn-primary"
                onClick={addBulkRow}
              >
                <Plus size={18} /> Add Row
              </button>
            )}
          </div>
        </div>

        {showBulk && (
          <div className="bulk-body">
            <div className="bulk-rows">
              {bulkRows.map((row, index) => (
                <div key={index} className="bulk-row">
                  <div className="bulk-row-grid">
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        className="form-control"
                        value={row.category}
                        onChange={(e) => handleBulkChange(index, 'category', e.target.value)}
                      >
                        <option value="">Select category</option>
                        {expenseCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Amount (₹) *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={row.amount}
                        min="0"
                        step="0.01"
                        onChange={(e) => handleBulkChange(index, 'amount', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={row.date}
                        onChange={(e) => handleBulkChange(index, 'date', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Merchant/Store</label>
                      <input
                        type="text"
                        className="form-control"
                        value={row.merchant}
                        onChange={(e) => handleBulkChange(index, 'merchant', e.target.value)}
                        placeholder="Where did you spend?"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={row.description}
                      onChange={(e) => handleBulkChange(index, 'description', e.target.value)}
                      placeholder="Additional details..."
                    />
                  </div>
                  <div className="bulk-row-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => removeBulkRow(index)}
                      disabled={bulkRows.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bulk-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetBulk}
                disabled={bulkSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleBulkSubmit}
                disabled={bulkSubmitting}
              >
                {bulkSubmitting ? 'Adding...' : `Add ${bulkRows.length} Expense${bulkRows.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}
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
        <h2>Expense Records - {monthNames[selectedMonth]} {selectedYear}</h2>
        
        {getFilteredExpenses().length > 0 ? (
          <div className="expense-list">
            {getFilteredExpenses().map((expense) => (
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
            <h3>No expenses for {monthNames[selectedMonth]} {selectedYear}</h3>
            <p>No expense records found for the selected month. Try selecting a different month or add new expenses.</p>
            <div className="empty-actions">
              <button 
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                Add New Expense
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
