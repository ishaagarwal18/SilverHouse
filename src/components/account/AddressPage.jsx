import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchUserAddresses, addUserAddress, deleteUserAddress } from '../../services/api';
import { 
  MapPin, Plus, Trash2, Home, Building2, Tag, 
  Sparkles, ShieldCheck, ArrowRight, X, AlertCircle, 
  CheckCircle2, Lock, User, Navigation, ArrowLeft, Phone,
  Check, Mail, CheckCheck
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
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

      const res = await addUserAddress(payload);
      if (res && res.success) {
        if (onTriggerToast) onTriggerToast('Address saved successfully!');
        setIsModalOpen(false);
        // Reset fields
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
        loadAddresses();
      } else {
        setError(res?.error || 'Failed to save address. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteUserAddress(addressToDelete.address_id, user.userId);
      if (res && res.success) {
        if (onTriggerToast) onTriggerToast('Address removed successfully.');
        setAddressToDelete(null);
        loadAddresses();
      } else {
        alert(res?.error || 'Failed to delete address.');
      }
    } catch (err) {
      alert('Error deleting address: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--th-bg)] text-[var(--th-text-main)] font-sans transition-colors duration-300 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--th-border)]">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full border border-[var(--th-border)] bg-[var(--th-card)] flex items-center justify-center text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:border-[var(--th-primary)] transition-colors cursor-pointer shadow-xs"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--th-text-main)]">
                  Delivery Addresses
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--th-primary)] text-white shadow-xs">
                  {addresses.length}
                </span>
              </div>
              <p className="text-xs text-[var(--th-text-muted)] mt-1">
                Manage your saved delivery destinations for 1-click expedited checkout
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-24 text-center text-[var(--th-text-muted)]">
            <div className="w-9 h-9 border-3 border-[var(--th-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3.5" />
            <p className="text-xs uppercase tracking-wider font-bold">Loading your verified addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          /* Empty Address State */
          <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-3xl p-12 text-center shadow-xs max-w-lg mx-auto">
            <div className="w-18 h-18 rounded-3xl bg-[var(--th-surface-alt)] border border-[var(--th-border)] text-[var(--th-accent)] flex items-center justify-center mx-auto mb-5 shadow-inner">
              <MapPin className="w-9 h-9 text-[var(--th-accent)]/80" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)] mb-1.5">
              No Saved Addresses
            </h3>
            <p className="text-xs text-[var(--th-text-muted)] max-w-sm mx-auto mb-6 leading-relaxed">
              Add your primary residence or office address now to experience instantaneous 1-click checkout with insured express delivery.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-2xl bg-[var(--th-primary)] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[var(--th-primary-hover)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Address</span>
            </button>
          </div>
        ) : (
          /* Address Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {addresses.map((addr) => {
              const tag = (addr.address_name || 'Home').toLowerCase();
              const isHome = tag.includes('home');
              const isWork = tag.includes('work') || tag.includes('office');

              return (
                <div
                  key={addr.address_id}
                  className="bg-[var(--th-card)] border border-[var(--th-border)] hover:border-[var(--th-primary)]/50 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group"
                >
                  <div>
                    {/* Top Row: Tag Badge & Actions */}
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[var(--th-surface-alt)] border border-[var(--th-border)] text-[var(--th-primary)] shadow-2xs">
                        {isHome ? <Home className="w-3 h-3 text-[var(--th-accent)]" /> : isWork ? <Building2 className="w-3 h-3 text-[var(--th-accent)]" /> : <Tag className="w-3 h-3 text-[var(--th-accent)]" />}
                        <span>{addr.address_name || 'Delivery'}</span>
                      </span>

                      <button
                        onClick={() => setAddressToDelete(addr)}
                        className="p-1.5 rounded-xl text-[var(--th-text-muted)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Recipient Header */}
                    <div className="flex items-center space-x-2.5 mb-2.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--th-surface-alt)] text-[var(--th-primary)] font-bold text-xs flex items-center justify-center border border-[var(--th-border)]">
                        {(addr.recipient_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-[var(--th-text-main)]">
                        {addr.recipient_name}
                      </h3>
                    </div>

                    {/* Formatted Address Details */}
                    <div className="text-xs text-[var(--th-text-muted)] space-y-1 leading-relaxed pl-1">
                      <p className="font-medium text-[var(--th-text-main)]">{addr.Block ? addr.Block + ', ' : ''}{addr.street}</p>
                      <p>{addr.area}</p>
                      <p>{addr.city}, {addr.state}</p>
                      <div className="pt-1.5 flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md bg-[var(--th-surface-alt)] border border-[var(--th-border)] font-mono font-bold text-[11px] text-[var(--th-primary)]">
                          PIN {addr.pincode}
                        </span>
                        <span className="text-[11px] font-bold text-[var(--th-accent)] uppercase">
                          {addr.country || 'India'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 mt-4 border-t border-[var(--th-border)]/70 flex items-center justify-between text-[11px] text-[var(--th-text-muted)]">
                    <span className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Insured Transit Verified</span>
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Quick Add New Address Card Button */}
            <div
              onClick={() => setIsModalOpen(true)}
              className="border-2 border-dashed border-[var(--th-border)] hover:border-[var(--th-primary)] rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-[var(--th-surface-alt)]/40 min-h-[220px] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--th-surface-alt)] group-hover:bg-[var(--th-primary)]/10 text-[var(--th-primary)] flex items-center justify-center mb-3 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-[var(--th-text-main)] mb-1">
                Add Another Address
              </h4>
              <p className="text-xs text-[var(--th-text-muted)] max-w-xs">
                Save a secondary home, family residence or office location
              </p>
            </div>
          </div>
        )}

        {/* 3. ADD NEW ADDRESS MODAL DIALOG */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
              onClick={() => setIsModalOpen(false)}
            />

            <div className="relative w-full max-w-lg bg-[var(--th-card)] border border-[var(--th-border)] rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
              {/* Modal Header */}
              <div className="p-5 border-b border-[var(--th-border)] bg-[var(--th-surface-alt)] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--th-card)] text-[var(--th-accent)] border border-[var(--th-border)] flex items-center justify-center shadow-xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--th-text-main)]">
                      Add Delivery Address
                    </h3>
                    <p className="text-[11px] text-[var(--th-text-muted)]">
                      Saved to your verified database account
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:bg-[var(--th-card)] cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveAddress} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
                {error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Address Type Selector */}
                <div>
                  <label className="block font-bold text-[var(--th-text-main)] mb-1.5">
                    Address Label / Type *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Home', 'Office', 'Other'].map(tag => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => setFormData(prev => ({ ...prev, address_name: tag }))}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                          formData.address_name === tag
                            ? 'bg-[var(--th-primary)] text-white border-[var(--th-primary)] shadow-2xs'
                            : 'bg-[var(--th-surface-alt)] text-[var(--th-text-muted)] border-[var(--th-border)] hover:text-[var(--th-text-main)]'
                        }`}
                      >
                        {tag === 'Home' && <Home className="w-3.5 h-3.5" />}
                        {tag === 'Office' && <Building2 className="w-3.5 h-3.5" />}
                        {tag === 'Other' && <Tag className="w-3.5 h-3.5" />}
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recipient Name */}
                <div>
                  <label className="block font-bold text-[var(--th-text-main)] mb-1">
                    Recipient Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-[var(--th-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      name="recipient_name"
                      value={formData.recipient_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Isha Agarwal"
                      className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] pl-9 pr-3.5 py-2.5 rounded-xl outline-none transition-all"
                    />
                  </div>
                </div>

                {/* House / Flat / Block */}
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
                    className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] px-3.5 py-2.5 rounded-xl outline-none transition-all"
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
                    className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] px-3.5 py-2.5 rounded-xl outline-none transition-all"
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
                    className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] px-3.5 py-2.5 rounded-xl outline-none transition-all"
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
                      className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] px-3.5 py-2.5 rounded-xl outline-none transition-all"
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
                      className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] px-3 py-2.5 rounded-xl outline-none transition-all cursor-pointer"
                    >
                      {INDIAN_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pincode & Country */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[var(--th-text-main)] mb-1">
                      6-Digit PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="110001"
                      className="w-full bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] text-[var(--th-text-main)] px-3.5 py-2.5 rounded-xl outline-none font-mono transition-all"
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

                {/* Submit Actions */}
                <div className="pt-4 flex items-center justify-end space-x-3 border-t border-[var(--th-border)]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-[var(--th-border)] hover:bg-[var(--th-surface-alt)] text-[var(--th-text-muted)] font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Saving Address...' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 4. DELETE CONFIRMATION MODAL */}
        {addressToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
              onClick={() => setAddressToDelete(null)}
            />

            <div className="relative w-full max-w-sm bg-[var(--th-card)] border border-[var(--th-border)] rounded-3xl p-6 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
                <Trash2 className="w-7 h-7" />
              </div>

              <div>
                <h4 className="font-serif font-bold text-lg text-[var(--th-text-main)]">
                  Delete Address?
                </h4>
                <p className="text-xs text-[var(--th-text-muted)] mt-1.5 leading-relaxed">
                  Are you sure you want to remove this delivery address? This action cannot be undone.
                </p>
              </div>

              <div className="p-3 bg-[var(--th-surface-alt)] rounded-xl border border-[var(--th-border)] text-xs text-left">
                <span className="font-bold text-[var(--th-text-main)] block">{addressToDelete.recipient_name}</span>
                <span className="text-[var(--th-text-muted)] text-[11px] block">{addressToDelete.Block}, {addressToDelete.street}, {addressToDelete.city}</span>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddressToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--th-border)] hover:bg-[var(--th-surface-alt)] text-[var(--th-text-muted)] font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDeleteAddress}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
