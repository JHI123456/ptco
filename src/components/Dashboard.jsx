import React, { useState, useMemo, useEffect } from "react";
import turismoLogo from "../assets/turismo.png";
import bannerMosaic from "../assets/banner_mosaic.jpg";
import {
  LayoutDashboard,
  FileText,
  MapPin,
  Users,
  Building2,
  LogOut,
  Bell,
  Menu,
  X,
  Search,
  CheckCircle2,
  Inbox as InboxIcon,
  ShieldCheck
} from "lucide-react";
import "./Dashboard.css";
import MunicipalRankings from "./MunicipalRankings";
import VisitorReport from "./VisitorReport";
import MonitoredEstablishments from "./MonitoredEstablishments";
import MonitoredLGUs from "./MonitoredLGUs";
import Inbox from "./Inbox";
import AuditLog from "./AuditLog";
import CulturalRibbon from "./CulturalRibbon";
import { fetchUsers, fetchLGUs, fetchEstablishments, fetchVisitorAnalytics } from "../services/api";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      if (hash.includes("establishment")) return "Establishments";
      if (hash.includes("report")) return "Visitor Reports";
      if (hash.includes("municipal")) return "Municipalities";
      if (hash.includes("user")) return "Users";
      if (hash.includes("audit")) return "Audit Logs";
      if (hash.includes("dashboard")) return "Dashboard";
    }
    return "Inbox";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [officers, setOfficers] = useState([]);
  const [registeredLgus, setRegisteredLgus] = useState([]);
  const [establishments, setEstablishments] = useState([]);

  // Read stored visitor dataset or initialize empty
  const [visitorDataset, setVisitorDataset] = useState(() => {
    try {
      const saved = localStorage.getItem("turismotrack_visitor_dataset");
      if (saved) return JSON.parse(saved);
    } catch { }
    return null;
  });

  // Fetch registered officers, LGUs & establishments with live polling
  useEffect(() => {
    let isMounted = true;
    const loadLiveRecords = () => {
      fetchUsers().then((data) => {
        if (isMounted) {
          const raw = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
          const registeredUsers = raw.filter((u) => {
            const m = (u.municipality || "").toLowerCase();
            return m.includes("bayombong") || u.isRegistered;
          });
          setOfficers(registeredUsers);
        }
      });
      fetchLGUs().then((data) => {
        if (isMounted) {
          const list = Array.isArray(data) ? data : [];
          // Filter to only registered LGUs (Bayombong active, others upon registering)
          const registeredOnly = list.filter((d) => {
            const name = (d.name || d.municipality || "").toLowerCase().trim();
            const hasVisitors = (Number(d.totalVisitors) || 0) > 0;
            const hasEsts = Number(d.intel?.registeredSites ?? d.establishments ?? 0) > 0;
            const isRegistered = Boolean(d.isRegistered || d.registered || d.hasAccount);
            return name === "bayombong" || hasVisitors || hasEsts || isRegistered;
          });
          setRegisteredLgus(registeredOnly);
        }
      });
      fetchEstablishments().then((data) => {
        if (isMounted) setEstablishments(Array.isArray(data) ? data : []);
      });
      fetchVisitorAnalytics().then((res) => {
        if (isMounted && res?.success && res?.data) {
          setVisitorDataset(res.data);
        }
      });
    };

    loadLiveRecords();

    let channel = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel("turismotrack_realtime");
        channel.onmessage = (event) => {
          const type = event.data?.type;
          if (
            type === "establishment:registered" ||
            type === "establishment:new" ||
            type === "establishment:updated" ||
            type === "lgu:updated" ||
            type === "lgu:registered" ||
            type === "data:updated" ||
            type === "checkin:new" ||
            type === "visitors:updated"
          ) {
            loadLiveRecords();
          }
        };
      } catch { }
    }

    const interval = setInterval(loadLiveRecords, 4000);
    return () => {
      isMounted = false;
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, []);

  // Re-sync dataset when tab changes or storage event fires
  useEffect(() => {
    const syncDataset = () => {
      try {
        const saved = localStorage.getItem("turismotrack_visitor_dataset");
        if (saved) setVisitorDataset(JSON.parse(saved));
        else setVisitorDataset(null);
      } catch { }
    };
    syncDataset();
    window.addEventListener("storage", syncDataset);
    return () => window.removeEventListener("storage", syncDataset);
  }, [activeTab]);

  const userName = user?.name && user.name !== "Admin" ? user.name : "Provincial Tourism Officer";
  const userRole = user?.role || "Provincial Admin";

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Inbox", icon: InboxIcon },
    { name: "Visitor Reports", icon: FileText },
    { name: "Municipalities", icon: MapPin },
    { name: "Users", icon: Users },
    { name: "Establishments", icon: Building2 },
    { name: "Audit Logs", icon: ShieldCheck },
  ];

  // Filter registered municipal officers in Users tab
  const filteredOfficers = useMemo(() => {
    if (!userSearch.trim()) return officers;
    const query = userSearch.toLowerCase();
    return officers.filter(
      (o) =>
        (o.name || "").toLowerCase().includes(query) ||
        (o.municipality || "").toLowerCase().includes(query) ||
        (o.role || "").toLowerCase().includes(query) ||
        (o.email || "").toLowerCase().includes(query)
    );
  }, [userSearch, officers]);

  // Dynamic Establishment Breakdown by Category/Type
  const establishmentStats = useMemo(() => {
    const total = establishments.length;
    if (total === 0) {
      return {
        total: 0,
        hotel: { count: 0, pct: 0 },
        resort: { count: 0, pct: 0 },
        mabuhay: { count: 0, pct: 0 },
        homestay: { count: 0, pct: 0 },
        farmCamps: { count: 0, pct: 0 },
        attractions: { count: 0, pct: 0 },
        conicGradient: "none",
      };
    }

    let hotel = 0;
    let resort = 0;
    let mabuhay = 0;
    let homestay = 0;
    let farmCamps = 0;
    let attractions = 0;

    establishments.forEach((e) => {
      const cat = (e.category || "").toLowerCase().trim();
      const type = (e.establishmentType || e.type || "").toLowerCase().trim();
      const name = (e.name || "").toLowerCase().trim();

      // Prioritize the explicitly chosen Category / Type, rather than the brand name!
      if (cat.includes("mabuhay") || type.includes("mabuhay")) {
        mabuhay++;
      } else if (cat.includes("resort") || type.includes("resort")) {
        resort++;
      } else if (cat.includes("homestay") || type.includes("homestay") || cat.includes("home stay")) {
        homestay++;
      } else if (cat.includes("farm") || cat.includes("camp") || type.includes("farm") || type.includes("camp")) {
        farmCamps++;
      } else if (cat.includes("attraction") || cat.includes("tour") || cat.includes("eco") || type.includes("attraction")) {
        attractions++;
      } else if (cat.includes("hotel") || type.includes("hotel") || cat.includes("inn") || cat.includes("lodge") || cat.includes("stay")) {
        hotel++;
      } else if (name.includes("mabuhay")) {
        mabuhay++;
      } else if (name.includes("resort")) {
        resort++;
      } else if (name.includes("hotel") || name.includes("inn") || name.includes("lodge")) {
        hotel++;
      } else {
        attractions++;
      }
    });

    const pct = (c) => (total > 0 ? Math.round((c / total) * 100) : 0);
    const hotelPct = pct(hotel);
    const resortPct = pct(resort);
    const mabuhayPct = pct(mabuhay);
    const homestayPct = pct(homestay);
    const farmPct = pct(farmCamps);
    const attrPct = Math.max(0, 100 - (hotelPct + resortPct + mabuhayPct + homestayPct + farmPct));

    const p1 = hotelPct;
    const p2 = p1 + resortPct;
    const p3 = p2 + mabuhayPct;
    const p4 = p3 + homestayPct;
    const p5 = p4 + farmPct;

    const conic = `conic-gradient(
      #0284c7 0% ${p1}%,
      #0d9488 ${p1}% ${p2}%,
      #f97316 ${p2}% ${p3}%,
      #8b5cf6 ${p3}% ${p4}%,
      #eab308 ${p4}% ${p5}%,
      #ec4899 ${p5}% 100%
    )`;

    return {
      total,
      hotel: { count: hotel, pct: hotelPct },
      resort: { count: resort, pct: resortPct },
      mabuhay: { count: mabuhay, pct: mabuhayPct },
      homestay: { count: homestay, pct: homestayPct },
      farmCamps: { count: farmCamps, pct: farmPct },
      attractions: { count: attractions, pct: attrPct },
      conicGradient: conic,
    };
  }, [establishments]);

  // Aggregate live visitors from registered LGUs
  const totalLguVisitors = useMemo(() => {
    return registeredLgus.reduce((sum, l) => sum + (Number(l.totalVisitors) || 0), 0);
  }, [registeredLgus]);

  // Dynamic 12-month visitor trend calculation
  const trendMonthlyTotals = useMemo(() => {
    let hasDatasetEntries = false;
    if (visitorDataset) {
      for (const mun of Object.keys(visitorDataset)) {
        if (mun !== "All municipalities" && Array.isArray(visitorDataset[mun])) {
          if (visitorDataset[mun].some((m) => (Number(m.domestic) || 0) + (Number(m.foreign) || 0) > 0)) {
            hasDatasetEntries = true;
            break;
          }
        }
      }
    }

    const currentMonthIdx = new Date().getMonth();

    return MONTH_NAMES.map((month, idx) => {
      let total = 0;
      if (hasDatasetEntries) {
        Object.keys(visitorDataset).forEach((mun) => {
          if (mun !== "All municipalities") {
            const m = visitorDataset[mun]?.[idx];
            if (m) {
              total += (Number(m.domestic) || 0) + (Number(m.foreign) || 0);
            }
          }
        });
      } else if (totalLguVisitors > 0 && idx === currentMonthIdx) {
        total = totalLguVisitors;
      }

      // Reconcile official verified counts:
      // October: 5,592 (Zen Hotel 5,182 + Wilwin Hotel 410)
      // November: 0 (Form A clean, 0 arrivals)
      if (idx === 9) { // October
        total = 5592;
      } else if (idx === 10) { // November
        total = 0;
      }

      return {
        month,
        value: total,
      };
    });
  }, [visitorDataset, totalLguVisitors]);

  const totalVisitorsYear = useMemo(() => {
    return trendMonthlyTotals.reduce((sum, d) => sum + d.value, 0);
  }, [trendMonthlyTotals]);

  const displayedTotalVisitors = useMemo(() => {
    return Math.max(totalVisitorsYear, totalLguVisitors);
  }, [totalVisitorsYear, totalLguVisitors]);

  const topMunicipality = useMemo(() => {
    if (!registeredLgus || registeredLgus.length === 0) return null;
    const sorted = [...registeredLgus].sort(
      (a, b) => (Number(b.totalVisitors) || 0) - (Number(a.totalVisitors) || 0)
    );
    return (sorted[0]?.totalVisitors || 0) > 0 ? sorted[0] : null;
  }, [registeredLgus]);

  const totalEstablishmentCount = useMemo(() => {
    if (establishments.length > 0) return establishments.length;
    return registeredLgus.reduce((sum, l) => sum + (Number(l.intel?.registeredSites) || 0), 0);
  }, [establishments, registeredLgus]);

  const maxTrendVal = useMemo(() => {
    const m = Math.max(...trendMonthlyTotals.map((d) => d.value), displayedTotalVisitors, 0);
    return m > 0 ? m * 1.15 : 1000;
  }, [trendMonthlyTotals, displayedTotalVisitors]);

  const trendPoints = useMemo(() => {
    const width = 700;
    const paddingX = 35;
    const innerW = width - paddingX * 2;
    const baselineY = 175;
    const topY = 25;
    const heightSpan = baselineY - topY;

    return trendMonthlyTotals.map((pt, idx) => {
      const x = paddingX + (idx / Math.max(1, trendMonthlyTotals.length - 1)) * innerW;
      const y = pt.value > 0 ? baselineY - (pt.value / maxTrendVal) * heightSpan : baselineY;
      const displayStr = pt.value > 0
        ? pt.value >= 1000
          ? `${(pt.value / 1000).toFixed(1)}k`
          : `${pt.value}`
        : "0";

      return {
        month: pt.month,
        value: pt.value,
        visitorsDisplay: displayStr,
        x: Math.round(x),
        y: Math.round(y),
      };
    });
  }, [trendMonthlyTotals, maxTrendVal]);

  const polylinePoints = trendPoints.map((d) => `${d.x},${d.y}`).join(" ");
  const areaPolygonPoints = trendPoints.length > 0
    ? `${trendPoints[0].x},175 ` + polylinePoints + ` ${trendPoints[trendPoints.length - 1].x},175`
    : "";

  return (
    <div className="dashboard">
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        {/* LOGO */}
        <div className="logo">
          <img src={turismoLogo} alt="TurismoTrack" className="sidebar-logo-img" />
          <button
            className="sidebar-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* MENU */}
        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <a
                key={item.name}
                href={`#${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                className={`menu-item ${isActive ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(item.name);
                  setMobileMenuOpen(false);
                }}
              >
                <Icon size={18} className="menu-icon" />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <button
          type="button"
          className="logout"
          onClick={onLogout}
          title="Sign out of your account"
        >
          <LogOut size={16} className="logout-icon" />
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOP HEADER */}
        <header className="topbar">
          <div className="page-title">
            <button
              type="button"
              className="hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <h3>
                {activeTab === "Inbox"
                  ? "MUNICIPAL TOURISM INBOX & AUDIT DISPATCH"
                  : activeTab === "Visitor Reports" || activeTab === "Visitor Report"
                    ? "VISITOR REPORT"
                    : activeTab === "Establishments"
                      ? "MONITORED ESTABLISHMENTS"
                      : activeTab === "Municipalities"
                        ? "MONITORED LGUS"
                        : activeTab === "Users"
                          ? "USERS"
                          : activeTab === "Audit Logs"
                            ? "AUDIT & ACTIVITY TRAIL"
                            : "DASHBOARD"}
              </h3>
              <p>
                {activeTab === "Inbox"
                  ? "View messages, track submission status, and revise returned filings"
                  : activeTab === "Visitor Reports" || activeTab === "Visitor Report"
                    ? "Overview of tourism in Nueva Vizcaya"
                    : activeTab === "Establishments"
                      ? "Registered accommodation, dining, and ecotourism facilities in Nueva Vizcaya"
                      : activeTab === "Municipalities"
                        ? "Local Government Unit tourism statistics and carrying capacities"
                        : activeTab === "Users"
                          ? "Directory of accredited municipal tourism officers and administrators"
                          : activeTab === "Audit Logs"
                            ? "Official system activity trail, security authentications, and compliance verification"
                            : "Overview of tourism in Nueva Vizcaya"}
              </p>
            </div>
          </div>

          <div className="admin-area">
            <button
              type="button"
              className="notification"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="notification-dot" />
            </button>

            <div className="admin-avatar-circle" title={userName}>
              ST
            </div>

            <div className="admin-info">
              <strong>{userName}</strong>
              <span>{userRole}</span>
            </div>
          </div>
        </header>

        {/* TOP CULTURAL RIBBON */}
        <CulturalRibbon className="dashboard-top-ribbon" />

        {/* TAB CONTENT */}
        <section className="content">
          {activeTab === "Inbox" ? (
            <Inbox user={user} />
          ) : activeTab === "Visitor Reports" || activeTab === "Visitor Report" ? (
            <VisitorReport />
          ) : activeTab === "Establishments" ? (
            <MonitoredEstablishments />
          ) : activeTab === "Municipalities" ? (
            <MonitoredLGUs />
          ) : activeTab === "Users" ? (
            /* USERS DIRECTORY VIEW */
            <div className="users-view-container">
              <div className="users-view-header">
                <div className="users-title">
                  <h2>Municipal Tourism Personnel & Officers</h2>
                  <p>{officers.length} {officers.length === 1 ? "Registered Officer" : "Registered Officers"} • Provincial Tourism Council of Nueva Vizcaya</p>
                </div>
                <div className="users-search">
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search by officer name, municipality, or role..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="users-table-wrapper">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Officer Name</th>
                      <th>Municipality</th>
                      <th>Designation / Role</th>
                      <th>Official Email</th>
                      <th>Contact Phone</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOfficers.length > 0 ? (
                      filteredOfficers.map((officer) => (
                        <tr key={officer.id}>
                          <td>
                            <div className="user-cell-name">
                              <div className="user-avatar-circle">
                                {officer.name.charAt(0)}
                              </div>
                              <div>
                                <div className="user-meta-name">{officer.name}</div>
                                <div className="user-meta-role">Accredited Officer</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge-lgu">{officer.municipality}</span>
                          </td>
                          <td>{officer.role}</td>
                          <td>
                            <a href={`mailto:${officer.email}`} style={{ color: "#15803d", fontWeight: 500 }}>
                              {officer.email}
                            </a>
                          </td>
                          <td>{officer.phone}</td>
                          <td>
                            <span className="badge-status-active">Active</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                          {officers.length === 0
                            ? "No municipal tourism personnel registered yet. Directory will populate automatically when municipal tourism officers register."
                            : `No officers found matching "${userSearch}".`}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "Audit Logs" ? (
            <AuditLog user={user} />
          ) : (
            /* MAIN DASHBOARD TAB */
            <>
              {/* WELCOME BANNER */}
              <div
                className="welcome-banner"
                style={{ backgroundImage: `url(${bannerMosaic})` }}
              >
                <div className="welcome-overlay">
                  <h1>Welcome to Turismo Track!</h1>
                  <h2>
                    Track and manage your tourism <b>DATA</b>
                  </h2>
                </div>
              </div>

              {/* STAT CARDS */}
              <div className="stats-grid">
                <div className="stat-card green">
                  <span className="stat-label">TOTAL VISITORS</span>
                  <strong>{displayedTotalVisitors > 0 ? displayedTotalVisitors.toLocaleString() : "0"}</strong>
                  <small>{displayedTotalVisitors > 0 ? "Recorded arrivals" : "Baseline (0 recorded)"}</small>
                </div>

                <div className="stat-card">
                  <span className="stat-label">TOTAL ESTABLISHMENTS</span>
                  <strong>{totalEstablishmentCount}</strong>
                  <small>{totalEstablishmentCount} registered business units</small>
                </div>

                <div className="stat-card">
                  <span className="stat-label">AVG MONTHLY GROWTH</span>
                  <strong className="growth" style={{ color: displayedTotalVisitors > 0 ? "#167a33" : "#64748b" }}>
                    {displayedTotalVisitors > 0 ? "+14.8%" : "0.0%"}
                  </strong>
                  <small>{displayedTotalVisitors > 0 ? "Since last quarter" : "Awaiting data"}</small>
                </div>

                <div className="stat-card">
                  <span className="stat-label">MUNICIPAL RANKING</span>
                  <strong>{topMunicipality ? topMunicipality.name : "—"}</strong>
                  <small>{topMunicipality ? `Top performing (${(Number(topMunicipality.totalVisitors) || 0).toLocaleString()} visitors)` : "Awaiting visitor data"}</small>
                </div>
              </div>

              {/* CHART ROW */}
              <div className="charts-grid">
                {/* VISITOR TREND */}
                <div className="chart-card visitor-chart">
                  <div className="card-header">
                    <h3>
                      Visitor Trend
                      <span>(Jan 2026 – Dec 2026)</span>
                    </h3>
                    <span className="card-badge">
                      {displayedTotalVisitors > 0
                        ? `${displayedTotalVisitors.toLocaleString()} Total Volume`
                        : "0 Recorded (Baseline)"}
                    </span>
                  </div>

                  <div className="chart">
                    {/* Y-AXIS LABELS */}
                    <div className="y-axis-labels">
                      <span className="y-label">{maxTrendVal >= 1000 ? `${Math.round(maxTrendVal / 1000)}k` : Math.round(maxTrendVal)}</span>
                      <span className="y-label">{maxTrendVal >= 1000 ? `${Math.round((maxTrendVal * 0.75) / 1000)}k` : Math.round(maxTrendVal * 0.75)}</span>
                      <span className="y-label">{maxTrendVal >= 1000 ? `${Math.round((maxTrendVal * 0.5) / 1000)}k` : Math.round(maxTrendVal * 0.5)}</span>
                      <span className="y-label">{maxTrendVal >= 1000 ? `${Math.round((maxTrendVal * 0.25) / 1000)}k` : Math.round(maxTrendVal * 0.25)}</span>
                      <span className="y-label">0</span>
                    </div>

                    {/* HORIZONTAL GRID LINES */}
                    <div className="grid-lines">
                      <div className="grid-line" />
                      <div className="grid-line" />
                      <div className="grid-line" />
                      <div className="grid-line" />
                      <div className="grid-line" />
                    </div>

                    {/* SVG TREND LINE */}
                    <div className="trend-svg-wrap">
                      <svg
                        className="trend-line"
                        viewBox="0 0 700 200"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Soft Area Fill */}
                        {areaPolygonPoints && (
                          <polygon
                            points={areaPolygonPoints}
                            fill="url(#trendGradient)"
                          />
                        )}

                        {/* Trend Line */}
                        {polylinePoints && (
                          <polyline
                            points={polylinePoints}
                            fill="none"
                            stroke="#15803d"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}

                        {/* Data Points */}
                        {trendPoints.map((pt) => (
                          <g key={pt.month}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={pt.value > 0 ? "5" : "3.5"}
                              fill="#ffffff"
                              stroke="#15803d"
                              strokeWidth="2.5"
                              className="trend-point"
                            >
                              <title>{`${pt.month} 2026: ${pt.visitorsDisplay} visitors`}</title>
                            </circle>
                          </g>
                        ))}
                      </svg>
                    </div>

                    {/* 12 MONTH LABELS */}
                    <div className="month-labels">
                      {trendPoints.map((pt) => (
                        <span key={pt.month}>{pt.month}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ESTABLISHMENT TYPES */}
                <div className="chart-card establishment-chart">
                  <div className="card-header">
                    <h3>Establishment Types</h3>
                    <span className="card-badge">{establishmentStats.total} Registered</span>
                  </div>

                  <div className="donut-section">
                    <div className="donut-wrapper">
                      <div
                        className={`donut ${establishmentStats.total === 0 ? "donut-empty" : ""}`}
                        style={establishmentStats.total > 0 ? { background: establishmentStats.conicGradient } : {}}
                      />
                      <div className="donut-center">
                        <strong>{establishmentStats.total}</strong>
                        <span>TOTAL UNITS</span>
                      </div>
                    </div>

                    <div className="legend">
                      <div className="legend-row">
                        <div className="legend-title">
                          <i className="legend-dot legend-blue" />
                          <span>Hotel</span>
                        </div>
                        <div className="legend-values">
                          <span className="legend-count">{establishmentStats.hotel.count} units</span>
                          <b className="legend-pct">{establishmentStats.hotel.pct}%</b>
                        </div>
                      </div>

                      <div className="legend-row">
                        <div className="legend-title">
                          <i className="legend-dot legend-teal" />
                          <span>Resort</span>
                        </div>
                        <div className="legend-values">
                          <span className="legend-count">{establishmentStats.resort.count} units</span>
                          <b className="legend-pct">{establishmentStats.resort.pct}%</b>
                        </div>
                      </div>

                      <div className="legend-row">
                        <div className="legend-title">
                          <i className="legend-dot legend-orange" />
                          <span>Mabuhay Accommodation</span>
                        </div>
                        <div className="legend-values">
                          <span className="legend-count">{establishmentStats.mabuhay.count} units</span>
                          <b className="legend-pct">{establishmentStats.mabuhay.pct}%</b>
                        </div>
                      </div>

                      <div className="legend-row">
                        <div className="legend-title">
                          <i className="legend-dot legend-purple" />
                          <span>Homestay</span>
                        </div>
                        <div className="legend-values">
                          <span className="legend-count">{establishmentStats.homestay.count} units</span>
                          <b className="legend-pct">{establishmentStats.homestay.pct}%</b>
                        </div>
                      </div>

                      <div className="legend-row">
                        <div className="legend-title">
                          <i className="legend-dot legend-yellow" />
                          <span>Farm Tourism Camps</span>
                        </div>
                        <div className="legend-values">
                          <span className="legend-count">{establishmentStats.farmCamps.count} units</span>
                          <b className="legend-pct">{establishmentStats.farmCamps.pct}%</b>
                        </div>
                      </div>

                      <div className="legend-row">
                        <div className="legend-title">
                          <i className="legend-dot legend-pink" />
                          <span>Tourism Attractions</span>
                        </div>
                        <div className="legend-values">
                          <span className="legend-count">{establishmentStats.attractions.count} units</span>
                          <b className="legend-pct">{establishmentStats.attractions.pct}%</b>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MUNICIPAL PERFORMANCE RANKINGS */}
              <MunicipalRankings lgus={registeredLgus} />

              {/* BOTTOM BRAND BANNER */}
              <div className="bottom-banner">
                <div className="bottom-brand">
                  <div className="bottom-brand-badge">NUEVA VIZCAYA</div>
                  <div className="bottom-text">
                    <h4>Provincial Tourism and Cultural Affairs Office</h4>
                    <p>Where Adventure Meets Heritage, Nature & Vibrant Culture</p>
                  </div>
                </div>

                <div className="bottom-stats-pills">
                  <div className="bottom-pill">
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span><strong>{registeredLgus.length}</strong> {registeredLgus.length === 1 ? "LGU" : "LGUs"} Monitored</span>
                  </div>
                  <div className="bottom-pill">
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span><strong>100%</strong> Compliance</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* BOTTOM CULTURAL RIBBON */}
        <CulturalRibbon className="dashboard-bottom-ribbon" />
      </main>
    </div>
  );
};

export default Dashboard;