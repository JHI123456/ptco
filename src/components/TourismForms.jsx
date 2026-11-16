import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import './TourismForms.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function TourismForms({ user }) {
  const [activeFormTab, setActiveFormTab] = useState('VAR2');
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
              Standard blank government filing forms for Provincial Tourism Attraction Visitor Recording (VAR 2 / VAR 2P) and Provincial Municipal Reporting.
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

        {/* Tab Selection: Only Official Provincial Forms */}
        <div className="tf-tabs-wrapper">
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

      {/* Render the Active Official Provincial Form - 100% Clean and Blank */}
      {activeFormTab === 'VAR2' && <VAR2Form onNotify={showToast} />}
      {activeFormTab === 'PROVINCIAL_LGU' && <ProvincialLGUForm onNotify={showToast} />}
    </div>
  );
}

/* ==========================================================================
   1. VAR 2 / VAR 2P: Tourism Attraction Visitor Record (Monthly Consolidation)
   Matches Images 4, 5, 7
   100% Clean Blank Form - NO hardcoded numbers
   ========================================================================== */
function VAR2Form({ onNotify }) {
  const [meta, setMeta] = useState({
    monthYear: '',
    municipality: 'NUEVA VIZCAYA',
    preparedBy: '',
    notedBy: ''
  });

  // Standard Nueva Vizcaya Municipalities and Attraction spots
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
      municipality: 'ARITAO',
      attractions: [
        { name: 'Aritao Ecotourism Park', code: '' }
      ]
    },
    {
      municipality: 'BAGABAG',
      attractions: [
        { name: "Reginaldo's Farm", code: '' }
      ]
    },
    {
      municipality: 'BAMBANG',
      attractions: [
        { name: 'Salinas Salt Springs & Natural Monument', code: '' }
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
      municipality: 'VILLAVERDE',
      attractions: [
        { name: 'Villaverde Watershed Park', code: '' }
      ]
    },
    {
      municipality: 'OTHERS / FESTIVALS',
      attractions: [
        { name: 'Grand Ammungan Festival', code: '' }
      ]
    }
  ], []);

  // 100% Clean Blank State: NO DATA
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

  const handleClearAllData = () => {
    setMeta({ monthYear: '', municipality: 'NUEVA VIZCAYA', preparedBy: '', notedBy: '' });
    setDataStore({});
    try {
      localStorage.removeItem('turismotrack_visitor_dataset');
    } catch {}
    onNotify('Naalis na po ang lahat ng data. 100% blangko ang form.');
  };

  // Grand summary calculation across all municipalities
  const grandTotals = useMemo(() => {
    let tpM = 0, tpF = 0;
    let opM = 0, opF = 0;
    let fM = 0, fF = 0;
    let hasAnyData = false;

    Object.values(dataStore).forEach((val) => {
      const thisTpM = Number(val?.thisProvMale) || 0;
      const thisTpF = Number(val?.thisProvFemale) || 0;
      const thisOpM = Number(val?.otherProvMale) || 0;
      const thisOpF = Number(val?.otherProvFemale) || 0;
      const thisFM = Number(val?.foreignMale) || 0;
      const thisFF = Number(val?.foreignFemale) || 0;

      if (val?.thisProvMale || val?.thisProvFemale || val?.otherProvMale || val?.otherProvFemale || val?.foreignMale || val?.foreignFemale) {
        hasAnyData = true;
      }

      tpM += thisTpM;
      tpF += thisTpF;
      opM += thisOpM;
      opF += thisOpF;
      fM += thisFM;
      fF += thisFF;
    });

    const tpTot = tpM + tpF;
    const opTot = opM + opF;
    const fTot = fM + fF;
    const gM = tpM + opM + fM;
    const gF = tpF + opF + fF;
    const gTot = gM + gF;

    return {
      hasAnyData,
      tpM: hasAnyData ? tpM : '',
      tpF: hasAnyData ? tpF : '',
      tpTot: hasAnyData ? tpTot : '',
      opM: hasAnyData ? opM : '',
      opF: hasAnyData ? opF : '',
      opTot: hasAnyData ? opTot : '',
      fM: hasAnyData ? fM : '',
      fF: hasAnyData ? fF : '',
      fTot: hasAnyData ? fTot : '',
      gM: hasAnyData ? gM : '',
      gF: hasAnyData ? gF : '',
      gTot: hasAnyData ? gTot : ''
    };
  }, [dataStore]);

  return (
    <div className="tf-paper-sheet">
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
        <button type="button" className="tf-btn tf-btn-secondary" onClick={handleClearAllData}>
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
              let groupHasData = false;

              group.attractions.forEach((_, aIdx) => {
                const k = `${group.municipality}_${aIdx}`;
                const row = dataStore[k] || {};
                const rTpM = Number(row.thisProvMale) || 0;
                const rTpF = Number(row.thisProvFemale) || 0;
                const rOpM = Number(row.otherProvMale) || 0;
                const rOpF = Number(row.otherProvFemale) || 0;
                const rFM = Number(row.foreignMale) || 0;
                const rFF = Number(row.foreignFemale) || 0;

                if (row.thisProvMale || row.thisProvFemale || row.otherProvMale || row.otherProvFemale || row.foreignMale || row.foreignFemale) {
                  groupHasData = true;
                }

                subTpM += rTpM;
                subTpF += rTpF;
                subOpM += rOpM;
                subOpF += rOpF;
                subFM += rFM;
                subFF += rFF;
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
                    <td className="tf-subtotal-cell">{groupHasData ? subTpM : ''}</td>
                    <td className="tf-subtotal-cell">{groupHasData ? subTpF : ''}</td>
                    <td className="tf-subtotal-cell">{groupHasData ? subTpTot : ''}</td>
                    <td className="tf-subtotal-cell">{groupHasData ? subOpM : ''}</td>
                    <td className="tf-subtotal-cell">{groupHasData ? subOpF : ''}</td>
                    <td className="tf-subtotal-cell">{groupHasData ? subOpTot : ''}</td>
                    <td className="tf-subtotal-cell">{groupHasData ? subFM : ''}</td>
                    <td className="tf-subtotal-cell">{groupHasData ? subFF : ''}</td>
                    <td className="tf-subtotal-cell">{groupHasData ? subFTot : ''}</td>
                    <td className="tf-subtotal-cell">{groupHasData ? subGrandM : ''}</td>
                    <td className="tf-subtotal-cell">{groupHasData ? subGrandF : ''}</td>
                    <td className="tf-subtotal-cell">{groupHasData ? subGrandTot : ''}</td>
                  </tr>
                </React.Fragment>
              );
            })}

            {/* Total of this Month **** Row (Authentic Green Row) */}
            <tr className="tf-row-green">
              <td colSpan={2} style={{ textAlign: 'left', paddingLeft: 10 }}>
                Total of this Month ****
              </td>
              <td>{grandTotals.tpM}</td>
              <td>{grandTotals.tpF}</td>
              <td>{grandTotals.tpTot}</td>
              <td>{grandTotals.opM}</td>
              <td>{grandTotals.opF}</td>
              <td>{grandTotals.opTot}</td>
              <td>{grandTotals.fM}</td>
              <td>{grandTotals.fF}</td>
              <td>{grandTotals.fTot}</td>
              <td>{grandTotals.gM}</td>
              <td>{grandTotals.gF}</td>
              <td>{grandTotals.gTot}</td>
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
    'A. CASTAÑEDA',
    'BAGABAG',
    'BAYOMBONG',
    'DIADI',
    'KASIBU',
    'QUEZON',
    'SOLANO',
    'STA FE'
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
