import React from 'react';
import { Sparkles } from 'lucide-react';

export default function ShopOnBudget({ onSelectBudget, onNavigateCategory }) {
  const TIERS = [
    {
      id: 'under-1499',
      prefix: 'Gifts Under',
      amount: '₹ 1499',
      min: 0,
      max: 1499,
      tag: 'Affordable Charm'
    },
    {
      id: '1499-2499',
      prefix: 'Gifts Between',
      amount: '₹1499-₹2499',
      min: 1499,
      max: 2499,
      tag: 'Everyday Luxury'
    },
    {
      id: '2499-4999',
      prefix: 'Gifts Between',
      amount: '₹2499-₹4999',
      min: 2499,
      max: 4999,
      tag: 'Celebration Specials'
    },
    {
      id: 'above-4999',
      prefix: 'Gifts Above',
      amount: '₹ 4999',
      min: 4999,
      max: 999999,
      tag: 'Heirloom Treasures'
    }
  ];

  const handleTierClick = (tier) => {
    if (onSelectBudget) {
      onSelectBudget(tier.min, tier.max);
    } else if (onNavigateCategory) {
      onNavigateCategory('all');
    }
  };

  return (
    <section className="py-14 sm:py-16 bg-[#EAE2D5] border-b border-[#C5B299]">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center space-x-2 text-[#9A650C] mb-1">
            <Sparkles className="w-4 h-4 text-[#9A650C]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#4E6073]">
              CELEBRATE WITHIN YOUR MEANS
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#071526] tracking-wider uppercase">
            SHOP ON BUDGET
          </h2>
          <div className="w-16 h-0.5 bg-[#9A650C] mx-auto mt-2.5 mb-3" />
          <p className="text-xs sm:text-sm text-[#4E6073] font-sans">
            Handcrafted pure silver gifts for every celebration, thoughtfully curated to fit your budget.
          </p>
        </div>

        {/* 4 Budget Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              onClick={() => handleTierClick(tier)}
              className="group relative h-64 sm:h-72 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 bg-gradient-to-b from-[#0B2545] via-[#081C35] to-[#040E1B] border-2 border-[#D4AF37]/40 hover:border-[#D4AF37] flex items-center justify-center p-6 text-center transform hover:-translate-y-1.5"
            >
              {/* Background Glow */}
              <div className="absolute inset-0 opacity-25 group-hover:opacity-35 transition-opacity bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200/20 via-transparent to-transparent pointer-events-none" />

              {/* Subtle Arch Outline */}
              <div className="absolute inset-x-7 top-4 bottom-4 rounded-t-full border border-amber-300/20 pointer-events-none" />

              {/* Decorative Satin Ribbon Graphic */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <div className="absolute -left-4 w-28 h-16 bg-gradient-to-r from-[#143A66] to-[#1E4D82] rounded-full rotate-[-25deg] blur-[1px] shadow-lg opacity-85 group-hover:rotate-[-20deg] transition-transform duration-500" />
                <div className="absolute -right-4 w-28 h-16 bg-gradient-to-l from-[#143A66] to-[#1E4D82] rounded-full rotate-[25deg] blur-[1px] shadow-lg opacity-85 group-hover:rotate-[20deg] transition-transform duration-500" />
                <div className="absolute w-44 h-24 bg-gradient-to-tr from-[#071526] via-[#143A66] to-[#071526] rounded-full opacity-60 blur-xs" />
              </div>

              {/* Central Scalloped Ornate Badge */}
              <div className="relative z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-[38px] bg-gradient-to-b from-[#143A66] via-[#0E2E54] to-[#071526] shadow-2xl p-2 flex flex-col items-center justify-center border-2 border-[#D4AF37]/80 group-hover:scale-105 transition-transform duration-300">

                {/* Inner Decorative Scalloped Border Ring */}
                <div className="w-full h-full rounded-[32px] border border-[#D4AF37]/40 bg-gradient-to-b from-[#D4AF37]/15 to-transparent flex flex-col items-center justify-center px-4 py-2 relative overflow-hidden">

                  {/* Watermark */}
                  <svg className="absolute w-28 h-28 text-white/10 fill-current pointer-events-none -bottom-4" viewBox="0 0 24 24">
                    <path d="M12 3c-1.5 3-4 6-8 7 3 2 5 5 5 9 1-3 2-6 3-9 1 3 2 6 3 9 0-4 2-7 5-9-4-1-6.5-4-8-7z" />
                  </svg>

                  {/* Prefix Text */}
                  <span className="font-serif text-[#F8E6C8] font-medium text-xs sm:text-sm tracking-wide drop-shadow-sm">
                    {tier.prefix}
                  </span>

                  {/* Amount Text */}
                  <span className="font-sans font-extrabold text-[#FFFDF9] text-base sm:text-lg tracking-wider mt-1 drop-shadow-md">
                    {tier.amount}
                  </span>

                  {/* Tagline on hover */}
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mt-2 opacity-95">
                    {tier.tag}
                  </span>
                </div>
              </div>

              {/* Shine highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
