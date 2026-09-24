// Product Catalog matching MS SQL Backend Database Schema (dbo.category & dbo.product)

export const CATEGORIES = [
  {
    id: "silver-rings",
    category_id: 1,
    name: "Silver Rings",
    shortName: "Rings",
    description: "Designer 925 sterling silver rings and bands",
    heroBanner: "/images/hero_silver_coins.png",
    icon: "Sparkles",
    idealFor: "Women",
    subcategories: [
      { id: "solitaire-rings", name: "Solitaire & Halo Rings" },
      { id: "floral-bands", name: "Floral Silver Bands" }
    ]
  },
  {
    id: "silver-pendants-chains",
    category_id: 2,
    name: "Silver Pendants & Chains",
    shortName: "Pendants & Chains",
    description: "Minimalist and devotional silver chains and lockets",
    heroBanner: "/images/hero_yatra_locket.png",
    icon: "Sparkles",
    idealFor: "Women",
    subcategories: [
      { id: "lotus-mandala", name: "Lotus Mandala Pendants" },
      { id: "devotional-lockets", name: "Devotional Lockets & Chains" }
    ]
  },
  {
    id: "silver-bangles-kadas",
    category_id: 3,
    name: "Silver Bangles & Kadas",
    shortName: "Bangles & Kadas",
    description: "Traditional antique kadas and dailywear silver bangles",
    heroBanner: "/images/hero_silverware.png",
    icon: "Sparkles",
    idealFor: "Women",
    subcategories: [
      { id: "filigree-kadas", name: "Royal Filigree Kadas" },
      { id: "dailywear-bangles", name: "Dailywear Silver Bangles" }
    ]
  },
  {
    id: "silver-payal-anklets",
    category_id: 4,
    name: "Silver Payal & Anklets",
    shortName: "Payal & Anklets",
    description: "Ethnic bridal payals and lightweight dailywear anklets",
    heroBanner: "/images/hero_baby_nazariya.png",
    icon: "Sparkles",
    idealFor: "Women",
    subcategories: [
      { id: "bridal-ghungroo", name: "Bridal Ghungroo Payal" },
      { id: "lightweight-anklets", name: "Lightweight Daily Anklets" }
    ]
  },
  {
    id: "silver-religious-idols",
    category_id: 5,
    name: "Silver Religious Idols",
    shortName: "Religious Idols",
    description: "Pure 999 fine silver devotional murti and puja items",
    heroBanner: "/images/hero_silver_idols.png",
    icon: "Sparkles",
    idealFor: "ALL",
    subcategories: [
      { id: "ganesha-laxmi-murti", name: "Ganesha & Laxmi Murti Set" },
      { id: "puja-temple-idols", name: "Puja Room Deity Idols" }
    ]
  },
  {
    id: "silver-coins-bars",
    category_id: 6,
    name: "Silver Coins & Bars",
    shortName: "Coins & Bars",
    description: "Hallmarked 999 fine silver investment coins and bars",
    heroBanner: "/images/hero_silver_coins.png",
    icon: "Coins",
    idealFor: "ALL",
    subcategories: [
      { id: "lotus-temple-coin", name: "Lotus Temple Coins" },
      { id: "investment-bars", name: "Investment Bullion Bars" }
    ]
  },
  {
    id: "men-silver-collection",
    category_id: 7,
    name: "Men Silver Collection",
    shortName: "Men Collection",
    description: "Bold silver bracelets and rings crafted for men",
    heroBanner: "/images/hero_sacred_rudraksha.png",
    icon: "ShieldCheck",
    idealFor: "Men",
    subcategories: [
      { id: "curb-link-bracelets", name: "Heavy Curb Link Bracelets" },
      { id: "men-rings-kada", name: "Masculine Rings & Kadas" }
    ]
  },
  {
    id: "kids-nazariya-bracelets",
    category_id: 8,
    name: "Kids Nazariya & Bracelets",
    shortName: "Kids Collection",
    description: "Protective silver nazariya beads and charm bracelets",
    heroBanner: "/images/hero_baby_nazariya.png",
    icon: "Baby",
    idealFor: "Kids",
    subcategories: [
      { id: "evil-eye-nazariya", name: "Evil Eye Silver Nazariya" },
      { id: "baby-bangles", name: "Baby Charm Bracelets" }
    ]
  },
  {
    id: "silver-earrings",
    category_id: 9,
    name: "Silver Earrings",
    shortName: "Earrings",
    description: "Sparkling 925 sterling silver snowflake studs, solitaire tops, and antique jhumkas",
    heroBanner: "/images/categories/cat_earrings.jpg",
    icon: "Sparkles",
    idealFor: "Women",
    subcategories: [
      { id: "stud-earrings", name: "Snowflake & Solitaire Studs" },
      { id: "drop-earrings", name: "Designer Drop Earrings" }
    ]
  },
  {
    id: "silver-sets",
    category_id: 10,
    name: "Silver Sets",
    shortName: "Sets",
    description: "Exquisite 925 sterling silver ruby bridal sets, bangle pairs, and puja collections",
    heroBanner: "/images/categories/cat_sets.jpg",
    icon: "Sparkles",
    idealFor: "Women",
    subcategories: [
      { id: "bridal-sets", name: "Ruby Halo Bridal Sets" },
      { id: "combo-sets", name: "Devotional & Festive Sets" }
    ]
  },
  {
    id: "silver-utensils-pooja",
    category_id: 11,
    name: "Silver Utensils & Pooja",
    shortName: "Utensils",
    description: "Sacred pure 999 and 925 silver pooja kalash, diya, thali, and ritual vessels",
    heroBanner: "/images/categories/cat_utensils.jpg",
    icon: "Sparkles",
    idealFor: "ALL",
    subcategories: [
      { id: "puja-kalash-diya", name: "Kalash & Akhand Diya" },
      { id: "panchpatra-thali", name: "Panchpatra & Pooja Thali" }
    ]
  },
  {
    id: "custom-yatra-lockets",
    category_id: 12,
    name: "Sacred Yantra & Custom Yatra Lockets",
    shortName: "Yantra",
    description: "Consecrated Sri Yantra, Mahamrityunjaya kavach, and custom pilgrimage shrine lockets",
    heroBanner: "/images/categories/cat_yantra.jpg",
    icon: "Sparkles",
    idealFor: "ALL",
    subcategories: [
      { id: "sri-yantra", name: "Sri Yantra & Mandalas" },
      { id: "yatra-shrine", name: "Custom Gotra Pilgrimage Lockets" }
    ]
  },
  {
    id: "silver-chains",
    category_id: 13,
    name: "Pure Silver Chains",
    shortName: "Chains",
    description: "Heavy Cuban links, sleek Italian curb chains, and everyday pure silver chains",
    heroBanner: "/images/categories/cat_silver_chains.jpg",
    icon: "Sparkles",
    idealFor: "ALL",
    subcategories: [
      { id: "curb-chains", name: "Italian Curb Chains" },
      { id: "cuban-chains", name: "Heavy Cuban Links" }
    ]
  }
];

