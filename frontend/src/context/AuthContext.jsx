import { createContext, useState } from "react";
// 1. Ensure the import name matches the usage
import { jwtDecode } from "jwt-decode"; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        // 2. Use the correct function name: jwtDecode
        return jwtDecode(token);
      } catch (err) {
        console.error("Invalid token on initial load", err);
        localStorage.removeItem("access_token"); // Clean up bad tokens
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

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};