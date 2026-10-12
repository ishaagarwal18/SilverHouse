import React, { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';

/**
 * GaneshaModakMushakMotif - Sacred Silver Thali of Steamed Modaks with Mushakraj & Hibiscus
 * Positioned on bottom-right corner during Ganesh Chaturthi Festival Mode.
 * 
 * Features:
 * - Handcrafted illustrated vector artwork:
 *   Ornate royal Sterling Silver Thali heaped with fluted golden Modaks,
 *   fresh red Hibiscus (Jaswand) blossom, 21 sacred green Durva grass blades,
 *   and devoted Mushakraj (the mouse) reverently holding a golden modak!
 * - White sticker outline filter matching the boutique illustration aesthetic.
 * - Interactive on CLICK:
 *   1. Energetic festive Nashik Dhol-Tasha drum rhythm + brass Manjira cymbals (Web Audio API).
 *   2. Playful Mushak jump & modak thali bounce.
 *   3. 50+ Sweet Golden Modaks, Red Hibiscus Blossoms & Festive Sparkles shower!
 *   4. Cheerful "Modakpriya Ganpati Bappa!" blessing callout.
 */
export default function GaneshaModakMushakMotif({ onOpenModal }) {
  const [isCelebration, setIsCelebration] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Modakpriya Ganeshaya Namah! 🥟');
  const [showBubble, setShowBubble] = useState(false);

  const MODAK_CALLS = [
    'Modakpriya Ganeshaya Namah! 🥟',
    'Sweetness, Prosperity & Joy in Abundance! 💛',
    'Mushakraj & Bappa Shower You with Blessings! ✨',
    'Ganpati Bappa Morya, Pudhchya Varshi Lavkar Ya! 🌺',
    'Pure 999 Silver Modaks for Auspicious Gifting! 🌟'
  ];

  // Synthesize energetic Nashik Dhol-Tasha drum beats + brass Manjira cymbals
  const playDholTashaAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Energetic Dhol Rhythm Pattern: "Dhum... Taka-Dhum... Taka-Dhum-Dhum!"
      const drumBeats = [
        { t: 0.04, freq: 88, gain: 0.35, dur: 0.22, isBass: true },   // Dhum
        { t: 0.22, freq: 280, gain: 0.20, dur: 0.10, isBass: false }, // Ta
        { t: 0.32, freq: 320, gain: 0.22, dur: 0.10, isBass: false }, // Ka
        { t: 0.44, freq: 94, gain: 0.38, dur: 0.24, isBass: true },   // Dhum
        { t: 0.64, freq: 290, gain: 0.22, dur: 0.10, isBass: false }, // Ta
        { t: 0.74, freq: 340, gain: 0.24, dur: 0.10, isBass: false }, // Ka
        { t: 0.86, freq: 96, gain: 0.42, dur: 0.30, isBass: true }    // DHUM!
      ];

      drumBeats.forEach(({ t: offset, freq, gain: vol, dur, isBass }) => {
        const t = now + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = isBass ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.45, t + dur);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + dur + 0.02);
      });

      // 2. High Shimmering Brass Tasha & Manjira Cymbals ("Chhang... Chhang!")
      [0.05, 0.45, 0.88].forEach((offset) => {
        const t = now + offset;
        const cymbal = ctx.createOscillator();
        const cymbalGain = ctx.createGain();

        cymbal.type = 'triangle';
        cymbal.frequency.setValueAtTime(2600, t);
        cymbal.frequency.exponentialRampToValueAtTime(900, t + 0.25);

        cymbalGain.gain.setValueAtTime(0.14, t);
        cymbalGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        cymbal.connect(cymbalGain);
        cymbalGain.connect(ctx.destination);

        cymbal.start(t);
        cymbal.stop(t + 0.30);
      });
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  };

  const handleClick = (e) => {
    setIsCelebration(true);
    playDholTashaAudio();

    const randomGreeting = MODAK_CALLS[Math.floor(Math.random() * MODAK_CALLS.length)];
    setBubbleText(randomGreeting);
    setShowBubble(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width * 0.5;
    const originY = rect.top + rect.height * 0.32;

    // 50+ dynamic particles: Steamed Modaks, Red Hibiscus Blossoms & Festive Sparkles
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
        size: Math.random() * 14 + 8,
        color: ['#F59E0B', '#FBBF24', '#EF4444', '#DC2626', '#FDE047', '#FFF9C4', '#16A34A'][i % 7],
        duration: 1.3 + Math.random() * 0.9,
        delay: Math.random() * 0.28,
        type: i % 3 === 0 ? 'modak' : i % 3 === 1 ? 'hibiscus' : 'spark'
      };
    });

    setParticles(newParticles);

    setTimeout(() => {
      setIsCelebration(false);
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
        @keyframes modakThaliBounce {
          0% { transform: scale(1) translateY(0); }
          20% { transform: scale(1.12, 0.88) translateY(6px); }
          40% { transform: scale(0.92, 1.15) translateY(-14px) rotate(-2deg); }
          65% { transform: scale(1.06, 0.95) translateY(-4px) rotate(1deg); }
          85% { transform: scale(0.98, 1.02) translateY(0) rotate(0deg); }
          100% { transform: scale(1) translateY(0); }
        }

        @keyframes mushakEarTwitch {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
          75% { transform: rotate(-4deg); }
        }

        @keyframes festiveModakFly {
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

        .animate-thali-bounce {
          animation: modakThaliBounce 0.85s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-mushak-ear {
          animation: mushakEarTwitch 2.5s ease-in-out infinite;
          transform-origin: 52px 148px;
        }
      `}</style>

      {/* Main Interactive Button */}
      <button
        type="button"
        onClick={handleClick}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-transform duration-300 ${
          isCelebration ? 'animate-thali-bounce' : 'group-hover:scale-105 active:scale-95'
        }`}
        title="Modak Thali & Mushakraj • Click for Dhol-Tasha & Sweet Blessings!"
        aria-label="Modak Thali with Mushakraj"
      >
        <div className="relative flex flex-col items-center">
          {/* Ambient Warm Golden/Amber Aura Behind Thali */}
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 pointer-events-none ${
              isCelebration
                ? 'w-48 h-48 bg-gradient-to-r from-amber-400/50 via-yellow-300/60 to-rose-400/50 blur-2xl scale-125'
                : 'w-24 h-24 rounded-full bg-amber-400/20 blur-xl'
            }`}
          />

          {/* SVG Illustration: Illustrated Modak Thali & Mushakraj */}
          <svg
            className="w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 drop-shadow-2xl overflow-visible"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White Sticker Outline Filter */}
            <defs>
              <filter id="modakStickerOutline" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="1" />
                <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="#FFFFFF" floodOpacity="0.85" />
              </filter>

              {/* Pure Sterling Silver Thali Gradient */}
              <linearGradient id="silverPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#E2E8F0" />
                <stop offset="60%" stopColor="#CBD5E1" />
                <stop offset="85%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>

              {/* Steamed Golden Modak Gradient */}
              <linearGradient id="modakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFDE7" />
                <stop offset="35%" stopColor="#FFF59D" />
                <stop offset="70%" stopColor="#FDD835" />
                <stop offset="100%" stopColor="#F57F17" />
              </linearGradient>

              {/* Cute Mushakraj Skin Gradient */}
              <linearGradient id="mushakSkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#CBD5E1" />
                <stop offset="50%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>

              {/* Red Hibiscus (Jaswand) Gradient */}
              <linearGradient id="jaswandRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F43F5E" />
                <stop offset="60%" stopColor="#E11D48" />
                <stop offset="100%" stopColor="#9F1239" />
              </linearGradient>
            </defs>

            {/* Main Artwork with Sticker Outline */}
            <g filter="url(#modakStickerOutline)">
              {/* ======================================================== */}
              {/* 1. DEVOTED MUSHAKRAJ (GANESHA'S MOUSE COMPANION)         */}
              {/* ======================================================== */}
              <g id="mushakrajGroup">
                {/* Long Graceful Tail Sweeping Backwards */}
                <path
                  d="M 28 206 C 14 200, 10 178, 22 168 C 26 164, 30 166, 28 172 C 20 180, 26 194, 38 198 Z"
                  fill="url(#mushakSkinGrad)"
                  stroke="#3E160D"
                  strokeWidth="0.8"
                />

                {/* Plump Little Body */}
                <ellipse cx="48" cy="186" rx="20" ry="16" fill="url(#mushakSkinGrad)" stroke="#3E160D" strokeWidth="1.4" />

                {/* Cute Head & Snout */}
                <path
                  d="M 54 172 C 60 164, 76 166, 78 175 C 78 184, 62 188, 54 182 Z"
                  fill="url(#mushakSkinGrad)"
                  stroke="#3E160D"
                  strokeWidth="1.2"
                />

                {/* Pink Nose Tip */}
                <circle cx="78" cy="174" r="2.2" fill="#FB7185" stroke="#3E160D" strokeWidth="0.5" />

                {/* Sparkling Eye */}
                <circle cx="66" cy="172" r="2.5" fill="#1F2937" />
                <circle cx="67" cy="171" r="0.9" fill="#FFFFFF" />

                {/* Big Cute Ears with Pink Inside */}
                <g className="animate-mushak-ear">
                  <ellipse cx="48" cy="154" rx="9" ry="12" fill="url(#mushakSkinGrad)" stroke="#3E160D" strokeWidth="1" />
                  <ellipse cx="48" cy="154" rx="5.5" ry="8" fill="#FBCFE8" />
                </g>

                {/* Folded Paws Lovingly Offering a Tiny Modak */}
                <ellipse cx="68" cy="182" rx="4.5" ry="3.5" fill="url(#mushakSkinGrad)" stroke="#3E160D" strokeWidth="0.8" />
                {/* Tiny Mini Modak in Paws */}
                <path
                  d="M 74 178 C 71 181, 70 185, 73 187 C 76 189, 80 187, 80 184 Z"
                  fill="url(#modakGrad)"
                  stroke="#3E160D"
                  strokeWidth="0.7"
                />
              </g>

              {/* ======================================================== */}
              {/* 2. ROYAL STERLING SILVER POOJA THALI (AARTI PLATE)       */}
              {/* ======================================================== */}
              {/* Outer Deep Plate Rim */}
              <ellipse cx="120" cy="198" rx="66" ry="18" fill="url(#silverPlateGrad)" stroke="#3E160D" strokeWidth="1.8" />
              {/* Inner Plate Surface */}
              <ellipse cx="120" cy="196" rx="58" ry="13" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="0.8" />

              {/* Embossed Pearl Moti Along the Silver Plate Rim */}
              {[-52, -40, -28, -16, -4, 8, 20, 32, 44, 56].map((offset, i) => (
                <circle
                  key={`thali-bead-${i}`}
                  cx={120 + offset}
                  cy={199 - Math.abs(offset) * 0.06}
                  r="2"
                  fill="#FFFFFF"
                  stroke="#64748B"
                  strokeWidth="0.5"
                />
              ))}

              {/* Sacred Green 21 Durva Grass Blades on Thali */}
              <g transform="translate(150, 182)">
                <path d="M 0 10 L -6 0 M 0 10 L 0 -4 M 0 10 L 6 0" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M 4 12 L 10 4 M 4 12 L 12 8" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" />
              </g>

              {/* Red Hibiscus (Jaswand) Blossom on Thali */}
              <g transform="translate(82, 186)">
                {/* 5 Petals */}
                <ellipse cx="0" cy="-6" rx="6" ry="8" fill="url(#jaswandRedGrad)" stroke="#3E160D" strokeWidth="0.6" />
                <ellipse cx="6" cy="-2" rx="6" ry="8" fill="url(#jaswandRedGrad)" stroke="#3E160D" strokeWidth="0.6" transform="rotate(72 6 -2)" />
                <ellipse cx="4" cy="6" rx="6" ry="8" fill="url(#jaswandRedGrad)" stroke="#3E160D" strokeWidth="0.6" transform="rotate(144 4 6)" />
                <ellipse cx="-4" cy="6" rx="6" ry="8" fill="url(#jaswandRedGrad)" stroke="#3E160D" strokeWidth="0.6" transform="rotate(216 -4 6)" />
                <ellipse cx="-6" cy="-2" rx="6" ry="8" fill="url(#jaswandRedGrad)" stroke="#3E160D" strokeWidth="0.6" transform="rotate(288 -6 -2)" />
                {/* Yellow Stamen */}
                <circle cx="0" cy="0" r="2.5" fill="#FDE047" stroke="#B45309" strokeWidth="0.5" />
                <line x1="0" y1="0" x2="3" y2="-8" stroke="#FDE047" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="3" cy="-9" r="1.5" fill="#EF4444" />
              </g>

              {/* ======================================================== */}
              {/* 3. HEAPED GOLDEN STEAMED UKADICHE MODAKS                 */}
              {/* ======================================================== */}
              {/* Background Tier Modaks */}
              <g transform="translate(100, 160)">
                <path d="M 12 0 C 4 8, 2 16, 8 22 C 14 26, 26 26, 30 20 C 34 14, 22 8, 12 0 Z" fill="url(#modakGrad)" stroke="#3E160D" strokeWidth="1" />
                <path d="M 12 4 Q 16 12 18 22" stroke="#F57F17" strokeWidth="1" fill="none" />
              </g>
              <g transform="translate(132, 162)">
                <path d="M 10 0 C 4 8, 2 16, 8 22 C 14 26, 24 26, 28 20 C 32 14, 20 8, 10 0 Z" fill="url(#modakGrad)" stroke="#3E160D" strokeWidth="1" />
                <path d="M 10 4 Q 14 12 16 22" stroke="#F57F17" strokeWidth="1" fill="none" />
              </g>

              {/* Grand Majestic Center Modak */}
              <g transform="translate(112, 136)">
                {/* Fluted Steamed Modak Silhouette */}
                <path
                  d="M 14 0 C 4 12, 0 24, 8 32 C 16 38, 34 38, 40 30 C 46 22, 28 12, 14 0 Z"
                  fill="url(#modakGrad)"
                  stroke="#3E160D"
                  strokeWidth="1.5"
                />
                {/* Modak Creases (Flutes) */}
                <path d="M 14 5 Q 19 18 22 33" stroke="#F57F17" strokeWidth="1.4" fill="none" />
                <path d="M 14 5 Q 11 18 10 30" stroke="#F57F17" strokeWidth="1.4" fill="none" />
                <path d="M 14 5 Q 26 18 31 28" stroke="#F57F17" strokeWidth="1.2" fill="none" />
                {/* Saffron Kesar Strand on Crown */}
                <line x1="14" y1="1" x2="14" y2="6" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Front Tier Modak */}
              <g transform="translate(118, 172)">
                <path d="M 10 0 C 3 6, 2 14, 6 18 C 12 22, 22 22, 26 17 C 29 12, 19 6, 10 0 Z" fill="url(#modakGrad)" stroke="#3E160D" strokeWidth="1" />
                <path d="M 10 3 Q 13 10 14 18" stroke="#F57F17" strokeWidth="1" fill="none" />
              </g>

              {/* Sparkle Glints Around Modak Thali */}
              <polygon points="172,142 174,146 178,147 175,150 176,154 172,152 168,154 169,150 166,147 170,146" fill="#FDE047" stroke="#3E160D" strokeWidth="0.5" className="animate-pulse" />
              <polygon points="106,126 108,130 112,131 109,134 110,138 106,136 102,138 103,134 100,131 104,130" fill="#FDE047" stroke="#3E160D" strokeWidth="0.5" />
            </g>
          </svg>

          {/* Festive Badge Tag Underneath Thali */}
          <div className="mt-1 flex items-center space-x-1.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-600 text-white text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full shadow-md border border-yellow-300/80 tracking-wider uppercase group-hover:scale-105 transition-transform">
            <Sparkles className="w-3 h-3 text-yellow-200 animate-spin" />
            <span>Modak &amp; Mushak</span>
          </div>
        </div>
      </button>

      {/* Floating Festive Speech Callout on Click */}
      {showBubble && (
        <div className="absolute -top-12 right-2 sm:right-4 z-50 whitespace-nowrap bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-amber-800 dark:text-amber-300 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-2xl border-2 border-amber-400 animate-in fade-in zoom-in-75 duration-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-500 animate-bounce shrink-0" />
          <span>{bubbleText}</span>
          <div className="absolute right-8 -bottom-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-amber-400 rotate-45" />
        </div>
      )}

      {/* DYNAMIC GOLDEN MODAKS, HIBISCUS BLOSSOMS & FESTIVE SHOWER */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `festiveModakFly ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
            pointerEvents: 'none',
            zIndex: 99999
          }}
          className="will-change-transform"
        >
          {p.type === 'modak' ? (
            /* Golden Modak SVG */
            <svg
              width={p.size * 1.3}
              height={p.size * 1.3}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(245,158,11,0.85)]"
            >
              <path d="M 12 2 C 7 8, 4 14, 8 20 C 11 22, 17 22, 20 18 C 22 14, 17 8, 12 2 Z" />
            </svg>
          ) : p.type === 'hibiscus' ? (
            /* Red Hibiscus Flower Blossom SVG */
            <svg
              width={p.size * 1.2}
              height={p.size * 1.2}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(239,68,68,0.85)]"
            >
              <path d="M 12 2 C 6 6, 4 14, 8 19 C 12 22, 18 20, 20 15 C 22 9, 18 4, 12 2 Z" />
            </svg>
          ) : (
            /* Golden Festive Confetti / Spark */
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
