import React from 'react';
import { ShieldCheck, Award, Sparkles, RefreshCw } from 'lucide-react';

export default function PolicyBadges() {
  const BADGES = [
    {
      icon: Sparkles,
      title: "925 Fine Silver",
      subtitle: "100% BIS Hallmarked Authenticity"
    },
    {
      icon: ShieldCheck,
      title: "6-Month Warranty",
      subtitle: "Craftsmanship & Quality Assured"
    },
    {
      icon: Award,
      title: "Lifetime Plating",
      subtitle: "Complimentary Care & Polish Support"
    },
    {
      icon: RefreshCw,
      title: "Easy 15 Days Return",
      subtitle: "No Questions Asked Instant Refunds"
    }
  ];

  return (
    <section className="py-6 sm:py-7 bg-[#F2EAE0] border-b border-[#DFCBB5]">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {BADGES.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="flex items-center space-x-3 sm:space-x-4 p-3.5 sm:p-4 rounded-2xl bg-[#FAF5EB] border border-[#DFCBB5] shadow-xs hover:border-[#AA820A] hover:bg-[#FFFDF9] hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#4A0711]/10 border border-[#4A0711]/15 flex items-center justify-center shrink-0 group-hover:bg-[#4A0711] transition-colors duration-300">
                  <Icon className="w-5 h-5 sm:w-5 sm:h-5 text-[#AA820A] group-hover:text-[#F3E5AB] transition-colors duration-300" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[#4A0711] group-hover:text-[#600814] transition-colors truncate">
                    {badge.title}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-[#7A5844] truncate mt-0.5 font-sans font-medium">
                    {badge.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
