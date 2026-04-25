import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const { user, loading } = useAuth(); // We "turn on the tap" to get 'user' and 'loading'

  // 1. CONCEPT: The "Waiting" state
  // If the app is still checking localStorage, we show a simple loading message
  if (loading) {
    return <div className="h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <Routes>
      {/* 2. LOGIC: If user is logged in, and they try to go to /login or /register, 
             automatically send them to /dashboard */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      {/* 3. LOGIC: If user tries to go to /dashboard but IS NOT logged in, 
             automatically send them back to /login */}
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />

      {/* 4. DEFAULT: Any other URL redirects to login or dashboard depending on status */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default App;
