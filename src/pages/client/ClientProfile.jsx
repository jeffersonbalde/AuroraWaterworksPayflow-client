// src/pages/client/ClientProfile.jsx - UPDATED BASED ON BACKEND ANALYSIS
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { showAlert } from "../../services/notificationService";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaHome,
  FaIdCard,
  FaShieldAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaInfoCircle,
} from "react-icons/fa";

const ClientProfile = () => {
  const { user } = useAuth();

  const handleContactSupport = () => {
    const phoneNumber = "+639123456789";
    const email = "support@aurorawaterworks.gov.ph";
    
    showAlert.info(
      "Contact Support",
      `<div style="text-align: center; line-height: 1.6;">
        <div style="margin-bottom: 12px;">
          <strong>📞 Phone Support</strong><br>
          <span style="color: #666;">${phoneNumber}</span>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>📧 Email Support</strong><br>
          <span style="color: #666;">${email}</span>
        </div>
        <div style="background: #f8f9fa; padding: 8px; border-radius: 6px;">
          <strong>🕐 Office Hours</strong><br>
          <span style="color: #666;">Mon-Fri: 8:00 AM - 5:00 PM</span>
        </div>
      </div>`,
      "Got it"
    );
  };

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

  // UPDATED: Based on backend status values ('active', 'pending', 'rejected')
  const getStatusIcon = (status) => {
    switch (status) {
      case "active": // Backend uses 'active' for approved users
        return {
          icon: FaCheckCircle,
          gradient: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
          color: "#4CAF50",
        };
      case "pending":
        return {
          icon: FaClock,
          gradient: "linear-gradient(135deg, #ffa726 0%, #ff9800 100%)",
          color: "#ff9800",
        };
      case "rejected":
        return {
          icon: FaTimesCircle,
          gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
          color: "#ff6b6b",
        };
      default:
        return {
          icon: FaInfoCircle,
          gradient: "linear-gradient(135deg, #6c757d 0%, #5a6268 100%)",
          color: "#6c757d",
        };
    }
  };

  // UPDATED: Status display based on backend values
  const getStatusDisplay = (status) => {
    switch (status) {
      case "active":
        return "Account Active";
      case "pending":
        return "Pending Review";
      case "rejected":
        return "Account Rejected";
      default:
        return "Account Status";
    }
  };

  const statusConfig = getStatusIcon(user?.status);
  const StatusIcon = statusConfig.icon;

  const handleStatusInquiry = () => {
    let statusMessage = "";
    let statusColor = "";
    
    switch(user?.status) {
      case "active":
        statusMessage = "Your account has been fully approved and activated. You now have complete access to all water service features.";
        statusColor = "#4CAF50";
        break;
      case "pending":
        statusMessage = "Your account is currently under administrative review. This process typically takes 1-2 business days.";
        statusColor = "#ffc107";
        break;
      case "rejected":
        statusMessage = "Your account registration was not approved. Please contact support for more information.";
        statusColor = "#ff6b6b";
        break;
      default:
        statusMessage = "Your account status is being processed.";
        statusColor = "#6c757d";
    }

    showAlert.info(
      "Account Status Details",
      `
      <div style="text-align: center; line-height: 1.6;">
        <div style="background: ${statusColor}15; padding: 10px; border-radius: 6px; border: 1px solid ${statusColor}30; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
            <div style="width: 10px; height: 10px; background: ${statusColor}; border-radius: 50%; margin-right: 8px;"></div>
            <strong>Status: ${getStatusDisplay(user?.status)}</strong>
          </div>
          <p style="color: #666; margin: 0; font-size: 0.85em;">
            ${statusMessage}
          </p>
        </div>
        
        <div style="display: flex; gap: 8px; margin-bottom: 10px;">
          <div style="flex: 1; background: white; padding: 6px; border-radius: 4px; border: 1px solid #e9ecef;">
            <strong style="font-size: 0.8em;">📅 Registered</strong><br>
            <span style="color: #666; font-size: 0.75em;">${formatDate(user?.created_at)}</span>
          </div>
          ${user?.approved_at ? `
          <div style="flex: 1; background: white; padding: 6px; border-radius: 4px; border: 1px solid #e9ecef;">
            <strong style="font-size: 0.8em;">✅ Approved</strong><br>
            <span style="color: #666; font-size: 0.75em;">${formatDate(user?.approved_at)}</span>
          </div>
          ` : ''}
        </div>
      </div>
      `,
      "Understand"
    );
  };

  const handleInfoClick = (title, content) => {
    showAlert.info(
      title,
      `
      <div style="text-align: center; line-height: 1.6;">
        <div style="background: #f8f9fa; padding: 8px; border-radius: 6px; margin-bottom: 10px;">
          <strong>Information</strong><br>
          <span style="color: #666;">
            ${content}
          </span>
        </div>
      </div>
      `,
      "Got it"
    );
  };

  // Determine if we should show the Account Status Details card
  const shouldShowStatusDetailsCard = user?.status === "rejected" && user?.rejection_reason;

  return (
    <div className="container-fluid px-4 py-3">
      {/* Enhanced Header - UPDATED: Proper status display based on backend */}
      <div className="text-center mb-4">
        <div className="d-flex justify-content-center align-items-center mb-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center me-3 position-relative flex-shrink-0"
            style={{
              width: "50px",
              height: "50px",
              background: statusConfig.gradient,
              boxShadow: `0 4px 15px ${statusConfig.color}40`,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = `0 6px 20px ${statusConfig.color}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = `0 4px 15px ${statusConfig.color}40`;
            }}
          >
            <StatusIcon size={22} className="text-white" />
          </div>
          <div className="text-start">
            <h1 className="h4 mb-1 fw-bold" style={{ color: "#2d5a27" }}>
              {getStatusDisplay(user?.status)}
            </h1>
            <p className="text-muted mb-0 small">
              {user?.name} • Aurora Waterworks Client
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Grid Layout - IMPROVED: Better space utilization */}
      <div className="row g-3">
        {/* Profile Overview Card - COMPACTED: Removed avatar and optimized layout */}
        <div className="col-12 col-lg-6">
          <div
            className="card border-0 h-100"
            style={{
              borderRadius: "10px",
              background: "white",
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
                background: "#f8f9fa",
                borderBottom: "2px solid #dee2e6",
              }}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "#2d5a27",
                    color: "white",
                    boxShadow: "0 3px 10px rgba(45, 90, 39, 0.4)",
                  }}
                >
                  <FaUser size={14} />
                </div>
                <h6 className="mb-0 fw-bold" style={{ color: "#2d5a27" }}>
                  Profile Overview
                </h6>
              </div>
            </div>
            <div className="card-body p-3">
              {/* Client Information - COMPACTED: Removed avatar and optimized layout */}
              <div className="mb-3">
                <h5 className="mb-1 fw-bold" style={{ color: "#2d5a27" }}>
                  {user?.name}
                </h5>
                <p className="text-muted mb-1 small">Water Service Client</p>
                <p className="text-muted mb-0 small">WWS ID: {user?.wws_id || "N/A"}</p>
              </div>

              {/* Status Information Grid - COMPACTED: Better grid layout */}
              <div className="row g-2">
                {/* Status Badge */}
                <div className="col-12 col-sm-6">
                  <div
                    className="d-flex align-items-center p-2 rounded-3 position-relative overflow-hidden"
                    style={{
                      background: `${statusConfig.color}15`,
                      border: `1px solid ${statusConfig.color}30`,
                      boxShadow: `0 3px 12px ${statusConfig.color}25`,
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onClick={handleStatusInquiry}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${statusConfig.color}20`;
                      e.currentTarget.style.borderColor = `${statusConfig.color}50`;
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = `0 5px 18px ${statusConfig.color}35`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${statusConfig.color}15`;
                      e.currentTarget.style.borderColor = `${statusConfig.color}30`;
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = `0 3px 12px ${statusConfig.color}25`;
                    }}
                  >
                    <StatusIcon className="me-2 flex-shrink-0" size={14} style={{ color: statusConfig.color }} />
                    <div>
                      <small className="text-muted d-block fw-semibold" style={{ fontSize: "0.75rem" }}>
                        Account Status
                      </small>
                      <span className="badge small px-2 py-1 fw-semibold" style={{
                        background: statusConfig.gradient,
                        color: "white",
                        fontSize: "0.75rem",
                        boxShadow: `0 2px 8px ${statusConfig.color}40`,
                      }}>
                        {getStatusDisplay(user?.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Registration Date */}
                <div className="col-12 col-sm-6">
                  <div
                    className="d-flex align-items-center p-2 rounded-3 position-relative overflow-hidden"
                    style={{
                      background: "rgba(74, 140, 71, 0.1)",
                      border: "1px solid rgba(74, 140, 71, 0.3)",
                      boxShadow: "0 3px 12px rgba(74, 140, 71, 0.25)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(74, 140, 71, 0.15)";
                      e.currentTarget.style.borderColor = "rgba(74, 140, 71, 0.5)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 5px 18px rgba(74, 140, 71, 0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(74, 140, 71, 0.1)";
                      e.currentTarget.style.borderColor = "rgba(74, 140, 71, 0.3)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 3px 12px rgba(74, 140, 71, 0.25)";
                    }}
                  >
                    <FaCalendarAlt className="text-success me-2 flex-shrink-0" size={14} />
                    <div>
                      <small className="text-muted d-block fw-semibold" style={{ fontSize: "0.75rem" }}>
                        Registered Since
                      </small>
                      <span className="fw-semibold small" style={{ color: "#2d5a27", fontSize: "0.8rem" }}>
                        {formatDate(user?.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Approval/Rejection Details - UPDATED: Based on backend data structure */}
                {user?.approved_at && (
                  <div className="col-12 col-sm-6">
                    <div
                      className="d-flex align-items-center p-2 rounded-3 position-relative overflow-hidden"
                      style={{
                        background: "rgba(76, 175, 80, 0.1)",
                        border: "1px solid rgba(76, 175, 80, 0.3)",
                        boxShadow: "0 3px 12px rgba(76, 175, 80, 0.25)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <FaCheckCircle className="text-success me-2 flex-shrink-0" size={14} />
                      <div>
                        <small className="text-muted d-block fw-semibold" style={{ fontSize: "0.75rem" }}>
                          Approved On
                        </small>
                        <span className="fw-semibold small" style={{ color: "#2d5a27", fontSize: "0.8rem" }}>
                          {formatDate(user?.approved_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {user?.approved_by && (
                  <div className="col-12 col-sm-6">
                    <div
                      className="d-flex align-items-center p-2 rounded-3 position-relative overflow-hidden"
                      style={{
                        background: "rgba(76, 175, 80, 0.1)",
                        border: "1px solid rgba(76, 175, 80, 0.3)",
                        boxShadow: "0 3px 12px rgba(76, 175, 80, 0.25)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <FaUser className="text-success me-2 flex-shrink-0" size={14} />
                      <div>
                        <small className="text-muted d-block fw-semibold" style={{ fontSize: "0.75rem" }}>
                          Approved By
                        </small>
                        <span className="fw-semibold small" style={{ color: "#2d5a27", fontSize: "0.8rem" }}>
                          {user?.approved_by}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {user?.rejected_at && (
                  <div className="col-12 col-sm-6">
                    <div
                      className="d-flex align-items-center p-2 rounded-3 position-relative overflow-hidden"
                      style={{
                        background: "rgba(255, 107, 107, 0.1)",
                        border: "1px solid rgba(255, 107, 107, 0.3)",
                        boxShadow: "0 3px 12px rgba(255, 107, 107, 0.25)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <FaTimesCircle className="text-danger me-2 flex-shrink-0" size={14} />
                      <div>
                        <small className="text-muted d-block fw-semibold" style={{ fontSize: "0.75rem" }}>
                          Rejected On
                        </small>
                        <span className="fw-semibold small" style={{ color: "#2d5a27", fontSize: "0.8rem" }}>
                          {formatDate(user?.rejected_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {user?.rejected_by && (
                  <div className="col-12 col-sm-6">
                    <div
                      className="d-flex align-items-center p-2 rounded-3 position-relative overflow-hidden"
                      style={{
                        background: "rgba(255, 107, 107, 0.1)",
                        border: "1px solid rgba(255, 107, 107, 0.3)",
                        boxShadow: "0 3px 12px rgba(255, 107, 107, 0.25)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <FaUser className="text-danger me-2 flex-shrink-0" size={14} />
                      <div>
                        <small className="text-muted d-block fw-semibold" style={{ fontSize: "0.75rem" }}>
                          Rejected By
                        </small>
                        <span className="fw-semibold small" style={{ color: "#2d5a27", fontSize: "0.8rem" }}>
                          {user?.rejected_by}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Card - OPTIMIZED: Better space utilization */}
        <div className="col-12 col-lg-6">
          <div
            className="card border-0 h-100"
            style={{
              borderRadius: "10px",
              background: "white",
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
                background: "#f8f9fa",
                borderBottom: "2px solid #dee2e6",
              }}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{
                    width: "28px",
                    height: "28px",
                    background: "#2196f3",
                    color: "white",
                    boxShadow: "0 3px 10px rgba(33, 150, 243, 0.4)",
                  }}
                >
                  <FaIdCard size={12} />
                </div>
                <h6 className="mb-0 fw-semibold" style={{ color: "#2d5a27" }}>
                  Personal Information
                </h6>
              </div>
            </div>
            <div className="card-body p-3">
              <div className="row g-2">
                {[
                  { icon: FaUser, label: "Full Name", value: user?.name, color: "#4a8c47" },
                  { icon: FaIdCard, label: "WWS ID", value: user?.wws_id || "N/A", color: "#5da55a" },
                  { icon: FaEnvelope, label: "Email Address", value: user?.email, color: "#6fbf67" },
                  { icon: FaPhone, label: "Contact Number", value: user?.contact_number || "Not provided", color: "#4a8c47" },
                  { icon: FaHome, label: "Address", value: user?.address || "Not provided", color: "#5da55a" },
                  { icon: FaCalendarAlt, label: "Member Since", value: formatDate(user?.created_at), color: "#6fbf67" },
                ].map((item, index) => (
                  <div key={index} className="col-12">
                    <div
                      className="d-flex align-items-start p-2 rounded-3 mb-2 border position-relative overflow-hidden"
                      style={{
                        background: "white",
                        borderColor: `${item.color}40 !important`,
                        boxShadow: "0 3px 12px rgba(0, 0, 0, 0.15)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onClick={() => handleInfoClick(item.label, item.value)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f8f9fa";
                        e.currentTarget.style.borderColor = `${item.color}80 !important`;
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 5px 18px rgba(0, 0, 0, 0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                        e.currentTarget.style.borderColor = `${item.color}40 !important`;
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 3px 12px rgba(0, 0, 0, 0.15)";
                      }}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0 mt-1"
                        style={{
                          width: "20px",
                          height: "20px",
                          background: item.color,
                          color: "white",
                          fontSize: "0.6rem",
                          fontWeight: "600",
                          boxShadow: `0 3px 10px ${item.color}50`,
                        }}
                      >
                        <item.icon size={8} />
                      </div>
                      <div className="flex-grow-1">
                        <small className="fw-semibold d-block" style={{ color: "#2d5a27", fontSize: "0.8rem" }}>
                          {item.label}
                        </small>
                        <small className="text-muted" style={{ fontSize: "0.75rem", lineHeight: "1.3" }}>
                          {item.value}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Account Status Details Card - FIXED: Only shows when needed */}
        {shouldShowStatusDetailsCard && (
          <div className="col-12">
            <div
              className="card border-0 h-100"
              style={{
                background: "white",
                borderRadius: "10px",
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
                  background: "#f8f9fa",
                  borderBottom: "2px solid #dee2e6",
                }}
              >
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-2"
                    style={{
                      width: "28px",
                      height: "28px",
                      background: statusConfig.color,
                      color: "white",
                      boxShadow: `0 3px 10px ${statusConfig.color}40`,
                    }}
                  >
                    <FaShieldAlt size={12} />
                  </div>
                  <h6 className="mb-0 fw-semibold" style={{ color: "#2d5a27" }}>
                    Account Status Details
                  </h6>
                </div>
              </div>
              <div className="card-body p-3">
                <div className="row g-2">
                  <div className="col-12">
                    <div 
                      className="alert alert-warning small mb-0 rounded-3"
                      style={{
                        background: "rgba(255, 193, 7, 0.1)",
                        border: "1px solid rgba(255, 193, 7, 0.3)",
                        boxShadow: "0 3px 12px rgba(255, 193, 7, 0.25)",
                      }}
                    >
                      <strong>Rejection Reason:</strong> {user.rejection_reason}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Information Banner - Only for rejected status */}
        {user?.status === "rejected" && user?.rejection_reason && (
          <div className="col-12">
            <div
              className="card border-0"
              style={{
                background: "rgba(255, 107, 107, 0.03)",
                border: "1px solid rgba(255, 107, 107, 0.1)",
                boxShadow: "0 6px 20px rgba(255, 107, 107, 0.2)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 107, 107, 0.05)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(255, 107, 107, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 107, 107, 0.03)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 107, 107, 0.2)";
              }}
            >
              <div className="card-body p-3">
                <div className="row align-items-center">
                  <div className="col">
                    <p className="mb-0 small text-muted" style={{ fontSize: "0.85rem" }}>
                      <strong>Appeal Process:</strong> If you believe there has been an error in the review of your application, you may contact support to appeal the decision.
                    </p>
                  </div>
                  <div className="col-auto">
                    <button
                      className="btn btn-sm position-relative overflow-hidden"
                      onClick={handleContactSupport}
                      style={{
                        background: "#2d5a27",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        padding: "0.4rem 0.8rem",
                        fontWeight: "500",
                        transition: "all 0.3s ease",
                        boxShadow: "0 3px 12px rgba(45, 90, 39, 0.4)",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow = "0 5px 18px rgba(45, 90, 39, 0.6)";
                        e.target.style.background = "#4a8c47";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 3px 12px rgba(45, 90, 39, 0.4)";
                        e.target.style.background = "#2d5a27";
                      }}
                    >
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProfile;