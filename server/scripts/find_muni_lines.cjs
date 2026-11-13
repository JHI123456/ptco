const fs = require('fs');
const file = '../Turismotrackmunisipality system/latest/src/Dashboard.jsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.toLowerCase().includes('visitor this month')) {
    console.log(`Match at line ${i+1}: ${line}`);
    for (let j = Math.max(0, i-4); j <= Math.min(lines.length-1, i+15); j++) {
      console.log(`  ${j+1}: ${lines[j]}`);
    }
  }
});

