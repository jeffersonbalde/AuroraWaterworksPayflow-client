// src/pages/staff/StaffProfile.jsx
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaUserTie,
  FaUserShield,
} from "react-icons/fa";

const StaffProfile = () => {
  const { user } = useAuth();

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin':
        return 'System Administrator';
      case 'staff':
        return 'Staff Member';
      default:
        return role;
    }
  };

  return (
    <div className="container-fluid px-4 py-3">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="d-flex justify-content-center align-items-center mb-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center me-3"
            style={{
              width: "50px",
              height: "50px",
              background: "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%)",
              color: "white",
            }}
          >
            <FaUserTie size={22} />
          </div>
          <div className="text-start">
            <h1 className="h4 mb-1 fw-bold" style={{ color: "var(--text-primary)" }}>
              Staff Profile
            </h1>
            <p className="text-muted mb-0 small">
              {user?.name} • {user?.position || "Staff Member"}
            </p>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* Staff Information */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0 py-3">
              <h6 className="mb-0 fw-bold" style={{ color: "var(--text-primary)" }}>
                Staff Information
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-2">
                {[
                  { icon: FaUser, label: "Full Name", value: user?.name },
                  { icon: FaUserTie, label: "Position", value: user?.position || "Staff Member" },
                  { icon: FaEnvelope, label: "Email", value: user?.email },
                  { icon: FaPhone, label: "Contact Number", value: user?.contact_number || "Not provided" },
                  { icon: FaCalendarAlt, label: "Account Created", value: formatDate(user?.created_at) },
                  { icon: FaCalendarAlt, label: "Last Updated", value: formatDate(user?.updated_at) },
                  { icon: FaUserShield, label: "Created By", value: user?.created_by || "System" },
                  // Role div has been removed as requested
                ].map((item, index) => (
                  <div key={index} className="col-12">
                    <div className="d-flex align-items-center p-2 rounded-3 mb-2 border" style={{
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--background-light)'
                    }}>
                      <item.icon className="me-2" style={{ color: 'var(--text-muted)' }} size={14} />
                      <div className="flex-grow-1">
                        <small className="d-block" style={{ color: 'var(--text-muted)' }}>{item.label}</small>
                        <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0 py-3">
              <h6 className="mb-0 fw-bold" style={{ color: "var(--text-primary)" }}>
                Staff Access
              </h6>
            </div>
            <div className="card-body">
              <div className="alert alert-info" style={{
                backgroundColor: 'rgba(114, 170, 135, 0.1)',
                borderColor: 'var(--primary-light)',
                color: 'var(--text-primary)'
              }}>
                <strong>Staff Permissions:</strong>
                <ul className="mb-0 mt-2 small">
                  <li>Manage client accounts and approvals</li>
                  <li>Process billing and payments</li>
                  <li>Generate reports and view analytics</li>
                  <li>Customer support and management</li>
                </ul>
              </div>
              
              {user?.staff_notes && (
                <div className="mt-3">
                  <small className="d-block" style={{ color: 'var(--text-muted)' }}>Admin Notes:</small>
                  <div className="p-2 rounded small" style={{
                    backgroundColor: 'var(--background-light)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}>
                    {user.staff_notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;