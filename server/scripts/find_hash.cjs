const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function findHash() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const users = await db.collection('users').find({}).toArray();
  console.log('=== USERS IN DB ===');
  for (const u of users) {
    console.log(`Email: ${u.email}`);
    console.log(`Password in DB: ${u.password}`);
  }

  // Check all collections for the string
  const target = '831c237928e6212bedaa4451a514ace3174562f6761f6a157a2fe5082b36e2f';
  console.log('Target string:', target);
  console.log('Target length:', target.length);

  const cols = await db.listCollections().toArray();
  for (const col of cols) {
    const docs = await db.collection(col.name).find({
      $or: [
        { password: { $regex: target, $options: 'i' } },
        { _id: target }
      ]
    }).toArray();
    if (docs.length > 0) {
      console.log(`Found in collection ${col.name}:`, docs);
    }
  }

  await mongoose.disconnect();
}

findHash().catch(console.error);

