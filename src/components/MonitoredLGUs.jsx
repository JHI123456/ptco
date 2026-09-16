import React, { useState, useMemo, useEffect } from "react";
import {
  MapPin,
  Users,
  Building2,
  AlertTriangle,
  Search,
  ChevronDown,
  User,
  X
} from "lucide-react";
import "./MonitoredLGUs.css";
import { fetchLGUs } from "../services/api";

// ALL 15 MUNICIPALITIES OF NUEVA VIZCAYA
const LGUS_DATA = [
  {
    id: 1,
    name: "Diadi",
    district: "North",
    districtLabel: "NORTH DISTRICT • 9 Sites",
    badgeColor: "blue",
    quote: '"Crown Eco-Tourism Capital & Forest Reserve Paradise"',
    totalVisitors: 0,
    foreignMice: 0,
    capacityLoad: 0,
    status: "Optimal",
    statusType: "optimal",
    officer: "Eduardo G. Santos",
    officerRole: "Municipal Tourism Officer",
    flagships: [
      "Lower Magat Eco-Tourism Park (LMETP)",
      "Lake Forest Trails",
      "Magat Nature Reserve"
    ],
    intel: {
      registeredSites: 9,
      carryingCapacity: "1,500 tourists / day",
      currentHeadcount: "960 / 1,500",
      complianceRating: "100%",
      contactPhone: "+63 (078) 392-1108",
      contactEmail: "tourism@diadi-nv.gov.ph"
    }
  },
  {
    id: 2,
    name: "Solano",
    district: "Central",
    districtLabel: "CENTRAL DISTRICT • 16 Sites",
    badgeColor: "green",
    quote: '"Premier Commerce, Convention, and MICE Hospitality Hub"',
    totalVisitors: 0,
    foreignMice: 0,
    capacityLoad: 0,
    status: "Optimal",
    statusType: "optimal",
    officer: "Carlos V. Dela Cruz",
    officerRole: "Senior Tourism Officer",
    flagships: [
      "Solano Plaza Hotel & Convention Pavilion",
      "Bintawan Commercial District",
      "Food Tourism Strip"
    ],
    intel: {
      registeredSites: 16,
      carryingCapacity: "2,000 tourists / day",
      currentHeadcount: "1,140 / 2,000",
      complianceRating: "99.0%",
      contactPhone: "+63 (078) 326-5544",
      contactEmail: "tourism@solano.gov.ph"
    }
  },
  {
    id: 3,
    name: "Kasibu",
    district: "South",
    districtLabel: "SOUTH DISTRICT • 11 Sites",
    badgeColor: "amber",
    quote: '"Citrus Capital of the Philippines & Subterranean Cave Wonder"',
    totalVisitors: 0,
    foreignMice: 0,
    capacityLoad: 0,
    status: "Optimal",
    statusType: "optimal",
    officer: "Aida D. Bumidang",
    officerRole: "Tourism Action Officer",
    flagships: [
      "Capisaan Cave System",
      "Malabing Valley Citrus Farms",
      "Edralin Agri-Trek"
    ],
    intel: {
      registeredSites: 11,
      carryingCapacity: "1,200 spelunkers & visitors / day",
      currentHeadcount: "744 / 1,200",
      complianceRating: "98.5%",
      contactPhone: "+63 917 554 8920",
      contactEmail: "tourism@kasibu.gov.ph"
    }
  },
  {
    id: 4,
    name: "Bayombong",
    district: "Central",
    districtLabel: "CENTRAL DISTRICT • 14 Sites",
    badgeColor: "green",
    quote: '"Provincial Heritage, Educational Center & Administrative Capital"',
    totalVisitors: 0,
    foreignMice: 0,
    capacityLoad: 0,
    status: "Optimal",
    statusType: "optimal",
    officer: "Maria Elena Ramos",
    officerRole: "Tourism Operations Officer",
    flagships: [
      "St. Dominic Cathedral",
      "Provincial Capitol Complex & Park",
      "Bantay Lakay Heritage Trails"
    ],
    intel: {
      registeredSites: 14,
      carryingCapacity: "1,800 visitors / day",
      currentHeadcount: "972 / 1,800",
      complianceRating: "98.0%",
      contactPhone: "+63 (078) 321-2311",
      contactEmail: "tourism@bayombong.gov.ph"
    }
  },
  {
    id: 5,
    name: "Bagabag",
    district: "North",
    districtLabel: "NORTH DISTRICT • 8 Sites",
    badgeColor: "blue",
    quote: '"Pineapple Paradise & Aviation Gateway of Nueva Vizcaya"',
    totalVisitors: 0,
    foreignMice: 0,
    capacityLoad: 0,
    status: "Optimal",
    statusType: "optimal",
    officer: "Danilo C. Santos",
    officerRole: "Municipal Tourism Officer",
    flagships: [
      "Bagabag Airport Skyway Circuit",
      "Palaisdaan Gastronomy Strip",
      "Pineapple Plantation Agro-Trails"
    ],
    intel: {
      registeredSites: 8,
      carryingCapacity: "1,100 visitors / day",
      currentHeadcount: "561 / 1,100",
      complianceRating: "97.5%",
      contactPhone: "+63 (078) 332-2009",
      contactEmail: "tourism@bagabag.gov.ph"
    }
  },
  {
    id: 6,
    name: "Santa Fe",
    district: "South",
    districtLabel: "SOUTH DISTRICT • 7 Sites",
    badgeColor: "amber",
    quote: '"Southern Gateway, Dalton Pass Sanctuary & Highland Pine Haven"',
    totalVisitors: 0,
    foreignMice: 0,
    capacityLoad: 0,
    status: "Optimal",
    statusType: "optimal",
    officer: "Francis S. Villanueva",
    officerRole: "Tourism Action Officer",
    flagships: [
      "Dalton Pass Historical National Shrine",
      "Imugan Falls & Forest Trail",
      "Highland Organic Veggie & Coffee Mart"
    ],
    intel: {
      registeredSites: 7,
      carryingCapacity: "900 visitors / day",
      currentHeadcount: "432 / 900",
      complianceRating: "99.0%",
      contactPhone: "+63 918 349 9011",
      contactEmail: "tourism@santafe-nv.gov.ph"
    }
  },
  {
    id: 7,
    name: "Aritao",
    district: "South",
    districtLabel: "SOUTH DISTRICT • 8 Sites",
    badgeColor: "amber",
    quote: '"Agricultural Gateway & Scenic Mountain Vista Junction"',
    totalVisitors: 0,
    foreignMice: 0,
    capacityLoad: 0,
    status: "Optimal",
    statusType: "optimal",
    officer: "Renato D. Morales",
    officerRole: "Municipal Tourism Officer",
    flagships: [
      "Kirang Pass Historical Shrine",
      "Sta. Clara Onion & Agri Hub",
      "Banga-Banga Mountain Overlook"
    ],
    intel: {
      registeredSites: 8,
      carryingCapacity: "950 visitors / day",
      currentHeadcount: "427 / 950",
      complianceRating: "96.5%",
      contactPhone: "+63 (078) 362-0145",
      contactEmail: "tourism@aritao.gov.ph"
    }
  },
  {
    id: 8,
    name: "Bambang",
    district: "South",
    districtLabel: "SOUTH DISTRICT • 10 Sites",
    badgeColor: "amber",
    quote: '"Provincial Agri-Trading Center & Salt Springs Heritage"',
    totalVisitors: 0,
    foreignMice: 0,
    capacityLoad: 0,
    status: "Optimal",
    statusType: "optimal",
    officer: "Teresa J. Panganiban",
    officerRole: "Senior Tourism Officer",
    flagships: [
      "NV Agricultural Trading Center (NVAT)",
      "Salinas Natural Salt Springs",
      "Man-made Forest Agri-Park"
    ],
    intel: {
      registeredSites: 10,
      carryingCapacity: "1,200 visitors / day",
      currentHeadcount: "504 / 1,200",
      complianceRating: "97.0%",
      contactPhone: "+63 (078) 362-5201",
      contactEmail: "tourism@bambang.gov.ph"
    }
  },
  {
    id: 9,
    name: "Dupax del Norte",
    district: "South",
    districtLabel: "SOUTH DISTRICT • 6 Sites",
    badgeColor: "amber",
    quote: '"Cultural Heartland of the Isinay Indigenous Heritage"',
    totalVisitors: 0,
    foreignMice: 0,
    capacityLoad: 0,
    status: "Optimal",
    statusType: "optimal",
    officer: "Mark Anthony Liban",
    officerRole: "Tourism Coordinator",
    flagships: [
      "Isinay Heritage Preservation Center",
      "Belance Vegetable Farm Terraces",
      "Oyao River Nature Campsite"
    ],
    intel: {
      registeredSites: 6,
      carryingCapacity: "700 visitors / day",
      currentHeadcount: "273 / 700",
      complianceRating: "98.2%",
      contactPhone: "+63 927 410 8892",
      contactEmail: "tourism@dupaxdelnorte.gov.ph"
    }
  },
  {
    id: 10,
    name: "Quezon",
    district: "North",
    districtLabel: "NORTH DISTRICT • 7 Sites",
    badgeColor: "blue",
    quote: '"Mountain Ridge Mineral Sanctuary & Highland Agro-Forest Trails"',
    totalVisitors: 0,
    foreignMice: 0,
    capacityLoad: 0,
    status: "Optimal",
    statusType: "optimal",
    officer: "Arnel M. Guinto",
    officerRole: "Municipal Tourism Officer",
    flagships: [
      "Runruno Highland Vista & Eco-Trails",
      "Bintawan Waterfalls & River Camp",
      "Mount Palali Trek Gateway"
    ],
    intel: {
      registeredSites: 7,
      carryingCapacity: "650 visitors / day",
      currentHeadcount: "299 / 650",
      complianceRating: "97.0%",
      contactPhone: "+63 919 452 7701",
      contactEmail: "tourism@quezon-nv.gov.ph"
    }
  },
  {
    id: 11,
    name: "Kayapa",
    district: "South",
    districtLabel: "SOUTH DISTRICT • 8 Sites",
    badgeColor: "amber",
    quote: '"Highland Cool Breeze, Fruit Basket & Trekker Alpine Gateway"',
    totalVisitors: 0,
    foreignMice: 0,
    capacityLoad: 0,
    status: "Optimal",
    statusType: "optimal",
    officer: "Benigno T. Bugtong",
    officerRole: "Tourism Action Officer",
    flagships: [
      "Mt. Ugo Gateway Alpine Trail",
      "Pingkian Highland Agro-Farm",
      "Kayapa Terraced Vegetable Valley"
    ],
    intel: {
      registeredSites: 8,
      carryingCapacity: "800 mountaineers & visitors / day",
      currentHeadcount: "304 / 800",
      complianceRating: "99.1%",
      contactPhone: "+63 928 650 3314",
      contactEmail: "tourism@kayapa.gov.ph"
    }
  },
  {
    id: 12,
    name: "Dupax del Sur",
    district: "South",
    districtLabel: "SOUTH DISTRICT • 7 Sites",
    badgeColor: "amber",
    quote: '"Spanish Colonial Heritage & National Cultural Treasures Sanctuary"',
    totalVisitors: 0,
    foreignMice: 0,
    capacityLoad: 0,
    status: "Optimal",
    statusType: "optimal",
    officer: "Consuelo V. Dancel",
    officerRole: "Heritage & Tourism Officer",
    flagships: [
      "St. Vincent Ferrer Parish Church (1776)",
      "Historic Dampol Brick Bridge",
      "Carolotan Nature Rock Formations"
    ],
    intel: {
      registeredSites: 7,
      carryingCapacity: "750 visitors / day",
      currentHeadcount: "270 / 750",
      complianceRating: "98.8%",
      contactPhone: "+63 (078) 392-2055",
      contactEmail: "tourism@dupaxdelsur.gov.ph"
    }
  },
  {
    id: 13,
    name: "Villaverde",
    district: "North",
    districtLabel: "NORTH DISTRICT • 6 Sites",
    badgeColor: "blue",
    quote: '"Panoramic Ridge Overlook & Native Cultural Heritage Haven"',
    totalVisitors: 0,
    foreignMice: 0,
    capacityLoad: 0,
    status: "Optimal",
    statusType: "optimal",
    officer: "Leonora C. Balong",
    officerRole: "Tourism Coordinator",
    flagships: [
      "Bintawan Sur Ridge Overlook",
      "Mt. Nagbucayan Hiking Summit",
      "Ibaloi Cultural Heritage Village"
    ],
    intel: {
      registeredSites: 6,
      carryingCapacity: "600 visitors / day",
      currentHeadcount: "204 / 600",
      complianceRating: "96.9%",
      contactPhone: "+63 921 784 1109",
      contactEmail: "tourism@villaverde.gov.ph"
    }
  },
  {
    id: 14,
    name: "Alfonso Castañeda",
    district: "South",
    districtLabel: "SOUTH DISTRICT • 6 Sites",
    badgeColor: "amber",
    quote: '"Lush Tropical Wilderness & Hydro-Watershed Ecotourism Basin"',
    totalVisitors: 0,
    foreignMice: 0,
    capacityLoad: 0,
    status: "Optimal",
    statusType: "optimal",
    officer: "Jaime R. Estacio",
    officerRole: "Ecotourism Action Officer",
    flagships: [
      "Canili & Diayo Reservoir Eco-Dams",
      "Pelaway Waterfalls Cascade",
      "Casecnan Watershed Protected Forest"
    ],
    intel: {
      registeredSites: 6,
      carryingCapacity: "500 visitors / day",
      currentHeadcount: "155 / 500",
      complianceRating: "97.5%",
      contactPhone: "+63 930 221 8490",
      contactEmail: "tourism@alfonsocastaneda.gov.ph"
    }
  },
  {
    id: 15,
    name: "Ambaguio",
    district: "Central",
    districtLabel: "CENTRAL DISTRICT • 5 Sites",
    badgeColor: "green",
    quote: '"Skyline Mountaineering, Organic Highland Coffee & Cloud Sanctuary"',
    totalVisitors: 0,
    foreignMice: 0,
    capacityLoad: 0,
    status: "Optimal",
    statusType: "optimal",
    officer: "Melchor G. Dulnuan",
    officerRole: "Senior Tourism Officer",
    flagships: [
      "Mt. Pulag Ambaguio Trailhead",
      "Bayninan Traditional Rice Terraces",
      "Ambaguio Highland Arabica Coffee Farms"
    ],
    intel: {
      registeredSites: 5,
      carryingCapacity: "450 trekkers / day",
      currentHeadcount: "130 / 450",
      complianceRating: "99.4%",
      contactPhone: "+63 917 889 0043",
      contactEmail: "tourism@ambaguio.gov.ph"
    }
  }
];

