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
    const period = doc.formData?.reportingPeriod || '';
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

    const rMonth = doc.formData?.reportingMonth || doc.reportingMonth;
    const rYear = doc.formData?.reportingYear || doc.reportingYear;
    if (rMonth) {
      const mNum = parseInt(rMonth, 10);
      if (!isNaN(mNum) && mNum >= 1 && mNum <= 12) {
        return {
          month: mNum,
          year: rYear ? parseInt(rYear, 10) : currentYear,
        };
      }
    }

    const dVal = doc.checkInDate || doc.arrivalDate || doc.submittedAt || doc.createdAt || doc.formData?.submittedAt || doc.formData?.date;
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
    status: { $nin: ['rejected', 'cancelled', 'deleted'] },
    formType: { $nin: ['VISITOR CHECK-IN', 'Visitor Check-in', 'CHECKIN'] }
  }).toArray();

  const checkins = await db.collection('checkins').find({
    municipality: /bayombong/i
  }).toArray();

  const monthRange = MONTH_LABELS_SHORT.map((label, idx) => ({
    month: idx + 1,
    label,
    count: 0,
    subs: [],
    chks: []
  }));

  submissions.forEach((sub) => {
    const { month, year } = parseMonthAndYear(sub);
    const count = extractDocMetric(sub);
    if (year === currentYear && month >= 1 && month <= 12) {
      monthRange[month - 1].count += count;
      monthRange[month - 1].subs.push({ est: sub.establishmentName, type: sub.formType, count });
    }
  });

  checkins.forEach((chk) => {
    const { month, year } = parseMonthAndYear(chk);
    const count = extractDocMetric(chk);
    if (year === currentYear && month >= 1 && month <= 12) {
      monthRange[month - 1].count += count;
      monthRange[month - 1].chks.push({ est: chk.establishmentName, count });
    }
  });

  console.log('Month Breakdown:');
  monthRange.forEach(m => {
    if (m.count > 0) {
      console.log(`Month ${m.month} (${m.label}): Total = ${m.count}`);
      console.log('  Subs:', m.subs);
      console.log('  Checkins count:', m.chks.length, 'sum:', m.chks.reduce((s, c) => s + c.count, 0));
    }
  });

  await mongoose.disconnect();
}
run();

