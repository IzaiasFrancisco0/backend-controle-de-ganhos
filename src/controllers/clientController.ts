import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { Client, User } from '../models';

const clientSchema = z.object({
  nome: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
  telefone: z.string().min(8, "Telefone inválido"),
  endereco: z.string().min(5, "Endereço inválido"),
});

export class clientController {

  static async create(req: Request, res: Response): Promise<void> {
  try {
    const dadosValidados = clientSchema.parse(req.body);

    const novoCliente = await Client.create(dadosValidados);

    res.status(201).json({
      message: 'Cliente cadastrado com sucesso!',
      cliente: novoCliente
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        errors: error.issues.map(e => e.message)
      });
    } else {
      console.error('Erro ao cadastrar cliente:', error);

      res.status(500).json({
        error: 'Erro interno ao cadastrar cliente'
      });
    }
  }
}

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { password } = req.body;
      const userId = req.userId;

      if (!password) {
        res.status(400).json({ error: 'Senha obrigatória' });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Senha incorreta' });
        return;
      }

      const cliente = await Client.findByIdAndDelete(id);

      if (!cliente) {
        res.status(404).json({
          error: 'Cliente não encontrado'
        });
        return;
      }

      res.json({
        message: 'Cliente excluído com sucesso!'
      });

    } catch (error) {
      res.status(500).json({
        error: 'Erro interno ao excluir cliente'
      });
    }
  }

  static async list(req: Request, res: Response): Promise<void> {
    try {
      const clientes = await Client.find().sort({ nome: 1 }); 
      res.json(clientes);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { password, ...dadosValidados } = req.body;
      const userId = req.userId;

      if (!password) {
        res.status(400).json({ error: 'Senha obrigatória para alteração' });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Senha incorreta' });
        return;
      }

      const clienteAtualizado = await Client.findByIdAndUpdate(id, clientSchema.parse(dadosValidados), { new: true });

      if (!clienteAtualizado) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }

      res.json({
        message: 'Cliente alterado com sucesso!',
        cliente: clienteAtualizado
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.issues.map(e => e.message) });
      } else {
        res.status(500).json({ error: 'Erro interno ao alterar cliente' });
      }
    }
  }
}