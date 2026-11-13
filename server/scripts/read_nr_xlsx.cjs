const xlsx = require('xlsx');
const path = 'C:/Users/jhill/.gemini/antigravity/brain/b809a9d8-5638-4bc4-9992-d04ad2452ed3/.user_uploaded/media_1794016785226_f4435d1c.xlsx';
const wb = xlsx.readFile(path);
console.log('Sheets:', wb.SheetNames);

for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name];
  const txt = xlsx.utils.sheet_to_csv(ws);
  console.log(`Sheet "${name}" length: ${txt.length} chars`);
  const lines = txt.split('\n');
  for (let i = 0; i < Math.min(25, lines.length); i++) {
    if (lines[i].trim()) {
      console.log(`  [${i}] ${lines[i]}`);
    }
  }
}
