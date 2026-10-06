import React from 'react';
import { NavLink } from 'react-router-dom';
import { ExternalLink, Gem, X } from 'lucide-react';
import { ADMIN_NAV } from '../../config/entities';
import { useAdminUI } from '../../context/AdminUIContext';

/**
 * Primary Admin Studio navigation. Docked on large screens, an off-canvas
 * drawer (toggled from the header) below the `lg` breakpoint.
 */
export default function AdminSidebar({ open, onClose }) {
  const { pendingCustomOrders } = useAdminUI();
  const badges = { pendingCustomOrders };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-ad-border bg-ad-surface transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-64 lg:max-w-none lg:translate-x-0 ${open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
        aria-label="Admin navigation"
      >
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <NavLink to="/admin" onClick={onClose} className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-ad-primary to-ad-accent text-white shadow-md shadow-ad-primary/30">
              <Gem className="w-5 h-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-extrabold tracking-tight text-ad-text">SilverHouse</span>
              <span className="block text-[10.5px] font-bold uppercase tracking-[0.14em] text-ad-muted">Admin Studio</span>
            </span>
          </NavLink>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-ad-muted hover:bg-ad-card hover:text-ad-text lg:hidden cursor-pointer" aria-label="Close navigation">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="ad-scroll flex-1 overflow-y-auto px-3 pb-4">
          {ADMIN_NAV.map(group => (
            <div key={group.label} className="mt-4 first:mt-1">
              <div className="px-3 pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-ad-muted">{group.label}</div>
              <ul className="flex flex-col gap-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const badgeCount = item.badge ? badges[item.badge] : 0;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${isActive
                            ? 'bg-ad-primary/10 text-ad-primary'
                            : 'text-ad-muted hover:bg-ad-card hover:text-ad-text'}`
                        }
                      >
                        <Icon className="w-4.5 h-4.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {badgeCount > 0 && (
                          <span className="ml-auto rounded-full bg-ad-warning px-2 py-0.5 text-[10.5px] font-extrabold text-slate-900">{badgeCount}</span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-ad-border p-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold text-ad-muted hover:bg-ad-card hover:text-ad-text"
          >
            <ExternalLink className="w-4.5 h-4.5" />
            <span>View Storefront</span>
          </a>
        </div>
      </aside>
    </>
  );
}
