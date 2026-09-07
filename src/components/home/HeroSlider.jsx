import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Shield, ArrowRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    tag: "FESTIVE & HOME PUJA COLLECTION",
    title: "Sacred Pure Silver Murti for Divine Blessings",
    subtitle: "Handcrafted 925 & 999 Pure Silver Idols of Lord Ganesha & Goddess Lakshmi. BIS Hallmarked with Anti-Tarnish Protection.",
    ctaText: "Explore Silver Murti",
    categoryId: "silver-religious-idols",
    bgImage: "/images/hero_silver_idols.png",
    badge: "100% Pure Hallmarked"
  },
  {
    id: 2,
    tag: "EXCLUSIVE NEWBORN GIFTING",
    title: "Protective Silver Nazariya & Bangles for Babies",
    subtitle: "Keep your little ones safe with hypoallergenic 925 sterling silver bracelets, black beads & jingling ghungroo bangles.",
    ctaText: "Shop Kids Collection",
    categoryId: "kids-nazariya-bracelets",
    bgImage: "/images/hero_baby_nazariya.png",
    badge: "Hypoallergenic 925"
  },
  {
    id: 3,
    tag: "HANDCRAFTED PERSONALIZED ART",
    title: "Custom Made-On-Order Yatra Shrine Lockets",
    subtitle: "Preserve your sacred pilgrimage memories. Encase your deity photo and family gotra engraving in solid 925 sterling silver.",
    ctaText: "Customize Your Locket",
    categoryId: "custom-gifting",
    bgImage: "/images/hero_yatra_locket.png",
    badge: "Made On Order"
  }
];

export default function HeroSlider({ onNavigateCategory, onNavigateYatraCustomizer }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  const slide = SLIDES[currentSlide];

  return (
    <div className="relative w-full h-[300px] sm:h-[350px] md:h-[390px] lg:h-[420px] bg-gradient-to-r from-[#071526] via-[#0B2545] to-[#143A66] overflow-hidden border-b-2 border-[#D4AF37]/40">
      {/* Background Image without shadow overlay */}
      {SLIDES.map((item, idx) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
        >
          <img
            src={item.bgImage}
            alt={item.title}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.src = '/images/hero_silver_idols.png';
            }}
          />
        </div>
      ))}

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto h-full px-6 lg:px-8 flex items-center z-10 pointer-events-none">
        <div className="max-w-2xl text-white space-y-2.5 sm:space-y-3 bg-[#0B2545]/80 backdrop-blur-md p-5 sm:p-7 rounded-2xl border border-[#D4AF37]/30 pointer-events-auto">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-[#D4AF37]/50 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
              {slide.tag}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold tracking-tight leading-snug text-silver-50">
            {slide.title}
          </h1>

          <p className="text-xs sm:text-sm text-silver-300 font-normal max-w-lg leading-relaxed line-clamp-2">
            {slide.subtitle}
          </p>

          <div className="pt-2 sm:pt-3 flex flex-wrap gap-3 sm:gap-4 items-center">
            <button
              onClick={() => {
                if (slide.categoryId === "custom-gifting") {
                  onNavigateYatraCustomizer();
                } else {
                  onNavigateCategory(slide.categoryId);
                }
              }}
              className="px-6 py-2.5 sm:px-7 sm:py-3 bg-gradient-to-r from-[#D4AF37] to-[#AA820A] hover:from-[#E6CA65] hover:to-[#D4AF37] text-black font-bold text-xs sm:text-sm rounded-lg transition-all flex items-center space-x-2 group cursor-pointer"
            >
              <span>{slide.ctaText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center space-x-2 text-[11px] sm:text-xs text-silver-300 border-l border-white/20 pl-3 sm:pl-4 py-1.5">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              <span>{slide.badge}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slider Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-white text-white hover:text-black transition-all border border-white/20"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-white text-white hover:text-black transition-all border border-white/20"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-white/40 hover:bg-white'
              }`}
          />
        ))}
      </div>
    </div>
  );
}
