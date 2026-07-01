import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import ProviderLayout from './layouts/ProviderLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import ServicesPage from './pages/public/ServicesPage';
import ListingDetail from './pages/public/ListingDetail';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import EstimatePage from './pages/public/EstimatePage';
import BlogPage from './pages/public/BlogPage';
import BlogDetailPage from './pages/public/BlogDetailPage';

// Provider Pages
import LoginPage from './pages/provider/LoginPage';
import RegisterPage from './pages/provider/RegisterPage';
import ProfilePage from './pages/provider/ProfilePage';
import PostListing from './pages/provider/PostListing';
import MyListingsPage from './pages/provider/MyListingsPage';

// Auth Pages
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ProvidersManager from './pages/admin/ProvidersManager';
import ListingsManager from './pages/admin/ListingsManager';
import CategoriesManager from './pages/admin/CategoriesManager';
import UsersManager from './pages/admin/UsersManager';
import NotificationsPage from './pages/admin/NotificationsPage';
import PermissionsManager from './pages/admin/PermissionsManager';
import AdminProfilePage from './pages/admin/AdminProfilePage';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminPermissionRoute } from './components/ProtectedRoutes';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/estimate" element={<EstimatePage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogDetailPage />} />

              {/* STANDALONE AUTH ROUTES */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>
            {/* PROVIDER ROUTES */}
            <Route path="/provider" element={<ProtectedRoute allowedUserTypes={['PROVIDER']} />}>
              <Route element={<ProviderLayout />}>
                <Route index element={<Navigate to="listings" replace />} />
                <Route path="listings" element={<MyListingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="post" element={<PostListing />} />
              </Route>
            </Route>

            {/* ADMIN ROUTES */}
            <Route element={<ProtectedRoute allowedUserTypes={['ADMIN']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                
                <Route path="dashboard" element={<Dashboard />} />
                
                <Route element={<AdminPermissionRoute requiredPermission="manage:providers" />}>
                  <Route path="providers" element={<ProvidersManager />} />
                </Route>

                <Route element={<AdminPermissionRoute requiredPermission="manage:listings" />}>
                  <Route path="listings" element={<ListingsManager />} />
                </Route>

                <Route element={<AdminPermissionRoute requiredPermission="manage:categories" />}>
                  <Route path="categories" element={<CategoriesManager />} />
                </Route>

                <Route element={<AdminPermissionRoute requiredPermission="manage:admins" />}>
                  <Route path="users" element={<UsersManager />} />
                </Route>

                <Route element={<AdminPermissionRoute requiredPermission="view:notifications" />}>
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>

                <Route element={<AdminPermissionRoute requiredPermission="manage:permissions" />}>
                  <Route path="permissions" element={<PermissionsManager />} />
                </Route>

                <Route path="profile" element={<AdminProfilePage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
