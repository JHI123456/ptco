const fs = require('fs');
const path = require('path');
const tempDir = path.join(process.env.TEMP || 'C:\\Users\\jhill\\AppData\\Local\\Temp', 'nr_oct_extracted', 'xl');
const sheetXml = fs.readFileSync(path.join(tempDir, 'worksheets', 'sheet1.xml'), 'utf8');

[43, 52, 53, 74].forEach(rowNum => {
  const re = new RegExp('<row[^>]+r="' + rowNum + '"[^>]*>([\\s\\S]*?)<\\/row>');
  const m = re.exec(sheetXml);
  if (m) console.log(`Row ${rowNum}:\n`, m[1]);
});
