// src/App.js
import React, { useEffect } from 'react';
import './App.css'
import { BrowserRouter, Router, Route, Routes, useNavigate} from 'react-router-dom';
import Cookies from 'js-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';

import Header from './header/Header';
import Login from './routes/login';
import Register from './routes/register';
import MainPage from './routes/MainPage';
import Upload from './routes/upload';
import Videos from './routes/videos';
import Logout from './routes/logout';

// Helper function to check if the user is authenticated
const isAuthenticated = () => {
  const token = Cookies.get('token');
  return !!token; // Returns true if token exists, otherwise false
};
// Function to clear cookies
const clearCookies = () => {
  document.cookie = 'token=; Max-Age=0; path=/';
};

// Component to handle server checks and network status
const ServerCheck = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkServer = async () => {
      if (!navigator.onLine) {
        // If offline, assume server is unreachable
        console.warn('No internet connection detected.');
        clearCookies();
        navigate('/login');
        return;
      }

      try {
        // Attempt to fetch with a timeout to check server status
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

        const response = await fetch('http://localhost:5000/check-server', {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error('Server is down or unauthorized');
        }
      } catch (error) {
        console.error('Server check failed or fetch timeout:', error.message);
        clearCookies();
        navigate('/login');
      }
    };

    checkServer();
  }, [navigate]);

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <ServerCheck>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/" element={isAuthenticated() ? <MainPage /> : <Login />} />
            <Route path="/upload" element={isAuthenticated() ? <Upload /> : <Login />} />
            <Route path="/videos" element={isAuthenticated() ? <Videos /> : <Login />} />
            <Route path="/logout" element={isAuthenticated() ? <Logout /> : <Login />} />
          </Routes>
        </ServerCheck>
      </div>
    </BrowserRouter>
  );
}

export default App;
