import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import pool from './db.js';

dotenv.config();

const app = express();
app.use(express.json())
app.use(cors());


// Endpoint Hello-World
app.get('/api/hello-world', (req, res) => {
  res.send('Hello World!');
});

// ======== Endpoints da aplicação ========

// usuário
// busca todos os cadastros dos usuários
app.get('/api/cadastro', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT ID, NOME, EMAIL, IDADE, RECEBER, TERMOS FROM usuario');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
});

// cadastra novos usuários
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

//login
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  try {
    const [rows] = await pool.query("SELECT ID, SENHA FROM usuario WHERE EMAIL = ?", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Email ou senha incorretos." });
    }

    const usuario = rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.SENHA);

    if (!senhaValida) {
      return res.status(401).json({ message: "Email ou senha incorretos." });
    }

    return res.status(200).json({ message: "Login realizado com sucesso!", id: usuario.ID });
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
});


// produtos
// busca todos os produtos 
app.get('/api/produto', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produto');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
});

//carrinho
app.post('/api/carrinho', async (req, res) => {
  const { endereco, produtos } = req.body;

  if (!endereco || !produtos || produtos.length === 0) {
    return res.status(400).json({ message: 'Endereço ou produtos não informados.' });
  }

  const ID_CARRINHO = Date.now(); // Gerador simples de ID de carrinho único

  try {
    const insertPromises = produtos.map((item) => {
      const sql = `
        INSERT INTO carrinhoprod (ID_CARRINHO, PRODUTO, PRECO, QUANTIDADE)
        VALUES (?, ?, ?, ?)
      `;
      return pool.query(sql, [ID_CARRINHO, item.nome, item.preco, item.quantidade]);
    });

    await Promise.all(insertPromises);

    res.status(201).json({ message: 'Carrinho salvo com sucesso.', ID_CARRINHO });
  } catch (error) {
    console.error('Erro ao salvar carrinho:', error);
    res.status(500).json({ message: 'Erro interno ao salvar o carrinho.' });
  }
});


// Busca todos os itens do carrinho com subtotal
app.get('/api/carrinho', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT ID_CARRINHO, PRODUTO, PRECO, QUANTIDADE, SUBTOTAL FROM carrinhoprod ORDER BY ID_CARRINHO'
    );

    const carrinhosMap = {};

    for (const row of rows) {
      if (!carrinhosMap[row.ID_CARRINHO]) {
        carrinhosMap[row.ID_CARRINHO] = [];
      }
      carrinhosMap[row.ID_CARRINHO].push({
        produto: row.PRODUTO,
        preco: row.PRECO,
        quantidade: row.QUANTIDADE,
        subtotal: row.SUBTOTAL,
      });
    }

    const carrinhos = Object.entries(carrinhosMap).map(([id, produtos]) => ({
      id_carrinho: id,
      produtos,
    }));

    res.status(200).json(carrinhos);
  } catch (err) {
    console.error('Erro ao buscar o carrinho:', err);
    res.status(500).json({ message: 'Erro ao buscar o carrinho' });
  }
});

// endereços
// cadastra um endereço
app.post('/api/endereco', async (req, res) => {
  const { rua, numero, bairro, complemento, estado, cidade } = req.body;

  if (!rua || !numero || !bairro || !estado || !cidade) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
  }

  try {
    await pool.query(
      'INSERT INTO enderecos (RUA, NUMERO, BAIRRO, COMPLEMENTO, ESTADO, CIDADE) VALUES (?, ?, ?, ?, ?, ?)',
      [rua, numero, bairro, complemento || '', estado, cidade]
    );
    res.status(201).json({ message: 'Endereço salvo com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao salvar endereço' });
  }
});

//busca endereços
app.get('/api/enderecos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM enderecos');
    res.status(200).json(rows);
  } catch (err) {
    console.error('Erro ao buscar endereços:', err);
    res.status(500).json({ message: 'Erro ao buscar endereços' });
  }
});

//carrinho 
// busca todos os produtos do carrinho 
app.get('/api/carrinhoprod', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM carrinhoprod');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar o carrinho' });
  }
});

// add produtos no carrinho
app.post('/api/carrinhoprod', async (req, res) => {
  const { ID, NOME, CLASSE, VALOR } = req.body;
  if (!ID || !NOME || !CLASSE || !VALOR) {
    return res.status(400).json({ message: 'Preencha todos os campos do produto' });
  }

  try {
    await pool.query(
      'INSERT INTO carrinhoprod (ID, NOME, CLASSE, VALOR) VALUES (?, ?, ?, ?)',
      [ID, NOME, CLASSE, VALOR]
    );
    res.status(201).json({ message: 'Produto adicionado ao carrinho' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao adicionar produto no carrinho' });
  }
});


// Inicia o servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
