import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, Calendar, Check, CheckCircle2, ChevronRight, Clock, Download, Image as ImageIcon, Minus, Package, Pencil, Plus, Receipt, RotateCcw, Scale, ShieldCheck, ShoppingCart, Sparkles, Tag, Trash2, Truck, Upload, Zap } from 'lucide-react';
import { adminFetch, adminImageUrl, callProc, fetchRows, formatAdminDate, formatAdminDateOrTime, isDateLikeColumnOrValue, PLACEHOLDER_IMG, productImage } from '../api/adminApi';
import { ENTITY_FORM_SCHEMAS, getEntityConfig, IMPORTABLE_ENTITIES, ORDER_DECISIONS, PK_MAP } from '../config/entities';
import { useAdminUI } from '../context/AdminUIContext';
import { importRecordsFromFile } from '../lib/importRecords';
import {
  Button, Card, ConfirmDeleteModal, DecisionBadge, EmptyState, Field, ImageLightbox, LoadingBlock,
  Modal, ModalBody, PageHeader, PaymentBadge, PillGroup, Spinner
} from '../components/ui';

const HIDDEN_ORDER_COLUMNS = ['confirm', 'custom_category', 'is_custom', 'image', 'description'];
const HIDDEN_CART_COLUMNS = ['total_items'];
const VARCHAR_COLUMNS = [
  'name', 'title', 'product_name', 'category_name', 'category', 'description', 'purity', 'weight', 'image_url', 'url',
  'images', 'image', 'confirm', 'custom_category', 'is_custom', 'role', 'email', 'full_name', 'phone', 'address_line1',
  'address_line2', 'city', 'state', 'postal_code', 'country', 'order_number', 'payment_status', 'order_status', 'password_hash',
  'password', 'remark', 'status', 'created_at', 'updated_at', 'birthday_date', 'anniversary_date', 'gst_number'
];
const VARCHAR_HINTS = ['url', 'name', 'desc', 'date', 'email', 'phone', 'address', 'status', 'text', 'hash', 'time', 'role', 'code', 'number', 'weight', 'purity'];
const NUMERIC_COLUMNS = ['quantity', 'qty', 'stock', 'stock_available', 'stock_qty', 'price', 'discount', 'discount_percent', 'final_price', 'unit_price', 'subtotal', 'total_amount', 'discount_amount', 'final_payable'];
const HIGHLIGHT_STYLES = {
  edit: { color: 'var(--ad-primary)', icon: Pencil, label: 'Edited' },
  add: { color: 'var(--ad-success)', icon: Sparkles, label: 'Added' },
  restock: { color: 'var(--ad-warning)', icon: Zap, label: 'Restocked' }
};

/** True when a column holds numbers (only numeric columns are sortable). */
function isNumericCol(col, rows) {
  if (!col) return false;
  const c = col.toLowerCase();
  if (VARCHAR_COLUMNS.includes(c) || VARCHAR_HINTS.some(h => c.includes(h))) return false;
  if (c.endsWith('_id') || c === 'id' || NUMERIC_COLUMNS.includes(c)) return true;
  let hasValue = false;
  for (const r of rows) {
    const v = r[col];
    if (v !== null && v !== undefined && v !== '' && v !== '-') {
      hasValue = true;
      if (isNaN(Number(v)) || typeof v === 'boolean') return false;
    }
  }
  return hasValue;
}

function isImageColumn(h) {
  const l = h.toLowerCase();
  const isId = l.endsWith('_id') || l.endsWith('id') || l === 'id';
  return !isId && (l === 'image' || l === 'images' || l.includes('image') || l.includes('img_url') || l.includes('url'));
}

function parseImageList(val) {
  if (Array.isArray(val)) return val.map(x => (typeof x === 'string' ? x : x?.url || x?.image_url || '')).filter(Boolean);
  if (typeof val !== 'string' || !val.trim() || val === '-') return [];
  const trimmed = val.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parseImageList(parsed);
    } catch { /* plain string */ }
  }
  return [trimmed];
}

/** Extracts the best available image URL for an order line item or product. */
function getProductThumbnail(item, prod) {
  let raw = item?.image_url;
  if (!raw && prod) {
    raw = productImage(prod);
    if (!raw && prod.images_json) {
      try {
        const parsed = typeof prod.images_json === 'string' ? JSON.parse(prod.images_json) : prod.images_json;
        if (Array.isArray(parsed) && parsed.length > 0) {
          raw = parsed[0]?.image_url || parsed[0];
        }
      } catch { /* ignore */ }
    }
    if (!raw && prod.image) {
      const parsedList = parseImageList(prod.image);
      if (parsedList.length > 0) raw = parsedList[0];
    }
  }
  return adminImageUrl(raw);
}

const recordLabel = (row, id) => row.title || row.name || row.product_name || row.slug || row.type || `Record #${id}`;

/** Route: /admin/data/:entity — generic table manager for every database table. */
export default function DataManagerPage() {
  const { entity } = useParams();
  if (entity === 'order_item') return <Navigate to="/admin/data/orders" replace />;
  if (entity === 'cart_item') return <Navigate to="/admin/data/cart" replace />;
  if (!PK_MAP[entity]) return <Navigate to="/admin/data/product" replace />;
  return <DataManager key={entity} entity={entity} />;
}

