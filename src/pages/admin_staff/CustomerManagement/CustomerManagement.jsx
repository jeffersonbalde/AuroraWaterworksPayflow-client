// src/pages/admin_staff/CustomerManagement.jsx - UPDATED WITH ACTION BUTTON SKELETONS
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { showAlert, showToast } from "../../../services/notificationService";
import CustomerDetailsModal from "./CustomerDetailsModal";
import DeactivateCustomerModal from "./DeactivateCustomerModal";
import EditCustomerModal from "./EditCustomerModal";
import Swal from "sweetalert2";

const CustomerManagement = () => {
  const { user: currentUser, token, refreshPendingApprovals } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionLock, setActionLock] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterService, setFilterService] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);

  const showProcessingAlert = (
    title = "Processing Action",
    text = "Please wait while we complete this request..."
  ) => {
    showAlert.processing(title, text);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterAndSortCustomers();
  }, [
    customers,
    searchTerm,
    filterService,
    filterStatus,
    sortField,
    sortDirection,
  ]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/customers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      } else {
        throw new Error("Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      showAlert.error("Error", "Failed to load customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCustomers = () => {
    let filtered = [...customers];

    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.wws_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.contact_number?.includes(searchTerm)
      );
    }

    if (filterService !== "all") {
      filtered = filtered.filter(
        (customer) => customer.service === filterService
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (customer) => customer.status === filterStatus
      );
    }

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (
        sortField === "created_at" ||
        sortField === "connection_date" ||
        sortField === "approved_at"
      ) {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredCustomers(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (actionLock) return;
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleViewDetails = (customer) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const handleEditCustomer = (customer) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }
    setCustomerToEdit(customer);
    setShowEditModal(true);
  };

  const updateCustomer = async (customerId, customerData) => {
    setActionLock(true);
    setActionLoading(customerId);
    showProcessingAlert("Updating Customer", "Please wait while we save the changes.");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/customers/${customerId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(customerData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        showToast.success("Customer updated successfully!");
        setCustomers((prev) =>
          prev.map((c) => (c.id === customerId ? data.customer : c))
        );
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update customer");
      }
    } catch (error) {
      showAlert.close();
      console.error("Error updating customer:", error);
      showAlert.error(
        "Update Failed",
        error.message || "Failed to update customer"
      );
      return false;
    } finally {
      showAlert.close();
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const handleEditSubmit = async (formValues) => {
    if (!customerToEdit) return;
    const success = await updateCustomer(customerToEdit.id, formValues);
    if (success) {
      setShowEditModal(false);
      setCustomerToEdit(null);
    }
  };

  const handleApproveCustomer = async (customer) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    const result = await showAlert.confirm(
      "Approve Customer",
      `Are you sure you want to approve ${customer.name}? This will grant them access to the system.`,
      "Yes, Approve",
      "Cancel"
    );

    if (!result.isConfirmed) return;

    setActionLock(true);
    setActionLoading(customer.id);
    showProcessingAlert("Approving Customer", "Please wait while we approve this account.");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/users/${
          customer.id
        }/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        showToast.success("Customer approved successfully!");
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customer.id
              ? {
                  ...c,
                  status: "active",
                  approved_at: data.user.approved_at,
                  approved_by: data.user.approved_by,
                  rejected_at: null,
                  rejection_reason: null,
                }
              : c
          )
        );
        if (refreshPendingApprovals) {
          await refreshPendingApprovals();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve customer");
      }
    } catch (error) {
      showAlert.close();
      console.error("Error approving customer:", error);
      showAlert.error(
        "Approval Failed",
        error.message || "Failed to approve customer"
      );
    } finally {
      showAlert.close();
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const handleRejectCustomer = async (customer) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    try {
      const { value: rejectionReason } = await Swal.fire({
        title:
          '<div class="d-flex justify-content-between align-items-center w-100"><span class="fw-semibold"></span></div>',
        html: `
        <div class="text-start">
          <p class="mb-3">
            You are about to reject <strong>${customer.name}</strong>. Please provide a reason for rejection (minimum 10 characters).
          </p>
          <div class="mb-3">
            <label for="rejectionReason" class="form-label">
              Rejection Reason <span class="text-danger">*</span>
            </label>
            <textarea
              id="rejectionReason"
              class="form-control"
              rows="4"
              placeholder="Please provide a detailed reason for rejection..."
              style="min-height: 120px; resize: vertical;"
            ></textarea>
            <div class="form-text">
              Minimum 10 characters. This reason will be stored and may be used for communication with the user.
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <small class="text-muted" id="charCount">0/10 characters</small>
            <small class="text-muted" id="validationMessage"></small>
          </div>
        </div>
      `,
        showCancelButton: true,
        confirmButtonText: "Confirm Rejection",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        width: "500px",
        customClass: {
          popup: "custom-swal-popup",
          htmlContainer: "custom-swal-html",
          actions: "custom-swal-actions",
        },
        preConfirm: () => {
          const textarea = document.getElementById("rejectionReason");
          const reason = textarea.value.trim();

          if (!reason || reason.length < 10) {
            Swal.showValidationMessage(
              "Please provide a rejection reason with at least 10 characters"
            );
            return false;
          }
          return reason;
        },
        didOpen: () => {
          const textarea = document.getElementById("rejectionReason");
          const charCount = document.getElementById("charCount");
          const validationMessage =
            document.getElementById("validationMessage");

          textarea.addEventListener("input", function () {
            const text = this.value.trim();
            charCount.textContent = `${text.length}/10 characters`;

            if (text.length < 10 && text.length > 0) {
              validationMessage.textContent = "Minimum 10 characters required";
              validationMessage.className = "text-danger";
            } else if (text.length >= 10) {
              validationMessage.textContent = "Valid reason";
              validationMessage.className = "text-success";
            } else {
              validationMessage.textContent = "";
              validationMessage.className = "text-muted";
            }
          });

          textarea.focus();
        },
      });

      if (!rejectionReason) {
        return;
      }

      setActionLock(true);
      setActionLoading(customer.id);
      showProcessingAlert("Rejecting Customer", "Please wait while we process this rejection.");

      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/users/${customer.id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rejection_reason: rejectionReason,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        showToast.info("Account rejected successfully");
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customer.id
              ? {
                  ...c,
                  status: "rejected",
                  rejected_at: data.user.rejected_at,
                  rejected_by: data.user.rejected_by,
                  rejection_reason: data.user.rejection_reason,
                  approved_at: null,
                  approved_by: null,
                }
              : c
          )
        );
        if (refreshPendingApprovals) {
          await refreshPendingApprovals();
        }
      } else {
        const errorData = await response.json();
        if (errorData.errors) {
          const errorMessage = Object.values(errorData.errors)
            .flat()
            .join(", ");
          throw new Error(errorMessage);
        }
        throw new Error(errorData.message || "Failed to reject account");
      }
    } catch (error) {
      showAlert.close();
      console.error("Error rejecting account:", error);
      showAlert.error(
        "Rejection Failed",
        error.message || "Failed to reject account"
      );
    } finally {
      showAlert.close();
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const handleDeactivateCustomer = (customer) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }
    setSelectedCustomer(customer);
    setShowDeactivateModal(true);
  };

  const handleDeactivateConfirm = async (deactivateReason) => {
    if (!selectedCustomer) return;

    setActionLock(true);
    setActionLoading(selectedCustomer.id);
    showProcessingAlert("Deactivating Customer", "Please wait while we update the account status.");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/customers/${
          selectedCustomer.id
        }/deactivate`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            deactivate_reason: deactivateReason,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        showToast.success("Customer deactivated successfully!");
        setCustomers((prev) =>
          prev.map((c) => (c.id === selectedCustomer.id ? data.customer : c))
        );
        setShowDeactivateModal(false);
        setSelectedCustomer(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to deactivate customer");
      }
    } catch (error) {
      showAlert.close();
      console.error("Error deactivating customer:", error);
      showAlert.error(
        "Deactivation Failed",
        error.message || "Failed to deactivate customer"
      );
    } finally {
      showAlert.close();
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const handleActivateCustomer = async (customer) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    const result = await showAlert.confirm(
      "Activate Customer",
      `Are you sure you want to activate ${customer.name}'s account?`,
      "Yes, Activate",
      "Cancel"
    );

    if (!result.isConfirmed) return;

    setActionLock(true);
    setActionLoading(customer.id);
    showProcessingAlert("Activating Customer", "Please wait while we update the account status.");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/customers/${
          customer.id
        }/activate`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        showToast.success("Customer activated successfully!");
        setCustomers((prev) =>
          prev.map((c) => (c.id === customer.id ? data.customer : c))
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to activate customer");
      }
    } catch (error) {
      showAlert.close();
      console.error("Error activating customer:", error);
      showAlert.error(
        "Activation Failed",
        error.message || "Failed to activate customer"
      );
    } finally {
      showAlert.close();
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const handleMarkDelinquent = async (customer) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    const result = await showAlert.confirm(
      "Mark as Delinquent",
      `Are you sure you want to mark ${customer.name} as delinquent? This will affect their billing status.`,
      "Yes, Mark Delinquent",
      "Cancel"
    );

    if (!result.isConfirmed) return;

    setActionLock(true);
    setActionLoading(customer.id);
    showProcessingAlert("Marking Customer Delinquent", "Please wait while we update the billing status.");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/customers/${
          customer.id
        }/mark-delinquent`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        showToast.success("Customer marked as delinquent!");
        setCustomers((prev) =>
          prev.map((c) => (c.id === customer.id ? data.customer : c))
        );
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to mark customer as delinquent"
        );
      }
    } catch (error) {
      showAlert.close();
      console.error("Error marking customer as delinquent:", error);
      showAlert.error(
        "Action Failed",
        error.message || "Failed to mark customer as delinquent"
      );
    } finally {
      showAlert.close();
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const getServiceBadge = (service) => {
    const serviceStyles = {
      residential: "bg-primary text-white",
      commercial: "bg-info text-white",
      institutional: "bg-warning text-dark",
    };
    return (
      <span className={`badge ${serviceStyles[service] || "bg-secondary"}`}>
        {service ? service.charAt(0).toUpperCase() + service.slice(1) : "N/A"}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: "bg-success text-white",
      inactive: "bg-danger text-white",
      delinquent: "bg-warning text-dark",
      pending: "bg-secondary text-white",
      rejected: "bg-dark text-white",
    };
    return (
      <span className={`badge ${statusStyles[status] || "bg-secondary"}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A"}
      </span>
    );
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "fas fa-sort text-muted";
    return sortDirection === "asc" ? "fas fa-sort-up" : "fas fa-sort-down";
  };

  const isActionDisabled = (customerId = null) => {
    return actionLock || (actionLoading && actionLoading !== customerId);
  };

  const truncateText = (text, maxLength = 25) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const statistics = {
    total: customers.length,
    active: customers.filter((c) => c.status === "active").length,
    inactive: customers.filter((c) => c.status === "inactive").length,
    delinquent: customers.filter((c) => c.status === "delinquent").length,
    pending: customers.filter((c) => c.status === "pending").length,
    rejected: customers.filter((c) => c.status === "rejected").length,
    residential: customers.filter((c) => c.service === "residential").length,
    commercial: customers.filter((c) => c.service === "commercial").length,
    institutional: customers.filter((c) => c.service === "institutional")
      .length,
  };

  // UPDATED: Skeleton loader for table rows with action button skeletons
  const TableRowSkeleton = () => {
    return (
      <tr className="align-middle" style={{ height: "70px" }}>
        <td className="text-center">
          <div className="placeholder-wave">
            <span
              className="placeholder col-4"
              style={{ height: "20px" }}
            ></span>
          </div>
        </td>
        <td className="text-center">
          <div className="d-flex justify-content-center gap-1">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="placeholder action-placeholder"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "6px",
                }}
              ></div>
            ))}
          </div>
        </td>
        <td>
          <div className="d-flex align-items-center">
            <div className="flex-grow-1">
              <div className="placeholder-wave mb-1">
                <span
                  className="placeholder col-8"
                  style={{ height: "16px" }}
                ></span>
              </div>
              <div className="placeholder-wave">
                <span
                  className="placeholder col-6"
                  style={{ height: "14px" }}
                ></span>
              </div>
            </div>
          </div>
        </td>
        <td>
          <div className="placeholder-wave">
            <span
              className="placeholder col-10"
              style={{ height: "16px" }}
            ></span>
          </div>
        </td>
        <td>
          <div className="placeholder-wave">
            <span
              className="placeholder col-8"
              style={{ height: "16px" }}
            ></span>
          </div>
        </td>
        <td>
          <div className="placeholder-wave">
            <span
              className="placeholder col-8"
              style={{ height: "16px" }}
            ></span>
          </div>
        </td>
        <td>
          <div className="placeholder-wave">
            <span
              className="placeholder col-6"
              style={{ height: "24px", borderRadius: "12px" }}
            ></span>
          </div>
        </td>
        <td>
          <div className="placeholder-wave">
            <span
              className="placeholder col-6"
              style={{ height: "24px", borderRadius: "12px" }}
            ></span>
          </div>
        </td>
        <td>
          <div className="placeholder-wave">
            <span
              className="placeholder col-6"
              style={{ height: "16px" }}
            ></span>
          </div>
        </td>
      </tr>
    );
  };

  // UPDATED: Skeleton loader for stats cards
  const StatsCardSkeleton = () => {
    return (
      <div className="card stats-card h-100">
        <div className="card-body p-3">
          <div className="d-flex align-items-center">
            <div className="flex-grow-1">
              <div className="text-xs fw-semibold text-uppercase mb-1 placeholder-wave">
                <span
                  className="placeholder col-7"
                  style={{ height: "14px" }}
                ></span>
              </div>
              <div className="h4 mb-0 fw-bold placeholder-wave">
                <span
                  className="placeholder col-4"
                  style={{ height: "28px" }}
                ></span>
              </div>
            </div>
            <div className="col-auto">
              <div className="placeholder-wave">
                <span
                  className="placeholder rounded-circle"
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50% !important",
                  }}
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid px-3 py-2 customer-management-container fadeIn">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
        <div className="flex-grow-1 mb-2 mb-md-0">
          <h1
            className="h4 mb-1 fw-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Customer Management
          </h1>
          <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
            Manage water concessionaires and their accounts
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            className="btn btn-sm"
            onClick={fetchCustomers}
            disabled={loading || isActionDisabled()}
            style={{
              transition: "all 0.2s ease-in-out",
              border: "2px solid var(--primary-color)",
              color: "var(--primary-color)",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                e.target.style.backgroundColor = "var(--primary-color)";
                e.target.style.color = "white";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "var(--primary-color)";
            }}
          >
            <i className="fas fa-sync-alt me-1"></i>Refresh
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {["total", "active", "delinquent", "residential"].map((stat, index) => (
          <div key={stat} className="col-6 col-md-3">
            {loading ? (
              <StatsCardSkeleton />
            ) : (
              <div className="card stats-card h-100">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div
                        className="text-xs fw-semibold text-uppercase mb-1"
                        style={{
                          color: `var(--${
                            stat === "total"
                              ? "primary"
                              : stat === "active"
                              ? "success"
                              : stat === "delinquent"
                              ? "warning"
                              : "info"
                          }-color)`,
                        }}
                      >
                        {stat === "total"
                          ? "Total Customers"
                          : stat === "active"
                          ? "Active"
                          : stat === "delinquent"
                          ? "Delinquent"
                          : "Residential"}
                      </div>
                      <div
                        className="h4 mb-0 fw-bold"
                        style={{
                          color: `var(--${
                            stat === "total"
                              ? "primary"
                              : stat === "active"
                              ? "success"
                              : stat === "delinquent"
                              ? "warning"
                              : "info"
                          }-color)`,
                        }}
                      >
                        {statistics[stat]}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i
                        className={`fas fa-${
                          stat === "total"
                            ? "users"
                            : stat === "active"
                            ? "user-check"
                            : stat === "delinquent"
                            ? "exclamation-triangle"
                            : "home"
                        } fa-2x`}
                        style={{
                          color: `var(--${
                            stat === "total"
                              ? "primary"
                              : stat === "active"
                              ? "success"
                              : stat === "delinquent"
                              ? "warning"
                              : "info"
                          }-light)`,
                          opacity: 0.7,
                        }}
                      ></i>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className="card border-0 shadow-sm mb-3"
        style={{ backgroundColor: "var(--background-white)" }}
      >
        <div className="card-body p-3">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Search Customers
              </label>
              <div className="input-group input-group-sm">
                <span
                  className="input-group-text"
                  style={{
                    backgroundColor: "var(--background-light)",
                    borderColor: "var(--input-border)",
                    color: "var(--text-muted)",
                  }}
                >
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, email, WWS ID, address, or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading || isActionDisabled()}
                  style={{
                    backgroundColor: "var(--input-bg)",
                    borderColor: "var(--input-border)",
                    color: "var(--input-text)",
                  }}
                />
                {searchTerm && (
                  <button
                    className="btn btn-sm clear-search-btn"
                    type="button"
                    onClick={() => setSearchTerm("")}
                    disabled={loading || isActionDisabled()}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-2">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Service Type
              </label>
              <select
                className="form-select form-select-sm"
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                disabled={loading || isActionDisabled()}
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--input-text)",
                }}
              >
                <option value="all">All Services</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="institutional">Institutional</option>
              </select>
            </div>
            <div className="col-md-2">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Status
              </label>
              <select
                className="form-select form-select-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                disabled={loading || isActionDisabled()}
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--input-text)",
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="delinquent">Delinquent</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-2">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Items per page
              </label>
              <select
                className="form-select form-select-sm"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                disabled={loading || isActionDisabled()}
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--input-text)",
                }}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

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
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0 fw-semibold">
              <i className="fas fa-users me-2"></i>Customer Accounts
              {!loading && (
                <small className="opacity-75 ms-2">
                  ({filteredCustomers.length} found
                  {searchTerm ? " after filtering" : ""})
                </small>
              )}
            </h5>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
                <thead style={{ backgroundColor: "var(--background-light)" }}>
                  <tr>
                    <th className="text-center small fw-semibold">#</th>
                    <th className="text-center small fw-semibold">Actions</th>
                    <th className="small fw-semibold">Customer Information</th>
                    <th className="small fw-semibold">Contact</th>
                    <th className="small fw-semibold">Address</th>
                    <th className="small fw-semibold">WWS ID</th>
                    <th className="small fw-semibold">Service</th>
                    <th className="small fw-semibold">Status</th>
                    <th className="small fw-semibold">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, index) => (
                    <TableRowSkeleton key={index} />
                  ))}
                </tbody>
              </table>
              <div className="text-center py-4">
                <div
                  className="spinner-border me-2"
                  style={{ color: "var(--primary-color)" }}
                  role="status"
                ></div>
                <span className="small" style={{ color: "var(--text-muted)" }}>
                  Fetching customer data...
                </span>
              </div>
            </div>
          ) : currentCustomers.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <i
                  className="fas fa-users fa-3x"
                  style={{ color: "var(--text-muted)", opacity: 0.5 }}
                ></i>
              </div>
              <h5 className="mb-2" style={{ color: "var(--text-muted)" }}>
                {customers.length === 0
                  ? "No Customers Found"
                  : "No Matching Results"}
              </h5>
              <p className="mb-3 small" style={{ color: "var(--text-muted)" }}>
                {customers.length === 0
                  ? "No customers have registered in the system yet."
                  : "Try adjusting your search criteria."}
              </p>
              {searchTerm && (
                <button
                  className="btn btn-sm clear-search-main-btn"
                  onClick={() => setSearchTerm("")}
                  disabled={loading || isActionDisabled()}
                >
                  <i className="fas fa-times me-1"></i>Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0">
                  <thead style={{ backgroundColor: "var(--background-light)" }}>
                    <tr>
                      <th
                        style={{ width: "5%" }}
                        className="text-center small fw-semibold"
                      >
                        #
                      </th>
                      <th
                        style={{ width: "15%" }}
                        className="text-center small fw-semibold"
                      >
                        Actions
                      </th>
                      <th
                        style={{ width: "20%" }}
                        className="small fw-semibold"
                      >
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start"
                          onClick={() => handleSort("name")}
                          disabled={isActionDisabled()}
                          style={{ color: "var(--text-primary)" }}
                        >
                          Customer Information
                          <i className={`ms-1 ${getSortIcon("name")}`}></i>
                        </button>
                      </th>
                      <th
                        style={{ width: "12%" }}
                        className="small fw-semibold"
                      >
                        Contact
                      </th>
                      <th
                        style={{ width: "18%" }}
                        className="small fw-semibold"
                      >
                        Address
                      </th>
                      <th
                        style={{ width: "10%" }}
                        className="small fw-semibold"
                      >
                        WWS ID
                      </th>
                      <th
                        style={{ width: "10%" }}
                        className="small fw-semibold"
                      >
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start"
                          onClick={() => handleSort("service")}
                          disabled={isActionDisabled()}
                          style={{ color: "var(--text-primary)" }}
                        >
                          Service
                          <i className={`ms-1 ${getSortIcon("service")}`}></i>
                        </button>
                      </th>
                      <th
                        style={{ width: "10%" }}
                        className="small fw-semibold"
                      >
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start"
                          onClick={() => handleSort("status")}
                          disabled={isActionDisabled()}
                          style={{ color: "var(--text-primary)" }}
                        >
                          Status
                          <i className={`ms-1 ${getSortIcon("status")}`}></i>
                        </button>
                      </th>
                      <th
                        style={{ width: "10%" }}
                        className="small fw-semibold"
                      >
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start"
                          onClick={() => handleSort("created_at")}
                          disabled={isActionDisabled()}
                          style={{ color: "var(--text-primary)" }}
                        >
                          Registered
                          <i
                            className={`ms-1 ${getSortIcon("created_at")}`}
                          ></i>
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCustomers.map((customer, index) => (
                      <tr key={customer.id} className="align-middle">
                        <td
                          className="text-center fw-bold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {startIndex + index + 1}
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-1">
                            {/* View Details Button */}
                            <button
                              className="btn btn-info btn-sm text-white"
                              onClick={() => handleViewDetails(customer)}
                              disabled={isActionDisabled(customer.id)}
                              title="View Details"
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "6px",
                                transition: "all 0.2s ease-in-out",
                              }}
                              onMouseEnter={(e) => {
                                if (!e.target.disabled) {
                                  e.target.style.transform = "translateY(-1px)";
                                  e.target.style.boxShadow =
                                    "0 4px 8px rgba(0,0,0,0.2)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                              }}
                            >
                              {actionLoading === customer.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                ></span>
                              ) : (
                                <i className="fas fa-eye"></i>
                              )}
                            </button>

                            {/* Edit Button */}
                            <button
                              className="btn btn-warning btn-sm text-white"
                              onClick={() => handleEditCustomer(customer)}
                              disabled={isActionDisabled(customer.id)}
                              title="Edit Customer"
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "6px",
                                transition: "all 0.2s ease-in-out",
                              }}
                              onMouseEnter={(e) => {
                                if (!e.target.disabled) {
                                  e.target.style.transform = "translateY(-1px)";
                                  e.target.style.boxShadow =
                                    "0 4px 8px rgba(0,0,0,0.2)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                              }}
                            >
                              {actionLoading === customer.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                ></span>
                              ) : (
                                <i className="fas fa-edit"></i>
                              )}
                            </button>

                            {/* Approve/Reject for Pending/Rejected Status */}
                            {(customer.status === "pending" ||
                              customer.status === "rejected") && (
                              <>
                                <button
                                  className="btn btn-success btn-sm text-white"
                                  onClick={() =>
                                    handleApproveCustomer(customer)
                                  }
                                  disabled={isActionDisabled(customer.id)}
                                  title="Approve Customer"
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "6px",
                                    transition: "all 0.2s ease-in-out",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!e.target.disabled) {
                                      e.target.style.transform =
                                        "translateY(-1px)";
                                      e.target.style.boxShadow =
                                        "0 4px 8px rgba(0,0,0,0.2)";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "none";
                                  }}
                                >
                                  {actionLoading === customer.id ? (
                                    <span
                                      className="spinner-border spinner-border-sm"
                                      role="status"
                                    ></span>
                                  ) : (
                                    <i className="fas fa-check"></i>
                                  )}
                                </button>

                                {customer.status === "pending" && (
                                  <button
                                    className="btn btn-danger btn-sm text-white"
                                    onClick={() =>
                                      handleRejectCustomer(customer)
                                    }
                                    disabled={isActionDisabled(customer.id)}
                                    title="Reject Customer"
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      borderRadius: "6px",
                                      transition: "all 0.2s ease-in-out",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!e.target.disabled) {
                                        e.target.style.transform =
                                          "translateY(-1px)";
                                        e.target.style.boxShadow =
                                          "0 4px 8px rgba(0,0,0,0.2)";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.transform =
                                        "translateY(0)";
                                      e.target.style.boxShadow = "none";
                                    }}
                                  >
                                    {actionLoading === customer.id ? (
                                      <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                      ></span>
                                    ) : (
                                      <i className="fas fa-times"></i>
                                    )}
                                  </button>
                                )}
                              </>
                            )}

                            {/* Active Status Actions */}
                            {customer.status === "active" && (
                              <>
                                <button
                                  className="btn btn-warning btn-sm text-white"
                                  onClick={() => handleMarkDelinquent(customer)}
                                  disabled={isActionDisabled(customer.id)}
                                  title="Mark as Delinquent"
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "6px",
                                    transition: "all 0.2s ease-in-out",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!e.target.disabled) {
                                      e.target.style.transform =
                                        "translateY(-1px)";
                                      e.target.style.boxShadow =
                                        "0 4px 8px rgba(0,0,0,0.2)";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "none";
                                  }}
                                >
                                  {actionLoading === customer.id ? (
                                    <span
                                      className="spinner-border spinner-border-sm"
                                      role="status"
                                    ></span>
                                  ) : (
                                    <i className="fas fa-exclamation-triangle"></i>
                                  )}
                                </button>
                                <button
                                  className="btn btn-danger btn-sm text-white"
                                  onClick={() =>
                                    handleDeactivateCustomer(customer)
                                  }
                                  disabled={isActionDisabled(customer.id)}
                                  title="Deactivate Customer"
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "6px",
                                    transition: "all 0.2s ease-in-out",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!e.target.disabled) {
                                      e.target.style.transform =
                                        "translateY(-1px)";
                                      e.target.style.boxShadow =
                                        "0 4px 8px rgba(0,0,0,0.2)";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "none";
                                  }}
                                >
                                  {actionLoading === customer.id ? (
                                    <span
                                      className="spinner-border spinner-border-sm"
                                      role="status"
                                    ></span>
                                  ) : (
                                    <i className="fas fa-user-slash"></i>
                                  )}
                                </button>
                              </>
                            )}

                            {/* Inactive/Delinquent Status Actions */}
                            {(customer.status === "inactive" ||
                              customer.status === "delinquent") && (
                              <button
                                className="btn btn-success btn-sm text-white"
                                onClick={() => handleActivateCustomer(customer)}
                                disabled={isActionDisabled(customer.id)}
                                title="Activate Customer"
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "6px",
                                  transition: "all 0.2s ease-in-out",
                                }}
                                onMouseEnter={(e) => {
                                  if (!e.target.disabled) {
                                    e.target.style.transform =
                                      "translateY(-1px)";
                                    e.target.style.boxShadow =
                                      "0 4px 8px rgba(0,0,0,0.2)";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = "translateY(0)";
                                  e.target.style.boxShadow = "none";
                                }}
                              >
                                {actionLoading === customer.id ? (
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                  ></span>
                                ) : (
                                  <i className="fas fa-user-check"></i>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <div
                              className="fw-medium mb-1"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {customer.name}
                            </div>
                            <div
                              className="small text-break"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {customer.email}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ color: "var(--text-primary)" }}>
                            {customer.contact_number || "Not provided"}
                          </div>
                        </td>
                        <td>
                          <div
                            style={{ color: "var(--text-primary)" }}
                            className="small text-truncate"
                            title={customer.address || "Not provided"}
                          >
                            {truncateText(customer.address)}
                          </div>
                        </td>
                        <td>
                          <code
                            className="font-monospace small px-2 py-1 rounded"
                            style={{
                              backgroundColor: "var(--background-light)",
                              color: "var(--text-primary)",
                            }}
                          >
                            {customer.wws_id || "N/A"}
                          </code>
                        </td>
                        <td>{getServiceBadge(customer.service)}</td>
                        <td>{getStatusBadge(customer.status)}</td>
                        <td>
                          <small style={{ color: "var(--text-muted)" }}>
                            {formatDate(customer.created_at)}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="card-footer bg-white border-top px-3 py-2">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                    <div className="text-center text-md-start">
                      <small style={{ color: "var(--text-muted)" }}>
                        Showing{" "}
                        <span
                          className="fw-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {startIndex + 1}-
                          {Math.min(endIndex, filteredCustomers.length)}
                        </span>{" "}
                        of{" "}
                        <span
                          className="fw-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {filteredCustomers.length}
                        </span>{" "}
                        customers
                      </small>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1 || isActionDisabled()}
                        style={{
                          transition: "all 0.2s ease-in-out",
                          border: "2px solid var(--primary-color)",
                          color: "var(--primary-color)",
                          backgroundColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!e.target.disabled) {
                            e.target.style.transform = "translateY(-1px)";
                            e.target.style.boxShadow =
                              "0 2px 4px rgba(0,0,0,0.1)";
                            e.target.style.backgroundColor =
                              "var(--primary-color)";
                            e.target.style.color = "white";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "none";
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = "var(--primary-color)";
                        }}
                      >
                        <i className="fas fa-chevron-left me-1"></i>
                        Previous
                      </button>

                      <div className="d-none d-md-flex gap-1">
                        {(() => {
                          let pages = [];
                          const maxVisiblePages = 5;

                          if (totalPages <= maxVisiblePages) {
                            pages = Array.from(
                              { length: totalPages },
                              (_, i) => i + 1
                            );
                          } else {
                            pages.push(1);
                            let start = Math.max(2, currentPage - 1);
                            let end = Math.min(totalPages - 1, currentPage + 1);

                            if (currentPage <= 2) {
                              end = 4;
                            } else if (currentPage >= totalPages - 1) {
                              start = totalPages - 3;
                            }

                            if (start > 2) {
                              pages.push("...");
                            }

                            for (let i = start; i <= end; i++) {
                              pages.push(i);
                            }

                            if (end < totalPages - 1) {
                              pages.push("...");
                            }

                            if (totalPages > 1) {
                              pages.push(totalPages);
                            }
                          }

                          return pages.map((page, index) => (
                            <button
                              key={index}
                              className="btn btn-sm"
                              onClick={() =>
                                page !== "..." && setCurrentPage(page)
                              }
                              disabled={page === "..." || isActionDisabled()}
                              style={{
                                transition: "all 0.2s ease-in-out",
                                border: `2px solid ${
                                  currentPage === page
                                    ? "var(--primary-color)"
                                    : "var(--input-border)"
                                }`,
                                color:
                                  currentPage === page
                                    ? "white"
                                    : "var(--text-primary)",
                                backgroundColor:
                                  currentPage === page
                                    ? "var(--primary-color)"
                                    : "transparent",
                                minWidth: "40px",
                              }}
                              onMouseEnter={(e) => {
                                if (
                                  !e.target.disabled &&
                                  currentPage !== page
                                ) {
                                  e.target.style.transform = "translateY(-1px)";
                                  e.target.style.boxShadow =
                                    "0 2px 4px rgba(0,0,0,0.1)";
                                  e.target.style.backgroundColor =
                                    "var(--primary-light)";
                                  e.target.style.color = "var(--text-primary)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (
                                  !e.target.disabled &&
                                  currentPage !== page
                                ) {
                                  e.target.style.transform = "translateY(0)";
                                  e.target.style.boxShadow = "none";
                                  e.target.style.backgroundColor =
                                    "transparent";
                                  e.target.style.color = "var(--text-primary)";
                                }
                              }}
                            >
                              {page}
                            </button>
                          ));
                        })()}
                      </div>

                      <div className="d-md-none">
                        <small style={{ color: "var(--text-muted)" }}>
                          Page {currentPage} of {totalPages}
                        </small>
                      </div>

                      <button
                        className="btn btn-sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={
                          currentPage === totalPages || isActionDisabled()
                        }
                        style={{
                          transition: "all 0.2s ease-in-out",
                          border: "2px solid var(--primary-color)",
                          color: "var(--primary-color)",
                          backgroundColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!e.target.disabled) {
                            e.target.style.transform = "translateY(-1px)";
                            e.target.style.boxShadow =
                              "0 2px 4px rgba(0,0,0,0.1)";
                            e.target.style.backgroundColor =
                              "var(--primary-color)";
                            e.target.style.color = "white";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "none";
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = "var(--primary-color)";
                        }}
                      >
                        Next
                        <i className="fas fa-chevron-right ms-1"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showDetailsModal && selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}
      {showEditModal && customerToEdit && (
        <EditCustomerModal
          customer={customerToEdit}
          loading={actionLoading === customerToEdit.id}
          onSave={handleEditSubmit}
          onClose={() => {
            if (actionLock) return;
            setShowEditModal(false);
            setCustomerToEdit(null);
          }}
        />
      )}
      {showDeactivateModal && selectedCustomer && (
        <DeactivateCustomerModal
          customer={selectedCustomer}
          onClose={() => {
            setShowDeactivateModal(false);
            setSelectedCustomer(null);
          }}
          onDeactivate={handleDeactivateConfirm}
          loading={actionLoading === selectedCustomer.id}
        />
      )}
    </div>
  );
};

export default CustomerManagement;
