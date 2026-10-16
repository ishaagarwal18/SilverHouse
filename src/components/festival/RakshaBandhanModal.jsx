import React from 'react';
import { X, Sparkles, Heart, Shield, Gift, ArrowRight } from 'lucide-react';

/**
 * RakshaBandhanModal - The Sacred Traditions of Raksha Bandhan & Pure Silver Keepsakes
 */
export default function RakshaBandhanModal({ isOpen, onClose, onNavigateToFestival }) {
  if (!isOpen) return null;

  const RAKHI_TRADITIONS = [
    {
      step: '01',
      title: 'Auspicious Tilak & Akshat',
      hindi: 'शुभ तिलक और अक्षत',
      desc: 'The sister applies sacred Roli (Kumkum) and unbroken rice (Akshat) to the brother’s forehead, chanting ancient Vedic mantras for his longevity, health, and spiritual victory.',
      silverKeepsake: 'Pure 925 Silver Roli-Chawal Katori with delicate peacocks',
      icon: '✨',
      color: 'from-red-600 to-rose-700'
    },
    {
      step: '02',
      title: 'Tying the Sacred Silver Rakhi',
      hindi: 'पवित्र चांदी की राखी (रक्षा सूत्र)',
      desc: 'The sister ties the consecrated Raksha Sutra around her brother’s right wrist. Pure 925 sterling silver rakhis symbolize an untarnishable, everlasting shield of love and protection.',
      silverKeepsake: 'Artisan Handcrafted 925 Sterling Silver Floral & Om Rakhis',
      icon: '🎀',
      color: 'from-rose-600 to-amber-600'
    },
    {
      step: '03',
      title: 'Sweetening with Kaju Katli & Chandi Vark',
      hindi: 'मिठाई और शुद्ध चांदी का वर्क',
      desc: 'Sweetening the sacred moment with delectable sweets, traditionally garnished with 100% vegetarian, pure edible Silver Vark as a mark of royal Indian hospitality.',
      silverKeepsake: 'Heritage Pure Silver Mithai Platter & Diya Stand',
      icon: '🍬',
      color: 'from-amber-600 to-yellow-600'
    },
    {
      step: '04',
      title: 'The Rakhi Shagun & Sibling Keepsakes',
      hindi: 'राखी का शगुन और उपहार',
      desc: 'The brother presents auspicious Shagun tokens — pure silver coins, personalized silver currency notes, and precious silver jewellery as timeless lifelong investments.',
      silverKeepsake: 'Hallmarked 999 Fine Silver Shagun Coins & Custom Silver Bars',
      icon: '🪙',
      color: 'from-yellow-600 to-amber-700'
    },
    {
      step: '05',
      title: 'The Eternal Vow of Protection',
      hindi: 'सदा रक्षा का पवित्र संकल्प',
      desc: 'The sacred brotherly oath to stand by his sister through every chapter of life with unwavering care, honor, and enduring love that transcends all distances.',
      silverKeepsake: 'Engraved 925 Silver Sibling Bond Bands & Pendants',
      icon: '🛡️',
      color: 'from-red-700 to-rose-800'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 select-none">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-slate-900 via-rose-950/90 to-slate-950 border border-rose-500/40 text-slate-100 shadow-2xl p-5 sm:p-7">
        {/* Soft Background Radial Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-rose-900/60 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-white transition-all cursor-pointer z-10"
          aria-label="Close Raksha Bandhan Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-black tracking-widest uppercase mb-2">
            <Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Sacred Bond of Sibling Love</span>
            <Shield className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Raksha Bandhan Mahotsav
          </h2>
          <p className="text-xs sm:text-sm text-rose-200/80 mt-1 max-w-md mx-auto">
            The Eternal Thread of Love, Lifelong Protection & Pure 925 Sterling Silver Keepsakes
          </p>
        </div>

        {/* 5 Traditions of Raksha Bandhan */}
        <div className="space-y-3 mb-6">
          {RAKHI_TRADITIONS.map((t) => (
            <div
              key={t.step}
              className="relative p-3.5 sm:p-4 rounded-2xl bg-slate-800/60 border border-rose-500/20 hover:border-rose-400/50 transition-all group"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-lg shrink-0 shadow-md border border-white/20`}
                >
                  {t.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                      {t.title}
                    </h3>
                    <span className="text-[10px] font-black tracking-wider text-rose-400/80 uppercase">
                      {t.step}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-300/90 font-medium mb-1">
                    {t.hindi}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t.desc}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-rose-300 font-semibold bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-500/20">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Silver House Keepsake: {t.silverKeepsake}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Footer */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-red-950/80 to-amber-950/80 border border-rose-500/40 text-center">
          <p className="text-xs sm:text-sm font-bold text-rose-100 mb-2.5">
            🎁 Gift your brother or sister an auspicious, lifelong bond with 925 Pure Silver Rakhis & Shagun Coins
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onNavigateToFestival) {
                onNavigateToFestival('rakhi');
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs sm:text-sm font-black tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span>Explore Pure Silver Rakhi Collection</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
