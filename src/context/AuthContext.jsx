import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, fetchCurrentUser, sendPhoneOtp, verifyPhoneOtp, updateUserProfile } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('silverhouse_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('silverhouse_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (token) {
        const currentUser = await fetchCurrentUser(token);
        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem('silverhouse_user', JSON.stringify(currentUser));
        } else {
          // Token expired or invalid
          logout();
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    if (data.success) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('silverhouse_token', data.token);
      localStorage.setItem('silverhouse_user', JSON.stringify(data.user));
    }
    return data;
  };

  const register = async (userData) => {
    const data = await registerUser(userData);
    if (data.success) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('silverhouse_token', data.token);
      localStorage.setItem('silverhouse_user', JSON.stringify(data.user));
    }
    return data;
  };

  const requestOtp = async (phone) => {
    return await sendPhoneOtp(phone);
  };

  const verifyOtp = async (phone, otp, fullName) => {
    const data = await verifyPhoneOtp(phone, otp, fullName);
    if (data.success) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('silverhouse_token', data.token);
      localStorage.setItem('silverhouse_user', JSON.stringify(data.user));
    }
    return data;
  };

  const updateProfile = async (profileData) => {
    const data = await updateUserProfile(profileData, token);
    if (data.success && data.user) {
      setUser(data.user);
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('silverhouse_token', data.token);
      }
      localStorage.setItem('silverhouse_user', JSON.stringify(data.user));
    }
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('silverhouse_token');
    localStorage.removeItem('silverhouse_user');
  };

  const isAdmin = Boolean(user && user.role && user.role.toUpperCase() === 'ADMIN');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        requestOtp,
        verifyOtp,
        updateProfile,
        logout,
        isAdmin,
        isAuthenticated: Boolean(user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
