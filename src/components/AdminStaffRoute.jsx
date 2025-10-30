// src/components/AdminStaffRoute.jsx
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

export default function AdminStaffRoute({ children }) {
  const { isAdmin, isStaff } = useAuth();

  return (
    <ProtectedRoute>
      {(isAdmin || isStaff) ? children : <Navigate to="/unauthorized" replace />}
    </ProtectedRoute>
  );
}