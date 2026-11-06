const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Daily Filipino visitor array (Day 1 - 31)
const dailyFilipino = [
  205, 198, 70, 89, 268, 183, 238, 199, 135, 137, 69, 143, 156, 166, 224, 231,
  122, 71, 150, 180, 227, 192, 237, 191, 70, 115, 131, 223, 147, 179, 219
];

// Foreign distribution: day -> [{ country, count }]
const foreignByDay = {
  5: [{ country: 'USA', count: 1 }],
  6: [{ country: 'India', count: 1 }],
  10: [{ country: 'India', count: 1 }],
  13: [{ country: 'India', count: 3 }],
  14: [{ country: 'China', count: 1 }],
  17: [{ country: 'USA', count: 1 }],
  19: [{ country: 'Iran', count: 1 }],
  25: [{ country: 'China', count: 1 }],
  27: [{ country: 'India', count: 5 }, { country: 'USA', count: 1 }],
  28: [{ country: 'India', count: 1 }]
};

// Rooms occupied breakdown (October 2026 total: 2,229)
const roomsOccupiedBreakdown = {
  'DLX 1': 233,
  'DLX 2': 166,
  'ECO': 49,
  'PDX 1': 657,
  'PDX 2': 307,
  'PSUI': 9,
  'S1': 69,
  'S2': 10,
  'S3': 76,
  'SUI': 121,
  'SUI 1': 119,
  'SUI 2': 269,
  'SUI 3': 50,
  'FSUI': 94
};
const totalRoomsOccupied = Object.values(roomsOccupiedBreakdown).reduce((a, b) => a + b, 0);

