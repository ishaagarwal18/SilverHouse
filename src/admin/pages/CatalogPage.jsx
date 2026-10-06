import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CircleCheck, CircleX, Crown, Filter, Flame, Hammer, IndianRupee, Layers, LayoutGrid, Package, Pencil, Plus,
  RotateCcw, Scale, BadgeCheck, Search, Sparkles, SquareCheck, Table2, Trash2, TrendingDown, TrendingUp,
  TriangleAlert, OctagonAlert, X, ChartLine
} from 'lucide-react';
import { adminImageUrl, callProc, fetchRows, formatINR, PLACEHOLDER_IMG, productImage } from '../api/adminApi';
import { useAdminUI } from '../context/AdminUIContext';
import ProductForm from '../components/ProductForm';
import { Button, Card, ConfirmDeleteModal, EmptyState, LoadingBlock, Modal, ModalBody, PageHeader, PillGroup } from '../components/ui';

const PRICE_MAX = 100000;
const PRICE_STEP = 500;
const DEFAULT_FILTERS = {
  search: '',
  stock: '',
  audience: '',
  category: '',
  make: '',
  color: '',
  purity: '',
  minPrice: 0,
  maxPrice: PRICE_MAX,
  sort: 'priority_desc'
};

const SORT_OPTIONS = [
  { value: 'priority_desc', label: '👑 Priority (Highest First)' },
  { value: 'sold_desc', label: '🔥 Top Sellers (Highest Sold)' },
  { value: 'stock_asc', label: '⚠️ Restock Urgency (Lowest Stock First)' },
  { value: 'margin_desc', label: '💰 Highest Gross Margin (₹)' },
  { value: 'price_desc', label: '💎 Price: High to Low' },
  { value: 'price_asc', label: '🏷️ Price: Low to High' },
  { value: 'id_desc', label: '✨ Newest Added (ID Desc)' }
];

const FINISH_FILTERS = [
  { id: '', label: 'All Finishes' },
  { id: 'Silver', label: 'Fine Silver' },
  { id: 'Rose Gold', label: 'Rose Gold Plated' },
  { id: 'Oxidised', label: 'Bold Oxidised' }
];

const PURITY_FILTERS = [
  { id: '', label: 'All Purities' },
  { id: '92.5', label: '92.5 Sterling Silver' },
  { id: '99.9', label: '99.9 Pure Silver' }
];

/** Derived financials for one product row. */
function productMetrics(p) {
  const mrp = Number(p.price) || 0;
  const discount = Number(p.discount) || 0;
  const finalPrice = p.final_price !== undefined && p.final_price !== null ? Number(p.final_price) : mrp - (mrp * discount / 100);
  const actualCost = Number(p.actual_cost) || 0;
  const labourCost = Number(p.labour_cost) || 0;
  const margin = finalPrice - actualCost - labourCost;
  return {
    name: p.product_name || p.title || `Product #${p.product_id}`,
    mrp,
    discount,
    finalPrice,
    actualCost,
    labourCost,
    margin,
    marginPct: finalPrice > 0 ? Math.round((margin / finalPrice) * 100) : 0,
    stock: Number(p.quantity) || 0,
    priority: p.priority ?? 10,
    sold: Number(p.sold) || 0,
    image: adminImageUrl(productImage(p))
  };
}

function stockStatus(stock) {
  if (stock === 0) return { label: 'Out of Stock', icon: CircleX, cls: 'bg-ad-danger text-white' };
  if (stock <= 5) return { label: `Low Stock (${stock})`, icon: TriangleAlert, cls: 'bg-ad-warning text-slate-900' };
  return { label: `${stock} In Stock`, icon: CircleCheck, cls: 'bg-ad-success text-white' };
}

const onImgError = e => { e.currentTarget.src = PLACEHOLDER_IMG; };

