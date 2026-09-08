import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, CreditCard, Smartphone, Building2, Truck, ArrowRight, Lock, Sparkles } from 'lucide-react';
import { postApiData } from '../../services/api';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  totalAmount,
  discountAmount,
  appliedCoupon,
  onClearCart,
  onNavigateHome
}) {
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation
  
  // Shipping Form State
  const [formData, setFormData] = useState({
    fullName: 'Rohan Sharma',
    phone: '+91 98765 43210',
    email: 'rohan.sharma@example.com',
    pincode: '110001',
    address: 'Flat 402, Royal Palms Apartments, Outer Ring Road',
    city: 'New Delhi',
    state: 'Delhi',
    gstin: ''
  });

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState('upi'); // upi, card, cod, netbanking
  const [orderId, setOrderId] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleCompleteOrder = async () => {
    const generatedID = 'VS-' + Math.floor(100000 + Math.random() * 900000);
    setOrderId(generatedID);
    setStep(3);

    // Send order record payload to backend Express API
    const orderPayload = {
      proc_name: 'orders',
      opr: 'INSERT',
      table_values: {
        order_id: generatedID,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        delivery_address: `${formData.address}, ${formData.city}, ${formData.pincode}`,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        payment_method: paymentMethod,
        items: cartItems.map(item => ({
          id: item.product.id,
          name: item.product.name,
          qty: item.quantity,
          price: item.product.price
        }))
      }
    };

    postApiData(orderPayload).catch(err => {
      console.warn('[Checkout] Order post warning:', err);
    });

    onClearCart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-silver-200 bg-silver-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
              SilverHouse Express Checkout
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-silver-500 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-[#1A1A1A] text-white px-6 py-3 border-b border-[#D4AF37]/30 flex items-center justify-between text-xs">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-[#D4AF37] font-bold' : 'text-silver-400'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
            <span>Shipping Address</span>
          </div>
          <div className="w-12 h-0.5 bg-silver-700" />
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-[#D4AF37] font-bold' : 'text-silver-400'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
            <span>Secure Payment</span>
          </div>
          <div className="w-12 h-0.5 bg-silver-700" />
          <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-[#D4AF37] font-bold' : 'text-silver-400'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
            <span>Order Placed</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: SHIPPING ADDRESS */}
          {step === 1 && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <h4 className="font-serif font-bold text-base text-[#1A1A1A]">
                Recipient Delivery Address
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-silver-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-silver-300 rounded-lg px-3 py-2 text-xs text-[#1A1A1A] focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-silver-700 block mb-1">Phone Number (For Shipping Updates) *</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-silver-300 rounded-lg px-3 py-2 text-xs text-[#1A1A1A] focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-silver-700 block mb-1">Email Address (For BIS Certificate & Invoice) *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-silver-300 rounded-lg px-3 py-2 text-xs text-[#1A1A1A] focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-silver-700 block mb-1">Full Delivery Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-silver-300 rounded-lg px-3 py-2 text-xs text-[#1A1A1A] focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-silver-700 block mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-silver-300 rounded-lg px-3 py-2 text-xs text-[#1A1A1A] focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-silver-700 block mb-1">6-Digit PIN Code *</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-silver-300 rounded-lg px-3 py-2 text-xs text-[#1A1A1A] focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-silver-200">
                <span className="text-xs text-silver-600">
                  Total Payable: <strong className="text-[#1A1A1A] font-outfit">₹{totalAmount.toLocaleString('en-IN')}</strong>
                </span>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black font-bold text-xs rounded-xl transition-all flex items-center space-x-2"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: SECURE PAYMENT METHOD */}
          {step === 2 && (
            <div className="space-y-6">
              <h4 className="font-serif font-bold text-base text-[#1A1A1A]">
                Select Payment Option
              </h4>

              <div className="space-y-3">
                {/* UPI */}
                <label 
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'upi' ? 'border-[#D4AF37] bg-silver-50 ring-2 ring-[#D4AF37]/20' : 'border-silver-200 hover:bg-silver-50/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-6 h-6 text-[#D4AF37]" />
                    <div>
                      <h5 className="font-bold text-xs text-[#1A1A1A]">UPI / QR Code (Google Pay, PhonePe, Paytm, BHIM)</h5>
                      <p className="text-[10px] text-silver-500">Instant 2% Extra Cashback on Instant UPI Payment</p>
                    </div>
                  </div>
                  <input type="radio" name="payment" checked={paymentMethod === 'upi'} onChange={() => {}} className="accent-[#D4AF37]" />
                </label>

                {/* Credit / Debit Card */}
                <label 
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'card' ? 'border-[#D4AF37] bg-silver-50 ring-2 ring-[#D4AF37]/20' : 'border-silver-200 hover:bg-silver-50/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-6 h-6 text-[#D4AF37]" />
                    <div>
                      <h5 className="font-bold text-xs text-[#1A1A1A]">Credit / Debit Card (Visa, Mastercard, RuPay)</h5>
                      <p className="text-[10px] text-silver-500">256-Bit Encrypted Secure SSL Gateways</p>
                    </div>
                  </div>
                  <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => {}} className="accent-[#D4AF37]" />
                </label>

                {/* NetBanking */}
                <label 
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'netbanking' ? 'border-[#D4AF37] bg-silver-50 ring-2 ring-[#D4AF37]/20' : 'border-silver-200 hover:bg-silver-50/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-6 h-6 text-[#D4AF37]" />
                    <div>
                      <h5 className="font-bold text-xs text-[#1A1A1A]">Net Banking</h5>
                      <p className="text-[10px] text-silver-500">HDFC, ICICI, SBI, Axis, Kotak & 50+ Banks</p>
                    </div>
                  </div>
                  <input type="radio" name="payment" checked={paymentMethod === 'netbanking'} onChange={() => {}} className="accent-[#D4AF37]" />
                </label>

                {/* COD */}
                <label 
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'cod' ? 'border-[#D4AF37] bg-silver-50 ring-2 ring-[#D4AF37]/20' : 'border-silver-200 hover:bg-silver-50/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Truck className="w-6 h-6 text-[#D4AF37]" />
                    <div>
                      <h5 className="font-bold text-xs text-[#1A1A1A]">Cash on Delivery (COD)</h5>
                      <p className="text-[10px] text-silver-500">Pay cash upon insured parcel verification</p>
                    </div>
                  </div>
                  <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => {}} className="accent-[#D4AF37]" />
                </label>
              </div>

              <div className="p-4 bg-silver-50 rounded-xl border border-silver-200 text-xs space-y-1">
                <div className="flex justify-between font-bold text-[#1A1A1A]">
                  <span>Total Amount to Pay:</span>
                  <span className="font-outfit">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[10px] text-silver-500">Includes 100% Transit Insurance & BIS Hallmark Certificate</p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-silver-600 hover:text-black font-semibold"
                >
                  ← Back to Address
                </button>

                <button
                  onClick={handleCompleteOrder}
                  className="px-8 py-3.5 bg-linear-to-r from-[#D4AF37] to-[#AA820A] text-black font-bold text-xs rounded-xl shadow-lg hover:shadow-[#D4AF37]/30 transition-all flex items-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Place Order • <span className="font-outfit">₹{totalAmount.toLocaleString('en-IN')}</span></span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ORDER CONFIRMATION SCREEN */}
          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest bg-[#D4AF37]/10 px-3 py-1 rounded-full inline-block">
                BLESSINGS & GRATITUDE
              </span>

              <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">
                Order Confirmed!
              </h2>

              <p className="text-xs text-silver-600 max-w-md mx-auto">
                Thank you for your order, <strong>{formData.fullName}</strong>. Your sacred silver artifacts are being packed under tamper-proof inspection with BIS hallmarking.
              </p>

              <div className="p-4 bg-silver-50 rounded-xl border border-silver-200 text-xs max-w-md mx-auto text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-silver-500">Order ID:</span>
                  <span className="font-mono font-bold text-[#1A1A1A]">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver-500">Delivery Address:</span>
                  <span className="font-semibold text-[#1A1A1A] text-right max-w-xs">{formData.address}, {formData.city} - {formData.pincode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver-500">Estimated Delivery:</span>
                  <span className="font-bold text-emerald-700">2-3 Business Days</span>
                </div>
              </div>

              <div className="pt-4 flex justify-center space-x-4">
                <button
                  onClick={() => {
                    onClose();
                    onNavigateHome();
                  }}
                  className="px-6 py-3 bg-[#1A1A1A] text-white text-xs font-bold rounded-xl hover:bg-[#D4AF37] hover:text-black transition-colors"
                >
                  Continue Sacred Shopping →
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
