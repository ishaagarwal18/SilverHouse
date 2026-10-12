import React, { useState, useEffect } from 'react';
import { Sparkles, X, ChevronRight, Music, Volume2, VolumeX } from 'lucide-react';
import NavratriGarboModal from './NavratriGarboModal';
import DandiyaBoyMotif from './DandiyaBoyMotif';
import DandiyaGirlMotif from './DandiyaGirlMotif';

/**
 * 9 Sacred Colors of Navratri with corresponding Goddesses & auspicious themes
 */
export const NAVRATRI_DAYS = [
  { day: 1, colorName: 'Royal Red / Orange', hex: '#E63946', bgGradient: 'from-red-600 to-orange-500', goddess: 'Maa Shailputri', significance: 'Purity, Energy & Divine Grace', jewelry: 'Silver Red Meenakari Bangles & Anklets' },
  { day: 2, colorName: 'Pristine White', hex: '#F8F9FA', bgGradient: 'from-slate-100 to-amber-50', goddess: 'Maa Brahmacharini', significance: 'Peace, Calmness & Wisdom', jewelry: 'Pure Sterling Silver Payal & Chokers' },
  { day: 3, colorName: 'Glorious Red', hex: '#D90429', bgGradient: 'from-red-700 to-rose-500', goddess: 'Maa Chandraghanta', significance: 'Courage, Passion & Vitality', jewelry: 'Oxidised Silver Red Ruby Hasli Necklaces' },
  { day: 4, colorName: 'Royal Blue', hex: '#1D3557', bgGradient: 'from-blue-700 to-indigo-900', goddess: 'Maa Kushmanda', significance: 'Health, Prosperity & Radiance', jewelry: 'Silver Blue Lapis Lazuli Ear Cuffs & Rings' },
  { day: 5, colorName: 'Warm Yellow', hex: '#FFB703', bgGradient: 'from-amber-400 to-yellow-500', goddess: 'Maa Skandamata', significance: 'Happiness, Energy & Joy', jewelry: 'Gold-Plated Silver Jhumkas & Kamarbandh' },
  { day: 6, colorName: 'Vibrant Green', hex: '#2A9D8F', bgGradient: 'from-emerald-600 to-teal-700', goddess: 'Maa Katyayani', significance: 'Growth, Fertility & Harmony', jewelry: 'Oxidised Silver Emerald Green Kada Set' },
  { day: 7, colorName: 'Sophisticated Grey', hex: '#6C757D', bgGradient: 'from-slate-500 to-gray-700', goddess: 'Maa Kalaratri', significance: 'Protection & Transformation', jewelry: 'Smoky Silver Antique Oxidised Statement Rings' },
  { day: 8, colorName: 'Auspicious Pink', hex: '#FF70A6', bgGradient: 'from-pink-500 to-rose-600', goddess: 'Maa Mahagauri', significance: 'Compassion, Joy & Fulfillment', jewelry: 'Silver Pink Enamel Pendant & Payal Set' },
  { day: 9, colorName: 'Peacock Green', hex: '#0077B6', bgGradient: 'from-teal-600 to-cyan-800', goddess: 'Maa Siddhidatri', significance: 'Divine Perfection & Siddhi', jewelry: 'Royal Peacock Motif Silver Haathphool' },
];

export default function NavratriFestivalDecor({ onNavigateToFestival }) {
  const [currentDayIdx, setCurrentDayIdx] = useState(0)
  const [showColorBanner, setShowColorBanner] = useState(true);
  const [isDandiyaSpinning, setIsDandiyaSpinning] = useState(false);
  const [sparkleBurst, setSparkleBurst] = useState([]);
  const [isGarboModalOpen, setIsGarboModalOpen] = useState(false);

  // Auto-detect current Navratri day or set default
  useEffect(() => {
    const today = new Date();
    // Default to day 1 or map to date
    const day = (today.getDate() % 9);
    setCurrentDayIdx(isNaN(day) ? 0 : day);
  }, []);

  const currentNavDay = NAVRATRI_DAYS[currentDayIdx] || NAVRATRI_DAYS[0];


  return (
    <>
      {/* Interactive Garbo Modal */}
      <NavratriGarboModal
        isOpen={isGarboModalOpen}
        onClose={() => setIsGarboModalOpen(false)}
        onNavigateToFestival={onNavigateToFestival}
      />

      {/* Joyful Gujarati Boy Playing Dandiya Raas */}
      <DandiyaBoyMotif onOpenModal={() => setIsGarboModalOpen(true)} />

      {/* 1. TOP HEADER FESTIVE MARIGOLD & MANGO LEAF TORAN (BANDHANWAR) */}
      <div className="w-full relative z-[45] pointer-events-none select-none overflow-hidden h-7 sm:h-9 bg-gradient-to-r from-amber-600/10 via-amber-500/20 to-amber-600/10 border-b border-amber-500/30 flex items-center justify-between px-2 sm:px-6">
        {/* Repeating Garland Svg */}
        <div className="absolute inset-0 flex items-center justify-between opacity-90 overflow-hidden">
          <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 1200 40">
            <defs>
              <linearGradient id="marigoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF9900" />
                <stop offset="50%" stopColor="#FF6600" />
                <stop offset="100%" stopColor="#CC0000" />
              </linearGradient>
              <linearGradient id="leafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2E7D32" />
                <stop offset="100%" stopColor="#1B5E20" />
              </linearGradient>
              <linearGradient id="goldBellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="100%" stopColor="#FFB300" />
              </linearGradient>
            </defs>

            {/* Garland Strings & Scallops */}
            {Array.from({ length: 24 }).map((_, i) => {
              const cx = i * 50 + 25;
              return (
                <g key={i}>
                  {/* Scallop Rope */}
                  <path
                    d={`M ${cx - 25} 0 Q ${cx} 24 ${cx + 25} 0`}
                    fill="none"
                    stroke="#FF8C00"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                  />
                  {/* Marigold Flower */}
                  <circle cx={cx} cy="18" r="7" fill="url(#marigoldGrad)" />
                  <circle cx={cx} cy="18" r="4" fill="#FFD700" />
                  {/* Mango Leaf */}
                  <path
                    d={`M ${cx} 18 Q ${cx - 5} 32 ${cx} 38 Q ${cx + 5} 32 ${cx} 18 Z`}
                    fill="url(#leafGrad)"
                  />
                  {/* Hanging Gold Ghungroo Bell */}
                  <circle cx={cx} cy="38" r="2.5" fill="url(#goldBellGrad)" className="animate-pulse" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Center Navratri Greeting Banner Badge */}
        <button
          type="button"
          onClick={() => setIsGarboModalOpen(true)}
          className="relative z-10 mx-auto flex items-center space-x-2 bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 text-white text-[10px] sm:text-xs font-black tracking-widest uppercase px-3 py-0.5 rounded-full shadow-md border border-yellow-300/60 pointer-events-auto cursor-pointer hover:scale-105 transition-transform"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
          <span>Shubh Navratri • Shubh Garba Mahotsav</span>
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
        </button>
      </div>

      {/* 2. TOP RIGHT CORNER: ELEGANT GUJARATI GARBA DANCER (GIRL PLAYING DANDIYA) */}
      <DandiyaGirlMotif onOpenModal={() => setIsGarboModalOpen(true)} />

      {/* 5. FLOATING DANDIYA SPARKLE BURST PARTICLES */}
      {sparkleBurst.map((p) => (
        <div
          key={p.id}
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color
          }}
          className="fixed pointer-events-none rounded-full z-[99999] animate-ping"
        />
      ))}
    </>
  );
}
