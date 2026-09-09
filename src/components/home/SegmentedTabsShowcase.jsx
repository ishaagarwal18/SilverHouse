import React, { useState, useRef } from 'react';
import { Heart, ShoppingBag, Star, Sparkles, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function SegmentedTabsShowcase({
  products = [],
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  onQuickView,
  onSelectProduct,
  onNavigateCategory
}) {
  const [activeTab, setActiveTab] = useState('men');
  const sliderRef = useRef(null);

  const TABS = [
    {
      id: 'men',
      label: 'For Men',
      targetCategory: 'mens',
      filter: (p) => {
        const cat = (p.category || p.category_slug || '').toLowerCase();
        const ideal = (p.recipient || p.ideal_for || p.idealFor || '').toLowerCase();
        if (cat === 'men-silver-collection' || cat === 'men' || cat === 'mens') return true;
        if (ideal.includes('women')) return false;
        const words = ideal.split(/[\s,]+/);
        return words.includes('men') || words.includes("men's") || (cat.includes('men') && !cat.includes('women'));
      }
    },
    {
      id: 'women',
      label: 'For Women',
      targetCategory: 'women',
      filter: (p) => {
        const cat = (p.category || p.category_slug || '').toLowerCase();
        const ideal = (p.recipient || p.ideal_for || p.idealFor || '').toLowerCase();
        if (ideal.includes('women')) return true;
        if (
          [
            'silver-rings',
            'silver-pendants-chains',
            'silver-bangles-kadas',
            'silver-payal-anklets',
            'rings',
            'earrings',
            'earings',
            'anklets',
            'pendants',
            'bracelets',
            'sets'
          ].includes(cat)
        ) {
          return true;
        }
        return (
          cat.includes('ring') ||
          cat.includes('payal') ||
          cat.includes('pendant') ||
          cat.includes('women') ||
          cat.includes('anklet') ||
          cat.includes('earring') ||
          cat.includes('necklace')
        );
      }
    },
    {
      id: 'kids',
      label: 'For Kids',
      targetCategory: 'kids',
      filter: (p) => {
        const cat = (p.category || p.category_slug || '').toLowerCase();
        const ideal = (p.recipient || p.ideal_for || p.idealFor || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        const occs = Array.isArray(p.occasions) ? p.occasions.map((o) => o.toLowerCase()) : [];
        return (
          cat === 'kids-nazariya-bracelets' ||
          cat === 'kids' ||
          cat === 'nazariya' ||
          ideal.includes('baby') ||
          ideal.includes('kids') ||
          ideal.includes('child') ||
          name.includes('nazariya') ||
          name.includes('baby') ||
          occs.some((o) => o.includes('baby') || o.includes('kids'))
        );
      }
    }
  ];

  const currentTabObj = TABS.find((t) => t.id === activeTab) || TABS[0];
  const filtered = products.filter(currentTabObj.filter);

  // Strictly display authentic database products for this category (up to 8, never mix)
  const items = filtered.slice(0, 8);

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollOffset = direction === 'left' ? -320 : 320;
      sliderRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-14 sm:py-16 bg-[var(--th-surface-alt)] border-b border-[var(--th-border)] relative">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header & Segmented Tabs Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[var(--th-border)] gap-6">
          <div>
            <div className="flex items-center space-x-2 text-[var(--th-accent)] mb-1">
              <Sparkles className="w-4 h-4 text-[var(--th-accent)]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--th-text-muted)]">
                TAILORED EXCELLENCE
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--th-text-main)] tracking-tight">
              SEGMENTED SHOWCASE
            </h2>
            <p className="text-xs sm:text-sm text-[var(--th-text-muted)] mt-1 font-sans">
              Switch effortlessly between distinct handcrafted styles directly from our collection.
            </p>
          </div>

          {/* Interactive Tabs and Slider Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Segmented Interactive Buttons */}
            <div className="inline-flex p-1.5 rounded-full bg-[var(--th-card)] border border-[var(--th-border)] shadow-xs">
              {TABS.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-[var(--th-primary)] text-white shadow-md'
                        : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:bg-[var(--th-surface-alt)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Slider Arrow Controls (visible when items exceed screen capacity) */}
            {items.length > 3 && (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => scrollSlider('left')}
                  className="w-10 h-10 rounded-full border border-[var(--th-border)] bg-[var(--th-card)] hover:bg-[var(--th-primary)] text-[var(--th-primary)] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  title="Scroll Left"
                  aria-label="Scroll Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollSlider('right')}
                  className="w-10 h-10 rounded-full border border-[var(--th-border)] bg-[var(--th-card)] hover:bg-[var(--th-primary)] text-[var(--th-primary)] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  title="Scroll Right"
                  aria-label="Scroll Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Slider Container with authentic database products */}
        <div className="relative group/slider">
          {items.length === 0 ? (
            <div className="py-12 text-center text-[var(--th-text-muted)] text-sm font-sans">
              No products available in {currentTabObj.label} at the moment.
            </div>
          ) : (
            <>
              {/* Subtle Side Floating Navigation Buttons */}
              {items.length > 3 && (
                <button
                  onClick={() => scrollSlider('left')}
                  className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-[var(--th-border)] bg-[var(--th-card)]/95 backdrop-blur-xs text-[var(--th-text-main)] hover:bg-[var(--th-primary)] hover:text-white items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 opacity-0 group-hover/slider:opacity-100"
                  title="Previous Items"
                  aria-label="Previous Items"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

          <div
            ref={sliderRef}
            className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((product) => {
              const isWishlisted = wishlistIds.includes(product.id);
              const imgSrc =
                Array.isArray(product.images) && product.images.length > 0 && product.images[0]
                  ? product.images[0]
                  : '/images/hero_silver_coins.png';

              const hasDiscount = product.originalPrice && product.originalPrice > product.price;
              const discountPercent = hasDiscount
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : (product.discount ? Number(product.discount) : 0);

              return (
                <div
                  key={product.id}
                  className="w-[260px] sm:w-[280px] lg:w-[300px] shrink-0 snap-start group/card relative flex flex-col justify-between bg-[var(--th-card)] rounded-2xl border border-[var(--th-border)] overflow-hidden hover:shadow-xl hover:border-[var(--th-accent)] transition-all duration-300"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-[var(--th-pedestal)]">
                    <img
                      src={imgSrc}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500 cursor-pointer"
                      onClick={() => onSelectProduct && onSelectProduct(product)}
                    />

                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                      <span className="absolute top-3 left-3 z-10 bg-emerald-700 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        {discountPercent}% OFF
                      </span>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist && onToggleWishlist(product);
                      }}
                      className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isWishlisted
                          ? 'bg-rose-100 text-rose-700 shadow-md border border-rose-300'
                          : 'bg-[var(--th-card)]/90 text-[var(--th-text-muted)] hover:text-[var(--th-primary)] hover:bg-[var(--th-card)] shadow-xs border border-[var(--th-border)]'
                      }`}
                      title="Save to Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-700' : ''}`} />
                    </button>

                    {/* Quick View Button */}
                    <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 hidden sm:block">
                      <button
                        onClick={() => onQuickView && onQuickView(product)}
                        className="w-full py-2 bg-[var(--th-card)]/95 backdrop-blur-xs text-[var(--th-primary)] text-xs font-bold rounded-xl shadow-md hover:bg-[var(--th-primary)] hover:text-white transition-colors uppercase tracking-wider border border-[var(--th-border)] cursor-pointer"
                      >
                        Quick View
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-[var(--th-card)]">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-[var(--th-text-muted)] mb-1">
                        <span className="font-bold text-[var(--th-accent)] uppercase tracking-wider truncate">
                          {product.purity || '925 Fine Silver'}
                        </span>
                        <div className="flex items-center space-x-1 text-[var(--th-accent)] shrink-0">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold text-xs text-[var(--th-text-main)]">
                            {product.rating || 4.9}
                          </span>
                        </div>
                      </div>

                      <h3
                        onClick={() => onSelectProduct && onSelectProduct(product)}
                        className="font-serif text-sm sm:text-base font-bold text-[var(--th-text-main)] group-hover/card:text-[var(--th-primary)] transition-colors line-clamp-1 cursor-pointer"
                        title={product.name}
                      >
                        {product.name}
                      </h3>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[var(--th-border)]/60 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-outfit font-bold text-base sm:text-lg text-[var(--th-primary)] tracking-tight">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </span>
                        {hasDiscount && (
                          <span className="text-[11px] text-[var(--th-text-muted)] line-through">
                            ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart && onAddToCart(product, 1);
                        }}
                        className="w-9 h-9 rounded-full bg-[var(--th-primary)]/10 hover:bg-[var(--th-primary)] text-[var(--th-primary)] hover:text-white flex items-center justify-center transition-colors duration-200 cursor-pointer shrink-0 border border-[var(--th-primary)]/20 shadow-xs"
                        title="Add to Shopping Cart"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {items.length > 3 && (
            <button
              onClick={() => scrollSlider('right')}
              className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-[var(--th-border)] bg-[var(--th-card)]/95 backdrop-blur-xs text-[var(--th-text-main)] hover:bg-[var(--th-primary)] hover:text-white items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 opacity-0 group-hover/slider:opacity-100"
              title="Next Items"
              aria-label="Next Items"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
            </>
          )}
        </div>

        {/* View More CTA Button */}
        <div className="mt-10 text-center">
          <button
            onClick={() => onNavigateCategory && onNavigateCategory(currentTabObj.targetCategory)}
            className="inline-flex items-center space-x-2.5 px-8 py-3.5 rounded-full bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white text-xs sm:text-sm font-bold uppercase tracking-widest shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
          >
            <span>View More {currentTabObj.label}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
}
