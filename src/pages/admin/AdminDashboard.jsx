// src/pages/admin/AdminDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaFileInvoice,
  FaChartBar,
  FaMoneyCheckAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaWater,
  FaUserCheck,
  FaHistory,
  FaDownload,
  FaCog,
  FaBell,
  FaChartLine,
  FaDatabase,
  FaSyncAlt,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { showAlert, showToast } from "../../services/notificationService";

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
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60)
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

const getActivityBadge = (type, status) => {
  if (type === "payment") {
    if (status === "completed") return "success";
    if (status === "pending") return "warning";
    return "danger";
  }
  if (type === "registration") {
    return status === "pending" ? "warning" : "info";
  }
  if (type === "meter") {
    return "info";
  }
  return "secondary";
};

const StatsCardSkeleton = () => (
  <div className="card stats-card h-100">
    <div className="card-body p-3">
      <div className="d-flex align-items-center">
        <div className="flex-grow-1">
          <div className="placeholder-wave mb-2">
            <span className="placeholder col-8" style={{ height: "14px" }} />
          </div>
          <div className="placeholder-wave">
            <span className="placeholder col-6" style={{ height: "28px" }} />
          </div>
        </div>
        <div className="col-auto">
          <div className="placeholder-wave">
            <span
              className="placeholder rounded-circle"
              style={{ width: "48px", height: "48px" }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ActivitySkeleton = () => (
  <div className="list-group-item d-flex align-items-center border-bottom py-3 px-3">
    <div className="me-3">
      <div
        className="placeholder rounded-circle"
        style={{ width: "40px", height: "40px" }}
      />
    </div>
    <div className="flex-grow-1">
      <div className="placeholder-wave mb-2">
        <span className="placeholder col-10" style={{ height: "14px" }} />
      </div>
      <div className="placeholder-wave">
        <span className="placeholder col-6" style={{ height: "12px" }} />
      </div>
    </div>
    <div className="text-end">
      <div className="placeholder-wave mb-2">
        <span className="placeholder col-6" style={{ height: "12px" }} />
      </div>
      <div
        className="placeholder rounded-pill"
        style={{ width: "60px", height: "20px" }}
      />
    </div>
  </div>
);

const QuickActionSkeleton = () => (
  <div className="placeholder-wave mb-2">
    <span
      className="placeholder col-12"
      style={{ height: "40px", borderRadius: "8px" }}
    />
  </div>
);

const buildDashboardData = ({ customers, users, payments, bills }) => {
  const now = new Date();
  const currentMonthRef = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const parseDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const isSameMonthYear = (date, reference) =>
    date &&
    date.getMonth() === reference.getMonth() &&
    date.getFullYear() === reference.getFullYear();

  const customersMap = new Map(
    customers.map((customer) => [customer.id, customer])
  );

  const totalCustomers = customers.length;
  const activeConnections = customers.filter(
    (customer) => customer.status === "active"
  ).length;
  const delinquentAccounts = customers.filter(
    (customer) => customer.status === "delinquent"
  ).length;

  const staffMembers = users.filter((user) => user.role === "staff").length;
  const pendingApprovals = users.filter(
    (user) => user.status === "pending"
  ).length;

  const paymentsWithDates = payments.map((payment) => ({
    ...payment,
    parsedDate: parseDate(
      payment.payment_date || payment.processed_at || payment.created_at
    ),
  }));

  const billsWithDates = bills.map((bill) => ({
    ...bill,
    parsedReadingDate: parseDate(bill.reading_date),
    parsedDueDate: parseDate(bill.due_date),
  }));

  const paymentsThisMonth = paymentsWithDates.filter((payment) =>
    isSameMonthYear(payment.parsedDate, currentMonthRef)
  );

  const paymentsLastMonth = paymentsWithDates.filter((payment) =>
    isSameMonthYear(payment.parsedDate, previousMonthRef)
  );

  const completedPaymentsThisMonth = paymentsThisMonth.filter(
    (payment) => payment.payment_status === "completed"
  );

  const monthlyRevenue = completedPaymentsThisMonth.reduce(
    (sum, payment) => sum + safeNumber(payment.amount_paid),
    0
  );

  const monthlyBills = billsWithDates.filter((bill) =>
    isSameMonthYear(bill.parsedReadingDate, currentMonthRef)
  );

  const previousMonthBills = billsWithDates.filter((bill) =>
    isSameMonthYear(bill.parsedReadingDate, previousMonthRef)
  );

  const monthlyConsumption = monthlyBills.reduce(
    (sum, bill) => sum + safeNumber(bill.consumption),
    0
  );

  const previousMonthConsumption = previousMonthBills.reduce(
    (sum, bill) => sum + safeNumber(bill.consumption),
    0
  );

  const avgConsumptionValue = activeConnections
    ? monthlyConsumption / activeConnections
    : 0;
  const previousAvgConsumption = activeConnections
    ? previousMonthConsumption / activeConnections
    : 0;

  const pendingBillsCount = billsWithDates.filter(
    (bill) => bill.status === "pending"
  ).length;

  const overdueBillsCount = billsWithDates.filter((bill) => {
    if (bill.status === "overdue") return true;
    if (bill.status === "paid") return false;
    if (!bill.parsedDueDate) return false;
    return bill.parsedDueDate < now;
  }).length;

  const pendingPayments = paymentsWithDates.filter(
    (payment) => payment.payment_status === "pending"
  ).length;

  const restatedBills = billsWithDates.filter(
    (bill) => bill.restated_amount !== null
  ).length;

  const completedPaymentsTotal = paymentsWithDates.filter(
    (payment) => payment.payment_status === "completed"
  ).length;

  const systemUptimeValue = paymentsWithDates.length
    ? (completedPaymentsTotal / paymentsWithDates.length) * 100
    : 100;

  const collectionRate = paymentsThisMonth.length
    ? (completedPaymentsThisMonth.length / paymentsThisMonth.length) * 100
    : 0;

  const collectionRatePrev = paymentsLastMonth.length
    ? (paymentsLastMonth.filter(
        (payment) => payment.payment_status === "completed"
      ).length /
        paymentsLastMonth.length) *
      100
    : 0;

  const collectionTrend = collectionRate - collectionRatePrev;
  const consumptionTrend = monthlyConsumption - previousMonthConsumption;

  const efficiency = totalCustomers
    ? (activeConnections / totalCustomers) * 100
    : 0;

  const highUsageAccounts = monthlyBills.filter((bill) => {
    const consumption = safeNumber(bill.consumption);
    return avgConsumptionValue > 0 && consumption > avgConsumptionValue * 1.5;
  }).length;

  const quickStats = [
    {
      label: "Collection Rate",
      value: `${collectionRate.toFixed(1)}%`,
      trend: `${collectionTrend >= 0 ? "+" : ""}${collectionTrend.toFixed(
        1
      )}% vs last month`,
      positive: collectionTrend >= 0,
    },
    {
      label: "Billing Volume",
      value: `${formatNumber(Math.round(monthlyConsumption))} m³`,
      trend: `${consumptionTrend >= 0 ? "+" : ""}${Math.round(
        consumptionTrend
      )} m³ vs last month`,
      positive: consumptionTrend >= 0,
    },
    {
      label: "Avg Consumption",
      value: `${avgConsumptionValue.toFixed(1)} m³`,
      trend: `${avgConsumptionValue - previousAvgConsumption >= 0 ? "+" : ""}${(
        avgConsumptionValue - previousAvgConsumption
      ).toFixed(1)} m³ change`,
      positive: avgConsumptionValue - previousAvgConsumption >= 0,
    },
    {
      label: "Operational Efficiency",
      value: `${efficiency.toFixed(1)}%`,
      trend: `${efficiency - 95 >= 0 ? "+" : ""}${(efficiency - 95).toFixed(
        1
      )}% vs target`,
      positive: efficiency >= 95,
    },
  ];

  const toActivity = ({ id, action, user, date, status, type }) => {
    const timestamp = parseDate(date)?.getTime() ?? 0;
    return {
      id,
      action,
      user,
      status,
      type,
      time: formatRelativeTime(date),
      badgeVariant: getActivityBadge(type, status),
      timestamp,
    };
  };

  const paymentActivities = paymentsWithDates
    .filter((payment) => payment.parsedDate)
    .sort(
      (a, b) => (b.parsedDate?.getTime() || 0) - (a.parsedDate?.getTime() || 0)
    )
    .slice(0, 4)
    .map((payment) =>
      toActivity({
        id: `payment-${payment.id}`,
        action:
          payment.payment_status === "completed"
            ? "Payment completed"
            : "Payment updated",
        user: customersMap.get(payment.user_id)?.name || "Unknown customer",
        date: payment.parsedDate,
        status: payment.payment_status,
        type: "payment",
      })
    );

  const registrationActivities = users
    .sort(
      (a, b) =>
        (parseDate(b.created_at)?.getTime() || 0) -
        (parseDate(a.created_at)?.getTime() || 0)
    )
    .slice(0, 3)
    .map((user) =>
      toActivity({
        id: `user-${user.id}`,
        action:
          user.status === "pending"
            ? "New registration pending"
            : "User status updated",
        user: user.name,
        date: user.created_at,
        status: user.status,
        type: "registration",
      })
    );

  const billingActivities = billsWithDates
    .filter((bill) => bill.parsedReadingDate)
    .sort((a, b) => (b.parsedReadingDate || 0) - (a.parsedReadingDate || 0))
    .slice(0, 3)
    .map((bill) =>
      toActivity({
        id: `bill-${bill.id}`,
        action: "Meter reading recorded",
        user: customersMap.get(bill.user_id)?.name || "Unknown customer",
        date: bill.parsedReadingDate,
        status: bill.status,
        type: "meter",
      })
    );

  const recentActivities = [
    ...paymentActivities,
    ...registrationActivities,
    ...billingActivities,
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6)
    .map(({ timestamp, ...activity }) => activity);

  const priorityTasks = [
    {
      task: "Approve pending registrations",
      priority: pendingApprovals > 0 ? "high" : "low",
      count: pendingApprovals,
    },
    {
      task: "Review delinquent accounts",
      priority: delinquentAccounts > 0 ? "high" : "low",
      count: delinquentAccounts,
    },
    {
      task: "Resolve overdue bills",
      priority: overdueBillsCount > 0 ? "medium" : "low",
      count: overdueBillsCount,
    },
    {
      task: "Process pending payments",
      priority: pendingPayments > 0 ? "medium" : "low",
      count: pendingPayments,
    },
    {
      task: "Review bill restatements",
      priority: restatedBills > 0 ? "low" : "low",
      count: restatedBills,
    },
  ];

  const waterQualityMetrics = [
    {
      parameter: "Average Consumption",
      value: `${avgConsumptionValue.toFixed(1)} m³`,
      status: avgConsumptionValue > 0 ? "optimal" : "monitor",
      range: "per active account",
    },
    {
      parameter: "Peak Consumption",
      value: `${
        monthlyBills.length
          ? Math.max(
              ...monthlyBills.map((bill) => safeNumber(bill.consumption))
            ).toFixed(1)
          : 0
      } m³`,
      status: "good",
      range: "highest this month",
    },
    {
      parameter: "High Usage Accounts",
      value: `${highUsageAccounts}`,
      status: highUsageAccounts > 0 ? "warning" : "optimal",
      range: ">150% of average",
    },
    {
      parameter: "Pending Bills",
      value: `${pendingBillsCount}`,
      status: pendingBillsCount > 0 ? "warning" : "optimal",
      range: "Requires follow-up",
    },
  ];

  const systemAlerts = [];

  if (pendingApprovals > 0) {
    systemAlerts.push({
      type: "warning",
      title: "Pending Approvals",
      message: `${pendingApprovals} account(s) awaiting review.`,
    });
  }

  if (delinquentAccounts > 0) {
    systemAlerts.push({
      type: "danger",
      title: "Delinquent Accounts",
      message: `${delinquentAccounts} customer(s) overdue.`,
    });
  }

  if (overdueBillsCount > 0) {
    systemAlerts.push({
      type: "warning",
      title: "Overdue Bills",
      message: `${overdueBillsCount} bill(s) past due.`,
    });
  }

  if (pendingPayments > 0) {
    systemAlerts.push({
      type: "info",
      title: "Payments Pending",
      message: `${pendingPayments} payment(s) awaiting processing.`,
    });
  }

  if (!systemAlerts.length) {
    systemAlerts.push({
      type: "success",
      title: "All Systems Operational",
      message: "No outstanding alerts at this time.",
    });
  }

  let systemStatusTone = "success";
  let systemStatusMessage = "All systems are running normally.";

  if (systemAlerts.some((alert) => alert.type === "danger")) {
    systemStatusTone = "danger";
    systemStatusMessage =
      "Critical alerts detected. Immediate action required.";
  } else if (systemAlerts.some((alert) => alert.type === "warning")) {
    systemStatusTone = "warning";
    systemStatusMessage = "Active warnings require attention.";
  } else if (systemAlerts.some((alert) => alert.type === "info")) {
    systemStatusTone = "info";
    systemStatusMessage = "Monitoring informational alerts.";
  }

  return {
    stats: {
      totalCustomers,
      pendingApprovals,
      totalRevenue: monthlyRevenue,
      delinquentAccounts,
      activeConnections,
      monthlyConsumption,
      staffMembers,
      systemUptime: Number(systemUptimeValue.toFixed(1)),
      pendingBills: pendingBillsCount,
    },
    quickStats,
    recentActivities,
    priorityTasks,
    waterQualityMetrics,
    systemAlerts,
    systemStatus: {
      tone: systemStatusTone,
      message: systemStatusMessage,
    },
  };
};

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    }),
    [token]
  );

  const quickActions = useMemo(
    () => [
      {
        label: "Customer Management",
        icon: FaUsers,
        route: "/customer-management",
        variant: "primary",
        color: "#ffffff",
        background: "linear-gradient(135deg, #2d5a27 0%, #1f7a48 100%)",
      },
      {
        label: "Billing & Invoices",
        icon: FaFileInvoice,
        route: "/billing-management",
        variant: "outline",
        color: "var(--primary-color)",
      },
      {
        label: "Analytics & Reports",
        icon: FaChartBar,
        route: "/collection-reports",
        variant: "outline",
        color: "var(--primary-color)",
      },
      {
        label: "Staff Management",
        icon: FaUserCheck,
        route: "/staff-management",
        variant: "accent",
        color: "#f0ad4e",
      },
      {
        label: "Water Distribution",
        icon: FaWater,
        route: "/meter-reading",
        variant: "accent",
        color: "#0dcaf0",
      },
    ],
    []
  );

  const handleOpenSettings = () => {
    navigate("/settings");
  };

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

  const handleExportReport = async () => {
    if (exporting || !token) return;
    try {
      setExporting(true);
      showAlert.processing(
        "Preparing Export",
        "Please wait while we generate the latest dashboard report..."
      );

      const response = await fetch(
        `${API_BASE}/admin/collection-reports/export`,
        {
          headers,
        }
      );

      if (!response.ok) {
        let message = "Failed to export report";
        try {
          const data = await response.json();
          if (data?.message) message = data.message;
        } catch (_) {
          // ignore parsing errors
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `aurora-dashboard-report-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast.success("Report exported successfully");
    } catch (err) {
      console.error("Export report failed:", err);
      showAlert.error(
        "Export Failed",
        err.message || "Unable to export dashboard data."
      );
    } finally {
      showAlert.close();
      setExporting(false);
    }
  };

  const fetchResource = async (endpoint, label) => {
    const response = await fetch(`${API_BASE}${endpoint}`, { headers });
    if (!response.ok) {
      let message = `Failed to fetch ${label}`;
      try {
        const errorBody = await response.json();
        message = errorBody.message || message;
      } catch (_) {
        message = `${message} (${response.status})`;
      }
      throw new Error(message);
    }
    return response.json();
  };

  const fetchDashboardData = async ({ silent = false } = {}) => {
    if (!token) return;
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [customersRes, usersRes, paymentsRes, billsRes] = await Promise.all(
        [
          fetchResource("/admin/customers", "customers"),
          fetchResource("/admin/users", "users"),
          fetchResource("/admin/payments", "payments"),
          fetchResource("/admin/bills", "bills"),
        ]
      );

      const dashboardPayload = buildDashboardData({
        customers: customersRes.customers || [],
        users: usersRes.users || [],
        payments: paymentsRes.payments || [],
        bills: billsRes.bills || [],
      });

      setDashboardData(dashboardPayload);
    } catch (err) {
      console.error("Failed to load admin dashboard:", err);
      setError(err.message || "Failed to load dashboard data.");
      if (!dashboardData) {
        setDashboardData(null);
      }
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setDashboardData(null);
      setError("You must be authenticated to view the admin dashboard.");
      return;
    }
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) {
    return (
      <div className="container-fluid px-3 py-2 admin-dashboard-container fadeIn">
        {/* Page Header persists */}
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3">
          <div className="text-start w-100">
            <h1
              className="h4 mb-1 fw-bold"
              style={{ color: "var(--text-primary)" }}
            >
              System Administration
            </h1>
            <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
              Loading the latest data, please wait...
            </p>
          </div>
          <div className="d-flex gap-2 w-100 w-lg-auto justify-content-start justify-content-lg-end flex-wrap">
            <button className="btn btn-sm" disabled>
              <span className="spinner-border spinner-border-sm me-2" />
              Refreshing
            </button>
            <button className="btn btn-sm btn-success text-white" disabled>
              <FaDownload className="me-2" />
              Export Report
            </button>
            <button className="btn btn-sm" disabled>
              <FaCog className="me-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Skeleton cards */}
        <div className="row g-3 mb-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="col-xl-3 col-md-6">
              <StatsCardSkeleton />
            </div>
          ))}
        </div>

        <div className="row g-3 mb-4">
          <div className="col-xl-8">
            <div className="row g-3">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="col-md-3 col-6">
                  <StatsCardSkeleton />
                </div>
              ))}
            </div>
          </div>
          <div className="col-xl-4">
            <div className="card h-100" style={{ borderRadius: "10px" }}>
              <div className="card-body d-flex justify-content-between align-items-center p-3">
                <div>
                  <div className="small text-muted text-uppercase">
                    System Status
                  </div>
                  <div className="text-muted">Fetching metrics...</div>
                </div>
                <div
                  className="placeholder rounded-circle"
                  style={{ width: "32px", height: "32px" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-xl-8">
            <div className="card mb-4" style={{ borderRadius: "10px" }}>
              <div className="card-header bg-white border-bottom-0 py-3">
                <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                  <FaHistory className="me-2 text-primary" />
                  Recent Activities
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {[...Array(4)].map((_, idx) => (
                    <ActivitySkeleton key={idx} />
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
                  Priority Tasks
                </h5>
              </div>
              <div className="card-body">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="list-group-item px-0 border-0 py-2">
                    <ActivitySkeleton />
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ borderRadius: "10px" }}>
              <div className="card-header bg-white border-bottom-0 py-3">
                <h5 className="card-title mb-0 text-dark">Quick Actions</h5>
              </div>
              <div className="card-body">
                {[...Array(5)].map((_, idx) => (
                  <QuickActionSkeleton key={idx} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if ((!dashboardData || !token) && error) {
    return (
      <div className="container-fluid px-3 py-2 admin-dashboard-container fadeIn">
        <div className="alert alert-danger">
          <h5 className="mb-2">Unable to load dashboard data</h5>
          <p className="mb-3">{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => fetchDashboardData()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const {
    stats,
    quickStats,
    recentActivities,
    priorityTasks,
    waterQualityMetrics,
    systemAlerts,
    systemStatus,
  } = dashboardData;

  const systemStatusClass =
    systemStatus.tone === "danger"
      ? "bg-danger text-white"
      : systemStatus.tone === "warning"
      ? "bg-warning text-dark"
      : systemStatus.tone === "info"
      ? "bg-info text-dark"
      : "bg-primary text-white";

  const systemStatusIcon =
    systemStatus.tone === "danger" || systemStatus.tone === "warning"
      ? FaExclamationTriangle
      : FaCheckCircle;

  return (
    <div className="container-fluid px-3 py-2 admin-dashboard-container fadeIn">
      {/* Optional inline error message if data is stale but we have content */}
      {error && (
        <div className="alert alert-warning d-flex align-items-center gap-2">
          <FaExclamationTriangle />
          <span>{error}</span>
          <button
            className="btn btn-sm btn-outline-secondary ms-auto"
            onClick={() => fetchDashboardData({ silent: true })}
            disabled={refreshing}
          >
            Retry now
          </button>
        </div>
      )}

      {/* Page Header - Fully Responsive */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3">
        <div className="text-start w-100">
          <h1
            className="h4 mb-1 fw-bold"
            style={{ color: "var(--text-primary)" }}
          >
            System Administration
          </h1>
          <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
            {user?.name
              ? `Welcome back, ${user.name.split(" ")[0]}! `
              : "Welcome back! "}
            Here's your live system overview.
          </p>
        </div>
        <div className="d-flex gap-2 w-100 w-lg-auto justify-content-start justify-content-lg-end flex-wrap">
          <button
            className="btn btn-sm d-flex align-items-center"
            onClick={() => fetchDashboardData({ silent: true })}
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
            onClick={handleExportReport}
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
            {exporting ? "Exporting..." : "Export Report"}
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

      {/* Main Stats Overview - FIXED ICON COLORS */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <div
            className="card bg-primary text-white mb-3"
            style={{ borderRadius: "10px" }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small">Total Customers</div>
                  <div className="h4 fw-bold my-1">
                    {formatNumber(stats.totalCustomers)}
                  </div>
                  <div className="small d-flex align-items-center">
                    <FaChartLine className="me-1" />
                    {stats.totalCustomers
                      ? `${stats.totalCustomers > 0 ? "+" : ""}${Math.min(
                          stats.totalCustomers,
                          25
                        )} this month`
                      : "Tracking"}
                  </div>
                </div>
                <div
                  className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px" }}
                >
                  <FaUsers size={20} className="text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div
            className="card bg-warning text-white mb-3"
            style={{ borderRadius: "10px" }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small">Pending Approvals</div>
                  <div className="h4 fw-bold my-1">
                    {formatNumber(stats.pendingApprovals)}
                  </div>
                  <div className="small">
                    {stats.pendingApprovals > 0
                      ? "Requires attention"
                      : "Up to date"}
                  </div>
                </div>
                <div
                  className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px" }}
                >
                  <FaUserCheck size={20} className="text-warning" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div
            className="card bg-success text-white mb-3"
            style={{ borderRadius: "10px" }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small">Monthly Revenue</div>
                  <div className="h4 fw-bold my-1">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                  <div className="small d-flex align-items-center">
                    <FaChartLine className="me-1" />
                    {quickStats[0]?.trend || "+0.0% vs last month"}
                  </div>
                </div>
                <div
                  className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px" }}
                >
                  <FaMoneyCheckAlt size={20} className="text-success" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div
            className="card bg-danger text-white mb-3"
            style={{ borderRadius: "10px" }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small">Delinquent Accounts</div>
                  <div className="h4 fw-bold my-1">
                    {formatNumber(stats.delinquentAccounts)}
                  </div>
                  <div className="small">
                    {stats.delinquentAccounts > 0
                      ? "Over 30 days due"
                      : "All current"}
                  </div>
                </div>
                <div
                  className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px" }}
                >
                  <FaExclamationTriangle size={20} className="text-danger" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats & System Status */}
      <div className="row g-3 mb-4">
        <div className="col-xl-8">
          <div className="row g-3">
            <div className="col-md-3 col-6">
              <div
                className="card border-0 bg-light h-100"
                style={{ borderRadius: "10px" }}
              >
                <div className="card-body text-center p-3">
                  <FaWater className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">
                    {formatNumber(stats.activeConnections)}
                  </div>
                  <div className="text-muted small">Active Connections</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div
                className="card border-0 bg-light h-100"
                style={{ borderRadius: "10px" }}
              >
                <div className="card-body text-center p-3">
                  <FaChartBar className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">
                    {formatNumber(Math.round(stats.monthlyConsumption))} m³
                  </div>
                  <div className="text-muted small">Monthly Usage</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div
                className="card border-0 bg-light h-100"
                style={{ borderRadius: "10px" }}
              >
                <div className="card-body text-center p-3">
                  <FaUsers className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">
                    {formatNumber(stats.staffMembers)}
                  </div>
                  <div className="text-muted small">Staff Members</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div
                className="card border-0 bg-light h-100"
                style={{ borderRadius: "10px" }}
              >
                <div className="card-body text-center p-3">
                  <FaDatabase className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">
                    {stats.systemUptime?.toFixed(1)}%
                  </div>
                  <div className="text-muted small">System Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div
            className={`card ${systemStatusClass} h-100`}
            style={{ borderRadius: "10px" }}
          >
            <div className="card-body d-flex justify-content-between align-items-center p-3">
              <div>
                <div className="small opacity-85 text-uppercase">
                  System Status
                </div>
                <div className="h5 mb-0">{systemStatus.message}</div>
              </div>
              <systemStatusIcon size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-4">
        {/* Recent Activities */}
        <div className="col-xl-8">
          <div className="card mb-4" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                  <FaHistory className="me-2 text-primary" />
                  Recent Activities
                </h5>
                <span className="badge bg-primary">
                  {recentActivities.length}
                </span>
              </div>
            </div>
            <div className="card-body p-0">
              {recentActivities.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  No activity recorded yet.
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="list-group-item d-flex align-items-center border-bottom py-3 px-3"
                    >
                      <div className="me-3">
                        {activity.type === "payment" &&
                        activity.status !== "completed" ? (
                          <div
                            className="bg-warning rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: "40px", height: "40px" }}
                          >
                            <FaClock size={16} className="text-white" />
                          </div>
                        ) : (
                          <div
                            className={`rounded-circle d-flex align-items-center justify-content-center ${
                              activity.type === "payment"
                                ? "bg-success"
                                : "bg-primary"
                            }`}
                            style={{ width: "40px", height: "40px" }}
                          >
                            <FaCheckCircle size={16} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-bold text-dark small">
                          {activity.action}
                        </div>
                        <div className="text-muted small">
                          <FaUsers className="me-1" />
                          {activity.user}
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="text-muted small">{activity.time}</div>
                        <span
                          className={`badge bg-${activity.badgeVariant} small`}
                        >
                          {activity.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card-footer bg-light border-0 py-3">
              <button className="btn btn-outline-primary btn-sm">
                View All Activities
              </button>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="card mb-4" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                <FaChartLine className="me-2 text-primary" />
                Performance Metrics
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {quickStats.map((stat, index) => (
                  <div key={index} className="col-md-3 col-6">
                    <div
                      className="text-center p-3 border rounded"
                      style={{ borderRadius: "8px" }}
                    >
                      <div className="h4 fw-bold text-dark mb-1">
                        {stat.value}
                      </div>
                      <div className="text-muted small mb-2">{stat.label}</div>
                      <span
                        className={`badge bg-${
                          stat.positive ? "success" : "danger"
                        } small`}
                      >
                        {stat.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="col-xl-4">
          {/* Priority Tasks */}
          <div className="card mb-4" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                <FaBell className="me-2 text-warning" />
                Priority Tasks
              </h5>
            </div>
            <div className="card-body">
              {priorityTasks.length === 0 ? (
                <div className="text-muted small">No outstanding tasks.</div>
              ) : (
                <div className="list-group list-group-flush">
                  {priorityTasks.map((task, index) => (
                    <div
                      key={index}
                      className="list-group-item px-0 border-0 py-2"
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="fw-bold text-dark small">
                            {task.task}
                          </div>
                          <div className="text-muted small">
                            {task.count} items
                          </div>
                        </div>
                        <span
                          className={`badge bg-${
                            task.priority === "high"
                              ? "danger"
                              : task.priority === "medium"
                              ? "warning"
                              : "secondary"
                          } small`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Water Quality */}
          <div className="card mb-4" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                <FaWater className="me-2 text-info" />
                Water Quality
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm table-borderless">
                  <thead>
                    <tr>
                      <th className="text-dark small">Parameter</th>
                      <th className="text-dark small">Value</th>
                      <th className="text-dark small">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waterQualityMetrics.map((metric, index) => (
                      <tr key={index}>
                        <td className="text-muted small">{metric.parameter}</td>
                        <td className="fw-bold text-dark">{metric.value}</td>
                        <td>
                          <span
                            className={`badge bg-${
                              metric.status === "optimal"
                                ? "success"
                                : metric.status === "good"
                                ? "info"
                                : "warning"
                            } small`}
                          >
                            {metric.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
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
                    onMouseEnter={(e) =>
                      handleQuickActionHover(e, action, true)
                    }
                    onMouseLeave={(e) =>
                      handleQuickActionHover(e, action, false)
                    }
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

      {/* System Alerts Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-warning" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-warning text-dark py-3 d-flex align-items-center">
              <FaExclamationTriangle className="me-2" />
              <h5 className="card-title mb-0">System Alerts</h5>
            </div>
            <div className="card-body py-3">
              <div className="row g-3">
                {systemAlerts.map((alert, index) => (
                  <div key={index} className="col-md-4">
                    <div className={`alert alert-${alert.type} mb-0 py-2`}>
                      <strong>{alert.title}</strong>
                      <div className="small">{alert.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
