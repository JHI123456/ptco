import React, { useState, useMemo, useEffect } from "react";
import {
  Building2,
  Users,
  BedDouble,
  AlertTriangle,
  Search,
  ChevronDown,
  User,
  X
} from "lucide-react";
import "./MonitoredEstablishments.css";
import { fetchEstablishments } from "../services/api";

const ESTABLISHMENTS_DATA = [
  {
    id: 1,
    name: "Highlander Hotel & Resort",
    district: "Central",
    districtLabel: "CENTRAL DISTRICT • 94 Rooms",
    badgeColor: "blue",
    municipality: "Solano",
    category: "Hotels & Resorts",
    tagline: '"Premier Executive Hospitality, Convention Pavilion & Mountain Vista"',
    totalVisitors: 36420,
    foreignMice: 2450,
    capacityLoad: 68,
    status: "Optimal",
    statusType: "optimal",
    officer: "Eleanor M. Valerio",
    officerRole: "General Manager",
    flagships: [
      "Grand Ballroom (400 pax)",
      "Lagoon Pool",
      "DOT Star-Accredited",
      "Helipad & Executive Lounge",
      "Solano Restaurant Strip"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-HOT-2026-0042",
      validity: "Valid until Dec 2027",
      dailyCarryingLimit: "1,200 guests / day",
      currentOccupancy: "816 / 1,200",
      roomInventory: "94 Rooms (88% booked)",
      parkingSlots: "85 Vehicles",
      peakDays: "Friday – Sunday",
      complianceScore: "99.2%",
      address: "National Highway, Brgy. Quirino, Solano, Nueva Vizcaya",
      contactPhone: "+63 (078) 326-5000",
      contactEmail: "reservations@highlanderhotel.ph"
    }
  },
  {
    id: 2,
    name: "Balai Gloria Forest Resort",
    district: "Central",
    districtLabel: "CENTRAL DISTRICT • 62 Villas",
    badgeColor: "green",
    municipality: "Solano",
    category: "Hotels & Resorts",
    tagline: '"Lush Forest Sanctuary, Pavilion Celebrations & Tropical Lagoon"',
    totalVisitors: 31890,
    foreignMice: 1940,
    capacityLoad: 62,
    status: "Optimal",
    statusType: "optimal",
    officer: "Rodrigo T. Gonzales",
    officerRole: "Operations Lead",
    flagships: [
      "Garden Pavilion (300 pax)",
      "Forest Cabanas",
      "Olympic Lap Pool",
      "Botanical Trails",
      "Wedding Grounds"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-RES-2026-0018",
      validity: "Valid until Oct 2027",
      dailyCarryingLimit: "950 guests / day",
      currentOccupancy: "589 / 950",
      roomInventory: "62 Forest Villas (76% booked)",
      parkingSlots: "60 Vehicles",
      peakDays: "Saturday – Sunday",
      complianceScore: "98.5%",
      address: "Brgy. San Luis, Solano, Nueva Vizcaya",
      contactPhone: "+63 (078) 326-7221",
      contactEmail: "info@balaigloriaresort.com"
    }
  },
  {
    id: 3,
    name: "Lower Magat Eco-Tourism Haven",
    district: "North",
    districtLabel: "NORTH DISTRICT • 40 Cabins",
    badgeColor: "blue",
    municipality: "Diadi",
    category: "Eco & Agri-Tourism",
    tagline: '"Flagship Forest Lake Lodging, Eco-Trails & Biodiversity Sanctuary"',
    totalVisitors: 42542,
    foreignMice: 2200,
    capacityLoad: 64,
    status: "Optimal",
    statusType: "optimal",
    officer: "Eduardo G. Santos",
    officerRole: "Ecotourism Director",
    flagships: [
      "Lower Magat Eco-Tourism Park (LMETP)",
      "Lake Forest Trails",
      "Magat Nature Reserve",
      "Floating Balsa Suites"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-ECO-2026-0005",
      validity: "Valid until Mar 2028",
      dailyCarryingLimit: "1,500 visitors / day",
      currentOccupancy: "960 / 1,500",
      roomInventory: "40 Eco-Cabins & Cottages",
      parkingSlots: "120 Vehicles & Tour Buses",
      peakDays: "Weekends & Holidays",
      complianceScore: "100%",
      address: "LMETP Sanctuary, San Luis, Diadi, Nueva Vizcaya",
      contactPhone: "+63 (078) 392-1108",
      contactEmail: "ecotourism@diadi-nv.gov.ph"
    }
  },
  {
    id: 4,
    name: "Governor's Garden Hotel",
    district: "Central",
    districtLabel: "CENTRAL DISTRICT • 54 Suites",
    badgeColor: "purple",
    municipality: "Bayombong",
    category: "Hotels & Resorts",
    tagline: '"Historic Provincial Capital Stay & Executive MICE Function Center"',
    totalVisitors: 27650,
    foreignMice: 1820,
    capacityLoad: 58,
    status: "Optimal",
    statusType: "optimal",
    officer: "Ma. Teresa D. Ramos",
    officerRole: "General Manager",
    flagships: [
      "Executive Boardrooms",
      "Veranda Garden Cafe",
      "Provincial Capitol Heritage Walk",
      "Boutique Wellness Spa"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-HOT-2026-0089",
      validity: "Valid until Aug 2027",
      dailyCarryingLimit: "800 guests / day",
      currentOccupancy: "464 / 800",
      roomInventory: "54 Executive Suites (70% booked)",
      parkingSlots: "50 Vehicles",
      peakDays: "Tuesday – Friday (MICE peak)",
      complianceScore: "97.8%",
      address: "Capitol Compound, Bayombong, Nueva Vizcaya",
      contactPhone: "+63 (078) 321-2488",
      contactEmail: "frontdesk@governorsgardenhotel.ph"
    }
  },
  {
    id: 5,
    name: "Palaisdaan Restaurant & Resort",
    district: "North",
    districtLabel: "NORTH DISTRICT • 18 Pavilions",
    badgeColor: "amber",
    municipality: "Bagabag",
    category: "Dining & Gastronomy",
    tagline: '"Renowned Freshwater Gastronomy, Floating Dining & Family Leisure"',
    totalVisitors: 29310,
    foreignMice: 1480,
    capacityLoad: 78,
    status: "High Load",
    statusType: "high-load",
    officer: "Danilo C. Corpuz",
    officerRole: "Managing Proprietor",
    flagships: [
      "Floating Bamboo Pavilions",
      "Fresh Catch Tilapia Station",
      "Vizcaya Culinary Garden",
      "Highway Resto-Circuit"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-RES-2026-0112",
      validity: "Valid until Nov 2026",
      dailyCarryingLimit: "850 diners / day",
      currentOccupancy: "663 / 850",
      roomInventory: "18 Day Pavilions & Huts",
      parkingSlots: "75 Vehicles",
      peakDays: "Friday – Sunday Lunch",
      complianceScore: "96.4%",
      address: "Maharlika Highway, Bagabag, Nueva Vizcaya",
      contactPhone: "+63 (078) 332-2114",
      contactEmail: "palaisdaan.bagabag@gmail.com"
    }
  },
  {
    id: 6,
    name: "Capisaan Eco-Lodge & Adventure Base",
    district: "South",
    districtLabel: "SOUTH DISTRICT • 28 Homestays",
    badgeColor: "amber",
    municipality: "Kasibu",
    category: "Eco & Agri-Tourism",
    tagline: '"Subterranean Expedition Gateway & Spelunkers Eco-Haven"',
    totalVisitors: 27516,
    foreignMice: 2702,
    capacityLoad: 62,
    status: "Optimal",
    statusType: "optimal",
    officer: "Aida D. Bumidang",
    officerRole: "Senior Tourism Officer",
    flagships: [
      "Capisaan Cave System Terminal",
      "Spelunker Base Camp",
      "Malabing Valley Citrus Farms",
      "Edralin Agri-Trek Lodges"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-ECO-2026-0033",
      validity: "Valid until Jan 2028",
      dailyCarryingLimit: "600 spelunkers / day",
      currentOccupancy: "372 / 600",
      roomInventory: "28 Homestays & Chalets",
      parkingSlots: "40 4x4 Vehicles",
      peakDays: "Thursday – Sunday",
      complianceScore: "99.0%",
      address: "Capisaan Spelunking Park, Kasibu, Nueva Vizcaya",
      contactPhone: "+63 917 554 8920",
      contactEmail: "tourism@kasibu.gov.ph"
    }
  },
  {
    id: 7,
    name: "Solano Plaza Hotel & Convention Pavilion",
    district: "Central",
    districtLabel: "CENTRAL DISTRICT • 65 Rooms",
    badgeColor: "green",
    municipality: "Solano",
    category: "MABUHAY ACCOMPUDATIONS",
    tagline: '"Premier Commerce, Convention, and MICE Hospitality Hub"',
    totalVisitors: 28753,
    foreignMice: 1800,
    capacityLoad: 57,
    status: "Optimal",
    statusType: "optimal",
    officer: "Carlos V. Dela Cruz",
    officerRole: "Operations Supervisor",
    flagships: [
      "Solano Plaza Hotel & Convention Pavilion",
      "Bintawan Commercial District",
      "Food Tourism Strip",
      "Grand Exhibition Ballroom"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-MICE-2026-0012",
      validity: "Valid until Sep 2027",
      dailyCarryingLimit: "1,400 pax / day",
      currentOccupancy: "798 / 1,400",
      roomInventory: "65 Hotel Rooms (72% booked)",
      parkingSlots: "110 Vehicles",
      peakDays: "Weekday Conventions & Weekend Galas",
      complianceScore: "98.9%",
      address: "Gaddang Street, Solano, Nueva Vizcaya",
      contactPhone: "+63 (078) 326-8890",
      contactEmail: "events@solanoplazahotel.com"
    }
  },
  {
    id: 8,
    name: "Malabing Valley Citrus Leisure Farm",
    district: "South",
    districtLabel: "SOUTH DISTRICT • 22 Units",
    badgeColor: "amber",
    municipality: "Kasibu",
    category: "Eco & Agri-Tourism",
    tagline: '"Citrus Capital Agritourism Sanctuary & Fresh Harvest Experience"',
    totalVisitors: 23840,
    foreignMice: 1510,
    capacityLoad: 86,
    status: "Peak Capacity",
    statusType: "peak-capacity",
    officer: "Benito K. Linggayo",
    officerRole: "Agri-Tourism Lead",
    flagships: [
      "Satsuma & Ponkan Picking Groves",
      "Citrus Wine Cellar Tour",
      "Farm-to-Table Kitchen",
      "Valley View Glamping"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-AGR-2026-0007",
      validity: "Valid until Jun 2027",
      dailyCarryingLimit: "700 visitors / day",
      currentOccupancy: "602 / 700",
      roomInventory: "22 Glamping Safari Tents",
      parkingSlots: "55 Vehicles",
      peakDays: "Harvest Season (Sept – Jan)",
      complianceScore: "97.0%",
      address: "Malabing Valley, Kasibu, Nueva Vizcaya",
      contactPhone: "+63 920 887 6412",
      contactEmail: "malabingfarms@gmail.com"
    }
  },
  {
    id: 9,
    name: "Tam-An Mountain Resort",
    district: "Central",
    districtLabel: "CENTRAL DISTRICT • 45 Suites",
    badgeColor: "green",
    municipality: "Bayombong",
    category: "Hotels & Resorts",
    tagline: '"Highland Panorama Retreat, Spring Swimming & Wellness Haven"',
    totalVisitors: 22940,
    foreignMice: 1120,
    capacityLoad: 54,
    status: "Optimal",
    statusType: "optimal",
    officer: "Nestor F. Galvez",
    officerRole: "Resort Manager",
    flagships: [
      "Highland Spring Pools",
      "Panoramic View Deck",
      "Bantay Lakay Trail Gateway",
      "Vizcaya Native Grill"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-RES-2026-0074",
      validity: "Valid until Apr 2027",
      dailyCarryingLimit: "900 guests / day",
      currentOccupancy: "486 / 900",
      roomInventory: "45 Mountain Chalets",
      parkingSlots: "70 Vehicles",
      peakDays: "Saturday & Sunday",
      complianceScore: "98.1%",
      address: "Busilac, Bayombong, Nueva Vizcaya",
      contactPhone: "+63 (078) 321-4309",
      contactEmail: "tamanmountainresort@gmail.com"
    }
  },
  {
    id: 10,
    name: "Sanctuary Mountain Glamping & Pine Ridge",
    district: "South",
    districtLabel: "SOUTH DISTRICT • 20 Domes",
    badgeColor: "amber",
    municipality: "Santa Fe",
    category: "Eco & Agri-Tourism",
    tagline: '"Mist-Shrouded Pine Haven, Mountain Pass Overlook & Organic Retreat"',
    totalVisitors: 18210,
    foreignMice: 1340,
    capacityLoad: 88,
    status: "Peak Capacity",
    statusType: "peak-capacity",
    officer: "Francis S. Villanueva",
    officerRole: "Sanctuary Host",
    flagships: [
      "Heated Geodesic Domes",
      "Highland Coffee Tasting Lab",
      "Cloud-Sea Sunken Deck",
      "Dalton Pass Heritage Trail"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-GLM-2026-0002",
      validity: "Valid until Jan 2028",
      dailyCarryingLimit: "350 guests / day",
      currentOccupancy: "308 / 350",
      roomInventory: "20 Geodesic Domes (100% booked)",
      parkingSlots: "35 Vehicles",
      peakDays: "Friday – Sunday Nights",
      complianceScore: "99.5%",
      address: "Imugan Ridge, Santa Fe, Nueva Vizcaya",
      contactPhone: "+63 918 349 9011",
      contactEmail: "stay@sanctuarysantafe.ph"
    }
  },
  {
    id: 11,
    name: "Meaco Hotel Solano",
    district: "Central",
    districtLabel: "CENTRAL DISTRICT • 48 Rooms",
    badgeColor: "blue",
    municipality: "Solano",
    category: "Hotels & Resorts",
    tagline: '"Central Business District Comfort Stay & Commercial Accessibility"',
    totalVisitors: 19450,
    foreignMice: 980,
    capacityLoad: 73,
    status: "Optimal",
    statusType: "optimal",
    officer: "Grace L. Fernandez",
    officerRole: "Operations Officer",
    flagships: [
      "Fiber High-Speed WiFi Lounge",
      "24/7 Security & Concierge",
      "DOT Two-Star Standard",
      "Commercial District Proximity"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-HOT-2026-0063",
      validity: "Valid until May 2027",
      dailyCarryingLimit: "450 guests / day",
      currentOccupancy: "328 / 450",
      roomInventory: "48 Modern Guestrooms",
      parkingSlots: "30 Vehicles",
      peakDays: "Monday – Thursday (Corporate)",
      complianceScore: "96.8%",
      address: "Mabini St, Brgy. Poblacion, Solano, Nueva Vizcaya",
      contactPhone: "+63 (078) 326-6190",
      contactEmail: "solano@meacohotels.com"
    }
  },
  {
    id: 12,
    name: "Bintawan Ridge Eco-Lodge & Cafe",
    district: "Central",
    districtLabel: "CENTRAL DISTRICT • 12 Chalets",
    badgeColor: "green",
    municipality: "Villaverde",
    category: "Dining & Gastronomy",
    tagline: '"Panoramic Valley Horizon, Native Vizcayano Cuisine & Ridge Trekking"',
    totalVisitors: 15320,
    foreignMice: 720,
    capacityLoad: 52,
    status: "Optimal",
    statusType: "optimal",
    officer: "Luzviminda P. Dizon",
    officerRole: "Managing Partner",
    flagships: [
      "Overhang Sunset Terrace",
      "Native Vizcaya Smoked Delicacies",
      "Ridge Hiking Viewpoint",
      "Specialty Robusta Coffee Bar"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-DIN-2026-0049",
      validity: "Valid until Dec 2027",
      dailyCarryingLimit: "500 guests / day",
      currentOccupancy: "260 / 500",
      roomInventory: "12 Ridge Chalets",
      parkingSlots: "45 Vehicles",
      peakDays: "Saturday – Sunday Sunset",
      complianceScore: "98.0%",
      address: "Bintawan Sur Ridge, Villaverde, Nueva Vizcaya",
      contactPhone: "+63 929 441 3320",
      contactEmail: "bintawanridge@villaverde.ph"
    }
  },
  {
    id: 13,
    name: "Aritao Highway Traveler's Inn & Oasis",
    district: "South",
    districtLabel: "SOUTH DISTRICT • 32 Rooms",
    badgeColor: "amber",
    municipality: "Aritao",
    category: "Hotels & Resorts",
    tagline: '"Strategic Highway Stopover, Mountain Vista & Modern Hospitality"',
    totalVisitors: 16840,
    foreignMice: 890,
    capacityLoad: 56,
    status: "Optimal",
    statusType: "optimal",
    officer: "Renato D. Morales",
    officerRole: "Tourism Director",
    flagships: [
      "Highway Traveler Resto-Hub",
      "Spacious Transit Bus Parking",
      "DOT Standard Accommodation",
      "Banga-Banga Mountain Overlook"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-INN-2026-0021",
      validity: "Valid until Nov 2027",
      dailyCarryingLimit: "600 guests / day",
      currentOccupancy: "336 / 600",
      roomInventory: "32 Rooms (70% booked)",
      parkingSlots: "50 Vehicles",
      peakDays: "Friday – Sunday",
      complianceScore: "97.5%",
      address: "Maharlika Highway, Aritao, Nueva Vizcaya",
      contactPhone: "+63 (078) 362-0145",
      contactEmail: "travelersinn@aritao.ph"
    }
  },
  {
    id: 14,
    name: "Salinas Springs Nature Resort & Spa",
    district: "South",
    districtLabel: "SOUTH DISTRICT • 26 Chalets",
    badgeColor: "amber",
    municipality: "Bambang",
    category: "Hotels & Resorts",
    tagline: '"Mineral Salt Spring Heritage, Agro-Trading Haven & Eco-Wellness"',
    totalVisitors: 17920,
    foreignMice: 950,
    capacityLoad: 61,
    status: "Optimal",
    statusType: "optimal",
    officer: "Teresa J. Panganiban",
    officerRole: "Operations Manager",
    flagships: [
      "Thermal Mineral Spring Pools",
      "NVAT Agri-Trading Proximity",
      "Native Bamboo Cottages",
      "Forest Wellness Deck"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-RES-2026-0095",
      validity: "Valid until Aug 2027",
      dailyCarryingLimit: "700 guests / day",
      currentOccupancy: "427 / 700",
      roomInventory: "26 Forest Chalets",
      parkingSlots: "45 Vehicles",
      peakDays: "Weekends & Trading Days",
      complianceScore: "98.2%",
      address: "Brgy. Salinas, Bambang, Nueva Vizcaya",
      contactPhone: "+63 (078) 362-5201",
      contactEmail: "salinassprings@bambang.gov.ph"
    }
  },
  {
    id: 15,
    name: "Isinay Heritage Cultural Lodge",
    district: "South",
    districtLabel: "SOUTH DISTRICT • 18 Lodges",
    badgeColor: "amber",
    municipality: "Dupax del Norte",
    category: "Eco & Agri-Tourism",
    tagline: '"Indigenous Living Heritage, Weaving Sanctuaries & River Haven"',
    totalVisitors: 11450,
    foreignMice: 680,
    capacityLoad: 48,
    status: "Optimal",
    statusType: "optimal",
    officer: "Mark Anthony Liban",
    officerRole: "Heritage Coordinator",
    flagships: [
      "Isinay Weaving Demonstrations",
      "Belance Vegetable Agro-Trek",
      "Oyao River Nature Campsite",
      "Cultural Ancestral Pavilion"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-ECO-2026-0044",
      validity: "Valid until Sep 2027",
      dailyCarryingLimit: "450 visitors / day",
      currentOccupancy: "216 / 450",
      roomInventory: "18 Cultural Lodges",
      parkingSlots: "30 Vehicles",
      peakDays: "Saturday – Sunday",
      complianceScore: "99.0%",
      address: "Poblacion, Dupax del Norte, Nueva Vizcaya",
      contactPhone: "+63 927 410 8892",
      contactEmail: "isinayheritage@dupaxdelnorte.gov.ph"
    }
  },
  {
    id: 16,
    name: "Runruno Cloud Ridge Basecamp",
    district: "North",
    districtLabel: "NORTH DISTRICT • 15 Campsites",
    badgeColor: "blue",
    municipality: "Quezon",
    category: "Eco & Agri-Tourism",
    tagline: '"Highland Mountain Ridge, Waterfalls Circuit & Forest Basecamp"',
    totalVisitors: 10240,
    foreignMice: 520,
    capacityLoad: 53,
    status: "Optimal",
    statusType: "optimal",
    officer: "Arnel M. Guinto",
    officerRole: "Eco-Park Host",
    flagships: [
      "Runruno Highland Vista Decks",
      "Bintawan Waterfalls Trailhead",
      "Mt. Palali Expedition Command",
      "Stargazing Glamping Pods"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-ECO-2026-0056",
      validity: "Valid until Oct 2027",
      dailyCarryingLimit: "400 mountaineers / day",
      currentOccupancy: "212 / 400",
      roomInventory: "15 Eco Pods & Tents",
      parkingSlots: "25 4x4 Vehicles",
      peakDays: "Dry Season & Weekends",
      complianceScore: "97.4%",
      address: "Runruno Ridge, Quezon, Nueva Vizcaya",
      contactPhone: "+63 919 452 7701",
      contactEmail: "runrunobasecamp@quezon-nv.gov.ph"
    }
  },
  {
    id: 17,
    name: "Mt. Ugo Pine Breeze Alpine Lodge",
    district: "South",
    districtLabel: "SOUTH DISTRICT • 24 Chalets",
    badgeColor: "amber",
    municipality: "Kayapa",
    category: "Hotels & Resorts",
    tagline: '"Cool Alpine Mountain Retreat, Organic Berries & Summit Trails"',
    totalVisitors: 9850,
    foreignMice: 490,
    capacityLoad: 50,
    status: "Optimal",
    statusType: "optimal",
    officer: "Benigno T. Bugtong",
    officerRole: "Alpine Lodge Manager",
    flagships: [
      "Mt. Ugo Trekking Portal",
      "Pingkian Highland Fruit Orchards",
      "Pine-Scents Fireplace Lounge",
      "Sunrise Sea-of-Clouds Deck"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-RES-2026-0081",
      validity: "Valid until Dec 2027",
      dailyCarryingLimit: "450 guests / day",
      currentOccupancy: "225 / 450",
      roomInventory: "24 Alpine Chalets",
      parkingSlots: "35 Vehicles",
      peakDays: "Friday – Sunday",
      complianceScore: "98.7%",
      address: "Poblacion, Kayapa, Nueva Vizcaya",
      contactPhone: "+63 928 650 3314",
      contactEmail: "mtugolodge@kayapa.ph"
    }
  },
  {
    id: 18,
    name: "San Vicente Colonial Heritage Inn",
    district: "South",
    districtLabel: "SOUTH DISTRICT • 16 Suites",
    badgeColor: "amber",
    municipality: "Dupax del Sur",
    category: "Hotels & Resorts",
    tagline: '"18th-Century Historical Splendor, Dampol Heritage & Tranquil Garden"',
    totalVisitors: 8740,
    foreignMice: 430,
    capacityLoad: 44,
    status: "Optimal",
    statusType: "optimal",
    officer: "Consuelo V. Dancel",
    officerRole: "Heritage Caretaker",
    flagships: [
      "St. Vincent Ferrer Church Access",
      "Dampol Red Brick Bridge Circuit",
      "Heritage Cafe & Courtyard",
      "Carolotan Rock Tours"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-INN-2026-0038",
      validity: "Valid until Jan 2028",
      dailyCarryingLimit: "350 visitors / day",
      currentOccupancy: "154 / 350",
      roomInventory: "16 Heritage Suites",
      parkingSlots: "25 Vehicles",
      peakDays: "Pilgrim & Heritage Weekends",
      complianceScore: "99.3%",
      address: "Heritage Zone, Dupax del Sur, Nueva Vizcaya",
      contactPhone: "+63 (078) 392-2055",
      contactEmail: "heritageinn@dupaxdelsur.ph"
    }
  },
  {
    id: 19,
    name: "Casecnan Watershed Ecotourism Base",
    district: "South",
    districtLabel: "SOUTH DISTRICT • 14 Cabins",
    badgeColor: "amber",
    municipality: "Alfonso Castañeda",
    category: "Eco & Agri-Tourism",
    tagline: '"Pristine Riverfront Sanctuary, Reservoir Eco-Cruises & Wild Trails"',
    totalVisitors: 6920,
    foreignMice: 290,
    capacityLoad: 38,
    status: "Optimal",
    statusType: "optimal",
    officer: "Jaime R. Estacio",
    officerRole: "Sanctuary Warden",
    flagships: [
      "Casecnan Protected River Cruise",
      "Canili & Diayo Dam Eco-Tours",
      "Pelaway Waterfalls Trek",
      "Angler Kayak Station"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-ECO-2026-0062",
      validity: "Valid until Mar 2028",
      dailyCarryingLimit: "300 visitors / day",
      currentOccupancy: "114 / 300",
      roomInventory: "14 Eco-Cabins",
      parkingSlots: "20 Vehicles",
      peakDays: "Saturday – Sunday",
      complianceScore: "98.0%",
      address: "Canili Eco-Park, Alfonso Castañeda, Nueva Vizcaya",
      contactPhone: "+63 930 221 8490",
      contactEmail: "casecnanbase@alfonsocastaneda.ph"
    }
  },
  {
    id: 20,
    name: "Ambaguio Cloud Haven & Arabica Farm",
    district: "Central",
    districtLabel: "CENTRAL DISTRICT • 12 Chalets",
    badgeColor: "green",
    municipality: "Ambaguio",
    category: "Eco & Agri-Tourism",
    tagline: '"Skyline Mount Pulag Gateway, Specialty Arabica Coffee & Sea of Clouds"',
    totalVisitors: 6150,
    foreignMice: 260,
    capacityLoad: 35,
    status: "Optimal",
    statusType: "optimal",
    officer: "Melchor G. Dulnuan",
    officerRole: "Mountaineering Guide",
    flagships: [
      "Mt. Pulag Ambaguio Trail Portal",
      "Bayninan Ancient Rice Terraces",
      "Single-Origin Coffee Roastery",
      "Highland Sky Deck"
    ],
    intel: {
      dotAccreditation: "DOT-RO2-ECO-2026-0077",
      validity: "Valid until May 2028",
      dailyCarryingLimit: "250 mountaineers / day",
      currentOccupancy: "88 / 250",
      roomInventory: "12 Cloud Chalets",
      parkingSlots: "20 4x4 Vehicles",
      peakDays: "Climbing Season (Nov – May)",
      complianceScore: "99.6%",
      address: "Poblacion, Ambaguio, Nueva Vizcaya",
      contactPhone: "+63 917 889 0043",
      contactEmail: "cloudhaven@ambaguio.ph"
    }
  }
];

