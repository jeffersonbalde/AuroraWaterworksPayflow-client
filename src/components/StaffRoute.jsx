// src/components/StaffRoute.jsx
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

export default function StaffRoute({ children }) {
  const { isStaff } = useAuth();

  return (
    <ProtectedRoute>
      {isStaff ? children : <Navigate to="/unauthorized" replace />}
    </ProtectedRoute>
  );
}