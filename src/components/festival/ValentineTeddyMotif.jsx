import React, { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';

/**
 * ValentineTeddyMotif - Adorable Plush Love Teddy Bear holding a Glowing Ruby Heart & Silver Bow
 * Positioned on bottom-left corner during Valentine's Day Romance Mode.
 * 
 * Features:
 * - Handcrafted vector artwork:
 *   Plush caramel teddy bear with fluffy rounded ears, rosy cheeks, wearing a polished
 *   925 sterling silver bow tie with a dangling heart charm, hugging a glowing ruby crystal heart.
 * - White sticker outline filter matching the boutique illustration aesthetic.
 * - Interactive on CLICK:
 *   1. Sweet glockenspiel arpeggio & soft cute chime (Web Audio API).
 *   2. Teddy gentle hug bounce & wiggle.
 *   3. 50+ Floating Ruby Hearts, Rose Petals, and Starlight Sparkles!
 *   4. Warm affectionate speech callout.
 */
export default function ValentineTeddyMotif({ onOpenModal }) {
  const [isLoved, setIsLoved] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Sending Warm Cuddle Hugs! 🧸💖');
  const [showBubble, setShowBubble] = useState(false);

  const TEDDY_MESSAGES = [
    'Sending Warm Cuddle Hugs & Pure Silver Love! 🧸💖',
    'You\'re My Favorite Person in the Whole World! 🌹',
    'Soft Hugs, Bright Smiles & Precious Memories! ✨',
    'Love You to the Moon and Back! 💍',
    'Forever Tied with Love & Pure Sterling Silver! 💝'
  ];

  // Synthesize sweet glockenspiel chime & soft cute squeeze tone via Web Audio API
  const playTeddyAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Glockenspiel Arpeggio: G4 -> C5 -> E5 -> G5 -> C6
      const glockNotes = [392.00, 523.25, 659.25, 783.99, 1046.50];
      glockNotes.forEach((freq, idx) => {
        const t = now + idx * 0.075;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 1.15);
      });

      // 2. Soft cute harmonic resonance
      const warm = ctx.createOscillator();
      const warmGain = ctx.createGain();
      warm.type = 'triangle';
      warm.frequency.setValueAtTime(440, now);
      warm.frequency.exponentialRampToValueAtTime(587.33, now + 0.18);

      warmGain.gain.setValueAtTime(0.09, now);
      warmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      warm.connect(warmGain);
      warmGain.connect(ctx.destination);
      warm.start(now);
      warm.stop(now + 0.4);
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  };

  const handleClick = (e) => {
    setIsLoved(true);
    playTeddyAudio();

    const randomGreeting = TEDDY_MESSAGES[Math.floor(Math.random() * TEDDY_MESSAGES.length)];
    setBubbleText(randomGreeting);
    setShowBubble(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width * 0.5;
    const originY = rect.top + rect.height * 0.4;

    // 50+ dynamic love particles: Ruby Hearts, Rose Petals, Starlight Sparks
    const newParticles = Array.from({ length: 48 }).map((_, i) => {
      const angleDeg = -145 + Math.random() * 125;
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
        color: ['#F43F5E', '#FB7185', '#E11D48', '#FDA4AF', '#F472B6', '#FFFFFF', '#FDE047'][i % 7],
        duration: 1.4 + Math.random() * 0.85,
        delay: Math.random() * 0.25,
        type: i % 3 === 0 ? 'heart' : i % 3 === 1 ? 'petal' : 'star'
      };
    });

    setParticles(newParticles);

    setTimeout(() => {
      setIsLoved(false);
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
        @keyframes teddyGentleHover {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(1.2deg); }
        }

        @keyframes teddyLoveHugBounce {
          0% { transform: scale(1) translateY(0); }
          25% { transform: scale(1.12, 0.92) translateY(4px); }
          50% { transform: scale(0.96, 1.12) translateY(-10px) rotate(-2deg); }
          75% { transform: scale(1.04, 0.97) translateY(-3px) rotate(1deg); }
          100% { transform: scale(1) translateY(0); }
        }

        @keyframes rubyHeartPulse {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(244, 63, 94, 0.85));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(225, 29, 72, 1)) drop-shadow(0 0 30px rgba(251, 113, 133, 0.8));
            transform: scale(1.08);
          }
        }

        @keyframes teddyParticleFloat {
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

        .animate-teddy-idle {
          animation: teddyGentleHover 3.2s ease-in-out infinite;
        }

        .animate-teddy-bounce {
          animation: teddyLoveHugBounce 0.85s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-ruby-heart {
          animation: rubyHeartPulse 2.4s ease-in-out infinite;
        }
      `}</style>

      {/* Main Interactive Button */}
      <button
        type="button"
        onClick={handleClick}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-transform duration-300 ${
          isLoved ? 'animate-teddy-bounce' : 'group-hover:scale-105 active:scale-95'
        }`}
        title="Love Teddy Bear • Click for Warm Hugs & Romantic Hearts!"
        aria-label="Valentine Love Teddy Bear"
      >
        <div className="relative flex flex-col items-center">
          {/* Ambient Warm Rose-Pink Glow Behind Teddy */}
          <div
            className={`absolute top-2 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 pointer-events-none ${
              isLoved
                ? 'w-48 h-48 bg-gradient-to-r from-rose-400/60 via-pink-400/60 to-red-400/50 blur-2xl scale-125'
                : 'w-24 h-24 rounded-full bg-rose-400/25 blur-xl'
            }`}
          />

          {/* SVG Illustration: Handcrafted Illustrated Love Teddy Bear */}
          <svg
            className="w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 drop-shadow-2xl overflow-visible animate-teddy-idle"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White Sticker Outline Filter */}
            <defs>
              <filter id="teddyStickerOutline" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="1" />
                <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="#FFFFFF" floodOpacity="0.85" />
              </filter>

              {/* Plush Honey Brown Fur Gradient */}
              <linearGradient id="teddyFurGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5D0A9" />
                <stop offset="45%" stopColor="#E0A96D" />
                <stop offset="85%" stopColor="#C68642" />
                <stop offset="100%" stopColor="#9C5A1C" />
              </linearGradient>

              {/* Soft Cream Muzzle Gradient */}
              <linearGradient id="teddyCreamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFDF7" />
                <stop offset="60%" stopColor="#FEF3C7" />
                <stop offset="100%" stopColor="#FDE68A" />
              </linearGradient>

              {/* Soft Pink Inner Ears & Paw Pads */}
              <linearGradient id="teddyPinkPad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF1F2" />
                <stop offset="50%" stopColor="#FECDD3" />
                <stop offset="100%" stopColor="#FB7185" />
              </linearGradient>

              {/* 925 Sterling Silver Bow Tie Gradient */}
              <linearGradient id="silverBowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="#E2E8F0" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#F8FAFC" />
              </linearGradient>

              {/* Ruby Crystal Heart Gradient */}
              <linearGradient id="teddyRubyHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FB7185" />
                <stop offset="35%" stopColor="#F43F5E" />
                <stop offset="75%" stopColor="#E11D48" />
                <stop offset="100%" stopColor="#9F1239" />
              </linearGradient>
            </defs>

            {/* Main Teddy Artwork with Sticker Outline */}
            <g filter="url(#teddyStickerOutline)">
              {/* ======================================================== */}
              {/* 1. SOFT DREAMY CLOUD PEDESTAL                            */}
              {/* ======================================================== */}
              <g transform="translate(100, 206)">
                <ellipse cx="0" cy="8" rx="48" ry="12" fill="#FFFFFF" stroke="#3E160D" strokeWidth="1.2" />
                <circle cx="-24" cy="2" r="14" fill="#FFFFFF" />
                <circle cx="0" cy="-2" r="16" fill="#FFFFFF" />
                <circle cx="24" cy="2" r="14" fill="#FFFFFF" />
                <ellipse cx="0" cy="6" rx="38" ry="6" fill="#FCE7F3" />
              </g>

              {/* ======================================================== */}
              {/* 2. TEDDY EARS (BEHIND HEAD)                              */}
              {/* ======================================================== */}
              {/* Left Ear */}
              <g transform="translate(68, 62)">
                <circle cx="0" cy="0" r="16" fill="url(#teddyFurGrad)" stroke="#3E160D" strokeWidth="1.4" />
                <circle cx="2" cy="2" r="9" fill="url(#teddyPinkPad)" stroke="#3E160D" strokeWidth="0.8" />
              </g>
              {/* Right Ear */}
              <g transform="translate(132, 62)">
                <circle cx="0" cy="0" r="16" fill="url(#teddyFurGrad)" stroke="#3E160D" strokeWidth="1.4" />
                <circle cx="-2" cy="2" r="9" fill="url(#teddyPinkPad)" stroke="#3E160D" strokeWidth="0.8" />
              </g>

              {/* ======================================================== */}
              {/* 3. CHUBBY TEDDY BODY & LEGS                              */}
              {/* ======================================================== */}
              {/* Torso */}
              <ellipse cx="100" cy="146" rx="36" ry="34" fill="url(#teddyFurGrad)" stroke="#3E160D" strokeWidth="1.4" />

              {/* Left Foot Paw */}
              <g transform="translate(64, 186)">
                <ellipse cx="0" cy="0" rx="18" ry="15" fill="url(#teddyFurGrad)" stroke="#3E160D" strokeWidth="1.3" />
                {/* Large Center Footpad */}
                <ellipse cx="0" cy="2" rx="9" ry="7" fill="url(#teddyPinkPad)" stroke="#3E160D" strokeWidth="0.8" />
                {/* 3 Little Toe Pads */}
                <circle cx="-7" cy="-7" r="2.8" fill="url(#teddyPinkPad)" />
                <circle cx="0" cy="-9" r="3.2" fill="url(#teddyPinkPad)" />
                <circle cx="7" cy="-7" r="2.8" fill="url(#teddyPinkPad)" />
              </g>

              {/* Right Foot Paw */}
              <g transform="translate(136, 186)">
                <ellipse cx="0" cy="0" rx="18" ry="15" fill="url(#teddyFurGrad)" stroke="#3E160D" strokeWidth="1.3" />
                {/* Large Center Footpad */}
                <ellipse cx="0" cy="2" rx="9" ry="7" fill="url(#teddyPinkPad)" stroke="#3E160D" strokeWidth="0.8" />
                {/* 3 Little Toe Pads */}
                <circle cx="-7" cy="-7" r="2.8" fill="url(#teddyPinkPad)" />
                <circle cx="0" cy="-9" r="3.2" fill="url(#teddyPinkPad)" />
                <circle cx="7" cy="-7" r="2.8" fill="url(#teddyPinkPad)" />
              </g>

              {/* ======================================================== */}
              {/* 4. TEDDY ROUND HEAD & EMBROIDERED SWEET FACE             */}
              {/* ======================================================== */}
              {/* Head Base */}
              <circle cx="100" cy="88" r="32" fill="url(#teddyFurGrad)" stroke="#3E160D" strokeWidth="1.4" />

              {/* Rosy Cheeks */}
              <circle cx="78" cy="96" r="7" fill="#FB7185" fillOpacity="0.45" />
              <circle cx="122" cy="96" r="7" fill="#FB7185" fillOpacity="0.45" />

              {/* Cream Muzzle Area */}
              <ellipse cx="100" cy="96" rx="17" ry="13" fill="url(#teddyCreamGrad)" stroke="#3E160D" strokeWidth="1.1" />

              {/* Cute Button Nose */}
              <ellipse cx="100" cy="91" rx="5.5" ry="4" fill="#3E160D" />
              <circle cx="98" cy="90" r="1.3" fill="#FFFFFF" />

              {/* Smiling Stitched Mouth Line */}
              <path d="M 100 95 L 100 100" stroke="#3E160D" strokeWidth="1.2" />
              <path d="M 94 99 Q 100 105 106 99" stroke="#3E160D" strokeWidth="1.4" strokeLinecap="round" fill="none" />

              {/* Sparkly Button Eyes */}
              {/* Left Eye */}
              <circle cx="86" cy="83" r="4.5" fill="#2E1005" stroke="#3E160D" strokeWidth="0.6" />
              <circle cx="84.5" cy="81.5" r="1.8" fill="#FFFFFF" />
              <circle cx="87.5" cy="84.5" r="0.8" fill="#FFFFFF" />

              {/* Right Eye */}
              <circle cx="114" cy="83" r="4.5" fill="#2E1005" stroke="#3E160D" strokeWidth="0.6" />
              <circle cx="112.5" cy="81.5" r="1.8" fill="#FFFFFF" />
              <circle cx="115.5" cy="84.5" r="0.8" fill="#FFFFFF" />

              {/* Cute Forehead Hair Tuft */}
              <path d="M 97 58 Q 100 52 103 58 Q 106 53 108 59" stroke="#9C5A1C" strokeWidth="1.5" strokeLinecap="round" fill="none" />

              {/* ======================================================== */}
              {/* 5. 925 STERLING SILVER BOW TIE & COLLAR CHARM            */}
              {/* ======================================================== */}
              <g transform="translate(100, 118)">
                {/* Left Bow Loop */}
                <polygon points="0,0 -16,-9 -16,9" fill="url(#silverBowGrad)" stroke="#3E160D" strokeWidth="1.1" />
                <path d="M -8 -4 Q -14 0 -8 4" stroke="#FFFFFF" strokeWidth="0.9" fill="none" />

                {/* Right Bow Loop */}
                <polygon points="0,0 16,-9 16,9" fill="url(#silverBowGrad)" stroke="#3E160D" strokeWidth="1.1" />
                <path d="M 8 -4 Q 14 0 8 4" stroke="#FFFFFF" strokeWidth="0.9" fill="none" />

                {/* Bow Center Knot */}
                <circle cx="0" cy="0" r="4" fill="url(#silverBowGrad)" stroke="#3E160D" strokeWidth="1.1" />
                <circle cx="-1" cy="-1" r="1.3" fill="#FFFFFF" />

                {/* Dangling Tiny Silver Heart Charm */}
                <line x1="0" y1="4" x2="0" y2="8" stroke="#94A3B8" strokeWidth="1" />
                <path
                  d="M 0 8 C -2.5 6, -5 6, -5 9 C -5 12, 0 15, 0 15 C 0 15, 5 12, 5 9 C 5 6, 2.5 6, 0 8 Z"
                  fill="url(#silverBowGrad)"
                  stroke="#3E160D"
                  strokeWidth="0.8"
                />
              </g>

              {/* ======================================================== */}
              {/* 6. GLOWING RUBY HEART HUGGED BY TEDDY'S PAWS             */}
              {/* ======================================================== */}
              {/* Big Ruby Crystal Heart in Center */}
              <g transform="translate(100, 152)" className="animate-ruby-heart">
                <path
                  d="M 0 0 C -14 -18, -34 -18, -34 4 C -34 24, 0 46, 0 46 C 0 46, 34 24, 34 4 C 34 -18, 14 -18, 0 0 Z"
                  fill="url(#teddyRubyHeartGrad)"
                  stroke="#3E160D"
                  strokeWidth="1.4"
                />
                {/* Faceted Light Reflection Highlight */}
                <path
                  d="M -6 -2 C -15 -14, -28 -10, -26 2 C -24 14, -6 26, -6 26"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  strokeOpacity="0.75"
                />
                {/* Sparkle Glint Star */}
                <polygon
                  points="14,2 16,6 20,7 17,10 18,14 14,12 10,14 11,10 8,7 12,6"
                  fill="#FFFFFF"
                  className="animate-pulse"
                />
                <circle cx="14" cy="7" r="1.5" fill="#FEF08A" />
              </g>

              {/* Teddy Arms/Paws Hugging the Heart */}
              {/* Left Arm & Paw */}
              <g transform="translate(62, 148)">
                <ellipse cx="0" cy="0" rx="14" ry="11" fill="url(#teddyFurGrad)" stroke="#3E160D" strokeWidth="1.3" transform="rotate(25)" />
                <circle cx="2" cy="1" r="5" fill="url(#teddyPinkPad)" />
              </g>
              {/* Right Arm & Paw */}
              <g transform="translate(138, 148)">
                <ellipse cx="0" cy="0" rx="14" ry="11" fill="url(#teddyFurGrad)" stroke="#3E160D" strokeWidth="1.3" transform="rotate(-25)" />
                <circle cx="-2" cy="1" r="5" fill="url(#teddyPinkPad)" />
              </g>

              {/* Floating Sparkles Around Teddy */}
              <polygon points="42,70 44,74 48,75 45,78 46,82 42,80 38,82 39,78 36,75 40,74" fill="#FDE047" stroke="#3E160D" strokeWidth="0.5" className="animate-pulse" />
              <circle cx="160" cy="74" r="2.5" fill="#FFFFFF" className="animate-ping" />
              <polygon points="152,112 153,115 156,116 154,118 154,121 152,119 149,121 150,118 148,116 151,115" fill="#F43F5E" />
            </g>
          </svg>

          {/* Festive Badge Tag Underneath Teddy */}
          <div className="mt-1 flex items-center space-x-1.5 bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 text-white text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full shadow-md border border-rose-300/80 tracking-wider uppercase group-hover:scale-105 transition-transform">
            <Heart className="w-3 h-3 text-pink-200 animate-pulse fill-pink-200" />
            <span>Love Teddy &amp; Silver Bow</span>
          </div>
        </div>
      </button>

      {/* Floating Festive Speech Callout on Click */}
      {showBubble && (
        <div className="absolute -top-12 left-2 sm:left-4 z-50 whitespace-nowrap bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-rose-700 dark:text-rose-300 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-2xl border-2 border-rose-400 animate-in fade-in zoom-in-75 duration-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-rose-500 animate-bounce shrink-0" />
          <span>{bubbleText}</span>
          <div className="absolute left-8 -bottom-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-rose-400 rotate-45" />
        </div>
      )}

      {/* DYNAMIC HEARTS, PETALS & SPARKS SHOWER */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `teddyParticleFloat ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
            pointerEvents: 'none',
            zIndex: 99999
          }}
          className="will-change-transform"
        >
          {p.type === 'heart' ? (
            /* Ruby Crystal Heart SVG */
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
            /* Rose Petal SVG */
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
            /* Golden Starlight Sparkle */
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
