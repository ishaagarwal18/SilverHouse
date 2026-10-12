import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import DiwaliFestivalModal from './DiwaliFestivalModal';
import DiwaliDiyaMotif from './DiwaliDiyaMotif';
import DiwaliSparklerMotif from './DiwaliSparklerMotif';

/**
 * DiwaliFestivalDecor - Master Diwali Festival Suite for Silver House
 * Features:
 * 1. Top Festive Marigold & Glowing Brass Diya Toran (Bandhanwar)
 * 2. Center "Shubh Deepavali • Festival of Lights" greeting badge
 * 3. Bottom-Left: Handcrafted Silver Kamakshi Deepam with Lakshmi Charan Paduka (DiwaliDiyaMotif)
 * 4. Bottom-Right: Sparkling Festive Golden Fuljadi & Anaar Fountain (DiwaliSparklerMotif)
 * 5. Interactive Diwali Mahotsav Showcase Modal (DiwaliFestivalModal)
 */
export default function DiwaliFestivalDecor({ onNavigateToFestival }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Interactive 5-Days Deepavali Showcase Modal */}
      <DiwaliFestivalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNavigateToFestival={onNavigateToFestival}
      />

      {/* Bottom-Left: Auspicious Kamakshi Diya & Lakshmi Charan */}
      <DiwaliDiyaMotif onOpenModal={() => setIsModalOpen(true)} />

      {/* 1. TOP HEADER FESTIVE MARIGOLD & GOLDEN DIYA TORAN (BANDHANWAR) */}
      <div className="w-full relative z-[45] pointer-events-none select-none overflow-hidden h-7 sm:h-9 bg-gradient-to-r from-amber-600/15 via-yellow-500/25 to-amber-600/15 border-b border-amber-500/40 flex items-center justify-between px-2 sm:px-6">
        {/* Repeating Garland SVG with Hanging Deepams & Marigold */}
        <div className="absolute inset-0 flex items-center justify-between opacity-95 overflow-hidden">
          <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 1200 40">
            <defs>
              <linearGradient id="marigoldDiwali" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFA000" />
                <stop offset="50%" stopColor="#FF6D00" />
                <stop offset="100%" stopColor="#D84315" />
              </linearGradient>
              <linearGradient id="mangoLeafDiwali" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2E7D32" />
                <stop offset="100%" stopColor="#1B5E20" />
              </linearGradient>
              <linearGradient id="diyaGoldDiwali" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="60%" stopColor="#FFB300" />
                <stop offset="100%" stopColor="#E65100" />
              </linearGradient>
              <radialGradient id="hangingDiyaFlame" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#FFD54F" />
                <stop offset="100%" stopColor="#FF6D00" />
              </radialGradient>
            </defs>

            {/* Repeating Festive Toran Scallops with Hanging Diyas */}
            {Array.from({ length: 24 }).map((_, i) => {
              const cx = i * 50 + 25;
              return (
                <g key={i}>
                  {/* Scallop Golden Rope */}
                  <path
                    d={`M ${cx - 25} 0 Q ${cx} 22 ${cx + 25} 0`}
                    fill="none"
                    stroke="#FF8F00"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                  />
                  {/* Marigold Blossom */}
                  <circle cx={cx} cy="16" r="6.5" fill="url(#marigoldDiwali)" />
                  <circle cx={cx} cy="16" r="3.5" fill="#FFE082" />

                  {/* Mango Leaves */}
                  <path
                    d={`M ${cx} 16 Q ${cx - 5} 30 ${cx} 36 Q ${cx + 5} 30 ${cx} 16 Z`}
                    fill="url(#mangoLeafDiwali)"
                  />

                  {/* Hanging Miniature Diya / Bell */}
                  <path
                    d={`M ${cx - 4} 34 Q ${cx} 38 ${cx + 4} 34 Q ${cx} 39 ${cx - 4} 34 Z`}
                    fill="url(#diyaGoldDiwali)"
                  />
                  {/* Tiny Diya Wick Flame */}
                  <circle cx={cx} cy="32" r="1.5" fill="url(#hangingDiyaFlame)" className="animate-pulse" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Center Shubh Deepavali Greeting Banner Badge */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 mx-auto flex items-center space-x-2 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 text-white text-[10px] sm:text-xs font-black tracking-widest uppercase px-3 sm:px-4 py-0.5 rounded-full shadow-md border border-yellow-300/70 pointer-events-auto cursor-pointer hover:scale-105 transition-transform"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
          <span>Shubh Deepavali • Festival of Lights &amp; Prosperity</span>
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
        </button>
      </div>

      {/* Bottom-Right: Sparkling Festive Fuljadi & Golden Anaar */}
      <DiwaliSparklerMotif onOpenModal={() => setIsModalOpen(true)} />
    </>
  );
}
