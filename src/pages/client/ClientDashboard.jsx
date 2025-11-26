// src/pages/client/ClientDashboard.jsx - UPDATED WITH REAL DATA
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaFileInvoice,
  FaChartLine,
  FaHistory,
  FaCreditCard,
  FaCheckCircle,
  FaUserCircle,
  FaTint,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaDownload,
  FaCog,
  FaBell,
  FaWater,
  FaUsers,
  FaExclamationCircle,
  FaTimesCircle,
  FaClock,
  FaCircle,
  FaSyncAlt,
} from "react-icons/fa";

const buildFallbackData = (user = {}) => ({
  client_info: {
    name: user?.name || "Client",
    wws_id: user?.wws_id || "N/A",
    address: user?.address || "Address not available",
    service_type: user?.service ? user.service.toUpperCase() : "RESIDENTIAL",
    account_status: "Active",
  },
  stats: {
    current_balance: 0,
    monthly_consumption: "0 m³",
    avg_consumption: "0 m³",
    payment_history: "100%",
    next_reading: new Date().toLocaleDateString("en-GB"),
    last_payment: "No payments yet",
    total_bills_this_year: 0,
  },
  recent_bills: [],
  consumption_history: [],
  account_alerts: [
    {
      type: "info",
      message: "Welcome to your dashboard",
      details: "Live data is loading in the background.",
    },
  ],
});

const formatCurrency = (value = 0) =>
  `₱${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function ClientDashboard() {
  const { user, token } = useAuth();
  const fallbackData = useMemo(() => buildFallbackData(user), [user]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(
    async ({ silent = false } = {}) => {
      if (!user || !token) return;

      try {
        setError(null);
        silent ? setRefreshing(true) : setLoading(true);

        const response = await fetch(
          `${import.meta.env.VITE_LARAVEL_API}/dashboard/client-data`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch dashboard data");
        }

        setDashboardData(data.data);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setError(error.message);
        setDashboardData((prev) => prev ?? fallbackData);
      } finally {
        silent ? setRefreshing(false) : setLoading(false);
      }
    },
    [fallbackData, token, user]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const quickActions = [
    { 
      icon: FaCreditCard, 
      label: "Pay Bill", 
      variant: "primary",
      onClick: () => window.location.href = '/make-payment'
    },
    { 
      icon: FaFileInvoice, 
      label: "View Bills", 
      variant: "outline-primary",
      onClick: () => window.location.href = '/my-bills'
    },
    { 
      icon: FaChartLine, 
      label: "Usage History", 
      variant: "outline-primary",
      onClick: () => window.location.href = '/water-usage'
    },
    { 
      icon: FaUserCircle, 
      label: "View Profile", 
      variant: "outline-warning",
      onClick: () => window.location.href = '/profile'
    },
  ];

  const handleRefresh = () =>
    fetchDashboardData({ silent: Boolean(dashboardData) });

  const handleOpenSettings = () => {
    window.location.href = "/profile";
  };

  const handleExportStatement = async () => {
    try {
      setExporting(true);
      const payload = JSON.stringify(dashboardData || fallbackData, null, 2);
      const blob = new Blob([payload], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `client-statement-${new Date()
        .toISOString()
        .split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export statement:", err);
      setError("Unable to export statement right now. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // Get status badge component
  const getStatusBadge = (status, isOverdue = false) => {
    if (isOverdue) {
      return (
        <span className="badge bg-danger small">
          <FaExclamationCircle size={10} className="me-1" />
          Overdue
        </span>
      );
    }

    const statusConfig = {
      paid: { class: "success", icon: FaCheckCircle, text: "Paid" },
      pending: { class: "warning", icon: FaClock, text: "Pending" },
      overdue: { class: "danger", icon: FaExclamationCircle, text: "Overdue" },
    };

    const config = statusConfig[status] || { class: "secondary", icon: FaCheckCircle, text: status };
    
    return (
      <span className={`badge bg-${config.class} small`}>
        <config.icon size={10} className="me-1" />
        {config.text}
      </span>
    );
  };

  // Skeleton Loader Components
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

  const TableRowSkeleton = () => (
    <tr className="align-middle" style={{ height: "70px" }}>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-6" style={{ height: "16px" }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-5" style={{ height: "16px" }}></span>
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
    </tr>
  );

  const baseData = dashboardData || fallbackData;
  const client_info = baseData.client_info || fallbackData.client_info;
  const stats = baseData.stats || fallbackData.stats;
  const recent_bills = Array.isArray(baseData.recent_bills)
    ? baseData.recent_bills
    : [];
  const consumption_history = Array.isArray(baseData.consumption_history)
    ? baseData.consumption_history
    : [];
  const account_alerts = Array.isArray(baseData.account_alerts)
    ? baseData.account_alerts
    : [];
  const isSkeletonActive = loading && !dashboardData;
  const formattedLastUpdated = lastUpdated
    ? lastUpdated.toLocaleString()
    : null;

  return (
    <div className="container-fluid px-3 py-2 client-dashboard-container fadeIn">
      {error && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mb-3">
          <FaExclamationTriangle />
          <span className="small mb-0">
            {error || "Some dashboard data may be unavailable right now."}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary ms-auto"
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            Retry now
          </button>
        </div>
      )}



{/* Page Header */}
<div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-3 gap-3">
  <div className="text-start">
    <h1
      className="h4 mb-1 fw-bold"
      style={{ color: "var(--text-primary)" }}
    >
      Welcome, {client_info.name}
    </h1>
    <p
      className="mb-0 small"
      style={{ color: "var(--text-muted)" }}
    >
      Your personalized water services dashboard
    </p>
  </div>
  <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 ms-lg-auto">
    {formattedLastUpdated && (
      <small className="text-muted text-nowrap">
        Last updated {formattedLastUpdated}
      </small>
    )}
    <div className="d-flex align-items-center gap-2 flex-wrap">
      <button
        className="btn btn-sm d-flex align-items-center"
        onClick={handleRefresh}
        disabled={loading || refreshing}
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
        {refreshing || (loading && !dashboardData) ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" />
            Refreshing
          </>
        ) : (
          <>
            <FaSyncAlt className="me-2" />
            Refresh Data
          </>
        )}
      </button>
      <button
        className="btn btn-sm btn-success text-white d-flex align-items-center"
        onClick={handleExportStatement}
        disabled={exporting}
        style={{ transition: "all 0.2s ease-in-out", borderWidth: "2px" }}
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
        <FaDownload className="me-2" />
        {exporting ? "Exporting..." : "Export Statement"}
      </button>
      <button
        className="btn btn-sm d-flex align-items-center"
        onClick={handleOpenSettings}
        style={{
          transition: "all 0.2s ease-in-out",
          border: "2px solid var(--input-border)",
          color: "var(--text-primary)",
          backgroundColor: "transparent",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-1px)";
          e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
          e.target.style.backgroundColor = "var(--background-light)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "none";
          e.target.style.backgroundColor = "transparent";
        }}
      >
        <FaCog className="me-2" />
        Settings
      </button>
    </div>
  </div>
