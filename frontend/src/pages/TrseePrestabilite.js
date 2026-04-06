import React, { useEffect, useState } from 'react';

function TrseePrestabilite() {
    const [trasee, setTrasee] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/trasee/prestabilite/')
            .then(res => res.json())
            .then(data => {
                setTrasee(Array.isArray(data) ? data : (data.results || []));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const tipEmoji = {
        'cultural': '🏛️',
        'istoric': '🏰',
        'religios': '⛪',
        'aventură': '🧗',
        'natură': '🌿',
    };

    const tipCuloare = {
        'cultural': '#1565C0',
        'istoric': '#C62828',
        'religios': '#6A1B9A',
        'aventură': '#E65100',
        'natură': '#2E7D32',
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Se încarcă traseele...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
                🗺️ Trasee Prestabilite
            </h2>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px', fontSize: '14px' }}>
                Descoperă traseele noastre recomandate prin cele mai frumoase locuri din România
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
            }}>
                {trasee.map(traseu => (
                    <div key={traseu.id} style={{
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.1)';
                    }}
                    >
                        <div style={{
                            background: tipCuloare[traseu.tip] || '#1a237e',
                            color: 'white',
                            padding: '16px',
                        }}>
                            <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                                {tipEmoji[traseu.tip] || '📍'}
                            </div>
                            <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>
                                {traseu.punctStart} → {traseu.punctSosire}
                            </h3>
                            <span style={{
                                background: 'rgba(255,255,255,0.25)',
                                padding: '2px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}>
                                {traseu.tip}
                            </span>
                        </div>

                        <div style={{ padding: '16px' }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                marginBottom: '12px', fontSize: '13px',
                            }}>
                                <span>📏 <strong>{traseu.distantaKm} km</strong></span>
                                <span>⏱️ <strong>{traseu.durataMin} min</strong></span>
                            </div>

                            {traseu.puncte && traseu.puncte.length > 0 && (
                                <div>
                                    <div style={{
                                        fontSize: '12px', fontWeight: 'bold',
                                        marginBottom: '6px', color: '#555',
                                    }}>
                                        📍 {traseu.puncte.length} atracții pe traseu
                                    </div>
                                    <div style={{
                                        display: 'flex', flexWrap: 'wrap', gap: '4px',
                                    }}>
                                        {traseu.puncte.map(p => (
                                            <span key={p.id} style={{
                                                background: '#f0f0f0',
                                                padding: '3px 8px',
                                                borderRadius: '10px',
                                                fontSize: '11px',
                                                color: '#444',
                                            }}>
                                                #{p.ordine}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {trasee.length === 0 && (
                <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>
                    Nu sunt trasee prestabilite disponibile.
                </p>
            )}
        </div>
    );
}

export default TrseePrestabilite;
