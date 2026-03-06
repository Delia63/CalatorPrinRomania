import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { utilizator, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000,
      background: '#1a237e', color: 'white', padding: '0 20px',
      display: 'flex', alignItems: 'center', height: '56px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '18px', flex: 1 }}>
        🗺️ CalătorPrinRomânia
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {utilizator ? (
          <>
            <span style={{ fontSize: '14px' }}>
              👤 {utilizator.username} | ⭐ {utilizator.xp} XP
            </span>
            <button onClick={handleLogout}
              style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.2)',
                color: 'white', border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
              Ieși
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Login</Link>
            <Link to="/register"
              style={{ padding: '6px 14px', background: '#2196F3', color: 'white',
                textDecoration: 'none', borderRadius: '4px', fontSize: '13px' }}>
              Înregistrare
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;