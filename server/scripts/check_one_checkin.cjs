const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const checkin = await db.collection('checkins').findOne({ establishmentName: /zen hotel/i });
  console.log('Sample checkin:', checkin);
  await mongoose.disconnect();
}
main().catch(console.error);
