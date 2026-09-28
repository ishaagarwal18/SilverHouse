import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ShopByWeight({ products = [], onSelectWeight, onNavigateCategory }) {
  const navigate = useNavigate();

  const WEIGHT_TIERS = [
    {
      id: 'under-10g',
      min: 0,
      max: 10,
      weightLabel: 'Under 10g',
      gramBadge: '< 10 Grams',
      title: 'Dainty & Daily Wear',
      subtitle: 'Minimalist rings, snowflake studs, delicate charms & lightweight pendants',
      tag: 'DAILY ESSENTIALS',
      image: '/images/categories/cat_rings.jpg',
      idealFor: 'Everyday Comfort & Gifting'
    },
    {
      id: '10g-25g',
      min: 10,
      max: 25,
      weightLabel: '10g – 25g',
      gramBadge: '10g to 25g',
      title: 'Classic Elegance',
      subtitle: 'Chiming payal anklets, Italian curb chains & sleek office-wear bracelets',
      tag: 'SIGNATURE CLASSICS',
      image: '/images/categories/cat_silver_chains.jpg',
      idealFor: 'Workwear & Festive Charms'
    },
    {
      id: '25g-50g',
      min: 25,
      max: 50,
      weightLabel: '25g – 50g',
      gramBadge: '25g to 50g',
      title: 'Statement Heritage',
      subtitle: 'Royal carved kadas, heavy Cuban link chains & bespoke pilgrimage lockets',
      tag: 'BOLD STATEMENT',
      image: '/images/section/316_royal_men_silver_kada.jpg',
      idealFor: 'Traditional Grandeur & Men'
    },
    {
      id: 'above-50g',
      min: 50,
      max: 10000,
      weightLabel: '50g & Above',
      gramBadge: '50g+ Heirloom',
      title: 'Bullion & Puja Articles',
      subtitle: '999 pure silver coins, investment bars, auspicious diyas & pooja thalis',
      tag: 'ROYAL HEIRLOOM',
      image: '/images/section/personalized_silver_coin.jpg',
      idealFor: 'Auspicious Rituals & Wealth'
    }
  ];

  // Helper to count available products in this weight bracket
  const getProductCount = (min, max) => {
    if (!products || products.length === 0) return null;
    const count = products.filter(p => {
      const w = Number(p.weightGrams ?? (p.weight ? parseFloat(p.weight) : 0));
      return w >= min && w <= max;
    }).length;
    return count > 0 ? `${count} Designs` : null;
  };

  const handleTierClick = (tier) => {
    if (onSelectWeight) {
      onSelectWeight(tier.min, tier.max);
    } else {
      navigate(`/catalog?minWeight=${tier.min}&maxWeight=${tier.max}`);
    }
  };

  return (
    <section className="py-14 sm:py-16 bg-[var(--th-surface-alt)] border-b border-[var(--th-border)] relative overflow-hidden">
      {/* Background Decorative Accent Rings */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[var(--th-accent)]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[var(--th-primary)]/5 blur-3xl pointer-events-none" />

      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="flex items-center justify-center space-x-2 text-[var(--th-accent)] mb-2">
            <Scale className="w-4 h-4 text-[var(--th-accent)]" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--th-text-muted)]">
              CERTIFIED HALLMARKED GRAMMAGE
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--th-text-main)] tracking-wider uppercase">
            SHOP BY WEIGHT
          </h2>
          <div className="w-16 h-0.5 bg-[var(--th-accent)] mx-auto mt-2.5 mb-3" />
          <p className="text-xs sm:text-sm text-[var(--th-text-muted)] font-sans max-w-xl mx-auto leading-relaxed">
            From featherlight everyday jewellery to opulent heirloom treasures — discover authentic 925 sterling and 999 fine silver crafted to your exact weight preference.
          </p>

          {/* Quick Filter Pill Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            <span className="text-[11px] font-bold text-[var(--th-text-muted)] uppercase tracking-wider mr-1 hidden sm:inline">
              Quick Filter:
            </span>
            {WEIGHT_TIERS.map((tier) => (
              <button
                key={tier.id}
                onClick={() => handleTierClick(tier)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--th-card)] text-[var(--th-text-main)] border border-[var(--th-border)] hover:border-[var(--th-accent)] hover:bg-[var(--th-primary)] hover:text-white transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Scale className="w-3 h-3 text-[var(--th-accent)]" />
                <span>{tier.weightLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4 Weight Showcase Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {WEIGHT_TIERS.map((tier) => {
            const countLabel = getProductCount(tier.min, tier.max);

            return (
              <div
                key={tier.id}
                onClick={() => handleTierClick(tier)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTierClick(tier);
                  }
                }}
                className="group relative h-[380px] sm:h-[420px] rounded-3xl overflow-hidden border-2 border-[var(--th-border)] shadow-md hover:shadow-2xl hover:border-[var(--th-accent)] transition-all duration-500 cursor-pointer flex flex-col justify-between p-6 bg-[var(--th-card)] transform hover:-translate-y-1"
              >
                {/* Background Photography Image */}
                <img
                  src={tier.image}
                  alt={tier.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />

                {/* Dark Luxury Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/35 group-hover:from-black/98 group-hover:via-black/60 transition-all duration-500" />

                {/* Top Badges */}
                <div className="relative z-10 flex items-center justify-between w-full">
                  {/* Gram Badge */}
                  <div className="inline-flex items-center space-x-1.5 bg-black/60 backdrop-blur-md border border-white/25 px-3 py-1.5 rounded-full shadow-lg">
                    <Scale className="w-3.5 h-3.5 text-[var(--th-accent)]" />
                    <span className="text-white text-[11px] font-bold tracking-wide">
                      {tier.gramBadge}
                    </span>
                  </div>

                  {/* Product Count / Tag */}
                  {countLabel ? (
                    <span className="bg-[var(--th-accent)]/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md border border-white/20">
                      {countLabel}
                    </span>
                  ) : (
                    <span className="bg-white/15 backdrop-blur-md text-white/90 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/20">
                      {tier.tag}
                    </span>
                  )}
                </div>

                {/* Bottom Content Area */}
                <div className="relative z-10 text-white flex flex-col items-start mt-auto">
                  {/* Category / Sub-tag */}
                  <div className="flex items-center space-x-1.5 text-[var(--th-accent)] text-[10px] font-extrabold uppercase tracking-widest mb-1.5">
                    <Sparkles className="w-3 h-3 text-[var(--th-accent)]" />
                    <span>{tier.idealFor}</span>
                  </div>

                  {/* Weight Heading */}
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white group-hover:text-[var(--th-accent)] transition-colors leading-tight mb-1">
                    {tier.weightLabel}
                  </h3>

                  {/* Subtitle / Articles */}
                  <p className="font-serif text-sm font-semibold text-white/90 mb-1.5">
                    {tier.title}
                  </p>
                  <p className="text-xs text-white/70 font-sans line-clamp-2 mb-4 leading-relaxed">
                    {tier.subtitle}
                  </p>

                  {/* Elegant Call to Action Button */}
                  <div className="w-full pt-3 border-t border-white/15 flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-[var(--th-accent)] transition-colors">
                      Explore Collection
                    </span>
                    <div className="w-8 h-8 rounded-full border border-white/40 bg-white/10 group-hover:bg-[var(--th-primary)] group-hover:border-[var(--th-primary)] flex items-center justify-center transition-all duration-300 group-hover:translate-x-1">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Subtle Hover Edge Highlight */}
                <div className="absolute inset-0 border border-white/10 rounded-3xl pointer-events-none group-hover:border-[var(--th-accent)]/50 transition-colors duration-500" />
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Guarantee Note */}
        <div className="mt-10 max-w-2xl mx-auto bg-[var(--th-card)]/80 backdrop-blur-xs border border-[var(--th-border)] rounded-2xl p-4 sm:p-5 flex items-center justify-center space-x-3 text-center shadow-xs">
          <ShieldCheck className="w-5 h-5 text-[var(--th-accent)] shrink-0" />
          <p className="text-xs text-[var(--th-text-muted)] font-sans">
            <strong className="text-[var(--th-text-main)] font-semibold">100% Certified Silver Weight:</strong> Every order is precision-weighed on calibrated laboratory scales and accompanied by a physical hallmark invoice certifying net silver weight & purity.
          </p>
        </div>

      </div>
    </section>
  );
}
