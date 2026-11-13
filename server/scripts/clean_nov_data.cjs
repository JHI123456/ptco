const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb+srv://austineilarde_db_user:mCtQskHpGcVqkBP9@turismotrack.8eu32lw.mongodb.net/turismo_track?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  console.log('1. Cleaning up Establishments collection...');
  await db.collection('establishments').updateOne(
    { name: /zen hotel/i },
    {
      $set: {
        totalVisitors: 5182,
        visitorsThisMonth: 0,
        status: 'Active',
        category: 'Hotel',
        type: 'Hotel',
        updatedAt: new Date()
      }
    }
  );

  await db.collection('establishments').updateOne(
    { name: /wilwin/i },
    {
      $set: {
        totalVisitors: 410,
        visitorsThisMonth: 0,
        status: 'Active',
        updatedAt: new Date()
      }
    }
  );

  console.log('2. Updating Bayombong LGU stats...');
  await db.collection('lgus').updateOne(
    { name: /bayombong/i },
    {
      $set: {
        totalVisitors: 5592,
        visitorsThisMonth: 0,
        foreignMice: 17,
        'intel.currentHeadcount': '5,592 / 1,800',
        updatedAt: new Date()
      }
    }
  );

  console.log('3. Fixing Zen Hotel Form A submission metadata...');
  await db.collection('submissions').updateOne(
    { _id: new mongoose.Types.ObjectId('6aedcd85342f6e5734ff6f08') },
    {
      $set: {
        reportingMonth: 10,
        reportingMonthName: 'October',
        reportingPeriod: 'October 2026',
        reportingYear: 2026,
        'formData.reportingMonth': 10,
        'formData.reportMonth': 10,
        'formData.month': 10,
        'formData.reportingMonthName': 'October',
        'formData.reportingPeriod': 'October 2026',
        'formData.reportingYear': 2026,
        'formData.year': 2026,
        visitors: 5182,
        status: 'Approved'
      }
    }
  );

  console.log('4. Archiving CUS MICE submission from regular room arrivals...');
  await db.collection('submissions').updateOne(
    { _id: new mongoose.Types.ObjectId('6aedcd85342f6e5734ff6f09') },
    {
      $set: {
        formType: 'CUS MICE FORM',
        status: 'Archived',
        isMice: true,
        reportingMonth: 10,
        reportingPeriod: 'October 2026'
      }
    }
  );

  console.log('5. Verifying any November checkins in Bayombong...');
  const novCheckins = await db.collection('checkins').find({
    $or: [{ municipality: /bayombong/i }, { municipalityId: /bayombong/i }],
    $or: [
      { arrivalDate: /^2026-11/ },
      { date: /^2026-11/ },
      { reportingMonth: 11 }
    ]
  }).toArray();
  console.log('Found November checkins:', novCheckins.length);
  if (novCheckins.length > 0) {
    const ids = novCheckins.map(c => c._id);
    await db.collection('checkins').deleteMany({ _id: { $in: ids } });
    console.log('Deleted November checkins:', ids);
  }

  console.log('Done!');
  await mongoose.disconnect();
}

run().catch(console.error);

