import React, { useState } from "react";
import { ChevronDown, Calendar, Filter, Download } from "lucide-react";
import "./VisitorReport.css";

// Sample monthly tourist volume progression data
const MONTHLY_DATA = {
  "All municipalities": [
    { month: "Jan", label: "Jan", domestic: 500, overnight: 240, foreign: 40 },
    { month: "Feb", label: "Feb", domestic: 540, overnight: 250, foreign: 35 },
    { month: "Mar", label: "Mar", domestic: 680, overnight: 310, foreign: 45 },
    { month: "Apr", label: "Apr (Holyweek)", domestic: 1050, overnight: 540, foreign: 85 },
    { month: "May", label: "May (Summer)", domestic: 970, overnight: 480, foreign: 75 },
    { month: "Jun", label: "Jun", domestic: 540, overnight: 240, foreign: 30 },
    { month: "Jul", label: "Jul", domestic: 750, overnight: 360, foreign: 50 },
    { month: "Aug", label: "Aug (YTD)", domestic: 820, overnight: 390, foreign: 65 },
  ],
  "Solano": [
    { month: "Jan", label: "Jan", domestic: 130, overnight: 65, foreign: 12 },
    { month: "Feb", label: "Feb", domestic: 145, overnight: 70, foreign: 10 },
    { month: "Mar", label: "Mar", domestic: 180, overnight: 85, foreign: 15 },
    { month: "Apr", label: "Apr (Holyweek)", domestic: 280, overnight: 150, foreign: 28 },
    { month: "May", label: "May (Summer)", domestic: 260, overnight: 130, foreign: 22 },
    { month: "Jun", label: "Jun", domestic: 140, overnight: 60, foreign: 9 },
    { month: "Jul", label: "Jul", domestic: 200, overnight: 95, foreign: 16 },
    { month: "Aug", label: "Aug (YTD)", domestic: 220, overnight: 105, foreign: 18 },
  ],
  "Bayombong": [
    { month: "Jan", label: "Jan", domestic: 110, overnight: 55, foreign: 9 },
    { month: "Feb", label: "Feb", domestic: 120, overnight: 58, foreign: 8 },
    { month: "Mar", label: "Mar", domestic: 150, overnight: 70, foreign: 11 },
    { month: "Apr", label: "Apr (Holyweek)", domestic: 230, overnight: 120, foreign: 20 },
    { month: "May", label: "May (Summer)", domestic: 215, overnight: 110, foreign: 17 },
    { month: "Jun", label: "Jun", domestic: 120, overnight: 50, foreign: 7 },
    { month: "Jul", label: "Jul", domestic: 165, overnight: 80, foreign: 12 },
    { month: "Aug", label: "Aug (YTD)", domestic: 180, overnight: 88, foreign: 14 },
  ],
  "Aritao": [
    { month: "Jan", label: "Jan", domestic: 90, overnight: 45, foreign: 7 },
    { month: "Feb", label: "Feb", domestic: 95, overnight: 46, foreign: 6 },
    { month: "Mar", label: "Mar", domestic: 120, overnight: 55, foreign: 8 },
    { month: "Apr", label: "Apr (Holyweek)", domestic: 190, overnight: 95, foreign: 15 },
    { month: "May", label: "May (Summer)", domestic: 175, overnight: 85, foreign: 13 },
    { month: "Jun", label: "Jun", domestic: 95, overnight: 42, foreign: 5 },
    { month: "Jul", label: "Jul", domestic: 135, overnight: 65, foreign: 9 },
    { month: "Aug", label: "Aug (YTD)", domestic: 145, overnight: 70, foreign: 11 },
  ],
};

const MUNICIPALITIES_LIST = [
  "All municipalities",
  "Solano",
  "Bayombong",
  "Aritao",
  "Bambang",
  "Bagabag",
  "Santa Fe",
  "Dupax del Norte",
  "Kasibu",
  "Quezon",
  "Diadi",
  "Dupax del Sur",
  "Kayapa",
  "Villaverde",
  "Alfonso Castañeda",
  "Ambaguio",
];

