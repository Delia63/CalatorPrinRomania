import React, { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';

function Profil() {
    const { utilizator } = useAuth();
    const [progres, setProgres] = useState(null);
    const [badges, setBadges] = useState([]);
    const [istoric, setIstoric] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        Promise.all([
            fetch('http://localhost:8000/api/utilizatori/progres/', { headers }).then(r => r.json()),
            fetch('http://localhost:8000/api/utilizatori/badges/toate/', { headers }).then(r => r.json()),
            fetch('http://localhost:8000/api/trasee/', { headers }).then(r => r.json()),
        ])
            .then(([progresData, badgesData, istoricData]) => {
                setProgres(progresData);
                setBadges(Array.isArray(badgesData) ? badgesData : (badgesData.results || []));
                setIstoric(Array.isArray(istoricData) ? istoricData : (istoricData.results || []));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px', animation: 'spin 1s linear infinite' }}>🗺️</div>
                <p style={{ color: '#888' }}>Se încarcă profilul...</p>
            </div>
        </div>
    );

    const xpPentruNivel = progres ? (progres.nivel * 100) : 100;
    const procentXp = progres ? Math.min((progres.xp % 100) / 100 * 100, 100) : 0;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            {/* Card profil */}
            <div style={{
                background: 'linear-gradient(135deg, #1a237e, #0d47a1)',
                color: 'white', padding: '24px', borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)', marginBottom: '20px',
            }}>
                <h2 style={{ marginBottom: '16px' }}>👤 {progres.username}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px' }}>⭐</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{progres.xp}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>XP Total</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px' }}>📈</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{progres.nivel}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>Nivel</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px' }}>🗺️</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{progres.atractii_descoperite}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>Descoperiri</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px' }}>🏅</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{progres.badges_total}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>Badge-uri</div>
                    </div>
                </div>
                {/* Bară XP */}
                <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '12px', marginBottom: '4px', opacity: 0.8 }}>
                        Progres nivel: {progres.xp % 100}/100 XP
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', height: '8px' }}>
                        <div style={{
                            background: '#FF6F00', borderRadius: '10px', height: '8px',
                            width: `${procentXp}%`, transition: 'width 0.5s ease',
                        }} />
                    </div>
                </div>
            </div>

            {/* Badge-uri - toate */}
            <div style={{
                background: 'white', padding: '20px', borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '20px',
            }}>
                <h3 style={{ marginBottom: '16px' }}>🏅 Toate Badge-urile</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                    {badges.map(b => (
                        <div key={b.id} style={{
                            padding: '14px', borderRadius: '10px', textAlign: 'center',
                            background: b.obtinut ? '#e8f5e9' : '#f5f5f5',
                            border: b.obtinut ? '2px solid #4CAF50' : '2px solid #e0e0e0',
                            opacity: b.obtinut ? 1 : 0.5,
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{ fontSize: '28px', marginBottom: '4px' }}>
                                {b.iconUrl || '🎖️'}
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '2px' }}>
                                {b.nume}
                            </div>
                            <div style={{ fontSize: '10px', color: '#888' }}>
                                {b.descriere}
                            </div>
                            {b.obtinut && (
                                <div style={{
                                    marginTop: '4px', fontSize: '10px', color: '#4CAF50', fontWeight: 'bold',
                                }}>
                                    ✅ Obținut
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Istoric trasee */}
            <div style={{
                background: 'white', padding: '20px', borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            }}>
                <h3 style={{ marginBottom: '16px' }}>🕒 Istoric Trasee</h3>
                {istoric.map(t => (
                    <div key={t.id} style={{
                        padding: '12px', borderRadius: '8px', borderLeft: '4px solid #1a237e',
                        marginBottom: '10px', background: '#fafafa',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                    >
                        <div style={{ fontWeight: 'bold' }}>{t.punctStart} → {t.punctSosire}</div>
                        <div style={{ fontSize: '13px', color: '#555' }}>
                            📏 {t.distantaKm} km | ⏱️ {t.durataMin} min
                        </div>
                    </div>
                ))}
                {istoric.length === 0 && (
                    <p style={{ color: '#888', textAlign: 'center' }}>Nu ai niciun traseu salvat.</p>
                )}
            </div>
        </div>
    );
}

export default Profil;
