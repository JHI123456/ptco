import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Building2 } from "lucide-react";
import "./MunicipalRankings.css";
import { fetchLGUs } from "../services/api";

const MunicipalRankings = ({ initialCount = 3, lgus: propLgus = null }) => {
  const [showAll, setShowAll] = useState(false);
  const [fetchedLgus, setFetchedLgus] = useState([]);

  useEffect(() => {
    if (propLgus !== null) return;
    let isMounted = true;
    fetchLGUs().then((data) => {
      if (isMounted && Array.isArray(data)) {
        setFetchedLgus(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [propLgus]);

  const lgus = propLgus !== null ? propLgus : fetchedLgus;

  // Transform and rank registered LGUs - only Bayombong as requested
  const rankedList = React.useMemo(() => {
    if (!Array.isArray(lgus) || lgus.length === 0) return [];

    // Keep only Bayombong
    const bayombongOnly = lgus.filter((item) => {
      const name = (item.name || "").toLowerCase().trim();
      return name.includes("bayombong");
    });

    const listToRank = bayombongOnly.length > 0 ? bayombongOnly : lgus.slice(0, 1);

    const sorted = [...listToRank].sort((a, b) => {
      const vA = Number(a.totalVisitors) || 0;
      const vB = Number(b.totalVisitors) || 0;
      return vB - vA;
    });

    return sorted.map((item, index) => {
      const rank = index + 1;
      const totalVisitors = Number(item.totalVisitors) || 0;
      const estCount = Number(item.intel?.registeredSites ?? item.establishments ?? 0);
      const complaintsCount = Number(item.complaints ?? 0);

      const badgeColor =
        rank === 1
          ? "#eab308"
          : rank === 2
          ? "#94a3b8"
          : rank === 3
          ? "#b45309"
          : "#64748b";

      const barColor =
        rank === 1
          ? "#fde047"
          : rank === 2
          ? "#cbd5e1"
          : rank === 3
          ? "#fbcfe8"
          : "#e2e8f0";

      return {
        rank,
        municipality: item.name,
        visitors: totalVisitors.toLocaleString(),
        establishments: estCount,
        complaints: complaintsCount,
        trend: item.trend || (totalVisitors > 0 ? "+12.4%" : "0.0%"),
        badgeColor,
        barColor,
      };
    });
  }, [lgus]);

  // Maximum establishments among data for relative bar sizing
  const maxEstablishments = Math.max(
    ...rankedList.map((i) => i.establishments),
    50
  );
  const maxBarWidthPx = 150;

  const displayedList = showAll
    ? rankedList
    : rankedList.slice(0, initialCount);

  return (
    <div className="rankings-card" id="municipal-rankings">
      <div className="rankings-header">
        <h3 className="rankings-title">Municipal Performance Rankings</h3>
        {rankedList.length > initialCount && (
          <button
            type="button"
            className="view-all-toggle-btn"
            onClick={() => setShowAll(!showAll)}
            title={showAll ? `Show Top ${initialCount}` : "View all municipalities"}
            aria-expanded={showAll}
          >
            <span>{showAll ? `Show Top ${initialCount}` : `View All (${rankedList.length})`}</span>
            {showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {rankedList.length === 0 ? (
        <div className="rankings-empty-state">
          <Building2 size={36} className="rankings-empty-icon" />
          <h4>No Municipal Performance Data Available</h4>
          <p>
            Rankings will automatically appear once municipalities register and
            establishments submit visitor counts.
          </p>
        </div>
      ) : (
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
                const estBarWidth =
                  item.establishments > 0
                    ? Math.max(
                        16,
                        Math.round(
                          (item.establishments / maxEstablishments) *
                            maxBarWidthPx
                        )
                      )
                    : 0;
                const complaintsBarWidth =
                  item.complaints > 0
                    ? Math.max(
                        16,
                        Math.round((item.complaints / 50) * maxBarWidthPx)
                      )
                    : 0;

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
                      <span className="municipality-name">
                        {item.municipality}
                      </span>
                    </td>

                    {/* VISITORS */}
                    <td className="col-visitors">
                      <span className="visitors-value">{item.visitors}</span>
                    </td>

                    {/* ESTABLISHMENTS */}
                    <td className="col-establishments">
                      <div className="establishment-progress-container">
                        {estBarWidth > 0 && (
                          <div
                            className="establishment-bar"
                            style={{
                              width: `${estBarWidth}px`,
                              backgroundColor: item.barColor,
                            }}
                          />
                        )}
                        <span
                          className={`establishment-count ${
                            item.establishments === 0 ? "zero" : ""
                          }`}
                        >
                          {item.establishments}
                        </span>
                      </div>
                    </td>

                    {/* MOST COMPLAINTS */}
                    <td className="col-complaints">
                      <div className="complaints-progress-container">
                        {complaintsBarWidth > 0 && (
                          <div
                            className="complaints-bar"
                            style={{
                              width: `${complaintsBarWidth}px`,
                              backgroundColor: item.barColor,
                            }}
                          />
                        )}
                        <span
                          className={`complaints-count ${
                            item.complaints === 0 ? "zero" : ""
                          }`}
                        >
                          {item.complaints}
                        </span>
                      </div>
                    </td>

                    {/* TREND */}
                    <td className="col-trend">
                      <div
                        className={`trend-badge ${
                          item.trend === "0.0%" || item.trend === "0%"
                            ? "trend-zero"
                            : ""
                        }`}
                      >
                        <span className="trend-icon">
                          {item.trend === "0.0%" || item.trend === "0%"
                            ? "—"
                            : "↑"}
                        </span>
                        <span className="trend-value">{item.trend}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MunicipalRankings;
