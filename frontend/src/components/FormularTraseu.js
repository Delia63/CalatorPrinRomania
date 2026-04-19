import React, { useState } from "react";

// Formatează yyyy-mm-dd → dd/mm/yyyy pentru afișare
const formatDataRO = (isoDate) => {
    if (!isoDate) return '';
    const [yyyy, mm, dd] = isoDate.split('-');
    return `${dd}/${mm}/${yyyy}`;
};

// Component dată: afișează dd/mm/yyyy, deschide calendarul nativ la click
const DataInput = ({ value, onChange }) => (
    <div style={{ position: 'relative', flex: 1 }}>
        {/* Text vizibil în format dd/mm/yyyy */}
        <input
            type="text"
            readOnly
            value={formatDataRO(value)}
            placeholder="dd/mm/yyyy"
            style={{
                width: '100%', padding: '6px', borderRadius: '4px',
                border: '1px solid #ccc', fontSize: '12px',
                boxSizing: 'border-box', background: 'white',
                cursor: 'pointer'
            }}
        />
        {/* Input dată transparent suprapus — deschide calendarul */}
        <input
            type="date"
            value={value}
            onChange={onChange}
            style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                opacity: 0, cursor: 'pointer'
            }}
        />
    </div>
);

function FormularTraseu({ onCalculeaza }) {
    const [punctStart, setPunctStart] = useState('');
    const [punctSosire, setPunctSosire] = useState('');
    const [abatereMaxKm, setAbatereMaxKm] = useState(10);
    const [dataStart, setDataStart] = useState('');
    const [dataEnd, setDataEnd] = useState('');
    const [loading, setLoading] = useState(false);
    const [eroare, setEroare] = useState('');

    const handleSubmit = async (e) => {
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
                    abatereMaxKm,
                    dataStart: dataStart || undefined,
                    dataEnd: dataEnd || undefined,
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setEroare(data.error || 'Eroare la calculul traseului!');
            } else {
                onCalculeaza(data);
            }
        } catch (err) {
            setEroare('Nu s-a putut conecta la server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            background: 'white', padding: '16px', borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Planificare traseu</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Plecare: "
                    value={punctStart}
                    onChange={e => setPunctStart(e.target.value)}
                    style={{
                        width: '100%', padding: '8px', marginBottom: '8px',
                        boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc'
                    }}
                    required />
                <input
                    type="text"
                    placeholder="Destinație: "
                    value={punctSosire}
                    onChange={e => setPunctSosire(e.target.value)}
                    style={{
                        width: '100%', padding: '8px', marginBottom: '8px',
                        boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc'
                    }}
                    required />
                {/* Slider abatere */}
                <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
                        📏 Abatere maximă: {abatereMaxKm} km
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={abatereMaxKm}
                        onChange={e => setAbatereMaxKm(parseInt(e.target.value))}
                        style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888' }}>
                        <span>1 km</span>
                        <span>50 km</span>
                    </div>
                </div>
                {/* Date picker perioadă */}
                <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                        📅 Perioadă călătorie (opțional)
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <DataInput
                            value={dataStart}
                            onChange={e => setDataStart(e.target.value)}
                        />
                        <DataInput
                            value={dataEnd}
                            onChange={e => setDataEnd(e.target.value)}
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%', padding: '8px', background: '#2196F3',
                        color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
                    }}>
                    {loading ? 'Loading...' : 'Calculează traseu'}
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