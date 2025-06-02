import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import connection from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o arquivo de usuários
const usersFile = path.join(__dirname, './src/components/backend/data/users.json');

// Funções auxiliares
const readUsers = () => {
  if (!fs.existsSync(usersFile)) return [];
  const data = fs.readFileSync(usersFile);
  return JSON.parse(data);
};

const writeUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

// Endpoint Hello-World
app.get('/api/hello-world', (req, res) => {
  res.send('Hello World!');
});

//rotas
// cadastro
app.post('/api/cadastro', async (req, res) => {
  const { nome, email, idade, senha, receber, termos } = req.body;

  if (!nome || !email || !idade || !senha || termos === undefined) {
    return res.status(400).json({ message: 'Preencha todos os campos obrigatórios' });
  }

  try {
    const conn = await pool.getConnection();

    const [rows] = await conn.query('SELECT * FROM usuario WHERE EMAIL = ?', [email]);
    if (rows.length > 0) {
      conn.release();
      return res.status(409).json({ message: 'Usuário já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    await conn.query(
      'INSERT INTO usuario (NOME, EMAIL, IDADE, SENHA, RECEBER, TERMOS) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, email, idade, hashedPassword, receber ? 1 : 0, termos ? 1 : 0]
    );

    conn.release();
    res.json({ message: 'Cadastro realizado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// login
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM usuario WHERE EMAIL = ?', [email]);

    if (rows.length === 0) {
      conn.release();
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    const usuario = rows[0];
    const match = await bcrypt.compare(senha, usuario.SENHA);

    conn.release();
    if (!match) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    res.json({ message: 'Login bem-sucedido', nome: usuario.NOME });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// salvar endereços
app.post("/api/endereco", async (req, res) => {
  const { rua, numero, bairro, complemento, estado, cidade } = req.body;

  if (!rua || !numero || !bairro || !complemento || !estado || !cidade) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const sql = `INSERT INTO enderecos (RUA, NUMERO, BAIRRO, COMPLEMENTO, ESTADO, CIDADE)
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [rua, numero, bairro, complemento, estado, cidade], (err, result) => {
    if (err) {
      console.error("Erro ao inserir endereço:", err);
      return res.status(500).json({ error: "Erro ao salvar o endereço" });
    }

    res.status(200).json({ message: "Endereço salvo com sucesso!" });
  }
  )
});


// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
