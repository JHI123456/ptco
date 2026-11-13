const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb+srv://austineilarde_db_user:mCtQskHpGcVqkBP9@turismotrack.8eu32lw.mongodb.net/turismo_track?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const currentYear = 2026;
  const MONTH_LABELS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTH_NAMES = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

  function parseMonthAndYear(doc) {
    const period = doc.formData?.reportingPeriod || doc.reportingPeriod || '';
    if (period) {
      for (let i = 0; i < MONTH_NAMES.length; i++) {
        if (period.toLowerCase().includes(MONTH_NAMES[i])) {
          const yearMatch = period.match(/\b(20\d\d)\b/);
          return {
            month: i + 1,
            year: yearMatch ? parseInt(yearMatch[1], 10) : currentYear,
          };
        }
      }
    }

    const rMonth = doc.formData?.reportingMonth || doc.reportingMonth || doc.formData?.month || doc.month;
    const rYear = doc.formData?.reportingYear || doc.reportingYear || doc.formData?.year || doc.year;
    if (rMonth) {
      if (typeof rMonth === 'string') {
        const mLower = rMonth.toLowerCase().trim();
        const foundIdx = MONTH_NAMES.indexOf(mLower);
        if (foundIdx >= 0) {
          return {
            month: foundIdx + 1,
            year: rYear ? parseInt(rYear, 10) : currentYear,
          };
        }
      }
      const mNum = parseInt(rMonth, 10);
      if (!isNaN(mNum) && mNum >= 1 && mNum <= 12) {
        return {
          month: mNum,
          year: rYear ? parseInt(rYear, 10) : currentYear,
        };
      }
    }

    const dVal = doc.checkInDate || doc.arrivalDate || doc.date || doc.formData?.arrivalDate || doc.formData?.date || doc.submittedAt || doc.createdAt;
    if (dVal) {
      const d = new Date(dVal);
      if (!isNaN(d.getTime())) {
        return {
          month: d.getMonth() + 1,
          year: d.getFullYear(),
        };
      }
    }

    return {
      month: new Date().getMonth() + 1,
      year: currentYear,
    };
  }

  function extractDocMetric(doc) {
    const isSub = !!doc.formData || !!doc.formType;
    if (isSub) {
      return Number(doc.visitors || doc.formData?.totals?.grandTotal || doc.formData?.grandTotal || doc.formData?.totalVisitors || 0);
    } else {
      return Number(doc.totalVisitors || 1);
    }
  }

  const submissions = await db.collection('submissions').find({
    municipality: /bayombong/i,
    status: { $nin: ['rejected', 'cancelled', 'deleted', 'archived'] },
    formType: { $nin: ['VISITOR CHECK-IN', 'Visitor Check-in', 'CHECKIN', 'CUS FORM', 'CUS MICE FORM', 'CUS', 'CONVENTION'] }
  }).toArray();

  const checkins = await db.collection('checkins').find({
    municipality: /bayombong/i
  }).toArray();

  const monthRange = MONTH_LABELS_SHORT.map((label, idx) => ({
    month: idx + 1,
    label,
    count: 0
  }));

  const monthEsts = Array.from({ length: 12 }, () => ({}));

  submissions.forEach((sub) => {
    const { month, year } = parseMonthAndYear(sub);
    if (year === currentYear && month >= 1 && month <= 12) {
      const estKey = (sub.establishmentName || sub.establishmentId || 'est').trim().toLowerCase();
      if (!monthEsts[month - 1][estKey]) {
        monthEsts[month - 1][estKey] = { sub: 0, chk: 0 };
      }
      monthEsts[month - 1][estKey].sub = Math.max(monthEsts[month - 1][estKey].sub, extractDocMetric(sub));
    }
  });

  checkins.forEach((chk) => {
    const { month, year } = parseMonthAndYear(chk);
    if (year === currentYear && month >= 1 && month <= 12) {
      const estKey = (chk.establishmentName || chk.establishmentId || 'est').trim().toLowerCase();
      if (!monthEsts[month - 1][estKey]) {
        monthEsts[month - 1][estKey] = { sub: 0, chk: 0 };
      }
      monthEsts[month - 1][estKey].chk += extractDocMetric(chk);
    }
  });

  monthRange.forEach((m, idx) => {
    const ests = monthEsts[idx];
    let monthTotal = 0;
    Object.entries(ests).forEach(([est, { sub, chk }]) => {
      const best = Math.max(sub, chk);
      console.log(`Month ${m.month} (${m.label}) - Est "${est}": Sub=${sub}, Chk=${chk} => Best=${best}`);
      monthTotal += best;
    });
    m.count = monthTotal;
  });

  console.log('\nFinal Deduplicated Monthly Trend:');
  monthRange.forEach(m => {
    console.log(`Month ${m.month.toString().padStart(2, ' ')} (${m.label}): ${m.count}`);
  });

  await mongoose.disconnect();
}
run();

