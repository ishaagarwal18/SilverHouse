import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Crown, Sparkles, Church, HeartHandshake, Compass, Upload, Image as ImageIcon,
  Trash2, Check, ShieldCheck, Clock, Phone, User, Mail, FileText,
  AlertCircle, ChevronRight, Copy, CheckCircle2, ArrowRight, Layers, Eye,
  Search, CheckCircle, Lock
} from 'lucide-react';
import { submitCustomOrderApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  PREDEFINED_SHRINE_DESIGNS,
  LOCKET_SHAPES,
  METAL_FINISHES,
  CHAIN_OPTIONS,
  POPULAR_MANTRAS
} from '../../data/predefinedYatraDesigns';

const CUSTOM_CATEGORIES = [
  {
    id: 'Yatra Lockets',
    name: 'Yatra Lockets & Shrines',
    hindi: 'यात्रा लॉकेट / तीर्थ स्वरूप',
    icon: Compass,
    tagline: 'Sacred Deity & Pilgrimage Shrine Lockets',
    description: 'Consecrated 925 sterling silver shrine lockets for Kedarnath, Badrinath, Kashi, Ram Mandir, Mahakal, Banke Bihari, and your personal Ishta Devata.',
    popularMotifs: ['Kedarnath Jyotirlinga', 'Ayodhya Ram Lalla', 'Kashi Vishwanath', 'Shri Banke Bihari', 'Tirupati Balaji', 'Golden Temple Harmandir Sahib'],
    presetSpecs: 'Sacred Shrine Locket: 92.5 Hallmarked Sterling Silver, 20" chain, custom back mantra engraving with holy Ganga Jal consecration.',
    isYatra: true
  },
  {
    id: 'Mukhut',
    name: 'Mukhut',
    hindi: 'मुकुट',
    icon: Crown,
    tagline: 'Divine Silver Crowns for Deities',
    description: 'Bespoke hand-chased crowns for Radha Krishna, Laddu Gopal, Hanumanji, and temple deities with filigree, peacock feather crests, and gemstone settings.',
    popularMotifs: ['Peacock Feather (Mor Pankh)', 'Surya Kiran (Sun Rays)', 'Floral Filigree (Tarkashi)', 'Gemstone Setting Accents'],
    presetSpecs: 'Crown height: approx 4 to 6 inches, deity head circumference: 8 to 12 cm, 92.5 Sterling Silver, peacock feather filigree carving.',
    isYatra: false
  },
  {
    id: 'Jhalar',
    name: 'Jhalar',
    hindi: 'झालर',
    icon: Sparkles,
    tagline: 'Ornate Altar & Sanctum Hangings',
    description: 'Traditional handcrafted silver fringe borders, altar hangings, and sanctum canopy trims with dangling silver bells (ghungroo) and floral lace.',
    popularMotifs: ['Dangling Ghungroo Bells', 'Lotus Petal Border', 'Interlocking Vine Chain', 'Altar Canopy Trim'],
    presetSpecs: 'Altar border length: 24 to 36 inches, drop height: 3 inches, delicate hanging silver bells, high-polish sterling silver.',
    isYatra: false
  },
  {
    id: 'Thakurji ka saman',
    name: 'Thakurji ka saman',
    hindi: 'ठाकुरजी का सामान',
    icon: HeartHandshake,
    tagline: 'Sacred Seva & Royal Deity Regalia',
    description: 'Exquisite silver articles for deity seva including carved flutes (Bansuri), royal singhasan (thrones), chhatra (parasols), and charan padukas.',
    popularMotifs: ['Engraved Bansuri (Flute)', 'Carved Singhasan (Throne)', 'Royal Chhatra (Parasol)', 'Sacred Charan Paduka'],
    presetSpecs: 'Deity Singhasan: 6x6 inch base, royal chhatra parasol with peacock finial, heavy gauge sterling silver.',
    isYatra: false
  },
  {
    id: 'Temple things',
    name: 'Temple things',
    hindi: 'मंदिर सामग्री',
    icon: Church,
    tagline: 'Sanctified Altar Vessels & Artifacts',
    description: 'Consecrated silver artifacts for temples and home shrines: multi-wick Aarti diyas, kalash with coconut carving, shankh stands, and temple bells.',
    popularMotifs: ['Panchmukhi Aarti Diya', 'Kalash with Coconut Finial', 'Carved Shankh Stand', 'Nandi Temple Bell'],
    presetSpecs: 'Panchmukhi Aarti Diya: 5 wicks with ornate peacock handle, solid 92.5 sterling silver, heat-resistant base.',
    isYatra: false
  }
];

