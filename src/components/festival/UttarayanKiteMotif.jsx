import React, { useState } from 'react';
import { Sparkles, Wind } from 'lucide-react';

/**
 * UttarayanKiteMotif - Colorful Flying Kite (Patang) & Traditional Kite Spool (Firki)
 * Positioned on bottom-left corner during Uttarayan / Makar Sankranti Festival Mode.
 * 
 * Features:
 * - Handcrafted vector artwork:
 *   Vibrant multi-colored diamond paper kite with aerodynamic bamboo cross-sticks,
 *   decorative tassel tail, paired with a traditional carved wooden & silver-ringed
 *   kite spool (Firki / Charkhi) wound with vibrant colored glass manja thread.
 * - White sticker outline filter matching the boutique illustration aesthetic.
 * - Interactive on CLICK:
 *   1. Kite soaring wind gust + cheerful celebration whistle & celebratory chime (Web Audio API).
 *   2. Kite acrobatic swoop & firki spin animation.
 *   3. 50+ Floating Mini Kites, Manja Thread Swirls & Solar Sparkles shower!
 *   4. Iconic "Kai Po Che! 🪁" festive cheer speech callout.
 */
export default function UttarayanKiteMotif({ onOpenModal }) {
  const [isFlying, setIsFlying] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Kai Po Che! Happy Uttarayan! 🪁');
  const [showBubble, setShowBubble] = useState(false);

  const KITE_WISHES = [
    'Kai Po Che! Happy Uttarayan! 🪁',
    'Ae Lapet! May Your Dreams Fly Higher than the Clouds! ✨',
    'Soar to Greater Heights in Pure Silver Radiance! 💎',
    'Sweet Sunlight, Colorful Skies & Precious Moments! ☀️',
    'Wishing You High Spirits & Boundless Prosperity! 🌟'
  ];

  // Synthesize wind gust + cheerful celebration whistle chime via Web Audio API
  const playKiteAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Whistling wind gust noise
      const bufferSize = ctx.sampleRate * 0.35;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(800, now);
      windFilter.frequency.exponentialRampToValueAtTime(1400, now + 0.18);
      windFilter.frequency.exponentialRampToValueAtTime(600, now + 0.35);
      windFilter.Q.setValueAtTime(3.0, now);

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.001, now);
      windGain.gain.linearRampToValueAtTime(0.18, now + 0.08);
      windGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      noise.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(ctx.destination);
      noise.start(now);

      // 2. Cheerful festive chime arpeggio: C5 -> E5 -> G5 -> A5 -> C6
      const chimeNotes = [523.25, 659.25, 783.99, 880.00, 1046.50];
      chimeNotes.forEach((freq, idx) => {
        const t = now + 0.06 + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.16, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.95);
      });
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  };

  const handleClick = (e) => {
    setIsFlying(true);
    playKiteAudio();

    const randomGreeting = KITE_WISHES[Math.floor(Math.random() * KITE_WISHES.length)];
    setBubbleText(randomGreeting);
    setShowBubble(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width * 0.5;
    const originY = rect.top + rect.height * 0.35;

    // 48+ dynamic kite festival particles: Mini Kites, Ribbon Streamers, Solar Stars
    const newParticles = Array.from({ length: 48 }).map((_, i) => {
      const angleDeg = -145 + Math.random() * 125;
      const angleRad = (angleDeg * Math.PI) / 180;
      const distance = 140 + Math.random() * 370;
      const tx = Math.cos(angleRad) * distance;
      const ty = Math.sin(angleRad) * distance;

      return {
        id: Date.now() + Math.random(),
        startX: originX,
        startY: originY,
        tx,
        ty,
        size: Math.random() * 14 + 7,
        color: ['#F97316', '#EF4444', '#06B6D4', '#FACC15', '#EC4899', '#10B981', '#FFFFFF'][i % 7],
        duration: 1.4 + Math.random() * 0.85,
        delay: Math.random() * 0.25,
        type: i % 3 === 0 ? 'kite' : i % 3 === 1 ? 'ribbon' : 'star'
      };
    });

    setParticles(newParticles);

    setTimeout(() => {
      setIsFlying(false);
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
        @keyframes kiteGentleHover {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
        }

        @keyframes kiteSwoopSoar {
          0% { transform: scale(1) translateY(0) rotate(0deg); }
          25% { transform: scale(1.12, 0.94) translateY(4px) rotate(-6deg); }
          50% { transform: scale(1.05, 1.1) translateY(-14px) rotate(8deg); }
          75% { transform: scale(1.02, 0.98) translateY(-4px) rotate(-3deg); }
          100% { transform: scale(1) translateY(0) rotate(0deg); }
        }

        @keyframes firkiSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes kiteTailFlutter {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(8deg); }
        }

        @keyframes kiteParticleFly {
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

        .animate-kite-idle {
          animation: kiteGentleHover 3.4s ease-in-out infinite;
        }

        .animate-kite-soar {
          animation: kiteSwoopSoar 0.95s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-tail-flutter {
          animation: kiteTailFlutter 1.6s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>

      {/* Main Interactive Button */}
      <button
        type="button"
        onClick={handleClick}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-transform duration-300 ${
          isFlying ? 'animate-kite-soar' : 'group-hover:scale-105 active:scale-95'
        }`}
        title="Colorful Patang & Firki • Click for Kai Po Che & Soaring Kites!"
        aria-label="Uttarayan Kite & Firki"
      >
        <div className="relative flex flex-col items-center">
          {/* Ambient Warm Solar Amber Glow */}
          <div
            className={`absolute top-2 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 pointer-events-none ${
              isFlying
                ? 'w-48 h-48 bg-gradient-to-r from-orange-500/60 via-amber-400/60 to-yellow-400/50 blur-2xl scale-125'
                : 'w-24 h-24 rounded-full bg-amber-400/25 blur-xl'
            }`}
          />

          {/* SVG Artwork: Handcrafted Colorful Diamond Kite & Traditional Wooden/Silver Firki Spool */}
          <svg
            className="w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 drop-shadow-2xl overflow-visible animate-kite-idle"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White Sticker Outline Filter */}
            <defs>
              <filter id="kiteStickerOutline" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="1" />
                <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="#FFFFFF" floodOpacity="0.85" />
              </filter>

              {/* Saffron & Orange Kite Top Gradient */}
              <linearGradient id="kiteSaffronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDBA74" />
                <stop offset="50%" stopColor="#FB923C" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>

              {/* Turquoise Blue Kite Quadrant Gradient */}
              <linearGradient id="kiteCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67E8F9" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#0891B2" />
              </linearGradient>

              {/* Golden Yellow Kite Quadrant Gradient */}
              <linearGradient id="kiteYellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#EAB308" />
              </linearGradient>

              {/* Magenta Pink Kite Quadrant Gradient */}
              <linearGradient id="kitePinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="50%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#DB2777" />
              </linearGradient>

              {/* Wooden Firki Core Gradient */}
              <linearGradient id="firkiWoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D97706" />
                <stop offset="50%" stopColor="#B45309" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>

              {/* 925 Sterling Silver Ring Gradient on Firki */}
              <linearGradient id="firkiSilverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#E2E8F0" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#F8FAFC" />
              </linearGradient>

              {/* Manja Glass Thread Gradient (Vibrant Neon Red/Pink) */}
              <linearGradient id="manjaThreadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDA4AF" />
                <stop offset="40%" stopColor="#F43F5E" />
                <stop offset="80%" stopColor="#E11D48" />
                <stop offset="100%" stopColor="#BE123C" />
              </linearGradient>
            </defs>

            {/* Main Composition with Sticker Outline */}
            <g filter="url(#kiteStickerOutline)">
              {/* ======================================================== */}
              {/* 1. SOFT DREAMY SKY CLOUD BASE                            */}
              {/* ======================================================== */}
              <g transform="translate(100, 206)">
                <ellipse cx="0" cy="8" rx="48" ry="12" fill="#FFFFFF" stroke="#3E160D" strokeWidth="1.2" />
                <circle cx="-24" cy="2" r="14" fill="#FFFFFF" />
                <circle cx="0" cy="-2" r="16" fill="#FFFFFF" />
                <circle cx="24" cy="2" r="14" fill="#FFFFFF" />
                <ellipse cx="0" cy="6" rx="38" ry="6" fill="#FEF3C7" />
              </g>

              {/* ======================================================== */}
              {/* 2. TRADITIONAL WOODEN & SILVER FIRKI (KITE SPOOL)        */}
              {/* ======================================================== */}
              <g transform="translate(132, 168) rotate(18)">
                {/* Lower Firki Handle */}
                <rect x="-4" y="32" width="8" height="22" rx="3" fill="url(#firkiWoodGrad)" stroke="#3E160D" strokeWidth="1" />
                {/* Silver Ring on Handle */}
                <rect x="-4" y="36" width="8" height="3" fill="url(#firkiSilverGrad)" />

                {/* Upper Firki Handle */}
                <rect x="-4" y="-52" width="8" height="22" rx="3" fill="url(#firkiWoodGrad)" stroke="#3E160D" strokeWidth="1" />
                <rect x="-4" y="-42" width="8" height="3" fill="url(#firkiSilverGrad)" />

                {/* Bottom Circular Wheel Plate */}
                <ellipse cx="0" cy="30" rx="22" ry="7" fill="url(#firkiWoodGrad)" stroke="#3E160D" strokeWidth="1.2" />
                <ellipse cx="0" cy="30" rx="14" ry="4" fill="url(#firkiSilverGrad)" />

                {/* Cylindrical Spool Wound with Radiant Glass Manja Thread */}
                <path
                  d="M -18 -26 L 18 -26 L 18 28 L -18 28 Z"
                  fill="url(#manjaThreadGrad)"
                  stroke="#3E160D"
                  strokeWidth="1.2"
                />
                {/* Thread Texture Stripes */}
                <line x1="-18" y1="-18" x2="18" y2="-18" stroke="#FDA4AF" strokeWidth="1" />
                <line x1="-18" y1="-10" x2="18" y2="-10" stroke="#FFE4E6" strokeWidth="1.2" />
                <line x1="-18" y1="-2" x2="18" y2="-2" stroke="#FDA4AF" strokeWidth="1" />
                <line x1="-18" y1="6" x2="18" y2="6" stroke="#FFE4E6" strokeWidth="1.2" />
                <line x1="-18" y1="14" x2="18" y2="14" stroke="#FDA4AF" strokeWidth="1" />
                <line x1="-18" y1="22" x2="18" y2="22" stroke="#FDA4AF" strokeWidth="1" />

                {/* Top Circular Wheel Plate */}
                <ellipse cx="0" cy="-28" rx="22" ry="7" fill="url(#firkiWoodGrad)" stroke="#3E160D" strokeWidth="1.2" />
                <ellipse cx="0" cy="-28" rx="14" ry="4" fill="url(#firkiSilverGrad)" />

                {/* Decorative Silver Center Star */}
                <circle cx="0" cy="-28" r="3.5" fill="#FFFFFF" stroke="#3E160D" strokeWidth="0.8" />

                {/* Unwinding Manja Thread to Kite */}
                <path
                  d="M 12 -12 Q 24 -36 -28 -56"
                  stroke="#F43F5E"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  fill="none"
                />
              </g>

              {/* ======================================================== */}
              {/* 3. VIBRANT MULTI-COLORED DIAMOND KITE (PATANG)           */}
              {/* ======================================================== */}
              <g transform="translate(82, 102) rotate(-8)">
                {/* 4 Quadrants of the Diamond Paper Kite */}
                {/* Top-Left Quadrant */}
                <polygon points="0,-72 -54,0 0,0" fill="url(#kiteSaffronGrad)" stroke="#3E160D" strokeWidth="1.1" />
                {/* Top-Right Quadrant */}
                <polygon points="0,-72 54,0 0,0" fill="url(#kiteYellowGrad)" stroke="#3E160D" strokeWidth="1.1" />
                {/* Bottom-Left Quadrant */}
                <polygon points="-54,0 0,64 0,0" fill="url(#kiteCyanGrad)" stroke="#3E160D" strokeWidth="1.1" />
                {/* Bottom-Right Quadrant */}
                <polygon points="54,0 0,64 0,0" fill="url(#kitePinkGrad)" stroke="#3E160D" strokeWidth="1.1" />

                {/* Center Decorative Circular Eye Patch (Traditional Indian Kite Style) */}
                <circle cx="0" cy="-6" r="16" fill="#FFFFFF" stroke="#3E160D" strokeWidth="1.2" />
                <circle cx="0" cy="-6" r="12" fill="#E11D48" />
                <circle cx="0" cy="-6" r="6" fill="#FACC15" />
                <circle cx="0" cy="-6" r="2.5" fill="#FFFFFF" />

                {/* Bamboo Backbone Stick (Thadda) */}
                <line x1="0" y1="-72" x2="0" y2="64" stroke="#78350F" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="0" y1="-72" x2="0" y2="64" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />

                {/* Curved Bow Bamboo Stick (Khaamp) */}
                <path
                  d="M -54 0 Q 0 -54 54 0"
                  stroke="#78350F"
                  strokeWidth="2.4"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M -54 0 Q 0 -54 54 0"
                  stroke="#FDE68A"
                  strokeWidth="1.2"
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Bridle Tie Points (Kanni Knots) */}
                <circle cx="0" cy="-24" r="2.5" fill="#FFFFFF" stroke="#3E160D" strokeWidth="0.8" />
                <circle cx="0" cy="28" r="2.5" fill="#FFFFFF" stroke="#3E160D" strokeWidth="0.8" />
                {/* Tied Flight Thread Loop */}
                <path d="M 0 -24 L 28 6 L 0 28" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />

                {/* Bottom Triangle Tail (Dhadhi) */}
                <polygon points="-16,64 16,64 0,84" fill="url(#kiteSaffronGrad)" stroke="#3E160D" strokeWidth="1.1" />
                <circle cx="0" cy="72" r="3" fill="#FACC15" />

                {/* Fluttering Paper Ribbon Streamers at Wingtips */}
                <g className="animate-tail-flutter">
                  {/* Left Wingtip Ribbon */}
                  <path d="M -54 0 Q -64 12 -58 24 Q -52 36 -62 44" stroke="#06B6D4" strokeWidth="2" fill="none" />
                  {/* Right Wingtip Ribbon */}
                  <path d="M 54 0 Q 64 12 58 24 Q 52 36 62 44" stroke="#EC4899" strokeWidth="2" fill="none" />
                  {/* Bottom Tail Tassel Streamers */}
                  <path d="M -4 84 Q -12 96 -6 108" stroke="#FACC15" strokeWidth="2" fill="none" />
                  <path d="M 4 84 Q 12 96 6 108" stroke="#F97316" strokeWidth="2" fill="none" />
                </g>
              </g>

              {/* Solar Sparkles & Floating Star Confetti */}
              <polygon points="34,68 36,72 40,73 37,76 38,80 34,78 30,80 31,76 28,73 32,72" fill="#FACC15" stroke="#3E160D" strokeWidth="0.5" className="animate-pulse" />
              <circle cx="162" cy="72" r="2.5" fill="#FFFFFF" className="animate-ping" />
              <polygon points="152,108 153,111 156,112 154,114 154,117 152,115 149,117 150,114 148,112 151,111" fill="#06B6D4" />
            </g>
          </svg>

          {/* Festive Badge Tag Underneath Kite */}
          <div className="mt-1 flex items-center space-x-1.5 bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 text-slate-950 text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full shadow-md border border-amber-200 tracking-wider uppercase group-hover:scale-105 transition-transform">
            <Wind className="w-3 h-3 text-orange-950 animate-bounce" />
            <span>Patang &amp; Firki</span>
          </div>
        </div>
      </button>

      {/* Floating Festive Speech Callout on Click */}
      {showBubble && (
        <div className="absolute -top-12 left-2 sm:left-4 z-50 whitespace-nowrap bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-amber-700 dark:text-amber-300 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-2xl border-2 border-amber-400 animate-in fade-in zoom-in-75 duration-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-500 animate-bounce shrink-0" />
          <span>{bubbleText}</span>
          <div className="absolute left-8 -bottom-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-amber-400 rotate-45" />
        </div>
      )}

      {/* DYNAMIC KITE FESTIVAL PARTICLES SHOWER */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `kiteParticleFly ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
            pointerEvents: 'none',
            zIndex: 99999
          }}
          className="will-change-transform"
        >
          {p.type === 'kite' ? (
            /* Mini Diamond Paper Kite SVG */
            <svg
              width={p.size * 1.4}
              height={p.size * 1.4}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(249,115,22,0.85)]"
            >
              <polygon points="12,2 22,12 12,22 2,12" />
              <line x1="12" y1="2" x2="12" y2="22" stroke="#FFFFFF" strokeWidth="1.2" />
              <path d="M 2 12 Q 12 6 22 12" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
              <polygon points="10,22 14,22 12,24" fill="#FACC15" />
            </svg>
          ) : p.type === 'ribbon' ? (
            /* Fluttering Ribbon Streamer SVG */
            <svg
              width={p.size * 1.2}
              height={p.size * 1.2}
              viewBox="0 0 24 24"
              fill="none"
              stroke={p.color}
              strokeWidth="2.5"
              className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
            >
              <path d="M 4 4 Q 16 8 8 16 Q 18 20 20 22" />
            </svg>
          ) : (
            /* Golden Solar Star Sparkle */
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(250,204,21,0.85)]"
            >
              <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
