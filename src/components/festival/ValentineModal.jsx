import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, ShoppingBag, Heart } from 'lucide-react';

/**
 * 5 Valentine's Day Romantic Traditions & Fine Silver Keepsakes
 */
export const VALENTINE_EXPRESSIONS = [
  {
    id: 1,
    title: 'The Eternal Promise & Couple Bands',
    subtitle: 'Unbroken Commitment Sealed in Sterling Silver',
    timeDesc: 'Promise Day • A Vow of Everlasting Devotion',
    significance: 'Exchanging promise rings is an intimate milestone marking the quiet confidence that your paths are forever intertwined. Crafted in pure hypoallergenic 925 silver, these bands withstand every season of life together.',
    recommendedSilver: 'Pure 925 Sterling Silver Solitaire Promise Rings, Adjustable Couple Bands & Roman Numeral Anniversary Rings',
    icon: '💍',
    accentColor: 'from-rose-600 to-red-700'
  },
  {
    id: 2,
    title: 'Heart Pendants & Secret Lockets',
    subtitle: 'Keeping Treasured Memories Close to Your Heart',
    timeDesc: 'Forever Close • The Touch of Romance',
    significance: 'A silver heart resting softly against the collarbone serves as a radiant reminder of your affection throughout the day. Secret photo lockets carry handwritten words or a cherished portrait.',
    recommendedSilver: 'Interlocking Double Heart Silver Pendants, Rose Quartz Heart Charms & Vintage Filigree Silver Lockets',
    icon: '💖',
    accentColor: 'from-pink-600 to-rose-700'
  },
  {
    id: 3,
    title: 'Solitaire Tennis Bracelets & Infinity Bangles',
    subtitle: 'Daily Sparkle that Glints with Every Gesture',
    timeDesc: 'Everyday Luxury • Effortless Elegance',
    significance: 'Silver tennis bracelets encrusted with brilliant cubic zirconia flow gracefully around the wrist. The infinite loops symbolize a love without beginning or end, effortlessly worn from day to evening.',
    recommendedSilver: 'AAA+ Cubic Zirconia 925 Tennis Bracelets, Infinity Knot Silver Bangles & Rose-Gold Dipped Heart Cuffs',
    icon: '✨',
    accentColor: 'from-rose-700 to-red-800'
  },
  {
    id: 4,
    title: 'Dangling Solitaire Drops & Heart Huggies',
    subtitle: 'Framing Every Smile with Pure Luminescence',
    timeDesc: 'Romantic Date Night • Illuminating Beauty',
    significance: 'Catching candlelight during dinner dates, sterling silver earrings bring a captivating halo to every expression. Lightweight and comfortable for all-day wear with secure latch-backs.',
    recommendedSilver: 'Pure Silver Teardrop Solitaire Drops, Sweet Heart Huggie Hoops & Dainty Pavé Crystal Studs',
    icon: '🌹',
    accentColor: 'from-red-600 to-pink-700'
  },
  {
    id: 5,
    title: 'Custom Engraved Keepsakes & Silver Roses',
    subtitle: 'Bespoke Tokens that Never Fade with Time',
    timeDesc: 'Valentine\'s Special • One-of-a-Kind Devotion',
    significance: 'Unlike fresh flowers that wither, a handcrafted silver rose and engraved coin or bookmark remain pristine for decades. Personalize with coordinates of where you met or your special anniversary date.',
    recommendedSilver: 'Pure 999 Fine Silver Dipped Rose Flowers, Custom Coordinates Engraved Silver Coins & Love Bar Keychains',
    icon: '🎁',
    accentColor: 'from-pink-700 to-rose-900'
  }
];

export default function ValentineModal({ isOpen, onClose, onNavigateToFestival }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!isOpen) return null;

  const currentItem = VALENTINE_EXPRESSIONS[selectedIdx] || VALENTINE_EXPRESSIONS[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-500/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Festive Header Banner */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-rose-900 to-red-950 text-white overflow-hidden shrink-0">
          {/* Subtle Ambient Heart Floating Pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none text-4xl flex justify-around items-center">
            <span>💖</span>
            <span>🌹</span>
            <span>💍</span>
            <span>✨</span>
            <span>💘</span>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl sm:text-4xl">💖</span>
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-wide flex items-center space-x-2">
                  <span>Valentine's Day Romance</span>
                </h3>
                <p className="text-xs sm:text-sm text-rose-200 font-medium">
                  Eternal Love • Pure 925 Sterling Silver Keepsakes &amp; Gifting Guide
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5 Expressions Navigation Tabs */}
        <div className="p-3 bg-rose-50/70 dark:bg-slate-800/80 border-b border-rose-100 dark:border-slate-800 flex space-x-2 overflow-x-auto no-scrollbar shrink-0">
          {VALENTINE_EXPRESSIONS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedIdx === idx
                  ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 text-white shadow-md scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-rose-100/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.title.split('&')[0]}</span>
            </button>
          ))}
        </div>

        {/* Selected Expression Detail Card */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                {currentItem.timeDesc}
              </span>
              <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {currentItem.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentItem.subtitle}
              </p>
            </div>
            <div className="text-3xl self-start sm:self-center">
              {currentItem.icon}
            </div>
          </div>

          <div className="bg-rose-50/60 dark:bg-slate-800/50 p-4 rounded-2xl border border-rose-100 dark:border-slate-700">
            <h5 className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-1.5 flex items-center space-x-1.5">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Romantic Significance</span>
            </h5>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentItem.significance}
            </p>
          </div>

          <div className="bg-amber-50/60 dark:bg-slate-800/50 p-4 rounded-2xl border border-amber-200 dark:border-slate-700">
            <h5 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1.5 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Recommended Silver Keepsakes</span>
            </h5>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              {currentItem.recommendedSilver}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            <span>Hallmarked 925 Sterling Silver • Express Valentine's Delivery Across India</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onNavigateToFestival) {
                onNavigateToFestival('valentines');
              }
            }}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm px-6 py-2.5 rounded-2xl shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Valentine Collection</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
