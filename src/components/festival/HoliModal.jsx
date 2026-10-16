import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, ShoppingBag, Shield, Award, Heart } from 'lucide-react';

/**
 * 5 Sacred Holi Traditions & Auspicious Pure Silver Keepsakes
 */
export const HOLI_TRADITIONS = [
  {
    id: 1,
    title: 'Holika Dahan • The Sacred Bonfire',
    subtitle: 'Celebrating the Triumph of Devotion & Good over Evil',
    timeDesc: 'Chhoti Holi Evening • Sacred Pradakshina & Burning of Negativity',
    significance: 'On the eve of Holi, communities gather around the sacred bonfire to celebrate the divine salvation of young Bhakt Prahlad and the vanquishing of Holika. The sacred fire purifies the atmosphere, burns away past grudges, and welcomes the renewal of springtime.',
    recommendedSilver: 'Pure 999 Fine Silver Agni Pooja Diyas, Handcrafted Silver Coconut Keepsakes & Protective Silver Yantras',
    icon: '🔥',
    accentColor: 'from-amber-600 via-orange-600 to-red-700'
  },
  {
    id: 2,
    title: 'Rangwali Holi & The Divine Love of Radha-Krishna',
    subtitle: 'Braj Ki Lathmar & Phoolon Ki Holi • Colors of Pure Devotion',
    timeDesc: 'Rangwali Morning • Smearing Gulal & Spreading Joyous Colors',
    significance: 'In Vrindavan and Mathura, Lord Krishna and Radha Rani immortalized Holi with fragrant flower petals and natural gulal. Playing with colors symbolizes erasing all boundaries of status and creed, uniting everyone in unconditional love and divine joy.',
    recommendedSilver: 'Handcrafted 925 Sterling Silver Pichkari Sets, Antique Silver Gulal Katoris & Radha-Krishna Silver Pendants',
    icon: '🎨',
    accentColor: 'from-pink-600 via-fuchsia-600 to-purple-700'
  },
  {
    id: 3,
    title: 'Mawa Gujiya with Edible Pure Silver Vark',
    subtitle: 'The Signature Sweet of Holi Adorned with Chandi Ka Vark',
    timeDesc: 'Festive Feast • "Mithaas of Mawa, Cardamom & Pure Silver"',
    significance: 'Crisp golden crescent pastry shells stuffed with rich mawa (khoya), roasted dry fruits, and fragrant cardamom, finished with shimmering pure edible silver foil (Chandi Ka Vark). Gujiyas represent prosperity, familial sweetness, and joyous hospitality.',
    recommendedSilver: 'Pure 925 Sterling Silver Gujiya Platters, Engraved Silver Sweet Boxes & Traditional Silver Serving Trays',
    icon: '🥟',
    accentColor: 'from-yellow-600 via-amber-600 to-orange-700'
  },
  {
    id: 4,
    title: 'Kesari Thandai & Spring Blossom Celebrations',
    subtitle: 'The Saffron-Infused Elixir of Health, Vitality & Refreshment',
    timeDesc: 'Afternoon Refreshment • Rose Petals, Almonds & Saffron Milk',
    significance: 'Traditional Holi thandai is brewed with crushed almonds, fennel seeds, melon seeds, black pepper, and fragrant Kashmiri saffron. Drinking from pure silver vessels naturally cools and purifies the drink according to ancient Ayurvedic principles.',
    recommendedSilver: 'Handcrafted Pure Silver Thandai Glasses, Antique Silver Lota Goblets & Pure Silver Straws',
    icon: '🥛',
    accentColor: 'from-emerald-600 via-teal-600 to-cyan-700'
  },
  {
    id: 5,
    title: 'Holi Milan & Saubhagya Shagun Gifting',
    subtitle: 'Embracing Loved Ones & Exchanging Auspicious Keepsakes',
    timeDesc: 'Evening Gatherings • Applying Abir Tilak to Elders for Blessings',
    significance: 'As evening falls on Holi, families dress in fresh white attire to visit elders and relatives for Holi Milan. Gifting pure silver on this vibrant day invokes the cooling, purifying blessings of the moon and brings lifelong abundance.',
    recommendedSilver: 'Pure 999 Fine Silver Holi Color Shagun Coins, Lakshmi-Ganesh Silver Medallions & Silver Keepsake Bars',
    icon: '🪙',
    accentColor: 'from-rose-600 via-pink-600 to-amber-600'
  }
];

export default function HoliModal({
  isOpen,
  onClose,
  onNavigateToFestival
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!isOpen) return null;

  const currentItem = HOLI_TRADITIONS[selectedIdx] || HOLI_TRADITIONS[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-500/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Festive Header Banner with Holi Colors Gradients */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-pink-600 via-purple-700 to-amber-600 text-white overflow-hidden shrink-0">
          {/* Subtle Ambient Icons Pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none text-4xl flex justify-around items-center">
            <span>🎨</span>
            <span>🌈</span>
            <span>🥟</span>
            <span>🥛</span>
            <span>🪙</span>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl sm:text-4xl">🎨</span>
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-wide flex items-center space-x-2">
                  <span>Holi Colors Mahotsav</span>
                </h3>
                <p className="text-xs sm:text-sm text-pink-200 font-medium">
                  Rangwali Holi • Pure 925 Sterling Silver Keepsakes &amp; Gifting Guide
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

        {/* Modal Body: Navigation Tabs + Detailed Information */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* 5 Traditions Horizontal Selector */}
          <div>
            <p className="text-xs uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>5 Traditions of Holi &amp; Auspicious Gifting</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {HOLI_TRADITIONS.map((item, idx) => {
                const isActive = selectedIdx === idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedIdx(idx)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-center sm:items-start space-y-1 ${
                      isActive
                        ? 'bg-gradient-to-br from-pink-50 to-amber-50 dark:from-slate-800 dark:to-slate-800/80 border-pink-500 shadow-sm ring-1 ring-pink-400'
                        : 'border-slate-200 dark:border-slate-800 hover:border-pink-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span
                      className={`text-[11px] font-bold leading-tight line-clamp-2 ${
                        isActive
                          ? 'text-pink-950 dark:text-pink-300'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.title.split('•')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tradition Detail Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-pink-50/60 via-white to-amber-50/60 dark:from-slate-800/60 dark:via-slate-850 dark:to-slate-800/60 border border-pink-200 dark:border-slate-750 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{currentItem.icon}</span>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                    {currentItem.title}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-pink-600 dark:text-pink-400 mt-0.5">
                  {currentItem.subtitle}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {currentItem.timeDesc}
                </p>
              </div>
            </div>

            {/* Significance */}
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-200 mb-1 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                <span>Festive &amp; Spiritual Significance:</span>
              </p>
              <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentItem.significance}
              </p>
            </div>

            {/* Pure Silver Gifting Recommendation */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-pink-300/60 dark:border-pink-500/30">
              <p className="text-[11px] font-black uppercase tracking-wider text-pink-800 dark:text-pink-400 flex items-center space-x-1.5 mb-1">
                <Award className="w-3.5 h-3.5" />
                <span>Silver House Auspicious Recommendation:</span>
              </p>
              <p className="text-xs sm:text-[13px] font-medium text-slate-800 dark:text-slate-200">
                {currentItem.recommendedSilver}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer with Call-To-Action */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="font-semibold">Pure 925 Sterling &amp; 999 Fine Silver • BIS Hallmarked</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onNavigateToFestival) {
                  onNavigateToFestival('holi');
                }
              }}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Explore Holi Silver Collection</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
