import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function ShopByColor({ onSelectFinish, onNavigateCategory }) {
  const navigate = useNavigate();

  const FINISHES = [
    {
      id: 'fine-silver',
      colorName: 'Silver',
      title: 'Shine in Silver',
      buttonLabel: 'FINE SILVER',
      image: '/images/shine_in_silver.jpg',
      badgeColor: 'border-[#C5B299] bg-[#F8F4EC]/90 text-[#071526]',
      description: 'Radiant 999 and 925 fine pure silver lustres'
    },
    {
      id: 'rose-gold',
      colorName: 'Rose Gold',
      title: 'Glow in Rose Gold',
      buttonLabel: 'ROSE GOLD',
      image: '/images/glow_in_rose_gold.jpg',
      badgeColor: 'border-[#E0A899] bg-[#FFF0ED]/90 text-[#6B2E24]',
      description: 'Blushing 18k rose gold plated sterling craftsmanship'
    },
    {
      id: 'oxidised',
      colorName: 'Oxidised',
      title: 'Bold in Oxidised',
      buttonLabel: 'OXIDISED',
      image: '/images/bold_in_oxidised.jpg',
      badgeColor: 'border-[#9A650C] bg-[#F8F4EC]/90 text-[#0B2545]',
      description: 'Royal antique dark patina and vintage tribal silver'
    }
  ];

  const handleClick = (finish) => {
    if (onSelectFinish) {
      onSelectFinish(finish.colorName);
    } else {
      navigate(`/catalog?color=${encodeURIComponent(finish.colorName)}`);
    }
  };

  return (
    <section className="py-14 sm:py-16 bg-[#DFD4C0] border-b border-[#C5B299]">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-center space-x-2 text-[#9A650C] mb-1">
            <Sparkles className="w-4 h-4 text-[#9A650C]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#4E6073]">
              SIGNATURE METALLIC FINISHES
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#071526] tracking-wider uppercase">
            SHOP BY COLOR
          </h2>
          <div className="w-16 h-0.5 bg-[#9A650C] mx-auto mt-2.5 mb-3" />
          <p className="text-xs sm:text-sm text-[#4E6073] font-sans">
            Choose your signature finish — radiant fine silver, blushing rose gold, or royal antique oxidised craftsmanship.
          </p>
        </div>

        {/* 3 Finish Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {FINISHES.map((finish) => (
            <div
              key={finish.id}
              onClick={() => handleClick(finish)}
              className="group relative h-[360px] sm:h-[400px] rounded-3xl overflow-hidden border-2 border-[#C5B299] shadow-md hover:shadow-2xl hover:border-[#9A650C] transition-all duration-500 cursor-pointer flex flex-col justify-between p-6"
            >
              {/* Background Image */}
              <img
                src={finish.image}
                alt={finish.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              />

              {/* Dark Luxury Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 group-hover:from-black/70 group-hover:to-black/90 transition-all" />

              {/* Top Finish Pill Badge */}
              <div className="relative z-10">
                <span className={`inline-block px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border shadow-md ${finish.badgeColor}`}>
                  {finish.buttonLabel}
                </span>
              </div>

              {/* Bottom Finish Title & CTA */}
              <div className="relative z-10 text-white flex flex-col items-start">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-3 text-[#FFFDF9] group-hover:text-[#F8E6C8] transition-colors leading-snug">
                  {finish.title}
                </h3>
                
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-full border-2 border-[#F8F4EC] text-[#F8F4EC] font-serif text-xs font-bold tracking-widest uppercase hover:bg-[#0B2545] hover:border-[#0B2545] hover:text-[#F8E6C8] transition-all duration-300 flex items-center space-x-2 group-hover:shadow-lg cursor-pointer"
                >
                  <span>EXPLORE {finish.buttonLabel}</span>
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
