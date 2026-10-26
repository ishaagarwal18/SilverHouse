import React, { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles, Palette, Radio, ExternalLink } from 'lucide-react';
import {
  FESTIVAL_THEMES,
  getActiveFestivalTheme,
  setFestivalTheme,
  resolveFestivalThemeId,
} from '../../components/festival/FestivalDecorOverlay';
import { useTheme } from '../../context/ThemeContext';
import { adminFetch } from '../api/adminApi';

/** Badge colours per festival theme id */
const THEME_ACCENTS = {
  rakshabandhan: { bg: 'from-rose-600/25 via-red-600/15 to-amber-500/20', ring: 'ring-rose-400', dot: 'bg-rose-400', text: 'text-rose-300' },
  holi: { bg: 'from-pink-500/20 via-yellow-500/10 to-cyan-500/20', ring: 'ring-pink-400', dot: 'bg-pink-400', text: 'text-pink-300' },
  patriotic: { bg: 'from-orange-500/20 via-sky-500/10 to-emerald-500/20', ring: 'ring-orange-400', dot: 'bg-orange-400', text: 'text-orange-300' },
  uttarayan: { bg: 'from-sky-500/20 to-cyan-500/10', ring: 'ring-sky-400', dot: 'bg-sky-400', text: 'text-sky-300' },
  valentines: { bg: 'from-rose-500/20 to-pink-500/10', ring: 'ring-rose-400', dot: 'bg-rose-400', text: 'text-rose-300' },
  newyear: { bg: 'from-violet-500/20 to-purple-500/10', ring: 'ring-violet-400', dot: 'bg-violet-400', text: 'text-violet-300' },
  ganeshchaturthi: { bg: 'from-orange-500/20 to-amber-500/10', ring: 'ring-orange-400', dot: 'bg-orange-400', text: 'text-orange-300' },
  karwachauth: { bg: 'from-red-500/20 to-rose-500/10', ring: 'ring-red-400', dot: 'bg-red-400', text: 'text-red-300' },
  diwali: { bg: 'from-yellow-500/20 to-amber-500/10', ring: 'ring-yellow-400', dot: 'bg-yellow-400', text: 'text-yellow-300' },
  christmas: { bg: 'from-green-500/20 to-emerald-500/10', ring: 'ring-green-400', dot: 'bg-green-400', text: 'text-green-300' },
  navratri: { bg: 'from-fuchsia-500/20 to-pink-500/10', ring: 'ring-fuchsia-400', dot: 'bg-fuchsia-400', text: 'text-fuchsia-300' },
  none: { bg: 'from-slate-500/20 to-slate-600/10', ring: 'ring-slate-400', dot: 'bg-slate-400', text: 'text-slate-300' },
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
            {isActive ? 'Currently displayed across all screens' : 'Click to activate everywhere'}
          </span>
        </div>
      </div>
    </div>
  );
}

