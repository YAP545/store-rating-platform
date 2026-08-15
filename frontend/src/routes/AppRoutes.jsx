import React, { useContext } from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';

import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

// Admin pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminStoresPage from '../pages/admin/AdminStoresPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import AdminLogsPage from '../pages/admin/AdminLogsPage';
import AdminChangePasswordPage from '../pages/admin/AdminChangePasswordPage';

// User pages
import UserStoresPage from '../pages/user/UserStoresPage';
import UserChangePasswordPage from '../pages/user/UserChangePasswordPage';

// Owner pages
import OwnerDashboardPage from '../pages/owner/OwnerDashboardPage';
import OwnerChangePasswordPage from '../pages/owner/OwnerChangePasswordPage';

// Error pages
import NotFoundPage from '../pages/errors/NotFoundPage';
import ForbiddenPage from '../pages/errors/ForbiddenPage';

const RootRedirect = () => {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'SYSTEM_ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === 'STORE_OWNER') {
    return <Navigate to="/owner/dashboard" replace />;
  }

  return <Navigate to="/user/stores" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* PROTECTED ROUTES */}

      <Route element={<DashboardLayout />}>
        {/* SYSTEM ADMIN */}

        <Route element={<ProtectedRoute allowedRoles={['SYSTEM_ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/stores" element={<AdminStoresPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/logs" element={<AdminLogsPage />} />
          <Route path="/admin/change-password" element={<AdminChangePasswordPage />} />
        </Route>

        {/* NORMAL USER */}

        <Route element={<ProtectedRoute allowedRoles={['NORMAL_USER']} />}>
          <Route path="/user/stores" element={<UserStoresPage />} />
          <Route path="/user/change-password" element={<UserChangePasswordPage />} />
        </Route>

        {/* STORE OWNER */}

        <Route element={<ProtectedRoute allowedRoles={['STORE_OWNER']} />}>
          <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
          <Route path="/owner/change-password" element={<OwnerChangePasswordPage />} />
        </Route>
      </Route>

      {/* ROOT */}

      <Route path="/" element={<RootRedirect />} />

      {/* 404 */}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;