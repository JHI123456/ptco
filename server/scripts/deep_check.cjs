const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function deepCheck() {
  await mongoose.connect(process.env.MONGODB_URI);
  const client = mongoose.connection.getClient();

  // List all databases on the cluster
  const adminDb = client.db().admin();
  const dbs = await adminDb.listDatabases();
  console.log('=== DATABASES ON ATLAS CLUSTER ===');
  console.log(dbs.databases);

  for (const d of dbs.databases) {
    if (['admin', 'local'].includes(d.name)) continue;
    const dbInstance = client.db(d.name);
    const cols = await dbInstance.listCollections().toArray();
    console.log(`\n--- DB: ${d.name} ---`);
    for (const c of cols) {
      const count = await dbInstance.collection(c.name).countDocuments();
      if (count > 0) {
        console.log(`  collection "${c.name}": ${count} documents`);
        const sample = await dbInstance.collection(c.name).find({}).limit(5).toArray();
        console.log(`    sample:`, JSON.stringify(sample.map(doc => {
          const { password, ...rest } = doc;
          return rest;
        })));
      } else {
        console.log(`  collection "${c.name}": 0 documents`);
      }
    }
  }

  await mongoose.disconnect();
}

deepCheck().catch(console.error);

