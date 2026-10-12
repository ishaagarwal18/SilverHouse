import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * MaaDurgaDivineMotif - Regal, Divine & High-Contrast Mataji Icon
 * Features the Sacred Golden Trishul, Royal Mukut (Crown), Maa Durga's Trinetra & Nath.
 * Positions transparently below the header banner for crystal-clear visibility.
 */
export default function MaaDurgaDivineMotif({ onOpenModal }) {
  const [isBlessingActive, setIsBlessingActive] = useState(false);
  const [blessingText, setBlessingText] = useState('');

  const BLESSINGS = [
    'Jai Mata Di • May Maa Durga Bless You With Health & Prosperity!',
    'Shubh Navratri • Divine Strength, Grace & Victory to You!',
    'Ya Devi Sarvabhuteshu • Courage, Wisdom & Divine Radiance!'
  ];

  const handleDurgaClick = (e) => {
    e.stopPropagation();
    const randomBlessing = BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];
    setBlessingText(randomBlessing);
    setIsBlessingActive(true);

    // Play divine audio chime via Web Audio API
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.15);
        gain.gain.setValueAtTime(0.2, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.85);
      });
    } catch (err) {
      console.warn('Audio warning:', err);
    }

    setTimeout(() => setIsBlessingActive(false), 3500);

    if (onOpenModal) {
      onOpenModal();
    }
  };

  return (
    <div className="fixed top-28 sm:top-32 left-3 sm:left-6 z-[38] pointer-events-auto select-none group">
      {/* Floating Clickable Container */}
      <button
        type="button"
        onClick={handleDurgaClick}
        className="relative block border-none bg-transparent p-0 outline-none cursor-pointer group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_12px_24px_rgba(217,4,41,0.4)]"
        title="Click for Maa Durga's Divine Blessing & Showcase!"
      >
        {/* Soft Radiant Outer Golden & Red Aura */}
        <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-amber-400/40 via-red-500/40 to-amber-500/40 blur-xl opacity-80 group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />

        {/* Pure Transparent Vector Motif Container */}
        <div className="relative flex flex-col items-center justify-center p-1 bg-transparent">
          {/* Large, Regal, Symmetrical Vector Art for Maa Durga */}
          <svg className="w-24 h-32 sm:w-28 sm:h-36 md:w-32 md:h-40 overflow-visible" viewBox="0 0 100 120" fill="none">
            <defs>
              {/* Metallic Gold Gradient */}
              <linearGradient id="goldTrishulRich" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFDE7" />
                <stop offset="25%" stopColor="#FFEE58" />
                <stop offset="55%" stopColor="#FFD700" />
                <stop offset="85%" stopColor="#FF8F00" />
                <stop offset="100%" stopColor="#D84315" />
              </linearGradient>

              {/* Mukut Crown Gradient */}
              <linearGradient id="goldMukutGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFF59D" />
                <stop offset="40%" stopColor="#FFC107" />
                <stop offset="100%" stopColor="#E65100" />
              </linearGradient>

              {/* Sindoor Tilak Gradient */}
              <radialGradient id="sindoorRich" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF1744" />
                <stop offset="65%" stopColor="#D50000" />
                <stop offset="100%" stopColor="#7A0000" />
              </radialGradient>

              {/* Warm Soft Backlight Disc for Ultimate Contrast */}
              <radialGradient id="backdropGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF8E1" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#FFE082" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FFB300" stopOpacity="0" />
              </radialGradient>

              {/* Crisp Vector Line Shadow */}
              <filter id="durgaLineShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.45" />
              </filter>
            </defs>

            {/* SOFT CONTRAST AURA BACKDROP (Ensures full visibility on both dark & light pages) */}
            <circle cx="50" cy="60" r="44" fill="url(#backdropGlow)" opacity="0.9" />

            {/* SACRED GOLDEN TRISHUL (TRIDENT AT TOP CENTER) */}
            <g transform="translate(0, -2)" filter="url(#durgaLineShadow)">
              {/* Center Shaft */}
              <rect x="47" y="2" width="6" height="42" rx="3" fill="url(#goldTrishulRich)" stroke="#6A3B00" strokeWidth="1" />

              {/* Center Spearhead */}
              <path d="M 50 -6 L 58 14 L 42 14 Z" fill="url(#goldTrishulRich)" stroke="#6A3B00" strokeWidth="1.2" />

              {/* Left Curved Prong */}
              <path d="M 47 18 C 28 16, 20 0, 30 -8 C 33 -10, 35 -10, 33 -3 C 28 8, 36 14, 47 15 Z" fill="url(#goldTrishulRich)" stroke="#6A3B00" strokeWidth="1" />

              {/* Right Curved Prong */}
              <path d="M 53 18 C 72 16, 80 0, 70 -8 C 67 -10, 65 -10, 67 -3 C 72 8, 64 14, 53 15 Z" fill="url(#goldTrishulRich)" stroke="#6A3B00" strokeWidth="1" />

              {/* Red Base Ring */}
              <rect x="45" y="20" width="10" height="4" rx="2" fill="#D50000" stroke="#FFD700" strokeWidth="0.8" />
            </g>

            {/* REGAL GOLDEN MUKUT ARCH (TEMPLE CROWN) */}
            <g transform="translate(0, 8)" filter="url(#durgaLineShadow)">
              <path d="M 22 28 Q 50 8 78 28 Q 50 18 22 28 Z" fill="url(#goldMukutGrad)" stroke="#6A3B00" strokeWidth="1" />
              <circle cx="32" cy="23" r="2.5" fill="#D50000" stroke="#FFD700" strokeWidth="0.8" />
              <circle cx="50" cy="18" r="3.5" fill="#D50000" stroke="#FFD700" strokeWidth="1" />
              <circle cx="68" cy="23" r="2.5" fill="#D50000" stroke="#FFD700" strokeWidth="0.8" />
            </g>

            {/* MATAJI DIVINE TRINETRA (EYES & SINDOOR TILAK) */}
            <g transform="translate(0, 18)" filter="url(#durgaLineShadow)">
              {/* FOREHEAD SINDOOR TILAK & BINDI */}
              <path d="M 50 24 C 57 14, 50 4, 50 4 C 50 4, 43 14, 50 24 Z" fill="url(#sindoorRich)" stroke="#FFD700" strokeWidth="1" />
              <circle cx="50" cy="30" r="4.5" fill="url(#sindoorRich)" stroke="#FFD700" strokeWidth="1.2" />
              <path d="M 42 35 Q 50 39 58 35 Q 50 37 42 35 Z" fill="#FFD700" stroke="#6A3B00" strokeWidth="0.5" />

              {/* LEFT EYEBROW (BOLD JET BLACK) */}
              <path d="M 18 40 Q 34 29 46 40" stroke="#000000" strokeWidth="4.5" fill="none" strokeLinecap="round" />

              {/* RIGHT EYEBROW (BOLD JET BLACK) */}
              <path d="M 54 40 Q 66 29 82 40" stroke="#000000" strokeWidth="4.5" fill="none" strokeLinecap="round" />

              {/* LEFT EYE (LARGE ALMOND SHAPE WITH KAJAL) */}
              <path d="M 16 50 Q 33 38 47 50 Q 33 62 16 50 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="2.8" strokeLinejoin="round" />
              <circle cx="33" cy="50" r="6" fill="#3E1C00" stroke="#000000" strokeWidth="1" />
              <circle cx="33" cy="50" r="3" fill="#000000" />
              <circle cx="35" cy="48" r="1.5" fill="#FFFFFF" />
              <circle cx="31.5" cy="52" r="0.8" fill="#FFFFFF" opacity="0.8" />

              {/* RIGHT EYE (LARGE ALMOND SHAPE WITH KAJAL) */}
              <path d="M 53 50 Q 67 38 84 50 Q 67 62 53 50 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="2.8" strokeLinejoin="round" />
              <circle cx="67" cy="50" r="6" fill="#3E1C00" stroke="#000000" strokeWidth="1" />
              <circle cx="67" cy="50" r="3" fill="#000000" />
              <circle cx="69" cy="48" r="1.5" fill="#FFFFFF" />
              <circle cx="65.5" cy="52" r="0.8" fill="#FFFFFF" opacity="0.8" />

              {/* MATAJI NATH (DIVINE GOLD NOSE RING & PEARL STRING) */}
              <circle cx="42" cy="62" r="8" fill="none" stroke="#FFD700" strokeWidth="2.2" filter="url(#durgaLineShadow)" />
              <circle cx="36" cy="66" r="2.2" fill="#D50000" stroke="#FFFFFF" strokeWidth="0.5" />
              <circle cx="40" cy="69" r="2.2" fill="#FFFFFF" stroke="#FFD700" strokeWidth="0.5" />
              <path d="M 34 62 Q 18 64 8 56" stroke="#FFD700" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
            </g>
          </svg>

          {/* Floating Action Pill Tag */}

        </div>
      </button>

      {/* FLOATING BLESSING POPUP BANNER ON CLICK */}
      {isBlessingActive && (
        <div className="fixed top-20 left-6 sm:left-12 z-[99999] max-w-xs sm:max-w-sm p-4 rounded-2xl bg-gradient-to-r from-red-700 via-amber-600 to-red-700 text-white font-bold text-xs sm:text-sm shadow-2xl border-2 border-yellow-300 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-300 shrink-0 animate-bounce" />
            <span>{blessingText}</span>
          </div>
        </div>
      )}
    </div>
  );
}

