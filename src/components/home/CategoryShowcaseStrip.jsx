import React, { useRef, useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveImageUrl } from '../../services/api';

/**
 * Visual Category Showcase Strip
 * 100% Dynamic - Renders categories directly from the live database.
 * Supports dynamic image resolution from category fields, associated products, or local media assets.
 */
export default function CategoryShowcaseStrip({ categories = [], products = [], onNavigateCategory }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

      // 1. Check if category itself has an image_url in DB
      let resolvedImg = '';
      if (c.image_url || c.image) {
        resolvedImg = resolveImageUrl(c.image_url || c.image);
      } 
      // 2. Otherwise find the first product in this category with an image
      else if (Array.isArray(products) && products.length > 0) {
        const matchedProd = products.find(p =>
          (p.category_id && String(p.category_id) === String(catId)) ||
          (p.category && p.category.toLowerCase() === catSlug) ||
          (p.category_slug && p.category_slug.toLowerCase() === catSlug)
        );
        if (matchedProd && Array.isArray(matchedProd.images) && matchedProd.images.length > 0) {
          resolvedImg = resolveImageUrl(matchedProd.images[0]);
        }
      }

      // 3. Fallback to local asset alias if applicable
      if (!resolvedImg) {
        const normalizedSlug = catSlug.replace(/[^a-z0-9]/g, '_');
        resolvedImg = `/images/categories/cat_${normalizedSlug}.jpg`;
      }

      return {
        id: catSlug || String(catId),
        label: c.name || c.shortName || 'Category',
        image: resolvedImg,
        targetCategory: c.slug || catSlug || String(catId),
        description: c.description || c.name || 'Pure Silver Collection'
      };
    });
  }, [categories, products]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [displayItems.length]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 350);
    }
  };

  const handleCategoryClick = (category) => {
    if (onNavigateCategory) {
      onNavigateCategory(category.targetCategory);
    }
  };

  return (
    <section className="relative w-full py-8 md:py-10 bg-[var(--th-bg)] border-b border-[var(--th-border-subtle)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Left Arrow Button */}
        {displayItems.length > 0 && (
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className={`absolute left-1 sm:left-2 top-[42%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[var(--th-card)] shadow-lg border border-[var(--th-border)] flex items-center justify-center text-[var(--th-text-main)] transition-all duration-200 ${
              canScrollLeft
                ? 'opacity-100 hover:scale-110 hover:bg-[var(--th-primary)] hover:text-white hover:border-[var(--th-primary)] cursor-pointer shadow-md'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-center gap-4 sm:gap-6 md:gap-7 overflow-x-auto scroll-smooth py-2 px-2 no-scrollbar"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {displayItems.length === 0 ? (
            /* Elegant Skeleton Loader while database categories load */
            <div className="flex items-center gap-4 sm:gap-6 md:gap-7 w-full py-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <div key={n} className="flex flex-col items-center shrink-0 animate-pulse">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-[22px] sm:rounded-[26px] md:rounded-[30px] bg-[var(--th-card)] border border-[var(--th-border)] opacity-60" />
                  <div className="mt-3 w-16 h-3 bg-[var(--th-border)] rounded-full opacity-40" />
                </div>
              ))}
            </div>
          ) : (
            displayItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleCategoryClick(item)}
                className="group flex flex-col items-center shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--th-primary)] rounded-3xl"
              >
                {/* Image Squircle Card with Dynamic Theme Pedestal */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-[22px] sm:rounded-[26px] md:rounded-[30px] overflow-hidden bg-gradient-to-b from-[var(--th-card)] via-[var(--th-card)] to-[var(--th-pedestal)] shadow-md group-hover:shadow-xl border border-[var(--th-border)] group-hover:border-[var(--th-accent)] transition-all duration-300 group-hover:-translate-y-1.5 ring-2 ring-transparent group-hover:ring-[var(--th-accent)]/50">
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

                {/* Dynamic Category Label */}
                <span className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-[15px] font-medium tracking-tight text-[var(--th-text-main)] group-hover:text-[var(--th-primary)] text-center transition-colors duration-200">
                  {item.label}
                </span>

                {/* Dynamic Theme Accent Underline Glow */}
                <span className="h-0.5 w-0 group-hover:w-5 bg-[var(--th-accent)] rounded-full transition-all duration-300 mt-1 opacity-0 group-hover:opacity-100" />
              </button>
            ))
          )}
        </div>

        {/* Right Arrow Button */}
        {displayItems.length > 0 && (
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className={`absolute right-1 sm:right-2 top-[42%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[var(--th-card)] shadow-lg border border-[var(--th-border)] flex items-center justify-center text-[var(--th-text-main)] transition-all duration-200 ${
              canScrollRight
                ? 'opacity-100 hover:scale-110 hover:bg-[var(--th-primary)] hover:text-white hover:border-[var(--th-primary)] cursor-pointer shadow-md'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}
      </div>
    </section>
  );
}
