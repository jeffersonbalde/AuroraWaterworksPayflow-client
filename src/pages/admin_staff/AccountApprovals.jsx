// src/pages/admin_staff/AccountApprovals.jsx - UPDATED WITH ACTION BUTTON SKELETONS
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { showAlert, showToast } from "../../services/notificationService";
import Swal from "sweetalert2";
import Portal from "../../components/Portal";

const AccountApprovals = () => {
  const { user: currentUser, refreshPendingApprovals } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionLock, setActionLock] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Enhanced state for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  const showProcessingAlert = (
    title = "Processing Action",
    text = "Please wait while we complete this request..."
  ) => {
    showAlert.processing(title, text);
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [pendingUsers, searchTerm, sortField, sortDirection]);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const pendingUsers =
          data.users?.filter((user) => user.status === "pending") || [];
        setPendingUsers(pendingUsers);
      } else {
        throw new Error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching pending users:", error);
      showAlert.error("Error", "Failed to load pending approval requests");
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshAllData = async () => {
    if (actionLock) {
      showToast.warning("Please wait until current action completes");
      return;
    }
    await fetchPendingUsers();
    showToast.info("Data refreshed successfully");
  };

  const filterAndSortUsers = () => {
    let filtered = [...pendingUsers];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.wws_id &&
            user.wws_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.contact_number && user.contact_number.includes(searchTerm)) ||
          (user.address &&
            user.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "created_at") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Function to truncate address
  const truncateAddress = (address, maxLength = 30) => {
    if (!address) return "Not provided";
    if (address.length <= maxLength) return address;
    return address.substring(0, maxLength) + "...";
  };

  const handleApprove = async (userId) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    const result = await showAlert.confirm(
      "Approve Account",
      "Are you sure you want to approve this account? This action will grant them full access to the system.",
      "Yes, Approve",
      "Cancel"
    );

    if (!result.isConfirmed) {
      return;
    }

    setActionLock(true);
    setActionLoading(userId);
    showProcessingAlert("Approving Account", "Please wait while we activate this user.");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/users/${userId}/approve`,
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
        showToast.success("Account approved successfully!");
        setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
        await refreshPendingApprovals();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve account");
      }
    } catch (error) {
      showAlert.close();
      console.error("Error approving account:", error);
      showAlert.error(
        "Approval Failed",
        error.message || "Failed to approve account. Please try again."
      );
    } finally {
      showAlert.close();
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const handleReject = async (userId, userName) => {
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
            You are about to reject <strong>${userName}</strong>. Please provide a reason for rejection (minimum 10 characters).
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

          // Add close button functionality
          const closeButton =
            Swal.getPopup().querySelector(".btn-close-custom");
          if (closeButton) {
            closeButton.addEventListener("click", () => {
              Swal.close();
            });
          }

          // Character count functionality
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
      setActionLoading(userId);
      showProcessingAlert("Rejecting Account", "Please wait while we record your decision.");

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/users/${userId}/reject`,
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
        showToast.info("Account rejected successfully");
        setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
        await refreshPendingApprovals();
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

  const handleViewDetails = (user) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleBulkApprove = async () => {
    if (currentUsers.length === 0) return;

    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    const result = await showAlert.confirm(
      "Approve All Pending Accounts",
      `Are you sure you want to approve all ${currentUsers.length} pending accounts on this page? This action will grant them full access to the system.`,
      "Yes, Approve All",
      "Cancel"
    );

    if (!result.isConfirmed) {
      return;
    }

    setActionLock(true);
    showProcessingAlert("Approving Accounts", "Please wait while we approve all accounts on this page.");

    try {
      const approvePromises = currentUsers.map((user) =>
        fetch(
          `${import.meta.env.VITE_LARAVEL_API}/admin/users/${user.id}/approve`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        )
      );

      const responses = await Promise.all(approvePromises);
      const allSuccessful = responses.every((response) => response.ok);

      if (allSuccessful) {
        showToast.success(
          `${currentUsers.length} accounts approved successfully!`
        );
        await fetchPendingUsers();
        await refreshPendingApprovals();
      } else {
        throw new Error("Failed to approve some accounts");
      }
    } catch (error) {
      showAlert.close();
      console.error("Error in bulk approval:", error);
      showAlert.error(
        "Approval Failed",
        "Failed to approve some accounts. Please try again."
      );
    } finally {
      setActionLock(false);
      showAlert.close();
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "fas fa-sort text-muted";
    return sortDirection === "asc" ? "fas fa-sort-up" : "fas fa-sort-down";
  };

  const isActionDisabled = (userId = null) => {
    return actionLock || (actionLoading && actionLoading !== userId);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedUser(null);
  };

  const formatDateTime = (value, includeTime = true) => {
    if (!value) return "N/A";
    const options = includeTime
      ? { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
      : { year: "numeric", month: "short", day: "numeric" };
    return new Date(value).toLocaleString("en-US", options);
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
            {[1, 2, 3].map((item) => (
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
              style={{ height: "16px" }}
            ></span>
          </div>
        </td>
      </tr>
    );
  };

  // Skeleton loader for stats cards
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
    <div className="container-fluid px-3 py-2 account-approvals-container fadeIn">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
        <div className="flex-grow-1 mb-2 mb-md-0">
          <h1
            className="h4 mb-1 fw-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Approval Queue
          </h1>
          <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
            Manage client account registration requests
          </p>
        </div>
<div className="d-flex align-items-center gap-2 flex-wrap">
  {!loading && currentUsers.length > 0 && (
    <button
      className="btn btn-sm btn-success text-white"
      onClick={handleBulkApprove}
      disabled={isActionDisabled()}
      style={{ 
        transition: 'all 0.2s ease-in-out',
        borderWidth: '2px'
      }}
      onMouseEnter={(e) => {
        if (!e.target.disabled) {
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'none';
      }}
    >
      <i className="fas fa-check-double me-1"></i>
      Approve Page
    </button>
  )}
<button
  className="btn btn-sm"
  onClick={refreshAllData}
  disabled={loading || isActionDisabled()}
  style={{ 
    transition: 'all 0.2s ease-in-out',
    border: '2px solid var(--primary-color)',
    color: 'var(--primary-color)',
    backgroundColor: 'transparent'
  }}
  onMouseEnter={(e) => {
    if (!e.target.disabled) {
      e.target.style.transform = 'translateY(-1px)';
      e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      e.target.style.backgroundColor = 'var(--primary-color)';
      e.target.style.color = 'white';
    }
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = 'none';
    e.target.style.backgroundColor = 'transparent';
    e.target.style.color = 'var(--primary-color)';
  }}
>
  <i className="fas fa-sync-alt me-1"></i>
  Refresh
</button>
</div>
      </div>

      {/* Stats Cards at the Top */}
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
                      Total Pending
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--primary-color)" }}
                    >
                      {pendingUsers.length}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i
                      className="fas fa-clock fa-2x"
                      style={{ color: "var(--primary-light)", opacity: 0.7 }}
                    ></i>
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
                      style={{ color: "var(--accent-color)" }}
                    >
                      Filtered Results
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--accent-color)" }}
                    >
                      {filteredUsers.length}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i
                      className="fas fa-filter fa-2x"
                      style={{ color: "var(--accent-light)", opacity: 0.7 }}
                    ></i>
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
                      style={{ color: "var(--primary-dark)" }}
                    >
                      Current Page
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: "var(--primary-dark)" }}
                    >
                      {currentPage}/{totalPages}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i
                      className="fas fa-file-alt fa-2x"
                      style={{ color: "var(--primary-color)", opacity: 0.7 }}
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
            <div className="col-md-8">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Search Accounts
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
                  placeholder="Search by name, email, address, WWS ID, or contact..."
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
            <div className="col-md-4">
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
              <i className="fas fa-list-check me-2"></i>
              Pending Account Approvals
              {!loading && (
                <small className="opacity-75 ms-2">
                  ({filteredUsers.length} found
                  {searchTerm ? " after filtering" : ""})
                </small>
              )}
            </h5>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            // Loading state with action button skeletons
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
                <thead style={{ backgroundColor: "var(--background-light)" }}>
                  <tr>
                    <th className="text-center small fw-semibold">#</th>
                    <th className="text-center small fw-semibold">Actions</th>
                    <th className="small fw-semibold">
                      <button
                        className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start"
                        onClick={() => handleSort("name")}
                        disabled={isActionDisabled()}
                      >
                        User Information
                        <i className={`ms-1 ${getSortIcon("name")}`}></i>
                      </button>
                    </th>
                    <th className="small fw-semibold">Contact</th>
                    <th className="small fw-semibold">Address</th>
                    <th className="small fw-semibold">WWS ID</th>
                    <th className="small fw-semibold">
                      <button
                        className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start"
                        onClick={() => handleSort("created_at")}
                        disabled={isActionDisabled()}
                      >
                        Registered
                        <i className={`ms-1 ${getSortIcon("created_at")}`}></i>
                      </button>
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
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span className="small" style={{ color: "var(--text-muted)" }}>
                  Fetching pending approval data...
                </span>
              </div>
            </div>
          ) : currentUsers.length === 0 ? (
            // Empty state
            <div className="text-center py-5">
              <div className="mb-3">
                <i
                  className="fas fa-user-check fa-3x"
                  style={{ color: "var(--text-muted)", opacity: 0.5 }}
                ></i>
              </div>
              <h5 className="mb-2" style={{ color: "var(--text-muted)" }}>
                {pendingUsers.length === 0
                  ? "No Pending Approvals"
                  : "No Matching Results"}
              </h5>
              <p className="mb-3 small" style={{ color: "var(--text-muted)" }}>
                {pendingUsers.length === 0
                  ? "All account approval requests have been processed."
                  : "Try adjusting your search criteria."}
              </p>
              {searchTerm && (
                <button
                  className="btn btn-sm clear-search-main-btn"
                  onClick={() => setSearchTerm("")}
                  disabled={loading || isActionDisabled()}
                >
                  <i className="fas fa-times me-1"></i>
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            // Loaded state with data
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
                        style={{ width: "25%" }}
                        className="small fw-semibold"
                      >
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start"
                          onClick={() => handleSort("name")}
                          disabled={isActionDisabled()}
                          style={{ color: "var(--text-primary)" }}
                        >
                          User Information
                          <i className={`ms-1 ${getSortIcon("name")}`}></i>
                        </button>
                      </th>
                      <th
                        style={{ width: "15%" }}
                        className="small fw-semibold"
                      >
                        Contact
                      </th>
                      <th
                        style={{ width: "20%" }}
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
                    {currentUsers.map((user, index) => (
                      <tr key={user.id} className="align-middle">
                        <td
                          className="text-center fw-bold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {startIndex + index + 1}
                        </td>
<td className="text-center">
  <div className="d-flex justify-content-center gap-1">
    <button
      className="btn btn-info btn-sm text-white"
      onClick={() => handleViewDetails(user)}
      disabled={isActionDisabled(user.id)}
      title="View Details"
      style={{ 
        width: '36px', 
        height: '36px',
        borderRadius: '6px',
        transition: 'all 0.2s ease-in-out'
      }}
      onMouseEnter={(e) => {
        if (!e.target.disabled) {
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'none';
      }}
    >
      {actionLoading === user.id ? (
        <span className="spinner-border spinner-border-sm" role="status"></span>
      ) : (
        <i className="fas fa-eye"></i>
      )}
    </button>

    <button
      className="btn btn-success btn-sm text-white"
      onClick={() => handleApprove(user.id)}
      disabled={isActionDisabled(user.id)}
      title="Approve Account"
      style={{ 
        width: '36px', 
        height: '36px',
        borderRadius: '6px',
        transition: 'all 0.2s ease-in-out'
      }}
      onMouseEnter={(e) => {
        if (!e.target.disabled) {
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'none';
      }}
    >
      {actionLoading === user.id ? (
        <span className="spinner-border spinner-border-sm" role="status"></span>
      ) : (
        <i className="fas fa-check"></i>
      )}
    </button>

    <button
      className="btn btn-danger btn-sm text-white"
      onClick={() => handleReject(user.id, user.name)}
      disabled={isActionDisabled(user.id)}
      title="Reject Account"
      style={{ 
        width: '36px', 
        height: '36px',
        borderRadius: '6px',
        transition: 'all 0.2s ease-in-out'
      }}
      onMouseEnter={(e) => {
        if (!e.target.disabled) {
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'none';
      }}
    >
      {actionLoading === user.id ? (
        <span className="spinner-border spinner-border-sm" role="status"></span>
      ) : (
        <i className="fas fa-times"></i>
      )}
    </button>
  </div>
</td>
                        <td>
                          <div>
                            <div
                              className="fw-medium mb-1"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {user.name}
                            </div>
                            <div
                              className="small text-break"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ color: "var(--text-primary)" }}>
                            {user.contact_number || "Not provided"}
                          </div>
                        </td>
                        <td>
                          <div
                            style={{ color: "var(--text-primary)" }}
                            className="small text-truncate"
                            title={user.address || "Not provided"}
                          >
                            {truncateAddress(user.address)}
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
                            {user.wws_id || "N/A"}
                          </code>
                        </td>
                        <td>
                          <small style={{ color: "var(--text-muted)" }}>
                            {new Date(user.created_at).toLocaleDateString()}
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
          <span className="fw-semibold" style={{ color: "var(--text-primary)" }}>
            {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)}
          </span>{" "}
          of{" "}
          <span className="fw-semibold" style={{ color: "var(--text-primary)" }}>
            {filteredUsers.length}
          </span>{" "}
          pending accounts
        </small>
      </div>

      <div className="d-flex align-items-center gap-2">
        <button
          className="btn btn-sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || isActionDisabled()}
          style={{ 
            transition: 'all 0.2s ease-in-out',
            border: '2px solid var(--primary-color)',
            color: 'var(--primary-color)',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              e.target.style.backgroundColor = 'var(--primary-color)';
              e.target.style.color = 'white';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = 'var(--primary-color)';
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
              pages = Array.from({ length: totalPages }, (_, i) => i + 1);
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
                onClick={() => page !== "..." && setCurrentPage(page)}
                disabled={page === "..." || isActionDisabled()}
                style={{ 
                  transition: 'all 0.2s ease-in-out',
                  border: `2px solid ${currentPage === page ? 'var(--primary-color)' : 'var(--input-border)'}`,
                  color: currentPage === page ? 'white' : 'var(--text-primary)',
                  backgroundColor: currentPage === page ? 'var(--primary-color)' : 'transparent',
                  minWidth: '40px'
                }}
                onMouseEnter={(e) => {
                  if (!e.target.disabled && currentPage !== page) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    e.target.style.backgroundColor = 'var(--primary-light)';
                    e.target.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.target.disabled && currentPage !== page) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = 'var(--text-primary)';
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
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || isActionDisabled()}
          style={{ 
            transition: 'all 0.2s ease-in-out',
            border: '2px solid var(--primary-color)',
            color: 'var(--primary-color)',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              e.target.style.backgroundColor = 'var(--primary-color)';
              e.target.style.color = 'white';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = 'var(--primary-color)';
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
      {showDetailsModal && selectedUser && (
        <Portal>
          <div
            className="modal fade show d-block modal-backdrop-animation"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            tabIndex="-1"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeDetailsModal();
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg mx-3 mx-sm-auto">
              <div
                className="modal-content border-0 modal-content-animation"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
              >
                <div
                  className="modal-header border-0 text-white modal-smooth"
                  style={{ backgroundColor: "#336C35" }}
                >
                  <div>
                    <h5 className="modal-title fw-bold mb-1">
                      <i className="fas fa-user-circle me-2"></i>
                      {selectedUser.name}
                    </h5>
                    <span className="badge bg-warning text-dark">
                      Pending Approval
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white btn-smooth"
                    aria-label="Close"
                    onClick={closeDetailsModal}
                  ></button>
                </div>
                <div
                  className="modal-body bg-light modal-smooth"
                  style={{ maxHeight: "70vh", overflowY: "auto" }}
                >
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <div className="card border-0 bg-white h-100">
                        <div className="card-header bg-transparent border-bottom-0">
                          <h6 className="mb-0 fw-semibold text-dark">
                            <i className="fas fa-id-card me-2 text-primary"></i>
                            Personal Information
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <small className="text-muted">Full Name</small>
                            <p className="mb-0 fw-semibold text-dark">
                              {selectedUser.name}
                            </p>
                          </div>
                          <div className="mb-3">
                            <small className="text-muted">Email</small>
                            <p className="mb-0 fw-semibold text-dark text-break">
                              {selectedUser.email}
                            </p>
                          </div>
                          <div className="mb-3">
                            <small className="text-muted">Contact Number</small>
                            <p className="mb-0 fw-semibold text-dark">
                              {selectedUser.contact_number || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <small className="text-muted">Address</small>
                            <p className="mb-0 fw-semibold text-dark">
                              {selectedUser.address || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="card border-0 bg-white h-100">
                        <div className="card-header bg-transparent border-bottom-0">
                          <h6 className="mb-0 fw-semibold text-dark">
                            <i className="fas fa-clipboard-list me-2 text-success"></i>
                            Registration Details
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <small className="text-muted">WWS ID</small>
                            <p className="mb-0 fw-semibold font-monospace text-dark">
                              {selectedUser.wws_id || "N/A"}
                            </p>
                          </div>
                          <div className="mb-3">
                            <small className="text-muted">Date Registered</small>
                            <p className="mb-0 fw-semibold text-dark">
                              {formatDateTime(selectedUser.created_at)}
                            </p>
                          </div>
                          <div>
                            <small className="text-muted">Current Status</small>
                            <p className="mb-0">
                              <span className="badge bg-warning text-dark">
                                Pending
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="card border-0 bg-white">
                        <div className="card-header bg-transparent border-bottom-0">
                          <h6 className="mb-0 fw-semibold text-dark">
                            <i className="fas fa-info-circle me-2 text-info"></i>
                            Additional Information
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <small className="text-muted">Role Request</small>
                              <p className="mb-0 fw-semibold text-dark">
                                {selectedUser.role || "Client"}
                              </p>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted">Last Updated</small>
                              <p className="mb-0 fw-semibold text-dark">
                                {formatDateTime(selectedUser.updated_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top bg-white modal-smooth">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-smooth"
                    onClick={closeDetailsModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default AccountApprovals;
