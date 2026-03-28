import React, { useState, useEffect } from 'react';

function Notificari() {
    const [notificari, setNotificari] = useState([]);
    const [arataMeniul, setArataMeniul] = useState(false);

    const fetchNotificari = () => {
        const token = localStorage.getItem('access_token');
        fetch('http://localhost:8000/api/utilizatori/notificari/necitite/', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setNotificari(Array.isArray(data) ? data : (data.results || [])))
        .catch(() => setNotificari([]));
    };

    useEffect(() => {
        fetchNotificari();
        // Verificăm notificările la fiecare 30 de secunde
        const interval = setInterval(fetchNotificari, 30000);
        return () => clearInterval(interval);
    }, []);

    const marcheazaCitita = (id) => {
        const token = localStorage.getItem('access_token');
        fetch(`http://localhost:8000/api/utilizatori/notificari/${id}/marcheaza_citita/`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(() => fetchNotificari());
    };

    return (
        <div style={{ position: 'relative' }}>
            <button 
                onClick={() => setArataMeniul(!arataMeniul)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', position: 'relative' }}
            >
                🔔
                {notificari.length > 0 && (
                    <span style={{ 
                        position: 'absolute', top: -5, right: -5, background: 'red', 
                        color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' 
                    }}>
                        {notificari.length}
                    </span>
                )}
            </button>

            {arataMeniul && (
                <div style={{ 
                    position: 'absolute', top: '40px', right: '0', background: 'white', 
                    color: 'black', width: '250px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    zIndex: 3000, maxHeight: '300px', overflowY: 'auto'
                }}>
                    <div style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>
                        Notificări
                    </div>
                    {notificari.length === 0 ? (
                        <div style={{ padding: '10px', color: '#888', fontSize: '13px' }}>Nicio notificare nouă</div>
                    ) : (
                        notificari.map(n => (
                            <div key={n.id} style={{ padding: '10px', borderBottom: '1px solid #eee', fontSize: '12px', display: 'flex', flexDirection: 'column' }}>
                                <span>{n.mesaj}</span>
                                <button 
                                    onClick={() => marcheazaCitita(n.id)}
                                    style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: '#2196f3', cursor: 'pointer', fontSize: '11px', marginTop: '5px' }}
                                >
                                    Marchează ca citit
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default Notificari;
