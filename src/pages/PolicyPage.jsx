import React, { useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  RefreshCw,
  Truck,
  Info,
  PhoneCall,
  Clock,
  CreditCard,
  PackageCheck,
  CheckCircle2,
  Lock,
  HelpCircle,
  XCircle,
  AlertTriangle,
  Send
} from 'lucide-react';

export default function PolicyPage({ company }) {
  const { policyType } = useParams();
  const location = useLocation();

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
    if (p.includes('cancel')) return 'cancellation';
    if (p.includes('refund') || p.includes('return')) return 'refund';
    if (p.includes('ship') || p.includes('deliver')) return 'shipping';
    if (p.includes('about')) return 'about';
    return 'terms';
  };

  const activeKey = getNormalizedKey(policyType);

  const POLICY_METADATA = {
    terms: {
      title: 'Terms & Conditions',
      subtitle: 'Official Terms of Service governing purchases, website usage & legal framework',
      badge: 'Mandatory Policy Document',
      icon: FileText
    },
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'How we protect your personal information, handle cookies & secure online transactions',
      badge: 'Data Protection & Security',
      icon: ShieldCheck
    },
    refund: {
      title: 'Refund Policy',
      subtitle: '30-day customer satisfaction guarantee, assay inspection & 5-7 day direct refund settlement',
      badge: 'Refund Guarantee Policy',
      icon: RefreshCw
    },
    cancellation: {
      title: 'Cancellation Policy',
      subtitle: 'Order cancellation guidelines before dispatch, 100% full refund policy & modification rules',
      badge: 'Order Cancellation Policy',
      icon: XCircle
    },
    shipping: {
      title: 'Shipping & Delivery Policy',
      subtitle: '100% Transit Insured delivery across India, dispatch timelines & courier partners',
      badge: 'Logistics Assurance',
      icon: Truck
    },
    about: {
      title: 'About Silver House',
      subtitle: 'Established in 2010 in Ahmedabad • Decades of wholesale purity, trust & craftsmanship',
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
    <div className="w-full min-h-screen bg-[var(--th-bg)] text-[var(--th-text-main)] selection:bg-[var(--th-accent)] selection:text-white font-sans">
      
      {/* Classy Sticky Header */}
      <header className="w-full border-b border-[var(--th-border)] bg-[var(--th-card)]/85 backdrop-blur-md sticky top-0 z-50 shadow-2xs">
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
            <span className="hidden sm:inline">Support</span>
          </Link>
        </div>
      </header>

      {/* Main Luxury Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 md:py-16">
        
        {/* Classy Hero Header (No Tabs) */}
        <div className="text-center space-y-4 mb-12 pb-10 border-b border-[var(--th-border)] relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--th-accent)]/15 border border-[var(--th-accent)]/30 text-[var(--th-primary)] text-xs font-bold uppercase tracking-wider shadow-2xs">
            <currentMeta.icon className="w-3.5 h-3.5 text-[var(--th-accent)]" />
            <span>{currentMeta.badge}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--th-text-main)] tracking-tight leading-tight">
            {currentMeta.title}
          </h1>

          <p className="text-sm sm:text-base text-[var(--th-text-sub)] max-w-2xl mx-auto font-medium">
            {currentMeta.subtitle}
          </p>

          <div className="w-20 h-0.5 bg-[var(--th-accent)] mx-auto opacity-50 rounded-full pt-1" />
        </div>

        {/* ================= REFUND POLICY ================= */}
        {activeKey === 'refund' && (
          <div className="space-y-10">
            
            {/* Quick Visual Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] text-center space-y-2 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-[var(--th-accent)] flex items-center justify-center mx-auto">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider block text-[var(--th-text-main)]">30-Day Return Window</span>
                <span className="text-[11px] text-[var(--th-text-muted)] block">Hassle-free returns within 30 days of receipt</span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] text-center space-y-2 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-[var(--th-accent)] flex items-center justify-center mx-auto">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider block text-[var(--th-text-main)]">5-7 Day Settlement</span>
                <span className="text-[11px] text-[var(--th-text-muted)] block">Refund credited to original payment source</span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] text-center space-y-2 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-[var(--th-accent)] flex items-center justify-center mx-auto">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider block text-[var(--th-text-main)]">Original Packaging</span>
                <span className="text-[11px] text-[var(--th-text-muted)] block">Item must be unused with original BIS tags</span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] text-center space-y-2 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-[var(--th-accent)] flex items-center justify-center mx-auto">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider block text-[var(--th-text-main)]">Insured Transit</span>
                <span className="text-[11px] text-[var(--th-text-muted)] block">Damaged items replaced with 100% coverage</span>
              </div>
            </div>

            {/* Detailed Content Cards */}
            <div className="space-y-6">
              
              {/* Section 1 */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--th-card)] border border-[var(--th-border)] space-y-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-2xl font-bold text-[var(--th-accent)]">01.</span>
                  <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">Return Eligibility & Guidelines</h3>
                </div>
                <p className="text-sm text-[var(--th-text-sub)] leading-relaxed">
                  Our customer satisfaction policy lasts <strong>30 days</strong> from the date of package delivery. If 30 days have passed since delivery, we regret that we cannot offer a full refund or exchange.
                </p>
                <div className="p-4 rounded-xl bg-[var(--th-bg)] border border-[var(--th-border-subtle)] space-y-2 text-xs">
                  <span className="font-bold text-[var(--th-primary)] uppercase tracking-wider block">Requirements for Return Approval:</span>
                  <ul className="space-y-1.5 text-[var(--th-text-sub)]">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Item must be unused, unpolished, and in the exact condition received.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Item must be in original tamper-proof box with intact BIS Assay Hallmark certificate.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Valid tax invoice bill or digital order confirmation must accompany the return package.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 2 */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--th-card)] border border-[var(--th-border)] space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-2xl font-bold text-[var(--th-accent)]">02.</span>
                  <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">Refund Process & Settlement Timeline</h3>
                </div>
                <p className="text-sm text-[var(--th-text-sub)] leading-relaxed">
                  Once your returned article is received at our central office in Ahmedabad, our assay team will inspect the item for weight and silver fineness verification. We will immediately notify you by email/SMS regarding approval.
                </p>
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-700">
                    <CreditCard className="w-4 h-4" />
                    <span>Razorpay Direct Gateway Settlement</span>
                  </div>
                  <p className="text-[var(--th-text-sub)] leading-relaxed">
                    Upon return approval, your refund will be initiated instantly and automatically credited back to your original payment method (Credit/Debit Card, UPI, Netbanking) via Razorpay PG within <strong>5–7 working days</strong>.
                  </p>
                </div>
              </div>

              {/* Section 3 */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--th-card)] border border-[var(--th-border)] space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-2xl font-bold text-[var(--th-accent)]">03.</span>
                  <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">Damaged Items & Replacement Exchange</h3>
                </div>
                <p className="text-sm text-[var(--th-text-sub)] leading-relaxed">
                  We only replace items if they arrive defective or damaged during transit. If your parcel arrives tampered or damaged, please record an unboxing video and notify us at <strong>{compEmail}</strong> within 48 hours of delivery for an immediate free replacement.
                </p>
              </div>

              {/* Section 4 */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--th-card)] border border-[var(--th-border)] space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-2xl font-bold text-[var(--th-accent)]">04.</span>
                  <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">Return Dispatch Address</h3>
                </div>
                <p className="text-xs text-[var(--th-text-muted)]">Please send all authorized return shipments to our registered office address:</p>
                <div className="p-4 rounded-xl bg-[var(--th-bg)] border border-[var(--th-border)] text-xs space-y-1">
                  <p className="font-bold text-[var(--th-text-main)]">{compName} - Returns & Assay Department</p>
                  <p className="text-[var(--th-text-sub)]">{fullAddress}</p>
                  <p className="text-[var(--th-text-muted)] pt-1">Helpline: +91 {compPhone} | Email: {compEmail}</p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ================= CANCELLATION POLICY ================= */}
        {activeKey === 'cancellation' && (
          <div className="space-y-10">
            
            {/* Quick Visual Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] text-center space-y-2 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
                  <XCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider block text-[var(--th-text-main)]">Pre-Dispatch Window</span>
                <span className="text-[11px] text-[var(--th-text-muted)] block">Cancel anytime before courier pickup</span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] text-center space-y-2 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider block text-[var(--th-text-main)]">100% Full Refund</span>
                <span className="text-[11px] text-[var(--th-text-muted)] block">Zero cancellation fees for pre-shipment</span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] text-center space-y-2 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-[var(--th-accent)] flex items-center justify-center mx-auto">
                  <Send className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider block text-[var(--th-text-main)]">Instant Request</span>
                <span className="text-[11px] text-[var(--th-text-muted)] block">Submit via WhatsApp, Call, or Email</span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] text-center space-y-2 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider block text-[var(--th-text-main)]">Custom Orders</span>
                <span className="text-[11px] text-[var(--th-text-muted)] block">Cancel custom lockets within 6 hrs</span>
              </div>
            </div>

            {/* Detailed Content Cards */}
            <div className="space-y-6">
              
              {/* Section 1 */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--th-card)] border border-[var(--th-border)] space-y-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-2xl font-bold text-[var(--th-accent)]">01.</span>
                  <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">Ready-Stock Order Cancellations</h3>
                </div>
                <p className="text-sm text-[var(--th-text-sub)] leading-relaxed">
                  Orders for ready-stock silver items (coins, bars, murtis, silver utensils, jewellery) can be cancelled at any time <strong>before dispatch</strong> (usually within 12 hours of placing the order).
                </p>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 text-xs text-emerald-800">
                  <span className="font-bold uppercase tracking-wider block">Zero Cancellation Charges:</span>
                  <p>Upon cancellation before dispatch, 100% of your order value will be refunded directly back to your payment account via Razorpay within 24–48 hours.</p>
                </div>
              </div>

              {/* Section 2 */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--th-card)] border border-[var(--th-border)] space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-2xl font-bold text-[var(--th-accent)]">02.</span>
                  <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">Custom & Artisanal Order Cancellations</h3>
                </div>
                <p className="text-sm text-[var(--th-text-sub)] leading-relaxed">
                  Custom Artisanal orders (such as custom Yatra lockets or personalized engraved coins) involve bespoke silver casting and laser engraving. These orders can be cancelled within <strong>6 hours</strong> of order placement.
                </p>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                  <span className="font-bold text-[var(--th-text-main)] uppercase tracking-wider block">Important Note on Crafting:</span>
                  <p className="text-[var(--th-text-sub)]">Once silver casting or laser engraving has commenced after 6 hours, custom bespoke orders cannot be cancelled or altered.</p>
                </div>
              </div>

              {/* Section 3 */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--th-card)] border border-[var(--th-border)] space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-2xl font-bold text-[var(--th-accent)]">03.</span>
                  <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">Post-Dispatch Orders & In-Transit Packages</h3>
                </div>
                <p className="text-sm text-[var(--th-text-sub)] leading-relaxed">
                  Once an order has been picked up by our logistics courier partner (BlueDart / Delhivery / SpeedPost) and a tracking number has been generated, the order cannot be cancelled in transit. If you no longer require the item, you may return the unopened parcel upon delivery under our <Link to="/refund-policy" className="text-[var(--th-primary)] underline font-bold">30-Day Refund Policy</Link>.
                </p>
              </div>

              {/* Section 4 */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--th-card)] border border-[var(--th-border)] space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-2xl font-bold text-[var(--th-accent)]">04.</span>
                  <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">How to Request an Immediate Cancellation</h3>
                </div>
                <p className="text-xs text-[var(--th-text-muted)]">To cancel your order instantly, please contact our support team with your Order ID:</p>
                <div className="p-4 rounded-xl bg-[var(--th-bg)] border border-[var(--th-border)] text-xs space-y-2">
                  <div className="flex flex-wrap items-center gap-4">
                    <span>📞 <strong>Call / WhatsApp:</strong> +91 {compPhone}</span>
                    <span>✉️ <strong>Email:</strong> {compEmail}</span>
                  </div>
                  <p className="text-[var(--th-text-muted)] pt-1">Working Hours: Monday – Saturday (10:00 AM – 8:00 PM IST)</p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ================= TERMS & CONDITIONS ================= */}
        {activeKey === 'terms' && (
          <div className="space-y-8">
            
            <div className="p-6 rounded-3xl bg-[var(--th-card)] border border-[var(--th-border)] space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--th-accent)] block">Legal Agreement Summary</span>
              <p className="text-sm text-[var(--th-text-sub)] leading-relaxed">
                This website is operated by <strong>{compName}</strong> ("we", "us", "our"). Throughout the site, {compName} offers all information, tools, products, and services conditioned upon your acceptance of all terms, conditions, policies and notices stated herein.
              </p>
            </div>

            <div className="space-y-6 text-sm text-[var(--th-text-sub)]">
              
              <div className="p-6 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] space-y-2">
                <h3 className="font-serif text-lg font-bold text-[var(--th-text-main)]">1. Online Store & Product Terms</h3>
                <p className="leading-relaxed">
                  By agreeing to these Terms of Service, you represent that you are at least the age of majority in your jurisdiction. All products (including 999 fine silver coins, murti idols, utensils, and jewellery) are certified under Indian Standard IS 2112:2025.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] space-y-2">
                <h3 className="font-serif text-lg font-bold text-[var(--th-text-main)]">2. Live Rates & Price Modifications</h3>
                <p className="leading-relaxed">
                  Prices for precious silver items are linked to prevailing bullion market rates and are subject to change without prior notice. We reserve the right at any time to modify or discontinue any product line.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] space-y-2">
                <h3 className="font-serif text-lg font-bold text-[var(--th-text-main)]">3. Billing & Account Accuracy</h3>
                <p className="leading-relaxed">
                  We reserve the right to refuse any order placed with us. In the event that we make a change to or cancel an order, we will attempt to notify you via the email or phone number provided at the time of purchase.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] space-y-2">
                <h3 className="font-serif text-lg font-bold text-[var(--th-text-main)]">4. Governing Law & Jurisdiction</h3>
                <p className="leading-relaxed">
                  These Terms of Service and any separate agreements shall be governed by and construed in accordance with the laws of India and subject to the exclusive jurisdiction of competent courts in <strong>Ahmedabad, Gujarat, India</strong>.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ================= PRIVACY POLICY ================= */}
        {activeKey === 'privacy' && (
          <div className="space-y-8">
            
            <div className="p-6 rounded-3xl bg-[var(--th-card)] border border-[var(--th-border)] space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--th-accent)] block">Privacy Commitment</span>
              <p className="text-sm text-[var(--th-text-sub)] leading-relaxed">
                At <strong>{compName}</strong>, we strictly protect customer confidentiality. We collect personal data exclusively to process orders, deliver hallmarked silver goods, and provide customer support.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] space-y-2">
                <Lock className="w-6 h-6 text-[var(--th-accent)] mb-1" />
                <h3 className="font-serif text-base font-bold text-[var(--th-text-main)]">Razorpay PCI-DSS Security</h3>
                <p className="text-xs text-[var(--th-text-sub)] leading-relaxed">
                  Payment card data is processed directly via PCI-DSS compliant payment gateway (Razorpay). Neither {compName} nor any third party stores your card details.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] space-y-2">
                <ShieldCheck className="w-6 h-6 text-[var(--th-accent)] mb-1" />
                <h3 className="font-serif text-base font-bold text-[var(--th-text-main)]">Logistics Privacy</h3>
                <p className="text-xs text-[var(--th-text-sub)] leading-relaxed">
                  Delivery details (address, phone) are shared securely with verified transit partners (BlueDart, Delhivery, SpeedPost) solely for package delivery.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ================= SHIPPING POLICY ================= */}
        {activeKey === 'shipping' && (
          <div className="space-y-8">
            
            <div className="p-6 rounded-3xl bg-[var(--th-card)] border border-[var(--th-border)] space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--th-accent)] block">Transit Protection Guarantee</span>
              <p className="text-sm text-[var(--th-text-sub)] leading-relaxed">
                Every order dispatched from <strong>{compName}</strong> is 100% insured against loss, theft, or damage during transit until delivered directly to you.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] text-center space-y-2">
                <Clock className="w-6 h-6 text-[var(--th-accent)] mx-auto" />
                <span className="text-xs font-bold uppercase tracking-wider block text-[var(--th-text-main)]">24-48 Hr Dispatch</span>
                <span className="text-[11px] text-[var(--th-text-muted)] block">Ready stock items shipped within 1-2 business days</span>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] text-center space-y-2">
                <Truck className="w-6 h-6 text-[var(--th-accent)] mx-auto" />
                <span className="text-xs font-bold uppercase tracking-wider block text-[var(--th-text-main)]">Express Couriers</span>
                <span className="text-[11px] text-[var(--th-text-muted)] block">Partnered with BlueDart, Delhivery & SpeedPost</span>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] text-center space-y-2">
                <ShieldCheck className="w-6 h-6 text-[var(--th-accent)] mx-auto" />
                <span className="text-xs font-bold uppercase tracking-wider block text-[var(--th-text-main)]">100% Insurance</span>
                <span className="text-[11px] text-[var(--th-text-muted)] block">Complete financial cover against shipping transit risks</span>
              </div>
            </div>

          </div>
        )}

        {/* Classy Footer Contact Banner */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[var(--th-card)] via-[var(--th-bg)] to-[var(--th-card)] border border-[var(--th-border)] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-[var(--th-accent)] text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Need Assistance With This Policy?</span>
            </div>
            <h4 className="font-serif text-lg font-bold text-[var(--th-text-main)]">Our Customer Care Team is Ready to Help</h4>
            <p className="text-xs text-[var(--th-text-muted)]">Call or message us for order inquiries, returns, or assay certificates.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href={`tel:+91${compPhone}`}
              className="px-5 py-2.5 rounded-full bg-[var(--th-primary)] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call +91 {compPhone}</span>
            </a>

            <Link
              to="/contact-us"
              className="px-5 py-2.5 rounded-full border border-[var(--th-primary)] text-[var(--th-primary)] hover:bg-[var(--th-primary)] hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
            >
              <span>Contact Us Form</span>
            </Link>
          </div>
        </div>

      </main>

      {/* Page Footer */}
      <footer className="w-full border-t border-[var(--th-border)] py-8 bg-[var(--th-card)]/50">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-[var(--th-text-muted)]">
          <p>© {new Date().getFullYear()} {compName}. All Rights Reserved. • Registered Office: {fullAddress}</p>
        </div>
      </footer>

    </div>
  );
}
