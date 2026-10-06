import React from 'react';
import { Link } from 'react-router-dom';

const FOOTER_LINKS = [
  { to: '/admin/catalog', label: 'Catalog' },
  { to: '/admin/custom-orders', label: 'Custom Orders' },
  { to: '/admin/analytics', label: 'Analytics' }
];

/** Footer shared by every admin page. */
export default function AdminFooter() {
  return (
    <footer className="mt-auto border-t border-ad-border px-4 py-4 sm:px-6">
      <div className="flex flex-col items-center gap-2 text-center text-xs text-ad-muted sm:flex-row sm:justify-between sm:text-left">
        <span>© {new Date().getFullYear()} SilverHouse Studio · Restricted to authorised administrators</span>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1" aria-label="Footer">
          {FOOTER_LINKS.map(l => (
            <Link key={l.to} to={l.to} className="font-semibold hover:text-ad-primary">{l.label}</Link>
          ))}
          <a href="/" target="_blank" rel="noreferrer" className="font-semibold hover:text-ad-primary">Storefront ↗</a>
        </nav>
      </div>
    </footer>
  );
}
