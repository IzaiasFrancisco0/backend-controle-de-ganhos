import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { Sale, Client, User } from '../models';

const saleSchema = z.object({
  clienteId: z.string().length(24, "ID do cliente inválido"),
  quantidadeAreia: z.number().min(0).default(0),
  valorAreia: z.number().min(0).default(0),
  quantidadeBrita: z.number().min(0).default(0),
  valorBrita: z.number().min(0).default(0),
  valorTotal: z.number().positive("O valor total deve ser maior que zero"),
  pago: z.boolean().default(false),
  observacao: z.string().optional(),
});

export class saleController {

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const dados = saleSchema.parse(req.body);

      const clienteExiste = await Client.findById(dados.clienteId);
      if (!clienteExiste) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }

      const novaVenda = await Sale.create(dados);
      res.status(201).json({ message: 'Venda registrada com sucesso!', venda: novaVenda });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.issues.map(e => e.message) });
      } else {
        res.status(500).json({ error: 'Erro ao registrar venda' });
      }
    }
  }

  static async list(req: Request, res: Response): Promise<void> {
    try {
      const { dataInicio, dataFim } = req.query;
      let filtro: any = {};

      if (dataInicio && typeof dataInicio === 'string') {
        const inicio = new Date(`${dataInicio}T00:00:00.000Z`);
        const fim = dataFim ? new Date(`${dataFim as string}T23:59:59.999Z`) : new Date(`${dataInicio}T23:59:59.999Z`);
        
        filtro.dataVenda = { $gte: inicio, $lte: fim };
      }

      const vendas = await Sale.find(filtro)
        .populate('clienteId', 'nome telefone') 
        .sort({ dataVenda: -1 }); 

      res.json(vendas);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar vendas' });
    }
  }

  static async dashboard(req: Request, res: Response): Promise<void> {
    try {
      const { data } = req.query; 
      
      let dataAlvo = new Date();
      if (data && typeof data === 'string') {
        dataAlvo = new Date(`${data}T00:00:00.000Z`);
      }

      const inicioDoDia = new Date(dataAlvo.setUTCHours(0, 0, 0, 0));
      const fimDoDia = new Date(dataAlvo.setUTCHours(23, 59, 59, 999));

      const vendasDoDia = await Sale.find({
        dataVenda: { $gte: inicioDoDia, $lte: fimDoDia }
      });

      const totalGeral = vendasDoDia.reduce((acc, venda) => acc + venda.valorTotal, 0);
      const totalAreia = vendasDoDia.reduce((acc, venda) => acc + (venda.valorAreia || 0), 0);
      const totalBrita = vendasDoDia.reduce((acc, venda) => acc + (venda.valorBrita || 0), 0);
      
      const recebido = vendasDoDia.filter(v => v.pago).reduce((acc, venda) => acc + venda.valorTotal, 0);
      const pendente = vendasDoDia.filter(v => !v.pago).reduce((acc, venda) => acc + venda.valorTotal, 0);

      res.json({
        dataRef: inicioDoDia.toISOString().split('T')[0],
        resumo: {
          quantidadeDeVendas: vendasDoDia.length,
          totalGeral,
          totalAreia,
          totalBrita,
          recebido,
          pendente
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao gerar dashboard' });
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

      const venda = await Sale.findByIdAndDelete(id);

      if (!venda) {
        res.status(404).json({ error: 'Venda não encontrada' });
        return;
      }

      res.json({ message: 'Venda excluída com sucesso!' });

    } catch (error) {
      res.status(500).json({ error: 'Erro interno ao excluir venda' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { password, ...dados } = req.body;
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

      const vendaAtualizada = await Sale.findByIdAndUpdate(id, saleSchema.parse(dados), { new: true });

      if (!vendaAtualizada) {
        res.status(404).json({ error: 'Venda não encontrada' });
        return;
      }

      res.json({ message: 'Venda alterada com sucesso!', venda: vendaAtualizada });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.issues.map(e => e.message) });
      } else {
        res.status(500).json({ error: 'Erro interno ao alterar venda' });
      }
    }
  }
}
