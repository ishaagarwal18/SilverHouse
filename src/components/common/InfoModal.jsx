import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Truck, X, MapPin, Phone, Mail, Award, CheckCircle2, ArrowRight, FileText, ExternalLink } from 'lucide-react';

export default function InfoModal({ isOpen, initialTab = 'about', onClose, onNavigateCategory, company, onOpenPdf }) {
  const [activeTab, setActiveTab] = useState(initialTab);

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

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-silver-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#1A1A1A] text-white p-6 flex items-center justify-between border-b border-[#D4AF37]/40 relative">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-silver-50">
                SILVERHOUSE Assurance & Info
              </h2>
              <p className="text-xs text-silver-300">
                100% Certified 925 Sterling & 999 Fine Pure Silver Guarantee
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-silver-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-hidden"
            aria-label="Close information modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation Header */}
        <div className="bg-silver-50 border-b border-silver-200 px-6 pt-3 flex space-x-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 whitespace-nowrap ${
              activeTab === 'about'
                ? 'bg-white text-[#1A1A1A] border-[#D4AF37] shadow-xs'
                : 'text-silver-600 border-transparent hover:text-black hover:bg-silver-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>About SILVERHOUSE</span>
          </button>

          <button
            onClick={() => setActiveTab('hallmark')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 whitespace-nowrap ${
              activeTab === 'hallmark'
                ? 'bg-white text-[#1A1A1A] border-[#D4AF37] shadow-xs'
                : 'text-silver-600 border-transparent hover:text-black hover:bg-silver-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>100% BIS Hallmark Certification</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 whitespace-nowrap ${
              activeTab === 'shipping'
                ? 'bg-white text-[#1A1A1A] border-[#D4AF37] shadow-xs'
                : 'text-silver-600 border-transparent hover:text-black hover:bg-silver-100'
            }`}
          >
            <Truck className="w-4 h-4 text-[#D4AF37]" />
            <span>Express Shipping & Insurance</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-[#1A1A1A] leading-relaxed">

          {/* TAB 1: ABOUT SILVERHOUSE */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-linear-to-r from-silver-50 via-white to-silver-50 p-6 rounded-xl border border-silver-200 space-y-3">
                <span className="text-xs font-bold text-[#AA820A] uppercase tracking-wider bg-[#D4AF37]/15 px-3 py-1 rounded-full inline-block">
                  OUR HERITAGE & MISSION
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">
                  India's Premier Destination for Sacred Pure Silver
                </h3>
                <p className="text-silver-700 text-xs sm:text-sm leading-relaxed">
                  SILVERHOUSE is dedicated to crafting 100% BIS Hallmarked 925 Sterling Silver jewellery, 999 Fine Pure Silver Murti idols, bullion coins, baby nazariya, and custom Yatra shrine lockets. Every piece is handcrafted by traditional silver artisans in India with certified metal purity and anti-tarnish protective coating.
                </p>

                {/* About Us Official PDF Banner */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenPdf) {
                        onOpenPdf('about');
                      } else {
                        window.open('/docs/Silver_House_About_Us.pdf', '_blank');
                      }
                    }}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1A1A1A] hover:bg-[#333333] text-[#F3E5AB] rounded-xl text-xs font-bold transition-all shadow-xs border border-[var(--th-accent)] cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[var(--th-accent)]" />
                    <span>View Official Silver House Story & Heritage Document (PDF Viewer) ↗</span>
                  </button>
                </div>
              </div>

              {/* Pillars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-silver-200 bg-white space-y-1.5">
                  <div className="flex items-center space-x-2 font-bold text-[#1A1A1A]">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>Government Certified Assay Labs</span>
                  </div>
                  <p className="text-silver-600">Every silver item is hallmarked by BIS recognized assay centers with laser HUID stamping.</p>
                </div>

                <div className="p-4 rounded-xl border border-silver-200 bg-white space-y-1.5">
                  <div className="flex items-center space-x-2 font-bold text-[#1A1A1A]">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>Made-On-Order Personalization</span>
                  </div>
                  <p className="text-silver-600">Custom Yatra lockets feature waterproof deity photo sealing & gotra reverse laser engraving.</p>
                </div>

                <div className="p-4 rounded-xl border border-silver-200 bg-white space-y-1.5">
                  <div className="flex items-center space-x-2 font-bold text-[#1A1A1A]">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>Authentic Lab Tested Rudraksha</span>
                  </div>
                  <p className="text-silver-600">100% genuine 1-14 Mukhi divine beads complete with individual testing reports.</p>
                </div>

                <div className="p-4 rounded-xl border border-silver-200 bg-white space-y-1.5">
                  <div className="flex items-center space-x-2 font-bold text-[#1A1A1A]">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>100% Transit Insured Delivery</span>
                  </div>
                  <p className="text-silver-600">Tamper-proof blister seal packaging with full insurance across 26,000+ PIN codes.</p>
                </div>
              </div>

              {/* Store & Verified Business Info */}
              <div className="border-t border-silver-200 pt-6 space-y-3">
                <h4 className="font-serif font-bold text-base text-[#1A1A1A]">Registered Business & Workshop Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-silver-700">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span>{fullAddress}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Phone className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span>
                      <a href={`tel:+91${compPhone}`} className="hover:underline">
                        Mobile / WhatsApp: +91 {compPhone}
                      </a>
                      <br />(Mon - Sat, 10 AM - 8 PM)
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Mail className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span>
                      <a href={`mailto:${compEmail}`} className="hover:underline">
                        Official Email: {compEmail}
                      </a>
                      {compPan && (
                        <><br /><strong className="text-[#1A1A1A] font-mono">PAN: {compPan}</strong></>
                      )}
                      {compGst && (
                        <><br /><strong className="text-[#1A1A1A] font-mono">GSTIN: {compGst}</strong></>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 100% BIS HALLMARK CERTIFICATION */}
          {activeTab === 'hallmark' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-[#1A1A1A] text-white p-6 rounded-xl space-y-3 relative overflow-hidden border border-[#D4AF37]/50">
                <div className="flex items-center space-x-2 text-[#D4AF37]">
                  <ShieldCheck className="w-6 h-6" />
                  <span className="font-bold text-xs uppercase tracking-widest">OFFICIAL PURITY GUARANTEE</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-silver-50">
                  Bureau of Indian Standards (BIS) Hallmark Certification
                </h3>
                <p className="text-silver-300 text-xs sm:text-sm leading-relaxed">
                  All silver products sold at SILVERHOUSE carry official BIS Hallmark identification stamps engraved with high-precision laser technology. This guarantees that your product adheres to strict government purity standards.
                </p>
              </div>

              {/* Hallmark Breakdown Cards */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-base text-[#1A1A1A]">Understanding Your Silver Hallmark Stamp:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-silver-50 rounded-xl border border-silver-200 text-center space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center font-bold text-xs text-[#AA820A]">
                      BIS
                    </div>
                    <h5 className="font-bold text-xs text-[#1A1A1A]">1. BIS Triangular Logo</h5>
                    <p className="text-[11px] text-silver-600">Official mark certifying that the silver has been tested at an authorized assaying center.</p>
                  </div>

                  <div className="p-4 bg-silver-50 rounded-xl border border-silver-200 text-center space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center font-bold text-xs text-[#AA820A]">
                      925 / 999
                    </div>
                    <h5 className="font-bold text-xs text-[#1A1A1A]">2. Purity Grade</h5>
                    <p className="text-[11px] text-silver-600"><strong>925</strong> = 92.5% Sterling Silver Jewellery<br /><strong>999</strong> = 99.9% Pure Fine Silver Coins & Idols.</p>
                  </div>

                  <div className="p-4 bg-silver-50 rounded-xl border border-silver-200 text-center space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center font-bold text-xs text-[#AA820A]">
                      HUID
                    </div>
                    <h5 className="font-bold text-xs text-[#1A1A1A]">3. Unique HUID Laser Code</h5>
                    <p className="text-[11px] text-silver-600">6-digit alphanumeric unique ID ensuring 100% traceability and tamper-proof verification.</p>
                  </div>
                </div>
              </div>

              {/* Extra Certificate Assurance */}
              <div className="p-4 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/40 flex items-center space-x-4">
                <Award className="w-8 h-8 text-[#AA820A] shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-[#1A1A1A] block">Physical Assay Certificate Included</span>
                  <span className="text-silver-700">Every order includes a physical invoice & authenticity card certifying the silver weight, purity, and hallmark details.</span>
                </div>
              </div>

              {/* Silver Purity Guide PDF Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-linear-to-r from-amber-50 to-white border border-[#D4AF37]/50 rounded-xl gap-3">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-[#AA820A] shrink-0" />
                  <div>
                    <h5 className="font-bold text-xs text-[#1A1A1A]">Official Silver Purity Consumer Guide</h5>
                    <p className="text-[11px] text-silver-600">Download our complete guide covering 999 vs 925 purity, alloy weight formulas, and HUID verification.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenPdf) {
                      onOpenPdf('purity');
                    } else {
                      window.open('/docs/Silver_House_Silver_Purity_Guide.pdf', '_blank');
                    }
                  }}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#D4AF37] hover:bg-[#AA820A] text-black hover:text-white rounded-lg text-xs font-bold transition-all shrink-0 shadow-xs cursor-pointer"
                  title="Open Silver Purity Guide in React PDF Viewer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open Purity Guide in PDF Viewer ↗</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: EXPRESS NATIONWIDE SHIPPING */}
          {activeTab === 'shipping' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-silver-50 p-6 rounded-xl border border-silver-200 space-y-3">
                <span className="text-xs font-bold text-[#AA820A] uppercase tracking-wider bg-[#D4AF37]/15 px-3 py-1 rounded-full inline-block">
                  SAFE & SECURE DELIVERIES
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">
                  Express Insured Nationwide Shipping
                </h3>
                <p className="text-silver-700 text-xs sm:text-sm leading-relaxed">
                  We understand the sacred value of your purchase. That is why all SILVERHOUSE orders are dispatched in tamper-proof, high-security packaging with 100% transit insurance.
                </p>
              </div>

              {/* Shipping Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 border border-silver-200 rounded-xl bg-white space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-[#1A1A1A]">
                    <Truck className="w-5 h-5 text-[#D4AF37]" />
                    <span>26,000+ PIN Codes Covered</span>
                  </div>
                  <p className="text-silver-600">Fast delivery across all major metro cities, tier-2 towns, and regional locations in India.</p>
                </div>

                <div className="p-4 border border-silver-200 rounded-xl bg-white space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-[#1A1A1A]">
                    <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                    <span>100% Transit Insurance</span>
                  </div>
                  <p className="text-silver-600">Your shipment is fully protected against theft, damage, or loss during transit until delivery.</p>
                </div>

                <div className="p-4 border border-silver-200 rounded-xl bg-white space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-[#1A1A1A]">
                    <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                    <span>Tamper-Evident Packaging</span>
                  </div>
                  <p className="text-silver-600">Coins and idols are sealed in blister cards and velvet boxes with outer security tape.</p>
                </div>

                <div className="p-4 border border-silver-200 rounded-xl bg-white space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-[#1A1A1A]">
                    <Award className="w-5 h-5 text-[#D4AF37]" />
                    <span>7-Day Easy Exchange Policy</span>
                  </div>
                  <p className="text-silver-600">Hassle-free 7-day exchange guarantee if you receive a damaged or mismatched item.</p>
                </div>
              </div>

              {/* Shipping Timelines */}
              <div className="bg-silver-100 p-4 rounded-xl text-xs space-y-2 border border-silver-200">
                <div className="font-bold text-[#1A1A1A]">Estimated Delivery Timelines:</div>
                <ul className="list-disc list-inside space-y-1 text-silver-700">
                  <li><strong>Metro Cities (Delhi, Mumbai, Bengaluru, Chennai, Kolkata):</strong> 2 to 3 Business Days</li>
                  <li><strong>Rest of India:</strong> 3 to 5 Business Days</li>
                  <li><strong>Custom Yatra Lockets & Personalized Engraving:</strong> Dispatched in 48 Hours</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-silver-50 border-t border-silver-200 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-silver-600 flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>BIS Hallmarked Pure Silver Assurance</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                if (onNavigateCategory) onNavigateCategory('all');
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#D4AF37] hover:text-black text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <span>Explore Sacred Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-silver-200 hover:bg-silver-300 text-black font-bold text-xs rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
