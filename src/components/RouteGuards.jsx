import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function VerifiedRoute() {
  const { user } = useAuthStore();

  return user?.email_verified_at
    ? <Outlet />
    : <Navigate to="/dashboard" replace />;
}

export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
