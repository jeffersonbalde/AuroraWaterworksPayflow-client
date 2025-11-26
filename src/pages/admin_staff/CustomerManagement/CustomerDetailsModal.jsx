// src/pages/admin_staff/modals/CustomerDetailsModal.jsx
import React, { useState, useEffect } from "react";
import Portal from "../../../components/Portal";

const CustomerDetailsModal = ({ customer, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

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

  useEffect(() => {
    document.addEventListener("keydown", handleEscapeKey);
    document.body.classList.add("modal-open");
    
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.classList.remove("modal-open");
    };
  }, []);

  const closeModal = async () => {
    setIsClosing(true);
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
    const statusInfo = {
      active: { label: "Active", color: "success", icon: "fa-check-circle" },
      inactive: { label: "Inactive", color: "danger", icon: "fa-times-circle" },
      delinquent: { label: "Delinquent", color: "warning", icon: "fa-exclamation-triangle" },
      pending: { label: "Pending Approval", color: "secondary", icon: "fa-clock" },
      rejected: { label: "Rejected", color: "dark", icon: "fa-ban" },
    };
    return statusInfo[status] || { label: "Unknown", color: "secondary", icon: "fa-question" };
  };

  const getServiceInfo = (service) => {
    const serviceInfo = {
      residential: { label: "Residential", color: "primary", icon: "fa-home" },
      commercial: { label: "Commercial", color: "info", icon: "fa-building" },
      institutional: { label: "Institutional", color: "warning", icon: "fa-school" },
    };
    return serviceInfo[service] || { label: "Unknown", color: "secondary", icon: "fa-question" };
  };

  const statusInfo = getStatusInfo(customer.status);
  const serviceInfo = getServiceInfo(customer.service);

  return (
    <Portal>
      <div className={`modal fade show d-block modal-backdrop-animation ${isClosing ? 'exit' : ''}`} style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={handleBackdropClick} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg mx-3 mx-sm-auto">
          <div className={`modal-content border-0 modal-content-animation ${isClosing ? 'exit' : ''}`} style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="modal-header border-0 text-white modal-smooth" style={{ background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)" }}>
              <h5 className="modal-title fw-bold"><i className="fas fa-user me-2"></i>Customer Details</h5>
              <button type="button" className="btn-close btn-close-white btn-smooth" onClick={closeModal} aria-label="Close"></button>
            </div>
            
            <div className="modal-body bg-light modal-smooth" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <div className="card border-0 bg-white mb-4">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <div className="rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: "80px", height: "80px", backgroundColor: "var(--primary-color)", background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)", fontSize: "2rem" }}>
                        <i className="fas fa-user"></i>
                      </div>
                    </div>
                    <div className="col">
                      <h4 className="mb-1 text-dark">{customer.name}</h4>
                      <p className="text-muted mb-2">{customer.email}</p>
                      <div className="d-flex flex-wrap gap-2">
                        <span className={`badge bg-${statusInfo.color} fs-6`}><i className={`fas ${statusInfo.icon} me-1`}></i>{statusInfo.label}</span>
                        <span className={`badge bg-${serviceInfo.color} fs-6`}><i className={`fas ${serviceInfo.icon} me-1`}></i>{serviceInfo.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-white h-100">
                    <div className="card-header bg-transparent border-bottom-0"><h6 className="mb-0 fw-semibold text-dark"><i className="fas fa-info-circle me-2 text-primary"></i>Basic Information</h6></div>
                    <div className="card-body">
                      <div className="mb-3"><label className="form-label small fw-semibold text-muted mb-1">Full Name</label><p className="mb-0 fw-semibold text-dark">{customer.name}</p></div>
                      <div className="mb-3"><label className="form-label small fw-semibold text-muted mb-1">Email Address</label><p className="mb-0 fw-semibold text-dark">{customer.email}</p></div>
                      <div className="mb-3"><label className="form-label small fw-semibold text-muted mb-1">Contact Number</label><p className="mb-0 fw-semibold text-dark">{customer.contact_number || "Not provided"}</p></div>
                      <div><label className="form-label small fw-semibold text-muted mb-1">WWS ID</label><p className="mb-0 fw-semibold text-dark">{customer.wws_id || "N/A"}</p></div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-white h-100">
                    <div className="card-header bg-transparent border-bottom-0"><h6 className="mb-0 fw-semibold text-dark"><i className="fas fa-tint me-2 text-success"></i>Service Information</h6></div>
                    <div className="card-body">
                      <div className="mb-3"><label className="form-label small fw-semibold text-muted mb-1">Service Type</label><p className="mb-0 fw-semibold text-dark">{serviceInfo.label}</p></div>
                      <div className="mb-3"><label className="form-label small fw-semibold text-muted mb-1">Connection Date</label><p className="mb-0 fw-semibold text-dark">{customer.connection_date ? formatDate(customer.connection_date) : "Not specified"}</p></div>
                      <div><label className="form-label small fw-semibold text-muted mb-1">Address</label><p className="mb-0 fw-semibold text-dark">{customer.address || "Not provided"}</p></div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="card border-0 bg-white">
                    <div className="card-header bg-transparent border-bottom-0"><h6 className="mb-0 fw-semibold text-dark"><i className="fas fa-history me-2 text-info"></i>Account Timeline</h6></div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-12 col-md-6 mb-3"><label className="form-label small fw-semibold text-muted mb-1">Registration Date</label><p className="mb-0 fw-semibold text-dark">{formatDate(customer.created_at)}</p></div>
                        <div className="col-12 col-md-6 mb-3"><label className="form-label small fw-semibold text-muted mb-1">Approval Date</label><p className="mb-0 fw-semibold text-dark">{customer.approved_at ? formatDate(customer.approved_at) : "Not Approved"}</p></div>
                        {customer.rejected_at && (<div className="col-12 col-md-6 mb-3"><label className="form-label small fw-semibold text-muted mb-1">Rejection Date</label><p className="mb-0 fw-semibold text-dark">{formatDate(customer.rejected_at)}</p>{customer.rejection_reason && (<><label className="form-label small fw-semibold text-muted mb-1 mt-2">Rejection Reason</label><p className="mb-0 fw-semibold text-dark">{customer.rejection_reason}</p></>)}</div>)}
                        {customer.deactivated_at && (<div className="col-12 col-md-6 mb-3"><label className="form-label small fw-semibold text-muted mb-1">Deactivation Date</label><p className="mb-0 fw-semibold text-dark">{formatDate(customer.deactivated_at)}</p>{customer.deactivate_reason && (<><label className="form-label small fw-semibold text-muted mb-1 mt-2">Deactivation Reason</label><p className="mb-0 fw-semibold text-dark">{customer.deactivate_reason}</p></>)}</div>)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer border-top bg-white modal-smooth">
              <button type="button" className="btn btn-outline-secondary btn-smooth" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default CustomerDetailsModal;