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
    <section className="py-14 sm:py-16 bg-[#EAE2D5] border-b border-[#C5B299]">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#9A650C] tracking-[0.25em] uppercase bg-[#9A650C]/15 px-3.5 py-1 rounded-full inline-block mb-3 border border-[#9A650C]/30">
            999 BULLION & COMMEMORATIVE GIFTS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#071526] tracking-wide">
            SILVER COINS & BARS
          </h2>
          <div className="w-16 h-0.5 bg-[#9A650C] mx-auto mt-2.5 mb-3" />
          <p className="text-xs sm:text-sm text-[#4E6073] font-sans">
            Pure 999 fine investment bars, auspicious temple coins, and personalized keepsake tokens.
          </p>
        </div>

        {/* 2-Column Banner Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Large Visual: Personalized Silver Photo Coins & Keepsakes */}
          <div className="lg:col-span-7 relative h-[360px] sm:h-[400px] rounded-3xl overflow-hidden border-2 border-[#C5B299] hover:border-[#9A650C] shadow-xl group transition-all duration-500">
            <img
              src="/images/personalized_silver_coin.jpg"
              alt="Personalized Pure 999 Silver Gifts"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

            <div className="absolute inset-x-6 bottom-6 sm:inset-x-8 sm:bottom-8 text-white z-10">
              <span className="bg-[#0B2545] text-[#F8E6C8] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2 inline-block border border-[#D4AF37]/30">
                LIFELONG KEEPSAKE
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-2 text-[#FFFDF9] leading-snug">
                Personalized 999 Silver Photo Coins & Gifts
              </h3>
              <p className="text-xs sm:text-sm text-[#EAE2D5] max-w-lg mb-4 font-sans">
                Preserve newborn smiles, wedding vows, and anniversary milestones in pure 999 silver with custom laser photo medallion engravings.
              </p>
              <button
                onClick={() => onNavigateCategory && onNavigateCategory('silver-coins-bars')}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#9A650C] text-[#071526] font-serif text-xs font-bold tracking-widest uppercase hover:from-[#E6CA65] hover:to-[#D4AF37] transition-all duration-300 inline-flex items-center space-x-2 cursor-pointer shadow-md"
              >
                <span>EXPLORE ALL COINS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Highlights & Investment Features */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="bg-[#F8F4EC] rounded-3xl p-6 sm:p-8 border border-[#C5B299] shadow-md hover:border-[#9A650C] transition-all">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#071526] mb-4">
                Assay Certified Silver Bullion
              </h3>
              
              <div className="space-y-4">
                {HIGHLIGHTS.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3.5">
                    <CheckCircle2 className="w-5 h-5 text-[#9A650C] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#071526]">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#4E6073] mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-[#C5B299]/40 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigateCategory && onNavigateCategory('silver-coins-bars')}
                  className="flex-1 py-3 bg-[#0B2545] text-[#F8E6C8] font-serif text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-[#143A66] transition-colors text-center cursor-pointer shadow-sm border border-[#D4AF37]/30"
                >
                  Buy 999 Bullion
                </button>
                <button
                  onClick={onNavigateYatraCustomizer}
                  className="px-5 py-3 border-2 border-[#0B2545] text-[#0B2545] font-serif text-xs font-bold tracking-wider uppercase rounded-xl hover:bg-[#EAE2D5] transition-colors cursor-pointer"
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
