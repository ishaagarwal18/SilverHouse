import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { Banknote, BarChart3, ChartBar, ChartPie, Crown, History, IndianRupee, Paintbrush, RefreshCw, Scale, TrendingUp } from 'lucide-react';
import { adminFetch, formatINR } from '../api/adminApi';
import { useAdminUI } from '../context/AdminUIContext';
import { Button, Card, DecisionBadge, PageHeader } from '../components/ui';

Chart.register(...registerables);

const FONT = { family: 'Plus Jakarta Sans', weight: '600', size: 11 };

/** Thin chart.js wrapper: (re)creates the chart whenever `config` changes. */
function ChartCanvas({ config, label }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !config) return undefined;
    const chart = new Chart(canvasRef.current, config);
    return () => chart.destroy();
  }, [config]);
  return <canvas ref={canvasRef} role="img" aria-label={label} />;
}

function buildCharts(data, isDark) {
  const textColor = isDark ? '#9ca3af' : '#64748b';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const borderColor = isDark ? '#111827' : '#ffffff';
  const pnl = data.pnl || {};
  const custom = data.customOrders || {};
  const categories = data.categoryBreakdown || [];
  const productCats = (data.productCategoriesPnl || []).slice(0, 6);
  const legend = { position: 'bottom', labels: { color: textColor, font: FONT, boxWidth: 12 } };
  const base = { responsive: true, maintainAspectRatio: false };

  return {
    pnl: {
      type: 'doughnut',
      data: {
        labels: ['Actual Material Cost', 'Artisan Labour Cost', 'Gross Margin (Profit)'],
        datasets: [{
          data: [pnl.actualMaterialCost || 0, pnl.labourCost || 0, pnl.grossMargin > 0 ? pnl.grossMargin : 0],
          backgroundColor: ['#f59e0b', '#38bdf8', '#10b981'],
          borderWidth: 2,
          borderColor
        }]
      },
      options: { ...base, cutout: '65%', plugins: { legend, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${formatINR(ctx.raw)}` } } } }
    },
    status: {
      type: 'doughnut',
      data: {
        labels: ['Processing (Pending)', 'Accepted', 'Rejected'],
        datasets: [{
          data: [custom.processing || 0, custom.accepted || 0, custom.rejected || 0],
          backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
          borderWidth: 2,
          borderColor
        }]
      },
      options: { ...base, cutout: '65%', plugins: { legend, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} orders` } } } }
    },
    customCategory: {
      type: 'bar',
      data: {
        labels: categories.length ? categories.map(c => c.category) : ['Mukhut', 'Jhalar', 'Thakurji ka saman', 'Temple things'],
        datasets: [{ label: 'Custom Orders Count', data: categories.length ? categories.map(c => c.count) : [0, 0, 0, 0], backgroundColor: '#a855f7', borderRadius: 6 }]
      },
      options: {
        ...base,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: textColor, precision: 0 }, grid: { color: gridColor } },
          y: { ticks: { color: textColor, font: FONT }, grid: { display: false } }
        }
      }
    },
    categoryProfit: {
      type: 'bar',
      data: {
        labels: productCats.map(c => c.category_name),
        datasets: [
          { label: 'Selling Price (₹)', data: productCats.map(c => c.total_selling_price), backgroundColor: '#4f46e5', borderRadius: 6 },
          { label: 'Gross Profit (₹)', data: productCats.map(c => c.total_margin), backgroundColor: '#10b981', borderRadius: 6 }
        ]
      },
      options: {
        ...base,
        plugins: { legend, tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${formatINR(ctx.raw)}` } } },
        scales: {
          x: { ticks: { color: textColor, font: { size: 10 } }, grid: { display: false } },
          y: { ticks: { color: textColor, callback: v => '₹' + (v >= 1000 ? `${v / 1000}k` : v) }, grid: { color: gridColor } }
        }
      }
    }
  };
}

/** Route: /admin/analytics — P&L KPIs, margin and custom-order charts, recent bespoke orders. */
export default function AnalyticsPage() {
  const { theme, showToast } = useAdminUI();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [charts, setCharts] = useState(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await adminFetch('/admin/analytics');
      if (!res.success) throw new Error(res.error || 'Analytics API error');
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      showToast('Failed to load analytics: ' + err.message, true);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);
  useEffect(() => { if (data) setCharts(buildCharts(data, theme === 'dark')); }, [data, theme]);

  const pnl = data?.pnl || {};
  const custom = data?.customOrders || {};
  const recent = data?.recentOrders || [];

  return (
    <div>
      <PageHeader
        title="Financial Analytics & P&L"
        icon={BarChart3}
        description="Margin metrics, labour cost analysis and custom orders conversion ratio"
        actions={<Button onClick={loadAnalytics} disabled={loading}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Metrics</Button>}
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Catalog Selling Value" icon={IndianRupee} tone="text-ad-primary bg-ad-primary/10" value={formatINR(pnl.potentialRevenue)}>
          Total catalog products: <strong className="text-ad-text">{pnl.totalProducts || 0}</strong>
        </KpiCard>
        <KpiCard title="Total Product Costs" icon={Banknote} tone="text-ad-warning bg-ad-warning/10" value={formatINR(pnl.totalCost)}>
          Material: <strong className="text-ad-text">{formatINR(pnl.actualMaterialCost)}</strong> · Labour: <strong className="text-ad-text">{formatINR(pnl.labourCost)}</strong>
        </KpiCard>
        <KpiCard title="Catalog Gross Margin" icon={TrendingUp} tone="text-ad-success bg-ad-success/10" value={formatINR(pnl.grossMargin)}>
          <span className="rounded-full bg-ad-success/15 px-2 py-0.5 font-bold text-ad-success">{pnl.marginPercentage || 0}%</span> overall profit margin
        </KpiCard>
        <KpiCard title="Custom Orders Volume" icon={Paintbrush} tone="text-ad-accent bg-ad-accent/10" value={custom.total || 0}>
          <span className="rounded-full bg-ad-success/15 px-2 py-0.5 font-bold text-ad-success">{custom.acceptanceRate || 0}% Accepted</span> {custom.processing || 0} pending
        </KpiCard>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="P&L Margin & Cost Structure" subtitle="Selling price vs. silver material cost vs. artisan labour cost" icon={Scale} iconTone="text-ad-primary">
          {charts && <ChartCanvas config={charts.pnl} label="P&L cost structure doughnut chart" />}
        </ChartCard>
        <ChartCard title="Custom Orders Status Ratio" subtitle="Accepted vs rejected vs processing quotation pipeline" icon={ChartPie} iconTone="text-ad-accent">
          {charts && <ChartCanvas config={charts.status} label="Custom order status doughnut chart" />}
        </ChartCard>
        <ChartCard title="Custom Requests by Category" subtitle="Mukhut, Jhalar, Thakurji ka Saman & Temple Things volume" icon={Crown} iconTone="text-purple-500">
          {charts && <ChartCanvas config={charts.customCategory} label="Custom requests by category bar chart" />}
        </ChartCard>
        <ChartCard title="Category Profitability Margins" subtitle="Selling price vs. gross profit across jewellery lines" icon={ChartBar} iconTone="text-ad-success">
          {charts && <ChartCanvas config={charts.categoryProfit} label="Category profitability bar chart" />}
        </ChartCard>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-ad-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <div className="flex items-center gap-2 font-bold text-ad-text"><History className="w-4.5 h-4.5" /> Recent Bespoke Custom Orders</div>
            <div className="mt-0.5 text-xs text-ad-muted">Latest custom artisanal requests and quotation updates</div>
          </div>
          <Link to="/admin/custom-orders" className="text-[12.5px] font-bold text-ad-primary hover:underline">View all custom orders →</Link>
        </div>
        <div className="ad-scroll overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-ad-card text-[11px] font-bold uppercase tracking-wide text-ad-muted">
              <tr>
                {['Order #', 'Category', 'Customer', 'Contact', 'Quoted Price', 'Status', 'Date'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-ad-muted">{loading ? 'Loading analytics data…' : 'No recent custom orders recorded.'}</td></tr>
              ) : recent.map(o => (
                <tr key={o.order_id || o.order_number} className="border-t border-ad-border">
                  <td className="px-4 py-3 font-bold">{o.order_number}</td>
                  <td className="px-4 py-3 font-bold text-ad-accent">{o.custom_category || 'Artisanal'}</td>
                  <td className="px-4 py-3">{o.customer_name || 'Anonymous'}</td>
                  <td className="px-4 py-3">{o.customer_phone || '-'}</td>
                  <td className="px-4 py-3 font-bold">{formatINR(o.final_payable)}</td>
                  <td className="px-4 py-3"><DecisionBadge status={o.confirm} /></td>
                  <td className="px-4 py-3 whitespace-nowrap">{o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function KpiCard({ title, icon: Icon, tone, value, children }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wide text-ad-muted">{title}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}><Icon className="w-4.5 h-4.5" /></span>
      </div>
      <div className="mt-2 truncate text-2xl font-extrabold text-ad-text">{value}</div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-ad-muted">{children}</div>
    </Card>
  );
}

function ChartCard({ title, subtitle, icon: Icon, iconTone, children }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 font-bold text-ad-text"><Icon className={`w-4.5 h-4.5 ${iconTone}`} /> {title}</div>
      <div className="mt-0.5 text-xs text-ad-muted">{subtitle}</div>
      <div className="relative mt-4 h-64 sm:h-72">{children}</div>
    </Card>
  );
}
