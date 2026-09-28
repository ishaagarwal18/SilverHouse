import React from 'react';
import { Sparkles, Upload, FileText, ShieldCheck, ArrowRight } from 'lucide-react';

export default function YatraLocketSpotlight({ onNavigateCustomizer }) {
  const STEPS = [
    {
      num: "01",
      icon: Upload,
      title: "Upload Deity / Shrine Photo",
      desc: "Choose from major shrines (Kedarnath, Badrinath, Tirupati, Vaishno Devi) or upload your custom family deity image."
    },
    {
      num: "02",
      icon: FileText,
      title: "Add Engraving & Gotra",
      desc: "Specify your family name, sacred mantra (e.g. Om Namah Shivaya), or date of pilgrimage for reverse laser engraving."
    },
    {
      num: "03",
      icon: ShieldCheck,
      title: "925 Pure Silver Handcrafting",
      desc: "Master artisans encapsulate the image under waterproof crystal glass and seal it with hallmarked 925 sterling silver."
    }
  ];

  return (
    <section className="py-20 bg-linear-to-b from-[#1A1A1A] to-[#2B2B2B] text-white relative overflow-hidden">
      {/* Background Decorative Gold Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-silver-400/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Column: Headline & Steps */}
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-[#D4AF37]/40 px-3.5 py-1.5 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
                MADE-ON-ORDER CUSTOM ART
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-tight text-silver-50">
              Personalized Sacred Silver Yatra Lockets
            </h2>

            <p className="mt-4 text-sm sm:text-base text-silver-300 font-normal leading-relaxed">
              Carry your most revered pilgrimage blessings close to your heart. Handcrafted in 925 sterling silver with waterproof crystal glass encapsulation.
            </p>

            {/* 3 Steps */}
            <div className="mt-8 space-y-6">
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.num} className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                          STEP {step.num}
                        </span>
                        <h4 className="font-serif font-bold text-base text-white">{step.title}</h4>
                      </div>
                      <p className="text-xs text-silver-300 mt-1">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <button
                onClick={onNavigateCustomizer}
                className="px-8 py-4 bg-linear-to-r from-[#D4AF37] to-[#AA820A] hover:from-[#E6CA65] hover:to-[#D4AF37] text-black font-bold text-sm rounded-xl transition-all shadow-xl hover:shadow-[#D4AF37]/30 flex items-center space-x-2 group"
              >
                <span>Design / Request Your Custom Locket Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Visual Showcase Card */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#D4AF37]/50 silver-card-shadow bg-silver-800 p-6">
              <img
                src="/images/section/hero_yatra_locket.png"
                alt="Custom Yatra Locket Demo"
                className="w-full h-80 object-cover rounded-xl mb-6 border border-white/10"
              />

              {/* Sample Custom Overlay Box */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-xs space-y-2">
                <div className="flex justify-between items-center text-[#D4AF37] font-bold">
                  <span>SAMPLE YATRA LOCKET PREVIEW</span>
                  <span className="bg-[#D4AF37] text-black text-[9px] px-2 py-0.5 rounded">925 Pure Silver</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-silver-300">
                  <div>
                    <span className="text-silver-500 block text-[10px]">Shrine Choice:</span>
                    <span className="font-semibold text-white">Kedarnath Dham</span>
                  </div>
                  <div>
                    <span className="text-silver-500 block text-[10px]">Reverse Engraving:</span>
                    <span className="font-semibold text-white">"Om Namah Shivaya"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
