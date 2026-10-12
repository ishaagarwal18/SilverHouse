import React, { useState } from 'react';
import { Sparkles, Flame, Heart } from 'lucide-react';

/**
 * DiwaliDiyaMotif - Auspicious Royal Akhand Deepam with Sacred Lotus Pedestal
 * Positioned on the bottom-left corner during Diwali Festival Mode.
 * 
 * Features:
 * - Handcrafted illustrated royal Indian Deepam in authentic folk art style:
 *   Rich terracotta, 22k temple brass, scalloped golden pearl borders,
 *   wavy ethnic bands with golden dots, and an ornate carved lotus pedestal (Kamal Asana).
 * - Multi-layered dancing sacred flame (Akhand Jyoti) with core gleam & ember flickers.
 * - Floating golden crystal stars, diamond sparkles & rising micro-sparks around the flame.
 * - Interactive on CLICK:
 *   1. Temple Ghanta / Bell Chime with harmonic resonance (Web Audio API).
 *   2. Divine Sunbeam Light Rays burst & rotate outwards from the flame.
 *   3. 50+ Sacred Festive Particles (fluttering saffron Marigold petals, 8-point golden stars,
 *      radiant embers) shoot up & gracefully swirl across the screen!
 *   4. Auspicious speech callout with joyful Deepavali blessings.
 */
