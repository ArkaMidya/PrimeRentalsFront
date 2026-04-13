import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/ForgotPassword';
import RefundPage from './pages/RefundPage';

const PrivateRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="app-wrapper flex-col">
      <Navbar />
      <div className="main-content">
        <div className="container animate-fade-in">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Render Landing Page globally */}
            <Route path="/" element={<LandingPage />} />

            <Route path="/admin/*" element={
              <PrivateRoute role="Admin">
                <AdminDashboard />
              </PrivateRoute>
            } />

            <Route path="/admin/refund/:bookingId" element={
              <PrivateRoute role="Admin">
                <RefundPage />
              </PrivateRoute>
            } />

            <Route path="/customer/*" element={
              <PrivateRoute role="Customer">
                <CustomerDashboard />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
