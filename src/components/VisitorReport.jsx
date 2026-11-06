import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronDown,
  PlusCircle,
  RotateCcw,
  X,
  Check,
  Info
} from "lucide-react";
import "./VisitorReport.css";
import { fetchLGUs, fetchVisitorAnalytics } from "../services/api";

const DEFAULT_MONTHS = [
  { month: "Jan", label: "Jan", domestic: 0, overnight: 0, foreign: 0 },
  { month: "Feb", label: "Feb", domestic: 0, overnight: 0, foreign: 0 },
  { month: "Mar", label: "Mar", domestic: 0, overnight: 0, foreign: 0 },
  { month: "Apr", label: "Apr (Holyweek)", domestic: 0, overnight: 0, foreign: 0 },
  { month: "May", label: "May (Summer)", domestic: 0, overnight: 0, foreign: 0 },
  { month: "Jun", label: "Jun", domestic: 0, overnight: 0, foreign: 0 },
  { month: "Jul", label: "Jul", domestic: 0, overnight: 0, foreign: 0 },
  { month: "Aug", label: "Aug", domestic: 0, overnight: 0, foreign: 0 },
  { month: "Sep", label: "Sep", domestic: 0, overnight: 0, foreign: 0 },
  { month: "Oct", label: "Oct", domestic: 0, overnight: 0, foreign: 0 },
  { month: "Nov", label: "Nov", domestic: 0, overnight: 0, foreign: 0 },
  { month: "Dec", label: "Dec (Holiday)", domestic: 0, overnight: 0, foreign: 0 },
];

const createEmptyDataset = () => {
  return {
    "All municipalities": DEFAULT_MONTHS.map((m) => ({ ...m })),
  };
};

