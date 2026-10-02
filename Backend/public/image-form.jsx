import React, { useState, useEffect } from 'react';

export default function ImageForm() {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const editId = urlParams.get('id');

    const [theme, setTheme] = useState('light');
    const [imageUrl, setImageUrl] = useState('');
    const [previewSrc, setPreviewSrc] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', isError: false });

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);

        if (editId) {
            loadExistingImageData(editId);
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

    const handleUrlChange = (url) => {
        setImageUrl(url);
        if (url && url.trim().length > 0) {
            setPreviewSrc(url.startsWith('/') ? window.location.origin + url : url);
        } else {
            setPreviewSrc('');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        showToast('Uploading image to server...', false);
        const formData = new FormData();
        formData.append('imageFile', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            if (result.success && result.imageUrl) {
                handleUrlChange(result.imageUrl);
                showToast('File uploaded! Click Save Image to write URL to database.');
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (err) {
            showToast('Upload failed: ' + err.message, true);
        }
    };

    const loadExistingImageData = async (id) => {
        try {
            const res = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proc_name: 'image', opr: 'SELECT', condition: String(id) })
            });
            const result = await res.json();
            const row = (result.data && result.data.length > 0) ? result.data[0] : null;

            if (row && row.image_url) {
                handleUrlChange(row.image_url);
            }
        } catch (err) {
            showToast('Error loading record: ' + err.message, true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const table_values = {
            image_url: imageUrl.trim()
        };

        const payload = {
            proc_name: 'image',
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
            if (!result.success) throw new Error(result.status || result.error || 'Failed to save');

            let targetId = editId;
            if (!targetId && result.data && result.data.length > 0) {
                targetId = result.data[0].NewImageId || result.data[0].image_id || table_values.image_id;
            }
            const action = editId ? 'edit' : 'add';

            showToast('Image URL saved successfully!');
            setTimeout(() => {
                window.location.href = `/api/data?entity=image${targetId ? `&highlightId=${targetId}&action=${action}` : ''}`;
            }, 1000);
        } catch (err) {
            showToast(err.message, true);
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--bg)', color: 'var(--text-main)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
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
                    max-width: 580px;
                    margin: 0 auto 40px auto;
                    animation: fadeIn 0.3s ease-in-out;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 18px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-group label {
                    font-size: 12.5px;
                    font-weight: 600;
                    color: var(--text-muted);
                }

                .form-group input {
                    background: var(--input-bg);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 11px 14px;
                    color: var(--input-text);
                    font-size: 13.5px;
                    outline: none;
                    transition: var(--transition);
                }

                .form-group input:focus {
                    border-color: var(--border-focus);
                    box-shadow: 0 0 0 3px var(--primary-glow);
                }

                .preview-box {
                    max-width: 100%;
                    max-height: 220px;
                    object-fit: contain;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    margin-top: 10px;
                    background: var(--surface-card);
                    padding: 4px;
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
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

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
                        <a href="/api/data?entity=product" className="nav-item">
                            <i className="ph-bold ph-shopping-bag"></i>
                            <span>Products</span>
                        </a>
                        <a href="/api/data?entity=category" className="nav-item">
                            <i className="ph-bold ph-squares-four"></i>
                            <span>Categories</span>
                        </a>
                        <a href="/api/data?entity=image" className="nav-item active">
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
                        <a href="/api/data?entity=image" className="btn btn-secondary">
                            <i className="ph-bold ph-arrow-left"></i>
                            <span>Back to Images</span>
                        </a>
                        <div className="title-box">
                            <h1>{editId ? `Edit Image (#${editId})` : 'Add Image URL'}</h1>
                            <p>{editId ? 'Update image URL' : 'Enter image URL to save into database'}</p>
                        </div>
                    </div>
                    <div>
                        <button className="btn btn-secondary" onClick={toggleTheme} title="Toggle Light / Dark Mode">
                            <i className={`ph-bold ${theme === 'dark' ? 'ph-sun' : 'ph-moon'}`}></i>
                            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                    </div>
                </header>

                <div className="content-area">
                    <div className="form-card">
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label><i className="ph-bold ph-upload-simple"></i> Upload Image File from Chrome / Device</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        style={{ padding: '10px', background: 'var(--input-bg)', border: '1px dashed var(--border)', borderRadius: '8px', width: '100%', cursor: 'pointer' }}
                                    />
                                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                        Selecting a file will upload it to your server's <code>/public/uploads</code> directory.
                                    </small>
                                </div>
                                <div className="form-group">
                                    <label>Image URL / Path *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="https://cdn.silverhouse.com/products/item.jpg or /uploads/img-123.jpg"
                                        value={imageUrl}
                                        onChange={(e) => handleUrlChange(e.target.value)}
                                    />
                                    {previewSrc && (
                                        <img
                                            src={previewSrc}
                                            alt="Preview"
                                            className="preview-box"
                                            onError={() => setPreviewSrc('')}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="form-actions">
                                <a href="/api/data?entity=image" className="btn btn-secondary">Cancel</a>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Image'}
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
        window.ReactDOM.createRoot(rootElement).render(<ImageForm />);
    }
}
