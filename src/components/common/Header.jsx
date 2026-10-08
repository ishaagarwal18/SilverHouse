import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MegaMenu from './MegaMenu';
import { useAuth } from '../../context/AuthContext';
import { fetchUserAddresses } from '../../services/api';
import {
  Search, Heart, ShoppingBag, User, Menu, Sparkles, ChevronDown,
  LogOut, Building2, Store, MapPin, Check, Plus, Home, X, ArrowLeft, Package, Crown
} from 'lucide-react';
import StoresModal from './StoresModal';
import ThemeSwitcher from './ThemeSwitcher';
import { getAdminUrl } from '../../utils/adminUrl';

export default function Header({
  cartCount = 0,
  wishlistCount = 0,
  categories = [],
  festivals = [],
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onNavigateHome,
  onNavigateCategory,
  onNavigateSubcategory,
  onNavigateYatraCustomizer,
  onOpenMobileMenu,
  onOpenInfoModal
}) {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isStoresModalOpen, setIsStoresModalOpen] = useState(false);

  // Dynamic Delivery Location State
  const [pincode, setPincode] = useState(() => {
    const saved = localStorage.getItem('silverhouse_pincode');
    return saved && saved !== '110001' ? saved : '';
  });
  const [isLocationPopoverOpen, setIsLocationPopoverOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [activeAddress, setActiveAddress] = useState(null);
  const [pincodeInput, setPincodeInput] = useState('');

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Refs for click-outside dismissal
  const userMenuRef = useRef(null);
  const locationPopoverRef = useRef(null);

  // Close popovers and dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (locationPopoverRef.current && !locationPopoverRef.current.contains(event.target)) {
        setIsLocationPopoverOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsLocationPopoverOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const toggleLocationPopover = () => {
    setIsLocationPopoverOpen(prev => {
      if (!prev) setIsUserMenuOpen(false);
      return !prev;
    });
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(prev => {
      if (!prev) setIsLocationPopoverOpen(false);
      return !prev;
    });
  };

  // Load user's saved addresses to display active delivery destination
  const loadAddressesForHeader = () => {
    if (isAuthenticated && user?.userId) {
      fetchUserAddresses(user.userId).then(list => {
        if (Array.isArray(list) && list.length > 0) {
          setSavedAddresses(list);
          const savedId = localStorage.getItem('silverhouse_active_address_id');
          const found = list.find(a => String(a.address_id) === String(savedId));
          const chosen = found || list[0];
          setActiveAddress(chosen);
          if (chosen?.pincode) {
            setPincode(chosen.pincode);
          }
        } else {
          setSavedAddresses([]);
          setActiveAddress(null);
        }
      }).catch(err => console.warn('Could not fetch addresses for header:', err));
    } else {
      setSavedAddresses([]);
      setActiveAddress(null);
    }
  };

  useEffect(() => {
    loadAddressesForHeader();
    window.addEventListener('silverhouse_address_updated', loadAddressesForHeader);
    return () => {
      window.removeEventListener('silverhouse_address_updated', loadAddressesForHeader);
    };
  }, [isAuthenticated, user]);

  const hasDbCategories = Array.isArray(categories) && categories.length > 0;

  const DROPDOWNS = {
    festive: [
      { label: "VIEW ALL FESTIVE EDITS", action: () => onNavigateCategory("festive") },
      ...(festivals && festivals.length > 0
        ? festivals.map(f => ({ label: f.name.toUpperCase(), action: () => onNavigateCategory(f.id || f.slug) }))
        : [
          { label: "NAVRATRI & GUJARAT", action: () => onNavigateCategory("gujarat-festivals") },
          { label: "DUSSEHRA & DIWALI", action: () => onNavigateCategory("festive-collection") },
          { label: "JAIN FESTIVALS", action: () => onNavigateCategory("jain-festivals") }
        ])
    ],
    jewellery: [
      { label: "VIEW ALL JEWELLERY", action: () => onNavigateCategory("jewellery") },
      ...(hasDbCategories
        ? categories
          .filter(c => ['rings', 'anklets-payal', 'bangles-bracelets', 'spiritual-wear'].includes(c.id || c.slug))
          .map(c => ({ label: c.name.toUpperCase(), action: () => onNavigateCategory(c.id || c.slug) }))
        : [
          { label: "SILVER RINGS", action: () => onNavigateCategory("rings") },
          { label: "SILVER BANGLES & KADAS", action: () => onNavigateCategory("bangles-bracelets") },
          { label: "SILVER PAYAL & ANKLETS", action: () => onNavigateCategory("anklets-payal") },
          { label: "SPIRITUAL WEAR", action: () => onNavigateCategory("spiritual-wear") }
        ])
    ],
    coins: [
      { label: "VIEW ALL COINS & BARS", action: () => onNavigateCategory("silver-coins") },
      ...(hasDbCategories
        ? categories
          .filter(c => (c.id || c.slug) === 'silver-coins')
          .map(c => ({ label: c.name.toUpperCase(), action: () => onNavigateCategory(c.id || c.slug) }))
        : [
          { label: "PURE 999 FINE BULLION", action: () => onNavigateCategory("silver-coins") }
        ])
    ],
    women: [
      { label: "VIEW ALL WOMEN", action: () => onNavigateCategory("women") },
      ...(hasDbCategories
        ? categories
          .filter(c => (c.idealFor || c.ideal_for || '').toLowerCase() === 'women' || ['rings', 'anklets-payal', 'bangles-bracelets'].includes(c.id || c.slug))
          .map(c => ({ label: c.name.toUpperCase(), action: () => onNavigateCategory(c.id || c.slug) }))
        : [
          { label: "SILVER RINGS", action: () => onNavigateCategory("rings") },
          { label: "TRADITIONAL GHUNGROO PAYAL", action: () => onNavigateCategory("anklets-payal") },
          { label: "TEMPLE WORK BANGLES", action: () => onNavigateCategory("bangles-bracelets") }
        ])
    ],
    mens: [
      { label: "VIEW ALL MEN COLLECTION", action: () => onNavigateCategory("mens") },
      ...(hasDbCategories
        ? categories
          .filter(c => ['rings', 'spiritual-wear'].includes(c.id || c.slug) || (c.idealFor || c.ideal_for || '').toLowerCase().includes('men'))
          .map(c => ({ label: c.name.toUpperCase(), action: () => onNavigateCategory(c.id || c.slug) }))
        : [
          { label: "ROYAL SOLID SILVER KADA", action: () => onNavigateCategory("bangles-bracelets") },
          { label: "SACRED RUDRAKSHA PENDANT", action: () => onNavigateCategory("spiritual-wear") },
          { label: "MEN'S SIGNET RINGS", action: () => onNavigateCategory("rings") }
        ])
    ],
    kids: [
      { label: "VIEW ALL KIDS COLLECTION", action: () => onNavigateCategory("kids") },
      ...(hasDbCategories
        ? categories
          .filter(c => (c.idealFor || c.ideal_for || '').toLowerCase() === 'kids' || (c.id || c.slug) === 'baby-silver')
          .map(c => ({ label: c.name.toUpperCase(), action: () => onNavigateCategory(c.id || c.slug) }))
        : [
          { label: "BABY SILVER UTENSILS", action: () => onNavigateCategory("baby-silver") }
        ])
    ],
    puja: [
      { label: "ALL DIVINE ARTIFACTS", action: () => onNavigateCategory("silver-idols") },
      ...(hasDbCategories
        ? categories
          .filter(c => (c.idealFor || c.ideal_for || '').toLowerCase() === 'puja' || ['silver-idols', 'pooja-articles', 'car-accessories', 'silverware'].includes(c.id || c.slug))
          .map(c => ({ label: c.name.toUpperCase(), action: () => onNavigateCategory(c.id || c.slug) }))
        : [
          { label: "SILVER IDOLS & MURTI", action: () => onNavigateCategory("silver-idols") },
          { label: "POOJA ARTICLES & DIYAS", action: () => onNavigateCategory("pooja-articles") },
          { label: "CAR DASHBOARD IDOLS", action: () => onNavigateCategory("car-accessories") }
        ])
    ],
    gifts: [
      { label: "ALL SACRED GIFTS", action: () => onNavigateCategory("all") },
      { label: "CUSTOM BESPOKE & YATRA ORDERS", action: () => navigate('/customize') },
      ...(hasDbCategories
        ? categories
          .filter(c => (c.idealFor || c.ideal_for || '').toLowerCase() === 'gifts' || ['silver-coins', 'silverware'].includes(c.id || c.slug))
          .map(c => ({ label: c.name.toUpperCase(), action: () => onNavigateCategory(c.id || c.slug) }))
        : [
          { label: "SILVER COINS & BARS", action: () => onNavigateCategory("silver-coins") },
          { label: "ROYAL SILVERWARE", action: () => onNavigateCategory("silverware") }
        ])
    ]
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--th-surface-alt)]/95 backdrop-blur-md border-b border-[var(--th-border)] shadow-xs transition-colors duration-300">
      <div className="max-w-[1480px] mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">

        {/* Main Navbar Row */}
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20 gap-1.5 sm:gap-3 lg:gap-4">

          {/* Left: Mobile Menu Trigger + Brand Logo (Stays completely stationary) */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 shrink-0">
            <button
              onClick={onOpenMobileMenu}
              className="p-1.5 sm:p-2 text-[var(--th-text-main)] hover:bg-[var(--th-card)] rounded-xl lg:hidden focus:outline-hidden cursor-pointer shrink-0"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Brand Logo (SILVERHOUSE) */}
            <button
              onClick={onNavigateHome}
              className="group text-left flex items-center space-x-1.5 sm:space-x-3 focus:outline-hidden cursor-pointer shrink-0"
            >
              {/* Opulent Circular Crest */}
              <div
                className="hidden min-[360px]:flex w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full border border-[var(--th-accent)] sm:border-2 items-center justify-center shadow-md group-hover:scale-105 transition-all duration-300 text-white shrink-0"
                style={{ background: 'var(--th-nav-gradient)' }}
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--th-accent)] drop-shadow-sm animate-pulse" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-baseline space-x-1">
                  <span className="font-serif text-[15px] min-[360px]:text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-wider text-[var(--th-text-main)] group-hover:text-[var(--th-primary)] transition-colors drop-shadow-2xs">
                    SILVER<span className="text-[var(--th-accent)] font-light">HOUSE</span>
                  </span>
                </div>
                <span className="hidden sm:block text-[8px] sm:text-[8.5px] font-bold tracking-[0.2em] sm:tracking-[0.24em] text-[var(--th-text-muted)] uppercase -mt-0.5">
                  Fine Artisanal Sterling 925 &amp; 999 Pure
                </span>
              </div>
            </button>
          </div>

          {/* Center: Integrated Luxury Search Bar */}
          <div className="hidden lg:flex flex-1 min-w-[200px] max-w-md lg:max-w-lg xl:max-w-xl mx-2">
            <div
              onClick={onOpenSearch}
              className="w-full h-11 px-4 rounded-full bg-[var(--th-card)] border-2 border-[var(--th-border)] hover:border-[var(--th-accent)] shadow-xs hover:shadow-md flex items-center justify-between cursor-pointer transition-all duration-300 group"
              role="search"
              aria-label="Search pure silver jewelry and artifacts"
            >
              <div className="flex items-center space-x-2.5 text-xs text-[var(--th-text-muted)] group-hover:text-[var(--th-text-main)] truncate flex-1 min-w-0 pr-2">
                <div className="w-6 h-6 rounded-full bg-[var(--th-primary-light)] flex items-center justify-center text-[var(--th-accent)] group-hover:scale-110 transition-transform shrink-0">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <span className="truncate font-medium">Search 925 silver jewellery, 999 coins, payal, idols...</span>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="hidden xl:inline-flex items-center space-x-0.5 text-[9.5px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-[var(--th-surface-alt)] text-[var(--th-text-muted)] border border-[var(--th-border)]">
                  <span>⌘</span>
                  <span>K</span>
                </span>
                <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[var(--th-primary)] text-white shadow-2xs group-hover:bg-[var(--th-accent)] transition-colors">
                  Search
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Utilities (Back Button, Theme Switcher, Pincode, Stores, Account, Wishlist, Cart) */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 shrink-0">

            {/* Navbar Back Button (Visible in navbar when navigated away from home without shifting brand logo) */}
            {location.pathname !== '/' && (
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-[var(--th-card)] hover:bg-[var(--th-surface-alt)] border border-[var(--th-border)] hover:border-[var(--th-primary)] text-xs font-bold text-[var(--th-text-main)] hover:text-[var(--th-primary)] transition-all cursor-pointer shadow-2xs group shrink-0"
                title="Go back to previous page"
                aria-label="Go back"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[var(--th-accent)] group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden min-[380px]:inline">Back</span>
              </button>
            )}

            {/* Delivery Location Pill & Popover (Desktop) */}
            <div ref={locationPopoverRef} className="relative hidden xl:block">
              <button
                onClick={toggleLocationPopover}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[var(--th-card)] border border-[var(--th-border)] hover:border-[var(--th-accent)] text-xs text-[var(--th-text-main)] transition-all cursor-pointer shadow-2xs group"
                title={activeAddress || pincode ? "Change delivery location" : "Add delivery address"}
              >
                <MapPin className="w-3.5 h-3.5 text-[var(--th-accent)] shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-xs truncate max-w-[175px]">
                  {activeAddress ? (
                    <>Deliver to: <strong className="text-[var(--th-primary)] font-bold">{activeAddress.address_name || activeAddress.city}</strong></>
                  ) : pincode ? (
                    <>Deliver to: <strong className="text-[var(--th-primary)] font-bold">{pincode}</strong></>
                  ) : (
                    <span className="text-[var(--th-text-muted)] group-hover:text-[var(--th-primary)] font-semibold flex items-center space-x-1">
                      <Plus className="w-3 h-3 text-[var(--th-accent)] inline mr-0.5" />
                      Add Address
                    </span>
                  )}
                </span>
                <ChevronDown className="w-3 h-3 text-[var(--th-text-muted)] group-hover:text-[var(--th-primary)] transition-transform" />
              </button>

              {/* Location Popover Dialog */}
              {isLocationPopoverOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--th-card)] rounded-2xl shadow-2xl border border-[var(--th-border)] p-4 z-50 animate-in fade-in slide-in-from-top-2 text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--th-border)]/60 mb-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-[var(--th-accent)]" />
                      <h4 className="font-serif font-bold text-sm text-[var(--th-text-main)]">
                        {activeAddress ? 'Delivery Location' : 'Add Delivery Address'}
                      </h4>
                    </div>
                    <button
                      onClick={() => setIsLocationPopoverOpen(false)}
                      className="text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] p-1 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* If user is logged in */}
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      {savedAddresses.length > 0 ? (
                        <>
                          <p className="text-[11px] text-[var(--th-text-muted)] font-medium">
                            Select from your saved addresses:
                          </p>
                          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                            {savedAddresses.map(addr => {
                              const isSelected = activeAddress?.address_id === addr.address_id;
                              return (
                                <div
                                  key={addr.address_id}
                                  onClick={() => {
                                    setActiveAddress(addr);
                                    setPincode(addr.pincode);
                                    localStorage.setItem('silverhouse_pincode', addr.pincode);
                                    localStorage.setItem('silverhouse_active_address_id', addr.address_id);
                                    setIsLocationPopoverOpen(false);
                                  }}
                                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between ${isSelected
                                    ? 'border-[var(--th-primary)] bg-[var(--th-primary)]/10 text-[var(--th-primary)] font-bold'
                                    : 'border-[var(--th-border)] hover:bg-[var(--th-surface-alt)] text-[var(--th-text-main)]'
                                    }`}
                                >
                                  <div>
                                    <div className="flex items-center space-x-1.5 mb-0.5">
                                      <span className="font-bold">{addr.recipient_name}</span>
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--th-surface-alt)] border border-[var(--th-border)] text-[var(--th-text-muted)] uppercase">
                                        {addr.address_name || 'Home'}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-[var(--th-text-muted)] line-clamp-1 font-normal">
                                      {addr.city}, {addr.state} - {addr.pincode}
                                    </p>
                                  </div>
                                  {isSelected && <Check className="w-4 h-4 text-[var(--th-primary)] shrink-0 mt-0.5" />}
                                </div>
                              );
                            })}
                          </div>
                          <button
                            onClick={() => {
                              setIsLocationPopoverOpen(false);
                              navigate('/addresses');
                            }}
                            className="w-full py-2 px-3 rounded-xl border border-[var(--th-border)] bg-[var(--th-surface-alt)] hover:bg-[var(--th-card)] text-xs font-bold text-[var(--th-primary)] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add or Manage Addresses</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-center py-3">
                          <p className="text-xs text-[var(--th-text-muted)] mb-3">
                            You have no saved delivery addresses yet.
                          </p>
                          <button
                            onClick={() => {
                              setIsLocationPopoverOpen(false);
                              navigate('/addresses');
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-[var(--th-primary)] text-white text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-[var(--th-primary-hover)] transition-colors cursor-pointer"
                          >
                            + Add New Address
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Guest View */
                    <div className="space-y-3">
                      <p className="text-xs text-[var(--th-text-muted)] leading-relaxed">
                        Sign in to see your saved delivery addresses and check delivery speed.
                      </p>
                      <button
                        onClick={() => {
                          setIsLocationPopoverOpen(false);
                          navigate('/login?redirect=/addresses');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[var(--th-primary)] text-white text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-[var(--th-primary-hover)] transition-colors cursor-pointer"
                      >
                        Sign In to Add Address
                      </button>

                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-[var(--th-border)]"></div>
                        <span className="flex-shrink mx-2 text-[10px] uppercase tracking-wider text-[var(--th-text-muted)]">or enter pincode</span>
                        <div className="flex-grow border-t border-[var(--th-border)]"></div>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (/^\d{6}$/.test(pincodeInput.trim())) {
                            setPincode(pincodeInput.trim());
                            localStorage.setItem('silverhouse_pincode', pincodeInput.trim());
                            setIsLocationPopoverOpen(false);
                          } else {
                            alert('Please enter a valid 6-digit Indian PIN code.');
                          }
                        }}
                        className="flex space-x-2"
                      >
                        <input
                          type="text"
                          maxLength={6}
                          value={pincodeInput}
                          onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 110001"
                          className="flex-1 bg-[var(--th-surface-alt)] border border-[var(--th-border)] focus:border-[var(--th-primary)] rounded-xl px-3 py-1.5 text-xs text-[var(--th-text-main)] outline-none font-mono"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-[var(--th-surface-alt)] hover:bg-[var(--th-primary)] hover:text-white border border-[var(--th-border)] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Search Button (Visible on phones) */}
            <button
              onClick={onOpenSearch}
              className="p-1.5 sm:p-2 text-[var(--th-text-main)] hover:bg-[var(--th-card)] rounded-xl transition-all lg:hidden cursor-pointer shrink-0"
              title="Search products"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--th-accent)]" />
            </button>

            {/* User Account & Profile Dropdown */}
            <div ref={userMenuRef} className="relative shrink-0 hidden sm:block">
              {isAuthenticated ? (
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-1.5 p-1 rounded-full hover:bg-[var(--th-card)] transition-colors focus:outline-hidden cursor-pointer"
                  title={user.fullName || 'User Profile'}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--th-primary)] text-white font-bold text-xs flex items-center justify-center shadow-xs border border-[var(--th-accent)]/50 shrink-0">
                    {user.fullName ? user.fullName.trim().split(/\s+/).filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SH'}
                  </div>
                  {isAdmin && (
                    <span className="hidden xl:inline-block text-[9px] font-bold bg-[var(--th-accent)] text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      ADMIN
                    </span>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 text-[var(--th-text-main)] hover:bg-[var(--th-card)] rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer group border border-transparent hover:border-[var(--th-border)] shrink-0"
                  title="Sign In / Register"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--th-accent)] group-hover:scale-110 transition-transform shrink-0" />
                  <span className="hidden lg:inline-block text-xs font-bold uppercase tracking-wider text-[var(--th-text-main)] whitespace-nowrap">
                    Sign In
                  </span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {isAuthenticated && isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--th-card)] rounded-2xl shadow-2xl border border-[var(--th-border)] p-4 z-50 animate-in fade-in slide-in-from-top-2 text-left">
                  <div className="pb-3 border-b border-[var(--th-border)]/60 mb-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[var(--th-text-main)] truncate">{user.fullName || 'Valued Patron'}</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${isAdmin ? 'bg-[var(--th-accent)] text-white' : 'bg-[var(--th-surface-alt)] text-[var(--th-text-main)]'}`}>
                        {user.role || 'CUSTOMER'}
                      </span>
                    </div>
                    {user.phone ? (
                      <p className="text-xs font-mono text-[var(--th-text-muted)] truncate mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        {user.phone}
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--th-text-muted)] truncate mt-0.5">{user.email}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/login');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[var(--th-text-main)] hover:bg-[var(--th-surface-alt)] rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-[var(--th-accent)]" />
                      <span>My Account Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/orders');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[var(--th-text-main)] hover:bg-[var(--th-surface-alt)] rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-[var(--th-accent)]" />
                      <span>My Orders</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/customize');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[var(--th-text-main)] hover:bg-[var(--th-surface-alt)] rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[var(--th-accent)]" />
                      <span>Custom & Bespoke Orders</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/addresses');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[var(--th-text-main)] hover:bg-[var(--th-surface-alt)] rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-[var(--th-accent)]" />
                      <span>Saved Addresses</span>
                    </button>

                    {isAdmin && (
                      <a
                        href={getAdminUrl()}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-[var(--th-text-main)] hover:bg-[var(--th-surface-alt)] rounded-xl flex items-center space-x-2 transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-[var(--th-accent)]" />
                        <span>Open Admin Studio</span>
                      </a>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                        navigate('/login');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Trigger with Coordinated Badge */}
            <button
              onClick={onOpenWishlist}
              className="p-1.5 sm:p-2 text-[var(--th-text-main)] hover:bg-[var(--th-card)] rounded-xl transition-all relative group cursor-pointer shrink-0"
              title="Saved Wishlist"
              aria-label="Saved Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--th-accent)] group-hover:scale-110 transition-transform" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--th-primary)] text-white font-bold text-[9px] sm:text-[10px] rounded-full flex items-center justify-center shadow-xs border border-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag / Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="px-2 py-1.5 sm:px-2.5 sm:py-1.5 md:px-3.5 md:py-2 bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white rounded-full transition-all relative flex items-center space-x-1 sm:space-x-1.5 shadow-md hover:shadow-lg cursor-pointer group shrink-0"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline text-xs font-bold uppercase tracking-wider text-white">
                Cart
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-[var(--th-accent)] text-white font-extrabold text-[9px] sm:text-[10px] leading-tight">
                {cartCount}
              </span>
            </button>

          </div>
        </div>

        {/* Secondary Row: Desktop Category Navigation Links */}
        <nav className="hidden lg:flex flex-wrap items-center justify-start xl:justify-center gap-x-1 xl:gap-x-3 gap-y-2 border-t border-[var(--th-border)]/80 py-2.5">

          {/* SHOP ALL (MegaMenu Trigger) */}
          <div
            className="relative"
            onMouseEnter={() => {
              setActiveDropdown(null);
              setIsMegaMenuOpen(true);
            }}
          >
            <button
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className="px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider text-[var(--th-text-main)] hover:text-[var(--th-primary)] transition-colors flex items-center space-x-1 uppercase focus:outline-hidden cursor-pointer"
            >
              <span>SHOP ALL</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--th-accent)] transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* FESTIVE COLLECTION */}
          <div
            className="relative"
            onMouseEnter={() => {
              setIsMegaMenuOpen(false);
              setActiveDropdown('festive');
            }}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              onClick={() => onNavigateCategory("festive")}
              className="px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider text-amber-600 hover:text-amber-700 transition-colors flex items-center space-x-1 uppercase focus:outline-hidden cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>FESTIVE EDITS</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'festive' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'festive' && (
              <div className="absolute top-full left-0 w-64 bg-[var(--th-card)] shadow-2xl rounded-2xl border border-amber-200 z-50 py-3 px-5 text-left animate-in fade-in slide-in-from-top-1">
                <ul className="space-y-2">
                  {DROPDOWNS.festive.map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          item.action();
                          setActiveDropdown(null);
                        }}
                        className={`text-[11px] font-bold tracking-wider uppercase transition-colors text-left block w-full py-1.5 border-b border-[var(--th-border)]/30 last:border-0 cursor-pointer ${idx === 0 ? 'text-amber-600 hover:text-amber-700' : 'text-[var(--th-text-main)] hover:text-[var(--th-primary)]'}`}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* SILVER JEWELLERY */}
          <div
            className="relative"
            onMouseEnter={() => {
              setIsMegaMenuOpen(false);
              setActiveDropdown('jewellery');
            }}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              onClick={() => onNavigateCategory("jewellery")}
              className="px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider text-[var(--th-text-main)] hover:text-[var(--th-primary)] transition-colors flex items-center space-x-1 uppercase focus:outline-hidden cursor-pointer"
            >
              <span>SILVER JEWELLERY</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--th-accent)] transition-transform duration-200 ${activeDropdown === 'jewellery' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'jewellery' && (
              <div className="absolute top-full left-0 w-64 bg-[var(--th-card)] shadow-2xl rounded-2xl border border-[var(--th-border)] z-50 py-3 px-5 text-left animate-in fade-in slide-in-from-top-1">
                <ul className="space-y-2">
                  {DROPDOWNS.jewellery.map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          item.action();
                          setActiveDropdown(null);
                        }}
                        className="text-[11px] font-bold tracking-wider text-[var(--th-text-main)] hover:text-[var(--th-primary)] uppercase transition-colors text-left block w-full py-1.5 border-b border-[var(--th-border)]/30 last:border-0 cursor-pointer"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* SILVER COINS */}
          <div
            className="relative"
            onMouseEnter={() => {
              setIsMegaMenuOpen(false);
              setActiveDropdown('coins');
            }}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              onClick={() => onNavigateCategory("silver-coins-bars")}
              className="px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider text-[var(--th-text-main)] hover:text-[var(--th-primary)] transition-colors flex items-center space-x-1 uppercase focus:outline-hidden cursor-pointer"
            >
              <span>SILVER COINS</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--th-accent)] transition-transform duration-200 ${activeDropdown === 'coins' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'coins' && (
              <div className="absolute top-full left-0 w-64 bg-[var(--th-card)] shadow-2xl rounded-2xl border border-[var(--th-border)] z-50 py-3 px-5 text-left animate-in fade-in slide-in-from-top-1">
                <ul className="space-y-2">
                  {DROPDOWNS.coins.map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          item.action();
                          setActiveDropdown(null);
                        }}
                        className="text-[11px] font-bold tracking-wider text-[var(--th-text-main)] hover:text-[var(--th-primary)] uppercase transition-colors text-left block w-full py-1.5 border-b border-[var(--th-border)]/30 last:border-0 cursor-pointer"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* WOMEN */}
          <div
            className="relative"
            onMouseEnter={() => {
              setIsMegaMenuOpen(false);
              setActiveDropdown('women');
            }}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              onClick={() => onNavigateCategory("women")}
              className="px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider text-[var(--th-text-main)] hover:text-[var(--th-primary)] transition-colors flex items-center space-x-1 uppercase focus:outline-hidden cursor-pointer"
            >
              <span>WOMEN</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--th-accent)] transition-transform duration-200 ${activeDropdown === 'women' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'women' && (
              <div className="absolute top-full left-0 w-64 bg-[var(--th-card)] shadow-2xl rounded-2xl border border-[var(--th-border)] z-50 py-3 px-5 text-left animate-in fade-in slide-in-from-top-1">
                <ul className="space-y-2">
                  {DROPDOWNS.women.map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          item.action();
                          setActiveDropdown(null);
                        }}
                        className="text-[11px] font-bold tracking-wider text-[var(--th-text-main)] hover:text-[var(--th-primary)] uppercase transition-colors text-left block w-full py-1.5 border-b border-[var(--th-border)]/30 last:border-0 cursor-pointer"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* MENS */}
          <div
            className="relative"
            onMouseEnter={() => {
              setIsMegaMenuOpen(false);
              setActiveDropdown('mens');
            }}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              onClick={() => onNavigateCategory("mens")}
              className="px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider text-[var(--th-text-main)] hover:text-[var(--th-primary)] transition-colors flex items-center space-x-1 uppercase focus:outline-hidden cursor-pointer"
            >
              <span>MEN</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--th-accent)] transition-transform duration-200 ${activeDropdown === 'mens' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'mens' && (
              <div className="absolute top-full left-0 w-64 bg-[var(--th-card)] shadow-2xl rounded-2xl border border-[var(--th-border)] z-50 py-3 px-5 text-left animate-in fade-in slide-in-from-top-1">
                <ul className="space-y-2">
                  {DROPDOWNS.mens.map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          item.action();
                          setActiveDropdown(null);
                        }}
                        className="text-[11px] font-bold tracking-wider text-[var(--th-text-main)] hover:text-[var(--th-primary)] uppercase transition-colors text-left block w-full py-1.5 border-b border-[var(--th-border)]/30 last:border-0 cursor-pointer"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* KIDS */}
          <div
            className="relative"
            onMouseEnter={() => {
              setIsMegaMenuOpen(false);
              setActiveDropdown('kids');
            }}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              onClick={() => onNavigateCategory("kids")}
              className="px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider text-[var(--th-text-main)] hover:text-[var(--th-primary)] transition-colors flex items-center space-x-1 uppercase focus:outline-hidden cursor-pointer"
            >
              <span>KIDS</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--th-accent)] transition-transform duration-200 ${activeDropdown === 'kids' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'kids' && (
              <div className="absolute top-full left-0 w-64 bg-[var(--th-card)] shadow-2xl rounded-2xl border border-[var(--th-border)] z-50 py-3 px-5 text-left animate-in fade-in slide-in-from-top-1">
                <ul className="space-y-2">
                  {DROPDOWNS.kids.map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          item.action();
                          setActiveDropdown(null);
                        }}
                        className="text-[11px] font-bold tracking-wider text-[var(--th-text-main)] hover:text-[var(--th-primary)] uppercase transition-colors text-left block w-full py-1.5 border-b border-[var(--th-border)]/30 last:border-0 cursor-pointer"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* DIVINE PUJA & IDOLS */}
          <div
            className="relative"
            onMouseEnter={() => {
              setIsMegaMenuOpen(false);
              setActiveDropdown('puja');
            }}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              onClick={() => onNavigateCategory("silver-religious-idols")}
              className="px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider text-[var(--th-text-main)] hover:text-[var(--th-primary)] transition-colors flex items-center space-x-1 uppercase focus:outline-hidden cursor-pointer"
            >
              <span>DIVINE PUJA</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--th-accent)] transition-transform duration-200 ${activeDropdown === 'puja' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'puja' && (
              <div className="absolute top-full left-0 w-64 bg-[var(--th-card)] shadow-2xl rounded-2xl border border-[var(--th-border)] z-50 py-3 px-5 text-left animate-in fade-in slide-in-from-top-1">
                <ul className="space-y-2">
                  {DROPDOWNS.puja.map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          item.action();
                          setActiveDropdown(null);
                        }}
                        className="text-[11px] font-bold tracking-wider text-[var(--th-text-main)] hover:text-[var(--th-primary)] uppercase transition-colors text-left block w-full py-1.5 border-b border-[var(--th-border)]/30 last:border-0 cursor-pointer"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* GIFTS */}
          <div
            className="relative"
            onMouseEnter={() => {
              setIsMegaMenuOpen(false);
              setActiveDropdown('gifts');
            }}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              onClick={onNavigateYatraCustomizer}
              className="px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider text-[var(--th-text-main)] hover:text-[var(--th-primary)] transition-colors flex items-center space-x-1 uppercase focus:outline-hidden cursor-pointer"
            >
              <span>GIFTS</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--th-accent)] transition-transform duration-200 ${activeDropdown === 'gifts' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'gifts' && (
              <div className="absolute top-full right-0 w-64 bg-[var(--th-card)] shadow-2xl rounded-2xl border border-[var(--th-border)] z-50 py-3 px-5 text-left animate-in fade-in slide-in-from-top-1">
                <ul className="space-y-2">
                  {DROPDOWNS.gifts.map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          item.action();
                          setActiveDropdown(null);
                        }}
                        className="text-[11px] font-bold tracking-wider text-[var(--th-text-main)] hover:text-[var(--th-primary)] uppercase transition-colors text-left block w-full py-1.5 border-b border-[var(--th-border)]/30 last:border-0 cursor-pointer"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* UNIFIED CUSTOM & BESPOKE STUDIO */}
          <button
            onClick={() => navigate('/customize')}
            className="px-3.5 py-1.5 text-xs xl:text-[13px] font-extrabold tracking-wider text-[#D4AF37] hover:text-black bg-[#D4AF37]/10 hover:bg-[#D4AF37] border border-[#D4AF37]/40 rounded-full transition-all flex items-center space-x-1.5 uppercase cursor-pointer shadow-2xs group"
            title="Custom Orders: Yatra Lockets, Mukhut, Jhalar, Thakurji ka Saman & Temple Things"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] group-hover:text-black transition-colors" />
            <span>CUSTOMIZE </span>
          </button>

        </nav>
      </div>

      {/* MegaMenu Dropdown */}
      {isMegaMenuOpen && (
        <MegaMenu
          categories={categories}
          onSelectCategory={onNavigateCategory}
          onSelectSubcategory={onNavigateSubcategory}
          onClose={() => setIsMegaMenuOpen(false)}
        />
      )}

      {/* Flagship Stores Modal */}
      <StoresModal
        isOpen={isStoresModalOpen}
        onClose={() => setIsStoresModalOpen(false)}
      />
    </header>
  );
}
