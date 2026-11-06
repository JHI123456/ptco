const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const establishments = await db.collection("establishments").find({}).toArray();
  const checkins = await db.collection("checkins").find({}).toArray();
  const dae2forms = await db.collection("dae2forms").find({}).toArray();
  const submissions = await db.collection("submissions").find({}).toArray();
  const lgus = await db.collection("lgus").find({}).toArray();

  console.log('Establishments count:', establishments.length);
  console.log('Checkins count:', checkins.length);
  console.log('dae2forms count:', dae2forms.length);
  console.log('submissions count:', submissions.length);
  console.log('lgus count:', lgus.length);

  // Check bayombong checkins
  const bayombongCheckins = checkins.filter(c => (c.municipality || '').toLowerCase() === 'bayombong');
  const sumBayCheckins = bayombongCheckins.reduce((s, c) => s + (Number(c.totalVisitors) || 0), 0);
  console.log('Bayombong checkins count:', bayombongCheckins.length, 'sum:', sumBayCheckins);

  // Check dae2forms
  const bayDae2 = dae2forms.filter(f => (f.municipality || '').toLowerCase() === 'bayombong');
  console.log('Bayombong dae2forms count:', bayDae2.length);
  bayDae2.forEach(f => console.log('dae2:', f.establishmentName, f.reportingMonth, f.reportingYear, f.totalGuests));

  // Check submissions
  const baySubs = submissions.filter(s => (s.municipality || '').toLowerCase() === 'bayombong');
  console.log('Bayombong submissions count:', baySubs.length);
  baySubs.forEach(s => console.log('sub:', s.formType, s.establishmentName, s.visitors, s.status));

  // What is in lgus?
  const bayLgu = lgus.find(l => (l.name || '').toLowerCase() === 'bayombong');
  console.log('Bayombong LGU:', bayLgu?.totalVisitors);

  // What is in establishments?
  const bayEsts = establishments.filter(e => (e.municipality || '').toLowerCase() === 'bayombong');
  bayEsts.forEach(e => console.log('est:', e.name, 'totalVisitors:', e.totalVisitors, 'visitorsThisMonth:', e.visitorsThisMonth));

  await mongoose.disconnect();
}
main().catch(console.error);

