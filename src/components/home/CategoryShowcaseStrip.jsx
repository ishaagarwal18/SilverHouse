import React, { useMemo } from 'react';
import { resolveImageUrl } from '../../services/api';

/**
 * Visual Category Showcase Strip
 * 100% Dynamic - Renders categories directly from the live database.
 * Now features a smooth infinite marquee scroll that pauses on hover.
 */
export default function CategoryShowcaseStrip({ categories = [], products = [], onNavigateCategory }) {
  // Dynamically map every category record from the live database
  const displayItems = useMemo(() => {
    if (!Array.isArray(categories) || categories.length === 0) {
      return [];
    }

    return categories.map(c => {
      const catSlug = (c.slug || c.id || c.name || String(c.category_id || ''))
        .toLowerCase()
        .replace(/&/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const catId = c.category_id || c.id;

      // The image of the category is fetched strictly from the category table path only
      const rawImg = c.image_url || c.image || '';
      const resolvedImg = resolveImageUrl(rawImg) || rawImg || '/images/placeholder.svg';

      return {
        id: catSlug || String(catId),
        label: c.name || c.shortName || 'Category',
        image: resolvedImg,
        targetCategory: c.slug || catSlug || String(catId),
        description: c.description || c.name || 'Pure Silver Collection'
      };
    });
  }, [categories, products]);

  const handleCategoryClick = (category) => {
    if (onNavigateCategory) {
      onNavigateCategory(category.targetCategory);
    }
  };

  const renderCategoryCard = (item, keySuffix = '') => (
    <button
      key={`${item.id}${keySuffix}`}
      onClick={() => handleCategoryClick(item)}
      className="group flex flex-col items-center shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--th-primary)] rounded-3xl"
    >
      {/* Image Squircle Card with Dynamic Theme Pedestal */}
      <div className="relative w-20 h-20 sm:w-26 sm:h-26 md:w-30 md:h-30 lg:w-34 lg:h-34 rounded-[18px] sm:rounded-[24px] md:rounded-[28px] overflow-hidden bg-gradient-to-b from-[var(--th-card)] via-[var(--th-card)] to-[var(--th-pedestal)] shadow-md group-hover:shadow-xl border border-[var(--th-border)] group-hover:border-[var(--th-accent)] transition-all duration-300 group-hover:-translate-y-1.5 ring-2 ring-transparent group-hover:ring-[var(--th-accent)]/50">
        <img
          src={item.image}
          alt={item.label}
          loading="lazy"
          className="w-full h-full object-cover object-center transform transition-transform duration-500 ease-out group-hover:scale-108"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/images/placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--th-primary)]/20 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Dynamic Category Label with Animated Hover Line */}
      <div className="relative flex flex-col items-center mt-2 sm:mt-2.5">
        <span className="text-xs sm:text-sm font-semibold tracking-tight text-[var(--th-text-main)] group-hover:text-[var(--th-primary)] text-center transition-colors duration-200 line-clamp-2 max-w-[95px] sm:max-w-[125px] leading-tight">
          {item.label}
        </span>
        {/* Animated Gold Accent Line Coming Down on Hover */}
        <span className="h-0.5 w-0 group-hover:w-10 bg-[var(--th-accent)] mt-1.5 transition-all duration-300 rounded-full shadow-xs" />
      </div>
    </button>
  );

  return (
    <section className="relative w-full py-6 sm:py-8 md:py-10 bg-[var(--th-bg)] border-b border-[var(--th-border-subtle)] transition-colors duration-300 overflow-hidden">
      <div className="max-w-[1920px] mx-auto relative">
        {/* Left Gradient Edge Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[var(--th-bg)] to-transparent pointer-events-none z-10" />

        {/* Marquee Container */}
        <div className="overflow-hidden py-2 group/marquee">
          {displayItems.length === 0 ? (
            /* Elegant Skeleton Loader while database categories load */
            <div className="flex items-center gap-4 sm:gap-6 md:gap-7 w-full px-4 sm:px-12 md:px-14">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <div key={n} className="flex flex-col items-center shrink-0 animate-pulse">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-[20px] sm:rounded-[26px] md:rounded-[30px] bg-[var(--th-card)] border border-[var(--th-border)] opacity-60" />
                  <div className="mt-3 w-16 h-3 bg-[var(--th-border)] rounded-full opacity-40" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex animate-marquee group-hover/marquee:[animation-play-state:paused] w-max">
              {/* First Set */}
              <div className="flex items-center gap-3 sm:gap-5 md:gap-7 pr-3 sm:pr-5 md:pr-7">
                {displayItems.map((item) => renderCategoryCard(item, '-1'))}
              </div>
              {/* Second Set (Duplicate for seamless loop) */}
              <div className="flex items-center gap-3 sm:gap-5 md:gap-7 pr-3 sm:pr-5 md:pr-7">
                {displayItems.map((item) => renderCategoryCard(item, '-2'))}
              </div>
            </div>
          )}
        </div>

        {/* Right Gradient Edge Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[var(--th-bg)] to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
}
