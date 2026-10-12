import React, { useState, useEffect } from 'react';
import { Sparkles, X, Flame, Volume2, VolumeX, ChevronRight, Award, ShoppingBag, Heart } from 'lucide-react';

/**
 * 5 Sacred Days of Diwali (Deepavali Mahaparva)
 */
export const DIWALI_DAYS = [
  {
    day: 1,
    title: 'Dhanteras',
    subtitle: 'Dhantrayodashi • Auspicious Wealth',
    deity: 'Goddess Mahalakshmi & Lord Dhanvantari',
    dateDesc: 'First Day of Deepavali',
    significance: 'Most auspicious day of the year to purchase Pure Silver bullion, coins, and utensils to invite eternal wealth and healing into the home.',
    recommendedSilver: '999 Pure Fine Silver Lakshmi Ganesh Coins & Kamakshi Diyas',
    icon: '🪙',
    accentColor: 'from-amber-600 to-yellow-500'
  },
  {
    day: 2,
    title: 'Kali Chaudas / Choti Diwali',
    subtitle: 'Naraka Chaturdashi • Light Over Darkness',
    deity: 'Lord Krishna & Maa Mahakali',
    dateDesc: 'Second Day of Deepavali',
    significance: 'Celebrates the divine triumph of light, dispelling negativity, fear, and sluggishness with the illumination of 14 sacred earthen and silver lamps.',
    recommendedSilver: 'Oxidised Silver Rudraksha Kadas & Sacred Protective Pendants',
    icon: '🪔',
    accentColor: 'from-orange-600 to-rose-600'
  },
  {
    day: 3,
    title: 'Maha Lakshmi Puja',
    subtitle: 'Deepavali Grand Amavasya',
    deity: 'Goddess Lakshmi, Lord Ganesha & Lord Kubera',
    dateDesc: 'The Grand Night of Diwali',
    significance: 'The pinnacle night of Deepavali. Homes are illuminated with rows of diyas, welcoming the Goddess of supreme wealth, fortune, and spiritual peace.',
    recommendedSilver: 'Royal 925 Sterling Silver Pooja Thali Set & Carved Murti Idols',
    icon: '👑',
    accentColor: 'from-red-600 to-amber-500'
  },
  {
    day: 4,
    title: 'Govardhan Puja & Nutan Varsh',
    subtitle: 'Gujarati Bestu Varas / Annakut',
    deity: 'Lord Krishna & Annakut Mahotsav',
    dateDesc: 'Fourth Day • Auspicious New Year',
    significance: 'Auspicious New Year celebration in Gujarat & Western India, offering 56 sacred delicacies (Chhappan Bhog) in devotion, gratitude, and fresh beginnings.',
    recommendedSilver: 'Silver Kamdhenu Gau-Mata Idol & Pure 999 Bullion Silver Bars',
    icon: '🌾',
    accentColor: 'from-emerald-600 to-teal-700'
  },
  {
    day: 5,
    title: 'Bhai Dooj / Yama Dwitiya',
    subtitle: 'Sacred Bond of Siblings',
    deity: 'Yamraj & Yamuna River',
    dateDesc: 'Fifth Day of Deepavali',
    significance: 'Sisters apply sacred tilak and pray for their brothers’ longevity, celebrated with thoughtful gifting of pure silver keepsakes and auspicious coins.',
    recommendedSilver: 'Fine Silver Signet Rings, Engraved Gift Coins & Sterling Chains',
    icon: '🌸',
    accentColor: 'from-pink-600 to-purple-600'
  }
];

