import React, { useState } from "react";

function FormularRecenzie({ atractieId, onRecenzieAdaugata }) {
    const [text, setText] = useState('');
    const [nota, setNota] = useState(5);
    const [imagini, setImagini] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mesaj, setMesaj] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('access_token');

        try {
            // 1. Creează recenzia
            const resp = await fetch('http://localhost:8000/api/recenzii/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    text,
                    nota: parseInt(nota),
                    atractie: atractieId
                })
            });

            if (!resp.ok) throw new Error('Eroare la trimitere.');
            const recenzie = await resp.json();

            // 2. Trimite imaginile ca form-data
            for (const fisier of imagini) {
                const formData = new FormData();
                formData.append('recenzie', recenzie.id);
                formData.append('imagine', fisier);

                await fetch('http://localhost:8000/api/imagini-recenzii/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
            }

            setMesaj('✅ Recenzia ta a fost trimisă și este în așteptare pentru aprobare!');
            setText('');
            setNota(5);
            setImagini([]);
            if (onRecenzieAdaugata) onRecenzieAdaugata();

        } catch (err) {
            setMesaj('❌ Eroare: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const adaugaImagine = () => {
        // Deschide un file input invizibil
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            if (e.target.files[0]) {
                setImagini(prev => [...prev, e.target.files[0]]);
            }
        };
        input.click();
    };

    const stergeImagine = (index) => {
        setImagini(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div style={{
            background: '#f5f5f5', padding: '15px', borderRadius: '8px',
            marginTop: '10px', border: '1px solid #ddd'
        }}>
            <h4 style={{ margin: '0 0 10px' }}>📝 Adaugă o recenzie</h4>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Scrie recenzia ta..."
                    required
                    style={{
                        width: '100%', padding: '8px', borderRadius: '4px',
                        border: '1px solid #ccc', minHeight: '60px',
                        boxSizing: 'border-box', fontSize: '13px'
                    }}
                />
                <div style={{ margin: '8px 0' }}>
                    <label style={{ fontSize: '13px' }}>Notă: </label>
                    <select
                        value={nota}
                        onChange={(e) => setNota(e.target.value)}
                        style={{ padding: '4px', borderRadius: '4px' }}
                    >
                        {[1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n}>{'⭐'.repeat(n)}</option>
                        ))}
                    </select>
                </div>
                {/* Imagini selectate */}
                <div style={{ marginBottom: '8px' }}>
                    {imagini.map((fisier, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            marginBottom: '4px', fontSize: '12px'
                        }}>
                            <span>📷 {fisier.name}</span>
                            <button
                                type="button"
                                onClick={() => stergeImagine(i)}
                                style={{
                                    background: 'none', border: 'none',
                                    cursor: 'pointer', color: 'red', fontSize: '14px'
                                }}
                            >✕</button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={adaugaImagine}
                        style={{
                            background: 'none', border: '1px dashed #999',
                            padding: '4px 10px', borderRadius: '4px',
                            cursor: 'pointer', fontSize: '12px', color: '#666'
                        }}
                    >
                        📷 + Adaugă imagine
                    </button>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        background: '#1a237e', color: 'white', border: 'none',
                        padding: '8px 16px', borderRadius: '4px',
                        cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                    }}
                >
                    {loading ? 'Se trimite...' : 'Trimite recenzia'}
                </button>
            </form>
            {mesaj && (
                <p style={{
                    marginTop: '8px', fontSize: '13px',
                    color: mesaj.startsWith('✅') ? 'green' : 'red'
                }}>
                    {mesaj}
                </p>
            )}
        </div>
    );
}

export default FormularRecenzie;