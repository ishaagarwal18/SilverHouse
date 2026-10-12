import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import NewYearModal from './NewYearModal';
import NewYearClockMotif from './NewYearClockMotif';
import NewYearPartyPopperMotif from './NewYearPartyPopperMotif';

/**
 * NewYearFestivalDecor - Master Happy New Year Festival Suite for Silver House
 * 
 * Features:
 * 1. Ambient Floating Holographic Confetti & Starlight Shimmer.
 * 2. Top Header Glitzy Metallic Star, Champagne Bubbles & Ribbon Streamer Toran.
 * 3. Center "Happy New Year 2027 • Welcome Fresh Beginnings" greeting banner badge.
 * 4. Bottom-Left: Midnight Countdown Clock & Clinking Flutes (NewYearClockMotif).
 * 5. Bottom-Right: Exploding Party Popper & 2027 Star Balloons (NewYearPartyPopperMotif).
 * 6. Interactive New Year Traditions & Silver Gifting Showcase Modal (NewYearModal).
 */
export default function NewYearFestivalDecor({ onNavigateToFestival }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate lightweight ambient holographic confetti and star particles
  const floaters = Array.from({ length: 22 }).map((_, i) => ({
    id: i,
    left: `${(i * 4.8 + (i % 3) * 1.6).toFixed(1)}%`,
    size: (i % 3 === 0 ? 8 : i % 2 === 0 ? 5 : 3),
    duration: (6.5 + (i % 4) * 1.6).toFixed(1),
    delay: ((i * 0.42) % 4).toFixed(1),
    opacity: (0.35 + (i % 3) * 0.15).toFixed(2),
    color: ['#FDE047', '#F472B6', '#38BDF8', '#4ADE80', '#A78BFA', '#FFFFFF'][i % 6]
  }));

  return (
    <>
      {/* 1. AMBIENT FLOATING CONFETTI & STARLIGHT SHIMMER */}
      <div className="fixed inset-0 pointer-events-none z-[35] overflow-hidden">
        <style>{`
          @keyframes ambientNewYearConfetti {
            0% {
              transform: translateY(-20px) translateX(0px) rotate(0deg);
              opacity: 0;
            }
            15% {
              opacity: var(--confetti-opacity);
            }
            50% {
              transform: translateY(50vh) translateX(18px) rotate(160deg);
            }
            85% {
              opacity: var(--confetti-opacity);
            }
            100% {
              transform: translateY(105vh) translateX(-15px) rotate(320deg);
              opacity: 0;
            }
          }
          .animate-ny-confetti {
            animation: ambientNewYearConfetti var(--confetti-duration) linear infinite;
            animation-delay: var(--confetti-delay);
          }
        `}</style>
        {floaters.map((p) => (
          <div
            key={p.id}
            style={{
              left: p.left,
              top: '-15px',
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              '--confetti-duration': `${p.duration}s`,
              '--confetti-delay': `${p.delay}s`,
              '--confetti-opacity': p.opacity,
              boxShadow: `0 0 6px ${p.color}`
            }}
            className="absolute rounded-sm animate-ny-confetti pointer-events-none"
          />
        ))}
      </div>

      {/* 2. INTERACTIVE NEW YEAR TRADITIONS & GIFTING SHOWCASE MODAL */}
      <NewYearModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNavigateToFestival={onNavigateToFestival}
      />

      {/* 3. BOTTOM-LEFT: MIDNIGHT COUNTDOWN CLOCK & CLINKING CHAMPAGNE FLUTES */}
      <NewYearClockMotif onOpenModal={() => setIsModalOpen(true)} />

      {/* 4. TOP HEADER GLITZY METALLIC STAR & STREAMER TORAN */}
      <div className="w-full relative z-[45] pointer-events-none select-none overflow-hidden h-7 sm:h-9 bg-gradient-to-r from-slate-900/30 via-amber-700/25 to-slate-900/30 border-b border-amber-400/35 flex items-center justify-between px-2 sm:px-6">
        {/* Repeating Toran SVG with Golden Stars, Swags & Bubbles */}
        <div className="absolute inset-0 flex items-center justify-between opacity-95 overflow-hidden">
          <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 1200 40">
            <defs>
              <linearGradient id="nyToranGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9C4" />
                <stop offset="40%" stopColor="#FACC15" />
                <stop offset="80%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>
              <linearGradient id="nyRibbonPink" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>

            {/* Repeating Festive Toran Scallops */}
            {Array.from({ length: 24 }).map((_, i) => {
              const cx = i * 50 + 25;
              return (
                <g key={`nytoran-${i}`}>
                  {/* Golden Sparkle Swag Rope */}
                  <path
                    d={`M ${cx - 25} 0 Q ${cx} 22 ${cx + 25} 0`}
                    fill="none"
                    stroke="#FDE047"
                    strokeWidth="2"
                    strokeDasharray="2 3"
                  />
                  {/* Holographic Ribbon Swag */}
                  <path
                    d={`M ${cx - 25} 2 Q ${cx} 24 ${cx + 25} 2`}
                    fill="none"
                    stroke={i % 2 === 0 ? 'url(#nyRibbonPink)' : '#38BDF8'}
                    strokeWidth="2.2"
                  />

                  {/* Golden Starlight Blossom */}
                  <polygon
                    points={`${cx},10 ${cx + 4},17 ${cx + 11},18 ${cx + 6},23 ${cx + 8},30 ${cx},26 ${cx - 8},30 ${cx - 6},23 ${cx - 11},18 ${cx - 4},17`}
                    fill="url(#nyToranGold)"
                  />
                  <circle cx={cx} cy="20" r="2.2" fill="#FFFFFF" />

                  {/* Hanging Champagne Bubble / Disco Ball */}
                  <g transform={`translate(${cx - 3.5}, 26) scale(0.65)`}>
                    <circle cx="5" cy="5" r="5" fill="#FFFFFF" fillOpacity="0.85" stroke="#FACC15" strokeWidth="1" />
                    <circle cx="3.5" cy="3.5" r="1.5" fill="#FFFFFF" className="animate-pulse" />
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Center Happy New Year Greeting Banner Badge */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 mx-auto flex items-center space-x-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-slate-950 text-[10px] sm:text-xs font-black tracking-widest uppercase px-3 sm:px-4 py-0.5 rounded-full shadow-md border border-yellow-200 pointer-events-auto cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-slate-950 animate-ping" />
          <span>✨ Happy New Year 2027 • Welcome Fresh Beginnings with Pure Silver 🥂</span>
          <span className="inline-block w-2 h-2 rounded-full bg-slate-950 animate-ping" />
        </button>
      </div>

      {/* 5. BOTTOM-RIGHT: EXPLODING PARTY POPPER & 2027 STAR BALLOONS */}
      <NewYearPartyPopperMotif onOpenModal={() => setIsModalOpen(true)} />
    </>
  );
}
