import React, { useState } from 'react';
import { PROMO_CODES } from '../../data/products';
import { 
  X, Trash2, ShoppingBag, Truck, Gift, Sparkles, ArrowRight, 
  Tag, ShieldCheck, Plus, Minus, CheckCircle2, AlertCircle, RefreshCw
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

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 250;
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
        setCouponError(`Add items worth ₹${(rule.minAmount - subtotal).toLocaleString('en-IN')} more to use code ${code}.`);
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
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-[var(--th-card)] text-[var(--th-text-main)] h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300 border-l border-[var(--th-border)] transition-colors">
        
        {/* 1. Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--th-border)] flex items-center justify-between bg-[var(--th-surface-alt)]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--th-card)] border border-[var(--th-border)] text-[var(--th-accent)] flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--th-text-main)] tracking-tight">
                Shopping Cart
              </h3>
              <p className="text-[11px] text-[var(--th-text-muted)] font-medium">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your bag
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] rounded-xl hover:bg-[var(--th-card)] transition-colors cursor-pointer"
            title="Close Cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Free Shipping Progress Meter Bar */}
        <div className="p-4 bg-[var(--th-surface-alt)]/60 border-b border-[var(--th-border)]">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="flex items-center space-x-1.5 text-[var(--th-text-main)]">
              <Truck className="w-4 h-4 text-[var(--th-accent)] shrink-0" />
              <span className="text-[11px] sm:text-xs">
                {remainingForFreeShipping <= 0 
                  ? "🎉 You unlocked FREE Insured Express Shipping!" 
                  : `Add ₹${remainingForFreeShipping.toLocaleString('en-IN')} more for Free Shipping`}
              </span>
            </span>
            <span className="font-bold text-[var(--th-accent)] text-xs font-mono">{progressPercentage}%</span>
          </div>

          {/* Meter Track */}
          <div className="w-full bg-[var(--th-border)] rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[var(--th-accent)] to-[var(--th-primary)] h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* 3. Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {cartItems.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--th-surface-alt)] border border-[var(--th-border)] text-[var(--th-text-muted)] flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-[var(--th-accent)]" />
              </div>
              <p className="font-serif text-lg font-bold text-[var(--th-text-main)]">Your Bag is Empty</p>
              <p className="text-xs text-[var(--th-text-muted)] mt-1.5 max-w-xs mx-auto leading-relaxed">
                Discover authentic 925 sterling silver & 999 pure coins, jewellery, and devotional idols.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-full bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            cartItems.map((item, idx) => {
              const imgSrc = (Array.isArray(item.product.images) && item.product.images.length > 0 && item.product.images[0])
                ? item.product.images[0]
                : '/images/hero_silver_coins.png';

              return (
                <div
                  key={`${item.product.id}-${idx}`}
                  className="p-3.5 rounded-2xl border border-[var(--th-border)] bg-[var(--th-card)] flex items-start space-x-3.5 shadow-xs hover:border-[var(--th-accent)]/50 transition-all relative group"
                >
                  {/* Thumbnail */}
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[var(--th-surface-alt)] border border-[var(--th-border)] shrink-0">
                    <img
                      src={imgSrc}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-[var(--th-text-main)] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(idx)}
                          className="text-[var(--th-text-muted)] hover:text-rose-600 transition-colors p-1 cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                        <span className="font-bold text-[var(--th-accent)] uppercase">
                          {item.product.purity || '925 Fine Silver'}
                        </span>
                        {item.product.weightGrams && (
                          <>
                            <span className="text-[var(--th-text-muted)]">•</span>
                            <span className="text-[var(--th-text-muted)]">{item.product.weightGrams}g</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Price and Quantity Stepper */}
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-[var(--th-border)]/60">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="font-outfit font-bold text-sm sm:text-base text-[var(--th-primary)]">
                          ₹{(Number(item.product.price) * item.quantity).toLocaleString('en-IN')}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-[var(--th-text-muted)]">
                            (₹{Number(item.product.price).toLocaleString('en-IN')} each)
                          </span>
                        )}
                      </div>

                      {/* Stepper Controls */}
                      <div className="flex items-center space-x-1.5 bg-[var(--th-surface-alt)] border border-[var(--th-border)] rounded-lg p-0.5">
                        <button
                          onClick={() => onUpdateQty(idx, Math.max(1, item.quantity - 1))}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:bg-[var(--th-card)] transition-colors cursor-pointer"
                          title="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs text-[var(--th-text-main)] font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQty(idx, item.quantity + 1)}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:bg-[var(--th-card)] transition-colors cursor-pointer"
                          title="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 4. Footer & Checkout Section */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 bg-[var(--th-surface-alt)] border-t border-[var(--th-border)] space-y-4">
            
            {/* Promo Code Box */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold">Code '{appliedCoupon}' applied!</span>
                    <span className="text-emerald-700 font-semibold">(-₹{discountAmount.toLocaleString('en-IN')})</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <form onSubmit={(e) => { e.preventDefault(); handleApplyCoupon(); }} className="flex space-x-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-[var(--th-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Enter Promo Code (e.g. SACRED10)"
                        className="w-full bg-[var(--th-card)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-xs rounded-xl pl-9 pr-3 py-2 text-[var(--th-text-main)] uppercase tracking-wider outline-none placeholder:normal-case placeholder:text-[var(--th-text-muted)]/60"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                    >
                      Apply
                    </button>
                  </form>

                  {/* 1-Click Coupon Chips */}
                  <div className="flex items-center space-x-2 pt-0.5">
                    <span className="text-[10px] text-[var(--th-text-muted)] font-medium">Quick Apply:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('SACRED10')}
                      className="px-2 py-0.5 rounded-md bg-[var(--th-card)] hover:bg-[var(--th-primary)]/10 text-[var(--th-primary)] border border-[var(--th-border)] text-[10px] font-bold font-mono transition-colors cursor-pointer"
                    >
                      SACRED10 (10% OFF)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('SILVERVIP')}
                      className="px-2 py-0.5 rounded-md bg-[var(--th-card)] hover:bg-[var(--th-primary)]/10 text-[var(--th-primary)] border border-[var(--th-border)] text-[10px] font-bold font-mono transition-colors cursor-pointer"
                    >
                      SILVERVIP (₹500 OFF)
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[11px] text-rose-600 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{couponError}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-[var(--th-text-muted)] border-t border-[var(--th-border)]/60 pt-3">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[var(--th-text-main)]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-[11px]">
                <span>Total Pure Silver Weight</span>
                <span className="font-mono text-[var(--th-text-main)] font-semibold">{totalSilverWeight.toFixed(1)} Grams</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Savings</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Insured Express Shipping</span>
                <span className="font-semibold">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase tracking-wider text-[11px]">FREE</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-[var(--th-border)]/80 text-sm font-bold text-[var(--th-text-main)]">
                <span>Total Payable</span>
                <span className="font-outfit text-xl text-[var(--th-primary)] tracking-tight">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Trust Assurance Strip */}
            <div className="flex items-center justify-between text-[10px] text-[var(--th-text-muted)] bg-[var(--th-card)] p-2 rounded-xl border border-[var(--th-border)]">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--th-accent)]" />
                <span>BIS Hallmarked</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <RefreshCw className="w-3.5 h-3.5 text-[var(--th-accent)]" />
                <span>15 Days Return</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5 text-[var(--th-accent)]" />
                <span>Insured Transit</span>
              </span>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                onClose();
                onProceedCheckout(finalTotal, discountAmount, appliedCoupon);
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all flex items-center justify-between cursor-pointer group"
            >
              <span>Proceed to Delivery & Checkout</span>
              <div className="flex items-center space-x-2">
                <span className="font-outfit font-extrabold text-sm">₹{finalTotal.toLocaleString('en-IN')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
