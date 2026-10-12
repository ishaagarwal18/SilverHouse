import React, { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';

/**
 * GaneshaDivineMotif - Benevolent Lord Ganesha (Vighnaharta) with Crown, Modak & Blessing
 * Positioned on bottom-left corner during Ganesh Chaturthi Festival Mode.
 * 
 * Features:
 * - Handcrafted illustrated vector of Bal Ganesha / Vighnaharta:
 *   Ornate royal Mukut (golden crown) with ruby gems, peaceful eyes, auspicious tilak,
 *   curved trunk (Vakratunda) cradling a golden modak, abhaya mudra blessing hand with lotus,
 *   rich saffron-yellow pitambar dhoti, and radiant divine aura.
 * - White sticker outline filter matching the boutique illustration aesthetic.
 * - Interactive on CLICK:
 *   1. Temple Shankh (Conch) blast + auspicious Aarti Ghanta bell chime (Web Audio API).
 *   2. Joyful Ganesha blessing bounce & halo radiance pulse.
 *   3. 50+ Golden Modaks, Crimson Hibiscus (Jaswand) Petals & Sacred Durva Grass shower!
 *   4. Auspicious "Ganpati Bappa Morya!" speech callout.
 */
export default function GaneshaDivineMotif({ onOpenModal }) {
  const [isBlessing, setIsBlessing] = useState(false);
  const [particles, setParticles] = useState([]);
  const [bubbleText, setBubbleText] = useState('Ganpati Bappa Morya! 🐘');
  const [showBubble, setShowBubble] = useState(false);

  const GANESHA_BLESSINGS = [
    'Ganpati Bappa Morya! Mangal Murti Morya! 🐘',
    'Vighnaharta Blessings of Wisdom & Success! ✨',
    'May Bappa Remove All Obstacles in Your Life! 🌺',
    'Siddhi Vinayak Prosperity & Good Fortune! 💛',
    'Shubh Ganeshotsav to You & Your Family! 🪔'
  ];

  // Synthesize sacred temple conch blast + vibrant aarti ghanta chime
  const playGaneshaAartiAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Resonant Divine Shankh (Conch Shell) Blast
      const shankh = ctx.createOscillator();
      const shankhGain = ctx.createGain();
      const shankhFilter = ctx.createBiquadFilter();

      shankh.type = 'sawtooth';
      shankh.frequency.setValueAtTime(293.66, now); // D4
      shankh.frequency.linearRampToValueAtTime(329.63, now + 0.35); // E4
      shankh.frequency.linearRampToValueAtTime(293.66, now + 0.95);

      shankhFilter.type = 'bandpass';
      shankhFilter.frequency.setValueAtTime(620, now);
      shankhFilter.Q.setValueAtTime(3.2, now);

      shankhGain.gain.setValueAtTime(0.001, now);
      shankhGain.gain.linearRampToValueAtTime(0.24, now + 0.2);
      shankhGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      shankh.connect(shankhFilter);
      shankhFilter.connect(shankhGain);
      shankhGain.connect(ctx.destination);

      shankh.start(now);
      shankh.stop(now + 1.25);

      // 2. Auspicious Temple Aarti Bell / Ghanti Rhythmic Peals
      const bellTimes = [0.08, 0.22, 0.40, 0.58, 0.78, 0.98, 1.20];
      bellTimes.forEach((offset, idx) => {
        const t = now + offset;
        const bell = ctx.createOscillator();
        const bellGain = ctx.createGain();

        bell.type = 'sine';
        bell.frequency.setValueAtTime(1200 + (idx % 3) * 280, t);

        bellGain.gain.setValueAtTime(0.12, t);
        bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

        bell.connect(bellGain);
        bellGain.connect(ctx.destination);

        bell.start(t);
        bell.stop(t + 0.18);
      });
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  };

  const handleClick = (e) => {
    setIsBlessing(true);
    playGaneshaAartiAudio();

    const randomGreeting = GANESHA_BLESSINGS[Math.floor(Math.random() * GANESHA_BLESSINGS.length)];
    setBubbleText(randomGreeting);
    setShowBubble(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width * 0.5;
    const originY = rect.top + rect.height * 0.35;

    // 50+ dynamic sacred particles: Golden Modaks, Crimson Hibiscus Petals, Green Durva Blades
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
        color: ['#F59E0B', '#EF4444', '#DC2626', '#16A34A', '#22C55E', '#FDE047', '#FFD54F'][i % 7],
        duration: 1.4 + Math.random() * 0.85,
        delay: Math.random() * 0.25,
        type: i % 3 === 0 ? 'modak' : i % 3 === 1 ? 'hibiscus' : 'durva'
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
      {/* Keyframe Animations */}
      <style>{`
        @keyframes ganeshaGentleSway {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(0.8deg); }
        }

        @keyframes ganeshaBlessPulse {
          0% { transform: scale(1) translateY(0); }
          25% { transform: scale(1.1, 0.94) translateY(4px); }
          50% { transform: scale(0.96, 1.12) translateY(-10px) rotate(-1.5deg); }
          75% { transform: scale(1.04, 0.97) translateY(-3px) rotate(1deg); }
          100% { transform: scale(1) translateY(0); }
        }

        @keyframes ganeshaHaloPulse {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(253, 224, 71, 0.8));
          }
          50% {
            filter: drop-shadow(0 0 22px rgba(251, 191, 36, 1)) drop-shadow(0 0 34px rgba(245, 158, 11, 0.7));
          }
        }

        @keyframes ganeshaParticleFlutter {
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

        .animate-ganesha-idle {
          animation: ganeshaGentleSway 3.2s ease-in-out infinite;
        }

        .animate-ganesha-bless {
          animation: ganeshaBlessPulse 0.85s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-ganesha-halo {
          animation: ganeshaHaloPulse 3s ease-in-out infinite;
        }
      `}</style>

      {/* Main Interactive Button */}
      <button
        type="button"
        onClick={handleClick}
        className={`relative focus:outline-none cursor-pointer flex flex-col items-center transition-transform duration-300 ${
          isBlessing ? 'animate-ganesha-bless' : 'group-hover:scale-105 active:scale-95'
        }`}
        title="Lord Ganesha (Vighnaharta) • Click for Divine Blessings & Modaks!"
        aria-label="Lord Ganesha Motif"
      >
        <div className="relative flex flex-col items-center">
          {/* Ambient Warm Golden & Saffron Aura Behind Ganesha */}
          <div
            className={`absolute top-2 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 pointer-events-none ${
              isBlessing
                ? 'w-48 h-48 bg-gradient-to-r from-amber-300/60 via-yellow-400/60 to-rose-400/50 blur-2xl scale-125'
                : 'w-24 h-24 rounded-full bg-amber-400/25 blur-xl'
            }`}
          />

          {/* SVG Illustration: Handcrafted Illustrated Lord Ganesha */}
          <svg
            className="w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 drop-shadow-2xl overflow-visible animate-ganesha-idle"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White Sticker Outline Filter */}
            <defs>
              <filter id="ganeshaStickerOutline" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="1" />
                <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="#FFFFFF" floodOpacity="0.85" />
              </filter>

              {/* Royal Golden Mukut Gradient */}
              <linearGradient id="ganeshGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9C4" />
                <stop offset="30%" stopColor="#FFD54F" />
                <stop offset="70%" stopColor="#FFA000" />
                <stop offset="100%" stopColor="#E65100" />
              </linearGradient>

              {/* Warm Soft Skin Gradient */}
              <linearGradient id="ganeshSkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE0B2" />
                <stop offset="60%" stopColor="#FFCC80" />
                <stop offset="100%" stopColor="#FFA726" />
              </linearGradient>

              {/* Saffron Pitambar Dhoti Gradient */}
              <linearGradient id="pitambarDhotiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFB300" />
                <stop offset="50%" stopColor="#FB8C00" />
                <stop offset="100%" stopColor="#E65100" />
              </linearGradient>

              {/* Modak Steamed Golden Sweet Gradient */}
              <linearGradient id="modakSweetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFDE7" />
                <stop offset="40%" stopColor="#FFF59D" />
                <stop offset="80%" stopColor="#FDD835" />
                <stop offset="100%" stopColor="#F57F17" />
              </linearGradient>
            </defs>

            {/* Main Ganesha Artwork with Sticker Outline */}
            <g filter="url(#ganeshaStickerOutline)">
              {/* ======================================================== */}
              {/* 1. DIVINE HALO (PRABHAVALI) BEHIND HEAD                  */}
              {/* ======================================================== */}
              <g className="animate-ganesha-halo">
                <circle cx="100" cy="85" r="48" fill="#FEF08A" fillOpacity="0.5" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="4 3" />
                {/* Ray Beams from Halo */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
                  const rad = (deg * Math.PI) / 180;
                  const x1 = 100 + Math.cos(rad) * 44;
                  const y1 = 85 + Math.sin(rad) * 44;
                  const x2 = 100 + Math.cos(rad) * 52;
                  const y2 = 85 + Math.sin(rad) * 52;
                  return <line key={`halo-ray-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#EAB308" strokeWidth="1.6" strokeLinecap="round" />;
                })}
              </g>

              {/* ======================================================== */}
              {/* 2. GANESHA'S ROYAL LOTUS ASANA PEDESTAL                  */}
              {/* ======================================================== */}
              {/* Bottom Lotus Base Plate */}
              <ellipse cx="100" cy="216" rx="58" ry="14" fill="#FFCA28" stroke="#3E160D" strokeWidth="1.6" />
              {/* Crimson Lotus Petals */}
              <path d="M 50 212 Q 42 198 58 194 Q 66 206 70 214 Z" fill="#DC2626" stroke="#3E160D" strokeWidth="1" />
              <path d="M 68 214 Q 62 196 78 190 Q 86 204 84 214 Z" fill="#DC2626" stroke="#3E160D" strokeWidth="1" />
              <path d="M 86 215 Q 88 192 100 186 Q 112 192 114 215 Z" fill="#DC2626" stroke="#3E160D" strokeWidth="1.2" />
              <path d="M 116 214 Q 114 204 122 190 Q 138 196 132 214 Z" fill="#DC2626" stroke="#3E160D" strokeWidth="1" />
              <path d="M 130 212 Q 134 206 142 194 Q 158 198 150 212 Z" fill="#DC2626" stroke="#3E160D" strokeWidth="1" />

              {/* ======================================================== */}
              {/* 3. BODY & SAFFRON PITAMBAR DHOTI                         */}
              {/* ======================================================== */}
              {/* Plump Divine Belly (Lambodara) */}
              <ellipse cx="100" cy="172" rx="36" ry="32" fill="url(#ganeshSkinGrad)" stroke="#3E160D" strokeWidth="1.6" />

              {/* Auspicious Sacred Thread (Yajnopavita / Janeu) */}
              <path d="M 76 145 C 84 165, 108 185, 126 195" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 2" />

              {/* Saffron Silk Pitambar Dhoti Fold */}
              <path
                d="M 66 182 C 72 206, 92 210, 100 210 C 108 210, 128 206, 134 182 C 122 186, 78 186, 66 182 Z"
                fill="url(#pitambarDhotiGrad)"
                stroke="#3E160D"
                strokeWidth="1.4"
              />
              {/* Dhoti Golden Zari Border */}
              <path d="M 70 186 Q 100 196 130 186" fill="none" stroke="#FFD54F" strokeWidth="2.5" />

              {/* Little Blessed Feet Resting on Lotus */}
              <ellipse cx="78" cy="210" rx="12" ry="6" fill="url(#ganeshSkinGrad)" stroke="#3E160D" strokeWidth="1" />
              <ellipse cx="122" cy="210" rx="12" ry="6" fill="url(#ganeshSkinGrad)" stroke="#3E160D" strokeWidth="1" />
              {/* Golden Anklets (Payal) */}
              <path d="M 70 208 Q 78 212 86 208" stroke="#FDE047" strokeWidth="2" />
              <path d="M 114 208 Q 122 212 130 208" stroke="#FDE047" strokeWidth="2" />

              {/* ======================================================== */}
              {/* 4. LARGE AUSPICIOUS EARS (SUPAKARNA)                     */}
              {/* ======================================================== */}
              {/* Left Fan-shaped Ear */}
              <path
                d="M 76 80 C 44 65, 34 100, 52 125 C 64 140, 78 135, 78 120 Z"
                fill="url(#ganeshSkinGrad)"
                stroke="#3E160D"
                strokeWidth="1.6"
              />
              <path d="M 70 92 C 52 82, 46 106, 58 120" fill="none" stroke="#F97316" strokeWidth="1.4" strokeLinecap="round" />

              {/* Right Fan-shaped Ear */}
              <path
                d="M 124 80 C 156 65, 166 100, 148 125 C 136 140, 122 135, 122 120 Z"
                fill="url(#ganeshSkinGrad)"
                stroke="#3E160D"
                strokeWidth="1.6"
              />
              <path d="M 130 92 C 148 82, 154 106, 142 120" fill="none" stroke="#F97316" strokeWidth="1.4" strokeLinecap="round" />

              {/* ======================================================== */}
              {/* 5. ARMS & ABHAYA MUDRA BLESSING HAND                     */}
              {/* ======================================================== */}
              {/* Right Arm: Abhaya Mudra (Blessing Hand with "Om" / Swastik) */}
              <path d="M 72 144 C 54 148, 48 136, 52 120" fill="none" stroke="url(#ganeshSkinGrad)" strokeWidth="13" strokeLinecap="round" />
              <circle cx="52" cy="116" r="7.5" fill="url(#ganeshSkinGrad)" stroke="#3E160D" strokeWidth="1" />
              {/* Red Lotus Symbol in Palm */}
              <circle cx="52" cy="116" r="2.8" fill="#DC2626" />

              {/* Left Arm: Cradling Golden Modak on Trunk/Hand */}
              <path d="M 128 144 C 146 148, 152 138, 148 125" fill="none" stroke="url(#ganeshSkinGrad)" strokeWidth="13" strokeLinecap="round" />
              <circle cx="146" cy="122" r="7.5" fill="url(#ganeshSkinGrad)" stroke="#3E160D" strokeWidth="1" />

              {/* ======================================================== */}
              {/* 6. DIVINE HEAD, FACE, TRUNK (VAKRATUNDA) & TUSK          */}
              {/* ======================================================== */}
              {/* Head Base */}
              <ellipse cx="100" cy="100" rx="28" ry="26" fill="url(#ganeshSkinGrad)" stroke="#3E160D" strokeWidth="1.5" />

              {/* Kind Gentle Eyes */}
              <ellipse cx="88" cy="94" rx="4" ry="2.8" fill="#3E160D" />
              <circle cx="89" cy="93" r="1.2" fill="#FFFFFF" />
              <ellipse cx="112" cy="94" rx="4" ry="2.8" fill="#3E160D" />
              <circle cx="113" cy="93" r="1.2" fill="#FFFFFF" />

              {/* Auspicious Red & Yellow Trishul Tilak on Forehead */}
              <path d="M 94 76 L 106 76 M 96 80 L 104 80 M 98 84 L 102 84" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
              <line x1="100" y1="72" x2="100" y2="86" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="100" cy="80" r="1.8" fill="#DC2626" />

              {/* Left Single Tusk (Ekadanta) */}
              <path d="M 88 112 L 80 118 L 86 118 Z" fill="#FFFFFF" stroke="#3E160D" strokeWidth="0.8" />
              {/* Broken Right Tusk (Traditional Ekadanta Story) */}
              <path d="M 112 112 L 115 115 L 113 115 Z" fill="#FFFFFF" stroke="#3E160D" strokeWidth="0.8" />

              {/* Graceful Curved Trunk (Vakratunda) Sweeping Left-to-Right */}
              <path
                d="M 94 104 C 94 125, 90 148, 102 152 C 114 154, 126 142, 128 132 C 128 126, 124 126, 122 130 C 118 136, 108 140, 104 134 C 100 128, 104 116, 106 104 Z"
                fill="url(#ganeshSkinGrad)"
                stroke="#3E160D"
                strokeWidth="1.5"
              />
              {/* Decorative Tilak Dots on Trunk */}
              <circle cx="100" cy="118" r="1.5" fill="#DC2626" />
              <circle cx="101" cy="126" r="1.5" fill="#FDE047" />
              <circle cx="103" cy="134" r="1.5" fill="#DC2626" />

              {/* Sacred Steamed Modak Held Lovingly in Trunk */}
              <g transform="translate(126, 118)">
                {/* Modak Teardrop Swirl */}
                <path
                  d="M 8 0 C 2 6, 0 12, 4 16 C 8 20, 18 20, 20 15 C 22 10, 14 6, 8 0 Z"
                  fill="url(#modakSweetGrad)"
                  stroke="#3E160D"
                  strokeWidth="1"
                />
                {/* Modak Fluted Creases */}
                <path d="M 8 3 Q 11 10 12 17" stroke="#F57F17" strokeWidth="1" fill="none" />
                <path d="M 8 3 Q 6 10 5 16" stroke="#F57F17" strokeWidth="1" fill="none" />
                {/* Saffron Kesar Strand on Modak */}
                <line x1="8" y1="1" x2="8" y2="4" stroke="#DC2626" strokeWidth="1.4" />
              </g>

              {/* ======================================================== */}
              {/* 7. ORNATE ROYAL MUKUT (GOLDEN CROWN)                     */}
              {/* ======================================================== */}
              {/* Crown Base Tier */}
              <path
                d="M 80 76 L 82 56 L 100 42 L 118 56 L 120 76 Z"
                fill="url(#ganeshGoldGrad)"
                stroke="#3E160D"
                strokeWidth="1.6"
              />
              {/* Tier 2 Crown Peak */}
              <polygon
                points="100,24 108,44 92,44"
                fill="url(#ganeshGoldGrad)"
                stroke="#3E160D"
                strokeWidth="1.2"
              />
              {/* Ruby & Emerald Gem Accents on Crown */}
              <circle cx="100" cy="36" r="2.5" fill="#DC2626" stroke="#3E160D" strokeWidth="0.5" />
              <circle cx="92" cy="62" r="2.2" fill="#16A34A" stroke="#3E160D" strokeWidth="0.5" />
              <circle cx="100" cy="60" r="2.8" fill="#DC2626" stroke="#3E160D" strokeWidth="0.5" />
              <circle cx="108" cy="62" r="2.2" fill="#16A34A" stroke="#3E160D" strokeWidth="0.5" />

              {/* Crown Pearl Crest Trim */}
              {[-16, -8, 0, 8, 16].map((offset, idx) => (
                <circle
                  key={`crown-pearl-${idx}`}
                  cx={100 + offset}
                  cy={74}
                  r="1.8"
                  fill="#FFFFFF"
                  stroke="#3E160D"
                  strokeWidth="0.4"
                />
              ))}

              {/* Floating Sparkle Glints */}
              <polygon points="44,52 46,56 50,57 47,60 48,64 44,62 40,64 41,60 38,57 42,56" fill="#FDE047" stroke="#3E160D" strokeWidth="0.5" className="animate-pulse" />
              <polygon points="156,54 158,58 162,59 159,62 160,66 156,64 152,66 153,62 150,59 154,58" fill="#FDE047" stroke="#3E160D" strokeWidth="0.5" />
            </g>
          </svg>

          {/* Festive Badge Tag Underneath Ganesha */}
          <div className="mt-1 flex items-center space-x-1.5 bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 text-white text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full shadow-md border border-yellow-300/80 tracking-wider uppercase group-hover:scale-105 transition-transform">
            <Sparkles className="w-3 h-3 text-yellow-200 animate-spin" />
            <span>Ganpati Bappa</span>
          </div>
        </div>
      </button>

      {/* Floating Festive Speech Callout on Click */}
      {showBubble && (
        <div className="absolute -top-12 left-2 sm:left-4 z-50 whitespace-nowrap bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-amber-800 dark:text-amber-300 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-2xl border-2 border-amber-400 animate-in fade-in zoom-in-75 duration-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-500 animate-bounce shrink-0" />
          <span>{bubbleText}</span>
          <div className="absolute left-8 -bottom-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-amber-400 rotate-45" />
        </div>
      )}

      {/* DYNAMIC GOLDEN MODAKS, HIBISCUS PETALS & DURVA SHOWER */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `ganeshaParticleFlutter ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
            pointerEvents: 'none',
            zIndex: 99999
          }}
          className="will-change-transform"
        >
          {p.type === 'modak' ? (
            /* Golden Ukadiche Modak SVG */
            <svg
              width={p.size * 1.3}
              height={p.size * 1.3}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(245,158,11,0.85)]"
            >
              <path d="M 12 2 C 7 8, 4 14, 8 20 C 11 22, 17 22, 20 18 C 22 14, 17 8, 12 2 Z" />
            </svg>
          ) : p.type === 'hibiscus' ? (
            /* Red Hibiscus Flower Petal SVG */
            <svg
              width={p.size * 1.2}
              height={p.size * 1.2}
              viewBox="0 0 24 24"
              fill={p.color}
              className="drop-shadow-[0_0_8px_rgba(239,68,68,0.85)]"
            >
              <path d="M 12 2 C 6 6, 4 14, 8 19 C 12 22, 18 20, 20 15 C 22 9, 18 4, 12 2 Z" />
            </svg>
          ) : (
            /* Sacred Green Durva Grass Blade */
            <svg
              width={p.size * 1.1}
              height={p.size * 1.1}
              viewBox="0 0 24 24"
              fill="none"
              stroke={p.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              className="drop-shadow-[0_0_6px_rgba(34,197,94,0.8)]"
            >
              <path d="M 12 22 L 12 12 M 12 16 Q 8 10 4 12 M 12 14 Q 16 8 20 10" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