export default function DiwaliFestivalModal({ isOpen, onClose, onNavigateToFestival }) {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCtx, setAudioCtx] = useState(null);

  useEffect(() => {
    return () => {
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
    };
  }, [audioCtx]);

  if (!isOpen) return null;

  const currentDay = DIWALI_DAYS[selectedDayIdx] || DIWALI_DAYS[0];

  // Synthesize rhythmic auspicious Deepavali temple bell & Shankh drone via Web Audio API
  const toggleDiwaliAudio = () => {
    if (isPlayingAudio) {
      if (audioCtx) audioCtx.suspend();
      setIsPlayingAudio(false);
    } else {
      try {
        const ctx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        setAudioCtx(ctx);
        setIsPlayingAudio(true);

        const now = ctx.currentTime;
        // Auspicious pentatonic temple harmony (C5, D5, E5, G5, A5)
        const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.28);
          gain.gain.setValueAtTime(0.18, now + idx * 0.28);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.28 + 0.9);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.28);
          osc.stop(now + idx * 0.28 + 1.0);
        });

        setTimeout(() => setIsPlayingAudio(false), 2800);
      } catch (err) {
        console.warn('Audio synthesis warning:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[var(--th-card)] text-[var(--th-text-main)] rounded-3xl shadow-2xl border-2 border-amber-400/80 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Banner */}
        <div className="relative p-4 sm:p-6 bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 text-white overflow-hidden shrink-0 border-b border-amber-300/40">
          {/* Subtle Decorative Starbursts */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-yellow-300/10 blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white/10 backdrop-blur-md border border-yellow-300/40 flex items-center justify-center text-2xl shadow-inner">
                🪔
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-200 bg-black/25 px-2 py-0.5 rounded-full border border-yellow-300/30">
                    Auspicious Mahaparva
                  </span>
                  <span className="text-[10px] text-yellow-300 font-semibold hidden sm:inline">
                    • 5 Days of Divine Lights
                  </span>
                </div>
                <h2 className="font-serif text-lg sm:text-2xl font-black text-white tracking-wide mt-0.5">
                  Shubh Deepavali Mahotsav
                </h2>
                <p className="text-[11px] sm:text-xs text-amber-100/90 font-medium line-clamp-1">
                  Celebrate Wealth, Light &amp; Pure Silver Puja Traditions with Silver House
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Audio Chime Trigger */}
              <button
                type="button"
                onClick={toggleDiwaliAudio}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer border border-white/20"
                title={isPlayingAudio ? 'Mute Festive Chime' : 'Play Auspicious Chime'}
                aria-label="Toggle Diwali Audio"
              >
                {isPlayingAudio ? <Volume2 className="w-4 h-4 text-yellow-300 animate-pulse" /> : <VolumeX className="w-4 h-4 opacity-80" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* 5 Days of Diwali Horizontal Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--th-text-muted)] flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>The 5 Auspicious Days of Diwali</span>
              </span>
              <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Day {currentDay.day} of 5
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {DIWALI_DAYS.map((d, idx) => {
                const isSelected = idx === selectedDayIdx;
                return (
                  <button
                    key={d.day}
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[64px] ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-400'
                        : 'border-[var(--th-border)] bg-[var(--th-surface-alt)]/60 hover:bg-[var(--th-surface-alt)] hover:border-amber-300'
                    }`}
                  >
                    <span className="text-sm sm:text-base">{d.icon}</span>
                    <span className="text-[10px] sm:text-xs font-bold truncate w-full mt-1 text-[var(--th-text-main)]">
                      {d.title.split('/')[0].trim()}
                    </span>
                    <span className="text-[9px] text-[var(--th-text-muted)] truncate w-full font-medium">
                      Day {d.day}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Selected Day Spotlight Card */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-500/5 via-[var(--th-surface-alt)] to-transparent relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  {currentDay.dateDesc}
                </span>
                <h3 className="font-serif text-base sm:text-xl font-black text-[var(--th-text-main)] mt-1.5">
                  {currentDay.title} • {currentDay.subtitle}
                </h3>
                <p className="text-xs text-amber-800 font-bold mt-0.5">
                  Presiding Divine Energy: {currentDay.deity}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center text-lg shadow-md shrink-0">
                {currentDay.icon}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--th-text-muted)] leading-relaxed mt-2">
              {currentDay.significance}
            </p>

            {/* Sacred Pure Silver Suggestion for this day */}
            <div className="mt-3.5 p-3 rounded-xl bg-[var(--th-card)] border border-amber-200 shadow-2xs flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  Auspicious Silver House Gifting
                </span>
                <p className="text-xs font-bold text-[var(--th-text-main)] truncate">
                  {currentDay.recommendedSilver}
                </p>
              </div>
            </div>
          </div>

          {/* Dhanteras & Diwali Silver Gifting Highlight */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-700 via-amber-800 to-stone-900 text-white shadow-md flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold tracking-widest uppercase text-yellow-300">
                100% Certified 999 &amp; 925 Silver
              </span>
              <p className="text-xs sm:text-sm font-black leading-tight">
                Shubh Dhanteras &amp; Diwali Puja Edit
              </p>
              <p className="text-[11px] text-amber-200 line-clamp-1">
                Kamakshi Diyas • Lakshmi Ganesh Coins • Royal Pooja Thalis
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onNavigateToFestival) onNavigateToFestival();
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-stone-900 rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 transition-all shrink-0 cursor-pointer flex items-center space-x-1"
            >
              <span>Explore</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-3 sm:p-4 bg-[var(--th-surface-alt)]/80 border-t border-[var(--th-border)] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[var(--th-text-muted)] font-semibold flex items-center space-x-1">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>May Lakshmiji Bless Your Household with Eternal Light</span>
          </span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-[var(--th-border)] hover:bg-[var(--th-card)] text-xs font-bold text-[var(--th-text-main)] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onNavigateToFestival) onNavigateToFestival();
              }}
              className="px-4 py-1.5 rounded-xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-yellow-300" />
              <span>Shop Festive Silver</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
