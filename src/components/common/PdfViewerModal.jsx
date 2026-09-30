import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  Printer, 
  FileText, 
  BookOpen, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ShieldCheck, 
  Award, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const DOCUMENTS = {
  about: {
    id: 'about',
    title: 'About Silver House',
    subtitle: 'From a small beginning in Ahmedabad to a trusted name in silver (Est. 2010)',
    badge: 'Official Company Profile',
    pdfUrl: '/docs/Silver_House_About_Us.pdf',
    fileName: 'Silver_House_About_Us.pdf',
    summary: 'Spanning more than a decade of wholesale and retail excellence in fine 999 and sterling 925 silver craftsmanship across Gujarat.'
  },
  purity: {
    id: 'purity',
    title: 'The Simple Guide to Silver Purity',
    subtitle: 'Understanding 999 Fine Silver, 925 Sterling Silver & BIS Hallmarking Standards',
    badge: 'Consumer Knowledge Guide',
    pdfUrl: '/docs/Silver_House_Silver_Purity_Guide.pdf',
    fileName: 'Silver_House_Silver_Purity_Guide.pdf',
    summary: 'No chemistry degree required. Learn how purity marks, alloy weights, and BIS HUID certification protect every purchase.'
  }
};

export default function PdfViewerModal({ 
  isOpen, 
  docType = 'purity', 
  onClose,
  company
}) {
  const [activeDocKey, setActiveDocKey] = useState(docType || 'purity');
  const [viewMode, setViewMode] = useState('pdf'); // 'pdf' | 'reader'
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);

  useEffect(() => {
    if (docType && DOCUMENTS[docType]) {
      setActiveDocKey(docType);
      setIsLoadingPdf(true);
    }
  }, [docType, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentDoc = DOCUMENTS[activeDocKey] || DOCUMENTS.purity;
  const comp = company || {};
  const compPhone = comp.contact_number || '9537178477';
  const compEmail = comp.email || 'sunilag28017@gmail.com';
  const compAddress = comp.address || '217, Kanak Chamber, Gandhi Road, Ahmedabad';

  const handlePrint = () => {
    const win = window.open(currentDoc.pdfUrl, '_blank');
    if (win) {
      win.focus();
      setTimeout(() => {
        try { win.print(); } catch (e) { console.warn(e); }
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-6xl bg-[#1A1A1A] text-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[var(--th-accent)]/40 flex flex-col h-[94vh] z-10 overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="p-3.5 sm:p-5 border-b border-white/10 bg-[#141414] flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Brand & Document Selector */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 border border-[var(--th-accent)] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[var(--th-accent)]" />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--th-accent)] bg-[var(--th-accent)]/15 px-2 py-0.5 rounded-full">
                  {currentDoc.badge}
                </span>
                <span className="text-white/40 text-xs hidden sm:inline">•</span>
                <span className="text-white/60 text-xs font-serif hidden sm:inline">Silver House Official Publications</span>
              </div>
              <h2 className="text-sm sm:text-base font-serif font-bold text-white truncate max-w-xs sm:max-w-md">
                {currentDoc.title}
              </h2>
            </div>
          </div>

          {/* Document Switcher Pills */}
          <div className="flex items-center bg-white/5 border border-white/15 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveDocKey('purity');
                setIsLoadingPdf(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeDocKey === 'purity'
                  ? 'bg-[var(--th-accent)] text-black font-bold shadow-xs'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Purity Guide</span>
            </button>

            <button
              onClick={() => {
                setActiveDocKey('about');
                setIsLoadingPdf(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeDocKey === 'about'
                  ? 'bg-[var(--th-accent)] text-black font-bold shadow-xs'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>About Us</span>
            </button>
          </div>

          {/* Action Tools & Close */}
          <div className="flex items-center space-x-2">
            
            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('pdf')}
                title="Official PDF Layout"
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 cursor-pointer transition-colors ${
                  viewMode === 'pdf' ? 'bg-white/20 text-white font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>PDF View</span>
              </button>
              <button
                onClick={() => setViewMode('reader')}
                title="Interactive Reader Mode"
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 cursor-pointer transition-colors ${
                  viewMode === 'reader' ? 'bg-white/20 text-white font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>Reader</span>
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              title="Print Document"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors cursor-pointer hidden md:flex"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Direct Download Button */}
            <a
              href={currentDoc.pdfUrl}
              download={currentDoc.fileName}
              title="Download PDF to Device"
              className="px-3 py-2 rounded-xl bg-[var(--th-accent)]/20 hover:bg-[var(--th-accent)]/30 border border-[var(--th-accent)]/50 text-[#F3E5AB] font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[var(--th-accent)]" />
              <span className="hidden sm:inline">Download</span>
            </a>

            {/* Open Raw in New Tab */}
            <a
              href={currentDoc.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Raw PDF in New Tab"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              title="Close Viewer (Esc)"
              className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/30 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Area */}
        <div className="flex-1 bg-[#222222] relative overflow-hidden flex flex-col">
          
          {viewMode === 'pdf' ? (
            <div className="w-full h-full relative flex flex-col">
              {/* Native PDF Embedded Viewer */}
              <iframe
                key={`${currentDoc.id}-${zoomLevel}`}
                src={`${currentDoc.pdfUrl}#toolbar=1&navpanes=1&statusbar=1&view=FitH`}
                className="w-full h-full border-0 bg-[#323639]"
                title={currentDoc.title}
                onLoad={() => setIsLoadingPdf(false)}
              />

              {/* Mobile Fallback / Companion Bar */}
              <div className="sm:hidden p-2.5 bg-[#141414] border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-white/60 truncate mr-2">Viewing {currentDoc.title}</span>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setViewMode('reader')}
                    className="px-2.5 py-1 bg-white/10 rounded-lg text-white font-medium"
                  >
                    Reader View
                  </button>
                  <a
                    href={currentDoc.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-[var(--th-accent)] text-black font-bold rounded-lg"
                  >
                    Full Screen ↗
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Reader Mode: Beautiful, highly legible pure React interactive article view */
            <div className="w-full h-full overflow-y-auto p-4 sm:p-8 lg:p-12 bg-[#F9F7F3] text-[#222222] font-sans selection:bg-[#D4AF37] selection:text-white">
              <div className="max-w-3xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-14 shadow-xl border border-[#E5D5B5] space-y-6">
                
                {/* Document Header Inside Reader */}
                <div className="border-b border-[#E5D5B5] pb-6 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#9E7D3B] font-bold uppercase tracking-wider">
                    <span>SILVER HOUSE • {currentDoc.badge}</span>
                    <span>Ahmedabad, Gujarat</span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1A1A]">
                    {currentDoc.title}
                  </h1>
                  <p className="text-xs sm:text-sm font-serif italic text-[#8B6B2B]">
                    {currentDoc.subtitle}
                  </p>
                </div>

                {/* Content Dispatcher */}
                {activeDocKey === 'purity' ? (
                  /* ================= PURITY GUIDE CONTENT ================= */
                  <div className="space-y-6 text-sm leading-relaxed text-[#333333]">
                    <div className="p-4 bg-amber-50/70 border-l-4 border-[#D4AF37] rounded-r-xl">
                      <p className="font-medium text-[#1A1A1A]">
                        No chemistry degree required. Promise.
                      </p>
                      <p className="text-xs text-silver-700 mt-1">
                        If you have ever looked at a silver article and wondered, <em>"What does 925 actually mean?"</em>, you are not alone. Silver purity is simply a way of telling us how much actual silver is present in a piece.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                        First: What Does Purity Mean?
                      </h3>
                      <p>
                        Imagine you have 1,000 tiny pieces of material. If 925 of those pieces are pure silver, the material is called <strong>925 purity</strong>.
                      </p>
                      <div className="p-3 bg-[#FBF9F5] border border-[#D4AF37]/50 rounded-xl text-center font-mono font-bold text-[#1A1A1A]">
                        925 ÷ 1000 = 92.5% Pure Silver Content
                      </div>
                      <p className="text-xs text-silver-600">
                        A purity number is basically a percentage wearing a slightly more formal outfit!
                      </p>
                    </div>

                    {/* Interactive Purity Cheat Sheet Table */}
                    <div className="space-y-2 pt-2">
                      <h3 className="font-serif text-lg font-bold text-[#1A1A1A] flex items-center justify-between">
                        <span>The Silver Purity Cheat Sheet</span>
                        <span className="text-xs font-sans font-bold text-[#AA820A] bg-amber-100 px-2 py-0.5 rounded-full">
                          Indian Standards
                        </span>
                      </h3>
                      <div className="overflow-x-auto rounded-xl border border-[#D4AF37]/60 shadow-xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#1A1A1A] text-white">
                            <tr>
                              <th className="p-3 font-serif font-bold">Purity Mark</th>
                              <th className="p-3 font-serif font-bold">Silver Content</th>
                              <th className="p-3 font-serif font-bold">Common Application</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-silver-200">
                            <tr className="bg-white hover:bg-amber-50/50">
                              <td className="p-3 font-bold text-[#AA820A]">999</td>
                              <td className="p-3 font-bold">99.9%</td>
                              <td className="p-3">Fine Pure Silver Coins, Bullion Bars, Sacred Murti Idols</td>
                            </tr>
                            <tr className="bg-[#FDFBF7] hover:bg-amber-50/50">
                              <td className="p-3 font-bold text-[#AA820A]">925</td>
                              <td className="p-3 font-bold">92.5%</td>
                              <td className="p-3">Sterling Silver Jewellery, Rings, Chains, Nazariya (Durability alloy)</td>
                            </tr>
                            <tr className="bg-white hover:bg-amber-50/50">
                              <td className="p-3 font-bold text-silver-700">970</td>
                              <td className="p-3">97.0%</td>
                              <td className="p-3">Traditional Pooja Utensils, Diya Lamps, Special Vessels</td>
                            </tr>
                            <tr className="bg-[#FDFBF7] hover:bg-amber-50/50">
                              <td className="p-3 font-bold text-silver-700">900 / 835</td>
                              <td className="p-3">90% / 83.5%</td>
                              <td className="p-3">Vintage items, heavy antique anklets, decorative artifacts</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Pure Silver Weight Formula */}
                    <div className="space-y-2 pt-2">
                      <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                        Weight and Purity Are Different Things
                      </h3>
                      <p>
                        Weight tells you how much the entire article weighs. Purity tells you how much of that material is precious silver.
                      </p>
                      <div className="p-4 bg-linear-to-r from-[#1A1A1A] to-[#2D3748] text-white rounded-xl space-y-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--th-accent)]">
                          THE ONE FORMULA WORTH REMEMBERING
                        </span>
                        <p className="font-mono text-base font-bold text-white">
                          Pure Silver Content = Weight × Purity ÷ 1000
                        </p>
                        <p className="text-xs text-white/80">
                          Example: A 250g article with 925 purity contains <strong>250 × 925 ÷ 1000 = 231.25 grams</strong> of pure silver.
                        </p>
                      </div>
                    </div>

                    {/* BIS Hallmarking & HUID */}
                    <div className="space-y-3 pt-2">
                      <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                        Reading the Silver Hallmark (IS 2112:2025)
                      </h3>
                      <p>
                        Under the revised Indian Standard IS 2112:2025, every genuine hallmarked silver piece features 3 critical components:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="p-3.5 bg-silver-50 rounded-xl border border-silver-300">
                          <span className="font-bold text-xs text-[#1A1A1A] block">1. BIS Standard Mark</span>
                          <span className="text-xs text-silver-600">The triangular BIS mark with the word “SILVER”.</span>
                        </div>
                        <div className="p-3.5 bg-silver-50 rounded-xl border border-silver-300">
                          <span className="font-bold text-xs text-[#1A1A1A] block">2. Purity Grade</span>
                          <span className="text-xs text-silver-600">925, 999 or official declared fineness grade.</span>
                        </div>
                        <div className="p-3.5 bg-silver-50 rounded-xl border border-silver-300">
                          <span className="font-bold text-xs text-[#1A1A1A] block">3. HUID Code</span>
                          <span className="text-xs text-silver-600">Laser-engraved 6-character Unique ID traceable on BIS CARE App.</span>
                        </div>
                      </div>
                    </div>

                    {/* Summary Card */}
                    <div className="p-4 bg-amber-50 rounded-xl border border-[#D4AF37] space-y-2 text-xs">
                      <span className="font-bold text-[#1A1A1A] block uppercase tracking-wide">
                        The 10-Second Memory Trick
                      </span>
                      <ul className="space-y-1 text-silver-700">
                        <li>• <strong>999</strong> → 99.9% pure silver → high purity fine bullion and sacred idols</li>
                        <li>• <strong>925</strong> → 92.5% silver → Sterling silver for strong, daily-wear jewellery</li>
                        <li>• <strong>Purity</strong> → how much precious silver is present in the alloy</li>
                        <li>• <strong>Hallmark</strong> → government recognized third-party purity guarantee</li>
                      </ul>
                    </div>

                  </div>
                ) : (
                  /* ================= ABOUT US CONTENT ================= */
                  <div className="space-y-6 text-sm leading-relaxed text-[#333333]">
                    <div className="space-y-3">
                      <p className="font-serif text-base text-[#1A1A1A] leading-relaxed">
                        Silver House began with a simple belief: silver is not just a precious metal. It is part of our traditions, celebrations, relationships and everyday life.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">Where It All Began</h3>
                      <p>
                        Before starting Silver House, our founder spent years learning the jewellery trade from the ground up. He gained practical experience by working with established jewellery businesses and understanding the industry closely, from sourcing and product selection to quality, craftsmanship, pricing and customer relationships.
                      </p>
                      <p>
                        That experience eventually gave him the confidence to build something of his own. In <strong>2010</strong>, Silver House was established in <strong>Ahmedabad, Gujarat</strong>, with a clear focus on quality silver products, dependable service and relationships that could stand the test of time.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">Built Through Wholesale</h3>
                      <p>
                        The early journey of Silver House was primarily shaped by the wholesale business. Instead of focusing only on individual transactions, we concentrated on building dependable relationships with jewellery retailers and established businesses.
                      </p>
                      <p>
                        Over time, our products began reaching retail stores across different cities, towns and villages of Gujarat. Many of these relationships have continued for years, with retailers returning to us because of the consistency they have experienced in our products and service.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">Growing Across Gujarat & A New Chapter in Retail</h3>
                      <p>
                        From Ahmedabad, our network gradually expanded across Gujarat. Alongside our regular wholesale relationships, we have also served requirements connected with corporate and institutional gifting, traditional occasions and customised needs.
                      </p>
                      <p>
                        Today, we are taking the next step by bringing Silver House directly to customers online. Our retail segment and digital presence are an extension of the business we have built over the years.
                      </p>
                    </div>

                    {/* Belief Callout */}
                    <div className="p-5 bg-[#1A1A1A] text-white rounded-2xl border border-[var(--th-accent)] space-y-2">
                      <span className="text-xs uppercase font-bold tracking-widest text-[var(--th-accent)]">
                        WHAT WE BELIEVE
                      </span>
                      <p className="font-serif text-sm leading-relaxed text-silver-200">
                        "We believe a jewellery business is ultimately built on trust. Trust in the quality of the silver. Trust in the product. Trust in the people behind the business. And trust that remains long after a purchase has been made."
                      </p>
                      <p className="text-xs text-[var(--th-accent)] font-medium pt-1">
                        Established in Ahmedabad in 2010 • Built through wholesale • Strengthened through relationships.
                      </p>
                    </div>

                    {/* Contact details footer */}
                    <div className="p-4 bg-silver-100 rounded-xl border border-silver-300 text-xs text-silver-700 space-y-1">
                      <p><strong>Silver House Ahmedabad:</strong> {compAddress}</p>
                      <p><strong>Direct Inquiries:</strong> +91 {compPhone} • {compEmail}</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>

        {/* Bottom Status Footer */}
        <div className="p-3 sm:p-4 bg-[#141414] border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-white/70 gap-2 shrink-0">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[var(--th-accent)]" />
            <span>100% Verified Silver House Document ({currentDoc.fileName})</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline">Ahmedabad, Gujarat</span>
            <a 
              href={currentDoc.pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[var(--th-accent)] hover:underline font-bold flex items-center space-x-1"
            >
              <span>Download Official PDF</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
