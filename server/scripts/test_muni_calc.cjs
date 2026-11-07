const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const establishments = await db.collection("establishments").find({ municipality: /bayombong/i }).toArray();
  const checkins = await db.collection("checkins").find({ municipality: /bayombong/i }).toArray();
  const submissions = await db.collection("submissions").find({ municipality: /bayombong/i }).toArray();

  const estBreakdowns = {};
  checkins.forEach((c) => {
    const k = (c.establishmentName || '').trim().toLowerCase();
    if (!estBreakdowns[k]) estBreakdowns[k] = { checkinTotal: 0, formTotal: 0 };
    const count = Number(c.totalVisitors || ((Number(c.maleCount || 0) + Number(c.femaleCount || 0))) || 1);
    estBreakdowns[k].checkinTotal += count;
  });

  submissions.forEach((s) => {
    const fType = String(s.formType || '').toUpperCase();
    if (fType.includes('CUS') || fType.includes('CONVENTION') || fType.includes('MICE') || fType.includes('CHECKIN') || fType.includes('CHECK-IN')) return;
    const k = (s.establishmentName || '').trim().toLowerCase();
    if (!estBreakdowns[k]) estBreakdowns[k] = { checkinTotal: 0, formTotal: 0 };
    const total = Number(s.visitors) || 0;
    estBreakdowns[k].formTotal = Math.max(estBreakdowns[k].formTotal, total);
  });

  let total = 0;
  establishments.forEach(e => {
    const k = (e.name || '').trim().toLowerCase();
    const v = estBreakdowns[k];
    const estTotal = v ? Math.max(v.checkinTotal, v.formTotal) : Number(e.visitorsThisMonth || 0);
    console.log(`Muni breakdown for ${e.name}: ${estTotal} (chk: ${v?.checkinTotal}, form: ${v?.formTotal})`);
    total += estTotal;
  });

  console.log(`Muni total: ${total}`);
  await mongoose.disconnect();
}
main().catch(console.error);

