import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, ShoppingBag, Heart, PartyPopper } from 'lucide-react';

/**
 * 5 New Year Traditions & Auspicious Silver Keepsakes
 */
export const NEW_YEAR_TRADITIONS = [
  {
    id: 1,
    title: 'Midnight Toast & Fresh Beginnings',
    subtitle: 'Cheers to Health, Love & Abundance',
    timeDesc: 'Midnight 12:00 • The Golden Hour',
    significance: 'As the countdown clock strikes twelve, glasses are raised to toast the adventures, joys, and triumphs ahead. Celebrating with precious silver elevates every milestone into an enduring memory.',
    recommendedSilver: 'Pure 925 Sterling Silver Champagne Flutes, Wine Goblets & Engraved Coaster Sets',
    icon: '🥂',
    accentColor: 'from-amber-600 to-yellow-600'
  },
  {
    id: 2,
    title: 'Pehli Shagun • First Purchase of the Year',
    subtitle: 'Inviting Prosperity with 999 Bullion',
    timeDesc: 'Day 1 • Auspicious New Year Day',
    significance: 'In Indian tradition, purchasing pure silver on the first day of the year brings continuous financial flow, positive energy, and peace into the home and business.',
    recommendedSilver: 'Pure 999 Fine Silver New Year 2027 Ingot Bars & Auspicious Lakshmi Ganesh Bullion',
    icon: '🪙',
    accentColor: 'from-yellow-600 to-amber-700'
  },
  {
    id: 3,
    title: 'Daily Elegance & Style Resolutions',
    subtitle: 'Elevating Everyday Moments with Pure Silver',
    timeDesc: 'Self-Love & Daily Adornment',
    significance: 'Starting the year with refined self-expression. Hypoallergenic, tarnish-resistant sterling silver jewellery that seamlessly transitions from boardroom meetings to celebratory dinners.',
    recommendedSilver: 'Minimalist 925 Silver Chokers, Solitaire Studs, Tennis Bracelets & Stackable Rings',
    icon: '✨',
    accentColor: 'from-slate-700 to-indigo-700'
  },
  {
    id: 4,
    title: 'Gratitude & Corporate Gifting',
    subtitle: 'Honoring Partnerships & Family Bonds',
    timeDesc: 'Season of Renewal & Goodwill',
    significance: 'Expressing heartfelt appreciation to esteemed mentors, valued partners, and dear family members with bespoke silver keepsakes that appreciate in sentiment year after year.',
    recommendedSilver: 'Handcrafted Silver Ballpoint Pens, Monogrammed Card Holders & Silver Photo Frames',
    icon: '🎁',
    accentColor: 'from-rose-600 to-pink-700'
  },
  {
    id: 5,
    title: 'Good Fortune & Protection Talismans',
    subtitle: 'Manifesting Success & Warding Negativity',
    timeDesc: 'Year-Round Auspicious Energy',
    significance: 'Wearing sacred protective emblems like the Evil Eye, Four-Leaf Clover, and Zodiac constellations crafted in sterling silver to attract luck, serenity, and joy throughout the year.',
    recommendedSilver: 'Sterling Silver Evil Eye Bracelets, Four-Leaf Clover Pendants & Zodiac Charms',
    icon: '🍀',
    accentColor: 'from-emerald-600 to-teal-700'
  }
];

export default function NewYearModal({ isOpen, onClose, onNavigateToFestival }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!isOpen) return null;

  const currentItem = NEW_YEAR_TRADITIONS[selectedIdx] || NEW_YEAR_TRADITIONS[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Festive Header Banner */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 text-white overflow-hidden shrink-0">
          {/* Subtle Ambient Confetti Pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none text-4xl flex justify-around items-center">
            <span>🥂</span>
            <span>✨</span>
            <span>🎉</span>
            <span>⭐</span>
            <span>🍾</span>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl sm:text-4xl">🥂</span>
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-wide flex items-center space-x-2">
                  <span>Happy New Year 2027 Celebration</span>
                </h3>
                <p className="text-xs sm:text-sm text-amber-100 font-medium">
                  Fresh Beginnings • Pure 925 Sterling Silver Keepsakes &amp; Gifting Guide
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
        <div className="p-3 bg-amber-50/70 dark:bg-slate-800/80 border-b border-amber-100 dark:border-slate-800 flex space-x-2 overflow-x-auto no-scrollbar shrink-0">
          {NEW_YEAR_TRADITIONS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedIdx === idx
                  ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white shadow-md scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-amber-100/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.title.split('•')[0]}</span>
            </button>
          ))}
        </div>

        {/* Selected Tradition Detail Card */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
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
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Significance &amp; Celebration</span>
            </h5>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentItem.significance}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 flex items-start space-x-3">
            <Heart className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
                Curated New Year Silver Keepsakes
              </h5>
              <p className="text-xs sm:text-sm font-semibold text-amber-950 dark:text-amber-200">
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
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-slate-950 text-xs sm:text-sm font-black px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore New Year Silver</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
