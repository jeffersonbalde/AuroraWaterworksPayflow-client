// src/components/Dashboard/RejectedClientDashboard.jsx - UPDATED WITH REAL DATA
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { 
  FaExclamationTriangle, 
  FaEnvelope, 
  FaPhone, 
  FaFileAlt,
  FaQuestionCircle,
  FaInfoCircle,
  FaArrowRight,
  FaClock
} from "react-icons/fa";
import { showAlert } from "../../services/notificationService";

export default function RejectedClientDashboard() {
  const { user } = useAuth();
  const [showReasons, setShowReasons] = useState(false);
  const navigate = useNavigate();

  // Get real data from auth context user object
  const rejectionData = {
    wwsId: user?.wws_id || "N/A",
    rejectionDate: user?.rejected_at,
    rejectionReasons: user?.rejection_reason ? [user.rejection_reason] : ["No specific reason provided"],
    adminNotes: "Please verify your information and contact support if you believe there has been a mistake.",
    contactPerson: user?.rejected_by || "Administrator",
    reviewPeriod: "1-2 business days"
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleContactSupport = () => {
    showAlert.info(
      "Contact Support",
      `
      <div style="text-align: center; line-height: 1.6;">
        <div style="margin-bottom: 12px;">
          <strong>📞 Phone Support</strong><br>
          <span style="color: #666;">(+63) XXX-XXX-XXXX</span>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>📧 Email Support</strong><br>
          <span style="color: #666;">admin@aurorawaterworks.gov.ph</span>
        </div>
        <div style="background: #f8f9fa; padding: 8px; border-radius: 6px;">
          <strong>🕐 Office Hours</strong><br>
          <span style="color: #666;">Mon-Fri: 8:00 AM - 5:00 PM</span>
        </div>
      </div>
      `,
      "Got it"
    );
  };

  const handleGetHelp = () => {
    showAlert.info(
      "Need Assistance?",
      `
      <div style="text-align: center; line-height: 1.6;">
        <p style="color: #666; margin-bottom: 12px;">We're here to help with your rejected application.</p>
        <div style="background: #fffbf0; padding: 8px; border-radius: 6px; border-left: 3px solid #ffc107;">
          <strong>💡 Quick Tips:</strong><br>
          <span style="color: #666;">
            • Double-check your WWS ID<br>
            • Verify personal information<br>
            • Contact support for clarification
          </span>
        </div>
      </div>
      `,
      "Contact Support"
    ).then((result) => {
      if (result.isConfirmed) {
        handleContactSupport();
      }
    });
  };

  const handleRejectionDetails = () => {
    showAlert.info(
      "Rejection Details",
      `
      <div style="text-align: center; line-height: 1.6;">
        <div style="background: #f8d7da; padding: 10px; border-radius: 6px; border: 1px solid #f5c6cb; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
            <div style="width: 10px; height: 10px; background: #dc3545; border-radius: 50%; margin-right: 8px;"></div>
            <strong>Status: Application Rejected</strong>
          </div>
          <p style="color: #666; margin: 0; font-size: 0.85em;">
            WWS ID: ${rejectionData.wwsId} • ${formatDateTime(rejectionData.rejectionDate)}
          </p>
        </div>
        
        <div style="display: flex; gap: 8px; margin-bottom: 10px;">
          <div style="flex: 1; background: white; padding: 6px; border-radius: 4px; border: 1px solid #e9ecef;">
            <strong style="font-size: 0.8em;">📋 Issues</strong><br>
            <span style="color: #666; font-size: 0.75em;">${rejectionData.rejectionReasons.length} found</span>
          </div>
          <div style="flex: 1; background: white; padding: 6px; border-radius: 4px; border: 1px solid #e9ecef;">
            <strong style="font-size: 0.8em;">🔄 Review</strong><br>
            <span style="color: #666; font-size: 0.75em;">${rejectionData.reviewPeriod}</span>
          </div>
        </div>
      </div>
      `,
      "Understand"
    );
  };

  const handleReasonClick = (reason, index) => {
    showAlert.info(
      `Issue ${index + 1}`,
      `
      <div style="text-align: center; line-height: 1.6;">
        <div style="background: #fff3cd; padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #ffc107;">
          <strong>${reason}</strong>
        </div>
        <p style="color: #666; margin-bottom: 10px; font-size: 0.9em;">
          Please address this issue before reapplying.
        </p>
        <div style="background: #e8f5e8; padding: 6px; border-radius: 4px; border-left: 3px solid #4a8c47;">
          <strong>Action Required:</strong><br>
          <span style="color: #666;">Correct and verify information</span>
        </div>
      </div>
      `,
      "Got it"
    );
  };

  const handleTipClick = (tip, number) => {
    showAlert.info(
      `Tip ${number}`,
      `
      <div style="text-align: center; line-height: 1.6;">
        <div style="background: #e3f2fd; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <strong>${tip}</strong>
        </div>
        <div style="background: #fff8e1; padding: 6px; border-radius: 4px; border-left: 3px solid #ffc107;">
          <strong>Helpful Hint:</strong><br>
          <span style="color: #666;">This will improve your application success</span>
        </div>
      </div>
      `,
      "OK"
    );
  };

  const handleRequirementClick = (requirement) => {
    showAlert.info(
      "Document Requirement",
      `
      <div style="text-align: center; line-height: 1.6;">
        <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <strong>${requirement}</strong>
        </div>
        <p style="color: #666; margin-bottom: 10px; font-size: 0.9em;">
          Ensure this document is valid and up-to-date for verification.
        </p>
        <div style="background: #e8f5e8; padding: 6px; border-radius: 4px; border-left: 3px solid #4a8c47;">
          <strong>Status:</strong><br>
          <span style="color: #666;">Required for approval</span>
        </div>
      </div>
      `,
      "Understand"
    );
  };

  return (
    <div className="container-fluid px-4 py-3">
      {/* Enhanced Header - Cleaner styling */}
      <div className="text-center mb-4">
        <div className="d-flex justify-content-center align-items-center mb-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center me-3 position-relative flex-shrink-0"
            style={{
              width: "50px",
              height: "50px",
              background: "#dc3545",
              boxShadow: "0 4px 15px rgba(220, 53, 69, 0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(220, 53, 69, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(220, 53, 69, 0.3)";
            }}
          >
            <FaExclamationTriangle size={22} className="text-white" />
          </div>
          <div className="text-start">
            <h1 className="h4 mb-1 fw-bold" style={{ color: "#2d5a27" }}>
              Application Rejected
            </h1>
            <p className="text-muted mb-0 small">
              Your registration for WWS ID: <strong>{rejectionData.wwsId}</strong> has been rejected
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Grid Layout */}
      <div className="row g-3">
        {/* Rejection Status Card - Cleaner styling */}
        <div className="col-12 col-lg-8">
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
                    background: "#dc3545",
                    color: "white",
                    boxShadow: "0 3px 10px rgba(220, 53, 69, 0.3)",
                  }}
                >
                  <FaExclamationTriangle size={14} />
                </div>
                <h6 className="mb-0 fw-bold" style={{ color: "#2d5a27" }}>
                  Rejection Details
                </h6>
              </div>
            </div>
            <div className="card-body p-3">
              <div className="row g-2">
                <div className="col-12 col-sm-6">
                  <div
                    className="d-flex align-items-center p-2 rounded-3 position-relative overflow-hidden"
                    style={{
                      background: "rgba(220, 53, 69, 0.1)",
                      border: "1px solid rgba(220, 53, 69, 0.3)",
                      boxShadow: "0 3px 12px rgba(220, 53, 69, 0.15)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onClick={handleRejectionDetails}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(220, 53, 69, 0.15)";
                      e.currentTarget.style.borderColor = "rgba(220, 53, 69, 0.5)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 5px 18px rgba(220, 53, 69, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(220, 53, 69, 0.1)";
                      e.currentTarget.style.borderColor = "rgba(220, 53, 69, 0.3)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 3px 12px rgba(220, 53, 69, 0.15)";
                    }}
                  >
                    <FaExclamationTriangle className="text-danger me-2 flex-shrink-0" size={14} />
                    <div>
                      <small className="text-muted d-block fw-semibold" style={{ fontSize: "0.75rem" }}>
                        Status
                      </small>
                      <span className="badge small px-2 py-1 fw-semibold" style={{
                        background: "#dc3545",
                        color: "white",
                        fontSize: "0.75rem",
                        boxShadow: "0 2px 8px rgba(220, 53, 69, 0.3)",
                      }}>
                        Rejected
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div
                    className="d-flex align-items-center p-2 rounded-3 position-relative overflow-hidden"
                    style={{
                      background: "rgba(255, 193, 7, 0.1)",
                      border: "1px solid rgba(255, 193, 7, 0.3)",
                      boxShadow: "0 3px 12px rgba(255, 193, 7, 0.15)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onClick={handleRejectionDetails}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 193, 7, 0.15)";
                      e.currentTarget.style.borderColor = "rgba(255, 193, 7, 0.5)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 5px 18px rgba(255, 193, 7, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 193, 7, 0.1)";
                      e.currentTarget.style.borderColor = "rgba(255, 193, 7, 0.3)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 3px 12px rgba(255, 193, 7, 0.15)";
                    }}
                  >
                    <FaClock className="text-warning me-2 flex-shrink-0" size={14} />
                    <div>
                      <small className="text-muted d-block fw-semibold" style={{ fontSize: "0.75rem" }}>
                        Rejected On
                      </small>
                      <span className="fw-semibold small" style={{ color: "#2d5a27", fontSize: "0.8rem" }}>
                        {formatDateTime(rejectionData.rejectionDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div
                    className="rounded-3 p-3 mt-2 position-relative overflow-hidden"
                    style={{
                      background: "rgba(220, 53, 69, 0.05)",
                      border: "1px solid rgba(220, 53, 69, 0.2)",
                      boxShadow: "0 3px 15px rgba(220, 53, 69, 0.1)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(220, 53, 69, 0.08)";
                      e.currentTarget.style.borderColor = "rgba(220, 53, 69, 0.3)";
                      e.currentTarget.style.boxShadow = "0 5px 20px rgba(220, 53, 69, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(220, 53, 69, 0.05)";
                      e.currentTarget.style.borderColor = "rgba(220, 53, 69, 0.2)";
                      e.currentTarget.style.boxShadow = "0 3px 15px rgba(220, 53, 69, 0.1)";
                    }}
                  >
                    <div className="d-flex align-items-center mb-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "20px",
                          height: "20px",
                          background: "#dc3545",
                          color: "white",
                          boxShadow: "0 2px 8px rgba(220, 53, 69, 0.3)",
                        }}
                      >
                        <FaInfoCircle size={10} />
                      </div>
                      <small className="fw-semibold" style={{ color: "#2d5a27", fontSize: "0.85rem" }}>
                        Rejection Reason
                      </small>
                    </div>
                    <div className="mb-2">
                      {rejectionData.rejectionReasons.map((reason, index) => (
                        <div
                          key={index}
                          className="d-flex align-items-start mb-2"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleReasonClick(reason, index)}
                        >
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                            style={{
                              width: "20px",
                              height: "20px",
                              background: "#dc3545",
                              color: "white",
                              fontSize: "0.65rem",
                              fontWeight: "600",
                              boxShadow: "0 2px 6px rgba(220, 53, 69, 0.3)",
                              marginTop: "1px",
                            }}
                          >
                            {index + 1}
                          </div>
                          <small 
                            className="text-muted" 
                            style={{ 
                              fontSize: "0.75rem", 
                              lineHeight: "1.4",
                              flex: 1
                            }}
                          >
                            {reason}
                          </small>
                        </div>
                      ))}
                    </div>
                    <p className="mb-0 small text-muted" style={{ lineHeight: "1.4", fontSize: "0.8rem" }}>
                      <strong>Note:</strong> {rejectionData.adminNotes}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card - Removed "Reapply Now" button */}
        <div className="col-12 col-lg-4">
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
              <h6 className="mb-0 fw-bold" style={{ color: "#2d5a27" }}>
                Quick Actions
              </h6>
            </div>
            <div className="card-body p-3 d-flex flex-column">
              <button
                className="btn w-100 d-flex align-items-center justify-content-center py-2 mb-2 position-relative overflow-hidden"
                onClick={handleContactSupport}
                style={{
                  background: "#2d5a27",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(45, 90, 39, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 8px 25px rgba(45, 90, 39, 0.4)";
                  e.target.style.background = "#4a8c47";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(45, 90, 39, 0.3)";
                  e.target.style.background = "#2d5a27";
                }}
              >
                <FaEnvelope className="me-2" size={12} />
                Contact Support
                <FaArrowRight className="ms-2" size={10} />
              </button>

              <div className="text-center mt-2">
                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                  <FaClock className="me-1" size={10} />
                  Mon-Fri, 8AM-5PM
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Helpful Tips Card - Cleaner styling */}
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
                    background: "#ffc107",
                    color: "white",
                    boxShadow: "0 3px 10px rgba(255, 193, 7, 0.3)",
                  }}
                >
                  <FaQuestionCircle size={12} />
                </div>
                <h6 className="mb-0 fw-semibold" style={{ color: "#2d5a27" }}>
                  Helpful Tips
                </h6>
              </div>
            </div>
            <div className="card-body p-3">
              <div className="row g-2">
                {[
                  "Double-check your WWS ID from your latest water bill",
                  "Ensure your name matches exactly with the account holder's name",
                  "Provide complete and accurate address information",
                  "Have your latest water bill ready for reference"
                ].map((tip, index) => (
                  <div key={index} className="col-12 col-sm-6">
                    <div
                      className="d-flex align-items-start p-2 rounded-3 mb-2 border position-relative overflow-hidden"
                      style={{
                        background: "white",
                        borderColor: "rgba(255, 193, 7, 0.4) !important",
                        boxShadow: "0 3px 12px rgba(0, 0, 0, 0.12)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onClick={() => handleTipClick(tip, index + 1)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f8f9fa";
                        e.currentTarget.style.borderColor = "rgba(255, 193, 7, 0.6) !important";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 5px 18px rgba(0, 0, 0, 0.18)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                        e.currentTarget.style.borderColor = "rgba(255, 193, 7, 0.4) !important";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 3px 12px rgba(0, 0, 0, 0.12)";
                      }}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0 mt-1"
                        style={{
                          width: "20px",
                          height: "20px",
                          background: "#ffc107",
                          color: "white",
                          fontSize: "0.6rem",
                          fontWeight: "600",
                          boxShadow: "0 3px 10px rgba(255, 193, 7, 0.4)",
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <small className="text-muted" style={{ fontSize: "0.75rem", lineHeight: "1.3" }}>
                          {tip}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Document Requirements Card - Cleaner styling */}
        <div className="col-12 col-lg-6">
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
                    background: "#2196f3",
                    color: "white",
                    boxShadow: "0 3px 10px rgba(33, 150, 243, 0.3)",
                  }}
                >
                  <FaFileAlt size={12} />
                </div>
                <h6 className="mb-0 fw-semibold" style={{ color: "#2d5a27" }}>
                  Required Documents
                </h6>
              </div>
            </div>
            <div className="card-body p-3">
              <div className="row g-2">
                {[
                  "Valid Government ID",
                  "Latest Water Bill",
                  "Proof of Address"
                ].map((requirement, index) => (
                  <div key={index} className="col-12">
                    <div 
                      className="d-flex align-items-center p-2 rounded-3 mb-2 position-relative overflow-hidden"
                      style={{
                        background: "white",
                        border: "1px solid rgba(33, 150, 243, 0.3)",
                        boxShadow: "0 3px 12px rgba(0, 0, 0, 0.1)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onClick={() => handleRequirementClick(requirement)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f8f9fa";
                        e.currentTarget.style.borderColor = "rgba(33, 150, 243, 0.5)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 5px 18px rgba(0, 0, 0, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                        e.currentTarget.style.borderColor = "rgba(33, 150, 243, 0.3)";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 3px 12px rgba(0, 0, 0, 0.1)";
                      }}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                        style={{
                          width: "16px",
                          height: "16px",
                          background: "#2196f3",
                          color: "white",
                          fontSize: "0.5rem",
                          boxShadow: "0 2px 8px rgba(33, 150, 243, 0.4)",
                        }}
                      >
                        <FaFileAlt size={8} />
                      </div>
                      <small className="text-muted" style={{ fontSize: "0.8rem", lineHeight: "1.2" }}>
                        {requirement}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Information Banner - Cleaner styling */}
        <div className="col-12">
          <div
            className="card border-0"
            style={{
              background: "rgba(220, 53, 69, 0.03)",
              border: "1px solid rgba(220, 53, 69, 0.1)",
              boxShadow: "0 6px 20px rgba(220, 53, 69, 0.1)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(220, 53, 69, 0.05)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(220, 53, 69, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(220, 53, 69, 0.03)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(220, 53, 69, 0.1)";
            }}
          >
            <div className="card-body p-3">
              <div className="row align-items-center">
                <div className="col">
                  <p className="mb-0 small text-muted" style={{ fontSize: "0.85rem" }}>
                    <strong>Note:</strong> Please address all the issues mentioned above before reapplying. 
                    Contact our support team if you need clarification or believe there has been a mistake.
                  </p>
                </div>
                <div className="col-auto">
                  <button
                    className="btn btn-sm position-relative overflow-hidden"
                    onClick={handleGetHelp}
                    style={{
                      background: "#2d5a27",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      padding: "0.4rem 0.8rem",
                      fontWeight: "500",
                      transition: "all 0.3s ease",
                      boxShadow: "0 3px 12px rgba(45, 90, 39, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.boxShadow = "0 5px 18px rgba(45, 90, 39, 0.4)";
                      e.target.style.background = "#4a8c47";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 3px 12px rgba(45, 90, 39, 0.3)";
                      e.target.style.background = "#2d5a27";
                    }}
                  >
                    Get Help
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}