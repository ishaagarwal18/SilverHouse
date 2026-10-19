import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, fetchCurrentUser, sendPhoneOtp, verifyPhoneOtp, updateUserProfile } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('silverhouse_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedToken = localStorage.getItem('silverhouse_token');
      if (!savedToken) return null;
      const savedUser = localStorage.getItem('silverhouse_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
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
      } else {
        setUser(null);
        localStorage.removeItem('silverhouse_user');
      }
      setLoading(false);
    }
    initAuth();

    const handleLogoutSync = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('silverhouse_unauthorized', handleLogoutSync);
    window.addEventListener('silverhouse_admin_logout', handleLogoutSync);
    return () => {
      window.removeEventListener('silverhouse_unauthorized', handleLogoutSync);
      window.removeEventListener('silverhouse_admin_logout', handleLogoutSync);
    };
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

  const requestOtp = async (phone, mode, extraData = {}) => {
    return await sendPhoneOtp(phone, mode, extraData);
  };

  const verifyOtp = async (phone, otp, fullName, extraData) => {
    const data = await verifyPhoneOtp(phone, otp, fullName, extraData);
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
    localStorage.removeItem('silverhouse_admin_token');
    localStorage.removeItem('silverhouse_admin_user');
    localStorage.removeItem('silverhouse_cart');
    localStorage.removeItem('silverhouse_guest_cart');
    localStorage.removeItem('silverhouse_guest_wishlist');
    localStorage.removeItem('silverhouse_guest_token');
    localStorage.removeItem('silverhouse_pincode');
    localStorage.removeItem('silverhouse_active_address_id');
    window.dispatchEvent(new Event('silverhouse_logout'));
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
