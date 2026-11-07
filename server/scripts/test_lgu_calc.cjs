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
  const submissions = await db.collection("submissions").find({}).toArray();
  const lgus = await db.collection("lgus").find({}).toArray();

  lgus.forEach(lgu => {
    const lguNameLower = (lgu.name || "").toLowerCase().trim();
    const munEsts = establishments.filter(e => (e.municipality || "").toLowerCase().trim() === lguNameLower);
    const munCheckins = checkins.filter(c => (c.municipality || c.municipalityId || "").toLowerCase().trim() === lguNameLower);
    const munSubs = submissions.filter(s => (s.municipality || s.municipalityId || "").toLowerCase().trim() === lguNameLower);

    let lguReconciledTotal = 0;
    const estKeys = new Set([
      ...munEsts.map((e) => (e.name || "").toLowerCase().trim()),
      ...munCheckins.map((c) => (c.establishmentName || "").toLowerCase().trim()),
      ...munSubs.map((s) => (s.establishmentName || "").toLowerCase().trim()),
    ]);
    estKeys.delete("");

    estKeys.forEach(key => {
      const eCheckins = munCheckins.filter(c => (c.establishmentName || "").toLowerCase().trim() === key);
      let chkTotal = 0;
      eCheckins.forEach(c => {
        chkTotal += Number(c.totalVisitors || c.visitors) || ((Number(c.maleCount) || 0) + (Number(c.femaleCount) || 0)) || 1;
      });

      // Filter out CUS / MICE
      const eSubs = munSubs.filter(s =>
        (s.establishmentName || "").toLowerCase().trim() === key &&
        !String(s.formType || "").toUpperCase().includes("CUS") &&
        !String(s.formType || "").toUpperCase().includes("MICE") &&
        !String(s.formType || "").toUpperCase().includes("CONVENTION")
      );
      let formGrandTotal = 0;
      eSubs.forEach((s) => {
        const g = Number(s.formData?.totals?.grandTotal || s.formData?.totalGuests || s.visitors || 0);
        if (g > formGrandTotal) formGrandTotal = g;
      });

      const unique = Math.max(chkTotal, formGrandTotal);
      console.log(`- ${lgu.name} [${key}]: chk=${chkTotal}, form=${formGrandTotal} -> unique=${unique}`);
      lguReconciledTotal += unique;
    });

    console.log(`=> ${lgu.name} Total Reconciled: ${lguReconciledTotal}`);
  });

  await mongoose.disconnect();
}

main().catch(console.error);

