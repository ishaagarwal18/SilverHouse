import React, { useEffect } from 'react';
import HeroSlider from './HeroSlider';
import CategoryShowcaseStrip from './CategoryShowcaseStrip';
import PolicyBadges from './PolicyBadges';
import TopSellerSection from './TopSellerSection';
import ShopByColor from './ShopByColor';
import ShopOnBudget from './ShopOnBudget';
import ShopByWeight from './ShopByWeight';
import CuratedCollections from './CuratedCollections';
import SilverTreasureSection from './SilverTreasureSection';
import SegmentedTabsShowcase from './SegmentedTabsShowcase';
import SilverCoinsSection from './SilverCoinsSection';
import YatraLocketSpotlight from './YatraLocketSpotlight';
import ExploreCatalogGrid from './ExploreCatalogGrid';
import Testimonials from './Testimonials';
import FestivalSection from './FestivalSection';
import RecentlyViewedSection from '../common/RecentlyViewedSection';
import ScrollReveal from '../common/ScrollReveal';

export default function HomePage({
  products = [],
  categories = [],
  festivals = [],
  festivalCategories = [],
  onNavigateCategory,
  onNavigateYatraCustomizer,
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  onQuickView,
  onSelectProduct
}) {
  useEffect(() => {
    document.title = 'SilverHouse | Pure 925 Sterling & 999 Fine Silver Jewellery & Coins';
  }, []);

  return (
    <div className="space-y-0 bg-[var(--th-bg)] transition-colors duration-300">
      {/* 1. Hero Showcase Slider */}
      <HeroSlider
        onNavigateCategory={onNavigateCategory}
        onNavigateYatraCustomizer={onNavigateYatraCustomizer}
      />

      {/* 2. Visual Category Showcase Strip */}
      <ScrollReveal animation="fade-up">
        <CategoryShowcaseStrip
          categories={categories}
          products={products}
          onNavigateCategory={onNavigateCategory}
        />
      </ScrollReveal>

      {/* 3. Live Festival Showcase Section */}
      <ScrollReveal animation="fade-up">
        <FestivalSection
          festivals={festivals}
          festivalCategories={festivalCategories}
          categories={categories}
          products={products}
          onNavigateCategory={onNavigateCategory}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          wishlistIds={wishlistIds}
          onQuickView={onQuickView}
          onSelectProduct={onSelectProduct}
        />
      </ScrollReveal>

      {/* 4. Policy & Trust Badges Section */}
      <ScrollReveal animation="fade-up" delay={100}>
        <PolicyBadges />
      </ScrollReveal>

      {/* 3. Top Seller Section */}
      <ScrollReveal animation="fade-up">
        <TopSellerSection
          products={products}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          wishlistIds={wishlistIds}
          onQuickView={onQuickView}
          onSelectProduct={onSelectProduct}
          onNavigateCategory={onNavigateCategory}
        />
      </ScrollReveal>

      {/* 4. Shop by Color / Finish Section */}
      <ScrollReveal animation="fade-up">
        <ShopByColor
          onNavigateCategory={onNavigateCategory}
        />
      </ScrollReveal>

      {/* 5. Shop on Budget Section */}
      <ScrollReveal animation="fade-up">
        <ShopOnBudget
          onNavigateCategory={onNavigateCategory}
        />
      </ScrollReveal>

      {/* 6. Shop by Weight (Grams) Section */}
      <ScrollReveal animation="fade-up">
        <ShopByWeight
          products={products}
          onNavigateCategory={onNavigateCategory}
        />
      </ScrollReveal>

      {/* 7. Curated Collections for Your Loved Ones */}
      <ScrollReveal animation="zoom-in">
        <CuratedCollections
          onNavigateCategory={onNavigateCategory}
        />
      </ScrollReveal>

      {/* 7. Silver Treasure (Category Highlights) */}
      <ScrollReveal animation="fade-up">
        <SilverTreasureSection
          onNavigateCategory={onNavigateCategory}
          onNavigateYatraCustomizer={onNavigateYatraCustomizer}
        />
      </ScrollReveal>

      {/* 8. Segmented Product Showcase (Tabs: Men, Women, Kids) */}
      <ScrollReveal animation="fade-up">
        <SegmentedTabsShowcase
          products={products}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          wishlistIds={wishlistIds}
          onQuickView={onQuickView}
          onSelectProduct={onSelectProduct}
          onNavigateCategory={onNavigateCategory}
        />
      </ScrollReveal>

      {/* 9. Personalized Sacred Yatra Locket Spotlight */}
      <ScrollReveal animation="fade-up">
        <YatraLocketSpotlight
          onNavigateCustomizer={onNavigateYatraCustomizer}
        />
      </ScrollReveal>

      {/* 10. Silver Coins & Bars Section */}
      <ScrollReveal animation="fade-up">
        <SilverCoinsSection
          onNavigateCategory={onNavigateCategory}
          onNavigateYatraCustomizer={onNavigateYatraCustomizer}
        />
      </ScrollReveal>

      {/* 10. Explore Now (Product Catalog Grid with 16 products) */}
      <ScrollReveal animation="fade-up">
        <ExploreCatalogGrid
          products={products}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          wishlistIds={wishlistIds}
          onQuickView={onQuickView}
          onSelectProduct={onSelectProduct}
          onNavigateCategory={onNavigateCategory}
        />
      </ScrollReveal>

      {/* 11. Recently Viewed Products Section */}
      <ScrollReveal animation="fade-up">
        <RecentlyViewedSection
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          wishlistIds={wishlistIds}
          onQuickView={onQuickView}
          onSelectProduct={onSelectProduct}
        />
      </ScrollReveal>

      {/* Customer Testimonials & Reviews */}
      <ScrollReveal animation="fade-up">
        <Testimonials />
      </ScrollReveal>
    </div>
  );
}