const MonitoredEstablishments = () => {
  const [establishments, setEstablishments] = useState(ESTABLISHMENTS_DATA);
  const [isLiveMongo, setIsLiveMongo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Most Visitors");

  useEffect(() => {
    let isMounted = true;
    fetchEstablishments().then((data) => {
      if (isMounted && data && data.length > 0) {
        setEstablishments(data);
        setIsLiveMongo(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered and sorted establishments
  const filteredData = useMemo(() => {
    return establishments.filter((est) => {
      // Search filter
      const matchesSearch =
        searchQuery.trim() === "" ||
        est.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        est.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        est.officer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        est.flagships.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));

      // District filter
      const matchesDistrict =
        selectedDistrict === "All" || est.district === selectedDistrict;

      // Category filter
      const matchesCategory =
        selectedCategory === "All" || est.category === selectedCategory;

      return matchesSearch && matchesDistrict && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === "Most Visitors") return b.totalVisitors - a.totalVisitors;
      if (sortBy === "Highest Load") return b.capacityLoad - a.capacityLoad;
      if (sortBy === "Alphabetical") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [establishments, searchQuery, selectedDistrict, selectedCategory, sortBy]);

  // Summary KPI counts based on dataset
  const totalMonitored = `${establishments.length} / ${establishments.length + 4}`;
  const totalProvinceGuests = "184,320";
  const activeRooms = "2,450";
  const capacityAlertsCount = establishments.filter(
    (e) => e.capacityLoad >= 80
  ).length;

  return (
    <div className="monitored-est-wrapper">
      {/* 4 TOP SUMMARY METRIC CARDS */}
      <div className="est-summary-grid">
        {/* Card 1: Monitored Establishments */}
        <div className="est-summary-card">
          <div className="est-card-header">
            <span className="est-metric-label">MONITORED ESTABLISHMENTS</span>
            <div className="est-icon-badge green">
              <Building2 size={18} />
            </div>
          </div>
          <div className="est-metric-number">{totalMonitored}</div>
          <div className="est-metric-sub green-sub">
            97.2% Active Reporting (Hotels, Resorts, Dining)
          </div>
        </div>

        {/* Card 2: Total Registered Guests */}
        <div className="est-summary-card">
          <div className="est-card-header">
            <span className="est-metric-label">TOTAL REGISTERED GUESTS</span>
            <div className="est-icon-badge blue">
              <Users size={18} />
            </div>
          </div>
          <div className="est-metric-number">{totalProvinceGuests}</div>
          <div className="est-metric-sub blue-sub">
            7.4% Foreign &amp; MICE Delegations
          </div>
        </div>

        {/* Card 3: Active Rooms & Spaces */}
        <div className="est-summary-card">
          <div className="est-card-header">
            <span className="est-metric-label">ACTIVE ROOMS &amp; SPACES</span>
            <div className="est-icon-badge purple">
              <BedDouble size={18} />
            </div>
          </div>
          <div className="est-metric-number">{activeRooms}</div>
          <div className="est-metric-sub purple-sub">
            Suites, Eco-Cottages, Function Halls
          </div>
        </div>

        {/* Card 4: Capacity Alerts */}
        <div className="est-summary-card">
          <div className="est-card-header">
            <span className="est-metric-label">CAPACITY ALERTS</span>
            <div className="est-icon-badge amber">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="est-metric-number">{capacityAlertsCount}</div>
          <div className="est-metric-sub amber-sub">
            Establishments with &gt;80% Peak Weekend Load
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS BAR */}
      <div className="est-controls-card">
        {/* Left: Search input */}
        <div className="est-search-box">
          <Search size={18} className="est-search-icon" />
          <input
            type="text"
            className="est-search-input"
            placeholder="Search establishment (e.g. Highlander, Balai Gloria, Governor's Garden) or municipality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="est-clear-search"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Right: Filters & Sorter */}
        <div className="est-filters-cluster">
          {/* District Filter */}
          <div className="est-filter-group">
            <span className="est-filter-label">District:</span>
            <div className="est-pill-group">
              {["All", "North", "Central", "South"].map((dist) => (
                <button
                  key={dist}
                  type="button"
                  className={`est-pill-btn ${selectedDistrict === dist ? "active" : ""
                    }`}
                  onClick={() => setSelectedDistrict(dist)}
                >
                  {dist}
                </button>
              ))}
            </div>
          </div>

          <div className="est-filter-separator" />

          {/* Sort Dropdown */}
          <div className="est-sort-group">
            <span className="est-filter-label">Sort by:</span>
            <div className="est-select-box">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="est-sort-select"
              >
                <option value="Most Visitors">Most Visitors</option>
                <option value="Highest Load">Highest Load</option>
                <option value="Alphabetical">Name (A-Z)</option>
              </select>
              <ChevronDown size={14} className="est-select-chevron" />
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY QUICK FILTER CHIPS */}
      <div className="est-category-chips">
        {[
          "All",
          "Hotels & Resorts",
          "HOME STAY",
          "Eco & Agri-Tourism",
          "Mabuhay accommodation"
        ].map((cat) => (
          <button
            key={cat}
            type="button"
            className={`est-cat-chip ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
        <span className="est-results-counter">
          {isLiveMongo && (
            <span style={{ marginRight: "12px", color: "#16a34a", fontWeight: 700 }}>
              ● MongoDB Live
            </span>
          )}
          Showing {filteredData.length} of {establishments.length} registered units
        </span>
      </div>

      {/* ESTABLISHMENT CARDS 3-COL GRID */}
      {filteredData.length === 0 ? (
        <div className="est-empty-state">
          <Building2 size={44} className="est-empty-icon" />
          <h4>No establishments match your search criteria</h4>
          <p>Try refining your search keyword or switching filters.</p>
          <button
            type="button"
            className="est-reset-btn"
            onClick={() => {
              setSearchQuery("");
              setSelectedDistrict("All");
              setSelectedCategory("All");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="est-cards-grid">
          {filteredData.map((item) => {
            // Determine progress bar color based on capacity
            const isAlert = item.capacityLoad >= 80;
            const isGreen = item.capacityLoad < 60;
            const barClass = isAlert ? "bar-alert" : isGreen ? "bar-green" : "bar-blue";

            return (
              <div key={item.id} className="est-card">
                {/* Top Badge Row */}
                <div className="est-card-top">
                  <span className={`est-district-badge ${item.badgeColor}`}>
                    {item.districtLabel}
                  </span>
                  <span className={`est-status-badge ${item.statusType}`}>
                    <span className="status-dot" />
                    {item.status}
                  </span>
                </div>

                {/* Title & Tagline */}
                <div className="est-card-headline">
                  <h3 className="est-title">{item.name}</h3>
                  <p className="est-tagline">{item.tagline}</p>
                </div>

                {/* 2-Metric Box */}
                <div className="est-stats-box">
                  <div className="est-stat-col">
                    <span className="est-stat-sub">TOTAL VISITORS</span>
                    <strong className="est-stat-val">
                      {item.totalVisitors.toLocaleString()}
                    </strong>
                  </div>
                  <div className="est-stat-col right-col">
                    <span className="est-stat-sub">FOREIGN / MICE</span>
                    <strong className="est-stat-val teal-val">
                      {item.foreignMice.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Carrying Capacity Load Bar */}
                <div className="est-capacity-section">
                  <div className="est-capacity-labels">
                    <span className="cap-label">Carrying Capacity Load</span>
                    <span className={`cap-percent ${barClass}`}>
                      {item.capacityLoad}%
                    </span>
                  </div>
                  <div className="est-progress-track">
                    <div
                      className={`est-progress-fill ${barClass}`}
                      style={{ width: `${item.capacityLoad}%` }}
                    />
                  </div>
                </div>

                {/* Flagship Attractions & Circuits */}
                <div className="est-flagships-section">
                  <span className="flagships-label">
                    FLAGSHIP ATTRACTIONS &amp; CIRCUITS
                  </span>
                  <div className="flagship-tags">
                    {item.flagships.map((tag, idx) => (
                      <span key={idx} className="flagship-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer with Officer */}
                <div className="est-card-footer">
                  <div className="est-officer-info">
                    <User size={15} className="est-officer-icon" />
                    <span className="est-officer-name">{item.officer}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MonitoredEstablishments;
