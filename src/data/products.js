// Product Catalog matching MS SQL Backend Database Schema (dbo.category & dbo.product)

export const CATEGORIES = [
  {
    id: "anklets-payal",
    category_id: 1,
    name: "Anklets & Payal",
    shortName: "Payal & Anklets",
    description: "Traditional and heavy handcrafted silver payal",
    image: "/images/antique_ghungroo_payal.jpg",
    image_url: "/images/antique_ghungroo_payal.jpg",
    heroBanner: "/images/antique_ghungroo_payal.jpg",
    idealFor: "Women"
  },
  {
    id: "baby-silver",
    category_id: 2,
    name: "Baby Silver",
    shortName: "Baby Silver",
    description: "Pure silver utensils and feeding accessories for babies",
    image: "/images/baby_feeding_set.png",
    image_url: "/images/baby_feeding_set.png",
    heroBanner: "/images/baby_feeding_set.png",
    idealFor: "Kids"
  },
  {
    id: "silver-idols",
    category_id: 3,
    name: "Silver Idols",
    shortName: "Silver Idols",
    description: "Divine pure silver idols of gods and goddesses",
    image: "/images/bal_gopal.png",
    image_url: "/images/bal_gopal.png",
    heroBanner: "/images/bal_gopal.png",
    idealFor: "Puja"
  },
  {
    id: "car-accessories",
    category_id: 4,
    name: "Car Accessories",
    shortName: "Car Accessories",
    description: "Miniature silver idols for car dashboards",
    image: "/images/car_dashboard.png",
    image_url: "/images/car_dashboard.png",
    heroBanner: "/images/car_dashboard.png",
    idealFor: "Auto"
  },
  {
    id: "rings",
    category_id: 5,
    name: "Silver Rings",
    shortName: "Rings",
    description: "Sterling silver solitaire and statement rings",
    image: "/images/cz_solitaire_ring.jpg",
    image_url: "/images/cz_solitaire_ring.jpg",
    heroBanner: "/images/cz_solitaire_ring.jpg",
    idealFor: "Unisex"
  },
  {
    id: "spiritual-wear",
    category_id: 6,
    name: "Spiritual Wear",
    shortName: "Spiritual Wear",
    description: "Sacred Rudraksha beads and yatra pendants",
    image: "/images/sacred_rudraksha.png",
    image_url: "/images/sacred_rudraksha.png",
    heroBanner: "/images/sacred_rudraksha.png",
    idealFor: "Unisex"
  },
  {
    id: "silver-coins",
    category_id: 7,
    name: "Silver Coins",
    shortName: "Coins & Bars",
    description: "999 pure silver coins for festive gifting & investment",
    image: "/images/silver_coins.png",
    image_url: "/images/silver_coins.png",
    heroBanner: "/images/silver_coins.png",
    idealFor: "Gifts"
  },
  {
    id: "pooja-articles",
    category_id: 8,
    name: "Pooja Articles",
    shortName: "Pooja Articles",
    description: "Traditional pure silver diyas and ritual essentials",
    image: "/images/silver_puja_diya.png",
    image_url: "/images/silver_puja_diya.png",
    heroBanner: "/images/silver_puja_diya.png",
    idealFor: "Puja"
  },
  {
    id: "silverware",
    category_id: 9,
    name: "Silverware",
    shortName: "Silverware",
    description: "Elegant pure silver tableware and silverware sets",
    image: "/images/silverware.png",
    image_url: "/images/silverware.png",
    heroBanner: "/images/silverware.png",
    idealFor: "Gifts"
  },
  {
    id: "bangles-bracelets",
    category_id: 10,
    name: "Bangles & Bracelets",
    shortName: "Bangles & Bracelets",
    description: "Antique temple design silver bangles and kadas",
    image: "/images/temple_silver_bangle.jpg",
    image_url: "/images/temple_silver_bangle.jpg",
    heroBanner: "/images/temple_silver_bangle.jpg",
    idealFor: "Women"
  },
  {
    id: "nazariya",
    category_id: 11,
    name: "Nazariya",
    shortName: "Nazariya",
    description: "Nazariya Collection",
    image: "/images/categories/cat_nazariya.jpg",
    image_url: "/images/categories/cat_nazariya.jpg",
    heroBanner: "/images/categories/cat_nazariya.jpg",
    idealFor: "ALL"
  },
  {
    id: "pendants",
    category_id: 12,
    name: "Pendants",
    shortName: "Pendants",
    description: "Pendants Collection",
    image: "/images/categories/cat_pendants.jpg",
    image_url: "/images/categories/cat_pendants.jpg",
    heroBanner: "/images/categories/cat_pendants.jpg",
    idealFor: "ALL"
  },
  {
    id: "silver-chains",
    category_id: 13,
    name: "Silver Chains",
    shortName: "Silver Chains",
    description: "Silver Chains Collection",
    image: "/images/categories/cat_silver_chains.jpg",
    image_url: "/images/categories/cat_silver_chains.jpg",
    heroBanner: "/images/categories/cat_silver_chains.jpg",
    idealFor: "ALL"
  },
  {
    id: "yantra",
    category_id: 14,
    name: "Yantra",
    shortName: "Yantra",
    description: "Yantra Collection",
    image: "/images/categories/cat_yantra.jpg",
    image_url: "/images/categories/cat_yantra.jpg",
    heroBanner: "/images/categories/cat_yantra.jpg",
    idealFor: "ALL"
  },
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
