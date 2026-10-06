import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Spinner } from '../ui';

/** Username/password gate shown whenever there is no valid admin session. */
export default function AdminLoginScreen() {
  const { login, notice } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username.trim(), password.trim());
      const dest = location.state?.from?.pathname || '/admin/data/product';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
      setBusy(false);
    }
  };

  const alert = error || notice;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-amber-400/40 bg-gray-900 text-gray-100 shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
        <div className="border-b border-white/10 bg-linear-to-b from-amber-400/10 to-transparent px-6 pt-7 pb-5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-400">
            <ShieldCheck className="w-3.5 h-3.5" /> SilverHouse Studio
          </span>
          <h1 className="mt-3 text-[22px] font-bold tracking-tight text-white">Administrator Sign In</h1>
          <p className="mt-1.5 text-[13px] text-gray-400">Direct access requires authorised administrative credentials.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6" autoComplete="on">
          {alert && (
            <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/15 px-3.5 py-2.5 text-[12.5px] leading-snug text-red-300">
              {alert}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-username" className="text-xs font-semibold text-gray-200">Admin Username or Mobile</label>
            <input
              id="admin-username"
              name="username"
              type="text"
              required
              autoFocus
              autoComplete="username"
              placeholder="e.g. admin or 98XXXXXXXX"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-3 text-sm text-white outline-none transition focus:border-amber-500 focus:ring-3 focus:ring-amber-500/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-password" className="text-xs font-semibold text-gray-200">Admin Password</label>
            <div className="relative">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-3 pl-3.5 pr-11 text-sm text-white outline-none transition focus:border-amber-500 focus:ring-3 focus:ring-amber-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-amber-400 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-br from-amber-500 to-amber-600 py-3 text-sm font-bold text-gray-900 shadow-lg shadow-amber-500/30 transition hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 cursor-pointer"
          >
            {busy ? <><Spinner /> Verifying credentials…</> : <>Sign In to Admin Studio <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="flex items-start gap-2 border-t border-white/5 bg-black/25 px-6 py-4 text-[11.5px] leading-relaxed text-gray-500">
          <Lock className="mt-0.5 w-3.5 h-3.5 shrink-0" />
          <span>Customers authenticate via WhatsApp OTP on the public store. This console is restricted exclusively to authenticated administrators.</span>
        </div>
      </div>
    </div>
  );
}
