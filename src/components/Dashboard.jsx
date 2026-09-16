import React, { useState, useMemo } from "react";
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
  TrendingUp,
  Search,
  CheckCircle2
} from "lucide-react";
import "./Dashboard.css";
import MunicipalRankings from "./MunicipalRankings";
import VisitorReport from "./VisitorReport";
import MonitoredEstablishments from "./MonitoredEstablishments";
import MonitoredLGUs from "./MonitoredLGUs";

// Seeded directory of Municipal Tourism Officers and Provincial Admins
const MUNICIPAL_OFFICERS = [
  {
    id: 1,
    name: "Eduardo G. Santos",
    municipality: "Diadi",
    role: "Municipal Tourism Officer",
    email: "tourism@diadi-nv.gov.ph",
    phone: "+63 (078) 392-1108",
    status: "Active"
  },
];

// 12-Month visitor trend coordinates
const TREND_DATA = [
  { month: "Jan", visitors: "18.4k", x: 25, y: 118 },
  { month: "Feb", visitors: "19.8k", x: 84, y: 111 },
  { month: "Mar", visitors: "24.2k", x: 143, y: 89 },
  { month: "Apr", visitors: "34.8k", x: 202, y: 36 }, // Holy Week peak
  { month: "May", visitors: "32.1k", x: 261, y: 50 }, // Summer peak
  { month: "Jun", visitors: "21.5k", x: 320, y: 103 },
  { month: "Jul", visitors: "26.3k", x: 379, y: 79 },
  { month: "Aug", visitors: "28.7k", x: 438, y: 67 },
  { month: "Sep", visitors: "25.1k", x: 497, y: 85 },
  { month: "Oct", visitors: "27.4k", x: 556, y: 73 },
  { month: "Nov", visitors: "29.8k", x: 615, y: 61 },
  { month: "Dec", visitors: "36.5k", x: 675, y: 28 }, // Holiday peak
];

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const userName = user?.name && user.name !== "Admin" ? user.name : "PTCO Admin";
  const userRole = user?.role || "Administrator";
  const userInitial = userName.charAt(0).toUpperCase();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Visitor Reports", icon: FileText },
    { name: "Municipalities", icon: MapPin },
    { name: "Users", icon: Users },
    { name: "Establishments", icon: Building2 },
  ];

  // Filter municipal officers in Users tab
  const filteredOfficers = useMemo(() => {
    if (!userSearch.trim()) return MUNICIPAL_OFFICERS;
    const query = userSearch.toLowerCase();
    return MUNICIPAL_OFFICERS.filter(
      (o) =>
        o.name.toLowerCase().includes(query) ||
        o.municipality.toLowerCase().includes(query) ||
        o.role.toLowerCase().includes(query) ||
        o.email.toLowerCase().includes(query)
    );
  }, [userSearch]);

  const polylinePoints = TREND_DATA.map((d) => `${d.x},${d.y}`).join(" ");
  const areaPolygonPoints = `${TREND_DATA[0].x},190 ` + polylinePoints + ` ${TREND_DATA[TREND_DATA.length - 1].x},190`;

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
                {activeTab === "Visitor Reports" || activeTab === "Visitor Report"
                  ? "VISITOR REPORT"
                  : activeTab === "Establishments"
                    ? "MONITORED ESTABLISHMENTS"
                    : activeTab === "Municipalities"
                      ? "MONITORED LGUS"
                      : activeTab === "Users"
                        ? "USERS"
                        : "DASHBOARD"}
              </h3>
              <p>
                {activeTab === "Visitor Reports" || activeTab === "Visitor Report"
                  ? "Overview of tourism in Nueva Vizcaya"
                  : activeTab === "Establishments"
                    ? "Registered accommodation, dining, and ecotourism facilities in Nueva Vizcaya"
                    : activeTab === "Municipalities"
                      ? "Local Government Unit tourism statistics and carrying capacities"
                      : activeTab === "Users"
                        ? "Directory of accredited municipal tourism officers and administrators"
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
            </button>

            <div className="admin-avatar" title={userName} />

            <div className="admin-info">
              <strong>{userName}</strong>
              <span>{userRole}</span>
            </div>
          </div>
        </header>

        {/* TAB CONTENT */}
        <section className="content">
          {activeTab === "Visitor Reports" || activeTab === "Visitor Report" ? (
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
                  <p>15 Municipalities • Provincial Tourism Council of Nueva Vizcaya</p>
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
                        <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                          No officers found matching "{userSearch}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
                  <strong>128,450</strong>
                  <small>This month</small>
                </div>

                <div className="stat-card">
                  <span className="stat-label">TOTAL ESTABLISHMENTS</span>
                  <strong>1,248</strong>
                  <small>Registered business units</small>
                </div>

                <div className="stat-card">
                  <span className="stat-label">AVG MONTHLY GROWTH</span>
                  <strong className="growth">+14.8%</strong>
                  <small>Since last quarter</small>
                </div>

                <div className="stat-card">
                  <span className="stat-label">MUNICIPAL RANKING</span>
                  <strong>Solano</strong>
                  <small>Top performing municipality</small>
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
                    <span className="card-badge">+18.2% YTD Volume</span>
                  </div>

                  <div className="chart">
                    {/* Y-AXIS LABELS */}
                    <div className="y-axis-labels">
                      <span className="y-label">40k</span>
                      <span className="y-label">30k</span>
                      <span className="y-label">20k</span>
                      <span className="y-label">10k</span>
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
                        <polygon
                          points={areaPolygonPoints}
                          fill="url(#trendGradient)"
                        />

                        {/* Trend Line */}
                        <polyline
                          points={polylinePoints}
                          fill="none"
                          stroke="#15803d"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Data Points */}
                        {TREND_DATA.map((pt) => (
                          <g key={pt.month}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="5"
                              fill="#ffffff"
                              stroke="#15803d"
                              strokeWidth="2.5"
                              className="trend-point"
                            >
                              <title>{`${pt.month} 2026: ${pt.visitors} visitors`}</title>
                            </circle>
                          </g>
                        ))}
                      </svg>
                    </div>

                    {/* 12 MONTH LABELS */}
                    <div className="month-labels">
                      {TREND_DATA.map((pt) => (
                        <span key={pt.month}>{pt.month}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ESTABLISHMENT TYPES */}
                <div className="chart-card establishment-chart">
                  <div className="card-header">
                    <h3>Establishment Types</h3>
                    <span className="card-badge">Top 5</span>
                  </div>

                  <div className="donut-section">
                    <div className="donut-wrapper">
                      <div className="donut" />
                      <div className="donut-center">
                        <strong>1,248</strong>
                        <span>TOTAL UNITS</span>
                      </div>
                    </div>

                    <div className="legend">
                      <div className="legend-row">
                        <div className="legend-title">
                          <i className="legend-dot legend-green" />
                          <span>Restaurants</span>
                        </div>
                        <div className="legend-values">
                          <span className="legend-count">524 units</span>
                          <b className="legend-pct">42%</b>
                        </div>
                      </div>

                      <div className="legend-row">
                        <div className="legend-title">
                          <i className="legend-dot legend-orange" />
                          <span>Hotels & Inns</span>
                        </div>
                        <div className="legend-values">
                          <span className="legend-count">300 units</span>
                          <b className="legend-pct">24%</b>
                        </div>
                      </div>

                      <div className="legend-row">
                        <div className="legend-title">
                          <i className="legend-dot legend-blue" />
                          <span>Tour Operators</span>
                        </div>
                        <div className="legend-values">
                          <span className="legend-count">200 units</span>
                          <b className="legend-pct">16%</b>
                        </div>
                      </div>

                      <div className="legend-row">
                        <div className="legend-title">
                          <i className="legend-dot legend-yellow" />
                          <span>Resorts</span>
                        </div>
                        <div className="legend-values">
                          <span className="legend-count">175 units</span>
                          <b className="legend-pct">14%</b>
                        </div>
                      </div>

                      <div className="legend-row">
                        <div className="legend-title">
                          <i className="legend-dot legend-red" />
                          <span>Others</span>
                        </div>
                        <div className="legend-values">
                          <span className="legend-count">49 units</span>
                          <b className="legend-pct">4%</b>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MUNICIPAL PERFORMANCE RANKINGS */}
              <MunicipalRankings />

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
                    <span><strong>15</strong> LGUs Monitored</span>
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
      </main>
    </div>
  );
};

export default Dashboard;