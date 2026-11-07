const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb+srv://austineilarde_db_user:mCtQskHpGcVqkBP9@turismotrack.8eu32lw.mongodb.net/turismo_track?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const novSub = await db.collection('submissions').findOne({
    $or: [
      { 'formData.arrivalDate': /2026-11/ },
      { 'formData.date': /2026-11/ },
      { arrivalDate: /2026-11/ },
      { date: /2026-11/ },
      { _id: new mongoose.Types.ObjectId('6aedc3366f01424cf407a8eb') },
      { checkInId: '6aedc3366f01424cf407a8eb' },
      { id: '6aedc3366f01424cf407a8eb' }
    ]
  });

  console.log('November submission:', novSub);

  // Also search for any submission with date 2026-11-25
  const allWilwinSubs = await db.collection('submissions').find({
    establishmentName: /wilwin/i
  }).toArray();
  const subNov = allWilwinSubs.filter(s => JSON.stringify(s).includes('2026-11-25'));
  console.log('Wilwin submission with 2026-11-25:', subNov.length, subNov.map(s => s._id));

  await mongoose.disconnect();
}

run();

