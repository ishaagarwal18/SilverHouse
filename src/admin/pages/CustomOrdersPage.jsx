import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Church, CircleCheck, CircleX, Clock, Compass, Crown, Gem, HandHeart, Images, List, Mail, MessageCircle,
  Paintbrush, Phone, Receipt, RefreshCw, Search, Send, Sparkles, User
} from 'lucide-react';
import { adminFetch, adminImageUrl, PLACEHOLDER_IMG } from '../api/adminApi';
import { ORDER_DECISIONS } from '../config/entities';
import { useAdminUI } from '../context/AdminUIContext';
import { Button, Card, DecisionBadge, EmptyState, ImageLightbox, LoadingBlock, PageHeader, PillGroup, Spinner } from '../components/ui';

const CATEGORY_FILTERS = [
  { value: '', label: 'All Categories', icon: Gem },
  { value: 'Yatra Lockets', label: 'Yatra Lockets & Shrines', icon: Compass },
  { value: 'Mukhut', label: 'Mukhut', icon: Crown },
  { value: 'Jhalar', label: 'Jhalar', icon: Sparkles },
  { value: 'Thakurji ka saman', label: 'Thakurji ka saman', icon: HandHeart },
  { value: 'Temple things', label: 'Temple Things', icon: Church }
];

const DECISION_LABELS = { processing: '⏳ Processing', accepted: '✅ Approved', rejected: '❌ Rejected' };

function categoryIcon(category) {
  const c = String(category || '').toLowerCase();
  if (c.includes('yatra')) return Compass;
  return CATEGORY_FILTERS.find(f => f.value && f.value.toLowerCase() === c)?.icon || Gem;
}