const MonitoredLGUs = () => {
  const [lgus, setLgus] = useState(LGUS_DATA);
  const [isLiveMongo, setIsLiveMongo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [sortBy, setSortBy] = useState("Most Visitors");

  useEffect(() => {
    let isMounted = true;
    fetchLGUs().then((data) => {
      if (isMounted && data && data.length > 0) {
        setLgus(data);
        setIsLiveMongo(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLGUs = useMemo(() => {
    return lgus.filter((lgu) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        lgu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lgu.officer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lgu.flagships.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDistrict =
        selectedDistrict === "All" || lgu.district === selectedDistrict;

      return matchesSearch && matchesDistrict;
    }).sort((a, b) => {
      if (sortBy === "Most Visitors") return b.totalVisitors - a.totalVisitors;
      if (sortBy === "Highest Load") return b.capacityLoad - a.capacityLoad;
      if (sortBy === "Alphabetical") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [lgus, searchQuery, selectedDistrict, sortBy]);

  // Aggregate metrics
  const totalMonitoredCount = `${lgus.length} / 15`;
  const totalProvinceVisitors = "30";
  const totalRegisteredSites = lgus.reduce(
    (sum, l) => sum + (l.intel?.registeredSites || 0),
    0
  );
  const capacityAlertsCount = lgus.filter((l) => l.capacityLoad >= 80).length;

  return (
    <div className="monitored-lgus-wrapper">
      {/* 4 TOP SUMMARY CARDS (Exact match to screenshot) */}
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
            100% Coverage (North, Central, South)
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
            6.1% International Delegates
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
          <div className="lgu-metric-number">0</div>
          <div className="lgu-metric-sub purple-sub">
            Eco-parks, Heritage, Resorts, Trails
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
            LGUs with &gt;80% Peak Weekend Load
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS BAR (Exact match to screenshot) */}
      <div className="lgu-controls-card">
        {/* Left Search input */}
        <div className="lgu-search-box">
          <Search size={18} className="lgu-search-icon" />
          <input
            type="text"
            className="lgu-search-input"
            placeholder="Search municipality (e.g. Diadi, Kasibu, Solano, Bayombong) or attraction..."
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

        {/* Right District & Sorter */}
        <div className="lgu-filters-cluster">
          <div className="lgu-filter-group">
            <span className="lgu-filter-label">District:</span>
            <div className="lgu-pill-group">
              {["All", "North", "Central", "South"].map((dist) => (
                <button
                  key={dist}
                  type="button"
                  className={`lgu-pill-btn ${selectedDistrict === dist ? "active" : ""
                    }`}
                  onClick={() => setSelectedDistrict(dist)}
                >
                  {dist}
                </button>
              ))}
            </div>
          </div>

          <div className="lgu-filter-separator" />

          <div className="lgu-sort-group">
            <span className="lgu-filter-label">Sort by:</span>
            <div className="lgu-select-box">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="lgu-sort-select"
              >
                <option value="Most Visitors">Most Visitors</option>
                <option value="Highest Load">Highest Load</option>
                <option value="Alphabetical">Name (A-Z)</option>
              </select>
              <ChevronDown size={14} className="lgu-select-chevron" />
            </div>
          </div>
        </div>
      </div>

      {/* DISTRICT SUMMARY BAR */}
      <div className="lgu-results-meta">
        {isLiveMongo && (
          <span style={{ marginRight: "auto", color: "#16a34a", fontWeight: 700 }}>
            ● MongoDB Live Sync Connected
          </span>
        )}
        <span>
          Showing {filteredLGUs.length} of {lgus.length} Municipalities of Nueva Vizcaya
        </span>
      </div>

      {/* LGU CARDS GRID (Exact match to screenshot) */}
      <div className="lgu-cards-grid">
        {filteredLGUs.map((lgu) => {
          const isGreenBar = lgu.capacityLoad < 60;
          const barClass = isGreenBar ? "bar-green" : "bar-blue";

          return (
            <div key={lgu.id} className="lgu-card">
              {/* Badge row */}
              <div className="lgu-card-top">
                <span className={`lgu-district-badge ${lgu.badgeColor}`}>
                  {lgu.districtLabel}
                </span>
                <span className="lgu-status-badge optimal">
                  <span className="status-dot" />
                  Optimal
                </span>
              </div>

              {/* Title & Slogan Quote */}
              <div className="lgu-card-headline">
                <h3 className="lgu-title">{lgu.name}</h3>
                <p className="lgu-quote">{lgu.quote}</p>
              </div>

              {/* 2-Metric Box */}
              <div className="lgu-stats-box">
                <div className="lgu-stat-col">
                  <span className="lgu-stat-sub">TOTAL VISITORS</span>
                  <strong className="lgu-stat-val">
                    {lgu.totalVisitors.toLocaleString()}
                  </strong>
                </div>
                <div className="lgu-stat-col right-col">
                  <span className="lgu-stat-sub">FOREIGN / MICE</span>
                  <strong className="lgu-stat-val teal-val">
                    {lgu.foreignMice.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Carrying Capacity Load Bar */}
              <div className="lgu-capacity-section">
                <div className="lgu-capacity-labels">
                  <span className="cap-label">Carrying Capacity Load</span>
                  <span className={`cap-percent ${barClass}`}>
                    {lgu.capacityLoad}%
                  </span>
                </div>
                <div className="lgu-progress-track">
                  <div
                    className={`lgu-progress-fill ${barClass}`}
                    style={{ width: `${lgu.capacityLoad}%` }}
                  />
                </div>
              </div>

              {/* Flagship Attractions */}
              <div className="lgu-flagships-section">
                <span className="flagships-label">
                  FLAGSHIP ATTRACTIONS &amp; CIRCUITS
                </span>
                <div className="flagship-tags">
                  {lgu.flagships.map((tag, idx) => (
                    <span key={idx} className="flagship-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
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
    </div>
  );
};

export default MonitoredLGUs;