/** Route: /admin/catalog — executive inventory with filters, KPIs, inline stock control and bulk delete. */
export default function CatalogPage() {
  const { showToast } = useAdminUI();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [makes, setMakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [view, setView] = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [productModal, setProductModal] = useState(null); // { product?: row }
  const [deleteIds, setDeleteIds] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await callProc('product', 'SELECT');
      if (!res.success) throw new Error(res.status || res.error);
      setProducts(res.data || []);
      setLoadError('');
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchRows('category'), fetchRows('make_master')])
      .then(([cats, mks]) => { setCategories(cats); setMakes(mks); })
      .catch(err => showToast('Failed to initialise catalog data: ' + err.message, true));
    fetchProducts();
  }, [fetchProducts, showToast]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const list = products.filter(p => {
      const m = productMetrics(p);
      const matchesSearch = !q
        || String(p.product_id).includes(q)
        || [p.product_name, p.title, p.description, p.category_name].some(v => v && String(v).toLowerCase().includes(q));
      const matchesStock = !filters.stock
        || (filters.stock === 'in_stock' && m.stock > 0)
        || (filters.stock === 'low_stock' && m.stock > 0 && m.stock <= 5)
        || (filters.stock === 'out_of_stock' && m.stock === 0);
      return matchesSearch && matchesStock
        && (!filters.audience || String(p.ideal_for || '').toLowerCase() === filters.audience.toLowerCase())
        && (!filters.category || String(p.category_id) === filters.category)
        && (!filters.make || String(p.make_id || p.m_id) === filters.make)
        && (!filters.color || String(p.color || 'Silver').toLowerCase() === filters.color.toLowerCase())
        && (!filters.purity || String(p.purity || '').includes(filters.purity))
        && m.finalPrice >= filters.minPrice && m.finalPrice <= filters.maxPrice;
    });

    const byPrice = p => productMetrics(p).finalPrice;
    const sorters = {
      priority_desc: (a, b) => (Number(b.priority) || 0) - (Number(a.priority) || 0) || b.product_id - a.product_id,
      sold_desc: (a, b) => (Number(b.sold) || 0) - (Number(a.sold) || 0),
      stock_asc: (a, b) => (Number(a.quantity) || 0) - (Number(b.quantity) || 0),
      margin_desc: (a, b) => productMetrics(b).margin - productMetrics(a).margin,
      price_desc: (a, b) => byPrice(b) - byPrice(a),
      price_asc: (a, b) => byPrice(a) - byPrice(b),
      id_desc: (a, b) => b.product_id - a.product_id
    };
    return list.sort(sorters[filters.sort] || sorters.id_desc);
  }, [products, filters]);

  const kpis = useMemo(() => {
    let units = 0;
    let retail = 0;
    let cost = 0;
    let alerts = 0;
    products.forEach(p => {
      const qty = Number(p.quantity) || 0;
      const price = Number(p.final_price !== undefined ? p.final_price : p.price) || 0;
      units += qty;
      retail += price * qty;
      cost += (Number(p.actual_cost) || 0) * qty;
      if (qty <= 5) alerts++;
    });
    return { units, retail, cost, alerts };
  }, [products]);

  // ---------- Stock ----------
  const updateStock = async (productId, newQty) => {
    const qty = Math.max(0, newQty);
    try {
      const res = await callProc('product', 'EDIT', { quantity: qty }, String(productId));
      if (!res.success) throw new Error(res.status || res.error || 'Failed to update stock');
      setProducts(list => list.map(p => (p.product_id === productId ? { ...p, quantity: qty } : p)));
      showToast(`Stock updated to ${qty} units for Product #${productId}`);
    } catch (err) {
      showToast('Failed to update stock: ' + err.message, true);
    }
  };

  // ---------- Selection ----------
  const allInView = filtered.length > 0 && filtered.every(p => selected.has(p.product_id));
  const toggleSelect = (id, checked) => setSelected(prev => {
    const next = new Set(prev);
    if (checked) next.add(id); else next.delete(id);
    return next;
  });
  const toggleAllInView = () => setSelected(prev => {
    const next = new Set(prev);
    filtered.forEach(p => (allInView ? next.delete(p.product_id) : next.add(p.product_id)));
    return next;
  });

  const executeDelete = async () => {
    setDeleting(true);
    let ok = 0;
    let failed = 0;
    let lastError = '';
    for (const id of deleteIds) {
      try {
        const res = await callProc('product', 'DELETE', undefined, String(id));
        if (!res.success) throw new Error(res.status || res.error || 'Deletion failed');
        ok++;
      } catch (err) {
        failed++;
        lastError = err.message;
      }
    }
    setSelected(prev => {
      const next = new Set(prev);
      deleteIds.forEach(id => next.delete(id));
      return next;
    });
    setDeleting(false);
    setDeleteIds(null);
    if (ok > 0) showToast(`Successfully deleted ${ok} product${ok > 1 ? 's' : ''}`);
    if (failed > 0) showToast(`Failed to delete ${failed} product(s): ${lastError}`, true);
    fetchProducts();
  };

  const activeFilterCount = Object.keys(DEFAULT_FILTERS).filter(k => k !== 'sort' && filters[k] !== DEFAULT_FILTERS[k]).length;
  const deleteTarget = deleteIds?.length === 1 ? products.find(p => p.product_id === deleteIds[0]) : null;

  return (
    <div>
      <PageHeader
        title="Product Catalog"
        icon={LayoutGrid}
        description={loading ? 'Live inventory sync & metrics' : `Displaying ${filtered.length} of ${products.length} items`}
        actions={
          <>
            <Button className="lg:hidden" onClick={() => setFiltersOpen(true)}>
              <Filter className="w-4 h-4" /> Filters
              {activeFilterCount > 0 && <span className="rounded-full bg-ad-primary px-1.5 text-[10.5px] font-bold text-white">{activeFilterCount}</span>}
            </Button>
            <div className="inline-flex rounded-lg border border-ad-border bg-ad-card p-1" role="group" aria-label="View mode">
              {[['grid', LayoutGrid, 'Cards view'], ['table', Table2, 'Table view']].map(([v, Icon, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`rounded-md p-1.5 cursor-pointer ${view === v ? 'bg-ad-surface text-ad-primary shadow-sm' : 'text-ad-muted hover:text-ad-text'}`}
                  title={label}
                  aria-label={label}
                  aria-pressed={view === v}
                >
                  <Icon className="w-4.5 h-4.5" />
                </button>
              ))}
            </div>
            <Button variant="primary" onClick={() => setProductModal({})}>
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </>
        }
      />

      {/* KPI strip */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <Kpi icon={Package} label="Active Products" value={products.length} />
        <Kpi icon={Layers} label="Total Stock Units" value={`${kpis.units.toLocaleString('en-IN')} pcs`} />
        <Kpi icon={IndianRupee} label="Inventory Retail Value" value={formatINR(Math.round(kpis.retail))} tone="text-ad-accent" />
        <Kpi icon={ChartLine} label="Inventory Cost Value" value={formatINR(Math.round(kpis.cost))} tone="text-ad-success" />
        <Kpi icon={OctagonAlert} label="Stock Alerts" value={`${kpis.alerts} items`} tone="text-ad-danger" valueTone="text-ad-danger" />
      </div>

      {selected.size > 0 && (
        <div className="sticky top-18 z-20 mb-4 flex flex-col gap-3 rounded-xl border border-ad-primary/30 bg-ad-surface p-3 shadow-lg md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-xs text-ad-muted">
            <span className="rounded-full bg-ad-primary px-3 py-1 font-bold text-white">{selected.size} Selected</span>
            <span className="hidden sm:inline">Select items to run bulk operations</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={toggleAllInView}><SquareCheck className="w-4 h-4" /> {allInView ? 'Deselect All In View' : 'Select All In View'}</Button>
            <Button size="sm" variant="danger" onClick={() => setDeleteIds(Array.from(selected))}><Trash2 className="w-4 h-4" /> Delete Selected</Button>
            <Button size="sm" onClick={() => setSelected(new Set())}><X className="w-4 h-4" /> Clear</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[272px_minmax(0,1fr)]">
        {/* Filters: docked panel on desktop, slide-in drawer on mobile */}
        <div className={`fixed inset-0 z-60 bg-black/50 lg:hidden ${filtersOpen ? '' : 'hidden'}`} onClick={() => setFiltersOpen(false)} aria-hidden="true" />
        <aside
          className={`fixed inset-y-0 right-0 z-70 w-80 max-w-[88vw] transition-transform duration-300 lg:static lg:z-auto lg:w-auto lg:max-w-none lg:translate-x-0 ${filtersOpen ? 'translate-x-0' : 'translate-x-full'}`}
          aria-label="Catalog filters"
        >
          <Card className="ad-scroll flex h-full flex-col overflow-y-auto rounded-none lg:sticky lg:top-22 lg:h-auto lg:max-h-[calc(100vh-7rem)] lg:rounded-xl">
            <CatalogFilters
              filters={filters}
              setFilters={setFilters}
              products={products}
              categories={categories}
              makes={makes}
              onClose={() => setFiltersOpen(false)}
            />
          </Card>
        </aside>

        <section className="min-w-0">
          {loading ? (
            <Card><LoadingBlock label="Loading inventory…" /></Card>
          ) : loadError ? (
            <Card><EmptyState icon={OctagonAlert} title="Failed to Load Inventory" description={loadError} /></Card>
          ) : filtered.length === 0 ? (
            <Card>
              <EmptyState icon={Search} title="No Inventory Records Found" description="No products match the selected criteria. Try resetting or broadening your filters.">
                <Button onClick={() => setFilters(DEFAULT_FILTERS)}><RotateCcw className="w-4 h-4" /> Reset Filters</Button>
              </EmptyState>
            </Card>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {filtered.map(p => (
                <ProductCard
                  key={p.product_id}
                  product={p}
                  selected={selected.has(p.product_id)}
                  onSelect={checked => toggleSelect(p.product_id, checked)}
                  onStock={qty => updateStock(p.product_id, qty)}
                  onEdit={() => setProductModal({ product: p })}
                  onDelete={() => setDeleteIds([p.product_id])}
                />
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="ad-scroll overflow-x-auto">
                <table className="w-full min-w-[1080px] border-collapse text-left text-[13px]">
                  <thead className="bg-ad-card text-[11px] font-bold uppercase tracking-wide text-ad-muted">
                    <tr>
                      <th className="w-10 px-3 py-3"><input type="checkbox" checked={allInView} onChange={toggleAllInView} aria-label="Select all in view" /></th>
                      <th className="px-3 py-3">Image</th>
                      <th className="px-3 py-3">Product Details</th>
                      <th className="px-3 py-3">Category & Craft</th>
                      <th className="px-3 py-3">Purity / Weight</th>
                      <th className="px-3 py-3">Cost & Labour</th>
                      <th className="px-3 py-3">Selling Price</th>
                      <th className="px-3 py-3">Gross Margin</th>
                      <th className="px-3 py-3">Stock Units</th>
                      <th className="px-3 py-3">Priority</th>
                      <th className="px-3 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => {
                      const m = productMetrics(p);
                      return (
                        <tr key={p.product_id} className={`border-t border-ad-border hover:bg-ad-card/60 ${selected.has(p.product_id) ? 'bg-ad-primary/5' : ''}`}>
                          <td className="px-3 py-2.5"><input type="checkbox" checked={selected.has(p.product_id)} onChange={e => toggleSelect(p.product_id, e.target.checked)} aria-label={`Select ${m.name}`} /></td>
                          <td className="px-3 py-2.5"><img src={m.image} alt={m.name} className="h-11 w-11 rounded-lg border border-ad-border object-cover" onError={onImgError} /></td>
                          <td className="px-3 py-2.5">
                            <div className="font-bold text-ad-text">{m.name}</div>
                            <div className="mt-0.5 text-[11px] text-ad-muted">ID: #{p.product_id} • {p.ideal_for || 'Unisex'} • {p.color || 'Silver'}</div>
                          </td>
                          <td className="px-3 py-2.5"><div className="font-semibold">{p.category_name || 'Silver'}</div><div className="text-[11px] text-ad-muted">{p.make_type || 'Handcrafted'}</div></td>
                          <td className="px-3 py-2.5"><div>{p.purity || '92.5'}</div><div className="text-[11px] text-ad-muted">{p.weight || '-'}</div></td>
                          <td className="px-3 py-2.5"><div>{formatINR(m.actualCost)}</div><div className="text-[11px] text-ad-muted">+{formatINR(m.labourCost)} labour</div></td>
                          <td className="px-3 py-2.5">
                            <div className="text-sm font-extrabold text-ad-primary">{formatINR(Math.round(m.finalPrice))}</div>
                            {m.discount > 0 && <div className="text-[11px] text-ad-danger">{m.discount}% OFF ({formatINR(m.mrp)})</div>}
                          </td>
                          <td className="px-3 py-2.5"><div className={`font-bold ${m.margin < 0 ? 'text-ad-danger' : 'text-ad-success'}`}>{formatINR(Math.round(m.margin))}</div><div className="text-[11px] text-ad-muted">{m.marginPct}% Margin</div></td>
                          <td className="px-3 py-2.5"><StockStepper value={m.stock} onChange={q => updateStock(p.product_id, q)} /></td>
                          <td className="px-3 py-2.5"><span className="rounded-md bg-ad-card px-2 py-0.5 font-mono text-xs">#{m.priority}</span></td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-right">
                            <button type="button" onClick={() => setProductModal({ product: p })} className="rounded-md border border-ad-primary/30 bg-ad-primary/10 p-2 text-ad-primary hover:bg-ad-primary hover:text-white cursor-pointer" aria-label={`Edit ${m.name}`}><Pencil className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => setDeleteIds([p.product_id])} className="ml-1.5 rounded-md border border-ad-danger/30 bg-ad-danger/10 p-2 text-ad-danger hover:bg-ad-danger hover:text-white cursor-pointer" aria-label={`Delete ${m.name}`}><Trash2 className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </section>
      </div>

      <Modal
        open={Boolean(productModal)}
        onClose={() => setProductModal(null)}
        title={productModal?.product ? `Edit Product Details (ID: #${productModal.product.product_id})` : 'Add New Catalog Product'}
        icon={productModal?.product ? <Pencil className="w-5 h-5 text-ad-primary" /> : <Plus className="w-5 h-5 text-ad-primary" />}
      >
        <ModalBody className="pb-0">
          {productModal && (
            <ProductForm
              key={productModal.product?.product_id || 'new'}
              inModal
              productId={productModal.product?.product_id || null}
              initialRow={productModal.product}
              categories={categories}
              makes={makes}
              onCancel={() => setProductModal(null)}
              onSaved={() => { setProductModal(null); fetchProducts(); }}
            />
          )}
        </ModalBody>
      </Modal>

      <ConfirmDeleteModal
        open={Boolean(deleteIds)}
        busy={deleting}
        title={deleteIds?.length > 1 ? `Bulk Delete ${deleteIds.length} Products` : 'Confirm Product Deletion'}
        subtitle={deleteIds?.length > 1 ? 'This removes every selected product and its stock records' : 'This will remove all warehouse stock and images'}
        confirmLabel={deleteIds?.length > 1 ? `Delete ${deleteIds.length} Products` : 'Delete Permanently'}
        onClose={() => setDeleteIds(null)}
        onConfirm={executeDelete}
        details={deleteIds && (deleteTarget ? <DeleteProductPreview product={deleteTarget} /> : (
          <div className="rounded-lg border border-ad-border bg-ad-card p-3.5 text-[13px]">
            <div className="font-bold text-ad-text">{deleteIds.length} Selected Products</div>
            <div className="mt-1 text-xs text-ad-muted">IDs: {deleteIds.slice(0, 8).join(', ')}{deleteIds.length > 8 ? '…' : ''}</div>
          </div>
        ))}
      />
    </div>
  );
}

function Kpi({ icon: Icon, label, value, tone = 'text-ad-primary', valueTone = 'text-ad-text' }) {
  return (
    <Card className="flex items-center gap-3 p-3.5 sm:p-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ad-card ${tone}`}><Icon className="w-5 h-5" /></span>
      <span className="min-w-0">
        <span className="block text-[10.5px] font-bold uppercase leading-tight tracking-wide text-ad-muted">{label}</span>
        <span className={`block truncate text-base font-extrabold sm:text-lg ${valueTone}`}>{value}</span>
      </span>
    </Card>
  );
}

/** −/+ stepper with an editable quantity; commits on blur / Enter. */
function StockStepper({ value, onChange }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const qty = Math.max(0, parseInt(draft, 10) || 0);
    // Show the saved value until the parent confirms the update (reverts automatically on failure)
    setDraft(String(value));
    if (qty !== value) onChange(qty);
  };
  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-ad-border bg-ad-surface">
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 0} className="px-2.5 py-1 text-base font-bold text-ad-text hover:bg-ad-card disabled:opacity-40 cursor-pointer" aria-label="Decrease stock">−</button>
      <input
        type="number"
        min="0"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
        className="w-14 border-x border-ad-border bg-transparent py-1 text-center text-[13px] font-bold text-ad-text outline-none"
        aria-label="Stock quantity"
      />
      <button type="button" onClick={() => onChange(value + 1)} className="px-2.5 py-1 text-base font-bold text-ad-text hover:bg-ad-card cursor-pointer" aria-label="Increase stock">+</button>
    </div>
  );
}

function ProductCard({ product: p, selected, onSelect, onStock, onEdit, onDelete }) {
  const m = productMetrics(p);
  const status = stockStatus(m.stock);
  const StatusIcon = status.icon;

  return (
    <Card className={`flex flex-col overflow-hidden transition-shadow hover:shadow-md ${selected ? 'ring-2 ring-ad-primary' : ''}`}>
      <div className="relative aspect-4/3 bg-ad-card">
        <img src={m.image} alt={m.name} loading="lazy" className="h-full w-full object-cover" onError={onImgError} />
        <label className="absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-ad-surface/90 shadow cursor-pointer" title="Select for bulk action">
          <input type="checkbox" checked={selected} onChange={e => onSelect(e.target.checked)} aria-label={`Select ${m.name}`} />
        </label>
        <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[10.5px] font-bold text-amber-300"><Crown className="w-3 h-3" /> Priority #{m.priority}</span>
        <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[10.5px] font-semibold text-white"><Hammer className="w-3 h-3" /> {p.make_type || 'Handcrafted'}</span>
        <span className={`absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${status.cls}`}><StatusIcon className="w-3 h-3" /> {status.label}</span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2 text-[10.5px] font-bold uppercase tracking-wide text-ad-muted">
          <span className="truncate">{(p.category_name || 'Silver Jewelry')} • {(p.ideal_for || 'Unisex')}</span>
          <span className="shrink-0 rounded-md bg-ad-card px-1.5 py-0.5 font-mono normal-case">ID #{p.product_id}</span>
        </div>
        <div>
          <h3 className="line-clamp-1 text-[15px] font-bold text-ad-text" title={m.name}>{m.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-ad-muted">{p.description || 'Authentic handcrafted fine sterling silver luxury item.'}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[[BadgeCheck, p.purity || '92.5 Sterling'], [Scale, p.weight || '-'], [Sparkles, p.color || 'Silver'], [Flame, `${m.sold} Sold`]].map(([Icon, text]) => (
            <span key={text} className="inline-flex items-center gap-1 rounded-md border border-ad-border bg-ad-card px-2 py-0.5 text-[11px] font-semibold text-ad-muted"><Icon className="w-3 h-3" /> {text}</span>
          ))}
        </div>

        <div className="rounded-lg border border-ad-border bg-ad-card/60 p-3 text-xs">
          <div className="flex justify-between gap-2"><span className="text-ad-muted">Mfg Cost:</span><span className="font-semibold text-ad-text">{formatINR(m.actualCost)} <span className="text-[10px] text-ad-muted">(+{formatINR(m.labourCost)} labour)</span></span></div>
          <div className="mt-1 flex justify-between gap-2">
            <span className="text-ad-muted">Gross Margin:</span>
            <span className={`inline-flex items-center gap-1 font-bold ${m.margin < 0 ? 'text-ad-danger' : 'text-ad-success'}`}>
              {m.margin >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {formatINR(Math.round(m.margin))} ({m.marginPct}%)
            </span>
          </div>
          <div className="mt-2 flex items-end justify-between gap-2 border-t border-ad-border pt-2">
            <div>
              <span className="text-lg font-extrabold text-ad-text">{formatINR(Math.round(m.finalPrice))}</span>
              {m.discount > 0 && <span className="ml-1.5 text-xs text-ad-muted line-through">{formatINR(m.mrp)}</span>}
            </div>
            {m.discount > 0 && <span className="rounded bg-ad-danger/12 px-1.5 py-0.5 text-[11px] font-extrabold text-ad-danger">{m.discount}% OFF</span>}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-ad-muted"><Package className="w-3.5 h-3.5" /> Warehouse Qty</span>
          <StockStepper value={m.stock} onChange={onStock} />
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <Button size="sm" onClick={onEdit} className="border-ad-primary/30! bg-ad-primary/10! text-ad-primary! hover:bg-ad-primary! hover:text-white!"><Pencil className="w-3.5 h-3.5" /> Edit</Button>
          <Button size="sm" onClick={onDelete} className="border-ad-danger/30! bg-ad-danger/10! text-ad-danger! hover:bg-ad-danger! hover:text-white!"><Trash2 className="w-3.5 h-3.5" /> Delete</Button>
        </div>
      </div>
    </Card>
  );
}

function DeleteProductPreview({ product: p }) {
  const m = productMetrics(p);
  return (
    <div className="flex items-center gap-3 rounded-lg border border-ad-border bg-ad-card p-3">
      <img src={m.image} alt={m.name} className="h-14 w-14 shrink-0 rounded-lg object-cover" onError={onImgError} />
      <div className="min-w-0">
        <div className="truncate text-[13px] font-bold text-ad-text">{m.name}</div>
        <div className="mt-0.5 flex flex-wrap gap-x-2 text-[11.5px] text-ad-muted">
          <span className="font-mono">ID #{p.product_id}</span>
          <span>{p.category_name || 'Silver Item'}</span>
          <span className="font-bold">{m.stock} In Stock</span>
        </div>
        <div className="mt-0.5 text-xs font-extrabold text-ad-primary">{formatINR(Math.round(m.finalPrice))}</div>
      </div>
    </div>
  );
}

function RadioList({ name, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-0.5">
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <label key={opt.value || 'all'} className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[13px] cursor-pointer ${active ? 'bg-ad-primary/10 font-semibold text-ad-primary' : 'text-ad-text hover:bg-ad-card'}`}>
            <span className="flex min-w-0 items-center gap-2">
              <input type="radio" name={name} checked={active} onChange={() => onChange(opt.value)} className="accent-(--ad-primary)" />
              <span className="truncate">{opt.label}</span>
            </span>
            {opt.count !== undefined && <span className="shrink-0 rounded-full bg-ad-card px-2 text-[11px] font-bold text-ad-muted">{opt.count}</span>}
          </label>
        );
      })}
    </div>
  );
}

function FilterSection({ title, children, aside }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wide text-ad-muted">
        <span>{title}</span>
        {aside}
      </div>
      {children}
    </div>
  );
}

function CatalogFilters({ filters, setFilters, products, categories, makes, onClose }) {
  const set = (key, value) => setFilters(f => ({ ...f, [key]: value }));

  const categoryOptions = [
    { value: '', label: 'All Categories', count: products.length },
    ...categories.map(c => ({
      value: String(c.category_id),
      label: c.name,
      count: products.filter(p => p.category_id === c.category_id || p.category_name === c.name).length
    }))
  ];
  const makeOptions = [
    { value: '', label: 'All Crafts / Makes' },
    ...makes.map(m => ({
      value: String(m.m_id),
      label: m.type,
      count: products.filter(p => p.make_id === m.m_id || p.m_id === m.m_id || p.make_type === m.type).length
    }))
  ];
  const finishOptions = FINISH_FILTERS.map(f => ({
    value: f.id,
    label: f.label,
    count: f.id ? products.filter(p => String(p.color || 'Silver').toLowerCase() === f.id.toLowerCase()).length : products.length
  }));
  const purityOptions = PURITY_FILTERS.map(g => ({
    value: g.id,
    label: g.label,
    count: g.id ? products.filter(p => String(p.purity || '').includes(g.id)).length : products.length
  }));

  const minPct = (filters.minPrice / PRICE_MAX) * 100;
  const maxPct = (filters.maxPrice / PRICE_MAX) * 100;

  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-bold text-ad-text"><Filter className="w-4 h-4 text-ad-primary" /> Search & Filters</span>
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-ad-muted hover:bg-ad-card hover:text-ad-text lg:hidden cursor-pointer" aria-label="Close filters"><X className="w-5 h-5" /></button>
      </div>

      <FilterSection title="Keyword / Product ID">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-ad-muted" />
          <input className="ad-input pl-9!" value={filters.search} onChange={e => set('search', e.target.value)} placeholder="Search by name, ID, finish..." aria-label="Search products" />
        </div>
      </FilterSection>

      <FilterSection title="Stock Status">
        <PillGroup value={filters.stock} onChange={v => set('stock', v)} options={[
          { value: '', label: 'All' }, { value: 'in_stock', label: 'In Stock' }, { value: 'low_stock', label: 'Low (<5)' }, { value: 'out_of_stock', label: 'Out' }
        ]} />
      </FilterSection>

      <FilterSection title="Target Audience">
        <PillGroup value={filters.audience} onChange={v => set('audience', v)} options={['', 'Women', 'Men', 'Unisex', 'Puja'].map(v => ({ value: v, label: v || 'All' }))} />
      </FilterSection>

      <FilterSection title="Category"><RadioList name="cat_filter" options={categoryOptions} value={filters.category} onChange={v => set('category', v)} /></FilterSection>
      <FilterSection title="Craft / Make Master"><RadioList name="make_filter" options={makeOptions} value={filters.make} onChange={v => set('make', v)} /></FilterSection>
      <FilterSection title="Signature Finish"><RadioList name="color_filter" options={finishOptions} value={filters.color} onChange={v => set('color', v)} /></FilterSection>
      <FilterSection title="Silver Purity"><RadioList name="purity_filter" options={purityOptions} value={filters.purity} onChange={v => set('purity', v)} /></FilterSection>

      <FilterSection title="Price Range" aside={<span className="normal-case text-ad-primary">{formatINR(filters.minPrice)} – {formatINR(filters.maxPrice)}</span>}>
        <div className="relative h-6">
          <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ad-hover" />
          <div className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ad-primary" style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
          <input type="range" className="ad-range" min="0" max={PRICE_MAX} step={PRICE_STEP} value={filters.minPrice} aria-label="Minimum price"
            onChange={e => set('minPrice', Math.min(Number(e.target.value), filters.maxPrice - PRICE_STEP))} />
          <input type="range" className="ad-range" min="0" max={PRICE_MAX} step={PRICE_STEP} value={filters.maxPrice} aria-label="Maximum price"
            onChange={e => set('maxPrice', Math.max(Number(e.target.value), filters.minPrice + PRICE_STEP))} />
        </div>
        <div className="flex justify-between text-[10.5px] text-ad-muted"><span>₹0</span><span>₹50,000</span><span>₹1,00,000</span></div>
      </FilterSection>

      <FilterSection title="Sort Order">
        <select className="ad-input" value={filters.sort} onChange={e => set('sort', e.target.value)} aria-label="Sort products">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </FilterSection>

      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => setFilters(DEFAULT_FILTERS)}><RotateCcw className="w-4 h-4" /> Reset</Button>
        <Button variant="primary" className="flex-1 lg:hidden" onClick={onClose}>Show results</Button>
      </div>
    </div>
  );
}
