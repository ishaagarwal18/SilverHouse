import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, Gift, ShoppingBag, TreePine, Heart } from 'lucide-react';

/**
 * 5 Wonder-Filled Holiday Silver Traditions
 */
export const CHRISTMAS_TRADITIONS = [
  {
    id: 1,
    title: 'Christmas Eve & Tree Decor',
    subtitle: 'Deck the Halls with Pure Silver',
    dateDesc: 'December 24 • Christmas Eve',
    significance: 'Adorning the evergreen tree with sparkling heirloom ornaments, ushering in warmth, peace, and holiday wonder.',
    recommendedSilver: 'Sterling Silver Snowflake Ornaments & Starlight Tree Topper Charms',
    icon: '🎄',
    accentColor: 'from-emerald-700 to-teal-600'
  },
  {
    id: 2,
    title: 'Christmas Day Gifting',
    subtitle: 'Unwrapping Precious Silver Magic',
    dateDesc: 'December 25 • Christmas Morning',
    significance: 'Sharing love and lifelong memories with handcrafted pure silver gifts under the tree for those dearest to you.',
    recommendedSilver: 'Guardian Angel Silver Pendants, Festive Charms & Diamond-Cut Payals',
    icon: '🎁',
    accentColor: 'from-red-600 to-rose-700'
  },
  {
    id: 3,
    title: 'Boxing Day & Warm Gatherings',
    subtitle: 'Gratitude & Celebration with Family',
    dateDesc: 'December 26 • Season of Giving',
    significance: 'A day of sharing goodwill, holiday treats, and meaningful silver tokens with dear friends and household companions.',
    recommendedSilver: 'Sterling Silver Coffee Spoons, Photo Frames & Engraved Gift Coins',
    icon: '🌟',
    accentColor: 'from-amber-600 to-yellow-600'
  },
  {
    id: 4,
    title: 'New Year’s Eve Grand Countdown',
    subtitle: 'Welcoming the Sparkling New Year',
    dateDesc: 'December 31 • Cheers to New Beginnings',
    significance: 'Toasting to prosperity, hope, and shimmering new beginnings as the midnight bell rings.',
    recommendedSilver: 'Pure 999 Silver New Year Blessing Bars & Statement Cocktail Rings',
    icon: '🥂',
    accentColor: 'from-indigo-600 to-blue-700'
  },
  {
    id: 5,
    title: 'Epiphany & Three Kings Day',
    subtitle: 'Gifts of Gold, Frankincense & Silver',
    dateDesc: 'January 6 • Twelfth Night',
    significance: 'Celebrating wisdom and auspicious journeys with cherished keepsake bullion and spiritual silver symbols.',
    recommendedSilver: 'Royal 925 Silver Coins, Carved Idols & Heritage Silver Keepsakes',
    icon: '👑',
    accentColor: 'from-purple-700 to-pink-600'
  }
];

export default function ChristmasFestivalModal({ isOpen, onClose, onNavigateToFestival }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!isOpen) return null;

  const currentItem = CHRISTMAS_TRADITIONS[selectedIdx] || CHRISTMAS_TRADITIONS[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-red-500/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Festive Header Banner */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-red-700 via-rose-600 to-emerald-700 text-white overflow-hidden shrink-0">
          {/* Frosted Snowflake Ambient Pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none text-4xl flex justify-around items-center">
            <span>❄️</span>
            <span>✨</span>
            <span>🎄</span>
            <span>⭐</span>
            <span>❄️</span>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl sm:text-4xl">🎄</span>
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-wide flex items-center space-x-2">
                  <span>Merry Christmas &amp; Happy New Year</span>
                </h3>
                <p className="text-xs sm:text-sm text-red-100 font-medium">
                  Silver House Holiday Magic • Pure 925 Keepsakes &amp; Gifting Guide
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

        {/* 5 Traditions Navigation Tabs */}
        <div className="p-3 bg-red-50/70 dark:bg-slate-800/80 border-b border-red-100 dark:border-slate-800 flex space-x-2 overflow-x-auto no-scrollbar shrink-0">
          {CHRISTMAS_TRADITIONS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedIdx === idx
                  ? 'bg-gradient-to-r from-red-600 to-emerald-600 text-white shadow-md scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-red-100/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.title}</span>
            </button>
          ))}
        </div>

        {/* Selected Tradition Detail Card */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                {currentItem.dateDesc}
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

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Holiday Significance</span>
            </h5>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentItem.significance}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border border-emerald-300/80 dark:border-emerald-700/60 flex items-start space-x-3">
            <Gift className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1">
                Curated Holiday Silver Keepsakes
              </h5>
              <p className="text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-200">
                {currentItem.recommendedSilver}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Close Guide
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onNavigateToFestival) {
                onNavigateToFestival();
              }
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 via-rose-600 to-emerald-600 hover:from-red-500 hover:to-emerald-500 text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Christmas Gifts</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
