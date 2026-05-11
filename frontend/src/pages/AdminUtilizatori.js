import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminLayout } from './AdminDashboard';

function AdminUtilizatori() {
    const { utilizator } = useAuth();
    const navigate = useNavigate();
    const [utilizatori, setUtilizatori] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [cautare, setCautare]         = useState('');

    useEffect(() => {
        if (!utilizator?.is_staff) { navigate('/admin-login'); return; }
        const token = localStorage.getItem('access_token');
        fetch('http://localhost:8000/api/utilizatori/admin/utilizatori/', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                setUtilizatori(Array.isArray(data) ? data : (data.results || []));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [utilizator, navigate]);

    const filtrati = utilizatori.filter(u =>
        u.username.toLowerCase().includes(cautare.toLowerCase()) ||
        u.email.toLowerCase().includes(cautare.toLowerCase())
    );

    return (
        <AdminLayout>
            <h1 style={{ margin: '0 0 4px', fontSize: '24px' }}>👥 Gestionare Utilizatori</h1>
            <p style={{ color: '#888', marginBottom: '24px' }}>
                {utilizatori.length} utilizatori înregistrați
            </p>

            {/* Căutare */}
            <input
                type="text"
                placeholder="🔍 Caută după username sau email..."
                value={cautare}
                onChange={e => setCautare(e.target.value)}
                style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: '1px solid #ddd', fontSize: '14px', marginBottom: '20px',
                    boxSizing: 'border-box',
                }}
            />

            {loading ? <p>Se încarcă...</p> : (
                <div style={{
                    background: 'white', borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflow: 'hidden',
                }}>
                    {/* Header tabel */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr',
                        background: '#f5f5f5', padding: '12px 20px',
                        fontWeight: 'bold', fontSize: '13px', color: '#555',
                    }}>
                        <span>Username</span>
                        <span>Email</span>
                        <span>XP</span>
                        <span>Nivel</span>
                        <span>Descoperiri</span>
                        <span>Badge-uri</span>
                    </div>

                    {filtrati.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                            Niciun utilizator găsit.
                        </div>
                    ) : (
                        filtrati.map((u, i) => (
                            <div key={u.id} style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr',
                                padding: '14px 20px', fontSize: '14px',
                                borderBottom: '1px solid #f0f0f0',
                                background: i % 2 === 0 ? 'white' : '#fafafa',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#e8f0fe'}
                            onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#fafafa'}
                            >
                                <span style={{ fontWeight: 'bold' }}>👤 {u.username}</span>
                                <span style={{ color: '#666' }}>{u.email || '—'}</span>
                                <span style={{ color: '#FF6F00', fontWeight: 'bold' }}>⭐ {u.xp}</span>
                                <span>Niv. {u.nivel}</span>
                                <span>🗺️ {u.nr_descoperiri}</span>
                                <span>🏅 {u.nr_badges}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </AdminLayout>
    );
}

export default AdminUtilizatori;
