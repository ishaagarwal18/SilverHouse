import React from 'react';
import { TESTIMONIALS } from '../../data/products';
import { Star, ShieldCheck, Quote, Sparkles } from 'lucide-react';

export default function Testimonials() {
  return (
    <section className="py-16 sm:py-20 bg-[#FAF5EB] border-b border-[#DFCBB5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="flex items-center justify-center space-x-2 text-[#AA820A] mb-1">
            <Sparkles className="w-4 h-4 text-[#AA820A]" />
            <span className="text-xs font-bold text-[#AA820A] tracking-[0.2em] uppercase bg-[#AA820A]/15 px-3.5 py-1 rounded-full inline-block border border-[#AA820A]/30">
              VERIFIED PATRON REVIEWS
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A0711] mt-2">
            Loved by 50,000+ Patrons Across India
          </h2>
          <div className="w-16 h-0.5 bg-[#AA820A] mx-auto mt-3 mb-4" />
          <p className="text-xs sm:text-sm text-[#7A5844] font-sans">
            Hear from families and connoisseurs who treasure authentic SilverHouse craftsmanship.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((review) => (
            <div
              key={review.id}
              className="p-6 sm:p-7 rounded-2xl bg-[#FFFDF9] border border-[#DFCBB5] shadow-xs hover:border-[#AA820A] hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              <div>
                <Quote className="w-8 h-8 text-[#AA820A]/30 mb-2" />
                
                {/* Rating */}
                <div className="flex items-center space-x-1 text-[#AA820A] mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="text-xs font-bold text-[#301D17] ml-2">{review.date}</span>
                </div>

                <p className="text-xs sm:text-[13px] text-[#5C4538] leading-relaxed italic mb-6">
                  "{review.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#F0E6D6] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#AA820A]"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[#301D17]">{review.name}</h4>
                    <span className="text-[10px] text-[#8A766B]">{review.location}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 mr-1 text-emerald-700" />
                    Verified Buyer
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
