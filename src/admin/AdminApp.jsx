import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
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
function AuthGate({ children }) {
  const { status } = useAdminAuth();
  if (status === 'checking') return <div className="flex min-h-screen items-center justify-center"><LoadingBlock label="Verifying admin session…" /></div>;
  if (status !== 'authenticated') return <AdminLoginScreen />;
  return children;
}

export default function AdminApp() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'SilverHouse Studio Admin';
    return () => { document.title = prevTitle; };
  }, []);

  return (
    <AdminAuthProvider>
      <AdminUIProvider>
        <AdminRoutes />
      </AdminUIProvider>
    </AdminAuthProvider>
  );
}

/** Protects admin components: unauthenticated users are routed directly to the login page. */
function ProtectedAdminRoute({ children }) {
  const { status } = useAdminAuth();
  const location = useLocation();

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19]">
        <LoadingBlock label="Verifying admin session…" />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}

function AdminRoutes() {
  const { status } = useAdminAuth();
  const location = useLocation();

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19]">
        <LoadingBlock label="Verifying admin session…" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Explicit Admin Sign In Page */}
      <Route
        path="login"
        element={
          status === 'authenticated' ? (
            <Navigate to="/admin/data/product" replace />
          ) : (
            <AdminLoginScreen />
          )
        }
      />

      {/* Restricted Administrative Components */}
      <Route
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Navigate to="data/product" replace />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="custom-orders" element={<CustomOrdersPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="data/:entity" element={<DataManagerPage />} />
        <Route path="data/:entity/new" element={<EntityFormPage />} />
        <Route path="data/:entity/:id/edit" element={<EntityFormPage />} />
      </Route>

      {/* Catch-all: Route unauthenticated callers directly to login */}
      <Route
        path="*"
        element={
          status === 'authenticated' ? (
            <Navigate to="/admin/data/product" replace />
          ) : (
            <Navigate to="/admin/login" replace state={{ from: location }} />
          )
        }
      />
    </Routes>
  );
}
