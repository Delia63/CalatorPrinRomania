import React, { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [eroare, setEroare] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);
        setEroare('');
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setEroare(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', background: '#f0f2f5' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '360px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>🗺️ CalătorPrinRomânia</h2>
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#555' }}>Autentificare</h3>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" value={username}
            onChange={e => setUsername(e.target.value)} required
            style={{ width: '100%', padding: '10px', marginBottom: '12px',
              boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }} />
          <input type="password" placeholder="Parolă" value={password}
            onChange={e => setPassword(e.target.value)} required
            style={{ width: '100%', padding: '10px', marginBottom: '16px',
              boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }} />
          {eroare && <p style={{ color: 'red', fontSize: '13px', marginBottom: '12px' }}>{eroare}</p>}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '10px', background: '#2196F3', color: 'white',
              border: 'none', borderRadius: '6px', fontSize: '15px', cursor: 'pointer' }}>
            {loading ? 'Se autentifică...' : 'Intră în cont'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
          Nu ai cont? <Link to="/register">Înregistrează-te</Link>
        </p>
      </div>
    </div>
    );
}

export default Login;