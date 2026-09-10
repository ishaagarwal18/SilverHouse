import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CATEGORIES, PRODUCTS } from '../../data/products';
import { fetchProducts } from '../../services/api';
import {
  Filter, Grid3X3, Grid2X2, LayoutGrid, ChevronRight, SlidersHorizontal,
  Heart, Eye, ShoppingBag, Star, Sparkles, X, Check, Search, RotateCcw, Flame, ArrowLeft
} from 'lucide-react';

export default function ProductListingPage({
  products,
  categories,
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
  const minPriceQuery = searchParams.get('minPrice');
  const maxPriceQuery = searchParams.get('maxPrice');

  const categoryList = (categories && categories.length > 0) ? categories : CATEGORIES;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryId || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState(subcategoryId || 'all');
  const [selectedPurity, setSelectedPurity] = useState('all');
  const [selectedRecipient, setSelectedRecipient] = useState('all');
  const [selectedColor, setSelectedColor] = useState(colorQueryParam || 'all');
  const [minPrice, setMinPrice] = useState(() => (minPriceQuery !== null && !isNaN(Number(minPriceQuery)) ? Number(minPriceQuery) : 0));
  const [maxPrice, setMaxPrice] = useState(() => (maxPriceQuery !== null && !isNaN(Number(maxPriceQuery)) ? Number(maxPriceQuery) : 100000));
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [gridCols, setGridCols] = useState(4); // 2, 3, 4
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [backendItems, setBackendItems] = useState(null);

  // Sync state if categoryId / subcategoryId route params change
  useEffect(() => {
    setSelectedCategory(categoryId || 'all');
    setSelectedSubcategory(subcategoryId || 'all');
  }, [categoryId, subcategoryId]);

  // Sync color filter with URL search param if present
  useEffect(() => {
    if (colorQueryParam) {
      setSelectedColor(colorQueryParam);
    }
  }, [colorQueryParam]);

  // Sync budget/price filters with URL search params if present
  useEffect(() => {
    if (minPriceQuery !== null && !isNaN(Number(minPriceQuery))) {
      setMinPrice(Number(minPriceQuery));
    } else if (minPriceQuery === null) {
      setMinPrice(0);
    }
    if (maxPriceQuery !== null && !isNaN(Number(maxPriceQuery))) {
      setMaxPrice(Number(maxPriceQuery));
    } else if (maxPriceQuery === null) {
      setMaxPrice(100000);
    }
  }, [minPriceQuery, maxPriceQuery]);

  // Fetch filtered data directly from Express Backend API
  useEffect(() => {
    let isMounted = true;
    async function loadFilteredData() {
      const activeFilters = {
        category: selectedCategory && selectedCategory !== 'all' && !['women', 'mens', 'kids', 'jewellery'].includes(selectedCategory) ? selectedCategory : undefined,
        subcategory: selectedSubcategory !== 'all' ? selectedSubcategory : undefined,
        purity: selectedPurity !== 'all' ? selectedPurity : undefined,
        color: selectedColor !== 'all' ? selectedColor : undefined,
        minPrice,
        maxPrice,
        inStockOnly,
        sortBy
      };
      const fetched = await fetchProducts(activeFilters);
      if (isMounted && fetched) {
        setBackendItems(fetched);
      }
    }
    loadFilteredData();
    return () => { isMounted = false; };
  }, [selectedCategory, selectedSubcategory, selectedPurity, selectedColor, minPrice, maxPrice, inStockOnly, sortBy]);

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

  const activeCategoryObj = categoryList.find(c => c.id === selectedCategory) || VIRTUAL_CATEGORIES[selectedCategory];

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
    if (['silver-rings', 'silver-pendants-chains', 'silver-bangles-kadas', 'silver-payal-anklets'].includes(p.category)) return true;
    const target = (p.recipient || p.ideal_for || p.idealFor || '').toLowerCase();
    return target.includes('women');
  };

  const matchesOccasionOrAudience = (p, filter) => {
    if (!filter || filter === 'all') return true;
    const f = filter.toLowerCase().trim();

    if (f === 'puja' || f === 'pooja') {
      const occs = Array.isArray(p.occasions) ? p.occasions.map(o => o.toLowerCase()) : [];
      const recipient = (p.recipient || p.ideal_for || p.idealFor || '').toLowerCase();
      const cat = (p.category || p.category_slug || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      return (
        occs.some(o => o.includes('puja') || o.includes('pooja') || o.includes('worship') || o.includes('temple') || o.includes('diwali') || o.includes('navratri')) ||
        recipient.includes('puja') || recipient.includes('pooja') || recipient.includes('worship') || recipient.includes('devot') || recipient.includes('temple') ||
        cat === 'silver-religious-idols' || cat === 'silver-pooja-utensils-diya' ||
        name.includes('idol') || name.includes('murti') || name.includes('diya') || name.includes('thali') || name.includes('kalash') || name.includes('ganesha') || name.includes('laxmi') || name.includes('radha') || name.includes('krishna') || name.includes('hanuman') || name.includes('bell') || name.includes('panchpatra')
      );
    }

    if (f === 'men' || f === 'mens') {
      return isMenProduct(p);
    }

    if (f === 'women') {
      return isWomenProduct(p);
    }

    if (f === 'baby' || f === 'kids') {
      const occs = Array.isArray(p.occasions) ? p.occasions.map(o => o.toLowerCase()) : [];
      const recipient = (p.recipient || p.ideal_for || p.idealFor || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      return (
        cat === 'kids-nazariya-bracelets' ||
        occs.some(o => o.includes('baby') || o.includes('kids') || o.includes('birth')) ||
        recipient.includes('baby') || recipient.includes('kids') || recipient.includes('child') ||
        name.includes('nazariya') || name.includes('baby')
      );
    }

    if (f === 'gifting' || f === 'gift') {
      const occs = Array.isArray(p.occasions) ? p.occasions.map(o => o.toLowerCase()) : [];
      const recipient = (p.recipient || p.ideal_for || p.idealFor || '').toLowerCase();
      return (
        p.isCustomizable ||
        p.category === 'custom-gifting' ||
        p.category === 'silver-coins-bars' ||
        recipient.includes('gift') ||
        occs.some(o => o.includes('gift') || o.includes('wedding') || o.includes('anniversary'))
      );
    }

    if (f === 'investment') {
      const occs = Array.isArray(p.occasions) ? p.occasions.map(o => o.toLowerCase()) : [];
      const recipient = (p.recipient || p.ideal_for || p.idealFor || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      return (
        p.category === 'silver-coins-bars' ||
        occs.some(o => o.includes('invest')) ||
        recipient.includes('invest') ||
        name.includes('coin') ||
        name.includes('bar')
      );
    }

    const occs = Array.isArray(p.occasions) ? p.occasions.map(o => o.toLowerCase()) : [];
    const recipient = (p.recipient || p.ideal_for || p.idealFor || '').toLowerCase();
    return occs.some(o => o.includes(f)) || recipient.includes(f);
  };

  // Fallback / Normalized Filtered List
  const filteredProducts = useMemo(() => {
    const rawList = (backendItems && backendItems.length > 0)
      ? backendItems
      : ((products && products.length > 0) ? products : PRODUCTS);
    let result = [...rawList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category_name || p.category || '').toLowerCase().includes(q) ||
        (p.purity || '').toLowerCase().includes(q) ||
        (p.color || '').toLowerCase().includes(q)
      );
    }

    // Category / Collection Filtering
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'women') {
        result = result.filter(isWomenProduct);
      } else if (selectedCategory === 'mens' || selectedCategory === 'men' || selectedCategory === 'men-silver-collection' || selectedCategory === 'men-in-silver') {
        result = result.filter(isMenProduct);
      } else if (selectedCategory === 'kids' || selectedCategory === 'kids-baby' || selectedCategory === 'kids-nazariya-bracelets' || selectedCategory === 'nazariya') {
        result = result.filter(p =>
          p.category === 'kids-nazariya-bracelets' ||
          p.category_slug === 'kids-nazariya-bracelets' ||
          p.category_slug === 'nazariya' ||
          (p.name || '').toLowerCase().includes('nazariya') ||
          ((p.name || '').toLowerCase().includes('baby') && (p.name || '').toLowerCase().includes('kada'))
        );
      } else if (selectedCategory === 'jewellery') {
        result = result.filter(p =>
          ['silver-rings', 'silver-pendants-chains', 'silver-bangles-kadas', 'silver-payal-anklets', 'men-silver-collection', 'kids-nazariya-bracelets'].includes(p.category)
        );
      } else if (selectedCategory === 'idols' || selectedCategory === 'silver-idols' || selectedCategory === 'silver-religious-idols') {
        result = result.filter(p =>
          p.category === 'silver-religious-idols' ||
          p.category_slug === 'silver-religious-idols' ||
          p.category_slug === 'idols' ||
          (p.name || '').toLowerCase().includes('idol') ||
          (p.name || '').toLowerCase().includes('murti') ||
          (p.name || '').toLowerCase().includes('statue')
        );
      } else if (selectedCategory === 'utensils' || selectedCategory === 'silver-utensils-pooja' || selectedCategory === 'silver-pooja-utensils-diya') {
        result = result.filter(p =>
          p.category === 'silver-utensils-pooja' ||
          p.category === 'silver-pooja-utensils-diya' ||
          p.category_slug === 'utensils' ||
          (p.name || '').toLowerCase().includes('kalash') ||
          (p.name || '').toLowerCase().includes('diya') ||
          (p.name || '').toLowerCase().includes('utensil') ||
          (p.name || '').toLowerCase().includes('panchpatra') ||
          (p.name || '').toLowerCase().includes('thali')
        );
      } else if (selectedCategory === 'yantra' || selectedCategory === 'custom-yatra-lockets' || selectedCategory === 'custom-gifting' || selectedCategory === 'yatra') {
        result = result.filter(p =>
          p.category === 'custom-yatra-lockets' ||
          p.category_slug === 'yantra' ||
          (p.name || '').toLowerCase().includes('yantra') ||
          (p.name || '').toLowerCase().includes('yatra') ||
          (p.name || '').toLowerCase().includes('kavach') ||
          (p.subcategory || '').includes('locket') ||
          p.isCustomizable
        );
      } else if (selectedCategory === 'rings' || selectedCategory === 'silver-rings') {
        result = result.filter(p =>
          (p.category === 'silver-rings' || p.category_slug === 'silver-rings' || p.category_slug === 'rings' || (p.name || '').toLowerCase().includes('ring')) &&
          !(p.name || '').toLowerCase().includes('earring')
        );
      } else if (selectedCategory === 'bracelet' || selectedCategory === 'bracelets') {
        result = result.filter(p =>
          (p.category === 'silver-bangles-kadas' ||
            p.category_slug === 'bracelets' ||
            p.category_slug === 'silver-bangles-kadas' ||
            (p.name || '').toLowerCase().includes('bracelet') ||
            (p.name || '').toLowerCase().includes('kada') ||
            (p.name || '').toLowerCase().includes('bangle')) &&
          !(p.recipient || '').toLowerCase().includes('kids') &&
          !(p.name || '').toLowerCase().includes('baby')
        );
      } else if (selectedCategory === 'pendants') {
        result = result.filter(p =>
          (p.category === 'silver-pendants-chains' ||
            p.category_slug === 'pendants' ||
            (p.name || '').toLowerCase().includes('pendant')) &&
          !(p.name || '').toLowerCase().includes('cuban link chain')
        );
      } else if (selectedCategory === 'silver-earrings' || selectedCategory === 'earrings' || selectedCategory === 'earings') {
        result = result.filter(p =>
          p.category === 'silver-earrings' ||
          p.category_slug === 'silver-earrings' ||
          p.category_slug === 'earrings' ||
          (p.name || '').toLowerCase().includes('earring') ||
          (p.name || '').toLowerCase().includes('stud') ||
          (p.name || '').toLowerCase().includes('jhumka')
        );
      } else if (selectedCategory === 'silver-chains' || selectedCategory === 'chains' || selectedCategory === 'chain') {
        result = result.filter(p =>
          p.category === 'silver-chains' ||
          p.category_slug === 'silver-chains' ||
          p.category_slug === 'chains' ||
          (p.name || '').toLowerCase().includes('chain') ||
          (p.description || '').toLowerCase().includes('chain')
        );
      } else if (selectedCategory === 'silver-sets' || selectedCategory === 'sets') {
        result = result.filter(p =>
          p.category === 'silver-sets' ||
          (p.name || '').toLowerCase().includes('set') ||
          (p.name || '').toLowerCase().includes('pair') ||
          (p.description || '').toLowerCase().includes('set')
        );
      } else if (selectedCategory === 'anklets' || selectedCategory === 'silver-payal-anklets' || selectedCategory === 'payal') {
        result = result.filter(p =>
          p.category === 'silver-payal-anklets' ||
          p.category_slug === 'silver-payal-anklets' ||
          p.category_slug === 'anklets' ||
          (p.name || '').toLowerCase().includes('payal') ||
          (p.name || '').toLowerCase().includes('anklet')
        );
      } else {
        result = result.filter(p => p.category === selectedCategory || p.category_slug === selectedCategory);
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

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.sold || 0) - (a.sold || 0));
    }

    return result;
  }, [backendItems, products, searchQuery, selectedCategory, selectedSubcategory, selectedPurity, selectedColor, selectedRecipient, minPrice, maxPrice, inStockOnly, sortBy]);

  const categoryCounts = useMemo(() => {
    const rawList = (products && products.length > 0) ? products : PRODUCTS;
    const counts = { all: rawList.length };
    rawList.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    counts['women'] = rawList.filter(isWomenProduct).length;
    counts['mens'] = rawList.filter(isMenProduct).length;
    counts['men-silver-collection'] = rawList.filter(isMenProduct).length;
    counts['kids'] = rawList.filter(p => p.category === 'kids-nazariya-bracelets').length;
    counts['nazariya'] = rawList.filter(p => p.category === 'kids-nazariya-bracelets').length;
    counts['jewellery'] = rawList.filter(p => ['silver-rings', 'silver-pendants-chains', 'silver-bangles-kadas', 'silver-payal-anklets', 'men-silver-collection', 'kids-nazariya-bracelets'].includes(p.category)).length;
    counts['rings'] = rawList.filter(p => (p.category === 'silver-rings' || (p.name || '').toLowerCase().includes('ring')) && !(p.name || '').toLowerCase().includes('earring')).length;
    counts['bracelets'] = rawList.filter(p => p.category === 'silver-bangles-kadas' || (p.name || '').toLowerCase().includes('bracelet') || (p.name || '').toLowerCase().includes('kada')).length;
    counts['idols'] = rawList.filter(p => p.category === 'silver-religious-idols' || (p.name || '').toLowerCase().includes('idol') || (p.name || '').toLowerCase().includes('murti')).length;
    counts['utensils'] = rawList.filter(p => p.category === 'silver-utensils-pooja' || (p.name || '').toLowerCase().includes('kalash') || (p.name || '').toLowerCase().includes('diya')).length;
    counts['earrings'] = rawList.filter(p => p.category === 'silver-earrings' || (p.name || '').toLowerCase().includes('earring')).length;
    counts['pendants'] = rawList.filter(p => p.category === 'silver-pendants-chains' && !(p.name || '').toLowerCase().includes('cuban link chain')).length;
    counts['chains'] = rawList.filter(p => p.category === 'silver-chains' || (p.name || '').toLowerCase().includes('chain')).length;
    counts['yantra'] = rawList.filter(p => p.category === 'custom-yatra-lockets' || (p.name || '').toLowerCase().includes('yantra') || (p.name || '').toLowerCase().includes('locket')).length;
    counts['anklets'] = rawList.filter(p => p.category === 'silver-payal-anklets' || (p.name || '').toLowerCase().includes('payal') || (p.name || '').toLowerCase().includes('anklet')).length;
    return counts;
  }, [products]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setSelectedSubcategory('all');
    if (catId === 'all') {
      navigate('/catalog');
    } else {
      navigate(`/category/${catId}`);
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
    setMaxPrice(100000);
    setInStockOnly(false);
    setSortBy('featured');
    if (categoryId || searchParams.get('color')) {
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

        <div className="max-w-7xl mx-auto relative z-10">

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
                {activeCategoryObj ? activeCategoryObj.name : "All Sacred Silver Artifacts"}
              </h1>
              <p className="text-xs sm:text-sm text-white/85 max-w-2xl mt-2.5 font-normal leading-relaxed">
                {activeCategoryObj ? activeCategoryObj.description : "Explore our complete range of certified 925 sterling silver and 999 fine silver murti, coins, utensils, rudraksha & custom lockets."}
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-xs font-semibold text-[var(--th-accent)] flex items-center space-x-2 shrink-0">
              <Sparkles className="w-4 h-4 text-[var(--th-accent)]" />
              <span>Showing {filteredProducts.length} Sacred Items</span>
            </div>
          </div>
        </div>
      </div>

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Top Controls Bar */}
        <div className="bg-[var(--th-card)] p-4 rounded-xl border border-[var(--th-border)] mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Left: Mobile Filter Button & Active Filter Chips */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start flex-wrap gap-y-2">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden px-4 py-2 bg-[var(--th-primary-light)] text-[var(--th-text-main)] text-xs font-bold rounded-lg flex items-center space-x-2 border border-[var(--th-border)] transition-colors hover:bg-[var(--th-primary)] hover:text-white"
            >
              <SlidersHorizontal className="w-4 h-4 text-[var(--th-primary)]" />
              <span>Filter Catalog ({filteredProducts.length})</span>
            </button>

            <span className="text-xs text-[var(--th-text-muted)] font-semibold hidden sm:inline-block">
              Showing <span className="text-[var(--th-text-main)] font-bold">{filteredProducts.length}</span> Products Found
            </span>

            {/* Active Filter Badges */}
            {(selectedCategory !== 'all' || selectedPurity !== 'all' || selectedColor !== 'all' || selectedRecipient !== 'all' || searchQuery || inStockOnly || minPrice > 0 || maxPrice < 100000) && (
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
                {(minPrice > 0 || maxPrice < 100000) && (
                  <span className="bg-[var(--th-primary-light)] border border-[var(--th-border)] text-[var(--th-primary)] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-xs font-outfit">
                    <span>₹{minPrice.toLocaleString('en-IN')} - ₹{maxPrice.toLocaleString('en-IN')}</span>
                    <button onClick={() => { setMinPrice(0); setMaxPrice(100000); }} className="hover:opacity-75 ml-1"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedRecipient !== 'all' && (
                  <span className="bg-[var(--th-primary-light)] border border-[var(--th-border)] text-[var(--th-primary)] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-xs">
                    <span>Occasion: {selectedRecipient}</span>
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
          <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
            <span className="text-xs text-[var(--th-text-muted)] font-medium hidden md:inline">Layout:</span>
            <div className="flex items-center space-x-1 bg-[var(--th-primary-light)] p-1 rounded-lg border border-[var(--th-border)]">
              <button
                onClick={() => setGridCols(2)}
                className={`p-1.5 rounded transition-colors ${gridCols === 2 ? 'bg-[var(--th-primary)] text-white shadow-xs' : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)]'}`}
                title="2 Columns View"
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(3)}
                className={`p-1.5 rounded transition-colors ${gridCols === 3 ? 'bg-[var(--th-primary)] text-white shadow-xs' : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)]'}`}
                title="3 Columns View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-1.5 rounded transition-colors ${gridCols === 4 ? 'bg-[var(--th-primary)] text-white shadow-xs' : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)]'}`}
                title="4 Columns View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Sidebar + Grid */}
        <div className="flex gap-8 items-start">

          {/* Interactive Sidebar Filters (Desktop) */}
          <aside className={`w-72 bg-[var(--th-card)] p-6 rounded-2xl border border-[var(--th-border)] shadow-sm space-y-6 shrink-0 transition-colors ${isMobileFilterOpen ? 'fixed inset-y-0 left-0 z-50 overflow-y-auto w-80 shadow-2xl block bg-[var(--th-card)]' : 'hidden lg:block sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto'
            }`}>
            <div className="flex items-center justify-between border-b border-[var(--th-border-subtle)] pb-3">
              <h3 className="font-serif font-bold text-base text-[var(--th-text-main)] flex items-center space-x-2">
                <Filter className="w-4 h-4 text-[var(--th-primary)]" />
                <span>Filter Catalog</span>
              </h3>
              <button onClick={resetFilters} className="text-xs text-[var(--th-primary)] hover:text-[var(--th-primary-hover)] hover:underline font-semibold flex items-center space-x-1">
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
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
                {categoryList.map((cat) => (
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
                    left: `${(minPrice / 100000) * 100}%`,
                    width: `${Math.max(0, ((maxPrice - minPrice) / 100000) * 100)}%`
                  }}
                />
                {/* From (Min) Thumb */}
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="500"
                  value={minPrice}
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), maxPrice - 500);
                    setMinPrice(val >= 0 ? val : 0);
                  }}
                  className="absolute w-full h-1.5 bg-transparent pointer-events-none appearance-none z-10 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--th-primary)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4.5 [&::-moz-range-thumb]:h-4.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--th-primary)] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer"
                  title={`From: ₹${minPrice.toLocaleString('en-IN')}`}
                />
                {/* To (Max) Thumb */}
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), minPrice + 500);
                    setMaxPrice(val <= 100000 ? val : 100000);
                  }}
                  className="absolute w-full h-1.5 bg-transparent pointer-events-none appearance-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--th-accent)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4.5 [&::-moz-range-thumb]:h-4.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--th-accent)] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer"
                  title={`To: ₹${maxPrice.toLocaleString('en-IN')}`}
                />
              </div>

              <div className="flex justify-between text-[10px] text-[var(--th-text-muted)] mt-1 font-outfit">
                <span>₹{minPrice.toLocaleString('en-IN')}</span>
                <span>₹50k</span>
                <span>₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Requirement 5: Target Audience / Occasion Filter */}
            <div className="border-t border-[var(--th-border-subtle)] pt-4">
              <label className="text-[11px] font-bold text-[var(--th-text-muted)] uppercase tracking-wider block mb-2.5">
                Target Audience / Occasion
              </label>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'Puja', label: 'Puja & Devotion' },
                  { id: 'Men', label: 'Men' },
                  { id: 'Women', label: 'Women' },
                  { id: 'Baby', label: 'Baby & Kids' },
                  { id: 'Gifting', label: 'Luxury Gifting' },
                  { id: 'Investment', label: 'Silver Coins' }
                ].map((tag) => {
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
            {filteredProducts.length === 0 ? (
              <div className="bg-[var(--th-card)] p-12 rounded-2xl border border-[var(--th-border)] text-center shadow-xs">
                <Sparkles className="w-12 h-12 text-[var(--th-accent)] mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-[var(--th-text-main)]">No Silver Artifacts Match Filters</h3>
                <p className="text-xs text-[var(--th-text-muted)] mt-1 max-w-sm mx-auto">
                  Try adjusting your price range or purity filter options to see available products.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-6 py-2.5 bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${gridCols === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                gridCols === 3 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' :
                  'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                }`}>
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlistIds.includes(product.id);
                  const discountPct = product.discount !== undefined && product.discount !== null && Number(product.discount) > 0
                    ? Number(product.discount)
                    : (product.originalPrice && product.originalPrice > product.price
                      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                      : null);

                  return (
                    <div
                      key={product.id}
                      className="group bg-[var(--th-card)] rounded-2xl border border-[var(--th-border)] hover:border-[var(--th-primary)] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative"
                    >
                      {/* Image Preview */}
                      <div
                        className="relative aspect-square bg-[var(--th-pedestal)] overflow-hidden cursor-pointer"
                        onClick={() => onSelectProduct(product)}
                      >
                        <img
                          src={Array.isArray(product.images) && product.images[0] ? product.images[0] : ''}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        />
                        {Array.isArray(product.images) && product.images[1] && (
                          <img
                            src={product.images[1]}
                            alt={product.name}
                            className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          />
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-col space-y-1 z-10">

                          {product.color && product.color !== 'Silver' && (
                            <span className="bg-[var(--th-primary)] text-[var(--th-badge-text)] border border-[var(--th-border)] text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                              {product.color}
                            </span>
                          )}

                          {discountPct !== null && discountPct > 0 && (
                            <span className="bg-[#DC2626] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                              {discountPct}% OFF
                            </span>
                          )}
                        </div>

                        {/* Top Right Wishlist Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(product);
                          }}
                          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all shadow-md ${isWishlisted
                            ? 'bg-rose-600 text-white'
                            : 'bg-white/90 text-[var(--th-primary)] hover:bg-[var(--th-primary)] hover:text-white'
                            }`}
                        >
                          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
                        </button>

                        {/* Quick View Button */}
                        <div className="absolute inset-x-4 bottom-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-[var(--th-text-muted)] mb-1">
                            <span className="font-semibold text-[var(--th-text-main)]">
                              {product.color || 'Silver'} • {product.weightGrams}g
                            </span>
                            <div className="flex items-center space-x-1 text-[var(--th-accent)]">
                              <Star className="w-3 h-3 fill-[var(--th-accent)] text-[var(--th-accent)]" />
                              <span className="font-bold text-[var(--th-text-main)]">{product.rating}</span>
                              <span className="text-[10px] text-[var(--th-text-muted)]">
                                ({product.reviewsCount !== undefined ? product.reviewsCount : (product.review !== undefined ? product.review : 0)})
                              </span>
                            </div>
                          </div>

                          <h3
                            onClick={() => onSelectProduct(product)}
                            className="font-semibold text-sm text-[var(--th-text-main)] hover:text-[var(--th-primary)] transition-colors line-clamp-2 cursor-pointer mb-2"
                          >
                            {product.name}
                          </h3>
                        </div>

                        <div>
                          <div className="flex items-baseline space-x-2 my-2">
                            <span className="text-base font-bold text-[var(--th-primary)] font-outfit tracking-tight">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-xs text-[var(--th-text-muted)] line-through font-outfit font-medium">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>

                          {product.isYatraLocket ? (
                            <button
                              onClick={onNavigateYatraCustomizer}
                              className="w-full py-2.5 bg-gradient-to-r from-[var(--th-primary)] to-[var(--th-primary-hover)] hover:from-[var(--th-accent)] hover:to-[#9A650C] text-white hover:text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center space-x-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[var(--th-accent)]" />
                              <span>Customize Locket</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onAddToCart(product, 1)}
                              className="w-full py-2.5 bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs hover:shadow-md"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
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
