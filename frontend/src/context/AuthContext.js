import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [utilizator, setUtilizator] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('utilizator');

        if(token && userStr) setUtilizator(JSON.parse(userStr));
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await fetch('http://localhost:8000/api/utilizatori/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if(!response.ok) throw new Error(data.detail || 'Eroare la login');

        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        // fetch profil utilizator
        const profilResp = await fetch('http://localhost:8000/api/utilizatori/profil/', {
            headers: { 'Authorization': `Bearer ${data.access}`}
        });
        const profil = await profilResp.json()
        localStorage.setItem('utilizator', JSON.stringify(profil));
        setUtilizator(profil);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('utilizator');
        setUtilizator(null);
    };

    return (
        <AuthContext.Provider value={{ utilizator, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);