// src/pages/client/MakePayment.jsx - GCASH QR CODE PAYMENT INTEGRATION
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { showAlert, showToast } from "../../../services/notificationService";
import Portal from "../../../components/Portal";
import QRCodeModal from "./QRCodeModal";
import qrCodeImage from "../../../assets/images/admin_gcash_qrcode.jpg";

const MakePayment = () => {
  const { user, token } = useAuth();
  const [pendingBills, setPendingBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [paymentGateway, setPaymentGateway] = useState("gcash");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [pollingPaymentId, setPollingPaymentId] = useState(null);
  const [qrCodePayment, setQrCodePayment] = useState(null);
  const [customerReference, setCustomerReference] = useState("");
  const [submittingReference, setSubmittingReference] = useState(false);
  const pollingIntervalRef = React.useRef(null);
  const isTypingRef = React.useRef(false);
  const shouldPollRef = React.useRef(true);
  const qrCodeInputRef = React.useRef(null);
  const qrCodeLocalValueRef = React.useRef("");
  const modalVisibleRef = React.useRef(false);

  useEffect(() => {
    fetchPendingBills();

    // Check for URL parameters (success/cancel callbacks)
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const cancelled = urlParams.get("cancelled");
    const pending = urlParams.get("pending");
    const paymentId = urlParams.get("payment_id");

    if (success === "true" && paymentId) {
      // Payment was successful, start polling to verify
      setPollingPaymentId(paymentId);
      checkPaymentStatus(paymentId);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (cancelled === "true") {
      showAlert.info(
        "Payment Cancelled",
        "Your payment was cancelled. You can try again anytime."
      );
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (pending === "true" && paymentId) {
      // Payment is still pending, start polling
      setPollingPaymentId(paymentId);
      startPaymentPolling(paymentId);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchPendingBills = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/client/pending-bills`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPendingBills(data.pending_bills || []);
      } else {
        throw new Error("Failed to fetch pending bills");
      }
    } catch (error) {
      console.error("Error fetching pending bills:", error);
      showAlert.error("Error", "Failed to load pending bills");
      setPendingBills([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedBill) {
      showAlert.error("Error", "Please select a bill to pay");
      return;
    }

    const result = await showAlert.confirm(
      "Confirm Payment",
      `Are you sure you want to pay ₱${selectedBill.total_payable.toFixed(
        2
      )} for ${new Date(selectedBill.reading_date).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })} bill using GCash?`,
      "Yes, Pay Now",
      "Cancel"
    );

    if (!result.isConfirmed) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/client/make-payment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            bill_id: selectedBill.id,
            payment_method: paymentMethod,
            payment_gateway: paymentGateway,
            amount: selectedBill.total_payable,
          }),
        }
      );

      const data = await response.json();

      console.log("Payment Response:", data);

      if (response.ok && data.success) {
        // Check if payment requires redirect to PayMongo checkout
        if (data.requires_redirect && data.checkout_url) {
          // Store payment ID for polling
          setPollingPaymentId(data.payment.id);

          // Show info message
          showToast.info("Redirecting to GCash payment...");

          // Redirect to PayMongo checkout
          window.location.href = data.checkout_url;
          return;
        } else if (data.requires_redirect && !data.checkout_url) {
          // Checkout URL is missing
          throw new Error(
            "Payment checkout URL was not generated. Please try again or contact support."
          );
        }

        // Check if this is a QR code payment
        if (
          data.payment_result?.payment_method === "qr_code" ||
          data.payment_result?.qr_code_url
        ) {
          setQrCodePayment({
            payment: data.payment,
            reference:
              data.payment_result?.reference || data.payment?.gateway_reference,
            amount: parseFloat(selectedBill.total_payable) || 0,
            billPeriod: new Date(selectedBill.reading_date).toLocaleDateString(
              "en-US",
              { month: "long", year: "numeric" }
            ),
            qrCodeUrl: data.payment_result?.qr_code_url || qrCodeImage,
          });
          // Disable polling initially - will be enabled after reference is submitted
          shouldPollRef.current = false;
          setPollingPaymentId(null); // Don't start polling yet
          setShowQRCodeModal(true);
          return;
        }

        // For immediate success payments
        setPaymentResult({
          payment: data.payment,
          payment_result: data.payment_result,
          reference:
            data.payment_result?.reference || data.payment?.gateway_reference,
          amount: parseFloat(selectedBill.total_payable) || 0,
          billPeriod: new Date(selectedBill.reading_date).toLocaleDateString(
            "en-US",
            { month: "long", year: "numeric" }
          ),
        });

        setShowSuccessModal(true);

        // Refresh bills and reset selection
        await fetchPendingBills();
        setSelectedBill(null);
      } else {
        // Show detailed error from backend
        const errorMessage =
          data.message || data.error || "Payment initialization failed";
        const errorDetails = data.errors ? JSON.stringify(data.errors) : "";
        console.error("Payment error details:", {
          data,
          errorMessage,
          errorDetails,
        });
        throw new Error(
          errorMessage + (errorDetails ? `: ${errorDetails}` : "")
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
      console.error("Error details:", error.response || error);
      showAlert.error(
        "Payment Failed",
        error.message ||
          "There was an error processing your payment. Please check the console for details."
      );
    } finally {
      setProcessing(false);
    }
  };

  const checkPaymentStatus = useCallback(
    async (paymentId) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_LARAVEL_API}/payment/status/${paymentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          // Only update state if status actually changed to prevent flickering
          if (data.payment_status === "completed") {
            // Payment completed, show success
            const payment = data.payment;
            setPaymentResult({
              payment: payment,
              reference: payment.gateway_reference,
              amount: parseFloat(payment.amount_paid) || 0,
              billPeriod: payment.bill
                ? new Date(payment.bill.reading_date).toLocaleDateString(
                    "en-US",
                    { month: "long", year: "numeric" }
                  )
                : "N/A",
            });
            setShowSuccessModal(true);
            setShowQRCodeModal(false);
            setPollingPaymentId(null);
            setQrCodePayment(null);
            setCustomerReference("");

            // Refresh bills
            await fetchPendingBills();
            setSelectedBill(null);

            showToast.success("Payment completed successfully!");
          } else if (
            data.payment_status === "failed" ||
            data.payment_status === "cancelled"
          ) {
            setPollingPaymentId(null);
            setShowQRCodeModal(false);
            setQrCodePayment(null);
            setCustomerReference("");
            showAlert.error(
              "Payment Failed",
              "Your payment was not completed. Please try again."
            );
          }
          // If still pending, don't update any state - just continue polling silently
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        // Don't update state on error to prevent flickering
      }
    },
    [token]
  );

  const startPaymentPolling = useCallback(
    (paymentId) => {
      // Clear any existing polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      // Poll every 5 seconds for up to 2 minutes
      let pollCount = 0;
      const maxPolls = 24; // 24 * 5 seconds = 2 minutes

      pollingIntervalRef.current = setInterval(async () => {
        // Skip polling if user is actively typing OR if polling is disabled OR if modal is still open
        if (isTypingRef.current || !shouldPollRef.current || showQRCodeModal) {
          return;
        }

        pollCount++;

        await checkPaymentStatus(paymentId);

        // Stop polling if payment is completed or failed, or max polls reached
        if (pollCount >= maxPolls) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setPollingPaymentId(null);
          showAlert.warning(
            "Payment Status",
            "Payment verification is taking longer than expected. Please check your payment history."
          );
        }
      }, 5000); // Increased to 5 seconds to reduce frequency

      // Cleanup on unmount
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    },
    [checkPaymentStatus]
  );

  useEffect(() => {
    if (pollingPaymentId) {
      const cleanup = startPaymentPolling(pollingPaymentId);
      return cleanup;
    }
  }, [pollingPaymentId]);

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setPaymentResult(null);
  };

  const handleQRCodeModalClose = () => {
    // Stop polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    isTypingRef.current = false;
    if (window.typingTimeout) {
      clearTimeout(window.typingTimeout);
    }

    setShowQRCodeModal(false);
    setQrCodePayment(null);
    setPollingPaymentId(null);
    setCustomerReference("");
  };

  // Stable handler for reference input to prevent flickering
  const handleReferenceChange = useCallback((e) => {
    const value = e.target.value;
    setCustomerReference(value);

    // Mark that user is typing
    isTypingRef.current = true;

    // Clear typing flag after 1 second of no typing
    if (window.typingTimeout) {
      clearTimeout(window.typingTimeout);
    }
    window.typingTimeout = setTimeout(() => {
      isTypingRef.current = false;
    }, 1000);
  }, []);

  const handleSubmitReference = async () => {
    // Get value from ref if input exists, otherwise use state
    const inputValue =
      qrCodeInputRef?.current?.value?.trim() ||
      qrCodeLocalValueRef.current?.trim() ||
      customerReference.trim();

    if (!inputValue || !qrCodePayment?.payment?.id) {
      showAlert.error("Error", "Please enter a valid reference number");
      return;
    }

    // Update state with the value
    setCustomerReference(inputValue);
    qrCodeLocalValueRef.current = inputValue;
    isTypingRef.current = false;

    setSubmittingReference(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/client/payments/${
          qrCodePayment.payment.id
        }/update-reference`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            gateway_reference: inputValue,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        showToast.success("Reference number submitted successfully!");

        // Close the modal immediately after successful submission
        setShowQRCodeModal(false);
        setQrCodePayment(null);
        setCustomerReference("");
        qrCodeLocalValueRef.current = "";

        // Enable polling and start it after reference is submitted
        // Use a small delay to ensure modal is fully closed before starting polling
        shouldPollRef.current = true;
        const paymentId = qrCodePayment.payment.id; // Store payment ID before clearing state
        setTimeout(() => {
          setPollingPaymentId(paymentId);
        }, 100);

        // Show info message
        showToast.info("Reference saved. Waiting for admin verification...");
      } else {
        throw new Error(
          data.message || data.error || "Failed to submit reference number"
        );
      }
    } catch (error) {
      console.error("Error submitting reference:", error);
      showAlert.error(
        "Submission Failed",
        error.message || "Failed to submit reference number. Please try again."
      );
    } finally {
      setSubmittingReference(false);
    }
  };

  const handleGatewayChange = (gateway) => {
    setPaymentGateway(gateway);
  };

  // Success Modal Component
  const SuccessModal = () => {
    if (!showSuccessModal || !paymentResult) return null;

    return (
      <Portal>
        <div className="modal-backdrop fade show"></div>
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div
                className="modal-header border-0"
                style={{
                  background: "var(--success-color)",
                  color: "white",
                }}
              >
                <h5 className="modal-title fw-semibold">
                  <i className="fas fa-check-circle me-2"></i>
                  Payment Successful!
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleSuccessModalClose}
                ></button>
              </div>

              <div className="modal-body text-center p-4">
                <div className="mb-4">
                  <i className="fas fa-check-circle fa-4x text-success mb-3"></i>
                  <h4 className="text-success mb-2">Payment Completed</h4>
                  <p className="text-muted">
                    {paymentGateway === "demo"
                      ? "This was a test payment. No real money was processed."
                      : "Your payment has been processed successfully."}
                  </p>
                </div>

                <div className="card border-0 bg-light">
                  <div className="card-body">
                    <div className="row text-start">
                      <div className="col-6">
                        <small className="text-muted">Reference Number</small>
                        <div className="fw-bold text-primary">
                          {paymentResult.reference || "N/A"}
                        </div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Amount Paid</small>
                        <div className="fw-bold text-success">
                          ₱{(parseFloat(paymentResult.amount) || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="row text-start mt-3">
                      <div className="col-6">
                        <small className="text-muted">Bill Period</small>
                        <div className="fw-medium">
                          {paymentResult.billPeriod}
                        </div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Payment Gateway</small>
                        <div>
                          <span className="badge bg-primary text-uppercase">
                            {paymentResult.payment_result?.gateway ||
                              paymentGateway}
                          </span>
                        </div>
                      </div>
                    </div>

                    {paymentResult.payment_result?.message && (
                      <div className="mt-3 p-2 bg-info text-dark rounded small">
                        <i className="fas fa-info-circle me-1"></i>
                        {paymentResult.payment_result.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={handleSuccessModalClose}
                  style={{
                    transition: "all 0.2s ease-in-out",
                    border: "2px solid var(--primary-color)",
                    color: "var(--primary-color)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                    e.target.style.backgroundColor = "var(--primary-color)";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "var(--primary-color)";
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-success text-white"
                  onClick={() => {
                    handleSuccessModalClose();
                    window.location.href = "/payment-history";
                  }}
                  style={{
                    transition: "all 0.2s ease-in-out",
                    borderWidth: "2px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <i className="fas fa-history me-2"></i>
                  View Payment History
                </button>
              </div>
            </div>
          </div>
        </div>
      </Portal>
    );
  };

  // Skeleton Loader
  const TableRowSkeleton = () => (
    <tr className="align-middle" style={{ height: "70px" }}>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-3" style={{ height: "20px" }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave mb-1">
          <span className="placeholder col-8" style={{ height: "16px" }}></span>
        </div>
        <div className="placeholder-wave">
          <span className="placeholder col-6" style={{ height: "14px" }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave mb-1">
          <span className="placeholder col-6" style={{ height: "16px" }}></span>
        </div>
        <div className="placeholder-wave">
          <span className="placeholder col-7" style={{ height: "14px" }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-6" style={{ height: "16px" }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave">
          <span
            className="placeholder col-5"
            style={{ height: "24px", borderRadius: "12px" }}
          ></span>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="container-fluid px-3 py-2 make-payment-container fadeIn">
      {/* QR Code Modal - Only render when both conditions are true */}
      {showQRCodeModal && qrCodePayment && (
        <QRCodeModal
          isOpen={showQRCodeModal}
          qrCodePayment={qrCodePayment}
          submittingReference={submittingReference}
          pollingPaymentId={pollingPaymentId}
          onClose={handleQRCodeModalClose}
          onSubmitReference={handleSubmitReference}
          inputRef={qrCodeInputRef}
          localValueRef={qrCodeLocalValueRef}
          isTypingRef={isTypingRef}
        />
      )}

      {/* Success Modal */}
      <SuccessModal />

      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
        <div className="flex-grow-1 mb-2 mb-md-0">
          <h1
            className="h4 mb-1 fw-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Make a Payment
          </h1>
          <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
            Select an outstanding bill, choose your preferred gateway, and
            submit a secured payment in just a few steps.
          </p>
        </div>
        {!loading && (
          <div className="text-start text-md-end">
            <span className="badge bg-success-subtle text-success fw-semibold">
              <i className="fas fa-shield-alt me-1"></i>
              Secure Payment Flow
            </span>
          </div>
        )}
      </div>

      <div className="row">
        {/* Pending Bills */}
        <div className="col-lg-8">
          <div
            className="card border-0 shadow-sm mb-4"
            style={{ backgroundColor: "var(--background-white)" }}
          >
            <div
              className="card-header border-bottom-0 py-2"
              style={{
                background: "var(--topbar-bg)",
                color: "var(--topbar-text)",
              }}
            >
              <h5 className="card-title mb-0 fw-semibold">
                <i className="fas fa-clock me-2"></i>
                Pending Bills
                {!loading && (
                  <small className="opacity-75 ms-2">
                    ({pendingBills.length} bills)
                  </small>
                )}
              </h5>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead
                      style={{ backgroundColor: "var(--background-light)" }}
                    >
                      <tr>
                        <th className="small fw-semibold"></th>
                        <th className="small fw-semibold">Billing Period</th>
                        <th className="small fw-semibold">Amount Due</th>
                        <th className="small fw-semibold">Due Date</th>
                        <th className="small fw-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(3)].map((_, index) => (
                        <TableRowSkeleton key={index} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : pendingBills.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i
                      className="fas fa-check-circle fa-3x"
                      style={{ color: "var(--success-color)", opacity: 0.5 }}
                    ></i>
                  </div>
                  <h5 className="mb-2" style={{ color: "var(--text-muted)" }}>
                    No Pending Bills
                  </h5>
                  <p
                    className="mb-3 small"
                    style={{ color: "var(--text-muted)" }}
                  >
                    All your bills are paid up to date!
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead
                      style={{ backgroundColor: "var(--background-light)" }}
                    >
                      <tr>
                        <th className="small fw-semibold"></th>
                        <th className="small fw-semibold">Billing Period</th>
                        <th className="small fw-semibold">Amount Due</th>
                        <th className="small fw-semibold">Due Date</th>
                        <th className="small fw-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingBills.map((bill) => (
                        <tr
                          key={bill.id}
                          className={`align-middle ${
                            selectedBill?.id === bill.id ? "table-active" : ""
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedBill(bill)}
                        >
                          <td>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="selectedBill"
                                checked={selectedBill?.id === bill.id}
                                onChange={() => setSelectedBill(bill)}
                              />
                            </div>
                          </td>
                          <td style={{ color: "var(--text-primary)" }}>
                            <div className="fw-medium">
                              {new Date(bill.reading_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ color: "var(--text-primary)" }}>
                              <div
                                className="fw-bold"
                                style={{ color: "var(--danger-color)" }}
                              >
                                ₱{bill.total_payable.toFixed(2)}
                              </div>
                              {bill.penalty > 0 && (
                                <div
                                  className="small"
                                  style={{ color: "var(--danger-color)" }}
                                >
                                  Includes ₱{bill.penalty.toFixed(2)} penalty
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div
                              className={`fw-medium ${
                                bill.is_overdue ? "text-danger" : ""
                              }`}
                              style={{
                                color: bill.is_overdue
                                  ? "var(--danger-color)"
                                  : "var(--text-primary)",
                              }}
                            >
                              {new Date(bill.due_date).toLocaleDateString()}
                              {bill.is_overdue && (
                                <div className="badge bg-danger ms-2 small">
                                  Overdue ({bill.days_overdue} days)
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-warning text-dark small">
                              Pending
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="col-lg-4">
          <div
            className="card border-0 shadow-sm"
            style={{ backgroundColor: "var(--background-white)" }}
          >
            <div
              className="card-header border-bottom-0 py-2"
              style={{
                background: "var(--topbar-bg)",
                color: "var(--topbar-text)",
              }}
            >
              <h5 className="card-title mb-0 fw-semibold">
                <i className="fas fa-credit-card me-2"></i>
                Make Payment
              </h5>
            </div>
            <div className="card-body">
              {!selectedBill ? (
                <div className="text-center py-4">
                  <i
                    className="fas fa-receipt fa-2x mb-3"
                    style={{ color: "var(--text-muted)", opacity: 0.5 }}
                  ></i>
                  <p className="small" style={{ color: "var(--text-muted)" }}>
                    Select a bill to proceed with payment
                  </p>
                </div>
              ) : (
                <>
                  {/* Selected Bill Summary */}
                  <div
                    className="alert"
                    style={{
                      backgroundColor: "var(--info-light)",
                      borderColor: "var(--info-color)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <h6 className="alert-heading fw-semibold">Selected Bill</h6>
                    <div className="small">
                      <strong>Period:</strong>{" "}
                      {new Date(selectedBill.reading_date).toLocaleDateString(
                        "en-US",
                        { month: "long", year: "numeric" }
                      )}
                      <br />
                      <strong>Amount Due:</strong> ₱
                      {selectedBill.total_payable.toFixed(2)}
                      {selectedBill.is_overdue && (
                        <div className="mt-1">
                          <small style={{ color: "var(--danger-color)" }}>
                            <i className="fas fa-exclamation-triangle me-1"></i>
                            This bill is {selectedBill.days_overdue} days
                            overdue
                          </small>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Gateway Selection - GCash Only */}
                  <div className="mb-3">
                    <label
                      className="form-label fw-semibold small"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Payment Gateway
                    </label>
                    <div
                      className="form-control form-control-sm"
                      style={{
                        backgroundColor: "var(--input-bg)",
                        borderColor: "var(--input-border)",
                        color: "var(--input-text)",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <i className="fas fa-mobile-alt text-primary"></i>
                      <span className="fw-semibold">GCash</span>
                    </div>
                    <div
                      className="form-text small"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Pay securely using your GCash account. You will be
                      redirected to complete the payment.
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="border-top pt-3">
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <small style={{ color: "var(--text-muted)" }}>
                          Base Amount
                        </small>
                        <div style={{ color: "var(--text-primary)" }}>
                          ₱{selectedBill.amount.toFixed(2)}
                        </div>
                      </div>
                      <div className="col-6">
                        <small style={{ color: "var(--text-muted)" }}>
                          Penalty
                        </small>
                        <div style={{ color: "var(--danger-color)" }}>
                          ₱{selectedBill.penalty.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="border-top pt-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <strong style={{ color: "var(--text-primary)" }}>
                          Total Payable
                        </strong>
                        <strong
                          className="fs-5"
                          style={{ color: "var(--success-color)" }}
                        >
                          ₱{selectedBill.total_payable.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <button
                    className="btn btn-sm btn-success text-white w-100 mt-4"
                    onClick={handlePayment}
                    disabled={processing}
                    style={{
                      transition: "all 0.2s ease-in-out",
                      borderWidth: "2px",
                    }}
                    onMouseEnter={(e) => {
                      if (!e.target.disabled) {
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    {processing ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-mobile-alt me-2"></i>
                        Pay with GCash
                      </>
                    )}
                  </button>

                  <div
                    className="alert mt-3 small"
                    style={{
                      backgroundColor: "var(--info-light)",
                      borderColor: "var(--info-color)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <i className="fas fa-shield-alt me-2"></i>
                    You will be redirected to PayMongo's secure payment page to
                    complete your GCash payment.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakePayment;
