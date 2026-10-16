import React, { useState } from 'react';

/**
 * HoliGulalMatkiMotif - Pure Silver Color Matki (Urn), Gujiya Sweets & Palash Spring Flowers
 * Positioned on bottom-right corner during Holi Festival Mode.
 * 
 * Features:
 * - Handcrafted vector artwork:
 *   - Engraved 925 sterling silver Matki overflowing with rich dry Gulal colors
 *   - Traditional crisp golden Gujiya sweets finished with glistening pure silver vark
 *   - Radiant orange-red Palash (Tesu) blossom sprigs
 * - Completely free-floating transparent illustration (NO cards, NO boxes)
 * - Interactive on CLICK:
 *   1. Resonant silver chime & festive dholak beat synthesized via Web Audio API
 *   2. Matki gentle shake & color burst animation
 *   3. 45+ Multi-color Gulal powder puffs & confetti shower
 *   4. Speech bubble with sweet festive greetings
 */
export default function HoliGulalMatkiMotif({ onOpenModal }) {
  const [isShaking, setIsShaking] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Rang Barse! Shubh Holi! 🌸');
  const [showBubble, setShowBubble] = useState(false);

  const MATKI_WISHES = [
    'Rang Barse! Shubh Holi! 🌸',
    'Sweet Gujiya & Sparkling Silver Moments! 🥟',
    'May Your Life Be as Colorful as Gulal! 🌈',
    'Pure Silver Matki & Auspicious Shagun! 💎',
    'Warm Wishes for a Blessed & Joyous Holi! ✨'
  ];

  // Synthesize musical silver bell chime + festive percussion beat via Web Audio API
  const playMatkiChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Resonant Silver Bell Chime (High E5 - 659.25Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      osc1.frequency.exponentialRampToValueAtTime(652, now + 1.2);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.28, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 1.3);

      // 2. High sparkle chime (1318.5Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1318.5, now);
      osc2.frequency.exponentialRampToValueAtTime(1568, now + 0.4);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.8);

      // 3. Playful festive dholak low thud (130Hz -> 65Hz)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(130, now);
      osc3.frequency.exponentialRampToValueAtTime(60, now + 0.22);

      gain3.gain.setValueAtTime(0.001, now);
      gain3.gain.linearRampToValueAtTime(0.35, now + 0.02);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now);
      osc3.stop(now + 0.25);
    } catch {
      // Audio fallback
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();

    // 1. Play sound
    playMatkiChime();

    // 2. Trigger shake animation
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 900);

    // 3. Show Speech Bubble
    const randomWish = MATKI_WISHES[Math.floor(Math.random() * MATKI_WISHES.length)];
    setBubbleText(randomWish);
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 3800);

    // 4. Generate 45+ Multi-color Gulal Sparks & Petals
    const colors = ['#F59E0B', '#EC4899', '#10B981', '#06B6D4', '#8B5CF6', '#F43F5E', '#FEF08A'];
    const newParticles = Array.from({ length: 48 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 48 + (Math.random() * 0.4 - 0.2);
      const velocity = 50 + Math.random() * 85;
      return {
        id: Date.now() + i,
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity - 25,
        color: colors[i % colors.length],
        size: 5 + Math.random() * 6,
        rotation: Math.random() * 360,
        type: i % 3 === 0 ? 'petal' : i % 2 === 0 ? 'spark' : 'gulal'
      };
    });
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1400);
  };

  return (
    <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-40 select-none pointer-events-auto">
      {/* Keyframe Animations */}
      <style>{`
        @keyframes matkiWiggleBurst {
          0% { transform: scale(1) rotate(0deg); }
          20% { transform: scale(1.1) rotate(-8deg); }
          40% { transform: scale(1.12) rotate(8deg); }
          60% { transform: scale(1.08) rotate(-4deg); }
          80% { transform: scale(1.04) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes matkiGentleHover {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(1deg); }
        }
        .animate-matki-hover {
          animation: matkiGentleHover 3.6s ease-in-out infinite;
        }
        .animate-matki-wiggle {
          animation: matkiWiggleBurst 0.85s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      {/* Confetti & Gulal Explosion Shower */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: '50%',
            top: '40%',
            transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`,
            transition: 'all 1.4s cubic-bezier(0.1, 0.8, 0.3, 1)',
            opacity: particles.length > 0 ? 1 : 0,
            pointerEvents: 'none',
            zIndex: 60
          }}
        >
          {p.type === 'petal' ? (
            <svg width={p.size * 2} height={p.size * 2} viewBox="0 0 20 20" fill={p.color}>
              <path d="M 10 0 C 14 6, 18 10, 10 20 C 2 10, 6 6, 10 0 Z" />
            </svg>
          ) : (
            <div
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                borderRadius: '50%',
                boxShadow: `0 0 6px ${p.color}`
              }}
            />
          )}
        </div>
      ))}

      {/* Speech Bubble on Click */}
      {showBubble && (
        <div className="absolute -top-14 right-2 sm:right-4 w-56 sm:w-64 p-2.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-700 to-amber-600 text-white shadow-2xl border border-yellow-300 text-center animate-in fade-in zoom-in-95 duration-200 z-50">
          <p className="text-[11px] sm:text-xs font-black tracking-wide leading-tight">
            {bubbleText}
          </p>
          <div className="absolute -bottom-2 right-8 w-3 h-3 bg-purple-700 rotate-45 border-r border-b border-yellow-300" />
        </div>
      )}

      {/* Main Interactive Button — Free-Floating with NO Card / Container */}
      <button
        type="button"
        onClick={handleClick}
        onDoubleClick={onOpenModal}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-all duration-300 ${
          isShaking ? 'animate-matki-wiggle' : 'hover:scale-105 active:scale-95'
        }`}
        title="Silver Gulal Matki & Gujiya • Click for sound, Double-click for Holi keepsakes"
        aria-label="Silver Gulal Matki and Gujiya Motif"
      >
        {/* Soft Ambient Multi-Color Radial Glow (No box) */}
        <div className="absolute inset-0 rounded-full blur-2xl bg-gradient-to-r from-amber-500/30 via-pink-500/25 to-purple-500/30 pointer-events-none" />

        {/* Handcrafted Vector Artwork: Silver Matki + Gujiya Sweets + Palash Flowers */}
        <div className="relative w-28 h-32 sm:w-36 sm:h-40 overflow-visible animate-matki-hover">
          <svg
            viewBox="0 0 180 200"
            className="w-full h-full overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.95))'
            }}
          >
            <defs>
              <linearGradient id="matkiSilver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="#E2E8F0" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>

              <radialGradient id="matkiBodyGleam" cx="35%" cy="40%" r="65%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#94A3B8" />
              </radialGradient>

              <linearGradient id="matkiGoldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9C4" />
                <stop offset="50%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>

              {/* Gujiya Pastry Gradients */}
              <linearGradient id="gujiyaCrust" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="40%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>

              {/* Palash Flowers (Tesu) Gradients */}
              <linearGradient id="palashFlower" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>

              {/* Gulal Powders Gradients */}
              <linearGradient id="matkiGulalPink" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="60%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#BE185D" />
              </linearGradient>

              <linearGradient id="matkiGulalYellow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>

            {/* 1. PALASH (TESU) ORANGE BLOSSOMS (Background Sprigs) */}
            <g id="palashSprigs" transform="translate(10, 30)">
              {/* Left Sprig */}
              <path d="M 25 70 Q 15 40 5 35" stroke="#15803D" strokeWidth="2" fill="none" />
              <path d="M 8 35 C 4 25, 18 20, 22 30 C 26 22, 35 28, 28 38 Z" fill="url(#palashFlower)" />
              <path d="M 18 48 C 12 40, 26 36, 28 44 Z" fill="url(#palashFlower)" />

              {/* Right Sprig */}
              <path d="M 135 70 Q 150 40 160 35" stroke="#15803D" strokeWidth="2" fill="none" />
              <path d="M 155 35 C 160 25, 146 20, 142 30 C 138 22, 129 28, 136 38 Z" fill="url(#palashFlower)" />
              <path d="M 144 48 C 150 40, 136 36, 134 44 Z" fill="url(#palashFlower)" />
            </g>

            {/* 2. PURE 925 STERLING SILVER MATKI (POT) */}
            <g id="silverMatki" transform="translate(45, 45)">
              {/* Overflowing Gulal Powders from Mouth */}
              <path
                d="M 10 25 C 10 -5, 80 -5, 80 25 Z"
                fill="url(#matkiGulalPink)"
              />
              <path
                d="M 30 20 C 30 0, 75 5, 70 25 Z"
                fill="url(#matkiGulalYellow)"
              />
              <ellipse cx="45" cy="22" rx="36" ry="12" fill="url(#matkiGulalPink)" />

              {/* Neck & Mouth Rim of Silver Pot */}
              <ellipse cx="45" cy="26" rx="38" ry="10" fill="url(#matkiSilver)" stroke="#475569" strokeWidth="1.2" />
              <ellipse cx="45" cy="24" rx="35" ry="7" fill="none" stroke="url(#matkiGoldTrim)" strokeWidth="1.5" />
              <rect x="22" y="26" width="46" height="14" fill="url(#matkiSilver)" stroke="#475569" strokeWidth="1" />

              {/* Swelling Round Body of the Silver Matki */}
              <path
                d="M 22 38 C 5 60, 5 105, 25 118 C 35 125, 55 125, 65 118 C 85 105, 85 60, 68 38 Z"
                fill="url(#matkiBodyGleam)"
                stroke="#475569"
                strokeWidth="1.5"
              />

              {/* Golden Embossed Waist Band */}
              <path
                d="M 12 76 C 25 86, 65 86, 78 76"
                stroke="url(#matkiGoldTrim)"
                strokeWidth="3.5"
                fill="none"
              />
              <path
                d="M 14 84 C 27 94, 63 94, 76 84"
                stroke="#94A3B8"
                strokeWidth="1.2"
                strokeDasharray="2 2"
                fill="none"
              />

              {/* Auspicious Peacock / Floral Etching on Silver Belly */}
              <path
                d="M 45 60 Q 40 70 45 74 Q 50 70 45 60"
                fill="url(#matkiGoldTrim)"
              />

              {/* Specular Highlight Streak */}
              <path
                d="M 22 55 C 18 70, 18 90, 26 100"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.85"
              />

              {/* Base Pedestal Ring */}
              <ellipse cx="45" cy="120" rx="22" ry="6" fill="url(#matkiSilver)" stroke="#475569" strokeWidth="1" />
              <ellipse cx="45" cy="121" rx="18" ry="4" fill="url(#matkiGoldTrim)" />
            </g>

            {/* 3. CRISP GOLDEN GUJIYA SWEETS WITH PURE SILVER VARK (Foreground) */}
            <g id="gujiyas" transform="translate(25, 125)">
              {/* Gujiya 1: Left Angled Gujiya */}
              <g transform="translate(15, 10) rotate(-18)">
                {/* Crescent Pastry Body */}
                <path
                  d="M 0 20 C 15 -6, 55 -6, 70 20 C 45 28, 25 28, 0 20 Z"
                  fill="url(#gujiyaCrust)"
                  stroke="#78350F"
                  strokeWidth="1"
                />
                {/* Traditional Crimped / Fluted Edge (Gothna) */}
                <path
                  d="M 0 20 Q 8 8 16 7 Q 24 6 32 6 Q 40 6 48 7 Q 56 8 70 20"
                  stroke="url(#matkiGoldTrim)"
                  strokeWidth="2.4"
                  strokeDasharray="3 3"
                  fill="none"
                />
                {/* Shimmering Pure Silver Vark (Edible Foil Patch) */}
                <polygon
                  points="25,12 45,8 48,18 28,21"
                  fill="#FFFFFF"
                  stroke="#E2E8F0"
                  strokeWidth="0.5"
                  opacity="0.9"
                />
                <circle cx="36" cy="14" r="1.5" fill="#CBD5E1" />
              </g>

              {/* Gujiya 2: Right Front Overlapping Gujiya */}
              <g transform="translate(55, 20) rotate(14)">
                {/* Crescent Pastry Body */}
                <path
                  d="M 0 20 C 15 -6, 55 -6, 70 20 C 45 28, 25 28, 0 20 Z"
                  fill="url(#gujiyaCrust)"
                  stroke="#78350F"
                  strokeWidth="1"
                />
                {/* Crimped Edge */}
                <path
                  d="M 0 20 Q 8 8 16 7 Q 24 6 32 6 Q 40 6 48 7 Q 56 8 70 20"
                  stroke="url(#matkiGoldTrim)"
                  strokeWidth="2.4"
                  strokeDasharray="3 3"
                  fill="none"
                />
                {/* Pure Silver Vark Patch */}
                <polygon
                  points="22,10 44,9 42,19 20,18"
                  fill="#FFFFFF"
                  stroke="#E2E8F0"
                  strokeWidth="0.5"
                  opacity="0.95"
                />
              </g>
            </g>
          </svg>
        </div>
      </button>
    </div>
  );
}
