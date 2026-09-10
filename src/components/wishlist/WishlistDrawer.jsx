import React from 'react';
import { PRODUCTS } from '../../data/products';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export default function WishlistDrawer({
  isOpen,
  products,
  onClose,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct
}) {
  if (!isOpen) return null;

  const productList = (products && products.length > 0) ? products : PRODUCTS;
  const wishlistedProducts = productList.filter(p => wishlistIds.some(id => String(id) === String(p.id)));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-silver-200 flex items-center justify-between bg-silver-50">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
            <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
              My Sacred Wishlist ({wishlistedProducts.length})
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-silver-500 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {wishlistedProducts.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-silver-300 mx-auto mb-3" />
              <p className="font-serif text-lg font-bold text-[#1A1A1A]">Your Wishlist is Empty</p>
              <p className="text-xs text-silver-500 mt-1 max-w-xs mx-auto">
                Save your favorite murti, pure silver coins, and custom lockets here while exploring.
              </p>
            </div>
          ) : (
            wishlistedProducts.map((product) => (
              <div
                key={product.id}
                className="p-3.5 rounded-xl border border-silver-200 bg-white flex items-center justify-between space-x-3 shadow-2xs group"
              >
                <div 
                  className="flex items-center space-x-3 cursor-pointer flex-1"
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg border border-silver-200 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-[#AA820A] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full inline-block mb-1">
                      {product.purity}
                    </span>
                    <h4 className="font-semibold text-xs text-[#1A1A1A] group-hover:text-[#AA820A] transition-colors line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="font-bold text-sm text-[var(--th-primary)] font-outfit tracking-tight mt-0.5">
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onAddToCart(product, 1)}
                    className="p-2 bg-[#1A1A1A] text-white hover:bg-[#D4AF37] hover:text-black rounded-lg transition-colors"
                    title="Add to Cart"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onToggleWishlist(product)}
                    className="p-2 text-silver-400 hover:text-rose-600 transition-colors"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-silver-50 border-t border-silver-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#1A1A1A] text-white text-xs font-bold rounded-xl hover:bg-[#D4AF37] hover:text-black transition-colors"
          >
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
}
