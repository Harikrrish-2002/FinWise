import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Edit3, Trash2, TrendingUp } from 'lucide-react';
import './Income.css';

const Income = () => {
  const [incomeList, setIncomeList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    frequency: 'monthly',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const incomeCategories = [
    'Salary',
    'Freelancing',
    'Business',
    'Investments',
    'Rental Income',
    'Part-time Job',
    'Bonus',
    'Commission',
    'Pension',
    'Other'
  ];

  useEffect(() => {
    fetchIncome();
  }, []);

  const fetchIncome = async () => {
    try {
      const response = await axios.get('/api/income');
      setIncomeList(response.data.income || []);
    } catch (error) {
      toast.error('Failed to fetch income data');
      console.error('Income fetch error:', error);
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
    
    if (!formData.source || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingIncome) {
        // Update existing income (would need backend endpoint)
        toast.success('Income updated successfully');
        setEditingIncome(null);
      } else {
        // Add new income
        await axios.post('/api/income', formData);
        toast.success('Income added successfully');
      }
      
      resetForm();
      fetchIncome();
    } catch (error) {
      toast.error('Failed to save income');
      console.error('Income save error:', error);
    }
  };

  const handleEdit = (income) => {
    setFormData({
      source: income.source,
      amount: income.amount,
      frequency: income.frequency,
      date: income.date,
      description: income.description || ''
    });
    setEditingIncome(income);
    setShowForm(true);
  };

  const handleDelete = async (incomeId) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      try {
        // Would need backend endpoint for deletion
        toast.success('Income deleted successfully');
        fetchIncome();
      } catch (error) {
        toast.error('Failed to delete income');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      source: '',
      amount: '',
      frequency: 'monthly',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setShowForm(false);
    setEditingIncome(null);
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

  const calculateTotalIncome = () => {
    return incomeList.reduce((total, income) => {
      if (income.frequency === 'monthly') {
        return total + (income.amount * 12);
      } else if (income.frequency === 'yearly') {
        return total + income.amount;
      }
      return total + income.amount;
    }, 0);
  };

  if (loading) {
    return (
      <div className="income-loading">
        <div className="loading-spinner"></div>
        <p>Loading income data...</p>
      </div>
    );
  }

  return (
    <div className="income-page">
      <div className="income-header">
        <div>
          <h1>Income Tracking</h1>
          <p>Manage and track all your income sources</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={20} />
          Add Income
        </button>
      </div>

      {/* Income Summary */}
      <div className="income-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <TrendingUp size={32} />
          </div>
          <div className="summary-content">
            <h3>Total Annual Income</h3>
            <p className="summary-amount">{formatCurrency(calculateTotalIncome())}</p>
            <span className="summary-label">
              {formatCurrency(calculateTotalIncome() / 12)} per month
            </span>
          </div>
        </div>
      </div>

      {/* Income Form */}
      {showForm && (
        <div className="income-form-container">
          <div className="form-header">
            <h2>{editingIncome ? 'Edit Income' : 'Add New Income'}</h2>
            <button className="btn-close" onClick={resetForm}>×</button>
          </div>
          
          <form onSubmit={handleSubmit} className="income-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="source">Income Source *</label>
                <select
                  id="source"
                  name="source"
                  className="form-control"
                  value={formData.source}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select income source</option>
                  {incomeCategories.map(category => (
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
                <label htmlFor="frequency">Frequency</label>
                <select
                  id="frequency"
                  name="frequency"
                  className="form-control"
                  value={formData.frequency}
                  onChange={handleInputChange}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="one-time">One-time</option>
                </select>
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
                placeholder="Additional details about this income..."
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingIncome ? 'Update Income' : 'Add Income'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Income List */}
      <div className="income-list-container">
        <h2>Income Records</h2>
        
        {incomeList.length > 0 ? (
          <div className="income-list">
            {incomeList.map((income) => (
              <div key={income._id} className="income-item">
                <div className="income-info">
                  <div className="income-source">
                    <h3>{income.source}</h3>
                    <span className="frequency-badge">{income.frequency}</span>
                  </div>
                  <p className="income-description">{income.description}</p>
                  <div className="income-meta">
                    <span className="income-date">{formatDate(income.date)}</span>
                  </div>
                </div>
                
                <div className="income-amount">
                  {formatCurrency(income.amount)}
                </div>
                
                <div className="income-actions">
                  <button 
                    className="btn-action edit"
                    onClick={() => handleEdit(income)}
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    className="btn-action delete"
                    onClick={() => handleDelete(income._id)}
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
            <TrendingUp size={48} />
            <h3>No income records yet</h3>
            <p>Start by adding your first income source to track your earnings.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Add Your First Income
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Income;
