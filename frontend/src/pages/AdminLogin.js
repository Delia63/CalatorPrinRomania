import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [eroare, setEroare]     = useState('');
    const [loading, setLoading]   = useState(false);
    const { login, utilizator }   = useAuth();
    const navigate = useNavigate();

    // Dacă e deja logat ca admin, redirect direct
    React.useEffect(() => {
        if (utilizator?.is_staff) navigate('/admin');
    }, [utilizator, navigate]);

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setEroare('');
        try {
            await login(username, password);
            // login() actualizează utilizator — useEffect se va ocupa de redirect
        } catch (err) {
            setEroare(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #0d1b2a 0%, #1a237e 100%)',
        }}>
            <div style={{
                background: 'white', padding: '40px', borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)', width: '360px',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>🛡️</div>
                    <h2 style={{ margin: 0, color: '#1a237e' }}>Panou Administrator</h2>
                    <p style={{ color: '#888', fontSize: '13px', margin: '4px 0 0' }}>
                        CalătorPrinRomânia
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text" placeholder="Username admin" value={username}
                        onChange={e => setUsername(e.target.value)} required
                        style={{
                            width: '100%', padding: '10px', marginBottom: '12px',
                            boxSizing: 'border-box', borderRadius: '8px',
                            border: '1px solid #ddd', fontSize: '14px'
                        }}
                    />
                    <input
                        type="password" placeholder="Parolă" value={password}
                        onChange={e => setPassword(e.target.value)} required
                        style={{
                            width: '100%', padding: '10px', marginBottom: '16px',
                            boxSizing: 'border-box', borderRadius: '8px',
                            border: '1px solid #ddd', fontSize: '14px'
                        }}
                    />
                    {eroare && (
                        <p style={{ color: '#c62828', fontSize: '13px', marginBottom: '12px' }}>
                            ❌ {eroare}
                        </p>
                    )}
                    <button
                        type="submit" disabled={loading}
                        style={{
                            width: '100%', padding: '12px',
                            background: 'linear-gradient(135deg, #1a237e, #0d47a1)',
                            color: 'white', border: 'none', borderRadius: '8px',
                            fontSize: '15px', cursor: 'pointer', fontWeight: 'bold',
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? 'Se autentifică...' : '🔐 Intră ca Admin'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;
