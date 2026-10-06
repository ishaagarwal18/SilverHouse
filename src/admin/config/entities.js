import {
  BarChart3,
  Building2,
  Eye,
  Heart,
  Image,
  LayoutGrid,
  Link,
  ListPlus,
  MapPin,
  Package,
  Paintbrush,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  Users,
  Wrench
} from 'lucide-react';

/** Primary key column of every table exposed by /api/data. */
export const PK_MAP = {
  product: 'product_id',
  category: 'category_id',
  image: 'image_id',
  make_master: 'm_id',
  product_image: 'product_id',
  orders: 'order_id',
  custom_orders: 'order_id',
  order_item: 'order_item_id',
  cart: 'cart_id',
  cart_item: 'cart_item_id',
  wishlist: 'wishlist_id',
  user: 'user_id',
  address: 'address_id',
  viewed: 'viewid',
  review: 'reviewid',
  company: 'company_id',
  store_parameter: 'id',
  phone_otp: 'phone'
};

export const ENTITY_CONFIG = {
  product: { singular: 'Product', plural: 'Products', icon: ShoppingBag, hasFormPage: true },
  category: { singular: 'Category', plural: 'Categories', icon: LayoutGrid, hasFormPage: true },
  image: { singular: 'Image', plural: 'Images', icon: Image, hasFormPage: true },
  make_master: { singular: 'Make Master', plural: 'Make Master', icon: Wrench, hasFormPage: true },
  product_image: { singular: 'Product Image', plural: 'Product Images', icon: Link, hasFormPage: true },
  custom_orders: { singular: 'Custom Order', plural: 'Custom Orders', icon: Paintbrush },
  orders: { singular: 'Order', plural: 'Orders', icon: Package },
  order_item: { singular: 'Order Item', plural: 'Order Items', icon: Receipt },
  cart: { singular: 'Cart', plural: 'Carts', icon: ShoppingCart },
  cart_item: { singular: 'Cart Item', plural: 'Cart Items', icon: ListPlus },
  wishlist: { singular: 'Wishlist Item', plural: 'Wishlist', icon: Heart },
  user: { singular: 'User', plural: 'Users', icon: Users },
  address: { singular: 'Address', plural: 'Addresses', icon: MapPin },
  viewed: { singular: 'Viewed Product', plural: 'Recently Viewed', icon: Eye },
  review: { singular: 'Customer Review', plural: 'Product Reviews', icon: Star },
  company: { singular: 'Company Profile', plural: 'Company Details', icon: Building2 },
  store_parameter: { singular: 'Store Parameter', plural: 'Store Parameters', icon: SlidersHorizontal },
  phone_otp: { singular: 'Phone OTP Log', plural: 'Phone OTP Logs', icon: ShieldCheck }
};

/** Tables whose rows can be bulk-imported from CSV / Excel / Word files. */
export const IMPORTABLE_ENTITIES = ['product', 'category', 'image', 'make_master', 'product_image'];

export function getEntityConfig(entity) {
  const label = String(entity || '').replace(/_/g, ' ');
  return ENTITY_CONFIG[entity] || { singular: label, plural: label, icon: Package };
}

export const CUSTOM_CATEGORIES = ['Mukhut', 'Jhalar', 'Thakurji ka saman', 'Temple things'];
export const ORDER_DECISIONS = ['processing', 'accepted', 'rejected'];
export const PAYMENT_STATUSES = ['PENDING', 'PAID', 'CANCELLED', 'FAILED'];

