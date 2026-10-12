import React, { useState } from 'react';
import { Sparkles, Clock, Wine } from 'lucide-react';

/**
 * NewYearClockMotif - Midnight Countdown Clock & Clinking Champagne Flutes
 * Positioned on bottom-left corner during Happy New Year Festival Mode.
 * 
 * Features:
 * - Handcrafted vector of an opulent vintage Roman Numeral Clock striking 12:00 Midnight,
 *   paired with clinking crystal & sterling silver champagne flutes, effervescent bubbles,
 *   and golden metallic celebration streamers.
 * - White sticker outline filter matching the boutique illustration aesthetic.
 * - Interactive on CLICK:
 *   1. Majestic Midnight Clock Tower chime (Big Ben strike) + crystal flute "Cheers!" clink (Web Audio API).
 *   2. Clock glow & champagne flutes bounce/toast.
 *   3. 50+ Golden Stars, Champagne Bubbles, "12:00" numerals & Holographic Confetti shower!
 *   4. Joyful "Happy New Year!" speech callout.
 */
export default function NewYearClockMotif({ onOpenModal }) {
  const [isCheers, setIsCheers] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Happy New Year! Cheers! 🥂');
  const [showBubble, setShowBubble] = useState(false);

  const NEW_YEAR_WISHES = [
    'Happy New Year! Cheers to Fresh Beginnings! 🥂',
    'May Your Year Be as Radiant as Pure Silver! ✨',
    '3, 2, 1... Wishing You Health, Joy & Success! 🌟',
    'New Year, Shimmering Dreams & Eternal Bonds! 💖',
    'Ring in the New Year with Pure Silver Elegance! 🍾'
  ];

  // Synthesize Big Ben midnight bell chime + crystal glass clink toast via Web Audio API
  const playNewYearCheersAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Crystal Glass "Clink" Toast (High metallic resonance with sweet sustain)
      const clinkFrequencies = [2400, 3600, 4800];
      clinkFrequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + (idx === 1 ? 25 : -15), now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.25);
      });

      // 2. Midnight Clock Tower "Bong" Bell Chime (Deep, warm resonant strike around 440Hz / 220Hz)
      const bellModes = [
        { f: 220, g: 0.28, d: 2.2 },
        { f: 440, g: 0.22, d: 1.8 },
        { f: 660, g: 0.15, d: 1.4 },
        { f: 880, g: 0.10, d: 1.0 }
      ];

      bellModes.forEach(({ f, g, d }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + 0.08);

        gain.gain.setValueAtTime(0.001, now + 0.08);
        gain.gain.linearRampToValueAtTime(g, now + 0.09);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08 + d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + 0.08);
        osc.stop(now + 0.08 + d + 0.05);
      });
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  };

  const handleClick = (e) => {
    setIsCheers(true);
    playNewYearCheersAudio();

    const randomGreeting = NEW_YEAR_WISHES[Math.floor(Math.random() * NEW_YEAR_WISHES.length)];
    setBubbleText(randomGreeting);
    setShowBubble(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width * 0.5;
    const originY = rect.top + rect.height * 0.35;

    // 50+ dynamic holiday particles: Stars, Champagne Bubbles, Holographic Glints
    const newParticles = Array.from({ length: 48 }).map((_, i) => {
      const angleDeg = -140 + Math.random() * 125;
      const angleRad = (angleDeg * Math.PI) / 180;
      const distance = 140 + Math.random() * 360;
      const tx = Math.cos(angleRad) * distance;
      const ty = Math.sin(angleRad) * distance;

      return {
        id: Date.now() + Math.random(),
        startX: originX,
        startY: originY,
        tx,
        ty,
        size: Math.random() * 14 + 7,
        color: ['#FDE047', '#FFD54F', '#FACC15', '#E0F2FE', '#BAE6FD', '#FFFFFF', '#F43F5E'][i % 7],
        duration: 1.4 + Math.random() * 0.85,
        delay: Math.random() * 0.25,
        type: i % 3 === 0 ? 'bubble' : i % 3 === 1 ? 'star' : 'sparkle'
      };
    });

    setParticles(newParticles);

    setTimeout(() => {
      setIsCheers(false);
    }, 1100);

    setTimeout(() => {
      setParticles([]);
    }, 2400);

    setTimeout(() => {
      setShowBubble(false);
    }, 3200);
  };

  return (
    <div className="fixed bottom-2 sm:bottom-4 left-1 sm:left-4 z-[38] pointer-events-auto select-none group">
      {/* Keyframe Animations */}
      <style>{`
        @keyframes clockGentleHover {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(1deg); }
        }

        @keyframes clockToastBounce {
          0% { transform: scale(1) translateY(0); }
          25% { transform: scale(1.1, 0.94) translateY(4px); }
          50% { transform: scale(0.96, 1.12) translateY(-10px) rotate(-2deg); }
          75% { transform: scale(1.04, 0.97) translateY(-3px) rotate(1deg); }
          100% { transform: scale(1) translateY(0); }
        }

        @keyframes clockGlowPulse {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(253, 224, 71, 0.8));
          }
          50% {
            filter: drop-shadow(0 0 22px rgba(251, 191, 36, 1)) drop-shadow(0 0 34px rgba(234, 179, 8, 0.7));
          }
        }

        @keyframes newYearParticleFlutter {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.2) rotate(0deg);
          }
          15% {
            opacity: 1;
            transform: translate(calc(var(--tx) * 0.32), calc(var(--ty) * 0.55)) scale(1.35) rotate(60deg);
          }
          65% {
            opacity: 0.95;
            transform: translate(var(--tx), var(--ty)) scale(1.05) rotate(200deg);
          }
          100% {
            opacity: 0;
            transform: translate(calc(var(--tx) * 1.05), calc(var(--ty) + 55px)) scale(0.2) rotate(340deg);
          }
        }

        .animate-clock-idle {
          animation: clockGentleHover 3.2s ease-in-out infinite;
        }

        .animate-clock-cheers {
          animation: clockToastBounce 0.85s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-clock-glow {
          animation: clockGlowPulse 3s ease-in-out infinite;
        }
      `}</style>

      {/* Main Interactive Button */}
      <button
        type="button"
        onClick={handleClick}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-transform duration-300 ${
          isCheers ? 'animate-clock-cheers' : 'group-hover:scale-105 active:scale-95'
        }`}
        title="Midnight Countdown Clock & Flutes • Click to Toast & Ring in the New Year!"
        aria-label="New Year Countdown Clock"
      >
        <div className="relative flex flex-col items-center">
          {/* Ambient Warm Golden/Champagne Aura Behind Clock */}
          <div
            className={`absolute top-2 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 pointer-events-none ${
              isCheers
                ? 'w-48 h-48 bg-gradient-to-r from-amber-300/60 via-yellow-400/60 to-rose-400/50 blur-2xl scale-125'
                : 'w-24 h-24 rounded-full bg-amber-400/25 blur-xl'
            }`}
          />

          {/* SVG Illustration: Illustrated Midnight Clock & Clinking Flutes */}
          <svg
            className="w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 drop-shadow-2xl overflow-visible animate-clock-idle"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White Sticker Outline Filter */}
            <defs>
              <filter id="clockStickerOutline" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="1" />
                <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="#FFFFFF" floodOpacity="0.85" />
              </filter>

              {/* Royal Gold Gradient */}
              <linearGradient id="clockGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9C4" />
                <stop offset="30%" stopColor="#FFD54F" />
                <stop offset="70%" stopColor="#FFA000" />
                <stop offset="100%" stopColor="#E65100" />
              </linearGradient>

              {/* Crystal Glass Gradient */}
              <linearGradient id="fluteGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#E0F2FE" stopOpacity="0.65" />
                <stop offset="80%" stopColor="#BAE6FD" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.7" />
              </linearGradient>

              {/* Champagne Liquid Gold Gradient */}
              <linearGradient id="champagneGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>
            </defs>

            {/* Main Clock & Flutes Artwork with Sticker Outline */}
            <g filter="url(#clockStickerOutline)">
              {/* ======================================================== */}
              {/* 1. MIDNIGHT COUNTDOWN ROMAN NUMERAL CLOCK                */}
              {/* ======================================================== */}
              <g className="animate-clock-glow">
                {/* Clock Outer Golden Rim */}
                <circle cx="100" cy="115" r="58" fill="#0F172A" stroke="#3E160D" strokeWidth="2.5" />
                <circle cx="100" cy="115" r="54" fill="#1E293B" stroke="url(#clockGoldGrad)" strokeWidth="4" />
                <circle cx="100" cy="115" r="48" fill="#0F172A" stroke="#FDE047" strokeWidth="1.2" strokeDasharray="3 3" />

                {/* Roman Numerals (XII at top, III, VI, IX) */}
                <text x="100" y="78" fill="#FDE047" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="serif">XII</text>
                <text x="138" y="119" fill="#FDE047" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="serif">III</text>
                <text x="100" y="157" fill="#FDE047" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="serif">VI</text>
                <text x="62" y="119" fill="#FDE047" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="serif">IX</text>

                {/* Hour Markers (Dots for other hours) */}
                {[30, 60, 120, 150, 210, 240, 300, 330].map((deg, i) => {
                  const rad = (deg * Math.PI) / 180;
                  const cx = 100 + Math.cos(rad) * 38;
                  const cy = 115 + Math.sin(rad) * 38;
                  return <circle key={`hour-dot-${i}`} cx={cx} cy={cy} r="1.8" fill="#FEF08A" />;
                })}

                {/* Clock Hands Striking 12:00 Midnight */}
                {/* Hour Hand (Points straight up to 12) */}
                <line x1="100" y1="115" x2="100" y2="88" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
                <polygon points="100,84 97,89 103,89" fill="#FDE047" />

                {/* Minute Hand (Points straight up to 12) */}
                <line x1="100" y1="115" x2="100" y2="78" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                <polygon points="100,74 98,79 102,79" fill="#FFFFFF" />

                {/* Center Golden Pin */}
                <circle cx="100" cy="115" r="4.2" fill="#FACC15" stroke="#3E160D" strokeWidth="0.8" />
                <circle cx="100" cy="115" r="1.8" fill="#FFFFFF" />
              </g>

              {/* ======================================================== */}
              {/* 2. PAIR OF CLINKING CHAMPAGNE FLUTES (TOAST!)            */}
              {/* ======================================================== */}
              {/* Left Flute (Tilted Inward Right) */}
              <g transform="translate(62, 110) rotate(16)">
                {/* Flute Base Plate */}
                <ellipse cx="14" cy="88" rx="14" ry="4" fill="url(#fluteGlassGrad)" stroke="#3E160D" strokeWidth="0.8" />
                {/* Flute Stem */}
                <line x1="14" y1="48" x2="14" y2="88" stroke="#E2E8F0" strokeWidth="2.4" strokeLinecap="round" />
                {/* Flute Bowl Bottom */}
                <path d="M 4 10 Q 14 48 24 10 Z" fill="url(#fluteGlassGrad)" stroke="#3E160D" strokeWidth="1" />
                {/* Golden Champagne Liquid */}
                <path d="M 6 18 Q 14 46 22 18 Z" fill="url(#champagneGoldGrad)" />
                {/* Effervescent Rising Bubbles */}
                <circle cx="12" cy="24" r="1.4" fill="#FFFFFF" />
                <circle cx="15" cy="30" r="1.2" fill="#FFFFFF" />
                <circle cx="14" cy="38" r="1.5" fill="#FFFFFF" />
              </g>

              {/* Right Flute (Tilted Inward Left to Clink!) */}
              <g transform="translate(138, 110) rotate(-16)">
                {/* Flute Base Plate */}
                <ellipse cx="-14" cy="88" rx="14" ry="4" fill="url(#fluteGlassGrad)" stroke="#3E160D" strokeWidth="0.8" />
                {/* Flute Stem */}
                <line x1="-14" y1="48" x2="-14" y2="88" stroke="#E2E8F0" strokeWidth="2.4" strokeLinecap="round" />
                {/* Flute Bowl Bottom */}
                <path d="M -24 10 Q -14 48 -4 10 Z" fill="url(#fluteGlassGrad)" stroke="#3E160D" strokeWidth="1" />
                {/* Golden Champagne Liquid */}
                <path d="M -22 18 Q -14 46 -6 18 Z" fill="url(#champagneGoldGrad)" />
                {/* Rising Bubbles */}
                <circle cx="-12" cy="24" r="1.4" fill="#FFFFFF" />
                <circle cx="-15" cy="30" r="1.2" fill="#FFFFFF" />
                <circle cx="-13" cy="38" r="1.5" fill="#FFFFFF" />
              </g>

              {/* Clinking Sparkle Glint at the Toast Collision Point */}
              <g transform="translate(100, 118)">
                <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#FFFFFF" className="animate-ping" />
                <circle cx="0" cy="0" r="2.8" fill="#FDE047" />
              </g>

              {/* Metallic Golden Ribbon Streamers Curled Around Base */}
              <path
                d="M 42 210 Q 58 196 74 212 Q 90 228 106 210 Q 122 196 138 212 Q 154 226 168 210"
                fill="none"
                stroke="#FACC15"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d="M 42 210 Q 58 196 74 212 Q 90 228 106 210 Q 122 196 138 212 Q 154 226 168 210"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Twinkling Celebratory Stars */}
              <polygon points="34,68 37,74 44,76 38,80 40,86 34,82 28,86 30,80 24,76 31,74" fill="#FDE047" stroke="#3E160D" strokeWidth="0.6" className="animate-pulse" />
              <polygon points="166,66 169,72 176,74 170,78 172,84 166,80 160,84 162,78 156,74 163,72" fill="#FDE047" stroke="#3E160D" strokeWidth="0.6" />
              <circle cx="48" cy="45" r="2" fill="#FFFFFF" className="animate-ping" />
              <circle cx="152" cy="42" r="2" fill="#FFFFFF" className="animate-ping" />
            </g>
          </svg>

          {/* Festive Badge Tag Underneath Clock */}
          <div className="mt-1 flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full shadow-md border border-yellow-200 tracking-wider uppercase group-hover:scale-105 transition-transform">
            <Clock className="w-3 h-3 text-slate-950 animate-pulse" />
            <span>Midnight 12:00</span>
          </div>
        </div>
      </button>

      {/* Floating Festive Speech Callout on Click */}
      {showBubble && (
        <div className="absolute -top-12 left-2 sm:left-4 z-50 whitespace-nowrap bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-amber-800 dark:text-amber-300 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-2xl border-2 border-amber-400 animate-in fade-in zoom-in-75 duration-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-500 animate-bounce shrink-0" />
          <span>{bubbleText}</span>
          <div className="absolute left-8 -bottom-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-amber-400 rotate-45" />
        </div>
      )}

      {/* DYNAMIC STARS, BUBBLES & HOLOGRAPHIC SHOWER */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `newYearParticleFlutter ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
            pointerEvents: 'none',
            zIndex: 99999
          }}
          className="will-change-transform"
        >
          {p.type === 'bubble' ? (
            /* Golden Champagne Bubble SVG */
            <div
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: '0 0 10px #FDE047, 0 0 18px #CA8A04'
              }}
              className="rounded-full"
            />
          ) : p.type === 'star' ? (
            /* Golden Holiday Star SVG */
            <svg
              width={p.size * 1.2}
              height={p.size * 1.2}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(253,224,71,0.85)]"
            >
              <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
            </svg>
          ) : (
            /* Shimmering Starlight Diamond */
            <polygon
              points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9"
              fill="#FFFFFF"
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            />
          )}
        </div>
      ))}
    </div>
  );
}
