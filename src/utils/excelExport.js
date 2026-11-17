import * as XLSX from 'xlsx';

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

/**
 * Builds the official DOT Monthly & Yearly Visitor Arrivals Per Attraction Worksheet.
 */
export function buildMonthlyYearlyWorksheet({
  municipalGroups = [],
  codes = {},
  computedData = {},
  meta = {}
}) {
  const aoa = [
    ['DEPARTMENT OF TOURISM (DOT) REGION II - PROVINCE OF NUEVA VIZCAYA'],
    ['MONTHLY VISITOR ARRIVALS PER ATTRACTION (JANUARY - DECEMBER) AND YEARLY TOTAL'],
    [`Province: NUEVA VIZCAYA | Calendar Year: 2026 | Prepared By: ${meta.preparedBy || 'Provincial Tourism Officer'} | Generated: ${new Date().toLocaleString()}`],
    []
  ];

  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 15 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 15 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 15 } },
    // Col headers row 4-7
    { s: { r: 4, c: 0 }, e: { r: 7, c: 0 } }, // Municipality
    { s: { r: 4, c: 1 }, e: { r: 7, c: 1 } }, // Attraction Name
    { s: { r: 4, c: 2 }, e: { r: 7, c: 2 } }, // Attraction Code
    { s: { r: 4, c: 3 }, e: { r: 7, c: 3 } }, // Category
  ];

  // Row 4: Month blocks
  const row4 = ['Municipality', 'Name of Attraction / Facility', 'Attraction Code', 'Category'];
  const row5 = ['', '', '', ''];
  const row6 = ['', '', '', ''];
  const row7 = ['', '', '', ''];

  let colPointer = 4;

  MONTH_NAMES.forEach((mName) => {
    // Row 4: Month Name (colSpan 12)
    row4.push(`${mName} - Place of Residence`, '', '', '', '', '', '', '', '', '', '', '');
    merges.push({ s: { r: 4, c: colPointer }, e: { r: 4, c: colPointer + 11 } });

    // Row 5: Residence Groupings (Philippines 6, Foreign 3, Grand Total 3)
    row5.push('Philippines', '', '', '', '', '', 'Foreign Country Residents', '', '', 'Grand Total Number of Visitors', '', '');
    merges.push({ s: { r: 5, c: colPointer }, e: { r: 5, c: colPointer + 5 } });
    merges.push({ s: { r: 5, c: colPointer + 6 }, e: { r: 5, c: colPointer + 8 } });
    merges.push({ s: { r: 5, c: colPointer + 9 }, e: { r: 5, c: colPointer + 11 } });

    // Row 6: Province Breakdowns
    row6.push('This Province', '', '', 'Other Province', '', '', 'Foreign Residents', '', '', 'Grand Total Visitors', '', '');
    merges.push({ s: { r: 6, c: colPointer }, e: { r: 6, c: colPointer + 2 } });
    merges.push({ s: { r: 6, c: colPointer + 3 }, e: { r: 6, c: colPointer + 5 } });
    merges.push({ s: { r: 6, c: colPointer + 6 }, e: { r: 6, c: colPointer + 8 } });
    merges.push({ s: { r: 6, c: colPointer + 9 }, e: { r: 6, c: colPointer + 11 } });

    // Row 7: M / F / Total
    row7.push(
      'Male', 'Female', 'Total',
      'Male', 'Female', 'Total',
      'Male', 'Female', 'Total',
      'Male', 'Female', 'Total'
    );

    colPointer += 12;
  });

  // Yearly Total Block
  row4.push('YEARLY TOTAL', '', '', '', '', '', '', '', '', '', '', '');
  merges.push({ s: { r: 4, c: colPointer }, e: { r: 4, c: colPointer + 11 } });

  row5.push('Philippines', '', '', '', '', '', 'Foreign Country Residents', '', '', 'Grand Total Number of Visitors', '', '');
  merges.push({ s: { r: 5, c: colPointer }, e: { r: 5, c: colPointer + 5 } });
  merges.push({ s: { r: 5, c: colPointer + 6 }, e: { r: 5, c: colPointer + 8 } });
  merges.push({ s: { r: 5, c: colPointer + 9 }, e: { r: 5, c: colPointer + 11 } });

  row6.push('This Province', '', '', 'Other Province', '', '', 'Foreign Residents', '', '', 'Grand Total Visitors', '', '');
  merges.push({ s: { r: 6, c: colPointer }, e: { r: 6, c: colPointer + 2 } });
  merges.push({ s: { r: 6, c: colPointer + 3 }, e: { r: 6, c: colPointer + 5 } });
  merges.push({ s: { r: 6, c: colPointer + 6 }, e: { r: 6, c: colPointer + 8 } });
  merges.push({ s: { r: 6, c: colPointer + 9 }, e: { r: 6, c: colPointer + 11 } });

  row7.push(
    'Male', 'Female', 'Total',
    'Male', 'Female', 'Total',
    'Male', 'Female', 'Total',
    'Male', 'Female', 'Total'
  );

  aoa.push(row4, row5, row6, row7);

  // Fill in Data Rows per Municipality
  const attractionCalcs = computedData.attractionCalcs || {};
  const muniCalcs = computedData.muniCalcs || {};
  const provCalcs = computedData.provCalcs || {};

  municipalGroups.forEach((group) => {
    // If no attractions, show at least a placeholder row
    if (group.attractions.length === 0) {
      const emptyRow = [group.municipality, '(No recorded attractions yet)', '', ''];
      for (let i = 0; i < 156; i++) emptyRow.push(0);
      aoa.push(emptyRow);
    } else {
      group.attractions.forEach((attr) => {
        const rowKey = `${group.municipality}__${attr.name}`;
        const code = codes[rowKey] || attr.defaultCode || '';
        const calcs = attractionCalcs[rowKey] || {};
        const rowData = [group.municipality, attr.name, code, attr.category || 'Accommodation'];

        // 12 months data
        for (let m = 0; m < 12; m++) {
          const c = calcs[m] || { tpM: 0, tpF: 0, tpTot: 0, opM: 0, opF: 0, opTot: 0, fM: 0, fF: 0, fTot: 0, gM: 0, gF: 0, gTot: 0 };
          rowData.push(
            c.tpM || 0, c.tpF || 0, c.tpTot || 0,
            c.opM || 0, c.opF || 0, c.opTot || 0,
            c.fM || 0, c.fF || 0, c.fTot || 0,
            c.gM || 0, c.gF || 0, c.gTot || 0
          );
        }

        // Yearly total
        const y = calcs.yearly || { tpM: 0, tpF: 0, tpTot: 0, opM: 0, opF: 0, opTot: 0, fM: 0, fF: 0, fTot: 0, gM: 0, gF: 0, gTot: 0 };
        rowData.push(
          y.tpM || 0, y.tpF || 0, y.tpTot || 0,
          y.opM || 0, y.opF || 0, y.opTot || 0,
          y.fM || 0, y.fF || 0, y.fTot || 0,
          y.gM || 0, y.gF || 0, y.gTot || 0
        );

        aoa.push(rowData);
      });
    }

    // Municipality Subtotal Row
    const mc = muniCalcs[group.municipality] || {};
    const subtotalRow = [`TOTAL ${group.municipality}`, '', '', 'Subtotal'];
    for (let m = 0; m < 12; m++) {
      const c = mc[m] || { tpM: 0, tpF: 0, tpTot: 0, opM: 0, opF: 0, opTot: 0, fM: 0, fF: 0, fTot: 0, gM: 0, gF: 0, gTot: 0 };
      subtotalRow.push(
        c.tpM || 0, c.tpF || 0, c.tpTot || 0,
        c.opM || 0, c.opF || 0, c.opTot || 0,
        c.fM || 0, c.fF || 0, c.fTot || 0,
        c.gM || 0, c.gF || 0, c.gTot || 0
      );
    }
    const my = mc.yearly || { tpM: 0, tpF: 0, tpTot: 0, opM: 0, opF: 0, opTot: 0, fM: 0, fF: 0, fTot: 0, gM: 0, gF: 0, gTot: 0 };
    subtotalRow.push(
      my.tpM || 0, my.tpF || 0, my.tpTot || 0,
      my.opM || 0, my.opF || 0, my.opTot || 0,
      my.fM || 0, my.fF || 0, my.fTot || 0,
      my.gM || 0, my.gF || 0, my.gTot || 0
    );
    aoa.push(subtotalRow);
  });

  // Grand Provincial Total Row
  const grandRow = ['PROVINCIAL GRAND TOTAL', '', '', 'Grand Total'];
  for (let m = 0; m < 12; m++) {
    const c = provCalcs[m] || { tpM: 0, tpF: 0, tpTot: 0, opM: 0, opF: 0, opTot: 0, fM: 0, fF: 0, fTot: 0, gM: 0, gF: 0, gTot: 0 };
    grandRow.push(
      c.tpM || 0, c.tpF || 0, c.tpTot || 0,
      c.opM || 0, c.opF || 0, c.opTot || 0,
      c.fM || 0, c.fF || 0, c.fTot || 0,
      c.gM || 0, c.gF || 0, c.gTot || 0
    );
  }
  const py = provCalcs.yearly || { tpM: 0, tpF: 0, tpTot: 0, opM: 0, opF: 0, opTot: 0, fM: 0, fF: 0, fTot: 0, gM: 0, gF: 0, gTot: 0 };
  grandRow.push(
    py.tpM || 0, py.tpF || 0, py.tpTot || 0,
    py.opM || 0, py.opF || 0, py.opTot || 0,
    py.fM || 0, py.fF || 0, py.fTot || 0,
    py.gM || 0, py.gF || 0, py.gTot || 0
  );
  aoa.push(grandRow);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges'] = merges;

  // Set column widths
  const colWidths = [{ wch: 20 }, { wch: 32 }, { wch: 15 }, { wch: 18 }];
  for (let i = 4; i < 160; i++) {
    colWidths.push({ wch: 10 });
  }
  ws['!cols'] = colWidths;

  return ws;
}

