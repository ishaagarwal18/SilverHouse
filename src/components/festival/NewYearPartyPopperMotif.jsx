import React, { useState } from 'react';
import { Sparkles, PartyPopper } from 'lucide-react';

/**
 * NewYearPartyPopperMotif - Exploding Festive Party Popper, Confetti & 2027 Balloons
 * Positioned on bottom-right corner during Happy New Year Festival Mode.
 * 
 * Features:
 * - Handcrafted vector artwork:
 *   Glitzy striped metallic party popper cone bursting with holographic ribbons,
 *   golden celebration star balloons, spiral streamers, and colorful confetti.
 * - White sticker outline filter matching the boutique illustration aesthetic.
 * - Interactive on CLICK:
 *   1. Explosive Party Popper "POP!" + energetic party whistle/horn fanfare (Web Audio API).
 *   2. Popper recoil & celebratory confetti burst animation.
 *   3. 50+ Holographic Streamers, Confetti Ribbons & Fireworks showering across the screen!
 *   4. Joyful "Happy New Year! 🎆" speech callout.
 */
export default function NewYearPartyPopperMotif({ onOpenModal }) {
  const [isPopping, setIsPopping] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Happy New Year! 🎆');
  const [showBubble, setShowBubble] = useState(false);

  const POPPER_WISHES = [
    '3, 2, 1... Happy New Year! 🎉',
    'Welcome Fresh Beginnings in Pure Silver Glamour! 💎',
    'May 2027 Shine Bright with Prosperity & Love! ✨',
    'Celebrate Every Milestone with Silver House! 🌟',
    'Shimmering Wishes for a Wonderful New Year! 🥂'
  ];

  // Synthesize explosive party popper "POP!" + joyful party horn celebration fanfare
  const playPopperAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Explosive Party Popper "POP!" (Sharp burst transient + bass thud)
      const bufferSize = ctx.sampleRate * 0.14;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const popFilter = ctx.createBiquadFilter();
      popFilter.type = 'lowpass';
      popFilter.frequency.setValueAtTime(1400, now);
      popFilter.frequency.exponentialRampToValueAtTime(320, now + 0.12);

      const popGain = ctx.createGain();
      popGain.gain.setValueAtTime(0.35, now);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      noise.connect(popFilter);
      popFilter.connect(popGain);
      popGain.connect(ctx.destination);
      noise.start(now);

      // Low frequency air displacement "thump"
      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.type = 'triangle';
      thud.frequency.setValueAtTime(160, now);
      thud.frequency.exponentialRampToValueAtTime(45, now + 0.12);
      thudGain.gain.setValueAtTime(0.32, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      thud.connect(thudGain);
      thudGain.connect(ctx.destination);
      thud.start(now);
      thud.stop(now + 0.15);

      // 2. Joyful Party Horn / Whistle Fanfare (Rising glissando fanfare: 587Hz -> 880Hz -> 1174Hz)
      const hornTimes = [
        { t: 0.05, f1: 587, f2: 880, dur: 0.18 },
        { t: 0.22, f1: 880, f2: 1174, dur: 0.35 }
      ];

      hornTimes.forEach(({ t: offset, f1, f2, dur }) => {
        const t = now + offset;
        const horn = ctx.createOscillator();
        const hornGain = ctx.createGain();

        horn.type = 'sawtooth';
        horn.frequency.setValueAtTime(f1, t);
        horn.frequency.exponentialRampToValueAtTime(f2, t + dur * 0.4);

        const hornFilter = ctx.createBiquadFilter();
        hornFilter.type = 'bandpass';
        hornFilter.frequency.setValueAtTime(f2, t);
        hornFilter.Q.setValueAtTime(2.5, t);

        hornGain.gain.setValueAtTime(0.001, t);
        hornGain.gain.linearRampToValueAtTime(0.16, t + 0.02);
        hornGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        horn.connect(hornFilter);
        hornFilter.connect(hornGain);
        hornGain.connect(ctx.destination);

        horn.start(t);
        horn.stop(t + dur + 0.02);
      });
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  };

  const handleClick = (e) => {
    setIsPopping(true);
    playPopperAudio();

    const randomGreeting = POPPER_WISHES[Math.floor(Math.random() * POPPER_WISHES.length)];
    setBubbleText(randomGreeting);
    setShowBubble(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width * 0.4;
    const originY = rect.top + rect.height * 0.35;

    // 50+ dynamic colorful confetti streamers & golden stars
    const newParticles = Array.from({ length: 50 }).map((_, i) => {
      // Angle: Upwards and fanning across into the screen (-155 to -30 degrees)
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
        size: Math.random() * 14 + 8,
        color: ['#EC4899', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#FDE047', '#FFFFFF'][i % 8],
        duration: 1.3 + Math.random() * 0.9,
        delay: Math.random() * 0.28,
        type: i % 4 === 0 ? 'ribbon' : i % 4 === 1 ? 'star' : i % 4 === 2 ? 'circle' : 'diamond'
      };
    });

    setParticles(newParticles);

    setTimeout(() => {
      setIsPopping(false);
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
        @keyframes popperRecoilJump {
          0% { transform: scale(1) translateY(0) rotate(0deg); }
          20% { transform: scale(1.15, 0.85) translateY(8px) rotate(-4deg); }
          40% { transform: scale(0.92, 1.18) translateY(-16px) rotate(5deg); }
          65% { transform: scale(1.06, 0.95) translateY(-4px) rotate(-2deg); }
          85% { transform: scale(0.98, 1.02) translateY(0) rotate(0deg); }
          100% { transform: scale(1) translateY(0) rotate(0deg); }
        }

        @keyframes confettiSpiralFly {
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
            transform: translate(var(--tx), var(--ty)) scale(1.05) rotate(240deg);
          }
          100% {
            opacity: 0;
            transform: translate(calc(var(--tx) * 1.08), calc(var(--ty) + 65px)) scale(0.2) rotate(360deg);
          }
        }

        .animate-popper-recoil {
          animation: popperRecoilJump 0.85s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      {/* Main Interactive Button */}
      <button
        type="button"
        onClick={handleClick}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-transform duration-300 ${
          isPopping ? 'animate-popper-recoil' : 'group-hover:scale-105 active:scale-95'
        }`}
        title="Party Popper & Balloons • Click to Pop Confetti & Celebrate 2027!"
        aria-label="New Year Party Popper"
      >
        <div className="relative flex flex-col items-center">
          {/* Ambient Warm Multi-Colored Glow Behind Popper */}
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 pointer-events-none ${
              isPopping
                ? 'w-48 h-48 bg-gradient-to-r from-pink-500/50 via-yellow-400/60 to-purple-500/50 blur-2xl scale-125'
                : 'w-24 h-24 rounded-full bg-pink-500/20 blur-xl'
            }`}
          />

          {/* SVG Illustration: Illustrated Party Popper & Confetti */}
          <svg
            className="w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 drop-shadow-2xl overflow-visible"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White Sticker Outline Filter */}
            <defs>
              <filter id="popperStickerOutline" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="1" />
                <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="#FFFFFF" floodOpacity="0.85" />
              </filter>

              {/* Popper Cone Gold Gradient */}
              <linearGradient id="popperGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9C4" />
                <stop offset="35%" stopColor="#FFD54F" />
                <stop offset="70%" stopColor="#FFA000" />
                <stop offset="100%" stopColor="#E65100" />
              </linearGradient>

              {/* Holographic Purple/Pink Gradient */}
              <linearGradient id="popperPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="50%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#BE185D" />
              </linearGradient>

              {/* Balloon Shiny Gold Gradient */}
              <linearGradient id="balloonGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="40%" stopColor="#FACC15" />
                <stop offset="80%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#A16207" />
              </linearGradient>
            </defs>

            {/* Main Popper Artwork with Sticker Outline */}
            <g filter="url(#popperStickerOutline)">
              {/* ======================================================== */}
              {/* 1. FLOATING GOLDEN 2027 CELEBRATION STAR BALLOON         */}
              {/* ======================================================== */}
              <g transform="translate(135, 60)">
                {/* 5-pointed Foil Star Balloon */}
                <polygon
                  points="18,0 23,12 36,13 26,22 29,35 18,28 7,35 10,22 0,13 13,12"
                  fill="url(#balloonGoldGrad)"
                  stroke="#3E160D"
                  strokeWidth="1.2"
                />
                {/* Balloon Highlight */}
                <path d="M 14 6 Q 20 8 22 14" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                {/* Curled Balloon String */}
                <path d="M 18 36 Q 22 48 16 58 Q 20 68 18 80" fill="none" stroke="#FDE047" strokeWidth="1.2" strokeLinecap="round" />
              </g>

              {/* ======================================================== */}
              {/* 2. THE EXPLODING PARTY POPPER CONE                       */}
              {/* ======================================================== */}
              <g transform="translate(75, 130) rotate(-35)">
                {/* Main Cone Body (Tilted Upward-Left) */}
                <polygon
                  points="20,10 55,10 38,95"
                  fill="url(#popperPinkGrad)"
                  stroke="#3E160D"
                  strokeWidth="1.6"
                />

                {/* Striped Gold Metallic Bands on Cone */}
                <polygon points="25,28 50,28 46,45 29,45" fill="url(#popperGoldGrad)" />
                <polygon points="32,60 43,60 41,75 34,75" fill="url(#popperGoldGrad)" />

                {/* Scalloped Top Rim of Popper Cone */}
                <ellipse cx="37" cy="10" rx="18" ry="7" fill="#0284C7" stroke="#3E160D" strokeWidth="1.2" />

                {/* Pull String & Golden Ring at Bottom Tip */}
                <line x1="38" y1="95" x2="38" y2="114" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
                <circle cx="38" cy="116" r="3.5" fill="#FACC15" stroke="#3E160D" strokeWidth="0.8" />
              </g>

              {/* ======================================================== */}
              {/* 3. BURSTING CONFETTI, SPIRALS & FESTIVE STREAMERS        */}
              {/* ======================================================== */}
              {/* Spiral Ribbon Streamer 1 (Pink) */}
              <path
                d="M 65 105 Q 45 80 55 60 Q 65 40 45 25"
                fill="none"
                stroke="#EC4899"
                strokeWidth="3.2"
                strokeLinecap="round"
              />

              {/* Spiral Ribbon Streamer 2 (Gold) */}
              <path
                d="M 85 95 Q 95 65 80 45 Q 65 25 85 10"
                fill="none"
                stroke="#FACC15"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Spiral Ribbon Streamer 3 (Cyan/Blue) */}
              <path
                d="M 98 108 Q 120 85 110 65 Q 100 45 120 30"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Floating Confetti Squares & Dots */}
              <rect x="52" y="74" width="7" height="7" rx="1.5" fill="#10B981" transform="rotate(25 52 74)" />
              <rect x="76" y="52" width="6.5" height="6.5" rx="1.5" fill="#8B5CF6" transform="rotate(-35 76 52)" />
              <rect x="108" y="78" width="7" height="7" rx="1.5" fill="#EF4444" transform="rotate(15 108 78)" />
              <rect x="92" y="28" width="6" height="6" rx="1.5" fill="#F59E0B" transform="rotate(45 92 28)" />
              <circle cx="42" cy="54" r="3.5" fill="#F43F5E" />
              <circle cx="70" cy="35" r="3" fill="#FBBF24" />
              <circle cx="118" cy="48" r="3.2" fill="#3B82F6" />
              <circle cx="104" cy="18" r="3.5" fill="#EC4899" />

              {/* Flash Star Explosion from the Mouth of the Popper */}
              <g transform="translate(68, 98)">
                <polygon points="0,-14 3,-4 14,0 3,4 0,14 -3,4 -14,0 -3,-4" fill="#FFFFFF" className="animate-ping" />
                <circle cx="0" cy="0" r="3.2" fill="#FDE047" />
              </g>

              {/* Sparkle Glints */}
              <polygon points="168,106 170,110 174,111 171,114 172,118 168,116 164,118 165,114 162,111 166,110" fill="#FDE047" stroke="#3E160D" strokeWidth="0.5" className="animate-pulse" />
              <circle cx="34" cy="116" r="2.2" fill="#FFFFFF" className="animate-ping" />
            </g>
          </svg>

          {/* Festive Badge Tag Underneath Popper */}
          <div className="mt-1 flex items-center space-x-1.5 bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full shadow-md border border-pink-300/80 tracking-wider uppercase group-hover:scale-105 transition-transform">
            <PartyPopper className="w-3 h-3 text-yellow-200 animate-bounce" />
            <span>Party Popper</span>
          </div>
        </div>
      </button>

      {/* Floating Festive Speech Callout on Click */}
      {showBubble && (
        <div className="absolute -top-12 right-2 sm:right-4 z-50 whitespace-nowrap bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-pink-700 dark:text-pink-300 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-2xl border-2 border-pink-400 animate-in fade-in zoom-in-75 duration-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-pink-500 animate-bounce shrink-0" />
          <span>{bubbleText}</span>
          <div className="absolute right-8 -bottom-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-pink-400 rotate-45" />
        </div>
      )}

      {/* DYNAMIC CONFETTI, RIBBONS & FESTIVE SHOWER */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `confettiSpiralFly ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
            pointerEvents: 'none',
            zIndex: 99999
          }}
          className="will-change-transform"
        >
          {p.type === 'ribbon' ? (
            /* Wavy Confetti Ribbon Strip */
            <svg
              width={p.size * 1.4}
              height={p.size * 1.4}
              viewBox="0 0 24 24"
              fill="none"
              stroke={p.color}
              strokeWidth="3.5"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]"
            >
              <path d="M 4 4 Q 14 12 10 20 Q 20 16 18 4" />
            </svg>
          ) : p.type === 'star' ? (
            /* Golden Holiday Star */
            <svg
              width={p.size * 1.2}
              height={p.size * 1.2}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(253,224,71,0.85)]"
            >
              <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
            </svg>
          ) : p.type === 'circle' ? (
            /* Shimmering Confetti Disc */
            <div
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 10px ${p.color}, 0 0 18px ${p.color}`
              }}
              className="rounded-full"
            />
          ) : (
            /* Confetti Diamond Foil */
            <div
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 8px ${p.color}`
              }}
              className="rotate-45 rounded-sm"
            />
          )}
        </div>
      ))}
    </div>
  );
}
