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
import { useAuth } from './context/AuthContext';
import { 
  fetchProducts, 
  fetchCategories, 
  fetchUserWishlist, 
  addToWishlistApi, 
  removeFromWishlistApi,
  addToCartApi,
  updateCartQtyApi,
  removeCartItemApi,
  getGuestToken
} from './services/api';
import { PRODUCTS, CATEGORIES } from './data/products';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const effectiveUserId = user?.userId || 1;

  // Datasets loaded live from Backend API
  const [products, setProducts] = useState(PRODUCTS);
  const [categories, setCategories] = useState(CATEGORIES);

  // Cart & Wishlist State
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('silverhouse_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('silverhouse_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart', e);
    }
  }, [cartItems]);
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

  // Sync wishlist from SQL Server database table dbo.wishlist
  useEffect(() => {
    async function loadWishlistFromDb() {
      try {
        const dbWishlist = await fetchUserWishlist(effectiveUserId);
        if (Array.isArray(dbWishlist) && dbWishlist.length > 0) {
          const dbIds = dbWishlist.map(w => String(w.product_id));
          setWishlistIds(dbIds);
        }
      } catch (err) {
        console.warn('Could not load wishlist from DB:', err);
      }
    }
    loadWishlistFromDb();
  }, [effectiveUserId]);

  // Fetch backend data on app mount and on product updates
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

    const handleProductsUpdated = () => {
      loadDataFromBackend();
    };
    window.addEventListener('products_updated', handleProductsUpdated);
    return () => window.removeEventListener('products_updated', handleProductsUpdated);
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

  const triggerToast = (arg1, arg2, arg3) => {
    let type = 'success';
    let title = '';
    let message = '';

    if (arg3 !== undefined) {
      // Called as: triggerToast(type, title, message)
      type = arg1 || 'success';
      title = arg2 || '';
      message = arg3 || '';
    } else if (arg2 !== undefined) {
      // Called as: triggerToast(type, message) OR triggerToast(title, message)
      if (['success', 'info', 'error', 'warning'].includes(arg1)) {
        type = arg1;
        title = arg1 === 'success' ? 'Success' : arg1 === 'error' ? 'Notice' : 'Info';
        message = arg2;
      } else {
        type = 'success';
        title = arg1;
        message = arg2;
      }
    } else if (arg1) {
      // Called as: triggerToast(message)
      type = 'success';
      title = 'Notification';
      message = arg1;
    }

    const id = Date.now() + Math.random();
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

  // Cart Operations - Synchronized with SQL Server database tables dbo.cart and dbo.cart_item
  const handleAddToCart = async (product, quantity = 1, customConfig = null) => {
    if (!product) return;
    const prodId = product.id || product.product_id;
    const prodTitle = product.name || product.title || product.product_name || 'Sacred Creation';

    setCartItems((prev) => {
      const existingIdx = prev.findIndex(item => (item.product.id || item.product.product_id) === prodId && JSON.stringify(item.customConfig) === JSON.stringify(customConfig));
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity, customConfig }];
      }
    });

    triggerToast('success', 'Added to Shopping Cart', `${prodTitle} (${quantity} qty) is in your cart.`);
    setIsCartOpen(true);

    // Sync addition directly to database table dbo.cart & dbo.cart_item
    try {
      await addToCartApi({
        userId: isAuthenticated && user?.userId ? user.userId : null,
        guestToken: getGuestToken(),
        productId: prodId,
        quantity: quantity
      });
    } catch (err) {
      console.error('Failed to sync item to DB cart:', err);
    }
  };

  const handleUpdateCartQty = async (index, newQty) => {
    const item = cartItems[index];
    if (!item) return;
    const prodId = item.product.id || item.product.product_id;

    setCartItems((prev) => {
      if (newQty <= 0) {
        return prev.filter((_, idx) => idx !== index);
      }
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });

    // Sync to database table dbo.cart_item
    try {
      if (newQty <= 0) {
        await removeCartItemApi({
          userId: isAuthenticated && user?.userId ? user.userId : null,
          guestToken: getGuestToken(),
          productId: prodId
        });
      } else {
        await updateCartQtyApi({
          userId: isAuthenticated && user?.userId ? user.userId : null,
          guestToken: getGuestToken(),
          productId: prodId,
          quantity: newQty
        });
      }
    } catch (err) {
      console.error('Failed to update DB cart qty:', err);
    }
  };

  const handleRemoveCartItem = async (index) => {
    const item = cartItems[index];
    if (!item) return;
    const prodId = item.product.id || item.product.product_id;
    const prodTitle = item.product.name || item.product.title || item.product.product_name || 'Item';

    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
    triggerToast('info', 'Item Removed', `${prodTitle} removed from cart.`);

    // Sync removal directly to database table dbo.cart_item
    try {
      await removeCartItemApi({
        userId: isAuthenticated && user?.userId ? user.userId : null,
        guestToken: getGuestToken(),
        productId: prodId
      });
    } catch (err) {
      console.error('Failed to remove item from DB cart:', err);
    }
  };

  // Wishlist Operations - Synchronized with SQL Server database table dbo.wishlist
  const handleToggleWishlist = async (product) => {
    if (!product) return;
    const prodId = String(product.id || product.product_id);
    const prodTitle = product.name || product.title || product.product_name || 'Sacred Creation';
    const isAlreadyWishlisted = wishlistIds.some(id => String(id) === prodId);

    if (isAlreadyWishlisted) {
      // Optimistic state update
      setWishlistIds((prev) => prev.filter(id => String(id) !== prodId));
      triggerToast('info', 'Removed from Wishlist', `${prodTitle} removed from your saved items.`);

      // Sync removal directly to database table dbo.wishlist
      try {
        await removeFromWishlistApi(effectiveUserId, prodId);
      } catch (err) {
        console.error('Failed to remove item from DB wishlist:', err);
      }
    } else {
      // Optimistic state update
      setWishlistIds((prev) => [...prev, prodId]);
      triggerToast('success', 'Saved to Wishlist', `${prodTitle} added to your wishlist.`);

      // Sync addition directly to database table dbo.wishlist
      try {
        await addToWishlistApi(effectiveUserId, prodId);
      } catch (err) {
        console.error('Failed to add item to DB wishlist:', err);
      }
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
        onClearCart={() => {
          setCartItems([]);
          try {
            localStorage.removeItem('silverhouse_cart');
          } catch (e) {
            console.warn(e);
          }
        }}
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
