import React, { useState } from 'react';
import { Sparkles, Sun } from 'lucide-react';

/**
 * UttarayanSuryaTilgulMotif - Radiant Surya Dev (Sun God), Til-Gud Laddoos & Sugarcane Stalks
 * Positioned on bottom-right corner during Uttarayan / Makar Sankranti Festival Mode.
 * 
 * Features:
 * - Handcrafted vector artwork:
 *   Smiling Golden Surya Dev radiating 12 golden solar flare rays with divine tilak,
 *   paired with a traditional pure silver bowl overflowing with sweet Til-Gud
 *   (Sesame & Jaggery) laddoos, roasted chikki, and fresh sugarcane stalks (Ganna).
 * - White sticker outline filter matching the boutique illustration aesthetic.
 * - Interactive on CLICK:
 *   1. Sacred resonant temple bells + joyful warm solar drone chime (Web Audio API).
 *   2. Surya Dev radiance pulse & solar flare glow expansion.
 *   3. 50+ Floating Til-Gud Laddoos, Golden Solar Rays & Auspicious Sparkles!
 *   4. Heartfelt traditional festive blessings ("Til-Gud Ghya, God-God Bola! 🍯").
 */
export default function UttarayanSuryaTilgulMotif({ onOpenModal }) {
  const [isRadiating, setIsRadiating] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Til-Gud Ghya, God-God Bola! 🍯');
  const [showBubble, setShowBubble] = useState(false);

  const SURYA_BLESSINGS = [
    'Til-Gud Ghya, God-God Bola! 🍯',
    'Happy Makar Sankranti & Uttarayan! ☀️',
    'May Surya Dev Bless You with Radiance & Health! ✨',
    'Sweet Beginnings in Pure Sterling Silver! 🪙',
    'Harvest of Abundance, Sweetness & Good Fortune! 🌾'
  ];

  // Synthesize sacred temple bells + warm solar harmonic chord via Web Audio API
  const playSuryaAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Radiant Temple Bell Harmonic Chord (Fundamental 587.33Hz D5 + harmonics)
      const bellFreqs = [587.33, 880.00, 1174.66, 1760.00];
      bellFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const initialGain = 0.16 / (idx + 1);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(initialGain, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.45);
      });

      // 2. Warm resonant solar drone (Auspicious Indian Tanpura feel: D3 146.8Hz)
      const drone = ctx.createOscillator();
      const droneGain = ctx.createGain();
      drone.type = 'triangle';
      drone.frequency.setValueAtTime(146.83, now);
      droneGain.gain.setValueAtTime(0.001, now);
      droneGain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      drone.connect(droneGain);
      droneGain.connect(ctx.destination);
      drone.start(now);
      drone.stop(now + 1.25);
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  };

  const handleClick = (e) => {
    setIsRadiating(true);
    playSuryaAudio();

    const randomGreeting = SURYA_BLESSINGS[Math.floor(Math.random() * SURYA_BLESSINGS.length)];
    setBubbleText(randomGreeting);
    setShowBubble(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width * 0.5;
    const originY = rect.top + rect.height * 0.35;

    // 50+ dynamic solar & sweet particles: Til-Gud Laddoos, Golden Sunbeams, Solar Sparks
    const newParticles = Array.from({ length: 50 }).map((_, i) => {
      const angleDeg = -155 + Math.random() * 125;
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
        color: ['#FACC15', '#F59E0B', '#F97316', '#FEF08A', '#D97706', '#E2E8F0', '#FFFFFF'][i % 7],
        duration: 1.4 + Math.random() * 0.85,
        delay: Math.random() * 0.25,
        type: i % 3 === 0 ? 'laddoo' : i % 3 === 1 ? 'sunbeam' : 'star'
      };
    });

    setParticles(newParticles);

    setTimeout(() => {
      setIsRadiating(false);
    }, 1100);

    setTimeout(() => {
      setParticles([]);
    }, 2400);

    setTimeout(() => {
      setShowBubble(false);
    }, 3200);
  };

  return (
    <div className="fixed bottom-2 sm:bottom-4 right-1 sm:right-4 z-[38] pointer-events-auto select-none group">
      {/* Keyframe Animations */}
      <style>{`
        @keyframes suryaGentleHover {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(-1.5deg); }
        }

        @keyframes suryaRadiatePulse {
          0% { transform: scale(1) translateY(0); }
          25% { transform: scale(1.12, 0.94) translateY(4px); }
          50% { transform: scale(0.96, 1.12) translateY(-10px) rotate(-2deg); }
          75% { transform: scale(1.04, 0.97) translateY(-3px) rotate(1deg); }
          100% { transform: scale(1) translateY(0); }
        }

        @keyframes sunRaysSpinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes suryaParticleFly {
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

        .animate-surya-idle {
          animation: suryaGentleHover 3.4s ease-in-out infinite;
        }

        .animate-surya-pulse {
          animation: suryaRadiatePulse 0.85s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-rays-spin {
          animation: sunRaysSpinSlow 16s linear infinite;
          transform-origin: center;
        }
      `}</style>

      {/* Main Interactive Button */}
      <button
        type="button"
        onClick={handleClick}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-transform duration-300 ${
          isRadiating ? 'animate-surya-pulse' : 'group-hover:scale-105 active:scale-95'
        }`}
        title="Surya Dev & Til-Gud • Click for Divine Blessings & Sweetness!"
        aria-label="Uttarayan Surya Dev and Til-Gud"
      >
        <div className="relative flex flex-col items-center">
          {/* Ambient Warm Solar Golden Glow */}
          <div
            className={`absolute top-2 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 pointer-events-none ${
              isRadiating
                ? 'w-48 h-48 bg-gradient-to-r from-yellow-400/60 via-amber-400/60 to-orange-400/50 blur-2xl scale-125'
                : 'w-24 h-24 rounded-full bg-amber-400/25 blur-xl'
            }`}
          />

          {/* SVG Artwork: Handcrafted Radiant Surya Dev & Silver Bowl with Til-Gud Laddoos */}
          <svg
            className="w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 drop-shadow-2xl overflow-visible animate-surya-idle"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White Sticker Outline Filter */}
            <defs>
              <filter id="suryaStickerOutline" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="1" />
                <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="#FFFFFF" floodOpacity="0.85" />
              </filter>

              {/* Radiant Sun Golden Aura Gradient */}
              <linearGradient id="suryaAuraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9C4" />
                <stop offset="35%" stopColor="#FACC15" />
                <stop offset="75%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>

              {/* Divine Surya Face Gold Gradient */}
              <linearGradient id="suryaFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="50%" stopColor="#FEF08A" />
                <stop offset="100%" stopColor="#FDE047" />
              </linearGradient>

              {/* 925 Sterling Silver Prasad Bowl Gradient */}
              <linearGradient id="silverBowlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="#E2E8F0" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#F8FAFC" />
              </linearGradient>

              {/* Til-Gud (Sesame-Jaggery) Laddoo Gradient */}
              <linearGradient id="tilgudLaddooGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D97706" />
                <stop offset="50%" stopColor="#B45309" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>

              {/* Sugarcane Stem Green Gradient */}
              <linearGradient id="sugarcaneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ADE80" />
                <stop offset="50%" stopColor="#16A34A" />
                <stop offset="100%" stopColor="#15803D" />
              </linearGradient>
            </defs>

            {/* Main Composition with Sticker Outline */}
            <g filter="url(#suryaStickerOutline)">
              {/* ======================================================== */}
              {/* 1. SOFT DREAMY CLOUD PEDESTAL                            */}
              {/* ======================================================== */}
              <g transform="translate(100, 206)">
                <ellipse cx="0" cy="8" rx="48" ry="12" fill="#FFFFFF" stroke="#3E160D" strokeWidth="1.2" />
                <circle cx="-24" cy="2" r="14" fill="#FFFFFF" />
                <circle cx="0" cy="-2" r="16" fill="#FFFFFF" />
                <circle cx="24" cy="2" r="14" fill="#FFFFFF" />
                <ellipse cx="0" cy="6" rx="38" ry="6" fill="#FEF3C7" />
              </g>

              {/* ======================================================== */}
              {/* 2. FRESH SWEET SUGARCANE STALKS (GANNA)                  */}
              {/* ======================================================== */}
              <g transform="translate(142, 132) rotate(16)">
                {/* Sugarcane Stalk 1 */}
                <rect x="-4" y="-36" width="8" height="64" rx="2" fill="url(#sugarcaneGrad)" stroke="#3E160D" strokeWidth="1" />
                {/* Segments / Nodes of Cane */}
                <line x1="-4" y1="-20" x2="4" y2="-20" stroke="#FEF08A" strokeWidth="1.2" />
                <line x1="-4" y1="-4" x2="4" y2="-4" stroke="#FEF08A" strokeWidth="1.2" />
                <line x1="-4" y1="12" x2="4" y2="12" stroke="#FEF08A" strokeWidth="1.2" />

                {/* Sugarcane Green Leaves at Top */}
                <path d="M 0 -36 Q 16 -54 28 -48 Q 18 -42 0 -36" fill="#22C55E" stroke="#3E160D" strokeWidth="0.8" />
                <path d="M 0 -36 Q -12 -54 -24 -48 Q -14 -42 0 -36" fill="#16A34A" stroke="#3E160D" strokeWidth="0.8" />
              </g>

              {/* ======================================================== */}
              {/* 3. RADIANT GOLDEN SURYA DEV (SUN GOD)                    */}
              {/* ======================================================== */}
              <g transform="translate(100, 78)">
                {/* 12 Radiant Solar Flares / Petal Rays */}
                <g className="animate-rays-spin">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = i * 30;
                    return (
                      <polygon
                        key={`suryaray-${i}`}
                        points="0,-48 -7,-36 7,-36"
                        fill="url(#suryaAuraGrad)"
                        stroke="#3E160D"
                        strokeWidth="0.8"
                        transform={`rotate(${angle})`}
                      />
                    );
                  })}
                </g>

                {/* Inner Flaming Sun Disc Glow */}
                <circle cx="0" cy="0" r="36" fill="url(#suryaAuraGrad)" stroke="#3E160D" strokeWidth="1.4" />
                <circle cx="0" cy="0" r="30" fill="url(#suryaFaceGrad)" stroke="#3E160D" strokeWidth="1" />

                {/* Sacred Red & Gold Forehead Tilak (Chandan-Kumkum) */}
                <path d="M -5 -16 Q 0 -6 5 -16 Q 0 -10 -5 -16 Z" fill="#E11D48" />
                <circle cx="0" cy="-18" r="2.2" fill="#E11D48" />
                <circle cx="0" cy="-18" r="1.1" fill="#FEF08A" />

                {/* Rosy Radiant Cheeks */}
                <circle cx="-16" cy="6" r="6" fill="#F43F5E" fillOpacity="0.4" />
                <circle cx="16" cy="6" r="6" fill="#F43F5E" fillOpacity="0.4" />

                {/* Peaceful Smiling Eyes */}
                <path d="M -16 -2 Q -10 -8 -4 -2" stroke="#3E160D" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M 4 -2 Q 10 -8 16 -2" stroke="#3E160D" strokeWidth="2" strokeLinecap="round" fill="none" />

                {/* Benevolent Divine Smile */}
                <path d="M -7 12 Q 0 19 7 12" stroke="#E11D48" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              </g>

              {/* ======================================================== */}
              {/* 4. PURE 925 STERLING SILVER PRASAD BOWL & TIL-GUD        */}
              {/* ======================================================== */}
              <g transform="translate(100, 162)">
                {/* Heap of Golden Brown Til-Gud Laddoos */}
                {/* Laddoo 1 (Left) */}
                <circle cx="-18" cy="-8" r="10" fill="url(#tilgudLaddooGrad)" stroke="#3E160D" strokeWidth="1" />
                <circle cx="-20" cy="-10" r="1" fill="#FFFFFF" />
                <circle cx="-15" cy="-7" r="1" fill="#FFFFFF" />

                {/* Laddoo 2 (Right) */}
                <circle cx="18" cy="-8" r="10" fill="url(#tilgudLaddooGrad)" stroke="#3E160D" strokeWidth="1" />
                <circle cx="16" cy="-10" r="1" fill="#FFFFFF" />
                <circle cx="21" cy="-7" r="1" fill="#FFFFFF" />

                {/* Laddoo 3 (Center Top Peak) */}
                <circle cx="0" cy="-16" r="11" fill="url(#tilgudLaddooGrad)" stroke="#3E160D" strokeWidth="1" />
                {/* White Sesame Seeds on Laddoo */}
                <circle cx="-4" cy="-18" r="1.2" fill="#FFFFFF" />
                <circle cx="3" cy="-17" r="1.2" fill="#FFFFFF" />
                <circle cx="0" cy="-12" r="1.2" fill="#FFFFFF" />
                <circle cx="-3" cy="-13" r="1.2" fill="#FFFFFF" />

                {/* Laddoo 4 & 5 (Center Base) */}
                <circle cx="-8" cy="-4" r="10" fill="url(#tilgudLaddooGrad)" stroke="#3E160D" strokeWidth="1" />
                <circle cx="8" cy="-4" r="10" fill="url(#tilgudLaddooGrad)" stroke="#3E160D" strokeWidth="1" />

                {/* 925 Sterling Silver Deep Puja Bowl Base */}
                <path
                  d="M -34 0 C -34 26, 34 26, 34 0 Z"
                  fill="url(#silverBowlGrad)"
                  stroke="#3E160D"
                  strokeWidth="1.4"
                />
                {/* Silver Bowl Rim */}
                <ellipse cx="0" cy="0" rx="34" ry="7" fill="url(#silverBowlGrad)" stroke="#3E160D" strokeWidth="1.2" />
                {/* Engraved Floral Trim on Silver Bowl */}
                <path d="M -26 8 Q 0 16 26 8" stroke="#FFFFFF" strokeWidth="1.4" fill="none" />
                <circle cx="0" cy="11" r="2" fill="#FACC15" />

                {/* Pure Silver Miniature Pedestal Stand */}
                <rect x="-14" y="20" width="28" height="6" rx="2" fill="url(#silverBowlGrad)" stroke="#3E160D" strokeWidth="1" />
              </g>

              {/* Floating Auspicious Sparkles */}
              <polygon points="46,74 48,78 52,79 49,82 50,86 46,84 42,86 43,82 40,79 44,78" fill="#FACC15" stroke="#3E160D" strokeWidth="0.5" className="animate-pulse" />
              <circle cx="160" cy="74" r="2.5" fill="#FFFFFF" className="animate-ping" />
              <polygon points="152,112 153,115 156,116 154,118 154,121 152,119 149,121 150,118 148,116 151,115" fill="#F97316" />
            </g>
          </svg>

          {/* Festive Badge Tag Underneath Surya Dev */}
          <div className="mt-1 flex items-center space-x-1.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-slate-950 text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full shadow-md border border-amber-200 tracking-wider uppercase group-hover:scale-105 transition-transform">
            <Sun className="w-3 h-3 text-amber-950 animate-spin" />
            <span>Surya Dev &amp; Til-Gud</span>
          </div>
        </div>
      </button>

      {/* Floating Festive Speech Callout on Click */}
      {showBubble && (
        <div className="absolute -top-12 right-2 sm:right-4 z-50 whitespace-nowrap bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-amber-700 dark:text-amber-300 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-2xl border-2 border-amber-400 animate-in fade-in zoom-in-75 duration-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-500 animate-bounce shrink-0" />
          <span>{bubbleText}</span>
          <div className="absolute right-8 -bottom-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-amber-400 rotate-45" />
        </div>
      )}

      {/* DYNAMIC SOLAR & SWEET PARTICLES SHOWER */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `suryaParticleFly ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
            pointerEvents: 'none',
            zIndex: 99999
          }}
          className="will-change-transform"
        >
          {p.type === 'laddoo' ? (
            /* Sweet Golden Til-Gud Laddoo with Sesame Seeds */
            <svg
              width={p.size * 1.3}
              height={p.size * 1.3}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(217,119,6,0.85)]"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="9" cy="9" r="1.5" fill="#FFFFFF" />
              <circle cx="15" cy="10" r="1.5" fill="#FFFFFF" />
              <circle cx="11" cy="15" r="1.5" fill="#FFFFFF" />
            </svg>
          ) : p.type === 'sunbeam' ? (
            /* Golden Sunbeam Flare */
            <svg
              width={p.size * 1.3}
              height={p.size * 1.3}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]"
            >
              <circle cx="12" cy="12" r="6" />
              <line x1="12" y1="1" x2="12" y2="5" stroke={p.color} strokeWidth="2" />
              <line x1="12" y1="19" x2="12" y2="23" stroke={p.color} strokeWidth="2" />
              <line x1="1" y1="12" x2="5" y2="12" stroke={p.color} strokeWidth="2" />
              <line x1="19" y1="12" x2="23" y2="12" stroke={p.color} strokeWidth="2" />
            </svg>
          ) : (
            /* Radiant Star Sparkle */
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(254,240,138,0.85)]"
            >
              <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
