// src/routes/logout.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        const response = await fetch('http://localhost:5000/logout', {
          method: 'GET',
          credentials: 'include', // Include credentials to ensure cookies are sent with the request
        });

        if (response.ok) {
          console.log('Logout successful');
          // Clear any client-side stored tokens or session info here if needed
          navigate('/login'); // Redirect to login page after successful logout
        } else {
          console.error('Failed to logout:', response.status);
        }
      } catch (err) {
        console.error('Logout error:', err);
      }
    };

    performLogout();
  }, [navigate]);

  return null; // No need to render anything for logout
};

export default Logout;
