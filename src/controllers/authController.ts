import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/index';

const authSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres")
});

export class authController {

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = authSchema.parse(req.body);

      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: '1d' 
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 
      });

      res.json({ message: 'Login realizado com sucesso' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.issues.map(e => e.message) });
      } else {
        res.status(500).json({ error: 'Erro interno no servidor' });
      }
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(200).json({ message: 'Logout realizado com sucesso' });
  }

  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = authSchema.parse(req.body);

      const userExists = await User.findOne({ email });
      if (userExists) {
        res.status(400).json({ error: 'E-mail já cadastrado' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({ email, password: hashedPassword });

      res.status(201).json({ message: 'Usuário criado com sucesso!' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.issues.map(e => e.message) });
      } else {
        res.status(500).json({ error: 'Erro interno no servidor' });
      }
    }
  }

  static async me(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        error: 'Usuário não autenticado'
      });
      return;
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      res.status(404).json({
        error: 'Usuário não encontrado'
      });
      return;
    }

    res.json({
      user
    });

  } catch (error) {
    res.status(500).json({
      error: 'Erro interno no servidor'
    });
  }
}
}

