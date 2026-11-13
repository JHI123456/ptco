const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb+srv://austineilarde_db_user:mCtQskHpGcVqkBP9@turismotrack.8eu32lw.mongodb.net/turismo_track?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const subs = await db.collection('submissions').find({
    $or: [{ municipality: /bayombong/i }, { municipalityId: /bayombong/i }]
  }).toArray();

  console.log('Submissions in Bayombong:', subs.length);
  subs.forEach(s => {
    console.log(JSON.stringify({
      id: s._id,
      est: s.establishmentName,
      type: s.formType,
      visitors: s.visitors,
      status: s.status,
      reportingPeriod: s.formData?.reportingPeriod,
      reportingMonth: s.formData?.reportingMonth || s.reportingMonth,
      reportingYear: s.formData?.reportingYear || s.reportingYear,
      submittedAt: s.submittedAt,
      createdAt: s.createdAt
    }, null, 2));
  });

  await mongoose.disconnect();
}
run();

