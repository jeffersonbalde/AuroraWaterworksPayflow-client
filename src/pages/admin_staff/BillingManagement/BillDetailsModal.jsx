// src/pages/admin_staff/BillingManagement/BillDetailsModal.jsx
import React, { useState } from "react";
import Portal from "../../../components/Portal";

const BillDetailsModal = ({ bill, customer, onClose }) => {
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

  React.useEffect(() => {
    document.addEventListener("keydown", handleEscapeKey);
    
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
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
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'paid':
        return { label: "Paid", color: "success", icon: "fa-check-circle" };
      case 'pending':
        return { label: "Pending", color: "warning", icon: "fa-clock" };
      case 'overdue':
        return { label: "Overdue", color: "danger", icon: "fa-exclamation-triangle" };
      case 'cancelled':
        return { label: "Cancelled", color: "secondary", icon: "fa-times-circle" };
      default:
        return { label: status, color: "secondary", icon: "fa-question-circle" };
    }
  };

  const statusInfo = getStatusInfo(bill.status);

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
                <i className="fas fa-file-invoice-dollar me-2"></i>
                Bill Details
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white btn-smooth"
                onClick={closeModal}
                aria-label="Close"
              ></button>
            </div>
            
            <div className="modal-body bg-light modal-smooth" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {/* Bill Summary Card */}
              <div className="card border-0 bg-white mb-4">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col">
                      <h4 className="mb-1 text-dark">Bill #{bill.id}</h4>
                      <p className="text-muted mb-2">WWS ID: {bill.wws_id}</p>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        <span className={`badge bg-${statusInfo.color} fs-6`}>
                          <i className={`fas ${statusInfo.icon} me-1`}></i>
                          {statusInfo.label}
                        </span>
                        {bill.online_meter_used && (
                          <span className="badge bg-info fs-6">
                            <i className="fas fa-wifi me-1"></i>
                            Online Meter
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="text-end">
                        <div className="h4 text-success mb-1">₱{bill.total_payable?.toFixed(2) || '0.00'}</div>
                        <small className="text-muted">Total Payable</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                {/* Customer Information */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-white h-100">
                    <div className="card-header bg-transparent border-bottom-0">
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-user me-2 text-primary"></i>
                        Customer Information
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Customer Name</label>
                        <p className="mb-0 fw-semibold text-dark">{customer.name}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">WWS ID</label>
                        <p className="mb-0 fw-semibold text-dark">{customer.wws_id || bill.wws_id}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Service Type</label>
                        <p className="mb-0 fw-semibold text-dark text-capitalize">{customer.service}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reading Information */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-white h-100">
                    <div className="card-header bg-transparent border-bottom-0">
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-tachometer-alt me-2 text-success"></i>
                        Reading Information
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Reading Date</label>
                        <p className="mb-0 fw-semibold text-dark">{formatDate(bill.reading_date)}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Due Date</label>
                        <p className="mb-0 fw-semibold text-dark">{formatDate(bill.due_date)}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Meter Reader</label>
                        <p className="mb-0 fw-semibold text-dark">{bill.meter_reader}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consumption Details */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-white h-100">
                    <div className="card-header bg-transparent border-bottom-0">
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-water me-2 text-info"></i>
                        Consumption Details
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-6">
                          <div className="mb-3">
                            <label className="form-label small fw-semibold text-muted mb-1">Previous Reading</label>
                            <p className="mb-0 fw-semibold text-dark">{bill.previous_reading} m³</p>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="mb-3">
                            <label className="form-label small fw-semibold text-muted mb-1">Present Reading</label>
                            <p className="mb-0 fw-semibold text-dark">{bill.present_reading} m³</p>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Consumption</label>
                        <p className="mb-0 fw-semibold text-primary">{bill.consumption} m³</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Details */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-white h-100">
                    <div className="card-header bg-transparent border-bottom-0">
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-money-bill-wave me-2 text-warning"></i>
                        Billing Details
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Base Amount</label>
                        <p className="mb-0 fw-semibold text-dark">₱{bill.amount?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Penalty</label>
                        <p className="mb-0 fw-semibold text-danger">₱{bill.penalty?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Total Payable</label>
                        <p className="mb-0 fw-bold text-success">₱{bill.total_payable?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Restatement Information */}
                {bill.restated_amount && (
                  <div className="col-12">
                    <div className="card border-warning bg-white">
                      <div className="card-header bg-warning bg-opacity-10">
                        <h6 className="mb-0 text-warning">
                          <i className="fas fa-exchange-alt me-2"></i>
                          Restatement Information
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-4">
                            <label className="form-label small fw-semibold text-muted mb-1">Restated Amount</label>
                            <p className="mb-0 fw-bold text-warning">₱{bill.restated_amount.toFixed(2)}</p>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small fw-semibold text-muted mb-1">Reason</label>
                            <p className="mb-0 fw-semibold text-dark text-capitalize">
                              {bill.restatement_reason?.replace('_', ' ') || 'N/A'}
                            </p>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small fw-semibold text-muted mb-1">Authorization Code</label>
                            <p className="mb-0 fw-semibold text-dark">{bill.authorization_code || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Information */}
                {bill.status === 'paid' && (
                  <div className="col-12">
                    <div className="card border-success bg-white">
                      <div className="card-header bg-success bg-opacity-10">
                        <h6 className="mb-0 text-success">
                          <i className="fas fa-check-circle me-2"></i>
                          Payment Information
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <label className="form-label small fw-semibold text-muted mb-1">Paid At</label>
                            <p className="mb-0 fw-semibold text-dark">
                              {bill.paid_at ? formatDate(bill.paid_at) : 'N/A'}
                            </p>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-semibold text-muted mb-1">QR Number</label>
                            <p className="mb-0 fw-semibold text-dark">{bill.qr_number || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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

export default BillDetailsModal;