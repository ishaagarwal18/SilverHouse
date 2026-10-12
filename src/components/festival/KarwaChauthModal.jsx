import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, Moon, ShoppingBag, Heart, Flame } from 'lucide-react';

/**
 * 5 Sacred Karwa Chauth Rituals & Gifting Traditions
 */
export const KARWA_CHAUTH_RITUALS = [
  {
    id: 1,
    title: 'Sargi • Pre-Dawn Blessing',
    subtitle: 'The Sacred Gift of Motherly Love',
    timeDesc: 'Brahma Muhurat • Before Sunrise',
    significance: 'Loving mother-in-law blesses the daughter-in-law with Sargi (feni, dry fruits, sweets, and auspicious silver jewelry) to grant health, devotion, and strength for the nirjala fast.',
    recommendedSilver: 'Pure 925 Silver Sargi Katori Set, Dry Fruit Box & Auspicious Silver Coins',
    icon: '🥣',
    accentColor: 'from-amber-600 to-rose-600'
  },
  {
    id: 2,
    title: 'Karwa Chauth Pooja & Katha',
    subtitle: 'Evening Prayer & Veeravati Katha',
    timeDesc: 'Evening Sandhya Muhurat',
    significance: 'Women gather in bridal red & maroon attire with Mehendi and Chooda, singing traditional Karwa phere songs and listening to the sacred story of Queen Veeravati.',
    recommendedSilver: 'Pure Sterling Silver Karwa Chauth Thali Set with Diya & Kapoor Aarti Spoon',
    icon: '🪔',
    accentColor: 'from-red-600 to-rose-700'
  },
  {
    id: 3,
    title: 'Chandra Darshan via Chhalni',
    subtitle: 'Gazing at the Moon & Beloved Spouse',
    timeDesc: 'Moonrise Chandra Darshan',
    significance: 'The eagerly awaited moonrise! The fasting wife looks at the radiant moon through the decorated Chhalni (sieve) with a lit diya, and then gazes upon her husband, seeking his lifelong health and companionship.',
    recommendedSilver: 'Handcrafted 925 Silver Chhalni (Sieve) & Sterling Silver Deepam',
    icon: '🌙',
    accentColor: 'from-yellow-600 to-amber-700'
  },
  {
    id: 4,
    title: 'Chandra Arghya Vidhi',
    subtitle: 'Sacred Water Offering to the Moon',
    timeDesc: 'Sacred Moonrise Arghya',
    significance: 'Offering holy Ganga Jal, milk, raw rice, and vermillion to the moon from the spout of the sacred Karwa pot, praying for emotional peace, prosperity, and an unbroken marital bond (Akhand Saubhagya).',
    recommendedSilver: 'Pure 925 Sterling Silver Karwa (Tonti Lota) with Engraved Swastik',
    icon: '💧',
    accentColor: 'from-blue-600 to-indigo-700'
  },
  {
    id: 5,
    title: 'Vrat Paaran & Saubhagya Gifts',
    subtitle: 'Breaking the Fast with Pure Silver',
    timeDesc: 'Post-Arghya Feast & Gifting',
    significance: 'Husband lovingly offers the first sip of water and bite of sweet to his wife. Celebrated with the presentation of prized silver jewellery gifts as tokens of eternal appreciation and love.',
    recommendedSilver: 'Meenakari Silver Bichhiya (Toe Rings), Designer Mangalsutra & Sindoor Dani',
    icon: '💖',
    accentColor: 'from-rose-600 to-pink-700'
  }
];

export default function KarwaChauthModal({ isOpen, onClose, onNavigateToFestival }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!isOpen) return null;

  const currentItem = KARWA_CHAUTH_RITUALS[selectedIdx] || KARWA_CHAUTH_RITUALS[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-500/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Festive Header Banner */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-rose-800 via-red-700 to-amber-700 text-white overflow-hidden shrink-0">
          {/* Subtle Ambient Moon & Stars Pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none text-4xl flex justify-around items-center">
            <span>🌙</span>
            <span>✨</span>
            <span>🪔</span>
            <span>💖</span>
            <span>⭐</span>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl sm:text-4xl">🌙</span>
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-wide flex items-center space-x-2">
                  <span>Shubh Karwa Chauth Mahotsav</span>
                </h3>
                <p className="text-xs sm:text-sm text-rose-100 font-medium">
                  Akhand Saubhagya • Pure 925 Sterling Silver Karwa Chauth Guide
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

        {/* 5 Rituals Navigation Tabs */}
        <div className="p-3 bg-rose-50/70 dark:bg-slate-800/80 border-b border-rose-100 dark:border-slate-800 flex space-x-2 overflow-x-auto no-scrollbar shrink-0">
          {KARWA_CHAUTH_RITUALS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedIdx === idx
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-rose-100/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.title.split('•')[0]}</span>
            </button>
          ))}
        </div>

        {/* Selected Ritual Detail Card */}
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

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Sacred Significance</span>
            </h5>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentItem.significance}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 dark:from-rose-950/40 dark:via-amber-950/30 dark:to-rose-950/40 border border-rose-300/80 dark:border-rose-700/60 flex items-start space-x-3">
            <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-black uppercase tracking-wider text-rose-800 dark:text-rose-300 mb-1">
                Auspicious Silver Keepsakes
              </h5>
              <p className="text-xs sm:text-sm font-semibold text-rose-950 dark:text-rose-200">
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
            className="flex items-center space-x-2 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Karwa Chauth Silver</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
