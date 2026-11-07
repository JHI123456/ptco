const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb+srv://austineilarde_db_user:mCtQskHpGcVqkBP9@turismotrack.8eu32lw.mongodb.net/turismo_track?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  // Find all checkins for Bayombong
  const checkins = await db.collection('checkins').find({
    $or: [{ municipality: /bayombong/i }, { municipalityId: /bayombong/i }]
  }).toArray();

  console.log(`Total checkins in Bayombong: ${checkins.length}`);
  
  // Find checkins entered in November or with arrival date in November
  const novCheckins = checkins.filter(c => {
    const arr = String(c.arrivalDate || c.date || '');
    const created = new Date(c.createdAt || 0);
    const m = Number(c.reportingMonth);
    return arr.startsWith('2026-11') || arr.startsWith('2024-11') || created.getMonth() === 10 || m === 11;
  });

  console.log(`November checkins count: ${novCheckins.length}`);
  novCheckins.forEach(c => {
    console.log(`- ID: ${c._id}, Est: ${c.establishmentName}, Date: ${c.arrivalDate || c.date}, Visitors: ${c.totalVisitors || c.visitors}, Month: ${c.reportingMonth}, CreatedAt: ${c.createdAt}`);
  });

  // Check Wilwin checkins
  const wilwinCheckins = checkins.filter(c => (c.establishmentName || '').toLowerCase().includes('wilwin'));
  console.log(`Wilwin checkins count: ${wilwinCheckins.length}`);
  const wilwinVisitors = wilwinCheckins.reduce((sum, c) => sum + (Number(c.totalVisitors || c.visitors) || 1), 0);
  console.log(`Wilwin total visitors: ${wilwinVisitors}`);

  // Check Zen checkins
  const zenCheckins = checkins.filter(c => (c.establishmentName || '').toLowerCase().includes('zen'));
  console.log(`Zen checkins count: ${zenCheckins.length}`);
  const zenVisitors = zenCheckins.reduce((sum, c) => sum + (Number(c.totalVisitors || c.visitors) || 1), 0);
  console.log(`Zen total visitors: ${zenVisitors}`);

  await mongoose.disconnect();
}

run();

