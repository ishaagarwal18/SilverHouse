import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from '../components/home/HomePage';
import ProductListingPage from '../components/plp/ProductListingPage';
import ProductDetailPage from '../components/pdp/ProductDetailPage';
import AuthPage from '../components/auth/AuthPage';
import AddressPage from '../components/account/AddressPage';
import OrdersPage from '../components/account/OrdersPage';
import CustomArtisanalOrderPage from '../components/customizer/CustomArtisanalOrderPage';
import { getAdminUrl } from '../utils/adminUrl';

function AdminRedirect() {
  React.useEffect(() => {
    window.location.replace(getAdminUrl());
  }, []);
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-10 h-10 border-3 border-[var(--th-primary)] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-bold text-[var(--th-text-main)]">Opening Admin Studio...</p>
    </div>
  );
}

export default function AppRouter({
  products,
  categories,
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
  onQuickView,
  onSelectProduct,
  onTriggerToast,
  onOpenCart
}) {
  const navigate = useNavigate();

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
    <Routes>
      {/* Unified Bespoke & Sacred Yatra Customizer Studio Routes */}
      <Route
        path="/customize"
        element={<CustomArtisanalOrderPage onTriggerToast={onTriggerToast} />}
      />
      <Route
        path="/customize-yatra"
        element={<CustomArtisanalOrderPage onTriggerToast={onTriggerToast} />}
      />
      <Route
        path="/custom-orders"
        element={<CustomArtisanalOrderPage onTriggerToast={onTriggerToast} />}
      />
      <Route
        path="/custom-artisanal"
        element={<CustomArtisanalOrderPage onTriggerToast={onTriggerToast} />}
      />
      <Route
        path="/customize-artisanal"
        element={<CustomArtisanalOrderPage onTriggerToast={onTriggerToast} />}
      />
      <Route
        path="/category/custom-gifting/custom-yatra-lockets"
        element={<CustomArtisanalOrderPage onTriggerToast={onTriggerToast} />}
      />
      <Route
        path="/category/custom-yatra-lockets/customize"
        element={<CustomArtisanalOrderPage onTriggerToast={onTriggerToast} />}
      />
      <Route
        path="/category/custom-artisanal"
        element={<CustomArtisanalOrderPage onTriggerToast={onTriggerToast} />}
      />

      {/* Admin Studio Route Forwarder */}
      <Route path="/admin" element={<AdminRedirect />} />
      <Route path="/admin/*" element={<AdminRedirect />} />

      {/* Login & Register Auth Route */}
      <Route path="/login" element={<AuthPage onTriggerToast={onTriggerToast} />} />
      <Route path="/register" element={<AuthPage onTriggerToast={onTriggerToast} />} />

      {/* Saved Addresses Route */}
      <Route path="/addresses" element={<AddressPage onTriggerToast={onTriggerToast} />} />
      <Route path="/account/addresses" element={<AddressPage onTriggerToast={onTriggerToast} />} />

      {/* User Orders Route */}
      <Route path="/orders" element={<OrdersPage onTriggerToast={onTriggerToast} />} />
      <Route path="/account/orders" element={<OrdersPage onTriggerToast={onTriggerToast} />} />

      {/* Home Page */}
      <Route
        path="/"
        element={
          <HomePage
            products={products}
            categories={categories}
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
  );
}
