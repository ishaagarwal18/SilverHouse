import React, { useState } from 'react';
import { PROMO_CODES } from '../../data/products';
import { X, Trash2, ShoppingBag, Truck, Gift, Sparkles, ArrowRight, Tag, ShieldCheck } from 'lucide-react';

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
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalSilverWeight = cartItems.reduce((acc, item) => acc + item.product.weightGrams * item.quantity, 0);

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

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponInput.trim().toUpperCase();

    if (!code) return;

    if (PROMO_CODES[code]) {
      const rule = PROMO_CODES[code];
      if (subtotal < rule.minAmount) {
        setCouponError(`Add items worth ₹${rule.minAmount - subtotal} more to apply code ${code}.`);
      } else {
        setAppliedCoupon(code);
        setCouponInput('');
      }
    } else {
      setCouponError('Invalid promo code. Try using SACRED10 or SILVERVIP.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-silver-200 flex items-center justify-between bg-silver-50">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
              Sacred Shopping Cart ({cartItems.length})
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-silver-500 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Meter Bar */}
        <div className="p-4 bg-linear-to-r from-[#1A1A1A] to-[#2B2B2B] text-white border-b border-silver-200">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center space-x-1.5 font-medium text-silver-200">
              <Truck className="w-4 h-4 text-[#D4AF37]" />
              <span>
                {remainingForFreeShipping <= 0 
                  ? "You unlocked FREE Shipping & Free Silver Cloth!" 
                  : `Add ₹${remainingForFreeShipping.toLocaleString('en-IN')} more for FREE Express Shipping`}
              </span>
            </span>
            <span className="font-bold text-[#D4AF37]">{progressPercentage}%</span>
          </div>

          {/* Meter Line */}
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-linear-to-r from-[#D4AF37] to-[#FFF3B3] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-silver-300 mx-auto mb-3" />
              <p className="font-serif text-lg font-bold text-[#1A1A1A]">Your Cart is Empty</p>
              <p className="text-xs text-silver-500 mt-1 max-w-xs mx-auto">
                Explore our 999 fine silver coins, Ganesha idols, baby nazariya, and custom Yatra lockets.
              </p>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div
                key={`${item.product.id}-${idx}`}
                className="p-3.5 rounded-xl border border-silver-200 bg-white flex items-start space-x-3 shadow-2xs relative group"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-lg border border-silver-200 shrink-0"
                />

                <div className="flex-1 text-xs">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-[#1A1A1A] line-clamp-1 pr-4">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="text-silver-400 hover:text-rose-600 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] text-silver-500 my-1">
                    <span className="bg-[#D4AF37]/10 text-[#AA820A] font-bold px-2 py-0.5 rounded">
                      {item.product.purityCode === '999' ? '999 Fine Pure' : '925 Silver'}
                    </span>
                    <span>• {item.product.weightGrams}g Silver</span>
                  </div>

                  {/* Customization Details preview if present */}
                  {item.customConfig && (item.customConfig.text || item.customConfig.imagePreview) && (
                    <div className="p-1.5 bg-silver-50 rounded border border-silver-200 text-[10px] text-silver-700 my-1">
                      {item.customConfig.text && <div>Engraving: <strong>"{item.customConfig.text}"</strong></div>}
                      {item.customConfig.imagePreview && <div className="text-emerald-700 font-semibold">• Custom Shrine Photo Attached</div>}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-silver-100">
                    {/* Stepper */}
                    <div className="flex items-center border border-silver-300 rounded bg-white">
                      <button
                        onClick={() => onUpdateQty(idx, Math.max(1, item.quantity - 1))}
                        className="px-2 py-0.5 text-silver-700 font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 font-bold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQty(idx, item.quantity + 1)}
                        className="px-2 py-0.5 text-silver-700 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-bold text-sm text-[var(--th-primary)] font-outfit tracking-tight">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Order Summary */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-silver-50 border-t border-silver-200 space-y-3">
            
            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex space-x-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Promo code (e.g. SACRED10)"
                className="flex-1 bg-white border border-silver-300 rounded-lg px-3 py-1.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:border-[#D4AF37] uppercase font-semibold"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#1A1A1A] text-white text-xs font-semibold rounded-lg hover:bg-[#D4AF37] hover:text-black transition-colors"
              >
                Apply
              </button>
            </form>

            {couponError && <p className="text-[10px] text-rose-600 font-semibold">{couponError}</p>}

            {appliedCoupon && (
              <div className="flex justify-between items-center bg-emerald-50 text-emerald-800 p-2 rounded text-xs border border-emerald-200">
                <span className="flex items-center space-x-1 font-bold">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Code {appliedCoupon} Applied</span>
                </span>
                <button onClick={() => setAppliedCoupon(null)} className="text-emerald-700 hover:underline text-[10px]">
                  Remove
                </button>
              </div>
            )}

            {/* Price breakdown */}
            <div className="text-xs space-y-1.5 text-silver-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.length} items):</span>
                <span className="font-semibold text-[#1A1A1A] font-outfit">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Net Silver Weight:</span>
                <span className="font-semibold text-[#D4AF37] font-outfit">{totalSilverWeight} Grams</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promo Discount:</span>
                  <span className="font-outfit">- ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Insured Express Shipping:</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#1A1A1A] pt-2 border-t border-silver-200">
                <span>Total Payable Amount:</span>
                <span className="text-[var(--th-primary)] text-base font-outfit font-bold">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                onClose();
                onProceedCheckout(finalTotal, discountAmount, appliedCoupon);
              }}
              className="w-full py-3.5 bg-linear-to-r from-[#D4AF37] to-[#AA820A] hover:from-[#E6CA65] hover:to-[#D4AF37] text-black font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout • <strong className="font-outfit">₹{finalTotal.toLocaleString('en-IN')}</strong></span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
