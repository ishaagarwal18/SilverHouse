import React, { useState, useEffect, useRef } from 'react';

export default function AnalyticsDashboard() {
    const [theme, setTheme] = useState('light');
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    const pnlChartRef = useRef(null);
    const customStatusChartRef = useRef(null);
    const customCategoryChartRef = useRef(null);
    const categoryProfitChartRef = useRef(null);

    const pnlChartInst = useRef(null);
    const customStatusChartInst = useRef(null);
    const customCategoryChartInst = useRef(null);
    const categoryProfitChartInst = useRef(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem('silverhouse_theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        loadAnalytics();
    }, []);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('silverhouse_theme', next);
        if (analyticsData) {
            renderCharts(analyticsData, next);
        }
    };

    const formatINR = (val) => {
        const n = Number(val) || 0;
        return '₹' + n.toLocaleString('en-IN');
    };

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/analytics');
            const data = await res.json();
            if (data.success) {
                setAnalyticsData(data);
                renderCharts(data, theme);
            }
        } catch (err) {
            console.error('Failed to load analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderCharts = (data, curTheme) => {
        if (typeof window === 'undefined' || !window.Chart) return;

        const isDark = curTheme === 'dark';
        const textColor = isDark ? '#9ca3af' : '#64748b';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

        const pnl = data.pnl || {};
        const custom = data.customOrders || {};
        const categories = data.categoryBreakdown || [];
        const productCategories = data.productCategoriesPnl || [];

        // 1. P&L Cost Structure
        if (pnlChartRef.current) {
            if (pnlChartInst.current) pnlChartInst.current.destroy();
            pnlChartInst.current = new window.Chart(pnlChartRef.current.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Actual Material Cost', 'Artisan Labour Cost', 'Gross Margin (Profit)'],
                    datasets: [{
                        data: [
                            pnl.actualMaterialCost || 0,
                            pnl.labourCost || 0,
                            pnl.grossMargin > 0 ? pnl.grossMargin : 0
                        ],
                        backgroundColor: ['#f59e0b', '#38bdf8', '#10b981'],
                        borderWidth: 2,
                        borderColor: isDark ? '#111827' : '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600', size: 11 } }
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => ` ${ctx.label}: ₹${Number(ctx.raw).toLocaleString('en-IN')}`
                            }
                        }
                    },
                    cutout: '65%'
                }
            });
        }

        // 2. Custom Status
        if (customStatusChartRef.current) {
            if (customStatusChartInst.current) customStatusChartInst.current.destroy();
            customStatusChartInst.current = new window.Chart(customStatusChartRef.current.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Processing (Pending)', 'Accepted', 'Rejected'],
                    datasets: [{
                        data: [
                            custom.processing || 0,
                            custom.accepted || 0,
                            custom.rejected || 0
                        ],
                        backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
                        borderWidth: 2,
                        borderColor: isDark ? '#111827' : '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600', size: 11 } }
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => ` ${ctx.label}: ${ctx.raw} orders`
                            }
                        }
                    },
                    cutout: '65%'
                }
            });
        }

        // 3. Custom Category
        if (customCategoryChartRef.current) {
            if (customCategoryChartInst.current) customCategoryChartInst.current.destroy();
            const catLabels = categories.map(c => c.category);
            const catCounts = categories.map(c => c.count);

            customCategoryChartInst.current = new window.Chart(customCategoryChartRef.current.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: catLabels.length > 0 ? catLabels : ['Mukhut', 'Jhalar', 'Thakurji ka saman', 'Temple things'],
                    datasets: [{
                        label: 'Custom Orders Count',
                        data: catCounts.length > 0 ? catCounts : [0, 0, 0, 0],
                        backgroundColor: '#a855f7',
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            ticks: { color: textColor, precision: 0 },
                            grid: { color: gridColor }
                        },
                        y: {
                            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600' } },
                            grid: { display: false }
                        }
                    }
                }
            });
        }

        // 4. Category Profitability
        if (categoryProfitChartRef.current) {
            if (categoryProfitChartInst.current) categoryProfitChartInst.current.destroy();
            const prodCatLabels = productCategories.slice(0, 6).map(c => c.category_name);
            const prodCatSelling = productCategories.slice(0, 6).map(c => c.total_selling_price);
            const prodCatProfit = productCategories.slice(0, 6).map(c => c.total_margin);

            categoryProfitChartInst.current = new window.Chart(categoryProfitChartRef.current.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: prodCatLabels,
                    datasets: [
                        {
                            label: 'Selling Price (₹)',
                            data: prodCatSelling,
                            backgroundColor: '#4f46e5',
                            borderRadius: 6
                        },
                        {
                            label: 'Gross Profit (₹)',
                            data: prodCatProfit,
                            backgroundColor: '#10b981',
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600', size: 11 } }
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => ` ${ctx.dataset.label}: ₹${Number(ctx.raw).toLocaleString('en-IN')}`
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: textColor, font: { size: 10 } },
                            grid: { display: false }
                        },
                        y: {
                            ticks: {
                                color: textColor,
                                callback: (val) => '₹' + (val >= 1000 ? (val / 1000) + 'k' : val)
                            },
                            grid: { color: gridColor }
                        }
                    }
                }
            });
        }
    };

    const pnl = analyticsData?.pnl || {};
    const custom = analyticsData?.customOrders || {};
    const recentOrders = analyticsData?.recentOrders || [];

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    --bg: #f8fafc;
                    --surface: #ffffff;
                    --surface-card: #f1f5f9;
                    --surface-hover: #e2e8f0;
                    --border: #e2e8f0;
                    --border-focus: #4f46e5;
                    --primary: #4f46e5;
                    --primary-hover: #4338ca;
                    --primary-glow: rgba(79, 70, 229, 0.18);
                    --accent: #d97706;
                    --accent-gold: #b45309;
                    --success: #10b981;
                    --success-bg: rgba(16, 185, 129, 0.12);
                    --warning: #f59e0b;
                    --warning-bg: rgba(245, 158, 11, 0.12);
                    --danger: #ef4444;
                    --danger-bg: rgba(239, 68, 68, 0.12);
                    --text-main: #0f172a;
                    --text-muted: #64748b;
                    --sidebar-width: 260px;
                    --radius: 14px;
                    --transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
                    --shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                    --card-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
                }

                [data-theme="dark"] {
                    --bg: #0b0f19;
                    --surface: #111827;
                    --surface-card: #1f2937;
                    --surface-hover: #374151;
                    --border: #374151;
                    --border-focus: #6366f1;
                    --primary: #6366f1;
                    --primary-hover: #4f46e5;
                    --primary-glow: rgba(99, 102, 241, 0.25);
                    --accent: #f59e0b;
                    --accent-gold: #fbbf24;
                    --success: #10b981;
                    --success-bg: rgba(16, 185, 129, 0.16);
                    --warning: #f59e0b;
                    --warning-bg: rgba(245, 158, 11, 0.16);
                    --danger: #ef4444;
                    --danger-bg: rgba(239, 68, 68, 0.16);
                    --text-main: #f3f4f6;
                    --text-muted: #9ca3af;
                    --shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
                    --card-shadow: 0 4px 22px rgba(0, 0, 0, 0.45);
                }

                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                body {
                    background-color: var(--bg);
                    color: var(--text-main);
                    display: flex;
                    height: 100vh;
                    overflow: hidden;
                }

                .sidebar {
                    width: var(--sidebar-width);
                    background: var(--surface);
                    border-right: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    padding: 24px 16px;
                    gap: 24px;
                    z-index: 10;
                    overflow-y: auto;
                }

                .brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 4px 8px;
                    text-decoration: none;
                    color: inherit;
                }

                .brand-logo {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, var(--primary), #a855f7);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #ffffff;
                    font-size: 22px;
                    box-shadow: 0 4px 12px var(--primary-glow);
                }

                .brand-title {
                    font-size: 16px;
                    font-weight: 800;
                    letter-spacing: -0.3px;
                }

                .brand-subtitle {
                    font-size: 11px;
                    color: var(--text-muted);
                    font-weight: 600;
                }

                .nav-label {
                    font-size: 10.5px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    color: var(--text-muted);
                    padding: 0 10px 8px;
                }

                .nav-menu {
                    list-style: none;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    border-radius: 10px;
                    font-size: 13.5px;
                    font-weight: 600;
                    color: var(--text-muted);
                    cursor: pointer;
                    text-decoration: none;
                    transition: var(--transition);
                }

                .nav-item:hover {
                    background: var(--surface-card);
                    color: var(--text-main);
                }

                .nav-item.active {
                    background: var(--primary);
                    color: #ffffff;
                    box-shadow: 0 4px 12px var(--primary-glow);
                }

                .nav-item.active i {
                    color: #ffffff;
                }

                .nav-item i {
                    font-size: 18px;
                }

                .main-wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    overflow: hidden;
                }

                .top-bar {
                    padding: 18px 32px;
                    background: var(--surface);
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                }

                .title-box h1 {
                    font-size: 22px;
                    font-weight: 800;
                    letter-spacing: -0.4px;
                }

                .title-box p {
                    font-size: 12.5px;
                    color: var(--text-muted);
                    margin-top: 2px;
                }

                .top-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .btn-theme {
                    background: var(--surface-card);
                    border: 1px solid var(--border);
                    color: var(--text-main);
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: var(--transition);
                }

                .btn-theme:hover {
                    background: var(--surface-hover);
                }

                .btn-refresh {
                    padding: 8px 14px;
                    border-radius: 10px;
                    border: 1px solid var(--border);
                    background: var(--surface-card);
                    color: var(--text-main);
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: var(--transition);
                }

                .btn-refresh:hover {
                    background: var(--surface-hover);
                }

                .content-scroll {
                    flex: 1;
                    padding: 24px 32px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 18px;
                }

                .kpi-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    padding: 20px;
                    box-shadow: var(--card-shadow);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    transition: var(--transition);
                }

                .kpi-card:hover {
                    transform: translateY(-2px);
                    border-color: var(--border-focus);
                }

                .kpi-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .kpi-title {
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--text-muted);
                }

                .kpi-icon-wrap {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                }

                .kpi-value {
                    font-size: 24px;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                    color: var(--text-main);
                }

                .kpi-footer {
                    font-size: 11.5px;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-weight: 600;
                }

                .trend-pill {
                    padding: 2px 8px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 800;
                }

                .trend-up {
                    background: var(--success-bg);
                    color: var(--success);
                }

                .trend-warn {
                    background: var(--warning-bg);
                    color: var(--warning);
                }

                .charts-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }

                @media (max-width: 1024px) {
                    .charts-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .chart-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    padding: 22px;
                    box-shadow: var(--card-shadow);
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .chart-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .chart-title {
                    font-size: 15px;
                    font-weight: 800;
                    color: var(--text-main);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .chart-subtitle {
                    font-size: 12px;
                    color: var(--text-muted);
                    margin-top: 2px;
                }

                .chart-canvas-wrap {
                    position: relative;
                    height: 280px;
                    width: 100%;
                }

                .table-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    padding: 22px;
                    box-shadow: var(--card-shadow);
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .table-wrap {
                    overflow-x: auto;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                    text-align: left;
                }

                th {
                    background: var(--surface-card);
                    color: var(--text-muted);
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.6px;
                    padding: 10px 14px;
                    border-bottom: 1px solid var(--border);
                }

                td {
                    padding: 12px 14px;
                    border-bottom: 1px solid var(--border);
                    color: var(--text-main);
                }

                tr:last-child td {
                    border-bottom: none;
                }

                tr:hover td {
                    background: var(--surface-card);
                }

                .badge-status {
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                }

                .status-processing {
                    background: var(--warning-bg);
                    color: var(--warning);
                }

                .status-accepted {
                    background: var(--success-bg);
                    color: var(--success);
                }

                .status-rejected {
                    background: var(--danger-bg);
                    color: var(--danger);
                }
            ` }} />

            {/* SIDEBAR */}
            <aside className="sidebar">
                <a href="/admin" className="brand">
                    <div className="brand-logo">
                        <i className="ph-bold ph-gem"></i>
                    </div>
                    <div>
                        <div className="brand-title">SilverHouse</div>
                        <div className="brand-subtitle">Admin Studio</div>
                    </div>
                </a>

                <div>
                    <div className="nav-label">Management Modules</div>
                    <ul className="nav-menu">
                        <li>
                            <a href="/admin" className="nav-item">
                                <i className="ph-bold ph-database"></i>
                                <span>Product Studio</span>
                            </a>
                        </li>
                        <li>
                            <a href="/catalog" className="nav-item">
                                <i className="ph-bold ph-squares-four"></i>
                                <span>Inventory Catalog</span>
                            </a>
                        </li>
                        <li>
                            <a href="/custom-orders" className="nav-item">
                                <i className="ph-bold ph-paint-brush-household"></i>
                                <span>Custom Orders</span>
                            </a>
                        </li>
                        <li>
                            <a href="/analytics" className="nav-item active">
                                <i className="ph-bold ph-chart-line-up"></i>
                                <span>Analytics & P&L</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <div>
                    <div className="nav-label">Executive Shortcuts</div>
                    <ul className="nav-menu">
                        <li className="nav-item" onClick={() => window.location.href = '/custom-orders'}>
                            <i className="ph-bold ph-bell-ringing"></i>
                            <span>Review Pending Quotes</span>
                        </li>
                        <li className="nav-item" onClick={() => window.location.href = '/catalog'}>
                            <i className="ph-bold ph-currency-inr"></i>
                            <span>Pricing & Margins</span>
                        </li>
                    </ul>
                </div>
            </aside>

            {/* MAIN WRAPPER */}
            <main className="main-wrapper">
                <header className="top-bar">
                    <div className="title-box">
                        <h1>Financial Analytics & P&L</h1>
                        <p>Enterprise margin metrics, labour cost analysis, and custom orders conversion ratio</p>
                    </div>
                    <div className="top-actions">
                        <button className="btn-refresh" onClick={loadAnalytics}>
                            <i className="ph-bold ph-arrows-clockwise"></i> Refresh Metrics
                        </button>
                        <button className="btn-theme" onClick={toggleTheme} title="Toggle Theme">
                            <i className={`ph-bold ${theme === 'dark' ? 'ph-sun' : 'ph-moon'}`} id="themeIcon"></i>
                        </button>
                    </div>
                </header>

                <section className="content-scroll">
                    {/* 1. KPI CARDS STRIP */}
                    <div className="kpi-grid">
                        {/* Potential Catalog Revenue */}
                        <div className="kpi-card">
                            <div className="kpi-header">
                                <span className="kpi-title">Catalog Selling Value</span>
                                <div className="kpi-icon-wrap" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
                                    <i className="ph-bold ph-currency-inr"></i>
                                </div>
                            </div>
                            <div className="kpi-value">{formatINR(pnl.potentialRevenue)}</div>
                            <div className="kpi-footer">
                                <span>Total catalog products: <strong>{pnl.totalProducts || 0}</strong></span>
                            </div>
                        </div>

                        {/* Total Costs (Actual + Labour) */}
                        <div className="kpi-card">
                            <div className="kpi-header">
                                <span className="kpi-title">Total Product Costs</span>
                                <div className="kpi-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                                    <i className="ph-bold ph-money"></i>
                                </div>
                            </div>
                            <div className="kpi-value">{formatINR(pnl.totalCost)}</div>
                            <div className="kpi-footer">
                                <span>Material: <strong>{formatINR(pnl.actualMaterialCost)}</strong> | Labour: <strong>{formatINR(pnl.labourCost)}</strong></span>
                            </div>
                        </div>

                        {/* Gross Profit Margin */}
                        <div className="kpi-card">
                            <div className="kpi-header">
                                <span className="kpi-title">Catalog Gross Margin</span>
                                <div className="kpi-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                                    <i className="ph-bold ph-trend-up"></i>
                                </div>
                            </div>
                            <div className="kpi-value">{formatINR(pnl.grossMargin)}</div>
                            <div className="kpi-footer">
                                <span className="trend-pill trend-up">{pnl.marginPercentage || 0}%</span>
                                <span>Overall catalog profit margin</span>
                            </div>
                        </div>

                        {/* Custom Orders Conversion */}
                        <div className="kpi-card">
                            <div className="kpi-header">
                                <span className="kpi-title">Custom Orders Volume</span>
                                <div className="kpi-icon-wrap" style={{ background: 'rgba(217, 119, 6, 0.1)', color: 'var(--accent)' }}>
                                    <i className="ph-bold ph-paint-brush"></i>
                                </div>
                            </div>
                            <div className="kpi-value">{custom.total || 0}</div>
                            <div className="kpi-footer">
                                <span className="trend-pill trend-up">{custom.acceptanceRate || 0}% Accepted</span>
                                <span>{custom.processing || 0} pending</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. VISUAL CHARTS GRID */}
                    <div className="charts-grid">
                        {/* CHART 1: P&L Cost Structure */}
                        <div className="chart-card">
                            <div className="chart-header">
                                <div>
                                    <div className="chart-title">
                                        <i className="ph-bold ph-scales" style={{ color: 'var(--primary)' }}></i>
                                        P&L Margin & Cost Structure
                                    </div>
                                    <div className="chart-subtitle">Selling price vs. silver material cost vs. artisan labour cost</div>
                                </div>
                            </div>
                            <div className="chart-canvas-wrap">
                                <canvas ref={pnlChartRef}></canvas>
                            </div>
                        </div>

                        {/* CHART 2: Custom Orders Status */}
                        <div className="chart-card">
                            <div className="chart-header">
                                <div>
                                    <div className="chart-title">
                                        <i className="ph-bold ph-chart-pie" style={{ color: 'var(--accent)' }}></i>
                                        Custom Orders Status Ratio
                                    </div>
                                    <div className="chart-subtitle">Accepted vs Rejected vs Processing quotation pipeline</div>
                                </div>
                            </div>
                            <div className="chart-canvas-wrap">
                                <canvas ref={customStatusChartRef}></canvas>
                            </div>
                        </div>

                        {/* CHART 3: Custom Requests by Category */}
                        <div className="chart-card">
                            <div className="chart-header">
                                <div>
                                    <div className="chart-title">
                                        <i className="ph-bold ph-crown" style={{ color: '#a855f7' }}></i>
                                        Custom Requests by Category
                                    </div>
                                    <div className="chart-subtitle">Mukhut, Jhalar, Thakurji ka Saman & Temple Things volume</div>
                                </div>
                            </div>
                            <div className="chart-canvas-wrap">
                                <canvas ref={customCategoryChartRef}></canvas>
                            </div>
                        </div>

                        {/* CHART 4: Category Profitability */}
                        <div className="chart-card">
                            <div className="chart-header">
                                <div>
                                    <div className="chart-title">
                                        <i className="ph-bold ph-chart-bar" style={{ color: 'var(--success)' }}></i>
                                        Category Profitability Margins
                                    </div>
                                    <div className="chart-subtitle">Selling price vs. gross profit across jewellery lines</div>
                                </div>
                            </div>
                            <div className="chart-canvas-wrap">
                                <canvas ref={categoryProfitChartRef}></canvas>
                            </div>
                        </div>
                    </div>

                    {/* 3. RECENT CUSTOM ORDERS TABLE */}
                    <div className="table-card">
                        <div className="chart-header">
                            <div>
                                <div className="chart-title">
                                    <i className="ph-bold ph-clock-counter-clockwise"></i>
                                    Recent Bespoke Custom Orders
                                </div>
                                <div className="chart-subtitle">Latest custom artisanal requests and quotation updates</div>
                            </div>
                            <a href="/custom-orders" style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
                                View All Custom Orders &rarr;
                            </a>
                        </div>

                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order #</th>
                                        <th>Category</th>
                                        <th>Customer</th>
                                        <th>Contact</th>
                                        <th>Quoted Price</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                                {loading ? 'Loading analytics data...' : 'No recent custom orders recorded.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        recentOrders.map((o) => {
                                            const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short'
                                            }) : '-';

                                            return (
                                                <tr key={o.order_id}>
                                                    <td><strong>{o.order_number}</strong></td>
                                                    <td><span style={{ fontWeight: 700, color: 'var(--accent)' }}>{o.custom_category || 'Artisanal'}</span></td>
                                                    <td>{o.customer_name || 'Anonymous'}</td>
                                                    <td>{o.customer_phone || '-'}</td>
                                                    <td><strong>{formatINR(o.final_payable)}</strong></td>
                                                    <td><span className={`badge-status status-${o.confirm}`}>{o.confirm}</span></td>
                                                    <td>{dateStr}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

if (typeof window !== 'undefined' && document.getElementById('root')) {
    const rootElement = document.getElementById('root');
    if (window.ReactDOM && window.ReactDOM.createRoot) {
        window.ReactDOM.createRoot(rootElement).render(<AnalyticsDashboard />);
    }
}
