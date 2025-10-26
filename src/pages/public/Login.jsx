import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
} from "react-icons/fa";
import LoginBackground from "../../assets/images/login-bg2.png";
import Logo from "../../assets/images/logo.png";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const navigate = useNavigate();

  // Enhanced theme with more colors from your old project
  const theme = {
    primary: "#336B34",
    primaryDark: "#1f3d1a",
    primaryLight: "#336C35",
    textPrimary: "#1a2a1a",
    textSecondary: "#4a5c4a",
    backgroundLight: "#f8faf8",
    backgroundWhite: "#ffffff",
    borderColor: "#e0e6e0",
  };

  useEffect(() => {
    const img = new Image();
    img.src = LoginBackground;
    img.onload = () => setBackgroundLoaded(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate login process
    setTimeout(() => {
      setIsSubmitting(false);
      console.log("Login attempted:", form);
    }, 1500);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert(
      "Please contact Aurora Waterworks administration to reset your password."
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center position-relative py-3 py-md-4">
      {/* Background */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backgroundImage: `url(${LoginBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: theme.backgroundLight,
          filter: backgroundLoaded ? "blur(0px)" : "blur(8px)",
          transition: "filter 0.6s ease",
        }}
      />

      {/* Logo Section - Outside the white panel */}
      <div className="position-relative" style={{ zIndex: 10 }}>
        <div className="d-flex align-items-center justify-content-center">
          {/* System Logo Only - Responsive sizing */}
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: "clamp(100px, 20vw, 120px)",
              height: "clamp(100px, 20vw, 120px)",
              flexShrink: 0,
              filter: logoLoaded ? "blur(0px)" : "blur(8px)",
              opacity: logoLoaded ? 1 : 0,
              transition: "all 0.6s ease",
            }}
          >
            <img
              src={Logo}
              alt="Aurora Waterworks Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              onLoad={() => setLogoLoaded(true)}
            />
          </div>
        </div>
      </div>

      {/* Welcome Text - Outside the form card in column layout */}
      <div 
        className="position-relative text-center mb-3"
        style={{ 
          zIndex: 10,
          opacity: backgroundLoaded && logoLoaded ? 1 : 0,
          transform: backgroundLoaded && logoLoaded ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.6s ease-in-out",
          marginTop: "-0.3rem",
        }}
      >
        <div className="d-flex flex-column align-items-center">
          <h1
            className="fw-bold mb-1"
            style={{
              color: "white",
              fontSize: "clamp(1.6rem, 5vw, 2rem)",
              lineHeight: "1.1",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
              fontWeight: "700",
            }}
          >
            Welcome to Aurora
          </h1>
          <h1
            className="fw-bold"
            style={{
              color: "white",
              fontSize: "clamp(1.6rem, 5vw, 2rem)",
              lineHeight: "1.1",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
              fontWeight: "700",
            }}
          >
            Waterworks Payflow
          </h1>
        </div>
      </div>

      {/* Form Card */}
      <div
        className="bg-white rounded-4 shadow-lg p-4 p-sm-5 position-relative mx-3"
        style={{
          maxWidth: "430px",
          width: "90%",
          border: `1px solid ${theme.borderColor}`,
          zIndex: 10,
          opacity: backgroundLoaded && logoLoaded ? 1 : 0,
          transform: backgroundLoaded && logoLoaded ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s ease-in-out",
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="mb-3">
            <label
              htmlFor="email"
              className="form-label fw-semibold mb-2"
              style={{
                fontSize: "0.9rem",
                color: theme.textSecondary,
              }}
            >
              Email
            </label>
            <div className="position-relative">
              <FaEnvelope
                className="position-absolute top-50 translate-middle-y text-muted ms-3"
                size={16}
              />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="form-control ps-5 fw-semibold"
                value={form.email}
                onChange={handleInput}
                disabled={isSubmitting}
                required
                style={{
                  backgroundColor: "var(--input-bg, #f8faf8)",
                  color: "var(--input-text, #1a2a1a)",
                  border: "1px solid var(--input-border, #c8d0c8)",
                  borderRadius: "8px",
                }}
                id="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-2">
            <label
              htmlFor="password"
              className="form-label fw-semibold mb-2"
              style={{
                fontSize: "0.9rem",
                color: theme.textSecondary,
              }}
            >
              Password
            </label>
            <div className="position-relative">
              <FaLock
                className="position-absolute top-50 translate-middle-y text-muted ms-3"
                size={16}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                className="form-control ps-5 pe-5 fw-semibold"
                value={form.password}
                onChange={handleInput}
                disabled={isSubmitting}
                required
                style={{
                  backgroundColor: "var(--input-bg, #f8faf8)",
                  color: "var(--input-text, #1a2a1a)",
                  border: "1px solid var(--input-border, #c8d0c8)",
                  borderRadius: "8px",
                }}
                id="password"
              />
              <span
                onClick={() => !isSubmitting && setShowPassword(!showPassword)}
                className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                style={{
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  zIndex: 10,
                }}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </span>
            </div>
          </div>

          {/* Forgot password link - Centered */}
          <div className="d-flex justify-content-end align-items-center mb-4 mt-3">
            <a
              href="#"
              className="small fw-semibold text-decoration-underline"
              onClick={handleForgotPassword}
              style={{ color: theme.primary }}
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn w-100 fw-semibold d-flex justify-content-center align-items-center position-relative"
            disabled={isSubmitting}
            style={{
              backgroundColor: theme.primary,
              color: "white",
              height: "43px",
              borderRadius: "8px",
              border: "none",
              fontSize: "1rem",
              transition: "all 0.3s ease-in-out",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = theme.primaryDark;
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.4)";
              }
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = theme.primary;
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
              }
            }}
            onMouseDown={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.3)";
              }
            }}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="spinner me-2" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Register Link */}
          <p
            className="text-center mt-4 pt-3 mb-0 small fw-semibold border-top"
            style={{
              color: theme.primary,
              paddingTop: "1rem",
              borderColor: theme.borderColor + " !important",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              className="fw-bold text-decoration-underline"
              style={{ color: theme.primary }}
            >
              Register here
            </Link>
          </p>
        </form>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .form-control:focus {
          border-color: ${theme.primary};
          box-shadow: 0 0 0 0.2rem ${theme.primary}25;
        }
        
        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none !important;
          boxShadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
        }

        /* Input field hover effects */
        .form-control:hover:not(:focus):not(:disabled) {
          border-color: ${theme.primary}80;
        }

        /* Link hover effects */
        a.text-decoration-underline:hover {
          opacity: 0.8;
        }

        /* Responsive adjustments for very small screens */
        @media (max-width: 375px) {
          .p-4 {
            padding: 1rem !important;
          }
          
          .p-sm-5 {
            padding: 1.5rem !important;
          }
        }

        /* Mobile responsiveness for welcome text */
        @media (max-width: 576px) {
          .position-relative.text-center.mb-4 {
            margin-bottom: 1.5rem !important;
          }
        }

        /* Extra small devices */
        @media (max-width: 320px) {
          .d-flex.flex-column.align-items-center h1 {
            font-size: 1.4rem !important;
          }
        }
      `}</style>
    </div>
  );
}