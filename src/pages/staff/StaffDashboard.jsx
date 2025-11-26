import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { showAlert, showToast } from "../../services/notificationService";
import {
  FaUsers,
  FaChartBar,
  FaMoneyCheckAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaHistory,
  FaDownload,
  FaBell,
  FaChartLine,
  FaMapMarkerAlt,
  FaTasks,
  FaClipboardList,
  FaUserCheck,
  FaSyncAlt,
} from "react-icons/fa";

const API_BASE = import.meta.env.VITE_LARAVEL_API;

const safeNumber = (value) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatNumber = (value = 0) =>
  Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

const formatCurrency = (value = 0) =>
  `₱${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatRelativeTime = (value) => {
  if (!value) return "N/A";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isSameDay = (date, reference) => {
  if (!date || !reference) return false;
  return (
    date.getDate() === reference.getDate() &&
    date.getMonth() === reference.getMonth() &&
    date.getFullYear() === reference.getFullYear()
  );
};

const buildDashboardData = ({ customers, bills, payments, readings }) => {
  const now = new Date();
  const customersMap = new Map(customers.map((customer) => [customer.id, customer]));

  const activeCustomers = customers.filter((customer) => customer.status === "active").length;
  const pendingBills = bills.filter((bill) => bill.status === "pending");
  const overdueBills = pendingBills.filter((bill) => {
    const dueDate = parseDate(bill.due_date);
    return dueDate && dueDate < now;
  });

  const pendingReadings = readings.filter((reading) => reading.status === "pending").length;

  const completedPayments = payments.filter(
    (payment) => payment.payment_status === "completed"
  );
  const pendingPayments = payments.filter(
    (payment) => payment.payment_status !== "completed"
  );

  const todaysCompletedPayments = completedPayments.filter((payment) =>
    isSameDay(
      parseDate(
        payment.payment_date || payment.processed_at || payment.updated_at || payment.created_at
      ),
      now
    )
  );

  const todaysCollections = todaysCompletedPayments.reduce(
    (sum, payment) =>
      sum + safeNumber(payment.amount_paid ?? payment.amount ?? payment.total_payable),
    0
  );

  const stats = {
    assignedCustomers: activeCustomers,
    pendingReadings,
    pendingPayments: pendingPayments.length,
    totalCollections: todaysCollections,
    completedTasks: Math.max(0, readings.length - pendingReadings) + todaysCompletedPayments.length,
    monthlyTarget: Math.max(50, Math.round(activeCustomers * 0.25)),
    customerSatisfaction:
      customers.length > 0
        ? Number(
            Math.max(
              0,
              Math.min(100, ((customers.length - overdueBills.length) / customers.length) * 100)
            ).toFixed(1)
          )
        : 100,
    efficiencyRate:
      readings.length > 0
        ? Number(
            Math.max(
              0,
              Math.min(100, ((readings.length - pendingReadings) / readings.length) * 100)
            ).toFixed(1)
          )
        : 100,
  };

  const avgBillAmount =
    bills.length > 0
      ? bills.reduce((sum, bill) => sum + safeNumber(bill.total_payable), 0) / bills.length
      : 0;

  const collectionRate =
    payments.length > 0 ? (completedPayments.length / payments.length) * 100 : 0;

  const performanceMetrics = [
    {
      label: "Collection Rate",
      value: `${collectionRate.toFixed(1)}%`,
      trend: `${collectionRate >= 90 ? "+" : ""}${(collectionRate - 90).toFixed(1)}% vs target`,
      positive: collectionRate >= 90,
    },
    {
      label: "Readings Captured",
      value: `${Math.max(0, readings.length - pendingReadings)}/${Math.max(readings.length, 1)}`,
      trend: `${readings.filter((reading) => isSameDay(parseDate(reading.reading_date), now)).length
        } logged today`,
      positive: true,
    },
    {
      label: "Avg Bill Amount",
      value: formatCurrency(avgBillAmount),
      trend: `${pendingBills.length} pending bills`,
      positive: avgBillAmount <= 2500,
    },
    {
      label: "Customer Satisfaction",
      value: `${stats.customerSatisfaction}%`,
      trend: `${formatNumber(overdueBills.length)} overdue items`,
      positive: stats.customerSatisfaction >= 80,
    },
  ];

  const todaysTasks = [
    {
      task: "Follow up overdue bills",
      priority: overdueBills.length > 10 ? "high" : overdueBills.length ? "medium" : "low",
      count: overdueBills.length,
    },
    {
      task: "Process pending payments",
      priority: pendingPayments.length > 8 ? "high" : pendingPayments.length ? "medium" : "low",
      count: pendingPayments.length,
    },
    {
      task: "Validate meter readings",
      priority: pendingReadings > 5 ? "medium" : "low",
      count: pendingReadings,
    },
  ].filter((task) => task.count > 0);

  if (!todaysTasks.length) {
    todaysTasks.push({
      task: "No urgent tasks",
      priority: "low",
      count: 0,
    });
  }

  const readingsActivities = readings
    .map((reading) => {
      const parsedDate = parseDate(reading.reading_date);
      return {
        timestamp: parsedDate?.getTime() || 0,
        activity: {
          id: `reading-${reading.id}`,
          action: "Meter reading captured",
          user: reading.meter_reader || "Metering Team",
          time: formatRelativeTime(parsedDate),
          status: reading.status || "logged",
          type: "reading",
        },
      };
    })
    .filter(({ timestamp }) => timestamp);

  const paymentActivities = payments
    .map((payment) => {
      const parsedDate = parseDate(
        payment.payment_date || payment.processed_at || payment.updated_at || payment.created_at
      );
      return {
        timestamp: parsedDate?.getTime() || 0,
        activity: {
          id: `payment-${payment.id}`,
          action:
            payment.payment_status === "completed" ? "Payment processed" : "Payment pending",
          user: customersMap.get(payment.user_id)?.name || payment.payer_name || "Customer",
          time: formatRelativeTime(parsedDate),
          status: payment.payment_status,
          type: "payment",
        },
      };
    })
    .filter(({ timestamp }) => timestamp);

  const overdueActivities = overdueBills.slice(0, 4).map((bill) => {
    const parsedDate = parseDate(bill.due_date);
    return {
      timestamp: parsedDate?.getTime() || Date.now(),
      activity: {
        id: `bill-${bill.id}`,
        action: "Overdue bill detected",
        user: customersMap.get(bill.user_id)?.name || bill.wws_id || "Customer",
        time: formatRelativeTime(parsedDate),
        status: "overdue",
        type: "bill",
      },
    };
  });

  const recentActivities = [...readingsActivities, ...paymentActivities, ...overdueActivities]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6)
    .map(({ activity }) => activity);

  const serviceBreakdown = ["residential", "commercial", "institutional"].map((service) => {
    const count = customers.filter((customer) => customer.service === service).length;
    const share = customers.length ? Math.round((count / customers.length) * 100) : 0;
    return { label: service.charAt(0).toUpperCase() + service.slice(1), count, share };
  });

  return {
    stats,
    performanceMetrics,
    todaysTasks,
    recentActivities,
    serviceBreakdown,
    overdueItems: overdueBills.length,
  };
};

const HeroSkeleton = () => (
  <div className="card border-0 shadow-sm h-100">
    <div className="card-body p-3">
      <div className="placeholder-wave mb-2">
        <span className="placeholder col-6" style={{ height: "16px" }} />
      </div>
      <div className="placeholder-wave mb-2">
        <span className="placeholder col-4" style={{ height: "28px" }} />
      </div>
      <span className="placeholder rounded-circle" style={{ width: "48px", height: "48px" }} />
    </div>
  </div>
);

const ActivitySkeleton = () => (
  <div className="list-group-item d-flex align-items-center border-bottom py-3 px-3">
    <span className="placeholder rounded-circle me-3" style={{ width: "40px", height: "40px" }} />
    <div className="flex-grow-1">
      <div className="placeholder-wave mb-2">
        <span className="placeholder col-10" style={{ height: "14px" }} />
      </div>
      <span className="placeholder col-6" style={{ height: "12px" }} />
    </div>
    <span className="placeholder rounded-pill ms-3" style={{ width: "60px", height: "20px" }} />
  </div>
);

export default function StaffDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const headers = useMemo(() => ({ Authorization: token ? `Bearer ${token}` : undefined }), [
    token,
  ]);

  const fetchResource = async (endpoint, label) => {
    const response = await fetch(`${API_BASE}${endpoint}`, { headers });
    if (!response.ok) {
      let message = `Failed to fetch ${label}`;
      try {
        const body = await response.json();
        message = body.message || message;
      } catch (_) {
        message = `${message} (${response.status})`;
      }
      throw new Error(message);
    }
    return response.json();
  };

  const loadDashboard = async ({ silent = false } = {}) => {
    if (!token) return;
    try {
      silent ? setRefreshing(true) : setLoading(true);
      setError(null);
      const [customersRes, billsRes, paymentsRes, readingsRes] = await Promise.all([
        fetchResource("/admin/customers", "customers"),
        fetchResource("/admin/bills", "bills"),
        fetchResource("/admin/payments", "payments"),
        fetchResource("/admin/meter-readings", "meter readings"),
      ]);

      const payload = buildDashboardData({
        customers: customersRes.customers || [],
        bills: billsRes.bills || [],
        payments: paymentsRes.payments || [],
        readings: readingsRes.readings || [],
      });

      setDashboardData(payload);
    } catch (err) {
      console.error("Failed to load staff dashboard:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      silent ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setDashboardData(null);
      setError("You must be authenticated to view the staff dashboard.");
      return;
    }
    loadDashboard();
  }, [token]);

  const handleRefresh = () => {
    if (refreshing || loading) return;
    loadDashboard({ silent: true });
  };

  const handleExport = async () => {
    if (exporting || !token) return;
    try {
      setExporting(true);
      showAlert.processing(
        "Preparing Summary",
        "Please wait while we compile the latest staff summary..."
      );
      const response = await fetch(`${API_BASE}/admin/collection-reports/export`, {
        headers,
      });
      if (!response.ok) {
        let message = "Failed to export staff summary";
        try {
          const data = await response.json();
          if (data?.message) message = data.message;
        } catch (_) {
          // ignore
        }
        throw new Error(message);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `staff-dashboard-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast.success("Staff summary exported successfully");
    } catch (err) {
      console.error("Export summary failed:", err);
      showAlert.error("Export Failed", err.message || "Unable to export staff summary.");
    } finally {
      showAlert.close();
      setExporting(false);
    }
  };

  const quickActions = useMemo(
    () => [
      {
        label: "Meter Reading",
        icon: FaUserCheck,
        route: "/meter-reading",
        variant: "primary",
        color: "#ffffff",
        background: "linear-gradient(135deg, #2d5a27 0%, #1f7a48 100%)",
      },
      {
        label: "Payment Processing",
        icon: FaMoneyCheckAlt,
        route: "/payment-tracking",
        variant: "outline",
        color: "var(--primary-color)",
      },
      {
        label: "Billing Management",
        icon: FaClipboardList,
        route: "/billing-management",
        variant: "outline",
        color: "var(--primary-color)",
      },
    ],
    []
  );

  const handleQuickActionNavigate = (route) => {
    if (!route) return;
    navigate(route);
  };

  const getQuickActionStyle = (action) => ({
    borderRadius: "8px",
    border:
      action.variant === "primary"
        ? "none"
        : `2px solid ${action.color || "var(--primary-color)"}`,
    background:
      action.variant === "primary"
        ? action.background || action.color || "var(--primary-color)"
        : "transparent",
    color:
      action.variant === "primary"
        ? "#fff"
        : action.color || "var(--primary-color)",
    transition: "all 0.2s ease-in-out",
  });

  const handleQuickActionHover = (event, action, entering) => {
    const element = event.currentTarget;
    if (entering) {
      element.style.transform = "translateY(-1px)";
      element.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
      element.style.background =
        action.background || action.color || "var(--primary-color)";
      element.style.color = "#fff";
    } else {
      element.style.transform = "translateY(0)";
      element.style.boxShadow = "none";
      element.style.background =
        action.variant === "primary"
          ? action.background || action.color || "var(--primary-color)"
          : "transparent";
      element.style.color =
        action.variant === "primary"
          ? "#fff"
          : action.color || "var(--primary-color)";
    }
  };

  const stats = dashboardData?.stats;
  const performanceMetrics = dashboardData?.performanceMetrics || [];
  const todaysTasks = dashboardData?.todaysTasks || [];
  const activities = dashboardData?.recentActivities || [];
  const serviceBreakdown = dashboardData?.serviceBreakdown || [];
  const overdueItems = dashboardData?.overdueItems || 0;

  if (loading) {
    return (
      <div className="container-fluid px-3 px-md-4 py-3 staff-dashboard-container fadeIn">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3">
          <div className="text-start w-100">
            <h1 className="h4 mb-1 fw-bold" style={{ color: "var(--text-primary)" }}>
              Operations Overview
            </h1>
            <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
              Loading the latest data, please wait...
            </p>
          </div>
          <div className="d-flex gap-2 w-100 w-lg-auto justify-content-start justify-content-lg-end flex-wrap">
            <button 
              className="btn btn-sm d-flex align-items-center" 
              disabled
              style={{
                transition: "all 0.2s ease-in-out",
                border: "2px solid var(--primary-color)",
                color: "var(--primary-color)",
                backgroundColor: "transparent",
              }}
            >
              <span className="spinner-border spinner-border-sm me-2" />
              Refreshing
            </button>
            <button 
              className="btn btn-sm btn-success text-white d-flex align-items-center" 
              disabled
              style={{ transition: "all 0.2s ease-in-out", borderWidth: "2px" }}
            >
              <FaDownload className="me-2" />
              Export Summary
            </button>
          </div>
        </div>

        <div className="row g-3 mb-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="col-xl-3 col-md-6">
              <HeroSkeleton />
            </div>
          ))}
        </div>

        <div className="card mb-4">
          {[...Array(3)].map((_, idx) => (
            <ActivitySkeleton key={idx} />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container-fluid px-3 px-md-4 py-3 staff-dashboard-container fadeIn">
        <div className="alert alert-warning d-flex align-items-center gap-2">
          <FaExclamationTriangle />
          <span>{error || "Dashboard data is unavailable."}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-3 staff-dashboard-container fadeIn">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3">
        <div className="text-start w-100">
          <h1 className="h4 mb-1 fw-bold" style={{ color: "var(--text-primary)" }}>
            Operations Overview
          </h1>
          <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
            Monitor daily readings, billing, and collections activity assigned to your role.
          </p>
        </div>
        <div className="d-flex gap-2 w-100 w-lg-auto justify-content-start justify-content-lg-end flex-wrap">
          <button
            className="btn btn-sm d-flex align-items-center"
            onClick={handleRefresh}
            disabled={refreshing}
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
            {refreshing ? (
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
            onClick={handleExport}
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
            {exporting ? "Preparing..." : "Export Summary"}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning d-flex align-items-center gap-2">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card bg-primary text-white mb-3" style={{ borderRadius: "10px" }}>
            <div className="card-body">
              <div className="text-white-50 small">Active Customers</div>
              <div className="h4 fw-bold my-1">{formatNumber(stats.assignedCustomers)}</div>
              <div className="small d-flex align-items-center">
                <FaChartLine className="me-1" />
                {formatNumber(stats.monthlyTarget)} target
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card bg-warning text-white mb-3" style={{ borderRadius: "10px" }}>
            <div className="card-body">
              <div className="text-white-50 small">Pending Readings</div>
              <div className="h4 fw-bold my-1">{stats.pendingReadings}</div>
              <div className="small">Requires attention</div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card bg-success text-white mb-3" style={{ borderRadius: "10px" }}>
            <div className="card-body">
              <div className="text-white-50 small">Today's Collections</div>
              <div className="h4 fw-bold my-1">{formatCurrency(stats.totalCollections)}</div>
              <div className="small d-flex align-items-center">
                <FaChartLine className="me-1" />
                {todaysTasks[0]?.count || 0} receipts
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card bg-danger text-white mb-3" style={{ borderRadius: "10px" }}>
            <div className="card-body">
              <div className="text-white-50 small">Pending Payments</div>
              <div className="h4 fw-bold my-1">{stats.pendingPayments}</div>
              <div className="small">Follow up required</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-xl-8">
          <div className="row g-3">
            <div className="col-md-3 col-6">
              <div className="card border-0 bg-light h-100" style={{ borderRadius: "10px" }}>
                <div className="card-body text-center p-3">
                  <FaTasks className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">{stats.completedTasks}</div>
                  <div className="text-muted small">Tasks Completed</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card border-0 bg-light h-100" style={{ borderRadius: "10px" }}>
                <div className="card-body text-center p-3">
                  <FaChartBar className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">{stats.efficiencyRate}%</div>
                  <div className="text-muted small">Efficiency Rate</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card border-0 bg-light h-100" style={{ borderRadius: "10px" }}>
                <div className="card-body text-center p-3">
                  <FaUsers className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">{stats.customerSatisfaction}%</div>
                  <div className="text-muted small">Satisfaction Rate</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card border-0 bg-light h-100" style={{ borderRadius: "10px" }}>
                <div className="card-body text-center p-3">
                  <FaClipboardList className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">{formatNumber(overdueItems)}</div>
                  <div className="text-muted small">Overdue Items</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <div
            className={`card text-white h-100 ${overdueItems > 0 ? "bg-danger" : "bg-success"}`}
            style={{ borderRadius: "10px" }}
          >
            <div className="card-body d-flex justify-content-between align-items-center p-3">
              <div>
                <div className="small opacity-85">Performance Status</div>
                <div className="h5 mb-0">
                  {overdueItems > 0 ? "Action Required" : "Ahead of Schedule"}
                </div>
                <div className="small">
                  {overdueItems > 0 ? "Prioritize overdue follow-ups" : "Keep monitoring reports"}
                </div>
              </div>
              <FaCheckCircle size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-8">
          <div className="card mb-4" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                  <FaHistory className="me-2 text-primary" />
                  Recent Activities
                </h5>
                <span className="badge bg-primary">{activities.length} updates</span>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="list-group-item d-flex align-items-center border-bottom py-3 px-3"
                  >
                    <div className="me-3">
                      {activity.status === "pending" || activity.status === "overdue" ? (
                        <div
                          className="bg-warning rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "40px", height: "40px" }}
                        >
                          <FaClock size={16} className="text-white" />
                        </div>
                      ) : (
                        <div
                          className="bg-success rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "40px", height: "40px" }}
                        >
                          <FaCheckCircle size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark small">{activity.action}</div>
                      <div className="text-muted small">
                        <FaUsers className="me-1" />
                        {activity.user}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-muted small">{activity.time}</div>
                      <span
                        className={`badge bg-${
                          activity.type === "payment"
                            ? "success"
                            : activity.type === "reading"
                            ? "info"
                            : activity.status === "overdue"
                            ? "danger"
                            : "warning"
                        } small`}
                      >
                        {activity.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-footer bg-light border-0 py-3">
              <button className="btn btn-outline-primary btn-sm" onClick={handleRefresh}>
                <FaHistory className="me-2" />
                Refresh Timeline
              </button>
            </div>
          </div>

          <div className="card mb-4" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                <FaChartLine className="me-2 text-primary" />
                Performance Metrics
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="col-md-3 col-6">
                    <div className="text-center p-3 border rounded" style={{ borderRadius: "8px" }}>
                      <div className="h4 fw-bold text-dark mb-1">{metric.value}</div>
                      <div className="text-muted small mb-2">{metric.label}</div>
                      <span className={`badge bg-${metric.positive ? "success" : "danger"} small`}>
                        {metric.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card mb-4" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                <FaBell className="me-2 text-warning" />
                Today's Tasks
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {todaysTasks.map((task, index) => (
                  <div key={index} className="list-group-item px-0 border-0 py-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="fw-bold text-dark small">{task.task}</div>
                        <div className="text-muted small">{task.count} item(s)</div>
                      </div>
                      <span
                        className={`badge bg-${
                          task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "secondary"
                        } small`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card mb-4" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                <FaMapMarkerAlt className="me-2 text-info" />
                Service Coverage
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm table-borderless">
                  <thead>
                    <tr>
                      <th className="text-dark small">Segment</th>
                      <th className="text-dark small">Connections</th>
                      <th className="text-dark small">Status</th>
                    </tr>
                  </thead>
                  <tbody>

                    {serviceBreakdown.map((segment, index) => (
                      <tr key={index}>
                        <td className="text-muted small">{segment.label}</td>
                        <td className="fw-bold text-dark">{formatNumber(segment.count)}</td>
                        <td>
                          <span className="badge bg-info small">{segment.share}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    className="btn btn-sm text-start py-2 d-flex align-items-center"
                    style={getQuickActionStyle(action)}
                    onMouseEnter={(e) => handleQuickActionHover(e, action, true)}
                    onMouseLeave={(e) => handleQuickActionHover(e, action, false)}
                    onClick={() => handleQuickActionNavigate(action.route)}
                  >
                    <action.icon className="me-2" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-info" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-info text-white py-3">
              <h5 className="card-title mb-0 d-flex align-items-center">
                <FaChartBar className="me-2" />
                Daily Summary
              </h5>
            </div>
            <div className="card-body py-3">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="alert alert-success mb-0 py-2">
                    <strong>Tasks Completed</strong>
                    <div className="small">{stats.completedTasks} updates logged</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="alert alert-warning mb-0 py-2">
                    <strong>Pending Actions</strong>
                    <div className="small">
                      {formatNumber(stats.pendingPayments + stats.pendingReadings)} items need attention
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="alert alert-info mb-0 py-2">
                    <strong>Next Focus</strong>
                    <div className="small">
                      {overdueItems > 0 ? "Follow up overdue accounts" : "Prepare next reading batch"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}