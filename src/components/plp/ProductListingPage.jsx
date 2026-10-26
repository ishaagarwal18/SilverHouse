import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CATEGORIES, PRODUCTS, isCustomOnlyCategory } from '../../data/products';
import { fetchProducts, fetchTargetAudiences } from '../../services/api';
import { getActiveCategoryIds } from '../../utils/festivalUtils';
import {
  Filter, Grid3X3, Grid2X2, LayoutGrid, ChevronRight, SlidersHorizontal,
  Heart, Eye, ShoppingBag, Star, Sparkles, X, Check, Search, RotateCcw, Flame, ArrowLeft, Scale
} from 'lucide-react';
import ScrollReveal from '../common/ScrollReveal';

export default function ProductListingPage({
  products,
  categories,
  festivals = [],
  festivalCategories = [],
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
  onQuickView,
  onSelectProduct,
  onNavigateYatraCustomizer
}) {
  const { categoryId, subcategoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const colorQueryParam = searchParams.get('color');
  const recipientQueryParam = searchParams.get('recipient') || searchParams.get('ideal_for') || searchParams.get('audience');
  const minPriceQuery = searchParams.get('minPrice');
  const maxPriceQuery = searchParams.get('maxPrice');
  const minWeightQuery = searchParams.get('minWeight');
  const maxWeightQuery = searchParams.get('maxWeight');
  const searchQueryParam = searchParams.get('q') || searchParams.get('search') || '';

  const categoryList = (categories && categories.length > 0) ? categories : CATEGORIES;

  const initialCategory = (categoryId === 'baby-silver') ? 'kids' : ((categoryId === 'pooja-articles' || categoryId === 'puja-articles' || categoryId === 'divine-puja' || categoryId === 'all-divine-artifacts') ? 'puja' : (categoryId || 'all'));
  const [searchQuery, setSearchQuery] = useState(() => searchQueryParam);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState(subcategoryId || 'all');
  const [selectedPurity, setSelectedPurity] = useState('all');
  const [selectedRecipient, setSelectedRecipient] = useState(() => recipientQueryParam || 'all');
  const [selectedColor, setSelectedColor] = useState(colorQueryParam || 'all');
  const [minPrice, setMinPrice] = useState(() => (minPriceQuery !== null && !isNaN(Number(minPriceQuery)) ? Number(minPriceQuery) : 0));
  const [maxPrice, setMaxPrice] = useState(() => (maxPriceQuery !== null && !isNaN(Number(maxPriceQuery)) ? Number(maxPriceQuery) : 100000));
  const [minWeight, setMinWeight] = useState(() => (minWeightQuery !== null && !isNaN(Number(minWeightQuery)) ? Number(minWeightQuery) : 0));
  const [maxWeight, setMaxWeight] = useState(() => (maxWeightQuery !== null && !isNaN(Number(maxWeightQuery)) ? Number(maxWeightQuery) : 10000));
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [gridCols, setGridCols] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640 ? 2 : 4;
    }
    return 4;
  }); // 2, 3, 4
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [backendItems, setBackendItems] = useState(null);
  const [targetAudiences, setTargetAudiences] = useState([]);

  // Compute maximum product price dynamically from active catalog items
  const catalogMaxPrice = useMemo(() => {
    const list = (products && products.length > 0) ? products : (backendItems || []);
    if (!list || list.length === 0) return 100000;
    const highest = Math.max(...list.map(p => Number(p.price || 0)));
    return Math.max(Math.ceil(highest / 500) * 500, 1000);
  }, [products, backendItems]);

  const priceStep = useMemo(() => {
    return Math.max(100, Math.min(500, Math.floor(catalogMaxPrice / 50)));
  }, [catalogMaxPrice]);

  // Sync search keyword with URL param if present
  useEffect(() => {
    if (searchQueryParam) {
      setSearchQuery(searchQueryParam);
    }
  }, [searchQueryParam]);

  // Update document title for PLP
  useEffect(() => {
    let title = 'Silver Catalog & Collection - SilverHouse';
    if (selectedCategory && selectedCategory !== 'all') {
      const cat = categoryList.find(c => String(c.id) === String(selectedCategory));
      if (cat && cat.name) title = `${cat.name} Collection | SilverHouse`;
    }
    document.title = title;
  }, [selectedCategory, categoryList]);

  // Sync state if categoryId / subcategoryId route params change
  useEffect(() => {
    const resolved = (categoryId === 'baby-silver') ? 'kids' : ((categoryId === 'pooja-articles' || categoryId === 'puja-articles' || categoryId === 'divine-puja' || categoryId === 'all-divine-artifacts') ? 'puja' : (categoryId || 'all'));
    setSelectedCategory(resolved);
    setSelectedSubcategory(subcategoryId || 'all');
  }, [categoryId, subcategoryId]);

  // Sync color filter with URL search param if present
  useEffect(() => {
    if (colorQueryParam) {
      setSelectedColor(colorQueryParam);
    }
  }, [colorQueryParam]);

  // Sync recipient/audience filter with URL search param if present
  useEffect(() => {
    if (recipientQueryParam) {
      setSelectedRecipient(recipientQueryParam);
    } else {
      setSelectedRecipient('all');
    }
  }, [recipientQueryParam]);

  // Sync budget/price filters with URL search params or active catalog dynamic max
  useEffect(() => {
    if (minPriceQuery !== null && !isNaN(Number(minPriceQuery))) {
      setMinPrice(Number(minPriceQuery));
    } else if (minPriceQuery === null) {
      setMinPrice(0);
    }
    if (maxPriceQuery !== null && !isNaN(Number(maxPriceQuery))) {
      setMaxPrice(Number(maxPriceQuery));
    } else if (maxPriceQuery === null) {
      setMaxPrice(catalogMaxPrice);
    }
  }, [minPriceQuery, maxPriceQuery, catalogMaxPrice]);

  // Adjust maxPrice when products load if it was set to initial fallback or exceeds catalog max
  useEffect(() => {
    if (maxPriceQuery === null && catalogMaxPrice > 0) {
      setMaxPrice(prev => (prev === 100000 || prev > catalogMaxPrice ? catalogMaxPrice : prev));
    }
  }, [catalogMaxPrice, maxPriceQuery]);

  // Sync weight filters with URL search params if present
  useEffect(() => {
    if (minWeightQuery !== null && !isNaN(Number(minWeightQuery))) {
      setMinWeight(Number(minWeightQuery));
    } else if (minWeightQuery === null) {
      setMinWeight(0);
    }
    if (maxWeightQuery !== null && !isNaN(Number(maxWeightQuery))) {
      setMaxWeight(Number(maxWeightQuery));
    } else if (maxWeightQuery === null) {
      setMaxWeight(10000);
    }
  }, [minWeightQuery, maxWeightQuery]);

  // Fetch live products from backend if not already supplied via props
  useEffect(() => {
    let isMounted = true;
    async function loadFilteredData() {
      if (!products || products.length === 0) {
        const fetched = await fetchProducts();
        if (isMounted && fetched && fetched.length > 0) {
          setBackendItems(fetched);
        }
      }
    }
    loadFilteredData();
    return () => { isMounted = false; };
  }, [products]);

  // Fetch live target audiences from target audience table (dbo.ideal_for)
  useEffect(() => {
    let isMounted = true;
    fetchTargetAudiences().then((rows) => {
      if (isMounted && Array.isArray(rows) && rows.length > 0) {
        setTargetAudiences(rows);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Format dynamic target audience filter options
  const audienceList = useMemo(() => {
    if (targetAudiences && targetAudiences.length > 0) {
      const list = [{ id: 'all', label: 'All Items' }];
      targetAudiences.forEach((t) => {
        const name = String(t.ideal_for || '').trim();
        if (!name || name.toLowerCase() === 'all') return;
        let label = name;
        if (name.toLowerCase() === 'puja') label = 'Puja & Devotion';
        else if (name.toLowerCase() === 'kids') label = 'Baby & Kids';
        list.push({ id: name, label });
      });
      return list;
    }
    return [
      { id: 'all', label: 'All Items' },
      { id: 'Puja', label: 'Puja & Devotion' },
      { id: 'Men', label: 'Men' },
      { id: 'Women', label: 'Women' },
      { id: 'Kids', label: 'Baby & Kids' },
      { id: 'Unisex', label: 'Unisex' }
    ];
  }, [targetAudiences]);

  const VIRTUAL_CATEGORIES = {
    women: {
      id: "women",
      name: "Women's Silver Collection",
      description: "Sacred 925 sterling silver rings, pendants, bangles, and payal for women.",
      heroBanner: "/images/hero_silver_coins.png"
    },
    mens: {
      id: "mens",
      name: "Men's Silver Collection",
      description: "Bold silver bracelets, kadhas, and signet rings crafted exclusively for men.",
      heroBanner: "/images/categories/cat_men_in_silver.jpg"
    },
    'men-in-silver': {
      id: "men-in-silver",
      name: "Men's Silver Collection",
      description: "Bold silver bracelets, kadhas, and signet rings crafted exclusively for men.",
      heroBanner: "/images/categories/cat_men_in_silver.jpg"
    },
    'men-silver-collection': {
      id: "men-silver-collection",
      name: "Men's Silver Collection",
      description: "Bold silver bracelets, kadhas, and signet rings crafted exclusively for men.",
      heroBanner: "/images/categories/cat_men_in_silver.jpg"
    },
    kids: {
      id: "kids",
      name: "Kids' Silver Collection",
      description: "Protective silver nazariya beads, baby feeding silver sets, and baby bracelets.",
      heroBanner: "/images/hero_baby_nazariya.png"
    },
    'baby-silver': {
      id: "kids",
      name: "Kids' Silver Collection",
      description: "Protective silver nazariya beads, baby feeding silver sets, and baby bracelets.",
      heroBanner: "/images/hero_baby_nazariya.png"
    },
    puja: {
      id: "puja",
      name: "Divine Puja Articles",
      description: "Sacred pure 999 and 925 silver idols, pooja thalis, diyas, and divine devotional creations.",
      heroBanner: "/images/hero_silver_coins.png"
    },
    'puja-articles': {
      id: "puja",
      name: "Divine Puja Articles",
      description: "Sacred pure 999 and 925 silver idols, pooja thalis, diyas, and divine devotional creations.",
      heroBanner: "/images/hero_silver_coins.png"
    },
    'pooja-articles': {
      id: "puja",
      name: "Divine Puja Articles",
      description: "Sacred pure 999 and 925 silver idols, pooja thalis, diyas, and divine devotional creations.",
      heroBanner: "/images/hero_silver_coins.png"
    },
    'divine-puja': {
      id: "puja",
      name: "Divine Puja Articles",
      description: "Sacred pure 999 and 925 silver idols, pooja thalis, diyas, and divine devotional creations.",
      heroBanner: "/images/hero_silver_coins.png"
    },
    'all-divine-artifacts': {
      id: "puja",
      name: "Divine Puja Articles",
      description: "Sacred pure 999 and 925 silver idols, pooja thalis, diyas, and divine devotional creations.",
      heroBanner: "/images/hero_silver_coins.png"
    },
    jewellery: {
      id: "jewellery",
      name: "All Silver Jewellery",
      description: "Explore 925 sterling silver rings, chains, bangles, payal, and bracelets.",
      heroBanner: "/images/hero_silver_coins.png"
    },
    'custom-gifting': {
      id: "custom-gifting",
      name: "Personalized Yatra Lockets & Custom Silver",
      description: "Custom made-on-order 925 sterling silver yatra shrine lockets & personalized sacred artifacts.",
      heroBanner: "/images/hero_yatra_locket.png"
    },
    'custom-yatra-lockets': {
      id: "custom-yatra-lockets",
      name: "Sacred Yantra & Personalized Yatra Lockets",
      description: "Preserve pilgrimage memories with deity photos and gotra laser engraving on solid 925 sterling silver.",
      heroBanner: "/images/categories/cat_yantra.jpg"
    },
    'yantra': {
      id: "yantra",
      name: "Sacred Yantra & Custom Yatra Lockets",
      description: "Consecrated Sri Yantra, Mahamrityunjaya kavach, and personalized pilgrimage shrine lockets in pure silver.",
      heroBanner: "/images/categories/cat_yantra.jpg"
    },
    'rings': {
      id: "rings",
      name: "Silver Rings",
      description: "Sparkling cubic zirconia solitaires, floral bands, and luxury 925 sterling silver rings.",
      heroBanner: "/images/categories/cat_rings.jpg"
    },
    'silver-rings': {
      id: "silver-rings",
      name: "Silver Rings",
      description: "Sparkling cubic zirconia solitaires, floral bands, and luxury 925 sterling silver rings.",
      heroBanner: "/images/categories/cat_rings.jpg"
    },
    'bracelet': {
      id: "bracelet",
      name: "Silver Bracelets & Kadas",
      description: "Artisanal 925 sterling silver tennis bracelets, charm cuffs, and traditional kadas.",
      heroBanner: "/images/categories/cat_bracelets.jpg"
    },
    'bracelets': {
      id: "bracelets",
      name: "Silver Bracelets & Kadas",
      description: "Artisanal 925 sterling silver tennis bracelets, charm cuffs, and traditional kadas.",
      heroBanner: "/images/categories/cat_bracelets.jpg"
    },
    'idols': {
      id: "idols",
      name: "Silver Religious Idols",
      description: "Pure 999 fine silver devotional murti, Ganesha, Laxmi, and sacred temple deities.",
      heroBanner: "/images/categories/cat_idols.jpg"
    },
    'silver-idols': {
      id: "silver-idols",
      name: "Silver Religious Idols",
      description: "Pure 999 fine silver devotional murti, Ganesha, Laxmi, and sacred temple deities.",
      heroBanner: "/images/categories/cat_idols.jpg"
    },
    'silver-religious-idols': {
      id: "silver-religious-idols",
      name: "Silver Religious Idols",
      description: "Pure 999 fine silver devotional murti, Ganesha, Laxmi, and sacred temple deities.",
      heroBanner: "/images/categories/cat_idols.jpg"
    },
    'utensils': {
      id: "utensils",
      name: "Silver Utensils & Pooja Articles",
      description: "Sacred pure 999 and 925 silver pooja kalash, akhand diya, panchpatra, and puja thali vessels.",
      heroBanner: "/images/categories/cat_utensils.jpg"
    },
    'silver-utensils-pooja': {
      id: "silver-utensils-pooja",
      name: "Silver Utensils & Pooja Articles",
      description: "Sacred pure 999 and 925 silver pooja kalash, akhand diya, panchpatra, and puja thali vessels.",
      heroBanner: "/images/categories/cat_utensils.jpg"
    },
    'pendants': {
      id: "pendants",
      name: "Silver Pendants & Lockets",
      description: "Radiant solitaire halos, devotional lockets, and sacred yatra pendants in 925 sterling silver.",
      heroBanner: "/images/categories/cat_pendants.jpg"
    },
    'silver-earrings': {
      id: "silver-earrings",
      name: "Silver Earrings",
      description: "Sparkling snowflake studs, classic solitaires, and antique silver jhumkas.",
      heroBanner: "/images/categories/cat_earrings.jpg"
    },
    'earrings': {
      id: "earrings",
      name: "Silver Earrings",
      description: "Sparkling snowflake studs, classic solitaires, and antique silver jhumkas.",
      heroBanner: "/images/categories/cat_earrings.jpg"
    },
    'earings': {
      id: "earings",
      name: "Silver Earrings",
      description: "Sparkling snowflake studs, classic solitaires, and antique silver jhumkas.",
      heroBanner: "/images/categories/cat_earrings.jpg"
    },
    'chain': {
      id: "chain",
      name: "Pure Silver Chains",
      description: "Heavy Cuban links, sleek Italian curb chains, and radiant everyday 925 silver chains.",
      heroBanner: "/images/categories/cat_silver_chains.jpg"
    },
    'chains': {
      id: "chains",
      name: "Pure Silver Chains",
      description: "Heavy Cuban links, sleek Italian curb chains, and radiant everyday 925 silver chains.",
      heroBanner: "/images/categories/cat_silver_chains.jpg"
    },
    'silver-chains': {
      id: "silver-chains",
      name: "Pure Silver Chains",
      description: "Heavy Cuban links, sleek Italian curb chains, and radiant everyday 925 silver chains.",
      heroBanner: "/images/categories/cat_silver_chains.jpg"
    },
    'nazariya': {
      id: "nazariya",
      name: "Kids Nazariya & Bracelets",
      description: "Protective black bead silver nazariya, evil eye charm bracelets, and baby kada pairs.",
      heroBanner: "/images/categories/cat_nazariya.jpg"
    },
    'kids-nazariya-bracelets': {
      id: "kids-nazariya-bracelets",
      name: "Kids Nazariya & Bracelets",
      description: "Protective black bead silver nazariya, evil eye charm bracelets, and baby kada pairs.",
      heroBanner: "/images/categories/cat_nazariya.jpg"
    },
    'anklets': {
      id: "anklets",
      name: "Silver Payal & Anklets",
      description: "Ethnic bridal payals, chiming ghungroo bells, and lightweight daily wear sterling anklets.",
      heroBanner: "/images/categories/cat_anklets.jpg"
    },
    'silver-payal-anklets': {
      id: "silver-payal-anklets",
      name: "Silver Payal & Anklets",
      description: "Ethnic bridal payals, chiming ghungroo bells, and lightweight daily wear sterling anklets.",
      heroBanner: "/images/categories/cat_anklets.jpg"
    },
    'silver-sets': {
      id: "silver-sets",
      name: "Silver Sets & Pairs",
      description: "Matching ruby bridal sets, bangle pairs, and sacred murti worship sets.",
      heroBanner: "/images/categories/cat_sets.jpg"
    },
    'sets': {
      id: "sets",
      name: "Silver Sets & Pairs",
      description: "Matching ruby bridal sets, bangle pairs, and sacred murti worship sets.",
      heroBanner: "/images/categories/cat_sets.jpg"
    }
  };

  const activeCategoryObj = (() => {
    if (selectedCategory === 'all' || !selectedCategory) {
      return {
        id: 'all',
        name: 'Curated Silver Collection',
        description: 'Explore our complete range of certified 925 sterling silver jewellery, 999 fine silver coins, puja idols, and bespoke artisanal creations.',
        heroBanner: '/images/hero_silver_coins.png'
      };
    }
    
    let resolved = categoryList.find(c =>
      String(c.id).toLowerCase() === String(selectedCategory).toLowerCase() ||
      String(c.slug).toLowerCase() === String(selectedCategory).toLowerCase() ||
      String(c.category_id) === String(selectedCategory)
    ) || VIRTUAL_CATEGORIES[selectedCategory];
    
    if (!resolved) {
      const fMatch = festivals?.find(f =>
        String(f.id || '').toLowerCase() === String(selectedCategory).toLowerCase() ||
        String(f.slug || '').toLowerCase() === String(selectedCategory).toLowerCase() ||
        String(f.shortName || '').toLowerCase() === String(selectedCategory).toLowerCase() ||
        String(f.name || '').toLowerCase() === String(selectedCategory).toLowerCase() ||
        (f.name && f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === String(selectedCategory).toLowerCase())
      );
      if (fMatch) {
        resolved = {
          id: fMatch.id,
          name: fMatch.name || fMatch.shortName,
          description: fMatch.description || `Special curated pure silver collection for ${fMatch.name}`,
          heroBanner: fMatch.heroBanner || '/images/hero_silver_coins.png'
        };
      }
    }
    
    return resolved || {
      id: selectedCategory,
      name: selectedCategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: 'Explore authentic 925 sterling silver products from our curated collection.',
      heroBanner: '/images/hero_silver_coins.png'
    };
  })();

  // Accurate Matchers to eliminate bugs
  const isMenProduct = (p) => {
    if (p.category === 'men-silver-collection') return true;
    const target = (p.recipient || p.ideal_for || p.idealFor || '').toLowerCase();
    // Critical: NEVER match women products!
    if (target.includes('women')) return false;
    const words = target.split(/[\s,]+/);
    return words.includes('men') || words.includes("men's");
  };

  const isWomenProduct = (p) => {
    const target = (p.recipient || p.ideal_for || p.idealFor || '').toLowerCase();
    // Critical: NEVER match products meant solely for men!
    if (!target.includes('women') && (target.includes('men') || target.includes("men's"))) return false;
    return target.includes('women');
  };

  const isKidsProduct = (p) => {
    const target = String(p.ideal_for || p.recipient || p.idealFor || '').toLowerCase().trim();
    const words = target.split(/[\s,]+/);
    return words.includes('kids') || words.includes('kid') || words.includes('children');
  };

  const isPujaProduct = (p) => {
    const target = String(p.ideal_for || p.recipient || p.idealFor || '').toLowerCase().trim();
    if (target.includes('puja') || target.includes('pooja')) return true;
    const cat = String(p.category || p.category_slug || p.category_name || '').toLowerCase().trim();
    if (cat.includes('puja') || cat.includes('pooja')) return true;
    if (Number(p.category_id) === 8) return true;
    return false;
  };

  const matchesOccasionOrAudience = (p, filter) => {
    if (!filter || filter === 'all') return true;
    const f = filter.toLowerCase().trim();
    const pAudience = String(p.ideal_for || p.recipient || p.idealFor || '').toLowerCase().trim();

    if (f === 'men' || f === 'mens') {
      return isMenProduct(p);
    }
    if (f === 'women') {
      return isWomenProduct(p);
    }
    if (f === 'kids' || f === 'baby') {
      return isKidsProduct(p);
    }
    if (f === 'puja' || f === 'pooja') {
      return isPujaProduct(p);
    }
    if (f === 'unisex') {
      return pAudience.includes('unisex') || pAudience.includes('all');
    }

    return pAudience === f || pAudience.includes(f);
  };

  // Normalized Filtered List from Live Database
  const filteredProducts = useMemo(() => {
    const rawList = (products && products.length > 0) ? products : (backendItems || []);
    let result = [...rawList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category_name || p.category || '').toLowerCase().includes(q) ||
        (p.purity || '').toLowerCase().includes(q) ||
        (p.color || '').toLowerCase().includes(q)
      );
    }

    // Category / Collection Filtering
    if (selectedCategory !== 'all') {
      // Check if selectedCategory is a Festival ID, Slug, or Name
      const matchedFestival = (festivals || []).find(f =>
        String(f.id || '').toLowerCase() === String(selectedCategory).toLowerCase() ||
        String(f.slug || '').toLowerCase() === String(selectedCategory).toLowerCase() ||
        String(f.shortName || '').toLowerCase() === String(selectedCategory).toLowerCase() ||
        String(f.name || '').toLowerCase() === String(selectedCategory).toLowerCase() ||
        (f.name && f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === String(selectedCategory).toLowerCase())
      );

      if (matchedFestival) {
        const festivalCategoryIds = getActiveCategoryIds([matchedFestival], festivalCategories, categories);
        if (festivalCategoryIds.size > 0) {
          result = result.filter(p => {
            const pCatId = Number(p.category_id || p.categoryId);
            if (!isNaN(pCatId) && festivalCategoryIds.has(pCatId)) return true;

            const pCatStr = String(p.category_id || p.categoryId || p.category_name || p.category || '').toLowerCase().trim();
            for (const catId of festivalCategoryIds) {
              const matchingCat = (categories || []).find(c => Number(c.category_id || c.id) === catId);
              if (matchingCat) {
                if (String(matchingCat.name || '').toLowerCase().trim() === pCatStr) return true;
                if (String(matchingCat.slug || '').toLowerCase().trim() === pCatStr) return true;
              }
            }
            return false;
          });
        }
      } else if (selectedCategory === 'festive' || selectedCategory === 'festive-edits' || selectedCategory === 'festive-collection') {
        const festivalCategoryIds = getActiveCategoryIds(festivals, festivalCategories, categories);
        if (festivalCategoryIds.size > 0) {
          result = result.filter(p => {
            const pCatId = Number(p.category_id || p.categoryId);
            if (!isNaN(pCatId) && festivalCategoryIds.has(pCatId)) return true;
            return false;
          });
        }
      } else if (selectedCategory === 'women') {
        result = result.filter(isWomenProduct);
      } else if (selectedCategory === 'mens' || selectedCategory === 'men' || selectedCategory === 'men-silver-collection' || selectedCategory === 'men-in-silver') {
        result = result.filter(isMenProduct);
      } else if (selectedCategory === 'kids' || selectedCategory === 'kids-baby' || selectedCategory === 'kids-nazariya-bracelets' || selectedCategory === 'baby-silver') {
        result = result.filter(isKidsProduct);
      } else if (selectedCategory === 'puja' || selectedCategory === 'pooja' || selectedCategory === 'pooja-articles' || selectedCategory === 'puja-articles' || selectedCategory === 'divine-puja' || selectedCategory === 'all-divine-artifacts') {
        result = result.filter(isPujaProduct);
      } else if (selectedCategory === 'jewellery') {
        result = result.filter(p =>
          ['rings', 'pendants', 'bangles-bracelets', 'anklets-payal', 'silver-chains', 'nazariya', 'spiritual-wear', 'silver-rings', 'silver-pendants-chains', 'silver-bangles-kadas', 'silver-payal-anklets'].includes(p.category) ||
          [1, 5, 10, 11, 12, 13].includes(Number(p.category_id))
        );
      } else {
        // Pure Dynamic Database Category Matcher (strictly no hardcoded keyword guessing)
        const selLow = String(selectedCategory || '').toLowerCase().trim();
        const activeCategories = (categories && categories.length > 0) ? categories : categoryList;
        const matchedCat = activeCategories.find(c =>
          String(c.id).toLowerCase() === selLow ||
          String(c.slug).toLowerCase() === selLow ||
          String(c.category_id) === selLow ||
          String(c.name).toLowerCase() === selLow
        );

        if (matchedCat) {
          result = result.filter(p => {
            // 1. Direct Category ID match from database
            if (matchedCat.category_id !== null && matchedCat.category_id !== undefined) {
              const pCatId = p.category_id ?? p.categoryId;
              if (pCatId !== null && pCatId !== undefined && Number(pCatId) === Number(matchedCat.category_id)) {
                return true;
              }
            }
            // 2. Direct Slug / Identifier match from database
            const catSlug = String(matchedCat.slug || matchedCat.id || '').toLowerCase().trim();
            const pCat = String(p.category || p.category_slug || '').toLowerCase().trim();
            if (catSlug && (pCat === catSlug || pCat.replace(/-/g, '') === catSlug.replace(/-/g, ''))) {
              return true;
            }
            // 3. Name match from database
            const catName = String(matchedCat.name || '').toLowerCase().trim();
            const pCatName = String(p.category_name || '').toLowerCase().trim();
            if (catName && pCatName === catName) {
              return true;
            }
            return false;
          });
        } else {
          result = result.filter(p => {
            const pCatId = String(p.category_id ?? p.categoryId ?? '');
            const pCat = String(p.category || '').toLowerCase().trim();
            const pSlug = String(p.category_slug || '').toLowerCase().trim();
            const pName = String(p.category_name || '').toLowerCase().trim();
            return pCatId === selLow || pCat === selLow || pSlug === selLow || pName === selLow;
          });
        }
      }
    }

    // Subcategory Filter
    if (selectedSubcategory !== 'all') {
      result = result.filter(p => p.subcategory === selectedSubcategory);
    }

    // Purity Filter
    if (selectedPurity !== 'all') {
      result = result.filter(p => {
        if (selectedPurity === '999') {
          return p.purityCode === '999' || String(p.purity).includes('999') || String(p.purity).includes('99.9');
        }
        if (selectedPurity === '925') {
          return p.purityCode === '925' || String(p.purity).includes('925') || String(p.purity).includes('92.5');
        }
        return p.purityCode === selectedPurity;
      });
    }

    // Color / Finish Filter
    if (selectedColor !== 'all') {
      result = result.filter(p => (p.color || '').toLowerCase() === selectedColor.toLowerCase());
    }

    // Occasion / Target Audience Filter
    if (selectedRecipient !== 'all') {
      result = result.filter(p => matchesOccasionOrAudience(p, selectedRecipient));
    }

    // In-Stock Only
    if (inStockOnly) {
      result = result.filter(p => p.inStock);
    }

    // Dual To-From Price Filter
    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // Silver Weight Filter (in Grams)
    if (minWeight > 0 || maxWeight < 10000) {
      result = result.filter(p => {
        const w = Number(p.weightGrams ?? (p.weight ? parseFloat(p.weight) : 0));
        return w >= minWeight && w <= maxWeight;
      });
    }

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.sold || 0) - (a.sold || 0));
    } else {
      // Default / Featured: strictly order by priority descending (more the priority that product should be first)
      result.sort((a, b) => {
        const pA = Number(a.priority !== undefined && a.priority !== null ? a.priority : 0);
        const pB = Number(b.priority !== undefined && b.priority !== null ? b.priority : 0);
        if (pA !== pB) return pB - pA;
        return Number(a.id || 0) - Number(b.id || 0);
      });
    }

    return result;
  }, [backendItems, products, searchQuery, selectedCategory, selectedSubcategory, selectedPurity, selectedColor, selectedRecipient, minPrice, maxPrice, minWeight, maxWeight, inStockOnly, sortBy]);

  const categoryCounts = useMemo(() => {
    const rawList = (products && products.length > 0) ? products : (backendItems || []);
    const counts = { all: rawList.length };
    rawList.forEach(p => {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
      if (p.category_slug) counts[p.category_slug] = (counts[p.category_slug] || 0) + 1;
    });

    // Virtual Collection Counts
    counts['women'] = rawList.filter(isWomenProduct).length;
    counts['mens'] = rawList.filter(isMenProduct).length;
    counts['men-silver-collection'] = counts['mens'];
    counts['kids'] = rawList.filter(isKidsProduct).length;
    counts['puja'] = rawList.filter(isPujaProduct).length;
    counts['puja-articles'] = counts['puja'];
    counts['pooja-articles'] = counts['puja'];
    counts['divine-puja'] = counts['puja'];
    counts['all-divine-artifacts'] = counts['puja'];
    counts['jewellery'] = rawList.filter(p => ['rings', 'pendants', 'bangles-bracelets', 'anklets-payal', 'silver-chains', 'nazariya', 'spiritual-wear', 'silver-rings', 'silver-pendants-chains', 'silver-bangles-kadas', 'silver-payal-anklets'].includes(p.category)).length;

    // Database Categories Dynamic Matching
    categoryList.forEach(cat => {
      const catCount = rawList.filter(p =>
        p.category === cat.id ||
        p.category_slug === cat.id ||
        p.category_slug === cat.slug ||
        String(p.category_id) === String(cat.category_id)
      ).length;
      counts[cat.id] = catCount;
      if (cat.slug) counts[cat.slug] = catCount;
    });

    return counts;
  }, [products, backendItems, categoryList]);

  const handleCategorySelect = (catId) => {
    let target = catId === 'baby-silver' ? 'kids' : catId;
    if (target === 'pooja-articles' || target === 'puja-articles' || target === 'divine-puja' || target === 'all-divine-artifacts') {
      target = 'puja';
    }
    setSelectedCategory(target);
    setSelectedSubcategory('all');
    if (target === 'all') {
      navigate('/catalog');
    } else {
      navigate(`/category/${target}`);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedPurity('all');
    setSelectedRecipient('all');
    setSelectedColor('all');
    setMinPrice(0);
    setMaxPrice(catalogMaxPrice);
    setMinWeight(0);
    setMaxWeight(10000);
    setInStockOnly(false);
    setSortBy('featured');
    if (categoryId || searchParams.get('color') || searchParams.get('minWeight')) {
      navigate('/catalog');
    }
  };

  return (
    <div className="bg-[var(--th-bg)] min-h-screen pb-20 transition-colors duration-300">

      {/* Category Hero Header Banner */}
      <div
        className="relative text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#D4AF37]/35 overflow-hidden  bg-[#081726]"
        style={{
          background: 'var(--th-nav-gradient, linear-gradient(135deg, #071526 0%, #0B2545 50%, #143A66 100%))',
          backgroundColor: 'var(--th-nav, #071526)'
        }}
      >
        {/* Deep dark luxury overlay & ambient aura ensuring rich, dark contrast */}
        <div className="absolute inset-0 bg-black/50 pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-[var(--th-accent)]/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-96 h-96 rounded-full bg-[var(--th-primary)]/30 blur-3xl pointer-events-none" />

        <div className="w-full mx-auto relative z-10">

          {/* Back Button & Breadcrumbs */}
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-md group shrink-0"
              title="Go back to previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[var(--th-accent)] group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>
            <nav className="flex items-center space-x-2 text-xs text-white/70 overflow-x-auto">
              <button
                onClick={() => navigate('/')}
                className="hover:text-[var(--th-accent)] cursor-pointer transition-colors text-white/80"
              >
                Home
              </button>
              <ChevronRight className="w-3 h-3 text-white/50" />
              {selectedCategory === 'all' ? (
                <span className="text-[var(--th-accent)] font-semibold">Catalog</span>
              ) : (
                <button
                  onClick={() => handleCategorySelect('all')}
                  className="hover:text-[var(--th-accent)] cursor-pointer text-white/80 transition-colors"
                >
                  Catalog
                </button>
              )}
              {activeCategoryObj && selectedCategory !== 'all' && (
                <>
                  <ChevronRight className="w-3 h-3 text-white/50" />
                  {selectedSubcategory === 'all' ? (
                    <span className="text-[var(--th-accent)] font-semibold">{activeCategoryObj.name}</span>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedSubcategory('all');
                        navigate(`/category/${selectedCategory}`);
                      }}
                      className="hover:text-[var(--th-accent)] cursor-pointer text-white/80 transition-colors"
                    >
                      {activeCategoryObj.name}
                    </button>
                  )}
                </>
              )}
              {selectedSubcategory !== 'all' && (
                <>
                  <ChevronRight className="w-3 h-3 text-white/50" />
                  <span className="text-[var(--th-accent)] font-semibold capitalize">
                    {selectedSubcategory.replace(/-/g, ' ')}
                  </span>
                </>
              )}
            </nav>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-[var(--th-accent)] uppercase tracking-widest bg-black/50 border border-[var(--th-accent)]/40 px-3.5 py-1 rounded-full inline-flex items-center">
                100% HALLMARKED PURE SILVER
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold mt-3 text-white tracking-tight drop-shadow-md">
                {searchQuery ? `Search: "${searchQuery}"` : (activeCategoryObj ? activeCategoryObj.name : "Curated Silver Collection")}
              </h1>
              <p className="text-xs sm:text-sm text-white/85 max-w-2xl mt-2.5 font-normal leading-relaxed">
                {searchQuery
                  ? `Showing certified hallmarked pure silver creations matching "${searchQuery}". Filter by purity, weight, or price below.`
                  : (activeCategoryObj ? activeCategoryObj.description : "Explore our complete range of certified 925 sterling silver and 999 fine silver murti, coins, utensils, rudraksha & custom lockets.")}
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-xs font-semibold text-[var(--th-accent)] flex items-center space-x-2 shrink-0">
              <Sparkles className="w-4 h-4 text-[var(--th-accent)]" />
              <span>Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'Design' : 'Designs'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-2.5 xs:px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">

        {/* Top Controls Bar */}
        <div className="bg-[var(--th-card)] p-3 sm:p-4 rounded-xl border border-[var(--th-border)] mb-6 sm:mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-xs">

          {/* Left: Mobile Filter Button & Active Filter Chips */}
          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-start flex-wrap gap-y-2">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden px-3 py-1.5 sm:px-4 sm:py-2 bg-[var(--th-primary-light)] text-[var(--th-text-main)] text-xs font-bold rounded-lg flex items-center space-x-2 border border-[var(--th-border)] transition-colors hover:bg-[var(--th-primary)] hover:text-white cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--th-primary)]" />
              <span>Filter Catalog ({filteredProducts.length})</span>
            </button>

            <span className="text-xs text-[var(--th-text-muted)] font-semibold hidden sm:inline-block">
              Showing <span className="text-[var(--th-text-main)] font-bold">{filteredProducts.length}</span> Products Found
            </span>

            {/* Active Filter Badges */}
            {(selectedCategory !== 'all' || selectedPurity !== 'all' || selectedColor !== 'all' || selectedRecipient !== 'all' || searchQuery || inStockOnly || minPrice > 0 || maxPrice < catalogMaxPrice || minWeight > 0 || maxWeight < 10000) && (
              <div className="flex items-center space-x-1.5 flex-wrap">
                {selectedCategory !== 'all' && (
                  <span className="bg-[var(--th-accent-light)] border border-[var(--th-accent)]/40 text-[var(--th-accent)] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-xs">
                    <span>Category: {activeCategoryObj?.name || selectedCategory}</span>
                    <button onClick={() => handleCategorySelect('all')} className="hover:opacity-75 ml-1"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedColor !== 'all' && (
                  <span className="bg-[var(--th-primary-light)] border border-[var(--th-border)] text-[var(--th-primary)] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-xs">
                    <span>Finish: {selectedColor}</span>
                    <button onClick={() => setSelectedColor('all')} className="hover:opacity-75 ml-1"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedPurity !== 'all' && (
                  <span className="bg-[var(--th-primary-light)] border border-[var(--th-border)] text-[var(--th-primary)] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-xs">
                    <span>Purity: {selectedPurity}</span>
                    <button onClick={() => setSelectedPurity('all')} className="hover:opacity-75 ml-1"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {(minPrice > 0 || maxPrice < catalogMaxPrice) && (
                  <span className="bg-[var(--th-primary-light)] border border-[var(--th-border)] text-[var(--th-primary)] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-xs font-outfit">
                    <span>₹{minPrice.toLocaleString('en-IN')} - ₹{maxPrice.toLocaleString('en-IN')}</span>
                    <button onClick={() => { setMinPrice(0); setMaxPrice(catalogMaxPrice); }} className="hover:opacity-75 ml-1"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {(minWeight > 0 || maxWeight < 10000) && (
                  <span className="bg-[var(--th-primary-light)] border border-[var(--th-border)] text-[var(--th-primary)] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-xs">
                    <Scale className="w-3 h-3 text-[var(--th-accent)] mr-0.5" />
                    <span>Weight: {minWeight === 0 ? `< ${maxWeight}g` : maxWeight >= 10000 ? `${minWeight}g+` : `${minWeight}g - ${maxWeight}g`}</span>
                    <button onClick={() => { setMinWeight(0); setMaxWeight(10000); }} className="hover:opacity-75 ml-1"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedRecipient !== 'all' && (
                  <span className="bg-[var(--th-primary-light)] border border-[var(--th-border)] text-[var(--th-primary)] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-xs">
                    <span>Target Audience: {selectedRecipient}</span>
                    <button onClick={() => setSelectedRecipient('all')} className="hover:opacity-75 ml-1"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {searchQuery && (
                  <span className="bg-[var(--th-primary-light)] border border-[var(--th-border)] text-[var(--th-text-main)] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-xs">
                    <span>"{searchQuery}"</span>
                    <button onClick={() => setSearchQuery('')} className="hover:text-red-600 ml-1"><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button
                  onClick={resetFilters}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center space-x-1 ml-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Grid Switcher */}
          <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4 w-full sm:w-auto">
            <span className="text-xs text-[var(--th-text-muted)] font-medium hidden sm:inline">Layout:</span>
            <div className="flex items-center space-x-1 bg-[var(--th-primary-light)] p-1 rounded-lg border border-[var(--th-border)]">
              {/* 2 Columns — always visible */}
              <button
                onClick={() => setGridCols(2)}
                className={`p-1.5 rounded transition-colors cursor-pointer ${gridCols === 2 ? 'bg-[var(--th-primary)] text-white shadow-xs' : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)]'}`}
                title="2 Columns View"
                aria-label="2 columns view"
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              {/* 3 Columns — tablet & desktop only */}
              <button
                onClick={() => setGridCols(3)}
                className={`hidden sm:inline-flex p-1.5 rounded transition-colors cursor-pointer ${gridCols === 3 ? 'bg-[var(--th-primary)] text-white shadow-xs' : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)]'}`}
                title="3 Columns View"
                aria-label="3 columns view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              {/* 4 Columns — desktop only */}
              <button
                onClick={() => setGridCols(4)}
                className={`hidden sm:inline-flex p-1.5 rounded transition-colors cursor-pointer ${gridCols === 4 ? 'bg-[var(--th-primary)] text-white shadow-xs' : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)]'}`}
                title="4 Columns View"
                aria-label="4 columns view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filter Backdrop */}
        {isMobileFilterOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in"
            onClick={() => setIsMobileFilterOpen(false)}
          />
        )}

        {/* Main Content Layout: Sidebar + Grid */}
        <div className="flex gap-8 items-start">

          {/* Interactive Sidebar Filters (Desktop & Mobile Drawer) */}
          <aside className={`w-72 bg-[var(--th-card)] p-6 rounded-2xl border border-[var(--th-border)] shadow-sm space-y-6 shrink-0 transition-colors ${isMobileFilterOpen ? 'fixed inset-y-0 left-0 z-50 overflow-y-auto w-80 max-w-[85vw] shadow-2xl block bg-[var(--th-card)]' : 'hidden lg:block sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto'
            }`}>
            <div className="flex items-center justify-between border-b border-[var(--th-border-subtle)] pb-3">
              <h3 className="font-serif font-bold text-base text-[var(--th-text-main)] flex items-center space-x-2">
                <Filter className="w-4 h-4 text-[var(--th-primary)]" />
                <span>Filter Catalog</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button onClick={resetFilters} className="text-xs text-[var(--th-primary)] hover:text-[var(--th-primary-hover)] hover:underline font-semibold flex items-center space-x-1 cursor-pointer">
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="lg:hidden p-1 rounded-lg text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:bg-[var(--th-surface-alt)] cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Keyword Filter */}
            <div>
              <label className="text-[11px] font-bold text-[var(--th-text-muted)] uppercase tracking-wider block mb-2">
                Search Keyword
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--th-text-muted)] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search item, style..."
                  className="w-full bg-white border border-[var(--th-border)] rounded-lg pl-9 pr-8 py-2 text-xs text-[var(--th-text-main)] placeholder-[var(--th-text-muted)] focus:outline-hidden focus:border-[var(--th-primary)] focus:ring-1 focus:ring-[var(--th-primary)] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-[var(--th-text-muted)] hover:text-[var(--th-text-main)]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Radio / Checkbox List */}
            <div className="border-t border-[var(--th-border-subtle)] pt-4">
              <label className="text-[11px] font-bold text-[var(--th-text-muted)] uppercase tracking-wider block mb-2.5">
                Categories & Collections
              </label>
              <div className="space-y-1.5 text-xs max-h-56 overflow-y-auto pr-1">
                {/* All Categories Option */}
                <label
                  onClick={() => handleCategorySelect('all')}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${selectedCategory === 'all'
                    ? 'bg-[var(--th-primary)] text-white font-bold shadow-xs'
                    : 'text-[var(--th-text-main)] hover:bg-[var(--th-primary-light)]'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="category_filter"
                      checked={selectedCategory === 'all'}
                      onChange={() => handleCategorySelect('all')}
                      className="accent-[var(--th-primary)] w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>All Categories</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${selectedCategory === 'all' ? 'bg-[var(--th-accent)] text-white' : 'bg-[var(--th-primary-light)] text-[var(--th-text-muted)]'
                    }`}>
                    {categoryCounts.all || 0}
                  </span>
                </label>

                {/* Virtual Main Collections */}
                {[
                  { id: 'women', label: "Women's Collection" },
                  { id: 'mens', label: "Men's Collection" },
                  { id: 'kids', label: "Kids' Collection" },
                  { id: 'puja', label: "Puja Articles" },
                  { id: 'jewellery', label: "All Silver Jewellery" }
                ].map((item) => (
                  <label
                    key={item.id}
                    onClick={() => handleCategorySelect(item.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${selectedCategory === item.id
                      ? 'bg-[var(--th-primary)] text-white font-bold shadow-xs'
                      : 'text-[var(--th-text-main)] hover:bg-[var(--th-primary-light)]'
                      }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="category_filter"
                        checked={selectedCategory === item.id}
                        onChange={() => handleCategorySelect(item.id)}
                        className="accent-[var(--th-primary)] w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{item.label}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${selectedCategory === item.id ? 'bg-[var(--th-accent)] text-white' : 'bg-[var(--th-primary-light)] text-[var(--th-text-muted)]'
                      }`}>
                      {categoryCounts[item.id] || 0}
                    </span>
                  </label>
                ))}

                {/* Standard Categories List */}
                {categoryList
                  .filter(cat => {
                    const slug = String(cat.slug || cat.id || '').toLowerCase().trim();
                    const name = String(cat.name || '').toLowerCase().trim();
                    return (
                      slug !== 'baby-silver' &&
                      slug !== 'kids' &&
                      slug !== 'kids-collection' &&
                      slug !== 'pooja-articles' &&
                      slug !== 'puja-articles' &&
                      slug !== 'puja' &&
                      slug !== 'abc' &&
                      slug !== 'test' &&
                      String(cat.category_id) !== '2' &&
                      String(cat.category_id) !== '8' &&
                      name !== 'baby silver' &&
                      name !== 'kids collection' &&
                      name !== "kids' collection" &&
                      name !== 'pooja articles' &&
                      name !== 'puja articles' &&
                      name !== 'abc' &&
                      name !== 'test'
                    );
                  })
                  .map((cat) => (
                  <label
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${selectedCategory === cat.id
                      ? 'bg-[var(--th-primary)] text-white font-bold shadow-xs'
                      : 'text-[var(--th-text-main)] hover:bg-[var(--th-primary-light)]'
                      }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="category_filter"
                        checked={selectedCategory === cat.id}
                        onChange={() => handleCategorySelect(cat.id)}
                        className="accent-[var(--th-primary)] w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{cat.name}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${selectedCategory === cat.id ? 'bg-[var(--th-accent)] text-white' : 'bg-[var(--th-primary-light)] text-[var(--th-text-muted)]'
                      }`}>
                      {categoryCounts[cat.id] || 0}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Requirement 2: Color / Metallic Finish Filter */}
            <div className="border-t border-[var(--th-border-subtle)] pt-4">
              <label className="text-[11px] font-bold text-[var(--th-text-muted)] uppercase tracking-wider block mb-2.5">
                Signature Finish / Color
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'all', label: 'All Colors & Finishes', colorDot: 'bg-gradient-to-r from-[#DDD1BE] to-[#D4AF37]' },
                  { id: 'Silver', label: 'Fine Silver (999/925)', colorDot: 'bg-gradient-to-br from-slate-100 to-slate-300 border border-slate-400' },
                  { id: 'Rose Gold', label: 'Rose Gold Plated', colorDot: 'bg-gradient-to-br from-rose-300 to-rose-400 border border-rose-500' },
                  { id: 'Oxidised', label: 'Bold Oxidised Silver', colorDot: 'bg-gradient-to-br from-neutral-700 to-black border border-neutral-600' }
                ].map((finish) => {
                  const isSelected = selectedColor.toLowerCase() === finish.id.toLowerCase();
                  const count = finish.id === 'all'
                    ? (products?.length || PRODUCTS.length)
                    : (products || PRODUCTS).filter(p => (p.color || '').toLowerCase() === finish.id.toLowerCase()).length;

                  return (
                    <label
                      key={finish.id}
                      onClick={() => setSelectedColor(finish.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${isSelected
                        ? 'bg-[var(--th-primary)] text-white font-bold shadow-xs'
                        : 'text-[var(--th-text-main)] hover:bg-[var(--th-primary-light)]'
                        }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs ${finish.colorDot}`} />
                        <span>{finish.label}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isSelected ? 'bg-[var(--th-accent)] text-white' : 'bg-[var(--th-primary-light)] text-[var(--th-text-muted)]'
                        }`}>
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Silver Purity Radio Group */}
            <div className="border-t border-[var(--th-border-subtle)] pt-4">
              <label className="text-[11px] font-bold text-[var(--th-text-muted)] uppercase tracking-wider block mb-2.5">
                Silver Purity
              </label>
              <div className="space-y-2 text-xs">
                {[
                  { id: 'all', label: 'All Purities' },
                  { id: '999', label: '999 Fine Pure Silver (99.9%)' },
                  { id: '925', label: '925 Sterling Silver (92.5%)' }
                ].map((purity) => (
                  <label
                    key={purity.id}
                    className={`flex items-center space-x-2.5 p-2 rounded-lg cursor-pointer font-medium transition-colors ${selectedPurity === purity.id ? 'bg-[var(--th-primary)] text-white font-bold' : 'text-[var(--th-text-main)] hover:bg-[var(--th-primary-light)]'
                      }`}
                  >
                    <input
                      type="radio"
                      name="purity_filter"
                      checked={selectedPurity === purity.id}
                      onChange={() => setSelectedPurity(purity.id)}
                      className="accent-[var(--th-primary)] w-4 h-4 cursor-pointer"
                    />
                    <span>{purity.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Silver Weight Filter */}
            <div className="border-t border-[var(--th-border-subtle)] pt-4">
              <label className="text-[11px] font-bold text-[var(--th-text-muted)] uppercase tracking-wider block mb-2.5">
                Silver Weight (Grams)
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'all', label: 'All Weights', min: 0, max: 10000 },
                  { id: 'under-10', label: 'Under 10 Grams (<10g)', min: 0, max: 10 },
                  { id: '10-25', label: '10g – 25 Grams', min: 10, max: 25 },
                  { id: '25-50', label: '25g – 50 Grams', min: 25, max: 50 },
                  { id: 'above-50', label: '50g & Above (Bullion)', min: 50, max: 10000 }
                ].map((bracket) => {
                  const isSelected = minWeight === bracket.min && maxWeight === bracket.max;
                  return (
                    <label
                      key={bracket.id}
                      onClick={() => {
                        setMinWeight(bracket.min);
                        setMaxWeight(bracket.max);
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${isSelected
                        ? 'bg-[var(--th-primary)] text-white font-bold shadow-xs'
                        : 'text-[var(--th-text-main)] hover:bg-[var(--th-primary-light)]'
                        }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Scale className={`w-3.5 h-3.5 ${isSelected ? 'text-[var(--th-accent)]' : 'text-[var(--th-text-muted)]'}`} />
                        <span>{bracket.label}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Filter (Single Track with Both To and From Handles) */}
            <div className="border-t border-[var(--th-border-subtle)] pt-4">
              <div className="flex justify-between items-center mb-2 text-xs">
                <label className="text-[11px] font-bold text-[var(--th-text-muted)] uppercase tracking-wider">
                  Price Range (To - From)
                </label>
                <span className="font-bold bg-[var(--th-primary-light)] text-[var(--th-primary)] border border-[var(--th-border)] px-2 py-0.5 rounded text-[11px] font-outfit">
                  ₹{minPrice.toLocaleString('en-IN')} - ₹{maxPrice.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Single Track Dual-Thumb Container */}
              <div className="relative h-8 flex items-center w-full mt-2">
                {/* Background Track Line */}
                <div className="absolute w-full h-1.5 bg-[var(--th-border)] rounded-full" />
                {/* Colored Active Highlight Between From and To */}
                <div
                  className="absolute h-1.5 bg-[var(--th-primary)] rounded-full transition-all"
                  style={{
                    left: `${Math.min(100, Math.max(0, (minPrice / catalogMaxPrice) * 100))}%`,
                    width: `${Math.min(100, Math.max(0, ((maxPrice - minPrice) / catalogMaxPrice) * 100))}%`
                  }}
                />
                {/* From (Min) Thumb */}
                <input
                  type="range"
                  min="0"
                  max={catalogMaxPrice}
                  step={priceStep}
                  value={minPrice}
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), maxPrice - priceStep);
                    setMinPrice(val >= 0 ? val : 0);
                  }}
                  className="absolute w-full h-1.5 bg-transparent pointer-events-none appearance-none z-10 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--th-primary)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4.5 [&::-moz-range-thumb]:h-4.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--th-primary)] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer"
                  title={`From: ₹${minPrice.toLocaleString('en-IN')}`}
                />
                {/* To (Max) Thumb */}
                <input
                  type="range"
                  min="0"
                  max={catalogMaxPrice}
                  step={priceStep}
                  value={maxPrice}
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), minPrice + priceStep);
                    setMaxPrice(val <= catalogMaxPrice ? val : catalogMaxPrice);
                  }}
                  className="absolute w-full h-1.5 bg-transparent pointer-events-none appearance-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--th-accent)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4.5 [&::-moz-range-thumb]:h-4.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--th-accent)] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer"
                  title={`To: ₹${maxPrice.toLocaleString('en-IN')}`}
                />
              </div>

              <div className="flex justify-between text-[10px] text-[var(--th-text-muted)] mt-1 font-outfit">
                <span>₹0</span>
                <span>₹{Math.round(catalogMaxPrice / 2).toLocaleString('en-IN')}</span>
                <span>₹{catalogMaxPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Target Audience Filter (sourced dynamically from target audience table) */}
            <div className="border-t border-[var(--th-border-subtle)] pt-4">
              <label className="text-[11px] font-bold text-[var(--th-text-muted)] uppercase tracking-wider block mb-2.5">
                Target Audience
              </label>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {audienceList.map((tag) => {
                  const isSelected = selectedRecipient.toLowerCase() === tag.id.toLowerCase();
                  return (
                    <button
                      key={tag.id}
                      onClick={() => setSelectedRecipient(tag.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer ${isSelected
                        ? 'bg-[var(--th-primary)] text-white shadow-xs'
                        : 'bg-[var(--th-primary-light)] text-[var(--th-text-main)] hover:bg-[var(--th-border)]/50'
                        }`}
                    >
                      <span>{tag.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ready Stock Checkbox Switch */}
            <div className="border-t border-[var(--th-border-subtle)] pt-4">
              <label className="flex items-center space-x-3 cursor-pointer p-2.5 rounded-lg bg-[var(--th-primary-light)] hover:bg-[var(--th-border)]/50 transition-colors">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-[var(--th-primary)] w-4 h-4 rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-[var(--th-text-main)]">Ready in Stock Only</span>
              </label>
            </div>

            {/* Sort Options Radio List in Sidebar */}
            <div className="border-t border-[var(--th-border-subtle)] pt-4">
              <label className="text-[11px] font-bold text-[var(--th-text-muted)] uppercase tracking-wider block mb-2.5">
                Sort By Order
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'featured', label: 'Featured Collections' },
                  { id: 'price-low', label: 'Price: Low to High' },
                  { id: 'price-high', label: 'Price: High to Low' },
                  { id: 'rating', label: 'Best Customer Rating' },
                  { id: 'newest', label: 'Most Popular' }
                ].map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center space-x-2.5 p-2 rounded-lg cursor-pointer transition-colors ${sortBy === option.id
                      ? 'bg-[var(--th-primary)] text-white font-bold'
                      : 'text-[var(--th-text-main)] hover:bg-[var(--th-primary-light)]'
                      }`}
                  >
                    <input
                      type="radio"
                      name="sort_filter"
                      checked={sortBy === option.id}
                      onChange={() => setSortBy(option.id)}
                      className="accent-[var(--th-primary)] w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mobile Close Button */}
            {isMobileFilterOpen && (
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold text-xs rounded-lg mt-6 shadow-md transition-colors"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            )}
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            {/* Active Search Notification Banner */}
            {searchQuery && (
              <div className="mb-6 p-4 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] flex items-center justify-between flex-wrap gap-3 shadow-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--th-primary-light)] text-[var(--th-accent)] flex items-center justify-center border border-[var(--th-accent)]/30 shrink-0">
                    <Search className="w-4 h-4 text-[var(--th-accent)]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[var(--th-text-main)]">
                      Showing results for "<span className="text-[var(--th-primary)] font-extrabold">{searchQuery}</span>"
                    </h3>
                    <p className="text-[11px] text-[var(--th-text-muted)]">
                      Found {filteredProducts.length} certified hallmarked silver {filteredProducts.length === 1 ? 'piece' : 'pieces'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--th-text-muted)] hover:text-rose-600 bg-[var(--th-surface-alt)] hover:bg-rose-50 border border-[var(--th-border)] transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Search</span>
                </button>
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="bg-[var(--th-card)] p-10 sm:p-12 rounded-2xl border border-[var(--th-border)] text-center shadow-xs">
                {isCustomOnlyCategory(categoryList.find(c => String(c.id).toLowerCase() === String(selectedCategory).toLowerCase() || String(c.slug).toLowerCase() === String(selectedCategory).toLowerCase())) ? (
                  <div className="space-y-4 max-w-lg mx-auto">
                    <div className="w-14 h-14 rounded-full bg-[var(--th-primary-light)] text-[var(--th-accent)] flex items-center justify-center mx-auto border border-[var(--th-accent)]/30">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[var(--th-text-main)]">
                      Bespoke & Handcrafted Creation
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--th-text-muted)] leading-relaxed">
                      Pure 925 sterling silver {currentCategory.name} are handcrafted to your custom deity dimensions, motifs, and consecration preferences.
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => navigate('/customize')}
                        className="w-full sm:w-auto px-6 py-3 bg-[var(--th-accent)] hover:brightness-110 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Commission Bespoke Order →</span>
                      </button>
                      <button
                        onClick={resetFilters}
                        className="w-full sm:w-auto px-5 py-3 bg-[var(--th-surface-alt)] hover:bg-[var(--th-border)] text-[var(--th-text-main)] text-xs font-bold rounded-xl transition-colors border border-[var(--th-border)] cursor-pointer"
                      >
                        Browse All Products
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-[var(--th-primary-light)] text-[var(--th-accent)] flex items-center justify-center mx-auto mb-4 border border-[var(--th-accent)]/30">
                      <Search className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">
                      {searchQuery ? `No Silver Pieces Match "${searchQuery}"` : "No Silver Artifacts Match Filters"}
                    </h3>
                    <p className="text-xs text-[var(--th-text-muted)] mt-1.5 max-w-md mx-auto leading-relaxed">
                      {searchQuery
                        ? "We couldn't find an exact match. Try checking for spelling errors, broader keywords (like 'ring', 'payal', 'coin'), or clear your search to explore all items."
                        : "Try adjusting your price range, weight, or purity filter options to see available products."}
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-5">
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="px-5 py-2.5 bg-[var(--th-surface-alt)] hover:bg-[var(--th-border)] text-[var(--th-text-main)] text-xs font-bold rounded-lg transition-colors border border-[var(--th-border)] cursor-pointer"
                        >
                          Clear Search Keyword
                        </button>
                      )}
                      <button
                        onClick={resetFilters}
                        className="px-6 py-2.5 bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className={`grid gap-2.5 sm:gap-6 ${gridCols === 2 ? 'grid-cols-2' :
                gridCols === 3 ? 'grid-cols-2 md:grid-cols-3' :
                  'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                }`}>
                {filteredProducts.map((product, index) => {
                  const isWishlisted = wishlistIds.some(id => String(id) === String(product.id));
                  const discountPct = product.discount !== undefined && product.discount !== null && Number(product.discount) > 0
                    ? Number(product.discount)
                    : (product.originalPrice && product.originalPrice > product.price
                      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                      : null);

                  return (
                    <ScrollReveal key={product.id} delay={(index % 4) * 200} animation="fade-up">
                      <div
                        className="h-full group bg-[var(--th-card)] rounded-xl sm:rounded-2xl border border-[var(--th-border)] hover:border-[var(--th-primary)] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative"
                      >
                      {/* Image Preview */}
                      <div
                        className="relative aspect-square bg-[var(--th-pedestal)] overflow-hidden cursor-pointer"
                        onClick={() => onSelectProduct(product)}
                      >
                        <img
                          src={Array.isArray(product.images) && product.images[0] ? product.images[0] : '/images/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/placeholder.svg';
                          }}
                        />
                        {Array.isArray(product.images) && product.images[1] && (
                          <img
                            src={product.images[1]}
                            alt={product.name}
                            className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/images/placeholder.svg';
                            }}
                          />
                        )}

                        {/* Out of Stock Overlay */}
                        {product.quantity !== undefined && product.quantity !== null && Number(product.quantity) <= 0 && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
                            <span className="bg-rose-600 text-white font-extrabold text-[11px] sm:text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg border border-white/20">
                              Out of Stock
                            </span>
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col space-y-1 sm:space-y-1.5 z-10 items-start">
                          <span className="bg-black/95 text-white border border-amber-400 text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-lg uppercase tracking-wider inline-flex items-center gap-1 sm:gap-1.5">
                            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 fill-amber-400 shrink-0" />
                            <span className="text-amber-300 font-black">
                              {product.purityCode === '999' || (product.purity && String(product.purity).includes('999')) ? '999' : '925'}
                            </span>
                            <span className="text-white font-extrabold hidden xs:inline">SILVER</span>
                          </span>

                          {product.quantity !== undefined && product.quantity !== null && Number(product.quantity) <= 0 ? (
                            <span className="bg-rose-600 text-white text-[8.5px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                              Out of Stock
                            </span>
                          ) : (
                            <>
                              {product.color && product.color !== 'Silver' && (
                                <span className="bg-[var(--th-card)] text-[var(--th-text-main)] border border-[var(--th-border)] text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                                  {product.color}
                                </span>
                              )}

                              {discountPct !== null && discountPct > 0 && (
                                <span className="bg-[#DC2626] text-white text-[8.5px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full shadow-xs">
                                  {discountPct}% OFF
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {/* Top Right Wishlist Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(product);
                          }}
                          className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all shadow-md ${isWishlisted
                            ? 'bg-rose-600 text-white'
                            : 'bg-white/90 text-[var(--th-primary)] hover:bg-[var(--th-primary)] hover:text-white'
                            }`}
                        >
                          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-white' : ''}`} />
                        </button>

                        {/* Quick View Button (Desktop only) */}
                        <div className="hidden sm:block absolute inset-x-4 bottom-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickView(product);
                            }}
                            className="w-full py-2 bg-white/95 backdrop-blur-xs hover:bg-[var(--th-primary)] text-[var(--th-text-main)] hover:text-white text-xs font-semibold rounded-lg shadow-lg transition-colors flex items-center justify-center space-x-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Quick View</span>
                          </button>
                        </div>
                      </div>

                      {/* Info Area */}
                      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[var(--th-text-muted)] mb-1">
                            <span className="font-semibold text-[var(--th-accent)] uppercase tracking-wider truncate mr-1">
                              {product.purity || (product.purityCode === '999' ? '999 Pure' : '925 Sterling')} • {product.weightGrams}g
                            </span>
                            <div className="flex items-center space-x-0.5 sm:space-x-1 text-[var(--th-accent)] shrink-0">
                              <Star className="w-3 h-3 fill-[var(--th-accent)] text-[var(--th-accent)]" />
                              <span className="font-bold text-[var(--th-text-main)] text-[10px] sm:text-xs">{product.rating}</span>
                              <span className="text-[9px] sm:text-[10px] text-[var(--th-text-muted)] hidden xs:inline">
                                ({product.reviewsCount !== undefined ? product.reviewsCount : (product.review !== undefined ? product.review : 0)})
                              </span>
                            </div>
                          </div>

                          <h3
                            onClick={() => onSelectProduct(product)}
                            className="font-semibold text-xs sm:text-sm text-[var(--th-text-main)] hover:text-[var(--th-primary)] transition-colors line-clamp-2 cursor-pointer mb-1 sm:mb-1.5"
                          >
                            {product.name}
                          </h3>

                          {/* Live Stock & Sold Badge */}
                          <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1.5 sm:mb-2">
                            <span className={`font-semibold truncate ${product.quantity > 5 ? 'text-emerald-600 dark:text-emerald-400' : (product.quantity > 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-rose-500 font-bold')
                              }`}>
                              {product.quantity > 5 ? `In Stock (${product.quantity})` : (product.quantity > 0 ? `Only ${product.quantity} left!` : 'Sold Out')}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-baseline space-x-1.5 sm:space-x-2 my-1.5 sm:my-2">
                            <span className="text-sm sm:text-base font-bold text-[var(--th-primary)] font-outfit tracking-tight">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-[10px] sm:text-xs text-[var(--th-text-muted)] line-through font-outfit font-medium">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>

                          {product.isYatraLocket ? (
                            <button
                              onClick={onNavigateYatraCustomizer}
                              className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-[var(--th-primary)] to-[var(--th-primary-hover)] hover:from-[var(--th-accent)] hover:to-[#9A650C] text-white hover:text-white font-semibold text-[11px] sm:text-xs rounded-lg transition-all flex items-center justify-center space-x-1 sm:space-x-1.5"
                            >
                              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--th-accent)] shrink-0" />
                              <span>Customize</span>
                            </button>
                          ) : (
                            <button
                              disabled={product.quantity !== undefined && product.quantity !== null && product.quantity <= 0}
                              onClick={() => onAddToCart(product, 1)}
                              className={`w-full py-2 sm:py-2.5 bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-semibold text-[11px] sm:text-xs rounded-lg transition-colors flex items-center justify-center space-x-1 sm:space-x-1.5 cursor-pointer shadow-xs hover:shadow-md ${product.quantity !== undefined && product.quantity !== null && product.quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                              <span>{product.quantity !== undefined && product.quantity !== null && product.quantity <= 0 ? 'Sold Out' : 'Add to Cart'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
