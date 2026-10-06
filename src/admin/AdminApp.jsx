import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './admin.css';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AdminUIProvider } from './context/AdminUIContext';
import AdminLayout from './components/layout/AdminLayout';
import AdminLoginScreen from './components/layout/AdminLoginScreen';
import { LoadingBlock } from './components/ui';
import CatalogPage from './pages/CatalogPage';
import CustomOrdersPage from './pages/CustomOrdersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DataManagerPage from './pages/DataManagerPage';
import EntityFormPage from './pages/EntityFormPage';

/**
 * SilverHouse Admin Studio, mounted at /admin/* (see src/main.jsx).
 * Replaces the standalone HTML pages that used to live in Backend/public.
 */
export default function AdminApp() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'SilverHouse Studio Admin';
    return () => { document.title = prevTitle; };
  }, []);

  return (
    <AdminAuthProvider>
      <AdminUIProvider>
        <AuthGate />
      </AdminUIProvider>
    </AdminAuthProvider>
  );
}

function AuthGate() {
  const { status } = useAdminAuth();
  if (status === 'checking') return <div className="flex min-h-screen items-center justify-center"><LoadingBlock label="Verifying admin session…" /></div>;
  if (status !== 'authenticated') return <AdminLoginScreen />;

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="data/product" replace />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="custom-orders" element={<CustomOrdersPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="data/:entity" element={<DataManagerPage />} />
        <Route path="data/:entity/new" element={<EntityFormPage />} />
        <Route path="data/:entity/:id/edit" element={<EntityFormPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
