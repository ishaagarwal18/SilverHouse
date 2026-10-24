import React, { useMemo, useState } from 'react';
import {
  AlertTriangle, Check, CheckCircle2, ChevronRight, Download, FileSpreadsheet,
  Filter, Layers, Package, SlidersHorizontal, Sparkles, X
} from 'lucide-react';
import { Button, Modal, ModalBody, Spinner } from './ui';
import { formatINR } from '../api/adminApi';

export default function ProductExportModal({
  open,
  onClose,
  products = [],
  filtered = [],
  selectedIds = new Set(),
  categories = [],
  makes = [],
  filters = {},
  effectiveMaxPrice = 100000,
  onExport,
  exporting = false
}) {
  const [scope, setScope] = useState(() => (selectedIds.size > 0 ? 'selected' : 'filtered'));
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeReorderSheet, setIncludeReorderSheet] = useState(true);

  // Compute restock count (<5 units)
  const restockCount = useMemo(() => {
    return products.filter(p => Number(p.quantity ?? 0) < 5).length;
  }, [products]);

  // Compute active filters description
  const activeFilters = useMemo(() => {
    const list = [];
    if (filters.search) list.push({ label: 'Search', value: `"${filters.search}"` });
    if (filters.stock) {
      const stockLabels = { in_stock: 'In Stock', low_stock: 'Low Stock (<5)', out_of_stock: 'Out of Stock' };
      list.push({ label: 'Stock', value: stockLabels[filters.stock] || filters.stock });
    }
    if (filters.category) {
      const cat = categories.find(c => String(c.category_id) === String(filters.category));
      list.push({ label: 'Category', value: cat?.name || `ID #${filters.category}` });
    }
    if (filters.make) {
      const mk = makes.find(m => String(m.m_id) === String(filters.make));
      list.push({ label: 'Craft', value: mk?.type || `ID #${filters.make}` });
    }
    if (filters.audience) list.push({ label: 'Audience', value: filters.audience });
    if (filters.color) list.push({ label: 'Finish', value: filters.color });
    if (filters.purity) list.push({ label: 'Purity', value: filters.purity });
    if (filters.minPrice > 0 || (filters.maxPrice && filters.maxPrice < effectiveMaxPrice)) {
      list.push({ label: 'Price', value: `${formatINR(filters.minPrice)} – ${formatINR(filters.maxPrice || effectiveMaxPrice)}` });
    }
    return list;
  }, [filters, categories, makes, effectiveMaxPrice]);

  // Preview metrics based on selected scope
  const targetProducts = useMemo(() => {
    if (scope === 'selected') return products.filter(p => selectedIds.has(p.product_id));
    if (scope === 'all') return products;
    if (scope === 'restock') return products.filter(p => Number(p.quantity ?? 0) < 5);
    return filtered;
  }, [scope, products, filtered, selectedIds]);

  const targetMetrics = useMemo(() => {
    let units = 0;
    let cost = 0;
    let retail = 0;
    targetProducts.forEach(p => {
      const q = Number(p.quantity ?? 0);
      const c = Number(p.actual_cost ?? 0);
      const mrp = Number(p.price ?? 0);
      const disc = Number(p.discount ?? 0);
      const finalPrice = p.final_price !== undefined && p.final_price !== null
        ? Number(p.final_price)
        : Math.round(mrp - (mrp * disc / 100));

      units += q;
      cost += Math.round(c * q);
      retail += Math.round(finalPrice * q);
    });
    return { count: targetProducts.length, units, cost, retail };
  }, [targetProducts]);

  const handleDownload = () => {
    onExport?.(scope, {
      includeSummary,
      includeReorderSheet
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export Products to Excel (.xlsx)"
      icon={<FileSpreadsheet className="w-5 h-5 text-emerald-600" />}
    >
      <ModalBody className="flex flex-col gap-5 p-4 sm:p-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ad-muted mb-2">
            1. Select Export Scope
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Filtered View */}
            <div
              onClick={() => setScope('filtered')}
              className={`rounded-xl border p-3.5 cursor-pointer transition-all ${
                scope === 'filtered'
                  ? 'border-emerald-600 bg-emerald-500/10 shadow-xs'
                  : 'border-ad-border bg-ad-card hover:bg-ad-hover'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-bold text-ad-text">
                  <Filter className={`w-4 h-4 ${scope === 'filtered' ? 'text-emerald-600' : 'text-ad-muted'}`} />
                  Filtered View
                </span>
                <span className="rounded-full bg-ad-surface border border-ad-border px-2 py-0.5 text-xs font-extrabold text-ad-text">
                  {filtered.length} items
                </span>
              </div>
              <p className="mt-1 text-xs text-ad-muted">
                {activeFilters.length > 0
                  ? 'Matches current filter criteria applied on screen.'
                  : 'All currently visible products.'}
              </p>
              {activeFilters.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {activeFilters.slice(0, 4).map((f, i) => (
                    <span key={i} className="rounded bg-ad-surface border border-ad-border/80 px-1.5 py-0.5 text-[10.5px] text-ad-muted">
                      <strong className="text-ad-text">{f.label}:</strong> {f.value}
                    </span>
                  ))}
                  {activeFilters.length > 4 && (
                    <span className="rounded bg-ad-surface px-1 text-[10px] text-ad-muted">
                      +{activeFilters.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Complete Catalog */}
            <div
              onClick={() => setScope('all')}
              className={`rounded-xl border p-3.5 cursor-pointer transition-all ${
                scope === 'all'
                  ? 'border-emerald-600 bg-emerald-500/10 shadow-xs'
                  : 'border-ad-border bg-ad-card hover:bg-ad-hover'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-bold text-ad-text">
                  <Package className={`w-4 h-4 ${scope === 'all' ? 'text-emerald-600' : 'text-ad-muted'}`} />
                  Complete Catalog
                </span>
                <span className="rounded-full bg-ad-surface border border-ad-border px-2 py-0.5 text-xs font-extrabold text-ad-text">
                  {products.length} items
                </span>
              </div>
              <p className="mt-1 text-xs text-ad-muted">
                Master inventory export containing all active products regardless of filters.
              </p>
            </div>

            {/* Restock & Low Stock Only */}
            <div
              onClick={() => setScope('restock')}
              className={`rounded-xl border p-3.5 cursor-pointer transition-all ${
                scope === 'restock'
                  ? 'border-emerald-600 bg-emerald-500/10 shadow-xs'
                  : 'border-ad-border bg-ad-card hover:bg-ad-hover'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-bold text-amber-500">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Restock Urgency List
                </span>
                <span className="rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-xs font-extrabold">
                  {restockCount} items
                </span>
              </div>
              <p className="mt-1 text-xs text-ad-muted">
                Pre-filtered for Out of Stock and Low Stock (&lt;5 units) for quick vendor procurement.
              </p>
            </div>

            {/* Selected Products */}
            <div
              onClick={() => { if (selectedIds.size > 0) setScope('selected'); }}
              className={`rounded-xl border p-3.5 transition-all ${
                selectedIds.size === 0
                  ? 'opacity-40 cursor-not-allowed border-ad-border bg-ad-card/40'
                  : scope === 'selected'
                    ? 'border-emerald-600 bg-emerald-500/10 shadow-xs cursor-pointer'
                    : 'border-ad-border bg-ad-card hover:bg-ad-hover cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-bold text-ad-text">
                  <CheckCircle2 className={`w-4 h-4 ${scope === 'selected' ? 'text-emerald-600' : 'text-ad-muted'}`} />
                  Selected Products
                </span>
                <span className="rounded-full bg-ad-surface border border-ad-border px-2 py-0.5 text-xs font-extrabold text-ad-text">
                  {selectedIds.size} items
                </span>
              </div>
              <p className="mt-1 text-xs text-ad-muted">
                {selectedIds.size > 0
                  ? 'Export only the products currently checked in the table or cards.'
                  : 'Select checkboxes in the table to enable exporting specific items.'}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Workbook Content Options */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ad-muted mb-2">
            2. Included Sheets & Reports
          </label>
          <div className="space-y-2 rounded-xl border border-ad-border bg-ad-card p-3">
            <label className="flex items-center gap-2.5 text-xs font-medium text-ad-text cursor-pointer">
              <input
                type="checkbox"
                checked={true}
                disabled
                className="rounded border-ad-border text-emerald-600"
              />
              <span>
                <strong>Sheet 1: Product Inventory (2-Row Headers)</strong> — Row 1 has DB Column Names (for automated re-importing in any column order); Row 2 has Admin Friendly Display Labels.
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-medium text-ad-text cursor-pointer">
              <input
                type="checkbox"
                checked={includeSummary}
                onChange={e => setIncludeSummary(e.target.checked)}
                className="rounded border-ad-border text-emerald-600"
              />
              <span>
                <strong>Sheet 2: Category & Financial Summary</strong> — Breakdown of units, inventory cost, retail value, and profit margins aggregated by category.
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-medium text-ad-text cursor-pointer">
              <input
                type="checkbox"
                checked={includeReorderSheet}
                onChange={e => setIncludeReorderSheet(e.target.checked)}
                className="rounded border-ad-border text-emerald-600"
              />
              <span>
                <strong>Sheet 3: Stock Reorder Sheet</strong> — Dedicated procurement worksheet listing low stock items with suggested reorder quantities.
              </span>
            </label>

            <div className="flex items-center gap-2.5 text-xs text-ad-muted pl-6">
              <span>
                <strong>Sheet 4: Filter Audit Trail</strong> — Detailed record of applied filters, timestamp, and metadata.
              </span>
            </div>
          </div>
        </div>

        {/* 3. Live Export Preview Box */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-ad-text flex items-center gap-1.5 text-[13px]">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Ready to Generate Excel File
            </div>
            <div className="mt-0.5 text-ad-muted">
              Exporting <strong className="text-ad-text">{targetMetrics.count}</strong> products ({targetMetrics.units.toLocaleString('en-IN')} total stock pieces)
            </div>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-[10.5px] uppercase tracking-wide text-ad-muted">Cost Value</div>
              <div className="font-bold text-ad-text">{formatINR(targetMetrics.cost)}</div>
            </div>
            <div>
              <div className="text-[10.5px] uppercase tracking-wide text-ad-muted">Retail Value</div>
              <div className="font-extrabold text-emerald-600">{formatINR(targetMetrics.retail)}</div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-ad-border">
          <Button variant="secondary" onClick={onClose} disabled={exporting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDownload}
            disabled={exporting || targetMetrics.count === 0}
            className="!bg-emerald-600 hover:!bg-emerald-700 !text-white font-medium shadow-sm transition-all flex items-center gap-1.5"
          >
            {exporting ? (
              <>
                <Spinner className="w-4 h-4" /> Generating Excel…
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download Excel ({targetMetrics.count} Items)
              </>
            )}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
}
