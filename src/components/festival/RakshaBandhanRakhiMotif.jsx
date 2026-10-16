import React, { useState } from 'react';

/**
 * RakshaBandhanRakhiMotif - Royal 925 Sterling Silver Designer Rakhi, Pooja Thali & Moli Threads
 * Positioned on bottom corner during Raksha Bandhan Festival Mode.
 * 
 * Features:
 * - Handcrafted vector artwork:
 *   - Royal 925 sterling silver filigree Rakhi medallion with diamond CZ centerpiece & Rudraksha/pearl beads
 *   - Intertwined red & gold auspicious Moli (Kalawa) silk threads radiating outwards
 *   - Silver Pooja Thali with Roli (Kumkum), Akshat (Rice), Diya with warm flame, and Kaju Katli sweet with Pure Silver Vark
 * - Completely free-floating transparent illustration (NO cards, NO boxes)
 * - Interactive on CLICK:
 *   1. Sacred temple bell & sweet blessing chime synthesized via Web Audio API
 *   2. Rakhi gentle pulse & glow animation
 *   3. 56+ Full-screen Uttarayan-inspired fixed projection particles (Mini Rakhis, Solar Stars, Kalawa Ribbons, Petals)
 *   4. Speech bubble with heartfelt Raksha Bandhan greetings
 */
