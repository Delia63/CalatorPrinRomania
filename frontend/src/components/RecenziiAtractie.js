import React, { useState, useEffect } from "react";

function RecenziiAtractie({ atractieId }) {
    const [recenzii, setRecenzii] = useState([]);

    const fetchRecenzii = () => {
        const token = localStorage.getItem('access_token');
        fetch(`http://localhost:8000/api/recenzii/aprobate/?atractie=${atractieId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setRecenzii(data);
                else setRecenzii(data.results || []);
            })
            .catch(() => setRecenzii([]));
    };

    useEffect(() => {
        fetchRecenzii();
    }, [atractieId]);

    return (
        <div style={{ marginTop: '10px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '14px' }}>
                💬 Recenzii ({recenzii.length})
            </h4>
            {recenzii.length === 0 ? (
                <p style={{ color: '#888', fontSize: '12px' }}>Nicio recenzie încă.</p>
            ) : (
                recenzii.map(r => (
                    <div key={r.id} style={{
                        background: '#fafafa', padding: '8px',
                        borderRadius: '4px', marginBottom: '6px',
                        border: '1px solid #eee', fontSize: '12px'
                    }}>
                        <div style={{ fontWeight: 'bold' }}>
                            {r.utilizator_username} — {'⭐'.repeat(r.nota)}
                        </div>
                        <p style={{ margin: '4px 0' }}>{r.text}</p>
                        {r.imagini && r.imagini.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {r.imagini.map(img => (
                                    <img
                                        key={img.id}
                                        src={img.imagine ? `http://localhost:8000${img.imagine}` : ''}
                                        alt="recenzie"
                                        style={{
                                            width: '60px', height: '60px',
                                            objectFit: 'cover', borderRadius: '4px'
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                        <div style={{ color: '#999', fontSize: '10px', marginTop: '4px' }}>
                            {new Date(r.data).toLocaleDateString('ro-RO', {
                                day: '2-digit', month: '2-digit', year: 'numeric'
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default RecenziiAtractie;