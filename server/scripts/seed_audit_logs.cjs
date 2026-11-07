const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const initialLogs = [
    {
      timestamp: new Date("2026-11-06T15:08:00.000Z"),
      userId: "usr-admin-01",
      userName: "Provincial Tourism Officer",
      userEmail: "admin@gmail.com",
      role: "Provincial Admin",
      municipality: "Provincial",
      establishmentName: null,
      action: "USER_LOGIN",
      module: "Authentication",
      details: "Provincial Administrator logged in to TurismoTrack Provincial Portal.",
      status: "Success",
      ipAddress: "192.168.1.10",
      createdAt: new Date("2026-11-06T15:08:00.000Z"),
      updatedAt: new Date("2026-11-06T15:08:00.000Z"),
    },
    {
      timestamp: new Date("2026-11-06T14:45:00.000Z"),
      userId: "usr-zen-01",
      userName: "Sallie Fabian",
      userEmail: "zenhotel@gmail.com",
      role: "Accommodation Manager",
      municipality: "Bayombong",
      establishmentName: "Zen Hotel Bayombong",
      action: "SUBMIT_FORM",
      module: "Submissions",
      details: "Submitted official FORM A DAE-1B monthly statistical report for October 2026: 5,182 guests, 2,229 room-nights.",
      status: "Success",
      ipAddress: "120.28.175.42",
      createdAt: new Date("2026-11-06T14:45:00.000Z"),
      updatedAt: new Date("2026-11-06T14:45:00.000Z"),
    },
    {
      timestamp: new Date("2026-11-06T14:30:00.000Z"),
      userId: "usr-zen-01",
      userName: "Sallie Fabian",
      userEmail: "zenhotel@gmail.com",
      role: "Accommodation Manager",
      municipality: "Bayombong",
      establishmentName: "Zen Hotel Bayombong",
      action: "SUBMIT_FORM",
      module: "Submissions",
      details: "Submitted official Convention Utilization Survey (CUS Form) for October 2026: 73 MICE events, 2,399 attendees.",
      status: "Success",
      ipAddress: "120.28.175.42",
      createdAt: new Date("2026-11-06T14:30:00.000Z"),
      updatedAt: new Date("2026-11-06T14:30:00.000Z"),
    },
    {
      timestamp: new Date("2026-11-06T13:10:00.000Z"),
      userId: "usr-muni-bay-01",
      userName: "Bayombong Tourism Officer",
      userEmail: "tourism@bayombong.gov.ph",
      role: "Municipality Admin",
      municipality: "Bayombong",
      establishmentName: null,
      action: "USER_LOGIN",
      module: "Authentication",
      details: "Municipal Tourism Officer logged in to Bayombong Tourism Office Portal.",
      status: "Success",
      ipAddress: "112.198.110.15",
      createdAt: new Date("2026-11-06T13:10:00.000Z"),
      updatedAt: new Date("2026-11-06T13:10:00.000Z"),
    },
    {
      timestamp: new Date("2026-11-06T12:22:00.000Z"),
      userId: "usr-wilwin-01",
      userName: "WILWIN HOTEL Front Desk",
      userEmail: "wilwinhotel@gmail.com",
      role: "establishment",
      municipality: "Bayombong",
      establishmentName: "WILWIN HOTEL",
      action: "VISITOR_CHECKIN",
      module: "Visitors",
      details: "Recorded tourist guest batch check-in (October 2026 arrivals) totaling 410 visitors.",
      status: "Success",
      ipAddress: "124.106.14.88",
      createdAt: new Date("2026-11-06T12:22:00.000Z"),
      updatedAt: new Date("2026-11-06T12:22:00.000Z"),
    },
    {
      timestamp: new Date("2026-11-06T11:45:00.000Z"),
      userId: "usr-zen-01",
      userName: "Sallie Fabian",
      userEmail: "zenhotel@gmail.com",
      role: "Accommodation Manager",
      municipality: "Bayombong",
      establishmentName: "Zen Hotel Bayombong",
      action: "USER_LOGIN",
      module: "Authentication",
      details: "Duty Manager Sallie Fabian signed in to Establishment Portal.",
      status: "Success",
      ipAddress: "120.28.175.42",
      createdAt: new Date("2026-11-06T11:45:00.000Z"),
      updatedAt: new Date("2026-11-06T11:45:00.000Z"),
    },
    {
      timestamp: new Date("2026-11-06T11:40:00.000Z"),
      userId: "usr-zen-01",
      userName: "Zen Hotel Bayombong",
      userEmail: "zenhotel@gmail.com",
      role: "establishment",
      municipality: "Bayombong",
      establishmentName: "Zen Hotel Bayombong",
      action: "REGISTER_ESTABLISHMENT",
      module: "Establishments",
      details: "Registered new accommodation establishment: Zen Hotel Bayombong (Category: Hotel, Rooms: 245).",
      status: "Success",
      ipAddress: "120.28.175.42",
      createdAt: new Date("2026-11-06T11:40:00.000Z"),
      updatedAt: new Date("2026-11-06T11:40:00.000Z"),
    },
    {
      timestamp: new Date("2026-11-06T11:30:00.000Z"),
      userId: "usr-admin-01",
      userName: "Provincial Tourism Officer",
      userEmail: "admin@gmail.com",
      role: "Provincial Admin",
      municipality: "Provincial",
      establishmentName: null,
      action: "EXPORT_REPORT",
      module: "Reports",
      details: "Exported Provincial Tourism Consolidated Report (CSV & PDF format).",
      status: "Success",
      ipAddress: "192.168.1.10",
      createdAt: new Date("2026-11-06T11:30:00.000Z"),
      updatedAt: new Date("2026-11-06T11:30:00.000Z"),
    },
    {
      timestamp: new Date("2026-11-06T10:00:00.000Z"),
      userId: "usr-admin-01",
      userName: "Provincial Tourism Officer",
      userEmail: "admin@gmail.com",
      role: "Provincial Admin",
      municipality: "Provincial",
      establishmentName: "PTCAO Nueva Vizcaya",
      action: "SYSTEM_EVENT",
      module: "System",
      details: "System database initialized and verified. Ready for live tourism tracking.",
      status: "Success",
      ipAddress: "192.168.1.10",
      createdAt: new Date("2026-11-06T10:00:00.000Z"),
      updatedAt: new Date("2026-11-06T10:00:00.000Z"),
    }
  ];

  for (const log of initialLogs) {
    const exists = await db.collection("auditlogs").findOne({
      action: log.action,
      details: log.details,
    });
    if (!exists) {
      await db.collection("auditlogs").insertOne(log);
      console.log(`Inserted audit log: [${log.action}] ${log.details.substring(0, 50)}...`);
    } else {
      console.log(`Log already exists: [${log.action}]`);
    }
  }

  const count = await db.collection("auditlogs").countDocuments();
  console.log(`Total audit logs in Atlas: ${count}`);

  await mongoose.disconnect();
}
main().catch(console.error);
