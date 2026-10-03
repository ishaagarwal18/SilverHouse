import React, { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const DOCUMENTS = {
  'about-us': {
    id: 'about',
    title: 'About Silver House',
    subtitle: 'From a small beginning in Ahmedabad to a trusted name in silver (Est. 2010)',
    badge: 'Official Company Profile',
    fileName: 'Silver_House_About_Us.pdf'
  },
  'purity-guide': {
    id: 'purity',
    title: 'The Simple Guide to Silver Purity',
    subtitle: 'Understanding 999 Fine Silver, 925 Sterling Silver & BIS Hallmarking Standards',
    badge: 'Consumer Knowledge Guide',
    fileName: 'Silver_House_Silver_Purity_Guide.pdf'
  }
};

export default function DocumentPage({ company }) {
  const { docId } = useParams();
  
  useEffect(() => {
    document.title = DOCUMENTS[docId]?.title || 'Document - Silver House';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [docId]);

  if (!DOCUMENTS[docId]) {
    return <Navigate to="/" replace />;
  }

  const currentDoc = DOCUMENTS[docId];
  const activeDocKey = currentDoc.id;

  const comp = company || {};
  const compPhone = comp.contact_number || '9537178477';
  const compEmail = comp.email || 'sunilag28017@gmail.com';
  const compAddress = comp.address || '217, Kanak Chamber, Gandhi Road, Ahmedabad';

  return (
    <div className="w-full min-h-screen bg-white text-[#222222] font-sans selection:bg-[#D4AF37] selection:text-white">
      {/* Blog-Style Minimal Header */}
      <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#D4AF37] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Store</span>
          </Link>
          <div className="font-serif text-lg sm:text-xl font-bold tracking-widest text-[#1A1A1A] uppercase">
            Silver House
          </div>
          <div className="w-8 sm:w-24"></div> {/* spacer for centering */}
        </div>
      </header>

      {/* Main Blog Content Area */}
      <main className="max-w-3xl mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-20">
        
        {/* Blog Hero/Header */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-block px-4 py-1.5 bg-[#F9F7F3] border border-[#E5D5B5] text-[#9E7D3B] text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full shadow-sm">
            {currentDoc.badge}
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1A1A] leading-tight">
            {currentDoc.title}
          </h1>
          <p className="text-lg sm:text-xl font-serif italic text-gray-500 max-w-2xl mx-auto">
            {currentDoc.subtitle}
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-8 border-t border-gray-100 w-48 mx-auto">
            <span>Ahmedabad, Gujarat</span>
          </div>
        </div>

        {/* Content Dispatcher */}
        {activeDocKey === 'purity' ? (
          /* ================= PURITY GUIDE CONTENT ================= */
          <article className="prose prose-lg sm:prose-xl prose-headings:font-serif prose-headings:text-[#1A1A1A] prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-[#1A1A1A] max-w-none space-y-10">
            <div className="p-6 sm:p-8 bg-amber-50/50 border-l-4 border-[#D4AF37] rounded-r-2xl not-prose">
              <p className="font-serif text-xl font-medium text-[#1A1A1A] mb-2">
                No chemistry degree required. Promise.
              </p>
              <p className="text-base text-gray-600 leading-relaxed">
                If you have ever looked at a silver article and wondered, <em>"What does 925 actually mean?"</em>, you are not alone. Silver purity is simply a way of telling us how much actual silver is present in a piece.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">
                First: What Does Purity Mean?
              </h3>
              <p>
                Imagine you have 1,000 tiny pieces of material. If 925 of those pieces are pure silver, the material is called <strong>925 purity</strong>.
              </p>
              <div className="p-4 bg-[#FBF9F5] border border-[#E5D5B5] rounded-xl text-center font-mono font-bold text-[#1A1A1A] text-lg sm:text-xl not-prose shadow-inner">
                925 ÷ 1000 = 92.5% Pure Silver Content
              </div>
              <p className="text-sm italic text-gray-500 text-center">
                A purity number is basically a percentage wearing a slightly more formal outfit!
              </p>
            </div>

            {/* Interactive Purity Cheat Sheet Table */}
            <div className="space-y-6 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-gray-100 pb-4">
                <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] m-0">
                  The Silver Purity Cheat Sheet
                </h3>
                <span className="text-xs font-sans font-bold text-[#AA820A] bg-amber-100 px-3 py-1 rounded-full w-max uppercase tracking-wider not-prose">
                  Indian Standards
                </span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm not-prose">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead className="bg-[#1A1A1A] text-white">
                    <tr>
                      <th className="p-4 font-serif font-bold text-base">Purity Mark</th>
                      <th className="p-4 font-serif font-bold text-base whitespace-nowrap">Silver Content</th>
                      <th className="p-4 font-serif font-bold text-base">Common Application</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-xl text-[#D4AF37]">999</td>
                      <td className="p-4 font-bold text-base text-gray-800">99.9%</td>
                      <td className="p-4 text-gray-600 leading-relaxed">Fine Pure Silver Coins, Bullion Bars, Sacred Murti Idols</td>
                    </tr>
                    <tr className="bg-[#FDFBF7] hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-xl text-[#D4AF37]">925</td>
                      <td className="p-4 font-bold text-base text-gray-800">92.5%</td>
                      <td className="p-4 text-gray-600 leading-relaxed">Sterling Silver Jewellery, Rings, Chains, Nazariya (Durability alloy)</td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-lg text-gray-700">970</td>
                      <td className="p-4 text-base text-gray-600">97.0%</td>
                      <td className="p-4 text-gray-600 leading-relaxed">Traditional Pooja Utensils, Diya Lamps, Special Vessels</td>
                    </tr>
                    <tr className="bg-[#FDFBF7] hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-lg text-gray-700">900 / 835</td>
                      <td className="p-4 text-base text-gray-600">90% / 83.5%</td>
                      <td className="p-4 text-gray-600 leading-relaxed">Vintage items, heavy antique anklets, decorative artifacts</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pure Silver Weight Formula */}
            <div className="space-y-6 pt-6">
              <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">
                Weight and Purity Are Different Things
              </h3>
              <p>
                Weight tells you how much the entire article weighs. Purity tells you how much of that material is precious silver.
              </p>
              <div className="p-6 sm:p-8 bg-gradient-to-br from-[#1A1A1A] to-[#2D3748] text-white rounded-2xl space-y-4 not-prose shadow-lg">
                <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] block">
                  THE ONE FORMULA WORTH REMEMBERING
                </span>
                <p className="font-mono text-lg sm:text-xl font-bold text-white border-l-4 border-[#D4AF37] pl-4">
                  Pure Silver Content = Weight × Purity ÷ 1000
                </p>
                <p className="text-sm text-white/80 pt-2">
                  Example: A 250g article with 925 purity contains <strong>250 × 925 ÷ 1000 = 231.25 grams</strong> of pure silver.
                </p>
              </div>
            </div>

            {/* BIS Hallmarking & HUID */}
            <div className="space-y-6 pt-6">
              <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">
                Reading the Silver Hallmark (IS 2112:2025)
              </h3>
              <p>
                Under the revised Indian Standard IS 2112:2025, every genuine hallmarked silver piece features 3 critical components:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 not-prose">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                  <span className="font-bold text-sm text-[#1A1A1A] block mb-1">1. BIS Standard Mark</span>
                  <span className="text-sm text-gray-500 leading-relaxed">The triangular BIS mark with the word "SILVER".</span>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                  <span className="font-bold text-sm text-[#1A1A1A] block mb-1">2. Purity Grade</span>
                  <span className="text-sm text-gray-500 leading-relaxed">925, 999 or official declared fineness grade.</span>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                  <span className="font-bold text-sm text-[#1A1A1A] block mb-1">3. HUID Code</span>
                  <span className="text-sm text-gray-500 leading-relaxed">Laser-engraved 6-character Unique ID traceable on BIS CARE App.</span>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="p-6 sm:p-8 bg-[#FDFBF7] rounded-2xl border-2 border-[#E5D5B5] space-y-4 not-prose mt-12">
              <span className="font-bold text-[#1A1A1A] block uppercase tracking-wider text-sm flex items-center gap-2">
                <span className="w-6 h-px bg-[#D4AF37]"></span>
                The 10-Second Memory Trick
              </span>
              <ul className="space-y-3 text-gray-700 text-base">
                <li className="flex items-start gap-3">
                  <span className="text-[#D4AF37] font-bold">•</span>
                  <span><strong>999</strong> → 99.9% pure silver → high purity fine bullion and sacred idols</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D4AF37] font-bold">•</span>
                  <span><strong>925</strong> → 92.5% silver → Sterling silver for strong, daily-wear jewellery</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D4AF37] font-bold">•</span>
                  <span><strong>Purity</strong> → how much precious silver is present in the alloy</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D4AF37] font-bold">•</span>
                  <span><strong>Hallmark</strong> → government recognized third-party purity guarantee</span>
                </li>
              </ul>
            </div>

          </article>
        ) : (
          /* ================= ABOUT US CONTENT ================= */
          <article className="prose prose-lg sm:prose-xl prose-headings:font-serif prose-headings:text-[#1A1A1A] prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-[#1A1A1A] max-w-none space-y-10">
            
            <p className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] leading-relaxed italic text-center px-4 sm:px-10">
              "Silver House began with a simple belief: silver is not just a precious metal. It is part of our traditions, celebrations, relationships and everyday life."
            </p>

            <div className="w-16 h-px bg-[#D4AF37] mx-auto my-12"></div>

            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">Where It All Began</h3>
              <p>
                Before starting Silver House, our founder spent years learning the jewellery trade from the ground up. He gained practical experience by working with established jewellery businesses and understanding the industry closely, from sourcing and product selection to quality, craftsmanship, pricing and customer relationships.
              </p>
              <p>
                That experience eventually gave him the confidence to build something of his own. In <strong>2010</strong>, Silver House was established in <strong>Ahmedabad, Gujarat</strong>, with a clear focus on quality silver products, dependable service and relationships that could stand the test of time.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">Built Through Wholesale</h3>
              <p>
                The early journey of Silver House was primarily shaped by the wholesale business. Instead of focusing only on individual transactions, we concentrated on building dependable relationships with jewellery retailers and established businesses.
              </p>
              <p>
                Over time, our products began reaching retail stores across different cities, towns and villages of Gujarat. Many of these relationships have continued for years, with retailers returning to us because of the consistency they have experienced in our products and service.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">Growing Across Gujarat & A New Chapter in Retail</h3>
              <p>
                From Ahmedabad, our network gradually expanded across Gujarat. Alongside our regular wholesale relationships, we have also served requirements connected with corporate and institutional gifting, traditional occasions and customised needs.
              </p>
              <p>
                Today, we are taking the next step by bringing Silver House directly to customers online. Our retail segment and digital presence are an extension of the business we have built over the years.
              </p>
            </div>

            {/* Belief Callout */}
            <div className="p-8 sm:p-10 bg-[#1A1A1A] text-white rounded-3xl space-y-6 not-prose my-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] opacity-10 rounded-bl-full"></div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] block">
                What We Believe
              </span>
              <p className="font-serif text-xl sm:text-2xl leading-relaxed text-gray-200 italic">
                "We believe a jewellery business is ultimately built on trust. Trust in the quality of the silver. Trust in the product. Trust in the people behind the business. And trust that remains long after a purchase has been made."
              </p>
              <div className="pt-6 border-t border-gray-800">
                <p className="text-sm text-gray-400 font-medium">
                  Established in Ahmedabad in 2010 • Built through wholesale • Strengthened through relationships.
                </p>
              </div>
            </div>

            {/* Contact details footer */}
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 text-sm text-gray-600 space-y-2 not-prose flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Silver House Ahmedabad</p>
                <p className="text-[#1A1A1A]">{compAddress}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Direct Inquiries</p>
                <p className="text-[#1A1A1A] font-medium">+91 {compPhone}</p>
                <p className="text-[#1A1A1A]">{compEmail}</p>
              </div>
            </div>
          </article>
        )}

      </main>

      <footer className="w-full border-t border-gray-100 py-12 mt-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="font-serif text-[#1A1A1A] font-bold text-lg mb-2">SILVER HOUSE</p>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Silver House. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
