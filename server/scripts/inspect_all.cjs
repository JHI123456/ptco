const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function inspectAll() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const users = await db.collection('users').find({}).toArray();
  console.log('=== USERS ===');
  console.log(users.map(u => ({ id: u._id, email: u.email, role: u.role, municipality: u.municipality, createdAt: u.createdAt })));

  const lgus = await db.collection('lgus').find({}).toArray();
  console.log('=== LGUS ===');
  console.log(lgus.map(l => ({ id: l._id, name: l.name, totalVisitors: l.totalVisitors, createdAt: l.createdAt })));

  const establishments = await db.collection('establishments').find({}).toArray();
  console.log('=== ESTABLISHMENTS ===');
  console.log(establishments.map(e => ({ id: e._id, name: e.name, municipality: e.municipality, createdAt: e.createdAt })));

  const submissions = await db.collection('submissions').find({}).toArray();
  console.log('=== SUBMISSIONS ===');
  console.log(submissions.map(s => ({ id: s._id, formType: s.formType, municipality: s.municipality, createdAt: s.createdAt })));

  await mongoose.disconnect();
}

inspectAll().catch(console.error);
