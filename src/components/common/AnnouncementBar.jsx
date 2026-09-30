import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, MapPin, Truck, Award, ExternalLink } from 'lucide-react';

const ANNOUNCEMENTS = [
  { text: "100% BIS HALLMARKED 925 STERLING & 999 PURE SILVER", icon: Award },
  { text: "FREE INSURED EXPRESS DELIVERY ACROSS INDIA ON ALL ORDERS", icon: Truck },
  { text: "LIFETIME RE-POLISHING & 15-DAY HASSLE-FREE RETURNS", icon: Sparkles },
  { text: "CUSTOM ENGRAVED YATRA LOCKETS & BULLION BARS MADE ON ORDER", icon: Sparkles }
];

export default function AnnouncementBar({ onNavigateCategory, onOpenStoresModal, storeParams, onOpenPdf }) {
  const [index, setIndex] = useState(0);

  const rate925 = 81.86;
  const rate999 = 88.50;
  // Dynamic celebration message fetched directly from store_parameter.current_festival
  const customAnnouncement = storeParams?.current_festival
    ? `✨ ${storeParams.current_festival} Festive Special: Celebrate with Pure 925 Sterling & 999 Bullion Silver Collections`
    : null;

  const announcements = React.useMemo(() => {
    if (customAnnouncement) {
      return [{ text: customAnnouncement, icon: Sparkles }, ...ANNOUNCEMENTS];
    }
    return ANNOUNCEMENTS;
  }, [customAnnouncement]);

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % announcements.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const current = announcements[index % announcements.length] || announcements[0];
  const Icon = current.icon;

  return (
    <div className="py-2 px-4 select-none border-b border-[var(--th-accent)]/30 shadow-xs relative z-50 text-[var(--th-card)] transition-colors duration-300" style={{ background: 'var(--th-nav-gradient)' }}>
      <div className="max-w-[1480px] mx-auto flex items-center justify-between text-[11px] sm:text-xs">
        
        {/* Left Side: Live Silver Bullion Ticker */}
        <div className="hidden lg:flex items-center space-x-2.5 text-[var(--th-card)]">
          <span className="inline-flex items-center space-x-1.5 bg-[var(--th-primary)] px-2.5 py-0.5 rounded-full border border-[var(--th-accent)]/40 text-[10px] font-bold tracking-wider uppercase text-white shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Silver Rate</span>
          </span>
          <span className="font-semibold text-[11px] text-[var(--th-card)]/90">
            925: <strong className="text-white">₹{rate925}/g</strong> | 999: <strong className="text-white">₹{rate999}/g</strong>
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
        <div className="hidden md:flex items-center space-x-3.5 text-[11px] text-[#EADFCB]">
          <button
            onClick={() => onOpenPdf ? onOpenPdf('about') : window.open('/docs/Silver_House_About_Us.pdf', '_blank')}
            className="hover:text-white transition-colors cursor-pointer flex items-center space-x-1"
            title="Open Silver House Story & Heritage Document (PDF Viewer)"
          >
            <span>About Us (PDF)</span>
            <ExternalLink className="w-2.5 h-2.5 text-[#D4AF37]/70" />
          </button>
          <span className="text-[#D4AF37]/40">•</span>
          <span className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigateCategory && onNavigateCategory("silver-coins-bars")}>
            999 Bullion
          </span>
          <span className="text-[#D4AF37]/40">•</span>
          <button
            onClick={() => onOpenPdf ? onOpenPdf('purity') : window.open('/docs/Silver_House_Silver_Purity_Guide.pdf', '_blank')}
            className="hover:text-white transition-colors cursor-pointer font-semibold text-[#F3E5AB] flex items-center space-x-1"
            title="Open Silver Purity & BIS Hallmarking Guide (PDF Viewer)"
          >
            <span>Purity Guide (PDF)</span>
            <ExternalLink className="w-2.5 h-2.5 text-[#D4AF37]" />
          </button>
        </div>

      </div>
    </div>
  );
}
