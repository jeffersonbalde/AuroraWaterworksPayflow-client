// src/pages/common/Settings.jsx - UPDATED
import { useAuth } from "../../contexts/AuthContext";
import AdminSettings from "../admin/AdminSettings";
import ClientSettings from "../client/ClientSettings";

export default function Settings() {
  const { isAdmin, isStaff, isClient, user } = useAuth();


  if (isAdmin) {
    return <AdminSettings />;
  }

  if (isClient) {
    return <ClientSettings />;
  }

  return (
    <div className="container-fluid px-4 py-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading settings...</p>
        </div>
      </div>
    </div>
  );
}