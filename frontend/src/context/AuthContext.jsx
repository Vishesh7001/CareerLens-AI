import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check existing session on mount via HTTP-only cookie
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await authService.getMe();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 unauthenticated is normal on fresh visit
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (credentials) => {
    setError(null);
    try {
      const data = await authService.login(credentials);
      if (data.success && data.user) {
        setUser(data.user);
        return data;
      }
      throw new Error(data.message || 'Login failed');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Register handler
  const register = async (userData) => {
    setError(null);
    try {
      const data = await authService.register(userData);
      if (data.success && data.user) {
        setUser(data.user);
        return data;
      }
      throw new Error(data.message || 'Registration failed');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  // Update profile handler
  const updateProfile = async (updateData) => {
    setError(null);
    try {
      const data = await authService.updateProfile(updateData);
      if (data.success && data.user) {
        setUser(data.user);
        return data;
      }
      throw new Error(data.message || 'Profile update failed');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

