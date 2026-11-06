const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const subs = await db.collection("submissions").find({}).toArray();
  subs.forEach((s, i) => {
    console.log(`${i+1}. formType: ${s.formType}, name: ${s.name || s.establishmentName}, muni: ${s.municipality}, visitors: ${s.visitors}, status: ${s.status}`);
  });

  await mongoose.disconnect();
}
main().catch(console.error);

