import React, { use } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Harta from './components/Harta';
import Login from './pages/Login';
import Register from "./pages/Register";
import Profil from "./pages/Profil";
import TrseePrestabilite from "./pages/TrseePrestabilite";
import LandingPage from "./pages/LandingPage";
import BadgeToast from "./components/BadgeToast";

function ProtectedRoute({ children }) {
  const { utilizator, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return utilizator ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { utilizator } = useAuth();

  return (
    <BrowserRouter>
      <Navbar />
      <BadgeToast />
      <div style={{ paddingTop: '56px', height: '100vh', boxSizing: 'border-box' }}>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            utilizator ? <Harta /> : <LandingPage />
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