import React from 'react';
import HeroSlider from './HeroSlider';
import CategoryShowcaseStrip from './CategoryShowcaseStrip';
import PolicyBadges from './PolicyBadges';
import TopSellerSection from './TopSellerSection';
import ShopByColor from './ShopByColor';
import ShopOnBudget from './ShopOnBudget';
import CuratedCollections from './CuratedCollections';
import SilverTreasureSection from './SilverTreasureSection';
import SegmentedTabsShowcase from './SegmentedTabsShowcase';
import SilverCoinsSection from './SilverCoinsSection';
import ExploreCatalogGrid from './ExploreCatalogGrid';
import Testimonials from './Testimonials';

export default function HomePage({
  products = [],
  categories = [],
  onNavigateCategory,
  onNavigateYatraCustomizer,
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  onQuickView,
  onSelectProduct
}) {
  return (
    <div className="space-y-0 bg-[var(--th-bg)] transition-colors duration-300">
      {/* 1. Hero Showcase Slider */}
      <HeroSlider
        onNavigateCategory={onNavigateCategory}
        onNavigateYatraCustomizer={onNavigateYatraCustomizer}
      />

      {/* 2. Visual Category Showcase Strip */}
      <CategoryShowcaseStrip
        onNavigateCategory={onNavigateCategory}
      />

      {/* 3. Policy & Trust Badges Section */}
      <PolicyBadges />

      {/* 3. Top Seller Section */}
      <TopSellerSection
        products={products}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        wishlistIds={wishlistIds}
        onQuickView={onQuickView}
        onSelectProduct={onSelectProduct}
        onNavigateCategory={onNavigateCategory}
      />

      {/* 4. Shop by Color / Finish Section */}
      <ShopByColor
        onNavigateCategory={onNavigateCategory}
      />

      {/* 5. Shop on Budget Section */}
      <ShopOnBudget
        onNavigateCategory={onNavigateCategory}
      />

      {/* 6. Curated Collections for Your Loved Ones */}
      <CuratedCollections
        onNavigateCategory={onNavigateCategory}
      />

      {/* 7. Silver Treasure (Category Highlights) */}
      <SilverTreasureSection
        onNavigateCategory={onNavigateCategory}
        onNavigateYatraCustomizer={onNavigateYatraCustomizer}
      />

      {/* 8. Segmented Product Showcase (Tabs: Men, Women, Kids) */}
      <SegmentedTabsShowcase
        products={products}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        wishlistIds={wishlistIds}
        onQuickView={onQuickView}
        onSelectProduct={onSelectProduct}
        onNavigateCategory={onNavigateCategory}
      />

      {/* 9. Silver Coins & Bars Section */}
      <SilverCoinsSection
        onNavigateCategory={onNavigateCategory}
        onNavigateYatraCustomizer={onNavigateYatraCustomizer}
      />

      {/* 10. Explore Now (Product Catalog Grid with 16 products) */}
      <ExploreCatalogGrid
        products={products}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        wishlistIds={wishlistIds}
        onQuickView={onQuickView}
        onSelectProduct={onSelectProduct}
        onNavigateCategory={onNavigateCategory}
      />

      {/* Customer Testimonials & Reviews */}
      <Testimonials />
    </div>
  );
}
