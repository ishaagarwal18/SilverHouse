import React, { useState } from 'react';
import { Sparkles, Wind, Sun } from 'lucide-react';
import UttarayanModal from './UttarayanModal';
import UttarayanKiteMotif from './UttarayanKiteMotif';
import UttarayanSuryaTilgulMotif from './UttarayanSuryaTilgulMotif';

/**
 * UttarayanFestivalDecor - Master Uttarayan & Makar Sankranti Festival Suite for Silver House
 * 
 * Features:
 * 1. Ambient Floating Mini Kites, Manja Streamers & Golden Solar Starlight.
 * 2. Top Header Colorful Kite, Firki Spool & Golden Sun Toran Garland.
 * 3. Center "Kai Po Che! Happy Uttarayan • Soar High with Pure Silver Keepsakes" banner badge.
 * 4. Bottom-Left: Colorful Flying Kite & Traditional Wooden/Silver Firki (UttarayanKiteMotif).
 * 5. Bottom-Right: Radiant Surya Dev, Til-Gud Laddoos & Sugarcane (UttarayanSuryaTilgulMotif).
 * 6. Interactive Uttarayan Traditions & Silver Gifting Showcase Modal (UttarayanModal).
 */
export default function UttarayanFestivalDecor({ onNavigateToFestival }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate lightweight ambient floating kites and solar sparkles
  const floaters = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    left: `${(i * 4.2 + (i % 3) * 1.5).toFixed(1)}%`,
    size: (i % 3 === 0 ? 10 : i % 2 === 0 ? 7 : 5),
    duration: (6.8 + (i % 4) * 1.8).toFixed(1),
    delay: ((i * 0.45) % 4.5).toFixed(1),
    opacity: (0.35 + (i % 3) * 0.18).toFixed(2),
    color: ['#F97316', '#FACC15', '#06B6D4', '#EC4899', '#EF4444', '#10B981', '#FFFFFF'][i % 7],
    type: i % 2 === 0 ? 'kite' : 'solar'
  }));

  return (
    <>
      {/* 1. AMBIENT FLOATING COLORFUL KITES & SOLAR SPARKLES */}
      <div className="fixed inset-0 pointer-events-none z-[35] overflow-hidden">
        <style>{`
          @keyframes ambientUttarayanFloat {
            0% {
              transform: translateY(105vh) translateX(0px) rotate(0deg);
              opacity: 0;
            }
            15% {
              opacity: var(--utt-opacity);
            }
            50% {
              transform: translateY(50vh) translateX(18px) rotate(-15deg);
            }
            85% {
              opacity: var(--utt-opacity);
            }
            100% {
              transform: translateY(-20px) translateX(-15px) rotate(25deg);
              opacity: 0;
            }
          }
          .animate-utt-float {
            animation: ambientUttarayanFloat var(--utt-duration) linear infinite;
            animation-delay: var(--utt-delay);
          }
        `}</style>
        {floaters.map((p) => (
          <div
            key={p.id}
            style={{
              left: p.left,
              bottom: '-15px',
              '--utt-duration': `${p.duration}s`,
              '--utt-delay': `${p.delay}s`,
              '--utt-opacity': p.opacity
            }}
            className="absolute animate-utt-float pointer-events-none"
          >
            {p.type === 'kite' ? (
              <svg
                width={p.size * 1.4}
                height={p.size * 1.4}
                viewBox="0 0 24 24"
                fill={p.color}
                style={{ filter: `drop-shadow(0 0 6px ${p.color})` }}
              >
                <polygon points="12,2 22,12 12,22 2,12" />
                <line x1="12" y1="2" x2="12" y2="22" stroke="#FFFFFF" strokeWidth="1" />
                <path d="M 2 12 Q 12 6 22 12" stroke="#FFFFFF" strokeWidth="1" fill="none" />
                <polygon points="10,22 14,22 12,24" fill="#FACC15" />
              </svg>
            ) : (
              <svg
                width={p.size * 1.2}
                height={p.size * 1.2}
                viewBox="0 0 24 24"
                fill={p.color}
                style={{ filter: `drop-shadow(0 0 5px ${p.color})` }}
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="4" stroke={p.color} strokeWidth="2" />
                <line x1="12" y1="20" x2="12" y2="23" stroke={p.color} strokeWidth="2" />
                <line x1="1" y1="12" x2="4" y2="12" stroke={p.color} strokeWidth="2" />
                <line x1="20" y1="12" x2="23" y2="12" stroke={p.color} strokeWidth="2" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* 2. INTERACTIVE UTTARAYAN TRADITIONS & GIFTING SHOWCASE MODAL */}
      <UttarayanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNavigateToFestival={onNavigateToFestival}
      />

      {/* 3. BOTTOM-LEFT: COLORFUL FLYING KITE & FIRKI SPOOL */}
      <UttarayanKiteMotif onOpenModal={() => setIsModalOpen(true)} />

      {/* 4. TOP HEADER COLORFUL KITE & GOLDEN SUN TORAN GARLAND */}
      <div className="w-full relative z-[45] pointer-events-none select-none overflow-hidden h-7 sm:h-9 bg-gradient-to-r from-amber-950/35 via-orange-800/30 to-amber-950/35 border-b border-amber-400/40 flex items-center justify-between px-2 sm:px-6">
        {/* Repeating Toran SVG with Colorful Miniature Kites, Golden Suns & Swags */}
        <div className="absolute inset-0 flex items-center justify-between opacity-95 overflow-hidden">
          <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 1200 40">
            <defs>
              <linearGradient id="uttSunGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9C4" />
                <stop offset="50%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
              <linearGradient id="uttRopeAmber" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
              <linearGradient id="uttCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67E8F9" />
                <stop offset="100%" stopColor="#0891B2" />
              </linearGradient>
              <linearGradient id="uttPink" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#DB2777" />
              </linearGradient>
            </defs>

            {/* Repeating Festive Toran Scallops */}
            {Array.from({ length: 24 }).map((_, i) => {
              const cx = i * 50 + 25;
              const isEven = i % 2 === 0;
              return (
                <g key={`utttoran-${i}`}>
                  {/* Golden Manja Thread Swag */}
                  <path
                    d={`M ${cx - 25} 0 Q ${cx} 22 ${cx + 25} 0`}
                    fill="none"
                    stroke="url(#uttRopeAmber)"
                    strokeWidth="1.8"
                    strokeDasharray="2 2"
                  />
                  {/* Colored Ribbon Accent Swag */}
                  <path
                    d={`M ${cx - 25} 2 Q ${cx} 24 ${cx + 25} 2`}
                    fill="none"
                    stroke={isEven ? '#06B6D4' : '#F97316'}
                    strokeWidth="2.2"
                  />

                  {/* Alternating Miniature Hanging Kite or Surya Sun Disc */}
                  {isEven ? (
                    /* Mini Diamond Kite */
                    <g transform={`translate(${cx}, 14) scale(0.65)`}>
                      <polygon points="0,-12 10,0 0,12 -10,0" fill="url(#uttSunGold)" stroke="#3E160D" strokeWidth="0.8" />
                      <line x1="0" y1="-12" x2="0" y2="12" stroke="#FFFFFF" strokeWidth="1" />
                      <path d="M -10 0 Q 0 -6 10 0" stroke="#FFFFFF" strokeWidth="1" fill="none" />
                      <polygon points="-3,12 3,12 0,16" fill="#F43F5E" />
                    </g>
                  ) : (
                    /* Mini Surya Sun Disc with Rays */
                    <g transform={`translate(${cx}, 14) scale(0.65)`}>
                      <circle cx="0" cy="0" r="7" fill="url(#uttSunGold)" stroke="#3E160D" strokeWidth="0.8" />
                      <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
                      <line x1="0" y1="-10" x2="0" y2="-7" stroke="#FACC15" strokeWidth="1.5" />
                      <line x1="0" y1="7" x2="0" y2="10" stroke="#FACC15" strokeWidth="1.5" />
                      <line x1="-10" y1="0" x2="-7" y2="0" stroke="#FACC15" strokeWidth="1.5" />
                      <line x1="7" y1="0" x2="10" y2="0" stroke="#FACC15" strokeWidth="1.5" />
                    </g>
                  )}

                  {/* Hanging Yellow Marigold Bead */}
                  <circle cx={cx} cy="26" r="2.2" fill="#FACC15" stroke="#3E160D" strokeWidth="0.5" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Center Uttarayan Greeting Banner Badge */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 mx-auto flex items-center space-x-2 bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 text-[10px] sm:text-xs font-black tracking-widest uppercase px-3 sm:px-4 py-0.5 rounded-full shadow-md border border-yellow-200 pointer-events-auto cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-slate-950 animate-ping" />
          <span>🪁 Kai Po Che! Happy Uttarayan • Soar High with Pure Silver Keepsakes ☀️</span>
          <span className="inline-block w-2 h-2 rounded-full bg-slate-950 animate-ping" />
        </button>
      </div>

      {/* 5. BOTTOM-RIGHT: RADIANT SURYA DEV, TIL-GUD LADDOOS & SUGARCANE */}
      <UttarayanSuryaTilgulMotif onOpenModal={() => setIsModalOpen(true)} />
    </>
  );
}
