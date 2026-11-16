import React, { useState, useMemo, useCallback } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  RotateCcw,
  Plus,
  Trash2,
  FileText,
  Info,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import './TourismForms.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function TourismForms({ user }) {
  const [activeFormTab, setActiveFormTab] = useState('VAR1');
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
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
              Department of Tourism (DOT) Official Forms
              <span className="tf-badge-official">DOT Standard</span>
            </h2>
            <p>
              Standard blank government filing forms for Visitor Attraction Recording (VAR), Municipal aggregation, and Provincial reporting.
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

        {/* Tab Selection */}
        <div className="tf-tabs-wrapper">
          <button
            type="button"
            className={`tf-tab-btn ${activeFormTab === 'VAR1' ? 'active' : ''}`}
            onClick={() => setActiveFormTab('VAR1')}
          >
            <span className="tf-tab-badge">VAR 1</span>
            Tourism Attraction Visitor Record (Daily)
          </button>

          <button
            type="button"
            className={`tf-tab-btn ${activeFormTab === 'LOGSHEET' ? 'active' : ''}`}
            onClick={() => setActiveFormTab('LOGSHEET')}
          >
            <span className="tf-tab-badge">LOG</span>
            Attraction Spot Visitor Logsheet
          </button>

          <button
            type="button"
            className={`tf-tab-btn ${activeFormTab === 'VAR2' ? 'active' : ''}`}
            onClick={() => setActiveFormTab('VAR2')}
          >
            <span className="tf-tab-badge">VAR 2 / 2P</span>
            Tourism Attraction Visitor Record (Monthly Consolidation)
          </button>

          <button
            type="button"
            className={`tf-tab-btn ${activeFormTab === 'VAR3M' ? 'active' : ''}`}
            onClick={() => setActiveFormTab('VAR3M')}
          >
            <span className="tf-tab-badge">VAR 3M</span>
            Annual Report by Attraction
          </button>

          <button
            type="button"
            className={`tf-tab-btn ${activeFormTab === 'PROVINCIAL_LGU' ? 'active' : ''}`}
            onClick={() => setActiveFormTab('PROVINCIAL_LGU')}
          >
            <span className="tf-tab-badge">PROVINCIAL</span>
            Same Day Visitors by Municipality
          </button>

          <button
            type="button"
            className={`tf-tab-btn ${activeFormTab === 'VAR3R' ? 'active' : ''}`}
            onClick={() => setActiveFormTab('VAR3R')}
          >
            <span className="tf-tab-badge">VAR 3R</span>
            Annual Report by LGU (Regional)
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
          padding: '10px 18px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          zIndex: 9999,
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
        }}>
          {toastMsg}
        </div>
      )}

      {/* Render the Active Official Form */}
      {activeFormTab === 'VAR1' && <VAR1Form onNotify={showToast} />}
      {activeFormTab === 'LOGSHEET' && <LogSheetForm onNotify={showToast} />}
      {activeFormTab === 'VAR2' && <VAR2Form onNotify={showToast} />}
      {activeFormTab === 'VAR3M' && <VAR3MForm onNotify={showToast} />}
      {activeFormTab === 'PROVINCIAL_LGU' && <ProvincialLGUForm onNotify={showToast} />}
      {activeFormTab === 'VAR3R' && <VAR3RForm onNotify={showToast} />}
    </div>
  );
}

/* ==========================================================================
   1. VAR 1 FORM: Tourism Attraction Visitor Record (Daily 1-31)
   Matches Images 2 & 3
   ========================================================================== */
