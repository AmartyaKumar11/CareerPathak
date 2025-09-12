import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SimpleAuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - Current path:', location.pathname, 'User:', user, 'Loading:', loading);

  if (loading) {
    console.log('ProtectedRoute - Loading state, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('ProtectedRoute - User authenticated, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
