const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb+srv://austineilarde_db_user:mCtQskHpGcVqkBP9@turismotrack.8eu32lw.mongodb.net/turismo_track?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const allCheckins = await db.collection('checkins').find({}).toArray();
  console.log(`Total checkins in DB: ${allCheckins.length}`);

  // Group by establishment
  const byEst = {};
  allCheckins.forEach(c => {
    const est = c.establishmentName || 'Unknown';
    if (!byEst[est]) byEst[est] = { count: 0, visitors: 0, records: [] };
    const v = Number(c.totalVisitors || c.visitors) || 1;
    byEst[est].count++;
    byEst[est].visitors += v;
    byEst[est].records.push(c);
  });

  Object.entries(byEst).forEach(([est, data]) => {
    console.log(`\nEst: ${est} | Records: ${data.count} | Total Visitors: ${data.visitors}`);
  });

  // Check submissions
  const allSubs = await db.collection('submissions').find({}).toArray();
  console.log(`\nTotal submissions in DB: ${allSubs.length}`);
  allSubs.forEach(s => {
    console.log(`- Sub ID: ${s._id}, Est: ${s.establishmentName}, Type: ${s.formType}, Visitors: ${s.visitors}, Month: ${s.formData?.reportingMonth || s.formData?.month || s.reportingMonth}, Date: ${s.submittedAt || s.createdAt}`);
  });

  await mongoose.disconnect();
}

run();

