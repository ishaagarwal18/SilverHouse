import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AnnouncementBar from './components/common/AnnouncementBar';
import Header from './components/common/Header';
import MobileMenu from './components/common/MobileMenu';
import SearchModal from './components/common/SearchModal';
import QuickViewModal from './components/common/QuickViewModal';
import ToastContainer from './components/common/ToastContainer';
import Footer from './components/common/Footer';
import CartDrawer from './components/cart/CartDrawer';
import CheckoutModal from './components/cart/CheckoutModal';
import WishlistDrawer from './components/wishlist/WishlistDrawer';
import InfoModal from './components/common/InfoModal';
import ThemeSwitcher from './components/common/ThemeSwitcher';
import AppRouter from './router/AppRouter';
import { fetchProducts, fetchCategories } from './services/api';
import { PRODUCTS, CATEGORIES } from './data/products';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Datasets loaded live from Backend API
  const [products, setProducts] = useState(PRODUCTS);
  const [categories, setCategories] = useState(CATEGORIES);

  // Cart & Wishlist State
  const [cartItems, setCartItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem('silverhouse_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('silverhouse_wishlist', JSON.stringify(wishlistIds));
    } catch (e) {
      console.warn('Failed to save wishlist', e);
    }
  }, [wishlistIds]);

  // Fetch backend data on app mount
  useEffect(() => {
    async function loadDataFromBackend() {
      const backendProducts = await fetchProducts();
      if (backendProducts && backendProducts.length > 0) {
        setProducts(backendProducts);
      }
      const backendCategories = await fetchCategories();
      if (backendCategories && backendCategories.length > 0) {
        setCategories(backendCategories);
      }
    }
    loadDataFromBackend();
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Modals & Drawers Visibility State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [infoModalTab, setInfoModalTab] = useState(null);

  const handleOpenInfoModal = (tab = 'about') => {
    setInfoModalTab(tab);
  };
  
  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ totalAmount: 0, discountAmount: 0, appliedCoupon: null });

  // Toast Notifications State
  const [toasts, setToasts] = useState([]);

  const triggerToast = (type, title, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Handlers for Router Navigation
  const handleNavigateHome = () => {
    navigate('/');
  };

  const handleNavigateCategory = (catId) => {
    if (catId === 'all') {
      navigate('/catalog');
    } else {
      navigate(`/category/${catId}`);
    }
  };

  const handleNavigateSubcategory = (catId, subId) => {
    if (!subId || subId === 'all') {
      navigate(`/category/${catId}`);
    } else {
      navigate(`/category/${catId}/${subId}`);
    }
  };

  const handleSelectProduct = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleNavigateYatraCustomizer = () => {
    navigate('/category/custom-gifting/custom-yatra-lockets');
  };

  // Cart Operations
  const handleAddToCart = (product, quantity = 1, customConfig = null) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id && JSON.stringify(item.customConfig) === JSON.stringify(customConfig));
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity, customConfig }];
      }
    });

    triggerToast('success', 'Added to Shopping Cart', `${product.name} (${quantity} qty) is in your cart.`);
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (index, newQty) => {
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveCartItem = (index) => {
    const item = cartItems[index];
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
    if (item) {
      triggerToast('info', 'Item Removed', `${item.product.name} removed from cart.`);
    }
  };

  // Wishlist Operations
  const handleToggleWishlist = (product) => {
    if (wishlistIds.includes(product.id)) {
      setWishlistIds((prev) => prev.filter(id => id !== product.id));
      triggerToast('info', 'Removed from Wishlist', `${product.name} removed from your saved items.`);
    } else {
      setWishlistIds((prev) => [...prev, product.id]);
      triggerToast('success', 'Saved to Wishlist', `${product.name} added to your wishlist.`);
    }
  };

  // Checkout Handler
  const handleProceedCheckout = (totalAmount, discountAmount, appliedCoupon) => {
    setCheckoutData({ totalAmount, discountAmount, appliedCoupon });
    setIsCheckoutOpen(true);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F6F1E8] flex flex-col justify-between selection:bg-[#D4AF37] selection:text-white">
      <div>
        {/* Top Announcement Bar */}
        <AnnouncementBar onNavigateCategory={handleNavigateCategory} />

        {/* Sticky Header with MegaMenu */}
        <Header
          cartCount={cartCount}
          wishlistCount={wishlistIds.length}
          categories={categories}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigateHome={handleNavigateHome}
          onNavigateCategory={handleNavigateCategory}
          onNavigateSubcategory={handleNavigateSubcategory}
          onNavigateYatraCustomizer={handleNavigateYatraCustomizer}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenInfoModal={handleOpenInfoModal}
        />

        {/* Main View Router */}
        <main>
          <AppRouter
            products={products}
            categories={categories}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onQuickView={(prod) => setQuickViewProduct(prod)}
            onSelectProduct={handleSelectProduct}
            onTriggerToast={triggerToast}
            onOpenCart={() => setIsCartOpen(true)}
          />
        </main>
      </div>

      {/* Footer */}
      <Footer
        onNavigateCategory={handleNavigateCategory}
        onNavigateYatraCustomizer={handleNavigateYatraCustomizer}
        onOpenInfoModal={handleOpenInfoModal}
      />

      {/* Overlays & Drawers */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        categories={categories}
        onClose={() => setIsMobileMenuOpen(false)}
        onSelectCategory={handleNavigateCategory}
        onSelectSubcategory={handleNavigateSubcategory}
        onNavigateYatraCustomizer={handleNavigateYatraCustomizer}
        onOpenInfoModal={handleOpenInfoModal}
      />

      <SearchModal
        isOpen={isSearchOpen}
        products={products}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        onNavigateCategory={handleNavigateCategory}
      />

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
        onViewFullPDP={handleSelectProduct}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedCheckout={handleProceedCheckout}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        products={products}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onSelectProduct={handleSelectProduct}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        totalAmount={checkoutData.totalAmount}
        discountAmount={checkoutData.discountAmount}
        appliedCoupon={checkoutData.appliedCoupon}
        onClearCart={() => setCartItems([])}
        onNavigateHome={handleNavigateHome}
      />

      <InfoModal
        isOpen={!!infoModalTab}
        initialTab={infoModalTab || 'about'}
        onClose={() => setInfoModalTab(null)}
        onNavigateCategory={handleNavigateCategory}
      />

      <ThemeSwitcher variant="floating" />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
