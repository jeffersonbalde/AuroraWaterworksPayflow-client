// src/pages/admin_staff/BillingManagement/BillFormModal.jsx
import React, { useState, useEffect, useRef } from "react";
import Portal from "../../../components/Portal";
import { showAlert, showToast } from "../../../services/notificationService";

const BillFormModal = ({ bill, customers, onClose, onSave, token }) => {
  const [formData, setFormData] = useState({
    user_id: "",
    wws_id: "",
    reading_date: "",
    due_date: "",
    previous_reading: "",
    present_reading: "",
    consumption: "",
    amount: "",
    penalty: "0.00",
    total_payable: "",
    meter_reader: "",
    online_meter_used: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const isEdit = !!bill;
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  const initialFormState = useRef({
    user_id: "",
    wws_id: "",
    reading_date: "",
    due_date: "",
    previous_reading: "",
    present_reading: "",
    consumption: "",
    amount: "",
    penalty: "0.00",
    total_payable: "",
    meter_reader: "",
    online_meter_used: false,
  });

  useEffect(() => {
    if (bill) {
      const billFormState = {
        user_id: bill.user_id || "",
        wws_id: bill.wws_id || "",
        reading_date: bill.reading_date ? new Date(bill.reading_date).toISOString().split('T')[0] : "",
        due_date: bill.due_date ? new Date(bill.due_date).toISOString().split('T')[0] : "",
        previous_reading: bill.previous_reading || "",
        present_reading: bill.present_reading || "",
        consumption: bill.consumption || "",
        amount: bill.amount || "",
        penalty: bill.penalty || "0.00",
        total_payable: bill.total_payable || "",
        meter_reader: bill.meter_reader || "",
        online_meter_used: bill.online_meter_used || false,
      };

      setFormData(billFormState);
      initialFormState.current = { ...billFormState };
    } else {
      // Set default due date to 15 days from reading date
      const defaultReadingDate = new Date().toISOString().split('T')[0];
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 15);
      
      setFormData(prev => ({
        ...prev,
        reading_date: defaultReadingDate,
        due_date: defaultDueDate.toISOString().split('T')[0],
        penalty: "0.00"
      }));
      
      initialFormState.current = {
        user_id: "",
        wws_id: "",
        reading_date: defaultReadingDate,
        due_date: defaultDueDate.toISOString().split('T')[0],
        previous_reading: "",
        present_reading: "",
        consumption: "",
        amount: "",
        penalty: "0.00",
        total_payable: "",
        meter_reader: "",
        online_meter_used: false,
      };
    }
  }, [bill]);

  const checkFormChanges = (currentForm) => {
    return JSON.stringify(currentForm) !== JSON.stringify(initialFormState.current);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => {
      const newForm = { 
        ...prev, 
        [name]: newValue 
      };

      // Auto-calculate consumption and total payable
      if (name === 'previous_reading' || name === 'present_reading') {
        const prevReading = parseFloat(name === 'previous_reading' ? newValue : prev.previous_reading) || 0;
        const presReading = parseFloat(name === 'present_reading' ? newValue : prev.present_reading) || 0;
        
        if (presReading >= prevReading) {
          newForm.consumption = (presReading - prevReading).toFixed(2);
        }
      }

      // Auto-calculate total payable
      if (name === 'amount' || name === 'penalty') {
        const amount = parseFloat(name === 'amount' ? newValue : prev.amount) || 0;
        const penalty = parseFloat(name === 'penalty' ? newValue : prev.penalty) || 0;
        newForm.total_payable = (amount + penalty).toFixed(2);
      }

      setHasUnsavedChanges(checkFormChanges(newForm));
      return newForm;
    });

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    const selectedCustomer = customers.find(c => c.id == customerId);
    
    setFormData(prev => {
      const newForm = {
        ...prev,
        user_id: customerId,
        wws_id: selectedCustomer?.wws_id || ""
      };
      setHasUnsavedChanges(checkFormChanges(newForm));
      return newForm;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.user_id) {
      newErrors.user_id = "Customer is required";
    }

    if (!formData.reading_date) {
      newErrors.reading_date = "Reading date is required";
    }

    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    }

    if (!formData.previous_reading) {
      newErrors.previous_reading = "Previous reading is required";
    } else if (parseFloat(formData.previous_reading) < 0) {
      newErrors.previous_reading = "Previous reading cannot be negative";
    }

    if (!formData.present_reading) {
      newErrors.present_reading = "Present reading is required";
    } else if (parseFloat(formData.present_reading) < parseFloat(formData.previous_reading || 0)) {
      newErrors.present_reading = "Present reading cannot be less than previous reading";
    }

    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.meter_reader) {
      newErrors.meter_reader = "Meter reader is required";
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
      isEdit ? "Confirm Bill Update" : "Confirm Create Bill",
      `Are you sure you want to ${isEdit ? "update" : "create"} this bill?`,
      `Yes, ${isEdit ? "Update" : "Create"} Bill`,
      "Review Details"
    );

    if (!confirmation.isConfirmed) {
      return;
    }

    setLoading(true);

    try {
      showAlert.loading(
        isEdit ? "Updating Bill" : "Creating Bill",
        "Please wait while we save the bill information..."
      );

      const submitData = {
        ...formData,
        previous_reading: parseFloat(formData.previous_reading),
        present_reading: parseFloat(formData.present_reading),
        consumption: parseFloat(formData.consumption || 0),
        amount: parseFloat(formData.amount),
        penalty: parseFloat(formData.penalty || 0),
        total_payable: parseFloat(formData.total_payable || 0),
      };

      const url = isEdit
        ? `${import.meta.env.VITE_LARAVEL_API}/admin/bills/${bill.id}`
        : `${import.meta.env.VITE_LARAVEL_API}/admin/bills`;

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      showAlert.close();

      if (response.ok) {
        showToast.success(
          isEdit ? "Bill updated successfully!" : "Bill created successfully!"
        );
        
        setHasUnsavedChanges(false);
        onSave(data.bill || data);
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
          data.message || `Failed to ${isEdit ? "update" : "create"} bill`
        );
      }
    } catch (error) {
      showAlert.close();
      console.error("Error saving bill:", error);

      if (error.message.includes("Unauthenticated")) {
        showAlert.error(
          "Authentication Error",
          "Please log in again to continue."
        );
      } else {
        showAlert.error(
          "Error",
          error.message || `Failed to ${isEdit ? "update" : "create"} bill`
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
    await new Promise(resolve => setTimeout(resolve, 300));
    onClose();
  };

  useEffect(() => {
    document.addEventListener("keydown", handleEscapeKey);
    
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [loading, hasUnsavedChanges]);

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
                {isEdit ? "Edit Bill" : "Create New Bill"}
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
              {/* Modal Body */}
              <div
                className="modal-body modal-smooth"
                style={{
                  maxHeight: "70vh",
                  overflowY: "auto",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <div className="row g-3">
                  {/* Customer Information */}
                  <div className="col-12">
                    <div className="card border-0 bg-white modal-smooth mb-3">
                      <div className="card-header bg-light">
                        <h6 className="mb-0 fw-semibold">
                          <i className="fas fa-user me-2"></i>
                          Customer Information
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label small fw-semibold text-dark mb-1">
                                Customer <span className="text-danger">*</span>
                              </label>
                              <select
                                className={`form-control modal-smooth ${
                                  errors.user_id ? "is-invalid" : ""
                                }`}
                                name="user_id"
                                value={formData.user_id}
                                onChange={handleCustomerChange}
                                disabled={loading || isEdit}
                                style={{ backgroundColor: "#ffffff" }}
                              >
                                <option value="">Select Customer</option>
                                {customers.map((customer) => (
                                  <option key={customer.id} value={customer.id}>
                                    {customer.name} - {customer.wws_id} ({customer.service})
                                  </option>
                                ))}
                              </select>
                              {errors.user_id && (
                                <div className="invalid-feedback">{errors.user_id}</div>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label small fw-semibold text-dark mb-1">
                                WWS ID
                              </label>
                              <input
                                type="text"
                                className="form-control modal-smooth"
                                value={formData.wws_id}
                                disabled
                                style={{ backgroundColor: "#f8f9fa" }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reading Information */}
                  <div className="col-12 col-md-6">
                    <div className="card border-0 bg-white modal-smooth h-100">
                      <div className="card-header bg-light">
                        <h6 className="mb-0 fw-semibold">
                          <i className="fas fa-tachometer-alt me-2"></i>
                          Reading Information
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-dark mb-1">
                            Reading Date <span className="text-danger">*</span>
                          </label>
                          <input
                            type="date"
                            className={`form-control modal-smooth ${
                              errors.reading_date ? "is-invalid" : ""
                            }`}
                            name="reading_date"
                            value={formData.reading_date}
                            onChange={handleChange}
                            disabled={loading}
                            style={{ backgroundColor: "#ffffff" }}
                          />
                          {errors.reading_date && (
                            <div className="invalid-feedback">{errors.reading_date}</div>
                          )}
                        </div>

                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-dark mb-1">
                            Due Date <span className="text-danger">*</span>
                          </label>
                          <input
                            type="date"
                            className={`form-control modal-smooth ${
                              errors.due_date ? "is-invalid" : ""
                            }`}
                            name="due_date"
                            value={formData.due_date}
                            onChange={handleChange}
                            disabled={loading}
                            style={{ backgroundColor: "#ffffff" }}
                          />
                          {errors.due_date && (
                            <div className="invalid-feedback">{errors.due_date}</div>
                          )}
                        </div>

                        <div className="row">
                          <div className="col-6">
                            <div className="mb-3">
                              <label className="form-label small fw-semibold text-dark mb-1">
                                Previous Reading <span className="text-danger">*</span>
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                className={`form-control modal-smooth ${
                                  errors.previous_reading ? "is-invalid" : ""
                                }`}
                                name="previous_reading"
                                value={formData.previous_reading}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="0.00"
                                style={{ backgroundColor: "#ffffff" }}
                              />
                              {errors.previous_reading && (
                                <div className="invalid-feedback">{errors.previous_reading}</div>
                              )}
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="mb-3">
                              <label className="form-label small fw-semibold text-dark mb-1">
                                Present Reading <span className="text-danger">*</span>
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                className={`form-control modal-smooth ${
                                  errors.present_reading ? "is-invalid" : ""
                                }`}
                                name="present_reading"
                                value={formData.present_reading}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="0.00"
                                style={{ backgroundColor: "#ffffff" }}
                              />
                              {errors.present_reading && (
                                <div className="invalid-feedback">{errors.present_reading}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-dark mb-1">
                            Consumption (m³)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control modal-smooth"
                            name="consumption"
                            value={formData.consumption}
                            disabled
                            style={{ backgroundColor: "#f8f9fa" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Billing Information */}
                  <div className="col-12 col-md-6">
                    <div className="card border-0 bg-white modal-smooth h-100">
                      <div className="card-header bg-light">
                        <h6 className="mb-0 fw-semibold">
                          <i className="fas fa-money-bill-wave me-2"></i>
                          Billing Information
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-dark mb-1">
                            Amount <span className="text-danger">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className={`form-control modal-smooth ${
                              errors.amount ? "is-invalid" : ""
                            }`}
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="0.00"
                            style={{ backgroundColor: "#ffffff" }}
                          />
                          {errors.amount && (
                            <div className="invalid-feedback">{errors.amount}</div>
                          )}
                        </div>

                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-dark mb-1">
                            Penalty
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control modal-smooth"
                            name="penalty"
                            value={formData.penalty}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="0.00"
                            style={{ backgroundColor: "#ffffff" }}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-dark mb-1">
                            Total Payable
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control modal-smooth"
                            name="total_payable"
                            value={formData.total_payable}
                            disabled
                            style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-dark mb-1">
                            Meter Reader <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control modal-smooth ${
                              errors.meter_reader ? "is-invalid" : ""
                            }`}
                            name="meter_reader"
                            value={formData.meter_reader}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="Enter meter reader name"
                            style={{ backgroundColor: "#ffffff" }}
                          />
                          {errors.meter_reader && (
                            <div className="invalid-feedback">{errors.meter_reader}</div>
                          )}
                        </div>

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="online_meter_used"
                            checked={formData.online_meter_used}
                            onChange={handleChange}
                            disabled={loading}
                            id="onlineMeterUsed"
                          />
                          <label className="form-check-label small fw-semibold text-dark" htmlFor="onlineMeterUsed">
                            Online Meter Used
                          </label>
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
                      {isEdit ? "Update Bill" : "Create Bill"}
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

export default BillFormModal;