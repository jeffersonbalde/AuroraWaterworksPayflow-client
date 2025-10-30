// src/components/AdminRoute.jsx (Keep for potential future use)
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

export default function AdminRoute({ children }) {
  const { isAdmin } = useAuth();

  return (
    <ProtectedRoute>
      {isAdmin ? children : <Navigate to="/unauthorized" replace />}
    </ProtectedRoute>
  );
}