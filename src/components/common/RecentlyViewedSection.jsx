import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingBag,
  Eye,
  Star,
  Flame
} from 'lucide-react';
import { fetchRecentlyViewed } from '../../services/api';

export default function RecentlyViewedSection({
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  onQuickView,
  excludeProductId = null,
  title = "Recently Viewed",
  subtitle = "Pick up where you left off",
  className = ""
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function loadRecent() {
      try {
        setLoading(true);
        const data = await fetchRecentlyViewed();
        if (isMounted) {
          // Filter out excluded product (e.g. current product on PDP)
          const filtered = Array.isArray(data)
            ? data.filter(p => !excludeProductId || String(p.id) !== String(excludeProductId))
            : [];
          setItems(filtered);
        }
      } catch (err) {
        console.warn('[RecentlyViewed] Load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRecent();
    return () => {
      isMounted = false;
    };
  }, [excludeProductId]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // If no items or loading finished with empty list, do not render an empty blank space
  if (!loading && (!items || items.length === 0)) {
    return null;
  }

  return (
    <section className={`py-12 sm:py-16 transition-colors duration-300 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[var(--th-border)] gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--th-pedestal)] border border-[var(--th-border)] text-xs font-bold text-[var(--th-accent)] mb-2 shadow-2xs">
              <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>YOUR BROWSING HISTORY</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--th-text)] tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--th-text-muted)] mt-1">
              {subtitle}
            </p>
          </div>

          {/* Navigation Controls for Desktop */}
          {items.length > 2 && (
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <button
                onClick={() => handleScroll('left')}
                className="w-9 h-9 rounded-full bg-[var(--th-card)] border border-[var(--th-border)] flex items-center justify-center text-[var(--th-text)] hover:text-[#D4AF37] hover:border-[#D4AF37] shadow-2xs transition-all cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="w-9 h-9 rounded-full bg-[var(--th-card)] border border-[var(--th-border)] flex items-center justify-center text-[var(--th-text)] hover:text-[#D4AF37] hover:border-[#D4AF37] shadow-2xs transition-all cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((prod) => {
            const isWishlisted = wishlistIds.some(id => String(id) === String(prod.id));
            const imgSrc = (prod.images && prod.images[0]) || '/images/placeholder.svg';
            const purityLabel = prod.purityCode === '999' || (prod.purity && String(prod.purity).includes('999'))
              ? '999 PURE SILVER'
              : '925 STERLING';

            return (
              <div
                key={prod.id}
                className="w-[260px] sm:w-[280px] shrink-0 snap-start group relative flex flex-col justify-between bg-[var(--th-card)] rounded-2xl border border-[var(--th-border)] overflow-hidden hover:shadow-xl hover:border-[#D4AF37] transition-all duration-300"
              >
                {/* Product Image & Badges */}
                <div className="relative aspect-square overflow-hidden bg-[var(--th-pedestal)]">
                  <img
                    src={imgSrc}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => onSelectProduct && onSelectProduct(prod)}
                  />

                  {/* Purity & Hallmark Tag */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-black/90 backdrop-blur-xs text-white border border-[#D4AF37]/60 text-[9px] font-black px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider inline-flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-[#D4AF37] fill-[#D4AF37] shrink-0" />
                      <span className="text-[#D4AF37]">{purityLabel}</span>
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist && onToggleWishlist(prod);
                    }}
                    className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isWishlisted
                        ? 'bg-rose-100 text-rose-700 shadow-md border border-rose-300'
                        : 'bg-[var(--th-card)]/90 text-[var(--th-text-muted)] hover:text-rose-600 hover:bg-[var(--th-card)] shadow-xs border border-[var(--th-border)]'
                    }`}
                    title="Save to Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-700' : ''}`} />
                  </button>

                  {/* Quick View Button */}
                  {onQuickView && (
                    <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
                      <button
                        onClick={() => onQuickView(prod)}
                        className="w-full py-2 bg-[var(--th-card)]/95 backdrop-blur-xs text-[var(--th-text)] hover:text-[#D4AF37] text-xs font-bold rounded-xl shadow-md transition-colors uppercase tracking-wider border border-[var(--th-border)] cursor-pointer"
                      >
                        Quick View
                      </button>
                    </div>
                  )}
                </div>

                {/* Product Content Details */}
                <div className="p-4 flex flex-col flex-1 justify-between bg-[var(--th-card)]">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--th-text-muted)] mb-1">
                      <span className="font-bold text-[#D4AF37] uppercase tracking-wider truncate">
                        {prod.category || 'Silverware'}
                      </span>
                      {prod.reviewsCount > 0 && (
                        <span className="flex items-center text-amber-500 font-bold shrink-0">
                          <Star className="w-3 h-3 fill-current mr-0.5" />
                          <span>4.9</span>
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => onSelectProduct && onSelectProduct(prod)}
                      className="font-serif text-sm font-bold text-[var(--th-text)] line-clamp-1 group-hover:text-[#D4AF37] transition-colors cursor-pointer"
                      title={prod.name}
                    >
                      {prod.name}
                    </h3>

                    {/* Pricing */}
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-outfit font-extrabold text-base text-[var(--th-text)] tracking-tight">
                        ₹{Number(prod.price).toLocaleString('en-IN')}
                      </span>
                      {prod.originalPrice && prod.originalPrice > prod.price && (
                        <>
                          <span className="text-xs text-[var(--th-text-muted)] line-through">
                            ₹{Number(prod.originalPrice).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            {prod.discount ? `${prod.discount}% OFF` : 'SALE'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Add To Cart CTA Button */}
                  <div className="mt-4 pt-3 border-t border-[var(--th-border)] flex items-center gap-2">
                    <button
                      onClick={() => onAddToCart && onAddToCart(prod)}
                      className="w-full py-2 px-3 rounded-xl bg-[var(--th-primary)] text-white hover:bg-[var(--th-accent)] hover:text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-2xs group/btn"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
