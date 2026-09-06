import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, MapPin, Truck, Award } from 'lucide-react';

const ANNOUNCEMENTS = [
  { text: "100% BIS HALLMARKED 925 STERLING & 999 PURE SILVER", icon: Award },
  { text: "FREE INSURED EXPRESS DELIVERY ACROSS INDIA ON ALL ORDERS", icon: Truck },
  { text: "LIFETIME RE-POLISHING & 15-DAY HASSLE-FREE RETURNS", icon: Sparkles },
  { text: "CUSTOM ENGRAVED YATRA LOCKETS & BULLION BARS MADE ON ORDER", icon: Sparkles }
];

export default function AnnouncementBar({ onNavigateCategory, onOpenStoresModal }) {
  const [index, setIndex] = useState(0);

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = ANNOUNCEMENTS[index];
  const Icon = current.icon;

  return (
    <div className="bg-gradient-to-r from-[#2D0207] via-[#4A0711] to-[#2D0207] text-[#F3E5AB] py-2 px-4 select-none border-b border-[#D4AF37]/30 shadow-xs relative z-50">
      <div className="max-w-[1480px] mx-auto flex items-center justify-between text-[11px] sm:text-xs">
        
        {/* Left Side: Live Silver Bullion Ticker */}
        <div className="hidden lg:flex items-center space-x-2.5 text-[#F5E6BF]">
          <span className="inline-flex items-center space-x-1.5 bg-[#600814] px-2.5 py-0.5 rounded-full border border-[#D4AF37]/40 text-[10px] font-bold tracking-wider uppercase text-[#FFFDF9]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Silver Rate</span>
          </span>
          <span className="font-semibold text-[11px] text-[#EADFCB]">
            925: <strong className="text-white">₹98.5/g</strong> | 999: <strong className="text-white">₹105.2/g</strong>
          </span>
        </div>

        {/* Center: Rotating Core Value Announcement */}
        <div className="flex-1 flex items-center justify-center space-x-3 sm:space-x-4">
          <button 
            onClick={handlePrev}
            className="text-[#D4AF37] hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div 
            onClick={() => onNavigateCategory && onNavigateCategory("all")}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <Icon className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-widest uppercase text-white/95 group-hover:text-[#F3E5AB] transition-colors text-[10.5px] sm:text-xs text-center truncate max-w-[280px] sm:max-w-none">
              {current.text}
            </span>
          </div>

          <button 
            onClick={handleNext}
            className="text-[#D4AF37] hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            aria-label="Next announcement"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Side: Quick Links */}
        <div className="hidden md:flex items-center space-x-4 text-[11px] text-[#EADFCB]">
          <span className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigateCategory && onNavigateCategory("all")}>
            Track Order
          </span>
          <span className="text-[#D4AF37]/40">•</span>
          <span className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigateCategory && onNavigateCategory("silver-coins-bars")}>
            999 Bullion
          </span>
          <span className="text-[#D4AF37]/40">•</span>
          <span className="hover:text-white transition-colors cursor-pointer font-semibold text-[#F3E5AB]" onClick={() => onNavigateCategory && onNavigateCategory("all")}>
            Purity Guarantee
          </span>
        </div>

      </div>
    </div>
  );
}
