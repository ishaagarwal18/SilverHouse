import React, { useState } from 'react';

/**
 * PatrioticFlagMotif - Pure Waving Indian National Flag (Tiranga)
 * Positioned on bottom-left corner during Republic & Independence Day Festival Mode.
 * 
 * Features:
 * - Clean, pure Indian Tricolor Flag on an ornamental silver flagpole with golden finial
 * - Realistic fluttering wave animation
 * - Completely free-floating transparent illustration (NO cards, NO boxes)
 * - Interactive on CLICK:
 *   1. Patriotic bugle salute chime (Web Audio API)
 *   2. Flag wave burst animation
 *   3. 40+ Tricolor confetti shower
 *   4. Speech bubble with patriotic cheer
 */
export default function PatrioticFlagMotif({ onOpenModal }) {
  const [isWaving, setIsWaving] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Jai Hind! Vande Mataram! 🇮🇳');
  const [showBubble, setShowBubble] = useState(false);

  const PATRIOTIC_WISHES = [
    'Jai Hind! Vande Mataram! 🇮🇳',
    'Vijayi Vishwa Tiranga Pyaara! 🚩',
    'Har Ghar Tiranga, Har Dil Tiranga! ✨',
    'Proud to be an Indian! 🇮🇳',
    'Bharat Mata Ki Jai! 🌟'
  ];

  // Synthesize military brass bugle salute fanfare via Web Audio API
  const playBugleFanfare = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Classic fanfare: C4 -> G4 -> C5 -> G5
      const notes = [
        { freq: 261.63, start: 0, dur: 0.14 },
        { freq: 392.00, start: 0.14, dur: 0.14 },
        { freq: 523.25, start: 0.28, dur: 0.18 },
        { freq: 783.99, start: 0.46, dur: 0.55 },
      ];

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note.freq, now + note.start);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now + note.start);
        filter.Q.setValueAtTime(2.5, now + note.start);

        gain.gain.setValueAtTime(0.001, now + note.start);
        gain.gain.linearRampToValueAtTime(0.22, now + note.start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.start);
        osc.stop(now + note.start + note.dur);
      });
    } catch {
      // Audio fallback
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();

    // 1. Play sound
    playBugleFanfare();

    // 2. Trigger waving flutter
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 1200);

    // 3. Show Speech Bubble
    const randomWish = PATRIOTIC_WISHES[Math.floor(Math.random() * PATRIOTIC_WISHES.length)];
    setBubbleText(randomWish);
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 3800);

    // 4. Generate Tricolor Confetti
    const colors = ['#FF9933', '#FFFFFF', '#138808', '#000080', '#FFD700'];
    const newParticles = Array.from({ length: 42 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 42 + (Math.random() * 0.3 - 0.15);
      const velocity = 50 + Math.random() * 80;
      return {
        id: Date.now() + i,
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity - 20,
        color: colors[i % colors.length],
        size: 5 + Math.random() * 6,
        rotation: Math.random() * 360,
        type: i % 2 === 0 ? 'flag' : 'circle'
      };
    });
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1400);
  };

  return (
    <div className="fixed bottom-2 left-2 sm:bottom-4 sm:left-4 z-40 select-none pointer-events-auto">
      {/* Keyframe Animations */}
      <style>{`
        @keyframes flagFlutterPure {
          0%, 100% {
            transform: skewY(0deg) rotate(0deg);
          }
          25% {
            transform: skewY(-3deg) rotate(1.5deg);
          }
          50% {
            transform: skewY(2deg) rotate(-1deg);
          }
          75% {
            transform: skewY(-2deg) rotate(2deg);
          }
        }
        @keyframes flagStaffGentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(-1deg); }
        }
        .animate-pure-flag-wave {
          animation: flagFlutterPure 2.8s ease-in-out infinite;
          transform-origin: left center;
        }
        .animate-pure-flag-soar {
          animation: flagStaffGentle 3.6s ease-in-out infinite;
        }
      `}</style>

      {/* Confetti Explosion Shower */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: '50%',
            top: '40%',
            transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`,
            transition: 'all 1.4s cubic-bezier(0.1, 0.8, 0.3, 1)',
            opacity: particles.length > 0 ? 1 : 0,
            pointerEvents: 'none',
            zIndex: 60
          }}
        >
          {p.type === 'flag' ? (
            <div className="flex flex-col w-4 h-3 rounded-xs overflow-hidden shadow-xs">
              <div className="h-1 bg-[#FF9933]" />
              <div className="h-1 bg-[#FFFFFF] flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#000080]" />
              </div>
              <div className="h-1 bg-[#138808]" />
            </div>
          ) : (
            <div
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                borderRadius: '50%',
                boxShadow: `0 0 5px ${p.color}`
              }}
            />
          )}
        </div>
      ))}

      {/* Speech Bubble on Click */}
      {showBubble && (
        <div className="absolute -top-14 left-2 sm:left-4 w-56 sm:w-64 p-2.5 rounded-2xl bg-gradient-to-r from-orange-600 via-slate-900 to-emerald-700 text-white shadow-2xl border border-yellow-300 text-center animate-in fade-in zoom-in-95 duration-200 z-50">
          <p className="text-[11px] sm:text-xs font-black tracking-wide leading-tight">
            {bubbleText}
          </p>
          <div className="absolute -bottom-2 left-8 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-yellow-300" />
        </div>
      )}

      {/* Main Interactive Button — Free-Floating with NO Card / Container */}
      <button
        type="button"
        onClick={handleClick}
        onDoubleClick={onOpenModal}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-all duration-300 ${
          isWaving ? 'scale-110' : 'hover:scale-105 active:scale-95'
        }`}
        title="Indian National Flag (Tiranga) • Click to salute, Double-click for national keepsakes"
        aria-label="Indian National Flag"
      >
        {/* Soft Ambient Radial Glow (No box) */}
        <div className="absolute inset-0 rounded-full blur-2xl bg-gradient-to-r from-orange-500/25 via-yellow-400/20 to-emerald-500/25 pointer-events-none" />

        {/* Handcrafted Vector Artwork: Pure Waving Flag & Silver Flagpole */}
        <div className="relative w-28 h-32 sm:w-36 sm:h-40 overflow-visible animate-pure-flag-soar">
          <svg
            viewBox="0 0 160 180"
            className="w-full h-full overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.9))'
            }}
          >
            <defs>
              <linearGradient id="silverPoleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="#E2E8F0" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>

              <linearGradient id="goldFinialBall" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9C4" />
                <stop offset="50%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>

              <linearGradient id="flagSaffron" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FED7AA" />
                <stop offset="30%" stopColor="#FF9933" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>

              <linearGradient id="flagWhite" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#F8FAFC" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>

              <linearGradient id="flagGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#86EFAC" />
                <stop offset="40%" stopColor="#138808" />
                <stop offset="100%" stopColor="#14532D" />
              </linearGradient>
            </defs>

            {/* 1. ORNAMENTAL SILVER FLAGSTAFF */}
            <g id="flagstaff">
              {/* Stand Base */}
              <ellipse cx="28" cy="168" rx="16" ry="6" fill="url(#silverPoleGrad)" stroke="#475569" strokeWidth="1" />
              <ellipse cx="28" cy="165" rx="11" ry="3.5" fill="url(#goldFinialBall)" stroke="#78350F" strokeWidth="0.8" />

              {/* Main Silver Mast */}
              <line x1="28" y1="12" x2="28" y2="166" stroke="url(#silverPoleGrad)" strokeWidth="4" strokeLinecap="round" />
              <line x1="26.5" y1="14" x2="26.5" y2="164" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />

              {/* Golden Spearhead / Finial Ball Top */}
              <circle cx="28" cy="12" r="5.5" fill="url(#goldFinialBall)" stroke="#78350F" strokeWidth="0.8" />
              <polygon points="28,2 32,10 24,10" fill="url(#goldFinialBall)" stroke="#78350F" strokeWidth="0.8" />
            </g>

            {/* 2. PROUD WAVING INDIAN TRICOLOR (TIRANGA) */}
            <g id="tiranga" className="animate-pure-flag-wave" transform="translate(30, 16)">
              {/* Shadow Ripple Overlay */}
              <path
                d="M 0 0 C 35 -6, 75 8, 115 0 L 115 72 C 75 80, 35 66, 0 72 Z"
                fill="none"
              />

              {/* Top Band: Deep Saffron (Kesari) */}
              <path
                d="M 0 0 C 35 -6, 75 8, 115 0 L 115 24 C 75 32, 35 18, 0 24 Z"
                fill="url(#flagSaffron)"
                stroke="#C2410C"
                strokeWidth="0.8"
              />

              {/* Middle Band: Pure White */}
              <path
                d="M 0 24 C 35 18, 75 32, 115 24 L 115 48 C 75 56, 35 42, 0 48 Z"
                fill="url(#flagWhite)"
                stroke="#CBD5E1"
                strokeWidth="0.8"
              />

              {/* Bottom Band: India Green */}
              <path
                d="M 0 48 C 35 42, 75 56, 115 48 L 115 72 C 75 80, 35 66, 0 72 Z"
                fill="url(#flagGreen)"
                stroke="#14532D"
                strokeWidth="0.8"
              />

              {/* Gold Fringe Tassel along the fly edge */}
              <line x1="115" y1="0" x2="115" y2="72" stroke="url(#goldFinialBall)" strokeWidth="1.8" />

              {/* 3. NAVY BLUE ASHOKA CHAKRA (24 SPOKES) ON WHITE BAND */}
              <g transform="translate(56, 37)">
                {/* Outer Navy Ring */}
                <circle cx="0" cy="0" r="10.5" fill="none" stroke="#000080" strokeWidth="2.2" />

                {/* 24 Spokes */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * Math.PI) / 12;
                  return (
                    <line
                      key={`flagSpoke-${i}`}
                      x1={-9.5 * Math.cos(angle)}
                      y1={-9.5 * Math.sin(angle)}
                      x2={9.5 * Math.cos(angle)}
                      y2={9.5 * Math.sin(angle)}
                      stroke="#000080"
                      strokeWidth="1.1"
                    />
                  );
                })}

                {/* Center Hub */}
                <circle cx="0" cy="0" r="2.8" fill="#000080" />
                <circle cx="0" cy="0" r="1" fill="#FFFFFF" />
              </g>

              {/* Realistic Fabric Ripple Shading */}
              <path
                d="M 35 0 C 45 4, 45 20, 35 24 C 45 28, 45 44, 35 48 C 45 52, 45 68, 35 72"
                stroke="rgba(0,0,0,0.12)"
                strokeWidth="4"
                fill="none"
              />
              <path
                d="M 75 0 C 85 4, 85 20, 75 24 C 85 28, 85 44, 75 48 C 85 52, 85 68, 75 72"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="4"
                fill="none"
              />
            </g>
          </svg>
        </div>
      </button>
    </div>
  );
}
