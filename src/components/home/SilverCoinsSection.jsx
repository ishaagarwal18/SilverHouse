import React from 'react';
import { Sparkles, ShieldCheck, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SilverCoinsSection({ onNavigateCategory, onNavigateYatraCustomizer }) {
  const HIGHLIGHTS = [
    {
      title: "999 Fine Purity Assay Guarantee",
      desc: "Guaranteed 99.9% fine silver stamped with national hallmark laboratory certification."
    },
    {
      title: "Tamper-Evident Blister Packaging",
      desc: "Hermetically sealed blister certicards protecting coins against oxidation and transit damage."
    },
    {
      title: "Custom Photo & Name Laser Engraving",
      desc: "Memorialize life's greatest blessings with custom family photos & auspicious inscriptions."
    },
    {
      title: "Zero Making Loss Buyback Guarantee",
      desc: "Investment-grade bullion bars with certified buyback value across India."
    }
  ];

  return (
    <section className="py-14 sm:py-16 bg-[var(--th-bg)] border-b border-[var(--th-border)]">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[var(--th-accent)] tracking-[0.25em] uppercase bg-[var(--th-accent)]/15 px-3.5 py-1 rounded-full inline-block mb-3 border border-[var(--th-accent)]/30">
            999 BULLION & COMMEMORATIVE GIFTS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--th-text-main)] tracking-wide">
            SILVER COINS & BARS
          </h2>
          <div className="w-16 h-0.5 bg-[var(--th-accent)] mx-auto mt-2.5 mb-3" />
          <p className="text-xs sm:text-sm text-[var(--th-text-muted)] font-sans">
            Pure 999 fine investment bars, auspicious temple coins, and personalized keepsake tokens.
          </p>
        </div>

        {/* 2-Column Banner Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Large Visual: Personalized Silver Photo Coins & Keepsakes */}
          <div className="lg:col-span-7 relative h-[360px] sm:h-[400px] rounded-3xl overflow-hidden border-2 border-[var(--th-border)] hover:border-[var(--th-accent)] shadow-xl group transition-all duration-500">
            <img
              src="/images/personalized_silver_coin.jpg"
              alt="Personalized Pure 999 Silver Gifts"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

            <div className="absolute inset-x-6 bottom-6 sm:inset-x-8 sm:bottom-8 text-white z-10">
              <span className="bg-[var(--th-primary)] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2 inline-block border border-white/20">
                LIFELONG KEEPSAKE
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-2 text-white leading-snug">
                Personalized 999 Silver Photo Coins & Gifts
              </h3>
              <p className="text-xs sm:text-sm text-white/80 max-w-lg mb-4 font-sans">
                Preserve newborn smiles, wedding vows, and anniversary milestones in pure 999 silver with custom laser photo medallion engravings.
              </p>
              <button
                onClick={() => onNavigateCategory && onNavigateCategory('silver-coins-bars')}
                className="px-6 py-2.5 rounded-full bg-[var(--th-accent)] text-white font-serif text-xs font-bold tracking-widest uppercase hover:brightness-110 transition-all duration-300 inline-flex items-center space-x-2 cursor-pointer shadow-md"
              >
                <span>EXPLORE ALL COINS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Highlights & Investment Features */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="bg-[var(--th-card)] rounded-3xl p-6 sm:p-8 border border-[var(--th-border)] shadow-md hover:border-[var(--th-accent)] transition-all">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--th-text-main)] mb-4">
                Assay Certified Silver Bullion
              </h3>
              
              <div className="space-y-4">
                {HIGHLIGHTS.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3.5">
                    <CheckCircle2 className="w-5 h-5 text-[var(--th-accent)] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[var(--th-text-main)]">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[var(--th-text-muted)] mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--th-border)]/60 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigateCategory && onNavigateCategory('silver-coins-bars')}
                  className="flex-1 py-3 bg-[var(--th-primary)] text-white font-serif text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-[var(--th-primary-hover)] transition-colors text-center cursor-pointer shadow-sm"
                >
                  Buy 999 Bullion
                </button>
                <button
                  onClick={onNavigateYatraCustomizer}
                  className="px-5 py-3 border-2 border-[var(--th-primary)] text-[var(--th-primary)] font-serif text-xs font-bold tracking-wider uppercase rounded-xl hover:bg-[var(--th-surface-alt)] transition-colors cursor-pointer"
                >
                  Custom Photo Gifts
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
