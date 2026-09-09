import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, Lock, Mail, User, Phone, Eye, EyeOff, ShieldCheck, 
  ArrowRight, CheckCircle2, AlertCircle, KeyRound, Building2,
  LogOut, MapPin, ShoppingBag, ChevronRight
} from 'lucide-react';

export default function AuthPage({ onTriggerToast }) {
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
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

  // Quick Preset Fillers
  const fillAdminCredentials = () => {
    setActiveTab('login');
    setEmail('admin@silverhouse.com');
    setPassword('Admin@123');
    setError('');
  };

  const fillCustomerCredentials = () => {
    setActiveTab('login');
    setEmail('customer@silverhouse.com');
    setPassword('User@123');
    setError('');
  };

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
          }, 600);
        }
      } else {
        const result = await register({ fullName, email, phone, password });
        if (result.success) {
          if (onTriggerToast) {
            onTriggerToast('success', 'Account Created', '🎉 Welcome to SilverHouse! Your account is ready.');
          }
          setTimeout(() => {
            navigate(redirectTarget);
          }, 600);
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
    <div className="min-h-screen bg-[var(--th-bg)] text-[var(--th-text-main)] flex items-center justify-center p-4 py-12 relative overflow-hidden font-sans transition-colors duration-300">
      
      {/* Background Ambient Glow Effects matching theme */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--th-primary)]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[var(--th-accent)]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Decorative Floating Sparkles */}
      <div className="absolute top-12 left-12 opacity-30 animate-pulse">
        <Sparkles className="w-8 h-8 text-[var(--th-accent)]" />
      </div>
      <div className="absolute bottom-16 right-16 opacity-30 animate-pulse">
        <ShieldCheck className="w-10 h-10 text-[var(--th-primary)]" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div 
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--th-primary)] text-white p-0.5 shadow-xl mb-3 cursor-pointer transform hover:scale-105 transition-transform duration-300"
          >
            <div className="w-full h-full bg-[var(--th-card)] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[var(--th-accent)]" />
            </div>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--th-text-main)] mb-1">
            SILVER<span className="text-[var(--th-accent)]">HOUSE</span>
          </h1>
          <p className="text-xs text-[var(--th-text-muted)] font-medium tracking-widest uppercase">
            SACRED 925 & 999 PURE SILVER
          </p>
        </div>

        {/* 1. LOGGED-IN VIEW: User Profile Dashboard & Logout */}
        {isAuthenticated && user ? (
          <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 backdrop-blur-md">
            
            {/* User Profile Header */}
            <div className="flex items-center space-x-4 pb-6 border-b border-[var(--th-border)]/70">
              <div className="w-16 h-16 rounded-2xl bg-[var(--th-primary)]/15 border-2 border-[var(--th-accent)] text-[var(--th-primary)] flex items-center justify-center font-serif text-2xl font-bold shadow-md shrink-0">
                {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--th-text-main)] truncate">
                    {user.fullName || 'Valued Patron'}
                  </h2>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    isAdmin 
                      ? 'bg-[var(--th-accent)] text-white' 
                      : 'bg-[var(--th-surface-alt)] text-[var(--th-primary)] border border-[var(--th-border)]'
                  }`}>
                    {user.role || 'CUSTOMER'}
                  </span>
                </div>
                <p className="text-xs text-[var(--th-text-muted)] truncate mt-0.5">{user.email}</p>
                {user.phone && (
                  <p className="text-xs text-[var(--th-text-muted)] mt-0.5">📞 {user.phone}</p>
                )}
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="py-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--th-text-muted)]">
                Account Essentials
              </h3>

              {/* Saved Addresses Card */}
              <button
                onClick={() => navigate('/addresses')}
                className="w-full p-4 rounded-2xl bg-[var(--th-surface-alt)] hover:bg-[var(--th-surface-alt)]/80 border border-[var(--th-border)] flex items-center justify-between text-left transition-all hover:border-[var(--th-accent)] hover:shadow-md cursor-pointer group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[var(--th-card)] border border-[var(--th-border)] text-[var(--th-accent)] flex items-center justify-center shadow-xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--th-text-main)] group-hover:text-[var(--th-primary)] transition-colors">
                      Delivery Addresses
                    </h4>
                    <p className="text-xs text-[var(--th-text-muted)]">
                      Manage your saved home, office, and gifting locations
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--th-text-muted)] group-hover:text-[var(--th-primary)] group-hover:translate-x-1 transition-all" />
              </button>

              {/* Shopping Catalog Card */}
              <button
                onClick={() => navigate('/catalog')}
                className="w-full p-4 rounded-2xl bg-[var(--th-surface-alt)] hover:bg-[var(--th-surface-alt)]/80 border border-[var(--th-border)] flex items-center justify-between text-left transition-all hover:border-[var(--th-accent)] hover:shadow-md cursor-pointer group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[var(--th-card)] border border-[var(--th-border)] text-[var(--th-accent)] flex items-center justify-center shadow-xs">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--th-text-main)] group-hover:text-[var(--th-primary)] transition-colors">
                      Explore Silver Catalog
                    </h4>
                    <p className="text-xs text-[var(--th-text-muted)]">
                      Browse coins, sacred idols, jewellery & silverware
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--th-text-muted)] group-hover:text-[var(--th-primary)] group-hover:translate-x-1 transition-all" />
              </button>

              {/* Admin Studio Link (If Admin) */}
              {isAdmin && (
                <a
                  href="http://localhost:5000/api/data"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-4 rounded-2xl bg-[var(--th-surface-alt)] hover:bg-[var(--th-surface-alt)]/80 border border-[var(--th-border)] flex items-center justify-between text-left transition-all hover:border-[var(--th-accent)] hover:shadow-md cursor-pointer group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[var(--th-card)] border border-[var(--th-border)] text-[var(--th-accent)] flex items-center justify-center shadow-xs">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--th-text-main)] group-hover:text-[var(--th-primary)] transition-colors">
                        Open Admin Studio
                      </h4>
                      <p className="text-xs text-[var(--th-text-muted)]">
                        Database portal & catalog manager
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--th-text-muted)] group-hover:text-[var(--th-primary)] group-hover:translate-x-1 transition-all" />
                </a>
              )}
            </div>

            {/* Logout Action Button */}
            <div className="pt-4 border-t border-[var(--th-border)]/70 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleLogout}
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-rose-300/80 bg-rose-50/50 hover:bg-rose-100/70 text-rose-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs hover:shadow-md"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md hover:shadow-lg"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          /* 2. GUEST VIEW: Login / Register Form */
          <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 backdrop-blur-md">
            
            {/* Quick Testing Credentials Banner */}
            <div className="mb-6 bg-[var(--th-surface-alt)] border border-[var(--th-border)] rounded-2xl p-3 shadow-xs">
              <div className="text-[11px] font-bold text-[var(--th-text-muted)] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-[var(--th-accent)]">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Quick Login Fillers</span>
                </span>
                <span className="text-[10px] text-[var(--th-text-muted)] font-normal">Click to test</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="py-1.5 px-2.5 bg-[var(--th-card)] hover:bg-[var(--th-primary)]/10 text-[var(--th-text-main)] border border-[var(--th-border)] rounded-xl text-[11px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>👑 Admin Demo</span>
                  <span className="text-[9px] text-[var(--th-accent)] font-mono">1-Click</span>
                </button>
                <button
                  type="button"
                  onClick={fillCustomerCredentials}
                  className="py-1.5 px-2.5 bg-[var(--th-card)] hover:bg-[var(--th-primary)]/10 text-[var(--th-text-main)] border border-[var(--th-border)] rounded-xl text-[11px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>🛍️ Customer Demo</span>
                  <span className="text-[9px] text-[var(--th-accent)] font-mono">1-Click</span>
                </button>
              </div>
            </div>

            {/* Segmented Auth Mode Switcher */}
            <div className="flex bg-[var(--th-surface-alt)] p-1 rounded-2xl border border-[var(--th-border)] mb-6">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(''); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all uppercase tracking-wider cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-[var(--th-primary)] text-white shadow-md'
                    : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setError(''); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all uppercase tracking-wider cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-[var(--th-primary)] text-white shadow-md'
                    : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name (Register only) */}
              {activeTab === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-[var(--th-text-main)] mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[var(--th-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Yash Agarwal"
                      className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] pl-10 pr-4 py-3 rounded-xl text-xs outline-none transition-all placeholder:text-[var(--th-text-muted)]/60 focus:ring-2 focus:ring-[var(--th-primary)]/20"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-[var(--th-text-main)] mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--th-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] pl-10 pr-4 py-3 rounded-xl text-xs outline-none transition-all placeholder:text-[var(--th-text-muted)]/60 focus:ring-2 focus:ring-[var(--th-primary)]/20"
                  />
                </div>
              </div>

              {/* Phone field (Register only) */}
              {activeTab === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-[var(--th-text-main)] mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[var(--th-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] pl-10 pr-4 py-3 rounded-xl text-xs outline-none transition-all placeholder:text-[var(--th-text-muted)]/60 focus:ring-2 focus:ring-[var(--th-primary)]/20"
                    />
                  </div>
                </div>
              )}

              {/* Password field */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-[var(--th-text-main)]">
                    Password *
                  </label>
                  {activeTab === 'login' && (
                    <span 
                      onClick={() => alert("For password reset, please contact support@silverhouse.com or use the demo credentials.")}
                      className="text-[11px] text-[var(--th-accent)] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--th-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] pl-10 pr-10 py-3 rounded-xl text-xs outline-none transition-all placeholder:text-[var(--th-text-muted)]/60 focus:ring-2 focus:ring-[var(--th-primary)]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 px-4 bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center space-x-2 transform active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{activeTab === 'login' ? 'Sign In & Continue' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Trust Guarantee */}
            <div className="mt-6 text-center text-[11px] text-[var(--th-text-muted)] flex items-center justify-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--th-accent)]" />
              <span>256-Bit SSL Encrypted & BIS Hallmarked Trust</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
