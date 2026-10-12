import React, { useState } from 'react';
import { Sparkles, Heart, Flame } from 'lucide-react';

/**
 * KarwaChauthKalashMotif - Sacred Silver & Brass Karwa Pot with Arghya Spout & Lit Diya
 * Positioned on bottom-right corner during Karwa Chauth Festival Mode.
 * 
 * Features:
 * - Handcrafted vector of the auspicious Karwa Pot:
 *   Engraved silver & brass belly, sacred red Swastik, red-gold Kalawa thread,
 *   arghya spout (tonti), lush green mango leaves, lit diya, and red rose petals.
 * - White sticker outline filter matching the boutique illustration aesthetic.
 * - Interactive on CLICK:
 *   1. Temple Conch (Shankh) & Sacred Arghya Water Bell Chime (Web Audio API).
 *   2. Joyful Karwa lift & holy flame bounce.
 *   3. 50+ Holy Kumkum Petals, Sacred Silver Water Pearls & Golden Sparkles shower!
 *   4. Auspicious Akhand Saubhagya blessing callout.
 */
export default function KarwaChauthKalashMotif({ onOpenModal }) {
  const [isBlessing, setIsBlessing] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Akhand Saubhagya Blessings! 🪔');
  const [showBubble, setShowBubble] = useState(false);

  const KARWA_WISHES = [
    'Akhand Saubhagya & Longevity Blessings! 🪔',
    'Shubh Karwa Chauth! Divine Love & Grace! 💖',
    'Pavitra Chandra Arghya & Prosperity! 🌟',
    'Forever Bound in Love, Trust & Silver! ✨',
    'May Your Life Be Blessed with Radiance! 🌙'
  ];

  // Synthesize sacred temple conch (Shankh) swell + sweet arghya chime via Web Audio API
  const playSacredKarwaAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Resonant Shankh (Conch Shell) Divine Swell (Warm brassy drone around 293Hz - D4)
      const shankhOsc = ctx.createOscillator();
      const shankhGain = ctx.createGain();
      const shankhFilter = ctx.createBiquadFilter();

      shankhOsc.type = 'sawtooth';
      shankhOsc.frequency.setValueAtTime(293.66, now);
      shankhOsc.frequency.linearRampToValueAtTime(329.63, now + 0.35);
      shankhOsc.frequency.linearRampToValueAtTime(293.66, now + 0.95);

      shankhFilter.type = 'bandpass';
      shankhFilter.frequency.setValueAtTime(580, now);
      shankhFilter.Q.setValueAtTime(3.0, now);

      shankhGain.gain.setValueAtTime(0.001, now);
      shankhGain.gain.linearRampToValueAtTime(0.22, now + 0.25);
      shankhGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

      shankhOsc.connect(shankhFilter);
      shankhFilter.connect(shankhGain);
      shankhGain.connect(ctx.destination);

      shankhOsc.start(now);
      shankhOsc.stop(now + 1.15);

      // 2. Auspicious Pooja Bell & Arghya Water Drop Chime
      [0.08, 0.24, 0.45, 0.70, 0.95].forEach((offset, idx) => {
        const t = now + offset;
        const bell = ctx.createOscillator();
        const bellGain = ctx.createGain();

        bell.type = 'sine';
        bell.frequency.setValueAtTime(1320 + (idx % 3) * 260, t);

        bellGain.gain.setValueAtTime(0.12, t);
        bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        bell.connect(bellGain);
        bellGain.connect(ctx.destination);

        bell.start(t);
        bell.stop(t + 0.20);
      });
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  };

  const handleClick = (e) => {
    setIsBlessing(true);
    playSacredKarwaAudio();

    const randomGreeting = KARWA_WISHES[Math.floor(Math.random() * KARWA_WISHES.length)];
    setBubbleText(randomGreeting);
    setShowBubble(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width * 0.5;
    const originY = rect.top + rect.height * 0.32;

    // 50+ dynamic sacred particles: Rose Petals, Kumkum drops, Golden Diyas & Stars
    const newParticles = Array.from({ length: 50 }).map((_, i) => {
      const angleDeg = -155 + Math.random() * 125;
      const angleRad = (angleDeg * Math.PI) / 180;
      const distance = 150 + Math.random() * 380;
      const tx = Math.cos(angleRad) * distance;
      const ty = Math.sin(angleRad) * distance;

      return {
        id: Date.now() + Math.random(),
        startX: originX,
        startY: originY,
        tx,
        ty,
        size: Math.random() * 14 + 7,
        color: ['#E11D48', '#BE123C', '#F43F5E', '#FBBF24', '#F59E0B', '#FFF9C4', '#F472B6'][i % 7],
        duration: 1.3 + Math.random() * 0.9,
        delay: Math.random() * 0.28,
        type: i % 3 === 0 ? 'rosePetal' : i % 3 === 1 ? 'diya' : 'spark'
      };
    });

    setParticles(newParticles);

    setTimeout(() => {
      setIsBlessing(false);
    }, 1100);

    setTimeout(() => {
      setParticles([]);
    }, 2500);

    setTimeout(() => {
      setShowBubble(false);
    }, 3200);
  };

  return (
    <div className="fixed bottom-2 sm:bottom-4 right-1 sm:right-4 z-[38] pointer-events-auto select-none group">
      {/* Keyframe Animations */}
      <style>{`
        @keyframes karwaPotBlessBounce {
          0% { transform: scale(1) translateY(0); }
          20% { transform: scale(1.12, 0.88) translateY(6px); }
          40% { transform: scale(0.92, 1.15) translateY(-14px) rotate(2deg); }
          65% { transform: scale(1.06, 0.95) translateY(-4px) rotate(-1deg); }
          85% { transform: scale(0.98, 1.02) translateY(0) rotate(0deg); }
          100% { transform: scale(1) translateY(0); }
        }

        @keyframes flameDancePulse {
          0%, 100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 8px rgba(255, 179, 0, 0.9)); }
          50% { transform: scale(1.15, 1.05) rotate(2deg); filter: drop-shadow(0 0 16px rgba(255, 215, 0, 1)) drop-shadow(0 0 24px rgba(255, 87, 34, 0.7)); }
        }

        @keyframes sacredParticleFly {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.2) rotate(0deg);
          }
          15% {
            opacity: 1;
            transform: translate(calc(var(--tx) * 0.35), calc(var(--ty) * 0.6)) scale(1.4) rotate(90deg);
          }
          65% {
            opacity: 0.95;
            transform: translate(var(--tx), var(--ty)) scale(1.05) rotate(220deg);
          }
          100% {
            opacity: 0;
            transform: translate(calc(var(--tx) * 1.08), calc(var(--ty) + 65px)) scale(0.2) rotate(360deg);
          }
        }

        .animate-karwa-bounce {
          animation: karwaPotBlessBounce 0.85s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-pot-flame {
          animation: flameDancePulse 2s ease-in-out infinite;
          transform-origin: 100px 58px;
        }
      `}</style>

      {/* Main Interactive Button */}
      <button
        type="button"
        onClick={handleClick}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-transform duration-300 ${
          isBlessing ? 'animate-karwa-bounce' : 'group-hover:scale-105 active:scale-95'
        }`}
        title="Sacred Karwa Pot • Click for Akhand Saubhagya Blessings!"
        aria-label="Karwa Chauth Kalash Pot"
      >
        <div className="relative flex flex-col items-center">
          {/* Ambient Warm Golden/Crimson Aura Behind Karwa */}
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 pointer-events-none ${
              isBlessing
                ? 'w-48 h-48 bg-gradient-to-r from-rose-500/50 via-amber-400/60 to-yellow-300/60 blur-2xl scale-125'
                : 'w-24 h-24 rounded-full bg-rose-500/20 blur-xl'
            }`}
          />

          {/* SVG Illustration: Illustrated Sacred Karwa Kalash Pot */}
          <svg
            className="w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 drop-shadow-2xl overflow-visible"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White Sticker Outline Filter */}
            <defs>
              <filter id="karwaStickerOutline" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="1" />
                <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="#FFFFFF" floodOpacity="0.85" />
              </filter>

              {/* Pure Silver & Gold Gradient for Royal Karwa */}
              <linearGradient id="karwaMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9C4" />
                <stop offset="25%" stopColor="#FFD54F" />
                <stop offset="55%" stopColor="#FFA000" />
                <stop offset="85%" stopColor="#FF8F00" />
                <stop offset="100%" stopColor="#BF360C" />
              </linearGradient>

              {/* Sterling Silver Filigree Gradient */}
              <linearGradient id="silverTrimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#E2E8F0" />
                <stop offset="70%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#94A3B8" />
              </linearGradient>

              {/* Mango Leaf Green Gradient */}
              <linearGradient id="mangoLeafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4ADE80" />
                <stop offset="50%" stopColor="#16A34A" />
                <stop offset="100%" stopColor="#14532D" />
              </linearGradient>

              {/* Flame Radial Gradient */}
              <radialGradient id="topFlameGrad" cx="50%" cy="75%" r="70%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="25%" stopColor="#FFF9C4" />
                <stop offset="60%" stopColor="#FF9800" />
                <stop offset="100%" stopColor="#D50000" />
              </radialGradient>
            </defs>

            {/* Main Artwork with Sticker Outline */}
            <g filter="url(#karwaStickerOutline)">
              {/* ======================================================== */}
              {/* 1. SACRED BASE PEDESTAL & RED ROSE PETALS                */}
              {/* ======================================================== */}
              {/* Circular Brass/Silver Base Ring */}
              <ellipse cx="100" cy="216" rx="54" ry="12" fill="url(#silverTrimGrad)" stroke="#3E160D" strokeWidth="1.6" />
              <ellipse cx="100" cy="214" rx="48" ry="9" fill="url(#karwaMetalGrad)" stroke="#3E160D" strokeWidth="0.8" />

              {/* Embossed Base Pearls */}
              {[-36, -24, -12, 0, 12, 24, 36].map((offset, i) => (
                <circle
                  key={`bpearl-${i}`}
                  cx={100 + offset}
                  cy={217 - Math.abs(offset) * 0.08}
                  r="2"
                  fill="#FFFDE7"
                  stroke="#3E160D"
                  strokeWidth="0.5"
                />
              ))}

              {/* Scattered Red Rose Petals at Base */}
              <path d="M 46 216 C 42 222, 50 228, 56 224 C 60 220, 52 214, 46 216 Z" fill="#E11D48" stroke="#3E160D" strokeWidth="0.6" />
              <path d="M 148 218 C 144 224, 154 228, 160 222 C 162 218, 154 214, 148 218 Z" fill="#E11D48" stroke="#3E160D" strokeWidth="0.6" />

              {/* ======================================================== */}
              {/* 2. ROUND BELLY OF THE KARWA POT                          */}
              {/* ======================================================== */}
              {/* Large Round Pot Belly */}
              <path
                d="M 58 135 C 50 175, 70 212, 100 212 C 130 212, 150 175, 142 135 C 134 116, 118 108, 100 108 C 82 108, 66 116, 58 135 Z"
                fill="url(#karwaMetalGrad)"
                stroke="#3E160D"
                strokeWidth="1.8"
              />

              {/* Auspicious Red Kumkum Swastik in Center of Belly */}
              <g transform="translate(100, 160) scale(1.15)">
                {/* Central Cross */}
                <line x1="-12" y1="0" x2="12" y2="0" stroke="#DC2626" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="0" y1="-12" x2="0" y2="12" stroke="#DC2626" strokeWidth="2.4" strokeLinecap="round" />
                {/* 4 Clockwise Arms */}
                <line x1="-12" y1="0" x2="-12" y2="-8" stroke="#DC2626" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="12" y1="0" x2="12" y2="8" stroke="#DC2626" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="0" y1="-12" x2="8" y2="-12" stroke="#DC2626" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="0" y1="12" x2="-8" y2="12" stroke="#DC2626" strokeWidth="2.4" strokeLinecap="round" />
                {/* 4 Sacred Bindu Dots */}
                <circle cx="-6" cy="-6" r="1.4" fill="#DC2626" />
                <circle cx="6" cy="-6" r="1.4" fill="#DC2626" />
                <circle cx="-6" cy="6" r="1.4" fill="#DC2626" />
                <circle cx="6" cy="6" r="1.4" fill="#DC2626" />
              </g>

              {/* Decorative Silver Meenakari Belt on Pot */}
              <path
                d="M 64 136 Q 100 148 136 136"
                fill="none"
                stroke="url(#silverTrimGrad)"
                strokeWidth="4"
              />
              <path
                d="M 64 136 Q 100 148 136 136"
                fill="none"
                stroke="#DC2626"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />

              {/* ======================================================== */}
              {/* 3. ARGHYA WATER SPOUT (TONTI)                            */}
              {/* ======================================================== */}
              {/* Traditional Curved Spout on Left Side */}
              <path
                d="M 62 144 C 44 140, 36 128, 30 114 C 36 112, 42 118, 48 126 C 54 134, 60 142, 64 146 Z"
                fill="url(#karwaMetalGrad)"
                stroke="#3E160D"
                strokeWidth="1.4"
              />
              {/* Spout Lip Hole */}
              <ellipse cx="32" cy="115" rx="3.5" ry="2" fill="#3E160D" />
              {/* Drop of Holy Ganga Jal Arghya Water */}
              <circle cx="28" cy="118" r="2.2" fill="#67E8F9" className="animate-pulse" />

              {/* ======================================================== */}
              {/* 4. NECK & MOLI (KALAWA) SACRED THREAD                    */}
              {/* ======================================================== */}
              {/* Flared Pot Neck */}
              <path
                d="M 82 108 L 86 92 C 86 88, 114 88, 114 92 L 118 108 Z"
                fill="url(#karwaMetalGrad)"
                stroke="#3E160D"
                strokeWidth="1.2"
              />

              {/* Red & Gold Kalawa Thread Wrapped Around Neck */}
              <rect x="83" y="98" width="34" height="6" rx="2" fill="#DC2626" stroke="#3E160D" strokeWidth="0.8" />
              <line x1="83" y1="101" x2="117" y2="101" stroke="#FDE047" strokeWidth="1.8" strokeDasharray="3 2" />
              {/* Kalawa Hanging Golden Tassels */}
              <path d="M 108 104 L 114 118 M 111 104 L 118 116" stroke="#DC2626" strokeWidth="1.4" />
              <circle cx="114" cy="118" r="2" fill="#FDE047" />

              {/* ======================================================== */}
              {/* 5. MANGO LEAVES (AMRAPALLAV) CRADLING THE TOP            */}
              {/* ======================================================== */}
              {/* Left Leaf */}
              <path d="M 86 90 Q 72 74 68 58 Q 80 68 88 88 Z" fill="url(#mangoLeafGrad)" stroke="#14532D" strokeWidth="1" />
              {/* Center-Left Leaf */}
              <path d="M 92 88 Q 86 64 84 46 Q 96 60 96 86 Z" fill="url(#mangoLeafGrad)" stroke="#14532D" strokeWidth="1" />
              {/* Center-Right Leaf */}
              <path d="M 108 88 Q 114 64 116 46 Q 104 60 104 86 Z" fill="url(#mangoLeafGrad)" stroke="#14532D" strokeWidth="1" />
              {/* Right Leaf */}
              <path d="M 114 90 Q 128 74 132 58 Q 120 68 112 88 Z" fill="url(#mangoLeafGrad)" stroke="#14532D" strokeWidth="1" />

              {/* ======================================================== */}
              {/* 6. GOLDEN DIYA LAMP ON THE LID                           */}
              {/* ======================================================== */}
              {/* Clay / Silver Diya Bowl */}
              <path
                d="M 82 82 C 84 92, 116 92, 118 82 Z"
                fill="#FFCA28"
                stroke="#3E160D"
                strokeWidth="1.2"
              />
              <ellipse cx="100" cy="82" rx="18" ry="4.5" fill="#FFA000" stroke="#3E160D" strokeWidth="0.8" />

              {/* Cotton Wick */}
              <circle cx="100" cy="79" r="1.5" fill="#3E160D" />

              {/* Sacred Flame (Akhand Jyot) */}
              <g className="animate-pot-flame">
                {/* Corona Glow */}
                <ellipse cx="100" cy="62" rx="14" ry="20" fill="#FFD54F" fillOpacity="0.5" />
                {/* Flame Tongue */}
                <path
                  d="M 100 46 C 92 60, 88 72, 94 78 C 97 81, 103 81, 106 78 C 112 72, 108 60, 100 46 Z"
                  fill="url(#topFlameGrad)"
                  stroke="#3E160D"
                  strokeWidth="0.8"
                />
                {/* Inner White Seed */}
                <path
                  d="M 100 58 C 98 66, 97 72, 99 76 C 100 77, 101 77, 102 76 C 104 72, 103 66, 100 58 Z"
                  fill="#FFFFFF"
                />
              </g>

              {/* Sparkle Glints Around Karwa */}
              <polygon points="152,106 154,110 158,111 155,114 156,118 152,116 148,118 149,114 146,111 150,110" fill="#FDE047" stroke="#3E160D" strokeWidth="0.6" className="animate-pulse" />
              <polygon points="46,160 48,164 52,165 49,168 50,172 46,170 42,172 43,168 40,165 44,164" fill="#FDE047" stroke="#3E160D" strokeWidth="0.6" />
            </g>
          </svg>

          {/* Festive Badge Tag Underneath Karwa */}
          <div className="mt-1 flex items-center space-x-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full shadow-md border border-red-300/80 tracking-wider uppercase group-hover:scale-105 transition-transform">
            <Flame className="w-3 h-3 text-yellow-200 animate-pulse fill-yellow-200" />
            <span>Sacred Karwa</span>
          </div>
        </div>
      </button>

      {/* Floating Festive Speech Callout on Click */}
      {showBubble && (
        <div className="absolute -top-12 right-2 sm:right-4 z-50 whitespace-nowrap bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-red-800 dark:text-red-300 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-2xl border-2 border-red-400 animate-in fade-in zoom-in-75 duration-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-red-500 animate-bounce shrink-0" />
          <span>{bubbleText}</span>
          <div className="absolute right-8 -bottom-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-red-400 rotate-45" />
        </div>
      )}

      {/* DYNAMIC SACRED KUMKUM, DIYAS & SPARKLES SHOWER */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `sacredParticleFly ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
            pointerEvents: 'none',
            zIndex: 99999
          }}
          className="will-change-transform"
        >
          {p.type === 'rosePetal' ? (
            /* Crimson Red Rose Petal SVG */
            <svg
              width={p.size * 1.2}
              height={p.size * 1.2}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]"
            >
              <path d="M 12 2 C 7 5, 4 11, 7 17 C 9 21, 15 21, 17 17 C 20 11, 17 5, 12 2 Z" />
            </svg>
          ) : p.type === 'diya' ? (
            /* Mini Golden Diya SVG */
            <svg
              width={p.size * 1.2}
              height={p.size * 1.2}
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-[0_0_8px_rgba(251,191,36,0.85)]"
            >
              <path d="M 4 15 C 5 19, 19 19, 20 15 Z" fill="#F59E0B" />
              <path d="M 12 5 C 10 9, 8 12, 12 14 C 16 12, 14 9, 12 5 Z" fill="#FDE047" />
            </svg>
          ) : (
            /* Holy Golden Sparkle */
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(255,215,0,0.85)]"
            >
              <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
