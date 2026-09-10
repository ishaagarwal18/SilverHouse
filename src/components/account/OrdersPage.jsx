import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postApiData } from '../../services/api';
import { 
  Package, ArrowLeft, ArrowRight, Clock, MapPin, CheckCircle2, 
  AlertCircle, ShieldCheck, Sparkles, ExternalLink, RefreshCw, ShoppingBag 
} from 'lucide-react';

export default function OrdersPage({ onTriggerToast }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    setRefreshing(true);
    try {
      // 1. Fetch from backend SQL Server orders endpoint
      let backendOrders = [];
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
          backendOrders = res.data;
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

      // 3. Merge: prefer local cache for matching order_number (keeps rich items data) or prepend unique orders
      const orderMap = new Map();

      // Put backend orders first
      backendOrders.forEach(o => {
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

      // Overlay with rich local cache details
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
          // If order belongs to this user or user is not logged in / matching
          if (!user?.userId || !lo.user_id || lo.user_id === user.userId) {
            orderMap.set(key, lo);
          }
        }
      });

      const merged = Array.from(orderMap.values()).sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setOrders(merged);
    } catch (err) {
      console.error('Failed loading orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const handleUpdate = () => loadOrders();
    window.addEventListener('orders_updated', handleUpdate);
    return () => window.removeEventListener('orders_updated', handleUpdate);
  }, [user]);

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
                  My Orders & Sacred Purchases
                </h1>
              </div>
              <p className="text-xs text-[var(--th-text-muted)] mt-0.5">
                Track live transit, invoices, and your hallmarked sterling silver purchases
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={loadOrders}
              disabled={refreshing}
              className="px-3 py-1.5 rounded-xl border border-[var(--th-border)] bg-[var(--th-surface-alt)] hover:bg-[var(--th-card)] text-xs font-semibold flex items-center space-x-1.5 text-[var(--th-text-main)] transition-all cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[var(--th-accent)] ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => navigate('/catalog')}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Explore More</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-2xl p-12 text-center shadow-md">
            <div className="inline-block w-8 h-8 border-3 border-[var(--th-primary)] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-[var(--th-text-muted)] font-medium">
              Retrieving your sacred orders...
            </p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty Orders View */
          <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-3xl p-10 sm:p-14 text-center shadow-md max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[var(--th-surface-alt)] border border-[var(--th-border)] text-[var(--th-accent)] flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Package className="w-8 h-8 stroke-1" />
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--th-text-main)] mb-1">
              No Orders Found Yet
            </h3>
            <p className="text-xs text-[var(--th-text-muted)] max-w-sm mx-auto mb-6 leading-relaxed">
              You haven't placed any orders yet. Explore our handcrafted 925 sterling silver jewelry and 999 fine temple bullion.
            </p>
            <button
              onClick={() => navigate('/catalog')}
              className="px-6 py-2.5 rounded-xl bg-[var(--th-primary)] hover:bg-[var(--th-primary-hover)] text-white font-bold text-xs uppercase tracking-wider inline-flex items-center space-x-2 transition-all cursor-pointer shadow-md"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* List of Orders */
          <div className="space-y-4">
            {orders.map((ord, idx) => {
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

                  {/* Order Content */}
                  <div className="p-4 sm:p-6 space-y-4">

                    {/* Items List */}
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

                    {/* Delivery & Amount Footer */}
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
        )}

      </div>
    </div>
  );
}
