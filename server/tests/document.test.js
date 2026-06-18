const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const seedUsers = require('../src/utils/seed');

let mongoServer, aliceToken, bobToken;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  process.env.SEED_PASSWORD = 'password123';

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await seedUsers();

  aliceToken = (await request(app).post('/api/auth/login').send({ email: 'alice@example.com', password: 'password123' })).body.token;
  bobToken = (await request(app).post('/api/auth/login').send({ email: 'bob@example.com', password: 'password123' })).body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Document API', () => {
  let documentId;

  test('Alice can create a document', async () => {
    const res = await request(app).post('/api/documents').set('Authorization', `Bearer ${aliceToken}`).send({ title: 'Alice Doc', content: '<p>Hello</p>' });
    expect(res.status).toBe(201);
    documentId = res.body._id;
  });

  test('Bob cannot access a document Alice has not shared', async () => {
    const res = await request(app).get(`/api/documents/${documentId}`).set('Authorization', `Bearer ${bobToken}`);
    expect(res.status).toBe(403);
  });

  test('Alice can share the document with Bob', async () => {
    const res = await request(app).post(`/api/documents/${documentId}/share`).set('Authorization', `Bearer ${aliceToken}`).send({ email: 'bob@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.sharedWith.length).toBe(1);
  });

  test('Bob can access the document after being shared with', async () => {
    const res = await request(app).get(`/api/documents/${documentId}`).set('Authorization', `Bearer ${bobToken}`);
    expect(res.status).toBe(200);
  });

  test('Requests without a token are rejected', async () => {
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(401);
  });
});