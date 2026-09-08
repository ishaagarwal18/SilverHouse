import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PRODUCTS, PINCODES } from '../../data/products';
import {
  Star, ShieldCheck, Award, Truck, Heart, ShoppingBag,
  Sparkles, Upload, CheckCircle2, ChevronDown, ChevronRight, RefreshCw, FileText
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
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState('specs');

  // Customizer State for Yatra Lockets / Engraving
  const [customText, setCustomText] = useState('');
  const [customGotra, setCustomGotra] = useState('');
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);

  // Pincode Estimator State
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);

  const productList = (allProducts && allProducts.length > 0) ? allProducts : PRODUCTS;
  const currentProduct = product || productList.find(p => String(p.id) === String(productId)) || productList[0];

  if (!currentProduct) return null;

  const discountPct = currentProduct.originalPrice
    ? Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)
    : null;

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

  const isCurrentWishlisted = isWishlisted || wishlistIds?.includes(currentProduct.id);

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20">

      {/* Category Breadcrumb */}
      <div className="bg-silver-100 border-b border-silver-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-silver-600">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left Column: Image Gallery (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">

            {/* Main High-Res Viewer */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-silver-200 silver-card-shadow group">
              <img
                src={Array.isArray(currentProduct.images) && currentProduct.images[selectedImage] ? currentProduct.images[selectedImage] : (currentProduct.images && currentProduct.images[0] ? currentProduct.images[0] : '')}
                alt={currentProduct.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Purity & Discount Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col space-y-1.5">
                <span className="bg-[#1A1A1A]/90 backdrop-blur-md text-[#D4AF37] text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{currentProduct.purity}</span>
                </span>
                {discountPct && (
                  <span className="bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {discountPct}% OFF FESTIVE DISCOUNT
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => onToggleWishlist(currentProduct)}
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
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-silver-200">
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
                <div className="flex items-center space-x-1 text-[#D4AF37]">
                  <Star className="w-4 h-4 fill-[#D4AF37]" />
                  <span className="font-bold text-[#1A1A1A]">{currentProduct.rating}</span>
                  <span className="text-silver-400">({currentProduct.reviewsCount} Customer Reviews)</span>
                </div>
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
                    {currentProduct.originalPrice && (
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
                    onClick={() => setQty(qty + 1)}
                    className="w-8 h-8 flex items-center justify-center font-bold text-silver-700 hover:text-black rounded-lg hover:bg-silver-200"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => onAddToCart(currentProduct, qty, { customText, uploadedImagePreview })}
                  className="flex-1 py-3.5 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <Sparkles className="w-4 h-4" />
                  <span>Buy Now • Express Checkout</span>
                </button>
              </div>
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

      </div>
    </div>
  );
}
