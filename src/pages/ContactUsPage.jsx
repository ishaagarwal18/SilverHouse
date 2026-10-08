import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ContactUsPage({ company, onTriggerToast }) {
  const comp = company || {};
  const compName = comp.name || 'Silver House';
  const compAddress = comp.address || '217, Kanak Chamber, Gandhi Road';
  const compCity = comp.city || 'Ahmedabad';
  const compState = comp.state || 'Gujarat';
  const compPincode = comp.pincode || '380058';
  const compPhone = comp.contact_number || '9537178477';
  const compEmail = comp.email || 'sunilag28017@gmail.com';
  const fullAddress = `${compAddress}, ${compCity} - ${compPincode}, ${compState}, India`;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = `Contact Us - ${compName}`;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [compName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      if (onTriggerToast) onTriggerToast('Please fill in all required fields.', 'error');
      return;
    }
    setSubmitted(true);
    if (onTriggerToast) onTriggerToast('Message sent successfully! Our team will contact you within 24 hours.', 'success');
  };

  return (
    <div className="w-full min-h-screen bg-[var(--th-bg)] text-[var(--th-text-main)] selection:bg-[var(--th-accent)] selection:text-white">
      {/* Top Header Bar */}
      <header className="w-full border-b border-[var(--th-border)] bg-[var(--th-card)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--th-text-muted)] hover:text-[var(--th-primary)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>
          <div className="font-serif text-lg sm:text-xl font-bold tracking-widest text-[var(--th-text-main)] uppercase">
            {compName}
          </div>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--th-accent)]/15 border border-[var(--th-accent)]/30 text-[var(--th-primary)] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[var(--th-accent)]" />
            Mandatory Business Details & Customer Support
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--th-text-main)] tracking-tight">
            Contact Us
          </h1>
          <p className="text-sm sm:text-base text-[var(--th-text-sub)]">
            Have questions about our 999 fine silver coins, 925 sterling jewellery, or custom Yatra locket orders? Reach out to our customer support team directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Direct Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Legal Entity & Office Address Card */}
            <div className="p-6 sm:p-8 rounded-2xl border border-[var(--th-border)] bg-[var(--th-card)] shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-[var(--th-border)] pb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--th-accent)]/15 flex items-center justify-center text-[var(--th-accent)] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[var(--th-text-main)]">Registered Office & Showroom</h3>
                  <p className="text-xs text-[var(--th-text-muted)] font-medium">Legal Name: {compName}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-[var(--th-text-sub)] pt-1">
                <p className="font-medium leading-relaxed">{fullAddress}</p>
                <div className="p-3 rounded-xl bg-[var(--th-bg)] border border-[var(--th-border-subtle)] text-xs space-y-1">
                  <span className="font-bold text-[var(--th-primary)] uppercase tracking-wider block">Official Trade Entity</span>
                  <span className="text-[var(--th-text-main)] font-semibold block">{compName} (Silver Articles & Fine Jewellery)</span>
                  <span className="text-[var(--th-text-muted)] block">Est. 2010 • Ahmedabad, Gujarat</span>
                </div>
              </div>
            </div>

            {/* Direct Communication Details */}
            <div className="p-6 sm:p-8 rounded-2xl border border-[var(--th-border)] bg-[var(--th-card)] shadow-sm space-y-5">
              <h3 className="font-serif text-lg font-bold text-[var(--th-text-main)] border-b border-[var(--th-border)] pb-3">
                Customer Support Touchpoints
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--th-primary)]/10 text-[var(--th-primary)] flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--th-text-muted)] font-bold uppercase tracking-wider block">Phone & WhatsApp Support</span>
                    <a href={`tel:+91${compPhone}`} className="text-base font-bold text-[var(--th-primary)] hover:underline">
                      +91 {compPhone}
                    </a>
                    <p className="text-xs text-[var(--th-text-muted)] mt-0.5">Instant WhatsApp assistance available</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--th-primary)]/10 text-[var(--th-primary)] flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--th-text-muted)] font-bold uppercase tracking-wider block">Official Email Address</span>
                    <a href={`mailto:${compEmail}`} className="text-base font-bold text-[var(--th-primary)] hover:underline break-all">
                      {compEmail}
                    </a>
                    <p className="text-xs text-[var(--th-text-muted)] mt-0.5">Responses sent within 12-24 business hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--th-primary)]/10 text-[var(--th-primary)] flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--th-text-muted)] font-bold uppercase tracking-wider block">Business Working Hours</span>
                    <span className="font-semibold text-[var(--th-text-main)]">Monday – Saturday: 10:00 AM – 8:00 PM IST</span>
                    <p className="text-xs text-[var(--th-text-muted)] mt-0.5">Closed on Sunday & National Holidays</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality & Security Guarantee Badge */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-[var(--th-accent)] shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[var(--th-text-main)] uppercase tracking-wider block">BIS Hallmarked & 100% Insured</span>
                <span className="text-[var(--th-text-sub)]">All purchases and custom orders shipped with government assay certificate & full transit insurance.</span>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Us Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 md:p-10 rounded-3xl border border-[var(--th-border)] bg-[var(--th-card)] shadow-lg relative overflow-hidden">
              
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-bold text-[var(--th-text-main)]">Send Us a Message</h2>
                <p className="text-xs text-[var(--th-text-muted)] mt-1">
                  Fill out the form below and our dedicated customer support representative will get back to you shortly.
                </p>
              </div>

              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[var(--th-text-main)]">Message Received!</h3>
                  <p className="text-sm text-[var(--th-text-sub)] max-w-md mx-auto">
                    Thank you for reaching out to <strong>{compName}</strong>. We have logged your query and our team will get in touch with you at <strong>{formData.email}</strong> or <strong>{formData.phone}</strong>.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
                    }}
                    className="mt-4 px-6 py-2.5 rounded-full border border-[var(--th-primary)] text-[var(--th-primary)] text-xs font-bold uppercase tracking-wider hover:bg-[var(--th-primary)] hover:text-white transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--th-text-main)] uppercase tracking-wider mb-1.5">
                        Your Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--th-bg)] border border-[var(--th-border)] text-sm text-[var(--th-text-main)] placeholder-[var(--th-text-muted)] focus:outline-hidden focus:border-[var(--th-primary)] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--th-text-main)] uppercase tracking-wider mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. rahul@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--th-bg)] border border-[var(--th-border)] text-sm text-[var(--th-text-main)] placeholder-[var(--th-text-muted)] focus:outline-hidden focus:border-[var(--th-primary)] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--th-text-main)] uppercase tracking-wider mb-1.5">
                        Phone Number / WhatsApp
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--th-bg)] border border-[var(--th-border)] text-sm text-[var(--th-text-main)] placeholder-[var(--th-text-muted)] focus:outline-hidden focus:border-[var(--th-primary)] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--th-text-main)] uppercase tracking-wider mb-1.5">
                        Inquiry Topic
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--th-bg)] border border-[var(--th-border)] text-sm text-[var(--th-text-main)] focus:outline-hidden focus:border-[var(--th-primary)] transition-colors cursor-pointer"
                      >
                        <option value="General Inquiry">General Product Inquiry</option>
                        <option value="Custom Yatra Locket">Custom Yatra Locket Order</option>
                        <option value="Bulk / Gifting Order">Wholesale / Corporate Gifting</option>
                        <option value="Order Tracking">Existing Order Status</option>
                        <option value="Returns & Exchanges">Return / Exchange Query</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--th-text-main)] uppercase tracking-wider mb-1.5">
                      Your Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Please describe how we can help you..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--th-bg)] border border-[var(--th-border)] text-sm text-[var(--th-text-main)] placeholder-[var(--th-text-muted)] focus:outline-hidden focus:border-[var(--th-primary)] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-[var(--th-primary)] hover:brightness-110 text-white font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Inquiry</span>
                  </button>

                  <p className="text-[11px] text-[var(--th-text-muted)] text-center pt-2">
                    By submitting this form, you agree to our <Link to="/privacy-policy" className="underline hover:text-[var(--th-primary)]">Privacy Policy</Link> and <Link to="/terms-and-conditions" className="underline hover:text-[var(--th-primary)]">Terms of Service</Link>.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Footer copyright bar */}
      <footer className="w-full border-t border-[var(--th-border)] py-8 bg-[var(--th-card)]/50">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-[var(--th-text-muted)]">
          <p>© {new Date().getFullYear()} {compName}. All Rights Reserved. • Registered Office: {fullAddress}</p>
        </div>
      </footer>
    </div>
  );
}
