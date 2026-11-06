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

const cusRows = parseSheet(path.join(tempDir, 'worksheets', 'sheet3.xml'));
// Rows 11 onwards are events
console.log('Total CUS rows:', cusRows.length);
// Print rows 10 to 20
cusRows.slice(9, 25).forEach(r => {
  console.log(`Row ${r.rowNum}:`, JSON.stringify(r.cells));
});

