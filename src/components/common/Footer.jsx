import React from 'react';
import { Sparkles, ShieldCheck, Mail, Phone, MapPin, Award, Heart, ArrowRight } from 'lucide-react';

export default function Footer({ onNavigateCategory, onNavigateYatraCustomizer }) {
  return (
    <footer className="bg-gradient-to-b from-[#071526] via-[#0B2545] to-[#040C16] text-white pt-16 pb-8 border-t-2 border-[#D4AF37]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Newsletter Bar */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 border border-[#D4AF37]/30 mb-16 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="max-w-xl">
            <div className="flex items-center space-x-2 text-[#D4AF37] mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">JOIN SILVERHOUSE INNER CIRCLE</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-silver-50">
              Receive Festival Offers & Daily Silver Rate Updates
            </h3>
            <p className="text-xs text-silver-300 mt-1">
              Get exclusive access to new 999 fine coin launches, Diwali murti previews, and custom Yatra locket design guides.
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="flex w-full lg:w-auto space-x-2">
            <input
              type="email"
              placeholder="Enter your email address..."
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-silver-400 focus:outline-hidden focus:border-[#D4AF37] w-full sm:w-72"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#D4AF37] hover:bg-[#AA820A] text-black font-bold text-xs rounded-xl transition-all shrink-0 flex items-center space-x-1"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-silver-800 text-xs">

          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-silver-metallic border border-[#D4AF37] flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-[#1A1A1A]" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                SILVER<span className="text-gold-gradient font-light">HOUSE</span>
              </span>
            </div>

            <p className="text-silver-300 leading-relaxed max-w-sm">
              India's premier high-conversion destination for 100% BIS Hallmarked 925 Sterling & 999 Fine Pure Silver Coins, Murti Idols, Utensils, Certified Rudraksha, and Handcrafted Custom Yatra Lockets.
            </p>

            <div className="space-y-2 text-silver-400">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span>SILVERHOUSE Heritage Tower, Connaught Place, New Delhi 110001</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span>Care Line: +91 98765 43210 (Mon-Sat 10 AM - 7 PM)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                <span>Support: care@silverhouse.com</span>
              </div>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[#D4AF37] mb-4 uppercase tracking-wider">
              Sacred Categories
            </h4>
            <ul className="space-y-2.5 text-silver-300">
              <li>
                <button onClick={() => onNavigateCategory('silver-coins-bars')} className="hover:text-white transition-colors">
                  999 Fine Silver Coins & Bars
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory('silver-idols')} className="hover:text-white transition-colors">
                  Ganesha & Lakshmi Murti
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory('utensils-silverware')} className="hover:text-white transition-colors">
                  Silver Thali & Baby Feeding Sets
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory('kids-baby')} className="hover:text-white transition-colors">
                  Baby Silver Nazariya & Bangles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory('sacred-rudraksha')} className="hover:text-white transition-colors">
                  1-14 Mukhi Certified Rudraksha
                </button>
              </li>
              <li>
                <button onClick={onNavigateYatraCustomizer} className="hover:text-[#D4AF37] font-semibold transition-colors">
                  Custom Yatra Lockets (Made on Order)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[#D4AF37] mb-4 uppercase tracking-wider">
              Assurance & Care
            </h4>
            <ul className="space-y-2.5 text-silver-300">
              <li>
                <button onClick={() => onOpenInfoModal && onOpenInfoModal('hallmark')} className="hover:text-white transition-colors text-left">
                  BIS Hallmarking Verification
                </button>
              </li>
              <li>
                <button onClick={() => onOpenInfoModal && onOpenInfoModal('shipping')} className="hover:text-white transition-colors text-left">
                  Transit Insurance Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenInfoModal && onOpenInfoModal('about')} className="hover:text-white transition-colors text-left">
                  About SilverHouse Story
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Hallmark Stamps */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[#D4AF37] mb-4 uppercase tracking-wider">
              Purity Guarantee
            </h4>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                <span className="font-bold text-[#D4AF37]">BIS 925 & 999 Certified</span>
              </div>
              <p className="text-[11px] text-silver-400 leading-relaxed">
                Every product comes stamped with Bureau of Indian Standards (BIS) Hallmark identification and Assay Certificate.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-silver-400 gap-4">
          <p>© 2026 SILVERHOUSE Fine Artifacts Pvt. Ltd. All Rights Reserved.</p>
          <div className="flex items-center space-x-6">
            <a href="#privacy" className="hover:text-white">Privacy Policy</a>
            <a href="#terms" className="hover:text-white">Terms of Service</a>
            <a href="#sitemap" className="hover:text-white">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