function WebsiteColorCard({ theme, isActive, onActivate }) {
  return (
    <div
      onClick={() => onActivate(theme.id)}
      className={`
        relative cursor-pointer rounded-2xl border transition-all duration-300 select-none p-5
        ${isActive
          ? 'border-transparent bg-ad-card ring-2 ring-ad-primary shadow-lg shadow-black/20'
          : 'border-ad-border bg-ad-surface hover:border-ad-muted hover:shadow-md'}
      `}
      role="radio"
      aria-checked={isActive}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(theme.id); } }}
    >
      {isActive && (
        <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/40">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Active Palette
        </span>
      )}

      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex items-center -space-x-1.5">
          <span className="w-5 h-5 rounded-full border border-white shadow-xs" style={{ backgroundColor: theme.preview.primary }} />
          <span className="w-5 h-5 rounded-full border border-white shadow-xs" style={{ backgroundColor: theme.preview.accent }} />
          <span className="w-5 h-5 rounded-full border border-white shadow-xs" style={{ backgroundColor: theme.preview.bg }} />
        </div>
        <div>
          <h3 className="text-[15px] font-extrabold text-ad-text">{theme.name}</h3>
          <span className="text-[11px] font-medium text-ad-muted">{theme.vibe}</span>
        </div>
      </div>

      <p className="mt-2 text-[12px] text-ad-muted leading-relaxed">{theme.description}</p>

      {/* Swatches strip */}
      <div className="mt-4 flex items-center gap-1.5 rounded-lg p-1.5 bg-ad-bg/70 border border-ad-border">
        <span className="text-[10px] font-mono text-ad-muted mr-1">Preview:</span>
        <span className="h-4 flex-1 rounded-sm" style={{ backgroundColor: theme.preview.primary }} title="Primary" />
        <span className="h-4 flex-1 rounded-sm" style={{ backgroundColor: theme.preview.accent }} title="Accent Gold" />
        <span className="h-4 flex-1 rounded-sm border border-ad-border" style={{ backgroundColor: theme.preview.bg }} title="Page BG" />
        <span className="h-4 flex-1 rounded-sm border border-ad-border" style={{ backgroundColor: theme.preview.card }} title="Card Surface" />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-2 ${isActive ? 'ring-ad-primary' : 'ring-ad-border'}`}>
          {isActive && <span className="h-2 w-2 rounded-full bg-ad-primary" />}
        </span>
        <span className={`text-[12px] font-semibold ${isActive ? 'text-ad-primary' : 'text-ad-muted'}`}>
          {isActive ? 'Applied globally across all screens' : 'Click to apply website theme'}
        </span>
      </div>
    </div>
  );
}

export default function FestivalThemeManagerPage() {
  const { theme: websiteTheme, setTheme: setWebsiteTheme, themes: websiteThemes, currentThemeObj } = useTheme();
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
        if (ok && data?.parameters && isMounted) {
          if (data.parameters.current_festival) {
            const resolved = resolveFestivalThemeId(data.parameters.current_festival);
            if (resolved) {
              setActive(resolved);
              setFestivalTheme(resolved);
            }
          }
          if (data.parameters.default_theme) {
            setWebsiteTheme(data.parameters.default_theme);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch store parameters in festival manager:', err);
      }
    }
    syncBackendTheme();
    return () => { isMounted = false; };
  }, [setWebsiteTheme]);

  // Stay in sync if another tab changes either theme
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

  const handleActivateWebsiteTheme = async (themeId) => {
    if (themeId === websiteTheme && !isSaving) return;
    setWebsiteTheme(themeId);
    triggerToast(`Website theme updated to "${websiteThemes.find(t => t.id === themeId)?.name || themeId}" across all screens!`);
  };

  const handleActivateFestivalTheme = async (themeId) => {
    if (themeId === activeTheme && !isSaving) return;
    setFestivalTheme(themeId);
    setActive(themeId);
    const themeObj = FESTIVAL_THEMES.find((t) => t.id === themeId);
    const festivalName = themeObj ? themeObj.name : themeId;
    triggerToast(`Festival decor updated to "${festivalName}" across all screens!`);

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

  return (
    <div className="flex flex-col gap-8 px-4 py-6 md:px-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-ad-primary to-ad-accent text-white shadow-md shadow-ad-primary/30">
            <Palette className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ad-text">Website & Festival Theme Manager</h1>
            <p className="text-[13px] text-ad-muted">
              Select any website theme or festive decor below — changes are persisted to the database and applied instantly on every screen.
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

      {/* SECTION 1: WEBSITE COLOR PALETTE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-ad-border pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-ad-primary" />
            <h2 className="text-lg font-bold text-ad-text">Website Color Palette Theme</h2>
          </div>
          <span className="text-xs font-semibold text-ad-muted">
            Currently: <strong className="text-ad-text">{currentThemeObj?.name || websiteTheme}</strong>
          </span>
        </div>
        <p className="text-xs text-ad-muted">
          Controls the primary colors, button gradients, card accents, borders, and brand aesthetic of SilverHouse for all customers and screens.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="radiogroup" aria-label="Website color theme selection">
          {websiteThemes.map((theme) => (
            <WebsiteColorCard
              key={theme.id}
              theme={theme}
              isActive={websiteTheme === theme.id}
              onActivate={handleActivateWebsiteTheme}
            />
          ))}
        </div>
      </section>

      {/* SECTION 2: FESTIVAL THEME SUITE */}
      <section className="space-y-4 pt-4 border-t border-ad-border">
        <div className="flex items-center justify-between border-b border-ad-border pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-ad-primary" />
            <h2 className="text-lg font-bold text-ad-text">Seasonal Festival Decor Themes</h2>
          </div>
          <span className="text-xs font-semibold text-ad-muted">
            Currently: <strong className="text-ad-text">{activeMeta ? `${activeMeta.icon} ${activeMeta.name}` : '—'}</strong>
          </span>
        </div>
        <p className="text-xs text-ad-muted">
          Decorates the storefront with animated festive elements, torans, diyas, lamps, sparkles, and seasonal banners for Indian festivals and holidays.
        </p>

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          role="radiogroup"
          aria-label="Festival theme selection"
        >
          {FESTIVAL_THEMES.map((theme) => (
            <FestivalThemeCard
              key={theme.id}
              theme={theme}
              isActive={activeTheme === theme.id}
              onActivate={handleActivateFestivalTheme}
            />
          ))}
        </div>
      </section>

      {/* Footer note */}
      <p className="text-center text-[12px] text-ad-muted pb-4">
        Every theme selection is automatically synchronized with the database. Whenever an administrator changes any theme, all open screens, tabs, and visitor sessions update immediately.
      </p>
    </div>
  );
}
