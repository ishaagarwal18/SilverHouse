import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles, Lock, Mail, User, Phone, Eye, EyeOff, ShieldCheck,
  ArrowRight, AlertCircle, Building2, LogOut, MapPin, ShoppingBag, ChevronRight
} from 'lucide-react';

export default function AuthPage({ onTriggerToast }) {
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';

  const [activeTab, setActiveTab] = useState(() => {
    return window.location.pathname.includes('register') ? 'register' : 'login';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const { user, login, register, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const result = await login(email, password);
        if (result.success) {
          if (onTriggerToast) {
            onTriggerToast(
              'success',
              result.isAdmin ? 'Admin Authenticated' : 'Welcome Back',
              result.isAdmin
                ? '👑 Admin Privileges Verified! Opening Admin Studio...'
                : '✨ You have successfully signed in to SilverHouse.'
            );
          }

          setTimeout(() => {
            if (result.isAdmin) {
              navigate('/admin');
            } else {
              navigate(redirectTarget);
            }
          }, 500);
        }
      } else {
        const result = await register({ fullName, email, phone, password });
        if (result.success) {
          if (onTriggerToast) {
            onTriggerToast('success', 'Account Created', '🎉 Welcome to SilverHouse! Your account is ready.');
          }
          setTimeout(() => {
            navigate(redirectTarget);
          }, 500);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    if (onTriggerToast) {
      onTriggerToast('info', 'Logged Out', '👋 You have been logged out securely.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-130px)] bg-[var(--th-bg)] text-[var(--th-text-main)] flex flex-col items-center justify-start pt-3 sm:pt-5 pb-8 px-3 sm:px-4 relative font-sans transition-colors duration-300">

      {/* Subtle Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-[var(--th-primary)]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[var(--th-accent)]/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* 1. LOGGED-IN VIEW: User Profile Dashboard & Logout */}
        {isAuthenticated && user ? (
          <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-2xl shadow-xl overflow-hidden p-5 sm:p-6 backdrop-blur-md">

            {/* User Profile Header */}
            <div className="flex items-center space-x-3 pb-4 border-b border-[var(--th-border)]/70">
              <div className="w-12 h-12 rounded-xl bg-[var(--th-primary)]/15 border border-[var(--th-accent)] text-[var(--th-primary)] flex items-center justify-center font-serif text-xl font-bold shadow-sm shrink-0">
                {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-[var(--th-text-main)] truncate">
                    {user.fullName || 'Valued Patron'}
                  </h2>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-[var(--th-accent)] text-white'
                      : 'bg-[var(--th-surface-alt)] text-[var(--th-primary)] border border-[var(--th-border)]'
                  }`}>
                    {user.role || 'CUSTOMER'}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--th-text-muted)] truncate">{user.email}</p>
                {user.phone && (
                  <p className="text-[10px] text-[var(--th-text-muted)]">📞 {user.phone}</p>
                )}
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="py-3.5 space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--th-text-muted)]">
                Account Essentials
              </h3>

              {/* Saved Addresses Card */}
              <button
                onClick={() => navigate('/addresses')}
                className="w-full p-3 rounded-xl bg-[var(--th-surface-alt)] hover:bg-[var(--th-surface-alt)]/80 border border-[var(--th-border)] flex items-center justify-between text-left transition-all hover:border-[var(--th-accent)] cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--th-card)] border border-[var(--th-border)] text-[var(--th-accent)] flex items-center justify-center shadow-xs shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[var(--th-text-main)] group-hover:text-[var(--th-primary)] transition-colors">
                      Delivery Addresses
                    </h4>
                    <p className="text-[10px] text-[var(--th-text-muted)] truncate">
                      Manage saved home & office locations
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--th-text-muted)] group-hover:text-[var(--th-primary)] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              {/* Shopping Catalog Card */}
              <button
                onClick={() => navigate('/catalog')}
                className="w-full p-3 rounded-xl bg-[var(--th-surface-alt)] hover:bg-[var(--th-surface-alt)]/80 border border-[var(--th-border)] flex items-center justify-between text-left transition-all hover:border-[var(--th-accent)] cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--th-card)] border border-[var(--th-border)] text-[var(--th-accent)] flex items-center justify-center shadow-xs shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[var(--th-text-main)] group-hover:text-[var(--th-primary)] transition-colors">
                      Explore Silver Catalog
                    </h4>
                    <p className="text-[10px] text-[var(--th-text-muted)] truncate">
                      Browse coins, sacred idols & silverware
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--th-text-muted)] group-hover:text-[var(--th-primary)] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              {/* Admin Studio Link (If Admin) */}
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full p-3 rounded-xl bg-[var(--th-surface-alt)] hover:bg-[var(--th-surface-alt)]/80 border border-[var(--th-border)] flex items-center justify-between text-left transition-all hover:border-[var(--th-accent)] cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--th-card)] border border-[var(--th-border)] text-[var(--th-accent)] flex items-center justify-center shadow-xs shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[var(--th-text-main)] group-hover:text-[var(--th-primary)] transition-colors">
                        Open Admin Studio
                      </h4>
                      <p className="text-[10px] text-[var(--th-text-muted)] truncate">
                        Catalog management & analytics
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--th-text-muted)] group-hover:text-[var(--th-primary)] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              )}
            </div>

            {/* Logout & Navigation Actions */}
            <div className="pt-3 border-t border-[var(--th-border)]/70 flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 px-3 rounded-xl border border-rose-300/80 bg-rose-50/50 hover:bg-rose-100/70 text-rose-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>

              <button
                onClick={() => navigate('/')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-md"
              >
                <span>Shop</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ) : (
          /* 2. GUEST VIEW: Login / Register Form (Compact 1-Screen) */
          <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-2xl shadow-xl overflow-hidden p-5 sm:p-6 backdrop-blur-md">

            {/* Brand Header */}
            <div className="text-center mb-3">
              <div 
                onClick={() => navigate('/')} 
                className="inline-flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[var(--th-accent)]" />
                <span className="font-serif text-lg font-bold tracking-wider text-[var(--th-text-main)]">
                  SILVER<span className="text-[var(--th-accent)]">HOUSE</span>
                </span>
              </div>
              <p className="text-[10px] text-[var(--th-text-muted)] tracking-widest uppercase mt-0.5">
                SACRED 925 & 999 PURE SILVER
              </p>
            </div>

            {/* Segmented Auth Mode Switcher */}
            <div className="flex bg-[var(--th-surface-alt)] p-1 rounded-xl border border-[var(--th-border)] mb-3">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-[var(--th-primary)] text-white shadow-sm'
                    : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setError(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-[var(--th-primary)] text-white shadow-sm'
                    : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-2.5 p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center space-x-1.5 animate-in fade-in duration-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                <span className="truncate">{error}</span>
              </div>
            )}

            {/* Compact Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-2.5">

              {/* Full Name (Register only) */}
              {activeTab === 'register' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--th-text-main)] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-[var(--th-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Yash Agarwal"
                      className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] pl-9 pr-3 py-2 rounded-lg text-xs outline-none transition-all placeholder:text-[var(--th-text-muted)]/60 focus:ring-1 focus:ring-[var(--th-primary)]/20"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--th-text-main)] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[var(--th-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] pl-9 pr-3 py-2 rounded-lg text-xs outline-none transition-all placeholder:text-[var(--th-text-muted)]/60 focus:ring-1 focus:ring-[var(--th-primary)]/20"
                  />
                </div>
              </div>

              {/* Phone field (Register only) */}
              {activeTab === 'register' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--th-text-main)] mb-1">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-[var(--th-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] pl-9 pr-3 py-2 rounded-lg text-xs outline-none transition-all placeholder:text-[var(--th-text-muted)]/60 focus:ring-1 focus:ring-[var(--th-primary)]/20"
                    />
                  </div>
                </div>
              )}

              {/* Password field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-semibold text-[var(--th-text-main)]">
                    Password *
                  </label>
                  {activeTab === 'login' && (
                    <span
                      onClick={() => alert("For password assistance, please contact support@silverhouse.com")}
                      className="text-[10px] text-[var(--th-accent)] hover:underline cursor-pointer"
                    >
                      Forgot?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[var(--th-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] pl-9 pr-9 py-2 rounded-lg text-xs outline-none transition-all placeholder:text-[var(--th-text-muted)]/60 focus:ring-1 focus:ring-[var(--th-primary)]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] transition-colors cursor-pointer p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-2.5 px-4 bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2 transform active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{activeTab === 'login' ? 'Sign In & Continue' : 'Create Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Trust Guarantee */}
            <div className="mt-3 text-center text-[10px] text-[var(--th-text-muted)] flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-[var(--th-accent)]" />
              <span>256-Bit SSL Encrypted & BIS Hallmarked Trust</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
