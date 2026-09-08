import React from 'react';
import { TESTIMONIALS } from '../../data/products';
import { Star, ShieldCheck, Quote, Sparkles } from 'lucide-react';

export default function Testimonials() {
  return (
    <section className="py-16 sm:py-20 bg-[var(--th-bg)] border-b border-[var(--th-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="flex items-center justify-center space-x-2 text-[var(--th-accent)] mb-1">
            <Sparkles className="w-4 h-4 text-[var(--th-accent)]" />
            <span className="text-xs font-bold text-[var(--th-accent)] tracking-[0.2em] uppercase bg-[var(--th-accent)]/15 px-3.5 py-1 rounded-full inline-block border border-[var(--th-accent)]/30">
              VERIFIED CUSTOMER REVIEWS
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--th-text-main)] mt-2">
            Loved by 50,000+ People Across India
          </h2>
          <div className="w-16 h-0.5 bg-[var(--th-accent)] mx-auto mt-3 mb-4" />
          <p className="text-xs sm:text-sm text-[var(--th-text-muted)] font-sans">
            Hear from families and connoisseurs who treasure authentic SilverHouse craftsmanship.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((review) => (
            <div
              key={review.id}
              className="p-6 sm:p-7 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] shadow-xs hover:border-[var(--th-accent)] hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              <div>
                <Quote className="w-8 h-8 text-[var(--th-accent)]/40 mb-2" />
                
                {/* Rating */}
                <div className="flex items-center space-x-1 text-[var(--th-accent)] mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="text-xs font-bold text-[var(--th-text-main)] ml-2">{review.date}</span>
                </div>

                <p className="text-xs sm:text-[13px] text-[var(--th-text-main)] leading-relaxed italic mb-6">
                  "{review.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--th-border)]/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-10 h-10 rounded-full object-cover border border-[var(--th-accent)]"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[var(--th-text-main)]">{review.name}</h4>
                    <span className="text-[10px] text-[var(--th-text-muted)]">{review.location}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
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
