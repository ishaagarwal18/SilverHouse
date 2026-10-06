import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Image as ImageIcon, Pencil, Plus, Sparkles, Tag, Trash2, Upload, Zap } from 'lucide-react';
import { adminFetch, adminImageUrl, callProc, fetchRows, PLACEHOLDER_IMG } from '../api/adminApi';
import { ENTITY_FORM_SCHEMAS, getEntityConfig, IMPORTABLE_ENTITIES, ORDER_DECISIONS, PK_MAP } from '../config/entities';
import { useAdminUI } from '../context/AdminUIContext';
import { importRecordsFromFile } from '../lib/importRecords';
import {
  Button, Card, ConfirmDeleteModal, DecisionBadge, EmptyState, Field, ImageLightbox, LoadingBlock,
  Modal, ModalBody, PageHeader, PaymentBadge, Spinner
} from '../components/ui';

const HIDDEN_ORDER_COLUMNS = ['confirm', 'custom_category', 'is_custom', 'image', 'description'];
const VARCHAR_COLUMNS = [
  'name', 'title', 'product_name', 'category_name', 'category', 'description', 'purity', 'weight', 'image_url', 'url',
  'images', 'image', 'confirm', 'custom_category', 'is_custom', 'role', 'email', 'full_name', 'phone', 'address_line1',
  'address_line2', 'city', 'state', 'postal_code', 'country', 'order_number', 'payment_status', 'password_hash',
  'password', 'remark', 'status', 'created_at', 'updated_at'
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

const recordLabel = (row, id) => row.title || row.name || row.slug || row.type || `Record #${id}`;

/** Route: /admin/data/:entity — generic table manager for every database table. */
export default function DataManagerPage() {
  const { entity } = useParams();
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
  const [deleteCtx, setDeleteCtx] = useState(null); // { ids: [], imageId? }
  const [deleting, setDeleting] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { images, index }
  const [textPreview, setTextPreview] = useState(null);
  const [importMode, setImportMode] = useState('RESTOCK');
  const [importing, setImporting] = useState(false);
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
      const [data, cats, makes] = await Promise.all([
        fetchRows(entity),
        fetchRows('category'),
        fetchRows('make_master')
      ]);
      setRows(data);
      setLookups({
        categories: Object.fromEntries(cats.map(c => [c.category_id, c.name])),
        makes: Object.fromEntries(makes.map(m => [m.m_id, m.type]))
      });
    } catch (err) {
      showToast('Failed to load table: ' + err.message, true);
    } finally {
      setLoading(false);
    }
  }, [entity, showToast]);

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
    return entity === 'orders' ? keys.filter(h => !HIDDEN_ORDER_COLUMNS.includes(h)) : keys;
  }, [rows, entity]);

  const numericCols = useMemo(() => new Set(headers.filter(h => isNumericCol(h, rows))), [headers, rows]);

  const sortedRows = useMemo(() => {
    if (!sort.col || !sort.dir || !numericCols.has(sort.col)) return rows;
    const toNum = v => (v === null || v === undefined || v === '-' || v === '' ? 0 : Number(v));
    return [...rows].sort((a, b) => (sort.dir === 'asc' ? 1 : -1) * (toNum(a[sort.col]) - toNum(b[sort.col])));
  }, [rows, sort, numericCols]);

  const handleSort = col => {
    if (!numericCols.has(col)) return;
    setSort(prev => {
      if (prev.col !== col) return { col, dir: 'asc' };
      if (prev.dir === 'asc') return { col, dir: 'desc' };
      return { col: null, dir: null };
    });
  };

  // ---------- Selection ----------
  const allSelected = rows.length > 0 && rows.every(r => selected.has(String(r[pkField])));
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll = checked => setSelected(checked ? new Set(rows.map(r => String(r[pkField]))) : new Set());
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
      const tableValues = entity === 'product_image' && deleteCtx.imageId ? { product_id: id, image_id: deleteCtx.imageId } : undefined;
      try {
        const res = await callProc(entity, 'DELETE', tableValues, String(id));
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
    if (failed > 0) showToast(`Failed to delete ${failed} record(s): ${lastError || 'Unknown error'}`, true);
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
    if (/amount|payable|price|subtotal/.test(h) && val !== '-' && !isNaN(Number(val))) {
      return <span className="font-mono font-semibold">₹{Number(val).toLocaleString('en-IN')}</span>;
    }
    if (h === 'items' && Array.isArray(raw)) {
      return <span className="font-semibold cursor-help" title={raw.map(i => `${i.product_name || i.name} (${i.quantity}x)`).join(', ')}>{raw.length} item(s)</span>;
    }
    if (entity === 'product' && h === 'category_id' && rows[0]?.category_name === undefined && val !== '-') {
      return lookups.categories[val] || val;
    }
    if (entity === 'product' && h === 'm_id' && val !== '-') return lookups.makes[val] || val;
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const columnTitle = h => {
    if (entity === 'product') {
      if (h === 'category_id') return rows[0]?.category_name !== undefined ? 'Category ID' : 'Category Name';
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

      <Card className="overflow-hidden">
        {loading ? (
          <LoadingBlock label={`Loading ${cfg.plural.toLowerCase()}…`} />
        ) : rows.length === 0 ? (
          <EmptyState title={`No ${cfg.plural.toLowerCase()} yet`} description={`No records present in dbo.${entity}. Click "Add ${cfg.singular}" to create one.`} />
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
                  {headers.map(h => {
                    const sortable = numericCols.has(h);
                    const active = sort.col === h;
                    const SortIcon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
                    return (
                      <th key={h} className="whitespace-nowrap border-b border-ad-border px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-ad-muted">
                        {sortable ? (
                          <button type="button" onClick={() => handleSort(h)} className={`inline-flex items-center gap-1 uppercase cursor-pointer hover:text-ad-text ${active ? 'text-ad-primary' : ''}`}>
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
                {sortedRows.map((row, rowIdx) => {
                  const idVal = row[pkField];
                  const action = highlightMap[idVal] || highlightMap[String(idVal)];
                  const hl = HIGHLIGHT_STYLES[action];
                  const isFirstHighlight = hl && !firstHighlightAssigned;
                  if (isFirstHighlight) firstHighlightAssigned = true;
                  const checked = selected.has(String(idVal));
                  return (
                    <tr
                      key={`${idVal}-${rowIdx}`}
                      ref={isFirstHighlight ? highlightedRowRef : undefined}
                      className={`border-b border-ad-border last:border-0 hover:bg-ad-card/60 ${hl ? 'ad-row-flash' : ''} ${checked ? 'bg-ad-primary/5' : ''}`}
                      style={hl ? { '--ad-flash': hl.color, boxShadow: `inset 3px 0 0 ${hl.color}` } : undefined}
                    >
                      <td className="px-3 py-2.5">
                        <input type="checkbox" checked={checked} onChange={e => toggleOne(idVal, e.target.checked)} aria-label={`Select record ${idVal}`} />
                      </td>
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
                          <button type="button" onClick={() => openEdit(idVal)} className="inline-flex items-center gap-1 rounded-md border border-ad-primary/30 bg-ad-primary/10 px-2.5 py-1.5 text-xs font-semibold text-ad-primary hover:bg-ad-primary hover:text-white cursor-pointer" aria-label={`Edit record ${idVal}`}>
                            <Pencil className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button type="button" onClick={() => setDeleteCtx({ ids: [String(idVal)], imageId: row.image_id || null })} className="inline-flex items-center gap-1 rounded-md border border-ad-danger/30 bg-ad-danger/10 px-2.5 py-1.5 text-xs font-semibold text-ad-danger hover:bg-ad-danger hover:text-white cursor-pointer" aria-label={`Delete record ${idVal}`}>
                            <Trash2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {!loading && rows.length > 0 && (
        <p className="mt-3 text-xs text-ad-muted">
          {rows.length} record{rows.length === 1 ? '' : 's'} · Numeric columns are sortable{cfg.hasFormPage ? '' : ' · Edits open in a dialog'}
          {entity === 'custom_orders' && <> · <Link to="/admin/custom-orders" className="font-semibold text-ad-primary hover:underline">Open the Custom Orders board →</Link></>}
        </p>
      )}

      {recordModal && (
        <RecordModal
          entity={entity}
          mode={recordModal.mode}
          id={recordModal.id}
          rows={rows}
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

      <Modal open={textPreview !== null} onClose={() => setTextPreview(null)} size="md" title="Full Description">
        <ModalBody><p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ad-text">{textPreview}</p></ModalBody>
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
function RecordModal({ entity, mode, id, rows, onClose, onSaved, onOpenImages }) {
  const { showToast } = useAdminUI();
  const [saving, setSaving] = useState(false);
  const cfg = getEntityConfig(entity);
  const pkField = PK_MAP[entity];
  const isEdit = mode === 'EDIT';
  const rowData = isEdit ? rows.find(r => String(r[pkField]) === String(id)) || {} : {};

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

    try {
      const res = await callProc(entity, isEdit ? 'EDIT' : 'ADD', tableValues, isEdit ? String(id) : null);
      if (!res.success) throw new Error(res.status || res.error || 'Failed to save');
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
              const value = rowData[field.name] !== undefined && rowData[field.name] !== null ? rowData[field.name] : (field.default ?? '');
              const fieldId = `rec-${field.name}`;
              return (
                <Field key={field.name} label={field.label} required={field.required} fullWidth={field.fullWidth} htmlFor={fieldId}>
                  {field.type === 'select' ? (
                    <select id={fieldId} name={field.name} className="ad-input" defaultValue={String(value)} required={field.required}>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea id={fieldId} name={field.name} rows={3} className="ad-input" defaultValue={typeof value === 'object' ? JSON.stringify(value) : value} required={field.required} placeholder={field.placeholder} />
                  ) : (
                    <input id={fieldId} name={field.name} type={field.type || 'text'} step={field.step} className="ad-input" defaultValue={typeof value === 'object' ? JSON.stringify(value) : value} required={field.required} placeholder={field.placeholder} />
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
