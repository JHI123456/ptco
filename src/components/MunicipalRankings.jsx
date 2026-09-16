      import React, { useState } from "react";
      import { ChevronDown, ChevronUp } from "lucide-react";
      import "./MunicipalRankings.css";

      const ALL_MUNICIPALITIES = [
        {
          rank: 1,
          municipality: "Solano",
          visitors: "16,842",
          establishments: 188,
          complaints: 14,
          trend: "+16.7%",
          badgeColor: "#1e7e34",
          barColor: "#1e7e34",
        },
        {
          rank: 2,
          municipality: "Bayombong",
          visitors: "14,260",
          establishments: 156,
          complaints: 21,
          trend: "+15.3%",
          badgeColor: "#ea580c",
          barColor: "#ea580c",
        },
        {
          rank: 3,
          municipality: "Aritao",
          visitors: "11,894",
          establishments: 132,
          complaints: 9,
          trend: "+9.8%",
          badgeColor: "#f59e0b",
          barColor: "#f59e0b",
        },
        {
          rank: 4,
          municipality: "Bambang",
          visitors: "9,450",
          establishments: 104,
          complaints: 12,
          trend: "+8.4%",
          badgeColor: "#10b981",
          barColor: "#10b981",
        },
        {
          rank: 5,
          municipality: "Bagabag",
          visitors: "8,120",
          establishments: 89,
          complaints: 7,
          trend: "+7.2%",
          badgeColor: "#06b6d4",
          barColor: "#06b6d4",
        },
        {
          rank: 6,
          municipality: "Santa Fe",
          visitors: "7,340",
          establishments: 76,
          complaints: 16,
          trend: "+6.5%",
          badgeColor: "#6366f1",
          barColor: "#6366f1",
        },
        {
          rank: 7,
          municipality: "Dupax del Norte",
          visitors: "6,890",
          establishments: 68,
          complaints: 5,
          trend: "+5.9%",
          badgeColor: "#8b5cf6",
          barColor: "#8b5cf6",
        },
        {
          rank: 8,
          municipality: "Kasibu",
          visitors: "6,210",
          establishments: 54,
          complaints: 8,
          trend: "+8.1%",
          badgeColor: "#ec4899",
          barColor: "#ec4899",
        },
        {
          rank: 9,
          municipality: "Quezon",
          visitors: "5,430",
          establishments: 47,
          complaints: 4,
          trend: "+4.3%",
          badgeColor: "#64748b",
          barColor: "#64748b",
        },
        {
          rank: 10,
          municipality: "Diadi",
          visitors: "4,920",
          establishments: 42,
          complaints: 6,
          trend: "+5.0%",
          badgeColor: "#64748b",
          barColor: "#64748b",
        },
        {
          rank: 11,
          municipality: "Dupax del Sur",
          visitors: "4,350",
          establishments: 38,
          complaints: 3,
          trend: "+3.8%",
          badgeColor: "#64748b",
          barColor: "#64748b",
        },
        {
          rank: 12,
          municipality: "Kayapa",
          visitors: "3,890",
          establishments: 31,
          complaints: 5,
          trend: "+4.1%",
          badgeColor: "#64748b",
          barColor: "#64748b",
        },
        {
          rank: 13,
          municipality: "Villaverde",
          visitors: "3,420",
          establishments: 29,
          complaints: 2,
          trend: "+2.9%",
          badgeColor: "#64748b",
          barColor: "#64748b",
        },
        {
          rank: 14,
          municipality: "Alfonso Castañeda",
          visitors: "2,780",
          establishments: 22,
          complaints: 4,
          trend: "+3.5%",
          badgeColor: "#64748b",
          barColor: "#64748b",
        },
        {
          rank: 15,
          municipality: "Ambaguio",
          visitors: "2,150",
          establishments: 18,
          complaints: 3,
          trend: "+2.1%",
          badgeColor: "#64748b",
          barColor: "#64748b",
        },
      ];

      const MunicipalRankings = ({ initialCount = 3 }) => {
        const [showAll, setShowAll] = useState(false);

        // Maximum establishments among data for relative bar sizing
        const maxEstablishments = 200;
        const maxBarWidthPx = 150;

        const displayedList = showAll
          ? ALL_MUNICIPALITIES
          : ALL_MUNICIPALITIES.slice(0, initialCount);

        return (
          <div className="rankings-card" id="municipal-rankings">
            <div className="rankings-header">
              <h3 className="rankings-title">Municipal Performance Rankings</h3>
              <button
                type="button"
                className="view-all-toggle-btn"
                onClick={() => setShowAll(!showAll)}
                title={showAll ? "Show Top 3" : "View all municipalities"}
                aria-expanded={showAll}
              >
                <span>{showAll ? "Show Top 3" : "View All (15)"}</span>
                {showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            <div className="rankings-table-wrapper">
              <table className="rankings-table">
                <thead>
                  <tr>
                    <th className="col-rank">Rank</th>
                    <th className="col-municipality">Municipality</th>
                    <th className="col-visitors">Visitors</th>
                    <th className="col-establishments">Establishments</th>
                    <th className="col-complaints">Most Complaints</th>
                    <th className="col-trend">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedList.map((item) => {
                    const barWidth = Math.max(
                      16,
                      Math.round((item.establishments / maxEstablishments) * maxBarWidthPx)
                    );

                    return (
                      <tr key={item.municipality} className="ranking-row">
                        {/* RANK BADGE */}
                        <td className="col-rank">
                          <span
                            className="rank-badge"
                            style={{ backgroundColor: item.badgeColor }}
                          >
                            {item.rank}
                          </span>
                        </td>

                        {/* MUNICIPALITY NAME */}
                        <td className="col-municipality">
                          <span className="municipality-name">{item.municipality}</span>
                        </td>

                        {/* VISITORS */}
                        <td className="col-visitors">
                          <span className="visitors-value">{item.visitors}</span>
                        </td>

                        {/* ESTABLISHMENTS */}
                        <td className="col-establishments">
                          <div className="establishment-progress-container">
                            <div
                              className="establishment-bar"
                              style={{
                                width: `${barWidth}px`,
                                backgroundColor: item.barColor,
                              }}
                            />
                            <span className="establishment-count">
                              {item.establishments}
                            </span>
                          </div>
                        </td>

                        {/* MOST COMPLAINTS */}
                        <td className="col-complaints">
                          <div className="complaints-progress-container">
                            <div
                              className="complaints-bar"
                              style={{
                                width: `${barWidth}px`,
                                backgroundColor: item.barColor,
                              }}
                            />
                            <span className="complaints-count">
                              {item.complaints}
                            </span>
                          </div>
                        </td>

                        {/* TREND */}
                        <td className="col-trend">
                          <div className="trend-badge">
                            <span className="trend-icon">↑</span>
                            <span className="trend-value">{item.trend}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      };

      export default MunicipalRankings;
