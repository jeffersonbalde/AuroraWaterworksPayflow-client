// src/pages/public/Unauthorized.jsx
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaArrowLeft, FaLock } from "react-icons/fa";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            {/* Minimalist Card */}
            <div className="text-center px-4">
              {/* Icon */}
              <div className="mb-4">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "64px",
                    height: "64px",
                    background: "var(--background-white)",
                    border: "1.5px solid var(--accent-color)",
                    color: "var(--accent-color)"
                  }}
                >
                  <FaLock size={20} />
                </div>
              </div>

              {/* Content */}
              <div className="mb-5">
                <h1 className="h4 fw-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  Access Denied
                </h1>
                <p className="mb-2" style={{ color: "var(--text-secondary)" }}>
                  You don't have permission to access this page.
                </p>
                <p className="small mb-0" style={{ color: "var(--text-muted)" }}>
                  Contact the system administrator for assistance.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-2 mb-5">
                <button
                  onClick={() => navigate(-1)}
                  className="btn d-flex align-items-center justify-content-center gap-2"
                  style={{
                    background: "var(--background-white)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    padding: "0.5rem 1rem",
                    fontWeight: "500",
                    fontSize: "0.875rem"
                  }}
                >
                  <FaArrowLeft size={14} />
                  Go Back
                </button>

                <Link
                  to="/"
                  className="btn d-flex align-items-center justify-content-center gap-2 text-decoration-none"
                  style={{
                    background: "var(--primary-color)",
                    color: "var(--btn-primary-text)",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.5rem 1rem",
                    fontWeight: "500",
                    fontSize: "0.875rem"
                  }}
                >
                  <FaHome size={14} />
                  Go Home
                </Link>
              </div>

              {/* Support Links */}
              <div className="border-top pt-3" style={{ borderColor: "var(--border-color) !important" }}>
                <div className="d-flex justify-content-center gap-3">
                  <a
                    href="mailto:admin@aurorawater.com"
                    className="small text-decoration-none"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Email admin
                  </a>
                  <a
                    href="tel:+63-XXX-XXX-XXXX"
                    className="small text-decoration-none"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Call support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .btn {
          transition: all 0.2s ease;
        }
        
        .btn:hover {
          transform: translateY(-1px);
        }
        
        .btn:active {
          transform: translateY(0);
        }
        
        /* Primary button hover */
        .btn[style*="var(--primary-color)"]:hover {
          background: var(--primary-dark) !important;
        }
        
        /* Secondary button hover */
        .btn[style*="var(--background-white)"]:hover {
          background: var(--background-light) !important;
        }
      `}</style>
    </div>
  );
}