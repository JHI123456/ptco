const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const subs = await db.collection("submissions").find({}).toArray();
  console.log('Total submissions:', subs.length);
  const byMuni = {};
  subs.forEach(s => {
    const m = s.municipality || 'None';
    byMuni[m] = (byMuni[m] || 0) + (Number(s.visitors) || 0);
  });
  console.log('Submissions visitors by muni:', byMuni);

  // Check checkins by muni
  const checkins = await db.collection("checkins").find({}).toArray();
  const cByMuni = {};
  checkins.forEach(c => {
    const m = c.municipality || 'None';
    cByMuni[m] = (cByMuni[m] || 0) + (Number(c.totalVisitors) || 0);
  });
  console.log('Checkins visitors by muni:', cByMuni);

  // Check lgus
  const lgus = await db.collection("lgus").find({}).toArray();
  lgus.forEach(l => console.log('LGU:', l.name, 'totalVisitors:', l.totalVisitors));

  await mongoose.disconnect();
}
main().catch(console.error);
