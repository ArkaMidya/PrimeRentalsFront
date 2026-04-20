import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Customer'); // Default role
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { sendRegisterOtp, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await sendRegisterOtp(email);
      setMessage('OTP has been sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(name, email, password, role, otp);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container animate-fade-in">
      {/* Brand Sidebar - Hidden on Mobile */}
      <div className="auth-sidebar">
        <div className="auth-sidebar-content">
          <Link to="/" className="logo-text">LUXE DRIVE</Link>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', lineHeight: '1.2', marginBottom: '1.5rem', fontWeight: '800' }}>
            Begin Your <span style={{ color: 'var(--secondary)' }}>Journey</span>.
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
            Join our exclusive community of travelers. Access our premium fleet with a single account and experience the road like never before.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="auth-form-side">
        <div className="auth-glass-card">
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {step === 1 ? 'Step 1: Details' : 'Step 2: Verification'}
            </div>
          </div>

          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem', fontWeight: '800' }}>
            {step === 1 ? 'Create Account' : 'Verify Email'}
          </h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {step === 1 ? 'Enter your details to get started.' : 'A 6-digit code has been sent.'}
          </p>

          {error && (
            <div className="badge-danger" style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          {message && (
            <div className="badge-success" style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
              {message}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp}>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: '600' }}>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="form-control" style={{ background: 'rgba(255,255,255,0.05)', height: '48px' }} disabled={loading} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: '600' }}>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-control" style={{ background: 'rgba(255,255,255,0.05)', height: '48px' }} disabled={loading} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.8rem' }}>
                <label className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: '600' }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="form-control" style={{ background: 'rgba(255,255,255,0.05)', height: '48px' }} disabled={loading} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px', borderRadius: '14px', fontSize: '1.1rem', fontWeight: '700' }} disabled={loading}>
                {loading ? 'Sending OTP...' : 'Get Started'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.8rem', fontWeight: '600', textAlign: 'center', display: 'block' }}>Enter Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  required
                  maxLength="6"
                  className="form-control"
                  style={{ height: '55px', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '8px', background: 'rgba(255,255,255,0.05)' }}
                  disabled={loading}
                  placeholder="000000"
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px', borderRadius: '14px', fontSize: '1.1rem', fontWeight: '700' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Register'}
              </button>
              <button type="button" className="btn btn-outline" style={{ width: '100%', height: '48px', marginTop: '1rem', border: 'none' }} onClick={() => setStep(1)} disabled={loading}>
                Edit Details
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
            Joined us before? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