// CUS Events List
const cusEvents = [
  { date: '2026-10-01', name: 'Chatt Duque', hours: 3, classType: 'Private', eventType: 'Birthday', attendees: 20, tel: '9774705101' },
  { date: '2026-10-01', name: 'Josefil Tabora', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 30, tel: 'N/A' },
  { date: '2026-10-01', name: 'Chris Atton', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 15, tel: '9171128365' },
  { date: '2026-10-01', name: 'Unice Fajardo/DOH', hours: 9, classType: 'Government', eventType: 'Meeting', attendees: 56, tel: 'N/A' },
  { date: '2026-10-02', name: 'Joy Ruben/Joyride Motories', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 30, tel: '9605521271' },
  { date: '2026-10-02', name: 'Jervin Tomines', hours: 3, classType: 'Special Occasion', eventType: 'Christening', attendees: 25, tel: '9153168523' },
  { date: '2026-10-02', name: 'Marian Morcilla', hours: 9, classType: 'Private', eventType: 'Meeting', attendees: 63, tel: '9922590348' },
  { date: '2026-10-03', name: 'Jocelyn Laya/Gold DustTrading', hours: 4, classType: 'Private', eventType: 'Meeting', attendees: 30, tel: '9535111610' },
  { date: '2026-10-03', name: 'Marian Morcilla', hours: 5, classType: 'Private', eventType: 'Meeting', attendees: 63, tel: '9922590348' },
  { date: '2026-10-05', name: 'Joaquin Shabach', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 30, tel: '9175714153' },
  { date: '2026-10-05', name: 'Mary Grace Castillo/DKT', hours: 9, classType: 'Private', eventType: 'Dinner', attendees: 30, tel: '9177760056' },
  { date: '2026-10-05', name: 'Ellen Gonzales', hours: 4, classType: 'Special Occasion', eventType: 'Birthday', attendees: 70, tel: '9154814589' },
  { date: '2026-10-06', name: 'Sheryn mundo', hours: 3, classType: 'Special Occasion', eventType: 'Birthday', attendees: 30, tel: '9995826092' },
  { date: '2026-10-06', name: 'Mary Grace Castillo/DKT', hours: 9, classType: 'Private', eventType: 'Meeting', attendees: 30, tel: '9177760056' },
  { date: '2026-10-07', name: 'Junlyn Castillo/Oceana', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 10, tel: '9269315981' },
  { date: '2026-10-07', name: 'Breneth Baguilat', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 30, tel: 'N/A' },
  { date: '2026-10-07', name: 'Jonalyn Pugong', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 30, tel: 'N/A' },
  { date: '2026-10-07', name: 'LGU Bayombong/Mayors Office', hours: 3, classType: 'Government', eventType: 'Meeting', attendees: 30, tel: 'N/A' },
  { date: '2026-10-07', name: 'Patricia Millor', hours: 3, classType: 'Private', eventType: 'Dinner', attendees: 30, tel: '9176731031' },
  { date: '2026-10-07', name: 'Alfa Grabiza', hours: 3, classType: 'Special Occasion', eventType: 'Renewal of Vows', attendees: 40, tel: '9554532386' },
  { date: '2026-10-08', name: 'Wilson Justo', hours: 3, classType: 'Special Occasion', eventType: 'Birthday', attendees: 15, tel: '9279764101' },
  { date: '2026-10-09', name: 'Resty Balinon', hours: 3, classType: 'Private', eventType: 'Lunch', attendees: 30, tel: 'N/A' },
  { date: '2026-10-09', name: 'Lailanie Binbinon/NVAT', hours: 8, classType: 'Private', eventType: 'Workshop', attendees: 20, tel: '9100822581' },
  { date: '2026-10-09', name: 'Iv Gabac/Marlexie Event & Entertainment', hours: 4, classType: 'Private', eventType: 'Recruitment', attendees: 50, tel: '9998566265' },
  { date: '2026-10-10', name: 'Lailanie Binbinon/NVAT', hours: 8, classType: 'Private', eventType: 'Workshop', attendees: 20, tel: '9100822581' },
  { date: '2026-10-10', name: 'Anna Marie Baguatan', hours: 3, classType: 'Special Occasion', eventType: 'Birthday', attendees: 30, tel: '94546694834' },
  { date: '2026-10-10', name: 'Venus Agravante', hours: 3, classType: 'Special Occasion', eventType: 'Birthday', attendees: 30, tel: '9175791925' },
  { date: '2026-10-11', name: 'Benigno Balas', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 30, tel: '927146975' },
  { date: '2026-10-11', name: 'Jonabelle Pascua', hours: 3, classType: 'Special Occasion', eventType: 'Birthday', attendees: 25, tel: '9682450705' },
  { date: '2026-10-12', name: 'Rafael Ilarde', hours: 3, classType: 'Special Occasion', eventType: 'Birthday', attendees: 30, tel: '9175701580' },
  { date: '2026-10-12', name: 'Anna Graneta', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 15, tel: '9209738278' },
  { date: '2026-10-14', name: 'Heather Celestino', hours: 3, classType: 'Special Occasion', eventType: 'Birthday', attendees: 30, tel: 'N/A' },
  { date: '2026-10-15', name: 'Stephanie Benjamin', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 30, tel: 'N/A' },
  { date: '2026-10-15', name: 'Venus Agravante', hours: 3, classType: 'Special Occasion', eventType: 'Birthday', attendees: 30, tel: 'N/A' },
  { date: '2026-10-15', name: 'Kezzia Joy Saguiped', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 15, tel: '9164512100' },
  { date: '2026-10-15', name: 'Bishop Elmer Mangalinao', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 30, tel: 'N/A' },
  { date: '2026-10-16', name: 'Irine Ramos', hours: 3, classType: 'Special Occasion', eventType: 'Wedding', attendees: 40, tel: '9772653433' },
  { date: '2026-10-17', name: 'Fr.Liam Reza Panganiban/CRM', hours: 4, classType: 'Special Occasion', eventType: 'Gathering', attendees: 110, tel: 'N/A' },
  { date: '2026-10-19', name: 'Jury Baguilat/Oceana Gold', hours: 12, classType: 'Private', eventType: 'Meeting', attendees: 75, tel: '09178345604' },
  { date: '2026-10-20', name: 'Junicio Cantor', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 20, tel: '09278418588' },
  { date: '2026-10-20', name: 'Jury Baguilat/Oceana Gold', hours: 12, classType: 'Private', eventType: 'Meeting', attendees: 75, tel: '09178345604' },
  { date: '2026-10-21', name: 'Ryan Aguilar/Agri Supply', hours: 4, classType: 'Private', eventType: 'Product Presentation', attendees: 20, tel: '09178097892' },
  { date: '2026-10-21', name: 'Ryan Aguilar/Agri Supply', hours: 4, classType: 'Private', eventType: 'Product Presentation', attendees: 20, tel: '09178097892' },
  { date: '2026-10-21', name: 'Mary Grace Castillo/DKT', hours: 3, classType: 'Private', eventType: 'Product Presentation', attendees: 10, tel: '09177760056' },
  { date: '2026-10-21', name: 'Gary Mendoza', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 30, tel: '09563959233' },
  { date: '2026-10-21', name: 'Jury Baguilat/Oceana Gold', hours: 12, classType: 'Private', eventType: 'Meeting', attendees: 75, tel: '09178345604' },
  { date: '2026-10-21', name: 'Jannah Aliyah Sambrano', hours: 4, classType: 'Special Occasion', eventType: 'Wedding', attendees: 70, tel: '09756049046' },
  { date: '2026-10-22', name: 'Joey Pineda', hours: 3, classType: 'Special Occasion', eventType: 'Birthday', attendees: 20, tel: '09362507208' },
  { date: '2026-10-22', name: 'Jonathan Cabiso', hours: 3, classType: 'Special Occasion', eventType: 'Dinner', attendees: 15, tel: 'N/A' },
  { date: '2026-10-22', name: 'Jury Baguilat/Oceana Gold', hours: 12, classType: 'Private', eventType: 'Meeting', attendees: 75, tel: '09178345604' },
  { date: '2026-10-22', name: 'Jury Baguilat/Oceana Gold', hours: 12, classType: 'Private', eventType: 'Meeting', attendees: 75, tel: '09178345604' },
  { date: '2026-10-23', name: 'Jury Baguilat/Oceana Gold', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 10, tel: '09178345604' },
  { date: '2026-10-23', name: 'Joana Padua/FCF Minerals', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 20, tel: '09178274331' },
  { date: '2026-10-23', name: 'Mary Anne Pilpil', hours: 3, classType: 'Special Occasion', eventType: 'Birthday', attendees: 30, tel: '09175155428' },
  { date: '2026-10-23', name: 'Jake Zhang', hours: 3, classType: 'Special Occasion', eventType: 'Dinner', attendees: 30, tel: 'N/A' },
  { date: '2026-10-23', name: 'Jury Baguilat/Oceana Gold', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 20, tel: '09178345604' },
  { date: '2026-10-23', name: 'Ricardo Cafirma', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 10, tel: '09338789357' },
  { date: '2026-10-24', name: 'Jury Baguilat/Oceana Gold', hours: 4, classType: 'Private', eventType: 'Meeting', attendees: 32, tel: '09178345604' },
  { date: '2026-10-24', name: 'Lenelee Ananayo/Oceana Gold', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 30, tel: 'N/A' },
  { date: '2026-10-24', name: 'Janice Jallorina', hours: 3, classType: 'Special Occasion', eventType: 'Birthday', attendees: 30, tel: '09159610727' },
  { date: '2026-10-24', name: 'Monina Palparan', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 40, tel: '09053472615' },
  { date: '2026-10-25', name: 'Mary Tan Banih', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 30, tel: 'N/A' },
  { date: '2026-10-26', name: 'Carlo Agustin', hours: 3, classType: 'Special Occasion', eventType: 'Birthday', attendees: 20, tel: '09672184527' },
  { date: '2026-10-27', name: 'Emman/Multi Care', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 25, tel: '09064568846' },
  { date: '2026-10-28', name: 'Susan Mercado', hours: 3, classType: 'Special Occasion', eventType: 'Birthday', attendees: 30, tel: 'N/A' },
  { date: '2026-10-28', name: 'Ariel Medrano', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 10, tel: '0998766930' },
  { date: '2026-10-28', name: 'Erickson Mallari', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 30, tel: 'N/A' },
  { date: '2026-10-29', name: 'Frances Rosete', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 30, tel: 'N/A' },
  { date: '2026-10-30', name: 'Andy Gunid', hours: 3, classType: 'Private', eventType: 'Dinner', attendees: 20, tel: 'N/A' },
  { date: '2026-10-31', name: 'Clark Amayna', hours: 3, classType: 'Special Occasion', eventType: 'Lunch', attendees: 20, tel: 'N/A' },
  { date: '2026-10-31', name: 'Elen Sandiego', hours: 3, classType: 'Special Occasion', eventType: 'Birthday', attendees: 30, tel: 'N/A' },
  { date: '2026-10-31', name: 'Shardrach Danag', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 20, tel: 'N/A' },
  { date: '2026-10-31', name: 'Dr. Rose Ozaeta', hours: 3, classType: 'Private', eventType: 'Meeting', attendees: 30, tel: 'N/A' }
];

