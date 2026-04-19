import React, { useState } from 'react';

function PanouFiltre({ onFiltreaza }) {
    const [tip, setTip] = useState('');
    const [ratingMin, setRatingMin] = useState('');
    const [tarifMax, setTarifMax] = useState('');
    const [gratuit, setGratuit] = useState(false);
    const [deschis, setDeschis] = useState(false);

    const tipuri = ['castel', 'cetate', 'biserică', 'peșteră', 'muzeu', 'lac', 'drum', 'mină', 'formațiune naturală'];

    const aplicaFiltre = () => {
        const params = new URLSearchParams();
        if (tip) params.append('tip', tip);
        if (ratingMin) params.append('rating_min', ratingMin);
        if (gratuit) {
            params.append('gratuit', 'true');
        } else if (tarifMax) {
            params.append('tarif_max', tarifMax);
        }
        onFiltreaza(params.toString());
    };

    const reseteaza = () => {
        setTip('');
        setRatingMin('');
        setTarifMax('');
        setGratuit(false);
        onFiltreaza('');
    };

    return (
        <div>
            <button
                onClick={() => setDeschis(!deschis)}
                style={{
                    background: '#1a237e', color: 'white', border: 'none',
                    padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
                    fontWeight: 'bold', fontSize: '14px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                }}
            >
                🔍 Filtre {deschis ? '▲' : '▼'}
            </button>

            {deschis && (
                <div style={{
                    marginTop: '8px', background: 'white', padding: '16px',
                    borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    width: '220px',
                }}>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                            📂 Tip atracție
                        </label>
                        <select
                            value={tip}
                            onChange={(e) => setTip(e.target.value)}
                            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
                        >
                            <option value="">Toate tipurile</option>
                            {tipuri.map(t => (
                                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                            ⭐ Rating minim
                        </label>
                        <select
                            value={ratingMin}
                            onChange={(e) => setRatingMin(e.target.value)}
                            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
                        >
                            <option value="">Orice rating</option>
                            {[1, 2, 3, 4, 5].map(n => (
                                <option key={n} value={n}>{'⭐'.repeat(n)} ({n}+)</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                            💰 Tarif maxim (RON)
                        </label>
                        <input
                            type="number"
                            value={tarifMax}
                            onChange={(e) => setTarifMax(e.target.value)}
                            placeholder="ex: 30"
                            disabled={gratuit}
                            style={{
                                width: '100%', padding: '6px', borderRadius: '4px',
                                border: '1px solid #ccc', fontSize: '13px', boxSizing: 'border-box',
                                opacity: gratuit ? 0.5 : 1,
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                                type="checkbox"
                                checked={gratuit}
                                onChange={(e) => setGratuit(e.target.checked)}
                            />
                            🆓 Doar gratuite
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={aplicaFiltre}
                            style={{
                                flex: 1, background: '#1a237e', color: 'white', border: 'none',
                                padding: '8px', borderRadius: '4px', cursor: 'pointer',
                                fontWeight: 'bold', fontSize: '13px',
                            }}
                        >
                            Aplică
                        </button>
                        <button
                            onClick={reseteaza}
                            style={{
                                flex: 1, background: '#f5f5f5', color: '#333', border: '1px solid #ccc',
                                padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
                            }}
                        >
                            Resetare
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PanouFiltre;
