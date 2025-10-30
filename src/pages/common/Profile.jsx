// src/pages/common/Profile.jsx - ENHANCED
import { useAuth } from "../../contexts/AuthContext";
import AdminProfile from "../admin/AdminProfile";
import StaffProfile from "../staff/StaffProfile";
import ClientProfile from "../client/ClientProfile";

export default function Profile() {
  const { isAdmin, isStaff, isClient, user } = useAuth();


  if (isAdmin) {
    return <AdminProfile />;
  }

  if (isStaff) {
    return <StaffProfile />;
  }

  if (isClient) {
    return <ClientProfile />;
  }

  return (
    <div className="container-fluid px-4 py-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading profile...</p>
        </div>
      </div>
    </div>
  );
}