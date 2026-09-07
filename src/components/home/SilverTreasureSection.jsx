import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SilverTreasureSection({ onNavigateCategory, onNavigateYatraCustomizer }) {
  return (
    <section className="py-14 sm:py-16 bg-[#EAE2D5] border-b border-[#C5B299]">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#9A650C] tracking-[0.25em] uppercase bg-[#9A650C]/15 px-3.5 py-1 rounded-full inline-block mb-3 border border-[#9A650C]/30">
            ARTISANAL CRAFTSMANSHIP
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#071526] tracking-wide">
            SILVER TREASURE
          </h2>
          <div className="w-16 h-0.5 bg-[#9A650C] mx-auto mt-2.5 mb-3" />
          <p className="text-xs sm:text-sm text-[#4E6073] font-sans">
            Heirloom creations sanctified with authentic 925 & 999 silver purity for divine puja rooms and timeless dining.
          </p>
        </div>

        {/* 2 Large Feature Banner Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Card 1: Divine Blessings in 925 Silver Idols */}
          <div
            onClick={() => onNavigateCategory && onNavigateCategory('silver-religious-idols')}
            className="group relative h-[360px] sm:h-[400px] rounded-3xl overflow-hidden shadow-xl border-2 border-[#C5B299] hover:border-[#9A650C] cursor-pointer flex flex-col justify-end p-6 sm:p-7 transition-all duration-500"
          >
            <img
              src="/images/silver_cow_calf_idol.jpg"
              alt="Divine Blessings in 925 Silver Idols"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent group-hover:from-black/95 transition-all" />

            <div className="relative z-10 text-white">
              <span className="inline-flex items-center space-x-1.5 bg-[#0B2545] text-[#F8E6C8] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 border border-[#D4AF37]/30">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>POOJA & MANDIR SANCTUM</span>
              </span>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-2 text-[#FFFDF9] group-hover:text-[#F8E6C8] transition-colors leading-snug">
                Divine Blessings in 925 Silver Idols
              </h3>
              <p className="text-xs sm:text-sm text-[#EAE2D5] font-sans mb-5 max-w-lg">
                Intricately cast Kamdhenu Cow, Radha Krishna, Bal Gopal, and Lord Ganesha murti idols, blessed with pure hallmark purity.
              </p>

              <button
                type="button"
                className="px-6 py-2.5 rounded-full border-2 border-[#F8F4EC] text-[#F8F4EC] font-serif text-xs font-bold tracking-widest uppercase hover:bg-[#0B2545] hover:border-[#0B2545] hover:text-[#F8E6C8] transition-all duration-300 flex items-center space-x-2 cursor-pointer"
              >
                <span>EXPLORE IDOLS</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Purity Served in 925 Silver Utensils */}
          <div
            onClick={() => onNavigateCategory && onNavigateCategory('all')}
            className="group relative h-[360px] sm:h-[400px] rounded-3xl overflow-hidden shadow-xl border-2 border-[#C5B299] hover:border-[#9A650C] cursor-pointer flex flex-col justify-end p-6 sm:p-7 transition-all duration-500"
          >
            <img
              src="/images/silver_utensils_pooja.jpg"
              alt="Purity Served in 925 Silver Utensils"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent group-hover:from-black/95 transition-all" />

            <div className="relative z-10 text-white">
              <span className="inline-flex items-center space-x-1.5 bg-[#9A650C] text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full mb-3 border border-white/20">
                <ShieldCheck className="w-3 h-3 text-white" />
                <span>SACRED DINING & ARTIFACTS</span>
              </span>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-2 text-[#FFFDF9] group-hover:text-[#F8E6C8] transition-colors leading-snug">
                Purity Served in 925 Silver Utensils
              </h3>
              <p className="text-xs sm:text-sm text-[#EAE2D5] font-sans mb-5 max-w-lg">
                Handcrafted pure silver Pooja Thalis, traditional Diyas, Panchamrit Spoons, and ceremonial feeding bowls for your home.
              </p>

              <button
                type="button"
                className="px-6 py-2.5 rounded-full border-2 border-[#F8F4EC] text-[#F8F4EC] font-serif text-xs font-bold tracking-widest uppercase hover:bg-[#0B2545] hover:border-[#0B2545] hover:text-[#F8E6C8] transition-all duration-300 flex items-center space-x-2 cursor-pointer"
              >
                <span>EXPLORE UTENSILS</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Support block: Customized Yatra Lockets Showcase */}
        <div
          onClick={onNavigateYatraCustomizer}
          className="relative rounded-3xl overflow-hidden border-2 border-[#D4AF37] bg-gradient-to-r from-[#071526] via-[#0B2545] to-[#143A66] p-8 sm:p-10 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="max-w-xl text-left">
            <div className="inline-flex items-center space-x-2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 rounded-full text-xs font-bold tracking-wider text-[#F8E6C8] uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>CUSTOM SPIRITUAL ART</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
              Made-On-Order Customized Yatra Shrine Lockets
            </h3>
            <p className="text-xs sm:text-sm text-[#EAE2D5] font-sans leading-relaxed">
              Encase your cherished deity or family pilgrimage memories in pure 925 sterling silver. Select your sacred motif, chain style, and gotra inscriptions.
            </p>
          </div>

          <button
            type="button"
            className="shrink-0 px-7 py-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#9A650C] text-[#071526] font-serif text-xs font-extrabold tracking-widest uppercase hover:from-[#E6CA65] hover:to-[#D4AF37] transition-all shadow-md hover:shadow-[#D4AF37]/40 flex items-center space-x-2 cursor-pointer"
          >
            <span>CUSTOMIZE NOW</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
