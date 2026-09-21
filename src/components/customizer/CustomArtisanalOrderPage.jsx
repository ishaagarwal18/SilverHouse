import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crown, Sparkles, Church, HeartHandshake, Upload, Image as ImageIcon,
  Trash2, Check, ShieldCheck, Clock, Phone, User, Mail, FileText,
  AlertCircle, ChevronRight, Copy, CheckCircle2, ArrowRight, Layers
} from 'lucide-react';
import { submitCustomOrderApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ARTISANAL_CATEGORIES = [
  {
    id: 'Mukhut',
    name: 'Mukhut',
    hindi: 'मुकुट',
    icon: Crown,
    tagline: 'Divine Silver Crowns for Deities',
    description: 'Bespoke hand-chased crowns for Radha Krishna, Laddu Gopal, Hanumanji, and temple deities with filigree, peacock feather crests, and gemstone settings.',
    popularMotifs: ['Peacock Feather (Mor Pankh)', 'Surya Kiran (Sun Rays)', 'Floral Filigree (Tarkashi)', 'Gemstone Setting Accents'],
    presetSpecs: 'Crown height: approx 4 to 6 inches, deity head circumference: 8 to 12 cm, 92.5 Sterling Silver, peacock feather filigree carving.'
  },
  {
    id: 'Jhalar',
    name: 'Jhalar',
    hindi: 'झालर',
    icon: Sparkles,
    tagline: 'Ornate Altar & Sanctum Hangings',
    description: 'Traditional handcrafted silver fringe borders, altar hangings, and sanctum canopy trims with dangling silver bells (ghungroo) and floral lace.',
    popularMotifs: ['Dangling Ghungroo Bells', 'Lotus Petal Border', 'Interlocking Vine Chain', 'Altar Canopy Trim'],
    presetSpecs: 'Altar border length: 24 to 36 inches, drop height: 3 inches, delicate hanging silver bells, high-polish sterling silver.'
  },
  {
    id: 'Thakurji ka saman',
    name: 'Thakurji ka saman',
    hindi: 'ठाकुरजी का सामान',
    icon: HeartHandshake,
    tagline: 'Sacred Seva & Royal Deity Regalia',
    description: 'Exquisite silver articles for deity seva including carved flutes (Bansuri), royal singhasan (thrones), chhatra (parasols), and charan padukas.',
    popularMotifs: ['Engraved Bansuri (Flute)', 'Carved Singhasan (Throne)', 'Royal Chhatra (Parasol)', 'Sacred Charan Paduka'],
    presetSpecs: 'Deity Singhasan: 6x6 inch base, royal chhatra parasol with peacock finial, heavy gauge sterling silver.'
  },
  {
    id: 'Temple things',
    name: 'Temple things',
    hindi: 'मंदिर सामग्री',
    icon: Church,
    tagline: 'Sanctified Altar Vessels & Artifacts',
    description: 'Consecrated silver artifacts for temples and home shrines: multi-wick Aarti diyas, kalash with coconut carving, shankh stands, and temple bells.',
    popularMotifs: ['Panchmukhi Aarti Diya', 'Kalash with Coconut Finial', 'Carved Shankh Stand', 'Nandi Temple Bell'],
    presetSpecs: 'Panchmukhi Aarti Diya: 5 wicks with ornate peacock handle, solid 92.5 sterling silver, heat-resistant base.'
  }
];

export default function CustomArtisanalOrderPage({ onTriggerToast }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Form State
  const [selectedCategory, setSelectedCategory] = useState(ARTISANAL_CATEGORIES[0].id);
  const [purity, setPurity] = useState('92.5 Sterling Silver');
  const [approxDimensions, setApproxDimensions] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [description, setDescription] = useState('');
  
  // Contact details
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  // Multi-image file upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);

  // Submission & Confirmation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);

  // Active category object
  const activeCategoryObj = ARTISANAL_CATEGORIES.find(c => c.id === selectedCategory) || ARTISANAL_CATEGORIES[0];

  // Handle Multi-file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files || files.length === 0) return;

    // Limit to max 8 images total
    const totalFiles = [...selectedFiles, ...files].slice(0, 8);
    setSelectedFiles(totalFiles);

    // Create object URLs for thumbnail previews
    const urls = totalFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleRemoveImage = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedUrls = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviewUrls(updatedUrls);
  };

  const handleApplyPresetMotif = (motif) => {
    setDescription(prev => {
      const addition = `Prefer motif / styling: ${motif}.`;
      return prev ? `${prev}\n${addition}` : addition;
    });
    if (onTriggerToast) {
      onTriggerToast(`Added motif preference: "${motif}"`);
    }
  };

  const handleApplyPresetSpecs = () => {
    setDescription(prev => {
      const preset = activeCategoryObj.presetSpecs;
      return prev ? `${prev}\n${preset}` : preset;
    });
    if (onTriggerToast) {
      onTriggerToast(`Applied recommended specs for ${activeCategoryObj.name}`);
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      if (onTriggerToast) onTriggerToast('Please describe your custom order requirements.', 'error');
      return;
    }
    if (!customerName.trim()) {
      if (onTriggerToast) onTriggerToast('Please enter your full name.', 'error');
      return;
    }
    if (!customerPhone.trim()) {
      if (onTriggerToast) onTriggerToast('Please enter your phone/WhatsApp number.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('custom_category', selectedCategory);
      
      // Build comprehensive description text
      let fullDescription = `Category: ${selectedCategory} (${activeCategoryObj.hindi})\nSilver Purity: ${purity}\n`;
      if (approxDimensions.trim()) fullDescription += `Estimated Dimensions / Deity Size: ${approxDimensions.trim()}\n`;
      if (targetWeight.trim()) fullDescription += `Target Silver Weight: ${targetWeight.trim()}\n`;
      fullDescription += `\nDetailed Specifications:\n${description.trim()}`;

      formData.append('description', fullDescription);
      formData.append('customer_name', customerName.trim());
      formData.append('customer_phone', customerPhone.trim());
      if (customerEmail.trim()) {
        formData.append('customer_email', customerEmail.trim());
      }
      if (user?.userId) {
        formData.append('user_id', user.userId);
      }

      // Append multi-files
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await submitCustomOrderApi(formData);

      if (res.success && res.order) {
        setSubmittedOrder(res.order);
        if (onTriggerToast) {
          onTriggerToast('Custom order placed! Quotation pending from master artisans.', 'success');
        }
      } else {
        if (onTriggerToast) {
          onTriggerToast(res.error || 'Failed to place custom order. Please try again.', 'error');
        }
      }
    } catch (err) {
      console.error('Error submitting custom order:', err);
      if (onTriggerToast) {
        onTriggerToast('Network error while placing custom order.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyOrderNumber = () => {
    if (!submittedOrder?.order_number) return;
    navigator.clipboard.writeText(submittedOrder.order_number);
    setCopiedOrderNumber(true);
    setTimeout(() => setCopiedOrderNumber(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[var(--th-bg)] text-[var(--th-text-main)] py-8 px-4 sm:px-6 lg:px-8">
      {/* Container */}
      <div className="max-w-5xl mx-auto space-y-10">

        {/* 1. HERO HEADER */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[var(--th-accent)]/10 text-[var(--th-accent)] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Silversmith Bespoke Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--th-text-main)] font-serif">
            Custom Silver Devotional & Artisanal Orders
          </h1>
          <p className="text-sm sm:text-base text-[var(--th-text-muted)] max-w-2xl mx-auto leading-relaxed">
            Commission bespoke sacred silver regalia crafted to your precise deity measurements and temple architectural requirements by hereditary master silversmiths.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-semibold text-[var(--th-text-muted)]">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> 100% Certified Silver Purity
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Crown className="w-4 h-4" /> Hand-Chased Artisanal Craft
            </span>
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-4 h-4" /> Personalized Price Quotation
            </span>
          </div>
        </div>

        {/* 2. CATEGORY SELECTION CARDS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--th-text-main)] flex items-center gap-2">
              <span>1. Choose Custom Item Category</span>
              <span className="text-xs text-[var(--th-accent)] font-semibold">({ARTISANAL_CATEGORIES.length} Sacred Specialties)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ARTISANAL_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`relative p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[var(--th-card)] border-[var(--th-primary)] shadow-lg shadow-[var(--th-primary)]/10 ring-2 ring-[var(--th-primary)]/20'
                      : 'bg-[var(--th-surface)] border-[var(--th-border)] hover:border-[var(--th-primary)]/50 hover:bg-[var(--th-card)]'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-[var(--th-primary)] text-white'
                          : 'bg-[var(--th-surface-alt)] text-[var(--th-text-muted)]'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-serif font-bold text-[var(--th-accent)]">{cat.hindi}</span>
                    </div>

                    <div>
                      <div className="font-extrabold text-base text-[var(--th-text-main)]">{cat.name}</div>
                      <div className="text-xs font-medium text-[var(--th-text-muted)] mt-1 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--th-border)]/60 flex items-center justify-between text-xs font-bold">
                    <span className={isSelected ? 'text-[var(--th-primary)]' : 'text-[var(--th-text-muted)]'}>
                      {isSelected ? '✓ Selected' : 'Select'}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-1 text-[var(--th-primary)]' : 'text-[var(--th-text-muted)]'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. POPULAR DESIGN MOTIFS FOR SELECTED CATEGORY */}
        <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-2xl p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-sm font-bold text-[var(--th-text-main)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--th-accent)]" />
              <span>Inspiration Motifs for {activeCategoryObj.name} ({activeCategoryObj.hindi})</span>
            </div>
            <button
              type="button"
              onClick={handleApplyPresetSpecs}
              className="text-xs font-bold text-[var(--th-primary)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Insert Recommended Specs</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeCategoryObj.popularMotifs.map((motif, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPresetMotif(motif)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--th-border)] bg-[var(--th-surface)] hover:border-[var(--th-primary)] hover:text-[var(--th-primary)] transition-all cursor-pointer flex items-center gap-1.5"
                title="Click to add to your description"
              >
                <span>+</span>
                <span>{motif}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. MAIN CUSTOMIZATION FORM */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Specifications Card */}
          <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-[var(--th-text-main)] flex items-center gap-2 border-b border-[var(--th-border)] pb-4">
              <span>2. Dimensions, Purity & Detailed Specifications</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Silver Purity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--th-text-muted)] mb-2">
                  Silver Purity *
                </label>
                <select
                  value={purity}
                  onChange={(e) => setPurity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--th-border)] bg-[var(--th-surface)] text-[var(--th-text-main)] text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[var(--th-primary)] cursor-pointer"
                >
                  <option value="92.5 Sterling Silver">92.5 Sterling Silver (Hallmarked Standard)</option>
                  <option value="99.9 Pure Silver">99.9 Pure Silver (Sacred Puja Fine Silver)</option>
                </select>
              </div>

              {/* Dimensions / Deity Size */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--th-text-muted)] mb-2">
                  Deity Idol Size / Dimensions
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9-inch idol height, 4-inch mukut"
                  value={approxDimensions}
                  onChange={(e) => setApproxDimensions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--th-border)] bg-[var(--th-surface)] text-[var(--th-text-main)] text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[var(--th-primary)]"
                />
              </div>

              {/* Target Weight (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--th-text-muted)] mb-2">
                  Target Weight (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. approx 150 - 250 grams"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--th-border)] bg-[var(--th-surface)] text-[var(--th-text-main)] text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[var(--th-primary)]"
                />
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--th-text-muted)] mb-2">
                Detailed Crafting & Design Instructions *
              </label>
              <textarea
                rows={5}
                required
                placeholder={`Describe your vision for this ${activeCategoryObj.name} in detail. Include deity names (e.g. Radha Rani, Laddu Gopal, Mahadev), specific engraving motifs, stone colors, or finish style (High Polish, Antique Oxidised, or Gold Gilt accents)...`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 rounded-xl border border-[var(--th-border)] bg-[var(--th-surface)] text-[var(--th-text-main)] text-sm leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[var(--th-primary)]"
              />
              <p className="text-xs text-[var(--th-text-muted)] mt-1.5">
                Tip: You can specify idol forehead curvature, back attachment bands, chain drop lengths, or temple shrine aesthetics.
              </p>
            </div>
          </div>

          {/* 5. MULTI-IMAGE INSPIRATION UPLOAD CARD */}
          <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--th-border)] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--th-text-main)] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[var(--th-accent)]" />
                  <span>3. Upload Inspiration & Reference Photos</span>
                </h2>
                <p className="text-xs text-[var(--th-text-muted)] mt-0.5">
                  Upload multiple photos of your deity idol, temple altar, drawings, or reference jewellery (Up to 8 photos).
                </p>
              </div>
              <span className="text-xs font-bold text-[var(--th-accent)]">
                {selectedFiles.length} / 8 files
              </span>
            </div>

            {/* Hidden native input */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Dropzone trigger */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--th-border)] hover:border-[var(--th-primary)] bg-[var(--th-surface)] rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-[var(--th-card)] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--th-accent)]/10 text-[var(--th-accent)] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div className="font-bold text-sm text-[var(--th-text-main)]">
                Click to browse multiple photos from your device
              </div>
              <div className="text-xs text-[var(--th-text-muted)] mt-1">
                Supports JPG, PNG, WEBP up to 10MB each
              </div>
            </div>

            {/* Image Previews Strip */}
            {previewUrls.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--th-text-muted)]">
                  Attached Inspiration Images:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-[var(--th-border)] aspect-square bg-black/5">
                      <img
                        src={url}
                        alt={`Inspiration ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md opacity-90 hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. CUSTOMER CONTACT INFO CARD */}
          <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-[var(--th-text-main)] flex items-center gap-2 border-b border-[var(--th-border)] pb-4">
              <Phone className="w-5 h-5 text-[var(--th-accent)]" />
              <span>4. Your Contact Details for Price Quotation</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--th-text-muted)] mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--th-text-muted)]" />
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--th-border)] bg-[var(--th-surface)] text-[var(--th-text-main)] text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[var(--th-primary)]"
                  />
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--th-text-muted)] mb-2">
                  Phone / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--th-text-muted)]" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--th-border)] bg-[var(--th-surface)] text-[var(--th-text-main)] text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[var(--th-primary)]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--th-text-muted)] mb-2">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--th-text-muted)]" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--th-border)] bg-[var(--th-surface)] text-[var(--th-text-main)] text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[var(--th-primary)]"
                  />
                </div>
              </div>
            </div>

            {/* Informational Callout */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-3">
              <Clock className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <strong>Bespoke Quotation Process:</strong> Because artisanal pieces require calculation of raw silver weights, casting mould preparation, and artisan carving hours, your order will be reviewed manually. We will provide an exact quotation and dispatch timeline within 24 hours.
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-[var(--th-primary)]/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting Custom Order...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    <span>Submit Custom Order Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 7. REASSURING CONFIRMATION NOTIFICATION / MODAL */}
      {submittedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>Status: Quotation Pending Review</span>
              </div>
              <h3 className="text-2xl font-extrabold text-[var(--th-text-main)] font-serif">
                Custom Order Placed Successfully!
              </h3>
              <p className="text-sm text-[var(--th-text-muted)] leading-relaxed">
                Thank you, <strong>{customerName}</strong>. Your custom request for <strong>{activeCategoryObj.name}</strong> has been logged in our master artisan workshop.
              </p>
            </div>

            {/* Order Identifier Card */}
            <div className="p-4 rounded-2xl bg-[var(--th-surface)] border border-[var(--th-border)] flex items-center justify-between">
              <div className="text-left">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--th-text-muted)]">
                  Reference Order Number
                </div>
                <div className="text-base font-extrabold text-[var(--th-text-main)] font-mono">
                  {submittedOrder.order_number}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyOrderNumber}
                className="px-3 py-1.5 rounded-lg border border-[var(--th-border)] text-xs font-bold text-[var(--th-primary)] hover:bg-[var(--th-card)] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedOrderNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedOrderNumber ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* What happens next explanation */}
            <div className="text-left text-xs space-y-2 text-[var(--th-text-muted)] bg-[var(--th-surface-alt)] p-4 rounded-2xl">
              <div className="font-bold text-[var(--th-text-main)] text-xs uppercase tracking-wider mb-1">
                What happens next?
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--th-primary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>Our head silversmith examines your inspiration photos and dimensions.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--th-primary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>We calculate exact silver weight, labour cost, and crafting schedule.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--th-primary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>We will contact you at <strong>{customerPhone}</strong> with the official quotation.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmittedOrder(null);
                  navigate('/orders');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[var(--th-primary)] text-white font-bold text-xs uppercase tracking-wider hover:bg-[var(--th-primary-hover)] transition-colors cursor-pointer"
              >
                View My Orders
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmittedOrder(null);
                  navigate('/catalog');
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-[var(--th-border)] bg-[var(--th-surface)] text-[var(--th-text-main)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--th-surface-alt)] transition-colors cursor-pointer"
              >
                Explore Ready Catalog
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
