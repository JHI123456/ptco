import React, { useState, useMemo, useEffect } from "react";
import {
  Building2,
  Users,
  AlertTriangle,
  Search,
  ChevronDown,
  User,
  X,
  Calendar
} from "lucide-react";
import "./MonitoredEstablishments.css";
import { fetchEstablishments } from "../services/api";

const ESTABLISHMENTS_DATA = [

];

const getAdjustedMetrics = (item, estDate = "October 2026") => {
  const d = String(estDate || "").toLowerCase();
  const name = String(item?.name || "").toLowerCase().trim();
  const isZen = name.includes("zen");
  const isWilwin = name.includes("wilwin");

  let visitors = 0;
  let foreign = 0;

  if (d.includes("october")) {
    if (isZen) {
      visitors = 5182;
      foreign = 17;
    } else if (isWilwin) {
      visitors = 410;
      foreign = 25;
    } else {
      visitors = 0;
      foreign = 0;
    }
  } else if (d.includes("november") || d.includes("this month") || d.includes("today")) {
    if (isZen) {
      // Live November check-ins encoded by user
      const rawCount = Number(item?.totalVisitors || item?.visitorsThisMonth || 0);
      visitors = rawCount < 1000 ? (rawCount || 3) : 3;
      foreign = Number(item?.foreignToday || 0);
    } else if (isWilwin) {
      visitors = 0;
      foreign = 0;
    } else {
      visitors = 0;
      foreign = 0;
    }
  } else if (d.includes("full year") || d.includes("all")) {
    if (isZen) {
      visitors = 5185;
      foreign = 17;
    } else if (isWilwin) {
      visitors = 410;
      foreign = 25;
    } else {
      visitors = 0;
      foreign = 0;
    }
  } else {
    // Default fallback to October official baseline
    if (isZen) {
      visitors = 5182;
      foreign = 17;
    } else if (isWilwin) {
      visitors = 410;
      foreign = 25;
    } else {
      visitors = 0;
      foreign = 0;
    }
  }

  const load = Number(item?.capacityLoad || (visitors > 0 ? Math.min(100, Math.round((visitors / (isZen ? 500 : 250)) * 100)) : (isZen ? 64 : isWilwin ? 52 : 0)));

  return {
    totalVisitors: visitors,
    foreignMice: foreign,
    capacityLoad: load,
  };
};

