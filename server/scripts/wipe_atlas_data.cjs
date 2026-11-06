const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function runWipe() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const collectionsToClear = [
    'checkins',
    'submissions',
    'messages',
    'var2forms',
    'dae2forms',
    'dotforms',
    'holidayforms',
    'cusforms',
    'dae1aforms',
    'dae3b2forms',
    'establishments'
  ];

  for (const collName of collectionsToClear) {
    try {
      const coll = db.collection(collName);
      const res = await coll.deleteMany({});
      console.log(`✓ Cleared "${collName}": deleted ${res.deletedCount} documents.`);
    } catch (err) {
      console.log(`! Error on "${collName}": ${err.message}`);
    }
  }

  // Remove test establishment accounts from users (keeping Admin accounts)
  const userRes = await db.collection('users').deleteMany({
    $or: [
      { role: { $regex: /establishment/i } },
      { email: { $in: ['taman12@gmail.com', '24/7inn@gmail.com'] } }
    ]
  });
  console.log(`✓ Removed test establishment users: deleted ${userRes.deletedCount} accounts.`);

  // Reset LGUs metrics
  const lguRes = await db.collection('lgus').updateMany({}, {
    $set: {
      totalVisitors: 0,
      foreignMice: 0,
      capacityLoad: 0,
      'intel.registeredSites': 0,
      'intel.currentHeadcount': '0 / 2,000'
    }
  });
  console.log(`✓ Reset LGUs metrics: matched ${lguRes.matchedCount}, modified ${lguRes.modifiedCount} LGUs.`);

  console.log('\n=== CURRENT COLLECTION DOCUMENT COUNTS ===');
  const allColls = await db.listCollections().toArray();
  for (const c of allColls) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`- ${c.name}: ${count} documents`);
  }

  const remainingUsers = await db.collection('users').find({}, { projection: { email: 1, role: 1, municipality: 1 } }).toArray();
  console.log('\nRemaining Active Administrative Accounts:', remainingUsers);

  await mongoose.disconnect();
  console.log('\n🎉 ALL DATA HAS BEEN REMOVED SUCCESSFULLY!');
}

runWipe().catch(err => {
  console.error('Fatal wipe error:', err);
  process.exit(1);
});

