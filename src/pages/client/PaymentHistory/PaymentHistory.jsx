// src/pages/client/PaymentHistory.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { showAlert, showToast } from "../../../services/notificationService";
import {
  FaHistory,
  FaReceipt,
  FaSyncAlt,
  FaCheckCircle,
  FaCreditCard,
  FaStore,
} from "react-icons/fa";

const PaymentHistory = () => {
  const { user, token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLock, setActionLock] = useState(false);

  // Filter states
  const [filter, setFilter] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("payment_date");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterAndSortPayments();
  }, [payments, filter, sortField, sortDirection]);

  const fetchPayments = async () => {
    if (actionLock) {
      showToast.warning("Please wait until current action completes");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/client/payments`,
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
      showAlert.error("Error", "Failed to load payment history");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPayments = () => {
    let filtered = [...payments];

    // Payment method filter
    if (filter !== "all") {
      filtered = filtered.filter(
        (payment) => payment.payment_method === filter
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      if (!sortField) return 0;

      if (sortField === "payment_date" || sortField === "created_at") {
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

  const getSortIcon = (field) => {
    if (sortField !== field) return "fas fa-sort text-muted";
    return sortDirection === "asc" ? "fas fa-sort-up" : "fas fa-sort-down";
  };

  const getPaymentMethodBadge = (method) => {
    const methods = {
      online: { class: "info", icon: FaCreditCard, text: "Online" },
      over_the_counter: {
        class: "primary",
        icon: FaStore,
        text: "Over the Counter",
      },
    };
    const config = methods[method] || {
      class: "secondary",
      icon: FaCreditCard,
      text: method,
    };
    return (
      <span className={`badge bg-${config.class} small`}>
        <config.icon size={10} className="me-1" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Time";
    }
  };

  const isActionDisabled = () => {
    return actionLock || loading;
  };

  // Calculate statistics
  const totalPayments = payments.length;
  const onlinePayments = payments.filter(
    (p) => p.payment_method === "online"
  ).length;
  const counterPayments = payments.filter(
    (p) => p.payment_method === "over_the_counter"
  ).length;
  const totalAmount = payments.reduce(
    (sum, payment) => sum + payment.amount_paid,
    0
  );

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
      <td>
        <div className="placeholder-wave mb-1">
          <span className="placeholder col-6" style={{ height: "16px" }}></span>
        </div>
        <div className="placeholder-wave">
          <span className="placeholder col-5" style={{ height: "14px" }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-7" style={{ height: "16px" }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-6" style={{ height: "16px" }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave mb-1">
          <span className="placeholder col-8" style={{ height: "16px" }}></span>
        </div>
        <div className="placeholder-wave">
          <span className="placeholder col-7" style={{ height: "14px" }}></span>
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
            className="placeholder col-5"
            style={{ height: "24px", borderRadius: "12px" }}
          ></span>
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
    <div className="container-fluid px-3 py-2 payment-history-container fadeIn">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
        <div className="flex-grow-1 mb-2 mb-md-0">
          <h1
            className="h4 mb-1 fw-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Payment History
          </h1>
          <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
            Track your payment transactions and billing history
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div
            className="badge px-3 py-2 text-white"
            style={{ backgroundColor: "#336C35" }}
          >
            <FaHistory className="me-2" />
            Total Payments: {loading ? "..." : payments.length}
          </div>
          <button
            className="btn btn-sm"
            onClick={fetchPayments}
            disabled={isActionDisabled()}
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
            <FaSyncAlt className="me-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          {loading ? (
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
                      Total Payments
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--primary-color)" }}
                    >
                      {totalPayments}
                    </div>
                  </div>
                  <div className="col-auto">
                    <FaReceipt
                      size={24}
                      style={{ color: "var(--primary-light)", opacity: 0.7 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-6 col-md-3">
          {loading ? (
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
                      Total Amount Paid
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--success-color)" }}
                    >
                      ₱{totalAmount.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-auto">
                    <FaCheckCircle
                      size={24}
                      style={{ color: "var(--success-light)", opacity: 0.7 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-6 col-md-3">
          {loading ? (
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
                    <FaCreditCard
                      size={24}
                      style={{ color: "var(--info-light)", opacity: 0.7 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-6 col-md-3">
          {loading ? (
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
                    <FaStore
                      size={24}
                      style={{ color: "var(--primary-light)", opacity: 0.7 }}
                    />
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
            <div className="col-md-4">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Payment Method
              </label>
              <select
                className="form-select form-select-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                disabled={isActionDisabled()}
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--input-text)",
                }}
              >
                <option value="all">All Payments</option>
                <option value="online">Online Payments</option>
                <option value="over_the_counter">Over the Counter</option>
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
                disabled={isActionDisabled()}
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
              <FaHistory className="me-2" />
              Transaction History
              {!loading && (
                <small className="opacity-75 ms-2">
                  ({filteredPayments.length} found
                  {filter !== "all" ? " after filtering" : ""})
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
                    <th
                      style={{ width: "5%" }}
                      className="text-center small fw-semibold"
                    >
                      #
                    </th>
                    <th style={{ width: "20%" }} className="small fw-semibold">
                      Payment Date
                    </th>
                    <th style={{ width: "15%" }} className="small fw-semibold">
                      Bill Period
                    </th>
                    <th style={{ width: "15%" }} className="small fw-semibold">
                      Amount Paid
                    </th>
                    <th style={{ width: "20%" }} className="small fw-semibold">
                      QR Number
                    </th>
                    <th style={{ width: "15%" }} className="small fw-semibold">
                      Payment Method
                    </th>
                    <th style={{ width: "10%" }} className="small fw-semibold">
                      Status
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
                  Loading payment history...
                </span>
              </div>
            </div>
          ) : currentPayments.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <FaReceipt
                  size={48}
                  style={{ color: "var(--text-muted)", opacity: 0.5 }}
                />
              </div>
              <h5 className="mb-2" style={{ color: "var(--text-muted)" }}>
                {payments.length === 0
                  ? "No Payments Found"
                  : "No Matching Results"}
              </h5>
              <p className="mb-3 small" style={{ color: "var(--text-muted)" }}>
                {payments.length === 0
                  ? "You haven't made any payments yet."
                  : `No ${filter.replace("_", " ")} payments found.`}
              </p>
              {filter !== "all" && (
                <button
                  className="btn btn-sm clear-search-main-btn"
                  onClick={() => setFilter("all")}
                  disabled={isActionDisabled()}
                >
                  <i className="fas fa-times me-1"></i>
                  Clear Filter
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
                        style={{ width: "20%" }}
                        className="small fw-semibold"
                      >
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start"
                          onClick={() => handleSort("payment_date")}
                          disabled={isActionDisabled()}
                          style={{ color: "var(--text-primary)" }}
                        >
                          Payment Date
                          <i
                            className={`ms-1 ${getSortIcon("payment_date")}`}
                          ></i>
                        </button>
                      </th>
                      <th
                        style={{ width: "15%" }}
                        className="small fw-semibold"
                      >
                        Bill Period
                      </th>
                      <th
                        style={{ width: "15%" }}
                        className="small fw-semibold"
                      >
                        Amount Paid
                      </th>
                      <th
                        style={{ width: "20%" }}
                        className="small fw-semibold"
                      >
                        QR Number
                      </th>
                      <th
                        style={{ width: "15%" }}
                        className="small fw-semibold"
                      >
                        Payment Method
                      </th>
                      <th
                        style={{ width: "10%" }}
                        className="small fw-semibold"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPayments.map((payment, index) => (
                      <tr key={payment.id} className="align-middle">
                        <td
                          className="text-center fw-bold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {startIndex + index + 1}
                        </td>
                        <td>
                          <div style={{ color: "var(--text-primary)" }}>
                            <div className="fw-medium">
                              {formatDate(payment.payment_date)}
                            </div>
                            <div
                              className="small"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {formatTime(payment.payment_date)}
                            </div>
                          </div>
                        </td>
                        <td style={{ color: "var(--text-primary)" }}>
                          <span className="fw-medium">
                            {payment.bill_period}
                          </span>
                        </td>
                        <td>
                          <div
                            className="fw-bold"
                            style={{ color: "var(--success-color)" }}
                          >
                            ₱{payment.amount_paid.toFixed(2)}
                          </div>
                        </td>
                        <td>
                          <div style={{ color: "var(--text-primary)" }}>
                            <code style={{ color: "var(--primary-color)" }}>
                              {payment.qr_number}
                            </code>
                            {payment.electronic_qr_number && (
                              <div
                                className="small"
                                style={{ color: "var(--text-muted)" }}
                              >
                                Electronic: {payment.electronic_qr_number}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{getPaymentMethodBadge(payment.payment_method)}</td>
                        <td>
                          <span className="badge bg-success small">
                            <FaCheckCircle size={10} className="me-1" />
                            Completed
                          </span>
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
    </div>
  );
};

export default PaymentHistory;