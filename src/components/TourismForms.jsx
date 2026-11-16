import React, { useState, useMemo, useRef } from 'react';
import {
  FileSpreadsheet,
  Printer,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import './TourismForms.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function TourismForms({ user }) {
  const [activeFormTab, setActiveFormTab] = useState('MONTHLY_YEARLY');
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="tf-container">
      {/* Top Controls & Navigation Bar */}
      <div className="tf-top-bar">
        <div className="tf-top-info">
          <div className="tf-title-area">
            <h2>
              <FileSpreadsheet size={22} color="#15803d" />
              Department of Tourism (DOT) Official Provincial Forms
              <span className="tf-badge-official">DOT Standard</span>
            </h2>
            <p>
              Standard government filing forms for Provincial Tourism Attraction Visitor Recording and Provincial Municipal Consolidation.
            </p>
          </div>

          <div className="tf-actions">
            <button
              type="button"
              className="tf-btn tf-btn-secondary"
              onClick={handlePrint}
              title="Print official document sheet"
            >
              <Printer size={16} />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Tab Selection: Official Provincial Forms */}
        <div className="tf-tabs-wrapper">
          <button
            type="button"
            className={`tf-tab-btn ${activeFormTab === 'MONTHLY_YEARLY' ? 'active' : ''}`}
            onClick={() => setActiveFormTab('MONTHLY_YEARLY')}
          >
            <span className="tf-tab-badge">MONTHLY & YEARLY</span>
            Monthly Visitor Arrivals Per Attraction (Jan - Dec) and Yearly Total
          </button>

          <button
            type="button"
            className={`tf-tab-btn ${activeFormTab === 'PROVINCIAL_LGU' ? 'active' : ''}`}
            onClick={() => setActiveFormTab('PROVINCIAL_LGU')}
          >
            <span className="tf-tab-badge">PROVINCIAL</span>
            Same Day Visitors by Municipality
          </button>
        </div>
      </div>

      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          zIndex: 9999,
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          border: '1px solid #334155'
        }}>
          <CheckCircle2 size={16} color="#4ade80" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Render the Active Official Provincial Form */}
      {activeFormTab === 'MONTHLY_YEARLY' && <MonthlyYearlyAttractionsForm onNotify={showToast} />}
      {activeFormTab === 'PROVINCIAL_LGU' && <ProvincialLGUForm onNotify={showToast} />}
    </div>
  );
}

/* ==========================================================================
   1. MONTHLY VISITOR ARRIVALS PER ATTRACTION (JANUARY - DECEMBER) AND YEARLY TOTAL
   Official Provincial Multi-Month & Yearly Spreadsheet Template
   Type only in the blue cells (Male / Female). Black cells are formulas.
   Scroll right for next months; YEARLY TOTAL is the last block.
   ========================================================================== */

const ATTRACTION_MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

const MUNICIPAL_GROUPS = [
  {
    municipality: 'ALFONSO CASTAÑEDA',
    totalLabel: 'Total Alfonso Castañeda',
    attractions: [
      { name: 'Alfonso Castañeda Resort & Recreation Park', defaultCode: '' },
      { name: 'Calabuga Falls', defaultCode: '' },
      { name: 'Bakabalay Fiesta Site', defaultCode: '' }
    ]
  },
  {
    municipality: 'AMBAGUIO',
    totalLabel: 'Total Ambaguio',
    attractions: [
      { name: 'Gulod Falls', defaultCode: '' },
      { name: 'Mt. Pulag-Ambaguio Trail', defaultCode: '' },
      { name: 'NVVT Pangalaging', defaultCode: '' },
      { name: 'Daluyan', defaultCode: '' }
    ]
  },
  {
    municipality: 'ARITAO',
    totalLabel: 'Total Aritao',
    attractions: [
      { name: 'Aritao Ecotourism Park', defaultCode: '' }
    ]
  },
  {
    municipality: 'BAGABAG',
    totalLabel: 'Total Bagabag',
    attractions: [
      { name: 'Bagabag Park', defaultCode: '' }
    ]
  },
  {
    municipality: 'BAMBANG',
    totalLabel: 'Total Bambang',
    attractions: [
      { name: 'Salinas Salt Springs & Natural Monument', defaultCode: '' }
    ]
  },
  {
    municipality: 'BAYOMBONG',
    totalLabel: 'Total Bayombong',
    attractions: [
      { name: 'Aurora Vizcaya Project Museum (11 Ave?)', defaultCode: '' },
      { name: 'Mountain Resort', defaultCode: '' },
      { name: 'Gaseous Resort & Sports Complex', defaultCode: '' },
      { name: 'Pinasa Resort', defaultCode: '' },
      { name: 'Peacekeeping Center', defaultCode: '' },
      { name: 'Bose Resort', defaultCode: '' },
      { name: "Mandabalak's Farm", defaultCode: '' },
      { name: 'Yaban Flower Farm', defaultCode: '' }
    ]
  },
  {
    municipality: 'DIADI',
    totalLabel: 'Total Diadi',
    attractions: [
      { name: 'Casor Magali Fox Tourism Park', defaultCode: '' }
    ]
  },
  {
    municipality: 'DUPAX DEL NORTE',
    totalLabel: 'Total Dupax Del Norte',
    attractions: [
      { name: 'Jangan Social Clouds', defaultCode: '' },
      { name: 'Nacunot Falls', defaultCode: '' }
    ]
  },
  {
    municipality: 'DUPAX DEL SUR',
    totalLabel: 'Total Dupax Del Sur',
    attractions: [
      { name: 'Auer Lourem Flower Garden', defaultCode: '' },
      { name: 'Dupax Watershed Forest Reserve', defaultCode: '' }
    ]
  },
  {
    municipality: 'KASIBU',
    totalLabel: 'Total Kasibu',
    attractions: [
      { name: 'Capisaan Caves', defaultCode: '' },
      { name: 'Pimelo Falls', defaultCode: '' }
    ]
  },
  {
    municipality: 'KAYAPA',
    totalLabel: 'Total Kayapa',
    attractions: [
      { name: 'Mt. Ugo', defaultCode: '' },
      { name: 'Mt. Tuwang', defaultCode: '' }
    ]
  },
  {
    municipality: 'QUEZON',
    totalLabel: 'Total Quezon',
    attractions: [
      { name: 'Latungan Falls', defaultCode: '' },
      { name: 'Impasuyo Falls', defaultCode: '' },
      { name: 'Mt. Pavia', defaultCode: '' }
    ]
  },
  {
    municipality: 'SANTA FE',
    totalLabel: 'Total Santa Fe',
    attractions: [
      { name: 'Imugan Falls', defaultCode: '' },
      { name: 'Maharaja Bambo Park', defaultCode: '' },
      { name: 'Ma-Fe Forest Park', defaultCode: '' },
      { name: 'Sinapasan Falls', defaultCode: '' },
      { name: 'Vision Solomon Park', defaultCode: '' }
    ]
  },
  {
    municipality: 'SOLANO',
    totalLabel: 'Total Solano',
    attractions: [
      { name: '24/7 Fun & Resort', defaultCode: '' },
      { name: 'Mountain Resort', defaultCode: '' },
      { name: 'Wanderer Hotel', defaultCode: '' }
    ]
  },
  {
    municipality: 'VILLAVERDE',
    totalLabel: 'Total Villaverde',
    attractions: [
      { name: 'Villaverde Watershed Park', defaultCode: '' }
    ]
  },
  {
    municipality: 'OTHERS / FESTIVALS',
    totalLabel: 'Total Others / Festivals',
    attractions: [
      { name: 'Overstay Inmogen Festival', defaultCode: '' }
    ]
  }
];

