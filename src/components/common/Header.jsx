import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MegaMenu from './MegaMenu';
import { useAuth } from '../../context/AuthContext';
import { Search, Heart, ShoppingBag, User, Menu, Sparkles, ChevronDown, LogOut, Building2, Store, MapPin } from 'lucide-react';
import StoresModal from './StoresModal';

export default function Header({
  cartCount = 0,
  wishlistCount = 0,
  categories = [],
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
  const [pincode, setPincode] = useState('110001');
  const [isPincodeEditing, setIsPincodeEditing] = useState(false);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const DROPDOWNS = {
    jewellery: [
      { label: "VIEW ALL JEWELLERY", action: () => onNavigateCategory("jewellery") },
      { label: "SILVER RINGS", action: () => onNavigateCategory("silver-rings") },
      { label: "SILVER PENDANTS & CHAINS", action: () => onNavigateCategory("silver-pendants-chains") },
      { label: "SILVER BANGLES & KADAS", action: () => onNavigateCategory("silver-bangles-kadas") },
      { label: "SILVER PAYAL & ANKLETS", action: () => onNavigateCategory("silver-payal-anklets") },
      { label: "SILVER RELIGIOUS IDOLS", action: () => onNavigateCategory("silver-religious-idols") }
    ],
    coins: [
      { label: "VIEW ALL COINS & BARS", action: () => onNavigateCategory("silver-coins-bars") },
      { label: "PURE 999 FINE BULLION", action: () => onNavigateCategory("silver-coins-bars") },
      { label: "LOTUS TEMPLE SILVER COINS", action: () => onNavigateCategory("silver-coins-bars") },
      { label: "LAKSHMI GANESHA COINS", action: () => onNavigateCategory("silver-coins-bars") }
    ],
    women: [
      { label: "VIEW ALL WOMEN", action: () => onNavigateCategory("women") },
      { label: "SOLITAIRE & STATEMENT RINGS", action: () => onNavigateCategory("silver-rings") },
      { label: "OXIDISED CHOKERS & CHAINS", action: () => onNavigateCategory("silver-pendants-chains") },
      { label: "TRADITIONAL GHUNGROO PAYAL", action: () => onNavigateCategory("silver-payal-anklets") },
      { label: "TEMPLE WORK BANGLES", action: () => onNavigateCategory("silver-bangles-kadas") }
    ],
    mens: [
      { label: "VIEW ALL MEN COLLECTION", action: () => onNavigateCategory("mens") },
      { label: "ROYAL SOLID SILVER KADA", action: () => onNavigateCategory("men-silver-collection") },
      { label: "HEAVY CUBAN CURB CHAINS", action: () => onNavigateCategory("men-silver-collection") },
      { label: "MEN'S SIGNET RINGS", action: () => onNavigateCategory("silver-rings") }
    ],
    kids: [
      { label: "VIEW ALL KIDS COLLECTION", action: () => onNavigateCategory("kids") },
      { label: "EVIL EYE BABY NAZARIYA", action: () => onNavigateCategory("kids-nazariya-bracelets") },
      { label: "INFANT SILVER FEEDING BOWLS", action: () => onNavigateCategory("all") },
      { label: "JINGLING SILVER GHUNGROO PAYAL", action: () => onNavigateCategory("silver-payal-anklets") }
    ],
    puja: [
      { label: "ALL DIVINE ARTIFACTS", action: () => onNavigateCategory("silver-religious-idols") },
      { label: "KAMDHENU COW & CALF IDOL", action: () => onNavigateCategory("silver-religious-idols") },
      { label: "RADHA KRISHNA & BAL GOPAL", action: () => onNavigateCategory("silver-religious-idols") },
      { label: "POOJA THALI & DIYA SETS", action: () => onNavigateCategory("all") }
    ],
    gifts: [
      { label: "ALL SACRED GIFTS", action: () => onNavigateCategory("all") },
      { label: "CUSTOM YATRA SHRINE LOCKETS", action: onNavigateYatraCustomizer },
      { label: "SILVER COINS & BARS", action: () => onNavigateCategory("silver-coins-bars") },
      { label: "CORPORATE BULLION GIFTS", action: () => onNavigateCategory("silver-coins-bars") }
    ]
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF5EB]/95 backdrop-blur-md border-b border-[#E5DAC4] shadow-[0_4px_20px_rgba(74,7,17,0.05)] transition-colors">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Navbar Row */}
        <div className="flex items-center justify-between h-20 gap-4">

          {/* Left: Mobile Menu Trigger + Brand Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenMobileMenu}
              className="p-2 text-[#4A0711] hover:bg-[#EFE7D8] rounded-xl lg:hidden focus:outline-hidden cursor-pointer"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Brand Logo (SILVERHOUSE) */}
            <button
              onClick={onNavigateHome}
              className="group text-left flex items-center space-x-3 focus:outline-hidden cursor-pointer shrink-0"
            >
              {/* Opulent Royal Circular Crest */}
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#4A0711] via-[#600814] to-[#2D0207] border-2 border-[#D4AF37] flex items-center justify-center shadow-md group-hover:scale-105 transition-all duration-300">
                <Sparkles className="w-5 h-5 text-[#F3E5AB] drop-shadow-sm animate-pulse" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-baseline space-x-1">
                  <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-wider text-[#4A0711] group-hover:text-[#600814] transition-colors drop-shadow-2xs">
                    SILVER<span className="text-[#AA820A] font-light">HOUSE</span>
                  </span>
                </div>
                <span className="block text-[8.5px] font-bold tracking-[0.24em] text-[#7A5844] uppercase -mt-0.5">
                  Fine Artisanal Sterling 925 & 999 Pure
                </span>
              </div>
            </button>
          </div>

          {/* Center: Integrated Luxury Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md lg:max-w-lg xl:max-w-xl mx-2">
            <div 
              onClick={onOpenSearch}
              className="w-full h-10 px-4 rounded-full bg-[#FFFDF9] border border-[#DFCBB5] hover:border-[#AA820A] shadow-inner flex items-center justify-between cursor-pointer transition-all duration-200 group"
            >
              <div className="flex items-center space-x-2.5 text-xs text-[#8A766B] group-hover:text-[#4A0711] truncate">
                <Search className="w-4 h-4 text-[#AA820A] shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">Search 925 rings, pooja thalis, 999 coins, evil eye...</span>
              </div>

              <span className="hidden xl:inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#FAF5EB] text-[#7A5844] border border-[#E5DAC4] shrink-0">
                Live Catalog
              </span>
            </div>
          </div>

          {/* Right Action Utilities (Pincode, Stores, Account, Wishlist, Cart) */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Delivery Pincode Pill (Desktop) */}
            <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#F3ECE0] border border-[#DFCBB5] text-xs text-[#4A0711]">
              <MapPin className="w-3.5 h-3.5 text-[#AA820A] shrink-0" />
              {isPincodeEditing ? (
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  onBlur={() => setIsPincodeEditing(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsPincodeEditing(false)}
                  autoFocus
                  className="w-14 text-xs font-bold bg-white px-1 py-0.5 rounded border border-[#AA820A] outline-hidden text-[#4A0711]"
                />
              ) : (
                <span 
                  onClick={() => setIsPincodeEditing(true)}
                  className="cursor-pointer hover:underline font-semibold"
                  title="Click to change pincode"
                >
                  Deliver to: <strong className="text-[#600814]">{pincode}</strong>
                </span>
              )}
            </div>

            {/* Stores Locator Trigger */}
            <button
              onClick={() => setIsStoresModalOpen(true)}
              className="p-2 text-[#4A0711] hover:bg-[#F3ECE0] rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer group"
              title="Flagship Stores"
            >
              <Store className="w-5 h-5 text-[#AA820A] group-hover:scale-110 transition-transform" />
              <span className="hidden lg:inline-block text-xs font-bold uppercase tracking-wider text-[#4A0711]">
                Stores
              </span>
            </button>

            {/* Mobile Search Button (Visible on phones) */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#4A0711] hover:bg-[#F3ECE0] rounded-xl transition-all md:hidden cursor-pointer"
              title="Search products"
            >
              <Search className="w-5 h-5 text-[#AA820A]" />
            </button>

            {/* User Account & Profile Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1.5 p-1 rounded-full hover:bg-[#F3ECE0] transition-colors focus:outline-hidden cursor-pointer"
                  title={user.fullName || 'User Profile'}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4A0711] to-[#AA820A] text-[#F3E5AB] font-bold text-xs flex items-center justify-center shadow-xs border border-[#D4AF37]/50">
                    {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SH'}
                  </div>
                  {isAdmin && (
                    <span className="hidden xl:inline-block text-[10px] font-bold bg-[#D4AF37] text-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      ADMIN
                    </span>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="p-2 text-[#4A0711] hover:bg-[#F3ECE0] rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer group"
                  title="Sign In / Register"
                >
                  <User className="w-5 h-5 text-[#AA820A] group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-[#4A0711]">
                    Account
                  </span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {isAuthenticated && isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#FFFDF9] rounded-2xl shadow-2xl border border-[#DFCBB5] p-4 z-50 animate-in fade-in slide-in-from-top-2 text-left">
                  <div className="pb-3 border-b border-[#EADBCE] mb-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#4A0711] truncate">{user.fullName || 'User'}</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${isAdmin ? 'bg-[#D4AF37] text-black' : 'bg-[#F3ECE0] text-[#4A0711]'}`}>
                        {user.role || 'CUSTOMER'}
                      </span>
                    </div>
                    <p className="text-xs text-[#8A766B] truncate mt-0.5">{user.email}</p>
                  </div>

                  <div className="space-y-1">
                    {isAdmin && (
                      <a
                        href="http://localhost:5000/admin"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-left px-3 py-2 text-xs font-bold text-[#4A0711] hover:bg-[#F3ECE0] rounded-xl flex items-center space-x-2 transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-[#AA820A]" />
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
              className="p-2 text-[#4A0711] hover:bg-[#F3ECE0] rounded-xl transition-all relative group cursor-pointer"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5 text-[#AA820A] group-hover:scale-110 transition-transform" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#600814] text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs border border-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag / Cart Trigger with Gold Ring */}
            <button
              onClick={onOpenCart}
              className="px-3 py-2 bg-gradient-to-r from-[#4A0711] to-[#600814] hover:from-[#600814] hover:to-[#7D0C1D] text-white rounded-full transition-all relative flex items-center space-x-1.5 shadow-md hover:shadow-lg cursor-pointer group"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#F3E5AB] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Cart
              </span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#D4AF37] text-black font-extrabold text-[10px] leading-tight">
                {cartCount}
              </span>
            </button>

          </div>
        </div>

        {/* Secondary Row: Desktop Category Navigation Links */}
        <nav className="hidden lg:flex items-center justify-center space-x-2 xl:space-x-4 border-t border-[#EADBCE]/80 py-2.5">
          
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
              className="px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider text-[#4A0711] hover:text-[#AA820A] transition-colors flex items-center space-x-1 uppercase focus:outline-hidden cursor-pointer"
            >
              <span>SHOP ALL</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#AA820A] transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
            </button>
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
              className="px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider text-[#4A0711] hover:text-[#AA820A] transition-colors flex items-center space-x-1 uppercase focus:outline-hidden cursor-pointer"
            >
              <span>SILVER JEWELLERY</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#AA820A] transition-transform duration-200 ${activeDropdown === 'jewellery' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'jewellery' && (
              <div className="absolute top-full left-0 w-64 bg-[#FFFDF9] shadow-2xl rounded-2xl border border-[#DFCBB5] z-50 py-3 px-5 text-left animate-in fade-in slide-in-from-top-1">
                <ul className="space-y-2">
                  {DROPDOWNS.jewellery.map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          item.action();
                          setActiveDropdown(null);
                        }}
                        className="text-[11px] font-bold tracking-wider text-[#4A0711] hover:text-[#AA820A] uppercase transition-colors text-left block w-full py-1.5 border-b border-[#F0E6D6] last:border-0 cursor-pointer"
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
              className="px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider text-[#4A0711] hover:text-[#AA820A] transition-colors flex items-center space-x-1 uppercase focus:outline-hidden cursor-pointer"
            >
              <span>SILVER COINS</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#AA820A] transition-transform duration-200 ${activeDropdown === 'coins' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'coins' && (
              <div className="absolute top-full left-0 w-64 bg-[#FFFDF9] shadow-2xl rounded-2xl border border-[#DFCBB5] z-50 py-3 px-5 text-left animate-in fade-in slide-in-from-top-1">
                <ul className="space-y-2">
                  {DROPDOWNS.coins.map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          item.action();
                          setActiveDropdown(null);
                        }}
                        className="text-[11px] font-bold tracking-wider text-[#4A0711] hover:text-[#AA820A] uppercase transition-colors text-left block w-full py-1.5 border-b border-[#F0E6D6] last:border-0 cursor-pointer"
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
              className="px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider text-[#4A0711] hover:text-[#AA820A] transition-colors flex items-center space-x-1 uppercase focus:outline-hidden cursor-pointer"
            >
              <span>WOMEN</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#AA820A] transition-transform duration-200 ${activeDropdown === 'women' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'women' && (
              <div className="absolute top-full left-0 w-64 bg-[#FFFDF9] shadow-2xl rounded-2xl border border-[#DFCBB5] z-50 py-3 px-5 text-left animate-in fade-in slide-in-from-top-1">
                <ul className="space-y-2">
                  {DROPDOWNS.women.map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          item.action();
                          setActiveDropdown(null);
                        }}
                        className="text-[11px] font-bold tracking-wider text-[#4A0711] hover:text-[#AA820A] uppercase transition-colors text-left block w-full py-1.5 border-b border-[#F0E6D6] last:border-0 cursor-pointer"
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
              className="px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider text-[#4A0711] hover:text-[#AA820A] transition-colors flex items-center space-x-1 uppercase focus:outline-hidden cursor-pointer"
            >
              <span>MEN</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#AA820A] transition-transform duration-200 ${activeDropdown === 'mens' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'mens' && (
              <div className="absolute top-full left-0 w-64 bg-[#FFFDF9] shadow-2xl rounded-2xl border border-[#DFCBB5] z-50 py-3 px-5 text-left animate-in fade-in slide-in-from-top-1">
                <ul className="space-y-2">
                  {DROPDOWNS.mens.map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          item.action();
                          setActiveDropdown(null);
                        }}
                        className="text-[11px] font-bold tracking-wider text-[#4A0711] hover:text-[#AA820A] uppercase transition-colors text-left block w-full py-1.5 border-b border-[#F0E6D6] last:border-0 cursor-pointer"
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
              className="px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider text-[#4A0711] hover:text-[#AA820A] transition-colors flex items-center space-x-1 uppercase focus:outline-hidden cursor-pointer"
            >
              <span>KIDS</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#AA820A] transition-transform duration-200 ${activeDropdown === 'kids' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'kids' && (
              <div className="absolute top-full left-0 w-64 bg-[#FFFDF9] shadow-2xl rounded-2xl border border-[#DFCBB5] z-50 py-3 px-5 text-left animate-in fade-in slide-in-from-top-1">
                <ul className="space-y-2">
                  {DROPDOWNS.kids.map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          item.action();
                          setActiveDropdown(null);
                        }}
                        className="text-[11px] font-bold tracking-wider text-[#4A0711] hover:text-[#AA820A] uppercase transition-colors text-left block w-full py-1.5 border-b border-[#F0E6D6] last:border-0 cursor-pointer"
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
              className="px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider text-[#4A0711] hover:text-[#AA820A] transition-colors flex items-center space-x-1 uppercase focus:outline-hidden cursor-pointer"
            >
              <span>DIVINE PUJA</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#AA820A] transition-transform duration-200 ${activeDropdown === 'puja' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'puja' && (
              <div className="absolute top-full left-0 w-64 bg-[#FFFDF9] shadow-2xl rounded-2xl border border-[#DFCBB5] z-50 py-3 px-5 text-left animate-in fade-in slide-in-from-top-1">
                <ul className="space-y-2">
                  {DROPDOWNS.puja.map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          item.action();
                          setActiveDropdown(null);
                        }}
                        className="text-[11px] font-bold tracking-wider text-[#4A0711] hover:text-[#AA820A] uppercase transition-colors text-left block w-full py-1.5 border-b border-[#F0E6D6] last:border-0 cursor-pointer"
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
              className="px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider text-[#4A0711] hover:text-[#AA820A] transition-colors flex items-center space-x-1 uppercase focus:outline-hidden cursor-pointer"
            >
              <span>GIFTS</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#AA820A] transition-transform duration-200 ${activeDropdown === 'gifts' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'gifts' && (
              <div className="absolute top-full right-0 w-64 bg-[#FFFDF9] shadow-2xl rounded-2xl border border-[#DFCBB5] z-50 py-3 px-5 text-left animate-in fade-in slide-in-from-top-1">
                <ul className="space-y-2">
                  {DROPDOWNS.gifts.map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          item.action();
                          setActiveDropdown(null);
                        }}
                        className="text-[11px] font-bold tracking-wider text-[#4A0711] hover:text-[#AA820A] uppercase transition-colors text-left block w-full py-1.5 border-b border-[#F0E6D6] last:border-0 cursor-pointer"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

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
