import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaKey, FaArrowRight } from 'react-icons/fa';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { sendForgotPasswordOtp, resetPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await sendForgotPasswordOtp(email);
      setMessage('OTP has been sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await resetPassword(email, otp, newPassword);
      setMessage('Password reset successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container animate-fade-in">
      <div className="auth-sidebar">
        <div className="auth-sidebar-content">
          <Link to="/" className="logo-text">LUXE DRIVE</Link>
          <h1 style={{ fontSize: '3.5rem', lineHeight: '1.2', marginBottom: '1.5rem', fontWeight: '800' }}>
            Regain <span style={{ color: 'var(--secondary)' }}>Access</span>.
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
            Follow the steps to securely reset your password. A verification token will be sent instantly.
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-glass-card">
          <h2 style={{ marginBottom: '0.25rem', fontSize: '1.8rem', fontWeight: '800' }}>Reset Password</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {step === 1 ? 'Enter your email address to get started.' : 'Enter your OTP and new password.'}
          </p>

          {error && (
            <div className="badge-danger" style={{ width: '100%', padding: '0.6rem', borderRadius: '12px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ background: 'green', color: 'white', padding: '0.6rem', borderRadius: '12px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
              {message}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} style={{ textAlign: 'left' }}>
              <div className="form-group" style={{ marginBottom: '1.4rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
                  <FaEnvelope style={{ color: 'var(--primary)' }} /> Registered Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="form-control"
                  style={{ background: 'rgba(255,255,255,0.05)', height: '48px', paddingLeft: '1rem' }}
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-glow" style={{ width: '100%', height: '52px', borderRadius: '14px', fontSize: '1.1rem', fontWeight: '700', marginTop: '0.5rem' }} disabled={loading}>
                {loading ? 'Sending Request...' : 'Send Verification OTP'} <FaArrowRight style={{ marginLeft: '0.75rem' }} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} style={{ textAlign: 'left' }}>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
                  <FaKey style={{ color: 'var(--primary)' }} /> 6-Digit OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  required
                  maxLength="6"
                  className="form-control"
                  style={{ background: 'rgba(255,255,255,0.05)', height: '48px', paddingLeft: '1rem', letterSpacing: '2px' }}
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.4rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
                  <FaLock style={{ color: 'var(--primary)' }} /> New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  className="form-control"
                  style={{ background: 'rgba(255,255,255,0.05)', height: '48px', paddingLeft: '1rem' }}
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-glow" style={{ width: '100%', height: '52px', borderRadius: '14px', fontSize: '1.1rem', fontWeight: '700', marginTop: '0.5rem' }} disabled={loading}>
                {loading ? 'Resetting Password...' : 'Reset My Password'} <FaArrowRight style={{ marginLeft: '0.75rem' }} />
              </button>
              
              <button type="button" className="btn btn-secondary" style={{ width: '100%', height: '52px', borderRadius: '14px', fontSize: '1rem', fontWeight: '700', marginTop: '0.8rem' }} onClick={() => setStep(1)} disabled={loading}>
                Back to Email
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '2.5rem', color: 'rgba(255,255,255,0.6)' }}>
            Remembered your info? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>Sign In Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
