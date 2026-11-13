const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb+srv://austineilarde_db_user:mCtQskHpGcVqkBP9@turismotrack.8eu32lw.mongodb.net/?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  const adminDb = mongoose.connection.db.admin();
  const dbs = await adminDb.listDatabases();
  console.log('Databases:', dbs.databases.map(d => d.name));

  for (const d of dbs.databases) {
    if (d.name === 'local' || d.name === 'admin') continue;
    const db = mongoose.connection.client.db(d.name);
    const cols = await db.listCollections().toArray();
    for (const c of cols) {
      const col = db.collection(c.name);
      const docs = await col.find({
        $or: [
          { totalVisitors: 13173 },
          { visitorsThisMonth: 13173 },
          { totalVisitorsThisMonth: 13173 },
          { visitors: 13173 },
          { totalVisitors: 12763 },
          { visitorsThisMonth: 12763 }
        ]
      }).toArray();
      if (docs.length > 0) {
        console.log(`Found in db "${d.name}", collection "${c.name}":`, docs.length, 'docs');
        docs.forEach(doc => console.log('  doc:', doc._id, doc.name, doc.municipality, doc.totalVisitors, doc.visitorsThisMonth));
      }
    }
  }

  await mongoose.disconnect();
}
run();

