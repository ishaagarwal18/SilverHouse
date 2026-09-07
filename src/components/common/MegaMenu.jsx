import React, { useState } from 'react';
import { CATEGORIES } from '../../data/products';
import { ChevronRight, Sparkles, Shield, Gift, ArrowRight } from 'lucide-react';

export default function MegaMenu({ categories, onSelectCategory, onSelectSubcategory, onClose }) {
  const categoryList = (categories && categories.length > 0) ? categories : CATEGORIES;
  const [activeTab, setActiveTab] = useState(categoryList[0].id);

  const activeCategory = categoryList.find(c => c.id === activeTab) || categoryList[0];

  return (
    <div
      className="absolute top-full left-0 w-full bg-[#F8F4EC] border-b-2 border-[#D4AF37]/50 shadow-2xl z-50 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
      onMouseLeave={onClose}
    >
      <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12 flex min-h-[380px]">
        {/* Left Vertical Categories List */}
        <div className="w-1/4 border-r border-[#C5B299] bg-[#DFD4C0] py-5">
          <p className="px-6 py-2 text-[10px] font-bold tracking-widest text-[#4E6073] uppercase">
            Explore Sacred Collections
          </p>
          <ul className="mt-1 space-y-1">
            {categoryList.map((cat) => {
              const isActive = cat.id === activeTab;
              return (
                <li key={cat.id}>
                  <button
                    onMouseEnter={() => setActiveTab(cat.id)}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      onClose();
                    }}
                    className={`w-full px-6 py-3 text-left font-medium text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#F8F4EC] text-[#0B2545] font-bold border-l-4 border-[#0B2545] shadow-xs'
                        : 'text-[#071526] hover:text-[#0B2545] hover:bg-[#EAE2D5]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-[#9A650C] translate-x-1' : 'text-[#8A9AA8]'}`} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Content Area for Active Category */}
        <div className="w-3/4 p-8 flex justify-between gap-8 bg-[#F8F4EC]">
          {/* Subcategories Column */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 border-b border-[#C5B299] pb-3 mb-6">
              <h3 className="font-serif text-2xl font-bold text-[#071526]">
                {activeCategory?.name}
              </h3>
              <span className="bg-[#9A650C]/15 text-[#9A650C] border border-[#9A650C]/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                100% BIS Certified
              </span>
            </div>

            <p className="text-xs text-[#4E6073] mb-6 font-normal">
              {activeCategory?.description}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {(activeCategory?.subcategories || []).map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    onSelectSubcategory(activeCategory.id, sub.id);
                    onClose();
                  }}
                  className="group p-3.5 rounded-xl border border-[#C5B299] bg-[#F8F4EC] hover:border-[#9A650C] hover:bg-[#EAE2D5] hover:shadow-md transition-all text-left flex flex-col justify-between cursor-pointer"
                >
                  <span className="text-sm font-semibold text-[#071526] group-hover:text-[#0B2545] transition-colors">
                    {sub.name}
                  </span>
                  <span className="mt-2 text-[11px] text-[#4E6073] flex items-center group-hover:translate-x-1 group-hover:text-[#9A650C] transition-all">
                    Explore Collection <ArrowRight className="w-3 h-3 ml-1 text-[#9A650C]" />
                  </span>
                </button>
              ))}
            </div>

            {/* Purity Guarantee Badge Pill */}
            <div className="mt-8 pt-4 border-t border-[#C5B299] flex items-center space-x-6 text-xs text-[#4E6073]">
              <div className="flex items-center space-x-1.5">
                <Shield className="w-4 h-4 text-[#9A650C]" />
                <span>999 Pure & 925 Sterling Certified</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-[#9A650C]" />
                <span>Tamper-Proof Blister Packaging</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Gift className="w-4 h-4 text-[#9A650C]" />
                <span>Custom Laser Engravings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
