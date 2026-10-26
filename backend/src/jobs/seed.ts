import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/db';
import { User } from '../models/user.model';
import { MonitoringStation } from '../models/station.model';
import { NoiseReading } from '../models/noiseReading.model';
import { Complaint } from '../models/complaint.model';
import { ComplaintHistory } from '../models/complaintHistory.model';
import { Regulation } from '../models/regulation.model';
import { AreaType } from '../types';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDatabase();

    console.log('[Seed] Checking existing records (non-destructive seed)...');

    // 1. Seed Regulations (only if not already present)
    const regulationsData: { areaType: AreaType; dayLimit: number; nightLimit: number }[] = [
      { areaType: 'Silent Zone', dayLimit: 50, nightLimit: 40 },
      { areaType: 'Residential', dayLimit: 55, nightLimit: 45 },
      { areaType: 'Commercial', dayLimit: 65, nightLimit: 55 },
      { areaType: 'Industrial', dayLimit: 75, nightLimit: 70 },
      { areaType: 'Mixed Zone', dayLimit: 60, nightLimit: 50 },
    ];

    for (const reg of regulationsData) {
      const exists = await Regulation.findOne({ areaType: reg.areaType });
      if (!exists) {
        await Regulation.create(reg);
        console.log(`[Seed] Added regulation for ${reg.areaType}`);
      }
    }

    // 2. Seed Users (only if email doesn't exist)
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    let admin = await User.findOne({ email: 'admin@city.gov' });
    if (!admin) {
      admin = await User.create({
        name: 'Dr. Evelyn Reed (Chief Environmental Officer)',
        email: 'admin@city.gov',
        phone: '+1 555 019 2831',
        passwordHash,
        role: 'Admin',
      });
      console.log('[Seed] Created default Admin: admin@city.gov');
    }

    let authority = await User.findOne({ email: 'authority@city.gov' });
    if (!authority) {
      authority = await User.create({
        name: 'Inspector Marcus Vance',
        email: 'authority@city.gov',
        phone: '+1 555 019 4492',
        passwordHash,
        role: 'Authority',
      });
      console.log('[Seed] Created default Authority: authority@city.gov');
    }

    let citizen1 = await User.findOne({ email: 'citizen@example.com' });
    if (!citizen1) {
      citizen1 = await User.create({
        name: 'Sarah Jenkins',
        email: 'citizen@example.com',
        phone: '+1 555 019 7712',
        passwordHash,
        role: 'Citizen',
      });
      console.log('[Seed] Created default Citizen: citizen@example.com');
    }

    let citizen2 = await User.findOne({ email: 'david.chen@gmail.com' });
    if (!citizen2) {
      citizen2 = await User.create({
        name: 'David Chen',
        email: 'david.chen@gmail.com',
        phone: '+1 555 019 8834',
        passwordHash,
        role: 'Citizen',
      });
      console.log('[Seed] Created default Citizen: david.chen@gmail.com');
    }

    // 3. Seed Monitoring Stations across urban locations (only if stationId doesn't exist)
    const stationsData = [
      {
        stationId: 'STA-RES-01',
        name: 'Oakridge Residential Haven',
        location: '142 Oakridge Blvd, District 4',
        latitude: 40.7128,
        longitude: -74.006,
        areaType: 'Residential' as AreaType,
        status: 'Active' as const,
        currentNoiseLevel: 51.4,
      },
      {
        stationId: 'STA-COM-01',
        name: 'Metro Center Plaza',
        location: '500 Market St, Financial Core',
        latitude: 40.7258,
        longitude: -73.998,
        areaType: 'Commercial' as AreaType,
        status: 'Active' as const,
        currentNoiseLevel: 68.2,
      },
      {
        stationId: 'STA-IND-01',
        name: 'Harbor Logistics & Freight Yard',
        location: 'Pier 92 Industrial Way, Port Zone',
        latitude: 40.7398,
        longitude: -74.022,
        areaType: 'Industrial' as AreaType,
        status: 'Active' as const,
        currentNoiseLevel: 79.5,
      },
      {
        stationId: 'STA-SIL-01',
        name: 'St. Jude General Hospital Buffer',
        location: '88 Healthcare Ave, Medical District',
        latitude: 40.7308,
        longitude: -73.985,
        areaType: 'Silent Zone' as AreaType,
        status: 'Active' as const,
        currentNoiseLevel: 44.8,
      },
      {
        stationId: 'STA-MIX-01',
        name: 'Southbank Arts & Transit Exchange',
        location: '210 Riverfront Terrace, Arts Sector',
        latitude: 40.7078,
        longitude: -74.015,
        areaType: 'Mixed Zone' as AreaType,
        status: 'Active' as const,
        currentNoiseLevel: 63.1,
      },
      {
        stationId: 'STA-RES-02',
        name: 'Maplewood Green Suburb',
        location: '32 Pinecrest Way, District 7',
        latitude: 40.7188,
        longitude: -74.032,
        areaType: 'Residential' as AreaType,
        status: 'Active' as const,
        currentNoiseLevel: 53.0,
      },
    ];

    for (const st of stationsData) {
      const exists = await MonitoringStation.findOne({ stationId: st.stationId });
      if (!exists) {
        await MonitoringStation.create(st);
        console.log(`[Seed] Added station: ${st.stationId}`);
      }
    }

    // 4. Seed Historical Noise Readings (if none exist for station)
    const existingReadingsCount = await NoiseReading.countDocuments();
    if (existingReadingsCount === 0) {
      console.log('[Seed] Generating initial time-series telemetry data...');
      const stations = await MonitoringStation.find();
      const readings = [];
      const now = Date.now();

      for (const station of stations) {
        for (let i = 20; i >= 0; i--) {
          const timeOffset = i * 36 * 60 * 1000;
          const timestamp = new Date(now - timeOffset);
          const hour = timestamp.getHours();
          const isDay = hour >= 6 && hour < 22;

          let base = 50;
          if (station.areaType === 'Silent Zone') base = isDay ? 44 : 38;
          if (station.areaType === 'Residential') base = isDay ? 53 : 43;
          if (station.areaType === 'Commercial') base = isDay ? 67 : 56;
          if (station.areaType === 'Industrial') base = isDay ? 78 : 69;
          if (station.areaType === 'Mixed Zone') base = isDay ? 62 : 51;

          const jitter = (Math.random() - 0.5) * 8;
          const noiseLevel = Math.round((base + jitter) * 10) / 10;

          readings.push({
            stationId: station.stationId,
            noiseLevel,
            timestamp,
            areaType: station.areaType,
          });
        }
      }
      if (readings.length > 0) {
        await NoiseReading.insertMany(readings);
        console.log(`[Seed] Inserted ${readings.length} initial telemetry readings`);
      }
    }

    // 5. Seed Complaints and Timeline History (only if complaintId doesn't exist)
    const now = Date.now();

    const existsCmp1 = await Complaint.findOne({ complaintId: 'CMP-20261001-0001' });
    if (!existsCmp1 && citizen1) {
      const complaint1 = await Complaint.create({
        complaintId: 'CMP-20261001-0001',
        userId: citizen1._id,
        category: 'Construction Noise',
        description: 'Heavy jackhammers and generator running after 10 PM violating nighttime residential quiet hours.',
        location: '146 Oakridge Blvd, near Oakridge Station',
        latitude: 40.713,
        longitude: -74.0055,
        reportedNoiseLevel: 78.4,
        priority: 'High',
        status: 'In Progress',
        assignedTo: authority?._id,
        resolutionNotes: 'Field officer dispatched to issue stop-work violation notice.',
      });

      await ComplaintHistory.insertMany([
        {
          complaintId: complaint1.complaintId,
          status: 'Submitted',
          notes: 'Complaint registered by citizen with noise decibel reading.',
          updatedBy: citizen1._id,
          timestamp: new Date(now - 4 * 3600 * 1000),
        },
        {
          complaintId: complaint1.complaintId,
          status: 'Under Review',
          notes: 'Triaged by Central Dispatch; prioritized High due to nocturnal violation.',
          updatedBy: authority?._id || citizen1._id,
          timestamp: new Date(now - 3 * 3600 * 1000),
        },
        {
          complaintId: complaint1.complaintId,
          status: 'Assigned',
          notes: 'Assigned to Sector 4 Environmental Inspector Marcus Vance.',
          updatedBy: admin?._id || citizen1._id,
          timestamp: new Date(now - 2 * 3600 * 1000),
        },
        {
          complaintId: complaint1.complaintId,
          status: 'In Progress',
          notes: 'En route to construction site with acoustic measurement kit.',
          updatedBy: authority?._id || citizen1._id,
          timestamp: new Date(now - 1 * 3600 * 1000),
        },
      ]);
      console.log('[Seed] Created complaint CMP-20261001-0001 with timeline');
    }

    const existsCmp2 = await Complaint.findOne({ complaintId: 'CMP-20261001-0002' });
    if (!existsCmp2 && citizen2) {
      const complaint2 = await Complaint.create({
        complaintId: 'CMP-20261001-0002',
        userId: citizen2._id,
        category: 'Loud Music',
        description: 'Rooftop lounge outdoor speakers blasting bass frequencies past midnight.',
        location: '512 Market St, 4th Floor',
        latitude: 40.7262,
        longitude: -73.9975,
        reportedNoiseLevel: 72.1,
        priority: 'Medium',
        status: 'Resolved',
        assignedTo: authority?._id,
        resolutionNotes: 'Venue management reduced master gain and positioned directional acoustic dampers.',
      });

      await ComplaintHistory.insertMany([
        {
          complaintId: complaint2.complaintId,
          status: 'Submitted',
          notes: 'Grievance submitted regarding commercial sound bleed.',
          updatedBy: citizen2._id,
          timestamp: new Date(now - 24 * 3600 * 1000),
        },
        {
          complaintId: complaint2.complaintId,
          status: 'Resolved',
          notes: 'Inspection verified compliant sound levels after volume limiting hardware calibrated.',
          updatedBy: authority?._id || citizen2._id,
          timestamp: new Date(now - 12 * 3600 * 1000),
        },
      ]);
      console.log('[Seed] Created complaint CMP-20261001-0002 with timeline');
    }

    const existsCmp3 = await Complaint.findOne({ complaintId: 'CMP-20261001-0003' });
    if (!existsCmp3 && citizen1) {
      const complaint3 = await Complaint.create({
        complaintId: 'CMP-20261001-0003',
        userId: citizen1._id,
        category: 'Industrial Noise',
        description: 'Air chiller exhaust fan screeching intermittently near hospital perimeter.',
        location: '94 Healthcare Ave, East Alley',
        latitude: 40.7312,
        longitude: -73.9845,
        reportedNoiseLevel: 64.0,
        priority: 'Critical',
        status: 'Under Review',
      });

      await ComplaintHistory.create({
        complaintId: complaint3.complaintId,
        status: 'Submitted',
        notes: 'Initial filing in Silent Zone boundary.',
        updatedBy: citizen1._id,
        timestamp: new Date(now - 30 * 60 * 1000),
      });
      console.log('[Seed] Created complaint CMP-20261001-0003 with timeline');
    }

    console.log('--------------------------------------------------');
    console.log('[Seed] Non-destructive check & seed completed successfully!');
    console.log('Demo Credentials:');
    console.log('  Admin:     admin@city.gov     / Password123!');
    console.log('  Authority: authority@city.gov / Password123!');
    console.log('  Citizen:   citizen@example.com / Password123!');
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
};

seedDatabase();
