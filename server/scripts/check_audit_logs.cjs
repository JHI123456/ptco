const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const count = await db.collection("auditlogs").countDocuments();
  console.log(`Total auditlogs in collection: ${count}`);

  const recent = await db.collection("auditlogs").find({}).sort({ timestamp: -1, createdAt: -1 }).limit(10).toArray();
  console.log('Recent 10 audit logs:');
  recent.forEach((log, i) => {
    console.log(`${i+1}. [${log.timestamp || log.createdAt}] ${log.action} | User: ${log.userName} (${log.userRole}) | Muni: ${log.municipality} | Est: ${log.establishmentName} | Status: ${log.status} | Details: ${log.details}`);
  });

  // Summary by action
  const actions = await db.collection("auditlogs").aggregate([
    { $group: { _id: "$action", count: { $sum: 1 } } }
  ]).toArray();
  console.log('\nBreakdown by action:');
  actions.forEach(a => console.log(`- ${a._id}: ${a.count}`));

  await mongoose.disconnect();
}
main().catch(console.error);
