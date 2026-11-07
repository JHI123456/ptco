const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb+srv://austineilarde_db_user:mCtQskHpGcVqkBP9@turismotrack.8eu32lw.mongodb.net/turismo_track?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const wilwinCheckins = await db.collection('checkins').find({
    establishmentName: /wilwin/i
  }).sort({ createdAt: -1 }).toArray();

  console.log(`Wilwin records: ${wilwinCheckins.length}`);
  wilwinCheckins.forEach((c, idx) => {
    console.log(`${idx + 1}. ID: ${c._id}, Date: ${c.arrivalDate || c.date}, Visitors: ${c.totalVisitors || c.visitors}, Guest: ${c.guestName}, Month: ${c.reportingMonth}, CreatedAt: ${c.createdAt}`);
  });

  await mongoose.disconnect();
}

run();

