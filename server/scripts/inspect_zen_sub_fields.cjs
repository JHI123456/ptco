const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb+srv://austineilarde_db_user:mCtQskHpGcVqkBP9@turismotrack.8eu32lw.mongodb.net/turismo_track?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const s = await db.collection('submissions').find({ establishmentName: /zen/i }).toArray();
  for (const doc of s) {
    console.log('ID:', doc._id);
    console.log('  formType:', doc.formType);
    console.log('  status:', doc.status);
    console.log('  visitors:', doc.visitors);
    console.log('  reportingPeriod:', doc.reportingPeriod);
    console.log('  reportingMonth:', doc.reportingMonth);
    console.log('  reportingYear:', doc.reportingYear);
    console.log('  submittedAt:', doc.submittedAt);
    console.log('  createdAt:', doc.createdAt);
    console.log('  formData:', doc.formData ? {
      reportingPeriod: doc.formData.reportingPeriod,
      reportingMonth: doc.formData.reportingMonth,
      reportingYear: doc.formData.reportingYear,
      month: doc.formData.month,
      year: doc.formData.year,
      submittedAt: doc.formData.submittedAt,
      date: doc.formData.date
    } : null);
  }
  await mongoose.disconnect();
}
run();

