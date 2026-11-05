import React, { useState } from 'react';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { clearAdminSession, getAdminSession } from './services/adminAuth.service';

export default function App() {
  const [adminSession, setAdminSession] = useState<string | null>(getAdminSession());

  const handleLoginSuccess = (email: string) => {
    setAdminSession(email);
  };

  const handleLogout = () => {
    clearAdminSession();
    setAdminSession(null);
  };

  if (!adminSession) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard adminEmail={adminSession} onLogout={handleLogout} />;
}