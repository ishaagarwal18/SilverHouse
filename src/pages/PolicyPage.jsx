import React, { useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText, RefreshCw, Truck, Info, PhoneCall } from 'lucide-react';

export default function PolicyPage({ company }) {
  const { policyType } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const comp = company || {};
  const compName = comp.name || 'Silver House';
  const compAddress = comp.address || '217, Kanak Chamber, Gandhi Road';
  const compCity = comp.city || 'Ahmedabad';
  const compState = comp.state || 'Gujarat';
  const compPincode = comp.pincode || '380058';
  const compPhone = comp.contact_number || '9537178477';
  const compEmail = comp.email || 'sunilag28017@gmail.com';
  const fullAddress = `${compAddress}, ${compCity} - ${compPincode}, ${compState}, India`;

  // Normalize policy key from URL params or location path
  const getNormalizedKey = (raw) => {
    const p = (raw || location.pathname || '').toLowerCase();
    if (p.includes('term')) return 'terms';
    if (p.includes('privac')) return 'privacy';
    if (p.includes('refund') || p.includes('cancel') || p.includes('return')) return 'refund';
    if (p.includes('ship') || p.includes('deliver')) return 'shipping';
    if (p.includes('about')) return 'about';
    return 'terms';
  };

  const activeKey = getNormalizedKey(policyType);


  const POLICY_METADATA = {
    terms: {
      title: 'Terms & Conditions',
      subtitle: 'Official Terms of Service governing purchases, use of site & legal agreements',
      badge: 'Mandatory Policy Document',
      icon: FileText
    },
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'How we collect, protect, and handle your personal data & payment security',
      badge: 'Data Protection & Security',
      icon: ShieldCheck
    },
    refund: {
      title: 'Refund & Cancellation Policy',
      subtitle: '30-day return policy, cancellation guidelines, inspection & refund timeline',
      badge: 'Customer Guarantee Policy',
      icon: RefreshCw
    },
    shipping: {
      title: 'Shipping & Delivery Policy',
      subtitle: '100% Transit Insured delivery, dispatch timelines & courier partner details',
      badge: 'Logistics Assurance',
      icon: Truck
    },
    about: {
      title: 'About Silver House',
      subtitle: 'Established in 2010 in Ahmedabad • Heritage of wholesale, purity & trust',
      badge: 'Company Profile & Heritage',
      icon: Info
    }
  };

  const currentMeta = POLICY_METADATA[activeKey] || POLICY_METADATA.terms;

  useEffect(() => {
    document.title = `${currentMeta.title} - ${compName}`;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeKey, currentMeta, compName]);

  return (
    <div className="w-full min-h-screen bg-[var(--th-bg)] text-[var(--th-text-main)] selection:bg-[var(--th-accent)] selection:text-white">
      {/* Top Navigation Header */}
      <header className="w-full border-b border-[var(--th-border)] bg-[var(--th-card)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--th-text-muted)] hover:text-[var(--th-primary)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>
          <div className="font-serif text-lg sm:text-xl font-bold tracking-widest text-[var(--th-text-main)] uppercase">
            {compName}
          </div>
          <Link to="/contact-us" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--th-primary)] hover:underline">
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Contact Us</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 md:py-16">
        
        {/* Navigation Tabs Bar */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-[var(--th-card)] border border-[var(--th-border)] rounded-2xl mb-12 scrollbar-none shadow-sm">
          <button
            onClick={() => navigate('/terms-and-conditions')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeKey === 'terms'
                ? 'bg-[var(--th-primary)] text-white shadow-sm'
                : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:bg-[var(--th-bg)]'
            }`}
          >
            Terms & Conditions
          </button>

          <button
            onClick={() => navigate('/privacy-policy')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeKey === 'privacy'
                ? 'bg-[var(--th-primary)] text-white shadow-sm'
                : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:bg-[var(--th-bg)]'
            }`}
          >
            Privacy Policy
          </button>

          <button
            onClick={() => navigate('/refund-and-cancellation')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeKey === 'refund'
                ? 'bg-[var(--th-primary)] text-white shadow-sm'
                : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:bg-[var(--th-bg)]'
            }`}
          >
            Refund & Cancellation
          </button>

          <button
            onClick={() => navigate('/shipping-policy')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeKey === 'shipping'
                ? 'bg-[var(--th-primary)] text-white shadow-sm'
                : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:bg-[var(--th-bg)]'
            }`}
          >
            Shipping Policy
          </button>

          <button
            onClick={() => navigate('/about-us')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeKey === 'about'
                ? 'bg-[var(--th-primary)] text-white shadow-sm'
                : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:bg-[var(--th-bg)]'
            }`}
          >
            About Us
          </button>
        </div>

        {/* Hero Header */}
        <div className="text-center space-y-4 mb-12 pb-8 border-b border-[var(--th-border)]">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--th-accent)]/15 border border-[var(--th-accent)]/30 text-[var(--th-primary)] text-xs font-bold uppercase tracking-wider">
            <currentMeta.icon className="w-3.5 h-3.5 text-[var(--th-accent)]" />
            {currentMeta.badge}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--th-text-main)] tracking-tight">
            {currentMeta.title}
          </h1>
          <p className="text-sm sm:text-base text-[var(--th-text-sub)] max-w-2xl mx-auto">
            {currentMeta.subtitle}
          </p>
        </div>

        {/* Policy Content Sections */}
        <article className="prose prose-lg dark:prose-invert max-w-none text-[var(--th-text-sub)] leading-relaxed space-y-8">
          
          {/* ================= TERMS & CONDITIONS ================= */}
          {activeKey === 'terms' && (
            <div className="space-y-8">
              <div className="p-5 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] text-xs space-y-1 font-sans">
                <p className="font-bold text-[var(--th-text-main)] uppercase tracking-wider">Legal Entity & Website Operator</p>
                <p>This website is operated by <strong>{compName}</strong> ("we", "us", "our"). Throughout the site, {compName} offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.</p>
              </div>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">SECTION 1 - ONLINE STORE TERMS</h3>
                <p className="text-sm">By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).</p>
              </section>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">SECTION 2 - GENERAL CONDITIONS</h3>
                <p className="text-sm">We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted over various networks. Credit card & payment transaction information is always encrypted during transfer over networks via PCI-DSS compliant payment gateways (Razorpay).</p>
              </section>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">SECTION 3 - ACCURACY, COMPLETENESS AND TIMELINESS OF INFORMATION</h3>
                <p className="text-sm">We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate sources.</p>
              </section>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">SECTION 4 - MODIFICATIONS TO THE SERVICE AND PRICES</h3>
                <p className="text-sm">Prices for our products (including live silver rate adjustments) are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.</p>
              </section>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">SECTION 5 - PRODUCTS OR SERVICES</h3>
                <p className="text-sm">Certain products or services (such as custom Yatra lockets, 999 fine silver coins, or murti idols) may be available exclusively online through the website. These products are subject to return or exchange only according to our Return Policy. Every piece is hallmarked under BIS standards.</p>
              </section>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">SECTION 6 - ACCURACY OF BILLING AND ACCOUNT INFORMATION</h3>
                <p className="text-sm">We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. You agree to provide current, complete and accurate purchase and account information for all purchases made at our store.</p>
              </section>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">SECTION 7 - OPTIONAL TOOLS & THIRD-PARTY LINKS</h3>
                <p className="text-sm">We may provide access to third-party tools or links over which we neither monitor nor have any control. We shall have no liability whatsoever arising from or relating to your use of optional third-party tools or websites.</p>
              </section>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">SECTION 8 - PROHIBITED USES</h3>
                <p className="text-sm">In addition to other prohibitions, you are prohibited from using the site or its content: (a) for any unlawful purpose; (b) to solicit others to perform unlawful acts; (c) to violate regulations or laws; (d) to infringe upon intellectual property; (e) to submit false information; (f) to upload viruses or malicious code.</p>
              </section>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">SECTION 9 - GOVERNING LAW & JURISDICTION</h3>
                <p className="text-sm">These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India and subject to the jurisdiction of courts in <strong>Ahmedabad, Gujarat, India</strong>.</p>
              </section>

              <section className="space-y-3 pt-4 border-t border-[var(--th-border)]">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">SECTION 10 - CONTACT INFORMATION</h3>
                <p className="text-sm">Questions about the Terms of Service should be sent to us at:</p>
                <div className="p-4 rounded-xl bg-[var(--th-card)] border border-[var(--th-border)] text-xs space-y-1">
                  <p className="font-bold text-[var(--th-text-main)]">{compName}</p>
                  <p>{fullAddress}</p>
                  <p>Email: <a href={`mailto:${compEmail}`} className="text-[var(--th-primary)] underline">{compEmail}</a> | Phone: +91 {compPhone}</p>
                </div>
              </section>
            </div>
          )}

          {/* ================= PRIVACY POLICY ================= */}
          {activeKey === 'privacy' && (
            <div className="space-y-8">
              <div className="p-5 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] text-xs space-y-1 font-sans">
                <p className="font-bold text-[var(--th-text-main)] uppercase tracking-wider">Privacy & Data Security Standard</p>
                <p>At <strong>{compName}</strong>, we respect your privacy. This Privacy Policy details how your personal information is collected, used, and safeguarded when you visit or make a purchase from our website.</p>
              </div>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">1. WHAT INFORMATION DO WE COLLECT?</h3>
                <p className="text-sm">When you purchase something from our store, we collect the personal information you give us such as your name, delivery address, phone number, and email address. When you browse our store, we also automatically receive your computer’s internet protocol (IP) address to provide us with information that helps us optimize your browsing experience.</p>
              </section>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">2. CONSENT & WITHDRAWAL</h3>
                <p className="text-sm">When you provide us with personal information to complete a transaction, verify your payment method, place an order, or arrange for a delivery, we imply that you consent to our collecting it and using it for that specific reason only. If you wish to withdraw your consent at any time, you may contact us at <strong>{compEmail}</strong>.</p>
              </section>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">3. PAYMENT PROCESSING (RAZORPAY & PCI-DSS)</h3>
                <p className="text-sm">We use <strong>Razorpay</strong> for processing online payments. Neither {compName} nor Razorpay stores your card or bank credentials on our servers. All transactional data is encrypted through the Payment Card Industry Data Security Standard (PCI-DSS) while processing payment. PCI-DSS requirements ensure the secure handling of payment data by our store and its payment gateway providers.</p>
              </section>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">4. THIRD-PARTY SERVICES</h3>
                <p className="text-sm">In general, the third-party providers used by us (such as logistics partners BlueDart, Delhivery, Speed Post) will only collect, use and disclose your information to the extent necessary to allow them to perform the delivery services they provide to us.</p>
              </section>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">5. SECURITY & COOKIES</h3>
                <p className="text-sm">To protect your personal information, we take industry-standard precautions and follow best practices to make sure it is not inappropriately lost, misused, accessed, disclosed, altered or destroyed. We use cookies to maintain your active shopping cart session.</p>
              </section>

              <section className="space-y-3 pt-4 border-t border-[var(--th-border)]">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">6. PRIVACY COMPLIANCE OFFICER CONTACT</h3>
                <p className="text-sm">If you would like to access, correct, amend or delete any personal information we have about you, please contact our Privacy Compliance Officer at:</p>
                <div className="p-4 rounded-xl bg-[var(--th-card)] border border-[var(--th-border)] text-xs space-y-1">
                  <p className="font-bold text-[var(--th-text-main)]">{compName} - Privacy Compliance</p>
                  <p>{fullAddress}</p>
                  <p>Email: <a href={`mailto:${compEmail}`} className="text-[var(--th-primary)] underline">{compEmail}</a> | Phone: +91 {compPhone}</p>
                </div>
              </section>
            </div>
          )}

          {/* ================= REFUND & CANCELLATION ================= */}
          {activeKey === 'refund' && (
            <div className="space-y-8">
              <div className="p-5 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] text-xs space-y-1 font-sans">
                <p className="font-bold text-[var(--th-text-main)] uppercase tracking-wider">30-Day Customer Satisfaction Guarantee</p>
                <p>Our return policy lasts <strong>30 days</strong>. If 30 days have gone by since your purchase, unfortunately we cannot offer you a full refund or exchange. Custom bespoke orders are evaluated under assay guidelines.</p>
              </div>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">1. ELIGIBILITY FOR RETURNS</h3>
                <p className="text-sm">To be eligible for a return, your item must be unused, in the same condition that you received it, and must be in its original tamper-proof packaging along with the original BIS Assay Certificate and invoice bill.</p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Custom engraved Yatra lockets or personalized coins cannot be returned unless damaged in transit.</li>
                  <li>Proof of purchase (invoice bill or order ID) is required for all returns.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">2. REFUND PROCESS & TIMELINE</h3>
                <p className="text-sm">Once your return is received and inspected by our assay verification team, we will send you an email/SMS notification regarding the approval or rejection of your refund.</p>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                  <p className="font-bold text-[var(--th-text-main)]">Approved Refund Settlement:</p>
                  <p className="text-[var(--th-text-sub)]">If approved, your refund will be processed and a credit will automatically be applied to your original method of payment (via Razorpay PG) within <strong>5–7 working days</strong>.</p>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">3. EXCHANGES & DAMAGE CLAIMS</h3>
                <p className="text-sm">We only replace items if they are defective or damaged during transit. If you need to exchange a damaged item for the same product, please email us at <strong>{compEmail}</strong> with unboxing photo/video proof within 48 hours of delivery.</p>
              </section>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">4. ORDER CANCELLATION</h3>
                <p className="text-sm">Orders for ready-stock items can be cancelled before dispatch (usually within 12 hours of placing the order) for a 100% full refund. Once shipped, cancellations follow standard return procedures.</p>
              </section>

              <section className="space-y-3 pt-4 border-t border-[var(--th-border)]">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">5. RETURN SHIPMENT ADDRESS</h3>
                <p className="text-sm">To return your product, please ship your package to our central office:</p>
                <div className="p-4 rounded-xl bg-[var(--th-card)] border border-[var(--th-border)] text-xs space-y-1">
                  <p className="font-bold text-[var(--th-text-main)]">{compName} - Returns Dept.</p>
                  <p>{fullAddress}</p>
                  <p>Helpline: +91 {compPhone} | Email: {compEmail}</p>
                </div>
              </section>
            </div>
          )}

          {/* ================= SHIPPING POLICY ================= */}
          {activeKey === 'shipping' && (
            <div className="space-y-8">
              <div className="p-5 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] text-xs space-y-1 font-sans">
                <p className="font-bold text-[var(--th-text-main)] uppercase tracking-wider">100% Transit Insured Delivery</p>
                <p>All shipments from <strong>{compName}</strong> are fully insured against theft, loss, or damage until delivered into your hands.</p>
              </div>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">1. PROCESSING & DISPATCH TIMELINE</h3>
                <p className="text-sm">Orders for ready-stock items (coins, bars, murtis, silver utensils) are dispatched within 24–48 hours. Custom artisanal Yatra lockets require 3–5 working days for hand crafting and laser engraving.</p>
              </section>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">2. DELIVERY ESTIMATES ACROSS INDIA</h3>
                <ul className="list-disc pl-5 text-sm space-y-2">
                  <li><strong>Gujarat Metro (Ahmedabad, Surat, Vadodara, Rajkot)</strong>: 1–2 business days.</li>
                  <li><strong>Rest of India (Metro Cities)</strong>: 3–4 business days.</li>
                  <li><strong>Tier 2 & Rural Regions</strong>: 5–7 business days via insured Speed Post / Express Courier.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">3. TRACKING YOUR SHIPMENT</h3>
                <p className="text-sm">Once dispatched, an automated SMS, WhatsApp, and Email with your tracking ID and courier link (BlueDart / Delhivery / SpeedPost) will be sent to your registered contact details.</p>
              </section>
            </div>
          )}

          {/* ================= ABOUT US ================= */}
          {activeKey === 'about' && (
            <div className="space-y-8">
              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-sm italic font-serif text-[var(--th-text-main)]">
                "Silver House began in 2010 with a simple belief: silver is not just a metal. It is part of our sacred traditions, celebrations, family relationships, and lifelong memories."
              </div>

              <section className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">Our Heritage & Story</h3>
                <p className="text-sm">Established in 2010 in <strong>Ahmedabad, Gujarat</strong>, {compName} grew through decades of wholesale trust with jewellery retailers across Gujarat. Today, we bring our 100% BIS Hallmarked 999 fine silver coins, 925 sterling jewellery, baby silver items, and artisanal Yatra lockets directly to customers across India.</p>
              </section>

              <section className="space-y-3 border-t border-[var(--th-border)] pt-6">
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">Registered Trade Details</h3>
                <div className="p-4 rounded-xl bg-[var(--th-card)] border border-[var(--th-border)] text-xs space-y-1">
                  <p className="font-bold text-[var(--th-text-main)]">{compName}</p>
                  <p>{fullAddress}</p>
                  <p>Customer Support: +91 {compPhone} | Email: {compEmail}</p>
                </div>
              </section>
            </div>
          )}

        </article>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--th-border)] py-8 bg-[var(--th-card)]/50">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-[var(--th-text-muted)]">
          <p>© {new Date().getFullYear()} {compName}. All Rights Reserved. • {fullAddress}</p>
        </div>
      </footer>
    </div>
  );
}
