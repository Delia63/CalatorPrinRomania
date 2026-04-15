import React, { useEffect, useState } from 'react';

function BadgeToast() {
    const [notificare, setNotificare] = useState(null);
    const [vizibil, setVizibil] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            fetch('http://localhost:8000/api/utilizatori/notificari/necitite/', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    const lista = Array.isArray(data) ? data : (data.results || []);
                    const badgeNotif = lista.find(n => n.tip === 'badge' && !n.esteCitita);
                    if (badgeNotif) {
                        setNotificare(badgeNotif);
                        setVizibil(true);

                        // Marchează ca citită
                        fetch(`http://localhost:8000/api/utilizatori/notificari/${badgeNotif.id}/marcheaza_citita/`, {
                            method: 'PATCH',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        // Ascunde după 5 secunde
                        setTimeout(() => setVizibil(false), 5000);
                    }
                })
                .catch(() => {});
        }, 3000); // verifică la fiecare 10 secunde

        return () => clearInterval(interval);
    }, []);

    if (!vizibil || !notificare) return null;

    return (
        <div style={{
            position: 'fixed', top: '70px', right: '20px', zIndex: 9999,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', padding: '16px 24px', borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            animation: 'slideIn 0.5s ease-out',
            maxWidth: '320px',
        }}>
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>🎉🏅</div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                Badge Nou Obținut!
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
                {notificare.mesaj}
            </div>
            <button
                onClick={() => setVizibil(false)}
                style={{
                    position: 'absolute', top: '8px', right: '12px',
                    background: 'none', border: 'none', color: 'white',
                    fontSize: '18px', cursor: 'pointer', opacity: 0.7,
                }}
            >
                ✕
            </button>
        </div>
    );
}

export default BadgeToast;
