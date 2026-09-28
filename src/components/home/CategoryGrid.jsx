import React from 'react';
import { CATEGORIES } from '../../data/products';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CategoryGrid({ categories, onSelectCategory }) {
  const categoryList = (categories && categories.length > 0) ? categories : CATEGORIES;

  return (
    <section className="py-16 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#AA820A] tracking-widest uppercase bg-[#D4AF37]/10 px-3 py-1 rounded-full inline-block mb-3">
            PURE SILVER COLLECTIONS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
            Sacred Categories & Artifacts
          </h2>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mt-3 mb-4" />
          <p className="text-sm text-silver-600">
            From 999 investment coins and hallmarked murti idols to protective baby nazariya and custom shrine lockets.
          </p>
        </div>

        {/* Category Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryList.map((category) => (
            <div
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className="group relative h-96 rounded-2xl overflow-hidden silver-card-shadow cursor-pointer border border-silver-200 bg-white"
            >
              {/* Background Image */}
              <img
                src={category.image_url || category.image || category.heroBanner || '/images/placeholder.svg'}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

              {/* Top Purity Badge Tag */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-white/90 backdrop-blur-md text-[#1A1A1A] text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  <span>BIS Hallmarked</span>
                </span>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 inset-x-0 p-6 z-10 text-white flex flex-col justify-end">
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
                  {Array.isArray(category.subcategories) ? category.subcategories.length : 1} Collections
                </span>
                <h3 className="font-serif text-2xl font-bold mb-2 group-hover:text-[#D4AF37] transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-silver-300 line-clamp-2 mb-4 font-normal">
                  {category.description}
                </p>

                <div className="flex items-center text-xs font-semibold text-[#D4AF37] group-hover:translate-x-1 transition-transform">
                  <span>Browse Category</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
