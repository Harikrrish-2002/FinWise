import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    adminName: '',
    adminPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let result;
    if (isAdminLogin) {
      result = await adminLogin(formData.adminName, formData.adminPassword);
      if (result.success) {
        toast.success('Admin login successful!');
        navigate('/admin-dashboard');
      } else {
        toast.error(result.error);
      }
    } else {
      result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.error);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>FinWise</h1>
          <p>Welcome back! Please sign in to your account.</p>
        </div>

        <div className="login-type-toggle">
          <button 
            type="button"
            className={`toggle-btn ${!isAdminLogin ? 'active' : ''}`}
            onClick={() => setIsAdminLogin(false)}
          >
            User Login
          </button>
          <button 
            type="button"
            className={`toggle-btn ${isAdminLogin ? 'active' : ''}`}
            onClick={() => setIsAdminLogin(true)}
          >
            Admin Login
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isAdminLogin ? (
            <>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="adminName">Admin Name</label>
                <input
                  type="text"
                  id="adminName"
                  name="adminName"
                  className="form-control"
                  value={formData.adminName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="adminPassword">Admin Password</label>
                <input
                  type="password"
                  id="adminPassword"
                  name="adminPassword"
                  className="form-control"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          {!isAdminLogin ? (
            <p>
              Don't have an account? 
              <Link to="/register" className="auth-link"> Create one here</Link>
            </p>
          ) : (
            <p>
              Need admin access? 
              <Link to="/admin-register" className="auth-link"> Register as admin</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
