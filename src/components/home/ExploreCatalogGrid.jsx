import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, Sparkles, ArrowRight } from 'lucide-react';

export default function ExploreCatalogGrid({
  products = [],
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  onQuickView,
  onSelectProduct,
  onNavigateCategory
}) {
  // Ensure we have exactly 16 products for the 4x4 desktop / 2x8 mobile grid
  let catalog16 = [...products];

  // If fewer than 16 items, repeat or pad
  if (catalog16.length > 0 && catalog16.length < 16) {
    while (catalog16.length < 16) {
      catalog16 = catalog16.concat(products);
    }
  }
  catalog16 = catalog16.slice(0, 16);

  return (
    <section className="py-14 sm:py-16 bg-[#F2EAE0] border-b border-[#DFCBB5]">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center space-x-2 text-[#AA820A] mb-1">
            <Sparkles className="w-4 h-4 text-[#AA820A]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A5844]">
              MASTER TREASURE VAULT
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A0711] tracking-wide uppercase">
            EXPLORE THE COLLECTION
          </h2>
          <div className="w-16 h-0.5 bg-[#AA820A] mx-auto mt-2.5 mb-3" />
          <p className="text-xs sm:text-sm text-[#7A5844] font-sans">
            Every creation is cast in authentic 925 sterling or 999 fine silver, certified by hallmark assay laboratories.
          </p>
        </div>

        {/* 16-Product Responsive Grid (4x4 on Desktop, 2x8 on Mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {catalog16.map((product, index) => {
            const isWishlisted = wishlistIds.includes(product.id);
            const imgSrc = (Array.isArray(product.images) && product.images.length > 0 && product.images[0])
              ? product.images[0]
              : '/images/hero_silver_coins.png';

            const rawDiscount = product.originalPrice && product.price
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;
            const discountPercent = rawDiscount > 0 ? rawDiscount : 15;

            return (
              <div
                key={`${product.id}-${index}`}
                className="group relative flex flex-col justify-between bg-[#FFFDF9] rounded-2xl border border-[#DFCBB5] overflow-hidden hover:shadow-xl hover:border-[#AA820A] transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-[#F4EFE6]">
                  <img
                    src={imgSrc}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => onSelectProduct && onSelectProduct(product)}
                  />

                  {/* Bestseller Badge or Discount Ribbon */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                    {product.isBestSeller && (
                      <span className="bg-[#4A0711] text-[#F3E5AB] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm border border-[#D4AF37]/30">
                        Bestseller
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="bg-[#AA820A] text-[#2D0207] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        Save {discountPercent}%
                      </span>
                    )}
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
                        : 'bg-[#FAF5EB]/90 text-[#7A5844] hover:text-[#4A0711] hover:bg-[#FAF5EB] shadow-xs border border-[#DFCBB5]'
                    }`}
                    title="Save to Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-700' : ''}`} />
                  </button>

                  {/* Quick View Button */}
                  <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
                    <button
                      onClick={() => onQuickView && onQuickView(product)}
                      className="w-full py-2 bg-[#FAF5EB]/95 backdrop-blur-xs text-[#4A0711] text-xs font-bold rounded-xl shadow-md hover:bg-[#4A0711] hover:text-[#F3E5AB] transition-colors uppercase tracking-wider border border-[#DFCBB5] cursor-pointer"
                    >
                      Quick View
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-[#FFFDF9]">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#7A5844] mb-1">
                      <span className="font-bold text-[#AA820A] uppercase tracking-wider truncate">
                        {product.purity || '925 Fine Silver'}
                      </span>
                      <div className="flex items-center space-x-1 text-[#AA820A] shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-bold text-xs text-[#301D17]">{product.rating || 4.9}</span>
                        <span className="text-[10px] text-[#8A766B]">({product.reviewsCount || 28})</span>
                      </div>
                    </div>

                    <h3
                      onClick={() => onSelectProduct && onSelectProduct(product)}
                      className="font-serif text-sm sm:text-base font-bold text-[#301D17] group-hover:text-[#4A0711] transition-colors line-clamp-1 cursor-pointer"
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#F0E6D6] flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="font-serif font-extrabold text-base sm:text-lg text-[#4A0711]">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-[#8A766B] line-through font-medium">
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
                      className="w-9 h-9 rounded-full bg-[#4A0711]/10 hover:bg-[#4A0711] text-[#4A0711] hover:text-[#F3E5AB] flex items-center justify-center transition-colors duration-200 cursor-pointer shrink-0 border border-[#4A0711]/20 shadow-xs"
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

        {/* Centered Explore Entire Catalog Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => onNavigateCategory && onNavigateCategory('all')}
            className="px-8 py-3.5 rounded-full border-2 border-[#4A0711] text-[#4A0711] font-serif text-xs font-bold tracking-widest uppercase hover:bg-[#4A0711] hover:text-[#F3E5AB] transition-all duration-300 inline-flex items-center space-x-2.5 shadow-sm hover:shadow-lg cursor-pointer"
          >
            <span>EXPLORE ENTIRE 500+ SILVER CATALOG</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
