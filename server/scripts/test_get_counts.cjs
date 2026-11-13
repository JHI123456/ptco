const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb+srv://austineilarde_db_user:mCtQskHpGcVqkBP9@turismotrack.8eu32lw.mongodb.net/turismo_track?retryWrites=true&w=majority';

class MetricCount {
  constructor(total = 0, extra = {}) {
    this.total = Number(total) || 0;
    this.today = Number(extra.today ?? 0) || 0;
    this.yesterday = Number(extra.yesterday ?? 0) || 0;
    this.week = Number(extra.week ?? 0) || 0;
    this.month = Number(extra.month ?? 0) || 0;
    this.foreign = Number(extra.foreign ?? 0) || 0;
    this.foreignToday = Number(extra.foreignToday ?? 0) || 0;
  }
}

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const targetMunicipality = 'Bayombong';
  const matchClause = {
    $or: [
      { municipality: new RegExp('^' + targetMunicipality.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&').replace(/ñ/gi, '[nñ]') + '$', 'i') },
      { municipalityId: new RegExp('^' + targetMunicipality.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&').replace(/ñ/gi, '[nñ]') + '$', 'i') }
    ]
  };

  const map = new Map();
  const now = new Date();
  const curY = now.getFullYear();
  const curM = String(now.getMonth() + 1).padStart(2, '0');
  const curD = String(now.getDate()).padStart(2, '0');
  const todayStr = `${curY}-${curM}-${curD}`;
  const todayDateString = now.toDateString();

  const yestDate = new Date(now);
  yestDate.setDate(yestDate.getDate() - 1);
  const yestStr = `${yestDate.getFullYear()}-${String(yestDate.getMonth() + 1).padStart(2, '0')}-${String(yestDate.getDate()).padStart(2, '0')}`;

  const weekDate = new Date(now);
  weekDate.setDate(weekDate.getDate() - 7);

  const checkins = await db.collection('checkins').find(matchClause).toArray();
  const estBreakdowns = {};

  checkins.forEach((c) => {
    const idKey = c.establishmentId ? String(c.establishmentId) : null;
    const nameKey = c.establishmentName ? String(c.establishmentName).trim().toLowerCase() : null;
    const count = Number(c.totalVisitors || ((Number(c.maleCount || 0) + Number(c.femaleCount || 0))) || 1);
    const arr = (c.arrivalDate || '').trim();
    const created = new Date(c.createdAt || Date.now());
    const isToday = arr === todayStr || created.toDateString() === todayDateString;
    const isYest = arr === yestStr;
    const isWk = created >= weekDate;
    const isMo = created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    const isForeign = (c.classificationType || c.residenceStatus || '').toLowerCase().includes('foreign') ||
      ((Number(c.foreignCountryTotal) || 0) + (Number(c.foreignResidenceTotal) || 0) > 0);

    const keys = [idKey, nameKey].filter(Boolean);
    for (const k of keys) {
      if (!estBreakdowns[k]) {
        estBreakdowns[k] = { checkinTotal: 0, formTotal: 0, miceTotal: 0, today: 0, yesterday: 0, week: 0, month: 0, foreign: 0, foreignToday: 0 };
      }
      estBreakdowns[k].checkinTotal += count;
      if (isToday) {
        estBreakdowns[k].today += count;
        if (isForeign) estBreakdowns[k].foreignToday += count;
      }
      if (isYest) estBreakdowns[k].yesterday += count;
      if (isWk) estBreakdowns[k].week += count;
      if (isMo) estBreakdowns[k].month += count;
      if (isForeign) estBreakdowns[k].foreign += count;
    }
  });

  const subFilter = {
    ...matchClause,
    formType: { $nin: ['VISITOR CHECK-IN', 'Visitor Check-in', 'CHECKIN'] }
  };
  const submissions = await db.collection('submissions').find(subFilter).toArray();
  submissions.forEach((s) => {
    let total = Number(s.visitors) || 0;
    const fType = String(s.formType || '').toUpperCase();
    const isCusOrMice = fType.includes('CUS') || fType.includes('CONVENTION') || fType.includes('MICE');
    const idKey = s.establishmentId ? String(s.establishmentId) : null;
    const nameKey = s.establishmentName ? String(s.establishmentName).trim().toLowerCase() : null;
    const keys = [idKey, nameKey].filter(Boolean);
    for (const k of keys) {
      if (!estBreakdowns[k]) {
        estBreakdowns[k] = { checkinTotal: 0, formTotal: 0, miceTotal: 0, today: 0, yesterday: 0, week: 0, month: 0, foreign: 0, foreignToday: 0 };
      }
      if (isCusOrMice) {
        estBreakdowns[k].miceTotal += total;
      } else {
        estBreakdowns[k].formTotal = Math.max(estBreakdowns[k].formTotal, total);
      }
    }
  });

  for (const [k, v] of Object.entries(estBreakdowns)) {
    const reconciledTotal = Math.max(v.checkinTotal, v.formTotal);
    const finalToday = v.today > 0 ? v.today : 0;
    const finalWeek = v.week > 0 ? v.week : 0;
    const finalMonth = v.month > 0 ? v.month : 0;
    map.set(k, new MetricCount(reconciledTotal, {
      today: finalToday,
      yesterday: v.yesterday,
      week: finalWeek,
      month: finalMonth,
      foreign: v.foreign,
      foreignToday: v.foreignToday,
    }));
  }

  console.log('Keys in map:');
  for (const [k, v] of map.entries()) {
    console.log(`Key "${k}": total=${v.total}, month=${v.month}, today=${v.today}, week=${v.week}`);
  }

  const establishments = await db.collection('establishments').find(matchClause).toArray();
  let totalVisitorsThisMonth = 0;
  let totalVisitorsAllTime = 0;
  establishments.forEach((est) => {
    const normName = (est.name || '').toLowerCase().trim();
    const estId = String(est._id);
    const mCount = map.get(estId) || map.get(normName);
    if (mCount) {
      totalVisitorsThisMonth += Number(mCount.month || 0);
      totalVisitorsAllTime += Number(mCount.total || 0);
    } else {
      totalVisitorsThisMonth += Number(est.visitorsThisMonth || 0);
      totalVisitorsAllTime += Number(est.totalVisitors || 0);
    }
  });

  console.log(`\nAggregated: totalVisitorsThisMonth=${totalVisitorsThisMonth}, totalVisitorsAllTime=${totalVisitorsAllTime}`);

  await mongoose.disconnect();
}
run();

