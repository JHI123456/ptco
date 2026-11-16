const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}
const mongoose = require('mongoose');

const uri = 'mongodb+srv://austineilarde_db_user:mCtQskHpGcVqkBP9@turismotrack.8eu32lw.mongodb.net/turismo_track?retryWrites=true&w=majority';

async function updateDb() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;

  // 1. Zen Hotel Bayombong -> 5,182
  const r1 = await db.collection('establishments').updateMany(
    { name: new RegExp('Zen Hotel', 'i') },
    { $set: { totalVisitors: 5182, visitorsThisMonth: 5182, status: 'active', verificationStatus: 'approved' } }
  );
  console.log('Zen Hotel updated:', r1.modifiedCount);

  // 2. WILWIN HOTEL -> 410
  const r2 = await db.collection('establishments').updateMany(
    { name: new RegExp('WILWIN', 'i') },
    { $set: { totalVisitors: 410, visitorsThisMonth: 410, status: 'active', verificationStatus: 'approved' } }
  );
  console.log('WILWIN updated:', r2.modifiedCount);

  // 3. Bayombong in lgus collection -> 5,592
  const r3 = await db.collection('lgus').updateMany(
    { name: new RegExp('^Bayombong$', 'i') },
    {
      $set: {
        totalVisitors: 5592,
        visitorsThisMonth: 5592,
        visitorsToday: 5592,
        visitorsThisWeek: 5592,
        capacityLoad: 100,
        status: 'Optimal',
        statusType: 'optimal',
        'intel.registeredSites': 3,
        'intel.currentHeadcount': '5,592 / 2,000'
      }
    }
  );
  console.log('Bayombong LGU updated:', r3.modifiedCount);

  // Verify
  const bayLgu = await db.collection('lgus').findOne({ name: new RegExp('^Bayombong$', 'i') });
  console.log('Verified Bayombong in db.lgus:', bayLgu ? { name: bayLgu.name, totalVisitors: bayLgu.totalVisitors, intel: bayLgu.intel } : 'none');

  await mongoose.disconnect();
  console.log('Done!');
}

updateDb().catch(console.error);
