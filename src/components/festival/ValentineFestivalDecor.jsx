import React, { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import ValentineModal from './ValentineModal';
import ValentineTeddyMotif from './ValentineTeddyMotif';
import ValentineLoveGiftMotif from './ValentineLoveGiftMotif';

/**
 * ValentineFestivalDecor - Master Valentine's Day Romance Festival Suite for Silver House
 * 
 * Features:
 * 1. Ambient Floating Ruby Hearts, Pink Rose Petals & Golden Starlight Shimmer.
 * 2. Top Header Red Rose Floral Garland, Pink Silk Swags & Crystal Hearts Toran.
 * 3. Center "Happy Valentine's Day • Forever in Love with Pure Silver Keepsakes" greeting banner badge.
 * 4. Bottom-Left: Plush Love Teddy Bear holding Ruby Heart & Silver Bow (ValentineTeddyMotif).
 * 5. Bottom-Right: Open Velvet Ring Box, Solitaire Promise Ring & Blooming Rose (ValentineLoveGiftMotif).
 * 6. Interactive Valentine Expressions & Silver Gifting Showcase Modal (ValentineModal).
 */
export default function ValentineFestivalDecor({ onNavigateToFestival }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate lightweight ambient floating ruby hearts & falling rose petals
  const floaters = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    left: `${(i * 4.2 + (i % 3) * 1.5).toFixed(1)}%`,
    size: (i % 3 === 0 ? 10 : i % 2 === 0 ? 7 : 5),
    duration: (6.8 + (i % 4) * 1.8).toFixed(1),
    delay: ((i * 0.45) % 4.5).toFixed(1),
    opacity: (0.35 + (i % 3) * 0.18).toFixed(2),
    color: ['#F43F5E', '#FB7185', '#E11D48', '#FDA4AF', '#F472B6', '#FFFFFF'][i % 6],
    type: i % 2 === 0 ? 'heart' : 'petal'
  }));

  return (
    <>
      {/* 1. AMBIENT FLOATING RUBY HEARTS & FALLING ROSE PETALS */}
      <div className="fixed inset-0 pointer-events-none z-[35] overflow-hidden">
        <style>{`
          @keyframes ambientValentineDrift {
            0% {
              transform: translateY(-20px) translateX(0px) rotate(0deg);
              opacity: 0;
            }
            15% {
              opacity: var(--val-opacity);
            }
            50% {
              transform: translateY(50vh) translateX(18px) rotate(160deg);
            }
            85% {
              opacity: var(--val-opacity);
            }
            100% {
              transform: translateY(105vh) translateX(-15px) rotate(320deg);
              opacity: 0;
            }
          }
          .animate-val-drift {
            animation: ambientValentineDrift var(--val-duration) linear infinite;
            animation-delay: var(--val-delay);
          }
        `}</style>
        {floaters.map((p) => (
          <div
            key={p.id}
            style={{
              left: p.left,
              top: '-15px',
              '--val-duration': `${p.duration}s`,
              '--val-delay': `${p.delay}s`,
              '--val-opacity': p.opacity
            }}
            className="absolute animate-val-drift pointer-events-none"
          >
            {p.type === 'heart' ? (
              <svg
                width={p.size * 1.4}
                height={p.size * 1.4}
                viewBox="0 0 24 24"
                fill={p.color}
                style={{ filter: `drop-shadow(0 0 6px ${p.color})` }}
              >
                <path d="M 12 21.35 L 10.55 20.03 C 5.4 15.36 2 12.28 2 8.5 C 2 5.42 4.42 3 7.5 3 C 9.24 3 10.91 3.81 12 5.09 C 13.09 3.81 14.76 3 16.5 3 C 19.58 3 22 5.42 22 8.5 C 22 12.28 18.6 15.36 13.45 20.04 L 12 21.35 Z" />
              </svg>
            ) : (
              <svg
                width={p.size * 1.2}
                height={p.size * 1.2}
                viewBox="0 0 24 24"
                fill={p.color}
                style={{ filter: `drop-shadow(0 0 5px ${p.color})` }}
              >
                <path d="M 12 2 C 7 5, 4 11, 7 17 C 9 21, 15 21, 17 17 C 20 11, 17 5, 12 2 Z" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* 2. INTERACTIVE VALENTINE EXPRESSIONS & GIFTING SHOWCASE MODAL */}
      <ValentineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNavigateToFestival={onNavigateToFestival}
      />

      {/* 3. BOTTOM-LEFT: PLUSH LOVE TEDDY BEAR HOLDING RUBY HEART & SILVER BOW */}
      <ValentineTeddyMotif onOpenModal={() => setIsModalOpen(true)} />

      {/* 4. TOP HEADER RED ROSE GARLAND & PINK RIBBON TORAN */}
      <div className="w-full relative z-[45] pointer-events-none select-none overflow-hidden h-7 sm:h-9 bg-gradient-to-r from-red-950/35 via-rose-800/30 to-red-950/35 border-b border-rose-400/40 flex items-center justify-between px-2 sm:px-6">
        {/* Repeating Toran SVG with Red Roses, Swags & Hanging Crystal Hearts */}
        <div className="absolute inset-0 flex items-center justify-between opacity-95 overflow-hidden">
          <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 1200 40">
            <defs>
              <linearGradient id="valRoseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FB7185" />
                <stop offset="50%" stopColor="#E11D48" />
                <stop offset="100%" stopColor="#9F1239" />
              </linearGradient>
              <linearGradient id="valRibbonPink" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FCE7F3" />
                <stop offset="50%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#DB2777" />
              </linearGradient>
              <linearGradient id="valGoldWire" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>
            </defs>

            {/* Repeating Festive Toran Scallops */}
            {Array.from({ length: 24 }).map((_, i) => {
              const cx = i * 50 + 25;
              return (
                <g key={`valtoran-${i}`}>
                  {/* Golden Chain Swag */}
                  <path
                    d={`M ${cx - 25} 0 Q ${cx} 22 ${cx + 25} 0`}
                    fill="none"
                    stroke="url(#valGoldWire)"
                    strokeWidth="1.8"
                    strokeDasharray="2 2"
                  />
                  {/* Silk Pink Ribbon Swag */}
                  <path
                    d={`M ${cx - 25} 2 Q ${cx} 24 ${cx + 25} 2`}
                    fill="none"
                    stroke="url(#valRibbonPink)"
                    strokeWidth="2.2"
                  />

                  {/* Blooming Red Rose Center */}
                  <circle cx={cx} cy="14" r="6" fill="url(#valRoseGrad)" stroke="#3E160D" strokeWidth="0.8" />
                  <circle cx={cx - 1} cy="13" r="3" fill="#BE123C" />
                  {/* Rose leaves */}
                  <path d={`M ${cx - 5} 12 Q ${cx - 9} 10 ${cx - 6} 8 Z`} fill="#22C55E" />
                  <path d={`M ${cx + 5} 12 Q ${cx + 9} 10 ${cx + 6} 8 Z`} fill="#22C55E" />

                  {/* Hanging Crystal Heart */}
                  <g transform={`translate(${cx}, 24) scale(0.65)`}>
                    <path
                      d="M 0 0 C -4 -4, -8 -4, -8 0 C -8 5, 0 10, 0 10 C 0 10, 8 5, 8 0 C 8 -4, 4 -4, 0 0 Z"
                      fill="#FFFFFF"
                      stroke="#F43F5E"
                      strokeWidth="1"
                    />
                    <circle cx="0" cy="3" r="1.5" fill="#F43F5E" />
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Center Valentine Greeting Banner Badge */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 mx-auto flex items-center space-x-2 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white text-[10px] sm:text-xs font-black tracking-widest uppercase px-3 sm:px-4 py-0.5 rounded-full shadow-md border border-rose-200/80 pointer-events-auto cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-pink-200 animate-ping" />
          <span>💖 Happy Valentine's Day • Forever in Love with Pure Silver Keepsakes 🌹</span>
          <span className="inline-block w-2 h-2 rounded-full bg-pink-200 animate-ping" />
        </button>
      </div>

      {/* 5. BOTTOM-RIGHT: VELVET RING BOX, SOLITAIRE RING & BLOOMING ROSES */}
      <ValentineLoveGiftMotif onOpenModal={() => setIsModalOpen(true)} />
    </>
  );
}
