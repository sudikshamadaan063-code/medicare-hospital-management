const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const User = require('../src/models/User');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('Authentication & Authorization Suite', () => {
  const testPatient = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    phone: '555-1234',
    gender: 'Female',
  };

  test('POST /api/auth/register should successfully register a new patient and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testPatient);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testPatient.email);
    expect(res.body.user.role).toBe('patient');
  });

  test('POST /api/auth/register should reject duplicate email with 409 Conflict', async () => {
    await request(app).post('/api/auth/register').send(testPatient);

    const duplicateRes = await request(app)
      .post('/api/auth/register')
      .send(testPatient);

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
  });

  test('POST /api/auth/login should authenticate registered patient with valid credentials', async () => {
    await request(app).post('/api/auth/register').send(testPatient);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testPatient.email,
        password: testPatient.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toBe(testPatient.name);
  });

  test('POST /api/auth/login should reject incorrect password with 401 Unauthorized', async () => {
    await request(app).post('/api/auth/register').send(testPatient);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testPatient.email,
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me should reject request without Bearer token with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('Role Authorization: Patient should be blocked from Admin-only endpoints with 403', async () => {
    const regRes = await request(app).post('/api/auth/register').send(testPatient);
    const patientToken = regRes.body.token;

    // Try to create doctor via admin-only endpoint
    const res = await request(app)
      .post('/api/doctors')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        name: 'Dr. Hack',
        email: 'hacker@medicare.com',
        department: 'Cardiology',
        specialization: 'Cardiology',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
