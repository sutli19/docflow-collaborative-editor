import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Gates /dashboard and /editor/:id behind a valid session. We don't verify
// the token here (the backend does that on every request and the axios
// interceptor boots the user back to /login on a 401) — this just stops an
// unauthenticated visitor from rendering the page at all.
export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}