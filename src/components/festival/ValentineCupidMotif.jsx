import React, { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';

/**
 * ValentineCupidMotif - Winged Angel Cupid with Golden Bow & Heart Arrow
 * Positioned on bottom-left corner during Valentine's Day Festival Mode.
 * 
 * Features:
 * - Handcrafted vector of adorable winged Cupid:
 *   Golden curls, feathered angel wings, holding a golden bow aiming a ruby crystal
 *   heart arrow, floating on soft pink clouds with starlight sparkles.
 * - White sticker outline filter matching the boutique illustration aesthetic.
 * - Interactive on CLICK:
 *   1. Celestial Harp glissando + Cupid's bowstring "twang" & sweet chime (Web Audio API).
 *   2. Cupid playful flutter & arrow bounce.
 *   3. 50+ Floating Ruby Hearts, Angel Feathers & Rose-Gold Sparkles shower!
 *   4. Romantic Valentine blessing speech callout.
 */
export default function ValentineCupidMotif({ onOpenModal }) {
  const [isLoved, setIsLoved] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Happy Valentine\'s Day! 💘');
  const [showBubble, setShowBubble] = useState(false);

  const CUPID_MESSAGES = [
    'Cupid\'s Arrow of Love! Happy Valentine\'s! 💘',
    'Forever Bound in Love, Trust & Pure Silver! 💖',
    'You Make Every Day Sparkle Like Sterling Silver! ✨',
    'A Lifetime of Love, Hugs & Precious Moments! 🌹',
    'Two Hearts, One Soul, Forever Entwined! 💍'
  ];

  // Synthesize romantic celestial harp glissando + Cupid's arrow chime via Web Audio API
  const playCupidAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Celestial Harp Glissando (Arpeggiated love chord: F#4 -> A4 -> C#5 -> E5 -> G#5 -> C#6)
      const harpNotes = [370.0, 440.0, 554.37, 659.25, 830.61, 1108.73];
      harpNotes.forEach((freq, idx) => {
        const t = now + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 1.25);
      });

      // 2. Cupid's Bow Twang & Glass Chime
      const twang = ctx.createOscillator();
      const twangGain = ctx.createGain();
      twang.type = 'triangle';
      twang.frequency.setValueAtTime(420, now + 0.35);
      twang.frequency.exponentialRampToValueAtTime(180, now + 0.52);

      twangGain.gain.setValueAtTime(0.22, now + 0.35);
      twangGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      twang.connect(twangGain);
      twangGain.connect(ctx.destination);
      twang.start(now + 0.35);
      twang.stop(now + 0.58);
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  };

  const handleClick = (e) => {
    setIsLoved(true);
    playCupidAudio();

    const randomGreeting = CUPID_MESSAGES[Math.floor(Math.random() * CUPID_MESSAGES.length)];
    setBubbleText(randomGreeting);
    setShowBubble(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width * 0.5;
    const originY = rect.top + rect.height * 0.35;

    // 50+ dynamic love particles: Ruby Hearts, Pink Rose Petals & Starlight Glints
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
        @keyframes cupidGentleHover {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(1.2deg); }
        }

        @keyframes cupidLoveBounce {
          0% { transform: scale(1) translateY(0); }
          25% { transform: scale(1.1, 0.94) translateY(4px); }
          50% { transform: scale(0.96, 1.12) translateY(-10px) rotate(-2deg); }
          75% { transform: scale(1.04, 0.97) translateY(-3px) rotate(1deg); }
          100% { transform: scale(1) translateY(0); }
        }

        @keyframes heartPulseGlow {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(244, 63, 94, 0.8));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(225, 29, 72, 1)) drop-shadow(0 0 32px rgba(251, 113, 133, 0.7));
          }
        }

        @keyframes loveParticleFlutter {
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

        .animate-cupid-idle {
          animation: cupidGentleHover 3.2s ease-in-out infinite;
        }

        .animate-cupid-bounce {
          animation: cupidLoveBounce 0.85s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-heart-glow {
          animation: heartPulseGlow 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Main Interactive Button */}
      <button
        type="button"
        onClick={handleClick}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-transform duration-300 ${
          isLoved ? 'animate-cupid-bounce' : 'group-hover:scale-105 active:scale-95'
        }`}
        title="Winged Cupid • Click to Shoot Love Arrows & Spread Romance!"
        aria-label="Valentine Cupid"
      >
        <div className="relative flex flex-col items-center">
          {/* Ambient Warm Rose-Pink Glow Behind Cupid */}
          <div
            className={`absolute top-2 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 pointer-events-none ${
              isLoved
                ? 'w-48 h-48 bg-gradient-to-r from-rose-400/60 via-pink-400/60 to-red-400/50 blur-2xl scale-125'
                : 'w-24 h-24 rounded-full bg-rose-400/25 blur-xl'
            }`}
          />

          {/* SVG Illustration: Handcrafted Illustrated Winged Cupid */}
          <svg
            className="w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 drop-shadow-2xl overflow-visible animate-cupid-idle"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White Sticker Outline Filter */}
            <defs>
              <filter id="cupidStickerOutline" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="1" />
                <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="#FFFFFF" floodOpacity="0.85" />
              </filter>

              {/* Cupid Skin Tone Gradient */}
              <linearGradient id="cupidSkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF1F2" />
                <stop offset="50%" stopColor="#FFE4E6" />
                <stop offset="100%" stopColor="#FECDD3" />
              </linearGradient>

              {/* Golden Curls Gradient */}
              <linearGradient id="cupidHairGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="40%" stopColor="#FACC15" />
                <stop offset="80%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>

              {/* Ruby Crystal Heart Arrow Gradient */}
              <linearGradient id="rubyHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FB7185" />
                <stop offset="40%" stopColor="#F43F5E" />
                <stop offset="80%" stopColor="#E11D48" />
                <stop offset="100%" stopColor="#9F1239" />
              </linearGradient>

              {/* Wing Feather Gradient */}
              <linearGradient id="angelWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#FDF2F8" />
                <stop offset="80%" stopColor="#FCE7F3" />
                <stop offset="100%" stopColor="#F472B6" />
              </linearGradient>
            </defs>

            {/* Main Cupid Artwork with Sticker Outline */}
            <g filter="url(#cupidStickerOutline)">
              {/* ======================================================== */}
              {/* 1. SOFT DREAMY CLOUD PEDESTAL                            */}
              {/* ======================================================== */}
              <g transform="translate(100, 206)">
                <ellipse cx="0" cy="8" rx="48" ry="12" fill="#FFFFFF" stroke="#3E160D" strokeWidth="1.2" />
                <circle cx="-24" cy="2" r="14" fill="#FFFFFF" />
                <circle cx="0" cy="-2" r="16" fill="#FFFFFF" />
                <circle cx="24" cy="2" r="14" fill="#FFFFFF" />
                {/* Cloud Soft Pink Tint Highlight */}
                <ellipse cx="0" cy="6" rx="38" ry="6" fill="#FCE7F3" />
              </g>

              {/* ======================================================== */}
              {/* 2. ANGEL FEATHER WINGS (BACK)                            */}
              {/* ======================================================== */}
              {/* Left Wing */}
              <path
                d="M 72 108 C 44 95, 24 115, 34 135 C 40 148, 54 150, 72 138 Z"
                fill="url(#angelWingGrad)"
                stroke="#3E160D"
                strokeWidth="1.4"
              />
              <path d="M 42 122 Q 54 130 68 126" stroke="#F472B6" strokeWidth="1.2" fill="none" />
              <path d="M 50 134 Q 60 138 70 134" stroke="#F472B6" strokeWidth="1.2" fill="none" />

              {/* Right Wing */}
              <path
                d="M 128 108 C 156 95, 176 115, 166 135 C 160 148, 146 150, 128 138 Z"
                fill="url(#angelWingGrad)"
                stroke="#3E160D"
                strokeWidth="1.4"
              />
              <path d="M 158 122 Q 146 130 132 126" stroke="#F472B6" strokeWidth="1.2" fill="none" />
              <path d="M 150 134 Q 140 138 130 134" stroke="#F472B6" strokeWidth="1.2" fill="none" />

              {/* ======================================================== */}
              {/* 3. CUPID'S CHUBBY CHERUB BODY & SASH                     */}
              {/* ======================================================== */}
              {/* Torso */}
              <ellipse cx="100" cy="145" rx="24" ry="26" fill="url(#cupidSkinGrad)" stroke="#3E160D" strokeWidth="1.4" />

              {/* Cute Little Chonky Legs */}
              <ellipse cx="86" cy="178" rx="9" ry="14" fill="url(#cupidSkinGrad)" stroke="#3E160D" strokeWidth="1.2" />
              <ellipse cx="114" cy="178" rx="9" ry="14" fill="url(#cupidSkinGrad)" stroke="#3E160D" strokeWidth="1.2" />

              {/* Pink Silk Diaper / Sash with Gold Pin */}
              <path
                d="M 80 162 C 86 178, 114 178, 120 162 C 114 158, 86 158, 80 162 Z"
                fill="#F43F5E"
                stroke="#3E160D"
                strokeWidth="1.2"
              />
              <circle cx="100" cy="164" r="2.5" fill="#FDE047" stroke="#3E160D" strokeWidth="0.6" />

              {/* ======================================================== */}
              {/* 4. HEAD, ROSY CHEEKS & GOLDEN CURLS                      */}
              {/* ======================================================== */}
              {/* Head Base */}
              <circle cx="100" cy="95" r="22" fill="url(#cupidSkinGrad)" stroke="#3E160D" strokeWidth="1.4" />

              {/* Rosy Glowing Cheeks */}
              <circle cx="88" cy="102" r="5" fill="#FB7185" fillOpacity="0.5" />
              <circle cx="112" cy="102" r="5" fill="#FB7185" fillOpacity="0.5" />

              {/* Sweet Winking / Smiling Eyes */}
              <path d="M 88 94 Q 92 90 96 94" stroke="#3E160D" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M 104 94 Q 108 90 112 94" stroke="#3E160D" strokeWidth="2.2" strokeLinecap="round" fill="none" />

              {/* Adorable Cute Smile */}
              <path d="M 96 104 Q 100 108 104 104" stroke="#E11D48" strokeWidth="1.8" strokeLinecap="round" fill="none" />

              {/* Luxurious Golden Curls */}
              <circle cx="86" cy="78" r="8" fill="url(#cupidHairGold)" stroke="#3E160D" strokeWidth="1" />
              <circle cx="100" cy="74" r="9" fill="url(#cupidHairGold)" stroke="#3E160D" strokeWidth="1" />
              <circle cx="114" cy="78" r="8" fill="url(#cupidHairGold)" stroke="#3E160D" strokeWidth="1" />
              <circle cx="78" cy="88" r="7" fill="url(#cupidHairGold)" stroke="#3E160D" strokeWidth="1" />
              <circle cx="122" cy="88" r="7" fill="url(#cupidHairGold)" stroke="#3E160D" strokeWidth="1" />

              {/* ======================================================== */}
              {/* 5. GOLDEN BOW & CRYSTAL HEART ARROW                      */}
              {/* ======================================================== */}
              {/* Left Arm Pulling Bowstring */}
              <path d="M 86 136 C 72 136, 68 126, 74 116" fill="none" stroke="url(#cupidSkinGrad)" strokeWidth="10" strokeLinecap="round" />
              {/* Right Arm Aiming */}
              <path d="M 114 136 C 128 136, 134 126, 130 116" fill="none" stroke="url(#cupidSkinGrad)" strokeWidth="10" strokeLinecap="round" />

              {/* Golden Bow Curved Wood */}
              <path
                d="M 64 96 C 54 116, 54 144, 64 164"
                fill="none"
                stroke="url(#cupidHairGold)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Bowstring */}
              <line x1="64" y1="96" x2="88" y2="130" stroke="#FFFFFF" strokeWidth="1.2" />
              <line x1="64" y1="164" x2="88" y2="130" stroke="#FFFFFF" strokeWidth="1.2" />

              {/* Golden Arrow Shaft */}
              <line x1="84" y1="130" x2="148" y2="108" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
              {/* Feather Fletching at Arrow Tail */}
              <polygon points="82,128 76,124 74,132 80,132" fill="#F472B6" />

              {/* Glowing Ruby Heart Arrowhead */}
              <g transform="translate(148, 108) rotate(-20)" className="animate-heart-glow">
                <path
                  d="M 0 0 C -4 -6, -10 -6, -10 0 C -10 6, 0 14, 0 14 C 0 14, 10 6, 10 0 C 10 -6, 4 -6, 0 0 Z"
                  fill="url(#rubyHeartGrad)"
                  stroke="#3E160D"
                  strokeWidth="1"
                />
              </g>

              {/* Floating Sparkle Stars Around Cupid */}
              <polygon points="156,64 158,68 162,69 159,72 160,76 156,74 152,76 153,72 150,69 154,68" fill="#FDE047" stroke="#3E160D" strokeWidth="0.5" className="animate-pulse" />
              <circle cx="42" cy="78" r="2.2" fill="#FFFFFF" className="animate-ping" />
              <circle cx="164" cy="144" r="2.2" fill="#FFFFFF" />
            </g>
          </svg>

          {/* Festive Badge Tag Underneath Cupid */}
          <div className="mt-1 flex items-center space-x-1.5 bg-gradient-to-r from-rose-600 via-pink-500 to-red-600 text-white text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full shadow-md border border-rose-300/80 tracking-wider uppercase group-hover:scale-105 transition-transform">
            <Heart className="w-3 h-3 text-pink-200 animate-pulse fill-pink-200" />
            <span>Winged Cupid</span>
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
            animation: `loveParticleFlutter ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
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