/** Route: /admin/custom-orders — review bespoke requests, set quotations and notify customers. */
export default function CustomOrdersPage() {
  const { showToast, refreshPendingCustomOrders } = useAdminUI();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [lightbox, setLightbox] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminFetch('/admin/custom-orders');
      if (data.success && Array.isArray(data.orders)) setOrders(data.orders);
      else showToast(data.error || 'Failed to fetch custom orders', true);
    } catch (err) {
      console.error('Error fetching custom orders:', err);
      showToast('Network error while fetching custom orders', true);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const counts = useMemo(() => ({
    all: orders.length,
    ...Object.fromEntries(ORDER_DECISIONS.map(s => [s, orders.filter(o => o.confirm === s).length]))
  }), [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(o => {
      if (status !== 'all' && o.confirm !== status) return false;
      if (category && o.custom_category !== category) return false;
      if (!q) return true;
      return [o.customer_name, o.customer_phone, o.order_number, o.custom_category, o.description]
        .some(v => String(v || '').toLowerCase().includes(q));
    });
  }, [orders, status, category, query]);

  const handleSaved = (orderId, confirm, finalPayable) => {
    setOrders(list => list.map(o => (o.order_id === orderId ? { ...o, confirm, final_payable: finalPayable } : o)));
    refreshPendingCustomOrders();
  };

  return (
    <div>
      <PageHeader
        title="Custom & Bespoke Orders"
        icon={Paintbrush}
        description="Unified management for Yatra Lockets, Mukhut, Jhalar, Thakurji ka Saman & Temple Things"
        actions={<Button onClick={fetchOrders} disabled={loading}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</Button>}
      />

      <Card className="mb-5 flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <PillGroup
            size="md"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'All Orders', icon: List, count: counts.all },
              { value: 'processing', label: 'Processing', icon: Clock, count: counts.processing },
              { value: 'accepted', label: 'Accepted', icon: CircleCheck, count: counts.accepted },
              { value: 'rejected', label: 'Rejected', icon: CircleX, count: counts.rejected }
            ]}
          />
          <div className="relative w-full xl:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-ad-muted" />
            <input className="ad-input pl-9!" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by customer, phone, order #..." aria-label="Search custom orders" />
          </div>
        </div>
        <div className="-mx-4 overflow-x-auto px-4 pb-1">
          <div className="flex w-max gap-1.5">
            {CATEGORY_FILTERS.map(c => (
              <button
                key={c.value || 'all'}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer ${category === c.value ? 'border-ad-accent bg-ad-accent/12 text-ad-accent' : 'border-ad-border text-ad-muted hover:text-ad-text'}`}
              >
                <c.icon className="w-3.5 h-3.5" /> {c.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {loading && orders.length === 0 ? (
        <Card><LoadingBlock label="Loading custom orders…" /></Card>
      ) : filtered.length === 0 ? (
        <Card><EmptyState title="No Custom Orders Found" description="No orders match the selected filters or search keyword." /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map(o => (
            <OrderCard key={`${o.order_id}-${o.confirm}-${o.final_payable}`} order={o} onSaved={handleSaved} onOpenImage={(images, index) => setLightbox({ images, index })} />
          ))}
        </div>
      )}

      {lightbox && <ImageLightbox images={lightbox.images} startIndex={lightbox.index} title="Customer Inspiration" onClose={() => setLightbox(null)} />}
    </div>
  );
}

function OrderCard({ order: o, onSaved, onOpenImage }) {
  const { showToast } = useAdminUI();
  const [price, setPrice] = useState(String(o.final_payable || 0));
  const [decision, setDecision] = useState(o.confirm || 'processing');
  const [saving, setSaving] = useState(false);
  const images = Array.isArray(o.images) ? o.images.filter(Boolean) : [];
  const CategoryIcon = categoryIcon(o.custom_category);
  const phoneDigits = String(o.customer_phone || '').replace(/[^0-9]/g, '');
  const dateStr = o.created_at
    ? new Date(o.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Recently';

  const save = async () => {
    const newPrice = parseFloat(price) || 0;
    if (!ORDER_DECISIONS.includes(decision)) {
      showToast("Status must be 'processing', 'rejected', or 'accepted'", true);
      return;
    }
    setSaving(true);
    try {
      const { data } = await adminFetch(`/admin/custom-orders/${o.order_id}`, {
        method: 'PUT',
        body: { confirm: decision, final_payable: newPrice }
      });
      if (data.success) {
        showToast(`Order #${o.order_id} marked as '${decision}' with price ₹${newPrice}. Customer notified!`);
        onSaved(o.order_id, decision, newPrice);
      } else {
        showToast(data.error || 'Failed to update order', true);
      }
    } catch (err) {
      console.error('Update error:', err);
      showToast('Failed to connect to server', true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="flex flex-col gap-3.5 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-ad-text"><Receipt className="w-4 h-4 shrink-0 text-ad-primary" /> <span className="truncate">{o.order_number}</span></div>
          <div className="mt-0.5 text-xs text-ad-muted">{dateStr}</div>
        </div>
        <DecisionBadge status={o.confirm} />
      </div>

      <span className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-ad-accent/25 bg-ad-accent/10 px-2.5 py-1 text-xs font-bold text-ad-accent">
        <CategoryIcon className="w-3.5 h-3.5" /> {o.custom_category || 'Artisanal Silver'}
      </span>

      <div className="flex flex-col gap-1.5 rounded-lg border border-ad-border bg-ad-card/60 p-3 text-[13px]">
        <div className="flex items-center gap-2"><User className="w-4 h-4 shrink-0 text-ad-muted" /> <strong className="truncate text-ad-text">{o.customer_name || 'Anonymous Customer'}</strong></div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 shrink-0 text-ad-muted" />
          <span className="truncate">{o.customer_phone || 'N/A'}</span>
          {phoneDigits && (
            <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer" className="ml-auto inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-500 hover:underline">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          )}
        </div>
        {o.customer_email && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 shrink-0 text-ad-muted" />
            <a href={`mailto:${o.customer_email}`} className="truncate text-ad-primary hover:underline">{o.customer_email}</a>
          </div>
        )}
      </div>

      <p className="ad-scroll max-h-28 overflow-y-auto whitespace-pre-wrap rounded-lg border-l-3 border-ad-primary/40 bg-ad-card/40 px-3 py-2 text-[13px] leading-relaxed text-ad-text">
        {o.description || 'No detailed instructions provided.'}
      </p>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ad-muted"><Images className="w-4 h-4" /> Customer Inspiration Images ({images.length})</div>
        {images.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button key={`${img}-${i}`} type="button" onClick={() => onOpenImage(images, i)} className="shrink-0 cursor-pointer">
                <img src={adminImageUrl(img)} alt={`Inspiration ${i + 1}`} className="h-16 w-16 rounded-lg border border-ad-border object-cover transition-transform hover:scale-105" onError={e => { e.currentTarget.src = PLACEHOLDER_IMG; }} />
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs italic text-ad-muted">No inspiration photos uploaded</span>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t border-ad-border pt-3.5 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-ad-muted">
          Quoted Price (₹)
          <input type="number" step="100" min="0" className="ad-input" value={price} onChange={e => setPrice(e.target.value)} placeholder="₹ Quotation" title="Price displayed to customer upon approval" />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-ad-muted">
          Decision
          <select className="ad-input" value={decision} onChange={e => setDecision(e.target.value)}>
            {ORDER_DECISIONS.map(s => <option key={s} value={s}>{DECISION_LABELS[s]}</option>)}
          </select>
        </label>
        <Button variant="primary" onClick={save} disabled={saving} title="Save decision, quotation & notify customer">
          {saving ? <Spinner /> : <Send className="w-4 h-4" />} {saving ? 'Saving…' : 'Save & Notify'}
        </Button>
      </div>
    </Card>
  );
}
