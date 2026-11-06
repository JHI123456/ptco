const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function removeMunicipalityAndAdmins() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // 1. Remove all municipality admin users (keeping only Provincial admin)
  const userDeleteRes = await db.collection('users').deleteMany({
    $or: [
      { role: { $regex: /municipality/i } },
      { email: { $in: ['tourism@bayombong.gov.ph', 'tourism@dupaxdelnorte.gov.ph'] } },
      { municipality: { $ne: 'Provincial' } }
    ]
  });
  console.log(`✓ Deleted ${userDeleteRes.deletedCount} municipality admin users.`);

  // 2. Remove all documents in lgus collection
  const lguDeleteRes = await db.collection('lgus').deleteMany({});
  console.log(`✓ Deleted ${lguDeleteRes.deletedCount} LGUs.`);

  // 3. Clear any remaining submissions, establishments, checkins, messages, forms just in case
  const collections = [
    'lgus',
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

  for (const name of collections) {
    const count = await db.collection(name).countDocuments();
    console.log(`Collection ${name}: ${count} documents`);
  }

  // 4. Print remaining users
  const remainingUsers = await db.collection('users').find({}).toArray();
  console.log('\n=== REMAINING ACTIVE USERS IN DB ===');
  console.log(remainingUsers.map(u => ({ id: u._id, email: u.email, role: u.role, municipality: u.municipality })));

  await mongoose.disconnect();
  console.log('\n✅ Successfully removed all municipalities and municipality admins!');
}

removeMunicipalityAndAdmins().catch(console.error);
