import request from 'supertest';
import app from '../app';
import { connectDatabase, disconnectDatabase } from '../config/db';
import { User } from '../models/user.model';
import { MonitoringStation } from '../models/station.model';
import { NoiseReading } from '../models/noiseReading.model';
import { Complaint } from '../models/complaint.model';
import { ComplaintHistory } from '../models/complaintHistory.model';

describe('Urban Noise Monitoring & Complaint Management API Tests', () => {
  let citizenToken = '';
  let adminToken = '';
  let testComplaintId = '';
  const testEmail = `test_citizen_${Date.now()}@example.com`;
  const adminEmail = `test_admin_${Date.now()}@city.gov`;

  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    // Clean up test artifacts
    await User.deleteMany({ email: { $in: [testEmail, adminEmail] } });
    if (testComplaintId) {
      await Complaint.deleteOne({ complaintId: testComplaintId });
      await ComplaintHistory.deleteMany({ complaintId: testComplaintId });
    }
    await disconnectDatabase();
  });

  // 1. Register test
  it('POST /api/auth/register - should register a new citizen user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Automated Test Citizen',
        email: testEmail,
        password: 'Password123!',
        phone: '+1 555 999 1122',
        role: 'Citizen',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
    citizenToken = res.body.data.token;
  });

  // 2. Login test
  it('POST /api/auth/login - should authenticate citizen and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    citizenToken = res.body.data.token;
  });

  // 3. Protected route test
  it('GET /api/auth/me - should access protected route with valid JWT', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testEmail.toLowerCase());
  });

  // Setup admin user for authority actions
  it('Setup: create admin user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Automated Test Admin',
        email: adminEmail,
        password: 'Password123!',
        role: 'Admin',
      });

    expect(res.status).toBe(201);
    adminToken = res.body.data.token;
  });

  // 4. Create complaint test
  it('POST /api/complaints - should lodge a new noise complaint', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        category: 'Loud Music',
        description: 'Nightclub outdoor terrace speakers exceeding permissible volume limits after 11 PM.',
        location: '77 Commerce Blvd, Suite 2',
        latitude: 40.7258,
        longitude: -73.998,
        reportedNoiseLevel: 74.5,
        priority: 'High',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.complaintId).toBeDefined();
    expect(res.body.data.status).toBe('Submitted');
    testComplaintId = res.body.data.complaintId;
  });

  // 5. Update complaint status test
  it('PATCH /api/complaints/:id/status - should update status and create audit timeline entry', async () => {
    const res = await request(app)
      .patch(`/api/complaints/${testComplaintId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'In Progress',
        notes: 'Dispatched Sector 3 Environmental Officer to measure decibels with calibrated meter.',
        resolutionNotes: 'Preliminary site investigation active.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.complaint.status).toBe('In Progress');
    expect(res.body.data.historyEntry.notes).toContain('Dispatched Sector 3');
  });

  // 6. Create noise reading test
  it('POST /api/noise - should ingest simulated/real noise telemetry reading', async () => {
    // Ensure test station exists
    let station = await MonitoringStation.findOne({ stationId: 'STA-RES-01' });
    if (!station) {
      station = await MonitoringStation.create({
        stationId: 'STA-RES-01',
        name: 'Oakridge Residential Haven',
        location: '142 Oakridge Blvd',
        latitude: 40.7128,
        longitude: -74.006,
        areaType: 'Residential',
        status: 'Active',
        currentNoiseLevel: 50.0,
      });
    }

    const res = await request(app)
      .post('/api/noise')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        stationId: 'STA-RES-01',
        noiseLevel: 58.6,
        areaType: 'Residential',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.noiseLevel).toBe(58.6);
  });

  // 7. Fetch latest noise reading test
  it('GET /api/noise/latest - should retrieve latest readings cached or from database', async () => {
    const res = await request(app).get('/api/noise/latest');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
