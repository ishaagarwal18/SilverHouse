import React, { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import RakshaBandhanModal from './RakshaBandhanModal';
import RakshaBandhanRakhiMotif from './RakshaBandhanRakhiMotif';

/**
 * RakshaBandhanFestivalDecor - Master Raksha Bandhan Festival Suite for Silver House
 * 
 * Features:
 * 1. Ambient Floating Moli Ribbons, Rose Petals & Golden Starlight.
 * 2. Top Header Festive Toran Garland with Sacred Moli Swags, Silver Rakhis & Golden Bells.
 * 3. Center "Happy Raksha Bandhan • Celebrate Sacred Sibling Bonds with Pure Silver Rakhis" banner badge.
 * 4. Bottom-Left & Bottom-Right: Royal 925 Silver Designer Rakhi & Pooja Thali Motifs (NO CARDS).
 * 5. Interactive 5 Traditions of Raksha Bandhan & Pure Silver Keepsakes Showcase Modal.
 */
export default function RakshaBandhanFestivalDecor({ onNavigateToFestival }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate lightweight ambient floating sparkles, flower petals & sacred thread ribbons
  const floaters = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    left: `${(i * 4.2 + (i % 3) * 1.5).toFixed(1)}%`,
    size: i % 3 === 0 ? 10 : i % 2 === 0 ? 7 : 5,
    duration: (6.5 + (i % 4) * 1.8).toFixed(1),
    delay: ((i * 0.42) % 4.5).toFixed(1),
    opacity: (0.35 + (i % 3) * 0.18).toFixed(2),
    color: ['#F43F5E', '#F59E0B', '#E11D48', '#FACC15', '#EC4899', '#FB923C', '#FEF08A'][i % 7],
    type: i % 3 === 0 ? 'petal' : i % 2 === 0 ? 'star' : 'rakhi'
  }));

  return (
    <>
      {/* 1. AMBIENT FLOATING ROSE PETALS, MOLI SWIRLS & GOLDEN SPARKLES */}
      <div className="fixed inset-0 pointer-events-none z-[35] overflow-hidden">
        <style>{`
          @keyframes ambientRakhiFloat {
            0% {
              transform: translateY(105vh) translateX(0px) rotate(0deg);
              opacity: 0;
            }
            15% {
              opacity: var(--rakhi-opacity);
            }
            50% {
              transform: translateY(50vh) translateX(16px) rotate(15deg);
            }
            85% {
              opacity: var(--rakhi-opacity);
            }
            100% {
              transform: translateY(-20px) translateX(-14px) rotate(-20deg);
              opacity: 0;
            }
          }
          .animate-rakhi-float {
            animation: ambientRakhiFloat var(--rakhi-duration) linear infinite;
            animation-delay: var(--rakhi-delay);
          }
        `}</style>
        {floaters.map((p) => (
          <div
            key={p.id}
            style={{
              left: p.left,
              bottom: '-15px',
              '--rakhi-duration': `${p.duration}s`,
              '--rakhi-delay': `${p.delay}s`,
              '--rakhi-opacity': p.opacity
            }}
            className="absolute animate-rakhi-float pointer-events-none"
          >
            {p.type === 'petal' ? (
              <svg
                width={p.size * 1.5}
                height={p.size * 1.5}
                viewBox="0 0 24 24"
                fill={p.color}
                style={{ filter: `drop-shadow(0 0 6px ${p.color})` }}
              >
                <path d="M 12 2 C 16 6, 22 12, 18 18 C 14 22, 6 20, 4 14 C 3 8, 8 2, 12 2 Z" opacity="0.85" />
              </svg>
            ) : p.type === 'rakhi' ? (
              <svg
                width={p.size * 1.6}
                height={p.size * 1.6}
                viewBox="0 0 24 24"
                fill="none"
                style={{ filter: `drop-shadow(0 0 5px ${p.color})` }}
              >
                <circle cx="12" cy="12" r="6" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="0.8" />
                <circle cx="12" cy="12" r="3" fill="#E11D48" />
                <circle cx="12" cy="12" r="1.5" fill="#FACC15" />
                <line x1="3" y1="12" x2="6" y2="12" stroke="#F59E0B" strokeWidth="1.2" />
                <line x1="18" y1="12" x2="21" y2="12" stroke="#F59E0B" strokeWidth="1.2" />
              </svg>
            ) : (
              <svg
                width={p.size * 1.2}
                height={p.size * 1.2}
                viewBox="0 0 24 24"
                fill={p.color}
                style={{ filter: `drop-shadow(0 0 5px ${p.color})` }}
              >
                <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* 2. INTERACTIVE RAKSHA BANDHAN MODAL */}
      <RakshaBandhanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNavigateToFestival={onNavigateToFestival}
      />

      {/* 3. TOP HEADER FESTIVE RAKHI TORAN GARLAND */}
      <div className="w-full relative z-[45] pointer-events-none select-none overflow-hidden h-7 sm:h-9 bg-gradient-to-r from-rose-950/40 via-red-950/40 to-amber-950/40 border-b border-rose-500/40 flex items-center justify-between px-2 sm:px-6">
        {/* Repeating Toran SVG with Red-Gold Moli Swags, Hanging Silver Rakhis & Bells */}
        <div className="absolute inset-0 flex items-center justify-between opacity-95 overflow-hidden">
          <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 1200 40">
            <defs>
              <linearGradient id="rakhiRopeGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9C4" />
                <stop offset="50%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>

              <linearGradient id="rakhiRopeRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDA4AF" />
                <stop offset="50%" stopColor="#E11D48" />
                <stop offset="100%" stopColor="#9F1239" />
              </linearGradient>

              <linearGradient id="rakhiSilverBell" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>
            </defs>

            {/* Repeating Festive Toran Scallops */}
            {Array.from({ length: 24 }).map((_, i) => {
              const cx = i * 50 + 25;
              const isEven = i % 2 === 0;
              return (
                <g key={`rakhitoran-${i}`}>
                  {/* Crimson & Gold Sacred Moli Swag Ropes */}
                  <path
                    d={`M ${cx - 25} 0 Q ${cx} 22 ${cx + 25} 0`}
                    fill="none"
                    stroke="url(#rakhiRopeGold)"
                    strokeWidth="1.8"
                    strokeDasharray="2 2"
                  />
                  <path
                    d={`M ${cx - 25} 2 Q ${cx} 24 ${cx + 25} 2`}
                    fill="none"
                    stroke="url(#rakhiRopeRed)"
                    strokeWidth="2.2"
                  />

                  {/* Alternating Miniature Hanging Pure Silver Rakhi or Golden Bell */}
                  {isEven ? (
                    /* Mini Hanging Silver Rakhi Medallion */
                    <g transform={`translate(${cx}, 14) scale(0.65)`}>
                      <circle cx="0" cy="0" r="7" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.8" />
                      <circle cx="0" cy="0" r="4.5" fill="#E11D48" />
                      <circle cx="0" cy="0" r="2" fill="#FACC15" />
                      <line x1="-10" y1="0" x2="-7" y2="0" stroke="#F59E0B" strokeWidth="1.2" />
                      <line x1="7" y1="0" x2="10" y2="0" stroke="#F59E0B" strokeWidth="1.2" />
                    </g>
                  ) : (
                    /* Hanging Golden Bell with Clapper */
                    <g transform={`translate(${cx}, 14) scale(0.6)`}>
                      <polygon points="-4,0 4,0 6,10 -6,10" fill="url(#rakhiRopeGold)" stroke="#78350F" strokeWidth="0.6" />
                      <circle cx="0" cy="11" r="2" fill="#78350F" />
                    </g>
                  )}

                  {/* Hanging Auspicious Rudraksha Bead */}
                  <circle cx={cx} cy="26" r="2" fill="#78350F" stroke="#451A03" strokeWidth="0.5" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Center Raksha Bandhan Greeting Banner Badge */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 mx-auto flex items-center space-x-2 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-[10px] sm:text-xs font-black tracking-widest uppercase px-3 sm:px-4 py-0.5 rounded-full shadow-md border border-yellow-200 pointer-events-auto cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
          <span>🎀 Happy Raksha Bandhan • Celebrate Sacred Sibling Bonds with Pure Silver Rakhis 🪙</span>
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
        </button>
      </div>

      {/* 4. BOTTOM-LEFT & BOTTOM-RIGHT: ROYAL 925 SILVER RAKHI & THALI MOTIFS (NO CARDS) */}
      <RakshaBandhanRakhiMotif side="left" onOpenModal={() => setIsModalOpen(true)} />
      <RakshaBandhanRakhiMotif side="right" onOpenModal={() => setIsModalOpen(true)} />
    </>
  );
}
