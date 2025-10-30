// src/pages/client/ClientSettings.jsx - UPDATED
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { showAlert, showToast } from '../../services/notificationService';
import {
  FaUser,
  FaKey,
  FaEnvelope,
  FaPhone,
  FaHome,
  FaIdCard,
  FaSave,
  FaLock,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaSpinner
} from "react-icons/fa";

const ClientSettings = () => {
  const { user, token, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [isAccountLoading, setIsAccountLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Form states - Client specific fields
  const [accountForm, setAccountForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    contact_number: user?.contact_number || '',
    address: user?.address || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '' // Changed to match backend validation
  });

  const theme = {
    primary: "#2d5a27",
    primaryDark: "#1f451c",
    primaryLight: "#3a6f32",
    accent: "#4a7c40",
    accentLight: "#5a8c50",
    textPrimary: "#1a2a1a",
    textSecondary: "#4a5c4a",
    inputBg: "#f8faf8",
    inputText: "#1a2a1a",
    inputBorder: "#c8d0c8",
  };

  const handleContactSupport = () => {
    const phoneNumber = "+639123456789";
    const email = "support@aurorawaterworks.gov.ph";
    
    showAlert.info(
      "Contact Support",
      `<div style="text-align: left;">
        <p><strong>Aurora Waterworks Support:</strong></p>
        <p>📞 Phone: <strong>${phoneNumber}</strong></p>
        <p>📧 Email: <strong>${email}</strong></p>
        <p><br>Office Hours: <strong>8:00 AM - 5:00 PM (Monday-Friday)</strong></p>
      </div>`,
      "Got it"
    );
  };

  // Handle contact number input
  const handleContactInput = (e) => {
    const { name, value } = e.target;
    const numbersOnly = value.replace(/\D/g, '');
    const limitedValue = numbersOnly.slice(0, 11);
    
    setAccountForm(prev => ({
      ...prev,
      [name]: limitedValue
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle account form input changes
  const handleAccountInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'contact_number') {
      handleContactInput(e);
      return;
    }
    
    setAccountForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle password form input changes
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate contact number
  const validateContactNumber = (contact) => {
    if (!contact) return 'Contact number is required';
    if (contact.length !== 11) return 'Contact number must be exactly 11 digits';
    if (!contact.startsWith('09')) return 'Contact number must start with 09';
    return null;
  };

  // Format contact number for display
  const formatContact = (value) => {
    if (!value) return '';
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7, 11)}`;
  };

  // Update account information - FIXED API ENDPOINT
  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    
    const hasChanges = 
      accountForm.name !== user?.name ||
      accountForm.email !== user?.email ||
      accountForm.contact_number !== user?.contact_number ||
      accountForm.address !== user?.address;

    if (!hasChanges) {
      showToast.info('No changes detected to update.');
      return;
    }

    // Validate contact number
    const contactError = validateContactNumber(accountForm.contact_number);
    if (contactError) {
      setFormErrors(prev => ({ ...prev, contact_number: [contactError] }));
      showAlert.error('Validation Error', contactError);
      return;
    }

    const result = await showAlert.confirm(
      "Update Account Information",
      "Are you sure you want to update your account information?",
      "Yes, Update",
      "Cancel"
    );

    if (!result.isConfirmed) return;

    showAlert.loading("Updating Profile...", "Please wait while we update your account information", {
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false,
    });

    setIsAccountLoading(true);
    setFormErrors({});

    try {
      // FIXED: Using the correct endpoint from your backend - /profile (PUT)
      const response = await fetch(`${import.meta.env.VITE_LARAVEL_API}/profile`, {
        method: 'PUT', // Your backend uses PUT
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(accountForm)
      });

      const data = await response.json();
      showAlert.close();

      if (response.ok) {
        showToast.success('Account information updated successfully!');
        if (refreshUserData) {
          await refreshUserData();
        }
      } else {
        if (data.errors) {
          setFormErrors(data.errors);
          showAlert.error('Update Failed', 'Please check the form for errors.');
        } else {
          showAlert.error('Update Failed', data.message || 'Failed to update account information');
        }
      }
    } catch (error) {
      showAlert.close();
      console.error('Account update error:', error);
      showAlert.error('Network Error', 'Unable to connect to server. Please try again.');
    } finally {
      setIsAccountLoading(false);
    }
  };

const handlePasswordChange = async (e) => {
  e.preventDefault();
  
  console.log('🔐 Password Change - Starting...');
  console.log('🔐 Password Form Data:', passwordForm);

  const result = await showAlert.confirm(
    "Change Password",
    "Are you sure you want to change your password?",
    "Yes, Change Password",
    "Cancel"
  );

  if (!result.isConfirmed) return;

  showAlert.loading("Changing Password...", "Please wait while we securely update your password", {
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false,
  });

  setIsPasswordLoading(true);
  setFormErrors({});

  // Validation checks
  if (!passwordForm.current_password) {
    showAlert.close();
    setFormErrors({ current_password: ['Current password is required.'] });
    setIsPasswordLoading(false);
    showAlert.error('Validation Error', 'Current password is required.');
    return;
  }

  if (!passwordForm.new_password) {
    showAlert.close();
    setFormErrors({ new_password: ['New password is required.'] });
    setIsPasswordLoading(false);
    showAlert.error('Validation Error', 'New password is required.');
    return;
  }

  if (passwordForm.new_password.length < 6) {
    showAlert.close();
    setFormErrors({ new_password: ['Password must be at least 6 characters long.'] });
    setIsPasswordLoading(false);
    showAlert.error('Validation Error', 'Password must be at least 6 characters long.');
    return;
  }

  if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
    showAlert.close();
    setFormErrors({ new_password_confirmation: ['Passwords do not match.'] });
    setIsPasswordLoading(false);
    showAlert.error('Validation Error', 'Passwords do not match.');
    return;
  }

  try {
    console.log('🔐 Making API request to change password...');
    
    // FIXED: Include all required profile fields along with password fields
    const requestData = {
      // Include all required profile fields
      name: user?.name || '',
      email: user?.email || '',
      contact_number: user?.contact_number || '',
      address: user?.address || '',
      // Include password fields
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
      new_password_confirmation: passwordForm.new_password_confirmation
    };

    console.log('🔐 Request Data:', requestData);
    
    const response = await fetch(`${import.meta.env.VITE_LARAVEL_API}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    console.log('🔐 Response Status:', response.status);
    
    const data = await response.json();
    
    showAlert.close();

    if (response.ok) {
      showToast.success('Password changed successfully!');
      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
    } else {
      
      // FIXED: Handle both validation errors and custom error messages
      if (data.errors) {
        setFormErrors(data.errors);
        // Show all error messages
        const errorMessages = Object.values(data.errors).flat().join('\n');
        showAlert.error('Password Change Failed', errorMessages);
      } else if (data.message) {
        // Handle custom error messages (like "Current password is incorrect")
        if (data.message.includes('Current password is incorrect')) {
          setFormErrors({ current_password: ['Current password is incorrect.'] });
        }
        showAlert.error('Password Change Failed', data.message);
      } else {
        showAlert.error('Password Change Failed', 'An unknown error occurred.');
      }
    }
  } catch (error) {
    showAlert.close();
    showAlert.error('Network Error', 'Unable to connect to server. Please try again.');
  } finally {
    setIsPasswordLoading(false);
  }
};

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormErrors({});
  };

  return (
    <div className="container-fluid px-1 py-3">
      {/* Header - REMOVED AVATAR SECTION */}
      <div className="text-center mb-4">
        <div className="d-flex justify-content-center align-items-center mb-3">
          <div className="text-start">
            <h1 className="h3 mb-1 fw-bold" style={{ color: "var(--text-primary)" }}>
              Account Settings
            </h1>
            <p className="text-muted mb-0 small">
              {user?.name} • Aurora Waterworks Client
            </p>
            <small className="text-muted">
              WWS ID: {user?.wws_id || 'N/A'}
            </small>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* Sidebar Navigation - ENHANCED WITH HOVER EFFECTS */}
        <div className="col-12 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0 py-3 px-3">
              <h6 className="mb-0 fw-bold" style={{ color: "var(--text-primary)" }}>
                Settings Menu
              </h6>
            </div>
            <div className="card-body p-3">
              <div className="d-flex flex-column gap-2">
                {/* Account Settings Tab */}
                <button
                  className={`btn text-start p-3 d-flex align-items-center border-0 position-relative overflow-hidden ${activeTab === 'account' ? 'active' : ''}`}
                  onClick={() => handleTabChange('account')}
                  style={{
                    background: activeTab === 'account' 
                      ? 'linear-gradient(135deg, #2d5a27 0%, #3a6f32 100%)'
                      : '#f8f9fa',
                    border: activeTab === 'account' ? 'none' : '1px solid #dee2e6',
                    borderRadius: "8px",
                    color: activeTab === 'account' ? 'white' : '#495057',
                    fontWeight: activeTab === 'account' ? '600' : '500',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'account') {
                      e.target.style.background = '#e9ecef';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'account') {
                      e.target.style.background = '#f8f9fa';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                    style={{
                      width: "36px",
                      height: "36px",
                      background: activeTab === 'account' ? 'rgba(255, 255, 255, 0.2)' : 'linear-gradient(135deg, #2d5a27 0%, #3a6f32 100%)',
                      color: activeTab === 'account' ? 'white' : 'white',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <FaUser size={16} />
                  </div>
                  <div className="text-start">
                    <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>Account Settings</div>
                    <small style={{ opacity: activeTab === 'account' ? 0.9 : 0.7, fontSize: '0.75rem' }}>
                      Update personal information
                    </small>
                  </div>
                </button>

                {/* Change Password Tab */}
                <button
                  className={`btn text-start p-3 d-flex align-items-center border-0 position-relative overflow-hidden ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => handleTabChange('password')}
                  style={{
                    background: activeTab === 'password' 
                      ? 'linear-gradient(135deg, #2d5a27 0%, #3a6f32 100%)'
                      : '#f8f9fa',
                    border: activeTab === 'password' ? 'none' : '1px solid #dee2e6',
                    borderRadius: "8px",
                    color: activeTab === 'password' ? 'white' : '#495057',
                    fontWeight: activeTab === 'password' ? '600' : '500',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'password') {
                      e.target.style.background = '#e9ecef';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'password') {
                      e.target.style.background = '#f8f9fa';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                    style={{
                      width: "36px",
                      height: "36px",
                      background: activeTab === 'password' ? 'rgba(255, 255, 255, 0.2)' : 'linear-gradient(135deg, #4a7c40 0%, #5a8c50 100%)',
                      color: activeTab === 'password' ? 'white' : 'white',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <FaLock size={16} />
                  </div>
                  <div className="text-start">
                    <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>Change Password</div>
                    <small style={{ opacity: activeTab === 'password' ? 0.9 : 0.7, fontSize: '0.75rem' }}>
                      Update your password
                    </small>
                  </div>
                </button>
              </div>

              {/* Quick Help Section */}
              <div className="mt-4 pt-3 border-top border-light">
                <div className="text-center">
                  <small className="text-muted d-block mb-2">Need immediate help?</small>
                  <button
                    className="btn btn-sm w-100 d-flex align-items-center justify-content-center border-0 position-relative overflow-hidden"
                    onClick={handleContactSupport}
                    style={{
                      background: 'linear-gradient(135deg, rgba(45, 90, 39, 0.1) 0%, rgba(51, 108, 53, 0.1) 100%)',
                      color: '#2d5a27',
                      border: '1px solid rgba(45, 90, 39, 0.2)',
                      borderRadius: "6px",
                      fontWeight: "500",
                      fontSize: "0.8rem",
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, rgba(45, 90, 39, 0.2) 0%, rgba(51, 108, 53, 0.2) 100%)';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, rgba(45, 90, 39, 0.1) 0%, rgba(51, 108, 53, 0.1) 100%)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <FaEnvelope className="me-2" size={10} />
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-12 col-lg-9">
          {/* Account Settings Tab */}
          {activeTab === 'account' && (
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-transparent border-0 py-3 px-3">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-2" style={{
                    width: "28px",
                    height: "28px",
                    background: 'linear-gradient(135deg, #2d5a27 0%, #3a6f32 100%)',
                    color: 'white',
                  }}>
                    <FaUser size={14} />
                  </div>
                  <h6 className="mb-0 fw-bold" style={{ color: "var(--text-primary)" }}>
                    Account Information
                  </h6>
                </div>
              </div>
              <div className="card-body p-3">
                <form onSubmit={handleAccountUpdate}>
                  <div className="row g-3">
                    {/* Full Name */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>
                        Full Name *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <FaUser className="text-muted" size={16} />
                        </span>
                        <input
                          type="text"
                          name="name"
                          className={`form-control border-start-0 ps-2 fw-semibold ${formErrors.name ? 'is-invalid' : ''}`}
                          value={accountForm.name}
                          onChange={handleAccountInputChange}
                          required
                        />
                      </div>
                      {formErrors.name && <div className="invalid-feedback d-block small mt-1">{formErrors.name[0]}</div>}
                    </div>

                    {/* Email Address */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>
                        Email Address *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <FaEnvelope className="text-muted" size={16} />
                        </span>
                        <input
                          type="email"
                          name="email"
                          className={`form-control border-start-0 ps-2 fw-semibold ${formErrors.email ? 'is-invalid' : ''}`}
                          value={accountForm.email}
                          onChange={handleAccountInputChange}
                          required
                        />
                      </div>
                      {formErrors.email && <div className="invalid-feedback d-block small mt-1">{formErrors.email[0]}</div>}
                    </div>

                    {/* Contact Number */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>
                        Contact Number *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <FaPhone className="text-muted" size={16} />
                        </span>
                        <input
                          type="text"
                          name="contact_number"
                          className={`form-control border-start-0 ps-2 fw-semibold ${formErrors.contact_number ? 'is-invalid' : ''}`}
                          value={formatContact(accountForm.contact_number)}
                          onChange={handleAccountInputChange}
                          onKeyPress={(e) => {
                            if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                              e.preventDefault();
                            }
                          }}
                          required
                          maxLength={13}
                        />
                      </div>
                      {formErrors.contact_number && <div className="invalid-feedback d-block small mt-1">{formErrors.contact_number[0]}</div>}
                      <div className="form-text small mt-1">Format: 09XX-XXX-XXXX (11 digits total)</div>
                    </div>

                    {/* WWS ID (Read-only) */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>
                        WWS ID
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <FaIdCard className="text-muted" size={16} />
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-2 fw-semibold"
                          value={user?.wws_id || "N/A"}
                          readOnly
                          disabled
                          style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                        />
                      </div>
                      <div className="form-text small mt-1">Your Waterworks System ID (cannot be changed)</div>
                    </div>

                    {/* Address */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>
                        Address *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <FaHome className="text-muted" size={16} />
                        </span>
                        <input
                          type="text"
                          name="address"
                          className={`form-control border-start-0 ps-2 fw-semibold ${formErrors.address ? 'is-invalid' : ''}`}
                          value={accountForm.address}
                          onChange={handleAccountInputChange}
                          required
                        />
                      </div>
                      {formErrors.address && <div className="invalid-feedback d-block small mt-1">{formErrors.address[0]}</div>}
                    </div>

                    {/* Submit Button */}
                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn w-100 d-flex align-items-center justify-content-center py-2 border-0 position-relative overflow-hidden"
                        disabled={isAccountLoading}
                        style={{
                          background: "linear-gradient(135deg, #2d5a27 0%, #3a6f32 100%)",
                          color: "white",
                          borderRadius: "6px",
                          fontWeight: "600",
                          fontSize: "0.875rem",
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isAccountLoading) {
                            e.target.style.background = "linear-gradient(135deg, #3a6f32 0%, #4a8c47 100%)";
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isAccountLoading) {
                            e.target.style.background = "linear-gradient(135deg, #2d5a27 0%, #3a6f32 100%)";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                          }
                        }}
                      >
                        {isAccountLoading ? (
                          <>
                            <FaSpinner className="spinner me-2" size={12} />
                            Updating Account...
                          </>
                        ) : (
                          <>
                            <FaSave className="me-2" size={12} />
                            Update Account Information
                            <FaArrowRight className="ms-2" size={10} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-transparent border-0 py-3 px-3">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-2" style={{
                    width: "28px",
                    height: "28px",
                    background: 'linear-gradient(135deg, #4a7c40 0%, #5a8c50 100%)',
                    color: 'white',
                  }}>
                    <FaLock size={14} />
                  </div>
                  <h6 className="mb-0 fw-bold" style={{ color: "var(--text-primary)" }}>
                    Change Password
                  </h6>
                </div>
              </div>
              <div className="card-body p-3">
                <form onSubmit={handlePasswordChange}>
                  <div className="row g-3">
                    {/* Current Password */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>
                        Current Password *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <FaLock className="text-muted" size={16} />
                        </span>
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="current_password"
                          className={`form-control border-start-0 ps-2 fw-semibold ${formErrors.current_password ? 'is-invalid' : ''}`}
                          value={passwordForm.current_password}
                          onChange={handlePasswordInputChange}
                          placeholder="Enter current password"
                          required
                        />
                        <span className="input-group-text bg-transparent border-start-0">
                          <button
                            type="button"
                            className="btn btn-sm p-0 border-0 bg-transparent text-muted"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            style={{ transition: 'all 0.3s ease' }}
                            onMouseEnter={(e) => {
                              e.target.style.color = '#2d5a27';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = '#6c757d';
                            }}
                          >
                            {showCurrentPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                          </button>
                        </span>
                      </div>
                      {formErrors.current_password && <div className="invalid-feedback d-block small mt-1">{formErrors.current_password[0]}</div>}
                    </div>

                    {/* New Password */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>
                        New Password *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <FaLock className="text-muted" size={16} />
                        </span>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="new_password"
                          className={`form-control border-start-0 ps-2 fw-semibold ${formErrors.new_password ? 'is-invalid' : ''}`}
                          value={passwordForm.new_password}
                          onChange={handlePasswordInputChange}
                          placeholder="Enter new password"
                          required
                          minLength={6}
                        />
                        <span className="input-group-text bg-transparent border-start-0">
                          <button
                            type="button"
                            className="btn btn-sm p-0 border-0 bg-transparent text-muted"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            style={{ transition: 'all 0.3s ease' }}
                            onMouseEnter={(e) => {
                              e.target.style.color = '#2d5a27';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = '#6c757d';
                            }}
                          >
                            {showNewPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                          </button>
                        </span>
                      </div>
                      {formErrors.new_password && <div className="invalid-feedback d-block small mt-1">{formErrors.new_password[0]}</div>}
                      <div className="form-text small mt-1">Password must be at least 6 characters long</div>
                    </div>

                    {/* Confirm New Password - FIXED FIELD NAME */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>
                        Confirm New Password *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <FaLock className="text-muted" size={16} />
                        </span>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="new_password_confirmation"
                          className={`form-control border-start-0 ps-2 fw-semibold ${formErrors.new_password_confirmation ? 'is-invalid' : ''}`}
                          value={passwordForm.new_password_confirmation}
                          onChange={handlePasswordInputChange}
                          placeholder="Confirm new password"
                          required
                          minLength={6}
                        />
                        <span className="input-group-text bg-transparent border-start-0">
                          <button
                            type="button"
                            className="btn btn-sm p-0 border-0 bg-transparent text-muted"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ transition: 'all 0.3s ease' }}
                            onMouseEnter={(e) => {
                              e.target.style.color = '#2d5a27';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = '#6c757d';
                            }}
                          >
                            {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                          </button>
                        </span>
                      </div>
                      {formErrors.new_password_confirmation && <div className="invalid-feedback d-block small mt-1">{formErrors.new_password_confirmation[0]}</div>}
                    </div>

                    {/* Submit Button */}
                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn w-100 d-flex align-items-center justify-content-center py-2 border-0 position-relative overflow-hidden"
                        disabled={isPasswordLoading}
                        style={{
                          background: "linear-gradient(135deg, #2d5a27 0%, #3a6f32 100%)",
                          color: "white",
                          borderRadius: "6px",
                          fontWeight: "600",
                          fontSize: "0.875rem",
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isPasswordLoading) {
                            e.target.style.background = "linear-gradient(135deg, #3a6f32 0%, #4a8c47 100%)";
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isPasswordLoading) {
                            e.target.style.background = "linear-gradient(135deg, #2d5a27 0%, #3a6f32 100%)";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                          }
                        }}
                      >
                        {isPasswordLoading ? (
                          <>
                            <FaSpinner className="spinner me-2" size={12} />
                            Changing Password...
                          </>
                        ) : (
                          <>
                            <FaKey className="me-2" size={12} />
                            Change Password
                            <FaArrowRight className="ms-2" size={10} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ClientSettings;