const VisitorReport = () => {
  // Calendar-accurate date references
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();
  const todayFormatted = useMemo(
    () =>
      now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [now]
  );
  const todayShort = useMemo(
    () =>
      now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    [now]
  );
  const currentMonthLong = useMemo(
    () => now.toLocaleString("en-US", { month: "long" }),
    [now]
  );
  const currentMonthShort = useMemo(
    () => now.toLocaleString("en-US", { month: "short" }),
    [now]
  );

  const [registeredMunicipalities, setRegisteredMunicipalities] = useState([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState("All municipalities");
  const [dateRange, setDateRange] = useState("Today");
  const [groupBy, setGroupBy] = useState("Monthly");
  const [compareWith, setCompareWith] = useState("Previous period");
  const [hoveredBar, setHoveredBar] = useState(null);

  // Modal State for adding/logging visitor numbers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMunicipality, setFormMunicipality] = useState("");
  const [formMonth, setFormMonth] = useState(currentMonthShort);
  const [formDomestic, setFormDomestic] = useState("");
  const [formOvernight, setFormOvernight] = useState("");
  const [formForeign, setFormForeign] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  // Initialize dataset: populated live from backend MongoDB API
  const [todayData, setTodayData] = useState({});
  const [monthlyData, setMonthlyData] = useState(() => {
    try {
      const saved = localStorage.getItem("turismotrack_visitor_dataset");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch { }
    return createEmptyDataset();
  });

  // Fetch live aggregated visitor analytics from backend MongoDB
  useEffect(() => {
    let isMounted = true;
    const loadVisitorData = () => {
      fetchVisitorAnalytics().then((res) => {
        if (isMounted && res?.success && res?.data) {
          if (Array.isArray(res.municipalities)) {
            setRegisteredMunicipalities(res.municipalities);
          }
          setMonthlyData(res.data);
          if (res.today) {
            setTodayData(res.today);
          }
          try {
            localStorage.setItem("turismotrack_visitor_dataset", JSON.stringify(res.data));
          } catch { }
        }
      });
      fetchLGUs().then((data) => {
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            const names = data.map((d) => d.name);
            setRegisteredMunicipalities((prev) => {
              const combined = Array.from(new Set([...prev, ...names]));
              return combined;
            });
          } else if (Array.isArray(data) && data.length === 0) {
            setRegisteredMunicipalities([]);
          }
        }
      });
    };

    loadVisitorData();
    const interval = setInterval(loadVisitorData, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const availableMunicipalities = useMemo(() => {
    if (registeredMunicipalities.length === 0) return ["All municipalities"];
    return ["All municipalities", ...registeredMunicipalities];
  }, [registeredMunicipalities]);

  // Derive current formMunicipality aligned with available options
  const effectiveFormMunicipality = useMemo(() => {
    if (registeredMunicipalities.length > 0 && !registeredMunicipalities.includes(formMunicipality)) {
      return registeredMunicipalities[0];
    }
    return formMunicipality;
  }, [registeredMunicipalities, formMunicipality]);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("turismotrack_visitor_dataset", JSON.stringify(monthlyData));
    } catch { }
  }, [monthlyData]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  // Compute active dataset for selected municipality
  const activeMonths = useMemo(() => {
    if (selectedMunicipality === "All municipalities") {
      // Sum aggregates across all 15 municipalities
      return DEFAULT_MONTHS.map((m, idx) => {
        let domestic = 0;
        let overnight = 0;
        let foreign = 0;

        const targetMunicipalities = registeredMunicipalities.length > 0
          ? registeredMunicipalities
          : Object.keys(monthlyData).filter((k) => k !== "All municipalities");

        targetMunicipalities.forEach((mun) => {
          const mData = monthlyData[mun]?.[idx];
          if (mData) {
            domestic += Number(mData.domestic) || 0;
            overnight += Number(mData.overnight) || 0;
            foreign += Number(mData.foreign) || 0;
          }
        });

        // Also check if "All municipalities" has directly entered numbers
        const directAll = monthlyData["All municipalities"]?.[idx];
        if (domestic === 0 && overnight === 0 && foreign === 0 && directAll) {
          domestic = Number(directAll.domestic) || 0;
          overnight = Number(directAll.overnight) || 0;
          foreign = Number(directAll.foreign) || 0;
        }

        return {
          month: m.month,
          label: m.label,
          domestic,
          overnight,
          foreign,
        };
      });
    }

    return monthlyData[selectedMunicipality] || DEFAULT_MONTHS;
  }, [monthlyData, selectedMunicipality, registeredMunicipalities]);

  // Filter months based on Date Range filter
  const displayData = useMemo(() => {
    if (dateRange === "Today" || dateRange.startsWith("Today")) {
      const todayStats = todayData[selectedMunicipality] || {
        domestic: 0,
        overnight: 0,
        foreign: 0,
        total: 0,
      };
      return [
        {
          month: "Today",
          label: `Today (${todayShort})`,
          domestic: Number(todayStats.domestic) || 0,
          overnight: Number(todayStats.overnight) || 0,
          foreign: Number(todayStats.foreign) || 0,
        },
      ];
    }
    if (dateRange === "This Month" || dateRange.startsWith("This Month")) {
      const currentMonth = activeMonths[currentMonthIdx] || activeMonths[0] || DEFAULT_MONTHS[0];
      return [
        {
          ...currentMonth,
          label: `${currentMonth.month} ${currentYear}`,
        },
      ];
    }
    if (
      dateRange === "YTD" ||
      dateRange.startsWith("Year to Date") ||
      dateRange.startsWith("Jan 1 -")
    ) {
      return activeMonths.slice(0, currentMonthIdx + 1);
    }
    if (dateRange.startsWith("Q1")) return activeMonths.slice(0, 3);
    if (dateRange.startsWith("Q2")) return activeMonths.slice(3, 6);
    if (dateRange.startsWith("Q3")) return activeMonths.slice(6, 9);
    if (dateRange.startsWith("Q4")) return activeMonths.slice(9, 12);
    // Default: Full Year -> all 12 months (Jan - Dec)
    return activeMonths.slice(0, 12);
  }, [activeMonths, dateRange, currentMonthIdx, currentYear, todayShort, todayData, selectedMunicipality]);

  // Compute REAL aggregate KPIs based on the filtered data
  const totalDomestic = useMemo(
    () => displayData.reduce((acc, curr) => acc + (Number(curr.domestic) || 0), 0),
    [displayData]
  );
  const totalOvernight = useMemo(
    () => displayData.reduce((acc, curr) => acc + (Number(curr.overnight) || 0), 0),
    [displayData]
  );
  const totalForeign = useMemo(
    () => displayData.reduce((acc, curr) => acc + (Number(curr.foreign) || 0), 0),
    [displayData]
  );
  const totalArrivals = totalDomestic + totalForeign;

  // Maximum value among active bars to dynamically scale the Y-Axis
  const maxDataVal = useMemo(() => {
    return Math.max(
      ...displayData.flatMap((d) => [
        Number(d.domestic) || 0,
        Number(d.overnight) || 0,
        Number(d.foreign) || 0,
      ]),
      0
    );
  }, [displayData]);

  // Dynamic Y-axis scale (adapts cleanly to 0, tens, hundreds, or thousands)
  const maxY = useMemo(() => {
    if (maxDataVal <= 0) return 100; // Baseline grid reference when 0
    if (maxDataVal <= 20) return 20;
    if (maxDataVal <= 50) return 50;
    if (maxDataVal <= 100) return 100;
    if (maxDataVal <= 500) return Math.ceil(maxDataVal / 100) * 100;
    if (maxDataVal <= 1500) return Math.ceil(maxDataVal / 250) * 250;
    return Math.ceil(maxDataVal / 500) * 500;
  }, [maxDataVal]);

  const yTicks = useMemo(() => {
    return [
      maxY,
      Math.round(maxY * 0.75),
      Math.round(maxY * 0.5),
      Math.round(maxY * 0.25),
      0,
    ];
  }, [maxY]);

  // SVG Chart Layout Dimensions
  const chartHeight = 320;
  const chartWidth = 960;
  const paddingLeft = 56;
  const paddingRight = 32;
  const paddingTop = 26;
  const paddingBottom = 48;
  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const count = displayData.length || 1;
  const groupWidth = innerWidth / count;
  const barWidth = Math.max(8, Math.min(18, (groupWidth - 28) / 3));
  const barGap = 4;

  // Handler: Clear all data back to 0
  const handleClearAllData = () => {
    const empty = createEmptyDataset();
    setMonthlyData(empty);
    try {
      localStorage.setItem("turismotrack_visitor_dataset", JSON.stringify(empty));
      window.dispatchEvent(new Event("storage"));
    } catch { }
    setToastMessage("All tourist volume data has been reset to 0.");
  };

  // Handler: Submit manual data entry
  const handleSaveEntry = (e) => {
    e.preventDefault();
    const domesticVal = Math.max(0, parseInt(formDomestic, 10) || 0);
    const overnightVal = Math.max(0, parseInt(formOvernight, 10) || 0);
    const foreignVal = Math.max(0, parseInt(formForeign, 10) || 0);

    setMonthlyData((prev) => {
      const updated = { ...prev };
      const currentList = updated[effectiveFormMunicipality]
        ? [...updated[effectiveFormMunicipality]]
        : DEFAULT_MONTHS.map((m) => ({ ...m }));

      const targetIdx = currentList.findIndex((m) => m.month === formMonth);
      if (targetIdx !== -1) {
        currentList[targetIdx] = {
          ...currentList[targetIdx],
          domestic: domesticVal,
          overnight: overnightVal,
          foreign: foreignVal,
        };
      }
      updated[effectiveFormMunicipality] = currentList;
      return updated;
    });

    setIsModalOpen(false);
    setFormDomestic("");
    setFormOvernight("");
    setFormForeign("");
    setToastMessage(`Saved ${formMonth} arrivals for ${effectiveFormMunicipality}.`);
  };

  return (
    <div className="visitor-report-container">
      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="visitor-toast" role="alert">
          <Check size={16} className="toast-icon" />
          <span>{toastMessage}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => setToastMessage(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 4 SUMMARY METRIC CARDS - ACCURATELY COMPUTED */}
      <div className="visitor-kpi-grid">
        {/* Total visitor arrival */}
        <div className="visitor-kpi-card mint-card">
          <span className="kpi-label serif-label">Total visitor arrival</span>
          <strong className="kpi-number">{totalArrivals.toLocaleString()}</strong>
        </div>

        {/* Overnight */}
        <div className="visitor-kpi-card lavender-card">
          <span className="kpi-label serif-label">Overnight</span>
          <strong className="kpi-number">{totalOvernight.toLocaleString()}</strong>
        </div>

        {/* Foreign */}
        <div className="visitor-kpi-card gold-card">
          <span className="kpi-label serif-label">Foreign</span>
          <strong className="kpi-number">{totalForeign.toLocaleString()}</strong>
        </div>

        {/* Domestic */}
        <div className="visitor-kpi-card emerald-card">
          <span className="kpi-label serif-label">Domestic</span>
          <strong className="kpi-number">{totalDomestic.toLocaleString()}</strong>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="visitor-filter-panel">
        <div className="filter-item">
          <label htmlFor="filter-municipalities" className="filter-label">
            municipalities
          </label>
          <div className="filter-select-wrapper">
            <select
              id="filter-municipalities"
              className="filter-select"
              value={selectedMunicipality}
              onChange={(e) => setSelectedMunicipality(e.target.value)}
            >
              {availableMunicipalities.map((mun) => (
                <option key={mun} value={mun}>
                  {mun}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="select-chevron" />
          </div>
        </div>

        <div className="filter-item">
          <label htmlFor="filter-date-range" className="filter-label">
            date range
          </label>
          <div className="filter-select-wrapper">
            <select
              id="filter-date-range"
              className="filter-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <optgroup label="Calendar Accurate">
                <option value="Today">Today ({todayFormatted})</option>
                <option value="Full Year">Full Year {currentYear} (Jan - Dec)</option>
                <option value="YTD">Year to Date (Jan 1 - {todayFormatted})</option>
                <option value="This Month">This Month ({currentMonthLong} {currentYear})</option>
              </optgroup>
              <optgroup label={`Quarterly (${currentYear})`}>
                <option value={`Q1 ${currentYear} (Jan - Mar)`}>Q1 {currentYear} (Jan - Mar)</option>
                <option value={`Q2 ${currentYear} (Apr - Jun)`}>Q2 {currentYear} (Apr - Jun)</option>
                <option value={`Q3 ${currentYear} (Jul - Sep)`}>Q3 {currentYear} (Jul - Sep)</option>
                <option value={`Q4 ${currentYear} (Oct - Dec)`}>Q4 {currentYear} (Oct - Dec)</option>
              </optgroup>
            </select>
            <ChevronDown size={15} className="select-chevron" />
          </div>
        </div>

        <div className="filter-item">
          <label htmlFor="filter-group-by" className="filter-label">
            group by
          </label>
          <div className="filter-select-wrapper">
            <select
              id="filter-group-by"
              className="filter-select"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Weekly">Weekly</option>
            </select>
            <ChevronDown size={15} className="select-chevron" />
          </div>
        </div>

        <div className="filter-item">
          <label htmlFor="filter-compare-with" className="filter-label">
            compare with
          </label>
          <div className="filter-select-wrapper">
            <select
              id="filter-compare-with"
              className="filter-select"
              value={compareWith}
              onChange={(e) => setCompareWith(e.target.value)}
            >
              <option value="Previous period">Previous period</option>
              <option value={`Previous year (${currentYear - 1})`}>
                {`Previous year (${currentYear - 1})`}
              </option>
              <option value="None">None</option>
            </select>
            <ChevronDown size={15} className="select-chevron" />
          </div>
        </div>
      </div>

      {/* MONTHLY TOURIST VOLUME OF OVERNIGHT STAYS CHART CARD */}
      <div className="visitor-chart-card">
        {/* Card Header, Actions & Legend */}
        <div className="chart-header-row">
          <div className="chart-title-group">
            <div className="chart-title-badge-row">
              <h3 className="chart-main-title">
                Monthly Tourist Volume of Overnight Stays
              </h3>
              <span className="chart-lgu-pill">{selectedMunicipality}</span>
            </div>
            <p className="chart-subtitle">
              Official monthly progression of domestic, foreign, and overnight travelers in Nueva Vizcaya
            </p>
          </div>

          {/* Quick Chart Management Actions */}
          <div className="chart-top-actions">
            <button
              type="button"
              className="action-btn btn-log"
              onClick={() => {
                if (selectedMunicipality !== "All municipalities") {
                  setFormMunicipality(selectedMunicipality);
                }
                setIsModalOpen(true);
              }}
              title="Add or update visitor volume numbers"
            >
              <PlusCircle size={14} />
              <span>Log Data</span>
            </button>

            <button
              type="button"
              className="action-btn btn-clear"
              onClick={handleClearAllData}
              title="Remove all data and reset to 0"
            >
              <RotateCcw size={14} />
              <span>Reset to 0</span>
            </button>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot dot-domestic"></span>
              <span className="legend-text">Domestic</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-overnight"></span>
              <span className="legend-text">Local / Overnight</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-foreign"></span>
              <span className="legend-text">Foreign</span>
            </div>
          </div>
        </div>

        {/* Zero-Data Informative State Callout */}
        {maxDataVal === 0 && (
          <div className="zero-data-banner">
            <div className="zero-data-content">
              <Info size={18} className="zero-info-icon" />
              <div>
                <strong>No visitor submissions recorded yet (0 tourist arrivals)</strong>
                <p>
                  Visitor counts will automatically populate here when establishments submit check-in logs or monthly reports. You can also click <b>Log Data</b> to enter an official visitor arrival record.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Grouped Bar Chart SVG */}
        <div className="chart-svg-wrapper">
          <svg
            className="grouped-bar-svg"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Horizontal Gridlines & Y-Axis Labels */}
            {yTicks.map((val) => {
              const yPos = paddingTop + innerHeight - (val / maxY) * innerHeight;
              return (
                <g key={val} className="grid-group">
                  <text
                    x={paddingLeft - 12}
                    y={yPos + 4}
                    textAnchor="end"
                    className="y-axis-label"
                  >
                    {val.toLocaleString()}
                  </text>
                  <line
                    x1={paddingLeft}
                    y1={yPos}
                    x2={chartWidth - paddingRight}
                    y2={yPos}
                    className="chart-grid-line"
                  />
                </g>
              );
            })}

            {/* Baseline */}
            <line
              x1={paddingLeft}
              y1={paddingTop + innerHeight}
              x2={chartWidth - paddingRight}
              y2={paddingTop + innerHeight}
              className="chart-base-line"
            />

            {/* Clustered Bars for Each Month */}
            {displayData.map((item, index) => {
              const groupCenterX = paddingLeft + index * groupWidth + groupWidth / 2;
              const totalClusterWidth = barWidth * 3 + barGap * 2;
              const startX = groupCenterX - totalClusterWidth / 2;

              const domesticVal = Number(item.domestic) || 0;
              const overnightVal = Number(item.overnight) || 0;
              const foreignVal = Number(item.foreign) || 0;

              // Heights scaled to maxY - exactly 0 when value is 0
              const domesticHeight = domesticVal > 0 ? Math.max(3, (domesticVal / maxY) * innerHeight) : 0;
              const overnightHeight = overnightVal > 0 ? Math.max(3, (overnightVal / maxY) * innerHeight) : 0;
              const foreignHeight = foreignVal > 0 ? Math.max(3, (foreignVal / maxY) * innerHeight) : 0;

              const domesticY = paddingTop + innerHeight - domesticHeight;
              const overnightY = paddingTop + innerHeight - overnightHeight;
              const foreignY = paddingTop + innerHeight - foreignHeight;

              const domesticX = startX;
              const overnightX = startX + barWidth + barGap;
              const foreignX = startX + (barWidth + barGap) * 2;

              return (
                <g key={item.month} className="month-group">
                  {/* Domestic Bar (Green) */}
                  {domesticHeight > 0 && (
                    <rect
                      x={domesticX}
                      y={domesticY}
                      width={barWidth}
                      height={domesticHeight}
                      rx="2"
                      className="bar bar-domestic"
                      onMouseEnter={() =>
                        setHoveredBar({
                          month: item.label,
                          municipality: selectedMunicipality,
                          type: "Domestic",
                          value: domesticVal,
                          x: domesticX + barWidth / 2,
                          y: domesticY,
                        })
                      }
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                  )}

                  {/* Overnight Bar (Blue) */}
                  {overnightHeight > 0 && (
                    <rect
                      x={overnightX}
                      y={overnightY}
                      width={barWidth}
                      height={overnightHeight}
                      rx="2"
                      className="bar bar-overnight"
                      onMouseEnter={() =>
                        setHoveredBar({
                          month: item.label,
                          municipality: selectedMunicipality,
                          type: "Local / Overnight",
                          value: overnightVal,
                          x: overnightX + barWidth / 2,
                          y: overnightY,
                        })
                      }
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                  )}

                  {/* Foreign Bar (Orange) */}
                  {foreignHeight > 0 && (
                    <rect
                      x={foreignX}
                      y={foreignY}
                      width={barWidth}
                      height={foreignHeight}
                      rx="2"
                      className="bar bar-foreign"
                      onMouseEnter={() =>
                        setHoveredBar({
                          month: item.label,
                          municipality: selectedMunicipality,
                          type: "Foreign",
                          value: foreignVal,
                          x: foreignX + barWidth / 2,
                          y: foreignY,
                        })
                      }
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                  )}

                  {/* Baseline Dot Indicator when all values are 0 */}
                  {domesticVal === 0 && overnightVal === 0 && foreignVal === 0 && (
                    <circle
                      cx={groupCenterX}
                      cy={paddingTop + innerHeight}
                      r="2.5"
                      fill="#94a3b8"
                      className="zero-dot"
                    >
                      <title>{`${item.label}: 0 arrivals recorded`}</title>
                    </circle>
                  )}

                  {/* X-Axis Month Label */}
                  <text
                    x={groupCenterX}
                    y={chartHeight - 14}
                    textAnchor="middle"
                    className="x-axis-label"
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip on hover */}
          {hoveredBar && (
            <div
              className="chart-tooltip"
              style={{
                left: `${(hoveredBar.x / chartWidth) * 100}%`,
                top: `${(hoveredBar.y / chartHeight) * 100}%`,
              }}
            >
              <div className="tooltip-title">
                {hoveredBar.month} • {hoveredBar.municipality}
              </div>
              <div className="tooltip-detail">
                <span
                  className={`tooltip-dot ${hoveredBar.type.includes("Domestic")
                      ? "dot-domestic"
                      : hoveredBar.type.includes("Foreign")
                        ? "dot-foreign"
                        : "dot-overnight"
                    }`}
                ></span>
                <span className="tooltip-label">{hoveredBar.type}:</span>
                <strong className="tooltip-value">
                  {hoveredBar.value.toLocaleString()}
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LOG / ENTER VISITOR DATA MODAL */}
      {isModalOpen && (
        <div className="visitor-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="visitor-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Log Tourist Volume Record</h3>
                <p>Record monthly visitor arrivals for any Nueva Vizcaya municipality</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="modal-municipality">Municipality</label>
                  <select
                    id="modal-municipality"
                    className="modal-input"
                    value={effectiveFormMunicipality}
                    onChange={(e) => setFormMunicipality(e.target.value)}
                  >
                    {registeredMunicipalities.length > 0 ? (
                      registeredMunicipalities.map((mun) => (
                        <option key={mun} value={mun}>
                          {mun}
                        </option>
                      ))
                    ) : (
                      <option value="">No registered municipalities</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="modal-month">Reporting Month</label>
                  <select
                    id="modal-month"
                    className="modal-input"
                    value={formMonth}
                    onChange={(e) => setFormMonth(e.target.value)}
                  >
                    {DEFAULT_MONTHS.map((m) => (
                      <option key={m.month} value={m.month}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="modal-domestic">
                  Domestic Travelers Arrival
                  <span className="field-hint">(Local Philippine travelers)</span>
                </label>
                <input
                  id="modal-domestic"
                  type="number"
                  min="0"
                  placeholder="e.g. 240"
                  className="modal-input"
                  value={formDomestic}
                  onChange={(e) => setFormDomestic(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-overnight">
                  Overnight / Local Stays
                  <span className="field-hint">(Guests staying 1+ nights)</span>
                </label>
                <input
                  id="modal-overnight"
                  type="number"
                  min="0"
                  placeholder="e.g. 110"
                  className="modal-input"
                  value={formOvernight}
                  onChange={(e) => setFormOvernight(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-foreign">
                  Foreign Visitors Arrival
                  <span className="field-hint">(International travelers)</span>
                </label>
                <input
                  id="modal-foreign"
                  type="number"
                  min="0"
                  placeholder="e.g. 25"
                  className="modal-input"
                  value={formForeign}
                  onChange={(e) => setFormForeign(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save &amp; Update Chart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorReport;
