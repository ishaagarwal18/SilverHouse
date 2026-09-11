import React, { useState } from 'react';
import { PROMO_CODES } from '../../data/products';
import { 
  X, Trash2, ShoppingBag, Truck, Gift, Sparkles, ArrowRight, 
  Tag, ShieldCheck, Plus, Minus, CheckCircle2, AlertCircle, RefreshCw,
  Scale, Award, Lock, ChevronRight, Heart
} from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onProceedCheckout
}) {
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 5000;

  // Total Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.product.price) || 0) * item.quantity, 0);
  const totalSilverWeight = cartItems.reduce((acc, item) => acc + (Number(item.product.weightGrams) || 10) * item.quantity, 0);

  // Discount Calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    const codeData = PROMO_CODES[appliedCoupon];
    if (codeData) {
      if (codeData.discountPercent) {
        discountAmount = Math.round((subtotal * codeData.discountPercent) / 100);
      } else if (codeData.discountFlat) {
        discountAmount = codeData.discountFlat;
      }
    }
  }

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 199;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const progressPercentage = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  const handleApplyCoupon = (codeToApply) => {
    setCouponError('');
    const code = (codeToApply || couponInput).trim().toUpperCase();

    if (!code) return;

    if (PROMO_CODES[code]) {
      const rule = PROMO_CODES[code];
      if (subtotal < rule.minAmount) {
        setCouponError(`Add items worth ₹${(rule.minAmount - subtotal).toLocaleString('en-IN')} more to unlock code ${code}.`);
      } else {
        setAppliedCoupon(code);
        setCouponInput('');
      }
    } else {
      setCouponError('Invalid promo code. Try SACRED10 or SILVERVIP.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* High-end backdrop with smooth blur */}
      <div 
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Luxury Drawer Container */}
      <div className="relative w-full max-w-lg bg-[var(--th-card)] text-[var(--th-text-main)] h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300 border-l border-[var(--th-border)] transition-colors">
        
        {/* 1. Atelier Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--th-border)] bg-[var(--th-surface-alt)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] text-[var(--th-accent)] flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-serif font-bold text-lg text-[var(--th-text-main)] tracking-tight">
                    Shopping Bag
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[var(--th-primary)] text-white shadow-xs">
                    {cartItems.length}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5 text-[11px] text-[var(--th-text-muted)]">
                  <Award className="w-3 h-3 text-[var(--th-accent)] shrink-0" />
                  <span>BIS Certified 925 Sterling • Free Insured Delivery</span>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="w-9 h-9 flex items-center justify-center text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] rounded-full hover:bg-[var(--th-card)] border border-transparent hover:border-[var(--th-border)] transition-all cursor-pointer"
              title="Close Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Free Express Shipping Progress Meter */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[var(--th-surface-alt)] via-[var(--th-card)] to-[var(--th-surface-alt)] border-b border-[var(--th-border)]">
          <div className="flex items-center justify-between text-xs mb-2 font-medium">
            <span className="flex items-center space-x-1.5 text-[var(--th-text-main)]">
              <Truck className="w-4 h-4 text-[var(--th-accent)] shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold">
                {remainingForFreeShipping <= 0 ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 inline text-amber-500" />
                    <span>Unlocked Free Insured Express Delivery!</span>
                  </span>
                ) : (
                  <>Add <strong className="text-[var(--th-primary)] font-outfit">₹{remainingForFreeShipping.toLocaleString('en-IN')}</strong> more for Free Shipping</>
                )}
              </span>
            </span>
            <span className="font-bold text-[var(--th-primary)] text-xs font-mono">{progressPercentage}%</span>
          </div>

          {/* Meter Track */}
          <div className="w-full bg-[var(--th-border)]/70 rounded-full h-2 overflow-hidden p-0.5">
            <div 
              className="bg-gradient-to-r from-[var(--th-accent)] via-[var(--th-primary)] to-emerald-500 h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* 3. Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-24 px-6">
              <div className="w-20 h-20 rounded-3xl bg-[var(--th-surface-alt)] border border-[var(--th-border)] text-[var(--th-text-muted)] flex items-center justify-center mx-auto mb-5 shadow-inner">
                <ShoppingBag className="w-10 h-10 text-[var(--th-accent)]/70" />
              </div>
              <h4 className="font-serif text-xl font-bold text-[var(--th-text-main)]">Your Bag is Currently Empty</h4>
              <p className="text-xs text-[var(--th-text-muted)] mt-2 max-w-sm mx-auto leading-relaxed">
                Explore our hallmarked 925 sterling silver payals, rings, temple idols, chains, and certified 999 coins.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-7 py-3 rounded-full bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white text-xs font-bold uppercase tracking-widest shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <span>Discover Collections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            cartItems.map((item, idx) => {
              const imgSrc = (Array.isArray(item.product.images) && item.product.images.length > 0 && item.product.images[0])
                ? item.product.images[0]
                : '/images/hero_silver_coins.png';

              const unitPrice = Number(item.product.price) || 0;
              const originalPrice = item.product.original_price ? Number(item.product.original_price) : Math.round(unitPrice * 1.15);
              const totalItemPrice = unitPrice * item.quantity;
              const purityLabel = item.product.purity || '92.5 Sterling';
              const weightVal = item.product.weightGrams || item.product.weight || '12.5';

              return (
                <div
                  key={`${item.product.id || item.product.product_id}-${idx}`}
                  className="p-4 rounded-2xl border border-[var(--th-border)] bg-[var(--th-card)] shadow-xs hover:shadow-md hover:border-[var(--th-primary)]/40 transition-all relative group"
                >
                  <div className="flex items-start space-x-4">
                    
                    {/* Thumbnail with Hallmarked badge overlay */}
                    <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[var(--th-surface-alt)] border border-[var(--th-border)] shrink-0 shadow-xs">
                      <img
                        src={imgSrc}
                        alt={item.product.name || item.product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = '/images/hero_silver_coins.png'; }}
                      />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-black/75 text-white backdrop-blur-xs font-mono">
                        {purityLabel.includes('999') ? '999 Pure' : '925 Silver'}
                      </span>
                    </div>

                    {/* Details Column */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-serif font-bold text-sm sm:text-base text-[var(--th-text-main)] leading-snug line-clamp-1">
                            {item.product.name || item.product.title}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(idx)}
                            className="text-[var(--th-text-muted)] hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer shrink-0"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Specifications Chips */}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[var(--th-surface-alt)] border border-[var(--th-border)] text-[var(--th-text-muted)] font-medium">
                            <Scale className="w-3 h-3 text-[var(--th-accent)]" />
                            <span>{weightVal}g</span>
                          </span>
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                            <ShieldCheck className="w-3 h-3" />
                            <span>BIS Certified</span>
                          </span>
                        </div>
                      </div>

                      {/* Pricing and Stepper Controls */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--th-border)]/70">
                        <div>
                          <div className="flex items-baseline space-x-2">
                            <span className="font-outfit font-extrabold text-base sm:text-lg text-[var(--th-primary)]">
                              ₹{totalItemPrice.toLocaleString('en-IN')}
                            </span>
                            {originalPrice > unitPrice && (
                              <span className="text-xs text-[var(--th-text-muted)] line-through font-outfit">
                                ₹{(originalPrice * item.quantity).toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                          {item.quantity > 1 && (
                            <span className="text-[10px] text-[var(--th-text-muted)] block">
                              ₹{unitPrice.toLocaleString('en-IN')} each
                            </span>
                          )}
                        </div>

                        {/* Tactile Stepper */}
                        <div className="flex items-center space-x-2 bg-[var(--th-surface-alt)] border border-[var(--th-border)] rounded-xl p-1 shadow-2xs">
                          <button
                            onClick={() => onUpdateQty(idx, Math.max(1, item.quantity - 1))}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:bg-[var(--th-card)] transition-all cursor-pointer shadow-2xs"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-bold text-xs text-[var(--th-text-main)] font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQty(idx, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:bg-[var(--th-card)] transition-all cursor-pointer shadow-2xs"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 4. Luxury Checkout Card & Invoice Breakdown */}
        {cartItems.length > 0 && (
          <div className="p-5 bg-gradient-to-b from-[var(--th-surface-alt)] to-[var(--th-card)] border-t border-[var(--th-border)] space-y-4 shadow-lg">
            
            {/* Promo Code & Voucher Section */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs shadow-2xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold block">Coupon '{appliedCoupon}' Applied!</span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-300">You saved ₹{discountAmount.toLocaleString('en-IN')} on this order</span>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <form onSubmit={(e) => { e.preventDefault(); handleApplyCoupon(); }} className="flex space-x-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-[var(--th-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Enter Promo Code (e.g. SACRED10)"
                        className="w-full bg-[var(--th-card)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-xs rounded-xl pl-10 pr-3.5 py-2.5 text-[var(--th-text-main)] uppercase tracking-wider outline-none placeholder:normal-case placeholder:text-[var(--th-text-muted)]/60 shadow-2xs transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                      Apply
                    </button>
                  </form>

                  {/* 1-Click Coupon Quick Chips */}
                  <div className="flex items-center space-x-2 pt-0.5">
                    <span className="text-[10px] text-[var(--th-text-muted)] font-medium">Offers:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('SACRED10')}
                      className="px-2.5 py-1 rounded-lg bg-[var(--th-card)] hover:bg-[var(--th-primary)]/10 text-[var(--th-primary)] border border-[var(--th-border)] text-[10px] font-bold font-mono transition-colors cursor-pointer"
                    >
                      SACRED10 (10% OFF)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('SILVERVIP')}
                      className="px-2.5 py-1 rounded-lg bg-[var(--th-card)] hover:bg-[var(--th-primary)]/10 text-[var(--th-primary)] border border-[var(--th-border)] text-[10px] font-bold font-mono transition-colors cursor-pointer"
                    >
                      SILVERVIP (₹500 OFF)
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[11px] text-rose-600 flex items-center space-x-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{couponError}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Structured Invoice Summary Card */}
            <div className="p-4 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] space-y-2 text-xs text-[var(--th-text-muted)] shadow-2xs">
              <div className="flex justify-between items-center">
                <span>Items Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-semibold text-[var(--th-text-main)] font-outfit text-sm">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center space-x-1">
                  <Scale className="w-3.5 h-3.5 text-[var(--th-accent)]" />
                  <span>Total Pure Silver Weight</span>
                </span>
                <span className="font-mono text-[var(--th-text-main)] font-semibold">{totalSilverWeight.toFixed(1)} Grams</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span>Special Savings ({appliedCoupon})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="flex items-center space-x-1">
                  <Truck className="w-3.5 h-3.5 text-[var(--th-accent)]" />
                  <span>Insured Express Shipping</span>
                </span>
                <span className="font-semibold">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider text-[11px]">FREE</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span>BIS Hallmark Certification</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase text-[11px]">INCLUDED FREE</span>
              </div>

              <div className="flex justify-between items-baseline pt-2.5 mt-2 border-t border-[var(--th-border)] text-sm font-bold text-[var(--th-text-main)]">
                <div>
                  <span className="block text-sm">Total Payable</span>
                  <span className="text-[10px] text-[var(--th-text-muted)] font-normal">Inclusive of 3% GST & Insured Transit</span>
                </div>
                <span className="font-outfit text-2xl font-extrabold text-[var(--th-primary)] tracking-tight">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Trust Assurance Strip */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-[var(--th-text-muted)]">
              <div className="p-2 rounded-xl bg-[var(--th-card)] border border-[var(--th-border)] flex flex-col items-center justify-center">
                <Award className="w-4 h-4 text-[var(--th-accent)] mb-1" />
                <span className="font-bold text-[var(--th-text-main)]">BIS 925</span>
                <span>Hallmarked</span>
              </div>
              <div className="p-2 rounded-xl bg-[var(--th-card)] border border-[var(--th-border)] flex flex-col items-center justify-center">
                <Truck className="w-4 h-4 text-[var(--th-accent)] mb-1" />
                <span className="font-bold text-[var(--th-text-main)]">100% Insured</span>
                <span>Free Transit</span>
              </div>
              <div className="p-2 rounded-xl bg-[var(--th-card)] border border-[var(--th-border)] flex flex-col items-center justify-center">
                <RefreshCw className="w-4 h-4 text-[var(--th-accent)] mb-1" />
                <span className="font-bold text-[var(--th-text-main)]">15-Day Easy</span>
                <span>Replacements</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                onClose();
                onProceedCheckout(finalTotal, discountAmount, appliedCoupon);
              }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[var(--th-primary)] to-[var(--th-primary-hover)] text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all flex items-center justify-between cursor-pointer group hover:scale-[1.01]"
            >
              <div className="text-left">
                <span className="block font-sans text-[11px] font-extrabold uppercase tracking-widest">
                  Proceed to Delivery & Checkout
                </span>
                <span className="text-[10px] text-white/80 font-normal">
                  Insured Transit • Certified Hallmarking
                </span>
              </div>
              <div className="flex items-center space-x-2.5 bg-white/15 px-3.5 py-1.5 rounded-xl backdrop-blur-xs">
                <span className="font-outfit font-black text-sm sm:text-base">₹{finalTotal.toLocaleString('en-IN')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
