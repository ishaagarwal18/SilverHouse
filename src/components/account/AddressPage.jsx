import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchUserAddresses, addUserAddress, deleteUserAddress } from '../../services/api';
import { 
  MapPin, Plus, Trash2, Home, Building2, Tag, 
  Sparkles, ShieldCheck, ArrowRight, X, AlertCircle, 
  CheckCircle2, Lock, User, Navigation
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function AddressPage({ onTriggerToast }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    address_name: 'Home',
    recipient_name: '',
    Block: '',
    street: '',
    area: '',
    city: '',
    state: 'Delhi',
    pincode: '',
    country: 'India'
  });

  // Load addresses when user is authenticated
  const loadAddresses = async () => {
    if (!user || !user.userId) return;
    setLoading(true);
    try {
      const data = await fetchUserAddresses(user.userId);
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadAddresses();
      // Pre-fill recipient name from user profile
      if (user.fullName) {
        setFormData(prev => ({ ...prev, recipient_name: user.fullName }));
      }
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.recipient_name.trim() || !formData.Block.trim() || !formData.street.trim() || !formData.area.trim() || !formData.city.trim() || !formData.pincode.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      setError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: user.userId,
        address_name: formData.address_name,
        recipient_name: formData.recipient_name.trim(),
        Block: formData.Block.trim(),
        street: formData.street.trim(),
        area: formData.area.trim(),
        city: formData.city.trim(),
        state: formData.state,
        pincode: formData.pincode.trim(),
        country: formData.country || 'India'
      };

      const result = await addUserAddress(payload);
      if (result && result.success) {
        if (onTriggerToast) {
          onTriggerToast('success', 'Address Saved', 'New delivery address added to your account successfully.');
        }
        setIsModalOpen(false);
        // Reset form
        setFormData({
          address_name: 'Home',
          recipient_name: user?.fullName || '',
          Block: '',
          street: '',
          area: '',
          city: '',
          state: 'Delhi',
          pincode: '',
          country: 'India'
        });
        await loadAddresses();
      } else {
        const errMsg = result?.error || 'Failed to save address. Please check your inputs.';
        setError(errMsg);
        if (onTriggerToast) {
          onTriggerToast('error', 'Address Error', errMsg);
        }
      }
    } catch (err) {
      const errMsg = err.message || 'An error occurred while saving your address.';
      setError(errMsg);
      if (onTriggerToast) {
        onTriggerToast('error', 'Address Error', errMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to remove this delivery address?')) return;

    try {
      const result = await deleteUserAddress(addressId);
      if (result && result.success) {
        if (onTriggerToast) {
          onTriggerToast('info', 'Address Removed', 'The delivery address was removed from your account.');
        }
        setAddresses(prev => prev.filter(a => a.address_id !== addressId));
      } else {
        const errMsg = result?.error || 'Failed to delete address.';
        if (onTriggerToast) {
          onTriggerToast('error', 'Delete Failed', errMsg);
        } else {
          alert(errMsg);
        }
      }
    } catch (err) {
      console.error('Delete address error:', err);
    }
  };

  // 1. GUEST GATING VIEW: User is not logged in
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-[75vh] bg-[var(--th-bg)] flex items-center justify-center p-4 py-16 transition-colors duration-300">
        <div className="max-w-md w-full bg-[var(--th-card)] border border-[var(--th-border)] rounded-3xl shadow-xl p-8 text-center backdrop-blur-sm">
          <div className="w-16 h-16 rounded-2xl bg-[var(--th-primary)]/10 text-[var(--th-primary)] border border-[var(--th-border)] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Lock className="w-8 h-8 text-[var(--th-accent)]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[var(--th-text-main)] mb-2">
            Sign In Required
          </h2>
          <p className="text-xs sm:text-sm text-[var(--th-text-muted)] mb-6 font-sans leading-relaxed">
            Your saved addresses are encrypted and securely linked to your personal account for verified delivery and expedited checkout. Please sign in to view or enter delivery addresses.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login?redirect=/addresses')}
              className="w-full py-3.5 px-6 rounded-xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Sign In to Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-6 rounded-xl border border-[var(--th-border)] bg-[var(--th-surface-alt)] hover:bg-[var(--th-card)] text-[var(--th-text-main)] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED ADDRESS MANAGEMENT VIEW
  return (
    <div className="min-h-screen bg-[var(--th-bg)] py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-8 border-b border-[var(--th-border)] gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[var(--th-accent)] mb-1">
              <Sparkles className="w-4 h-4 text-[var(--th-accent)]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--th-text-muted)]">
                DELIVERY DIRECTORY • SAVED DESTINATIONS
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--th-text-main)] tracking-tight">
              MY SAVED ADDRESSES
            </h1>
            <p className="text-xs sm:text-sm text-[var(--th-text-muted)] mt-1 font-sans">
              Manage your residential, workplace, and gifting locations for seamless delivery.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center text-[var(--th-text-muted)]">
            <div className="w-8 h-8 border-3 border-[var(--th-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs uppercase tracking-wider font-semibold">Loading your verified addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          /* Empty Address State */
          <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[var(--th-surface-alt)] border border-[var(--th-border)] text-[var(--th-accent)] flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)] mb-1">
              No Addresses Saved Yet
            </h3>
            <p className="text-xs text-[var(--th-text-muted)] max-w-sm mx-auto mb-6">
              You haven't added any delivery addresses yet. Add your address now for fast 1-click checkout!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-[var(--th-primary)] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[var(--th-primary-hover)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Address</span>
            </button>
          </div>
        ) : (
          /* Address Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((addr) => {
              const tag = (addr.address_name || 'Home').toLowerCase();
              const isHome = tag.includes('home');
              const isWork = tag.includes('work') || tag.includes('office');

              return (
                <div
                  key={addr.address_id}
                  className="bg-[var(--th-card)] border border-[var(--th-border)] hover:border-[var(--th-accent)] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group"
                >
                  <div>
                    {/* Top Row: Tag & Delete Action */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[var(--th-surface-alt)] border border-[var(--th-border)] text-[var(--th-primary)]">
                        {isHome ? <Home className="w-3 h-3 text-[var(--th-accent)]" /> : isWork ? <Building2 className="w-3 h-3 text-[var(--th-accent)]" /> : <Tag className="w-3 h-3 text-[var(--th-accent)]" />}
                        <span>{addr.address_name || 'Delivery'}</span>
                      </span>

                      <button
                        onClick={() => handleDeleteAddress(addr.address_id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Recipient Details */}
                    <h3 className="font-bold text-base text-[var(--th-text-main)] mb-1">
                      {addr.recipient_name}
                    </h3>

                    {/* Address String */}
                    <div className="text-xs text-[var(--th-text-muted)] space-y-0.5 leading-relaxed">
                      <p className="font-medium text-[var(--th-text-main)]">{addr.Block}, {addr.street}</p>
                      <p>{addr.area}</p>
                      <p>{addr.city}, {addr.state} - <strong className="text-[var(--th-text-main)] font-mono">{addr.pincode}</strong></p>
                      <p className="text-[11px] font-bold text-[var(--th-accent)] uppercase tracking-wider pt-1">{addr.country || 'India'}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[var(--th-border)]/60 flex items-center justify-between text-[11px] text-[var(--th-text-muted)]">
                    <span className="flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified for Express Shipping</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. ADD NEW ADDRESS MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-lg bg-[var(--th-card)] border border-[var(--th-border)] rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
              
              {/* Header */}
              <div className="p-5 border-b border-[var(--th-border)] bg-[var(--th-surface-alt)] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--th-card)] text-[var(--th-accent)] border border-[var(--th-border)] flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[var(--th-text-main)]">
                      Add Delivery Address
                    </h3>
                    <p className="text-[11px] text-[var(--th-text-muted)] font-sans">
                      Stored in your database profile for fast checkout
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] rounded-lg hover:bg-[var(--th-card)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveAddress} className="p-6 overflow-y-auto space-y-4 text-xs">
                
                {/* Error Banner */}
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Address Label / Tag Selection */}
                <div>
                  <label className="block font-bold text-[var(--th-text-main)] mb-1.5">
                    Address Type / Label *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Home', 'Office', 'Other'].map(tag => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => setFormData(prev => ({ ...prev, address_name: tag }))}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          formData.address_name === tag
                            ? 'bg-[var(--th-primary)] text-white border-[var(--th-primary)] shadow-xs'
                            : 'bg-[var(--th-surface-alt)] text-[var(--th-text-muted)] border-[var(--th-border)] hover:text-[var(--th-text-main)]'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recipient Name */}
                <div>
                  <label className="block font-bold text-[var(--th-text-main)] mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="recipient_name"
                    value={formData.recipient_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Yash Agarwal"
                    className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] px-3.5 py-2.5 rounded-xl outline-none transition-all placeholder:text-[var(--th-text-muted)]/60"
                  />
                </div>

                {/* Block / Flat / Building */}
                <div>
                  <label className="block font-bold text-[var(--th-text-main)] mb-1">
                    Flat / House No. / Building / Block *
                  </label>
                  <input
                    type="text"
                    required
                    name="Block"
                    value={formData.Block}
                    onChange={handleInputChange}
                    placeholder="e.g. Flat 402, Lotus Residency, Block C"
                    className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] px-3.5 py-2.5 rounded-xl outline-none transition-all placeholder:text-[var(--th-text-muted)]/60"
                  />
                </div>

                {/* Street / Road */}
                <div>
                  <label className="block font-bold text-[var(--th-text-main)] mb-1">
                    Street Address / Road Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="e.g. MG Road, Near Silver Market"
                    className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] px-3.5 py-2.5 rounded-xl outline-none transition-all placeholder:text-[var(--th-text-muted)]/60"
                  />
                </div>

                {/* Area / Landmark */}
                <div>
                  <label className="block font-bold text-[var(--th-text-main)] mb-1">
                    Area / Locality / Landmark *
                  </label>
                  <input
                    type="text"
                    required
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="e.g. Sector 15, Near Shiv Mandir"
                    className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] px-3.5 py-2.5 rounded-xl outline-none transition-all placeholder:text-[var(--th-text-muted)]/60"
                  />
                </div>

                {/* City & State */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[var(--th-text-main)] mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. New Delhi"
                      className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] px-3.5 py-2.5 rounded-xl outline-none transition-all placeholder:text-[var(--th-text-muted)]/60"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--th-text-main)] mb-1">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] px-3.5 py-2.5 rounded-xl outline-none transition-all cursor-pointer"
                    >
                      {INDIAN_STATES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pincode & Country */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[var(--th-text-main)] mb-1">
                      PIN Code (6 digits) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="110001"
                      className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] px-3.5 py-2.5 rounded-xl outline-none transition-all font-mono placeholder:text-[var(--th-text-muted)]/60"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--th-text-main)] mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      disabled
                      value="India"
                      className="w-full bg-[var(--th-surface-alt)]/60 border border-[var(--th-border)] text-[var(--th-text-muted)] px-3.5 py-2.5 rounded-xl font-bold cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="pt-4 border-t border-[var(--th-border)] flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-[var(--th-border)] text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:bg-[var(--th-surface-alt)] font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold tracking-wider uppercase shadow-md flex items-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save Address</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