function VAR1Form({ onNotify }) {
  const [meta, setMeta] = useState({
    monthYear: '',
    municipality: '',
    attractionSpot: '',
    attractionType: ''
  });

  // 31 Days initialized completely blank (no pre-filled sample data)
  const initialDays = useMemo(() => {
    return Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      weekDay: '',
      thisProvMale: '',
      thisProvFemale: '',
      otherProvMale: '',
      otherProvFemale: '',
      foreignMale: '',
      foreignFemale: '',
    }));
  }, []);

  const [days, setDays] = useState(initialDays);

  const handleCellChange = (index, field, value) => {
    setDays((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleReset = () => {
    setMeta({ monthYear: '', municipality: '', attractionSpot: '', attractionType: '' });
    setDays(initialDays);
    onNotify('Form reset to clean blank state.');
  };

  // Compute column totals dynamically
  const totals = useMemo(() => {
    let thisProvM = 0, thisProvF = 0;
    let otherProvM = 0, otherProvF = 0;
    let foreignM = 0, foreignF = 0;

    days.forEach((d) => {
      thisProvM += Number(d.thisProvMale) || 0;
      thisProvF += Number(d.thisProvFemale) || 0;
      otherProvM += Number(d.otherProvMale) || 0;
      otherProvF += Number(d.otherProvFemale) || 0;
      foreignM += Number(d.foreignMale) || 0;
      foreignF += Number(d.foreignFemale) || 0;
    });

    const thisProvTot = thisProvM + thisProvF;
    const otherProvTot = otherProvM + otherProvF;
    const foreignTot = foreignM + foreignF;

    const grandM = thisProvM + otherProvM + foreignM;
    const grandF = thisProvF + otherProvF + foreignF;
    const grandTot = grandM + grandF;

    return {
      thisProvM, thisProvF, thisProvTot,
      otherProvM, otherProvF, otherProvTot,
      foreignM, foreignF, foreignTot,
      grandM, grandF, grandTot
    };
  }, [days]);

  return (
    <div className="tf-paper-sheet">
      <div className="tf-page-watermark">Page 1</div>

      {/* Top Header */}
      <div className="tf-sheet-header">
        <div className="tf-code-corner">(VAR 1)</div>
        <h2 className="tf-sheet-title">Tourism Attraction Visitor Record</h2>
        <p className="tf-sheet-subtitle">( This recording form can be used instead of just counting the visitors )</p>

        <div className="tf-meta-form-grid">
          <div className="tf-meta-field">
            <span className="tf-meta-label">Month/Year:</span>
            <input
              type="text"
              className="tf-meta-input-line"
              value={meta.monthYear}
              onChange={(e) => setMeta({ ...meta, monthYear: e.target.value })}
              placeholder=""
            />
          </div>

          <div className="tf-meta-field">
            <span className="tf-meta-label">Name of Municipality:</span>
            <input
              type="text"
              className="tf-meta-input-line"
              value={meta.municipality}
              onChange={(e) => setMeta({ ...meta, municipality: e.target.value })}
              placeholder=""
            />
          </div>

          <div className="tf-meta-field">
            <span className="tf-meta-label">Name of attraction/ Spot:</span>
            <input
              type="text"
              className="tf-meta-input-line"
              value={meta.attractionSpot}
              onChange={(e) => setMeta({ ...meta, attractionSpot: e.target.value })}
              placeholder=""
            />
          </div>

          <div className="tf-meta-field" style={{ marginTop: 2 }}>
            <span className="tf-meta-label">Type of Tourism Attraction:</span>
            <input
              type="text"
              className="tf-meta-box"
              maxLength={2}
              value={meta.attractionType}
              onChange={(e) => setMeta({ ...meta, attractionType: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Reset button toolbar (hidden in print) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }} className="tf-actions">
        <button type="button" className="tf-btn tf-btn-secondary" onClick={handleReset}>
          <RotateCcw size={14} /> Clear Form
        </button>
      </div>

      {/* Table Structure */}
      <div className="tf-table-wrap">
        <table className="tf-table">
          <thead>
            {/* Header Row 1 */}
            <tr>
              <th colSpan={2} rowSpan={2} className="tf-th-yellow" style={{ minWidth: 90 }}>
                Date
              </th>
              <th colSpan={9} className="tf-th-yellow">
                *** Place of Residence
              </th>
              <th colSpan={3} rowSpan={2} className="tf-th-yellow" style={{ minWidth: 100 }}>
                * Grand Total<br />Number of Visitors
              </th>
            </tr>

            {/* Header Row 2 */}
            <tr>
              <th colSpan={6} className="tf-th-yellow">
                Philippines
              </th>
              <th colSpan={3} className="tf-th-yellow">
                Foreign Country Residence
              </th>
            </tr>

            {/* Header Row 3 */}
            <tr>
              <th className="tf-th-yellow" style={{ width: 34 }}>Day</th>
              <th className="tf-th-yellow" style={{ width: 65, fontSize: '9.5px' }}>Week Day<br />(Mon-Sun)</th>

              {/* Philippines - This province */}
              <th colSpan={3} className="tf-th-sub">This province</th>

              {/* Philippines - Other Province */}
              <th colSpan={3} className="tf-th-sub">Other Province</th>

              {/* Foreign Country Residence */}
              <th className="tf-th-sub" style={{ width: 36 }}>Male</th>
              <th className="tf-th-sub" style={{ width: 36 }}>Female</th>
              <th className="tf-th-sub" style={{ width: 38 }}>Total</th>

              {/* Grand Total */}
              <th className="tf-th-sub" style={{ width: 36 }}>Male</th>
              <th className="tf-th-sub" style={{ width: 36 }}>Female</th>
              <th className="tf-th-sub" style={{ width: 42 }}>Total</th>
            </tr>

            {/* Header Row 4 (Sub labels) */}
            <tr>
              <th className="tf-th-white" colSpan={2}></th>
              <th className="tf-th-yellow" style={{ width: 36 }}>Male</th>
              <th className="tf-th-yellow" style={{ width: 36 }}>Female</th>
              <th className="tf-th-yellow" style={{ width: 38 }}>Total</th>

              <th className="tf-th-yellow" style={{ width: 36 }}>Male</th>
              <th className="tf-th-yellow" style={{ width: 36 }}>Female</th>
              <th className="tf-th-yellow" style={{ width: 38 }}>Total</th>

              <th className="tf-th-white" colSpan={6}></th>
            </tr>
          </thead>

          <tbody>
            {days.map((row, idx) => {
              const tpM = Number(row.thisProvMale) || 0;
              const tpF = Number(row.thisProvFemale) || 0;
              const hasTp = row.thisProvMale !== '' || row.thisProvFemale !== '';
              const tpTot = hasTp ? tpM + tpF : '';

              const opM = Number(row.otherProvMale) || 0;
              const opF = Number(row.otherProvFemale) || 0;
              const hasOp = row.otherProvMale !== '' || row.otherProvFemale !== '';
              const opTot = hasOp ? opM + opF : '';

              const fM = Number(row.foreignMale) || 0;
              const fF = Number(row.foreignFemale) || 0;
              const hasF = row.foreignMale !== '' || row.foreignFemale !== '';
              const fTot = hasF ? fM + fF : '';

              const hasAny = hasTp || hasOp || hasF;
              const grandM = hasAny ? (tpM + opM + fM) : '';
              const grandF = hasAny ? (tpF + opF + fF) : '';
              const grandTot = hasAny ? (Number(grandM || 0) + Number(grandF || 0)) : '';

              return (
                <tr key={row.day}>
                  <td style={{ fontWeight: 600 }}>{row.day}</td>
                  <td>
                    <input
                      type="text"
                      className="tf-cell-input"
                      value={row.weekDay}
                      onChange={(e) => handleCellChange(idx, 'weekDay', e.target.value)}
                    />
                  </td>

                  {/* This Province */}
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="tf-cell-input"
                      value={row.thisProvMale}
                      onChange={(e) => handleCellChange(idx, 'thisProvMale', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="tf-cell-input"
                      value={row.thisProvFemale}
                      onChange={(e) => handleCellChange(idx, 'thisProvFemale', e.target.value)}
                    />
                  </td>
                  <td className="tf-cell-total">{tpTot !== '' ? tpTot : ''}</td>

                  {/* Other Province */}
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="tf-cell-input"
                      value={row.otherProvMale}
                      onChange={(e) => handleCellChange(idx, 'otherProvMale', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="tf-cell-input"
                      value={row.otherProvFemale}
                      onChange={(e) => handleCellChange(idx, 'otherProvFemale', e.target.value)}
                    />
                  </td>
                  <td className="tf-cell-total">{opTot !== '' ? opTot : ''}</td>

                  {/* Foreign */}
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="tf-cell-input"
                      value={row.foreignMale}
                      onChange={(e) => handleCellChange(idx, 'foreignMale', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="tf-cell-input"
                      value={row.foreignFemale}
                      onChange={(e) => handleCellChange(idx, 'foreignFemale', e.target.value)}
                    />
                  </td>
                  <td className="tf-cell-total">{fTot !== '' ? fTot : ''}</td>

                  {/* Grand Total */}
                  <td className="tf-cell-grand">{grandM !== '' ? grandM : ''}</td>
                  <td className="tf-cell-grand">{grandF !== '' ? grandF : ''}</td>
                  <td className="tf-cell-grand" style={{ fontWeight: 800 }}>{grandTot !== '' ? grandTot : ''}</td>
                </tr>
              );
            })}

            {/* Total of this Month **** Row (Authentic Green Row) */}
            <tr className="tf-row-green">
              <td colSpan={2} style={{ textAlign: 'left', paddingLeft: 8 }}>
                Total of this Month ****
              </td>
              <td>{totals.thisProvM || 0}</td>
              <td>{totals.thisProvF || 0}</td>
              <td>{totals.thisProvTot || 0}</td>
              <td>{totals.otherProvM || 0}</td>
              <td>{totals.otherProvF || 0}</td>
              <td>{totals.otherProvTot || 0}</td>
              <td>{totals.foreignM || 0}</td>
              <td>{totals.foreignF || 0}</td>
              <td>{totals.foreignTot || 0}</td>
              <td>{totals.grandM || 0}</td>
              <td>{totals.grandF || 0}</td>
              <td>{totals.grandTot || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Official Footnotes */}
      <div className="tf-sheet-footer">
        <p className="tf-footer-note">
          Note: * Total number must be recorded. ** Sex & ***Residence entries are optional. Total number of this month must be reported.
        </p>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. ATTRACTION SPOT VISITOR LOG SHEET: Daily Registration Sheet (1-30)
   Matches Image 1
   ========================================================================== */
function LogSheetForm({ onNotify }) {
  const [meta, setMeta] = useState({
    attractionSpot: '',
    attractionType: ''
  });

  const initialRows = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      no: i + 1,
      date: '',
      visitorName: '',
      sex: '', // M or F
      residence: '', // R, NR, Fo
      remarks: ''
    }));
  }, []);

  const [rows, setRows] = useState(initialRows);

  const handleCellChange = (index, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleReset = () => {
    setMeta({ attractionSpot: '', attractionType: '' });
    setRows(initialRows);
    onNotify('Logsheet reset to clean blank state.');
  };

  return (
    <div className="tf-paper-sheet">
      {/* Header Fields matching Image 1 */}
      <div className="tf-sheet-header">
        <div className="tf-meta-form-grid" style={{ maxWidth: 600 }}>
          <div className="tf-meta-field">
            <span className="tf-meta-label">Name of attraction/ Spot:</span>
            <input
              type="text"
              className="tf-meta-input-line"
              value={meta.attractionSpot}
              onChange={(e) => setMeta({ ...meta, attractionSpot: e.target.value })}
              placeholder=""
            />
          </div>

          <div className="tf-meta-field">
            <span className="tf-meta-label">Type of Tourism Attraction:</span>
            <input
              type="text"
              className="tf-meta-box"
              maxLength={2}
              value={meta.attractionType}
              onChange={(e) => setMeta({ ...meta, attractionType: e.target.value })}
            />
            <span className="tf-meta-hint">(Refer to the attached list of tourism attraction type)</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }} className="tf-actions">
        <button type="button" className="tf-btn tf-btn-secondary" onClick={handleReset}>
          <RotateCcw size={14} /> Clear Logsheet
        </button>
      </div>

      {/* Table Structure matching Image 1 */}
      <div className="tf-table-wrap">
        <table className="tf-table">
          <thead>
            <tr>
              <th rowSpan={2} style={{ width: 34 }}>No.</th>
              <th rowSpan={2} style={{ width: 85 }}>Date</th>
              <th rowSpan={2} style={{ minWidth: 200 }}>
                Name of Visitor<br />
                <span style={{ fontSize: '10px', fontWeight: 'normal' }}>(optional to record/ write)</span>
              </th>
              <th colSpan={2} style={{ width: 70 }}>Sex</th>
              <th colSpan={3}>Place of Residence</th>
              <th rowSpan={2} style={{ minWidth: 260 }}>Remarks</th>
            </tr>
            <tr>
              <th style={{ width: 35 }}>Male</th>
              <th style={{ width: 35 }}>Female</th>
              <th style={{ width: 55, fontSize: '10px' }}>This provin</th>
              <th style={{ width: 55, fontSize: '10px' }}>Other Provin</th>
              <th style={{ width: 55, fontSize: '10px' }}>Foreign Count</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.no}>
                <td style={{ fontWeight: 600 }}>{r.no}</td>
                <td>
                  <input
                    type="text"
                    className="tf-cell-input"
                    value={r.date}
                    onChange={(e) => handleCellChange(idx, 'date', e.target.value)}
                    placeholder=""
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="tf-cell-input tf-cell-input-text"
                    value={r.visitorName}
                    onChange={(e) => handleCellChange(idx, 'visitorName', e.target.value)}
                    placeholder=""
                  />
                </td>

                {/* Sex M / F */}
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="text"
                    className="tf-cell-input"
                    maxLength={1}
                    value={r.sex === 'M' || r.sex === 'Male' ? 'M' : (r.sex === 'F' ? '' : r.sex)}
                    onChange={(e) => handleCellChange(idx, 'sex', e.target.value.toUpperCase())}
                    placeholder="M"
                    style={{ color: '#000000' }}
                  />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="text"
                    className="tf-cell-input"
                    maxLength={1}
                    value={r.sex === 'F' || r.sex === 'Female' ? 'F' : ''}
                    onChange={(e) => handleCellChange(idx, 'sex', e.target.value.toUpperCase() === 'F' ? 'F' : '')}
                    placeholder="F"
                    style={{ color: '#000000' }}
                  />
                </td>

                {/* Residence: R, NR, Fo */}
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="text"
                    className="tf-cell-input"
                    maxLength={2}
                    value={r.residence === 'R' ? 'R' : ''}
                    onChange={(e) => handleCellChange(idx, 'residence', e.target.value.toUpperCase() === 'R' ? 'R' : '')}
                    placeholder="R"
                  />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="text"
                    className="tf-cell-input"
                    maxLength={2}
                    value={r.residence === 'NR' ? 'NR' : ''}
                    onChange={(e) => handleCellChange(idx, 'residence', e.target.value.toUpperCase() === 'NR' ? 'NR' : '')}
                    placeholder="NR"
                  />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="text"
                    className="tf-cell-input"
                    maxLength={2}
                    value={r.residence === 'Fo' || r.residence === 'FO' ? 'Fo' : ''}
                    onChange={(e) => handleCellChange(idx, 'residence', e.target.value.toUpperCase() === 'FO' ? 'Fo' : '')}
                    placeholder="Fo"
                  />
                </td>

                {/* Remarks */}
                <td>
                  <input
                    type="text"
                    className="tf-cell-input tf-cell-input-text"
                    value={r.remarks}
                    onChange={(e) => handleCellChange(idx, 'remarks', e.target.value)}
                    placeholder=""
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Notes matching Image 1 */}
      <div className="tf-sheet-footer">
        <p className="tf-footer-note">*R Resident of this province</p>
        <p className="tf-footer-note">**NR Non-Resident of this province</p>
        <p className="tf-footer-note">***Fo Foreigner/Non-Filipino Citizen</p>
        <div style={{ textAlign: 'center', marginTop: 12, fontWeight: 700, color: '#475569', fontSize: 11 }}>
          &lt;Continue to next page&gt;
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   3. VAR 2 / VAR 2P: Tourism Attraction Visitor Record (Monthly Consolidation)
   Matches Images 4, 5, 7
   ========================================================================== */
function VAR2Form({ onNotify }) {
  const [meta, setMeta] = useState({
    monthYear: '',
    municipality: 'NUEVA VIZCAYA',
    preparedBy: '',
    notedBy: ''
  });

  // Standard Nueva Vizcaya Municipalities and Attraction spots
  // Initialized completely blank (NO data numbers pre-filled)
  const initialGroups = useMemo(() => [
    {
      municipality: 'ALFONSO CASTAÑEDA',
      attractions: [
        { name: 'Alfonso Castañeda Resort & Recreation Park', code: '' },
        { name: 'Galintuja Falls', code: '' },
        { name: 'Bailanlay Picnic Site', code: '' }
      ]
    },
    {
      municipality: 'AMBAGUIO',
      attractions: [
        { name: 'Gulon Peak', code: '' },
        { name: 'Mt. Pulag via Ambaguio Trail', code: '' },
        { name: 'NUVZ Paragliding', code: '' },
        { name: 'Tacio Hills', code: '' }
      ]
    },
    {
      municipality: 'BAGABAG',
      attractions: [
        { name: "Reginaldo's Farm", code: '' }
      ]
    },
    {
      municipality: 'BAYOMBONG',
      attractions: [
        { name: "Nueva Vizcaya People's Museum & Library", code: '' },
        { name: 'Mountain Resort', code: '' },
        { name: 'Disadeco Resort & Sports Complex', code: '' },
        { name: 'Prianas Resort', code: '' },
        { name: 'Pasalubong Center', code: '' },
        { name: 'Rizal Shrine', code: '' },
        { name: "Macababbad's Farm", code: '' },
        { name: 'Palian Flower Farm', code: '' }
      ]
    },
    {
      municipality: 'DIADI',
      attractions: [
        { name: 'Lower Magat Eco TourismPark', code: '' }
      ]
    },
    {
      municipality: 'DUPAX DEL NORTE',
      attractions: [
        { name: 'Jangan Sea of Clouds', code: '' },
        { name: 'Nacuron Falls', code: '' }
      ]
    },
    {
      municipality: 'DUPAX DEL SUR',
      attractions: [
        { name: 'Saint Vincent Ferrer Church', code: '' },
        { name: 'Dupax Watershed Forest Reserve', code: '' }
      ]
    },
    {
      municipality: 'KASIBU',
      attractions: [
        { name: 'Capisaan Caves', code: '' },
        { name: 'Edralin Falls', code: '' }
      ]
    },
    {
      municipality: 'KAYAPA',
      attractions: [
        { name: 'Mt. Ugo', code: '' },
        { name: 'Mt. Tuyway', code: '' }
      ]
    },
    {
      municipality: 'QUEZON',
      attractions: [
        { name: 'Lintungan Falls', code: '' },
        { name: 'Mapalyao Falls', code: '' },
        { name: 'Mt. Palali', code: '' }
      ]
    },
    {
      municipality: 'SANTA FE',
      attractions: [
        { name: 'Imugan Falls', code: '' },
        { name: 'Historical Balete Pass', code: '' },
        { name: 'Sta Fe Forest Park', code: '' },
        { name: 'Sinapaoan Falls', code: '' },
        { name: 'Malico Salacsac Pass', code: '' }
      ]
    },
    {
      municipality: 'SOLANO',
      attractions: [
        { name: '24/7 Inn & Resort', code: '' },
        { name: 'Mountain Resort', code: '' },
        { name: 'Valentina Hotel', code: '' }
      ]
    },
    {
      municipality: 'OTHERS / FESTIVALS',
      attractions: [
        { name: 'Grand Ammungan Festival', code: '' }
      ]
    }
  ], []);

  // State mapping for rows data: { [key]: { thisProvMale, thisProvFemale, otherProvMale, otherProvFemale, foreignMale, foreignFemale } }
  const [dataStore, setDataStore] = useState({});

  const handleCellChange = (key, field, value) => {
    setDataStore((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value
      }
    }));
  };

  const handleReset = () => {
    setMeta({ monthYear: '', municipality: 'NUEVA VIZCAYA', preparedBy: '', notedBy: '' });
    setDataStore({});
    onNotify('VAR 2 Form cleared to blank.');
  };

  // Grand summary calculation across all municipalities
  const grandTotals = useMemo(() => {
    let tpM = 0, tpF = 0;
    let opM = 0, opF = 0;
    let fM = 0, fF = 0;

    Object.values(dataStore).forEach((val) => {
      tpM += Number(val?.thisProvMale) || 0;
      tpF += Number(val?.thisProvFemale) || 0;
      opM += Number(val?.otherProvMale) || 0;
      opF += Number(val?.otherProvFemale) || 0;
      fM += Number(val?.foreignMale) || 0;
      fF += Number(val?.foreignFemale) || 0;
    });

    const tpTot = tpM + tpF;
    const opTot = opM + opF;
    const fTot = fM + fF;
    const gM = tpM + opM + fM;
    const gF = tpF + opF + fF;
    const gTot = gM + gF;

    return { tpM, tpF, tpTot, opM, opF, opTot, fM, fF, fTot, gM, gF, gTot };
  }, [dataStore]);

  return (
    <div className="tf-paper-sheet">
      <div className="tf-page-watermark">VAR 2P</div>

      {/* Sheet Header matching Images 4 & 7 */}
      <div className="tf-sheet-header">
        <div className="tf-code-corner">VAR 2P</div>
        <h2 className="tf-sheet-title">Tourism Attraction Visitor Record</h2>
        <p className="tf-sheet-subtitle">( This recording form can be used instead of just counting the visitors )</p>

        <div className="tf-meta-form-grid">
          <div className="tf-meta-field">
            <span className="tf-meta-label">Month/Year:</span>
            <input
              type="text"
              className="tf-meta-input-line"
              value={meta.monthYear}
              onChange={(e) => setMeta({ ...meta, monthYear: e.target.value })}
              placeholder=""
            />
          </div>

          <div className="tf-meta-field">
            <span className="tf-meta-label">Name of Municipality:</span>
            <input
              type="text"
              className="tf-meta-input-line"
              value={meta.municipality}
              onChange={(e) => setMeta({ ...meta, municipality: e.target.value })}
              placeholder=""
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }} className="tf-actions">
        <button type="button" className="tf-btn tf-btn-secondary" onClick={handleReset}>
          <RotateCcw size={14} /> Clear Form
        </button>
      </div>

      {/* Table Structure */}
      <div className="tf-table-wrap">
        <table className="tf-table">
          <thead>
            {/* Row 1 */}
            <tr>
              <th colSpan={2} rowSpan={2} className="tf-th-yellow" style={{ minWidth: 240, textAlign: 'left', paddingLeft: 10 }}>
                Visitor Attraction
              </th>
              <th colSpan={9} className="tf-th-yellow">
                *** Place of Residence
              </th>
              <th colSpan={3} rowSpan={2} className="tf-th-yellow" style={{ minWidth: 100 }}>
                * Grand Total<br />Number of Visitors
              </th>
            </tr>

            {/* Row 2 */}
            <tr>
              <th colSpan={6} className="tf-th-yellow">Philippines</th>
              <th colSpan={3} className="tf-th-yellow">Foreign Country Residence</th>
            </tr>

            {/* Row 3 */}
            <tr>
              <th className="tf-th-yellow" style={{ minWidth: 180, textAlign: 'left', paddingLeft: 10 }}>Name</th>
              <th className="tf-th-yellow" style={{ minWidth: 90 }}>Attraction Code</th>

              <th colSpan={3} className="tf-th-sub">This province</th>
              <th colSpan={3} className="tf-th-sub">Other Province</th>

              <th className="tf-th-sub" style={{ width: 34 }}>Male</th>
              <th className="tf-th-sub" style={{ width: 34 }}>Female</th>
              <th className="tf-th-sub" style={{ width: 38 }}>Total</th>

              <th className="tf-th-sub" style={{ width: 36 }}>Male</th>
              <th className="tf-th-sub" style={{ width: 36 }}>Female</th>
              <th className="tf-th-sub" style={{ width: 42 }}>Total</th>
            </tr>

            {/* Row 4 */}
            <tr>
              <th className="tf-th-white" colSpan={2}></th>
              <th className="tf-th-yellow" style={{ width: 34 }}>Male</th>
              <th className="tf-th-yellow" style={{ width: 34 }}>Female</th>
              <th className="tf-th-yellow" style={{ width: 38 }}>Total</th>

              <th className="tf-th-yellow" style={{ width: 34 }}>Male</th>
              <th className="tf-th-yellow" style={{ width: 34 }}>Female</th>
              <th className="tf-th-yellow" style={{ width: 38 }}>Total</th>

              <th className="tf-th-white" colSpan={6}></th>
            </tr>
          </thead>

          <tbody>
            {initialGroups.map((group) => {
              // Calculate group subtotal
              let subTpM = 0, subTpF = 0, subOpM = 0, subOpF = 0, subFM = 0, subFF = 0;
              group.attractions.forEach((_, aIdx) => {
                const k = `${group.municipality}_${aIdx}`;
                const row = dataStore[k] || {};
                subTpM += Number(row.thisProvMale) || 0;
                subTpF += Number(row.thisProvFemale) || 0;
                subOpM += Number(row.otherProvMale) || 0;
                subOpF += Number(row.otherProvFemale) || 0;
                subFM += Number(row.foreignMale) || 0;
                subFF += Number(row.foreignFemale) || 0;
              });

              const subTpTot = subTpM + subTpF;
              const subOpTot = subOpM + subOpF;
              const subFTot = subFM + subFF;
              const subGrandM = subTpM + subOpM + subFM;
              const subGrandF = subTpF + subOpF + subFF;
              const subGrandTot = subGrandM + subGrandF;

              return (
                <React.Fragment key={group.municipality}>
                  {/* Group Header Row (Municipality Name) */}
                  <tr>
                    <td colSpan={14} className="tf-group-header-cell">
                      {group.municipality}
                    </td>
                  </tr>

                  {/* Individual Attraction Rows */}
                  {group.attractions.map((attr, aIdx) => {
                    const rowKey = `${group.municipality}_${aIdx}`;
                    const rowData = dataStore[rowKey] || {};

                    const tpM = Number(rowData.thisProvMale) || 0;
                    const tpF = Number(rowData.thisProvFemale) || 0;
                    const hasTp = rowData.thisProvMale !== undefined && rowData.thisProvMale !== '' ||
                                  rowData.thisProvFemale !== undefined && rowData.thisProvFemale !== '';
                    const tpTot = hasTp ? tpM + tpF : '';

                    const opM = Number(rowData.otherProvMale) || 0;
                    const opF = Number(rowData.otherProvFemale) || 0;
                    const hasOp = rowData.otherProvMale !== undefined && rowData.otherProvMale !== '' ||
                                  rowData.otherProvFemale !== undefined && rowData.otherProvFemale !== '';
                    const opTot = hasOp ? opM + opF : '';

                    const fM = Number(rowData.foreignMale) || 0;
                    const fF = Number(rowData.foreignFemale) || 0;
                    const hasF = rowData.foreignMale !== undefined && rowData.foreignMale !== '' ||
                                 rowData.foreignFemale !== undefined && rowData.foreignFemale !== '';
                    const fTot = hasF ? fM + fF : '';

                    const hasAny = hasTp || hasOp || hasF;
                    const gM = hasAny ? (tpM + opM + fM) : '';
                    const gF = hasAny ? (tpF + opF + fF) : '';
                    const gTot = hasAny ? (Number(gM || 0) + Number(gF || 0)) : '';

                    return (
                      <tr key={rowKey}>
                        <td style={{ textAlign: 'left', paddingLeft: 16 }}>{attr.name}</td>
                        <td>
                          <input
                            type="text"
                            className="tf-cell-input"
                            value={rowData.code || ''}
                            onChange={(e) => handleCellChange(rowKey, 'code', e.target.value)}
                            placeholder=""
                          />
                        </td>

                        {/* This province */}
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="tf-cell-input"
                            value={rowData.thisProvMale ?? ''}
                            onChange={(e) => handleCellChange(rowKey, 'thisProvMale', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="tf-cell-input"
                            value={rowData.thisProvFemale ?? ''}
                            onChange={(e) => handleCellChange(rowKey, 'thisProvFemale', e.target.value)}
                          />
                        </td>
                        <td className="tf-cell-total">{tpTot !== '' ? tpTot : ''}</td>

                        {/* Other province */}
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="tf-cell-input"
                            value={rowData.otherProvMale ?? ''}
                            onChange={(e) => handleCellChange(rowKey, 'otherProvMale', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="tf-cell-input"
                            value={rowData.otherProvFemale ?? ''}
                            onChange={(e) => handleCellChange(rowKey, 'otherProvFemale', e.target.value)}
                          />
                        </td>
                        <td className="tf-cell-total">{opTot !== '' ? opTot : ''}</td>

                        {/* Foreign */}
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="tf-cell-input"
                            value={rowData.foreignMale ?? ''}
                            onChange={(e) => handleCellChange(rowKey, 'foreignMale', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="tf-cell-input"
                            value={rowData.foreignFemale ?? ''}
                            onChange={(e) => handleCellChange(rowKey, 'foreignFemale', e.target.value)}
                          />
                        </td>
                        <td className="tf-cell-total">{fTot !== '' ? fTot : ''}</td>

                        {/* Grand Total */}
                        <td className="tf-cell-grand">{gM !== '' ? gM : ''}</td>
                        <td className="tf-cell-grand">{gF !== '' ? gF : ''}</td>
                        <td className="tf-cell-grand">{gTot !== '' ? gTot : ''}</td>
                      </tr>
                    );
                  })}

                  {/* Subtotal Row per Municipality */}
                  <tr>
                    <td colSpan={2} className="tf-subtotal-cell" style={{ textAlign: 'right', paddingRight: 10 }}>
                      Total ({group.municipality})
                    </td>
                    <td className="tf-subtotal-cell">{subTpM || 0}</td>
                    <td className="tf-subtotal-cell">{subTpF || 0}</td>
                    <td className="tf-subtotal-cell">{subTpTot || 0}</td>
                    <td className="tf-subtotal-cell">{subOpM || 0}</td>
                    <td className="tf-subtotal-cell">{subOpF || 0}</td>
                    <td className="tf-subtotal-cell">{subOpTot || 0}</td>
                    <td className="tf-subtotal-cell">{subFM || 0}</td>
                    <td className="tf-subtotal-cell">{subFF || 0}</td>
                    <td className="tf-subtotal-cell">{subFTot || 0}</td>
                    <td className="tf-subtotal-cell">{subGrandM || 0}</td>
                    <td className="tf-subtotal-cell">{subGrandF || 0}</td>
                    <td className="tf-subtotal-cell">{subGrandTot || 0}</td>
                  </tr>
                </React.Fragment>
              );
            })}

            {/* Total of this Month **** Row (Authentic Green Row) */}
            <tr className="tf-row-green">
              <td colSpan={2} style={{ textAlign: 'left', paddingLeft: 10 }}>
                Total of this Month ****
              </td>
              <td>{grandTotals.tpM || 0}</td>
              <td>{grandTotals.tpF || 0}</td>
              <td>{grandTotals.tpTot || 0}</td>
              <td>{grandTotals.opM || 0}</td>
              <td>{grandTotals.opF || 0}</td>
              <td>{grandTotals.opTot || 0}</td>
              <td>{grandTotals.fM || 0}</td>
              <td>{grandTotals.fF || 0}</td>
              <td>{grandTotals.fTot || 0}</td>
              <td>{grandTotals.gM || 0}</td>
              <td>{grandTotals.gF || 0}</td>
              <td>{grandTotals.gTot || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footnotes & Instructions matching Image 4 & 7 */}
      <div className="tf-sheet-footer">
        <p className="tf-footer-note">
          Note: * Total number must be recorded. ** Sex & ***Residence entries are optional. Total number of this month must be reported.
        </p>
        <p className="tf-footer-notice">
          NOTE: THIS FORM SHALL BE USED FOR VISITORS WHO VISITED ANY TOURISM ATTRACTION/DESTINATION BUT DID NOT STAY OVERNIGHT
        </p>

        {/* Signatures */}
        <div className="tf-signatures-row">
          <div className="tf-sig-block">
            <span className="tf-sig-label">Prepared By:</span>
            <input
              type="text"
              className="tf-sig-name-input"
              value={meta.preparedBy}
              onChange={(e) => setMeta({ ...meta, preparedBy: e.target.value })}
              placeholder=""
            />
          </div>

          <div className="tf-sig-block">
            <span className="tf-sig-label">Noted By:</span>
            <input
              type="text"
              className="tf-sig-name-input"
              value={meta.notedBy}
              onChange={(e) => setMeta({ ...meta, notedBy: e.target.value })}
              placeholder=""
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   4. VAR 3M: Monthly Report on Same Day Visitors by Attraction
   Matches Image 6
   ========================================================================== */
function VAR3MForm({ onNotify }) {
  const [meta, setMeta] = useState({
    municipality: '',
    province: 'NUEVA VIZCAYA',
    period: ''
  });

  const [attractions, setAttractions] = useState([
    { id: 1, name: 'Attraction 1', code: 'Code' },
    { id: 2, name: 'Attraction 2', code: 'Code' },
    { id: 3, name: 'Attraction 3', code: 'Code' },
    { id: 4, name: 'Attraction N', code: 'Code' },
  ]);

  // Data: { [monthIdx]: { [attrId]: { domestic, foreign } } }
  const [dataStore, setDataStore] = useState({});

  const handleCellChange = (monthIdx, attrId, field, val) => {
    setDataStore((prev) => {
      const monthData = prev[monthIdx] || {};
      const attrData = monthData[attrId] || {};
      return {
        ...prev,
        [monthIdx]: {
          ...monthData,
          [attrId]: {
            ...attrData,
            [field]: val
          }
        }
      };
    });
  };

  const handleAddAttraction = () => {
    const nextId = attractions.length + 1;
    setAttractions([...attractions, { id: nextId, name: `Attraction ${nextId}`, code: 'Code' }]);
  };

  const handleReset = () => {
    setMeta({ municipality: '', province: 'NUEVA VIZCAYA', period: '' });
    setDataStore({});
    onNotify('VAR 3M Form cleared to blank.');
  };

  return (
    <div className="tf-paper-sheet">
      <div className="tf-page-watermark">VAR 3M</div>

      {/* Header Fields matching Image 6 */}
      <div className="tf-sheet-header">
        <div className="tf-code-corner tf-code-left">VAR 3M</div>
        <div style={{ marginTop: 28 }} className="tf-meta-form-grid">
          <div className="tf-meta-field">
            <span className="tf-meta-label">Municipality:</span>
            <input
              type="text"
              className="tf-meta-input-line"
              value={meta.municipality}
              onChange={(e) => setMeta({ ...meta, municipality: e.target.value })}
              placeholder=""
            />
          </div>

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

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 8 }} className="tf-actions">
        <button type="button" className="tf-btn tf-btn-secondary" onClick={handleAddAttraction}>
          <Plus size={14} /> Add Attraction Column
        </button>
        <button type="button" className="tf-btn tf-btn-secondary" onClick={handleReset}>
          <RotateCcw size={14} /> Clear Form
        </button>
      </div>

      {/* Table Structure */}
      <div className="tf-table-wrap">
        <table className="tf-table">
          <thead>
            <tr>
              <th rowSpan={2} className="tf-th-yellow" style={{ width: 100 }}>Month</th>
              {attractions.map((attr) => (
                <th key={attr.id} colSpan={3} className="tf-th-yellow">
                  {attr.name} – ({attr.code})
                </th>
              ))}
              <th colSpan={3} className="tf-th-yellow">
                Grand Total Visitors
              </th>
            </tr>
            <tr>
              {attractions.map((attr) => (
                <React.Fragment key={attr.id}>
                  <th className="tf-th-sub" style={{ width: 44 }}>Domestic</th>
                  <th className="tf-th-sub" style={{ width: 44 }}>Foreign</th>
                  <th className="tf-th-sub" style={{ width: 48 }}>Total</th>
                </React.Fragment>
              ))}
              <th className="tf-th-sub" style={{ width: 48 }}>Domestic</th>
              <th className="tf-th-sub" style={{ width: 48 }}>Foreign</th>
              <th className="tf-th-sub" style={{ width: 52 }}>Total</th>
            </tr>
          </thead>

          <tbody>
            {MONTH_NAMES.map((month, mIdx) => {
              const monthData = dataStore[mIdx] || {};

              let grandRowDom = 0;
              let grandRowFor = 0;
              let hasAnyVal = false;

              return (
                <tr key={month}>
                  <td style={{ fontWeight: 600 }}>{month}</td>
                  {attractions.map((attr) => {
                    const cell = monthData[attr.id] || {};
                    const dom = Number(cell.domestic) || 0;
                    const fo = Number(cell.foreign) || 0;
                    const hasCell = cell.domestic !== undefined && cell.domestic !== '' ||
                                    cell.foreign !== undefined && cell.foreign !== '';
                    if (hasCell) hasAnyVal = true;
                    grandRowDom += dom;
                    grandRowFor += fo;
                    const tot = hasCell ? dom + fo : '';

                    return (
                      <React.Fragment key={attr.id}>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="tf-cell-input"
                            value={cell.domestic ?? ''}
                            onChange={(e) => handleCellChange(mIdx, attr.id, 'domestic', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="tf-cell-input"
                            value={cell.foreign ?? ''}
                            onChange={(e) => handleCellChange(mIdx, attr.id, 'foreign', e.target.value)}
                          />
                        </td>
                        <td className="tf-cell-total">{tot !== '' ? tot : ''}</td>
                      </React.Fragment>
                    );
                  })}

                  {/* Grand Total Visitors row */}
                  <td className="tf-cell-grand">{hasAnyVal ? grandRowDom : ''}</td>
                  <td className="tf-cell-grand">{hasAnyVal ? grandRowFor : ''}</td>
                  <td className="tf-cell-grand" style={{ fontWeight: 800 }}>
                    {hasAnyVal ? grandRowDom + grandRowFor : ''}
                  </td>
                </tr>
              );
            })}

            {/* Total Row */}
            <tr className="tf-row-green">
              <td style={{ textAlign: 'right', paddingRight: 8 }}>Total:</td>
              {attractions.map((attr) => {
                let colDom = 0, colFor = 0;
                Object.values(dataStore).forEach((m) => {
                  const c = m[attr.id] || {};
                  colDom += Number(c.domestic) || 0;
                  colFor += Number(c.foreign) || 0;
                });
                return (
                  <React.Fragment key={attr.id}>
                    <td>{colDom || 0}</td>
                    <td>{colFor || 0}</td>
                    <td>{colDom + colFor || 0}</td>
                  </React.Fragment>
                );
              })}
              {/* Grand Total Summary */}
              {(() => {
                let allDom = 0, allFor = 0;
                Object.values(dataStore).forEach((m) => {
                  attractions.forEach((a) => {
                    const c = m[a.id] || {};
                    allDom += Number(c.domestic) || 0;
                    allFor += Number(c.foreign) || 0;
                  });
                });
                return (
                  <>
                    <td>{allDom || 0}</td>
                    <td>{allFor || 0}</td>
                    <td>{allDom + allFor || 0}</td>
                  </>
                );
              })()}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==========================================================================
   5. PROVINCIAL ANNUAL REPORT: Same Day Visitors by Municipality
   Matches Image 8 (Nueva Vizcaya Official Provincial Submission Sheet)
   Blank form initialized without pre-filled data numbers
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
    'A. CASTAÑEDA',
    'BAGABAG',
    'BAYOMBONG',
    'DIADI',
    'KASIBU',
    'QUEZON',
    'SOLANO',
    'STA FE'
  ], []);

  // Data: { [monthIdx]: { [muni]: { d: '', f: '' } } }
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

  const handleReset = () => {
    setMeta({
      province: 'NUEVA VIZCAYA',
      period: '',
      preparedByName: '',
      preparedByTitle: 'Tourism Operations Assistant',
      notedByName: '',
      notedByTitle: 'Sup. Tourism Operations Officer'
    });
    setDataStore({});
    onNotify('Provincial LGU Form cleared to blank.');
  };

  return (
    <div className="tf-paper-sheet">
      <div className="tf-page-watermark">Page 1</div>

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
        <button type="button" className="tf-btn tf-btn-secondary" onClick={handleReset}>
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
                Object.values(dataStore).forEach((m) => {
                  const c = m[muni] || {};
                  colD += Number(c.d) || 0;
                  colF += Number(c.f) || 0;
                });
                return (
                  <React.Fragment key={muni}>
                    <td>{colD || 0}</td>
                    <td>{colF || 0}</td>
                    <td>{colD + colF || 0}</td>
                  </React.Fragment>
                );
              })}

              {/* Grand Total Summary */}
              {(() => {
                let allD = 0, allF = 0;
                Object.values(dataStore).forEach((m) => {
                  municipalities.forEach((muni) => {
                    const c = m[muni] || {};
                    allD += Number(c.d) || 0;
                    allF += Number(c.f) || 0;
                  });
                });
                return (
                  <>
                    <td>{allD || 0}</td>
                    <td>{allF || 0}</td>
                    <td style={{ backgroundColor: '#ffff00', color: '#000000', fontWeight: 900 }}>
                      {allD + allF || 0}
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

/* ==========================================================================
   6. VAR 3R: Annual Report on Same Day Visitors by LGU (Regional)
   Matches Image 9
   ========================================================================== */
function VAR3RForm({ onNotify }) {
  const [meta, setMeta] = useState({
    region: '',
    period: ''
  });

  const [lgus, setLgus] = useState([
    { id: 1, name: 'City 1' },
    { id: 2, name: 'Province 1' },
    { id: 3, name: 'Province 2' },
    { id: 4, name: 'Province N' },
  ]);

  const [dataStore, setDataStore] = useState({});

  const handleCellChange = (monthIdx, lguId, field, val) => {
    setDataStore((prev) => {
      const monthData = prev[monthIdx] || {};
      const lguData = monthData[lguId] || {};
      return {
        ...prev,
        [monthIdx]: {
          ...monthData,
          [lguId]: {
            ...lguData,
            [field]: val
          }
        }
      };
    });
  };

  const handleAddLgu = () => {
    const nextId = lgus.length + 1;
    setLgus([...lgus, { id: nextId, name: `Province ${nextId}` }]);
  };

  const handleReset = () => {
    setMeta({ region: '', period: '' });
    setDataStore({});
    onNotify('VAR 3R Form cleared to blank.');
  };

  return (
    <div className="tf-paper-sheet">
      <div className="tf-page-watermark">VAR 3R</div>

      {/* Header Fields matching Image 9 */}
      <div className="tf-sheet-header">
        <div className="tf-code-corner tf-code-left">VAR 3R</div>
        <h2 className="tf-sheet-title" style={{ marginTop: 20 }}>Annual Report on Same Day Visitors by LGU</h2>

        <div className="tf-meta-form-grid" style={{ maxWidth: 420, marginTop: 12 }}>
          <div className="tf-meta-field">
            <span className="tf-meta-label">Region:</span>
            <input
              type="text"
              className="tf-meta-input-line"
              value={meta.region}
              onChange={(e) => setMeta({ ...meta, region: e.target.value })}
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

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 8 }} className="tf-actions">
        <button type="button" className="tf-btn tf-btn-secondary" onClick={handleAddLgu}>
          <Plus size={14} /> Add LGU Column
        </button>
        <button type="button" className="tf-btn tf-btn-secondary" onClick={handleReset}>
          <RotateCcw size={14} /> Clear Form
        </button>
      </div>

      {/* Table Structure */}
      <div className="tf-table-wrap">
        <table className="tf-table">
          <thead>
            <tr>
              <th rowSpan={2} className="tf-th-yellow" style={{ width: 100 }}>Month</th>
              {lgus.map((l) => (
                <th key={l.id} colSpan={3} className="tf-th-yellow">
                  {l.name}
                </th>
              ))}
              <th colSpan={3} className="tf-th-yellow">
                Grand Total Visitors
              </th>
            </tr>
            <tr>
              {lgus.map((l) => (
                <React.Fragment key={l.id}>
                  <th className="tf-th-sub" style={{ width: 44 }}>Domestic</th>
                  <th className="tf-th-sub" style={{ width: 44 }}>Foreign</th>
                  <th className="tf-th-sub" style={{ width: 48 }}>Total</th>
                </React.Fragment>
              ))}
              <th className="tf-th-sub" style={{ width: 48 }}>Domestic</th>
              <th className="tf-th-sub" style={{ width: 48 }}>Foreign</th>
              <th className="tf-th-sub" style={{ width: 52 }}>Total</th>
            </tr>
          </thead>

          <tbody>
            {MONTH_NAMES.map((month, mIdx) => {
              const monthData = dataStore[mIdx] || {};

              let grandRowDom = 0;
              let grandRowFor = 0;
              let hasAnyVal = false;

              return (
                <tr key={month}>
                  <td style={{ fontWeight: 600 }}>{month}</td>
                  {lgus.map((l) => {
                    const cell = monthData[l.id] || {};
                    const dom = Number(cell.domestic) || 0;
                    const fo = Number(cell.foreign) || 0;
                    const hasCell = cell.domestic !== undefined && cell.domestic !== '' ||
                                    cell.foreign !== undefined && cell.foreign !== '';
                    if (hasCell) hasAnyVal = true;
                    grandRowDom += dom;
                    grandRowFor += fo;
                    const tot = hasCell ? dom + fo : '';

                    return (
                      <React.Fragment key={l.id}>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="tf-cell-input"
                            value={cell.domestic ?? ''}
                            onChange={(e) => handleCellChange(mIdx, l.id, 'domestic', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="tf-cell-input"
                            value={cell.foreign ?? ''}
                            onChange={(e) => handleCellChange(mIdx, l.id, 'foreign', e.target.value)}
                          />
                        </td>
                        <td className="tf-cell-total">{tot !== '' ? tot : ''}</td>
                      </React.Fragment>
                    );
                  })}

                  {/* Grand Total Visitors row */}
                  <td className="tf-cell-grand">{hasAnyVal ? grandRowDom : ''}</td>
                  <td className="tf-cell-grand">{hasAnyVal ? grandRowFor : ''}</td>
                  <td className="tf-cell-grand" style={{ fontWeight: 800 }}>
                    {hasAnyVal ? grandRowDom + grandRowFor : ''}
                  </td>
                </tr>
              );
            })}

            {/* Total Row */}
            <tr className="tf-row-green">
              <td style={{ textAlign: 'right', paddingRight: 8 }}>Total:</td>
              {lgus.map((l) => {
                let colDom = 0, colFor = 0;
                Object.values(dataStore).forEach((m) => {
                  const c = m[l.id] || {};
                  colDom += Number(c.domestic) || 0;
                  colFor += Number(c.foreign) || 0;
                });
                return (
                  <React.Fragment key={l.id}>
                    <td>{colDom || 0}</td>
                    <td>{colFor || 0}</td>
                    <td>{colDom + colFor || 0}</td>
                  </React.Fragment>
                );
              })}

              {/* Grand Total Summary */}
              {(() => {
                let allDom = 0, allFor = 0;
                Object.values(dataStore).forEach((m) => {
                  lgus.forEach((l) => {
                    const c = m[l.id] || {};
                    allDom += Number(c.domestic) || 0;
                    allFor += Number(c.foreign) || 0;
                  });
                });
                return (
                  <>
                    <td>{allDom || 0}</td>
                    <td>{allFor || 0}</td>
                    <td>{allDom + allFor || 0}</td>
                  </>
                );
              })()}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