const MonitoredEstablishments = () => {
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

  const [establishments, setEstablishments] = useState(ESTABLISHMENTS_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Most Visitors");
  const [globalDate, setGlobalDate] = useState("October 2026");
  const [cardDates, setCardDates] = useState({});
  const [customDates, setCustomDates] = useState({});
  const [activeCustomCardId, setActiveCustomCardId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadEsts = () => {
      fetchEstablishments().then((data) => {
        if (isMounted) {
          const list = Array.isArray(data) ? data : [];
          setEstablishments(list);
        }
      });
    };
    loadEsts();

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
            type === "data:updated"
          ) {
            loadEsts();
          }
        };
      } catch {}
    }

    const interval = setInterval(loadEsts, 4000);
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

  // Filtered and sorted establishments
  const filteredData = useMemo(() => {
    return establishments.filter((est) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        (est.name || "").toLowerCase().includes(q) ||
        (est.municipality || "").toLowerCase().includes(q) ||
        (est.officer || "").toLowerCase().includes(q) ||
        (Array.isArray(est.flagships) && est.flagships.some((f) => f.toLowerCase().includes(q)));

      const matchesDistrict =
        selectedDistrict === "All" || (est.district || "Central") === selectedDistrict;

      const matchesCategory = (() => {
        if (selectedCategory === "All") return true;
        const cLower = selectedCategory.toLowerCase().trim();
        const estCat = (est.category || "").toLowerCase().trim();
        const estType = (est.establishmentType || est.type || "").toLowerCase().trim();
        const estName = (est.name || "").toLowerCase().trim();

        if (cLower.includes("mabuhay")) {
          return estCat.includes("mabuhay") || estType.includes("mabuhay") || estName.includes("mabuhay");
        }
        if (cLower === "resort") {
          return estCat.includes("resort") || estType.includes("resort") || estName.includes("resort");
        }
        if (cLower === "hotel") {
          if (estCat.includes("mabuhay") || estType.includes("mabuhay")) return false;
          if (estCat.includes("resort") || estType.includes("resort")) return false;
          return estCat.includes("hotel") || estType.includes("hotel") || estName.includes("hotel") || estName.includes("inn") || estName.includes("lodge");
        }
        if (cLower.includes("homestay") || cLower.includes("home stay")) {
          return estCat.includes("homestay") || estType.includes("homestay") || estName.includes("homestay");
        }
        if (cLower.includes("farm") || cLower.includes("camp")) {
          return estCat.includes("farm") || estCat.includes("camp") || estType.includes("farm") || estType.includes("camp") || estName.includes("farm");
        }
        if (cLower.includes("attraction")) {
          return estCat.includes("attraction") || estType.includes("attraction") || estName.includes("attraction") || estName.includes("park");
        }
        return estCat === cLower || estType === cLower;
      })();

      return matchesSearch && matchesDistrict && matchesCategory;
    }).sort((a, b) => {
      const mA = getAdjustedMetrics(a);
      const mB = getAdjustedMetrics(b);
      if (sortBy === "Most Visitors") return mB.totalVisitors - mA.totalVisitors;
      if (sortBy === "Highest Load") return mB.capacityLoad - mA.capacityLoad;
      if (sortBy === "Alphabetical") return (a.name || "").localeCompare(b.name || "");
      return 0;
    });
  }, [establishments, searchQuery, selectedDistrict, selectedCategory, sortBy]);

  // Summary KPI counts based on dataset
  const totalMonitored = establishments.length > 0 ? `${establishments.length} / ${establishments.length + 4}` : "0";
  const totalProvinceGuests = establishments
    .reduce((sum, est) => {
      const d = cardDates[est.id] || globalDate;
      const m = getAdjustedMetrics(est, d);
      return sum + m.totalVisitors;
    }, 0)
    .toLocaleString();
  const capacityAlertsCount = establishments.filter((e) => {
    const d = cardDates[e.id] || globalDate;
    const m = getAdjustedMetrics(e, d);
    return m.capacityLoad >= 80;
  }).length;

  return (
    <div className="monitored-est-wrapper">
      {/* 3 TOP SUMMARY METRIC CARDS */}
      <div className="est-summary-grid">
        {/* Card 1: Monitored Establishments */}
        <div className="est-summary-card">
          <div className="est-card-header">
            <span className="est-metric-label">MONITORED ESTABLISHMENTS</span>
            <div className="est-icon-badge green">
              <Building2 size={18} />
            </div>
          </div>
          <div className="est-metric-number">{totalMonitored}</div>
          <div className="est-metric-sub green-sub">
            {establishments.length > 0
              ? "97.2% Active Reporting (Hotels, Resorts, Dining)"
              : "0 Active Reporting (No establishments registered)"}
          </div>
        </div>

        {/* Card 2: Total Registered Guests */}
        <div className="est-summary-card">
          <div className="est-card-header">
            <span className="est-metric-label">TOTAL REGISTERED GUESTS</span>
            <div className="est-icon-badge blue">
              <Users size={18} />
            </div>
          </div>
          <div className="est-metric-number">{totalProvinceGuests}</div>
          <div className="est-metric-sub blue-sub">
            {establishments.length > 0 ? `${globalDate} Volume Summary` : "0 Registered Guests"}
          </div>
        </div>

        {/* Card 3: Capacity Alerts */}
        <div className="est-summary-card">
          <div className="est-card-header">
            <span className="est-metric-label">CAPACITY ALERTS</span>
            <div className="est-icon-badge amber">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="est-metric-number">{capacityAlertsCount}</div>
          <div className="est-metric-sub amber-sub">
            {establishments.length > 0
              ? `Establishments with >80% Peak Load (${globalDate})`
              : "0 Capacity Alerts"}
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS BAR */}
      <div className="est-controls-card">
        {/* Left: Search input */}
        <div className="est-search-box">
          <Search size={18} className="est-search-icon" />
          <input
            type="text"
            className="est-search-input"
            placeholder="Search establishment (e.g. Highlander, Balai Gloria, Governor's Garden) or municipality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="est-clear-search"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Right: Filters & Sorter */}
        <div className="est-filters-cluster">
          {/* District Filter */}
          <div className="est-filter-group">
            <span className="est-filter-label">District:</span>
            <div className="est-pill-group">
              {["All", "North", "Central", "South"].map((dist) => (
                <button
                  key={dist}
                  type="button"
                  className={`est-pill-btn ${selectedDistrict === dist ? "active" : ""
                    }`}
                  onClick={() => setSelectedDistrict(dist)}
                >
                  {dist}
                </button>
              ))}
            </div>
          </div>

          <div className="est-filter-separator" />

          {/* Date Filter Dropdown */}
          <div className="est-date-group">
            <span className="est-filter-label">Month:</span>
            <div className="est-select-box">
              <Calendar size={14} className="est-filter-calendar-icon" />
              <select
                value={globalDate}
                onChange={(e) => handleGlobalDateChange(e.target.value)}
                className="est-sort-select est-date-filter-select"
                aria-label="Select month filter for all establishments"
              >
                <optgroup label="Monthly Reporting (DOT Standard)">
                  <option value="October 2026">October 2026</option>
                  <option value="November 2026">November 2026</option>
                  <option value="September 2026">September 2026</option>
                  <option value="August 2026">August 2026</option>
                </optgroup>
                <optgroup label="Quick Select">
                  <option value="Today">Today ({todayFormatted})</option>
                  <option value="This Month">This Month ({thisMonthFormatted})</option>
                  <option value={`Full Year ${currentYear}`}>Full Year {currentYear}</option>
                </optgroup>
              </select>
              <ChevronDown size={14} className="est-select-chevron" />
            </div>
          </div>

          <div className="est-filter-separator" />

          {/* Sort Dropdown */}
          <div className="est-sort-group">
            <span className="est-filter-label">Sort by:</span>
            <div className="est-select-box">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="est-sort-select"
              >
                <option value="Most Visitors">Most Visitors</option>
                <option value="Highest Load">Highest Load</option>
                <option value="Alphabetical">Name (A-Z)</option>
              </select>
              <ChevronDown size={14} className="est-select-chevron" />
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY QUICK FILTER CHIPS */}
      <div className="est-category-chips">
        {[
          "All",
          "Hotel",
          "Resort",
          "Mabuhay Accommodation",
          "Homestay",
          "Farm Tourism Camps",
          "Tourism Attractions"
        ].map((cat) => (
          <button
            key={cat}
            type="button"
            className={`est-cat-chip ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
        <span className="est-results-counter">
          Showing {filteredData.length} of {establishments.length} registered units
        </span>
      </div>

      {/* ESTABLISHMENT CARDS 3-COL GRID */}
      {filteredData.length === 0 ? (
        <div className="est-empty-state">
          <Building2 size={44} className="est-empty-icon" />
          <h4>
            {establishments.length === 0
              ? "No Monitored Establishments Registered"
              : "No establishments match your search criteria"}
          </h4>
          <p>
            {establishments.length === 0
              ? "All establishment records have been removed. No accommodation, dining, or ecotourism facilities are currently registered."
              : "Try refining your search keyword or switching filters."}
          </p>
          {(searchQuery || selectedDistrict !== "All" || selectedCategory !== "All") && (
            <button
              type="button"
              className="est-reset-btn"
              onClick={() => {
                setSearchQuery("");
                setSelectedDistrict("All");
                setSelectedCategory("All");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="est-cards-grid">
          {filteredData.map((item) => {
            const itemId = item._id || item.id;
            const estDate = cardDates[itemId] || globalDate;
            const metrics = getAdjustedMetrics(item, estDate);
            const isAlert = metrics.capacityLoad >= 80;
            const isGreen = metrics.capacityLoad < 60;
            const barClass = isAlert ? "bar-alert" : isGreen ? "bar-green" : "bar-blue";

            return (
              <div key={itemId} className="est-card">
                {/* Top Badge Row */}
                <div className="est-card-top">
                  <span className={`est-district-badge ${item.badgeColor || "green"}`}>
                    {item.districtLabel || (item.municipality ? item.municipality.toUpperCase() + " DISTRICT" : "CENTRAL DISTRICT")}
                  </span>

                  {activeCustomCardId === item.id ? (
                    <div className="est-card-custom-picker">
                      <input
                        type="date"
                        defaultValue="2026-09-25"
                        onChange={(e) => handleCustomDateSubmit(item.id, e.target.value)}
                        className="est-custom-date-native"
                        autoFocus
                      />
                      <button
                        type="button"
                        className="est-custom-date-cancel"
                        onClick={() => setActiveCustomCardId(null)}
                        title="Cancel custom date"
                        aria-label="Cancel custom date"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="est-card-date-wrap"
                      title="Change date for this establishment"
                    >
                      <Calendar size={13} className="est-card-date-icon" />
                      <select
                        className="est-card-date-select"
                        value={estDate}
                        onChange={(e) => handleCardDateChange(item.id, e.target.value)}
                        aria-label={`Select month for ${item.name}`}
                      >
                        {customDates[item.id] && (
                          <option value={customDates[item.id]}>
                            {customDates[item.id]}
                          </option>
                        )}
                        <optgroup label="Monthly Reporting (DOT Standard)">
                          <option value="October 2026">October 2026</option>
                          <option value="November 2026">November 2026</option>
                          <option value="September 2026">September 2026</option>
                          <option value="August 2026">August 2026</option>
                        </optgroup>
                        <optgroup label="Quick Select">
                          <option value="Today">Today ({todayFormatted})</option>
                          <option value="This Month">This Month ({thisMonthFormatted})</option>
                          <option value={`Full Year ${currentYear}`}>Full Year {currentYear}</option>
                        </optgroup>
                        <optgroup label="Custom">
                          <option value="custom">📅 Pick Exact Date...</option>
                        </optgroup>
                      </select>
                      <ChevronDown size={12} className="est-card-date-chevron" />
                    </div>
                  )}
                </div>

                {/* Title & Tagline */}
                <div className="est-card-headline">
                  <h3 className="est-title">{item.name}</h3>
                  <p className="est-tagline">{item.tagline || (item.category ? `${item.category} • ${item.municipality || 'Nueva Vizcaya'}` : 'Accredited Facility')}</p>
                </div>

                {/* 2-Metric Box */}
                <div className="est-stats-box">
                  <div className="est-stat-col">
                    <span className="est-stat-sub">TOTAL VISITORS</span>
                    <strong className="est-stat-val">
                      {metrics.totalVisitors.toLocaleString()}
                    </strong>
                  </div>
                  <div className="est-stat-col right-col">
                    <span className="est-stat-sub">FOREIGN</span>
                    <strong className="est-stat-val teal-val">
                      {metrics.foreignMice.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Carrying Capacity Load Bar */}
                <div className="est-capacity-section">
                  <div className="est-capacity-labels">
                    <span className="cap-label">Carrying Capacity Load</span>
                    <span className={`cap-percent ${barClass}`}>
                      {metrics.capacityLoad}%
                    </span>
                  </div>
                  <div className="est-progress-track">
                    <div
                      className={`est-progress-fill ${barClass}`}
                      style={{ width: `${metrics.capacityLoad}%` }}
                    />
                  </div>
                </div>

                {/* Flagship Attractions & Circuits */}
                <div className="est-flagships-section">
                  <span className="flagships-label">
                    FLAGSHIP ATTRACTIONS &amp; CIRCUITS
                  </span>
                  <div className="flagship-tags">
                    {(Array.isArray(item.flagships) && item.flagships.length > 0 ? item.flagships : [item.type || item.category || 'Tourism Facility']).map((tag, idx) => (
                      <span key={idx} className="flagship-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer with Officer */}
                <div className="est-card-footer">
                  <div className="est-officer-info">
                    <User size={15} className="est-officer-icon" />
                    <span className="est-officer-name">{item.officer || item.contact || item.email || "General Manager"}</span>
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

export default MonitoredEstablishments;
