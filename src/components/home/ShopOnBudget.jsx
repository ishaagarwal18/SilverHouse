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
    <section className="py-14 sm:py-16 bg-[var(--th-bg)] border-b border-[var(--th-border)]">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center space-x-2 text-[var(--th-accent)] mb-1">
            <Sparkles className="w-4 h-4 text-[var(--th-accent)]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--th-text-muted)]">
              CELEBRATE WITHIN YOUR MEANS
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--th-text-main)] tracking-wider uppercase">
            SHOP ON BUDGET
          </h2>
          <div className="w-16 h-0.5 bg-[var(--th-accent)] mx-auto mt-2.5 mb-3" />
          <p className="text-xs sm:text-sm text-[var(--th-text-muted)] font-sans">
            Handcrafted pure silver gifts for every celebration, thoughtfully curated to fit your budget.
          </p>
        </div>

        {/* 4 Budget Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              onClick={() => handleTierClick(tier)}
              className="group relative h-64 sm:h-72 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 border-2 border-[var(--th-border)] hover:border-[var(--th-accent)] flex items-center justify-center p-6 text-center transform hover:-translate-y-1.5"
              style={{ background: 'var(--th-budget-card)' }}
            >
              {/* Background Glow */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />

              {/* Subtle Arch Outline */}
              <div className="absolute inset-x-7 top-4 bottom-4 rounded-t-full border border-white/20 pointer-events-none" />

              {/* Central Scalloped Ornate Badge */}
              <div className="relative z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-[38px] bg-white/10 backdrop-blur-md shadow-2xl p-2 flex flex-col items-center justify-center border-2 border-[var(--th-accent)]/80 group-hover:scale-105 transition-transform duration-300">

                {/* Inner Decorative Scalloped Border Ring */}
                <div className="w-full h-full rounded-[32px] border border-white/25 bg-black/10 flex flex-col items-center justify-center px-4 py-2 relative overflow-hidden">

                  {/* Watermark */}
                  <svg className="absolute w-28 h-28 text-white/10 fill-current pointer-events-none -bottom-4" viewBox="0 0 24 24">
                    <path d="M12 3c-1.5 3-4 6-8 7 3 2 5 5 5 9 1-3 2-6 3-9 1 3 2 6 3 9 0-4 2-7 5-9-4-1-6.5-4-8-7z" />
                  </svg>

                  {/* Prefix Text */}
                  <span className="font-serif text-white/90 font-medium text-xs sm:text-sm tracking-wide drop-shadow-xs">
                    {tier.prefix}
                  </span>

                  {/* Amount Text */}
                  <span className="font-outfit font-extrabold text-white text-base sm:text-lg tracking-wider mt-1 drop-shadow-md">
                    {tier.amount}
                  </span>

                  {/* Tagline on hover */}
                  <span className="text-[10px] font-bold text-[var(--th-accent)] uppercase tracking-widest mt-2 opacity-95">
                    {tier.tag}
                  </span>
                </div>
              </div>

              {/* Shine highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
