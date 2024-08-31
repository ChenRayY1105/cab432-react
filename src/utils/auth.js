// src/utils/auth.js
import Cookies from 'js-cookie';

export const isAuthenticated = () => {
  // Check if the JWT token exists in cookies
  const token = Cookies.get('token');
  return !!token; // Returns true if token exists, false otherwise
};
