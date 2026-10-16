import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, ShoppingBag, Shield, Award, Flag } from 'lucide-react';

/**
 * 5 National Heritage Traditions & Auspicious Pure Silver Keepsakes
 * Unified for Republic Day & Independence Day Celebration
 */
export const PATRIOTIC_TRADITIONS = [
  {
    id: 1,
    title: 'The Glorious Tiranga & 24-Spoke Ashoka Chakra',
    subtitle: 'Sovereign Constitution & Eternal Progress of Dharma',
    timeDesc: 'National Days • Saffron, White, Emerald Green & Navy Dharma Chakra',
    significance: 'Our beloved National Flag embodies the eternal soul of India: Saffron for courage and sacrifice, White for peace and truth, Green for agricultural prosperity, and the 24-spoke Navy Blue Ashoka Chakra for continuous righteous progress.',
    recommendedSilver: 'Pure 999 Fine Silver Ashoka Chakra Medallions, Enameled Tiranga Bars & 925 Silver Flag Stands',
    icon: '🇮🇳',
    accentColor: 'from-orange-600 via-sky-600 to-emerald-700'
  },
  {
    id: 2,
    title: 'Amar Jawan Jyoti & Tribute to Freedom Warriors',
    subtitle: 'Eternal Flame Saluting the Immortal Defenders of India',
    timeDesc: 'National War Memorial • Solemn Wreath Laying & 21-Gun Salute',
    significance: 'The eternal flame honors the supreme sacrifices of our brave armed forces and freedom heroes who secured and defend our sovereign liberty across land, sky, and sea.',
    recommendedSilver: 'Hallmark 999 Silver Commemorative Coins, Silver Armed Forces Keepsakes & Bravery Pendants',
    icon: '🪖',
    accentColor: 'from-amber-600 to-orange-700'
  },
  {
    id: 3,
    title: 'Historic Red Fort & National Unity in Diversity',
    subtitle: 'Lal Qila Ramparts • 28 States & 8 Union Territories United as One',
    timeDesc: 'Swatantrata Diwas & Republic Celebrations Across the Nation',
    significance: 'From the historic ramparts of Red Fort to the grand cultural tableaux of Kartavya Path, India celebrates its rich tapestry of languages, traditions, and collective democratic strength.',
    recommendedSilver: 'Pure Silver Lakshmi-Ganesh National Shagun Coins, Silver Aarti Thalis & Traditional Temple Keepsakes',
    icon: '🏰',
    accentColor: 'from-orange-600 to-red-700'
  },
  {
    id: 4,
    title: 'Sacred Lotus (Kamal) & Soaring Peace Doves',
    subtitle: 'National Flower of India • Peace, Divinity & Global Brotherhood',
    timeDesc: 'National Symbols • Purity Rising Above Water & Freedom in the Sky',
    significance: 'The sacred Lotus represents spiritual purity and resilience, blossoming above muddy waters with immaculate elegance. Paired with peace doves, it symbolizes India’s ancient message of Vasudhaiva Kutumbakam—the world is one family.',
    recommendedSilver: 'Handcrafted 925 Sterling Silver Lotus Pooja Idols, Silver Flying Dove Keepsakes & Floral Silver Jewelry',
    icon: '🪷',
    accentColor: 'from-pink-600 to-rose-700'
  },
  {
    id: 5,
    title: 'Viksit Bharat • Sovereign Prosperity & Pure Silver Gifting',
    subtitle: 'Investing in Eternal Value & Auspicious Hallmarked Purity',
    timeDesc: 'National Celebration Gifting • Enduring Heritage for Future Generations',
    significance: 'Gifting pure silver on National Days represents pure intentions, economic self-reliance, and auspicious blessings for the nation’s golden future. Silver is an enduring store of wealth and beauty.',
    recommendedSilver: 'Pure 999 Fine Silver 10g & 50g Investment Bars, Sovereign Swatantrata Coins & Silver Keepsakes',
    icon: '🪙',
    accentColor: 'from-emerald-600 to-teal-700'
  }
];

export default function PatrioticFestivalModal({
  isOpen,
  onClose,
  onNavigateToFestival
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!isOpen) return null;

  const currentItem = PATRIOTIC_TRADITIONS[selectedIdx] || PATRIOTIC_TRADITIONS[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-orange-500/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Festive Header Banner with Indian Tricolor Gradients */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-orange-700 via-slate-900 to-emerald-800 text-white overflow-hidden shrink-0">
          {/* Subtle Ambient Icons Pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none text-4xl flex justify-around items-center">
            <span>🇮🇳</span>
            <span>🪷</span>
            <span>🕊️</span>
            <span>🏰</span>
            <span>🪙</span>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl sm:text-4xl">🇮🇳</span>
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-wide flex items-center space-x-2">
                  <span>Republic &amp; Independence Day</span>
                </h3>
                <p className="text-xs sm:text-sm text-amber-200 font-medium">
                  National Pride • Pure 999 Fine Silver Keepsakes &amp; Gifting Guide
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
              <Flag className="w-3.5 h-3.5 text-orange-500" />
              <span>5 Pillars of the Nation &amp; Heritage</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PATRIOTIC_TRADITIONS.map((item, idx) => {
                const isActive = selectedIdx === idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedIdx(idx)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-center sm:items-start space-y-1 ${
                      isActive
                        ? 'bg-gradient-to-br from-orange-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800/80 border-orange-500 shadow-sm ring-1 ring-orange-400'
                        : 'border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span
                      className={`text-[11px] font-bold leading-tight line-clamp-2 ${
                        isActive
                          ? 'text-orange-950 dark:text-orange-300'
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
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-orange-50/60 via-white to-emerald-50/60 dark:from-slate-800/60 dark:via-slate-850 dark:to-slate-800/60 border border-orange-200 dark:border-slate-750 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{currentItem.icon}</span>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                    {currentItem.title}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400 mt-0.5">
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
                <Shield className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Patriotic &amp; Cultural Significance:</span>
              </p>
              <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentItem.significance}
              </p>
            </div>

            {/* Pure Silver Gifting Recommendation */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300/60 dark:border-emerald-500/30">
              <p className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center space-x-1.5 mb-1">
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
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">999 Fine Silver • BIS Hallmarked Purity</span>
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
                  onNavigateToFestival('patriotic');
                }
              }}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600 hover:from-orange-500 hover:to-emerald-500 text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Explore Patriotic Silver Coins</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
