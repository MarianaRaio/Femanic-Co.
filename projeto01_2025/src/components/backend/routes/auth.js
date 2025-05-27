import express from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersFile = path.join(__dirname, '../data/users.json');

const readUsers = () => {
  if (!fs.existsSync(usersFile)) return [];
  const data = fs.readFileSync(usersFile);
  return JSON.parse(data);
};

const writeUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

// Endpoint hello world
router.get('/hello-world', (req, res) => {
  res.send('Hello World!');
});

router.post('/register', async (req, res) => {
  const { email, password, confirmPassword, cep, phone, notifications, terms } = req.body;

  if (!email || !password || !confirmPassword || !cep || !phone || !terms) {
    return res.status(400).json({ message: 'Preencha todos os campos obrigatórios' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'As senhas não coincidem' });
  }

  const users = readUsers();
  const existingUser = users.find(user => user.email === email);

  if (existingUser) {
    return res.status(409).json({ message: 'Usuário já cadastrado' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({ email, password: hashedPassword, cep, phone, notifications, terms });
  writeUsers(users);

  res.json({ message: 'Cadastro realizado com sucesso' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const users = readUsers();
  const user = users.find(user => user.email === email);

  if (!user) {
    return res.status(401).json({ message: 'Usuário não encontrado' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Senha incorreta' });
  }

  res.json({ message: 'Login bem-sucedido' });
});

export default router;
