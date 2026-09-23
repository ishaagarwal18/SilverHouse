import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles, Phone, ShieldCheck, ArrowRight, AlertCircle, Building2,
  LogOut, MapPin, ShoppingBag, ChevronRight, ArrowLeft, Package,
  MessageCircle, RotateCcw, CheckCircle2, Edit2
} from 'lucide-react';
import { getAdminUrl } from '../../utils/adminUrl';

export default function AuthPage({ onTriggerToast }) {
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';

  // Step state: 'PHONE' or 'OTP'
  const [step, setStep] = useState('PHONE');
  const [phone, setPhone] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRefs = useRef([]);

  const { user, requestOtp, verifyOtp, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval = null;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  // Focus first OTP input when entering OTP step
  useEffect(() => {
    if (step === 'OTP' && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Handle Requesting OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestOtp(phone);
      if (res.success) {
        setFormattedPhone(res.formattedPhone || phone);
        if (res.devOtp) {
          setDevOtpHint(res.devOtp);
        }
        setStep('OTP');
        setTimer(45);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);

        if (onTriggerToast) {
          onTriggerToast(
            'success',
            'OTP Sent on WhatsApp',
            `💬 A 6-digit verification code was sent to ${res.formattedPhone || phone} via WhatsApp.`
          );
        }
      } else {
        setError(res.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Unable to send OTP. Please verify your phone number.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resending OTP
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await requestOtp(phone);
      if (res.success) {
        if (res.devOtp) {
          setDevOtpHint(res.devOtp);
        }
        setTimer(45);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
        if (inputRefs.current[0]) inputRefs.current[0].focus();

        if (onTriggerToast) {
          onTriggerToast('info', 'OTP Resent', '💬 A fresh code was sent to your WhatsApp.');
        }
      } else {
        setError(res.error || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Individual OTP Input
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    // Single character entered
    const char = cleanVal.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Auto-advance to next box
    if (index < 5 && char) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Support pasting full 6-digit code
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (pasteData.length >= 6) {
      const digits = pasteData.slice(0, 6).split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  // Quick auto-fill for testing/development
  const handleFillDevOtp = () => {
    if (devOtpHint && devOtpHint.length === 6) {
      setOtpDigits(devOtpHint.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  // Handle Verifying OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtp(formattedPhone || phone, fullOtp);
      if (result.success) {
        if (onTriggerToast) {
          onTriggerToast(
            'success',
            result.isAdmin ? 'Admin Authenticated' : 'Welcome to SilverHouse',
            result.isAdmin
              ? '👑 Admin Privileges Verified! Opening Admin Studio...'
              : '✨ You are successfully verified & signed in.'
          );
        }

        setTimeout(() => {
          if (result.isAdmin || result.user?.role?.toUpperCase() === 'ADMIN') {
            const targetUrl = (result.redirectUrl && result.redirectUrl.startsWith('http') && !result.redirectUrl.includes('localhost'))
              ? result.redirectUrl
              : getAdminUrl();
            window.location.href = targetUrl;
          } else if (redirectTarget === 'checkout' || redirectTarget === '/checkout') {
            navigate('/?checkout=true');
          } else {
            navigate(redirectTarget);
          }
        }, 500);
      } else {
        setError(result.error || 'Invalid OTP code. Please check and try again.');
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setStep('PHONE');
    setPhone('');
    setOtpDigits(['', '', '', '', '', '']);
    if (onTriggerToast) {
      onTriggerToast('info', 'Logged Out', '👋 You have been logged out securely.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-130px)] bg-[var(--th-bg)] text-[var(--th-text-main)] flex flex-col items-center justify-start pt-3 sm:pt-6 pb-8 px-3 sm:px-4 relative font-sans transition-colors duration-300">

      {/* Subtle Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-[var(--th-primary)]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[var(--th-accent)]/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* 1. LOGGED-IN VIEW: User Profile Dashboard & Logout */}
        {isAuthenticated && user ? (
          <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-2xl shadow-xl overflow-hidden p-5 sm:p-6 backdrop-blur-md">

            {/* Back Button Inside Card */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--th-border)]/60">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-[var(--th-text-muted)] hover:text-[var(--th-primary)] px-2.5 py-1 rounded-lg hover:bg-[var(--th-surface-alt)] border border-[var(--th-border)] transition-all cursor-pointer group"
                title="Go back to previous page"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[var(--th-accent)] group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--th-text-muted)]">
                Patron Dashboard
              </span>
            </div>

            {/* User Profile Header */}
            <div className="flex items-center space-x-3 pb-4 border-b border-[var(--th-border)]/70">
              <div className="w-12 h-12 rounded-xl bg-[var(--th-primary)]/15 border border-[var(--th-accent)] text-[var(--th-primary)] flex items-center justify-center font-serif text-xl font-bold shadow-sm shrink-0">
                {(user.fullName || user.phone || 'P').charAt(0).toUpperCase()}
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
                {user.phone ? (
                  <p className="text-[11px] font-mono text-[var(--th-text-muted)] truncate flex items-center gap-1 mt-0.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    {user.phone}
                  </p>
                ) : (
                  <p className="text-[11px] text-[var(--th-text-muted)] truncate">{user.email}</p>
                )}
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="py-3.5 space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--th-text-muted)]">
                Account Essentials
              </h3>

              {/* My Orders Card */}
              <button
                onClick={() => navigate('/orders')}
                className="w-full p-3 rounded-xl bg-[var(--th-surface-alt)] hover:bg-[var(--th-surface-alt)]/80 border border-[var(--th-border)] flex items-center justify-between text-left transition-all hover:border-[var(--th-accent)] cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--th-card)] border border-[var(--th-border)] text-[var(--th-accent)] flex items-center justify-center shadow-xs shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[var(--th-text-main)] group-hover:text-[var(--th-primary)] transition-colors">
                      My Orders
                    </h4>
                    <p className="text-[10px] text-[var(--th-text-muted)] truncate">
                      Track delivery, invoices & past purchases
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--th-text-muted)] group-hover:text-[var(--th-primary)] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

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
                  onClick={() => {
                    window.location.href = getAdminUrl();
                  }}
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
          /* 2. GUEST VIEW: WhatsApp OTP Authentication Card */
          <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-2xl shadow-xl overflow-hidden p-5 sm:p-6 backdrop-blur-md relative">

            {/* Top Navigation & Brand Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--th-border)]/50">
              <button
                type="button"
                onClick={() => {
                  if (step === 'OTP') {
                    setStep('PHONE');
                    setError('');
                  } else {
                    navigate(-1);
                  }
                }}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-[var(--th-text-muted)] hover:text-[var(--th-primary)] px-2.5 py-1 rounded-lg hover:bg-[var(--th-surface-alt)] border border-[var(--th-border)] transition-all cursor-pointer group"
                title="Go back"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[var(--th-accent)] group-hover:-translate-x-0.5 transition-transform" />
                <span>{step === 'OTP' ? 'Change Phone' : 'Back'}</span>
              </button>

              <div 
                onClick={() => navigate('/')} 
                className="inline-flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--th-accent)]" />
                <span className="font-serif text-sm font-bold tracking-wider text-[var(--th-text-main)]">
                  SILVER<span className="text-[var(--th-accent)]">HOUSE</span>
                </span>
              </div>
            </div>

            {/* WhatsApp Badge Banner */}
            <div className="mb-4 flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold tracking-wide w-fit mx-auto">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 fill-emerald-600/20" />
              <span>Fast & Secure WhatsApp Login</span>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center space-x-1.5 animate-in fade-in duration-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                <span className="leading-tight">{error}</span>
              </div>
            )}

            {/* STEP 1: PHONE NUMBER INPUT */}
            {step === 'PHONE' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="text-center mb-2">
                  <h1 className="text-lg font-bold text-[var(--th-text-main)] font-serif">
                    Sign In with Phone
                  </h1>
                  <p className="text-xs text-[var(--th-text-muted)] mt-1">
                    Enter your mobile number to receive a 6-digit WhatsApp verification code.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--th-text-main)] mb-1.5">
                    Mobile Number *
                  </label>
                  <div className="flex rounded-xl border border-[var(--th-border)] bg-[var(--th-surface-alt)] focus-within:border-[var(--th-primary)] focus-within:ring-1 focus-within:ring-[var(--th-primary)]/20 transition-all overflow-hidden">
                    <div className="flex items-center gap-1 px-3 bg-[var(--th-surface-alt)] border-r border-[var(--th-border)] text-xs font-bold text-[var(--th-text-main)] select-none">
                      <span className="text-sm">🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        autoFocus
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full bg-transparent text-[var(--th-text-main)] px-3 py-2.5 text-sm font-medium tracking-wide outline-none placeholder:text-[var(--th-text-muted)]/50"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-[var(--th-text-muted)] mt-1">
                    No password required. New patrons are registered automatically.
                  </p>
                </div>

                {/* Send OTP Button */}
                <button
                  type="submit"
                  disabled={loading || !phone.trim()}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 transform active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 fill-white/20" />
                      <span>Send WhatsApp OTP</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: DEDICATED OTP CARD */}
            {step === 'OTP' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center mb-1">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mx-auto mb-2 flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-[var(--th-text-main)] font-serif">
                    Enter Verification Code
                  </h2>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--th-text-muted)] mt-1">
                    <span>Sent to WhatsApp:</span>
                    <strong className="text-[var(--th-text-main)] font-mono">{formattedPhone || phone}</strong>
                    <button
                      type="button"
                      onClick={() => { setStep('PHONE'); setError(''); }}
                      className="text-[var(--th-accent)] hover:underline ml-1 inline-flex items-center gap-0.5 cursor-pointer"
                      title="Edit phone number"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="py-2">
                  <div className="flex justify-between items-center gap-1.5 sm:gap-2" onPaste={handlePaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className={`w-11 h-12 sm:w-12 sm:h-14 text-center font-mono text-xl font-bold rounded-xl border transition-all outline-none ${
                          digit
                            ? 'border-emerald-500 bg-emerald-50/20 text-[var(--th-text-main)] ring-1 ring-emerald-500/20'
                            : 'border-[var(--th-border)] bg-[var(--th-surface-alt)] text-[var(--th-text-main)] focus:border-[var(--th-primary)] focus:ring-2 focus:ring-[var(--th-primary)]/20'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Dev / Test OTP Helper Pill if available */}
                  {devOtpHint && (
                    <div className="mt-2.5 p-1.5 px-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-200">
                      <span>Test OTP: <strong className="font-mono tracking-widest">{devOtpHint}</strong></span>
                      <button
                        type="button"
                        onClick={handleFillDevOtp}
                        className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-100 underline hover:no-underline cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}
                </div>

                {/* Resend OTP Section */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[var(--th-text-muted)] text-[11px]">
                    Didn't receive the WhatsApp message?
                  </span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Resend OTP</span>
                    </button>
                  ) : (
                    <span className="font-mono font-semibold text-[var(--th-text-muted)] text-[11px]">
                      Resend in {timer}s
                    </span>
                  )}
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length !== 6}
                  className="w-full py-3 px-4 bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 transform active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Footer Trust Guarantee */}
            <div className="mt-4 pt-3 border-t border-[var(--th-border)]/50 text-center text-[10px] text-[var(--th-text-muted)] flex items-center justify-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--th-accent)] shrink-0" />
              <span>Official WhatsApp Business OTP & BIS Hallmarked Security</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

