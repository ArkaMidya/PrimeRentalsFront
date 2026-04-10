import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaCarSide, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ padding: '1rem', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <FaCarSide size={28} color="var(--primary)" />
        <Link to="/"><h2 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: '700', color: 'var(--text-main)' }}>Prime Rentals</h2></Link>
      </div>
      <div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to={user.role === 'Admin' ? "/admin" : "/customer"} style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>Dashboard</Link>
            <span>Welcome <strong>{user.name}</strong> </span>
            <button className="btn btn-outline" style={{ padding: '0.4rem 1rem' }} onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