export default function RakshaBandhanRakhiMotif({ onOpenModal, side = 'left' }) {
  const isRight = side === 'right';
  const idPrefix = isRight ? 'r' : 'l';
  const [isPulsing, setIsPulsing] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Happy Raksha Bandhan! 💖');
  const [showBubble, setShowBubble] = useState(false);

  const RAKHI_WISHES = [
    'Happy Raksha Bandhan! 💖',
    'Sacred Silver Rakhi & Eternal Sibling Bond! ✨',
    'Suraksha, Prem Aur Samriddhi Ka Pavan Bandhan! 🌸',
    'Cherish Sibling Love with Pure 925 Silver Keepsakes! 🪙',
    'May Your Bond Shine Brighter Than Pure Silver! 💎'
  ];

  // Synthesize auspicious temple bells + cheerful sibling blessing chime via Web Audio API
  const playRakhiAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Resonant sacred temple bell (Fundamental 659.25Hz E5 + rich harmonics)
      const bellFreqs = [659.25, 987.77, 1318.51, 1975.53];
      bellFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const initialGain = 0.18 / (idx + 1);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(initialGain, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.45);
      });

      // 2. Sweet arpeggio chime: G5 -> B5 -> D6 -> G6
      const chimeNotes = [783.99, 987.77, 1174.66, 1567.98];
      chimeNotes.forEach((freq, idx) => {
        const t = now + 0.08 + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.14, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.85);
      });
    } catch {
      // Audio fallback
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();

    // 1. Play sound
    playRakhiAudio();

    // 2. Trigger pulse animation
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 950);

    // 3. Show Speech Bubble
    const randomWish = RAKHI_WISHES[Math.floor(Math.random() * RAKHI_WISHES.length)];
    setBubbleText(randomWish);
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 3800);

    // 4. Uttarayan-Inspired Full-Screen Sparkle & Rakhi Particle Shower
    const rect = e.currentTarget.getBoundingClientRect();
    const originX = isRight ? (rect.left + rect.width * 0.35) : (rect.left + rect.width * 0.65);
    const originY = rect.top + rect.height * 0.35;

    const colors = ['#F43F5E', '#FACC15', '#F59E0B', '#E11D48', '#EC4899', '#FB923C', '#FEF08A', '#FFFFFF'];
    const newParticles = Array.from({ length: 56 }).map((_, i) => {
      // Inward soaring arc towards center of screen
      const angleDeg = isRight
        ? (-195 + Math.random() * 125)  // Shoots up and leftwards into screen
        : (-85 + Math.random() * 125);   // Shoots up and rightwards into screen
      const angleRad = (angleDeg * Math.PI) / 180;
      const distance = 140 + Math.random() * 400; // Soars 140px up to 540px across viewport!
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
        type: i % 5 === 0 ? 'rakhi' : i % 5 === 1 ? 'star' : i % 5 === 2 ? 'ribbon' : i % 5 === 3 ? 'petal' : 'shagun'
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
        @keyframes rakhiGentleHover {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(1.5deg); }
        }
        @keyframes rakhiPulseMotion {
          0% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.14) rotate(-5deg); }
          50% { transform: scale(1.08) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes moliThreadSway {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(4deg); }
        }
        @keyframes diyaFlicker {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.12, 0.94); opacity: 1; }
        }
        @keyframes rakhiSparkleFly {
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
        .animate-rakhi-hover {
          animation: rakhiGentleHover 3.6s ease-in-out infinite;
        }
        .animate-rakhi-pulse {
          animation: rakhiPulseMotion 0.85s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-moli-sway {
          animation: moliThreadSway 2.4s ease-in-out infinite;
          transform-origin: center;
        }
        .animate-diya-flame {
          animation: diyaFlicker 1.8s ease-in-out infinite;
          transform-origin: bottom center;
        }
      `}</style>

      {/* DYNAMIC RAKHI PARTICLES SHOWER (Uttarayan Fixed Projection Style) */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `rakhiSparkleFly ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
            pointerEvents: 'none',
            zIndex: 99999
          }}
          className="will-change-transform"
        >
          {p.type === 'rakhi' ? (
            /* Mini Pure Silver Floral Rakhi Medallion */
            <svg
              width={p.size * 1.5}
              height={p.size * 1.5}
              viewBox="0 0 24 24"
              fill="none"
              style={{ filter: `drop-shadow(0 0 8px ${p.color})` }}
            >
              <circle cx="12" cy="12" r="7" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
              <circle cx="12" cy="12" r="4.5" fill="#E11D48" />
              <circle cx="12" cy="12" r="2" fill="#FACC15" />
              <line x1="2" y1="12" x2="5" y2="12" stroke="#F59E0B" strokeWidth="1.5" />
              <line x1="19" y1="12" x2="22" y2="12" stroke="#F59E0B" strokeWidth="1.5" />
            </svg>
          ) : p.type === 'star' ? (
            /* Radiant Golden/Rose Star Sparkle */
            <svg
              width={p.size * 1.3}
              height={p.size * 1.3}
              viewBox="0 0 24 24"
              fill={p.color}
              style={{ filter: `drop-shadow(0 0 8px ${p.color})` }}
            >
              <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
            </svg>
          ) : p.type === 'ribbon' ? (
            /* Fluttering Sacred Kalawa/Moli Ribbon Streamer */
            <svg
              width={p.size * 1.4}
              height={p.size * 1.4}
              viewBox="0 0 24 24"
              fill="none"
              stroke={p.color}
              strokeWidth="2.5"
              style={{ filter: `drop-shadow(0 0 6px ${p.color})` }}
            >
              <path d="M 3 6 Q 14 10 9 17 Q 19 20 21 22" />
            </svg>
          ) : p.type === 'petal' ? (
            /* Auspicious Rose Petal */
            <svg
              width={p.size * 1.2}
              height={p.size * 1.2}
              viewBox="0 0 24 24"
              fill={p.color}
              style={{ filter: `drop-shadow(0 0 6px ${p.color})` }}
            >
              <path d="M 12 2 C 16 6, 22 12, 18 18 C 14 22, 6 20, 4 14 C 3 8, 8 2, 12 2 Z" />
            </svg>
          ) : (
            /* Golden Shagun Coin / Bead */
            <div
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                borderRadius: '50%',
                boxShadow: `0 0 10px ${p.color}, 0 0 2px #FFFFFF`
              }}
            />
          )}
        </div>
      ))}

      {/* Speech Bubble on Click */}
      {showBubble && (
        <div className={`absolute -top-16 sm:-top-20 ${isRight ? 'right-2 sm:right-4' : 'left-2 sm:left-4'} w-56 sm:w-64 p-2.5 rounded-2xl bg-gradient-to-r from-rose-700 via-red-700 to-amber-600 text-white shadow-2xl border border-yellow-300 text-center animate-in fade-in zoom-in-95 duration-200 z-50`}>
          <p className="text-[11px] sm:text-xs font-black tracking-wide leading-tight">
            {bubbleText}
          </p>
          <div className={`absolute -bottom-2 ${isRight ? 'right-8' : 'left-8'} w-3 h-3 bg-red-700 rotate-45 border-r border-b border-yellow-300`} />
        </div>
      )}

      {/* Main Interactive Button — Free-Floating with NO Card / Container */}
      <button
        type="button"
        onClick={handleClick}
        onDoubleClick={onOpenModal}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-all duration-300 ${
          isPulsing ? 'animate-rakhi-pulse' : 'hover:scale-105 active:scale-95'
        }`}
        title="Royal 925 Silver Rakhi & Pooja Thali • Click for sacred blessings, Double-click for Rakhi collection"
        aria-label="Pure Silver Rakhi Motif"
      >
        {/* Soft Ambient Rose-Gold Radial Glow (No box) */}
        <div className="absolute inset-0 rounded-full blur-3xl bg-gradient-to-r from-rose-600/30 via-red-500/25 to-amber-500/25 pointer-events-none" />

        {/* Handcrafted Vector Artwork: Royal Silver Rakhi & Pooja Thali */}
        <div className={`relative w-32 h-36 sm:w-40 sm:h-44 overflow-visible animate-rakhi-hover ${isRight ? 'scale-x-[-1]' : ''}`}>
          <svg
            viewBox="0 0 220 250"
            className="w-full h-full overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: 'drop-shadow(0 4px 14px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.95))'
            }}
          >
            <defs>
              {/* Pure 925 Sterling Silver Gradient */}
              <linearGradient id={`rakhiSilver-${idPrefix}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="#E2E8F0" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>

              {/* Auspicious Imperial Gold Gradient */}
              <linearGradient id={`rakhiGold-${idPrefix}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9C4" />
                <stop offset="50%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>

              {/* Sacred Roli Kumkum Vermilion Gradient */}
              <linearGradient id={`roliRed-${idPrefix}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDA4AF" />
                <stop offset="50%" stopColor="#E11D48" />
                <stop offset="100%" stopColor="#9F1239" />
              </linearGradient>

              {/* Sacred Moli Ribbon Gradient (Crimson & Amber) */}
              <linearGradient id={`moliSilk-${idPrefix}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#B91C1C" />
              </linearGradient>

              {/* Diya Flame Radiant Gradient */}
              <linearGradient id={`diyaFlame-${idPrefix}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#FEF08A" />
                <stop offset="70%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>

            {/* ======================================================== */}
            {/* 1. SILVER POOJA THALI BASE WITH ROLI, CHAWAL & SWEETS     */}
            {/* ======================================================== */}
            <g id="poojaThali" transform="translate(110, 180)">
              {/* Silver Thali Platter */}
              <ellipse cx="0" cy="18" rx="72" ry="24" fill={`url(#rakhiSilver-${idPrefix})`} stroke="#64748B" strokeWidth="1.2" />
              <ellipse cx="0" cy="15" rx="64" ry="20" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="0.8" />
              {/* Golden Filigree Rim with Dashed Trim */}
              <ellipse cx="0" cy="18" rx="69" ry="23" fill="none" stroke={`url(#rakhiGold-${idPrefix})`} strokeWidth="1.2" strokeDasharray="3 2" />

              {/* Sacred Roli (Kumkum) Katori on Left */}
              <ellipse cx="-38" cy="12" rx="14" ry="7" fill={`url(#rakhiSilver-${idPrefix})`} stroke="#94A3B8" strokeWidth="0.8" />
              <ellipse cx="-38" cy="10" rx="12" ry="5.5" fill={`url(#roliRed-${idPrefix})`} />
              <circle cx="-38" cy="8" r="2.2" fill="#FFE4E6" opacity="0.85" />

              {/* Akshat (Unbroken Sacred Rice) Katori in Center Back */}
              <ellipse cx="0" cy="4" rx="14" ry="7" fill={`url(#rakhiSilver-${idPrefix})`} stroke="#94A3B8" strokeWidth="0.8" />
              <ellipse cx="0" cy="2" rx="12" ry="5.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.5" />
              {/* Rice grains details */}
              <ellipse cx="-3" cy="2" rx="2.5" ry="1.2" fill="#FEF9C3" />
              <ellipse cx="2" cy="1" rx="2.5" ry="1.2" fill="#FEF9C3" />
              <ellipse cx="0" cy="3" rx="2.2" ry="1.2" fill="#FEF9C3" />

              {/* Kaju Katli Sweet with Pure Silver Vark on Right */}
              <g transform="translate(36, 12)">
                <polygon points="0,-8 14,0 0,8 -14,0" fill="#FDE68A" stroke="#D97706" strokeWidth="0.8" />
                {/* Genuine Pure Silver Leaf Vark Overlay */}
                <polygon points="-8,-4 8,-4 10,2 -6,4" fill="#FFFFFF" opacity="0.85" />
                <polygon points="-3,-1 11,1 5,6 -9,3" fill={`url(#rakhiSilver-${idPrefix})`} opacity="0.75" />
              </g>

              {/* Burning Sacred Silver Diya in Front */}
              <g transform="translate(-10, 22)">
                <ellipse cx="0" cy="4" rx="12" ry="5" fill={`url(#rakhiGold-${idPrefix})`} stroke="#78350F" strokeWidth="0.8" />
                <path d="M -10 4 C -10 -2, 10 -2, 10 4 Z" fill={`url(#rakhiGold-${idPrefix})`} />
                {/* Cotton Wick */}
                <line x1="0" y1="2" x2="0" y2="-3" stroke="#451A03" strokeWidth="1.2" strokeLinecap="round" />
                {/* Glowing Flame */}
                <g className="animate-diya-flame" transform="translate(0, -4)">
                  <path d="M 0 -14 C 4 -8, 5 -3, 0 0 C -5 -3, -4 -8, 0 -14 Z" fill={`url(#diyaFlame-${idPrefix})`} style={{ filter: 'drop-shadow(0 0 6px #F59E0B)' }} />
                  <circle cx="0" cy="-4" r="2.2" fill="#FFFFFF" opacity="0.9" />
                </g>
              </g>
            </g>

            {/* ======================================================== */}
            {/* 2. ROYAL 925 STERLING SILVER DESIGNER RAKHI (Centerpiece) */}
            {/* ======================================================== */}
            <g id="silverRakhi" transform="translate(110, 95)">
              {/* Radiating Auspicious Red & Gold Silk Moli (Kalawa) Threads */}
              <g className="animate-moli-sway">
                {/* Left Flowing Thread */}
                <path
                  d="M -30 0 Q -60 -18 -85 -10 Q -95 -6 -105 -18"
                  stroke="url(#moliSilk-l)"
                  strokeWidth="3.2"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M -30 2 Q -60 -16 -85 -8 Q -95 -4 -105 -16"
                  stroke={`url(#rakhiGold-${idPrefix})`}
                  strokeWidth="1.2"
                  fill="none"
                  strokeDasharray="4 3"
                />
                {/* Golden End Tassel Left */}
                <circle cx="-105" cy="-18" r="3.2" fill={`url(#rakhiGold-${idPrefix})`} />
                <path d="M -105 -18 L -115 -25 M -105 -18 L -118 -20 M -105 -18 L -114 -14" stroke="#DC2626" strokeWidth="1.2" />

                {/* Right Flowing Thread */}
                <path
                  d="M 30 0 Q 60 18 85 10 Q 95 6 105 18"
                  stroke="url(#moliSilk-r)"
                  strokeWidth="3.2"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 30 2 Q 60 20 85 12 Q 95 8 105 20"
                  stroke={`url(#rakhiGold-${idPrefix})`}
                  strokeWidth="1.2"
                  fill="none"
                  strokeDasharray="4 3"
                />
                {/* Golden End Tassel Right */}
                <circle cx="105" cy="18" r="3.2" fill={`url(#rakhiGold-${idPrefix})`} />
                <path d="M 105 18 L 115 25 M 105 18 L 118 20 M 105 18 L 114 14" stroke="#DC2626" strokeWidth="1.2" />
              </g>

              {/* Accent Beads on Either Side (Rudraksha, Pearl & Silver Spacer Beads) */}
              {/* Left Beads */}
              <circle cx="-38" cy="0" r="4.2" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="0.8" />
              <circle cx="-30" cy="0" r="5" fill="#78350F" stroke="#451A03" strokeWidth="0.8" />
              <circle cx="-23" cy="0" r="3.5" fill={`url(#rakhiGold-${idPrefix})`} />

              {/* Right Beads */}
              <circle cx="23" cy="0" r="3.5" fill={`url(#rakhiGold-${idPrefix})`} />
              <circle cx="30" cy="0" r="5" fill="#78350F" stroke="#451A03" strokeWidth="0.8" />
              <circle cx="38" cy="0" r="4.2" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="0.8" />

              {/* 8 Floral Silver Petals Outer Mandala Filigree */}
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = i * 45;
                return (
                  <g key={`petal-${i}`} transform={`rotate(${angle})`}>
                    <path
                      d="M 0 -24 C 6 -18, 6 -12, 0 -8 C -6 -12, -6 -18, 0 -24 Z"
                      fill={`url(#rakhiSilver-${idPrefix})`}
                      stroke="#64748B"
                      strokeWidth="0.8"
                    />
                    <circle cx="0" cy="-20" r="1.5" fill={`url(#rakhiGold-${idPrefix})`} />
                  </g>
                );
              })}

              {/* Silver Base Disc with Filigree Rim */}
              <circle cx="0" cy="0" r="14" fill={`url(#rakhiSilver-${idPrefix})`} stroke="#475569" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="12" fill="none" stroke={`url(#rakhiGold-${idPrefix})`} strokeWidth="1" strokeDasharray="3 2" />

              {/* Auspicious Red Velvet / Enamel Center Disc */}
              <circle cx="0" cy="0" r="9.5" fill={`url(#roliRed-${idPrefix})`} stroke="#881337" strokeWidth="0.8" />

              {/* Sacred Golden Floral Motif / OM Centerpiece */}
              <circle cx="0" cy="0" r="5" fill={`url(#rakhiGold-${idPrefix})`} />
              {/* Brilliant Sparkling Diamond CZ Center Gem */}
              <polygon points="0,-3.5 2.5,-1 3.5,0 2.5,1 0,3.5 -2.5,1 -3.5,0 -2.5,-1" fill="#FFFFFF" style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }} />
              <circle cx="0" cy="0" r="1" fill="#E0F2FE" />
            </g>

            {/* ======================================================== */}
            {/* 3. FLOATING AUSPICIOUS ROLI-CHAWAL & GOLDEN SPARKLES       */}
            {/* ======================================================== */}
            <g id="sparkleAccents">
              <polygon points="45,45 47,49 51,50 48,53 49,57 45,55 41,57 42,53 39,50 43,49" fill="#FACC15" style={{ filter: 'drop-shadow(0 0 4px #FACC15)' }} />
              <polygon points="175,55 176,58 179,59 177,61 177,64 175,62 173,64 174,61 172,59 174,58" fill="#F43F5E" />
              <circle cx="65" cy="75" r="2.5" fill="#FFFFFF" opacity="0.9" />
              <circle cx="160" cy="70" r="2.5" fill="#FEF08A" opacity="0.9" />
              <circle cx="108" cy="35" r="2" fill="#FFFFFF" opacity="0.85" />
            </g>
          </svg>
        </div>
      </button>
    </div>
  );
}
