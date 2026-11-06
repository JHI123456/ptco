const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function cleanWilwinData() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // 1. Wipe all transactional data collections
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
    'dae3b2forms'
  ];

  for (const collName of collectionsToClear) {
    try {
      const coll = db.collection(collName);
      const res = await coll.deleteMany({});
      console.log(`✓ Cleared "${collName}": deleted ${res.deletedCount} documents.`);
    } catch (err) {
      console.log(`! Error clearing "${collName}": ${err.message}`);
    }
  }

  // 2. Reset WILWIN HOTEL metrics to zero while keeping the establishment intact
  const estUpdate = await db.collection('establishments').updateMany(
    { name: /wilwin/i },
    {
      $set: {
        visitorsThisMonth: 0,
        totalVisitors: 0,
        foreignMice: 0,
        capacityLoad: 0,
        todayGuests: 0,
        status: 'active',
        updatedAt: new Date()
      }
    }
  );
  console.log(`✓ Reset WILWIN HOTEL metrics to 0 (matched ${estUpdate.matchedCount}, modified ${estUpdate.modifiedCount})`);

  // 3. Reset Bayombong LGU metrics to zero while keeping the LGU intact
  const lguUpdate = await db.collection('lgus').updateMany(
    { name: /bayombong/i },
    {
      $set: {
        totalVisitors: 0,
        foreignMice: 0,
        capacityLoad: 0,
        'intel.registeredSites': 1,
        'intel.currentHeadcount': '0 / 2,000',
        updatedAt: new Date()
      }
    }
  );
  console.log(`✓ Reset Bayombong LGU metrics to 0 (matched ${lguUpdate.matchedCount}, modified ${lguUpdate.modifiedCount})`);

  // 4. Log an audit trail entry
  await db.collection('auditlogs').insertOne({
    timestamp: new Date(),
    userId: null,
    userName: 'Provincial Administrator',
    userEmail: 'admin@gmail.com',
    role: 'Provincial Admin',
    municipality: 'Bayombong',
    establishmentName: 'WILWIN HOTEL',
    action: 'DATA_RESET',
    module: 'System',
    details: 'Cleared all visitor check-in logs, monthly submissions, and messages for WILWIN HOTEL (metrics reset to 0; account preserved).',
    status: 'Success',
    ipAddress: '127.0.0.1',
    metadata: { establishment: 'WILWIN HOTEL', municipality: 'Bayombong' },
    createdAt: new Date(),
    updatedAt: new Date()
  });
  console.log('✓ Recorded official audit log entry for WILWIN HOTEL data reset.');

  console.log('\n=== CURRENT COLLECTION DOCUMENT COUNTS ===');
  const allColls = await db.listCollections().toArray();
  for (const c of allColls) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`- ${c.name}: ${count} documents`);
  }

  const activeEstablishments = await db.collection('establishments').find({}).toArray();
  console.log('\n=== ACTIVE ESTABLISHMENTS ===');
  console.log(activeEstablishments.map(e => ({ name: e.name, municipality: e.municipality, visitorsThisMonth: e.visitorsThisMonth, totalVisitors: e.totalVisitors })));

  const activeUsers = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
  console.log('\n=== ACTIVE ACCOUNTS ===');
  console.log(activeUsers.map(u => ({ email: u.email, role: u.role, municipality: u.municipality, name: u.name || u.establishmentName })));

  await mongoose.disconnect();
  console.log('\n🎉 COMPLETED: WILWIN HOTEL PRESERVED WITH ALL INTERNAL DATA RESET TO 0!');
}

cleanWilwinData().catch(console.error);
