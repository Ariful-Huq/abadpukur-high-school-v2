// frontend/src/context/AuthContext.jsx
import { createContext, useState } from "react";
import { jwtDecode } from "jwt-decode"; 
// Import the API call
import { logout as logoutAPI } from "../api/authApi"; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        return jwtDecode(token);
      } catch (err) {
        console.error("Invalid token on initial load", err);
        localStorage.removeItem("access_token");
        return null;
      }
    }
    return null;
  });

  const login = (token) => {
    localStorage.setItem("access_token", token);
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (err) {
      console.error("Failed to decode login token", err);
    }
  };

  // --- UPDATED LOGOUT LOGIC ---
  const logout = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        // Notify backend to blacklist token and create Audit Log
        await logoutAPI(refresh);
      }
    } catch (err) {
      // We log the error but proceed with frontend logout anyway
      console.error("Backend logout failed", err);
    } finally {
      // Clear all local data and state
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      setUser(null);
      
      // Optional: Force redirect to login page
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};