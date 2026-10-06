import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';
import { useAdminUI } from '../../context/AdminUIContext';

/** Shell for every authenticated admin page: sidebar navigation, header, content outlet, footer. */
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { refreshPendingCustomOrders } = useAdminUI();

  // Keep the pending custom-orders badge fresh and scroll to top as the admin moves between pages
  useEffect(() => {
    refreshPendingCustomOrders();
    window.scrollTo(0, 0);
  }, [pathname, refreshPendingCustomOrders]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
          <Outlet />
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
