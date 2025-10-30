// src/pages/public/Unauthorized.jsx
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaArrowLeft, FaLock, FaExclamationTriangle } from "react-icons/fa";

export default function Unauthorized() {
  const navigate = useNavigate();

  const theme = {
    primary: "#336B34",
    primaryDark: "#1f3d1a",
    primaryLight: "#336C35",
    textPrimary: "#1a2a1a",
    textSecondary: "#4a5c4a",
    backgroundLight: "#f8faf8",
    backgroundWhite: "#ffffff",
    borderColor: "#e0e6e0",
    warning: "#ffc107",
    danger: "#dc3545",
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-body p-5 text-center">
                {/* Warning Icon */}
                <div className="mb-4">
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mx-auto"
                    style={{
                      width: "100px",
                      height: "100px",
                      backgroundColor: `${theme.warning}20`,
                      border: `4px solid ${theme.warning}`,
                    }}
                  >
                    <FaLock 
                      size={40} 
                      style={{ color: theme.warning }}
                    />
                  </div>
                </div>

                {/* Title */}
                <h1
                  className="fw-bold mb-3"
                  style={{ color: theme.textPrimary, fontSize: "2.5rem" }}
                >
                  Access Denied
                </h1>

                {/* Subtitle */}
                <h3
                  className="fw-semibold mb-4"
                  style={{ color: theme.warning }}
                >
                  <FaExclamationTriangle className="me-2" />
                  Unauthorized Access
                </h3>

                {/* Message */}
                <div className="mb-5">
                  <p
                    className="mb-3"
                    style={{ color: theme.textSecondary, fontSize: "1.1rem" }}
                  >
                    You don't have permission to access this page.
                  </p>
                  <p
                    className="mb-0"
                    style={{ color: theme.textSecondary, fontSize: "1rem" }}
                  >
                    This area requires specific user privileges. Please contact the system administrator if you believe this is an error.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                  {/* Go Back Button */}
                  <button
                    onClick={() => navigate(-1)}
                    className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                    style={{
                      borderColor: theme.primary,
                      color: theme.primary,
                      borderRadius: "8px",
                      padding: "12px 24px",
                      fontWeight: "600",
                      minWidth: "160px",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = theme.primary;
                      e.target.style.color = "white";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.color = theme.primary;
                    }}
                  >
                    <FaArrowLeft className="me-2" />
                    Go Back
                  </button>

                  {/* Home Button */}
                  <Link
                    to="/"
                    className="btn d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: theme.primary,
                      color: "white",
                      borderRadius: "8px",
                      padding: "12px 24px",
                      fontWeight: "600",
                      minWidth: "160px",
                      textDecoration: "none",
                      border: "none",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = theme.primaryDark;
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = theme.primary;
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    <FaHome className="me-2" />
                    Go Home
                  </Link>
                </div>

                {/* Additional Help */}
                <div className="mt-5 pt-4 border-top">
                  <p
                    className="small mb-2"
                    style={{ color: theme.textSecondary }}
                  >
                    Need help?
                  </p>
                  <div className="d-flex justify-content-center gap-4">
                    <a
                      href="mailto:support@aurorawater.com"
                      className="text-decoration-none small fw-semibold"
                      style={{ color: theme.primary }}
                    >
                      Contact Support
                    </a>
                    <span style={{ color: theme.borderColor }}>|</span>
                    <a
                      href="tel:+63-XXX-XXX-XXXX"
                      className="text-decoration-none small fw-semibold"
                      style={{ color: theme.primary }}
                    >
                      Call Administrator
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <p
                className="small"
                style={{ color: theme.textSecondary }}
              >
                Aurora Waterworks Payflow System &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .btn {
          transition: all 0.3s ease-in-out;
        }
        
        .card {
          animation: fadeInUp 0.6s ease-out;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 576px) {
          .card-body {
            padding: 2rem !important;
          }
          
          h1 {
            font-size: 2rem !important;
          }
        }

        /* Hover effects for links */
        a:hover {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}