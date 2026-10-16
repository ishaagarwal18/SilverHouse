import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import HoliModal from './HoliModal';
import HoliPichkariMotif from './HoliPichkariMotif';

/**
 * HoliFestivalDecor - Master Holi Festival Suite for Silver House
 * 
 * Features:
 * 1. Ambient Floating Multi-Color Gulal Puffs, Droplets & Festive Sparkles.
 * 2. Top Header Festive Toran Garland with Colorful Swags, Palash Flowers & Mini Pichkaris.
 * 3. Center "Bura Na Mano, Holi Hai! • Celebrate Colors of Joy with Pure Silver Keepsakes" banner badge.
 * 4. Bottom-Left: Royal Silver Pichkari & Thali of Vibrant Gulal (HoliPichkariMotif) - NO CARD.
 * 5. Bottom-Right: Royal Silver Pichkari & Thali of Vibrant Gulal (Mirrored) (HoliPichkariMotif side="right") - NO CARD.
 * 6. Interactive 5 Traditions of Holi & Pure Silver Keepsakes Showcase (HoliModal).
 */
export default function HoliFestivalDecor({ onNavigateToFestival }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate lightweight ambient floating colorful gulal powder puffs and sparkles
  const floaters = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    left: `${(i * 4.2 + (i % 3) * 1.5).toFixed(1)}%`,
    size: i % 3 === 0 ? 11 : i % 2 === 0 ? 8 : 5,
    duration: (6.8 + (i % 4) * 1.6).toFixed(1),
    delay: ((i * 0.42) % 4.5).toFixed(1),
    opacity: (0.35 + (i % 3) * 0.18).toFixed(2),
    color: ['#EC4899', '#F59E0B', '#06B6D4', '#8B5CF6', '#10B981', '#F43F5E', '#FEF08A'][i % 7],
    type: i % 3 === 0 ? 'cloud' : i % 2 === 0 ? 'puff' : 'sparkle'
  }));

  return (
    <>
      {/* 1. AMBIENT FLOATING COLORFUL GULAL PUFFS & SPARKLES */}
      <div className="fixed inset-0 pointer-events-none z-[35] overflow-hidden">
        <style>{`
          @keyframes ambientHoliFloat {
            0% {
              transform: translateY(105vh) translateX(0px) scale(0.8) rotate(0deg);
              opacity: 0;
            }
            15% {
              opacity: var(--holi-opacity);
            }
            50% {
              transform: translateY(50vh) translateX(18px) scale(1.1) rotate(15deg);
            }
            85% {
              opacity: var(--holi-opacity);
            }
            100% {
              transform: translateY(-20px) translateX(-16px) scale(0.9) rotate(-20deg);
              opacity: 0;
            }
          }
          .animate-holi-float {
            animation: ambientHoliFloat var(--holi-duration) linear infinite;
            animation-delay: var(--holi-delay);
          }
        `}</style>
        {floaters.map((p) => (
          <div
            key={p.id}
            style={{
              left: p.left,
              bottom: '-15px',
              '--holi-duration': `${p.duration}s`,
              '--holi-delay': `${p.delay}s`,
              '--holi-opacity': p.opacity
            }}
            className="absolute animate-holi-float pointer-events-none"
          >
            {p.type === 'cloud' ? (
              <svg
                width={p.size * 2}
                height={p.size * 1.5}
                viewBox="0 0 24 18"
                fill={p.color}
                style={{ filter: `drop-shadow(0 0 8px ${p.color})` }}
              >
                <path d="M 6 14 C 2 14, 0 10, 3 7 C 4 3, 9 2, 12 5 C 15 2, 20 3, 21 7 C 24 10, 22 14, 18 14 Z" opacity="0.85" />
              </svg>
            ) : p.type === 'puff' ? (
              <div
                style={{
                  width: `${p.size * 1.4}px`,
                  height: `${p.size * 1.4}px`,
                  backgroundColor: p.color,
                  borderRadius: '50%',
                  filter: `blur(1.5px) drop-shadow(0 0 6px ${p.color})`,
                  opacity: 0.8
                }}
              />
            ) : (
              <svg
                width={p.size * 1.2}
                height={p.size * 1.2}
                viewBox="0 0 24 24"
                fill={p.color}
                style={{ filter: `drop-shadow(0 0 4px ${p.color})` }}
              >
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* 2. INTERACTIVE HOLI FESTIVAL MODAL */}
      <HoliModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNavigateToFestival={onNavigateToFestival}
      />

      {/* 3. BOTTOM-LEFT: ROYAL SILVER PICHKARI & GULAL THALI MOTIF (NO CARD) */}
      <HoliPichkariMotif onOpenModal={() => setIsModalOpen(true)} />

      {/* 4. TOP HEADER FESTIVE HOLI TORAN GARLAND */}
      <div className="w-full relative z-[45] pointer-events-none select-none overflow-hidden h-7 sm:h-9 bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-amber-950/40 border-b border-pink-500/40 flex items-center justify-between px-2 sm:px-6">
        {/* Repeating Toran SVG with Multi-Colored Festoon Swags, Palash Flowers & Mini Pichkaris */}
        <div className="absolute inset-0 flex items-center justify-between opacity-95 overflow-hidden">
          <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 1200 40">
            <defs>
              <linearGradient id="holiPinkRope" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="50%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#BE185D" />
              </linearGradient>

              <linearGradient id="holiCyanRope" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67E8F9" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#0891B2" />
              </linearGradient>

              <linearGradient id="holiGoldBell" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="60%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#A16207" />
              </linearGradient>
            </defs>

            {/* Repeating Festive Toran Scallops */}
            {Array.from({ length: 24 }).map((_, i) => {
              const cx = i * 50 + 25;
              const isEven = i % 2 === 0;
              return (
                <g key={`holitoran-${i}`}>
                  {/* Pink & Cyan Ribbon Swag Ropes */}
                  <path
                    d={`M ${cx - 25} 0 Q ${cx} 22 ${cx + 25} 0`}
                    fill="none"
                    stroke="url(#holiPinkRope)"
                    strokeWidth="1.8"
                    strokeDasharray="2 2"
                  />
                  <path
                    d={`M ${cx - 25} 2 Q ${cx} 24 ${cx + 25} 2`}
                    fill="none"
                    stroke="url(#holiCyanRope)"
                    strokeWidth="2.2"
                  />

                  {/* Alternating Mini Color Drop Cluster or Mini Silver Pichkari */}
                  {isEven ? (
                    /* Mini Multi-Color Drop Cluster */
                    <g transform={`translate(${cx}, 14) scale(0.65)`}>
                      <circle cx="-5" cy="0" r="3.5" fill="#EC4899" />
                      <circle cx="5" cy="0" r="3.5" fill="#FACC15" />
                      <circle cx="0" cy="5" r="3.5" fill="#06B6D4" />
                      <circle cx="0" cy="-3" r="2.5" fill="#10B981" />
                    </g>
                  ) : (
                    /* Mini Golden/Silver Pichkari */
                    <g transform={`translate(${cx - 7}, 10) rotate(-25) scale(0.6)`}>
                      <rect x="0" y="2" width="20" height="6" rx="2" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.8" />
                      <polygon points="20,2 26,4 26,6 20,8" fill="#FACC15" />
                      <circle cx="-3" cy="5" r="2.5" fill="#FACC15" />
                    </g>
                  )}

                  {/* Hanging Golden Bell */}
                  <g transform={`translate(${cx}, 27) scale(0.55)`}>
                    <polygon points="-4,0 4,0 6,8 -6,8" fill="url(#holiGoldBell)" stroke="#713F12" strokeWidth="0.6" />
                    <circle cx="0" cy="9" r="1.5" fill="#713F12" />
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Center Holi Greeting Banner Badge */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 mx-auto flex items-center space-x-2 bg-gradient-to-r from-pink-600 via-purple-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white text-[10px] sm:text-xs font-black tracking-widest uppercase px-3 sm:px-4 py-0.5 rounded-full shadow-md border border-yellow-200 pointer-events-auto cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
          <span>🎨 Bura Na Mano, Holi Hai! • Celebrate Colors of Joy with Pure Silver Keepsakes 🌈</span>
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
        </button>
      </div>

      {/* 5. BOTTOM-RIGHT: ROYAL SILVER PICHKARI & GULAL THALI MOTIF (MIRRORED, NO CARD) */}
      <HoliPichkariMotif side="right" onOpenModal={() => setIsModalOpen(true)} />
    </>
  );
}