/** Field schemas for tables edited in the in-page record modal. */
export const ENTITY_FORM_SCHEMAS = {
  orders: [
    { name: 'order_number', label: 'Order Number', type: 'text', placeholder: 'e.g. SH-99124' },
    { name: 'customer_name', label: 'Customer Name', type: 'text', placeholder: 'e.g. Radhika Sharma' },
    { name: 'customer_phone', label: 'Customer Phone', type: 'text', placeholder: 'e.g. 9876543210' },
    { name: 'customer_email', label: 'Customer Email', type: 'email', placeholder: 'e.g. radhika@example.com' },
    { name: 'payment_status', label: 'Payment Status', type: 'select', options: PAYMENT_STATUSES, default: 'PENDING' },
    { name: 'total_amount', label: 'Total Amount (₹)', type: 'number', step: '0.01', placeholder: 'e.g. 1599.00' },
    { name: 'discount_amount', label: 'Discount Amount (₹)', type: 'number', step: '0.01', default: 0 },
    { name: 'final_payable', label: 'Final Payable (₹)', type: 'number', step: '0.01', placeholder: 'e.g. 1599.00' },
    { name: 'delivery_address', label: 'Delivery Address', type: 'textarea', fullWidth: true, placeholder: 'Street, City, State - Pincode' },
    { name: 'user_id', label: 'User ID', type: 'number', placeholder: 'e.g. 1' },
    { name: 'address_id', label: 'Address ID', type: 'number', placeholder: 'e.g. 1' }
  ],
  custom_orders: [
    { name: 'order_number', label: 'Custom Order #', type: 'text', placeholder: 'e.g. CUST-...' },
    { name: 'confirm', label: 'Artisan Decision (Confirm Status)', type: 'select', options: ORDER_DECISIONS, default: 'processing' },
    { name: 'final_payable', label: 'Quoted Price / Final Payable (₹)', type: 'number', step: '0.01', placeholder: 'Decide and set quotation for customer' },
    { name: 'custom_category', label: 'Custom Category', type: 'select', options: CUSTOM_CATEGORIES, default: 'Mukhut' },
    { name: 'customer_name', label: 'Customer Name', type: 'text', placeholder: 'e.g. Radhika Sharma' },
    { name: 'customer_phone', label: 'Customer Phone', type: 'text', placeholder: 'e.g. 9876543210' },
    { name: 'customer_email', label: 'Customer Email', type: 'email', placeholder: 'e.g. radhika@example.com' },
    { name: 'payment_status', label: 'Payment Status', type: 'select', options: PAYMENT_STATUSES, default: 'PENDING' },
    { name: 'description', label: 'Customer Requirements & Measurements', type: 'textarea', fullWidth: true }
  ],
  order_item: [
    { name: 'order_id', label: 'Order ID', type: 'number', required: true, placeholder: 'e.g. 1' },
    { name: 'product_id', label: 'Product ID', type: 'number', required: true, placeholder: 'e.g. 5' },
    { name: 'unit_price', label: 'Unit Price (₹)', type: 'number', step: '0.01', required: true, placeholder: 'e.g. 1439.00' },
    { name: 'discount_percent', label: 'Discount (%)', type: 'number', step: '0.01', default: 0 },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true, default: 1 },
    { name: 'subtotal', label: 'Subtotal (₹)', type: 'number', step: '0.01', placeholder: 'e.g. 1439.00' }
  ],
  cart: [
    { name: 'user_id', label: 'User ID', type: 'number', placeholder: 'e.g. 1 (optional for guest carts)' },
    { name: 'guest_token', label: 'Guest Token', type: 'text', placeholder: 'Optional guest token' }
  ],
  cart_item: [
    { name: 'cart_id', label: 'Cart ID', type: 'number', required: true, placeholder: 'e.g. 1' },
    { name: 'product_id', label: 'Product ID', type: 'number', required: true, placeholder: 'e.g. 5' },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true, default: 1 }
  ],
  wishlist: [
    { name: 'user_id', label: 'User ID', type: 'number', required: true, placeholder: 'e.g. 1' },
    { name: 'product_id', label: 'Product ID', type: 'number', required: true, placeholder: 'e.g. 5' }
  ],
  user: [
    { name: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Isha Agarwal' },
    { name: 'phone', label: 'Mobile Number', type: 'text', required: true, placeholder: 'e.g. +91 98765 43210' },
    { name: 'role', label: 'User Role', type: 'select', options: ['CUSTOMER', 'ADMIN'], default: 'CUSTOMER' },
    { name: 'password', label: 'Password (Admins Only)', type: 'password', placeholder: 'Enter password for Admin' }
  ],
  address: [
    { name: 'user_id', label: 'User ID', type: 'number', required: true, placeholder: 'e.g. 1' },
    { name: 'recipient_name', label: 'Recipient Name', type: 'text', required: true, placeholder: 'e.g. Isha Agarwal' },
    { name: 'address_name', label: 'Address Type', type: 'text', placeholder: 'e.g. Home, Office' },
    { name: 'Block', label: 'Block / Flat', type: 'text', required: true, placeholder: 'e.g. A-205' },
    { name: 'street', label: 'Street Address', type: 'text', required: true, placeholder: 'e.g. Akash Metro City', fullWidth: true },
    { name: 'area', label: 'Area / Locality', type: 'text', required: true, placeholder: 'e.g. Isanpur' },
    { name: 'city', label: 'City', type: 'text', required: true, placeholder: 'e.g. Ahmedabad' },
    { name: 'state', label: 'State', type: 'text', required: true, default: 'Gujarat' },
    { name: 'pincode', label: 'Pincode', type: 'text', required: true, placeholder: 'e.g. 382443' },
    { name: 'country', label: 'Country', type: 'text', default: 'India' }
  ],
  viewed: [
    { name: 'productid', label: 'Product ID', type: 'number', required: true, placeholder: 'e.g. 1' },
    { name: 'userid', label: 'User ID', type: 'number', placeholder: 'e.g. 2 (leave blank for guest views)' }
  ],
  review: [
    { name: 'productid', label: 'Product ID', type: 'number', required: true, placeholder: 'e.g. 1' },
    { name: 'userid', label: 'User ID', type: 'number', placeholder: 'e.g. 2 (optional for patron)' },
    { name: 'star', label: 'Rating (1 to 5 Stars)', type: 'select', options: ['5', '4', '3', '2', '1'], default: '5' },
    { name: 'description', label: 'Review Description', type: 'textarea', fullWidth: true, placeholder: 'Customer feedback...' },
    { name: 'photo', label: 'Photo URLs (JSON array or comma separated, max 5)', type: 'textarea', fullWidth: true, placeholder: '["https://example.com/p1.jpg"]' }
  ],
  company: [
    { name: 'name', label: 'Company Name', type: 'text', required: true, placeholder: 'e.g. SilverHouse Jewels' },
    { name: 'contact_number', label: 'Contact Number', type: 'text', required: true, placeholder: 'e.g. +91 98765 43210' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'e.g. contact@silverhouse.com' },
    { name: 'address', label: 'Address', type: 'textarea', required: true, fullWidth: true },
    { name: 'city', label: 'City', type: 'text', required: true, placeholder: 'e.g. Ahmedabad' },
    { name: 'state', label: 'State', type: 'text', required: true, default: 'Gujarat' },
    { name: 'pincode', label: 'Pincode', type: 'text', required: true, placeholder: 'e.g. 380001' },
    { name: 'gst_no', label: 'GST Number', type: 'text', placeholder: 'e.g. 24AAAAA0000A1Z5' },
    { name: 'pan_card', label: 'PAN Card', type: 'text', placeholder: 'e.g. ABCDE1234F' }
  ],
  store_parameter: [
    { name: 'default_theme', label: 'Default Theme', type: 'text', required: true, default: 'royal-gold' },
    { name: 'wp_api', label: 'WhatsApp API Key / Endpoint', type: 'text', placeholder: 'e.g. https://api.whatsapp.com/...' },
    { name: 'current_festival', label: 'Current Festival Banner', type: 'text', default: 'Diwali Festive Sale' }
  ],
  phone_otp: [
    { name: 'phone', label: 'Mobile Number', type: 'text', required: true, placeholder: 'e.g. +919876543210' },
    { name: 'otp_code', label: 'OTP Code', type: 'text', required: true, placeholder: 'e.g. 123456' },
    { name: 'attempts', label: 'Attempts', type: 'number', default: 0 }
  ]
};

