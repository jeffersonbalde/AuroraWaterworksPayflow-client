// src/components/admin/StaffDetailsModal.jsx
import React, { useState, useEffect } from "react";
import Portal from "../../../components/Portal";

const StaffDetailsModal = ({ staff, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  // EXACT SAME FUNCTION AS STAFFMANAGEMENT
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    
    // If it's already a full URL (like from ui-avatars), use it directly
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }
    
    const baseUrl = import.meta.env.VITE_LARAVEL_API;
    
    // Clean the filename - remove 'avatars/' prefix if present
    let cleanFilename = avatarPath;
    if (avatarPath.includes('avatars/')) {
      cleanFilename = avatarPath.replace('avatars/', '');
    }
    
    // Use the same endpoint as your working code
    return `${baseUrl}/avatar/${cleanFilename}`;
  };

  const getInitials = (name) => {
    if (!name) return "S";
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleBackdropClick = async (e) => {
    if (e.target === e.currentTarget) {
      await closeModal();
    }
  };

  const handleEscapeKey = async (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      await closeModal();
    }
  };

  React.useEffect(() => {
    document.addEventListener("keydown", handleEscapeKey);
    
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  const closeModal = async () => {
    setIsClosing(true);
    // Wait for exit animation to complete
    await new Promise(resolve => setTimeout(resolve, 200));
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return { label: "Active", color: "success", icon: "fa-check-circle" };
      case 'inactive':
        return { label: "Inactive", color: "danger", icon: "fa-times-circle" };
      case 'pending':
        return { label: "Pending", color: "warning", icon: "fa-clock" };
      default:
        return { label: status, color: "secondary", icon: "fa-question-circle" };
    }
  };

  const statusInfo = getStatusInfo(staff.status);

  // SIMPLIFIED Staff Avatar Component - No complex error handling
  const StaffAvatar = () => {
    if (staff.avatar) {
      const avatarUrl = getAvatarUrl(staff.avatar);
      
      console.log('🔄 StaffDetailsModal Avatar Debug:', {
        staffName: staff.name,
        originalAvatar: staff.avatar,
        generatedUrl: avatarUrl
      });

      return (
        <div style={{ width: "80px", height: "80px", position: "relative" }}>
          <img
            src={avatarUrl}
            alt={`${staff.name}'s avatar`}
            className="rounded-circle border"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block"
            }}
          />
        </div>
      );
    }

    return (
      <div
        className="rounded-circle d-flex align-items-center justify-content-center text-white border"
        style={{
          width: "80px",
          height: "80px",
          backgroundColor: '#336C35',
          fontSize: "24px",
          fontWeight: 'bold'
        }}
      >
        {getInitials(staff?.name)}
      </div>
    );
  };

  return (
    <Portal>
      <div 
        className={`modal fade show d-block modal-backdrop-animation ${isClosing ? 'exit' : ''}`}
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        onClick={handleBackdropClick}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg mx-3 mx-sm-auto">
          <div 
            className={`modal-content border-0 modal-content-animation ${isClosing ? 'exit' : ''}`}
            style={{ 
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            {/* Header */}
            <div 
              className="modal-header border-0 text-white modal-smooth"
              style={{ backgroundColor: "#336C35" }}
            >
              <h5 className="modal-title fw-bold">
                <i className="fas fa-user me-2"></i>
                Staff Details
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white btn-smooth"
                onClick={closeModal}
                aria-label="Close"
              ></button>
            </div>
            
            <div className="modal-body bg-light modal-smooth" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {/* Staff Summary Card */}
              <div className="card border-0 bg-white mb-4">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <StaffAvatar />
                    </div>
                    <div className="col">
                      <h4 className="mb-1 text-dark">{staff.name}</h4>
                      <p className="text-muted mb-2">{staff.email}</p>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        <span className={`badge bg-${statusInfo.color} fs-6`}>
                          <i className={`fas ${statusInfo.icon} me-1`}></i>
                          {statusInfo.label}
                        </span>
                        <span className="badge bg-info fs-6">
                          <i className="fas fa-user-tie me-1"></i>
                          Staff
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                {/* Basic Information */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-white h-100">
                    <div className="card-header bg-transparent border-bottom-0">
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-info-circle me-2 text-primary"></i>
                        Basic Information
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Full Name</label>
                        <p className="mb-0 fw-semibold text-dark">{staff.name}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Email Address</label>
                        <p className="mb-0 fw-semibold text-dark">{staff.email}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Position</label>
                        <p className="mb-0 fw-semibold text-dark">{staff.position || "Not specified"}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Contact Number</label>
                        <p className="mb-0 fw-semibold text-dark">{staff.contact_number || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="form-label small fw-semibold text-muted mb-1">Address</label>
                        <p className="mb-0 fw-semibold text-dark">{staff.address || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-white h-100">
                    <div className="card-header bg-transparent border-bottom-0">
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-user-shield me-2 text-success"></i>
                        Account Information
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Account Status</label>
                        <div>
                          <span className={`badge bg-${statusInfo.color}`}>
                            <i className={`fas ${statusInfo.icon} me-1`}></i>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Role</label>
                        <div>
                          <span className="badge bg-info">
                            <i className="fas fa-user-tie me-1"></i>
                            {staff.role}
                          </span>
                        </div>
                      </div>
                      {staff.approved_by && (
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-muted mb-1">Approved By</label>
                          <p className="mb-0 fw-semibold text-dark">{staff.approved_by}</p>
                        </div>
                      )}
                      {staff.approved_at && (
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-muted mb-1">Approved At</label>
                          <p className="mb-0 fw-semibold text-dark">{formatDate(staff.approved_at)}</p>
                        </div>
                      )}
                      {staff.staff_notes && (
                        <div>
                          <label className="form-label small fw-semibold text-muted mb-1">Staff Notes</label>
                          <p className="mb-0 fw-semibold text-dark">{staff.staff_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Timeline */}
                <div className="col-12">
                  <div className="card border-0 bg-white">
                    <div className="card-header bg-transparent border-bottom-0">
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-history me-2 text-info"></i>
                        Account Timeline
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label small fw-semibold text-muted mb-1">Registration Date</label>
                          <p className="mb-0 fw-semibold text-dark">{formatDate(staff.created_at)}</p>
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label small fw-semibold text-muted mb-1">Last Updated</label>
                          <p className="mb-0 fw-semibold text-dark">{formatDate(staff.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="modal-footer border-top bg-white modal-smooth">
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-smooth"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default StaffDetailsModal;