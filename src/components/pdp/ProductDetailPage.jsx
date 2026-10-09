import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PRODUCTS, PINCODES } from '../../data/products';
import { recordProductView, fetchStoreParameters } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import RecentlyViewedSection from '../common/RecentlyViewedSection';
import ProductReviewsSection from './ProductReviewsSection';
import {
  Star, ShieldCheck, Award, Truck, Heart, ShoppingBag,
  Sparkles, Upload, CheckCircle2, ChevronDown, ChevronRight, RefreshCw, FileText, ArrowLeft, MessageCircle, ZoomIn
} from 'lucide-react';

export default function ProductDetailPage({
  product,
  allProducts,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  wishlistIds = [],
  onSelectProduct,
  onNavigateCheckout,
  onTriggerToast
}) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth ? auth.user : null;
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState('specs');

  const handleImageMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  // Customizer State for Yatra Lockets / Engraving
  const [customText, setCustomText] = useState('');
  const [customGotra, setCustomGotra] = useState('');
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);

  // Pincode Estimator State
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);

  // Store Parameters State (WhatsApp API configuration from dbo.store_parameter)
  const [storeParams, setStoreParams] = useState(null);

  // Load WhatsApp API config from store_parameter stored procedure
  useEffect(() => {
    async function loadStoreParams() {
      try {
        const params = await fetchStoreParameters();
        if (params) {
          setStoreParams(params.parameters || params);
        }
      } catch (err) {
        console.warn('Could not load store parameters:', err);
      }
    }
    loadStoreParams();
  }, []);

  const handleWhatsAppInquiry = () => {
    let phoneDigits = '919537178477'; // Fallback to official SilverHouse support number
    const rawWpApi = storeParams?.wp_api;

    if (rawWpApi) {
      if (typeof rawWpApi === 'string' && (rawWpApi.startsWith('http://') || rawWpApi.startsWith('https://'))) {
        try {
          const urlObj = new URL(rawWpApi);
          const phoneParam = urlObj.searchParams.get('phone') || urlObj.searchParams.get('number') || urlObj.searchParams.get('mobile');
          if (phoneParam) {
            const extracted = phoneParam.replace(/\D/g, '');
            if (extracted.length === 10) phoneDigits = '91' + extracted;
            else if (extracted.length >= 11 && extracted.length <= 13) phoneDigits = extracted;
          }
        } catch (e) {
          // ignore URL parse errors
        }
      } else {
        const extracted = String(rawWpApi).replace(/\D/g, '');
        if (extracted.length === 10) {
          phoneDigits = '91' + extracted;
        } else if (extracted.length >= 11 && extracted.length <= 13) {
          phoneDigits = extracted;
        }
      }
    }

    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const formattedPrice = `₹${Number(currentProduct.price || 0).toLocaleString('en-IN')}`;
    const msrpPrice = currentProduct.originalPrice ? ` (MSRP: ₹${Number(currentProduct.originalPrice).toLocaleString('en-IN')})` : '';

    const msg = `Hello Silver House! 👋\n\nI have inquired about:\n📌 *Product Name:* ${currentProduct.name}\n💰 *Price:* ${formattedPrice}${msrpPrice}\n💎 *Purity:* ${currentProduct.purity || '925 Sterling / 999 Fine Silver'}\n⚖️ *Net Weight:* ${currentProduct.weightGrams ? currentProduct.weightGrams + 'g Pure Silver' : 'BIS Hallmarked'}\n🆔 *SKU / Product ID:* #${currentProduct.id || currentProduct.product_id}\n🔗 *Product Link:* ${pageUrl}\n\nCould you please share more details and confirm availability?`;

    const waLink = `https://api.whatsapp.com/send?phone=${phoneDigits}&text=${encodeURIComponent(msg)}`;
    window.open(waLink, '_blank');
  };

  const productList = (allProducts && allProducts.length > 0) ? allProducts : PRODUCTS;

  const currentProduct = product || productList.find(p => String(p.id) === String(productId)) || productList[0];

  if (!currentProduct) return null;

  // Record product view into dbo.viewed table
  useEffect(() => {
    if (currentProduct && (currentProduct.product_id || currentProduct.id)) {
      const pId = currentProduct.product_id || currentProduct.id;
      const uId = user ? (user.userId || user.user_id || user.id) : null;
      recordProductView(pId, uId);
    }
    if (currentProduct && currentProduct.name) {
      document.title = `${currentProduct.name} | SilverHouse`;
    }
  }, [currentProduct?.id, currentProduct?.product_id, currentProduct?.name, user?.userId, user?.user_id, user?.id]);


  const discountPct = currentProduct.discount !== undefined && currentProduct.discount !== null && Number(currentProduct.discount) > 0
    ? Number(currentProduct.discount)
    : (currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price
      ? Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)
      : null);

  const relatedProducts = productList.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id).slice(0, 4);

  // Handle Mock Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImagePreview(reader.result);
        onTriggerToast('success', 'Shrine Image Uploaded', 'Your shrine deity photo preview is attached to your custom locket order.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Pincode Lookup
  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!pincodeInput || pincodeInput.trim().length !== 6) {
      onTriggerToast('error', 'Invalid PIN Code', 'Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    const match = PINCODES.find(p => p.code === pincodeInput.trim());
    if (match) {
      setPincodeResult(match);
      onTriggerToast('success', 'Delivery Available', `Insured delivery to ${match.city} in ${match.days} business days.`);
    } else {
      setPincodeResult({
        city: 'Verified Location',
        days: '3 to 5',
        expressAvailable: true,
        codAvailable: true
      });
      onTriggerToast('success', 'Pincode Serviceable', 'Insured express delivery is available for your PIN code.');
    }
  };

  const isCurrentWishlisted = isWishlisted || wishlistIds?.some(id => String(id) === String(currentProduct.id));

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20">

      {/* Category Breadcrumb & Back Button */}
      <div className="bg-silver-100 border-b border-silver-200 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-silver-600">
          <div className="flex items-center space-x-3 overflow-x-auto">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white hover:bg-silver-50 border border-silver-300 text-xs font-bold text-silver-800 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all cursor-pointer shadow-2xs group shrink-0"
              title="Go back to previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#D4AF37] group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/')}
                className="hover:text-[#D4AF37] font-medium transition-colors cursor-pointer"
              >
                Home
              </button>
              <ChevronRight className="w-3 h-3 text-silver-400" />
              <button
                onClick={() => navigate('/catalog')}
                className="hover:text-[#D4AF37] font-medium transition-colors cursor-pointer"
              >
                Catalog
              </button>
              {currentProduct.category && (
                <>
                  <ChevronRight className="w-3 h-3 text-silver-400" />
                  <button
                    onClick={() => navigate(`/category/${currentProduct.category}`)}
                    className="hover:text-[#D4AF37] font-medium capitalize transition-colors cursor-pointer"
                  >
                    {currentProduct.category_name || currentProduct.category.replace(/-/g, ' ')}
                  </button>
                </>
              )}
              <ChevronRight className="w-3 h-3 text-silver-400" />
              <span className="text-[#1A1A1A] font-semibold line-clamp-1">{currentProduct.name}</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left Column: Image Gallery (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">

            {/* Main High-Res In-Place Magnifier Viewer */}
            <div
              onMouseEnter={() => setIsImageHovered(true)}
              onMouseLeave={() => setIsImageHovered(false)}
              onMouseMove={handleImageMouseMove}
              className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-silver-200 silver-card-shadow group cursor-crosshair"
            >
              <img
                src={Array.isArray(currentProduct.images) && currentProduct.images[selectedImage] ? currentProduct.images[selectedImage] : (currentProduct.images && currentProduct.images[0] ? currentProduct.images[0] : (currentProduct.image_url || currentProduct.image || ''))}
                alt={currentProduct.name}
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isImageHovered ? 'scale(2.4)' : 'scale(1)',
                  transition: isImageHovered ? 'transform 0.08s ease-out' : 'transform 0.3s ease-out'
                }}
                className="w-full h-full object-cover pointer-events-none"
              />

              {/* Purity & Discount Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col space-y-1.5 pointer-events-none">
                <span className="bg-[#1A1A1A]/90 backdrop-blur-md text-[#D4AF37] text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{currentProduct.purity}</span>
                </span>
                {discountPct !== null && discountPct > 0 && (
                  <span className="bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {discountPct}% OFF FESTIVE DISCOUNT
                  </span>
                )}
              </div>

              {/* Hover Hint Overlay Badge */}
              <div className={`absolute bottom-4 right-4 z-10 transition-opacity duration-300 pointer-events-none ${isImageHovered ? 'opacity-0' : 'opacity-100'}`}>
                <span className="px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-lg border border-amber-400/30">
                  <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hover to Magnify 2.4x</span>
                </span>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(currentProduct);
                }}
                className={`absolute top-4 right-4 z-10 p-3 rounded-full backdrop-blur-md transition-all shadow-md ${isCurrentWishlisted
                  ? 'bg-rose-600 text-white'
                  : 'bg-white/90 text-silver-700 hover:bg-white hover:text-black'
                  }`}
                title="Toggle Wishlist"
              >
                <Heart className={`w-5 h-5 ${isCurrentWishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Navigation */}
            {Array.isArray(currentProduct.images) && currentProduct.images.length > 1 && (
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {currentProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white ${selectedImage === idx
                      ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30 shadow-md scale-102'
                      : 'border-silver-200 opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Stamps Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-silver-200">
              <div className="p-3 bg-white rounded-xl border border-silver-200 flex items-center space-x-3 text-xs">
                <ShieldCheck className="w-6 h-6 text-[#D4AF37] shrink-0" />
                <div>
                  <h5 className="font-bold text-[#1A1A1A]">BIS Hallmarked</h5>
                  <p className="text-[10px] text-silver-500">Government Certified Purity</p>
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-silver-200 flex items-center space-x-3 text-xs">
                <Truck className="w-6 h-6 text-[#D4AF37] shrink-0" />
                <div>
                  <h5 className="font-bold text-[#1A1A1A]">Insured Express</h5>
                  <p className="text-[10px] text-silver-500">Tamper-Proof Transit</p>
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-silver-200 flex items-center space-x-3 text-xs">
                <Award className="w-6 h-6 text-[#D4AF37] shrink-0" />
                <div>
                  <h5 className="font-bold text-[#1A1A1A]">Authentic Guarantee</h5>
                  <p className="text-[10px] text-silver-500">100% Money-Back</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Product Details & Interactive Form (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-silver-200 shadow-xs space-y-6">
            <div>
              {/* Rating & SKU */}
              <div className="flex items-center justify-between text-xs mb-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('customer-reviews-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center space-x-1 text-[#D4AF37] hover:underline cursor-pointer group"
                  title="View customer reviews & ratings"
                >
                  <Star className="w-4 h-4 fill-[#D4AF37]" />
                  <span className="font-bold text-[#1A1A1A]">{currentProduct.rating}</span>
                  <span className="text-silver-400 group-hover:text-[#D4AF37] transition-colors">
                    ({currentProduct.reviewsCount} Customer Reviews)
                  </span>
                </button>
                <span className="text-silver-400 font-mono">SKU: {currentProduct.id.toUpperCase()}</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] leading-tight mb-3">
                {currentProduct.name}
              </h1>

              {/* Price & Weight Card */}
              <div className="p-4 rounded-xl bg-silver-50 border border-silver-200 flex items-center justify-between my-4">
                <div>
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-bold text-[var(--th-primary)] font-outfit tracking-tight">
                      ₹{currentProduct.price.toLocaleString('en-IN')}
                    </span>
                    {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
                      <span className="text-sm text-silver-400 line-through font-outfit font-medium">
                        ₹{currentProduct.originalPrice.toLocaleString('en-IN')}

                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-silver-500 mt-1 block">
                    Inclusive of all taxes & BIS Hallmarking Certification
                  </span>
                </div>

                <div className="text-right border-l border-silver-300 pl-4">
                  <span className="text-[10px] text-silver-500 uppercase tracking-wider block">Net Silver</span>
                  <span className="text-base font-bold text-[#D4AF37]">{currentProduct.weightGrams} Grams</span>
                </div>
              </div>

              {/* Live Inventory Stock Status & Sales Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-silver-50 border border-silver-200 text-xs my-3">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${currentProduct.quantity > 5 ? 'bg-emerald-500 animate-pulse' : (currentProduct.quantity > 0 ? 'bg-amber-500 animate-pulse' : 'bg-rose-500')
                    }`} />
                  <span className="font-semibold">
                    {currentProduct.quantity > 5 ? (
                      <span className="text-emerald-700 font-bold">In Stock ({currentProduct.quantity} units available)</span>
                    ) : currentProduct.quantity > 0 ? (
                      <span className="text-amber-700 font-bold">Hurry, only {currentProduct.quantity} left in stock!</span>
                    ) : (
                      <span className="text-rose-600 font-bold">Currently Out of Stock</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 bg-white border border-silver-200 px-3 py-1 rounded-lg text-[#D4AF37] font-bold text-xs shadow-2xs">
                  <span>🔥</span>
                  <span>{Number(currentProduct.sold || 0)} Sold</span>
                </div>
              </div>
            </div>

            {/* Customization Form (Yatra Lockets & Engravings) */}
            {(currentProduct.isCustomizable || currentProduct.isYatraLocket) && (
              <div className="p-4 rounded-xl bg-linear-to-r from-[#1A1A1A] to-[#2B2B2B] text-white border border-[#D4AF37]/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Personalize Your Sacred Artifact</span>
                  </span>
                  <span className="text-[10px] bg-[#D4AF37] text-black font-bold px-2 py-0.5 rounded">
                    Free Customization
                  </span>
                </div>

                <div>
                  <label className="text-xs text-silver-300 block mb-1">
                    Engraving Text (Family Name / Gotra / Mantra)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Om Namah Shivaya / Sharma Parivar"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs text-white placeholder-silver-400 focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-xs text-silver-300 block mb-1">
                    Attach Shrine Photo for Locket Inset (Optional)
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 border border-white/30 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose File</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {uploadedImagePreview && (
                      <span className="text-xs text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Photo Attached</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Selector & Main Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-silver-300 rounded-xl bg-silver-50 p-1">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-8 h-8 flex items-center justify-center font-bold text-silver-700 hover:text-black rounded-lg hover:bg-silver-200"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-[#1A1A1A]">{qty}</span>
                  <button
                    disabled={currentProduct.quantity !== undefined && currentProduct.quantity !== null && qty >= currentProduct.quantity}
                    onClick={() => setQty(qty + 1)}
                    className={`w-8 h-8 flex items-center justify-center font-bold text-silver-700 hover:text-black rounded-lg hover:bg-silver-200 ${currentProduct.quantity !== undefined && currentProduct.quantity !== null && qty >= currentProduct.quantity ? 'opacity-30 cursor-not-allowed' : ''
                      }`}
                  >
                    +
                  </button>
                </div>

                <button
                  disabled={currentProduct.quantity !== undefined && currentProduct.quantity !== null && currentProduct.quantity <= 0}
                  onClick={() => {
                    const hasCustomization = Boolean(customText && customText.trim()) || Boolean(uploadedImagePreview);
                    const customConfigPayload = hasCustomization
                      ? {
                        shrineName: currentProduct.isYatraLocket ? (currentProduct.name || 'Sacred Locket') : currentProduct.name,
                        engravingText: customText ? customText.trim() : '',
                        allUploadedImages: uploadedImagePreview ? [uploadedImagePreview] : []
                      }
                      : null;
                    onAddToCart(currentProduct, qty, customConfigPayload);
                  }}
                  className={`flex-1 py-3.5 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 ${currentProduct.quantity !== undefined && currentProduct.quantity !== null && currentProduct.quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <Sparkles className="w-4 h-4" />
                  <span>{currentProduct.quantity !== undefined && currentProduct.quantity !== null && currentProduct.quantity <= 0 ? 'Out of Stock' : 'Buy Now • Express Checkout'}</span>
                </button>
              </div>

              {/* WhatsApp Instant Inquiry Button */}
              <button
                type="button"
                onClick={handleWhatsAppInquiry}
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer border border-[#25D366]/30 uppercase tracking-wider group"
                title="Inquire directly on WhatsApp with product details & live stock availability"
              >
                <MessageCircle className="w-4 h-4 text-white fill-current group-hover:scale-110 transition-transform" />
                <span>Inquire on WhatsApp</span>
              </button>
            </div>


            {/* Indian Pincode Estimator Box */}
            <div className="p-4 bg-silver-50 rounded-xl border border-silver-200 space-y-2">
              <span className="text-xs font-bold text-[#1A1A1A] block">
                Check Delivery & COD Availability
              </span>
              <form onSubmit={handlePincodeCheck} className="flex space-x-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit PIN code (e.g. 110001)"
                  className="flex-1 bg-white border border-silver-300 rounded-lg px-3 py-2 text-xs text-[#1A1A1A] focus:outline-hidden focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A1A1A] text-white text-xs font-semibold rounded-lg hover:bg-[#D4AF37] hover:text-black transition-colors"
                >
                  Check
                </button>
              </form>

              {pincodeResult && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Delivery Available for {pincodeResult.city} ({pincodeInput})</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    • Expected Delivery: <strong>{pincodeResult.estDays}</strong>
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    • Cash on Delivery (COD): <strong>Available</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Specifications & Care Accordions */}
            <div className="border-t border-silver-200 pt-4 space-y-3">
              {/* Specs */}
              <div className="border border-silver-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'specs' ? null : 'specs')}
                  className="w-full p-3.5 bg-silver-50 text-left font-bold text-xs text-[#1A1A1A] flex items-center justify-between"
                >
                  <span>Product Specifications</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'specs' ? 'rotate-180 text-[#D4AF37]' : ''}`} />
                </button>

                {activeAccordion === 'specs' && (
                  <div className="p-4 bg-white text-xs space-y-2 border-t border-silver-200">
                    {Object.entries(currentProduct.specs || {}).map(([key, val]) => (
                      <div key={key} className="flex justify-between border-b border-silver-100 pb-1.5 last:border-none">
                        <span className="text-silver-600">{key}:</span>
                        <span className="font-semibold text-[#1A1A1A] text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Care Instructions */}
              <div className="border border-silver-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'care' ? null : 'care')}
                  className="w-full p-3.5 bg-silver-50 text-left font-bold text-xs text-[#1A1A1A] flex items-center justify-between"
                >
                  <span>Care & Anti-Tarnish Cleaning Guide</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'care' ? 'rotate-180 text-[#D4AF37]' : ''}`} />
                </button>

                {activeAccordion === 'care' && (
                  <div className="p-4 bg-white text-xs text-silver-700 space-y-2 border-t border-silver-200 leading-relaxed">
                    <p>• Pure 925 & 999 silver naturally reacts with ambient moisture over time. Store in the complimentary airtight anti-tarnish velvet pouch.</p>
                    <p>• Clean gently with the provided microfiber silver polishing cloth. Avoid harsh chemical detergents or abrasive brushes.</p>
                  </div>
                )}
              </div>

              {/* Shipping & Returns */}
              <div className="border border-silver-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
                  className="w-full p-3.5 bg-silver-50 text-left font-bold text-xs text-[#1A1A1A] flex items-center justify-between"
                >
                  <span>Shipping & Easy 7-Day Returns</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'shipping' ? 'rotate-180 text-[#D4AF37]' : ''}`} />
                </button>

                {activeAccordion === 'shipping' && (
                  <div className="p-4 bg-white text-xs text-silver-700 space-y-2 border-t border-silver-200 leading-relaxed">
                    <p>• <strong>Free Insured Shipping</strong> on orders above ₹5,000 across India.</p>
                    <p>• 7-Day Easy Exchange Policy for unengraved items with original hallmark tamper packaging intact.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Customer Reviews & Ratings Section */}
        <ProductReviewsSection
          product={currentProduct}
          user={user}
          onTriggerToast={onTriggerToast}
        />

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-silver-200">
            <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-8 text-center">
              Complete Your Sacred Collection
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectProduct(rel)}
                  className="bg-white p-4 rounded-xl border border-silver-200 hover:border-[#D4AF37] cursor-pointer transition-all"
                >
                  <img src={rel.images[0]} alt={rel.name} className="w-full h-44 object-cover rounded-lg mb-3" />
                  <span className="text-[10px] font-bold text-[#D4AF37] bg-black px-2 py-0.5 rounded">
                    {rel.purity}
                  </span>
                  <h4 className="font-semibold text-xs text-[#1A1A1A] mt-2 line-clamp-1">{rel.name}</h4>
                  <p className="font-bold text-sm text-[#1A1A1A] font-outfit tracking-tight mt-1">₹{rel.price.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed Products Section */}
        <RecentlyViewedSection
          excludeProductId={currentProduct.product_id || currentProduct.id}
          onSelectProduct={onSelectProduct}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          wishlistIds={wishlistIds}
          className="mt-16 pt-10 border-t border-silver-200"
        />

        {/* Mobile Sticky Add-to-Cart / Buy Now Bar */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-silver-200 p-3 md:hidden flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-silver-500 font-medium uppercase tracking-wider">Total Price</span>
            <span className="text-base font-bold text-[var(--th-primary)] font-outfit leading-tight truncate">
              ₹{currentProduct.price.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              disabled={currentProduct.quantity !== undefined && currentProduct.quantity !== null && currentProduct.quantity <= 0}
              onClick={() => {
                const hasCustomization = Boolean(customText && customText.trim()) || Boolean(uploadedImagePreview);
                const customConfigPayload = hasCustomization
                  ? {
                    shrineName: currentProduct.isYatraLocket ? (currentProduct.name || 'Sacred Locket') : currentProduct.name,
                    engravingText: customText ? customText.trim() : '',
                    allUploadedImages: uploadedImagePreview ? [uploadedImagePreview] : []
                  }
                  : null;
                onAddToCart(currentProduct, qty, customConfigPayload);
              }}
              className={`py-2.5 px-4 bg-[#1A1A1A] active:bg-[#D4AF37] text-white active:text-black font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${currentProduct.quantity !== undefined && currentProduct.quantity !== null && currentProduct.quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>{currentProduct.quantity !== undefined && currentProduct.quantity !== null && currentProduct.quantity <= 0 ? 'Out of Stock' : 'Buy Now'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
