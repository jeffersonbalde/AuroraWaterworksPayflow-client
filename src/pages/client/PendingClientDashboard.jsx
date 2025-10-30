// src/components/Dashboard/PendingClientDashboard.jsx - MINIMALIST WITH PLAIN HEADERS & ANIMATIONS
import { 
  FaClock, 
  FaEnvelope, 
  FaPhone, 
  FaCheckCircle,
  FaUserCheck,
  FaFileAlt,
  FaShieldAlt,
  FaInfoCircle,
  FaArrowRight,
  FaUser,
  FaBuilding,
  FaIdCard
} from "react-icons/fa";
import { showAlert } from "../../services/notificationService";

export default function PendingClientDashboard() {
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
        <p style="color: #666; margin-bottom: 12px;">We're here to help with your account approval.</p>
        <div style="background: #fffbf0; padding: 8px; border-radius: 6px; border-left: 3px solid #ffc107;">
          <strong>💡 Quick Tips:</strong><br>
          <span style="color: #666;">
            • Check email regularly<br>
            • Ensure info is accurate<br>
            • 1-2 business days approval
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

  const handleStatusInquiry = () => {
    showAlert.info(
      "Account Status",
      `
      <div style="text-align: center; line-height: 1.6;">
        <div style="background: #f8fff9; padding: 10px; border-radius: 6px; border: 1px solid #d4edda; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
            <div style="width: 10px; height: 10px; background: #ffc107; border-radius: 50%; margin-right: 8px;"></div>
            <strong>Status: Pending Review</strong>
          </div>
          <p style="color: #666; margin: 0; font-size: 0.85em;">
            Your account is under administrative review.
          </p>
        </div>
        
        <div style="display: flex; gap: 8px; margin-bottom: 10px;">
          <div style="flex: 1; background: white; padding: 6px; border-radius: 4px; border: 1px solid #e9ecef;">
            <strong style="font-size: 0.8em;">⏱️ Time</strong><br>
            <span style="color: #666; font-size: 0.75em;">1-2 days</span>
          </div>
          <div style="flex: 1; background: white; padding: 6px; border-radius: 4px; border: 1px solid #e9ecef;">
            <strong style="font-size: 0.8em;">📅 Started</strong><br>
            <span style="color: #666; font-size: 0.75em;">${new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      `,
      "Understand"
    );
  };

  const handleProcessStepClick = (step, title) => {
    showAlert.info(
      `Step ${step}: ${title}`,
      `
      <div style="text-align: center; line-height: 1.6;">
        <div style="background: #f8f9fa; padding: 8px; border-radius: 6px; margin-bottom: 10px;">
          <strong>Process Details</strong><br>
          <span style="color: #666;">
            Part of our account verification process.
          </span>
        </div>
        
        <div style="background: #e8f5e8; padding: 6px; border-radius: 4px; border-left: 3px solid #4a8c47;">
          <strong>Current Progress:</strong><br>
          <span style="color: #666;">
            Step ${step} of 4 - ${step === 1 ? 'In Progress' : 'Pending'}
          </span>
        </div>
      </div>
      `,
      "Got it"
    );
  };

  const handleFeatureClick = (featureText) => {
    showAlert.info(
      "Feature Preview",
      `
      <div style="text-align: center; line-height: 1.6;">
        <div style="background: #e3f2fd; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <strong>${featureText}</strong>
        </div>
        
        <p style="color: #666; margin-bottom: 10px; font-size: 0.9em;">
          Available after account approval.
        </p>
        
        <div style="background: #fff8e1; padding: 6px; border-radius: 4px; border-left: 3px solid #ffc107;">
          <strong>Status:</strong><br>
          <span style="color: #666;">Pending approval</span>
        </div>
      </div>
      `,
      "OK"
    );
  };

  return (
    <div className="container-fluid px-4 py-3">
      {/* Enhanced Header */}
      <div className="text-center mb-4">
        <div className="d-flex justify-content-center align-items-center mb-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center me-3 position-relative flex-shrink-0"
            style={{
              width: "50px",
              height: "50px",
              background: "#2d5a27",
              boxShadow: "0 4px 15px rgba(45, 90, 39, 0.4)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(45, 90, 39, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(45, 90, 39, 0.4)";
            }}
          >
            <FaClock size={22} className="text-white" />
          </div>
          <div className="text-start">
            <h1 className="h4 mb-1 fw-bold" style={{ color: "#2d5a27" }}>
              Account Under Review
            </h1>
            <p className="text-muted mb-0 small">
              Your registration is being processed by our administration team
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Grid Layout */}
      <div className="row g-3">
        {/* Status Card - Enhanced */}
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
                    background: "#2d5a27",
                    color: "white",
                    boxShadow: "0 3px 10px rgba(45, 90, 39, 0.4)",
                  }}
                >
                  <FaClock size={14} />
                </div>
                <h6 className="mb-0 fw-bold" style={{ color: "#2d5a27" }}>
                  Approval Status
                </h6>
              </div>
            </div>
            <div className="card-body p-3">
              <div className="row g-2">
                <div className="col-12 col-sm-6">
                  <div
                    className="d-flex align-items-center p-2 rounded-3 position-relative overflow-hidden"
                    style={{
                      background: "rgba(255, 193, 7, 0.1)",
                      border: "1px solid rgba(255, 193, 7, 0.3)",
                      boxShadow: "0 3px 12px rgba(255, 193, 7, 0.25)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onClick={handleStatusInquiry}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 193, 7, 0.15)";
                      e.currentTarget.style.borderColor = "rgba(255, 193, 7, 0.5)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 5px 18px rgba(255, 193, 7, 0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 193, 7, 0.1)";
                      e.currentTarget.style.borderColor = "rgba(255, 193, 7, 0.3)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 3px 12px rgba(255, 193, 7, 0.25)";
                    }}
                  >
                    <FaClock className="text-warning me-2 flex-shrink-0" size={14} />
                    <div>
                      <small className="text-muted d-block fw-semibold" style={{ fontSize: "0.75rem" }}>
                        Status
                      </small>
                      <span className="badge small px-2 py-1 fw-semibold" style={{
                        background: "#ffc107",
                        color: "white",
                        fontSize: "0.75rem",
                        boxShadow: "0 2px 8px rgba(255, 193, 7, 0.4)",
                      }}>
                        Pending Review
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div
                    className="d-flex align-items-center p-2 rounded-3 position-relative overflow-hidden"
                    style={{
                      background: "rgba(74, 140, 71, 0.1)",
                      border: "1px solid rgba(74, 140, 71, 0.3)",
                      boxShadow: "0 3px 12px rgba(74, 140, 71, 0.25)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onClick={handleStatusInquiry}
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
                    <FaClock className="text-success me-2 flex-shrink-0" size={14} />
                    <div>
                      <small className="text-muted d-block fw-semibold" style={{ fontSize: "0.75rem" }}>
                        Estimated Time
                      </small>
                      <span className="fw-semibold small" style={{ color: "#2d5a27", fontSize: "0.8rem" }}>
                        1-2 business days
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div
                    className="rounded-3 p-3 mt-2 position-relative overflow-hidden"
                    style={{
                      background: "rgba(45, 90, 39, 0.08)",
                      border: "1px solid rgba(45, 90, 39, 0.2)",
                      boxShadow: "0 3px 15px rgba(45, 90, 39, 0.2)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(45, 90, 39, 0.12)";
                      e.currentTarget.style.borderColor = "rgba(45, 90, 39, 0.3)";
                      e.currentTarget.style.boxShadow = "0 5px 20px rgba(45, 90, 39, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(45, 90, 39, 0.08)";
                      e.currentTarget.style.borderColor = "rgba(45, 90, 39, 0.2)";
                      e.currentTarget.style.boxShadow = "0 3px 15px rgba(45, 90, 39, 0.2)";
                    }}
                  >
                    <div className="d-flex align-items-center mb-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "20px",
                          height: "20px",
                          background: "#2d5a27",
                          color: "white",
                          boxShadow: "0 2px 8px rgba(45, 90, 39, 0.4)",
                        }}
                      >
                        <FaInfoCircle size={10} />
                      </div>
                      <small className="fw-semibold" style={{ color: "#2d5a27", fontSize: "0.85rem" }}>
                        Current Status
                      </small>
                    </div>
                    <p className="mb-0 small text-muted" style={{ lineHeight: "1.4", fontSize: "0.8rem" }}>
                      Thank you for registering with Aurora Waterworks Payflow. Your account details are currently 
                      undergoing verification and administrative review to ensure secure access to our services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card - Enhanced */}
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
                  boxShadow: "0 4px 15px rgba(45, 90, 39, 0.4)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 8px 25px rgba(45, 90, 39, 0.6)";
                  e.target.style.background = "#4a8c47";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(45, 90, 39, 0.4)";
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

        {/* Process Steps - Enhanced with Plain Headers */}
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
                    boxShadow: "0 3px 10px rgba(255, 193, 7, 0.4)",
                  }}
                >
                  <FaFileAlt size={12} />
                </div>
                <h6 className="mb-0 fw-semibold" style={{ color: "#2d5a27" }}>
                  Approval Process
                </h6>
              </div>
            </div>
            <div className="card-body p-3">
              <div className="row g-2">
                {[
                  {
                    step: "1",
                    title: "Document Verification",
                    description: "WWS ID and account details verification",
                    color: "#ffc107",
                    icon: FaFileAlt,
                  },
                  {
                    step: "2",
                    title: "Security Check",
                    description: "Account security and permissions review",
                    color: "#4a8c47",
                    icon: FaShieldAlt,
                  },
                  {
                    step: "3",
                    title: "Admin Approval",
                    description: "Final review by administration team",
                    color: "#2196f3",
                    icon: FaUserCheck,
                  },
                  {
                    step: "4",
                    title: "Account Activation",
                    description: "Full access to water services portal",
                    color: "#5da55a",
                    icon: FaCheckCircle,
                  },
                ].map((item, index) => (
                  <div key={index} className="col-12 col-sm-6">
                    <div
                      className="d-flex align-items-start p-2 rounded-3 mb-2 border position-relative overflow-hidden"
                      style={{
                        background: "white",
                        borderColor: `${item.color}40 !important`,
                        boxShadow: "0 3px 12px rgba(0, 0, 0, 0.15)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onClick={() => handleProcessStepClick(item.step, item.title)}
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
                      <div>
                        <small className="fw-semibold d-block" style={{ color: "#2d5a27", fontSize: "0.8rem" }}>
                          {item.title}
                        </small>
                        <small className="text-muted" style={{ fontSize: "0.75rem", lineHeight: "1.3" }}>
                          {item.description}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Card - Enhanced with Plain Headers */}
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
                    boxShadow: "0 3px 10px rgba(33, 150, 243, 0.4)",
                  }}
                >
                  <FaCheckCircle size={12} />
                </div>
                <h6 className="mb-0 fw-semibold" style={{ color: "#2d5a27" }}>
                  What to Expect
                </h6>
              </div>
            </div>
            <div className="card-body p-3">
              <div className="row g-2">
                {[
                  { text: "Email notification upon approval", color: "#4a8c47" },
                  { text: "Access to full client dashboard", color: "#5da55a" },
                  { text: "Water consumption monitoring", color: "#6fbf67" },
                  { text: "Online bill payment features", color: "#2196f3" },
                  { text: "24/7 account management", color: "#ff9800" },
                  { text: "Real-time usage analytics", color: "#9c27b0" }
                ].map((feature, index) => (
                  <div key={index} className="col-12 col-sm-6">
                    <div 
                      className="d-flex align-items-center p-2 rounded-3 mb-2 position-relative overflow-hidden"
                      style={{
                        background: "white",
                        border: `1px solid ${feature.color}30`,
                        boxShadow: "0 3px 12px rgba(0, 0, 0, 0.12)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onClick={() => handleFeatureClick(feature.text)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f8f9fa";
                        e.currentTarget.style.borderColor = `${feature.color}60`;
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 5px 18px rgba(0, 0, 0, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                        e.currentTarget.style.borderColor = `${feature.color}30`;
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 3px 12px rgba(0, 0, 0, 0.12)";
                      }}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                        style={{
                          width: "16px",
                          height: "16px",
                          background: feature.color,
                          color: "white",
                          fontSize: "0.5rem",
                          boxShadow: `0 2px 8px ${feature.color}50`,
                        }}
                      >
                        <FaCheckCircle size={8} />
                      </div>
                      <small className="text-muted" style={{ fontSize: "0.8rem", lineHeight: "1.2" }}>
                        {feature.text}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Information Banner */}
        <div className="col-12">
          <div
            className="card border-0"
            style={{
              background: "rgba(45, 90, 39, 0.03)",
              border: "1px solid rgba(45, 90, 39, 0.1)",
              boxShadow: "0 6px 20px rgba(45, 90, 39, 0.2)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(45, 90, 39, 0.05)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(45, 90, 39, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(45, 90, 39, 0.03)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(45, 90, 39, 0.2)";
            }}
          >
            <div className="card-body p-3">
              <div className="row align-items-center">
                <div className="col">
                  <p className="mb-0 small text-muted" style={{ fontSize: "0.85rem" }}>
                    <strong>Note:</strong> Your account has limited access while pending approval. 
                    You will receive full system access once your account is approved by the administration team.
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