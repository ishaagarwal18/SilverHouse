import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, ShoppingBag, Sun, Wind } from 'lucide-react';

/**
 * 5 Uttarayan & Makar Sankranti Traditions & Auspicious Silver Keepsakes
 */
export const UTTARAYAN_TRADITIONS = [
  {
    id: 1,
    title: 'The Soaring Sky • Patangbazi (Kite Flying)',
    subtitle: 'Reaching for Boundless Heights of Success & Freedom',
    timeDesc: 'Terrace Celebrations • Daylong Kite Battles & Kai Po Che',
    significance: 'As thousands of colorful kites ascend into the crisp winter sky, Uttarayan celebrates human aspiration, community joy, and harmony. Flying kites also encourages absorbing healthy morning vitamin D from the gentle winter sun.',
    recommendedSilver: 'Handcrafted 925 Sterling Silver Miniature Kites, Silver Firki Spool Keepsakes & Flying Bird Pendants',
    icon: '🪁',
    accentColor: 'from-orange-600 to-amber-700'
  },
  {
    id: 2,
    title: 'Surya Dev Arghya & Uttarayan Snan',
    subtitle: 'Welcoming the Sun God as Surya Enters Makar Rashi',
    timeDesc: 'Dawn • Auspicious Transition of the Sun to Northern Hemisphere',
    significance: 'Makar Sankranti marks the start of Uttarayan, the auspicious six-month period of the Sun travelling northwards. Offering water to Surya Dev brings vitality, wisdom, good health, and clears obstacles.',
    recommendedSilver: 'Pure 999 Fine Silver Surya Yantras, Handcrafted Silver Sun Pendants & Sacred Silver Arghya Kalash',
    icon: '☀️',
    accentColor: 'from-yellow-600 to-amber-700'
  },
  {
    id: 3,
    title: 'Til-Gud Harmony • "God-God Bola"',
    subtitle: 'Exchanging Sesame & Jaggery for Lifelong Warmth & Sweetness',
    timeDesc: 'Prasad Distribution • "Til-Gud Ghya, God-God Bola"',
    significance: 'Sesame seeds provide vital winter nourishment, while jaggery represents unreserved sweetness. Exchanging til-gud is a cherished reminder to resolve past bitterness and speak kind, affectionate words all year.',
    recommendedSilver: 'Pure 925 Sterling Silver Prasad Bowls, Engraved Silver Serving Spoons & Silver Dry-Fruit Boxes',
    icon: '🍯',
    accentColor: 'from-amber-700 to-orange-800'
  },
  {
    id: 4,
    title: 'Punya Kaal Daan • Auspicious Charity',
    subtitle: 'The Sacred Harvest Blessing of Boundless Good Karma',
    timeDesc: 'Punya Kaal Muhurat • Generosity that Multiplies Tenfold',
    significance: 'Donating during Makar Sankranti brings profound spiritual blessings. Gifting pure silver—the purest and coolest lunar metal—is considered the supreme form of daan for peace and abundance.',
    recommendedSilver: 'Pure 999 Fine Silver Makar Sankranti Bullion Coins, Silver Tulsi Leaf Talismans & Kamdhenu Cow Murtis',
    icon: '🪙',
    accentColor: 'from-yellow-600 to-orange-700'
  },
  {
    id: 5,
    title: 'Haldi-Kumkum & Saubhagya Gifting',
    subtitle: 'Celebrating Sisterhood, Womanhood & Marital Harmony',
    timeDesc: 'Sankranti to Rathsaptami • Women Gathering for Blessings',
    significance: 'Married women gather for Haldi-Kumkum ceremonies, exchanging auspicious sugarcane, sesame treats, and keepsake vanity gifts to invoke divine feminine protection, long life, and marital prosperity.',
    recommendedSilver: 'Handcrafted Silver Haldi-Kumkum Dani, Pure Silver Toe Rings (Bichhiya) & Traditional Silver Payal Anklets',
    icon: '🌾',
    accentColor: 'from-red-600 to-pink-700'
  }
];

export default function UttarayanModal({ isOpen, onClose, onNavigateToFestival }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!isOpen) return null;

  const currentItem = UTTARAYAN_TRADITIONS[selectedIdx] || UTTARAYAN_TRADITIONS[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Festive Header Banner */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-amber-800 to-orange-950 text-white overflow-hidden shrink-0">
          {/* Subtle Ambient Kite & Sun Pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none text-4xl flex justify-around items-center">
            <span>🪁</span>
            <span>☀️</span>
            <span>🌾</span>
            <span>🍯</span>
            <span>🪙</span>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl sm:text-4xl">🪁</span>
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-wide flex items-center space-x-2">
                  <span>Uttarayan &amp; Makar Sankranti</span>
                </h3>
                <p className="text-xs sm:text-sm text-amber-200 font-medium">
                  Kai Po Che • Pure 925 Sterling Silver Keepsakes &amp; Gifting Guide
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
          {UTTARAYAN_TRADITIONS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedIdx === idx
                  ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white shadow-md scale-105'
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

          <div className="bg-amber-50/60 dark:bg-slate-800/50 p-4 rounded-2xl border border-amber-200 dark:border-slate-700">
            <h5 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1.5 flex items-center space-x-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>Festive Significance</span>
            </h5>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentItem.significance}
            </p>
          </div>

          <div className="bg-orange-50/60 dark:bg-slate-800/50 p-4 rounded-2xl border border-orange-200 dark:border-slate-700">
            <h5 className="text-xs font-black uppercase tracking-wider text-orange-800 dark:text-orange-300 mb-1.5 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
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
            <span>Hallmarked 925 Sterling Silver • Express Makar Sankranti Delivery Across India</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onNavigateToFestival) {
                onNavigateToFestival('uttarayan');
              }
            }}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-bold text-sm px-6 py-2.5 rounded-2xl shadow-lg shadow-orange-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Uttarayan Collection</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
