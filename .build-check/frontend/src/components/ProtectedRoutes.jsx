import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedUserTypes }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>; // Could be a real spinner component
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Type check if provided (e.g. ['ADMIN'] or ['PROVIDER'])
  if (allowedUserTypes && !allowedUserTypes.includes(user.userType)) {
    // User is logged in but wrong type, send them to their respective home
    if (user.userType === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/provider/profile" replace />;
  }

  return <Outlet />;
};

export const AdminPermissionRoute = ({ requiredPermission }) => {
  const { user, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) return <div>Loading...</div>;

  if (!user || user.userType !== 'ADMIN') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Redirect to dashboard if they don't have permission for this specific admin page
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};
