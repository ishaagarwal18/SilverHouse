import React, { useState } from 'react';
import { Sparkles, Music } from 'lucide-react';

/**
 * DandiyaBoyMotif - Handsome, Elegant & Mature Gujarati Dandiya Dancer
 * High-end vector illustration featuring an attractive young man in traditional attire:
 * - Stylish sky-blue Gujarati Pagdi/Safa sitting naturally atop the head
 * - Handsome, expressive facial profile with charming smile & almond eye
 * - Broad shoulders, tailored ivory kurta with mandarin collar
 * - Rich red waist sash (patka/kamarbandh) with gold hem
 * - Natural anatomical arms and hands holding polished wooden dandiya sticks
 * - Smooth rhythmic Garba dance motion & interactive sound/strike
 */
export default function DandiyaBoyMotif({ onOpenModal }) {
  const [isStriking, setIsStriking] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Dandiya Raas! 🥁');
  const [showBubble, setShowBubble] = useState(false);

  const FESTIVE_CALLS = [
    'Halo Re Halo! 🥁',
    'Chalo Garbe Ramva! ✨',
    'Shubh Navratri! 🪔',
    'Dandiya Raas Joy! 💃🕺',
    'Radhe Radhe! 🌸'
  ];

  // Synthesize realistic wooden dandiya raas clack audio via Web Audio API
  const playDandiyaClack = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;

      [0.0, 0.16, 0.32].forEach((delay, idx) => {
        // Wooden strike percussion
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(idx === 1 ? 950 : 850, now + delay);
        osc.frequency.exponentialRampToValueAtTime(260, now + delay + 0.05);

        gain.gain.setValueAtTime(0.3, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.07);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.08);

        // Ghungroo bell chime
        const bell = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(1760 + idx * 220, now + delay);
        bellGain.gain.setValueAtTime(0.08, now + delay);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.13);

        bell.connect(bellGain);
        bellGain.connect(ctx.destination);
        bell.start(now + delay);
        bell.stop(now + delay + 0.14);
      });
    } catch (e) {
      console.warn('Audio play warning:', e);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    setIsStriking(true);
    playDandiyaClack();

    const randomCall = FESTIVE_CALLS[Math.floor(Math.random() * FESTIVE_CALLS.length)];
    setBubbleText(randomCall);
    setShowBubble(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const newSparkles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: rect.left + rect.width * 0.75 + (Math.random() * 40 - 20),
      y: rect.top + rect.height * 0.25 + (Math.random() * 40 - 20),
      size: Math.random() * 12 + 6,
      color: ['#FFD700', '#FF3D00', '#00E5FF', '#FF007F', '#76FF03'][i % 5]
    }));
    setSparkles(newSparkles);

    setTimeout(() => {
      setIsStriking(false);
      setSparkles([]);
    }, 850);

    setTimeout(() => {
      setShowBubble(false);
    }, 2600);

    if (onOpenModal) {
      // callback if needed
    }
  };

  return (
    <div className="fixed bottom-2 sm:bottom-4 left-1 sm:left-4 z-[38] pointer-events-auto select-none group">
      {/* Keyframes for Rhythmic, Mature Garba Dancing & Crisp Strike */}
      <style>{`
        @keyframes garbaBodySway {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          30% {
            transform: translateY(-4px) rotate(1.2deg);
          }
          70% {
            transform: translateY(-1.5px) rotate(-0.8deg);
          }
        }
        @keyframes dandiyaClashAction {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-5deg) translateX(-3px) scale(1.02); }
          50% { transform: rotate(8deg) translateX(5px) scale(1.05); }
          75% { transform: rotate(-2deg) translateX(-1px) scale(1.01); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes leftStickClack {
          0% { transform: rotate(0deg); }
          30% { transform: rotate(-18deg) translate(-4px, -2px); }
          55% { transform: rotate(14deg) translate(5px, 2px); }
          80% { transform: rotate(-4deg) translate(-1px, 0); }
          100% { transform: rotate(0deg); }
        }
        @keyframes rightStickClack {
          0% { transform: rotate(0deg); }
          30% { transform: rotate(18deg) translate(3px, -2px); }
          55% { transform: rotate(-14deg) translate(-5px, 2px); }
          80% { transform: rotate(6deg) translate(2px, 0); }
          100% { transform: rotate(0deg); }
        }
        .animate-garba-dancer {
          animation: garbaBodySway 3s ease-in-out infinite;
          transform-origin: bottom center;
        }
        .animate-dandiya-strike-action {
          animation: dandiyaClashAction 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: bottom center;
        }
        .animate-stick-left-swing {
          animation: leftStickClack 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: 130px 116px;
        }
        .animate-stick-right-swing {
          animation: rightStickClack 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: 162px 128px;
        }
      `}</style>

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={handleClick}
        className="relative block border-none bg-transparent p-0 outline-none cursor-pointer group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_12px_24px_rgba(217,119,6,0.28)]"
        title="Click to play Dandiya Raas! 🥁"
      >
        {/* Warm Golden Backdrop Glow for High Contrast */}
        <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-amber-400/20 via-orange-500/15 to-yellow-300/20 blur-xl opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Character Visual Wrapper */}
        <div
          className={`relative flex flex-col items-center justify-center p-1 bg-transparent ${
            isStriking ? 'animate-dandiya-strike-action' : 'animate-garba-dancer'
          }`}
        >
          {/* HIGH-END VECTOR ARTWORK - CRISP, ACCURATE & HANDSOME */}
          <svg
            className="w-32 h-40 sm:w-36 sm:h-44 md:w-40 md:h-48 overflow-visible"
            viewBox="0 0 210 250"
            fill="none"
          >
            <defs>
              {/* TURBAN (SAFA) - Sky Blue Silk with Luminous Highlights */}
              <linearGradient id="safaGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7CD4FD" />
                <stop offset="35%" stopColor="#48AEE9" />
                <stop offset="75%" stopColor="#2287C8" />
                <stop offset="100%" stopColor="#156EA7" />
              </linearGradient>

              <linearGradient id="safaGradPuff" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#BAE6FD" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>

              {/* SKIN TONE - Handsome Healthy Warm Wheatish Complexion */}
              <linearGradient id="skinShade" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#FFEAD4" />
                <stop offset="40%" stopColor="#F9CBA7" />
                <stop offset="80%" stopColor="#E9A880" />
                <stop offset="100%" stopColor="#D5875B" />
              </linearGradient>

              <linearGradient id="skinShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D5875B" />
                <stop offset="100%" stopColor="#B35A2C" />
              </linearGradient>

              {/* KURTA FABRIC - Elegant Ivory Linen with Soft Seam Folds */}
              <linearGradient id="kurtaIvory" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#FAF5EC" />
                <stop offset="70%" stopColor="#EFE5D5" />
                <stop offset="100%" stopColor="#DFD2C0" />
              </linearGradient>

              {/* RED PATKA SASH - Vibrant Scarlet Silk */}
              <linearGradient id="sashScarlet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F87171" />
                <stop offset="30%" stopColor="#E11D48" />
                <stop offset="75%" stopColor="#BE123C" />
                <stop offset="100%" stopColor="#881337" />
              </linearGradient>

              {/* DANDIYA WOOD - Warm Polished Teak Finish */}
              <linearGradient id="dandiyaTeak1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="30%" stopColor="#F59E0B" />
                <stop offset="70%" stopColor="#B45309" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>

              <linearGradient id="dandiyaTeak2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FED7AA" />
                <stop offset="30%" stopColor="#EA580C" />
                <stop offset="70%" stopColor="#9A3412" />
                <stop offset="100%" stopColor="#5E1D06" />
              </linearGradient>

              {/* AMBIENT DROP SHADOW */}
              <filter id="gentleDancerShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#3B1705" floodOpacity="0.22" />
              </filter>
            </defs>

            <g filter="url(#gentleDancerShadow)">
              {/* ======================================================== */}
              {/* 1. BACK ARM (LEFT ARM & LEFT DANDIYA STICK)              */}
              {/* ======================================================== */}
              <g className={isStriking ? 'animate-stick-left-swing' : ''}>
                {/* Back Sleeve from Shoulder to Elbow */}
                <path
                  d="M 64 108 C 76 102, 98 106, 114 116 C 110 126, 98 128, 86 124 C 74 120, 66 116, 64 108 Z"
                  fill="url(#kurtaIvory)"
                  stroke="#C9B69D"
                  strokeWidth="0.8"
                />

                {/* Forearm extending forward-up to Hand */}
                <path
                  d="M 108 116 C 118 118, 126 120, 130 122 C 128 128, 120 130, 112 126 C 104 122, 102 118, 108 116 Z"
                  fill="url(#skinShade)"
                  stroke="#C57545"
                  strokeWidth="0.6"
                />

                {/* Sleeve Cuff Line */}
                <path d="M 106 114 Q 112 122 110 128" stroke="#C9B69D" strokeWidth="1.4" strokeLinecap="round" fill="none" />

                {/* Left Hand Holding Stick (Clean Fingers & Thumb) */}
                <ellipse cx="128" cy="120" rx="5" ry="4.5" fill="url(#skinShade)" />
                <path d="M 125 116 C 128 115, 132 116, 133 120 C 133 123, 130 125, 127 124 Z" fill="url(#skinShade)" stroke="#B85D2B" strokeWidth="0.5" />
                <path d="M 124 120 C 127 119, 131 120, 132 124 C 132 126, 129 128, 126 127 Z" fill="url(#skinShade)" stroke="#B85D2B" strokeWidth="0.5" />
                <path d="M 123 117 Q 127 118 129 122" stroke="#B85D2B" strokeWidth="0.6" fill="none" />

                {/* LEFT DANDIYA STICK (Slender, Elegant Angle Upward) */}
                <g transform="rotate(-36 128 120)">
                  <rect x="126" y="44" width="4" height="106" rx="2" fill="url(#dandiyaTeak1)" stroke="#5E1D06" strokeWidth="0.6" />
                  <line x1="127" y1="46" x2="126.5" y2="146" stroke="#FFF7ED" strokeWidth="0.6" opacity="0.6" />
                  {/* Decorative Wraps */}
                  <rect x="125.6" y="56" width="4.8" height="4" fill="#E11D48" />
                  <rect x="125.6" y="60" width="4.8" height="2" fill="#FACC15" />
                  <rect x="125.6" y="72" width="4.8" height="4" fill="#0284C7" />
                  <rect x="125.6" y="76" width="4.8" height="2" fill="#FACC15" />
                  <circle cx="128" cy="44" r="2.4" fill="#FACC15" stroke="#78350F" strokeWidth="0.5" />
                </g>
              </g>

              {/* ======================================================== */}
              {/* 2. TAILORED IVORY KURTA (BODY & LOWER SKIRT)             */}
              {/* ======================================================== */}
              {/* Lower Kurta Skirt */}
              <path
                d="M 44 168 C 38 184, 34 206, 31 224 C 46 228, 72 228, 88 222 C 84 204, 82 184, 80 168 Z"
                fill="url(#kurtaIvory)"
                stroke="#C9B69D"
                strokeWidth="1"
              />

              {/* Soft Tailoring Creases on Skirt */}
              <path d="M 46 184 Q 56 204 54 224" stroke="#D3C3AD" strokeWidth="0.9" fill="none" opacity="0.6" />
              <path d="M 68 182 Q 74 204 78 222" stroke="#D3C3AD" strokeWidth="0.9" fill="none" opacity="0.6" />

              {/* Upper Kurta Body (Athletic Chest, Back & Torso) */}
              <path
                d="M 38 116 C 38 116, 50 98, 70 100 C 86 102, 92 114, 88 170 C 70 173, 52 172, 40 168 C 36 150, 36 132, 38 116 Z"
                fill="url(#kurtaIvory)"
                stroke="#C9B69D"
                strokeWidth="1.2"
              />

              {/* Center Placket Seam & Clean Tailoring Line */}
              <path d="M 70 100 Q 73 135 71 170" stroke="#C9B69D" strokeWidth="1" strokeDasharray="5 3" />
              <path d="M 52 112 Q 58 136 56 166" stroke="#E5D9C8" strokeWidth="1" fill="none" />

              {/* Mandarin Collar Band */}
              <path
                d="M 64 98 C 70 94, 82 95, 86 99 C 81 104, 69 103, 64 98 Z"
                fill="#EEE3D2"
                stroke="#B85D2B"
                strokeWidth="0.8"
              />

              {/* ======================================================== */}
              {/* 3. VIBRANT RED PATKA SASH (WAISTBAND & FLOWING TAIL)     */}
              {/* ======================================================== */}
              {/* Waist Wrap Band */}
              <path
                d="M 35 164 C 49 161, 72 161, 85 164 C 86 175, 84 185, 82 188 C 66 190, 46 190, 34 188 C 32 179, 33 170, 35 164 Z"
                fill="url(#sashScarlet)"
                stroke="#881337"
                strokeWidth="1.2"
              />

              {/* Sash Folds */}
              <path d="M 36 172 Q 60 170 82 172" stroke="#FDA4AF" strokeWidth="0.8" fill="none" opacity="0.6" />
              <path d="M 35 180 Q 59 178 81 180" stroke="#700B2B" strokeWidth="0.8" fill="none" />

              {/* Sash Knot on Left Hip */}
              <ellipse cx="38" cy="176" rx="6" ry="7.5" fill="#E11D48" stroke="#700B2B" strokeWidth="1" />

              {/* Flowing Sash Drape Tail with Gold Brocade Hem */}
              <path
                d="M 37 180 C 35 198, 29 218, 24 240 C 31 243, 40 241, 45 238 C 43 218, 42 198, 42 180 Z"
                fill="url(#sashScarlet)"
                stroke="#700B2B"
                strokeWidth="1.2"
              />
              {/* Dual Gold Border Hem on Sash Tip */}
              <path d="M 24 236 Q 34 240 45 234" stroke="#FACC15" strokeWidth="2.5" fill="none" />
              <path d="M 24 240 Q 34 244 45 238" stroke="#FEF08A" strokeWidth="1.2" fill="none" />

              {/* ======================================================== */}
              {/* 4. FRONT ARM (RIGHT ARM & RIGHT DANDIYA STICK)           */}
              {/* ======================================================== */}
              <g className={isStriking ? 'animate-stick-right-swing' : ''}>
                {/* Front Shoulder & Sleeve */}
                <path
                  d="M 58 108 C 70 104, 94 110, 116 122 C 110 134, 96 138, 82 132 C 68 128, 60 118, 58 108 Z"
                  fill="url(#kurtaIvory)"
                  stroke="#C9B69D"
                  strokeWidth="1.1"
                />

                {/* Forearm extending forward to hold stick */}
                <path
                  d="M 110 124 C 124 128, 142 134, 154 138 C 151 146, 143 148, 130 144 C 118 138, 110 132, 110 124 Z"
                  fill="url(#skinShade)"
                  stroke="#C57545"
                  strokeWidth="0.8"
                />

                {/* Sleeve Cuff Band */}
                <path d="M 108 122 Q 114 133 112 140" stroke="#C9B69D" strokeWidth="1.6" strokeLinecap="round" fill="none" />

                {/* Right Hand: Anatomical Fingers Gripping Stick */}
                <ellipse cx="152" cy="140" rx="6" ry="5.5" fill="url(#skinShade)" />
                <path d="M 148 135 C 152 134, 156 135, 157 139 C 157 142, 154 144, 150 143 Z" fill="url(#skinShade)" stroke="#B85D2B" strokeWidth="0.5" />
                <path d="M 147 139 C 151 138, 155 139, 156 143 C 156 145, 153 147, 149 146 Z" fill="url(#skinShade)" stroke="#B85D2B" strokeWidth="0.5" />
                <path d="M 146 143 C 150 142, 153 143, 154 147 C 154 149, 151 151, 148 150 Z" fill="url(#skinShade)" stroke="#B85D2B" strokeWidth="0.5" />
                {/* Thumb Support */}
                <path d="M 145 136 C 149 137, 152 139, 153 143 C 150 145, 146 143, 145 136 Z" fill="url(#skinShade)" stroke="#B85D2B" strokeWidth="0.5" />

                {/* RIGHT DANDIYA STICK (Forward Striking Dynamic Angle) */}
                <g transform="rotate(-18 152 140)">
                  <rect x="150" y="58" width="4.4" height="114" rx="2.2" fill="url(#dandiyaTeak2)" stroke="#5E1D06" strokeWidth="0.6" />
                  <line x1="151.2" y1="60" x2="150.5" y2="170" stroke="#FFF7ED" strokeWidth="0.7" opacity="0.65" />
                  {/* Decorative Ribbons & Gold Bands */}
                  <rect x="149.6" y="70" width="5.2" height="4" fill="#0284C7" />
                  <rect x="149.6" y="74" width="5.2" height="2" fill="#FACC15" />
                  <rect x="149.6" y="88" width="5.2" height="4" fill="#E11D48" />
                  <rect x="149.6" y="92" width="5.2" height="2" fill="#FACC15" />
                  <circle cx="152.2" cy="58" r="2.6" fill="#FACC15" stroke="#78350F" strokeWidth="0.5" />
                </g>
              </g>

              {/* ======================================================== */}
              {/* 5. NECK & HANDSOME MASCULINE HEAD                        */}
              {/* ======================================================== */}
              {/* Strong Neck & Throat */}
              <path d="M 66 84 L 76 84 L 82 98 L 64 98 Z" fill="url(#skinShadow)" />

              {/* Jawline Shadow Definition */}
              <path d="M 66 82 Q 80 88 90 78 Q 80 94 64 94 Z" fill="#C57545" opacity="0.7" />

              {/* Hair at Nape & Behind Ear */}
              <path
                d="M 58 66 C 56 74, 58 84, 64 88 C 61 88, 57 84, 54 78 C 52 70, 54 64, 58 66 Z"
                fill="#1C1917"
              />

              {/* Realistic Ear */}
              <path
                d="M 64 70 C 62 64, 67 59, 71 61 C 74 63, 73 77, 69 78 C 65 79, 63 75, 64 70 Z"
                fill="url(#skinShade)"
                stroke="#B85D2B"
                strokeWidth="0.7"
              />
              <path d="M 67 66 Q 69 70 67 74" stroke="#B85D2B" strokeWidth="0.7" fill="none" />

              {/* Handsome Sideburns */}
              <path d="M 72 62 L 73 70 L 70 71 Z" fill="#1C1917" />

              {/* Handsome Face Profile (Full, Visible & Well-Proportioned) */}
              <path
                d="M 66 68 C 64 60, 70 48, 82 46 C 94 44, 104 50, 106 60 C 108 68, 106 74, 98 80 C 88 86, 74 84, 68 77 C 65 73, 66 70, 66 68 Z"
                fill="url(#skinShade)"
                stroke="#C57545"
                strokeWidth="0.7"
              />

              {/* Healthy Warm Cheek Tone */}
              <ellipse cx="88" cy="69" rx="6" ry="4.5" fill="#F43F5E" opacity="0.2" />

              {/* Handsome Almond Eye & Brows */}
              {/* Sclera White */}
              <path
                d="M 90 60 Q 96 56 102 60 Q 96 65 90 60 Z"
                fill="#FFFFFF"
                stroke="#1C1917"
                strokeWidth="0.8"
              />
              {/* Deep Brown Iris & Pupil */}
              <circle cx="97" cy="60" r="3" fill="#451A03" />
              <circle cx="97.5" cy="60" r="1.6" fill="#000000" />
              <circle cx="98.5" cy="59" r="0.9" fill="#FFFFFF" />
              {/* Eyelid Line */}
              <path d="M 91 57 Q 96 54 101 57" stroke="#B85D2B" strokeWidth="0.6" fill="none" />
              {/* Neat Masculine Eyebrow */}
              <path
                d="M 87 53 C 92 50, 99 50, 104 54 C 100 52, 94 51, 88 54 Z"
                fill="#1C1917"
              />

              {/* Straight, Handsome Nose Bridge & Nostril */}
              <path
                d="M 102 56 Q 107 61 106 66 Q 103 68 99 66"
                stroke="#B85D2B"
                strokeWidth="1"
                strokeLinecap="round"
                fill="none"
              />
              <path d="M 102 66 Q 101 68 99 67" stroke="#B85D2B" strokeWidth="0.7" fill="none" />

              {/* Charming, Genuine Festive Smile */}
              <path d="M 88 73 Q 96 81 104 74" stroke="#7F1D1D" strokeWidth="1.1" strokeLinecap="round" fill="none" />
              <path d="M 89 74 Q 96 81 103 75 Q 96 77 89 74 Z" fill="#7F1D1D" />
              {/* Clean White Teeth Smile Line */}
              <path d="M 91 74.5 Q 96 77.5 101 75.5" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              <path d="M 92 78 Q 96 80 100 78" stroke="#FB7185" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.6" />

              {/* ======================================================== */}
              {/* 6. COMPACT, STYLISH GUJARATI TURBAN (SAFA / PAGDI)       */}
              {/* Sits naturally on top of head without covering the face! */}
              {/* ======================================================== */}
              {/* Turban Main Dome Silhouette */}
              <path
                d="M 56 46 C 50 32, 60 14, 84 12 C 102 10, 118 20, 115 38 C 113 48, 107 54, 100 56 C 86 56, 68 56, 56 46 Z"
                fill="url(#safaGradMain)"
                stroke="#156EA7"
                strokeWidth="1.2"
              />

              {/* Turban Crown Puff Layer */}
              <path
                d="M 72 14 C 80 6, 96 7, 102 16 C 94 18, 82 18, 72 14 Z"
                fill="url(#safaGradPuff)"
                stroke="#2287C8"
                strokeWidth="0.9"
              />

              {/* Turban Silk Pleat Folds (Natural Wrapped Gujrati Style) */}
              <path
                d="M 58 42 C 68 30, 92 28, 113 36 C 108 46, 96 50, 82 48 C 70 48, 61 46, 58 42 Z"
                fill="url(#safaGradMain)"
                stroke="#156EA7"
                strokeWidth="1"
              />

              <path
                d="M 62 32 C 74 20, 98 20, 113 28 C 108 36, 96 38, 82 36 C 70 36, 64 34, 62 32 Z"
                fill="url(#safaGradPuff)"
                stroke="#2287C8"
                strokeWidth="0.9"
              />

              {/* Lower Turban Band resting cleanly above the forehead */}
              <path
                d="M 64 50 C 76 42, 96 42, 104 48 C 100 53, 88 54, 76 53 C 68 53, 65 52, 64 50 Z"
                fill="url(#safaGradMain)"
                stroke="#156EA7"
                strokeWidth="0.9"
              />

              {/* Golden Brooch (Kalgi) Pin with Ruby Jewel */}
              <circle cx="80" cy="30" r="3.2" fill="#FACC15" stroke="#FFFFFF" strokeWidth="0.8" />
              <circle cx="80" cy="30" r="1.6" fill="#E11D48" />
              <path d="M 80 26 Q 83 18 86 15" stroke="#FACC15" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              <circle cx="86" cy="15" r="1.1" fill="#FFFFFF" />
            </g>

            {/* Sparkle Clash on Dandiya Strike Clash */}
            {isStriking && (
              <g transform="translate(146, 44)">
                <polygon
                  points="0,-14 3.5,-3.5 14,0 3.5,3.5 0,14 -3.5,3.5 -14,0 -3.5,-3.5"
                  fill="#FFF9C4"
                  className="animate-ping"
                />
                <polygon
                  points="0,-9 2.2,-2.2 9,0 2.2,2.2 0,9 -2.2,2.2 -9,0 -2.2,-2.2"
                  fill="#FFD700"
                />
                <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
              </g>
            )}
          </svg>

          {/* Festive Badge Tag Underneath Character */}
          <div className="mt-1 flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full shadow-md border border-yellow-300/60 tracking-wider uppercase group-hover:scale-105 transition-transform">
            <Music className="w-3 h-3 text-yellow-200 animate-pulse" />
            <span>Dandiya Raas</span>
          </div>
        </div>
      </button>

      {/* Floating Festive Speech Callout on Click */}
      {showBubble && (
        <div className="absolute -top-10 left-2 sm:left-4 z-50 whitespace-nowrap bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-amber-700 dark:text-amber-300 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-2xl border-2 border-amber-400 animate-in fade-in zoom-in-75 duration-200 flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-amber-500 animate-bounce shrink-0" />
          <span>{bubbleText}</span>
          <div className="absolute left-6 -bottom-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-amber-400 rotate-45" />
        </div>
      )}

      {/* Dynamic Sparkle Burst Particles */}
      {sparkles.map((p) => (
        <div
          key={p.id}
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color
          }}
          className="fixed pointer-events-none rounded-full z-[99999] animate-ping"
        />
      ))}
    </div>
  );
}
