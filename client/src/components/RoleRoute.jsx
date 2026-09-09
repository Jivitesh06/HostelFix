import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_DEFAULT_PATHS = {
  STUDENT: '/student/dashboard',
  WARDEN: '/warden/dashboard',
  STAFF: '/staff/dashboard',
};

/**
 * Restricts a route to a specific role.
 * If the authenticated user has a different role,
 * they are redirected to their own dashboard.
 */
export default function RoleRoute({ role, children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== role) {
    const redirect = ROLE_DEFAULT_PATHS[user.role] || '/login';
    return <Navigate to={redirect} replace />;
  }

  return children;
}
