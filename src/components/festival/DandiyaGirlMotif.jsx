import React, { useState } from 'react';
import { Sparkles, Music } from 'lucide-react';

/**
 * DandiyaGirlMotif - Elegant & Graceful Gujarati Garba Dancer (Girl)
 * 100% Pure Vector Code (No raster images).
 * Crafted with mature, beautiful proportions to pair with the Dandiya Boy:
 * - Graceful feminine dancing silhouette facing left (towards the boy)
 * - Traditional Chaniya Choli in festive vibrant fuchsia/pink with golden gota-patti
 * - Flowing turquoise/cyan odhani (dupatta) with gold border
 * - Beautiful traditional jewelry: jhumkas, bindi, maang tikka & colorful bangles
 * - Both arms gracefully raised overhead holding wooden dandiya sticks
 * - Smooth rhythmic Garba dance motion & interactive sound/strike
 */
export default function DandiyaGirlMotif({ onOpenModal }) {
  const [isStriking, setIsStriking] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Garba Beats! 💃');
  const [showBubble, setShowBubble] = useState(false);

  const FESTIVE_CALLS = [
    'Dholida Dhol Re Vagad! 🥁',
    'Aavi Re Aavi Navratri! ✨',
    'Garba Ni Ramzat! 💃',
    'Shubh Navratri! 🪔',
    'Chalo Kheliye Dandiya! 🌸'
  ];

  // Synthesize realistic wooden dandiya raas clack audio via Web Audio API
  const playDandiyaClack = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;

      [0.0, 0.16, 0.32].forEach((delay, idx) => {
        // High, crisp wooden percussion knock
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(idx === 1 ? 980 : 880, now + delay);
        osc.frequency.exponentialRampToValueAtTime(280, now + delay + 0.05);

        gain.gain.setValueAtTime(0.28, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.07);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.08);

        // Sweet ghungroo chime resonance
        const bell = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(1900 + idx * 240, now + delay);
        bellGain.gain.setValueAtTime(0.08, now + delay);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.14);

        bell.connect(bellGain);
        bellGain.connect(ctx.destination);
        bell.start(now + delay);
        bell.stop(now + delay + 0.15);
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
      x: rect.left + rect.width * 0.28 + (Math.random() * 40 - 20),
      y: rect.top + rect.height * 0.22 + (Math.random() * 40 - 20),
      size: Math.random() * 12 + 6,
      color: ['#FFD700', '#FF007F', '#00E5FF', '#FF3D00', '#76FF03'][i % 5]
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
      // available if needed
    }
  };

  return (
    <div className="fixed bottom-2 sm:bottom-4 right-1 sm:right-4 z-[38] pointer-events-auto select-none group">
      {/* Keyframes for Rhythmic, Graceful Garba Dancing & Dandiya Strike */}
      <style>{`
        @keyframes girlGarbaSway {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          30% {
            transform: translateY(-4px) rotate(-1.4deg);
          }
          70% {
            transform: translateY(-1.5px) rotate(1deg);
          }
        }
        @keyframes girlDandiyaStrikeClash {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(6deg) translateX(3px) scale(1.02); }
          50% { transform: rotate(-9deg) translateX(-5px) scale(1.05); }
          75% { transform: rotate(2deg) translateX(1px) scale(1.01); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes girlLeftStickMotion {
          0% { transform: rotate(0deg); }
          30% { transform: rotate(18deg) translate(3px, -2px); }
          55% { transform: rotate(-14deg) translate(-4px, 2px); }
          80% { transform: rotate(5deg) translate(1px, 0); }
          100% { transform: rotate(0deg); }
        }
        @keyframes girlRightStickMotion {
          0% { transform: rotate(0deg); }
          30% { transform: rotate(-20deg) translate(-4px, -2px); }
          55% { transform: rotate(15deg) translate(5px, 2px); }
          80% { transform: rotate(-6deg) translate(-1px, 0); }
          100% { transform: rotate(0deg); }
        }
        .animate-garba-girl {
          animation: girlGarbaSway 3s ease-in-out infinite;
          transform-origin: bottom center;
        }
        .animate-girl-strike-action {
          animation: girlDandiyaStrikeClash 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: bottom center;
        }
        .animate-girl-left-stick {
          animation: girlLeftStickMotion 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: 74px 44px;
        }
        .animate-girl-right-stick {
          animation: girlRightStickMotion 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: 164px 46px;
        }
      `}</style>

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={handleClick}
        className="relative block border-none bg-transparent p-0 outline-none cursor-pointer group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_12px_24px_rgba(219,39,119,0.3)]"
        title="Click to play Dandiya Raas with Garba Girl! 🥁"
      >
        {/* Warm Golden/Rose Backdrop Glow */}
        <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-pink-500/20 via-amber-400/15 to-rose-400/20 blur-xl opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Character Visual Wrapper */}
        <div
          className={`relative flex flex-col items-center justify-center p-1 bg-transparent ${
            isStriking ? 'animate-girl-strike-action' : 'animate-garba-girl'
          }`}
        >
          {/* HIGH-END VECTOR ARTWORK - CRISP, ACCURATE & BEAUTIFUL */}
          <svg
            className="w-32 h-40 sm:w-36 sm:h-44 md:w-40 md:h-48 overflow-visible"
            viewBox="0 0 210 250"
            fill="none"
          >
            <defs>
              {/* CHOLI & LEHENGA - Vibrant Fuchsia / Pink Silk */}
              <linearGradient id="choliPink" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FB7185" />
                <stop offset="35%" stopColor="#F43F5E" />
                <stop offset="70%" stopColor="#E11D48" />
                <stop offset="100%" stopColor="#9F1239" />
              </linearGradient>

              {/* DUPATTA (ODHANI) - Sea-Green / Turquoise Sheer Shimmer */}
              <linearGradient id="dupattaCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A7F3D0" />
                <stop offset="30%" stopColor="#34D399" />
                <stop offset="70%" stopColor="#059669" />
                <stop offset="100%" stopColor="#065F46" />
              </linearGradient>

              <linearGradient id="dupattaBorderGold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#EAB308" />
              </linearGradient>

              {/* SKIN TONE - Radiant Warm Wheatish Complexion */}
              <linearGradient id="girlSkin" x1="80%" y1="0%" x2="20%" y2="100%">
                <stop offset="0%" stopColor="#FFEAD4" />
                <stop offset="35%" stopColor="#F9CBA7" />
                <stop offset="75%" stopColor="#E9A880" />
                <stop offset="100%" stopColor="#D5875B" />
              </linearGradient>

              <linearGradient id="girlSkinShadow" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#D5875B" />
                <stop offset="100%" stopColor="#B35A2C" />
              </linearGradient>

              {/* DANDIYA WOOD */}
              <linearGradient id="girlStickWood1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="30%" stopColor="#F59E0B" />
                <stop offset="70%" stopColor="#B45309" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>

              <linearGradient id="girlStickWood2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FED7AA" />
                <stop offset="30%" stopColor="#EA580C" />
                <stop offset="70%" stopColor="#9A3412" />
                <stop offset="100%" stopColor="#5E1D06" />
              </linearGradient>

              {/* AMBIENT DROP SHADOW */}
              <filter id="girlDancerShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="-2" dy="4" stdDeviation="3" floodColor="#4C0519" floodOpacity="0.22" />
              </filter>
            </defs>

            <g filter="url(#girlDancerShadow)">
              {/* ======================================================== */}
              {/* 1. FLUTTERING DUPATTA TAIL (BACKGROUND LAYER)            */}
              {/* ======================================================== */}
              <path
                d="M 148 116 C 168 126, 184 148, 186 178 C 174 182, 160 174, 150 162 C 146 144, 145 128, 148 116 Z"
                fill="url(#dupattaCyan)"
                opacity="0.9"
              />
              <path d="M 186 178 Q 174 184 150 162" stroke="url(#dupattaBorderGold)" strokeWidth="2.5" fill="none" />

              {/* ======================================================== */}
              {/* 2. LOWER LEHENGA (SKIRT) & WAIST                         */}
              {/* ======================================================== */}
              {/* Flared Lehenga Skirt (Vibrant Pink with Gold Hem) */}
              <path
                d="M 112 168 C 96 186, 78 208, 68 226 C 92 232, 134 230, 162 222 C 154 204, 146 184, 140 168 Z"
                fill="url(#choliPink)"
                stroke="#9F1239"
                strokeWidth="1"
              />

              {/* Lehenga Vertical Pleats / Kalis */}
              <path d="M 118 172 Q 106 198 94 228" stroke="#BE123C" strokeWidth="1.1" fill="none" />
              <path d="M 128 170 Q 124 198 122 226" stroke="#BE123C" strokeWidth="1.1" fill="none" />
              <path d="M 136 172 Q 140 198 144 224" stroke="#BE123C" strokeWidth="1.1" fill="none" />

              {/* Gold Embroidered Hem Border at bottom of Lehenga */}
              <path d="M 68 226 Q 116 234 162 222" stroke="url(#dupattaBorderGold)" strokeWidth="3.5" fill="none" />
              <path d="M 70 222 Q 116 230 160 218" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 2" fill="none" />

              {/* ======================================================== */}
              {/* 3. FEMININE WAIST & MIDRIFF (TRADITIONAL CHANIYA CHOLI)  */}
              {/* ======================================================== */}
              {/* Slender Waist Midriff */}
              <path
                d="M 116 144 C 114 152, 113 160, 114 168 C 124 169, 134 169, 140 168 C 141 160, 140 152, 138 144 Z"
                fill="url(#girlSkin)"
              />
              <path d="M 126 156 Q 127 158 126 160" stroke="#B35A2C" strokeWidth="1" fill="none" />

              {/* Gold Kamarbandh / Waistband Chain */}
              <path d="M 114 168 Q 127 172 140 168" stroke="url(#dupattaBorderGold)" strokeWidth="1.8" fill="none" />
              <circle cx="127" cy="171" r="1.5" fill="#E11D48" />

              {/* ======================================================== */}
              {/* 4. CHOLI (EMBROIDERED BLOUSE) & DRAPED DUPATTA           */}
              {/* ======================================================== */}
              {/* Fitted Choli Bodice */}
              <path
                d="M 114 108 C 110 118, 112 134, 116 144 C 126 145, 134 145, 138 144 C 142 134, 144 118, 140 108 Z"
                fill="url(#choliPink)"
                stroke="#9F1239"
                strokeWidth="1.1"
              />

              {/* Front Dupatta Pleated Draping over Bodice */}
              <path
                d="M 136 106 C 126 116, 116 130, 114 144 C 118 146, 126 146, 132 142 C 136 130, 140 118, 142 108 Z"
                fill="url(#dupattaCyan)"
              />
              <path d="M 136 106 Q 120 126 114 144" stroke="url(#dupattaBorderGold)" strokeWidth="1.8" fill="none" />

              {/* Golden Neck Hasli / Necklace */}
              <path d="M 120 106 Q 127 112 134 106" stroke="url(#dupattaBorderGold)" strokeWidth="2.2" fill="none" />
              <circle cx="127" cy="111" r="2" fill="#E11D48" stroke="#FACC15" strokeWidth="0.5" />

              {/* ======================================================== */}
              {/* 5. BACK ARM (RIGHT ARM - RAISED OVERHEAD WITH DANDIYA)   */}
              {/* ======================================================== */}
              <g className={isStriking ? 'animate-girl-right-stick' : ''}>
                {/* Back Shoulder & Arm reaching up-right */}
                <path
                  d="M 138 108 C 146 102, 158 92, 162 76 C 158 72, 150 76, 144 86 C 138 96, 136 104, 138 108 Z"
                  fill="url(#girlSkin)"
                  stroke="#C57545"
                  strokeWidth="0.6"
                />

                {/* Choli Short Sleeve on Right Shoulder */}
                <path
                  d="M 136 106 C 142 100, 150 96, 154 94 C 152 100, 146 106, 138 108 Z"
                  fill="url(#choliPink)"
                  stroke="#9F1239"
                  strokeWidth="0.8"
                />

                {/* Right Forearm extending up */}
                <path
                  d="M 160 76 C 164 68, 168 58, 170 48 C 165 47, 160 52, 156 64 C 154 72, 156 75, 160 76 Z"
                  fill="url(#girlSkin)"
                  stroke="#C57545"
                  strokeWidth="0.6"
                />

                {/* Stack of Red & Gold Glass Bangles (Choodiyan) */}
                <rect x="162" y="52" width="7" height="2" rx="1" fill="#E11D48" />
                <rect x="163" y="55" width="7" height="1.8" rx="0.9" fill="#FACC15" />
                <rect x="164" y="58" width="7" height="2" rx="1" fill="#0284C7" />

                {/* Right Hand Gripping Stick */}
                <ellipse cx="169" cy="46" rx="4.5" ry="4" fill="url(#girlSkin)" />
                <path d="M 166 43 C 169 42, 172 43, 173 47 C 173 49, 170 51, 167 50 Z" fill="url(#girlSkin)" stroke="#B85D2B" strokeWidth="0.5" />

                {/* RIGHT DANDIYA STICK (Raised Overhead Angled Towards Center) */}
                <g transform="rotate(-48 169 46)">
                  <rect x="167" y="-8" width="4" height="106" rx="2" fill="url(#girlStickWood2)" stroke="#5E1D06" strokeWidth="0.6" />
                  <line x1="168" y1="-6" x2="167.5" y2="94" stroke="#FFF7ED" strokeWidth="0.6" opacity="0.65" />
                  <rect x="166.6" y="8" width="4.8" height="4" fill="#E11D48" />
                  <rect x="166.6" y="12" width="4.8" height="2" fill="#FACC15" />
                  <rect x="166.6" y="24" width="4.8" height="4" fill="#0284C7" />
                  <rect x="166.6" y="28" width="4.8" height="2" fill="#FACC15" />
                  <circle cx="169" cy="-8" r="2.4" fill="#FACC15" stroke="#78350F" strokeWidth="0.5" />
                </g>
              </g>

              {/* ======================================================== */}
              {/* 6. FRONT ARM (LEFT ARM - RAISED OVERHEAD WITH DANDIYA)   */}
              {/* ======================================================== */}
              <g className={isStriking ? 'animate-girl-left-stick' : ''}>
                {/* Front Left Shoulder & Bicep reaching up-left */}
                <path
                  d="M 114 108 C 104 100, 92 88, 86 72 C 92 70, 98 76, 106 88 C 112 98, 114 104, 114 108 Z"
                  fill="url(#girlSkin)"
                  stroke="#C57545"
                  strokeWidth="0.6"
                />

                {/* Choli Sleeve on Left Shoulder */}
                <path
                  d="M 114 108 C 108 102, 100 96, 96 94 C 98 100, 106 106, 114 108 Z"
                  fill="url(#choliPink)"
                  stroke="#9F1239"
                  strokeWidth="0.8"
                />

                {/* Left Forearm extending gracefully up-left */}
                <path
                  d="M 88 72 C 84 64, 78 54, 74 46 C 79 44, 84 50, 90 60 C 92 68, 90 71, 88 72 Z"
                  fill="url(#girlSkin)"
                  stroke="#C57545"
                  strokeWidth="0.6"
                />

                {/* Stack of Bangles (Choodiyan) */}
                <rect x="74" y="50" width="7" height="2" rx="1" fill="#E11D48" />
                <rect x="75" y="53" width="7" height="1.8" rx="0.9" fill="#FACC15" />
                <rect x="76" y="56" width="7" height="2" rx="1" fill="#0284C7" />

                {/* Left Hand Gripping Stick */}
                <ellipse cx="73" cy="44" rx="4.5" ry="4" fill="url(#girlSkin)" />
                <path d="M 70 41 C 73 40, 76 41, 77 45 C 77 47, 74 49, 71 48 Z" fill="url(#girlSkin)" stroke="#B85D2B" strokeWidth="0.5" />

                {/* LEFT DANDIYA STICK (Raised High Forward towards Center/Boy) */}
                <g transform="rotate(32 73 44)">
                  <rect x="71" y="-12" width="4" height="106" rx="2" fill="url(#girlStickWood1)" stroke="#5E1D06" strokeWidth="0.6" />
                  <line x1="72" y1="-10" x2="71.5" y2="90" stroke="#FFF7ED" strokeWidth="0.6" opacity="0.65" />
                  <rect x="70.6" y="4" width="4.8" height="4" fill="#0284C7" />
                  <rect x="70.6" y="8" width="4.8" height="2" fill="#FACC15" />
                  <rect x="70.6" y="20" width="4.8" height="4" fill="#E11D48" />
                  <rect x="70.6" y="24" width="4.8" height="2" fill="#FACC15" />
                  <circle cx="73" cy="-12" r="2.4" fill="#FACC15" stroke="#78350F" strokeWidth="0.5" />
                </g>
              </g>

              {/* ======================================================== */}
              {/* 7. SLENDER NECK & BEAUTIFUL FEMININE FACE PROFILE        */}
              {/* ======================================================== */}
              {/* Slender Graceful Neck */}
              <path d="M 122 84 L 132 84 L 130 102 L 120 102 Z" fill="url(#girlSkinShadow)" />

              {/* Jawline Shadow */}
              <path d="M 122 82 Q 130 86 136 78 Q 130 92 120 92 Z" fill="#C57545" opacity="0.65" />

              {/* Beautiful Face (Profile facing LEFT towards Center & Boy) */}
              <path
                d="M 132 68 C 134 60, 128 48, 118 46 C 108 44, 100 50, 100 60 C 100 68, 104 74, 112 80 C 120 86, 130 84, 134 77 C 136 73, 134 70, 132 68 Z"
                fill="url(#girlSkin)"
                stroke="#C57545"
                strokeWidth="0.7"
              />

              {/* Rosy Cheek Blush */}
              <ellipse cx="112" cy="68" rx="5.5" ry="4" fill="#F43F5E" opacity="0.25" />

              {/* Beautiful Almond Eye (Facing Left) */}
              <path
                d="M 112 60 Q 106 56 100 60 Q 106 65 112 60 Z"
                fill="#FFFFFF"
                stroke="#1C1917"
                strokeWidth="0.8"
              />
              <circle cx="105" cy="60" r="2.8" fill="#451A03" />
              <circle cx="104.5" cy="60" r="1.5" fill="#000000" />
              <circle cx="103.5" cy="59" r="0.8" fill="#FFFFFF" />
              <path d="M 111 57 Q 106 54 101 57" stroke="#B85D2B" strokeWidth="0.6" fill="none" />

              {/* Delicate Curved Feminine Eyebrow */}
              <path
                d="M 113 53 C 108 50, 102 50, 98 54 C 102 52, 107 51, 112 54 Z"
                fill="#1C1917"
              />

              {/* Red Bindi on Forehead */}
              <circle cx="102" cy="52" r="1.4" fill="#E11D48" />

              {/* Delicate Nose Bridge & Tip */}
              <path
                d="M 100 56 Q 95 61 96 66 Q 99 68 103 66"
                stroke="#B85D2B"
                strokeWidth="0.9"
                strokeLinecap="round"
                fill="none"
              />

              {/* Joyful, Graceful Smile with Teeth & Lips */}
              <path d="M 114 73 Q 106 81 98 74" stroke="#7F1D1D" strokeWidth="1" strokeLinecap="round" fill="none" />
              <path d="M 113 74 Q 106 81 99 75 Q 106 77 113 74 Z" fill="#7F1D1D" />
              <path d="M 111 74.5 Q 106 77.5 101 75.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <path d="M 110 78 Q 106 80 102 78" stroke="#FB7185" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.6" />

              {/* Delicate Ear & Traditional Golden Jhumka Earring */}
              <path
                d="M 130 68 C 132 64, 128 59, 124 61 C 121 63, 122 75, 126 76 C 129 77, 131 73, 130 68 Z"
                fill="url(#girlSkin)"
                stroke="#B85D2B"
                strokeWidth="0.6"
              />
              {/* Hanging Golden Jhumka */}
              <circle cx="127" cy="78" r="1.6" fill="#FACC15" />
              <path d="M 124 81 L 130 81 L 128 85 L 126 85 Z" fill="#FACC15" stroke="#B45309" strokeWidth="0.5" />
              <circle cx="125" cy="87" r="0.8" fill="#E11D48" />
              <circle cx="127" cy="87" r="0.8" fill="#FACC15" />
              <circle cx="129" cy="87" r="0.8" fill="#E11D48" />

              {/* ======================================================== */}
              {/* 8. ELEGANT HAIR BUN (CHIGNON) WITH GAJRA FLOWERS         */}
              {/* ======================================================== */}
              {/* Main Hair Volume */}
              <path
                d="M 116 46 C 128 42, 142 46, 144 60 C 146 72, 138 80, 130 80 C 126 74, 124 62, 116 46 Z"
                fill="#1C1917"
              />

              {/* Traditional High Bun (Juda) */}
              <ellipse cx="144" cy="52" rx="12" ry="11" fill="#1C1917" stroke="#0C0A09" strokeWidth="0.8" />
              <circle cx="144" cy="52" r="5" fill="#292524" />

              {/* Floral Gajra Flowers (Jasmine Garland around Bun) */}
              <circle cx="134" cy="48" r="2.2" fill="#FFFFFF" stroke="#FACC15" strokeWidth="0.5" />
              <circle cx="138" cy="42" r="2.2" fill="#FFFFFF" stroke="#FACC15" strokeWidth="0.5" />
              <circle cx="144" cy="40" r="2.2" fill="#FFFFFF" stroke="#FACC15" strokeWidth="0.5" />
              <circle cx="150" cy="42" r="2.2" fill="#FFFFFF" stroke="#FACC15" strokeWidth="0.5" />
              <circle cx="154" cy="48" r="2.2" fill="#FFFFFF" stroke="#FACC15" strokeWidth="0.5" />
              <circle cx="152" cy="56" r="2.2" fill="#FFFFFF" stroke="#FACC15" strokeWidth="0.5" />

              {/* Maang Tikka Pearl Chain on Hair Part */}
              <path d="M 120 46 Q 112 48 106 52" stroke="#FACC15" strokeWidth="1" fill="none" />
              <circle cx="106" cy="52" r="1.4" fill="#E11D48" stroke="#FACC15" strokeWidth="0.4" />
            </g>

            {/* Sparkle Clash at Dandiya Strike Clash */}
            {isStriking && (
              <g transform="translate(68, 22)">
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
          <div className="mt-1 flex items-center space-x-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full shadow-md border border-yellow-300/60 tracking-wider uppercase group-hover:scale-105 transition-transform">
            <Music className="w-3 h-3 text-yellow-200 animate-pulse" />
            <span>Garba Raas</span>
          </div>
        </div>
      </button>

      {/* Floating Festive Speech Callout on Click */}
      {showBubble && (
        <div className="absolute -top-10 right-2 sm:right-4 z-50 whitespace-nowrap bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-pink-700 dark:text-pink-300 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-2xl border-2 border-pink-400 animate-in fade-in zoom-in-75 duration-200 flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-pink-500 animate-bounce shrink-0" />
          <span>{bubbleText}</span>
          <div className="absolute right-6 -bottom-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-pink-400 rotate-45" />
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
