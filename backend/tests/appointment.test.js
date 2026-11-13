const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const User = require('../src/models/User');
const Doctor = require('../src/models/Doctor');
const Patient = require('../src/models/Patient');
const Appointment = require('../src/models/Appointment');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('Appointment Booking & Double-Booking Prevention Suite', () => {
  let patientToken;
  let patient2Token;
  let doctorDoc;
  let testDate;

  beforeEach(async () => {
    // 1. Create Patient 1
    const p1Res = await request(app).post('/api/auth/register').send({
      name: 'Alice Patient',
      email: 'alice@example.com',
      password: 'password123',
      phone: '555-1111',
    });
    patientToken = p1Res.body.token;

    // 2. Create Patient 2
    const p2Res = await request(app).post('/api/auth/register').send({
      name: 'Bob Patient',
      email: 'bob@example.com',
      password: 'password123',
      phone: '555-2222',
    });
    patient2Token = p2Res.body.token;

    // 3. Create Doctor User & Profile
    const docUser = await User.create({
      name: 'Dr. Gregory House',
      email: 'house@medicare.com',
      password: 'doctor123',
      role: 'doctor',
    });

    doctorDoc = await Doctor.create({
      user: docUser._id,
      specialization: 'Diagnostic Medicine',
      department: 'Internal Medicine',
      consultationFee: 600,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      availableTimeSlots: ['09:00 AM', '09:30 AM', '10:00 AM'],
    });

    // Pick a date (e.g. 2026-11-20)
    testDate = '2026-11-20';
  });

  test('POST /api/appointments should successfully book an available slot', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctorDoc._id,
        appointmentDate: testDate,
        timeSlot: '09:00 AM',
        reason: 'Severe persistent symptoms',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.timeSlot).toBe('09:00 AM');
    expect(res.body.data.tokenNumber).toBe(1);
  });

  test('DOUBLE BOOKING PREVENTION: Second booking for same doctor, date & timeSlot should fail with 409 Conflict', async () => {
    // First booking by Alice
    const firstRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctorDoc._id,
        appointmentDate: testDate,
        timeSlot: '09:30 AM',
        reason: 'Regular consultation',
      });
    expect(firstRes.status).toBe(201);

    // Second booking attempt by Bob for the identical slot
    const secondRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patient2Token}`)
      .send({
        doctorId: doctorDoc._id,
        appointmentDate: testDate,
        timeSlot: '09:30 AM',
        reason: 'Urgent checkup',
      });

    expect(secondRes.status).toBe(409);
    expect(secondRes.body.success).toBe(false);
    expect(secondRes.body.message).toMatch(/Conflict|already booked/i);
  });

  test('SLOT RECOVERY: Cancelled appointment slot becomes available again for new booking', async () => {
    // Book slot
    const bookRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctorDoc._id,
        appointmentDate: testDate,
        timeSlot: '10:00 AM',
        reason: 'Checkup',
      });
    expect(bookRes.status).toBe(201);
    const appointmentId = bookRes.body.data._id;

    // Alice cancels appointment
    const cancelRes = await request(app)
      .put(`/api/appointments/${appointmentId}/status`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        status: 'cancelled',
        cancellationReason: 'Conflict with work schedule',
      });
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe('cancelled');

    // Bob can now book that released slot
    const rebookRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patient2Token}`)
      .send({
        doctorId: doctorDoc._id,
        appointmentDate: testDate,
        timeSlot: '10:00 AM',
        reason: 'Immediate consultation',
      });

    expect(rebookRes.status).toBe(201);
    expect(rebookRes.body.success).toBe(true);
    expect(rebookRes.body.data.timeSlot).toBe('10:00 AM');
  });
});
