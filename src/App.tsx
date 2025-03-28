import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import MaintenanceCalendar from './components/Calendar/MaintenanceCalendar';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // In a real app, these functions would make API calls to authenticate users
  const handleLogin = (email: string, password: string) => {
    console.log("Login attempt:", email, password);
    // For demo purposes, we'll just set authenticated to true
    // In a real app, you'd validate credentials against a backend
    setIsAuthenticated(true);
  };
  
  const handleSignup = (email: string, password: string) => {
    console.log("Signup attempt:", email, password);
    // For demo purposes, we'll just log the attempt
    // In a real app, you'd create a user account in your backend
    // Then redirect to login
    alert("Account created! Please log in.");
  };
  
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? 
              <Navigate to="/calendar" replace /> : 
              <Login onLogin={handleLogin} />
          } />
          <Route path="/signup" element={
            isAuthenticated ? 
              <Navigate to="/calendar" replace /> : 
              <Signup onSignup={handleSignup} />
          } />
          <Route path="/calendar" element={
            isAuthenticated ? 
              <MaintenanceCalendar /> : 
              <Navigate to="/login" replace />
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