export default function DiwaliDiyaMotif({ onOpenModal }) {
  const [isBlessing, setIsBlessing] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Shubh Deepavali! 🪔');
  const [showBubble, setShowBubble] = useState(false);

  const DIWALI_BLESSINGS = [
    'Shubh Deepavali! Divine Light & Joy! 🪔',
    'Maa Lakshmi Blessings & Prosperity! ✨',
    'Tamaso Ma Jyotirgamaya! 🌟',
    'May Your Home Glow with Abundance! 💛',
    'Auspicious Deepam Blessings! 🪔'
  ];

  // Synthesize realistic Mandir Aarti Pooja Ghanti (triple-strike brass bell + soft flame ignite)
  const playDiyaAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Soft Warm Flame Ignite Whoosh (Gentle sacred flame catching light)
      const bufferSize = ctx.sampleRate * 0.28;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.07));
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(340, now);
      filter.Q.setValueAtTime(1.8, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.16, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start(now);

      // 2. Sacred Aarti Pooja Ghanti: Rhythmic Triple Chime (Ting... Ting-Ting... Tiiing)
      // Strikes at: 0.03s (light prep), 0.16s (medium), 0.32s (accentuated resonant chime)
      const strikes = [
        { time: 0.03, gainScale: 0.42, ringDuration: 0.75 },
        { time: 0.16, gainScale: 0.62, ringDuration: 1.0 },
        { time: 0.32, gainScale: 0.95, ringDuration: 2.5 }
      ];

      // Brass bell acoustic inharmonic partial ratios with natural chorus detune
      // Base root: 784 Hz (G5 note - joyful, auspicious temple scale)
      const baseFreq = 784;
      const partials = [
        { ratio: 0.5, amp: 0.22 },   // Hum tone (deep foundation)
        { ratio: 1.0, amp: 0.35 },   // Prime / fundamental
        { ratio: 1.19, amp: 0.25 },  // Minor third (sweet warmth)
        { ratio: 1.51, amp: 0.18 },  // Fifth (harmony)
        { ratio: 2.02, amp: 0.22 },  // Nominal octave
        { ratio: 2.74, amp: 0.12 },  // Supernominal brass chime
        { ratio: 3.86, amp: 0.08 }   // High metallic shimmer
      ];

      strikes.forEach(({ time: strikeTime, gainScale, ringDuration }) => {
        const t = now + strikeTime;

        // Strike impact transient (crisp clapper tap)
        const clapper = ctx.createOscillator();
        const clapperGain = ctx.createGain();
        clapper.type = 'triangle';
        clapper.frequency.setValueAtTime(2200, t);
        clapper.frequency.exponentialRampToValueAtTime(600, t + 0.032);
        clapperGain.gain.setValueAtTime(0.12 * gainScale, t);
        clapperGain.gain.exponentialRampToValueAtTime(0.001, t + 0.038);
        clapper.connect(clapperGain);
        clapperGain.connect(ctx.destination);
        clapper.start(t);
        clapper.stop(t + 0.042);

        // Acoustic brass resonance modes with natural beat tremolo
        partials.forEach(({ ratio, amp }, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          // Alternating detune (+1.2Hz / -1.2Hz) gives rich acoustic shimmer
          const detune = idx % 2 === 0 ? 1.4 : -1.4;
          const freq = baseFreq * ratio + detune;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);

          const peakGain = 0.22 * amp * gainScale;
          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.linearRampToValueAtTime(peakGain, t + 0.006);
          // Higher partials decay faster, root hum & prime linger longer
          const decay = ringDuration / Math.sqrt(ratio);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + decay + 0.05);
        });
      });
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  };

  const handleDiyaClick = (e) => {
    setIsBlessing(true);
    playDiyaAudio();

    const randomGreeting = DIWALI_BLESSINGS[Math.floor(Math.random() * DIWALI_BLESSINGS.length)];
    setBubbleText(randomGreeting);
    setShowBubble(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width * 0.5;
    const originY = rect.top + rect.height * 0.32;

    // 50+ dynamic particles: Marigold flower petals, golden 8-point stars, and glowing flame sparks
    const newParticles = Array.from({ length: 50 }).map((_, i) => {
      // Angle: Mostly upwards and fanning into the screen (-135 to -15 degrees)
      const angleDeg = -140 + Math.random() * 125;
      const angleRad = (angleDeg * Math.PI) / 180;
      // Distance: 150px to 480px fanning across screen
      const distance = 150 + Math.random() * 340;
      const tx = Math.cos(angleRad) * distance;
      const ty = Math.sin(angleRad) * distance;

      return {
        id: Date.now() + Math.random(),
        startX: originX,
        startY: originY,
        tx,
        ty,
        size: Math.random() * 14 + 7,
        color: ['#FFB300', '#FFA000', '#FF8F00', '#FF6D00', '#FF3D00', '#FFD54F', '#FFF9C4', '#F43F5E'][i % 8],
        duration: 1.3 + Math.random() * 0.85,
        delay: Math.random() * 0.28,
        type: i % 3 === 0 ? 'marigold' : i % 3 === 1 ? 'star' : 'spark'
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
      {/* Keyframe Animations for Flame Flickering, Sunbeams & Floating Petals */}
      <style>{`
        @keyframes diyaFlameOrganicFlicker {
          0%, 100% {
            transform: scale(1) rotate(0deg) skewX(0deg);
            filter: drop-shadow(0 0 10px rgba(255, 179, 0, 0.9)) drop-shadow(0 0 20px rgba(255, 102, 0, 0.6));
          }
          20% {
            transform: scale(1.06, 0.95) rotate(-2deg) skewX(-1.5deg);
            filter: drop-shadow(0 0 14px rgba(255, 193, 7, 1)) drop-shadow(0 0 26px rgba(255, 87, 34, 0.75));
          }
          45% {
            transform: scale(0.96, 1.07) rotate(2.2deg) skewX(2deg);
            filter: drop-shadow(0 0 16px rgba(255, 235, 59, 1)) drop-shadow(0 0 28px rgba(255, 152, 0, 0.85));
          }
          70% {
            transform: scale(1.04, 0.97) rotate(-1.5deg) skewX(-1deg);
            filter: drop-shadow(0 0 12px rgba(255, 179, 0, 0.9)) drop-shadow(0 0 22px rgba(255, 102, 0, 0.6));
          }
          85% {
            transform: scale(0.97, 1.03) rotate(1.2deg) skewX(0.8deg);
            filter: drop-shadow(0 0 14px rgba(255, 193, 7, 0.95)) drop-shadow(0 0 25px rgba(255, 87, 34, 0.7));
          }
        }

        @keyframes diyaBlessingPulse {
          0% { transform: scale(1) translateY(0); }
          25% { transform: scale(1.1, 0.94) translateY(4px); }
          50% { transform: scale(0.96, 1.12) translateY(-10px); }
          75% { transform: scale(1.04, 0.97) translateY(-3px); }
          100% { transform: scale(1) translateY(0); }
        }

        @keyframes sunbeamsRadiate {
          0% { transform: rotate(0deg) scale(0.7); opacity: 0; }
          25% { transform: rotate(30deg) scale(1.25); opacity: 0.95; }
          75% { transform: rotate(90deg) scale(1.15); opacity: 0.85; }
          100% { transform: rotate(140deg) scale(0.9); opacity: 0; }
        }

        @keyframes marigoldPetalFlutter {
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

        .animate-diya-flame-organic {
          animation: diyaFlameOrganicFlicker 2s ease-in-out infinite;
          transform-origin: 100px 115px;
        }

        .animate-diya-bless {
          animation: diyaBlessingPulse 0.85s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-sunbeams {
          animation: sunbeamsRadiate 1.1s ease-out forwards;
          transform-origin: 100px 75px;
        }
      `}</style>

      {/* Main Interactive Diya Button */}
      <button
        type="button"
        onClick={handleDiyaClick}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-transform duration-300 ${
          isBlessing ? 'animate-diya-bless' : 'group-hover:scale-105 active:scale-95'
        }`}
        title="Shubh Deepavali Diya • Click for Divine Blessings & Marigold Shower!"
        aria-label="Diwali Diya Flame & Blessings"
      >
        <div className="relative flex flex-col items-center">
          {/* Ambient Warm Golden Aura Behind Diya */}
          <div
            className={`absolute top-2 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 pointer-events-none ${
              isBlessing
                ? 'w-44 h-44 bg-gradient-to-r from-yellow-300/60 via-amber-400/65 to-orange-500/50 blur-2xl scale-125'
                : 'w-24 h-24 rounded-full bg-amber-400/25 blur-xl'
            }`}
          />

          {/* SVG Illustration: Handcrafted Illustrated Royal Indian Diya */}
          <svg
            className="w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 drop-shadow-2xl overflow-visible"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White Sticker Border Outline Filter (Matching Anaar artwork) */}
            <defs>
              <filter id="diyaStickerOutline" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="1" />
                <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="#FFFFFF" floodOpacity="0.85" />
              </filter>

              {/* Flame Radiance Radial Gradient */}
              <radialGradient id="sacredFlameRadial" cx="50%" cy="75%" r="70%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="22%" stopColor="#FFF9C4" />
                <stop offset="50%" stopColor="#FFD54F" />
                <stop offset="78%" stopColor="#FF6D00" />
                <stop offset="100%" stopColor="#D50000" />
              </radialGradient>

              {/* Outer Golden Aura Corona */}
              <radialGradient id="flameOuterCorona" cx="50%" cy="60%" r="55%">
                <stop offset="0%" stopColor="#FFE082" stopOpacity="0.75" />
                <stop offset="60%" stopColor="#FF6D00" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#D84315" stopOpacity="0" />
              </radialGradient>

              {/* Temple Brass & Gold Gradient */}
              <linearGradient id="templeGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF176" />
                <stop offset="30%" stopColor="#FFCA28" />
                <stop offset="70%" stopColor="#FF8F00" />
                <stop offset="100%" stopColor="#E65100" />
              </linearGradient>

              {/* Auspicious Kumkum Crimson Gradient */}
              <linearGradient id="kumkumRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF1744" />
                <stop offset="60%" stopColor="#D50000" />
                <stop offset="100%" stopColor="#880E4F" />
              </linearGradient>

              {/* Liquid Ghee Surface Gradient */}
              <linearGradient id="liquidGheeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="80%" stopColor="#FFB300" />
                <stop offset="100%" stopColor="#FF8F00" />
              </linearGradient>
            </defs>

            {/* Main Illustrated Group with White Sticker Outline */}
            <g filter="url(#diyaStickerOutline)">
              {/* ======================================================== */}
              {/* 1. FLOATING FESTIVE SPARKLES & STARS AROUND DIYA         */}
              {/* ======================================================== */}
              {/* Top Left Golden Star */}
              <path
                d="M 46 54 L 49 61 L 56 64 L 49 67 L 46 74 L 43 67 L 36 64 L 43 61 Z"
                fill="#FFD54F"
                stroke="#3E160D"
                strokeWidth="0.8"
                className="animate-pulse"
              />
              {/* Top Right Ruby Star */}
              <path
                d="M 152 48 L 155 55 L 162 58 L 155 61 L 152 68 L 149 61 L 142 58 L 149 55 Z"
                fill="#FF1744"
                stroke="#3E160D"
                strokeWidth="0.8"
              />
              {/* Mid Left Diamond Sparkle */}
              <polygon
                points="30,102 34,96 38,102 34,108"
                fill="#FFE082"
                stroke="#3E160D"
                strokeWidth="0.7"
              />
              {/* Mid Right Golden Sparkle */}
              <polygon
                points="168,98 172,92 176,98 172,104"
                fill="#FFB300"
                stroke="#3E160D"
                strokeWidth="0.7"
              />
              {/* Ascending Micro Spark Dots */}
              <circle cx="88" cy="30" r="1.8" fill="#FFD54F" stroke="#3E160D" strokeWidth="0.5" />
              <circle cx="112" cy="22" r="1.6" fill="#FFF9C4" stroke="#3E160D" strokeWidth="0.5" />
              <circle cx="106" cy="14" r="1.4" fill="#FF8F00" stroke="#3E160D" strokeWidth="0.4" />

              {/* ======================================================== */}
              {/* 2. SACRED LOTUS PEDESTAL STAND (KAMAL ASANA)             */}
              {/* ======================================================== */}
              {/* Bottom Base Plate (Broad Tier with Pearl Rim) */}
              <ellipse
                cx="100"
                cy="220"
                rx="62"
                ry="13"
                fill="#FFCA28"
                stroke="#3E160D"
                strokeWidth="1.6"
              />
              <ellipse
                cx="100"
                cy="218"
                rx="56"
                ry="10"
                fill="url(#templeGoldGrad)"
                stroke="#3E160D"
                strokeWidth="0.8"
              />

              {/* Embossed Pearl Moti on Bottom Plate */}
              {[-44, -32, -20, -8, 8, 20, 32, 44].map((offset, idx) => (
                <circle
                  key={`base-pearl-${idx}`}
                  cx={100 + offset}
                  cy={222 - Math.abs(offset) * 0.08}
                  r="2"
                  fill="#FFFDE7"
                  stroke="#3E160D"
                  strokeWidth="0.6"
                />
              ))}

              {/* Royal Tiered Lotus Petals (Crimson & Gold) */}
              <g id="lotusPetalsGroup">
                {/* Left Petals */}
                <path
                  d="M 52 214 Q 44 198 60 192 Q 68 206 72 214 Z"
                  fill="url(#kumkumRedGrad)"
                  stroke="#3E160D"
                  strokeWidth="1.2"
                />
                <path
                  d="M 68 215 Q 62 195 80 188 Q 88 205 86 215 Z"
                  fill="url(#kumkumRedGrad)"
                  stroke="#3E160D"
                  strokeWidth="1.2"
                />
                {/* Center Majestic Petal */}
                <path
                  d="M 88 216 Q 90 190 100 184 Q 110 190 112 216 Z"
                  fill="url(#kumkumRedGrad)"
                  stroke="#3E160D"
                  strokeWidth="1.4"
                />
                {/* Right Petals */}
                <path
                  d="M 114 215 Q 112 205 120 188 Q 138 195 132 215 Z"
                  fill="url(#kumkumRedGrad)"
                  stroke="#3E160D"
                  strokeWidth="1.2"
                />
                <path
                  d="M 128 214 Q 132 206 140 192 Q 156 198 148 214 Z"
                  fill="url(#kumkumRedGrad)"
                  stroke="#3E160D"
                  strokeWidth="1.2"
                />
              </g>

              {/* Lotus Petal Golden Filigree Highlights */}
              <circle cx="64" cy="202" r="1.8" fill="#FFD54F" />
              <circle cx="78" cy="198" r="1.8" fill="#FFD54F" />
              <circle cx="100" cy="195" r="2.2" fill="#FFD54F" />
              <circle cx="122" cy="198" r="1.8" fill="#FFD54F" />
              <circle cx="136" cy="202" r="1.8" fill="#FFD54F" />

              {/* Ornate Brass Neck Pillar */}
              <path
                d="M 90 190 L 93 166 C 93 162, 107 162, 107 166 L 110 190 Z"
                fill="url(#templeGoldGrad)"
                stroke="#3E160D"
                strokeWidth="1.3"
              />
              {/* Neck Ornamentation Ring with Royal Gems */}
              <ellipse
                cx="100"
                cy="176"
                rx="14"
                ry="4"
                fill="#FFCA28"
                stroke="#3E160D"
                strokeWidth="0.9"
              />
              <circle cx="94" cy="176" r="1.6" fill="#D50000" stroke="#3E160D" strokeWidth="0.4" />
              <circle cx="100" cy="176" r="1.8" fill="#0284C7" stroke="#3E160D" strokeWidth="0.4" />
              <circle cx="106" cy="176" r="1.6" fill="#D50000" stroke="#3E160D" strokeWidth="0.4" />

              {/* ======================================================== */}
              {/* 3. ORNATE CARVED DIYA BOWL (AKHAND DEEPAM CUP)           */}
              {/* ======================================================== */}
              {/* Deepam Bowl Main Clay & Brass Body */}
              <path
                d="M 36 128 C 42 166, 78 178, 100 178 C 122 178, 158 166, 164 128 C 166 122, 152 124, 138 126 C 114 128, 86 128, 62 126 C 48 124, 34 122, 36 128 Z"
                fill="url(#templeGoldGrad)"
                stroke="#3E160D"
                strokeWidth="1.8"
              />

              {/* Auspicious Vermillion & Turmeric Ethnic Band on Bowl */}
              <path
                d="M 44 140 C 56 164, 82 170, 100 170 C 118 170, 144 164, 156 140 C 140 144, 60 144, 44 140 Z"
                fill="url(#kumkumRedGrad)"
                stroke="#3E160D"
                strokeWidth="1"
              />

              {/* Wavy Festive Zigzags inside Red Band */}
              <path
                d="M 52 148 Q 62 142 72 148 Q 82 142 92 148 Q 100 142 108 148 Q 118 142 128 148 Q 138 142 148 148"
                stroke="#FFD54F"
                strokeWidth="1.6"
                fill="none"
              />

              {/* Golden Dots on Bowl (Echoing Anaar's Tiered Dots) */}
              {[-36, -24, -12, 0, 12, 24, 36].map((offset, idx) => (
                <circle
                  key={`diya-dot-${idx}`}
                  cx={100 + offset}
                  cy={156 - Math.abs(offset) * 0.14}
                  r="2.2"
                  fill="#FFFDE7"
                  stroke="#3E160D"
                  strokeWidth="0.6"
                />
              ))}

              {/* Ghee Reservoir Pool Surface (Oval with Liquid Sheen) */}
              <ellipse
                cx="100"
                cy="126"
                rx="58"
                ry="13"
                fill="url(#liquidGheeGrad)"
                stroke="#3E160D"
                strokeWidth="1.4"
              />
              <ellipse
                cx="100"
                cy="125"
                rx="50"
                ry="9"
                fill="#FFF9C4"
                fillOpacity="0.45"
              />

              {/* Embossed Pearl Moti along Top Rim */}
              {[-48, -36, -24, -12, 0, 12, 24, 36, 48].map((offset, idx) => (
                <circle
                  key={`rim-pearl-${idx}`}
                  cx={100 + offset}
                  cy={127 - Math.abs(offset) * 0.08}
                  r="2.2"
                  fill={idx % 2 === 0 ? '#FFE082' : '#FFFFFF'}
                  stroke="#3E160D"
                  strokeWidth="0.6"
                />
              ))}

              {/* Cotton Baati (Wick) Dipped in Ghee */}
              <path
                d="M 98 126 C 97 118, 99 112, 100 106 C 101 112, 103 118, 102 126 Z"
                fill="#3E2723"
                stroke="#3E160D"
                strokeWidth="0.8"
              />
              {/* Glowing Red-Hot Ember Tip on Wick */}
              <circle cx="100" cy="106" r="2.8" fill="#FF3D00" stroke="#3E160D" strokeWidth="0.5" />

              {/* ======================================================== */}
              {/* 4. SACRED AKHAND JYOT (DIVINE FLAME & GLOW)              */}
              {/* ======================================================== */}
              <g id="sacredFlame" className="animate-diya-flame-organic">
                {/* Outer Warm Corona Atmosphere */}
                <ellipse cx="100" cy="68" rx="36" ry="52" fill="url(#flameOuterCorona)" />

                {/* Main Saffron & Gold Flame Body */}
                <path
                  d="M 100 18 C 82 52, 74 84, 84 104 C 90 114, 110 114, 116 104 C 126 84, 118 52, 100 18 Z"
                  fill="url(#sacredFlameRadial)"
                  stroke="#3E160D"
                  strokeWidth="1.2"
                />

                {/* Radiant Golden-Yellow Core Tongue */}
                <path
                  d="M 100 32 C 88 56, 82 78, 89 94 C 93 102, 107 102, 111 94 C 118 78, 112 56, 100 32 Z"
                  fill="#FFF59D"
                  stroke="#E65100"
                  strokeWidth="0.6"
                />

                {/* Pure White-Hot Inner Seed */}
                <path
                  d="M 100 48 C 94 66, 92 82, 96 92 C 98 97, 102 97, 104 92 C 108 82, 106 66, 100 48 Z"
                  fill="#FFFFFF"
                />
              </g>

              {/* Radiating Divine Sunbeams When Clicked/Blessed */}
              {isBlessing && (
                <g className="animate-sunbeams pointer-events-none">
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
                    <line
                      key={`sunbeam-${i}`}
                      x1="100"
                      y1={i % 2 === 0 ? "42" : "50"}
                      x2="100"
                      y2={i % 2 === 0 ? "10" : "24"}
                      stroke="#FFE082"
                      strokeWidth={i % 2 === 0 ? "2.5" : "1.5"}
                      strokeLinecap="round"
                      transform={`rotate(${deg} 100 75)`}
                    />
                  ))}
                </g>
              )}
            </g>
          </svg>

          {/* Festive Badge Tag Underneath Diya */}
          <div className="mt-1 flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full shadow-md border border-yellow-300/80 tracking-wider uppercase group-hover:scale-105 transition-transform">
            <Flame className="w-3 h-3 text-yellow-200 fill-yellow-300 animate-bounce" />
            <span>Shubh Deepam</span>
          </div>
        </div>
      </button>

      {/* Floating Festive Speech Callout on Click */}
      {showBubble && (
        <div className="absolute -top-12 left-2 sm:left-4 z-50 whitespace-nowrap bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-amber-700 dark:text-amber-300 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-2xl border-2 border-amber-400 animate-in fade-in zoom-in-75 duration-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-500 animate-bounce shrink-0" />
          <span>{bubbleText}</span>
          <div className="absolute left-8 -bottom-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-amber-400 rotate-45" />
        </div>
      )}

      {/* DYNAMIC MARIGOLD PETALS & GOLDEN STARS SHOWER ACROSS SCREEN */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `marigoldPetalFlutter ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
            pointerEvents: 'none',
            zIndex: 99999
          }}
          className="will-change-transform"
        >
          {p.type === 'marigold' ? (
            /* Illustrated Saffron Marigold Flower Petal */
            <svg
              width={p.size * 1.3}
              height={p.size * 1.3}
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-[0_0_6px_rgba(255,145,0,0.8)]"
            >
              <path
                d="M 12 2 C 7 6, 4 12, 6 18 C 8 22, 16 22, 18 18 C 20 12, 17 6, 12 2 Z"
                fill={p.color}
                stroke="#FF6D00"
                strokeWidth="1"
              />
              <path
                d="M 12 5 C 10 9, 8 13, 10 17"
                stroke="#FFE082"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          ) : p.type === 'star' ? (
            /* Golden 8-pointed Divine Star */
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
            /* Radiant Sacred Ember Glow */
            <div
              style={{
                width: `${p.size * 0.8}px`,
                height: `${p.size * 0.8}px`,
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