/** Sidebar navigation, grouped by section. `badge: 'pendingCustomOrders'` shows the live pending count. */
export const ADMIN_NAV = [
  {
    label: 'Management',
    items: [
      { to: '/admin/catalog', label: 'Product Catalog', icon: LayoutGrid },
      { to: '/admin/custom-orders', label: 'Custom Orders', icon: Paintbrush, badge: 'pendingCustomOrders' },
      { to: '/admin/analytics', label: 'Analytics & P&L', icon: BarChart3 }
    ]
  },
  {
    label: 'Database Schemas',
    items: ['product', 'category', 'image', 'make_master', 'product_image'].map(entityNavItem)
  },
  {
    label: 'Commerce & Users',
    items: ['custom_orders', 'orders', 'order_item', 'cart', 'cart_item', 'wishlist', 'user', 'address', 'viewed', 'review'].map(entityNavItem)
  },
  {
    label: 'System & Configuration',
    items: ['company', 'store_parameter', 'phone_otp'].map(entityNavItem)
  }
];

function entityNavItem(entity) {
  const cfg = ENTITY_CONFIG[entity];
  return {
    to: `/admin/data/${entity}`,
    label: entity === 'custom_orders' ? 'Custom Orders Table' : cfg.plural,
    icon: cfg.icon
  };
}

/** Product form option lists shared by the catalog modal and the product form page. */
export const PURITY_OPTIONS = [
  { value: '92.5 Sterling Silver', label: '92.5 Sterling Silver (Standard 925)' },
  { value: '99.9 Pure Silver', label: '99.9 Pure Silver (Fine 999)' }
];

export const FINISH_OPTIONS = [
  { value: 'Silver', label: 'Fine Silver' },
  { value: 'Rose Gold', label: 'Rose Gold Plated' },
  { value: 'Oxidised', label: 'Bold Oxidised' },
  { value: 'Gold Plated', label: 'Gold Plated' },
  { value: 'Two-Tone Silver', label: 'Two-Tone Silver' }
];

export const AUDIENCE_OPTIONS = ['ALL', 'Women', 'Men', 'Unisex', 'Puja'];
