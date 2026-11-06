const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function updateAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const res = await db.collection('users').updateOne(
    { email: 'admin@gmail.com' },
    { $set: { municipality: 'Provincial', officeName: 'Provincial Tourism and Cultural Affairs Office' } }
  );

  console.log('Update result:', res);
  const users = await db.collection('users').find({}, { projection: { email: 1, role: 1, municipality: 1 } }).toArray();
  console.log('Users in DB:', users);

  await mongoose.disconnect();
}

updateAdmin().catch(console.error);

