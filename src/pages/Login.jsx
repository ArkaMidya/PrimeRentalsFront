import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaGoogle, FaFacebook, FaArrowRight } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-split-container animate-fade-in">
      {/* Brand Sidebar - Hidden on Mobile */}
      <div className="auth-sidebar">
        <div className="auth-sidebar-content">
          <Link to="/" className="logo-text">LUXE DRIVE</Link>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', lineHeight: '1.2', marginBottom: '1.5rem', fontWeight: '800' }}>
            Drive the <span style={{ color: 'var(--secondary)' }}>Future</span> Today.
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
            Experience the ultimate freedom with our premium fleet. Login to access exclusive luxury vehicles and seamless booking experiences.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="auth-form-side">
        <div className="auth-glass-card">
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Welcome Back</div>
          </div>

          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem', fontWeight: '800' }}>Sign In</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>Enter credentials to continue.</p>

          {error && (
            <div className="badge-danger" style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
                <FaEnvelope style={{ color: 'var(--primary)' }} /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="form-control"
                style={{ background: 'rgba(255,255,255,0.05)', height: '48px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
                <FaLock style={{ color: 'var(--primary)' }} /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="form-control"
                style={{ background: 'rgba(255,255,255,0.05)', height: '48px' }}
              />
            </div>
            
            <div style={{ textAlign: 'right', marginBottom: '1.8rem', marginTop: '-0.8rem' }}>
              <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600' }}>Forgot password?</Link>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px', borderRadius: '14px', fontSize: '1.1rem', fontWeight: '700' }}>
              Login Now <FaArrowRight style={{ marginLeft: '0.75rem' }} />
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
            New here? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '700' }}>Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
