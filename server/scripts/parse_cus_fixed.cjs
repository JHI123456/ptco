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

function parseSheetProper(sheetPath) {
  const sheetXml = fs.readFileSync(sheetPath, 'utf8');
  const rows = [];
  const rowRegex = /<row[^>]+r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  let rMatch;
  while ((rMatch = rowRegex.exec(sheetXml)) !== null) {
    const rowNum = parseInt(rMatch[1]);
    const rowContent = rMatch[2];
    const cells = {};
    const cRegex = /<c\b([^>]*)>([\s\S]*?)<\/c>/g;
    let cMatch;
    while ((cMatch = cRegex.exec(rowContent)) !== null) {
      const attrs = cMatch[1];
      const body = cMatch[2];
      const rAttr = (attrs.match(/r="([A-Z]+)\d+"/) || [])[1];
      const tAttr = (attrs.match(/t="([^"]+)"/) || [])[1];
      let val = '';
      const vMatch = /<v>([\s\S]*?)<\/v>/.exec(body);
      if (vMatch) {
        val = vMatch[1];
        if (tAttr === 's') {
          val = strings[parseInt(val)] || val;
        }
      }
      if (rAttr) {
        cells[rAttr] = val;
      }
    }
    rows.push({ rowNum, cells });
  }
  return rows;
}

const s3 = parseSheetProper(path.join(tempDir, 'worksheets', 'sheet3.xml'));
s3.slice(9, 30).forEach(r => {
  if (Object.keys(r.cells).length > 0) {
    console.log(`Row ${r.rowNum}:`, JSON.stringify(r.cells));
  }
});
