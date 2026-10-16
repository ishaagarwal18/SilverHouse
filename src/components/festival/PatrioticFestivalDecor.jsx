import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import PatrioticFestivalModal from './PatrioticFestivalModal';
import PatrioticFlagMotif from './PatrioticFlagMotif';
import PatrioticChakraMotif from './PatrioticChakraMotif';

/**
 * PatrioticFestivalDecor - Unified Republic & Independence Day Festival Suite for Silver House
 * 
 * Features:
 * 1. Ambient Floating Tricolor Balloons, Soaring Peace Doves, Navy Ashoka Chakras & Marigold Petals.
 * 2. Top Header Tricolor Toran Garland with Marigold Swags, Mango Leaves & Ashoka Chakra Medallions.
 * 3. Center "Happy Republic & Independence Day • Pride of India & Pure Silver Keepsakes" banner badge.
 * 4. Bottom-Left: Pure Waving Indian Flag (Tiranga) - (PatrioticFlagMotif) - NO CARD.
 * 5. Bottom-Right: Pure 24-Spoke Ashok Chakra - (PatrioticChakraMotif) - NO CARD.
 * 6. Interactive 5 Pillars of the Nation & Pure Silver Keepsakes Showcase (PatrioticFestivalModal).
 */
export default function PatrioticFestivalDecor({ onNavigateToFestival }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate lightweight ambient floating tricolor balloons, petals and chakra stars
  const floaters = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    left: `${(i * 4.2 + (i % 3) * 1.5).toFixed(1)}%`,
    size: i % 3 === 0 ? 11 : i % 2 === 0 ? 8 : 6,
    duration: (7.2 + (i % 4) * 1.6).toFixed(1),
    delay: ((i * 0.42) % 4.5).toFixed(1),
    opacity: (0.35 + (i % 3) * 0.18).toFixed(2),
    color: ['#FF9933', '#FFFFFF', '#138808', '#000080', '#FFD700', '#FF9933', '#138808'][i % 7],
    type: i % 3 === 0 ? 'chakra' : i % 2 === 0 ? 'balloon' : 'dove'
  }));

  return (
    <>
      {/* 1. AMBIENT FLOATING TRICOLOR PARTICLES */}
      <div className="fixed inset-0 pointer-events-none z-[35] overflow-hidden">
        <style>{`
          @keyframes ambientPatrioticFloat {
            0% {
              transform: translateY(105vh) translateX(0px) rotate(0deg);
              opacity: 0;
            }
            15% {
              opacity: var(--pat-opacity);
            }
            50% {
              transform: translateY(50vh) translateX(16px) rotate(-12deg);
            }
            85% {
              opacity: var(--pat-opacity);
            }
            100% {
              transform: translateY(-20px) translateX(-14px) rotate(24deg);
              opacity: 0;
            }
          }
          .animate-pat-float {
            animation: ambientPatrioticFloat var(--pat-duration) linear infinite;
            animation-delay: var(--pat-delay);
          }
        `}</style>
        {floaters.map((p) => (
          <div
            key={p.id}
            style={{
              left: p.left,
              bottom: '-15px',
              '--pat-duration': `${p.duration}s`,
              '--pat-delay': `${p.delay}s`,
              '--pat-opacity': p.opacity
            }}
            className="absolute animate-pat-float pointer-events-none"
          >
            {p.type === 'chakra' ? (
              <svg
                width={p.size * 1.6}
                height={p.size * 1.6}
                viewBox="0 0 24 24"
                fill="none"
                style={{ filter: 'drop-shadow(0 0 5px rgba(0,0,128,0.6))' }}
              >
                <circle cx="12" cy="12" r="9" stroke="#000080" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="2.5" fill="#000080" />
                {Array.from({ length: 8 }).map((_, spokeIdx) => (
                  <line
                    key={spokeIdx}
                    x1="12"
                    y1="12"
                    x2={12 + 8 * Math.cos((spokeIdx * Math.PI) / 4)}
                    y2={12 + 8 * Math.sin((spokeIdx * Math.PI) / 4)}
                    stroke="#000080"
                    strokeWidth="1.2"
                  />
                ))}
              </svg>
            ) : p.type === 'balloon' ? (
              <div
                style={{
                  width: `${p.size * 1.2}px`,
                  height: `${p.size * 1.5}px`,
                  backgroundColor: p.color,
                  borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                  boxShadow: `0 0 6px ${p.color}`,
                  border: p.color === '#FFFFFF' ? '1px solid #CBD5E1' : 'none'
                }}
              />
            ) : (
              <svg
                width={p.size * 1.6}
                height={p.size * 1.2}
                viewBox="0 0 24 20"
                fill="#FFFFFF"
                style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))' }}
              >
                <path d="M 2 10 Q 8 2 16 4 Q 22 2 20 8 Q 24 10 22 14 Q 14 12 10 16 Q 4 18 2 10 Z" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* 2. INTERACTIVE REPUBLIC & INDEPENDENCE DAY MODAL */}
      <PatrioticFestivalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNavigateToFestival={onNavigateToFestival}
      />

      {/* 3. BOTTOM-LEFT: PURE WAVING INDIAN FLAG MOTIF (NO CARD) */}
      <PatrioticFlagMotif onOpenModal={() => setIsModalOpen(true)} />

      {/* 4. TOP HEADER TRICOLOR TORAN GARLAND */}
      <div className="w-full relative z-[45] pointer-events-none select-none overflow-hidden h-7 sm:h-9 bg-gradient-to-r from-orange-950/40 via-slate-900/40 to-emerald-950/40 border-b border-orange-500/40 flex items-center justify-between px-2 sm:px-6">
        {/* Repeating Toran SVG with Saffron Marigold Swags, White Jasmine, Green Mango Leaves & Navy Chakras */}
        <div className="absolute inset-0 flex items-center justify-between opacity-95 overflow-hidden">
          <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 1200 40">
            <defs>
              <linearGradient id="patSaffronRope" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FED7AA" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#C2410C" />
              </linearGradient>

              <linearGradient id="patGreenRope" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BBF7D0" />
                <stop offset="50%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#15803D" />
              </linearGradient>

              <linearGradient id="patGoldBell" x1="0%" y1="0%" x2="100%" y2="100%">
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
                <g key={`pattoran-${i}`}>
                  {/* Saffron & Green Marigold Swag Ropes */}
                  <path
                    d={`M ${cx - 25} 0 Q ${cx} 22 ${cx + 25} 0`}
                    fill="none"
                    stroke="url(#patSaffronRope)"
                    strokeWidth="1.8"
                    strokeDasharray="2 2"
                  />
                  <path
                    d={`M ${cx - 25} 2 Q ${cx} 24 ${cx + 25} 2`}
                    fill="none"
                    stroke="url(#patGreenRope)"
                    strokeWidth="2.2"
                  />

                  {/* Alternating Navy Ashoka Chakra or Tri-tone Marigold Cluster */}
                  {isEven ? (
                    /* Miniature Navy Ashoka Chakra */
                    <g transform={`translate(${cx}, 14) scale(0.65)`}>
                      <circle cx="0" cy="0" r="9" stroke="#000080" strokeWidth="2" fill="#FFFFFF" />
                      <circle cx="0" cy="0" r="2.2" fill="#000080" />
                      {Array.from({ length: 6 }).map((_, sIdx) => (
                        <line
                          key={sIdx}
                          x1={-8 * Math.cos((sIdx * Math.PI) / 6)}
                          y1={-8 * Math.sin((sIdx * Math.PI) / 6)}
                          x2={8 * Math.cos((sIdx * Math.PI) / 6)}
                          y2={8 * Math.sin((sIdx * Math.PI) / 6)}
                          stroke="#000080"
                          strokeWidth="1"
                        />
                      ))}
                    </g>
                  ) : (
                    /* Tri-tone Flower Cluster: Saffron, White, Green */
                    <g transform={`translate(${cx}, 14) scale(0.65)`}>
                      <circle cx="0" cy="-6" r="3.2" fill="#FF9933" stroke="#C2410C" strokeWidth="0.5" />
                      <circle cx="0" cy="0" r="3.2" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.5" />
                      <circle cx="0" cy="6" r="3.2" fill="#138808" stroke="#14532D" strokeWidth="0.5" />
                    </g>
                  )}

                  {/* Hanging Golden Bell */}
                  <g transform={`translate(${cx}, 27) scale(0.55)`}>
                    <polygon points="-4,0 4,0 6,8 -6,8" fill="url(#patGoldBell)" stroke="#713F12" strokeWidth="0.6" />
                    <circle cx="0" cy="9" r="1.5" fill="#713F12" />
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Center Republic & Independence Day Greeting Banner Badge */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 mx-auto flex items-center space-x-2 bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 hover:from-orange-500 hover:to-emerald-600 text-white text-[10px] sm:text-xs font-black tracking-widest uppercase px-3 sm:px-4 py-0.5 rounded-full shadow-md border border-yellow-200 pointer-events-auto cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping" />
          <span>🇮🇳 Happy Republic &amp; Independence Day • Pride of India &amp; Pure Silver Keepsakes 🇮🇳</span>
          <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping" />
        </button>
      </div>

      {/* 5. BOTTOM-RIGHT: PURE 24-SPOKE ASHOK CHAKRA MOTIF (NO CARD) */}
      <PatrioticChakraMotif onOpenModal={() => setIsModalOpen(true)} />
    </>
  );
}
