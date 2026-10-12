import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, ShoppingBag, Heart } from 'lucide-react';

/**
 * 5 Sacred Ganeshotsav Traditions & Silver Offerings
 */
export const GANESHA_TRADITIONS = [
  {
    id: 1,
    title: 'Murti Sthapana & Pranpratishtha',
    subtitle: 'Welcoming Vighnaharta into Your Home',
    dayDesc: 'Bhadrapada Shukla Chaturthi',
    significance: 'With joyous chants of "Ganpati Bappa Morya", devotees welcome Lord Ganesha into their homes and mandirs, invoking his presence with holy Vedic mantras to dissolve all obstacles and sorrow.',
    recommendedSilver: 'Pure 925 Sterling Silver Ganesha Murti Idols (Lalbaugcha Raja & Dagadusheth forms)',
    icon: '🐘',
    accentColor: 'from-amber-600 to-yellow-600'
  },
  {
    id: 2,
    title: '21 Sacred Durva Grass & Jaswand Offering',
    subtitle: 'Beloved Offerings to Vinayaka',
    dayDesc: 'Daily Shodashopachara Pooja',
    significance: 'Offering 21 fresh shoots of green Durva grass and sacred red Hibiscus (Jaswand) flowers to Bappa. According to legend, Durva cooled the burning heat within Ganesha after defeating demon Analasura.',
    recommendedSilver: 'Handcrafted 925 Silver Durva Grass Bundles & Sterling Silver Hibiscus Blossom',
    icon: '🌺',
    accentColor: 'from-red-600 to-rose-700'
  },
  {
    id: 3,
    title: '21 Modak Maha-Bhog Offering',
    subtitle: 'The Sweetness of Wisdom & Bliss',
    dayDesc: 'Naivedya & Prasad Offering',
    significance: 'Steamed Ukadiche Modaks made with fresh coconut and jaggery are offered to Modakpriya Ganesha, representing the sweet spiritual fruit of wisdom, supreme knowledge, and self-realization.',
    recommendedSilver: 'Pure 999 Fine Silver Modak Keepsakes, Silver Prasad Bowls & Modak Boxes',
    icon: '🥟',
    accentColor: 'from-yellow-600 to-amber-700'
  },
  {
    id: 4,
    title: 'Grand Evening Ganesha Maha Aarti',
    subtitle: 'Joyful Rhythms of Dhol, Shankh & Bells',
    dayDesc: 'Evening Sandhya Aarti',
    significance: 'Families and communities unite singing "Sukh Karta Dukh Harta" accompanied by conch blasts, cymbals, and camphor flame, filling the atmosphere with uplifting divine energy.',
    recommendedSilver: 'Sterling Silver 5-Wick Panchaarti Deepam, Agarbatti Stand & Ghanta Chime',
    icon: '🪔',
    accentColor: 'from-orange-600 to-red-600'
  },
  {
    id: 5,
    title: 'Anant Chaturdashi Visarjan & Eternal Grace',
    subtitle: 'Pudhchya Varshi Lavkar Ya',
    dayDesc: 'Anant Chaturdashi • Final Day',
    significance: 'Devotees bid an emotional farewell to Bappa with prayers for his return next year. The holy blessings of Vighnaharta stay forever in the home through eternal silver keepsakes.',
    recommendedSilver: 'Pure 999 Silver Ganesha Bullion Bars, Lucky Coin Pendants & Keepsake Frames',
    icon: '🌟',
    accentColor: 'from-purple-700 to-amber-600'
  }
];

export default function GaneshChaturthiModal({ isOpen, onClose, onNavigateToFestival }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!isOpen) return null;

  const currentItem = GANESHA_TRADITIONS[selectedIdx] || GANESHA_TRADITIONS[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Festive Header Banner */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-amber-700 via-orange-600 to-red-700 text-white overflow-hidden shrink-0">
          {/* Subtle Ambient Icon Pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none text-4xl flex justify-around items-center">
            <span>🐘</span>
            <span>🥟</span>
            <span>🌺</span>
            <span>🪔</span>
            <span>✨</span>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl sm:text-4xl">🐘</span>
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-wide flex items-center space-x-2">
                  <span>Shubh Ganesh Chaturthi Mahotsav</span>
                </h3>
                <p className="text-xs sm:text-sm text-amber-100 font-medium">
                  Ganpati Bappa Morya • Pure 925 Sterling Silver Idols &amp; Modak Offerings
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
          {GANESHA_TRADITIONS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedIdx === idx
                  ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-md scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-amber-100/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.title.split('&')[0]}</span>
            </button>
          ))}
        </div>

        {/* Selected Tradition Detail Card */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {currentItem.dayDesc}
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
              <span>Sacred Significance</span>
            </h5>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentItem.significance}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 flex items-start space-x-3">
            <Heart className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
                Auspicious Silver Keepsakes
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
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Ganesha Silver</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
