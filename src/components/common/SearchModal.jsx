import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../../data/products';
import {
  Search, X, Sparkles, ArrowRight, ShieldCheck, Scale,
  Flame, Tag, Eye, ShoppingBag, CornerDownLeft
} from 'lucide-react';

export default function SearchModal({
  isOpen,
  products = [],
  categories = [],
  onClose,
  onSelectProduct,
  onNavigateCategory,
  onQuickView,
  onAddToCart
}) {
  const [query, setQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('all');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setSelectedFilterCategory('all');
    }
  }, [isOpen]);

  // Handle ESC and keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const productList = (products && products.length > 0) ? products : PRODUCTS;

  // Search filtering logic
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return productList.filter(p => {
      const name = (p.name || p.title || '').toLowerCase();
      const cat = (p.category || p.category_slug || '').toLowerCase();
      const purity = (p.purity || '').toLowerCase();
      const desc = (p.shortDesc || p.description || '').toLowerCase();
      const ideal = (p.ideal_for || p.recipient || '').toLowerCase();
      const color = (p.color || '').toLowerCase();

      const matchesQuery = (
        name.includes(q) ||
        cat.includes(q) ||
        purity.includes(q) ||
        desc.includes(q) ||
        ideal.includes(q) ||
        color.includes(q)
      );

      if (!matchesQuery) return false;

      // Filter by selected category pill inside search if selected
      if (selectedFilterCategory !== 'all') {
        if (selectedFilterCategory === 'under-10g') {
          const w = Number(p.weightGrams ?? (p.weight ? parseFloat(p.weight) : 0));
          return w <= 10;
        }
        return cat.includes(selectedFilterCategory) || (p.category_id && String(p.category_id) === String(selectedFilterCategory));
      }

      return true;
    });
  }, [query, productList, selectedFilterCategory]);

  // Available categories with count for the query
  const categoryFacets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const baseMatches = productList.filter(p => {
      const name = (p.name || p.title || '').toLowerCase();
      const cat = (p.category || p.category_slug || '').toLowerCase();
      const purity = (p.purity || '').toLowerCase();
      const desc = (p.shortDesc || p.description || '').toLowerCase();
      return name.includes(q) || cat.includes(q) || purity.includes(q) || desc.includes(q);
    });

    const counts = {};
    baseMatches.forEach(p => {
      const cat = p.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts).map(([cat, count]) => ({
      id: cat,
      label: cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count
    }));
  }, [query, productList]);

  // Featured recommendations when search is empty
  const trendingPieces = useMemo(() => {
    return productList.filter(p => p.isBestSeller || p.priority > 0 || (p.rating && p.rating >= 4.8)).slice(0, 4);
  }, [productList]);

  const TRENDING_KEYWORDS = [
    { label: "Solitaire Rings", query: "ring" },
    { label: "999 Silver Coins", query: "coin" },
    { label: "Bridal Payal", query: "payal" },
    { label: "Ganesha Murti", query: "ganesha" },
    { label: "Italian Curb Chain", query: "chain" },
    { label: "Baby Nazariya", query: "nazariya" },
    { label: "Puja Kalash & Diya", query: "puja" },
    { label: "Under 10g", query: "10g", isWeight: true }
  ];

  const QUICK_CATEGORIES = [
    { id: "silver-rings", label: "Rings & Bands", icon: "💍" },
    { id: "silver-pendants-chains", label: "Chains & Pendants", icon: "✨" },
    { id: "silver-bangles-kadas", label: "Bangles & Kadas", icon: "💫" },
    { id: "silver-payal-anklets", label: "Payal & Anklets", icon: "🔔" },
    { id: "silver-coins-bars", label: "Coins & Bars (999)", icon: "🪙" },
    { id: "silver-religious-idols", label: "Devotional Idols", icon: "🪔" }
  ];

  // Navigate to full catalog with search query
  const handleViewAllInCatalog = (searchString) => {
    const term = searchString !== undefined ? searchString : query;
    onClose();
    if (term.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(term.trim())}`);
    } else {
      navigate('/catalog');
    }
  };

  const handleSelectSearchKeyword = (keywordObj) => {
    if (keywordObj.isWeight) {
      onClose();
      navigate('/catalog?minWeight=0&maxWeight=10');
      return;
    }
    setQuery(keywordObj.query);
  };

  const handleProductClick = (product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      navigate(`/product/${product.id}`);
    }
    onClose();
  };

  const handleCategoryShortcutClick = (catId) => {
    onClose();
    if (onNavigateCategory) {
      onNavigateCategory(catId);
    } else {
      navigate(`/category/${catId}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-14 px-3 sm:px-6">
      {/* Dimmed Blur Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Main Luxury Search Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Pure Silver Catalog"
        className="relative w-full max-w-3xl bg-[var(--th-surface)] rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-[var(--th-border)] overflow-hidden z-10 flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200 transition-colors"
      >
        {/* Top Input Bar */}
        <div className="p-4 sm:p-5 bg-[var(--th-card)] border-b border-[var(--th-border)]">
          <div className="relative flex items-center">
            {/* Search Icon Badge */}
            <div className="w-10 h-10 rounded-full bg-[var(--th-primary-light)] flex items-center justify-center text-[var(--th-accent)] shrink-0 mr-3 border border-[var(--th-accent)]/30">
              <Search className="w-5 h-5 text-[var(--th-accent)]" />
            </div>

            {/* Main Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedFilterCategory('all');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleViewAllInCatalog();
                }
              }}
              placeholder="Search 925 sterling rings, 999 coins, payal, puja murti..."
              className="flex-1 bg-transparent border-none text-base sm:text-lg font-serif font-medium text-[var(--th-text-main)] placeholder-[var(--th-text-muted)] focus:outline-hidden"
            />

            {/* Clear Input Button */}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1.5 rounded-full hover:bg-[var(--th-primary-light)] text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] transition-colors mr-2 cursor-pointer"
                title="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Enter Shortcut Badge (Desktop) */}
            {query.trim() && (
              <button
                type="button"
                onClick={() => handleViewAllInCatalog()}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer mr-2"
                title="Search and view in catalog"
              >
                <span>Search</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 text-xs font-bold bg-[var(--th-surface-alt)] hover:bg-[var(--th-border)] text-[var(--th-text-main)] rounded-lg transition-colors border border-[var(--th-border)] cursor-pointer"
              title="Close modal (Escape)"
            >
              ESC
            </button>
          </div>

          {/* Category Filter Pills (When search query is active) */}
          {query.trim() !== '' && categoryFacets.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto pt-3 mt-2 border-t border-[var(--th-border-subtle)] text-xs scrollbar-none">
              <span className="text-[11px] font-bold text-[var(--th-text-muted)] uppercase tracking-wider shrink-0 mr-1">
                Filter by:
              </span>
              <button
                type="button"
                onClick={() => setSelectedFilterCategory('all')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedFilterCategory === 'all'
                    ? 'bg-[var(--th-primary)] text-white shadow-xs'
                    : 'bg-[var(--th-surface-alt)] text-[var(--th-text-main)] hover:bg-[var(--th-border)]'
                }`}
              >
                All Results ({productList.filter(p => (p.name || '').toLowerCase().includes(query.toLowerCase())).length})
              </button>
              {categoryFacets.map(facet => (
                <button
                  key={facet.id}
                  type="button"
                  onClick={() => setSelectedFilterCategory(facet.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedFilterCategory === facet.id
                      ? 'bg-[var(--th-primary)] text-white shadow-xs'
                      : 'bg-[var(--th-surface-alt)] text-[var(--th-text-main)] hover:bg-[var(--th-border)]'
                  }`}
                >
                  {facet.label} ({facet.count})
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedFilterCategory('under-10g')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedFilterCategory === 'under-10g'
                    ? 'bg-[var(--th-primary)] text-white shadow-xs'
                    : 'bg-[var(--th-surface-alt)] text-[var(--th-text-main)] hover:bg-[var(--th-border)]'
                }`}
              >
                Under 10g
              </button>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {query.trim() === '' ? (
            /* EMPTY QUERY: Popular Searches, Quick Categories & Curated Recommendations */
            <div className="space-y-6">
              {/* Trending Searches */}
              <div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[var(--th-accent)] uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--th-accent)]" />
                  <span>Trending Silver Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_KEYWORDS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSearchKeyword(item)}
                      className="px-3.5 py-1.5 rounded-full bg-[var(--th-surface-alt)] hover:bg-[var(--th-primary)] hover:text-white text-xs font-semibold text-[var(--th-text-main)] transition-all flex items-center space-x-1.5 border border-[var(--th-border)] cursor-pointer group shadow-2xs"
                    >
                      <Search className="w-3 h-3 text-[var(--th-accent)] group-hover:text-white transition-colors" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Category Jump Icons */}
              <div>
                <p className="text-xs font-bold text-[var(--th-text-muted)] uppercase tracking-wider mb-3">
                  Explore by Category
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {QUICK_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryShortcutClick(cat.id)}
                      className="p-3 rounded-xl bg-[var(--th-card)] hover:bg-[var(--th-primary-light)] border border-[var(--th-border)] hover:border-[var(--th-accent)] text-left flex items-center space-x-3 transition-all cursor-pointer group"
                    >
                      <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                        {cat.icon}
                      </span>
                      <span className="text-xs font-bold text-[var(--th-text-main)] group-hover:text-[var(--th-primary)] transition-colors line-clamp-1">
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Curated Bestsellers Showcase */}
              {trendingPieces.length > 0 && (
                <div className="pt-2 border-t border-[var(--th-border-subtle)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[var(--th-text-muted)] uppercase tracking-wider flex items-center space-x-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>Most Popular Hallmarked Pieces</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleViewAllInCatalog('')}
                      className="text-xs font-bold text-[var(--th-primary)] hover:underline cursor-pointer"
                    >
                      Browse All Catalog »
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {trendingPieces.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className="group p-2.5 rounded-xl border border-[var(--th-border)] hover:border-[var(--th-accent)] bg-[var(--th-card)] hover:bg-[var(--th-surface-alt)] transition-all flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={product.images && product.images[0] ? product.images[0] : '/images/placeholder.svg'}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover border border-[var(--th-border)] shrink-0 group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-[var(--th-text-main)] group-hover:text-[var(--th-primary)] transition-colors truncate">
                              {product.name}
                            </h5>
                            <p className="text-[11px] text-[var(--th-text-muted)] flex items-center gap-1.5 mt-0.5">
                              <span>{product.purity || '925 Silver'}</span>
                              <span>•</span>
                              <span>{product.weightGrams ? `${product.weightGrams}g` : '10g'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <p className="text-xs font-extrabold text-[var(--th-text-main)] font-outfit">
                            ₹{product.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : filteredResults.length > 0 ? (
            /* RESULTS ACTIVE: High-density luxury product cards */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[var(--th-text-muted)] uppercase tracking-wider">
                  Found <strong className="text-[var(--th-text-main)]">{filteredResults.length}</strong> Matching Pieces
                </p>
                <button
                  type="button"
                  onClick={() => handleViewAllInCatalog()}
                  className="text-xs font-bold text-[var(--th-primary)] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>View all in Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Responsive Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredResults.map((product) => {
                  const discountPct = product.discount && Number(product.discount) > 0
                    ? Number(product.discount)
                    : (product.originalPrice && product.originalPrice > product.price
                      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                      : null);

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="group relative p-3 rounded-2xl border border-[var(--th-border)] hover:border-[var(--th-accent)] bg-[var(--th-card)] hover:bg-[var(--th-surface-alt)] shadow-xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[var(--th-border)] shrink-0 bg-white">
                          <img
                            src={product.images && product.images[0] ? product.images[0] : '/images/placeholder.svg'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                          />
                          {discountPct && (
                            <span className="absolute top-1 left-1 bg-rose-600 text-white text-[8.5px] font-extrabold px-1 rounded-sm">
                              -{discountPct}%
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 pr-2">
                          {/* Purity & Weight Tag */}
                          <div className="flex items-center space-x-1.5 text-[9.5px] font-bold uppercase tracking-wider mb-1">
                            <span className="text-[var(--th-accent)] bg-[var(--th-accent-light)] px-1.5 py-0.5 rounded-sm">
                              {product.purity || (product.purityCode === '999' ? '999 Pure' : '925 Sterling')}
                            </span>
                            {product.weightGrams && (
                              <span className="text-[var(--th-text-muted)] flex items-center gap-0.5">
                                <Scale className="w-2.5 h-2.5 text-[var(--th-accent)]" />
                                {product.weightGrams}g
                              </span>
                            )}
                          </div>

                          {/* Product Title */}
                          <h4 className="text-xs sm:text-sm font-semibold text-[var(--th-text-main)] group-hover:text-[var(--th-primary)] transition-colors line-clamp-1">
                            {product.name}
                          </h4>

                          {/* Category Subtext */}
                          <p className="text-[11px] text-[var(--th-text-muted)] capitalize truncate mt-0.5">
                            {(product.category || '').replace(/-/g, ' ')}
                          </p>
                        </div>
                      </div>

                      {/* Pricing & Arrow */}
                      <div className="text-right shrink-0 pl-2 flex flex-col items-end">
                        <p className="text-xs sm:text-sm font-extrabold text-[var(--th-text-main)] font-outfit">
                          ₹{product.price.toLocaleString('en-IN')}
                        </p>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="text-[10px] text-[var(--th-text-muted)] line-through font-outfit">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </p>
                        )}
                        <span className="text-[10px] font-bold text-[var(--th-primary)] group-hover:text-[var(--th-accent)] transition-colors flex items-center gap-0.5 mt-1">
                          <span>View</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* NO RESULTS STATE */
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-[var(--th-primary-light)] text-[var(--th-accent)] flex items-center justify-center mx-auto mb-4 border border-[var(--th-accent)]/30">
                <Search className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[var(--th-text-main)] mb-1">
                No silver pieces found for "{query}"
              </h4>
              <p className="text-xs text-[var(--th-text-muted)] max-w-md mx-auto mb-6">
                We couldn't find an exact match. Try searching for broader terms like "Ring", "Payal", "Silver Coin", "Idol", or browse our curated catalog.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                {TRENDING_KEYWORDS.slice(0, 5).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchKeyword(item)}
                    className="px-3 py-1 bg-[var(--th-surface-alt)] hover:bg-[var(--th-primary)] hover:text-white text-xs font-semibold text-[var(--th-text-main)] rounded-full transition-colors border border-[var(--th-border)] cursor-pointer"
                  >
                    Try "{item.label}"
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleViewAllInCatalog('')}
                className="px-6 py-2.5 rounded-full bg-[var(--th-primary)] text-white text-xs font-bold tracking-widest uppercase hover:bg-[var(--th-primary-hover)] transition-all shadow-md cursor-pointer"
              >
                Browse All Collections
              </button>
            </div>
          )}
        </div>

        {/* Persistent Bottom Action Bar */}
        <div className="p-3 sm:p-4 bg-[var(--th-card)] border-t border-[var(--th-border)] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-[var(--th-text-muted)] hidden sm:flex">
            <ShieldCheck className="w-4 h-4 text-[var(--th-accent)]" />
            <span className="text-[11px]">100% Certified 925 Sterling & 999 Fine Silver Guarantee</span>
          </div>

          <button
            type="button"
            onClick={() => handleViewAllInCatalog()}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
          >
            <span>{query.trim() ? `Explore All Results in Catalog` : `Explore Entire Catalog`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