</div>

      {/* Main Stats Overview */}
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
                      style={{ color: stats.current_balance === 0 ? "var(--success-color)" : "var(--danger-color)" }}
                    >
                      Current Balance
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{
                        color:
                          stats.current_balance === 0
                            ? "var(--success-color)"
                            : "var(--danger-color)",
                      }}
                    >
                      {formatCurrency(stats.current_balance)}
                    </div>
                  </div>
                  <div className="col-auto">
                    <FaCreditCard
                      size={24}
                      style={{ color: stats.current_balance === 0 ? "var(--success-light)" : "var(--danger-light)", opacity: 0.7 }}
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
                      Monthly Consumption
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--primary-color)" }}
                    >
                      {stats.monthly_consumption}
                    </div>
                    <div className="small" style={{ color: "var(--text-muted)" }}>
                      Avg: {stats.avg_consumption}
                    </div>
                  </div>
                  <div className="col-auto">
                    <FaTint
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
                      style={{ color: "var(--info-color)" }}
                    >
                      Payment History
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--info-color)" }}
                    >
                      {stats.payment_history}
                    </div>
                  </div>
                  <div className="col-auto">
                    <FaHistory
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
                      style={{ color: "var(--warning-color)" }}
                    >
                      Next Reading
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--warning-color)" }}
                    >
                      {stats.next_reading}
                    </div>
                  </div>
                  <div className="col-auto">
                    <FaCalendarAlt
                      size={24}
                      style={{ color: "var(--warning-light)", opacity: 0.7 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Info & Quick Stats */}
      <div className="row g-3 mb-4">
        <div className="col-xl-8">
          <div className="row g-3">
            <div className="col-md-3 col-6">
              <div className="card border-0 bg-light h-100" style={{ borderRadius: "10px" }}>
                <div className="card-body text-center p-3">
                  <FaUserCircle className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">{client_info.wws_id}</div>
                  <div className="text-muted small">WWS Account ID</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card border-0 bg-light h-100" style={{ borderRadius: "10px" }}>
                <div className="card-body text-center p-3">
                  <FaFileInvoice className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">
                    {stats.total_bills_this_year}
                  </div>
                  <div className="text-muted small">Bills This Year</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card border-0 bg-light h-100" style={{ borderRadius: "10px" }}>
                <div className="card-body text-center p-3">
                  <FaChartLine className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">
                    {client_info.service_type}
                  </div>
                  <div className="text-muted small">Service Type</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card border-0 bg-light h-100" style={{ borderRadius: "10px" }}>
                <div className="card-body text-center p-3">
                  <FaCheckCircle className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">{client_info.account_status}</div>
                  <div className="text-muted small">Account Status</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card bg-primary text-white h-100" style={{ borderRadius: "10px" }}>
            <div className="card-body d-flex justify-content-between align-items-center p-3">
              <div>
                <div className="small opacity-85">Account Status</div>
                <div className="h5 mb-0">
                  {stats.current_balance === 0 ? 'In Good Standing' : 'Attention Required'}
                </div>
              </div>
              {stats.current_balance === 0 ? (
                <FaCheckCircle size={24} className="text-white" />
              ) : (
                <FaExclamationTriangle size={24} className="text-warning" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-4">
        {/* Recent Bills & Consumption */}
        <div className="col-xl-8">
          {/* Recent Bills */}
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
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0 fw-semibold">
                  <FaFileInvoice className="me-2" />
                  Recent Bills
                  {!loading && (
                    <small className="opacity-75 ms-2">
                      ({recent_bills.length} bills)
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
                        <th className="small fw-semibold">Billing Date</th>
                        <th className="small fw-semibold">Consumption</th>
                        <th className="small fw-semibold">Amount</th>
                        <th className="small fw-semibold">Due Date</th>
                        <th className="small fw-semibold">Status</th>
                        <th className="small fw-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(3)].map((_, index) => (
                        <TableRowSkeleton key={index} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : recent_bills.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <FaFileInvoice
                      size={48}
                      style={{ color: "var(--text-muted)", opacity: 0.5 }}
                    />
                  </div>
                  <h5 className="mb-2" style={{ color: "var(--text-muted)" }}>
                    No Bills Found
                  </h5>
                  <p className="mb-3 small" style={{ color: "var(--text-muted)" }}>
                    You don't have any bills yet.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead style={{ backgroundColor: "var(--background-light)" }}>
                      <tr>
                        <th className="small fw-semibold">Billing Date</th>
                        <th className="small fw-semibold">Consumption</th>
                        <th className="small fw-semibold">Amount</th>
                        <th className="small fw-semibold">Due Date</th>
                        <th className="small fw-semibold">Status</th>
                        <th className="small fw-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent_bills.map((bill) => (
                        <tr key={bill.id} className="align-middle">
                          <td style={{ color: "var(--text-primary)" }}>
                            <div className="small">{bill.date}</div>
                          </td>
                          <td style={{ color: "var(--text-primary)" }}>
                            <div className="small">{bill.consumption}</div>
                          </td>
                          <td style={{ color: "var(--text-primary)" }}>
                            <div className="fw-bold">{bill.amount}</div>
                          </td>
                          <td style={{ color: "var(--text-primary)" }}>
                            <div className="small">{bill.due_date}</div>
                          </td>
                          <td>
                            {getStatusBadge(bill.status, bill.is_overdue)}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm text-white"
                              onClick={() => window.location.href = `/my-bills`}
                              style={{
                                width: "auto",
                                height: "32px",
                                borderRadius: "6px",
                                transition: "all 0.2s ease-in-out",
                                backgroundColor: "#17a2b8",
                                border: "none",
                                padding: "0 12px",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = "translateY(-1px)";
                                e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
                                e.target.style.opacity = "0.9";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                                e.target.style.opacity = "1";
                              }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {!loading && recent_bills.length > 0 && (
              <div className="card-footer bg-white border-top px-3 py-2">
                <button
                  className="btn btn-sm"
                  onClick={() => window.location.href = '/my-bills'}
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
                  View All Bills
                </button>
              </div>
            )}
          </div>

          {/* Consumption History */}
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
                <FaChartLine className="me-2" />
                Consumption History
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="row g-3">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="col-md-3 col-6">
                      <div className="placeholder-wave">
                        <span className="placeholder col-12" style={{ height: "80px", borderRadius: "8px" }}></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : consumption_history.length === 0 ? (
                <div className="text-center py-4">
                  <div className="mb-3">
                    <FaChartLine
                      size={32}
                      style={{ color: "var(--text-muted)", opacity: 0.5 }}
                    />
                  </div>
                  <p className="small" style={{ color: "var(--text-muted)" }}>
                    No consumption data available
                  </p>
                </div>
              ) : (
                <div className="row g-3">
                  {consumption_history.slice(-4).map((item, index) => (
                    <div key={index} className="col-md-3 col-6">
                      <div
                        className="text-center p-3 border rounded"
                        style={{
                          borderRadius: "8px",
                          backgroundColor: "var(--background-light)",
                        }}
                      >
                        <div
                          className="h4 fw-bold mb-1"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.consumption}
                        </div>
                        <div
                          className="small mb-2"
                          style={{ color: "var(--text-muted)" }}
                        >
                          m³
                        </div>
                        <div
                          className="small mb-2"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {item.month}
                        </div>
                        <div
                          className="small fw-bold"
                          style={{ color: "var(--primary-color)" }}
                        >
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="col-xl-4">
          {/* Quick Actions */}
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
                <FaBell className="me-2" />
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="btn btn-sm text-start py-2 d-flex align-items-center"
                    style={{
                      borderRadius: "6px",
                      border: action.variant === "primary" ? "none" : "2px solid var(--primary-color)",
                      background: action.variant === "primary"
                        ? "var(--primary-color)"
                        : "transparent",
                      color: action.variant === "primary" ? "white" : "var(--primary-color)",
                      transition: "all 0.2s ease-in-out",
                      fontWeight: "500",
                    }}
                    onMouseEnter={(e) => {
                      if (action.variant === "primary") {
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                      } else {
                        e.target.style.backgroundColor = "var(--primary-color)";
                        e.target.style.color = "white";
                        e.target.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                      if (action.variant !== "primary") {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "var(--primary-color)";
                      }
                    }}
                    onClick={action.onClick}
                  >
                    <action.icon className="me-2" size={14} />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Account Alerts */}
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
                <FaExclamationTriangle className="me-2" />
                Account Alerts
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {account_alerts.map((alert, index) => (
                  <div key={index} className="list-group-item px-0 border-0 py-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div
                          className="fw-bold small"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {alert.message}
                        </div>
                        <div
                          className="small"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {alert.details}
                        </div>
                      </div>
                      <span className={`badge bg-${alert.type} small`}>
                        {alert.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Service Information */}
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
              <h5 className="card-title mb-0 fw-semibold">Service Information</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm table-borderless">
                  <tbody>
                    <tr>
                      <td className="small" style={{ color: "var(--text-muted)" }}>
                        Account ID:
                      </td>
                      <td className="fw-bold" style={{ color: "var(--text-primary)" }}>
                        {client_info.wws_id}
                      </td>
                    </tr>
                    <tr>
                      <td className="small" style={{ color: "var(--text-muted)" }}>
                        Service Type:
                      </td>
                      <td className="fw-bold" style={{ color: "var(--text-primary)" }}>
                        {client_info.service_type}
                      </td>
                    </tr>
                    <tr>
                      <td className="small" style={{ color: "var(--text-muted)" }}>
                        Address:
                      </td>
                      <td className="fw-bold" style={{ color: "var(--text-primary)" }}>
                        {client_info.address}
                      </td>
                    </tr>
                    <tr>
                      <td className="small" style={{ color: "var(--text-muted)" }}>
                        Last Payment:
                      </td>
                      <td className="fw-bold" style={{ color: "var(--text-primary)" }}>
                        {stats.last_payment}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}