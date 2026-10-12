import React, { useState, useEffect } from 'react';
import { Sparkles, X, Flame, Music, Volume2, VolumeX, ChevronRight, Award, Heart, ShoppingBag } from 'lucide-react';
import { NAVRATRI_DAYS } from './NavratriFestivalDecor';

/**
 * NavratriGarboModal - Interactive Navratri Garba Mahotsav Showcase Modal
 * Triggered by clicking the Navratri Garbo pill widget or Dandiya icon.
 */
export default function NavratriGarboModal({ isOpen, onClose, onNavigateToFestival }) {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [isDiyaLit, setIsDiyaLit] = useState(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [audioCtx, setAudioCtx] = useState(null);

  // Clean up audio context when modal unmounts
  useEffect(() => {
    return () => {
      if (audioCtx) {
        audioCtx.close().catch(() => { });
      }
    };
  }, [audioCtx]);

  if (!isOpen) return null;

  const currentDay = NAVRATRI_DAYS[selectedDayIdx] || NAVRATRI_DAYS[0];

  // Synthesize rhythmic Garba Dandiya beats sound via Web Audio API
  const toggleGarbaAudio = () => {
    if (isPlayingMusic) {
      if (audioCtx) audioCtx.suspend();
      setIsPlayingMusic(false);
    } else {
      try {
        const ctx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        setAudioCtx(ctx);
        setIsPlayingMusic(true);

        // Play a pleasant rhythmic Garba chime sequence
        const now = ctx.currentTime;
        [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75].forEach((delay, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(idx % 2 === 0 ? 523.25 : 659.25, now + delay); // C5 / E5 notes
          gain.gain.setValueAtTime(0.15, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.22);
        });

        setTimeout(() => setIsPlayingMusic(false), 2500);
      } catch (err) {
        console.warn('Audio synthesis warning:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200 select-none overflow-y-auto custom-scrollbar">
      {/* Backdrop Click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Modal Card */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-[0_30px_90px_rgba(217,119,6,0.3)] border border-amber-500/40 overflow-hidden z-10 text-slate-800 dark:text-slate-100 my-auto">

        {/* Opulent Top Header Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-600 via-red-500 via-yellow-400 to-amber-600" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-amber-500/15 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center space-x-3">
            {/* Garbo Icon */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Flame className={`w-6 h-6 ${isDiyaLit ? 'text-amber-500 animate-bounce' : 'text-slate-400'}`} />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Navratri Garbo Mahotsav
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest">
                  Live Festival
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Divine Light, Garba Beats & 9 Sacred Colors of Goddess Durga
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">

          {/* SECTION 1: INTERACTIVE GARBO DIYA & MUSIC CONTROLLER */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-red-500/10 to-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setIsDiyaLit(!isDiyaLit)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md border ${isDiyaLit
                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-white border-yellow-300 shadow-amber-500/30 scale-105'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-300'
                  }`}
                title="Click to toggle Garbo Diya Light"
              >
                <Flame className={`w-8 h-8 ${isDiyaLit ? 'animate-pulse' : ''}`} />
              </button>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <span>Akhand Garbo Light</span>
                  {isDiyaLit && <span className="text-[10px] text-amber-600 font-bold bg-amber-100 px-2 py-0.5 rounded-full">Auspicious Diya Lit</span>}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tap to light the sacred earthen Garbo pot for prosperity & happiness.
                </p>
              </div>
            </div>

            {/* Garba Beats Synthesizer Button */}
            <button
              type="button"
              onClick={toggleGarbaAudio}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-md border ${isPlayingMusic
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-amber-300 animate-pulse'
                  : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-50'
                }`}
            >
              {isPlayingMusic ? <Volume2 className="w-4 h-4 text-yellow-200" /> : <Music className="w-4 h-4" />}
              <span>{isPlayingMusic ? 'Playing Garba Chime…' : 'Play Garba Beats'}</span>
            </button>
          </div>

          {/* SECTION 2: 9 SACRED DAYS & COLORS SELECTOR */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>9 Sacred Colors of Navratri & Jewellery</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                Select Day (Day {currentDay.day} of 9)
              </span>
            </div>

            {/* 9 Days Selector Bar */}
            <div className="grid grid-cols-9 gap-1.5 mb-4">
              {NAVRATRI_DAYS.map((d, idx) => (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${selectedDayIdx === idx
                      ? 'bg-amber-500/20 border-amber-500 shadow-md scale-105 ring-2 ring-amber-400/50'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-75 hover:opacity-100'
                    }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white shadow-xs mb-1"
                    style={{ backgroundColor: d.hex }}
                  />
                  <span className="text-[10px] font-bold">D{d.day}</span>
                </button>
              ))}
            </div>

            {/* Active Day Highlight Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-amber-500/20 relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none"
                style={{ backgroundColor: currentDay.hex }}
              />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white inline-block shadow-xs"
                      style={{ backgroundColor: currentDay.hex }}
                    />
                    <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                      Day {currentDay.day} • {currentDay.colorName}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    {currentDay.goddess} Devotion
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-amber-700 dark:text-amber-300">Significance:</span> {currentDay.significance}
                  </p>

                  <div className="pt-1 flex items-center space-x-2 text-xs text-amber-800 dark:text-amber-200 font-semibold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Recommended Jewellery: {currentDay.jewelry}</span>
                  </div>
                </div>

                {onNavigateToFestival && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToFestival();
                      onClose();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-amber-500/25 transition-all cursor-pointer shrink-0"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Explore Collection</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-amber-500/15 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            ✨ Silver House • Shubh Navratri Festive Collection
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