// Products are loaded dynamically from MS SQL backend database (SP_GETDATA / dbo.product)
export const PRODUCTS = [];

export const PINCODES = [
  { code: "110001", city: "New Delhi", state: "Delhi", days: 2, expressAvailable: true, codAvailable: true },
  { code: "400001", city: "Mumbai", state: "Maharashtra", days: 2, expressAvailable: true, codAvailable: true },
  { code: "560001", city: "Bengaluru", state: "Karnataka", days: 3, expressAvailable: true, codAvailable: true },
  { code: "700001", city: "Kolkata", state: "West Bengal", days: 3, expressAvailable: true, codAvailable: true },
  { code: "600001", city: "Chennai", state: "Tamil Nadu", days: 3, expressAvailable: true, codAvailable: true },
  { code: "500001", city: "Hyderabad", state: "Telangana", days: 3, expressAvailable: true, codAvailable: true },
  { code: "380001", city: "Ahmedabad", state: "Gujarat", days: 2, expressAvailable: true, codAvailable: true },
  { code: "302001", city: "Jaipur", state: "Rajasthan", days: 2, expressAvailable: true, codAvailable: true }
];

export const PROMO_CODES = {
  "WELCOME10": { discountPct: 10, minSpend: 1000, label: "10% OFF Welcome Offer" },
  "FESTIVE500": { flatDiscount: 500, minSpend: 4999, label: "₹500 OFF Festive Special" },
  "SILVERPURE": { discountPct: 5, minSpend: 500, label: "5% OFF Pure Silver Artifacts" }
};

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Rajesh Sharma",
    location: "New Delhi",
    rating: 5,
    verified: true,
    text: "Ordered the Pure 999 Silver Ganesha Laxmi Murti Set for Diwali Puja. Exceptional craftsmanship, authentic BIS Hallmark certificate, and velvet packaging!",
    productName: "Pure 999 Silver Ganesha Laxmi Murti Set"
  },
  {
    id: 2,
    name: "Priya Malhotra",
    location: "Mumbai",
    rating: 5,
    verified: true,
    text: "The Solitaire Halo Floral Silver Ring is so stunning and lightweight! Perfect 925 sterling silver purity and secure delivery.",
    productName: "Solitaire Halo Floral Silver Ring"
  },
  {
    id: 3,
    name: "Ananya Iyer",
    location: "Bengaluru",
    rating: 5,
    verified: true,
    text: "Got the Lotus Temple 10g 999 Silver Coin for my parents' anniversary. Tamper-proof blister card packaging and instant dispatch!",
    productName: "999 Fine Silver Lotus Temple Coin (10g)"
  }
];
