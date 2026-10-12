import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import ChristmasFestivalModal from './ChristmasFestivalModal';
import ChristmasTreeMotif from './ChristmasTreeMotif';
import ChristmasSantaMotif from './ChristmasSantaMotif';

/**
 * ChristmasFestivalDecor - Master Christmas & New Year Holiday Suite for Silver House
 * 
 * Features:
 * 1. Gentle Ambient Snowfall drifting gracefully across the screen.
 * 2. Top Header Festive Evergreen Pine, Holly Berries & Golden Sleigh Bell Garland.
 * 3. Center "Merry Christmas • Silver House Holiday Cheer" greeting banner badge.
 * 4. Bottom-Left: Decorated Holiday Pine Tree with Star & Jingle Bells (ChristmasTreeMotif).
 * 5. Bottom-Right: Jolly Santa Claus with Gift Sack & Ringing Bell (ChristmasSantaMotif).
 * 6. Interactive Holiday Showcase Modal (ChristmasFestivalModal).
 */
export default function ChristmasFestivalDecor({ onNavigateToFestival }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate lightweight ambient falling snowflakes
  const snowflakes = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    left: `${(i * 4.2 + (i % 3) * 1.5).toFixed(1)}%`,
    size: (i % 3 === 0 ? 8 : i % 2 === 0 ? 5 : 3),
    duration: (6 + (i % 5) * 1.8).toFixed(1),
    delay: ((i * 0.4) % 4).toFixed(1),
    opacity: (0.35 + (i % 4) * 0.15).toFixed(2)
  }));

  return (
    <>
      {/* 1. AMBIENT SOFT FALLING SNOW EFFECT */}
      <div className="fixed inset-0 pointer-events-none z-[35] overflow-hidden">
        <style>{`
          @keyframes ambientSnowDrift {
            0% {
              transform: translateY(-20px) translateX(0px);
              opacity: 0;
            }
            15% {
              opacity: var(--snow-opacity);
            }
            50% {
              transform: translateY(50vh) translateX(15px);
            }
            85% {
              opacity: var(--snow-opacity);
            }
            100% {
              transform: translateY(105vh) translateX(-10px);
              opacity: 0;
            }
          }
          .animate-snow-drift {
            animation: ambientSnowDrift var(--snow-duration) linear infinite;
            animation-delay: var(--snow-delay);
          }
        `}</style>
        {snowflakes.map((s) => (
          <div
            key={s.id}
            style={{
              left: s.left,
              top: '-15px',
              width: `${s.size}px`,
              height: `${s.size}px`,
              '--snow-duration': `${s.duration}s`,
              '--snow-delay': `${s.delay}s`,
              '--snow-opacity': s.opacity,
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)'
            }}
            className="absolute rounded-full bg-white/80 animate-snow-drift pointer-events-none"
          />
        ))}
      </div>

      {/* 2. INTERACTIVE HOLIDAY GIFTING SHOWCASE MODAL */}
      <ChristmasFestivalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNavigateToFestival={onNavigateToFestival}
      />

      {/* 3. BOTTOM-LEFT: DECORATED EVERGREEN TREE WITH GIFTS & JINGLE BELLS */}
      <ChristmasTreeMotif onOpenModal={() => setIsModalOpen(true)} />

      {/* 4. TOP HEADER FESTIVE EVERGREEN PINE & HOLLY BERRY GARLAND */}
      <div className="w-full relative z-[45] pointer-events-none select-none overflow-hidden h-7 sm:h-9 bg-gradient-to-r from-emerald-800/20 via-red-700/20 to-emerald-800/20 border-b border-emerald-500/30 flex items-center justify-between px-2 sm:px-6">
        {/* Repeating Garland SVG with Evergreen Pine Needles, Berries & Bells */}
        <div className="absolute inset-0 flex items-center justify-between opacity-95 overflow-hidden">
          <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 1200 40">
            <defs>
              <linearGradient id="pineGarlandGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2E7D32" />
                <stop offset="100%" stopColor="#1B5E20" />
              </linearGradient>
              <radialGradient id="hollyBerryRed" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="60%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#991B1B" />
              </radialGradient>
              <linearGradient id="garlandBellGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9C4" />
                <stop offset="60%" stopColor="#FFD54F" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>

            {/* Repeating Festive Garland Swags */}
            {Array.from({ length: 24 }).map((_, i) => {
              const cx = i * 50 + 25;
              return (
                <g key={`swag-${i}`}>
                  {/* Frosted Evergreen Pine Needles Swag */}
                  <path
                    d={`M ${cx - 25} 0 Q ${cx} 22 ${cx + 25} 0`}
                    fill="none"
                    stroke="url(#pineGarlandGreen)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Golden Fairy Light Wire */}
                  <path
                    d={`M ${cx - 25} 2 Q ${cx} 24 ${cx + 25} 2`}
                    fill="none"
                    stroke="#FDE047"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />

                  {/* Red Holly Berry Cluster */}
                  <circle cx={cx - 3} cy="18" r="3.2" fill="url(#hollyBerryRed)" />
                  <circle cx={cx + 3} cy="18" r="3.2" fill="url(#hollyBerryRed)" />
                  <circle cx={cx} cy="22" r="3.2" fill="url(#hollyBerryRed)" />

                  {/* Hanging Golden Sleigh Bell / Snowflake */}
                  {i % 2 === 0 ? (
                    <g transform={`translate(${cx - 4}, 25) scale(0.7)`}>
                      <path d="M 0 0 C 0 -6, 12 -6, 12 0 L 14 10 L -2 10 Z" fill="url(#garlandBellGold)" />
                      <circle cx="6" cy="11" r="2" fill="#B45309" />
                    </g>
                  ) : (
                    /* Shimmering Fairy Light Bulb */
                    <circle
                      cx={cx}
                      cy="26"
                      r="2.5"
                      fill={i % 4 === 1 ? '#EF4444' : '#FDE047'}
                      className="animate-pulse"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Center Merry Christmas Greeting Banner Badge */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 mx-auto flex items-center space-x-2 bg-gradient-to-r from-red-700 via-rose-600 to-emerald-700 hover:from-red-600 hover:to-emerald-600 text-white text-[10px] sm:text-xs font-black tracking-widest uppercase px-3 sm:px-4 py-0.5 rounded-full shadow-md border border-red-300/70 pointer-events-auto cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
          <span>🎄 Merry Christmas &amp; Happy New Year • Silver House Holiday Cheer 🎁</span>
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
        </button>
      </div>

      {/* 5. BOTTOM-RIGHT: JOLLY SANTA CLAUS WITH GIFTS & JINGLE BELL */}
      <ChristmasSantaMotif onOpenModal={() => setIsModalOpen(true)} />
    </>
  );
}
