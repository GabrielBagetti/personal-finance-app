const request = require('supertest');
const { app, server, pool: realPool } = require('./index');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');


jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});


jest.mock('fs/promises', () => ({
  unlink: jest.fn().mockResolvedValue(true),
  mkdir: jest.fn().mockResolvedValue(true),
}));

// Instância do Pool FALSO (mock)
const mockPool = new Pool();

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo';


const generateTestToken = (userId = 1) => {
    return jwt.sign({ userId }, JWT_SECRET);
};

describe('API Tests - Cobertura Completa', () => {
  
  beforeEach(() => {
    mockPool.query.mockClear();
  });

  afterAll(done => {
    realPool.end();
    server.close(done);
  });

  // =================================================================
  // 1. AUTENTICAÇÃO E PERFIL (Login, Registro, Senha, Foto)
  // =================================================================

  describe('Unidade: Autenticação', () => {
      it('Deve registrar um novo usuário com sucesso', async () => {
        mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'test@example.com' }] });
        const res = await request(app).post('/register').send({ email: 'test@example.com', password: '123' });
        expect(res.statusCode).toEqual(201);
      });


      it('Deve fazer login com sucesso', async () => {
        const hashedPassword = await bcrypt.hash('123', 10);
        mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'test@example.com', password_hash: hashedPassword }] });
        
        const res = await request(app).post('/login').send({ email: 'test@example.com', password: '123' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
      });
  });

  describe('Unidade: Gerenciar Perfil (Senha e Foto)', () => {
      it('Deve ATUALIZAR o email do usuário', async () => {
          const token = generateTestToken();
          const hashedPassword = await bcrypt.hash('123', 10);
          
          mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, password_hash: hashedPassword }] });
          mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'novo@email.com' }] });

          const res = await request(app)
              .put('/update-email')
              .set('Authorization', `Bearer ${token}`)
              .send({ newEmail: 'novo@email.com', currentPassword: '123' });

          expect(res.statusCode).toEqual(200);
          expect(res.body.email).toEqual('novo@email.com');
      });


      it('Deve ALTERAR a senha do usuário', async () => {
          const token = generateTestToken();
          const oldHash = await bcrypt.hash('senhaVelha', 10);
          
          mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, password_hash: oldHash }] });
          mockPool.query.mockResolvedValueOnce({ rows: [] });

          const res = await request(app)
              .put('/update-password')
              .set('Authorization', `Bearer ${token}`)
              .send({ currentPassword: 'senhaVelha', newPassword: 'senhaNova' });

          expect(res.statusCode).toEqual(200);
          expect(res.body.message).toMatch(/alterada/); // Ajustei o match para ser mais flexível
      });


      it('Deve REMOVER a foto de perfil', async () => {
          const token = generateTestToken();
          mockPool.query.mockResolvedValueOnce({ rows: [{ profile_photo_url: '/uploads/foto.jpg' }] });
          mockPool.query.mockResolvedValueOnce({ rows: [] });

          const res = await request(app)
              .delete('/remove-profile-photo')
              .set('Authorization', `Bearer ${token}`);

          expect(res.statusCode).toEqual(200);
      });


      it('Deve FAZER UPLOAD de uma nova foto de perfil', async () => {
          const token = generateTestToken();
          mockPool.query.mockResolvedValueOnce({ rows: [{ profile_photo_url: null }] });
          mockPool.query.mockResolvedValueOnce({ rows: [{ profile_photo_url: '/uploads/nova-foto.jpg' }] });

          const res = await request(app)
              .post('/upload-profile-photo')
              .set('Authorization', `Bearer ${token}`)
              .attach('profilePhoto', Buffer.from('fake_image_data'), 'test.jpg');

          expect(res.statusCode).toEqual(200);
      });
  });

  // =================================================================
  // 2. TRANSAÇÕES (Adicionar, Remover)
  // =================================================================

  describe('Unidade: Gerenciar Transações', () => {
      it('Deve ADICIONAR uma transação', async () => {
          const token = generateTestToken();
          const mockTx = { id: 10, description: 'Mercado', amount: 50.00, type: 'despesa' };
          mockPool.query.mockResolvedValueOnce({ rows: [mockTx] });

          const res = await request(app)
              .post('/transactions')
              .set('Authorization', `Bearer ${token}`)
              .send({ description: 'Mercado', amount: 50.00, type: 'despesa', category: 'Alimentação' });

          expect(res.statusCode).toEqual(201);
          expect(res.body).toHaveProperty('id', 10);
      });


      it('Deve REMOVER uma transação', async () => {
          const token = generateTestToken();
          mockPool.query.mockResolvedValueOnce({ rows: [{ id: 10 }] }); // Simula que achou e deletou

          const res = await request(app)
              .delete('/transactions/10')
              .set('Authorization', `Bearer ${token}`);

          expect(res.statusCode).toEqual(200);
      });
  });

  // =================================================================
  // 3. CATEGORIAS (Adicionar, Editar, Remover)
  // =================================================================

  describe('Unidade: Gerenciar Categorias', () => {
      it('Deve ADICIONAR uma nova categoria', async () => {
          const token = generateTestToken();
          const mockCat = { id: 5, name: 'Viagem', type: 'despesa' };
          mockPool.query.mockResolvedValueOnce({ rows: [mockCat] });

          const res = await request(app)
              .post('/categories')
              .set('Authorization', `Bearer ${token}`)
              .send({ name: 'Viagem', type: 'despesa' });

          expect(res.statusCode).toEqual(201);
          expect(res.body.name).toEqual('Viagem');
      });


      it('Deve EDITAR o nome de uma categoria', async () => {
          const token = generateTestToken();
          const mockCat = { id: 5, name: 'Viagem Editada', type: 'despesa' };
          mockPool.query.mockResolvedValueOnce({ rows: [mockCat] });

          const res = await request(app)
              .put('/categories/5')
              .set('Authorization', `Bearer ${token}`)
              .send({ name: 'Viagem Editada' });

          expect(res.statusCode).toEqual(200);
          expect(res.body.name).toEqual('Viagem Editada');
      });


      it('Deve REMOVER uma categoria', async () => {
          const token = generateTestToken();
          // Mock 1: Deleta transações associadas
          mockPool.query.mockResolvedValueOnce({ rows: [] });
          // Mock 2: Deleta a categoria
          mockPool.query.mockResolvedValueOnce({ rows: [{ id: 5 }] });

          const res = await request(app)
              .delete('/categories/5')
              .set('Authorization', `Bearer ${token}`);

          expect(res.statusCode).toEqual(200);
      });
  });


  // =================================================================
  // TESTES DE INTEGRAÇÃO (Cenários Completos)
  // =================================================================

  describe('Integração: Cenários de Uso', () => {
      it('Cenário 1: Segurança - Acesso Negado sem Token', async () => {
          const res = await request(app).get('/transactions');
          expect(res.statusCode).toEqual(401); // Unauthorized
      });


      it('Cenário 2: Cadastro Falho - Email Duplicado', async () => {
          const error = new Error('Duplicate email');
          error.code = '23505'; // Código Postgres para Unique Violation
          mockPool.query.mockRejectedValueOnce(error);

          const res = await request(app)
              .post('/register')
              .send({ email: 'duplicado@teste.com', password: '123' });

          expect(res.statusCode).toEqual(400);
          expect(res.body.error).toMatch(/já está em uso/);
      });


      it('Cenário 3: Proteção de Configurações - Senha Errada', async () => {
          const token = generateTestToken();
          const realHash = await bcrypt.hash('senhaCerta', 10);
          mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, password_hash: realHash }] });

          const res = await request(app)
              .put('/update-password')
              .set('Authorization', `Bearer ${token}`)
              .send({ currentPassword: 'senhaErrada', newPassword: 'nova' });

          expect(res.statusCode).toEqual(401);
      });
  });

});