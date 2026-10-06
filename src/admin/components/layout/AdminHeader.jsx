import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, Crown, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAdminUI } from '../../context/AdminUIContext';
import { getEntityConfig } from '../../config/entities';

/** Maps the current admin path to a short section label for the top bar. */
function sectionLabel(pathname) {
  const parts = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'catalog') return ['Product Catalog'];
  if (parts[0] === 'custom-orders') return ['Custom Orders'];
  if (parts[0] === 'analytics') return ['Analytics & P&L'];
  if (parts[0] === 'data' && parts[1]) {
    const crumbs = ['Database', getEntityConfig(parts[1]).plural];
    if (parts[2] === 'new') crumbs.push('Add');
    else if (parts[3] === 'edit') crumbs.push(`Edit #${parts[2]}`);
    return crumbs;
  }
  return ['Admin Studio'];
}

/** Sticky top bar shared by every admin page: menu toggle, breadcrumb, theme toggle and account menu. */
export default function AdminHeader({ onOpenSidebar }) {
  const { pathname } = useLocation();
  const { user, logout } = useAdminAuth();
  const { theme, toggleTheme } = useAdminUI();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const crumbs = sectionLabel(pathname);
  const name = user?.fullName || user?.full_name || 'Admin';
  const initials = name.split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = e => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ad-border bg-ad-surface/85 px-4 backdrop-blur-md sm:px-6">
      <button type="button" onClick={onOpenSidebar} className="-ml-1 rounded-lg p-2 text-ad-text hover:bg-ad-card lg:hidden cursor-pointer" aria-label="Open navigation">
        <Menu className="w-5 h-5" />
      </button>

      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px]">
        {crumbs.map((c, i) => (
          <React.Fragment key={c}>
            {i > 0 && <span className="hidden text-ad-muted sm:inline">/</span>}
            <span className={`truncate ${i === crumbs.length - 1 ? 'font-bold text-ad-text' : 'hidden text-ad-muted sm:inline'}`}>{c}</span>
          </React.Fragment>
        ))}
      </nav>

      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-lg border border-ad-border bg-ad-card p-2 text-ad-text hover:bg-ad-hover cursor-pointer"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle light / dark mode"
      >
        {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
      </button>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen(o => !o)}
          className="flex items-center gap-2 rounded-lg border border-ad-warning/35 bg-ad-warning/10 py-1.5 pl-1.5 pr-2 text-ad-text hover:bg-ad-warning/15 cursor-pointer"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ad-warning text-[11px] font-extrabold text-slate-900">{initials || 'A'}</span>
          <span className="hidden max-w-36 truncate text-xs font-bold sm:block">{name}</span>
          <ChevronDown className="w-4 h-4 text-ad-muted" />
        </button>
        {menuOpen && (
          <div role="menu" className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-ad-border bg-ad-surface shadow-xl">
            <div className="border-b border-ad-border px-4 py-3">
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-ad-text"><Crown className="w-4 h-4 text-ad-warning" /> {name}</div>
              <div className="mt-0.5 text-xs text-ad-muted">{user?.phone ? `${user.phone} · ` : ''}Administrator</div>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-semibold text-ad-danger hover:bg-ad-danger/10 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
