import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../data/products';
import { X, ChevronRight, ChevronDown, Sparkles, Phone, ShieldCheck, User } from 'lucide-react';

export default function MobileMenu({
  isOpen,
  onClose,
  categories,
  onSelectCategory,
  onSelectSubcategory,
  onNavigateYatraCustomizer
}) {
  const [expandedCat, setExpandedCat] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const categoryList = (categories && categories.length > 0) ? categories : CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-left duration-300">
        <div>
          {/* Mobile Header */}
          <div className="p-4 border-b border-silver-200 flex items-center justify-between bg-silver-50">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <span className="font-serif text-lg font-bold text-[#1A1A1A]">SILVERHOUSE</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-silver-600 hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Bar in Mobile Menu */}
          <div className="p-3 bg-amber-50/50 border-b border-amber-200/50">
            {isAuthenticated && user ? (
              <button
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="w-full flex items-center space-x-3 text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full bg-[#1A1A1A] text-white font-bold text-xs flex items-center justify-center border border-[#D4AF37] shrink-0 shadow-xs">
                  {user.fullName ? user.fullName.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SH'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1A1A1A] truncate group-hover:text-[#D4AF37] transition-colors">
                    {user.fullName || 'Valued Patron'}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium truncate">
                    Logged in • View profile →
                  </p>
                </div>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="w-full py-2 px-3 rounded-lg bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-xs hover:bg-[#333333] transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>

          {/* Quick Highlight Banner */}
          <div className="p-4 bg-linear-to-r from-[#1A1A1A] to-[#333333] text-white">
            <button
              onClick={() => {
                onNavigateYatraCustomizer();
                onClose();
              }}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Special Feature</span>
                <span className="text-[10px] bg-[#D4AF37] text-black px-2 py-0.5 rounded font-bold">New</span>
              </div>
              <p className="text-sm font-semibold mt-1">Custom Yatra Lockets</p>
              <p className="text-xs text-silver-300">Design your shrine pendant on order →</p>
            </button>
          </div>

          {/* Categories Accordions */}
          <div className="p-4">
            <p className="text-xs font-bold text-silver-400 uppercase tracking-wider mb-2">
              Product Categories
            </p>
            <div className="space-y-1">
              {categoryList.map((cat) => {
                const isExpanded = expandedCat === cat.id;
                return (
                  <div key={cat.id} className="border-b border-silver-100 last:border-none">
                    <button
                      onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                      className="w-full py-3 text-left font-medium text-sm text-[#1A1A1A] flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                      <ChevronDown className={`w-4 h-4 text-silver-400 transition-transform ${isExpanded ? 'rotate-180 text-[#D4AF37]' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="pl-4 pb-3 space-y-2 bg-silver-50 rounded-lg p-2 my-1">
                        <button
                          onClick={() => {
                            onSelectCategory(cat.id);
                            onClose();
                          }}
                          className="text-xs font-semibold text-[#D4AF37] hover:underline block mb-2"
                        >
                          View All in {cat.name} →
                        </button>
                        {(cat.subcategories || []).map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              onSelectSubcategory(cat.id, sub.id);
                              onClose();
                            }}
                            className="w-full text-left text-xs text-silver-700 hover:text-black py-1 block"
                          >
                            • {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-silver-50 border-t border-silver-200 text-xs text-silver-600 space-y-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>100% BIS Hallmarked Silver</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-silver-500" />
            <span>Support: +91 98765 43210</span>
          </div>
        </div>
      </div>
    </div>
  );
}
