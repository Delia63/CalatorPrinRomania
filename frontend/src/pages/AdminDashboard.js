import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STAT_CARDS = [
    { key: 'total_utilizatori',    label: 'Utilizatori',          icon: '👥', color: '#1565c0' },
    { key: 'total_atractii',       label: 'Atracții',             icon: '🏰', color: '#6a1b9a' },
    { key: 'total_trasee',         label: 'Trasee calculate',     icon: '🗺️', color: '#2e7d32' },
    { key: 'total_badges_acordate',label: 'Badge-uri acordate',   icon: '🏅', color: '#e65100' },
    { key: 'recenzii_in_asteptare',label: 'Recenzii în așteptare',icon: '⏳', color: '#c62828', urgent: true },
    { key: 'recenzii_aprobate',    label: 'Recenzii aprobate',    icon: '✅', color: '#2e7d32' },
    { key: 'recenzii_respinse',    label: 'Recenzii respinse',    icon: '❌', color: '#555'    },
];

const NAV_LINKS = [
    { to: '/admin',            icon: '📊', label: 'Dashboard'  },
    { to: '/admin/recenzii',   icon: '💬', label: 'Recenzii'   },
    { to: '/admin/utilizatori',icon: '👥', label: 'Utilizatori'},
    { to: '/admin/atractii',   icon: '🏰', label: 'Atracții'   },
];

function AdminLayout({ children }) {
    const { utilizator, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
            {/* Sidebar */}
            <div style={{
                width: '220px', background: 'linear-gradient(180deg, #0d1b2a 0%, #1a237e 100%)',
                color: 'white', padding: '24px 0', display: 'flex', flexDirection: 'column',
                position: 'fixed', top: 0, left: 0, bottom: 0,
            }}>
                <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '28px', marginBottom: '4px' }}>🛡️</div>
                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Admin Panel</div>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>{utilizator?.username}</div>
                </div>

                <nav style={{ flex: 1, padding: '16px 0' }}>
                    {NAV_LINKS.map(l => (
                        <Link key={l.to} to={l.to} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 20px', color: 'white', textDecoration: 'none',
                            fontSize: '14px', transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            {l.icon} {l.label}
                        </Link>
                    ))}
                </nav>

                <button onClick={handleLogout} style={{
                    margin: '20px', padding: '10px', background: 'rgba(255,255,255,0.1)',
                    color: 'white', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                }}>
                    🚪 Ieși
                </button>
            </div>

            {/* Content */}
            <div style={{ marginLeft: '220px', flex: 1, padding: '32px' }}>
                {children}
            </div>
        </div>
    );
}

function AdminDashboard() {
    const { utilizator } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats]   = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!utilizator?.is_staff) { navigate('/admin-login'); return; }
        const token = localStorage.getItem('access_token');
        fetch('http://localhost:8000/api/utilizatori/admin/dashboard/', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => { setStats(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [utilizator, navigate]);

    return (
        <AdminLayout>
            <h1 style={{ margin: '0 0 8px', fontSize: '24px' }}>📊 Dashboard</h1>
            <p style={{ color: '#888', marginBottom: '28px' }}>
                Bun venit, <strong>{utilizator?.username}</strong>! Iată situația curentă:
            </p>

            {loading ? (
                <p>Se încarcă statisticile...</p>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '16px',
                }}>
                    {STAT_CARDS.map(card => (
                        <div key={card.key} style={{
                            background: 'white', borderRadius: '12px', padding: '20px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                            borderTop: `4px solid ${card.color}`,
                            position: 'relative',
                        }}>
                            {card.urgent && stats?.[card.key] > 0 && (
                                <span style={{
                                    position: 'absolute', top: '12px', right: '12px',
                                    background: '#c62828', color: 'white', borderRadius: '50%',
                                    width: '20px', height: '20px', fontSize: '11px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold',
                                }}>!</span>
                            )}
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{card.icon}</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: card.color }}>
                                {stats?.[card.key] ?? '—'}
                            </div>
                            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                                {card.label}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Scurtătură recenzii în așteptare */}
            {stats?.recenzii_in_asteptare > 0 && (
                <div style={{
                    marginTop: '28px', background: '#fff3e0', borderRadius: '12px',
                    padding: '20px', borderLeft: '4px solid #e65100',
                }}>
                    <strong>⚠️ Ai {stats.recenzii_in_asteptare} recenz{stats.recenzii_in_asteptare === 1 ? 'ie' : 'ii'} care așteaptă aprobare!</strong>
                    <Link to="/admin/recenzii" style={{
                        display: 'inline-block', marginLeft: '16px',
                        background: '#e65100', color: 'white', padding: '6px 14px',
                        borderRadius: '6px', textDecoration: 'none', fontSize: '13px',
                    }}>
                        Gestionează →
                    </Link>
                </div>
            )}
        </AdminLayout>
    );
}

export { AdminLayout };
export default AdminDashboard;
