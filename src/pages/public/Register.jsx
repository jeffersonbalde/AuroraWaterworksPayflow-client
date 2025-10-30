import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaUser,
  FaIdCard,
  FaPhone,
  FaHome,
} from "react-icons/fa";
import LoginBackground from "../../assets/images/register-bg.jpg";
import Logo from "../../assets/images/logo.png";
import { useAuth } from "../../contexts/AuthContext";
import { showAlert, showToast } from "../../services/notificationService";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const { register } = useAuth();

  const [form, setForm] = useState({
    wwsId: "",
    fullName: "",
    email: "",
    contactNumber: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
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
    success: "#28a745",
    danger: "#dc3545",
    warning: "#ffc107",
  };

  useEffect(() => {
    const img = new Image();
    img.src = LoginBackground;
    img.onload = () => setBackgroundLoaded(true);
    setIsMounted(true);
  }, []);

  // Enhanced validation function
  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!form.wwsId.trim()) newErrors.wwsId = "WWS ID is required";
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    if (!acceptedTerms)
      newErrors.terms = "You must accept the terms and conditions";

    // Email validation
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (form.password && form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Password match validation
    if (
      form.password &&
      form.confirmPassword &&
      form.password !== form.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Contact number validation - only numbers, exactly 11 digits
    if (form.contactNumber && form.contactNumber.length > 0) {
      const contactRegex = /^[0-9]{11}$/;
      if (!contactRegex.test(form.contactNumber)) {
        newErrors.contactNumber = "Contact number must be exactly 11 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enhanced input handler with validation
  const handleInput = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    // Special handling for contact number - only allow numbers and limit to 11 digits
    if (name === "contactNumber") {
      // Remove all non-digit characters and limit to 11 digits
      processedValue = value.replace(/\D/g, "").slice(0, 11);
    }

    setForm((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Real-time validation for specific fields
    if (name === "email" && processedValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(processedValue)) {
        setErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address",
        }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    }

    if (name === "contactNumber" && processedValue.length > 0) {
      if (processedValue.length !== 11) {
        setErrors((prev) => ({
          ...prev,
          contactNumber: "Contact number must be 11 digits",
        }));
      } else {
        setErrors((prev) => ({ ...prev, contactNumber: "" }));
      }
    }
  };

  // Fixed contact number format: 09XX-XXX-XXXX
  const formatContactDisplay = (value) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 7)
      return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}-${numbers.slice(
      7,
      11
    )}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        document.getElementById(firstError)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      showAlert.error("Validation Error", "Please fill in all required fields correctly.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Show loading alert
      const loadingAlert = showAlert.loading("Creating your account...");

      const result = await register({
        wwsId: form.wwsId,
        fullName: form.fullName,
        email: form.email,
        contactNumber: form.contactNumber,
        address: form.address,
        password: form.password,
        password_confirmation: form.confirmPassword,
      });

      // Close loading alert
      showAlert.close();

      if (result.success) {
        // Show success toast
        showToast.success(`Welcome to Aurora Waterworks, ${result.user.name}!`);

        // Navigate after a short delay
        setTimeout(() => {
          navigate(result.redirectTo);
        }, 1500);
      } else {
        if (result.errors) {
          // Handle field-specific errors
          setErrors(result.errors);
          showAlert.error(
            "Registration Failed",
            "Please check the form for errors and try again."
          );
        } else {
          showAlert.error(
            "Registration Failed",
            result.message || "Unable to create account. Please try again."
          );
        }
      }
    } catch (error) {
      showAlert.close();
      showAlert.error(
        "Connection Error",
        "Unable to connect to the server. Please check your internet connection and try again."
      );
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAlreadyHaveAccount = (e) => {
    e.preventDefault();
    navigate("/");
  };

  const handleTermsClick = async (e) => {
    e.preventDefault();
    
    await showAlert.info(
      "Terms and Conditions",
      `
      <div style="text-align: left; max-height: 300px; overflow-y: auto;">
        <p><strong>Account Registration Terms:</strong></p>
        <ul style="padding-left: 20px;">
          <li>Your account requires verification by Aurora Waterworks administration</li>
          <li>You must provide accurate WWS ID and personal information</li>
          <li>Account activation may take 1-3 business days</li>
          <li>You will receive email notification once your account is activated</li>
          <li>Keep your login credentials secure and confidential</li>
        </ul>
        <p><strong>Privacy Policy:</strong></p>
        <ul style="padding-left: 20px;">
          <li>We collect only necessary information for account management</li>
          <li>Your data is protected and will not be shared with third parties</li>
          <li>We use your contact information for system notifications only</li>
        </ul>
      </div>
      `,
      "I Understand"
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column flex-lg-row position-relative">
      {/* Left Panel - Branding with Background (Large screens only) */}
      <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center text-white p-5 position-fixed start-0 top-0 h-100">
        {/* Background Image with Blur Effect */}
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

        {/* Gradient Overlay */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background:
              "linear-gradient(rgba(51, 107, 52, 0.85), rgba(51, 107, 52, 0.85))",
          }}
        />

        {/* Content - Always Clear */}
        <div className="position-relative z-2 d-flex flex-column align-items-center justify-content-center w-100 h-100 px-4">
          <div className="text-center mb-4">
            <div className="d-flex align-items-center justify-content-center mx-auto">
              {/* System Logo Only */}
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  filter: backgroundLoaded ? "blur(0px)" : "blur(8px)",
                  opacity: backgroundLoaded ? 1 : 0,
                  transition: "all 0.6s ease",
                }}
              >
                <img
                  src={Logo}
                  alt="Aurora Waterworks Logo"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <h4
            className="fw-bold text-center mb-3"
            style={{
              color: "white",
              fontSize: "1.8rem",
            }}
          >
            Aurora Waterworks Payflow
          </h4>

          {/* Description */}
          <p
            className="text-center mx-auto"
            style={{
              fontSize: "16px",
              maxWidth: "400px",
              color: "rgba(255,255,255,0.9)",
              lineHeight: "1.6",
              marginBottom: "2rem",
            }}
          >
            Welcome to Aurora Waterworks - Your trusted partner in water service
            management. Register now to access your bills, monitor your water
            consumption, and make convenient online payments.
          </p>

          {/* Features List */}
          <div className="text-start" style={{ maxWidth: "400px" }}>
            <div className="d-flex align-items-center mb-3">
              <div
                className="bg-white rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{ width: "30px", height: "30px" }}
              >
                <span style={{ color: theme.primary, fontSize: "14px" }}>
                  ✓
                </span>
              </div>
              <span style={{ fontSize: "14px" }}>
                View and manage your water bills online
              </span>
            </div>
            <div className="d-flex align-items-center mb-3">
              <div
                className="bg-white rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{ width: "30px", height: "30px" }}
              >
                <span style={{ color: theme.primary, fontSize: "14px" }}>
                  ✓
                </span>
              </div>
              <span style={{ fontSize: "14px" }}>
                Monitor your water consumption in real-time
              </span>
            </div>
            <div className="d-flex align-items-center mb-3">
              <div
                className="bg-white rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{ width: "30px", height: "30px" }}
              >
                <span style={{ color: theme.primary, fontSize: "14px" }}>
                  ✓
                </span>
              </div>
              <span style={{ fontSize: "14px" }}>
                Secure online payment options
              </span>
            </div>
            <div className="d-flex align-items-center">
              <div
                className="bg-white rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{ width: "30px", height: "30px" }}
              >
                <span style={{ color: theme.primary, fontSize: "14px" }}>
                  ✓
                </span>
              </div>
              <span style={{ fontSize: "14px" }}>
                24/7 access to your account information
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="col-12 col-lg-6 ms-lg-auto position-relative">
        {/* Simple background for all screens */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: "#f0f8ff",
            background:
              "linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 50%, #dcedff 100%)",
            opacity: 0.6,
          }}
        ></div>

        {/* Enhanced floating elements with animation */}
        <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden floating-elements">
          <div className="floating-icon floating-water-1">💧</div>
          <div className="floating-icon floating-water-2">💧</div>
          <div className="floating-icon floating-water-3">💧</div>
          <div className="floating-icon floating-water-4">💧</div>
          <div className="floating-icon floating-water-5">💧</div>
          <div className="floating-icon floating-water-6">💧</div>
        </div>

        <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 p-lg-4">
          <div
            className={`bg-white rounded-4 shadow-lg p-4 p-sm-5 w-100 form-container ${
              isMounted ? "fade-in" : ""
            }`}
            style={{
              maxWidth: "480px",
              border: `1px solid ${theme.borderColor}`,
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* Mobile Logo - Only show on small screens */}
            <div className="d-lg-none text-center mb-4">
              <div className="d-flex align-items-center justify-content-center">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    filter: backgroundLoaded ? "blur(0px)" : "blur(8px)",
                    opacity: backgroundLoaded ? 1 : 0,
                    transition: "all 0.6s ease",
                  }}
                >
                  <img
                    src={Logo}
                    alt="Aurora Waterworks Logo"
                    style={{
                      width: "90px",
                      height: "90px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="text-start mb-4">
              <h1
                className="fw-bolder mb-2"
                style={{ color: theme.primary, fontSize: "1.5rem" }}
              >
                Create Your Account
              </h1>
              <p
                className="fw-semibold mb-0"
                style={{
                  lineHeight: "1.4",
                  fontSize: "0.9rem",
                  color: theme.primary,
                }}
              >
                Register to access your water bills and make online payments.
                Your account will be activated after verification.
              </p>
            </div>

            {/* Approval Notice */}
            <div className="alert alert-info text-center small mb-4">
              <strong>Note:</strong> Your account requires verification. You'll
              receive an email once activated.
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* WWS ID */}
              <div className="mb-3 position-relative">
                <label
                  htmlFor="wwsId"
                  className="form-label fw-semibold mb-2"
                  style={{ fontSize: "0.9rem", color: theme.textSecondary }}
                >
                  WWS ID *
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaIdCard className="text-muted" size={16} />
                  </span>
                  <input
                    type="text"
                    name="wwsId"
                    placeholder="WWS ID as shown on your water bill"
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      errors.wwsId ? "is-invalid" : ""
                    }`}
                    value={form.wwsId}
                    onChange={handleInput}
                    disabled={isSubmitting}
                    required
                    style={{
                      backgroundColor: "#f8faf8",
                      color: "#1a2a1a",
                      borderColor: errors.wwsId ? "#dc3545" : "#c8d0c8",
                    }}
                    id="wwsId"
                  />
                </div>
                {errors.wwsId && (
                  <div className="invalid-feedback d-block small mt-1">
                    {errors.wwsId}
                  </div>
                )}
                <div className="form-text small mt-1">
                  Your Waterworks System ID. Admin will verify this against
                  existing records after registration.
                </div>
              </div>

              {/* Full Name */}
              <div className="mb-3 position-relative">
                <label
                  htmlFor="fullName"
                  className="form-label fw-semibold mb-2"
                  style={{ fontSize: "0.9rem", color: theme.textSecondary }}
                >
                  Full Name *
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaUser className="text-muted" size={16} />
                  </span>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name as on water bill"
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      errors.fullName ? "is-invalid" : ""
                    }`}
                    value={form.fullName}
                    onChange={handleInput}
                    disabled={isSubmitting}
                    required
                    style={{
                      backgroundColor: "#f8faf8",
                      color: "#1a2a1a",
                      borderColor: errors.fullName ? "#dc3545" : "#c8d0c8",
                    }}
                    id="fullName"
                  />
                </div>
                {errors.fullName && (
                  <div className="invalid-feedback d-block small mt-1">
                    {errors.fullName}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="mb-3 position-relative">
                <label
                  htmlFor="email"
                  className="form-label fw-semibold mb-2"
                  style={{ fontSize: "0.9rem", color: theme.textSecondary }}
                >
                  Email Address *
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaEnvelope className="text-muted" size={16} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    value={form.email}
                    onChange={handleInput}
                    disabled={isSubmitting}
                    required
                    style={{
                      backgroundColor: "#f8faf8",
                      color: "#1a2a1a",
                      borderColor: errors.email ? "#dc3545" : "#c8d0c8",
                    }}
                    id="email"
                  />
                </div>
                {errors.email && (
                  <div className="invalid-feedback d-block small mt-1">
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Contact Number */}
              <div className="mb-3 position-relative">
                <label
                  htmlFor="contactNumber"
                  className="form-label fw-semibold mb-2"
                  style={{ fontSize: "0.9rem", color: theme.textSecondary }}
                >
                  Contact Number
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaPhone className="text-muted" size={16} />
                  </span>
                  <input
                    type="text"
                    name="contactNumber"
                    placeholder="09XX-XXX-XXXX (11 digits)"
                    value={formatContactDisplay(form.contactNumber)}
                    onChange={handleInput}
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      errors.contactNumber ? "is-invalid" : ""
                    }`}
                    disabled={isSubmitting}
                    required
                    maxLength={13} // 11 digits + 2 dashes
                    style={{
                      backgroundColor: "#f8faf8",
                      color: "#1a2a1a",
                      borderColor: errors.contactNumber ? "#dc3545" : "#c8d0c8",
                    }}
                    id="contactNumber"
                  />
                </div>
                {errors.contactNumber && (
                  <div className="invalid-feedback d-block small mt-1">
                    {errors.contactNumber}
                  </div>
                )}
                <div className="form-text small mt-1">
                  Format: 09XX-XXX-XXXX (11 digits total, numbers only)
                </div>
              </div>

              {/* Address */}
              <div className="mb-3 position-relative">
                <label
                  htmlFor="address"
                  className="form-label fw-semibold mb-2"
                  style={{ fontSize: "0.9rem", color: theme.textSecondary }}
                >
                  Address
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaHome className="text-muted" size={16} />
                  </span>
                  <input
                    type="text"
                    name="address"
                    placeholder="Enter your address"
                    className="form-control border-start-0 ps-2 fw-semibold"
                    value={form.address}
                    onChange={handleInput}
                    disabled={isSubmitting}
                    required
                    style={{
                      backgroundColor: "#f8faf8",
                      color: "#1a2a1a",
                      borderColor: "#c8d0c8",
                    }}
                    id="address"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-3 position-relative">
                <label
                  htmlFor="password"
                  className="form-label fw-semibold mb-2"
                  style={{ fontSize: "0.9rem", color: theme.textSecondary }}
                >
                  Password *
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaLock className="text-muted" size={16} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    value={form.password}
                    onChange={handleInput}
                    disabled={isSubmitting}
                    required
                    style={{
                      backgroundColor: "#f8faf8",
                      color: "#1a2a1a",
                      borderColor: errors.password ? "#dc3545" : "#c8d0c8",
                    }}
                    id="password"
                  />
                  <span className="input-group-text bg-transparent border-start-0">
                    <button
                      type="button"
                      className="btn btn-sm p-0 border-0 bg-transparent text-muted"
                      onClick={() =>
                        !isSubmitting && setShowPassword(!showPassword)
                      }
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <FaEyeSlash size={14} />
                      ) : (
                        <FaEye size={14} />
                      )}
                    </button>
                  </span>
                </div>
                {errors.password && (
                  <div className="invalid-feedback d-block small mt-1">
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-4 position-relative">
                <label
                  htmlFor="confirmPassword"
                  className="form-label fw-semibold mb-2"
                  style={{ fontSize: "0.9rem", color: theme.textSecondary }}
                >
                  Confirm Password *
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaLock className="text-muted" size={16} />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      errors.confirmPassword ? "is-invalid" : ""
                    }`}
                    value={form.confirmPassword}
                    onChange={handleInput}
                    disabled={isSubmitting}
                    required
                    style={{
                      backgroundColor: "#f8faf8",
                      color: "#1a2a1a",
                      borderColor: errors.confirmPassword
                        ? "#dc3545"
                        : "#c8d0c8",
                    }}
                    id="confirmPassword"
                  />
                  <span className="input-group-text bg-transparent border-start-0">
                    <button
                      type="button"
                      className="btn btn-sm p-0 border-0 bg-transparent text-muted"
                      onClick={() =>
                        !isSubmitting &&
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash size={14} />
                      ) : (
                        <FaEye size={14} />
                      )}
                    </button>
                  </span>
                </div>
                {errors.confirmPassword && (
                  <div className="invalid-feedback d-block small mt-1">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="mb-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: acceptedTerms
                        ? theme.primary
                        : "#f8faf8",
                      borderColor: acceptedTerms
                        ? theme.primary
                        : theme.borderColor,
                    }}
                  />
                  <label
                    className="form-check-label small"
                    htmlFor="terms"
                    style={{ color: theme.textSecondary }}
                  >
                    I agree to the{" "}
                    <a
                      href="#"
                      onClick={handleTermsClick}
                      style={{ color: theme.primary }}
                    >
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      onClick={handleTermsClick}
                      style={{ color: theme.primary }}
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>
                {errors.terms && (
                  <div
                    className="invalid-feedback d-block"
                    style={{ display: "block" }}
                  >
                    {errors.terms}
                  </div>
                )}
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
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              {/* Login Link */}
              <p
                className="text-center mt-4 pt-3 mb-0 small fw-semibold border-top"
                style={{
                  color: theme.primary,
                  paddingTop: "1rem",
                  borderColor: theme.borderColor + " !important",
                }}
              >
                Already have an account?{" "}
                <a
                  href="#"
                  className="fw-bold text-decoration-underline"
                  style={{ color: theme.primary }}
                  onClick={handleAlreadyHaveAccount}
                >
                  Sign in here
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        /* Form Container Animation */
        .form-container {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease-in-out;
        }

        .form-container.fade-in {
          opacity: 1;
          transform: translateY(0);
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
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
        }

        /* Input field hover effects */
        .form-control:hover:not(:focus):not(:disabled) {
          border-color: ${theme.primary}80;
        }

        /* Link hover effects */
        a.text-decoration-underline:hover {
          opacity: 0.8;
          cursor: pointer;
        }

        /* Error state styling */
        .is-invalid {
          border-color: #dc3545 !important;
        }

        .invalid-feedback {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        /* Enhanced Floating Elements Animation */
        .floating-elements {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .floating-icon {
          position: absolute;
          font-size: 1.8rem;
          opacity: 0;
          animation: floatFast 6s ease-in-out infinite;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        /* Water droplet positions with staggered animation */
        .floating-water-1 {
          top: 15%;
          left: 8%;
          animation-delay: 0s;
        }
        .floating-water-2 {
          top: 25%;
          right: 12%;
          animation-delay: 1s;
        }
        .floating-water-3 {
          bottom: 35%;
          left: 15%;
          animation-delay: 2s;
        }
        .floating-water-4 {
          bottom: 20%;
          right: 8%;
          animation-delay: 3s;
        }
        .floating-water-5 {
          top: 45%;
          left: 20%;
          animation-delay: 1.5s;
        }
        .floating-water-6 {
          top: 60%;
          right: 18%;
          animation-delay: 2.5s;
        }

        /* Fast floating animation with opacity changes */
        @keyframes floatFast {
          0% {
            transform: translateY(0px) translateX(0px) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          10% {
            transform: translateY(-15px) translateX(5px) rotate(5deg) scale(1);
            opacity: 0.15;
          }
          30% {
            transform: translateY(-25px) translateX(-3px) rotate(-3deg) scale(1.1);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) translateX(8px) rotate(8deg) scale(1.05);
            opacity: 0.18;
          }
          70% {
            transform: translateY(-30px) translateX(-5px) rotate(-5deg) scale(1.15);
            opacity: 0.22;
          }
          90% {
            transform: translateY(-10px) translateX(3px) rotate(3deg) scale(0.9);
            opacity: 0.12;
          }
          100% {
            transform: translateY(0px) translateX(0px) rotate(0deg) scale(0.8);
            opacity: 0;
          }
        }

        /* Mobile Responsive */
        @media (max-width: 991px) {
          .floating-elements {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .form-control {
            font-size: 16px;
          }
        }

        @media (max-width: 576px) {
          .form-container {
            padding: 1.5rem !important;
          }
        }

        @media (min-width: 992px) {
          .floating-icon {
            font-size: 2rem;
          }
        }

        /* WWS ID validation spinner */
        .spinner {
          animation: spin 1s linear infinite;
        }

        /* Terms and conditions checkbox */
        .form-check-input:checked {
          background-color: ${theme.primary} !important;
          border-color: ${theme.primary} !important;
        }
      `}</style>
    </div>
  );
}