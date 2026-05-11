import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminLayout } from './AdminDashboard';

function AdminRecenzii() {
    const { utilizator } = useAuth();
    const navigate = useNavigate();
    const [recenzii, setRecenzii] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [filtru, setFiltru]     = useState('in_asteptare');
    const [motivModal, setMotivModal] = useState(null); // { id, motiv }

    const token = localStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    useEffect(() => {
        if (!utilizator?.is_staff) { navigate('/admin-login'); return; }
        fetch('http://localhost:8000/api/recenzii/?format=json', { headers })
            .then(r => r.json())
            .then(data => {
                setRecenzii(Array.isArray(data) ? data : (data.results || []));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [utilizator, navigate]); // eslint-disable-line

    const aproba = async (id) => {
        await fetch(`http://localhost:8000/api/recenzii/${id}/aproba/`, {
            method: 'PATCH', headers
        });
        setRecenzii(prev => prev.map(r => r.id === id ? { ...r, status: 'aprobata' } : r));
    };

    const respinge = async (id, motiv) => {
        await fetch(`http://localhost:8000/api/recenzii/${id}/respinge/`, {
            method: 'PATCH',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ motiv })
        });
        setRecenzii(prev => prev.map(r =>
            r.id === id ? { ...r, status: 'respinsa', motivRespingere: motiv } : r
        ));
        setMotivModal(null);
    };

    const STATUS_STYLE = {
        aprobata:     { bg: '#e8f5e9', color: '#2e7d32', label: '✅ Aprobată' },
        respinsa:     { bg: '#ffebee', color: '#c62828', label: '❌ Respinsă' },
        in_asteptare: { bg: '#fff3e0', color: '#e65100', label: '⏳ În așteptare' },
    };

    const recenziiFiltrate = filtru === 'toate'
        ? recenzii
        : recenzii.filter(r => r.status === filtru);

    const numar = s => recenzii.filter(r => r.status === s).length;

    return (
        <AdminLayout>
            <h1 style={{ margin: '0 0 4px', fontSize: '24px' }}>💬 Gestionare Recenzii</h1>
            <p style={{ color: '#888', marginBottom: '24px' }}>
                Aprobă sau respinge recenziile trimise de utilizatori.
            </p>

            {/* Filtre */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {[
                    { k: 'in_asteptare', l: `⏳ În așteptare (${numar('in_asteptare')})` },
                    { k: 'aprobata',     l: `✅ Aprobate (${numar('aprobata')})` },
                    { k: 'respinsa',     l: `❌ Respinse (${numar('respinsa')})` },
                    { k: 'toate',        l: `📋 Toate (${recenzii.length})` },
                ].map(f => (
                    <button key={f.k} onClick={() => setFiltru(f.k)} style={{
                        padding: '8px 18px', borderRadius: '20px', border: 'none',
                        cursor: 'pointer', fontSize: '13px',
                        background: filtru === f.k ? '#1a237e' : '#e0e0e0',
                        color: filtru === f.k ? 'white' : '#333',
                        fontWeight: filtru === f.k ? 'bold' : 'normal',
                        transition: 'all 0.2s',
                    }}>
                        {f.l}
                    </button>
                ))}
            </div>

            {loading ? (
                <p>Se încarcă...</p>
            ) : recenziiFiltrate.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '48px', background: 'white',
                    borderRadius: '12px', color: '#888',
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                    <p>Nicio recenzie pentru filtrul selectat.</p>
                </div>
            ) : (
                recenziiFiltrate.map(r => {
                    const st = STATUS_STYLE[r.status] || STATUS_STYLE['in_asteptare'];
                    return (
                        <div key={r.id} style={{
                            background: 'white', borderRadius: '12px', padding: '20px',
                            marginBottom: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                            borderLeft: `4px solid ${st.color}`,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                                        👤 {r.utilizator_username}
                                        <span style={{ fontWeight: 'normal', color: '#888', marginLeft: '8px' }}>
                                            → 📍 {r.atractie_nume || `Atracție #${r.atractie}`}
                                        </span>
                                    </div>
                                    <div style={{ color: '#FF6F00', fontSize: '16px', margin: '4px 0' }}>
                                        {'⭐'.repeat(r.nota)}{'☆'.repeat(5 - r.nota)}
                                    </div>
                                </div>
                                <span style={{
                                    padding: '4px 14px', borderRadius: '20px', fontSize: '12px',
                                    fontWeight: 'bold', background: st.bg, color: st.color,
                                }}>
                                    {st.label}
                                </span>
                            </div>

                            <p style={{ margin: '12px 0', color: '#444', lineHeight: 1.6 }}>{r.text}</p>

                            {r.imagini && r.imagini.length > 0 && (
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
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
                                    fontSize: '13px', color: '#c62828', marginBottom: '12px',
                                }}>
                                    <strong>Motiv respingere:</strong> {r.motivRespingere}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#aaa' }}>
                                    {new Date(r.data).toLocaleDateString('ro-RO', {
                                        day: '2-digit', month: '2-digit', year: 'numeric'
                                    })}
                                </span>
                                {r.status === 'in_asteptare' && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => aproba(r.id)} style={{
                                            padding: '8px 18px', background: '#2e7d32', color: 'white',
                                            border: 'none', borderRadius: '8px', cursor: 'pointer',
                                            fontWeight: 'bold', fontSize: '13px',
                                        }}>
                                            ✅ Aprobă
                                        </button>
                                        <button onClick={() => setMotivModal({ id: r.id, motiv: '' })} style={{
                                            padding: '8px 18px', background: '#c62828', color: 'white',
                                            border: 'none', borderRadius: '8px', cursor: 'pointer',
                                            fontWeight: 'bold', fontSize: '13px',
                                        }}>
                                            ❌ Respinge
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            )}

            {/* Modal respingere */}
            {motivModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '32px',
                        width: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    }}>
                        <h3 style={{ margin: '0 0 16px' }}>❌ Respinge recenzia</h3>
                        <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>
                            Utilizatorul va fi notificat cu motivul respingerii.
                        </p>
                        <textarea
                            placeholder="Motivul respingerii (ex: conținut inadecvat)..."
                            value={motivModal.motiv}
                            onChange={e => setMotivModal(prev => ({ ...prev, motiv: e.target.value }))}
                            rows={3}
                            style={{
                                width: '100%', padding: '10px', borderRadius: '8px',
                                border: '1px solid #ddd', fontSize: '14px',
                                boxSizing: 'border-box', marginBottom: '16px', resize: 'vertical',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setMotivModal(null)} style={{
                                padding: '8px 18px', background: '#e0e0e0', border: 'none',
                                borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                            }}>
                                Anulează
                            </button>
                            <button
                                onClick={() => respinge(motivModal.id, motivModal.motiv || 'Conținut inadecvat')}
                                style={{
                                    padding: '8px 18px', background: '#c62828', color: 'white',
                                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                                    fontWeight: 'bold', fontSize: '13px',
                                }}
                            >
                                Confirmă respingerea
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default AdminRecenzii;
