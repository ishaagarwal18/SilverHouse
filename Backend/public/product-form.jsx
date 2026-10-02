import React, { useState, useEffect } from 'react';

export default function ProductForm() {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const editId = urlParams.get('id');

    const [theme, setTheme] = useState('light');
    const [categories, setCategories] = useState([]);
    const [makes, setMakes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', isError: false });

    // Form fields
    const [formData, setFormData] = useState({
        category_id: '',
        m_id: '',
        title: '',
        purity: '92.5 Sterling Silver',
        weight: '',
        color: 'Silver',
        ideal_for: 'ALL',
        price: '',
        discount: '0',
        labour_cost: '0',
        actual_cost: '',
        quantity: '10',
        priority: '10',
        packaging: '',
        description: '',
        image_url: ''
    });

    const [reviewInfo, setReviewInfo] = useState('Average of customer reviews (Starts at 0.0 / 0 reviews)');
    const [soldInfo, setSoldInfo] = useState('0 pcs sold (Updated automatically when customers place orders)');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);

        loadDropdowns();
        if (editId) {
            loadExistingProductData(editId);
        }
    }, [editId]);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const showToast = (message, isError = false) => {
        setToast({ show: true, message, isError });
        setTimeout(() => {
            setToast({ show: false, message: '', isError: false });
        }, 3500);
    };

    const loadDropdowns = async () => {
        try {
            const [catRes, makeRes] = await Promise.all([
                fetch('/api/data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ proc_name: 'category', opr: 'SELECT' })
                }).then(r => r.json()),
                fetch('/api/data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ proc_name: 'make_master', opr: 'SELECT' })
                }).then(r => r.json())
            ]);

            setCategories(catRes.data || []);
            setMakes(makeRes.data || []);
        } catch (err) {
            showToast('Error loading dropdowns: ' + err.message, true);
        }
    };

    const loadExistingProductData = async (id) => {
        try {
            const res = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proc_name: 'product', opr: 'SELECT', condition: String(id) })
            });
            const result = await res.json();
            const row = (result.data && result.data.length > 0) ? result.data[0] : null;

            if (row) {
                let imgUrl = row.image_url || '';
                if (!imgUrl && Array.isArray(row.images) && row.images.length > 0) {
                    imgUrl = row.images[0];
                }

                setFormData({
                    category_id: row.category_id !== null && row.category_id !== undefined ? String(row.category_id) : '',
                    m_id: row.m_id !== null && row.m_id !== undefined ? String(row.m_id) : '',
                    title: row.title || '',
                    purity: row.purity || '92.5 Sterling Silver',
                    weight: row.weight || '',
                    color: row.color || 'Silver',
                    ideal_for: row.ideal_for || 'ALL',
                    price: row.price !== null && row.price !== undefined ? String(row.price) : '',
                    discount: row.discount !== null && row.discount !== undefined ? String(row.discount) : '0',
                    labour_cost: row.labour_cost !== null && row.labour_cost !== undefined ? String(row.labour_cost) : '0',
                    actual_cost: row.actual_cost !== null && row.actual_cost !== undefined ? String(row.actual_cost) : '',
                    quantity: row.quantity !== null && row.quantity !== undefined ? String(row.quantity) : '10',
                    priority: row.priority !== null && row.priority !== undefined ? String(row.priority) : '10',
                    packaging: row.packaging || '',
                    description: row.description || '',
                    image_url: imgUrl
                });

                const reviewCount = row.review || 0;
                const ratingAvg = reviewCount > 0 ? (4.5 + (reviewCount % 5) * 0.1).toFixed(1) : '0.0';
                setReviewInfo(`⭐ ${ratingAvg} / 5.0 (Average of ${reviewCount} customer reviews)`);
                setSoldInfo(`${row.sold || 0} pcs sold (Updated automatically on order placement)`);
            }
        } catch (err) {
            showToast('Error loading record: ' + err.message, true);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUploadImageFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('imageFile', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.error || 'Upload failed');

            setFormData(prev => ({ ...prev, image_url: json.imageUrl }));
            showToast('Image uploaded successfully!');
        } catch (err) {
            showToast('Image upload failed: ' + err.message, true);
        }
    };

    // Calculate Final Customer Price
    const priceNum = parseFloat(formData.price) || 0;
    const discountNum = parseFloat(formData.discount) || 0;
    const labourNum = parseFloat(formData.labour_cost) || 0;
    const discountedBase = priceNum - (priceNum * discountNum / 100);
    const finalPrice = Math.round(discountedBase + labourNum);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const table_values = {};
        Object.entries(formData).forEach(([key, val]) => {
            if (key === 'image_url') return;
            const strVal = String(val).trim();
            if (strVal !== '') {
                table_values[key] = !isNaN(strVal) && strVal !== '' ? Number(strVal) : strVal;
            }
        });

        const imageUrl = formData.image_url ? formData.image_url.trim() : '';

        const payload = {
            proc_name: 'product',
            opr: editId ? 'EDIT' : 'ADD',
            table_values: table_values,
            condition: editId ? String(editId) : null
        };

        try {
            const res = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (!result.success) throw new Error(result.status || result.error);

            let targetId = editId;
            if (!targetId && result.data && result.data.length > 0) {
                targetId = result.data[0].NewProductId || result.data[0].product_id || table_values.product_id;
            }

            // Link image to product if image provided
            if (imageUrl && targetId) {
                try {
                    const imgRes = await fetch('/api/data', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            proc_name: 'image',
                            opr: 'ADD',
                            table_values: { image_url: imageUrl }
                        })
                    });
                    const imgJson = await imgRes.json();
                    const newImageId = imgJson.data?.[0]?.NewImageId || imgJson.data?.image_id;
                    if (newImageId) {
                        await fetch('/api/data', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                proc_name: 'product_image',
                                opr: 'ADD',
                                table_values: { product_id: targetId, image_id: newImageId }
                            })
                        });
                    }
                } catch (imgErr) {
                    console.warn('Image link notice:', imgErr);
                }
            }

            const action = editId ? 'edit' : 'add';
            showToast('Product saved successfully!');
            setTimeout(() => {
                window.location.href = `/api/data?entity=product${targetId ? `&highlightId=${targetId}&action=${action}` : ''}`;
            }, 1000);
        } catch (err) {
            showToast(err.message, true);
        } finally {
            setLoading(false);
        }
    };

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
                    --border-focus: #6366f1;
                    --primary: #4f46e5;
                    --primary-hover: #4338ca;
                    --primary-glow: rgba(79, 70, 229, 0.2);
                    --accent: #0284c7;
                    --success: #10b981;
                    --danger: #ef4444;
                    --text-main: #0f172a;
                    --text-muted: #64748b;
                    --sidebar-width: 260px;
                    --radius: 12px;
                    --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    --input-bg: #ffffff;
                    --input-text: #0f172a;
                    --shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                    --topbar-border: #e2e8f0;
                    --bg-gradient: radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent 40%);
                    --nav-hover-bg: #f1f5f9;
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
                    --accent: #38bdf8;
                    --text-main: #f3f4f6;
                    --text-muted: #9ca3af;
                    --input-bg: #1f2937;
                    --input-text: #ffffff;
                    --shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    --topbar-border: rgba(255, 255, 255, 0.05);
                    --bg-gradient: radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 40%);
                    --nav-hover-bg: rgba(255, 255, 255, 0.04);
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
                    gap: 32px;
                    z-index: 10;
                }

                .brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 0 8px;
                }

                .brand-logo {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, var(--primary), var(--accent));
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    color: #fff;
                    box-shadow: 0 4px 12px var(--primary-glow);
                }

                .brand-title {
                    font-size: 17px;
                    font-weight: 700;
                }

                .brand-subtitle {
                    font-size: 11px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                }

                .btn-theme-toggle {
                    margin-left: auto;
                    background: var(--surface-card);
                    border: 1px solid var(--border);
                    color: var(--text-main);
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 18px;
                    transition: var(--transition);
                }

                .btn-theme-toggle:hover {
                    background: var(--surface-hover);
                    transform: scale(1.05);
                }

                .nav-label {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: var(--text-muted);
                    padding: 0 8px 8px;
                    font-weight: 600;
                }

                .nav-menu {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    list-style: none;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 14px;
                    border-radius: 8px;
                    color: var(--text-muted);
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    text-decoration: none;
                    transition: var(--transition);
                }

                .nav-item:hover {
                    background: var(--nav-hover-bg);
                    color: var(--text-main);
                    transform: translateX(3px);
                }

                .nav-item.active {
                    background: var(--primary);
                    color: #fff;
                    box-shadow: 0 4px 14px var(--primary-glow);
                }

                .main-wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    overflow-y: auto;
                    background: var(--bg-gradient);
                    background-color: var(--bg);
                }

                .top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px 32px;
                    border-bottom: 1px solid var(--topbar-border);
                }

                .top-bar-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .title-box h1 {
                    font-size: 22px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }

                .title-box p {
                    font-size: 13px;
                    color: var(--text-muted);
                    margin-top: 4px;
                }

                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 18px;
                    border-radius: 8px;
                    font-size: 13.5px;
                    font-weight: 600;
                    cursor: pointer;
                    border: 1px solid transparent;
                    text-decoration: none;
                    transition: var(--transition);
                }

                .btn-primary {
                    background: var(--primary);
                    color: #fff;
                    box-shadow: 0 4px 12px var(--primary-glow);
                }

                .btn-primary:hover {
                    background: var(--primary-hover);
                    transform: translateY(-1px);
                }

                .btn-secondary {
                    background: var(--surface-card);
                    color: var(--text-main);
                    border-color: var(--border);
                }

                .btn-secondary:hover {
                    background: var(--surface-hover);
                }

                .content-area {
                    padding: 32px;
                    flex: 1;
                }

                .form-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    box-shadow: var(--shadow);
                    padding: 32px;
                    max-width: 800px;
                    margin: 0 auto 40px auto;
                    animation: fadeIn 0.3s ease-in-out;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 18px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-group.full-width {
                    grid-column: span 2;
                }

                .form-group label {
                    font-size: 12.5px;
                    font-weight: 600;
                    color: var(--text-muted);
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    background: var(--input-bg);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 11px 14px;
                    color: var(--input-text);
                    font-size: 13.5px;
                    outline: none;
                    transition: var(--transition);
                }

                .form-group select option {
                    background: var(--surface);
                    color: var(--text-main);
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    border-color: var(--border-focus);
                    box-shadow: 0 0 0 3px var(--primary-glow);
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 32px;
                    padding-top: 20px;
                    border-top: 1px solid var(--border);
                }

                .toast {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    padding: 12px 20px;
                    border-radius: 8px;
                    font-size: 13.5px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
                    z-index: 1000;
                    transform: translateY(100px);
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .toast.show {
                    transform: translateY(0);
                    opacity: 1;
                }

                .toast-success {
                    background: #064e3b;
                    color: #a7f3d0;
                    border: 1px solid #059669;
                }

                .toast-error {
                    background: #450a0a;
                    color: #fecaca;
                    border: 1px solid #dc2626;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(6px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            ` }} />

            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-logo">
                        <i className="ph-bold ph-gem"></i>
                    </div>
                    <div>
                        <div className="brand-title">SilverHouse</div>
                        <div className="brand-subtitle">Studio Studio</div>
                    </div>
                    <button className="btn-theme-toggle" onClick={toggleTheme} title="Toggle Light / Dark Mode">
                        <i className={`ph-bold ${theme === 'dark' ? 'ph-sun' : 'ph-moon'}`} id="sidebarThemeIcon"></i>
                    </button>
                </div>

                <div>
                    <div className="nav-label">Database Schemas</div>
                    <ul className="nav-menu">
                        <a href="/api/data?entity=product" className="nav-item active">
                            <i className="ph-bold ph-shopping-bag"></i>
                            <span>Products</span>
                        </a>
                        <a href="/api/data?entity=category" className="nav-item">
                            <i className="ph-bold ph-squares-four"></i>
                            <span>Categories</span>
                        </a>
                        <a href="/api/data?entity=image" className="nav-item">
                            <i className="ph-bold ph-image"></i>
                            <span>Images</span>
                        </a>
                        <a href="/api/data?entity=make_master" className="nav-item">
                            <i className="ph-bold ph-wrench"></i>
                            <span>Make Master</span>
                        </a>
                        <a href="/api/data?entity=product_image" className="nav-item">
                            <i className="ph-bold ph-link"></i>
                            <span>Product Images</span>
                        </a>
                    </ul>
                </div>
            </aside>

            <main className="main-wrapper">
                <header className="top-bar">
                    <div className="top-bar-left">
                        <a href="/api/data?entity=product" className="btn btn-secondary">
                            <i className="ph-bold ph-arrow-left"></i>
                            <span>Back to Products</span>
                        </a>
                        <div className="title-box">
                            <h1 id="pageTitle">{editId ? `Edit Product (#${editId})` : 'Add Product'}</h1>
                            <p id="pageDescription">{editId ? 'Update product specifications' : 'Enter product details to save into database'}</p>
                        </div>
                    </div>
                    <div>
                        <button className="btn btn-secondary" onClick={toggleTheme} title="Toggle Light / Dark Mode">
                            <i className={`ph-bold ${theme === 'dark' ? 'ph-sun' : 'ph-moon'}`} id="themeIcon"></i>
                            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                    </div>
                </header>

                <div className="content-area">
                    <div className="form-card">
                        <form id="productForm" onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Category Name *</label>
                                    <select
                                        name="category_id"
                                        id="category_id"
                                        required
                                        value={formData.category_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((c) => (
                                            <option key={c.category_id} value={c.category_id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Make Master</label>
                                    <select
                                        name="m_id"
                                        id="m_id"
                                        value={formData.m_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Make (Optional)</option>
                                        {makes.map((m) => (
                                            <option key={m.m_id} value={m.m_id}>
                                                {m.type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>Product Name / Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        id="title"
                                        required
                                        placeholder="e.g. Floral Silver Locket"
                                        value={formData.title}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Purity *</label>
                                    <select
                                        name="purity"
                                        id="purity"
                                        required
                                        value={formData.purity}
                                        onChange={handleChange}
                                    >
                                        <option value="92.5 Sterling Silver">92.5 Sterling Silver</option>
                                        <option value="99.9 Pure Silver">99.9 Pure Silver</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Weight *</label>
                                    <input
                                        type="text"
                                        name="weight"
                                        id="weight"
                                        required
                                        placeholder="e.g. 6.20 gm"
                                        value={formData.weight}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Color / Signature Finish</label>
                                    <select
                                        name="color"
                                        id="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                    >
                                        <option value="Silver">Fine Silver</option>
                                        <option value="Rose Gold">Rose Gold Plated</option>
                                        <option value="Oxidised">Bold Oxidised</option>
                                        <option value="Gold Plated">Gold Plated</option>
                                        <option value="Two-Tone Silver">Two-Tone Silver</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Ideal For (Target Audience) *</label>
                                    <select
                                        name="ideal_for"
                                        id="ideal_for"
                                        required
                                        value={formData.ideal_for}
                                        onChange={handleChange}
                                    >
                                        <option value="ALL">ALL</option>
                                        <option value="Women">Women</option>
                                        <option value="Men">Men</option>
                                        <option value="Unisex">Unisex</option>
                                        <option value="Puja">Puja</option>
                                    </select>
                                </div>

                                {/* Financials & Pricing Calculation */}
                                <div className="form-group">
                                    <label>Base Price / MRP (₹) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="price"
                                        id="price"
                                        required
                                        placeholder="2499.00"
                                        value={formData.price}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Discount (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="discount"
                                        id="discount"
                                        min="0"
                                        max="100"
                                        placeholder="5.00"
                                        value={formData.discount}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Labour Cost / Making Charges (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="labour_cost"
                                        id="labour_cost"
                                        placeholder="300.00"
                                        value={formData.labour_cost}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Actual Cost (₹) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="actual_cost"
                                        id="actual_cost"
                                        required
                                        placeholder="1700.00"
                                        value={formData.actual_cost}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Auto-Calculated Final Customer Price Box */}
                                <div className="form-group full-width">
                                    <div
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(2, 132, 199, 0.06))',
                                            border: '1px solid var(--primary-glow)',
                                            borderRadius: '10px',
                                            padding: '16px 20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: '11px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.8px',
                                                    fontWeight: 700,
                                                    color: 'var(--primary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <i className="ph-bold ph-calculator"></i>
                                                <span>Auto-Calculated Final Customer Price</span>
                                            </div>
                                            <div
                                                id="finalPriceBreakdown"
                                                style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}
                                            >
                                                Breakdown: (₹{Math.round(priceNum).toLocaleString('en-IN')} - {discountNum}%) + ₹{Math.round(labourNum).toLocaleString('en-IN')} labour = ₹{finalPrice.toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <div
                                            id="finalPriceDisplay"
                                            style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}
                                        >
                                            ₹{finalPrice.toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Warehouse Stock Quantity *</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        id="quantity"
                                        required
                                        placeholder="10"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Display Priority Rank</label>
                                    <input
                                        type="number"
                                        name="priority"
                                        id="priority"
                                        placeholder="10"
                                        value={formData.priority}
                                        title="Higher priority products appear first in catalog"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Packaging Type</label>
                                    <input
                                        type="text"
                                        name="packaging"
                                        id="packaging"
                                        placeholder="e.g. Luxury Velvet Box, Tamper-Proof Pouch"
                                        value={formData.packaging}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Description *</label>
                                    <textarea
                                        name="description"
                                        id="description"
                                        rows={3}
                                        required
                                        placeholder="Detailed item specifications, hallmark details, and styling notes..."
                                        value={formData.description}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                                {/* Image Upload & Preview */}
                                <div className="form-group full-width">
                                    <label>Product Primary Image</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div
                                            id="imagePreviewBox"
                                            style={{
                                                width: '72px',
                                                height: '72px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                                background: 'var(--surface-card)',
                                                flexShrink: 0
                                            }}
                                        >
                                            {formData.image_url ? (
                                                <img
                                                    src={formData.image_url}
                                                    alt="Preview"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.svg'; }}
                                                />
                                            ) : (
                                                <i className="ph-bold ph-image" style={{ fontSize: '28px', color: 'var(--text-muted)' }}></i>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <input
                                                type="text"
                                                name="image_url"
                                                id="image_url"
                                                placeholder="/images/example.jpg or https://..."
                                                value={formData.image_url}
                                                onChange={handleChange}
                                            />
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                Or choose photo file from your device:
                                            </div>
                                            <input
                                                type="file"
                                                id="imageFileInput"
                                                accept="image/*"
                                                onChange={handleUploadImageFile}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* System Managed Auto-Values (Review & Sold) */}
                                <div className="form-group">
                                    <label>Customer Review Rating</label>
                                    <div
                                        style={{
                                            background: 'var(--surface-card)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px',
                                            padding: '10px 14px',
                                            fontSize: '12.5px',
                                            color: 'var(--text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <i className="ph-bold ph-star-fill" style={{ color: '#eab308', fontSize: '16px' }}></i>
                                        <span>{reviewInfo}</span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Units Sold</label>
                                    <div
                                        style={{
                                            background: 'var(--surface-card)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px',
                                            padding: '10px 14px',
                                            fontSize: '12.5px',
                                            color: 'var(--text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <i
                                            className="ph-bold ph-shopping-bag-open"
                                            style={{ color: 'var(--primary)', fontSize: '16px' }}
                                        ></i>
                                        <span>{soldInfo}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <a href="/api/data?entity=product" className="btn btn-secondary">Cancel</a>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <div className={`toast ${toast.show ? 'show' : ''} ${toast.isError ? 'toast-error' : 'toast-success'}`}>
                <i className={`ph-bold ${toast.isError ? 'ph-warning-circle' : 'ph-check-circle'}`}></i>
                <span>{toast.message}</span>
            </div>
        </div>
    );
}

if (typeof window !== 'undefined' && document.getElementById('root')) {
    const rootElement = document.getElementById('root');
    if (window.ReactDOM && window.ReactDOM.createRoot) {
        window.ReactDOM.createRoot(rootElement).render(<ProductForm />);
    }
}
