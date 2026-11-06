const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const lgus = await db.collection('lgus').find({}).toArray();
  console.log('=== LGUS ===\n', JSON.stringify(lgus, null, 2));
  const users = await db.collection('users').find({}).toArray();
  console.log('=== USERS ===\n', JSON.stringify(users.map(u => ({ id: u._id, email: u.email, role: u.role, municipality: u.municipality })), null, 2));
  await mongoose.disconnect();
}
inspect().catch(console.error);

