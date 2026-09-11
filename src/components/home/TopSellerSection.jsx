import React, { useRef } from 'react';
import { Heart, ShoppingBag, Star, Sparkles, ArrowRight, ChevronLeft, ChevronRight, Flame } from 'lucide-react';

export default function TopSellerSection({
  products = [],
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  onQuickView,
  onSelectProduct,
  onNavigateCategory
}) {
  const scrollRef = useRef(null);

  // Requirement: Top 10 products sorted strictly by highest sold value descending
  const topSellers = [...products]
    .sort((a, b) => (Number(b.sold) || 0) - (Number(a.sold) || 0))
    .slice(0, 10);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-14 sm:py-16 bg-[var(--th-bg)] border-b border-[var(--th-border)] relative">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-[var(--th-border)] gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[var(--th-accent)] mb-1">
              <Sparkles className="w-4 h-4 text-[var(--th-accent)]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--th-text-muted)]">
                MOST LOVED CREATIONS • TOP 10 BY POPULARITY
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--th-text-main)] tracking-tight">
              TOP SELLERS
            </h2>
            <p className="text-xs sm:text-sm text-[var(--th-text-muted)] mt-1 font-sans">
              Our 10 most celebrated fine silver creations with verified highest sales across India.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Scroll Navigation Arrows */}
            <div className="flex items-center space-x-1.5 bg-[var(--th-bg)]">
              <button
                onClick={scrollLeft}
                className="w-9 h-9 rounded-full border border-[var(--th-border)] bg-[var(--th-card)] hover:bg-[var(--th-primary)] text-[var(--th-primary)] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                title="Scroll Left"
                aria-label="Previous Top Seller"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                className="w-9 h-9 rounded-full border border-[var(--th-border)] bg-[var(--th-card)] hover:bg-[var(--th-primary)] text-[var(--th-primary)] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                title="Scroll Right"
                aria-label="Next Top Seller"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onNavigateCategory && onNavigateCategory('all')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full border-2 border-[var(--th-primary)] text-[var(--th-primary)] hover:bg-[var(--th-primary)] hover:text-white transition-all text-xs font-bold uppercase tracking-wider group cursor-pointer shadow-2xs"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Strictly Single Row Container (No multiple rows) */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {topSellers.map((product, index) => {
            const isWishlisted = wishlistIds.some(id => String(id) === String(product.id));
            const rawDiscount = product.originalPrice && product.price
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;
            const discountPercent = rawDiscount > 0 ? rawDiscount : 20;

            const imgSrc = (Array.isArray(product.images) && product.images.length > 0 && product.images[0])
              ? product.images[0]
              : '/images/hero_silver_coins.png';

            return (
              <div
                key={product.id}
                className="w-[270px] sm:w-[290px] shrink-0 snap-start group relative flex flex-col justify-between bg-[var(--th-card)] rounded-2xl border border-[var(--th-border)] overflow-hidden hover:shadow-xl hover:border-[var(--th-accent)] transition-all duration-300"
              >
                {/* Image Container with Zoom & Ribbons */}
                <div className="relative aspect-square overflow-hidden bg-[var(--th-pedestal)]">
                  <img
                    src={imgSrc}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => onSelectProduct && onSelectProduct(product)}
                  />

                  {/* Top Rank & Sold Ribbon Tag */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col space-y-1">
                    <span className="bg-[var(--th-primary)] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center space-x-1 border border-white/20">
                      <Flame className="w-3 h-3 text-[var(--th-accent)] fill-[var(--th-accent)]" />
                      <span>#{index + 1} Best Seller</span>
                    </span>
                    <span className="bg-[var(--th-accent)] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs w-fit">
                      {Number(product.sold || 0)} Sold
                    </span>
                  </div>

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

                  {/* Quick View Button on Hover */}
                  <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
                    <button
                      onClick={() => onQuickView && onQuickView(product)}
                      className="w-full py-2 bg-[var(--th-card)]/95 backdrop-blur-xs text-[var(--th-primary)] text-xs font-bold rounded-xl shadow-md hover:bg-[var(--th-primary)] hover:text-white transition-colors uppercase tracking-wider border border-[var(--th-border)] cursor-pointer"
                    >
                      Quick View
                    </button>
                  </div>
                </div>

                {/* Product Meta Details */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-[var(--th-card)]">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--th-text-muted)] mb-1">
                      <span className="font-bold text-[var(--th-accent)] uppercase tracking-wider truncate">
                        {product.purity || '925 Fine Silver'} • {product.color || 'Silver'}
                      </span>
                      <div className="flex items-center space-x-1 text-[var(--th-accent)] shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-bold text-xs text-[var(--th-text-main)]">{product.rating || 4.9}</span>
                        <span className="text-[10px] text-[var(--th-text-muted)]">({product.reviewsCount || product.review || 42})</span>
                      </div>
                    </div>

                    {/* Product Title */}
                    <h3
                      onClick={() => onSelectProduct && onSelectProduct(product)}
                      className="font-serif text-sm sm:text-base font-bold text-[var(--th-text-main)] group-hover:text-[var(--th-primary)] transition-colors line-clamp-1 cursor-pointer"
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                    
                    <p className="text-[11px] text-[var(--th-text-muted)] font-medium mt-0.5 line-clamp-1">
                      {product.weightGrams ? `${product.weightGrams}g Pure Silver` : 'Hallmark Certified'} • {product.recipient || product.idealFor || 'Authentic'}
                    </p>
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-3 mt-3 border-t border-[var(--th-border)]/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="font-outfit font-bold text-base sm:text-lg text-[var(--th-primary)] tracking-tight">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-[var(--th-text-muted)] line-through font-outfit font-medium">
                            ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block -mt-0.5">
                        🔥 {Number(product.sold || 0)} Sold
                      </span>
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
      </div>
    </section>
  );
}
