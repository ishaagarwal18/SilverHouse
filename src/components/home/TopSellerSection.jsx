import React from 'react';
import { Heart, ShoppingBag, Star, Sparkles, ArrowRight } from 'lucide-react';

export default function TopSellerSection({
  products = [],
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  onQuickView,
  onSelectProduct,
  onNavigateCategory
}) {
  // Filter top sellers or bestsellers, or take first 8 items
  const topSellers = products.filter(p => p.isBestSeller || p.priority >= 50 || p.rating >= 4.8).slice(0, 8);

  return (
    <section className="py-14 sm:py-16 bg-[#FAF5EB] border-b border-[#DFCBB5]">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 pb-4 border-b border-[#E5DAC4] gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[#AA820A] mb-1">
              <Sparkles className="w-4 h-4 text-[#AA820A]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A5844]">
                MOST LOVED CREATIONS
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A0711] tracking-tight">
              TOP SELLERS
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5844] mt-1 font-sans">
              Discover authentic fine silver creations most celebrated by our patrons.
            </p>
          </div>

          <button
            onClick={() => onNavigateCategory && onNavigateCategory('all')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full border-2 border-[#4A0711] text-[#4A0711] hover:bg-[#4A0711] hover:text-[#F3E5AB] transition-all text-xs font-bold uppercase tracking-wider group cursor-pointer shadow-2xs"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {topSellers.map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);
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
                className="group relative flex flex-col justify-between bg-[#FFFDF9] rounded-2xl border border-[#DFCBB5] overflow-hidden hover:shadow-xl hover:border-[#AA820A] transition-all duration-300"
              >
                {/* Image Container with Zoom & Ribbons */}
                <div className="relative aspect-square overflow-hidden bg-[#F4EFE6]">
                  <img
                    src={imgSrc}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => onSelectProduct && onSelectProduct(product)}
                  />

                  {/* Discount Ribbon Tag */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-[#4A0711] text-[#F3E5AB] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center space-x-1 border border-[#D4AF37]/30">
                      <span>Save {discountPercent}%</span>
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
                        : 'bg-[#FAF5EB]/90 text-[#7A5844] hover:text-[#4A0711] hover:bg-[#FAF5EB] shadow-xs border border-[#DFCBB5]'
                    }`}
                    title="Save to Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-700' : ''}`} />
                  </button>

                  {/* Quick View Button on Hover */}
                  <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
                    <button
                      onClick={() => onQuickView && onQuickView(product)}
                      className="w-full py-2 bg-[#FAF5EB]/95 backdrop-blur-xs text-[#4A0711] text-xs font-bold rounded-xl shadow-md hover:bg-[#4A0711] hover:text-[#F3E5AB] transition-colors uppercase tracking-wider border border-[#DFCBB5] cursor-pointer"
                    >
                      Quick View
                    </button>
                  </div>
                </div>

                {/* Product Meta Details */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-[#FFFDF9]">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#7A5844] mb-1">
                      <span className="font-bold text-[#AA820A] uppercase tracking-wider truncate">
                        {product.purity || '925 Fine Silver'}
                      </span>
                      <div className="flex items-center space-x-1 text-[#AA820A] shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-bold text-xs text-[#301D17]">{product.rating || 4.9}</span>
                        <span className="text-[10px] text-[#8A766B]">({product.reviewsCount || 42})</span>
                      </div>
                    </div>

                    {/* Product Title */}
                    <h3
                      onClick={() => onSelectProduct && onSelectProduct(product)}
                      className="font-serif text-sm sm:text-base font-bold text-[#301D17] group-hover:text-[#4A0711] transition-colors line-clamp-1 cursor-pointer"
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                    
                    <p className="text-[11px] text-[#7A5844] font-medium mt-0.5 line-clamp-1">
                      {product.weightGrams ? `${product.weightGrams}g Pure Silver` : 'Hallmark Certified'} • {product.idealFor || 'Authentic'}
                    </p>
                  </div>

                  {/* Price & Action Row */}
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
                      <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block -mt-0.5">
                        In Stock • Express Dispatch
                      </span>
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
      </div>
    </section>
  );
}
