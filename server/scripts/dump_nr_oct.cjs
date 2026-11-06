const fs = require('fs');
const path = require('path');

const tempDir = path.join(process.env.TEMP || 'C:\\Users\\jhill\\AppData\\Local\\Temp', 'nr_oct_extracted', 'xl');

// Read sharedStrings
const sharedStringsXml = fs.readFileSync(path.join(tempDir, 'sharedStrings.xml'), 'utf8');
const strings = [];
const siRegex = /<si>([\s\S]*?)<\/si>/g;
let match;
while ((match = siRegex.exec(sharedStringsXml)) !== null) {
  const tMatches = [...match[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)];
  strings.push(tMatches.map(m => m[1]).join(''));
}

function parseSheet(sheetPath) {
  const sheetXml = fs.readFileSync(sheetPath, 'utf8');
  const rows = [];
  const rowRegex = /<row[^>]+r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  let rMatch;
  while ((rMatch = rowRegex.exec(sheetXml)) !== null) {
    const rowNum = parseInt(rMatch[1]);
    const rowContent = rMatch[2];
    const cells = {};
    const cRegex = /<c[^>]+r="([A-Z]+)(\d+)"(?:[^>]+t="([^"]+)")?[^>]*>([\s\S]*?)<\/c>/g;
    let cMatch;
    while ((cMatch = cRegex.exec(rowContent)) !== null) {
      const col = cMatch[1];
      const type = cMatch[3];
      const body = cMatch[4];
      let val = '';
      const vMatch = /<v>([\s\S]*?)<\/v>/.exec(body);
      if (vMatch) {
        val = vMatch[1];
        if (type === 's') {
          val = strings[parseInt(val)] || val;
        }
      }
      cells[col] = val;
    }
    rows.push({ rowNum, cells });
  }
  return rows;
}

// 1. Inspect Sheet 1: NR OCT (all rows that have values)
console.log('--- SHEET 1: NR OCT ---');
const sheet1 = parseSheet(path.join(tempDir, 'worksheets', 'sheet1.xml'));
sheet1.forEach(r => {
  // Only print rows that have at least one non-empty cell
  const entries = Object.entries(r.cells).filter(([k, v]) => v !== undefined && v !== '');
  if (entries.length > 0) {
    console.log(`Row ${r.rowNum}: ${entries.map(([k, v]) => `${k}=${v}`).join(', ')}`);
  }
});

// 2. Inspect Sheet 2: RF OCT
console.log('\n--- SHEET 2: RF OCT ---');
const sheet2 = parseSheet(path.join(tempDir, 'worksheets', 'sheet2.xml'));
sheet2.forEach(r => {
  const entries = Object.entries(r.cells).filter(([k, v]) => v !== undefined && v !== '');
  if (entries.length > 0) {
    console.log(`Row ${r.rowNum}: ${entries.map(([k, v]) => `${k}=${v}`).join(', ')}`);
  }
});

// 3. Inspect Sheet 3: CUS OCT
console.log('\n--- SHEET 3: CUS OCT ---');
const sheet3 = parseSheet(path.join(tempDir, 'worksheets', 'sheet3.xml'));
sheet3.forEach(r => {
  const entries = Object.entries(r.cells).filter(([k, v]) => v !== undefined && v !== '');
  if (entries.length > 0) {
    console.log(`Row ${r.rowNum}: ${entries.map(([k, v]) => `${k}=${v}`).join(', ')}`);
  }
});

