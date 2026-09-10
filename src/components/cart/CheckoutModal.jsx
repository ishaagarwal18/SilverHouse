import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle2, ShieldCheck, CreditCard, Smartphone, Building2, 
  Truck, ArrowRight, Lock, Sparkles, MapPin, Plus, Home, Tag
} from 'lucide-react';
import { postApiData, fetchUserAddresses, addUserAddress } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // Reset checkout step whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setOrderId('');
      setPaymentMethod('upi');
    }
  }, [isOpen]);

  // Shipping Form State (used when entering a new address or as guest)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    pincode: '',
    address: '',
    city: '',
    state: 'Delhi',
    addressType: 'Home'
  });

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState('upi'); // upi, card, cod, netbanking
  const [orderId, setOrderId] = useState('');

  // Load saved addresses when modal opens and user is logged in
  useEffect(() => {
    if (isOpen && isAuthenticated && user && user.userId) {
      setLoadingAddresses(true);
      fetchUserAddresses(user.userId)
        .then(list => {
          const addrs = Array.isArray(list) ? list : [];
          setSavedAddresses(addrs);
          if (addrs.length > 0) {
            setSelectedAddressId(addrs[0].address_id);
            setIsAddingNewAddress(false);
          } else {
            setIsAddingNewAddress(true);
          }
        })
        .catch(err => console.error('Error fetching addresses for checkout:', err))
        .finally(() => setLoadingAddresses(false));
    } else if (isOpen) {
      setIsAddingNewAddress(true);
    }
  }, [isOpen, isAuthenticated, user]);

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getEffectiveAddress = () => {
    if (isAuthenticated && !isAddingNewAddress && selectedAddressId) {
      const selected = savedAddresses.find(a => a.address_id === selectedAddressId);
      if (selected) {
        return {
          fullName: selected.recipient_name,
          phone: formData.phone || user?.phone || '+91 98765 43210',
          email: formData.email || user?.email || '',
          fullAddress: `${selected.Block}, ${selected.street}, ${selected.area}, ${selected.city}, ${selected.state} - ${selected.pincode}`,
          addressId: selected.address_id
        };
      }
    }
    return {
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      fullAddress: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
      addressId: null
    };
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();

    // If logged in and filling out new address, optionally persist to database
    if (isAuthenticated && user?.userId && isAddingNewAddress) {
      try {
        const newAddr = await addUserAddress({
          userId: user.userId,
          address_name: formData.addressType || 'Home',
          recipient_name: formData.fullName,
          Block: formData.address,
          street: formData.address,
          area: formData.city,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: 'India'
        });
        if (newAddr && newAddr.success && newAddr.address_id) {
          setSelectedAddressId(newAddr.address_id);
        }
      } catch (err) {
        console.warn('Could not auto-save new address to account:', err);
      }
    }

    setStep(2);
  };

  const handleClose = () => {
    setStep(1);
    setOrderId('');
    onClose();
  };

  const handleCompleteOrder = async () => {
    const generatedID = 'SH-' + Math.floor(100000 + Math.random() * 900000);
    setOrderId(generatedID);
    setStep(3);

    const effective = getEffectiveAddress();
    const finalAmount = totalAmount - discountAmount;

    const orderData = {
      order_id: Date.now(),
      order_number: generatedID,
      user_id: user?.userId || null,
      customer_name: effective.fullName,
      customer_email: effective.email,
      customer_phone: effective.phone,
      delivery_address: effective.fullAddress,
      total_amount: totalAmount,
      discount_amount: discountAmount,
      final_payable: finalAmount,
      payment_status: paymentMethod === 'cod' ? 'PENDING' : 'PAID',
      payment_method: paymentMethod,
      created_at: new Date().toISOString(),
      items: cartItems.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        subtotal: item.product.price * item.quantity,
        image: item.product.image || (item.product.images && item.product.images[0]) || ''
      }))
    };

    // 1. Cache immediately in localStorage for instant display on /orders
    try {
      const existing = JSON.parse(localStorage.getItem('silverhouse_orders') || '[]');
      localStorage.setItem('silverhouse_orders', JSON.stringify([orderData, ...existing]));
      window.dispatchEvent(new Event('orders_updated'));
    } catch (e) {
      console.warn('Could not save order locally:', e);
    }

    // 2. Send order record payload to backend Express API
    const orderPayload = {
      proc_name: 'orders',
      opr: 'INSERT',
      table_values: {
        order_number: generatedID,
        user_id: user?.userId || null,
        address_id: effective.addressId || null,
        customer_name: effective.fullName,
        customer_email: effective.email,
        customer_phone: effective.phone,
        delivery_address: effective.fullAddress,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_payable: finalAmount,
        payment_status: paymentMethod === 'cod' ? 'PENDING' : 'PAID',
        payment_method: paymentMethod,
        items: orderData.items
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
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-[var(--th-card)] border border-[var(--th-border)] rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col font-sans transition-colors duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-[var(--th-border)] bg-[var(--th-surface-alt)] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--th-card)] border border-[var(--th-border)] text-[var(--th-accent)] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[var(--th-text-main)]">
                SilverHouse Express Checkout
              </h3>
              <p className="text-[11px] text-[var(--th-text-muted)] font-sans">
                100% Insured Transit & Certified BIS Hallmarking
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-[var(--th-surface-alt)]/80 px-6 py-3 border-b border-[var(--th-border)] flex items-center justify-between text-xs">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-[var(--th-primary)] font-bold' : 'text-[var(--th-text-muted)]'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
            <span>Delivery Address</span>
          </div>
          <div className="w-12 h-0.5 bg-[var(--th-border)]" />
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-[var(--th-primary)] font-bold' : 'text-[var(--th-text-muted)]'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
            <span>Secure Payment</span>
          </div>
          <div className="w-12 h-0.5 bg-[var(--th-border)]" />
          <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-[var(--th-primary)] font-bold' : 'text-[var(--th-text-muted)]'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
            <span>Order Placed</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: SHIPPING / DELIVERY ADDRESS SELECTION */}
          {step === 1 && (
            <form onSubmit={handleProceedToPayment} className="space-y-6">
              
              {/* Logged-In User Address Selector */}
              {isAuthenticated && savedAddresses.length > 0 && !isAddingNewAddress ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-serif font-bold text-base text-[var(--th-text-main)] flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-[var(--th-accent)]" />
                      <span>Choose Delivery Address</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(true)}
                      className="text-xs font-bold text-[var(--th-primary)] hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Address</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {savedAddresses.map(addr => {
                      const isSelected = selectedAddressId === addr.address_id;
                      const tag = (addr.address_name || 'Home').toLowerCase();
                      const isHome = tag.includes('home');
                      const isWork = tag.includes('work') || tag.includes('office');

                      return (
                        <div
                          key={addr.address_id}
                          onClick={() => setSelectedAddressId(addr.address_id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'border-[var(--th-primary)] bg-[var(--th-primary)]/5 ring-2 ring-[var(--th-primary)]/20 shadow-xs'
                              : 'border-[var(--th-border)] bg-[var(--th-card)] hover:border-[var(--th-accent)]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--th-surface-alt)] border border-[var(--th-border)] text-[var(--th-primary)]">
                              {isHome ? <Home className="w-3 h-3 text-[var(--th-accent)]" /> : isWork ? <Building2 className="w-3 h-3 text-[var(--th-accent)]" /> : <Tag className="w-3 h-3 text-[var(--th-accent)]" />}
                              <span>{addr.address_name || 'Delivery'}</span>
                            </span>
                            <input
                              type="radio"
                              name="selectedAddress"
                              checked={isSelected}
                              onChange={() => setSelectedAddressId(addr.address_id)}
                              className="accent-[var(--th-primary)]"
                            />
                          </div>

                          <h5 className="font-bold text-xs text-[var(--th-text-main)] mb-1">
                            {addr.recipient_name}
                          </h5>
                          <p className="text-xs text-[var(--th-text-muted)] line-clamp-2 leading-relaxed">
                            {addr.Block}, {addr.street}, {addr.area}, {addr.city} - {addr.pincode}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Enter New Address Form */
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-serif font-bold text-base text-[var(--th-text-main)]">
                      {isAuthenticated ? 'Add New Delivery Address' : 'Enter Shipping Details'}
                    </h4>
                    {isAuthenticated && savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(false)}
                        className="text-xs font-bold text-[var(--th-primary)] hover:underline cursor-pointer"
                      >
                        ← Choose from saved addresses ({savedAddresses.length})
                      </button>
                    )}
                  </div>

                  {!isAuthenticated && (
                    <div className="mb-4 p-3 rounded-2xl bg-[var(--th-surface-alt)] border border-[var(--th-border)] flex items-center justify-between text-xs">
                      <span className="text-[var(--th-text-muted)]">
                        Have a SilverHouse account? Sign in to use saved addresses.
                      </span>
                      <a
                        href="/login?redirect=/catalog"
                        className="font-bold text-[var(--th-primary)] hover:underline"
                      >
                        Sign In →
                      </a>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-[var(--th-text-main)] block mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. Yash Agarwal"
                        className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--th-text-main)] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[var(--th-text-main)] block mb-1">Phone Number (For Tracking Updates) *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                        className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--th-text-main)] outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-[var(--th-text-main)] block mb-1">Email Address (For BIS Hallmark Certificate) *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="name@example.com"
                        className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--th-text-main)] outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-[var(--th-text-main)] block mb-1">Flat, House No., Building & Street *</label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="e.g. Flat 402, Lotus Residency, MG Road"
                        className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--th-text-main)] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[var(--th-text-main)] block mb-1">City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. New Delhi"
                        className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--th-text-main)] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[var(--th-text-main)] block mb-1">6-Digit PIN Code *</label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        maxLength={6}
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="110001"
                        className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--th-text-main)] outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Total & Continue Button */}
              <div className="pt-4 flex items-center justify-between border-t border-[var(--th-border)]">
                <span className="text-xs text-[var(--th-text-muted)]">
                  Total Payable: <strong className="text-[var(--th-primary)] font-outfit text-base">₹{totalAmount.toLocaleString('en-IN')}</strong>
                </span>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center space-x-2 shadow-md cursor-pointer"
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
              <h4 className="font-serif font-bold text-base text-[var(--th-text-main)]">
                Select Payment Option
              </h4>

              <div className="space-y-3">
                {/* UPI */}
                <label 
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'upi' ? 'border-[var(--th-primary)] bg-[var(--th-primary)]/5 ring-2 ring-[var(--th-primary)]/20' : 'border-[var(--th-border)] hover:bg-[var(--th-surface-alt)]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-6 h-6 text-[var(--th-accent)]" />
                    <div>
                      <h5 className="font-bold text-xs text-[var(--th-text-main)]">UPI / QR Code (Google Pay, PhonePe, Paytm, BHIM)</h5>
                      <p className="text-[10px] text-[var(--th-text-muted)]">Instant 2% Extra Cashback on Instant UPI Payment</p>
                    </div>
                  </div>
                  <input type="radio" name="payment" checked={paymentMethod === 'upi'} onChange={() => {}} className="accent-[var(--th-primary)]" />
                </label>

                {/* Credit / Debit Card */}
                <label 
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'card' ? 'border-[var(--th-primary)] bg-[var(--th-primary)]/5 ring-2 ring-[var(--th-primary)]/20' : 'border-[var(--th-border)] hover:bg-[var(--th-surface-alt)]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-6 h-6 text-[var(--th-accent)]" />
                    <div>
                      <h5 className="font-bold text-xs text-[var(--th-text-main)]">Credit / Debit Card (Visa, Mastercard, RuPay)</h5>
                      <p className="text-[10px] text-[var(--th-text-muted)]">256-Bit Encrypted Secure SSL Gateways</p>
                    </div>
                  </div>
                  <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => {}} className="accent-[var(--th-primary)]" />
                </label>

                {/* NetBanking */}
                <label 
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'netbanking' ? 'border-[var(--th-primary)] bg-[var(--th-primary)]/5 ring-2 ring-[var(--th-primary)]/20' : 'border-[var(--th-border)] hover:bg-[var(--th-surface-alt)]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-6 h-6 text-[var(--th-accent)]" />
                    <div>
                      <h5 className="font-bold text-xs text-[var(--th-text-main)]">Net Banking</h5>
                      <p className="text-[10px] text-[var(--th-text-muted)]">HDFC, ICICI, SBI, Axis, Kotak & 50+ Banks</p>
                    </div>
                  </div>
                  <input type="radio" name="payment" checked={paymentMethod === 'netbanking'} onChange={() => {}} className="accent-[var(--th-primary)]" />
                </label>

                {/* COD */}
                <label 
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'cod' ? 'border-[var(--th-primary)] bg-[var(--th-primary)]/5 ring-2 ring-[var(--th-primary)]/20' : 'border-[var(--th-border)] hover:bg-[var(--th-surface-alt)]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Truck className="w-6 h-6 text-[var(--th-accent)]" />
                    <div>
                      <h5 className="font-bold text-xs text-[var(--th-text-main)]">Cash on Delivery (COD)</h5>
                      <p className="text-[10px] text-[var(--th-text-muted)]">Pay cash upon insured parcel verification</p>
                    </div>
                  </div>
                  <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => {}} className="accent-[var(--th-primary)]" />
                </label>
              </div>

              <div className="p-4 bg-[var(--th-surface-alt)] rounded-2xl border border-[var(--th-border)] text-xs space-y-1">
                <div className="flex justify-between font-bold text-[var(--th-text-main)]">
                  <span>Total Amount to Pay:</span>
                  <span className="font-outfit text-base text-[var(--th-primary)]">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[10px] text-[var(--th-text-muted)]">Includes 100% Transit Insurance & BIS Hallmark Certificate</p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] font-semibold cursor-pointer"
                >
                  ← Back to Address
                </button>

                <button
                  onClick={handleCompleteOrder}
                  className="px-8 py-3.5 bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
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

              <span className="text-xs font-bold text-[var(--th-accent)] uppercase tracking-widest bg-[var(--th-surface-alt)] px-3 py-1 rounded-full inline-block border border-[var(--th-border)]">
                BLESSINGS & GRATITUDE
              </span>

              <h2 className="font-serif text-3xl font-bold text-[var(--th-text-main)]">
                Order Confirmed!
              </h2>

              <p className="text-xs text-[var(--th-text-muted)] max-w-md mx-auto">
                Thank you for your order. Your sacred silver artifacts are being packed under tamper-proof inspection with BIS hallmarking.
              </p>

              <div className="p-4 bg-[var(--th-surface-alt)] rounded-2xl border border-[var(--th-border)] text-xs max-w-md mx-auto text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-[var(--th-text-muted)]">Order ID:</span>
                  <span className="font-mono font-bold text-[var(--th-text-main)]">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--th-text-muted)]">Delivery Location:</span>
                  <span className="font-semibold text-[var(--th-text-main)] text-right max-w-xs">{getEffectiveAddress().fullAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--th-text-muted)]">Estimated Delivery:</span>
                  <span className="font-bold text-emerald-700">2-3 Business Days</span>
                </div>
              </div>

              <div className="pt-4 flex justify-center space-x-4">
                <button
                  onClick={() => {
                    handleClose();
                    onNavigateHome();
                  }}
                  className="px-6 py-3 bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-md"
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
