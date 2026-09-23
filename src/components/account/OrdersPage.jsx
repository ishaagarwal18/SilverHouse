import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postApiData, fetchCustomerCustomOrdersApi, payCustomOrderApi } from '../../services/api';
import { 
  Package, ArrowLeft, ArrowRight, Clock, MapPin, CheckCircle2, 
  AlertCircle, ShieldCheck, Sparkles, ExternalLink, RefreshCw, ShoppingBag,
  Crown, X, Eye, Check, ChevronRight, MessageSquare
} from 'lucide-react';

export default function OrdersPage({ onTriggerToast }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'custom' ? 'CUSTOM' : 'ALL');
  const [readyOrders, setReadyOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const loadAllOrders = async () => {
    setRefreshing(true);
    try {
      // 1. Fetch Ready Orders from DB via SP_orders
      let backendReady = [];
      try {
        const payload = {
          proc_name: 'orders',
          opr: 'SELECT'
        };
        if (user?.userId) {
          payload.condition = String(user.userId);
          payload.table_values = { user_id: user.userId };
        }
        const res = await postApiData(payload);
        if (res && res.data && Array.isArray(res.data)) {
          backendReady = res.data.filter(o => !o.is_custom);
        }
      } catch (err) {
        console.warn('[OrdersPage] Backend fetch notice:', err.message);
      }

      // 2. Read local cached orders
      let localOrders = [];
      try {
        const raw = localStorage.getItem('silverhouse_orders');
        if (raw) {
          localOrders = JSON.parse(raw);
          if (!Array.isArray(localOrders)) localOrders = [];
        }
      } catch (e) {
        localOrders = [];
      }

      // Merge local cache for ready orders
      const orderMap = new Map();
      backendReady.forEach(o => {
        const key = o.order_number || String(o.order_id);
        orderMap.set(key, {
          ...o,
          order_id: o.order_id,
          order_number: o.order_number || `SH-${o.order_id}`,
          final_payable: Number(o.final_payable || o.total_amount || 0),
          total_amount: Number(o.total_amount || 0),
          discount_amount: Number(o.discount_amount || 0),
          payment_status: o.payment_status || 'PAID',
          created_at: o.created_at || new Date().toISOString(),
          delivery_address: o.delivery_address || (o.city ? `${o.recipient_name || ''}, ${o.city} - ${o.pincode || ''}` : 'Delivered to Registered Address'),
          items: Array.isArray(o.items) ? o.items : []
        });
      });

      localOrders.forEach(lo => {
        const key = lo.order_number || String(lo.order_id);
        if (orderMap.has(key)) {
          const existing = orderMap.get(key);
          orderMap.set(key, {
            ...existing,
            ...lo,
            items: (lo.items && lo.items.length > 0) ? lo.items : existing.items
          });
        } else {
          if (!user?.userId || !lo.user_id || lo.user_id === user.userId) {
            orderMap.set(key, lo);
          }
        }
      });

      const mergedReady = Array.from(orderMap.values()).sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setReadyOrders(mergedReady);

      // 3. Fetch Bespoke Custom Orders
      try {
        const customRes = await fetchCustomerCustomOrdersApi({
          userId: user?.userId,
          phone: user?.phone
        });
        if (customRes && customRes.success && Array.isArray(customRes.orders)) {
          setCustomOrders(customRes.orders);
        }
      } catch (custErr) {
        console.warn('[OrdersPage] Custom orders fetch error:', custErr.message);
      }

    } catch (err) {
      console.error('Failed loading orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllOrders();
    const handleUpdate = () => loadAllOrders();
    window.addEventListener('orders_updated', handleUpdate);
    return () => window.removeEventListener('orders_updated', handleUpdate);
  }, [user]);

  // Handle Customer Paying / Accepting Quotation for Approved Custom Order
  const handlePayCustomOrder = async (order) => {
    setPayingOrderId(order.order_id);
    try {
      const res = await payCustomOrderApi(order.order_id);
      if (res && res.success) {
        if (onTriggerToast) {
          onTriggerToast(
            'success',
            'Order Confirmed & Paid!',
            `👑 Quotation for ${order.order_number} confirmed. Our master silversmiths have initiated handcrafting.`
          );
        }
        await loadAllOrders();
      } else {
        if (onTriggerToast) {
          onTriggerToast('error', 'Payment Failed', res.error || 'Failed to confirm payment.');
        }
      }
    } catch (err) {
      if (onTriggerToast) {
        onTriggerToast('error', 'Error', err.message || 'Payment submission failed.');
      }
    } finally {
      setPayingOrderId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently Placed';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(dateStr);
    }
  };

  const totalCount = readyOrders.length + customOrders.length;

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[var(--th-bg)] text-[var(--th-text-main)] py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Page Header Card */}
        <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-2xl p-5 sm:p-6 shadow-md backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/login')}
              className="p-2 rounded-xl bg-[var(--th-surface-alt)] hover:bg-[var(--th-border)] text-[var(--th-text-main)] border border-[var(--th-border)] transition-all cursor-pointer group"
              title="Return to Account Profile"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-[var(--th-accent)]" />
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[var(--th-text-main)]">
                  My Orders & Custom Requests
                </h1>
              </div>
              <p className="text-xs text-[var(--th-text-muted)] mt-0.5">
                Track ready catalog purchases, bespoke artisan approvals, and live price quotations
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={loadAllOrders}
              disabled={refreshing}
              className="px-3 py-1.5 rounded-xl border border-[var(--th-border)] bg-[var(--th-surface-alt)] hover:bg-[var(--th-card)] text-xs font-semibold flex items-center space-x-1.5 text-[var(--th-text-main)] transition-all cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[var(--th-accent)] ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => navigate('/custom-orders')}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>New Custom Order</span>
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-2 border-b border-[var(--th-border)] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'ALL'
                ? 'bg-[var(--th-primary)] text-white shadow-sm'
                : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:bg-[var(--th-surface-alt)]'
            }`}
          >
            <span>All Orders</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('CUSTOM')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'CUSTOM'
                ? 'bg-[var(--th-primary)] text-white shadow-sm'
                : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:bg-[var(--th-surface-alt)]'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-[var(--th-accent)]" />
            <span>Bespoke Custom Requests</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {customOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('READY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'READY'
                ? 'bg-[var(--th-primary)] text-white shadow-sm'
                : 'text-[var(--th-text-muted)] hover:text-[var(--th-text-main)] hover:bg-[var(--th-surface-alt)]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Ready Catalog Purchases</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {readyOrders.length}
            </span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-2xl p-12 text-center shadow-md">
            <div className="inline-block w-8 h-8 border-3 border-[var(--th-primary)] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-[var(--th-text-muted)] font-medium">
              Retrieving your sacred orders & custom quotations...
            </p>
          </div>
        ) : totalCount === 0 ? (
          /* Empty Orders View */
          <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-3xl p-10 sm:p-14 text-center shadow-md max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[var(--th-surface-alt)] border border-[var(--th-border)] text-[var(--th-accent)] flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Package className="w-8 h-8 stroke-1" />
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--th-text-main)] mb-1">
              No Orders Found Yet
            </h3>
            <p className="text-xs text-[var(--th-text-muted)] max-w-sm mx-auto mb-6 leading-relaxed">
              You haven't placed any orders or bespoke requests yet. Explore our handcrafted 925 sterling silver jewelry or commission a custom temple masterpiece.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/catalog')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
              >
                <span>Browse Ready Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate('/custom-orders')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-[var(--th-border)] hover:border-[var(--th-accent)] bg-[var(--th-surface-alt)] text-[var(--th-text-main)] font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-[var(--th-accent)]" />
                <span>Commission Custom Piece</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">

            {/* 1. BESPOKE CUSTOM ORDERS SECTION */}
            {(activeTab === 'ALL' || activeTab === 'CUSTOM') && customOrders.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 px-1">
                  <Crown className="w-4 h-4 text-[var(--th-accent)]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--th-text-muted)]">
                    Bespoke Custom Orders ({customOrders.length})
                  </h2>
                </div>

                <div className="space-y-4">
                  {customOrders.map((ord) => {
                    const status = (ord.confirm || 'processing').toLowerCase();
                    const isAccepted = status === 'accepted' || status === 'approved';
                    const isRejected = status === 'rejected';
                    const isProcessing = status === 'processing';
                    const isPaid = (ord.payment_status || '').toUpperCase() === 'PAID';
                    const quotedPrice = Number(ord.final_payable || ord.total_amount || 0);
                    const images = Array.isArray(ord.images) ? ord.images : [];

                    return (
                      <div
                        key={ord.order_id}
                        className={`bg-[var(--th-card)] border rounded-2xl shadow-sm transition-all overflow-hidden ${
                          isAccepted
                            ? 'border-emerald-500/50 shadow-emerald-500/5'
                            : isRejected
                            ? 'border-rose-500/40'
                            : 'border-amber-500/40'
                        }`}
                      >
                        {/* Top Bar */}
                        <div className="bg-[var(--th-surface-alt)]/80 px-4 sm:px-6 py-3.5 border-b border-[var(--th-border)] flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center space-x-3">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--th-text-muted)] block">
                                Custom Order Number
                              </span>
                              <span className="font-mono font-bold text-[var(--th-primary)] text-sm">
                                {ord.order_number}
                              </span>
                            </div>

                            <div className="hidden sm:block h-6 w-px bg-[var(--th-border)]" />

                            <div className="hidden sm:block">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--th-text-muted)] block">
                                Requested On
                              </span>
                              <span className="text-[var(--th-text-main)] font-medium">
                                {formatDate(ord.created_at)}
                              </span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center space-x-2">
                            {isProcessing && (
                              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center space-x-1.5 animate-pulse">
                                <Clock className="w-3.5 h-3.5" />
                                <span>⏳ Waiting for Approval</span>
                              </span>
                            )}

                            {isAccepted && (
                              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>👑 Approved by Workshop</span>
                              </span>
                            )}

                            {isRejected && (
                              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 flex items-center space-x-1.5">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>❌ Request Declined</span>
                              </span>
                            )}

                            {isPaid && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                                PAID & CONFIRMED
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Custom Order Body */}
                        <div className="p-4 sm:p-6 space-y-5">

                          {/* Category and Description */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[var(--th-accent)] uppercase tracking-wider">
                                <Crown className="w-3.5 h-3.5" />
                                <span>{ord.custom_category || 'Artisanal Commission'}</span>
                              </div>
                              <p className="text-xs sm:text-sm text-[var(--th-text-main)] font-medium leading-relaxed max-w-2xl bg-[var(--th-surface-alt)]/50 p-3 rounded-xl border border-[var(--th-border)]/60">
                                {ord.description || 'Custom dimensions and requirements submitted for workshop appraisal.'}
                              </p>
                            </div>

                            {/* Inspiration Photos Preview */}
                            {images.length > 0 && (
                              <div className="shrink-0 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--th-text-muted)] block">
                                  Inspiration Photos ({images.length})
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {images.slice(0, 3).map((img, imgIdx) => (
                                    <button
                                      key={imgIdx}
                                      type="button"
                                      onClick={() => setSelectedPhoto(img)}
                                      className="relative w-12 h-12 rounded-xl overflow-hidden border border-[var(--th-border)] hover:border-[var(--th-primary)] group cursor-pointer"
                                    >
                                      <img
                                        src={img}
                                        alt="Inspiration reference"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                        <Eye className="w-3.5 h-3.5" />
                                      </div>
                                    </button>
                                  ))}
                                  {images.length > 3 && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedPhoto(images[3])}
                                      className="w-12 h-12 rounded-xl bg-[var(--th-surface-alt)] border border-[var(--th-border)] flex items-center justify-center text-xs font-bold text-[var(--th-text-muted)] hover:text-[var(--th-primary)] cursor-pointer"
                                    >
                                      +{images.length - 3}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Dynamic Decision Status Banners */}
                          {isProcessing && (
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-xs">
                              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                              <div className="space-y-1 text-amber-900 dark:text-amber-200">
                                <strong className="font-bold block text-sm">
                                  ⏳ Waiting for Workshop Approval & Price Quotation
                                </strong>
                                <p className="leading-relaxed">
                                  Our master silversmiths are currently inspecting your design specifications, silver gauge, and carving hours. Once approved, the exact handcrafted quotation will appear here, and you will also receive an instant WhatsApp update at <strong>{ord.customer_phone || user?.phone}</strong>.
                                </p>
                              </div>
                            </div>
                          )}

                          {isAccepted && (
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-start space-x-3">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <div className="inline-flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                                    <Sparkles className="w-4 h-4 text-emerald-600" />
                                    <span>Artisan Approval Granted! Quotation Ready</span>
                                  </div>
                                  <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
                                    Your bespoke custom design has been approved by our master silversmith. Pure 925 hallmarked silver crafting is ready to proceed.
                                  </p>
                                </div>
                              </div>

                              {/* Price Highlight & Action Button */}
                              <div className="flex flex-col sm:items-end justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-emerald-500/20 pt-3 sm:pt-0 sm:pl-5 gap-2">
                                <div className="text-left sm:text-right">
                                  <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block tracking-wider">
                                    Approved Price
                                  </span>
                                  <span className="font-serif text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                                    ₹{quotedPrice.toLocaleString('en-IN')}
                                  </span>
                                </div>

                                {!isPaid ? (
                                  <button
                                    onClick={() => handlePayCustomOrder(ord)}
                                    disabled={payingOrderId === ord.order_id}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                                  >
                                    {payingOrderId === ord.order_id ? (
                                      <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Confirming...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-4 h-4" />
                                        <span>Accept Quotation & Confirm</span>
                                      </>
                                    )}
                                  </button>
                                ) : (
                                  <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Confirmed & Handcrafting</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {isRejected && (
                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                              <div className="flex items-start space-x-3 text-rose-900 dark:text-rose-200">
                                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <strong className="font-bold block text-sm">
                                    ❌ Request Could Not Be Accepted
                                  </strong>
                                  <p className="leading-relaxed">
                                    Our master artisans reviewed your requirements but cannot undertake this specific request at this time due to casting or dimensional constraints.
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => navigate('/custom-orders')}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shrink-0 transition-all cursor-pointer"
                              >
                                Submit Alternate Design
                              </button>
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. READY CATALOG PURCHASES SECTION */}
            {(activeTab === 'ALL' || activeTab === 'READY') && readyOrders.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 px-1">
                  <ShoppingBag className="w-4 h-4 text-[var(--th-primary)]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--th-text-muted)]">
                    Ready Purchases & Transit ({readyOrders.length})
                  </h2>
                </div>

                <div className="space-y-4">
                  {readyOrders.map((ord, idx) => {
                    const isPaid = (ord.payment_status || '').toUpperCase() === 'PAID';
                    const items = Array.isArray(ord.items) && ord.items.length > 0 ? ord.items : [];
                    const finalAmount = Number(ord.final_payable || ord.total_amount || 0);

                    return (
                      <div
                        key={ord.order_number || ord.order_id || idx}
                        className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                      >
                        {/* Order Top Bar */}
                        <div className="bg-[var(--th-surface-alt)]/80 px-4 sm:px-6 py-3.5 border-b border-[var(--th-border)] flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center space-x-3">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--th-text-muted)] block">
                                Order Number
                              </span>
                              <span className="font-mono font-bold text-[var(--th-primary)] text-sm">
                                {ord.order_number || `SH-${ord.order_id}`}
                              </span>
                            </div>

                            <div className="hidden sm:block h-6 w-px bg-[var(--th-border)]" />

                            <div className="hidden sm:block">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--th-text-muted)] block">
                                Placed On
                              </span>
                              <span className="text-[var(--th-text-main)] font-medium">
                                {formatDate(ord.created_at)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center space-x-1 ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-amber-50 text-amber-700 border-amber-300'
                            }`}>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{ord.payment_status || 'CONFIRMED'}</span>
                            </span>

                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--th-card)] text-[var(--th-text-main)] border border-[var(--th-border)]">
                              {ord.payment_method ? ord.payment_method.toUpperCase() : 'PREPAID'}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-4 sm:p-6 space-y-4">
                          {items.length > 0 ? (
                            <div className="space-y-3 divide-y divide-[var(--th-border)]/50">
                              {items.map((item, itemIdx) => (
                                <div key={itemIdx} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                                  <div className="flex items-center space-x-3 min-w-0">
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.product_name || 'Silver Item'}
                                        className="w-12 h-12 rounded-xl object-cover border border-[var(--th-border)] shrink-0 bg-[var(--th-surface-alt)]"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-xl bg-[var(--th-surface-alt)] border border-[var(--th-border)] flex items-center justify-center shrink-0 text-[var(--th-accent)] font-bold text-xs">
                                        925
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <h4 className="text-xs font-bold text-[var(--th-text-main)] truncate max-w-xs sm:max-w-md">
                                        {item.product_name || item.name || 'Artisanal Silver Craft'}
                                      </h4>
                                      <p className="text-[11px] text-[var(--th-text-muted)] mt-0.5">
                                        Qty: <strong className="text-[var(--th-text-main)]">{item.quantity || item.qty || 1}</strong> × ₹{(item.unit_price || item.price || 0).toLocaleString('en-IN')}
                                      </p>
                                    </div>
                                  </div>

                                  <span className="text-xs font-bold text-[var(--th-primary)] font-mono shrink-0">
                                    ₹{(item.subtotal || ((item.quantity || 1) * (item.unit_price || item.price || 0))).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-[var(--th-text-muted)] italic">
                              Sacred Hallmarked Silver Order #{ord.order_number || ord.order_id}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="pt-3 border-t border-[var(--th-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            {ord.delivery_address && (
                              <div className="flex items-start space-x-2 text-[var(--th-text-muted)] max-w-sm">
                                <MapPin className="w-3.5 h-3.5 text-[var(--th-accent)] shrink-0 mt-0.5" />
                                <span className="text-[11px] truncate">
                                  {ord.delivery_address}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center space-x-4 self-end sm:self-auto">
                              <div className="text-right">
                                <span className="text-[10px] text-[var(--th-text-muted)] block uppercase tracking-wider">
                                  Total Payable
                                </span>
                                <span className="font-serif text-base font-bold text-[var(--th-primary)]">
                                  ₹{finalAmount.toLocaleString('en-IN')}
                                </span>
                              </div>

                              <button
                                onClick={() => {
                                  if (onTriggerToast) {
                                    onTriggerToast('success', 'Order Verified', `Order ${ord.order_number} is tracked with insured transit.`);
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl border border-[var(--th-border)] hover:border-[var(--th-accent)] bg-[var(--th-surface-alt)] hover:bg-[var(--th-card)] text-[11px] font-bold text-[var(--th-text-main)] transition-all cursor-pointer shadow-2xs"
                              >
                                Insured Transit Details
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Lightbox Photo Preview Modal */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-[var(--th-card)] p-2 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={selectedPhoto} 
              alt="Custom inspiration preview" 
              className="max-h-[80vh] w-auto mx-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}

    </div>
  );
}
