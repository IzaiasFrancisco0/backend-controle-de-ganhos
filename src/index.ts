import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoute from './routes/authRoute';
import clientRoute from './routes/clientRoute';
import saleRoute from './routes/saleRoute';

dotenv.config();

const app = express();
app.use(cors({
  origin: 'https://controle-de-ganhos-pi.vercel.app/',
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

connectDB();

app.use('/api/auth', authRoute);
app.use('/api/clientes', clientRoute);
app.use('/api/vendas', saleRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});