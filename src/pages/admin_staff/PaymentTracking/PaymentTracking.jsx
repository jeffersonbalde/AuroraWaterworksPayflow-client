// src/pages/admin_staff/PaymentTracking/PaymentTracking.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { showAlert, showToast } from "../../../services/notificationService";
import PaymentDetailsModal from "./PaymentDetailsModal";

const PaymentTracking = () => {
  const { user: currentUser, token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(true); // New state for customers loading
  const [actionLoading, setActionLoading] = useState(null);
  const [actionLock, setActionLock] = useState(false);

  // Combined loading state - show skeleton until both payments and customers are loaded
  const isLoading = loading || customersLoading;

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGateway, setFilterGateway] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("payment_date");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setCustomersLoading(true);
      try {
        await Promise.all([fetchPayments(), fetchCustomers()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortPayments();
  }, [
    payments,
    searchTerm,
    filterMethod,
    filterStatus,
    filterGateway,
    sortField,
    sortDirection,
  ]);

  const fetchPayments = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/payments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        throw new Error("Failed to fetch payments");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      showAlert.error("Error", "Failed to load payment records");
      setPayments([]);
    }
  };

  const fetchCustomers = async () => {
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
    } finally {
      setCustomersLoading(false);
    }
  };

  const refreshAllData = async () => {
    if (actionLock) {
      showToast.warning("Please wait until current action completes");
      return;
    }
    setLoading(true);
    setCustomersLoading(true);
    try {
      await Promise.all([fetchPayments(), fetchCustomers()]);
      showToast.info("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPayments = () => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm.trim()) {
      const loweredSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((payment) => {
        const customer = customers.find((c) => c.id === payment.user_id);
        const fieldsToSearch = [
          customer?.name,
          customer?.wws_id,
          payment.wws_id,
          payment.qr_number,
          payment.electronic_qr_number,
          payment.gateway_reference,
        ];
        return fieldsToSearch.some(
          (field) =>
            typeof field === "string" &&
            field.toLowerCase().includes(loweredSearch)
        );
      });
    }

    // Payment method filter
    if (filterMethod !== "all") {
      filtered = filtered.filter(
        (payment) => payment.payment_method === filterMethod
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (payment) => payment.payment_status === filterStatus
      );
    }

    // Gateway filter
    if (filterGateway !== "all") {
      filtered = filtered.filter(
        (payment) => payment.payment_gateway === filterGateway
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      if (!sortField) return 0;

      if (
        sortField === "payment_date" ||
        sortField === "processed_at" ||
        sortField === "created_at"
      ) {
        const aDate = a[sortField] ? new Date(a[sortField]) : new Date(0);
        const bDate = b[sortField] ? new Date(b[sortField]) : new Date(0);

        if (aDate < bDate) return sortDirection === "asc" ? -1 : 1;
        if (aDate > bDate) return sortDirection === "asc" ? 1 : -1;
        return 0;
      }

      const aValue = String(a[sortField] || "").toLowerCase();
      const bValue = String(b[sortField] || "").toLowerCase();

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredPayments(filtered);
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

  const handleViewDetails = (payment) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleProcessPayment = async (payment) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    const result = await showAlert.confirm(
      "Process Payment",
      `Are you sure you want to mark this payment as processed?`,
      "Yes, Process",
      "Cancel"
    );

    if (!result.isConfirmed) return;

    setActionLock(true);
    setActionLoading(payment.id);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/payments/${
          payment.id
        }/process`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        showToast.success("Payment processed successfully!");
        setPayments((prev) =>
          prev.map((p) => (p.id === payment.id ? data.payment : p))
        );
      } else {
        throw new Error(data.message || "Failed to process payment");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      showAlert.error(
        "Processing Failed",
        error.message || "Failed to process payment"
      );
    } finally {
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const getCustomerInfo = (userId) => {
    const customer = customers.find((c) => c.id === userId);
    return customer || { name: "Unknown", wws_id: "N/A" };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "failed":
        return "danger";
      case "cancelled":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    return <span className={`badge bg-${color}`}>{status}</span>;
  };

  const getMethodBadge = (method) => {
    const methods = {
      online: { class: "info", text: "Online" },
      over_the_counter: { class: "primary", text: "Over the Counter" },
    };
    const config = methods[method] || { class: "secondary", text: method };
    return <span className={`badge bg-${config.class}`}>{config.text}</span>;
  };

  const getGatewayBadge = (gateway) => {
    return (
      <span className="badge bg-light text-dark text-uppercase">{gateway}</span>
    );
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "fas fa-sort text-muted";
    return sortDirection === "asc" ? "fas fa-sort-up" : "fas fa-sort-down";
  };

  const isActionDisabled = (paymentId = null) => {
    return actionLock || (actionLoading && actionLoading !== paymentId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US");
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Calculate statistics
  const totalAmount = payments.reduce(
    (sum, payment) => sum + payment.amount_paid,
    0
  );
  const onlinePayments = payments.filter(
    (p) => p.payment_method === "online"
  ).length;
  const counterPayments = payments.filter(
    (p) => p.payment_method === "over_the_counter"
  ).length;
  const completedPayments = payments.filter(
    (p) => p.payment_status === "completed"
  ).length;

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  // Skeleton Loader
  const TableRowSkeleton = () => (
    <tr className="align-middle" style={{ height: "70px" }}>
      <td className="text-center">
        <div className="placeholder-wave">
          <span className="placeholder col-4" style={{ height: "20px" }}></span>
        </div>
      </td>
      <td className="text-center">
        <div className="d-flex justify-content-center gap-1">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="placeholder action-placeholder"
              style={{ width: "32px", height: "32px", borderRadius: "6px" }}
            ></div>
          ))}
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
        <div className="placeholder-wave">
          <span className="placeholder col-8" style={{ height: "16px" }}></span>
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
          <span className="placeholder col-8" style={{ height: "16px" }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-8" style={{ height: "16px" }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-8" style={{ height: "16px" }}></span>
        </div>
      </td>
    </tr>
  );

  const StatsCardSkeleton = () => (
    <div className="card stats-card h-100">
      <div className="card-body p-3">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <div className="placeholder-wave mb-2">
              <span
                className="placeholder col-9"
                style={{ height: "14px" }}
              ></span>
            </div>
            <div className="placeholder-wave">
              <span
                className="placeholder col-5"
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

  return (
    <div className="container-fluid px-3 py-2 payment-tracking-container fadeIn">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
        <div className="flex-grow-1 mb-2 mb-md-0">
          <h1
            className="h4 mb-1 fw-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Payment Tracking
          </h1>
          <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
            Monitor and manage payment transactions
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div
            className="badge px-3 py-2 text-white"
            style={{ backgroundColor: "#336C35" }}
          >
            <i className="fas fa-money-bill-wave me-2"></i>
            Total Payments: {isLoading ? "..." : payments.length}
          </div>
          <button
            className="btn btn-sm"
            onClick={refreshAllData}
            disabled={isLoading || isActionDisabled()}
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
            <i className="fas fa-sync-alt me-1"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          {isLoading ? (
            <StatsCardSkeleton />
          ) : (
            <div className="card stats-card h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div
                      className="text-xs fw-semibold text-uppercase mb-1"
                      style={{ color: "var(--primary-color)" }}
                    >
                      Total Collected
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--primary-color)" }}
                    >
                      ₱{totalAmount.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i
                      className="fas fa-money-bill-wave fa-2x"
                      style={{ color: "var(--primary-light)", opacity: 0.7 }}
                    ></i>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-6 col-md-3">
          {isLoading ? (
            <StatsCardSkeleton />
          ) : (
            <div className="card stats-card h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div
                      className="text-xs fw-semibold text-uppercase mb-1"
                      style={{ color: "var(--info-color)" }}
                    >
                      Online Payments
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--info-color)" }}
                    >
                      {onlinePayments}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i
                      className="fas fa-mobile-alt fa-2x"
                      style={{ color: "var(--info-light)", opacity: 0.7 }}
                    ></i>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-6 col-md-3">
          {isLoading ? (
            <StatsCardSkeleton />
          ) : (
            <div className="card stats-card h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div
                      className="text-xs fw-semibold text-uppercase mb-1"
                      style={{ color: "var(--primary-color)" }}
                    >
                      Counter Payments
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--primary-color)" }}
                    >
                      {counterPayments}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i
                      className="fas fa-store fa-2x"
                      style={{ color: "var(--primary-light)", opacity: 0.7 }}
                    ></i>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-6 col-md-3">
          {isLoading ? (
            <StatsCardSkeleton />
          ) : (
            <div className="card stats-card h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div
                      className="text-xs fw-semibold text-uppercase mb-1"
                      style={{ color: "var(--success-color)" }}
                    >
                      Completed
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--success-color)" }}
                    >
                      {completedPayments}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i
                      className="fas fa-check-circle fa-2x"
                      style={{ color: "var(--success-light)", opacity: 0.7 }}
                    ></i>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div
        className="card border-0 shadow-sm mb-3"
        style={{ backgroundColor: "var(--background-white)" }}
      >
        <div className="card-body p-3">
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Search
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
                  placeholder="Search by name, WWS ID, QR number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoading || isActionDisabled()}
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
                    disabled={isLoading || isActionDisabled()}
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
                Method
              </label>
              <select
                className="form-select form-select-sm"
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                disabled={isLoading || isActionDisabled()}
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--input-text)",
                }}
              >
                <option value="all">All Methods</option>
                <option value="online">Online</option>
                <option value="over_the_counter">Over the Counter</option>
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
                disabled={isLoading || isActionDisabled()}
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--input-text)",
                }}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="col-md-2">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Gateway
              </label>
              <select
                className="form-select form-select-sm"
                value={filterGateway}
                onChange={(e) => setFilterGateway(e.target.value)}
                disabled={isLoading || isActionDisabled()}
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--input-text)",
                }}
              >
                <option value="all">All Gateways</option>
                <option value="demo">Demo</option>
                <option value="paymongo">PayMongo</option>
                <option value="gcash">GCash</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
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
                disabled={isLoading || isActionDisabled()}
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

      {/* Main Content Card */}
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
              <i className="fas fa-money-bill-wave me-2"></i>
              Payment Records
              {!isLoading && (
                <small className="opacity-75 ms-2">
                  ({filteredPayments.length} found
                  {searchTerm ||
                  filterMethod !== "all" ||
                  filterStatus !== "all" ||
                  filterGateway !== "all"
                    ? " after filtering"
                    : ""}
                  )
                </small>
              )}
            </h5>
          </div>
        </div>

        <div className="card-body p-0">
          {isLoading ? (
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
                      style={{ width: "10%" }}
                      className="text-center small fw-semibold"
                    >
                      Actions
                    </th>
                    <th style={{ width: "20%" }} className="small fw-semibold">
                      Customer
                    </th>
                    <th style={{ width: "15%" }} className="small fw-semibold">
                      Payment Info
                    </th>
                    <th style={{ width: "10%" }} className="small fw-semibold">
                      Amount
                    </th>
                    <th style={{ width: "15%" }} className="small fw-semibold">
                      Method & Gateway
                    </th>
                    <th style={{ width: "10%" }} className="small fw-semibold">
                      Status
                    </th>
                    <th style={{ width: "15%" }} className="small fw-semibold">
                      Date
                    </th>
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
                  {loading
                    ? "Fetching payment records..."
                    : "Loading customer data..."}
                </span>
              </div>
            </div>
          ) : currentPayments.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <i
                  className="fas fa-money-bill-wave fa-3x"
                  style={{ color: "var(--text-muted)", opacity: 0.5 }}
                ></i>
              </div>
              <h5 className="mb-2" style={{ color: "var(--text-muted)" }}>
                {payments.length === 0
                  ? "No Payment Records"
                  : "No Matching Results"}
              </h5>
              <p className="mb-3 small" style={{ color: "var(--text-muted)" }}>
                {payments.length === 0
                  ? "No payment records found."
                  : "Try adjusting your search criteria."}
              </p>
              {searchTerm && (
                <button
                  className="btn btn-sm clear-search-main-btn"
                  onClick={() => setSearchTerm("")}
                  disabled={isLoading || isActionDisabled()}
                >
                  <i className="fas fa-times me-1"></i>
                  Clear Search
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
                        style={{ width: "10%" }}
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
                          disabled={isLoading || isActionDisabled()}
                          style={{ color: "var(--text-primary)" }}
                        >
                          Customer
                          <i className={`ms-1 ${getSortIcon("name")}`}></i>
                        </button>
                      </th>
                      <th
                        style={{ width: "15%" }}
                        className="small fw-semibold"
                      >
                        Payment Info
                      </th>
                      <th
                        style={{ width: "10%" }}
                        className="small fw-semibold"
                      >
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start"
                          onClick={() => handleSort("amount_paid")}
                          disabled={isActionDisabled()}
                          style={{ color: "var(--text-primary)" }}
                        >
                          Amount
                          <i
                            className={`ms-1 ${getSortIcon("amount_paid")}`}
                          ></i>
                        </button>
                      </th>
                      <th
                        style={{ width: "15%" }}
                        className="small fw-semibold"
                      >
                        Method & Gateway
                      </th>
                      <th
                        style={{ width: "10%" }}
                        className="small fw-semibold"
                      >
                        Status
                      </th>
                      <th
                        style={{ width: "15%" }}
                        className="small fw-semibold"
                      >
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start"
                          onClick={() => handleSort("payment_date")}
                          disabled={isLoading || isActionDisabled()}
                          style={{ color: "var(--text-primary)" }}
                        >
                          Date
                          <i
                            className={`ms-1 ${getSortIcon("payment_date")}`}
                          ></i>
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPayments.map((payment, index) => {
                      const customer = getCustomerInfo(payment.user_id);
                      return (
                        <tr key={payment.id} className="align-middle">
                          <td
                            className="text-center fw-bold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {startIndex + index + 1}
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-1">
                              <button
                                className="btn btn-sm text-white"
                                onClick={() => handleViewDetails(payment)}
                                disabled={isActionDisabled(payment.id)}
                                title="View Details"
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "6px",
                                  transition: "all 0.2s ease-in-out",
                                  backgroundColor: "#17a2b8", // Info color
                                  border: "none",
                                }}
                                onMouseEnter={(e) => {
                                  if (!e.target.disabled) {
                                    e.target.style.transform =
                                      "translateY(-1px)";
                                    e.target.style.boxShadow =
                                      "0 4px 8px rgba(0,0,0,0.2)";
                                    e.target.style.opacity = "0.9";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = "translateY(0)";
                                  e.target.style.boxShadow = "none";
                                  e.target.style.opacity = "1";
                                }}
                              >
                                {actionLoading === payment.id ? (
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                  ></span>
                                ) : (
                                  <i className="fas fa-eye"></i>
                                )}
                              </button>

                              {payment.payment_status === "pending" && (
                                <button
                                  className="btn btn-sm text-white"
                                  onClick={() => handleProcessPayment(payment)}
                                  disabled={isActionDisabled(payment.id)}
                                  title="Process Payment"
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "6px",
                                    transition: "all 0.2s ease-in-out",
                                    backgroundColor: "#28a745", // Success color
                                    border: "none",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!e.target.disabled) {
                                      e.target.style.transform =
                                        "translateY(-1px)";
                                      e.target.style.boxShadow =
                                        "0 4px 8px rgba(0,0,0,0.2)";
                                      e.target.style.opacity = "0.9";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "none";
                                    e.target.style.opacity = "1";
                                  }}
                                >
                                  {actionLoading === payment.id ? (
                                    <span
                                      className="spinner-border spinner-border-sm"
                                      role="status"
                                    ></span>
                                  ) : (
                                    <i className="fas fa-check"></i>
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ color: "var(--text-primary)" }}>
                              <div className="fw-medium">{customer.name}</div>
                              <div
                                className="small"
                                style={{ color: "var(--text-muted)" }}
                              >
                                WWS: {customer.wws_id || payment.wws_id}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ color: "var(--text-primary)" }}>
                              <div className="small">
                                <strong>QR:</strong> {payment.qr_number}
                              </div>
                              {payment.electronic_qr_number && (
                                <div className="small">
                                  <strong>E-QR:</strong>{" "}
                                  {payment.electronic_qr_number}
                                </div>
                              )}
                              {payment.gateway_reference && (
                                <div className="small">
                                  <strong>Ref:</strong>{" "}
                                  {payment.gateway_reference}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="fw-bold text-success">
                              ₱{payment.amount_paid.toFixed(2)}
                            </div>
                          </td>
                          <td>
                            <div>
                              {getMethodBadge(payment.payment_method)}
                              <div className="mt-1">
                                {getGatewayBadge(payment.payment_gateway)}
                              </div>
                            </div>
                          </td>
                          <td>{getStatusBadge(payment.payment_status)}</td>
                          <td>
                            <div style={{ color: "var(--text-primary)" }}>
                              <div className="small">
                                {formatDate(payment.payment_date)}
                              </div>
                              {payment.processed_at && (
                                <div className="small text-muted">
                                  Processed: {formatDate(payment.processed_at)}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
                          {Math.min(endIndex, filteredPayments.length)}
                        </span>{" "}
                        of{" "}
                        <span
                          className="fw-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {filteredPayments.length}
                        </span>{" "}
                        payments
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

      {/* Global Action Lock Overlay */}
      {actionLock && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <div className="bg-white rounded p-3 shadow-sm d-flex align-items-center">
            <div
              className="spinner-border me-2"
              style={{ color: "var(--primary-color)" }}
              role="status"
            ></div>
            <span style={{ color: "var(--text-muted)" }}>
              Processing action...
            </span>
          </div>
        </div>
      )}

      {/* Modals */}
      {showDetailsModal && selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          customer={getCustomerInfo(selectedPayment.user_id)}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPayment(null);
          }}
        />
      )}
    </div>
  );
};

export default PaymentTracking;
