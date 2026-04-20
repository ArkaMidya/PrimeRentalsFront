import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaCarSide, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <FaCarSide size={28} color="var(--primary)" />
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
          <h2 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: '800', fontSize: '1.4rem' }}>Prime Rentals</h2>
        </Link>
      </div>

      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
        {user ? (
          <>
            <span className="welcome-msg" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Welcome, <strong>{user.name}</strong>
            </span>
            <Link to={user.role === 'Admin' ? "/admin" : "/customer"} className="btn btn-outline" style={{ border: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
              Dashboard
            </Link>
            <button className="btn btn-primary" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
            <Link to="/register" className="btn btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
