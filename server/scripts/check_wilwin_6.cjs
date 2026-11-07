const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb+srv://austineilarde_db_user:mCtQskHpGcVqkBP9@turismotrack.8eu32lw.mongodb.net/turismo_track?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const wilwin = await db.collection('checkins').find({
    establishmentName: /wilwin/i
  }).toArray();

  // Find records with visitors = 6
  const recordsWith6 = wilwin.filter(r => (Number(r.totalVisitors || r.visitors) === 6));
  console.log(`Wilwin records with exactly 6 visitors: ${recordsWith6.length}`);
  recordsWith6.forEach(r => {
    console.log(`- ID: ${r._id}, Date: ${r.arrivalDate}, Guest: "${r.guestName}", CreatedAt: ${r.createdAt}`);
  });

  // Check by arrival date
  const byDate = {};
  wilwin.forEach(r => {
    const d = r.arrivalDate || r.date;
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push({ id: r._id, visitors: Number(r.totalVisitors || r.visitors), createdAt: r.createdAt });
  });

  console.log('\nWilwin counts per date:');
  Object.keys(byDate).sort().forEach(d => {
    const totalOnDate = byDate[d].reduce((s, x) => s + x.visitors, 0);
    console.log(`Date: ${d} | Records: ${byDate[d].length} | Total: ${totalOnDate} | Details: ${byDate[d].map(x => x.visitors).join('+')}`);
  });

  await mongoose.disconnect();
}

run();

