// src/components/PublicRoute.jsx
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Preloader from './Preloader';

export default function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Preloader />;
  }

  if (!isAuthenticated) {
    return children;
  }

  // All authenticated users go to the same dashboard URL
  return <Navigate to="/dashboard" replace />;
}