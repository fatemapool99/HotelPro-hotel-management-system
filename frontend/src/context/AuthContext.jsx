import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('hotelpro_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('hotelpro_token') || null;
  });

  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  // On mount, verify current user if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('hotelpro_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('hotelpro_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem('hotelpro_token');
          localStorage.removeItem('hotelpro_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, requiredRole) => {
    const res = await authAPI.login({ email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    if (requiredRole && receivedUser.role !== requiredRole) {
      throw new Error('This account does not have admin access. Please use Guest Sign In.');
    }
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('hotelpro_token', receivedToken);
    localStorage.setItem('hotelpro_user', JSON.stringify(receivedUser));
    return receivedUser;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    // SkillWallet Rule: Ordinary registration creates the user and redirects to Login
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('hotelpro_token');
    localStorage.removeItem('hotelpro_user');
    setUser(null);
    setToken(null);
  };

  const updateCurrentUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('hotelpro_user', JSON.stringify(updatedUser));
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        logout,
        updateCurrentUser,
        authModal,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
