import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
            color: 'white',
        }}>
            {/* Hero */}
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: '80vh', textAlign: 'center',
                padding: '40px 20px',
            }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🗺️</div>
                <h1 style={{
                    fontSize: '48px', fontWeight: 'bold', margin: '0 0 16px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                }}>
                    CalătorPrinRomânia
                </h1>
                <p style={{
                    fontSize: '20px', maxWidth: '600px', margin: '0 0 32px',
                    opacity: 0.9, lineHeight: 1.6,
                }}>
                    Descoperă cele mai frumoase locuri din România.
                    Planifică trasee, ghicește atracții, colectează badge-uri
                    și explorează gastronomia locală.
                </p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link to="/register" style={{
                        padding: '14px 32px', background: '#FF6F00', color: 'white',
                        textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold',
                        fontSize: '16px', boxShadow: '0 4px 12px rgba(255,111,0,0.4)',
                        transition: 'transform 0.2s',
                    }}>
                        🚀 Începe Aventura
                    </Link>
                    <Link to="/login" style={{
                        padding: '14px 32px', background: 'rgba(255,255,255,0.15)',
                        color: 'white', textDecoration: 'none', borderRadius: '8px',
                        fontWeight: 'bold', fontSize: '16px',
                        border: '2px solid rgba(255,255,255,0.4)',
                        transition: 'transform 0.2s',
                    }}>
                        🔑 Am deja cont
                    </Link>
                </div>
            </div>

            {/* Features */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px', padding: '40px 20px', maxWidth: '1000px', margin: '0 auto',
            }}>
                {[
                    { emoji: '🏰', titlu: 'Atracții turistice', desc: 'Descoperă castele, mănăstiri, peșteri și alte minuni ale României' },
                    { emoji: '🧩', titlu: 'Ghicește & Câștigă', desc: 'Răspunde la curiozități despre atracții și câștigă XP' },
                    { emoji: '🗺️', titlu: 'Trasee inteligente', desc: 'Calculează rute optime cu atracții, festivaluri și gastronomie' },
                    { emoji: '🏅', titlu: 'Badge-uri', desc: 'Colectează badge-uri speciale pe măsură ce explorezi' },
                    { emoji: '🎪', titlu: 'Festivaluri', desc: 'Descoperă festivalurile care au loc în perioada călătoriei tale' },
                    { emoji: '⭐', titlu: 'Recenzii', desc: 'Lasă recenzii cu poze la atracțiile vizitate' },
                ].map((f, i) => (
                    <div key={i} style={{
                        background: 'rgba(255,255,255,0.1)', padding: '24px',
                        borderRadius: '12px', textAlign: 'center',
                        backdropFilter: 'blur(10px)',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>{f.emoji}</div>
                        <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>{f.titlu}</h3>
                        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>{f.desc}</p>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{
                textAlign: 'center', padding: '24px', opacity: 0.6, fontSize: '13px',
            }}>
                © 2026 CalătorPrinRomânia — Proiect de licență
            </div>
        </div>
    );
}

export default LandingPage;
