import React, { useState } from 'react';

/**
 * PatrioticChakraMotif - Pure 24-Spoke Ashok Chakra (Dharma Chakra)
 * Positioned on bottom-right corner during Republic & Independence Day Festival Mode.
 * 
 * Features:
 * - Clean, pure, majestic 24-spoke Navy Blue Ashok Chakra (#000080)
 * - Fine 999 polished silver and gold protective rim
 * - STATIC (NON-ROTATING): Crisp, centered, perfectly aligned
 * - Completely free-floating transparent illustration (NO cards, NO boxes)
 * - Interactive on CLICK:
 *   1. Sacred resonant silver bell chime (Web Audio API)
 *   2. Gentle golden glow pulse
 *   3. 40+ Floating Saffron, White, Emerald, and Gold sparkles shower
 *   4. Speech bubble with sacred national mottos
 */
export default function PatrioticChakraMotif({ onOpenModal }) {
  const [isGlowing, setIsGlowing] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('सत्यमेव जयते • Dharma Chakra ☸️');
  const [showBubble, setShowBubble] = useState(false);

  const CHAKRA_MOTTOS = [
    'सत्यमेव जयते • Dharma Chakra ☸️',
    '24 Spokes of Righteous Progress! ✨',
    'Eternal Truth, Peace & Sovereign Strength! 🇮🇳',
    'Pure 999 Silver • Hallmarked National Pride! 💎',
    'Jai Hind! Saluting the Wheel of Dharma! 🌟'
  ];

  // Synthesize sacred bell chime via Web Audio API
  const playChakraChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Resonant bell tone (523.25Hz & 1046.5Hz harmonic)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.exponentialRampToValueAtTime(518, now + 1.2);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.28, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 1.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1046.5, now);
      osc2.frequency.exponentialRampToValueAtTime(1318.5, now + 0.5);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.linearRampToValueAtTime(0.18, now + 0.03);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.9);
    } catch {
      // Audio fallback
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();

    // 1. Play sound
    playChakraChime();

    // 2. Trigger glow pulse
    setIsGlowing(true);
    setTimeout(() => setIsGlowing(false), 1000);

    // 3. Show Speech Bubble
    const randomMotto = CHAKRA_MOTTOS[Math.floor(Math.random() * CHAKRA_MOTTOS.length)];
    setBubbleText(randomMotto);
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 3800);

    // 4. Generate 40+ Tricolor & Gold celebration sparkles
    const colors = ['#FF9933', '#FFFFFF', '#138808', '#000080', '#FFD700', '#F3F4F6'];
    const newParticles = Array.from({ length: 42 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 42 + (Math.random() * 0.4 - 0.2);
      const velocity = 50 + Math.random() * 80;
      return {
        id: Date.now() + i,
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity - 20,
        color: colors[i % colors.length],
        size: 5 + Math.random() * 6,
        rotation: Math.random() * 360,
        type: i % 3 === 0 ? 'chakra' : 'circle'
      };
    });
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1500);
  };

  return (
    <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-40 select-none pointer-events-auto">
      {/* Keyframe Animations (Gentle hover only, NO rotation) */}
      <style>{`
        @keyframes chakraHoverGentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .animate-chakra-gentle-hover {
          animation: chakraHoverGentle 3.6s ease-in-out infinite;
        }
      `}</style>

      {/* Particle Explosion Shower */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`,
            transition: 'all 1.4s cubic-bezier(0.1, 0.8, 0.3, 1)',
            opacity: particles.length > 0 ? 1 : 0,
            pointerEvents: 'none',
            zIndex: 60
          }}
        >
          {p.type === 'chakra' ? (
            <svg width={p.size * 2} height={p.size * 2} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#000080" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="2" fill="#000080" />
              {Array.from({ length: 8 }).map((_, spokeIdx) => (
                <line
                  key={spokeIdx}
                  x1={12}
                  y1={12}
                  x2={12 + 8 * Math.cos((spokeIdx * Math.PI) / 4)}
                  y2={12 + 8 * Math.sin((spokeIdx * Math.PI) / 4)}
                  stroke="#000080"
                  strokeWidth="1.2"
                />
              ))}
            </svg>
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
        <div className="absolute -top-14 right-2 sm:right-4 w-56 sm:w-64 p-2.5 rounded-2xl bg-gradient-to-r from-orange-600 via-slate-900 to-emerald-700 text-white shadow-2xl border border-yellow-300 text-center animate-in fade-in zoom-in-95 duration-200 z-50">
          <p className="text-[11px] sm:text-xs font-black tracking-wide leading-tight">
            {bubbleText}
          </p>
          <div className="absolute -bottom-2 right-8 w-3 h-3 bg-emerald-700 rotate-45 border-r border-b border-yellow-300" />
        </div>
      )}

      {/* Main Interactive Button — Free-Floating with NO Card / Container */}
      <button
        type="button"
        onClick={handleClick}
        onDoubleClick={onOpenModal}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-all duration-300 ${
          isGlowing ? 'scale-110' : 'hover:scale-105 active:scale-95'
        }`}
        title="Ashok Chakra (Dharma Chakra) • Double-click for national keepsakes"
        aria-label="Ashok Chakra Motif"
      >
        {/* Soft Ambient Radial Glow (No box) */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 pointer-events-none ${
            isGlowing
              ? 'bg-gradient-to-r from-sky-400/50 via-blue-500/40 to-indigo-500/50 scale-125'
              : 'bg-gradient-to-r from-sky-500/25 via-blue-600/20 to-indigo-500/25 scale-100'
          }`}
        />

        {/* Handcrafted Vector Artwork: Pure 24-Spoke Ashok Chakra with Fine Silver & Gold Rim */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 overflow-visible animate-chakra-gentle-hover">
          <svg
            viewBox="0 0 160 160"
            className="w-full h-full overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: 'drop-shadow(0 4px 14px rgba(0, 0, 128, 0.45)) drop-shadow(0 0 3px rgba(255, 255, 255, 0.95))'
            }}
          >
            <defs>
              <linearGradient id="silverRimChakra" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="#E2E8F0" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>

              <linearGradient id="goldRimChakra" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9C4" />
                <stop offset="50%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>

              <radialGradient id="chakraHubGleam" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="60%" stopColor="#000080" />
                <stop offset="100%" stopColor="#000050" />
              </radialGradient>
            </defs>

            {/* Outer Protective Fine Silver & Gold Accent Ring */}
            <circle cx="80" cy="80" r="76" fill="none" stroke="url(#goldRimChakra)" strokeWidth="2.5" />
            <circle cx="80" cy="80" r="73" fill="none" stroke="url(#silverRimChakra)" strokeWidth="3.5" />
            <circle cx="80" cy="80" r="69.5" fill="none" stroke="#FFFFFF" strokeWidth="1" />

            {/* Inner Backing Pure White Disc */}
            <circle cx="80" cy="80" r="68" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.8" />

            {/* THE STATIC 24-SPOKE NAVY BLUE ASHOK CHAKRA (Perfect Center at 80, 80 with ZERO Rotation) */}
            <g transform="translate(80, 80)">
              {/* Outer Deep Navy Blue Rim */}
              <circle cx="0" cy="0" r="62" fill="none" stroke="#000080" strokeWidth="4.2" />

              {/* 24 Triangular Petals along the outer edge (Classic Ashoka Pillar design) */}
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * Math.PI * 2) / 24;
                const rOuter = 61.5;
                const rInner = 56;
                const halfSpread = Math.PI / 48;

                const xTip = rOuter * Math.cos(angle);
                const yTip = rOuter * Math.sin(angle);
                const xBase1 = rInner * Math.cos(angle - halfSpread);
                const yBase1 = rInner * Math.sin(angle - halfSpread);
                const xBase2 = rInner * Math.cos(angle + halfSpread);
                const yBase2 = rInner * Math.sin(angle + halfSpread);

                return (
                  <polygon
                    key={`petal-${i}`}
                    points={`${xTip},${yTip} ${xBase1},${yBase1} ${xBase2},${yBase2}`}
                    fill="#000080"
                  />
                );
              })}

              {/* Inner Rim */}
              <circle cx="0" cy="0" r="56" fill="none" stroke="#000080" strokeWidth="1.8" />

              {/* ALL 24 RADIAL SPOKES */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * Math.PI) / 12;
                return (
                  <line
                    key={`chakraSpoke-${i}`}
                    x1={-54 * Math.cos(angle)}
                    y1={-54 * Math.sin(angle)}
                    x2={54 * Math.cos(angle)}
                    y2={54 * Math.sin(angle)}
                    stroke="#000080"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Central Hub Outer Ring */}
              <circle cx="0" cy="0" r="15" fill="#FFFFFF" stroke="#000080" strokeWidth="2.8" />

              {/* Central Solid Navy Hub Disc */}
              <circle cx="0" cy="0" r="10" fill="url(#chakraHubGleam)" stroke="#000080" strokeWidth="1" />

              {/* Center White Core Bead */}
              <circle cx="0" cy="0" r="3.2" fill="#FFFFFF" />
            </g>

            {/* Specular Light Reflection Flare across the Glass / Silver Lens */}
            <path
              d="M 35 45 C 50 25, 95 20, 125 35 C 105 32, 60 38, 35 45 Z"
              fill="#FFFFFF"
              opacity="0.5"
            />
          </svg>
        </div>
      </button>
    </div>
  );
}
