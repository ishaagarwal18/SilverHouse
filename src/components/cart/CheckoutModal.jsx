import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle2, ShieldCheck, CreditCard, Smartphone, Building2, 
  Truck, ArrowRight, Lock, Sparkles, MapPin, Plus, Home, Tag,
  Copy, Check, Phone, Mail, User, Scale, Award, Calendar, ChevronRight
} from 'lucide-react';
import { postApiData, fetchUserAddresses, addUserAddress, getGuestToken } from '../../services/api';
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
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Card Simulator state for Step 2
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  // UPI Handle state
  const [upiId, setUpiId] = useState('');

  // Net banking selected bank
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Reset checkout step whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setOrderId('');
      setPaymentMethod('upi');
      setIsAddingNewAddress(false);
      setCopiedOrderId(false);
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
          } else {
            setIsAddingNewAddress(true);
          }
        })
        .catch(err => console.error('Error fetching addresses for checkout:', err))
        .finally(() => setLoadingAddresses(false));
    } else {
      setIsAddingNewAddress(true);
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
      setCardDetails(prev => ({
        ...prev,
        name: prev.name || user.fullName || ''
      }));
    }
  }, [isOpen, isAuthenticated, user]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e) => {
    let { name, value } = e.target;
    if (name === 'number') {
      value = value.replace(/\D/g, '').slice(0, 16);
      value = value.replace(/(\d{4})/g, '$1 ').trim();
    } else if (name === 'expiry') {
      value = value.replace(/\D/g, '').slice(0, 4);
      if (value.length >= 3) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }
    } else if (name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const getEffectiveAddress = () => {
    if (isAuthenticated && selectedAddressId && !isAddingNewAddress) {
      const matched = savedAddresses.find(a => a.address_id === selectedAddressId);
      if (matched) {
        const fullAddr = `${matched.Block ? matched.Block + ', ' : ''}${matched.street ? matched.street + ', ' : ''}${matched.area ? matched.area + ', ' : ''}${matched.city}, ${matched.state} - ${matched.pincode}`;
        return {
          fullName: matched.recipient_name || user?.fullName || 'Valued Customer',
          phone: user?.phone || formData.phone || '',
          email: user?.email || formData.email || '',
          fullAddress: fullAddr,
          addressId: matched.address_id,
          addressType: matched.address_name || 'Home'
        };
      }
    }
    return {
      fullName: formData.fullName || user?.fullName || 'Valued Customer',
      phone: formData.phone,
      email: formData.email,
      fullAddress: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
      addressId: null,
      addressType: formData.addressType
    };
  };

  const handleProceedToPayment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // If entering a new address, validate fields
    if (isAddingNewAddress || !selectedAddressId) {
      if (!formData.fullName.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.address.trim() || !formData.city.trim() || !formData.pincode.trim()) {
        alert('Please fill out all delivery address fields completely.');
        return;
      }
      if (!/^\d{6}$/.test(formData.pincode.trim())) {
        alert('Please enter a valid 6-digit PIN code.');
        return;
      }

      // If logged in, automatically save address to user's database records for fast future checkout
      if (isAuthenticated && user?.userId) {
        try {
          const newAddr = await addUserAddress({
            userId: user.userId,
            address_name: formData.addressType || 'Home',
            recipient_name: formData.fullName.trim(),
            Block: '',
            street: formData.address.trim(),
            area: formData.city.trim(),
            city: formData.city.trim(),
            state: formData.state,
            pincode: formData.pincode.trim(),
            country: 'India'
          });
          if (newAddr && newAddr.success && newAddr.address_id) {
            setSelectedAddressId(newAddr.address_id);
          }
        } catch (err) {
          console.warn('Could not auto-save new address to account:', err);
        }
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
    if (isPlacingOrder) return;
    const generatedID = 'SH-' + Math.floor(100000 + Math.random() * 900000);

    const effective = getEffectiveAddress();
    const finalAmount = totalAmount - discountAmount;

    const formattedItems = cartItems.map(item => {
      const dbProdId = item.product.product_id || (typeof item.product.id === 'number' ? item.product.id : (!isNaN(Number(item.product.id)) ? Number(item.product.id) : null));
      const pName = item.product.title || item.product.name || item.product.product_name || 'Sacred Item';
      return {
        product_id: dbProdId,
        id: dbProdId,
        product_name: pName,
        title: pName,
        quantity: item.quantity,
        qty: item.quantity,
        unit_price: item.product.price,
        price: item.product.price,
        discount_percent: item.product.discount || 0,
        subtotal: item.product.price * item.quantity,
        image: item.product.image || (item.product.images && item.product.images[0]) || ''
      };
    });

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
      items: formattedItems
    };

    // Prepare payload for backend Express API (/api/data with proc_name: 'orders', opr: 'INSERT')
    const orderPayload = {
      proc_name: 'orders',
      opr: 'INSERT',
      table_values: {
        order_number: generatedID,
        user_id: user?.userId || null,
        guest_token: getGuestToken(),
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
        items: formattedItems
      }
    };

    setIsPlacingOrder(true);
    try {
      const res = await postApiData(orderPayload);
      if (res && res.success) {
        // Cache order in localStorage for orders history
        try {
          const existing = JSON.parse(localStorage.getItem('silverhouse_orders') || '[]');
          localStorage.setItem('silverhouse_orders', JSON.stringify([orderData, ...existing]));
          window.dispatchEvent(new Event('orders_updated'));
        } catch (e) {
          console.warn('Could not save order locally:', e);
        }

        // Notify app to re-fetch products so updated quantity and sold counts are reflected live immediately
        window.dispatchEvent(new Event('products_updated'));

        const finalOrderNum = res.data?.[0]?.order_number || generatedID;
        setOrderId(finalOrderNum);
        setStep(3);
        onClearCart();
      } else {
        console.error('[Checkout] Order placement failed:', res);
        alert(res?.error || res?.status || 'Could not complete order. Please try again.');
      }
    } catch (err) {
      console.error('[Checkout] Order post error:', err);
      alert('Could not place order due to a network error. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2500);
  };

  const totalItemsCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-sans">
      {/* High-end Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[var(--th-card)] border border-[var(--th-border)] rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col transition-colors">
        
        {/* Luxury Header & Trust Bar */}
        <div className="p-4 sm:p-5 border-b border-[var(--th-border)] bg-gradient-to-r from-[var(--th-surface-alt)] via-[var(--th-card)] to-[var(--th-surface-alt)] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] text-[var(--th-accent)] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[var(--th-accent)]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--th-text-main)]">
                  SilverHouse Checkout
                </h3>
                <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Lock className="w-2.5 h-2.5" />
                  <span>256-Bit SSL</span>
                </span>
              </div>
              <p className="text-[11px] text-[var(--th-text-muted)] font-sans">
                Insured Transit • Certified BIS Hallmarked Silver
              </p>
            </div>
          </div>

          <button 
            onClick={handleClose} 
            className="w-9 h-9 flex items-center justify-center text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] rounded-full hover:bg-[var(--th-surface-alt)] border border-transparent hover:border-[var(--th-border)] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Step Milestone Progress Tracker */}
        <div className="bg-[var(--th-surface-alt)]/80 px-6 py-3.5 border-b border-[var(--th-border)] flex items-center justify-between text-xs">
          {/* Step 1 */}
          <div className={`flex items-center space-x-2.5 ${step >= 1 ? 'text-[var(--th-primary)] font-bold' : 'text-[var(--th-text-muted)]'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
              step > 1 ? 'bg-emerald-500 text-white shadow-xs' : step === 1 ? 'bg-[var(--th-primary)] text-white ring-4 ring-[var(--th-primary)]/15 shadow-xs' : 'border border-[var(--th-border)] bg-[var(--th-card)] text-[var(--th-text-muted)]'
            }`}>
              {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </span>
            <span className="hidden sm:inline">Delivery Address</span>
            <span className="sm:hidden">Address</span>
          </div>

          <div className={`flex-1 h-0.5 mx-3 transition-colors ${step >= 2 ? 'bg-[var(--th-primary)]' : 'bg-[var(--th-border)]'}`} />

          {/* Step 2 */}
          <div className={`flex items-center space-x-2.5 ${step >= 2 ? 'text-[var(--th-primary)] font-bold' : 'text-[var(--th-text-muted)]'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
              step > 2 ? 'bg-emerald-500 text-white shadow-xs' : step === 2 ? 'bg-[var(--th-primary)] text-white ring-4 ring-[var(--th-primary)]/15 shadow-xs' : 'border border-[var(--th-border)] bg-[var(--th-card)] text-[var(--th-text-muted)]'
            }`}>
              {step > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
            </span>
            <span className="hidden sm:inline">Secure Payment</span>
            <span className="sm:hidden">Payment</span>
          </div>

          <div className={`flex-1 h-0.5 mx-3 transition-colors ${step >= 3 ? 'bg-emerald-500' : 'bg-[var(--th-border)]'}`} />

          {/* Step 3 */}
          <div className={`flex items-center space-x-2.5 ${step === 3 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-[var(--th-text-muted)]'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
              step === 3 ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20 shadow-xs' : 'border border-[var(--th-border)] bg-[var(--th-card)] text-[var(--th-text-muted)]'
            }`}>
              3
            </span>
            <span>Confirmed</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* ========================================================= */}
          {/* STEP 1: SHIPPING & DELIVERY ADDRESS */}
          {/* ========================================================= */}
          {step === 1 && (
            <form onSubmit={handleProceedToPayment} className="space-y-6">
              
              {/* Saved Addresses for Authenticated Users */}
              {isAuthenticated && savedAddresses.length > 0 && !isAddingNewAddress ? (
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <h4 className="font-serif font-bold text-base text-[var(--th-text-main)] flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-[var(--th-accent)]" />
                      <span>Select Delivery Destination</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(true)}
                      className="text-xs font-bold text-[var(--th-primary)] hover:underline flex items-center space-x-1 cursor-pointer bg-[var(--th-primary)]/10 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Address</span>
                    </button>
                  </div>

                  {/* Address Cards Grid */}
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
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                            isSelected
                              ? 'border-[var(--th-primary)] bg-gradient-to-b from-[var(--th-primary)]/5 to-[var(--th-card)] ring-4 ring-[var(--th-primary)]/15 shadow-md'
                              : 'border-[var(--th-border)] bg-[var(--th-card)] hover:border-[var(--th-accent)] shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--th-surface-alt)] border border-[var(--th-border)] text-[var(--th-primary)] uppercase tracking-wider">
                              {isHome ? <Home className="w-3 h-3 text-[var(--th-accent)]" /> : isWork ? <Building2 className="w-3 h-3 text-[var(--th-accent)]" /> : <Tag className="w-3 h-3 text-[var(--th-accent)]" />}
                              <span>{addr.address_name || 'Delivery'}</span>
                            </span>

                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected ? 'border-[var(--th-primary)] bg-[var(--th-primary)] text-white' : 'border-[var(--th-border)]'
                            }`}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </div>

                          <h5 className="font-bold text-sm text-[var(--th-text-main)] mb-1">
                            {addr.recipient_name || user?.fullName || 'Valued Patron'}
                          </h5>

                          <p className="text-xs text-[var(--th-text-muted)] leading-relaxed line-clamp-2">
                            {addr.Block ? addr.Block + ', ' : ''}{addr.street ? addr.street + ', ' : ''}{addr.area ? addr.area + ', ' : ''}{addr.city}, {addr.state} - {addr.pincode}
                          </p>

                          <div className="mt-2.5 pt-2 border-t border-[var(--th-border)]/60 flex items-center justify-between text-[11px] text-[var(--th-text-muted)]">
                            <span className="flex items-center space-x-1">
                              <Truck className="w-3 h-3 text-emerald-600" />
                              <span className="font-medium text-emerald-700 dark:text-emerald-400">Standard Delivery (2-3 Days)</span>
                            </span>
                            <span className="font-bold text-[var(--th-primary)] font-mono text-[10px]">
                              PIN {addr.pincode}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* New Address Entry Form */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-base text-[var(--th-text-main)] flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-[var(--th-accent)]" />
                        <span>Enter Delivery Address</span>
                      </h4>
                      <p className="text-[11px] text-[var(--th-text-muted)]">
                        Insured courier transit will be dispatched to this location
                      </p>
                    </div>

                    {isAuthenticated && savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(false)}
                        className="text-xs font-bold text-[var(--th-primary)] hover:underline cursor-pointer"
                      >
                        ← Choose Saved Address
                      </button>
                    )}
                  </div>

                  {/* Address Type Selector Pills */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-[var(--th-text-muted)] font-medium mr-1">Deliver to:</span>
                    {['Home', 'Work', 'Other'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, addressType: type }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition-all cursor-pointer ${
                          formData.addressType === type
                            ? 'bg-[var(--th-primary)] text-white border-[var(--th-primary)] shadow-2xs'
                            : 'bg-[var(--th-card)] text-[var(--th-text-muted)] border-[var(--th-border)] hover:border-[var(--th-accent)]'
                        }`}
                      >
                        {type === 'Home' && <Home className="w-3 h-3" />}
                        {type === 'Work' && <Building2 className="w-3 h-3" />}
                        {type === 'Other' && <Tag className="w-3 h-3" />}
                        <span>{type}</span>
                      </button>
                    ))}
                  </div>

                  {/* Form Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <label className="font-bold text-[var(--th-text-main)] block mb-1.5">Full Name *</label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-[var(--th-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="e.g. Isha Agarwal"
                          className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[var(--th-text-main)] outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-[var(--th-text-main)] block mb-1.5">Phone Number *</label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-[var(--th-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+91 98765 43210"
                          className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[var(--th-text-main)] outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-[var(--th-text-main)] block mb-1.5">Email Address (For Invoicing & Certificate) *</label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-[var(--th-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="isha@example.com"
                          className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[var(--th-text-main)] outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-[var(--th-text-main)] block mb-1.5">House / Flat No., Building & Street Address *</label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="e.g. Flat 402, Lotus Residency, MG Road"
                        className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--th-text-main)] outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[var(--th-text-main)] block mb-1.5">City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. New Delhi"
                        className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--th-text-main)] outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[var(--th-text-main)] block mb-1.5">6-Digit PIN Code *</label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        maxLength={6}
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="110001"
                        className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--th-text-main)] outline-none font-mono transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Quick Summary Strip & Continue Button */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--th-border)]">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[var(--th-text-muted)]">Payable Total:</span>
                  <span className="font-outfit text-xl font-extrabold text-[var(--th-primary)]">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                    Insured Shipping Included
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[var(--th-primary)] to-[var(--th-primary-hover)] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg cursor-pointer group"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 2: SECURE PAYMENT METHOD */}
          {/* ========================================================= */}
          {step === 2 && (
            <div className="space-y-6">
              
              {/* Order Miniature Summary Ribbon */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[var(--th-surface-alt)] via-[var(--th-card)] to-[var(--th-surface-alt)] border border-[var(--th-border)] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Thumbnails preview */}
                  <div className="flex -space-x-2 overflow-hidden py-0.5">
                    {cartItems.slice(0, 3).map((it, i) => (
                      <div key={i} className="w-9 h-9 rounded-xl border-2 border-[var(--th-card)] overflow-hidden bg-white shadow-2xs">
                        <img 
                          src={(it.product.images && it.product.images[0]) || '/images/hero_silver_coins.png'} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ))}
                    {cartItems.length > 3 && (
                      <div className="w-9 h-9 rounded-xl border-2 border-[var(--th-card)] bg-[var(--th-primary)] text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
                        +{cartItems.length - 3}
                      </div>
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[var(--th-text-main)]">
                      {totalItemsCount} {totalItemsCount === 1 ? 'Artifact' : 'Artifacts'} in Order
                    </h5>
                    <p className="text-[11px] text-[var(--th-text-muted)]">
                      Delivering to: <strong className="text-[var(--th-text-main)]">{getEffectiveAddress().fullName}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[var(--th-text-muted)] block uppercase tracking-wider font-semibold">Total</span>
                  <span className="font-outfit font-extrabold text-base text-[var(--th-primary)]">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Methods Options List */}
              <div className="space-y-3.5">
                
                {/* 1. UPI & QR Option */}
                <div 
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'border-[var(--th-primary)] bg-[var(--th-primary)]/5 ring-4 ring-[var(--th-primary)]/15 shadow-sm'
                      : 'border-[var(--th-border)] bg-[var(--th-card)] hover:border-[var(--th-accent)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 flex items-center justify-center shrink-0">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="font-bold text-xs sm:text-sm text-[var(--th-text-main)]">
                            Instant UPI / QR Code
                          </h5>
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200 border border-amber-300">
                            Recommended
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--th-text-muted)] mt-0.5">
                          Google Pay, PhonePe, Paytm, BHIM & Any UPI App
                        </p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'upi' ? 'border-[var(--th-primary)] bg-[var(--th-primary)] text-white' : 'border-[var(--th-border)]'
                    }`}>
                      {paymentMethod === 'upi' && <Check className="w-3 h-3" />}
                    </div>
                  </div>

                  {/* Expanded UPI Interactive Drawer */}
                  {paymentMethod === 'upi' && (
                    <div className="mt-3.5 pt-3.5 border-t border-[var(--th-border)]/70 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--th-text-muted)]">Enter VPA / UPI ID:</span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Zero Processing Surcharge</span>
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. yourname@okhdfcbank"
                          className="flex-1 bg-[var(--th-card)] border border-[var(--th-border)] focus:border-[var(--th-primary)] rounded-xl px-3.5 py-2 text-xs text-[var(--th-text-main)] outline-none"
                        />
                        <button
                          type="button"
                          className="px-4 py-2 bg-[var(--th-surface-alt)] hover:bg-[var(--th-primary)]/10 text-[var(--th-primary)] border border-[var(--th-border)] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Verify
                        </button>
                      </div>

                      {/* Quick UPI Handles */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-[var(--th-text-muted)]">Quick handle:</span>
                        {['@okhdfcbank', '@okaxis', '@ybl', '@paytm'].map(handle => (
                          <button
                            key={handle}
                            type="button"
                            onClick={() => setUpiId(prev => prev.split('@')[0] + handle)}
                            className="px-2 py-0.5 rounded-md bg-[var(--th-surface-alt)] text-[10px] font-mono text-[var(--th-text-muted)] hover:text-[var(--th-primary)] border border-[var(--th-border)] cursor-pointer"
                          >
                            {handle}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Credit / Debit Card Option */}
                <div 
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-[var(--th-primary)] bg-[var(--th-primary)]/5 ring-4 ring-[var(--th-primary)]/15 shadow-sm'
                      : 'border-[var(--th-border)] bg-[var(--th-card)] hover:border-[var(--th-accent)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs sm:text-sm text-[var(--th-text-main)]">
                          Credit / Debit Card
                        </h5>
                        <p className="text-[11px] text-[var(--th-text-muted)] mt-0.5">
                          Visa, MasterCard, RuPay, American Express
                        </p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'card' ? 'border-[var(--th-primary)] bg-[var(--th-primary)] text-white' : 'border-[var(--th-border)]'
                    }`}>
                      {paymentMethod === 'card' && <Check className="w-3 h-3" />}
                    </div>
                  </div>

                  {/* Virtual Card Preview & Form */}
                  {paymentMethod === 'card' && (
                    <div className="mt-4 pt-4 border-t border-[var(--th-border)]/70 space-y-4">
                      
                      {/* Realistic Silver Platinum Card Mockup */}
                      <div className="w-full max-w-sm mx-auto p-4 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-700 text-white shadow-xl relative overflow-hidden font-mono border border-slate-700">
                        <div className="absolute right-3 top-3 opacity-20">
                          <Award className="w-16 h-16" />
                        </div>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="text-[9px] tracking-widest uppercase font-serif text-slate-400 block">SILVERHOUSE PATRON</span>
                            <span className="text-[10px] text-amber-400 font-sans font-bold">PLATINUM PRIVILEGE</span>
                          </div>
                          <div className="w-8 h-6 rounded bg-amber-300/30 border border-amber-300/50 flex items-center justify-center">
                            <span className="text-[8px] text-amber-200 font-bold">CHIP</span>
                          </div>
                        </div>

                        <div className="text-base sm:text-lg tracking-widest font-black mb-4">
                          {cardDetails.number || '•••• •••• •••• ••••'}
                        </div>

                        <div className="flex justify-between items-end text-[10px]">
                          <div>
                            <span className="text-[8px] text-slate-400 uppercase block">Cardholder</span>
                            <span className="font-bold tracking-wider uppercase font-sans">
                              {cardDetails.name || 'YOUR NAME'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] text-slate-400 uppercase block">Expires</span>
                            <span className="font-bold tracking-wider">
                              {cardDetails.expiry || 'MM/YY'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Inputs */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="col-span-2">
                          <label className="font-bold text-[var(--th-text-main)] block mb-1">Card Number</label>
                          <input
                            type="text"
                            name="number"
                            maxLength={19}
                            value={cardDetails.number}
                            onChange={handleCardChange}
                            placeholder="4532 0123 4567 8901"
                            className="w-full bg-[var(--th-card)] border border-[var(--th-border)] focus:border-[var(--th-primary)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--th-text-main)] font-mono outline-none"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="font-bold text-[var(--th-text-main)] block mb-1">Name on Card</label>
                          <input
                            type="text"
                            name="name"
                            value={cardDetails.name}
                            onChange={handleCardChange}
                            placeholder="e.g. Isha Agarwal"
                            className="w-full bg-[var(--th-card)] border border-[var(--th-border)] focus:border-[var(--th-primary)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--th-text-main)] outline-none uppercase"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-[var(--th-text-main)] block mb-1">Valid Thru</label>
                          <input
                            type="text"
                            name="expiry"
                            maxLength={5}
                            value={cardDetails.expiry}
                            onChange={handleCardChange}
                            placeholder="MM/YY"
                            className="w-full bg-[var(--th-card)] border border-[var(--th-border)] focus:border-[var(--th-primary)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--th-text-main)] font-mono outline-none"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-[var(--th-text-main)] block mb-1">CVV / CVC</label>
                          <input
                            type="password"
                            name="cvv"
                            maxLength={4}
                            value={cardDetails.cvv}
                            onChange={handleCardChange}
                            placeholder="•••"
                            className="w-full bg-[var(--th-card)] border border-[var(--th-border)] focus:border-[var(--th-primary)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--th-text-main)] font-mono outline-none"
                          />
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* 3. Net Banking */}
                <div 
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'netbanking'
                      ? 'border-[var(--th-primary)] bg-[var(--th-primary)]/5 ring-4 ring-[var(--th-primary)]/15 shadow-sm'
                      : 'border-[var(--th-border)] bg-[var(--th-card)] hover:border-[var(--th-accent)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-600 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs sm:text-sm text-[var(--th-text-main)]">
                          Net Banking
                        </h5>
                        <p className="text-[11px] text-[var(--th-text-muted)] mt-0.5">
                          All Major Indian Banks & Direct Gateway
                        </p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'netbanking' ? 'border-[var(--th-primary)] bg-[var(--th-primary)] text-white' : 'border-[var(--th-border)]'
                    }`}>
                      {paymentMethod === 'netbanking' && <Check className="w-3 h-3" />}
                    </div>
                  </div>

                  {paymentMethod === 'netbanking' && (
                    <div className="mt-3.5 pt-3.5 border-t border-[var(--th-border)]/70 space-y-3">
                      <div className="grid grid-cols-4 gap-2">
                        {['HDFC', 'ICICI', 'SBI', 'Axis'].map(bank => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              selectedBank === bank
                                ? 'border-[var(--th-primary)] bg-[var(--th-primary)] text-white shadow-xs'
                                : 'border-[var(--th-border)] bg-[var(--th-card)] text-[var(--th-text-main)] hover:border-[var(--th-accent)]'
                            }`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Cash on Delivery (COD) */}
                <div 
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-[var(--th-primary)] bg-[var(--th-primary)]/5 ring-4 ring-[var(--th-primary)]/15 shadow-sm'
                      : 'border-[var(--th-border)] bg-[var(--th-card)] hover:border-[var(--th-accent)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs sm:text-sm text-[var(--th-text-main)]">
                          Cash on Delivery (COD)
                        </h5>
                        <p className="text-[11px] text-[var(--th-text-muted)] mt-0.5">
                          Pay cash or UPI to delivery executive at your doorstep
                        </p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'cod' ? 'border-[var(--th-primary)] bg-[var(--th-primary)] text-white' : 'border-[var(--th-border)]'
                    }`}>
                      {paymentMethod === 'cod' && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Actions Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--th-border)]">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] font-semibold cursor-pointer px-2 py-1"
                >
                  ← Back to Address
                </button>

                <button
                  onClick={handleCompleteOrder}
                  disabled={isPlacingOrder}
                  className={`px-8 py-3.5 bg-gradient-to-r from-[var(--th-primary)] to-[var(--th-primary-hover)] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center space-x-2.5 cursor-pointer group ${
                    isPlacingOrder ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isPlacingOrder ? 'Securing & Placing Order...' : (
                      <>Place Order • <strong className="font-outfit text-sm">₹{totalAmount.toLocaleString('en-IN')}</strong></>
                    )}
                  </span>
                </button>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: ORDER CONFIRMATION & BLESSINGS SCREEN */}
          {/* ========================================================= */}
          {step === 3 && (
            <div className="text-center py-4 sm:py-6 space-y-5">
              
              {/* Animated Success Badge */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shadow-xl">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-extrabold text-[var(--th-accent)] uppercase tracking-widest bg-[var(--th-surface-alt)] px-4 py-1 rounded-full inline-block border border-[var(--th-border)] shadow-2xs">
                  ORDER CONFIRMED & TRANSIT INSURED
                </span>

                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--th-text-main)] mt-2">
                  Thank You for Your Order!
                </h2>

                <p className="text-xs text-[var(--th-text-muted)] max-w-md mx-auto mt-1.5 leading-relaxed">
                  Your certified pure silver artifacts are being packed under CCTV tamper-proof inspection with BIS hallmarking documentation.
                </p>
              </div>

              {/* Order ID Copy Pill */}
              <div className="inline-flex items-center space-x-2 bg-[var(--th-surface-alt)] border border-[var(--th-border)] px-4 py-2 rounded-2xl shadow-2xs">
                <span className="text-xs text-[var(--th-text-muted)]">Order ID:</span>
                <span className="font-mono font-black text-sm text-[var(--th-primary)]">{orderId}</span>
                <button
                  type="button"
                  onClick={copyOrderId}
                  className="p-1 text-[var(--th-text-muted)] hover:text-[var(--th-primary)] transition-colors cursor-pointer"
                  title="Copy Order ID"
                >
                  {copiedOrderId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Order Milestone Tracker Card */}
              <div className="p-4 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] max-w-md mx-auto text-left shadow-2xs space-y-3">
                <h5 className="font-bold text-xs text-[var(--th-text-main)] uppercase tracking-wider">
                  Fulfillment Journey
                </h5>

                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <span className="font-bold block">Placed</span>
                    <span className="text-[9px] opacity-75">Just now</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--th-surface-alt)] border border-[var(--th-border)] text-[var(--th-text-muted)]">
                    <Award className="w-4 h-4 mx-auto mb-1 text-[var(--th-accent)]" />
                    <span className="font-bold block text-[var(--th-text-main)]">Hallmark</span>
                    <span className="text-[9px]">Verified</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--th-surface-alt)] border border-[var(--th-border)] text-[var(--th-text-muted)]">
                    <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-[var(--th-accent)]" />
                    <span className="font-bold block text-[var(--th-text-main)]">Packed</span>
                    <span className="text-[9px]">Insured</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--th-surface-alt)] border border-[var(--th-border)] text-[var(--th-text-muted)]">
                    <Truck className="w-4 h-4 mx-auto mb-1 text-[var(--th-accent)]" />
                    <span className="font-bold block text-[var(--th-text-main)]">Delivery</span>
                    <span className="text-[9px] font-bold text-emerald-600">2-3 Days</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--th-border)]/60 text-xs space-y-1.5 text-[var(--th-text-muted)]">
                  <div className="flex justify-between">
                    <span>Delivery To:</span>
                    <span className="font-bold text-[var(--th-text-main)] text-right max-w-xs">{getEffectiveAddress().fullAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Mode:</span>
                    <span className="font-bold uppercase text-[var(--th-text-main)]">{paymentMethod} ({paymentMethod === 'cod' ? 'Due on Delivery' : 'Paid'})</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    handleClose();
                    onNavigateHome();
                  }}
                  className="w-full sm:w-auto px-7 py-3.5 bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg"
                >
                  Continue Shopping
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
