import React, { useState } from 'react';

/**
 * HoliPichkariMotif - Royal Silver Pichkari (Color Cannon) & Thali of Vibrant Gulal
 * Positioned on bottom-left corner during Holi Festival Mode.
 * 
 * Features:
 * - Handcrafted vector artwork:
 *   - Royal 925 sterling silver Pichkari with intricate floral filigree engraving & golden nozzle
 *   - Silver Thali with bowls overflowing with organic Gulal powder (Pink, Yellow, Orange, Cyan)
 *   - Joyous arch of colorful water droplets & color splashes
 * - Completely free-floating transparent illustration (NO cards, NO boxes)
 * - Interactive on CLICK:
 *   1. Playful water splash / squirt sound synthesized via Web Audio API
 *   2. Pichkari plunger squirt & splash animation
 *   3. 45+ Multi-color Gulal powder puffs & confetti shower
 *   4. Speech bubble with cheerful Holi greetings
 */
export default function HoliPichkariMotif({ onOpenModal, side = 'left' }) {
  const isRight = side === 'right';
  const idPrefix = isRight ? 'r' : 'l';
  const [isSquirting, setIsSquirting] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Bura Na Mano, Holi Hai! 🎨');
  const [showBubble, setShowBubble] = useState(false);

  const HOLI_WISHES = [
    'Bura Na Mano, Holi Hai! 🎨',
    'Rang Barse! Happy Rangwali Holi! 🌈',
    'Wishing You Colors of Joy & Silver Prosperity! ✨',
    'Pure Silver Pichkari & Auspicious Keepsakes! 💎',
    'May Your Life Be as Vibrant as Gulal! 🌸'
  ];

  // Synthesize playful water spray & splash sound via Web Audio API
  const playSplashAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Water squirt swoosh (Bandpassed noise with frequency sweep)
      const bufferSize = ctx.sampleRate * 0.28;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const squirtFilter = ctx.createBiquadFilter();
      squirtFilter.type = 'bandpass';
      squirtFilter.frequency.setValueAtTime(550, now);
      squirtFilter.frequency.exponentialRampToValueAtTime(1900, now + 0.14);
      squirtFilter.frequency.exponentialRampToValueAtTime(700, now + 0.28);
      squirtFilter.Q.setValueAtTime(3.2, now);

      const squirtGain = ctx.createGain();
      squirtGain.gain.setValueAtTime(0.001, now);
      squirtGain.gain.linearRampToValueAtTime(0.3, now + 0.04);
      squirtGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      noise.connect(squirtFilter);
      squirtFilter.connect(squirtGain);
      squirtGain.connect(ctx.destination);
      noise.start(now);

      // 2. Cheerful musical chime triad (C5 -> E5 -> G5 -> C6)
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + 0.07 + idx * 0.055);

        gain.gain.setValueAtTime(0.001, now + 0.07 + idx * 0.055);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.1 + idx * 0.055);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55 + idx * 0.055);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + 0.07 + idx * 0.055);
        osc.stop(now + 0.55 + idx * 0.055);
      });
    } catch {
      // Audio fallback
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();

    // 1. Play sound
    playSplashAudio();

    // 2. Trigger squirt animation
    setIsSquirting(true);
    setTimeout(() => setIsSquirting(false), 950);

    // 3. Show Speech Bubble
    const randomWish = HOLI_WISHES[Math.floor(Math.random() * HOLI_WISHES.length)];
    setBubbleText(randomWish);
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 3800);

    // 4. Uttarayan-Inspired Full-Screen Sparkle & Gulal Spread
    const rect = e.currentTarget.getBoundingClientRect();
    const originX = isRight ? (rect.left + rect.width * 0.35) : (rect.left + rect.width * 0.65);
    const originY = rect.top + rect.height * 0.32;

    const colors = ['#FACC15', '#EC4899', '#06B6D4', '#F97316', '#8B5CF6', '#10B981', '#F43F5E', '#FEF08A', '#FFFFFF'];
    const newParticles = Array.from({ length: 56 }).map((_, i) => {
      // Direct soaring arc inward towards center-screen + ambient spray
      const angleDeg = isRight
        ? (-195 + Math.random() * 125)  // Shoots up and leftwards across the screen
        : (-85 + Math.random() * 125);   // Shoots up and rightwards across the screen
      const angleRad = (angleDeg * Math.PI) / 180;
      const distance = 140 + Math.random() * 390; // Soars 140px up to 530px across the viewport!
      const tx = Math.cos(angleRad) * distance;
      const ty = Math.sin(angleRad) * distance;

      return {
        id: Date.now() + Math.random(),
        startX: originX,
        startY: originY,
        tx,
        ty,
        size: Math.random() * 14 + 7,
        color: colors[i % colors.length],
        duration: 1.4 + Math.random() * 0.85,
        delay: Math.random() * 0.22,
        type: i % 4 === 0 ? 'star' : i % 4 === 1 ? 'ring' : i % 4 === 2 ? 'splash' : 'puff'
      };
    });

    setParticles(newParticles);
    setTimeout(() => {
      setParticles([]);
    }, 2500);
  };

  return (
    <div className={`fixed bottom-2 ${isRight ? 'right-2 sm:right-4' : 'left-2 sm:left-4'} sm:bottom-4 z-40 select-none pointer-events-auto`}>
      {/* Keyframe Animations */}
      <style>{`
        @keyframes pichkariSquirtMotion {
          0% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.12) rotate(-6deg) translateX(4px); }
          50% { transform: scale(1.08) rotate(3deg) translateX(-2px); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes pichkariGentleHover {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(-1deg); }
        }
        @keyframes sprinkleDriftA {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-8px) translateX(3px); }
        }
        @keyframes sprinkleDriftB {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(-6px) translateX(-4px) scale(1.06); }
        }
        @keyframes sprinklePulseGlow {
          0%, 100% { opacity: 0.85; filter: drop-shadow(0 0 2px rgba(255,255,255,0.7)); }
          50% { opacity: 1; filter: drop-shadow(0 0 8px rgba(255,255,255,0.95)); }
        }
        @keyframes holiSparkleFly {
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
        .animate-pichkari-hover {
          animation: pichkariGentleHover 3.6s ease-in-out infinite;
        }
        .animate-pichkari-squirt {
          animation: pichkariSquirtMotion 0.85s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-sprinkle-a {
          animation: sprinkleDriftA 4.2s ease-in-out infinite;
        }
        .animate-sprinkle-b {
          animation: sprinkleDriftB 5.1s ease-in-out infinite;
        }
        .animate-sprinkle-glow {
          animation: sprinklePulseGlow 2.8s ease-in-out infinite;
        }
      `}</style>

      {/* DYNAMIC HOLI SPARKLE & GULAL PARTICLES SHOWER (Uttarayan Spread Style) */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `holiSparkleFly ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
            pointerEvents: 'none',
            zIndex: 99999
          }}
          className="will-change-transform"
        >
          {p.type === 'star' ? (
            /* Radiant Star Sparkle (Like Uttarayan Star) with Glow */
            <svg
              width={p.size * 1.3}
              height={p.size * 1.3}
              viewBox="0 0 24 24"
              fill={p.color}
              style={{ filter: `drop-shadow(0 0 8px ${p.color})` }}
            >
              <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
            </svg>
          ) : p.type === 'ring' ? (
            /* Floating Golden/Color Ring (Like Inspo Ring) */
            <svg
              width={p.size * 1.4}
              height={p.size * 1.4}
              viewBox="0 0 24 24"
              fill="none"
              style={{ filter: `drop-shadow(0 0 6px ${p.color})` }}
            >
              <circle cx="12" cy="12" r="9" stroke={p.color} strokeWidth="2.8" />
              <circle cx="12" cy="12" r="9" stroke="#FFFFFF" strokeWidth="0.8" strokeDasharray="4 8" opacity="0.8" />
            </svg>
          ) : p.type === 'splash' ? (
            /* Vibrant Gulal Splash Droplet */
            <svg
              width={p.size * 1.3}
              height={p.size * 1.3}
              viewBox="0 0 24 24"
              fill={p.color}
              style={{ filter: `drop-shadow(0 0 8px ${p.color})` }}
            >
              <path d="M 12 2 C 14 7, 20 10, 20 15 C 20 19, 16 22, 12 22 C 8 22, 4 19, 4 15 C 4 10, 10 7, 12 2 Z" />
            </svg>
          ) : (
            /* Soft Blurred Gulal Powder Cloud */
            <div
              style={{
                width: `${p.size * 1.8}px`,
                height: `${p.size * 1.8}px`,
                backgroundColor: p.color,
                borderRadius: '50%',
                filter: `blur(2.5px) drop-shadow(0 0 8px ${p.color})`,
                opacity: 0.85
              }}
            />
          )}
        </div>
      ))}

      {/* Speech Bubble on Click */}
      {showBubble && (
        <div className={`absolute -top-16 sm:-top-20 ${isRight ? 'right-2 sm:right-4' : 'left-2 sm:left-4'} w-56 sm:w-64 p-2.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-700 to-amber-600 text-white shadow-2xl border border-yellow-300 text-center animate-in fade-in zoom-in-95 duration-200 z-50`}>
          <p className="text-[11px] sm:text-xs font-black tracking-wide leading-tight">
            {bubbleText}
          </p>
          <div className={`absolute -bottom-2 ${isRight ? 'right-8' : 'left-8'} w-3 h-3 bg-purple-700 rotate-45 border-r border-b border-yellow-300`} />
        </div>
      )}

      {/* Main Interactive Button — Free-Floating with NO Card / Container */}
      <button
        type="button"
        onClick={handleClick}
        onDoubleClick={onOpenModal}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-all duration-300 ${
          isSquirting ? 'animate-pichkari-squirt' : 'hover:scale-105 active:scale-95'
        }`}
        title="Royal Silver Pichkari & Gulal • Click to spray colors, Double-click for Holi keepsakes"
        aria-label="Silver Pichkari and Gulal Thali Motif"
      >
        {/* Soft Ambient Multi-Color Radial Glow (No box) */}
        <div className="absolute inset-0 rounded-full blur-3xl bg-gradient-to-r from-pink-500/25 via-yellow-400/20 to-cyan-500/25 pointer-events-none" />

        {/* Handcrafted Vector Artwork: Silver Pichkari & Gulal Thali with Expansive Sprinkles */}
        <div className={`relative w-32 h-36 sm:w-40 sm:h-44 overflow-visible animate-pichkari-hover ${isRight ? 'scale-x-[-1]' : ''}`}>
          <svg
            viewBox="-30 -80 240 280"
            className="w-full h-full overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: 'drop-shadow(0 4px 14px rgba(0, 0, 0, 0.35)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.95))'
            }}
          >
            <defs>
              <linearGradient id={`pichkariSilver-${idPrefix}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="#E2E8F0" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>

              <linearGradient id={`pichkariGold-${idPrefix}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9C4" />
                <stop offset="50%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>

              {/* Gulal Powders Gradients */}
              <linearGradient id={`gulalPink-${idPrefix}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="60%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#BE185D" />
              </linearGradient>

              <linearGradient id={`gulalYellow-${idPrefix}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#EAB308" />
              </linearGradient>

              <linearGradient id={`gulalCyan-${idPrefix}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67E8F9" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#0891B2" />
              </linearGradient>

              <linearGradient id={`gulalOrange-${idPrefix}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FED7AA" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#C2410C" />
              </linearGradient>

              {/* Soft glow filter for sprinkles */}
              <filter id={`sprinkleGlow-${idPrefix}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. EXPANSIVE SPRINKLES & COLOR WAVE SPREADING IN WAY MORE SPACE (Inspiration-Based) */}
            <g id="expansiveSprinkles" className="animate-sprinkle-a">
              {/* Soft Ambient Diffuse Gulal Powder Haze Puffs in Background */}
              <circle cx="140" cy="40" r="16" fill="#EC4899" opacity="0.22" filter="blur(4px)" />
              <circle cx="160" cy="-10" r="18" fill="#FACC15" opacity="0.2" filter="blur(4px)" />
              <circle cx="110" cy="-25" r="16" fill="#06B6D4" opacity="0.18" filter="blur(4px)" />
              <circle cx="145" cy="-60" r="14" fill="#8B5CF6" opacity="0.16" filter="blur(4px)" />

              {/* 1a. Golden Ring Floating Directly in Front of Pichkari (Direct Inspo Element) */}
              <g className="animate-sprinkle-glow">
                <circle
                  cx="115"
                  cy="75"
                  r="9.5"
                  fill="none"
                  stroke={`url(#pichkariGold-${idPrefix})`}
                  strokeWidth="3.2"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.85))' }}
                />
                <circle
                  cx="115"
                  cy="75"
                  r="9.5"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="0.9"
                  strokeDasharray="6 14"
                  opacity="0.8"
                />
              </g>

              {/* 1b. Vibrant Magenta-Pink Curved Color Plume / Swoosh (Direct Inspo Element) */}
              <path
                d="M 125 70 C 135 48, 152 32, 178 26 C 162 44, 142 66, 130 78 Z"
                fill={`url(#gulalPink-${idPrefix})`}
                opacity="0.95"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.85)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.9))'
                }}
              />

              {/* 1c. SECOND FLOATING GOLDEN RING (Higher Up in Space) */}
              <circle
                cx="178"
                cy="-25"
                r="7"
                fill="none"
                stroke={`url(#pichkariGold-${idPrefix})`}
                strokeWidth="2.4"
                opacity="0.9"
                style={{ filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.7))' }}
              />

              {/* 1d. THIRD MINI FLOATING GOLDEN RING */}
              <circle
                cx="82"
                cy="28"
                r="5"
                fill="none"
                stroke={`url(#pichkariGold-${idPrefix})`}
                strokeWidth="1.8"
                opacity="0.8"
              />

              {/* 1e. PROMINENT LUMINOUS GLOWING YELLOW ORB (Direct Inspo Element) */}
              <g className="animate-sprinkle-glow">
                <circle cx="156" cy="10" r="12" fill="#FACC15" opacity="0.32" filter="blur(2px)" />
                <circle cx="156" cy="10" r="6.5" fill="#FACC15" />
                <circle cx="154.5" cy="8.5" r="2" fill="#FFFFFF" opacity="0.85" />
              </g>

              {/* 1f. VAST CONSTELLATION OF COLORFUL SPRINKLES SPREADING FAR ACROSS SPACE */}
              {/* Cyan / Turquoise Drops */}
              <circle cx="176" cy="22" r="5" fill="#06B6D4" style={{ filter: 'drop-shadow(0 0 4px #06B6D4)' }} />
              <circle cx="136" cy="6" r="4.2" fill="#22D3EE" />
              <circle cx="196" cy="-10" r="3.6" fill="#06B6D4" />
              <circle cx="106" cy="-24" r="4.5" fill="#22D3EE" />
              <circle cx="58" cy="38" r="3.5" fill="#06B6D4" />

              {/* Saffron / Orange Drops */}
              <circle cx="146" cy="54" r="4.5" fill="#F97316" />
              <circle cx="120" cy="-34" r="3.8" fill="#FB923C" />
              <circle cx="172" cy="-46" r="4.2" fill="#F97316" />
              <circle cx="78" cy="10" r="3.2" fill="#F97316" />

              {/* Pink / Magenta Drops */}
              <circle cx="186" cy="50" r="4.5" fill="#EC4899" style={{ filter: 'drop-shadow(0 0 4px #EC4899)' }} />
              <circle cx="152" cy="-54" r="3.6" fill="#F43F5E" />
              <circle cx="86" cy="-44" r="4" fill="#EC4899" />
              <circle cx="134" cy="-14" r="3" fill="#EC4899" />
              <circle cx="44" cy="20" r="2.8" fill="#EC4899" />

              {/* Emerald & Spring Lime Drops */}
              <circle cx="142" cy="26" r="3.6" fill="#10B981" />
              <circle cx="162" cy="-28" r="3.2" fill="#34D399" />
              <circle cx="96" cy="48" r="3" fill="#10B981" />

              {/* Royal Violet / Purple Drops */}
              <circle cx="132" cy="-60" r="3.6" fill="#8B5CF6" />
              <circle cx="186" cy="-36" r="2.8" fill="#A855F7" />
              <circle cx="98" cy="-6" r="3.2" fill="#8B5CF6" />

              {/* High Soaring Sky Sprinkles (Extending far into upper space) */}
              <g className="animate-sprinkle-b">
                <circle cx="146" cy="-70" r="3.2" fill="#FACC15" />
                <circle cx="166" cy="-64" r="2.8" fill="#22D3EE" />
                <circle cx="116" cy="-52" r="2.6" fill="#F43F5E" />
                <circle cx="72" cy="-66" r="2.5" fill="#FEF08A" />
                <circle cx="190" cy="-55" r="2.4" fill="#EC4899" />
              </g>

              {/* 4-Point Twinkle Star Sparkles (✦) */}
              <path
                d="M 166 -16 Q 166 -11 171 -11 Q 166 -11 166 -6 Q 166 -11 161 -11 Q 166 -11 166 -16 Z"
                fill="#FEF08A"
                style={{ filter: 'drop-shadow(0 0 3px #FEF08A)' }}
              />
              <path
                d="M 110 -38 Q 110 -34 114 -34 Q 110 -34 110 -30 Q 110 -34 106 -34 Q 110 -34 110 -38 Z"
                fill="#67E8F9"
                style={{ filter: 'drop-shadow(0 0 3px #67E8F9)' }}
              />
              <path
                d="M 190 6 Q 190 9 193 9 Q 190 9 190 12 Q 190 9 187 9 Q 190 9 190 6 Z"
                fill="#F472B6"
                style={{ filter: 'drop-shadow(0 0 3px #F472B6)' }}
              />
            </g>

            {/* 2. SILVER POOJA THALI & GULAL BOWLS (Base Tier) */}
            <g id="gulalThali" transform="translate(10, 15)">
              {/* Silver Thali Platter */}
              <ellipse cx="80" cy="145" rx="66" ry="24" fill={`url(#pichkariSilver-${idPrefix})`} stroke="#64748B" strokeWidth="1.2" />
              <ellipse cx="80" cy="142" rx="59" ry="20" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="0.8" />
              {/* Golden Filigree Rim with Dashed Stitching (Matching Inspo) */}
              <ellipse cx="80" cy="145" rx="63" ry="23" fill="none" stroke={`url(#pichkariGold-${idPrefix})`} strokeWidth="1.2" strokeDasharray="3 2" />

              {/* Four Heaping Mounds of Organic Gulal Powders with Specular White Highlight Dots */}
              {/* Bowl 1: Pink Gulal (Left) */}
              <ellipse cx="45" cy="138" rx="18" ry="10" fill={`url(#pichkariSilver-${idPrefix})`} stroke="#94A3B8" strokeWidth="0.8" />
              <path d="M 28 138 C 28 118, 62 118, 62 138 Z" fill={`url(#gulalPink-${idPrefix})`} />
              <circle cx="45" cy="122" r="3" fill="#FFFFFF" opacity="0.9" />

              {/* Bowl 2: Basanti Yellow Gulal (Center Back) */}
              <ellipse cx="80" cy="130" rx="16" ry="8" fill={`url(#pichkariSilver-${idPrefix})`} stroke="#94A3B8" strokeWidth="0.8" />
              <path d="M 65 130 C 65 112, 95 112, 95 130 Z" fill={`url(#gulalYellow-${idPrefix})`} />
              <circle cx="80" cy="116" r="2.8" fill="#FFFFFF" opacity="0.95" />

              {/* Bowl 3: Firozi Turquoise Gulal (Right) */}
              <ellipse cx="115" cy="138" rx="18" ry="10" fill={`url(#pichkariSilver-${idPrefix})`} stroke="#94A3B8" strokeWidth="0.8" />
              <path d="M 98 138 C 98 118, 132 118, 132 138 Z" fill={`url(#gulalCyan-${idPrefix})`} />
              <circle cx="115" cy="122" r="3" fill="#FFFFFF" opacity="0.9" />

              {/* Center Front: Kesari Orange Gulal Spilled Mound */}
              <path d="M 60 148 C 60 132, 100 132, 100 148 Z" fill={`url(#gulalOrange-${idPrefix})`} />
              <ellipse cx="80" cy="148" rx="20" ry="8" fill={`url(#gulalOrange-${idPrefix})`} />
              <circle cx="80" cy="144" r="2.2" fill="#FFFFFF" opacity="0.75" />
            </g>

            {/* 3. ROYAL 925 STERLING SILVER PICHKARI (Diagonal Color Cannon) */}
            <g id="pichkariCannon" transform="translate(50, 20) rotate(35, 45, 55)">
              {/* Back Plunger Handle with Gold Ring */}
              <circle cx="-16" cy="55" r="7" fill="none" stroke={`url(#pichkariGold-${idPrefix})`} strokeWidth="2.5" />
              <line x1="-9" y1="55" x2="10" y2="55" stroke={`url(#pichkariSilver-${idPrefix})`} strokeWidth="3.5" strokeLinecap="round" />

              {/* Main Pichkari Cylinder Barrel in Polished Silver */}
              <rect x="10" y="44" width="70" height="22" rx="4" fill={`url(#pichkariSilver-${idPrefix})`} stroke="#475569" strokeWidth="1.2" />

              {/* Floral Filigree Embossing on Barrel */}
              <line x1="22" y1="44" x2="22" y2="66" stroke={`url(#pichkariGold-${idPrefix})`} strokeWidth="1.8" />
              <line x1="38" y1="44" x2="38" y2="66" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="54" y1="44" x2="54" y2="66" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="70" y1="44" x2="70" y2="66" stroke={`url(#pichkariGold-${idPrefix})`} strokeWidth="1.8" />

              {/* Front Tapered Nozzle in Imperial Gold */}
              <polygon points="80,47 100,52 100,58 80,63" fill={`url(#pichkariGold-${idPrefix})`} stroke="#78350F" strokeWidth="0.8" />
              {/* Nozzle Tip */}
              <rect x="100" y="52" width="6" height="6" rx="1.5" fill="#B45309" />

              {/* Specular Light Reflection Streak along Cylinder */}
              <line x1="12" y1="48" x2="78" y2="48" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
            </g>
          </svg>
        </div>
      </button>
    </div>
  );
}