export default function CustomArtisanalOrderPage({ onTriggerToast }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Selected Category
  const [selectedCategory, setSelectedCategory] = useState(CUSTOM_CATEGORIES[0].id);

  // Common Customizer State
  const [purity, setPurity] = useState('92.5 Sterling Silver');
  const [approxDimensions, setApproxDimensions] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [description, setDescription] = useState('');

  // Yatra Specific Customizer State
  const [selectedShrine, setSelectedShrine] = useState(PREDEFINED_SHRINE_DESIGNS[0]);
  const [shrineCategoryFilter, setShrineCategoryFilter] = useState('All');
  const [shrineSearch, setShrineSearch] = useState('');
  const [selectedLocketShape, setSelectedLocketShape] = useState(LOCKET_SHAPES[0].id);
  const [selectedFinish, setSelectedFinish] = useState(METAL_FINISHES[0].id);
  const [selectedChain, setSelectedChain] = useState(CHAIN_OPTIONS[1].name);
  const [backEngraving, setBackEngraving] = useState(PREDEFINED_SHRINE_DESIGNS[0].defaultMantra);
  const [isCustomDeityMode, setIsCustomDeityMode] = useState(false);

  // Contact details
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  // Synchronize contact details if user logs in while on customizer
  useEffect(() => {
    if (user) {
      if (user.fullName) setCustomerName(user.fullName);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.email) setCustomerEmail(user.email);
    }
  }, [user]);

  // Multi-image file upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);

  // Submission & Confirmation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);

  // Handle URL params for default tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    if (catParam) {
      const match = CUSTOM_CATEGORIES.find(
        c => c.id.toLowerCase() === catParam.toLowerCase() || c.name.toLowerCase().includes(catParam.toLowerCase())
      );
      if (match) setSelectedCategory(match.id);
    } else if (location.pathname.includes('yatra')) {
      setSelectedCategory('Yatra Lockets');
    }
  }, [location]);

  // Active category object
  const activeCategoryObj = CUSTOM_CATEGORIES.find(c => c.id === selectedCategory) || CUSTOM_CATEGORIES[0];
  const isYatraActive = activeCategoryObj.id === 'Yatra Lockets';

  // Predefined shrine filter
  const shrineCategories = ['All', 'Shiva', 'Ram & Vishnu', 'Devi & Shakti', 'Sacred Yantra', 'Ganesha & Wisdom', 'Gurudwara & Peace'];
  const filteredShrines = PREDEFINED_SHRINE_DESIGNS.filter(d => {
    const matchCategory = shrineCategoryFilter === 'All' || shrineCategoryFilter === 'ALL' || d.category === shrineCategoryFilter;
    const matchSearch = !shrineSearch || d.name.toLowerCase().includes(shrineSearch.toLowerCase()) || d.deity.toLowerCase().includes(shrineSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

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

  const handleSelectShrine = (shrine) => {
    setSelectedShrine(shrine);
    setIsCustomDeityMode(false);
    if (shrine.defaultMantra) {
      setBackEngraving(shrine.defaultMantra);
    }
    if (onTriggerToast) {
      onTriggerToast(`Selected shrine: ${shrine.name}`);
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !user || !user.userId) {
      if (onTriggerToast) {
        onTriggerToast('Please sign in to your SilverHouse account to submit a custom order.', 'error');
      }
      navigate('/login?redirect=/customize');
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

      if (isYatraActive) {
        fullDescription += `Pilgrimage / Deity Shrine: ${isCustomDeityMode ? 'Custom Deity / Uploaded Photo' : selectedShrine.name}\n`;
        fullDescription += `Locket Shape: ${selectedLocketShape}\n`;
        fullDescription += `Silver Finish: ${selectedFinish}\n`;
        fullDescription += `Chain Choice: ${selectedChain}\n`;
        if (backEngraving.trim()) fullDescription += `Back Engraving Mantra / Gotra: "${backEngraving.trim()}"\n`;
      } else {
        if (approxDimensions.trim()) fullDescription += `Estimated Dimensions / Deity Size: ${approxDimensions.trim()}\n`;
      }

      if (targetWeight.trim()) fullDescription += `Target Silver Weight: ${targetWeight.trim()}\n`;
      fullDescription += `\nDetailed Specifications / Customer Notes:\n${description.trim() || 'Handcrafted to master silversmith standards.'}`;

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
      <div className="max-w-6xl mx-auto space-y-10">

        {/* 1. HERO HEADER */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[var(--th-accent)]/10 text-[var(--th-accent)] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Silversmith Bespoke Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--th-text-main)] font-serif">
            Custom Silver Devotional & Artisanal Studio
          </h1>
          <p className="text-sm sm:text-base text-[var(--th-text-muted)] max-w-3xl mx-auto leading-relaxed">
            Commission bespoke sacred silver lockets, deity regalia, sanctum hangings, and temple artifacts crafted to your exact specifications with multi-image inspiration and master silversmith quotation.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-semibold text-[var(--th-text-muted)]">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Certified 925 Hallmarked Silver
            </span>
            <span className="flex items-center gap-1.5 text-amber-800">
              <Crown className="w-4 h-4 text-amber-600" /> Hereditary Master Silversmith Craft
            </span>
            <span className="flex items-center gap-1.5 text-indigo-700">
              <Clock className="w-4 h-4 text-indigo-600" /> Personalized Workshop Quotation
            </span>
          </div>

          {/* Quick tracker for existing custom orders */}
          {isAuthenticated && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/orders?tab=custom')}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[var(--th-card)] hover:bg-[var(--th-surface-alt)] border border-[var(--th-border)] text-xs font-bold text-[var(--th-primary)] transition-all cursor-pointer shadow-xs hover:border-[var(--th-accent)]"
              >
                <Crown className="w-3.5 h-3.5 text-[var(--th-accent)]" />
                <span>Track Your Existing Custom Order Approvals & Quotations</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 2. UNIFIED CATEGORY SELECTION CARDS (5 CATEGORIES) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--th-text-main)] flex items-center gap-2">
              <span>1. Choose Custom Creation Category</span>
              <span className="text-xs text-[var(--th-text-muted)] font-semibold">({CUSTOM_CATEGORIES.length} Sacred Specialties)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {CUSTOM_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`relative p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[var(--th-card)] border-[var(--th-primary)] shadow-lg shadow-[var(--th-primary)]/10 ring-2 ring-[var(--th-primary)]/20'
                      : 'bg-[var(--th-surface)] border-[var(--th-border)] hover:border-[var(--th-primary)]/50 hover:bg-[var(--th-card)]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-[var(--th-primary)] text-white'
                          : 'bg-[var(--th-surface-alt)] text-[var(--th-text-muted)]'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-serif font-bold text-[var(--th-accent)]">{cat.hindi}</span>
                    </div>

                    <div>
                      <div className="font-extrabold text-sm text-[var(--th-text-main)]">{cat.name}</div>
                      <div className="text-[11.5px] font-medium text-[var(--th-text-muted)] mt-1 line-clamp-2 leading-snug">
                        {cat.description}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[var(--th-border)]/60 flex items-center justify-between text-xs font-bold">
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

        {/* 3. CATEGORY-SPECIFIC CUSTOMIZATION OPTIONS */}
        {isYatraActive ? (
          /* ================= YATRA LOCKETS & SHRINES SECTION ================= */
          <div className="space-y-6">
            {/* Shrine Selector */}
            <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--th-border)] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--th-text-main)] flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[var(--th-accent)]" />
                    <span>Select Pilgrimage Shrine or Custom Deity</span>
                  </h3>
                  <p className="text-xs text-[var(--th-text-muted)] mt-0.5">
                    Choose from consecrated holy shrines or upload your own deity artwork/photo.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative min-w-[200px]">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--th-text-muted)]" />
                    <input
                      type="text"
                      placeholder="Search shrine / deity..."
                      value={shrineSearch}
                      onChange={(e) => setShrineSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[var(--th-border)] bg-[var(--th-card)] text-xs text-[var(--th-text-main)] focus:outline-hidden focus:ring-1 focus:ring-[var(--th-primary)]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomDeityMode(!isCustomDeityMode);
                      if (!isCustomDeityMode && onTriggerToast) onTriggerToast('Custom Deity Mode activated: Attach reference photos below!');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isCustomDeityMode
                        ? 'bg-[var(--th-primary)] text-white border-[var(--th-primary)] shadow-xs'
                        : 'border-[var(--th-border)] bg-[var(--th-card)] text-[var(--th-text-main)] hover:border-[var(--th-primary)]'
                    }`}
                  >
                    + My Custom Photo
                  </button>
                </div>
              </div>

              {/* Shrine Category Filter Pills */}
              {!isCustomDeityMode && (
                <div className="flex flex-wrap gap-1.5">
                  {shrineCategories.map((c) => {
                    const isFilterActive = shrineCategoryFilter === c || (c === 'All' && shrineCategoryFilter === 'ALL');
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setShrineCategoryFilter(c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isFilterActive
                            ? 'bg-[var(--th-primary)] text-white border-[var(--th-primary)] shadow-xs font-bold'
                            : 'bg-[var(--th-card)] border-[var(--th-border)] text-[var(--th-text-main)] hover:border-[var(--th-primary)] hover:bg-[var(--th-surface-alt)]'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Shrines Grid */}
              {!isCustomDeityMode ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[320px] overflow-y-auto p-1">
                  {filteredShrines.map((shrine) => {
                    const isSelected = selectedShrine.id === shrine.id;
                    return (
                      <div
                        key={shrine.id}
                        onClick={() => handleSelectShrine(shrine)}
                        className={`group relative rounded-xl border p-2.5 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[var(--th-card)] border-[var(--th-primary)] ring-2 ring-[var(--th-primary)]/20 shadow-md'
                            : 'bg-[var(--th-card)] border-[var(--th-border)] hover:border-[var(--th-primary)]/50 hover:shadow-xs'
                        }`}
                      >
                        <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-black/5 relative">
                          <img
                            src={shrine.image || shrine.fallbackImage}
                            alt={shrine.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => { e.currentTarget.src = shrine.fallbackImage || '/images/yatra_locket.png'; }}
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[var(--th-primary)] text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[var(--th-text-main)] line-clamp-1">{shrine.name}</div>
                          <div className="text-[10px] text-[var(--th-text-muted)] line-clamp-1">{shrine.deity}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-[var(--th-text-main)] flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="text-[var(--th-text-main)] font-medium">
                      <strong className="font-bold text-[var(--th-text-main)]">Custom Photo / Artwork Mode:</strong> You can upload your own photo of any temple, guru, or kuldevi/devata in Section 3 below.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCustomDeityMode(false)}
                    className="text-xs font-bold text-[var(--th-primary)] hover:underline cursor-pointer shrink-0 ml-4"
                  >
                    Back to Predefined Shrines
                  </button>
                </div>
              )}
            </div>

            {/* Locket Specifications (Shape, Finish, Chain & Back Engraving) */}
            <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-2xl p-6 space-y-6">
              <h3 className="text-base font-bold text-[var(--th-text-main)] border-b border-[var(--th-border)] pb-3">
                Locket Shape, Finish & Sacred Chain
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Locket Shape */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--th-text-muted)] mb-2">
                    Locket Shape
                  </label>
                  <select
                    value={selectedLocketShape}
                    onChange={(e) => setSelectedLocketShape(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--th-border)] bg-[var(--th-card)] text-[var(--th-text-main)] text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[var(--th-primary)] cursor-pointer"
                  >
                    {LOCKET_SHAPES.map(s => (
                      <option key={s.id} value={s.id}>{s.name} {s.badge ? `(${s.badge})` : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Silver Finish */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--th-text-muted)] mb-2">
                    Silver Finish Style
                  </label>
                  <select
                    value={selectedFinish}
                    onChange={(e) => setSelectedFinish(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--th-border)] bg-[var(--th-card)] text-[var(--th-text-main)] text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[var(--th-primary)] cursor-pointer"
                  >
                    {METAL_FINISHES.map(f => (
                      <option key={f.id} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>

                {/* Chain Option */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--th-text-muted)] mb-2">
                    Chain Style
                  </label>
                  <select
                    value={selectedChain}
                    onChange={(e) => setSelectedChain(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--th-border)] bg-[var(--th-card)] text-[var(--th-text-main)] text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[var(--th-primary)] cursor-pointer"
                  >
                    {CHAIN_OPTIONS.map(c => (
                      <option key={c.name} value={c.name}>{c.name} {c.price > 0 ? `(+₹${c.price.toLocaleString('en-IN')})` : '(Included)'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Back Engraving Mantra / Sacred Text */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--th-text-muted)] mb-2">
                  Reverse Side Engraving (Sacred Mantra, Gotra, or Name)
                </label>
                <div className="flex gap-2 mb-2.5 flex-wrap">
                  {POPULAR_MANTRAS.slice(0, 6).map((m, idx) => {
                    const text = typeof m === 'string' ? m : m.text;
                    const isSelected = backEngraving === text;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBackEngraving(text)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-medium ${
                          isSelected
                            ? 'bg-[var(--th-primary)] text-white border-[var(--th-primary)] shadow-xs font-bold'
                            : 'bg-[var(--th-card)] border-[var(--th-border)] text-[var(--th-text-main)] hover:border-[var(--th-primary)] hover:bg-[var(--th-surface-alt)]'
                        }`}
                      >
                        {text}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  placeholder="e.g. ॐ नमः शिवाय or Kashyap Gotra / Harish Kumar"
                  value={backEngraving}
                  onChange={(e) => setBackEngraving(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--th-border)] bg-[var(--th-card)] text-[var(--th-text-main)] text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[var(--th-primary)]"
                />
              </div>
            </div>
          </div>
        ) : (
          /* ================= POPULAR DESIGN MOTIFS FOR ARTISANAL ================= */
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
        )}

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
                  <option value="Antique Oxidized Silver">Antique Oxidized Silver (Auspicious Patina)</option>
                </select>
              </div>

              {/* Dimensions / Deity Size */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--th-text-muted)] mb-2">
                  {isYatraActive ? 'Locket Diameter / Pendant Size' : 'Deity Idol Size / Altar Dimensions'}
                </label>
                <input
                  type="text"
                  placeholder={isYatraActive ? "e.g. 35mm diameter or Large 45mm" : "e.g. 9-inch idol height, 4-inch mukut"}
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
                  placeholder={isYatraActive ? "e.g. approx 20 - 35 grams" : "e.g. approx 150 - 250 grams"}
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--th-border)] bg-[var(--th-surface)] text-[var(--th-text-main)] text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[var(--th-primary)]"
                />
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--th-text-muted)] mb-2">
                Detailed Crafting & Design Instructions (Optional Notes)
              </label>
              <textarea
                rows={4}
                placeholder={`Describe your vision for this ${activeCategoryObj.name} in detail. Include deity names (e.g. Radha Krishna, Laddu Gopal, Mahadev), specific engraving motifs, stone colors, or finish style...`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 rounded-xl border border-[var(--th-border)] bg-[var(--th-surface)] text-[var(--th-text-main)] text-sm leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[var(--th-primary)]"
              />
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
            <h2 className="text-lg font-bold text-[var(--th-text-main)] flex items-center justify-between border-b border-[var(--th-border)] pb-4">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[var(--th-accent)]" />
                <span>4. Your Contact Details for Price Quotation</span>
              </div>
              {isAuthenticated && user && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Verified Customer Account
                </span>
              )}
            </h2>

            {/* Login Required Notice for Unauthenticated Users */}
            {!isAuthenticated || !user ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[var(--th-text-main)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[var(--th-text-main)]">Customer Sign In Required to Place Custom Order</div>
                    <div className="text-xs text-[var(--th-text-muted)] mt-0.5">
                      Please log in or create an account so our master silversmiths can attach your quote and order status directly to your account.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/login?redirect=/customize')}
                  className="px-4 py-2.5 rounded-xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all shadow-sm"
                >
                  Sign In / Register
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--th-card)] border border-[var(--th-border)] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[var(--th-text-muted)]">Submitting as:</span>
                  <strong className="text-[var(--th-text-main)]">{user.fullName || user.email}</strong>
                </div>
                <span className="text-[11px] text-[var(--th-text-muted)] font-mono">
                  ID: #{user.userId}
                </span>
              </div>
            )}

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
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--th-border)] bg-[var(--th-card)] text-[var(--th-text-main)] text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[var(--th-primary)]"
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
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--th-border)] bg-[var(--th-card)] text-[var(--th-text-main)] text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[var(--th-primary)]"
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
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--th-border)] bg-[var(--th-card)] text-[var(--th-text-main)] text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[var(--th-primary)]"
                  />
                </div>
              </div>
            </div>

            {/* Informational Callout */}
            <div className="p-4 rounded-xl bg-[var(--th-card)] border border-[var(--th-border)] text-[var(--th-text-main)] text-xs leading-relaxed flex items-start gap-3 shadow-2xs">
              <Clock className="w-5 h-5 shrink-0 text-[var(--th-primary)] mt-0.5" />
              <div>
                <strong className="font-bold text-[var(--th-text-main)]">Bespoke Workshop Quotation:</strong> Because custom pieces require calculating pure silver weight, mould casting, and artisan carving hours, our master silversmith reviews your request personally. You will receive an exact quote and dispatch timeline within 24 hours.
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              {!isAuthenticated || !user ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onTriggerToast) onTriggerToast('Please log in to your SilverHouse account to place a custom order.', 'error');
                    navigate('/login?redirect=/customize');
                  }}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-[var(--th-primary)]/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Submit Custom Order</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-[var(--th-primary)]/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Custom Order...</span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      <span>Submit Custom Order Request</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* 7. REASSURING CONFIRMATION MODAL */}
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
            <div className="text-left text-xs space-y-2.5 text-[var(--th-text-muted)] bg-[var(--th-surface-alt)] p-4 sm:p-5 rounded-2xl border border-[var(--th-border)]">
              <div className="font-bold text-[var(--th-text-main)] text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--th-accent)]" />
                <span>Approval & Quotation Process:</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--th-primary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-[var(--th-text-main)]">Workshop Review (Processing):</strong> Our head silversmith examines your inspiration photos, silver purity, and crafting complexity.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--th-primary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-[var(--th-text-main)]">Admin Approval & Price Quotation:</strong> Once approved, the exact handcrafted price quotation will appear in your account and be dispatched to WhatsApp (<strong>{customerPhone}</strong>).
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--th-primary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-[var(--th-text-main)]">Accept Quotation & Production:</strong> You can review the quoted price and confirm your order to commence hand-carving.
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmittedOrder(null);
                  navigate('/orders?tab=custom');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Track Custom Order & Quotation</span>
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
