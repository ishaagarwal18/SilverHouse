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
import { useTheme } from './context/ThemeContext';
import { 
  fetchProducts, 
  fetchCategories, 
  fetchUserWishlist, 
  addToWishlistApi, 
  removeFromWishlistApi,
  addToCartApi,
  updateCartQtyApi,
  removeCartItemApi,
  fetchUserCartApi,
  clearCartApi,
  getGuestToken,
  fetchStoreParameters,
  fetchCompanyDetails,
  DEFAULT_COMPANY_DETAILS,
  recordProductView
} from './services/api';
import { PRODUCTS, CATEGORIES } from './data/products';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { setTheme, themes } = useTheme();
  const effectiveUserId = user?.userId || null;

  // Datasets loaded live from Backend API
  const [products, setProducts] = useState(PRODUCTS);
  const [categories, setCategories] = useState(CATEGORIES);
  const [storeParams, setStoreParams] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(DEFAULT_COMPANY_DETAILS);

  const handleOpenPdf = (type) => {
    const docId = type === 'about' ? 'about-us' : 'purity-guide';
    window.open(`/document/${docId}`, '_blank');
  };

  // Cart & Wishlist State - Strictly Isolated & User-Scoped
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedUser = localStorage.getItem('silverhouse_user');
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      const key = parsedUser?.userId ? `silverhouse_cart_${parsedUser.userId}` : 'silverhouse_guest_cart';
      const saved = localStorage.getItem(key);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Clean up phantom empty customConfigs from older items in localStorage
      return parsed.map(item => {
        if (item.customConfig) {
          const cfg = item.customConfig;
          const hasRealData = Boolean(
            (cfg.engravingText && cfg.engravingText.trim()) ||
            (cfg.shrineName && cfg.shrineName !== 'Sacred Locket' && cfg.shrineName.trim()) ||
            (cfg.allUploadedImages && cfg.allUploadedImages.length > 0) ||
            (cfg.familyGotra && cfg.familyGotra !== 'N/A' && cfg.familyGotra.trim())
          );
          if (!hasRealData) {
            return { ...item, customConfig: null };
          }
        }
        return item;
      });
    } catch {
      return [];
    }
  });

  // Sync cart to user-scoped localStorage
  useEffect(() => {
    try {
      if (effectiveUserId) {
        localStorage.setItem(`silverhouse_cart_${effectiveUserId}`, JSON.stringify(cartItems));
      } else {
        localStorage.setItem('silverhouse_guest_cart', JSON.stringify(cartItems));
      }
      // Remove old legacy un-isolated key
      localStorage.removeItem('silverhouse_cart');
    } catch (e) {
      console.warn('Failed to save cart', e);
    }
  }, [cartItems, effectiveUserId]);

  // Sync cart items from SQL Server database table dbo.cart and dbo.cart_item
  useEffect(() => {
    let isCancelled = false;

    async function loadCartFromDb() {
      if (!effectiveUserId) {
        // Guest user: load from local guest storage only
        try {
          const guestSaved = localStorage.getItem('silverhouse_guest_cart');
          if (!isCancelled) {
            setCartItems(guestSaved ? JSON.parse(guestSaved) : []);
          }
        } catch {
          if (!isCancelled) setCartItems([]);
        }
        return;
      }

      // Fast display of local cached items for this specific user
      try {
        const userSaved = localStorage.getItem(`silverhouse_cart_${effectiveUserId}`);
        if (userSaved && !isCancelled) {
          setCartItems(JSON.parse(userSaved));
        }
      } catch (e) {
        // ignore
      }

      // Authoritative sync from database table dbo.cart_item
      try {
        const dbItems = await fetchUserCartApi({ userId: effectiveUserId });
        if (isCancelled) return;

        if (Array.isArray(dbItems)) {
          if (dbItems.length === 0) {
            setCartItems([]);
          } else {
            const currentProducts = (products && products.length > 0) ? products : PRODUCTS;
            const mappedItems = dbItems.map(dbItem => {
              const matchedProduct = currentProducts.find(p => 
                String(p.id || p.product_id) === String(dbItem.product_id)
              );
              const prod = matchedProduct || {
                id: dbItem.product_id,
                product_id: dbItem.product_id,
                title: dbItem.product_name,
                name: dbItem.product_name,
                price: Number(dbItem.unit_price) || 0,
                image: dbItem.image_url || '/images/hero_silver_coins.png',
                images: [dbItem.image_url || '/images/hero_silver_coins.png'],
                category: 'All'
              };
              return {
                product: prod,
                quantity: Number(dbItem.quantity) || 1,
                customConfig: null
              };
            });
            setCartItems(mappedItems);
          }
        }
      } catch (err) {
        console.warn('Could not load user cart from DB:', err);
      }
    }

    loadCartFromDb();

    return () => {
      isCancelled = true;
    };
  }, [effectiveUserId, products]);

  // Clear state immediately when user logs out
  useEffect(() => {
    const handleLogout = () => {
      setCartItems([]);
      setWishlistIds([]);
    };
    window.addEventListener('silverhouse_logout', handleLogout);
    return () => window.removeEventListener('silverhouse_logout', handleLogout);
  }, []);

  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const savedUser = localStorage.getItem('silverhouse_user');
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      const key = parsedUser?.userId ? `silverhouse_wishlist_${parsedUser.userId}` : 'silverhouse_guest_wishlist';
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync wishlist to localStorage per user/guest
  useEffect(() => {
    try {
      if (effectiveUserId) {
        localStorage.setItem(`silverhouse_wishlist_${effectiveUserId}`, JSON.stringify(wishlistIds));
      } else {
        localStorage.setItem('silverhouse_guest_wishlist', JSON.stringify(wishlistIds));
      }
      localStorage.setItem('silverhouse_wishlist', JSON.stringify(wishlistIds));
    } catch (e) {
      console.warn('Failed to save wishlist', e);
    }
  }, [wishlistIds, effectiveUserId]);

  // Sync wishlist from SQL Server database table dbo.wishlist
  useEffect(() => {
    async function loadWishlistFromDb() {
      if (!effectiveUserId) {
        // Guest user: load from local guest storage only
        try {
          const guestSaved = localStorage.getItem('silverhouse_guest_wishlist');
          setWishlistIds(guestSaved ? JSON.parse(guestSaved) : []);
        } catch {
          setWishlistIds([]);
        }
        return;
      }

      // Logged-in user: sync strictly from database for this specific user
      try {
        const dbWishlist = await fetchUserWishlist(effectiveUserId);
        if (Array.isArray(dbWishlist)) {
          const dbIds = dbWishlist.map(w => String(w.product_id));
          setWishlistIds(dbIds);
        } else {
          setWishlistIds([]);
        }
      } catch (err) {
        console.warn('Could not load wishlist from DB:', err);
        setWishlistIds([]);
      }
    }
    loadWishlistFromDb();
  }, [effectiveUserId]);

  // Fetch backend data on app mount and on product updates
  useEffect(() => {
    async function loadDataFromBackend() {
      try {
        const [backendProducts, backendCategories, paramsRes, companyRes] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchStoreParameters(),
          fetchCompanyDetails()
        ]);
        if (Array.isArray(backendProducts) && backendProducts.length > 0) {
          setProducts(backendProducts);
        }
        if (Array.isArray(backendCategories) && backendCategories.length > 0) {
          setCategories(backendCategories);
        }
        if (companyRes?.company) {
          setCompanyDetails(companyRes.company);
        }
        if (paramsRes?.parameters) {
          setStoreParams(paramsRes.parameters);
          // Apply default_theme fetched directly from database table store_parameter
          if (paramsRes.parameters.default_theme) {
            const dbThemeRaw = paramsRes.parameters.default_theme.trim().toLowerCase();
            const matchedTheme = themes.find(t => 
              t.name.toLowerCase() === dbThemeRaw || 
              t.id.toLowerCase() === dbThemeRaw
            );
            if (matchedTheme && !localStorage.getItem('silverhouse_theme_user_override')) {
              setTheme(matchedTheme.id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load live database data:', err);
      }
    }
    loadDataFromBackend();

    const handleDataUpdated = () => {
      loadDataFromBackend();
    };
    window.addEventListener('products_updated', handleDataUpdated);
    window.addEventListener('categories_updated', handleDataUpdated);
    return () => {
      window.removeEventListener('products_updated', handleDataUpdated);
      window.removeEventListener('categories_updated', handleDataUpdated);
    };
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

  // Automatically open checkout if returning from login with ?checkout=true
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('checkout') === 'true') {
      if (cartItems.length > 0) {
        const subtotal = cartItems.reduce((acc, it) => acc + (Number(it.product.price) || 0) * it.quantity, 0);
        setCheckoutData(prev => ({
          totalAmount: prev.totalAmount || subtotal,
          discountAmount: prev.discountAmount || 0,
          appliedCoupon: prev.appliedCoupon || null
        }));
        setIsCheckoutOpen(true);
      }
      params.delete('checkout');
      const newSearch = params.toString() ? `?${params.toString()}` : '';
      navigate(`${location.pathname}${newSearch}`, { replace: true });
    }
  }, [location.search, cartItems, navigate, location.pathname]);

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

  // Keyboard Shortcut: Cmd/Ctrl + K to open search modal
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

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
    if (product && (product.product_id || product.id)) {
      recordProductView(product.product_id || product.id, effectiveUserId);
    }
    navigate(`/product/${product.id}`);
  };

  const handleNavigateYatraCustomizer = () => {
    navigate('/customize-yatra');
  };

  // Cart Operations - Synchronized with SQL Server database tables dbo.cart and dbo.cart_item
  const handleAddToCart = async (product, quantity = 1, customConfig = null) => {
    if (!product) return;
    const prodId = product.id || product.product_id;
    const prodTitle = product.name || product.title || product.product_name || 'Sacred Creation';

    // Sanitize customConfig: ensure it contains real personalization data
    let sanitizedConfig = null;
    if (customConfig && typeof customConfig === 'object') {
      const hasRealData = Boolean(
        (customConfig.engravingText && customConfig.engravingText.trim()) ||
        (customConfig.shrineName && customConfig.shrineName !== 'Sacred Locket' && customConfig.shrineName.trim()) ||
        (customConfig.allUploadedImages && customConfig.allUploadedImages.length > 0) ||
        (customConfig.familyGotra && customConfig.familyGotra !== 'N/A' && customConfig.familyGotra.trim())
      );
      if (hasRealData) {
        sanitizedConfig = customConfig;
      }
    }

    setCartItems((prev) => {
      const existingIdx = prev.findIndex(item => (item.product.id || item.product.product_id) === prodId && JSON.stringify(item.customConfig) === JSON.stringify(sanitizedConfig));
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity, customConfig: sanitizedConfig }];
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

      // Sync removal directly to database table dbo.wishlist if logged in
      if (effectiveUserId) {
        try {
          await removeFromWishlistApi(effectiveUserId, prodId);
        } catch (err) {
          console.error('Failed to remove item from DB wishlist:', err);
        }
      }
    } else {
      // Optimistic state update
      setWishlistIds((prev) => [...prev, prodId]);
      triggerToast('success', 'Saved to Wishlist', `${prodTitle} added to your wishlist.`);

      // Sync addition directly to database table dbo.wishlist if logged in
      if (effectiveUserId) {
        try {
          await addToWishlistApi(effectiveUserId, prodId);
        } catch (err) {
          console.error('Failed to add item to DB wishlist:', err);
        }
      }
    }
  };

  // Checkout Handler
  const handleProceedCheckout = (totalAmount, discountAmount, appliedCoupon) => {
    setCheckoutData({ totalAmount, discountAmount, appliedCoupon });
    setIsCheckoutOpen(true);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const isDocumentPage = location.pathname.startsWith('/document') || location.pathname.startsWith('/doc');

  return (
    <div className="min-h-screen bg-[#F6F1E8] flex flex-col justify-between selection:bg-[#D4AF37] selection:text-white">
      <div>
        {/* Top Announcement Bar */}
        {!isDocumentPage && (
          <AnnouncementBar 
            onNavigateCategory={handleNavigateCategory} 
            storeParams={storeParams} 
            onOpenPdf={handleOpenPdf}
          />
        )}

        {/* Sticky Header with MegaMenu */}
        {!isDocumentPage && (
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
        )}

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
      {!isDocumentPage && (
        <Footer
          onNavigateCategory={handleNavigateCategory}
          onNavigateYatraCustomizer={handleNavigateYatraCustomizer}
          onOpenInfoModal={handleOpenInfoModal}
          company={companyDetails}
          onOpenPdf={handleOpenPdf}
        />
      )}

      {/* Overlays & Drawers */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        categories={categories}
        onClose={() => setIsMobileMenuOpen(false)}
        onSelectCategory={handleNavigateCategory}
        onSelectSubcategory={handleNavigateSubcategory}
        onNavigateYatraCustomizer={handleNavigateYatraCustomizer}
        onOpenInfoModal={handleOpenInfoModal}
        company={companyDetails}
        onOpenPdf={handleOpenPdf}
      />

      <SearchModal
        isOpen={isSearchOpen}
        products={products}
        categories={categories}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        onNavigateCategory={handleNavigateCategory}
        onQuickView={(p) => setQuickViewProduct(p)}
        onAddToCart={handleAddToCart}
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
        onQuickView={(prod) => setQuickViewProduct(prod)}
        storeParams={storeParams}
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
        onClearCart={async () => {
          setCartItems([]);
          try {
            if (effectiveUserId) {
              localStorage.removeItem(`silverhouse_cart_${effectiveUserId}`);
              await clearCartApi({ userId: effectiveUserId });
            } else {
              localStorage.removeItem('silverhouse_guest_cart');
              await clearCartApi({ guestToken: getGuestToken() });
            }
            localStorage.removeItem('silverhouse_cart');
          } catch (e) {
            console.warn('Error clearing cart:', e);
          }
        }}
        onNavigateHome={handleNavigateHome}
      />

      <InfoModal
        isOpen={!!infoModalTab}
        initialTab={infoModalTab || 'about'}
        onClose={() => setInfoModalTab(null)}
        onNavigateCategory={handleNavigateCategory}
        company={companyDetails}
        onOpenPdf={handleOpenPdf}
      />

      <ThemeSwitcher variant="floating" />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
