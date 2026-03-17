import React, { useState } from "react";

function FormularTraseu({ onCalculeaza }) {
    const [punctStart, setPunctStart] = useState('');
    const [punctSosire, setPunctSosire] = useState('');
    const [loading, setLoading] = useState(false);
    const [eroare, setEroare] = useState('');

    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);
        setEroare('');

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/trasee/calculeaza/', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    punctStart,
                    punctSosire,
                    abatereMaxKm: 10
                })
            });

            const data = await response.json()

            if(!response.ok) {
                setEroare(data.error || 'Eroare la calculul traseului!');
                
            }
            else {
                onCalculeaza(data);
            }
        } catch(err) {
            setEroare('Nu s-a putut conecta la server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'absolute', top: 20, left: 20, zIndex: 1000,
            background: 'white', padding: '16px', borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)', width: '280px'
        }}>
            <h3 style={{ margin: '0 0 12px 0'}}>Planificare traseu</h3>
            <form onSubmit={handleSubmit}>
                <input 
                type="text" 
                placeholder="Plecare: "
                value={punctStart}
                onChange={e => setPunctStart(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '8px',
                    boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                required />

                <input
                type="text"
                placeholder="Destinație: "
                value={punctSosire}
                onChange={e => setPunctSosire(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '8px',
                    boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                required />

                <button 
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '8px', background: '#2196F3',
                    color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {loading ? 'Loading...' : 'Calculeaza traseu'} 
                </button>

                {eroare && 
                <p style={{ color: 'red', margin: '8px 0 0 0', fontSize: '14px' }}>
                    {eroare}
                </p>}
            </form>
        </div>
    );
}

export default FormularTraseu;