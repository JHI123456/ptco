const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb+srv://austineilarde_db_user:mCtQskHpGcVqkBP9@turismotrack.8eu32lw.mongodb.net/turismo_track?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const subs = await db.collection('submissions').find({}).toArray();
  console.log(`Total submissions in DB: ${subs.length}`);
  subs.forEach(s => {
    console.log(`- ID: ${s._id} | Form: ${s.formType} | Est: ${s.establishmentName} | Muni: ${s.municipality} | Visitors: ${s.visitors} | Status: ${s.status} | Period: ${s.reportingPeriod}`);
  });

  await mongoose.disconnect();
}
run();