async function seedZenHotel() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const defaultPassword = 'user1234';
  const hashedPassword = crypto.createHash('sha256').update(defaultPassword).digest('hex');

  // 1. Create or Update Bayombong Municipality User
  console.log('1. Setting up Bayombong Municipal Account...');
  await db.collection('users').updateOne(
    { email: 'tourism@bayombong.gov.ph' },
    {
      $set: {
        name: 'Bayombong Municipal Tourism Office',
        officeName: 'Bayombong Municipal Tourism Office',
        establishmentName: 'Bayombong Municipal Tourism Office',
        municipality: 'Bayombong',
        establishmentType: 'Municipal Tourism Office',
        email: 'tourism@bayombong.gov.ph',
        password: hashedPassword,
        role: 'Municipality Admin',
        updatedAt: new Date()
      },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  );

  // 2. Create or Update Bayombong LGU Record
  console.log('2. Setting up Bayombong LGU record...');
  await db.collection('lgus').updateOne(
    { name: { $regex: /^Bayombong$/i } },
    {
      $set: {
        name: 'Bayombong',
        district: 'Central',
        districtLabel: 'CENTRAL DISTRICT • 5 Sites',
        badgeColor: 'green',
        quote: '"Capital Town of Educational, Heritage & Ecotourism Splendor"',
        totalVisitors: 5182,
        foreignMice: 17,
        capacityLoad: 52,
        status: 'Optimal',
        statusType: 'optimal',
        officer: 'Bayombong Municipal Tourism Officer',
        officerRole: 'Municipal Tourism Officer',
        flagships: ['Capitol Park & Heritage Complex', 'St. Dominic Cathedral', 'Bangan Hill National Park'],
        intel: {
          registeredSites: 5,
          carryingCapacity: '1,200 visitors / day',
          currentHeadcount: '5,182',
          complianceRating: '100%',
          contactPhone: '+63 (078) 321-2551',
          contactEmail: 'tourism@bayombong.gov.ph'
        },
        updatedAt: new Date()
      },
      $setOnInsert: {
        id: 1,
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  // 3. Create or Update Zen Hotel Bayombong in establishments collection
  console.log('3. Setting up Zen Hotel Bayombong in establishments...');
  const estResult = await db.collection('establishments').findOneAndUpdate(
    { name: { $regex: /^Zen Hotel Bayombong$/i } },
    {
      $set: {
        name: 'Zen Hotel Bayombong',
        registrationNumber: 'REG-2026-0088',
        regNo: 'REG-2026-0088',
        municipality: 'Bayombong',
        district: 'Central',
        districtLabel: 'CENTRAL DISTRICT',
        badgeColor: 'green',
        tagline: 'Premier Hotel & Conference Destination • Bayombong',
        flagships: ['Deluxe Conference Hall', 'Zen Wellness Suite', 'Heritage Cafe'],
        barangay: 'District IV',
        category: 'Hotel',
        type: 'Hotel',
        form: 'DAE-1B',
        contact: '(078) 392-0545 / 0917 123 4567',
        email: 'zenhotel@gmail.com',
        address: 'National Highway, District IV, Bayombong, Nueva Vizcaya',
        description: 'Premier modern accommodation and events destination in the heart of Bayombong.',
        status: 'active',
        visitorsThisMonth: 5182,
        totalVisitors: 5182,
        foreignMice: 17,
        capacityLoad: 48,
        dutyManager: 'Sallie Fabian',
        officer: 'Sallie Fabian (Duty Manager)',
        createdBy: 'zenhotel@gmail.com',
        updatedAt: new Date()
      },
      $setOnInsert: {
        id: 1,
        createdAt: new Date()
      }
    },
    { upsert: true, returnDocument: 'after' }
  );

  const establishmentId = estResult._id || estResult.value?._id || new mongoose.Types.ObjectId();

  // 4. Create or Update Zen Hotel User Account
  console.log('4. Setting up Zen Hotel User login...');
  await db.collection('users').updateOne(
    { email: 'zenhotel@gmail.com' },
    {
      $set: {
        name: 'Zen Hotel Bayombong',
        establishmentName: 'Zen Hotel Bayombong',
        municipality: 'Bayombong',
        establishmentType: 'Hotel',
        category: 'Hotel',
        email: 'zenhotel@gmail.com',
        password: hashedPassword,
        role: 'establishment',
        establishmentId: establishmentId,
        dutyManager: 'Sallie Fabian',
        updatedAt: new Date()
      },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  );

  // 5. Clean prior checkins/submissions for Zen Hotel
  console.log('5. Clearing existing records for Zen Hotel to prevent duplicates...');
  await db.collection('checkins').deleteMany({
    $or: [
      { establishmentName: { $regex: /Zen Hotel/i } },
      { establishmentId: establishmentId }
    ]
  });
  await db.collection('submissions').deleteMany({
    $or: [
      { establishmentName: { $regex: /Zen Hotel/i } },
      { 'formData.establishmentName': { $regex: /Zen Hotel/i } }
    ]
  });
  await db.collection('messages').deleteMany({
    $or: [
      { senderName: { $regex: /Zen Hotel/i } },
      { sender: { $regex: /Zen Hotel/i } }
    ]
  });

  // 6. Generate Checkin records for October 2026 (Day 1 to 31)
  console.log('6. Inserting October 2026 Daily Check-in records...');
  const checkinDocs = [];

  // Calculate proportional overnight distribution for 2,229 room-nights across 31 days
  const totalGuests = 5182;
  const targetOvernight = 2229;

  for (let day = 1; day <= 31; day++) {
    const dayStr = String(day).padStart(2, '0');
    const arrivalDate = `2026-10-${dayStr}`;
    const filipinoCount = dailyFilipino[day - 1];
    const foreignItems = foreignByDay[day] || [];
    const foreignCount = foreignItems.reduce((acc, curr) => acc + curr.count, 0);
    const dayTotal = filipinoCount + foreignCount;

    // Overnight calculation: proportional to day's share of total guests
    const dayOvernight = Math.round((dayTotal / totalGuests) * targetOvernight);

    // Domestic record for the day
    checkinDocs.push({
      establishmentId: establishmentId,
      establishmentName: 'Zen Hotel Bayombong',
      municipality: 'Bayombong',
      municipalityId: 'Bayombong',
      establishmentCategory: 'Hotel',
      establishmentSubType: 'Hotel',
      guestName: `Domestic Arrivals - Oct ${dayStr}`,
      residenceStatus: 'Domestic visitor',
      classificationType: 'Domestic',
      country: 'Philippines',
      province: 'Nueva Vizcaya',
      city: 'Bayombong (Capital)',
      cityMunicipality: 'Bayombong (Capital)',
      maleCount: Math.round(filipinoCount * 0.52),
      femaleCount: filipinoCount - Math.round(filipinoCount * 0.52),
      totalVisitors: filipinoCount,
      purpose: 'Leisure / vacation',
      stayType: dayOvernight > 0 ? 'Overnight' : 'Same-day visitor',
      lengthOfStay: dayOvernight > 0 ? '1 night' : 'Same-day visitor',
      isOvernight: dayOvernight > 0,
      nights: dayOvernight > 0 ? 1 : 0,
      arrivalDate: arrivalDate,
      departureDate: arrivalDate,
      reportingMonth: 10,
      reportingYear: 2026,
      status: 'official',
      createdAt: new Date(`2026-10-${dayStr}T10:00:00Z`),
      visitors: filipinoCount
    });

    // Foreign records for the day (if any)
    for (const f of foreignItems) {
      checkinDocs.push({
        establishmentId: establishmentId,
        establishmentName: 'Zen Hotel Bayombong',
        municipality: 'Bayombong',
        municipalityId: 'Bayombong',
        establishmentCategory: 'Hotel',
        establishmentSubType: 'Hotel',
        guestName: `Foreign Traveler (${f.country}) - Oct ${dayStr}`,
        residenceStatus: 'Foreign visitor',
        classificationType: 'Foreign',
        country: f.country,
        province: 'Non-Philippine Resident',
        city: f.country,
        cityMunicipality: f.country,
        maleCount: Math.ceil(f.count / 2),
        femaleCount: Math.floor(f.count / 2),
        totalVisitors: f.count,
        purpose: 'Leisure / vacation',
        stayType: 'Overnight',
        lengthOfStay: '1 night',
        isOvernight: true,
        nights: 1,
        arrivalDate: arrivalDate,
        departureDate: arrivalDate,
        reportingMonth: 10,
        reportingYear: 2026,
        status: 'official',
        createdAt: new Date(`2026-10-${dayStr}T14:30:00Z`),
        visitors: f.count
      });
    }
  }

  await db.collection('checkins').insertMany(checkinDocs);
  console.log(`✓ Inserted ${checkinDocs.length} daily checkin records (5,165 Filipino, 17 Foreign, 5,182 Total).`);

  // 7. Insert Official Form A DAE-1B Submission
  console.log('7. Inserting Official Form A DAE-1B Submission...');
  const dae1bSubmission = {
    formType: 'FORM A DAE-1B',
    establishmentId: establishmentId,
    establishmentName: 'Zen Hotel Bayombong',
    municipality: 'Bayombong',
    municipalityId: 'Bayombong',
    reportingPeriod: 'October 2026',
    reportingMonth: 'October',
    reportingYear: 2026,
    status: 'Approved',
    isLocked: true,
    visitors: 5182,
    totalGuests: 5182,
    domesticArrival: 5165,
    foreignArrival: 17,
    overseasArrival: 0,
    roomsOccupied: 2229,
    preparedBy: 'Sallie Fabian',
    dutyManager: 'Sallie Fabian',
    designation: 'Duty Manager',
    formData: {
      establishmentName: 'Zen Hotel Bayombong',
      municipality: 'Bayombong',
      province: 'Nueva Vizcaya',
      region: '02',
      typeOfAccommodation: 'Hotel',
      reportingMonth: 'October',
      reportingYear: 2026,
      dailyFilipino: dailyFilipino,
      totalFilipino: 5165,
      foreignByDay: foreignByDay,
      totalForeign: 17,
      grandTotal: 5182,
      foreignBreakdown: {
        China: 2,
        India: 11,
        Iran: 1,
        USA: 3
      },
      roomsOccupied: roomsOccupiedBreakdown,
      totalRoomsOccupied: totalRoomsOccupied,
      preparedBy: 'Sallie Fabian',
      position: 'Duty Manager'
    },
    submittedAt: new Date('2026-11-01T08:00:00Z'),
    reviewedAt: new Date('2026-11-01T10:00:00Z'),
    reviewedBy: 'Bayombong Tourism Officer',
    remarks: 'Approved. Official compliance statistics for October 2026 verified.',
    createdAt: new Date('2026-11-01T08:00:00Z'),
    updatedAt: new Date('2026-11-01T10:00:00Z')
  };

  const dae1bSubRes = await db.collection('submissions').insertOne(dae1bSubmission);

  // Also insert into dae2forms for direct analytics compatibility
  await db.collection('dae2forms').updateOne(
    { establishmentName: 'Zen Hotel Bayombong', reportingMonth: 'October', reportingYear: 2026 },
    {
      $set: {
        establishmentName: 'Zen Hotel Bayombong',
        establishmentId: establishmentId,
        municipality: 'Bayombong',
        reportingMonth: 'October',
        reportingYear: 2026,
        domesticArrival: 5165,
        foreignArrival: 17,
        overseasArrival: 0,
        totalGuests: 5182,
        roomsOccupied: 2229,
        status: 'Approved',
        submittedAt: new Date('2026-11-01T08:00:00Z'),
        createdAt: new Date('2026-11-01T08:00:00Z')
      }
    },
    { upsert: true }
  );

  // 8. Insert Official CUS Form Submission (Convention Utilization Survey)
  console.log('8. Inserting Official CUS Form Submission (50+ events)...');
  const cusTourEntries = cusEvents.map((e, idx) => ({
    id: `cus-zen-${idx + 1}`,
    no: idx + 1,
    date: e.date,
    arrivalDate: e.date,
    description: e.name,
    eventName: e.name,
    noOfDays: 1,
    hours: e.hours,
    classification: e.classType,
    type: e.eventType,
    eventType: e.eventType,
    purpose: e.eventType,
    attendees: e.attendees,
    maleCount: Math.ceil(e.attendees / 2),
    femaleCount: Math.floor(e.attendees / 2),
    totalVisitors: e.attendees,
    origin: 'Nueva Vizcaya / Region II',
    contactPerson: e.tel,
    remarks: `Hours: ${e.hours}h | Tel: ${e.tel}`
  }));

  const totalCusAttendees = cusEvents.reduce((sum, e) => sum + e.attendees, 0);

  const cusSubmission = {
    formType: 'CUS FORM',
    establishmentId: establishmentId,
    establishmentName: 'Zen Hotel Bayombong',
    municipality: 'Bayombong',
    municipalityId: 'Bayombong',
    reportingPeriod: 'October 2026',
    reportingMonth: 'October',
    reportingYear: 2026,
    status: 'Approved',
    isLocked: true,
    totalEvents: cusEvents.length,
    totalAttendees: totalCusAttendees,
    visitors: totalCusAttendees,
    preparedBy: 'Sallie Fabian',
    dutyManager: 'Sallie Fabian',
    designation: 'Duty Manager',
    formData: {
      establishmentName: 'Zen Hotel Bayombong',
      municipality: 'Bayombong',
      cityProvince: 'Bayombong, Nueva Vizcaya',
      month: 'October',
      year: 2026,
      reportingPeriod: 'October 2026',
      totalEvents: cusEvents.length,
      totalAttendees: totalCusAttendees,
      tourEntries: cusTourEntries,
      entries: cusTourEntries,
      preparedBy: 'Sallie Fabian',
      position: 'Duty Manager'
    },
    submittedAt: new Date('2026-11-01T09:30:00Z'),
    reviewedAt: new Date('2026-11-01T10:30:00Z'),
    reviewedBy: 'Bayombong Tourism Officer',
    remarks: `Approved. ${cusEvents.length} convention and social events recorded for October 2026.`,
    createdAt: new Date('2026-11-01T09:30:00Z'),
    updatedAt: new Date('2026-11-01T10:30:00Z')
  };

  const cusSubRes = await db.collection('submissions').insertOne(cusSubmission);

  // 9. Insert Messages for Municipal & Provincial Inbox
  console.log('9. Creating Inbox message records...');
  await db.collection('messages').insertMany([
    {
      senderId: establishmentId,
      senderName: 'Zen Hotel Bayombong',
      sender: 'Zen Hotel Bayombong',
      senderRole: 'Accommodation Manager',
      recipientId: 'admin',
      recipientName: 'Bayombong Tourism Officer',
      recipient: 'Bayombong Tourism Officer',
      subject: 'DAE-1B (Manual) Filing: Zen Hotel Bayombong - October 2026',
      body: 'Official DOT DAE-1B monthly report submitted for October 2026. Total guest arrivals: 5,182 (5,165 Domestic, 17 Foreign). Total room occupancy: 2,229.',
      type: 'submission',
      category: 'submission',
      formType: 'FORM A DAE-1B',
      status: 'Approved',
      isRead: true,
      readBy: ['Bayombong Tourism Officer'],
      municipality: 'Bayombong',
      submissionId: dae1bSubRes.insertedId,
      visitors: 5182,
      formData: dae1bSubmission.formData,
      createdAt: new Date('2026-11-01T08:00:00Z'),
      updatedAt: new Date('2026-11-01T10:00:00Z')
    },
    {
      senderId: establishmentId,
      senderName: 'Zen Hotel Bayombong',
      sender: 'Zen Hotel Bayombong',
      senderRole: 'Accommodation Manager',
      recipientId: 'admin',
      recipientName: 'Bayombong Tourism Officer',
      recipient: 'Bayombong Tourism Officer',
      subject: 'Convention Utilization Survey (CUS): Zen Hotel Bayombong - October 2026',
      body: `Official Convention Utilization Survey (CUS) submitted for October 2026. Total meetings/events recorded: ${cusEvents.length}. Total attendees: ${totalCusAttendees}.`,
      type: 'submission',
      category: 'submission',
      formType: 'CUS FORM',
      status: 'Approved',
      isRead: true,
      readBy: ['Bayombong Tourism Officer'],
      municipality: 'Bayombong',
      submissionId: cusSubRes.insertedId,
      visitors: totalCusAttendees,
      formData: cusSubmission.formData,
      createdAt: new Date('2026-11-01T09:30:00Z'),
      updatedAt: new Date('2026-11-01T10:30:00Z')
    }
  ]);

  // 10. Record Audit Trail
  console.log('10. Recording Audit Logs in auditlogs collection...');
  await db.collection('auditlogs').insertMany([
    {
      timestamp: new Date('2026-10-31T20:00:00Z'),
      userName: 'Zen Hotel Bayombong',
      userEmail: 'zenhotel@gmail.com',
      role: 'establishment',
      municipality: 'Bayombong',
      establishmentName: 'Zen Hotel Bayombong',
      action: 'ESTABLISHMENT_REGISTER',
      module: 'Establishments',
      details: 'Registered new accommodation establishment: Zen Hotel Bayombong (Category: Hotel)',
      status: 'Success',
      ipAddress: '127.0.0.1',
      metadata: { registrationNumber: 'REG-2026-0088', municipality: 'Bayombong' },
      createdAt: new Date('2026-10-31T20:00:00Z'),
      updatedAt: new Date('2026-10-31T20:00:00Z')
    },
    {
      timestamp: new Date('2026-11-01T08:00:00Z'),
      userName: 'Sallie Fabian (Duty Manager)',
      userEmail: 'zenhotel@gmail.com',
      role: 'establishment',
      municipality: 'Bayombong',
      establishmentName: 'Zen Hotel Bayombong',
      action: 'SUBMIT_FORM',
      module: 'Submissions',
      details: 'Submitted official FORM A DAE-1B monthly statistical report for October 2026: 5,182 guests, 2,229 room-nights',
      status: 'Success',
      ipAddress: '127.0.0.1',
      metadata: { formType: 'FORM A DAE-1B', reportingPeriod: 'October 2026', totalVisitors: 5182 },
      createdAt: new Date('2026-11-01T08:00:00Z'),
      updatedAt: new Date('2026-11-01T08:00:00Z')
    },
    {
      timestamp: new Date('2026-11-01T09:30:00Z'),
      userName: 'Sallie Fabian (Duty Manager)',
      userEmail: 'zenhotel@gmail.com',
      role: 'establishment',
      municipality: 'Bayombong',
      establishmentName: 'Zen Hotel Bayombong',
      action: 'SUBMIT_FORM',
      module: 'Submissions',
      details: `Submitted official Convention Utilization Survey (CUS Form) for October 2026: ${cusEvents.length} events, ${totalCusAttendees} attendees`,
      status: 'Success',
      ipAddress: '127.0.0.1',
      metadata: { formType: 'CUS FORM', reportingPeriod: 'October 2026', totalEvents: cusEvents.length, totalAttendees: totalCusAttendees },
      createdAt: new Date('2026-11-01T09:30:00Z'),
      updatedAt: new Date('2026-11-01T09:30:00Z')
    }
  ]);

  console.log('\n=== VERIFICATION SUMMARY ===');
  const userCount = await db.collection('users').countDocuments();
  const estCount = await db.collection('establishments').countDocuments();
  const lguCount = await db.collection('lgus').countDocuments();
  const checkinCount = await db.collection('checkins').countDocuments();
  const subCount = await db.collection('submissions').countDocuments();
  const msgCount = await db.collection('messages').countDocuments();
  const auditCount = await db.collection('auditlogs').countDocuments();

  console.log(`- users: ${userCount}`);
  console.log(`- establishments: ${estCount}`);
  console.log(`- lgus: ${lguCount}`);
  console.log(`- checkins: ${checkinCount}`);
  console.log(`- submissions: ${subCount}`);
  console.log(`- messages: ${msgCount}`);
  console.log(`- auditlogs: ${auditCount}`);

  await mongoose.disconnect();
  console.log('\n🎉 ZEN HOTEL BAYOMBONG OFFICIALLY SEEDED SUCCESSFULLY!');
}

seedZenHotel().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});