const VisitorReport = () => {
  const [selectedMunicipality, setSelectedMunicipality] = useState("All municipalities");
  const [dateRange, setDateRange] = useState("Jan 1 - Aug 31 (2026)");
  const [groupBy, setGroupBy] = useState("Monthly");
  const [compareWith, setCompareWith] = useState("Previous period");
  const [hoveredBar, setHoveredBar] = useState(null);

  // Get active dataset
  const activeData = MONTHLY_DATA[selectedMunicipality] || MONTHLY_DATA["All municipalities"];

  // Calculate or define KPI counts (matching the mockup values by default)
  const isDefaultView = selectedMunicipality === "All municipalities";
  const totalVisitors = isDefaultView ? 100 : Math.round(activeData.reduce((acc, curr) => acc + curr.domestic + curr.foreign, 0) / 50);
  const overnightVisitors = isDefaultView ? 95 : Math.round(activeData.reduce((acc, curr) => acc + curr.overnight, 0) / 28);
  const foreignVisitors = isDefaultView ? 15 : Math.round(activeData.reduce((acc, curr) => acc + curr.foreign, 0) / 25);
  const domesticVisitors = isDefaultView ? 85 : Math.round(activeData.reduce((acc, curr) => acc + curr.domestic, 0) / 65);

  // Y-axis configuration
  const maxY = 1500;
  const yTicks = [1500, 1000, 500, 0];

  // Chart dimensions
  const chartHeight = 320;
  const chartWidth = 960;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 45;
  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const groupWidth = innerWidth / activeData.length;
  const barWidth = 14;
  const barGap = 4;

  return (
    <div className="visitor-report-container">
      {/* 4 SUMMARY METRIC CARDS */}
      <div className="visitor-kpi-grid">
        {/* Total visitor arrival */}
        <div className="visitor-kpi-card mint-card">
          <span className="kpi-label serif-label">Total visitor arrival</span>
          <strong className="kpi-number">{totalVisitors}</strong>
        </div>

        {/* Overnight */}
        <div className="visitor-kpi-card lavender-card">
          <span className="kpi-label serif-label">Overnight</span>
          <strong className="kpi-number">{overnightVisitors}</strong>
        </div>

        {/* Foreign */}
        <div className="visitor-kpi-card gold-card">
          <span className="kpi-label serif-label">Foreign</span>
          <strong className="kpi-number">{foreignVisitors}</strong>
        </div>

        {/* Domestic */}
        <div className="visitor-kpi-card emerald-card">
          <span className="kpi-label serif-label">Domestic</span>
          <strong className="kpi-number">{domesticVisitors}</strong>
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
              {MUNICIPALITIES_LIST.map((mun) => (
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
              <option value="Jan 1 - Aug 31 (2026)">Jan 1 - Aug 31 (2026)</option>
              <option value="Q1 2026 (Jan - Mar)">Q1 2026 (Jan - Mar)</option>
              <option value="Q2 2026 (Apr - Jun)">Q2 2026 (Apr - Jun)</option>
              <option value="Full Year 2026">Full Year 2026</option>
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
              <option value="Previous year (2025)">Previous year (2025)</option>
              <option value="None">None</option>
            </select>
            <ChevronDown size={15} className="select-chevron" />
          </div>
        </div>
      </div>

      {/* MONTHLY TOURIST VOLUME OF OVERNIGHT STAYS CHART CARD */}
      <div className="visitor-chart-card">
        {/* Card Header & Legend */}
        <div className="chart-header-row">
          <div className="chart-title-group">
            <h3 className="chart-main-title">
              Monthly Tourist Volume of Overnight Stays
            </h3>
            <p className="chart-subtitle">
              Official monthly progression of domestic, foreign, and overnight travelers in Nueva Vizcaya
            </p>
          </div>

          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot dot-domestic"></span>
              <span className="legend-text">Domestic</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-overnight"></span>
              <span className="legend-text">local</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-foreign"></span>
              <span className="legend-text">Foreign</span>
            </div>
          </div>
        </div>

        {/* Grouped Bar Chart */}
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
                    {val}
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
            {activeData.map((item, index) => {
              const groupCenterX = paddingLeft + index * groupWidth + groupWidth / 2;
              const totalClusterWidth = barWidth * 3 + barGap * 2;
              const startX = groupCenterX - totalClusterWidth / 2;

              // Heights scaled to maxY (1500)
              const domesticHeight = Math.max(4, (item.domestic / maxY) * innerHeight);
              const overnightHeight = Math.max(4, (item.overnight / maxY) * innerHeight);
              const foreignHeight = Math.max(4, (item.foreign / maxY) * innerHeight);

              const domesticY = paddingTop + innerHeight - domesticHeight;
              const overnightY = paddingTop + innerHeight - overnightHeight;
              const foreignY = paddingTop + innerHeight - foreignHeight;

              const domesticX = startX;
              const overnightX = startX + barWidth + barGap;
              const foreignX = startX + (barWidth + barGap) * 2;

              return (
                <g key={item.month} className="month-group">
                  {/* Domestic Bar (Green) */}
                  <rect
                    x={domesticX}
                    y={domesticY}
                    width={barWidth}
                    height={domesticHeight}
                    rx="1.5"
                    className="bar bar-domestic"
                    onMouseEnter={() =>
                      setHoveredBar({
                        month: item.label,
                        type: "Domestic",
                        value: item.domestic,
                        x: domesticX + barWidth / 2,
                        y: domesticY,
                      })
                    }
                    onMouseLeave={() => setHoveredBar(null)}
                  />

                  {/* Overnight Bar (Blue) */}
                  <rect
                    x={overnightX}
                    y={overnightY}
                    width={barWidth}
                    height={overnightHeight}
                    rx="1.5"
                    className="bar bar-overnight"
                    onMouseEnter={() =>
                      setHoveredBar({
                        month: item.label,
                        type: "Overnight",
                        value: item.overnight,
                        x: overnightX + barWidth / 2,
                        y: overnightY,
                      })
                    }
                    onMouseLeave={() => setHoveredBar(null)}
                  />

                  {/* Foreign Bar (Orange) */}
                  <rect
                    x={foreignX}
                    y={foreignY}
                    width={barWidth}
                    height={foreignHeight}
                    rx="1.5"
                    className="bar bar-foreign"
                    onMouseEnter={() =>
                      setHoveredBar({
                        month: item.label,
                        type: "Foreign",
                        value: item.foreign,
                        x: foreignX + barWidth / 2,
                        y: foreignY,
                      })
                    }
                    onMouseLeave={() => setHoveredBar(null)}
                  />

                  {/* X-Axis Month Label */}
                  <text
                    x={groupCenterX}
                    y={chartHeight - 12}
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
              <div className="tooltip-title">{hoveredBar.month}</div>
              <div className="tooltip-detail">
                <span className={`tooltip-dot dot-${hoveredBar.type.toLowerCase()}`}></span>
                <span className="tooltip-label">{hoveredBar.type}:</span>
                <strong className="tooltip-value">{hoveredBar.value.toLocaleString()}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorReport;
