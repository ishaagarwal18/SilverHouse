import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, Lock, Mail, User, Phone, Eye, EyeOff, ShieldCheck, 
  ArrowRight, CheckCircle2, AlertCircle, KeyRound, Building2
} from 'lucide-react';

export default function AuthPage({ onTriggerToast }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const { login, register } = useAuth();
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
            onTriggerToast(result.isAdmin ? '👑 Admin Privileges Verified! Opening Admin Studio...' : '✨ Welcome back to SilverHouse!');
          }
          
          setTimeout(() => {
            if (result.isAdmin) {
              window.location.href = 'http://localhost:5000/api/data';
            } else {
              navigate('/');
            }
          }, 800);
        }
      } else {
        const result = await register({ fullName, email, phone, password });
        if (result.success) {
          if (onTriggerToast) {
            onTriggerToast('🎉 Account created successfully! Welcome to SilverHouse.');
          }
          setTimeout(() => {
            navigate('/');
          }, 800);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#4F46E5]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Decorative Floating Sparkles */}
      <div className="absolute top-12 left-12 opacity-30 animate-pulse">
        <Sparkles className="w-8 h-8 text-[#D4AF37]" />
      </div>
      <div className="absolute bottom-16 right-16 opacity-30 animate-pulse">
        <ShieldCheck className="w-10 h-10 text-white" />
      </div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#AA820A] p-0.5 shadow-xl shadow-[#D4AF37]/20 mb-4 transform hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#0F172A] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#D4AF37]" />
            </div>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white mb-1">
            SILVER<span className="text-[#D4AF37]">HOUSE</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">
            SACRED 925 & 999 PURE SILVER
          </p>
        </div>

        {/* Quick Testing Credentials Banner */}
        <div className="mb-6 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-lg">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-[#D4AF37]">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Quick Login Fillers</span>
            </span>
            <span className="text-[10px] text-slate-500 font-normal">Click to autofill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="px-2.5 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/30 text-indigo-200 rounded-lg text-xs font-semibold text-left transition-all flex items-center space-x-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">Admin Studio</span>
            </button>
            <button
              type="button"
              onClick={fillCustomerCredentials}
              className="px-2.5 py-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#E5C158] rounded-lg text-xs font-semibold text-left transition-all flex items-center space-x-1.5"
            >
              <User className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="truncate">Customer Store</span>
            </button>
          </div>
        </div>

        {/* Main Glassmorphism Auth Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/80 relative">
          
          {/* Tab Navigation */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-950/80 rounded-xl mb-6 border border-slate-800/80">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setError(''); }}
              className={`py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Alert Badge */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name field (Register only) */}
            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-[#D4AF37] text-white pl-10 pr-4 py-3 rounded-xl text-xs outline-none transition-all placeholder:text-slate-600 focus:ring-1 focus:ring-[#D4AF37]/50"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-[#D4AF37] text-white pl-10 pr-4 py-3 rounded-xl text-xs outline-none transition-all placeholder:text-slate-600 focus:ring-1 focus:ring-[#D4AF37]/50"
                />
              </div>
            </div>

            {/* Phone field (Register only) */}
            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-[#D4AF37] text-white pl-10 pr-4 py-3 rounded-xl text-xs outline-none transition-all placeholder:text-slate-600 focus:ring-1 focus:ring-[#D4AF37]/50"
                  />
                </div>
              </div>
            )}

            {/* Password field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password *
                </label>
                {activeTab === 'login' && (
                  <span className="text-[11px] text-[#D4AF37] hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-[#D4AF37] text-white pl-10 pr-10 py-3 rounded-xl text-xs outline-none transition-all placeholder:text-slate-600 focus:ring-1 focus:ring-[#D4AF37]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 px-4 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#AA820A] hover:brightness-110 text-black font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 transition-all flex items-center justify-center space-x-2 transform active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{activeTab === 'login' ? 'Authenticate & Proceed' : 'Register Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 text-center text-[11px] text-slate-500 flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>256-Bit SSL Encrypted & BIS Hallmarked Trust</span>
          </div>

        </div>
      </div>
    </div>
  );
}
