import React, { useState, useEffect } from 'react';

export default function CustomOrders() {
    const [theme, setTheme] = useState('light');
    const [allOrders, setAllOrders] = useState([]);
    const [activeStatus, setActiveStatus] = useState('all');
    const [activeCategory, setActiveCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [lightboxImg, setLightboxImg] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Local form state for prices and statuses on cards
    const [orderEdits, setOrderEdits] = useState({});

    useEffect(() => {
        const savedTheme = localStorage.getItem('silverhouse_theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        fetchCustomOrders();
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('silverhouse_theme', newTheme);
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3200);
    };

    const fetchCustomOrders = async () => {
        try {
            const res = await fetch('/api/admin/custom-orders');
            const data = await res.json();
            if (data.success && Array.isArray(data.orders)) {
                setAllOrders(data.orders);
                // Initialize editable map
                const edits = {};
                data.orders.forEach(o => {
                    edits[o.order_id] = {
                        price: o.final_payable || 0,
                        status: o.confirm || 'processing'
                    };
                });
                setOrderEdits(edits);
            } else {
                showToast(data.error || 'Failed to fetch custom orders', 'error');
            }
        } catch (err) {
            console.error('Error fetching custom orders:', err);
            showToast('Network error while fetching custom orders', 'error');
        }
    };

    const handlePriceChange = (orderId, val) => {
        setOrderEdits(prev => ({
            ...prev,
            [orderId]: { ...prev[orderId], price: val }
        }));
    };

    const handleStatusChange = (orderId, val) => {
        setOrderEdits(prev => ({
            ...prev,
            [orderId]: { ...prev[orderId], status: val }
        }));
    };

    const updateCustomOrder = async (orderId) => {
        const edit = orderEdits[orderId] || {};
        const newPrice = parseFloat(edit.price) || 0;
        const newStatus = edit.status || 'processing';

        if (!['processing', 'rejected', 'accepted'].includes(newStatus)) {
            showToast("Status must be 'processing', 'rejected', or 'accepted'", 'error');
            return;
        }

        setUpdatingId(orderId);
        try {
            const res = await fetch(`/api/admin/custom-orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    confirm: newStatus,
                    final_payable: newPrice
                })
            });

            const data = await res.json();
            if (data.success) {
                showToast(`Order #${orderId} marked as '${newStatus}' with price ₹${newPrice}. Customer notified!`, 'success');
                setAllOrders(prev => prev.map(o => {
                    if (o.order_id === orderId) {
                        return { ...o, confirm: newStatus, final_payable: newPrice };
                    }
                    return o;
                }));
            } else {
                showToast(data.error || 'Failed to update order', 'error');
            }
        } catch (err) {
            console.error('Update error:', err);
            showToast('Failed to connect to server', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const countAll = allOrders.length;
    const countProcessing = allOrders.filter(o => o.confirm === 'processing').length;
    const countAccepted = allOrders.filter(o => o.confirm === 'accepted').length;
    const countRejected = allOrders.filter(o => o.confirm === 'rejected').length;

    const query = searchQuery.trim().toLowerCase();
    const filteredOrders = allOrders.filter(o => {
        if (activeStatus !== 'all' && o.confirm !== activeStatus) return false;
        if (activeCategory && o.custom_category !== activeCategory) return false;
        if (query) {
            const matchName = (o.customer_name || '').toLowerCase().includes(query);
            const matchPhone = (o.customer_phone || '').toLowerCase().includes(query);
            const matchOrder = (o.order_number || '').toLowerCase().includes(query);
            const matchCategory = (o.custom_category || '').toLowerCase().includes(query);
            const matchDesc = (o.description || '').toLowerCase().includes(query);
            if (!matchName && !matchPhone && !matchOrder && !matchCategory && !matchDesc) return false;
        }
        return true;
    });

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

                .filter-strip {
                    padding: 14px 32px;
                    background: var(--surface);
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .status-pills {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .status-pill {
                    padding: 6px 14px;
                    border-radius: 20px;
                    border: 1px solid var(--border);
                    background: var(--surface-card);
                    color: var(--text-muted);
                    font-size: 12.5px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: var(--transition);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .status-pill:hover {
                    background: var(--surface-hover);
                    color: var(--text-main);
                }

                .status-pill.active {
                    background: var(--text-main);
                    color: var(--surface);
                    border-color: var(--text-main);
                }

                .search-box {
                    position: relative;
                    min-width: 280px;
                }

                .search-box input {
                    width: 100%;
                    padding: 8px 14px 8px 36px;
                    border-radius: 10px;
                    border: 1px solid var(--border);
                    background: var(--surface-card);
                    color: var(--text-main);
                    font-size: 13px;
                    outline: none;
                    transition: var(--transition);
                }

                .search-box input:focus {
                    border-color: var(--primary);
                    background: var(--surface);
                    box-shadow: 0 0 0 3px var(--primary-glow);
                }

                .search-box i {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                    font-size: 16px;
                }

                .content-scroll {
                    flex: 1;
                    padding: 24px 32px;
                    overflow-y: auto;
                }

                .orders-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(460px, 1fr));
                    gap: 20px;
                }

                @media (max-width: 768px) {
                    .orders-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .order-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    padding: 20px;
                    box-shadow: var(--card-shadow);
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    transition: var(--transition);
                    position: relative;
                }

                .order-card:hover {
                    border-color: var(--border-focus);
                    transform: translateY(-2px);
                }

                .card-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 12px;
                }

                .order-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }

                .order-number {
                    font-size: 15px;
                    font-weight: 800;
                    color: var(--text-main);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .order-date {
                    font-size: 11.5px;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                .badge {
                    padding: 4px 10px;
                    border-radius: 8px;
                    font-size: 11.5px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.4px;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                }

                .badge-processing {
                    background: var(--warning-bg);
                    color: var(--warning);
                    border: 1px solid rgba(245, 158, 11, 0.3);
                }

                .badge-accepted {
                    background: var(--success-bg);
                    color: var(--success);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                }

                .badge-rejected {
                    background: var(--danger-bg);
                    color: var(--danger);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }

                .category-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 4px 10px;
                    background: rgba(217, 119, 6, 0.12);
                    color: var(--accent);
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    width: fit-content;
                }

                .customer-box {
                    background: var(--surface-card);
                    border-radius: 10px;
                    padding: 12px 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    font-size: 12.5px;
                }

                .customer-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-main);
                }

                .customer-row i {
                    color: var(--text-muted);
                    font-size: 15px;
                }

                .customer-row a {
                    color: var(--primary);
                    text-decoration: none;
                    font-weight: 600;
                }

                .customer-row a:hover {
                    text-decoration: underline;
                }

                .desc-box {
                    font-size: 13px;
                    line-height: 1.5;
                    color: var(--text-main);
                    background: var(--surface-card);
                    border-left: 3px solid var(--primary);
                    padding: 10px 14px;
                    border-radius: 0 8px 8px 0;
                    white-space: pre-wrap;
                    max-height: 120px;
                    overflow-y: auto;
                }

                .images-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .images-title {
                    font-size: 11.5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .images-strip {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding-bottom: 4px;
                }

                .image-thumb {
                    width: 72px;
                    height: 72px;
                    border-radius: 8px;
                    object-fit: cover;
                    border: 1px solid var(--border);
                    cursor: pointer;
                    transition: var(--transition);
                    flex-shrink: 0;
                    background: var(--surface-card);
                }

                .image-thumb:hover {
                    transform: scale(1.05);
                    border-color: var(--primary);
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
                }

                .no-images {
                    font-size: 12px;
                    color: var(--text-muted);
                    font-style: italic;
                }

                .action-box {
                    border-top: 1px solid var(--border);
                    padding-top: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .price-group {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .price-group label {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-muted);
                }

                .price-input {
                    width: 110px;
                    padding: 7px 10px;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    background: var(--surface-card);
                    color: var(--text-main);
                    font-size: 13px;
                    font-weight: 700;
                    outline: none;
                    transition: var(--transition);
                }

                .price-input:focus {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 2px var(--primary-glow);
                }

                .status-select {
                    padding: 7px 10px;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    background: var(--surface-card);
                    color: var(--text-main);
                    font-size: 12.5px;
                    font-weight: 700;
                    outline: none;
                    cursor: pointer;
                    transition: var(--transition);
                }

                .status-select:focus {
                    border-color: var(--primary);
                }

                .btn-update {
                    padding: 7px 14px;
                    background: var(--primary);
                    color: #ffffff;
                    border: none;
                    border-radius: 8px;
                    font-size: 12.5px;
                    font-weight: 700;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    transition: var(--transition);
                }

                .btn-update:hover {
                    background: var(--primary-hover);
                    box-shadow: 0 4px 10px var(--primary-glow);
                }

                .btn-update:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .empty-state {
                    padding: 60px 20px;
                    text-align: center;
                    color: var(--text-muted);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }

                .empty-state i {
                    font-size: 48px;
                    color: var(--text-muted);
                    opacity: 0.5;
                }

                .lightbox-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.85);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .lightbox-modal.active {
                    display: flex;
                }

                .lightbox-content {
                    position: relative;
                    max-width: 90vw;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .lightbox-img {
                    max-width: 100%;
                    max-height: 85vh;
                    border-radius: 10px;
                    object-fit: contain;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                }

                .lightbox-close {
                    position: absolute;
                    top: -40px;
                    right: 0;
                    background: none;
                    border: none;
                    color: #ffffff;
                    font-size: 28px;
                    cursor: pointer;
                }

                .toast {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    padding: 12px 20px;
                    background: var(--surface);
                    color: var(--text-main);
                    border-left: 4px solid var(--primary);
                    border-radius: 8px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    font-size: 13.5px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 2000;
                    transform: translateY(100px);
                    opacity: 0;
                    transition: var(--transition);
                }

                .toast.show {
                    transform: translateY(0);
                    opacity: 1;
                }

                .toast-success {
                    border-left-color: var(--success);
                }

                .toast-error {
                    border-left-color: var(--danger);
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
                            <a href="/custom-orders" className="nav-item active">
                                <i className="ph-bold ph-paint-brush-household"></i>
                                <span>Custom Orders</span>
                            </a>
                        </li>
                        <li>
                            <a href="/analytics" className="nav-item">
                                <i className="ph-bold ph-chart-line-up"></i>
                                <span>Analytics & P&L</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <div>
                    <div className="nav-label">Custom & Bespoke Categories</div>
                    <ul className="nav-menu" id="categoryNavMenu">
                        {[
                            { name: 'Yatra Lockets', label: 'Yatra Lockets & Shrines', icon: 'ph-compass' },
                            { name: 'Mukhut', label: 'Mukhut', icon: 'ph-crown' },
                            { name: 'Jhalar', label: 'Jhalar', icon: 'ph-sparkle' },
                            { name: 'Thakurji ka saman', label: 'Thakurji ka saman', icon: 'ph-hands-praying' },
                            { name: 'Temple things', label: 'Temple Things', icon: 'ph-church' }
                        ].map((cat) => (
                            <li
                                key={cat.name}
                                className={`nav-item ${activeCategory === cat.name ? 'active' : ''}`}
                                onClick={() => setActiveCategory(activeCategory === cat.name ? '' : cat.name)}
                            >
                                <i className={`ph-bold ${cat.icon}`}></i>
                                <span>{cat.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* MAIN WRAPPER */}
            <main className="main-wrapper">
                {/* TOP BAR */}
                <header className="top-bar">
                    <div className="title-box">
                        <h1>Custom & Bespoke Orders</h1>
                        <p>Unified management for Yatra Lockets, Mukhut, Jhalar, Thakurji ka Saman & Temple Things</p>
                    </div>
                    <div className="top-actions">
                        <button className="btn-theme" onClick={toggleTheme} title="Toggle Theme">
                            <i className={`ph-bold ${theme === 'dark' ? 'ph-sun' : 'ph-moon'}`} id="themeIcon"></i>
                        </button>
                    </div>
                </header>

                {/* FILTER STRIP */}
                <section className="filter-strip">
                    <div className="status-pills">
                        <button
                            className={`status-pill ${activeStatus === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveStatus('all')}
                        >
                            <i className="ph-bold ph-list-bullets"></i> All Orders (<span>{countAll}</span>)
                        </button>
                        <button
                            className={`status-pill ${activeStatus === 'processing' ? 'active' : ''}`}
                            onClick={() => setActiveStatus('processing')}
                        >
                            <i className="ph-bold ph-clock"></i> Processing (<span>{countProcessing}</span>)
                        </button>
                        <button
                            className={`status-pill ${activeStatus === 'accepted' ? 'active' : ''}`}
                            onClick={() => setActiveStatus('accepted')}
                        >
                            <i className="ph-bold ph-check-circle"></i> Accepted (<span>{countAccepted}</span>)
                        </button>
                        <button
                            className={`status-pill ${activeStatus === 'rejected' ? 'active' : ''}`}
                            onClick={() => setActiveStatus('rejected')}
                        >
                            <i className="ph-bold ph-x-circle"></i> Rejected (<span>{countRejected}</span>)
                        </button>
                    </div>

                    <div className="search-box">
                        <i className="ph-bold ph-magnifying-glass"></i>
                        <input
                            type="text"
                            placeholder="Search by customer, phone, order #..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </section>

                {/* CARDS SCROLL */}
                <section className="content-scroll">
                    <div className="orders-grid">
                        {filteredOrders.length === 0 ? (
                            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                                <i className="ph-bold ph-tray"></i>
                                <h3>No Custom Orders Found</h3>
                                <p>No orders match the selected filters or search keyword.</p>
                            </div>
                        ) : (
                            filteredOrders.map(o => {
                                const dateStr = o.created_at ? new Date(o.created_at).toLocaleString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                }) : 'Recently';

                                let categoryIcon = 'ph-gem';
                                if (o.custom_category === 'Yatra Lockets' || (o.custom_category && o.custom_category.toLowerCase().includes('yatra'))) categoryIcon = 'ph-compass';
                                else if (o.custom_category === 'Mukhut') categoryIcon = 'ph-crown';
                                else if (o.custom_category === 'Jhalar') categoryIcon = 'ph-sparkle';
                                else if (o.custom_category === 'Thakurji ka saman') categoryIcon = 'ph-hands-praying';
                                else if (o.custom_category === 'Temple things') categoryIcon = 'ph-church';

                                const currentEdit = orderEdits[o.order_id] || {
                                    price: o.final_payable || 0,
                                    status: o.confirm || 'processing'
                                };

                                return (
                                    <div className="order-card" key={o.order_id}>
                                        <div className="card-header">
                                            <div className="order-meta">
                                                <span className="order-number">
                                                    <i className="ph-bold ph-receipt"></i> {o.order_number}
                                                </span>
                                                <span className="order-date">{dateStr}</span>
                                            </div>
                                            <span className={`badge badge-${o.confirm}`}>
                                                <i className={`ph-bold ${o.confirm === 'accepted' ? 'ph-check-circle' : (o.confirm === 'rejected' ? 'ph-x-circle' : 'ph-clock')}`}></i>
                                                {o.confirm}
                                            </span>
                                        </div>

                                        <div className="category-tag">
                                            <i className={`ph-bold ${categoryIcon}`}></i>
                                            <span>{o.custom_category || 'Artisanal Silver'}</span>
                                        </div>

                                        <div className="customer-box">
                                            <div className="customer-row">
                                                <i className="ph-bold ph-user"></i>
                                                <strong>{o.customer_name || 'Anonymous Customer'}</strong>
                                            </div>
                                            <div className="customer-row">
                                                <i className="ph-bold ph-phone"></i>
                                                <span>{o.customer_phone || 'N/A'}</span>
                                                {o.customer_phone && (
                                                    <a
                                                        href={`https://wa.me/${o.customer_phone.replace(/[^0-9]/g, '')}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#10b981' }}
                                                    >
                                                        <i className="ph-bold ph-whatsapp-logo"></i> WhatsApp
                                                    </a>
                                                )}
                                            </div>
                                            {o.customer_email && (
                                                <div className="customer-row">
                                                    <i className="ph-bold ph-envelope"></i>
                                                    <a href={`mailto:${o.customer_email}`}>{o.customer_email}</a>
                                                </div>
                                            )}
                                        </div>

                                        <div className="desc-box">
                                            {o.description || 'No detailed instructions provided.'}
                                        </div>

                                        <div className="images-section">
                                            <span className="images-title">
                                                <i className="ph-bold ph-images"></i> Customer Inspiration Images ({Array.isArray(o.images) ? o.images.length : 0})
                                            </span>
                                            <div className="images-strip">
                                                {Array.isArray(o.images) && o.images.length > 0 ? (
                                                    o.images.map((img, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={img}
                                                            alt="Inspiration"
                                                            className="image-thumb"
                                                            onClick={() => setLightboxImg(img)}
                                                            onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.svg'; }}
                                                        />
                                                    ))
                                                ) : (
                                                    <span className="no-images">No inspiration photos uploaded</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="action-box">
                                            <div className="price-group">
                                                <label>Quoted Price (₹):</label>
                                                <input
                                                    type="number"
                                                    step="100"
                                                    min="0"
                                                    className="price-input"
                                                    value={currentEdit.price}
                                                    onChange={(e) => handlePriceChange(o.order_id, e.target.value)}
                                                    placeholder="₹ Quotation"
                                                    title="Price displayed to customer upon approval"
                                                />
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <select
                                                    className="status-select"
                                                    value={currentEdit.status}
                                                    onChange={(e) => handleStatusChange(o.order_id, e.target.value)}
                                                >
                                                    <option value="processing">⏳ Processing</option>
                                                    <option value="accepted">✅ Approved</option>
                                                    <option value="rejected">❌ Rejected</option>
                                                </select>

                                                <button
                                                    className="btn-update"
                                                    onClick={() => updateCustomOrder(o.order_id)}
                                                    disabled={updatingId === o.order_id}
                                                    title="Save decision, quotation & notify customer"
                                                >
                                                    {updatingId === o.order_id ? (
                                                        <>
                                                            <i className="ph-bold ph-spinner-gap" style={{ animation: 'spin 1s linear infinite' }}></i> Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="ph-bold ph-paper-plane-tilt"></i> Save & Notify
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>
            </main>

            {/* LIGHTBOX MODAL */}
            {lightboxImg && (
                <div className="lightbox-modal active" onClick={() => setLightboxImg(null)}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setLightboxImg(null)}>&times;</button>
                        <img src={lightboxImg} alt="Full view" className="lightbox-img" />
                    </div>
                </div>
            )}

            {/* TOAST NOTIFICATION */}
            <div className={`toast ${toast.show ? 'show' : ''} ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
                <i className={`ph-bold ${toast.type === 'success' ? 'ph-check-circle' : 'ph-warning-circle'}`}></i>
                <span>{toast.message}</span>
            </div>
        </div>
    );
}

if (typeof window !== 'undefined' && document.getElementById('root')) {
    const rootElement = document.getElementById('root');
    if (window.ReactDOM && window.ReactDOM.createRoot) {
        window.ReactDOM.createRoot(rootElement).render(<CustomOrders />);
    }
}
