import React, { useState } from 'react';
import { Sparkles, Flame } from 'lucide-react';

/**
 * DiwaliSparklerMotif (Festive Anaar Fountain / Flowerpot Firework)
 * Directly inspired by the user's authentic illustrated Diwali Anaar artwork.
 * 
 * Features:
 * - Handcrafted vector Anaar cone with alternating festive bands:
 *   rust-maroon, wavy yellow zigzags, golden dots, orange tiers & scalloped frill skirt.
 * - Multi-branch arching fountain spray paths shooting up and cascading left & right.
 * - Crystal firework flowers (violet & amber 8-petal stars) & diamond sparkles.
 * - Interactive: On CLICK, the Anaar erupts!
 *   Realistic firework whoosh + sizzle crackle audio (Web Audio API)
 *   50+ dynamic sparkling particles erupt UPWARDS and SPREAD across the screen!
 */
export default function DiwaliSparklerMotif({ onOpenModal }) {
  const [isErupting, setIsErupting] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Boom! Happy Diwali! 🎆');
  const [showBubble, setShowBubble] = useState(false);

  const CELEBRATION_CALLS = [
    'Boom! Happy Diwali! 🎆',
    'Festival of Lights! 🌟',
    'Sparkling Joy & Prosperity! ✨',
    'Shubh Deepavali Dhamaka! 🎇',
    'Shine Bright with Silver! 🪔'
  ];

  // Synthesize realistic Anaar fountain whoosh + sizzling crackle via Web Audio API
  const playAnaarAudio = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;

      // 1. Initial Launch "Whoosh" (Rocket / fountain lift-off)
      const whooshOsc = ctx.createOscillator();
      const whooshGain = ctx.createGain();
      whooshOsc.type = 'triangle';
      whooshOsc.frequency.setValueAtTime(140, now);
      whooshOsc.frequency.exponentialRampToValueAtTime(750, now + 0.35);

      whooshGain.gain.setValueAtTime(0.35, now);
      whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      whooshOsc.connect(whooshGain);
      whooshGain.connect(ctx.destination);
      whooshOsc.start(now);
      whooshOsc.stop(now + 0.48);

      // 2. High-Frequency Continuous Sizzle & Crackle Fountain
      const bufferSize = ctx.sampleRate * 0.95;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Explosive micro-crackle pops
        const cracklePop = Math.random() > 0.94 ? (Math.random() * 2 - 1) * 2.8 : 0;
        data[i] = (white * 0.35 + cracklePop) * Math.exp(-i / (ctx.sampleRate * 0.5));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3400, now);
      filter.Q.setValueAtTime(2.2, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);

      // 3. Pleasant Harmonic Chime on Spreading
      [0.15, 0.3, 0.45].forEach((delay, idx) => {
        const chime = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(880 + idx * 260, now + delay);
        chimeGain.gain.setValueAtTime(0.12, now + delay);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);
        chime.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        chime.start(now + delay);
        chime.stop(now + delay + 0.45);
      });
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  };

  const handleAnaarClick = (e) => {
    setIsErupting(true);
    playAnaarAudio();

    const randomCall = CELEBRATION_CALLS[Math.floor(Math.random() * CELEBRATION_CALLS.length)];
    setBubbleText(randomCall);
    setShowBubble(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width * 0.5;
    // The top tip of the Anaar cone
    const originY = rect.top + rect.height * 0.42;

    // Generate 48 dynamic celebratory particles shooting UP and spreading OUT!
    const newParticles = Array.from({ length: 48 }).map((_, i) => {
      // Angle: spread in an upward cone (-160 deg to -20 deg)
      const spreadAngle = (Math.random() * 140 - 160) * (Math.PI / 180);
      const distance = Math.random() * 320 + 160; // Travel distance
      const tx = Math.cos(spreadAngle) * distance + (Math.random() - 0.5) * 80;
      const ty = Math.sin(spreadAngle) * distance - Math.random() * 140; // High upward lift

      return {
        id: Date.now() + i + Math.random(),
        startX: originX,
        startY: originY,
        tx,
        ty,
        size: Math.random() * 16 + 8,
        delay: Math.random() * 0.35, // Staggered eruption waves
        duration: Math.random() * 0.7 + 1.2,
        type: ['star', 'flower', 'dot', 'spark'][i % 4],
        color: [
          '#FFD700', // Gold
          '#FF3D00', // Vivid Orange-Red
          '#F57C00', // Deep Orange
          '#9C27B0', // Violet (from inspo)
          '#E91E63', // Rose
          '#FFEB3B', // Bright Yellow
          '#FFF9C4', // Hot White-Gold
          '#7B1FA2'  // Purple
        ][i % 8]
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);

    // Reset eruption pulse state
    setTimeout(() => {
      setIsErupting(false);
    }, 1200);

    // Clean up particles after flight completes
    setTimeout(() => {
      setParticles([]);
    }, 2400);

    // Dismiss speech bubble
    setTimeout(() => {
      setShowBubble(false);
    }, 3200);
  };

  return (
    <div className="fixed bottom-2 sm:bottom-4 right-1 sm:right-4 z-[38] pointer-events-auto select-none group">
      {/* Keyframe Animations for Fountain Streams & Spreading Particles */}
      <style>{`
        @keyframes fountainStreamPulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 6px rgba(255, 179, 0, 0.7));
          }
          50% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 14px rgba(255, 215, 0, 1)) drop-shadow(0 0 24px rgba(255, 61, 0, 0.8));
          }
        }

        @keyframes anarEruptingBounce {
          0% { transform: scale(1) translateY(0); }
          15% { transform: scale(1.12, 0.88) translateY(6px); }
          35% { transform: scale(0.92, 1.15) translateY(-14px); }
          60% { transform: scale(1.06, 0.95) translateY(-4px); }
          80% { transform: scale(0.98, 1.02) translateY(0); }
          100% { transform: scale(1) translateY(0); }
        }

        @keyframes crystalFlowerRotate {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.15); }
          100% { transform: rotate(360deg) scale(1); }
        }

        @keyframes particleFlySpread {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.2) rotate(0deg);
          }
          15% {
            opacity: 1;
            transform: translate(calc(var(--tx) * 0.35), calc(var(--ty) * 0.7)) scale(1.5) rotate(90deg);
          }
          65% {
            opacity: 0.95;
            transform: translate(var(--tx), var(--ty)) scale(1) rotate(220deg);
          }
          100% {
            opacity: 0;
            transform: translate(calc(var(--tx) * 1.08), calc(var(--ty) + 70px)) scale(0.15) rotate(360deg);
          }
        }

        .animate-fountain-idle {
          animation: fountainStreamPulse 2.4s ease-in-out infinite;
          transform-origin: 100px 105px;
        }

        .animate-anar-erupt {
          animation: anarEruptingBounce 0.85s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-crystal-flower {
          animation: crystalFlowerRotate 6s linear infinite;
          transform-origin: center center;
        }
      `}</style>

      {/* Main Interactive Anaar Button */}
      <button
        type="button"
        onClick={handleAnaarClick}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-transform duration-300 ${isErupting ? 'animate-anar-erupt' : 'group-hover:scale-105 active:scale-95'
          }`}
        title="Shubh Deepavali Anaar • Click to Erupt & Spread Sparkles!"
        aria-label="Diwali Anaar Fountain Firework"
      >
        <div className="relative flex flex-col items-center">
          {/* Ambient Warm Fireworks Glow Behind Anaar */}
          <div
            className={`absolute top-2 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 pointer-events-none ${isErupting
              ? 'w-48 h-48 bg-gradient-to-r from-yellow-300/50 via-amber-400/60 to-rose-500/40 blur-2xl scale-125'
              : 'w-24 h-24 rounded-full bg-amber-400/20 blur-xl'
              }`}
          />

          {/* SVG Illustration: Illustrated Diwali Anaar & Arching Fountain */}
          <svg
            className="w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 drop-shadow-2xl overflow-visible animate-fountain-idle"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White Sticker Border Outline Filter */}
            <defs>
              <filter id="stickerOutline" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="1" />
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FFFFFF" floodOpacity="0.85" />
              </filter>

              {/* Fountain Sparks Gradient */}
              <linearGradient id="anarSparksGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9C4" />
                <stop offset="40%" stopColor="#FFD54F" />
                <stop offset="75%" stopColor="#FF6D00" />
                <stop offset="100%" stopColor="#D50000" />
              </linearGradient>

              {/* Purple Crystal Flower Gradient */}
              <linearGradient id="purpleCrystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E1BEE7" />
                <stop offset="40%" stopColor="#BA68C8" />
                <stop offset="100%" stopColor="#7B1FA2" />
              </linearGradient>

              {/* Orange Crystal Flower Gradient */}
              <linearGradient id="orangeCrystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9C4" />
                <stop offset="40%" stopColor="#FFB74D" />
                <stop offset="100%" stopColor="#E65100" />
              </linearGradient>
            </defs>

            {/* ======================================================== */}
            {/* 1. CRYSTAL FIREWORK FLOWERS (From Inspiration Corners)   */}
            {/* ======================================================== */}
            {/* Top-Left: Purple 8-Petal Crystal Flower */}
            <g transform="translate(32, 28)" className="animate-crystal-flower" filter="url(#stickerOutline)">
              <circle cx="0" cy="0" r="4.5" fill="#7B1FA2" stroke="#FFFFFF" strokeWidth="1" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <polygon
                  key={i}
                  points="0,-6 3.5,-13 0,-18 -3.5,-13"
                  fill="url(#purpleCrystalGrad)"
                  stroke="#FFFFFF"
                  strokeWidth="0.8"
                  transform={`rotate(${deg})`}
                />
              ))}
            </g>

            {/* Bottom-Right: Purple Crystal Flower */}
            <g transform="translate(168, 205)" className="animate-crystal-flower" filter="url(#stickerOutline)">
              <circle cx="0" cy="0" r="4" fill="#7B1FA2" stroke="#FFFFFF" strokeWidth="1" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <polygon
                  key={i}
                  points="0,-5 3,-10 0,-15 -3,-10"
                  fill="url(#purpleCrystalGrad)"
                  stroke="#FFFFFF"
                  strokeWidth="0.8"
                  transform={`rotate(${deg})`}
                />
              ))}
            </g>

            {/* Bottom-Left: Golden Orange Crystal Flower */}
            <g transform="translate(35, 208)" className="animate-crystal-flower" filter="url(#stickerOutline)">
              <circle cx="0" cy="0" r="4.5" fill="#E65100" stroke="#FFFFFF" strokeWidth="1" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <polygon
                  key={i}
                  points="0,-5.5 3.5,-12 0,-17 -3.5,-12"
                  fill="url(#orangeCrystalGrad)"
                  stroke="#FFFFFF"
                  strokeWidth="0.8"
                  transform={`rotate(${deg})`}
                />
              ))}
            </g>

            {/* Mid-Right: Golden Orange Crystal Flower */}
            <g transform="translate(182, 95)" className="animate-crystal-flower" filter="url(#stickerOutline)">
              <circle cx="0" cy="0" r="3.5" fill="#E65100" stroke="#FFFFFF" strokeWidth="0.8" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <polygon
                  key={i}
                  points="0,-4 2.5,-8 0,-12 -2.5,-8"
                  fill="url(#orangeCrystalGrad)"
                  stroke="#FFFFFF"
                  strokeWidth="0.6"
                  transform={`rotate(${deg})`}
                />
              ))}
            </g>

            {/* Diamond Glints around Artwork */}
            <g fill="#FFA000" stroke="#FFFFFF" strokeWidth="0.8">
              <polygon points="18,80 20,84 18,88 16,84" />
              <polygon points="32,130 34,133 32,136 30,133" />
              <polygon points="172,36 174,40 172,44 170,40" fill="#7B1FA2" />
            </g>

            {/* ======================================================== */}
            {/* 2. ARCHING FOUNTAIN STREAMS (Spraying from Anaar tip)    */}
            {/* ======================================================== */}
            <g id="fountainShower" filter="url(#stickerOutline)">
              {/* Central Firework Spray Arcs (Dark Maroon/Rust core lines with white border) */}
              {/* Stream 1: High Left Arc */}
              <path
                d="M 100 120 C 94 65, 75 42, 52 48 C 42 50, 36 60, 42 68"
                stroke="#4A150D"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              {/* Stream 2: Wide Left Arc */}
              <path
                d="M 100 120 C 90 82, 68 68, 45 78 C 36 82, 34 94, 40 102"
                stroke="#4A150D"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              {/* Stream 3: Mid-Left Arc */}
              <path
                d="M 100 120 C 92 92, 75 88, 55 98 C 48 102, 46 112, 52 118"
                stroke="#4A150D"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              {/* Stream 4: Center Plume Upward */}
              <path
                d="M 100 120 C 98 62, 88 42, 92 34 C 94 30, 102 28, 104 36"
                stroke="#4A150D"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Stream 5: High Right Arc */}
              <path
                d="M 100 120 C 106 65, 125 42, 148 48 C 158 50, 164 60, 158 68"
                stroke="#4A150D"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              {/* Stream 6: Wide Right Arc */}
              <path
                d="M 100 120 C 110 82, 132 68, 155 78 C 164 82, 166 94, 160 102"
                stroke="#4A150D"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              {/* Stream 7: Mid-Right Arc */}
              <path
                d="M 100 120 C 108 92, 125 88, 145 98 C 152 102, 154 112, 148 118"
                stroke="#4A150D"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />

              {/* --- SPARKS ON THE STREAMS (Colored Dots & Stars) --- */}
              {/* Stars on Left Streams */}
              <g transform="translate(68, 42)">
                <polygon points="0,-6 1.8,-1.8 6,0 1.8,1.8 0,6 -1.8,1.8 -6,0 -1.8,-1.8" fill="#4A150D" />
              </g>
              <g transform="translate(64, 76)">
                <polygon points="0,-6 1.8,-1.8 6,0 1.8,1.8 0,6 -1.8,1.8 -6,0 -1.8,-1.8" fill="#E65100" />
              </g>
              <g transform="translate(56, 120)">
                <polygon points="0,-5.5 1.6,-1.6 5.5,0 1.6,1.6 0,5.5 -1.6,1.6 -5.5,0 -1.6,-1.6" fill="#F57C00" />
              </g>
              <g transform="translate(42, 126)">
                <polygon points="0,-6 1.8,-1.8 6,0 1.8,1.8 0,6 -1.8,1.8 -6,0 -1.8,-1.8" fill="#FFB300" />
              </g>

              {/* Stars on Right Streams */}
              <g transform="translate(126, 38)">
                <polygon points="0,-6 1.8,-1.8 6,0 1.8,1.8 0,6 -1.8,1.8 -6,0 -1.8,-1.8" fill="#E65100" />
              </g>
              <g transform="translate(156, 68)">
                <polygon points="0,-6 1.8,-1.8 6,0 1.8,1.8 0,6 -1.8,1.8 -6,0 -1.8,-1.8" fill="#4A150D" />
              </g>
              <g transform="translate(128, 96)">
                <polygon points="0,-5.5 1.6,-1.6 5.5,0 1.6,1.6 0,5.5 -1.6,1.6 -5.5,0 -1.6,-1.6" fill="#F57C00" />
              </g>
              <g transform="translate(150, 110)">
                <polygon points="0,-6 1.8,-1.8 6,0 1.8,1.8 0,6 -1.8,1.8 -6,0 -1.8,-1.8" fill="#FFB300" />
              </g>

              {/* Glowing Colorful Circles on Branches */}
              <circle cx="84" cy="54" r="4.2" fill="#FFB300" stroke="#3E160D" strokeWidth="0.8" />
              <circle cx="50" cy="85" r="4.5" fill="#E53935" stroke="#3E160D" strokeWidth="0.8" />
              <circle cx="75" cy="86" r="3.8" fill="#FFD54F" stroke="#3E160D" strokeWidth="0.8" />
              <circle cx="68" cy="106" r="3.5" fill="#FB8C00" stroke="#3E160D" strokeWidth="0.8" />

              <circle cx="118" cy="54" r="4.2" fill="#E53935" stroke="#3E160D" strokeWidth="0.8" />
              <circle cx="140" cy="74" r="4.5" fill="#FFB300" stroke="#3E160D" strokeWidth="0.8" />
              <circle cx="122" cy="84" r="3.8" fill="#FB8C00" stroke="#3E160D" strokeWidth="0.8" />
              <circle cx="142" cy="98" r="4.2" fill="#FFD54F" stroke="#3E160D" strokeWidth="0.8" />

              {/* Erupting Core Flare on Nozzle */}
              {isErupting && (
                <g transform="translate(100, 118)">
                  <polygon
                    points="0,-22 5,-5 22,0 5,5 0,22 -5,5 -22,0 -5,-5"
                    fill="#FFF9C4"
                    className="animate-ping"
                  />
                  <circle cx="0" cy="0" r="8" fill="#FFD700" />
                  <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
                </g>
              )}
            </g>

            {/* ======================================================== */}
            {/* 3. ANAAR CONE POT (Accurate to User's Reference Inspo)   */}
            {/* ======================================================== */}
            <g id="anaarConePot" filter="url(#stickerOutline)">
              {/* Outer Cone Outline & Base Fill */}
              <path
                d="M 98 120 L 70 216 Q 100 224 130 216 L 102 120 Z"
                fill="#4A150D"
                stroke="#3E160D"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />

              {/* Tier 1 (Top Tip): Dark Maroon/Rust */}
              <path d="M 98 120 L 94 132 L 106 132 Z" fill="#4A150D" />

              {/* Tier 2: Golden Yellow Band with Zigzag Line */}
              <path
                d="M 93 132 L 89 144 L 111 144 L 107 132 Z"
                fill="#FFCA28"
                stroke="#3E160D"
                strokeWidth="1.2"
              />
              <path
                d="M 92 138 Q 97 134 100 138 Q 103 142 108 138"
                stroke="#E65100"
                strokeWidth="1.5"
                fill="none"
              />

              {/* Tier 3: Orange Band with Golden Dots */}
              <path
                d="M 89 144 L 85 158 L 115 158 L 111 144 Z"
                fill="#F57C00"
                stroke="#3E160D"
                strokeWidth="1.2"
              />
              <circle cx="92" cy="151" r="2.2" fill="#FFD54F" stroke="#3E160D" strokeWidth="0.6" />
              <circle cx="100" cy="151" r="2.2" fill="#FFD54F" stroke="#3E160D" strokeWidth="0.6" />
              <circle cx="108" cy="151" r="2.2" fill="#FFD54F" stroke="#3E160D" strokeWidth="0.6" />

              {/* Tier 4: Dark Maroon Band with Golden Dots */}
              <path
                d="M 85 158 L 81 174 L 119 174 L 115 158 Z"
                fill="#4A150D"
                stroke="#3E160D"
                strokeWidth="1.2"
              />
              <circle cx="89" cy="166" r="2.5" fill="#FFD54F" stroke="#3E160D" strokeWidth="0.6" />
              <circle cx="96.5" cy="166" r="2.5" fill="#FFD54F" stroke="#3E160D" strokeWidth="0.6" />
              <circle cx="103.5" cy="166" r="2.5" fill="#FFD54F" stroke="#3E160D" strokeWidth="0.6" />
              <circle cx="111" cy="166" r="2.5" fill="#FFD54F" stroke="#3E160D" strokeWidth="0.6" />

              {/* Tier 5: Yellow Band with Bold Wavy Zigzag Trim */}
              <path
                d="M 81 174 L 77 190 L 123 190 L 119 174 Z"
                fill="#FFCA28"
                stroke="#3E160D"
                strokeWidth="1.2"
              />
              <path
                d="M 80 182 Q 86 176 91 182 Q 96 188 100 182 Q 105 176 110 182 Q 115 188 120 182"
                stroke="#E65100"
                strokeWidth="2.2"
                fill="none"
              />

              {/* Tier 6: Orange Band with 5 Golden Dots */}
              <path
                d="M 77 190 L 72 206 L 128 206 L 123 190 Z"
                fill="#F57C00"
                stroke="#3E160D"
                strokeWidth="1.2"
              />
              <circle cx="82" cy="198" r="2.8" fill="#FFD54F" stroke="#3E160D" strokeWidth="0.6" />
              <circle cx="91" cy="198" r="2.8" fill="#FFD54F" stroke="#3E160D" strokeWidth="0.6" />
              <circle cx="100" cy="198" r="2.8" fill="#FFD54F" stroke="#3E160D" strokeWidth="0.6" />
              <circle cx="109" cy="198" r="2.8" fill="#FFD54F" stroke="#3E160D" strokeWidth="0.6" />
              <circle cx="118" cy="198" r="2.8" fill="#FFD54F" stroke="#3E160D" strokeWidth="0.6" />

              {/* Tier 7 (Bottom Base): Scalloped Yellow Frill Skirt */}
              <path
                d="M 72 206 L 68 218 C 76 223, 124 223, 132 218 L 128 206 Z"
                fill="#FFCA28"
                stroke="#3E160D"
                strokeWidth="1.4"
              />
              {/* Scalloped Wavy Loops on Skirt */}
              <path
                d="M 70 216 Q 77 210 83 216 Q 89 210 95 216 Q 100 210 105 216 Q 111 210 117 216 Q 123 210 130 216"
                stroke="#E65100"
                strokeWidth="2"
                fill="none"
              />
            </g>
          </svg>

          {/* Festive Badge Tag Underneath Anaar */}
          <div className="mt-1 flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full shadow-md border border-yellow-300/80 tracking-wider uppercase group-hover:scale-105 transition-transform">
            <Sparkles className="w-3 h-3 text-yellow-200 animate-spin" />
            <span>Shubh Anaar</span>
          </div>
        </div>
      </button>

      {/* Floating Festive Speech Callout on Click */}
      {showBubble && (
        <div className="absolute -top-12 right-2 sm:right-4 z-50 whitespace-nowrap bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-amber-700 dark:text-amber-300 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-2xl border-2 border-amber-400 animate-in fade-in zoom-in-75 duration-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-500 animate-bounce shrink-0" />
          <span>{bubbleText}</span>
          <div className="absolute right-8 -bottom-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-amber-400 rotate-45" />
        </div>
      )}

      {/* DYNAMIC SPARKLES THAT SHOOT UP & SPREAD ACROSS THE SCREEN */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `particleFlySpread ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
            pointerEvents: 'none',
            zIndex: 99999
          }}
          className="will-change-transform"
        >
          {p.type === 'star' ? (
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]"
            >
              <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
            </svg>
          ) : p.type === 'flower' ? (
            <svg
              width={p.size * 1.2}
              height={p.size * 1.2}
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-[0_0_8px_rgba(156,39,176,0.8)]"
            >
              <circle cx="12" cy="12" r="3" fill="#FFFFFF" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => (
                <polygon
                  key={idx}
                  points="12,7 14,3 12,0 10,3"
                  fill={p.color}
                  transform={`rotate(${deg} 12 12)`}
                />
              ))}
            </svg>
          ) : (
            <div
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 12px ${p.color}, 0 0 20px ${p.color}`
              }}
              className="rounded-full"
            />
          )}
        </div>
      ))}
    </div>
  );
}
