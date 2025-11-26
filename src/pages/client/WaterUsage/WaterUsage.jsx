// src/pages/client/WaterUsage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { showAlert, showToast } from "../../../services/notificationService";
import {
  FaWater,
  FaChartLine,
  FaArrowUp,
  FaSyncAlt,
  FaTable,
} from "react-icons/fa";

const WaterUsage = () => {
  const { user, token } = useAuth();
  const [usageData, setUsageData] = useState([]);
  const [filteredUsageData, setFilteredUsageData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLock, setActionLock] = useState(false);
  const [timeRange, setTimeRange] = useState("12months");
  
  // Pagination states
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("month");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    fetchUsageData();
  }, [timeRange]);

  useEffect(() => {
    filterAndSortUsageData();
  }, [usageData, sortField, sortDirection]);

  const fetchUsageData = async () => {
    if (actionLock) {
      showToast.warning("Please wait until current action completes");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_LARAVEL_API}/client/usage`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsageData(data.usage || []);
        setStats(data.stats || {});
      } else {
        throw new Error('Failed to fetch usage data');
      }
    } catch (error) {
      console.error("Error fetching usage data:", error);
      showAlert.error("Error", "Failed to load water usage data");
      setUsageData([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsageData = () => {
    let filtered = [...usageData];

    // Sorting
    filtered.sort((a, b) => {
      if (!sortField) return 0;

      if (sortField === "month") {
        const aDate = a[sortField] ? new Date(a[sortField]) : new Date(0);
        const bDate = b[sortField] ? new Date(b[sortField]) : new Date(0);

        if (aDate < bDate) return sortDirection === "asc" ? -1 : 1;
        if (aDate > bDate) return sortDirection === "asc" ? 1 : -1;
        return 0;
      }

      const aValue = parseFloat(a[sortField] || 0);
      const bValue = parseFloat(b[sortField] || 0);

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredUsageData(filtered);
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

  const isActionDisabled = () => {
    return actionLock || loading;
  };

  // Calculate statistics
  const totalRecords = usageData.length;
  const averageConsumption = stats.average_consumption || 0;
  const totalConsumption = stats.total_consumption || 0;
  const highestConsumption = stats.highest_consumption || 0;

  // Pagination
  const totalPages = Math.ceil(filteredUsageData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsageData = filteredUsageData.slice(startIndex, endIndex);

  // Skeleton Loader
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
      <td className="text-center">
        <div className="placeholder-wave">
          <span className="placeholder col-4" style={{ height: "20px" }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-7" style={{ height: "16px" }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-5" style={{ height: "16px" }}></span>
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
            className="placeholder col-4"
            style={{ height: "24px", borderRadius: "12px" }}
          ></span>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="container-fluid px-3 py-2 water-usage-container fadeIn">
{/* Page Header */}
<div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-3 gap-3">
  <div className="text-start">
    <h1
      className="h4 mb-1 fw-bold"
      style={{ color: "var(--text-primary)" }}
    >
      Water Usage
    </h1>
    <p
      className="mb-0 small"
      style={{ color: "var(--text-muted)" }}
    >
      Monitor your water consumption and usage patterns
    </p>
  </div>
  <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 ms-lg-auto">
    <div
      className="badge px-3 py-2 text-white text-nowrap"
      style={{ backgroundColor: "#336C35" }}
    >
      <FaWater className="me-2" />
      Total Records: {loading ? "..." : totalRecords}
    </div>
    <div className="d-flex gap-2">
      <select
        className="form-select form-select-sm"
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        disabled={isActionDisabled()}
        style={{
          backgroundColor: "var(--input-bg)",
          borderColor: "var(--input-border)",
          color: "var(--input-text)",
          minWidth: "140px",
        }}
      >
        <option value="6months">Last 6 Months</option>
        <option value="12months">Last 12 Months</option>
      </select>
      <button
        className="btn btn-sm text-nowrap"
        onClick={fetchUsageData}
        disabled={isActionDisabled()}
        style={{
          transition: "all 0.2s ease-in-out",
          border: "2px solid var(--primary-color)",
          color: "var(--primary-color)",
          backgroundColor: "transparent",
          whiteSpace: "nowrap",
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
</div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4">
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
                      Average Monthly Usage
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--primary-color)" }}
                    >
                      {averageConsumption.toFixed(1)} m³
                    </div>
                  </div>
                  <div className="col-auto">
                    <FaChartLine
                      size={24}
                      style={{ color: "var(--primary-light)", opacity: 0.7 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-6 col-md-4">
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
                      Total Consumption
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--success-color)" }}
                    >
                      {totalConsumption.toFixed(1)} m³
                    </div>
                  </div>
                  <div className="col-auto">
                    <FaWater
                      size={24}
                      style={{ color: "var(--success-light)", opacity: 0.7 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-6 col-md-4">
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
                      Highest Usage
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--warning-color)" }}
                    >
                      {highestConsumption.toFixed(1)} m³
                    </div>
                  </div>
                  <div className="col-auto">
                    <FaArrowUp
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

      {/* Search and Filter Controls */}
      <div
        className="card border-0 shadow-sm mb-3"
        style={{ backgroundColor: "var(--background-white)" }}
      >
        <div className="card-body p-3">
          <div className="row g-2 align-items-end">
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

      {/* Usage Table */}
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
              <FaTable className="me-2" />
              Monthly Consumption Details
              {!loading && (
                <small className="opacity-75 ms-2">
                  ({filteredUsageData.length} records)
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
                    <th style={{ width: "25%" }} className="small fw-semibold">
                      Month
                    </th>
                    <th style={{ width: "25%" }} className="small fw-semibold">
                      Consumption (m³)
                    </th>
                    <th style={{ width: "25%" }} className="small fw-semibold">
                      Amount
                    </th>
                    <th style={{ width: "20%" }} className="small fw-semibold">
                      Trend
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
                  Loading usage data...
                </span>
              </div>
            </div>
          ) : currentUsageData.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <FaWater
                  size={48}
                  style={{ color: "var(--text-muted)", opacity: 0.5 }}
                />
              </div>
              <h5 className="mb-2" style={{ color: "var(--text-muted)" }}>
                No Usage Data Found
              </h5>
              <p className="mb-3 small" style={{ color: "var(--text-muted)" }}>
                We don't have any water usage data for your account yet.
              </p>
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
                        style={{ width: "25%" }}
                        className="small fw-semibold"
                      >
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start"
                          onClick={() => handleSort("month")}
                          disabled={isActionDisabled()}
                          style={{ color: "var(--text-primary)" }}
                        >
                          Month
                          <i className={`ms-1 ${getSortIcon("month")}`}></i>
                        </button>
                      </th>
                      <th
                        style={{ width: "25%" }}
                        className="small fw-semibold"
                      >
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start"
                          onClick={() => handleSort("consumption")}
                          disabled={isActionDisabled()}
                          style={{ color: "var(--text-primary)" }}
                        >
                          Consumption (m³)
                          <i
                            className={`ms-1 ${getSortIcon("consumption")}`}
                          ></i>
                        </button>
                      </th>
                      <th
                        style={{ width: "25%" }}
                        className="small fw-semibold"
                      >
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start"
                          onClick={() => handleSort("amount")}
                          disabled={isActionDisabled()}
                          style={{ color: "var(--text-primary)" }}
                        >
                          Amount
                          <i className={`ms-1 ${getSortIcon("amount")}`}></i>
                        </button>
                      </th>
                      <th
                        style={{ width: "20%" }}
                        className="small fw-semibold"
                      >
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsageData.map((item, index) => {
                      const globalIndex = startIndex + index;
                      const prevIndex = globalIndex - 1;
                      const hasTrend =
                        prevIndex >= 0 &&
                        filteredUsageData[prevIndex] &&
                        filteredUsageData[prevIndex].consumption !== undefined;
                      const isIncreasing =
                        hasTrend &&
                        item.consumption >
                          filteredUsageData[prevIndex].consumption;

                      return (
                        <tr key={index} className="align-middle">
                          <td
                            className="text-center fw-bold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {startIndex + index + 1}
                          </td>
                          <td style={{ color: "var(--text-primary)" }}>
                            <span className="fw-medium">{item.month}</span>
                          </td>
                          <td style={{ color: "var(--text-primary)" }}>
                            <span
                              className="fw-bold"
                              style={{ color: "var(--primary-color)" }}
                            >
                              {item.consumption} m³
                            </span>
                          </td>
                          <td style={{ color: "var(--text-primary)" }}>
                            <span
                              className="fw-medium"
                              style={{ color: "var(--success-color)" }}
                            >
                              ₱{item.amount.toFixed(2)}
                            </span>
                          </td>
                          <td>
                            {hasTrend && (
                              <span
                                className={`badge small ${
                                  isIncreasing ? "bg-danger" : "bg-success"
                                }`}
                              >
                                {isIncreasing ? "↑ Increasing" : "↓ Decreasing"}
                              </span>
                            )}
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
                          {Math.min(endIndex, filteredUsageData.length)}
                        </span>{" "}
                        of{" "}
                        <span
                          className="fw-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {filteredUsageData.length}
                        </span>{" "}
                        records
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
                            e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
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
                        disabled={currentPage === totalPages || isActionDisabled()}
                        style={{
                          transition: "all 0.2s ease-in-out",
                          border: "2px solid var(--primary-color)",
                          color: "var(--primary-color)",
                          backgroundColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!e.target.disabled) {
                            e.target.style.transform = "translateY(-1px)";
                            e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
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

export default WaterUsage;