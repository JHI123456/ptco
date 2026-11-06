const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function testAnalytics() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const checkins = await db.collection('checkins').find({
    municipality: 'Bayombong',
    reportingYear: 2026,
    reportingMonth: 10
  }).toArray();

  let domestic = 0;
  let foreign = 0;
  let overnight = 0;
  let total = 0;

  for (const c of checkins) {
    const isForeign = (c.classificationType || c.residenceStatus || '').toLowerCase().includes('foreign');
    const isOvernight = (Number(c.nights) || 0) >= 1 || !!c.isOvernight;
    const count = Number(c.totalVisitors) || 1;

    if (isForeign) foreign += count;
    else domestic += count;
    if (isOvernight) overnight += count;
    total += count;
  }

  console.log('=== OCTOBER 2026 RECONCILED METRICS FOR BAYOMBONG ===');
  console.log(`Domestic: ${domestic}`);
  console.log(`Foreign: ${foreign}`);
  console.log(`Total Guests: ${total}`);
  console.log(`Overnight Guests: ${overnight}`);

  const dae1bSub = await db.collection('submissions').findOne({ formType: 'FORM A DAE-1B' });
  console.log('\n=== DAE-1B SUBMISSION ===');
  console.log(`Establishment: ${dae1bSub?.establishmentName}`);
  console.log(`Period: ${dae1bSub?.reportingPeriod}`);
  console.log(`Total Visitors: ${dae1bSub?.visitors}`);
  console.log(`Rooms Occupied: ${dae1bSub?.roomsOccupied}`);
  console.log(`Duty Manager: ${dae1bSub?.preparedBy}`);

  const cusSub = await db.collection('submissions').findOne({ formType: 'CUS FORM' });
  console.log('\n=== CUS FORM SUBMISSION ===');
  console.log(`Establishment: ${cusSub?.establishmentName}`);
  console.log(`Period: ${cusSub?.reportingPeriod}`);
  console.log(`Total Events: ${cusSub?.totalEvents}`);
  console.log(`Total Attendees: ${cusSub?.totalAttendees}`);
  console.log(`Duty Manager: ${cusSub?.preparedBy}`);

  await mongoose.disconnect();
}

testAnalytics().catch(console.error);
