import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CuratedCollections({ onNavigateCategory }) {
  const COLLECTIONS = [
    {
      id: 'women',
      title: "Celebrate Her Strength in Silver",
      subtitle: "Oxidised 925 Silver Jewellery Collection",
      tag: "FOR HER",
      image: "/images/women_oxidised_collection.jpg",
      category: "women",
      ctaText: "EXPLORE WOMEN"
    },
    {
      id: 'men',
      title: "Timeless Men's Sterling Heritage",
      subtitle: "Solid Royal Kadas, Cuban Chains & Rings",
      tag: "FOR HIM",
      image: "/uploads/316_royal_men_silver_kada.jpg",
      category: "mens",
      ctaText: "EXPLORE MEN"
    },
    {
      id: 'kids',
      title: "Charming Kid's Pure Silver Charms",
      subtitle: "Protective Nazariya, Baby Kadas & Ghungroo",
      tag: "FOR LITTLE ONES",
      image: "/images/hero_baby_nazariya.png",
      category: "kids",
      ctaText: "EXPLORE KIDS"
    }
  ];

  return (
    <section className="py-14 sm:py-16 bg-[#F2EAE0] border-b border-[#DFCBB5]">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center space-x-2 text-[#AA820A] mb-2">
            <Sparkles className="w-4 h-4 text-[#AA820A]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A5844]">
              HANDCRAFTED FOR EVERY GENERATION
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A0711] tracking-wide">
            CURATED FOR YOUR LOVED ONES
          </h2>
          <div className="w-16 h-0.5 bg-[#AA820A] mx-auto mt-2.5 mb-3" />
          <p className="text-xs sm:text-sm text-[#7A5844] font-sans">
            Timeless 925 sterling silver gifts designed to honor life's most cherished relationships.
          </p>
        </div>

        {/* 3 Showcase Banner Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {COLLECTIONS.map((col) => (
            <div
              key={col.id}
              onClick={() => onNavigateCategory && onNavigateCategory(col.category)}
              className="group relative h-[360px] sm:h-[400px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border-2 border-[#DFCBB5] hover:border-[#AA820A] transition-all duration-500 cursor-pointer flex flex-col justify-end p-6 sm:p-7"
            >
              {/* Background Image */}
              <img
                src={col.image}
                alt={col.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 transition-all" />

              {/* Top Audience Pill Badge */}
              <div className="absolute top-6 left-6 z-10">
                <span className="bg-[#4A0711] text-[#F3E5AB] text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-md border border-[#D4AF37]/40">
                  {col.tag}
                </span>
              </div>

              {/* Bottom Content Card Details */}
              <div className="relative z-10 text-white flex flex-col items-start">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-2 text-[#FFFDF9] group-hover:text-[#F3E5AB] transition-colors leading-snug">
                  {col.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#DFCBB5] font-sans mb-5 line-clamp-2">
                  {col.subtitle}
                </p>

                {/* Elegant White Border CTA Button */}
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-full border-2 border-[#FAF5EB] text-[#FAF5EB] font-serif text-xs font-bold tracking-widest uppercase hover:bg-[#FAF5EB] hover:text-[#4A0711] transition-all duration-300 flex items-center space-x-2 group-hover:shadow-lg cursor-pointer"
                >
                  <span>{col.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
