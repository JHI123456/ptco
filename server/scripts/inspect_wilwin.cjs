const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function inspectWilwin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const est = await db.collection('establishments').findOne({ name: /wilwin/i });
  console.log('=== WILWIN HOTEL ESTABLISHMENT ===\n', JSON.stringify(est, null, 2));

  const user = await db.collection('users').findOne({ email: /willwin|wilwin/i });
  console.log('=== WILWIN HOTEL USER ===\n', JSON.stringify(user, null, 2));

  await mongoose.disconnect();
}

inspectWilwin().catch(console.error);

