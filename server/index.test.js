const request = require('supertest');
const { app, server, pool: realPool } = require('./index');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// O mock do 'pg'
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

// Instância do Pool FALSO (mock)
const mockPool = new Pool();
const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo';


const generateTestToken = (userId = 1) => {
    return jwt.sign({ userId }, JWT_SECRET);
};

describe('API Tests', () => {
  
  beforeEach(() => {
    mockPool.query.mockClear();
  });


  afterAll(done => {
    realPool.end();
    server.close(done);
  });


  // =================================================================
  // TESTES DE UNIDADE (Casos de Uso)
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


  describe('Unidade: Gerenciar Transações (Caso de Uso: Adicionar/Remover)', () => {
      it('Deve ADICIONAR uma transação (Receita/Despesa) com sucesso', async () => {
          const token = generateTestToken();
          const mockTx = { id: 10, description: 'Mercado', amount: 50.00, type: 'despesa' };
          mockPool.query.mockResolvedValueOnce({ rows: [mockTx] });

          const res = await request(app)
              .post('/transactions')
              .set('Authorization', `Bearer ${token}`)
              .send({ description: 'Mercado', amount: 50.00, type: 'despesa', category: 'Alimentação' });

          expect(res.statusCode).toEqual(201);
          expect(res.body).toHaveProperty('id', 10);
          expect(res.body.type).toEqual('despesa');
      });

      it('Deve REMOVER uma transação com sucesso', async () => {
          const token = generateTestToken();
          mockPool.query.mockResolvedValueOnce({ rows: [{ id: 10 }] });

          const res = await request(app)
              .delete('/transactions/10')
              .set('Authorization', `Bearer ${token}`);

          expect(res.statusCode).toEqual(200);
          expect(res.body).toHaveProperty('message', 'Transação deletada com sucesso.');
      });
  });


  describe('Unidade: Gerenciar Categorias (Caso de Uso: Adicionar Categoria)', () => {
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
  });

  
  describe('Unidade: Gerenciar Perfil (Caso de Uso: Editar Email)', () => {
      it('Deve ATUALIZAR o email do usuário', async () => {
          const token = generateTestToken();
          const currentPassword = '123';
          const hashedPassword = await bcrypt.hash(currentPassword, 10);
          
          
          mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, password_hash: hashedPassword }] });
          mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'novo@email.com' }] });

          const res = await request(app)
              .put('/update-email')
              .set('Authorization', `Bearer ${token}`)
              .send({ newEmail: 'novo@email.com', currentPassword: currentPassword });

          expect(res.statusCode).toEqual(200);
          expect(res.body.email).toEqual('novo@email.com');
      });
  });


  // =================================================================
  // TESTES DE INTEGRAÇÃO (Fluxos e Cenários)
  // =================================================================

  describe('Integração: Fluxo de Segurança', () => {
      it('Deve bloquear acesso sem token e permitir com token', async () => {
          // Passo 1: Tenta acessar sem token (Deve falhar)
          const resFail = await request(app).get('/transactions');
          expect(resFail.statusCode).toEqual(401);

          // Passo 2: Tenta acessar com token (Deve passar)
          const token = generateTestToken();
          mockPool.query.mockResolvedValueOnce({ rows: [] });
          
          const resSuccess = await request(app)
              .get('/transactions')
              .set('Authorization', `Bearer ${token}`);
          
          expect(resSuccess.statusCode).toEqual(200);
      });
  });


  describe('Integração: Fluxo de Cadastro e Login (Simulado)', () => {
      it('Deve simular erro de duplicidade no registro', async () => {
          const error = new Error('Duplicate email');
          error.code = '23505';
          mockPool.query.mockRejectedValueOnce(error);

          const res = await request(app)
              .post('/register')
              .send({ email: 'duplicado@teste.com', password: '123' });

          expect(res.statusCode).toEqual(400);
          expect(res.body.error).toMatch(/já está em uso/);
      });
  });


  describe('Integração: Fluxo de Configurações (Senha Incorreta)', () => {
      it('Não deve permitir alterar senha se a senha atual estiver errada', async () => {
          const token = generateTestToken();
          const realPasswordHash = await bcrypt.hash('senhaCerta', 10);

          mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, password_hash: realPasswordHash }] });


          const res = await request(app)
              .put('/update-password')
              .set('Authorization', `Bearer ${token}`)
              .send({ currentPassword: 'senhaErrada', newPassword: 'novaSenha123' });

          expect(res.statusCode).toEqual(401);
          expect(res.body.error).toMatch(/Senha atual incorreta/);
      });
  });

});