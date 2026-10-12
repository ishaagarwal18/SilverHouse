import React, { useState } from 'react';
import { Sparkles, Gift, Bell } from 'lucide-react';

/**
 * ChristmasSantaMotif - Jolly Santa Claus with Silver Gifts & Ringing Holiday Bell
 * Positioned on bottom-right corner during Christmas & New Year Festival Mode.
 * 
 * Features:
 * - Illustrated vector Santa Claus in rich storybook folk-art style:
 *   Red velvet cap with fluffy pompom, joyful smiling face, rosy cheeks,
 *   luxurious snow-white beard, brass belt buckle, ringing golden sleigh bell,
 *   and an overflowing green gift sack filled with presents.
 * - White sticker outline filter matching the boutique illustration aesthetic.
 * - Interactive on CLICK:
 *   1. Cheerful Santa "Ho Ho Ho!" vocal pitch synthesis + sleigh bells jingle (Web Audio API).
 *   2. Jolly bounce & bell ring animation.
 *   3. 50+ Holiday Presents, Gingerbread Stars, Bells & Snowflakes bursting across the screen!
 *   4. Jolly Holiday Greeting speech callout.
 */
export default function ChristmasSantaMotif({ onOpenModal }) {
  const [isJolly, setIsJolly] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Ho Ho Ho! Merry Christmas! 🎅');
  const [showBubble, setShowBubble] = useState(false);

  const SANTA_GREETINGS = [
    'Ho Ho Ho! Merry Christmas! 🎅',
    'Special Silver Holiday Surprises! 🎁',
    'May Your Holidays Be Jolly & Bright! ✨',
    'Joy to the World & Happy Holidays! 🎄',
    'Santa\'s Pure Silver Gifts for You! 🌟'
  ];

  // Synthesize cheerful Santa "Ho! Ho! Ho!" resonance + sleigh bells jingle
  const playSantaAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Santa's Deep Jolly "Ho! Ho! Ho!" Vocal Formants
      // Three rhythmic belly laughs: "Ho" (140Hz), "Ho" (130Hz), "Ho!" (120Hz)
      const hoTones = [
        { time: 0.05, f: 140, dur: 0.22 },
        { time: 0.32, f: 130, dur: 0.22 },
        { time: 0.60, f: 118, dur: 0.30 }
      ];

      hoTones.forEach(({ time, f, dur }) => {
        const t = now + time;

        const osc = ctx.createOscillator();
        const formant = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.exponentialRampToValueAtTime(f * 0.85, t + dur);

        // Vocal tract vowel "O" resonance filter (~500Hz and ~900Hz)
        formant.type = 'bandpass';
        formant.frequency.setValueAtTime(540, t);
        formant.Q.setValueAtTime(3.5, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.24, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        osc.connect(formant);
        formant.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + dur + 0.05);
      });

      // 2. High-pitch silver sleigh bells accompaniment (ringing simultaneously)
      const bells = [0.08, 0.20, 0.35, 0.48, 0.64, 0.78, 0.95];
      bells.forEach((offset, idx) => {
        const t = now + offset;
        const bellOsc = ctx.createOscillator();
        const bellGain = ctx.createGain();

        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(1400 + (idx % 3) * 220, t);

        bellGain.gain.setValueAtTime(0.12, t);
        bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        bellOsc.connect(bellGain);
        bellGain.connect(ctx.destination);

        bellOsc.start(t);
        bellOsc.stop(t + 0.14);
      });
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  };

  const handleSantaClick = (e) => {
    setIsJolly(true);
    playSantaAudio();

    const randomGreeting = SANTA_GREETINGS[Math.floor(Math.random() * SANTA_GREETINGS.length)];
    setBubbleText(randomGreeting);
    setShowBubble(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width * 0.5;
    const originY = rect.top + rect.height * 0.32;

    // 50+ dynamic holiday particles: Wrapped Presents, Gingerbread Stars, Bells & Snowflakes
    const newParticles = Array.from({ length: 50 }).map((_, i) => {
      // Angle: Upwards and fanning across into the screen (-155 to -30 degrees)
      const angleDeg = -155 + Math.random() * 125;
      const angleRad = (angleDeg * Math.PI) / 180;
      const distance = 150 + Math.random() * 380;
      const tx = Math.cos(angleRad) * distance;
      const ty = Math.sin(angleRad) * distance;

      return {
        id: Date.now() + Math.random(),
        startX: originX,
        startY: originY,
        tx,
        ty,
        size: Math.random() * 14 + 8,
        color: ['#EF4444', '#DC2626', '#10B981', '#059669', '#FDE047', '#FFD54F', '#FFFFFF', '#60A5FA'][i % 8],
        duration: 1.3 + Math.random() * 0.9,
        delay: Math.random() * 0.28,
        type: i % 4 === 0 ? 'present' : i % 4 === 1 ? 'star' : i % 4 === 2 ? 'bell' : 'snow'
      };
    });

    setParticles(newParticles);

    setTimeout(() => {
      setIsJolly(false);
    }, 1100);

    setTimeout(() => {
      setParticles([]);
    }, 2500);

    setTimeout(() => {
      setShowBubble(false);
    }, 3200);
  };

  return (
    <div className="fixed bottom-2 sm:bottom-4 right-1 sm:right-4 z-[38] pointer-events-auto select-none group">
      {/* Keyframe Animations */}
      <style>{`
        @keyframes santaJollyBounce {
          0% { transform: scale(1) translateY(0); }
          20% { transform: scale(1.12, 0.88) translateY(6px); }
          40% { transform: scale(0.92, 1.15) translateY(-14px) rotate(-3deg); }
          65% { transform: scale(1.06, 0.95) translateY(-4px) rotate(2deg); }
          85% { transform: scale(0.98, 1.02) translateY(0) rotate(0deg); }
          100% { transform: scale(1) translateY(0); }
        }

        @keyframes bellRingJingle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-18deg); }
          50% { transform: rotate(18deg); }
          75% { transform: rotate(-10deg); }
        }

        @keyframes holidayParticleFly {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.2) rotate(0deg);
          }
          15% {
            opacity: 1;
            transform: translate(calc(var(--tx) * 0.35), calc(var(--ty) * 0.6)) scale(1.4) rotate(90deg);
          }
          65% {
            opacity: 0.95;
            transform: translate(var(--tx), var(--ty)) scale(1.05) rotate(220deg);
          }
          100% {
            opacity: 0;
            transform: translate(calc(var(--tx) * 1.08), calc(var(--ty) + 65px)) scale(0.2) rotate(360deg);
          }
        }

        .animate-santa-jolly {
          animation: santaJollyBounce 0.85s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-bell-ring {
          animation: bellRingJingle 1.8s ease-in-out infinite;
          transform-origin: 156px 125px;
        }
      `}</style>

      {/* Main Interactive Button */}
      <button
        type="button"
        onClick={handleSantaClick}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-transform duration-300 ${
          isJolly ? 'animate-santa-jolly' : 'group-hover:scale-105 active:scale-95'
        }`}
        title="Jolly Santa Claus • Click for Ho Ho Ho & Holiday Presents!"
        aria-label="Santa Claus"
      >
        <div className="relative flex flex-col items-center">
          {/* Ambient Warm Crimson/Gold Glow Behind Santa */}
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 pointer-events-none ${
              isJolly
                ? 'w-48 h-48 bg-gradient-to-r from-red-500/50 via-amber-400/60 to-rose-400/50 blur-2xl scale-125'
                : 'w-24 h-24 rounded-full bg-red-500/20 blur-xl'
            }`}
          />

          {/* SVG Illustration: Handcrafted Illustrated Santa Claus */}
          <svg
            className="w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 drop-shadow-2xl overflow-visible"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White Sticker Outline Filter */}
            <defs>
              <filter id="santaStickerOutline" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="1" />
                <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="#FFFFFF" floodOpacity="0.85" />
              </filter>

              {/* Red Velvet Santa Suit Gradient */}
              <linearGradient id="santaRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="50%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#991B1B" />
              </linearGradient>

              {/* Santa Gift Sack Green Gradient */}
              <linearGradient id="sackGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#15803D" />
                <stop offset="50%" stopColor="#166534" />
                <stop offset="100%" stopColor="#14532D" />
              </linearGradient>

              {/* Golden Sleigh Bell Gradient */}
              <linearGradient id="bellGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="40%" stopColor="#FACC15" />
                <stop offset="80%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>
            </defs>

            {/* Main Santa Artwork with Sticker Outline */}
            <g filter="url(#santaStickerOutline)">
              {/* ======================================================== */}
              {/* 1. GREEN VELVET GIFT SACK (Behind Santa)                 */}
              {/* ======================================================== */}
              <path
                d="M 32 120 C 18 140, 16 195, 38 214 C 54 226, 78 220, 82 205 C 84 185, 75 140, 56 122 Z"
                fill="url(#sackGreenGrad)"
                stroke="#0E3D12"
                strokeWidth="1.5"
              />
              {/* Sack Tied Golden Cord */}
              <path
                d="M 46 130 Q 56 136 62 130"
                fill="none"
                stroke="#FDE047"
                strokeWidth="2.5"
              />
              {/* Gifts Peeking from Sack */}
              <rect x="34" y="112" width="16" height="16" rx="2" fill="#E11D48" stroke="#1F2937" strokeWidth="0.8" />
              <rect x="40" y="112" width="3" height="16" fill="#FDE047" />
              {/* Candy Cane in Sack */}
              <path
                d="M 48 116 L 48 102 C 48 97, 56 97, 56 102"
                fill="none"
                stroke="#DC2626"
                strokeWidth="3.2"
                strokeDasharray="3 3"
                strokeLinecap="round"
              />

              {/* ======================================================== */}
              {/* 2. SANTA'S BODY & RED COAT                               */}
              {/* ======================================================== */}
              {/* Red Velvet Coat Torso */}
              <path
                d="M 64 140 C 58 175, 62 215, 100 218 C 138 215, 142 175, 136 140 Z"
                fill="url(#santaRedGrad)"
                stroke="#3E160D"
                strokeWidth="1.6"
              />

              {/* Black Leather Belt with Brass Buckle */}
              <rect x="62" y="182" width="76" height="12" rx="2" fill="#1F2937" stroke="#111827" strokeWidth="0.8" />
              {/* Golden Belt Buckle */}
              <rect x="90" y="178" width="20" height="20" rx="3" fill="url(#bellGoldGrad)" stroke="#3E160D" strokeWidth="1.2" />
              <rect x="95" y="183" width="10" height="10" rx="1" fill="#1F2937" />

              {/* White Fluffy Fur Hem at Bottom of Coat */}
              <path
                d="M 64 214 Q 76 222 88 214 Q 100 222 112 214 Q 124 222 136 214"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="7"
                strokeLinecap="round"
              />

              {/* Left Arm with Green Mitten Resting on Sack */}
              <path
                d="M 68 144 C 54 154, 48 168, 54 182"
                fill="none"
                stroke="url(#santaRedGrad)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <circle cx="54" cy="182" r="7" fill="#15803D" stroke="#3E160D" strokeWidth="1" />

              {/* Right Arm Ringing the Bell */}
              <path
                d="M 132 144 C 146 150, 154 142, 156 128"
                fill="none"
                stroke="url(#santaRedGrad)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* White Fur Cuff */}
              <ellipse cx="152" cy="132" rx="7" ry="5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.8" />
              {/* Green Mitten */}
              <circle cx="156" cy="126" r="6.5" fill="#15803D" stroke="#3E160D" strokeWidth="1" />

              {/* Ringing Golden Christmas Bell in Hand */}
              <g id="santaBellGroup" className="animate-bell-ring">
                {/* Red Bell Ribbon Bow */}
                <circle cx="156" cy="124" r="3.2" fill="#EF4444" />
                <path d="M 154 125 L 150 132 M 158 125 L 162 132" stroke="#EF4444" strokeWidth="2" />
                {/* Bell Body */}
                <path
                  d="M 152 124 C 153 118, 163 118, 164 124 L 168 138 C 168 141, 148 141, 148 138 Z"
                  fill="url(#bellGoldGrad)"
                  stroke="#3E160D"
                  strokeWidth="1"
                />
                {/* Bell Clapper */}
                <circle cx="158" cy="141" r="2.5" fill="#B45309" />
                {/* Bell Sound Waves */}
                <path d="M 172 128 Q 176 132 172 136" fill="none" stroke="#FFD54F" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 176 125 Q 182 132 176 139" fill="none" stroke="#FFD54F" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* ======================================================== */}
              {/* 3. SANTA'S CHEERFUL HEAD, FACE & BEARD                   */}
              {/* ======================================================== */}
              {/* Face (Warm Peachy Flesh) */}
              <ellipse cx="100" cy="104" rx="24" ry="22" fill="#FBCFE8" stroke="#3E160D" strokeWidth="1" />

              {/* Rosy Cheeks */}
              <circle cx="86" cy="108" r="6" fill="#F43F5E" fillOpacity="0.5" />
              <circle cx="114" cy="108" r="6" fill="#F43F5E" fillOpacity="0.5" />

              {/* Smiling Happy Eyes */}
              <path d="M 86 98 Q 91 94 95 98" fill="none" stroke="#3E160D" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M 105 98 Q 109 94 114 98" fill="none" stroke="#3E160D" strokeWidth="2.2" strokeLinecap="round" />

              {/* Cute Round Nose */}
              <circle cx="100" cy="103" r="5" fill="#FB7185" stroke="#3E160D" strokeWidth="0.9" />

              {/* Grand Flowing White Beard */}
              <path
                d="M 76 108 C 68 126, 68 155, 84 175 C 92 184, 108 184, 116 175 C 132 155, 132 126, 124 108 C 118 122, 82 122, 76 108 Z"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="1.2"
              />
              {/* Textured Beard Curlicues */}
              <path d="M 88 140 Q 94 154 100 148 Q 106 154 112 140" fill="none" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
              <path d="M 94 158 Q 100 168 106 158" fill="none" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

              {/* Fluffy White Mustache */}
              <path
                d="M 100 108 C 92 108, 80 114, 82 122 C 88 124, 96 116, 100 112 C 104 116, 112 124, 118 122 C 120 114, 108 108, 100 108 Z"
                fill="#FFFFFF"
                stroke="#94A3B8"
                strokeWidth="1"
              />

              {/* ======================================================== */}
              {/* 4. RED VELVET SANTA HAT WITH WHITE POMPOM                */}
              {/* ======================================================== */}
              {/* Hat Brim (Fluffy White Fur Band) */}
              <ellipse cx="100" cy="88" rx="28" ry="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />

              {/* Red Velvet Drooping Cap */}
              <path
                d="M 74 86 C 72 54, 118 42, 134 58 C 146 68, 148 94, 144 102"
                fill="none"
                stroke="url(#santaRedGrad)"
                strokeWidth="28"
                strokeLinecap="round"
              />

              {/* Pompom at Tip of Hat */}
              <circle cx="144" cy="104" r="9" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />

              {/* Festive Sparkle Glints */}
              <circle cx="144" cy="52" r="2.2" fill="#FEF08A" className="animate-ping" />
              <circle cx="58" cy="88" r="2" fill="#FEF08A" />
              <circle cx="148" cy="180" r="2" fill="#FFFFFF" className="animate-ping" />
            </g>
          </svg>

          {/* Festive Badge Tag Underneath Santa */}
          <div className="mt-1 flex items-center space-x-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-700 text-white text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full shadow-md border border-red-300/80 tracking-wider uppercase group-hover:scale-105 transition-transform">
            <Gift className="w-3 h-3 text-red-200 animate-bounce fill-red-200" />
            <span>Jolly Santa</span>
          </div>
        </div>
      </button>

      {/* Floating Festive Speech Callout on Click */}
      {showBubble && (
        <div className="absolute -top-12 right-2 sm:right-4 z-50 whitespace-nowrap bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-red-700 dark:text-red-300 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-2xl border-2 border-red-400 animate-in fade-in zoom-in-75 duration-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-red-500 animate-bounce shrink-0" />
          <span>{bubbleText}</span>
          <div className="absolute right-8 -bottom-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-red-400 rotate-45" />
        </div>
      )}

      {/* DYNAMIC HOLIDAY PRESENTS, GINGERBREAD STARS & BELLS SHOWER */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `holidayParticleFly ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
            pointerEvents: 'none',
            zIndex: 99999
          }}
          className="will-change-transform"
        >
          {p.type === 'present' ? (
            /* Wrapped Present Box SVG */
            <svg
              width={p.size * 1.2}
              height={p.size * 1.2}
              viewBox="0 0 24 24"
              fill={p.color}
              stroke="#B91C1C"
              strokeWidth="1"
              className="drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
            >
              <rect x="3" y="8" width="18" height="13" rx="2" fill={p.color} />
              <rect x="2" y="5" width="20" height="4" rx="1" fill="#FEF08A" />
              <line x1="12" y1="5" x2="12" y2="21" stroke="#FEF08A" strokeWidth="2" />
            </svg>
          ) : p.type === 'bell' ? (
            /* Golden Sleigh Bell SVG */
            <svg
              width={p.size * 1.1}
              height={p.size * 1.1}
              viewBox="0 0 24 24"
              fill="#FACC15"
              stroke="#B45309"
              strokeWidth="1"
              className="drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"
            >
              <path d="M 6 16 C 6 10, 18 10, 18 16 L 20 18 L 4 18 Z" fill="#FACC15" />
              <circle cx="12" cy="19.5" r="2.5" fill="#EAB308" />
            </svg>
          ) : p.type === 'star' ? (
            /* Golden Gingerbread Star */
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill="#FDE047"
              className="drop-shadow-[0_0_8px_rgba(253,224,71,0.85)]"
            >
              <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
            </svg>
          ) : (
            /* Soft Sparkling Snow Crystal */
            <div
              style={{
                width: `${p.size * 0.8}px`,
                height: `${p.size * 0.8}px`,
                backgroundColor: '#FFFFFF',
                boxShadow: '0 0 8px #FFFFFF, 0 0 16px #60A5FA'
              }}
              className="rounded-full"
            />
          )}
        </div>
      ))}
    </div>
  );
}
