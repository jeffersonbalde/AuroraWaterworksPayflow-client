// src/components/ClientRoute.jsx - UPDATED
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

export default function ClientRoute({ children }) {
  const { isClient, isApproved } = useAuth(); // Changed from isActive to isApproved

  return (
    <ProtectedRoute>
      {isClient && isApproved ? children : <Navigate to="/unauthorized" replace />}
    </ProtectedRoute>
  );
}