/**
 * Builds the official Same Day Visitors by Municipality Worksheet.
 */
export function buildProvincialLGUWorksheet({
  municipalities = [],
  dataStore = {},
  meta = {}
}) {
  const aoa = [
    ['DEPARTMENT OF TOURISM (DOT) REGION II - PROVINCE OF NUEVA VIZCAYA'],
    ['SAME DAY VISITORS BY MUNICIPALITY (JANUARY - DECEMBER 2026)'],
    [`Province: ${meta.province || 'NUEVA VIZCAYA'} | Period: ${meta.period || 'Calendar Year 2026'} | Prepared By: ${meta.preparedByName || 'Tourism Operations Assistant'}`],
    []
  ];

  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 10 } },
    { s: { r: 4, c: 0 }, e: { r: 5, c: 0 } }, // Month header
  ];

  const row4 = ['Month'];
  const row5 = [''];

  let colPointer = 1;
  municipalities.forEach((muni) => {
    row4.push(muni, '', '');
    merges.push({ s: { r: 4, c: colPointer }, e: { r: 4, c: colPointer + 2 } });
    row5.push('Domestic', 'Foreign', 'Total');
    colPointer += 3;
  });

  row4.push('Grand Total Visitors', '', '');
  merges.push({ s: { r: 4, c: colPointer }, e: { r: 4, c: colPointer + 2 } });
  row5.push('Domestic', 'Foreign', 'Grand Total');

  aoa.push(row4, row5);

  const yearlyTotals = {
    munis: {},
    overallD: 0,
    overallF: 0,
    overallTot: 0,
  };
  municipalities.forEach((m) => { yearlyTotals.munis[m] = { d: 0, f: 0, tot: 0 }; });

  MONTH_NAMES.forEach((mName, mIdx) => {
    const row = [mName];
    let monthGrandD = 0;
    let monthGrandF = 0;

    municipalities.forEach((muni) => {
      const cell = dataStore[mIdx]?.[muni] || { d: 0, f: 0 };
      const d = Number(cell.d) || 0;
      const f = Number(cell.f) || 0;
      const tot = d + f;
      row.push(d, f, tot);

      monthGrandD += d;
      monthGrandF += f;

      yearlyTotals.munis[muni].d += d;
      yearlyTotals.munis[muni].f += f;
      yearlyTotals.munis[muni].tot += tot;
    });

    const monthGrandTot = monthGrandD + monthGrandF;
    row.push(monthGrandD, monthGrandF, monthGrandTot);
    aoa.push(row);

    yearlyTotals.overallD += monthGrandD;
    yearlyTotals.overallF += monthGrandF;
    yearlyTotals.overallTot += monthGrandTot;
  });

  // Total Year Row
  const totalRow = ['TOTAL 2026'];
  municipalities.forEach((muni) => {
    const ym = yearlyTotals.munis[muni];
    totalRow.push(ym.d, ym.f, ym.tot);
  });
  totalRow.push(yearlyTotals.overallD, yearlyTotals.overallF, yearlyTotals.overallTot);
  aoa.push(totalRow);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges'] = merges;

  const colWidths = [{ wch: 16 }];
  for (let i = 1; i < colPointer + 3; i++) {
    colWidths.push({ wch: 12 });
  }
  ws['!cols'] = colWidths;

  return ws;
}