function DataManager({ entity }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast, refreshPendingCustomOrders } = useAdminUI();
  const cfg = getEntityConfig(entity);
  const pkField = PK_MAP[entity];
  const isCatalogTable = IMPORTABLE_ENTITIES.includes(entity);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({ col: null, dir: null });
  const [selected, setSelected] = useState(() => new Set());
  const [highlightMap, setHighlightMap] = useState(() => {
    const id = searchParams.get('highlightId') || searchParams.get('highlight');
    return id ? { [id]: (searchParams.get('action') || 'edit').toLowerCase() } : {};
  });
  const [lookups, setLookups] = useState({ categories: {}, makes: {} });
  const [recordModal, setRecordModal] = useState(null); // { mode: 'ADD' | 'EDIT', id? }
  const [expandedOrders, setExpandedOrders] = useState(() => new Set());
  const [orderItemsMap, setOrderItemsMap] = useState({});
  const [orderItemModal, setOrderItemModal] = useState(null); // { mode: 'ADD' | 'EDIT', orderId, item? }
  const [deleteOrderItemCtx, setDeleteOrderItemCtx] = useState(null);
  const [deletingOrderItem, setDeletingOrderItem] = useState(false);
  const [expandedCarts, setExpandedCarts] = useState(() => new Set());
  const [cartItemsMap, setCartItemsMap] = useState({});
  const [cartItemModal, setCartItemModal] = useState(null); // { mode: 'ADD' | 'EDIT', cartId, item? }
  const [deleteCartItemCtx, setDeleteCartItemCtx] = useState(null);
  const [deletingCartItem, setDeletingCartItem] = useState(false);
  const [deleteCtx, setDeleteCtx] = useState(null); // { ids: [], imageId? }
  const [deleting, setDeleting] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { images, index }
  const [textPreview, setTextPreview] = useState(null);
  const [categoryPreviewCtx, setCategoryPreviewCtx] = useState(null); // { festivalId, festivalName, categories: [] }
  const [importMode, setImportMode] = useState('RESTOCK');
  const [importing, setImporting] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState(() => (searchParams.get('status') || 'ALL').toUpperCase());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportingExcel, setExportingExcel] = useState(false);
  const fileInputRef = useRef(null);
  const highlightedRowRef = useRef(null);

  // Strip one-shot highlight params from the URL
  useEffect(() => {
    if (searchParams.has('highlightId') || searchParams.has('highlight') || searchParams.has('action')) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [data, cats, makes, festList, itemsData, prodList, cartItemsData, festCatsData] = await Promise.all([
        fetchRows(entity),
        fetchRows('category'),
        fetchRows('make_master'),
        fetchRows('festival'),
        entity === 'orders' ? fetchRows('order_item') : Promise.resolve([]),
        (entity === 'orders' || entity === 'cart') ? fetchRows('product') : Promise.resolve([]),
        entity === 'cart' ? fetchRows('cart_item') : Promise.resolve([]),
        (entity === 'festival' || entity === 'festival_category') ? fetchRows('festival_category') : Promise.resolve([])
      ]);
      setRows(data);
      if (entity === 'orders' && Array.isArray(itemsData)) {
        const map = {};
        for (const item of itemsData) {
          const oid = String(item.order_id);
          if (!map[oid]) map[oid] = [];
          map[oid].push(item);
        }
        setOrderItemsMap(map);
      }
      if (entity === 'cart' && Array.isArray(cartItemsData)) {
        const map = {};
        for (const item of cartItemsData) {
          const cid = String(item.cart_id);
          if (!map[cid]) map[cid] = [];
          map[cid].push(item);
        }
        setCartItemsMap(map);
      }

      const catMap = Object.fromEntries(cats.map(c => [c.category_id, c.name]));
      const festivalCategoryMap = {};
      const festivalCategoryNamesMap = {};
      const festivalCategoryRaw = {};
      if (Array.isArray(festCatsData)) {
        for (const fc of festCatsData) {
          const fid = String(fc.festival_id || '');
          const cid = Number(fc.category_id);
          if (!festivalCategoryMap[fid]) {
            festivalCategoryMap[fid] = [];
            festivalCategoryNamesMap[fid] = [];
            festivalCategoryRaw[fid] = [];
          }
          festivalCategoryMap[fid].push(cid);
          if (catMap[cid]) festivalCategoryNamesMap[fid].push(catMap[cid]);
          festivalCategoryRaw[fid].push(fc);
        }
      }

      setLookups({
        categories: catMap,
        makes: Object.fromEntries(makes.map(m => [m.m_id, m.type])),
        festivals: Object.fromEntries((festList || []).map(f => [f.id, f.name || f.shortName || f.id])),
        products: Object.fromEntries((prodList || []).map(p => [p.product_id, p.title || p.name || `Product #${p.product_id}`])),
        productMap: Object.fromEntries((prodList || []).map(p => [String(p.product_id), p])),
        categoryList: cats || [],
        festivalList: festList || [],
        productList: prodList || [],
        festivalCategoryMap,
        festivalCategoryNamesMap,
        festivalCategoryRaw
      });
    } catch (err) {
      showToast('Failed to load table: ' + err.message, true);
    } finally {
      setLoading(false);
    }
  }, [entity, showToast]);

  const refreshOrderItems = useCallback(async () => {
    try {
      const items = await fetchRows('order_item');
      if (Array.isArray(items)) {
        const map = {};
        for (const it of items) {
          const oid = String(it.order_id);
          if (!map[oid]) map[oid] = [];
          map[oid].push(it);
        }
        setOrderItemsMap(map);
      }
    } catch (err) {
      console.warn('Failed to refresh order items:', err);
    }
  }, []);

  const refreshCartItems = useCallback(async () => {
    try {
      const items = await fetchRows('cart_item');
      if (Array.isArray(items)) {
        const map = {};
        for (const it of items) {
          const cid = String(it.cart_id);
          if (!map[cid]) map[cid] = [];
          map[cid].push(it);
        }
        setCartItemsMap(map);
      }
    } catch (err) {
      console.warn('Failed to refresh cart items:', err);
    }
  }, []);

  const toggleExpandOrder = idVal => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      const strId = String(idVal);
      if (next.has(strId)) next.delete(strId);
      else next.add(strId);
      return next;
    });
  };

  const toggleExpandCart = idVal => {
    setExpandedCarts(prev => {
      const next = new Set(prev);
      const strId = String(idVal);
      if (next.has(strId)) next.delete(strId);
      else next.add(strId);
      return next;
    });
  };

  const executeDeleteOrderItem = async () => {
    if (!deleteOrderItemCtx) return;
    setDeletingOrderItem(true);
    try {
      const res = await callProc('order_item', 'DELETE', undefined, String(deleteOrderItemCtx.order_item_id));
      if (!res.success) throw new Error(res.status || res.error || 'Failed to delete order item');
      showToast(`Order item #${deleteOrderItemCtx.order_item_id} deleted successfully!`);
      setDeleteOrderItemCtx(null);
      await refreshOrderItems();
      await loadData();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setDeletingOrderItem(false);
    }
  };

  const handleUpdateDeliveredQty = async (orderId, item, newDeliveredQty) => {
    const qty = Math.max(0, Math.min(Number(item.quantity || 1), Number(newDeliveredQty)));
    const oid = String(orderId);

    // Compute updated items for this order directly to avoid stale state
    const existingItems = orderItemsMap[oid] || (rows.find(r => String(r.order_id || r[PK_MAP[entity]]) === oid)?.items) || [];
    const updatedItems = existingItems.map(it =>
      String(it.order_item_id) === String(item.order_item_id)
        ? { ...it, delivered_quantity: qty }
        : it
    );
    const isCompleted = updatedItems.length > 0 && updatedItems.every(it => Number(it.delivered_quantity || 0) >= Number(it.quantity || 1));

    // Immediate optimistic update of items
    setOrderItemsMap(prev => ({
      ...prev,
      [oid]: (prev[oid] || existingItems).map(it =>
        String(it.order_item_id) === String(item.order_item_id)
          ? { ...it, delivered_quantity: qty }
          : it
      )
    }));

    // Immediate optimistic update of order row status and items in main table
    setRows(prevRows =>
      prevRows.map(r => {
        const rId = String(r.order_id || r[PK_MAP[entity]]);
        if (rId !== oid) return r;
        const newItems = Array.isArray(r.items)
          ? r.items.map(it => String(it.order_item_id) === String(item.order_item_id) ? { ...it, delivered_quantity: qty } : it)
          : r.items;
        return {
          ...r,
          order_status: isCompleted ? 'COMPLETED' : 'PENDING',
          items: newItems
        };
      })
    );

    try {
      const res = await callProc(
        'order_item',
        'EDIT',
        {
          order_id: Number(orderId),
          quantity: Number(item.quantity),
          delivered_quantity: qty
        },
        String(item.order_item_id)
      );
      if (!res.success) throw new Error(res.status || res.error || 'Failed to update delivered quantity');

      if (isCompleted) {
        showToast('All items delivered! Order status marked as COMPLETED.');
      } else {
        showToast(`Delivered: ${qty}/${item.quantity} pcs for ${item.product_name || 'item'} (Order status: PENDING)`);
      }
      await refreshOrderItems();
      await loadData();
    } catch (err) {
      showToast(err.message, true);
      await refreshOrderItems();
      await loadData();
    }
  };

  const executeDeleteCartItem = async () => {
    if (!deleteCartItemCtx) return;
    setDeletingCartItem(true);
    try {
      const res = await callProc('cart_item', 'DELETE', undefined, String(deleteCartItemCtx.cart_item_id));
      if (!res.success) throw new Error(res.status || res.error || 'Failed to delete cart item');
      showToast(`Cart item #${deleteCartItemCtx.cart_item_id} deleted successfully!`);
      setDeleteCartItemCtx(null);
      await refreshCartItems();
      await loadData();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setDeletingCartItem(false);
    }
  };

  useEffect(() => { loadData(); }, [loadData]);

  // Scroll the first highlighted row into view after it renders
  useEffect(() => {
    if (!loading && highlightedRowRef.current) {
      const t = setTimeout(() => highlightedRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [loading, highlightMap]);

  const headers = useMemo(() => {
    if (rows.length === 0) return [];
    const keys = Object.keys(rows[0]);
    if (entity === 'orders') return keys.filter(h => !HIDDEN_ORDER_COLUMNS.includes(h));
    if (entity === 'cart') return keys.filter(h => !HIDDEN_CART_COLUMNS.includes(h));
    if (entity === 'festival') {
      return [...keys, 'linked_categories'];
    }
    return keys;
  }, [rows, entity]);

  const getSortValue = useCallback((row, col) => {
    if (!row) return null;
    const val = row[col];
    if (val === null || val === undefined || val === '' || val === '-') return null;

    if (col === 'category_id') {
      return lookups.categories?.[val] || row.category_name || String(val);
    }
    if (col === 'festival_id') {
      return lookups.festivals?.[val] || row.festival_name || String(val);
    }
    if (entity === 'product' && col === 'm_id') {
      return lookups.makes?.[val] || String(val);
    }

    if (typeof val === 'number') return val;
    const str = String(val).trim();
    if (str !== '' && !isNaN(Number(str))) return Number(str);
    return str;
  }, [lookups, entity]);

  const sortedRows = useMemo(() => {
    if (!sort.col || !sort.dir) return rows;
    const col = sort.col;
    const dir = sort.dir === 'asc' ? 1 : -1;

    return [...rows].sort((a, b) => {
      const valA = getSortValue(a, col);
      const valB = getSortValue(b, col);

      if (valA === null && valB === null) return 0;
      if (valA === null) return 1;
      if (valB === null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return dir * (valA - valB);
      }

      return dir * String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [rows, sort, getSortValue]);

  const getOrderStatus = useCallback((row) => {
    if (!row) return 'PENDING';
    const idVal = String(row.order_id || row[pkField] || '');
    const oItems = orderItemsMap[idVal] || (Array.isArray(row.items) ? row.items : []);
    if (oItems && oItems.length > 0) {
      const isCompleted = oItems.every(it => Number(it.delivered_quantity || 0) >= Number(it.quantity || 1));
      return isCompleted ? 'COMPLETED' : 'PENDING';
    }
    return String(row.order_status || '').toUpperCase() === 'COMPLETED' ? 'COMPLETED' : 'PENDING';
  }, [orderItemsMap, pkField]);

  const orderStatusCounts = useMemo(() => {
    if (entity !== 'orders') return { all: 0, pending: 0, completed: 0 };
    let dateFiltered = rows;
    if (startDate) {
      const startMs = new Date(startDate + 'T00:00:00').getTime();
      dateFiltered = dateFiltered.filter(r => {
        if (!r.created_at) return false;
        const t = new Date(r.created_at).getTime();
        return !isNaN(t) && t >= startMs;
      });
    }
    if (endDate) {
      const endMs = new Date(endDate + 'T23:59:59.999').getTime();
      dateFiltered = dateFiltered.filter(r => {
        if (!r.created_at) return false;
        const t = new Date(r.created_at).getTime();
        return !isNaN(t) && t <= endMs;
      });
    }
    let pending = 0;
    let completed = 0;
    dateFiltered.forEach(r => {
      const s = getOrderStatus(r);
      if (s === 'COMPLETED') completed++;
      else pending++;
    });
    return { all: dateFiltered.length, pending, completed };
  }, [entity, rows, startDate, endDate, getOrderStatus]);

  const displayedRows = useMemo(() => {
    let list = sortedRows;
    if (entity === 'orders') {
      if (orderStatusFilter !== 'ALL') {
        list = list.filter(r => getOrderStatus(r) === orderStatusFilter);
      }
      if (startDate) {
        const startMs = new Date(startDate + 'T00:00:00').getTime();
        list = list.filter(r => {
          if (!r.created_at) return false;
          const t = new Date(r.created_at).getTime();
          return !isNaN(t) && t >= startMs;
        });
      }
      if (endDate) {
        const endMs = new Date(endDate + 'T23:59:59.999').getTime();
        list = list.filter(r => {
          if (!r.created_at) return false;
          const t = new Date(r.created_at).getTime();
          return !isNaN(t) && t <= endMs;
        });
      }
    }
    return list;
  }, [sortedRows, entity, orderStatusFilter, startDate, endDate, getOrderStatus]);

  const handleExportExcel = async () => {
    if (displayedRows.length === 0) {
      showToast('No orders match the selected filters to export.', true);
      return;
    }

    setExportingExcel(true);
    try {
      const XLSX = await import('xlsx');

      // Sheet 1: Orders Summary
      const ordersSheetData = displayedRows.map(o => {
        const idVal = String(o.order_id || o.id || '');
        const items = orderItemsMap[idVal] || (Array.isArray(o.items) ? o.items : []);
        const totalQty = items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);
        const deliveredQty = items.reduce((sum, it) => sum + Math.min(Number(it.quantity || 0), Number(it.delivered_quantity || 0)), 0);
        const effectiveStatus = getOrderStatus(o);

        const formattedDate = o.created_at ? formatAdminDateOrTime(o.created_at, 'created_at') : '-';

        const itemsSummary = items.map(it => {
          const pName = it.product_name || lookups.products?.[it.product_id] || `Product #${it.product_id}`;
          return `${pName} (Qty: ${it.quantity}, Del: ${it.delivered_quantity || 0}, ₹${it.unit_price || 0})`;
        }).join('; ');

        return {
          'Order ID': o.order_id,
          'Order Number': o.order_number || `SH-${o.order_id}`,
          'Order Date': formattedDate,
          'Customer Name': o.customer_name || '-',
          'Customer Phone': o.customer_phone || '-',
          'Customer Email': o.customer_email || '-',
          'Delivery Address': o.delivery_address || '-',
          'City': o.city || '-',
          'Payment Status': (o.payment_status || 'PENDING').toUpperCase(),
          'Order Status': effectiveStatus,
          'Total Ordered Qty': totalQty,
          'Delivered Qty': deliveredQty,
          'Total Amount (₹)': Number(o.total_amount || 0),
          'Discount Amount (₹)': Number(o.discount_amount || 0),
          'Final Payable (₹)': Number(o.final_payable || 0),
          'Items Summary': itemsSummary || '-'
        };
      });

      // Sheet 2: Detailed Line Items
      const itemsSheetData = [];
      displayedRows.forEach(o => {
        const idVal = String(o.order_id || o.id || '');
        const items = orderItemsMap[idVal] || (Array.isArray(o.items) ? o.items : []);
        items.forEach((it, idx) => {
          const pName = it.product_name || lookups.products?.[it.product_id] || `Product #${it.product_id}`;
          const qOrdered = Number(it.quantity || 0);
          const qDelivered = Number(it.delivered_quantity || 0);
          const itemStatus = qDelivered >= qOrdered ? 'FULLY DELIVERED' : (qDelivered > 0 ? 'PARTIALLY DELIVERED' : 'PENDING');

          itemsSheetData.push({
            'Order ID': o.order_id,
            'Order Number': o.order_number || `SH-${o.order_id}`,
            'Customer Name': o.customer_name || '-',
            'Customer Phone': o.customer_phone || '-',
            'Item #': idx + 1,
            'Product ID': it.product_id,
            'Product Name': pName,
            'Unit Price (₹)': Number(it.unit_price || 0),
            'Ordered Quantity': qOrdered,
            'Delivered Quantity': qDelivered,
            'Pending Quantity': Math.max(0, qOrdered - qDelivered),
            'Discount %': Number(it.discount_percent || 0),
            'Subtotal (₹)': Number(it.subtotal || (Number(it.unit_price || 0) * qOrdered)),
            'Fulfillment Status': itemStatus
          });
        });
      });

      const wb = XLSX.utils.book_new();
      const wsOrders = XLSX.utils.json_to_sheet(ordersSheetData);
      wsOrders['!cols'] = [
        { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 18 },
        { wch: 16 }, { wch: 20 }, { wch: 30 }, { wch: 14 },
        { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 },
        { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 45 }
      ];
      XLSX.utils.book_append_sheet(wb, wsOrders, 'Orders');

      if (itemsSheetData.length > 0) {
        const wsItems = XLSX.utils.json_to_sheet(itemsSheetData);
        wsItems['!cols'] = [
          { wch: 10 }, { wch: 15 }, { wch: 18 }, { wch: 16 },
          { wch: 8 }, { wch: 12 }, { wch: 25 }, { wch: 14 },
          { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 12 },
          { wch: 14 }, { wch: 18 }
        ];
        XLSX.utils.book_append_sheet(wb, wsItems, 'Order Line Items');
      }

      const datePart = new Date().toISOString().slice(0, 10);
      const statusPart = orderStatusFilter.toLowerCase();
      const rangePart = (startDate || endDate) ? `_${startDate || 'start'}_to_${endDate || 'today'}` : '';
      const fileName = `SilverHouse_Orders_${statusPart}${rangePart}_${datePart}.xlsx`;

      XLSX.writeFile(wb, fileName);
      showToast(`Exported ${displayedRows.length} order(s) to ${fileName}`);
    } catch (err) {
      console.error('Failed to export orders to Excel:', err);
      showToast('Export failed: ' + err.message, true);
    } finally {
      setExportingExcel(false);
    }
  };

  const handleSort = col => {
    if (isImageColumn(col)) return;
    setSort(prev => {
      if (prev.col !== col) return { col, dir: 'asc' };
      if (prev.dir === 'asc') return { col, dir: 'desc' };
      return { col: null, dir: null };
    });
  };

  // ---------- Selection ----------
  const allSelected = displayedRows.length > 0 && displayedRows.every(r => selected.has(String(r[pkField])));
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll = checked => setSelected(checked ? new Set(displayedRows.map(r => String(r[pkField]))) : new Set());
  const toggleOne = (id, checked) => setSelected(prev => {
    const next = new Set(prev);
    if (checked) next.add(String(id)); else next.delete(String(id));
    return next;
  });

  // ---------- Add / edit ----------
  const openAdd = () => {
    if (cfg.hasFormPage) navigate(`/admin/data/${entity}/new`);
    else setRecordModal({ mode: 'ADD' });
  };
  const openEdit = id => {
    if (cfg.hasFormPage) navigate(`/admin/data/${entity}/${id}/edit`);
    else setRecordModal({ mode: 'EDIT', id });
  };

  const quickUpdateDecision = async (id, newStatus) => {
    try {
      let success = false;
      try {
        const { data } = await adminFetch(`/admin/custom-orders/${id}`, { method: 'PUT', body: { confirm: newStatus } });
        success = Boolean(data?.success);
      } catch { /* fall back to the stored procedure */ }
      if (!success) {
        const res = await callProc('orders', 'EDIT', { order_id: Number(id), confirm: newStatus }, String(id));
        if (!res.success) throw new Error(res.error || 'Failed to update order');
      }
      showToast(`Order #${id} decision updated to ${newStatus.toUpperCase()}!`);
      refreshPendingCustomOrders();
      loadData();
    } catch (err) {
      showToast('Status update failed: ' + err.message, true);
    }
  };

  // ---------- Delete ----------
  const executeDelete = async () => {
    if (!deleteCtx?.ids?.length) return setDeleteCtx(null);
    setDeleting(true);
    let ok = 0;
    let failed = 0;
    let lastError = '';
    for (const id of deleteCtx.ids) {
      let tableValues = undefined;
      let targetCondition = String(id);
      if (entity === 'product_image') {
        const row = deleteCtx.row || rows.find(r => String(r.image_id) === String(id));
        const pId = row?.product_id || deleteCtx.productId;
        const imgId = row?.image_id || id;
        tableValues = { product_id: pId, image_id: Number(imgId) };
        targetCondition = String(pId);
      }
      try {
        const res = await callProc(entity, 'DELETE', tableValues, targetCondition);
        if (res.success) ok++;
        else { failed++; lastError = res.status || res.error; }
      } catch (err) {
        failed++;
        lastError = err.message;
      }
    }
    setDeleting(false);
    setDeleteCtx(null);
    setSelected(new Set());
    if (ok > 0) {
      showToast(`Successfully deleted ${ok} record(s).`);
      loadData();
    }
    if (failed > 0) showToast(`Failed to delete ${failed} record(s): ${cleanErrorMessage(lastError) || 'Unknown error'}`, true);
  };

  // ---------- Import ----------
  const runImport = async (file, fileHandle) => {
    setImporting(true);
    showToast(`Parsing ${file.name}…`);
    try {
      const result = await importRecordsFromFile({ file, fileHandle, entity, mode: importMode });
      setHighlightMap(result.highlightMap);
      const notice = result.savedInPlace ? `Saved in-place to ${result.outputName}` : `Downloaded with remarks as ${result.outputName}`;
      showToast(`Import completed! ${notice} (${result.summary})`, result.failed > 0);
      loadData();
    } catch (err) {
      showToast('Import Error: ' + err.message, true);
    } finally {
      setImporting(false);
    }
  };

  const triggerImport = async () => {
    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [{
            description: 'Data Files (.csv, .xlsx, .xls, .docx)',
            accept: {
              'text/csv': ['.csv'],
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
              'application/vnd.ms-excel': ['.xls'],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
            }
          }],
          multiple: false
        });
        if (handle) await runImport(await handle.getFile(), handle);
      } catch (err) {
        if (err.name !== 'AbortError') showToast('File selection error: ' + err.message, true);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  // ---------- Cell rendering ----------
  const renderCell = (h, row, idVal) => {
    const raw = row[h];
    const val = raw !== null && raw !== undefined ? raw : '-';

    if (h === 'password_hash' || h === 'password') {
      return <span className="font-mono tracking-widest text-ad-muted">••••••••</span>;
    }
    if (isImageColumn(h) && val !== '-') {
      const list = parseImageList(val);
      if (list.length === 0) return <span className="text-xs italic text-ad-muted">No image</span>;
      return (
        <button type="button" className="inline-flex items-center gap-1.5 cursor-pointer" onClick={() => setLightbox({ images: list, index: 0 })} title="Click to inspect full image">
          <img src={adminImageUrl(list[0])} alt="" className="h-11 w-11 rounded-lg border border-ad-border object-cover transition-transform hover:scale-110" onError={e => { e.currentTarget.src = PLACEHOLDER_IMG; }} />
          {list.length > 1 && <span className="rounded-full border border-ad-violet/40 bg-ad-violet/15 px-1.5 py-0.5 text-[11px] font-bold text-ad-violet">+{list.length - 1}</span>}
        </button>
      );
    }
    if (h === 'confirm' && val !== '-' && entity === 'custom_orders') {
      const status = String(val).toLowerCase();
      return (
        <div className="inline-flex items-center gap-1.5">
          <DecisionBadge status={status} />
          <select
            value={ORDER_DECISIONS.includes(status) ? status : 'processing'}
            onChange={e => quickUpdateDecision(idVal, e.target.value)}
            className="rounded-md border border-ad-border bg-ad-card px-1.5 py-0.5 text-[11px] text-ad-text cursor-pointer"
            title="Change order decision"
            aria-label={`Change decision for order ${idVal}`}
          >
            {ORDER_DECISIONS.map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      );
    }
    if (h === 'is_custom') {
      const isCustom = raw === 1 || raw === true || String(raw).toLowerCase() === 'true';
      return isCustom
        ? <span className="inline-flex items-center gap-1 rounded-md border border-ad-violet/30 bg-ad-violet/15 px-2 py-0.5 text-[11px] font-bold text-ad-violet"><Sparkles className="w-3 h-3" /> Custom</span>
        : <span className="text-xs text-ad-muted">Standard</span>;
    }
    if (h === 'custom_category' && val !== '-') {
      return <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-ad-accent/25 bg-ad-accent/12 px-2 py-0.5 text-xs font-semibold text-ad-accent"><Tag className="w-3 h-3" /> {val}</span>;
    }
    if (h === 'description' && val !== '-') {
      const text = String(val);
      return (
        <button type="button" onClick={() => setTextPreview(text)} className="max-w-56 truncate border-b border-dotted border-ad-muted text-left text-[12.5px] cursor-pointer" title="Click to view full description">
          {text.length > 32 ? `${text.slice(0, 32)}…` : text}
        </button>
      );
    }
    if (h === 'payment_status' && val !== '-') return <PaymentBadge status={val} />;
    if (h === 'order_status' && val !== '-') {
      let isCompleted = String(val).toUpperCase() === 'COMPLETED';
      if (entity === 'orders') {
        const oItems = orderItemsMap[String(idVal)] || (Array.isArray(row.items) ? row.items : []);
        if (oItems.length > 0) {
          isCompleted = oItems.every(it => Number(it.delivered_quantity || 0) >= Number(it.quantity || 1));
        }
      }
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border ${isCompleted
            ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-2xs'
            : 'border-amber-500/40 bg-amber-500/15 text-amber-400'
            }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-400 ring-2 ring-emerald-400/30' : 'bg-amber-400'}`} />
          {isCompleted ? 'COMPLETED' : 'PENDING'}
        </span>
      );
    }
    if (/amount|payable|price|subtotal/.test(h) && val !== '-' && !isNaN(Number(val))) {
      return <span className="font-mono font-semibold">₹{Number(val).toLocaleString('en-IN')}</span>;
    }
    if (h === 'items' && Array.isArray(raw)) {
      if (raw.length === 0) return <span className="text-ad-muted">-</span>;
      const isExpanded = (entity === 'orders' && expandedOrders.has(String(idVal))) || (entity === 'cart' && expandedCarts.has(String(idVal)));
      const totalOrdered = raw.reduce((sum, it) => sum + Number(it.quantity || 0), 0);
      const totalDelivered = raw.reduce((sum, it) => sum + Math.min(Number(it.quantity || 0), Number(it.delivered_quantity || 0)), 0);
      const isAllDelivered = totalOrdered > 0 && totalDelivered >= totalOrdered;

      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (entity === 'orders' ? toggleExpandOrder(idVal) : toggleExpandCart(idVal))}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-ad-border bg-ad-card hover:bg-ad-hover hover:border-ad-primary/40 font-mono text-xs font-semibold text-ad-text transition-colors cursor-pointer"
            title={`Click to view and manage line items in this ${entity === 'orders' ? 'order' : 'cart'}`}
          >
            <span>{raw.length} {raw.length === 1 ? 'product' : 'products'}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-ad-primary' : 'text-ad-muted'}`} />
          </button>
          {entity === 'orders' && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold border ${isAllDelivered
                ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                : totalDelivered > 0
                  ? 'border-amber-500/30 bg-amber-500/15 text-amber-400'
                  : 'border-ad-border bg-ad-card/60 text-ad-muted'
                }`}
              title={`${totalDelivered} of ${totalOrdered} items delivered`}
            >
              <Package className="w-3 h-3" />
              {totalDelivered}/{totalOrdered} del.
            </span>
          )}
        </div>
      );
    }
    if (h === 'linked_categories') {
      const festId = String(row.id || idVal || '');
      const catNames = lookups.festivalCategoryNamesMap?.[festId] || [];
      const catIds = lookups.festivalCategoryMap?.[festId] || [];
      if (catNames.length === 0) {
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-ad-muted/60 italic">
            <span className="w-1.5 h-1.5 rounded-full bg-ad-border" />
            None
          </span>
        );
      }

      const visible = catNames.slice(0, 2);
      const remaining = catNames.length - visible.length;

      const handleOpenCategoryPreview = (e) => {
        e.stopPropagation();
        setCategoryPreviewCtx({
          festivalId: festId,
          festivalName: row.name || row.shortName || `Festival (${festId})`,
          categories: catNames.map((name, idx) => ({
            name,
            id: catIds[idx] || null
          }))
        });
      };

      return (
        <div
          className="inline-flex items-center gap-1.5 whitespace-nowrap"
          title={`Click to view all ${catNames.length} linked categories:\n${catNames.map(c => `• ${c}`).join('\n')}`}
        >
          {visible.map((name, i) => (
            <button
              key={i}
              type="button"
              onClick={handleOpenCategoryPreview}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11.5px] font-medium bg-ad-card border border-ad-border/80 text-ad-text shadow-2xs hover:border-ad-primary/40 hover:bg-ad-hover transition-colors cursor-pointer"
            >
              <Tag className="w-2.5 h-2.5 text-ad-primary shrink-0 opacity-70" />
              <span className="max-w-[120px] truncate">{name}</span>
            </button>
          ))}
          {remaining > 0 && (
            <button
              type="button"
              onClick={handleOpenCategoryPreview}
              className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10.5px] font-bold bg-ad-primary/10 border border-ad-primary/25 text-ad-primary hover:bg-ad-primary hover:text-white transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              title={`Click to view all ${catNames.length} linked categories`}
            >
              +{remaining}
            </button>
          )}
        </div>
      );
    }
    if (h === 'category_id' && val !== '-') {
      return lookups.categories[val] ? `${lookups.categories[val]} (#${val})` : (row.category_name || val);
    }
    if (h === 'festival_id' && val !== '-') {
      return lookups.festivals[val] ? `${lookups.festivals[val]} (${val})` : (row.festival_name || val);
    }
    if (isDateLikeColumnOrValue(h, val)) {
      return (
        <span className="font-mono text-xs text-ad-text whitespace-nowrap" title={String(val)}>
          {formatAdminDateOrTime(val, h)}
        </span>
      );
    }
    if (h === 'gst_number' && val !== '-') {
      return <span className="font-mono text-xs font-semibold tracking-wider text-ad-text uppercase">{val}</span>;
    }
    if (entity === 'product' && h === 'm_id' && val !== '-') return lookups.makes[val] || val;
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const columnTitle = h => {
    if (h === 'linked_categories') return 'Linked Categories';
    if (h === 'order_status') return 'Order Status';
    if (h === 'category_id') return 'Category Name';
    if (h === 'festival_id') return 'Festival Name';
    if (h === 'birthday_date') return 'Birthday';
    if (h === 'anniversary_date') return 'Anniversary';
    if (h === 'created_at') return 'Created At';
    if (h === 'updated_at') return 'Updated At';
    if (h === 'start_date') return 'Start Date';
    if (h === 'end_date') return 'End Date';
    if (h === 'order_date') return 'Order Date';
    if (h === 'gst_number') return 'GST Number';
    if (h === 'cart_total') return 'Cart Total';
    if (h === 'total_items') return 'Total Items';
    if (h === 'total_quantity') return 'Total Qty';
    if (entity === 'product') {
      if (h === 'm_id') return 'Make Master';
      if (h === 'title') return 'Product Name';
    }
    return h.replace(/_/g, ' ');
  };

  let firstHighlightAssigned = false;

  return (
    <div>
      <PageHeader
        title={cfg.plural}
        description={`Manage, sort and review ${cfg.plural.toLowerCase()} live table data (dbo.${entity})`}
        icon={cfg.icon}
        actions={
          <>
            {entity === 'product' && (
              <select value={importMode} onChange={e => setImportMode(e.target.value)} className="ad-input w-auto! py-2.5" aria-label="Import mode">
                <option value="RESTOCK">⚡ Inward Stock Mode</option>
                <option value="EDIT">✏️ Overwrite Mode</option>
              </select>
            )}
            {isCatalogTable && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.docx"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) runImport(file, null);
                  }}
                />
                <Button onClick={triggerImport} disabled={importing}>
                  {importing ? <Spinner /> : <Upload className="w-4 h-4" />} Import File
                </Button>
              </>
            )}
            <Button variant="primary" onClick={openAdd}>
              <Plus className="w-4 h-4" /> Add {cfg.singular}
            </Button>
          </>
        }
      />

      {selected.size > 0 && (
        <div className="sticky top-18 z-20 mb-4 flex flex-col gap-3 rounded-xl border border-ad-danger/30 bg-ad-surface p-3 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ad-danger/12 px-3 py-1 text-xs font-bold text-ad-danger">
              <Check className="w-3.5 h-3.5" /> {selected.size} selected
            </span>
            <button type="button" onClick={() => setSelected(new Set())} className="text-xs font-semibold text-ad-muted underline-offset-2 hover:text-ad-text hover:underline cursor-pointer">
              Deselect all
            </button>
          </div>
          <Button variant="danger" onClick={() => setDeleteCtx({ ids: Array.from(selected) })}>
            <Trash2 className="w-4 h-4" /> Delete Selected ({selected.size})
          </Button>
        </div>
      )}

      {entity === 'orders' && !loading && rows.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-ad-border bg-ad-surface p-3.5 shadow-xs">
          {/* Top row: Status filter & Export to Excel button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-ad-muted mr-1">
                Status:
              </span>
              <PillGroup
                size="md"
                value={orderStatusFilter}
                onChange={setOrderStatusFilter}
                options={[
                  { value: 'ALL', label: 'All Orders', icon: Package, count: orderStatusCounts.all },
                  { value: 'PENDING', label: 'Pending', icon: Clock, count: orderStatusCounts.pending },
                  { value: 'COMPLETED', label: 'Completed', icon: CheckCircle2, count: orderStatusCounts.completed }
                ]}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportExcel}
                disabled={exportingExcel || displayedRows.length === 0}
                className="!bg-emerald-600 hover:!bg-emerald-700 !text-white font-medium shadow-sm transition-all flex items-center gap-1.5"
                title="Download filtered orders and item breakdown as an Excel (.xlsx) file"
              >
                {exportingExcel ? (
                  <>
                    <Spinner size="xs" /> Exporting…
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download Excel
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Bottom row: Date filter (From & To) + Clear button + Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-ad-border/60 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-semibold text-ad-text flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-ad-primary" /> Date Range:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-ad-muted">From</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="rounded-lg border border-ad-border bg-ad-card px-2.5 py-1 text-xs text-ad-text shadow-xs focus:border-ad-primary focus:outline-hidden"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-ad-muted">To</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="rounded-lg border border-ad-border bg-ad-card px-2.5 py-1 text-xs text-ad-text shadow-xs focus:border-ad-primary focus:outline-hidden"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="inline-flex items-center gap-1 rounded-lg border border-ad-border bg-ad-card/60 px-2 py-1 text-xs text-ad-muted hover:text-ad-text hover:bg-ad-card transition-colors cursor-pointer"
                  title="Clear date filter"
                >
                  <RotateCcw className="w-3 h-3" /> Clear Dates
                </button>
              )}
            </div>

            <div className="text-xs text-ad-muted">
              Showing <strong className="text-ad-text font-bold">{displayedRows.length}</strong> of <strong className="text-ad-text font-bold">{rows.length}</strong> {rows.length === 1 ? 'order' : 'orders'}
              {(startDate || endDate) && (
                <span className="ml-1 text-ad-primary font-medium">
                  ({startDate ? formatAdminDate(startDate) : 'earliest'} → {endDate ? formatAdminDate(endDate) : 'latest'})
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <LoadingBlock label={`Loading ${cfg.plural.toLowerCase()}…`} />
        ) : rows.length === 0 ? (
          <EmptyState title={`No ${cfg.plural.toLowerCase()} yet`} description={`No records present in dbo.${entity}. Click "Add ${cfg.singular}" to create one.`} />
        ) : displayedRows.length === 0 ? (
          <EmptyState
            icon={orderStatusFilter === 'COMPLETED' ? CheckCircle2 : Clock}
            title={
              startDate || endDate
                ? 'No orders found for selected filters'
                : `No ${orderStatusFilter.toLowerCase()} orders found`
            }
            description={
              startDate || endDate
                ? `No orders match ${orderStatusFilter === 'ALL' ? '' : orderStatusFilter + ' status'} between ${startDate ? formatAdminDate(startDate) : 'earliest'} and ${endDate ? formatAdminDate(endDate) : 'latest'}. Try adjusting or clearing filters.`
                : `There are currently no orders with ${orderStatusFilter} status. Switch back to "All Orders" to view every recorded order.`
            }
          >
            <div className="flex flex-wrap items-center justify-center gap-2">
              {(startDate || endDate) && (
                <Button variant="secondary" size="sm" onClick={() => { setStartDate(''); setEndDate(''); }}>
                  Clear Date Filter
                </Button>
              )}
              {orderStatusFilter !== 'ALL' && (
                <Button variant="primary" size="sm" onClick={() => setOrderStatusFilter('ALL')}>
                  Show All Orders ({rows.length})
                </Button>
              )}
              {orderStatusFilter === 'ALL' && (startDate || endDate) && (
                <Button variant="primary" size="sm" onClick={() => { setStartDate(''); setEndDate(''); }}>
                  Show All ({rows.length})
                </Button>
              )}
            </div>
          </EmptyState>
        ) : (
          <div className="ad-scroll max-h-[calc(100vh-15rem)] overflow-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead className="sticky top-0 z-10 bg-ad-card">
                <tr>
                  <th className="w-10 border-b border-ad-border px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={el => { if (el) el.indeterminate = someSelected; }}
                      onChange={e => toggleAll(e.target.checked)}
                      aria-label="Select all"
                    />
                  </th>
                  {(entity === 'orders' || entity === 'cart') && (
                    <th className="w-12 border-b border-ad-border px-2 py-3" aria-label={`Expand ${entity === 'orders' ? 'order' : 'cart'}`} />
                  )}
                  {headers.map(h => {
                    const sortable = !isImageColumn(h) && h !== 'linked_categories';
                    const active = sort.col === h;
                    const SortIcon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
                    return (
                      <th key={h} className="whitespace-nowrap border-b border-ad-border px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-ad-muted">
                        {sortable ? (
                          <button type="button" onClick={() => handleSort(h)} className={`inline-flex items-center gap-1 uppercase cursor-pointer hover:text-ad-text ${active ? 'text-ad-primary font-bold' : ''}`}>
                            {columnTitle(h)} <SortIcon className="w-3.5 h-3.5" />
                          </button>
                        ) : columnTitle(h)}
                      </th>
                    );
                  })}
                  <th className="sticky right-0 border-b border-ad-border bg-ad-card px-3 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-ad-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row, rowIdx) => {
                  const idVal = row[pkField];
                  const action = highlightMap[idVal] || highlightMap[String(idVal)];
                  const hl = HIGHLIGHT_STYLES[action];
                  const isFirstHighlight = hl && !firstHighlightAssigned;
                  if (isFirstHighlight) firstHighlightAssigned = true;
                  const checked = selected.has(String(idVal));
                  const isOrderExpanded = entity === 'orders' && expandedOrders.has(String(idVal));
                  const isCartExpanded = entity === 'cart' && expandedCarts.has(String(idVal));
                  const isExpanded = isOrderExpanded || isCartExpanded;
                  const orderItems = (entity === 'orders' && orderItemsMap[String(idVal)]) || [];
                  const cartItems = (entity === 'cart' && cartItemsMap[String(idVal)]) || [];

                  return (
                    <React.Fragment key={`${idVal}-${rowIdx}`}>
                      <tr
                        ref={isFirstHighlight ? highlightedRowRef : undefined}
                        className={`border-b border-ad-border last:border-0 hover:bg-ad-card/60 transition-colors ${hl ? 'ad-row-flash' : ''} ${checked ? 'bg-ad-primary/5' : ''} ${isExpanded ? 'bg-ad-card/30' : ''}`}
                        style={hl ? { '--ad-flash': hl.color, boxShadow: `inset 3px 0 0 ${hl.color}` } : undefined}
                      >
                        <td className="px-3 py-2.5">
                          <input type="checkbox" checked={checked} onChange={e => toggleOne(idVal, e.target.checked)} aria-label={`Select record ${idVal}`} />
                        </td>
                        {entity === 'orders' && (
                          <td className="w-12 px-2 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => toggleExpandOrder(idVal)}
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border transition-all cursor-pointer ${isOrderExpanded
                                ? 'bg-ad-primary text-white border-ad-primary shadow-xs'
                                : 'bg-ad-card text-ad-muted hover:text-ad-text hover:bg-ad-hover border-ad-border'
                                }`}
                              title={isOrderExpanded ? 'Hide order items' : `View ${orderItems.length} order line item(s)`}
                              aria-label={`Toggle order items for order ${row.order_number || idVal}`}
                            >
                              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isOrderExpanded ? 'rotate-90' : ''}`} />
                            </button>
                          </td>
                        )}
                        {entity === 'cart' && (
                          <td className="w-12 px-2 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => toggleExpandCart(idVal)}
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border transition-all cursor-pointer ${isCartExpanded
                                ? 'bg-ad-primary text-white border-ad-primary shadow-xs'
                                : 'bg-ad-card text-ad-muted hover:text-ad-text hover:bg-ad-hover border-ad-border'
                                }`}
                              title={isCartExpanded ? 'Hide cart items' : `View ${cartItems.length} cart line item(s)`}
                              aria-label={`Toggle cart items for cart #${idVal}`}
                            >
                              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isCartExpanded ? 'rotate-90' : ''}`} />
                            </button>
                          </td>
                        )}
                        {headers.map((h, idx) => (
                          <td key={h} className="max-w-72 px-3 py-2.5 align-middle text-ad-text">
                            <div className="flex items-center gap-2">
                              <span className="min-w-0 truncate">{renderCell(h, row, idVal)}</span>
                              {idx === 0 && hl && (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white" style={{ background: hl.color }}>
                                  <hl.icon className="w-3 h-3" /> {hl.label}
                                </span>
                              )}
                            </div>
                          </td>
                        ))}
                        <td className="sticky right-0 whitespace-nowrap bg-ad-surface px-3 py-2.5 text-right">
                          <div className="inline-flex gap-1.5">
                            {entity !== 'product_image' && (
                              <button type="button" onClick={() => openEdit(idVal)} className="inline-flex items-center gap-1 rounded-md border border-ad-primary/30 bg-ad-primary/10 px-2.5 py-1.5 text-xs font-semibold text-ad-primary hover:bg-ad-primary hover:text-white cursor-pointer" aria-label={`Edit record ${idVal}`}>
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setDeleteCtx({
                                ids: [String(idVal)],
                                row,
                                imageId: row.image_id || null,
                                productId: row.product_id || null
                              })}
                              className="inline-flex items-center gap-1 rounded-md border border-ad-danger/30 bg-ad-danger/10 px-2.5 py-1.5 text-xs font-semibold text-ad-danger hover:bg-ad-danger hover:text-white cursor-pointer"
                              aria-label={`Delete record ${idVal}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Order Line Items Row */}
                      {entity === 'orders' && isOrderExpanded && (
                        <tr className="border-b border-ad-border bg-ad-card/25">
                          <td colSpan={headers.length + 3} className="px-3 py-3 sm:px-6 sm:py-4">
                            <div className="rounded-xl border border-ad-border bg-ad-surface p-4 shadow-sm animate-in fade-in-50 duration-200">
                              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-ad-border">
                                <div className="flex items-center gap-2.5">
                                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ad-primary/15 text-ad-primary">
                                    <Receipt className="w-4 h-4" />
                                  </span>
                                  <div>
                                    <h4 className="text-xs font-bold text-ad-text uppercase tracking-wider flex items-center gap-2">
                                      <span>Order Line Items</span>
                                      <span className="rounded-md bg-ad-card px-2 py-0.5 font-mono text-[11px] border border-ad-border">
                                        {row.order_number ? `#${row.order_number}` : `Order #${idVal}`}
                                      </span>
                                    </h4>
                                    <p className="text-[11px] text-ad-muted mt-0.5">
                                      {orderItems.length} {orderItems.length === 1 ? 'item' : 'items'} in this order
                                      {row.customer_name ? ` · Customer: ${row.customer_name}` : ''}
                                      {row.phone ? ` (${row.phone})` : ''}
                                      {row.created_at ? ` · Placed: ${formatAdminDateOrTime(row.created_at, 'created_at')}` : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setOrderItemModal({ mode: 'ADD', orderId: idVal })}
                                    className="inline-flex items-center gap-1 rounded-lg border border-ad-primary/40 bg-ad-primary/10 px-3 py-1.5 text-xs font-semibold text-ad-primary hover:bg-ad-primary hover:text-white transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Add Order Item
                                  </button>
                                </div>
                              </div>

                              {orderItems.length === 0 ? (
                                <div className="py-6 text-center text-xs text-ad-muted">
                                  No items currently recorded for this order. Click "Add Order Item" to attach products.
                                </div>
                              ) : (
                                <div className="mt-3 overflow-x-auto">
                                  <table className="w-full text-left text-xs">
                                    <thead>
                                      <tr className="border-b border-ad-border text-[10.5px] font-bold uppercase tracking-wider text-ad-muted bg-ad-card/40">
                                        <th className="py-2.5 px-3 w-16">Item #</th>
                                        <th className="py-2.5 px-3 min-w-[260px]">Product Details & Photo</th>
                                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                                        <th className="py-2.5 px-3 text-center">Discount</th>
                                        <th className="py-2.5 px-3 text-center">Qty Ordered</th>
                                        <th className="py-2.5 px-3 text-center min-w-[190px]">Delivered Progress</th>
                                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                                        <th className="py-2.5 px-3 text-right">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-ad-border">
                                      {orderItems.map(item => {
                                        const prod = lookups.productMap?.[String(item.product_id)] || {};
                                        const prodTitle = item.product_name || prod.title || prod.product_name || lookups.products?.[item.product_id] || `Product #${item.product_id}`;
                                        const imgUrl = getProductThumbnail(item, prod);
                                        const categoryName = item.category_name || prod.category_name || lookups.categories?.[prod.category_id];
                                        const purity = item.purity || prod.purity;
                                        const weight = item.weight || prod.weight;
                                        const idealFor = item.ideal_for || prod.ideal_for;
                                        const makeType = item.make_type || prod.make_type || lookups.makes?.[prod.m_id];
                                        const packaging = prod.packaging;
                                        const lineSubtotal = Number(item.subtotal || (Number(item.unit_price || 0) * (1 - Number(item.discount_percent || 0) / 100) * Number(item.quantity || 1)));
                                        return (
                                          <tr key={item.order_item_id} className="hover:bg-ad-card/50 transition-colors">
                                            <td className="py-3 px-3 font-mono text-ad-muted align-middle">#{item.order_item_id}</td>
                                            <td className="py-3 px-3 align-middle">
                                              <div className="flex items-center gap-3">
                                                {/* Product Photo with hover-zoom & click to enlarge */}
                                                <div className="relative group shrink-0">
                                                  <img
                                                    src={imgUrl}
                                                    alt={prodTitle}
                                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-ad-border bg-ad-card object-cover shadow-2xs transition-transform group-hover:scale-105"
                                                    onError={e => { e.currentTarget.src = PLACEHOLDER_IMG; }}
                                                  />
                                                  {imgUrl && imgUrl !== PLACEHOLDER_IMG && (
                                                    <button
                                                      type="button"
                                                      onClick={() => setLightbox({ images: [imgUrl], index: 0 })}
                                                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl text-white transition-opacity cursor-pointer"
                                                      title="Click to view photo"
                                                    >
                                                      <ImageIcon className="w-4 h-4" />
                                                    </button>
                                                  )}
                                                </div>

                                                {/* Product Details & Specification Badges */}
                                                <div className="min-w-0 flex-1 space-y-1">
                                                  <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="font-bold text-[13px] text-ad-text">
                                                      {prodTitle}
                                                    </span>
                                                    <span className="rounded-md bg-ad-card px-1.5 py-0.5 text-[10px] font-mono text-ad-muted border border-ad-border">
                                                      ID: #{item.product_id}
                                                    </span>
                                                    {categoryName && (
                                                      <span className="inline-flex items-center gap-1 rounded-md bg-ad-accent/10 border border-ad-accent/25 px-1.5 py-0.5 text-[10.5px] font-semibold text-ad-accent">
                                                        <Tag className="w-2.5 h-2.5" /> {categoryName}
                                                      </span>
                                                    )}
                                                  </div>

                                                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                                    {purity && (
                                                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                        <ShieldCheck className="w-3 h-3 text-emerald-500" /> {purity}
                                                      </span>
                                                    )}
                                                    {weight && (
                                                      <span className="inline-flex items-center gap-1 rounded-md bg-ad-card border border-ad-border px-1.5 py-0.5 text-[10px] font-mono text-ad-text">
                                                        <Scale className="w-3 h-3 text-ad-muted" /> {weight}
                                                      </span>
                                                    )}
                                                    {idealFor && (
                                                      <span className="rounded-md bg-ad-card border border-ad-border px-1.5 py-0.5 text-[10px] text-ad-muted">
                                                        Ideal For: <strong className="text-ad-text font-medium">{idealFor}</strong>
                                                      </span>
                                                    )}
                                                    {makeType && (
                                                      <span className="rounded-md bg-ad-card border border-ad-border px-1.5 py-0.5 text-[10px] text-ad-muted">
                                                        Make: <strong className="text-ad-text font-medium">{makeType}</strong>
                                                      </span>
                                                    )}
                                                    {packaging && (
                                                      <span className="rounded-md bg-ad-card border border-ad-border px-1.5 py-0.5 text-[10px] text-ad-muted hidden lg:inline-flex">
                                                        📦 {packaging}
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono font-medium align-middle">₹{Number(item.unit_price || 0).toLocaleString('en-IN')}</td>
                                            <td className="py-3 px-3 text-center align-middle">
                                              {Number(item.discount_percent || 0) > 0 ? (
                                                <span className="rounded-md bg-ad-success/15 px-1.5 py-0.5 text-[10.5px] font-bold text-ad-success">
                                                  {Number(item.discount_percent)}% OFF
                                                </span>
                                              ) : (
                                                <span className="text-ad-muted">-</span>
                                              )}
                                            </td>
                                            <td className="py-3 px-3 text-center font-bold text-ad-text align-middle">{item.quantity}</td>
                                            <td className="py-3 px-3 text-center align-middle">
                                              <div className="inline-flex flex-col items-center gap-1">
                                                <div className="inline-flex items-center rounded-lg border border-ad-border bg-ad-card p-0.5 shadow-2xs">
                                                  <button
                                                    type="button"
                                                    disabled={Number(item.delivered_quantity || 0) <= 0}
                                                    onClick={() => handleUpdateDeliveredQty(idVal, item, Math.max(0, Number(item.delivered_quantity || 0) - 1))}
                                                    className="h-6 w-6 rounded flex items-center justify-center text-ad-muted hover:text-ad-text hover:bg-ad-hover disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
                                                    title="Decrease delivered quantity"
                                                  >
                                                    <Minus className="w-3 h-3" />
                                                  </button>
                                                  <span className="w-10 text-center font-mono font-bold text-xs text-ad-text">
                                                    {item.delivered_quantity || 0}
                                                  </span>
                                                  <button
                                                    type="button"
                                                    disabled={Number(item.delivered_quantity || 0) >= Number(item.quantity || 1)}
                                                    onClick={() => handleUpdateDeliveredQty(idVal, item, Math.min(Number(item.quantity || 1), Number(item.delivered_quantity || 0) + 1))}
                                                    className="h-6 w-6 rounded flex items-center justify-center text-ad-muted hover:text-ad-text hover:bg-ad-hover disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
                                                    title="Increase delivered quantity"
                                                  >
                                                    <Plus className="w-3 h-3" />
                                                  </button>
                                                </div>
                                                {Number(item.delivered_quantity || 0) >= Number(item.quantity || 1) ? (
                                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded">
                                                    <Check className="w-2.5 h-2.5" /> Fully Delivered
                                                  </span>
                                                ) : (
                                                  <button
                                                    type="button"
                                                    onClick={() => handleUpdateDeliveredQty(idVal, item, Number(item.quantity || 1))}
                                                    className="text-[10px] font-semibold text-ad-primary hover:underline cursor-pointer"
                                                    title={`Mark all ${item.quantity} as delivered`}
                                                  >
                                                    Mark All Delivered ({item.quantity})
                                                  </button>
                                                )}
                                              </div>
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono font-bold text-ad-text text-[13px] align-middle">
                                              ₹{lineSubtotal.toLocaleString('en-IN')}
                                            </td>
                                            <td className="py-3 px-3 text-right whitespace-nowrap align-middle">
                                              <div className="inline-flex gap-1">
                                                <button
                                                  type="button"
                                                  onClick={() => setOrderItemModal({ mode: 'EDIT', orderId: idVal, item })}
                                                  className="p-1.5 rounded-lg text-ad-primary hover:bg-ad-primary/15 transition-colors cursor-pointer"
                                                  title="Edit item"
                                                  aria-label={`Edit item ${item.order_item_id}`}
                                                >
                                                  <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => setDeleteOrderItemCtx(item)}
                                                  className="p-1.5 rounded-lg text-ad-danger hover:bg-ad-danger/15 transition-colors cursor-pointer"
                                                  title="Delete item"
                                                  aria-label={`Delete item ${item.order_item_id}`}
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                    <tfoot>
                                      <tr className="border-t-2 border-ad-border bg-ad-card/30 font-bold">
                                        <td colSpan={4} className="py-2 px-3 text-right text-ad-muted uppercase tracking-wider text-[11px]">
                                          Total Order Line Items:
                                        </td>
                                        <td className="py-2 px-3 text-center text-ad-text font-bold">
                                          {orderItems.reduce((acc, it) => acc + Number(it.quantity || 0), 0)} pcs
                                        </td>
                                        <td className="py-2 px-3 text-center text-ad-text font-mono text-[11px]">
                                          {orderItems.reduce((acc, it) => acc + Number(it.delivered_quantity || 0), 0)} pcs del.
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono text-ad-text text-[13px] font-bold">
                                          ₹{orderItems.reduce((acc, it) => acc + Number(it.subtotal || (Number(it.unit_price || 0) * (1 - Number(it.discount_percent || 0) / 100) * Number(it.quantity || 1))), 0).toLocaleString('en-IN')}
                                        </td>
                                        <td></td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Expandable Cart Line Items Row */}
                      {entity === 'cart' && isCartExpanded && (
                        <tr className="border-b border-ad-border bg-ad-card/25">
                          <td colSpan={headers.length + 3} className="px-3 py-3 sm:px-6 sm:py-4">
                            <div className="rounded-xl border border-ad-border bg-ad-surface p-4 shadow-sm animate-in fade-in-50 duration-200">
                              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-ad-border">
                                <div className="flex items-center gap-2.5">
                                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ad-primary/15 text-ad-primary">
                                    <ShoppingCart className="w-4 h-4" />
                                  </span>
                                  <div>
                                    <h4 className="text-xs font-bold text-ad-text uppercase tracking-wider flex items-center gap-2">
                                      <span>Cart Line Items</span>
                                      <span className="rounded-md bg-ad-card px-2 py-0.5 font-mono text-[11px] border border-ad-border">
                                        Cart #{idVal}
                                      </span>
                                    </h4>
                                    <p className="text-[11px] text-ad-muted mt-0.5">
                                      {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in this cart
                                      {row.user_id ? ` · User ID: #${row.user_id}` : ''}
                                      {row.customer_name || row.user_name ? ` · Customer: ${row.customer_name || row.user_name}` : ''}
                                      {row.guest_token ? ` · Guest: ${String(row.guest_token).substring(0, 10)}…` : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setCartItemModal({ mode: 'ADD', cartId: idVal })}
                                    className="inline-flex items-center gap-1 rounded-lg border border-ad-primary/40 bg-ad-primary/10 px-3 py-1.5 text-xs font-semibold text-ad-primary hover:bg-ad-primary hover:text-white transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Add Cart Item
                                  </button>
                                </div>
                              </div>

                              {cartItems.length === 0 ? (
                                <div className="py-6 text-center text-xs text-ad-muted">
                                  No items currently recorded in this cart. Click "Add Cart Item" to attach products.
                                </div>
                              ) : (
                                <div className="mt-3 overflow-x-auto">
                                  <table className="w-full text-left text-xs">
                                    <thead>
                                      <tr className="border-b border-ad-border text-[10.5px] font-bold uppercase tracking-wider text-ad-muted bg-ad-card/40">
                                        <th className="py-2.5 px-3 w-16">Item #</th>
                                        <th className="py-2.5 px-3 min-w-[280px]">Product Details & Photo</th>
                                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                                        <th className="py-2.5 px-3 text-center">Quantity</th>
                                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                                        <th className="py-2.5 px-3 text-right">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-ad-border">
                                      {cartItems.map(item => {
                                        const prod = lookups.productMap?.[String(item.product_id)] || {};
                                        const prodTitle = item.product_name || prod.title || prod.product_name || lookups.products?.[item.product_id] || `Product #${item.product_id}`;
                                        const imgUrl = getProductThumbnail(item, prod);
                                        const categoryName = item.category_name || prod.category_name || lookups.categories?.[prod.category_id];
                                        const purity = item.purity || prod.purity;
                                        const weight = item.weight || prod.weight;
                                        const idealFor = item.ideal_for || prod.ideal_for;
                                        const makeType = item.make_type || prod.make_type || lookups.makes?.[prod.m_id];
                                        const packaging = prod.packaging;
                                        const unitPrice = Number(item.unit_price || prod.price || 0);
                                        const lineSubtotal = Number(item.subtotal || (unitPrice * Number(item.quantity || 1)));

                                        return (
                                          <tr key={item.cart_item_id} className="hover:bg-ad-card/50 transition-colors">
                                            <td className="py-3 px-3 font-mono text-ad-muted align-middle">#{item.cart_item_id}</td>
                                            <td className="py-3 px-3 align-middle">
                                              <div className="flex items-center gap-3">
                                                {/* Product Photo with hover-zoom & click to enlarge */}
                                                <div className="relative group shrink-0">
                                                  <img
                                                    src={imgUrl}
                                                    alt={prodTitle}
                                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-ad-border bg-ad-card object-cover shadow-2xs transition-transform group-hover:scale-105"
                                                    onError={e => { e.currentTarget.src = PLACEHOLDER_IMG; }}
                                                  />
                                                  {imgUrl && imgUrl !== PLACEHOLDER_IMG && (
                                                    <button
                                                      type="button"
                                                      onClick={() => setLightbox({ images: [imgUrl], index: 0 })}
                                                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl text-white transition-opacity cursor-pointer"
                                                      title="Click to view photo"
                                                    >
                                                      <ImageIcon className="w-4 h-4" />
                                                    </button>
                                                  )}
                                                </div>

                                                {/* Product Details & Specification Badges */}
                                                <div className="min-w-0 flex-1 space-y-1">
                                                  <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="font-bold text-[13px] text-ad-text">
                                                      {prodTitle}
                                                    </span>
                                                    <span className="rounded-md bg-ad-card px-1.5 py-0.5 text-[10px] font-mono text-ad-muted border border-ad-border">
                                                      ID: #{item.product_id}
                                                    </span>
                                                    {categoryName && (
                                                      <span className="inline-flex items-center gap-1 rounded-md bg-ad-accent/10 border border-ad-accent/25 px-1.5 py-0.5 text-[10.5px] font-semibold text-ad-accent">
                                                        <Tag className="w-2.5 h-2.5" /> {categoryName}
                                                      </span>
                                                    )}
                                                  </div>

                                                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                                    {purity && (
                                                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                        <ShieldCheck className="w-3 h-3 text-emerald-500" /> {purity}
                                                      </span>
                                                    )}
                                                    {weight && (
                                                      <span className="inline-flex items-center gap-1 rounded-md bg-ad-card border border-ad-border px-1.5 py-0.5 text-[10px] font-mono text-ad-text">
                                                        <Scale className="w-3 h-3 text-ad-muted" /> {weight}
                                                      </span>
                                                    )}
                                                    {idealFor && (
                                                      <span className="rounded-md bg-ad-card border border-ad-border px-1.5 py-0.5 text-[10px] text-ad-muted">
                                                        Ideal For: <strong className="text-ad-text font-medium">{idealFor}</strong>
                                                      </span>
                                                    )}
                                                    {makeType && (
                                                      <span className="rounded-md bg-ad-card border border-ad-border px-1.5 py-0.5 text-[10px] text-ad-muted">
                                                        Make: <strong className="text-ad-text font-medium">{makeType}</strong>
                                                      </span>
                                                    )}
                                                    {packaging && (
                                                      <span className="rounded-md bg-ad-card border border-ad-border px-1.5 py-0.5 text-[10px] text-ad-muted hidden lg:inline-flex">
                                                        📦 {packaging}
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono font-medium align-middle">₹{unitPrice.toLocaleString('en-IN')}</td>
                                            <td className="py-3 px-3 text-center font-bold text-ad-text align-middle">{item.quantity}</td>
                                            <td className="py-3 px-3 text-right font-mono font-bold text-ad-text text-[13px] align-middle">
                                              ₹{lineSubtotal.toLocaleString('en-IN')}
                                            </td>
                                            <td className="py-3 px-3 text-right whitespace-nowrap align-middle">
                                              <div className="inline-flex gap-1">
                                                <button
                                                  type="button"
                                                  onClick={() => setCartItemModal({ mode: 'EDIT', cartId: idVal, item })}
                                                  className="p-1.5 rounded-lg text-ad-primary hover:bg-ad-primary/15 transition-colors cursor-pointer"
                                                  title="Edit cart item"
                                                  aria-label={`Edit cart item ${item.cart_item_id}`}
                                                >
                                                  <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => setDeleteCartItemCtx(item)}
                                                  className="p-1.5 rounded-lg text-ad-danger hover:bg-ad-danger/15 transition-colors cursor-pointer"
                                                  title="Delete cart item"
                                                  aria-label={`Delete cart item ${item.cart_item_id}`}
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                    <tfoot>
                                      <tr className="border-t-2 border-ad-border bg-ad-card/30 font-bold">
                                        <td colSpan={3} className="py-2 px-3 text-right text-ad-muted uppercase tracking-wider text-[11px]">
                                          Total Cart Items:
                                        </td>
                                        <td className="py-2 px-3 text-center text-ad-text font-bold">
                                          {cartItems.reduce((acc, it) => acc + Number(it.quantity || 0), 0)} pcs
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono text-ad-text text-[13px] font-bold">
                                          ₹{cartItems.reduce((acc, it) => {
                                            const prod = lookups.productMap?.[String(it.product_id)] || {};
                                            const up = Number(it.unit_price || prod.price || 0);
                                            return acc + Number(it.subtotal || (up * Number(it.quantity || 1)));
                                          }, 0).toLocaleString('en-IN')}
                                        </td>
                                        <td></td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {!loading && rows.length > 0 && (
        <p className="mt-3 text-xs text-ad-muted">
          {entity === 'orders' && orderStatusFilter !== 'ALL'
            ? `${displayedRows.length} of ${rows.length} records (${orderStatusFilter.toLowerCase()}) · `
            : `${rows.length} record${rows.length === 1 ? '' : 's'} · `}
          Columns are sortable{cfg.hasFormPage ? '' : ' · Edits open in a dialog'}
          {entity === 'custom_orders' && <> · <Link to="/admin/custom-orders" className="font-semibold text-ad-primary hover:underline">Open the Custom Orders board →</Link></>}
        </p>
      )}

      {recordModal && (
        <RecordModal
          entity={entity}
          mode={recordModal.mode}
          id={recordModal.id}
          rows={rows}
          lookups={lookups}
          orderItemsMap={orderItemsMap}
          onClose={() => setRecordModal(null)}
          onSaved={() => { setRecordModal(null); loadData(); if (entity === 'custom_orders') refreshPendingCustomOrders(); }}
          onOpenImages={images => setLightbox({ images, index: 0 })}
        />
      )}

      <ConfirmDeleteModal
        open={Boolean(deleteCtx)}
        busy={deleting}
        title={deleteCtx?.ids.length > 1 ? `Delete ${deleteCtx.ids.length} ${cfg.plural}` : `Delete ${cfg.singular}`}
        subtitle={deleteCtx?.ids.length > 1 ? `You are about to permanently delete ${deleteCtx.ids.length} records` : 'Confirm permanent removal from database'}
        confirmLabel={deleteCtx?.ids.length > 1 ? `Delete Selected (${deleteCtx.ids.length})` : `Delete ${cfg.singular}`}
        onClose={() => setDeleteCtx(null)}
        onConfirm={executeDelete}
        details={deleteCtx && <DeletePreview ids={deleteCtx.ids} rows={rows} pkField={pkField} lookups={lookups} />}
      />

      {lightbox && <ImageLightbox images={lightbox.images} startIndex={lightbox.index} title="Image Preview" onClose={() => setLightbox(null)} />}

      {orderItemModal && (
        <OrderItemModal
          mode={orderItemModal.mode}
          orderId={orderItemModal.orderId}
          item={orderItemModal.item}
          products={lookups.productList || []}
          onClose={() => setOrderItemModal(null)}
          onSaved={() => {
            setOrderItemModal(null);
            refreshOrderItems();
            loadData();
          }}
        />
      )}

      {cartItemModal && (
        <CartItemModal
          mode={cartItemModal.mode}
          cartId={cartItemModal.cartId}
          item={cartItemModal.item}
          products={lookups.productList || []}
          onClose={() => setCartItemModal(null)}
          onSaved={() => {
            setCartItemModal(null);
            refreshCartItems();
            loadData();
          }}
        />
      )}

      <ConfirmDeleteModal
        open={Boolean(deleteOrderItemCtx)}
        busy={deletingOrderItem}
        title="Delete Order Item"
        subtitle={`Remove line item #${deleteOrderItemCtx?.order_item_id} from Order #${deleteOrderItemCtx?.order_id}`}
        confirmLabel="Delete Item"
        onClose={() => setDeleteOrderItemCtx(null)}
        onConfirm={executeDeleteOrderItem}
        details={deleteOrderItemCtx && (
          <div className="rounded-lg border border-ad-border bg-ad-card p-3 text-xs">
            <p className="font-semibold text-ad-text">
              {deleteOrderItemCtx.product_name || `Product #${deleteOrderItemCtx.product_id}`}
            </p>
            <p className="text-ad-muted mt-1">
              Quantity: {deleteOrderItemCtx.quantity} · Unit Price: ₹{Number(deleteOrderItemCtx.unit_price || 0).toLocaleString('en-IN')}
            </p>
          </div>
        )}
      />

      <ConfirmDeleteModal
        open={Boolean(deleteCartItemCtx)}
        busy={deletingCartItem}
        title="Delete Cart Item"
        subtitle={`Remove line item #${deleteCartItemCtx?.cart_item_id} from Cart #${deleteCartItemCtx?.cart_id}`}
        confirmLabel="Delete Item"
        onClose={() => setDeleteCartItemCtx(null)}
        onConfirm={executeDeleteCartItem}
        details={deleteCartItemCtx && (
          <div className="rounded-lg border border-ad-border bg-ad-card p-3 text-xs">
            <p className="font-semibold text-ad-text">
              {deleteCartItemCtx.product_name || `Product #${deleteCartItemCtx.product_id}`}
            </p>
            <p className="text-ad-muted mt-1">
              Quantity: {deleteCartItemCtx.quantity} · Price: ₹{Number(deleteCartItemCtx.unit_price || 0).toLocaleString('en-IN')}
            </p>
          </div>
        )}
      />

      <Modal open={textPreview !== null} onClose={() => setTextPreview(null)} size="md" title="Full Description">
        <ModalBody><p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ad-text">{textPreview}</p></ModalBody>
      </Modal>

      <Modal
        open={categoryPreviewCtx !== null}
        onClose={() => setCategoryPreviewCtx(null)}
        size="md"
        title={`Linked Categories — ${categoryPreviewCtx?.festivalName || ''}`}
        subtitle={`All ${categoryPreviewCtx?.categories?.length || 0} product categories currently linked to this festival in dbo.festival_category`}
      >
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {categoryPreviewCtx?.categories?.map((cat, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border border-ad-border bg-ad-card/60 shadow-2xs hover:border-ad-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-ad-primary/10 text-ad-primary flex items-center justify-center shrink-0 border border-ad-primary/20">
                      <Tag className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-semibold text-xs text-ad-text truncate">
                      {cat.name}
                    </span>
                  </div>
                  {cat.id && (
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-ad-surface border border-ad-border text-ad-muted shrink-0">
                      ID: #{cat.id}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ModalBody>
        <div className="flex items-center justify-between border-t border-ad-border bg-ad-card/50 px-5 py-3">
          <span className="text-xs text-ad-muted">
            Total: <strong className="text-ad-text font-semibold">{categoryPreviewCtx?.categories?.length || 0}</strong> categories
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCategoryPreviewCtx(null)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const fId = categoryPreviewCtx?.festivalId;
                setCategoryPreviewCtx(null);
                if (fId) openEdit(fId);
              }}
            >
              <Pencil className="w-3.5 h-3.5" /> Manage Categories
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DeletePreview({ ids, rows, pkField, lookups }) {
  const findRow = id => rows.find(r => String(r[pkField]) === String(id)) || {};

  if (ids.length === 1) {
    const row = findRow(ids[0]);
    const meta = [];
    if (row.category_id !== undefined) meta.push(['Category', lookups.categories[row.category_id] || row.category_name || `Category #${row.category_id}`]);
    if (row.price !== undefined) meta.push(['Price', `₹${Number(row.price).toLocaleString('en-IN')}`]);
    if (row.quantity !== undefined) meta.push(['Stock', `${row.quantity} units`]);
    if (row.purity) meta.push(['Purity', row.purity]);
    if (row.weight) meta.push(['Weight', row.weight]);
    if (row.m_id !== undefined) meta.push(['Make', lookups.makes[row.m_id] || `Make #${row.m_id}`]);
    return (
      <div className="rounded-lg border border-ad-border bg-ad-card p-3.5">
        {row.image_url && (
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-ad-border">
            <img
              src={adminImageUrl(row.image_url)}
              alt=""
              className="w-14 h-14 rounded-lg object-cover border border-ad-border bg-ad-surface shrink-0"
              onError={e => { e.currentTarget.src = PLACEHOLDER_IMG; }}
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-xs text-ad-text truncate">
                {row.product_name || `Product #${row.product_id}`}
              </p>
              <p className="text-[11px] font-mono text-ad-muted mt-0.5">
                Image ID: #{row.image_id || ids[0]}
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 font-bold text-ad-text">
          <span className="min-w-0 truncate">{recordLabel(row, ids[0])}</span>
          <span className="shrink-0 rounded-md bg-ad-hover px-2 py-0.5 font-mono text-xs">#{ids[0]}</span>
        </div>
        {meta.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ad-muted">
            {meta.map(([k, v]) => <span key={k}><strong className="text-ad-text">{k}:</strong> {v}</span>)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-[13.5px] text-ad-text">You are about to delete <strong>{ids.length} records</strong> in one go:</p>
      <div className="ad-scroll max-h-56 overflow-y-auto rounded-lg border border-ad-border">
        {ids.map(id => {
          const row = findRow(id);
          const extra = row.price !== undefined ? `₹${Number(row.price).toLocaleString('en-IN')}` : (row.category_id !== undefined ? lookups.categories[row.category_id] || '' : row.type || '');
          return (
            <div key={id} className="flex items-center justify-between gap-3 border-b border-ad-border px-3 py-2 text-[13px] last:border-0">
              <span className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 rounded-md bg-ad-card px-1.5 py-0.5 font-mono text-[11px]">#{id}</span>
                <span className="truncate font-semibold text-ad-text">{recordLabel(row, id)}</span>
              </span>
              <span className="shrink-0 text-xs text-ad-muted">{extra}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Schema-driven add/edit dialog for tables without a dedicated form page. */
function RecordModal({ entity, mode, id, rows, lookups = {}, orderItemsMap = {}, onClose, onSaved, onOpenImages }) {
  const { showToast } = useAdminUI();
  const [saving, setSaving] = useState(false);
  const cfg = getEntityConfig(entity);
  const pkField = PK_MAP[entity];
  const isEdit = mode === 'EDIT';
  const rowData = isEdit ? rows.find(r => String(r[pkField]) === String(id)) || {} : {};

  // Multi-category checkbox state for festival_category or festival
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(() => {
    if (entity === 'festival_category' && rowData.category_id !== undefined && rowData.category_id !== null) {
      return [Number(rowData.category_id)];
    }
    if (entity === 'festival' && id) {
      return (lookups.festivalCategoryMap?.[String(id)] || []).map(Number);
    }
    return [];
  });
  const [categorySearch, setCategorySearch] = useState('');

  // Auto-suggest next festival ID (e.g. FEST-22) when creating a new festival
  const suggestedNextFestId = useMemo(() => {
    if (entity !== 'festival' || isEdit) return '';
    let maxNum = 0;
    for (const r of rows) {
      const match = String(r.id || '').match(/FEST-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    return `FEST-${maxNum + 1}`;
  }, [entity, isEdit, rows]);

  const toggleCategory = catId => {
    const numId = Number(catId);
    setSelectedCategoryIds(prev =>
      prev.includes(numId) ? prev.filter(x => x !== numId) : [...prev, numId]
    );
  };

  const handleSelectAllCategories = () => {
    const allIds = (lookups.categoryList || []).map(c => Number(c.category_id));
    setSelectedCategoryIds(allIds);
  };

  const handleClearAllCategories = () => {
    setSelectedCategoryIds([]);
  };

  const filteredCategories = useMemo(() => {
    const list = lookups.categoryList || [];
    if (!categorySearch.trim()) return list;
    const q = categorySearch.toLowerCase().trim();
    return list.filter(c => (c.name || '').toLowerCase().includes(q) || String(c.category_id).includes(q));
  }, [lookups.categoryList, categorySearch]);

  const schema = useMemo(() => {
    if (ENTITY_FORM_SCHEMAS[entity]) return ENTITY_FORM_SCHEMAS[entity];
    return Object.keys(rows[0] || {})
      .filter(k => k !== pkField && k !== 'created_at' && k !== 'updated_at')
      .map(k => ({ name: k, label: k.replace(/_/g, ' ').toUpperCase(), type: 'text' }));
  }, [entity, rows, pkField]);

  const inspirationImages = entity === 'custom_orders' && rowData.image ? parseImageList(rowData.image) : [];

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    const tableValues = {};
    new FormData(e.currentTarget).forEach((value, key) => {
      const trimmed = String(value).trim();
      if (trimmed === '') return;
      const keepText = ['phone', 'pincode', 'order_number', 'guest_token'].some(k => key.includes(k));
      tableValues[key] = !isNaN(trimmed) && !keepText ? Number(trimmed) : trimmed;
    });

    // Strip synthetic non-table field linked_categories before sending to database
    const selectedCatsForFestival = [...selectedCategoryIds];
    delete tableValues.linked_categories;

    // Ensure order_status strictly matches actual item fulfillment for orders
    if (entity === 'orders' && id) {
      const oItems = orderItemsMap[String(id)] || (Array.isArray(rowData?.items) ? rowData.items : []);
      if (oItems.length > 0) {
        const isDone = oItems.every(it => Number(it.delivered_quantity || 0) >= Number(it.quantity || 1));
        tableValues.order_status = isDone ? 'COMPLETED' : 'PENDING';
      }
    }

    // Special handling for festival_category multi-select
    if (entity === 'festival_category') {
      const festivalId = tableValues.festival_id;
      if (!festivalId) {
        showToast('Please select a festival.', true);
        setSaving(false);
        return;
      }
      if (selectedCategoryIds.length === 0) {
        showToast('Please select at least one category.', true);
        setSaving(false);
        return;
      }

      try {
        if (isEdit) {
          const firstCat = selectedCategoryIds[0];
          const res = await callProc(entity, 'EDIT', { festival_id: festivalId, category_id: firstCat }, String(id));
          if (!res.success) throw new Error(res.status || res.error || 'Failed to update mapping');
          if (selectedCategoryIds.length > 1) {
            const extraCats = selectedCategoryIds.slice(1);
            await Promise.all(
              extraCats.map(catId => callProc(entity, 'ADD', { festival_id: festivalId, category_id: catId }))
            );
          }
          showToast(`Festival category mapping updated successfully!`);
        } else {
          const results = await Promise.all(
            selectedCategoryIds.map(catId =>
              callProc(entity, 'ADD', { festival_id: festivalId, category_id: catId })
            )
          );
          const failed = results.filter(r => !r || !r.success);
          if (failed.length === results.length) {
            throw new Error(results[0]?.status || results[0]?.error || 'Failed to create festival category mappings');
          }
          showToast(`Successfully created ${results.length - failed.length} festival category mapping(s)!`);
        }
        onSaved();
      } catch (err) {
        showToast(err.message, true);
        setSaving(false);
      }
      return;
    }

    try {
      const res = await callProc(entity, isEdit ? 'EDIT' : 'ADD', tableValues, isEdit ? String(id) : null);
      if (!res.success) throw new Error(res.status || res.error || 'Failed to save');

      // If saving a festival, synchronize its linked categories in dbo.festival_category
      if (entity === 'festival') {
        const festId = String(isEdit ? id : (tableValues.id || ''));
        if (festId) {
          const prevCats = isEdit ? (lookups.festivalCategoryMap?.[festId] || []) : [];
          const toAdd = selectedCatsForFestival.filter(cid => !prevCats.includes(cid));
          const toRemove = prevCats.filter(cid => !selectedCatsForFestival.includes(cid));

          // Remove unlinked categories from dbo.festival_category
          if (toRemove.length > 0) {
            const rawRows = lookups.festivalCategoryRaw?.[festId] || [];
            for (const catId of toRemove) {
              const mappingRow = rawRows.find(r => Number(r.category_id) === Number(catId));
              if (mappingRow && mappingRow.id) {
                await callProc('festival_category', 'DELETE', { id: mappingRow.id }, String(mappingRow.id));
              }
            }
          }

          // Add newly linked categories to dbo.festival_category
          if (toAdd.length > 0) {
            await Promise.all(
              toAdd.map(catId =>
                callProc('festival_category', 'ADD', { festival_id: festId, category_id: Number(catId) })
              )
            );
          }
        }
      }

      showToast(`${cfg.singular} ${isEdit ? 'updated' : 'created'} successfully!`);
      onSaved();
    } catch (err) {
      showToast(err.message, true);
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? `Edit ${cfg.singular} (#${id})` : `Add New ${cfg.singular}`}
      subtitle={isEdit ? `Update ${cfg.singular.toLowerCase()} record values in dbo.${entity}` : `Insert a new ${cfg.singular.toLowerCase()} record into dbo.${entity}`}
    >
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <ModalBody>
          {inspirationImages.length > 0 && (
            <div className="mb-5 rounded-xl border border-ad-violet/25 bg-ad-violet/6 p-3.5">
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ad-violet">
                  <ImageIcon className="w-4 h-4" /> Customer Inspiration Photos ({inspirationImages.length})
                </span>
                <span className="text-[11px] text-ad-muted">Click any photo to enlarge</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {inspirationImages.map((src, i) => (
                  <button key={`${src}-${i}`} type="button" onClick={() => onOpenImages(inspirationImages.slice(i).concat(inspirationImages.slice(0, i)))} className="cursor-pointer">
                    <img src={adminImageUrl(src)} alt="" className="h-16 w-16 rounded-lg border border-ad-border object-cover transition-transform hover:scale-105" onError={e => { e.currentTarget.src = PLACEHOLDER_IMG; }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {schema.map(field => {
              const value = rowData[field.name] !== undefined && rowData[field.name] !== null
                ? rowData[field.name]
                : (field.name === 'id' && entity === 'festival' && !isEdit ? suggestedNextFestId : (field.default ?? ''));
              const fieldId = `rec-${field.name}`;
              const isFestCatPicker = (field.name === 'category_id' && entity === 'festival_category') || field.name === 'linked_categories' || field.type === 'category_multiselect';

              return (
                <Field key={field.name} label={field.label} required={field.required} fullWidth={field.fullWidth} htmlFor={fieldId}>
                  {isFestCatPicker ? (
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-ad-muted">
                            {entity === 'festival' ? 'Select product categories featured for this festival:' : 'Select categories to associate with festival:'}
                          </span>
                          <span className="rounded-full bg-ad-primary/15 px-2 py-0.5 text-[11px] font-bold text-ad-primary">
                            {selectedCategoryIds.length} selected
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSelectAllCategories}
                            className="text-xs font-semibold text-ad-primary hover:underline cursor-pointer"
                          >
                            Select All
                          </button>
                          <span className="text-ad-border">·</span>
                          <button
                            type="button"
                            onClick={handleClearAllCategories}
                            className="text-xs font-semibold text-ad-muted hover:text-ad-danger cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {(lookups.categoryList || []).length > 6 && (
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search categories..."
                            value={categorySearch}
                            onChange={e => setCategorySearch(e.target.value)}
                            className="ad-input py-1.5 pl-3 pr-8 text-xs"
                          />
                          {categorySearch && (
                            <button
                              type="button"
                              onClick={() => setCategorySearch('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ad-muted hover:text-ad-text text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      )}

                      {selectedCategoryIds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-ad-primary/5 border border-ad-primary/20 max-h-24 overflow-y-auto ad-scroll">
                          <span className="text-[11px] font-bold text-ad-primary shrink-0 mr-1">Selected:</span>
                          {selectedCategoryIds.map(catId => {
                            const catObj = (lookups.categoryList || []).find(c => Number(c.category_id) === Number(catId));
                            const name = catObj?.name || lookups.categories?.[catId] || `Category #${catId}`;
                            return (
                              <span
                                key={catId}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-ad-surface border border-ad-primary/30 text-ad-text shadow-2xs"
                              >
                                <span className="max-w-[120px] truncate">{name}</span>
                                <button
                                  type="button"
                                  onClick={() => toggleCategory(catId)}
                                  className="text-ad-muted hover:text-ad-danger ml-0.5 cursor-pointer text-[12px] leading-none"
                                  title={`Remove ${name}`}
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className="max-h-56 overflow-y-auto ad-scroll rounded-xl border border-ad-border bg-ad-card/30 p-2.5">
                        {filteredCategories.length === 0 ? (
                          <div className="p-4 text-center text-xs text-ad-muted">
                            No categories found matching "{categorySearch}"
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {filteredCategories.map(cat => {
                              const isChecked = selectedCategoryIds.includes(Number(cat.category_id));
                              return (
                                <button
                                  key={cat.category_id}
                                  type="button"
                                  onClick={() => toggleCategory(cat.category_id)}
                                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${isChecked
                                      ? 'border-ad-primary/50 bg-ad-primary/10 text-ad-text shadow-2xs ring-1 ring-ad-primary/30 font-medium'
                                      : 'border-ad-border/70 bg-ad-surface hover:bg-ad-hover hover:border-ad-border text-ad-muted hover:text-ad-text'
                                    }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isChecked
                                        ? 'bg-ad-primary border-ad-primary text-white shadow-2xs'
                                        : 'border-ad-border bg-ad-card'
                                      }`}>
                                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                    <span className="text-xs truncate text-ad-text">{cat.name}</span>
                                  </div>
                                  <span className="text-[10px] font-mono text-ad-muted shrink-0">#{cat.category_id}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : field.name === 'category_id' ? (
                    <select id={fieldId} name={field.name} className="ad-input cursor-pointer" defaultValue={String(value)} required={field.required}>
                      <option value="">-- Select Category --</option>
                      {(lookups.categoryList || []).map(cat => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.name} (ID: {cat.category_id})
                        </option>
                      ))}
                    </select>
                  ) : field.name === 'festival_id' ? (
                    <select id={fieldId} name={field.name} className="ad-input cursor-pointer" defaultValue={String(value)} required={field.required}>
                      <option value="">-- Select Festival --</option>
                      {(lookups.festivalList || []).map(fest => (
                        <option key={fest.id} value={fest.id}>
                          {fest.name || fest.shortName} ({fest.id})
                        </option>
                      ))}
                    </select>
                  ) : field.name === 'order_status' && entity === 'orders' ? (
                    <div className="space-y-1 pt-0.5">
                      {(() => {
                        const oItems = (id && orderItemsMap[String(id)]) || (Array.isArray(rowData?.items) ? rowData.items : []);
                        const totalQty = oItems.reduce((sum, it) => sum + Number(it.quantity || 0), 0);
                        const deliveredQty = oItems.reduce((sum, it) => sum + Math.min(Number(it.quantity || 0), Number(it.delivered_quantity || 0)), 0);
                        const isDone = oItems.length > 0 && deliveredQty >= totalQty;
                        const statusVal = oItems.length > 0 ? (isDone ? 'COMPLETED' : 'PENDING') : (value ? String(value).toUpperCase() : 'PENDING');
                        const isDoneStatus = statusVal === 'COMPLETED';
                        return (
                          <div>
                            <div className="rounded-xl border border-ad-border bg-ad-card/40 px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-2xs">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide border ${isDoneStatus
                                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-2xs'
                                    : 'border-amber-500/40 bg-amber-500/15 text-amber-400'
                                    }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${isDoneStatus ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                  {statusVal}
                                </span>
                                <span className="text-xs text-ad-muted">
                                  {oItems.length > 0
                                    ? `(${deliveredQty}/${totalQty} pcs delivered)`
                                    : 'Initial status'}
                                </span>
                              </div>
                              <span className="text-[11px] text-ad-muted font-medium">Automated via line items</span>
                            </div>
                            <input type="hidden" name="order_status" value={statusVal} />
                          </div>
                        );
                      })()}
                    </div>
                  ) : field.type === 'select' ? (
                    <select id={fieldId} name={field.name} className="ad-input cursor-pointer" defaultValue={String(value)} required={field.required}>
                      {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea id={fieldId} name={field.name} rows={3} className="ad-input" defaultValue={typeof value === 'object' ? JSON.stringify(value) : value} required={field.required} placeholder={field.placeholder} />
                  ) : (
                    <input
                      id={fieldId}
                      name={field.name}
                      type={field.type || 'text'}
                      step={field.step}
                      className={`ad-input ${field.name === 'id' && isEdit && entity === 'festival' ? 'opacity-70 bg-ad-card cursor-not-allowed' : ''}`}
                      defaultValue={typeof value === 'object' ? JSON.stringify(value) : value}
                      required={field.required}
                      placeholder={field.placeholder}
                      readOnly={field.readOnly || (field.name === 'id' && isEdit && entity === 'festival')}
                    />
                  )}
                </Field>
              );
            })}
          </div>
        </ModalBody>
        <div className="flex flex-col-reverse gap-2 border-t border-ad-border bg-ad-card/50 px-5 py-3.5 sm:flex-row sm:justify-end">
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving && <Spinner />} {isEdit ? `Update ${cfg.singular}` : `Create ${cfg.singular}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** In-page line-item creation/edition modal for an expanded order. */
function OrderItemModal({ mode, orderId, item, products = [], onClose, onSaved }) {
  const { showToast } = useAdminUI();
  const [saving, setSaving] = useState(false);
  const isEdit = mode === 'EDIT';

  const [selectedProductId, setSelectedProductId] = useState(() => item?.product_id || (products[0]?.product_id || ''));
  const [unitPrice, setUnitPrice] = useState(() => item?.unit_price ?? '');
  const [discountPercent, setDiscountPercent] = useState(() => item?.discount_percent ?? 0);
  const [quantity, setQuantity] = useState(() => item?.quantity ?? 1);
  const [deliveredQuantity, setDeliveredQuantity] = useState(() => item?.delivered_quantity ?? 0);

  const handleProductChange = e => {
    const pid = e.target.value;
    setSelectedProductId(pid);
    if (!isEdit) {
      const prod = products.find(p => String(p.product_id) === String(pid));
      if (prod && prod.price !== undefined) {
        setUnitPrice(prod.price);
        if (prod.discount) setDiscountPercent(prod.discount);
      }
    }
  };

  const calculatedSubtotal = useMemo(() => {
    const up = Number(unitPrice) || 0;
    const disc = Number(discountPercent) || 0;
    const qty = Number(quantity) || 1;
    return Math.max(0, up * (1 - disc / 100) * qty);
  }, [unitPrice, discountPercent, quantity]);

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    const tableValues = {
      order_id: Number(orderId),
      product_id: Number(selectedProductId),
      unit_price: Number(unitPrice),
      discount_percent: Number(discountPercent) || 0,
      quantity: Number(quantity) || 1,
      delivered_quantity: Math.max(0, Number(deliveredQuantity) || 0),
      subtotal: Number(calculatedSubtotal.toFixed(2))
    };

    try {
      const res = await callProc('order_item', isEdit ? 'EDIT' : 'ADD', tableValues, isEdit ? String(item.order_item_id) : null);
      if (!res.success) throw new Error(res.status || res.error || 'Failed to save order item');
      showToast(`Order item ${isEdit ? 'updated' : 'added'} successfully!`);
      onSaved();
    } catch (err) {
      showToast(err.message, true);
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? `Edit Order Item (#${item.order_item_id})` : `Add Item to Order #${orderId}`}
      subtitle={`Manage line item details for Order #${orderId}`}
    >
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ad-text mb-1">Product</label>
              {products.length > 0 ? (
                <select
                  value={selectedProductId}
                  onChange={handleProductChange}
                  required
                  className="ad-input w-full cursor-pointer"
                >
                  <option value="">-- Select Product --</option>
                  {products.map(p => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.title || p.name} (ID: {p.product_id}) {p.price ? `— ₹${Number(p.price).toLocaleString('en-IN')}` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  placeholder="Enter Product ID"
                  required
                  className="ad-input w-full"
                />
              )}
            </div>

            {/* Selected Product Preview Card */}
            {(() => {
              const selectedProd = products.find(p => String(p.product_id) === String(selectedProductId));
              if (!selectedProd) return null;
              const selectedImg = getProductThumbnail(null, selectedProd);
              return (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-ad-border bg-ad-card/40 animate-in fade-in-50">
                  <img
                    src={selectedImg}
                    alt={selectedProd.title || selectedProd.name}
                    className="w-12 h-12 rounded-lg object-cover border border-ad-border shrink-0 bg-ad-surface"
                    onError={e => { e.currentTarget.src = PLACEHOLDER_IMG; }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs text-ad-text truncate">
                      {selectedProd.title || selectedProd.name}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10.5px] text-ad-muted">
                      {selectedProd.category_name && <span className="text-ad-accent font-medium">{selectedProd.category_name}</span>}
                      {selectedProd.purity && <span>· {selectedProd.purity}</span>}
                      {selectedProd.weight && <span>· {selectedProd.weight}</span>}
                      {selectedProd.price && <span>· Base Price: ₹{Number(selectedProd.price).toLocaleString('en-IN')}</span>}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ad-text mb-1">Unit Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={unitPrice}
                  onChange={e => setUnitPrice(e.target.value)}
                  placeholder="e.g. 1599.00"
                  required
                  className="ad-input w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ad-text mb-1">Discount (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={e => setDiscountPercent(e.target.value)}
                  className="ad-input w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ad-text mb-1">Quantity (Ordered)</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  required
                  className="ad-input w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ad-text mb-1">Delivered Quantity (pcs)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max={quantity}
                    value={deliveredQuantity}
                    onChange={e => setDeliveredQuantity(e.target.value)}
                    className="ad-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setDeliveredQuantity(quantity)}
                    className="px-2.5 py-2 rounded-lg border border-ad-border bg-ad-card hover:bg-ad-hover text-xs font-semibold text-ad-text shrink-0 cursor-pointer"
                    title={`Mark full quantity (${quantity}) as delivered`}
                  >
                    All ({quantity})
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-ad-border bg-ad-card/40 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-ad-muted font-medium">Calculated Line Subtotal:</span>
                <span className="font-mono font-bold text-ad-primary text-sm">
                  ₹{calculatedSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="pt-2 border-t border-ad-border/60 text-[11px] flex items-start gap-1.5">
                {Number(deliveredQuantity) >= Number(quantity) ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    Item fully delivered ({deliveredQuantity}/{quantity}). When all items in this order are delivered, Order Status automatically becomes COMPLETED.
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    Delivered {deliveredQuantity} of {quantity} pcs. Order Status will remain PENDING until all items are delivered.
                  </span>
                )}
              </div>
            </div>
          </div>
        </ModalBody>
        <div className="flex flex-col-reverse gap-2 border-t border-ad-border bg-ad-card/50 px-5 py-3.5 sm:flex-row sm:justify-end">
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving && <Spinner />} {isEdit ? 'Update Item' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** In-page line-item creation/edition modal for an expanded cart. */
function CartItemModal({ mode, cartId, item, products = [], onClose, onSaved }) {
  const { showToast } = useAdminUI();
  const [saving, setSaving] = useState(false);
  const isEdit = mode === 'EDIT';

  const [selectedProductId, setSelectedProductId] = useState(() => item?.product_id || (products[0]?.product_id || ''));
  const [quantity, setQuantity] = useState(() => item?.quantity ?? 1);

  const selectedProd = useMemo(() => {
    return products.find(p => String(p.product_id) === String(selectedProductId));
  }, [products, selectedProductId]);

  const unitPrice = Number(item?.unit_price || selectedProd?.price || 0);
  const calculatedSubtotal = useMemo(() => {
    const qty = Number(quantity) || 1;
    return unitPrice * qty;
  }, [unitPrice, quantity]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selectedProductId) {
      showToast('Please select a product.', true);
      return;
    }
    setSaving(true);
    const tableValues = {
      cart_id: Number(cartId),
      product_id: Number(selectedProductId),
      quantity: Number(quantity) || 1
    };

    try {
      const res = await callProc('cart_item', isEdit ? 'EDIT' : 'ADD', tableValues, isEdit ? String(item.cart_item_id) : null);
      if (!res.success) throw new Error(res.status || res.error || 'Failed to save cart item');
      showToast(`Cart item ${isEdit ? 'updated' : 'added'} successfully!`);
      onSaved();
    } catch (err) {
      showToast(err.message, true);
      setSaving(false);
    }
  };

  const selectedImg = selectedProd ? getProductThumbnail(null, selectedProd) : null;

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? `Edit Cart Item (#${item.cart_item_id})` : `Add Item to Cart #${cartId}`}
      subtitle={`Manage line item details for Cart #${cartId}`}
    >
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ad-text mb-1">Product</label>
              {products.length > 0 ? (
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  required
                  className="ad-input w-full cursor-pointer"
                >
                  <option value="">-- Select Product --</option>
                  {products.map(p => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.title || p.name} (ID: {p.product_id}) {p.price ? `— ₹${Number(p.price).toLocaleString('en-IN')}` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  placeholder="Enter Product ID"
                  required
                  className="ad-input w-full"
                />
              )}
            </div>

            {/* Selected Product Preview Card */}
            {selectedProd && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-ad-border bg-ad-card/40 animate-in fade-in-50">
                <img
                  src={selectedImg}
                  alt={selectedProd.title || selectedProd.name}
                  className="w-12 h-12 rounded-lg object-cover border border-ad-border shrink-0 bg-ad-surface"
                  onError={e => { e.currentTarget.src = PLACEHOLDER_IMG; }}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs text-ad-text truncate">
                    {selectedProd.title || selectedProd.name}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10.5px] text-ad-muted">
                    {selectedProd.category_name && <span className="text-ad-accent font-medium">{selectedProd.category_name}</span>}
                    {selectedProd.purity && <span>· {selectedProd.purity}</span>}
                    {selectedProd.weight && <span>· {selectedProd.weight}</span>}
                    {selectedProd.price && <span>· Price: ₹{Number(selectedProd.price).toLocaleString('en-IN')}</span>}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ad-text mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  required
                  className="ad-input w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ad-text mb-1">Calculated Line Subtotal</label>
                <div className="ad-input w-full bg-ad-card font-mono font-bold text-ad-primary flex items-center">
                  ₹{calculatedSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <div className="flex flex-col-reverse gap-2 border-t border-ad-border bg-ad-card/50 px-5 py-3.5 sm:flex-row sm:justify-end">
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving && <Spinner />} {isEdit ? 'Update Cart Item' : 'Add Cart Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


