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
    <div style={{ maxWidth: '440px', margin: '1.5rem auto', padding: '1.5rem 2rem' }} className="glass-panel">
      <h2 style={{ textAlign: 'center', marginBottom: '1.25rem', fontSize: '1.75rem' }}>Create Account</h2>
      
      {error && <div style={{ background: 'var(--danger)', color: 'white', padding: '0.6rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>{error}</div>}
      {message && <div style={{ background: 'green', color: 'white', padding: '0.6rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>{message}</div>}
      
      {step === 1 ? (
        <form onSubmit={handleSendOtp}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.9rem', marginBottom: '0.4rem', display: 'block' }}>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="form-control" style={{ height: '42px' }} disabled={loading} />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.9rem', marginBottom: '0.4rem', display: 'block' }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-control" style={{ height: '42px' }} disabled={loading} />
          </div>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.9rem', marginBottom: '0.4rem', display: 'block' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="form-control" style={{ height: '42px' }} disabled={loading} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '45px', fontWeight: 'bold' }} disabled={loading}>
            {loading ? 'Sending OTP...' : 'Continue'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.9rem', marginBottom: '0.4rem', display: 'block' }}>Enter 6-Digit OTP</label>
            <input 
              type="text" 
              value={otp} 
              onChange={e => setOtp(e.target.value)} 
              required 
              maxLength="6"
              className="form-control" 
              style={{ height: '45px', fontSize: '1.25rem', textAlign: 'center', letterSpacing: '4px' }} 
              disabled={loading}
              placeholder="000000"
            />
            <small style={{display: 'block', marginTop: '0.5rem', color: 'var(--text-secondary)'}}>
              OTP expires in 5 minutes.
            </small>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '45px', fontWeight: 'bold' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Register'}
          </button>
          <button type="button" className="btn btn-secondary" style={{ width: '100%', height: '45px', fontWeight: 'bold', marginTop: '0.8rem' }} onClick={() => setStep(1)} disabled={loading}>
            Back
          </button>
        </form>
      )}

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
        Already have an account? <Link to="/login" style={{ fontWeight: '600' }}>Sign in</Link>
      </p>
    </div>
  );
};

export default Register;