/**
 * Builds the Municipal Submissions & Forms Log Worksheet.
 */
export function buildMuniSubmissionsWorksheet(submissions = []) {
  const aoa = [
    ['DEPARTMENT OF TOURISM (DOT) REGION II - PROVINCE OF NUEVA VIZCAYA'],
    ['OFFICIAL MUNICIPAL SUBMISSIONS & FORMS TRANSMISSION LOG'],
    [`Total Registered Transmissions: ${submissions.length} | Generated: ${new Date().toLocaleString()}`],
    [],
    [
      'No.',
      'Form Type',
      'Municipality',
      'Establishment / Title',
      'Reporting Period',
      'Total Visitors',
      'Compliance Status',
      'Submitted By',
      'Date / Time Transmitted'
    ]
  ];

  submissions.forEach((sub, idx) => {
    aoa.push([
      idx + 1,
      sub.formType || 'VAR 2',
      sub.municipality || 'Bayombong',
      sub.title || sub.name || 'Municipal Filing',
      sub.reportingPeriod || sub.monthYear || '2026',
      Number(sub.visitors) || 0,
      sub.status || 'Submitted to Province',
      sub.submittedBy || 'Municipal Tourism Office',
      sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : ''
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
  ];

  ws['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 18 },
    { wch: 32 },
    { wch: 18 },
    { wch: 14 },
    { wch: 22 },
    { wch: 28 },
    { wch: 22 },
  ];

  return ws;
}

/**
 * Export Master DOT Provincial Workbook (.xlsx)
 * Rearranges sheets so the active tab's sheet is presented first.
 */
export function exportMasterDOTWorkbook({
  activeTab = 'MONTHLY_YEARLY',
  monthlyYearlyData = null,
  provincialLGUData = null,
  muniSubmissionsData = null,
  filename = null,
}) {
  const wb = XLSX.utils.book_new();

  // Create worksheets
  const ws1 = monthlyYearlyData ? buildMonthlyYearlyWorksheet(monthlyYearlyData) : null;
  const ws2 = provincialLGUData ? buildProvincialLGUWorksheet(provincialLGUData) : null;
  const ws3 = muniSubmissionsData ? buildMuniSubmissionsWorksheet(muniSubmissionsData) : null;

  // Append sheets based on active tab priority
  if (activeTab === 'PROVINCIAL_LGU') {
    if (ws2) XLSX.utils.book_append_sheet(wb, ws2, 'Visitors by Municipality');
    if (ws1) XLSX.utils.book_append_sheet(wb, ws1, 'Attractions Arrivals (Jan-Dec)');
    if (ws3) XLSX.utils.book_append_sheet(wb, ws3, 'Municipal Submissions Log');
  } else if (activeTab === 'MUNI_SUBMISSIONS') {
    if (ws3) XLSX.utils.book_append_sheet(wb, ws3, 'Municipal Submissions Log');
    if (ws1) XLSX.utils.book_append_sheet(wb, ws1, 'Attractions Arrivals (Jan-Dec)');
    if (ws2) XLSX.utils.book_append_sheet(wb, ws2, 'Visitors by Municipality');
  } else {
    // Default: MONTHLY_YEARLY
    if (ws1) XLSX.utils.book_append_sheet(wb, ws1, 'Attractions Arrivals (Jan-Dec)');
    if (ws2) XLSX.utils.book_append_sheet(wb, ws2, 'Visitors by Municipality');
    if (ws3) XLSX.utils.book_append_sheet(wb, ws3, 'Municipal Submissions Log');
  }

  const defaultName = activeTab === 'PROVINCIAL_LGU'
    ? 'DOT_Provincial_Same_Day_Visitors_by_Municipality_2026.xlsx'
    : activeTab === 'MUNI_SUBMISSIONS'
      ? 'DOT_Provincial_Municipal_Submissions_Log_2026.xlsx'
      : 'DOT_Provincial_Monthly_Yearly_Attraction_Arrivals_2026.xlsx';

  XLSX.writeFile(wb, filename || defaultName);
}

/**
 * Export Individual Form Submission (e.g. from View Form Sheet modal)
 */
export function exportSingleFormSubmissionExcel(item) {
  if (!item) return;
  const wb = XLSX.utils.book_new();
  const fType = String(item.formType || item.formData?.formType || item.title || 'Official Form').toUpperCase();
  const muni = item.municipality || 'Bayombong';
  const period = item.reportingPeriod || item.monthYear || '2026';
  const title = item.title || fType;

  const rows = item.rows || item.formData?.rows || [];
  const totals = item.totals || item.formData?.totals || {};

  if (rows.length > 0 || fType.includes('VAR 2') || fType.includes('ATTRACTION')) {
    const aoa = [
      ['DEPARTMENT OF TOURISM (DOT) REGION II - OFFICIAL LGU FILING'],
      [`TOURISM ATTRACTION VISITOR RECORD (VAR 2) — MUNICIPALITY OF ${muni.toUpperCase()}`],
      [`Reporting Period: ${period} | Status: ${item.status || 'Submitted to Province'} | Submitted By: ${item.submittedBy || 'Municipal Tourism Office'}`],
      [],
      [
        'Visitor Attraction Name', 'Code', 'Category', 'Type',
        'This Muni (M)', 'This Muni (F)', 'This Muni (Total)',
        'This Prov (M)', 'This Prov (F)', 'This Prov (Total)',
        'Other Prov (M)', 'Other Prov (F)', 'Other Prov (Total)',
        'Foreign (M)', 'Foreign (F)', 'Foreign (Total)',
        'Grand Total (M)', 'Grand Total (F)', 'Grand Total Visitors'
      ]
    ];

    rows.forEach((r) => {
      aoa.push([
        r.name || r.establishmentName || '',
        r.code || '',
        r.category || '',
        r.type || '',
        Number(r.thisMuniMale) || 0, Number(r.thisMuniFemale) || 0, Number(r.thisMuniTotal) || 0,
        Number(r.thisProvMale) || 0, Number(r.thisProvFemale) || 0, Number(r.thisProvTotal) || 0,
        Number(r.otherProvMale) || 0, Number(r.otherProvFemale) || 0, Number(r.otherProvTotal) || 0,
        Number(r.foreignMale) || 0, Number(r.foreignFemale) || 0, Number(r.foreignTotal) || 0,
        Number(r.grandMale) || 0, Number(r.grandFemale) || 0, Number(r.grandTotal) || 0
      ]);
    });

    aoa.push([
      'TOTAL OF THIS MONTH ****', '', '', 'Total Summary',
      Number(totals.thisMuniMale) || 0, Number(totals.thisMuniFemale) || 0, Number(totals.thisMuniTotal) || 0,
      Number(totals.thisProvMale) || 0, Number(totals.thisProvFemale) || 0, Number(totals.thisProvTotal) || 0,
      Number(totals.otherProvMale) || 0, Number(totals.otherProvFemale) || 0, Number(totals.otherProvTotal) || 0,
      Number(totals.foreignMale) || 0, Number(totals.foreignFemale) || 0, Number(totals.foreignTotal) || 0,
      Number(totals.grandMale) || 0, Number(totals.grandFemale) || 0, Number(totals.grandTotal) || 0
    ]);

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 10 } },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'VAR 2 Record');
  } else {
    // Standard DOT/DAE Form Submission Sheet
    const aoa = [
      ['DEPARTMENT OF TOURISM (DOT) REGION II - OFFICIAL LGU FILING'],
      [`${title} — MUNICIPALITY OF ${muni.toUpperCase()}`],
      [`Reporting Period: ${period} | Status: ${item.status || 'Submitted to Province'} | Submitted By: ${item.submittedBy || 'Municipal Officer'}`],
      [],
      ['Metric / Field Indicator', 'Official Recorded Value'],
      ['Form Type', item.formType || fType],
      ['Municipality', muni],
      ['Province', 'NUEVA VIZCAYA'],
      ['Reporting Period', period],
      ['Total Recorded Visitors', Number(item.visitors) || 0],
      ['Compliance Status', item.status || 'Submitted to Province'],
      ['Submitted By', item.submittedBy || 'Municipal Tourism Office'],
      ['Date & Time Submitted', item.submittedAt ? new Date(item.submittedAt).toLocaleString() : '']
    ];

    if (item.formData && typeof item.formData === 'object') {
      aoa.push([], ['--- DETAILED FORM RECORD FIELDS ---', '']);
      Object.entries(item.formData).forEach(([k, v]) => {
        if (v !== null && typeof v !== 'object') {
          aoa.push([k, String(v)]);
        }
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
    ];
    ws['!cols'] = [{ wch: 32 }, { wch: 45 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Form Record');
  }

  const safeFilename = `${fType}_${muni}_${period}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `${safeFilename}.xlsx`);
}
