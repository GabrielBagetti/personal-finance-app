const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

// Novas importações para arquivos
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || '12345678',
  port: process.env.DB_PORT || 5432,
});


const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo';

// --- CONFIGURAÇÃO DO UPLOAD DA FOTO ---
const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const fileExtension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${fileExtension}`);
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // Limite de 5MB

// Rota para servir as imagens salvas
app.use('/uploads', express.static(UPLOAD_DIR));

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};


// --- ROTAS DE AUTENTICAÇÃO ---
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const newUser = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, password_hash]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
        return res.status(400).json({ error: 'Este email já está em uso.' });
    }
    console.error("Erro no registro:", err.message);
    res.status(500).json({ error: "Erro no servidor ao registrar." });
  }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) return res.status(401).json({ error: 'Credenciais inválidas.' });
        
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Credenciais inválidas.' });

        // INLUI A URL DA FOTO DE PERFIL NO TOKEN
        const tokenPayload = { 
            userId: user.id, 
            email: user.email, 
            profilePhotoUrl: user.profile_photo_url 
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user.id, email: user.email, profilePhotoUrl: user.profile_photo_url } });
    } catch (err) {
        console.error("Erro no login:", err.message);
        res.status(500).json({ error: "Erro no servidor." });
    }
});

app.get('/transactions', authenticateToken, async (req, res) => {
    try {
        const userTransactions = await pool.query(
            "SELECT * FROM transactions WHERE user_id = $1 ORDER BY timestamp DESC",
            [req.user.userId]
        );
        res.json(userTransactions.rows);
    } catch (err) {
        console.error("Erro ao buscar transações:", err.message);
        res.status(500).json({ error: "Erro no servidor" });
    }
});

// ROTA PARA ADICIONAR TRANSAÇÃO
app.post('/transactions', authenticateToken, async (req, res) => {
    const { description, amount, type, category } = req.body;
    try {
        const newTransaction = await pool.query(
            "INSERT INTO transactions (user_id, description, amount, type, category) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [req.user.userId, description, amount, type, category]
        );
        res.status(201).json(newTransaction.rows[0]);
    } catch (err) {
        console.error("Erro ao adicionar transação:", err.message);
        res.status(500).json({ error: "Erro no servidor" });
    }
});

// ROTA PARA APAGAR TRANSAÇÃO
app.delete('/transactions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const deleteOp = await pool.query(
            "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, req.user.userId]
        );
        if (deleteOp.rows.length === 0) {
            return res.status(404).json({ error: "Transação não encontrada ou não pertence ao usuário." });
        }
        res.json({ message: "Transação deletada com sucesso." });
    } catch (err) {
        console.error("Erro ao apagar transação:", err.message);
        res.status(500).json({ error: "Erro no servidor" });
    }
});

// ROTA PARA BUSCAR CATEGORIAS (COM CRIAÇÃO DE PADRÕES)
app.get('/categories', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        let userCategories = await pool.query("SELECT * FROM categories WHERE user_id = $1", [userId]);
        if (userCategories.rows.length === 0) {
            const defaultCategories = [
                { name: 'Alimentação', type: 'despesa' }, { name: 'Transporte', type: 'despesa' },
                { name: 'Moradia', type: 'despesa' }, { name: 'Lazer', type: 'despesa' },
                { name: 'Saúde', type: 'despesa' }, { name: 'Outros', type: 'despesa' },
                { name: 'Salário', type: 'receita' }, { name: 'Investimentos', type: 'receita' }
            ];
            for (const category of defaultCategories) {
                await pool.query(
                    "INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3)",
                    [userId, category.name, category.type]
                );
            }
            userCategories = await pool.query("SELECT * FROM categories WHERE user_id = $1", [userId]);
        }
        res.json(userCategories.rows);
    } catch (err) {
        console.error("Erro ao buscar categorias:", err.message);
        res.status(500).json({ error: "Erro no servidor" });
    }
});

// ADICIONAR UMA NOVA CATEGORIA
app.post('/categories', authenticateToken, async (req, res) => {
    const { name, type } = req.body;
    const userId = req.user.userId;

    if (!name || !type) {
        return res.status(400).json({ error: "Nome e tipo são obrigatórios." });
    }

    try {
        const newCategory = await pool.query(
            "INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) RETURNING *",
            [userId, name, type]
        );
        res.status(201).json(newCategory.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: "Uma categoria com este nome já existe." });
        }
        console.error("Erro ao adicionar categoria:", err.message);
        res.status(500).json({ error: "Erro no servidor." });
    }
});

// EDITAR O NOME DE UMA CATEGORIA
app.put('/categories/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name) {
        return res.status(400).json({ error: "O novo nome é obrigatório." });
    }

    try {
        const updatedCategory = await pool.query(
            "UPDATE categories SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
            [name, id, userId]
        );
        if (updatedCategory.rows.length === 0) {
            return res.status(404).json({ error: "Categoria não encontrada ou não pertence ao usuário." });
        }
        res.json(updatedCategory.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: "Uma categoria com este nome já existe." });
        }
        console.error("Erro ao editar categoria:", err.message);
        res.status(500).json({ error: "Erro no servidor." });
    }
});

// APAGAR UMA CATEGORIA
app.delete('/categories/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        await pool.query("DELETE FROM transactions WHERE category = (SELECT name FROM categories WHERE id = $1 AND user_id = $2)", [id, userId]);

        const deleteOp = await pool.query(
            "DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, userId]
        );

        if (deleteOp.rows.length === 0) {
            return res.status(404).json({ error: "Categoria não encontrada ou não pertence ao usuário." });
        }
        res.json({ message: "Categoria e transações associadas foram deletadas." });
    } catch (err) {
        console.error("Erro ao apagar categoria:", err.message);
        res.status(500).json({ error: "Erro no servidor." });
    }
});

// --- NOVA ROTA PARA UPLOAD DE FOTO DE PERFIL ---
app.post('/upload-profile-photo', authenticateToken, upload.single('profilePhoto'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo de imagem foi enviado.' });

    const userId = req.user.userId;
    const photoPath = `/uploads/${req.file.filename}`;

    try {
        // Pega o caminho da foto antiga para poder apagar depois
        const oldPhotoResult = await pool.query("SELECT profile_photo_url FROM users WHERE id = $1", [userId]);
        const oldPhotoPath = oldPhotoResult.rows[0]?.profile_photo_url;

        // Atualiza o caminho da foto no banco de dados
        const updateResult = await pool.query("UPDATE users SET profile_photo_url = $1 WHERE id = $2 RETURNING profile_photo_url", [photoPath, userId]);

        // Se havia uma foto antiga, tenta apagar o arquivo do servidor
        if (oldPhotoPath) {
            const absoluteOldPhotoPath = path.join(__dirname, oldPhotoPath);
            fs.unlink(absoluteOldPhotoPath).catch(err => console.warn(`Não foi possível remover a foto antiga: ${err.message}`));
        }
        
        res.json({ message: 'Foto de perfil atualizada!', profilePhotoUrl: updateResult.rows[0].profile_photo_url });
    } catch (err) {
        console.error("Erro ao fazer upload da foto:", err.message);
        res.status(500).json({ error: "Erro no servidor." });
    }
});

app.delete('/remove-profile-photo', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        // 1. Acha a foto antiga para apagar o arquivo
        const oldPhotoResult = await pool.query("SELECT profile_photo_url FROM users WHERE id = $1", [userId]);
        const oldPhotoPath = oldPhotoResult.rows[0]?.profile_photo_url;

        // 2. Define a URL da foto como NULL no banco de dados
        await pool.query("UPDATE users SET profile_photo_url = NULL WHERE id = $1", [userId]);

        // 3. Se a foto antiga existia, apaga o arquivo do servidor
        if (oldPhotoPath) {
            const absoluteOldPhotoPath = path.join(__dirname, oldPhotoPath);
            fs.unlink(absoluteOldPhotoPath).catch(err => console.warn(`Não foi possível remover a foto antiga: ${err.message}`));
        }
        
        res.json({ message: 'Foto de perfil removida com sucesso.' });
    } catch (err) {
        console.error("Erro ao remover foto:", err.message);
        res.status(500).json({ error: "Erro no servidor." });
    }
});


app.put('/update-email', authenticateToken, async (req, res) => {
    const { newEmail, currentPassword } = req.body;
    const userId = req.user.userId;

    if (!newEmail || !currentPassword) {
        return res.status(400).json({ error: "Email novo e senha atual são obrigatórios." });
    }
    try {
        // 1. Verificar a senha atual
        const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Senha atual incorreta." });
        }

        // 2. Se a senha estiver correta, atualizar o email
        const updateResult = await pool.query(
            "UPDATE users SET email = $1 WHERE id = $2 RETURNING id, email",
            [newEmail, userId]
        );
        res.json(updateResult.rows[0]);
    } catch (err) {
        // 23505 é o código de violação de constraint "UNIQUE"
        if (err.code === '23505') {
            return res.status(409).json({ error: "Este email já está em uso por outra conta." });
        }
        console.error("Erro ao atualizar email:", err.message);
        res.status(500).json({ error: "Erro no servidor." });
    }
});

// ROTA PARA ALTERAR A SENHA
app.put('/update-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }
    try {
        // 1. Verificar a senha atual
        const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Senha atual incorreta." });
        }

        // 2. Se a senha estiver correta, criar o hash da nova senha
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // 3. Atualizar no banco
        await pool.query(
            "UPDATE users SET password_hash = $1 WHERE id = $2",
            [newPasswordHash, userId]
        );
        res.json({ message: "Senha alterada com sucesso." });
    } catch (err) {
        console.error("Erro ao alterar senha:", err.message);
        res.status(500).json({ error: "Erro no servidor." });
    }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
  }
});
module.exports = { app, server, pool };