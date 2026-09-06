import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, Sparkles } from 'lucide-react';

export default function SegmentedTabsShowcase({
  products = [],
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  onQuickView,
  onSelectProduct
}) {
  const [activeTab, setActiveTab] = useState('men');

  const TABS = [
    {
      id: 'men',
      label: 'For Men',
      filter: (p) => {
        const cat = (p.category || '').toLowerCase();
        const ideal = (p.ideal_for || p.idealFor || '').toLowerCase();
        return cat.includes('men') || ideal.includes('men');
      }
    },
    {
      id: 'women',
      label: 'For Women',
      filter: (p) => {
        const cat = (p.category || '').toLowerCase();
        const ideal = (p.ideal_for || p.idealFor || '').toLowerCase();
        return cat.includes('ring') || cat.includes('payal') || cat.includes('pendant') || cat.includes('women') || ideal.includes('women');
      }
    },
    {
      id: 'kids',
      label: 'For Kids',
      filter: (p) => {
        const cat = (p.category || '').toLowerCase();
        const ideal = (p.ideal_for || p.idealFor || '').toLowerCase();
        return cat.includes('kid') || cat.includes('baby') || cat.includes('nazariya') || ideal.includes('kids');
      }
    }
  ];

  const currentTabObj = TABS.find(t => t.id === activeTab) || TABS[0];
  let items = products.filter(currentTabObj.filter);

  // Fallback if filter has few items
  if (items.length === 0) {
    items = products.slice(0, 4);
  } else {
    items = items.slice(0, 4);
  }

  return (
    <section className="py-14 sm:py-16 bg-[#F2EAE0] border-b border-[#DFCBB5]">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Segmented Tabs Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#DFCBB5] gap-6">
          <div>
            <div className="flex items-center space-x-2 text-[#AA820A] mb-1">
              <Sparkles className="w-4 h-4 text-[#AA820A]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A5844]">
                TAILORED EXCELLENCE
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A0711] tracking-tight">
              SEGMENTED SHOWCASE
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5844] mt-1 font-sans">
              Switch effortlessly between distinct handcrafted styles.
            </p>
          </div>

          {/* Segmented Interactive Buttons */}
          <div className="inline-flex p-1.5 rounded-full bg-[#E5DAC4] border border-[#DFCBB5]">
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#4A0711] text-[#F3E5AB] shadow-md border border-[#D4AF37]/30'
                      : 'text-[#4A0711] hover:bg-[#FAF5EB]/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Responsive Product Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);
            const imgSrc = (Array.isArray(product.images) && product.images.length > 0 && product.images[0])
              ? product.images[0]
              : '/images/hero_silver_coins.png';

            return (
              <div
                key={product.id}
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
                    <span className="font-serif font-extrabold text-base sm:text-lg text-[#4A0711]">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </span>

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
