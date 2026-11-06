const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const crypto = require('crypto');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'zenhotel@gmail.com' });
  console.log('Zen hotel user:', user);
  const hash = crypto.createHash('sha256').update('user1234').digest('hex');
  console.log('Hash matches:', user.password === hash);
  await mongoose.disconnect();
}
main().catch(console.error);
