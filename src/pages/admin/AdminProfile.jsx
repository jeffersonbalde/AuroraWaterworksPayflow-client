// src/pages/admin/AdminProfile.jsx - FIXED WITH WORKING SETTINGS NAVIGATION
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom"; // ADD THIS IMPORT
import { showAlert } from "../../services/notificationService";
import {
  FaShieldAlt,
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaKey,
} from "react-icons/fa";

const AdminProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // ADD THIS HOOK

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePasswordChange = () => {
    showAlert.confirm(
      "Change Password",
      "Please go to Settings to update your administrator password.",
      "Go to Settings",
      "Cancel"
    ).then((result) => {
      if (result.isConfirmed) {
        // Navigate to settings page when user confirms
        navigate("/settings");
      }
    });
  };

  return (
    <div className="container-fluid px-4 py-3">
      {/* Enhanced Header - ClientProfile Style */}
      <div className="text-center mb-4">
        <div className="d-flex justify-content-center align-items-center mb-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center me-3 position-relative flex-shrink-0"
            style={{
              width: "50px",
              height: "50px",
              background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)",
              boxShadow: "0 4px 15px rgba(45, 89, 48, 0.4)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(45, 89, 48, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(45, 89, 48, 0.4)";
            }}
          >
            <FaShieldAlt size={22} className="text-white" />
          </div>
          <div className="text-start">
            <h1 className="h4 mb-1 fw-bold" style={{ color: "var(--text-primary)" }}>
              System Administrator
            </h1>
            <p className="text-muted mb-0 small">
              {user?.name} • Full System Access
            </p>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* Admin Information - Enhanced Styling */}
        <div className="col-12 col-lg-6">
          <div
            className="card border-0 h-100"
            style={{
              borderRadius: "10px",
              background: "var(--background-white)",
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 35px rgba(0, 0, 0, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
            }}
          >
            <div
              className="card-header bg-transparent border-0 py-3 px-3"
              style={{
                background: "var(--background-light)",
                borderBottom: "2px solid var(--border-color)",
              }}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "var(--primary-color)",
                    color: "white",
                    boxShadow: "0 3px 10px rgba(45, 89, 48, 0.4)",
                  }}
                >
                  <FaUser size={14} />
                </div>
                <h6 className="mb-0 fw-bold" style={{ color: "var(--text-primary)" }}>
                  Administrator Information
                </h6>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-2">
                {[
                  { icon: FaUser, label: "Full Name", value: user?.name },
                  { icon: FaEnvelope, label: "Email", value: user?.email },
                  { icon: FaCalendarAlt, label: "Member Since", value: formatDate(user?.created_at) },
                  { icon: FaShieldAlt, label: "Role", value: "System Administrator" },
                ].map((item, index) => (
                  <div key={index} className="col-12">
                    <div 
                      className="d-flex align-items-center p-2 rounded-3 mb-2 position-relative overflow-hidden"
                      style={{
                        background: "var(--background-white)",
                        border: "1px solid var(--border-color)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--background-light)";
                        e.currentTarget.style.borderColor = "var(--primary-light)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(45, 89, 48, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--background-white)";
                        e.currentTarget.style.borderColor = "var(--border-color)";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
                      }}
                    >
                      <item.icon className="me-2" size={14} style={{ color: "var(--primary-color)" }} />
                      <div className="flex-grow-1">
                        <small className="d-block" style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                          {item.label}
                        </small>
                        <span className="fw-semibold" style={{ color: "var(--text-primary)" }}>
                          {item.value}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Access - Enhanced Styling */}
        <div className="col-12 col-lg-6">
          <div
            className="card border-0 h-100"
            style={{
              borderRadius: "10px",
              background: "var(--background-white)",
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 35px rgba(0, 0, 0, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
            }}
          >
            <div
              className="card-header bg-transparent border-0 py-3 px-3"
              style={{
                background: "var(--background-light)",
                borderBottom: "2px solid var(--border-color)",
              }}
            >
              <h6 className="mb-0 fw-bold" style={{ color: "var(--text-primary)" }}>
                System Access
              </h6>
            </div>
            <div className="card-body">
              <div 
                className="rounded-3 p-3 mb-3"
                style={{
                  background: "rgba(184, 134, 11, 0.05)",
                  border: "1px solid rgba(184, 134, 11, 0.2)",
                  boxShadow: "0 2px 8px rgba(184, 134, 11, 0.1)",
                }}
              >
                <strong style={{ color: "var(--text-primary)" }}>Administrator Privileges:</strong>
                <ul className="mb-0 mt-2 small" style={{ color: "var(--text-secondary)" }}>
                  <li>Create and manage staff accounts</li>
                  <li>Full system configuration access</li>
                  <li>User account approvals and management</li>
                  <li>System audit logs and reports</li>
                </ul>
              </div>
              
              <button
                className="btn w-100 position-relative overflow-hidden"
                onClick={handlePasswordChange}
                style={{
                  background: "var(--primary-color)",
                  color: "var(--btn-primary-text)",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  padding: "0.60rem 1.5rem",
                  transition: "all 0.3s ease",
                  boxShadow: "0 3px 12px rgba(45, 89, 48, 0.4)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "var(--primary-dark)";
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 5px 18px rgba(45, 89, 48, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "var(--primary-color)";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 3px 12px rgba(45, 89, 48, 0.4)";
                }}
              >
                <FaKey className="me-2" />
                Change Password in Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;