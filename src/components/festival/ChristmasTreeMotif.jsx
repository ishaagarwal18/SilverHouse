import React, { useState } from 'react';
import { Sparkles, TreePine, Gift } from 'lucide-react';

/**
 * ChristmasTreeMotif - Ornate Decorated Christmas Pine Tree with Star & Holiday Gifts
 * Positioned on bottom-left corner during Christmas & New Year Festival Mode.
 * 
 * Features:
 * - Illustrated evergreen fir tree with snow-kissed boughs, festive baubles, candy canes,
 *   golden garland tinsel, and radiant golden Star of Bethlehem.
 * - Decorative wrapped holiday gift boxes nestled under the tree.
 * - White sticker outline filter matching the boutique illustration aesthetic.
 * - Interactive on CLICK:
 *   1. Sleigh Bells / Glockenspiel "Jingle Bells" chime via Web Audio API.
 *   2. Tree lights burst into sparkling twinkle animation.
 *   3. 50+ Festive Snowflakes & Golden Stars erupt and swirl across the screen!
 *   4. Cheerful Holiday Greeting speech callout.
 */
export default function ChristmasTreeMotif({ onOpenModal }) {
  const [isTwinkling, setIsTwinkling] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Merry Christmas! 🎄');
  const [showBubble, setShowBubble] = useState(false);

  const HOLIDAY_WISHES = [
    'Merry Christmas & Joy! 🎄',
    'May Your Holidays Sparkle in Silver! ✨',
    'Peace, Love & Joy to All! 🌟',
    'Season\'s Warmest Greetings! 🎁',
    'Magic of Christmas & New Year! ❄️'
  ];

  // Synthesize cheerful Jingle Bells / Glockenspiel chime via Web Audio API
  const playJingleChimeAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Jingle Bell notes: E5, E5, E5 (330Hz base octave -> 659.25Hz)
      const melody = [
        { note: 659.25, time: 0.00, dur: 0.16 }, // Jingle
        { note: 659.25, time: 0.18, dur: 0.16 }, // bells
        { note: 659.25, time: 0.36, dur: 0.32 }, // jingle
        { note: 659.25, time: 0.72, dur: 0.16 }, // all
        { note: 783.99, time: 0.90, dur: 0.18 }, // the
        { note: 523.25, time: 1.10, dur: 0.22 }, // way
        { note: 587.33, time: 1.34, dur: 0.20 },
        { note: 659.25, time: 1.56, dur: 0.45 }
      ];

      melody.forEach(({ note, time, dur }) => {
        const t = now + time;

        // Metallic bell strike
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, t);

        // Overtone for bell sparkle
        const overtone = ctx.createOscillator();
        const otGain = ctx.createGain();
        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(note * 2.76, t);

        const peak = 0.22;
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(peak, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        otGain.gain.setValueAtTime(0.001, t);
        otGain.gain.linearRampToValueAtTime(peak * 0.4, t + 0.005);
        otGain.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);
        overtone.connect(otGain);
        otGain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + dur + 0.05);
        overtone.start(t);
        overtone.stop(t + dur + 0.05);
      });

      // Shimmering Sleigh Jingle Shake (light high-frequency noise bursts)
      [0.05, 0.22, 0.40, 0.75, 1.12].forEach((offset) => {
        const t = now + offset;
        const bSize = ctx.sampleRate * 0.08;
        const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < bSize; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
        const src = ctx.createBufferSource();
        src.buffer = b;

        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(4500, t);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

        src.connect(hp);
        hp.connect(g);
        g.connect(ctx.destination);
        src.start(t);
      });
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  };

  const handleTreeClick = (e) => {
    setIsTwinkling(true);
    playJingleChimeAudio();

    const randomGreeting = HOLIDAY_WISHES[Math.floor(Math.random() * HOLIDAY_WISHES.length)];
    setBubbleText(randomGreeting);
    setShowBubble(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width * 0.5;
    const originY = rect.top + rect.height * 0.35;

    // 50+ dynamic snowflakes & golden holiday stars
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
        color: ['#FFFFFF', '#E0F2FE', '#BAE6FD', '#FFD54F', '#FDE047', '#FF1744', '#4ADE80'][i % 7],
        duration: 1.4 + Math.random() * 0.9,
        delay: Math.random() * 0.25,
        type: i % 3 === 0 ? 'snowflake' : i % 3 === 1 ? 'star' : 'bauble'
      };
    });

    setParticles(newParticles);

    setTimeout(() => {
      setIsTwinkling(false);
    }, 1200);

    setTimeout(() => {
      setParticles([]);
    }, 2500);

    setTimeout(() => {
      setShowBubble(false);
    }, 3200);
  };

  return (
    <div className="fixed bottom-2 sm:bottom-4 left-1 sm:left-4 z-[38] pointer-events-auto select-none group">
      {/* Keyframe Animations */}
      <style>{`
        @keyframes treeTwinkleBounce {
          0% { transform: scale(1) translateY(0); }
          25% { transform: scale(1.08, 0.94) translateY(4px); }
          50% { transform: scale(0.96, 1.12) translateY(-10px); }
          75% { transform: scale(1.04, 0.97) translateY(-3px); }
          100% { transform: scale(1) translateY(0); }
        }

        @keyframes starStarGlitz {
          0%, 100% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 6px #FDE047); }
          50% { transform: rotate(180deg) scale(1.2); filter: drop-shadow(0 0 16px #FEF08A) drop-shadow(0 0 24px #F59E0B); }
        }

        @keyframes snowflakeFlutter {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.2) rotate(0deg);
          }
          15% {
            opacity: 1;
            transform: translate(calc(var(--tx) * 0.3), calc(var(--ty) * 0.5)) scale(1.3) rotate(70deg);
          }
          65% {
            opacity: 0.95;
            transform: translate(var(--tx), var(--ty)) scale(1.05) rotate(220deg);
          }
          100% {
            opacity: 0;
            transform: translate(calc(var(--tx) * 1.05), calc(var(--ty) + 60px)) scale(0.2) rotate(360deg);
          }
        }

        .animate-tree-bounce {
          animation: treeTwinkleBounce 0.85s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-tree-star {
          animation: starStarGlitz 3s ease-in-out infinite;
          transform-origin: 100px 30px;
        }
      `}</style>

      {/* Main Interactive Button */}
      <button
        type="button"
        onClick={handleTreeClick}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-transform duration-300 ${
          isTwinkling ? 'animate-tree-bounce' : 'group-hover:scale-105 active:scale-95'
        }`}
        title="Christmas Pine Tree • Click to Twinkle Lights & Jingle Bells!"
        aria-label="Christmas Tree"
      >
        <div className="relative flex flex-col items-center">
          {/* Ambient Frosted Glow Behind Tree */}
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 pointer-events-none ${
              isTwinkling
                ? 'w-48 h-48 bg-gradient-to-r from-emerald-400/40 via-yellow-300/50 to-sky-400/40 blur-2xl scale-125'
                : 'w-24 h-24 rounded-full bg-emerald-400/20 blur-xl'
            }`}
          />

          {/* SVG Illustration: Illustrated Christmas Fir Tree */}
          <svg
            className="w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 drop-shadow-2xl overflow-visible"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White Sticker Outline Filter */}
            <defs>
              <filter id="treeStickerOutline" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="1" />
                <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="#FFFFFF" floodOpacity="0.85" />
              </filter>

              {/* Tree Gradient (Forest to Fresh Pine) */}
              <linearGradient id="pineTreeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2E7D32" />
                <stop offset="50%" stopColor="#1B5E20" />
                <stop offset="100%" stopColor="#0E3D12" />
              </linearGradient>

              {/* Golden Star Gradient */}
              <linearGradient id="starGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9C4" />
                <stop offset="30%" stopColor="#FFD54F" />
                <stop offset="70%" stopColor="#FFB300" />
                <stop offset="100%" stopColor="#FF8F00" />
              </linearGradient>

              {/* Gift Box Red Gradient */}
              <linearGradient id="giftRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#B91C1C" />
              </linearGradient>

              {/* Gift Box Gold / Silver Gradient */}
              <linearGradient id="giftGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>
            </defs>

            {/* Main Tree Artwork with Sticker Outline */}
            <g filter="url(#treeStickerOutline)">
              {/* Wooden Trunk */}
              <rect
                x="90"
                y="190"
                width="20"
                height="22"
                rx="3"
                fill="#5D4037"
                stroke="#271813"
                strokeWidth="1.2"
              />

              {/* Wrapped Holiday Gift Boxes Under the Tree */}
              {/* Left Red Gift Box */}
              <rect
                x="56"
                y="196"
                width="28"
                height="24"
                rx="2"
                fill="url(#giftRedGrad)"
                stroke="#271813"
                strokeWidth="1"
              />
              <rect x="68" y="196" width="4" height="24" fill="#FDE047" />
              <rect x="56" y="206" width="28" height="4" fill="#FDE047" />
              {/* Gift Bow */}
              <circle cx="70" cy="195" r="3.5" fill="#FDE047" stroke="#271813" strokeWidth="0.8" />

              {/* Right Gold Gift Box */}
              <rect
                x="116"
                y="194"
                width="26"
                height="26"
                rx="2"
                fill="url(#giftGoldGrad)"
                stroke="#271813"
                strokeWidth="1"
              />
              <rect x="127" y="194" width="4" height="26" fill="#EF4444" />
              <rect x="116" y="205" width="26" height="4" fill="#EF4444" />
              {/* Gift Bow */}
              <circle cx="129" cy="193" r="3.5" fill="#EF4444" stroke="#271813" strokeWidth="0.8" />

              {/* Small Silver Gift Box in Center */}
              <rect
                x="88"
                y="204"
                width="22"
                height="18"
                rx="2"
                fill="#E2E8F0"
                stroke="#271813"
                strokeWidth="0.9"
              />
              <rect x="97" y="204" width="3.5" height="18" fill="#3B82F6" />
              <rect x="88" y="211" width="22" height="3.5" fill="#3B82F6" />

              {/* 3 Tier Pine Boughs */}
              {/* Tier 1 (Bottom Tier) */}
              <path
                d="M 100 135 L 140 162 L 158 190 C 145 186, 135 192, 122 186 C 112 192, 100 188, 88 192 C 75 186, 65 192, 42 190 L 60 162 Z"
                fill="url(#pineTreeGrad)"
                stroke="#1B4D20"
                strokeWidth="1.5"
              />
              {/* Frosted Snow Tips on Tier 1 */}
              <path
                d="M 44 188 Q 54 180 64 188 Q 76 180 88 188 Q 100 180 112 188 Q 124 180 136 188 Q 146 180 156 188"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3.2"
                strokeLinecap="round"
              />

              {/* Tier 2 (Middle Tier) */}
              <path
                d="M 100 85 L 132 118 L 146 142 C 135 138, 124 144, 114 138 C 102 144, 92 140, 84 144 C 74 138, 64 144, 54 142 L 68 118 Z"
                fill="url(#pineTreeGrad)"
                stroke="#1B4D20"
                strokeWidth="1.5"
              />
              {/* Frosted Snow Tips on Tier 2 */}
              <path
                d="M 56 140 Q 68 132 80 140 Q 94 132 108 140 Q 120 132 134 140 Q 142 134 144 140"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Tier 3 (Top Tier) */}
              <path
                d="M 100 36 L 124 72 L 134 94 C 124 90, 115 95, 106 91 C 98 95, 90 92, 82 95 C 74 91, 66 94, 66 94 L 76 72 Z"
                fill="url(#pineTreeGrad)"
                stroke="#1B4D20"
                strokeWidth="1.5"
              />
              {/* Frosted Snow Tips on Tier 3 */}
              <path
                d="M 68 92 Q 80 85 92 92 Q 104 85 116 92 Q 126 86 132 92"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Golden Garland Tinsel Swags */}
              <path
                d="M 82 72 Q 100 86 118 76"
                fill="none"
                stroke="#FFD54F"
                strokeWidth="2.2"
                strokeDasharray="3 2"
              />
              <path
                d="M 72 118 Q 100 138 128 122"
                fill="none"
                stroke="#FFD54F"
                strokeWidth="2.2"
                strokeDasharray="3 2"
              />
              <path
                d="M 60 162 Q 100 186 140 166"
                fill="none"
                stroke="#FFD54F"
                strokeWidth="2.5"
                strokeDasharray="3 2"
              />

              {/* Hanging Striped Candy Cane */}
              <g transform="translate(74, 110) scale(0.65)">
                <path
                  d="M 10 30 L 10 12 C 10 5, 22 5, 22 12"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M 10 30 L 10 12 C 10 5, 22 5, 22 12"
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="5"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
              </g>

              {/* Colorful Christmas Baubles (Red, Gold, Blue, Silver) */}
              <circle cx="86" cy="80" r="3.5" fill="#EF4444" stroke="#7F1D1D" strokeWidth="0.6" className="animate-pulse" />
              <circle cx="114" cy="84" r="3.5" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="0.6" />
              <circle cx="76" cy="126" r="4" fill="#EAB308" stroke="#713F12" strokeWidth="0.6" />
              <circle cx="98" cy="130" r="4.2" fill="#EF4444" stroke="#7F1D1D" strokeWidth="0.6" className="animate-pulse" />
              <circle cx="122" cy="128" r="4" fill="#E2E8F0" stroke="#475569" strokeWidth="0.6" />
              <circle cx="68" cy="172" r="4.5" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="0.6" />
              <circle cx="92" cy="175" r="4.5" fill="#F59E0B" stroke="#78350F" strokeWidth="0.6" />
              <circle cx="116" cy="174" r="4.5" fill="#EF4444" stroke="#7F1D1D" strokeWidth="0.6" className="animate-pulse" />
              <circle cx="138" cy="170" r="4" fill="#A855F7" stroke="#581C87" strokeWidth="0.6" />

              {/* Radiant Star of Bethlehem on Top */}
              <g className="animate-tree-star">
                <polygon
                  points="100,14 104,26 116,28 107,37 110,49 100,42 90,49 93,37 84,28 96,26"
                  fill="url(#starGoldGrad)"
                  stroke="#B45309"
                  strokeWidth="1.2"
                />
                <circle cx="100" cy="32" r="3.5" fill="#FFFFFF" />
              </g>

              {/* Floating Snowflakes around Tree */}
              <circle cx="42" cy="65" r="2" fill="#FFFFFF" className="animate-ping" />
              <circle cx="158" cy="75" r="2.2" fill="#FFFFFF" />
              <circle cx="36" cy="125" r="2" fill="#FFFFFF" />
              <circle cx="164" cy="135" r="2.2" fill="#FFFFFF" className="animate-ping" />
            </g>
          </svg>

          {/* Festive Badge Tag Underneath Tree */}
          <div className="mt-1 flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 text-white text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full shadow-md border border-emerald-300/80 tracking-wider uppercase group-hover:scale-105 transition-transform">
            <TreePine className="w-3 h-3 text-emerald-200 animate-pulse fill-emerald-200" />
            <span>Holiday Tree</span>
          </div>
        </div>
      </button>

      {/* Floating Festive Speech Callout on Click */}
      {showBubble && (
        <div className="absolute -top-12 left-2 sm:left-4 z-50 whitespace-nowrap bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-emerald-800 dark:text-emerald-300 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-2xl border-2 border-emerald-400 animate-in fade-in zoom-in-75 duration-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-500 animate-bounce shrink-0" />
          <span>{bubbleText}</span>
          <div className="absolute left-8 -bottom-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-emerald-400 rotate-45" />
        </div>
      )}

      {/* DYNAMIC SNOWFLAKES & STARS SHOWER */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `snowflakeFlutter ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
            pointerEvents: 'none',
            zIndex: 99999
          }}
          className="will-change-transform"
        >
          {p.type === 'snowflake' ? (
            /* Detailed 6-point Snowflake SVG */
            <svg
              width={p.size * 1.2}
              height={p.size * 1.2}
              viewBox="0 0 24 24"
              fill="none"
              stroke={p.color}
              strokeWidth="1.8"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            >
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="3.34" y1="7" x2="20.66" y2="17" />
              <line x1="3.34" y1="17" x2="20.66" y2="7" />
              {/* Branchlets */}
              <line x1="12" y1="5" x2="9" y2="8" />
              <line x1="12" y1="5" x2="15" y2="8" />
              <line x1="12" y1="19" x2="9" y2="16" />
              <line x1="12" y1="19" x2="15" y2="16" />
            </svg>
          ) : p.type === 'star' ? (
            /* Golden Holiday Star */
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(255,215,0,0.85)]"
            >
              <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
            </svg>
          ) : (
            /* Glowing Bauble Dot */
            <div
              style={{
                width: `${p.size * 0.85}px`,
                height: `${p.size * 0.85}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 10px ${p.color}, 0 0 18px ${p.color}`
              }}
              className="rounded-full"
            />
          )}
        </div>
      ))}
    </div>
  );
}
