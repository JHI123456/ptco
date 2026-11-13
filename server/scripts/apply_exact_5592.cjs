const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb+srv://austineilarde_db_user:mCtQskHpGcVqkBP9@turismotrack.8eu32lw.mongodb.net/turismo_track?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  // 1. Delete CUS MICE 2399
  const delCus = await db.collection('submissions').deleteMany({
    $or: [
      { _id: new ObjectId('6aedcd85342f6e5734ff6f09') },
      { formType: /CUS/i, visitors: 2399 },
      { visitors: 2399 }
    ]
  });
  console.log(`Deleted CUS MICE 2399 docs:`, delCus.deletedCount);

  // 2. Update Form A 5182 in submissions so it does not get double-counted by old server logic
  // Change formType to 'VISITOR CHECK-IN' and status to 'archived_dedup'
  const updSub = await db.collection('submissions').updateMany(
    { _id: new ObjectId('6aedcd85342f6e5734ff6f08') },
    {
      $set: {
        formType: 'VISITOR CHECK-IN',
        status: 'archived_dedup',
        note: 'Deduplicated: Zen Hotel 5,182 is preserved in checkins collection'
      }
    }
  );
  console.log(`Updated Form A 5182 doc:`, updSub.modifiedCount);

  // 3. Ensure Bayombong LGU has exactly totalVisitors: 5592 and visitorsThisMonth: 0
  const updLgu = await db.collection('lgus').updateMany(
    { name: /bayombong/i },
    {
      $set: {
        totalVisitors: 5592,
        visitorsThisMonth: 0,
        foreignMice: 17,
        'intel.currentHeadcount': '5,592 / 1,800',
        updatedAt: new Date()
      }
    }
  );
  console.log(`Updated Bayombong LGU docs:`, updLgu.modifiedCount);

  // 4. Ensure establishments have exactly 5182 and 410
  const updZen = await db.collection('establishments').updateOne(
    { name: /zen/i },
    { $set: { totalVisitors: 5182, visitorsThisMonth: 0, updatedAt: new Date() } }
  );
  const updWil = await db.collection('establishments').updateOne(
    { name: /wilwin/i },
    { $set: { totalVisitors: 410, visitorsThisMonth: 0, updatedAt: new Date() } }
  );
  console.log(`Updated Zen (${updZen.modifiedCount}) and Wilwin (${updWil.modifiedCount}) establishments`);

  // Verify: Check checkins total for Bayombong
  const checkins = await db.collection('checkins').find({ municipality: /bayombong/i }).toArray();
  let chkTotal = 0;
  checkins.forEach(c => chkTotal += Number(c.totalVisitors || 1));
  console.log(`\nVerified Checkins in Bayombong: count=${checkins.length}, totalVisitors=${chkTotal}`);

  await mongoose.disconnect();
}
run();

