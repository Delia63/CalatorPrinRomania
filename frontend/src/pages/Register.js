import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
    const [form, setForm] = useState({
        username: '', email: '', password: '', password2: '',
        first_name: '', last_name: ''
    });
    const [eroare, setEroare] = useState('');
    const [succes, setSucces] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setEroare('');
        try {
            const response = await fetch('http://localhost:8000/api/utilizatori/inregistrare/', {
                method: 'POST',
                headers: { 'Content-Type': 'applications/json' },
                body: JSON.stringify(form)
            });
            const data = await response.json();
            if(!response.ok) {
                const firstError = Object.values(data)[0];
                setEroare(Array.isArray(firstError) ? firstError[0] : firstError);
            }
            else {
                setSucces(true);
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch {
            setEroare('Eroare de conexiune');
        } finally {
            setLoading(false);
        }
    };

    return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', background: '#f0f2f5' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Creează cont</h2>
        {succes ? (
          <p style={{ color: 'green', textAlign: 'center' }}>✅ Cont creat! Redirecționare spre login...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {[
              { name: 'first_name', placeholder: 'Prenume' },
              { name: 'last_name', placeholder: 'Nume' },
              { name: 'username', placeholder: 'Username' },
              { name: 'email', placeholder: 'Email', type: 'email' },
              { name: 'password', placeholder: 'Parolă', type: 'password' },
              { name: 'password2', placeholder: 'Confirmă parola', type: 'password' },
            ].map(field => (
              <input key={field.name} type={field.type || 'text'} name={field.name}
                placeholder={field.placeholder} value={form[field.name]}
                onChange={handleChange} required
                style={{ width: '100%', padding: '10px', marginBottom: '10px',
                  boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }} />
            ))}
            {eroare && <p style={{ color: 'red', fontSize: '13px', marginBottom: '10px' }}>{eroare}</p>}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '10px', background: '#4CAF50', color: 'white',
                border: 'none', borderRadius: '6px', fontSize: '15px', cursor: 'pointer' }}>
              {loading ? 'Se creează...' : 'Creează cont'}
            </button>
          </form>
        )}
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
          Ai deja cont? <Link to="/login">Autentifică-te</Link>
        </p>
      </div>
    </div>
  );
    
}

export default Register;