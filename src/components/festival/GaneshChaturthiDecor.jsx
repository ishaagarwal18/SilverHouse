import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import GaneshChaturthiModal from './GaneshChaturthiModal';
import GaneshaDivineMotif from './GaneshaDivineMotif';
import GaneshaModakMushakMotif from './GaneshaModakMushakMotif';

/**
 * GaneshChaturthiDecor - Master Ganesh Chaturthi Festival Suite for Silver House
 * 
 * Features:
 * 1. Ambient Floating Golden Marigold Petals & Sacred Starlight Sparkles.
 * 2. Top Header Festive Orange Marigold (Genda), Red Hibiscus (Jaswand) & Durva Toran.
 * 3. Center "Ganpati Bappa Morya • Shubh Ganeshotsav" greeting banner badge.
 * 4. Bottom-Left: Benevolent Lord Ganesha with Crown & Modak (GaneshaDivineMotif).
 * 5. Bottom-Right: Silver Thali of Steamed Modaks with Mushakraj (GaneshaModakMushakMotif).
 * 6. Interactive Ganeshotsav Traditions & Silver Offerings Guide Modal (GaneshChaturthiModal).
 */
export default function GaneshChaturthiDecor({ onNavigateToFestival }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate lightweight ambient floating marigold and starlight particles
  const floaters = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: `${(i * 5.0 + (i % 3) * 1.5).toFixed(1)}%`,
    size: (i % 3 === 0 ? 9 : i % 2 === 0 ? 6 : 4),
    duration: (6.5 + (i % 4) * 1.5).toFixed(1),
    delay: ((i * 0.45) % 4).toFixed(1),
    opacity: (0.35 + (i % 3) * 0.15).toFixed(2),
    color: i % 3 === 0 ? '#F97316' : i % 3 === 1 ? '#EF4444' : '#FBBF24'
  }));

  return (
    <>
      {/* 1. AMBIENT FLOATING MARIGOLD PETALS & GOLDEN SPARKS */}
      <div className="fixed inset-0 pointer-events-none z-[35] overflow-hidden">
        <style>{`
          @keyframes ambientMarigoldDrift {
            0% {
              transform: translateY(-20px) translateX(0px) rotate(0deg);
              opacity: 0;
            }
            15% {
              opacity: var(--marigold-opacity);
            }
            50% {
              transform: translateY(50vh) translateX(18px) rotate(140deg);
            }
            85% {
              opacity: var(--marigold-opacity);
            }
            100% {
              transform: translateY(105vh) translateX(-15px) rotate(280deg);
              opacity: 0;
            }
          }
          .animate-marigold-drift {
            animation: ambientMarigoldDrift var(--marigold-duration) linear infinite;
            animation-delay: var(--marigold-delay);
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
              '--marigold-duration': `${p.duration}s`,
              '--marigold-delay': `${p.delay}s`,
              '--marigold-opacity': p.opacity,
              boxShadow: `0 0 6px ${p.color}`
            }}
            className="absolute rounded-full animate-marigold-drift pointer-events-none"
          />
        ))}
      </div>

      {/* 2. INTERACTIVE GANESHOTSAV RITUALS & SILVER OFFERINGS MODAL */}
      <GaneshChaturthiModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNavigateToFestival={onNavigateToFestival}
      />

      {/* 3. BOTTOM-LEFT: BENEVOLENT LORD GANESHA WITH MODAK & BLESSING */}
      <GaneshaDivineMotif onOpenModal={() => setIsModalOpen(true)} />

      {/* 4. TOP HEADER ORANGE MARIGOLD, RED HIBISCUS & DURVA TORAN */}
      <div className="w-full relative z-[45] pointer-events-none select-none overflow-hidden h-7 sm:h-9 bg-gradient-to-r from-amber-700/20 via-orange-600/25 to-amber-700/20 border-b border-orange-500/40 flex items-center justify-between px-2 sm:px-6">
        {/* Repeating Toran SVG with Marigolds, Red Hibiscus & Mango Leaves */}
        <div className="absolute inset-0 flex items-center justify-between opacity-95 overflow-hidden">
          <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 1200 40">
            <defs>
              <linearGradient id="marigoldGendaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFA000" />
                <stop offset="50%" stopColor="#FF6D00" />
                <stop offset="100%" stopColor="#D84315" />
              </linearGradient>
              <linearGradient id="jaswandToranRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F43F5E" />
                <stop offset="60%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#991B1B" />
              </linearGradient>
            </defs>

            {/* Repeating Festive Toran Scallops */}
            {Array.from({ length: 24 }).map((_, i) => {
              const cx = i * 50 + 25;
              return (
                <g key={`gtoran-${i}`}>
                  {/* Golden Pearl Swag Rope */}
                  <path
                    d={`M ${cx - 25} 0 Q ${cx} 22 ${cx + 25} 0`}
                    fill="none"
                    stroke="#FFB300"
                    strokeWidth="2"
                    strokeDasharray="2 3"
                  />
                  {/* Green Durva Vine Swag */}
                  <path
                    d={`M ${cx - 25} 2 Q ${cx} 24 ${cx + 25} 2`}
                    fill="none"
                    stroke="#15803D"
                    strokeWidth="2"
                  />

                  {/* Marigold Blossom or Red Hibiscus */}
                  {i % 2 === 0 ? (
                    /* Orange Marigold Blossom */
                    <>
                      <circle cx={cx} cy="18" r="6" fill="url(#marigoldGendaGrad)" />
                      <circle cx={cx} cy="18" r="3.2" fill="#FFE082" />
                    </>
                  ) : (
                    /* Red Hibiscus Flower */
                    <>
                      <circle cx={cx} cy="18" r="5.5" fill="url(#jaswandToranRed)" />
                      <circle cx={cx} cy="18" r="2.5" fill="#FDE047" />
                    </>
                  )}

                  {/* Hanging Brass Bell / Mini Modak */}
                  <g transform={`translate(${cx - 3.5}, 25) scale(0.65)`}>
                    <path d="M 0 6 C 1 12, 11 12, 12 6 Z" fill="#F59E0B" />
                    <circle cx="6" cy="3" r="2" fill="#FDE047" className="animate-pulse" />
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Center Ganpati Bappa Morya Greeting Banner Badge */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 mx-auto flex items-center space-x-2 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white text-[10px] sm:text-xs font-black tracking-widest uppercase px-3 sm:px-4 py-0.5 rounded-full shadow-md border border-yellow-300/80 pointer-events-auto cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
          <span>🐘 Ganpati Bappa Morya • Shubh Ganeshotsav &amp; Silver Murti Idols 🌺</span>
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
        </button>
      </div>

      {/* 5. BOTTOM-RIGHT: SILVER THALI OF STEAMED MODAKS & DEVOTED MUSHAKRAJ */}
      <GaneshaModakMushakMotif onOpenModal={() => setIsModalOpen(true)} />
    </>
  );
}
