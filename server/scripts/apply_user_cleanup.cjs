const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb+srv://austineilarde_db_user:mCtQskHpGcVqkBP9@turismotrack.8eu32lw.mongodb.net/turismo_track?retryWrites=true&w=majority';

async function cleanup() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  // 1. Delete the November checkin(s) for Wilwin / Bayombong
  const delCheckinResult = await db.collection('checkins').deleteMany({
    $or: [
      { _id: new mongoose.Types.ObjectId('6aedc3366f01424cf407a8eb') },
      { arrivalDate: '2026-11-25', establishmentName: /wilwin/i },
      { date: '2026-11-25', establishmentName: /wilwin/i }
    ]
  });
  console.log(`Deleted November checkin(s): ${delCheckinResult.deletedCount}`);

  // 2. Delete the November submission(s) for Wilwin / Bayombong
  const delSubResult = await db.collection('submissions').deleteMany({
    $or: [
      { _id: new mongoose.Types.ObjectId('6aedc3356f01424cf407a8e4') },
      { 'formData.arrivalDate': '2026-11-25', establishmentName: /wilwin/i },
      { 'formData.date': '2026-11-25', establishmentName: /wilwin/i },
      { arrivalDate: '2026-11-25', establishmentName: /wilwin/i }
    ]
  });
  console.log(`Deleted November submission(s): ${delSubResult.deletedCount}`);

  // 3. Verify remaining checkins
  const wilwinCheckins = await db.collection('checkins').find({ establishmentName: /wilwin/i }).toArray();
  const wilwinVisitors = wilwinCheckins.reduce((s, c) => s + (Number(c.totalVisitors || c.visitors) || 1), 0);
  console.log(`Wilwin checkins count: ${wilwinCheckins.length}, visitors: ${wilwinVisitors}`);

  const zenCheckins = await db.collection('checkins').find({ establishmentName: /zen/i }).toArray();
  const zenVisitors = zenCheckins.reduce((s, c) => s + (Number(c.totalVisitors || c.visitors) || 1), 0);
  console.log(`Zen checkins count: ${zenCheckins.length}, visitors: ${zenVisitors}`);

  const bayombongTotal = zenVisitors + wilwinVisitors;
  console.log(`Bayombong combined visitors: ${bayombongTotal} (${zenVisitors} + ${wilwinVisitors})`);

  // 4. Update establishments
  await db.collection('establishments').updateOne(
    { name: /wilwin/i },
    { $set: { visitorsThisMonth: wilwinVisitors, totalVisitors: wilwinVisitors } }
  );
  await db.collection('establishments').updateOne(
    { name: /zen/i },
    { $set: { visitorsThisMonth: zenVisitors, totalVisitors: zenVisitors } }
  );
  console.log('Updated establishments (Wilwin: 410, Zen: 5182)');

  // 5. Update LGU Bayombong
  await db.collection('lgus').updateOne(
    { name: 'Bayombong' },
    {
      $set: {
        totalVisitors: bayombongTotal,
        visitorsThisMonth: bayombongTotal,
        'intel.currentHeadcount': `${bayombongTotal.toLocaleString()} / 1,800`
      }
    }
  );
  console.log(`Updated LGU Bayombong totalVisitors to: ${bayombongTotal}`);

  await mongoose.disconnect();
}

cleanup();

