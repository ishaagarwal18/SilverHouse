import React, { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import {
  FESTIVAL_THEMES,
  getActiveFestivalTheme,
  setFestivalTheme,
  resolveFestivalThemeId,
} from '../../components/festival/FestivalDecorOverlay';
import { adminFetch } from '../api/adminApi';

/** Badge colours per festival theme id */
const THEME_ACCENTS = {
  none: { bg: 'from-slate-600/20 via-zinc-600/15 to-slate-700/15', ring: 'ring-slate-400', dot: 'bg-slate-300', text: 'text-slate-200' },
  diwali: { bg: 'from-yellow-500/25 via-amber-500/15 to-orange-500/20', ring: 'ring-yellow-400', dot: 'bg-yellow-400', text: 'text-yellow-300' },
  ganeshchaturthi: { bg: 'from-orange-500/25 via-amber-500/15 to-red-500/20', ring: 'ring-orange-400', dot: 'bg-orange-400', text: 'text-orange-300' },
  rakshabandhan: { bg: 'from-rose-600/25 via-red-600/15 to-amber-500/20', ring: 'ring-rose-400', dot: 'bg-rose-400', text: 'text-rose-300' },
  valentines: { bg: 'from-rose-500/25 via-pink-500/15 to-red-400/20', ring: 'ring-rose-400', dot: 'bg-rose-400', text: 'text-rose-300' },
  navratri: { bg: 'from-fuchsia-500/25 via-pink-500/15 to-purple-500/20', ring: 'ring-fuchsia-400', dot: 'bg-fuchsia-400', text: 'text-fuchsia-300' },
  patriotic: { bg: 'from-orange-500/25 via-sky-500/15 to-emerald-500/20', ring: 'ring-orange-400', dot: 'bg-orange-400', text: 'text-orange-300' },
  uttarayan: { bg: 'from-sky-500/25 via-cyan-500/15 to-blue-500/20', ring: 'ring-sky-400', dot: 'bg-sky-400', text: 'text-sky-300' },
  karwachauth: { bg: 'from-red-500/25 via-rose-500/15 to-amber-500/20', ring: 'ring-red-400', dot: 'bg-red-400', text: 'text-red-300' },
  holi: { bg: 'from-pink-500/25 via-yellow-500/15 to-cyan-500/20', ring: 'ring-pink-400', dot: 'bg-pink-400', text: 'text-pink-300' },
  christmas: { bg: 'from-green-500/25 via-emerald-500/15 to-red-500/15', ring: 'ring-green-400', dot: 'bg-green-400', text: 'text-green-300' },
  newyear: { bg: 'from-violet-500/25 via-purple-500/15 to-indigo-500/20', ring: 'ring-violet-400', dot: 'bg-violet-400', text: 'text-violet-300' },
};

function FestivalThemeCard({ theme, isActive, onActivate }) {
  const accent = THEME_ACCENTS[theme.id] ?? THEME_ACCENTS.none;

  return (
    <div
      onClick={() => onActivate(theme.id)}
      className={`
        relative cursor-pointer rounded-2xl border transition-all duration-300 select-none
        bg-gradient-to-br ${accent.bg}
        ${isActive
          ? `border-transparent ring-2 ${accent.ring} shadow-lg shadow-black/30`
          : 'border-ad-border hover:border-ad-muted hover:shadow-md hover:shadow-black/20'}
      `}
      role="radio"
      aria-checked={isActive}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(theme.id); } }}
    >
      {/* Active badge */}
      {isActive && (
        <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-ad-primary/20 px-2.5 py-0.5 text-[11px] font-bold text-ad-primary ring-1 ring-ad-primary/40">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Active
        </span>
      )}

      <div className="p-5">
        {/* Icon + name */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-4xl leading-none">{theme.icon}</span>
          <div className="min-w-0">
            <p className="text-[15px] font-extrabold text-ad-text leading-snug">{theme.name}</p>
            <p className="mt-1 text-[12px] text-ad-muted leading-relaxed">{theme.description}</p>
          </div>
        </div>

        {/* Radio indicator */}
        <div className="mt-4 flex items-center gap-2">
          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-2 ${isActive ? accent.ring : 'ring-ad-border'}`}>
            {isActive && <span className={`h-2 w-2 rounded-full ${accent.dot}`} />}
          </span>
          <span className={`text-[12px] font-semibold ${isActive ? accent.text : 'text-ad-muted'}`}>
            {isActive ? 'Currently displayed across all screens' : 'Click to activate on website'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function FestivalThemeManagerPage() {
  const [activeTheme, setActive] = useState(() => getActiveFestivalTheme());
  const [toastMessage, setToastMessage] = useState('');
  const [toastId, setToastId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    const id = Date.now();
    setToastId(id);
    setTimeout(() => setToastId((cur) => (cur === id ? null : cur)), 3500);
  };

  // Sync with backend on mount
  useEffect(() => {
    let isMounted = true;
    async function syncBackendTheme() {
      try {
        const { ok, data } = await adminFetch('/parameters', { skipAuth: true });
        if (ok && data?.parameters?.current_festival && isMounted) {
          const resolved = resolveFestivalThemeId(data.parameters.current_festival);
          if (resolved) {
            setActive(resolved);
            setFestivalTheme(resolved);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch store parameters in festival manager:', err);
      }
    }
    syncBackendTheme();
    return () => { isMounted = false; };
  }, []);

  // Stay in sync if another tab changes the theme
  useEffect(() => {
    const festHandler = (e) => {
      if (e.detail?.themeId) setActive(e.detail.themeId);
    };
    const storageHandler = (e) => {
      if (e.key === 'silverhouse_active_festival_theme' && e.newValue) {
        const resolved = resolveFestivalThemeId(e.newValue);
        if (resolved) setActive(resolved);
      }
    };
    window.addEventListener('silverhouse_festival_theme_updated', festHandler);
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('silverhouse_festival_theme_updated', festHandler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  const handleActivateTheme = async (themeId) => {
    if (themeId === activeTheme && !isSaving) return;
    setFestivalTheme(themeId);
    setActive(themeId);
    const themeObj = FESTIVAL_THEMES.find((t) => t.id === themeId);
    const festivalName = themeObj ? themeObj.name : themeId;
    triggerToast(`Website theme updated to "${festivalName}" across all screens!`);

    // Persist to database store_parameter table so all storefront visitors see it immediately
    setIsSaving(true);
    try {
      await adminFetch('/admin/parameters', {
        method: 'POST',
        body: { current_festival: festivalName }
      });
    } catch (err) {
      console.error('Failed to update store parameters in database:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const activeMeta = FESTIVAL_THEMES.find((t) => t.id === activeTheme);

  // Reorder themes: Standard Store Theme first, followed by seasonal festivals
  const standardTheme = FESTIVAL_THEMES.find(t => t.id === 'none');
  const festiveThemes = FESTIVAL_THEMES.filter(t => t.id !== 'none');
  const orderedThemes = standardTheme ? [standardTheme, ...festiveThemes] : FESTIVAL_THEMES;

  return (
    <div className="flex flex-col gap-8 px-4 py-6 md:px-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-ad-primary to-ad-accent text-white shadow-md shadow-ad-primary/30">
            <Sparkles className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ad-text">Festival Theme Manager</h1>
            <p className="text-[13px] text-ad-muted">
              Choose the active website theme or festival celebration. Selected theme updates across all visitor screens and sessions.
            </p>
          </div>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-ad-border bg-ad-card px-3.5 py-2 text-xs font-bold text-ad-text hover:bg-ad-hover transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-ad-primary" />
          Preview Live Storefront
        </a>
      </div>

      {/* Floating Success Toast */}
      {toastId && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-2xl animate-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Active Theme Status Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-ad-border bg-ad-card p-5">
        <div className="flex items-center gap-3.5">
          <span className="text-3xl">{activeMeta?.icon || '💎'}</span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-ad-muted">Currently Active Website Theme</p>
            <h2 className="text-lg font-extrabold text-ad-text">{activeMeta?.name || 'Standard Store Theme'}</h2>
            <p className="text-xs text-ad-muted mt-0.5">{activeMeta?.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto rounded-full bg-emerald-500/15 px-3 py-1 ring-1 ring-emerald-500/30 text-emerald-400 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          Live on Storefront
        </div>
      </div>

      {/* Grid of All Store & Festival Themes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-ad-border pb-3">
          <h2 className="text-base font-bold text-ad-text">Select Website Theme</h2>
          <span className="text-xs text-ad-muted">
            1-Click Activation • Saved to Database
          </span>
        </div>

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          role="radiogroup"
          aria-label="Website theme selection"
        >
          {orderedThemes.map((theme) => (
            <FestivalThemeCard
              key={theme.id}
              theme={theme}
              isActive={activeTheme === theme.id}
              onActivate={handleActivateTheme}
            />
          ))}
        </div>
      </section>

      {/* Footer note */}
      <p className="text-center text-[12px] text-ad-muted pb-4">
        Only <strong className="text-ad-text">one theme</strong> is active at a time. Selecting any theme saves it to the database table <code className="font-mono text-[11px] bg-ad-card px-1 py-0.5 rounded">store_parameter.current_festival</code> and propagates immediately to all patrons across every screen.
      </p>
    </div>
  );
}
