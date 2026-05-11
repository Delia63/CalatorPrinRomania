import React, { useEffect, useState } from 'react';

const STATUS_CONFIG = {
    aprobata:     { label: 'Aprobată',     color: '#2e7d32', bg: '#e8f5e9', icon: '✅' },
    respinsa:     { label: 'Respinsă',     color: '#c62828', bg: '#ffebee', icon: '❌' },
    in_asteptare: { label: 'În așteptare', color: '#e65100', bg: '#fff3e0', icon: '⏳' },
};

function StarRating({ nota }) {
    return (
        <span style={{ color: '#FF6F00', fontSize: '16px' }}>
            {'⭐'.repeat(nota)}{'☆'.repeat(5 - nota)}
        </span>
    );
}

function Recenzii() {
    const [recenzii, setRecenzii]           = useState([]);
    const [atractiiDescoperite, setAtractii] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [filtru, setFiltru]               = useState('toate');

    // Stare formular
    const [atractieSelectata, setAtractieSelectata] = useState('');
    const [text, setText]   = useState('');
    const [nota, setNota]   = useState(5);
    const [imagini, setImagini] = useState([]);
    const [trimitere, setTrimitere] = useState(false);
    const [mesaj, setMesaj] = useState('');

    const token = localStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const fetchRecenzii = () => {
        fetch('http://localhost:8000/api/recenzii/ale-mele/', { headers })
            .then(r => r.json())
            .then(data => setRecenzii(Array.isArray(data) ? data : (data.results || [])));
    };

    useEffect(() => {
        // Fetch recenzii + atractii descoperite în paralel
        Promise.all([
            fetch('http://localhost:8000/api/recenzii/ale-mele/', { headers }).then(r => r.json()),
            fetch('http://localhost:8000/api/utilizatori/descoperiri-mele/', { headers }).then(r => r.json()),
        ]).then(([recData, atractiiData]) => {
            setRecenzii(Array.isArray(recData) ? recData : (recData.results || []));
            const lista = Array.isArray(atractiiData) ? atractiiData : (atractiiData.results || []);
            setAtractii(lista);
            if (lista.length > 0) setAtractieSelectata(lista[0].atractie_id);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []); // eslint-disable-line

    const adaugaImagine = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = e => {
            if (e.target.files[0]) setImagini(prev => [...prev, e.target.files[0]]);
        };
        input.click();
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!atractieSelectata) return;
        setTrimitere(true);
        setMesaj('');
        try {
            const resp = await fetch('http://localhost:8000/api/recenzii/', {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, nota: parseInt(nota), atractie: atractieSelectata })
            });
            if (!resp.ok) {
                const err = await resp.json();
                const msg = Array.isArray(err) ? err[0] : (err.detail || JSON.stringify(err));
                setMesaj('❌ ' + msg);
                return;
            }
            const recenzie = await resp.json();

            // Upload imagini
            for (const fisier of imagini) {
                const fd = new FormData();
                fd.append('recenzie', recenzie.id);
                fd.append('imagine', fisier);
                await fetch('http://localhost:8000/api/imagini-recenzii/', {
                    method: 'POST', headers, body: fd
                });
            }

            setMesaj('✅ Recenzia a fost trimisă și este în așteptare pentru aprobare!');
            setText(''); setNota(5); setImagini([]);
            fetchRecenzii();
        } catch (err) {
            setMesaj('❌ Eroare de rețea.');
        } finally {
            setTrimitere(false);
        }
    };

    const numar = status => recenzii.filter(r => r.status === status).length;
    const recenziiFiltrate = filtru === 'toate' ? recenzii : recenzii.filter(r => r.status === filtru);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px', animation: 'spin 1s linear infinite' }}>💬</div>
                <p style={{ color: '#888' }}>Se încarcă...</p>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '24px', maxWidth: '860px', margin: '0 auto' }}>

            {/* ── Formular adăugare recenzie ── */}
            <div style={{
                background: 'white', borderRadius: '12px', padding: '24px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '24px',
                borderTop: '4px solid #1a237e',
            }}>
                <h3 style={{ margin: '0 0 16px' }}>📝 Adaugă o recenzie</h3>

                {atractiiDescoperite.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '24px',
                        background: '#f5f5f5', borderRadius: '8px', color: '#888'
                    }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗺️</div>
                        <p>Nu ai descoperit nicio atracție încă.<br />
                           Mergi pe hartă, ghicește o atracție și întoarce-te aici!</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Selectare atracție */}
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                                Atracție:
                            </label>
                            <select
                                value={atractieSelectata}
                                onChange={e => setAtractieSelectata(e.target.value)}
                                style={{
                                    width: '100%', padding: '8px', borderRadius: '6px',
                                    border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box'
                                }}
                            >
                                {atractiiDescoperite.map(a => (
                                    <option key={a.atractie_id} value={a.atractie_id}>
                                        {a.atractie_nume}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Nota */}
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                                Notă:
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button
                                        key={n} type="button"
                                        onClick={() => setNota(n)}
                                        style={{
                                            fontSize: '22px', background: 'none', border: 'none',
                                            cursor: 'pointer', opacity: n <= nota ? 1 : 0.3,
                                            transition: 'opacity 0.2s',
                                        }}
                                    >⭐</button>
                                ))}
                                <span style={{ alignSelf: 'center', fontSize: '13px', color: '#888' }}>
                                    {nota}/5
                                </span>
                            </div>
                        </div>

                        {/* Text */}
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                                Recenzia ta:
                            </label>
                            <textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder="Scrie experiența ta..."
                                required
                                rows={4}
                                style={{
                                    width: '100%', padding: '8px', borderRadius: '6px',
                                    border: '1px solid #ccc', fontSize: '14px',
                                    boxSizing: 'border-box', resize: 'vertical'
                                }}
                            />
                        </div>

                        {/* Imagini */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                                Imagini (opțional):
                            </label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                {imagini.map((f, i) => (
                                    <div key={i} style={{
                                        position: 'relative', width: '64px', height: '64px',
                                        borderRadius: '6px', overflow: 'hidden', border: '1px solid #ddd'
                                    }}>
                                        <img
                                            src={URL.createObjectURL(f)} alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setImagini(prev => prev.filter((_, idx) => idx !== i))}
                                            style={{
                                                position: 'absolute', top: '2px', right: '2px',
                                                background: 'rgba(0,0,0,0.6)', border: 'none',
                                                color: 'white', borderRadius: '50%',
                                                width: '18px', height: '18px', cursor: 'pointer',
                                                fontSize: '11px', lineHeight: '18px', textAlign: 'center'
                                            }}
                                        >✕</button>
                                    </div>
                                ))}
                                <button
                                    type="button" onClick={adaugaImagine}
                                    style={{
                                        width: '64px', height: '64px', borderRadius: '6px',
                                        border: '2px dashed #bbb', background: 'none',
                                        cursor: 'pointer', fontSize: '24px', color: '#bbb'
                                    }}
                                >+</button>
                            </div>
                        </div>

                        <button
                            type="submit" disabled={trimitere}
                            style={{
                                background: '#1a237e', color: 'white', border: 'none',
                                padding: '10px 24px', borderRadius: '8px',
                                cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                                opacity: trimitere ? 0.7 : 1,
                            }}
                        >
                            {trimitere ? 'Se trimite...' : '✉️ Trimite recenzia'}
                        </button>

                        {mesaj && (
                            <p style={{
                                marginTop: '12px', fontSize: '14px',
                                color: mesaj.startsWith('✅') ? '#2e7d32' : '#c62828'
                            }}>
                                {mesaj}
                            </p>
                        )}
                    </form>
                )}
            </div>

            {/* ── Recenziile mele ── */}
            <div style={{
                background: 'linear-gradient(135deg, #1a237e, #0d47a1)',
                color: 'white', padding: '24px', borderRadius: '12px',
                marginBottom: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}>
                <h2 style={{ margin: '0 0 8px' }}>💬 Recenziile mele</h2>
                <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>
                    {recenzii.length === 0
                        ? 'Nu ai lăsat nicio recenzie încă.'
                        : `${recenzii.length} recenz${recenzii.length === 1 ? 'ie' : 'ii'} în total`}
                </p>

                {recenzii.length > 0 && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                        {['aprobata', 'in_asteptare', 'respinsa'].map(s => (
                            <div key={s} style={{
                                background: 'rgba(255,255,255,0.15)', padding: '8px 16px',
                                borderRadius: '8px', textAlign: 'center', minWidth: '90px',
                            }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{numar(s)}</div>
                                <div style={{ fontSize: '11px', opacity: 0.85 }}>
                                    {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Filtre */}
            {recenzii.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {['toate', 'aprobata', 'in_asteptare', 'respinsa'].map(f => (
                        <button key={f} onClick={() => setFiltru(f)} style={{
                            padding: '6px 16px', borderRadius: '20px', border: 'none',
                            cursor: 'pointer', fontSize: '13px',
                            fontWeight: filtru === f ? 'bold' : 'normal',
                            background: filtru === f ? '#1a237e' : '#e0e0e0',
                            color: filtru === f ? 'white' : '#333',
                            transition: 'all 0.2s',
                        }}>
                            {f === 'toate'        ? `📋 Toate (${recenzii.length})` :
                             f === 'aprobata'     ? `✅ Aprobate (${numar(f)})` :
                             f === 'in_asteptare' ? `⏳ În așteptare (${numar(f)})` :
                                                   `❌ Respinse (${numar(f)})`}
                        </button>
                    ))}
                </div>
            )}

            {/* Lista */}
            {recenziiFiltrate.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '40px', background: 'white',
                    borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
                    <p style={{ color: '#888' }}>Nicio recenzie pentru filtrul selectat.</p>
                </div>
            ) : (
                recenziiFiltrate.map(r => {
                    const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG['in_asteptare'];
                    return (
                        <div key={r.id} style={{
                            background: 'white', borderRadius: '12px', padding: '20px',
                            marginBottom: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                            borderLeft: `4px solid ${cfg.color}`,
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                        📍 {r.atractie_nume || `Atracție #${r.atractie}`}
                                    </div>
                                    <StarRating nota={r.nota} />
                                </div>
                                <span style={{
                                    padding: '4px 12px', borderRadius: '20px', fontSize: '12px',
                                    fontWeight: 'bold', background: cfg.bg, color: cfg.color,
                                }}>
                                    {cfg.icon} {cfg.label}
                                </span>
                            </div>
                            <p style={{ margin: '12px 0 8px', color: '#444', lineHeight: 1.5 }}>{r.text}</p>
                            {r.imagini && r.imagini.length > 0 && (
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                    {r.imagini.map(img => (
                                        <img key={img.id}
                                            src={`http://localhost:8000${img.imagine}`} alt="recenzie"
                                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }}
                                        />
                                    ))}
                                </div>
                            )}
                            {r.status === 'respinsa' && r.motivRespingere && (
                                <div style={{
                                    background: '#ffebee', padding: '8px 12px', borderRadius: '6px',
                                    fontSize: '13px', color: '#c62828', marginBottom: '8px',
                                }}>
                                    <strong>Motiv respingere:</strong> {r.motivRespingere}
                                </div>
                            )}
                            <div style={{ fontSize: '12px', color: '#aaa' }}>
                                {new Date(r.data).toLocaleDateString('ro-RO', {
                                    day: '2-digit', month: '2-digit', year: 'numeric'
                                })}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default Recenzii;
