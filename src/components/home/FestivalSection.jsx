import React, { useMemo } from 'react';
import { Calendar, Sparkles, ShoppingBag, ArrowRight, Star, Heart, Eye } from 'lucide-react';
import { getActiveFestivals, getActiveCategoryIds } from '../../utils/festivalUtils';

export default function FestivalSection({
  festivals = [],
  festivalCategories = [],
  categories = [],
  products = [],
  onNavigateCategory,
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  onQuickView,
  onSelectProduct
}) {
  // Determine active festivals based on today's date
  const activeFestivals = useMemo(() => getActiveFestivals(festivals), [festivals]);

  // Fallback to highest priority festival if no date-active festival exists today
  const displayedFestival = useMemo(() => {
    if (activeFestivals.length > 0) return activeFestivals[0];
    if (festivals.length > 0) {
      return [...festivals].sort((a, b) => (b.priority_val || 0) - (a.priority_val || 0))[0];
    }
    return null;
  }, [activeFestivals, festivals]);

  const isCurrentDateActive = activeFestivals.length > 0;

  // Find linked category IDs
  const activeCategoryIds = useMemo(() => {
    if (!displayedFestival) return new Set();
    return getActiveCategoryIds([displayedFestival], festivalCategories);
  }, [displayedFestival, festivalCategories]);

  // Filter & prioritize products matching the active festival categories
  const festivalProducts = useMemo(() => {
    if (!displayedFestival) return [];
    if (activeCategoryIds.size > 0) {
      const matched = products.filter(p => activeCategoryIds.has(Number(p.category_id || p.categoryId)));
      if (matched.length > 0) return matched;
    }
    // Fallback if no specific products linked yet: pick popular items
    return products.slice(0, 8);
  }, [products, displayedFestival, activeCategoryIds]);

  if (!displayedFestival) return null;

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const startFormatted = formatDateLabel(displayedFestival.start_date);
  const endFormatted = formatDateLabel(displayedFestival.end_date);
  const dateRangeBadge = startFormatted && endFormatted ? `${startFormatted} - ${endFormatted}` : (displayedFestival.timing_2026 || displayedFestival.typical_month || '');

  return (
    <section className="relative w-full py-12 md:py-16 bg-gradient-to-b from-[var(--th-bg)] via-[var(--th-card)]/40 to-[var(--th-bg)] border-y border-[var(--th-border-subtle)] overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[var(--th-accent)]/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--th-accent)]/15 border border-[var(--th-accent)]/30 text-[var(--th-primary)] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[var(--th-accent)]" />
              {isCurrentDateActive ? 'Live Festival Priority' : 'Festive Spotlight'}
              {dateRangeBadge && (
                <>
                  <span className="opacity-40">•</span>
                  <Calendar className="w-3 h-3 text-[var(--th-accent)] ml-0.5" />
                  <span className="text-[var(--th-text-main)] font-semibold">{dateRangeBadge}</span>
                </>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--th-text-main)] tracking-tight">
              {displayedFestival.name} <span className="text-[var(--th-primary)]">Collection</span>
            </h2>
            <p className="mt-1 text-sm sm:text-base text-[var(--th-text-sub)] max-w-2xl">
              {displayedFestival.description || `Handcrafted pure silver items specially prioritized for ${displayedFestival.name}.`}
            </p>
          </div>

          {displayedFestival.category_id && onNavigateCategory && (
            <button
              onClick={() => onNavigateCategory(String(displayedFestival.category_id))}
              className="inline-flex items-center gap-2 self-start md:self-auto text-sm font-bold text-[var(--th-primary)] hover:text-[var(--th-accent)] transition-colors group cursor-pointer"
            >
              <span>Explore All {displayedFestival.name} Offerings</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Products Showcase Grid */}
        {festivalProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {festivalProducts.slice(0, 8).map((product) => {
              const prodId = product.id || product.product_id;
              const isWishlisted = (wishlistIds || []).some(id => String(id) === String(prodId));

              const imgSrc = (Array.isArray(product.images) && product.images.length > 0 && product.images[0])
                ? product.images[0]
                : (product.image_url || product.image || '/images/hero_silver_coins.png');

              return (
                <div
                  key={prodId}
                  className="group relative flex flex-col justify-between bg-[var(--th-card)] rounded-2xl border border-[var(--th-border)] overflow-hidden hover:shadow-xl hover:border-[var(--th-accent)] transition-all duration-300"
                >
                  {/* Image Container with Zoom & Ribbons */}
                  <div className="relative aspect-square overflow-hidden bg-[var(--th-pedestal)]">
                    <img
                      src={imgSrc}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                      onClick={() => onSelectProduct && onSelectProduct(product)}
                    />

                    {/* Festival Special Badge */}
                    <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-10 flex flex-col space-y-1 items-start max-w-[calc(100%-2.75rem)]">
                      <span className="bg-black/90 text-amber-300 border border-amber-400/40 text-[9px] sm:text-[10px] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg uppercase tracking-wider inline-flex items-center gap-1 truncate">
                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 fill-amber-400 shrink-0" />
                        <span className="truncate">
                          {product.purityCode === '999' || (product.purity && String(product.purity).includes('999')) ? '999 PURE' : '925 STERLING'}
                        </span>
                      </span>
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist && onToggleWishlist(product);
                      }}
                      className={`absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
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
                        {product.weightGrams ? `${product.weightGrams}g Pure Silver` : 'Hallmark Certified'} • {product.recipient || product.idealFor || 'Festive Choice'}
                      </p>
                    </div>

                    {/* Price & Action Row */}
                    <div className="pt-3 mt-3 border-t border-[var(--th-border)]/60 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline space-x-1.5">
                          <span className="font-outfit font-bold text-base sm:text-lg text-[var(--th-primary)] tracking-tight">
                            ₹{Number(product.price || 0).toLocaleString('en-IN')}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-[var(--th-text-muted)] line-through font-outfit font-medium">
                              ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
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
        ) : (
          <div className="text-center py-12 rounded-2xl border border-dashed border-[var(--th-border)] bg-[var(--th-card)]/30">
            <ShoppingBag className="w-10 h-10 mx-auto text-[var(--th-accent)] opacity-60 mb-2" />
            <p className="text-sm font-semibold text-[var(--th-text-main)]">
              Discover sacred silver items for {displayedFestival.name}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

