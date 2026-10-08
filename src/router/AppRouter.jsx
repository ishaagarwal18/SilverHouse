import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomePage from '../components/home/HomePage';
import ProductListingPage from '../components/plp/ProductListingPage';
import ProductDetailPage from '../components/pdp/ProductDetailPage';
import AuthPage from '../components/auth/AuthPage';
import AddressPage from '../components/account/AddressPage';
import OrdersPage from '../components/account/OrdersPage';
import CustomArtisanalOrderPage from '../components/customizer/CustomArtisanalOrderPage';
import DocumentPage from '../pages/DocumentPage';
import ContactUsPage from '../pages/ContactUsPage';
import PolicyPage from '../pages/PolicyPage';

/** Protects customer account components: unauthenticated users are routed to /login */
function CustomerProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--th-bg)] text-[var(--th-text-main)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--th-primary)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

/** Route handler for /checkout, /payment, /cart/checkout when accessed directly */
function CheckoutRoutePage({ onOpenCheckout }) {
  useEffect(() => {
    if (onOpenCheckout) {
      onOpenCheckout();
    }
  }, [onOpenCheckout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--th-bg)] text-[var(--th-text-main)]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--th-primary)]" />
    </div>
  );
}

export default function AppRouter({
  products,
  categories,
  festivals = [],
  festivalCategories = [],
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
  onQuickView,
  onSelectProduct,
  onTriggerToast,
  onOpenCart,
  onOpenCheckout
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigateCategory = (catId) => {
    if (!catId || catId === 'all') {
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

  const handleNavigateYatraCustomizer = () => {
    navigate('/customize?category=yatra');
  };

  const handleSelectProduct = (product) => {
    if (product && product.id) {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <div key={location.pathname} className="animate-page-enter">
      <Routes location={location}>
        {/* Unified Bespoke & Sacred Yatra Customizer Studio Routes (Restricted) */}
        <Route
          path="/customize"
          element={
            <CustomerProtectedRoute>
              <CustomArtisanalOrderPage onTriggerToast={onTriggerToast} />
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/customize-yatra"
          element={
            <CustomerProtectedRoute>
              <CustomArtisanalOrderPage onTriggerToast={onTriggerToast} />
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/custom-orders"
          element={
            <CustomerProtectedRoute>
              <CustomArtisanalOrderPage onTriggerToast={onTriggerToast} />
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/custom-artisanal"
          element={
            <CustomerProtectedRoute>
              <CustomArtisanalOrderPage onTriggerToast={onTriggerToast} />
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/customize-artisanal"
          element={
            <CustomerProtectedRoute>
              <CustomArtisanalOrderPage onTriggerToast={onTriggerToast} />
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/category/custom-gifting/custom-yatra-lockets"
          element={
            <CustomerProtectedRoute>
              <CustomArtisanalOrderPage onTriggerToast={onTriggerToast} />
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/category/custom-yatra-lockets/customize"
          element={
            <CustomerProtectedRoute>
              <CustomArtisanalOrderPage onTriggerToast={onTriggerToast} />
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/category/custom-artisanal"
          element={
            <CustomerProtectedRoute>
              <CustomArtisanalOrderPage onTriggerToast={onTriggerToast} />
            </CustomerProtectedRoute>
          }
        />

        {/* Public Login & Register Auth Routes */}
        <Route path="/login" element={<AuthPage onTriggerToast={onTriggerToast} />} />
        <Route path="/register" element={<AuthPage onTriggerToast={onTriggerToast} />} />

        {/* User Profile & Account Routes (Restricted to authenticated user) */}
        <Route
          path="/profile"
          element={
            <CustomerProtectedRoute>
              <AuthPage onTriggerToast={onTriggerToast} />
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <CustomerProtectedRoute>
              <AuthPage onTriggerToast={onTriggerToast} />
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/account/profile"
          element={
            <CustomerProtectedRoute>
              <AuthPage onTriggerToast={onTriggerToast} />
            </CustomerProtectedRoute>
          }
        />

        {/* Saved Addresses Routes (Restricted to authenticated user) */}
        <Route
          path="/addresses"
          element={
            <CustomerProtectedRoute>
              <AddressPage onTriggerToast={onTriggerToast} />
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/account/addresses"
          element={
            <CustomerProtectedRoute>
              <AddressPage onTriggerToast={onTriggerToast} />
            </CustomerProtectedRoute>
          }
        />

        {/* User Orders Routes (Restricted to authenticated user) */}
        <Route
          path="/orders"
          element={
            <CustomerProtectedRoute>
              <OrdersPage onTriggerToast={onTriggerToast} />
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/account/orders"
          element={
            <CustomerProtectedRoute>
              <OrdersPage onTriggerToast={onTriggerToast} />
            </CustomerProtectedRoute>
          }
        />

        {/* Checkout & Payment Routes (Restricted to authenticated user) */}
        <Route
          path="/checkout"
          element={
            <CustomerProtectedRoute>
              <CheckoutRoutePage onOpenCheckout={onOpenCheckout} />
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <CustomerProtectedRoute>
              <CheckoutRoutePage onOpenCheckout={onOpenCheckout} />
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/cart/checkout"
          element={
            <CustomerProtectedRoute>
              <CheckoutRoutePage onOpenCheckout={onOpenCheckout} />
            </CustomerProtectedRoute>
          }
        />

      {/* Document Viewer & Guide Direct Routes */}
      <Route path="/about-us" element={<DocumentPage />} />
      <Route path="/aboutus" element={<DocumentPage />} />
      <Route path="/about" element={<DocumentPage />} />

      <Route path="/purity-guide" element={<DocumentPage />} />
      <Route path="/silver-purity-guide" element={<DocumentPage />} />
      <Route path="/purity" element={<DocumentPage />} />

      {/* Legacy Document Route Fallbacks */}
      <Route path="/doc/:docId" element={<DocumentPage />} />
      <Route path="/document/:docId" element={<DocumentPage />} />

      {/* Mandatory Payment Gateway Compliance Pages */}
      <Route path="/contactus" element={<ContactUsPage onTriggerToast={onTriggerToast} />} />
      <Route path="/contact-us" element={<ContactUsPage onTriggerToast={onTriggerToast} />} />
      <Route path="/contact" element={<ContactUsPage onTriggerToast={onTriggerToast} />} />

      <Route path="/terms&conditions" element={<PolicyPage />} />
      <Route path="/terms-and-conditions" element={<PolicyPage />} />
      <Route path="/terms" element={<PolicyPage />} />
      <Route path="/termsofservice" element={<PolicyPage />} />

      <Route path="/privacypolicy" element={<PolicyPage />} />
      <Route path="/privacy-policy" element={<PolicyPage />} />
      <Route path="/privacy" element={<PolicyPage />} />

      <Route path="/refund-and-cancellation" element={<PolicyPage />} />
      <Route path="/refund-policy" element={<PolicyPage />} />
      <Route path="/cancellation-policy" element={<PolicyPage />} />
      <Route path="/returns" element={<PolicyPage />} />

      <Route path="/shipping-policy" element={<PolicyPage />} />
      <Route path="/shipping" element={<PolicyPage />} />

      {/* Home Page */}
      <Route
        path="/"
        element={
          <HomePage
            products={products}
            categories={categories}
            festivals={festivals}
            festivalCategories={festivalCategories}
            onNavigateCategory={handleNavigateCategory}
            onNavigateYatraCustomizer={handleNavigateYatraCustomizer}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            wishlistIds={wishlistIds}
            onQuickView={onQuickView}
            onSelectProduct={handleSelectProduct}
          />
        }
      />

      {/* Product Catalog / Category / Subcategory Listing Pages */}
      <Route
        path="/catalog"
        element={
          <ProductListingPage
            products={products}
            categories={categories}
            onSelectCategory={handleNavigateCategory}
            onSelectSubcategory={handleNavigateSubcategory}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            wishlistIds={wishlistIds}
            onQuickView={onQuickView}
            onSelectProduct={handleSelectProduct}
            onNavigateYatraCustomizer={handleNavigateYatraCustomizer}
          />
        }
      />

      <Route
        path="/category/:categoryId"
        element={
          <ProductListingPage
            products={products}
            categories={categories}
            onSelectCategory={handleNavigateCategory}
            onSelectSubcategory={handleNavigateSubcategory}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            wishlistIds={wishlistIds}
            onQuickView={onQuickView}
            onSelectProduct={handleSelectProduct}
            onNavigateYatraCustomizer={handleNavigateYatraCustomizer}
          />
        }
      />

      <Route
        path="/category/:categoryId/:subcategoryId"
        element={
          <ProductListingPage
            products={products}
            categories={categories}
            onSelectCategory={handleNavigateCategory}
            onSelectSubcategory={handleNavigateSubcategory}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            wishlistIds={wishlistIds}
            onQuickView={onQuickView}
            onSelectProduct={handleSelectProduct}
            onNavigateYatraCustomizer={handleNavigateYatraCustomizer}
          />
        }
      />

      {/* Product Detail Page */}
      <Route
        path="/product/:productId"
        element={
          <ProductDetailPage
            allProducts={products}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            wishlistIds={wishlistIds}
            onSelectProduct={handleSelectProduct}
            onNavigateCheckout={onOpenCart}
            onTriggerToast={onTriggerToast}
          />
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
