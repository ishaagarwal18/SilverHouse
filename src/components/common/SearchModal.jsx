import React, { useState } from 'react';
import { PRODUCTS } from '../../data/products';
import { Search, X, Sparkles, ArrowRight, Shield } from 'lucide-react';

export default function SearchModal({ isOpen, products, onClose, onSelectProduct, onNavigateCategory }) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const productList = (products && products.length > 0) ? products : PRODUCTS;
  const results = query.trim() === '' 
    ? [] 
    : productList.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.purity.toLowerCase().includes(query.toLowerCase()) ||
        p.shortDesc.toLowerCase().includes(query.toLowerCase())
      );

  const POPULAR_SEARCHES = ["Lakshmi Ganesha Coin", "Baby Nazariya", "Rudraksha Mala", "Yatra Locket", "Silver Thali Set", "999 Silver Bar"];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Search Modal Box */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-silver-200 flex items-center space-x-3 bg-silver-50">
          <Search className="w-5 h-5 text-[#D4AF37]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 925 Silver, Murti, Coins, Rudraksha, Nazariya..."
            className="flex-1 bg-transparent border-none text-base text-[#1A1A1A] placeholder-silver-400 focus:outline-hidden"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-silver-400 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-xs font-semibold px-2 py-1 bg-silver-200 rounded text-silver-700 hover:text-black">
            ESC
          </button>
        </div>

        {/* Search Results / Suggestions */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {query.trim() === '' ? (
            <div>
              <p className="text-xs font-bold text-silver-500 uppercase tracking-wider mb-3">
                Popular Sacred Searches
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3.5 py-1.5 rounded-full bg-silver-100 hover:bg-[#D4AF37] hover:text-black text-xs text-silver-800 transition-colors flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-silver-50 border border-silver-200 flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">Looking for Custom Yatra Lockets?</h4>
                  <p className="text-xs text-silver-600">Personalize shrine photo & family name engraving on 925 silver.</p>
                </div>
                <button
                  onClick={() => {
                    onNavigateCategory("custom-gifting");
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-[#1A1A1A] text-white text-xs font-semibold rounded hover:bg-[#D4AF37] hover:text-black transition-colors"
                >
                  Design Locket →
                </button>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <p className="text-xs font-bold text-silver-500 uppercase tracking-wider">
                Found {results.length} Sacred Artifacts
              </p>
              <div className="grid grid-cols-1 gap-3">
                {results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="group p-3 rounded-xl border border-silver-100 hover:border-[#D4AF37] hover:bg-silver-50/80 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-14 h-14 object-cover rounded-lg border border-silver-200"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-[#AA820A] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full inline-block mb-1">
                          {product.purity}
                        </span>
                        <h4 className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#AA820A] transition-colors line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-xs text-silver-500">Weight: {product.weightGrams}g</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-[#1A1A1A] font-outfit tracking-tight">₹{product.price.toLocaleString('en-IN')}</p>
                      {product.originalPrice && (
                        <p className="text-xs text-silver-400 line-through font-outfit">₹{product.originalPrice.toLocaleString('en-IN')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="w-10 h-10 text-silver-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-silver-700">No silver artifacts match "{query}"</p>
              <p className="text-xs text-silver-500 mt-1">Try searching for "Coins", "Ganesha", "Nazariya", or "Rudraksha".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
