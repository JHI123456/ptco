const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function inspectZen() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const est = await db.collection('establishments').findOne({ name: /Zen Hotel/i });
  console.log('=== ESTABLISHMENT ===');
  console.log(est);

  const user = await db.collection('users').findOne({ email: 'zenhotel@gmail.com' });
  console.log('=== USER ===');
  console.log(user);

  const subs = await db.collection('submissions').find({
    $or: [{ establishmentName: /Zen Hotel/i }, { 'formData.establishmentName': /Zen Hotel/i }]
  }).toArray();
  console.log(`=== SUBMISSIONS (${subs.length}) ===`);
  for (const s of subs) {
    console.log(`- Type: ${s.formType}, Period: ${s.reportingPeriod || s.formData?.reportingPeriod}, Status: ${s.status}, Visitors: ${s.visitors}`);
  }

  const checkins = await db.collection('checkins').find({
    establishmentName: /Zen Hotel/i
  }).toArray();
  console.log(`=== CHECKINS (${checkins.length}) ===`);
  const dayCounts = {};
  for (const c of checkins) {
    const d = c.arrivalDate;
    dayCounts[d] = (dayCounts[d] || 0) + (c.totalVisitors || 0);
  }
  console.log('Checkins by date:', dayCounts);

  await mongoose.disconnect();
}

inspectZen().catch(console.error);