function MonthlyYearlyAttractionsForm({ onNotify }) {
  const tableWrapRef = useRef(null);

  const [meta, setMeta] = useState({
    preparedBy: '',
  });

  // Cell Data Store: { [`${rowKey}__${mIdx}`]: { tpM, tpF, opM, opF, fM, fF } }
  const [dataStore, setDataStore] = useState({});
  // Attraction Codes: { [rowKey]: codeString }
  const [codes, setCodes] = useState({});

  // View Mode: 'all' (Spreadsheet Scroll) or month index 0..11 for single-month focus
  const [viewMode, setViewMode] = useState('all');

  const handleCellChange = (rowKey, mIdx, field, val) => {
    const key = `${rowKey}__${mIdx}`;
    setDataStore((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: val === '' ? '' : Math.max(0, Number(val) || 0)
      }
    }));
  };

  const handleCodeChange = (rowKey, val) => {
    setCodes((prev) => ({
      ...prev,
      [rowKey]: val
    }));
  };

  const handleClearAll = () => {
    if (window.confirm('Sigurado po ba kayong nais burahin ang lahat ng inilagay na data sa spreadsheet?')) {
      setDataStore({});
      setCodes({});
      setMeta({ preparedBy: '' });
      onNotify('Na-clear na po ang form. 100% blangko ang spreadsheet.');
    }
  };

  // Helper: Smooth scroll to month header
  const scrollToMonth = (idx) => {
    const targetId = idx === 12 ? 'th-block-yearly' : `th-block-month-${idx}`;
    const el = document.getElementById(targetId);
    if (el && tableWrapRef.current) {
      const containerRect = tableWrapRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const currentScroll = tableWrapRef.current.scrollLeft;
      // Subtract ~280px for sticky left columns
      tableWrapRef.current.scrollTo({
        left: currentScroll + (elRect.left - containerRect.left) - 280,
        behavior: 'smooth'
      });
    }
  };

  // Months to display based on viewMode
  const displayedMonths = useMemo(() => {
    if (viewMode === 'all') {
      return ATTRACTION_MONTHS.map((name, idx) => ({ name, idx }));
    }
    const idx = Number(viewMode);
    return [{ name: ATTRACTION_MONTHS[idx], idx }];
  }, [viewMode]);

  // Calculations:
  // For each attraction row: calculate 12 months data + yearly total
  // For each municipality: calculate sum of its attractions per month + yearly total
  // For province total: calculate grand sum per month + yearly total
  const computedData = useMemo(() => {
    // attractionCalculations: { [rowKey]: { [mIdx]: { tpM, tpF, tpTot, opM, opF, opTot, fM, fF, fTot, gM, gF, gTot }, yearly: {...} } }
    const attractionCalcs = {};

    // municipalityCalculations: { [muniName]: { [mIdx]: {...}, yearly: {...} } }
    const muniCalcs = {};

    // provinceCalculations: { [mIdx]: {...}, yearly: {...} }
    const provCalcs = {};
    for (let m = 0; m < 12; m++) {
      provCalcs[m] = { tpM: 0, tpF: 0, tpTot: 0, opM: 0, opF: 0, opTot: 0, fM: 0, fF: 0, fTot: 0, gM: 0, gF: 0, gTot: 0 };
    }
    provCalcs.yearly = { tpM: 0, tpF: 0, tpTot: 0, opM: 0, opF: 0, opTot: 0, fM: 0, fF: 0, fTot: 0, gM: 0, gF: 0, gTot: 0 };

    MUNICIPAL_GROUPS.forEach((group) => {
      const mCalcs = {};
      for (let m = 0; m < 12; m++) {
        mCalcs[m] = { tpM: 0, tpF: 0, tpTot: 0, opM: 0, opF: 0, opTot: 0, fM: 0, fF: 0, fTot: 0, gM: 0, gF: 0, gTot: 0 };
      }
      mCalcs.yearly = { tpM: 0, tpF: 0, tpTot: 0, opM: 0, opF: 0, opTot: 0, fM: 0, fF: 0, fTot: 0, gM: 0, gF: 0, gTot: 0 };

      group.attractions.forEach((attr) => {
        const rowKey = `${group.municipality}__${attr.name}`;
        const rowCalcs = { yearly: { tpM: 0, tpF: 0, tpTot: 0, opM: 0, opF: 0, opTot: 0, fM: 0, fF: 0, fTot: 0, gM: 0, gF: 0, gTot: 0 } };

        for (let m = 0; m < 12; m++) {
          const raw = dataStore[`${rowKey}__${m}`] || {};
          const tpM = Number(raw.tpM) || 0;
          const tpF = Number(raw.tpF) || 0;
          const tpTot = (raw.tpM !== undefined && raw.tpM !== '' || raw.tpF !== undefined && raw.tpF !== '') ? tpM + tpF : 0;

          const opM = Number(raw.opM) || 0;
          const opF = Number(raw.opF) || 0;
          const opTot = (raw.opM !== undefined && raw.opM !== '' || raw.opF !== undefined && raw.opF !== '') ? opM + opF : 0;

          const fM = Number(raw.fM) || 0;
          const fF = Number(raw.fF) || 0;
          const fTot = (raw.fM !== undefined && raw.fM !== '' || raw.fF !== undefined && raw.fF !== '') ? fM + fF : 0;

          const gM = (tpM || opM || fM) ? tpM + opM + fM : 0;
          const gF = (tpF || opF || fF) ? tpF + opF + fF : 0;
          const gTot = gM + gF;

          rowCalcs[m] = { tpM, tpF, tpTot, opM, opF, opTot, fM, fF, fTot, gM, gF, gTot };

          // Accumulate attraction yearly
          rowCalcs.yearly.tpM += tpM;
          rowCalcs.yearly.tpF += tpF;
          rowCalcs.yearly.opM += opM;
          rowCalcs.yearly.opF += opF;
          rowCalcs.yearly.fM += fM;
          rowCalcs.yearly.fF += fF;

          // Accumulate municipality month
          mCalcs[m].tpM += tpM;
          mCalcs[m].tpF += tpF;
          mCalcs[m].tpTot += tpTot;
          mCalcs[m].opM += opM;
          mCalcs[m].opF += opF;
          mCalcs[m].opTot += opTot;
          mCalcs[m].fM += fM;
          mCalcs[m].fF += fF;
          mCalcs[m].fTot += fTot;
          mCalcs[m].gM += gM;
          mCalcs[m].gF += gF;
          mCalcs[m].gTot += gTot;

          // Accumulate province month
          provCalcs[m].tpM += tpM;
          provCalcs[m].tpF += tpF;
          provCalcs[m].tpTot += tpTot;
          provCalcs[m].opM += opM;
          provCalcs[m].opF += opF;
          provCalcs[m].opTot += opTot;
          provCalcs[m].fM += fM;
          provCalcs[m].fF += fF;
          provCalcs[m].fTot += fTot;
          provCalcs[m].gM += gM;
          provCalcs[m].gF += gF;
          provCalcs[m].gTot += gTot;
        }

        // Finalize attraction yearly totals
        rowCalcs.yearly.tpTot = rowCalcs.yearly.tpM + rowCalcs.yearly.tpF;
        rowCalcs.yearly.opTot = rowCalcs.yearly.opM + rowCalcs.yearly.opF;
        rowCalcs.yearly.fTot = rowCalcs.yearly.fM + rowCalcs.yearly.fF;
        rowCalcs.yearly.gM = rowCalcs.yearly.tpM + rowCalcs.yearly.opM + rowCalcs.yearly.fM;
        rowCalcs.yearly.gF = rowCalcs.yearly.tpF + rowCalcs.yearly.opF + rowCalcs.yearly.fF;
        rowCalcs.yearly.gTot = rowCalcs.yearly.gM + rowCalcs.yearly.gF;

        attractionCalcs[rowKey] = rowCalcs;
      });

      // Finalize municipality yearly totals
      for (let m = 0; m < 12; m++) {
        mCalcs.yearly.tpM += mCalcs[m].tpM;
        mCalcs.yearly.tpF += mCalcs[m].tpF;
        mCalcs.yearly.opM += mCalcs[m].opM;
        mCalcs.yearly.opF += mCalcs[m].opF;
        mCalcs.yearly.fM += mCalcs[m].fM;
        mCalcs.yearly.fF += mCalcs[m].fF;
      }
      mCalcs.yearly.tpTot = mCalcs.yearly.tpM + mCalcs.yearly.tpF;
      mCalcs.yearly.opTot = mCalcs.yearly.opM + mCalcs.yearly.opF;
      mCalcs.yearly.fTot = mCalcs.yearly.fM + mCalcs.yearly.fF;
      mCalcs.yearly.gM = mCalcs.yearly.tpM + mCalcs.yearly.opM + mCalcs.yearly.fM;
      mCalcs.yearly.gF = mCalcs.yearly.tpF + mCalcs.yearly.opF + mCalcs.yearly.fF;
      mCalcs.yearly.gTot = mCalcs.yearly.gM + mCalcs.yearly.gF;

      muniCalcs[group.municipality] = mCalcs;
    });

    // Finalize province yearly totals
    for (let m = 0; m < 12; m++) {
      provCalcs.yearly.tpM += provCalcs[m].tpM;
      provCalcs.yearly.tpF += provCalcs[m].tpF;
      provCalcs.yearly.opM += provCalcs[m].opM;
      provCalcs.yearly.opF += provCalcs[m].opF;
      provCalcs.yearly.fM += provCalcs[m].fM;
      provCalcs.yearly.fF += provCalcs[m].fF;
    }
    provCalcs.yearly.tpTot = provCalcs.yearly.tpM + provCalcs.yearly.tpF;
    provCalcs.yearly.opTot = provCalcs.yearly.opM + provCalcs.yearly.opF;
    provCalcs.yearly.fTot = provCalcs.yearly.fM + provCalcs.yearly.fF;
    provCalcs.yearly.gM = provCalcs.yearly.tpM + provCalcs.yearly.opM + provCalcs.yearly.fM;
    provCalcs.yearly.gF = provCalcs.yearly.tpF + provCalcs.yearly.opF + provCalcs.yearly.fF;
    provCalcs.yearly.gTot = provCalcs.yearly.gM + provCalcs.yearly.gF;

    return { attractionCalcs, muniCalcs, provCalcs };
  }, [dataStore]);

  return (
    <div className="tf-paper-sheet">
      {/* Title Header */}
      <div className="tf-sheet-header">
        <h2 className="tf-sheet-title" style={{ fontSize: '15px', textTransform: 'uppercase' }}>
          MONTHLY VISITOR ARRIVALS PER ATTRACTION (JANUARY - DECEMBER) AND YEARLY TOTAL
        </h2>
        <p className="tf-sheet-subtitle" style={{ fontStyle: 'italic', color: '#1e3a8a', marginTop: '4px' }}>
          Type only in the blue cells (Male / Female). Black cells are formulas. Scroll right for the next months; the YEARLY TOTAL is the last block.
        </p>
      </div>

      {/* Instruction & Legend Banner */}
      <div className="tf-instruction-banner">
        <div className="tf-legend-tags">
          <span className="tf-legend-item">
            <span className="tf-swatch-blue" />
            <strong>Blue Cells:</strong> Editable Data Entry (Male / Female)
          </span>
          <span className="tf-legend-item">
            <span className="tf-swatch-gray" />
            <strong>Black / Slate Cells:</strong> Auto-Computed Formulas (Totals & Grand Totals)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>
            Spreadsheet View:
          </label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 600,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="all">Full Spreadsheet (All 12 Months + Yearly Total)</option>
            {ATTRACTION_MONTHS.map((m, idx) => (
              <option key={m} value={String(idx)}>
                Focus on {m} + Yearly Total
              </option>
            ))}
          </select>

          <button
            type="button"
            className="tf-btn tf-btn-secondary"
            onClick={handleClearAll}
            style={{ padding: '4px 10px', fontSize: '11.5px' }}
          >
            <RotateCcw size={13} /> Clear Sheet
          </button>
        </div>
      </div>

      {/* Month Jump Buttons Bar */}
      {viewMode === 'all' && (
        <div className="tf-month-bar">
          <span className="tf-month-bar-label">Scroll to Month:</span>
          {ATTRACTION_MONTHS.map((m, idx) => (
            <button
              key={m}
              type="button"
              className="tf-month-chip"
              onClick={() => scrollToMonth(idx)}
            >
              {m.slice(0, 3)}
            </button>
          ))}
          <button
            type="button"
            className="tf-month-chip tf-month-chip-yearly"
            onClick={() => scrollToMonth(12)}
          >
            ★ YEARLY TOTAL
          </button>
        </div>
      )}

      {/* Spreadsheet Table Wrap */}
      <div className="tf-table-wrap" ref={tableWrapRef}>
        <table className="tf-table" style={{ width: 'max-content' }}>
          <thead>
            {/* Row 1: Main Column Headers */}
            <tr>
              <th
                rowSpan={4}
                className="tf-th-yellow tf-th-sticky-attraction"
                style={{ textAlign: 'left', paddingLeft: '10px' }}
              >
                Visitor Attraction
              </th>
              <th
                rowSpan={4}
                className="tf-th-yellow tf-th-sticky-code"
              >
                Attraction Code
              </th>

              {/* Month Blocks */}
              {displayedMonths.map((m) => (
                <th
                  key={m.name}
                  id={`th-block-month-${m.idx}`}
                  colSpan={12}
                  className="tf-th-yellow"
                  style={{ borderLeft: '2px solid #000000', fontSize: '11.5px' }}
                >
                  {m.name} - *** Place of Residence
                </th>
              ))}

              {/* Yearly Total Block */}
              <th
                id="th-block-yearly"
                colSpan={12}
                className="tf-th-yellow tf-col-yearly-header"
                style={{ fontSize: '12px', fontWeight: 800 }}
              >
                YEARLY TOTAL
              </th>
            </tr>

            {/* Row 2: Residence Groupings */}
            <tr>
              {displayedMonths.map((m) => (
                <React.Fragment key={`r2_${m.name}`}>
                  <th colSpan={6} className="tf-th-yellow" style={{ borderLeft: '2px solid #000000' }}>Philippines</th>
                  <th colSpan={3} className="tf-th-yellow">Foreign Country Residents</th>
                  <th colSpan={3} className="tf-th-yellow">Grand Total Number of Visitors</th>
                </React.Fragment>
              ))}

              {/* Yearly Total R2 */}
              <th colSpan={6} className="tf-th-yellow tf-col-yearly-header">Philippines</th>
              <th colSpan={3} className="tf-th-yellow tf-col-yearly-header">Foreign Country Residents</th>
              <th colSpan={3} className="tf-th-yellow tf-col-yearly-header">Grand Total Number of Visitors</th>
            </tr>

            {/* Row 3: Provinces Grouping */}
            <tr>
              {displayedMonths.map((m) => (
                <React.Fragment key={`r3_${m.name}`}>
                  <th colSpan={3} className="tf-th-sub" style={{ borderLeft: '2px solid #000000' }}>This Province</th>
                  <th colSpan={3} className="tf-th-sub">Other Province</th>
                  <th colSpan={3} className="tf-th-white"></th>
                  <th colSpan={3} className="tf-th-white"></th>
                </React.Fragment>
              ))}

              {/* Yearly Total R3 */}
              <th colSpan={3} className="tf-th-sub" style={{ borderLeft: '2px solid #000000', background: '#fef9c3' }}>This Province</th>
              <th colSpan={3} className="tf-th-sub" style={{ background: '#fef9c3' }}>Other Province</th>
              <th colSpan={3} className="tf-th-white" style={{ background: '#fef9c3' }}></th>
              <th colSpan={3} className="tf-th-white" style={{ background: '#fef9c3' }}></th>
            </tr>

            {/* Row 4: Specific Gender and Total Sub-headers */}
            <tr>
              {displayedMonths.map((m) => (
                <React.Fragment key={`r4_${m.name}`}>
                  {/* This Province */}
                  <th className="tf-th-yellow" style={{ width: 34, borderLeft: '2px solid #000000' }}>Male</th>
                  <th className="tf-th-yellow" style={{ width: 34 }}>Female</th>
                  <th className="tf-th-yellow" style={{ width: 38 }}>Total</th>

                  {/* Other Province */}
                  <th className="tf-th-yellow" style={{ width: 34 }}>Male</th>
                  <th className="tf-th-yellow" style={{ width: 34 }}>Female</th>
                  <th className="tf-th-yellow" style={{ width: 38 }}>Total</th>

                  {/* Foreign */}
                  <th className="tf-th-yellow" style={{ width: 34 }}>Male</th>
                  <th className="tf-th-yellow" style={{ width: 34 }}>Female</th>
                  <th className="tf-th-yellow" style={{ width: 38 }}>Total</th>

                  {/* Grand Total */}
                  <th className="tf-th-yellow" style={{ width: 36 }}>Male</th>
                  <th className="tf-th-yellow" style={{ width: 36 }}>Female</th>
                  <th className="tf-th-yellow" style={{ width: 42 }}>Total</th>
                </React.Fragment>
              ))}

              {/* Yearly Total R4 */}
              <th className="tf-th-yellow tf-col-yearly-header" style={{ width: 36, borderLeft: '2px solid #000000' }}>Male</th>
              <th className="tf-th-yellow tf-col-yearly-header" style={{ width: 36 }}>Female</th>
              <th className="tf-th-yellow tf-col-yearly-header" style={{ width: 40 }}>Total</th>

              <th className="tf-th-yellow tf-col-yearly-header" style={{ width: 36 }}>Male</th>
              <th className="tf-th-yellow tf-col-yearly-header" style={{ width: 36 }}>Female</th>
              <th className="tf-th-yellow tf-col-yearly-header" style={{ width: 40 }}>Total</th>

              <th className="tf-th-yellow tf-col-yearly-header" style={{ width: 36 }}>Male</th>
              <th className="tf-th-yellow tf-col-yearly-header" style={{ width: 36 }}>Female</th>
              <th className="tf-th-yellow tf-col-yearly-header" style={{ width: 40 }}>Total</th>

              <th className="tf-th-yellow tf-col-yearly-header" style={{ width: 38 }}>Male</th>
              <th className="tf-th-yellow tf-col-yearly-header" style={{ width: 38 }}>Female</th>
              <th className="tf-th-yellow tf-col-yearly-header" style={{ width: 44 }}>Total</th>
            </tr>
          </thead>

          <tbody>
            {MUNICIPAL_GROUPS.map((group) => {
              const totalColSpan = 2 + displayedMonths.length * 12 + 12;
              const groupCalcs = computedData.muniCalcs[group.municipality] || {};

              return (
                <React.Fragment key={group.municipality}>
                  {/* Municipality Group Name Header Row */}
                  <tr>
                    <td
                      colSpan={totalColSpan}
                      className="tf-sticky-group-header"
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderTop: '1.5px solid #000000',
                        borderBottom: '1.5px solid #000000',
                      }}
                    >
                      {group.municipality}
                    </td>
                  </tr>

                  {/* Attraction Rows */}
                  {group.attractions.map((attr) => {
                    const rowKey = `${group.municipality}__${attr.name}`;
                    const rowCalcs = computedData.attractionCalcs[rowKey] || {};
                    const curCode = codes[rowKey] ?? attr.defaultCode;

                    return (
                      <tr key={rowKey}>
                        {/* 1. Attraction Name (Sticky) */}
                        <td className="tf-sticky-attraction">
                          {attr.name}
                        </td>

                        {/* 2. Attraction Code (Sticky) */}
                        <td className="tf-sticky-code">
                          <input
                            type="text"
                            value={curCode}
                            onChange={(e) => handleCodeChange(rowKey, e.target.value)}
                            className="tf-cell-input"
                            style={{ width: '100%', textAlign: 'center', fontSize: '11px' }}
                            placeholder=""
                          />
                        </td>

                        {/* 3. Monthly Blocks */}
                        {displayedMonths.map((m) => {
                          const raw = dataStore[`${rowKey}__${m.idx}`] || {};
                          const c = (rowCalcs[m.idx]) || { tpM: 0, tpF: 0, tpTot: 0, opM: 0, opF: 0, opTot: 0, fM: 0, fF: 0, fTot: 0, gM: 0, gF: 0, gTot: 0 };

                          return (
                            <React.Fragment key={`cell_${rowKey}_${m.name}`}>
                              {/* This Province: Male (Blue), Female (Blue), Total (Formula) */}
                              <td style={{ borderLeft: '2px solid #000000' }}>
                                <input
                                  type="number"
                                  min="0"
                                  className="tf-cell-blue-input"
                                  value={raw.tpM ?? ''}
                                  onChange={(e) => handleCellChange(rowKey, m.idx, 'tpM', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  className="tf-cell-blue-input"
                                  value={raw.tpF ?? ''}
                                  onChange={(e) => handleCellChange(rowKey, m.idx, 'tpF', e.target.value)}
                                />
                              </td>
                              <td className="tf-cell-formula">{c.tpTot || 0}</td>

                              {/* Other Province: Male (Blue), Female (Blue), Total (Formula) */}
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  className="tf-cell-blue-input"
                                  value={raw.opM ?? ''}
                                  onChange={(e) => handleCellChange(rowKey, m.idx, 'opM', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  className="tf-cell-blue-input"
                                  value={raw.opF ?? ''}
                                  onChange={(e) => handleCellChange(rowKey, m.idx, 'opF', e.target.value)}
                                />
                              </td>
                              <td className="tf-cell-formula">{c.opTot || 0}</td>

                              {/* Foreign: Male (Blue), Female (Blue), Total (Formula) */}
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  className="tf-cell-blue-input"
                                  value={raw.fM ?? ''}
                                  onChange={(e) => handleCellChange(rowKey, m.idx, 'fM', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  className="tf-cell-blue-input"
                                  value={raw.fF ?? ''}
                                  onChange={(e) => handleCellChange(rowKey, m.idx, 'fF', e.target.value)}
                                />
                              </td>
                              <td className="tf-cell-formula">{c.fTot || 0}</td>

                              {/* Grand Total: Male, Female, Total */}
                              <td className="tf-cell-formula-grand">{c.gM || 0}</td>
                              <td className="tf-cell-formula-grand">{c.gF || 0}</td>
                              <td className="tf-cell-formula-grand">{c.gTot || 0}</td>
                            </React.Fragment>
                          );
                        })}

                        {/* 4. Yearly Total Block (Per Attraction) */}
                        {(() => {
                          const y = (rowCalcs.yearly) || { tpM: 0, tpF: 0, tpTot: 0, opM: 0, opF: 0, opTot: 0, fM: 0, fF: 0, fTot: 0, gM: 0, gF: 0, gTot: 0 };
                          return (
                            <React.Fragment key={`yearly_${rowKey}`}>
                              <td className="tf-cell-yearly" style={{ borderLeft: '2.5px solid #000000' }}>{y.tpM || 0}</td>
                              <td className="tf-cell-yearly">{y.tpF || 0}</td>
                              <td className="tf-cell-yearly" style={{ fontWeight: 900 }}>{y.tpTot || 0}</td>

                              <td className="tf-cell-yearly">{y.opM || 0}</td>
                              <td className="tf-cell-yearly">{y.opF || 0}</td>
                              <td className="tf-cell-yearly" style={{ fontWeight: 900 }}>{y.opTot || 0}</td>

                              <td className="tf-cell-yearly">{y.fM || 0}</td>
                              <td className="tf-cell-yearly">{y.fF || 0}</td>
                              <td className="tf-cell-yearly" style={{ fontWeight: 900 }}>{y.fTot || 0}</td>

                              <td className="tf-cell-yearly" style={{ fontWeight: 900 }}>{y.gM || 0}</td>
                              <td className="tf-cell-yearly" style={{ fontWeight: 900 }}>{y.gF || 0}</td>
                              <td className="tf-cell-yearly" style={{ fontWeight: 900, background: '#fef08a' }}>{y.gTot || 0}</td>
                            </React.Fragment>
                          );
                        })()}
                      </tr>
                    );
                  })}

                  {/* Subtotal Row for the Municipality */}
                  <tr className="tf-muni-subtotal-row">
                    <td colSpan={2} className="tf-muni-subtotal-label">
                      {group.totalLabel}
                    </td>

                    {/* Monthly Subtotals */}
                    {displayedMonths.map((m) => {
                      const mc = (groupCalcs[m.idx]) || { tpM: 0, tpF: 0, tpTot: 0, opM: 0, opF: 0, opTot: 0, fM: 0, fF: 0, fTot: 0, gM: 0, gF: 0, gTot: 0 };
                      return (
                        <React.Fragment key={`sub_${group.municipality}_${m.name}`}>
                          <td style={{ borderLeft: '2px solid #000000' }}>{mc.tpM || 0}</td>
                          <td>{mc.tpF || 0}</td>
                          <td style={{ fontWeight: 900 }}>{mc.tpTot || 0}</td>

                          <td>{mc.opM || 0}</td>
                          <td>{mc.opF || 0}</td>
                          <td style={{ fontWeight: 900 }}>{mc.opTot || 0}</td>

                          <td>{mc.fM || 0}</td>
                          <td>{mc.fF || 0}</td>
                          <td style={{ fontWeight: 900 }}>{mc.fTot || 0}</td>

                          <td style={{ fontWeight: 900 }}>{mc.gM || 0}</td>
                          <td style={{ fontWeight: 900 }}>{mc.gF || 0}</td>
                          <td style={{ fontWeight: 900 }}>{mc.gTot || 0}</td>
                        </React.Fragment>
                      );
                    })}

                    {/* Yearly Subtotal */}
                    {(() => {
                      const my = (groupCalcs.yearly) || { tpM: 0, tpF: 0, tpTot: 0, opM: 0, opF: 0, opTot: 0, fM: 0, fF: 0, fTot: 0, gM: 0, gF: 0, gTot: 0 };
                      return (
                        <React.Fragment key={`sub_yearly_${group.municipality}`}>
                          <td style={{ borderLeft: '2.5px solid #000000' }}>{my.tpM || 0}</td>
                          <td>{my.tpF || 0}</td>
                          <td style={{ fontWeight: 900 }}>{my.tpTot || 0}</td>

                          <td>{my.opM || 0}</td>
                          <td>{my.opF || 0}</td>
                          <td style={{ fontWeight: 900 }}>{my.opTot || 0}</td>

                          <td>{my.fM || 0}</td>
                          <td>{my.fF || 0}</td>
                          <td style={{ fontWeight: 900 }}>{my.fTot || 0}</td>

                          <td style={{ fontWeight: 900 }}>{my.gM || 0}</td>
                          <td style={{ fontWeight: 900 }}>{my.gF || 0}</td>
                          <td style={{ fontWeight: 900, background: '#fde047' }}>{my.gTot || 0}</td>
                        </React.Fragment>
                      );
                    })()}
                  </tr>
                </React.Fragment>
              );
            })}

            {/* Bottom Grand Provincial Total Row */}
            <tr className="tf-row-green">
              <td colSpan={2} className="tf-prov-total-label">
                TOTAL (PROVINCE)
              </td>

              {displayedMonths.map((m) => {
                const pc = (computedData.provCalcs[m.idx]) || { tpM: 0, tpF: 0, tpTot: 0, opM: 0, opF: 0, opTot: 0, fM: 0, fF: 0, fTot: 0, gM: 0, gF: 0, gTot: 0 };
                return (
                  <React.Fragment key={`prov_total_${m.name}`}>
                    <td style={{ borderLeft: '2px solid #000000' }}>{pc.tpM || 0}</td>
                    <td>{pc.tpF || 0}</td>
                    <td style={{ fontWeight: 900 }}>{pc.tpTot || 0}</td>

                    <td>{pc.opM || 0}</td>
                    <td>{pc.opF || 0}</td>
                    <td style={{ fontWeight: 900 }}>{pc.opTot || 0}</td>

                    <td>{pc.fM || 0}</td>
                    <td>{pc.fF || 0}</td>
                    <td style={{ fontWeight: 900 }}>{pc.fTot || 0}</td>

                    <td style={{ fontWeight: 900 }}>{pc.gM || 0}</td>
                    <td style={{ fontWeight: 900 }}>{pc.gF || 0}</td>
                    <td style={{ fontWeight: 900 }}>{pc.gTot || 0}</td>
                  </React.Fragment>
                );
              })}

              {/* Province Yearly Total */}
              {(() => {
                const py = (computedData.provCalcs.yearly) || { tpM: 0, tpF: 0, tpTot: 0, opM: 0, opF: 0, opTot: 0, fM: 0, fF: 0, fTot: 0, gM: 0, gF: 0, gTot: 0 };
                return (
                  <React.Fragment key="prov_total_yearly">
                    <td style={{ borderLeft: '2.5px solid #000000' }}>{py.tpM || 0}</td>
                    <td>{py.tpF || 0}</td>
                    <td style={{ fontWeight: 900 }}>{py.tpTot || 0}</td>

                    <td>{py.opM || 0}</td>
                    <td>{py.opF || 0}</td>
                    <td style={{ fontWeight: 900 }}>{py.opTot || 0}</td>

                    <td>{py.fM || 0}</td>
                    <td>{py.fF || 0}</td>
                    <td style={{ fontWeight: 900 }}>{py.fTot || 0}</td>

                    <td style={{ fontWeight: 900 }}>{py.gM || 0}</td>
                    <td style={{ fontWeight: 900 }}>{py.gF || 0}</td>
                    <td style={{ fontWeight: 900, background: '#4ade80' }}>{py.gTot || 0}</td>
                  </React.Fragment>
                );
              })()}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footnotes & Signature Section */}
      <div className="tf-sheet-footer" style={{ marginTop: '16px' }}>
        <p className="tf-footer-note" style={{ fontStyle: 'italic', color: '#475569' }}>
          Note: *** Place of residence of visitors. Attraction names were transcribed from official records. Attraction Code is blank for provincial filing.
        </p>

        <div className="tf-signatures-row" style={{ marginTop: '24px' }}>
          <div className="tf-sig-block">
            <span className="tf-sig-label">Prepared by:</span>
            <input
              type="text"
              className="tf-sig-name-input"
              value={meta.preparedBy}
              onChange={(e) => setMeta({ ...meta, preparedBy: e.target.value })}
              placeholder="________________________"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. PROVINCIAL ANNUAL REPORT: Same Day Visitors by Municipality
   Matches Image 8 (Nueva Vizcaya Official Provincial Submission Sheet)
   100% Clean Blank Form - NO hardcoded numbers
   ========================================================================== */
function ProvincialLGUForm({ onNotify }) {
  const [meta, setMeta] = useState({
    province: 'NUEVA VIZCAYA',
    period: '',
    preparedByName: '',
    preparedByTitle: 'Tourism Operations Assistant',
    notedByName: '',
    notedByTitle: 'Sup. Tourism Operations Officer'
  });

  const municipalities = useMemo(() => [
    'ALFONSO CASTAÑEDA',
    'AMBAGUIO',
    'ARITAO',
    'BAGABAG',
    'BAMBANG',
    'BAYOMBONG',
    'DIADI',
    'DUPAX DEL NORTE',
    'DUPAX DEL SUR',
    'KASIBU',
    'KAYAPA',
    'QUEZON',
    'SANTA FE',
    'SOLANO',
    'VILLAVERDE'
  ], []);

  // 100% Clean Blank State: NO DATA
  const [dataStore, setDataStore] = useState({});

  const handleCellChange = (mIdx, muni, field, val) => {
    setDataStore((prev) => {
      const monthData = prev[mIdx] || {};
      const muniData = monthData[muni] || {};
      return {
        ...prev,
        [mIdx]: {
          ...monthData,
          [muni]: {
            ...muniData,
            [field]: val
          }
        }
      };
    });
  };

  const handleClearAllData = () => {
    setMeta({
      province: 'NUEVA VIZCAYA',
      period: '',
      preparedByName: '',
      preparedByTitle: 'Tourism Operations Assistant',
      notedByName: '',
      notedByTitle: 'Sup. Tourism Operations Officer'
    });
    setDataStore({});
    try {
      localStorage.removeItem('turismotrack_visitor_dataset');
    } catch {}
    onNotify('Naalis na po ang lahat ng data. 100% blangko ang form.');
  };

  return (
    <div className="tf-paper-sheet">
      {/* Header Fields matching Image 8 */}
      <div className="tf-sheet-header">
        <div className="tf-meta-form-grid" style={{ maxWidth: 450 }}>
          <div className="tf-meta-field">
            <span className="tf-meta-label">Province:</span>
            <input
              type="text"
              className="tf-meta-input-line"
              value={meta.province}
              onChange={(e) => setMeta({ ...meta, province: e.target.value })}
              placeholder=""
            />
          </div>

          <div className="tf-meta-field">
            <span className="tf-meta-label">Period:</span>
            <input
              type="text"
              className="tf-meta-input-line"
              value={meta.period}
              onChange={(e) => setMeta({ ...meta, period: e.target.value })}
              placeholder=""
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }} className="tf-actions">
        <button type="button" className="tf-btn tf-btn-secondary" onClick={handleClearAllData}>
          <RotateCcw size={14} /> Clear Form
        </button>
      </div>

      {/* Table Structure */}
      <div className="tf-table-wrap">
        <table className="tf-table">
          <thead>
            <tr>
              <th rowSpan={2} className="tf-th-yellow" style={{ width: 95 }}>Month</th>
              {municipalities.map((muni) => (
                <th key={muni} colSpan={3} className="tf-th-yellow">
                  {muni}
                </th>
              ))}
              <th colSpan={3} className="tf-th-yellow">
                Grand Total Visitors
              </th>
            </tr>
            <tr>
              {municipalities.map((muni) => (
                <React.Fragment key={muni}>
                  <th className="tf-th-sub" style={{ width: 34 }}>D</th>
                  <th className="tf-th-sub" style={{ width: 34 }}>F</th>
                  <th className="tf-th-sub" style={{ width: 44 }}>Total</th>
                </React.Fragment>
              ))}
              <th className="tf-th-sub" style={{ width: 50 }}>Domestic</th>
              <th className="tf-th-sub" style={{ width: 50 }}>Foreign</th>
              <th className="tf-th-sub" style={{ width: 56 }}>Total</th>
            </tr>
          </thead>

          <tbody>
            {MONTH_NAMES.map((month, mIdx) => {
              const monthData = dataStore[mIdx] || {};

              let grandRowD = 0;
              let grandRowF = 0;
              let hasAny = false;

              return (
                <tr key={month}>
                  <td style={{ fontWeight: 600 }}>{month}</td>
                  {municipalities.map((muni) => {
                    const c = monthData[muni] || {};
                    const dVal = Number(c.d) || 0;
                    const fVal = Number(c.f) || 0;
                    const hasCell = c.d !== undefined && c.d !== '' || c.f !== undefined && c.f !== '';
                    if (hasCell) hasAny = true;
                    grandRowD += dVal;
                    grandRowF += fVal;
                    const tot = hasCell ? dVal + fVal : '';

                    return (
                      <React.Fragment key={muni}>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="tf-cell-input"
                            value={c.d ?? ''}
                            onChange={(e) => handleCellChange(mIdx, muni, 'd', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="tf-cell-input"
                            value={c.f ?? ''}
                            onChange={(e) => handleCellChange(mIdx, muni, 'f', e.target.value)}
                          />
                        </td>
                        <td className="tf-cell-total">{tot !== '' ? tot : ''}</td>
                      </React.Fragment>
                    );
                  })}

                  {/* Grand Total Visitors */}
                  <td className="tf-cell-grand">{hasAny ? grandRowD : ''}</td>
                  <td className="tf-cell-grand">{hasAny ? grandRowF : ''}</td>
                  <td className="tf-cell-grand" style={{ fontWeight: 800 }}>
                    {hasAny ? grandRowD + grandRowF : ''}
                  </td>
                </tr>
              );
            })}

            {/* Total Row matching Image 8 */}
            <tr className="tf-row-green">
              <td style={{ textAlign: 'right', paddingRight: 8 }}>Total:</td>
              {municipalities.map((muni) => {
                let colD = 0, colF = 0;
                let colHasData = false;
                Object.values(dataStore).forEach((m) => {
                  const c = m[muni] || {};
                  if (c.d || c.f) colHasData = true;
                  colD += Number(c.d) || 0;
                  colF += Number(c.f) || 0;
                });
                return (
                  <React.Fragment key={muni}>
                    <td>{colHasData ? colD : ''}</td>
                    <td>{colHasData ? colF : ''}</td>
                    <td>{colHasData ? colD + colF : ''}</td>
                  </React.Fragment>
                );
              })}

              {/* Grand Total Summary */}
              {(() => {
                let allD = 0, allF = 0;
                let tableHasData = false;
                Object.values(dataStore).forEach((m) => {
                  municipalities.forEach((muni) => {
                    const c = m[muni] || {};
                    if (c.d || c.f) tableHasData = true;
                    allD += Number(c.d) || 0;
                    allF += Number(c.f) || 0;
                  });
                });
                return (
                  <>
                    <td>{tableHasData ? allD : ''}</td>
                    <td>{tableHasData ? allF : ''}</td>
                    <td style={{ backgroundColor: '#ffff00', color: '#000000', fontWeight: 900 }}>
                      {tableHasData ? allD + allF : ''}
                    </td>
                  </>
                );
              })()}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signatures section matching Image 8 */}
      <div className="tf-sheet-footer">
        <div className="tf-signatures-row" style={{ marginTop: 36 }}>
          <div className="tf-sig-block">
            <span className="tf-sig-label">Prepared By:</span>
            <input
              type="text"
              className="tf-sig-name-input"
              value={meta.preparedByName}
              onChange={(e) => setMeta({ ...meta, preparedByName: e.target.value })}
              placeholder=""
            />
            <input
              type="text"
              className="tf-sig-title-input"
              value={meta.preparedByTitle}
              onChange={(e) => setMeta({ ...meta, preparedByTitle: e.target.value })}
            />
          </div>

          <div className="tf-sig-block">
            <span className="tf-sig-label">Noted By:</span>
            <input
              type="text"
              className="tf-sig-name-input"
              value={meta.notedByName}
              onChange={(e) => setMeta({ ...meta, notedByName: e.target.value })}
              placeholder=""
            />
            <input
              type="text"
              className="tf-sig-title-input"
              value={meta.notedByTitle}
              onChange={(e) => setMeta({ ...meta, notedByTitle: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
