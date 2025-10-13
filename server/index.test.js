// server/index.test.js

const request = require('supertest');
const { app, server, pool: realPool } = require('./index'); 
const { Pool } = require('pg'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

const mockPool = new Pool(); 
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-muito-secreto-e-dificil-de-adivinhar';


describe('API Endpoints', () => {
  beforeEach(() => {
    mockPool.query.mockClear();
  });

  afterAll(done => {
    realPool.end(); 
    server.close(done);
  });


  // --- TESTES ---

  it('Deve registrar um novo usuário com sucesso', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'test@example.com' }] });
    const res = await request(app).post('/register').send({ email: 'test@example.com', password: 'password123' });
    expect(res.statusCode).toEqual(201);
  });

  it('Deve fazer login com um usuário válido e retornar um token', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10); 
    mockPool.query.mockResolvedValueOnce({ rows: [{ id: 2, email: 'login@test.com', password_hash: hashedPassword }] });
    const res = await request(app).post('/login').send({ email: 'login@test.com', password: 'password123' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('Deve buscar as transações de um usuário autenticado', async () => {
    const token = jwt.sign({ userId: 3 }, JWT_SECRET); 
    mockPool.query.mockResolvedValueOnce({ rows: [{ id: 101 }, { id: 102 }] });
    const res = await request(app).get('/transactions').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(2);
  });

});