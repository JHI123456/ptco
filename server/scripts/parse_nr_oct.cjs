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

console.log(`Parsed ${strings.length} shared strings.`);

// Function to parse sheet
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

// Read sheets:
// workbook.xml: sheet1 -> NR OCT, sheet2 -> RF OCT (or sheet3?), let's check relationships
const relsXml = fs.readFileSync(path.join(tempDir, '_rels', 'workbook.xml.rels'), 'utf8');
console.log('Relationships:\n', relsXml);

['sheet1.xml', 'sheet2.xml', 'sheet3.xml'].forEach(s => {
  const sPath = path.join(tempDir, 'worksheets', s);
  if (fs.existsSync(sPath)) {
    const rows = parseSheet(sPath);
    console.log(`\n=== ${s} (rows: ${rows.length}) ===`);
    rows.slice(0, 40).forEach(r => {
      const line = Object.entries(r.cells).map(([k, v]) => `${k}:${v}`).join(' | ');
      if (line.trim()) console.log(`Row ${r.rowNum}: ${line}`);
    });
  }
});
