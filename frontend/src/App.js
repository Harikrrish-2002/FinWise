import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import AdminRegister from './components/AdminRegister';
import AdminDashboard from './components/AdminDashboard';
import Dashboard from './components/Dashboard';
import Income from './components/Income';
import Expense from './components/Expense';
import Recommendations from './components/Recommendations';
import Visualization from './components/Visualization';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AdminProtectedRoute({ children }) {
  const { admin } = useAuth();
  return admin ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, admin } = useAuth();
  return !user && !admin ? children : <Navigate to={admin ? "/admin-dashboard" : "/dashboard"} />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            <Route 
              path="/admin-register" 
              element={
                <PublicRoute>
                  <AdminRegister />
                </PublicRoute>
              } 
            />
            <Route 
              path="/admin-dashboard" 
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/income" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Income />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/expense" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Expense />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recommendations" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Recommendations />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/visualization" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Visualization />
                  </Layout>
                </ProtectedRoute>
              } 
            />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
