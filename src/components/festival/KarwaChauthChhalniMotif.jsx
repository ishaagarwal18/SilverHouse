import React, { useState } from 'react';
import { Sparkles, Moon, Heart } from 'lucide-react';

/**
 * KarwaChauthChhalniMotif - Sacred Sieve (Chhalni), Akhand Diya & Radiant Moon
 * Positioned on bottom-left corner during Karwa Chauth Festival Mode.
 * 
 * Features:
 * - Handcrafted illustrated vector of the Karwa Chauth Sieve (Chhalni):
 *   Ornate silver & brass filigree ring with fine mesh lattice, glowing diya lamp,
 *   auspicious red rose petals, and a radiant golden crescent moon (Chanda Mama).
 * - White sticker outline filter matching the boutique illustration aesthetic.
 * - Interactive on CLICK:
 *   1. Auspicious Shehnai melodic flute note + tinkling glass chooda bangles chime (Web Audio API).
 *   2. Chhalni sways & moon radiates golden moonbeams.
 *   3. 50+ Radiant Crescent Moons, Crimson Rose Petals & Golden Stars erupt across the screen!
 *   4. Auspicious Saubhagya Blessing speech callout.
 */
export default function KarwaChauthChhalniMotif({ onOpenModal }) {
  const [isBlessing, setIsBlessing] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Shubh Karwa Chauth! 🌙');
  const [showBubble, setShowBubble] = useState(false);

  const KARWA_BLESSINGS = [
    'Shubh Karwa Chauth! Sada Saubhagyavati Bhava! 🌙',
    'May Your Bond of Love Be as Eternal as the Moon! 💖',
    'Akhand Saubhagya, Long Life & Prosperity! ✨',
    'Moonrise Blessings & Sweet Togetherness! 🌟',
    'Cherished Love & Pure Silver Keepsakes! 🪔'
  ];

  // Synthesize auspicious Shehnai / Bansuri melodic notes + tinkling glass bangles chime
  const playKarwaChauthAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Auspicious Shehnai / Bansuri Sweet Melody (Raag Desh / Kalyani scale notes)
      // Notes: D5 (587.33), F#5 (739.99), A5 (880), B5 (987.77), high D6 (1174.66)
      const fluteNotes = [
        { f: 587.33, t: 0.05, d: 0.28 },
        { f: 739.99, t: 0.28, d: 0.24 },
        { f: 880.00, t: 0.48, d: 0.32 },
        { f: 1174.66, t: 0.74, d: 0.65 }
      ];

      fluteNotes.forEach(({ f, t: startTime, d: duration }) => {
        const t = now + startTime;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        // Warm reed/flute harmonics
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        // Subtle Indian classical meend (portamento pitch glide)
        osc.frequency.exponentialRampToValueAtTime(f * 1.02, t + duration * 0.5);
        osc.frequency.exponentialRampToValueAtTime(f, t + duration);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(f * 3.2, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.20, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + duration + 0.05);
      });

      // 2. Tinkling Glass Chooda / Payal Bangles Shimmer
      [0.08, 0.22, 0.38, 0.56, 0.75, 0.95].forEach((offset, idx) => {
        const t = now + offset;
        const chime = ctx.createOscillator();
        const chimeGain = ctx.createGain();

        chime.type = 'sine';
        chime.frequency.setValueAtTime(2400 + (idx % 3) * 350, t);

        chimeGain.gain.setValueAtTime(0.09, t);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        chime.connect(chimeGain);
        chimeGain.connect(ctx.destination);

        chime.start(t);
        chime.stop(t + 0.14);
      });
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  };

  const handleClick = (e) => {
    setIsBlessing(true);
    playKarwaChauthAudio();

    const randomGreeting = KARWA_BLESSINGS[Math.floor(Math.random() * KARWA_BLESSINGS.length)];
    setBubbleText(randomGreeting);
    setShowBubble(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width * 0.5;
    const originY = rect.top + rect.height * 0.35;

    // 50+ dynamic romantic & auspicious particles: Crescent Moons, Rose Petals, Golden Stars
    const newParticles = Array.from({ length: 48 }).map((_, i) => {
      const angleDeg = -140 + Math.random() * 125;
      const angleRad = (angleDeg * Math.PI) / 180;
      const distance = 140 + Math.random() * 350;
      const tx = Math.cos(angleRad) * distance;
      const ty = Math.sin(angleRad) * distance;

      return {
        id: Date.now() + Math.random(),
        startX: originX,
        startY: originY,
        tx,
        ty,
        size: Math.random() * 14 + 7,
        color: ['#FDE047', '#FFD54F', '#F43F5E', '#E11D48', '#BE123C', '#FFF9C4', '#F472B6'][i % 7],
        duration: 1.4 + Math.random() * 0.85,
        delay: Math.random() * 0.25,
        type: i % 3 === 0 ? 'moon' : i % 3 === 1 ? 'rosePetal' : 'star'
      };
    });

    setParticles(newParticles);

    setTimeout(() => {
      setIsBlessing(false);
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
        @keyframes chhalniGentleSway {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(1deg); }
        }

        @keyframes chhalniBlessPulse {
          0% { transform: scale(1) translateY(0); }
          25% { transform: scale(1.1, 0.94) translateY(4px); }
          50% { transform: scale(0.96, 1.12) translateY(-10px) rotate(-2deg); }
          75% { transform: scale(1.04, 0.97) translateY(-3px) rotate(1deg); }
          100% { transform: scale(1) translateY(0); }
        }

        @keyframes moonRadianceGlow {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(254, 240, 138, 0.8));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(253, 224, 71, 1)) drop-shadow(0 0 32px rgba(251, 191, 36, 0.7));
          }
        }

        @keyframes karwaPetalFlutter {
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

        .animate-chhalni-idle {
          animation: chhalniGentleSway 3.2s ease-in-out infinite;
        }

        .animate-chhalni-bless {
          animation: chhalniBlessPulse 0.85s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-moon-glow {
          animation: moonRadianceGlow 3s ease-in-out infinite;
        }
      `}</style>

      {/* Main Interactive Button */}
      <button
        type="button"
        onClick={handleClick}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-transform duration-300 ${
          isBlessing ? 'animate-chhalni-bless' : 'group-hover:scale-105 active:scale-95'
        }`}
        title="Karwa Chauth Chhalni & Moon • Click for Moonrise Blessings!"
        aria-label="Karwa Chauth Sieve and Moon"
      >
        <div className="relative flex flex-col items-center">
          {/* Ambient Moonlight Halo Behind Motif */}
          <div
            className={`absolute top-2 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 pointer-events-none ${
              isBlessing
                ? 'w-48 h-48 bg-gradient-to-r from-amber-300/60 via-rose-400/50 to-yellow-300/60 blur-2xl scale-125'
                : 'w-24 h-24 rounded-full bg-amber-300/25 blur-xl'
            }`}
          />

          {/* SVG Illustration: Illustrated Karwa Chauth Sieve, Moon & Diya */}
          <svg
            className="w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 drop-shadow-2xl overflow-visible animate-chhalni-idle"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White Sticker Outline Filter */}
            <defs>
              <filter id="chhalniStickerOutline" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="1" />
                <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="#FFFFFF" floodOpacity="0.85" />
              </filter>

              {/* Radiant Moon Gradient */}
              <linearGradient id="chandraGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFDE7" />
                <stop offset="35%" stopColor="#FFF59D" />
                <stop offset="70%" stopColor="#FDD835" />
                <stop offset="100%" stopColor="#F57F17" />
              </linearGradient>

              {/* Silver Chhalni Rim Gradient */}
              <linearGradient id="chhalniSilverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#E2E8F0" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>

              {/* Diya Flame Gradient */}
              <radialGradient id="karwaFlameGrad" cx="50%" cy="75%" r="70%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="25%" stopColor="#FFF9C4" />
                <stop offset="60%" stopColor="#FFB300" />
                <stop offset="100%" stopColor="#D50000" />
              </radialGradient>
            </defs>

            {/* Main Artwork with Sticker Outline */}
            <g filter="url(#chhalniStickerOutline)">
              {/* ======================================================== */}
              {/* 1. RADIANT CRESCENT MOON (CHANDA MAMA) IN BACKGROUND     */}
              {/* ======================================================== */}
              <g className="animate-moon-glow">
                {/* Crescent Moon Path */}
                <path
                  d="M 126 36 C 96 42, 82 72, 94 102 C 104 126, 134 136, 154 124 C 118 136, 92 108, 98 76 C 102 54, 114 42, 126 36 Z"
                  fill="url(#chandraGoldGrad)"
                  stroke="#3E160D"
                  strokeWidth="1.4"
                />
                {/* Moon Divine Face Smile (Traditional Folk Art) */}
                <path d="M 106 82 Q 109 88 114 84" fill="none" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" />
                {/* Tilak on Moon */}
                <circle cx="106" cy="70" r="1.5" fill="#DC2626" />
              </g>

              {/* Twinkling Evening Stars Around the Moon */}
              <polygon points="164,44 167,50 174,52 168,56 170,62 164,58 158,62 160,56 154,52 161,50" fill="#FDE047" stroke="#3E160D" strokeWidth="0.6" className="animate-pulse" />
              <polygon points="46,58 48,62 54,64 49,67 51,72 46,69 41,72 43,67 38,64 44,62" fill="#FDE047" stroke="#3E160D" strokeWidth="0.6" />
              <circle cx="68" cy="40" r="1.8" fill="#FFF9C4" className="animate-ping" />
              <circle cx="168" cy="88" r="1.8" fill="#FFF9C4" />

              {/* ======================================================== */}
              {/* 2. SACRED CHHALNI (DECORATED SIEVE)                      */}
              {/* ======================================================== */}
              {/* Outer Circular Rim of the Sieve */}
              <circle
                cx="92"
                cy="142"
                r="56"
                fill="#FFFBEB"
                fillOpacity="0.85"
                stroke="#3E160D"
                strokeWidth="2.2"
              />

              {/* Silver Filigree Outer Band */}
              <circle
                cx="92"
                cy="142"
                r="52"
                fill="none"
                stroke="url(#chhalniSilverGrad)"
                strokeWidth="4"
              />

              {/* Red Kumkum Decorative Border Band */}
              <circle
                cx="92"
                cy="142"
                r="48"
                fill="none"
                stroke="#DC2626"
                strokeWidth="2.5"
              />

              {/* Sieve Mesh Lattice Grid (Chhalni ki Jaali) */}
              <g opacity="0.45" stroke="#94A3B8" strokeWidth="0.8">
                {[-36, -24, -12, 0, 12, 24, 36].map((offset) => (
                  <React.Fragment key={`grid-${offset}`}>
                    <line x1={92 + offset} y1={142 - Math.sqrt(Math.max(0, 48 * 48 - offset * offset))} x2={92 + offset} y2={142 + Math.sqrt(Math.max(0, 48 * 48 - offset * offset))} />
                    <line x1={92 - Math.sqrt(Math.max(0, 48 * 48 - offset * offset))} y1={142 + offset} x2={92 + Math.sqrt(Math.max(0, 48 * 48 - offset * offset))} y2={142 + offset} />
                  </React.Fragment>
                ))}
              </g>

              {/* Golden Pearl Moti Studded Around the Rim */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                const cx = 92 + Math.cos(rad) * 52;
                const cy = 142 + Math.sin(rad) * 52;
                return (
                  <circle
                    key={`pearl-${i}`}
                    cx={cx}
                    cy={cy}
                    r="2.2"
                    fill={i % 2 === 0 ? '#FDE047' : '#FFFFFF'}
                    stroke="#3E160D"
                    strokeWidth="0.5"
                  />
                );
              })}

              {/* Hanging Red Gota-Patti & Pearl Tassels */}
              <path d="M 68 194 L 62 216 M 92 198 L 92 222 M 116 194 L 122 216" stroke="#DC2626" strokeWidth="1.8" />
              <circle cx="62" cy="216" r="3" fill="#FDE047" stroke="#3E160D" strokeWidth="0.6" />
              <circle cx="92" cy="222" r="3.5" fill="#FDE047" stroke="#3E160D" strokeWidth="0.6" />
              <circle cx="122" cy="216" r="3" fill="#FDE047" stroke="#3E160D" strokeWidth="0.6" />

              {/* ======================================================== */}
              {/* 3. AUSPICIOUS LIT DIYA ON THE SIEVE LEDGE                */}
              {/* ======================================================== */}
              {/* Terracotta / Silver Diya Base */}
              <path
                d="M 112 172 C 114 186, 138 192, 152 192 C 166 192, 184 186, 186 172 Z"
                fill="#FFCA28"
                stroke="#3E160D"
                strokeWidth="1.4"
              />
              {/* Red Kumkum Border on Diya */}
              <path
                d="M 116 176 C 124 184, 142 187, 152 187 C 162 187, 176 184, 182 176 Z"
                fill="#DC2626"
              />

              {/* Ghee Surface */}
              <ellipse cx="150" cy="172" rx="28" ry="6" fill="#FFA000" stroke="#3E160D" strokeWidth="0.8" />

              {/* Cotton Wick */}
              <circle cx="150" cy="168" r="1.8" fill="#3E160D" />

              {/* Radiant Flame (Akhand Jyoti) */}
              <g>
                {/* Flame Corona */}
                <ellipse cx="150" cy="150" rx="14" ry="20" fill="#FFD54F" fillOpacity="0.45" />
                {/* Saffron Flame Tongue */}
                <path
                  d="M 150 134 C 142 148, 138 160, 144 168 C 147 172, 153 172, 156 168 C 162 160, 158 148, 150 134 Z"
                  fill="url(#karwaFlameGrad)"
                  stroke="#3E160D"
                  strokeWidth="0.9"
                />
                {/* White Inner Flame Seed */}
                <path
                  d="M 150 148 C 147 156, 146 162, 148 166 C 149 168, 151 168, 152 166 C 154 162, 153 156, 150 148 Z"
                  fill="#FFFFFF"
                />
              </g>

              {/* Red Rose Petals Resting Around Diya */}
              <path d="M 106 178 C 102 184, 108 190, 114 186 C 118 182, 112 176, 106 178 Z" fill="#E11D48" stroke="#3E160D" strokeWidth="0.6" />
              <path d="M 178 182 C 176 188, 184 192, 188 186 C 190 182, 182 178, 178 182 Z" fill="#E11D48" stroke="#3E160D" strokeWidth="0.6" />
            </g>
          </svg>

          {/* Festive Badge Tag Underneath Chhalni */}
          <div className="mt-1 flex items-center space-x-1.5 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full shadow-md border border-rose-300/80 tracking-wider uppercase group-hover:scale-105 transition-transform">
            <Moon className="w-3 h-3 text-yellow-200 animate-pulse fill-yellow-200" />
            <span>Chhalni &amp; Moon</span>
          </div>
        </div>
      </button>

      {/* Floating Festive Speech Callout on Click */}
      {showBubble && (
        <div className="absolute -top-12 left-2 sm:left-4 z-50 whitespace-nowrap bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-rose-800 dark:text-rose-300 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-2xl border-2 border-rose-400 animate-in fade-in zoom-in-75 duration-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-rose-500 animate-bounce shrink-0" />
          <span>{bubbleText}</span>
          <div className="absolute left-8 -bottom-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-rose-400 rotate-45" />
        </div>
      )}

      {/* DYNAMIC CRESCENT MOONS, ROSE PETALS & STARS SHOWER */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `karwaPetalFlutter ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
            pointerEvents: 'none',
            zIndex: 99999
          }}
          className="will-change-transform"
        >
          {p.type === 'moon' ? (
            /* Golden Crescent Moon SVG */
            <svg
              width={p.size * 1.3}
              height={p.size * 1.3}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(253,224,71,0.85)]"
            >
              <path d="M 21 12.79 A 9 9 0 1 1 11.21 3 A 7 7 0 0 0 21 12.79 Z" />
            </svg>
          ) : p.type === 'rosePetal' ? (
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
          ) : (
            /* Auspicious Golden Sparkle Star */
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]"
            >
              <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
