// QRCodeModal.jsx - Isolated component to prevent re-renders
import React, { useRef, useEffect, useState } from 'react';
import Portal from '../../../components/Portal';
import qrCodeImage from '../../../assets/images/admin_gcash_qrcode.jpg';

const QRCodeModal = React.memo(({ 
  isOpen, 
  qrCodePayment, 
  submittingReference,
  pollingPaymentId,
  onClose,
  onSubmitReference,
  inputRef,
  localValueRef,
  isTypingRef
}) => {
  // Local state to track if input has value (for button disabled state)
  const [hasInputValue, setHasInputValue] = useState(false);

  // Update hasInputValue when input changes (but don't cause parent re-render)
  useEffect(() => {
    if (inputRef?.current) {
      const checkValue = () => {
        setHasInputValue(!!inputRef.current?.value?.trim());
      };
      
      // Check on mount
      checkValue();
      
      // Listen to input events
      const input = inputRef.current;
      input.addEventListener('input', checkValue);
      
      return () => {
        input.removeEventListener('input', checkValue);
      };
    }
  }, [isOpen, inputRef]);

  if (!isOpen || !qrCodePayment) return null;

  return (
    <Portal>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show d-block"
        style={{ 
          backgroundColor: "rgba(0,0,0,0.5)",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1050
        }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg">
            <div
              className="modal-header border-0"
              style={{
                background: "var(--primary-color)",
                color: "white",
              }}
            >
              <h5 className="modal-title fw-semibold">
                <i className="fas fa-qrcode me-2"></i>
                Pay via GCash QR Code
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body text-center p-4">
              <div className="mb-4">
                <h5 className="mb-3">
                  Scan this QR code with your GCash app
                </h5>
                <div className="d-flex justify-content-center mb-3">
                  <img
                    src={qrCodePayment.qrCodeUrl || qrCodeImage}
                    alt="GCash QR Code"
                    style={{
                      maxWidth: "300px",
                      width: "100%",
                      height: "auto",
                      border: "2px solid #e0e0e0",
                      borderRadius: "8px",
                      backgroundColor: "white",
                    }}
                    onError={(e) => {
                      e.target.src = qrCodeImage;
                    }}
                  />
                </div>
                <p className="text-muted small mb-2">
                  Open your GCash app and scan this QR code to complete your
                  payment
                </p>
              </div>

              <div className="card border-0 bg-light mb-3">
                <div className="card-body">
                  <div className="row text-start">
                    <div className="col-6">
                      <small className="text-muted">Amount to Pay</small>
                      <div className="fw-bold text-success fs-5">
                        ₱{qrCodePayment.amount.toFixed(2)}
                      </div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Bill Period</small>
                      <div className="fw-medium">
                        {qrCodePayment.billPeriod}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info small mb-3">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Note:</strong> After scanning and paying, please
                enter your GCash transaction reference number below.
              </div>

              {/* Customer Reference Input */}
              <div className="card border-0 bg-light">
                <div className="card-body">
                  <label className="form-label fw-semibold small mb-2">
                    <i className="fas fa-receipt me-2"></i>
                    Enter Your GCash Transaction Reference Number
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., GCASH123456789 or your GCash transaction reference"
                      ref={inputRef}
                      onChange={(e) => {
                        e.stopPropagation();
                        const value = e.target.value;
                        localValueRef.current = value;
                        isTypingRef.current = true;
                        setHasInputValue(!!value.trim());
                        // NO parent state updates - prevents parent re-renders
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        localValueRef.current = value;
                        isTypingRef.current = false;
                        setHasInputValue(!!value.trim());
                      }}
                      disabled={submittingReference}
                      autoComplete="off"
                      style={{
                        backgroundColor: "var(--input-bg)",
                        borderColor: "var(--input-border)",
                        color: "var(--input-text)",
                      }}
                    />
                    <button
                      className="btn btn-success"
                      type="button"
                      onClick={onSubmitReference}
                      disabled={!hasInputValue || submittingReference}
                      style={{
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      {submittingReference ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check me-2"></i>
                          Submit Reference
                        </>
                      )}
                    </button>
                  </div>
                  <small className="text-muted d-block mt-2">
                    <i className="fas fa-info-circle me-1"></i>
                    You can find this in your GCash app after completing the
                    payment
                  </small>
                </div>
              </div>
            </div>

            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={onClose}
                disabled={submittingReference}
              >
                Cancel Payment
              </button>
              <div className="d-flex align-items-center ms-auto">
                {pollingPaymentId && (
                  <>
                    <div
                      className="spinner-border spinner-border-sm text-primary me-2"
                      role="status"
                    >
                      <span className="visually-hidden">
                        Checking payment status...
                      </span>
                    </div>
                    <small className="text-muted">
                      Checking payment status...
                    </small>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}, (prevProps, nextProps) => {
  // Only re-render if modal visibility changes, not on any other prop changes
  return prevProps.isOpen === nextProps.isOpen && 
         prevProps.submittingReference === nextProps.submittingReference &&
         prevProps.pollingPaymentId === nextProps.pollingPaymentId;
});

QRCodeModal.displayName = 'QRCodeModal';

export default QRCodeModal;

