import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    adminName: '',
    adminPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { adminRegister } = useAuth();
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

    if (formData.adminPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await adminRegister({
      adminName: formData.adminName,
      adminPassword: formData.adminPassword
    });
    
    if (result.success) {
      toast.success('Admin registration successful!');
      navigate('/admin-dashboard');
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>FinWise</h1>
          <p>Create your admin account.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Admin Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an admin account? 
            <Link to="/login" className="auth-link"> Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
