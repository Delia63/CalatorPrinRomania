import React, { use } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Harta from './components/Harta';
import Login from './pages/Login';
import Register from "./pages/Register";
import Profil from "./pages/Profil";
import TrseePrestabilite from "./pages/TrseePrestabilite";

function ProtectedRoute({ children }) {
  const { utilizator, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return utilizator ? children : <Navigate to="/login" />;
}

function AppContent() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ paddingTop: '56px', height: '100vh', boxSizing: 'border-box' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Harta />
            </ProtectedRoute>
          } />
          <Route path="/profil" element={
            <ProtectedRoute>
              <Profil />
            </ProtectedRoute>
          } />
          <Route path="/trasee-prestabilite" element={
            <ProtectedRoute>
              <TrseePrestabilite />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;