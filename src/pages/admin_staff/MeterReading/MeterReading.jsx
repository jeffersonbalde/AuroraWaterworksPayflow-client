// src/pages/admin_staff/MeterReading/MeterReading.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { showAlert, showToast } from "../../../services/notificationService";
import ReadingFormModal from "./ReadingFormModal";
import ReadingDetailsModal from "./ReadingDetailsModal";
import Portal from "../../../components/Portal";

const MeterReading = () => {
  const { user: currentUser, token } = useAuth();
  const [readings, setReadings] = useState([]);
  const [filteredReadings, setFilteredReadings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(true); // New state for customers loading
  const [actionLoading, setActionLoading] = useState(null);
  const [actionLock, setActionLock] = useState(false);

  // Modal states
  const [showReadingForm, setShowReadingForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReading, setSelectedReading] = useState(null);
  const [editingReading, setEditingReading] = useState(null);
  const [showRestateModal, setShowRestateModal] = useState(false);
  const [restatingReading, setRestatingReading] = useState(null);
  const [restateForm, setRestateForm] = useState({
    amount: "",
    reason: "",
    authCode: "",
  });
  const [restateSubmitting, setRestateSubmitting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterService, setFilterService] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("reading_date");
  const [sortDirection, setSortDirection] = useState("desc");

  // Combined loading state - show skeleton until both readings and customers are loaded
  const isLoading = loading || customersLoading;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setCustomersLoading(true);
      try {
        await Promise.all([fetchReadings(), fetchCustomers()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortReadings();
  }, [
    readings,
    searchTerm,
    filterStatus,
    filterService,
    sortField,
    sortDirection,
  ]);

  const fetchReadings = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/meter-readings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const formattedReadings = (data.readings || []).map((reading) => ({
          ...reading,
          previous_reading: parseFloat(reading.previous_reading) || 0,
          present_reading: parseFloat(reading.present_reading) || 0,
          consumption: parseFloat(reading.consumption) || 0,
          amount: parseFloat(reading.amount) || 0,
          penalty: parseFloat(reading.penalty) || 0,
          total_payable: parseFloat(reading.total_payable) || 0,
          restated_amount: reading.restated_amount
            ? parseFloat(reading.restated_amount)
            : null,
        }));
        setReadings(formattedReadings);
      } else {
        throw new Error("Failed to fetch meter readings");
      }
    } catch (error) {
      console.error("Error fetching meter readings:", error);
      showAlert.error("Error", "Failed to load meter readings");
      setReadings([]);
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
      setCustomers([]);
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
    await Promise.all([fetchReadings(), fetchCustomers()]);
    setLoading(false);
    showToast.info("Data refreshed successfully");
  };

  const filterAndSortReadings = () => {
    let filtered = [...readings];

    // Search filter
    if (searchTerm.trim()) {
      const loweredSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((reading) => {
        const customer = customers.find((c) => c.id === reading.user_id);
        const fieldsToSearch = [
          customer?.name,
          customer?.wws_id,
          reading.wws_id,
          reading.meter_reader,
        ];
        return fieldsToSearch.some(
          (field) =>
            typeof field === "string" &&
            field.toLowerCase().includes(loweredSearch)
        );
      });
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((reading) => reading.status === filterStatus);
    }

    // Service filter
    if (filterService !== "all") {
      filtered = filtered.filter((reading) => {
        const customer = customers.find((c) => c.id === reading.user_id);
        return customer?.service === filterService;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      if (!sortField) return 0;

      if (
        sortField === "reading_date" ||
        sortField === "due_date" ||
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

    setFilteredReadings(filtered);
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

  const handleAddReading = () => {
    setEditingReading(null);
    setShowReadingForm(true);
  };

  const handleEditReading = (reading) => {
    setEditingReading(reading);
    setShowReadingForm(true);
  };

  const handleViewDetails = (reading) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }
    setSelectedReading(reading);
    setShowDetailsModal(true);
  };

  const handleReadingSave = async (savedReading) => {
    const formattedReading = {
      ...savedReading,
      previous_reading: parseFloat(savedReading.previous_reading) || 0,
      present_reading: parseFloat(savedReading.present_reading) || 0,
      consumption: parseFloat(savedReading.consumption) || 0,
      amount: parseFloat(savedReading.amount) || 0,
      penalty: parseFloat(savedReading.penalty) || 0,
      total_payable: parseFloat(savedReading.total_payable) || 0,
      restated_amount: savedReading.restated_amount
        ? parseFloat(savedReading.restated_amount)
        : null,
    };

    if (editingReading) {
      setReadings((prev) =>
        prev.map((reading) =>
          reading.id === formattedReading.id ? formattedReading : reading
        )
      );
    } else {
      setReadings((prev) => [...prev, formattedReading]);
    }
    setShowReadingForm(false);
    setEditingReading(null);
  };

  const handleRestateAmount = (reading) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    const defaultAmount =
      reading.restated_amount ?? reading.total_payable ?? reading.amount ?? 0;

    setRestatingReading(reading);
    setRestateForm({
      amount: parseFloat(defaultAmount || 0).toFixed(2),
      reason: "",
      authCode: "",
    });
    setShowRestateModal(true);
  };

  const closeRestateModal = () => {
    if (restateSubmitting) return;
    setShowRestateModal(false);
    setRestatingReading(null);
    setRestateForm({ amount: "", reason: "", authCode: "" });
  };

  const handleRestateSubmit = async (event) => {
    event.preventDefault();
    if (!restatingReading) return;

    const restatedAmount = parseFloat(restateForm.amount);
    const reason = restateForm.reason;
    const authCode = restateForm.authCode.trim();

    if (!restatedAmount || !reason || !authCode) {
      showAlert.error("Error", "All fields are required");
      return;
    }

    setActionLock(true);
    setActionLoading(restatingReading.id);
    setRestateSubmitting(true);

    try {
      showAlert.loading(
        "Restating Amount",
        "Please wait while we process your request..."
      );

      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/meter-readings/${
          restatingReading.id
        }/restate`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            restated_amount: restatedAmount,
            restatement_reason: reason,
            authorization_code: authCode,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const formattedReading = {
          ...data.reading,
          previous_reading: parseFloat(data.reading.previous_reading) || 0,
          present_reading: parseFloat(data.reading.present_reading) || 0,
          consumption: parseFloat(data.reading.consumption) || 0,
          amount: parseFloat(data.reading.amount) || 0,
          penalty: parseFloat(data.reading.penalty) || 0,
          total_payable: parseFloat(data.reading.total_payable) || 0,
          restated_amount: data.reading.restated_amount
            ? parseFloat(data.reading.restated_amount)
            : null,
        };
        setReadings((prev) =>
          prev.map((reading) =>
            reading.id === restatingReading.id ? formattedReading : reading
          )
        );
        showToast.success("Amount restated successfully!");
        closeRestateModal();
      } else {
        let errorMessage = "Failed to restate amount";
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          errorMessage = errorMessages.join("\n");
        } else if (data.message) {
          errorMessage = data.message;
        }
        await showAlert.error("Restatement Failed", errorMessage);
      }
    } catch (error) {
      console.error("Error restating amount:", error);
      await showAlert.error(
        "Restatement Failed",
        error.message || "Failed to restate amount. Please try again."
      );
    } finally {
      showAlert.close();
      setActionLoading(null);
      setActionLock(false);
      setRestateSubmitting(false);
    }
  };

  const handleRestateFieldChange = (field, value) => {
    setRestateForm((prev) => ({ ...prev, [field]: value }));
  };

  const getCustomerInfo = (userId) => {
    const customer = customers.find((c) => c.id === userId);
    return customer || { name: "Unknown", wws_id: "N/A", service: "N/A" };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <span className="badge bg-success">Paid</span>;
      case "pending":
        return <span className="badge bg-warning text-dark">Pending</span>;
      case "overdue":
        return <span className="badge bg-danger">Overdue</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getServiceBadge = (service) => {
    switch (service) {
      case "residential":
        return <span className="badge bg-info">Residential</span>;
      case "commercial":
        return <span className="badge bg-primary">Commercial</span>;
      case "institutional":
        return <span className="badge bg-secondary">Institutional</span>;
      default:
        return <span className="badge bg-light text-dark">{service}</span>;
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "fas fa-sort text-muted";
    return sortDirection === "asc" ? "fas fa-sort-up" : "fas fa-sort-down";
  };

  const isActionDisabled = (readingId = null) => {
    return actionLock || (actionLoading && actionLoading !== readingId);
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
  const totalReadings = readings.length;
  const pendingReadings = readings.filter((r) => r.status === "pending").length;
  const paidReadings = readings.filter((r) => r.status === "paid").length;
  const overdueReadings = readings.filter((r) => r.status === "overdue").length;
  const totalRevenue = readings
    .filter((r) => r.status === "paid")
    .reduce(
      (sum, reading) => sum + (parseFloat(reading.total_payable) || 0),
      0
    );

  // Pagination
  const totalPages = Math.ceil(filteredReadings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReadings = filteredReadings.slice(startIndex, endIndex);

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
          {[1, 2, 3].map((item) => (
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
          <span
            className="placeholder col-6"
            style={{ height: "24px", borderRadius: "12px" }}
          ></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave mb-1">
          <span className="placeholder col-5" style={{ height: "16px" }}></span>
        </div>
        <div className="placeholder-wave">
          <span className="placeholder col-7" style={{ height: "14px" }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave mb-1">
          <span className="placeholder col-6" style={{ height: "16px" }}></span>
        </div>
        <div className="placeholder-wave">
          <span className="placeholder col-8" style={{ height: "14px" }}></span>
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
    <div className="container-fluid px-3 py-2 meter-reading-container fadeIn">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
        <div className="flex-grow-1 mb-2 mb-md-0">
          <h1
            className="h4 mb-1 fw-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Meter Reading Management
          </h1>
          <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
            Manage water meter readings and billing calculations
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div
            className="badge px-3 py-2 text-white"
            style={{ backgroundColor: "#336C35" }}
          >
            <i className="fas fa-tachometer-alt me-2"></i>
            Total Readings: {isLoading ? "..." : readings.length}
          </div>
          <button
            className="btn btn-sm btn-success text-white"
            onClick={handleAddReading}
            disabled={isActionDisabled() || isLoading}
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
            <i className="fas fa-plus me-1"></i>
            Add Reading
          </button>
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
                      Total Readings
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--primary-color)" }}
                    >
                      {totalReadings}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i
                      className="fas fa-tachometer-alt fa-2x"
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
                      style={{ color: "var(--warning-color)" }}
                    >
                      Pending
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--warning-color)" }}
                    >
                      {pendingReadings}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i
                      className="fas fa-clock fa-2x"
                      style={{ color: "var(--warning-light)", opacity: 0.7 }}
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
                      style={{ color: "var(--danger-color)" }}
                    >
                      Overdue
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--danger-color)" }}
                    >
                      {overdueReadings}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i
                      className="fas fa-exclamation-triangle fa-2x"
                      style={{ color: "var(--danger-light)", opacity: 0.7 }}
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
                      Total Revenue
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--success-color)" }}
                    >
                      ₱{totalRevenue.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i
                      className="fas fa-money-bill-wave fa-2x"
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
            <div className="col-md-4">
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
                  placeholder="Search by name, WWS ID, or meter reader..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isActionDisabled() || isLoading}
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
                    disabled={isActionDisabled() || isLoading}
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
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="col-md-2">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Service
              </label>
              <select
                className="form-select form-select-sm"
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                disabled={isLoading || isActionDisabled()}
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--input-text)",
                }}
              >
                <option value="all">All Service</option>
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
              <i className="fas fa-tachometer-alt me-2"></i>
              Meter Readings
              {!isLoading && (
                <small className="opacity-75 ms-2">
                  ({filteredReadings.length} found
                  {searchTerm ||
                  filterStatus !== "all" ||
                  filterService !== "all"
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
            // Show skeleton loading until both readings and customers are loaded
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
                    <th style={{ width: "20%" }} className="small fw-semibold">
                      Customer
                    </th>
                    <th style={{ width: "10%" }} className="small fw-semibold">
                      Service
                    </th>
                    <th style={{ width: "15%" }} className="small fw-semibold">
                      Reading Info
                    </th>
                    <th style={{ width: "15%" }} className="small fw-semibold">
                      Billing
                    </th>
                    <th style={{ width: "10%" }} className="small fw-semibold">
                      Status
                    </th>
                    <th style={{ width: "10%" }} className="small fw-semibold">
                      Meter Reader
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
                    ? "Fetching meter readings..."
                    : "Loading customer data..."}
                </span>
              </div>
            </div>
          ) : currentReadings.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <i
                  className="fas fa-tachometer-alt fa-3x"
                  style={{ color: "var(--text-muted)", opacity: 0.5 }}
                ></i>
              </div>
              <h5 className="mb-2" style={{ color: "var(--text-muted)" }}>
                {readings.length === 0
                  ? "No Meter Readings"
                  : "No Matching Results"}
              </h5>
              <p className="mb-3 small" style={{ color: "var(--text-muted)" }}>
                {readings.length === 0
                  ? "No meter readings have been recorded yet."
                  : "Try adjusting your search criteria."}
              </p>
              {searchTerm && (
                <button
                  className="btn btn-sm clear-search-main-btn"
                  onClick={() => setSearchTerm("")}
                  disabled={isActionDisabled()}
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
                          Customer
                          <i className={`ms-1 ${getSortIcon("name")}`}></i>
                        </button>
                      </th>
                      <th
                        style={{ width: "10%" }}
                        className="small fw-semibold"
                      >
                        Service
                      </th>
                      <th
                        style={{ width: "15%" }}
                        className="small fw-semibold"
                      >
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start"
                          onClick={() => handleSort("reading_date")}
                          disabled={isActionDisabled()}
                          style={{ color: "var(--text-primary)" }}
                        >
                          Reading Info
                          <i
                            className={`ms-1 ${getSortIcon("reading_date")}`}
                          ></i>
                        </button>
                      </th>
                      <th
                        style={{ width: "15%" }}
                        className="small fw-semibold"
                      >
                        Billing
                      </th>
                      <th
                        style={{ width: "10%" }}
                        className="small fw-semibold"
                      >
                        Status
                      </th>
                      <th
                        style={{ width: "10%" }}
                        className="small fw-semibold"
                      >
                        Meter Reader
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReadings.map((reading, index) => {
                      const customer = getCustomerInfo(reading.user_id);
                      return (
                        <tr key={reading.id} className="align-middle">
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
                                onClick={() => handleViewDetails(reading)}
                                disabled={isActionDisabled(reading.id)}
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
                                {actionLoading === reading.id ? (
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                  ></span>
                                ) : (
                                  <i className="fas fa-eye"></i>
                                )}
                              </button>

                              <button
                                className="btn btn-sm text-white"
                                onClick={() => handleEditReading(reading)}
                                disabled={isActionDisabled(reading.id)}
                                title="Edit Reading"
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "6px",
                                  transition: "all 0.2s ease-in-out",
                                  backgroundColor: "#ffc107", // Warning color
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
                                <i className="fas fa-edit"></i>
                              </button>

                              <button
                                className="btn btn-sm text-white"
                                onClick={() => handleRestateAmount(reading)}
                                disabled={isActionDisabled(reading.id)}
                                title="Restate Amount"
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "6px",
                                  transition: "all 0.2s ease-in-out",
                                  backgroundColor: "#dc3545", // Danger color
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
                                {actionLoading === reading.id ? (
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                  ></span>
                                ) : (
                                  <i className="fas fa-exchange-alt"></i>
                                )}
                              </button>
                            </div>
                          </td>
                          <td>
                            <div style={{ color: "var(--text-primary)" }}>
                              <div className="fw-medium">{customer.name}</div>
                              <div
                                className="small"
                                style={{ color: "var(--text-muted)" }}
                              >
                                WWS: {customer.wws_id || reading.wws_id}
                              </div>
                            </div>
                          </td>
                          <td>{getServiceBadge(customer.service)}</td>
                          <td>
                            <div style={{ color: "var(--text-primary)" }}>
                              <div className="small">
                                <strong>Date:</strong>{" "}
                                {formatDate(reading.reading_date)}
                              </div>
                              <div className="small">
                                <strong>Due:</strong>{" "}
                                {formatDate(reading.due_date)}
                              </div>
                              <div className="small">
                                <strong>Consumption:</strong>{" "}
                                {reading.consumption} m³
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ color: "var(--text-primary)" }}>
                              <div className="fw-medium text-success">
                                ₱
                                {(
                                  parseFloat(reading.total_payable) || 0
                                ).toFixed(2)}
                              </div>
                              {reading.restated_amount && (
                                <div className="small text-warning">
                                  Restated: ₱
                                  {(
                                    parseFloat(reading.restated_amount) || 0
                                  ).toFixed(2)}
                                </div>
                              )}
                              {reading.penalty > 0 && (
                                <div className="small text-danger">
                                  Penalty: ₱
                                  {(parseFloat(reading.penalty) || 0).toFixed(
                                    2
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {getStatusBadge(reading.status)}
                            {reading.online_meter_used && (
                              <div className="small mt-1">
                                <i className="fas fa-wifi text-info"></i>
                                <span
                                  className="ms-1"
                                  style={{ color: "var(--text-muted)" }}
                                >
                                  Online
                                </span>
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ color: "var(--text-primary)" }}>
                              <div className="small fw-medium">
                                {reading.meter_reader}
                              </div>
                              {reading.qr_number && (
                                <div
                                  className="small"
                                  style={{ color: "var(--text-muted)" }}
                                >
                                  QR: {reading.qr_number}
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

              {/* Updated Pagination - Matching AccountApprovals style */}
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
                          {Math.min(endIndex, filteredReadings.length)}
                        </span>{" "}
                        of{" "}
                        <span
                          className="fw-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {filteredReadings.length}
                        </span>{" "}
                        meter readings
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

      {/* Modals */}
      {showReadingForm && (
        <ReadingFormModal
          reading={editingReading}
          customers={customers}
          customersLoading={customersLoading} // Pass loading state to modal
          onClose={() => {
            setShowReadingForm(false);
            setEditingReading(null);
          }}
          onSave={handleReadingSave}
          token={token}
        />
      )}

      {showDetailsModal && selectedReading && (
        <ReadingDetailsModal
          reading={selectedReading}
          customer={getCustomerInfo(selectedReading.user_id)}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedReading(null);
          }}
        />
      )}

      {showRestateModal && restatingReading && (
        <Portal>
          <div
            className="modal fade show d-block modal-backdrop-animation"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            tabIndex="-1"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeRestateModal();
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered modal-md mx-3 mx-sm-auto">
              <div
                className="modal-content border-0 modal-content-animation"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
              >
                <form onSubmit={handleRestateSubmit}>
                  <div
                    className="modal-header border-0 text-white modal-smooth"
                    style={{ backgroundColor: "#336C35" }}
                  >
                    <div>
                      <h5 className="modal-title fw-bold mb-1">
                        <i className="fas fa-exchange-alt me-2"></i>
                        Restate Amount
                      </h5>
                      <small className="text-white-50">
                        Reading #{restatingReading.id} •{" "}
                        {getCustomerInfo(restatingReading.user_id).name}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="btn-close btn-close-white btn-smooth"
                      aria-label="Close"
                      onClick={closeRestateModal}
                      disabled={restateSubmitting}
                    ></button>
                  </div>
                  <div
                    className="modal-body bg-light modal-smooth"
                    style={{ maxHeight: "70vh", overflowY: "auto" }}
                  >
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">
                        Current Total Payable
                      </label>
                      <div className="h5 mb-0 text-success">
                        ₱
                        {(
                          parseFloat(restatingReading.total_payable) || 0
                        ).toFixed(2)}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">
                        Restated Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={restateForm.amount}
                        onChange={(e) =>
                          handleRestateFieldChange("amount", e.target.value)
                        }
                        disabled={restateSubmitting}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">
                        Reason
                      </label>
                      <select
                        className="form-select"
                        value={restateForm.reason}
                        onChange={(e) =>
                          handleRestateFieldChange("reason", e.target.value)
                        }
                        disabled={restateSubmitting}
                        required
                      >
                        <option value="">Select reason</option>
                        <option value="leaking">Leaking</option>
                        <option value="wrong_reading">Wrong Reading</option>
                        <option value="big_consumption">
                          Big Consumption (80+)
                        </option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">
                        Authorization Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={restateForm.authCode}
                        onChange={(e) =>
                          handleRestateFieldChange("authCode", e.target.value)
                        }
                        maxLength={50}
                        disabled={restateSubmitting}
                        required
                      />
                      <small className="text-muted">
                        Only valid admin-issued codes are accepted.
                      </small>
                    </div>
                  </div>
                  <div className="modal-footer border-top bg-white modal-smooth">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-smooth"
                      onClick={closeRestateModal}
                      disabled={restateSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success btn-smooth"
                      disabled={restateSubmitting}
                    >
                      {restateSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Restate Amount
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default MeterReading;
