import React, { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles, Radio } from 'lucide-react';
import {
  FESTIVAL_THEMES,
  getActiveFestivalTheme,
  setFestivalTheme,
} from '../../components/festival/FestivalDecorOverlay';

/** Badge colours per theme id */
const THEME_ACCENTS = {
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

function ThemeCard({ theme, isActive, onActivate }) {
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
            {isActive ? 'Currently displayed on storefront' : 'Click to activate'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function FestivalThemeManagerPage() {
  const [activeTheme, setActive] = useState(() => getActiveFestivalTheme());
  const [toastId, setToastId] = useState(null);

  // Stay in sync if another tab changes the theme
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.themeId) setActive(e.detail.themeId);
    };
    window.addEventListener('silverhouse_festival_theme_updated', handler);
    return () => window.removeEventListener('silverhouse_festival_theme_updated', handler);
  }, []);

  const handleActivate = (themeId) => {
    if (themeId === activeTheme) return;
    setFestivalTheme(themeId);
    setActive(themeId);
    const id = Date.now();
    setToastId(id);
    setTimeout(() => setToastId((cur) => (cur === id ? null : cur)), 3000);
  };

  const activeMeta = FESTIVAL_THEMES.find((t) => t.id === activeTheme);

  return (
    <div className="flex flex-col gap-8 px-4 py-6 md:px-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ad-primary to-ad-accent text-white shadow-md shadow-ad-primary/30">
          <Sparkles className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ad-text">Festival Theme Manager</h1>
          <p className="text-[13px] text-ad-muted">Choose which festive decoration is shown to customers on the storefront.</p>
        </div>
      </div>

      {/* Active theme banner */}
      <div className="flex items-center gap-3 rounded-xl border border-ad-border bg-ad-card px-5 py-4">
        <Radio className="w-5 h-5 text-ad-primary shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ad-muted">Currently Active Theme</p>
          <p className="text-[15px] font-extrabold text-ad-text truncate">
            {activeMeta ? `${activeMeta.icon}  ${activeMeta.name}` : '—'}
          </p>
        </div>

        {/* Success toast */}
        <div
          className={`flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 ring-1 ring-emerald-500/30 text-[12px] font-bold text-emerald-400 transition-all duration-500 ${toastId ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Saved!
        </div>
      </div>

      {/* Theme grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
        role="radiogroup"
        aria-label="Festival theme selection"
      >
        {FESTIVAL_THEMES.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isActive={activeTheme === theme.id}
            onActivate={handleActivate}
          />
        ))}
      </div>

      {/* Footer note */}
      <p className="text-center text-[12px] text-ad-muted pb-4">
        Only <span className="font-bold text-ad-text">one theme</span> can be active at a time.{' '}
        Changes are applied instantly — no page reload needed.
      </p>
    </div>
  );
}
