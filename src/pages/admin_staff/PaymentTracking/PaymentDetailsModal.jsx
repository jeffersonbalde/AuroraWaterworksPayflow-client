// src/pages/admin_staff/PaymentTracking/PaymentDetailsModal.jsx
import React, { useState } from "react";
import Portal from "../../../components/Portal";

const PaymentDetailsModal = ({ payment, customer, onClose }) => {
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
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { label: "Completed", color: "success", icon: "fa-check-circle" };
      case 'pending':
        return { label: "Pending", color: "warning", icon: "fa-clock" };
      case 'processing':
        return { label: "Processing", color: "info", icon: "fa-spinner" };
      case 'failed':
        return { label: "Failed", color: "danger", icon: "fa-times-circle" };
      case 'cancelled':
        return { label: "Cancelled", color: "secondary", icon: "fa-ban" };
      default:
        return { label: status, color: "secondary", icon: "fa-question-circle" };
    }
  };

  const getPaymentMethodInfo = (method) => {
    switch (method) {
      case 'online':
        return { label: "Online", color: "info", icon: "fa-globe" };
      case 'over_the_counter':
        return { label: "Over the Counter", color: "primary", icon: "fa-store" };
      default:
        return { label: method, color: "secondary", icon: "fa-credit-card" };
    }
  };

  const statusInfo = getStatusInfo(payment.payment_status || payment.status);
  const methodInfo = getPaymentMethodInfo(payment.payment_method);

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
                <i className="fas fa-money-bill-wave me-2"></i>
                Payment Details
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white btn-smooth"
                onClick={closeModal}
                aria-label="Close"
              ></button>
            </div>
            
            <div className="modal-body bg-light modal-smooth" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {/* Payment Summary Card */}
              <div className="card border-0 bg-white mb-4">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col">
                      <h4 className="mb-1 text-dark">Payment #{payment.id}</h4>
                      <p className="text-muted mb-2">WWS ID: {customer?.wws_id || payment.wws_id}</p>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        <span className={`badge bg-${statusInfo.color} fs-6`}>
                          <i className={`fas ${statusInfo.icon} me-1`}></i>
                          {statusInfo.label}
                        </span>
                        <span className={`badge bg-${methodInfo.color} fs-6`}>
                          <i className={`fas ${methodInfo.icon} me-1`}></i>
                          {methodInfo.label}
                        </span>
                        {payment.payment_gateway && (
                          <span className="badge bg-secondary fs-6">
                            <i className="fas fa-network-wired me-1"></i>
                            {payment.payment_gateway.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="text-end">
                        <div className="h4 text-success mb-1">₱{(parseFloat(payment.amount_paid) || 0).toFixed(2)}</div>
                        <small className="text-muted">Amount Paid</small>
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
                        <p className="mb-0 fw-semibold text-dark">{customer?.name || 'Unknown'}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">WWS ID</label>
                        <p className="mb-0 fw-semibold text-dark">{customer?.wws_id || payment.wws_id}</p>
                      </div>
                      {customer?.service && (
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-muted mb-1">Service Type</label>
                          <p className="mb-0 fw-semibold text-dark text-capitalize">{customer.service}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-white h-100">
                    <div className="card-header bg-transparent border-bottom-0">
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-calendar-alt me-2 text-success"></i>
                        Payment Information
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Payment Date</label>
                        <p className="mb-0 fw-semibold text-dark">{formatDate(payment.payment_date)}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">QR Date</label>
                        <p className="mb-0 fw-semibold text-dark">
                          {payment.qr_date ? formatDate(payment.qr_date) : 'N/A'}
                        </p>
                      </div>
                      {payment.processed_at && (
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-muted mb-1">Processed At</label>
                          <p className="mb-0 fw-semibold text-dark">{formatDate(payment.processed_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-white h-100">
                    <div className="card-header bg-transparent border-bottom-0">
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-money-bill-wave me-2 text-warning"></i>
                        Payment Details
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Amount Paid</label>
                        <p className="mb-0 fw-bold text-success">₱{(parseFloat(payment.amount_paid) || 0).toFixed(2)}</p>
                      </div>
                      {payment.balance !== undefined && (
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-muted mb-1">Balance</label>
                          <p className="mb-0 fw-semibold text-dark">₱{(parseFloat(payment.balance) || 0).toFixed(2)}</p>
                        </div>
                      )}
                      {payment.electronic_amount && (
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-muted mb-1">Electronic Amount</label>
                          <p className="mb-0 fw-semibold text-dark">₱{(parseFloat(payment.electronic_amount) || 0).toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* QR & Reference Information */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-white h-100">
                    <div className="card-header bg-transparent border-bottom-0">
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-qrcode me-2 text-info"></i>
                        QR & Reference Information
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">QR Number</label>
                        <p className="mb-0 fw-semibold text-dark">{payment.qr_number || 'N/A'}</p>
                      </div>
                      {payment.electronic_qr_number && (
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-muted mb-1">Electronic QR Number</label>
                          <p className="mb-0 fw-semibold text-dark">{payment.electronic_qr_number}</p>
                        </div>
                      )}
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">
                          GCash Transaction Reference
                        </label>
                        {payment.gateway_reference ? (
                          <p className="mb-0 fw-bold text-primary fs-6">{payment.gateway_reference}</p>
                        ) : (
                          <p className="mb-0 text-muted fst-italic">Not provided by customer yet</p>
                        )}
                      </div>
                      {payment.gateway_transaction_id && (
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-muted mb-1">Transaction ID</label>
                          <p className="mb-0 fw-semibold text-dark">{payment.gateway_transaction_id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                {(payment.collector_name || payment.failure_reason) && (
                  <div className="col-12">
                    <div className={`card border-${payment.failure_reason ? 'danger' : 'info'} bg-white`}>
                      <div className={`card-header bg-${payment.failure_reason ? 'danger' : 'info'} bg-opacity-10`}>
                        <h6 className={`mb-0 text-${payment.failure_reason ? 'danger' : 'info'}`}>
                          <i className={`fas ${payment.failure_reason ? 'fa-exclamation-triangle' : 'fa-info-circle'} me-2`}></i>
                          {payment.failure_reason ? 'Failure Information' : 'Additional Information'}
                        </h6>
                      </div>
                      <div className="card-body">
                        {payment.collector_name && (
                          <div className="mb-3">
                            <label className="form-label small fw-semibold text-muted mb-1">Collector Name</label>
                            <p className="mb-0 fw-semibold text-dark">{payment.collector_name}</p>
                          </div>
                        )}
                        {payment.failure_reason && (
                          <div className="mb-3">
                            <label className="form-label small fw-semibold text-muted mb-1">Failure Reason</label>
                            <p className="mb-0 fw-semibold text-danger">{payment.failure_reason}</p>
                          </div>
                        )}
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

export default PaymentDetailsModal;

