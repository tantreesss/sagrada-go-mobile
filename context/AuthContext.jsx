// context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

// Create authentication context
const AuthContext = createContext();

// Provide authentication state to the app
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use authentication state
export function useAuth() {
  return useContext(AuthContext);
}
