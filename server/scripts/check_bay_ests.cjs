const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb+srv://austineilarde_db_user:mCtQskHpGcVqkBP9@turismotrack.8eu32lw.mongodb.net/turismo_track?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const ests = await db.collection('establishments').find({
    $or: [{ municipality: /bayombong/i }, { municipalityId: /bayombong/i }]
  }).toArray();

  console.log('Establishments in Bayombong:', ests.length);
  ests.forEach(e => {
    console.log(JSON.stringify({
      id: e._id,
      name: e.name,
      totalVisitors: e.totalVisitors,
      visitorsThisMonth: e.visitorsThisMonth
    }, null, 2));
  });

  const lgus = await db.collection('lgus').find({
    name: /bayombong/i
  }).toArray();
  console.log('LGUs Bayombong:', JSON.stringify(lgus, null, 2));

  await mongoose.disconnect();
}
run();

