import React, { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';

function Profil() {
    const { utilizator } = useAuth()
    const [ progres, setProgres ] = useState(null);
    const [ badges, setBadges ] = useState([]);
    const [ istoric, setIstoric ] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        fetch('http://localhost:8000/api/utilizatori/progres/', { headers })
            .then(res => res.json())
            .then(data => setProgres(data));

        fetch('http://localhost:8000/api/trasee/', { headers })
            .then(res => res.json())
            .then(data => {
                setIstoric(Array.isArray(data) ? data : (data.results || [] ));
            });
        
        fetch('http://localhost:8000/api/utilizatori/badges/ale-mele/', { headers })
            .then(res => res.json())
            .then(data => setBadges(data));
    }, []);

    if(!progres) return <div style={{ padding: '20px' }}>Se încarcă profilul...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                <h2 style={{ marginBottom: '15px' }}>👤 Profilul meu: {progres.username}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <p>⭐ <strong>XP Total:</strong> {progres.xp}</p>
                    <p>📈 <strong>Nivel:</strong> {progres.nivel}</p>
                    <p>🗺️ <strong>Atracții descoperite:</strong> {progres.atractii_descoperite}</p>
                    <p>🏅 <strong>Badge-uri obținute:</strong> {progres.badges_total}</p>
                </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <h3>🏅 Badge-urile mele</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {badges.map(b => (
                        <div key={b.id} style={{ background: '#e3f2fd', padding: '10px', borderRadius: '8px', border: '1px solid #2196f3', textAlign: 'center', minWidth: '120px' }}>
                            <div style={{ fontSize: '24px' }}>🎖️</div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{b.badge.nume}</div>
                            <div style={{ fontSize: '11px', color: '#666' }}>{new Date(b.dataObtinere).toLocaleDateString()}</div>
                        </div>
                    ))}
                    {badges.length === 0 && <p style={{ color: '#888' }}>Încă n-ai obținut niciun badge. Spor la explorat!</p>}
                </div>
            </div>
            <div>
                <h3>🕒 Istoric Trasee</h3>
                <div style={{ marginTop: '10px' }}>
                    {istoric.map(t => (
                        <div key={t.id} style={{ background: 'white', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #1a237e', marginBottom: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ fontWeight: 'bold' }}>{t.punctStart} → {t.punctSosire}</div>
                            <div style={{ fontSize: '13px', color: '#555' }}>
                                📏 {t.distantaKm} km | ⏱️ {t.durataMin} min
                            </div>
                        </div>
                    ))}
                    {istoric.length === 0 && <p style={{ color: '#888' }}>Nu ai niciun traseu salvat în istoric.</p>}
                </div>
            </div>
        </div>
    );
}

export default Profil;