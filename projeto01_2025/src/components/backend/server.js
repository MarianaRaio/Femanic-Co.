import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js'; // Aqui está o /hello-world

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/api', authRoutes); // Tudo que está em routes/auth.js ficará com prefixo /api

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
