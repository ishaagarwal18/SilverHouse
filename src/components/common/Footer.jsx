import React from 'react';
import { Sparkles, ShieldCheck, Mail, Phone, MapPin, Award, Heart, ArrowRight, FileText, ExternalLink } from 'lucide-react';

export default function Footer({ onNavigateCategory, onNavigateYatraCustomizer, onOpenInfoModal, company, onOpenPdf }) {
  const comp = company || {};
  const compName = comp.name || 'Silver House';
  const compAddress = comp.address || '217, Kanak Chamber, Gandhi Road';
  const compCity = comp.city || 'Ahmedabad';
  const compState = comp.state || 'Gujarat';
  const compPincode = comp.pincode || '380058';
  const compPhone = comp.contact_number || '9537178477';
  const compEmail = comp.email || 'sunilag28017@gmail.com';
  const compPan = comp.pan_card || 'ADDPA8283B';
  const compGst = comp.gst_no || null;
  const fullAddress = `${compAddress}, ${compCity} - ${compPincode}, ${compState}`;

  return (
    <footer
      className="text-white pt-16 pb-8 border-t-2 border-[var(--th-accent)]"
      style={{ background: 'var(--th-nav-gradient)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Newsletter Bar */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-[var(--th-accent)]/30 mb-12 sm:mb-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
          <div className="max-w-xl">
            <div className="flex items-center space-x-2 text-[var(--th-accent)] mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">JOIN SILVERHOUSE INNER CIRCLE</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Receive Festival Offers & Daily Silver Rate Updates
            </h3>
            <p className="text-xs text-white/70 mt-1">
              Get exclusive access to new 999 fine coin launches, Diwali murti previews, and custom Yatra locket design guides.
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row w-full lg:w-auto gap-2.5">
            <input
              type="email"
              placeholder="Enter your email address..."
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-white/50 focus:outline-hidden focus:border-[var(--th-accent)] w-full sm:w-72"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[var(--th-accent)] hover:brightness-110 text-white font-bold text-xs rounded-xl transition-all shrink-0 flex items-center justify-center space-x-1 cursor-pointer shadow-md"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-white/10 text-xs">

          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-[var(--th-accent)] flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-[var(--th-accent)]" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white uppercase">
                {compName.split(' ')[0]}<span className="text-[var(--th-accent)] font-light">{compName.split(' ').slice(1).join(' ') || 'HOUSE'}</span>
              </span>
            </div>

            <p className="text-white/70 leading-relaxed max-w-sm">
              India's premier high-conversion destination for 100% BIS Hallmarked 925 Sterling & 999 Fine Pure Silver Coins, Murti Idols, Utensils, Certified Rudraksha, and Handcrafted Custom Yatra Lockets.
            </p>

            {/* Dynamic Company Details from Database */}
            <div className="space-y-2.5 text-white/75 text-xs">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[var(--th-accent)] shrink-0 mt-0.5" />
                <span>{fullAddress}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[var(--th-accent)] shrink-0" />
                <a href={`tel:+91${compPhone}`} className="hover:text-white transition-colors">
                  Mobile / WhatsApp: +91 {compPhone}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[var(--th-accent)] shrink-0" />
                <a href={`mailto:${compEmail}`} className="hover:text-white transition-colors">
                  Email: {compEmail}
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#F3E5AB]">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--th-accent)] shrink-0" />
                {compPan && <span className="font-mono tracking-wider">PAN: {compPan}</span>}
                {compGst && (
                  <>
                    <span className="text-white/40">•</span>
                    <span className="font-mono tracking-wider">GSTIN: {compGst}</span>
                  </>
                )}
                <span className="text-white/40">•</span>
                <span>Sunil K Agarwal</span>
              </div>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[var(--th-accent)] mb-4 uppercase tracking-wider">
              Sacred Categories
            </h4>
            <ul className="space-y-2.5 text-white/70">
              <li>
                <button onClick={() => onNavigateCategory && onNavigateCategory('silver-coins-bars')} className="hover:text-white transition-colors cursor-pointer">
                  999 Fine Silver Coins & Bars
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory && onNavigateCategory('silver-idols')} className="hover:text-white transition-colors cursor-pointer">
                  Ganesha & Lakshmi Murti
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory && onNavigateCategory('utensils-silverware')} className="hover:text-white transition-colors cursor-pointer">
                  Silver Thali & Baby Feeding Sets
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory && onNavigateCategory('kids-baby')} className="hover:text-white transition-colors cursor-pointer">
                  Baby Silver Nazariya & Bangles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory && onNavigateCategory('sacred-rudraksha')} className="hover:text-white transition-colors cursor-pointer">
                  1-14 Mukhi Certified Rudraksha
                </button>
              </li>
              <li>
                <button onClick={onNavigateYatraCustomizer} className="hover:text-[var(--th-accent)] font-semibold transition-colors cursor-pointer">
                  Custom Yatra Lockets (Made on Order)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[var(--th-accent)] mb-4 uppercase tracking-wider">
              Assurance & Care
            </h4>
            <ul className="space-y-2.5 text-white/70">
              <li>
                <button onClick={() => onOpenInfoModal && onOpenInfoModal('hallmark')} className="hover:text-white transition-colors text-left cursor-pointer">
                  BIS Hallmarking Verification
                </button>
              </li>
              <li>
                <button onClick={() => onOpenInfoModal && onOpenInfoModal('shipping')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Transit Insurance Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPdf ? onOpenPdf('about') : window.open('/docs/Silver_House_About_Us.pdf', '_blank')}
                  className="hover:text-white transition-colors text-left flex items-center space-x-1.5 cursor-pointer text-white/80 group"
                  title="Open Silver House Story & Heritage Document (PDF Viewer)"
                >
                  <span>About SilverHouse Story (PDF)</span>
                  <ExternalLink className="w-3 h-3 text-[var(--th-accent)] opacity-70 group-hover:opacity-100" />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Hallmark Stamps & Purity Guide */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[var(--th-accent)] mb-4 uppercase tracking-wider">
              Purity Guarantee
            </h4>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[var(--th-accent)]" />
                <span className="font-bold text-[var(--th-accent)]">BIS 925 & 999 Certified</span>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed">
                Every product comes stamped with Bureau of Indian Standards (BIS) Hallmark identification and Assay Certificate.
              </p>
              <button
                type="button"
                onClick={() => onOpenPdf ? onOpenPdf('purity') : window.open('/docs/Silver_House_Silver_Purity_Guide.pdf', '_blank')}
                className="inline-flex items-center space-x-2 w-full justify-center px-3 py-2 rounded-lg bg-[var(--th-accent)]/20 hover:bg-[var(--th-accent)]/30 border border-[var(--th-accent)]/50 text-[11px] font-bold text-[#F3E5AB] transition-colors cursor-pointer"
                title="Open Silver Purity & Hallmarking Consumer Guide (PDF Viewer)"
              >
                <FileText className="w-3.5 h-3.5 text-[var(--th-accent)]" />
                <span>Open Silver Purity Guide (PDF) ↗</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/60 gap-4">
          <p>© {new Date().getFullYear()} {compName} • Manufacturer & Trader of Silver Products • {compCity}, {compState}. All Rights Reserved.</p>
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
