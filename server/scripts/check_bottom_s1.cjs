const fs = require('fs');
const path = require('path');
const tempDir = path.join(process.env.TEMP || 'C:\\Users\\jhill\\AppData\\Local\\Temp', 'nr_oct_extracted', 'xl');
const sheetXml = fs.readFileSync(path.join(tempDir, 'worksheets', 'sheet1.xml'), 'utf8');

for (let r = 140; r <= 165; r++) {
  const re = new RegExp('<row[^>]+r="' + r + '"[^>]*>([\\s\\S]*?)<\\/row>');
  const m = re.exec(sheetXml);
  if (m) console.log(`Row ${r}:`, m[1]);
}

