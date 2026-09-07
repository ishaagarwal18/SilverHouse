import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeSwitcher({ variant = 'floating' }) {
  const { theme, setTheme, themes, currentThemeObj } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Variant: Header Pill Button
  if (variant === 'header') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-[var(--th-border)] bg-[var(--th-card)] text-[var(--th-text-main)] hover:border-[var(--th-primary)] transition-all text-xs font-semibold cursor-pointer shadow-xs"
          title="Switch Color Theme"
        >
          <div className="flex items-center -space-x-1">
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/50"
              style={{ backgroundColor: currentThemeObj.preview.primary }}
            />
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/50"
              style={{ backgroundColor: currentThemeObj.preview.accent }}
            />
          </div>
          <span className="hidden sm:inline font-sans">{currentThemeObj.name}</span>
          <Palette className="w-3.5 h-3.5 text-[var(--th-accent)]" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl p-4 bg-[var(--th-card)] border-2 border-[var(--th-border)] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--th-border)]">
              <div className="flex items-center space-x-2 text-[var(--th-text-main)]">
                <Palette className="w-4 h-4 text-[var(--th-accent)]" />
                <span className="font-serif font-bold text-sm">Calm & Vibey Themes</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:bg-[var(--th-surface-alt)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-[var(--th-text-muted)] mb-3">
              Select from 4 tranquil, cool color aesthetics tailored for pure silver jewelry:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {themes.map((t) => {
                const isActive = t.id === theme;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'border-[var(--th-primary)] bg-[var(--th-surface-alt)] shadow-xs ring-1 ring-[var(--th-primary)]'
                        : 'border-[var(--th-border)] bg-[var(--th-card)] hover:border-[var(--th-accent)] hover:bg-[var(--th-surface-alt)]/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Swatch Pill */}
                      <div className="flex items-center -space-x-1.5 p-1 rounded-lg bg-black/5 shrink-0">
                        <span
                          className="w-4 h-4 rounded-full border border-white"
                          style={{ backgroundColor: t.preview.primary }}
                          title="Primary"
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-white"
                          style={{ backgroundColor: t.preview.bg }}
                          title="Background"
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-white"
                          style={{ backgroundColor: t.preview.accent }}
                          title="Accent"
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-serif font-bold text-xs text-[var(--th-text-main)]">
                            {t.name}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-black/5 text-[var(--th-text-muted)] font-bold">
                            {t.vibe}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--th-text-muted)] line-clamp-1 mt-0.5">
                          {t.description}
                        </p>
                      </div>
                    </div>

                    {isActive && (
                      <span className="w-5 h-5 rounded-full bg-[var(--th-primary)] text-white flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Variant: Floating Widget (fixed at bottom right)
  return (
    <div className="fixed bottom-6 right-6 z-40" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 px-4 py-2.5 rounded-full bg-[var(--th-primary)] text-[var(--th-btn-text)] shadow-xl hover:opacity-95 transition-all duration-300 border-2 border-[var(--th-accent)] cursor-pointer group"
        title="Theme Palette Selector"
      >
        <Palette className="w-4 h-4 text-[var(--th-accent)] group-hover:rotate-45 transition-transform" />
        <span className="text-xs font-bold tracking-wide hidden sm:inline">Theme: {currentThemeObj.name}</span>
        <div className="flex items-center -space-x-1">
          <span
            className="w-2.5 h-2.5 rounded-full border border-white/60"
            style={{ backgroundColor: currentThemeObj.preview.primary }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-white/60"
            style={{ backgroundColor: currentThemeObj.preview.accent }}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute bottom-14 right-0 w-80 sm:w-96 rounded-2xl p-4 bg-[var(--th-card)] border-2 border-[var(--th-border)] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--th-border)]">
            <div className="flex items-center space-x-2 text-[var(--th-text-main)]">
              <Sparkles className="w-4 h-4 text-[var(--th-accent)]" />
              <span className="font-serif font-bold text-sm">Choose Your Aesthetic Vibe</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:bg-[var(--th-surface-alt)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {themes.map((t) => {
              const isActive = t.id === theme;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'border-[var(--th-primary)] bg-[var(--th-surface-alt)] shadow-xs ring-1 ring-[var(--th-primary)]'
                      : 'border-[var(--th-border)] bg-[var(--th-card)] hover:border-[var(--th-accent)] hover:bg-[var(--th-surface-alt)]/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center -space-x-1.5 p-1 rounded-lg bg-black/5 shrink-0">
                      <span
                        className="w-4 h-4 rounded-full border border-white"
                        style={{ backgroundColor: t.preview.primary }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white"
                        style={{ backgroundColor: t.preview.bg }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white"
                        style={{ backgroundColor: t.preview.accent }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-serif font-bold text-xs text-[var(--th-text-main)]">
                          {t.name}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-black/5 text-[var(--th-text-muted)] font-bold">
                          {t.vibe}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--th-text-muted)] line-clamp-1 mt-0.5">
                        {t.description}
                      </p>
                    </div>
                  </div>

                  {isActive && (
                    <span className="w-5 h-5 rounded-full bg-[var(--th-primary)] text-white flex items-center justify-center shrink-0 ml-2">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
