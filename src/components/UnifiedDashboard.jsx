// src/components/UnifiedDashboard.jsx
import { useAuth } from '../contexts/AuthContext';
import Preloader from './Preloader';

// Import all dashboard components
import AdminDashboard from '../pages/admin/AdminDashboard';
import StaffDashboard from '../pages/staff/StaffDashboard';
import ClientDashboard from '../pages/client/ClientDashboard';
import PendingClientDashboard from '../pages/client/PendingClientDashboard';
import RejectedClientDashboard from '../pages/client/RejectedClientDashboard';

export default function UnifiedDashboard() {
  const { user, loading, isAdmin, isStaff, isClient, isPending, isRejected } = useAuth();

  if (loading) {
    return <Preloader />;
  }

  if (!user) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h3>Authentication Required</h3>
          <p>Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on user role and status
  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isStaff) {
    return <StaffDashboard />;
  }

  if (isClient) {
    if (isRejected) {
      return <RejectedClientDashboard />;
    }
    
    if (isPending) {
      return <PendingClientDashboard />;
    }
    
    return <ClientDashboard />;
  }

  // Fallback for unknown roles
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <h3>Access Configuration Error</h3>
        <p>Your account role is not properly configured. Please contact support.</p>
        <p className="text-muted">Role: {user?.role} | Status: {user?.status}</p>
      </div>
    </div>
  );
}