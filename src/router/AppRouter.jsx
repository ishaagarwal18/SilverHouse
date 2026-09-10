import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from '../components/home/HomePage';
import ProductListingPage from '../components/plp/ProductListingPage';
import ProductDetailPage from '../components/pdp/ProductDetailPage';
import AuthPage from '../components/auth/AuthPage';
import AddressPage from '../components/account/AddressPage';
import OrdersPage from '../components/account/OrdersPage';

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
    navigate('/category/custom-gifting/custom-yatra-lockets');
  };

  const handleSelectProduct = (product) => {
    if (product && product.id) {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <Routes>
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
