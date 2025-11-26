// src/components/admin/StaffFormModal.jsx
import React, { useState, useEffect, useRef } from "react";
import Portal from "../../../components/Portal";
import { showAlert, showToast } from "../../../services/notificationService";

const StaffFormModal = ({ staff, onClose, onSave, token }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_number: "",
    address: "",
    position: "",
    staff_notes: "",
    password: "",
    password_confirmation: "",
    avatar: null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const isEdit = !!staff;
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);

  // Use useRef to persist initial state across renders
  const initialFormState = useRef({
    name: "",
    email: "",
    contact_number: "",
    address: "",
    position: "",
    staff_notes: "",
    password: "",
    password_confirmation: "",
    avatar: null,
  });

useEffect(() => {
  if (staff) {
    const staffFormState = {
      name: staff.name || "",
      email: staff.email || "",
      contact_number: staff.contact_number || "",
      address: staff.address || "",
      position: staff.position || "",
      staff_notes: staff.staff_notes || "",
      password: "",
      password_confirmation: "",
      avatar: null,
    };

    setFormData(staffFormState);
    
    // Set avatar preview if staff has an avatar - FIXED URL
    if (staff.avatar) {
      const getAvatarUrl = (avatarPath) => {
        if (!avatarPath) return null;
        
        if (avatarPath.startsWith('http')) {
          return avatarPath;
        }
        
        const baseUrl = import.meta.env.VITE_LARAVEL_API;
        
        // Clean the filename - remove 'avatars/' prefix if present
        let cleanFilename = avatarPath;
        if (avatarPath.includes('avatars/')) {
          cleanFilename = avatarPath.replace('avatars/', '');
        }
        
        // Use the avatar endpoint, not storage
        return `${baseUrl}/avatar/${cleanFilename}`;
      };
      
      const avatarUrl = getAvatarUrl(staff.avatar);
      setAvatarPreview(avatarUrl);
    } else {
      setAvatarPreview(null);
    }
    
    initialFormState.current = { ...staffFormState };
  } else {
    // Reset for new staff
    setFormData({
      name: "",
      email: "",
      contact_number: "",
      address: "",
      position: "",
      staff_notes: "",
      password: "",
      password_confirmation: "",
      avatar: null,
    });
    setAvatarPreview(null);
    initialFormState.current = {
      name: "",
      email: "",
      contact_number: "",
      address: "",
      position: "",
      staff_notes: "",
      password: "",
      password_confirmation: "",
      avatar: null,
    };
  }
}, [staff]);

  // Check if form has unsaved changes
  const checkFormChanges = (currentForm) => {
    return (
      JSON.stringify(currentForm) !==
        JSON.stringify(initialFormState.current) ||
      currentForm.password ||
      currentForm.password_confirmation ||
      currentForm.avatar
    );
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showAlert.error("Invalid File Type", "Please select a valid image file (JPEG, PNG, GIF, WebP).");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        showAlert.error("File Too Large", "Please select an image smaller than 5MB.");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Update form data
      setFormData(prev => {
        const newForm = { ...prev, avatar: file };
        setHasUnsavedChanges(checkFormChanges(newForm));
        return newForm;
      });

      // Clear any avatar errors
      if (errors.avatar) {
        setErrors(prev => ({ ...prev, avatar: '' }));
      }
    }
  };

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setFormData(prev => {
      const newForm = { ...prev, avatar: null };
      setHasUnsavedChanges(checkFormChanges(newForm));
      return newForm;
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input click
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatContact = (value) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 7)
      return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}-${numbers.slice(
      7,
      11
    )}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact_number") {
      const numericValue = value.replace(/\D/g, "").slice(0, 11);
      setFormData((prev) => {
        const newForm = { ...prev, [name]: numericValue };
        setHasUnsavedChanges(checkFormChanges(newForm));
        return newForm;
      });
    } else {
      setFormData((prev) => {
        const newForm = { ...prev, [name]: value };
        setHasUnsavedChanges(checkFormChanges(newForm));
        return newForm;
      });
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validatePhoneNumber = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    if (!password) return true;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.position.trim()) {
      newErrors.position = "Position is required";
    }

    if (
      formData.contact_number &&
      !validatePhoneNumber(formData.contact_number)
    ) {
      newErrors.contact_number =
        "Phone number must be 11 digits starting with 09 (e.g., 09123456789)";
    }

    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (!validatePassword(formData.password)) {
        newErrors.password =
          "Password must be at least 8 characters with uppercase, lowercase, and number";
      }
    }

    if (isEdit && formData.password && !validatePassword(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters with uppercase, lowercase, and number";
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const confirmation = await showAlert.confirm(
      isEdit ? "Confirm Staff Update" : "Confirm Create Staff",
      `Are you sure you want to ${
        isEdit ? "update" : "create"
      } this staff member?`,
      `Yes, ${isEdit ? "Update" : "Create"} Staff`,
      "Review Details"
    );

    if (!confirmation.isConfirmed) {
      return;
    }

    setLoading(true);

    try {
      showAlert.loading(
        isEdit ? "Updating Staff" : "Creating Staff",
        "Please wait while we save the staff information..."
      );

      // Use FormData to handle file upload
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('email', formData.email);
      submitFormData.append('contact_number', formData.contact_number);
      submitFormData.append('address', formData.address);
      submitFormData.append('position', formData.position);
      submitFormData.append('staff_notes', formData.staff_notes);
      submitFormData.append('role', 'staff');

      // Only include password if provided
      if (formData.password) {
        submitFormData.append('password', formData.password);
        submitFormData.append('password_confirmation', formData.password_confirmation);
      }

      // Append avatar if selected
      if (formData.avatar) {
        submitFormData.append('avatar', formData.avatar);
      }

      const url = isEdit
        ? `${import.meta.env.VITE_LARAVEL_API}/admin/users/${staff.id}`
        : `${import.meta.env.VITE_LARAVEL_API}/admin/users`;

      const method = isEdit ? "POST" : "POST";

      // For edit, we need to use POST with _method=PUT for file uploads
      if (isEdit) {
        submitFormData.append('_method', 'PUT');
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: submitFormData,
      });

      const data = await response.json();
      showAlert.close();

      if (response.ok) {
        showToast.success(
          isEdit ? "Staff updated successfully!" : "Staff created successfully!"
        );
        
        setHasUnsavedChanges(false);
        onSave(data.user || data);
      } else {
        if (data.message === "Unauthenticated.") {
          showAlert.error(
            "Session Expired",
            "Your session has expired. Please log in again."
          );
          return;
        }

        if (data.errors) {
          setErrors(data.errors);
          throw new Error("Please fix the form errors");
        }
        throw new Error(
          data.message || `Failed to ${isEdit ? "update" : "create"} staff`
        );
      }
    } catch (error) {
      showAlert.close();
      console.error("Error saving staff:", error);

      if (error.message.includes("Unauthenticated")) {
        showAlert.error(
          "Authentication Error",
          "Please log in again to continue."
        );
      } else {
        showAlert.error(
          "Error",
          error.message || `Failed to ${isEdit ? "update" : "create"} staff`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = async (e) => {
    if (e.target === e.currentTarget && !loading) {
      await handleCloseAttempt();
    }
  };

  const handleEscapeKey = async (e) => {
    if (e.key === "Escape" && !loading) {
      e.preventDefault();
      await handleCloseAttempt();
    }
  };

  const handleCloseAttempt = async () => {
    if (hasUnsavedChanges) {
      const result = await showAlert.confirm(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to close without saving?",
        "Yes, Close",
        "Continue Editing"
      );

      if (result.isConfirmed) {
        await closeModal();
      }
    } else {
      await closeModal();
    }
  };

  const handleCloseButtonClick = async () => {
    await handleCloseAttempt();
  };

  const closeModal = async () => {
    setIsClosing(true);
    // Wait for animation to complete before closing
    await new Promise(resolve => setTimeout(resolve, 300));
    onClose();
  };

  useEffect(() => {
    document.addEventListener("keydown", handleEscapeKey);
    
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [loading, hasUnsavedChanges]);

// Fixed StaffAvatar Component
const StaffAvatar = () => {
  const getInitials = (name) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="avatar-preview-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        style={{ display: 'none' }}
      />
      
      <div className="position-relative d-inline-block">
        {avatarPreview ? (
          <div className="position-relative">
            <img
              src={avatarPreview}
              alt="Staff Avatar"
              className="avatar-preview img-fluid rounded-circle cursor-pointer"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "50%",
                transition: "all 0.3s ease",
                cursor: "pointer",
                border: "3px solid #336C35",
              }}
              onClick={handleAvatarClick}
              onError={(e) => {
                // If uploaded image fails, show initials
                e.target.style.display = 'none';
              }}
            />
            <button
              type="button"
              className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle rounded-circle"
              style={{
                width: "28px",
                height: "28px",
                padding: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveAvatar();
              }}
              disabled={loading}
            >
              <i className="fas fa-times" style={{ fontSize: "12px" }}></i>
            </button>
            
            {/* Camera overlay for existing avatar */}
            <div
              className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center cursor-pointer"
              style={{
                width: "32px",
                height: "32px",
                border: "2px solid white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
              }}
              onClick={handleAvatarClick}
            >
              <i className="fas fa-camera text-white" style={{ fontSize: "14px" }}></i>
            </div>
          </div>
        ) : (
          <div
            className="avatar-preview placeholder d-flex align-items-center justify-content-center text-white cursor-pointer position-relative"
            style={{
              backgroundColor: "#336C35",
              fontSize: "32px",
              fontWeight: "bold",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              transition: "all 0.3s ease",
              cursor: "pointer",
              border: "3px solid #e9ecef",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
            onClick={handleAvatarClick}
          >
            {getInitials(formData.name)}
            
            {/* Camera icon positioned properly */}
            <div
              className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "32px",
                height: "32px",
                border: "2px solid white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
              }}
            >
              <i className="fas fa-camera text-white" style={{ fontSize: "14px" }}></i>
            </div>
          </div>
        )}
      </div>
      
      {errors.avatar && (
        <div className="invalid-feedback d-block text-center mt-2">
          {errors.avatar}
        </div>
      )}
    </div>
  );
};

  return (
    <Portal>
      <div
        ref={modalRef}
        className={`modal fade show d-block modal-backdrop-animation ${isClosing ? 'exit' : ''}`}
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        onClick={handleBackdropClick}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div
            ref={contentRef}
            className={`modal-content border-0 modal-content-animation ${isClosing ? 'exit' : ''}`}
            style={{
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* Header */}
            <div
              className="modal-header border-0 text-white modal-smooth"
              style={{ backgroundColor: "#336C35" }}
            >
              <h5 className="modal-title fw-bold">
                <i className={`fas ${isEdit ? "fa-edit" : "fa-plus"} me-2`}></i>
                {isEdit ? "Edit Staff" : "Add New Staff"}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white btn-smooth"
                onClick={handleCloseButtonClick}
                aria-label="Close"
                disabled={loading}
                style={{
                  transition: "all 0.2s ease",
                }}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Modal Body with grey background */}
              <div
                className="modal-body modal-smooth"
                style={{
                  maxHeight: "70vh",
                  overflowY: "auto",
                  backgroundColor: "#f8f9fa",
                }}
              >
                {/* Avatar Section */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card border-0 bg-white modal-smooth">
                      <div className="card-body text-center p-3 p-md-4">
                        <div className="d-flex flex-column align-items-center">
                          <StaffAvatar />
                          <div className="mt-3">
                            <small className="text-muted">
                              Click on avatar to upload image (JPEG, PNG, GIF, WebP, max 5MB)
                            </small>
                            <br />
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm mt-2 btn-smooth"
                              onClick={handleAvatarClick}
                              disabled={loading}
                            >
                              <i className="fas fa-upload me-1"></i>
                              Choose Image
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  {/* Basic Information */}
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control modal-smooth ${
                          errors.name ? "is-invalid" : ""
                        }`}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Enter full name"
                        style={{ backgroundColor: "#ffffff" }}
                      />
                      {errors.name && (
                        <div className="invalid-feedback">{errors.name}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className={`form-control modal-smooth ${
                          errors.email ? "is-invalid" : ""
                        }`}
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Enter email address"
                        style={{ backgroundColor: "#ffffff" }}
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Position <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control modal-smooth ${
                          errors.position ? "is-invalid" : ""
                        }`}
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Enter staff position"
                        style={{ backgroundColor: "#ffffff" }}
                      />
                      {errors.position && (
                        <div className="invalid-feedback">{errors.position}</div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Contact Number
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0 modal-smooth">
                          <i className="fas fa-phone"></i>
                        </span>
                        <input
                          type="text"
                          className={`form-control border-start-0 ps-2 modal-smooth ${
                            errors.contact_number ? "is-invalid" : ""
                          }`}
                          name="contact_number"
                          value={formatContact(formData.contact_number)}
                          onChange={handleChange}
                          disabled={loading}
                          placeholder="09XX-XXX-XXXX"
                          maxLength={13}
                          style={{ backgroundColor: "#ffffff" }}
                        />
                      </div>
                      {errors.contact_number && (
                        <div className="invalid-feedback d-block">
                          {errors.contact_number}
                        </div>
                      )}
                      <small className="text-muted">
                        Format: 09XX-XXX-XXXX (11 digits)
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Address
                      </label>
                      <textarea
                        className={`form-control modal-smooth ${
                          errors.address ? "is-invalid" : ""
                        }`}
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Enter complete address"
                        rows="3"
                        style={{
                          resize: "vertical",
                          backgroundColor: "#ffffff",
                        }}
                      />
                      {errors.address && (
                        <div className="invalid-feedback">{errors.address}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Staff Notes
                      </label>
                      <textarea
                        className="form-control modal-smooth"
                        name="staff_notes"
                        value={formData.staff_notes}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Additional notes about this staff member"
                        rows="2"
                        style={{
                          resize: "vertical",
                          backgroundColor: "#ffffff",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                {!isEdit && (
                  <div className="row mt-3">
                    <div className="col-12">
                      <div className="card border-warning bg-white modal-smooth">
                        <div className="card-header bg-warning bg-opacity-10">
                          <h6 className="mb-0 text-warning">
                            <i className="fas fa-key me-2"></i>
                            Password Information <span className="text-danger">*</span>
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3 position-relative">
                                <label className="form-label small fw-semibold text-dark mb-1">
                                  Password <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                  <span
                                    className={`input-group-text bg-white border-end-0 modal-smooth ${
                                      errors.password ? "border-danger" : ""
                                    }`}
                                  >
                                    <i className="fas fa-lock"></i>
                                  </span>
                                  <input
                                    type={showPassword ? "text" : "password"}
                                    className={`form-control border-start-0 ps-2 modal-smooth ${
                                      errors.password ? "is-invalid" : ""
                                    }`}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Enter password"
                                    style={{ backgroundColor: "#ffffff" }}
                                  />
                                  <span
                                    className={`input-group-text bg-white border-start-0 modal-smooth ${
                                      errors.password ? "border-danger" : ""
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      className="btn btn-sm p-0 border-0 bg-transparent text-muted btn-smooth"
                                      onClick={() => setShowPassword(!showPassword)}
                                      disabled={loading}
                                    >
                                      <i
                                        className={`fas ${
                                          showPassword ? "fa-eye-slash" : "fa-eye"
                                        }`}
                                      ></i>
                                    </button>
                                  </span>
                                </div>
                                {errors.password ? (
                                  <div className="invalid-feedback d-block">
                                    {errors.password}
                                  </div>
                                ) : (
                                  <small className="text-muted">
                                    Must be at least 8 characters with uppercase,
                                    lowercase, and number
                                  </small>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3 position-relative">
                                <label className="form-label small fw-semibold text-dark mb-1">
                                  Confirm Password <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                  <span
                                    className={`input-group-text bg-white border-end-0 modal-smooth ${
                                      errors.password_confirmation
                                        ? "border-danger"
                                        : ""
                                    }`}
                                  >
                                    <i className="fas fa-lock"></i>
                                  </span>
                                  <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className={`form-control border-start-0 ps-2 modal-smooth ${
                                      errors.password_confirmation ? "is-invalid" : ""
                                    }`}
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Confirm password"
                                    style={{ backgroundColor: "#ffffff" }}
                                  />
                                  <span
                                    className={`input-group-text bg-white border-start-0 modal-smooth ${
                                      errors.password_confirmation
                                        ? "border-danger"
                                        : ""
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      className="btn btn-sm p-0 border-0 bg-transparent text-muted btn-smooth"
                                      onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                      }
                                      disabled={loading}
                                    >
                                      <i
                                        className={`fas ${
                                          showConfirmPassword
                                            ? "fa-eye-slash"
                                            : "fa-eye"
                                        }`}
                                      ></i>
                                    </button>
                                  </span>
                                </div>
                                {errors.password_confirmation && (
                                  <div className="invalid-feedback d-block">
                                    {errors.password_confirmation}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Password fields for edit mode */}
                {isEdit && (
                  <div className="row mt-3">
                    <div className="col-12">
                      <div className="card border-warning bg-white modal-smooth">
                        <div className="card-header bg-warning bg-opacity-10">
                          <h6 className="mb-0 text-warning">
                            <i className="fas fa-key me-2"></i>
                            Change Password (Optional)
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3 position-relative">
                                <label className="form-label small fw-semibold text-dark mb-1">
                                  New Password
                                </label>
                                <div className="input-group">
                                  <span
                                    className={`input-group-text bg-white border-end-0 modal-smooth ${
                                      errors.password ? "border-danger" : ""
                                    }`}
                                  >
                                    <i className="fas fa-lock"></i>
                                  </span>
                                  <input
                                    type={showPassword ? "text" : "password"}
                                    className={`form-control border-start-0 ps-2 modal-smooth ${
                                      errors.password ? "is-invalid" : ""
                                    }`}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Leave blank to keep current password"
                                    style={{ backgroundColor: "#ffffff" }}
                                  />
                                  <span
                                    className={`input-group-text bg-white border-start-0 modal-smooth ${
                                      errors.password ? "border-danger" : ""
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      className="btn btn-sm p-0 border-0 bg-transparent text-muted btn-smooth"
                                      onClick={() =>
                                        setShowPassword(!showPassword)
                                      }
                                      disabled={loading}
                                    >
                                      <i
                                        className={`fas ${
                                          showPassword
                                            ? "fa-eye-slash"
                                            : "fa-eye"
                                        }`}
                                      ></i>
                                    </button>
                                  </span>
                                </div>
                                {errors.password ? (
                                  <div className="invalid-feedback d-block">
                                    {errors.password}
                                  </div>
                                ) : (
                                  <small className="text-muted">
                                    Must be at least 8 characters with
                                    uppercase, lowercase, and number
                                  </small>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3 position-relative">
                                <label className="form-label small fw-semibold text-dark mb-1">
                                  Confirm New Password
                                </label>
                                <div className="input-group">
                                  <span
                                    className={`input-group-text bg-white border-end-0 modal-smooth ${
                                      errors.password_confirmation
                                        ? "border-danger"
                                        : ""
                                    }`}
                                  >
                                    <i className="fas fa-lock"></i>
                                  </span>
                                  <input
                                    type={
                                      showConfirmPassword ? "text" : "password"
                                    }
                                    className={`form-control border-start-0 ps-2 modal-smooth ${
                                      errors.password_confirmation
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Confirm new password"
                                    style={{ backgroundColor: "#ffffff" }}
                                  />
                                  <span
                                    className={`input-group-text bg-white border-start-0 modal-smooth ${
                                      errors.password_confirmation
                                        ? "border-danger"
                                        : ""
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      className="btn btn-sm p-0 border-0 bg-transparent text-muted btn-smooth"
                                      onClick={() =>
                                        setShowConfirmPassword(
                                          !showConfirmPassword
                                        )
                                      }
                                      disabled={loading}
                                    >
                                      <i
                                        className={`fas ${
                                          showConfirmPassword
                                            ? "fa-eye-slash"
                                            : "fa-eye"
                                        }`}
                                      ></i>
                                    </button>
                                  </span>
                                </div>
                                {errors.password_confirmation && (
                                  <div className="invalid-feedback d-block">
                                    {errors.password_confirmation}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="modal-footer border-top bg-white modal-smooth">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-smooth"
                  onClick={handleCloseButtonClick}
                  disabled={loading}
                  style={{
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn fw-semibold position-relative btn-smooth"
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? "#6c757d" : "#336C35",
                    borderColor: loading ? "#6c757d" : "#336C35",
                    color: "white",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    minWidth: "140px",
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      {isEdit ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <i className={`fas ${isEdit ? "fa-save" : "fa-plus"} me-2`}></i>
                      {isEdit ? "Update Staff" : "Create Staff"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default StaffFormModal;