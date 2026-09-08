import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORY_ITEMS = [
  {
    id: 'rings',
    label: 'Rings',
    image: '/images/categories/cat_rings.jpg',
    targetCategory: 'rings',
    description: 'Solitaire & Designer Silver Rings'
  },
  {
    id: 'bracelet',
    label: 'Bracelet',
    image: '/images/categories/cat_bracelets.jpg',
    targetCategory: 'bracelets',
    description: 'Artisanal Silver Bracelets & Kadas'
  },
  {
    id: 'idols',
    label: 'Idols',
    image: '/images/categories/cat_idols.jpg',
    targetCategory: 'idols',
    description: 'Pure 999 Devotional Silver Murti'
  },
  {
    id: 'utensils',
    label: 'Utensils',
    image: '/images/categories/cat_utensils.jpg',
    targetCategory: 'utensils',
    description: 'Sacred Puja Kalash, Diya & Thali'
  },
  {
    id: 'earrings',
    label: 'Earrings',
    image: '/images/categories/cat_earrings.jpg',
    targetCategory: 'earrings',
    description: 'Sparkling Studs & Drop Earrings'
  },
  {
    id: 'pendants',
    label: 'Pendants',
    image: '/images/categories/cat_pendants.jpg',
    targetCategory: 'pendants',
    description: 'Devotional & Solitaire Pendants'
  },
  {
    id: 'chain',
    label: 'Chain',
    image: '/images/categories/cat_silver_chains.jpg',
    targetCategory: 'chains',
    description: 'Cuban Links & Pure Silver Chains'
  },
  {
    id: 'men-in-silver',
    label: 'Men In Silver',
    image: '/images/categories/cat_men_in_silver.jpg',
    targetCategory: 'men-silver-collection',
    description: 'Bold Masculine Rings & Kadas'
  },
  {
    id: 'nazariya',
    label: 'Nazariya',
    image: '/images/categories/cat_nazariya.jpg',
    targetCategory: 'nazariya',
    description: 'Protective Baby Nazariya & Bracelets'
  },
  {
    id: 'yantra',
    label: 'Yantra',
    image: '/images/categories/cat_yantra.jpg',
    targetCategory: 'yantra',
    description: 'Sacred Sri Yantra & Shrine Lockets'
  },
  {
    id: 'anklets',
    label: 'Anklets',
    image: '/images/categories/cat_anklets.jpg',
    targetCategory: 'anklets',
    description: 'Bridal Ghungroo & Daily Anklets'
  }
];

export default function CategoryShowcaseStrip({ onNavigateCategory }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
  }, []);

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
          {CATEGORY_ITEMS.map((item) => (
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
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--th-primary)]/20 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Label */}
              <span className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-[15px] font-medium tracking-tight text-[var(--th-text-main)] group-hover:text-[var(--th-primary)] text-center transition-colors duration-200">
                {item.label}
              </span>
              
              {/* Dynamic Theme Accent Underline Glow */}
              <span className="h-0.5 w-0 group-hover:w-5 bg-[var(--th-accent)] rounded-full transition-all duration-300 mt-1 opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>

        {/* Right Arrow Button */}
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
      </div>
    </section>
  );
}
