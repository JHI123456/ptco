const fs = require('fs');
const path = require('path');

const tempDir = path.join(process.env.TEMP || 'C:\\Users\\jhill\\AppData\\Local\\Temp', 'nr_oct_extracted', 'xl');

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

// 1. Sheet 1: NR OCT
console.log('=== PARSING NR OCT ===');
const s1 = parseSheet(path.join(tempDir, 'worksheets', 'sheet1.xml'));
// Let's print rows 20 to 145
s1.filter(r => r.rowNum >= 20 && r.rowNum <= 145).forEach(r => {
  const c = r.cells;
  const label = c.A || '';
  const total = c.AG || '';
  // Check if any day has non-zero
  const daysWithValues = Object.entries(c).filter(([col, val]) => col !== 'A' && col !== 'AG' && val && val !== '0');
  if (total || daysWithValues.length > 0 || label) {
    console.log(`Row ${r.rowNum}: [${label}] Total=${total} | Days: ${daysWithValues.map(([k, v]) => `${k}:${v}`).join(', ')}`);
  }
});
