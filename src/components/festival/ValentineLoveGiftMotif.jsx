import React, { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';

/**
 * ValentineLoveGiftMotif - Open Velvet Ring Box, Solitaire Promise Ring & Blooming Red Rose
 * Positioned on bottom-right corner during Valentine's Day Romance Mode.
 * 
 * Features:
 * - Handcrafted vector artwork:
 *   Open crimson/burgundy velvet ring box lined with satin, holding a sparkling
 *   925 sterling silver solitaire promise ring with brilliant diamond glints,
 *   nested beside a fresh red rose with dewdrops and a wax-sealed love letter.
 * - White sticker outline filter matching the boutique illustration aesthetic.
 * - Interactive on CLICK:
 *   1. Romantic Music Box chime melody (Web Audio API).
 *   2. Ring box sparkle pulse & celebratory heart bounce.
 *   3. 50+ Floating Rose Petals, Diamond Glints & Ruby Hearts shower!
 *   4. Romantic message speech callout.
 */
export default function ValentineLoveGiftMotif({ onOpenModal }) {
  const [isSparkling, setIsSparkling] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Forever in Love! 💍');
  const [showBubble, setShowBubble] = useState(false);

  const LOVE_WISHES = [
    'Forever Starts Today! Will You Be My Valentine? 💍',
    'Pure Silver, Endless Love & Precious Memories! 💖',
    'A Promise Carved in 925 Sterling Silver! ✨',
    'You Are My Today and All of My Tomorrows! 🌹',
    'Every Love Story is Beautiful, but Ours is Pure Silver! 💎'
  ];

  // Synthesize romantic music-box melody via Web Audio API
  const playMusicBoxAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Romantic music box arpeggio: C5 -> E5 -> G5 -> B5 -> C6 -> E6
      const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.09;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        // Music box bell-like envelope (fast attack, natural metallic decay)
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 1.15);
      });

      // Subtle warm sub-tone harmonic
      const warm = ctx.createOscillator();
      const warmGain = ctx.createGain();
      warm.type = 'triangle';
      warm.frequency.setValueAtTime(261.63, now);
      warmGain.gain.setValueAtTime(0.08, now);
      warmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      warm.connect(warmGain);
      warmGain.connect(ctx.destination);
      warm.start(now);
      warm.stop(now + 0.85);
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  };

  const handleClick = (e) => {
    setIsSparkling(true);
    playMusicBoxAudio();

    const randomGreeting = LOVE_WISHES[Math.floor(Math.random() * LOVE_WISHES.length)];
    setBubbleText(randomGreeting);
    setShowBubble(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width * 0.5;
    const originY = rect.top + rect.height * 0.35;

    // 50+ dynamic love particles: Rose Petals, Diamond Sparks, Ruby Hearts
    const newParticles = Array.from({ length: 50 }).map((_, i) => {
      // Fan upwards and towards the screen center (-150 to -30 degrees)
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
        color: ['#F43F5E', '#E11D48', '#FB7185', '#FDA4AF', '#FDE047', '#E2E8F0', '#FFFFFF'][i % 7],
        duration: 1.4 + Math.random() * 0.85,
        delay: Math.random() * 0.25,
        type: i % 4 === 0 ? 'diamond' : i % 4 === 1 ? 'heart' : i % 4 === 2 ? 'petal' : 'star'
      };
    });

    setParticles(newParticles);

    setTimeout(() => {
      setIsSparkling(false);
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
        @keyframes loveBoxGentleHover {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(-1.2deg); }
        }

        @keyframes loveBoxSparklePulse {
          0% { transform: scale(1) translateY(0); }
          25% { transform: scale(1.12, 0.94) translateY(4px); }
          50% { transform: scale(0.96, 1.12) translateY(-10px) rotate(2deg); }
          75% { transform: scale(1.04, 0.97) translateY(-3px) rotate(-1deg); }
          100% { transform: scale(1) translateY(0); }
        }

        @keyframes diamondGlintRotate {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.9));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(254, 205, 211, 1)) drop-shadow(0 0 32px rgba(244, 63, 94, 0.8));
            transform: scale(1.18);
          }
        }

        @keyframes loveGiftParticleFly {
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

        .animate-love-idle {
          animation: loveBoxGentleHover 3.4s ease-in-out infinite;
        }

        .animate-love-bounce {
          animation: loveBoxSparklePulse 0.85s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-diamond-glint {
          animation: diamondGlintRotate 2s ease-in-out infinite;
        }
      `}</style>

      {/* Main Interactive Button */}
      <button
        type="button"
        onClick={handleClick}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-transform duration-300 ${
          isSparkling ? 'animate-love-bounce' : 'group-hover:scale-105 active:scale-95'
        }`}
        title="Velvet Ring Box & Solitaire Ring • Click for Romantic Chimes & Petals!"
        aria-label="Valentine Love Gift"
      >
        <div className="relative flex flex-col items-center">
          {/* Ambient Warm Rose-Gold Glow */}
          <div
            className={`absolute top-2 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 pointer-events-none ${
              isSparkling
                ? 'w-48 h-48 bg-gradient-to-r from-red-500/60 via-rose-500/60 to-pink-500/50 blur-2xl scale-125'
                : 'w-24 h-24 rounded-full bg-rose-500/25 blur-xl'
            }`}
          />

          {/* SVG Artwork: Handcrafted Illustrated Velvet Ring Box, Diamond Solitaire & Rose */}
          <svg
            className="w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 drop-shadow-2xl overflow-visible animate-love-idle"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White Sticker Outline Filter */}
            <defs>
              <filter id="loveGiftStickerOutline" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="1" />
                <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="#FFFFFF" floodOpacity="0.85" />
              </filter>

              {/* Crimson Velvet Gradient */}
              <linearGradient id="velvetBoxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BE123C" />
                <stop offset="35%" stopColor="#9F1239" />
                <stop offset="75%" stopColor="#881337" />
                <stop offset="100%" stopColor="#4C0519" />
              </linearGradient>

              {/* Box Gold Trim Gradient */}
              <linearGradient id="boxGoldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="45%" stopColor="#FACC15" />
                <stop offset="85%" stopColor="#CA8A04" />
                <stop offset="100%" stopColor="#854D0E" />
              </linearGradient>

              {/* White Satin Interior Gradient */}
              <linearGradient id="satinWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#F8FAFC" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>

              {/* 925 Sterling Silver Ring Gradient */}
              <linearGradient id="silverRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#CBD5E1" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#F1F5F9" />
              </linearGradient>

              {/* Solitaire Diamond Gradient */}
              <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#E0F2FE" />
                <stop offset="80%" stopColor="#BAE6FD" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>

              {/* Blooming Rose Gradient */}
              <linearGradient id="roseRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FB7185" />
                <stop offset="40%" stopColor="#E11D48" />
                <stop offset="80%" stopColor="#BE123C" />
                <stop offset="100%" stopColor="#881337" />
              </linearGradient>
            </defs>

            {/* Main Composition with Sticker Outline */}
            <g filter="url(#loveGiftStickerOutline)">
              {/* ======================================================== */}
              {/* 1. WAX-SEALED LOVE LETTER (BEHIND BOX)                   */}
              {/* ======================================================== */}
              <g transform="translate(18, 128) rotate(-14)">
                {/* Envelope Base */}
                <rect x="0" y="0" width="62" height="42" rx="4" fill="#FFFBEB" stroke="#3E160D" strokeWidth="1.2" />
                {/* Envelope Flap Lines */}
                <path d="M 0 0 L 31 22 L 62 0" fill="#FEF3C7" stroke="#3E160D" strokeWidth="1" />
                <path d="M 0 42 L 24 20" stroke="#CBD5E1" strokeWidth="0.8" />
                <path d="M 62 42 L 38 20" stroke="#CBD5E1" strokeWidth="0.8" />
                {/* Red Wax Seal with Heart */}
                <circle cx="31" cy="22" r="7" fill="#BE123C" stroke="#3E160D" strokeWidth="0.8" />
                <path d="M 31 24 C 29 21, 27 21, 27 19.5 C 27 18, 29 17.5, 31 19 C 33 17.5, 35 18, 35 19.5 C 35 21, 33 21, 31 24 Z" fill="#FFFFFF" />
              </g>

              {/* ======================================================== */}
              {/* 2. OPEN LUXURY VELVET RING BOX                           */}
              {/* ======================================================== */}
              {/* Open Box Lid (Tilted Upward) */}
              <g transform="translate(100, 94)">
                {/* Lid Outer Shell */}
                <path
                  d="M -38 0 C -38 -28, 38 -28, 38 0 L 32 10 L -32 10 Z"
                  fill="url(#velvetBoxGrad)"
                  stroke="#3E160D"
                  strokeWidth="1.4"
                />
                {/* Gold Trim Rim on Lid */}
                <path d="M -38 0 L -32 10 L 32 10 L 38 0" stroke="url(#boxGoldTrim)" strokeWidth="2" fill="none" />
                {/* Inner White Satin Silk Lining of Lid */}
                <ellipse cx="0" cy="-4" rx="28" ry="16" fill="url(#satinWhiteGrad)" stroke="#3E160D" strokeWidth="1" />
                <path d="M -18 -8 Q 0 4 18 -8" stroke="#E2E8F0" strokeWidth="1.2" fill="none" />
                <path d="M -12 -12 Q 0 -4 12 -12" stroke="#E2E8F0" strokeWidth="1.2" fill="none" />
              </g>

              {/* Lower Box Base Body */}
              <g transform="translate(100, 150)">
                {/* Deep Velvet Cushion Base */}
                <path
                  d="M -44 -20 L 44 -20 L 36 28 C 36 34, -36 34, -36 28 Z"
                  fill="url(#velvetBoxGrad)"
                  stroke="#3E160D"
                  strokeWidth="1.4"
                />
                {/* Gold Edge Lining */}
                <path d="M -44 -20 L -36 28 C -36 34, 36 34, 36 28 L 44 -20" stroke="url(#boxGoldTrim)" strokeWidth="2.2" fill="none" />

                {/* Ring Cushion Slit (White Satin Pillow) */}
                <ellipse cx="0" cy="-18" rx="38" ry="14" fill="url(#satinWhiteGrad)" stroke="#3E160D" strokeWidth="1.4" />
                {/* Velvet Ring Slot Opening */}
                <ellipse cx="0" cy="-18" rx="18" ry="4" fill="#4C0519" stroke="#3E160D" strokeWidth="1" />
              </g>

              {/* ======================================================== */}
              {/* 3. SPARKLING 925 STERLING SILVER SOLITAIRE PROMISE RING  */}
              {/* ======================================================== */}
              <g transform="translate(100, 126)">
                {/* Silver Ring Band */}
                <ellipse cx="0" cy="0" rx="14" ry="12" fill="none" stroke="url(#silverRingGrad)" strokeWidth="4.5" />
                <ellipse cx="0" cy="0" rx="14" ry="12" fill="none" stroke="#3E160D" strokeWidth="1.2" />

                {/* Solitaire 4-Prong Crown Setting */}
                <path d="M -6 -10 L -4 -16 L 4 -16 L 6 -10 Z" fill="url(#silverRingGrad)" stroke="#3E160D" strokeWidth="1" />
                <line x1="-4" y1="-16" x2="-4" y2="-11" stroke="#FFFFFF" strokeWidth="1" />
                <line x1="4" y1="-16" x2="4" y2="-11" stroke="#FFFFFF" strokeWidth="1" />

                {/* Brilliant Cut Solitaire Diamond */}
                <g transform="translate(0, -18)" className="animate-diamond-glint">
                  {/* Faceted Diamond Silhouette */}
                  <polygon
                    points="0,-12 9,-5 6,3 -6,3 -9,-5"
                    fill="url(#diamondGrad)"
                    stroke="#3E160D"
                    strokeWidth="1"
                  />
                  {/* Diamond Internal Facet Reflection Lines */}
                  <polygon points="0,-12 4,-5 0,-1 -4,-5" fill="#FFFFFF" fillOpacity="0.8" />
                  <line x1="0" y1="-1" x2="0" y2="3" stroke="#FFFFFF" strokeWidth="1" />
                  <line x1="-9" y1="-5" x2="9" y2="-5" stroke="#FFFFFF" strokeWidth="0.8" />

                  {/* Super Sparkle Glint Star */}
                  <polygon
                    points="0,-14 2,-10 6,-8 2,-6 0,-2 -2,-6 -6,-8 -2,-10"
                    fill="#FFFFFF"
                    className="animate-pulse"
                  />
                  <circle cx="0" cy="-8" r="1.5" fill="#FEF08A" />
                </g>
              </g>

              {/* ======================================================== */}
              {/* 4. BLOOMING FRESH RED ROSE & STEM (RIGHT SIDE)           */}
              {/* ======================================================== */}
              <g transform="translate(142, 162)">
                {/* Green Stem & Leaves */}
                <path d="M 0 10 Q 12 24 16 38" stroke="#15803D" strokeWidth="3" fill="none" strokeLinecap="round" />
                {/* Rose Leaf 1 */}
                <path d="M 6 18 C 16 16, 26 22, 22 30 C 14 30, 8 24, 6 18 Z" fill="#22C55E" stroke="#3E160D" strokeWidth="1" />
                <line x1="6" y1="18" x2="18" y2="26" stroke="#15803D" strokeWidth="0.8" />

                {/* Rose Flower Petals */}
                <g transform="translate(0, 0)">
                  {/* Outer Petals */}
                  <circle cx="0" cy="0" r="16" fill="url(#roseRedGrad)" stroke="#3E160D" strokeWidth="1.2" />
                  <circle cx="-5" cy="-2" r="12" fill="url(#roseRedGrad)" stroke="#3E160D" strokeWidth="1" />
                  <circle cx="5" cy="-2" r="12" fill="url(#roseRedGrad)" stroke="#3E160D" strokeWidth="1" />
                  {/* Center Petal Swirl */}
                  <path d="M -6 -4 C -4 -10, 4 -10, 6 -4 C 8 2, -8 2, -6 -4 Z" fill="#E11D48" stroke="#3E160D" strokeWidth="1" />
                  <circle cx="0" cy="-2" r="4" fill="#9F1239" />
                  {/* Dewdrop Glimmer */}
                  <circle cx="4" cy="4" r="2" fill="#FFFFFF" fillOpacity="0.85" />
                </g>
              </g>

              {/* Floating Romance Sparkles */}
              <polygon points="52,90 54,94 58,95 55,98 56,102 52,100 48,102 49,98 46,95 50,94" fill="#FDE047" stroke="#3E160D" strokeWidth="0.5" className="animate-pulse" />
              <circle cx="160" cy="98" r="2.5" fill="#FFFFFF" className="animate-ping" />
              <polygon points="152,112 153,115 156,116 154,118 154,121 152,119 149,121 150,118 148,116 151,115" fill="#F43F5E" />
            </g>
          </svg>

          {/* Festive Badge Tag Underneath Box */}
          <div className="mt-1 flex items-center space-x-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full shadow-md border border-rose-300/80 tracking-wider uppercase group-hover:scale-105 transition-transform">
            <Heart className="w-3 h-3 text-pink-200 animate-pulse fill-pink-200" />
            <span>Solitaire &amp; Roses</span>
          </div>
        </div>
      </button>

      {/* Floating Speech Callout on Click */}
      {showBubble && (
        <div className="absolute -top-12 right-2 sm:right-4 z-50 whitespace-nowrap bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-rose-700 dark:text-rose-300 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-2xl border-2 border-rose-400 animate-in fade-in zoom-in-75 duration-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-rose-500 animate-bounce shrink-0" />
          <span>{bubbleText}</span>
          <div className="absolute right-8 -bottom-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-rose-400 rotate-45" />
        </div>
      )}

      {/* DYNAMIC LOVE PARTICLES SHOWER */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `loveGiftParticleFly ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
            pointerEvents: 'none',
            zIndex: 99999
          }}
          className="will-change-transform"
        >
          {p.type === 'diamond' ? (
            /* Sparkling Diamond Shape */
            <svg
              width={p.size * 1.3}
              height={p.size * 1.3}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            >
              <polygon points="12,2 22,12 12,22 2,12" />
            </svg>
          ) : p.type === 'heart' ? (
            /* Ruby Heart */
            <svg
              width={p.size * 1.3}
              height={p.size * 1.3}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(244,63,94,0.85)]"
            >
              <path d="M 12 21.35 L 10.55 20.03 C 5.4 15.36 2 12.28 2 8.5 C 2 5.42 4.42 3 7.5 3 C 9.24 3 10.91 3.81 12 5.09 C 13.09 3.81 14.76 3 16.5 3 C 19.58 3 22 5.42 22 8.5 C 22 12.28 18.6 15.36 13.45 20.04 L 12 21.35 Z" />
            </svg>
          ) : p.type === 'petal' ? (
            /* Rose Petal */
            <svg
              width={p.size * 1.2}
              height={p.size * 1.2}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]"
            >
              <path d="M 12 2 C 7 5, 4 11, 7 17 C 9 21, 15 21, 17 17 C 20 11, 17 5, 12 2 Z" />
            </svg>
          ) : (
            /* Starlight Sparkle */
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(253,224,71,0.85)]"
            >
              <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
