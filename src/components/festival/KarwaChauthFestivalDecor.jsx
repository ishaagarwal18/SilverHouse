import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import KarwaChauthModal from './KarwaChauthModal';
import KarwaChauthChhalniMotif from './KarwaChauthChhalniMotif';
import KarwaChauthKalashMotif from './KarwaChauthKalashMotif';

/**
 * KarwaChauthFestivalDecor - Master Karwa Chauth Festival Suite for Silver House
 * 
 * Features:
 * 1. Ambient Soft Evening Moonlight & Rose Petal Shimmer.
 * 2. Top Header Auspicious Red Rose, Golden Marigold & Crescent Moon Toran.
 * 3. Center "Shubh Karwa Chauth • Akhand Saubhagya" greeting banner badge.
 * 4. Bottom-Left: Sacred Sieve (Chhalni), Akhand Diya & Radiant Moon (KarwaChauthChhalniMotif).
 * 5. Bottom-Right: Sacred Silver & Brass Karwa Pot with Arghya Spout (KarwaChauthKalashMotif).
 * 6. Interactive Karwa Chauth Rituals & Gifting Guide Modal (KarwaChauthModal).
 */
export default function KarwaChauthFestivalDecor({ onNavigateToFestival }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate lightweight ambient moonlight and rose petal floats
  const petals = Array.from({ length: 18 }).map((_, i) => ({
    id: i,
    left: `${(i * 5.5 + (i % 3) * 1.8).toFixed(1)}%`,
    size: (i % 3 === 0 ? 9 : i % 2 === 0 ? 6 : 4),
    duration: (7 + (i % 4) * 1.5).toFixed(1),
    delay: ((i * 0.5) % 4).toFixed(1),
    opacity: (0.35 + (i % 3) * 0.15).toFixed(2),
    color: i % 2 === 0 ? '#FB7185' : '#FDE047'
  }));

  return (
    <>
      {/* 1. AMBIENT EVENING MOONBEAMS & ROSE PETALS */}
      <div className="fixed inset-0 pointer-events-none z-[35] overflow-hidden">
        <style>{`
          @keyframes ambientRoseDrift {
            0% {
              transform: translateY(-20px) translateX(0px) rotate(0deg);
              opacity: 0;
            }
            15% {
              opacity: var(--petal-opacity);
            }
            50% {
              transform: translateY(50vh) translateX(20px) rotate(120deg);
            }
            85% {
              opacity: var(--petal-opacity);
            }
            100% {
              transform: translateY(105vh) translateX(-15px) rotate(260deg);
              opacity: 0;
            }
          }
          .animate-rose-drift {
            animation: ambientRoseDrift var(--petal-duration) linear infinite;
            animation-delay: var(--petal-delay);
          }
        `}</style>
        {petals.map((p) => (
          <div
            key={p.id}
            style={{
              left: p.left,
              top: '-15px',
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              '--petal-duration': `${p.duration}s`,
              '--petal-delay': `${p.delay}s`,
              '--petal-opacity': p.opacity,
              boxShadow: `0 0 6px ${p.color}`
            }}
            className="absolute rounded-full animate-rose-drift pointer-events-none"
          />
        ))}
      </div>

      {/* 2. INTERACTIVE RITUALS & SAUBHAGYA GIFTING MODAL */}
      <KarwaChauthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNavigateToFestival={onNavigateToFestival}
      />

      {/* 3. BOTTOM-LEFT: CHHALNI, AKHAND DIYA & RADIANT MOON */}
      <KarwaChauthChhalniMotif onOpenModal={() => setIsModalOpen(true)} />

      {/* 4. TOP HEADER AUSPICIOUS RED ROSE & GOLDEN MARIGOLD TORAN */}
      <div className="w-full relative z-[45] pointer-events-none select-none overflow-hidden h-7 sm:h-9 bg-gradient-to-r from-rose-900/20 via-red-700/25 to-rose-900/20 border-b border-rose-500/40 flex items-center justify-between px-2 sm:px-6">
        {/* Repeating Toran SVG with Red Roses, Gold Pearls & Hanging Crescent Moons */}
        <div className="absolute inset-0 flex items-center justify-between opacity-95 overflow-hidden">
          <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 1200 40">
            <defs>
              <linearGradient id="roseGarlandRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F43F5E" />
                <stop offset="50%" stopColor="#E11D48" />
                <stop offset="100%" stopColor="#881337" />
              </linearGradient>
              <linearGradient id="garlandMoonGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFDE7" />
                <stop offset="50%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>
            </defs>

            {/* Repeating Festive Toran Scallops */}
            {Array.from({ length: 24 }).map((_, i) => {
              const cx = i * 50 + 25;
              return (
                <g key={`ktoran-${i}`}>
                  {/* Golden Pearl Swag Rope */}
                  <path
                    d={`M ${cx - 25} 0 Q ${cx} 22 ${cx + 25} 0`}
                    fill="none"
                    stroke="#FDE047"
                    strokeWidth="1.8"
                    strokeDasharray="2 3"
                  />
                  {/* Red Silk Ribbon Swag */}
                  <path
                    d={`M ${cx - 25} 2 Q ${cx} 24 ${cx + 25} 2`}
                    fill="none"
                    stroke="#BE123C"
                    strokeWidth="2.2"
                  />

                  {/* Red Rose Blossom Center */}
                  <circle cx={cx} cy="18" r="5.5" fill="url(#roseGarlandRed)" />
                  <circle cx={cx} cy="18" r="2.8" fill="#FDE047" />

                  {/* Hanging Crescent Moon / Golden Diya */}
                  {i % 2 === 0 ? (
                    /* Hanging Golden Crescent Moon */
                    <path
                      d={`M ${cx - 3} 24 A 5 5 0 0 0 ${cx + 3} 34 A 3.5 3.5 0 0 1 ${cx - 3} 24 Z`}
                      fill="url(#garlandMoonGold)"
                    />
                  ) : (
                    /* Hanging Auspicious Diya */
                    <g transform={`translate(${cx - 3.5}, 25) scale(0.65)`}>
                      <path d="M 0 6 C 1 12, 11 12, 12 6 Z" fill="#F59E0B" />
                      <circle cx="6" cy="3" r="2" fill="#FDE047" className="animate-pulse" />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Center Shubh Karwa Chauth Greeting Banner Badge */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 mx-auto flex items-center space-x-2 bg-gradient-to-r from-rose-700 via-red-600 to-amber-700 hover:from-rose-600 hover:to-amber-600 text-white text-[10px] sm:text-xs font-black tracking-widest uppercase px-3 sm:px-4 py-0.5 rounded-full shadow-md border border-rose-300/80 pointer-events-auto cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
          <span>🌙 Shubh Karwa Chauth • Akhand Saubhagya &amp; Silver Pooja Sets 🪔</span>
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
        </button>
      </div>

      {/* 5. BOTTOM-RIGHT: SACRED SILVER & BRASS KARWA POT */}
      <KarwaChauthKalashMotif onOpenModal={() => setIsModalOpen(true)} />
    </>
  );
}
