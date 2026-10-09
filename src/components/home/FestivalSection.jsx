import React, { useMemo, useState } from 'react';
import { Calendar, Sparkles, ShoppingBag, ArrowRight, Star, Heart, Eye, Filter, Tag, CheckCircle2 } from 'lucide-react';
import { getActiveCategoryIds, getDisplayedFestival, isFestivalActive } from '../../utils/festivalUtils';

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
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Determine active/displayed festival according to start_date and end_date columns
  const displayedFestival = useMemo(() => {
    return getDisplayedFestival(festivals);
  }, [festivals]);

  const isCurrentDateActive = useMemo(() => {
    return displayedFestival ? isFestivalActive(displayedFestival) : false;
  }, [displayedFestival]);

  // Find category IDs linked to that particular festival via festival_category junction
  const activeCategoryIds = useMemo(() => {
    if (!displayedFestival) return new Set();
    return getActiveCategoryIds([displayedFestival], festivalCategories, categories);
  }, [displayedFestival, festivalCategories, categories]);

  // Full category objects linked to this festival
  const linkedCategoryObjects = useMemo(() => {
    if (!displayedFestival || activeCategoryIds.size === 0) return [];
    return categories.filter(c => activeCategoryIds.has(Number(c.category_id || c.id)));
  }, [displayedFestival, activeCategoryIds, categories]);

  // Filter products matching the categories linked to that specific festival
  const festivalProducts = useMemo(() => {
    if (!displayedFestival) return [];
    if (activeCategoryIds.size > 0) {
      let matched = products.filter(p => {
        const pCatId = Number(p.category_id || p.categoryId);
        if (!isNaN(pCatId) && activeCategoryIds.has(pCatId)) return true;

        // String / category name fallback matching
        const pCatStr = String(p.category_id || p.categoryId || p.category_name || p.category || '').toLowerCase().trim();
        for (const catId of activeCategoryIds) {
          const matchingCat = categories.find(c => Number(c.category_id || c.id) === catId);
          if (matchingCat) {
            if (String(matchingCat.name || '').toLowerCase().trim() === pCatStr) return true;
            if (String(matchingCat.slug || '').toLowerCase().trim() === pCatStr) return true;
          }
        }
        return false;
      });

      // Filter further if user clicked a specific category pill inside the section
      if (selectedCategoryFilter !== 'all') {
        const targetId = Number(selectedCategoryFilter);
        matched = matched.filter(p => Number(p.category_id || p.categoryId) === targetId);
      }

      if (matched.length > 0) return matched;
    }
    // Fallback if no specific products linked yet: pick popular items
    return products.slice(0, 8);
  }, [products, displayedFestival, activeCategoryIds, categories, selectedCategoryFilter]);

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
  const dateRangeBadge = startFormatted && endFormatted ? `${startFormatted} – ${endFormatted}` : '';

  return (
    <section className="relative w-full py-14 md:py-20 bg-gradient-to-b from-[var(--th-bg)] via-amber-500/5 to-[var(--th-bg)] border-y border-amber-500/20 overflow-hidden">
      {/* Background Festive Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-[var(--th-primary)]/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--th-text-main)] tracking-tight font-serif">
              {displayedFestival.name}{' '}
              <span className="bg-gradient-to-r from-amber-500 via-[var(--th-primary)] to-amber-600 bg-clip-text text-transparent">
                Special Collection
              </span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[var(--th-text-sub)] max-w-2xl font-sans">
              {displayedFestival.description || `Explore auspicious pure 925 sterling & 999 fine silver offerings curated specially for ${displayedFestival.name}.`}
            </p>
          </div>

          {onNavigateCategory && (
            <button
              onClick={() => onNavigateCategory('all')}
              className="inline-flex items-center gap-2 self-start lg:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[var(--th-primary)] text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group cursor-pointer"
            >
              <span>Explore All {displayedFestival.name} Items</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Linked Category Filter Tabs */}
        {linkedCategoryObjects.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            <span className="text-xs font-bold text-[var(--th-text-muted)] uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              Linked Categories:
            </span>
            <button
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 border ${selectedCategoryFilter === 'all'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-[var(--th-card)] text-[var(--th-text-sub)] border-[var(--th-border)] hover:border-amber-400'
                }`}
            >
              All Festive Items ({festivalProducts.length})
            </button>
            {linkedCategoryObjects.map((cat) => {
              const catId = Number(cat.category_id || cat.id);
              const isSelected = selectedCategoryFilter === String(catId);
              return (
                <button
                  key={catId}
                  onClick={() => setSelectedCategoryFilter(String(catId))}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 border inline-flex items-center gap-1.5 ${isSelected
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-[var(--th-card)] text-[var(--th-text-sub)] border-[var(--th-border)] hover:border-amber-400'
                    }`}
                >
                  <Tag className="w-3 h-3 opacity-70" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Products Showcase Grid */}
        {festivalProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {festivalProducts.slice(0, 8).map((product) => {
              const prodId = product.id || product.product_id;
              const isWishlisted = (wishlistIds || []).some(id => String(id) === String(prodId));

              const imgSrc = (Array.isArray(product.images) && product.images.length > 0 && product.images[0])
                ? product.images[0]
                : (product.image_url || product.image || '/images/hero_silver_coins.png');

              const hasDiscount = product.originalPrice && product.originalPrice > product.price;
              const discountPercent = hasDiscount
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;

              return (
                <div
                  key={prodId}
                  className="group relative flex flex-col justify-between bg-[var(--th-card)] rounded-2xl border border-[var(--th-border)] overflow-hidden hover:shadow-2xl hover:border-amber-400/60 transition-all duration-300"
                >
                  {/* Image Container with Zoom & Ribbons */}
                  <div className="relative aspect-square overflow-hidden bg-[var(--th-pedestal)]">
                    <img
                      src={imgSrc}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 cursor-pointer"
                      onClick={() => onSelectProduct && onSelectProduct(product)}
                    />

                    {/* Festival Purity Ribbon */}
                    <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-10 flex flex-col space-y-1 items-start max-w-[calc(100%-2.75rem)]">
                      <span className="bg-gradient-to-r from-amber-600 to-amber-500 text-white text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider inline-flex items-center gap-1 truncate border border-amber-300/30">
                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white fill-white shrink-0 animate-pulse" />
                        <span className="truncate">
                          {product.purityCode === '999' || (product.purity && String(product.purity).includes('999')) ? '999 PURE SILVER' : '925 STERLING'}
                        </span>
                      </span>

                      {hasDiscount && (
                        <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist && onToggleWishlist(product);
                      }}
                      className={`absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-10 w-8.5 h-8.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${isWishlisted
                        ? 'bg-rose-100 text-rose-600 shadow-md border border-rose-300'
                        : 'bg-[var(--th-card)]/90 text-[var(--th-text-muted)] hover:text-rose-600 hover:bg-[var(--th-card)] shadow-xs border border-[var(--th-border)]'
                        }`}
                      title="Save to Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-600' : ''}`} />
                    </button>

                    {/* Quick View Button on Hover */}
                    <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
                      <button
                        onClick={() => onQuickView && onQuickView(product)}
                        className="w-full py-2 bg-[var(--th-card)]/95 backdrop-blur-md text-[var(--th-primary)] text-xs font-bold rounded-xl shadow-lg hover:bg-amber-500 hover:text-white transition-colors uppercase tracking-wider border border-[var(--th-border)] cursor-pointer"
                      >
                        Quick View
                      </button>
                    </div>
                  </div>

                  {/* Product Meta Details */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-[var(--th-card)]">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-[var(--th-text-muted)] mb-1.5">
                        <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider truncate flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-amber-500 shrink-0" />
                          {product.purity || '925 Fine Silver'}
                        </span>
                        <div className="flex items-center space-x-1 text-amber-500 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold text-xs text-[var(--th-text-main)]">{product.rating || 4.9}</span>
                        </div>
                      </div>

                      {/* Product Title */}
                      <h3
                        onClick={() => onSelectProduct && onSelectProduct(product)}
                        className="font-serif text-sm sm:text-base font-bold text-[var(--th-text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      <p className="text-[11px] text-[var(--th-text-muted)] font-medium mt-0.5 line-clamp-1">
                        {product.weightGrams ? `${product.weightGrams}g Pure Silver` : 'BIS Hallmark Certified'} • {product.recipient || product.idealFor || 'Auspicious Choice'}
                      </p>
                    </div>

                    {/* Price & Action Row */}
                    <div className="pt-3 mt-3 border-t border-[var(--th-border)]/60 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline space-x-1.5">
                          <span className="font-outfit font-bold text-base sm:text-lg text-[var(--th-primary)] tracking-tight">
                            ₹{Number(product.price || 0).toLocaleString('en-IN')}
                          </span>
                          {hasDiscount && (
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
                        className="w-9 h-9 rounded-full bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white flex items-center justify-center transition-colors duration-200 cursor-pointer shrink-0 border border-amber-500/30 shadow-xs"
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
          <div className="text-center py-14 rounded-2xl border border-dashed border-amber-500/30 bg-[var(--th-card)]/40 backdrop-blur-xs">
            <ShoppingBag className="w-12 h-12 mx-auto text-amber-500 opacity-70 mb-3 animate-bounce" />
            <p className="text-base font-bold text-[var(--th-text-main)] font-serif">
              Discover sacred silver items for {displayedFestival.name}
            </p>
            <p className="text-xs text-[var(--th-text-sub)] mt-1">
              Check back soon as new pure silver items are added to this collection.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}


