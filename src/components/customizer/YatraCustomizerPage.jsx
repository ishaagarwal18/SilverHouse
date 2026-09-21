import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Upload, Image as ImageIcon, Trash2, Check, Star, ShieldCheck,
  Truck, ArrowRight, RotateCw, RefreshCw, MessageCircle, Heart, Info,
  Layers, Award, CheckCircle2, ChevronRight, Eye, Phone, User, Calendar
} from 'lucide-react';
import {
  PREDEFINED_SHRINE_DESIGNS,
  LOCKET_SHAPES,
  METAL_FINISHES,
  WEIGHT_OPTIONS,
  CHAIN_OPTIONS,
  POPULAR_MANTRAS
} from '../../data/predefinedYatraDesigns';

export default function YatraCustomizerPage({
  onAddToCart,
  onTriggerToast,
  onOpenCart
}) {
  const navigate = useNavigate();

  // Mode: 'predefined' or 'upload'
  const [designMode, setDesignMode] = useState('predefined');

  // Predefined Selection
  const [selectedPredefined, setSelectedPredefined] = useState(PREDEFINED_SHRINE_DESIGNS[0]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Multiple Uploaded Images
  const [uploadedImages, setUploadedImages] = useState([]);
  const [activeUploadedIndex, setActiveUploadedIndex] = useState(0);
  const fileInputRef = useRef(null);

  // Locket Customization Options
  const [selectedShape, setSelectedShape] = useState(LOCKET_SHAPES[0].id);
  const [selectedFinish, setSelectedFinish] = useState(METAL_FINISHES[0].id);
  const [selectedWeight, setSelectedWeight] = useState(WEIGHT_OPTIONS[1]); // 22g default
  const [selectedChain, setSelectedChain] = useState(CHAIN_OPTIONS[1]); // 20" Rope chain default
  const [includePujaConsecration, setIncludePujaConsecration] = useState(true);

  // Customer Necessary Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shrineName, setShrineName] = useState(PREDEFINED_SHRINE_DESIGNS[0].name);
  const [familyGotra, setFamilyGotra] = useState('');
  const [engravingText, setEngravingText] = useState(PREDEFINED_SHRINE_DESIGNS[0].defaultMantra);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // 3D Locket View State (Front Face vs Reverse Engraving)
  const [isReverseSide, setIsReverseSide] = useState(false);
  const [imageFitMode, setImageFitMode] = useState('cover'); // 'cover' or 'contain'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter Categories for Predefined Gallery
  const categories = ['ALL', 'Shiva', 'Ram & Vishnu', 'Devi & Shakti', 'Sacred Yantra', 'Ganesha & Wisdom', 'Gurudwara & Peace'];
  const filteredDesigns = categoryFilter === 'ALL'
    ? PREDEFINED_SHRINE_DESIGNS
    : PREDEFINED_SHRINE_DESIGNS.filter(d => d.category === categoryFilter);

  // Active Artwork Image
  const activeArtworkUrl = designMode === 'predefined'
    ? (selectedPredefined?.image || selectedPredefined?.fallbackImage || '/images/yatra_locket.png')
    : (uploadedImages[activeUploadedIndex]?.url || selectedPredefined?.image || '/images/yatra_locket.png');

  // Multi-image upload handler
  const handleMultipleFiles = (files) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(f => f.type.startsWith('image/'));

    if (validFiles.length === 0) {
      onTriggerToast?.('warning', 'Invalid Files', 'Please select valid image files (JPG, PNG, WebP).');
      return;
    }

    // Limit to 5 images total
    const remainingSlots = 5 - uploadedImages.length;
    if (remainingSlots <= 0) {
      onTriggerToast?.('info', 'Maximum Limit', 'You have already added 5 photos. Remove one to add another.');
      return;
    }

    const filesToProcess = validFiles.slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: e.target.result,
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB'
        };

        setUploadedImages(prev => {
          const updated = [...prev, newImage];
          // If first image uploaded, switch to upload mode and set active index
          if (prev.length === 0) {
            setDesignMode('upload');
            setActiveUploadedIndex(0);
          }
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });

    onTriggerToast?.('success', 'Photos Attached', `${filesToProcess.length} image(s) uploaded successfully.`);
  };

  const handleRemoveUploadedImage = (indexToRemove, e) => {
    e.stopPropagation();
    setUploadedImages(prev => {
      const filtered = prev.filter((_, idx) => idx !== indexToRemove);
      if (activeUploadedIndex >= filtered.length) {
        setActiveUploadedIndex(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
  };

  // Predefined selection handler
  const handleSelectPredefined = (design) => {
    setSelectedPredefined(design);
    setShrineName(design.name);
    setEngravingText(design.defaultMantra);
    setDesignMode('predefined');
    setIsReverseSide(false);
  };

  // Price Calculation
  const basePrice = selectedWeight.basePrice;
  const chainPrice = selectedChain.price;
  const pujaPrice = includePujaConsecration ? 251 : 0;
  const totalPrice = basePrice + chainPrice + pujaPrice;
  const originalPrice = totalPrice + 950; // Discount visualization

  // Form Validation & Add to Cart
  const handleAddCustomToCart = () => {
    if (!customerName.trim()) {
      onTriggerToast?.('error', 'Required Field', 'Please enter your Full Name for personalization.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      onTriggerToast?.('error', 'Contact Required', 'Please enter a valid 10-digit WhatsApp/Mobile Number for CAD proof approval.');
      return;
    }

    setIsSubmitting(true);

    const customYatraProduct = {
      id: `custom-yatra-${Date.now()}`,
      name: `Personalized Sacred Yatra Locket (${shrineName || 'Pilgrimage Shrine'})`,
      title: `Personalized Sacred Yatra Locket (${shrineName || 'Pilgrimage Shrine'})`,
      price: totalPrice,
      originalPrice: originalPrice,
      image: activeArtworkUrl,
      images: uploadedImages.length > 0 ? uploadedImages.map(img => img.url) : [activeArtworkUrl],
      purity: '92.5 Sterling Silver',
      purityCode: '925',
      weightGrams: selectedWeight.weightGrams,
      category: 'custom-yatra-lockets',
      category_name: 'Sacred Yantra & Custom Yatra Lockets',
      isCustomizable: true,
      inStock: true,
      customConfig: {
        isCustomYatra: true,
        designMode,
        shrineName: shrineName || selectedPredefined?.name,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        familyGotra: familyGotra.trim() || 'N/A (General Consecration)',
        engravingText: engravingText.trim() || selectedPredefined?.defaultMantra || 'ॐ नमः शिवाय',
        shape: LOCKET_SHAPES.find(s => s.id === selectedShape)?.name || selectedShape,
        finish: METAL_FINISHES.find(f => f.id === selectedFinish)?.name || selectedFinish,
        sizeLabel: selectedWeight.label,
        weightGrams: selectedWeight.weightGrams,
        chainOption: selectedChain.name,
        pujaConsecration: includePujaConsecration,
        specialInstructions: specialInstructions.trim() || 'None',
        allUploadedImages: uploadedImages.map(i => i.url)
      }
    };

    setTimeout(() => {
      onAddToCart?.(customYatraProduct, 1, customYatraProduct.customConfig);
      setIsSubmitting(false);
      onTriggerToast?.(
        'success',
        'Custom Locket Added to Cart',
        `Your personalized ${shrineName} silver locket has been configured!`
      );
      onOpenCart?.();
    }, 400);
  };

  // WhatsApp Master Karigar Consultation Link
  const handleWhatsAppConsultation = () => {
    const text = encodeURIComponent(
      `*Namaste SilverHouse Karigar Team!* 🙏\n` +
      `I am designing a *Personalized Sacred Yatra Locket*:\n` +
      `• *Shrine / Deity*: ${shrineName || 'Custom'}\n` +
      `• *Customer Name*: ${customerName || 'Devotee'}\n` +
      `• *Phone*: ${customerPhone || 'Not provided'}\n` +
      `• *Gotra*: ${familyGotra || 'None'}\n` +
      `• *Engraving*: ${engravingText || 'Default Mantra'}\n` +
      `• *Shape*: ${selectedShape}\n` +
      `• *Finish*: ${selectedFinish}\n` +
      `• *Weight*: ${selectedWeight.label} (${selectedWeight.weightGrams}g)\n` +
      `• *Chain*: ${selectedChain.name}\n` +
      `• *Total Value*: ₹${totalPrice.toLocaleString('en-IN')}\n\n` +
      `Please assist me with design proof and Vedic consecration details.`
    );
    window.open(`https://wa.me/919876543210?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[var(--th-bg)] text-[var(--th-text-main)] transition-colors duration-300 pb-20">
      
      {/* 1. Luxurious Studio Hero Banner */}
      <div className="relative overflow-hidden border-b border-[var(--th-border)] bg-gradient-to-b from-[#161616] via-[#202020] to-[#121212] text-white py-12 sm:py-16">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/15 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-silver-400/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-3">
            <Sparkles className="w-4 h-4" />
            <span>Master Artisan Studio • Made-On-Order</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Personalized Sacred Yatra Locket Studio
          </h1>

          <p className="mt-3 text-sm sm:text-base text-silver-300 max-w-3xl leading-relaxed">
            Encapsulate your most sacred pilgrimage blessings, family deity photos, or gotra mantras in 
            certified <strong>925 Sterling Silver</strong> with waterproof crystal sealing and 
            reverse laser engraving.
          </p>

          {/* Quick Assurance Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10 text-xs">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span className="text-silver-200">100% BIS 925 Hallmarked</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-silver-200">Waterproof Crystal Sealed</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span className="text-silver-200">Vedic Pandit Puja Consecrated</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-silver-200">Free Insured Express Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Interactive Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN (lg:col-span-5): STICKY INTERACTIVE 3D LOCKET VISUAL PREVIEW */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            
            {/* Locket Frame Container */}
            <div className="p-6 rounded-3xl bg-[var(--th-card)] border border-[var(--th-border)] shadow-xl relative overflow-hidden group">
              
              {/* Header inside preview card */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] text-xs font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isReverseSide ? 'REVERSE (ENGRAVED)' : 'FRONT (PHOTO LOCKET)'}</span>
                </span>

                <button
                  type="button"
                  onClick={() => setIsReverseSide(prev => !prev)}
                  className="px-3 py-1 rounded-xl bg-[var(--th-primary)]/10 hover:bg-[var(--th-primary)] text-[var(--th-primary)] hover:text-white border border-[var(--th-primary)]/30 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Flip Locket</span>
                </button>
              </div>

              {/* Realistic Locket Render Container */}
              <div className="relative aspect-square max-w-[340px] mx-auto flex items-center justify-center p-4">
                
                {/* Silver Chain Render (Top of Locket) */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
                  <div className="w-1.5 h-10 bg-gradient-to-b from-slate-400 via-slate-200 to-slate-400 rounded-full shadow-md" />
                  {/* Bail Loop */}
                  <div className="w-8 h-8 rounded-full border-4 border-slate-300 bg-transparent shadow-inner -mt-2 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-slate-400/40" />
                  </div>
                </div>

                {/* 3D Realistic Locket Body */}
                <div
                  className={`relative w-64 h-72 sm:w-72 sm:h-80 transition-all duration-500 shadow-2xl flex items-center justify-center ${
                    selectedShape === 'arch'
                      ? 'rounded-t-[80px] rounded-b-[40px]'
                      : selectedShape === 'circle'
                      ? 'rounded-full aspect-square !h-64 sm:!h-72'
                      : selectedShape === 'oval'
                      ? 'rounded-[100px]'
                      : 'rounded-3xl !w-56 !h-80' // capsule
                  } ${
                    selectedFinish === 'gold-plated'
                      ? 'bg-gradient-to-br from-[#FFE082] via-[#FFD54F] to-[#B28900] border-8 border-[#D4AF37]'
                      : selectedFinish === 'oxidised'
                      ? 'bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900 border-8 border-stone-800 text-stone-200'
                      : 'bg-gradient-to-br from-slate-200 via-white to-slate-300 border-8 border-slate-300'
                  }`}
                  style={{
                    boxShadow: '0 20px 40px rgba(0,0,0,0.25), inset 0 2px 6px rgba(255,255,255,0.8), inset 0 -4px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  
                  {/* Ornate Inner Silver Bezel Border */}
                  <div className="absolute inset-2 border-2 border-dashed border-black/20 rounded-[inherit] pointer-events-none" />

                  {/* FRONT SIDE: Crystal Encapsulated Sacred Image */}
                  {!isReverseSide ? (
                    <div className="relative w-48 h-56 sm:w-56 sm:h-64 overflow-hidden rounded-[inherit] bg-black/10 flex items-center justify-center">
                      <img
                        src={activeArtworkUrl}
                        alt={shrineName || 'Sacred Locket Artwork'}
                        className={`w-full h-full object-${imageFitMode} transition-transform duration-700 hover:scale-105`}
                        onError={(e) => { e.target.src = '/images/yatra_locket.png'; }}
                      />

                      {/* Glass Sheen / Glare Reflection Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
                      
                      {/* Hallmark Stamp in Corner */}
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-[#D4AF37] font-mono text-[8px] font-extrabold tracking-wider backdrop-blur-xs">
                        925 BIS
                      </span>

                      {/* Deity Caption Overlay */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-center">
                        <span className="text-white text-[11px] font-bold drop-shadow font-serif block truncate">
                          {shrineName || 'Sacred Shrine'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* REVERSE SIDE: Polished Silver with Laser Engraving */
                    <div className="relative w-48 h-56 sm:w-56 sm:h-64 rounded-[inherit] bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 p-4 flex flex-col items-center justify-between text-center shadow-inner border border-slate-400">
                      
                      {/* Top Symbol */}
                      <div className="text-[#1A1A1A] opacity-80 pt-2">
                        <span className="font-serif text-2xl font-black">ॐ</span>
                      </div>

                      {/* Laser Engraved Sacred Mantra / Custom Message */}
                      <div className="space-y-1.5 px-2">
                        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block">
                          SACRED LASER ENGRAVING
                        </span>
                        <p className="font-serif font-bold text-sm sm:text-base text-slate-900 leading-snug drop-shadow-xs">
                          {engravingText || 'ॐ नमः शिवाय'}
                        </p>
                        {familyGotra && (
                          <p className="text-[11px] font-sans font-semibold text-slate-700">
                            Gotra: {familyGotra}
                          </p>
                        )}
                        {customerName && (
                          <p className="text-[10px] text-slate-600 italic">
                            Devotee: {customerName}
                          </p>
                        )}
                      </div>

                      {/* Bottom BIS 925 Hallmark Seal */}
                      <div className="pb-2 text-center">
                        <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-300/80 border border-slate-400 text-[9px] font-mono font-bold text-slate-800">
                          <span>▲ 925 SILVER</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Controls Strip */}
              <div className="mt-4 pt-4 border-t border-[var(--th-border)] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-[var(--th-text-muted)] font-medium">Image Fit:</span>
                  <button
                    type="button"
                    onClick={() => setImageFitMode('cover')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                      imageFitMode === 'cover' ? 'bg-[var(--th-primary)] text-white' : 'bg-[var(--th-surface-alt)]'
                    }`}
                  >
                    Fill
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageFitMode('contain')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                      imageFitMode === 'contain' ? 'bg-[var(--th-primary)] text-white' : 'bg-[var(--th-surface-alt)]'
                    }`}
                  >
                    Fit Whole
                  </button>
                </div>

                <span className="text-[var(--th-text-muted)] font-mono text-[11px]">
                  {selectedWeight.weightGrams}g Pure Silver
                </span>
              </div>
            </div>

            {/* Live Transparent Pricing Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[var(--th-surface-alt)] to-[var(--th-card)] border border-[var(--th-border)] shadow-md space-y-3 text-xs">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-[var(--th-text-main)]">Custom Configuration Total:</span>
                <div className="text-right">
                  <span className="font-outfit font-black text-2xl text-[var(--th-primary)]">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="block text-[10px] text-[var(--th-text-muted)] line-through">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 pt-2 border-t border-[var(--th-border)] text-[var(--th-text-muted)]">
                <div className="flex justify-between">
                  <span>925 Silver Locket ({selectedWeight.label}):</span>
                  <span className="font-mono text-[var(--th-text-main)] font-semibold">₹{basePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Chain: {selectedChain.name}:</span>
                  <span className="font-mono text-[var(--th-text-main)] font-semibold">
                    {chainPrice === 0 ? 'INCLUDED' : `+₹${chainPrice.toLocaleString('en-IN')}`}
                  </span>
                </div>
                {includePujaConsecration && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Vedic Puja Consecration:</span>
                    <span className="font-mono font-semibold">+₹251</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Laser Reverse Engraving:</span>
                  <span className="font-bold uppercase text-[10px]">FREE COMPLIMENTARY</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Insured Express Shipping:</span>
                  <span className="font-bold uppercase text-[10px]">FREE</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 space-y-2">
                <button
                  type="button"
                  onClick={handleAddCustomToCart}
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[var(--th-primary)] to-[var(--th-primary-hover)] text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all flex items-center justify-between cursor-pointer group hover:scale-[1.01]"
                >
                  <div className="text-left">
                    <span className="block font-sans text-xs font-extrabold tracking-wider">
                      Add Customized Locket to Cart
                    </span>
                    <span className="text-[10px] text-white/80 font-normal">
                      Dispatched in 3-4 Days • Insured Transit
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-xl">
                    <span className="font-outfit font-black text-base">₹{totalPrice.toLocaleString('en-IN')}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppConsultation}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:text-emerald-300 dark:hover:text-white border border-emerald-500/30 text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Discuss Design on WhatsApp with Master Karigar</span>
                </button>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN (lg:col-span-7): CUSTOMIZATION STEPS & DETAILS FORM */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-8">

            {/* STEP 1: CHOOSE DESIGN SOURCE (Predefined vs Upload) */}
            <section className="p-6 rounded-3xl bg-[var(--th-card)] border border-[var(--th-border)] shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--th-primary)] font-mono">
                    STEP 01
                  </span>
                  <h2 className="font-serif text-xl font-bold text-[var(--th-text-main)]">
                    Choose Artwork or Upload Photos
                  </h2>
                </div>
                
                {/* Switcher Tabs */}
                <div className="flex p-1 bg-[var(--th-surface-alt)] rounded-2xl border border-[var(--th-border)]">
                  <button
                    type="button"
                    onClick={() => setDesignMode('predefined')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      designMode === 'predefined'
                        ? 'bg-[var(--th-card)] text-[var(--th-primary)] shadow-xs'
                        : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Predefined Shrines</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesignMode('upload')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      designMode === 'upload'
                        ? 'bg-[var(--th-card)] text-[var(--th-primary)] shadow-xs'
                        : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)]'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Custom Photos</span>
                  </button>
                </div>
              </div>

              {/* PREDEFINED DESIGNS GALLERY */}
              {designMode === 'predefined' && (
                <div className="space-y-4">
                  {/* Category Filter Pills */}
                  <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          categoryFilter === cat
                            ? 'bg-[var(--th-primary)] text-white'
                            : 'bg-[var(--th-surface-alt)] text-[var(--th-text-muted)] hover:bg-[var(--th-border)]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Predefined Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {filteredDesigns.map((design) => {
                      const isSelected = selectedPredefined.id === design.id && designMode === 'predefined';
                      return (
                        <div
                          key={design.id}
                          onClick={() => handleSelectPredefined(design)}
                          className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group relative ${
                            isSelected
                              ? 'border-[var(--th-primary)] bg-[var(--th-primary)]/5 ring-2 ring-[var(--th-primary)]/20 shadow-md'
                              : 'border-[var(--th-border)] bg-[var(--th-surface-alt)] hover:border-[var(--th-primary)]/50'
                          }`}
                        >
                          <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-black/10">
                            <img
                              src={design.image}
                              alt={design.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => { e.target.src = design.fallbackImage || '/images/yatra_locket.png'; }}
                            />
                            {design.popularBadge && (
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[#D4AF37] font-mono text-[9px] font-bold">
                                {design.popularBadge}
                              </span>
                            )}
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--th-primary)] text-white flex items-center justify-center shadow-md">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <div>
                            <h4 className="font-serif font-bold text-xs text-[var(--th-text-main)] line-clamp-1">
                              {design.name}
                            </h4>
                            <p className="text-[10px] text-[var(--th-text-muted)] mt-0.5 line-clamp-1">
                              {design.blessing}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* UPLOAD CUSTOM PHOTOS (MULTIPLE IMAGES SUPPORT) */}
              {designMode === 'upload' && (
                <div className="space-y-4">
                  {/* Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleMultipleFiles(e.dataTransfer.files);
                    }}
                    className="border-2 border-dashed border-[var(--th-border)] hover:border-[var(--th-primary)] rounded-3xl p-6 text-center cursor-pointer bg-[var(--th-surface-alt)]/60 hover:bg-[var(--th-surface-alt)] transition-all group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleMultipleFiles(e.target.files)}
                      className="hidden"
                    />

                    <div className="w-12 h-12 rounded-2xl bg-[var(--th-primary)]/10 text-[var(--th-primary)] mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>

                    <h4 className="font-bold text-sm text-[var(--th-text-main)]">
                      Upload Deity / Temple / Family Photos
                    </h4>
                    <p className="text-xs text-[var(--th-text-muted)] mt-1 max-w-sm mx-auto">
                      Drag & drop multiple images or click to browse. Supports JPG, PNG, WebP (up to 5 photos).
                    </p>
                    <span className="inline-block mt-3 px-3 py-1 rounded-full bg-[var(--th-card)] border border-[var(--th-border)] text-[10px] font-bold text-[var(--th-primary)]">
                      + Click to Add Multiple Images
                    </span>
                  </div>

                  {/* Uploaded Images Thumbnails Strip */}
                  {uploadedImages.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[var(--th-text-main)]">
                          Uploaded Photos ({uploadedImages.length}/5):
                        </span>
                        <span className="text-[10px] text-[var(--th-text-muted)]">
                          Click any photo to preview inside the locket
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {uploadedImages.map((img, idx) => {
                          const isActive = activeUploadedIndex === idx;
                          return (
                            <div
                              key={img.id}
                              onClick={() => {
                                setActiveUploadedIndex(idx);
                                setDesignMode('upload');
                              }}
                              className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group ${
                                isActive
                                  ? 'border-[var(--th-primary)] ring-2 ring-[var(--th-primary)]/30 shadow-md'
                                  : 'border-[var(--th-border)] opacity-80 hover:opacity-100'
                              }`}
                            >
                              <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                              
                              {/* Active badge */}
                              {isActive && (
                                <span className="absolute bottom-1 left-1 right-1 bg-[var(--th-primary)] text-white text-[8px] font-extrabold text-center rounded py-0.5 uppercase tracking-wider">
                                  In Locket
                                </span>
                              )}

                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={(e) => handleRemoveUploadedImage(idx, e)}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 shadow-md cursor-pointer"
                                title="Remove photo"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-200 text-xs flex items-start space-x-2.5">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Multiple Images Option:</span>
                        <span>You can upload your pilgrimage photos, front deity idol, and family gotra reference. Our silver karigars will prepare a 3D CAD preview for your WhatsApp approval before casting.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* STEP 2: LOCKET SHAPE, METAL FINISH & WEIGHT */}
            <section className="p-6 rounded-3xl bg-[var(--th-card)] border border-[var(--th-border)] shadow-sm space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--th-primary)] font-mono">
                  STEP 02
                </span>
                <h2 className="font-serif text-xl font-bold text-[var(--th-text-main)]">
                  Locket Shape, Finish & Weight
                </h2>
              </div>

              {/* Shape Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--th-text-muted)] uppercase tracking-wider">
                  Select Frame Silhouette:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {LOCKET_SHAPES.map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => setSelectedShape(shape.id)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        selectedShape === shape.id
                          ? 'border-[var(--th-primary)] bg-[var(--th-primary)]/5 font-bold shadow-xs'
                          : 'border-[var(--th-border)] bg-[var(--th-surface-alt)] hover:border-[var(--th-border)]/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--th-text-main)]">{shape.name}</span>
                        {selectedShape === shape.id && <Check className="w-3.5 h-3.5 text-[var(--th-primary)]" />}
                      </div>
                      <span className="text-[10px] text-[var(--th-text-muted)] mt-0.5 block">{shape.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Metal Finish Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--th-text-muted)] uppercase tracking-wider">
                  Pure Silver Finish:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {METAL_FINISHES.map((finish) => (
                    <button
                      key={finish.id}
                      type="button"
                      onClick={() => setSelectedFinish(finish.id)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center space-x-3 ${
                        selectedFinish === finish.id
                          ? 'border-[var(--th-primary)] bg-[var(--th-primary)]/5 shadow-xs'
                          : 'border-[var(--th-border)] bg-[var(--th-surface-alt)]'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${finish.colorPreview} border border-black/20 shrink-0 shadow-xs`} />
                      <div>
                        <span className="text-xs font-bold block text-[var(--th-text-main)]">{finish.name}</span>
                        <span className="text-[10px] text-[var(--th-text-muted)] line-clamp-1">{finish.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight & Dimension Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--th-text-muted)] uppercase tracking-wider">
                  Select Silver Weight & Dimension:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {WEIGHT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedWeight(opt)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedWeight.id === opt.id
                          ? 'border-[var(--th-primary)] bg-[var(--th-primary)]/5 shadow-xs'
                          : 'border-[var(--th-border)] bg-[var(--th-surface-alt)]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[var(--th-text-main)]">{opt.label}</span>
                          {opt.popular && (
                            <span className="px-1.5 py-0.5 rounded bg-[var(--th-primary)] text-white text-[8px] font-bold uppercase">
                              Popular
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[var(--th-text-muted)] mt-0.5 block">{opt.description}</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-[var(--th-border)] flex justify-between items-baseline">
                        <span className="font-mono text-xs font-bold text-[var(--th-text-muted)]">{opt.weightGrams}g Net</span>
                        <span className="font-outfit text-sm font-extrabold text-[var(--th-primary)]">
                          ₹{opt.basePrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* STEP 3: MATCHING SILVER CHAIN ADD-ON */}
            <section className="p-6 rounded-3xl bg-[var(--th-card)] border border-[var(--th-border)] shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--th-primary)] font-mono">
                  STEP 03
                </span>
                <h2 className="font-serif text-xl font-bold text-[var(--th-text-main)]">
                  Select Matching 925 Pure Silver Chain
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHAIN_OPTIONS.map((chain) => (
                  <div
                    key={chain.id}
                    onClick={() => setSelectedChain(chain)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                      selectedChain.id === chain.id
                        ? 'border-[var(--th-primary)] bg-[var(--th-primary)]/5 shadow-xs'
                        : 'border-[var(--th-border)] bg-[var(--th-surface-alt)]'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-xs text-[var(--th-text-main)]">{chain.name}</h4>
                      <p className="text-[10px] text-[var(--th-text-muted)]">{chain.description}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="font-outfit font-bold text-sm text-[var(--th-primary)]">
                        {chain.price === 0 ? 'Included' : `+₹${chain.price.toLocaleString('en-IN')}`}
                      </span>
                      {selectedChain.id === chain.id && (
                        <CheckCircle2 className="w-4 h-4 text-[var(--th-primary)] ml-auto mt-0.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* STEP 4: NECESSARY CUSTOMER DETAILS & ENGRAVING */}
            <section className="p-6 rounded-3xl bg-[var(--th-card)] border border-[var(--th-border)] shadow-sm space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--th-primary)] font-mono">
                  STEP 04
                </span>
                <h2 className="font-serif text-xl font-bold text-[var(--th-text-main)]">
                  Personal Details & Sacred Laser Engraving
                </h2>
                <p className="text-xs text-[var(--th-text-muted)] mt-1">
                  Required for dispatch documentation, laser engraving, and 3D proof approval on WhatsApp.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold text-[var(--th-text-muted)] block mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[var(--th-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra Sharma"
                      className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-xs rounded-xl pl-10 pr-3.5 py-3 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="text-xs font-bold text-[var(--th-text-muted)] block mb-1">
                    WhatsApp / Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[var(--th-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 9876543210 (For 3D CAD proof)"
                      className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-xs rounded-xl pl-10 pr-3.5 py-3 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Deity / Shrine / Place Name */}
                <div>
                  <label className="text-xs font-bold text-[var(--th-text-muted)] block mb-1">
                    Deity / Sacred Shrine Name
                  </label>
                  <input
                    type="text"
                    value={shrineName}
                    onChange={(e) => setShrineName(e.target.value)}
                    placeholder="e.g. Kedarnath Dham, Kuldevi Temple, Mahadev"
                    className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-xs rounded-xl px-3.5 py-3 outline-none transition-colors"
                  />
                </div>

                {/* Family Gotra */}
                <div>
                  <label className="text-xs font-bold text-[var(--th-text-muted)] block mb-1">
                    Family Gotra / Ancestral Lineage (Optional)
                  </label>
                  <input
                    type="text"
                    value={familyGotra}
                    onChange={(e) => setFamilyGotra(e.target.value)}
                    placeholder="e.g. Kashyap, Vashishta, Bharadwaja"
                    className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-xs rounded-xl px-3.5 py-3 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Laser Engraving Text Input */}
              <div className="space-y-2 pt-2 border-t border-[var(--th-border)]">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[var(--th-text-muted)]">
                    Reverse Side Laser Engraving (Up to 35 Chars):
                  </label>
                  <span className="text-[10px] text-[var(--th-text-muted)] font-mono">
                    {engravingText.length}/35 Chars
                  </span>
                </div>

                <input
                  type="text"
                  maxLength={35}
                  value={engravingText}
                  onChange={(e) => setEngravingText(e.target.value)}
                  placeholder="e.g. ॐ नमः शिवाय or Jai Shree Ram"
                  className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-xs font-serif font-bold text-[var(--th-text-main)] rounded-xl px-3.5 py-3 outline-none transition-colors"
                />

                {/* 1-Click Popular Mantra Suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-[var(--th-text-muted)] font-medium self-center">Quick Mantras:</span>
                  {POPULAR_MANTRAS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setEngravingText(m)}
                      className="px-2 py-0.5 rounded-lg bg-[var(--th-surface-alt)] hover:bg-[var(--th-primary)]/10 text-[var(--th-text-main)] hover:text-[var(--th-primary)] border border-[var(--th-border)] text-[10px] font-serif transition-colors cursor-pointer"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vedic Consecration Puja Checkbox */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start space-x-3 cursor-pointer" onClick={() => setIncludePujaConsecration(!includePujaConsecration)}>
                <input
                  type="checkbox"
                  checked={includePujaConsecration}
                  onChange={(e) => setIncludePujaConsecration(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[var(--th-primary)] cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-amber-800 dark:text-amber-200 block">
                    Vedic Temple Consecration & Sankalpa Puja (+₹251)
                  </span>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                    Our temple priest performs Pran Pratishtha puja with Haridwar Gangajal, sacred bhasma, and Vedic chanting in your family gotra name before dispatch.
                  </p>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="text-xs font-bold text-[var(--th-text-muted)] block mb-1">
                  Special Notes for the Master Silver Karigar (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any specific design adjustment, custom chain length, or delivery deadline..."
                  className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-xs rounded-xl p-3 outline-none transition-colors"
                />
              </div>
            </section>

          </div>

        </div>
      </div>

    </div>
  );
}
