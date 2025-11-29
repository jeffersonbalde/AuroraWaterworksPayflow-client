// src/pages/admin_staff/CollectionReports/CollectionReports.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { showAlert, showToast } from "../../../services/notificationService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Portal from "../../../components/Portal";

const CollectionReports = () => {
  const { user: currentUser, token } = useAuth();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    reportType: "monthly",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: "",
    endDate: "",
    reportType: "monthly",
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfExportLoading, setPdfExportLoading] = useState(false);
  const [delinquencyModalOpen, setDelinquencyModalOpen] = useState(false);
  const [delinquencyLoading, setDelinquencyLoading] = useState(false);
  const [delinquencyPdfLoading, setDelinquencyPdfLoading] = useState(false);
  const [delinquencyReportData, setDelinquencyReportData] = useState(() => ({
    asOfDate: "",
    customers: [],
    totalDue: 0,
  }));

  const formatPdfCurrency = useCallback(
    (value) => `PHP ${Number(value || 0).toFixed(2)}`,
    []
  );

  const replacePesoSymbol = (text) =>
    typeof text === "string" ? text.replace(/\u20B1/g, "PHP ") : text;

  useEffect(() => {
    fetchReports(appliedFilters);
  }, [appliedFilters]);

  useEffect(() => {
    filterReports();
  }, [reports, currentPage, itemsPerPage]);

  const fetchReports = async (currentFilters = appliedFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.startDate) {
        params.append("start_date", currentFilters.startDate);
      }
      if (currentFilters.endDate) {
        params.append("end_date", currentFilters.endDate);
      }
      if (currentFilters.reportType) {
        params.append("report_type", currentFilters.reportType);
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_LARAVEL_API
        }/admin/collection-reports?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      } else {
        throw new Error("Failed to fetch collection reports");
      }
    } catch (error) {
      console.error("Error fetching collection reports:", error);
      showAlert.error("Error", "Failed to load collection reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    setFilteredReports(reports);
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const handleClearFilters = () => {
    const reset = { startDate: "", endDate: "", reportType: "monthly" };
    setFilters(reset);
    setAppliedFilters({ ...reset });
  };

  const refreshAllData = async () => {
    await fetchReports();
    showToast.info("Reports refreshed successfully");
  };

  const exportToPDF = () => {
    if (!reports || reports.length === 0) {
      showToast.warning("No data to export. Please generate a report first.");
      return;
    }

    try {
      setPdfExportLoading(true);
      showAlert.loading(
        "Generating PDF",
        "Please wait while we generate your PDF..."
      );

      const doc = new jsPDF();
      const generatedDate = new Date().toLocaleString();
      const startDateText = appliedFilters.startDate
        ? new Date(appliedFilters.startDate).toLocaleDateString()
        : "Earliest Record";
      const endDateText = appliedFilters.endDate
        ? new Date(appliedFilters.endDate).toLocaleDateString()
        : "Latest Record";
      const dateRangeText = `${startDateText} - ${endDateText}`;

      // Title and Header
      doc.setFontSize(16);
      doc.setTextColor(51, 108, 53); // #336C35
      doc.text("COLLECTION REPORT", 105, 15, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Aurora Waterworks System`, 105, 22, { align: "center" });
      doc.text(`Generated on: ${generatedDate}`, 14, 30);
      doc.text(`Period: ${dateRangeText}`, 14, 37);
      const reportTypeLabel = appliedFilters.reportType || "all";
      const formattedReportType =
        reportTypeLabel.charAt(0).toUpperCase() + reportTypeLabel.slice(1);
      doc.text(`Report Type: ${formattedReportType}`, 14, 44);

      let startY = 55;

      // Summary Section
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("SUMMARY", 14, startY);

      const totalCollected = reports.reduce(
        (sum, report) => sum + (report.total_collected || 0),
        0
      );
      const totalCustomers = reports.reduce(
        (sum, report) => sum + (report.total_customers || 0),
        0
      );
      const totalTransactions = reports.reduce(
        (sum, report) => sum + (report.total_transactions || 0),
        0
      );
      const onlineTotal = reports.reduce(
        (sum, report) => sum + (report.online_collections || 0),
        0
      );
      const counterTotal = reports.reduce(
        (sum, report) => sum + (report.counter_collections || 0),
        0
      );
      const totalCubicMeters = reports.reduce(
        (sum, report) => sum + (report.total_cubic_meters || 0),
        0
      );

      const summaryData = [
        ["Total Collected", formatPdfCurrency(totalCollected)],
        ["Total Customers", totalCustomers.toString()],
        ["Total Transactions", totalTransactions.toString()],
        ["Online Collections", formatPdfCurrency(onlineTotal)],
        ["Counter Collections", formatPdfCurrency(counterTotal)],
        ["Total Cubic Meter Used", `${totalCubicMeters.toFixed(2)} m³`],
      ];

      autoTable(doc, {
        startY: startY + 5,
        head: [["Metric", "Value"]],
        body: summaryData,
        theme: "grid",
        headStyles: {
          fillColor: [51, 108, 53],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
        },
      });

      // Reports Table
      startY = doc.lastAutoTable.finalY + 15;
      doc.text("DETAILED REPORTS", 14, startY);

      const tableData = reports.map((report) => [
        report.period,
        formatPdfCurrency(report.total_collected),
        formatPdfCurrency(report.online_collections),
        formatPdfCurrency(report.counter_collections),
        (report.total_customers || 0).toString(),
        Number(report.total_cubic_meters || 0).toFixed(2) + " m³",
      ]);

      autoTable(doc, {
        startY: startY + 5,
        head: [
          [
            "Period",
            "Total Collected",
            "Online Collections",
            "Counter Collections",
            "Customers",
            "Total Cubic Meter Used (m³)",
          ],
        ],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [51, 108, 53],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30, halign: "right" },
          2: { cellWidth: 30, halign: "right" },
          3: { cellWidth: 30, halign: "right" },
          4: { cellWidth: 25, halign: "right" },
          5: { cellWidth: 35, halign: "right" },
        },
      });

      showAlert.close();
      const fileStart = appliedFilters.startDate || "all";
      const fileEnd = appliedFilters.endDate || "latest";
      doc.save(`Collection_Report_${fileStart}_to_${fileEnd}.pdf`);
      showToast.success("PDF exported successfully");
    } catch (error) {
      showAlert.close();
      console.error("PDF export error:", error);
      showToast.error("Failed to export PDF");
    } finally {
      setPdfExportLoading(false);
    }
  };

  const handleExport = async (format = "pdf") => {
    if (format === "pdf") {
      exportToPDF();
      return;
    }

    // For Excel/CSV, fetch from server
    try {
      showAlert.loading(
        "Generating Report",
        "Please wait while we generate your report..."
      );

      const exportParams = new URLSearchParams();
      if (appliedFilters.startDate) {
        exportParams.append("start_date", appliedFilters.startDate);
      }
      if (appliedFilters.endDate) {
        exportParams.append("end_date", appliedFilters.endDate);
      }
      if (appliedFilters.reportType) {
        exportParams.append("report_type", appliedFilters.reportType);
      }
      exportParams.append("format", format);

      const response = await fetch(
        `${
          import.meta.env.VITE_LARAVEL_API
        }/admin/collection-reports/export?${exportParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      showAlert.close();

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        const isSpreadsheet =
          !contentType ||
          contentType.includes("text/csv") ||
          contentType.includes("application/vnd.ms-excel");

        if (!isSpreadsheet) {
          const data = await response.json();
          throw new Error(data.message || "Failed to export report");
        }

        const rawText = await response.text();
        const sanitizedText = replacePesoSymbol(rawText);
        const blob = new Blob([sanitizedText], {
          type:
            contentType ||
            (format === "excel"
              ? "application/vnd.ms-excel"
              : "text/csv;charset=utf-8;"),
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const exportStart = appliedFilters.startDate || "all";
        const exportEnd = appliedFilters.endDate || "latest";
        a.download = `collection-report-${exportStart}-to-${exportEnd}.${
          format === "excel" ? "csv" : format
        }`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showToast.success(
          `Report exported successfully as ${format.toUpperCase()}`
        );
      } else {
        // Try to get error message from response
        let errorMessage = "Failed to export report";
        try {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      showAlert.error(
        "Export Failed",
        error.message || "Failed to export report"
      );
    }
  };

  const generateDelinquencyReport = async () => {
    if (delinquencyLoading) return;

    const asOfDate =
      appliedFilters.endDate || new Date().toISOString().split("T")[0];

    try {
      setDelinquencyLoading(true);

      const response = await fetch(
        `${
          import.meta.env.VITE_LARAVEL_API
        }/admin/delinquency-report?${new URLSearchParams({
          as_of_date: asOfDate,
        }).toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate delinquency report");
      }

      const data = await response.json();
      const customers = data.delinquent_customers || [];

      if (customers.length === 0) {
        showToast.info("No delinquent customers found for the selected date.");
        return;
      }

      setDelinquencyReportData({
        asOfDate: data.as_of_date,
        customers,
        totalDue: data.total_due_amount ?? 0,
      });
      setDelinquencyModalOpen(true);
    } catch (error) {
      console.error("Error generating delinquency report:", error);
      showAlert.error(
        "Report Failed",
        error.message || "Failed to generate delinquency report"
      );
    } finally {
      setDelinquencyLoading(false);
    }
  };

  const handleDelinquencyPdfExport = () => {
    const customers = delinquencyReportData.customers || [];

    if (!customers.length) {
      showToast.warning("No delinquency data available to export.");
      return;
    }

    try {
      setDelinquencyPdfLoading(true);

      const doc = new jsPDF();
      const generatedDate = new Date().toLocaleString();
      const formattedAsOfDate = delinquencyReportData.asOfDate
        ? new Date(delinquencyReportData.asOfDate).toLocaleDateString()
        : "Latest";

      doc.setFontSize(16);
      doc.setTextColor(51, 108, 53);
      doc.text("DELINQUENCY REPORT", 105, 15, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Aurora Waterworks System`, 105, 22, { align: "center" });
      doc.text(`Generated on: ${generatedDate}`, 14, 30);
      doc.text(`As of: ${formattedAsOfDate}`, 14, 37);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("SUMMARY", 14, 48);
      autoTable(doc, {
        startY: 52,
        head: [["Metric", "Value"]],
        body: [
          ["Delinquent Customers", customers.length.toString()],
          [
            "Total Due Amount",
            formatPdfCurrency(delinquencyReportData.totalDue),
          ],
        ],
        theme: "grid",
        headStyles: {
          fillColor: [51, 108, 53],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: { fontSize: 10 },
      });

      const startY = doc.lastAutoTable.finalY + 10;
      doc.text("DETAILED DELINQUENCIES", 14, startY);

      autoTable(doc, {
        startY: startY + 4,
        head: [
          [
            "Name",
            "Meter Reader",
            "Service",
            "Months",
            "Amount / Month",
            "Total Due",
          ],
        ],
        body: customers.map((customer) => [
          customer.name,
          customer.meter_reader || "N/A",
          customer.service || "N/A",
          customer.months_delinquent || 0,
          formatPdfCurrency(customer.amount_per_month),
          formatPdfCurrency(customer.total_due),
        ]),
        theme: "grid",
        headStyles: {
          fillColor: [51, 108, 53],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 18, halign: "right" },
          4: { cellWidth: 30, halign: "right" },
          5: { cellWidth: 30, halign: "right" },
        },
      });

      const filename = `Delinquency_Report_${
        delinquencyReportData.asOfDate || "latest"
      }.pdf`;
      doc.save(filename);
      showToast.success("Delinquency report exported successfully!");
    } catch (error) {
      console.error("Error exporting delinquency report:", error);
      showAlert.error(
        "Export Failed",
        error.message || "Failed to export delinquency report"
      );
    } finally {
      setDelinquencyPdfLoading(false);
    }
  };

  const printDelinquencyNotice = async (customer) => {
    try {
      showAlert.loading("Generating Notice", "Preparing delinquency notice...");

      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/delinquency-notice`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            customer_id: customer.id,
            as_of_date:
              appliedFilters.endDate || new Date().toISOString().split("T")[0],
          }),
        }
      );

      showAlert.close();

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const printWindow = window.open(url, "_blank");

        if (printWindow) {
          printWindow.onload = function () {
            printWindow.print();
          };
        }

        showToast.success("Delinquency notice generated successfully");
      } else {
        throw new Error("Failed to generate delinquency notice");
      }
    } catch (error) {
      console.error("Error printing delinquency notice:", error);
      showAlert.error(
        "Print Failed",
        error.message || "Failed to generate delinquency notice"
      );
    }
  };

  // Calculate statistics
  const totalCollections = reports.reduce(
    (sum, report) => sum + (report.total_collected || 0),
    0
  );
  const totalCustomers = reports.reduce(
    (sum, report) => sum + report.total_customers,
    0
  );
  const totalCubicMeters = reports.reduce(
    (sum, report) => sum + (report.total_cubic_meters || 0),
    0
  );
  const onlineCollections = reports.reduce(
    (sum, report) => sum + report.online_collections,
    0
  );
  const counterCollections = reports.reduce(
    (sum, report) => sum + report.counter_collections,
    0
  );
  const appliedReportTypeLabel = appliedFilters.reportType
    ? appliedFilters.reportType.charAt(0).toUpperCase() +
      appliedFilters.reportType.slice(1)
    : "All";

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = filteredReports.slice(startIndex, endIndex);

  // Skeleton Loader
  const TableRowSkeleton = () => (
    <tr className="align-middle" style={{ height: "70px" }}>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-8" style={{ height: "20px" }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-6" style={{ height: "20px" }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-4" style={{ height: "20px" }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-5" style={{ height: "20px" }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-5" style={{ height: "20px" }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-6" style={{ height: "20px" }}></span>
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
    <>
      <div className="container-fluid px-3 py-2 collection-reports-container fadeIn">
        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
          <div className="flex-grow-1 mb-2 mb-md-0">
            <h1
              className="h4 mb-1 fw-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Collection Reports
            </h1>
            <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
              Generate and view collection reports and analytics
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              className="btn btn-sm btn-success"
              onClick={() => handleExport("pdf")}
              disabled={loading || pdfExportLoading}
            >
              {pdfExportLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1"></span>
                  Generating PDF...
                </>
              ) : (
                <>
                  <i className="fas fa-file-pdf me-1"></i>
                  Export PDF
                </>
              )}
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleExport("excel")}
              disabled={loading}
            >
              <i className="fas fa-file-excel me-1"></i>
              Export Excel
            </button>
            <button
              className="btn btn-sm btn-warning d-flex align-items-center"
              onClick={generateDelinquencyReport}
              disabled={loading || delinquencyLoading}
            >
              {delinquencyLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-exclamation-triangle me-1"></i>
                  Delinquency Report
                </>
              )}
            </button>
            <button
              className="btn btn-sm refresh-btn"
              onClick={refreshAllData}
              disabled={loading}
            >
              <i className="fas fa-sync-alt me-1"></i>
              Refresh
            </button>
          </div>
        </div>

        {/* Report Controls */}
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
                  Report Type
                </label>
                <select
                  className="form-select form-select-sm"
                  value={filters.reportType}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      reportType: e.target.value,
                    }))
                  }
                  disabled={loading}
                  style={{
                    backgroundColor: "var(--input-bg)",
                    borderColor: "var(--input-border)",
                    color: "var(--input-text)",
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="col-md-3">
                <label
                  className="form-label small fw-semibold mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Start Date
                </label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  disabled={loading}
                  style={{
                    backgroundColor: "var(--input-bg)",
                    borderColor: "var(--input-border)",
                    color: "var(--input-text)",
                  }}
                />
              </div>
              <div className="col-md-3">
                <label
                  className="form-label small fw-semibold mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  End Date
                </label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  disabled={loading}
                  style={{
                    backgroundColor: "var(--input-bg)",
                    borderColor: "var(--input-border)",
                    color: "var(--input-text)",
                  }}
                />
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
                  disabled={loading}
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
            <div className="mt-3 d-flex flex-wrap gap-2">
              <button
                className="btn btn-sm btn-primary"
                onClick={handleApplyFilters}
                disabled={loading}
              >
                <i className="fas fa-filter me-1"></i>
                Apply Filters
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={handleClearFilters}
                disabled={loading}
              >
                <i className="fas fa-undo me-1"></i>
                Clear Filters
              </button>
              <div className="ms-auto small text-muted">
                {appliedFilters.startDate || appliedFilters.endDate
                  ? `Filters applied${
                      appliedFilters.startDate
                        ? ` from ${appliedFilters.startDate}`
                        : ""
                    }${
                      appliedFilters.endDate
                        ? ` to ${appliedFilters.endDate}`
                        : ""
                    }`
                  : "Showing all available records"}
              </div>
            </div>
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
                        Total Collections
                      </div>
                      <div
                        className="h4 mb-0 fw-bold"
                        style={{ color: "var(--primary-color)" }}
                      >
                        ₱{totalCollections.toFixed(2)}
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
                        Online Collections
                      </div>
                      <div
                        className="h4 mb-0 fw-bold"
                        style={{ color: "var(--info-color)" }}
                      >
                        ₱{onlineCollections.toFixed(2)}
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
                        Counter Collections
                      </div>
                      <div
                        className="h4 mb-0 fw-bold"
                        style={{ color: "var(--primary-color)" }}
                      >
                        ₱{counterCollections.toFixed(2)}
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
                        Total Cubic Meter Used
                      </div>
                      <div
                        className="h4 mb-0 fw-bold"
                        style={{ color: "var(--success-color)" }}
                      >
                        {totalCubicMeters.toFixed(2)} m³
                      </div>
                    </div>
                    <div className="col-auto">
                      <i
                        className="fas fa-chart-line fa-2x"
                        style={{ color: "var(--success-light)", opacity: 0.7 }}
                      ></i>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                <i className="fas fa-file-alt me-2"></i>
                Collection Reports
                {!loading && (
                  <small className="opacity-75 ms-2">
                    ({filteredReports.length} reports • {appliedReportTypeLabel}{" "}
                    period)
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
                      <th className="small fw-semibold">Period</th>
                      <th className="small fw-semibold">Total Collected</th>
                      <th className="small fw-semibold">Online</th>
                      <th className="small fw-semibold">Counter</th>
                      <th className="small fw-semibold">Customers</th>
                      <th className="small fw-semibold">Avg. per Customer</th>
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
                  <span
                    className="small"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Generating collection reports...
                  </span>
                </div>
              </div>
            ) : currentReports.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-3">
                  <i
                    className="fas fa-file-alt fa-3x"
                    style={{ color: "var(--text-muted)", opacity: 0.5 }}
                  ></i>
                </div>
                <h5 className="mb-2" style={{ color: "var(--text-muted)" }}>
                  No Reports Found
                </h5>
                <p
                  className="mb-3 small"
                  style={{ color: "var(--text-muted)" }}
                >
                  No collection reports found for the selected date range and
                  report type.
                </p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead
                      style={{ backgroundColor: "var(--background-light)" }}
                    >
                      <tr>
                        <th className="small fw-semibold">Period</th>
                        <th className="small fw-semibold">Total Collected</th>
                        <th className="small fw-semibold">Online</th>
                        <th className="small fw-semibold">Counter</th>
                        <th className="small fw-semibold">Customers</th>
                        <th className="small fw-semibold">Total Cubic Meter Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentReports.map((report, index) => (
                        <tr key={report.period} className="align-middle">
                          <td>
                            <div style={{ color: "var(--text-primary)" }}>
                              <div className="fw-medium">{report.period}</div>
                            </div>
                          </td>
                          <td>
                            <div className="fw-bold text-success">
                              ₱{report.total_collected.toFixed(2)}
                            </div>
                          </td>
                          <td>
                            <div style={{ color: "var(--text-primary)" }}>
                              <div>₱{report.online_collections.toFixed(2)}</div>
                              <div className="small text-muted">
                                {report.total_collected > 0
                                  ? `${(
                                      (report.online_collections /
                                        report.total_collected) *
                                      100
                                    ).toFixed(1)}%`
                                  : "0%"}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ color: "var(--text-primary)" }}>
                              <div>
                                ₱{report.counter_collections.toFixed(2)}
                              </div>
                              <div className="small text-muted">
                                {report.total_collected > 0
                                  ? `${(
                                      (report.counter_collections /
                                        report.total_collected) *
                                      100
                                    ).toFixed(1)}%`
                                  : "0%"}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ color: "var(--text-primary)" }}>
                              <div className="fw-medium">
                                {report.total_customers}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ color: "var(--text-primary)" }}>
                              <div className="fw-medium">
                                {Number(report.total_cubic_meters || 0).toFixed(2)} m³
                              </div>
                            </div>
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
                            {Math.min(endIndex, filteredReports.length)}
                          </span>{" "}
                          of{" "}
                          <span
                            className="fw-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {filteredReports.length}
                          </span>{" "}
                          reports
                        </small>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <button
                          className="btn btn-sm pagination-btn"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
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
                              let end = Math.min(
                                totalPages - 1,
                                currentPage + 1
                              );

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
                                className={`btn btn-sm pagination-page-btn ${
                                  page === "..."
                                    ? "disabled"
                                    : currentPage === page
                                    ? "active"
                                    : ""
                                }`}
                                onClick={() =>
                                  page !== "..." && setCurrentPage(page)
                                }
                                disabled={page === "..."}
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
                          className="btn btn-sm pagination-btn"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
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
      </div>

      <DelinquencyReportModal
        isOpen={delinquencyModalOpen}
        onClose={() => setDelinquencyModalOpen(false)}
        report={delinquencyReportData}
        onExportPdf={handleDelinquencyPdfExport}
        exportLoading={delinquencyPdfLoading}
      />
    </>
  );
};

const DelinquencyReportModal = ({
  isOpen,
  onClose,
  report,
  onExportPdf,
  exportLoading,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const closeModal = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, closeModal]);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const customers = report?.customers || [];

  const formatCurrency = (value = 0) =>
    `₱${Number(value || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (value) => {
    if (!value) return "Latest";
    try {
      return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return value;
    }
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  };

  return (
    <Portal>
      <div
        className={`modal fade show d-block modal-backdrop-animation ${
          isClosing ? "exit" : ""
        }`}
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        onClick={handleBackdropClick}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl mx-3 mx-sm-auto">
          <div
            className={`modal-content border-0 modal-content-animation ${
              isClosing ? "exit" : ""
            }`}
            style={{
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div
              className="modal-header border-0 text-white flex-column flex-md-row align-items-start align-items-md-center gap-3"
              style={{
                backgroundColor: "var(--primary-color)",
                flexWrap: "wrap",
              }}
            >
              <div className="flex-grow-1">
                <h5 className="modal-title fw-bold mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Delinquency Report
                </h5>
                <small className="text-white-50">
                  As of {formatDate(report?.asOfDate)}
                </small>
              </div>
              <div className="d-flex flex-wrap gap-2 align-items-center ms-md-auto">
                <button
                  className="btn btn-sm btn-light text-primary border-0 fw-semibold"
                  onClick={onExportPdf}
                  disabled={exportLoading || !customers.length}
                >
                  {exportLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Preparing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-file-pdf me-1"></i>
                      Export PDF
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
            </div>

            <div
              className="modal-body bg-light"
              style={{ maxHeight: "75vh", overflowY: "auto" }}
            >
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex flex-column">
                        <span className="text-muted text-uppercase small">
                          Total Delinquent Customers
                        </span>
                        <span
                          className="display-6 fw-bold"
                          style={{ color: "var(--primary-color)" }}
                        >
                          {customers.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex flex-column">
                        <span className="text-muted text-uppercase small">
                          Total Due Amount
                        </span>
                        <span
                          className="display-6 fw-bold"
                          style={{ color: "var(--primary-color)" }}
                        >
                          {formatCurrency(report?.totalDue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover align-middle mb-0">
                      <thead className="table-light text-uppercase small">
                        <tr>
                          <th>Name</th>
                          <th>Meter Reader</th>
                          <th>Service</th>
                          <th className="text-center">Months</th>
                          <th className="text-end">Amount / Month</th>
                          <th className="text-end">Total Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.length === 0 ? (
                          <tr>
                            <td
                              colSpan="6"
                              className="text-center text-muted py-4"
                            >
                              No delinquent customers found for this period.
                            </td>
                          </tr>
                        ) : (
                          customers.map((customer, index) => (
                            <tr key={customer.id ?? index}>
                              <td className="fw-semibold">{customer.name}</td>
                              <td>{customer.meter_reader || "N/A"}</td>
                              <td className="text-capitalize">
                                {customer.service?.toLowerCase() || "N/A"}
                              </td>
                              <td className="text-center">
                                {customer.months_delinquent || 0}
                              </td>
                              <td className="text-end text-muted">
                                {formatCurrency(customer.amount_per_month)}
                              </td>
                              <td
                                className="text-end fw-bold"
                                style={{ color: "var(--primary-color)" }}
                              >
                                {formatCurrency(customer.total_due)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default CollectionReports;
