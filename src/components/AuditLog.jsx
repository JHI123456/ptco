import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  Clock,
  MapPin,
  Building2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import "./AuditLog.css";
import { fetchAuditLogs, recordClientAuditLog } from "../services/api";

const NUEVA_VIZCAYA_LGUS = [
  "All Municipalities",
  "Provincial",
  "Alfonso Castañeda",
  "Ambaguio",
  "Aritao",
  "Bagabag",
  "Bambang",
  "Bayombong",
  "Diadi",
  "Dupax del Norte",
  "Dupax del Sur",
  "Kasibu",
  "Kayapa",
  "Quezon",
  "Santa Fe",
  "Solano",
  "Villaverde",
];

const ACTION_OPTIONS = [
  { value: "All", label: "All Actions" },
  { value: "USER_LOGIN", label: "User Logins" },
  { value: "SUBMIT_FORM", label: "Form Submissions" },
  { value: "VISITOR_CHECKIN", label: "Visitor Check-ins" },
  { value: "REGISTER_ESTABLISHMENT", label: "Establishment Registrations" },
  { value: "REGISTER_MUNICIPAL", label: "Municipal Registrations" },
  { value: "EXPORT_REPORT", label: "Report Exports" },
];

const AuditLog = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalLogins: 0,
    totalSubmissions: 0,
    totalSecurityAlerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("All Municipalities");
  const [selectedAction, setSelectedAction] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch logs with current filters
  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const muniParam = selectedMunicipality === "All Municipalities" ? "" : selectedMunicipality;
      const res = await fetchAuditLogs({
        page,
        limit,
        search: searchQuery,
        municipality: muniParam,
        action: selectedAction === "All" ? "" : selectedAction,
        status: selectedStatus === "All" ? "" : selectedStatus,
      });

      if (res?.success && Array.isArray(res.data)) {
        setLogs(res.data);
        if (res.stats) setStats(res.stats);
        if (res.pagination) {
          setTotalPages(res.pagination.pages || 1);
          setTotalCount(res.pagination.total || 0);
        }
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.warn("Failed to load audit logs:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, selectedMunicipality, selectedAction, selectedStatus]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Format timestamp nicely
  const formatTimestamp = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Get action styling badge
  const getActionBadge = (action) => {
    switch (action) {
      case "USER_LOGIN":
        return { label: "SIGN IN", className: "badge-action-login" };
      case "USER_LOGOUT":
        return { label: "SIGN OUT", className: "badge-action-logout" };
      case "SUBMIT_FORM":
        return { label: "FORM SUBMISSION", className: "badge-action-form" };
      case "VISITOR_CHECKIN":
        return { label: "VISITOR CHECK-IN", className: "badge-action-checkin" };
      case "REGISTER_ESTABLISHMENT":
        return { label: "ESTABLISHMENT REG", className: "badge-action-est" };
      case "REGISTER_MUNICIPAL":
        return { label: "MUNICIPAL REG", className: "badge-action-muni" };
      case "EXPORT_REPORT":
        return { label: "REPORT EXPORT", className: "badge-action-export" };
      default:
        return { label: action.replace(/_/g, " "), className: "badge-action-default" };
    }
  };

  // Export audit logs as CSV for official COA/PTCAO audit documentation
  const handleExportCSV = () => {
    if (!logs || logs.length === 0) {
      alert("No audit logs available to export.");
      return;
    }

    // CSV header row
    const headers = ["Timestamp", "User Name", "Email", "Role", "Municipality", "Action", "Module", "Details", "Status", "IP Address"];
    const rows = logs.map((l) => [
      `"${formatTimestamp(l.timestamp)}"`,
      `"${(l.userName || "").replace(/"/g, '""')}"`,
      `"${(l.userEmail || "").replace(/"/g, '""')}"`,
      `"${(l.role || "").replace(/"/g, '""')}"`,
      `"${(l.municipality || "").replace(/"/g, '""')}"`,
      `"${(l.action || "").replace(/"/g, '""')}"`,
      `"${(l.module || "").replace(/"/g, '""')}"`,
      `"${(l.details || "").replace(/"/g, '""')}"`,
      `"${(l.status || "").replace(/"/g, '""')}"`,
      `"${(l.ipAddress || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const todayStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `TurismoTrack_Audit_Logs_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Record audit event for the export itself
    recordClientAuditLog({
      user,
      action: "EXPORT_REPORT",
      module: "Audit Trail",
      details: `Exported ${logs.length} audit trail records to CSV report`,
      status: "Success",
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedMunicipality("All Municipalities");
    setSelectedAction("All");
    setSelectedStatus("All");
    setPage(1);
  };

  return (
    <div className="audit-log-page">
      {/* HEADER */}
      <div className="audit-header">
        <div className="audit-title-block">
          <div className="audit-icon-wrap">
            <ShieldCheck size={28} className="shield-icon" />
          </div>
          <div>
            <h1>Official Audit & Activity Trail</h1>
            <p>Comprehensive system event records, authentication logs, and compliance verification for Nueva Vizcaya Tourism</p>
          </div>
        </div>

        <div className="audit-actions">
          <button
            className="audit-btn audit-btn-refresh"
            onClick={loadLogs}
            disabled={loading}
            title="Refresh latest audit records"
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            className="audit-btn audit-btn-export"
            onClick={handleExportCSV}
            title="Download official CSV audit trail"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="audit-kpi-grid">
        <div className="audit-kpi-card">
          <div className="kpi-icon-wrap bg-green">
            <Layers size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">TOTAL LOGGED EVENTS</span>
            <strong className="kpi-value">{stats.totalEvents.toLocaleString()}</strong>
            <small>Immutable audit records</small>
          </div>
        </div>

        <div className="audit-kpi-card">
          <div className="kpi-icon-wrap bg-blue">
            <User size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">AUTHENTICATIONS</span>
            <strong className="kpi-value">{stats.totalLogins.toLocaleString()}</strong>
            <small>Active officer & business logins</small>
          </div>
        </div>

        <div className="audit-kpi-card">
          <div className="kpi-icon-wrap bg-purple">
            <FileText size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">FILINGS & SUBMISSIONS</span>
            <strong className="kpi-value">{stats.totalSubmissions.toLocaleString()}</strong>
            <small>Reports & visitor logs filed</small>
          </div>
        </div>

        <div className="audit-kpi-card">
          <div className="kpi-icon-wrap bg-amber">
            <AlertTriangle size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">SECURITY ALERTS</span>
            <strong className="kpi-value" style={{ color: stats.totalSecurityAlerts > 0 ? "#dc2626" : "#166534" }}>
              {stats.totalSecurityAlerts}
            </strong>
            <small>{stats.totalSecurityAlerts > 0 ? "Flagged attempts recorded" : "Zero unauthorized alerts"}</small>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS TOOLBAR */}
      <div className="audit-toolbar">
        <div className="audit-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by user, email, action, or keyword..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        <div className="audit-filters-group">
          {/* Municipality Dropdown */}
          <div className="audit-select-wrap">
            <MapPin size={15} className="select-icon" />
            <select
              value={selectedMunicipality}
              onChange={(e) => {
                setSelectedMunicipality(e.target.value);
                setPage(1);
              }}
            >
              {NUEVA_VIZCAYA_LGUS.map((muni) => (
                <option key={muni} value={muni}>
                  {muni}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div className="audit-select-wrap">
            <Filter size={15} className="select-icon" />
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setPage(1);
              }}
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="audit-select-wrap">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Success">Success Only</option>
              <option value="Failed">Failed Attempts</option>
              <option value="Warning">Warnings</option>
            </select>
          </div>

          {/* Reset button */}
          {(searchQuery || selectedMunicipality !== "All Municipalities" || selectedAction !== "All" || selectedStatus !== "All") && (
            <button className="audit-btn-reset" onClick={handleResetFilters}>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* AUDIT TABLE */}
      <div className="audit-table-card">
        <div className="table-header-meta">
          <span>
            Showing <strong>{logs.length}</strong> of <strong>{totalCount}</strong> recorded events
          </span>
          <span className="live-indicator">
            <span className="live-dot" /> Live Audit Trail
          </span>
        </div>

        <div className="audit-table-responsive">
          <table className="audit-table">
            <thead>
              <tr>
                <th style={{ width: "170px" }}>Date & Time</th>
                <th style={{ width: "230px" }}>Actor / Account</th>
                <th style={{ width: "130px" }}>Municipality</th>
                <th style={{ width: "160px" }}>Action</th>
                <th>Activity Description</th>
                <th style={{ width: "110px", textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-state-cell">
                    <div className="table-spinner">
                      <RefreshCw size={24} className="spin" />
                      <span>Loading audit records...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-state-cell">
                    <div className="empty-state">
                      <ShieldCheck size={42} className="empty-icon" />
                      <h4>No audit records found</h4>
                      <p>
                        {searchQuery || selectedMunicipality !== "All Municipalities" || selectedAction !== "All"
                          ? "No events match the selected filters. Try broadening your search or resetting filters."
                          : "Audit logging is actively running. Activities like logins, check-ins, and filings will appear here automatically."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const isSuccess = log.status === "Success";
                  return (
                    <tr key={log._id || log.id || Math.random()} className="audit-row">
                      {/* Timestamp */}
                      <td className="cell-time">
                        <div className="timestamp-group">
                          <Clock size={13} className="time-icon" />
                          <span>{formatTimestamp(log.timestamp)}</span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td>
                        <div className="actor-cell">
                          <div className="actor-avatar">
                            {(log.userName || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="actor-meta">
                            <div className="actor-name" title={log.userName}>
                              {log.userName}
                            </div>
                            <div className="actor-sub">
                              <span className="actor-role">{log.role}</span>
                              <span className="actor-email">{log.userEmail}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Municipality */}
                      <td>
                        <span className="badge-municipality">
                          {log.municipality || "Provincial"}
                        </span>
                      </td>

                      {/* Action Pill */}
                      <td>
                        <span className={`badge-action ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="cell-details">
                        <div className="details-text">{log.details}</div>
                        {log.ipAddress && log.ipAddress !== "127.0.0.1" && (
                          <div className="details-ip">IP: {log.ipAddress}</div>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: "center" }}>
                        <span className={`badge-status ${isSuccess ? "status-success" : "status-failed"}`}>
                          {isSuccess ? (
                            <>
                              <CheckCircle2 size={12} />
                              <span>Success</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={12} />
                              <span>{log.status || "Failed"}</span>
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="audit-pagination">
            <button
              className="page-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="page-info">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              className="page-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;

