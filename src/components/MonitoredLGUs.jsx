  import React, { useState, useMemo, useEffect } from "react";
  import {
    MapPin,
    Users,
    Building2,
    AlertTriangle,
    Search,
    ChevronDown,
    User,
    X,
    Calendar
  } from "lucide-react";
  import "./MonitoredLGUs.css";
  import { fetchLGUs } from "../services/api";

  // Helper to return clean metrics based on selected date
  const getAdjustedMetrics = (lgu, lguDate = "Today") => {
    const d = String(lguDate || "").toLowerCase();
    let visitors = 0;
    let foreign = 0;

    if (d.includes("today")) {
      visitors = Number(lgu?.visitorsToday ?? 0);
      foreign = Number(lgu?.foreignToday ?? 0);
    } else if (d.includes("yesterday")) {
      visitors = Number(lgu?.visitorsYesterday ?? 0);
      foreign = Number(lgu?.foreignYesterday ?? 0);
    } else if (d.includes("week")) {
      visitors = Number(lgu?.visitorsThisWeek ?? lgu?.visitorsThisMonth ?? lgu?.totalVisitors ?? 0);
      foreign = Number(lgu?.foreignMice ?? 0);
    } else if (d.includes("month")) {
      visitors = Number(lgu?.visitorsThisMonth ?? lgu?.totalVisitors ?? 0);
      foreign = Number(lgu?.foreignMice ?? 0);
    } else {
      visitors = Number(lgu?.totalVisitors ?? lgu?.visitorsThisMonth ?? 0);
      foreign = Number(lgu?.foreignMice ?? 0);
    }

    const load = Number(lgu?.capacityLoad ?? (visitors > 0 ? Math.min(100, Math.round((visitors / 1500) * 100)) : 0));

    return {
      totalVisitors: visitors,
      foreignMice: foreign,
      capacityLoad: load,
    };
  };

  const MonitoredLGUs = () => {
    const now = useMemo(() => new Date(), []);
    const todayFormatted = useMemo(
      () =>
        now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      [now]
    );
    const yesterdayFormatted = useMemo(() => {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return y.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }, [now]);
    const thisMonthFormatted = useMemo(
      () =>
        now.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      [now]
    );
    const currentYear = now.getFullYear();

    const [lgus, setLgus] = useState([]);
    const [_isLiveMongo, setIsLiveMongo] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("All");
    const [sortBy, setSortBy] = useState("Alphabetical");
    const [globalDate, setGlobalDate] = useState("Today");
    const [cardDates, setCardDates] = useState({});
    const [customDates, setCustomDates] = useState({});
    const [activeCustomCardId, setActiveCustomCardId] = useState(null);

    useEffect(() => {
      let isMounted = true;
      const loadLGUs = () => {
        fetchLGUs().then((data) => {
          if (isMounted) {
            const list = Array.isArray(data) ? data : [];
            const sanitized = list.map((d) => ({
              ...d,
              totalVisitors: Number(d.totalVisitors) || 0,
              foreignMice: Number(d.foreignMice) || 0,
              capacityLoad: Number(d.capacityLoad) || 0,
            }));
            setLgus(sanitized);
            setIsLiveMongo(true);
          }
        });
      };

      loadLGUs();

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
              type === "data:updated"
            ) {
              loadLGUs();
            }
          };
        } catch {}
      }

      const interval = setInterval(loadLGUs, 4000);
      return () => {
        isMounted = false;
        if (channel) channel.close();
        clearInterval(interval);
      };
    }, []);

    const handleCardDateChange = (id, newDate) => {
      if (newDate === "custom") {
        setActiveCustomCardId(id);
        return;
      }
      setCardDates((prev) => ({ ...prev, [id]: newDate }));
    };

    const handleCustomDateSubmit = (id, dateStr) => {
      if (dateStr) {
        const parts = dateStr.split("-");
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const formatted = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        setCustomDates((prev) => ({ ...prev, [id]: formatted }));
        setCardDates((prev) => ({ ...prev, [id]: formatted }));
      }
      setActiveCustomCardId(null);
    };

    const handleGlobalDateChange = (newDate) => {
      setGlobalDate(newDate);
      setCardDates({});
    };

    const filteredLGUs = useMemo(() => {
      return lgus.filter((lgu) => {
        const matchesSearch =
          searchQuery.trim() === "" ||
          lgu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lgu.officer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lgu.district.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDistrict =
          selectedDistrict === "All" || lgu.district === selectedDistrict;

        return matchesSearch && matchesDistrict;
      }).sort((a, b) => {
        if (sortBy === "Alphabetical") return a.name.localeCompare(b.name);
        if (sortBy === "Most Visitors") return b.totalVisitors - a.totalVisitors;
        if (sortBy === "Highest Load") return b.capacityLoad - a.capacityLoad;
        return 0;
      });
    }, [lgus, searchQuery, selectedDistrict, sortBy]);

    // Aggregate metrics
    const totalMonitoredCount = `${lgus.length}`;
    const totalProvinceVisitors = lgus
      .reduce((sum, lgu) => {
        const d = cardDates[lgu.id] || globalDate;
        const m = getAdjustedMetrics(lgu, d);
        return sum + m.totalVisitors;
      }, 0)
      .toLocaleString();
    const capacityAlertsCount = lgus.filter((l) => {
      const d = cardDates[l.id] || globalDate;
      const m = getAdjustedMetrics(l, d);
      return m.capacityLoad >= 80;
    }).length;

    return (
      <div className="monitored-lgus-wrapper">
        {/* 4 TOP SUMMARY CARDS */}
        <div className="lgu-summary-grid">
          {/* Card 1 */}
          <div className="lgu-summary-card">
            <div className="lgu-card-header">
              <span className="lgu-metric-label">MONITORED LGUS</span>
              <div className="lgu-icon-badge green">
                <MapPin size={18} />
              </div>
            </div>
            <div className="lgu-metric-number">{totalMonitoredCount}</div>
            <div className="lgu-metric-sub green-sub">
              {lgus.length > 0 ? `${lgus.length} Registered LGUs Monitored` : "No Municipalities Registered"}
            </div>
          </div>

          {/* Card 2 */}
          <div className="lgu-summary-card">
            <div className="lgu-card-header">
              <span className="lgu-metric-label">TOTAL PROVINCE VISITORS</span>
              <div className="lgu-icon-badge blue">
                <Users size={18} />
              </div>
            </div>
            <div className="lgu-metric-number">{totalProvinceVisitors}</div>
            <div className="lgu-metric-sub blue-sub">
              {globalDate} Volume Summary
            </div>
          </div>

          {/* Card 3 */}
          <div className="lgu-summary-card">
            <div className="lgu-card-header">
              <span className="lgu-metric-label">REGISTERED SITES</span>
              <div className="lgu-icon-badge purple">
                <Building2 size={18} />
              </div>
            </div>
            <div className="lgu-metric-number">{lgus.reduce((sum, l) => sum + (Number(l.intel?.registeredSites) || 0), 0)}</div>
            <div className="lgu-metric-sub purple-sub">
              {lgus.length > 0 ? "Registered Sites & Establishments" : "0 Sites Registered"}
            </div>
          </div>

          {/* Card 4 */}
          <div className="lgu-summary-card">
            <div className="lgu-card-header">
              <span className="lgu-metric-label">CAPACITY ALERTS</span>
              <div className="lgu-icon-badge amber">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="lgu-metric-number">{capacityAlertsCount}</div>
            <div className="lgu-metric-sub amber-sub">
              LGUs with &gt;80% Peak Load ({globalDate})
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS BAR */}
        <div className="lgu-controls-card">
          {/* Left Search input */}
          <div className="lgu-search-box">
            <Search size={18} className="lgu-search-icon" />
            <input
              type="text"
              className="lgu-search-input"
              placeholder="Search municipality (e.g. Diadi, Kasibu, Solano, Bayombong) or officer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="lgu-clear-search"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Right Filter groups */}
          <div className="lgu-filters-row">
            {/* District Pills */}
            <div className="lgu-district-pills">
              <span className="lgu-filter-label">District:</span>
              {["All", "North", "Central", "South"].map((dist) => (
                <button
                  key={dist}
                  type="button"
                  className={`district-pill ${selectedDistrict === dist ? "active" : ""}`}
                  onClick={() => setSelectedDistrict(dist)}
                >
                  {dist}
                </button>
              ))}
            </div>

            <div className="lgu-filter-separator" />

            {/* Date Dropdown */}
            <div className="lgu-date-group">
              <span className="lgu-filter-label">Date:</span>
              <div className="lgu-select-box">
                <Calendar size={14} className="lgu-filter-calendar-icon" />
                <select
                  value={globalDate}
                  onChange={(e) => handleGlobalDateChange(e.target.value)}
                  className="lgu-sort-select lgu-date-filter-select"
                  aria-label="Select date filter for all municipalities"
                >
                  <optgroup label="Quick Select">
                    <option value="Today">Today ({todayFormatted})</option>
                    <option value="Yesterday">Yesterday ({yesterdayFormatted})</option>
                  </optgroup>
                  <optgroup label="Periods">
                    <option value="This Week">This Week</option>
                    <option value="This Month">This Month ({thisMonthFormatted})</option>
                  </optgroup>
                  <optgroup label="Quarterly & Annual">
                    <option value={`Full Year ${currentYear}`}>Full Year {currentYear}</option>
                    <option value={`Full Year ${currentYear - 1}`}>Full Year {currentYear - 1}</option>
                  </optgroup>
                </select>
                <ChevronDown size={14} className="lgu-select-chevron" />
              </div>
            </div>

            <div className="lgu-filter-separator" />

            {/* Sort Dropdown */}
            <div className="lgu-sort-group">
              <span className="lgu-filter-label">Sort by:</span>
              <div className="lgu-select-box">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="lgu-sort-select"
                  aria-label="Sort municipalities"
                >
                  <option value="Alphabetical">Alphabetical (A - Z)</option>
                  <option value="Most Visitors">Most Visitors</option>
                  <option value="Highest Load">Highest Capacity Load</option>
                </select>
                <ChevronDown size={14} className="lgu-select-chevron" />
              </div>
            </div>
          </div>
        </div>

        {/* Showing count indicator */}
        <div className="lgu-results-meta">
          <span>
            Showing {filteredLGUs.length} of {lgus.length} Municipalities of Nueva Vizcaya
          </span>
        </div>

        {/* 3-COLUMN LGU CARDS GRID OR EMPTY STATE */}
        {filteredLGUs.length === 0 ? (
          <div className="lgu-empty-state">
            <MapPin size={44} className="lgu-empty-icon" />
            <h4>
              {lgus.length === 0
                ? "No Monitored LGUs Registered"
                : "No municipalities match your search criteria"}
            </h4>
            <p>
              {lgus.length === 0
                ? "Municipalities will automatically appear here once a municipal tourism office registers."
                : "Try refining your search keyword or switching district filters."}
            </p>
            {lgus.length > 0 && (searchQuery || selectedDistrict !== "All") && (
              <button
                type="button"
                className="lgu-reset-btn"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDistrict("All");
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="lgu-cards-grid">
            {filteredLGUs.map((lgu) => {
            const lguDate = cardDates[lgu.id] || globalDate;
            const metrics = getAdjustedMetrics(lgu, lguDate);
            const isAlert = metrics.capacityLoad >= 80;
            const isGreen = metrics.capacityLoad < 60;
            const barClass = isAlert ? "bar-alert" : isGreen ? "bar-green" : "bar-blue";

            return (
              <div key={lgu.id} className="lgu-card">
                {/* Top District Badge & Date Filter */}
                <div className="lgu-card-top">
                  <span className={`lgu-district-badge ${lgu.badgeColor}`}>
                    {lgu.districtLabel}
                  </span>

                  {activeCustomCardId === lgu.id ? (
                    <div className="lgu-card-custom-picker">
                      <input
                        type="date"
                        defaultValue="2026-09-25"
                        onChange={(e) => handleCustomDateSubmit(lgu.id, e.target.value)}
                        className="lgu-custom-date-native"
                        autoFocus
                      />
                      <button
                        type="button"
                        className="lgu-custom-date-cancel"
                        onClick={() => setActiveCustomCardId(null)}
                        title="Cancel custom date"
                        aria-label="Cancel custom date"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="lgu-card-date-wrap"
                      title="Change date for this municipality"
                    >
                      <Calendar size={13} className="lgu-card-date-icon" />
                      <select
                        className="lgu-card-date-select"
                        value={lguDate}
                        onChange={(e) => handleCardDateChange(lgu.id, e.target.value)}
                        aria-label={`Select date for ${lgu.name}`}
                      >
                        {customDates[lgu.id] && (
                          <option value={customDates[lgu.id]}>
                            {customDates[lgu.id]}
                          </option>
                        )}
                        <optgroup label="Quick Select">
                          <option value="Today">Today ({todayFormatted})</option>
                          <option value="Yesterday">Yesterday ({yesterdayFormatted})</option>
                        </optgroup>
                        <optgroup label="Periods">
                          <option value="This Week">This Week</option>
                          <option value="This Month">This Month ({thisMonthFormatted})</option>
                        </optgroup>
                        <optgroup label="Quarterly & Annual">
                          <option value={`Full Year ${currentYear}`}>Full Year {currentYear}</option>
                          <option value={`Full Year ${currentYear - 1}`}>Full Year {currentYear - 1}</option>
                        </optgroup>
                        <optgroup label="Custom">
                          <option value="custom">📅 Pick Exact Date...</option>
                        </optgroup>
                      </select>
                      <ChevronDown size={12} className="lgu-card-date-chevron" />
                    </div>
                  )}
                </div>

                {/* Title & Slogan Quote */}
                <div className="lgu-card-headline">
                  <h3 className="lgu-title">{lgu.name}</h3>
                  <p className="lgu-quote">{lgu.quote}</p>
                </div>

                {/* 2-Metric Box: Both at 0 */}
                <div className="lgu-stats-box">
                  <div className="lgu-stat-col">
                    <span className="lgu-stat-sub">TOTAL VISITORS</span>
                    <strong className="lgu-stat-val">
                      {metrics.totalVisitors.toLocaleString()}
                    </strong>
                  </div>
                  <div className="lgu-stat-col right-col">
                    <span className="lgu-stat-sub">FOREIGN / MICE</span>
                    <strong className="lgu-stat-val teal-val">
                      {metrics.foreignMice.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Carrying Capacity Load Bar: 0% */}
                <div className="lgu-capacity-section">
                  <div className="lgu-capacity-labels">
                    <span className="cap-label">Carrying Capacity Load</span>
                    <span className={`cap-percent ${barClass}`}>
                      {metrics.capacityLoad}%
                    </span>
                  </div>
                  <div className="lgu-progress-track">
                    <div
                      className={`lgu-progress-fill ${barClass}`}
                      style={{ width: `${metrics.capacityLoad}%` }}
                    />
                  </div>
                </div>

                {/* Card Footer: Officer Designation */}
                <div className="lgu-card-footer">
                  <div className="lgu-officer-info">
                    <User size={15} className="lgu-officer-icon" />
                    <span className="lgu-officer-name">{lgu.officer}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MonitoredLGUs;
