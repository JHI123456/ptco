const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function completeWipe() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  console.log('Found collections:', collections.map(c => c.name));

  for (const col of collections) {
    const colName = col.name;
    if (colName === 'users') {
      // In users collection, delete ALL users except admin@gmail.com
      const res = await db.collection('users').deleteMany({
        email: { $ne: 'admin@gmail.com' }
      });
      console.log(`✓ [users] Deleted ${res.deletedCount} non-admin accounts.`);

      // Ensure admin@gmail.com is properly configured as Provincial Admin
      const adminPassword = 'admin123';
      const hashedPassword = crypto.createHash('sha256').update(adminPassword).digest('hex');

      await db.collection('users').updateOne(
        { email: 'admin@gmail.com' },
        {
          $set: {
            name: 'Provincial Tourism Officer',
            officeName: 'Provincial Tourism and Cultural Affairs Office',
            establishmentName: 'PTCAO Nueva Vizcaya',
            municipality: 'Provincial',
            password: hashedPassword,
            role: 'Provincial Admin',
            portal: 'provincial',
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
      console.log('✓ [users] Ensured admin@gmail.com is Provincial Admin with password admin123.');
    } else {
      // For all other collections (lgus, establishments, checkins, submissions, messages, etc.)
      const res = await db.collection(colName).deleteMany({});
      console.log(`✓ [${colName}] Deleted ${res.deletedCount} documents (collection now empty).`);
    }
  }

  console.log('\n=== FINAL VERIFICATION OF ALL COLLECTIONS ===');
  const afterCollections = await db.listCollections().toArray();
  for (const c of afterCollections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`- ${c.name}: ${count} documents`);
  }

  const remainingUsers = await db.collection('users').find({}).toArray();
  console.log('\n=== REMAINING USERS ===');
  console.log(remainingUsers.map(u => ({ id: u._id, email: u.email, role: u.role, municipality: u.municipality })));

  await mongoose.disconnect();
  console.log('\n🎉 COMPLETE SYSTEM WIPE FINISHED SUCCESSFULLY!');
}

completeWipe().catch(err => {
  console.error('Wipe failed:', err);
  process.exit(1);
});

