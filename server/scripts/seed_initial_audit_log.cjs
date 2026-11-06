const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function seedInitialAudit() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const count = await db.collection('auditlogs').countDocuments();
  if (count === 0) {
    const initialLog = {
      timestamp: new Date(),
      userId: null,
      userName: 'Provincial Tourism Officer',
      userEmail: 'admin@gmail.com',
      role: 'Provincial Admin',
      municipality: 'Provincial',
      establishmentName: 'PTCAO Nueva Vizcaya',
      action: 'SYSTEM_EVENT',
      module: 'System',
      details: 'Audit & Activity Trail initialized and activated for Nueva Vizcaya Provincial Tourism system',
      status: 'Success',
      ipAddress: '127.0.0.1',
      metadata: { initializedBy: 'PTCAO Provincial Administrator', version: '2.0.0' },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('auditlogs').insertOne(initialLog);
    console.log('✓ Created initial official audit log entry in auditlogs collection.');
  } else {
    console.log(`ℹ Audit log already contains ${count} entries.`);
  }

  await mongoose.disconnect();
}

seedInitialAudit().catch(console.error);

