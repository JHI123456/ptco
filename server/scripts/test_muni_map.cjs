const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb+srv://austineilarde_db_user:mCtQskHpGcVqkBP9@turismotrack.8eu32lw.mongodb.net/turismo_track?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const establishments = await db.collection('establishments').find({ municipality: /bayombong/i }).toArray();
  console.log('Establishments in DB:');
  establishments.forEach(e => {
    console.log(`- ${e.name} (_id: ${e._id}): totalVisitors=${e.totalVisitors}, visitorsThisMonth=${e.visitorsThisMonth}`);
  });

  const checkins = await db.collection('checkins').find({ municipality: /bayombong/i }).toArray();
  console.log(`\nCheckins count: ${checkins.length}`);
  const chkByEst = {};
  checkins.forEach(c => {
    const k = c.establishmentName || c.establishmentId;
    chkByEst[k] = (chkByEst[k] || 0) + Number(c.totalVisitors || 1);
  });
  console.log('Checkins by establishment:', chkByEst);

  const submissions = await db.collection('submissions').find({ municipality: /bayombong/i }).toArray();
  console.log(`\nSubmissions count: ${submissions.length}`);
  submissions.forEach(s => {
    console.log(`- Sub ${s._id}: formType="${s.formType}", est="${s.establishmentName}", visitors=${s.visitors}, status="${s.status}", period="${s.reportingPeriod || s.reportingMonth}"`);
  });

  await mongoose.disconnect();
}
run();

