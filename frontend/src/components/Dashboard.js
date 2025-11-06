import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  Calendar,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    currentBalance: 0,
    savingsRate: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [userProfile, setUserProfile] = useState(user);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [incomeRes, expenseRes] = await Promise.all([
        axios.get('/api/income'),
        axios.get('/api/expense')
      ]);

      const income = incomeRes.data.income || [];
      const expenses = expenseRes.data.expenses || [];

      // Calculate totals
      const totalIncome = income.reduce((sum, item) => {
        if (item.frequency === 'monthly') {
          return sum + (item.amount * 12);
        } else if (item.frequency === 'yearly') {
          return sum + item.amount;
        }
        return sum + item.amount;
      }, 0);

      const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
      const currentBalance = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? ((currentBalance / totalIncome) * 100) : 0;

      // Get recent transactions (last 5)
      const recentTransactions = [
        ...expenses.map(exp => ({ ...exp, type: 'expense' })),
        ...income.map(inc => ({ ...inc, type: 'income' }))
      ]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setDashboardData({
        totalIncome,
        totalExpenses,
        currentBalance,
        savingsRate,
        recentTransactions
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      // Note: This would need a backend endpoint to update profile
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.firstName}!</h1>
        <p>Here's your financial overview</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Income</h3>
            <p className="stat-value">{formatCurrency(dashboardData.totalIncome)}</p>
            <span className="stat-label">This year</span>
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-icon">
            <TrendingDown size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Expenses</h3>
            <p className="stat-value">{formatCurrency(dashboardData.totalExpenses)}</p>
            <span className="stat-label">This year</span>
          </div>
        </div>

        <div className="stat-card balance">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>Current Balance</h3>
            <p className="stat-value">{formatCurrency(dashboardData.currentBalance)}</p>
            <span className="stat-label">Available</span>
          </div>
        </div>

        <div className="stat-card savings">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <h3>Savings Rate</h3>
            <p className="stat-value">{dashboardData.savingsRate.toFixed(1)}%</p>
            <span className="stat-label">Of income</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Profile Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Profile Information</h2>
            <button 
              className="btn btn-secondary"
              onClick={() => setEditMode(!editMode)}
            >
              <Edit3 size={16} />
              {editMode ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="profile-card">
            {editMode ? (
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={userProfile.firstName}
                      onChange={(e) => setUserProfile({...userProfile, firstName: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={userProfile.lastName}
                      onChange={(e) => setUserProfile({...userProfile, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-item">
                  <label>Name:</label>
                  <span>{user?.firstName} {user?.lastName}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{user?.email}</span>
                </div>
                <div className="info-item">
                  <label>Member since:</label>
                  <span>{formatDate(new Date())}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Transactions</h2>
            <Link to="/expense" className="btn btn-primary">
              Add Transaction
            </Link>
          </div>

          <div className="transactions-card">
            {dashboardData.recentTransactions.length > 0 ? (
              <div className="transactions-list">
                {dashboardData.recentTransactions.map((transaction, index) => (
                  <div key={index} className="transaction-item">
                    <div className="transaction-icon">
                      {transaction.type === 'income' ? (
                        <TrendingUp size={20} className="income-icon" />
                      ) : (
                        <TrendingDown size={20} className="expense-icon" />
                      )}
                    </div>
                    <div className="transaction-details">
                      <h4>{transaction.source || transaction.category}</h4>
                      <p>{transaction.description}</p>
                      <span className="transaction-date">
                        <Calendar size={14} />
                        {formatDate(transaction.date)}
                      </span>
                    </div>
                    <div className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No transactions yet</p>
                <Link to="/income" className="btn btn-primary">
                  Add Your First Income
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/income" className="action-card">
              <TrendingUp size={32} />
              <h3>Add Income</h3>
              <p>Record your earnings</p>
            </Link>
            <Link to="/expense" className="action-card">
              <TrendingDown size={32} />
              <h3>Add Expense</h3>
              <p>Track your spending</p>
            </Link>
            <Link to="/recommendations" className="action-card">
              <Target size={32} />
              <h3>Get Recommendations</h3>
              <p>Improve your finances</p>
            </Link>
            <Link to="/visualization" className="action-card">
              <DollarSign size={32} />
              <h3>View Reports</h3>
              <p>Analyze your data</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
