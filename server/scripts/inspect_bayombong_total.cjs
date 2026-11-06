const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  console.log('=== LGUS (Bayombong) ===');
  const lgus = await db.collection('lgus').find({ name: /Bayombong/i }).toArray();
  console.log(lgus);

  console.log('=== ESTABLISHMENTS (Bayombong) ===');
  const ests = await db.collection('establishments').find({ municipality: /Bayombong/i }).toArray();
  let estTotalVisitors = 0;
  ests.forEach(e => {
    console.log(`- ${e.name}: totalVisitors=${e.totalVisitors}, visitorsThisMonth=${e.visitorsThisMonth}`);
    estTotalVisitors += (Number(e.totalVisitors) || 0);
  });
  console.log('Total across establishments:', estTotalVisitors);

  console.log('=== SUBMISSIONS (Bayombong) ===');
  const subs = await db.collection('submissions').find({ municipality: /Bayombong/i }).toArray();
  let subTotal = 0;
  subs.forEach(s => {
    console.log(`- [${s.formType}] ${s.establishmentName || s.name}: visitors=${s.visitors}, totalGuests=${s.formData?.grandTotal || s.formData?.totalVisitors}`);
    subTotal += (Number(s.visitors) || Number(s.formData?.grandTotal) || 0);
  });
  console.log('Total across submissions:', subTotal);

  console.log('=== CHECKINS (Bayombong) ===');
  const checkins = await db.collection('checkins').find({ municipality: /Bayombong/i }).toArray();
  let checkinTotal = 0;
  checkins.forEach(c => {
    checkinTotal += (Number(c.totalVisitors) || 0);
  });
  console.log(`Total checkins count: ${checkins.length}, sum of totalVisitors: ${checkinTotal}`);

  await mongoose.disconnect();
}
main().catch(console.error);

